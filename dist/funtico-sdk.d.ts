/*!
 * Funtico JS SDK v1.0.0
 *
 * GENERATED FILE - do not edit by hand.
 * Source: upstream/phaser/FunticoPhaserSDK.ts (sha256 72ea9a479677) + src/FunticoClient.ts (sha256 694498b0ae72).
 * Regenerate with: npm run build
 */
/**
 * Environments supported by the Funtico SDK.
 */
export declare enum FunticoEnvironment {
    STAGING = "staging",
    PROD = "prod"
}
/**
 * Currency/Entry Fee Types matching Funtico platform definitions.
 */
export declare enum EntryFeeType {
    IC = 1,// In-game currency (Coins)
    Tico = 2,// Premium platform currency (TICO/Diamonds)
    SemifinalsTickets = 3,// Semi-final tickets
    FinalTickets = 4,// Final tickets
    Free = 5,// Free room
    InventoryItem = 6,// Requires special inventory item
    PrivateTickets = 7
}
/**
 * Room Tier Enumeration.
 */
export declare enum RoomTier {
    Contender = 0,
    Challenger = 1,
    Champion = 2,
    Free = 3
}
/**
 * Lifecycle of a room's prize settlement, as reported by `state` on GET /Rooms/leaders.
 *
 * Values match the wire exactly: `placed = 0, distributed = 1, to_be_returned = 3, returned = 4`.
 * 2 is intentionally unused - it is NOT a transcription slip, so do not "fix" the gap.
 * The response carries the number, not the name.
 */
export declare enum LeadersState {
    /** Scores are in, prizes not settled yet. Drives IsPending. */
    placed = 0,
    distributed = 1,
    to_be_returned = 3,
    returned = 4
}
/**
 * Status filter for special tournaments.
 */
export declare enum TournamentsFilterEnum {
    OnGoing = "OnGoing",
    Upcoming = "Upcoming",
    Finished = "Finished"
}
/**
 * Game Type Enumeration for Reconnection and Sessions.
 */
export declare enum GameTypeEnum {
    Indirect_PVP = 0,
    Direct_PVP = 1,
    Tournament = 3,
    Rooms = 4,
    Practice = 5,
    MultiplayerPvp = 6
}
/**
 * Player gameplay presence status on dedicated server.
 */
export declare enum UserGameStatus {
    Leave = 0,
    InGame = 1,
    Finished = 2
}
/**
 * Hall of Fame ranking period.
 */
export declare enum HallOfFamePeriodMode {
    Global = 0,
    Monthly = 1
}
/**
 * Game mode filter for Hall of Fame rankings. Use this in game code.
 */
export declare enum HallOfFameGameModeFilter {
    All = 0,// No filter - ranks across every mode
    SpecialTournament = 1,
    Rooms = 2,
    Practice = 3
}
/**
 * Wire `gameMode` query values for the /HallOfFame endpoints.
 * Deliberately offset by one from HallOfFameGameModeFilter, which has no `All` equivalent.
 * Wire-level detail - prefer HallOfFameGameModeFilter.
 */
export declare enum HallOfFameGameMode {
    SpecialTournament = 0,
    Rooms = 1,
    Practice = 2
}
/**
 * Prize types, as they appear in the `type` field of prize objects.
 */
export declare enum PrizeType {
    Item = "Item",
    DepositStakePoolShare = "DepositStakePoolShare",
    DepositStakePerPlayer = "DepositStakePerPlayer",
    GppPoolShare = "GppPoolShare",
    GppPerPlayer = "GppPerPlayer",
    External = "External",
    Placeholder = "Placeholder",
    Reward = "Reward",
    GameManagedReward = "GameManagedReward"
}
/**
 * Platform Item Prize structure.
 */
export interface PlatformItemPrize {
    id: number;
    image: string;
    name: string;
}
/**
 * Base type for Funtico Prizes.
 */
export interface BasePrize {
    type: PrizeType;
}
/**
 * Manual Prize (External or Placeholder).
 */
export interface ManualPrize extends BasePrize {
    type: PrizeType.External | PrizeType.Placeholder;
    Id: number;
    ValueUsd?: number;
    ImageUrl: string;
    Name: string;
    Description: string;
    Chain: string;
    ContractAddress: string;
    ExplorerUrl: string;
    WalletAddress: string;
    TokenId?: number;
}
/**
 * Automated prize containing an item and amount.
 */
export interface PrizeWithAmountAndItem extends BasePrize {
    Amount: number;
    Item?: PlatformItemPrize;
}
/**
 * Automated Item Prize.
 */
export interface ItemAutomatedPrize extends PrizeWithAmountAndItem {
    type: PrizeType.Item;
    ItemId: number;
}
/**
 * Automated Reward Prize.
 */
export interface RewardAutomatedPrize extends PrizeWithAmountAndItem {
    type: PrizeType.Reward;
    PrizeId: number;
}
/**
 * Automated Stake Pool or Per-Player Deposit Prize.
 */
export interface DepositStakeAutomatedPrize extends BasePrize {
    type: PrizeType.DepositStakePoolShare | PrizeType.DepositStakePerPlayer;
    Currency: number;
    Value: number;
    Percentage?: number;
}
/**
 * GPP Pool Share or Per-Player Prize.
 */
export interface GppAutomatedPrize extends BasePrize {
    type: PrizeType.GppPoolShare | PrizeType.GppPerPlayer | PrizeType.GameManagedReward;
    Currency: number;
    Value: number;
    Percentage?: number;
}
/**
 * Discriminated union of all Funtico Prize variations.
 *
 * THE MIXED CASING IS CORRECT - DO NOT "FIX" IT.
 * Prize objects arrive with a lowercase `type` key and every other field in PascalCase: `Value`,
 * `Currency`, `PrizeId`, `Amount`, `ImageUrl` etc. The nested `Item` is the one exception and stays
 * lowercase (`PlatformItemPrize`: id/image/name).
 * Null-valued fields are omitted entirely, hence the optional markers.
 *
 * Example, from `room.prize_distribution[].prizes[]`:
 *   {"type":"DepositStakePerPlayer","Currency":1,"Value":750}
 *   {"type":"Reward","PrizeId":2521,"Amount":1,"Item":{"id":2521,"image":"...","name":"Gift Box"}}
 */
export type Prize = ManualPrize | ItemAutomatedPrize | RewardAutomatedPrize | DepositStakeAutomatedPrize | GppAutomatedPrize;
/**
 * Helpers for computing the value of a prize list.
 */
export declare class PrizeUtils {
    /**
     * Calculates the calculated value of automated prizes based on the tournament deposit stake.
     */
    static calculatePrize(prizes: Prize[], depositStake: number): number;
}
/**
 * SDK Configuration interface.
 */
export interface FunticoConfig {
    env: FunticoEnvironment;
    privateGameKey: string;
    publicGameKey: string;
    userToken?: string;
    apiBaseUrl?: string;
    /**
     * Custom URL for the Funtico PLATFORM API (the host serving /api/v1/web/users).
     * This is a different host from apiBaseUrl: apiBaseUrl is the game's Rooms API and takes the
     * game JWT, while this one is the platform itself and takes the user's platform token.
     * Defaults from `env`.
     */
    funticoApiBaseUrl?: string;
    cacheTTL?: number;
    /** Not used with privateGameKey: a game that signs on its server passes FunticoSignerConfig. */
    payloadSigner?: undefined;
}
/**
 * Initialize's config for a game that keeps its secret key off the client: the fields of
 * FunticoConfig, with payloadSigner in place of privateGameKey.
 */
export interface FunticoSignerConfig extends Omit<FunticoConfig, 'privateGameKey' | 'payloadSigner'> {
    /** Signs every result and encrypts the saved session; see PayloadSigner. */
    payloadSigner: PayloadSigner;
    /** Not used with a signer: leave it out. */
    privateGameKey?: undefined;
}
/**
 * Detailed User Profile Data.
 */
export interface UserData {
    Name: string;
    UserId: number;
    PlatformId: number;
    Level: number;
    Rating: number;
    Experience: number;
    ExperienceToLevel: number;
    Coins: number;
    Diamonds: number;
    SemiFinalTickets: number;
    FinalTickets: number;
    PrivateTickets: number;
    KYCVerified: boolean;
    SoundsValue: number;
    MusicValue: number;
}
/**
 * User Balance Information.
 */
export interface BalanceResponse {
    Coins: number;
    Diamonds: number;
    SemiFinalTickets: number;
    FinalTickets: number;
    PrivateTickets: number;
    KYCVerified: boolean;
}
/**
 * Voucher Data representing free entries.
 */
export interface VoucherData {
    ItemId: number;
    ItemName: string;
    ItemImage: string;
    Tier: RoomTier;
    Count: number;
    PlayCount: number;
    PlaysRequiredToActivate: number;
}
/**
 * Tournament Tier Details.
 */
export interface TierViewModel {
    TierName: string;
    Tier: RoomTier;
    /**
     * Raw tier icon URL. The SDK does not load it; the URL is handed to the game as-is.
     */
    TierImage: string;
    EntryFeeLowerBound: number;
    EntryFeeUpperBound: number;
    Hidden: boolean;
}
/**
 * Tournament Room Details.
 */
export interface RoomViewModel {
    Guid: string;
    Name: string;
    Description?: string;
    HasPassword?: boolean;
    RoomSize?: number;
    Tier: RoomTier;
    EntryFee: number;
    EntryFeeUSDT: number;
    TotalPrize: number;
    IsFree: boolean;
    RequireKyc: boolean;
    UserCanJoinWithVoucher: boolean;
    Voucher?: VoucherData;
    IsPrePaid: boolean;
}
/**
 * One place in a room's prize table, as composed by GetPrizePoolDistribution.
 */
export interface PrizePlaceViewModel {
    Place: number;
    PlatformExp: number;
    PlatformExpKyc: number;
    /** ticoPrize / ticket.currency_amount; 0 when the room is free or the place wins no TICO. */
    RewardFeeRatio: number;
    Prizes: Prize[];
}
/**
 * A room's full prize pool breakdown.
 *
 * There is no endpoint behind this - the SDK composes it entirely client-side from the room config.
 * TicoPerPlayer and TotalTicoDistributedToPlayers are resolved at mapping time.
 */
export interface PrizePoolDistributionViewModel {
    PrizePlaces: PrizePlaceViewModel[];
    TotalTicoAccumulated: number;
    TicoSharedViaPlaces: number;
    TotalPlayers: number;
    TicoPerPlayer: number;
    PlatformFeePercentage: number;
    PlatformFee: number;
    TotalTicoDistributedToPlayers: number;
}
/**
 * One entry of GET /Rooms/pre-paid: a room the user has already paid the entry fee for.
 *
 * Snake_case, unlike the other public models, because this is a straight passthrough of the
 * response; GetRooms only ever reads `id` off it to set RoomViewModel.IsPrePaid.
 *
 * Example entry:
 *   {"id":"ca1ef3b9-...","attempts_left":1,"participation_id":"192da493-...",
 *    "game_session_id":"4be2ab2a-...","community_id":null,"voucher_used":false}
 */
export interface PrePaidRoomData {
    id: string;
    /** Remaining paid entries into this room. */
    attempts_left: number;
    participation_id: string;
    /** The already-started session, when there is one. */
    game_session_id: string | null;
    community_id: string | null;
    /** Whether the paid entry was covered by a voucher rather than currency. */
    voucher_used: boolean;
}
/**
 * Data returned when joining a room.
 */
export interface RoomSessionData {
    EventId: string;
    SessionOrMatchId: string;
}
/**
 * Leaderboard Item representation.
 */
export interface LeaderboardItemViewModel {
    Place: number;
    PlayerName: string;
    Score: number;
    UserId: number;
    AvatarUrl?: string;
}
/**
 * Room Leaderboard ViewModel.
 */
export interface RoomLeaderboardViewModel {
    /**
     * The room's settlement state as the numeric LeadersState value (the response sends the number).
     * Earlier SDK versions declared this as `string`, but it never held a value, so no working
     * consumer can depend on the old type. Compare with `State === LeadersState.placed`; for logging,
     * `LeadersState[view.State]` gives the member name.
     */
    State: LeadersState;
    IsPending: boolean;
    ClosedUnsuccessfully: boolean;
    RoomName: string;
    RoomTier: RoomTier;
    IsFree: boolean;
    YourTicoEarnings: number;
    Multiplier: number;
    UserPlace: string;
    LeaderboardItems: LeaderboardItemViewModel[];
}
/**
 * Special Tournament ViewModel.
 *
 * Unlike the Rooms models, this one needs no mapping layer: the tournament endpoints already
 * return PascalCase and the field names below match the wire as-is. The single exception is the
 * identifier - the wire calls it `Plaftorfm_Guid` (sic - that is the real field name) and also sends
 * an unrelated `Id` that is always 0. The SDK aliases the guid onto both `Id` and `Guid` so that
 * `Id` is the value every other tournament method actually accepts.
 *
 * Every wire field is preserved on the returned object, so anything the platform adds later is
 * still reachable even if it is not declared here.
 */
