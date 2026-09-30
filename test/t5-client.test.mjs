// T5 - FunticoClient, the framework-agnostic twin of FunticoPhaserPlugin.
//   - EVENTS keys/values equal FunticoPhaserPlugin.EVENTS read from the source AST.
//   - Differential against the ORIGINAL plugin (oracle, with a recording Phaser game.events):
//     every method makes the same requests, returns the same value and emits the same events
//     with the same payloads, in the same order.
//   - The deliberate differences: init() rejects instead of swallowing (and emits nothing), and
//     a throwing listener is isolated.
//   - Emitter semantics: on/once/off, context, chaining, snapshot dispatch, separate instances.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadImpls, runScenario, json, text } from './helpers/harness.mjs';
import { sourceFile, clientFile, staticEvents, methodNames } from './helpers/source-ast.mjs';
import { defaultRoutes, config, PUB, PRIV, PLATFORM_TOKEN, JWT, BALANCE } from './fixtures/wire.mjs';

const impls = await loadImpls();
const byName = Object.fromEntries(impls.map(i => [i.name, i]));
const dists = [byName.esm, byName.umd];

/** Captures console.error calls for the duration of fn. */
async function withConsoleError(fn) {
  const calls = [];
  const original = console.error;
  console.error = (...args) => calls.push(args);
  try {
    await fn(calls);
  } finally {
    console.error = original;
  }
  return calls;
}

// ---- event names ------------------------------------------------------------------------------

test('T5 EVENTS keys and values equal FunticoPhaserPlugin.EVENTS from the source', () => {
  const pluginEvents = staticEvents(sourceFile(), 'FunticoPhaserPlugin');
  assert.ok(Object.keys(pluginEvents).length >= 5);
  assert.deepEqual(staticEvents(clientFile(), 'FunticoClient'), pluginEvents, 'src/FunticoClient.ts');
  for (const { name, mod } of dists) {
    assert.deepEqual({ ...mod.FunticoClient.EVENTS }, pluginEvents, `${name} runtime EVENTS`);
  }
  assert.deepEqual({ ...byName.oracle.mod.FunticoPhaserPlugin.EVENTS }, pluginEvents, 'oracle plugin runtime EVENTS');
});

test('T5 FunticoClient offers every public method of FunticoPhaserPlugin', () => {
  const pluginMethods = methodNames(sourceFile(), 'FunticoPhaserPlugin');
  const clientMethods = methodNames(clientFile(), 'FunticoClient');
  const missing = pluginMethods.filter(m => !clientMethods.includes(m));
  assert.deepEqual(missing, [], `plugin methods missing on FunticoClient: ${missing}`);
  for (const { mod } of dists) {
    for (const m of pluginMethods) assert.equal(typeof mod.FunticoClient.prototype[m], 'function', m);
  }
});

// ---- differential against the original Phaser plugin -----------------------------------------

/** Builds the event-emitting wrapper for an implementation and a log of what it emitted. */
function makeWrapper(impl) {
  const events = [];
  if (impl.name === 'oracle') {
    const game = { events: { emit: (name, ...args) => { events.push([name, ...args.map(a => structuredClone(a))]); return true; } } };
    return { target: new impl.mod.FunticoPhaserPlugin({ game }), events };
  }
  const client = new impl.mod.FunticoClient();
  for (const name of Object.values(impl.mod.FunticoClient.EVENTS)) {
    client.on(name, (...args) => events.push([name, ...args.map(a => structuredClone(a))]));
  }
  return { target: client, events };
}

