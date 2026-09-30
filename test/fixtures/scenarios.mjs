// Scripted scenarios for the differential test (T2). Each one is run, unchanged, against the
// oracle (original TS), the ESM dist and the UMD dist; their request logs and traces must match.
//
// Every public member of every exported SDK class must be called (through ctx.sdk / ctx.SDK /
// ctx.cls) by at least one scenario - the coverage guard in t2 enforces that from the source AST.
// The ctx.check() spot checks prove the interesting paths really executed (a differential test
// alone would also pass if every implementation bailed out early in the same way).
import { json, text, networkError } from '../helpers/harness.mjs';
import { serverEncrypt } from '../helpers/crypto-oracle.mjs';
import {
  PUB, PRIV, API, PLATFORM_TOKEN, JWT, USER_ID, PLATFORM_ID, RIVAL_ID, config,
  BALANCE, ROOM_A, ROOM_B, ROOM_C, ROOM_D, VOUCHERS, VOUCHERS_SPENT, LEADERS, TOURNAMENT_ID, TOURNAMENT_LEADERBOARD, TOURNAMENT_HISTORY,
  CAMPAIGN_LEVELS, SAVED_STATE, SAVED_SESSION, gameSession,
} from './wire.mjs';

const tokenConfig = (mod, extra) => config(mod, { userToken: PLATFORM_TOKEN, ...extra });
const lastRequest = ctx => ctx.requests[ctx.requests.length - 1];
const lastBody = ctx => JSON.parse(lastRequest(ctx).body);