export interface TournamentViewModel {
    Id: string;
    Guid: string;
    Plaftorfm_Guid: string;
    Name: string;
    Description?: string;
    EntryFee?: number;
    EntryFeeType?: EntryFeeType;
    EntryFeeItemId?: number | null;
    EntryFeeItemName?: string | null;
    EntryFeeItemImage?: string | null;
    StartDate?: string;
    EndDate?: string | null;
    LeftSeconds?: number;
    PlayerLimit?: number | null;
    EntryLimit?: number;
    HavePassword?: boolean | null;
    PrizePoolLabel?: string;
    GuaranteedPrizePoolUsd?: number;
    Gpp?: number | null;
    GppLabel?: string | null;
    ScoreMode?: string;
    ScoreType?: string;
    IsKycRequired?: boolean;
    Settings?: string | null;
    PracticeStartTime?: string | null;
    PracticeEndTime?: string | null;
    MinPlayerLevel?: number;
    MaxPlayerLevel?: number;
    SpecialTournamentsType?: number;
    GameId?: number;
    MapId?: number;
    StartsAt?: string;
    EndsAt?: string;
    MaxEntries?: number;
    EntriesCount?: number;
    IsJoined?: boolean;
}
/**
 * Special Tournament Leaderboard Player.
 *
 * The wire sends `Points`/`Name`/`user_avatar.url`; `Score`, `UserName` and `AvatarUrl` are aliases
 * the SDK adds so the names below are true. Both spellings are present on the returned object.
 */
export interface TournamentPlayerViewModel {
    Place: number;
    Points: number;
    Score: number;
    Name: string;
    UserName: string;
    FunticoId: number;
    UserId: string;
    AvatarUrl?: string;
    user_avatar?: {
        url: string;
        type?: string | null;
        name?: string | null;
        description?: string | null;
    };
    user_border?: {
        url: string;
        type?: string | null;
        name?: string | null;
        description?: string | null;
    };
    TimesPlayed?: number;
    BestTime?: number;
    PlatformAvatar?: string | null;
    Community?: string | null;
}
/**
 * Special Tournament Leaderboard.
 */
export interface TournamentLeaderboardViewModel extends TournamentViewModel {
    Players: TournamentPlayerViewModel[];
    CurrentPlayer?: TournamentPlayerViewModel;
    TotalPlayers?: number;
}
/**
 * Community Group within a Tournament.
 */
export interface TournamentCommunityViewModel {
    Uuid: string;
    Name: string;
    Description: string;
    MembersCount: number;
}
/**
 * Special Tournament Enter Response.
 *
 * IMPORTANT: `TournamentScoreUuid` is the `saveScoreId` to pass to ResultTournament_Client /
 * ResultTournament_Server. `LocalTournamentUUID` is a different, internal identifier and NOT a
 * saveScoreId; the platform rejects it with 400 "The selected tournament score uuid is invalid."
 */
export interface TournamentEnterData {
    TournamentScoreUuid: string;
    LocalTournamentUUID: string;
    LocalTournamentUuid: string;
}
/**
 * Special Tournament Result confirmation.
 */
export interface TournamentResultViewModel {
    Score?: number;
    Time?: number;
    XpReceive?: number;
    IcReceive?: number;
}
/**
 * A single prize awarded at a tournament place range.
 */
export interface TournamentPrizeItemViewModel {
    Name: string;
    Description: string | null;
    ImageUrl: string;
    Amount: number;
    Value_usd: number | null;
}
/**
 * One place, or range of places, in a tournament's prize table.
 */
export interface TournamentPrizePlaceViewModel {
    Uuid: string;
    Name: string;
    Type: string;
    From: number;
    To: number;
    Prizes: TournamentPrizeItemViewModel[];
}
/**
 * Tournament prize table. Note the root is an object wrapping the list, not a bare array.
 */
export interface TournamentPrizesViewModel {
    Prizes: TournamentPrizePlaceViewModel[];
}
/**
 * Historical Tournament entry data.
 *
 * The tournament-history endpoint is the one tournament response that is snake_case on the wire
 * (`tournament_name`, `best_score`, ...). The SDK aliases each field to the PascalCase name below.
 * The raw snake_case keys are preserved on the returned objects too.
 */
export interface TournamentHistoryPrize {
    Name: string;
    Amount: number;
    ImageUrl?: string;
    IsRedeemed: boolean;
}
export interface TournamentHistoryEntry {
    TournamentName: string;
    TournamentUuid: string;
    StartsAt?: string;
    EndsAt?: string;
    ScoredAt?: string;
    IsFinished: boolean;
    BestScore?: number;
    LeaderboardPlace?: number;
    EntriesCount?: number;
    MaxEntries?: number;
    GameId?: number;
    MapId?: number;
    Prizes?: TournamentHistoryPrize[];
}
export interface TournamentHistoryViewModel {
    Entries: TournamentHistoryEntry[];
    Meta?: {
        CurrentPage: number;
        LastPage: number;
        PerPage: number;
        Total: number;
        From?: number | null;
        To?: number | null;
    };
}
/**
 * Unfinished session details.
 */
export interface SavedSessionResponse {
    Id: string;
    SessionId: string;
    SaveSessionId: string;
    GameType: number;
    ReconnectTime: number;
    Data: string;
    Hash: string;
}
export interface UnfinishedSessionsResponse {
    SavedSessions: SavedSessionResponse[];
}
/**
 * Server User representation for Dedicated Server match registration.
 */
export interface ServerUserData {
    JoinKey: string;
    FunticoUserId: number;
    SdkUserId: number;
    UserStatus: UserGameStatus;
}
/**
 * Optional overrides for CompletePractice. Each field you leave out is taken from what the run
 * recorded in the SDK.
 */
export interface CompletePracticeOptions {
    /** Send these counts instead of what RecordCollected_Client recorded. */
    collected?: Record<string, number>;
    /** Send these events instead of what RecordEvent_Client recorded. */
    gameEvents?: string[];
}
/**
 * Hall of Fame leaderboard entry.
 *
 * Fields are camelCase, unlike the rest of this SDK: that is how the /HallOfFame endpoints send them.
 * Do not "fix" these to PascalCase for consistency - every field would silently read undefined.
 * Nullable fields are sent as explicit null rather than omitted, hence `| null`.
 */
export interface HallOfFamePlayerEntry {
    userId: number;
    funticoId: number;
    displayName: string;
    avatarUrl?: string | null;
    avatarType?: string | null;
    avatarBorder?: string | null;
    country?: string | null;
    rank: number;
    totalPoints: number;
    gamesPlayed: number;
    playedAt?: string | null;
    borderType?: string | null;
}
/**
 * Paginated Hall of Fame ranking response.
 */
export interface HallOfFameResponse {
    leaderboard: HallOfFamePlayerEntry[];
    currentPlayer?: HallOfFamePlayerEntry | null;
    totalPlayers: number;
    page: number;
    limit: number;
}
/**
 * A single place (1-10) or a grouped place range (11-20, 21-50) in the distribution.
 *
 * `prizes` uses the shared `Prize` union: /HallOfFame/distribution returns prizes in exactly the
 * same shape (and mixed casing) as the room configs.
 */
export interface HOFDistributionItem {
    place: number;
    endPlace?: number;
    range?: string;
    prizes: Prize[];
}
/**
 * Hall of Fame prize distribution table.
 */
export interface HOFDistributionResponse {
    items: HOFDistributionItem[];
}
/**
 * Campaign level lifecycle status. The wire sends it as an int.
 */
export declare enum CampaignLevelStatus {
    Locked = 0,
    Unlocked = 1,
    Completed = 2
}
/**
 * Machine-readable codes carried by CampaignError.Code.
 *
 * All but two match the error identifiers the API returns, byte for byte. NoActiveAttempt is
 * CLIENT-side only - CompleteCampaignLevel throws it before any I/O when there is no attempt to
 * submit against. Unknown covers any body the SDK cannot parse and any identifier it does not
 * recognise (e.g. one added by a newer API version), and a result the payload signer could not
 * sign (nothing was sent; the attempt stays tracked).
 */
export declare enum CampaignErrorCode {
    CampaignNotAvailable = "CampaignNotAvailable",
    LevelLocked = "LevelLocked",
    LevelNotFound = "LevelNotFound",
    NoActiveAttempt = "NoActiveAttempt",
    AttemptNotFound = "AttemptNotFound",
    InvalidSignature = "InvalidSignature",
    InvalidMetrics = "InvalidMetrics",
    CompletionTooFast = "CompletionTooFast",
    Unknown = "Unknown"
}
/**
 * Error thrown by the Campaign methods, carrying a machine-readable Code alongside the
 * human-readable message. Branch on `Code`, never on message text.
 *
 * `instanceof CampaignError` is reliable: the constructor restores the prototype chain
 * explicitly, which extending the built-in Error otherwise breaks under ES5-era targets.
 */
export declare class CampaignError extends Error {
    readonly Code: CampaignErrorCode;
    constructor(code: CampaignErrorCode, message: string);
}
/**
 * Headline campaign numbers, available without fetching the (heavier) level list.
 */
export interface CampaignAvailabilityViewModel {
    IsAvailable: boolean;
    LevelCount: number;
    MaxStars: number;
}
/**
 * One reward attached to a campaign level, granted on completing it with at least
 * `RequiredStars` stars.
 */
export interface CampaignRewardViewModel {
    Type: string;
    Amount: number;
    ItemId?: number | null;
    RequiredStars: number;
    Name?: string | null;
    ImageUrl?: string | null;
}
/**
 * One condition of a star rule: `Metric` compared via `Op` against `Value`.
 * FOR DISPLAY ONLY - stars are computed server-side. Render the thresholds; never re-evaluate
 * them client-side and never submit stars.
 */
export interface CampaignStarRuleCondition {
    Metric: string;
    Op: string;
    Value: number;
}
/** The conditions that must all hold for a run to earn `Star`. */
export interface CampaignStarTier {
    Star: number;
    Conditions: CampaignStarRuleCondition[];
}
/**
 * A level's parsed star rules: what counts as a win, and what earns each star.
 * Parsed client-side from the wire's StarRulesJson; null on the level while it is Locked, and
 * null again when that JSON does not parse.
 */
export interface CampaignStarRules {
    Win: CampaignStarRuleCondition[];
    Stars: CampaignStarTier[];
}
/**
 * One campaign level as the player sees it.
 *
 * `LevelConfigJson` is the wire's LevelJsonData under a clearer name: an opaque JSON string
 * whose schema belongs to YOUR game - parse it via GetCampaignLevelConfig<T>(). Both it and
 * `StarRules` are null while the level is Locked; the server withholds them until unlock.
 */
export interface CampaignLevelViewModel {
    Id: string;
    Order: number;
    Name: string;
    Description?: string | null;
    Status: CampaignLevelStatus;
    BestStars: number;
    BestMetrics: Record<string, number> | null;
    LevelConfigJson: string | null;
    StarRules: CampaignStarRules | null;
    MinDurationSeconds: number;
    ConfigVersion: number;
    Rewards: CampaignRewardViewModel[];
    CompletedAt?: string | null;
}
/**
 * The player's campaign-wide progress counters, shared by the level list and the completion
 * result so one progress HUD can bind to either.
 */
export interface CampaignProgressSummary {
    TotalLevels: number;
    CompletedLevels: number;
    TotalStarsEarned: number;
    MaxStars: number;
}
/** The full campaign as returned by GetCampaignLevels. */
export interface CampaignLevelsViewModel extends CampaignProgressSummary {
    IsAvailable: boolean;
    Levels: CampaignLevelViewModel[];
}
/**
 * A started level attempt. StartCampaignLevel returns and tracks one; CompleteCampaignLevel
 * consumes it.
 */
export interface CampaignAttemptData {
    AttemptId: string;
    LevelId: string;
    ConfigVersion: number;
    StartedAt: string;
}
/**
 * The metrics a finished run submits: a flat name -> value map.
 * Booleans are legal and are normalized to 1/0 before encryption. Numbers may be fractional -
 * unlike EndRoomSP's int Score, nothing is truncated.
 */
export type CampaignMetrics = Record<string, number | boolean>;
/**
 * The outcome of a submitted attempt. Losing is a NORMAL result - IsWin false, Stars 0 - not an
 * error, so a defeat screen renders from this same object.
 */
export interface CampaignCompletionResult extends CampaignProgressSummary {
    IsWin: boolean;
    Stars: number;
    BestStars: number;
    IsNewBest: boolean;
    LevelCompletedFirstTime: boolean;
    UnlockedLevelId: string | null;
    Rewards: CampaignRewardViewModel[];
    RewardsGranted: boolean;
}
/**
 * Machine-readable reasons an Inventory method can fail. Branch on these, never on message text.
 */
export declare enum InventoryErrorCode {
    /** The player is not linked to a Funtico account. */
    NotLinked = "NotLinked",
    /** The player's Funtico session belongs to another game or has expired. Signing in to this game again fixes it. */
    ReloginRequired = "ReloginRequired",
    /** The Funtico platform did not answer. Try again later. */
    PlatformUnavailable = "PlatformUnavailable",
    /** A field of the request is missing or malformed, for example the IdempotencyKey or the id. */
    InvalidRequest = "InvalidRequest",
    /** The game has no recipe or fusion with that key. */
    UnknownRule = "UnknownRule",
    /** The IdempotencyKey was already used for a different action. Use a new key. */
    KeyReused = "KeyReused",
    /** The picked copies do not fit the fusion: not the player's, not eligible, or the wrong count. */
    WrongItems = "WrongItems",
    /** The game's recipes or fusions are set up wrong. Not something the player can fix. */
    Misconfigured = "Misconfigured",
    /** The response carried no recognisable code. */
    Unknown = "Unknown"
}
/**
 * Error thrown by the Inventory methods, carrying a machine-readable Code alongside the
 * human-readable message. `instanceof InventoryError` is reliable.
 */
