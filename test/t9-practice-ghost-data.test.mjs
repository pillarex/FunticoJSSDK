// T9 - what CompletePractice and ReportGhostResult's matchData put on the wire, and what the SDK
// keeps or clears afterwards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runScenario, json, text, networkError } from './helpers/harness.mjs';
import { importEsm, requireUmd } from './helpers/paths.mjs';
import { serverDecrypt, serverHmac, payloadAesKey, payloadHmacKey, practiceAesKey } from './helpers/crypto-oracle.mjs';
import { defaultRoutes, config, PRIV, PLATFORM_TOKEN, USER, USER_ID, GHOST_MATCH_ID } from './fixtures/wire.mjs';

const builds = [
  { name: 'esm', mod: await importEsm() },
  { name: 'umd', mod: requireUmd() },
];

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function sentTo(requests, path) {
  return requests.filter(r => new URL(r.url).pathname === path);
}

function practicePayloads(requests, userId = USER_ID) {
  return sentTo(requests, '/User/complete-practice')
    .map(r => JSON.parse(serverDecrypt(JSON.parse(r.body).Data, practiceAesKey(userId, PRIV))));
}

for (const { name, mod } of builds) {
  const impl = { name, mod };

  test(`T9 [${name}] practice sends the score, a run id, the recorded counts and events, then clears them`, async () => {
    let result;
    let events;
    let collected;
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1');
      ctx.sdk.RecordCollected_Client('chest_1', 2);
      ctx.sdk.RecordEvent_Client('{"t":"start"}');
      ctx.sdk.RecordEvent_Client('{"t":"end"}');
      result = await ctx.sdk.CompletePractice(1234.9);
      events = ctx.sdk.GetCurrentSessionEvents_Client();
      collected = ctx.sdk.GetCurrentSessionCollected_Client();
    }, { routes: defaultRoutes() });

    const [sent] = sentTo(requests, '/User/complete-practice');
    const body = JSON.parse(sent.body);
    assert.equal(sent.method, 'POST');
    assert.deepEqual(Object.keys(body), ['Data', 'Hash']);
    assert.equal(body.Hash, serverHmac(body.Data, payloadHmacKey(PRIV)));

    const [payload] = practicePayloads(requests);
    assert.deepEqual(Object.keys(payload), ['Score', 'RunId', 'Collected', 'GameEvents']);
    assert.equal(payload.Score, 1234);
    assert.match(payload.RunId, UUID_V4);
    assert.deepEqual(payload.Collected, { chest_1: 3 });
    assert.deepEqual(payload.GameEvents, ['{"t":"start"}', '{"t":"end"}']);

    assert.equal(result, true);
    assert.deepEqual(events, []);
    assert.deepEqual(collected, {});
  });

  test(`T9 [${name}] practice leaves Collected and GameEvents out when the run recorded nothing`, async () => {
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      await ctx.sdk.CompletePractice(0);
      await ctx.sdk.CompletePractice(5, { collected: {}, gameEvents: [] });
    }, { routes: defaultRoutes() });

    const payloads = practicePayloads(requests);
    assert.deepEqual(payloads.map(p => Object.keys(p)), [['Score', 'RunId'], ['Score', 'RunId']]);
    assert.deepEqual(payloads.map(p => p.Score), [0, 5]);
  });

  test(`T9 [${name}] a failed practice submit keeps the run id, counts and events; a delivered one starts a new run`, async () => {
    let calls = 0;
    let afterFailure;
    let afterSuccess;
    const routes = {
      ...defaultRoutes(),
      'POST /User/complete-practice': () => {
        calls++;
        if (calls === 1) return text('Invalid hash', 400);
        if (calls === 2) return networkError();
        return text('"Success"');
      },
    };

    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1');
      ctx.sdk.RecordEvent_Client('e1');
      await assert.rejects(ctx.sdk.CompletePractice(10), /Invalid hash/);
      await assert.rejects(ctx.sdk.CompletePractice(10));
      afterFailure = { events: ctx.sdk.GetCurrentSessionEvents_Client(), collected: ctx.sdk.GetCurrentSessionCollected_Client() };
      await ctx.sdk.CompletePractice(10);
      afterSuccess = { events: ctx.sdk.GetCurrentSessionEvents_Client(), collected: ctx.sdk.GetCurrentSessionCollected_Client() };
      await ctx.sdk.CompletePractice(20);
    }, { routes });

    assert.deepEqual(afterFailure, { events: ['e1'], collected: { chest_1: 1 } });
    assert.deepEqual(afterSuccess, { events: [], collected: {} });

    const payloads = practicePayloads(requests);
    assert.equal(payloads.length, 4);
    assert.deepEqual(payloads[1], payloads[0], 'a retry resends the same run');
    assert.deepEqual(payloads[2], payloads[0], 'a retry resends the same run');
    assert.deepEqual(payloads[0].Collected, { chest_1: 1 });
    assert.deepEqual(payloads[0].GameEvents, ['e1']);
    assert.notEqual(payloads[3].RunId, payloads[0].RunId, 'the next run gets a new id');
    assert.match(payloads[3].RunId, UUID_V4);
    assert.deepEqual(payloads[3], { Score: 20, RunId: payloads[3].RunId });
  });

  test(`T9 [${name}] practice overrides are sent instead of the recorded data, which is cleared on success`, async () => {
    let after;
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1');
      ctx.sdk.RecordEvent_Client('recorded');
      await ctx.sdk.CompletePractice(5, { collected: { chest_9: 2 }, gameEvents: ['own'] });
      after = { events: ctx.sdk.GetCurrentSessionEvents_Client(), collected: ctx.sdk.GetCurrentSessionCollected_Client() };
      ctx.sdk.RecordCollected_Client('chest_2');
      await ctx.sdk.CompletePractice(6, { gameEvents: ['only-events'] });
    }, { routes: defaultRoutes() });

    const [first, second] = practicePayloads(requests);
    assert.deepEqual(first, { Score: 5, RunId: first.RunId, Collected: { chest_9: 2 }, GameEvents: ['own'] });
    assert.deepEqual(after, { events: [], collected: {} });
    assert.deepEqual(second, { Score: 6, RunId: second.RunId, Collected: { chest_2: 1 }, GameEvents: ['only-events'] });
  });

  test(`T9 [${name}] practice loads the user id when none is cached and keys on its first 8 digits`, async () => {
    const longId = 123456789;
    const routes = { ...defaultRoutes(), 'GET /User/get-full-data': json({ ...USER, UserId: longId }) };
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod));
      await ctx.sdk.Authentication(PLATFORM_TOKEN);
      await ctx.sdk.CompletePractice(7);
    }, { routes });

    assert.deepEqual(requests.map(r => new URL(r.url).pathname), ['/Auth/funtico-auth', '/User/get-full-data', '/User/complete-practice']);
    assert.equal(practiceAesKey(longId, PRIV).substring(0, 8), '12345678');
    assert.equal(practicePayloads(requests, longId)[0].Score, 7);
  });

  test(`T9 [${name}] practice rejects a score that does not fit a 32-bit integer before any request`, async () => {
    let before;
    let after;
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      before = ctx.requests.length;
      for (const score of [NaN, Infinity, -Infinity, 2 ** 31, -(2 ** 31) - 1, '100', undefined]) {
        await assert.rejects(ctx.sdk.CompletePractice(score), /32-bit integer/, `score ${String(score)}`);
      }
      after = ctx.requests.length;
      await ctx.sdk.CompletePractice(2 ** 31 - 0.5);
      await ctx.sdk.CompletePractice(-(2 ** 31));
    }, { routes: defaultRoutes() });

    assert.equal(after, before);
    assert.deepEqual(practicePayloads(requests).map(p => p.Score), [2 ** 31 - 1, -(2 ** 31)]);
  });

  test(`T9 [${name}] ghost matchData travels inside the signed report and is left out when empty`, async () => {
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      await ctx.sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Win, 'fh-1', '{"log":[1,2]}');
      await ctx.sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Loss, null, '');
      await ctx.sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Draw);
    }, { routes: defaultRoutes() });

    const sent = sentTo(requests, '/Ghost/report').map(r => JSON.parse(r.body));
    assert.deepEqual(sent.map(b => Object.keys(b)), Array(3).fill(['MatchId', 'EncryptedData', 'Hash']));
    const payloads = sent.map(b => JSON.parse(serverDecrypt(b.EncryptedData, payloadAesKey(GHOST_MATCH_ID, PRIV))));
    assert.deepEqual(payloads, [
      { MatchId: GHOST_MATCH_ID, Outcome: 'Win', FightHash: 'fh-1', MatchData: '{"log":[1,2]}' },
      { MatchId: GHOST_MATCH_ID, Outcome: 'Loss', FightHash: null },
      { MatchId: GHOST_MATCH_ID, Outcome: 'Draw', FightHash: null },
    ]);
  });

  test(`T9 [${name}] a ghost report refused as DataTooLarge rejects with that code`, async () => {
    const routes = { ...defaultRoutes(), 'POST /Ghost/report': json({ Error: 'DataTooLarge', Message: 'Too large' }, 400) };
    await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      await assert.rejects(ctx.sdk.ReportGhostResult(GHOST_MATCH_ID, mod.GhostOutcome.Win, null, 'x'.repeat(40000)),
        err => err instanceof mod.GhostError && err.Code === mod.GhostErrorCode.DataTooLarge && /Too large/.test(err.message));
    }, { routes });
  });
}
