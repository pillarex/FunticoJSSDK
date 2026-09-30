#!/usr/bin/env node
/**
 * Funtico JS SDK generator.
 *
 * The JS SDK is NOT a hand-maintained copy: it is generated from the Phaser SDK source
 * (upstream/phaser/FunticoPhaserSDK.ts - a git submodule of pillarex/funtico-sdk-phaser, pinned to the
 * commit this dist is generated from), which stays the single source of truth. Any SDK change is made
 * once in the Phaser SDK repo; here you move the submodule to that commit and run `npm run build`.
 *
 * Pipeline:
 *   1. Read FunticoPhaserSDK.ts and src/FunticoClient.ts (line endings normalised to LF).
 *   2. Strip Phaser from the core BY AST (not regex): the `import ... from 'phaser'` declaration and
 *      the FunticoPhaserPlugin class (with its JSDoc). Each must exist exactly once; afterwards no
 *      identifier named `Phaser` may remain in code.
 *   3. Append src/FunticoClient.ts with all of its import declarations removed (they exist only for
 *      editor support; in the combined program everything shares one scope).
 *   4. Type-check the combined in-memory program with strict settings. Any diagnostic fails.
 *   5. Emit:
 *        dist/funtico-sdk.mjs   ES module, comments (JSDoc) preserved
 *        dist/funtico-sdk.js    same code, `export` removed by a TS transformer, wrapped as a
 *                               CommonJS / <script> global (`FunticoSDK`) factory - no AMD
 *        dist/funtico-sdk.d.mts declarations as emitted
 *        dist/funtico-sdk.d.ts  same + `export as namespace FunticoSDK;` (types the script global)
 *   6. Prefix every file with a banner (version + source hashes). The output is a pure,
 *      deterministic function of the inputs - no timestamps, no git SHAs - so `--check` is stable.
 *
 * Usage:
 *   node build/build.mjs                    build into dist/
 *   node build/build.mjs --check            build in memory, compare with dist/, exit 1 if stale
 *   node build/build.mjs --source <file.ts> use another core source (or env FUNTICO_PHASER_SDK_TS)
 *   node build/build.mjs --out <dir>        write to / check against another directory
 *
 * TypeScript version: pinned EXACTLY to 6.0.3 in package.json. typescript@latest is 7.x, the
 * native Go port, which ships NO JavaScript compiler API (its package has no "main"); this
 * generator needs ts.createProgram / ts.transform / ts.createSourceFile, so 6.0.3 - the last
 * JS-based line - is required. The exact pin also keeps the emitted text byte-stable for --check.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

/** The FunticoJSSDK folder (parent of build/). */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The Phaser SDK source: a git submodule pinned to the commit dist/ is generated from. */
const DEFAULT_SOURCE = path.join(ROOT, 'upstream/phaser/FunticoPhaserSDK.ts');
const CLIENT_SOURCE = path.join(ROOT, 'src/FunticoClient.ts');
const DEFAULT_OUT = path.join(ROOT, 'dist');

/**
 * Labels used in the banner (fixed strings, so the output never depends on absolute paths). Error
 * messages and diagnostics name the file actually read (see displayPath), which differs with --source.
 */
const CORE_LABEL = 'upstream/phaser/FunticoPhaserSDK.ts';
const CLIENT_LABEL = 'src/FunticoClient.ts';

/** What gets stripped from the core. */
const PHASER_MODULE = 'phaser';
const PHASER_PLUGIN_CLASS = 'FunticoPhaserPlugin';
const PHASER_IDENTIFIER = 'Phaser';

/** Name of the global the <script> build defines (also used for `export as namespace`). */
const GLOBAL_NAME = 'FunticoSDK';

const OUTPUT_FILES = {
  esm: 'funtico-sdk.mjs',
  umd: 'funtico-sdk.js',
  dmts: 'funtico-sdk.d.mts',
  dts: 'funtico-sdk.d.ts',
};

// ---------------------------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------------------------

class BuildError extends Error {}

function fail(message) {
  throw new BuildError(message);
}