export declare class InventoryError extends Error {
    readonly Code: InventoryErrorCode;
    constructor(code: InventoryErrorCode, message: string);
}
/** Stats one copy of an infinity item has accumulated. */
export interface InventoryItemCopy {
    UserItemId: number;
    /** The copy's stats as a JSON string; "[]" while it has none. */
    StatsJson: string;
}
/**
 * One item the player owns, with every copy folded in.
 *
 * `PropertiesJson` is the item's properties as configured in the Funtico item catalog: an opaque
 * JSON object string whose game-specific part belongs to YOUR game - parse it via
 * GetInventoryItemProperties<T>().
 */
export interface InventoryItem {
    /** Funtico catalog id of the item - the same id prizes and entry fees refer to. */
    ItemId: number;
    /** Your game's own key for the item, as set in the item catalog. May be null. */
    GameItemId: string | null;
    Name: string;
    Description: string | null;
    ImageUrl: string | null;
    /** How many copies the player holds. */
    Count: number;
    /** Ids of the individual copies. */
    UserItemIds: number[];
    IsConsumable: boolean;
    IsInfinity: boolean;
    /** True when the item belongs to this game. */
    IsGameItem: boolean;
    IsSellable: boolean;
    Rarity: string | null;
    PropertiesJson: string | null;
    /** Base stats of an infinity item as configured in the catalog, or null. */
    BaseStatsJson: string | null;
    /** Per-copy stats of an infinity item; empty for other items. */
    Copies: InventoryItemCopy[];
}
/** The player's items, as returned by GetInventory. */
export interface InventoryResponse {
    Items: InventoryItem[];
}
/** One line of a recipe: an item and how many of it. */
export interface CraftRecipeItem {
    /**
     * Your game's own item key. It may contain the placeholder "{id}", which CraftItem fills with the
     * id you pass (for example "sg_shard_{id}" becomes "sg_shard_laser_pulse").
     */
    Item: string;
    Amount: number;
}
/** A fixed recipe: CraftItem takes every Inputs line from the player and gives every Outputs line. */
export interface CraftRecipe {
    /** Pass this to CraftItem. */
    Key: string;
    /** Display name. May be null. */
    Name: string | null;
    /** True when the item keys contain "{id}", so CraftItem needs an id. */
    HasId: boolean;
    Inputs: CraftRecipeItem[];
    Outputs: CraftRecipeItem[];
}
/**
 * A fusion: FuseItems takes exactly `Need` copies the player picked, each of an item listed in
 * Inputs, and gives one random item listed in Results.
 */
export interface FusionRecipe {
    /** Pass this to FuseItems. */
    Key: string;
    /** Display name. May be null. */
    Name: string | null;
    /** How many copies one fusion takes. */
    Need: number;
    /** Your game's item keys a picked copy may be of. */
    Inputs: string[];
    /** Your game's item keys the random result may be. */
    Results: string[];
}
/** The crafting recipes and fusions of this game, as returned by GetRecipes. */
export interface RecipesResponse {
    Recipes: CraftRecipe[];
    Fusions: FusionRecipe[];
}
/** Values of CraftResult.Status. */
export declare enum CraftStatus {
    /** Done: the items in Burned were taken and the items in Granted were given. */
    Succeeded = "Succeeded",
    /**
     * Not confirmed yet. Call again with the same IdempotencyKey (CraftResult.IdempotencyKey) until
     * the status is Succeeded or Refused; the action never happens twice.
     */
    Pending = "Pending",
    /** Nothing changed; Reason says why. Trying again needs a new IdempotencyKey. */
    Refused = "Refused"
}
/** Items one kind of item gained or lost in a craft or fusion. */
export interface CraftResultItem {
    /** Your game's own item key. */
    GameItemId: string;
    /** Ids of the copies taken or given. */
    UserItemIds: number[];
}
/** The outcome of CraftItem or FuseItems. */
export interface CraftResult {
    /** Id of the action. Quote it when reporting a problem. */
    OperationId: string;
    /** A CraftStatus value. */
    Status: string;
    /** True when this answer repeats an earlier call made with the same IdempotencyKey. */
    Replayed: boolean;
    /** What was taken from the player. Empty unless Status is Succeeded. */
    Burned: CraftResultItem[];
    /** What the player received. Empty unless Status is Succeeded. */
    Granted: CraftResultItem[];
    /**
     * Why a Refused action was refused, as a machine-readable string (for example
     * "not_enough_items", "item_locked", "unknown_game_item_id", "max_supply_reached"); null otherwise.
     */
    Reason: string | null;
    /** Human-readable detail for Reason. May be null. */
    Message: string | null;
    /** The key this call used: the one you passed, or the one the SDK generated. */
    IdempotencyKey: string;
}
/** Values of RecentReward.Status. */
export declare enum RecentRewardStatus {
    /** Accepted and on its way to the player's inventory. */
    Queued = "Queued",
    /** In the player's inventory. */
    Delivered = "Delivered",
    /** A random draw that paid nothing. */
    Empty = "Empty",
    /** The platform refused it. */
    Refused = "Refused",
    /** Gave up after repeated failures. */
    Failed = "Failed"
}
/** One item a reward pays. */
export interface RecentRewardItem {
    /** Funtico catalog id of the item. */
    ItemId: number;
    /** Your game's own key for the item. May be null. */
    GameItemId: string | null;
    Name: string | null;
    ImageUrl: string | null;
    Amount: number;
}
/** One reward a run, a campaign level or an arena run paid (or is paying) the player. */
export interface RecentReward {
    Id: string;
    /** 'Room', 'Tournament', 'Practice', 'Campaign', 'Arena' or 'CommunityGoal'. */
    Source: string;
    /** The run it belongs to. */
    RunId: string;
    /** The collected key or reward table that produced it; for a Community Goal, the reward bracket. */
    Key: string;
    /** A RecentRewardStatus value. */
    Status: string;
    /** What it pays. Empty for an Empty draw and for some rewards not delivered yet. */
    Items: RecentRewardItem[];
    /** ISO-8601, UTC. */
    CreatedAt: string;
    /** ISO-8601, UTC; null until delivered. */
    DeliveredAt: string | null;
}
/** The player's latest rewards in this game, newest first, as returned by GetRecentRewards. */
export interface RecentRewardsResponse {
    Rewards: RecentReward[];
}
/**
 * Machine-readable reasons a Ghost method can fail. Branch on these, never on message text.
 * `NoOpponent` is a normal outcome: nobody matched and no bot was available - fall back to a
 * local opponent or try again later.
 */
export declare enum GhostErrorCode {
    PoolNotFound = "PoolNotFound",
    RunNotSupported = "RunNotSupported",
    RunNotActive = "RunNotActive",
    RunStateMismatch = "RunStateMismatch",
    InvalidAttributes = "InvalidAttributes",
    InvalidSnapshot = "InvalidSnapshot",
    NoOpponent = "NoOpponent",
    MatchNotFound = "MatchNotFound",
    MatchExpired = "MatchExpired",
    InvalidSignature = "InvalidSignature",
    InvalidOutcome = "InvalidOutcome",
    /** The report's matchData is over 32 KB in UTF-8. Nothing was recorded and the match stays open: report again without it. */
    DataTooLarge = "DataTooLarge",
    /** Paid pool: the player's balance is below the entry price. Nothing was charged and no run started. */
    InsufficientFunds = "InsufficientFunds",
    /** Paid pool: the player must complete identity verification before paying an entry. */
    KycRequired = "KycRequired",
    /** Paid pool: the entry cannot be bought right now (no such product or price, the player is suspended, or paid entries are unavailable). */
    EntryUnavailable = "EntryUnavailable",
    /**
     * Paid pool: the entry payment is not confirmed yet. Call StartGhostRun again: it never charges
     * twice for one run. Until then the run gets no opponent (FindGhostOpponent rejects with this too).
     */
    PaymentPending = "PaymentPending",
    /** The player's Funtico session belongs to another game or has expired. Signing in to this game again fixes it. */
    ReloginRequired = "ReloginRequired",
    /** The response carried no recognisable code, or the payload signer could not sign the report (nothing was sent). */
    Unknown = "Unknown"
}
/** Error thrown by the Ghost methods, carrying a machine-readable Code. `instanceof GhostError` is reliable. */
export declare class GhostError extends Error {
    readonly Code: GhostErrorCode;
    constructor(code: GhostErrorCode, message: string);
}
/** A fight's outcome, from the reporting player's point of view. */
export declare enum GhostOutcome {
    Win = "Win",
    Loss = "Loss",
    Draw = "Draw"
}
/** One attribute a pool matches on. `Bind` set means the server fills it from the run. */
export interface GhostAttribute {
    Name: string;
    Min: number;
    Max: number;
    /** Matched exactly on every search step. */
    Exact: boolean;
    /** "Run.Round", "Run.Wins", "Run.Losses" or null. Bound attributes may be omitted when searching. */
    Bind: string | null;
}
/** The entry a paid pool charges for each run. */
export interface GhostEntry {
    /** What the entry buys. */
    Product: string;
    /** The price tier of the entry. */
    Tier: string;
    /** The price in PLAYR as a decimal string ("100"), to show before the player enters. May be null. */
    DisplayPrice: string | null;
}
/** A ghost pool of this game and the player's rating in it. */
export interface GhostPool {
    Key: string;
    Name: string;
    /** The current season partition; ships and ratings never mix across partitions. */
    Partition: string;
    /** True when the pool plays runs: start, fight until a limit, finish. */
    HasRun: boolean;
    MaxWins: number | null;
    MaxLosses: number | null;
    MaxRounds: number | null;
    Attributes: GhostAttribute[];
    Rating: number;
    /** The entry each run costs; null for a free pool. */
    Entry: GhostEntry | null;
}
/** The entry payment of a run in a paid pool. */
export interface GhostRunEntry {
    /**
     * Charged: paid. Pending: not confirmed yet (call StartGhostRun again; it never charges twice).
     * Refused: not paid. Refunded: paid back (the run was abandoned before its first opponent).
     * RefundPending: being paid back.
     */
    Status: 'Charged' | 'Pending' | 'Refused' | 'Refunded' | 'RefundPending';
    /** The amount charged in PLAYR as a decimal string, or null. */
    Amount: string | null;
    /** The player's PLAYR balance after the charge as a decimal string, or null. */
    BalanceAfter: string | null;
}
/** The player's run in a pool. Round = Fights + 1. */
export interface GhostRun {
    RunId: string;
    Pool: string;
    Partition: string;
    Status: 'Active' | 'Finished' | 'Abandoned';
    Round: number;
    Fights: number;
    Wins: number;
    Losses: number;
    Draws: number;
    MaxWins: number | null;
    MaxLosses: number | null;
    MaxRounds: number | null;
    StartedAt: string;
    FinishedAt: string | null;
    /** The run's entry payment; null in a free pool. */
    Entry: GhostRunEntry | null;
}
/** An issued opponent. Report the fight with MatchId, once. */
export interface GhostMatch {
    MatchId: string;
    SnapshotId: string;
    /** The opponent's ship exactly as it was uploaded (your game's JSON, as a string). */
    SnapshotJson: string;
    /** Lowercase hex SHA-256 of the UTF-8 bytes of SnapshotJson. */
    SnapshotSha256: string;
    IsBot: boolean;
    OwnerName: string | null;
    OwnerAvatarUrl: string | null;
    OwnerBorderUrl: string | null;
    OwnerRating: number;
    PlayerRating: number;
    OpponentAttributes: Record<string, number>;
    /** Name of the search step that found the opponent ("Fallback" for a fallback bot). */
    Step: string;
    ExpiresAt: string;
}
/** The player's active run and its open match: resume after a reload. */
export interface GhostRunState {
    Run: GhostRun | null;
    OpenMatch: GhostMatch | null;
}
export interface GhostFindResult {
    Match: GhostMatch;
    /** The run after the search (null in pools without runs). */
    Run: GhostRun | null;
    /** Id of the player's ship stored by this search, when one was sent. */
    UploadedSnapshotId: string | null;
}
export interface GhostFindOptions {
    /** The player's own ship (your game's JSON as a string), stored in the pool in the same request. */
    snapshot?: string;
    /** Snapshot ids not to face (at most 20). */
    exclude?: string[];
    /** False forbids bots for this search. Default true. */
    allowBots?: boolean;
}
export interface GhostUploadResult {
    SnapshotId: string;
    Sha256: string;
    Partition: string;
}
export interface GhostReportResult {
    MatchId: string;
    Outcome: GhostOutcome;
    PlayerRatingBefore: number;
    PlayerRatingAfter: number;
    OpponentRatingBefore: number;
    OpponentRatingAfter: number;
    /** The run after the fight (null in pools without runs). */
    Run: GhostRun | null;
}
/** What the player's ghosts did since the previous call. */
export interface GhostReportSummary {
    Pool: string;
    Partition: string;
    Rating: number;
    NewGhostWins: number;
    NewGhostLosses: number;
    NewGhostDraws: number;
    GhostWins: number;
    GhostLosses: number;
    GhostDraws: number;
}
export interface GhostHistoryItem {
    MatchId: string;
    /** "Attacker": the player fought a ghost. "Defender": someone fought the player's ghost. */
    Role: 'Attacker' | 'Defender';
    /** From the player's point of view; null when the match expired without counting. */
    Outcome: GhostOutcome | null;
    Expired: boolean;
    OpponentName: string | null;
    OpponentAvatarUrl: string | null;
    OpponentIsBot: boolean;
    RatingBefore: number;
    RatingAfter: number;
    Partition: string;
    CreatedAt: string;
    ClosedAt: string | null;
}
export interface GhostHistory {
    Items: GhostHistoryItem[];
    Page: number;
    Limit: number;
    HasMore: boolean;
}
/** One ranked player of a pool's season. */
export interface GhostLeaderboardEntry {
    /** 1-based place: rating, then wins, high to low. */
    Place: number;
    Name: string | null;
    AvatarUrl: string | null;
    Rating: number;
    /** The player's own fights. */
    Wins: number;
    Losses: number;
    Draws: number;
    /** Fights against the player's ghosts, from the ghost's side. */
    GhostWins: number;
    GhostLosses: number;
    GhostDraws: number;
    IsMe: boolean;
}
export interface GhostLeaderboard {
    Pool: string;
    Partition: string;
    Items: GhostLeaderboardEntry[];
    /** The player's own row and place, wherever it is; null until the player has fought this season. */
    Me: GhostLeaderboardEntry | null;
    Page: number;
    Limit: number;
    HasMore: boolean;
}
/**
 * Machine-readable reasons a Community Goal method can fail. Branch on these, never on message text.
 * `GoalClosed` carries NextGoalId (load that goal: it has its own data); `NoAttemptsLeft` and
 * `NoPaidAttemptsLeft` carry ResetsAt.
 */
