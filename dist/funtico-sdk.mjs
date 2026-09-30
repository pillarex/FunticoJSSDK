/*!
 * Funtico JS SDK v1.0.0
 *
 * GENERATED FILE - do not edit by hand.
 * Source: upstream/phaser/FunticoPhaserSDK.ts (sha256 2ecbb3e7ea99) + src/FunticoClient.ts (sha256 0883e1f8ab7b).
 * Regenerate with: npm run build
 */
/**
 * Environments supported by the Funtico SDK.
 */
export var FunticoEnvironment;
(function (FunticoEnvironment) {
    FunticoEnvironment["STAGING"] = "staging";
    FunticoEnvironment["PROD"] = "prod";
})(FunticoEnvironment || (FunticoEnvironment = {}));
/**
 * Currency/Entry Fee Types matching Funtico platform definitions.
 */
export var EntryFeeType;
(function (EntryFeeType) {
    EntryFeeType[EntryFeeType["IC"] = 1] = "IC";
    EntryFeeType[EntryFeeType["Tico"] = 2] = "Tico";
    EntryFeeType[EntryFeeType["SemifinalsTickets"] = 3] = "SemifinalsTickets";
    EntryFeeType[EntryFeeType["FinalTickets"] = 4] = "FinalTickets";
    EntryFeeType[EntryFeeType["Free"] = 5] = "Free";
    EntryFeeType[EntryFeeType["InventoryItem"] = 6] = "InventoryItem";
    EntryFeeType[EntryFeeType["PrivateTickets"] = 7] = "PrivateTickets"; // Private room tickets
})(EntryFeeType || (EntryFeeType = {}));
/**
 * Room Tier Enumeration.
 */
export var RoomTier;
(function (RoomTier) {
    RoomTier[RoomTier["Contender"] = 0] = "Contender";
    RoomTier[RoomTier["Challenger"] = 1] = "Challenger";
    RoomTier[RoomTier["Champion"] = 2] = "Champion";
    RoomTier[RoomTier["Free"] = 3] = "Free";
})(RoomTier || (RoomTier = {}));
/**
 * Lifecycle of a room's prize settlement, as reported by `state` on GET /Rooms/leaders.
 *
 * Values match the wire exactly: `placed = 0, distributed = 1, to_be_returned = 3, returned = 4`.
 * 2 is intentionally unused - it is NOT a transcription slip, so do not "fix" the gap.
 * The response carries the number, not the name.
 */
export var LeadersState;
(function (LeadersState) {
    /** Scores are in, prizes not settled yet. Drives IsPending. */
    LeadersState[LeadersState["placed"] = 0] = "placed";
    LeadersState[LeadersState["distributed"] = 1] = "distributed";
    LeadersState[LeadersState["to_be_returned"] = 3] = "to_be_returned";
    LeadersState[LeadersState["returned"] = 4] = "returned";
})(LeadersState || (LeadersState = {}));
/**
 * The `type` of a room config's `ticket`. Wire-level.
 *
 * NOT the same enum as EntryFeeType, despite both having a `Free` member: this one is Free = 0,
 * EntryFeeType is Free = 5. Comparing a ticket type against EntryFeeType.Free would classify every
 * room as not-free.
 */
var TicketType;
(function (TicketType) {
    TicketType[TicketType["Free"] = 0] = "Free";
    TicketType[TicketType["Currency"] = 1] = "Currency";
    TicketType[TicketType["Item"] = 2] = "Item";
})(TicketType || (TicketType = {}));
/**
 * Status filter for special tournaments.
 */
export var TournamentsFilterEnum;
(function (TournamentsFilterEnum) {
    TournamentsFilterEnum["OnGoing"] = "OnGoing";
    TournamentsFilterEnum["Upcoming"] = "Upcoming";
    TournamentsFilterEnum["Finished"] = "Finished";
})(TournamentsFilterEnum || (TournamentsFilterEnum = {}));
/**
 * Game Type Enumeration for Reconnection and Sessions.
 */
export var GameTypeEnum;
(function (GameTypeEnum) {
    GameTypeEnum[GameTypeEnum["Indirect_PVP"] = 0] = "Indirect_PVP";
    GameTypeEnum[GameTypeEnum["Direct_PVP"] = 1] = "Direct_PVP";
    GameTypeEnum[GameTypeEnum["Tournament"] = 3] = "Tournament";
    GameTypeEnum[GameTypeEnum["Rooms"] = 4] = "Rooms";
    GameTypeEnum[GameTypeEnum["Practice"] = 5] = "Practice";
    GameTypeEnum[GameTypeEnum["MultiplayerPvp"] = 6] = "MultiplayerPvp";
})(GameTypeEnum || (GameTypeEnum = {}));
/**
 * Player gameplay presence status on dedicated server.
 */
export var UserGameStatus;
(function (UserGameStatus) {
    UserGameStatus[UserGameStatus["Leave"] = 0] = "Leave";
    UserGameStatus[UserGameStatus["InGame"] = 1] = "InGame";
    UserGameStatus[UserGameStatus["Finished"] = 2] = "Finished";
})(UserGameStatus || (UserGameStatus = {}));
/**
 * Hall of Fame ranking period.
 */
export var HallOfFamePeriodMode;
(function (HallOfFamePeriodMode) {
    HallOfFamePeriodMode[HallOfFamePeriodMode["Global"] = 0] = "Global";
    HallOfFamePeriodMode[HallOfFamePeriodMode["Monthly"] = 1] = "Monthly";
})(HallOfFamePeriodMode || (HallOfFamePeriodMode = {}));
/**
 * Game mode filter for Hall of Fame rankings. Use this in game code.
 */
export var HallOfFameGameModeFilter;
(function (HallOfFameGameModeFilter) {
    HallOfFameGameModeFilter[HallOfFameGameModeFilter["All"] = 0] = "All";
    HallOfFameGameModeFilter[HallOfFameGameModeFilter["SpecialTournament"] = 1] = "SpecialTournament";
    HallOfFameGameModeFilter[HallOfFameGameModeFilter["Rooms"] = 2] = "Rooms";
    HallOfFameGameModeFilter[HallOfFameGameModeFilter["Practice"] = 3] = "Practice";
})(HallOfFameGameModeFilter || (HallOfFameGameModeFilter = {}));
/**
 * Wire `gameMode` query values for the /HallOfFame endpoints.
 * Deliberately offset by one from HallOfFameGameModeFilter, which has no `All` equivalent.
 * Wire-level detail - prefer HallOfFameGameModeFilter.
 */
export var HallOfFameGameMode;
(function (HallOfFameGameMode) {
    HallOfFameGameMode[HallOfFameGameMode["SpecialTournament"] = 0] = "SpecialTournament";
    HallOfFameGameMode[HallOfFameGameMode["Rooms"] = 1] = "Rooms";
    HallOfFameGameMode[HallOfFameGameMode["Practice"] = 2] = "Practice";
})(HallOfFameGameMode || (HallOfFameGameMode = {}));
/**
 * Prize types, as they appear in the `type` field of prize objects.
 */
export var PrizeType;
(function (PrizeType) {
    PrizeType["Item"] = "Item";
    PrizeType["DepositStakePoolShare"] = "DepositStakePoolShare";
    PrizeType["DepositStakePerPlayer"] = "DepositStakePerPlayer";
    PrizeType["GppPoolShare"] = "GppPoolShare";
    PrizeType["GppPerPlayer"] = "GppPerPlayer";
    PrizeType["External"] = "External";
    PrizeType["Placeholder"] = "Placeholder";
    PrizeType["Reward"] = "Reward";
    PrizeType["GameManagedReward"] = "GameManagedReward";
})(PrizeType || (PrizeType = {}));
/**
 * Helpers for computing the value of a prize list.
 */
export class PrizeUtils {
    /**
     * Calculates the calculated value of automated prizes based on the tournament deposit stake.
     */
    static calculatePrize(prizes, depositStake) {
        if (!prizes)
            return 0;
        let prizeValue = 0;
        for (const prize of prizes) {
            switch (prize.type) {
                case PrizeType.GppPoolShare: {
                    const gpp = prize;
                    if (gpp.Percentage !== undefined && gpp.Percentage !== null) {
                        prizeValue += Math.floor((gpp.Percentage * depositStake) / 100);
                    }
                    break;
                }
                case PrizeType.DepositStakePoolShare: {
                    const dsp = prize;
                    if (dsp.Percentage !== undefined && dsp.Percentage !== null) {
                        prizeValue += Math.floor((dsp.Percentage * depositStake) / 100);
                    }
                    break;
                }
                case PrizeType.DepositStakePerPlayer: {
                    const dsp = prize;
                    prizeValue += dsp.Value;
                    break;
                }
                case PrizeType.GppPerPlayer: {
                    const gpp = prize;
                    prizeValue += gpp.Value;
                    break;
                }
                // GameManagedReward is deliberately absent and MUST stay absent - it contributes 0.
                // Such a prize is granted by the game itself, not paid out of the deposit stake, so
                // counting its Value here would inflate YourTicoEarnings (and Multiplier with it) by an
                // amount the platform never pays. Do not "restore" this case for symmetry with GppPerPlayer.
            }
        }
        return prizeValue;
    }
}
/**
 * Campaign level lifecycle status. The wire sends it as an int.
 */
