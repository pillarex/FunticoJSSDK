// Canned server responses, shaped exactly like the Wire* interfaces in FunticoPhaserSDK.ts
// (snake_case room configs inside PascalCase envelopes, PascalCase prizes, camelCase Hall of Fame,
// the `Plaftorfm_Guid` typo, ...). All values are synthetic.
//
// They exercise the main mapping paths: voucher matching (eligible / not / null tier / spent
// voucher with count 0), pre-paid flags, free / currency / item / null tickets, external room
// pricing, prize maths (pool share with and without Percentage, per player, GameManagedReward = 0,
// null platform fee), leaderboard joins against the platform host, voucher-paid fee substitution,
// tournament aliasing, campaign status/star-rule parsing, and encrypted saved sessions.
// They do NOT reach every null/absent fallback or boundary in the core (e.g. every missing
// envelope, exact cache-TTL edges for each getter, metric-count limits): T2 proves that the
// generated builds behave like the source, not that the core's own edge cases are all covered.
import { json, text } from '../helpers/harness.mjs';
import { serverEncrypt, serverHmac, sessionKey } from '../helpers/crypto-oracle.mjs';

// ---- identity / config (synthetic) ------------------------------------------------------------

export const PUB = '11111111-2222-3333-4444-555555555555';
export const PRIV = 'TestPrivKey0123456789abcdefABCDEF';
export const API = 'https://rooms-api.test.invalid';
export const PLATFORM = 'https://platform-api.test.invalid';
export const PLATFORM_TOKEN = 'synthetic-platform-token';
export const JWT = 'synthetic.jwt.token';

export const USER_ID = 4242;       // SDK user id (UserData.UserId)
export const PLATFORM_ID = 1058;   // Funtico platform id
export const RIVAL_ID = 2077;

export function config(mod, extra = {}) {
  return {
    env: mod.FunticoEnvironment.STAGING,
    publicGameKey: PUB,
    privateGameKey: PRIV,
    apiBaseUrl: API,
    funticoApiBaseUrl: PLATFORM,
    ...extra,
  };
}

// ---- user -------------------------------------------------------------------------------------

export const USER = {
  Name: 'player_test', UserId: USER_ID, PlatformId: PLATFORM_ID, Level: 7, Rating: 1200,
  Experience: 350, ExperienceToLevel: 500, Coins: 1500, Diamonds: 300, SemiFinalTickets: 2,
  FinalTickets: 1, PrivateTickets: 0, KYCVerified: false, SoundsValue: 0.8, MusicValue: 0.5,
};

export const BALANCE = {
  Coins: 1500, Diamonds: 300, SemiFinalTickets: 2, FinalTickets: 1, PrivateTickets: 0, KYCVerified: false,
};

/** GET /User/vouchers - PascalCase envelope, snake_case entries. */
export const VOUCHERS = {
  Data: [
    { item_id: 9001, item_name: 'Contender Voucher', item_image: 'https://cdn.test.invalid/v-contender.png',
      tier: 0, play_count: 3, plays_required_to_activate: 3, count: 2 },
    { item_id: 9002, item_name: 'Challenger Voucher', item_image: 'https://cdn.test.invalid/v-challenger.png',
      tier: 1, play_count: 1, plays_required_to_activate: 5, count: 1 },
  ],
};

// ---- rooms ------------------------------------------------------------------------------------

export const TIERS = {
  data: [
    { name: 'Contender', image: 'https://cdn.test.invalid/t0.png', tier: 0, lowerBoundEntryFee: 0, upperBoundEntryFee: 250, hidden: false },
    { name: 'Challenger', image: 'https://cdn.test.invalid/t1.png', tier: 1, lowerBoundEntryFee: 251, upperBoundEntryFee: 1000, hidden: true },
  ],
};

const ITEM_GIFT = { id: 2521, image: 'https://cdn.test.invalid/gift.png', name: 'Gift Box' };

