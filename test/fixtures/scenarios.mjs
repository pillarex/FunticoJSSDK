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
  CAMPAIGN_LEVELS, SAVED_STATE, SAVED_SESSION, gameSession, GHOST_MATCH_ID,
  GOAL_CHAIN_KEY, GOAL_ID, NEXT_GOAL_ID, GOAL_ATTEMPT_ID, GOAL_ATTEMPT, GOAL_ATTEMPT_START, COMMUNITY_GOAL_LIVE, communityGoal,
  COMMUNITY_GOAL_SETTLED, GOAL_STRIKE_ID,
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

      await ctx.call('RecordCollected_Client', 'chest_1');
      await ctx.call('RecordCollected_Client', 'chest_1', 2);
      await ctx.call('GetCurrentSessionCollected_Client');
      await ctx.call('EndRoomSP', ROOM_A.id, 'sess-0004', 10, USER_ID);
      await ctx.call('GetCurrentSessionCollected_Client');
      ctx.route('POST /Rooms/end-room-sp', json({ Success: true }));
      await ctx.call('EndRoomSP', ROOM_A.id, 'sess-0004', 10, USER_ID);
      await ctx.call('GetCurrentSessionCollected_Client');
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
    name: 'Practice: signed result, recorded events and counts, run id across a failed submit, overrides, validation',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('CompletePractice', 100);
      ctx.check(/not authenticated/.test(ctx.lastError()?.message), 'needs sign-in');
      ctx.expectRequests(0, 'nothing sent before sign-in');

      // Signed in without the profile preload: the user id is loaded first.
      await ctx.call('Initialize', config(mod));
      await ctx.call('Authentication', PLATFORM_TOKEN);
      const n0 = ctx.requests.length;
      ctx.check((await ctx.call('CompletePractice', 0)) === true, 'delivered');
      ctx.check(ctx.requests.length === n0 + 2 && ctx.requests[n0].url === `${API}/User/get-full-data`, 'user data loaded before the result');
      ctx.check(lastRequest(ctx).method === 'POST' && lastRequest(ctx).url === `${API}/User/complete-practice`, 'practice url');
      ctx.check(Object.keys(lastBody(ctx)).join() === 'Data,Hash' && /^[0-9a-f]{64}$/.test(lastBody(ctx).Hash), 'practice envelope');

      await ctx.call('RecordEvent_Client', '{"t":"wave","n":1}');
      await ctx.call('RecordCollected_Client', 'chest_1', 2);
      const n1 = ctx.requests.length;
      await ctx.call('CompletePractice', 1234.9);
      ctx.expectRequests(n1 + 1, 'cached user data: one request');
      ctx.check((await ctx.call('GetCurrentSessionEvents_Client')).length === 0, 'events cleared after a delivered result');
      ctx.check(Object.keys(await ctx.call('GetCurrentSessionCollected_Client')).length === 0, 'counts cleared after a delivered result');

      // A refused or lost result keeps the run (same id), its events and its counts for the retry.
      await ctx.call('RecordEvent_Client', 'kept');
      await ctx.call('RecordCollected_Client', 'chest_2');
      ctx.route('POST /User/complete-practice', text('Invalid hash', 400));
      await ctx.call('CompletePractice', 50);
      ctx.check(/Invalid hash/.test(ctx.lastError()?.message), 'server text in error');
      ctx.route('POST /User/complete-practice', networkError());
      await ctx.call('CompletePractice', 50);
      ctx.check(ctx.lastError()?.message === 'mock network failure', 'network error surfaces');
      ctx.check((await ctx.call('GetCurrentSessionEvents_Client')).length === 1, 'events kept after a failure');
      ctx.check((await ctx.call('GetCurrentSessionCollected_Client')).chest_2 === 1, 'counts kept after a failure');
      ctx.route('POST /User/complete-practice', text('"Success"'));
      await ctx.call('CompletePractice', 50);
      const sent = ctx.requests.filter(r => r.url.endsWith('/User/complete-practice')).map(r => JSON.parse(r.body).Data);
      ctx.check(sent.slice(-3).every(data => data === sent[sent.length - 1]), 'the retries resend the same run');

      // Overrides are sent instead of the recorded data; the recorded data is cleared all the same.
      await ctx.call('RecordEvent_Client', 'recorded');
      await ctx.call('RecordCollected_Client', 'chest_1');
      await ctx.call('CompletePractice', -7.5, { collected: { chest_3: 4 }, gameEvents: ['own-1', 'own-2'] });
      await ctx.call('GetCurrentSessionEvents_Client');
      await ctx.call('GetCurrentSessionCollected_Client');
      await ctx.call('RecordCollected_Client', 'chest_1');
      await ctx.call('CompletePractice', 3, { gameEvents: ['only-events'] });
      await ctx.call('CompletePractice', 1, { collected: {}, gameEvents: [] });

      // Scores that do not fit a 32-bit integer throw before any request.
      const n2 = ctx.requests.length;
      for (const score of [NaN, Infinity, -Infinity, 2 ** 31, -(2 ** 31) - 1, '100']) {
        await ctx.call('CompletePractice', score);
      }
      ctx.expectRequests(n2, 'invalid scores make no request');
      await ctx.call('CompletePractice', 2 ** 31 - 0.5);
      await ctx.call('CompletePractice', -(2 ** 31));
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
    name: 'Inventory: mapping, cache per scope, properties parsing, lookups, error codes',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));
      await ctx.call('GetCachedInventory');
      const inventory = await ctx.call('GetInventory');
      ctx.check(lastRequest(ctx).url.endsWith('/Inventory'), 'game scope by default');
      const [shard, hull, bare] = inventory.Items;
      ctx.check(shard.Count === 3 && shard.UserItemIds.length === 3 && shard.Copies.length === 0, 'stack mapped');
      ctx.check(hull.Copies.length === 2 && hull.Copies[1].StatsJson === '[]', 'per-copy stats, null defaults to []');
      ctx.check(bare.Name === '' && bare.UserItemIds.length === 0 && bare.Copies.length === 0, 'null collections defaulted');

      const n = ctx.requests.length;
      await ctx.call('GetInventory');
      ctx.expectRequests(n, 'inventory cached');
      const all = await ctx.call('GetInventory', true, true);
      ctx.check(lastRequest(ctx).url.endsWith('/Inventory?all=true'), 'other items requested');
      ctx.check(all.Items.length === 4 && all.Items[3].IsGameItem === false, 'other items included');
      await ctx.call('GetCachedInventory');
      await ctx.call('GetCachedInventory', true);
      await ctx.call('GetInventory', false);

      ctx.check((await ctx.call('FindInventoryItem', inventory, 'sg_shard_missile_hornet'))?.ItemId === 437, 'found by game item id');
      await ctx.call('FindInventoryItem', inventory, 'sg_missing');
      ctx.check((await ctx.call('GetInventoryItemProperties', shard)).game.forgeNeed === 5, 'properties parsed');
      await ctx.call('GetInventoryItemProperties', hull); // not JSON: throws
      await ctx.call('GetInventoryItemProperties', bare); // no properties: null

      const errors = [
        json({ Error: 'ReloginRequired', Message: 'Log in to this game again' }, 409),
        json({ Error: 'PlatformUnavailable', Message: 'Try again later' }, 502),
        json({ Error: 'NotLinked', Message: 'No Funtico account' }, 400),
        json({ Error: 'SomethingNew', Message: 'Newer backend' }, 400),
        text('', 401),
        text('Bad Gateway', 502),
      ];
      for (const e of errors) {
        ctx.route('GET /Inventory', e);
        await ctx.call('GetInventory', false);
        ctx.check(ctx.lastError()?.isInventoryError === true, 'InventoryError thrown');
      }
      ctx.route('GET /Inventory', json({}));
      ctx.check((await ctx.call('GetInventory', false)).Items.length === 0, 'missing Items becomes []');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Recent rewards: query, mapping, null defaults, error codes',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));
      const recent = await ctx.call('GetRecentRewards');
      ctx.check(lastRequest(ctx).url.endsWith('/Rewards/recent?limit=20'), 'default limit sent');
      const [drop, empty, queued, bare] = recent.Rewards;
      ctx.check(drop.Status === 'Delivered' && drop.Items[0].GameItemId === 'sg_module_laser_helios' && drop.DeliveredAt !== null, 'delivered drop mapped');
      ctx.check(empty.Status === 'Empty' && empty.Items.length === 0, 'empty draw has no items');
      ctx.check(queued.Items.length === 0 && queued.Source === 'Campaign', 'null Items becomes []');
      ctx.check(bare.Source === '' && bare.Key === '' && bare.Items[0].Amount === 1 && bare.Items[0].Name === null, 'null strings defaulted, amount defaults to 1');

      await ctx.call('GetRecentRewards', 500, new Date('2026-11-16T10:00:00.000Z'));
      const url = new URL(lastRequest(ctx).url);
      ctx.check(url.searchParams.get('limit') === '100' && url.searchParams.get('since') === '2026-11-16T10:00:00.000Z', 'limit clamped, since as ISO');
      await ctx.call('GetRecentRewards', 0);
      ctx.check(new URL(lastRequest(ctx).url).searchParams.get('limit') === '20', 'zero limit falls back to 20');

      ctx.route('GET /Rewards/recent', json({}));
      ctx.check((await ctx.call('GetRecentRewards')).Rewards.length === 0, 'missing Rewards becomes []');
      for (const e of [json({ Error: 'ReloginRequired', Message: 'Log in again' }, 409), text('', 401), text('oops', 500)]) {
        ctx.route('GET /Rewards/recent', e);
        await ctx.call('GetRecentRewards');
        ctx.check(ctx.lastError()?.isInventoryError === true, 'InventoryError thrown');
      }
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Ghost matchmaking: pools, run lifecycle, find/upload, signed report, summary, history, error codes',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', tokenConfig(mod));

      const pools = await ctx.call('GetGhostPools');
      ctx.check(pools.length === 2 && pools[0].Attributes[0].Bind === 'Run.Round', 'pools mapped');
      ctx.check(Array.isArray(pools[1].Attributes) && pools[1].Attributes.length === 0, 'null Attributes becomes []');

      const state = await ctx.call('GetGhostRun', 'arena');
      ctx.check(lastRequest(ctx).url.endsWith('/Ghost/run?pool=arena'), 'run url');
      ctx.check(state.Run.Round === 1 && state.OpenMatch.MatchId === GHOST_MATCH_ID, 'run state mapped');
      ctx.check(Object.keys(state.OpenMatch.OpponentAttributes).length === 0, 'null OpponentAttributes becomes {}');
      await ctx.call('StartGhostRun', 'arena');
      ctx.check(lastRequest(ctx).method === 'POST' && lastRequest(ctx).url.endsWith('/Ghost/run/start?pool=arena'), 'start url');
      await ctx.call('GetGhostRun', 'pool with spaces & more');
      ctx.check(lastRequest(ctx).url.endsWith('?pool=pool%20with%20spaces%20%26%20more'), 'pool key encoded');

      const found = await ctx.call('FindGhostOpponent', 'arena', { ShipSize: 3 }, { snapshot: '{"v":1}', exclude: ['b2c3d4e5-0000-4000-8000-000000000002'] });
      ctx.check(lastBody(ctx).Snapshot === '{"v":1}' && lastBody(ctx).AllowBots === true && lastBody(ctx).Exclude.length === 1, 'find body');
      ctx.check(found.Match.OpponentAttributes.ShipSize === 3 && found.UploadedSnapshotId !== null && found.Run.Round === 1, 'find mapped');
      const free = await ctx.call('FindGhostOpponent', 'duel', { ShipSize: 2 });
      ctx.check(lastBody(ctx).Snapshot === null && lastBody(ctx).Exclude.length === 0, 'find defaults');
      ctx.check(free.Run === null && free.UploadedSnapshotId === null, 'free pool: no run, nothing uploaded');
      await ctx.call('FindGhostOpponent', 'duel', { ShipSize: 2 }, { allowBots: false });
      ctx.check(lastBody(ctx).AllowBots === false, 'bots forbidden');

      ctx.check((await ctx.call('UploadGhostSnapshot', 'arena', { ShipSize: 3 }, '{"v":1}')).Partition === 's1', 'upload mapped');

      const report = await ctx.call('ReportGhostResult', found.Match.MatchId, mod.GhostOutcome.Win, 'fight-hash-01');
      ctx.check(lastBody(ctx).MatchId === GHOST_MATCH_ID && /^[0-9a-f]{64}$/.test(lastBody(ctx).Hash), 'report envelope');
      ctx.check(report.PlayerRatingAfter === 1016 && report.Run.Wins === 1, 'report mapped');
      await ctx.call('ReportGhostResult', GHOST_MATCH_ID.toUpperCase(), mod.GhostOutcome.Draw);
      ctx.check(lastBody(ctx).MatchId === GHOST_MATCH_ID, 'match id lowercased');
      await ctx.call('ReportGhostResult', GHOST_MATCH_ID, mod.GhostOutcome.Win, 'fight-hash-01', '{"v":1,"log":["r1","r2"]}');
      ctx.check(Object.keys(lastBody(ctx)).join() === 'MatchId,EncryptedData,Hash', 'match data travels only inside the signed payload');
      await ctx.call('ReportGhostResult', GHOST_MATCH_ID, mod.GhostOutcome.Loss, null, '');
      const before = ctx.requests.length;
      await ctx.call('ReportGhostResult', GHOST_MATCH_ID, 'Victory');
      ctx.check(ctx.lastError()?.code === mod.GhostErrorCode.InvalidOutcome, 'outcome validated');
      ctx.expectRequests(before, 'invalid outcome makes no request');

      ctx.check((await ctx.call('GetGhostReportSummary', 'arena')).NewGhostWins === 2, 'summary mapped');
      const history = await ctx.call('GetGhostHistory', 'arena');
      ctx.check(lastRequest(ctx).url.endsWith('/Ghost/history?pool=arena&page=1&limit=20'), 'history defaults');
      ctx.check(history.Items[1].Outcome === null && history.Items[1].Expired === true, 'history mapped');
      await ctx.call('GetGhostHistory', 'arena', 3, 5);
      ctx.check(lastRequest(ctx).url.endsWith('&page=3&limit=5'), 'history paging');

      const board = await ctx.call('GetGhostLeaderboard', 'arena');
      ctx.check(lastRequest(ctx).url.endsWith('/Ghost/leaderboard?pool=arena&page=1&limit=20'), 'leaderboard defaults, no partition');
      ctx.check(board.Items.length === 2 && board.Items[1].Name === null && board.Me.Place === 7 && board.Me.IsMe && board.HasMore, 'leaderboard mapped');
      await ctx.call('GetGhostLeaderboard', 'arena', 2, 50, 's 1');
      ctx.check(lastRequest(ctx).url.endsWith('&page=2&limit=50&partition=s%201'), 'past season requested');

      const abandoned = await ctx.call('AbandonGhostRun', 'arena');
      ctx.check(abandoned.Run.Status === 'Abandoned' && abandoned.OpenMatch === null, 'abandon mapped');

      const failures = [
        ['POST /Ghost/find', 'FindGhostOpponent', ['arena', {}], json({ Error: 'NoOpponent', Message: 'No opponent found.' }, 400)],
        ['POST /Ghost/find', 'FindGhostOpponent', ['arena', { Round: 4 }], json({ Error: 'RunStateMismatch', Message: "'Round' is 2 on the server" }, 400)],
        ['POST /Ghost/run/start', 'StartGhostRun', ['duel'], json({ Error: 'RunNotSupported', Message: 'No runs' }, 400)],
        ['POST /Ghost/run/abandon', 'AbandonGhostRun', ['arena'], json({ Error: 'RunNotActive', Message: 'Nothing to abandon' }, 400)],
        ['POST /Ghost/report', 'ReportGhostResult', [GHOST_MATCH_ID, mod.GhostOutcome.Loss], json({ Error: 'MatchExpired', Message: 'Expired' }, 400)],
        ['POST /Ghost/report', 'ReportGhostResult', [GHOST_MATCH_ID, mod.GhostOutcome.Win, null, 'x'.repeat(40000)],
          json({ Error: 'DataTooLarge', Message: 'Too large' }, 400), 'DataTooLarge'],
        ['POST /Ghost/upload', 'UploadGhostSnapshot', ['arena', {}, 'x'], json({ Error: 'InvalidSnapshot', Message: 'Not JSON' }, 400)],
        ['GET /Ghost/pools', 'GetGhostPools', [], json({ Error: 'BrandNewCode', Message: 'Future' }, 400)],
        ['GET /Ghost/report-summary', 'GetGhostReportSummary', ['nope'], json({ Error: 'PoolNotFound', Message: 'No pool' }, 400)],
        ['GET /Ghost/history', 'GetGhostHistory', ['arena'], text('Bad Gateway', 502)],
        ['GET /Ghost/run', 'GetGhostRun', ['arena'], text('', 401)],
      ];
      for (const [route, method, args, failure, code] of failures) {
        ctx.route(route, failure);
        await ctx.call(method, ...args);
        ctx.check(ctx.lastError()?.isGhostError === true, `${method}: GhostError thrown`);
        if (code) ctx.check(ctx.lastError()?.code === mod.GhostErrorCode[code], `${method}: ${code} code`);
      }
      ctx.check(ctx.lastError()?.code === mod.GhostErrorCode.Unknown, 'no body -> Unknown');

      ctx.route('GET /Ghost/pools', json({ Pools: null }));
      ctx.check((await ctx.call('GetGhostPools')).length === 0, 'null Pools becomes []');
      ctx.route('GET /Ghost/history', json({ Items: null, Page: 1, Limit: 20, HasMore: false }));
      ctx.check((await ctx.call('GetGhostHistory', 'arena')).Items.length === 0, 'null Items becomes []');
      ctx.route('GET /Ghost/leaderboard', json({ Pool: 'arena', Partition: 's2', Page: 1, Limit: 20, HasMore: false }));
      const emptyBoard = await ctx.call('GetGhostLeaderboard', 'arena');
      ctx.check(emptyBoard.Items.length === 0 && emptyBoard.Me === null, 'missing leaderboard Items/Me become []/null');
      ctx.route('GET /Ghost/leaderboard', json({ Error: 'PoolNotFound', Message: 'No pool' }, 400));
      await ctx.call('GetGhostLeaderboard', 'nope');
      ctx.check(ctx.lastError()?.code === mod.GhostErrorCode.PoolNotFound, 'leaderboard error code');
      ctx.route('GET /Ghost/run', json({}));
      const empty = await ctx.call('GetGhostRun', 'arena');
      ctx.check(empty.Run === null && empty.OpenMatch === null, 'missing run fields become null');
    },
  },

  // -------------------------------------------------------------------------------------------
  {
    name: 'Community goal: reads before sign-in, signed attempt completion, live, leaderboard, watch, error codes',
    async run(ctx) {
      const { mod } = ctx;
      await ctx.call('Initialize', config(mod));

      // Before sign-in: reads go out with the game key only.
      const anon = await ctx.call('GetCommunityGoal', GOAL_CHAIN_KEY);
      ctx.check(lastRequest(ctx).url === `${API}/CommunityGoal/world-boss`, 'chain url');
      ctx.check(lastRequest(ctx).headers['X-User-Key'] === PUB && lastRequest(ctx).headers.Authorization === undefined, 'anonymous read: no token');
      ctx.check(anon.Goal.GoalId === GOAL_ID && Array.isArray(anon.Goal.MilestonesPassed) && anon.Goal.MilestonesPassed.length === 0, 'null MilestonesPassed becomes []');
      ctx.check(anon.Chain.Milestones.length === 3 && anon.Me.AttemptsLeftToday === 1 && anon.Me.OpenAttempt === null, 'state mapped');
      const [b1, b2, b3] = anon.Goal.Rewards;
      ctx.check(anon.Goal.Rewards.length === 3 && b1.Label === '#1' && b1.MaxPlace === 1 && b1.Display[0].Amount === 3 && b1.Display[0].Code === 'core_plasma' && b2.MaxPercentile === 10 && b2.Display.length === 0,
        'reward brackets mapped, null Display becomes []');
      ctx.check(b3.Label === null && b3.MaxPlace === null && b3.MaxPercentile === null && b3.AnyContribution && b3.Display[0].ImageUrl === null && b3.Display[0].Amount === null && b3.Display[0].Code === null,
        'missing bracket fields become null');
      ctx.check(anon.Me.Best === 1500000 && anon.Me.RewardStatus === null && Array.isArray(anon.Me.Rewards) && anon.Me.Rewards.length === 0, 'Me: best strike, no reward state yet');
      ctx.check(anon.Goal.StrikeCount === 128 && anon.Goal.ClosedBy === null, 'open goal: strike count, no last hit');
      await ctx.call('StartGoalAttempt', GOAL_ID);
      ctx.check(/not authenticated/.test(ctx.lastError()?.message), 'attempts need sign-in');

      await ctx.call('Authentication', PLATFORM_TOKEN);
      const byId = await ctx.call('GetCommunityGoalById', GOAL_ID);
      ctx.check(lastRequest(ctx).headers.Authorization === `Bearer ${JWT}` && byId.Me === null, 'signed-in read sends the token; Me null mapped');
      ctx.route('GET /CommunityGoal/key%20with%20spaces%2F%26', json({ Error: 'ChainNotFound', Message: 'No chain' }, 400));
      await ctx.call('GetCommunityGoal', 'key with spaces/&');
      ctx.check(lastRequest(ctx).url.endsWith('/CommunityGoal/key%20with%20spaces%2F%26'), 'chain key encoded into one path segment');

      const live = await ctx.call('GetCommunityGoalLive', GOAL_ID);
      ctx.check(live.CurrentValue === 701500 && live.PollAfterSeconds === 7 && live.NextGoalId === null && live.StrikeCount === 129, 'live mapped');

      const start = await ctx.call('StartGoalAttempt', GOAL_ID);
      ctx.check(lastRequest(ctx).method === 'POST' && lastRequest(ctx).url.endsWith(`/CommunityGoal/attempt/start?goalId=${GOAL_ID}`), 'start url');
      ctx.check(start.Attempt.AttemptId === GOAL_ATTEMPT_ID && start.Goal.PayloadJson.includes('Warden') && !start.Resumed, 'start mapped');
      ctx.check(start.Attempt.GoalValueAtStart === 700000 && start.Attempt.MilestonesAtStart[0] === 0.25, 'start snapshot mapped');
      ctx.check(!lastRequest(ctx).body && lastRequest(ctx).headers['Content-Type'] === undefined, 'start without startData sends no body');
      ctx.check(start.Attempt.StartData === '{"ship":"nova7"}', 'StartData mapped');
      await ctx.call('StartGoalAttempt', GOAL_ID, { startData: '{"ship":"vega"}' });
      ctx.check(lastBody(ctx).StartData === '{"ship":"vega"}' && lastRequest(ctx).headers['Content-Type'] === 'application/json' && lastRequest(ctx).url.endsWith(`?goalId=${GOAL_ID}`),
        'start with startData sends it as JSON');

      const result = await ctx.call('CompleteGoalAttempt', start.Attempt, 5000000, { clientDurationSeconds: 58.5, metrics: { hits: 42 }, fightHash: 'fh-1' });
      ctx.check(lastBody(ctx).AttemptId === GOAL_ATTEMPT_ID && /^[0-9a-f]{64}$/.test(lastBody(ctx).Hash) && !lastRequest(ctx).body.includes('5000000'), 'completion travels encrypted');
      ctx.check(result.Accepted === 1500000 && result.Capped && result.MilestonesCrossed.length === 2 && result.Place === 1, 'completion mapped');
      ctx.check(result.Best === 1500000 && result.IsNewBest === true, 'completion: best strike and NEW BEST');
      await ctx.call('CompleteGoalAttempt', { AttemptId: GOAL_ATTEMPT_ID.toUpperCase(), GoalId: GOAL_ID.toUpperCase() }, 0);
      ctx.check(lastBody(ctx).AttemptId === GOAL_ATTEMPT_ID, 'attempt id lowercased');

      const before = ctx.requests.length;
      for (const bad of [-1, 1.5, Number.NaN, 2 ** 60]) {
        await ctx.call('CompleteGoalAttempt', GOAL_ATTEMPT, bad);
        ctx.check(ctx.lastError()?.code === mod.CommunityGoalErrorCode.InvalidContribution, `contribution ${bad} refused`);
      }
      await ctx.call('CompleteGoalAttempt', null, 10);
      ctx.check(ctx.lastError()?.code === mod.CommunityGoalErrorCode.AttemptNotFound, 'missing attempt refused');
      ctx.expectRequests(before, 'invalid completions make no request');

      const board = await ctx.call('GetCommunityGoalLeaderboard', GOAL_ID);
      ctx.check(lastRequest(ctx).url.endsWith(`/CommunityGoal/goal/${GOAL_ID}/leaderboard?page=1&limit=20`), 'leaderboard defaults');
      ctx.check(board.Items.length === 2 && board.Items[1].Name === null && board.Me.Place === 4 && board.Around.length === 3, 'leaderboard mapped');
      ctx.check(board.Items[0].Best === 1050000 && board.Me.Best === 750000 && board.Around[2].Best === 750000, 'leaderboard rows carry the best strike');
      ctx.check(board.Items[0].BestStrikeId === GOAL_STRIKE_ID && board.Items[1].BestStrikeId === null, 'rows name the best strike');
      const strike = await ctx.call('GetCommunityGoalStrike', GOAL_ID, GOAL_STRIKE_ID);
      ctx.check(lastRequest(ctx).url === `${API}/CommunityGoal/goal/${GOAL_ID}/strike/${GOAL_STRIKE_ID}` && lastRequest(ctx).headers.Authorization === `Bearer ${JWT}`, 'strike url');
      ctx.check(strike.Accepted === 1050000 && strike.StrikeData === '{"build":["gauss","gauss"],"seed":42}' && strike.Name === 'Rival' && !strike.IsMe, 'strike mapped, data byte for byte');
      ctx.route(`GET /CommunityGoal/goal/${GOAL_ID}/strike/${GOAL_STRIKE_ID}`, json({ StrikeId: GOAL_STRIKE_ID, GoalId: GOAL_ID, Accepted: 5, CompletedAt: '2026-11-16T09:30:00Z' }));
      const bare = await ctx.call('GetCommunityGoalStrike', GOAL_ID, GOAL_STRIKE_ID);
      ctx.check(bare.Name === null && bare.AvatarUrl === null && bare.StrikeData === null, 'missing strike fields become null');
      await ctx.call('GetCommunityGoalLeaderboard', GOAL_ID, 3, 50);
      ctx.check(lastRequest(ctx).url.endsWith('?page=3&limit=50'), 'leaderboard paging');

      // A settled goal: the player's bracket, its reward status and what it paid.
      ctx.route(`GET /CommunityGoal/goal/${GOAL_ID}`, json(COMMUNITY_GOAL_SETTLED));
      const settledGoal = await ctx.call('GetCommunityGoalById', GOAL_ID);
      const [paid, waiting] = settledGoal.Me.Rewards;
      ctx.check(settledGoal.Goal.ClosedBy.Name === 'Ace' && settledGoal.Goal.ClosedBy.Accepted === 2833 && settledGoal.Goal.ClosedBy.AvatarUrl === null && settledGoal.Goal.StrikeCount === 4210,
        'settled goal: last hit and strike count');
      ctx.check(settledGoal.Goal.Status === 'Settled' && settledGoal.Me.Bracket === 'place1' && settledGoal.Me.RewardStatus === 'Delivered' && settledGoal.Me.Rewards.length === 2,
        'settled goal: bracket, reward status, rewards');
      ctx.check(paid.Source === 'CommunityGoal' && paid.Items[0].Name === 'Plasma Core' && paid.Items[0].ImageUrl === null && paid.DeliveredAt === '2026-11-16T20:11:02Z',
        'a paid reward mapped like GetRecentRewards');
      ctx.check(waiting.Source === '' && waiting.RunId === '' && waiting.Key === '' && waiting.Items.length === 0 && waiting.DeliveredAt === null, 'sparse reward: empty strings and []');

      // History: past goals with the player's part.
      const history = await ctx.call('GetCommunityGoalHistory', GOAL_CHAIN_KEY);
      ctx.check(lastRequest(ctx).url === `${API}/CommunityGoal/world-boss/history?page=1&limit=10` && lastRequest(ctx).headers.Authorization === `Bearer ${JWT}`,
        'history url and defaults, with the token');
      ctx.check(history.Items.length === 2 && history.HasMore && history.Total === 3 && history.Items[0].Me.RewardStatus === null && history.Items[0].Me.FinalPlace === null,
        'history mapped');
      ctx.check(history.Items[1].Me.Share === 0.88 && history.Items[1].Me.Best === 1500000 && history.Items[1].LifetimeSeconds === 43200 && history.Items[1].Me.RewardStatus === 'Delivered',
        'history entry: share, best, lifetime, reward status');
      ctx.check(history.Items[0].ClosedBy === null && history.Items[1].ClosedBy.IsMe && history.Items[1].StrikeCount === 4210, 'history: last hit and strike count');
      ctx.route('GET /CommunityGoal/key%20with%20spaces%2F%26/history', json({ Items: [], Total: 0, Page: 2, Limit: 5, HasMore: false }));
      await ctx.call('GetCommunityGoalHistory', 'key with spaces/&', 2, 5);
      ctx.check(lastRequest(ctx).url.endsWith('/CommunityGoal/key%20with%20spaces%2F%26/history?page=2&limit=5'), 'history paging, chain key encoded');
      ctx.route(`GET /CommunityGoal/${GOAL_CHAIN_KEY}/history`, json({
        Items: [{ GoalId: GOAL_ID, Number: 3, Name: 'Warden', Status: 'Closed', TargetValue: 1, CurrentValue: 1, OpenedAt: '2026-11-16T08:00:00Z',
          LifetimeSeconds: 0, ContributorCount: 1, PayloadJson: '{}', Me: { IsContributor: true, Score: 1, Contributed: 1, Best: 1, Attempts: 1, Share: 1 } },
        { GoalId: NEXT_GOAL_ID, Number: 2, Name: 'Hydra', Status: 'Settled', TargetValue: 1, CurrentValue: 1, OpenedAt: '2026-11-15T08:00:00Z',
          LifetimeSeconds: 0, ContributorCount: 0, PayloadJson: '{}', Me: null }],
        Total: 2, Page: 1, Limit: 10, HasMore: false,
      }));
      const sparseHistory = await ctx.call('GetCommunityGoalHistory', GOAL_CHAIN_KEY);
      const [h1, h2] = sparseHistory.Items;
      ctx.check(h1.StrikeCount === 0 && h1.ClosedBy === null, 'missing history strike fields become 0/null');
      ctx.check(h1.ClosedAt === null && h1.Me.FinalPlace === null && h1.Me.Bracket === null && h1.Me.RewardStatus === null && h2.Me === null,
        'missing history fields become null');
      ctx.route(`GET /CommunityGoal/${GOAL_CHAIN_KEY}/history`, json({ Total: 0, Page: 1, Limit: 10, HasMore: false }));
      ctx.check((await ctx.call('GetCommunityGoalHistory', GOAL_CHAIN_KEY)).Items.length === 0, 'missing history list becomes []');

      // Watch: the first poll fires at once and reports; stop() ends it before any timer runs.
      const seen = [];
      const watch = await ctx.step('WatchCommunityGoal', () => {
        let resolveFirst;
        const first = new Promise(resolve => { resolveFirst = resolve; });
        const handle = ctx.sdk.WatchCommunityGoal(GOAL_ID, liveState => { seen.push(liveState.CurrentValue); resolveFirst(); });
        return first.then(() => { handle.stop(); return seen.slice(); });
      });
      ctx.check(watch.length === 1 && watch[0] === 701500, 'watch reported the first state');
      ctx.check(lastRequest(ctx).url.endsWith(`/CommunityGoal/goal/${GOAL_ID}/live`), 'watch polls the live endpoint');

      const settled = await ctx.step('WatchCommunityGoal settled', () => new Promise(resolve => {
        ctx.route(`GET /CommunityGoal/goal/${GOAL_ID}/live`, json({ ...COMMUNITY_GOAL_LIVE, Status: 'Settled', NextGoalId: NEXT_GOAL_ID }));
        ctx.sdk.WatchCommunityGoal(GOAL_ID, liveState => resolve(liveState.Status));
      }));
      ctx.check(settled === 'Settled', 'a settled goal is reported, then the watch stops by itself');

      const failures = [
        ['POST /CommunityGoal/attempt/start', 'StartGoalAttempt', [GOAL_ID],
          json({ Error: 'GoalClosed', Message: 'Closed', NextGoalId: NEXT_GOAL_ID, ResetsAt: null }, 400), mod.CommunityGoalErrorCode.GoalClosed],
        ['POST /CommunityGoal/attempt/start', 'StartGoalAttempt', [GOAL_ID],
          json({ Error: 'NoAttemptsLeft', Message: 'Used', ResetsAt: '2026-11-17T00:00:00Z' }, 400), mod.CommunityGoalErrorCode.NoAttemptsLeft],
        ['POST /CommunityGoal/attempt/complete', 'CompleteGoalAttempt', [GOAL_ATTEMPT, 1],
          json({ Error: 'CompletionTooFast', Message: 'Too fast' }, 400), mod.CommunityGoalErrorCode.CompletionTooFast],
        ['POST /CommunityGoal/attempt/complete', 'CompleteGoalAttempt', [GOAL_ATTEMPT, 1],
          json({ Error: 'AttemptExpired', Message: 'Expired' }, 400), mod.CommunityGoalErrorCode.AttemptExpired],
        [`GET /CommunityGoal/${GOAL_CHAIN_KEY}`, 'GetCommunityGoal', [GOAL_CHAIN_KEY],
          json({ Error: 'ChainNotFound', Message: 'No chain' }, 400), mod.CommunityGoalErrorCode.ChainNotFound],
        [`GET /CommunityGoal/goal/${GOAL_ID}/live`, 'GetCommunityGoalLive', [GOAL_ID],
          json({ Error: 'BrandNewCode', Message: 'Future' }, 400), mod.CommunityGoalErrorCode.Unknown],
        [`GET /CommunityGoal/goal/${GOAL_ID}/leaderboard`, 'GetCommunityGoalLeaderboard', [GOAL_ID], text('Bad Gateway', 502), mod.CommunityGoalErrorCode.Unknown],
        ['POST /CommunityGoal/attempt/start', 'StartGoalAttempt', [GOAL_ID, { startData: 'x' }],
          json({ Error: 'DataTooLarge', Message: 'Too long' }, 400), mod.CommunityGoalErrorCode.DataTooLarge],
        [`GET /CommunityGoal/goal/${GOAL_ID}/strike/${GOAL_STRIKE_ID}`, 'GetCommunityGoalStrike', [GOAL_ID, GOAL_STRIKE_ID],
          json({ Error: 'StrikeNotFound', Message: 'Gone' }, 400), mod.CommunityGoalErrorCode.StrikeNotFound],
        [`GET /CommunityGoal/${GOAL_CHAIN_KEY}/history`, 'GetCommunityGoalHistory', [GOAL_CHAIN_KEY],
          json({ Error: 'ChainNotFound', Message: 'No chain' }, 400), mod.CommunityGoalErrorCode.ChainNotFound],
      ];
      for (const [route, method, args, failure, code] of failures) {
        ctx.route(route, failure);
        await ctx.call(method, ...args);
        ctx.check(ctx.lastError()?.isCommunityGoalError === true && ctx.lastError()?.code === code, `${method}: ${code}`);
      }
      ctx.route('POST /CommunityGoal/attempt/start', json({ Error: 'GoalClosed', Message: 'Closed', NextGoalId: NEXT_GOAL_ID }, 400));
      await ctx.call('StartGoalAttempt', GOAL_ID);
      ctx.check(ctx.lastError()?.nextGoalId === NEXT_GOAL_ID, 'GoalClosed carries NextGoalId');
      ctx.route('POST /CommunityGoal/attempt/start', json({ Error: 'NoAttemptsLeft', Message: 'Used', ResetsAt: '2026-11-17T00:00:00Z' }, 400));
      await ctx.call('StartGoalAttempt', GOAL_ID);
      ctx.check(ctx.lastError()?.resetsAt === '2026-11-17T00:00:00Z' && ctx.lastError()?.nextGoalId === null, 'NoAttemptsLeft carries ResetsAt');

      ctx.route(`GET /CommunityGoal/${GOAL_CHAIN_KEY}`, json({ Chain: { Key: GOAL_CHAIN_KEY, Milestones: null }, Goal: null, AwaitingNext: true, Me: null, PollAfterSeconds: 5 }));
      const awaiting = await ctx.call('GetCommunityGoal', GOAL_CHAIN_KEY);
      ctx.check(awaiting.Goal === null && awaiting.AwaitingNext && awaiting.Chain.Milestones.length === 0, 'chain awaiting its next goal');
      ctx.route('POST /CommunityGoal/attempt/start', json({
        ...GOAL_ATTEMPT_START, Resumed: true,
        Attempt: { ...GOAL_ATTEMPT, MilestonesAtStart: null },
        Goal: communityGoal({ MilestonesPassed: null, NextGoalId: null }),
      }));
      const resumed = await ctx.call('StartGoalAttempt', GOAL_ID);
      ctx.check(resumed.Resumed && resumed.Goal.MilestonesPassed.length === 0 && resumed.Attempt.MilestonesAtStart.length === 0, 'resumed attempt mapped, null lists become []');
      ctx.check(resumed.Attempt.StartData === '{"ship":"nova7"}' && resumed.Goal.StrikeCount === 128, 'resumed attempt keeps its StartData');
      ctx.route(`GET /CommunityGoal/${GOAL_CHAIN_KEY}`, json({
        Chain: { Key: GOAL_CHAIN_KEY, Milestones: [0.5] }, Goal: communityGoal(), AwaitingNext: false, PollAfterSeconds: 5,
        Me: { IsContributor: false, Score: 0, Place: null, Contributed: 0, Attempts: 0, AttemptsUsedToday: 1, AttemptsLeftToday: 2,
          ResetsAt: '2026-11-17T00:00:00Z', OpenAttempt: { ...GOAL_ATTEMPT, MilestonesAtStart: null } },
      }));
      const withOpen = await ctx.call('GetCommunityGoal', GOAL_CHAIN_KEY);
      ctx.check(withOpen.Me.OpenAttempt.GoalValueAtStart === 700000 && withOpen.Me.OpenAttempt.MilestonesAtStart.length === 0 && withOpen.Me.FinalPlace === null, 'open attempt in Me mapped');
      ctx.check(withOpen.Me.Best === 0 && withOpen.Me.RewardStatus === null && withOpen.Me.Rewards.length === 0, 'missing Me best/reward fields become 0/null/[]');
      ctx.route(`GET /CommunityGoal/${GOAL_CHAIN_KEY}`, json({ Chain: { Key: GOAL_CHAIN_KEY }, Goal: communityGoal({ Rewards: null }), AwaitingNext: false, Me: null, PollAfterSeconds: 5 }));
      ctx.check((await ctx.call('GetCommunityGoal', GOAL_CHAIN_KEY)).Goal.Rewards.length === 0, 'missing brackets become []');
      ctx.route('POST /CommunityGoal/attempt/complete', json({ AttemptId: GOAL_ATTEMPT_ID, GoalId: GOAL_ID, Replayed: true, Accepted: 0 }));
      const sparse = await ctx.call('CompleteGoalAttempt', GOAL_ATTEMPT, 0);
      ctx.check(sparse.Replayed && sparse.MilestonesCrossed.length === 0 && sparse.NextGoalId === null && sparse.Place === null, 'missing result fields become []/null');
      ctx.check(sparse.Best === 0 && sparse.IsNewBest === false, 'missing best fields become 0/false');
      ctx.route(`GET /CommunityGoal/goal/${GOAL_ID}/leaderboard`, json({ GoalId: GOAL_ID, Total: 0, Page: 1, Limit: 20, HasMore: false }));
      const emptyBoard = await ctx.call('GetCommunityGoalLeaderboard', GOAL_ID);
      ctx.check(emptyBoard.Items.length === 0 && emptyBoard.Around.length === 0 && emptyBoard.Me === null, 'missing leaderboard lists become []/null');
      ctx.route(`GET /CommunityGoal/goal/${GOAL_ID}/leaderboard`, json({ GoalId: GOAL_ID, Items: [{ Place: 1, Name: 'Old', Score: 5 }], Total: 1, Page: 1, Limit: 20, HasMore: false }));
      const oldRow = (await ctx.call('GetCommunityGoalLeaderboard', GOAL_ID)).Items[0];
      ctx.check(oldRow.Best === 0 && oldRow.BestStrikeId === null, 'a row without Best reads 0, without BestStrikeId null');
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