async function wrapperScenario(ctx) {
  const w = makeWrapper({ name: ctx.impl, mod: ctx.mod });
  const drain = label => ctx.record(`${label} events`, w.events.splice(0));
  const run = async (label, thunk) => { await ctx.step(label, thunk); drain(label); };

  ctx.record('wrapper.sdk is the singleton', w.target.sdk === ctx.mod.FunticoSDK.Instance);
  await run('init', () => w.target.init(config(ctx.mod, { userToken: PLATFORM_TOKEN })));
  await run('login', () => w.target.login(PLATFORM_TOKEN));
  await run('login bad token', () => w.target.login('bad-token'));
  await run('refreshUserData()', () => w.target.refreshUserData());
  await run('refreshUserData(true)', () => w.target.refreshUserData(true));
  await run('refreshBalance()', () => w.target.refreshBalance());
  await run('refreshBalance(true)', () => w.target.refreshBalance(true));
  await run('refreshCampaign()', () => w.target.refreshCampaign());
  await run('refreshCampaign(true)', () => w.target.refreshCampaign(true));
  await run('completeCampaignLevel without attempt', () => w.target.completeCampaignLevel({ score: 1 }));
  await ctx.step('StartCampaignLevel', () => w.target.sdk.StartCampaignLevel('level-0002'));
  await run('completeCampaignLevel', () => w.target.completeCampaignLevel({ score: 1500, deaths: 0, perfect: true }));
  ctx.route('GET /User/get-balance', text('boom', 500));
  await run('refreshBalance failing', () => w.target.refreshBalance());
  ctx.route('GET /User/get-full-data', text('boom', 500));
  await run('refreshUserData failing', () => w.target.refreshUserData());
  ctx.route('GET /Campaign/levels', json({ Error: 'CampaignNotAvailable', Message: 'off' }, 404));
  await run('refreshCampaign failing', () => w.target.refreshCampaign());

  ctx.resetSingleton();
  const w2 = makeWrapper({ name: ctx.impl, mod: ctx.mod });
  await ctx.step('init without token', () => w2.target.init(config(ctx.mod)));
  ctx.record('init without token events', w2.events.splice(0));
}

test('T5 FunticoClient and the original FunticoPhaserPlugin make the same calls and emit the same events', async () => {
  const out = {};
  for (const impl of impls) out[impl.name] = await runScenario(impl, wrapperScenario, { routes: defaultRoutes() });

  const initEvents = out.oracle.trace.find(t => t.step === 'init events').value;
  assert.deepEqual(initEvents.map(e => e[0]), ['funtico_initialized', 'funtico_authenticated']);
  assert.deepEqual(initEvents[1], ['funtico_authenticated', JWT]);
  const campaignEvents = out.oracle.trace.find(t => t.step === 'completeCampaignLevel events').value;
  assert.equal(campaignEvents[0][0], 'funtico_campaign_progress_updated');
  assert.equal(campaignEvents[0][1].IsWin, true, 'completion result is the payload');

  for (const name of ['esm', 'umd']) {
    assert.deepStrictEqual(out[name].requests, out.oracle.requests, `${name}: requests differ from the plugin`);
    assert.deepStrictEqual(out[name].trace, out.oracle.trace, `${name}: results/events differ from the plugin`);
  }
});

// ---- deliberate difference: init does not swallow ---------------------------------------------

test('T5 init() with an invalid config rejects with the validation error and emits nothing (the plugin swallows)', async () => {
  const concatenated = mod => config(mod, { privateGameKey: PUB + PRIV, userToken: PLATFORM_TOKEN });

  const pluginLog = await withConsoleError(async () => {
    await runScenario(byName.oracle, async (ctx) => {
      const w = makeWrapper(byName.oracle);
      await assert.doesNotReject(w.target.init(concatenated(ctx.mod)), 'the Phaser plugin resolves');
      assert.deepEqual(w.events, []);
      ctx.expectRequests(0);
    }, { routes: defaultRoutes() });
  });
  assert.equal(pluginLog.length, 1, 'the plugin logs the error instead');

  for (const impl of dists) {
    const log = await withConsoleError(async () => {
      await runScenario(impl, async (ctx) => {
        const w = makeWrapper(impl);
        await assert.rejects(w.target.init(concatenated(ctx.mod)), err =>
          err.constructor === Error && err.message.startsWith('Invalid FunticoConfig: ') && /concatenated/.test(err.message));
        await assert.rejects(w.target.init(undefined), /^Error: Invalid FunticoConfig: /);
        assert.deepEqual(w.events, [], `${impl.name}: nothing emitted`);
        ctx.expectRequests(0);

        // A failure after validation (auth rejected) also rejects and emits nothing.
        await assert.rejects(w.target.init(config(ctx.mod, { userToken: 'bad-token' })), /Funtico Authentication failed/);
        assert.deepEqual(w.events, []);
      }, { routes: defaultRoutes() });
    });
    assert.deepEqual(log, [], `${impl.name}: init must not log-and-swallow`);
  }
});

