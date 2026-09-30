// T7 - the generator: dist is up to date, output is deterministic, the banner identifies the
// inputs, and an upstream layout change (plugin or phaser import gone, Phaser used elsewhere)
// fails loudly instead of producing a silently broken SDK.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { ROOT, BUILD_SCRIPT, DIST, SOURCE_TS, readSource, readClient } from './helpers/paths.mjs';
import { parse, ts } from './helpers/source-ast.mjs';

const OUTPUTS = ['funtico-sdk.mjs', 'funtico-sdk.js', 'funtico-sdk.d.mts', 'funtico-sdk.d.ts'];

/** Runs build.mjs; the env override is removed unless given, so the default source is used. */
function build(args, env = {}) {
  const cleanEnv = { ...process.env };
  delete cleanEnv.FUNTICO_PHASER_SDK_TS;
  const res = spawnSync(process.execPath, [BUILD_SCRIPT, ...args], {
    cwd: ROOT, encoding: 'utf8', env: { ...cleanEnv, ...env },
  });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr, output: `${res.stdout}\n${res.stderr}` };
}

function tempDir(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

const readOut = dir => Object.fromEntries(OUTPUTS.map(f => [f, fs.readFileSync(path.join(dir, f))]));

test('T7 `build.mjs --check` passes on the committed dist', { skip: process.env.FUNTICO_PHASER_SDK_TS ? 'FUNTICO_PHASER_SDK_TS is set' : false }, () => {
  const res = build(['--check']);
  assert.equal(res.status, 0, res.output);
  assert.match(res.stdout, /OK: 4 files .* up to date/);
});

test('T7 two builds are byte-identical to each other and to dist', (t) => {
  const a = tempDir(t, 'funtico-build-a-');
  const b = tempDir(t, 'funtico-build-b-');
  for (const dir of [a, b]) {
    const res = build(['--source', SOURCE_TS, '--out', dir]);
    assert.equal(res.status, 0, res.output);
  }
  const outA = readOut(a);
  const outB = readOut(b);
  const dist = readOut(DIST);
  for (const f of OUTPUTS) {
    assert.ok(outA[f].equals(outB[f]), `${f} differs between two builds`);
    assert.ok(outA[f].equals(dist[f]), `${f} differs from dist`);
  }
});

test('T7 every dist file carries the banner with version and input hashes, LF only, no timestamps', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const hash = text => crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 12);
  const coreHash = hash(readSource());
  const clientHash = hash(readClient());
  for (const f of OUTPUTS) {
    const text = fs.readFileSync(path.join(DIST, f), 'utf8');
    const head = text.slice(0, text.indexOf('*/') + 2);
    assert.match(head, new RegExp(`Funtico JS SDK v${pkg.version.replace(/\./g, '\\.')}`), f);
    assert.match(head, /GENERATED FILE - do not edit by hand\./, f);
    assert.ok(head.includes(`upstream/phaser/FunticoPhaserSDK.ts (sha256 ${coreHash})`), `${f}: core hash`);
    assert.ok(head.includes(`src/FunticoClient.ts (sha256 ${clientHash})`), `${f}: client hash`);
    assert.match(head, /Regenerate with: npm run build/, f);
    assert.equal(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(head), false, `${f}: timestamp in banner`);
    assert.equal(text.includes('\r'), false, `${f}: CR in output`);
  }
});

test('T7 --check reports stale and missing files and writes nothing', (t) => {
  const dir = tempDir(t, 'funtico-check-');
  for (const f of OUTPUTS) fs.copyFileSync(path.join(DIST, f), path.join(dir, f));
  fs.appendFileSync(path.join(dir, 'funtico-sdk.mjs'), '// hand edit\n');
  fs.rmSync(path.join(dir, 'funtico-sdk.d.ts'));
  const before = fs.readFileSync(path.join(dir, 'funtico-sdk.mjs'));

  const res = build(['--source', SOURCE_TS, '--check', '--out', dir]);
  assert.equal(res.status, 1, res.output);
  assert.match(res.stderr, /stale:\s+funtico-sdk\.mjs/);
  assert.match(res.stderr, /missing:\s+funtico-sdk\.d\.ts/);
  assert.doesNotMatch(res.stderr, /funtico-sdk\.js$/m, 'up-to-date funtico-sdk.js must not be listed');
  assert.doesNotMatch(res.stderr, /funtico-sdk\.d\.mts/, 'up-to-date funtico-sdk.d.mts must not be listed');
  assert.ok(fs.readFileSync(path.join(dir, 'funtico-sdk.mjs')).equals(before), '--check must not write');
  assert.equal(fs.existsSync(path.join(dir, 'funtico-sdk.d.ts')), false, '--check must not write');
});