function roomConfig(overrides) {
  const base = {
    id: 'room-0000',
    type: 'singleplayer',
    version: 3,
    game_id: '304',
    size: 5,
    ticket: { type: 1, currency_amount: 250, item_id: null, item: null },
    prize_pool: { gpp: null, platform_fee: { type: 'platform_fee', value: 20, burn_percentage: 0 }, game_managed: null },
    leaderboard: { field: 'points', placement_mode: 'descending', type: 'local', claim_limit: 0, attempts: null, fn: null },
    prize_distribution: [],
    computed: { deposit_stake: 1250, stake: 1250, platform_fee: 250, burn: 0, platform_fee_per_ticket: 50 },
    details: {
      name: 'Room', description: 'A room', tier: 0, has_password: false, map_id: 1,
      cover_image: 'https://cdn.test.invalid/cover.png', terms_and_conditions: '', is_leaderboard_locked: false,
      is_play_button_visible: true, prize_pool_label: '1,000 TICO',
    },
    item_ids: [],
    reward_ids: [],
    matchmaking_configuration_name: 'default',
    updated_at: 1790000000000,
    settings: { Id: 0, IsActive: false, Settings: null },
  };
  return {
    ...base,
    ...overrides,
    details: { ...base.details, ...(overrides.details || {}) },
    computed: { ...base.computed, ...(overrides.computed || {}) },
  };
}

/** Currency room, Contender tier (voucher-eligible), 3 paid places incl. a GameManagedReward (worth 0). */
export const ROOM_A = roomConfig({
  id: 'room-aaaa-0001',
  details: { name: 'Bronze Arena', description: 'Five players, top three paid', tier: 0, has_password: false },
  prize_distribution: [
    { place: 1, xp: { base: 10, kyc: 12 }, prizes: [{ type: 'DepositStakePerPlayer', Currency: 1, Value: 750 }] },
    { place: 2, xp: { base: 5, kyc: 6 }, prizes: [
      { type: 'DepositStakePoolShare', Currency: 1, Value: 0, Percentage: 20 },
      { type: 'Reward', PrizeId: 2521, Amount: 1, Item: ITEM_GIFT },
    ] },
    { place: 3, xp: null, prizes: [{ type: 'GameManagedReward', Currency: 1, Value: 99 }] },
  ],
});

/** External free room, Champion tier, null optionals (size/description/has_password). Pre-paid. */
export const ROOM_B = roomConfig({
  id: 'room-bbbb-0002',
  type: 'external',
  size: null,
  ticket: { type: 0, currency_amount: 0, item_id: null, item: null },
  computed: { deposit_stake: 4000, stake: 4000, platform_fee: 400 },
  details: { name: 'Champion Cup', description: null, tier: 2, has_password: null },
  prize_distribution: [
    { place: 1, xp: { base: 50, kyc: 60 }, prizes: [{ type: 'GppPoolShare', Currency: 2, Value: 0, Percentage: 35 }] },
    { place: null, xp: null, prizes: [{ type: 'GppPerPlayer', Currency: 2, Value: 15 }] },
  ],
});

/** Multiplayer room with a null tier, an item ticket and a null prize_distribution. */
export const ROOM_C = roomConfig({
  id: 'room-cccc-0003',
  type: 'multiplayer',
  size: 2,
  ticket: { type: 2, currency_amount: 1, item_id: 9001, item: { id: 9001, image: 'https://cdn.test.invalid/v-contender.png', name: 'Contender Voucher' } },
  details: { name: 'Mystery Duel', description: '', tier: null, has_password: true },
  prize_distribution: null,
});

/**
 * Edge room (served only for roomType=4 and by id): null ticket type and amount, a voucher-eligible
 * tier, a DepositStakePoolShare prize WITHOUT a Percentage key, and a null platform-fee value.
 */
export const ROOM_D = roomConfig({
  id: 'room-dddd-0004',
  ticket: { type: null, currency_amount: null, item_id: null, item: null },
  prize_pool: { gpp: null, platform_fee: { type: 'platform_fee', value: null, burn_percentage: 0 }, game_managed: null },
  details: { name: 'Edge Room', description: 'Null ticket, no percentage', tier: 0, has_password: false },
  prize_distribution: [
    { place: 1, xp: { base: 1, kyc: 2 }, prizes: [{ type: 'DepositStakePoolShare', Currency: 1, Value: 0 }] },
  ],
});

/** A matching (tier 0) voucher that is already activated but has none left (count 0). */
export const VOUCHERS_SPENT = {
  Data: [
    { item_id: 9001, item_name: 'Contender Voucher', item_image: 'https://cdn.test.invalid/v-contender.png',
      tier: 0, play_count: 5, plays_required_to_activate: 3, count: 0 },
  ],
};

export const ROOMS_BY_ID = { [ROOM_A.id]: ROOM_A, [ROOM_B.id]: ROOM_B, [ROOM_C.id]: ROOM_C, [ROOM_D.id]: ROOM_D };