/** CRLF/CR -> LF. Applied to inputs, so hashes and output do not depend on git's autocrlf. */
function toLF(text) {
  return text.replace(/\r\n?/g, '\n');
}

function sha256Short(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 12);
}

/** Path for messages: relative to the repo root when inside it (the default submodule source), else absolute. */
function displayPath(file) {
  const rel = path.relative(ROOT, file);
  return (rel.startsWith('..') || path.isAbsolute(rel) ? file : rel).replace(/\\/g, '/');
}

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`.padStart(9);
}

function parseArgs(argv) {
  const args = {
    source: process.env.FUNTICO_PHASER_SDK_TS || DEFAULT_SOURCE,
    out: DEFAULT_OUT,
    check: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) fail(`${arg} needs a value`);
      return v;
    };
    if (arg === '--check') args.check = true;
    else if (arg === '--source') args.source = value();
    else if (arg === '--out') args.out = value();
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node build/build.mjs [--check] [--source <FunticoPhaserSDK.ts>] [--out <dir>]');
      process.exit(0);
    } else fail(`Unknown argument: ${arg}`);
  }
  args.source = path.resolve(args.source);
  args.out = path.resolve(args.out);
  return args;
}

/**
 * Loads the TypeScript compiler API and makes sure it is the pinned version: a different
 * compiler may emit different text (making --check fail), and 7.x has no JS API at all.
 */
function loadTypeScript(pinnedVersion) {
  let ts;
  try {
    ts = require('typescript');
  } catch (err) {
    fail(`Cannot load the TypeScript compiler API (${err.message}). Run "npm install" in ${ROOT}.`);
  }
  if (!ts || typeof ts.createProgram !== 'function' || typeof ts.transform !== 'function') {
    fail('The installed "typescript" package has no JavaScript compiler API (7.x is the native Go port). ' +
      `Install the pinned version: npm install --save-exact --save-dev typescript@${pinnedVersion}`);
  }
  if (ts.version !== pinnedVersion) {
    fail(`typescript ${ts.version} is installed but package.json pins ${pinnedVersion}. Run "npm install".`);
  }
  return ts;
}

// ---------------------------------------------------------------------------------------------
// Source assembly (text slicing driven by AST positions, with a line map for diagnostics)
// ---------------------------------------------------------------------------------------------

/**
 * Concatenates kept slices of the input files into one program text and remembers where every
 * slice came from, so diagnostics can point at the ORIGINAL file and line.
 */
class CombinedSource {
  constructor() {
    this.text = '';
    /** @type {{ combinedLine: number, label: string, originLine: number }[]} */
    this.segments = [];
  }

  /** Appends `original` minus the given [start, end) ranges. */
  append(label, original, removeRanges) {
    const ranges = [...removeRanges].sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    const keep = [];
    for (const [start, end] of ranges) {
      if (start > cursor) keep.push([cursor, start]);
      cursor = Math.max(cursor, end);
    }
    if (cursor < original.length) keep.push([cursor, original.length]);

    for (const [start, end] of keep) {
      this.segments.push({
        combinedLine: countLines(this.text),
        label,
        originLine: countLines(original.slice(0, start)),
      });
      this.text += original.slice(start, end);
    }
  }

  /** Appends generated text (a separator); diagnostics inside it are reported as "<generated>". */
  appendGenerated(text) {
    this.segments.push({ combinedLine: countLines(this.text), label: '<generated>', originLine: 0 });
    this.text += text;
  }

  /** 0-based combined line -> "file:line" (1-based) in the original input. */
  locate(combinedLine) {
    let seg = this.segments[0];
    for (const s of this.segments) {
      if (s.combinedLine <= combinedLine) seg = s;
      else break;
    }
    return `${seg.label}:${seg.originLine + (combinedLine - seg.combinedLine) + 1}`;
  }
}

function countLines(text) {
  let n = 0;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function hasModifier(ts, node, kind) {
  return !!(ts.canHaveModifiers(node) && ts.getModifiers(node)?.some(m => m.kind === kind));
}

/**
 * Finds the Phaser-specific parts of the core. Returns the [start, end) ranges to remove.
 * Each part must be found exactly once: anything else means the upstream layout changed and a
 * human has to look at it, rather than the generator guessing.
 *
 * Only the statements themselves go, not their whole leading trivia (`getFullStart()` would also
 * swallow neighbouring comments):
 *   - the import starts at its first token, so a file header / license / `@file` block above it is
 *     kept (it then leads the next statement);
 *   - the plugin class starts at its first JSDoc block (`getStart(sf, true)`), so that JSDoc goes
 *     with the class, while a trailing `// ...` on the previous line or an unrelated comment above
 *     the JSDoc is kept.
 */
