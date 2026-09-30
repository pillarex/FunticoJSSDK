// T6 - the bundled declarations are real, strict-clean types for all three consumption styles.
//   - ESM consumer (.mts, nodenext) importing dist/funtico-sdk.mjs      -> dist/funtico-sdk.d.mts
//   - CJS consumer (.cts, nodenext) `import x = require(...)`           -> dist/funtico-sdk.d.ts
//   - script consumer (.ts, no imports) using the global FunticoSDK namespace via
//     /// <reference path="dist/funtico-sdk.d.ts" /> (`export as namespace FunticoSDK`)
// Each consumer carries `// @ts-expect-error` lines. tsc reports an UNUSED directive as an error,
// so a clean check proves every guarded line really fails; the second test goes further and
// strips the directives to show tsc then fails on exactly those lines and nowhere else.
//
// The script consumer is checked with module esnext + bundler resolution: under nodenext,
// TypeScript 6.0.3 treats every .ts file as a module and reports TS2686 for UMD-global use.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, TSC } from './helpers/paths.mjs';

const TYPES_DIR = path.join(ROOT, 'test/types');
const COMMON = ['--noEmit', '--strict', '--target', 'es2020', '--lib', 'es2020,dom', '--pretty', 'false'];
const MODULE_CONSUMERS = { flags: ['--module', 'nodenext', '--moduleResolution', 'nodenext'], files: ['consumer-esm.mts', 'consumer-esm-missing.mts', 'consumer-cjs.cts'] };
const SCRIPT_CONSUMERS = { flags: ['--module', 'esnext', '--moduleResolution', 'bundler'], files: ['consumer-script.ts'] };

function tsc(flags, files) {
  const res = spawnSync(process.execPath, [TSC, ...COMMON, ...flags, ...files.map(f => path.join(TYPES_DIR, f))], {
    cwd: ROOT, encoding: 'utf8',
  });
  return { status: res.status, output: `${res.stdout}${res.stderr}` };
}

/** "file(line,col): error TSxxxx" -> [{ file, line }] */
function errorLines(output) {
  return [...output.matchAll(/([^\s()]+)\((\d+),\d+\): error TS\d+/g)].map(m => ({ file: path.basename(m[1]), line: Number(m[2]) }));
}

test('T6 ESM (.mts) and CJS (.cts) consumers type-check under --strict (nodenext)', () => {
  const { status, output } = tsc(MODULE_CONSUMERS.flags, MODULE_CONSUMERS.files);
  assert.equal(status, 0, output);
});

test('T6 script consumer using the global FunticoSDK namespace type-checks under --strict', () => {
  const { status, output } = tsc(SCRIPT_CONSUMERS.flags, SCRIPT_CONSUMERS.files);
  assert.equal(status, 0, output);
});

test('T6 without the @ts-expect-error directives, tsc fails on exactly the guarded lines', () => {
  const stripped = [];
  const expected = [];
  try {
    for (const group of [MODULE_CONSUMERS, SCRIPT_CONSUMERS]) {
      const files = [];
      for (const file of group.files) {
        const lines = fs.readFileSync(path.join(TYPES_DIR, file), 'utf8').split(/\r?\n/);
        const copy = `__stripped__${file}`;
        let directives = 0;
        const out = lines.map((line, i) => {
          if (!/^\s*\/\/ @ts-expect-error/.test(line)) return line;
          directives++;
          expected.push({ file: copy, line: i + 2 }); // the guarded line (1-based) follows the directive
          return '// (directive removed)';
        });
        assert.ok(directives >= 2, `${file} should carry @ts-expect-error guards`);
        fs.writeFileSync(path.join(TYPES_DIR, copy), out.join('\n'));
        stripped.push(copy);
        files.push(copy);
      }
      const { status, output } = tsc(group.flags, files);
      assert.notEqual(status, 0, `stripped copies of ${group.files} should not type-check`);
      const got = errorLines(output);
      const key = e => `${e.file}:${e.line}`;
      const gotKeys = new Set(got.map(key));
      const want = expected.filter(e => files.includes(e.file));
      for (const e of want) assert.ok(gotKeys.has(key(e)), `no error on guarded line ${key(e)}\n${output}`);
      const wantKeys = new Set(want.map(key));
      const stray = got.filter(e => !wantKeys.has(key(e)));
      assert.deepEqual(stray, [], `errors outside the guarded lines:\n${output}`);
    }
  } finally {
    for (const f of stripped) fs.rmSync(path.join(TYPES_DIR, f), { force: true });
  }
});

test('T6 declarations: .d.ts = .d.mts + `export as namespace FunticoSDK;`, no Phaser, no internal wire types', () => {
  const dmts = fs.readFileSync(path.join(ROOT, 'dist/funtico-sdk.d.mts'), 'utf8');
  const dts = fs.readFileSync(path.join(ROOT, 'dist/funtico-sdk.d.ts'), 'utf8');
  assert.equal(dts, dmts.trimEnd() + '\nexport as namespace FunticoSDK;\n');
  assert.equal(/\bPhaser\b(?!\s*SDK)/.test(dmts.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), false, 'Phaser in declarations');
  assert.equal(/export (declare )?(interface|class|enum) Wire/.test(dmts), false, 'internal Wire* types exported');
  assert.match(dmts, /export declare class FunticoClient\b/);
});
