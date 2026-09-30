// The ORACLE: the ORIGINAL FunticoPhaserSDK.ts, Phaser plugin and all, compiled on its own.
//
// It shares no code with build/build.mjs - no AST stripping, no export transformer, no UMD
// wrapper. The untouched source goes through ts.transpileModule (a plain per-file TS->JS
// transpile) into a temp dir next to a stub 'phaser' package that provides the one thing the
// source needs from Phaser: Plugins.BasePlugin. Whatever the generator does to the code, the
// oracle is what the source means, so equal behaviour against it is the proof.
//
// Target ES2020 like the dist, so class-field semantics (useDefineForClassFields=false) match:
// static fields are assignments after the class, which keeps `FunticoSDK._instance` resettable.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadTypeScript, readSource } from './paths.mjs';

/** Minimal Phaser stub: BasePlugin keeps the plugin manager and exposes its game (as Phaser does). */
const PHASER_STUB = `
class BasePlugin {
  constructor(pluginManager) {
    this.pluginManager = pluginManager;
    this.game = pluginManager ? pluginManager.game : undefined;
  }
}
export default { Plugins: { BasePlugin } };
`;

let oraclePromise;

export function loadOracle() {
  if (!oraclePromise) oraclePromise = compileAndImport();
  return oraclePromise;
}

async function compileAndImport() {
  const ts = loadTypeScript();
  const out = ts.transpileModule(readSource(), {
    fileName: 'FunticoPhaserSDK.ts',
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      removeComments: true,
    },
  });
  if (out.diagnostics && out.diagnostics.length > 0) {
    const msgs = out.diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    throw new Error(`oracle transpile failed:\n${msgs.join('\n')}`);
  }
  if (!/from ['"]phaser['"]/.test(out.outputText)) {
    throw new Error('oracle: expected the untouched source to import phaser');
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'funtico-oracle-'));
  process.on('exit', () => {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  });
  const phaserDir = path.join(dir, 'node_modules', 'phaser');
  fs.mkdirSync(phaserDir, { recursive: true });
  fs.writeFileSync(path.join(phaserDir, 'package.json'),
    JSON.stringify({ name: 'phaser', version: '0.0.0-stub', type: 'module', exports: './index.js' }));
  fs.writeFileSync(path.join(phaserDir, 'index.js'), PHASER_STUB);

  const file = path.join(dir, 'FunticoPhaserSDK.oracle.mjs');
  fs.writeFileSync(file, out.outputText);
  return import(pathToFileURL(file).href);
}
