# Funtico JS SDK - Usage Guide

Complete reference for every public method and type in the Funtico JS SDK.

The Funtico JS SDK is the framework-agnostic build of the Funtico Games SDK. It runs in plain browser JavaScript, under any engine (PixiJS, Three.js, a custom canvas loop), inside Telegram Mini App webviews, and in Node >= 20. It is generated from the Phaser SDK's TypeScript source with only the Phaser plugin removed, so every class, method, model and backend quirk documented here behaves exactly as it does in the Phaser SDK. The one addition is [`FunticoClient`](#funticoclient-event-wrapper), a small engine-independent event wrapper that takes the place of `FunticoPhaserPlugin`.

For installation and a quick-start integration walkthrough, see [README.md](./README.md).

**Conventions used in this guide:**
- All examples are plain ES2020 JavaScript written as ES modules, with top-level `await`. They run as-is in a `<script type="module">`, in an `.mjs` file, or through a bundler. In a classic `<script>`, put code that uses `await` inside an `async` function.
- `funtico` is a `FunticoClient` instance, and `sdk` is its `sdk` property: `funtico.sdk`, which is always the `FunticoSDK.Instance` singleton. Examples use both names without declaring them again (see the snippet below).
- With the ES module build (`funtico-sdk.mjs`), names are imported: `import { FunticoClient, FunticoSDK, FunticoEnvironment, ... } from './funtico-sdk.mjs';`. With the classic script build (`<script src="funtico-sdk.js">`), the same names live on the global `FunticoSDK` namespace object: `FunticoSDK.FunticoClient`, `FunticoSDK.FunticoEnvironment`, `FunticoSDK.FunticoSDK.Instance`, and so on. In Node, `require('./funtico-sdk.js')` returns that same namespace object.
- **Signature** and **Definition** blocks are TypeScript. They are the contract, copied from the SDK's TypeScript source (`FunticoPhaserSDK.ts`) with the `public` keyword removed, so they show `async` and default parameter values. The bundled `.d.ts` / `.d.mts` declarations, which give editors autocompletion and type hints in plain JavaScript, carry the same types, but there `async` is dropped and a parameter with a default appears as optional (`useCache?: boolean`) without its default value; the defaults are shown only here. JavaScript callers simply leave the types out.
- Keys in examples are placeholders (`'your-public-key'`, `'your-private-key'`). Substitute the keys issued to your game by the Funtico Developer Portal.

```js
import { FunticoClient, FunticoSDK } from './funtico-sdk.mjs';

const funtico = new FunticoClient();  // event wrapper: funtico.on(...), funtico.init(...), ...
const sdk = funtico.sdk;              // the full SDK surface

console.log(sdk === FunticoSDK.Instance); // true
```

## Table of Contents