export declare enum CommunityGoalErrorCode {
    ChainNotFound = "ChainNotFound",
    GoalNotFound = "GoalNotFound",
    GoalClosed = "GoalClosed",
    NoAttemptsLeft = "NoAttemptsLeft",
    AttemptNotFound = "AttemptNotFound",
    AttemptExpired = "AttemptExpired",
    CompletionTooFast = "CompletionTooFast",
    InvalidSignature = "InvalidSignature",
    InvalidContribution = "InvalidContribution",
    /** startData (8 KB) or strikeData (16 KB) is too long in UTF-8; nothing was spent or counted, the attempt stays open. */
    DataTooLarge = "DataTooLarge",
    /** No such best strike on this goal any more (the player has struck harder since, or was removed). */
    StrikeNotFound = "StrikeNotFound",
    /** Paid attempt: today's paid attempts of the chain are used up (see ResetsAt). Nothing was charged. */
    NoPaidAttemptsLeft = "NoPaidAttemptsLeft",
    /** Paid attempt: the player's balance is below the price. Nothing was charged and no attempt started. */
    InsufficientFunds = "InsufficientFunds",
    /** Paid attempt: the player must complete identity verification before paying. Nothing was charged. */
    KycRequired = "KycRequired",
    /** Paid attempt: it cannot be bought right now (the chain sells none, it is not on sale, or the player is suspended). Nothing was charged. */
    EntryUnavailable = "EntryUnavailable",
    /**
     * Paid attempt: the payment is not confirmed yet. Call StartGoalAttempt again: it never charges twice for
     * one attempt, and the attempt is handed out once it is paid.
     */
    PaymentPending = "PaymentPending",
    /** The player's Funtico session belongs to another game or has expired. Signing in to this game again fixes it. */
    ReloginRequired = "ReloginRequired",
    /** The response carried no recognisable code, or the payload signer could not sign the result (nothing was sent). */
    Unknown = "Unknown"
}
/** Error thrown by the Community Goal methods. `instanceof CommunityGoalError` is reliable. */
export declare class CommunityGoalError extends Error {
    readonly Code: CommunityGoalErrorCode;
    /** GoalClosed: the goal open in the chain now, if any. */
    readonly NextGoalId: string | null;
    /** NoAttemptsLeft and NoPaidAttemptsLeft: when the daily attempts reset (UTC midnight, ISO string). */
    readonly ResetsAt: string | null;
    constructor(code: CommunityGoalErrorCode, message: string, nextGoalId?: string | null, resetsAt?: string | null);
}
/** "Open": accepting attempts. "Closed": target reached, late attempts may still land. "Settled": final places fixed. */
export type CommunityGoalStatus = 'Open' | 'Closed' | 'Settled';
/** How a player's contributions form their place: all summed, the single best, or the best of each UTC day summed. */
export type CommunityGoalScoring = 'Sum' | 'Best' | 'BestPerDay';
/** A chain of goals and its rules, as far as the game needs them. */
export interface CommunityGoalChain {
    Key: string;
    Name: string;
    Scoring: CommunityGoalScoring;
    /** Free attempts per player per UTC day across the whole chain; 0 means no limit. */
    FreeAttemptsPerDay: number;
    /** Shortest accepted attempt (server clock). */
    MinAttemptSeconds: number;
    /** An attempt not completed within this time expires with no contribution. */
    AttemptTtlSeconds: number;
    /** Progress fractions (0 < f < 1) worth reacting to, ascending. */
    Milestones: number[];
    /** Extra attempts the chain sells for PLAYR; null when it sells none. */
    PaidAttempts: CommunityGoalPaidAttempts | null;
}
/** The paid attempts of a chain. A paid attempt counts in the goal like a free one. */
export interface CommunityGoalPaidAttempts {
    /** What the attempt buys. */
    Product: string;
    /** The price tier of the attempt. */
    Tier: string;
    /** The price in PLAYR as a decimal string ("100"), to show before the player buys. Null when it is not on sale. */
    DisplayPrice: string | null;
    /** Paid attempts per player per UTC day across the whole chain; 0 means no limit. */
    PerDay: number;
}
/** The payment of one paid attempt. */
export interface GoalAttemptEntry {
    /**
     * Charged: paid. Pending: not confirmed yet. Refused: not paid. Refunded: paid back (the attempt never
     * reached the player). RefundPending: being paid back.
     */
    Status: 'Charged' | 'Pending' | 'Refused' | 'Refunded' | 'RefundPending';
    /** The amount charged in PLAYR as a decimal string, or null. */
    Amount: string | null;
    /** The player's PLAYR balance after the charge as a decimal string, or null. */
    BalanceAfter: string | null;
}
/** One goal of a chain and its shared state. */
export interface CommunityGoal {
    GoalId: string;
    /** 1, 2, 3... within the chain. */
    Number: number;
    Name: string;
    Status: CommunityGoalStatus;
    TargetValue: number;
    /** Sum of every accepted contribution; may pass TargetValue. */
    CurrentValue: number;
    /** CurrentValue / TargetValue, at most 1. */
    Progress: number;
    MilestonesPassed: number[];
    OpenedAt: string;
    ClosedAt: string | null;
    ContributorCount: number;
    /** Completed strikes on this goal, every player's. */
    StrikeCount: number;
    /** Who landed the hit that reached the target; null while open, or when the goal was closed by hand. */
    ClosedBy: CommunityGoalClosedBy | null;
    /** Your game's data for this goal, exactly as configured (a JSON string). */
    PayloadJson: string;
    /** When the goal is no longer open: the goal opened after it, if any. */
    NextGoalId: string | null;
    /**
     * The goal's reward brackets, top-down: at settlement each contributor gets the first bracket
     * their final place matches, and only that one.
     */
    Rewards: CommunityGoalBracket[];
}
/** One reward bracket of a goal: who falls into it and what it pays, as configured for display. */
export interface CommunityGoalBracket {
    /** The bracket's key; CommunityGoalMe.Bracket names it. */
    Name: string;
    /** What to show for the bracket ("#1", "TOP 10%"). May be null. */
    Label: string | null;
    /** Exactly one of MaxPlace, MaxPercentile and AnyContribution is set: final places 1..MaxPlace. */
    MaxPlace: number | null;
    /** Final place x 100 / contributors at most this. */
    MaxPercentile: number | null;
    /** Every contributor not in an earlier bracket. */
    AnyContribution: boolean;
    /** What the bracket pays, as configured for display. The actual items are drawn at settlement. */
    Display: CommunityGoalRewardDisplay[];
}
export interface CommunityGoalRewardDisplay {
    Name: string;
    /** Your game's own key for the entry (an item key, or a key for a random pool), as configured. Recognise entries by this, not by Name. May be null. */
    Code: string | null;
    ImageUrl: string | null;
    Amount: number | null;
}
/**
 * Where a contributor's bracket rewards are, once the goal is settled. 'None': no bracket (or
 * nothing payable). 'Pending': placed, not drawn yet (usually within a minute). 'Queued': drawn, at
 * least one still on its way. 'Delivered': everything drawn has arrived (a draw may come up empty).
 * 'Failed': nothing left to send, but part of it was not accepted.
 */
