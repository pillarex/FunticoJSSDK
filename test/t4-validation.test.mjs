// T4 - fail-fast config validation in FunticoSDK.Initialize (rules R1-R7, listed in INVALID below).
// Checked on the oracle (the source) and both dist builds: every bad config rejects with a plain
// Error whose message starts "Invalid FunticoConfig: ", never echoes a key, makes no request,
// and leaves a previously initialised singleton fully working. Legitimately issued key shapes pass.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadImpls, runScenario } from './helpers/harness.mjs';
import { defaultRoutes, PUB, PRIV, API, JWT, PLATFORM_TOKEN } from './fixtures/wire.mjs';

const impls = await loadImpls();
const PREFIX = 'Invalid FunticoConfig: ';
const GUID_PUB = '8c1f4e2a-3b5d-4c6e-9f70-1a2b3c4d5e6f';
const ALNUM_32 = 'Zq7Lm2Xc9Vb4Nn6Tt1Rr8Pp3Kk5Hh0Jj';
const B64URL_PUB = 'mK3-q_Z8vT1-xY_7Rw2pLs9-Nd_4Fh6jQe0-Bc_5Ua'; // public key in URL-safe base64 form (also a valid shape)
const SHORT_SECRET = 'Ab3$x9Q';   // 7 chars
const EIGHT_SECRET = 'Pk8wQ2zX';  // exactly 8 chars

const base = (mod, extra) => ({ env: mod.FunticoEnvironment.STAGING, publicGameKey: PUB, privateGameKey: PRIV, apiBaseUrl: API, ...extra });