1. [Initialization & Authentication](#initialization--authentication)
   - [`FunticoConfig`](#funticoconfig)
   - [`FunticoEnvironment`](#funticoenvironment)
   - [`FunticoSDK.Instance`](#funticosdkinstance)
   - [`Initialize`](#initialize)
   - [`Authentication`](#authentication)
   - [`getPlatformToken`](#getplatformtoken)
   - [`getUserToken`](#getusertoken)
2. [User Data Methods](#user-data-methods)
   - [`GetUserData`](#getuserdata)
   - [`GetCachedUserData`](#getcacheduserdata)
   - [`GetBalance`](#getbalance)
   - [`GetCachedBalance`](#getcachedbalance)
   - [`GetVouchers`](#getvouchers)
   - [`GetCachedVouchers`](#getcachedvouchers)
   - [`CanAfford`](#canafford)
   - [`CanAffordFromCache`](#canaffordfromcache)
3. [Rooms & Tournament Methods](#rooms--tournament-methods)
   - [`GetTiers`](#gettiers)
   - [`GetRooms`](#getrooms)
   - [`GetRoom`](#getroom)
   - [`GetRoomPublic`](#getroompublic)
   - [`GetPrizePoolDistribution`](#getprizepooldistribution)
   - [`GetTierByEventId`](#gettierbyeventid)
   - [`GetRoomSettings`](#getroomsettings)
   - [`GetPrePaid`](#getprepaid)
   - [`GetHistory`](#gethistory)
   - [`GetRoomHistoryDetails`](#getroomhistorydetails)
   - [`GetLeaderboard`](#getleaderboard)
   - [`JoinRoom`](#joinroom)
   - [`StartRoomSP`](#startroomsp)
   - [`EndRoomSP`](#endroomsp)
4. [Special Tournaments Methods](#special-tournaments-methods)
   - [`TournamentsFilterEnum`](#tournamentsfilterenum)
   - [`GetTournaments`](#gettournaments)
   - [`GetTournamentDetailsLight`](#gettournamentdetailslight)
   - [`GetTournamentLeaderboard`](#gettournamentleaderboard)
   - [`GetTournamentCommunities`](#gettournamentcommunities)
   - [`JoinTournament`](#jointournament)
   - [`EnterTournament`](#entertournament)
   - [`GetPrizes`](#getprizes)
   - [`GetTournamentsHistory`](#gettournamentshistory)
   - [`ResultTournament_Server`](#resulttournament_server)
   - [`ResultTournament_Client`](#resulttournament_client)
5. [Hall of Fame Methods](#hall-of-fame-methods)
   - [`GetHallOfFame`](#gethalloffame)
   - [`GetHallOfFameDistribution`](#gethalloffamedistribution)
6. [Campaign Methods](#campaign-methods)
   - [`GetCampaignAvailability`](#getcampaignavailability)
   - [`GetCachedCampaignAvailability`](#getcachedcampaignavailability)
   - [`IsCampaignAvailable`](#iscampaignavailable)
   - [`GetCampaignLevels`](#getcampaignlevels)
   - [`GetCachedCampaignLevels`](#getcachedcampaignlevels)
   - [`GetCampaignLevelConfig`](#getcampaignlevelconfig)
   - [`StartCampaignLevel`](#startcampaignlevel)
   - [`GetActiveCampaignAttempt`](#getactivecampaignattempt)
   - [`AbandonCampaignAttempt`](#abandoncampaignattempt)
   - [`CompleteCampaignLevel`](#completecampaignlevel)
   - [`CampaignError`](#campaignerror)
7. [Client Session Methods (Reconnection)](#client-session-methods-reconnection)
   - [`UserHasUnfinishedSession_Client`](#userhasunfinishedsession_client)
   - [`ReconnectToUnfinishedSession_Client`](#reconnecttounfinishedsession_client)
   - [`CreateSession_Client`](#createsession_client)
   - [`UpdateSession_Client`](#updatesession_client)
   - [`CloseCurrentSession_Client`](#closecurrentsession_client)
   - [`RecordEvent_Client`](#recordevent_client)
   - [`GetCurrentSessionEvents_Client`](#getcurrentsessionevents_client)
8. [Dedicated Server Methods](#dedicated-server-methods)
   - [`CreateSession_Server`](#createsession_server)
   - [`UserLeaveSession_Server`](#userleavesession_server)
   - [`CloseCurrentSession_Server`](#closecurrentsession_server)
   - [`FinishRoomSession_Server`](#finishroomsession_server)
   - [`RecordEvent_Server`](#recordevent_server)
   - [`GetCurrentSessionEvents_Server`](#getcurrentsessionevents_server)
9. [FunticoClient (Event Wrapper)](#funticoclient-event-wrapper)
   - [`constructor`](#constructor)
   - [`sdk`](#sdk)
   - [`on`](#on)
   - [`once`](#once)
   - [`off`](#off)
   - [`init`](#init)
   - [`login`](#login)
   - [`refreshUserData`](#refreshuserdata)
   - [`refreshBalance`](#refreshbalance)
   - [`refreshCampaign`](#refreshcampaign)
   - [`completeCampaignLevel`](#completecampaignlevel-1)
   - [`EVENTS`](#events)
   - [Differences from the Phaser plugin](#differences-from-the-phaser-plugin)
10. [Utilities & Types](#utilities--types)
    - [`CryptoHelper.encrypt`](#cryptohelperencrypt)
    - [`CryptoHelper.decrypt`](#cryptohelperdecrypt)
    - [`CryptoHelper.hmacSha256`](#cryptohelperhmacsha256)
    - [`PrizeUtils.calculatePrize`](#prizeutilscalculateprize)

---

## Initialization & Authentication

Every SDK call is made through a single shared `FunticoSDK` instance. A game boots by obtaining that instance (directly as `FunticoSDK.Instance`, or through a `FunticoClient` as `funtico.sdk`), calling `Initialize` once with its game keys (directly, or through `funtico.init`, which also emits events), and letting the SDK exchange the player's platform token for a JWT that authorises every subsequent request.

---

### `FunticoConfig`

The configuration object passed to `Initialize`. It carries the environment selection, the two game keys issued by the Funtico Developer Portal, and optional overrides for the API endpoint and cache lifetime. In JavaScript it is an ordinary object literal; the interface below describes its shape.

**Definition:**
```ts
export interface FunticoConfig {
  env: FunticoEnvironment;
  privateGameKey: string;     // Secret key (obtained from dashboard)
  publicGameKey: string;      // X-User-Key (public key)
  userToken?: string;          // Initial user platform token
  apiBaseUrl?: string;         // Custom URL for your game's API
  funticoApiBaseUrl?: string;  // Custom URL for the Funtico platform API
  cacheTTL?: number;           // Cache lifetime in milliseconds (default: 30000ms)
}
```

**FunticoConfig Properties:**
- `env` (`FunticoEnvironment`) - Which Funtico backend the SDK talks to. It selects **two** default hosts (see the `FunticoEnvironment` block below): the game API host, unless `apiBaseUrl` is set, and, separately, the Funtico platform host, unless `funticoApiBaseUrl` is set. `GetLeaderboard` sends the player's platform token (`userToken`) to that platform host, so `env` still matters when only `apiBaseUrl` is supplied.
- `privateGameKey` (`string`) - Your game's secret key from the Funtico Developer Portal. Used to sign and encrypt payloads. Client-side sessions, score submission and campaign completion need it in the client build, so in a browser or Mini App it works as a signing key that a determined player can extract, not a true secret: keep it out of source control and logs, and rotate it in the Developer Portal if it leaks. It stays truly secret only when the SDK runs on a trusted server. Pass the secret key **alone**, never combined with the public key: `Initialize` rejects a key shorter than 8 characters, a key with surrounding whitespace, and a key that equals, contains or is contained in `publicGameKey` (see **Throws** under `Initialize`).
- `publicGameKey` (`string`) - Your game's public key from the Funtico Developer Portal, sent with every request. Must be a non-empty string without surrounding whitespace.
- `userToken` (`string`, optional) - The player's platform token issued by the Funtico platform (in a web/Telegram Mini App build this usually arrives as a query parameter). When present, `Initialize` authenticates with it automatically and pre-warms the caches. When omitted, `Initialize` only resolves the base URLs, and on a first `Initialize` you must call `Authentication` (or `funtico.login`) yourself before any authenticated method. `Initialize` never clears a JWT obtained earlier, so re-initializing without `userToken` keeps a previous sign-in (see `Initialize`).
- `apiBaseUrl` (`string`, optional) - Explicit base URL for the game API gateway, without a trailing slash. When set, it overrides the environment-derived **game API** host only. Use it to point the SDK at your own gateway, a regional deployment, or a local backend during development. Every game API request is built as `${apiBaseUrl}/<path>` (for example `${apiBaseUrl}/Rooms/get-room`); the `GetLeaderboard` name/avatar lookup is the exception and goes to the platform host (`funticoApiBaseUrl`, otherwise chosen by `env`).
  > **Warning:** `apiBaseUrl` does not change the platform host. If you point it at a local or staging gateway and leave `env` at `PROD` (or mistype it), `GetLeaderboard` still sends the player's platform token to production `https://api.funtico.com`. Set `env` to match, or also set `funticoApiBaseUrl`.
- `funticoApiBaseUrl` (`string`, optional) - Explicit base URL for the Funtico **platform** API, without a trailing slash. This is a **different host** from `apiBaseUrl`: `apiBaseUrl` is your game's Rooms API and takes the game JWT, while this one is the platform itself and takes the player's platform token (`userToken`). `GetLeaderboard` calls it to resolve player names, avatars and borders. Like `apiBaseUrl`, when set it completely overrides the environment-derived URL; otherwise `env` selects it — `staging` → `https://staging.api.funtico.com`, `prod` → `https://api.funtico.com`.
- `cacheTTL` (`number`, optional) - Lifetime in milliseconds of the shared client-side cache backing `GetUserData`, `GetBalance` and `GetVouchers` (the Campaign getters `GetCampaignAvailability` and `GetCampaignLevels` share the same window — see [User Data Methods](#user-data-methods)). While the cache is fresh, calls made with `useCache = true` return the stored copy with no network round-trip; once the window elapses, the next cached call refetches. Falsy values (including `0`) fall back to the default. Default: `30000` (30 seconds).

**Usage:**
```js
import { FunticoEnvironment } from './funtico-sdk.mjs';

// Optional JSDoc annotation: editors read the bundled declarations and check the object for you.
/** @type {import('./funtico-sdk.mjs').FunticoConfig} */
const config = {
  env: FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-private-key',
  userToken: new URLSearchParams(window.location.search).get('token') ?? undefined,
  cacheTTL: 60000 // keep profile/balance/vouchers warm for a minute
};
```

---

### `FunticoEnvironment`

Selects which Funtico deployment `Initialize` targets for each host whose override is not given: the game API host when `apiBaseUrl` is absent, and the platform API host when `funticoApiBaseUrl` is absent. At runtime it is a plain object whose members are strings: `FunticoEnvironment.STAGING === 'staging'`.

**Definition:**
```ts
export enum FunticoEnvironment {
  STAGING = 'staging',
  PROD = 'prod'
}
```

**FunticoEnvironment Properties:**
- `STAGING` (`'staging'`) - Development and QA backend. Resolves to `https://funtico-sdk-staging.azurewebsites.net` (platform API: `https://staging.api.funtico.com`). Use it while integrating: test accounts, test balances, and rooms/tournaments configured for QA live here.
- `PROD` (`'prod'`) - Live production backend serving real players. Resolves to `https://funtico-sdk.azurewebsites.net` (platform API: `https://api.funtico.com`). Real currency balances, real tickets, and real prize distribution.

> **Plain JavaScript gotcha:** `Initialize` only tests `config.env === FunticoEnvironment.STAGING`. **Every other value** — a typo such as `'stage'`, different casing such as `'Staging'`, or a missing `env` — silently selects the **production** hosts (unless both URL overrides are supplied). `env` is not covered by the config validation described under `Initialize`, and JavaScript has no compile-time check, so always use the enum members rather than string literals.

**Usage:**
```js
import { FunticoEnvironment } from './funtico-sdk.mjs';

// Pick the backend at deploy time, e.g. from an attribute your host page sets:
// <html data-funtico-env="prod">. A bundler build flag works just as well.
const env = document.documentElement.dataset.funticoEnv === 'prod'
  ? FunticoEnvironment.PROD
  : FunticoEnvironment.STAGING;
```

---

### `FunticoSDK.Instance`

Static getter returning the process-wide singleton `FunticoSDK`. The constructor is private, so this is the only supported way to obtain the SDK directly; the first access lazily creates the instance and every later access returns the same object.

With the classic `<script src="funtico-sdk.js">` build, the class lives on the global namespace object, which is also named `FunticoSDK` — so the singleton is `FunticoSDK.FunticoSDK.Instance` (namespace, class, getter).

**Signature:**
```ts
static get Instance(): FunticoSDK
```

**Returns:** `FunticoSDK` - The shared SDK instance. It holds the configuration, the JWT obtained at authentication, the user/balance/voucher caches, and the active client and server session state — which is exactly why it must be a singleton: a second instance would not see the session your game already started.

> **Plain JavaScript gotcha:** the constructor is `private` only in the TypeScript declarations; JavaScript has no access modifiers at runtime, so `new FunticoSDK()` does run — and returns a second, unconfigured instance that shares nothing with the singleton (no JWT, no caches, no tracked session). Always go through `FunticoSDK.Instance` (or `funtico.sdk`).

**Usage:**
```js
import { FunticoSDK, FunticoClient } from './funtico-sdk.mjs';

// Anywhere in your code (services, stores, network layer)
const sdk = FunticoSDK.Instance;
const user = sdk.GetCachedUserData();

// FunticoClient wraps this very same instance:
const funtico = new FunticoClient();
console.log(funtico.sdk === FunticoSDK.Instance); // true
```

With the classic `<script>` build:
```html
<script src="funtico-sdk.js"></script>
<script>
  // Namespace . class . getter — the global namespace object is named FunticoSDK too.
  const sdk = FunticoSDK.FunticoSDK.Instance;
  const funtico = new FunticoSDK.FunticoClient();
  console.log(funtico.sdk === sdk); // true

  // Destructuring works, but give the class a different local name:
  // `const { FunticoSDK } = FunticoSDK;` in a classic script throws
  // "ReferenceError: Cannot access 'FunticoSDK' before initialization".
  const { FunticoSDK: FunticoSDKClass, FunticoEnvironment } = FunticoSDK;
</script>
```

---

### `Initialize`

Configures the SDK and, when a `userToken` is supplied, signs the player in and pre-loads their profile, balance and vouchers. Call it once at boot before any other SDK method.

**Signature:**
```ts
async Initialize(config: FunticoConfig): Promise<void>
```

**Parameters:**
- `config` - The `FunticoConfig` object described above: environment, game keys, and optional platform token, API URL override and cache TTL.

**Returns:** `Promise<void>` - Resolves once the base URL is resolved and — if `config.userToken` was supplied — authentication has completed and the cache pre-warm has settled. Rejects if `config` fails validation or authentication fails (see **Throws**).

**What it does, in order:**
1. Validates `config` against the rules listed under **Throws** below. This happens before anything else: if a rule fails, the promise rejects, nothing is stored and no request is sent.
2. Stores `config` on the instance, so `publicGameKey`, `privateGameKey` and `cacheTTL` are available to every later call.
3. Resolves the API base URL: `config.apiBaseUrl` if provided, otherwise `https://funtico-sdk-staging.azurewebsites.net` for `FunticoEnvironment.STAGING` or `https://funtico-sdk.azurewebsites.net` for `FunticoEnvironment.PROD`.
4. Resolves the Funtico **platform** base URL separately: `config.funticoApiBaseUrl` if provided, otherwise `https://staging.api.funtico.com` for `STAGING` or `https://api.funtico.com` for `PROD`. This is the host `GetLeaderboard` reads player names and avatars from; it is not the same host as the one in step 3.
5. If `config.userToken` is set, awaits `Authentication(config.userToken)` to exchange the platform token for the game JWT.
6. Warms the caches by awaiting `Promise.allSettled([GetUserData(false), GetBalance(false), GetVouchers(false)])`. All three run concurrently with `useCache = false`, so they hit the network in parallel rather than in sequence. Because it is `allSettled` and not `all`, a failure in any one of the three does **not** reject `Initialize` — the other two still populate their caches, and the failed one simply leaves its cache empty until the next call. `GetCachedUserData()`, `GetCachedBalance()` and `GetCachedVouchers()` return `null` for whatever did not load.

If `config.userToken` is omitted, steps 5 and 6 are skipped entirely. On a first `Initialize` the SDK is then configured but unauthenticated, and authenticated methods will throw `"SDK is not authenticated. Call Initialize() or Authentication() first."` until `Authentication` is called. `Initialize` never clears state from an earlier sign-in: the SDK is a singleton, so re-initializing without `userToken` (even through a new `FunticoClient`) keeps the previously obtained JWT and the cached user data, balance and vouchers. It is not a sign-out, and `funtico.init()` then still emits `AUTHENTICATED` with that old JWT. Authentication failure inside step 5 propagates out of `Initialize` as a rejected promise, so wrap the call in `try/catch`. Unlike a validation failure, a failed authentication happens *after* steps 2-4, so the new config and base URLs are already in place when it rejects.

[`funtico.init(config)`](#init) calls this same method and does **not** swallow either failure: it rejects with the very same error and emits no event. This is a deliberate difference from the Phaser SDK's `FunticoPhaserPlugin.init`, which logs the error and resolves — defeating fail-fast. On success `funtico.init` emits `INITIALIZED`, then `AUTHENTICATED` (with the JWT) if one was obtained.

**Throws:**

`Initialize` is `async`, so every failure — including a validation failure — arrives as a **rejected promise**, never as a synchronous throw. Always `await` it inside `try/catch` (or attach `.catch`).

- `Error("Invalid FunticoConfig: ...")` - The config breaks one of the rules below. The message always starts with the prefix `Invalid FunticoConfig: `, followed by what is wrong and how to fix it. The check runs first, before any request, and a rejected call leaves the singleton's previous state **completely untouched** (config, JWT, caches, resolved URLs, tracked sessions) — a game that was already initialized keeps working with its old configuration. The message never contains either key's value (at most a length), so it is safe to log or forward to an error tracker such as Sentry.
- `Error("Funtico Authentication failed: <body>")` - `config.userToken` was supplied and the token exchange failed (see `Authentication`).
- A network error from `fetch` (typically a `TypeError`) if the API host cannot be reached during authentication. Failures during the cache warm-up (step 6) never reject.

| # | Rejected when | Why the rule exists |
|---|---|---|
| 1 | `config` is missing or not an object | There is nothing to read the keys from. |
| 2 | `publicGameKey` is missing, not a string, or empty | It is sent as `X-User-Key` on every request; without it every call fails. |
| 3 | `privateGameKey` is missing, not a string, or empty | It encrypts and signs every score/result payload. |
| 4 | Either key has leading or trailing whitespace (`key !== key.trim()`) | Issued keys never contain surrounding whitespace, so it is always an accident — typically a stray newline or `\r` from a `.env` file (Windows line endings) or a copy-paste. In `privateGameKey` it silently breaks every encrypted and signed payload; in `publicGameKey` it breaks the server-authenticated calls that send `X-Server-Key` (`ResultTournament_Server`); `fetch` strips surrounding whitespace from the `X-User-Key` header, so ordinary requests could still appear to work. It is rejected for both keys to surface a broken `.env` early. |
| 5 | `privateGameKey` is shorter than 8 characters | Encrypted payloads (score submission, tournament result, campaign completion) need a secret key of at least 8 characters, so a shorter key can never work. |
| 6 | `privateGameKey === publicGameKey` | The public key was pasted into both fields. |
| 7 | `privateGameKey` contains `publicGameKey`, or `publicGameKey` contains `privateGameKey` | The keys were concatenated or pasted into one field. With `privateGameKey` set to the public key followed by the secret key, the payloads are encrypted with the wrong key and `/Rooms/end-room-sp` fails with HTTP 500 "Padding is invalid and cannot be removed" — at score submission, after the player has already paid the entry fee. The error message says the keys look concatenated and tells you to pass **only** the secret key from the Developer Portal in `privateGameKey`. |

Validation deliberately checks nothing else: there are no GUID, character-set or exact-length rules. Public keys are GUIDs on older games but URL-safe base64 (which may contain `-` and `_`) on newer ones, and secret key formats vary, so any stricter rule could reject a legitimately issued key. A config that passes can therefore still be wrong — keys from another game or environment, for example. A wrong public key surfaces as `Funtico Authentication failed: ...`; a wrong private key surfaces as the padding HTTP 500 above. `env` is not validated either (see `FunticoEnvironment`).

**Usage:**
```js
// boot.js — loaded with <script type="module" src="boot.js">
import { FunticoClient, FunticoEnvironment } from './funtico-sdk.mjs';

const funtico = new FunticoClient();
const sdk = funtico.sdk;

const platformToken = new URLSearchParams(window.location.search).get('token') ?? '';

await sdk.Initialize({
  env: FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-private-key',
  userToken: platformToken
});

// Caches are warm — this is instant, no network call.
const user = sdk.GetCachedUserData();
console.log(`Welcome, ${user?.Name} (level ${user?.Level})`);

document.querySelector('#menu').hidden = false;
```

```js
// Node >= 20 (server-side tool) — no player token, so no automatic authentication
import { FunticoSDK, FunticoEnvironment } from './funtico-sdk.mjs';

await FunticoSDK.Instance.Initialize({
  env: FunticoEnvironment.PROD,
  publicGameKey: process.env.FUNTICO_PUBLIC_KEY,
  privateGameKey: process.env.FUNTICO_PRIVATE_KEY
});
// An unset variable arrives as undefined and is rejected with "Invalid FunticoConfig: ..."
// before any request, as is a trailing "\r" left by a .env file with Windows line endings.
```

```js
// Telling a configuration bug apart from a runtime failure
import { FunticoSDK, FunticoEnvironment } from './funtico-sdk.mjs';

async function initFuntico(config) {
  try {
    await FunticoSDK.Instance.Initialize(config);
    return true;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Invalid FunticoConfig: ')) {
      // An integration bug, not a transient failure: retrying cannot help.
      // Safe to log as-is: the message never contains the key values.
      console.error(err.message);
    } else {
      // Authentication or network failure: the platform token may be stale; retry or re-login.
      console.error('Funtico sign-in failed:', err);
    }
    return false;
  }
}

// A common mistake: both keys pasted into privateGameKey.
// Rejected here, before any request, instead of an HTTP 500 at score submission.
await initFuntico({
  env: FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-public-key' + 'your-private-key' // WRONG: pass only the secret key
});
```

---

### `Authentication`

Exchanges a Funtico platform token for the game's JWT and stores it on the SDK for all later authenticated requests. `Initialize` calls this for you when `config.userToken` is set; call it directly to sign in later or to swap in a refreshed platform token. [`funtico.login(platformToken)`](#login) is the same call followed by an `AUTHENTICATED` event.

**Signature:**
```ts
async Authentication(platformToken: string): Promise<any>
```

**Parameters:**
- `platformToken` - The player's platform token issued by the Funtico platform. Sent as `{ "Token": platformToken }` in the body of `POST /Auth/funtico-auth`, alongside your `publicGameKey` in the `X-User-Key` header.

**Returns:** `Promise<any>` - The parsed JSON login response from the backend. Its `Token` field is captured internally as the JWT and afterwards returned by `getUserToken()`. Rejects with `Funtico Authentication failed: <body>` if the backend responds with a non-OK status (an invalid or expired platform token, or an unrecognised public key).

**Login response Properties:**
- `Token` (`string`) - The freshly minted game JWT. The SDK stores it and sends it as `Authorization: Bearer <token>` on every authenticated call, so you rarely need to read it off the response — use `getUserToken()` instead.
- `Id` (`number`) - The player's SDK-side identifier. This is the same value as `UserData.UserId`, and the one that `EndRoomSP` expects.
- `PlatformId` (`number`) - The player's Funtico platform identifier. Same value as `UserData.PlatformId`.

A successful `Authentication` also brings the player's TICO balance and country up to date, and the avatar and final/semi-final ticket counts when the platform provides them. The first ever login takes the display name from the platform username; after that, the display name, KYC flag and private-ticket count are refreshed by `GetUserData` (`GET /User/get-full-data`), not by login.

**Important Notes:**
- Call it only after `Initialize`: it reads `publicGameKey` and the resolved base URL from the stored config. Called on a never-initialized SDK it rejects with a `TypeError` before sending anything.
- It updates the JWT only. `getPlatformToken()` keeps returning the `userToken` passed to `Initialize`, and that is the token `GetLeaderboard` sends to the platform API for player names and avatars. To replace the platform token everywhere, call `Initialize` again with the new `userToken`.

**Usage:**
```js
// Re-authenticate after the host app hands the game a refreshed platform token
async function onPlatformTokenRefreshed(newPlatformToken) {
  try {
    const login = await sdk.Authentication(newPlatformToken);
    console.log(`Signed in as platform user ${login.PlatformId}`);

    // The old caches predate the new session — force a refresh.
    await sdk.GetUserData(false);
    await sdk.GetBalance(false);
  } catch (err) {
    console.error('Funtico sign-in failed:', err);
    document.querySelector('#error-screen').hidden = false;
  }
}
```

---

### `getPlatformToken`

Returns the platform token the SDK was configured with. Useful when your game needs to forward the player's platform identity to your own services.

**Signature:**
```ts
getPlatformToken(): string
```

**Returns:** `string` - The value of `FunticoConfig.userToken` supplied to `Initialize`, or an empty string if none was supplied. A later `Authentication(token)` / `funtico.login(token)` does not change it. It reads the stored config, so call it only after `Initialize` (on a never-initialized SDK it throws a `TypeError`).

**Usage:**
```js
const platformToken = sdk.getPlatformToken();

if (!platformToken) {
  console.warn('Running without a platform token — guest mode.');
}
```

---

### `getUserToken`

Returns the game JWT obtained at authentication. Doubles as the "am I signed in?" check, since it is empty until `Authentication` succeeds.

**Signature:**
```ts
getUserToken(): string
```

**Returns:** `string` - The JWT captured from the login response, or an empty string if the SDK has not authenticated yet. This is *not* the platform token: it is issued by the game backend, scoped to your game, and is what the SDK puts in the `Authorization: Bearer` header. Pass it to your own backend if that backend needs to validate the same session.

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

// Gate the menu on a real session
function openMenu() {
  if (!sdk.getUserToken()) {
    document.querySelector('#login').hidden = false;
    return;
  }
  document.querySelector('#menu').hidden = false;
}

// FunticoClient emits this token on its AUTHENTICATED event
funtico.on(FunticoClient.EVENTS.AUTHENTICATED, (jwt) => {
  console.log('Funtico session established:', jwt.slice(0, 12) + '…');
});
```

---

## User Data Methods

These methods expose the authenticated player's profile, balance, and vouchers. Most of them read through a shared in-memory cache so that UI code can poll them cheaply without hammering the API; `CanAfford` is the exception and deliberately bypasses it.

**Caching model.** The SDK keeps three separate cache slots (user data, balance, vouchers) and a single shared expiry timestamp, `cacheExpiresAt`. The window length comes from `FunticoConfig.cacheTTL` (milliseconds, default `30000`). The `useCache = true` overload of `GetUserData`, `GetBalance`, and `GetVouchers` returns the cached value only when that slot has been filled **and** `Date.now()` is still below `cacheExpiresAt`; otherwise it performs a fresh request and refills the slot. Passing `useCache = false` always goes to the network and refreshes that slot.

The expiry timestamp is shared, and **any** of the three re-arms it when it fetches: a refresh of one slot extends the window that the other two are checked against. So a slot can outlive its own TTL if a sibling keeps refreshing — e.g. `GetRooms` force-refreshes vouchers on every call, which also slides the window for a `GetUserData` copy that has not been refetched. Treat `cacheTTL` as "how long after the *last fetch of anything* the caches stay valid", not as a per-slot age limit. If you need a guaranteed-fresh value, pass `useCache = false` rather than relying on the window to have lapsed. The same timestamp is also checked and re-armed by the two Campaign getters, `GetCampaignAvailability` and `GetCampaignLevels` (see [Campaign Methods](#campaign-methods)), so a campaign fetch slides the window for these three slots as well.

`Initialize()` pre-warms all three slots with `useCache = false` when a `userToken` is supplied in the config, so cached getters are usually populated by the time your first screen renders.

The `GetCachedX()` variants never touch the network and never inspect the expiry timestamp — they return whatever is currently in the slot, or `null` if nothing has been cached yet.

**EntryFeeType Properties:**
- `IC` (`1`) - In-game currency (Coins). Checked against `BalanceResponse.Coins`.
- `Tico` (`2`) - Premium platform currency (TICO / Diamonds). Checked against `BalanceResponse.Diamonds`.
- `SemifinalsTickets` (`3`) - Semi-final tickets. Checked against `BalanceResponse.SemiFinalTickets`.
- `FinalTickets` (`4`) - Final tickets. Checked against `BalanceResponse.FinalTickets`.
- `Free` (`5`) - Free room. The affordability check short-circuits to `true` for this type without reading any balance field.
- `InventoryItem` (`6`) - Entry requires a special inventory item. Not covered by the balance-based affordability check, which returns `false` for this type.
- `PrivateTickets` (`7`) - Private room tickets. Checked against `BalanceResponse.PrivateTickets`.

**RoomTier Properties:**
- `Contender` (`0`) - Entry-level tier.
- `Challenger` (`1`) - Mid tier.
- `Champion` (`2`) - Top tier.
- `Free` (`3`) - Free-entry tier. Note this is a *tier*, not a fee type: it is unrelated to `EntryFeeType.Free` (`5`), and a room's `IsFree` flag is derived from its ticket rather than from this tier. `EntryFeeUSDT` is `0` for it, since no tier band is defined.

---

### `GetUserData`

Gets the full player profile: display name, identifiers, progression, currency balances, and client preferences. Call this at boot to populate the profile HUD, and again with `useCache = false` whenever the profile may have changed server-side.

**Signature:**
```ts
async GetUserData(useCache = true): Promise<UserData>
```

**Parameters:**
- `useCache` - When `true`, returns the cached profile if one exists and the TTL window has not expired. When `false`, always issues a `GET /User/get-full-data` request and refreshes the cache and the shared TTL window. Default: `true`.

**Returns:** `Promise<UserData>` - The player's profile. Rejects if the SDK is not authenticated or the request fails.

**UserData Properties:**
- `Name` (`string`) - Player display name.
- `UserId` (`number`) - The player's SDK-side identifier (not the platform id). This is the value passed as `userId` to `EndRoomSP` and `ResultTournament_Server`.
- `PlatformId` (`number`) - The player's identifier on the Funtico platform. Match leaderboard rows against this value — `LeaderboardItemViewModel.UserId` and `TournamentPlayerViewModel.FunticoId` are platform ids.
- `Level` (`number`) - Current player level.
- `Rating` (`number`) - Current player rating.
- `Experience` (`number`) - Experience points accumulated at the current level.
- `ExperienceToLevel` (`number`) - Experience points needed to reach the next level.
- `Coins` (`number`) - In-game currency (IC) balance.
- `Diamonds` (`number`) - Premium platform currency (TICO) balance.
- `SemiFinalTickets` (`number`) - Number of semi-final tickets held.
- `FinalTickets` (`number`) - Number of final tickets held.
- `PrivateTickets` (`number`) - Number of private-room tickets held.
- `KYCVerified` (`boolean`) - Whether the player has passed platform KYC verification. Use it for a verification badge, to pick `PlatformExpKyc` over `PlatformExp`, and to check tournaments whose `IsKycRequired` is `true`. (Rooms carry no usable KYC flag: `RoomViewModel.RequireKyc` is always `false`.)
- `SoundsValue` (`number`) - The player's stored sound-effects volume preference.
- `MusicValue` (`number`) - The player's stored music volume preference.

**Usage:**
```js
// Force a fresh profile fetch when entering the menu
const user = await sdk.GetUserData(false);

document.querySelector('#player-name').textContent = user.Name;
document.querySelector('#player-level').textContent = `Level ${user.Level}`;
document.querySelector('#xp-bar-fill').style.width =
  `${Math.round((user.Experience / user.ExperienceToLevel) * 100)}%`;

if (!user.KYCVerified) {
  document.querySelector('#kyc-badge').hidden = false;
}

// funtico.refreshUserData() performs the same fresh fetch and additionally
// emits FunticoClient.EVENTS.USER_DATA_UPDATED with the profile as payload.
```

---

### `GetCachedUserData`

Returns the profile already held in memory, with no network call and no TTL check. Use it in per-frame or per-tick UI code where an `await` would be wasteful.

**Signature:**
```ts
GetCachedUserData(): UserData | null
```

**Returns:** `UserData | null` - The cached profile, or `null` if `GetUserData` has never completed successfully in this session (for example after a first `Initialize()` without a `userToken`; a later `Initialize()` does not clear a profile cached earlier).

**Usage:**
```js
const user = sdk.GetCachedUserData();

if (user) {
  document.querySelector('#coins').textContent = `${user.Coins}`;
  document.querySelector('#diamonds').textContent = `${user.Diamonds}`;
} else {
  // Nothing cached yet — fall back to an awaited fetch
  await sdk.GetUserData();
}
```

---

### `GetBalance`

Gets the player's spendable currencies and tickets. This is a lighter payload than `GetUserData` — call it after any transaction (joining a paid room, claiming a prize) to refresh the wallet display.

**Signature:**
```ts
async GetBalance(useCache = true): Promise<BalanceResponse>
```

**Parameters:**
- `useCache` - When `true`, returns the cached balance if one exists and the shared TTL window has not expired. When `false`, always issues a `GET /User/get-balance` request and refreshes the cached balance. Default: `true`.

**Returns:** `Promise<BalanceResponse>` - The player's current balance across every currency type. Rejects if the SDK is not authenticated or the request fails.

**BalanceResponse Properties:**
- `Coins` (`number`) - In-game currency (IC) balance. Required for `EntryFeeType.IC` rooms.
- `Diamonds` (`number`) - Premium platform currency (TICO) balance. Required for `EntryFeeType.Tico` rooms.
- `SemiFinalTickets` (`number`) - Semi-final tickets held. Required for `EntryFeeType.SemifinalsTickets` entries.
- `FinalTickets` (`number`) - Final tickets held. Required for `EntryFeeType.FinalTickets` entries.
- `PrivateTickets` (`number`) - Private-room tickets held. Required for `EntryFeeType.PrivateTickets` entries.
- `KYCVerified` (`boolean`) - Whether the player has passed platform KYC verification. Same flag as `UserData.KYCVerified`: use it for a verification badge, `PlatformExpKyc` selection and the tournament `IsKycRequired` check.

**Usage:**
```js
// Refresh the wallet right after a match payout
const balance = await sdk.GetBalance(false);

document.querySelector('#coins').textContent = `${balance.Coins}`;
document.querySelector('#tico').textContent = `${balance.Diamonds}`;
document.querySelector('#tickets').textContent =
  `${balance.FinalTickets} final / ${balance.SemiFinalTickets} semi`;

// funtico.refreshBalance() performs the same fresh fetch and additionally
// emits FunticoClient.EVENTS.BALANCE_UPDATED with the balance as payload.
```

---

### `GetCachedBalance`

Returns the balance already held in memory, with no network call and no TTL check. Ideal for wallet widgets that redraw often.

**Signature:**
```ts
GetCachedBalance(): BalanceResponse | null
```

**Returns:** `BalanceResponse | null` - The cached balance, or `null` if no balance has been fetched yet in this session.

**Usage:**
```js
const coinsEl = document.querySelector('#coins');
const ticoEl = document.querySelector('#tico');

// Called every frame from your render loop — synchronous, no network
function renderWallet() {
  const balance = sdk.GetCachedBalance();
  if (!balance) return;

  coinsEl.textContent = `${balance.Coins}`;
  ticoEl.textContent = `${balance.Diamonds}`;
}

function frame() {
  renderWallet();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

---

### `GetVouchers`

Gets the vouchers the player owns. Vouchers grant free entry to rooms of a specific tier — pass `useVoucher = true` to `JoinRoom` to spend one.

**Signature:**
```ts
async GetVouchers(useCache = true): Promise<VoucherData[]>
```

**Parameters:**
- `useCache` - When `true`, returns the cached voucher list if one exists and the shared TTL window has not expired. When `false`, always issues a `GET /User/vouchers` request and refreshes the cached list. Default: `true`. Note that `GetRooms` and `GetRoom` call this with `false` internally, because joining a room spends a voucher and a stale count would misreport `UserCanJoinWithVoucher`.

**Returns:** `Promise<VoucherData[]>` - One entry per voucher type the player holds. Rejects if the SDK is not authenticated or the request fails. Only vouchers the player actually holds are returned, so a tier they hold none of is absent from the list rather than present with `Count: 0`.

**VoucherData Properties:**
- `ItemId` (`number`) - Platform item identifier for this voucher type.
- `ItemName` (`string`) - Display name of the voucher, e.g. for a rewards popup.
- `ItemImage` (`string`) - URL of the voucher artwork. Load it through your engine's own loader (or a plain `<img>` element); the SDK does not fetch images.
- `Tier` (`RoomTier`) - The room tier this voucher is associated with (`Contender`, `Challenger`, `Champion`, or `Free`). Whether a given room will actually accept a voucher is reported by that room's `UserCanJoinWithVoucher` flag.
- `Count` (`number`) - How many redeemable vouchers of this type the player currently holds.
- `PlayCount` (`number`) - Progress toward earning the next voucher of this type — the number of qualifying plays banked so far.
- `PlaysRequiredToActivate` (`number`) - How many qualifying plays are needed to earn one voucher. Render progress as `PlayCount` / `PlaysRequiredToActivate`.

**Usage:**
```js
import { RoomTier } from './funtico-sdk.mjs';
// <script> build: const { RoomTier } = FunticoSDK;

const vouchers = await sdk.GetVouchers();

vouchers.forEach(v => {
  console.log(`${v.ItemName}: ${v.Count} available`);
  console.log(`Next one in ${v.PlaysRequiredToActivate - v.PlayCount} plays`);
});

// Offer a free entry if the player holds a voucher for this room's tier
const championVoucher = vouchers.find(v => v.Tier === RoomTier.Champion && v.Count > 0);
if (championVoucher) {
  document.querySelector('#free-entry-button').hidden = false;
}
```

---

### `GetCachedVouchers`

Returns the voucher list already held in memory, with no network call and no TTL check.

**Signature:**
```ts
GetCachedVouchers(): VoucherData[] | null
```

**Returns:** `VoucherData[] | null` - The cached voucher list, or `null` if vouchers have never been fetched in this session. Note that `null` means "not cached", which is distinct from an empty array meaning "the player owns no vouchers".

**Usage:**
```js
const vouchers = sdk.GetCachedVouchers();

if (vouchers === null) {
  // Never fetched — kick off a load
  await sdk.GetVouchers();
} else if (vouchers.length === 0) {
  document.querySelector('#vouchers-empty').hidden = false;
} else {
  renderVoucherList(vouchers);
}
```

---

### `CanAfford`

Checks whether the player can pay a given entry fee, against a freshly fetched balance. Use this immediately before a `JoinRoom` call, where an out-of-date balance would cause a failed join.

**Signature:**
```ts
async CanAfford(type: EntryFeeType, amount: number): Promise<boolean>
```

**Parameters:**
- `type` - The currency or ticket type the entry fee is denominated in. See the `EntryFeeType` properties at the top of this section.
- `amount` - The required quantity of that currency or ticket. The check passes when the matching balance field is greater than or equal to this value.

**Returns:** `Promise<boolean>` - `true` if the player can cover the fee. Always `true` for `EntryFeeType.Free`, and always `false` for `EntryFeeType.InventoryItem`, which is not represented in `BalanceResponse`.

**Usage:**
```js
import { EntryFeeType } from './funtico-sdk.mjs';
// <script> build: const { EntryFeeType } = FunticoSDK;

async function onJoinClicked(room) {
  // This calls GetBalance(false) internally — the balance is never stale
  const canAfford = await sdk.CanAfford(EntryFeeType.Tico, room.EntryFee);

  if (!canAfford && !room.UserCanJoinWithVoucher) {
    showTopUpDialog();
    return;
  }

  const session = await sdk.JoinRoom(room.Guid);
  startMatch(session);
}
```

---

### `CanAffordFromCache`

Checks affordability against the cached balance, synchronously. Use it for instant UI feedback — greying out room cards the player cannot enter — and re-verify with `CanAfford` before actually joining.

**Signature:**
```ts
CanAffordFromCache(type: EntryFeeType, amount: number): boolean
```

**Parameters:**
- `type` - The currency or ticket type the entry fee is denominated in.
- `amount` - The required quantity of that currency or ticket.

**Returns:** `boolean` - `true` if the cached balance covers the fee. Returns `false` when no balance has been cached yet, so a `false` result may mean "cannot afford" or "balance unknown" — this short-circuit applies before the fee type is examined, so even `EntryFeeType.Free` returns `false` with an empty cache. Once a balance is cached, the result is `true` for `EntryFeeType.Free` and `false` for `EntryFeeType.InventoryItem`.

**Usage:**
```js
import { EntryFeeType } from './funtico-sdk.mjs';
// <script> build: const { EntryFeeType } = FunticoSDK;

// Synchronous — safe to call while building a list of room cards
const list = document.querySelector('#room-list');

rooms.forEach(room => {
  const affordable = sdk.CanAffordFromCache(EntryFeeType.Tico, room.EntryFee);
  const card = createRoomCard(room); // your own DOM builder
  card.style.opacity = affordable || room.UserCanJoinWithVoucher ? '1' : '0.5';
  list.appendChild(card);
});
```

---

## Rooms & Tournament Methods

Rooms are the core Funtico competitive format: a player pays an entry fee (or spends a voucher), plays a single-player run, and is ranked against everyone else who played the same room. These methods cover the whole lifecycle — browsing tiers and rooms, joining, starting and ending a run, and reading results and history.

The typical singleplayer flow is `GetRooms` → `GetRoom` → `JoinRoom` → *(gameplay)* → `EndRoomSP` → `GetLeaderboard`.

**`JoinRoom` starts the run.** It reserves the seat and starts the session in one call.

### `GetTiers`

Gets all room tiers configured for the game. Call this when building a lobby that groups rooms by tier.

**Signature:**
```ts
async GetTiers(): Promise<TierViewModel[]>
```

**Returns:** `Promise<TierViewModel[]>` - The list of tiers, each describing its display name and the entry-fee band that rooms of that tier fall into.

**TierViewModel Properties:**
- `TierName` (`string`) - Display name of the tier as configured on the platform (for example "Contender").
- `Tier` (`RoomTier`) - The tier identifier: `RoomTier.Contender` (0), `RoomTier.Challenger` (1), `RoomTier.Champion` (2), `RoomTier.Free` (3). Use this to match rooms whose `Tier` field equals this value.
- `TierImage` (`string`) - URL of the tier icon. The SDK does not fetch images — hand it to your own loader (an `<img>` element, or your engine's texture loader).
- `EntryFeeLowerBound` (`number`) - Lowest entry fee any room in this tier may charge. Useful for rendering a "from X" label before rooms are loaded.
- `EntryFeeUpperBound` (`number`) - Highest entry fee any room in this tier may charge.
- `Hidden` (`boolean`) - When `true`, the tier is configured to be hidden from the lobby UI. Skip these when rendering the tier list.

**Usage:**
```js
const tiers = await sdk.GetTiers();
const tierList = document.querySelector('#tier-list');

tiers
  .filter(tier => !tier.Hidden)
  .forEach(tier => {
    console.log(`${tier.TierName}: ${tier.EntryFeeLowerBound} - ${tier.EntryFeeUpperBound}`);

    // TierImage is a plain URL - the SDK does not load images, so do it yourself.
    // (In PixiJS / Three.js, pass the URL to the engine's texture loader instead.)
    const icon = new Image();
    icon.src = tier.TierImage;
    icon.alt = tier.TierName;
    icon.dataset.tier = String(tier.Tier);
    tierList.appendChild(icon);
  });
```

---

### `GetRooms`

Gets the list of rooms the player can currently join. This is the main lobby call.

**Signature:**
```ts
async GetRooms(roomType: number = 0, limit: number = 10): Promise<RoomViewModel[]>
```

**Parameters:**
- `roomType` - Room type filter sent to the backend as the `roomType` query value: `0` = singleplayer, `1` = multiplayer, `2` = external. Default: `0`.
- `limit` - Maximum number of rooms to return. Default: `10`.

**Returns:** `Promise<RoomViewModel[]>` - The available rooms, including entry requirements, prize pool, and whether this specific player may enter with a voucher.

`GetRooms` joins the room list with the player's vouchers and pre-paid entries, so `UserCanJoinWithVoucher` and `IsPrePaid` are resolved for the authenticated player. The voucher list is always fetched fresh, which also re-arms the shared cache window for the profile and balance slots (see the caching model under [User Data Methods](#user-data-methods)).

The room list is retained internally to serve `GetTierByEventId` without a second round-trip.

**RoomViewModel Properties:**
- `Guid` (`string`) - Unique room identifier. Pass it to `GetRoom` and `JoinRoom`.
- `Name` (`string`) - Room display name.
- `Description` (`string`, optional) - Longer room description configured on the platform, for a detail panel. Absent for a room with no description.
- `HasPassword` (`boolean`, optional) - `true` when the room is password-protected. Absent when the room config does not specify it, so treat a missing value as "unknown", not as `false`.
- `RoomSize` (`number`, optional) - How many players the room seats. Absent when the room config does not specify it. This is the same figure `GetPrizePoolDistribution` divides by for `TicoPerPlayer`.
- `Tier` (`RoomTier`) - Tier this room belongs to: `Contender` (0), `Challenger` (1), `Champion` (2), `Free` (3). A room whose config carries no tier reads as `Contender` here.
- `EntryFee` (`number`) - Entry fee amount, expressed in the room's own currency/ticket unit (not USDT). Check against the player's balance before joining. `0` when the ticket carries no currency amount.
- `EntryFeeUSDT` (`number`) - The same entry fee as an approximate USDT value, for display only. Derived from the tier and the room type, not from `EntryFee`: in-platform rooms map `Contender`/`Challenger`/`Champion` to `2`/`10`/`20`, external rooms to `2`/`4`/`8`, and any other tier (including `Free`) to `0`.
- `TotalPrize` (`number`) - Total prize pool currently accumulated for the room, net of the platform fee.
- `IsFree` (`boolean`) - `true` when the room charges no entry fee — that is, when its ticket has no type, an explicitly free type, or a zero/absent currency amount. When `true`, no balance check is needed.
- `RequireKyc` (`boolean`) - Currently **always `false`** from `GetRooms`, `GetRoom` and `GetRoomPublic`: it is not populated. Do not use it to gate rooms; the server remains the authority on whether an entry is allowed.
- `UserCanJoinWithVoucher` (`boolean`) - `true` when the authenticated player holds a voucher for this room's tier, has at least one of it, and has banked the plays needed to activate it — meaning `JoinRoom(guid, true)` will enter without spending currency. Always `false` from `GetRoomPublic`, which has no player to hold vouchers.
- `Voucher` (`VoucherData`, optional) - The voucher matching this room's tier. Present whenever the player holds one, **even if it is not yet activated** — so it can be present while `UserCanJoinWithVoucher` is `false`. Render progress from it; gate the free-entry button on `UserCanJoinWithVoucher`.
- `IsPrePaid` (`boolean`) - `true` when the player has already paid for an entry to this room that has not been consumed yet (see `GetPrePaid`), so joining will not charge again. Only `GetRooms` populates this; `GetRoom` and `GetRoomPublic` report `false`.

**VoucherData Properties:**
- `ItemId` (`number`) - Platform item identifier of the voucher.
- `ItemName` (`string`) - Voucher display name.
- `ItemImage` (`string`) - URL of the voucher artwork. Load it with your own image/texture loader.
- `Tier` (`RoomTier`) - Tier the voucher is valid for. Matched against the room's configured tier, so a room that declares no tier matches no voucher.
- `Count` (`number`) - How many vouchers of this kind the player currently holds.
- `PlayCount` (`number`) - Progress towards activating the next voucher — how many qualifying plays the player has accumulated.
- `PlaysRequiredToActivate` (`number`) - How many plays are needed to activate one voucher. Render progress as `PlayCount` / `PlaysRequiredToActivate`. A voucher counts as usable — and `UserCanJoinWithVoucher` turns `true` — only once `PlayCount >= PlaysRequiredToActivate` and `Count > 0`.

**Usage:**
```js
// Singleplayer rooms, first 20
const rooms = await sdk.GetRooms(0, 20);

rooms.forEach(room => {
  // No KYC filter here: RequireKyc is always false (rooms carry no KYC flag).
  const label = room.IsFree
    ? 'FREE'
    : room.UserCanJoinWithVoucher
      ? `Voucher (${room.Voucher?.Count} left)`
      : `${room.EntryFee}`;

  console.log(`${room.Name} [${label}] - prize pool ${room.TotalPrize}`);
});
```

---

### `GetRoom`

Gets a single room by id, with voucher eligibility resolved for the authenticated player. Call this right before showing a room detail popup so that voucher eligibility is up to date.

**Signature:**
```ts
async GetRoom(roomId: string): Promise<RoomViewModel>
```

**Parameters:**
- `roomId` - Room unique identifier (`RoomViewModel.Guid`).

**Returns:** `Promise<RoomViewModel>` - The room's details. Fields are the same as those returned by `GetRooms` — see the **RoomViewModel Properties** block above — with one exception: **`IsPrePaid` is always `false` here.** For the pre-paid flag, read it from the `GetRooms` list, or call `GetPrePaid` and match on `id` yourself.

Like `GetRooms`, this fetches the player's vouchers fresh before resolving `UserCanJoinWithVoucher`.

**Usage:**
```js
import { EntryFeeType } from './funtico-sdk.mjs';

async function openRoom(selectedGuid) {
  const room = await sdk.GetRoom(selectedGuid);

  if (!room.IsFree && !room.UserCanJoinWithVoucher) {
    const canAfford = sdk.CanAffordFromCache(EntryFeeType.Tico, room.EntryFee);
    if (!canAfford) {
      showNotEnoughFunds(room.EntryFee);
      return null;
    }
  }

  // Omitting useVoucher lets JoinRoom decide from UserCanJoinWithVoucher itself
  return sdk.JoinRoom(room.Guid);
}
```

---

### `GetRoomPublic`

Gets a room's details without an authenticated player. Use it for shared/deep-linked room previews shown before the player has logged in.

This is the only Rooms method that does not require an authenticated player — it identifies your game from the public key alone. Player-specific fields (`UserCanJoinWithVoucher`, `IsPrePaid`, `Voucher`) are therefore not personalised: they always report the unauthenticated defaults.

It still needs `Initialize` to have run (a config without `userToken` is fine): the public key and the API base URL both come from that config, and before `Initialize` the call fails with a `TypeError` instead of a request.

**Signature:**
```ts
async GetRoomPublic(id: string): Promise<RoomViewModel>
```

**Parameters:**
- `id` - Room unique identifier (`RoomViewModel.Guid`).

**Returns:** `Promise<RoomViewModel>` - The room's public details. Field meanings are the same as in the **RoomViewModel Properties** block above. Rejects with `Failed to fetch public room details` on a non-OK response.

> **Note:** `GetRoomPublic` may fail (HTTP 400) for a room that the authenticated `GetRoom` returns normally. Treat the preview as best-effort — catch the rejection and fall back to `GetRoom` once the player has signed in.

**Usage:**
```js
// Landing page: preview a room from a share link before the player signs in.
const roomId = new URLSearchParams(window.location.search).get('room');

if (roomId) {
  try {
    const room = await sdk.GetRoomPublic(roomId);
    showRoomPreview(room.Name, room.EntryFee, room.TotalPrize);
  } catch (err) {
    // Best-effort preview (see the note above) - load it with GetRoom after login instead.
    console.warn('Public room preview unavailable:', err);
  }
}
```

---

### `GetPrizePoolDistribution`

Gets a room's full prize table — what each place wins, plus the pool totals and the platform's cut. Use it to render a "prizes" panel on a room detail screen.

The SDK composes this model from the room config, so every figure below is a plain number on the returned object.

**Signature:**
```ts
async GetPrizePoolDistribution(roomGuid: string): Promise<PrizePoolDistributionViewModel>
```

**Parameters:**
- `roomGuid` - Room unique identifier (`RoomViewModel.Guid`). Fetched via `GET /Rooms/get-room`, so this needs an authenticated SDK.

**Returns:** `Promise<PrizePoolDistributionViewModel>` - The room's prize places and pool totals. Rejects if the room config cannot be fetched.

**PrizePoolDistributionViewModel Properties:**
- `PrizePlaces` (`PrizePlaceViewModel[]`) - One entry per place in the room's prize table, in the order the config declares them. Empty when the room distributes no prizes.
- `TotalTicoAccumulated` (`number`) - The room's total TICO stake — everything collected from entry fees, **before** the platform fee is taken out.
- `TicoSharedViaPlaces` (`number`) - The sum of the computable TICO value of every place's prizes, evaluated against the room's deposit stake. This is what the prize table actually pays out, so comparing it with `TotalTicoDistributedToPlayers` tells you whether the table fully allocates the pool.
- `TotalPlayers` (`number`) - How many players the room seats. Reads `1` when the room config declares no size.
- `TicoPerPlayer` (`number`) - `TotalTicoAccumulated` divided by `TotalPlayers`, **floored** to a whole number.
- `PlatformFeePercentage` (`number`) - The platform's cut as a whole-number **percentage** (e.g. `20` for 20%), not an absolute amount. `0` when the config declares none.
- `PlatformFee` (`number`) - The platform's cut as an **absolute** TICO amount, as reported with the room's totals rather than derived from the percentage.
- `TotalTicoDistributedToPlayers` (`number`) - `TotalTicoAccumulated` minus `PlatformFee` — the TICO actually available to players. This is the same figure as `RoomViewModel.TotalPrize`.

**PrizePlaceViewModel Properties:**
- `Place` (`number`) - The finishing place this entry rewards, 1-based. `0` when the config declares no place for the entry.
- `PlatformExp` (`number`) - Platform experience awarded at this place. `0` when the entry declares none.
- `PlatformExpKyc` (`number`) - Platform experience awarded at this place to a **KYC-verified** player, which is typically higher than `PlatformExp`. `0` when the entry declares none. Pick between the two on `UserData.KYCVerified`.
- `RewardFeeRatio` (`number`) - This place's TICO prize divided by the room's entry fee — the "win multiplier" for finishing here. `0` when the room is free, when the entry fee is absent, or when the place wins no computable TICO. Not rounded.
- `Prizes` (`Prize[]`) - Everything awarded at this place, as the `Prize` discriminated union documented under [Utilities & Types](#utilities--types). A place commonly carries several prizes at once (TICO plus an item, say). Narrow on the lowercase `type` field.

**Usage:**
```js
import { PrizeType } from './funtico-sdk.mjs';

const dist = await sdk.GetPrizePoolDistribution(room.Guid);

console.log(`Pool: ${dist.TotalTicoAccumulated} TICO`);
console.log(`Platform takes ${dist.PlatformFeePercentage}% (${dist.PlatformFee} TICO)`);
console.log(`Players share ${dist.TotalTicoDistributedToPlayers} TICO across ${dist.TotalPlayers} seats`);

const user = sdk.GetCachedUserData();

for (const place of dist.PrizePlaces) {
  const xp = user?.KYCVerified ? place.PlatformExpKyc : place.PlatformExp;
  console.log(`#${place.Place}: ${xp} XP, x${place.RewardFeeRatio.toFixed(2)} on the fee`);

  for (const prize of place.Prizes) {
    if (prize.type === PrizeType.Item || prize.type === PrizeType.Reward) {
      console.log(`  ${prize.Amount}x ${prize.Item?.name ?? 'item'}`);
    }
  }
}
```

---

### `GetTierByEventId`

Resolves a room's tier from its event id, without a dedicated request. Handy on a results or history screen where you hold an event id but not the room model.

Reads from the room list retained by the last `GetRooms` call. When no list has been fetched yet in this process, it fetches one first; when a list has been fetched, it is **not** refreshed, so a tier can only be found for a room that appeared in it.

**Signature:**
```ts
async GetTierByEventId(eventId: string, roomType: number = 0): Promise<RoomTier | null>
```

**Parameters:**
- `eventId` - The room/event identifier to resolve (`RoomViewModel.Guid` / `RoomSessionData.EventId`).
- `roomType` - Which list to populate **on a cache miss**, matching `GetRooms`' own parameter: `0` = singleplayer, `1` = multiplayer, `2` = external. Ignored when a room list has already been retained. Pass the type the event actually belongs to — a multiplayer event id looked up against a singleplayer fetch is not found and returns `null`. Default: `0`.

**Returns:** `Promise<RoomTier | null>` - The room's tier, or `null` when the retained list holds no room with that id **or** the room declares no tier. The two cases are not distinguishable from the return value alone. Unlike `RoomViewModel.Tier`, an untiered room reads `null` here rather than `Contender`.

**Usage:**
```js
import { RoomTier } from './funtico-sdk.mjs';

// The lobby already called GetRooms, so this resolves from the retained list with no request
const tier = await sdk.GetTierByEventId(session.EventId);

if (tier !== null) {
  const badge = document.querySelector('#tier-badge');
  badge.className = `tier-badge tier-${tier}`;
  badge.textContent = RoomTier[tier]; // numeric enums map back to their name: 'Contender', ...
}

// Looking up a multiplayer event: pass the matching roomType so a cache miss fetches the right list
const mpTier = await sdk.GetTierByEventId(multiplayerEventId, 1);
```

---

### `GetRoomSettings`

Gets the custom game configuration attached to a room/event. Call it after joining, before starting gameplay, so the run uses the room's configured rules.

**Signature:**
```ts
async GetRoomSettings(eventId: string): Promise<any>
```

**Parameters:**
- `eventId` - Event/Room identifier — the `EventId` returned by `JoinRoom`, or a room's `Guid`.

**Returns:** `Promise<any>` - The settings payload exactly as the backend serves it. The shape is defined by your game's own configuration on the Funtico dashboard, which is why the SDK returns it untyped — describe it with a JSDoc `@typedef` (or your own TypeScript interface) if you want editor checking.

**Usage:**
```js
/**
 * Your game's own settings shape, as configured on the Funtico dashboard.
 * @typedef {{ difficulty: string, timeLimitSeconds: number }} MyGameSettings
 */

/** @type {MyGameSettings} */
const settings = await sdk.GetRoomSettings(session.EventId);

startGame({
  difficulty: settings.difficulty,
  timeLimit: settings.timeLimitSeconds
});
```

---

### `GetPrePaid`

Gets the player's pre-paid room entries — entries that were already paid for but not yet played out. Call it at lobby load so you can offer "continue" instead of charging the player a second time.

**Signature:**
```ts
async GetPrePaid(): Promise<PrePaidRoomData[]>
```

**Returns:** `Promise<PrePaidRoomData[]>` - One entry per outstanding participation the player already holds. Empty when they have none. A room in this list is also flagged by `RoomViewModel.IsPrePaid` on the models `GetRooms` returns.

> **Casing note:** `PrePaidRoomData` is **snake_case**, unlike the PascalCase models around it. Read these fields exactly as documented.

**PrePaidRoomData Properties:**
- `id` (`string`) - The room/event identifier this paid entry belongs to. Matches a `RoomViewModel.Guid`, and is the field `GetRooms` matches on to set `IsPrePaid`.
- `attempts_left` (`number`) - How many paid entries into this room remain unplayed. Joining consumes one.
- `participation_id` (`string`) - Identifier of the participation record the payment created.
- `game_session_id` (`string | null`) - The already-started session for this entry, or `null` when the entry is paid for but no run has been started yet.
- `community_id` (`string | null`) - The community the entry was joined under, or `null` when it was not joined under one.
- `voucher_used` (`boolean`) - `true` when the entry was covered by a voucher rather than by currency.

**Usage:**
```js
const prePaid = await sdk.GetPrePaid();

if (prePaid.length > 0) {
  console.log(`You have ${prePaid.length} entries already paid for.`);
  showResumePrompt(prePaid);
}

// An entry with a started session is a run in progress, not a fresh one
for (const entry of prePaid) {
  const label = entry.game_session_id === null
    ? `${entry.attempts_left} attempt(s) ready to play`
    : 'run already in progress';
  console.log(`Room ${entry.id}: ${label}${entry.voucher_used ? ' (voucher)' : ''}`);
}
```

---

### `GetHistory`

Gets the authenticated player's paginated room history. Use it for a "my matches" screen.

**Signature:**
```ts
async GetHistory(page: number, filters?: string, limit = 10, cursor?: string): Promise<any>
```

**Parameters:**
- `page` - Page index, 1-based.
- `filters` - Optional match-type filter. Forwarded to the platform as the match-type filter, so the accepted values match the room types: `"singleplayer"`, `"multiplayer"`, `"external"`. URL-encoded by the SDK.
- `limit` - Number of entries per page. Default: `10`.
- `cursor` - Optional cursor for cursor-based pagination, taken from the previous response. URL-encoded by the SDK. Omit it for the first page.

**Returns:** `Promise<any>` - The rooms-history payload, returned untyped. It carries a data object holding the player's past game sessions (each with its score, its room/event id, its match id, and the timestamps for when it started, was scored, and had prizes distributed), the room configurations those sessions refer to, the related item and reward identifiers, plus a pagination cursor for fetching the next page.

> **Casing note:** unlike the SDK's own models, this untyped payload keeps the backend's **lowercase/snake_case** keys: `data.game_sessions`, `data.events`, `data.item_ids`, `data.reward_ids` and a top-level `cursor`. Session entries use `id`, `event_id`, `match_id`, `score`, `started_at`, `scored_at`, `distributed_at`.

**Usage:**
```js
// First page of singleplayer history
const history = await sdk.GetHistory(1, 'singleplayer', 10);

for (const played of history.data?.game_sessions ?? []) {
  console.log(`${played.event_id}: score ${played.score} (session ${played.id})`);
}

// Next page, using the cursor the previous response handed back
if (history.cursor) {
  const next = await sdk.GetHistory(2, 'singleplayer', 10, history.cursor);
  console.log(next);
}
```

---

### `GetRoomHistoryDetails`

Gets the full detail of one historical game session. Call it when the player taps an entry in the history list.

**Signature:**
```ts
async GetRoomHistoryDetails(sessionId: string, withEvent = true): Promise<any>
```

**Parameters:**
- `sessionId` - Identifier of the game session to inspect, taken from an entry in the `GetHistory` payload.
- `withEvent` - When `true`, the response also includes the room/event configuration that the session was played in, so you can show the room name, tier, and prize structure alongside the result. Default: `true`.

**Returns:** `Promise<any>` - The session detail payload, returned untyped: the single game-session record (score, match id, timestamps, whether a voucher was used, the player's leader entry) and — when `withEvent` is `true` — the room configuration it belongs to. On the wire these are the snake_case keys `game_session` and `event`.

**Usage:**
```js
// sessionId is the `id` of an entry in history.data.game_sessions
const details = await sdk.GetRoomHistoryDetails(sessionId, true);
console.log(details.game_session, details.event);

// Skip the room config when you only need the score record
const scoreOnly = await sdk.GetRoomHistoryDetails(sessionId, false);
console.log(`Score ${scoreOnly.game_session.score}, voucher used: ${scoreOnly.game_session.voucher_used}`);
```

---

### `GetLeaderboard`

Gets the leaderboard and the player's own result for a room run. Call it after `EndRoomSP` to build the results screen, and poll it while results are still pending.

**Signature:**
```ts
async GetLeaderboard(eventId: string, sessionId: string, matchId?: string): Promise<RoomLeaderboardViewModel>
```

**Parameters:**
- `eventId` - Event/Room identifier (`RoomSessionData.EventId`).
- `sessionId` - Session or match identifier (`RoomSessionData.SessionOrMatchId`). Sent as the `session_or_match_id` query value.
- `matchId` - Optional match identifier, appended only when provided. Omit it for single-player runs.

**Returns:** `Promise<RoomLeaderboardViewModel>` - The ranked player list plus this player's placement and earnings.

Display names and avatars are resolved from the Funtico **platform** host (`funticoApiBaseUrl`), separately from the scores. That lookup degrades quietly: if it fails, every `PlayerName` reads `""` and `AvatarUrl` is absent, while places and scores still come back intact. Render a placeholder rather than an empty label.

**RoomLeaderboardViewModel Properties:**
- `State` (`LeadersState`) - Where the room's prize settlement currently stands, as a numeric enum member (see the **LeadersState Properties** block below). Compare it against the enum — `State === LeadersState.placed` — rather than against a string; it is not one. `LeadersState[view.State]` recovers the member name for logging.
- `IsPending` (`boolean`) - `true` while prizes are not settled yet — exactly `State === LeadersState.placed`. Keep polling and show a "calculating results" state.
- `ClosedUnsuccessfully` (`boolean`) - `true` when the room closed without a valid outcome (for example it failed to fill), which is the case that leads to entry fees being returned rather than prizes awarded. Exactly `State === LeadersState.returned || State === LeadersState.to_be_returned`.
- `RoomName` (`string`) - Display name of the room the run belongs to.
- `RoomTier` (`RoomTier`) - Tier of that room: `Contender` (0), `Challenger` (1), `Champion` (2), `Free` (3). A room whose config carries no tier reads as `Challenger` here, where `RoomViewModel.Tier` reads `Contender` — do not expect the two to agree for an untiered room.
- `IsFree` (`boolean`) - `true` when **this player's run** was a free entry — not a property of the room. If the seat was paid for with a voucher, the effective fee becomes the voucher item rather than the room's ticket, which flips this to `true` even for a paid room.
- `YourTicoEarnings` (`number`) - TICO the authenticated player won from this room, computed from the room's prize table for the place they finished in. `0` when they placed out of the prizes or are not on the board. Prizes the game itself grants (`GameManagedReward`) are excluded — see `PrizeUtils.calculatePrize`.
- `Multiplier` (`number`) - Payout multiplier: `YourTicoEarnings` divided by the fee actually paid. Render as `x{Multiplier}`. **`0` whenever the fee was not a currency amount** — a voucher-paid or free seat has nothing to divide by, so a `0` here means "not applicable", not "you won nothing". This is a raw quotient and is not rounded.
- `UserPlace` (`string`) - The player's finishing place, stringified — `"1"` for the winner. It is a plain number in a string, **not** an ordinal like `"1st"`; format it yourself. `"0"` when the player is not on the board at all (a spectator, or a run that was never scored), which is not a real place — check for it before displaying.
- `LeaderboardItems` (`LeaderboardItemViewModel[]`) - The ranked list of every player in the room, ordered by place. Always an array: it is empty, never `null`, when the board has no entries or the player is not on it.

**LeadersState Properties:**
- `placed` (`0`) - Scores are in and ranked, but prizes have not been settled. This is the state that drives `IsPending`.
- `distributed` (`1`) - Prizes have been paid out. The result is final.
- `to_be_returned` (`3`) - The room closed unsuccessfully and entry fees are queued to be refunded.
- `returned` (`4`) - Entry fees have been refunded.

There is no member `2`.

**LeaderboardItemViewModel Properties:**
- `Place` (`number`) - Rank in the room, 1-based (`1` is the winner).
- `PlayerName` (`string`) - The player's display name, resolved from the Funtico platform. `""` when the platform has no record for this id.
- `Score` (`number`) - The score they submitted for this room.
- `UserId` (`number`) - The player's **Funtico platform** identifier. Match it against `UserData.PlatformId` — not `UserData.UserId` — to find the local player's own row.
- `AvatarUrl` (`string`, optional) - URL of the player's avatar. Absent when the player has no avatar set, or when the platform name lookup failed. Load it with your own image/texture loader.

**Usage:**
```js
import { LeadersState } from './funtico-sdk.mjs';

async function renderResults(session) {
  const leaderboard = await sdk.GetLeaderboard(
    session.EventId,
    session.SessionOrMatchId
  );

  if (leaderboard.IsPending) {
    showCalculatingResults();
    setTimeout(() => renderResults(session), 5000); // poll until prizes settle
    return;
  }

  if (leaderboard.ClosedUnsuccessfully) {
    showRefundNotice(leaderboard.State === LeadersState.returned);
    return;
  }

  // UserPlace is "0" when the player is not on the board, and a bare number otherwise
  if (leaderboard.UserPlace !== '0') {
    console.log(`${leaderboard.RoomName}: you placed #${leaderboard.UserPlace}`);
  }

  // Multiplier is 0 for a free or voucher-paid seat - suppress it rather than showing "x0"
  const payout = leaderboard.Multiplier > 0
    ? `${leaderboard.YourTicoEarnings} TICO (x${leaderboard.Multiplier.toFixed(2)})`
    : `${leaderboard.YourTicoEarnings} TICO`;
  console.log(`Earnings: ${payout}`);

  // UserId here is the PLATFORM id - match it against PlatformId, not UserId
  const me = sdk.GetCachedUserData();
  leaderboard.LeaderboardItems.forEach(item => {
    const marker = item.UserId === me?.PlatformId ? ' <- you' : '';
    const name = item.PlayerName || `Player ${item.UserId}`;
    console.log(`${item.Place}. ${name} - ${item.Score}${marker}`);
  });
}
```

---

### `JoinRoom`

Joins a room and returns the session to play it under: the backend validates and charges the entry fee (or consumes a voucher), then the run is started. Call it once the player has confirmed the room, before starting gameplay.

**Signature:**
```ts
async JoinRoom(roomGuid: string, useVoucher?: boolean): Promise<RoomSessionData>
```

**Parameters:**
- `roomGuid` - Room unique identifier (`RoomViewModel.Guid`). Sent in the request body as `tournamentId`.
- `useVoucher` - Whether to spend a free-entry voucher instead of paying the entry fee. **Omit it** to let the SDK decide: it looks the room up and uses its `UserCanJoinWithVoucher`. Pass `true`/`false` only to override that decision — passing `true` when the player holds no activated voucher gets the join rejected. Omitting it costs two extra requests (a fresh voucher fetch, `GET /User/vouchers`, which ignores the voucher cache, and a room lookup, `GET /Rooms/get-room`); passing it explicitly skips both.

**`JoinRoom` starts the run.** It is live by the time `JoinRoom` resolves and the server-side timers are already ticking. Load your level before calling `JoinRoom`, not between `JoinRoom` and gameplay.

**Two requests under the hood.** `JoinRoom` performs two backend calls:
1. `POST /Rooms/join-room` reserves the seat and hands back a short-lived lobby quote. Each call carries a fresh idempotency key.
2. `POST /Rooms/start-room-sp` converts that quote into the real game session (the SDK calls `StartRoomSP(roomGuid, quoteId, true)` for you).

If the player had already joined, the server returns their existing session on the first request and the second is skipped — `JoinRoom` resolves with that existing session. A refused join rejects with `Failed to join room: <server response body>`; a first request that returns neither a session nor a quote rejects with `Failed to join room: the server returned neither an existing session nor a lobby quote`; a failed second leg rejects with `Failed to start gameplay session`.

**Returns:** `Promise<RoomSessionData>` - The two identifiers that address this run. Keep both for the rest of the session lifecycle — every subsequent call (`EndRoomSP`, `GetLeaderboard`, `CreateSession_Client`) needs them.

**RoomSessionData Properties:**
- `EventId` (`string`) - The room/event identifier this run belongs to. Pass it as `eventId` everywhere downstream, and as `eventId` to `CreateSession_Client`.
- `SessionOrMatchId` (`string`) - The identifier of this specific run. Pass it as `sessionOrMatchId` downstream, and as `saveSessionId` to `CreateSession_Client`.

**Usage:**
```js
import { GameTypeEnum } from './funtico-sdk.mjs';

let activeSession = null; // kept for EndRoomSP / GetLeaderboard later

// Simplest form: JoinRoom looks the room up and spends a voucher if there is one to spend
const session = await sdk.JoinRoom(roomGuid);

activeSession = session;

// Create a reconnection checkpoint straight away, so a reload does not lose the paid entry.
await sdk.CreateSession_Client(
  JSON.stringify({ score: 0 }),
  GameTypeEnum.Rooms,
  session.EventId,
  session.SessionOrMatchId
);

startGame(activeSession);
```

```js
import { EntryFeeType } from './funtico-sdk.mjs';

// Explicit form: you already hold the room, so skip JoinRoom's internal GetRoom lookup
async function joinRoomExplicit(roomGuid) {
  const room = await sdk.GetRoom(roomGuid);

  if (!room.IsFree && !room.UserCanJoinWithVoucher) {
    const canAfford = await sdk.CanAfford(EntryFeeType.Tico, room.EntryFee);
    if (!canAfford) return showTopUpDialog();
  }

  const session = await sdk.JoinRoom(room.Guid, room.UserCanJoinWithVoucher);
  return session;
}
```

---

### `StartRoomSP`

Signals the server that gameplay has started and resolves the session to play under. This is the second leg of `JoinRoom` (`POST /Rooms/start-room-sp`), exposed on its own. **You normally never call it:** `JoinRoom` already calls `StartRoomSP(roomGuid, quoteId, true)` for you when a new seat is taken, and skips it when the player had already joined.

**Signature:**
```ts
async StartRoomSP(eventId: string, sessionOrMatchId: string, isLobby = false): Promise<RoomSessionData>
```

**Parameters:**
- `eventId` - Event/Room identifier (`RoomViewModel.Guid`). It is echoed back unchanged as `RoomSessionData.EventId`.
- `sessionOrMatchId` - With `isLobby: true`, the lobby-quote id returned by `POST /Rooms/join-room`; with `isLobby: false`, a game-session id the caller already owns.
- `isLobby` - Declares that `sessionOrMatchId` is a lobby-quote id rather than an existing game-session id. It is **not** a mode switch. `JoinRoom`'s second leg passes `true`; a caller resuming a session it already owns leaves it `false`. Default: `false`.

**Returns:** `Promise<RoomSessionData>` - The same shape `JoinRoom` resolves with: `EventId` is the `eventId` you passed, and `SessionOrMatchId` is the id of the started game session (the wire's `id`, mapped for you). Rejects with `Failed to start gameplay session` on a non-OK response.

**Usage:**
```js
// Advanced: you drive the two legs yourself and already hold a lobby quote id
const session = await sdk.StartRoomSP(roomGuid, lobbyQuoteId, true);

activeSession = session; // same shape as JoinRoom's result: { EventId, SessionOrMatchId }
```

**Important Notes:**
- Prefer `JoinRoom`: it takes the seat, charges the fee or voucher, and calls this method with the right arguments. Calling `StartRoomSP` on top of a successful `JoinRoom` is never needed.
- Requires an authenticated SDK (a player JWT), like the rest of the rooms flow.

---

### `EndRoomSP`

Ends a room run and submits the player's score from the client, encrypted and signed. Call it once, when the run is over.

**Signature:**
```ts
async EndRoomSP(
  eventId: string,
  sessionOrMatchId: string,
  score: number,
  userId: number,
  ip = "127.0.0.1",
  gameEvents: string[] = []
): Promise<any>
```

**Parameters:**
- `eventId` - Event/Room identifier (`RoomSessionData.EventId`).
- `sessionOrMatchId` - Session identifier for this run (`RoomSessionData.SessionOrMatchId`).
- `score` - The player's final score for this run. Scores are **integers**, so the SDK truncates it with `Math.trunc` before encrypting. `99.9` is submitted as `99`; round it yourself first if you want rounding.
- `userId` - The player's SDK user identifier — `UserData.UserId` (not `PlatformId`).
- `ip` - Client IP, sent inside the encrypted payload. You normally leave the default. Default: `"127.0.0.1"`.
- `gameEvents` - Gameplay action log to submit alongside the score. When left empty, the SDK substitutes the events recorded during this session via `RecordEvent_Client`. Default: `[]`. The events travel inside the encrypted payload.

**Returns:** `Promise<any>` - The backend's response to the score submission, returned untyped. Rejects with `Failed to end gameplay session: <server response body>` on a non-OK response.

The SDK encrypts and signs the payload for you — pass the plain `score` and never encrypt it yourself.

**Encryption and `privateGameKey`.** The payload is encrypted and signed with `privateGameKey`. Authentication uses only the public key, so a wrong `privateGameKey` is not caught at `Initialize`; in a game that does not use session checkpoints it goes unnoticed until this call, where it surfaces as HTTP 500 `Padding is invalid and cannot be removed`. A game that calls `CreateSession_Client` often sees a wrong key earlier, as `Failed to create client session`, but not always, so do not treat a working session checkpoint as proof that the key is right. The most common cause — the public and private keys pasted together into `privateGameKey` — is rejected up front by `Initialize` with an `Invalid FunticoConfig: ...` error. See Troubleshooting in the [README](./README.md#10-troubleshooting).

**Session auto-close:** on a successful response the SDK calls `CloseCurrentSession_Client()` for you, clearing the tracked client session ids and the recorded event log. You do not need to close the session manually, and any `UpdateSession_Client` call after this point will throw because no session is tracked any more.

**Usage:**
```js
async function gameOver(finalScore) {
  const session = activeSession;
  const user = sdk.GetCachedUserData() ?? await sdk.GetUserData();

  // Events recorded during play are attached automatically
  sdk.RecordEvent_Client(`final_score_${finalScore}`);

  await sdk.EndRoomSP(
    session.EventId,
    session.SessionOrMatchId,
    Math.round(finalScore), // integer on the wire - the SDK would otherwise truncate
    user.UserId
  );

  // The client session is already closed here - go straight to results
  const leaderboard = await sdk.GetLeaderboard(
    session.EventId,
    session.SessionOrMatchId
  );

  showResults(leaderboard);
}
```

**Important Notes:**
- The score is final — the run cannot be re-submitted after a successful call.
- Pass the SDK user id (`UserData.UserId`, not `PlatformId`) as `userId`.

---

## Special Tournaments Methods

These methods provide access to the Funtico Special Tournaments system — timed competitive events with prize pools, leaderboards, and community groupings. All of them are `async` and **reject with an `Error`** when the underlying request fails, so wrap calls in `try/catch`.

The typical lifecycle is: `GetTournaments` → `JoinTournament` (once per tournament) → `EnterTournament` (once per attempt) → play → `ResultTournament_Client` or `ResultTournament_Server` → `GetTournamentLeaderboard`.

### `TournamentsFilterEnum`

String enum used to narrow `GetTournaments` to a single tournament status. The value is sent verbatim as the `filterEnum` query parameter. With the ESM build import it by name; with the `<script>` build it is `FunticoSDK.TournamentsFilterEnum`.

**TournamentsFilterEnum Properties:**
- `OnGoing` (`'OnGoing'`) - Tournaments that have started and have not yet ended — the ones a player can enter and score in right now.
- `Upcoming` (`'Upcoming'`) - Tournaments that are announced but have not started yet. A player may be able to join (register) but cannot submit scores.
- `Finished` (`'Finished'`) - Tournaments whose end time has passed. Useful for showing final standings and prize results.

---

### `GetTournaments`

Gets available special tournaments with pagination and an optional status filter. Call this to build a tournament browser or lobby list.

**Signature:**
```ts
async GetTournaments(page = 1, perPage = 100, filter?: TournamentsFilterEnum): Promise<TournamentViewModel[]>
```

**Parameters:**
- `page` - Page number, 1-based. Default: `1`.
- `perPage` - Number of tournaments per page. Default: `100`.
- `filter` - Optional status filter (`OnGoing`, `Upcoming`, `Finished`). When omitted, the `filterEnum` query parameter is not sent and the server applies no status filter.

**Returns:** `Promise<TournamentViewModel[]>` - Array of tournaments on the requested page, each one carrying its identifier, schedule, entry requirements, and prize-pool labelling.

**TournamentViewModel Properties:**
- `Id` (`string`) - **The tournament identifier.** This is the value you pass as `tournamentId` to every other method in this section.
- `Guid` (`string`) - The same value as `Id`. Use whichever name reads better; they are always identical.
- `Plaftorfm_Guid` (`string`) - The same value as `Id` and `Guid`.
- `Name` (`string`) - Display name of the tournament, shown to players.
- `Description` (`string`, optional) - Longer descriptive text for the tournament, for a details panel.
- `EntryFee` (`number`, optional) - Amount charged to enter, expressed in the currency named by `EntryFeeType`.
- `EntryFeeType` (`EntryFeeType`, optional) - Which currency or ticket the `EntryFee` is denominated in (`IC`, `Tico`, `SemifinalsTickets`, `FinalTickets`, `Free`, `InventoryItem`, `PrivateTickets`). Feed this to `CanAffordFromCache` to gate the join button.
- `EntryFeeItemId` (`number | null`, optional) - Inventory item required to enter, when `EntryFeeType` is `InventoryItem`. `null` when the fee is not item-based.
- `EntryFeeItemName` (`string | null`, optional) - Display name of that inventory item, for the entry-requirement label.
- `EntryFeeItemImage` (`string | null`, optional) - URL of the item's artwork. Load it yourself (an `<img>` element or your engine's loader); the SDK does not fetch it.
- `StartDate` (`string`, optional) - ISO-8601 timestamp of when the tournament opens for scoring.
- `EndDate` (`string | null`, optional) - ISO-8601 timestamp of when the tournament stops accepting scores. `null` for tournaments with no scheduled end.
- `LeftSeconds` (`number`, optional) - Seconds remaining until the tournament ends, as computed by the server at response time. Convenient for a countdown without trusting the client clock; re-fetch to resynchronise.
- `PlayerLimit` (`number | null`, optional) - Maximum number of distinct players who may join. `null` when the tournament is uncapped.
- `EntryLimit` (`number`, optional) - Maximum number of scoring attempts a player may spend in this tournament.
- `HavePassword` (`boolean | null`, optional) - Whether the tournament is password-protected. When `true`, `JoinTournament` requires the `password` argument.
- `PrizePoolLabel` (`string`, optional) - Pre-formatted, human-readable prize-pool summary for display, e.g. `"50K TICO, Private Passes & More"`. Render it verbatim; it is not machine-parseable. For the structured table, call `GetPrizes`.
- `GuaranteedPrizePoolUsd` (`number`, optional) - Guaranteed prize-pool value in USD.
- `Gpp` (`number | null`, optional) - Guaranteed prize pool as a raw number. `null` when the tournament advertises no guarantee.
- `GppLabel` (`string | null`, optional) - Pre-formatted display label for `Gpp`. `null` when there is nothing to show.
- `ScoreMode` (`string`, optional) - How a player's ranked score is chosen from their attempts (for example, best attempt versus accumulated). Sent as a plain string; the SDK declares no enum for it, so treat unknown values as display-only.
- `ScoreType` (`string`, optional) - What the score represents (for example, points versus time). Also a plain string with no SDK-side enum — do not switch on it without a fallback.
- `IsKycRequired` (`boolean`, optional) - Whether the player must be KYC-verified to take part. Check against `UserData.KYCVerified` before offering the join button.
- `Settings` (`string | null`, optional) - Opaque per-tournament configuration supplied by the platform as a raw string. The SDK neither parses nor interprets it; `null` when unset.
- `PracticeStartTime` (`string | null`, optional) - ISO-8601 start of the practice window, when the tournament has one. `null` otherwise.
- `PracticeEndTime` (`string | null`, optional) - ISO-8601 end of the practice window. `null` otherwise.
- `MinPlayerLevel` (`number`, optional) - Lowest platform level allowed to enter. Compare against `UserData.Level`.
- `MaxPlayerLevel` (`number`, optional) - Highest platform level allowed to enter, for bracketed tournaments.
- `SpecialTournamentsType` (`number`, optional) - Numeric category discriminator assigned by the platform. The SDK declares no enum for the values.

The type also declares `GameId`, `MapId`, `StartsAt`, `EndsAt`, `MaxEntries`, `EntriesCount` and `IsJoined`. They are left over from earlier SDK versions and are **never sent by the API**, so they are always `undefined` (editors still offer them in autocompletion). Use `StartDate`, `EndDate` and `EntryLimit` instead; there is no replacement for the others (join state comes from the join/enter flow).

**Usage:**
```js
import { TournamentsFilterEnum } from './funtico-sdk.mjs';
// <script> build: const { TournamentsFilterEnum } = FunticoSDK;

// First page of live tournaments
const ongoing = await sdk.GetTournaments(1, 20, TournamentsFilterEnum.OnGoing);

ongoing.forEach(t => {
  console.log(`${t.Name} — starts ${t.StartDate}, up to ${t.EntryLimit} entries`);
  console.log(`  ${t.PrizePoolLabel} — entry fee ${t.EntryFee}`);
  // -> "Weekend Cup — starts 2026-01-10T18:00:00Z, up to 40 entries"
  // -> "  50K TICO, Private Passes & More — entry fee 100"
});

// `Id` is the identifier every other tournament method accepts.
const first = ongoing[0];
console.log(first.Id);    // "3f6c2a9e-1b7d-4c55-9a0e-7d2f8b4c1e60"
console.log(first.Guid);  // same value
```

---

### `GetTournamentDetailsLight`

Gets the current metadata for a single tournament without the leaderboard player list. Use it to refresh one tournament card cheaply, for example after a join.

**Signature:**
```ts
async GetTournamentDetailsLight(tournamentId: string): Promise<TournamentViewModel>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`, equivalently `.Guid`).

**Returns:** `Promise<TournamentViewModel>` - The same shape returned by `GetTournaments`, for a single tournament. See the **TournamentViewModel Properties** block under `GetTournaments`.

**Usage:**
```js
const details = await sdk.GetTournamentDetailsLight(tournamentId);

console.log(`${details.Name}: ${details.StartDate} → ${details.EndDate}`);
console.log(`Ends in ${details.LeftSeconds}s`);

// A join that cannot go through rejects — handle it with try/catch.
try {
  await sdk.JoinTournament(details.Id);
} catch (err) {
  console.log('Not joinable (already joined, full, or unaffordable):', err);
}
```

---

### `GetTournamentLeaderboard`

Gets the full standings for a tournament, including every ranked player and the current user's own entry. Call this after submitting a result, or to render a live standings screen.

**Signature:**
```ts
async GetTournamentLeaderboard(tournamentId: string): Promise<TournamentLeaderboardViewModel>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`).

**Returns:** `Promise<TournamentLeaderboardViewModel>` - The tournament's metadata plus the ranked player list and the authenticated user's placement.

**TournamentLeaderboardViewModel Properties:**

Extends `TournamentViewModel` — every field listed under `GetTournaments` is present here too — and adds:
- `Players` (`TournamentPlayerViewModel[]`) - The ranked players on the leaderboard, ordered by `Place`.
- `CurrentPlayer` (`TournamentPlayerViewModel`, optional) - The authenticated user's own leaderboard entry, returned even when the user does not appear in `Players`. Absent when the user has no scored attempt yet.
- `TotalPlayers` (`number`, optional) - Total number of participants across the whole leaderboard, not just the returned `Players` slice. Use it for "rank X of Y" text.

**TournamentPlayerViewModel Properties:**

The tournament leaderboard keeps each player's **best** score across their attempts.
- `Place` (`number`) - The player's rank on the leaderboard, 1-based (`1` is first place).
- `Points` (`number`) - The player's ranked score for this tournament.
- `Score` (`number`) - The same value as `Points`.
- `Name` (`string`) - The player's display name.
- `UserName` (`string`) - The same value as `Name`.
- `FunticoId` (`number`) - The player's identifier on the Funtico platform. **This is the field to match against `UserData.PlatformId`** when you need to find the local player in the list.
- `UserId` (`string`) - A GUID string. Use `FunticoId` for identity checks.
- `AvatarUrl` (`string`, optional) - URL of the player's avatar, flattened from `user_avatar.url`. Load it yourself (an `<img>` element or your engine's loader); the SDK does not fetch it. Absent when the player has no avatar.
- `user_avatar` (`object`, optional) - The avatar object: `url` (`string`), plus optional `type`, `name` and `description` (each `string | null`).
- `user_border` (`object`, optional) - The player's profile-border artwork, same shape as `user_avatar`: `url` plus optional `type`, `name`, `description`. Read `user_border.url` directly.
- `TimesPlayed` (`number`, optional) - How many scoring attempts the player has spent in this tournament.
- `BestTime` (`number`, optional) - The player's best time, for tournaments ranked on time rather than points. Meaningless for point-ranked tournaments — check `ScoreType` on the tournament before showing it.
- `PlatformAvatar` (`string | null`, optional) - Avatar URL sourced from the platform profile, distinct from the tournament-scoped `user_avatar`. `null` when unset.
- `Community` (`string | null`, optional) - The community the player represents in this tournament, when they joined under one. `null` otherwise.

**Usage:**
```js
const leaderboard = await sdk.GetTournamentLeaderboard(tournamentId);

if (leaderboard.CurrentPlayer) {
  console.log(`You: #${leaderboard.CurrentPlayer.Place} of ${leaderboard.TotalPlayers} — ${leaderboard.CurrentPlayer.Score}`);
}

leaderboard.Players.forEach(p => {
  console.log(`#${p.Place} ${p.UserName} — ${p.Score}`);
  // -> "#1 PlayerOne — 11675"
});

// Identity checks go through FunticoId, matched against PlatformId.
const me = sdk.GetCachedUserData();
const mine = leaderboard.Players.find(p => p.FunticoId === me?.PlatformId);

// The leaderboard also carries the tournament's own metadata.
console.log(`${leaderboard.Name} — ${leaderboard.PrizePoolLabel}`);
```

---

### `GetTournamentCommunities`

Gets the community groups a player can be assigned to inside a tournament. Call this before `JoinTournament` if you want to let the player pick a community to represent.

**Signature:**
```ts
async GetTournamentCommunities(tournamentId: string): Promise<TournamentCommunityViewModel[]>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`).

**Returns:** `Promise<TournamentCommunityViewModel[]>` - Array of communities available in this tournament. Empty when the tournament has no community grouping.

**TournamentCommunityViewModel Properties:**
- `Uuid` (`string`) - The community's unique identifier. This is the value to pass as `communityId` to `JoinTournament`.
- `Name` (`string`) - Community display name, e.g. the guild or team name shown in the picker.
- `Description` (`string`) - Longer descriptive text for the community.
- `MembersCount` (`number`) - How many players are currently in this community.

**Usage:**
```js
const communities = await sdk.GetTournamentCommunities(tournamentId);

communities.forEach(c => console.log(`${c.Name} — ${c.MembersCount} members`));

// Player picks one, then joins under it
if (communities.length > 0) {
  await sdk.JoinTournament(tournamentId, communities[0].Uuid);
}
```

---

### `JoinTournament`

Registers the authenticated player in a tournament. It does not start a game session — it is what makes the *next* `EnterTournament` legal.

**Call `JoinTournament` before every `EnterTournament`.** Each scored attempt consumes the registration, so join again before each new attempt. The sequence is `JoinTournament` → `EnterTournament` → *(gameplay)* → `ResultTournament_Client`, once per attempt — not one join followed by many enters.

> **Important — joining ends any open attempt.** Before it registers the player, `JoinTournament` ends every attempt the player has opened with `EnterTournament` and not yet submitted, in **any** tournament, not just this one. Each of them counts as unsuccessful and appears in the player's history with no score. Never call `JoinTournament` — for this or any other tournament — between `EnterTournament` and `ResultTournament_Client` / `ResultTournament_Server`; submit the current attempt first. Once `JoinTournament` has run, the old `saveScoreId` has already been scored as a failure, and submitting it afterwards does not recover the attempt. The normal Join → Enter → Result → Join cycle is unaffected.

**Signature:**
```ts
async JoinTournament(tournamentId: string, communityId?: string, password?: string): Promise<boolean>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`).
- `communityId` - Optional community UUID (`TournamentCommunityViewModel.Uuid`) to join under. When omitted, the `communityId` query parameter is not sent.
- `password` - Optional password for password-protected tournaments. URL-encoded by the SDK before it is sent.

**Returns:** `Promise<boolean>` - `true` when the player was registered. The call rejects with an `Error` if the request fails (wrong password, tournament full, entry fee unaffordable).

**Usage:**
```js
try {
  // Open tournament
  await sdk.JoinTournament(tournamentId);

  // Under a community
  await sdk.JoinTournament(tournamentId, communityUuid);

  // Password-protected
  await sdk.JoinTournament(tournamentId, undefined, 'secret123');
} catch (err) {
  console.error('Could not join tournament:', err);
}
```

```js
// One attempt = one join. Re-join before every entry, including the second and later ones.
async function playAttempt(tournamentId, score) {
  await sdk.JoinTournament(tournamentId);              // mandatory, every time
  const enter = await sdk.EnterTournament(tournamentId);

  await sdk.ResultTournament_Client(tournamentId, enter.TournamentScoreUuid, score, true);
  // The next attempt needs a fresh JoinTournament before its EnterTournament.
}
```

---

### `EnterTournament`

Opens a scoring attempt and returns the identifier needed to submit its result. Call this immediately before gameplay starts, once per attempt, and always after a fresh `JoinTournament`.

> ### `TournamentScoreUuid` is the `saveScoreId`
>
> `TournamentScoreUuid` is the value to pass as the `saveScoreId` argument of `ResultTournament_Client` / `ResultTournament_Server`. Keep it for the whole run and submit with `enter.TournamentScoreUuid`.

**Signature:**
```ts
async EnterTournament(tournamentId: string): Promise<TournamentEnterData>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`). The player must have joined it already, with a join that has not yet been spent by a scored attempt.

**Returns:** `Promise<TournamentEnterData>` - The entry record for this attempt.

**TournamentEnterData Properties:**
- `TournamentScoreUuid` (`string`) - **The `saveScoreId`.** Identifier of the tournament score record this attempt will be written to. Keep it for the whole run and pass it as the `saveScoreId` argument of `ResultTournament_Client` / `ResultTournament_Server`. It must be the value from the matching `EnterTournament` call.
- `LocalTournamentUUID` (`string`) - The SDK-side identifier for the attempt. Game code does not need it.
- `LocalTournamentUuid` (`string`) - Alias of `LocalTournamentUUID` added by the SDK (the wire spells it in all caps). **Not** a valid `saveScoreId` — the platform rejects it; always submit with `TournamentScoreUuid`.

**Usage:**
```js
const enter = await sdk.EnterTournament(tournamentId);

const saveScoreId = enter.TournamentScoreUuid;

// Keep it for the whole run. `gameState` and `startGame` are your own code.
gameState.saveScoreId = saveScoreId;
startGame({ tournamentId, saveScoreId });
```

```js
import { TournamentsFilterEnum } from './funtico-sdk.mjs';

// The full path: join, enter, score, read the board back.
const [t] = await sdk.GetTournaments(1, 1, TournamentsFilterEnum.OnGoing);

await sdk.JoinTournament(t.Id);
const enter = await sdk.EnterTournament(t.Id);

await sdk.ResultTournament_Client(t.Id, enter.TournamentScoreUuid, 9999, true);

const board = await sdk.GetTournamentLeaderboard(t.Id);
const me = board.CurrentPlayer;
console.log(`Points ${me?.Points}, place ${me?.Place}`); // -> "Points 9999, place 2"
```

---

### `GetPrizes`

Gets the prize table configured for a tournament. Use it to render a "what you can win" panel next to the leaderboard.

**Signature:**
```ts
async GetPrizes(tournamentId: string): Promise<TournamentPrizesViewModel>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`).

**Returns:** `Promise<TournamentPrizesViewModel>` - An object wrapping the prize table. Note this is an **object with a `Prizes` array**, not a bare array. `Prizes` is empty when the tournament has no prize table configured.

**TournamentPrizesViewModel Properties:**
- `Prizes` (`TournamentPrizePlaceViewModel[]`) - One entry per place, or per range of places, in the prize table.

**TournamentPrizePlaceViewModel Properties:**
- `Uuid` (`string`) - Identifier of this prize-table entry on the platform.
- `Name` (`string`) - Human-readable label for the range, e.g. `"1st place"`.
- `Type` (`string`) - The kind of placement rule this entry represents, e.g. `"specific_place"` for a single ranked place.
- `From` (`number`) - First leaderboard place covered by this entry, inclusive.
- `To` (`number`) - Last leaderboard place covered by this entry, inclusive. Equal to `From` for a single place; greater for a range such as places 11–20.
- `Prizes` (`TournamentPrizeItemViewModel[]`) - Everything a player finishing in this range receives.

**TournamentPrizeItemViewModel Properties:**
- `Name` (`string`) - Prize display name, e.g. `"USDT"`.
- `Description` (`string | null`) - Always `null`: it is not populated.
- `ImageUrl` (`string`) - URL of the prize artwork. Load it yourself (an `<img>` element or your engine's loader).
- `Amount` (`number`) - How many units of the prize this entry grants.
- `Value_usd` (`number | null`) - Indicative worth in USD, for display. `null` when the platform did not supply one.

**Usage:**
```js
const prizes = await sdk.GetPrizes(tournamentId);

if (prizes.Prizes.length === 0) {
  console.log('No prize table for this tournament.');
}

prizes.Prizes.forEach(tier => {
  const range = tier.From === tier.To ? `#${tier.From}` : `#${tier.From}-${tier.To}`;
  const rewards = tier.Prizes.map(p => `${p.Amount} ${p.Name}`).join(', ');
  console.log(`${range} (${tier.Name}): ${rewards}`);
  // -> "#1 (1st place): 100 USDT"
});

// Prize artwork — the SDK does not fetch images; plain <img> elements are enough.
const panel = document.querySelector('#prize-panel');
prizes.Prizes.forEach(tier =>
  tier.Prizes.forEach(p => {
    const img = document.createElement('img');
    img.src = p.ImageUrl;
    img.alt = p.Name;
    panel.appendChild(img);
  })
);
```

> **Note:** this method returns its own prize shape and does **not** use the `Prize` union documented under [Utilities & Types](#utilities--types), which is what `GetPrizePoolDistribution` and `GetHallOfFameDistribution` return. `PrizeUtils.calculatePrize` does not accept these objects.

---

### `GetTournamentsHistory`

Gets a paginated history of the tournaments the authenticated player has taken part in, with their placement and awarded prizes. Use it for a "my tournaments" screen.

**Signature:**
```ts
async GetTournamentsHistory(page = 1, perPage = 10): Promise<TournamentHistoryViewModel>
```

**Parameters:**
- `page` - Page number, 1-based. Default: `1`.
- `perPage` - Entries per page; sent as the `per_page` query parameter. Default: `10`.

**Returns:** `Promise<TournamentHistoryViewModel>` - One page of history entries plus the pagination metadata needed to walk the rest.

**TournamentHistoryViewModel Properties:**
- `Entries` (`TournamentHistoryEntry[]`) - The history entries on this page, one per tournament the player participated in.
- `Meta` (`object`, optional) - Pagination metadata for the request:
  - `CurrentPage` (`number`) - The page that was returned — echoes the `page` argument.
  - `LastPage` (`number`) - Index of the final page. Keep requesting while `CurrentPage < LastPage`.
  - `PerPage` (`number`) - Entries per page the server actually applied.
  - `Total` (`number`) - Total number of history entries across all pages.
  - `From` (`number | null`, optional) - 1-based index of the first entry on this page within the full result set. **`null` when the page is empty**, including an account with no history at all.
  - `To` (`number | null`, optional) - 1-based index of the last entry on this page. `null` under the same conditions as `From`.

**TournamentHistoryEntry Properties:**
- `TournamentName` (`string`) - Display name of the tournament as it was at the time.
- `TournamentUuid` (`string`) - The tournament's UUID — the same identifier as `TournamentViewModel.Id`. Pass it back to `GetTournamentDetailsLight` or `GetTournamentLeaderboard` to reopen the tournament.
- `StartsAt` (`string`, optional) - ISO-8601 timestamp of when the tournament started.
- `EndsAt` (`string`, optional) - ISO-8601 timestamp of when the tournament ended.
- `ScoredAt` (`string`, optional) - ISO-8601 timestamp of the player's last scored attempt. Absent if they joined but never scored.
- `IsFinished` (`boolean`) - Whether the tournament itself has concluded. Placement and prizes are only final once this is `true`.
- `BestScore` (`number`, optional) - The player's best score across all their attempts in this tournament — the score they were ranked on.
- `LeaderboardPlace` (`number`, optional) - The player's rank on the final leaderboard, 1-based.
- `EntriesCount` (`number`, optional) - How many entries (attempts) the player used.
- `MaxEntries` (`number`, optional) - The entry cap that applied to them.
- `GameId` (`number`, optional) - Identifier of the Funtico platform game the tournament belonged to. Useful when one client hosts several games.
- `MapId` (`number`, optional) - Identifier of the map/mode variant the tournament ran on.
- `Prizes` (`TournamentHistoryPrize[]`, optional) - Prizes awarded to the player for this tournament. Absent or empty when they placed outside the prize tiers.

**TournamentHistoryPrize Properties:**
- `Name` (`string`) - Prize display name.
- `Amount` (`number`) - How many units of the prize were awarded.
- `ImageUrl` (`string`, optional) - URL of the prize artwork.
- `IsRedeemed` (`boolean`) - Whether the player has already claimed this prize. `false` means it is still pending collection — a good hook for a "claim" badge.

**Usage:**
```js
const history = await sdk.GetTournamentsHistory(1, 10);

console.log(`Page ${history.Meta?.CurrentPage} of ${history.Meta?.LastPage} (${history.Meta?.Total} total)`);

// From/To are null on an empty page — a player with no history hits this branch.
if (history.Meta?.From == null) {
  console.log('No tournament history yet.');
} else {
  console.log(`Showing entries ${history.Meta.From}–${history.Meta.To}`);
}

history.Entries.forEach(entry => {
  console.log(`${entry.TournamentName} — place #${entry.LeaderboardPlace}, best ${entry.BestScore}`);

  entry.Prizes?.forEach(prize => {
    console.log(`  ${prize.Amount}x ${prize.Name} — ${prize.IsRedeemed ? 'redeemed' : 'pending'}`);
  });
});

// Walk to the next page
if (history.Meta && history.Meta.CurrentPage < history.Meta.LastPage) {
  const next = await sdk.GetTournamentsHistory(history.Meta.CurrentPage + 1, 10);
}
```

---

### `ResultTournament_Server`

Submits a tournament attempt's result from a trusted server. It authenticates as your game rather than as one player, so only call it from server-side code where the private game key is safe — in practice, a trusted Node.js (>= 20) backend.

**Signature:**
```ts
async ResultTournament_Server(
  tournamentId: string,
  saveScoreId: string,
  score: number,
  userId: number,
  isSuccess: boolean,
  ip = "0.0.0.0"
): Promise<TournamentResultViewModel>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`).
- `saveScoreId` - The attempt identifier from `EnterTournament`: **`TournamentEnterData.TournamentScoreUuid`**.
- `score` - The player's final score for this attempt.
- `userId` - The player's identifier in the SDK system (`UserData.UserId`). Unlike the client method, the server call cannot infer the player from a JWT, so you must name them explicitly.
- `isSuccess` - Whether the attempt completed properly. Pass `false` for an abandoned or invalidated run — the score is then discarded rather than ranked, and the attempt is closed out.
- `ip` - The player's IP address, forwarded to the platform as the player's IP. Default: `"0.0.0.0"`. If you leave the argument out, the default string is recorded as the player's IP. This call comes from your server, not the player's device, so pass the player's real IP, which your backend must track itself (for example, from the player's own connection to your server).

**Returns:** `Promise<TournamentResultViewModel>` - The server's acknowledgement. All four fields are always present in the response, but only `Score` is populated (see the note below).

**TournamentResultViewModel Properties:**
- `Score` (`number`, optional) - Echo of the `score` you submitted. When `isSuccess` is `false` no score is recorded, but this field still returns the submitted value.
- `Time` (`number`, optional) - Declared as the attempt duration in seconds.
- `XpReceive` (`number`, optional) - Declared as the experience points awarded for the attempt.
- `IcReceive` (`number`, optional) - Declared as the in-game currency (`EntryFeeType.IC`, i.e. Coins) awarded for the attempt.

> **Note:** only `Score` is populated. `Time`, `XpReceive` and `IcReceive` are always `0`; do not rely on them as awarded XP or currency.

**Usage:**
```js
// Trusted Node.js server code only — never ship the private game key to a browser build
import { FunticoSDK, FunticoEnvironment } from './funtico-sdk.mjs';

const server = FunticoSDK.Instance;
await server.Initialize({
  env: FunticoEnvironment.PROD,
  publicGameKey: process.env.FUNTICO_PUBLIC_GAME_KEY,   // 'your-public-key'
  privateGameKey: process.env.FUNTICO_PRIVATE_GAME_KEY  // 'your-private-key' (secret key only)
  // No userToken: the server path authenticates as the game, not as a player.
});

const result = await server.ResultTournament_Server(
  tournamentId,
  saveScoreId,       // the client's enter.TournamentScoreUuid
  finalScore,
  player.sdkUserId,  // UserData.UserId
  true,
  player.ipAddress
);

console.log(`Submitted ${result.Score}`); // Time/XpReceive/IcReceive are always 0 today
```

**Important Notes:**
- Trusted Node.js servers only. Never call it from a browser, Telegram Mini App or any other client build: it needs `privateGameKey` in the running process, and anything shipped to a client is public.
- No player JWT is involved: the SDK sends `X-User-Key` plus an `X-Server-Key` derived from `privateGameKey` (the private key itself is never sent). `Initialize` without a `userToken` is enough.
- Keys read from environment variables or `.env` files must not carry stray whitespace or a trailing newline — `Initialize` rejects such keys with an `Invalid FunticoConfig: ...` error before any request is made.

---

### `ResultTournament_Client`

Submits a tournament attempt's result from a browser build. The SDK encrypts and signs the payload for you. Use this in games that have no dedicated server.

**Signature:**
```ts
async ResultTournament_Client(
  tournamentId: string,
  saveScoreId: string,
  score: number,
  isSuccess: boolean,
  customData = ""
): Promise<boolean>
```

**Parameters:**
- `tournamentId` - Tournament UUID (`TournamentViewModel.Id`).
- `saveScoreId` - The attempt identifier from `EnterTournament`: **`TournamentEnterData.TournamentScoreUuid`**. It must be the value from the `EnterTournament` call that opened this attempt.
- `score` - The player's final score for this attempt.
- `isSuccess` - Whether the attempt completed properly. Pass `false` for an abandoned run; the score is then discarded rather than ranked.
- `customData` - Optional extra game data, as a string (serialize your own JSON). It is encrypted along with the score. Default: `""`.

**Returns:** Resolves once the score has been saved. Rejects with an `Error` if the server refuses the payload, so branch on `try`/`catch` rather than on the resolved value.

**Usage:**
```js
async function submitTournamentResult(tournamentId, saveScoreId, score) {
  try {
    // Events logged via RecordEvent_Client are attached to the payload automatically
    sdk.RecordEvent_Client('boss_defeated');

    await sdk.ResultTournament_Client(
      tournamentId,
      saveScoreId,       // enter.TournamentScoreUuid
      score,
      true,
      JSON.stringify({ kills: 12, levelReached: 4 })
    );

    // The score is saved by the time this line runs.
    const leaderboard = await sdk.GetTournamentLeaderboard(tournamentId);
    showResults(leaderboard); // your own render function
  } catch (err) {
    console.error('Failed to submit tournament result:', err);
  }
}
```

**Important Notes:**
- Only use in client builds — the server path is `ResultTournament_Server`.
- The SDK encrypts and signs the payload for you; do not encrypt `customData` yourself.
- Events recorded via `RecordEvent_Client` are attached to the payload automatically as `GameEvents`.
- On success the SDK clears local client-session tracking via `CloseCurrentSession_Client()`.
- Scoring an attempt spends the player's tournament registration: call `JoinTournament` again before the next `EnterTournament`.

---

## Hall of Fame Methods

The Hall of Fame is the platform-wide ranking built from every scored run a player has submitted — through Special Tournaments, Rooms, or Practice. Games typically use it to render an all-time or monthly leaderboard screen and the prize table that goes with it.

> **Casing note:** Hall of Fame responses are **camelCase** (`leaderboard`, `totalPoints`, `currentPlayer`), unlike the PascalCase Rooms and Tournaments responses. Read these fields exactly as documented below.

---

### `GetHallOfFame`

Fetches one page of the Hall of Fame ranking, optionally narrowed to a single game mode. Call this when the player opens the leaderboard screen, and again on every page change or filter change.

**Signature:**
```ts
async GetHallOfFame(
  mode: HallOfFamePeriodMode,
  page = 1,
  limit = 10,
  gameMode: HallOfFameGameModeFilter = HallOfFameGameModeFilter.All
): Promise<HallOfFameResponse>
```

**Parameters:**
- `mode` - Ranking period. `HallOfFamePeriodMode.Global` ranks all-time results; `HallOfFamePeriodMode.Monthly` ranks only the current calendar month (UTC). Any other value throws before a request is made.
- `page` - 1-based page index. Page `1` is the top of the leaderboard. Default: `1`.
- `limit` - Number of entries per page. Default: `10`.
- `gameMode` - Restricts the ranking to a single game mode. `HallOfFameGameModeFilter.All` applies no filter — the SDK omits the `gameMode` query parameter entirely rather than sending a value for it. Default: `HallOfFameGameModeFilter.All`.

**HallOfFamePeriodMode Values:**
- `Global` (`0`) - All-time ranking across every result ever recorded. Maps to the `/HallOfFame/global` endpoint.
- `Monthly` (`1`) - Ranking limited to the current calendar month in UTC. Maps to the `/HallOfFame/monthly` endpoint.

**HallOfFameGameModeFilter Values:** (use this enum in game code)
- `All` (`0`) - No filter; ranks across every mode. The `gameMode` query parameter is not sent at all for this value.
- `SpecialTournament` (`1`) - Only results scored in Special Tournaments.
- `Rooms` (`2`) - Only results scored in Rooms matches.
- `Practice` (`3`) - Only results scored in Practice runs.

**HallOfFameGameMode Values:** (wire-level detail — prefer `HallOfFameGameModeFilter` in game code)
- `SpecialTournament` (`0`) - Special Tournaments.
- `Rooms` (`1`) - Rooms.
- `Practice` (`2`) - Practice.

The SDK translates `HallOfFameGameModeFilter` onto these values internally, so game code should pass `HallOfFameGameModeFilter`.

> **Plain JavaScript:** nothing checks these arguments at compile time. Pass the enum members (`HallOfFamePeriodMode.Monthly`, `HallOfFameGameModeFilter.Rooms`) or their numeric values — never the member names as strings (`'Monthly'`, `'Rooms'`). An unrecognised `mode` or `gameMode` makes the call reject before any request is sent.

**Returns:** `Promise<HallOfFameResponse>` - One page of ranked players, the total player count for the current filter, the echoed pagination values, and the calling player's own entry when they have a ranked result. Rejects with an error if the request fails.

**HallOfFameResponse Properties:**
- `leaderboard` (`HallOfFamePlayerEntry[]`) - The requested page of ranked players, ordered best-first. Its length is at most `limit`, and the last page may be shorter.
- `currentPlayer` (`HallOfFamePlayerEntry | null`, optional) - The calling player's own entry, resolved against the same period and game mode filter, with their true global `rank` regardless of which page was requested. It is `null` until the player has at least one ranked result under the active filter — always guard before reading it.
- `totalPlayers` (`number`) - Total number of ranked players matching the current period and game mode filter. Divide by `limit` to compute the page count.
- `page` (`number`) - The 1-based page index this response represents (echoes the request).
- `limit` (`number`) - The entries-per-page value this response was built with (echoes the request).

**HallOfFamePlayerEntry Properties:**
- `userId` (`number`) - The player's SDK-side user ID (the same identifier as `UserId` in user data).
- `funticoId` (`number`) - The player's Funtico platform user ID (the same identifier as `PlatformId` / `FunticoUserId`).
- `displayName` (`string`) - The player's public display name. Reads `"Unknown"` when no profile record can be resolved.
- `avatarUrl` (`string | null`, optional) - URL of the player's avatar image, or `null` if they have none.
- `avatarType` (`string | null`, optional) - The kind of avatar the player has equipped, which tells you how to render `avatarUrl`. `null` if unset.
- `avatarBorder` (`string | null`, optional) - The avatar border the player has equipped, or `null` if none.
- `borderType` (`string | null`, optional) - The category of the equipped avatar border, used together with `avatarBorder` to render the frame. `null` if unset.
- `country` (`string | null`, optional) - The player's country code, for flag display. `null` if not provided.
- `rank` (`number`) - The player's 1-based position in the ranking under the active period and game mode filter.
- `totalPoints` (`number`) - **The player's best single score, not a sum.** The ranking uses the maximum score across the player's runs, so a player with one excellent run outranks a player with many mediocre ones. Label this in UI accordingly ("Best score", not "Total").
- `gamesPlayed` (`number`) - How many ranked runs the player has recorded under the active filter. This is a count of results, and it does not feed into `totalPoints`.
- `playedAt` (`string | null`, optional) - ISO-8601 timestamp of the run that produced `totalPoints` — i.e. when the best score was set, not when the player last played. `null` if no timestamp is available.

Nullable fields on this entry are sent as explicit `null` rather than omitted, which is why they are typed `| null`.

**Usage:**
```js
import { HallOfFamePeriodMode, HallOfFameGameModeFilter } from './funtico-sdk.mjs';

// All-time leaderboard, first page, defaults for page/limit/gameMode
const allTime = await sdk.GetHallOfFame(HallOfFamePeriodMode.Global);

console.log(`Ranked players: ${allTime.totalPlayers}`);
for (const entry of allTime.leaderboard) {
  console.log(`#${entry.rank} ${entry.displayName} — best score ${entry.totalPoints} (${entry.gamesPlayed} games)`);
}

// This month's Rooms-only leaderboard, page 2, 20 per page
const monthly = await sdk.GetHallOfFame(
  HallOfFamePeriodMode.Monthly,
  2,
  20,
  HallOfFameGameModeFilter.Rooms
);

// currentPlayer is null until the player has a ranked result under this filter.
// displayName is player-supplied text: render it with textContent, never innerHTML.
const yourRank = document.querySelector('#your-rank');
if (monthly.currentPlayer) {
  yourRank.textContent = `You: #${monthly.currentPlayer.rank} — ${monthly.currentPlayer.totalPoints}`;
} else {
  yourRank.textContent = 'Play a ranked game to enter the Hall of Fame';
}

// Paging
const pageCount = Math.ceil(monthly.totalPlayers / monthly.limit);
const hasNextPage = monthly.page < pageCount;
```

---

### `GetHallOfFameDistribution`

Fetches the Hall of Fame prize distribution table — which places win what. Call this when rendering the "Prizes" panel next to the leaderboard; it takes no parameters and is not affected by the period or game mode filter.

**Signature:**
```ts
async GetHallOfFameDistribution(): Promise<HOFDistributionResponse>
```

**Returns:** `Promise<HOFDistributionResponse>` - The prize table as a list of tiers, each covering either one individual place or a grouped range of places. Rejects with an error if the request fails.

**HOFDistributionResponse Properties:**
- `items` (`HOFDistributionItem[]`) - The prize tiers, ordered from the top place downward.

**HOFDistributionItem Properties:**
- `place` (`number`) - The place this tier applies to, or the **first** place of a grouped range. 1-based.
- `endPlace` (`number`, optional) - The last place of a grouped range. **Absent for the individual places 1-10, present for the grouped 11-20 and 21-50 tiers.** When present, every place from `place` through `endPlace` inclusive receives the same prizes.
- `range` (`string`, optional) - A ready-to-display label for a grouped range, e.g. `"11-20"`. Absent for individual places 1-10 — for those, render `place` yourself. Present exactly when `endPlace` is.
- `prizes` (`Prize[]`) - Everything awarded at this tier, as the shared `Prize` discriminated union documented under [Utilities & Types](#utilities--types). A tier commonly carries several prizes at once (for example TICO plus two different item stacks). Narrow on the lowercase `type` field.

> This table typically carries `GppPerPlayer` and `Item` prizes, but the union is not narrowed to those two: handle the `type` values your game cares about and ignore the rest.

**Usage:**
```js
import { PrizeType } from './funtico-sdk.mjs';

const distribution = await sdk.GetHallOfFameDistribution();
const prizeList = document.querySelector('#hof-prizes');

for (const item of distribution.items) {
  // range/endPlace exist only for the grouped tiers (11-20, 21-50)
  const label = item.range ?? `${item.place}`;

  for (const prize of item.prizes) {
    if (prize.type === PrizeType.GppPerPlayer) {
      console.log(`Place ${label}: ${prize.Value} TICO`);
    } else if (prize.type === PrizeType.Item) {
      const name = prize.Item?.name ?? `item #${prize.ItemId}`;
      console.log(`Place ${label}: ${prize.Amount}x ${name}`);

      if (prize.Item) {
        // Item artwork - load it with your engine's loader, or a plain <img> as here
        const icon = new Image();
        icon.src = prize.Item.image;
        icon.alt = name;
        prizeList.append(icon);
      }
    }
  }
}

// Find the tier that covers a given place
const placeOf = (place) =>
  distribution.items.find(i => place >= i.place && place <= (i.endPlace ?? i.place));
```

---

## Campaign Methods

Campaign Mode is a fixed ladder of authored levels the player works through in order. Each level is played in its own **attempt**, scored by a flat set of **metrics** the game reports, and graded server-side into **stars** that gate rewards and unlock the next level. These methods cover the whole loop — checking that a campaign exists, listing levels with the player's progress, starting an attempt, and submitting the finished run.

The typical flow is `IsCampaignAvailable` → `GetCampaignLevels` → `StartCampaignLevel` → *(gameplay)* → `CompleteCampaignLevel` → `GetCampaignLevels` again for the unlock cascade.

> **Casing note:** Campaign responses are **PascalCase** (`IsAvailable`, `BestStars`, `Rewards`), like most of the SDK — and unlike the camelCase Hall of Fame responses documented above.

**Stars are computed server-side.** The client reports metrics; the backend evaluates the level's star rules against them and answers with the stars earned. Render `StarRules` as UI ("finish under 60s for 2 stars"), but never compute stars yourself and never try to submit them — nothing the client sends can claim a star directly.

**The metrics contract.** `CompleteCampaignLevel` takes a flat `name -> value` map (`CampaignMetrics`): 1-32 entries, each name 1-64 characters, each value a **finite number or a boolean**. Booleans are normalized to `1`/`0` for the wire. **Fractional numbers are allowed** — `time: 47.35` survives intact, unlike `EndRoomSP`'s `score`, which is an integer and gets truncated. Violations throw a `CampaignError` with `Code: InvalidMetrics` client-side, before anything is encrypted or sent.

**Failure model.** Campaign methods reject with a `CampaignError` carrying a machine-readable `Code` (see the [`CampaignError`](#campaignerror) block at the end of this section) — branch on the code, never on message text. Two outcomes are deliberately *not* errors: a game without a campaign reports `IsAvailable: false` as plain data, and a **lost run resolves normally** with `IsWin: false, Stars: 0`.

**Cache invalidation.** `GetCampaignAvailability` and `GetCampaignLevels` share the SDK-wide cache window (`FunticoConfig.cacheTTL` — see the caching model under [User Data Methods](#user-data-methods)). A successful `CompleteCampaignLevel` drops the cached level list automatically, because completion can unlock the next level server-side — the next `GetCampaignLevels(true)` refetches instead of serving a list where that level still reads `Locked`. It also updates the cached availability's `LevelCount`/`MaxStars` from the completion's own totals.

> The examples in this section call a few functions that stand for your own game code — `showScreen(name)` (your screen router), `showToast(text)`, `startCampaignGame(...)` (hands over to your gameplay loop), `showVictory(...)`, `showDefeat()`, `showUnlockBanner(...)`. They are not part of the SDK.

---

### `GetCampaignAvailability`

Checks whether the game has a campaign configured, and its headline numbers, without fetching the full level list. Call it when building the main menu to decide whether to show the campaign entry at all.

This is the one Campaign method that **works before authentication** — only the game key is required, so even a pre-login menu can gate its campaign button on it. The JWT is attached when one exists, but its absence does not throw, unlike every other Campaign method.

**Signature:**
```ts
async GetCampaignAvailability(useCache = true): Promise<CampaignAvailabilityViewModel>
```

**Parameters:**
- `useCache` - When `true`, returns the cached copy if one exists and the shared TTL window has not expired. When `false`, always issues a `GET /Campaign/availability` request and refreshes the cache. Default: `true`.

**Returns:** `Promise<CampaignAvailabilityViewModel>` - The campaign's headline numbers. **"No campaign" is data, not an error:** the endpoint answers `200` with `IsAvailable: false` for a game without one, so this only rejects on a real failure (network, server error).

**CampaignAvailabilityViewModel Properties:**
- `IsAvailable` (`boolean`) - Whether the game currently has an active campaign. Gate the campaign menu button on this flag.
- `LevelCount` (`number`) - How many levels the campaign holds.
- `MaxStars` (`number`) - The maximum stars obtainable across the whole campaign. Render campaign-wide progress as `TotalStarsEarned` / `MaxStars` once the level list is loaded.

**Usage:**
```js
const campaignButton = document.querySelector('#campaign-button');
const availability = await sdk.GetCampaignAvailability();

campaignButton.hidden = !availability.IsAvailable;
if (availability.IsAvailable) {
  campaignButton.textContent = `Campaign — ${availability.LevelCount} levels`;
}
```

---

### `GetCachedCampaignAvailability`

Returns the availability already held in memory, with no network call and no TTL check.

**Signature:**
```ts
GetCachedCampaignAvailability(): CampaignAvailabilityViewModel | null
```

**Returns:** `CampaignAvailabilityViewModel | null` - The cached availability, or `null` if `GetCampaignAvailability` has never completed in this session.

**Usage:**
```js
const availability = sdk.GetCachedCampaignAvailability();
document.querySelector('#campaign-button').hidden = !(availability?.IsAvailable ?? false);
```

---

### `IsCampaignAvailable`

Convenience shorthand for `(await GetCampaignAvailability(useCache)).IsAvailable`.

**Signature:**
```ts
async IsCampaignAvailable(useCache = true): Promise<boolean>
```

**Parameters:**
- `useCache` - Forwarded to `GetCampaignAvailability`. Default: `true`.

**Returns:** `Promise<boolean>` - Whether the game currently has an active campaign.

**Usage:**
```js
if (await sdk.IsCampaignAvailable()) {
  showScreen('campaign-map');
}
```

---

### `GetCampaignLevels`

Fetches the campaign level list with the player's progress folded in. This is the level-select call.

**Signature:**
```ts
async GetCampaignLevels(useCache = true): Promise<CampaignLevelsViewModel>
```

**Parameters:**
- `useCache` - When `true`, returns the cached copy if one exists and the shared TTL window has not expired. When `false`, always issues a `GET /Campaign/levels` request and refreshes the cache. Note that a successful `CompleteCampaignLevel` drops this cache, so the first `GetCampaignLevels(true)` after a completion refetches regardless. Default: `true`.

**Returns:** `Promise<CampaignLevelsViewModel>` - The full campaign: progress counters plus one entry per level. Always a `200` on the wire — an empty campaign comes back as `IsAvailable: false` with `Levels: []` — so a rejection here is a real failure, not "no campaign".

**CampaignLevelsViewModel Properties:**
- `IsAvailable` (`boolean`) - Whether the campaign is active. `false` comes with an empty `Levels` array.
- `TotalLevels` (`number`) - How many levels the campaign holds.
- `CompletedLevels` (`number`) - How many of them this player has completed.
- `TotalStarsEarned` (`number`) - The player's stars summed across every level's best result.
- `MaxStars` (`number`) - The maximum stars obtainable across the whole campaign. Render overall progress as `TotalStarsEarned` / `MaxStars`.
- `Levels` (`CampaignLevelViewModel[]`) - Every level, in campaign order.

**CampaignLevelViewModel Properties:**
- `Id` (`string`) - The level's identifier. Pass it to `StartCampaignLevel`.
- `Order` (`number`) - The level's position in the ladder.
- `Name` (`string`) - Display name.
- `Description` (`string | null`, optional) - Longer display description, or `null` when none is configured.
- `Status` (`CampaignLevelStatus`) - `Locked` (0), `Unlocked` (1) or `Completed` (2). Drives the lock icon; only an `Unlocked` or `Completed` level can be started.
- `BestStars` (`number`) - The most stars the player has earned on this level. `0` until they win it. Drives the star row on the level card.
- `BestMetrics` (`Record<string, number> | null`) - The metrics of the player's best run, or `null` when they have none. Use it for "your best: 47.3s" labels.
- `LevelConfigJson` (`string | null`) - Your game's own level configuration as an opaque JSON string — the SDK renames the wire's `LevelJsonData` onto this. **`null` while the level is `Locked`** (the server withholds it), non-null once unlocked. Parse it with `GetCampaignLevelConfig()`.
- `StarRules` (`CampaignStarRules | null`) - The level's star thresholds, parsed for you from the wire's JSON string. `null` while the level is `Locked`, and `null` again when the stored rules do not parse — one level's bad rules never reject the whole list. **For display only** — stars are computed server-side.
- `MinDurationSeconds` (`number`) - The server's minimum plausible clear time. A completion submitted faster than this is rejected with `CompletionTooFast`.
- `ConfigVersion` (`number`) - Version of the level's configuration. `StartCampaignLevel` echoes the version the attempt was started against.
- `Rewards` (`CampaignRewardViewModel[]`) - What completing the level can grant, gated per-reward by `RequiredStars`. Empty when the level grants nothing.
- `CompletedAt` (`string | null`, optional) - ISO-8601 timestamp of the player's first completion, or `null` while the level is uncompleted.

**CampaignLevelStatus Values:**
- `Locked` (`0`) - Not reachable yet; config and star rules are withheld.
- `Unlocked` (`1`) - Playable, not yet completed.
- `Completed` (`2`) - Won at least once; still replayable to improve `BestStars`.

**CampaignStarRules Properties:**
- `Win` (`CampaignStarRuleCondition[]`) - The conditions a run must meet to count as a win at all.
- `Stars` (`CampaignStarTier[]`) - One tier per star: `Star` (`number`) plus its `Conditions`.

**CampaignStarRuleCondition Properties:**
- `Metric` (`string`) - The metric name the condition reads.
- `Op` (`string`) - The comparison operator, e.g. `">="`.
- `Value` (`number`) - The threshold.

**CampaignRewardViewModel Properties:**
- `Type` (`string`) - What kind of reward this is, as the backend names it.
- `Amount` (`number`) - How many/how much is granted.
- `ItemId` (`number | null`, optional) - The platform item granted, when the reward is an item.
- `RequiredStars` (`number`) - Minimum stars the completing run must earn for this reward to be granted.
- `Name` (`string | null`, optional) - Display name, when configured.
- `ImageUrl` (`string | null`, optional) - Artwork URL, when configured. Load it with your engine's own loader (or a plain `<img>`).

**Usage:**
```js
import { CampaignLevelStatus } from './funtico-sdk.mjs';

async function renderCampaignMap() {
  const campaign = await sdk.GetCampaignLevels();

  if (!campaign.IsAvailable) {
    showScreen('menu');
    return;
  }

  document.querySelector('#campaign-progress').textContent =
    `${campaign.TotalStarsEarned} / ${campaign.MaxStars} ★`;

  const list = document.querySelector('#level-list');
  list.replaceChildren();

  for (const level of campaign.Levels) {
    const card = document.createElement('button');
    card.textContent = `${level.Order}. ${level.Name}`;

    if (level.Status === CampaignLevelStatus.Locked) {
      card.disabled = true;             // config and star rules are withheld while locked
      card.textContent += ' (locked)';
    } else {
      card.textContent += ` ${'★'.repeat(level.BestStars)}`;
      card.addEventListener('click', () => enterLevel(level));
    }

    list.append(card);
  }
}
```

---

### `GetCachedCampaignLevels`

Returns the level list already held in memory, with no network call and no TTL check. Note that a successful `CompleteCampaignLevel` clears this cache, so right after a completion it returns `null` until `GetCampaignLevels` runs again.

**Signature:**
```ts
GetCachedCampaignLevels(): CampaignLevelsViewModel | null
```

**Returns:** `CampaignLevelsViewModel | null` - The cached campaign, or `null` if none is cached.

**Usage:**
```js
const campaign = sdk.GetCachedCampaignLevels()
  ?? await sdk.GetCampaignLevels();
```

---

### `GetCampaignLevelConfig`

Parses a level's opaque config JSON into your game's own type. The schema is **your game's** — the platform stores the string untouched and the SDK never inspects it. In TypeScript, define your own interface and pass it as `T`; in plain JavaScript the parsed value is returned as-is, and a JSDoc cast (shown below) gives editors and `// @ts-check` files the same checking.

**Signature:**
```ts
GetCampaignLevelConfig<T = unknown>(level: CampaignLevelViewModel): T
```

**Parameters:**
- `level` - The level whose `LevelConfigJson` to parse, from `GetCampaignLevels`.

**Returns:** `T` - The parsed config, cast to your type (in plain JavaScript: the value `JSON.parse` produced). Synchronous — no request is made. Throws a plain `Error` (not a `CampaignError`) when the level is still `Locked` (`LevelConfigJson` is `null` — the server withholds it until unlock) or when the stored string is not valid JSON.

**Usage:**
```js
/**
 * The schema is your game's - describe it however you like (a JSDoc typedef here).
 * @typedef {object} MyLevelConfig
 * @property {number} enemyWaves
 * @property {number} timeLimitSeconds
 * @property {string} tilemapKey
 */

const config = /** @type {MyLevelConfig} */ (sdk.GetCampaignLevelConfig(level));

startCampaignGame({
  levelId: level.Id,
  waves: config.enemyWaves,
  timeLimit: config.timeLimitSeconds
});
```

---

### `StartCampaignLevel`

Starts an attempt at a level and tracks it as the active attempt. Call it right before gameplay begins — the attempt's `StartedAt` is what `CompletionTooFast` is measured against.

**Signature:**
```ts
async StartCampaignLevel(levelId: string): Promise<CampaignAttemptData>
```

**Parameters:**
- `levelId` - The level's identifier (`CampaignLevelViewModel.Id`). Sent as the `levelId` query value of `POST /Campaign/start-level`.

**Returns:** `Promise<CampaignAttemptData>` - The started attempt. The SDK stores it internally, so `CompleteCampaignLevel` can be called without threading it through your screens and game code. Rejects with a `CampaignError` — `LevelLocked` when the level is not reachable yet, `LevelNotFound` for an unknown id, `CampaignNotAvailable` when the game has no active campaign.

**Re-starting replaces the tracked attempt.** Calling `StartCampaignLevel` again — for the same level or another — simply makes the new attempt the tracked one, and there is nothing to clean up client-side. Starting the **same** level abandons that level's previous open attempt. An open attempt at a **different** level is left open: that is harmless because the SDK no longer tracks it, but it can still be completed if you kept it and pass it explicitly to `CompleteCampaignLevel(metrics, attempt)`.

**CampaignAttemptData Properties:**
- `AttemptId` (`string`) - The attempt's identifier.
- `LevelId` (`string`) - The level this attempt belongs to (echoes the request).
- `ConfigVersion` (`number`) - The level-config version this attempt was started against. If it differs from the `ConfigVersion` you rendered, the level changed under you — refetch before playing.
- `StartedAt` (`string`) - ISO-8601 timestamp of when the server started the attempt.

**Usage:**
```js
import { CampaignError, CampaignErrorCode } from './funtico-sdk.mjs';

async function enterLevel(level) {
  try {
    const attempt = await sdk.StartCampaignLevel(level.Id);
    console.log(`Attempt ${attempt.AttemptId} started at ${attempt.StartedAt}`);
    startCampaignGame({ level });
  } catch (error) {
    if (error instanceof CampaignError && error.Code === CampaignErrorCode.LevelLocked) {
      showToast('Complete the previous level first!');
    } else {
      throw error;
    }
  }
}
```

---

### `GetActiveCampaignAttempt`

Returns the attempt `StartCampaignLevel` is currently tracking, synchronously and without a request.

**Signature:**
```ts
GetActiveCampaignAttempt(): CampaignAttemptData | null
```

**Returns:** `CampaignAttemptData | null` - The tracked attempt, or `null` when none is in flight — before any `StartCampaignLevel`, after a successful `CompleteCampaignLevel`, after `AbandonCampaignAttempt`, or after a completion failed with `AttemptNotFound` or `CompletionTooFast`.

**Usage:**
```js
const attempt = sdk.GetActiveCampaignAttempt();
if (attempt) {
  console.log(`A run of level ${attempt.LevelId} is still in flight`);
}
```

---

### `AbandonCampaignAttempt`

Clears the tracked attempt **locally** — no server call is made, so the attempt itself is not closed: it stays open until the next `StartCampaignLevel` for the **same** level abandons it. Call it when the player quits a run without finishing, so a stale attempt cannot be submitted later by mistake.

**Signature:**
```ts
AbandonCampaignAttempt(): void
```

**Usage:**
```js
function onQuitToMenu() {
  sdk.AbandonCampaignAttempt();
  showScreen('campaign-map');
}
```

---

### `CompleteCampaignLevel`

Ends a campaign run: validates and normalizes the metrics, encrypts and signs the payload, submits it, and returns the server's graded outcome. Call it once, when the run is over — **whether the player won or lost**.

**Signature:**
```ts
async CompleteCampaignLevel(metrics: CampaignMetrics, attempt?: CampaignAttemptData): Promise<CampaignCompletionResult>
```

**Parameters:**
- `metrics` - Flat `name -> value` map of the run's results (`CampaignMetrics`). 1-32 entries; names 1-64 characters; values finite numbers or booleans. Booleans are sent as `1`/`0`; **fractional numbers pass through untruncated** (unlike `EndRoomSP`'s integer score). A violation throws `CampaignError` with `Code: InvalidMetrics` before anything is sent. Plain JavaScript has no compile-time check, so this runtime check is what catches type slips: a numeric **string** such as `'47.3'` (e.g. read from a DOM input) is not a number and is rejected, as are `NaN` and `Infinity` — convert with `Number(...)` first.
- `attempt` - Optional attempt to submit against, e.g. one you persisted yourself across a reload. Omit it to use the attempt tracked by `StartCampaignLevel`. With neither, the method throws `CampaignError` with `Code: NoActiveAttempt` before any I/O. Completing an explicitly passed attempt never clobbers a **different** attempt the SDK is tracking — tracking is cleared only when it is the same attempt.

**Returns:** `Promise<CampaignCompletionResult>` - The graded outcome. **A loss is a normal resolution** — `IsWin: false, Stars: 0` on a `200` — so render the defeat screen from this same object; only validation and state failures reject.

The SDK encrypts and signs the payload for you — pass plain metrics and never encrypt anything yourself. Events recorded via `RecordEvent_Client` are folded into the encrypted payload automatically.

**Attempt handling on failure:** the tracked attempt is cleared **only** for `AttemptNotFound` and `CompletionTooFast`. In both cases the server-side attempt is dead (unknown, or abandoned by the too-fast rejection itself), so a retry can never succeed and a fresh `StartCampaignLevel` is needed. Every other failure leaves the attempt tracked, and the server keeps it open: network errors, `Unknown`, `InvalidMetrics` (client-side or server-side), `InvalidSignature`, `CampaignNotAvailable` and the rest. So you can retry after a network blip, or fix the cause (for example, correct the metrics) and call `CompleteCampaignLevel` again for the same attempt. `InvalidSignature` usually means a wrong `privateGameKey`, which retrying will not fix. Call `AbandonCampaignAttempt()` to drop tracking yourself if you give up.

**On success:** the tracked attempt is consumed, the recorded `RecordEvent_Client` log is cleared (the events were delivered in this submission — the client session itself is untouched), the cached level list is dropped (the unlock cascade is server business — refetch `GetCampaignLevels` to render it), and the cached availability's counts are refreshed from the result.

**CampaignCompletionResult Properties:**
- `IsWin` (`boolean`) - Whether the run met the level's win conditions. `false` is a lost run, not an error.
- `Stars` (`number`) - Stars this run earned, computed server-side from the level's star rules. `0` on a loss.
- `BestStars` (`number`) - The player's best star count on this level after this run.
- `IsNewBest` (`boolean`) - Whether this run improved on the previous best.
- `LevelCompletedFirstTime` (`boolean`) - `true` only on the first-ever win of this level. Use it to gate one-time celebration UI.
- `UnlockedLevelId` (`string | null`) - The level this completion unlocked, or `null` when nothing new unlocked.
- `Rewards` (`CampaignRewardViewModel[]`) - The rewards this completion granted (or would grant), same shape as on the level model.
- `RewardsGranted` (`boolean`) - Whether the rewards in `Rewards` were actually paid out by this completion.
- `TotalLevels` / `CompletedLevels` / `TotalStarsEarned` / `MaxStars` (`number`) - The campaign-wide progress counters, updated for this completion — the same fields `GetCampaignLevels` reports, so a progress HUD can rebind from either.

**Usage:**
```js
import { CampaignError, CampaignErrorCode } from './funtico-sdk.mjs';

async function onRunFinished(timeSeconds, coins, died) {
  try {
    const result = await sdk.CompleteCampaignLevel({
      time: timeSeconds,     // fractional is fine - it is not truncated
      coins: coins,
      no_damage: !died       // booleans become 1/0 on the wire
    });

    if (result.IsWin) {
      showVictory(result.Stars, result.Rewards, result.IsNewBest);
      if (result.UnlockedLevelId) showUnlockBanner(result.UnlockedLevelId);
    } else {
      showDefeat(); // a loss resolves normally - IsWin false, Stars 0
    }

    // The level cache was dropped - refetch to render the unlock cascade
    await sdk.GetCampaignLevels();
  } catch (error) {
    if (error instanceof CampaignError && error.Code === CampaignErrorCode.AttemptNotFound) {
      // The server no longer accepts this attempt (e.g. the level was restarted); tracking is already cleared - start over
      showScreen('campaign-map');
    } else {
      throw error;
    }
  }
}
```

---

### `CampaignError`

The error every Campaign method rejects with, carrying a machine-readable `Code` alongside the human-readable `message`. Branch on `Code` — never on message text, which is free to change.

**Signature:**
```ts
export class CampaignError extends Error {
  readonly Code: CampaignErrorCode;
  constructor(code: CampaignErrorCode, message: string)
}
```

**CampaignErrorCode Values:**
- `CampaignNotAvailable` - The game has no active campaign to serve this request.
- `LevelLocked` - The level exists but is not reachable yet — the player must complete the one before it.
- `LevelNotFound` - No level with the given id.
- `NoActiveAttempt` - **Client-side only.** `CompleteCampaignLevel` was called with no attempt tracked and none passed; nothing was sent.
- `AttemptNotFound` - The server will not accept this attempt: the id is unknown or belongs to another player or game, or the attempt was abandoned (the same level was started again, or an earlier submission was rejected with `CompletionTooFast`). The SDK clears its tracked attempt on this code — start a new attempt.
- `InvalidSignature` - The encrypted payload failed server-side verification. Almost always a wrong `privateGameKey`.
- `InvalidMetrics` - The metrics violate the contract. Thrown client-side before any I/O when the SDK can see the violation itself; the same code arrives from the server for violations only it can detect.
- `CompletionTooFast` - The run finished faster than the level's `MinDurationSeconds` allows. The server abandons the attempt when rejecting it, so the SDK clears its tracked attempt on this code too — start a new attempt.
- `Unknown` - The response carried no recognisable code (an unparsable body, or an identifier newer than this SDK).

`instanceof CampaignError` is reliable — the constructor restores the prototype chain explicitly — and `error.name` is `'CampaignError'`.

`CampaignErrorCode` is a string enum: each member's value is its own name, so `error.Code === CampaignErrorCode.LevelLocked` and `error.Code === 'LevelLocked'` are equivalent. With the ESM build, import `CampaignError` and `CampaignErrorCode` from `./funtico-sdk.mjs`; with the `<script>` build they live on the global namespace as `FunticoSDK.CampaignError` and `FunticoSDK.CampaignErrorCode`.

> **Use one build per page.** The ESM build and the `<script>` build are separate copies of the SDK: each has its own `FunticoSDK.Instance` singleton and its own `CampaignError` class. An error thrown by one build is not `instanceof` the other build's `CampaignError` — test against the class from the same build you call the SDK through (or fall back to `error.name === 'CampaignError'`).

**Usage:**
```js
import { CampaignError, CampaignErrorCode } from './funtico-sdk.mjs';

try {
  await sdk.StartCampaignLevel(level.Id);
} catch (error) {
  if (error instanceof CampaignError) {
    switch (error.Code) {
      case CampaignErrorCode.LevelLocked:
        showToast('Finish the previous level to unlock this one.');
        break;
      case CampaignErrorCode.CampaignNotAvailable:
        showScreen('menu');
        break;
      default:
        console.error(`Campaign failure [${error.Code}]:`, error.message);
    }
  } else {
    throw error; // not a campaign failure - unauthenticated SDK, programming error, ...
  }
}
```

With the `<script>` build, take the same names from the global namespace instead of importing them:

```js
// <script src="funtico-sdk.js"> defines the global FunticoSDK namespace
const { CampaignError, CampaignErrorCode } = FunticoSDK;
```

---

## Client Session Methods (Reconnection)

Use these methods in **client builds** (browser / Telegram Mini App) to make a match survivable across a page reload, a dropped connection, or a browser crash. A client session is a small encrypted blob of your own game state stored server-side alongside the room/tournament identifiers, so that a returning player can be dropped back exactly where they left off.

**The reconnection flow, end to end:**

1. **Detect** — at boot, call `UserHasUnfinishedSession_Client()`. It returns every session the player started but never finished, each with a `ReconnectTime` budget in seconds.
2. **Reconnect** — pick a session and pass its `Id` to `ReconnectToUnfinishedSession_Client(id)`. This tells the backend the player is coming back.
3. **Decrypt** — the same call transparently decrypts the stored `Data` blob and hands you back your original plaintext JSON string. You never call `CryptoHelper` yourself.
4. **Resume** — `JSON.parse` the returned string to rebuild your game state, and rebuild the room identifiers from the session itself: `EventId` comes from `SessionId`, and `SessionOrMatchId` comes from `SaveSessionId`. The SDK re-arms its internal session tracking at this point, so `UpdateSession_Client` and `RecordEvent_Client` work immediately without re-creating anything.

**Encryption:**

Your state never travels or rests in plaintext — `CreateSession_Client` and `UpdateSession_Client` encrypt and sign it for you, and `ReconnectToUnfinishedSession_Client` decrypts it on the way back. The encryption key is derived per player, so the SDK must have user data cached before any of these calls; otherwise they throw `"User data is not loaded. Cannot derive session encryption key."` (`Initialize` pre-loads it for you when a `userToken` is supplied.)

**How checkpoints are saved:**

Call `CreateSession_Client` once, immediately after `JoinRoom` / `EnterTournament` and *before* gameplay starts — that way a player who never even finishes loading the game can still reconnect. Then call `UpdateSession_Client` at your own checkpoints (a `setInterval` timer every few seconds, level transitions, or after each significant move). Each update overwrites the stored blob wholesale; there is no merge, so always pass a complete state snapshot. The reconnect window is 15 minutes from the moment the session was created — `ReconnectTime` is what remains of it. Once it lapses, the session is dropped server-side; a `Tournament` session that lapses is additionally auto-finalised with no score.

The examples in this section keep your own game state in a plain `game` object (`game.score`, `game.hp`, `game.level`, and `game.activeSession` for the `RoomSessionData` returned by `JoinRoom`) — substitute whatever your engine or framework uses.

---

### `UserHasUnfinishedSession_Client`

Retrieves every game session the current player started but has not finished. Call this at game startup, before showing the main menu, to decide whether to offer the player a "resume match" prompt.

**Signature:**
```ts
async UserHasUnfinishedSession_Client(): Promise<UnfinishedSessionsResponse>
```

**Returns:** `Promise<UnfinishedSessionsResponse>` - A wrapper containing the list of resumable sessions. The list is empty when the player has nothing to resume. A player may have more than one entry — for example, an abandoned single-player room and an in-progress multiplayer match — so either let the player choose or pick one deliberately.

**UnfinishedSessionsResponse Properties:**
- `SavedSessions` (`SavedSessionResponse[]`) - Every session the player can still return to. Sessions whose reconnect window has already lapsed are not listed, so anything present here is genuinely resumable.

**SavedSessionResponse Properties:**
- `Id` (`string`) - The session record's own unique identifier (a GUID). This is the handle you pass to `ReconnectToUnfinishedSession_Client` — it is *not* the room or match id.
- `SessionId` (`string`) - The event/room identifier the session belongs to. This is the value you originally passed as `eventId`, and it is what you feed back into `EndRoomSP`, `GetLeaderboard`, etc. as `RoomSessionData.EventId`.
- `SaveSessionId` (`string`) - The match/session identifier for the specific play attempt — the value originally passed as `saveSessionId`, equivalent to `RoomSessionData.SessionOrMatchId` (or a tournament's `TournamentEnterData.TournamentScoreUuid`).
- `GameType` (`number`) - Which mode the session belongs to, as the numeric value of `GameTypeEnum` (e.g. `4` for Rooms). Use it to route the player to the correct scene on resume.
- `ReconnectTime` (`number`) - Seconds left in the reconnect window, counted down from a 15-minute budget that starts when the session was created. Show it as a countdown on your resume prompt.
- `Data` (`string`) - The stored game state. To read it, call `ReconnectToUnfinishedSession_Client`, which returns the decrypted state.

**Usage:**
```js
// Run once at boot, after funtico.init(...) has authenticated the player.
async function checkForUnfinishedMatch() {
  const unfinished = await sdk.UserHasUnfinishedSession_Client();

  if (unfinished.SavedSessions.length === 0) {
    showMainMenu();
    return;
  }

  const session = unfinished.SavedSessions[0];
  console.log(`Unfinished match in room ${session.SessionId}`);
  console.log(`You have ${Math.floor(session.ReconnectTime)}s left to resume`);

  // Your own UI: a "Resume match?" dialog with a countdown. Keep the whole
  // SavedSessionResponse - its Id, SessionId and SaveSessionId are needed on resume.
  showResumePrompt(session);
}
```

---

### `ReconnectToUnfinishedSession_Client`

Reconnects to one specific unfinished session and returns the decrypted game state that was stored with it. Call this once the player has confirmed they want to resume.

**Signature:**
```ts
async ReconnectToUnfinishedSession_Client(id: string): Promise<string>
```

**Parameters:**
- `id` - The session record identifier, taken from `SavedSessionResponse.Id` in the `UserHasUnfinishedSession_Client` response. Passing a room or match id here will not work.

**Returns:** `Promise<string>` - The original plaintext JSON string you last stored via `CreateSession_Client` or `UpdateSession_Client`. Decryption happens inside the SDK, so you receive exactly the string you passed in and can `JSON.parse` it directly.

**Usage:**
```js
// Called from the resume prompt's "Resume" button with the SavedSessionResponse
// picked by checkForUnfinishedMatch().
async function resumeMatch(reconnectSession) {
  // Decryption is handled internally - this is your original JSON back.
  const stateJson = await sdk.ReconnectToUnfinishedSession_Client(reconnectSession.Id);
  const savedState = JSON.parse(stateJson);

  game.score = savedState.score;
  game.hp = savedState.hp;
  game.level = savedState.level;

  // Rebuild the room identifiers straight from the saved session.
  game.activeSession = {
    EventId: reconnectSession.SessionId,
    SessionOrMatchId: reconnectSession.SaveSessionId
  };

  // Session tracking is already re-armed - UpdateSession_Client works right away.
  await sdk.UpdateSession_Client(JSON.stringify(savedState));

  startGameplay();
}
```

**Important Notes:**
- The SDK re-arms its internal session tracking from the response, so `UpdateSession_Client`, `RecordEvent_Client`, and the auto-close inside `EndRoomSP` all work afterwards without calling `CreateSession_Client` again.
- The recorded event list is cleared on reconnect — events logged before the disconnect are not restored, and `GetCurrentSessionEvents_Client` starts empty again for the resumed run.
- Requires cached user data. `Initialize` pre-loads it when you pass a `userToken`.

---

### `CreateSession_Client`

Creates a new server-side session and stores an encrypted snapshot of your game state in it. Call it right after joining a room or entering a tournament and before gameplay begins, so that even a player who fails to load the game can still reconnect.

**Signature:**
```ts
async CreateSession_Client(
  json: string,
  gameType: GameTypeEnum,
  eventId: string,
  saveSessionId: string
): Promise<SavedSessionResponse>
```

**Parameters:**
- `json` - Your game state serialized to a JSON string. The SDK encrypts it before it leaves the client; pass plain JSON, never pre-encrypted data. Its shape is entirely yours — the backend stores it opaquely.
- `gameType` - Which mode this session belongs to. See the `GameTypeEnum` values below; use `GameTypeEnum.Rooms` for a standard room match and `GameTypeEnum.Tournament` for a special tournament attempt.
- `eventId` - The event/room identifier — `RoomSessionData.EventId` from `JoinRoom`.
- `saveSessionId` - The match/session identifier for this attempt — `RoomSessionData.SessionOrMatchId` from `JoinRoom`, or `TournamentEnterData.TournamentScoreUuid` from `EnterTournament`.

**Returns:** Resolves to an object carrying `Id` and `SessionId`. `Id` is the handle a later reconnect will use, though you normally do not need to store it: the SDK tracks the active session internally for `UpdateSession_Client`.

**GameTypeEnum Values:**
- `Indirect_PVP = 0` - Asynchronous player-versus-player, where opponents play the same challenge at different times.
- `Direct_PVP = 1` - Real-time player-versus-player.
- `Tournament = 3` - A special tournament attempt. If a session of this type expires unresumed, the backend finalises the attempt with no score rather than leaving it dangling.
- `Rooms = 4` - A standard room/lobby match — the usual value for the `JoinRoom` → `EndRoomSP` flow.
- `Practice = 5` - Practice/training mode with no entry fee or prizes.
- `MultiplayerPvp = 6` - Real-time server-authoritative multiplayer, driven by a dedicated server rather than by the client.

**Returned Object Properties:**
- `Id` (`string`) - The new session record's unique identifier (a GUID), used later as the `id` argument to `ReconnectToUnfinishedSession_Client`.
- `SessionId` (`string`) - The event/room identifier this session was created against — echoes the `eventId` you passed in.

The `gameType` and `saveSessionId` you passed in are not echoed back; read them from your own variables. `ReconnectTime` is reported by `UserHasUnfinishedSession_Client`.

**Usage:**
```js
import { GameTypeEnum } from './funtico-sdk.mjs';
// <script> build: const { GameTypeEnum } = FunticoSDK;

async function startMatch(room) {
  const session = await sdk.JoinRoom(room.Guid);
  game.activeSession = session;

  // Checkpoint the initial state immediately, so a failed game load still
  // leaves the player something to reconnect to.
  const initialState = { score: 0, hp: 100, level: 1, seed: game.rngSeed };

  const saved = await sdk.CreateSession_Client(
    JSON.stringify(initialState),
    GameTypeEnum.Rooms,
    session.EventId,
    session.SessionOrMatchId
  );

  console.log(`Reconnection armed. Session record: ${saved.Id}`);

  startGameplay();
}
```

**Important Notes:**
- Encryption is automatic — do not encrypt `json` yourself.
- Requires cached user data. `Initialize` pre-loads it when you pass a `userToken`.
- Creating a session resets the recorded event list, so `RecordEvent_Client` starts from a clean slate for the new match.

---

### `UpdateSession_Client`

Overwrites the active session's stored state with a fresh snapshot. Call it at your checkpoints — on a timer, at level transitions, or after each meaningful game action — so a reconnecting player loses as little progress as possible.

**Signature:**
```ts
async UpdateSession_Client(json: string): Promise<boolean>
```

**Parameters:**
- `json` - The complete current game state as a JSON string. The stored blob is replaced wholesale rather than merged, so send a full snapshot, not a delta. The SDK encrypts it before sending.

**Returns:** `Promise<boolean>` (declared type). At runtime the promise resolves to the backend's parsed response object, `{ Id, SessionId }`, where `Id` is the session record id and `SessionId` is `null` for an update. That object is truthy but is **never the literal `true`**, and a successful update never resolves to `false`: a refused update (for example with a wrong `privateGameKey`) rejects with `Error("Failed to update client session progress")`. Treat "resolved without throwing" as success and use `try/catch`; do not compare the result with `=== true`.

**Usage:**
```js
const AUTOSAVE_INTERVAL_MS = 10000;
let autosaveTimer = null;

function startGameplay() {
  // ... JoinRoom + CreateSession_Client (or ReconnectToUnfinishedSession_Client) ...

  // Autosave a checkpoint every 10 seconds.
  autosaveTimer = setInterval(autoSaveProgress, AUTOSAVE_INTERVAL_MS);
}

async function autoSaveProgress() {
  const snapshot = { score: game.score, hp: game.hp, level: game.level };

  try {
    // Resolving at all means the checkpoint was stored (the value is an object, not `true`).
    await sdk.UpdateSession_Client(JSON.stringify(snapshot));
    console.log('Checkpoint stored');
  } catch (err) {
    // A missed checkpoint is not fatal - the next tick sends a fresher snapshot.
    console.warn('Checkpoint failed:', err);
  }
}

function stopGameplay() {
  // Stop autosaving BEFORE EndRoomSP / ResultTournament_Client close the session.
  clearInterval(autosaveTimer);
  autosaveTimer = null;
}
```

**Important Notes:**
- Throws `"No active client session found to update. Create or Reconnect first."` when no session is being tracked — call `CreateSession_Client` or `ReconnectToUnfinishedSession_Client` first.
- Safe to call repeatedly throughout the match; each call replaces the previous checkpoint.
- Clear your autosave timer when the match ends. `EndRoomSP` and `ResultTournament_Client` close the local session, so any tick that fires afterwards throws the error above. Nothing stops a plain `setInterval` for you — unlike an engine-managed timer, it keeps running until you call `clearInterval`.

---

### `CloseCurrentSession_Client`

Clears the SDK's local client-session tracking — the active session record, the room/match identifiers, and the recorded event list. Games rarely call this directly, because the SDK already calls it for you when a match is finalised.

**Signature:**
```ts
CloseCurrentSession_Client(): void
```

**Usage:**
```js
const session = game.activeSession;
const user = sdk.GetCachedUserData(); // pre-loaded by Initialize when a userToken is supplied

// Called automatically at the end of EndRoomSP and ResultTournament_Client.
await sdk.EndRoomSP(session.EventId, session.SessionOrMatchId, game.score, user.UserId);
// Local session tracking is now cleared; GetCurrentSessionEvents_Client() returns [].

// Call it yourself only to abandon local tracking without submitting a result,
// e.g. when tearing the game screen down after the player backs out.
sdk.CloseCurrentSession_Client();
```

**Important Notes:**
- Synchronous and purely local — it makes no network call and does not delete the session on the backend.
- Invoked automatically by `EndRoomSP` and `ResultTournament_Client` once the score has been accepted.
- After it runs, `UpdateSession_Client` will throw until a new session is created or reconnected.

---

### `RecordEvent_Client`

Appends a gameplay event to the current session's event log. Record the actions that describe how a score came about; the log is submitted together with the result.

**Signature:**
```ts
RecordEvent_Client(eventInfo: string): void
```

**Parameters:**
- `eventInfo` - The event as a string. A JSON string is the useful form, since it lets you carry a type, payload, and timestamp, but any string is accepted and stored verbatim.

**Usage:**
```js
function onPowerUpUsed(powerUpName) {
  sdk.RecordEvent_Client(JSON.stringify({
    type: 'powerup_used',
    powerup: powerUpName,
    score: game.score,
    timestamp: Date.now()
  }));
}

function onChestOpened(chestId) {
  sdk.RecordEvent_Client(JSON.stringify({
    type: 'chest_opened',
    chestId,
    timestamp: Date.now()
  }));
}
```

**Important Notes:**
- Synchronous and local — events are buffered in memory and only leave the client when a result is submitted (a match is finalised or a campaign level is completed).
- The buffer is attached automatically as `GameEvents` when you call `ResultTournament_Client` or `CompleteCampaignLevel` (including `funtico.completeCampaignLevel`), and by `EndRoomSP` whenever you leave its `gameEvents` argument empty.
- The buffer is reset by `CreateSession_Client`, `ReconnectToUnfinishedSession_Client`, and `CloseCurrentSession_Client`, and also by a **successful** `CompleteCampaignLevel` (whichever attempt it completed; the client session itself stays open). A failed campaign submission leaves the buffer as it was. A successful `ResultTournament_Client` or `EndRoomSP` clears it too, because both close the client session (`CloseCurrentSession_Client`).

---

### `GetCurrentSessionEvents_Client`

Returns everything recorded so far in the current session via `RecordEvent_Client`. Useful for debugging your event stream, or for inspecting or filtering the log before passing it explicitly to `EndRoomSP`.

**Signature:**
```ts
GetCurrentSessionEvents_Client(): string[]
```

**Returns:** `string[]` - A copy of the recorded event strings, in the order they were recorded. Empty when nothing has been recorded since the last `CreateSession_Client`, `ReconnectToUnfinishedSession_Client`, `CloseCurrentSession_Client` or successful `CompleteCampaignLevel`. Mutating the returned array does not affect the SDK's internal buffer.

**Usage:**
```js
const events = sdk.GetCurrentSessionEvents_Client();
console.log(`Recorded ${events.length} events this run`);

events.forEach(raw => {
  const parsed = JSON.parse(raw);
  console.log(`${parsed.type} @ ${parsed.timestamp}`);
});

// Optionally hand a curated log to EndRoomSP instead of letting it use the buffer.
const session = game.activeSession;
const user = sdk.GetCachedUserData(); // pre-loaded by Initialize when a userToken is supplied
await sdk.EndRoomSP(
  session.EventId,
  session.SessionOrMatchId,
  game.score,
  user.UserId,
  '127.0.0.1',
  events
);
```

---

## Dedicated Server Methods

Methods meant for a trusted dedicated game server (for example a Node.js >= 20 process) that registers a multiplayer match, tracks players and submits everyone's results in one call. They authenticate as your **game**, not as a player: instead of a JWT the SDK sends `X-User-Key` (the public key) plus `X-Server-Key`, a proof derived from `privateGameKey`. The private key itself is never sent, but it must be present in the running process, so **never call these from a browser, Telegram Mini App or any other client build.** `Initialize` without a `userToken` is enough to use them.

> **Not supported at the moment.** The Dedicated Server methods `CreateSession_Server`, `UserLeaveSession_Server`, `CloseCurrentSession_Server` and `FinishRoomSession_Server` are not supported at the moment; do not use them. `RecordEvent_Server` and `GetCurrentSessionEvents_Server` are purely local and work. For trusted server-side tournament results use `ResultTournament_Server`, which is supported.

**ServerUserData Properties:** (type-only export: an interface in the `.d.ts`, not a runtime value)
- `JoinKey` (`string`) - The player's join key for the match.
- `FunticoUserId` (`number`) - The player's Funtico **platform** user id. The server methods key each player's event log on this value (`platformUserId`).
- `SdkUserId` (`number`) - The player's SDK-side user id (`UserData.UserId`).
- `UserStatus` (`UserGameStatus`) - The player's presence in the match (see below).

**UserGameStatus Values:**
- `Leave = 0` - The player left the match.
- `InGame = 1` - The player is in the match.
- `Finished = 2` - The player finished the match.

---

### `CreateSession_Server`

Registers a new multiplayer session on the API from a dedicated game server, and starts tracking it locally: the SDK remembers `sessionId` as the active server session and opens an empty event log for each player's `FunticoUserId`. **Not supported at the moment** — see the notice above.

**Signature:**
```ts
async CreateSession_Server(
  serverUrl: string,
  sessionId: string,
  playersInfo: ServerUserData[]
): Promise<boolean>
```

**Parameters:**
- `serverUrl` - The address of the dedicated server hosting the match.
- `sessionId` - Your identifier for the match session. The SDK tracks it as the active server session for the other `_Server` methods.
- `playersInfo` - One `ServerUserData` entry per player in the match.

**Returns:** `Promise<boolean>` - The parsed response body. Rejects with `Failed to create server session` on a non-OK response; local tracking is only updated after a successful response.

**Usage:**
```js
// Trusted Node.js server code only. Not supported at the moment: see the notice above.
import { UserGameStatus } from './funtico-sdk.mjs';

await sdk.CreateSession_Server('wss://game-server.example.com/match/42', matchId, [
  { JoinKey: joinKeyA, FunticoUserId: 1001, SdkUserId: 17, UserStatus: UserGameStatus.InGame },
  { JoinKey: joinKeyB, FunticoUserId: 1002, SdkUserId: 18, UserStatus: UserGameStatus.InGame }
]);
```

---

### `UserLeaveSession_Server`

Reports that a player has left the tracked server match session (`GET /Session/server-session-user-leave`). **Not supported at the moment** — see the notice above.

**Signature:**
```ts
async UserLeaveSession_Server(platformUserId: number): Promise<boolean>
```

**Parameters:**
- `platformUserId` - The leaving player's user id, sent as the `userId` query parameter.

**Returns:** `Promise<boolean>` - The parsed response body. Rejects with `No active server session tracked.` (before any request) when no session was registered with `CreateSession_Server`, and rejects with `Failed to submit player leave status to server` on a non-OK response.

**Usage:**
```js
// Trusted Node.js server code only. Not supported at the moment: see the notice above.
await sdk.UserLeaveSession_Server(1002);
```

---

### `CloseCurrentSession_Server`

Closes the tracked server match session on the API (`GET /Session/close-server-session`) and, on success, clears the local tracking (session id and every player's event log). **Not supported at the moment** — see the notice above.

**Signature:**
```ts
async CloseCurrentSession_Server(): Promise<boolean>
```

**Returns:** `Promise<boolean>` - The parsed response body. Rejects with `No active server session tracked.` (before any request) when no session is tracked, and rejects with `Failed to close server session` on a non-OK response. On failure the local tracking is kept.

**Usage:**
```js
// Trusted Node.js server code only. Not supported at the moment: see the notice above.
await sdk.CloseCurrentSession_Server();
```

---

### `FinishRoomSession_Server`

Submits the results of every match participant in one payload from a dedicated server (`POST /Rooms/end-room-all-users?eventId=...`), then clears the local server-session tracking. **Not supported at the moment** — see the notice above.

**Signature:**
```ts
async FinishRoomSession_Server(
  eventId: string,
  sessionId: string,
  participants: Array<{
    Score: number;
    UserId: number;
    FunticoUserId: number;
    UserIp: string;
    AdditionalData?: string;
    GameEvents?: string[];
    GameManagedAward?: number;
  }>
): Promise<boolean>
```

**Parameters:**
- `eventId` - Event/Room identifier the match was played in.
- `sessionId` - The match session id. It is sent as each score's `game_session_id_or_match_id`.
- `participants` - One entry per player:
  - `Score` (`number`) - Final score. Scores are integers, so the SDK truncates it with `Math.trunc`.
  - `UserId` (`number`) - The SDK-side user id. **Not transmitted**: players are identified by `FunticoUserId`.
  - `FunticoUserId` (`number`) - The Funtico platform user id, sent as `user_id`. Hall of Fame results are recorded under this id.
  - `UserIp` (`string`) - The player's IP address, sent as `user_ip_end_session`.
  - `AdditionalData` / `GameEvents` (optional) - Kept for source compatibility only; the wire model has no field for them, so they are **not transmitted**.
  - `GameManagedAward` (`number`, optional) - Game-managed award for the player. **Always pass a number** (`0` when there is none): omitting it sends `null`, which is rejected.

**Wire format:** the body is `{ scores: [...] }` with snake_case keys (`game_session_id_or_match_id`, `score`, `is_suspected_cheater`, `user_ip_end_session`, `user_id`, `game_managed_award`). The SDK builds it for you from the PascalCase `participants` above.

**Returns:** `Promise<boolean>` - The parsed response body. Rejects with `Failed to finalize server match results` on a non-OK response; the local tracking is then kept.

**Usage:**
```js
// Trusted Node.js server code only. Not supported at the moment: see the notice above.
await sdk.FinishRoomSession_Server(eventId, matchId, [
  { Score: 1200, UserId: 17, FunticoUserId: 1001, UserIp: '203.0.113.10', GameManagedAward: 0 },
  { Score: 950, UserId: 18, FunticoUserId: 1002, UserIp: '203.0.113.11', GameManagedAward: 0 }
]);
```

---

### `RecordEvent_Server`

Appends a gameplay event to one player's server-side event log. Synchronous and purely local: nothing is sent to the backend.

**Signature:**
```ts
RecordEvent_Server(platformUserId: number, eventInfo: string): void
```

**Parameters:**
- `platformUserId` - The player's Funtico user id (the `FunticoUserId` you registered). A player without a log gets a new one.
- `eventInfo` - The event as a string; a JSON string is the useful form.

**Usage:**
```js
sdk.RecordEvent_Server(1001, JSON.stringify({ type: 'kill', target: 1002, timestamp: Date.now() }));
```

**Important Notes:**
- The logs are cleared by a successful `CreateSession_Server`, `CloseCurrentSession_Server` or `FinishRoomSession_Server`. `FinishRoomSession_Server` does not transmit them.

---

### `GetCurrentSessionEvents_Server`

Returns a copy of one player's server-side event log, in recording order.

**Signature:**
```ts
GetCurrentSessionEvents_Server(platformUserId: number): string[]
```

**Parameters:**
- `platformUserId` - The player's Funtico user id.

**Returns:** `string[]` - A copy of the recorded events; empty when nothing was recorded for that player. Mutating it does not affect the SDK's buffer.

**Usage:**
```js
const events = sdk.GetCurrentSessionEvents_Server(1001);
console.log(`Player 1001: ${events.length} events recorded`);
```

---

## FunticoClient (Event Wrapper)

`FunticoClient` is a thin, framework-agnostic wrapper around the `FunticoSDK` singleton, the plain-JavaScript counterpart of the Phaser SDK's `FunticoPhaserPlugin`. It exposes the underlying SDK through its `sdk` property, wraps the six calls whose results UI code usually reacts to, and re-broadcasts each result on its own small event emitter (`on` / `once` / `off`). Any part of your game can then react to it without polling: HUD, menus, a level-select screen or the game loop.

It has no dependencies. It needs no Phaser and no DOM `EventTarget`/`CustomEvent`, so the same code runs in modern browsers, Telegram Mini App webviews, any engine (PixiJS, Three.js, a custom canvas loop) and Node >= 20.

Create **one** client when your game boots and share it, for example from a small module of its own. Every wrapped call and every subscription then goes through the same object, and the full SDK surface is reachable at `funtico.sdk`:

```js
// funtico.js - the one shared client for the whole game
import { FunticoClient } from './funtico-sdk.mjs';

export const funtico = new FunticoClient();
export const sdk = funtico.sdk; // === FunticoSDK.Instance
```

With the classic `<script src="funtico-sdk.js">` build the same class lives on the global `FunticoSDK` namespace:

```js
// Classic <script> build: no import, everything hangs off the global FunticoSDK namespace
const funtico = new FunticoSDK.FunticoClient();
const sdk = funtico.sdk; // === FunticoSDK.FunticoSDK.Instance
```

Events are emitted on the client itself. Subscribe with `funtico.on(...)` and unsubscribe with `funtico.off(...)` when the UI that listens goes away:

```js
import { FunticoClient } from './funtico-sdk.mjs';
import { funtico } from './funtico.js';

const coinsEl = document.querySelector('#coins');

function onBalance(balance) {
  coinsEl.textContent = `${balance.Coins}`;
}

funtico.on(FunticoClient.EVENTS.BALANCE_UPDATED, onBalance);

// The client outlives your screens: always unsubscribe when this piece of UI is removed
export function destroyCoinsHud() {
  funtico.off(FunticoClient.EVENTS.BALANCE_UPDATED, onBalance);
}
```

---

### `constructor`

Creates a client with an empty listener set. It stores `FunticoSDK.Instance` in the read-only `sdk` property, so the client and any direct `FunticoSDK.Instance` usage elsewhere in your codebase share the exact same SDK state (JWT, caches, tracked sessions).

**Signature:**
```ts
constructor()
```

**Parameters:** none.

**Public Properties:**
- `sdk` (`FunticoSDK`, `readonly`) - The `FunticoSDK` singleton, always `FunticoSDK.Instance`. Every SDK method the client does not wrap (rooms, tournaments, Hall of Fame, sessions) is called through this property.
- `EVENTS` (`static readonly`) - Map of the event names the client emits. See the `EVENTS` block below.

**Usage:**
```js
import { FunticoClient, FunticoSDK } from './funtico-sdk.mjs';

const funtico = new FunticoClient();

// The SDK itself - full method surface
console.log(funtico.sdk === FunticoSDK.Instance); // true

// A second client shares the SDK, but NOT the listeners
const other = new FunticoClient();
console.log(other.sdk === funtico.sdk); // true
```

**Important Notes:**
- Listeners belong to the client instance they were registered on. An event is delivered only to the listeners of the client whose method was called: `other.refreshBalance()` does not notify listeners registered on `funtico`. This is why you should create one client and share it.
- Constructing a client makes no network call and does not initialize the SDK. Call `init()` (or `sdk.Initialize()`) first.

---

### `sdk`

The `FunticoSDK` singleton this client wraps. It is set once in the constructor and is always `FunticoSDK.Instance`, so it shares every piece of state (JWT, caches, tracked sessions) with any other client and with direct `FunticoSDK.Instance` calls. Use it for every SDK method the client does not wrap: rooms, tournaments, Hall of Fame, campaign start/abandon, reconnection, and instance helpers such as `getUserToken` and the `GetCached*` getters. The `CryptoHelper` and `PrizeUtils` helpers are static exports, not instance members; see [Utilities & Types](#utilities--types).

**Definition:**
```ts
readonly sdk: FunticoSDK
```

**Usage:**
```js
const rooms = await funtico.sdk.GetRooms();
const user = funtico.sdk.GetCachedUserData();

// Calls made through funtico.sdk emit no client events; use the wrapper methods
// (refreshBalance, refreshUserData, ...) when listeners should be notified.
```

**Important Notes:**
- `readonly` exists only in the TypeScript declarations. Do not reassign `funtico.sdk` in JavaScript: the wrapper methods read `this.sdk` on every call, so a reassignment silently redirects `init`, `login`, the `refresh*` methods and `completeCampaignLevel` away from `FunticoSDK.Instance`.

---

### `on`

Subscribes a listener to one of the client's events. Together with [`once`](#once) and [`off`](#off) this is a minimal synchronous emitter written for the SDK; it does not use the DOM, so it behaves the same in browsers and in Node.

**Signature:**
```ts
on(event: string, listener: (...args: any[]) => void, context?: any): this
```

**Parameters:**
- `event` - The event name. Use the `FunticoClient.EVENTS` constants rather than raw strings.
- `listener` - Function called with the event's payload (see the [`EVENTS`](#events) block below for what each event passes).
- `context` - Optional value used as `this` when the listener is called. `off` also matches on it, so pass the same `context` you registered with: `off(event, listener)` without a context removes only registrations made without one.

**Returns:** `this` - The same client, so calls can be chained.

**Behaviour (applies to `on`, `once` and `off`):**
- `on` registers `listener` for every future emit of `event`. Registering the same function twice registers it twice. `on` and `once` throw a `TypeError` if `listener` is not a function.
- `once` registers `listener` for the next emit only. It is removed **before** it is invoked, so it cannot fire twice, even if it triggers the same event again (for example by calling `refreshBalance()` from inside a `BALANCE_UPDATED` listener).
- `off(event, listener, context)` removes the registrations of that `listener`/`context` pair for `event`. `off(event)` with no listener removes **every** listener of that event on this client, including ones other parts of your code registered.
- Dispatch is synchronous and runs in registration order over a snapshot of the listener list taken when the event fires, so a listener added while an event is being dispatched first runs on the next emit, and an `on` listener removed during the dispatch still runs this once. A pending `once` listener removed during the dispatch (or by `off` at any time before it fires) never runs.
- A listener that throws is reported with `console.error('[FunticoClient] listener for "<event>" threw:', err)`. The remaining listeners still run, and the wrapper method that emitted the event still resolves with its result.

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

const E = FunticoClient.EVENTS;

const hud = {
  el: document.querySelector('#coins'),
  onBalance(balance) {
    // `this` is the hud object because it was passed as the context
    this.el.textContent = `${balance.Coins} IC`;
  }
};

funtico
  .on(E.BALANCE_UPDATED, hud.onBalance, hud)
  .once(E.INITIALIZED, () => console.log('Funtico SDK ready'));

// Later: remove exactly this registration (same listener, same context)...
funtico.off(E.BALANCE_UPDATED, hud.onBalance, hud);

// ...or drop every BALANCE_UPDATED listener on this client
funtico.off(E.BALANCE_UPDATED);
```

**Important Notes:**
- Nothing is removed automatically. The client lives as long as your game does, so a screen that subscribes every time it opens and never calls `off` accumulates duplicate handlers.
- Listeners run before the wrapper method's promise resolves. By the time `await funtico.refreshBalance()` continues, every `BALANCE_UPDATED` listener has already run.

---

### `once`

Subscribes a listener to the **next** emit of an event only. The listener is removed before it is invoked, so it cannot fire twice, even if it triggers the same event again. Dispatch rules are the same as for [`on`](#on).

**Signature:**
```ts
once(event: string, listener: (...args: any[]) => void, context?: any): this
```

**Parameters:**
- `event` - The event name. Use the `FunticoClient.EVENTS` constants rather than raw strings.
- `listener` - Function called with the event's payload. Throws a `TypeError` if it is not a function.
- `context` - Optional value used as `this` when the listener is called. Pass the same value to `off` to cancel the registration before it fires.

**Returns:** `this` - The same client, so calls can be chained.

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

// Resolve a promise the first time the player's token is available
const authenticated = new Promise(resolve => {
  funtico.once(FunticoClient.EVENTS.AUTHENTICATED, resolve);
});

await funtico.login(platformToken);
const jwt = await authenticated;
```

---

### `off`

Unsubscribes listeners from an event. Dispatch rules are the same as for [`on`](#on).

**Signature:**
```ts
off(event: string, listener?: (...args: any[]) => void, context?: any): this
```

**Parameters:**
- `event` - The event name.
- `listener` - The function to remove. **Omit it** to remove every listener of `event` on this client, including ones other parts of your code registered.
- `context` - The `context` the listener was registered with. Only registrations whose listener **and** context both match are removed, so `off(event, listener)` without a context leaves registrations made with one in place.

**Returns:** `this` - The same client, so calls can be chained.

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

const E = FunticoClient.EVENTS;

function onUser(user) {
  console.log('Profile refreshed for', user.Name);
}

funtico.on(E.USER_DATA_UPDATED, onUser);

// Remove exactly that registration (no context was used, so none is passed)
funtico.off(E.USER_DATA_UPDATED, onUser);

// Or remove every USER_DATA_UPDATED listener on this client
funtico.off(E.USER_DATA_UPDATED);
```

**Important Notes:**
- Removing a listener that is not registered does nothing; `off` never throws.
- A pending `once` listener can be cancelled with `off` at any time before it fires.

---

### `init`

Initializes the SDK and announces the result through the client's events. Call it once at boot before any other Funtico call. Register the listeners you need for `INITIALIZED` / `AUTHENTICATED` **before** calling it, because they are emitted during `init()`.

**Signature:**
```ts
async init(config: FunticoConfig): Promise<void>
```

**Parameters:**
- `config` - SDK configuration object. See the properties block below.

**Returns:** `Promise<void>` - Resolves once `sdk.Initialize(config)` has resolved and the events below have been emitted. **Rejects with the same error `Initialize` rejected with**, and emits nothing in that case. Typical errors are an `Error` whose message starts with `Invalid FunticoConfig: ` (the keys failed validation) and `Funtico Authentication failed: <body>` (the `userToken` was rejected).

**FunticoConfig Properties:**
- `env` (`FunticoEnvironment`) - Target environment: `FunticoEnvironment.STAGING` (`'staging'`) or `FunticoEnvironment.PROD` (`'prod'`). Selects the default game API host when `apiBaseUrl` is not supplied, and the default platform API host when `funticoApiBaseUrl` is not supplied.
- `privateGameKey` (`string`) - Your game's secret key from the Funtico Developer Portal. Used to sign and encrypt payloads. Client-side sessions, score submission and campaign completion need it in the client build, so there it is a signing key a determined player can extract, not a true secret: keep it out of source control and logs, and rotate it if it leaks.
- `publicGameKey` (`string`) - Your game's public key from the Funtico Developer Portal, sent with every request.
- `userToken` (`string`, optional) - The player's Funtico platform token. When present, `Initialize` immediately authenticates the player and pre-loads user data, balance and vouchers, so cached getters work right after `init` resolves. Omit it to initialize the SDK unauthenticated (on a first `init`) and call `login()` later; a JWT from an earlier sign-in is not cleared.
- `apiBaseUrl` (`string`, optional) - Overrides the environment-derived API host. Point this at your game's own API gateway if you proxy Funtico requests. Default: `https://funtico-sdk-staging.azurewebsites.net` for `STAGING`, `https://funtico-sdk.azurewebsites.net` for `PROD`.
- `funticoApiBaseUrl` (`string`, optional) - Overrides the environment-derived Funtico **platform** API host. This is a different host from `apiBaseUrl`: it is the platform itself, and `GetLeaderboard` calls it to resolve player names, avatars and borders. Default: `https://staging.api.funtico.com` for `STAGING`, `https://api.funtico.com` for `PROD`.
- `cacheTTL` (`number`, optional) - Lifetime of the user-data / balance / voucher cache (shared with the Campaign getters), in milliseconds. Once expired, calls with `useCache = true` hit the network again. Default: `30000`.

**Key validation:** before it stores anything or makes a request, `Initialize` checks the keys and rejects with `Invalid FunticoConfig: ...` when the config is missing, when either key is missing, not a string or empty, when either key has leading or trailing whitespace (typically a stray newline/CR from a `.env` file), when `privateGameKey` is shorter than 8 characters, when the two keys are equal, or when one key contains the other (the public and secret keys were concatenated into `privateGameKey`). The message never contains the key values. A rejected config leaves a previously initialized SDK untouched. See [`Initialize`](#initialize) for the full rules.

**Emits:**
- `EVENTS.INITIALIZED` - Once `sdk.Initialize(config)` resolves successfully. No payload.
- `EVENTS.AUTHENTICATED` - Additionally, right after `INITIALIZED`, if the SDK holds a JWT after initialization. This is normally because `config.userToken` was supplied and the token exchange succeeded. Payload: the JWT string.

**Usage:**
```js
import { FunticoClient, FunticoEnvironment } from './funtico-sdk.mjs';

const funtico = new FunticoClient();

function showScreen(id) {
  for (const el of document.querySelectorAll('.screen')) {
    el.hidden = el.id !== id;
  }
}

funtico.once(FunticoClient.EVENTS.INITIALIZED, () => {
  console.log('Funtico SDK ready');
});

const platformToken = new URLSearchParams(window.location.search).get('token') ?? '';

try {
  await funtico.init({
    env: FunticoEnvironment.STAGING,
    publicGameKey: 'your-public-key',
    privateGameKey: 'your-private-key',
    userToken: platformToken,
    cacheTTL: 30000
  });

  // init() resolved: the SDK is configured. Without a platform token it is not signed in yet.
  showScreen(funtico.sdk.getUserToken() ? 'menu' : 'login');
} catch (error) {
  // "Invalid FunticoConfig: ..." (bad keys) or "Funtico Authentication failed: ..." (bad token)
  console.error('Funtico init failed', error);
  showScreen('error');
}
```

**Important Notes:**
- `init()` **rejects on failure**, so a `try/catch` around `await funtico.init(...)` works as expected. This is a deliberate difference from the Phaser plugin's `init()`, which logs the error and resolves (see [Differences from the Phaser plugin](#differences-from-the-phaser-plugin)).
- A resolved `init()` means `Initialize` succeeded, not that the player is signed in: on a first `init()` without `userToken` the SDK is configured but unauthenticated. Check `funtico.sdk.getUserToken()` or wait for `EVENTS.AUTHENTICATED`.
- Re-running `init()` without `userToken` is not a sign-out. `Initialize` never clears a JWT obtained earlier (the SDK is a singleton, so this holds even for a new `FunticoClient`), and `init()` then still emits `AUTHENTICATED` with that old JWT. The cached profile, balance and vouchers are kept too.
- The cache pre-warm inside `Initialize` uses `Promise.allSettled`, so a failed profile, balance or voucher fetch does not reject `init()`. The matching `sdk.GetCached*()` getter returns `null` until the next successful call.
- `init()` emits `INITIALIZED` / `AUTHENTICATED` only for listeners of this client. Calling `funtico.sdk.Initialize(config)` directly initializes the same SDK but emits nothing.

---

### `login`

Exchanges a Funtico platform token for the game's JWT and announces the new authentication state. Use it when the player was not authenticated at `init()` time, or when a token needs refreshing mid-session.

**Signature:**
```ts
async login(platformToken: string): Promise<any>
```

**Parameters:**
- `platformToken` - The player's Funtico platform token, as issued by the Funtico platform (for example from the launch URL query string). This is the platform-side token, not the SDK's JWT.

**Returns:** `Promise<any>` - The raw JSON body returned by `POST /Auth/funtico-auth`. The SDK reads its `Token` field and stores it as the JWT used for all subsequent authenticated requests; retrieve that value at any time via `sdk.getUserToken()`.

**Emits:**
- `EVENTS.AUTHENTICATED` - After a successful exchange. Payload: the JWT string (`sdk.getUserToken()`).

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

funtico.on(FunticoClient.EVENTS.AUTHENTICATED, (jwt) => {
  console.log('Authenticated, JWT length:', jwt.length);
  showScreen('menu');
});

export async function signIn(platformToken) {
  try {
    await funtico.login(platformToken);

    // login() only authenticates - populate the caches explicitly
    await Promise.all([funtico.refreshUserData(), funtico.refreshBalance()]);
  } catch (error) {
    // Like init(), login() propagates failures
    console.error('Funtico login failed', error);
  }
}
```

**Important Notes:**
- `login()` does **not** swallow errors: a failed token exchange rejects the promise (`Funtico Authentication failed: <body>`) and emits nothing, so wrap it in `try/catch`.
- `login()` only authenticates; it does not pre-load user data, balance or vouchers the way `init()` with a `userToken` does. Follow it with `refreshUserData()` / `refreshBalance()` to populate the caches.

---

### `refreshUserData`

Fetches the player's full profile and broadcasts it, so every part of your UI that shows it can rebind without making its own request.

**Signature:**
```ts
async refreshUserData(useCache = false): Promise<UserData>
```

**Parameters:**
- `useCache` - When `true`, returns the cached profile if it exists and the cache has not passed `cacheTTL`; when `false`, always hits `GET /User/get-full-data`. Note the client's default differs from `sdk.GetUserData`, which defaults to `true`. Default: `false`.

**Returns:** `Promise<UserData>` - The player's profile data. The same object is passed as the payload of `EVENTS.USER_DATA_UPDATED`. Rejects like `sdk.GetUserData` does (for example `SDK is not authenticated. Call Initialize() or Authentication() first.` before sign-in, or `Failed to fetch user data`); nothing is emitted on failure.

**UserData Properties:**
- `Name` (`string`) - The player's display name / username.
- `UserId` (`number`) - The player's SDK-side identifier (not the platform id). This is the value passed as `userId` to `EndRoomSP` and `ResultTournament_Server`.
- `PlatformId` (`number`) - The player's identifier on the Funtico platform. Match leaderboard rows against this value.
- `Level` (`number`) - The player's current level.
- `Rating` (`number`) - The player's rating.
- `Experience` (`number`) - Current experience points at the current level.
- `ExperienceToLevel` (`number`) - Experience required to reach the next level.
- `Coins` (`number`) - In-game currency (IC) balance. Matched against `EntryFeeType.IC`.
- `Diamonds` (`number`) - Premium platform currency (TICO) balance. Matched against `EntryFeeType.Tico`.
- `SemiFinalTickets` (`number`) - Number of semi-final tickets held. Matched against `EntryFeeType.SemifinalsTickets`.
- `FinalTickets` (`number`) - Number of final tickets held. Matched against `EntryFeeType.FinalTickets`.
- `PrivateTickets` (`number`) - Number of private-room tickets held. Matched against `EntryFeeType.PrivateTickets`.
- `KYCVerified` (`boolean`) - Whether the player has completed KYC verification. Use it for a verification badge, `PlatformExpKyc` selection and the tournament `IsKycRequired` check (`RoomViewModel.RequireKyc` is always `false`, so it cannot gate rooms).
- `SoundsValue` (`number`) - The player's stored sound-effects volume preference, so it can be carried across games.
- `MusicValue` (`number`) - The player's stored music volume preference.

**Emits:**
- `EVENTS.USER_DATA_UPDATED` - After the fetch resolves. Payload: the `UserData` object. It is also emitted when `useCache = true` served the profile from the cache.

**Usage:**
```js
// Force a fresh fetch and broadcast it to every USER_DATA_UPDATED listener
const user = await funtico.refreshUserData();

document.querySelector('#player-name').textContent = `${user.Name}  Lv.${user.Level}`;
document.querySelector('#player-xp').textContent = `XP ${user.Experience}/${user.ExperienceToLevel}`;

const kycNotice = document.querySelector('#kyc-notice');
kycNotice.textContent = 'Verify your account to join KYC-only tournaments';
kycNotice.hidden = user.KYCVerified;
```

---

### `refreshBalance`

Fetches the player's currency and ticket balance and broadcasts it. Call it after any action that can change the balance (joining a paid room, finishing a match, claiming a prize) to keep every currency HUD in sync.

**Signature:**
```ts
async refreshBalance(useCache = false): Promise<BalanceResponse>
```

**Parameters:**
- `useCache` - When `true`, returns the cached balance if one exists and the cache has not passed `cacheTTL`; when `false`, always hits `GET /User/get-balance`. Note the client's default differs from `sdk.GetBalance`, which defaults to `true`. Default: `false`.

**Returns:** `Promise<BalanceResponse>` - The player's balance. The same object is passed as the payload of `EVENTS.BALANCE_UPDATED`. Rejects like `sdk.GetBalance` does (`Failed to fetch balance`, or the not-authenticated error); nothing is emitted on failure.

**BalanceResponse Properties:**
- `Coins` (`number`) - In-game currency (IC) balance.
- `Diamonds` (`number`) - Premium platform currency (TICO) balance.
- `SemiFinalTickets` (`number`) - Number of semi-final tickets held.
- `FinalTickets` (`number`) - Number of final tickets held.
- `PrivateTickets` (`number`) - Number of private-room tickets held.
- `KYCVerified` (`boolean`) - Whether the player has completed KYC verification. Included here so a currency HUD can show verification status (or check a tournament's `IsKycRequired`) without also fetching the full profile.

**Emits:**
- `EVENTS.BALANCE_UPDATED` - After the fetch resolves. Payload: the `BalanceResponse` object. It is also emitted when `useCache = true` served the balance from the cache.

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

const E = FunticoClient.EVENTS;
const coinsEl = document.querySelector('#coins');

function onBalance(balance) {
  coinsEl.textContent = `${balance.Coins} IC | ${balance.Diamonds} TICO`;
}

export function createCurrencyHud() {
  funtico.on(E.BALANCE_UPDATED, onBalance);
  funtico.refreshBalance().catch((error) => console.error('Balance refresh failed', error));
}

export function destroyCurrencyHud() {
  funtico.off(E.BALANCE_UPDATED, onBalance);
}

export async function onMatchFinished() {
  // Prize payouts land server-side - bypass the cache to show the real number
  await funtico.refreshBalance(false);
}
```

---

### `refreshCampaign`

Fetches the campaign level list and broadcasts it, so a level-select or progress screen can rebind without owning the request. Mirrors `refreshBalance`: the SDK call plus an event.

**Signature:**
```ts
async refreshCampaign(useCache = false): Promise<CampaignLevelsViewModel>
```

**Parameters:**
- `useCache` - Forwarded to `sdk.GetCampaignLevels`. Note the client's default differs from the SDK method, which defaults to `true`. Default: `false`.

**Returns:** `Promise<CampaignLevelsViewModel>` - The campaign level list. The same object is passed as the payload of `EVENTS.CAMPAIGN_PROGRESS_UPDATED`. Rejects like `GetCampaignLevels` does (with a `CampaignError`); nothing is emitted on failure.

**Emits:**
- `EVENTS.CAMPAIGN_PROGRESS_UPDATED` - After the fetch resolves. Payload: the `CampaignLevelsViewModel` object.

**Usage:**
```js
import { CampaignLevelStatus } from './funtico-sdk.mjs';

function renderLevelSelect(levels) {
  const list = document.querySelector('#levels');
  list.replaceChildren(...levels.map((level) => {
    const item = document.createElement('li');
    item.textContent = level.Status === CampaignLevelStatus.Locked
      ? `${level.Name} (locked)`
      : `${level.Name} - ${level.BestStars} stars`;
    return item;
  }));
}

// Force a fresh fetch and broadcast it to every CAMPAIGN_PROGRESS_UPDATED listener
const campaign = await funtico.refreshCampaign();
renderLevelSelect(campaign.Levels);
```

---

### `completeCampaignLevel`

Submits a finished campaign run through the SDK and broadcasts the graded outcome, so result popups and progress HUDs update without being called directly.

**Signature:**
```ts
async completeCampaignLevel(metrics: CampaignMetrics): Promise<CampaignCompletionResult>
```

**Parameters:**
- `metrics` - The run's metrics, forwarded to `sdk.CompleteCampaignLevel`. Same contract: 1-32 entries, names 1-64 chars, finite numbers or booleans, fractional values allowed. The submission runs against the attempt tracked by `StartCampaignLevel`. The client wrapper has no `attempt` parameter, so call `sdk.CompleteCampaignLevel(metrics, attempt)` directly when you need to pass one explicitly.

**Returns:** `Promise<CampaignCompletionResult>` - The graded outcome (a loss resolves normally with `IsWin: false`). The same object is passed as the payload of `EVENTS.CAMPAIGN_PROGRESS_UPDATED`. Rejects like `CompleteCampaignLevel` does; nothing is emitted on failure.

**Emits:**
- `EVENTS.CAMPAIGN_PROGRESS_UPDATED` - After a successful submission. Payload: the `CampaignCompletionResult` object.

**Usage:**
```js
function showResult(result) {
  document.querySelector('#result-title').textContent = result.IsWin ? 'Level complete!' : 'Try again';
  document.querySelector('#result-stars').textContent = result.IsNewBest
    ? `${result.Stars} stars - new best!`
    : `${result.Stars} stars (best ${result.BestStars})`;
}

export async function onRunFinished(run) {
  const result = await funtico.completeCampaignLevel({
    time: run.elapsedSeconds,
    coins: run.coins,
    no_damage: !run.tookDamage
  });

  showResult(result);
}
```

---

### `EVENTS`

Static map of the event names the client emits. Reference these constants instead of hard-coding the raw strings: the constants are part of the SDK's public surface, the string values are an implementation detail. Keys and values are identical to `FunticoPhaserPlugin.EVENTS`.

**Signature:**
```ts
static readonly EVENTS = {
  INITIALIZED: 'funtico_initialized',
  AUTHENTICATED: 'funtico_authenticated',
  USER_DATA_UPDATED: 'funtico_user_updated',
  BALANCE_UPDATED: 'funtico_balance_updated',
  CAMPAIGN_PROGRESS_UPDATED: 'funtico_campaign_progress_updated'
}
```

**Summary:**

| Constant | Value | Payload | Emitted by |
|---|---|---|---|
| `INITIALIZED` | `'funtico_initialized'` | none | `init()`, after `sdk.Initialize(config)` resolves |
| `AUTHENTICATED` | `'funtico_authenticated'` | `token: string` (the SDK's JWT) | `init()` when a JWT is held afterwards; `login()` after every successful exchange |
| `USER_DATA_UPDATED` | `'funtico_user_updated'` | `data: UserData` | `refreshUserData()` |
| `BALANCE_UPDATED` | `'funtico_balance_updated'` | `balance: BalanceResponse` | `refreshBalance()` |
| `CAMPAIGN_PROGRESS_UPDATED` | `'funtico_campaign_progress_updated'` | `CampaignLevelsViewModel` or `CampaignCompletionResult` | `refreshCampaign()`, `completeCampaignLevel()` |

**EVENTS Properties:**
- `INITIALIZED` (`'funtico_initialized'`) - Emitted by `init()` once `sdk.Initialize(config)` resolves successfully. **Payload:** none, the listener receives no arguments. Not emitted when initialization fails; `init()` rejects instead.
- `AUTHENTICATED` (`'funtico_authenticated'`) - Emitted whenever a JWT has been obtained: by `init()` when the SDK holds a token after initialization (normally because `config.userToken` produced one), and by `login()` after every successful token exchange. **Payload:** `token: string`, the SDK's JWT (`sdk.getUserToken()`). This is the game-side token sent in the `Authorization: Bearer` header, not the Funtico platform token. May fire more than once per session if you re-authenticate.
- `USER_DATA_UPDATED` (`'funtico_user_updated'`) - Emitted by `refreshUserData()` after the profile has been retrieved. **Payload:** `data: UserData`, the same object the method returns (see the `UserData` properties above). Only the client wrapper emits it; calling `sdk.GetUserData()` directly fires nothing.
- `BALANCE_UPDATED` (`'funtico_balance_updated'`) - Emitted by `refreshBalance()` after the balance has been retrieved. **Payload:** `balance: BalanceResponse`, the same object the method returns (see the `BalanceResponse` properties above). Only the client wrapper emits it; calling `sdk.GetBalance()` directly fires nothing.
- `CAMPAIGN_PROGRESS_UPDATED` (`'funtico_campaign_progress_updated'`) - Emitted by both campaign wrappers, with **different payloads**: `refreshCampaign()` emits the `CampaignLevelsViewModel` it fetched, `completeCampaignLevel()` emits the `CampaignCompletionResult` it received. Both carry the shared `CampaignProgressSummary` counters (`TotalLevels`, `CompletedLevels`, `TotalStarsEarned`, `MaxStars`), so a progress HUD can bind to those fields and handle either payload; check for a distinguishing field (e.g. `'Levels' in payload`) before reading anything payload-specific. Only the client wrappers emit it; calling `sdk.GetCampaignLevels()` or `sdk.CompleteCampaignLevel()` directly fires nothing.

**Usage:**
```js
import { FunticoClient } from './funtico-sdk.mjs';

const E = FunticoClient.EVENTS;

const ui = {
  status: document.querySelector('#status'),
  name: document.querySelector('#player-name'),
  level: document.querySelector('#player-level'),
  coins: document.querySelector('#coins'),
  tico: document.querySelector('#tico'),
  campaign: document.querySelector('#campaign-progress')
};

// Keep the handlers in one object so the panel can remove exactly what it added
const handlers = {
  [E.INITIALIZED]: () => {
    ui.status.textContent = 'SDK initialized';
  },
  [E.AUTHENTICATED]: (token) => {
    console.log('JWT received:', token.slice(0, 8) + '...');
  },
  [E.USER_DATA_UPDATED]: (data) => {
    ui.name.textContent = data.Name;
    ui.level.textContent = `Level ${data.Level}`;
  },
  [E.BALANCE_UPDATED]: (balance) => {
    ui.coins.textContent = `${balance.Coins}`;
    ui.tico.textContent = `${balance.Diamonds}`;
  },
  [E.CAMPAIGN_PROGRESS_UPDATED]: (progress) => {
    // Shared CampaignProgressSummary counters - present on both payloads
    ui.campaign.textContent =
      `${progress.CompletedLevels}/${progress.TotalLevels} levels, ${progress.TotalStarsEarned}/${progress.MaxStars} stars`;

    if ('Levels' in progress) {
      // CampaignLevelsViewModel from refreshCampaign()
    } else if (progress.UnlockedLevelId) {
      // CampaignCompletionResult from completeCampaignLevel() that unlocked a new level
      funtico.refreshCampaign().catch((error) => console.error('Campaign refresh failed', error));
    }
  }
};

export function createProfilePanel() {
  for (const [event, handler] of Object.entries(handlers)) {
    funtico.on(event, handler);
  }
}

export function destroyProfilePanel() {
  for (const [event, handler] of Object.entries(handlers)) {
    funtico.off(event, handler);
  }
}
```

**Important Notes:**
- Events fire on the client, which usually lives for the entire lifetime of the page or process. Listeners are **not** removed automatically when the UI that registered them goes away. Remove them with `off` or you will accumulate duplicate handlers every time that UI is recreated.
- `INITIALIZED` and the first `AUTHENTICATED` are emitted during `init()`, often before the rest of your UI exists. Register those listeners before calling `init()` (`once` is a good fit), or check `sdk.getUserToken()` / `sdk.GetCachedUserData()` directly in code that runs later.
- Only the client wrapper methods emit events. Direct `funtico.sdk.*` calls never emit anything, so code that refreshes data through the SDK directly must update its own UI.
- Only listeners registered on the client whose method was called receive the event. Share a single `FunticoClient` instance across your game.

---

### Differences from the Phaser plugin

`FunticoClient` is generated from the same source as the Phaser SDK and wraps the same SDK calls. Every method calls the same `FunticoSDK` method, emits the same event with the same payload at the same point, and uses the same `useCache = false` defaults. The event names and string values are identical, and `completeCampaignLevel` likewise has no `attempt` parameter. The differences are (the last three rows come from Phaser's emitter being eventemitter3):

| Aspect | `FunticoPhaserPlugin` | `FunticoClient` |
|---|---|---|
| Dependency | Phaser 3 (`Phaser.Plugins.BasePlugin`) | None. Runs in browsers, Telegram Mini Apps, any engine and Node >= 20 |
| Creation | Registered as a global plugin in the Phaser game config and created by Phaser's `PluginManager` | `new FunticoClient()`, created by you, no arguments |
| Access | Injected into every Scene as `this.funtico` via the plugin `mapping` | No scene mapping. Keep the instance in a variable or export it from a module |
| Event bus | `this.game.events`, the global Phaser `EventEmitter` | The client's own `on` / `once` / `off` |
| `init()` failure | Caught and logged as `[FunticoPhaserPlugin] Initialization error: ...`; the promise still resolves | Rejects with the same error `Initialize` threw (including `Invalid FunticoConfig: ...`) and emits nothing |
| A listener that throws | Propagates out of the emit: later listeners are skipped and the wrapper method rejects even though the SDK call succeeded (inside `init()` it is caught and logged as an initialization error, and `AUTHENTICATED` may be skipped) | Logged with `console.error('[FunticoClient] listener for "<event>" threw:', err)`; the other listeners still run and the method still resolves |
| Listener cleanup | Remove on the Scene's `'shutdown'` event | Remove with `off` when your UI is torn down |
| `off(event, fn)` without a context | Removes every registration of `fn`, whatever context it was registered with | Removes only registrations made **without** a context. Pass the same context you gave to `on` / `once`, or the listener stays registered |
| `this` in a listener registered without a context | The emitter | `undefined` |
| A `once` listener removed by an earlier listener during the same emit | Still called, once | Not called |

Porting Phaser code is mostly mechanical:

```js
import { FunticoClient } from './funtico-sdk.mjs';

// Phaser:  this.funtico.sdk.GetCachedUserData()
const user = funtico.sdk.GetCachedUserData();

// Phaser:  this.game.events.on(FunticoPhaserPlugin.EVENTS.BALANCE_UPDATED, this.onBalance, this)
const hud = {
  onBalance(balance) {
    console.log('Coins:', balance.Coins, 'for', user?.Name);
  }
};
funtico.on(FunticoClient.EVENTS.BALANCE_UPDATED, hud.onBalance, hud);

// Phaser:  this.game.events.off(FunticoPhaserPlugin.EVENTS.BALANCE_UPDATED, this.onBalance)
// FunticoClient: off() matches the context exactly, so pass the one used in on()
funtico.off(FunticoClient.EVENTS.BALANCE_UPDATED, hud.onBalance, hud);

// Phaser:  await this.funtico.init(config); if (!this.funtico.sdk.getUserToken()) { ... }
// FunticoClient: init() rejects on failure, so handle errors with try/catch instead
```

---

## Utilities & Types

These are static helper classes exported alongside `FunticoSDK`. They are not part of the SDK instance surface — call them directly off the class (`CryptoHelper.encrypt(...)`, `PrizeUtils.calculatePrize(...)`).

Both builds export them, together with the `PrizeType` enum. With the ESM build, import them by name. With the `<script>` build they live on the global namespace as `FunticoSDK.CryptoHelper`, `FunticoSDK.PrizeUtils` and `FunticoSDK.PrizeType`:

```js
// ESM build (bundlers, <script type="module">, Node import)
import { CryptoHelper, PrizeUtils, PrizeType } from './funtico-sdk.mjs';
```

```js
// <script src="funtico-sdk.js"> build: the same names on the global namespace
const { CryptoHelper, PrizeUtils, PrizeType } = FunticoSDK;
```

`CryptoHelper` runs on the standard Web Crypto API (`window.crypto` in browsers and Telegram Mini App webviews, `globalThis.crypto` in Node >= 20). It needs no polyfill and no extra dependency.

---

### `CryptoHelper.encrypt`

Encrypts a plaintext string and returns the ciphertext as Base64. The SDK calls this internally for every payload that needs it; games rarely need it.

**Signature:**
```ts
static async encrypt(plainText: string, keyStr: string): Promise<string>
```

**Parameters:**
- `plainText` - The string to encrypt. Typically a `JSON.stringify`-ed payload object.
- `keyStr` - The key material.

**Returns:** `Promise<string>` - The ciphertext as a Base64 string.

**Usage:**
```js
import { CryptoHelper } from './funtico-sdk.mjs';

const encrypted = await CryptoHelper.encrypt(JSON.stringify({ Score: 1200 }), encryptionKey);
console.log(encrypted); // "k3Jd8f...=="
```

---

### `CryptoHelper.decrypt`

Decrypts a Base64 ciphertext back into a plaintext string — the inverse of `CryptoHelper.encrypt`. The SDK calls this internally; games rarely need it, since `ReconnectToUnfinishedSession_Client` already returns the decrypted session state.

**Signature:**
```ts
static async decrypt(encryptedBase64: string, keyStr: string): Promise<string>
```

**Parameters:**
- `encryptedBase64` - The Base64 ciphertext to decrypt.
- `keyStr` - The key material. It must match the key used to encrypt.

**Returns:** `Promise<string>` - The decrypted plaintext. Parse it with `JSON.parse` if the original payload was an object.

**Important Notes:**
- Rejects on a wrong key or corrupted ciphertext. Wrap the call in `try/catch`.

**Usage:**
```js
import { CryptoHelper } from './funtico-sdk.mjs';

try {
  const json = await CryptoHelper.decrypt(payload.Data, decryptionKey);
  const state = JSON.parse(json);
  restoreGameState(state); // your own function that rebuilds the game from the saved state
} catch (e) {
  console.error('Could not decrypt session state', e);
}
```

---

### `CryptoHelper.hmacSha256`

Signs a message and returns the signature as a lowercase hex string. The SDK calls this internally to sign the payloads it sends; games rarely need it.

**Signature:**
```ts
static async hmacSha256(message: string, keyStr: string): Promise<string>
```

**Parameters:**
- `message` - The string to sign.
- `keyStr` - The signing key.

**Returns:** `Promise<string>` - The 64-character lowercase hex signature.

**Usage:**
```js
import { CryptoHelper } from './funtico-sdk.mjs';

const encrypted = await CryptoHelper.encrypt(JSON.stringify(payload), encryptionKey);
const hash = await CryptoHelper.hmacSha256(encrypted, signingKey);

await fetch('/my-game-server/submit', {
  method: 'POST',
  body: JSON.stringify({ EncryptedData: encrypted, Hash: hash })
});
```

---

### `PrizeUtils.calculatePrize`

Computes the total TICO value of a room's **automated** prizes for a given deposit stake pool. Use it to render a "prize value" figure from any `Prize[]` the SDK hands you.

The SDK calls this internally to produce `PrizePlaceViewModel.RewardFeeRatio`, `PrizePoolDistributionViewModel.TicoSharedViaPlaces` and `RoomLeaderboardViewModel.YourTicoEarnings`, so reach for it directly only when you are valuing a prize list yourself.

**Signature:**
```ts
static calculatePrize(prizes: Prize[], depositStake: number): number
```

**Parameters:**
- `prizes` - The list of prizes to evaluate — `PrizePlaceViewModel.Prizes` from `GetPrizePoolDistribution`, or `HOFDistributionItem.prizes` from `GetHallOfFameDistribution`. A falsy value (`null`/`undefined`) yields `0` rather than throwing. **Not** `GetPrizes`, which returns a different shape entirely (see its own section).
- `depositStake` - The total deposit stake pool that percentage-based prizes are shares of. Only read by the `GppPoolShare` and `DepositStakePoolShare` branches. `GetPrizePoolDistribution` sources this from the room config's own computed deposit stake.

**Returns:** `number` - The summed prize value. Only these prize types contribute:
- `GppPoolShare` and `DepositStakePoolShare` — add `Math.floor((Percentage * depositStake) / 100)`, and only when `Percentage` is neither `undefined` nor `null`.
- `DepositStakePerPlayer` and `GppPerPlayer` — add the prize's `Value` as-is.

Every other type (`Item`, `Reward`, `External`, `Placeholder`, `GameManagedReward`) contributes `0`. `Item`, `Reward`, `External` and `Placeholder` are physical/item prizes with no computable TICO value. `GameManagedReward` is excluded for a different reason: it is granted by the game itself rather than paid out of the deposit stake, so counting it would overstate what the platform actually pays. Both cases mean the same thing for your UI — present those prizes separately rather than as part of the TICO figure.

**PrizeType Properties:**

A string enum whose value equals its name on the wire. At runtime it is a plain object (`PrizeType.Item === 'Item'`), so you can compare `prize.type` against either the enum member or the string literal.
- `Item` (`'Item'`) - A platform inventory item awarded automatically. Carries `ItemId` and `Amount`.
- `DepositStakePoolShare` (`'DepositStakePoolShare'`) - A percentage share of the pool built from players' deposit stakes.
- `DepositStakePerPlayer` (`'DepositStakePerPlayer'`) - A flat deposit-stake payout granted per player, not a share of a pool.
- `GppPoolShare` (`'GppPoolShare'`) - A percentage share of the Guaranteed Prize Pool.
- `GppPerPlayer` (`'GppPerPlayer'`) - A flat GPP payout granted per player.
- `External` (`'External'`) - A manually fulfilled prize awarded outside the platform (NFT, physical goods, partner reward). Modelled by `ManualPrize`.
- `Placeholder` (`'Placeholder'`) - A manually configured display-only prize entry, used to show a prize that is not yet finalised. Also modelled by `ManualPrize`.
- `Reward` (`'Reward'`) - An automated platform reward referenced by `PrizeId`.
- `GameManagedReward` (`'GameManagedReward'`) - A reward whose distribution the game itself manages. Shaped like a GPP prize, but **not** counted by `calculatePrize` (it contributes `0`): the game grants it, so it is not paid from the deposit stake. Read its `Value` yourself if you want to show it.

**Prize Properties:**

`Prize` is a discriminated union — narrow it on the `type` field to reach the variant-specific fields:
```ts
export type Prize =
  | ManualPrize
  | ItemAutomatedPrize
  | RewardAutomatedPrize
  | DepositStakeAutomatedPrize
  | GppAutomatedPrize;
```

It is returned by `GetPrizePoolDistribution` (as `PrizePlaceViewModel.Prizes`) and by `GetHallOfFameDistribution` (as `HOFDistributionItem.prizes`) — one union models both.

`Prize` and the prize interfaces below are type-only exports: they exist in the bundled `.d.ts` / `.d.mts` for editor completion and type checking, but there is no runtime value to import. In plain JavaScript you just read the fields off the objects the SDK returns. Your editor can still check them through a JSDoc annotation such as `/** @type {import('./funtico-sdk.mjs').Prize[]} */`.

Note the field names: a lowercase `type` discriminator, PascalCase value fields (`Amount`, `ItemId`, `PrizeId`, `Value`, `Currency`, `Percentage`, `Name`, `ImageUrl`, `ValueUsd`), and a lowercase nested `Item` (`id` / `image` / `name`). Read them exactly as documented below.

**BasePrize Properties:**

The common base every prize interface extends.
- `type` (`PrizeType`) - The discriminator identifying which prize variant this object is. Each derived interface narrows it to the specific members it covers.

**ManualPrize Properties:** (extends `BasePrize`; `type` is `PrizeType.External | PrizeType.Placeholder`)
- `type` (`PrizeType.External | PrizeType.Placeholder`) - Narrowed discriminator. Both manual kinds share this one shape.
- `Id` (`number`) - Identifier of the manual prize record on the platform.
- `ValueUsd` (`number`, optional) - Declared USD worth of the prize, used for display. Optional because manual prizes need not be valued.
- `ImageUrl` (`string`) - URL of the prize artwork. Load it with your own image loader (an `<img>` element or your engine's loader); the SDK does not fetch images.
- `Name` (`string`) - Display name of the prize.
- `Description` (`string`) - Longer human-readable description shown in prize detail UI.
- `Chain` (`string`) - Blockchain the prize lives on, for on-chain prizes (e.g. an NFT).
- `ContractAddress` (`string`) - Address of the token contract backing the prize.
- `ExplorerUrl` (`string`) - Block-explorer link for the prize, for players who want to verify it on-chain.
- `WalletAddress` (`string`) - Wallet the prize is held in or will be sent from.
- `TokenId` (`number`, optional) - The specific token id within the contract. Optional — absent for non-NFT and placeholder prizes.

**PrizeWithAmountAndItem Properties:** (extends `BasePrize`)

The shared shape for automated prizes that grant a quantity of something. Not used directly — `ItemAutomatedPrize` and `RewardAutomatedPrize` extend it.
- `Amount` (`number`) - How many units of the item/reward are granted.
- `Item` (`PlatformItemPrize`, optional) - The expanded platform item this prize resolves to. Absent when the response only carries the id. See `PlatformItemPrize` below.

**ItemAutomatedPrize Properties:** (extends `PrizeWithAmountAndItem`)
- `type` (`PrizeType.Item`) - Narrowed discriminator.
- `ItemId` (`number`) - Id of the platform inventory item to grant.
- `Amount` (`number`) - Quantity of that item granted. Inherited from `PrizeWithAmountAndItem`.
- `Item` (`PlatformItemPrize`, optional) - Expanded item details for display. Inherited from `PrizeWithAmountAndItem`.

**RewardAutomatedPrize Properties:** (extends `PrizeWithAmountAndItem`)
- `type` (`PrizeType.Reward`) - Narrowed discriminator.
- `PrizeId` (`number`) - Id of the platform reward definition to grant.
- `Amount` (`number`) - Quantity of that reward granted. Inherited from `PrizeWithAmountAndItem`.
- `Item` (`PlatformItemPrize`, optional) - Expanded item details for display, when the reward maps to an inventory item. Inherited from `PrizeWithAmountAndItem`.

**DepositStakeAutomatedPrize Properties:** (extends `BasePrize`)
- `type` (`PrizeType.DepositStakePoolShare | PrizeType.DepositStakePerPlayer`) - Narrowed discriminator. It decides which of `Percentage` and `Value` `calculatePrize` reads: pool-share uses `Percentage`, per-player uses `Value`.
- `Currency` (`number`) - Numeric platform currency code the `Value` is denominated in.
- `Value` (`number`) - The flat payout amount. Counted directly by `calculatePrize` for `DepositStakePerPlayer`.
- `Percentage` (`number`, optional) - Whole-number percent of the deposit stake pool this prize takes. Optional — `calculatePrize` skips the prize entirely when it is `undefined` or `null`.

**GppAutomatedPrize Properties:** (extends `BasePrize`)
- `type` (`PrizeType.GppPoolShare | PrizeType.GppPerPlayer | PrizeType.GameManagedReward`) - Narrowed discriminator. `GppPoolShare` is evaluated from `Percentage`; `GppPerPlayer` is counted by `Value`; `GameManagedReward` is not counted at all. The three share one interface because they share a shape, not because they are valued alike. Treat `Percentage` as absent for `GameManagedReward`.
- `Currency` (`number`) - Numeric platform currency code the `Value` is denominated in.
- `Value` (`number`) - The flat payout amount. Counted directly by `calculatePrize` for `GppPerPlayer` only; for `GameManagedReward` it is informational.
- `Percentage` (`number`, optional) - Whole-number percent of the Guaranteed Prize Pool. Optional — `calculatePrize` skips the prize entirely when it is `undefined` or `null`.

**PlatformItemPrize Properties:**

The expanded platform item attached to item-bearing prizes. Its fields are lowercase.
- `id` (`number`) - Platform id of the item. Matches the parent's `ItemId` / `PrizeId`.
- `image` (`string`) - URL of the item artwork. Feed it to your own image loader.
- `name` (`string`) - Display name of the item, e.g. `"Gift Box"`.

**Usage:**
```js
import { PrizeType, PrizeUtils } from './funtico-sdk.mjs';

const dist = await sdk.GetPrizePoolDistribution(room.Guid);
/** @type {import('./funtico-sdk.mjs').Prize[]} */
const firstPlace = dist.PrizePlaces[0]?.Prizes ?? [];

// Total TICO value of the automated prizes for a 50,000 deposit stake pool
const total = PrizeUtils.calculatePrize(firstPlace, 50000);
document.querySelector('#prize-label').textContent = `1st place: ${total} TICO`;

// Narrow the union to render the non-computable prizes separately.
for (const prize of firstPlace) {
  switch (prize.type) {
    case PrizeType.Item:
      console.log(`${prize.Amount}x item #${prize.ItemId} (${prize.Item?.name ?? 'unknown'})`);
      break;
    case PrizeType.Reward:
      console.log(`${prize.Amount}x reward #${prize.PrizeId}`);
      break;
    case PrizeType.External:
    case PrizeType.Placeholder:
      console.log(`${prize.Name} — $${prize.ValueUsd ?? 0} — ${prize.ImageUrl}`);
      break;
    case PrizeType.GppPoolShare:
    case PrizeType.DepositStakePoolShare:
      console.log(`${prize.Percentage}% of the pool`);
      break;
    case PrizeType.GppPerPlayer:
    case PrizeType.DepositStakePerPlayer:
      console.log(`${prize.Value} per player`);
      break;
    case PrizeType.GameManagedReward:
      // Shares GppAutomatedPrize's shape, but calculatePrize scores it 0 - the game grants it
      console.log(`${prize.Value} granted by the game (not counted in the TICO total)`);
      break;
  }
}
```