export type CommunityGoalRewardStatus = 'None' | 'Pending' | 'Queued' | 'Delivered' | 'Failed';
/** A started attempt. Pass it to CompleteGoalAttempt. */
export interface GoalAttempt {
    AttemptId: string;
    GoalId: string;
    /** Server-chosen random number; the same every time the attempt is resumed. */
    Seed: number;
    StartedAt: string;
    ExpiresAt: string;
    /** The goal's value when the attempt started; the same every time the attempt is resumed. */
    GoalValueAtStart: number;
    /** Milestones the goal had passed when the attempt started: the phase to play the attempt in. */
    MilestonesAtStart: number[];
    /** What you sent as startData when the attempt started, unchanged; the same on every resume. Null if none. */
    StartData: string | null;
    /** True for a paid attempt. */
    Paid: boolean;
}
/** Who landed the hit that reached a goal's target. */
export interface CommunityGoalClosedBy {
    Name: string | null;
    AvatarUrl: string | null;
    /** What that hit counted. */
    Accepted: number;
    /** The signed-in player landed it. */
    IsMe: boolean;
}
export interface StartGoalAttemptOptions {
    /**
     * Your own data for the attempt (for example the build it starts with), up to 8 KB in UTF-8. Stored as is
     * and returned with the attempt, also on every resume, so another device can continue it. Ignored when the
     * live attempt is returned again: the first one sent stays.
     */
    startData?: string;
    /**
     * Buy one of the chain's paid attempts (CommunityGoalChain.PaidAttempts) instead of spending a free one.
     * The price is charged once per attempt. Ignored when the live attempt is returned again.
     */
    paid?: boolean;
}
/** A player's best strike on a goal, as GetCommunityGoalStrike returns it. */
export interface CommunityGoalStrike {
    StrikeId: string;
    GoalId: string;
    Name: string | null;
    AvatarUrl: string | null;
    /** What the strike counted. */
    Accepted: number;
    CompletedAt: string;
    /** The strikeData sent with it, exactly; null when none was sent. */
    StrikeData: string | null;
    IsMe: boolean;
}
/** The signed-in player's own state in a chain and on a goal. */
export interface CommunityGoalMe {
    IsContributor: boolean;
    Score: number;
    /** Null when not a contributor. */
    Place: number | null;
    /** How much the player's contributions added to the goal. */
    Contributed: number;
    /** The player's largest single accepted contribution to this goal ("best strike"). */
    Best: number;
    Attempts: number;
    /** Free attempts started today (UTC) in the chain. */
    AttemptsUsedToday: number;
    /** Free attempts left today; null when the chain has no daily limit. */
    AttemptsLeftToday: number | null;
    /** Paid attempts started today (UTC) in the chain. */
    PaidAttemptsUsedToday: number;
    /** Paid attempts left today; null when the chain sells none or has no limit on them. */
    PaidAttemptsLeftToday: number | null;
    ResetsAt: string;
    /**
     * The player's live attempt (possibly on another goal): finish it before starting a new one. A paid
     * attempt shows here only once it is paid.
     */
    OpenAttempt: GoalAttempt | null;
    /** Settled goals: the final place and the reward bracket it fell into. */
    FinalPlace: number | null;
    Bracket: string | null;
    /** Settled goals: where the bracket rewards are. Null before settlement or for a non-contributor. */
    RewardStatus: CommunityGoalRewardStatus | null;
    /**
     * What this goal paid the player, with item names and images. GetRecentRewards lists the same
     * entries with Source 'CommunityGoal'.
     */
    Rewards: RecentReward[];
}
export interface CommunityGoalState {
    Chain: CommunityGoalChain;
    /** The open goal (or the requested one); null when the chain has never had a goal. */
    Goal: CommunityGoal | null;
    /** No goal is open right now: the last one closed and the next is not open yet. */
    AwaitingNext: boolean;
    /** Null when no player is signed in. */
    Me: CommunityGoalMe | null;
    /** Poll the live state no more often than this. */
    PollAfterSeconds: number;
    ServerTime: string;
}
/** The shared state only: what to poll. */
export interface CommunityGoalLive {
    GoalId: string;
    Number: number;
    Status: CommunityGoalStatus;
    TargetValue: number;
    CurrentValue: number;
    Progress: number;
    MilestonesPassed: number[];
    ContributorCount: number;
    /** Completed strikes on this goal, every player's. */
    StrikeCount: number;
    NextGoalId: string | null;
    PollAfterSeconds: number;
    ServerTime: string;
}
export interface GoalAttemptStart {
    Attempt: GoalAttempt;
    /** True when this is the player's already-live attempt returned again (no attempt spent). */
    Resumed: boolean;
    /**
     * The goal the attempt belongs to: its payload and current state. Play in the phase of
     * Attempt.MilestonesAtStart - on a resumed attempt the goal may have moved on since the start.
     */
    Goal: CommunityGoal;
    /** Free attempts left today; null when the chain has no daily limit. */
    AttemptsLeftToday: number | null;
    /** Paid attempts left today; null when the chain sells none or has no limit on them. */
    PaidAttemptsLeftToday: number | null;
    ResetsAt: string;
    /** The payment of a paid attempt; null for a free one. */
    Entry: GoalAttemptEntry | null;
}
export interface CompleteGoalAttemptOptions {
    /** Your own measure of the attempt; informative only. */
    clientDurationSeconds?: number;
    /** Up to 16 numbers for analytics. */
    metrics?: Record<string, number>;
    /** A hash of the attempt, up to 128 characters. */
    fightHash?: string;
    /**
     * Your own data of the strike (for example the build and what a replay needs), up to 16 KB in UTF-8; sent
     * signed with the result. The one of each player's best strike is kept and can be read back from the
     * leaderboard with GetCommunityGoalStrike.
     */
    strikeData?: string;
}
export interface GoalAttemptResult {
    AttemptId: string;
    GoalId: string;
    /** True when this answers a repeat of an already completed attempt. */
    Replayed: boolean;
    Reported: number;
    /** What counted: Reported cut down to the chain's plausibility limits. */
    Accepted: number;
    Capped: boolean;
    ValueBefore: number;
    ValueAfter: number;
    TargetValue: number;
    /** Milestones this contribution carried the goal past. */
    MilestonesCrossed: number[];
    GoalStatus: CommunityGoalStatus;
    /** The goal is closed now (by this contribution or before it). */
    GoalClosed: boolean;
    /** This contribution reached the target. */
    ClosedByMe: boolean;
    NextGoalId: string | null;
    Score: number;
    ScoreImproved: boolean;
    /** The player's largest single accepted contribution to this goal, this one included. */
    Best: number;
    /** This contribution beat every earlier one of the player on this goal (the same on a replay). */
    IsNewBest: boolean;
    Place: number | null;
    AttemptsLeftToday: number | null;
    /** Paid attempts left today; null when the chain sells none or has no limit on them. */
    PaidAttemptsLeftToday: number | null;
    ResetsAt: string;
}
export interface CommunityGoalLeaderboardEntry {
    Place: number;
    Name: string | null;
    AvatarUrl: string | null;
    Score: number;
    Contributed: number;
    /** The player's largest single accepted contribution to this goal. */
    Best: number;
    /** That best strike, for GetCommunityGoalStrike; null when there is none to show. */
    BestStrikeId: string | null;
    Attempts: number;
    IsMe: boolean;
}
/** A chain's past goals, newest first, as returned by GetCommunityGoalHistory. */
export interface CommunityGoalHistory {
    Items: CommunityGoalHistoryEntry[];
    Total: number;
    Page: number;
    Limit: number;
    HasMore: boolean;
}
export interface CommunityGoalHistoryEntry {
    GoalId: string;
    Number: number;
    Name: string;
    /** 'Closed' or 'Settled'. */
    Status: CommunityGoalStatus;
    TargetValue: number;
    CurrentValue: number;
    OpenedAt: string;
    ClosedAt: string | null;
    /** How long the goal held out, in seconds. */
    LifetimeSeconds: number;
    ContributorCount: number;
    /** Completed strikes on this goal, every player's. */
    StrikeCount: number;
    /** Who landed the hit that reached the target; null when the goal was closed by hand. */
    ClosedBy: CommunityGoalClosedBy | null;
    /** Your game's data for this goal, exactly as configured (a JSON string). */
    PayloadJson: string;
    /** The signed-in player's part in this goal; null when not signed in. */
    Me: CommunityGoalHistoryMe | null;
}
export interface CommunityGoalHistoryMe {
    IsContributor: boolean;
    Score: number;
    Contributed: number;
    Best: number;
    Attempts: number;
    /** Contributed / the goal's CurrentValue, 0..1. */
    Share: number;
    FinalPlace: number | null;
    Bracket: string | null;
    RewardStatus: CommunityGoalRewardStatus | null;
}
export interface CommunityGoalLeaderboard {
    GoalId: string;
    Items: CommunityGoalLeaderboardEntry[];
    /** The player's own row, wherever it is; null until they contribute (or when not signed in). */
    Me: CommunityGoalLeaderboardEntry | null;
    /** Up to two rows above and below the player, the player included. */
    Around: CommunityGoalLeaderboardEntry[];
    Total: number;
    Page: number;
    Limit: number;
    HasMore: boolean;
}
export interface WatchCommunityGoalOptions {
    /** Called when a poll fails; polling goes on. */
    onError?: (error: unknown) => void;
    /** Never poll more often than this, whatever the server asks. Default 2. */
    minIntervalSeconds?: number;
    /** Keep polling while the page is hidden. Default false (polling pauses in the background). */
    pollWhenHidden?: boolean;
}
/** Handle of a running WatchCommunityGoal. */
export interface CommunityGoalWatch {
    stop(): void;
}
/**
 * Cryptography helper class leveraging the browser Web Crypto API.
 * Produces the encrypted payloads and signatures the Funtico API expects.
 */
export declare class CryptoHelper {
    private static formatKey;
    /**
     * Encrypts plaintext using AES-128-CBC with PKCS7 padding and a static IV.
     */
    static encrypt(plainText: string, keyStr: string): Promise<string>;
    /**
     * Decrypts ciphertext using AES-128-CBC with PKCS7 padding and a static IV.
     */
    static decrypt(encryptedBase64: string, keyStr: string): Promise<string>;
    /**
     * Computes HMAC-SHA256 signature represented as a hex string.
     */
    static hmacSha256(message: string, keyStr: string): Promise<string>;
}
/**
 * Which result is being signed. Each kind takes its key salt from a different id; see
 * PayloadSigner.Sign.
 */
export declare enum PayloadKind {
    /** CompletePractice. Salt id: the player's UserId. */
    Practice = 0,
    /** EndRoomSP. Salt id: the session or match id. */
    Room = 1,
    /** ResultTournament_Client. Salt id: the tournament's saveScoreId. */
    Tournament = 2,
    /** CompleteCampaignLevel. Salt id: the attempt id. */
    Campaign = 3,
    /** ReportGhostResult. Salt id: the match id, lowercased. */
    Ghost = 4,
    /** CompleteGoalAttempt. Salt id: the attempt id, lowercased. */
    CommunityGoal = 5
}
/** A signed result, as the API expects it: the encrypted payload and its hash. */
export interface SignedPayload {
    Data: string;
    Hash: string;
}
/**
 * Signs the results the SDK sends and encrypts the saved session. When the game passes
 * privateGameKey to Initialize, the SDK uses LocalPayloadSigner. A game that keeps the key off the
 * client passes its own signer as FunticoSignerConfig.payloadSigner instead, typically one that
 * forwards the call to the game's backend, where the key lives.
 *
 * Any signer must return exactly what LocalPayloadSigner returns for the same arguments and key;
 * the API cannot tell them apart.
 *
 * Return null when the call fails. The SDK then sends nothing and rejects the call with an Error
 * saying the result could not be signed (a CampaignError, GhostError or CommunityGoalError with
 * Code Unknown in those modules), and keeps what a retry needs: the practice run id, the campaign
 * attempt, the open session, the recorded events and counts. An exception thrown by a signer
 * reaches the game's call unchanged.
 */
export interface PayloadSigner {
    /**
     * Encrypts and hashes a result.
     * @param kind Which result this is.
     * @param saltId The id the key salt comes from, unshortened: the player's UserId (decimal) for
     *               Practice, otherwise the id named on the PayloadKind value.
     * @param payloadJson The exact JSON to encrypt. Encrypt it as it is; never re-serialise it.
     */
    Sign(kind: PayloadKind, saltId: string, payloadJson: string): Promise<SignedPayload | null>;
    /**
     * Encrypts a session checkpoint (CreateSession_Client, UpdateSession_Client).
     * @param userId The player's UserId (decimal).
     * @param sessionJson The exact JSON to encrypt.
     * @returns The encrypted session, or null on failure.
     */
    EncryptSession(userId: string, sessionJson: string): Promise<string | null>;
    /**
     * Decrypts a saved session (ReconnectToUnfinishedSession_Client).
     * @param userId The player's UserId (decimal).
     * @param encryptedData The session as the API returned it.
     * @returns The session JSON, or null on failure.
     */
    DecryptSession(userId: string, encryptedData: string): Promise<string | null>;
}
/**
 * Signs with the game's private key. The SDK uses it when Initialize gets privateGameKey. It is
 * also the reference for every other PayloadSigner: a signer must return exactly what this one
 * returns. It runs wherever Web Crypto does, so a Node backend can sign with it too.
 */
export declare class LocalPayloadSigner implements PayloadSigner {
    private readonly privateKey;
    constructor(privateKey: string);
    /**
     * The salt in front of the key: the first 8 characters of the id. A practice id is the player's
     * UserId in decimal, padded on the left with zeros to 8 digits first.
     */
    static Salt(kind: PayloadKind, saltId: string): string;
    Sign(kind: PayloadKind, saltId: string, payloadJson: string): Promise<SignedPayload>;
    EncryptSession(userId: string, sessionJson: string): Promise<string>;
    DecryptSession(userId: string, encryptedData: string): Promise<string>;
    /** The player's UserId as 8 hex digits, then the last 8 characters of the private key. */
    private sessionKey;
}
/**
 * Funtico SDK - Core Service Facade.
 */
