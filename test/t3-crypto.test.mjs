// T3 - crypto known-answer tests against an independent node:crypto model of the Funtico backend
// scheme (test/helpers/crypto-oracle.mjs). The SDK's Web Crypto CryptoHelper and the encrypted
// payloads it builds must agree with that model exactly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runScenario } from './helpers/harness.mjs';
import { importEsm, requireUmd } from './helpers/paths.mjs';
import {
  serverEncrypt, serverDecrypt, serverHmac, serverKey, payloadAesKey, payloadHmacKey, sessionKey,
} from './helpers/crypto-oracle.mjs';
import { defaultRoutes, config, PUB, PRIV, PLATFORM_TOKEN, USER_ID, ROOM_A, TOURNAMENT_ID } from './fixtures/wire.mjs';

const builds = [
  { name: 'esm', mod: await importEsm() },
  { name: 'umd', mod: requireUmd() },
];

// Pinned vector (computed with node:crypto from the backend scheme): a change on either side shows up.
const KAT = {
  plain: '{"Score":1234,"UserId":4242,"Ip":"127.0.0.1","GameEvents":[]}',
  key: 'sess-000TestPriv',
  cipher: 'jfiI83mnWwfa2xt060i0oiWYyG3/JS473JazXty3DLfZvwkQphacEVp5DV3juiPp4yC3LxP05Vkjnch8c9TpaQ==',
  hmacKey: 'Key0123456789abcdefABCDEF',
  hmac: '8812c8d1d6535a0460a7f12707f8976238188c5ffd6779fe135767d850b0b317',
};

const PLAINTEXTS = ['', 'a', '0123456789abcde', '0123456789abcdef', '0123456789abcdef!', 'Привіт, світ! 🎮', 'x'.repeat(1000), KAT.plain];
// ASCII keys of every length class: shorter than, exactly and longer than 16 characters.
const KEYS = ['k', 'Ab3$x9Q', 'sess-000TestPriv', '0123456789abcde', '0123456789abcdef0', PRIV, PUB + PRIV];

test('T3 server model sanity: key normalisation rule', () => {
  assert.equal(serverKey('abc'), 'abcaaaaaaaaaaaaa');
  assert.equal(serverKey('0123456789abcdef'), '0123456789abcdef');
  assert.equal(serverKey('0123456789abcdefXYZ'), '0123456789abcdef');
  assert.equal(serverDecrypt(KAT.cipher, KAT.key), KAT.plain);
});

