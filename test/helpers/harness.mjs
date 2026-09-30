// Scenario harness: runs a scripted scenario against one SDK implementation with a recording
// fetch mock and deterministic randomness/time, and returns what happened on the wire (request
// log) and what the caller saw (trace of results/errors). Two implementations are behaviourally
// identical for a scenario when both logs are deepStrictEqual.
import assert from 'node:assert/strict';
import { importEsm, requireUmd } from './paths.mjs';
import { loadOracle } from './oracle.mjs';

/** Fixed wall clock for every scenario (Date.now), advanced only by ctx.advance(). */
export const BASE_TIME = Date.UTC(2026, 8, 29, 12, 0, 0);

// ---- responders -------------------------------------------------------------------------------

export function json(body, status = 200) {
  return { status, body: JSON.stringify(body), contentType: 'application/json' };
}

export function text(body, status = 200) {
  return { status, body, contentType: 'text/plain' };
}

/** Makes fetch itself reject, like a DNS/CORS/offline failure. */
export function networkError(message = 'mock network failure') {
  return { networkError: message };
}

// ---- implementations --------------------------------------------------------------------------

/** oracle = original TS compiled independently; esm/umd = the generated dist. */
export async function loadImpls() {
  return [
    { name: 'oracle', mod: await loadOracle() },
    { name: 'esm', mod: await importEsm() },
    { name: 'umd', mod: requireUmd() },
  ];
}

// ---- normalisation ----------------------------------------------------------------------------

/** Errors from different implementations are different classes; compare what a caller can observe. */
export function normalizeError(err, mod) {
  if (!(err instanceof Object)) return { thrown: err };
  return {
    name: err.name,
    message: err.message,
    ctor: err.constructor ? err.constructor.name : null,
    isError: err instanceof Error,
    isCampaignError: mod.CampaignError ? err instanceof mod.CampaignError : false,
    code: err.Code,
  };
}

/** Deep copy at the time of the step, so a later in-place mutation by the SDK cannot rewrite history. */
function snapshot(value) {
  return value === undefined ? undefined : structuredClone(value);
}

// ---- runner -----------------------------------------------------------------------------------

/**
 * @param impl     { name, mod }
 * @param run      async (ctx) => void
 * @param routes   { 'METHOD /path': responder | (req, state) => responder }
 * @param coverage optional Set collecting "Class.member" for every public member the scenario invoked
 */
