// T10 - signing through a PayloadSigner (FunticoSignerConfig.payloadSigner) instead of privateGameKey.
//
//  - LocalPayloadSigner reproduces the reference vectors in test/fixtures/signer-vectors.json:
//    fixed inputs and the exact Data/Hash/session blob an independent implementation of the
//    scheme produced (not this SDK, and not the node:crypto model in helpers/crypto-oracle.mjs).
//  - A keyless SDK whose signer signs with the same key sends exactly the bytes the key config
//    sends, and the signer gets each result's kind, unshortened salt id and exact JSON.
//  - A signer that returns null (or an empty answer) sends nothing, rejects the call and keeps
//    what a retry needs; a signer's exception reaches the caller unchanged.
//  - Saved sessions go through EncryptSession/DecryptSession.
//  - Without a private key no X-Server-Key is sent.
//  - Initialize validates a signer config before any request.
// Run on the oracle (the source compiled on its own) and both dist builds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadImpls, runScenario, json } from './helpers/harness.mjs';
import { serverEncrypt, serverDecrypt, serverHmac, payloadAesKey, payloadHmacKey, practiceAesKey, sessionKey } from './helpers/crypto-oracle.mjs';
import {
  defaultRoutes, config, PUB, PRIV, PLATFORM_TOKEN, USER_ID, PLATFORM_ID, ROOM_A, TOURNAMENT_ID, GHOST_MATCH_ID,
  GOAL_ATTEMPT_ID, GOAL_ID, SAVED_SESSION, SAVED_STATE,
} from './fixtures/wire.mjs';

const impls = await loadImpls();
const VECTORS = JSON.parse(fs.readFileSync(new URL('./fixtures/signer-vectors.json', import.meta.url), 'utf8'));
const KIND_NAMES = { practice: 'Practice', room: 'Room', tournament: 'Tournament', campaign: 'Campaign', ghost: 'Ghost', communityGoal: 'CommunityGoal' };

const SESSION_ID = 'sess-9f3a2b1c-0000';
const SAVE_SCORE_ID = 'score-uuid-0001-aaaa';
const MIXED_GHOST_ID = GHOST_MATCH_ID.toUpperCase();
const MIXED_GOAL_ATTEMPT = { AttemptId: GOAL_ATTEMPT_ID.toUpperCase(), GoalId: GOAL_ID };

/** A config without privateGameKey, signing through `signer`. */
function signerConfig(mod, signer, extra = {}) {
  const { privateGameKey, ...rest } = config(mod, { userToken: PLATFORM_TOKEN, ...extra });
  return { ...rest, payloadSigner: signer };
}

/**
 * A game signer backed by LocalPayloadSigner(PRIV): records every call and answers according to
 * `behave(method)` - undefined signs normally, any other value is returned (or thrown, if an Error).
 */
function recordingSigner(mod, behave = () => undefined) {
  const inner = new mod.LocalPayloadSigner(PRIV);
  const calls = [];
  const answer = async (method, args) => {
    calls.push({ method, args });
    const override = behave(method, args);
    if (override instanceof Error) throw override;
    if (override !== undefined) return override;
    return inner[method](...args);
  };
  return {
    calls,
    signer: {
      Sign: (...args) => answer('Sign', args),
      EncryptSession: (...args) => answer('EncryptSession', args),
      DecryptSession: (...args) => answer('DecryptSession', args),
    },
  };
}

/** Every call that encrypts something, in one fixed order. */
async function encryptedCalls(ctx) {
  const { sdk, mod } = ctx;
  sdk.RecordEvent_Client('jump');
  sdk.RecordCollected_Client('chest_1', 2);
  await sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 1234.9, USER_ID, '10.0.0.1');
  sdk.RecordEvent_Client('lap:1');
  await sdk.ResultTournament_Client(TOURNAMENT_ID, SAVE_SCORE_ID, 4999.99, true, '{"lap":3}');
  sdk.RecordEvent_Client('wave:1');
  await sdk.CompletePractice(777.7);
  await sdk.StartCampaignLevel('level-0002');
  await sdk.CompleteCampaignLevel({ score: 1234.5, perfect: true });
  await sdk.ReportGhostResult(MIXED_GHOST_ID, mod.GhostOutcome.Draw, 'fight-hash-01', '{"log":["r1"]}');
  await sdk.CompleteGoalAttempt(MIXED_GOAL_ATTEMPT, 1500000, { clientDurationSeconds: 58.5, fightHash: 'fh-1' });
  await sdk.CreateSession_Client('{"level":1,"hp":50}', mod.GameTypeEnum.Rooms, ROOM_A.id, SESSION_ID);
  await sdk.UpdateSession_Client('{"level":2}');
  ctx.state.reconnected = await sdk.ReconnectToUnfinishedSession_Client(SAVED_SESSION.Id);
  await sdk.ResultTournament_Server(TOURNAMENT_ID, SAVE_SCORE_ID, 5000, PLATFORM_ID, true);
  await sdk.FinishRoomSession_Server(ROOM_A.id, SESSION_ID, [{ Score: 10, UserId: USER_ID, FunticoUserId: PLATFORM_ID, UserIp: '10.0.0.1' }]);
}