export const PREPAID = {
  data: [
    { id: ROOM_B.id, attempts_left: 1, participation_id: 'part-0001', game_session_id: null, community_id: null, voucher_used: false },
    { id: 'room-gone-0404', attempts_left: 2, participation_id: 'part-0002', game_session_id: 'sess-old-0001', community_id: null, voucher_used: true },
  ],
};

export const ROOMS_HISTORY = {
  data: [{ id: 'sess-0001', event_id: ROOM_A.id, score: 1234, place: 1 }],
  cursor: null,
};

export function gameSession(overrides = {}) {
  return {
    id: 'sess-0001', registered_at: '2026-09-29T11:00:00Z', started_at: '2026-09-29T11:01:00Z',
    match_id: null, score: 1234, scored_at: '2026-09-29T11:05:00Z', distributed_at: null, match_type: 0,
    game_id: '304', user_id: String(PLATFORM_ID), event_id: ROOM_A.id, leader: null, opponent_name: null,
    return_requested_at: null, returned_at: null, voucher_used: true,
    ...overrides,
  };
}

export const LEADERS = {
  state: 0,
  leaders: [
    { id: PLATFORM_ID, score: 1234, place: 1, prizes: [], finish_reason: 0, FinishReason: 0 },
    { id: RIVAL_ID, score: 900, place: 2, prizes: [], finish_reason: 0, FinishReason: 0 },
    { id: 3001, score: 10, place: 3, prizes: [], finish_reason: 3, FinishReason: 3 },
  ],
  items: [],
  match_id: null,
};

export const PLATFORM_USERS = [
  { id: PLATFORM_ID, name: 'player_test', avatar: { url: 'https://cdn.test.invalid/a1.png', type: 'static' }, border: { url: 'https://cdn.test.invalid/b1.png', type: 'static' } },
  { id: RIVAL_ID, name: 'rival_one', avatar: null, border: null },
];

// ---- special tournaments ----------------------------------------------------------------------

function tournament(guid, name) {
  return {
    Id: 0, Plaftorfm_Guid: guid, Name: name, Description: 'Weekly high score', EntryFee: 100,
    EntryFeeType: 2, EntryFeeItemId: null, EntryFeeItemName: null, EntryFeeItemImage: null,
    StartDate: '2026-09-28T00:00:00Z', EndDate: null, LeftSeconds: 3600, PlayerLimit: null,
    EntryLimit: 5, HavePassword: false, PrizePoolLabel: '500 TICO', GuaranteedPrizePoolUsd: 25,
    Gpp: null, GppLabel: null, ScoreMode: 'Best', ScoreType: 'Points', IsKycRequired: false,
    Settings: null, PracticeStartTime: null, PracticeEndTime: null, MinPlayerLevel: 1,
    MaxPlayerLevel: 99, SpecialTournamentsType: 0, FutureField: { nested: true },
  };
}

export const TOURNAMENT_ID = 'tour-aaaa-0001';
export const TOURNAMENTS = [tournament(TOURNAMENT_ID, 'Weekly Cup'), tournament('tour-bbbb-0002', 'Monthly Masters')];
export const TOURNAMENT_LIGHT = tournament(TOURNAMENT_ID, 'Weekly Cup');

function tournamentPlayer(place, points, name, funticoId, avatar) {
  return {
    Place: place, Points: points, Name: name, FunticoId: funticoId,
    UserId: `0000${funticoId}-aaaa-bbbb-cccc-000000000000`,
    user_avatar: avatar ? { url: avatar, type: 'static', name: null, description: null } : null,
    user_border: null, TimesPlayed: 3, BestTime: 0, PlatformAvatar: null, Community: null,
  };
}

export const TOURNAMENT_LEADERBOARD = {
  ...tournament(TOURNAMENT_ID, 'Weekly Cup'),
  Players: [
    tournamentPlayer(1, 5000, 'player_test', PLATFORM_ID, 'https://cdn.test.invalid/a1.png'),
    tournamentPlayer(2, 4200, 'rival_one', RIVAL_ID, null),
  ],
  CurrentPlayer: tournamentPlayer(1, 5000, 'player_test', PLATFORM_ID, 'https://cdn.test.invalid/a1.png'),
  TotalPlayers: 2,
};

export const COMMUNITIES = [
  { Uuid: 'community-0001', Name: 'Night Owls', Description: 'Late players', MembersCount: 12 },
];