export async function runScenario(impl, run, { routes = {}, coverage } = {}) {
  const mod = impl.mod;
  assert.ok(Object.prototype.hasOwnProperty.call(mod.FunticoSDK, '_instance'),
    `${impl.name}: FunticoSDK._instance must be reachable to reset the singleton`);
  mod.FunticoSDK._instance = null;

  const table = new Map(Object.entries(routes));
  const requests = [];
  const trace = [];
  const unrouted = [];
  const state = {};
  let now = BASE_TIME;
  let uuidSeq = 0;
  let randomSeq = 0;
  const webcrypto = globalThis.crypto;

  const saved = {
    fetch: globalThis.fetch,
    dateNow: Date.now,
    ownUuid: Object.getOwnPropertyDescriptor(webcrypto, 'randomUUID'),
    ownRandom: Object.getOwnPropertyDescriptor(webcrypto, 'getRandomValues'),
  };

  const deterministicUuid = () => `00000000-0000-4000-8000-${String(++uuidSeq).padStart(12, '0')}`;

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = (init.method ?? 'GET').toUpperCase();
    const headers = init.headers === undefined ? undefined
      : init.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : { ...init.headers };
    const body = init.body;
    requests.push({ method, url, headers, body });

    const parsed = new URL(url);
    const key = `${method} ${parsed.pathname}`;
    const responder = table.get(key);
    if (!responder) {
      unrouted.push(key);
      throw new TypeError(`no mock route for ${key}`);
    }
    let bodyJson;
    try { bodyJson = typeof body === 'string' ? JSON.parse(body) : undefined; } catch { bodyJson = undefined; }
    const spec = typeof responder === 'function'
      ? responder({ method, url: parsed, headers, body, json: bodyJson }, state)
      : responder;
    if (spec.networkError) throw new TypeError(spec.networkError);
    return new Response(spec.body, { status: spec.status, headers: { 'content-type': spec.contentType } });
  };
  Date.now = () => now;
  webcrypto.randomUUID = deterministicUuid;
  webcrypto.getRandomValues = arr => {
    for (let i = 0; i < arr.length; i++) arr[i] = (randomSeq++ * 37 + 11) & 0xff;
    return arr;
  };

  // Proxies record which public members a scenario calls (the coverage guard reads this).
  // Internal this.X() calls inside the SDK run on the real target and are NOT counted.
  const proxies = new WeakMap();
  const track = (cls, prop) => { if (coverage && typeof prop === 'string') coverage.add(`${cls}.${prop}`); };
  const wrapInstance = target => {
    if (!proxies.has(target)) {
      proxies.set(target, new Proxy(target, {
        get(t, prop) {
          const v = Reflect.get(t, prop, t);
          if (typeof v === 'function') { track('FunticoSDK', prop); return v.bind(t); }
          return v;
        },
      }));
    }
    return proxies.get(target);
  };
  const wrapClass = (name) => new Proxy(mod[name], {
    get(t, prop) {
      if (name === 'FunticoSDK' && prop === 'Instance') { track(name, prop); return wrapInstance(t.Instance); }
      const v = Reflect.get(t, prop, t);
      if (typeof v === 'function' && prop !== 'prototype') { track(name, prop); return v.bind(t); }
      return v;
    },
  });

  const ctx = {
    impl: impl.name,
    mod,
    state,
    requests,
    /** The current singleton, tracked (without counting the static Instance getter). */
    get sdk() { return wrapInstance(mod.FunticoSDK.Instance); },
    /** FunticoSDK class (static members tracked). */
    get SDK() { return wrapClass('FunticoSDK'); },
    /** Any exported class with tracked static members, e.g. cls('CryptoHelper'). */
    cls: wrapClass,
    /** Runs a step and records its value or its (normalised) error. Never throws. */
    async step(label, thunk) {
      try {
        const value = await thunk();
        trace.push({ step: label, value: snapshot(value) });
        return value;
      } catch (err) {
        trace.push({ step: label, error: normalizeError(err, mod) });
        return undefined;
      }
    },
    /** ctx.call('GetRooms', 0, 10) === step('GetRooms', () => sdk.GetRooms(0, 10)). */
    call(method, ...args) {
      return ctx.step(method, () => ctx.sdk[method](...args));
    },
    /** The error recorded by the last step, or undefined when it succeeded. */
    lastError() {
      return trace.length ? trace[trace.length - 1].error : undefined;
    },
    record(label, value) {
      trace.push({ step: label, value: snapshot(value) });
    },
    route(key, responder) {
      table.set(key, responder);
    },
    advance(ms) {
      now += ms;
    },
    resetSingleton() {
      mod.FunticoSDK._instance = null;
    },
    /** Replace crypto.randomUUID for the rest of the scenario (undefined = absent, like plain HTTP). */
    setRandomUUID(fn) {
      if (fn === undefined) webcrypto.randomUUID = undefined;
      else webcrypto.randomUUID = fn;
    },
    /** Asserts a spot check. Runs for every implementation, so it proves the path really executed. */
    check(condition, message) {
      assert.ok(condition, `[${impl.name}] ${message}`);
    },
    expectRequests(n, message = '') {
      assert.equal(requests.length, n, `[${impl.name}] request count ${message}`);
    },
    allowUnrouted: false,
  };

  try {
    await run(ctx);
  } finally {
    globalThis.fetch = saved.fetch;
    Date.now = saved.dateNow;
    restoreOwn(webcrypto, 'randomUUID', saved.ownUuid);
    restoreOwn(webcrypto, 'getRandomValues', saved.ownRandom);
    mod.FunticoSDK._instance = null;
  }

  if (unrouted.length > 0 && !ctx.allowUnrouted) {
    throw new Error(`[${impl.name}] requests without a mock route: ${unrouted.join(', ')}`);
  }
  return { requests, trace };
}

function restoreOwn(obj, key, descriptor) {
  if (descriptor) Object.defineProperty(obj, key, descriptor);
  else delete obj[key];
}
