#!/usr/bin/env node
/**
 * `npm test` runner: runs every test/*.test.mjs suite with `node --test`.
 *
 * Why not `node --test "test/**\/*.test.mjs"` in package.json: glob patterns in `node --test` only
 * exist from Node 21, and neither cmd.exe (npm on Windows) nor a quoted pattern in sh expands them,
 * so on Node 20 - which package.json `engines` declares supported - the runner would look for a
 * file literally named `test/**\/*.test.mjs` and fail. Nor `node --test test/`: that also picks up
 * test/helpers/*.mjs and test/fixtures/*.mjs as test files. Listing the suites explicitly works
 * on every Node version >= 20 and every OS.
 *
 * This file lives in build/, not test/, so it can never collect itself.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_DIR = path.join(ROOT, 'test');

// The equivalence/build suites read the Phaser SDK source. Without the submodule they would fail with
// raw ENOENT stack traces, so say what to do instead (same message as build/build.mjs).
const source = process.env.FUNTICO_PHASER_SDK_TS || path.join(ROOT, 'upstream/phaser/FunticoPhaserSDK.ts');
if (!fs.existsSync(source)) {
  console.error(process.env.FUNTICO_PHASER_SDK_TS
    ? `Phaser SDK source not found: ${source}`
    : `Phaser SDK submodule is not checked out: ${source}\n  Run: git submodule update --init   (or clone with --recursive)`);
  process.exit(1);
}

const files = fs.readdirSync(TEST_DIR, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.test.mjs'))
  .map(entry => entry.name)
  .sort()
  .map(name => path.join(TEST_DIR, name));

if (files.length === 0) {
  console.error(`No *.test.mjs files found in ${TEST_DIR}`);
  process.exit(1);
}

// Extra CLI arguments (e.g. `npm test -- --test-name-pattern=T4`) go before the file list.
const result = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), ...files], { stdio: 'inherit' });
if (result.error) {
  console.error(`Could not start the test runner: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