const pathOf = req => new URL(req.url).pathname;
const sentTo = (requests, path) => requests.filter(r => pathOf(r) === path);
const SERVER_PATHS = ['/SpecialTournaments/result-tournament', '/Rooms/end-room-all-users'];

test('T10 reference vectors agree with the independent node:crypto model too', () => {
  for (const row of VECTORS.vectors) {
    const salt = row.kind === 'practice' ? row.saltId.padStart(8, '0').substring(0, 8) : row.saltId.substring(0, 8);
    assert.equal(serverEncrypt(row.payload, salt + VECTORS.key.substring(0, 8)), row.data, `${row.kind} ${row.saltId}`);
    assert.equal(serverHmac(row.data, payloadHmacKey(VECTORS.key)), row.hash);
  }
  assert.equal(serverEncrypt('{"Data":"{}"}', sessionKey(VECTORS.userId, VECTORS.key)), VECTORS.sessionBlob);
});

for (const impl of impls) {
  const { name, mod } = impl;

  test(`T10 [${name}] LocalPayloadSigner reproduces the reference vectors byte for byte`, async () => {
    assert.deepEqual(Object.keys(mod.PayloadKind).filter(k => isNaN(Number(k))),
      ['Practice', 'Room', 'Tournament', 'Campaign', 'Ghost', 'CommunityGoal']);
    assert.deepEqual([mod.PayloadKind.Practice, mod.PayloadKind.CommunityGoal], [0, 5]);

    const signer = new mod.LocalPayloadSigner(VECTORS.key);
    for (const row of VECTORS.vectors) {
      const kind = mod.PayloadKind[KIND_NAMES[row.kind]];
      assert.notEqual(kind, undefined, row.kind);
      const signed = await signer.Sign(kind, row.saltId, row.payload);
      assert.deepEqual(signed, { Data: row.data, Hash: row.hash }, `${row.kind} ${row.saltId}`);
    }

    const blob = await signer.EncryptSession(String(VECTORS.userId), '{"Data":"{}"}');
    assert.equal(blob, VECTORS.sessionBlob);
    assert.equal(await signer.DecryptSession(String(VECTORS.userId), blob), '{"Data":"{}"}');
    assert.equal(VECTORS.userId.toString(16).padStart(8, '0'), VECTORS.userGuidPrefix);
  });

  test(`T10 [${name}] LocalPayloadSigner.Salt: the id's first 8 characters; a practice id zero-padded first`, () => {
    const { Salt } = mod.LocalPayloadSigner;
    const K = mod.PayloadKind;
    assert.equal(Salt(K.Practice, '4711'), '00004711');
    assert.equal(Salt(K.Practice, '123456789'), '12345678');
    assert.equal(Salt(K.Room, 'c0ffee12-3456-4789-abcd-ef0123456789'), 'c0ffee12');
    assert.equal(Salt(K.Tournament, SAVE_SCORE_ID), 'score-uu');
    assert.equal(Salt(K.Campaign, 'attempt-0001'), 'attempt-');
    assert.equal(Salt(K.Ghost, GHOST_MATCH_ID), GHOST_MATCH_ID.substring(0, 8));
    assert.equal(Salt(K.CommunityGoal, GOAL_ATTEMPT_ID), GOAL_ATTEMPT_ID.substring(0, 8));
  });

  test(`T10 [${name}] a keyless SDK with a same-key signer sends exactly what the key config sends`, async () => {
    const keyRun = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      await encryptedCalls(ctx);
    }, { routes: defaultRoutes() });

    const { calls, signer } = recordingSigner(mod);
    let reconnected;
    const signerRun = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(signerConfig(mod, signer));
      await encryptedCalls(ctx);
      reconnected = ctx.state.reconnected;
    }, { routes: defaultRoutes() });

    // Identical requests; only the server endpoints differ: no X-Server-Key without a key.
    assert.equal(signerRun.requests.length, keyRun.requests.length);
    keyRun.requests.forEach((keyReq, i) => {
      const signerReq = signerRun.requests[i];
      if (SERVER_PATHS.includes(pathOf(keyReq))) {
        assert.equal(keyReq.headers['X-Server-Key'], serverHmac(PRIV, PUB));
        const { 'X-Server-Key': _, ...rest } = keyReq.headers;
        assert.deepEqual(signerReq, { ...keyReq, headers: rest }, `request ${i} ${pathOf(keyReq)}`);
        assert.equal('X-Server-Key' in signerReq.headers, false);
        assert.equal(signerReq.headers['X-User-Key'], PUB);
      } else {
        assert.deepEqual(signerReq, keyReq, `request ${i} ${pathOf(keyReq)}`);
      }
    });
    assert.equal(reconnected, SAVED_STATE);

    // What the signer was asked: kind, unshortened salt id, and the exact JSON that went out.
    const K = mod.PayloadKind;
    const req = path => JSON.parse(sentTo(signerRun.requests, path)[0].body);
    const room = req('/Rooms/end-room-sp');
    const tour = req('/SpecialTournaments/result-tournament-client');
    const practice = req('/User/complete-practice');
    const campaign = req('/Campaign/complete-level');
    const ghost = req('/Ghost/report');
    const goal = req('/CommunityGoal/attempt/complete');
    const created = req('/Session/create-session');
    const updated = req('/Session/update-session');
    assert.deepEqual(calls.map(c => [c.method, ...c.args]), [
      ['Sign', K.Room, SESSION_ID, serverDecrypt(room.EncryptedData, payloadAesKey(SESSION_ID, PRIV))],
      ['Sign', K.Tournament, SAVE_SCORE_ID, serverDecrypt(tour.EncryptedData, payloadAesKey(SAVE_SCORE_ID, PRIV))],
      ['Sign', K.Practice, String(USER_ID), serverDecrypt(practice.Data, practiceAesKey(USER_ID, PRIV))],
      ['Sign', K.Campaign, campaign.AttemptId, serverDecrypt(campaign.EncryptedData, payloadAesKey(campaign.AttemptId, PRIV))],
      ['Sign', K.Ghost, GHOST_MATCH_ID, serverDecrypt(ghost.EncryptedData, payloadAesKey(GHOST_MATCH_ID, PRIV))],
      ['Sign', K.CommunityGoal, GOAL_ATTEMPT_ID, serverDecrypt(goal.EncryptedData, payloadAesKey(GOAL_ATTEMPT_ID, PRIV))],
      ['EncryptSession', String(USER_ID), '{"level":1,"hp":50}'],
      ['EncryptSession', String(USER_ID), '{"level":2}'],
      ['DecryptSession', String(USER_ID), SAVED_SESSION.Data],
    ]);
    assert.match(campaign.AttemptId, /^attempt-/);
    assert.equal(serverDecrypt(created.Data, sessionKey(USER_ID, PRIV)), '{"level":1,"hp":50}');
    assert.equal(created.Hash, serverHmac(created.Data, ROOM_A.id));
    assert.equal(updated.Hash, serverHmac(updated.Data, ROOM_A.id));
    assert.equal(JSON.stringify(signerRun.requests).includes(PRIV), false, 'the secret key itself is never sent');
  });

  test(`T10 [${name}] a signer that returns null or an empty answer sends nothing and keeps what a retry needs`, async () => {
    for (const failed of [null, { Data: '', Hash: 'h' }, { Data: 'd', Hash: '' }, {}]) {
      let fail = true;
      const { calls, signer } = recordingSigner(mod, method => (fail && method === 'Sign' ? failed : undefined));
      const errors = {};
      const { requests } = await runScenario(impl, async (ctx) => {
        const { sdk } = ctx;
        await sdk.Initialize(signerConfig(mod, signer));
        const catchAs = async (key, thunk) => { errors[key] = await thunk().then(() => null, e => e); };

        sdk.RecordEvent_Client('jump');
        sdk.RecordCollected_Client('chest_1');
        await catchAs('room', () => sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 10, USER_ID));
        assert.deepEqual(sdk.GetCurrentSessionEvents_Client(), ['jump'], 'room: events kept');
        assert.deepEqual(sdk.GetCurrentSessionCollected_Client(), { chest_1: 1 }, 'room: counts kept');
        await catchAs('tournament', () => sdk.ResultTournament_Client(TOURNAMENT_ID, SAVE_SCORE_ID, 5, true));
        await catchAs('practice', () => sdk.CompletePractice(77));
        const attempt = await sdk.StartCampaignLevel('level-0002');
        await catchAs('campaign', () => sdk.CompleteCampaignLevel({ score: 1 }));
        assert.equal(sdk.GetActiveCampaignAttempt()?.AttemptId, attempt.AttemptId, 'campaign: attempt kept');
        await catchAs('ghost', () => sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Win));
        await catchAs('goal', () => sdk.CompleteGoalAttempt(MIXED_GOAL_ATTEMPT, 3));

        // The signer recovers: every retry goes through, the practice run keeps its id.
        fail = false;
        await sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 10, USER_ID);
        await sdk.ResultTournament_Client(TOURNAMENT_ID, SAVE_SCORE_ID, 5, true);
        await sdk.CompletePractice(77);
        await sdk.CompleteCampaignLevel({ score: 1 });
        assert.equal(sdk.GetActiveCampaignAttempt(), null, 'campaign: the retry consumed the attempt');
        await sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Win);
        await sdk.CompleteGoalAttempt(MIXED_GOAL_ATTEMPT, 3);
      }, { routes: defaultRoutes() });

      const what = JSON.stringify(failed);
      const PLAIN = [['room', 'Failed to end gameplay session'], ['tournament', 'Failed to submit client tournament result'],
        ['practice', 'Failed to complete practice']];
      for (const [key, prefix] of PLAIN) {
        assert.equal(errors[key]?.constructor, Error, `${what} ${key}: plain Error`);
        assert.equal(errors[key].message, `${prefix}: the result could not be signed, so it was not sent.`);
      }
      assert.ok(errors.campaign instanceof mod.CampaignError && errors.campaign.Code === mod.CampaignErrorCode.Unknown, `${what} campaign`);
      assert.ok(errors.ghost instanceof mod.GhostError && errors.ghost.Code === mod.GhostErrorCode.Unknown, `${what} ghost`);
      assert.ok(errors.goal instanceof mod.CommunityGoalError && errors.goal.Code === mod.CommunityGoalErrorCode.Unknown, `${what} goal`);
      for (const err of [errors.campaign, errors.ghost, errors.goal]) assert.match(err.message, /could not be signed, so it was not sent/);

      // Each result went out once, from the retry.
      for (const path of ['/Rooms/end-room-sp', '/SpecialTournaments/result-tournament-client', '/User/complete-practice',
        '/Campaign/complete-level', '/Ghost/report', '/CommunityGoal/attempt/complete']) {
        assert.equal(sentTo(requests, path).length, 1, `${what} ${path}`);
      }
      assert.equal(calls.filter(c => c.method === 'Sign').length, 12);
      const room = JSON.parse(serverDecrypt(JSON.parse(sentTo(requests, '/Rooms/end-room-sp')[0].body).EncryptedData, payloadAesKey(SESSION_ID, PRIV)));
      assert.deepEqual([room.GameEvents, room.Collected], [['jump'], { chest_1: 1 }], 'the retry carries the kept events and counts');
      const practiceSigns = calls.filter(c => c.method === 'Sign' && c.args[0] === mod.PayloadKind.Practice).map(c => JSON.parse(c.args[2]).RunId);
      assert.equal(practiceSigns.length, 2);
      assert.equal(practiceSigns[0], practiceSigns[1], 'the practice retry is the same run');
    }
  });

  test(`T10 [${name}] a signer's exception reaches the caller unchanged and nothing is sent`, async () => {
    const boom = new TypeError('signer offline');
    const { signer } = recordingSigner(mod, () => boom);
    const seen = [];
    let afterRoom;
    const { requests } = await runScenario(impl, async (ctx) => {
      const { sdk } = ctx;
      await sdk.Initialize(signerConfig(mod, signer));
      const n = ctx.requests.length;
      sdk.RecordEvent_Client('jump');
      const attempt = await sdk.StartCampaignLevel('level-0002');
      const thunks = [
        () => sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 10, USER_ID),
        () => sdk.ResultTournament_Client(TOURNAMENT_ID, SAVE_SCORE_ID, 5, true),
        () => sdk.CompletePractice(77),
        () => sdk.CompleteCampaignLevel({ score: 1 }),
        () => sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Win),
        () => sdk.CompleteGoalAttempt(MIXED_GOAL_ATTEMPT, 3),
        () => sdk.CreateSession_Client('{}', mod.GameTypeEnum.Rooms, ROOM_A.id, SESSION_ID),
      ];
      for (const thunk of thunks) seen.push(await thunk().then(() => 'resolved', e => e));
      afterRoom = sdk.GetCurrentSessionEvents_Client();
      assert.equal(sdk.GetActiveCampaignAttempt()?.AttemptId, attempt.AttemptId);
      assert.equal(ctx.requests.length, n + 1, 'only the campaign start went out');
    }, { routes: defaultRoutes() });
    assert.equal(seen.length, 7);
    for (const err of seen) assert.equal(err, boom, 'the very same error object');
    assert.deepEqual(afterRoom, ['jump']);
    assert.equal(sentTo(requests, '/Session/create-session').length, 0);
  });

  test(`T10 [${name}] saved sessions: a failed EncryptSession or DecryptSession saves or restores nothing`, async () => {
    let failing = null;
    const { calls, signer } = recordingSigner(mod, method => (method === failing ? null : undefined));
    const seen = {};
    const { requests } = await runScenario(impl, async (ctx) => {
      const { sdk } = ctx;
      const catchAs = async (key, thunk) => { seen[key] = await thunk().then(v => ({ value: v }), e => e); };
      await sdk.Initialize(signerConfig(mod, signer));

      failing = 'EncryptSession';
      await catchAs('create', () => sdk.CreateSession_Client('{"level":1}', mod.GameTypeEnum.Rooms, ROOM_A.id, SESSION_ID));
      await catchAs('updateNone', () => sdk.UpdateSession_Client('{"level":2}'));
      failing = null;
      await sdk.CreateSession_Client('{"level":1}', mod.GameTypeEnum.Rooms, ROOM_A.id, SESSION_ID);
      failing = 'EncryptSession';
      await catchAs('update', () => sdk.UpdateSession_Client('{"level":2}'));
      failing = null;
      await catchAs('updateRetry', () => sdk.UpdateSession_Client('{"level":2}'));

      sdk.CloseCurrentSession_Client();
      failing = 'DecryptSession';
      await catchAs('reconnect', () => sdk.ReconnectToUnfinishedSession_Client(SAVED_SESSION.Id));
      await catchAs('updateAfterFailedReconnect', () => sdk.UpdateSession_Client('{}'));
      failing = null;
      await catchAs('reconnectRetry', () => sdk.ReconnectToUnfinishedSession_Client(SAVED_SESSION.Id));
    }, { routes: defaultRoutes() });

    assert.equal(seen.create.message, 'Failed to create client session: the session could not be encrypted, so it was not saved.');
    assert.match(seen.updateNone.message, /No active client session/, 'the failed create opened no session');
    assert.equal(seen.update.message, 'Failed to update client session progress: the session could not be encrypted, so it was not saved.');
    assert.deepEqual(seen.updateRetry, { value: true }, 'the session survived the failed update');
    assert.equal(seen.reconnect.message, 'Failed to reconnect to session: the saved session could not be decrypted.');
    assert.match(seen.updateAfterFailedReconnect.message, /No active client session/, 'a failed reconnect restores nothing');
    assert.deepEqual(seen.reconnectRetry, { value: SAVED_STATE });
    assert.equal(sentTo(requests, '/Session/create-session').length, 1);
    assert.equal(sentTo(requests, '/Session/update-session').length, 1);
    assert.equal(sentTo(requests, '/Session/reconnect-to-session').length, 2);
    assert.deepEqual(calls.map(c => c.method),
      ['EncryptSession', 'EncryptSession', 'EncryptSession', 'EncryptSession', 'DecryptSession', 'DecryptSession']);
  });

  test(`T10 [${name}] UpdateSession_Client saves into the session that was open when it was called`, async () => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const inner = new mod.LocalPayloadSigner(PRIV);
    const slow = {
      Sign: (...a) => inner.Sign(...a),
      DecryptSession: (...a) => inner.DecryptSession(...a),
      EncryptSession: async (...a) => { await gate; return inner.EncryptSession(...a); },
    };
    let result;
    const { requests } = await runScenario(impl, async (ctx) => {
      const { sdk } = ctx;
      await sdk.Initialize(signerConfig(mod, slow));
      await sdk.ReconnectToUnfinishedSession_Client(SAVED_SESSION.Id);
      const pending = sdk.UpdateSession_Client('{"level":9}');
      sdk.CloseCurrentSession_Client(); // e.g. the run ended while the signer was answering
      release();
      result = await pending;
    }, { routes: defaultRoutes() });
    const [update] = sentTo(requests, '/Session/update-session');
    const body = JSON.parse(update.body);
    assert.equal(result, true);
    assert.equal(body.Id, SAVED_SESSION.Id);
    assert.equal(body.Hash, serverHmac(body.Data, SAVED_SESSION.SessionId));
    assert.equal(serverDecrypt(body.Data, sessionKey(USER_ID, PRIV)), '{"level":9}');
  });

  test(`T10 [${name}] Initialize validates a signer config before any request`, async () => {
    const { signer } = recordingSigner(mod);
    await runScenario(impl, async (ctx) => {
      const base = { env: mod.FunticoEnvironment.STAGING, publicGameKey: PUB };
      const invalid = [
        [{ ...base, privateGameKey: PRIV, payloadSigner: signer }, /pass either privateGameKey or payloadSigner, not both/],
        [{ ...base, privateGameKey: '', payloadSigner: signer }, /not both/],
        [{ ...base, payloadSigner: {} }, /payloadSigner must have Sign, EncryptSession and DecryptSession methods/],
        [{ ...base, payloadSigner: { Sign() {}, EncryptSession() {} } }, /must have Sign, EncryptSession and DecryptSession/],
        [{ ...base, payloadSigner: 'signer' }, /must have Sign, EncryptSession and DecryptSession/],
        [{ ...base, publicGameKey: PUB + '\n', payloadSigner: signer }, /publicGameKey has leading or trailing whitespace/],
        [{ env: base.env, payloadSigner: signer }, /publicGameKey is missing or empty/],
        [{ ...base }, /privateGameKey is missing or empty\. Pass the secret key from the Developer Portal, or a payloadSigner\./],
        [{ ...base, payloadSigner: null }, /privateGameKey is missing or empty/],
      ];
      for (const [cfg, fragment] of invalid) {
        const err = await ctx.sdk.Initialize(cfg).then(() => null, e => e);
        assert.ok(err, `accepted: ${String(fragment)}`);
        assert.equal(err.constructor, Error);
        assert.ok(err.message.startsWith('Invalid FunticoConfig: '), err.message);
        assert.match(err.message, fragment);
        assert.equal(err.message.includes(PRIV) || err.message.includes(PUB), false, 'no key in the message');
      }
      ctx.expectRequests(0, 'rejected configs make no request');

      // A signer config is enough; null/undefined payloadSigner next to a key is plain key mode.
      await assert.doesNotReject(ctx.sdk.Initialize({ ...base, payloadSigner: signer }));
      await assert.doesNotReject(ctx.sdk.Initialize({ ...base, privateGameKey: PRIV, payloadSigner: null }));
      await assert.doesNotReject(ctx.sdk.Initialize({ ...base, privateGameKey: undefined, payloadSigner: signer }));
      ctx.expectRequests(0);
    }, { routes: defaultRoutes() });
  });

  test(`T10 [${name}] key mode signs with the key after a signer config, and the other way round`, async () => {
    const { calls, signer } = recordingSigner(mod, () => ({ Data: 'signed-elsewhere', Hash: 'hash-elsewhere' }));
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(signerConfig(mod, signer));
      await ctx.sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 1, USER_ID);
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      await ctx.sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 2, USER_ID);
      await ctx.sdk.ResultTournament_Server(TOURNAMENT_ID, SAVE_SCORE_ID, 5, PLATFORM_ID, true);
    }, { routes: { ...defaultRoutes(), 'POST /Rooms/end-room-sp': json({ Success: true }) } });
    const [fromSigner, fromKey] = sentTo(requests, '/Rooms/end-room-sp').map(r => JSON.parse(r.body));
    assert.deepEqual([fromSigner.EncryptedData, fromSigner.Hash], ['signed-elsewhere', 'hash-elsewhere'], 'the signer answer is sent as is');
    assert.equal(JSON.parse(serverDecrypt(fromKey.EncryptedData, payloadAesKey(SESSION_ID, PRIV))).Score, 2);
    assert.equal(fromKey.Hash, serverHmac(fromKey.EncryptedData, payloadHmacKey(PRIV)));
    assert.equal(calls.length, 1, 'the key config no longer calls the old signer');
    assert.equal(sentTo(requests, '/SpecialTournaments/result-tournament')[0].headers['X-Server-Key'], serverHmac(PRIV, PUB));
  });
}