export declare class FunticoSDK {
    private static _instance;
    private config;
    private payloadSigner;
    private jwtToken;
    private apiUri;
    /** The Funtico PLATFORM host (user profiles), not the game's Rooms API. See FunticoConfig. */
    private funticoApiUri;
    private cachedUserData;
    private cachedBalance;
    private cachedVouchers;
    private cachedCampaignAvailability;
    private cachedCampaignLevels;
    private cachedInventory;
    private cachedInventoryWithOtherItems;
    private cacheExpiresAt;
    private lastRoomsResponse;
    private activeClientSessionDbId;
    private activeClientSessionId;
    private currentClientSessionId;
    private currentClientSessionEvents;
    private currentClientSessionCollected;
    private practiceRunId;
    private activeCampaignAttempt;
    private activeServerSessionId;
    private activeServerSessionEvents;
    private constructor();
    static get Instance(): FunticoSDK;
    /**
     * Fail-fast sanity check of the game keys, run before Initialize touches any state.
     *
     * A bad key does not fail where it is passed in: the public key only fails at the first request
     * (auth rejected), and a bad private key survives even that - it is only used to encrypt/sign
     * payloads. A secret for the wrong game/environment usually fails at the first encrypted call
     * (e.g. CreateSession_Client), but some wrong keys only surface as an opaque HTTP 500 ("Padding
     * is invalid and cannot be removed") on /Rooms/end-room-sp, after a whole match has been played.
     * Every rule below catches a mistake that can NEVER work, so it is reported up front with a
     * readable message instead.
     *
     * Deliberately NO format rules (GUID shape, charset, exact length): keys are issued in more than
     * one format. A rule here must never reject a key the platform legitimately issued.
     *
     * Messages never contain the key values themselves (they end up in logs and error trackers);
     * lengths are fine.
     *
     * @throws Error whose message starts with "Invalid FunticoConfig: ".
     */
    private static validateConfig;
    /**
     * Initializes the Funtico SDK.
     * Automatically performs user authentication if token is provided.
     *
     * The config is validated first (see validateConfig); a rejected config throws before any state
     * is changed, so a previously initialized SDK keeps working with its old config.
     *
     * Results and the saved session are signed with config.privateGameKey, or, when the game keeps
     * the key off the client, by config.payloadSigner.
     */
    Initialize(config: FunticoConfig | FunticoSignerConfig): Promise<void>;
    /**
     * Exchanges platform token for the game's JWT token.
     */
    Authentication(platformToken: string): Promise<any>;
    getPlatformToken(): string;
    getUserToken(): string;
    private getAuthHeaders;
    /**
     * Headers for the dedicated-server endpoints.
     *
     * These endpoints require BOTH headers: X-User-Key (the public key) and X-Server-Key, which is
     * computed from the game keys. The private key itself is never sent. An SDK initialized with a
     * payloadSigner has no key to compute it from and sends no X-Server-Key.
     *
     * Async because Web Crypto's sign() is.
     */
    private getServerHeaders;
    /**
     * The player's UserId as the signer gets it for session encryption. Requires user data to be
     * loaded.
     */
    private getSessionUserId;
    /**
     * Signs a result with the game's signer. Null when the signer gave no usable answer; the caller
     * then sends nothing and rejects as it would on a failed request. A signer's exception propagates.
     */
    private signResult;
    GetUserData(useCache?: boolean): Promise<UserData>;
    GetCachedUserData(): UserData | null;
    GetBalance(useCache?: boolean): Promise<BalanceResponse>;
    GetCachedBalance(): BalanceResponse | null;
    /**
     * Fetches the user's entry vouchers, including how many they hold and their progress toward the
     * next one.
     *
     * Uses /User/vouchers, NOT /User/vouchers-data. The latter is a static catalogue of every voucher
     * that exists ({Name, Image, Id, tier}) and carries no counts at all, so Count, PlayCount and
     * PlaysRequiredToActivate could never be populated from it - which is what UserCanJoinWithVoucher
     * is decided on.
     *
     * Only vouchers the user actually holds come back here, so a tier the user has none of is absent
     * from the list rather than present with Count 0. Either way the result is the same: an absent
     * voucher and a Count-0 voucher both yield UserCanJoinWithVoucher === false.
     */
    GetVouchers(useCache?: boolean): Promise<VoucherData[]>;
    GetCachedVouchers(): VoucherData[] | null;
    CanAfford(type: EntryFeeType, amount: number): Promise<boolean>;
    CanAffordFromCache(type: EntryFeeType, amount: number): boolean;
    private evaluateAffordability;
    private updateCacheExpiration;
    /**
     * A room is free when it has no ticket type, an explicitly Free one, or costs nothing.
     */
    private isTicketFree;
    /**
     * The fee the user effectively paid for a seat.
     * A seat paid for with a voucher did not cost its ticket price, so the effective fee becomes the
     * voucher's item rather than the room's ticket. That flips IsFree and zeroes Multiplier (an Item
     * fee has no currency amount to divide by).
     */
    private getYourFee;
    /**
     * Resolves display names/avatars/borders for a set of platform user ids.
     *
     * Hits the PLATFORM host with the user's PLATFORM token - the game JWT is not valid there.
     * Returns a lookup keyed by platform id, EMPTY on any failure: names are cosmetic, so a bad or
     * expired platform token degrades the leaderboard to blank names instead of throwing away a
     * perfectly good set of scores and places.
     */
    private getUsersInfo;
    /**
     * RoomViewModel.EntryFeeUSDT for a room type and tier.
     * External rooms use a different scale from in-platform ones; unknown/Free tiers are worth 0.
     */
    private entryFeeUsdt;
    /**
     * Composes a RoomViewModel from a raw room config.
     *
     * `vouchers` must already be loaded - the voucher match drives UserCanJoinWithVoucher, which
     * JoinRoom uses to decide whether to spend a voucher. Pass [] only where there is no user to
     * hold vouchers (GetRoomPublic).
     */
    private mapRoomConfig;
    /** Composes a TierViewModel from a /Rooms/tiers entry. */
    private mapTier;
    /** Maps a /User/vouchers entry (snake_case) onto the public PascalCase VoucherData model. */
    private mapVoucher;
    /**
     * Fresh random v4 UUID: the idempotency key of a join attempt, a craft or a fusion; the id of a
     * practice run.
     *
     * crypto.randomUUID() is only exposed in secure contexts, so it is absent (or throws) on plain
     * HTTP - which games served over http:// do hit. Fall back to getRandomValues, and only then to
     * Math.random, keeping the RFC 4122 v4 layout in every case.
     */
    private newIdempotencyKey;
    /** Fetches one bare room config. GET /Rooms/get-room returns it with no envelope. */
    private getRoomConfig;
    GetTiers(): Promise<TierViewModel[]>;
    /**
     * Lists rooms of the given type.
     * Vouchers are loaded first so each room's Voucher/UserCanJoinWithVoucher resolve, and the
     * pre-paid list is applied afterwards.
     *
     * The voucher fetch FORCE-REFRESHES (useCache=false). This is not incidental: joining a room
     * SPENDS a voucher, so a cached count goes stale the moment the player enters. Serving a stale
     * Count>0 would leave UserCanJoinWithVoucher true, JoinRoom would derive useVoucher=true, and the
     * server would reject the join - locking the player out of a room they can actually afford.
     */
    GetRooms(roomType?: number, limit?: number): Promise<RoomViewModel[]>;
    /**
     * Fetches one room as the signed-in user sees it.
     * Force-refreshes vouchers for the same reason GetRooms does - and it matters more here,
     * because JoinRoom calls this to decide whether to spend one.
     */
    GetRoom(roomId: string): Promise<RoomViewModel>;
    /**
     * Fetches a room without a user token (dedicated servers, pre-login screens).
     *
     * Vouchers belong to a user, and this call is unauthenticated, so there are none to match:
     * Voucher stays undefined and UserCanJoinWithVoucher false. Use GetRoom when a user is signed in.
     */
    GetRoomPublic(id: string): Promise<RoomViewModel>;
    /**
     * Composes a room's prize table.
     *
     * There is NO endpoint for this - the SDK builds it client-side from the room config.
     */
    GetPrizePoolDistribution(roomGuid: string): Promise<PrizePoolDistributionViewModel>;
    /**
     * Resolves a room's tier from its event id, using the rooms list cached by the last GetRooms
     * call and fetching it first if there is none. Returns null for an unknown event id.
     *
     * @param roomType Which list to populate on a cache miss, matching GetRooms' own parameter
     *                 (0 = singleplayer, 1 = multiplayer). Pass 1 for a multiplayer event id:
     *                 otherwise the miss path fetches singleplayer rooms and the id is never found.
     *                 Defaults to 0 to match GetRooms and keep existing callers working.
     */
    GetTierByEventId(eventId: string, roomType?: number): Promise<RoomTier | null>;
    GetRoomSettings(eventId: string): Promise<any>;
    /**
     * Lists the rooms the user has already paid to enter and may still play.
     * GetRooms uses this to set IsPrePaid; call it directly to read attempts_left.
     */
    GetPrePaid(): Promise<PrePaidRoomData[]>;
    GetHistory(page: number, filters?: string, limit?: number, cursor?: string): Promise<any>;
    GetRoomHistoryDetails(sessionId: string, withEvent?: boolean): Promise<any>;
    /** Fetches the raw leaders payload. GET /Rooms/leaders returns it with no envelope. */
    private getRoomLeaders;
    /**
     * Composes the end-of-room leaderboard.
     *
     * /Rooms/leaders alone answers almost none of this model: it carries ids, scores and places, but
     * the room's name/tier/fee live on the room config, the players' names live on the PLATFORM host,
     * and whether you paid with a voucher lives on the session history. So this fans out to all four
     * and joins them. The three independent legs run concurrently; only the name lookup is
     * sequential, because it needs the ids that /Rooms/leaders returns.
     *
     * Behaviour worth knowing:
     *   - LeaderboardItems is always populated (possibly empty), even when you are not on the board
     *     (a spectator).
     *   - Your prizes always come from the room's prize_distribution for your place, not from the
     *     leader's own `prizes`: a placed (unsettled) room reports `prizes: []` on every leader, so
     *     the distribution is the only source that can answer "what did I win" before settlement.
     */
    GetLeaderboard(eventId: string, sessionId: string, matchId?: string): Promise<RoomLeaderboardViewModel>;
    /**
     * Joins a room and returns the session to play it under.
     *
     * Two legs:
     *   1. POST /Rooms/join-room reserves the seat and hands back a short-lived lobby quote.
     *   2. POST /Rooms/start-room-sp converts that quote into the real game session.
     * A player who had already joined skips leg 2 - the server returns their existing session on
     * leg 1 and there is no quote to convert.
     *
     * `idempotencyKey` is a REQUIRED query param: without it the request is rejected with a 400.
     * A fresh key per call is what makes the retry safe.
     *
     * @param useVoucher Spend a free-entry voucher instead of the entry fee. Omit to let the room
     *                   decide via UserCanJoinWithVoucher, which is what the platform UI does.
     */
    JoinRoom(roomGuid: string, useVoucher?: boolean): Promise<RoomSessionData>;
    /**
     * Signals the server that gameplay has started, and resolves the session to play under.
     *
     * Returns the public RoomSessionData rather than the raw wire object: WireJoinRoomResponse is
     * internal and unexported, so a TypeScript game could not name this method's return type and
     * had to reach for the wire's `.id` itself. The wire block stays internal; `.id` is mapped onto
     * SessionOrMatchId here, which is the same value JoinRoom hands back.
     *
     * @param isLobby Declares that `sessionOrMatchId` is a lobby-quote id rather than an existing
     *                game-session id - it is not a mode switch. JoinRoom's second leg passes true;
     *                a caller resuming a session it already owns leaves it false.
     */
    StartRoomSP(eventId: string, sessionOrMatchId: string, isLobby?: boolean): Promise<RoomSessionData>;
    /**
     * Registers the player in a match of an external (PvP) room that your own matchmaking formed.
     *
     * Every player of the match calls it with the same matchId: a UUID your game server makes once
     * per match. The room's entry fee, if any, is charged here. When the match is over, your game
     * server reports every player's final score under the same matchId with FinishRoomSession_Server;
     * prizes are paid by place once every player of the match has a score.
     *
     * JoinRoom is for regular rooms: it takes no match id, so it cannot put two chosen players into
     * the same match.
     *
     * Calling it again for the same match resolves to the same match, so a retry is safe. If the
     * player still has an unfinished game in this room under another id, this rejects: that game has
     * to be finished first.
     *
     * @param eventId    The room's id (an external room: GetRooms(2) lists them).
     * @param matchId    The match's UUID, the same for all of its players.
     * @param password   The room's password, for a room that has one.
     * @param useVoucher Spend a free-entry voucher instead of the entry fee.
     * @returns The room session to report under; SessionOrMatchId is the match id.
     */
    JoinExternalMatch(eventId: string, matchId: string, password?: string, useVoucher?: boolean): Promise<RoomSessionData>;
    /**
     * Ends a room session and sends the player's encrypted score to the game API (Client-side).
     *
     * The score is encrypted and signed with privateGameKey (or by the payloadSigner). If this fails
     * with HTTP 500 "Padding is invalid and cannot be removed", the privateGameKey is wrong.
     *
     * A failed submit, also one the signer could not sign, rejects and keeps the client session, its
     * events and its counts, so a retry sends them again.
     */
    EndRoomSP(eventId: string, sessionOrMatchId: string, score: number, userId: number, ip?: string, gameEvents?: string[]): Promise<any>;
    /**
     * Aliases the tournament identifier onto `Id`/`Guid`.
     *
     * The wire's own `Id` is always 0 and is not accepted by any endpoint; the usable identifier is
     * `Plaftorfm_Guid`. Spreading the wire object first means every field the platform sends survives
     * untouched - this only adds names, it never drops or renames anything.
     */
    private mapTournament;
    /**
     * Aliases Points -> Score, Name -> UserName and user_avatar.url -> AvatarUrl.
     * Same rule as mapTournament: additive only, the raw wire fields stay on the object.
     */
    private mapTournamentPlayer;
    GetTournaments(page?: number, perPage?: number, filter?: TournamentsFilterEnum): Promise<TournamentViewModel[]>;
    GetTournamentDetailsLight(tournamentId: string): Promise<TournamentViewModel>;
    GetTournamentLeaderboard(tournamentId: string): Promise<TournamentLeaderboardViewModel>;
    GetTournamentCommunities(tournamentId: string): Promise<TournamentCommunityViewModel[]>;
    /**
     * Joins a special tournament. Must be called before EnterTournament — the platform rejects an
     * enter with "Tournament score/session not found. Use join endpoint to join the tournament."
     * until a join has landed. A fresh join is also required after each scored enter.
     */
    JoinTournament(tournamentId: string, communityId?: string, password?: string): Promise<boolean>;
    EnterTournament(tournamentId: string): Promise<TournamentEnterData>;
    /**
     * Fetches a tournament's prize table.
     * Returns an object wrapping the place list; `Prizes` is empty when the tournament has no prizes.
     */
    GetPrizes(tournamentId: string): Promise<TournamentPrizesViewModel>;
    GetTournamentsHistory(page?: number, perPage?: number): Promise<TournamentHistoryViewModel>;
    /**
     * Submits a special tournament game result from a trusted Dedicated Server.
     */
    ResultTournament_Server(tournamentId: string, saveScoreId: string, score: number, userId: number, isSuccess: boolean, ip?: string): Promise<TournamentResultViewModel>;
    /**
     * Submits an encrypted special tournament game result from a Client build.
     */
    ResultTournament_Client(tournamentId: string, saveScoreId: string, score: number, isSuccess: boolean, customData?: string): Promise<boolean>;
    /**
     * Submits the result of a practice run, encrypted and signed with privateGameKey (or by the
     * payloadSigner). Call it once, when the run is over. The result is ranked in the Hall of Fame as
     * a Practice result.
     *
     * What the run recorded goes with the result: the counts from RecordCollected_Client (keys your
     * game has opened for practice can pay rewards) and the events from RecordEvent_Client. Pass
     * options.collected or options.gameEvents to send your own instead. Empty counts and an empty
     * event list are left out of the payload.
     *
     * Each practice run carries an id the SDK makes for it. A failed submit (a rejection or a network
     * error) keeps that id, the recorded counts and the events, so calling again resends the same run
     * and its rewards are not paid twice. A delivered result clears the recorded counts and events
     * (also when you passed your own) and the next run gets a new id.
     *
     * Needs the player's UserId: the cached user data is used, and loaded first when none is cached.
     *
     * @param score The run's score. Fractional values are truncated toward zero, and the result must
     *              fit a 32-bit integer; otherwise this throws before anything is sent.
     * @returns true once the result is recorded. Rejects with an Error when the server refuses it.
     */
    CompletePractice(score: number, options?: CompletePracticeOptions): Promise<boolean>;
    /**
     * Fetches a page of the Hall of Fame ranking.
     * @param mode     Global (all-time) or Monthly (current calendar month, UTC).
     * @param page     1-based page index.
     * @param limit    Entries per page.
     * @param gameMode Restricts the ranking to a single mode; All applies no filter.
     */
    GetHallOfFame(mode: HallOfFamePeriodMode, page?: number, limit?: number, gameMode?: HallOfFameGameModeFilter): Promise<HallOfFameResponse>;
    /**
     * Fetches the Hall of Fame prize distribution table.
     */
    GetHallOfFameDistribution(): Promise<HOFDistributionResponse>;
    private mapHallOfFameGameMode;
    /**
     * Fetches whether this game has a campaign configured, plus its headline numbers.
     *
     * "No campaign" is DATA here, not an error: the endpoint always answers 200 and reports
     * IsAvailable false for a game without one. Gate the campaign menu button on the flag rather
     * than wrapping this call in try/catch for that case - a rejection means a real failure.
     *
     * Works BEFORE authentication: the endpoint does not require sign-in, so a pre-login menu can
     * gate its campaign button - only the game key is required. The JWT is attached when
     * one exists, but its absence does not throw, unlike every other Campaign method.
     *
     * Shares the SDK-wide cache window (FunticoConfig.cacheTTL) with the other cached getters.
     */
    GetCampaignAvailability(useCache?: boolean): Promise<CampaignAvailabilityViewModel>;
    /** Returns the availability already held in memory - no network call, no TTL check. */
    GetCachedCampaignAvailability(): CampaignAvailabilityViewModel | null;
    /** Convenience shorthand for `(await GetCampaignAvailability(useCache)).IsAvailable`. */
    IsCampaignAvailable(useCache?: boolean): Promise<boolean>;
    /**
     * Fetches the campaign level list with the player's progress folded in.
     *
     * Always a 200 on the wire - an empty campaign comes back as IsAvailable false with Levels []
     * - so a rejection here is a real failure, not "no campaign". A Locked level arrives with its
     * LevelConfigJson and StarRules deliberately withheld (null); render it as a lock icon from
     * Status and BestStars alone.
     *
     * The cached copy is dropped automatically by a successful CompleteCampaignLevel, because a
     * completion can unlock the next level server-side - refetch after completing to render the
     * unlock cascade.
     */
    GetCampaignLevels(useCache?: boolean): Promise<CampaignLevelsViewModel>;
    /** Returns the level list already held in memory - no network call, no TTL check. */
    GetCachedCampaignLevels(): CampaignLevelsViewModel | null;
    /**
     * Parses a level's opaque config JSON into your game's own type.
     *
     * The schema is YOUR game's - the platform stores the string untouched and the SDK never
     * inspects it, so define your own interface and pass it as T. Throws a plain Error when the
     * level is still Locked (the server withholds the config until unlock) or when the stored
     * string is not valid JSON.
     */
    GetCampaignLevelConfig<T = unknown>(level: CampaignLevelViewModel): T;
    /**
     * Starts an attempt at a level and tracks it as THE active attempt.
     *
     * Re-starting - the same level or another - simply replaces the tracked attempt: the server
     * abandons the old one, so there is nothing to clean up client-side. Rejects with a
     * CampaignError (LevelLocked, LevelNotFound, CampaignNotAvailable) when the level cannot be
     * started.
     */
    StartCampaignLevel(levelId: string): Promise<CampaignAttemptData>;
    /** The attempt StartCampaignLevel is currently tracking, or null when none is in flight. */
    GetActiveCampaignAttempt(): CampaignAttemptData | null;
    /**
     * Clears the tracked attempt LOCALLY - no server call. There is no abandon endpoint; the
     * server-side attempt simply lapses, or is replaced by the next StartCampaignLevel.
     */
    AbandonCampaignAttempt(): void;
    /**
     * Submits a finished run's metrics, encrypted and signed, and returns the graded outcome.
     *
     * Losing is a NORMAL resolution (IsWin false, Stars 0), not a rejection - render the defeat
     * screen from the returned result. Stars are computed SERVER-side from the level's star
     * rules; nothing the client sends can claim them directly.
     *
     * Metrics are validated and normalized BEFORE anything is encrypted (violations throw a
     * CampaignError with Code InvalidMetrics client-side): 1-32 entries, each name 1-64 chars,
     * each value a finite number or a boolean. Booleans become 1/0; numbers pass through
     * UNTRUNCATED - fractional values are legal, unlike EndRoomSP's int Score.
     *
     * Events recorded via RecordEvent_Client are folded into the encrypted payload, the same way
     * EndRoomSP folds them into a room score; the log is reset once a submission delivers them.
     *
     * On failure the tracked attempt survives only for retryable failures (network, Unknown).
     * AttemptNotFound and CompletionTooFast both leave the server-side attempt dead - unknown,
     * or abandoned by the too-fast rejection itself - so a retry can never succeed and tracking
     * is cleared before rethrowing. On success the attempt is consumed and the cached level list
     * is dropped: the unlock cascade is server business, so the next GetCampaignLevels refetches.
     *
     * @param attempt Submit against this attempt instead of the tracked one - e.g. one restored
     *                from your own storage after a reload. Omit it to use the attempt
     *                StartCampaignLevel tracked; with neither, throws CampaignError with Code
     *                NoActiveAttempt before any I/O. Completing a passed attempt never clobbers
     *                a DIFFERENT attempt the SDK is tracking.
     */
    CompleteCampaignLevel(metrics: CampaignMetrics, attempt?: CampaignAttemptData): Promise<CampaignCompletionResult>;
    /**
     * Validates the metrics contract and normalizes values for the wire.
     * Throws CLIENT-side with the same InvalidMetrics code the server would answer with, so a
     * game handles both origins through one branch.
     */
    private normalizeCampaignMetrics;
    /**
     * Reads a non-2xx Campaign response and throws the matching CampaignError.
     * The body contract is {Error, Message}; an unrecognised identifier or an unparsable body
     * maps to CampaignErrorCode.Unknown with whatever text was readable.
     */
    private throwCampaignError;
    private mapCampaignAvailability;
    /**
     * Composes the public level model from the wire shape.
     * LevelJsonData is renamed onto LevelConfigJson, and StarRulesJson is PARSED into StarRules -
     * with a try/catch, so one level's garbage rules cannot kill the whole list.
     */
    private mapCampaignLevel;
    /** Strict on purpose: an unknown status int is a contract break, not something to default. */
    private mapCampaignLevelStatus;
    /** Null in, null out - and null on garbage too: locked levels and bad JSON both render ruleless. */
    private parseCampaignStarRules;
    private mapCampaignReward;
    private mapCampaignCompletion;
    UserHasUnfinishedSession_Client(): Promise<UnfinishedSessionsResponse>;
    ReconnectToUnfinishedSession_Client(id: string): Promise<string>;
    CreateSession_Client(json: string, gameType: GameTypeEnum, eventId: string, saveSessionId: string): Promise<SavedSessionResponse>;
    UpdateSession_Client(json: string): Promise<boolean>;
    /**
     * Closes active local client session tracking.
     */
    CloseCurrentSession_Client(): void;
    RecordEvent_Client(eventInfo: string): void;
    GetCurrentSessionEvents_Client(): string[];
    /**
     * Counts an item the player collected during the current run, such as a chest. The counts are
     * sent with the result by EndRoomSP, ResultTournament_Client and CompletePractice, also when the
     * run was lost.
     *
     * @param key The reward key agreed for your game, for example "chest_1".
     * @param count How many to add. Use it to re-record what a resumed run had collected.
     */
    RecordCollected_Client(key: string, count?: number): void;
    /**
     * Returns a copy of what the current run has collected so far, by reward key.
     */
    GetCurrentSessionCollected_Client(): Record<string, number>;
    private getCollectedPayload;
    /**
     * Fetches the items the player owns on the Funtico platform.
     *
     * By default only the items that belong to this game are returned. Pass
     * `includeOtherItems = true` to also receive platform-wide items the player holds, such as
     * tickets, vouchers and capsules.
     *
     * Items are granted by the platform and by server-side flows, never from the game client; the
     * client can only exchange them by the game's recipes and fusions (CraftItem, FuseItems).
     * Rejects with an InventoryError; on `ReloginRequired`, sign the player in to this game again.
     *
     * Shares the SDK-wide cache window (FunticoConfig.cacheTTL) with the other cached getters.
     */
    GetInventory(useCache?: boolean, includeOtherItems?: boolean): Promise<InventoryResponse>;
    /** Returns the inventory already held in memory - no network call, no TTL check. */
    GetCachedInventory(includeOtherItems?: boolean): InventoryResponse | null;
    /** Finds an owned item by your game's own item key, or null when the player has none. */
    FindInventoryItem(inventory: InventoryResponse, gameItemId: string): InventoryItem | null;
    /**
     * Parses an item's PropertiesJson into your game's own type.
     *
     * Returns null when the item has no properties. Throws a plain Error when the stored string is
     * not valid JSON.
     */
    GetInventoryItemProperties<T = unknown>(item: InventoryItem): T | null;
    /**
     * The crafting recipes and fusions of this game: what CraftItem and FuseItems can do.
     *
     * Always calls the server. Rejects with an InventoryError.
     */
    GetRecipes(): Promise<RecipesResponse>;
    /**
     * Crafts by a fixed recipe: takes the recipe's Inputs from the player and gives its Outputs.
     *
     * @param recipe         CraftRecipe.Key.
     * @param id             Fills "{id}" in the recipe's item keys: 1-48 characters of a-z, 0-9 and _.
     *                       Pass null for a recipe whose HasId is false.
     * @param idempotencyKey Optional: 8-64 characters of A-Z, a-z, 0-9 and _ . : -. Calls with the same
     *                       key are one action, done at most once. Omit it and the SDK generates a new
     *                       key for this call (returned in CraftResult.IdempotencyKey).
     *
     * Resolves with the outcome when it is Succeeded, Pending or Refused: a refusal is a normal result,
     * not an error. On Pending, call again with the same arguments and result.IdempotencyKey. After
     * Succeeded or Pending the cached inventory is dropped, so the next GetInventory reads fresh.
     * Rejects with an InventoryError for anything else.
     */
    CraftItem(recipe: string, id?: string | null, idempotencyKey?: string | null): Promise<CraftResult>;
    /**
     * Fuses copies the player picked: takes them and gives one random item of the fusion's Results.
     *
     * @param fusion         FusionRecipe.Key.
     * @param userItemIds    Exactly `Need` copy ids, each once, taken from InventoryItem.UserItemIds of
     *                       items listed in the fusion's Inputs. Copies that do not fit reject with
     *                       `WrongItems`.
     * @param idempotencyKey Optional, as for CraftItem.
     *
     * Resolves and rejects like CraftItem.
     */
    FuseItems(fusion: string, userItemIds: number[], idempotencyKey?: string | null): Promise<CraftResult>;
    /**
     * The player's latest rewards in this game, newest first: what runs (RecordCollected_Client),
     * campaign levels and arena runs paid. Call it after a result to show what the run brought.
     *
     * @param limit 1-100, default 20.
     * @param since Only rewards created at or after this moment, for example when the run started.
     *
     * Always calls the server. Rejects with an InventoryError. A reward that could not reach the
     * platform yet is listed as Queued and delivered later, at the latest on the player's next login.
     */
    GetRecentRewards(limit?: number, since?: Date | null): Promise<RecentRewardsResponse>;
    private mapRecentReward;
    private mapInventoryItem;
    private mapCraftRecipe;
    private mapFusionRecipe;
    /**
     * Sends a craft or a fusion. 200, 202 and 422 answer with the outcome; a 422 without `Status`
     * and every other failure carry an Inventory error body instead.
     */
    private postCraftAction;
    private mapCraftResult;
    /** `bodyText`: the response body when the caller has already read it. */
    private throwInventoryError;
    /** The game's ghost pools, their attributes and the player's rating in each. */
    GetGhostPools(): Promise<GhostPool[]>;
    /** The player's active run in the pool and its open match, if any (resume after a reload). */
    GetGhostRun(pool: string): Promise<GhostRunState>;
    /**
     * Starts a run in a pool with runs, or returns the active one.
     *
     * In a paid pool (GhostPool.Entry set) this charges the entry, once per run: calling it again
     * resumes the same run and never charges again. Rejects with `InsufficientFunds`, `KycRequired`
     * or `EntryUnavailable` when the entry cannot be paid (no run is started), and with
     * `PaymentPending` while the payment is not confirmed yet - call it again later.
     */
    StartGhostRun(pool: string): Promise<GhostRunState>;
    /**
     * Gives up the active run. An open match counts as not reported (usually a loss).
     *
     * In a paid pool, abandoning before the run got its first opponent refunds the entry (the run's
     * Entry.Status becomes Refunded, or RefundPending while the refund is on its way). After an
     * opponent was issued there is no refund.
     */
    AbandonGhostRun(pool: string): Promise<GhostRunState>;
    /**
     * Finds an opponent. Pass the values of the pool's attributes (attributes bound to the run may
     * be omitted: the server fills them) and, optionally, the player's own ship to store in the
     * same request. Searching again before reporting returns the same match.
     *
     * Rejects with GhostError; `NoOpponent` is a normal outcome. In a paid pool it rejects with
     * `PaymentPending` until the run's entry payment is confirmed (see StartGhostRun).
     */
    FindGhostOpponent(pool: string, attributes: Record<string, number>, options?: GhostFindOptions): Promise<GhostFindResult>;
    /** Stores the player's ship (your game's JSON as a string) without searching. */
    UploadGhostSnapshot(pool: string, attributes: Record<string, number>, snapshot: string): Promise<GhostUploadResult>;
    /**
     * Reports the fight of a match, once. A repeated report returns the first result. The result
     * is encrypted and signed like a campaign completion.
     *
     * @param fightHash Optional: your hash of the fight (up to 128 characters), kept with the match
     *                  so the fight can be checked later.
     * @param matchData Optional: your evidence for a later check of this fight, in your own format
     *                  (for example your run's log up to and including this fight). It is signed
     *                  together with the report and kept with the match; left out when empty. At most
     *                  32 KB in UTF-8: a larger one rejects with `DataTooLarge`, nothing is recorded
     *                  and the match stays open, so report again without it.
     */
    ReportGhostResult(matchId: string, outcome: GhostOutcome, fightHash?: string | null, matchData?: string | null): Promise<GhostReportResult>;
    /** What the player's ghosts did since the previous call; the call resets the "New" counters. */
    GetGhostReportSummary(pool: string): Promise<GhostReportSummary>;
    /** The player's fights and the fights against the player's ghosts, newest first. */
    GetGhostHistory(pool: string, page?: number, limit?: number): Promise<GhostHistory>;
    /**
     * Players of the pool's season ranked by rating, plus the player's own place. Only players who
     * fought this season are ranked. Pass `partition` to read a past season.
     */
    GetGhostLeaderboard(pool: string, page?: number, limit?: number, partition?: string | null): Promise<GhostLeaderboard>;
    private ghostRunCall;
    private mapGhostMatch;
    private mapGhostRun;
    private throwGhostError;
    /** The chain's open goal (or its latest while the next one is not open yet) and the player's own state. */
    GetCommunityGoal(chainKey: string): Promise<CommunityGoalState>;
    /** Any goal of the game by id, open or past (e.g. the one NextGoalId names). */
    GetCommunityGoalById(goalId: string): Promise<CommunityGoalState>;
    /** The shared state only. Cheap; poll it no more often than PollAfterSeconds (or use WatchCommunityGoal). */
    GetCommunityGoalLive(goalId: string): Promise<CommunityGoalLive>;
    /**
     * Starts an attempt on an open goal, spending one of today's attempts. If the player already has
     * a live attempt in the chain, that one is returned again (Resumed = true, nothing spent) - also
     * when it belongs to another goal, so always play against the returned Goal. options.startData is
     * kept with a new attempt and comes back in Attempt.StartData on every resume.
     *
     * With options.paid the attempt is one of the chain's paid ones: the price is charged once per
     * attempt (calling again never charges twice) and the attempt is returned only when it is paid
     * (Entry.Status 'Charged'). It is paid back only if it never reached the player. After it was
     * handed out there is no refund, also when it expires unfinished.
     *
     * Rejects with CommunityGoalError: `GoalClosed` (load NextGoalId), `NoAttemptsLeft` (see ResetsAt),
     * `DataTooLarge`. Paid attempts: `NoPaidAttemptsLeft` (see ResetsAt), `InsufficientFunds`,
     * `KycRequired`, `EntryUnavailable` (nothing charged), `PaymentPending` (call again later),
     * `ReloginRequired`.
     */
    StartGoalAttempt(goalId: string, options?: StartGoalAttemptOptions): Promise<GoalAttemptStart>;
    /**
     * Completes an attempt with its contribution, once: a repeat returns the first result
     * (Replayed = true). The result is encrypted and signed like a campaign completion. An attempt
     * started before its goal closed still counts in full.
     *
     * Rejects with CommunityGoalError: `AttemptExpired`, `CompletionTooFast` (the attempt is used),
     * `InvalidContribution`, `DataTooLarge` (strikeData too long: nothing counted, send again without it).
     */
    CompleteGoalAttempt(attempt: Pick<GoalAttempt, 'AttemptId' | 'GoalId'>, contribution: number, options?: CompleteGoalAttemptOptions): Promise<GoalAttemptResult>;
    /** Contributors ranked by score (ties: who got there first), the player's own row and the rows around it. */
    GetCommunityGoalLeaderboard(goalId: string, page?: number, limit?: number): Promise<CommunityGoalLeaderboard>;
    /**
     * A player's best strike on a goal, by the BestStrikeId of their leaderboard row, with the strikeData
     * sent with it (for example to copy the build or replay the strike). Works before sign-in.
     *
     * Rejects with CommunityGoalError: `StrikeNotFound` (no longer that player's best: reload the leaderboard).
     */
    GetCommunityGoalStrike(goalId: string, strikeId: string): Promise<CommunityGoalStrike>;
    /**
     * The chain's past goals (closed or settled), newest first, with the signed-in player's part in
     * each: score, best strike, share of the goal, final place, bracket and reward status. Up to 20
     * per page. For one goal's full state and the rewards it paid, use GetCommunityGoalById.
     */
    GetCommunityGoalHistory(chainKey: string, page?: number, limit?: number): Promise<CommunityGoalHistory>;
    /**
     * Polls a goal's live state at the interval the server asks for and calls onChange whenever the
     * value, status or contributor count changes (and once at the start). Pauses while the page is
     * hidden, and stops by itself once the goal is settled (it never changes again). Call stop() when
     * the goal leaves the screen.
     */
    WatchCommunityGoal(goalId: string, onChange: (live: CommunityGoalLive) => void, options?: WatchCommunityGoalOptions): CommunityGoalWatch;
    /** X-User-Key always; the player's token only when signed in (Community Goal reads work before sign-in). */
    private getOptionalAuthHeaders;
    private mapCommunityGoalState;
    private mapGoalAttempt;
    private mapClosedBy;
    private mapCommunityGoal;
    private throwCommunityGoalError;
    /**
     * Registers a new multiplayer session on the API from a Dedicated Game Server.
     */
    CreateSession_Server(serverUrl: string, sessionId: string, playersInfo: ServerUserData[]): Promise<boolean>;
    /**
     * Reports that a player has left the server match session.
     */
    UserLeaveSession_Server(platformUserId: number): Promise<boolean>;
    /**
     * Closes active server match session on the API.
     */
    CloseCurrentSession_Server(): Promise<boolean>;
    /**
     * Reports the final scores of a finished match for all of its players in one call, from your
     * trusted game server. It is the last step of an external match (see JoinExternalMatch): pass the
     * match id as sessionId. The prizes are paid by place once every player of the match has a score.
     *
     * It authenticates as your game, so the private game key must be present: call it only from
     * server code, never from a browser build.
     *
     * The request body is a root `scores` array with one entry per participant, all under the same
     * match id. Every key is snake_case.
     *
     * Note `user_id` is the FUNTICO user id (FunticoUserId), not UserId; results (including Hall of
     * Fame) are recorded against it.
     *
     * A null Score means the player left or was kicked before finishing. GameManagedAward is sent
     * only when it is a number.
     *
     * AdditionalData and GameEvents are not transmitted; they stay on the parameter for source
     * compatibility.
     *
     * @returns true once every score is recorded. Rejects with the server's text when the call fails
     *          or any of the scores is refused; the local server-session tracking is then kept.
     */
    FinishRoomSession_Server(eventId: string, sessionId: string, participants: Array<{
        Score: number | null;
        UserId: number;
        FunticoUserId: number;
        UserIp: string;
        AdditionalData?: string;
        GameEvents?: string[];
        GameManagedAward?: number;
    }>): Promise<boolean>;
    RecordEvent_Server(platformUserId: number, eventInfo: string): void;
    GetCurrentSessionEvents_Server(platformUserId: number): string[];
}
/**
 * Framework-agnostic event wrapper around FunticoSDK - the plain-JavaScript equivalent of the
 * Phaser SDK's FunticoPhaserPlugin. Works in browsers, Telegram Mini App webviews and Node
 * (it uses no DOM EventTarget/CustomEvent).
 *
 * Every method calls the same FunticoSDK method and emits the same event, with the same payload
 * and at the same point, as FunticoPhaserPlugin does. Event names and values are identical to
 * FunticoPhaserPlugin.EVENTS, so code can be moved between the two SDKs unchanged.
 *
 * Deliberate differences from FunticoPhaserPlugin:
 *  - init() does NOT swallow errors. If FunticoSDK.Initialize rejects (including config
 *    validation - "Invalid FunticoConfig: ..."), init() rejects with that same error and emits
 *    nothing. The Phaser plugin logs and resolves instead, which hides a broken config.
 *  - Listener isolation. Events are dispatched synchronously, in registration order, over a
 *    snapshot of the listener list: a listener added during a dispatch first runs on the next
 *    emit; an on() listener removed during a dispatch still runs this once, while a pending
 *    once() listener removed during it - or by off() at any time before it fires - never runs;
 *    a once() listener never fires more than once. A listener that throws
 *    is reported with console.error and neither stops the remaining listeners nor makes the SDK
 *    call reject.
 *
 * Separate FunticoClient instances have separate listener sets but share the singleton SDK
 * (FunticoSDK.Instance).
 *
 * @example
 * const funtico = new FunticoClient();
 * funtico.on(FunticoClient.EVENTS.BALANCE_UPDATED, (balance) => render(balance));
 * await funtico.init({
 *   env: FunticoEnvironment.STAGING, // any value other than STAGING selects the production hosts
 *   publicGameKey: 'your-public-key',
 *   privateGameKey: 'your-private-key',
 *   userToken
 * });
 * // To keep the secret key on your own server, pass payloadSigner in place of privateGameKey
 * // (see PayloadSigner).
 */