export var CampaignLevelStatus;
(function (CampaignLevelStatus) {
    CampaignLevelStatus[CampaignLevelStatus["Locked"] = 0] = "Locked";
    CampaignLevelStatus[CampaignLevelStatus["Unlocked"] = 1] = "Unlocked";
    CampaignLevelStatus[CampaignLevelStatus["Completed"] = 2] = "Completed";
})(CampaignLevelStatus || (CampaignLevelStatus = {}));
/**
 * Machine-readable codes carried by CampaignError.Code.
 *
 * All but two match the error identifiers the API returns, byte for byte. NoActiveAttempt is
 * CLIENT-side only - CompleteCampaignLevel throws it before any I/O when there is no attempt to
 * submit against. Unknown covers any body the SDK cannot parse and any identifier it does not
 * recognise (e.g. one added by a newer API version).
 */
export var CampaignErrorCode;
(function (CampaignErrorCode) {
    CampaignErrorCode["CampaignNotAvailable"] = "CampaignNotAvailable";
    CampaignErrorCode["LevelLocked"] = "LevelLocked";
    CampaignErrorCode["LevelNotFound"] = "LevelNotFound";
    CampaignErrorCode["NoActiveAttempt"] = "NoActiveAttempt";
    CampaignErrorCode["AttemptNotFound"] = "AttemptNotFound";
    CampaignErrorCode["InvalidSignature"] = "InvalidSignature";
    CampaignErrorCode["InvalidMetrics"] = "InvalidMetrics";
    CampaignErrorCode["CompletionTooFast"] = "CompletionTooFast";
    CampaignErrorCode["Unknown"] = "Unknown";
})(CampaignErrorCode || (CampaignErrorCode = {}));
/**
 * Error thrown by the Campaign methods, carrying a machine-readable Code alongside the
 * human-readable message. Branch on `Code`, never on message text.
 *
 * `instanceof CampaignError` is reliable: the constructor restores the prototype chain
 * explicitly, which extending the built-in Error otherwise breaks under ES5-era targets.
 */
export class CampaignError extends Error {
    constructor(code, message) {
        super(message);
        Object.setPrototypeOf(this, CampaignError.prototype);
        this.name = 'CampaignError';
        this.Code = code;
    }
}
/**
 * Cryptography helper class leveraging the browser Web Crypto API.
 * Produces the encrypted payloads and signatures the Funtico API expects.
 */
export class CryptoHelper {
    static formatKey(key) {
        if (key.length > 16) {
            return key.substring(0, 16);
        }
        else if (key.length < 16) {
            return key.padEnd(16, key[0] || '0');
        }
        return key;
    }
    /**
     * Encrypts plaintext using AES-128-CBC with PKCS7 padding and a static IV.
     */
    static async encrypt(plainText, keyStr) {
        const formattedKey = this.formatKey(keyStr);
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(formattedKey);
        const ivBytes = encoder.encode("1234567890123456"); // Static 16-byte IV
        const plainBytes = encoder.encode(plainText);
        const cryptoProvider = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
        const cryptoKey = await cryptoProvider.subtle.importKey("raw", keyBytes, { name: "AES-CBC", length: 128 }, false, ["encrypt"]);
        const encryptedBuffer = await cryptoProvider.subtle.encrypt({ name: "AES-CBC", iv: ivBytes }, cryptoKey, plainBytes);
        // Convert array buffer to base64
        const encryptedBytes = new Uint8Array(encryptedBuffer);
        let binary = "";
        for (let i = 0; i < encryptedBytes.byteLength; i++) {
            binary += String.fromCharCode(encryptedBytes[i]);
        }
        return btoa(binary);
    }
    /**
     * Decrypts ciphertext using AES-128-CBC with PKCS7 padding and a static IV.
     */
    static async decrypt(encryptedBase64, keyStr) {
        const formattedKey = this.formatKey(keyStr);
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(formattedKey);
        const ivBytes = encoder.encode("1234567890123456");
        // Decode base64 to binary string then to Uint8Array
        const binaryStr = atob(encryptedBase64);
        const cipherBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            cipherBytes[i] = binaryStr.charCodeAt(i);
        }
        const cryptoProvider = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
        const cryptoKey = await cryptoProvider.subtle.importKey("raw", keyBytes, { name: "AES-CBC", length: 128 }, false, ["decrypt"]);
        const decryptedBuffer = await cryptoProvider.subtle.decrypt({ name: "AES-CBC", iv: ivBytes }, cryptoKey, cipherBytes);
        return new TextDecoder().decode(decryptedBuffer);
    }
    /**
     * Computes HMAC-SHA256 signature represented as a hex string.
     */
    static async hmacSha256(message, keyStr) {
        const encoder = new TextEncoder();
        const keyBytes = encoder.encode(keyStr);
        const messageBytes = encoder.encode(message);
        const cryptoProvider = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
        const key = await cryptoProvider.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
        const signature = await cryptoProvider.subtle.sign("HMAC", key, messageBytes);
        return Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }
}
/**
 * Funtico SDK - Core Service Facade.
 */