// ---- upstream layout changes must fail the build -----------------------------------------------

/** Removes the first top-level statement matching `pred` (with its leading trivia/JSDoc). */
function removeStatement(text, pred) {
  const sf = parse(text);
  const st = sf.statements.find(pred);
  assert.ok(st, 'statement to remove not found in the source');
  return text.slice(0, st.getFullStart()) + text.slice(st.getEnd());
}

const isPhaserImport = s => ts.isImportDeclaration(s) && s.moduleSpecifier.text === 'phaser';
const isPluginClass = s => ts.isClassDeclaration(s) && s.name?.text === 'FunticoPhaserPlugin';

const MUTATIONS = [
  {
    what: 'plugin class removed',
    mutate: src => removeStatement(src, isPluginClass),
    message: /expected exactly 1 top-level class FunticoPhaserPlugin, found 0/,
  },
  {
    what: 'phaser import removed',
    mutate: src => removeStatement(src, isPhaserImport),
    message: /expected exactly 1 import from 'phaser', found 0/,
  },
  {
    what: 'second phaser import',
    mutate: src => `import * as PhaserAgain from 'phaser';\n${src}`,
    message: /expected exactly 1 import from 'phaser', found 2/,
  },
  {
    what: 'Phaser used outside the plugin',
    mutate: src => src.replace('export class FunticoSDK {', 'export type LeakedScene = Phaser.Scene;\n\nexport class FunticoSDK {'),
    message: /Identifier "Phaser" still referenced after stripping the plugin: .*FunticoPhaserSDK\.ts:\d+/,
  },
];

for (const { what, mutate, message } of MUTATIONS) {
  test(`T7 a mutated source fails the build with a clear message: ${what}`, (t) => {
    const dir = tempDir(t, 'funtico-mutated-');
    const source = path.join(dir, 'FunticoPhaserSDK.ts');
    const mutated = mutate(readSource());
    assert.notEqual(mutated, readSource(), 'mutation had no effect');
    fs.writeFileSync(source, mutated);
    const out = path.join(dir, 'out');

    const res = build(['--source', source, '--out', out]);
    assert.equal(res.status, 1, res.output);
    assert.match(res.stderr, /^build failed: /);
    assert.match(res.stderr, message);
    assert.equal(fs.existsSync(out), false, 'a failed build must write nothing');
  });
}

test('T7 FUNTICO_PHASER_SDK_TS selects the source too (and is validated the same way)', (t) => {
  const dir = tempDir(t, 'funtico-env-');
  const source = path.join(dir, 'FunticoPhaserSDK.ts');
  fs.writeFileSync(source, removeStatement(readSource(), isPluginClass));
  const res = build(['--out', path.join(dir, 'out')], { FUNTICO_PHASER_SDK_TS: source });
  assert.equal(res.status, 1, res.output);
  assert.match(res.stderr, /FunticoPhaserPlugin, found 0/);
});

// ---- comments next to the stripped statements survive ----------------------------------------