// ---- deliberate difference: listener isolation -----------------------------------------------

for (const impl of dists) {
  const { FunticoClient } = impl.mod;
  const { BALANCE_UPDATED, USER_DATA_UPDATED } = FunticoClient.EVENTS;

  test(`T5 [${impl.name}] a throwing listener is reported and isolated; the SDK call still resolves`, async () => {
    await runScenario(impl, async (ctx) => {
      await ctx.sdk.Initialize(config(ctx.mod, { userToken: PLATFORM_TOKEN }));
      const client = new FunticoClient();
      const seen = [];
      const boom = new Error('listener bug');
      client.on(BALANCE_UPDATED, b => seen.push(['first', b.Coins]));
      client.on(BALANCE_UPDATED, () => { throw boom; });
      client.on(BALANCE_UPDATED, b => seen.push(['third', b.Coins]));
      const log = await withConsoleError(async () => {
        const balance = await client.refreshBalance();
        assert.deepEqual(balance, BALANCE, 'the call resolves with the balance');
      });
      assert.deepEqual(seen, [['first', 1500], ['third', 1500]], 'order kept, later listeners still run');
      assert.equal(log.length, 1);
      assert.equal(log[0][0], `[FunticoClient] listener for "${BALANCE_UPDATED}" threw:`);
      assert.equal(log[0][1], boom);
    }, { routes: defaultRoutes() });
  });

  // ---- emitter semantics ----------------------------------------------------------------------
  // emit() is private in TypeScript; calling it directly keeps these tests about the emitter alone.

  test(`T5 [${impl.name}] on/once/off semantics, context, chaining and separate instances`, () => {
    const a = new FunticoClient();
    const b = new FunticoClient();
    assert.equal(a.sdk, impl.mod.FunticoSDK.Instance);
    assert.equal(a.sdk, b.sdk, 'instances share the singleton SDK');

    const calls = [];
    const fn = function (...args) { calls.push([this && this.tag, ...args]); };
    const ctxA = { tag: 'A' };
    const ctxB = { tag: 'B' };

    assert.equal(a.on('e', fn).on('e', fn, ctxA).once('e', fn, ctxB), a, 'chaining returns this');
    assert.equal(a.off('nothing-registered', fn), a);
    a.emit('e', 1, 2);
    assert.deepEqual(calls.splice(0), [[undefined, 1, 2], ['A', 1, 2], ['B', 1, 2]], 'registration order, context as this');
    a.emit('e', 3);
    assert.deepEqual(calls.splice(0), [[undefined, 3], ['A', 3]], 'once fired only once');

    b.emit('e', 4);
    assert.deepEqual(calls.splice(0), [], 'listeners are per instance');

    a.off('e', fn); // removes only the registration without a context
    a.emit('e', 5);
    assert.deepEqual(calls.splice(0), [['A', 5]]);
    a.off('e', fn, ctxB); // wrong context: no-op
    a.emit('e', 6);
    assert.deepEqual(calls.splice(0), [['A', 6]]);
    a.off('e', fn, ctxA);
    a.emit('e', 7);
    assert.deepEqual(calls.splice(0), []);

    a.on('e', fn).on('e', fn, ctxA).on('other', fn);
    assert.equal(a.off('e'), a, 'off(event) chains');
    a.emit('e', 8);
    a.emit('other', 9);
    assert.deepEqual(calls.splice(0), [[undefined, 9]], 'off(event) removed every listener of that event only');

    assert.throws(() => a.on('e', 'not a function'), TypeError);
    assert.throws(() => a.once('e', undefined), TypeError);
  });

  test(`T5 [${impl.name}] once is removed before invocation; dispatch uses a snapshot and is synchronous`, () => {
    const c = new FunticoClient();
    const calls = [];

    // A once listener that re-emits the same event must not fire again.
    const reentrant = () => { calls.push('once'); c.emit('r'); };
    c.once('r', reentrant);
    c.emit('r');
    assert.deepEqual(calls.splice(0), ['once']);

    // once + on with the same function: only the once registration goes.
    const fn = () => calls.push('fn');
    c.once('s', fn).on('s', fn);
    c.emit('s');
    c.emit('s');
    assert.deepEqual(calls.splice(0), ['fn', 'fn', 'fn']);

    // Snapshot: added during dispatch -> next dispatch; removed during dispatch -> still called this time.
    const late = () => calls.push('late');
    const second = () => calls.push('second');
    c.on('t', () => { calls.push('first'); c.on('t', late); c.off('t', second); });
    c.on('t', second);
    c.emit('t');
    assert.deepEqual(calls.splice(0), ['first', 'second']);
    c.emit('t');
    assert.deepEqual(calls.splice(0), ['first', 'late']);

    // Synchronous: listeners have run when emit returns.
    let ran = false;
    c.on('sync', () => { ran = true; });
    c.emit('sync');
    assert.equal(ran, true);

    // A once listener removed by an earlier listener in the same dispatch does not fire.
    const victim = () => calls.push('victim');
    c.on('u', () => c.off('u', victim));
    c.once('u', victim);
    c.emit('u');
    assert.deepEqual(calls.splice(0), []);
  });

  test(`T5 [${impl.name}] each method emits its event with the right payload at the right point`, async () => {
    await runScenario(impl, async (ctx) => {
      const client = new FunticoClient();
      const events = [];
      for (const name of Object.values(FunticoClient.EVENTS)) client.on(name, (...args) => events.push([name, ...args]));

      await client.init(config(ctx.mod, { userToken: PLATFORM_TOKEN }));
      assert.deepEqual(events.splice(0), [[FunticoClient.EVENTS.INITIALIZED], [FunticoClient.EVENTS.AUTHENTICATED, JWT]]);

      const loginResult = await client.login(PLATFORM_TOKEN);
      assert.equal(loginResult.Token, JWT);
      assert.deepEqual(events.splice(0), [[FunticoClient.EVENTS.AUTHENTICATED, JWT]]);

      const user = await client.refreshUserData();
      assert.equal(events.length, 1);
      assert.equal(events[0][0], USER_DATA_UPDATED);
      assert.equal(events.splice(0)[0][1], user, 'payload is the returned object');

      const balance = await client.refreshBalance(true);
      assert.deepEqual(events.splice(0), [[BALANCE_UPDATED, balance]]);

      const campaign = await client.refreshCampaign();
      assert.deepEqual(events.splice(0), [[FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, campaign]]);
      assert.ok(Array.isArray(campaign.Levels));

      await client.sdk.StartCampaignLevel('level-0001');
      const result = await client.completeCampaignLevel({ score: 900 });
      assert.deepEqual(events.splice(0), [[FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, result]]);
      assert.equal(result.Stars, 3);

      await assert.rejects(client.completeCampaignLevel({ score: 1 }), err => err instanceof ctx.mod.CampaignError);
      await assert.rejects(client.login('bad-token'));
      assert.deepEqual(events, [], 'failed calls emit nothing');

      ctx.resetSingleton(); // a client captures FunticoSDK.Instance at construction, so reset first
      const fresh = new FunticoClient();
      const freshEvents = [];
      fresh.on(FunticoClient.EVENTS.INITIALIZED, () => freshEvents.push('init'));
      fresh.on(FunticoClient.EVENTS.AUTHENTICATED, () => freshEvents.push('auth'));
      await fresh.init(config(ctx.mod));
      assert.deepEqual(freshEvents, ['init'], 'no AUTHENTICATED without a JWT');
    }, { routes: defaultRoutes() });
  });
}
