// T1 - loading: the three ways to consume the SDK expose the same runtime API, and that API is
// exactly the source's exported runtime declarations minus FunticoPhaserPlugin plus FunticoClient.
//   - ESM:    import dist/funtico-sdk.mjs
//   - CJS:    require(dist/funtico-sdk.js)
//   - script: dist/funtico-sdk.js evaluated in a node:vm context with NO module/exports, the way a
//             <script> tag runs it - it must define the global namespace `FunticoSDK`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DIST_UMD, importEsm, requireUmd } from './helpers/paths.mjs';
import { sourceFile, clientFile, runtimeExports, privateRuntimeDeclarations } from './helpers/source-ast.mjs';
import { loadOracle } from './helpers/oracle.mjs';

const esm = await importEsm();
const cjs = requireUmd();
const umdCode = fs.readFileSync(DIST_UMD, 'utf8');

/** Runs the UMD file as a classic script in a fresh context; `extra` seeds context globals. */
function loadAsScript(extra = {}) {
  const context = vm.createContext({ ...extra });
  vm.runInContext(umdCode, context, { filename: 'funtico-sdk.js' });
  return context;
}

const sorted = names => [...names].sort();

const expected = (() => {
  const core = runtimeExports(sourceFile());
  const client = runtimeExports(clientFile());
  assert.ok(core.includes('FunticoPhaserPlugin'), 'source is expected to export FunticoPhaserPlugin');
  assert.deepEqual(client, ['FunticoClient'], 'src/FunticoClient.ts should export exactly FunticoClient');
  return sorted([...core.filter(n => n !== 'FunticoPhaserPlugin'), ...client]);
})();

test('T1 ESM import exposes exactly the expected runtime exports (no default export)', () => {
  assert.deepEqual(sorted(Object.keys(esm)), expected);
  assert.equal('default' in esm, false);
});

test('T1 require() exposes exactly the expected runtime exports and leaks no global', () => {
  assert.deepEqual(sorted(Object.keys(cjs)), expected);
  assert.equal(requireUmd(), cjs, 'require is cached');
  assert.equal(globalThis.FunticoSDK, undefined, 'CommonJS load must not also define a global');
});

test('T1 script-tag mode (vm, no module/exports) defines global FunticoSDK with the same exports', () => {
  const ctx = loadAsScript();
  assert.equal(typeof ctx.module, 'undefined');
  assert.equal(typeof ctx.FunticoSDK, 'object');
  assert.deepEqual(sorted(Object.keys(ctx.FunticoSDK)), expected);
  const sdk = ctx.FunticoSDK.FunticoSDK.Instance;
  assert.ok(sdk instanceof ctx.FunticoSDK.FunticoSDK);
  assert.equal(ctx.FunticoSDK.FunticoSDK.Instance, sdk, 'singleton');
  assert.equal(new ctx.FunticoSDK.FunticoClient().sdk, sdk, 'FunticoClient wraps the same singleton');
});

test('T1 non-exported helpers stay private inside the closure', () => {
  const privates = privateRuntimeDeclarations(sourceFile());
  assert.ok(privates.includes('TicketType'), 'TicketType is expected to be a private enum in the source');
  const ctx = loadAsScript();
  for (const name of privates) {
    assert.equal(name in esm, false, `${name} leaked from ESM`);
    assert.equal(name in cjs, false, `${name} leaked from CJS`);
    assert.equal(name in ctx.FunticoSDK, false, `${name} leaked from the script namespace`);
    assert.equal(name in ctx, false, `${name} leaked into the script global scope`);
  }
});

test('T1 every build exposes the same kinds of values, enums have identical members, and they match the oracle', async () => {
  const oracle = await loadOracle();
  const ctx = loadAsScript();
  for (const name of expected) {
    const kinds = [esm, cjs, ctx.FunticoSDK].map(m => typeof m[name]);
    assert.deepEqual(new Set(kinds).size, 1, `${name}: ${kinds}`);
    if (kinds[0] === 'object') { // TS enums
      const members = JSON.stringify(esm[name]);
      assert.equal(JSON.stringify(cjs[name]), members, `${name} (cjs)`);
      assert.equal(JSON.stringify(ctx.FunticoSDK[name]), members, `${name} (script)`);
      assert.equal(JSON.stringify(oracle[name]), members, `${name} (oracle)`);
    }
  }
});

test('T1 script-tag mode works end to end in a browser-like global (window === globalThis)', async () => {
  const requests = [];
  const fetchMock = async (url, init) => {
    requests.push({ url, init });
    if (url.endsWith('/Auth/funtico-auth')) return new Response(JSON.stringify({ Token: 'jwt-in-vm' }));
    return new Response(JSON.stringify({ Coins: 1, Diamonds: 2, SemiFinalTickets: 0, FinalTickets: 0, PrivateTickets: 0, KYCVerified: false }));
  };
  const ctx = loadAsScript({
    fetch: fetchMock, crypto: globalThis.crypto, TextEncoder, TextDecoder, atob, btoa, Response, console,
  });
  vm.runInContext('var window = globalThis;', ctx); // CryptoHelper prefers window.crypto in browsers
  const { FunticoSDK: ns } = ctx;

  const encrypted = await ns.CryptoHelper.encrypt('hello from a script tag', 'room-aaaTestPriv');
  assert.equal(encrypted, await cjs.CryptoHelper.encrypt('hello from a script tag', 'room-aaaTestPriv'));

  const sdk = ns.FunticoSDK.Instance;
  await sdk.Initialize({
    env: ns.FunticoEnvironment.STAGING, publicGameKey: '11111111-2222-3333-4444-555555555555',
    privateGameKey: 'TestPrivKey0123456789abcdefABCDEF', apiBaseUrl: 'https://rooms-api.test.invalid',
  });
  await sdk.Authentication('synthetic-platform-token');
  const balance = await sdk.GetBalance(false);
  assert.equal(balance.Diamonds, 2);
  assert.deepEqual(requests.map(r => r.url), [
    'https://rooms-api.test.invalid/Auth/funtico-auth',
    'https://rooms-api.test.invalid/User/get-balance',
  ]);
  assert.equal(requests[1].init.headers.Authorization, 'Bearer jwt-in-vm');
});