test('T7 stripping keeps a file header above the phaser import and a trailing comment before the plugin JSDoc', (t) => {
  const dir = tempDir(t, 'funtico-comments-');
  const source = path.join(dir, 'FunticoPhaserSDK.ts');
  const sf = parse(readSource());
  const plugin = sf.statements.find(isPluginClass);
  const prev = sf.statements[sf.statements.indexOf(plugin) - 1];
  const src = readSource();
  // Header before the import, and `} // TRAIL_MARKER` on the statement right before the plugin
  // JSDoc. (An own-line comment between them is kept by the generator too, but TS emit then drops
  // it: it leads FunticoClient.ts's first statement, an interface with no JS/.d.ts comment output.)
  const mutated = '// HDR_MARKER license header\n/** @file HDR_FILE_MARKER overview */\n' +
    src.slice(0, prev.getEnd()) + ' // TRAIL_MARKER' + src.slice(prev.getEnd());
  fs.writeFileSync(source, mutated);
  const out = path.join(dir, 'out');

  const res = build(['--source', source, '--out', out]);
  assert.equal(res.status, 0, res.output);
  const esm = fs.readFileSync(path.join(out, 'funtico-sdk.mjs'), 'utf8');
  for (const marker of ['HDR_MARKER', 'HDR_FILE_MARKER', 'TRAIL_MARKER']) {
    assert.ok(esm.includes(marker), `${marker} was dropped from the ESM build`);
  }
  // The plugin (and its own JSDoc) and the phaser import are still gone.
  assert.equal(esm.includes('FunticoPhaserPlugin extends'), false);
  assert.equal(/from ['"]phaser['"]/.test(esm), false);
  const pluginDoc = ts.getJSDocCommentsAndTags(plugin)[0];
  assert.ok(pluginDoc, 'the plugin has a JSDoc');
  const pluginDocText = src.slice(pluginDoc.pos, pluginDoc.end).split('\n').find(l => l.trim().length > 10 && !/^\s*\/?\*+\/?\s*$/.test(l));
  assert.equal(esm.includes(pluginDocText.trim()), false, 'the plugin JSDoc must be removed with the class');
});

// ---- type-only re-exports are accepted, value re-exports are not -----------------------------

test('T7 a local type-only re-export builds and adds nothing to the runtime exports', (t) => {
  const dir = tempDir(t, 'funtico-typeexport-');
  const source = path.join(dir, 'FunticoPhaserSDK.ts');
  fs.writeFileSync(source, readSource() +
    '\nexport type { FunticoConfig as FunticoConfigAlias };\nexport { type UserData as UserDataAlias };\n');
  const out = path.join(dir, 'out');
  const res = build(['--source', source, '--out', out]);
  assert.equal(res.status, 0, res.output);
  const umd = fs.readFileSync(path.join(out, 'funtico-sdk.js'), 'utf8');
  const dist = fs.readFileSync(path.join(DIST, 'funtico-sdk.js'), 'utf8');
  const exportsOf = text => text.slice(text.lastIndexOf('return {'));
  assert.equal(exportsOf(umd), exportsOf(dist), 'UMD export object must be unchanged');
  const dts = fs.readFileSync(path.join(out, 'funtico-sdk.d.ts'), 'utf8');
  assert.match(dts, /FunticoConfigAlias/);
  assert.match(dts, /UserDataAlias/);
});

test('T7 a value re-export is still rejected with a clear message', (t) => {
  const dir = tempDir(t, 'funtico-valueexport-');
  const source = path.join(dir, 'FunticoPhaserSDK.ts');
  fs.writeFileSync(source, readSource() + '\nexport { FunticoSDK as SDK };\n');
  const out = path.join(dir, 'out');
  const res = build(['--source', source, '--out', out]);
  assert.equal(res.status, 1, res.output);
  assert.match(res.stderr, /^build failed: .*`export \{ \.\.\. \}` \/ `export \* from` is not supported/);
  assert.equal(fs.existsSync(out), false, 'a failed build must write nothing');
});

// ---- input mistakes give a one-line message, not a stack trace -------------------------------

test('T7 wrong paths fail with "build failed:" instead of a stack trace', (t) => {
  const dir = tempDir(t, 'funtico-paths-');
  const aFile = path.join(dir, 'a-file');
  fs.writeFileSync(aFile, 'x');
  const outWithDirEntry = path.join(dir, 'out-dir-entry');
  fs.mkdirSync(path.join(outWithDirEntry, 'funtico-sdk.js'), { recursive: true });

  const cases = [
    { what: '--source is a directory', args: ['--source', dir, '--out', path.join(dir, 'o1')], message: /not a file/ },
    { what: '--out is a file', args: ['--source', SOURCE_TS, '--out', aFile], message: /--out must be a directory/ },
    { what: '--check meets a directory', args: ['--source', SOURCE_TS, '--check', '--out', outWithDirEntry], message: /missing: funtico-sdk\.js \(not a file\)/ },
    { what: 'write hits a directory', args: ['--source', SOURCE_TS, '--out', outWithDirEntry], message: /EISDIR|EPERM|EACCES/ },
  ];
  for (const { what, args, message } of cases) {
    const res = build(args);
    assert.equal(res.status, 1, `${what}: ${res.output}`);
    assert.match(res.stderr, message, what);
    assert.doesNotMatch(res.stderr, /\n\s+at /, `${what}: stack trace printed`);
    if (!args.includes('--check')) assert.match(res.stderr, /build failed: /, what);
  }
});
