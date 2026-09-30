// Shared paths and loaders for the test suites. Resolved exactly the way build/build.mjs resolves
// them (default source = the upstream/phaser submodule, FUNTICO_PHASER_SDK_TS overrides), so the tests always
// look at the same source the dist was generated from.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** The FunticoJSSDK folder. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const SOURCE_TS = path.resolve(
  process.env.FUNTICO_PHASER_SDK_TS || path.join(ROOT, 'upstream/phaser/FunticoPhaserSDK.ts'));
export const CLIENT_TS = path.join(ROOT, 'src/FunticoClient.ts');
export const BUILD_SCRIPT = path.join(ROOT, 'build/build.mjs');
export const DIST = path.join(ROOT, 'dist');
export const DIST_ESM = path.join(DIST, 'funtico-sdk.mjs');
export const DIST_UMD = path.join(DIST, 'funtico-sdk.js');
export const DIST_DTS = path.join(DIST, 'funtico-sdk.d.ts');
export const DIST_DMTS = path.join(DIST, 'funtico-sdk.d.mts');
export const TSC = path.join(ROOT, 'node_modules/typescript/bin/tsc');

/** require() anchored at the package root (resolves the pinned typescript from node_modules). */
export const requireFromRoot = createRequire(path.join(ROOT, 'package.json'));

let tsCache;
/** The TypeScript compiler API (the pinned 6.0.3 from devDependencies). */
export function loadTypeScript() {
  if (!tsCache) tsCache = requireFromRoot('typescript');
  return tsCache;
}

/** CRLF/CR -> LF (the generator normalises its inputs the same way). */
export function toLF(text) {
  return text.replace(/\r\n?/g, '\n');
}

export function readSource() {
  return toLF(fs.readFileSync(SOURCE_TS, 'utf8'));
}

export function readClient() {
  return toLF(fs.readFileSync(CLIENT_TS, 'utf8'));
}

/** The generated ES module build. */
export function importEsm() {
  return import(pathToFileURL(DIST_ESM).href);
}

/** The generated CommonJS/<script> build, loaded through require(). */
export function requireUmd() {
  return requireFromRoot(DIST_UMD);
}