function findPhaserRanges(ts, sf, displayName) {
  const phaserImports = sf.statements.filter(s =>
    ts.isImportDeclaration(s) &&
    ts.isStringLiteral(s.moduleSpecifier) &&
    s.moduleSpecifier.text === PHASER_MODULE);

  const pluginClasses = sf.statements.filter(s =>
    ts.isClassDeclaration(s) && s.name?.text === PHASER_PLUGIN_CLASS);

  if (phaserImports.length !== 1) {
    fail(`${displayName}: expected exactly 1 import from '${PHASER_MODULE}', found ${phaserImports.length}. ` +
      'The Phaser SDK layout changed - review build/build.mjs before regenerating.');
  }
  if (pluginClasses.length !== 1) {
    fail(`${displayName}: expected exactly 1 top-level class ${PHASER_PLUGIN_CLASS}, found ${pluginClasses.length}. ` +
      'The Phaser SDK layout changed - review build/build.mjs before regenerating.');
  }
  const [phaserImport, pluginClass] = [phaserImports[0], pluginClasses[0]];
  return [
    [phaserImport.getStart(sf), phaserImport.getEnd()],
    [pluginClass.getStart(sf, /* includeJsDocComment */ true), pluginClass.getEnd()],
  ];
}

/**
 * Every import declaration of src/FunticoClient.ts (editor-only; everything is one scope when
 * combined). Unlike findPhaserRanges this deliberately removes the leading trivia too: the only
 * comment above those imports is the file's own note explaining that they are stripped, which
 * would be wrong in dist. The class JSDoc follows the imports and is therefore kept.
 */
function findImportRanges(ts, sf) {
  return sf.statements
    .filter(s => ts.isImportDeclaration(s) || ts.isImportEqualsDeclaration(s))
    .map(n => [n.getFullStart(), n.getEnd()]);
}

