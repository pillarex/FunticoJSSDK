/*!
 * Funtico JS SDK v1.0.0
 *
 * GENERATED FILE - do not edit by hand.
 * Source: upstream/phaser/FunticoPhaserSDK.ts (sha256 c7bf79316029) + src/FunticoClient.ts (sha256 0883e1f8ab7b).
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
 * recognise (e.g. one added by a newer API version).
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
 * Funtico SDK - Core Service Facade.
 */
export declare class FunticoSDK {
    private static _instance;
    private config;
    private jwtToken;
    private apiUri;
    /** The Funtico PLATFORM host (user profiles), not the game's Rooms API. See FunticoConfig. */
    private funticoApiUri;
    private cachedUserData;
    private cachedBalance;
    private cachedVouchers;
    private cachedCampaignAvailability;
    private cachedCampaignLevels;
    private cacheExpiresAt;
    private lastRoomsResponse;
    private activeClientSessionDbId;
    private activeClientSessionId;
    private currentClientSessionId;
    private currentClientSessionEvents;
    private currentClientSessionCollected;
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
     */
    Initialize(config: FunticoConfig): Promise<void>;
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
     * computed from the game keys. The private key itself is never sent.
     *
     * Async because Web Crypto's sign() is.
     */
    private getServerHeaders;
    /**
     * Derives the per-user key used to encrypt session payloads. Requires user data to be loaded.
     */
    private getSessionEncryptionKey;
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
     * Fresh idempotency key per join attempt.
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
     * Ends a room session and sends the player's encrypted score to the game API (Client-side).
     *
     * The score is encrypted and signed with privateGameKey. If this fails with HTTP 500 "Padding is
     * invalid and cannot be removed", the privateGameKey is wrong.
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
     * sent with the result by EndRoomSP and ResultTournament_Client, also when the run was lost.
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
     * Submits multiplayer results for all match participants in one payload from Dedicated Server.
     *
     * The request body is a root `scores` array with one entry per participant, each of which
     * carries its own session id. Every key is snake_case.
     *
     * Note `user_id` is the FUNTICO user id (FunticoUserId), not UserId; results (including Hall of
     * Fame) are recorded against it.
     *
     * AdditionalData and GameEvents are not transmitted; they stay on the parameter for source
     * compatibility.
     */
    FinishRoomSession_Server(eventId: string, sessionId: string, participants: Array<{
        Score: number;
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
 */
export declare class FunticoClient {
    /** Event names. Keys and values are identical to FunticoPhaserPlugin.EVENTS. */
    static readonly EVENTS: {
        INITIALIZED: string;
        AUTHENTICATED: string;
        USER_DATA_UPDATED: string;
        BALANCE_UPDATED: string;
        CAMPAIGN_PROGRESS_UPDATED: string;
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
    init(config: FunticoConfig): Promise<void>;
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
}