export const ENTER = { TournamentScoreUuid: 'score-uuid-0001-aaaa', LocalTournamentUUID: 'local-uuid-0001-bbbb' };

export const TOURNAMENT_PRIZES = {
  Prizes: [
    { Uuid: 'prize-0001', Name: '1st place', Type: 'place', From: 1, To: 1,
      Prizes: [{ Name: 'Gift Box', Description: null, ImageUrl: 'https://cdn.test.invalid/gift.png', Amount: 1, Value_usd: 5 }] },
    { Uuid: 'prize-0002', Name: '2nd-5th place', Type: 'range', From: 2, To: 5,
      Prizes: [{ Name: 'TICO', Description: null, ImageUrl: 'https://cdn.test.invalid/tico.png', Amount: 50, Value_usd: null }] },
  ],
};

export const TOURNAMENT_HISTORY = {
  data: [
    { tournament_name: 'Weekly Cup', tournament_uuid: TOURNAMENT_ID, starts_at: '2026-09-21T00:00:00Z',
      ends_at: '2026-09-28T00:00:00Z', scored_at: '2026-09-22T10:00:00Z', is_finished: true, best_score: 4000,
      leaderboard_place: 3, entries_count: 2, max_entries: 5, game_id: 304, map_id: 1,
      prizes: [{ name: 'Gift Box', amount: 1, image_url: 'https://cdn.test.invalid/gift.png', is_redeemed: false }] },
    { tournament_name: 'Old Cup', tournament_uuid: 'tour-old-0000', starts_at: '2026-08-01T00:00:00Z',
      ends_at: '2026-08-08T00:00:00Z', scored_at: null, is_finished: true, best_score: null,
      leaderboard_place: null, entries_count: 0, max_entries: 5, game_id: 304, map_id: 2 },
  ],
  meta: { current_page: 1, last_page: 3, per_page: 10, total: 21, from: 1, to: 10, path: '/history' },
};

export const TOURNAMENT_RESULT_SERVER = { Score: 5000, Time: 0, XpReceive: 10, IcReceive: 5 };

// ---- hall of fame (camelCase) -----------------------------------------------------------------

export const HOF = {
  leaderboard: [
    { userId: USER_ID, funticoId: PLATFORM_ID, displayName: 'player_test', avatarUrl: 'https://cdn.test.invalid/a1.png',
      avatarType: 'static', avatarBorder: null, country: 'UA', rank: 1, totalPoints: 9000, gamesPlayed: 4,
      playedAt: '2026-09-01T10:00:00Z', borderType: null },
    { userId: 4343, funticoId: RIVAL_ID, displayName: 'rival_one', avatarUrl: null, avatarType: null,
      avatarBorder: null, country: null, rank: 2, totalPoints: 8000, gamesPlayed: 9, playedAt: null, borderType: 'gold' },
  ],
  currentPlayer: null,
  totalPlayers: 2,
  page: 1,
  limit: 10,
};

export const HOF_DISTRIBUTION = {
  items: [
    { place: 1, prizes: [{ type: 'Item', ItemId: 9001, Amount: 1, Item: { id: 9001, image: 'https://cdn.test.invalid/v.png', name: 'Voucher' } }] },
    { place: 11, endPlace: 20, range: '11-20', prizes: [{ type: 'GppPerPlayer', Currency: 2, Value: 10 }] },
  ],
};

// ---- campaign (PascalCase) --------------------------------------------------------------------

export const CAMPAIGN_AVAILABILITY = { IsAvailable: true, LevelCount: 4, MaxStars: 12 };

const STAR_RULES = JSON.stringify({
  Win: [{ Metric: 'score', Op: '>=', Value: 100 }],
  Stars: [
    { Star: 1, Conditions: [{ Metric: 'score', Op: '>=', Value: 100 }] },
    { Star: 2, Conditions: [{ Metric: 'score', Op: '>=', Value: 500 }] },
    { Star: 3, Conditions: [{ Metric: 'score', Op: '>=', Value: 1000 }, { Metric: 'deaths', Op: '==', Value: 0 }] },
  ],
});

function reward(type, amount, requiredStars, extra = {}) {
  return { Type: type, Amount: amount, ItemId: null, RequiredStars: requiredStars, Name: null, ImageUrl: null, ...extra };
}