export const SCENARIOS = [
  // -------------------------------------------------------------------------------------------
  {
    name: 'Initialize with a token: auth, profile preload, accessors, cache hits, re-auth',
    async run(ctx) {
      const { mod } = ctx;
      ctx.record('Instance is a singleton', ctx.SDK.Instance === ctx.SDK.Instance);
      await ctx.call('CanAffordFromCache', mod.EntryFeeType.IC, 1); // no balance yet -> false
      await ctx.call('GetCachedUserData');
      await ctx.call('GetCachedBalance');
      await ctx.call('GetCachedVouchers');

      await ctx.call('Initialize', tokenConfig(mod));
      ctx.expectRequests(4, 'auth + 3 preloads');
      ctx.check(ctx.requests[0].url === `${API}/Auth/funtico-auth`, 'auth goes first');

      await ctx.call('getPlatformToken');
      ctx.check((await ctx.call('getUserToken')) === JWT, 'JWT stored');
      const user = await ctx.call('GetCachedUserData');
      ctx.check(user && user.UserId === USER_ID, 'user data preloaded');
      await ctx.call('GetCachedBalance');
      const vouchers = await ctx.call('GetCachedVouchers');
      ctx.check(vouchers && vouchers.length === 2 && vouchers[0].PlaysRequiredToActivate === 3, 'vouchers mapped');

      await ctx.call('GetUserData');
      await ctx.call('GetBalance');
      await ctx.call('GetVouchers');
      ctx.expectRequests(4, 'cached getters make no request');

      await ctx.call('Authentication', 'wrong-token');
      ctx.check(/Invalid platform token/.test(ctx.lastError()?.message), 'auth failure surfaces the body');
      await ctx.call('getUserToken');
      await ctx.call('Authentication', PLATFORM_TOKEN);
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Initialize without a token and default hosts per environment',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', { env: mod.FunticoEnvironment.STAGING, publicGameKey: PUB, privateGameKey: PRIV });
      ctx.expectRequests(0, 'no token -> no request');
      await ctx.call('getUserToken');
      await ctx.call('getPlatformToken');
      await ctx.call('GetUserData', false);
      ctx.check(/not authenticated/.test(ctx.lastError()?.message), 'unauthenticated call rejected');
      await ctx.call('GetCampaignAvailability', false); // anonymous, allowed
      await ctx.call('Authentication', PLATFORM_TOKEN);
      await ctx.call('GetBalance', false);
      ctx.check(ctx.requests.every(r => r.url.startsWith('https://funtico-sdk-staging.azurewebsites.net/')), 'staging host');

      ctx.resetSingleton();
      await ctx.call('Initialize', { env: mod.FunticoEnvironment.PROD, publicGameKey: PUB, privateGameKey: PRIV, userToken: PLATFORM_TOKEN });
      await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0001');
      ctx.check(ctx.requests.some(r => r.url.startsWith('https://funtico-sdk.azurewebsites.net/Auth/')), 'prod game host');
      ctx.check(ctx.requests.some(r => r.url.startsWith('https://api.funtico.com/api/v1/web/users')), 'prod platform host');

      ctx.resetSingleton();
      await ctx.call('Initialize', { env: mod.FunticoEnvironment.STAGING, publicGameKey: PUB, privateGameKey: PRIV, userToken: PLATFORM_TOKEN, apiBaseUrl: API });
      await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0001');
      ctx.check(ctx.requests.some(r => r.url.startsWith('https://staging.api.funtico.com/api/v1/web/users')), 'staging platform host');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Cache TTL and affordability for every entry fee type',
    routes: {
      'GET /User/get-balance': (req, state) => {
        state.balanceCalls = (state.balanceCalls || 0) + 1;
        return json({ ...BALANCE, Coins: 1000 + 500 * state.balanceCalls });
      },
    },
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod, { cacheTTL: 1000 }));
      await ctx.call('GetUserData');
      ctx.advance(999);
      await ctx.call('GetUserData');
      ctx.expectRequests(4, 'still cached at TTL-1ms');
      ctx.advance(1);
      await ctx.call('GetUserData');
      ctx.expectRequests(5, 'refetched at TTL');
      await ctx.call('GetBalance', true); // shared expiry was just renewed -> cached
      await ctx.call('GetBalance', false);
      await ctx.call('GetVouchers', true);
      await ctx.call('GetVouchers', false);

      const cases = [
        ['IC', 2500], ['IC', 2501], ['Tico', 300], ['Tico', 301], ['SemifinalsTickets', 2],
        ['SemifinalsTickets', 3], ['FinalTickets', 1], ['FinalTickets', 2], ['PrivateTickets', 0],
        ['PrivateTickets', 1], ['Free', 1e9], ['InventoryItem', 1],
      ];
      for (const [name, amount] of cases) {
        await ctx.call('CanAffordFromCache', mod.EntryFeeType[name], amount);
        await ctx.call('CanAfford', mod.EntryFeeType[name], amount);
      }
      await ctx.call('CanAfford', 99, 0);
      await ctx.call('CanAffordFromCache', 99, 0);
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Rooms: tiers, list mapping, vouchers, pre-paid, single/public room, prize pools, tier lookup, history',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));

      ctx.check((await ctx.call('GetTierByEventId', ROOM_B.id)) === mod.RoomTier.Champion, 'tier via implicit GetRooms');
      const n = ctx.requests.length;
      await ctx.call('GetTierByEventId', 'room-unknown');
      ctx.expectRequests(n, 'tier lookup served from last rooms list');

      await ctx.call('GetTiers');
      const rooms = await ctx.call('GetRooms');
      ctx.check(rooms.length === 3, 'three rooms');
      ctx.check(rooms[0].UserCanJoinWithVoucher === true && rooms[0].Voucher.ItemId === 9001, 'voucher match');
      ctx.check(rooms[0].TotalPrize === 1000 && rooms[0].RoomSize === 5 && rooms[0].HasPassword === false, 'room A mapping');
      ctx.check(rooms[1].IsPrePaid === true && rooms[1].IsFree === true && rooms[1].EntryFeeUSDT === 8, 'room B pre-paid external free');
      ctx.check(!('RoomSize' in rooms[1]) && !('Description' in rooms[1]) && !('HasPassword' in rooms[1]), 'null optionals omitted');
      ctx.check(rooms[2].Tier === mod.RoomTier.Contender && rooms[2].Voucher === undefined && rooms[2].IsFree === false, 'null tier room');

      await ctx.call('GetRooms', 1, 5);
      await ctx.call('GetTierByEventId', ROOM_A.id); // last list is now [C] -> null
      await ctx.call('GetTierByEventId', ROOM_C.id); // null tier -> null
      const before = ctx.requests.length;
      await ctx.call('GetRooms', 2);
      ctx.expectRequests(before + 2, 'empty list skips pre-paid');
      await ctx.call('GetRooms', 3); // envelope without Data

      ctx.resetSingleton();
      await ctx.call('Initialize', tokenConfig(mod));
      await ctx.call('GetTierByEventId', ROOM_C.id, 1);
      ctx.check(ctx.requests.some(r => r.url.includes('roomType=1&limit=10')), 'cache miss uses given roomType');

      await ctx.call('GetRoom', ROOM_A.id);
      await ctx.call('GetRoom', 'room-missing');
      await ctx.call('GetRoomPublic', ROOM_B.id);
      const pub = await ctx.call('GetRoomPublic', ROOM_A.id);
      ctx.check(pub.UserCanJoinWithVoucher === false && pub.Voucher === undefined, 'public room has no vouchers');
      await ctx.call('GetRoomPublic', 'room-missing');

      const poolA = await ctx.call('GetPrizePoolDistribution', ROOM_A.id);
      ctx.check(poolA.TicoSharedViaPlaces === 1000 && poolA.PrizePlaces[1].RewardFeeRatio === 1 && poolA.PrizePlaces[2].PlatformExp === 0, 'pool A');
      const poolB = await ctx.call('GetPrizePoolDistribution', ROOM_B.id);
      ctx.check(poolB.TicoSharedViaPlaces === 1415 && poolB.TotalPlayers === 1 && poolB.PrizePlaces[1].Place === 0, 'pool B');
      const poolC = await ctx.call('GetPrizePoolDistribution', ROOM_C.id);
      ctx.check(poolC.PrizePlaces.length === 0 && poolC.TicoPerPlayer === 625, 'pool C');
      await ctx.call('GetPrizePoolDistribution', 'room-missing');

      await ctx.call('GetRoomSettings', ROOM_A.id);
      await ctx.call('GetPrePaid');
      await ctx.call('GetHistory', 1);
      await ctx.call('GetHistory', 2, 'status=finished&type=rooms', 5, 'cursor/0001==');
      await ctx.call('GetRoomHistoryDetails', 'sess-0001');
      await ctx.call('GetRoomHistoryDetails', 'sess-0001', false);

      // Edge room + spent voucher: null ticket -> EntryFee 0 and free, count 0 -> no voucher entry,
      // pool share without Percentage adds nothing (not NaN), null platform-fee value -> 0.
      ctx.route('GET /User/vouchers', json(VOUCHERS_SPENT));
      const edge = await ctx.call('GetRoom', ROOM_D.id); // GetRoom always refetches vouchers
      ctx.check(edge.EntryFee === 0 && edge.IsFree === true, 'null ticket -> free, fee 0');
      ctx.check(edge.Voucher && edge.Voucher.Count === 0 && edge.UserCanJoinWithVoucher === false, 'spent voucher cannot be used');
      const edgeList = await ctx.call('GetRooms', 4);
      ctx.check(edgeList.length === 1 && edgeList[0].UserCanJoinWithVoucher === false, 'spent voucher in the list');
      const poolD = await ctx.call('GetPrizePoolDistribution', ROOM_D.id);
      ctx.check(poolD.PlatformFeePercentage === 0, 'null platform fee -> 0');
      ctx.check(poolD.TicoSharedViaPlaces === 0 && poolD.PrizePlaces[0].RewardFeeRatio === 0, 'pool share without Percentage adds nothing (no NaN)');
      ctx.route('GET /User/vouchers', json(VOUCHERS));
      await ctx.call('GetVouchers', false); // restore the voucher cache for the rest of the scenario

      ctx.route('GET /Rooms/tiers', text('boom', 500));
      await ctx.call('GetTiers');
      ctx.route('GET /Rooms/pre-paid', text('boom', 500));
      await ctx.call('GetRooms');
      await ctx.call('GetTierByEventId', ROOM_A.id); // list was cached before the pre-paid failure
      ctx.route('GET /Rooms/game-settings', text('boom', 500));
      await ctx.call('GetRoomSettings', ROOM_A.id);
      ctx.route('GET /Rooms/history', text('boom', 500));
      await ctx.call('GetHistory', 1);
      ctx.route('GET /Rooms/get-history', text('boom', 500));
      await ctx.call('GetRoomHistoryDetails', 'sess-0001');
      ctx.route('GET /Rooms/get-rooms', text('boom', 500));
      await ctx.call('GetRooms');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'GetLeaderboard: four-way join, voucher fee substitution, platform-name degradation',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));

      // 1. Voucher-paid seat, you are 1st, names resolved.
      const lb = await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0001', 'match-0001');
      ctx.check(lb.LeaderboardItems.length === 3 && lb.LeaderboardItems[0].PlayerName === 'player_test', 'names joined');
      ctx.check(lb.LeaderboardItems[0].AvatarUrl && !('AvatarUrl' in lb.LeaderboardItems[1]), 'avatar only when present');
      ctx.check(lb.UserPlace === '1' && lb.YourTicoEarnings === 750 && lb.IsPending === true, 'your place/earnings');
      ctx.check(lb.IsFree === false && lb.Multiplier === 0, 'voucher (item) fee -> multiplier 0');
      ctx.check(ctx.requests.some(r => r.url.includes('matchId=match-0001')), 'matchId forwarded');

      // 2. Currency seat, you are 2nd, platform host unreachable, room returned.
      ctx.route('GET /Rooms/get-history', json({ game_session: gameSession({ voucher_used: false }) }));
      ctx.route('GET /Rooms/leaders', json({ ...LEADERS, state: 4, leaders: [
        { id: RIVAL_ID, score: 2000, place: 1, prizes: [], finish_reason: 0 },
        { id: PLATFORM_ID, score: 1500, place: 2, prizes: [], finish_reason: 0 },
      ] }));
      ctx.route('GET /api/v1/web/users', networkError());
      const lb2 = await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0001');
      ctx.check(lb2.UserPlace === '2' && lb2.YourTicoEarnings === 250 && lb2.Multiplier === 1, 'currency multiplier');
      ctx.check(lb2.ClosedUnsuccessfully === true && lb2.LeaderboardItems[0].PlayerName === '', 'degraded names');

      // 3. Null-tier room, spectator, users endpoint rejects the token.
      ctx.route('GET /Rooms/leaders', json({ state: 3, leaders: [{ id: 9999, score: 5, place: 1, prizes: [], finish_reason: 0 }], items: [], match_id: 'm-1' }));
      ctx.route('GET /api/v1/web/users', text('nope', 401));
      const lb3 = await ctx.call('GetLeaderboard', ROOM_C.id, 'sess-0003');
      ctx.check(lb3.RoomTier === mod.RoomTier.Challenger && lb3.UserPlace === '0' && lb3.YourTicoEarnings === 0, 'spectator');

      // 4. No leaders at all.
      ctx.route('GET /Rooms/leaders', json({ state: 1, leaders: null, items: [], match_id: null }));
      const lb4 = await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0004');
      ctx.check(lb4.LeaderboardItems.length === 0, 'null leaders -> empty board');

      // 5. Voucher seat, but vouchers cannot be loaded (preload failed, refetch fails) -> ticket fee.
      //    The user-data leg also refetches here because the shared cache window expired.
      ctx.route('GET /Rooms/leaders', json(LEADERS));
      ctx.route('GET /Rooms/get-history', json({ game_session: gameSession({ voucher_used: true }) }));
      ctx.route('GET /api/v1/web/users', json({ data: [] }));
      ctx.route('GET /User/vouchers', text('boom', 500));
      ctx.resetSingleton();
      await ctx.call('Initialize', tokenConfig(mod)); // voucher preload fails, allSettled swallows it
      await ctx.call('GetCachedVouchers');
      ctx.advance(31000);
      const n5 = ctx.requests.length;
      const lb5 = await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0005');
      ctx.check(lb5.Multiplier === 3 && lb5.IsFree === false, 'fallback to room ticket');
      ctx.check(ctx.requests.slice(n5).some(r => r.url.endsWith('/User/get-full-data')) &&
        ctx.requests.slice(n5).some(r => r.url.endsWith('/User/vouchers')), 'user data + voucher legs ran');

      // 6. Voucher seat in a tier the user has no voucher for (room B, free ticket).
      ctx.route('GET /User/vouchers', json({ Data: [] }));
      const lb6 = await ctx.call('GetLeaderboard', ROOM_B.id, 'sess-0006');
      ctx.check(lb6.IsFree === true && lb6.YourTicoEarnings === 1400, 'free room pool share');

      // 7. The leaders leg fails.
      ctx.route('GET /Rooms/leaders', text('boom', 500));
      await ctx.call('GetLeaderboard', ROOM_A.id, 'sess-0007');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'JoinRoom two-leg flow, idempotency keys, StartRoomSP, EndRoomSP and client events',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));

      const n0 = ctx.requests.length;
      const s1 = await ctx.call('JoinRoom', ROOM_A.id);
      ctx.check(s1.SessionOrMatchId === 'sess-from-quote-0001-abcd' && s1.EventId === ROOM_A.id, 'two-leg join');
      ctx.check(ctx.requests.length === n0 + 4, 'vouchers + get-room + join-room + start-room-sp');
      const join = ctx.requests[n0 + 2];
      ctx.check(JSON.parse(join.body).UseVoucher === true && join.url.includes('idempotencyKey=00000000-0000-4000-8000-000000000001'), 'voucher derived, uuid key');

      await ctx.call('JoinRoom', ROOM_A.id, false);
      ctx.check(JSON.parse(ctx.requests[ctx.requests.length - 2].body).UseVoucher === false, 'explicit useVoucher');
      const s3 = await ctx.call('JoinRoom', ROOM_B.id, true);
      ctx.check(s3.SessionOrMatchId === 'sess-existing-0002', 'existing session skips leg 2');
      await ctx.call('JoinRoom', ROOM_C.id);
      ctx.check(/neither an existing session nor a lobby quote/.test(ctx.lastError()?.message), 'blank session + no quote');
      await ctx.call('JoinRoom', 'room-full-0009', true);

      // Non-secure context: randomUUID throws / is absent -> getRandomValues fallback (v4 layout).
      ctx.setRandomUUID(() => { throw new Error('randomUUID needs a secure context'); });
      await ctx.call('JoinRoom', ROOM_A.id, true);
      ctx.setRandomUUID(undefined);
      await ctx.call('JoinRoom', ROOM_A.id, true);
      const keys = ctx.requests.filter(r => r.url.includes('/Rooms/join-room')).map(r => new URL(r.url).searchParams.get('idempotencyKey'));
      ctx.check(keys.slice(-2).every(k => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(k)), 'fallback keys are v4');
      ctx.check(keys[keys.length - 1] !== keys[keys.length - 2], 'fallback keys differ');

      await ctx.call('StartRoomSP', ROOM_A.id, 'sess-0001');
      await ctx.call('StartRoomSP', ROOM_A.id, 'quote-0009', true);
      ctx.route('POST /Rooms/start-room-sp', text('boom', 500));
      await ctx.call('StartRoomSP', ROOM_A.id, 'sess-0001');
      await ctx.call('JoinRoom', ROOM_A.id, true);

      await ctx.call('RecordEvent_Client', 'jump');
      await ctx.call('RecordEvent_Client', 'coin:5');
      await ctx.call('GetCurrentSessionEvents_Client');
      await ctx.call('EndRoomSP', ROOM_A.id, 'sess-0001', 1234.9, USER_ID);
      ctx.check(lastRequest(ctx).url === `${API}/Rooms/end-room-sp?eventId=${ROOM_A.id}&gameSessionIrOrMatchId=sess-0001`, 'end-room url');
      ctx.check(lastBody(ctx).TournamentId === ROOM_A.id && /^[0-9a-f]{64}$/.test(lastBody(ctx).Hash), 'end-room body');
      await ctx.call('GetCurrentSessionEvents_Client');

      await ctx.call('RecordEvent_Client', 'ignored');
      await ctx.call('EndRoomSP', ROOM_A.id, 'sess-0002', -3.7, USER_ID, '10.1.2.3', ['explicit-1', 'explicit-2']);
      await ctx.call('GetCurrentSessionEvents_Client');

      await ctx.call('RecordEvent_Client', 'kept');
      ctx.route('POST /Rooms/end-room-sp', text('Padding is invalid and cannot be removed.', 500));
      await ctx.call('EndRoomSP', ROOM_A.id, 'sess-0003', 10, USER_ID);
      ctx.check(/Padding is invalid/.test(ctx.lastError()?.message), 'server text in error');
      await ctx.call('GetCurrentSessionEvents_Client');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Special tournaments: listing, aliasing, join/enter, prizes, history, server and client results',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));

      const list = await ctx.call('GetTournaments');
      ctx.check(list[0].Id === TOURNAMENT_ID && list[0].Guid === TOURNAMENT_ID && list[0].FutureField.nested === true, 'aliased, extra fields kept');
      await ctx.call('GetTournaments', 2, 20, mod.TournamentsFilterEnum.OnGoing);
      ctx.check(lastRequest(ctx).url.endsWith('page=2&perPage=20&filterEnum=OnGoing'), 'filter');
      await ctx.call('GetTournamentDetailsLight', TOURNAMENT_ID);

      const lb = await ctx.call('GetTournamentLeaderboard', TOURNAMENT_ID);
      ctx.check(lb.Players[0].Score === 5000 && lb.Players[0].UserName === 'player_test' && lb.Players[1].AvatarUrl === undefined, 'player aliases');
      ctx.check(lb.CurrentPlayer.AvatarUrl === 'https://cdn.test.invalid/a1.png', 'current player mapped');
      ctx.route('GET /SpecialTournaments/get-special-tournament-leaderboard',
        json({ ...TOURNAMENT_LEADERBOARD, Players: null, CurrentPlayer: null }));
      const empty = await ctx.call('GetTournamentLeaderboard', TOURNAMENT_ID);
      ctx.check(empty.Players.length === 0 && empty.CurrentPlayer === undefined, 'empty leaderboard');

      await ctx.call('GetTournamentCommunities', TOURNAMENT_ID);
      ctx.check((await ctx.call('JoinTournament', TOURNAMENT_ID)) === true, 'text/plain join');
      await ctx.call('JoinTournament', TOURNAMENT_ID, 'community-0001', 'p@ss word&x=1');
      ctx.check(lastRequest(ctx).url.endsWith('&communityId=community-0001&password=p%40ss%20word%26x%3D1'), 'password encoded');
      const enter = await ctx.call('EnterTournament', TOURNAMENT_ID);
      ctx.check(enter.LocalTournamentUuid === 'local-uuid-0001-bbbb', 'enter alias');
      await ctx.call('GetPrizes', TOURNAMENT_ID);

      const hist = await ctx.call('GetTournamentsHistory');
      ctx.check(hist.Entries[0].TournamentName === 'Weekly Cup' && hist.Entries[0].Prizes[0].IsRedeemed === false, 'history aliases');
      ctx.check(hist.Entries[1].Prizes.length === 0 && hist.Meta.LastPage === 3 && hist.Meta.path === '/history', 'history meta');
      ctx.route('GET /SpecialTournaments/history', json({ data: [], meta: null }));
      await ctx.call('GetTournamentsHistory', 2, 5);
      ctx.route('GET /SpecialTournaments/history', json({ ...TOURNAMENT_HISTORY, data: undefined }));
      await ctx.call('GetTournamentsHistory', 3, 5);

      await ctx.call('ResultTournament_Server', TOURNAMENT_ID, 'score-uuid-0001-aaaa', 5000, PLATFORM_ID, true);
      ctx.check(/^[0-9a-f]{64}$/.test(lastRequest(ctx).headers['X-Server-Key']) && !('Authorization' in lastRequest(ctx).headers), 'server headers');
      await ctx.call('ResultTournament_Server', TOURNAMENT_ID, 'score-uuid-0001-aaaa', 12.5, PLATFORM_ID, false, '1.2.3.4');

      await ctx.call('RecordEvent_Client', 'lap:1');
      await ctx.call('ResultTournament_Client', TOURNAMENT_ID, 'score-uuid-0001-aaaa', 4999.99, true, '{"lap":3}');
      await ctx.call('GetCurrentSessionEvents_Client');
      await ctx.call('ResultTournament_Client', TOURNAMENT_ID, 'score-uuid-0002-aaaa', 1, false);

      ctx.route('POST /SpecialTournaments/result-tournament-client', text('The selected tournament score uuid is invalid.', 400));
      await ctx.call('ResultTournament_Client', TOURNAMENT_ID, 'local-uuid-0001-bbbb', 1, true);
      ctx.route('POST /SpecialTournaments/result-tournament', text('Unauthorized', 401));
      await ctx.call('ResultTournament_Server', TOURNAMENT_ID, 'score-uuid-0001-aaaa', 1, PLATFORM_ID, true);
      for (const [key, method, args] of [
        ['GET /SpecialTournaments/all-tournaments', 'GetTournaments', []],
        ['GET /SpecialTournaments/light-tournament-details', 'GetTournamentDetailsLight', [TOURNAMENT_ID]],
        ['GET /SpecialTournaments/get-special-tournament-leaderboard', 'GetTournamentLeaderboard', [TOURNAMENT_ID]],
        ['GET /SpecialTournaments/get-tournaments-communities', 'GetTournamentCommunities', [TOURNAMENT_ID]],
        ['GET /SpecialTournaments/join-tournament', 'JoinTournament', [TOURNAMENT_ID]],
        ['GET /SpecialTournaments/enter-tournament', 'EnterTournament', [TOURNAMENT_ID]],
        ['GET /SpecialTournaments/get-prizes', 'GetPrizes', [TOURNAMENT_ID]],
        ['GET /SpecialTournaments/history', 'GetTournamentsHistory', []],
      ]) {
        ctx.route(key, text('Tournament score/session not found.', 400));
        await ctx.call(method, ...args);
      }
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Hall of Fame: periods, game-mode mapping, distribution, invalid arguments',
    async run(ctx) {
      const { mod } = ctx;
      const { HallOfFamePeriodMode: P, HallOfFameGameModeFilter: F } = mod;
      await ctx.call('Initialize', tokenConfig(mod));

      const hof = await ctx.call('GetHallOfFame', P.Global);
      ctx.check(hof.leaderboard[0].displayName === 'player_test' && lastRequest(ctx).url === `${API}/HallOfFame/global?page=1&limit=10`, 'global');
      await ctx.call('GetHallOfFame', P.Monthly, 2, 25, F.SpecialTournament);
      ctx.check(lastRequest(ctx).url.endsWith('/HallOfFame/monthly?page=2&limit=25&gameMode=0'), 'offset mapping');
      await ctx.call('GetHallOfFame', P.Global, 1, 10, F.Rooms);
      await ctx.call('GetHallOfFame', P.Monthly, 1, 10, F.Practice);
      await ctx.call('GetHallOfFame', P.Monthly, 1, 10, F.All);
      const n = ctx.requests.length;
      await ctx.call('GetHallOfFame', 7);
      await ctx.call('GetHallOfFame', P.Global, 1, 10, 9);
      ctx.expectRequests(n, 'invalid arguments fail before I/O');
      await ctx.call('GetHallOfFameDistribution');
      ctx.route('GET /HallOfFame/global', text('boom', 500));
      await ctx.call('GetHallOfFame', P.Global);
      ctx.route('GET /HallOfFame/distribution', text('boom', 500));
      await ctx.call('GetHallOfFameDistribution');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Campaign availability: anonymous and authenticated, cache, structured error bodies',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', config(mod));
      await ctx.call('GetCachedCampaignAvailability');
      await ctx.call('GetCampaignAvailability');
      ctx.check(!('Authorization' in lastRequest(ctx).headers), 'anonymous before auth');
      await ctx.call('GetCachedCampaignAvailability');
      await ctx.call('IsCampaignAvailable');
      ctx.expectRequests(1, 'IsCampaignAvailable served from cache');
      await ctx.call('IsCampaignAvailable', false);
      await ctx.call('Authentication', PLATFORM_TOKEN);
      await ctx.call('GetCampaignAvailability', false);
      ctx.check(lastRequest(ctx).headers.Authorization === `Bearer ${JWT}`, 'JWT attached when present');

      const errors = [
        text('Service Unavailable', 503),
        text('', 500),
        json({ Error: 'CampaignNotAvailable', Message: 'No campaign configured' }, 404),
        json({ Error: 'SomethingNew', Message: 'Newer backend' }, 400),
        json({ Error: 42, Message: null }, 400),
        text('null', 500),
      ];
      for (const e of errors) {
        ctx.route('GET /Campaign/availability', e);
        await ctx.call('GetCampaignAvailability', false);
        ctx.check(ctx.lastError()?.isCampaignError === true, 'CampaignError thrown');
      }
      ctx.route('GET /Campaign/availability', json({ IsAvailable: false, LevelCount: 0, MaxStars: 0 }));
      ctx.check((await ctx.call('IsCampaignAvailable', false)) === false, 'unavailable is data');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Campaign levels and attempts: mapping, config parsing, metrics validation, completion, error codes',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));
      await ctx.call('GetCachedCampaignLevels');
      await ctx.call('GetActiveCampaignAttempt');

      const campaign = await ctx.call('GetCampaignLevels');
      const [l1, l2, l3, l4] = campaign.Levels;
      ctx.check(l1.Id === 'level-0001' && l1.Status === mod.CampaignLevelStatus.Completed && l1.StarRules.Stars.length === 3, 'level 1');
      ctx.check(l2.StarRules === null && l3.LevelConfigJson === null && l3.Status === mod.CampaignLevelStatus.Locked, 'levels 2/3');
      ctx.check(l4.StarRules === null && l4.Rewards.length === 0, 'level 4 non-object rules, null rewards');
      const n = ctx.requests.length;
      await ctx.call('GetCampaignLevels');
      ctx.expectRequests(n, 'levels cached');
      await ctx.call('GetCampaignLevels', false);
      await ctx.call('GetCachedCampaignLevels');

      ctx.check((await ctx.call('GetCampaignLevelConfig', l1)).enemies === 3, 'config parsed');
      await ctx.call('GetCampaignLevelConfig', l2);
      await ctx.call('GetCampaignLevelConfig', l3);
      await ctx.call('GetCampaignLevelConfig', l4);
      await ctx.call('GetCampaignAvailability');

      await ctx.call('CompleteCampaignLevel', { score: 1 });
      ctx.check(ctx.lastError()?.code === mod.CampaignErrorCode.NoActiveAttempt, 'no attempt');

      await ctx.call('StartCampaignLevel', 'level-0002');
      await ctx.call('GetActiveCampaignAttempt');
      const tooMany = Object.fromEntries(Array.from({ length: 33 }, (_, i) => [`m${i}`, i]));
      const before = ctx.requests.length;
      for (const bad of [{}, null, tooMany, { ['x'.repeat(65)]: 1 }, { '': 1 }, { score: NaN }, { score: Infinity }, { score: '100' }]) {
        await ctx.call('CompleteCampaignLevel', bad);
        ctx.check(ctx.lastError()?.code === mod.CampaignErrorCode.InvalidMetrics, 'invalid metrics');
      }
      ctx.expectRequests(before, 'metrics validated before I/O');
      await ctx.call('CompleteCampaignLevel', { ['y'.repeat(64)]: 1, flag: true, ratio: 0.25 }); // boundary: 64-char name ok

      await ctx.call('StartCampaignLevel', 'level-0002');
      await ctx.call('RecordEvent_Client', 'boss-down');
      const result = await ctx.call('CompleteCampaignLevel', { score: 1234.5, perfect: true, deaths: 0, missed: false });
      ctx.check(result.IsWin === true && result.UnlockedLevelId === 'level-0003', 'completion mapped');
      ctx.check(lastBody(ctx).AttemptId === 'attempt-0002-level-0002', 'attempt id in body');
      await ctx.call('GetActiveCampaignAttempt');
      await ctx.call('GetCachedCampaignLevels');
      await ctx.call('GetCurrentSessionEvents_Client');
      const avail = await ctx.call('GetCachedCampaignAvailability');
      ctx.check(avail.LevelCount === 5 && avail.MaxStars === 15, 'availability patched from result');

      await ctx.call('StartCampaignLevel', 'level-0001');
      const explicit = { AttemptId: 'attempt-explicit-0009', LevelId: 'level-0004', ConfigVersion: 4, StartedAt: '2026-09-29T11:00:00Z' };
      await ctx.call('CompleteCampaignLevel', { score: 5 }, explicit);
      ctx.check((await ctx.call('GetActiveCampaignAttempt')).AttemptId === 'attempt-0003-level-0001', 'explicit attempt leaves tracked one');

      ctx.route('POST /Campaign/complete-level', json({ Error: 'AttemptNotFound', Message: 'Attempt not found' }, 404));
      await ctx.call('CompleteCampaignLevel', { score: 5 }, explicit);
      await ctx.call('GetActiveCampaignAttempt');
      await ctx.call('CompleteCampaignLevel', { score: 5 });
      ctx.check((await ctx.call('GetActiveCampaignAttempt')) === null, 'dead attempt untracked');

      await ctx.call('StartCampaignLevel', 'level-0001');
      ctx.route('POST /Campaign/complete-level', json({ Error: 'CompletionTooFast', Message: 'Too fast' }, 400));
      await ctx.call('CompleteCampaignLevel', { score: 5 });
      await ctx.call('GetActiveCampaignAttempt');

      await ctx.call('StartCampaignLevel', 'level-0001');
      for (const failure of [
        text('upstream exploded', 500),
        json({ Error: 'InvalidSignature', Message: 'Bad hash' }, 401),
        json({ Error: 'BrandNewCode', Message: 'Future' }, 502),
        networkError(),
      ]) {
        ctx.route('POST /Campaign/complete-level', failure);
        await ctx.call('CompleteCampaignLevel', { score: 5 });
        await ctx.call('GetActiveCampaignAttempt'); // retryable: still tracked
      }
      await ctx.call('AbandonCampaignAttempt');
      await ctx.call('GetActiveCampaignAttempt');

      ctx.route('POST /Campaign/start-level', json({ Error: 'LevelLocked', Message: 'Level is locked' }, 403));
      await ctx.call('StartCampaignLevel', 'level-0003');
      ctx.route('POST /Campaign/start-level', json({ Error: 'LevelNotFound', Message: 'No such level' }, 404));
      await ctx.call('StartCampaignLevel', 'level-9999');
      await ctx.call('GetActiveCampaignAttempt');

      ctx.route('GET /Campaign/levels', json({ ...CAMPAIGN_LEVELS, Levels: [{ ...CAMPAIGN_LEVELS.Levels[0], Status: 7 }] }));
      await ctx.call('GetCampaignLevels', false);
      ctx.check(ctx.lastError()?.isCampaignError === false, 'unknown status is a plain Error');
      ctx.route('GET /Campaign/levels', json({ IsAvailable: false, TotalLevels: 0, CompletedLevels: 0, TotalStarsEarned: 0, MaxStars: 0, Levels: null }));
      await ctx.call('GetCampaignLevels', false);
      ctx.route('GET /Campaign/levels', json({ Error: 'CampaignNotAvailable', Message: 'Campaign disabled' }, 500));
      await ctx.call('GetCampaignLevels', false);
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Client sessions: unfinished scan, reconnect/decrypt, create, update, close, failures',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('CreateSession_Client', '{}', mod.GameTypeEnum.Rooms, ROOM_A.id, 'sess-0000');
      ctx.check(/User data is not loaded/.test(ctx.lastError()?.message), 'no user data');

      await ctx.call('Initialize', config(mod));
      await ctx.call('Authentication', PLATFORM_TOKEN);
      const unfinished = await ctx.call('UserHasUnfinishedSession_Client');
      ctx.check(unfinished.SavedSessions[0].Id === SAVED_SESSION.Id, 'unfinished sessions');
      await ctx.call('ReconnectToUnfinishedSession_Client', SAVED_SESSION.Id);
      ctx.check(/User data is not loaded/.test(ctx.lastError()?.message), 'reconnect needs user data');
      await ctx.call('GetUserData', false);
      await ctx.call('UpdateSession_Client', '{"x":1}');
      ctx.check(/No active client session/.test(ctx.lastError()?.message), 'nothing to update');

      const state = await ctx.call('ReconnectToUnfinishedSession_Client', SAVED_SESSION.Id);
      ctx.check(state === SAVED_STATE, 'saved state decrypted');
      ctx.check(lastRequest(ctx).url.endsWith(`reconnect-to-session?id=${SAVED_SESSION.Id}`), 'reconnect url');
      await ctx.call('UpdateSession_Client', JSON.stringify({ level: 4 }));
      ctx.check(lastBody(ctx).Id === SAVED_SESSION.Id, 'update targets the reconnected session');

      await ctx.call('RecordEvent_Client', 'checkpoint');
      await ctx.call('GetCurrentSessionEvents_Client');
      const created = await ctx.call('CreateSession_Client', JSON.stringify({ level: 1 }), mod.GameTypeEnum.Rooms, ROOM_A.id, 'sess-0005');
      ctx.check(created.Id === 'db-session-0002' && created.GameType === mod.GameTypeEnum.Rooms, 'created');
      await ctx.call('GetCurrentSessionEvents_Client');
      await ctx.call('UpdateSession_Client', JSON.stringify({ level: 2 }));
      ctx.check(lastBody(ctx).Id === 'db-session-0002', 'update targets the created session');
      await ctx.call('CloseCurrentSession_Client');
      await ctx.call('UpdateSession_Client', '{}');

      ctx.route('GET /Session/reconnect-to-session', json({ ...SAVED_SESSION, Data: serverEncrypt('garbage', 'WrongKeyWrongKey') }));
      await ctx.call('ReconnectToUnfinishedSession_Client', SAVED_SESSION.Id);
      ctx.route('GET /Session/reconnect-to-session', text('not found', 404));
      await ctx.call('ReconnectToUnfinishedSession_Client', 'db-missing');
      ctx.route('POST /Session/create-session', text('boom', 500));
      await ctx.call('CreateSession_Client', '{}', mod.GameTypeEnum.Practice, ROOM_A.id, 'sess-0006');
      ctx.route('GET /Session/reconnect-to-session', json(SAVED_SESSION));
      await ctx.call('ReconnectToUnfinishedSession_Client', SAVED_SESSION.Id);
      ctx.route('POST /Session/update-session', text('boom', 500));
      await ctx.call('UpdateSession_Client', '{}');
      ctx.route('GET /Session/any-unfinished-sessions', text('boom', 500));
      await ctx.call('UserHasUnfinishedSession_Client');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Dedicated server sessions: register, per-player events, leave, close, finish',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', config(mod));
      await ctx.call('UserLeaveSession_Server', PLATFORM_ID);
      await ctx.call('CloseCurrentSession_Server');
      ctx.expectRequests(0, 'no tracked server session -> no I/O');
      await ctx.call('RecordEvent_Server', PLATFORM_ID, 'pre-session');
      await ctx.call('GetCurrentSessionEvents_Server', PLATFORM_ID);

      const players = [
        { JoinKey: 'join-key-0001', FunticoUserId: PLATFORM_ID, SdkUserId: USER_ID, UserStatus: mod.UserGameStatus.InGame },
        { JoinKey: 'join-key-0002', FunticoUserId: RIVAL_ID, SdkUserId: 4343, UserStatus: mod.UserGameStatus.InGame },
      ];
      ctx.route('POST /Session/create-server-session', text('Unauthorized', 401));
      await ctx.call('CreateSession_Server', 'wss://game.test.invalid:7777', 'match-0001', players);
      await ctx.call('UserLeaveSession_Server', PLATFORM_ID); // still untracked after the failure
      ctx.route('POST /Session/create-server-session', json(true));

      await ctx.call('CreateSession_Server', 'wss://game.test.invalid:7777', 'match-0001', players);
      ctx.check(/^[0-9a-f]{64}$/.test(lastRequest(ctx).headers['X-Server-Key']), 'server key header');
      await ctx.call('GetCurrentSessionEvents_Server', PLATFORM_ID);
      await ctx.call('RecordEvent_Server', PLATFORM_ID, 'kill');
      await ctx.call('RecordEvent_Server', RIVAL_ID, 'death');
      await ctx.call('RecordEvent_Server', 9999, 'late-joiner');
      await ctx.call('GetCurrentSessionEvents_Server', PLATFORM_ID);
      await ctx.call('GetCurrentSessionEvents_Server', RIVAL_ID);
      await ctx.call('GetCurrentSessionEvents_Server', 9999);
      await ctx.call('GetCurrentSessionEvents_Server', 123);
      await ctx.call('UserLeaveSession_Server', RIVAL_ID);
      ctx.check(lastRequest(ctx).url.endsWith(`server-session-user-leave?id=match-0001&userId=${RIVAL_ID}`), 'leave url');
      await ctx.call('CloseCurrentSession_Server');
      await ctx.call('GetCurrentSessionEvents_Server', PLATFORM_ID);
      await ctx.call('UserLeaveSession_Server', PLATFORM_ID);

      await ctx.call('CreateSession_Server', 'wss://game.test.invalid:7777', 'match-0002', players);
      await ctx.call('FinishRoomSession_Server', ROOM_A.id, 'match-0002', [
        { Score: 99.9, UserId: USER_ID, FunticoUserId: PLATFORM_ID, UserIp: '10.0.0.1', GameManagedAward: 5, AdditionalData: 'x', GameEvents: ['a'] },
        { Score: -0.5, UserId: 4343, FunticoUserId: RIVAL_ID, UserIp: '10.0.0.2' },
      ]);
      ctx.check(lastBody(ctx).scores[0].score === 99 && lastBody(ctx).scores[1].game_managed_award === null, 'snake_case scores');
      await ctx.call('CloseCurrentSession_Server');

      ctx.route('GET /Session/server-session-user-leave', text('boom', 500));
      ctx.route('GET /Session/close-server-session', text('boom', 500));
      ctx.route('POST /Rooms/end-room-all-users', text('boom', 500));
      await ctx.call('CreateSession_Server', 'wss://game.test.invalid:7777', 'match-0003', players);
      await ctx.call('UserLeaveSession_Server', PLATFORM_ID);
      await ctx.call('CloseCurrentSession_Server');
      await ctx.call('FinishRoomSession_Server', ROOM_A.id, 'match-0003', []);
      await ctx.call('UserLeaveSession_Server', PLATFORM_ID); // failed close/finish kept tracking
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Static utilities: PrizeUtils.calculatePrize and CryptoHelper',
    async run(ctx) {
      const P = ctx.cls('PrizeUtils');
      const C = ctx.cls('CryptoHelper');
      const prizes = [
        { type: 'GppPoolShare', Currency: 2, Value: 0, Percentage: 33 },
        { type: 'GppPoolShare', Currency: 2, Value: 0 },
        { type: 'DepositStakePoolShare', Currency: 1, Value: 0, Percentage: 12.5 },
        { type: 'DepositStakePoolShare', Currency: 1, Value: 0, Percentage: null },
        { type: 'DepositStakePerPlayer', Currency: 1, Value: 70 },
        { type: 'GppPerPlayer', Currency: 2, Value: 30 },
        { type: 'GameManagedReward', Currency: 1, Value: 1000 },
        { type: 'Reward', PrizeId: 1, Amount: 1 },
        { type: 'External', Id: 1, ImageUrl: '', Name: 'NFT', Description: '', Chain: '', ContractAddress: '', ExplorerUrl: '', WalletAddress: '' },
      ];
      ctx.check((await ctx.step('calculatePrize mixed', () => P.calculatePrize(prizes, 999))) === 329 + 124 + 70 + 30, 'prize maths');
      await ctx.step('calculatePrize null', () => P.calculatePrize(null, 100));
      await ctx.step('calculatePrize empty', () => P.calculatePrize([], 100));

      for (const [plain, key] of [
        ['hello', 'short'], ['', 'k'], ['{"Score":1}', 'exactly16chars!!'], ['x', 'a-very-long-key-over-sixteen'],
        ['0123456789abcdef', 'room-aaaTestPriv'], ['Привіт 🎮', 'ключ'],
      ]) {
        const enc = await ctx.step(`encrypt ${key}`, () => C.encrypt(plain, key));
        await ctx.step(`decrypt ${key}`, () => C.decrypt(enc, key));
      }
      await ctx.step('decrypt server ciphertext', () => C.decrypt(serverEncrypt('from the server', 'room-aaaTestPriv'), 'room-aaaTestPriv'));
      await ctx.step('decrypt with wrong key', () => C.decrypt(serverEncrypt('secret payload', 'RightKeyRightKey'), 'WrongKeyWrongKey'));
      await ctx.step('hmac', () => C.hmacSha256('message', 'key'));
      await ctx.step('hmac unicode', () => C.hmacSha256('Привіт', 'ключ'));
      await ctx.step('hmac empty key', () => C.hmacSha256('message', ''));
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Config validation rejects before any request and keeps the previous config',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));
      const n = ctx.requests.length;
      await ctx.call('Initialize', config(mod, { privateGameKey: PUB + PRIV }));
      await ctx.call('Initialize', config(mod, { privateGameKey: PRIV + '\n' }));
      await ctx.call('Initialize', undefined);
      await ctx.call('Initialize', config(mod, { privateGameKey: 'short' }));
      ctx.expectRequests(n, 'rejected configs make no request');
      await ctx.call('GetBalance', false);
      ctx.check(lastRequest(ctx).headers['X-User-Key'] === PUB && lastRequest(ctx).url.startsWith(API), 'old config still in use');
    },
  },
];