/** Fails if any identifier `Phaser` survives in code. JSDoc/comments/strings are not visited. */
function assertNoPhaserIdentifier(ts, sf, combined) {
  const hits = [];
  const visit = node => {
    if (ts.isIdentifier(node) && node.text === PHASER_IDENTIFIER) {
      hits.push(combined.locate(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (hits.length > 0) {
    fail(`Identifier "${PHASER_IDENTIFIER}" still referenced after stripping the plugin: ${hits.join(', ')}. ` +
      'The framework-agnostic core must not use Phaser outside FunticoPhaserPlugin.');
  }
}

// ---------------------------------------------------------------------------------------------
// Export analysis
// ---------------------------------------------------------------------------------------------

/**
 * Names of every exported RUNTIME value (classes, enums, functions, variables), in source order.
 * Type-only exports (interface, type alias, declare, const enum) are excluded. This list becomes
 * the object the UMD factory returns, so it is derived from the AST, never hardcoded.
 */
function collectRuntimeExports(ts, sf, combined) {
  const names = [];
  const where = node => combined.locate(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line);
  const unsupported = (node, what) =>
    fail(`${where(node)}: ${what} is not supported by the JS SDK generator (the UMD export list is derived from ` +
      'export modifiers on top-level declarations). Extend collectRuntimeExports in build/build.mjs.');

  for (const st of sf.statements) {
    if (ts.isExportDeclaration(st)) {
      // A local type-only re-export (`export type { A as B }`, `export { type A }`) has no runtime
      // value, so it adds nothing to the UMD object; TS elides it from the JS, keeps it in the
      // .d.ts, and dropEmptyExports removes the empty `export {}` it may leave in the script build.
      // Value re-exports and anything with a module specifier (`... from '...'`) stay unsupported.
      const typeOnly = !st.moduleSpecifier && (st.isTypeOnly ||
        (!!st.exportClause && ts.isNamedExports(st.exportClause) &&
          st.exportClause.elements.length > 0 && st.exportClause.elements.every(e => e.isTypeOnly)));
      if (typeOnly) continue;
      unsupported(st, '`export { ... }` / `export * from`');
    }
    if (ts.isExportAssignment(st)) unsupported(st, '`export default` / `export =`');
    if (!hasModifier(ts, st, ts.SyntaxKind.ExportKeyword)) continue;
    if (hasModifier(ts, st, ts.SyntaxKind.DeclareKeyword)) continue; // ambient: no runtime value
    if (hasModifier(ts, st, ts.SyntaxKind.DefaultKeyword)) unsupported(st, '`export default`');

    if (ts.isClassDeclaration(st) || ts.isFunctionDeclaration(st)) {
      if (!st.name) unsupported(st, 'an anonymous exported declaration');
      if (ts.isFunctionDeclaration(st) && !st.body) continue; // overload signature
      names.push(st.name.text);
    } else if (ts.isEnumDeclaration(st)) {
      if (hasModifier(ts, st, ts.SyntaxKind.ConstKeyword)) continue; // const enum: inlined, no object
      names.push(st.name.text);
    } else if (ts.isVariableStatement(st)) {
      for (const decl of st.declarationList.declarations) collectBindingNames(ts, decl.name, names);
    } else if (ts.isModuleDeclaration(st)) {
      unsupported(st, 'an exported namespace');
    }
    // InterfaceDeclaration / TypeAliasDeclaration: type-only, nothing at runtime.
  }

  const seen = new Set();
  for (const n of names) {
    if (seen.has(n)) fail(`Runtime export "${n}" is declared twice (enum/namespace merging is not supported).`);
    seen.add(n);
  }
  return names;
}

function collectBindingNames(ts, name, out) {
  if (ts.isIdentifier(name)) out.push(name.text);
  else for (const el of name.elements) if (!ts.isOmittedExpression(el)) collectBindingNames(ts, el.name, out);
}

// ---------------------------------------------------------------------------------------------
// Transformers for the UMD / <script> build
// ---------------------------------------------------------------------------------------------

/** "before" transformer: removes `export` from every top-level declaration (TS strips types afterwards). */
function stripExportModifiers(ts) {
  return context => sf => {
    const f = context.factory;
    const statements = sf.statements.map(st => {
      if (!hasModifier(ts, st, ts.SyntaxKind.ExportKeyword)) return st;
      const modifiers = ts.getModifiers(st).filter(m => m.kind !== ts.SyntaxKind.ExportKeyword);
      const mods = modifiers.length ? modifiers : undefined;
      if (ts.isClassDeclaration(st)) return f.updateClassDeclaration(st, mods, st.name, st.typeParameters, st.heritageClauses, st.members);
      if (ts.isFunctionDeclaration(st)) return f.updateFunctionDeclaration(st, mods, st.asteriskToken, st.name, st.typeParameters, st.parameters, st.type, st.body);
      if (ts.isEnumDeclaration(st)) return f.updateEnumDeclaration(st, mods, st.name, st.members);
      if (ts.isVariableStatement(st)) return f.updateVariableStatement(st, mods, st.declarationList);
      if (ts.isInterfaceDeclaration(st)) return f.updateInterfaceDeclaration(st, mods, st.name, st.typeParameters, st.heritageClauses, st.members);
      if (ts.isTypeAliasDeclaration(st)) return f.updateTypeAliasDeclaration(st, mods, st.name, st.typeParameters, st.type);
      if (ts.isModuleDeclaration(st)) return f.updateModuleDeclaration(st, mods, st.name, st.body);
      fail(`Cannot strip "export" from a ${ts.SyntaxKind[st.kind]} (update stripExportModifiers in build/build.mjs).`);
    });
    return f.updateSourceFile(sf, statements);
  };
}

/**
 * "after" transformer: the ES-module transform appends `export {};` to a file that was a module
 * but no longer exports anything. The script build must contain no module syntax, so drop it.
 */
function dropEmptyExports(ts) {
  return context => sf => context.factory.updateSourceFile(sf, sf.statements.filter(st =>
    !(ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause &&
      ts.isNamedExports(st.exportClause) && st.exportClause.elements.length === 0)));
}

/** Top-level module syntax left in emitted JS (used to verify the UMD body and to cross-check the ESM exports). */
function scanModuleSyntax(ts, jsText) {
  const sf = ts.createSourceFile('emitted.js', jsText, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
  const exported = [];
  const moduleStatements = [];
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st) || ts.isExportAssignment(st)) {
      moduleStatements.push(ts.SyntaxKind[st.kind]);
    } else if (hasModifier(ts, st, ts.SyntaxKind.ExportKeyword)) {
      moduleStatements.push(`export ${ts.SyntaxKind[st.kind]}`);
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) collectBindingNames(ts, d.name, exported);
      } else if (st.name) {
        exported.push(st.name.text);
      }
    }
  }
  return { exported, moduleStatements };
}