export const CAMPAIGN_LEVELS = {
  IsAvailable: true, TotalLevels: 4, CompletedLevels: 1, TotalStarsEarned: 2, MaxStars: 12,
  Levels: [
    { LevelId: 'level-0001', Order: 1, Name: 'Meadow', Description: 'Tutorial', Status: 2, BestStars: 2,
      BestMetrics: { score: 640, deaths: 1 }, LevelJsonData: JSON.stringify({ enemies: 3, timeLimit: 60 }),
      StarRulesJson: STAR_RULES, MinDurationSeconds: 10, ConfigVersion: 2,
      Rewards: [reward('Coins', 100, 1), reward('Item', 1, 3, { ItemId: 9001, Name: 'Voucher', ImageUrl: 'https://cdn.test.invalid/v.png' })],
      CompletedAt: '2026-09-20T08:00:00Z' },
    { LevelId: 'level-0002', Order: 2, Name: 'Swamp', Description: null, Status: 1, BestStars: 0,
      BestMetrics: null, LevelJsonData: '{"enemies": 5,', StarRulesJson: 'definitely not json',
      MinDurationSeconds: 15, ConfigVersion: 1, Rewards: [], CompletedAt: null },
    { LevelId: 'level-0003', Order: 3, Name: 'Cave', Description: null, Status: 0, BestStars: 0,
      BestMetrics: null, LevelJsonData: null, StarRulesJson: null, MinDurationSeconds: 20, ConfigVersion: 1,
      Rewards: [reward('Tico', 5, 1)], CompletedAt: null },
    { LevelId: 'level-0004', Order: 4, Name: 'Peak', Description: 'Finale', Status: 1, BestStars: 0,
      BestMetrics: {}, LevelJsonData: '[]', StarRulesJson: '42', MinDurationSeconds: 30, ConfigVersion: 4,
      Rewards: null, CompletedAt: null },
  ],
};

export const CAMPAIGN_COMPLETION = {
  IsWin: true, Stars: 3, BestStars: 3, IsNewBest: true, LevelCompletedFirstTime: true,
  UnlockedLevelId: 'level-0003', Rewards: [reward('Coins', 100, 1), reward('Tico', 2, 3)], RewardsGranted: true,
  TotalLevels: 5, CompletedLevels: 2, TotalStarsEarned: 5, MaxStars: 15,
};

export function campaignStart(levelId, n = 1) {
  return {
    AttemptId: `attempt-${String(n).padStart(4, '0')}-${levelId}`,
    LevelId: levelId,
    ConfigVersion: 2,
    StartedAt: '2026-09-29T12:00:00Z',
  };
}

// ---- saved sessions (encrypted with the backend scheme) ---------------------------------------

export const SAVED_STATE = JSON.stringify({ level: 3, hp: 72, inventory: ['sword', 'potion'], note: 'Привіт' });
export const SAVED_EVENT_ID = ROOM_A.id;
const SAVED_DATA = serverEncrypt(SAVED_STATE, sessionKey(USER_ID, PRIV));

export const SAVED_SESSION = {
  Id: 'db-session-0001', SessionId: SAVED_EVENT_ID, SaveSessionId: 'sess-0001', GameType: 4,
  ReconnectTime: 120, Data: SAVED_DATA, Hash: serverHmac(SAVED_DATA, SAVED_EVENT_ID),
};

// ---- default routes ---------------------------------------------------------------------------