export class FunticoSDK {
    constructor() {
        this.jwtToken = null;
        this.apiUri = "";
        /** The Funtico PLATFORM host (user profiles), not the game's Rooms API. See FunticoConfig. */
        this.funticoApiUri = "";
        // Caching mechanism
        this.cachedUserData = null;
        this.cachedBalance = null;
        this.cachedVouchers = null;
        this.cachedCampaignAvailability = null;
        this.cachedCampaignLevels = null;
        this.cacheExpiresAt = 0;
        // Raw room configs from the last GetRooms call, kept for GetTierByEventId.
        this.lastRoomsResponse = null;
        // Local client session storage (for reconnection and logging events)
        this.activeClientSessionDbId = null;
        this.activeClientSessionId = null; // Stored eventId
        this.currentClientSessionId = null; // Stored saveSessionId
        this.currentClientSessionEvents = [];
        // Campaign attempt tracking (client-side only; set by StartCampaignLevel)
        this.activeCampaignAttempt = null;
        // Dedicated server session tracking
        this.activeServerSessionId = null;
        this.activeServerSessionEvents = new Map(); // platformUserId -> eventLogs[]
    }
    static get Instance() {
        if (!this._instance) {
            this._instance = new FunticoSDK();
        }
        return this._instance;
    }
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
    static validateConfig(config) {
        const fail = (reason) => {
            throw new Error(`Invalid FunticoConfig: ${reason}`);
        };
        if (config === null || typeof config !== "object") {
            fail("config must be an object with at least publicGameKey and privateGameKey.");
        }
        const { publicGameKey, privateGameKey } = config;
        if (typeof publicGameKey !== "string" || publicGameKey.length === 0) {
            fail("publicGameKey is missing or empty. Pass the public key from the Developer Portal.");
        }
        if (typeof privateGameKey !== "string" || privateGameKey.length === 0) {
            fail("privateGameKey is missing or empty. Pass the secret key from the Developer Portal.");
        }
        // No issued key has surrounding whitespace; it is almost always a stray newline/CR (or a BOM)
        // from a .env file or a copy-paste. In privateGameKey it silently breaks every encrypted or
        // signed payload. In publicGameKey the effect is less uniform: fetch strips leading/trailing
        // space/tab/CR/LF from the X-User-Key header value, so ordinary requests would still work, but
        // the untrimmed key is also used for X-Server-Key (getServerHeaders), and a BOM or other
        // non-ASCII whitespace (which trim() also catches) makes fetch throw on the header. Both keys
        // are rejected so a broken .env fails fast and consistently.
        // Note: a publicGameKey with a trailing newline used to work for plain requests and is now
        // rejected here.
        if (publicGameKey !== publicGameKey.trim()) {
            fail("publicGameKey has leading or trailing whitespace (a stray newline/CR from a .env file or copy-paste?). Trim it.");
        }
        if (privateGameKey !== privateGameKey.trim()) {
            fail("privateGameKey has leading or trailing whitespace (a stray newline/CR from a .env file or copy-paste?). Trim it.");
        }
        // Every encrypted request needs at least 8 characters of privateGameKey; a shorter key is
        // rejected on every encrypted request, so it can never work.
        if (privateGameKey.length < 8) {
            fail(`privateGameKey is too short (${privateGameKey.length} characters, at least 8 required). Pass the full secret key from the Developer Portal.`);
        }
        if (privateGameKey === publicGameKey) {
            fail("privateGameKey is the same as publicGameKey. Pass the secret key from the Developer Portal in privateGameKey, not the public key.");
        }
        // Auth still works (it only uses the public key), but encrypted/signed payloads are built from
        // the wrong key material, so score submission fails (typically HTTP 500 "Padding is invalid" on
        // end-room-sp). Containment in either direction means the fields were mixed.
        if (privateGameKey.includes(publicGameKey) || publicGameKey.includes(privateGameKey)) {
            fail(`privateGameKey and publicGameKey overlap (privateGameKey is ${privateGameKey.length} characters, publicGameKey is ${publicGameKey.length}); the keys look concatenated or pasted into one field. Pass only the secret key from the Developer Portal in privateGameKey, and the public key alone in publicGameKey.`);
        }
    }
    /**
     * Initializes the Funtico SDK.
     * Automatically performs user authentication if token is provided.
     *
     * The config is validated first (see validateConfig); a rejected config throws before any state
     * is changed, so a previously initialized SDK keeps working with its old config.
     */
    async Initialize(config) {
        FunticoSDK.validateConfig(config);
        this.config = config;
        if (config.apiBaseUrl) {
            this.apiUri = config.apiBaseUrl;
        }
        else {
            this.apiUri = config.env === FunticoEnvironment.STAGING
                ? "https://funtico-sdk-staging.azurewebsites.net"
                : "https://funtico-sdk.azurewebsites.net";
        }
        if (config.funticoApiBaseUrl) {
            this.funticoApiUri = config.funticoApiBaseUrl;
        }
        else {
            this.funticoApiUri = config.env === FunticoEnvironment.STAGING
                ? "https://staging.api.funtico.com"
                : "https://api.funtico.com";
        }
        if (config.userToken) {
            await this.Authentication(config.userToken);
            await Promise.allSettled([
                this.GetUserData(false),
                this.GetBalance(false),
                this.GetVouchers(false)
            ]);
        }
    }
    /**
     * Exchanges platform token for the game's JWT token.
     */
    async Authentication(platformToken) {
        const response = await fetch(`${this.apiUri}/Auth/funtico-auth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Key": this.config.publicGameKey
            },
            body: JSON.stringify({ Token: platformToken })
        });
        if (!response.ok) {
            throw new Error(`Funtico Authentication failed: ${await response.text()}`);
        }
        const data = await response.json();
        this.jwtToken = data.Token;
        return data;
    }
    getPlatformToken() {
        return this.config.userToken || "";
    }
    getUserToken() {
        return this.jwtToken || "";
    }
    getAuthHeaders(includeContentType = true) {
        if (!this.jwtToken) {
            throw new Error("SDK is not authenticated. Call Initialize() or Authentication() first.");
        }
        const headers = {
            "X-User-Key": this.config.publicGameKey,
            "Authorization": `Bearer ${this.jwtToken}`
        };
        if (includeContentType) {
            headers["Content-Type"] = "application/json";
        }
        return headers;
    }
    /**
     * Headers for the dedicated-server endpoints.
     *
     * These endpoints require BOTH headers: X-User-Key (the public key) and X-Server-Key, which is
     * computed from the game keys. The private key itself is never sent.
     *
     * Async because Web Crypto's sign() is.
     */
    async getServerHeaders() {
        const serverKey = await CryptoHelper.hmacSha256(this.config.privateGameKey, this.config.publicGameKey);
        return {
            "Content-Type": "application/json",
            "X-User-Key": this.config.publicGameKey,
            "X-Server-Key": serverKey
        };
    }
    /**
     * Derives the per-user key used to encrypt session payloads. Requires user data to be loaded.
     */
    getSessionEncryptionKey() {
        const userId = this.cachedUserData?.UserId;
        if (userId === undefined) {
            throw new Error("User data is not loaded. Cannot derive session encryption key.");
        }
        const userGuidStr = userId.toString(16).padStart(8, '0');
        const privateKey = this.config.privateGameKey;
        const privateKeyPart = privateKey.substring(privateKey.length - 8);
        return userGuidStr + privateKeyPart;
    }
    /* ================= User Data Methods ================= */
    async GetUserData(useCache = true) {
        if (useCache && this.cachedUserData && Date.now() < this.cacheExpiresAt) {
            return this.cachedUserData;
        }
        const response = await fetch(`${this.apiUri}/User/get-full-data`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch user data");
        this.cachedUserData = await response.json();
        this.updateCacheExpiration();
        return this.cachedUserData;
    }
    GetCachedUserData() {
        return this.cachedUserData;
    }
    async GetBalance(useCache = true) {
        if (useCache && this.cachedBalance && Date.now() < this.cacheExpiresAt) {
            return this.cachedBalance;
        }
        const response = await fetch(`${this.apiUri}/User/get-balance`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch balance");
        this.cachedBalance = await response.json();
        this.updateCacheExpiration();
        return this.cachedBalance;
    }
    GetCachedBalance() {
        return this.cachedBalance;
    }
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
    async GetVouchers(useCache = true) {
        if (useCache && this.cachedVouchers && Date.now() < this.cacheExpiresAt) {
            return this.cachedVouchers;
        }
        const response = await fetch(`${this.apiUri}/User/vouchers`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch vouchers");
        const payload = await response.json();
        this.cachedVouchers = (payload.Data ?? []).map(voucher => this.mapVoucher(voucher));
        this.updateCacheExpiration();
        return this.cachedVouchers;
    }
    GetCachedVouchers() {
        return this.cachedVouchers;
    }
    async CanAfford(type, amount) {
        const balance = await this.GetBalance(false);
        return this.evaluateAffordability(balance, type, amount);
    }
    CanAffordFromCache(type, amount) {
        if (!this.cachedBalance)
            return false;
        return this.evaluateAffordability(this.cachedBalance, type, amount);
    }
    evaluateAffordability(balance, type, amount) {
        switch (type) {
            case EntryFeeType.Free:
                return true;
            case EntryFeeType.IC:
                return balance.Coins >= amount;
            case EntryFeeType.Tico:
                return balance.Diamonds >= amount;
            case EntryFeeType.SemifinalsTickets:
                return balance.SemiFinalTickets >= amount;
            case EntryFeeType.FinalTickets:
                return balance.FinalTickets >= amount;
            case EntryFeeType.PrivateTickets:
                return balance.PrivateTickets >= amount;
            default:
                return false;
        }
    }
    updateCacheExpiration() {
        const ttl = this.config.cacheTTL || 30000;
        this.cacheExpiresAt = Date.now() + ttl;
    }
    /* ================= Rooms Mapping Layer (wire -> ViewModel) =================
     *
     * The endpoints return raw wire shapes (snake_case configs inside PascalCase envelopes); the
     * public models are client-side COMPOSED ViewModels. These helpers are the bridge - without
     * them every field of every returned model reads undefined.
     */
    /**
     * A room is free when it has no ticket type, an explicitly Free one, or costs nothing.
     */
    isTicketFree(ticket) {
        return ticket.type === null || ticket.type === undefined || ticket.type === TicketType.Free ||
            ticket.currency_amount === null || ticket.currency_amount === undefined ||
            ticket.currency_amount === 0;
    }
    /**
     * The fee the user effectively paid for a seat.
     * A seat paid for with a voucher did not cost its ticket price, so the effective fee becomes the
     * voucher's item rather than the room's ticket. That flips IsFree and zeroes Multiplier (an Item
     * fee has no currency amount to divide by).
     */
    getYourFee(config, voucherUsed, vouchers) {
        if (!voucherUsed)
            return config.ticket;
        const voucher = vouchers.find(v => v.Tier === config.details.tier);
        if (voucher === undefined)
            return config.ticket;
        return {
            type: TicketType.Item,
            currency_amount: 1,
            item_id: voucher.ItemId,
            item: { id: voucher.ItemId, image: voucher.ItemImage, name: voucher.ItemName }
        };
    }
    /**
     * Resolves display names/avatars/borders for a set of platform user ids.
     *
     * Hits the PLATFORM host with the user's PLATFORM token - the game JWT is not valid there.
     * Returns a lookup keyed by platform id, EMPTY on any failure: names are cosmetic, so a bad or
     * expired platform token degrades the leaderboard to blank names instead of throwing away a
     * perfectly good set of scores and places.
     */
    async getUsersInfo(ids) {
        const result = new Map();
        if (ids.length === 0)
            return result;
        const query = ids.map(id => `ids[]=${id}`).join('&');
        try {
            const response = await fetch(`${this.funticoApiUri}/api/v1/web/users?${query}`, {
                headers: { "Authorization": `Bearer ${this.getPlatformToken()}` }
            });
            if (!response.ok)
                return result;
            const payload = await response.json();
            for (const user of payload.data ?? [])
                result.set(user.id, user);
        }
        catch {
            // Network/parse failure - same graceful degrade as a non-ok response.
        }
        return result;
    }
    /**
     * RoomViewModel.EntryFeeUSDT for a room type and tier.
     * External rooms use a different scale from in-platform ones; unknown/Free tiers are worth 0.
     */
    entryFeeUsdt(roomType, tier) {
        if (roomType === 'external') {
            switch (tier) {
                case RoomTier.Contender: return 2;
                case RoomTier.Challenger: return 4;
                case RoomTier.Champion: return 8;
                default: return 0;
            }
        }
        switch (tier) {
            case RoomTier.Contender: return 2;
            case RoomTier.Challenger: return 10;
            case RoomTier.Champion: return 20;
            default: return 0;
        }
    }
    /**
     * Composes a RoomViewModel from a raw room config.
     *
     * `vouchers` must already be loaded - the voucher match drives UserCanJoinWithVoucher, which
     * JoinRoom uses to decide whether to spend a voucher. Pass [] only where there is no user to
     * hold vouchers (GetRoomPublic).
     */
    mapRoomConfig(config, vouchers) {
        // A null details.tier leaves Tier at its default (0 = Contender). Deliberate.
        const tier = config.details.tier ?? RoomTier.Contender;
        // Matched against the RAW tier, not the defaulted one: a null-tier room matches no voucher.
        const voucher = vouchers.find(v => v.Tier === config.details.tier);
        const room = {
            Guid: config.id,
            Name: config.details.name,
            Tier: tier,
            EntryFee: config.ticket.currency_amount ?? 0,
            EntryFeeUSDT: this.entryFeeUsdt(config.type, tier),
            TotalPrize: config.computed.stake - config.computed.platform_fee,
            IsFree: this.isTicketFree(config.ticket),
            RequireKyc: false,
            UserCanJoinWithVoucher: voucher !== undefined && voucher.Count > 0 && voucher.PlayCount >= voucher.PlaysRequiredToActivate,
            // Set to true afterwards by GetRooms for any room listed in /Rooms/pre-paid.
            IsPrePaid: false
        };
        if (voucher !== undefined)
            room.Voucher = voucher;
        // Optional fields are assigned only when the wire actually carried them (non-null).
        if (config.details.description !== null)
            room.Description = config.details.description;
        if (config.details.has_password !== null)
            room.HasPassword = config.details.has_password;
        if (config.size !== null)
            room.RoomSize = config.size;
        return room;
    }
    /** Composes a TierViewModel from a /Rooms/tiers entry. */
    mapTier(tier) {
        return {
            Tier: tier.tier,
            TierName: tier.name,
            TierImage: tier.image,
            EntryFeeLowerBound: tier.lowerBoundEntryFee,
            EntryFeeUpperBound: tier.upperBoundEntryFee,
            Hidden: tier.hidden
        };
    }
    /** Maps a /User/vouchers entry (snake_case) onto the public PascalCase VoucherData model. */
    mapVoucher(voucher) {
        return {
            ItemId: voucher.item_id,
            ItemName: voucher.item_name,
            ItemImage: voucher.item_image,
            Tier: voucher.tier,
            Count: voucher.count,
            PlayCount: voucher.play_count,
            PlaysRequiredToActivate: voucher.plays_required_to_activate
        };
    }
    /**
     * Fresh idempotency key per join attempt.
     *
     * crypto.randomUUID() is only exposed in secure contexts, so it is absent (or throws) on plain
     * HTTP - which games served over http:// do hit. Fall back to getRandomValues, and only then to
     * Math.random, keeping the RFC 4122 v4 layout in every case.
     */
    newIdempotencyKey() {
        const cryptoProvider = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;
        if (cryptoProvider && typeof cryptoProvider.randomUUID === 'function') {
            try {
                return cryptoProvider.randomUUID();
            }
            catch {
                // Not a secure context - fall through.
            }
        }
        const bytes = new Uint8Array(16);
        if (cryptoProvider && typeof cryptoProvider.getRandomValues === 'function') {
            cryptoProvider.getRandomValues(bytes);
        }
        else {
            for (let i = 0; i < bytes.length; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10x
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
        return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-` +
            `${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
    }
    /** Fetches one bare room config. GET /Rooms/get-room returns it with no envelope. */
    async getRoomConfig(roomId) {
        const response = await fetch(`${this.apiUri}/Rooms/get-room?roomId=${roomId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch room details");
        return await response.json();
    }
    /* ================= Rooms & Tournament Methods ================= */
    async GetTiers() {
        const response = await fetch(`${this.apiUri}/Rooms/tiers`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch tournament tiers");
        const payload = await response.json();
        return (payload.data ?? []).map(tier => this.mapTier(tier));
    }
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
    async GetRooms(roomType = 0, limit = 10) {
        const vouchers = await this.GetVouchers(false);
        const response = await fetch(`${this.apiUri}/Rooms/get-rooms?roomType=${roomType}&limit=${limit}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch rooms list");
        const payload = await response.json();
        const configs = payload.Data ?? [];
        this.lastRoomsResponse = configs;
        const rooms = configs.map(config => this.mapRoomConfig(config, vouchers));
        if (rooms.length === 0)
            return rooms;
        const prePaid = await this.GetPrePaid();
        for (const prePaidRoom of prePaid) {
            for (const room of rooms) {
                if (room.Guid === prePaidRoom.id)
                    room.IsPrePaid = true;
            }
        }
        return rooms;
    }
    /**
     * Fetches one room as the signed-in user sees it.
     * Force-refreshes vouchers for the same reason GetRooms does - and it matters more here,
     * because JoinRoom calls this to decide whether to spend one.
     */
    async GetRoom(roomId) {
        const vouchers = await this.GetVouchers(false);
        const config = await this.getRoomConfig(roomId);
        return this.mapRoomConfig(config, vouchers);
    }
    /**
     * Fetches a room without a user token (dedicated servers, pre-login screens).
     *
     * Vouchers belong to a user, and this call is unauthenticated, so there are none to match:
     * Voucher stays undefined and UserCanJoinWithVoucher false. Use GetRoom when a user is signed in.
     */
    async GetRoomPublic(id) {
        const response = await fetch(`${this.apiUri}/Rooms/get-room-public?id=${id}`, {
            headers: {
                "X-User-Key": this.config.publicGameKey
            }
        });
        if (!response.ok)
            throw new Error("Failed to fetch public room details");
        const config = await response.json();
        return this.mapRoomConfig(config, []);
    }
    /**
     * Composes a room's prize table.
     *
     * There is NO endpoint for this - the SDK builds it client-side from the room config.
     */
    async GetPrizePoolDistribution(roomGuid) {
        const config = await this.getRoomConfig(roomGuid);
        const totalPlayers = config.size ?? 1;
        const totalTicoAccumulated = config.computed.stake;
        const platformFee = config.computed.platform_fee;
        const prizePlaces = [];
        let ticoSharedViaPlaces = 0;
        for (const distribution of config.prize_distribution ?? []) {
            const ticoPrize = PrizeUtils.calculatePrize(distribution.prizes, config.computed.deposit_stake);
            ticoSharedViaPlaces += ticoPrize;
            const entryFee = config.ticket.currency_amount;
            const rewardFeeRatio = entryFee !== null && entryFee !== 0 && ticoPrize > 0 ? ticoPrize / entryFee : 0;
            prizePlaces.push({
                Place: distribution.place ?? 0,
                PlatformExp: distribution.xp?.base ?? 0,
                PlatformExpKyc: distribution.xp?.kyc ?? 0,
                RewardFeeRatio: rewardFeeRatio,
                Prizes: distribution.prizes
            });
        }
        return {
            PrizePlaces: prizePlaces,
            TotalTicoAccumulated: totalTicoAccumulated,
            TicoSharedViaPlaces: ticoSharedViaPlaces,
            TotalPlayers: totalPlayers,
            // TicoPerPlayer is an integer division, hence the floor.
            TicoPerPlayer: Math.floor(totalTicoAccumulated / totalPlayers),
            PlatformFeePercentage: config.prize_pool.platform_fee.value ?? 0,
            PlatformFee: platformFee,
            TotalTicoDistributedToPlayers: totalTicoAccumulated - platformFee
        };
    }
    /**
     * Resolves a room's tier from its event id, using the rooms list cached by the last GetRooms
     * call and fetching it first if there is none. Returns null for an unknown event id.
     *
     * @param roomType Which list to populate on a cache miss, matching GetRooms' own parameter
     *                 (0 = singleplayer, 1 = multiplayer). Pass 1 for a multiplayer event id:
     *                 otherwise the miss path fetches singleplayer rooms and the id is never found.
     *                 Defaults to 0 to match GetRooms and keep existing callers working.
     */
    async GetTierByEventId(eventId, roomType = 0) {
        if (this.lastRoomsResponse === null) {
            await this.GetRooms(roomType);
        }
        const config = this.lastRoomsResponse?.find(room => room.id === eventId);
        return config?.details.tier ?? null;
    }
    async GetRoomSettings(eventId) {
        const response = await fetch(`${this.apiUri}/Rooms/game-settings?eventId=${eventId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch room settings");
        return await response.json();
    }
    /**
     * Lists the rooms the user has already paid to enter and may still play.
     * GetRooms uses this to set IsPrePaid; call it directly to read attempts_left.
     */
    async GetPrePaid() {
        const response = await fetch(`${this.apiUri}/Rooms/pre-paid`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch pre-paid list");
        const payload = await response.json();
        return payload.data ?? [];
    }
    async GetHistory(page, filters, limit = 10, cursor) {
        let url = `${this.apiUri}/Rooms/history?page=${page}&limit=${limit}`;
        if (filters)
            url += `&filters=${encodeURIComponent(filters)}`;
        if (cursor)
            url += `&cursor=${encodeURIComponent(cursor)}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch rooms history");
        return await response.json();
    }
    async GetRoomHistoryDetails(sessionId, withEvent = true) {
        const response = await fetch(`${this.apiUri}/Rooms/get-history?sessionId=${sessionId}&withEvent=${withEvent}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch detailed room history");
        return await response.json();
    }
    /** Fetches the raw leaders payload. GET /Rooms/leaders returns it with no envelope. */
    async getRoomLeaders(eventId, sessionId, matchId) {
        let url = `${this.apiUri}/Rooms/leaders?eventId=${eventId}&session_or_match_id=${sessionId}`;
        if (matchId)
            url += `&matchId=${matchId}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch leaderboard");
        return await response.json();
    }
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
    async GetLeaderboard(eventId, sessionId, matchId) {
        const [leaders, history, config, user] = await Promise.all([
            this.getRoomLeaders(eventId, sessionId, matchId),
            this.GetRoomHistoryDetails(sessionId, false),
            this.getRoomConfig(eventId),
            this.GetUserData()
        ]);
        const names = await this.getUsersInfo((leaders.leaders ?? []).map(leader => leader.id));
        // A voucher-paid seat only changes the fee if we can still find the voucher it was paid with,
        // so the lookup is skipped entirely when the seat was paid for in currency.
        const voucherUsed = history.game_session?.voucher_used === true;
        let vouchers = [];
        if (voucherUsed) {
            try {
                vouchers = await this.GetVouchers();
            }
            catch {
                // Fee falls back to the room's ticket, exactly as it does for an unmatched voucher.
            }
        }
        const state = leaders.state;
        const yourFee = this.getYourFee(config, voucherUsed, vouchers);
        const items = (leaders.leaders ?? []).map(leader => {
            const item = {
                Place: leader.place,
                PlayerName: names.get(leader.id)?.name ?? "",
                Score: leader.score,
                UserId: leader.id
            };
            const avatarUrl = names.get(leader.id)?.avatar?.url;
            if (avatarUrl !== undefined)
                item.AvatarUrl = avatarUrl;
            return item;
        });
        // `id` on a leader is the PLATFORM id, so it joins against PlatformId - matching it against
        // UserData.UserId would silently never find you and report every player as unplaced.
        const you = (leaders.leaders ?? []).find(leader => leader.id === user.PlatformId);
        const yourPrizes = you !== undefined
            ? (config.prize_distribution ?? []).find(dist => dist.place === you.place)?.prizes ?? []
            : [];
        const yourTicoEarnings = PrizeUtils.calculatePrize(yourPrizes, config.computed.deposit_stake);
        return {
            State: state,
            IsPending: state === LeadersState.placed,
            ClosedUnsuccessfully: state === LeadersState.returned || state === LeadersState.to_be_returned,
            RoomName: config.details.name,
            // A null tier defaults to Challenger here - note this is a DIFFERENT default from
            // mapRoomConfig's Contender. Both are deliberate; do not reconcile them.
            RoomTier: config.details.tier ?? RoomTier.Challenger,
            IsFree: this.isTicketFree(yourFee),
            YourTicoEarnings: yourTicoEarnings,
            Multiplier: yourFee.type === TicketType.Currency && yourFee.currency_amount
                ? yourTicoEarnings / yourFee.currency_amount
                : 0,
            UserPlace: you !== undefined ? String(you.place) : "0",
            LeaderboardItems: items
        };
    }
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
    async JoinRoom(roomGuid, useVoucher) {
        let spendVoucher = useVoucher;
        if (spendVoucher === undefined) {
            const room = await this.GetRoom(roomGuid);
            spendVoucher = room.UserCanJoinWithVoucher;
        }
        const url = `${this.apiUri}/Rooms/join-room?idempotencyKey=${this.newIdempotencyKey()}&getLobbyQuote=true`;
        const response = await fetch(url, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                tournamentId: roomGuid,
                communityId: null,
                password: '',
                UseVoucher: spendVoucher
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to join room: ${await response.text()}`);
        }
        const joinResponse = await response.json();
        // Comes back as null (not "") on a first join, so null and blank both mean "not yet joined".
        const existingSession = joinResponse.game_session_id_or_match_id;
        if (typeof existingSession === 'string' && existingSession.trim().length > 0) {
            return { EventId: roomGuid, SessionOrMatchId: existingSession };
        }
        const lobbyQuoteId = joinResponse.lobby_quote?.id;
        if (!lobbyQuoteId) {
            // A locally generated id would only be rejected by the server, so fail loudly instead.
            throw new Error("Failed to join room: the server returned neither an existing session nor a lobby quote");
        }
        // StartRoomSP already returns RoomSessionData keyed on the eventId it was passed (roomGuid),
        // so this is the value JoinRoom promises - no re-wrapping needed.
        return await this.StartRoomSP(roomGuid, lobbyQuoteId, true);
    }
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
    async StartRoomSP(eventId, sessionOrMatchId, isLobby = false) {
        const url = `${this.apiUri}/Rooms/start-room-sp?eventId=${eventId}&sessionOrMatchId=${sessionOrMatchId}&isLobby=${isLobby}`;
        const response = await fetch(url, {
            method: "POST",
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to start gameplay session");
        const started = await response.json();
        return { EventId: eventId, SessionOrMatchId: started.id };
    }
    /**
     * Ends a room session and sends the player's encrypted score to the game API (Client-side).
     *
     * The score is encrypted and signed with privateGameKey. If this fails with HTTP 500 "Padding is
     * invalid and cannot be removed", the privateGameKey is wrong.
     */
    async EndRoomSP(eventId, sessionOrMatchId, score, userId, ip = "127.0.0.1", gameEvents = []) {
        const scorePayload = {
            // Score must be an integer: a fractional value fails with HTTP 500 rather than a validation
            // error. Truncate before it leaves the client.
            Score: Math.trunc(score),
            UserId: userId,
            Ip: ip,
            GameEvents: gameEvents.length > 0 ? gameEvents : this.currentClientSessionEvents
        };
        const plainText = JSON.stringify(scorePayload);
        const encryptionKey = sessionOrMatchId.substring(0, 8) + this.config.privateGameKey.substring(0, 8);
        const encryptedData = await CryptoHelper.encrypt(plainText, encryptionKey);
        const hashKey = this.config.privateGameKey.substring(8);
        const hash = await CryptoHelper.hmacSha256(encryptedData, hashKey);
        const response = await fetch(`${this.apiUri}/Rooms/end-room-sp?eventId=${eventId}&gameSessionIrOrMatchId=${sessionOrMatchId}`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                TournamentId: eventId,
                Hash: hash,
                EncryptedData: encryptedData
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to end gameplay session: ${await response.text()}`);
        }
        // Auto-close client session locally
        this.CloseCurrentSession_Client();
        return await response.json();
    }
    /* ================= Special Tournaments Methods ================= */
    /**
     * Aliases the tournament identifier onto `Id`/`Guid`.
     *
     * The wire's own `Id` is always 0 and is not accepted by any endpoint; the usable identifier is
     * `Plaftorfm_Guid`. Spreading the wire object first means every field the platform sends survives
     * untouched - this only adds names, it never drops or renames anything.
     */
    mapTournament(wire) {
        return { ...wire, Id: wire.Plaftorfm_Guid, Guid: wire.Plaftorfm_Guid };
    }
    /**
     * Aliases Points -> Score, Name -> UserName and user_avatar.url -> AvatarUrl.
     * Same rule as mapTournament: additive only, the raw wire fields stay on the object.
     */
    mapTournamentPlayer(wire) {
        return {
            ...wire,
            Score: wire.Points,
            UserName: wire.Name,
            AvatarUrl: wire.user_avatar?.url
        };
    }
    async GetTournaments(page = 1, perPage = 100, filter) {
        let url = `${this.apiUri}/SpecialTournaments/all-tournaments?page=${page}&perPage=${perPage}`;
        if (filter)
            url += `&filterEnum=${filter}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch special tournaments");
        const wire = await response.json();
        return wire.map(t => this.mapTournament(t));
    }
    async GetTournamentDetailsLight(tournamentId) {
        const response = await fetch(`${this.apiUri}/SpecialTournaments/light-tournament-details?tournamentId=${tournamentId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch tournament metadata");
        return this.mapTournament(await response.json());
    }
    async GetTournamentLeaderboard(tournamentId) {
        const response = await fetch(`${this.apiUri}/SpecialTournaments/get-special-tournament-leaderboard?tournamentId=${tournamentId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch tournament leaderboard");
        const wire = await response.json();
        const view = this.mapTournament(wire);
        view.Players = (wire.Players ?? []).map((p) => this.mapTournamentPlayer(p));
        view.CurrentPlayer = wire.CurrentPlayer ? this.mapTournamentPlayer(wire.CurrentPlayer) : undefined;
        return view;
    }
    async GetTournamentCommunities(tournamentId) {
        const response = await fetch(`${this.apiUri}/SpecialTournaments/get-tournaments-communities?tournamentId=${tournamentId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch tournament communities");
        return await response.json();
    }
    /**
     * Joins a special tournament. Must be called before EnterTournament — the platform rejects an
     * enter with "Tournament score/session not found. Use join endpoint to join the tournament."
     * until a join has landed. A fresh join is also required after each scored enter.
     */
    async JoinTournament(tournamentId, communityId, password) {
        let url = `${this.apiUri}/SpecialTournaments/join-tournament?tournamentId=${tournamentId}`;
        if (communityId)
            url += `&communityId=${communityId}`;
        if (password)
            url += `&password=${encodeURIComponent(password)}`;
        const response = await fetch(url, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to join special tournament");
        // A success is `200 text/plain: Success, now you can play` - NOT JSON, so it is read as text.
        await response.text();
        return response.ok;
    }
    async EnterTournament(tournamentId) {
        const response = await fetch(`${this.apiUri}/SpecialTournaments/enter-tournament?tournamentId=${tournamentId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to enter special tournament");
        const wire = await response.json();
        // The wire spells it LocalTournamentUUID (all caps); alias it onto the declared camel spelling.
        // Additive - the raw keys stay on the object.
        return { ...wire, LocalTournamentUuid: wire.LocalTournamentUUID };
    }
    /**
     * Fetches a tournament's prize table.
     * Returns an object wrapping the place list; `Prizes` is empty when the tournament has no prizes.
     */
    async GetPrizes(tournamentId) {
        const response = await fetch(`${this.apiUri}/SpecialTournaments/get-prizes?tournamentId=${tournamentId}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch tournament prizes");
        return await response.json();
    }
    async GetTournamentsHistory(page = 1, perPage = 10) {
        const response = await fetch(`${this.apiUri}/SpecialTournaments/history?page=${page}&per_page=${perPage}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch tournament history");
        const wire = await response.json();
        // Wire is {data, meta} with snake_case members throughout; alias to the declared names.
        // Spread-first so the raw keys survive alongside the aliases.
        const entries = (wire.data ?? []).map((e) => ({
            ...e,
            TournamentName: e.tournament_name,
            TournamentUuid: e.tournament_uuid,
            StartsAt: e.starts_at,
            EndsAt: e.ends_at,
            ScoredAt: e.scored_at,
            IsFinished: e.is_finished,
            BestScore: e.best_score,
            LeaderboardPlace: e.leaderboard_place,
            EntriesCount: e.entries_count,
            MaxEntries: e.max_entries,
            GameId: e.game_id,
            MapId: e.map_id,
            Prizes: (e.prizes ?? []).map((p) => ({
                ...p,
                Name: p.name,
                Amount: p.amount,
                ImageUrl: p.image_url,
                IsRedeemed: p.is_redeemed
            }))
        }));
        return {
            ...wire,
            Entries: entries,
            Meta: wire.meta
                ? {
                    ...wire.meta,
                    CurrentPage: wire.meta.current_page,
                    LastPage: wire.meta.last_page,
                    PerPage: wire.meta.per_page,
                    Total: wire.meta.total,
                    From: wire.meta.from,
                    To: wire.meta.to
                }
                : undefined
        };
    }
    /**
     * Submits a special tournament game result from a trusted Dedicated Server.
     */
    async ResultTournament_Server(tournamentId, saveScoreId, score, userId, isSuccess, ip = "0.0.0.0") {
        const requestPayload = {
            UserId: userId,
            Score: score,
            IsSuccess: isSuccess,
            Ip: ip
        };
        const response = await fetch(`${this.apiUri}/SpecialTournaments/result-tournament?tournamentId=${tournamentId}&saveScoreId=${saveScoreId}`, {
            method: "POST",
            headers: await this.getServerHeaders(),
            body: JSON.stringify(requestPayload)
        });
        if (!response.ok) {
            throw new Error(`Failed to submit server tournament result: ${await response.text()}`);
        }
        return await response.json();
    }
    /**
     * Submits an encrypted special tournament game result from a Client build.
     */
    async ResultTournament_Client(tournamentId, saveScoreId, score, isSuccess, customData = "") {
        const scorePayload = {
            // Truncated for the same reason as EndRoomSP: Score must be an integer.
            Score: Math.trunc(score),
            IsSuccess: isSuccess,
            CustomData: customData,
            GameEvents: this.currentClientSessionEvents
        };
        const plainText = JSON.stringify(scorePayload);
        // Encryption key derived from saveScoreId and privateGameKey
        const encryptionKey = saveScoreId.substring(0, 8) + this.config.privateGameKey.substring(0, 8);
        const encryptedData = await CryptoHelper.encrypt(plainText, encryptionKey);
        // Signature key derived from privateGameKey
        const hashKey = this.config.privateGameKey.substring(8);
        const hash = await CryptoHelper.hmacSha256(encryptedData, hashKey);
        const response = await fetch(`${this.apiUri}/SpecialTournaments/result-tournament-client?tournamentId=${tournamentId}&saveScoreId=${saveScoreId}`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                EncryptedData: encryptedData,
                Hash: hash
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to submit client tournament result: ${await response.text()}`);
        }
        this.CloseCurrentSession_Client();
        return await response.json(); // returns boolean success
    }
    /* ================= Hall of Fame Methods ================= */
    /**
     * Fetches a page of the Hall of Fame ranking.
     * @param mode     Global (all-time) or Monthly (current calendar month, UTC).
     * @param page     1-based page index.
     * @param limit    Entries per page.
     * @param gameMode Restricts the ranking to a single mode; All applies no filter.
     */
    async GetHallOfFame(mode, page = 1, limit = 10, gameMode = HallOfFameGameModeFilter.All) {
        let path;
        switch (mode) {
            case HallOfFamePeriodMode.Global:
                path = "global";
                break;
            case HallOfFamePeriodMode.Monthly:
                path = "monthly";
                break;
            default:
                throw new Error(`Unsupported Hall of Fame period mode: ${mode}`);
        }
        let url = `${this.apiUri}/HallOfFame/${path}?page=${page}&limit=${limit}`;
        if (gameMode !== HallOfFameGameModeFilter.All) {
            url += `&gameMode=${this.mapHallOfFameGameMode(gameMode)}`;
        }
        const response = await fetch(url, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch Hall of Fame leaderboard");
        return await response.json();
    }
    /**
     * Fetches the Hall of Fame prize distribution table.
     */
    async GetHallOfFameDistribution() {
        const response = await fetch(`${this.apiUri}/HallOfFame/distribution`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to fetch Hall of Fame distribution");
        return await response.json();
    }
    mapHallOfFameGameMode(gameMode) {
        switch (gameMode) {
            case HallOfFameGameModeFilter.SpecialTournament:
                return HallOfFameGameMode.SpecialTournament;
            case HallOfFameGameModeFilter.Rooms:
                return HallOfFameGameMode.Rooms;
            case HallOfFameGameModeFilter.Practice:
                return HallOfFameGameMode.Practice;
            default:
                throw new Error(`Unsupported Hall of Fame game mode filter: ${gameMode}`);
        }
    }
    /* ================= Campaign Methods ================= */
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
    async GetCampaignAvailability(useCache = true) {
        if (useCache && this.cachedCampaignAvailability && Date.now() < this.cacheExpiresAt) {
            return this.cachedCampaignAvailability;
        }
        // Deliberately NOT getAuthHeaders: that helper throws with no JWT, and no-JWT is exactly
        // the pre-login state this endpoint exists to serve.
        const headers = { "X-User-Key": this.config.publicGameKey };
        if (this.jwtToken) {
            headers["Authorization"] = `Bearer ${this.jwtToken}`;
        }
        const response = await fetch(`${this.apiUri}/Campaign/availability`, {
            headers
        });
        if (!response.ok)
            await this.throwCampaignError(response, "Failed to fetch campaign availability");
        const wire = await response.json();
        const availability = this.mapCampaignAvailability(wire);
        this.cachedCampaignAvailability = availability;
        this.updateCacheExpiration();
        return availability;
    }
    /** Returns the availability already held in memory - no network call, no TTL check. */
    GetCachedCampaignAvailability() {
        return this.cachedCampaignAvailability;
    }
    /** Convenience shorthand for `(await GetCampaignAvailability(useCache)).IsAvailable`. */
    async IsCampaignAvailable(useCache = true) {
        return (await this.GetCampaignAvailability(useCache)).IsAvailable;
    }
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
    async GetCampaignLevels(useCache = true) {
        if (useCache && this.cachedCampaignLevels && Date.now() < this.cacheExpiresAt) {
            return this.cachedCampaignLevels;
        }
        const response = await fetch(`${this.apiUri}/Campaign/levels`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwCampaignError(response, "Failed to fetch campaign levels");
        const wire = await response.json();
        const levels = {
            IsAvailable: wire.IsAvailable,
            TotalLevels: wire.TotalLevels,
            CompletedLevels: wire.CompletedLevels,
            TotalStarsEarned: wire.TotalStarsEarned,
            MaxStars: wire.MaxStars,
            Levels: (wire.Levels ?? []).map(level => this.mapCampaignLevel(level))
        };
        this.cachedCampaignLevels = levels;
        this.updateCacheExpiration();
        return levels;
    }
    /** Returns the level list already held in memory - no network call, no TTL check. */
    GetCachedCampaignLevels() {
        return this.cachedCampaignLevels;
    }
    /**
     * Parses a level's opaque config JSON into your game's own type.
     *
     * The schema is YOUR game's - the platform stores the string untouched and the SDK never
     * inspects it, so define your own interface and pass it as T. Throws a plain Error when the
     * level is still Locked (the server withholds the config until unlock) or when the stored
     * string is not valid JSON.
     */
    GetCampaignLevelConfig(level) {
        if (level.LevelConfigJson === null) {
            throw new Error(`Campaign level "${level.Name}" has no config to parse - it is still locked, so the server withheld LevelConfigJson.`);
        }
        try {
            return JSON.parse(level.LevelConfigJson);
        }
        catch {
            throw new Error(`Campaign level "${level.Name}" carries a config that is not valid JSON.`);
        }
    }
    /**
     * Starts an attempt at a level and tracks it as THE active attempt.
     *
     * Re-starting - the same level or another - simply replaces the tracked attempt: the server
     * abandons the old one, so there is nothing to clean up client-side. Rejects with a
     * CampaignError (LevelLocked, LevelNotFound, CampaignNotAvailable) when the level cannot be
     * started.
     */
    async StartCampaignLevel(levelId) {
        const response = await fetch(`${this.apiUri}/Campaign/start-level?levelId=${levelId}`, {
            method: "POST",
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwCampaignError(response, "Failed to start campaign level");
        const wire = await response.json();
        const attempt = {
            AttemptId: wire.AttemptId,
            LevelId: wire.LevelId,
            ConfigVersion: wire.ConfigVersion,
            StartedAt: wire.StartedAt
        };
        this.activeCampaignAttempt = attempt;
        return attempt;
    }
    /** The attempt StartCampaignLevel is currently tracking, or null when none is in flight. */
    GetActiveCampaignAttempt() {
        return this.activeCampaignAttempt;
    }
    /**
     * Clears the tracked attempt LOCALLY - no server call. There is no abandon endpoint; the
     * server-side attempt simply lapses, or is replaced by the next StartCampaignLevel.
     */
    AbandonCampaignAttempt() {
        this.activeCampaignAttempt = null;
    }
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
    async CompleteCampaignLevel(metrics, attempt) {
        const activeAttempt = attempt ?? this.activeCampaignAttempt;
        if (!activeAttempt) {
            throw new CampaignError(CampaignErrorCode.NoActiveAttempt, "No active campaign attempt to complete. Call StartCampaignLevel first, or pass the attempt explicitly.");
        }
        const normalizedMetrics = this.normalizeCampaignMetrics(metrics);
        // Same encrypt-and-sign scheme as EndRoomSP, with the attempt id standing in for
        // sessionOrMatchId.
        const plainText = JSON.stringify({
            AttemptId: activeAttempt.AttemptId,
            LevelId: activeAttempt.LevelId,
            Metrics: normalizedMetrics,
            GameEvents: this.currentClientSessionEvents
        });
        const encryptionKey = activeAttempt.AttemptId.substring(0, 8) + this.config.privateGameKey.substring(0, 8);
        const encryptedData = await CryptoHelper.encrypt(plainText, encryptionKey);
        const hashKey = this.config.privateGameKey.substring(8);
        const hash = await CryptoHelper.hmacSha256(encryptedData, hashKey);
        const response = await fetch(`${this.apiUri}/Campaign/complete-level`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                AttemptId: activeAttempt.AttemptId,
                EncryptedData: encryptedData,
                Hash: hash
            })
        });
        if (!response.ok) {
            try {
                await this.throwCampaignError(response, "Failed to complete campaign level");
            }
            catch (error) {
                // AttemptNotFound and CompletionTooFast both mean the server-side attempt is dead
                // (unknown, or abandoned by the too-fast rejection itself), so a retry can never
                // succeed - stop tracking it. Only OUR tracked attempt though: completing an
                // explicitly passed attempt must not clobber a different tracked one. Network and
                // Unknown failures keep the attempt so the game may retry.
                const attemptIsDead = error instanceof CampaignError &&
                    (error.Code === CampaignErrorCode.AttemptNotFound ||
                        error.Code === CampaignErrorCode.CompletionTooFast);
                if (attemptIsDead && this.activeCampaignAttempt?.AttemptId === activeAttempt.AttemptId) {
                    this.activeCampaignAttempt = null;
                }
                throw error;
            }
        }
        const wire = await response.json();
        const result = this.mapCampaignCompletion(wire);
        // Clear tracking only when the completed attempt IS the tracked one - completing an
        // explicitly passed attempt must not clobber a different tracked attempt.
        if (this.activeCampaignAttempt?.AttemptId === activeAttempt.AttemptId) {
            this.activeCampaignAttempt = null;
        }
        // events were delivered in this submission; the client session itself is untouched
        this.currentClientSessionEvents = [];
        // The unlock cascade happened server-side; a stale list would keep the next level rendered
        // as Locked, so the cache is dropped rather than patched.
        this.cachedCampaignLevels = null;
        if (this.cachedCampaignAvailability) {
            this.cachedCampaignAvailability.LevelCount = result.TotalLevels;
            this.cachedCampaignAvailability.MaxStars = result.MaxStars;
        }
        this.updateCacheExpiration();
        return result;
    }
    /**
     * Validates the metrics contract and normalizes values for the wire.
     * Throws CLIENT-side with the same InvalidMetrics code the server would answer with, so a
     * game handles both origins through one branch.
     */
    normalizeCampaignMetrics(metrics) {
        const entries = Object.entries(metrics ?? {});
        if (entries.length < 1 || entries.length > 32) {
            throw new CampaignError(CampaignErrorCode.InvalidMetrics, `Campaign metrics must carry 1-32 entries; got ${entries.length}`);
        }
        const normalized = {};
        for (const [name, value] of entries) {
            if (name.length < 1 || name.length > 64) {
                throw new CampaignError(CampaignErrorCode.InvalidMetrics, `Campaign metric name "${name}" must be 1-64 characters`);
            }
            if (typeof value === 'boolean') {
                normalized[name] = value ? 1 : 0;
            }
            else if (typeof value === 'number' && Number.isFinite(value)) {
                // Deliberately NOT truncated: fractional metrics are legal - this is the one
                // score-like payload where Math.trunc would corrupt data.
                normalized[name] = value;
            }
            else {
                throw new CampaignError(CampaignErrorCode.InvalidMetrics, `Campaign metric "${name}" must be a finite number or a boolean`);
            }
        }
        return normalized;
    }
    /**
     * Reads a non-2xx Campaign response and throws the matching CampaignError.
     * The body contract is {Error, Message}; an unrecognised identifier or an unparsable body
     * maps to CampaignErrorCode.Unknown with whatever text was readable.
     */
    async throwCampaignError(response, fallback) {
        const text = await response.text();
        let code = CampaignErrorCode.Unknown;
        let message = text || `HTTP ${response.status}`;
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed.Error === 'string' &&
                Object.values(CampaignErrorCode).includes(parsed.Error)) {
                code = parsed.Error;
            }
            if (parsed && typeof parsed.Message === 'string') {
                message = parsed.Message;
            }
        }
        catch {
            // Not a JSON body - keep the raw text under the Unknown code.
        }
        throw new CampaignError(code, `${fallback}: ${message}`);
    }
    mapCampaignAvailability(wire) {
        return {
            IsAvailable: wire.IsAvailable,
            LevelCount: wire.LevelCount,
            MaxStars: wire.MaxStars
        };
    }
    /**
     * Composes the public level model from the wire shape.
     * LevelJsonData is renamed onto LevelConfigJson, and StarRulesJson is PARSED into StarRules -
     * with a try/catch, so one level's garbage rules cannot kill the whole list.
     */
    mapCampaignLevel(wire) {
        return {
            Id: wire.LevelId,
            Order: wire.Order,
            Name: wire.Name,
            Description: wire.Description,
            Status: this.mapCampaignLevelStatus(wire.Status),
            BestStars: wire.BestStars,
            BestMetrics: wire.BestMetrics,
            LevelConfigJson: wire.LevelJsonData,
            StarRules: this.parseCampaignStarRules(wire.StarRulesJson),
            MinDurationSeconds: wire.MinDurationSeconds,
            ConfigVersion: wire.ConfigVersion,
            Rewards: (wire.Rewards ?? []).map(reward => this.mapCampaignReward(reward)),
            CompletedAt: wire.CompletedAt
        };
    }
    /** Strict on purpose: an unknown status int is a contract break, not something to default. */
    mapCampaignLevelStatus(status) {
        switch (status) {
            case 0:
                return CampaignLevelStatus.Locked;
            case 1:
                return CampaignLevelStatus.Unlocked;
            case 2:
                return CampaignLevelStatus.Completed;
            default:
                throw new Error(`Unknown campaign level status: ${status}`);
        }
    }
    /** Null in, null out - and null on garbage too: locked levels and bad JSON both render ruleless. */
    parseCampaignStarRules(json) {
        if (json === null)
            return null;
        try {
            const parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object')
                return null;
            return {
                Win: Array.isArray(parsed.Win) ? parsed.Win : [],
                Stars: Array.isArray(parsed.Stars) ? parsed.Stars : []
            };
        }
        catch {
            return null;
        }
    }
    mapCampaignReward(wire) {
        return {
            Type: wire.Type,
            Amount: wire.Amount,
            ItemId: wire.ItemId,
            RequiredStars: wire.RequiredStars,
            Name: wire.Name,
            ImageUrl: wire.ImageUrl
        };
    }
    mapCampaignCompletion(wire) {
        return {
            IsWin: wire.IsWin,
            Stars: wire.Stars,
            BestStars: wire.BestStars,
            IsNewBest: wire.IsNewBest,
            LevelCompletedFirstTime: wire.LevelCompletedFirstTime,
            UnlockedLevelId: wire.UnlockedLevelId,
            Rewards: (wire.Rewards ?? []).map(reward => this.mapCampaignReward(reward)),
            RewardsGranted: wire.RewardsGranted,
            TotalLevels: wire.TotalLevels,
            CompletedLevels: wire.CompletedLevels,
            TotalStarsEarned: wire.TotalStarsEarned,
            MaxStars: wire.MaxStars
        };
    }
    /* ================= Client Session Methods (Reconnection) ================= */
    async UserHasUnfinishedSession_Client() {
        const response = await fetch(`${this.apiUri}/Session/any-unfinished-sessions`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to check unfinished sessions");
        return await response.json();
    }
    async ReconnectToUnfinishedSession_Client(id) {
        const response = await fetch(`${this.apiUri}/Session/reconnect-to-session?id=${id}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            throw new Error("Failed to reconnect to session");
        const data = await response.json();
        // Decrypt the custom session state
        const decryptionKey = this.getSessionEncryptionKey();
        const decryptedState = await CryptoHelper.decrypt(data.Data, decryptionKey);
        // Restore session tracking
        this.activeClientSessionDbId = data.Id;
        this.activeClientSessionId = data.SessionId;
        this.currentClientSessionId = data.SaveSessionId;
        this.currentClientSessionEvents = []; // clean logs to record new events during resume
        return decryptedState;
    }
    async CreateSession_Client(json, gameType, eventId, saveSessionId) {
        // Encrypt custom data before storing
        const encryptionKey = this.getSessionEncryptionKey();
        const encryptedData = await CryptoHelper.encrypt(json, encryptionKey);
        // Hash is calculated using eventId (SessionId) as key
        const hash = await CryptoHelper.hmacSha256(encryptedData, eventId);
        const response = await fetch(`${this.apiUri}/Session/create-session`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                SessionId: eventId,
                SaveSessionId: saveSessionId,
                GameType: gameType,
                Data: encryptedData,
                Hash: hash
            })
        });
        if (!response.ok)
            throw new Error("Failed to create client session");
        const savedSession = await response.json();
        this.activeClientSessionDbId = savedSession.Id;
        this.activeClientSessionId = eventId;
        this.currentClientSessionId = saveSessionId;
        this.currentClientSessionEvents = [];
        return savedSession;
    }
    async UpdateSession_Client(json) {
        if (!this.activeClientSessionDbId || !this.activeClientSessionId) {
            throw new Error("No active client session found to update. Create or Reconnect first.");
        }
        const encryptionKey = this.getSessionEncryptionKey();
        const encryptedData = await CryptoHelper.encrypt(json, encryptionKey);
        // Hash is calculated using activeClientSessionId (eventId) as key
        const hash = await CryptoHelper.hmacSha256(encryptedData, this.activeClientSessionId);
        const response = await fetch(`${this.apiUri}/Session/update-session`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                Id: this.activeClientSessionDbId,
                Data: encryptedData,
                Hash: hash
            })
        });
        if (!response.ok)
            throw new Error("Failed to update client session progress");
        return await response.json(); // returns boolean
    }
    /**
     * Closes active local client session tracking.
     */
    CloseCurrentSession_Client() {
        this.activeClientSessionDbId = null;
        this.activeClientSessionId = null;
        this.currentClientSessionId = null;
        this.currentClientSessionEvents = [];
    }
    RecordEvent_Client(eventInfo) {
        this.currentClientSessionEvents.push(eventInfo);
    }
    GetCurrentSessionEvents_Client() {
        return [...this.currentClientSessionEvents];
    }
    /* ================= Dedicated Server Session Methods =================
     *
     * NOTE: The Dedicated Server methods are not supported at the moment; do not use them.
     */
    /**
     * Registers a new multiplayer session on the API from a Dedicated Game Server.
     */
    async CreateSession_Server(serverUrl, sessionId, playersInfo) {
        const response = await fetch(`${this.apiUri}/Session/create-server-session`, {
            method: "POST",
            headers: await this.getServerHeaders(),
            body: JSON.stringify({
                ServerUrl: serverUrl,
                SessionId: sessionId,
                PlayersInfo: playersInfo
            })
        });
        if (!response.ok)
            throw new Error("Failed to create server session");
        this.activeServerSessionId = sessionId;
        this.activeServerSessionEvents.clear();
        playersInfo.forEach(p => {
            this.activeServerSessionEvents.set(p.FunticoUserId, []);
        });
        return await response.json(); // returns boolean
    }
    /**
     * Reports that a player has left the server match session.
     */
    async UserLeaveSession_Server(platformUserId) {
        if (!this.activeServerSessionId) {
            throw new Error("No active server session tracked.");
        }
        const response = await fetch(`${this.apiUri}/Session/server-session-user-leave?id=${this.activeServerSessionId}&userId=${platformUserId}`, {
            headers: await this.getServerHeaders()
        });
        if (!response.ok)
            throw new Error("Failed to submit player leave status to server");
        return await response.json(); // returns boolean
    }
    /**
     * Closes active server match session on the API.
     */
    async CloseCurrentSession_Server() {
        if (!this.activeServerSessionId) {
            throw new Error("No active server session tracked.");
        }
        const response = await fetch(`${this.apiUri}/Session/close-server-session?id=${this.activeServerSessionId}`, {
            headers: await this.getServerHeaders()
        });
        if (!response.ok)
            throw new Error("Failed to close server session");
        this.activeServerSessionId = null;
        this.activeServerSessionEvents.clear();
        return await response.json(); // returns boolean
    }
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
    async FinishRoomSession_Server(eventId, sessionId, participants) {
        const scores = participants.map(p => ({
            game_session_id_or_match_id: sessionId,
            // Must be an integer; truncate so a fractional score cannot fail the request.
            score: Math.trunc(p.Score),
            is_suspected_cheater: false,
            user_ip_end_session: p.UserIp,
            user_id: p.FunticoUserId,
            game_managed_award: p.GameManagedAward ?? null
        }));
        const response = await fetch(`${this.apiUri}/Rooms/end-room-all-users?eventId=${eventId}`, {
            method: "POST",
            headers: await this.getServerHeaders(),
            body: JSON.stringify({ scores })
        });
        if (!response.ok)
            throw new Error("Failed to finalize server match results");
        // Cleanup session tracking
        this.activeServerSessionId = null;
        this.activeServerSessionEvents.clear();
        return await response.json();
    }
    RecordEvent_Server(platformUserId, eventInfo) {
        const list = this.activeServerSessionEvents.get(platformUserId) || [];
        list.push(eventInfo);
        this.activeServerSessionEvents.set(platformUserId, list);
    }
    GetCurrentSessionEvents_Server(platformUserId) {
        return [...(this.activeServerSessionEvents.get(platformUserId) || [])];
    }
}
FunticoSDK._instance = null;
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
export class FunticoClient {
    constructor() {
        this.listeners = new Map();
        this.sdk = FunticoSDK.Instance;
    }
    // ---------------------------------------------------------------------------------------------
    // Event emitter
    // ---------------------------------------------------------------------------------------------
    /** Registers a listener for an event. `context` is used as `this` when the listener is called. */
    on(event, listener, context) {
        return this.addListener(event, listener, context, false);
    }
    /** Registers a listener that is removed right before its first invocation. */
    once(event, listener, context) {
        return this.addListener(event, listener, context, true);
    }
    /**
     * Removes listeners. Without `listener`, removes every listener of `event`. With `listener`,
     * removes the registrations of that function whose context matches (when `context` is omitted
     * it matches registrations made without a context).
     */
    off(event, listener, context) {
        if (!listener) {
            this.listeners.delete(event);
            return this;
        }
        const list = this.listeners.get(event);
        if (!list)
            return this;
        const remaining = list.filter(l => !(l.fn === listener && l.context === context));
        if (remaining.length > 0) {
            this.listeners.set(event, remaining);
        }
        else {
            this.listeners.delete(event);
        }
        return this;
    }
    addListener(event, fn, context, once) {
        if (typeof fn !== 'function') {
            throw new TypeError(`[FunticoClient] listener for "${event}" must be a function`);
        }
        const list = this.listeners.get(event);
        const entry = { fn, context, once };
        if (list) {
            list.push(entry);
        }
        else {
            this.listeners.set(event, [entry]);
        }
        return this;
    }
    /** Removes one exact registration. Returns false if it was no longer registered. */
    removeEntry(event, entry) {
        const list = this.listeners.get(event);
        const index = list ? list.indexOf(entry) : -1;
        if (!list || index < 0)
            return false;
        list.splice(index, 1);
        if (list.length === 0)
            this.listeners.delete(event);
        return true;
    }
    /**
     * Synchronous dispatch over a snapshot of the current listeners. A throwing listener is logged
     * and skipped so it cannot break the other listeners or the SDK call that triggered the event.
     */
    emit(event, ...args) {
        const list = this.listeners.get(event);
        if (!list || list.length === 0)
            return;
        for (const l of list.slice()) {
            if (l.once) {
                // Removed before invocation, so a re-entrant emit of the same event cannot fire it twice.
                // Only this registration is removed (by identity), not other on()/once() calls of the same fn.
                if (!this.removeEntry(event, l))
                    continue; // already removed by an earlier listener in this dispatch
            }
            try {
                l.fn.apply(l.context, args);
            }
            catch (err) {
                console.error(`[FunticoClient] listener for "${event}" threw:`, err);
            }
        }
    }
    // ---------------------------------------------------------------------------------------------
    // SDK calls that broadcast their result (same events/payloads as FunticoPhaserPlugin)
    // ---------------------------------------------------------------------------------------------
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
    async init(config) {
        await this.sdk.Initialize(config);
        this.emit(FunticoClient.EVENTS.INITIALIZED);
        if (this.sdk.getUserToken()) {
            this.emit(FunticoClient.EVENTS.AUTHENTICATED, this.sdk.getUserToken());
        }
    }
    /** Exchanges a platform token for the game JWT (FunticoSDK.Authentication), then emits AUTHENTICATED(jwt). */
    async login(platformToken) {
        const result = await this.sdk.Authentication(platformToken);
        this.emit(FunticoClient.EVENTS.AUTHENTICATED, this.sdk.getUserToken());
        return result;
    }
    /** Fetches the user profile (FunticoSDK.GetUserData), then emits USER_DATA_UPDATED(userData). */
    async refreshUserData(useCache = false) {
        const data = await this.sdk.GetUserData(useCache);
        this.emit(FunticoClient.EVENTS.USER_DATA_UPDATED, data);
        return data;
    }
    /** Fetches the balance (FunticoSDK.GetBalance), then emits BALANCE_UPDATED(balance). */
    async refreshBalance(useCache = false) {
        const balance = await this.sdk.GetBalance(useCache);
        this.emit(FunticoClient.EVENTS.BALANCE_UPDATED, balance);
        return balance;
    }
    /**
     * Fetches the campaign level list (FunticoSDK.GetCampaignLevels) and broadcasts it, so a
     * level-select screen can rebind without owning the request. Note the event payload differs
     * from completeCampaignLevel's: this emits the CampaignLevelsViewModel, that emits the
     * CampaignCompletionResult.
     */
    async refreshCampaign(useCache = false) {
        const campaign = await this.sdk.GetCampaignLevels(useCache);
        this.emit(FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, campaign);
        return campaign;
    }
    /**
     * Submits a finished campaign run (FunticoSDK.CompleteCampaignLevel) and broadcasts the graded
     * outcome as CAMPAIGN_PROGRESS_UPDATED(CampaignCompletionResult).
     */
    async completeCampaignLevel(metrics) {
        const result = await this.sdk.CompleteCampaignLevel(metrics);
        this.emit(FunticoClient.EVENTS.CAMPAIGN_PROGRESS_UPDATED, result);
        return result;
    }
}
/** Event names. Keys and values are identical to FunticoPhaserPlugin.EVENTS. */
FunticoClient.EVENTS = {
    INITIALIZED: 'funtico_initialized',
    AUTHENTICATED: 'funtico_authenticated',
    USER_DATA_UPDATED: 'funtico_user_updated',
    BALANCE_UPDATED: 'funtico_balance_updated',
    CAMPAIGN_PROGRESS_UPDATED: 'funtico_campaign_progress_updated'
};