// ---------------------------------------------------------------------------------------------
// Compilation
// ---------------------------------------------------------------------------------------------

/**
 * Compiler settings. `strict: true` (the full family: noImplicitAny, strictNullChecks,
 * strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis,
 * useUnknownInCatchVariables, alwaysStrict, ...) plus every extra CORRECTNESS check the unmodified
 * core passes (probed against TS 6.0.3).
 *
 * Deliberately NOT enabled - the core must never be edited just to please this build:
 *   - noUnusedLocals, noUncheckedIndexedAccess, exactOptionalPropertyTypes: the core has
 *     pre-existing errors under them.
 *   - noUnusedParameters, noPropertyAccessFromIndexSignature: the core passes today, but they are
 *     style rules, and enabling them would make the JS build reject harmless changes that the
 *     Phaser build accepts.
 */
function compilerOptions(ts) {
  return {
    strict: true,
    noImplicitReturns: true,
    noImplicitOverride: true,
    noFallthroughCasesInSwitch: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,

    target: ts.ScriptTarget.ES2020,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
    module: ts.ModuleKind.ES2020,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: [], // never pick up ambient @types from node_modules (Node globals must not leak in)

    declaration: true,
    removeComments: false, // the JSDoc is the inline documentation
    newLine: ts.NewLineKind.LineFeed,
    sourceMap: false,
    noEmitOnError: true,
    skipLibCheck: true,
  };
}

/**
 * Builds the in-memory program, type-checks it and emits the three artefacts (ESM JS, UMD body,
 * declarations). Returns their raw text (no banner yet) and the runtime export list.
 */
function compile(ts, combined) {
  const options = compilerOptions(ts);
  const virtualFile = path.join(ROOT, '__funtico-sdk__.ts').replace(/\\/g, '/');
  const sourceFile = ts.createSourceFile(virtualFile, combined.text, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TS);

  assertNoPhaserIdentifier(ts, sourceFile, combined);

  const host = ts.createCompilerHost(options, true);
  const baseGetSourceFile = host.getSourceFile.bind(host);
  const isVirtual = f => f.replace(/\\/g, '/') === virtualFile;
  host.getSourceFile = (fileName, ...rest) => isVirtual(fileName) ? sourceFile : baseGetSourceFile(fileName, ...rest);
  host.fileExists = (f => fileName => isVirtual(fileName) || f(fileName))(host.fileExists.bind(host));
  host.readFile = (f => fileName => isVirtual(fileName) ? combined.text : f(fileName))(host.readFile.bind(host));

  const program = ts.createProgram({ rootNames: [virtualFile], options, host });

  const diagnostics = [
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(sourceFile),
    ...program.getSemanticDiagnostics(sourceFile),
    ...program.getDeclarationDiagnostics(sourceFile),
  ];
  if (diagnostics.length > 0) {
    fail(`Type-check failed (${diagnostics.length} diagnostic(s)):\n` +
      diagnostics.map(d => '  ' + formatDiagnostic(ts, d, combined)).join('\n'));
  }

  const runtimeExports = collectRuntimeExports(ts, sourceFile, combined);

  // Pass 1: ES module + declarations.
  const esm = emit(ts, program, sourceFile, {}, true);
  // Pass 2: the same program without `export`, for the CommonJS / <script> factory.
  const umd = emit(ts, program, sourceFile, { before: [stripExportModifiers(ts)], after: [dropEmptyExports(ts)] }, false);

  // Cross-checks on the emitted text, so a TS emit quirk can never silently desync the builds.
  const esmScan = scanModuleSyntax(ts, esm.js);
  const missing = runtimeExports.filter(n => !esmScan.exported.includes(n));
  const extra = esmScan.exported.filter(n => !runtimeExports.includes(n));
  if (missing.length || extra.length) {
    fail(`ESM exports do not match the source AST (missing: [${missing}], unexpected: [${extra}]).`);
  }
  const umdScan = scanModuleSyntax(ts, umd.js);
  if (umdScan.moduleStatements.length > 0) {
    fail(`Module syntax left in the script build: ${umdScan.moduleStatements.join(', ')}.`);
  }

  return { esmJs: esm.js, umdBody: umd.js, dts: esm.dts, runtimeExports };
}

