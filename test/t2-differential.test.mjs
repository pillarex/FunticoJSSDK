// T2 - differential equivalence: the generated JS behaves exactly like the TypeScript source.
//
// ORACLE = the ORIGINAL FunticoPhaserSDK.ts compiled independently (test/helpers/oracle.mjs:
// ts.transpileModule + a stub 'phaser'; no code shared with build/build.mjs). Every scenario in
// test/fixtures/scenarios.mjs runs against the oracle, dist/funtico-sdk.mjs and
// dist/funtico-sdk.js (require) with the same recording fetch mock, the same deterministic
// crypto.randomUUID/getRandomValues sequence and the same frozen clock. The request logs
// (method, URL, headers, body) and the traces (every result or normalised error) must be equal.
//
// Two guards keep this honest:
//   - COVERAGE: every non-private method/accessor of every exported SDK class, read from the
//     source AST, must have been invoked by a scenario (runtime-recorded, not declared).
//   - MUTANTS: small behavioural edits to the ESM dist must each be caught by some scenario,
//     proving the comparison is not vacuous.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadImpls, runScenario } from './helpers/harness.mjs';
import { DIST_ESM } from './helpers/paths.mjs';
import { sourceFile, publicMembers, exportedClassesWithMembers } from './helpers/source-ast.mjs';
import { SCENARIOS } from './fixtures/scenarios.mjs';
import { defaultRoutes } from './fixtures/wire.mjs';

const impls = await loadImpls();
const byName = Object.fromEntries(impls.map(i => [i.name, i]));
const coverage = new Set();
let scenariosRun = 0;

function routesFor(scenario) {
  return { ...defaultRoutes(), ...(scenario.routes || {}) };
}

test('T2 oracle is the untouched source (it still carries the Phaser plugin) and independent of dist', () => {
  assert.equal(typeof byName.oracle.mod.FunticoPhaserPlugin, 'function');
  assert.equal(byName.esm.mod.FunticoPhaserPlugin, undefined);
  assert.notEqual(byName.oracle.mod.FunticoSDK, byName.esm.mod.FunticoSDK);
  assert.notEqual(byName.esm.mod.FunticoSDK, byName.umd.mod.FunticoSDK);
});

for (const scenario of SCENARIOS) {
  test(`T2 ${scenario.name}`, async () => {
    const out = {};
    for (const impl of impls) {
      out[impl.name] = await runScenario(impl, scenario.run, {
        routes: routesFor(scenario),
        coverage: impl.name === 'esm' ? coverage : undefined,
      });
    }
    assert.ok(out.oracle.trace.length > 0, 'scenario recorded nothing');
    for (const name of ['esm', 'umd']) {
      assert.deepStrictEqual(out[name].requests, out.oracle.requests, `${name}: request log differs from the oracle`);
      assert.deepStrictEqual(out[name].trace, out.oracle.trace, `${name}: results/errors differ from the oracle`);
    }
    scenariosRun++;
  });
}

test('T2 coverage guard: every public SDK member (from the source AST) is exercised by a scenario', (t) => {
  if (scenariosRun !== SCENARIOS.length) {
    t.skip('not all scenarios ran (filtered run) - coverage cannot be judged');
    return;
  }
  const sf = sourceFile();
  const classes = exportedClassesWithMembers(sf, ['FunticoPhaserPlugin']);
  assert.ok(classes.includes('FunticoSDK'), 'FunticoSDK must be found in the source');
  const required = classes.flatMap(cls => publicMembers(sf, cls).map(m => `${cls}.${m.name}`));
  assert.ok(required.length > 50, `suspiciously few public members parsed (${required.length})`);
  const missing = required.filter(name => !coverage.has(name));
  assert.deepEqual(missing, [], `public members without a scenario: ${missing.join(', ')}`);
});

// ---- mutation check -------------------------------------------------------------------------

const MUTANTS = [
  { what: 'pre-paid flag default', find: 'IsPrePaid: false', replace: 'IsPrePaid: true' },
  { what: 'voucher activation threshold', find: '&& voucher.PlayCount >= voucher.PlaysRequiredToActivate', replace: '&& voucher.PlayCount > voucher.PlaysRequiredToActivate' },
  { what: 'EndRoomSP score truncation', find: 'Score: Math.trunc(score),', replace: 'Score: Math.round(score),' },
  { what: 'boolean metric normalisation', find: 'normalized[name] = value ? 1 : 0;', replace: 'normalized[name] = value ? 1 : -1;' },
  { what: 'AES key padding', find: "return key.padEnd(16, key[0] || '0');", replace: "return key.padEnd(16, '0');" },
  { what: 'session key derivation', find: 'substring(privateKey.length - 8)', replace: 'substring(privateKey.length - 9)' },
  { what: 'dead campaign attempt cleanup', find: 'attemptIsDead &&', replace: 'false &&' },
  { what: 'auth header name', find: '"Authorization": `Bearer ${this.jwtToken}`', replace: '"authorization": `Bearer ${this.jwtToken}`' },
];

test('T2 mutation check: each behavioural mutant of the ESM dist is detected by some scenario', async () => {
  const original = fs.readFileSync(DIST_ESM, 'utf8');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'funtico-mutants-'));
  const baseline = {};
  try {
    for (const scenario of SCENARIOS) {
      baseline[scenario.name] = await runScenario(byName.oracle, scenario.run, { routes: routesFor(scenario) });
    }
    for (const [i, mutant] of MUTANTS.entries()) {
      assert.ok(original.includes(mutant.find), `mutant "${mutant.what}": target text not found in dist (update the mutant)`);
      const file = path.join(dir, `mutant-${i}.mjs`);
      fs.writeFileSync(file, original.replace(mutant.find, mutant.replace));
      const impl = { name: `mutant:${mutant.what}`, mod: await import(pathToFileURL(file).href) };

      let detectedBy = null;
      for (const scenario of SCENARIOS) {
        let result;
        try {
          result = await runScenario(impl, scenario.run, { routes: routesFor(scenario) });
        } catch {
          detectedBy = scenario.name; // a spot check failed
          break;
        }
        const ref = baseline[scenario.name];
        try {
          assert.deepStrictEqual(result.requests, ref.requests);
          assert.deepStrictEqual(result.trace, ref.trace);
        } catch {
          detectedBy = scenario.name;
          break;
        }
      }
      assert.ok(detectedBy, `mutant "${mutant.what}" survived every scenario - the differential test is blind to it`);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