/** [rule, description, (mod) => config, expected message fragment] */
const INVALID = [
  ['R1', 'undefined config', () => undefined, /must be an object/],
  ['R1', 'null config', () => null, /must be an object/],
  ['R1', 'string config', () => PRIV, /must be an object/],
  ['R1', 'number config', () => 42, /must be an object/],
  ['R2', 'publicGameKey missing', mod => { const c = base(mod); delete c.publicGameKey; return c; }, /publicGameKey is missing or empty/],
  ['R2', 'publicGameKey empty', mod => base(mod, { publicGameKey: '' }), /publicGameKey is missing or empty/],
  ['R2', 'publicGameKey not a string', mod => base(mod, { publicGameKey: 12345678 }), /publicGameKey is missing or empty/],
  ['R2', 'publicGameKey null', mod => base(mod, { publicGameKey: null }), /publicGameKey is missing or empty/],
  ['R3', 'privateGameKey missing', mod => { const c = base(mod); delete c.privateGameKey; return c; }, /privateGameKey is missing or empty/],
  ['R3', 'privateGameKey empty', mod => base(mod, { privateGameKey: '' }), /privateGameKey is missing or empty/],
  ['R3', 'privateGameKey not a string', mod => base(mod, { privateGameKey: { key: PRIV } }), /privateGameKey is missing or empty/],
  ['R4', 'publicGameKey trailing CRLF', mod => base(mod, { publicGameKey: PUB + '\r\n' }), /publicGameKey has leading or trailing whitespace.*newline\/CR/],
  ['R4', 'publicGameKey leading space', mod => base(mod, { publicGameKey: ' ' + PUB }), /publicGameKey has leading or trailing whitespace/],
  ['R4', 'privateGameKey trailing newline', mod => base(mod, { privateGameKey: PRIV + '\n' }), /privateGameKey has leading or trailing whitespace.*newline\/CR/],
  ['R4', 'privateGameKey leading tab', mod => base(mod, { privateGameKey: '\t' + PRIV }), /privateGameKey has leading or trailing whitespace/],
  ['R5', 'privateGameKey 7 chars', mod => base(mod, { privateGameKey: SHORT_SECRET }), /too short \(7 characters, at least 8/],
  ['R5', 'privateGameKey 1 char', mod => base(mod, { privateGameKey: 'Q' }), /too short \(1 characters, at least 8/],
  ['R6', 'privateGameKey equals publicGameKey', mod => base(mod, { privateGameKey: PUB }), /same as publicGameKey/],
  ['R7', 'concatenated keys: privateGameKey = publicGameKey + secret', mod => base(mod, { privateGameKey: PUB + PRIV }), /overlap.*concatenated.*Pass only the secret key from the Developer Portal in privateGameKey/],
  ['R7', 'privateGameKey = secret + publicGameKey', mod => base(mod, { privateGameKey: PRIV + PUB }), /concatenated/],
  ['R7', 'publicGameKey contains privateGameKey', mod => base(mod, { publicGameKey: PUB + PRIV }), /concatenated/],
  ['R7', 'separator between the keys', mod => base(mod, { privateGameKey: `${PUB}:${PRIV}` }), /concatenated/],
];

/** Every key value (and its trimmed form) that must never appear in an error message. */
function secretsOf(config) {
  if (!config || typeof config !== 'object') return typeof config === 'string' ? [config] : [];
  return [config.publicGameKey, config.privateGameKey]
    .filter(v => typeof v === 'string')
    .flatMap(v => [v, v.trim()])
    .filter(v => v.length >= 4);
}

for (const impl of impls) {
  test(`T4 [${impl.name}] every rule R1-R7 rejects before any request, without leaking keys`, async () => {
    await runScenario(impl, async (ctx) => {
      for (const [rule, what, make, fragment] of INVALID) {
        const cfg = make(ctx.mod);
        const err = await ctx.sdk.Initialize(cfg).then(() => null, e => e);
        assert.ok(err, `${rule} ${what}: Initialize resolved`);
        assert.equal(err.constructor, Error, `${rule} ${what}: plain Error expected`);
        assert.ok(err.message.startsWith(PREFIX), `${rule} ${what}: "${err.message}"`);
        assert.match(err.message, fragment, `${rule} ${what}`);
        for (const secret of secretsOf(cfg)) {
          assert.equal(err.message.includes(secret), false, `${rule} ${what}: message leaks a key value`);
        }
      }
      ctx.expectRequests(0, 'validation must fail before any I/O');
    }, { routes: defaultRoutes() });
  });

  test(`T4 [${impl.name}] legitimately issued key shapes are accepted`, async () => {
    await runScenario(impl, async (ctx) => {
      const { STAGING, PROD } = ctx.mod.FunticoEnvironment;
      const valid = [
        { env: STAGING, publicGameKey: GUID_PUB, privateGameKey: ALNUM_32 },
        { env: PROD, publicGameKey: B64URL_PUB, privateGameKey: PRIV },
        { env: STAGING, publicGameKey: GUID_PUB, privateGameKey: EIGHT_SECRET },
        // Sharing a prefix is not containment: the first 8 chars of the GUID are fine in a secret.
        { env: STAGING, publicGameKey: PUB, privateGameKey: PUB.slice(0, 8) + ALNUM_32 },
        // Inner whitespace is not a trim problem.
        { env: STAGING, publicGameKey: PUB, privateGameKey: 'Secret with inner spaces' },
      ];
      assert.equal(ALNUM_32.length, 32);
      assert.equal(EIGHT_SECRET.length, 8);
      assert.ok(B64URL_PUB.includes('-') && B64URL_PUB.includes('_'));
      for (const cfg of valid) {
        await assert.doesNotReject(ctx.sdk.Initialize(cfg), JSON.stringify(cfg));
      }
      ctx.expectRequests(0, 'no userToken -> no request');
      await assert.doesNotReject(ctx.sdk.Initialize(base(ctx.mod, { privateGameKey: EIGHT_SECRET, userToken: PLATFORM_TOKEN })));
      ctx.expectRequests(4, 'valid config with a token authenticates');
    }, { routes: defaultRoutes() });
  });

  test(`T4 [${impl.name}] a rejected Initialize leaves the previous config and session untouched`, async () => {
    await runScenario(impl, async (ctx) => {
      const { mod } = ctx;
      await ctx.sdk.Initialize(base(mod, { userToken: PLATFORM_TOKEN, apiBaseUrl: API }));
      assert.equal(ctx.sdk.getUserToken(), JWT);
      const n = ctx.requests.length;

      // The concatenated-keys shape, then a config pointing at another host with a CR-tainted key.
      await assert.rejects(ctx.sdk.Initialize(base(mod, { privateGameKey: PUB + PRIV, userToken: 'other-token' })), /^Error: Invalid FunticoConfig: /);
      await assert.rejects(ctx.sdk.Initialize({ env: mod.FunticoEnvironment.PROD, publicGameKey: 'fresh-public-key', privateGameKey: 'fresh-secret\r', apiBaseUrl: 'https://elsewhere.test.invalid' }), /whitespace/);
      assert.equal(ctx.requests.length, n, 'no request from the rejected configs');

      assert.equal(ctx.sdk.getPlatformToken(), PLATFORM_TOKEN, 'old config.userToken kept');
      assert.equal(ctx.sdk.getUserToken(), JWT, 'old JWT kept');
      const balance = await ctx.sdk.GetBalance(false);
      assert.equal(balance.Coins, 1500);
      const req = ctx.requests[ctx.requests.length - 1];
      assert.equal(req.url, `${API}/User/get-balance`, 'old apiBaseUrl kept');
      assert.equal(req.headers['X-User-Key'], PUB, 'old public key kept');
      assert.equal(req.headers.Authorization, `Bearer ${JWT}`);

      // The old private key is still the one used for encryption (the EndRoomSP payload decrypts).
      await ctx.sdk.EndRoomSP('room-aaaa-0001', 'sess-12345678', 10, 4242);
      const { serverDecrypt, payloadAesKey } = await import('./helpers/crypto-oracle.mjs');
      const body = JSON.parse(ctx.requests[ctx.requests.length - 1].body);
      assert.equal(JSON.parse(serverDecrypt(body.EncryptedData, payloadAesKey('sess-12345678', PRIV))).Score, 10);
    }, { routes: defaultRoutes() });
  });
}