function emit(ts, program, sourceFile, transformers, withDeclarations) {
  const out = { js: undefined, dts: undefined };
  const result = program.emit(sourceFile, (fileName, text) => {
    if (fileName.endsWith('.d.ts')) out.dts = text;
    else if (fileName.endsWith('.js')) out.js = text;
  }, undefined, false, transformers);
  if (result.emitSkipped || result.diagnostics.length > 0) {
    fail('Emit failed:\n' + result.diagnostics.map(d => '  ' + formatDiagnostic(ts, d)).join('\n'));
  }
  if (out.js === undefined || (withDeclarations && out.dts === undefined)) fail('Emit produced no output.');
  return out;
}

function formatDiagnostic(ts, d, combined) {
  const message = ts.flattenDiagnosticMessageText(d.messageText, '\n    ');
  if (!d.file || d.start === undefined) return `TS${d.code}: ${message}`;
  const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
  const where = combined && d.file.fileName.endsWith('__funtico-sdk__.ts')
    ? combined.locate(line)
    : `${d.file.fileName}:${line + 1}`;
  return `${where}:${character + 1} TS${d.code}: ${message}`;
}

// ---------------------------------------------------------------------------------------------
// Output assembly
// ---------------------------------------------------------------------------------------------

function banner({ version, coreHash, clientHash }) {
  return [
    '/*!',
    ` * Funtico JS SDK v${version}`,
    ' *',
    ' * GENERATED FILE - do not edit by hand.',
    ` * Source: ${CORE_LABEL} (sha256 ${coreHash}) + ${CLIENT_LABEL} (sha256 ${clientHash}).`,
    ' * Regenerate with: npm run build',
    ' */',
    '',
  ].join('\n');
}

/**
 * CommonJS / <script> factory. Deliberately not AMD. The code is inserted verbatim (not
 * re-indented: re-indenting would change multi-line template literals).
 */
function wrapUmd(body, runtimeExports) {
  return [
    '(function (root, factory) {',
    "  if (typeof module === 'object' && module && typeof module.exports === 'object') {",
    '    module.exports = factory();',
    '  } else {',
    `    root.${GLOBAL_NAME} = factory();`,
    '  }',
    "})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {",
    "'use strict';",
    '',
    body.trimEnd(),
    '',
    'return {',
    runtimeExports.map(n => `  ${n}: ${n}`).join(',\n'),
    '};',
    '});',
    '',
  ].join('\n');
}