/** Per-key default responders; scenarios override individual keys with ctx.route(). */
export function defaultRoutes() {
  return {
    'POST /Auth/funtico-auth': req => req.json && req.json.Token === PLATFORM_TOKEN
      ? json({ Token: JWT, UserId: USER_ID })
      : text('Invalid platform token', 401),

    'GET /User/get-full-data': json(USER),
    'GET /User/get-balance': json(BALANCE),
    'GET /User/vouchers': json(VOUCHERS),

    'GET /Rooms/tiers': json(TIERS),
    'GET /Rooms/get-rooms': req => {
      const roomType = req.url.searchParams.get('roomType');
      if (roomType === '0') return json({ Data: [ROOM_A, ROOM_B, ROOM_C], Cursor: 'cursor-0001' });
      if (roomType === '1') return json({ Data: [ROOM_C], Cursor: null });
      if (roomType === '2') return json({ Data: [], Cursor: null });
      if (roomType === '4') return json({ Data: [ROOM_D], Cursor: null });
      return json({ Cursor: null }); // no Data key at all
    },
    'GET /Rooms/get-room': req => {
      const room = ROOMS_BY_ID[req.url.searchParams.get('roomId')];
      return room ? json(room) : text('Room not found', 404);
    },
    'GET /Rooms/get-room-public': req => {
      const room = ROOMS_BY_ID[req.url.searchParams.get('id')];
      return room ? json(room) : text('Room not found', 404);
    },
    'GET /Rooms/game-settings': json({ difficulty: 'hard', seed: 7, modifiers: ['fog'] }),
    'GET /Rooms/pre-paid': json(PREPAID),
    'GET /Rooms/history': json(ROOMS_HISTORY),
    'GET /Rooms/get-history': req => req.url.searchParams.get('withEvent') === 'true'
      ? json({ game_session: gameSession(), event: ROOM_A })
      : json({ game_session: gameSession() }),
    'GET /Rooms/leaders': json(LEADERS),
    'GET /api/v1/web/users': req => {
      if (!req.headers || req.headers.Authorization !== `Bearer ${PLATFORM_TOKEN}`) return text('Unauthorized', 401);
      const ids = req.url.searchParams.getAll('ids[]').map(Number);
      return json({ data: PLATFORM_USERS.filter(u => ids.includes(u.id)) });
    },
    'POST /Rooms/join-room': req => {
      const room = req.json.tournamentId;
      if (room === ROOM_B.id) return json({ id: 'join-0002', game_session_id_or_match_id: 'sess-existing-0002', lobby_quote: null });
      if (room === ROOM_C.id) return json({ id: 'join-0003', game_session_id_or_match_id: '   ', lobby_quote: null });
      if (room === 'room-full-0009') return text('Room is full', 409);
      return json({ id: 'join-0001', game_session_id_or_match_id: null, lobby_quote: { id: 'quote-0001-abcd', exp: '2026-09-29T12:05:00Z' } });
    },
    'POST /Rooms/start-room-sp': req => json({
      id: `sess-from-${req.url.searchParams.get('sessionOrMatchId')}`,
      game_session_id_or_match_id: null,
      lobby_quote: null,
    }),
    'POST /Rooms/end-room-sp': json({ Success: true, Place: 1, Reward: 750 }),

    'GET /SpecialTournaments/all-tournaments': json(TOURNAMENTS),
    'GET /SpecialTournaments/light-tournament-details': json(TOURNAMENT_LIGHT),
    'GET /SpecialTournaments/get-special-tournament-leaderboard': json(TOURNAMENT_LEADERBOARD),
    'GET /SpecialTournaments/get-tournaments-communities': json(COMMUNITIES),
    'GET /SpecialTournaments/join-tournament': text('Success, now you can play'),
    'GET /SpecialTournaments/enter-tournament': json(ENTER),
    'GET /SpecialTournaments/get-prizes': json(TOURNAMENT_PRIZES),
    'GET /SpecialTournaments/history': json(TOURNAMENT_HISTORY),
    'POST /SpecialTournaments/result-tournament': json(TOURNAMENT_RESULT_SERVER),
    'POST /SpecialTournaments/result-tournament-client': json(true),

    'GET /HallOfFame/global': json(HOF),
    'GET /HallOfFame/monthly': json({ ...HOF, currentPlayer: HOF.leaderboard[0] }),
    'GET /HallOfFame/distribution': json(HOF_DISTRIBUTION),

    'GET /Campaign/availability': json(CAMPAIGN_AVAILABILITY),
    'GET /Campaign/levels': json(CAMPAIGN_LEVELS),
    'POST /Campaign/start-level': (req, state) => {
      state.attempts = (state.attempts || 0) + 1;
      return json(campaignStart(req.url.searchParams.get('levelId'), state.attempts));
    },
    'POST /Campaign/complete-level': json(CAMPAIGN_COMPLETION),

    'GET /Session/any-unfinished-sessions': json({ SavedSessions: [SAVED_SESSION] }),
    'GET /Session/reconnect-to-session': json(SAVED_SESSION),
    'POST /Session/create-session': req => json({
      Id: 'db-session-0002', SessionId: req.json.SessionId, SaveSessionId: req.json.SaveSessionId,
      GameType: req.json.GameType, ReconnectTime: 0, Data: req.json.Data, Hash: req.json.Hash,
    }),
    'POST /Session/update-session': json(true),
    'POST /Session/create-server-session': json(true),
    'GET /Session/server-session-user-leave': json(true),
    'GET /Session/close-server-session': json(true),
    'POST /Rooms/end-room-all-users': json(true),
  };
}
