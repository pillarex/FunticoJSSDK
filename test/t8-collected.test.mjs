// T8 - collected counts: what RecordCollected_Client puts on the wire and when the counts reset.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runScenario, json } from './helpers/harness.mjs';
import { importEsm, requireUmd } from './helpers/paths.mjs';
import { serverDecrypt, payloadAesKey } from './helpers/crypto-oracle.mjs';
import { defaultRoutes, config, PRIV, PLATFORM_TOKEN, USER_ID, ROOM_A, TOURNAMENT_ID } from './fixtures/wire.mjs';

const builds = [
  { name: 'esm', mod: await importEsm() },
  { name: 'umd', mod: requireUmd() },
];

const SESSION_ID = 'sess-9f3a2b1c-0000';
const SAVE_SCORE_ID = 'score-uuid-0001-aaaa';

function endRoomPayload(requests) {
  const sent = requests.filter(r => new URL(r.url).pathname === '/Rooms/end-room-sp');
  return sent.map(r => JSON.parse(serverDecrypt(JSON.parse(r.body).EncryptedData, payloadAesKey(SESSION_ID, PRIV))));
}

for (const { name, mod } of builds) {
  const impl = { name, mod };

  test(`T8 [${name}] counts are summed per key and sent with the room result`, async () => {
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1');
      ctx.sdk.RecordCollected_Client('chest_1', 2);
      ctx.sdk.RecordCollected_Client('chest_2');
      await ctx.sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 100, USER_ID, '10.0.0.1');
    }, { routes: defaultRoutes() });

    assert.deepEqual(endRoomPayload(requests)[0].Collected, { chest_1: 3, chest_2: 1 });
  });

  test(`T8 [${name}] the payload has no Collected field when nothing was collected`, async () => {
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      await ctx.sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 100, USER_ID, '10.0.0.1');
    }, { routes: defaultRoutes() });

    assert.deepEqual(endRoomPayload(requests)[0], { Score: 100, UserId: USER_ID, Ip: '10.0.0.1', GameEvents: [] });
  });

  test(`T8 [${name}] a lost tournament run still sends its counts, then they reset`, async () => {
    let after;
    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1', 2);
      await ctx.sdk.ResultTournament_Client(TOURNAMENT_ID, SAVE_SCORE_ID, 0, false);
      after = ctx.sdk.GetCurrentSessionCollected_Client();
    }, { routes: defaultRoutes() });

    const sent = requests.find(r => new URL(r.url).pathname === '/SpecialTournaments/result-tournament-client');
    const payload = JSON.parse(serverDecrypt(JSON.parse(sent.body).EncryptedData, payloadAesKey(SAVE_SCORE_ID, PRIV)));
    assert.equal(payload.IsSuccess, false);
    assert.deepEqual(payload.Collected, { chest_1: 2 });
    assert.deepEqual(after, {});
  });

  test(`T8 [${name}] a delivered result resets the counts, a failed one keeps them for the retry`, async () => {
    let afterFailure;
    let afterSuccess;
    let calls = 0;
    const routes = {
      ...defaultRoutes(),
      'POST /Rooms/end-room-sp': () => (++calls === 1 ? json({ Error: 'unavailable' }, 503) : json({ Success: true })),
    };

    const { requests } = await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1');
      await assert.rejects(ctx.sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 100, USER_ID, '10.0.0.1'));
      afterFailure = ctx.sdk.GetCurrentSessionCollected_Client();
      await ctx.sdk.EndRoomSP(ROOM_A.id, SESSION_ID, 100, USER_ID, '10.0.0.1');
      afterSuccess = ctx.sdk.GetCurrentSessionCollected_Client();
    }, { routes });

    assert.deepEqual(afterFailure, { chest_1: 1 });
    assert.deepEqual(afterSuccess, {});
    assert.deepEqual(endRoomPayload(requests).map(p => p.Collected), [{ chest_1: 1 }, { chest_1: 1 }]);
  });

  test(`T8 [${name}] creating a session starts the counts from zero`, async () => {
    let after;
    await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      ctx.sdk.RecordCollected_Client('chest_1');
      await ctx.sdk.CreateSession_Client('{}', mod.GameTypeEnum.Rooms, ROOM_A.id, SESSION_ID);
      after = ctx.sdk.GetCurrentSessionCollected_Client();
    }, { routes: defaultRoutes() });

    assert.deepEqual(after, {});
  });

  test(`T8 [${name}] invalid calls are ignored and the returned counts are a copy`, async () => {
    let copy;
    let after;
    await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(mod, { userToken: PLATFORM_TOKEN }));
      const consoleError = console.error;
      console.error = () => {};
      try {
        for (const [key, count] of [['', 1], ['chest_1', 0], ['chest_1', -2], ['chest_1', 1.5], ['chest_1', NaN]]) {
          ctx.sdk.RecordCollected_Client(key, count);
        }
      } finally {
        console.error = consoleError;
      }
      ctx.sdk.RecordCollected_Client('chest_1');
      copy = ctx.sdk.GetCurrentSessionCollected_Client();
      copy.chest_1 = 999;
      after = ctx.sdk.GetCurrentSessionCollected_Client();
    }, { routes: defaultRoutes() });

    assert.deepEqual(after, { chest_1: 1 });
  });
}