function assembleOutputs(compiled, meta) {
  const head = banner(meta);
  const files = {
    [OUTPUT_FILES.esm]: head + compiled.esmJs,
    [OUTPUT_FILES.umd]: head + wrapUmd(compiled.umdBody, compiled.runtimeExports),
    [OUTPUT_FILES.dmts]: head + compiled.dts,
    [OUTPUT_FILES.dts]: head + compiled.dts.trimEnd() + `\nexport as namespace ${GLOBAL_NAME};\n`,
  };
  for (const name of Object.keys(files)) {
    files[name] = toLF(files[name]);
    if (!files[name].endsWith('\n')) files[name] += '\n';
  }
  return files;
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------

function build(args) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const pinned = pkg.devDependencies?.typescript;
  if (!pinned || !/^\d+\.\d+\.\d+$/.test(pinned)) {
    fail(`package.json must pin devDependencies.typescript to an exact version (found "${pinned}").`);
  }
  const ts = loadTypeScript(pinned);

  const sourceStat = fs.statSync(args.source, { throwIfNoEntry: false });
  if (!sourceStat) {
    fail(args.source === DEFAULT_SOURCE
      ? `Phaser SDK submodule is not checked out: ${args.source}\n  Run: git submodule update --init   (or clone with --recursive)`
      : `Phaser SDK source not found: ${args.source}\n  Pass --source <path> or set FUNTICO_PHASER_SDK_TS.`);
  }
  if (!sourceStat.isFile()) {
    fail(`Phaser SDK source is not a file: ${args.source}\n  Pass the path of FunticoPhaserSDK.ts itself, not its folder.`);
  }
  const coreText = toLF(fs.readFileSync(args.source, 'utf8'));
  const clientText = toLF(fs.readFileSync(CLIENT_SOURCE, 'utf8'));

  const coreName = displayPath(args.source);
  const coreSf = ts.createSourceFile(coreName, coreText, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TS);
  const clientSf = ts.createSourceFile(CLIENT_LABEL, clientText, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TS);

  const combined = new CombinedSource();
  combined.append(coreName, coreText, findPhaserRanges(ts, coreSf, coreName));
  combined.appendGenerated('\n\n');
  combined.append(CLIENT_LABEL, clientText, findImportRanges(ts, clientSf));

  const compiled = compile(ts, combined);
  const files = assembleOutputs(compiled, {
    version: pkg.version,
    coreHash: sha256Short(coreText),
    clientHash: sha256Short(clientText),
  });
  return { files, compiled };
}

function checkOutputs(files, outDir) {
  const problems = [];
  for (const [name, expected] of Object.entries(files)) {
    const file = path.join(outDir, name);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat) {
      problems.push(`missing: ${name}`);
    } else if (!stat.isFile()) {
      problems.push(`missing: ${name} (not a file)`);
    } else if (!fs.readFileSync(file).equals(Buffer.from(expected, 'utf8'))) {
      problems.push(`stale:   ${name}`);
    }
  }
  return problems;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { files, compiled } = build(args);

  if (args.check) {
    const problems = checkOutputs(files, args.out);
    if (problems.length > 0) {
      console.error(`dist is out of date (${args.out}):`);
      for (const p of problems) console.error('  ' + p);
      console.error('Run "npm run build" and commit the result.');
      process.exit(1);
    }
    console.log(`OK: ${Object.keys(files).length} files in ${args.out} are up to date.`);
    return;
  }

  const outStat = fs.statSync(args.out, { throwIfNoEntry: false });
  if (outStat && !outStat.isDirectory()) fail(`--out must be a directory, but ${args.out} is a file.`);
  fs.mkdirSync(args.out, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(args.out, name), content, 'utf8');
  }

  console.log(`Funtico JS SDK built from ${args.source}`);
  console.log(`  ${compiled.runtimeExports.length} runtime exports: ${compiled.runtimeExports.join(', ')}`);
  for (const [name, content] of Object.entries(files)) {
    console.log(`  ${formatSize(Buffer.byteLength(content, 'utf8'))}  ${path.join(args.out, name)}`);
  }
}

try {
  main();
} catch (err) {
  // BuildError: our own checks. A Node fs/system error (it carries `code` and `syscall`, e.g.
  // EISDIR, EACCES, ENOSPC while writing dist) is an environment problem, not a generator bug, so
  // it gets the same one-line message instead of a stack trace. Anything else is a bug: rethrow.
  if (err instanceof BuildError || (err && typeof err.code === 'string' && typeof err.syscall === 'string')) {
    console.error(`build failed: ${err.message}`);
    process.exit(1);
  }
  throw err;
}
