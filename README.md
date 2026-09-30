# Funtico JS SDK - Integration Guide

This guide covers setting up and using the Funtico Games SDK in **plain JavaScript**. It does not depend on any framework, so it works in plain browser JS, in any engine (PixiJS, Three.js, Babylon.js, a custom canvas loop, ...), in Telegram Mini Apps, and in Node.js.

The Funtico JS SDK is **generated from the Funtico Phaser SDK** ([pillarex/funtico-sdk-phaser](https://github.com/pillarex/funtico-sdk-phaser), checked out here as the `upstream/phaser` submodule). The build removes the Phaser dependency and keeps everything else, so the API is the same method for method: same names, parameters, return models, wire handling and encryption. The only addition is `FunticoClient`, a small event-emitting wrapper that replaces the Phaser plugin.

The SDK covers rooms and tournament management, special tournaments, the Hall of Fame leaderboard, Campaign Mode, and client-side session reconnection.

## Documentation

- **This guide**: installation and a step-by-step integration walkthrough. Start here.
- [Usage Guide](./USAGE.md): the full reference for every public method and type, with signatures, parameters, return values, and a description of every field in every model.

> **Example conventions** (used throughout this guide and USAGE.md):
> - `funtico` is a `FunticoClient` instance (`const funtico = new FunticoClient();`).
> - `sdk` is `funtico.sdk`, which is the same object as `FunticoSDK.Instance`.
> - Examples use the **ES module** build, so names are imported: `import { FunticoClient, FunticoSDK, FunticoEnvironment } from './funtico-sdk.mjs';`. With the classic `<script>` build the same names are properties of the global `FunticoSDK` namespace: `FunticoSDK.FunticoClient`, `FunticoSDK.FunticoEnvironment`, and so on.
> - UI helpers such as `showToast(...)` or `renderStars(...)` stand in for your game's own code.

---

## Table of Contents

1. [Installation & Setup](#1-installation--setup)
2. [Initialization & Authentication](#2-initialization--authentication)
3. [User Profile & Balance](#3-user-profile--balance)
4. [Rooms API (Singleplayer Match Lifecycle)](#4-rooms-api-singleplayer-match-lifecycle)
5. [Special Tournaments](#5-special-tournaments)
6. [Hall of Fame](#6-hall-of-fame)
7. [Campaign Mode](#7-campaign-mode)
8. [Session Reconnection & Progress Saving](#8-session-reconnection--progress-saving)
9. [Complete Browser Example](#9-complete-browser-example)
10. [Troubleshooting](#10-troubleshooting)
11. [Regenerating the SDK (Maintainers)](#11-regenerating-the-sdk-maintainers)

---

## 1. Installation & Setup

The SDK is a set of prebuilt files in `dist/`. Each file stands alone and has no runtime dependencies. Get them in one of two ways:

- **Copy the files:** download the [`dist/` folder of the latest release tag](https://github.com/pillarex/FunticoJSSDK/tree/v1.0.0/dist) (or of a clone of this repo) and put the files you need into your project, for example `public/sdk/` or `src/sdk/`.
- **Install as a dependency:** `npm install github:pillarex/FunticoJSSDK#v1.0.0`, then import `funtico-sdk-js` (see [Loading in Node.js](#loading-in-nodejs-20) for how the two builds resolve).

| File | Format | Use it for |
|---|---|---|
| `dist/funtico-sdk.js` | Classic script with CommonJS support (UMD-style, no AMD) | `<script src="...">` (defines the global `FunticoSDK` namespace) and Node `require()` (only where the nearest `package.json` has no `"type": "module"`; see [Loading in Node.js](#loading-in-nodejs-20)) |
| `dist/funtico-sdk.mjs` | ES module | Bundlers (Vite, webpack, esbuild, Rollup), `<script type="module">`, Node `import` |
| `dist/funtico-sdk.d.ts` | TypeScript declarations | Types for `require()` and for the `FunticoSDK` script global |
| `dist/funtico-sdk.d.mts` | TypeScript declarations | Types for the ES module build |

**Runtime requirements:** an ES2020 environment with `fetch`, Web Crypto (`crypto.subtle` and `crypto.getRandomValues`), `atob`/`btoa` and `TextEncoder`/`TextDecoder`. `crypto.randomUUID` is used when it is available but is not required; the SDK falls back to `getRandomValues`. Node.js 20 or newer provides all of these. The SDK uses no DOM APIs, but when a `window` object exists it takes `window.crypto` in preference to `globalThis.crypto`.

> **Browsers expose `crypto.subtle` only in a secure context:** an `https://` page, or `http://localhost` / `http://127.0.0.1`. On a plain `http://` page from any other host (for example `http://192.168.x.x` while testing on a phone over the LAN) the SDK still initializes and authenticates, but every call that encrypts fails with `TypeError: Cannot read properties of undefined (reading 'importKey')`. That covers the session checkpoints, `EndRoomSP`, `ResultTournament_Client` and `CompleteCampaignLevel`. `window.isSecureContext` tells you which case you are in. Telegram Mini Apps are served over HTTPS and are not affected. See [Troubleshooting](#web-crypto-unavailable-in-a-browser-or-a-test-dom).

### Loading with a `<script>` tag (global namespace)

```html
<script src="sdk/funtico-sdk.js"></script>
<script>
  // Every export lives on the global FunticoSDK namespace
  const funtico = new FunticoSDK.FunticoClient();
  const sdk = FunticoSDK.FunticoSDK.Instance; // the namespace and the class share a name
</script>
```

> The namespace is called `FunticoSDK` and contains a class that is also called `FunticoSDK`, so the singleton is `FunticoSDK.FunticoSDK.Instance`. Do not write `const { FunticoSDK } = FunticoSDK;` in a classic script. The new `const` shadows the global and throws a `ReferenceError`. Rename the binding instead: `const { FunticoSDK: Sdk } = window.FunticoSDK;`.

### Loading as an ES module (bundlers or `<script type="module">`)

```js
import { FunticoClient, FunticoSDK, FunticoEnvironment } from './sdk/funtico-sdk.mjs';

const funtico = new FunticoClient();
const sdk = FunticoSDK.Instance; // same object as funtico.sdk
```

In the browser without a bundler, load your entry file with `<script type="module" src="game.js"></script>`. ES modules must be served over HTTP(S), not opened from `file://`, and the SDK's encryption needs HTTPS or `localhost` (see the secure-context note above). The server must also send `.mjs` files with a JavaScript MIME type (see [Troubleshooting](#10-troubleshooting)).

### Loading in Node.js (20+)

```js
// CommonJS (only in a project without "type": "module" - see the note below)
const { FunticoSDK, FunticoEnvironment } = require('./sdk/funtico-sdk.js');
```

```js
// ES module (.mjs, or "type": "module")
import { FunticoSDK, FunticoEnvironment } from './sdk/funtico-sdk.mjs';
```

> **A copied `funtico-sdk.js` is CommonJS only if the nearest `package.json` has no `"type": "module"`.** Node decides how to load a `.js` file from the closest `package.json` above it, and `"type": "module"` is the default in Vite templates and many modern Node apps. In such a project the copied `funtico-sdk.js` loads as an ES module that exports nothing: `require('./sdk/funtico-sdk.js')` returns an empty object on current Node (every destructured name is `undefined`, and only the `globalThis.FunticoSDK` global is set) or throws `ERR_REQUIRE_ESM` on older Node, and TypeScript does not catch it. In an ESM project, import `funtico-sdk.mjs` instead, install the package from its path (below), or save the copies as `funtico-sdk.cjs` and `funtico-sdk.d.cts` before requiring them.

The package is not published to the npm registry. To consume it as a dependency, install it straight from GitHub, pinned to a release tag: `npm install github:pillarex/FunticoJSSDK#v1.0.0` (or from a local checkout: `npm install ../FunticoJSSDK`). Then `import ... from 'funtico-sdk-js'` resolves to the ES module build and `require('funtico-sdk-js')` resolves to the CommonJS build, each with its own types. This works whatever the host project's `"type"` is. The two conditions load **two separate copies** of the SDK, so pick one module system for the whole program (see the callout below).

### TypeScript types

The declarations are generated from the same source, so every model, enum and method signature documented in [USAGE.md](./USAGE.md) comes with full types:

- **ES module:** keep `funtico-sdk.d.mts` next to `funtico-sdk.mjs`. TypeScript picks it up automatically for `import ... from './funtico-sdk.mjs'`.
- **CommonJS:** keep `funtico-sdk.d.ts` next to `funtico-sdk.js`. In a project whose `package.json` has `"type": "module"`, both files are treated as ES modules, so rename the copies to `funtico-sdk.cjs` / `funtico-sdk.d.cts` (or use the `.mjs` build).
- **Script tag:** add `/// <reference path="./sdk/funtico-sdk.d.ts" />` to a non-module `.ts` file. The declaration ends with `export as namespace FunticoSDK;`, which types the global namespace.
- **Plain JS with editor checking:** add `// @ts-check` at the top of a `.js` file that imports the SDK. VS Code then type-checks your calls against the declarations, and JSDoc `@type` annotations work for your own values.

> **Load exactly one build per page or program.** `funtico-sdk.js` and `funtico-sdk.mjs` are separate copies of the same code. Each has its own `FunticoSDK.Instance` singleton and its own classes. If you load both, you get two SDKs with separate login state and caches, and `err instanceof CampaignError` is `false` for errors thrown by the other build. This also applies when the SDK is installed as a package, where you never pick a file yourself: `import 'funtico-sdk-js'` loads `funtico-sdk.mjs` and `require('funtico-sdk-js')` loads `funtico-sdk.js`. If anything in your app reaches the package both ways (your own code, a CommonJS dependency, `createRequire`, or a bundler that honours both the `import` and `require` conditions), you get the two separate SDKs described above, and a bundle carries both copies. Across your app, its dependencies and its bundle, use only `import` or only `require`.

### Option A: FunticoClient with Events (Recommended)

`FunticoClient` is the framework-independent counterpart of the Phaser plugin. It wraps the singleton, calls the same SDK methods, and emits the same events with the same payloads. Your UI can subscribe to those events instead of owning every request.

```js
import { FunticoClient, FunticoEnvironment } from './sdk/funtico-sdk.mjs';

const funtico = new FunticoClient();
const sdk = funtico.sdk; // always FunticoSDK.Instance

funtico
  .on(FunticoClient.EVENTS.INITIALIZED, () => console.log('SDK ready'))
  .on(FunticoClient.EVENTS.AUTHENTICATED, (jwt) => console.log('Logged in, JWT length:', jwt.length))
  .on(FunticoClient.EVENTS.BALANCE_UPDATED, (balance) => console.log('Coins:', balance.Coins));

await funtico.init({
  env: FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-private-key',
  userToken: 'token-from-funtico-platform'
});
```

| Method | SDK call | Event emitted (payload) |
|---|---|---|
| `init(config)` | `Initialize(config)` | `INITIALIZED` (none), then `AUTHENTICATED` (game JWT) if the SDK holds a JWT afterwards (normally from `config.userToken`; `Initialize` does not clear a JWT from an earlier login) |
| `login(platformToken)` | `Authentication(platformToken)` | `AUTHENTICATED` (game JWT) |
| `refreshUserData(useCache = false)` | `GetUserData(useCache)` | `USER_DATA_UPDATED` (`UserData`) |
| `refreshBalance(useCache = false)` | `GetBalance(useCache)` | `BALANCE_UPDATED` (`BalanceResponse`) |
| `refreshCampaign(useCache = false)` | `GetCampaignLevels(useCache)` | `CAMPAIGN_PROGRESS_UPDATED` (`CampaignLevelsViewModel`) |
| `completeCampaignLevel(metrics)` | `CompleteCampaignLevel(metrics)` | `CAMPAIGN_PROGRESS_UPDATED` (`CampaignCompletionResult`) |

`FunticoClient.EVENTS` uses exactly the same keys and string values as the Phaser plugin's `EVENTS`: `INITIALIZED` = `'funtico_initialized'`, `AUTHENTICATED` = `'funtico_authenticated'`, `USER_DATA_UPDATED` = `'funtico_user_updated'`, `BALANCE_UPDATED` = `'funtico_balance_updated'`, `CAMPAIGN_PROGRESS_UPDATED` = `'funtico_campaign_progress_updated'`.

Event API:

- `on(event, listener, context?)` / `once(event, listener, context?)` / `off(event, listener?, context?)` all return the client, so calls can be chained.
- `once` listeners are removed before they run. `off(event)` without a listener removes every listener for that event. `off(event, listener, context)` removes only the matching listener/context pairs.
- Listeners run synchronously, in the order they were registered, over a snapshot of the listener list.
- Each `FunticoClient` instance has its own listeners, but all instances share the one `FunticoSDK` singleton.

**Deliberate differences from the Phaser plugin:**

1. **`init()` does not swallow errors.** If `Initialize` rejects (an invalid config, a failed authentication), `init()` rejects with that same error and emits nothing. The Phaser plugin logs the error and resolves, which hides the failure.
2. **Listener isolation.** If a listener throws, the error is logged with `console.error('[FunticoClient] listener for "<event>" threw:', err)`. The remaining listeners still run, and the SDK call still resolves.

**Also different from Phaser's event emitter (watch for these when porting):** `off(event, listener)` matches the context exactly. Phaser removes `listener` whatever context it was registered with, while `FunticoClient` removes only registrations made without a context. So a ported `this.game.events.off(E, this.onX)` must become `funtico.off(E, this.onX, this)`, passing the same context you gave to `on()`, or the handler stays registered. See [Differences from the Phaser plugin](./USAGE.md#differences-from-the-phaser-plugin) in USAGE.md for the full list.

### Option B: Using the Singleton Directly

If you do not need events, use the singleton on its own:

```js
import { FunticoSDK } from './sdk/funtico-sdk.mjs';

const sdk = FunticoSDK.Instance;
```

---

## 2. Initialization & Authentication

Before calling any API method, initialize the SDK with your game credentials from the Funtico Developer Portal.

```js
import { FunticoClient, FunticoEnvironment } from './sdk/funtico-sdk.mjs';

const funtico = new FunticoClient();

await funtico.init({
  env: FunticoEnvironment.STAGING, // STAGING or PROD
  publicGameKey: 'your-public-key', // Public key, sent with every request
  privateGameKey: 'your-private-key', // Signing key - keep it out of source control and logs (see the security note below)
  userToken: 'token-from-funtico-platform', // Automatically authenticates the player on startup
  apiBaseUrl: 'https://funtico-sdk-staging.azurewebsites.net', // Your Game API gateway endpoint (optional)
  funticoApiBaseUrl: 'https://staging.api.funtico.com' // Funtico platform API (optional)
});
```

Both URL overrides are optional because `env` resolves each one to the right default. They point to **two different hosts**. `apiBaseUrl` is your game's Rooms API and takes the game JWT. `funticoApiBaseUrl` is the Funtico platform itself and takes the player's platform token. The leaderboard reads player names and avatars from the platform host.

If you leave out `userToken`, authenticate later with `await funtico.login(platformToken)`. When a `userToken` is given, `init()` also preloads the user profile, balance and vouchers into the SDK cache. A failed preload is ignored, and these preloads emit no events. Call `refreshUserData()` / `refreshBalance()` when you want `USER_DATA_UPDATED` / `BALANCE_UPDATED`.

### Config validation (fail-fast)

`Initialize` checks the keys **before** it changes any state or sends any request. If the config is rejected, the returned promise rejects with an `Error` whose message starts with `Invalid FunticoConfig: `. An SDK that was already initialized keeps its previous config and keeps working. The config is rejected when:

- The config is missing or is not an object.
- `publicGameKey` or `privateGameKey` is missing, is not a string, or is empty.
- Either key has leading or trailing whitespace. This is usually a stray newline or CR from a `.env` file or a copy-paste.
- `privateGameKey` is shorter than 8 characters. A key that short can never be valid.
- `privateGameKey` is the same as `publicGameKey`.
- One key contains the other, which means the keys were concatenated or pasted into one field. Pass **only** the secret key from the Developer Portal in `privateGameKey`.

The format is not checked beyond these rules. Legacy public keys are GUIDs, newer ones are URL-safe base64, and both are accepted. Error messages give key lengths but never the key values, so they are safe to log or send to an error tracker.

```js
try {
  await funtico.init({
    env: FunticoEnvironment.PROD,
    publicGameKey: 'your-public-key',
    privateGameKey: 'your-private-key',
    userToken: 'token-from-funtico-platform'
  });
} catch (error) {
  // Invalid config or failed authentication - FunticoClient.init() does not swallow either
  console.error(error.message);
}
```

> **Security note: in a browser build, `privateGameKey` is a signing key, not a true secret.** The SDK uses it only locally, to encrypt and sign score and session payloads and to derive the `X-Server-Key` proof. It is never sent over the wire in plain form, and it never appears in SDK error messages. The client-side flows (the session checkpoint methods, `EndRoomSP`, `ResultTournament_Client` and `CompleteCampaignLevel`) run in the browser and need the key there, and `init()` rejects a config without it. So a browser or Mini App build must contain it, and anything bundled into client-side JavaScript can be extracted by a determined player, who could then sign payloads of their own. Treat it accordingly:
> - Keep it out of source control and logs. Injecting it at build time keeps it out of the repository, but it still ends up in the shipped bundle.
> - Rotate it in the Developer Portal if it leaks, and never reuse it for anything that must stay server-only.
> - Do not rely on it for anti-cheat guarantees; those need server-side validation.
> - It stays truly secret only when the SDK runs on a trusted Node.js server, which is also where `ResultTournament_Server` belongs.

---

## 3. User Profile & Balance

After authentication, user profiles and balances are cached locally to avoid repeating the same HTTP requests.

```js
import { EntryFeeType } from './sdk/funtico-sdk.mjs';

// Fetch the full profile from the server
const user = await funtico.refreshUserData(false); // false forces an API fetch and skips the cache

// Check whether the player can afford a tournament before joining it
const canAfford = funtico.sdk.CanAffordFromCache(EntryFeeType.Tico, 500);
```

---

## 4. Rooms API (Singleplayer Match Lifecycle)

### Fetching Rooms and Configs
```js
const tiers = await funtico.sdk.GetTiers();
const rooms = await funtico.sdk.GetRooms();       // singleplayer by default
const roomDetails = await funtico.sdk.GetRoom('room-guid');
const roomSettings = await funtico.sdk.GetRoomSettings('event-guid');

// Prize table for a room
const prizes = await funtico.sdk.GetPrizePoolDistribution('room-guid');

// Resolve a tier from an event id, using the list GetRooms already fetched
const tier = await funtico.sdk.GetTierByEventId('event-guid');
```

### Match Lifecycle
1. **JoinRoom**: Deducts the fee or ticket, registers the player's participation, and starts the run.
   ```js
   // Omit the second argument and the SDK spends a voucher only if the player has one
   const sessionData = await funtico.sdk.JoinRoom(roomGuid);

   // Or decide explicitly:
   // await funtico.sdk.JoinRoom(roomGuid, false); // never use a voucher
   ```
   > The run is live as soon as `JoinRoom` resolves, and the server-side timers are already running.
   > Load your level before calling it, not after.
2. **EndRoomSP**: Submits the player's final score.
   ```js
   // The SDK encrypts and signs the payload for you
   await funtico.sdk.EndRoomSP(
     sessionData.EventId,
     sessionData.SessionOrMatchId,
     score,
     user.UserId,
     '127.0.0.1',
     ['start_game', 'score_updated'] // Optional gameplay event log
   );
   ```
3. **GetLeaderboard**: Reads the final standings and the player's own payout.
   ```js
   import { LeadersState } from './sdk/funtico-sdk.mjs';

   const board = await funtico.sdk.GetLeaderboard(
     sessionData.EventId,
     sessionData.SessionOrMatchId
   );

   // State is a LeadersState enum member (a number), not a string
   console.log('State:', LeadersState[board.State]);
   if (board.IsPending) showCalculatingResults();

   // LeaderboardItems[].UserId is the platform id - match it against PlatformId
   const me = funtico.sdk.GetCachedUserData();
   const myRow = board.LeaderboardItems.find(i => i.UserId === me?.PlatformId);
   ```

---

## 5. Special Tournaments

Special tournaments are timed global competitions, each with its own prize distribution and community leaderboard.

### Fetching Tournaments and Standings
```js
import { TournamentsFilterEnum } from './sdk/funtico-sdk.mjs';

// Get ongoing tournaments
const tournaments = await funtico.sdk.GetTournaments(1, 100, TournamentsFilterEnum.OnGoing);

const t = tournaments[0];
console.log(`${t.Name} — starts ${t.StartDate}, up to ${t.EntryLimit} entries`);
console.log(`${t.PrizePoolLabel} — entry fee ${t.EntryFee}`);
// -> "Weekend Cup — starts 2026-01-10T18:00:00Z, up to 20 entries"
// -> "10K TICO & More — entry fee 100"

// t.Id is the tournament identifier that every other tournament method accepts.
const leaderboard = await funtico.sdk.GetTournamentLeaderboard(t.Id);

leaderboard.Players.forEach(p => console.log(`#${p.Place} ${p.UserName} — ${p.Score}`));
// -> "#1 PlayerOne — 12500"

// Match players by FunticoId, which is a platform id.
const me = funtico.sdk.GetCachedUserData();
const myRow = leaderboard.Players.find(p => p.FunticoId === me?.PlatformId);
```

> **Note:** Pass `TournamentViewModel.Id` to every other tournament method. The schedule fields are `StartDate` / `EndDate` and the attempt cap is `EntryLimit`. The leaderboard keeps each player's best score. See [USAGE.md](./USAGE.md) for the full field list.

### Joining and Entering Tournament
```js
// 1. Join. This is required before every EnterTournament. A scored attempt uses up the join,
//    so join again before each new attempt. A join that cannot go through rejects.
const successJoin = await funtico.sdk.JoinTournament(t.Id, 'community-guid', 'password');

// 2. Enter a tournament match (call this before starting each attempt)
const enterData = await funtico.sdk.EnterTournament(t.Id);

// TournamentScoreUuid is the saveScoreId.
const saveScoreId = enterData.TournamentScoreUuid;
```

> **`TournamentScoreUuid` is the `saveScoreId`.** `EnterTournament` returns it. Pass it as `saveScoreId` to `ResultTournament_Client` / `ResultTournament_Server`.

### Submitting Results (Client-Side)
```js
// The SDK encrypts and signs the payload for you
await funtico.sdk.ResultTournament_Client(
  t.Id,
  saveScoreId,   // enterData.TournamentScoreUuid
  score,
  true, // isSuccess
  JSON.stringify({ kills: 12, levelCompleted: 4 }) // customData
);

// Resolves once the score is saved; a refused payload rejects.
console.log('Score submitted');
```

### Tournament History
```js
const history = await funtico.sdk.GetTournamentsHistory(1, 10);

// Meta.From/To are null on an empty page, so a player with no history hits this branch.
if (history.Meta?.From == null) console.log('No tournament history yet.');

history.Entries.forEach(e =>
  console.log(`${e.TournamentName} — place #${e.LeaderboardPlace}, best ${e.BestScore}`)
);
```

---

## 6. Hall of Fame

The Hall of Fame is a persistent leaderboard that ranks players by their best single result. It is available as an all-time (`Global`) or current-month (`Monthly`) standing, and can optionally be limited to one game mode.

### Fetching Rankings

```js
import { HallOfFamePeriodMode, HallOfFameGameModeFilter } from './sdk/funtico-sdk.mjs';

// All-time top 10, across every game mode
const global = await funtico.sdk.GetHallOfFame(HallOfFamePeriodMode.Global);

// Current month, Rooms only, second page
const monthly = await funtico.sdk.GetHallOfFame(
  HallOfFamePeriodMode.Monthly,
  2,  // page
  10, // limit
  HallOfFameGameModeFilter.Rooms
);

monthly.leaderboard.forEach(p => console.log(`#${p.rank} ${p.displayName} - ${p.totalPoints}`));

// The requesting player's own standing, even if they are not on this page.
// Null until they have at least one ranked result.
if (monthly.currentPlayer) {
  console.log(`Your rank: #${monthly.currentPlayer.rank} of ${monthly.totalPlayers}`);
}
```

> **Note:** Hall of Fame responses use **camelCase** field names (`displayName`, `totalPoints`). The Rooms and Tournaments endpoints use PascalCase.

### Prize Distribution

```js
import { PrizeType } from './sdk/funtico-sdk.mjs';

const distribution = await funtico.sdk.GetHallOfFameDistribution();

distribution.items.forEach(item => {
  // Places 1-10 have `place` only; grouped tiers also have `endPlace` and `range` ("11-20")
  const label = item.range ?? `#${item.place}`;

  item.prizes.forEach(prize => {
    if (prize.type === PrizeType.Item) {
      console.log(`${label}: ${prize.Amount}x ${prize.Item?.name}`);
    } else if (prize.type === PrizeType.GppPerPlayer) {
      console.log(`${label}: ${prize.Value} TICO`);
    }
  });
});
```

> **Note:** Distribution prizes use the shared **`Prize`** union, the same one that `GetPrizePoolDistribution` returns. Check the lowercase `type` field to tell prize kinds apart. The value fields are PascalCase (`Value`, `Amount`, `ItemId`, `PrizeId`, `Currency`), and the nested `Item` is lowercase (`id`/`image`/`name`). Item artwork is a plain URL at `prize.Item.image`. Load it like any other image (for example `img.src = prize.Item.image`) or with your engine's texture loader.

---

## 7. Campaign Mode

Campaign Mode is a fixed series of authored levels that the player completes in order. You start an attempt, play, and report your metrics. The server then grades the run into stars, grants rewards, and unlocks the next level.

> **Note:** Campaign responses use **PascalCase**, like most of the SDK (the Hall of Fame is the camelCase exception). Stars are computed **on the server** from the level's star rules. Display them; never compute them yourself. See [USAGE.md](./USAGE.md#campaign-methods) for the full reference.

### Step 1 — Check Availability
```js
// "No campaign" is returned as data, not as an error. Show or hide the menu button based on the flag.
const campaignButton = document.querySelector('#campaign-button');
campaignButton.hidden = !(await funtico.sdk.IsCampaignAvailable());
```

### Step 2 — Fetch Levels and Render the Level Select
```js
import { CampaignLevelStatus } from './sdk/funtico-sdk.mjs';

const campaign = await funtico.sdk.GetCampaignLevels();

// Campaign-wide progress: stars earned out of the total available
document.querySelector('#campaign-progress').textContent =
  `${campaign.TotalStarsEarned} / ${campaign.MaxStars} ★`;

for (const level of campaign.Levels) {
  if (level.Status === CampaignLevelStatus.Locked) {
    // Locked levels arrive without config or star rules. Show a lock icon and move on.
    addLockedCard(level.Order, level.Name);
  } else {
    // Unlocked/Completed: show the best-star row (0-3) and make the card clickable
    addLevelCard(level.Order, level.Name, level.BestStars, () => play(level));
  }
}
```

### Step 3 — Parse the Level Config with Your Own Type
```js
// The schema belongs to your game. The platform stores the string without changing it.
// The JSDoc type is optional; it gives editor autocompletion under // @ts-check.
/** @type {{ enemyWaves: number, timeLimitSeconds: number, tilemapKey: string }} */
const config = funtico.sdk.GetCampaignLevelConfig(level);
// Throws a clear Error if the level is still locked or the JSON is malformed
```

### Step 4 — Start the Attempt and Play
```js
const attempt = await funtico.sdk.StartCampaignLevel(level.Id);

// Optional: record gameplay events. They are included in the completion payload.
funtico.sdk.RecordEvent_Client('wave_1_cleared');

// Starting again simply replaces the tracked attempt. If the player quits without finishing:
// funtico.sdk.AbandonCampaignAttempt(); // local only, no server call
```

### Step 5 — Complete the Run and Show the Outcome
```js
// Metrics: a flat map of 1-32 entries, each a finite number or a boolean.
// Fractional numbers are ALLOWED (metrics are doubles), unlike EndRoomSP's int score.
const result = await funtico.sdk.CompleteCampaignLevel({
  time: 47.35,          // the fraction is kept as-is
  coins: 120,
  no_damage: true       // booleans are sent as 1/0
});

if (result.IsWin) {
  showStars(result.Stars);                       // graded on the server
  showRewards(result.Rewards, result.RewardsGranted);
  if (result.UnlockedLevelId) showUnlockBanner();
} else {
  showDefeat();    // losing is a normal 200 response (IsWin false, Stars 0), not an error
}
```

A failure rejects with a `CampaignError` whose `Code` is machine-readable. Check the `Code` to decide what to do:

```js
import { CampaignError, CampaignErrorCode } from './sdk/funtico-sdk.mjs';

try {
  await funtico.sdk.StartCampaignLevel(level.Id);
} catch (error) {
  if (error instanceof CampaignError && error.Code === CampaignErrorCode.LevelLocked) {
    showToast('Finish the previous level first!');
  } else {
    throw error;
  }
}
```

### Step 6 — Listen for Progress Updates
```js
import { FunticoClient } from './sdk/funtico-sdk.mjs';

// The FunticoClient wrappers emit CAMPAIGN_PROGRESS_UPDATED with the data they fetched or received:
// refreshCampaign -> CampaignLevelsViewModel, completeCampaignLevel -> CampaignCompletionResult.
// Both include TotalLevels/CompletedLevels/TotalStarsEarned/MaxStars.
funtico.on(FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, (progress) => {
  document.querySelector('#campaign-progress').textContent =
    `${progress.TotalStarsEarned} / ${progress.MaxStars} ★`;
});

await funtico.refreshCampaign();                       // fetch + broadcast
const result = await funtico.completeCampaignLevel({   // submit + broadcast
  time: 47.35,
  coins: 120
});
```

> A successful completion clears the SDK's cached level list automatically. Call `GetCampaignLevels` (or `refreshCampaign`) afterwards to show the newly unlocked levels.

---

## 8. Session Reconnection & Progress Saving

If a player loses connection or reloads the page during a match, you can save their state so they can reconnect and continue the match.

### Checking for Unfinished Matches
```js
import { GameTypeEnum } from './sdk/funtico-sdk.mjs';

const unfinished = await funtico.sdk.UserHasUnfinishedSession_Client();

// The list can also hold session kinds that ReconnectToUnfinishedSession_Client cannot resume
// (for example multiplayer sessions), so pick the kind your game created
const session = unfinished.SavedSessions.find((s) => s.GameType === GameTypeEnum.Rooms);
if (session) {
  console.log(`Unfinished match found! Reconnection time remaining: ${session.ReconnectTime} seconds.`);
}
```

### Creating and Updating Checkpoints
```js
import { GameTypeEnum } from './sdk/funtico-sdk.mjs';

// 1. Create a session checkpoint right after joining a room
const sessionState = { hp: 100, score: 0, level: 1 };
await funtico.sdk.CreateSession_Client(
  JSON.stringify(sessionState),
  GameTypeEnum.Rooms,
  roomData.EventId,
  roomData.SessionOrMatchId
);

// 2. Update the progress periodically during gameplay
const updatedState = { hp: 80, score: 1500, level: 2 };
await funtico.sdk.UpdateSession_Client(JSON.stringify(updatedState));

// 3. Record individual gameplay events (automatically attached to the final score request)
funtico.sdk.RecordEvent_Client('player_unlocked_chest');
```

### Restoring Game State
```js
const session = unfinished.SavedSessions.find((s) => s.GameType === GameTypeEnum.Rooms);
// ReconnectToUnfinishedSession_Client handles decryption automatically
const decryptedStateJson = await funtico.sdk.ReconnectToUnfinishedSession_Client(session.Id);
const savedState = JSON.parse(decryptedStateJson);

console.log(`Session restored! Score: ${savedState.score}, HP: ${savedState.hp}`);
// Resume your game loop...
```

> The session checkpoint methods need the cached user profile to encrypt the checkpoint. Make sure the profile is loaded before you call them. `init()` with a `userToken` preloads it; otherwise call `await funtico.refreshUserData()` first.

---

## 9. Complete Browser Example

This example is a minimal single-page game in plain JavaScript with no engine. It follows the same flows as the Phaser scenes example: on boot it checks for an unfinished match and reconnects, then it lists rooms and joins one. During the placeholder gameplay it autosaves the checkpoint every 10 seconds. It then submits the score and shows the room leaderboard. Replace the gameplay placeholder with your real game loop (canvas, PixiJS, Three.js, ...).

Serve the folder over HTTPS, or over plain HTTP from `localhost` only, with `funtico-sdk.mjs` next to `game.js`. ES modules do not load from `file://`, and on a plain `http://` page from any other host the browser hides `crypto.subtle`, so every encrypting call fails (see [Runtime requirements](#1-installation--setup)). To test on a phone, use an HTTPS tunnel or a dev server with a certificate, not a LAN `http://` address: there `JoinRoom` would already have charged the entry fee when `CreateSession_Client` fails.

### index.html
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Funtico JS SDK Demo</title>
</head>
<body>
  <p id="status">Loading...</p>

  <section id="menu" hidden>
    <h2>Rooms</h2>
    <ul id="room-list"></ul>
  </section>

  <section id="game" hidden>
    <h2>Score: <span id="score">0</span></h2>
    <!-- Gameplay placeholder: replace with your canvas / engine -->
    <button id="score-button">+100 points</button>
    <button id="finish-button">Finish run</button>
  </section>

  <section id="results" hidden>
    <h2>Results</h2>
    <p id="results-state"></p>
    <ol id="leaderboard"></ol>
    <button id="back-button">Back to rooms</button>
  </section>

  <script type="module" src="game.js"></script>
</body>
</html>
```

### game.js
```js
import { FunticoClient, FunticoEnvironment, GameTypeEnum } from './funtico-sdk.mjs';

const funtico = new FunticoClient();
const sdk = funtico.sdk;

const AUTOSAVE_INTERVAL_MS = 10000;

const state = {
  score: 0,
  session: null,        // { EventId, SessionOrMatchId } of the active run
  autosaveTimer: null
};

const $ = (selector) => document.querySelector(selector);

function show(sectionId) {
  for (const id of ['menu', 'game', 'results']) {
    $(`#${id}`).hidden = id !== sectionId;
  }
}

function setStatus(text) {
  $('#status').textContent = text;
}

function renderScore() {
  $('#score').textContent = String(state.score);
}

/* ---------- Boot: initialization and reconnect scan ---------- */

async function boot() {
  const platformToken = new URLSearchParams(window.location.search).get('token') || 'test_token';

  try {
    await funtico.init({
      env: FunticoEnvironment.STAGING,
      publicGameKey: 'your-public-key',
      privateGameKey: 'your-private-key',
      userToken: platformToken,
      apiBaseUrl: 'https://funtico-sdk-staging.azurewebsites.net'
    });
  } catch (error) {
    // Invalid config or failed authentication: FunticoClient.init() rejects instead of hiding it
    setStatus(`Could not start: ${error.message}`);
    return;
  }

  // The session checkpoints need the cached profile (init preloads it, but a preload failure is silent)
  if (!sdk.GetCachedUserData()) {
    await funtico.refreshUserData();
  }

  // Check for an unfinished room run. The list can also contain other session kinds
  // (for example multiplayer sessions or tournament checkpoints) that this flow
  // cannot resume, so pick a Rooms entry only.
  const reconnectData = await sdk.UserHasUnfinishedSession_Client();
  const saved = reconnectData.SavedSessions.find((s) => s.GameType === GameTypeEnum.Rooms);
  if (saved) {
    try {
      await resumeGame(saved);
      return;
    } catch (error) {
      // The entry stays listed for a while, so do not let a failed resume block the menu
      console.warn('Could not resume the saved run, showing the menu:', error);
    }
  }
  await showMenu();
}

/* ---------- Menu: room list + join ---------- */

async function showMenu() {
  setStatus('Pick a room');
  show('menu');

  const list = $('#room-list');
  list.replaceChildren();

  const rooms = await sdk.GetRooms();
  for (const room of rooms) {
    const button = document.createElement('button');
    // textContent, never innerHTML: room names come from the server
    button.textContent = room.IsFree ? `${room.Name} (free)` : `${room.Name} (fee ${room.EntryFee})`;
    button.addEventListener('click', () => {
      // JoinRoom rejects on e.g. insufficient balance or a full room; CreateSession_Client can fail too
      startGame(room).catch((error) => setStatus(`Could not join: ${error.message}`));
    });

    const item = document.createElement('li');
    item.append(button);
    list.append(item);
  }
}

/* ---------- Gameplay, autosaving and score submission ---------- */

async function startGame(room) {
  // Load your level BEFORE JoinRoom: the run (and its server-side timers) is live once it resolves
  state.score = 0;
  renderScore();

  state.session = await sdk.JoinRoom(room.Guid);

  // Create a reconnection checkpoint
  await sdk.CreateSession_Client(
    JSON.stringify({ score: state.score }),
    GameTypeEnum.Rooms,
    state.session.EventId,
    state.session.SessionOrMatchId
  );
  sdk.RecordEvent_Client('start_game');

  enterGameplay();
}

async function resumeGame(savedSession) {
  const savedStateJson = await sdk.ReconnectToUnfinishedSession_Client(savedSession.Id);
  const savedState = JSON.parse(savedStateJson);

  state.score = savedState.score;
  state.session = { EventId: savedSession.SessionId, SessionOrMatchId: savedSession.SaveSessionId };
  renderScore();

  enterGameplay();
}

function enterGameplay() {
  setStatus('Playing');
  show('game');

  // Autosave the session state every 10 seconds
  clearInterval(state.autosaveTimer);
  state.autosaveTimer = setInterval(autoSaveProgress, AUTOSAVE_INTERVAL_MS);
}

async function autoSaveProgress() {
  try {
    await sdk.UpdateSession_Client(JSON.stringify({ score: state.score }));
    sdk.RecordEvent_Client(`score_at_time_${state.score}`);
  } catch (error) {
    console.warn('Autosave failed, will retry on the next tick:', error);
  }
}

async function gameOver() {
  clearInterval(state.autosaveTimer);
  state.autosaveTimer = null;

  const user = sdk.GetCachedUserData() ?? await funtico.refreshUserData();

  // Ends the room session with an encrypted, signed score submission
  setStatus('Submitting score...');
  await sdk.EndRoomSP(
    state.session.EventId,
    state.session.SessionOrMatchId,
    state.score,
    user.UserId,
    '127.0.0.1'
  );

  await showResults(user);
}

/* ---------- Leaderboard ---------- */

async function showResults(user) {
  setStatus('Results');
  show('results');

  let board = await sdk.GetLeaderboard(state.session.EventId, state.session.SessionOrMatchId);

  // Results can still be calculating right after the score submission: poll a few times
  for (let attempt = 0; board.IsPending && attempt < 5; attempt++) {
    $('#results-state').textContent = 'Calculating results...';
    await new Promise((resolve) => setTimeout(resolve, 3000));
    board = await sdk.GetLeaderboard(state.session.EventId, state.session.SessionOrMatchId);
  }

  $('#results-state').textContent = board.IsPending
    ? 'Results are still being calculated - check back later.'
    : `Your place: ${board.UserPlace} - earned ${board.YourTicoEarnings} TICO`;

  const list = $('#leaderboard');
  list.replaceChildren();
  for (const row of board.LeaderboardItems) {
    const item = document.createElement('li');
    item.textContent = `${row.PlayerName} - ${row.Score}`;
    // LeaderboardItems[].UserId is the platform id
    if (row.UserId === user.PlatformId) item.style.fontWeight = 'bold';
    list.append(item);
  }
}

/* ---------- Wiring ---------- */

$('#score-button').addEventListener('click', () => {
  state.score += 100;
  sdk.RecordEvent_Client('score_updated');
  renderScore();
});
$('#finish-button').addEventListener('click', () => {
  gameOver().catch((error) => setStatus(`Score submission failed: ${error.message}`));
});
$('#back-button').addEventListener('click', () => {
  showMenu().catch((error) => setStatus(`Could not load rooms: ${error.message}`));
});

boot().catch((error) => setStatus(`Unexpected error: ${error.message}`));
```

---

## 10. Troubleshooting

### `Invalid FunticoConfig: ...`
`Initialize` (and so `FunticoClient.init()`) rejected the keys before sending any request. The message names the rule that failed; see [Config validation](#config-validation-fail-fast). Common causes:
- A key read from a `.env` file still has a trailing newline or `\r`. Trim it where you load it.
- Both keys were pasted into `privateGameKey`. The message says the keys look concatenated. Pass only the secret key from the Developer Portal in `privateGameKey`, and the public key alone in `publicGameKey`.

The message includes key lengths but never the key values, so you can safely share it in a bug report.

### HTTP 500 "Padding is invalid and cannot be removed" on `/Rooms/end-room-sp`
This means the **`privateGameKey` is wrong**: the server could not decrypt the score payload. A wrong private key is not detected at `init()` or at login. In a game that does not use session checkpoints, the first sign is this 500 on the first score submission, after a whole match has been played. A game that calls `CreateSession_Client` usually sees a wrong key earlier, as `Failed to create client session` (see below), but not always: successful checkpoint calls do not prove that the key is right, and concatenated keys (public key + secret key) in particular can pass them and fail only here.

The typical cause is `privateGameKey` set to the public key and the secret key concatenated. The config validation catches that case (and a private key equal to the public key) at `init()`, with an `Invalid FunticoConfig` error. If you still get this 500 with a config that passes validation, the private key does not belong to this game or environment (for example a staging key used against PROD). Copy the secret key for the right game and environment from the Developer Portal again.

### `Failed to create client session`
`CreateSession_Client` got a non-2xx response from `/Session/create-session`. The SDK discards the response body, so open the browser's Network tab and read the server's answer:
- HTTP 400 `Error with decrypt`: the server could not decrypt the checkpoint. This usually means the `privateGameKey` belongs to another game or environment (for example a staging key used against PROD). Copy the secret key again from the Developer Portal. `UpdateSession_Client` uses the same key and fails the same way (`Failed to update client session progress`).
- HTTP 400 `Wrong Hash`: the payload was altered or not built by the SDK.
- HTTP 401: the game JWT was missing or expired.

In the flow of [section 9](#9-complete-browser-example) this call comes right after `JoinRoom`, so the entry fee has already been charged when it fails.

### `SDK is not authenticated. Call Initialize() or Authentication() first.`
An authenticated method ran before a game JWT was available. Check that:
- `await funtico.init(...)` finished **before** the call, and that its rejection is handled. `FunticoClient.init()` rejects on an invalid config or a failed authentication; with the Phaser plugin the same failure was only logged. If `Initialize` never succeeded (it was not called, or its rejection was caught and ignored), calls that need no JWT fail differently: `Authentication` / `login()`, `GetRoomPublic` and `GetCampaignAvailability` throw `TypeError: Cannot read properties of undefined (reading 'publicGameKey')`. Look for an earlier `Invalid FunticoConfig` error.
- A `userToken` was passed to `init()`, or `await funtico.login(platformToken)` was called afterwards.

### `User data is not loaded. Cannot derive session encryption key.`
`CreateSession_Client`, `UpdateSession_Client` and `ReconnectToUnfinishedSession_Client` need the cached user profile to encrypt and decrypt the checkpoint. The profile preload in `init()` ignores failures, and it only runs when a `userToken` is given. Call `await funtico.refreshUserData()` (or `sdk.GetUserData(false)`) before the first session call.

### `ReferenceError` when destructuring the script global
`const { FunticoSDK } = FunticoSDK;` in a classic `<script>` shadows the global namespace with itself. Rename the binding (`const { FunticoSDK: Sdk } = window.FunticoSDK;`) or use `FunticoSDK.FunticoSDK.Instance`. See [Installation & Setup](#1-installation--setup).

### Module script fails to load (`Failed to load module script` / MIME type error)
Browsers only run `<script type="module">` files that are served over HTTP(S) with a JavaScript MIME type. Serve the page from a web server instead of `file://`, and configure the server to send `.mjs` as `text/javascript`. You can also bundle the SDK with your game, or use the classic `funtico-sdk.js` build.

### Web Crypto unavailable in a browser or a test DOM
Symptom: `TypeError: Cannot read properties of undefined (reading 'importKey')` (or `(reading 'subtle')`) from `CreateSession_Client`, `UpdateSession_Client`, `ReconnectToUnfinishedSession_Client`, `EndRoomSP`, `ResultTournament_Client`, `CompleteCampaignLevel` or the server-key calls, while initialization and login work.
- **In a browser:** the page is not a secure context, so the browser hides `crypto.subtle`. Serve it over HTTPS, or over HTTP from `localhost` / `127.0.0.1` only; a plain `http://` LAN address such as `http://192.168.x.x` does not work. `window.isSecureContext` must be `true`.
- **In tests that define `window`** (jsdom, Jest or Vitest DOM environments): the SDK uses `window.crypto` in preference to `globalThis.crypto`, so the test environment must provide `window.crypto.subtle`, for example by assigning Node's `globalThis.crypto` (the `webcrypto` object from `node:crypto`) to `window.crypto` in the test setup.

### `fetch is not defined` / `crypto.subtle` is undefined in Node
The SDK needs Node.js 20 or newer, where `fetch`, `globalThis.crypto`, `atob`/`btoa` and `TextEncoder` are globals. Upgrade Node rather than adding polyfills.

---

## 11. Regenerating the SDK (Maintainers)

The files in `dist/` are **generated**. Do not edit them by hand, because the next build overwrites your changes and `npm run verify` reports the files as stale. Each file starts with a banner that names its sources and their SHA-256 prefixes (the first 12 hex characters). The hash is taken over each source **after its line endings are normalised to LF**, not over the bytes on disk, so it does not depend on git's `core.autocrlf`. On a CRLF checkout a plain `sha256sum FunticoPhaserSDK.ts` will therefore not match the banner even though the dist is up to date. To reproduce the prefix, strip the CRs first: `tr -d '\r' < upstream/phaser/FunticoPhaserSDK.ts | sha256sum | cut -c1-12`. The reliable staleness check is `npm run verify`.

- SDK logic (methods, models, enums, crypto, validation) comes from the Phaser SDK ([pillarex/funtico-sdk-phaser](https://github.com/pillarex/funtico-sdk-phaser)), which is the **single source of truth**. It is checked out here as a git submodule at `upstream/phaser/`, pinned to the exact commit `dist/` is generated from, so every JS SDK commit records which Phaser SDK version it contains. Never change SDK logic in this repo: make the change in the Phaser SDK repo, then bring it here (below).
- `FunticoClient` lives in `src/FunticoClient.ts` and is compiled together with the core. Its `EVENTS` must match `FunticoPhaserPlugin.EVENTS`, and the tests enforce this.

First-time setup (the submodule is needed only for building and testing, not for using `dist/`):

```bash
git clone --recursive https://github.com/pillarex/FunticoJSSDK.git
```

```bash
npm ci
```

If you cloned without `--recursive`, run `git submodule update --init` before building.

Everyday commands:

```bash
npm run build      # regenerate dist/ from upstream/phaser/FunticoPhaserSDK.ts + src/FunticoClient.ts
npm test           # load, equivalence, crypto, validation, FunticoClient, types, build tests
npm run verify     # rebuild in memory and fail if dist/ is stale (CI runs this on every push)
```

Picking up a new Phaser SDK version (after the change is pushed to funtico-sdk-phaser):

```bash
git -C upstream/phaser fetch origin
git -C upstream/phaser checkout <commit-or-tag>
npm run build
npm test
git add upstream/phaser dist
git commit -m "Regenerate from funtico-sdk-phaser@<short-sha>"
```

To try unpushed Phaser SDK edits locally, point the build at another checkout with `--source` (below), but only commit a `dist/` generated from the submodule, so the recorded commit and the generated code always match.

How the generator (`build/build.mjs`) works:
1. It reads `FunticoPhaserSDK.ts` and removes, using the syntax tree rather than text matching, the `import Phaser from 'phaser'` line and the `FunticoPhaserPlugin` class. Each must be found exactly once. If the upstream layout changes, the build fails on purpose so that a human looks at it.
2. It appends `src/FunticoClient.ts`, type-checks the combined program (any diagnostic fails the build), and emits `funtico-sdk.mjs`, the script/CommonJS `funtico-sdk.js` (whose returned namespace is derived from the actual exports), and the `.d.ts` / `.d.mts` declarations.
3. The output depends only on its inputs (no timestamps or git hashes) and uses LF line endings, so rebuilding unchanged sources gives byte-identical files.

Options: `--source <path>` (or the `FUNTICO_PHASER_SDK_TS` environment variable) selects a different `FunticoPhaserSDK.ts`, `--out <dir>` sets the output directory, and `--check` compares without writing (this is what `npm run verify` runs).

> **Why TypeScript is pinned to exactly `6.0.3`:** `typescript@latest` is 7.x, the native Go port, which ships **no JavaScript compiler API**. The generator depends on that API (AST transforms, in-memory type-checking and emit). 6.0.3 is the last JavaScript-based release. Do not bump it to 7.x.

Commit the regenerated `dist/` together with the submodule pointer that produced it. CI (`.github/workflows/ci.yml`) checks out the submodule and runs `npm run verify` and `npm test` on Node 20 and 24, on Linux and Windows, so a stale or hand-edited `dist/` cannot slip through.