export declare class FunticoClient {
    /** Event names. Keys and values are identical to FunticoPhaserPlugin.EVENTS. */
    static readonly EVENTS: {
        INITIALIZED: string;
        AUTHENTICATED: string;
        USER_DATA_UPDATED: string;
        BALANCE_UPDATED: string;
        CAMPAIGN_PROGRESS_UPDATED: string;
        INVENTORY_UPDATED: string;
    };
    /** The SDK singleton (always FunticoSDK.Instance). Use it for everything that has no event. */
    readonly sdk: FunticoSDK;
    private readonly listeners;
    constructor();
    /** Registers a listener for an event. `context` is used as `this` when the listener is called. */
    on(event: string, listener: (...args: any[]) => void, context?: any): this;
    /** Registers a listener that is removed right before its first invocation. */
    once(event: string, listener: (...args: any[]) => void, context?: any): this;
    /**
     * Removes listeners. Without `listener`, removes every listener of `event`. With `listener`,
     * removes the registrations of that function whose context matches (when `context` is omitted
     * it matches registrations made without a context).
     */
    off(event: string, listener?: (...args: any[]) => void, context?: any): this;
    private addListener;
    /** Removes one exact registration. Returns false if it was no longer registered. */
    private removeEntry;
    /**
     * Synchronous dispatch over a snapshot of the current listeners. A throwing listener is logged
     * and skipped so it cannot break the other listeners or the SDK call that triggered the event.
     */
    private emit;
    /**
     * Initializes the SDK (FunticoSDK.Initialize), then emits INITIALIZED and, if the SDK holds a
     * JWT afterwards, AUTHENTICATED with that JWT. Normally that is because config.userToken was
     * given and exchanged. Initialize never clears a JWT from an earlier login()/init() (the SDK is
     * a shared singleton), so re-initializing without userToken - even through a new FunticoClient -
     * still emits AUTHENTICATED with the old JWT; it is not a sign-out. Same as FunticoPhaserPlugin.init.
     *
     * Unlike FunticoPhaserPlugin.init, errors are NOT swallowed: an invalid config or a failed
     * authentication rejects this promise with the original error and nothing is emitted.
     */
    init(config: FunticoConfig | FunticoSignerConfig): Promise<void>;
    /** Exchanges a platform token for the game JWT (FunticoSDK.Authentication), then emits AUTHENTICATED(jwt). */
    login(platformToken: string): Promise<any>;
    /** Fetches the user profile (FunticoSDK.GetUserData), then emits USER_DATA_UPDATED(userData). */
    refreshUserData(useCache?: boolean): Promise<UserData>;
    /** Fetches the balance (FunticoSDK.GetBalance), then emits BALANCE_UPDATED(balance). */
    refreshBalance(useCache?: boolean): Promise<BalanceResponse>;
    /**
     * Fetches the campaign level list (FunticoSDK.GetCampaignLevels) and broadcasts it, so a
     * level-select screen can rebind without owning the request. Note the event payload differs
     * from completeCampaignLevel's: this emits the CampaignLevelsViewModel, that emits the
     * CampaignCompletionResult.
     */
    refreshCampaign(useCache?: boolean): Promise<CampaignLevelsViewModel>;
    /**
     * Submits a finished campaign run (FunticoSDK.CompleteCampaignLevel) and broadcasts the graded
     * outcome as CAMPAIGN_PROGRESS_UPDATED(CampaignCompletionResult).
     */
    completeCampaignLevel(metrics: CampaignMetrics): Promise<CampaignCompletionResult>;
    /**
     * Fetches the player's inventory (FunticoSDK.GetInventory) and broadcasts it as
     * INVENTORY_UPDATED, so an inventory screen can rebind without owning the request.
     */
    refreshInventory(useCache?: boolean, includeOtherItems?: boolean): Promise<InventoryResponse>;
}
export as namespace FunticoSDK;