for (const { name, mod } of builds) {
  const { CryptoHelper } = mod;

  test(`T3 [${name}] pinned known-answer vector`, async () => {
    assert.equal(await CryptoHelper.encrypt(KAT.plain, KAT.key), KAT.cipher);
    assert.equal(await CryptoHelper.decrypt(KAT.cipher, KAT.key), KAT.plain);
    assert.equal(await CryptoHelper.hmacSha256(KAT.cipher, KAT.hmacKey), KAT.hmac);
  });

  test(`T3 [${name}] HMAC-SHA256 matches RFC 4231 test case 2 and node:crypto`, async () => {
    assert.equal(await CryptoHelper.hmacSha256('what do ya want for nothing?', 'Jefe'),
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
    for (const key of KEYS) {
      for (const msg of PLAINTEXTS) {
        assert.equal(await CryptoHelper.hmacSha256(msg, key), serverHmac(msg, key), `hmac(${key})`);
      }
    }
  });

  test(`T3 [${name}] AES encrypt/decrypt agree with the server for every key length class`, async () => {
    for (const key of KEYS) {
      for (const plain of PLAINTEXTS) {
        const sdkCipher = await CryptoHelper.encrypt(plain, key);
        assert.equal(sdkCipher, serverEncrypt(plain, key), `encrypt key=${key.length} chars`);
        assert.equal(serverDecrypt(sdkCipher, key), plain);
        assert.equal(await CryptoHelper.decrypt(serverEncrypt(plain, key), key), plain);
      }
    }
  });

  test(`T3 [${name}] request payloads decrypt and verify under the backend scheme`, async () => {
    const eventId = ROOM_A.id;
    const sessionId = 'sess-9f3a2b1c-0000';
    const saveScoreId = 'score-uuid-0001-aaaa';
    const { requests } = await runScenario({ name, mod }, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordEvent_Client('jump');
      await ctx.sdk.EndRoomSP(eventId, sessionId, 1234.9, USER_ID, '10.0.0.1');
      ctx.sdk.RecordEvent_Client('lap:1');
      await ctx.sdk.ResultTournament_Client(TOURNAMENT_ID, saveScoreId, 4999.99, true, '{"lap":3}');
      const attempt = await ctx.sdk.StartCampaignLevel('level-0002');
      await ctx.sdk.CompleteCampaignLevel({ score: 1234.5, perfect: true, missed: false });
      ctx.state.attempt = attempt;
      await ctx.sdk.CreateSession_Client('{"level":1,"hp":50}', mod.GameTypeEnum.Rooms, eventId, sessionId);
      await ctx.sdk.ResultTournament_Server(TOURNAMENT_ID, saveScoreId, 5000, 1058, true);
    }, { routes: defaultRoutes() });

    const find = path => requests.find(r => new URL(r.url).pathname === path);

    // EndRoomSP: payload keyed on the session/match id.
    const end = JSON.parse(find('/Rooms/end-room-sp').body);
    assert.deepEqual(JSON.parse(serverDecrypt(end.EncryptedData, payloadAesKey(sessionId, PRIV))),
      { Score: 1234, UserId: USER_ID, Ip: '10.0.0.1', GameEvents: ['jump'] });
    assert.equal(end.Hash, serverHmac(end.EncryptedData, payloadHmacKey(PRIV)));
    assert.equal(end.TournamentId, eventId);

    // ResultTournament_Client: payload keyed on saveScoreId.
    const res = JSON.parse(find('/SpecialTournaments/result-tournament-client').body);
    assert.deepEqual(JSON.parse(serverDecrypt(res.EncryptedData, payloadAesKey(saveScoreId, PRIV))),
      { Score: 4999, IsSuccess: true, CustomData: '{"lap":3}', GameEvents: ['lap:1'] });
    assert.equal(res.Hash, serverHmac(res.EncryptedData, payloadHmacKey(PRIV)));

    // CompleteCampaignLevel: payload keyed on the attempt id; metrics untruncated, booleans 1/0.
    const done = JSON.parse(find('/Campaign/complete-level').body);
    const attemptId = done.AttemptId;
    assert.match(attemptId, /^attempt-/);
    assert.deepEqual(JSON.parse(serverDecrypt(done.EncryptedData, payloadAesKey(attemptId, PRIV))),
      { AttemptId: attemptId, LevelId: 'level-0002', Metrics: { score: 1234.5, perfect: 1, missed: 0 }, GameEvents: [] });
    assert.equal(done.Hash, serverHmac(done.EncryptedData, payloadHmacKey(PRIV)));

    // Saved session: Data and Hash of the created session.
    const saved = JSON.parse(find('/Session/create-session').body);
    assert.equal(serverDecrypt(saved.Data, sessionKey(USER_ID, PRIV)), '{"level":1,"hp":50}');
    assert.equal(saved.Hash, serverHmac(saved.Data, eventId));

    // Dedicated-server requests carry X-Server-Key; the secret key itself is never sent.
    const server = find('/SpecialTournaments/result-tournament');
    assert.equal(server.headers['X-Server-Key'], serverHmac(PRIV, PUB));
    assert.equal(JSON.stringify(server).includes(PRIV), false, 'the secret key itself is never sent');
  });
}

test('T3 concatenated keys: a privateGameKey with the public key prepended yields ciphertext the server cannot decrypt', () => {
  // privateGameKey = publicGameKey + secret (Initialize rejects this shape) would produce payloads
  // that the backend cannot decrypt, so score submission would fail.
  const sessionId = 'sess-9f3a2b1c-0000';
  const blob = serverEncrypt(KAT.plain, payloadAesKey(sessionId, PUB + PRIV));
  assert.throws(() => serverDecrypt(blob, payloadAesKey(sessionId, PRIV)), /bad decrypt/,
    'backend-scheme decrypt must fail (the API answers HTTP 500 "Padding is invalid and cannot be removed")');
});
