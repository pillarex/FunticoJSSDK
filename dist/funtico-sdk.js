/*!
 * Funtico JS SDK v1.0.0
 *
 * GENERATED FILE - do not edit by hand.
 * Source: upstream/phaser/FunticoPhaserSDK.ts (sha256 72ea9a479677) + src/FunticoClient.ts (sha256 694498b0ae72).
 * Regenerate with: npm run build
 */
(function (root, factory) {
  if (typeof module === 'object' && module && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.FunticoSDK = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
'use strict';

/**
 * Environments supported by the Funtico SDK.
 */
var FunticoEnvironment;
(function (FunticoEnvironment) {
    FunticoEnvironment["STAGING"] = "staging";
    FunticoEnvironment["PROD"] = "prod";
})(FunticoEnvironment || (FunticoEnvironment = {}));
/**
 * Currency/Entry Fee Types matching Funtico platform definitions.
 */
var EntryFeeType;
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
var RoomTier;
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
var LeadersState;
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
var TournamentsFilterEnum;
(function (TournamentsFilterEnum) {
    TournamentsFilterEnum["OnGoing"] = "OnGoing";
    TournamentsFilterEnum["Upcoming"] = "Upcoming";
    TournamentsFilterEnum["Finished"] = "Finished";
})(TournamentsFilterEnum || (TournamentsFilterEnum = {}));
/**
 * Game Type Enumeration for Reconnection and Sessions.
 */
var GameTypeEnum;
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
var UserGameStatus;
(function (UserGameStatus) {
    UserGameStatus[UserGameStatus["Leave"] = 0] = "Leave";
    UserGameStatus[UserGameStatus["InGame"] = 1] = "InGame";
    UserGameStatus[UserGameStatus["Finished"] = 2] = "Finished";
})(UserGameStatus || (UserGameStatus = {}));
/**
 * Hall of Fame ranking period.
 */
var HallOfFamePeriodMode;
(function (HallOfFamePeriodMode) {
    HallOfFamePeriodMode[HallOfFamePeriodMode["Global"] = 0] = "Global";
    HallOfFamePeriodMode[HallOfFamePeriodMode["Monthly"] = 1] = "Monthly";
})(HallOfFamePeriodMode || (HallOfFamePeriodMode = {}));
/**
 * Game mode filter for Hall of Fame rankings. Use this in game code.
 */
var HallOfFameGameModeFilter;
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
var HallOfFameGameMode;
(function (HallOfFameGameMode) {
    HallOfFameGameMode[HallOfFameGameMode["SpecialTournament"] = 0] = "SpecialTournament";
    HallOfFameGameMode[HallOfFameGameMode["Rooms"] = 1] = "Rooms";
    HallOfFameGameMode[HallOfFameGameMode["Practice"] = 2] = "Practice";
})(HallOfFameGameMode || (HallOfFameGameMode = {}));
/**
 * Prize types, as they appear in the `type` field of prize objects.
 */
var PrizeType;
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
class PrizeUtils {
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
var CampaignLevelStatus;
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
 * recognise (e.g. one added by a newer API version), and a result the payload signer could not
 * sign (nothing was sent; the attempt stays tracked).
 */
var CampaignErrorCode;
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
class CampaignError extends Error {
    constructor(code, message) {
        super(message);
        Object.setPrototypeOf(this, CampaignError.prototype);
        this.name = 'CampaignError';
        this.Code = code;
    }
}
/**
 * Machine-readable reasons an Inventory method can fail. Branch on these, never on message text.
 */
var InventoryErrorCode;
(function (InventoryErrorCode) {
    /** The player is not linked to a Funtico account. */
    InventoryErrorCode["NotLinked"] = "NotLinked";
    /** The player's Funtico session belongs to another game or has expired. Signing in to this game again fixes it. */
    InventoryErrorCode["ReloginRequired"] = "ReloginRequired";
    /** The Funtico platform did not answer. Try again later. */
    InventoryErrorCode["PlatformUnavailable"] = "PlatformUnavailable";
    /** A field of the request is missing or malformed, for example the IdempotencyKey or the id. */
    InventoryErrorCode["InvalidRequest"] = "InvalidRequest";
    /** The game has no recipe or fusion with that key. */
    InventoryErrorCode["UnknownRule"] = "UnknownRule";
    /** The IdempotencyKey was already used for a different action. Use a new key. */
    InventoryErrorCode["KeyReused"] = "KeyReused";
    /** The picked copies do not fit the fusion: not the player's, not eligible, or the wrong count. */
    InventoryErrorCode["WrongItems"] = "WrongItems";
    /** The game's recipes or fusions are set up wrong. Not something the player can fix. */
    InventoryErrorCode["Misconfigured"] = "Misconfigured";
    /** The response carried no recognisable code. */
    InventoryErrorCode["Unknown"] = "Unknown";
})(InventoryErrorCode || (InventoryErrorCode = {}));
/**
 * Error thrown by the Inventory methods, carrying a machine-readable Code alongside the
 * human-readable message. `instanceof InventoryError` is reliable.
 */
class InventoryError extends Error {
    constructor(code, message) {
        super(message);
        Object.setPrototypeOf(this, InventoryError.prototype);
        this.name = 'InventoryError';
        this.Code = code;
    }
}
/** Values of CraftResult.Status. */
var CraftStatus;
(function (CraftStatus) {
    /** Done: the items in Burned were taken and the items in Granted were given. */
    CraftStatus["Succeeded"] = "Succeeded";
    /**
     * Not confirmed yet. Call again with the same IdempotencyKey (CraftResult.IdempotencyKey) until
     * the status is Succeeded or Refused; the action never happens twice.
     */
    CraftStatus["Pending"] = "Pending";
    /** Nothing changed; Reason says why. Trying again needs a new IdempotencyKey. */
    CraftStatus["Refused"] = "Refused";
})(CraftStatus || (CraftStatus = {}));
/** Values of RecentReward.Status. */
var RecentRewardStatus;
(function (RecentRewardStatus) {
    /** Accepted and on its way to the player's inventory. */
    RecentRewardStatus["Queued"] = "Queued";
    /** In the player's inventory. */
    RecentRewardStatus["Delivered"] = "Delivered";
    /** A random draw that paid nothing. */
    RecentRewardStatus["Empty"] = "Empty";
    /** The platform refused it. */
    RecentRewardStatus["Refused"] = "Refused";
    /** Gave up after repeated failures. */
    RecentRewardStatus["Failed"] = "Failed";
})(RecentRewardStatus || (RecentRewardStatus = {}));
/**
 * Machine-readable reasons a Ghost method can fail. Branch on these, never on message text.
 * `NoOpponent` is a normal outcome: nobody matched and no bot was available - fall back to a
 * local opponent or try again later.
 */
var GhostErrorCode;
(function (GhostErrorCode) {
    GhostErrorCode["PoolNotFound"] = "PoolNotFound";
    GhostErrorCode["RunNotSupported"] = "RunNotSupported";
    GhostErrorCode["RunNotActive"] = "RunNotActive";
    GhostErrorCode["RunStateMismatch"] = "RunStateMismatch";
    GhostErrorCode["InvalidAttributes"] = "InvalidAttributes";
    GhostErrorCode["InvalidSnapshot"] = "InvalidSnapshot";
    GhostErrorCode["NoOpponent"] = "NoOpponent";
    GhostErrorCode["MatchNotFound"] = "MatchNotFound";
    GhostErrorCode["MatchExpired"] = "MatchExpired";
    GhostErrorCode["InvalidSignature"] = "InvalidSignature";
    GhostErrorCode["InvalidOutcome"] = "InvalidOutcome";
    /** The report's matchData is over 32 KB in UTF-8. Nothing was recorded and the match stays open: report again without it. */
    GhostErrorCode["DataTooLarge"] = "DataTooLarge";
    /** Paid pool: the player's balance is below the entry price. Nothing was charged and no run started. */
    GhostErrorCode["InsufficientFunds"] = "InsufficientFunds";
    /** Paid pool: the player must complete identity verification before paying an entry. */
    GhostErrorCode["KycRequired"] = "KycRequired";
    /** Paid pool: the entry cannot be bought right now (no such product or price, the player is suspended, or paid entries are unavailable). */
    GhostErrorCode["EntryUnavailable"] = "EntryUnavailable";
    /**
     * Paid pool: the entry payment is not confirmed yet. Call StartGhostRun again: it never charges
     * twice for one run. Until then the run gets no opponent (FindGhostOpponent rejects with this too).
     */
    GhostErrorCode["PaymentPending"] = "PaymentPending";
    /** The player's Funtico session belongs to another game or has expired. Signing in to this game again fixes it. */
    GhostErrorCode["ReloginRequired"] = "ReloginRequired";
    /** The response carried no recognisable code, or the payload signer could not sign the report (nothing was sent). */
    GhostErrorCode["Unknown"] = "Unknown";
})(GhostErrorCode || (GhostErrorCode = {}));
/** Error thrown by the Ghost methods, carrying a machine-readable Code. `instanceof GhostError` is reliable. */
class GhostError extends Error {
    constructor(code, message) {
        super(message);
        Object.setPrototypeOf(this, GhostError.prototype);
        this.name = 'GhostError';
        this.Code = code;
    }
}
/** A fight's outcome, from the reporting player's point of view. */
var GhostOutcome;
(function (GhostOutcome) {
    GhostOutcome["Win"] = "Win";
    GhostOutcome["Loss"] = "Loss";
    GhostOutcome["Draw"] = "Draw";
})(GhostOutcome || (GhostOutcome = {}));
/**
 * Machine-readable reasons a Community Goal method can fail. Branch on these, never on message text.
 * `GoalClosed` carries NextGoalId (load that goal: it has its own data); `NoAttemptsLeft` and
 * `NoPaidAttemptsLeft` carry ResetsAt.
 */
var CommunityGoalErrorCode;
(function (CommunityGoalErrorCode) {
    CommunityGoalErrorCode["ChainNotFound"] = "ChainNotFound";
    CommunityGoalErrorCode["GoalNotFound"] = "GoalNotFound";
    CommunityGoalErrorCode["GoalClosed"] = "GoalClosed";
    CommunityGoalErrorCode["NoAttemptsLeft"] = "NoAttemptsLeft";
    CommunityGoalErrorCode["AttemptNotFound"] = "AttemptNotFound";
    CommunityGoalErrorCode["AttemptExpired"] = "AttemptExpired";
    CommunityGoalErrorCode["CompletionTooFast"] = "CompletionTooFast";
    CommunityGoalErrorCode["InvalidSignature"] = "InvalidSignature";
    CommunityGoalErrorCode["InvalidContribution"] = "InvalidContribution";
    /** startData (8 KB) or strikeData (16 KB) is too long in UTF-8; nothing was spent or counted, the attempt stays open. */
    CommunityGoalErrorCode["DataTooLarge"] = "DataTooLarge";
    /** No such best strike on this goal any more (the player has struck harder since, or was removed). */
    CommunityGoalErrorCode["StrikeNotFound"] = "StrikeNotFound";
    /** Paid attempt: today's paid attempts of the chain are used up (see ResetsAt). Nothing was charged. */
    CommunityGoalErrorCode["NoPaidAttemptsLeft"] = "NoPaidAttemptsLeft";
    /** Paid attempt: the player's balance is below the price. Nothing was charged and no attempt started. */
    CommunityGoalErrorCode["InsufficientFunds"] = "InsufficientFunds";
    /** Paid attempt: the player must complete identity verification before paying. Nothing was charged. */
    CommunityGoalErrorCode["KycRequired"] = "KycRequired";
    /** Paid attempt: it cannot be bought right now (the chain sells none, it is not on sale, or the player is suspended). Nothing was charged. */
    CommunityGoalErrorCode["EntryUnavailable"] = "EntryUnavailable";
    /**
     * Paid attempt: the payment is not confirmed yet. Call StartGoalAttempt again: it never charges twice for
     * one attempt, and the attempt is handed out once it is paid.
     */
    CommunityGoalErrorCode["PaymentPending"] = "PaymentPending";
    /** The player's Funtico session belongs to another game or has expired. Signing in to this game again fixes it. */
    CommunityGoalErrorCode["ReloginRequired"] = "ReloginRequired";
    /** The response carried no recognisable code, or the payload signer could not sign the result (nothing was sent). */
    CommunityGoalErrorCode["Unknown"] = "Unknown";
})(CommunityGoalErrorCode || (CommunityGoalErrorCode = {}));
/** Error thrown by the Community Goal methods. `instanceof CommunityGoalError` is reliable. */
class CommunityGoalError extends Error {
    constructor(code, message, nextGoalId = null, resetsAt = null) {
        super(message);
        Object.setPrototypeOf(this, CommunityGoalError.prototype);
        this.name = 'CommunityGoalError';
        this.Code = code;
        this.NextGoalId = nextGoalId;
        this.ResetsAt = resetsAt;
    }
}
/**
 * Cryptography helper class leveraging the browser Web Crypto API.
 * Produces the encrypted payloads and signatures the Funtico API expects.
 */
class CryptoHelper {
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
 * Which result is being signed. Each kind takes its key salt from a different id; see
 * PayloadSigner.Sign.
 */
var PayloadKind;
(function (PayloadKind) {
    /** CompletePractice. Salt id: the player's UserId. */
    PayloadKind[PayloadKind["Practice"] = 0] = "Practice";
    /** EndRoomSP. Salt id: the session or match id. */
    PayloadKind[PayloadKind["Room"] = 1] = "Room";
    /** ResultTournament_Client. Salt id: the tournament's saveScoreId. */
    PayloadKind[PayloadKind["Tournament"] = 2] = "Tournament";
    /** CompleteCampaignLevel. Salt id: the attempt id. */
    PayloadKind[PayloadKind["Campaign"] = 3] = "Campaign";
    /** ReportGhostResult. Salt id: the match id, lowercased. */
    PayloadKind[PayloadKind["Ghost"] = 4] = "Ghost";
    /** CompleteGoalAttempt. Salt id: the attempt id, lowercased. */
    PayloadKind[PayloadKind["CommunityGoal"] = 5] = "CommunityGoal";
})(PayloadKind || (PayloadKind = {}));
/**
 * Signs with the game's private key. The SDK uses it when Initialize gets privateGameKey. It is
 * also the reference for every other PayloadSigner: a signer must return exactly what this one
 * returns. It runs wherever Web Crypto does, so a Node backend can sign with it too.
 */
class LocalPayloadSigner {
    constructor(privateKey) {
        this.privateKey = privateKey;
    }
    /**
     * The salt in front of the key: the first 8 characters of the id. A practice id is the player's
     * UserId in decimal, padded on the left with zeros to 8 digits first.
     */
    static Salt(kind, saltId) {
        return kind === PayloadKind.Practice
            ? String(saltId).padStart(8, '0').substring(0, 8)
            : saltId.substring(0, 8);
    }
    async Sign(kind, saltId, payloadJson) {
        const encryptionKey = LocalPayloadSigner.Salt(kind, saltId) + this.privateKey.substring(0, 8);
        const data = await CryptoHelper.encrypt(payloadJson, encryptionKey);
        const hash = await CryptoHelper.hmacSha256(data, this.privateKey.substring(8));
        return { Data: data, Hash: hash };
    }
    async EncryptSession(userId, sessionJson) {
        return CryptoHelper.encrypt(sessionJson, this.sessionKey(userId));
    }
    async DecryptSession(userId, encryptedData) {
        return CryptoHelper.decrypt(encryptedData, this.sessionKey(userId));
    }
    /** The player's UserId as 8 hex digits, then the last 8 characters of the private key. */
    sessionKey(userId) {
        const userGuidStr = Number(userId).toString(16).padStart(8, '0');
        const privateKey = this.privateKey;
        const privateKeyPart = privateKey.substring(privateKey.length - 8);
        return userGuidStr + privateKeyPart;
    }
}
/**
 * Funtico SDK - Core Service Facade.
 */
class FunticoSDK {
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
        this.cachedInventory = null;
        this.cachedInventoryWithOtherItems = null;
        this.cacheExpiresAt = 0;
        // Raw room configs from the last GetRooms call, kept for GetTierByEventId.
        this.lastRoomsResponse = null;
        // Local client session storage (for reconnection and logging events)
        this.activeClientSessionDbId = null;
        this.activeClientSessionId = null; // Stored eventId
        this.currentClientSessionId = null; // Stored saveSessionId
        this.currentClientSessionEvents = [];
        this.currentClientSessionCollected = new Map();
        // Id of the practice run CompletePractice is submitting; kept across a failed submit, so a retry
        // is the same run.
        this.practiceRunId = null;
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
        // Read loosely: a JavaScript caller may pass anything in these fields.
        const { publicGameKey } = config;
        const { privateGameKey, payloadSigner } = config;
        if (typeof publicGameKey !== "string" || publicGameKey.length === 0) {
            fail("publicGameKey is missing or empty. Pass the public key from the Developer Portal.");
        }
        // A signer stands in for the private key, so the private-key rules below do not apply to it.
        if (payloadSigner != null) {
            if (privateGameKey != null) {
                fail("pass either privateGameKey or payloadSigner, not both. Leave privateGameKey out when your signer holds the key.");
            }
            const signer = payloadSigner;
            if (typeof signer.Sign !== "function" || typeof signer.EncryptSession !== "function" ||
                typeof signer.DecryptSession !== "function") {
                fail("payloadSigner must have Sign, EncryptSession and DecryptSession methods.");
            }
            if (publicGameKey !== publicGameKey.trim()) {
                fail("publicGameKey has leading or trailing whitespace (a stray newline/CR from a .env file or copy-paste?). Trim it.");
            }
            return;
        }
        if (typeof privateGameKey !== "string" || privateGameKey.length === 0) {
            return fail("privateGameKey is missing or empty. Pass the secret key from the Developer Portal, or a payloadSigner.");
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
     *
     * Results and the saved session are signed with config.privateGameKey, or, when the game keeps
     * the key off the client, by config.payloadSigner.
     */
    async Initialize(config) {
        FunticoSDK.validateConfig(config);
        this.config = config;
        this.payloadSigner = config.payloadSigner ?? new LocalPayloadSigner(config.privateGameKey);
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
     * computed from the game keys. The private key itself is never sent. An SDK initialized with a
     * payloadSigner has no key to compute it from and sends no X-Server-Key.
     *
     * Async because Web Crypto's sign() is.
     */
    async getServerHeaders() {
        const headers = {
            "Content-Type": "application/json",
            "X-User-Key": this.config.publicGameKey
        };
        if (this.config.privateGameKey) {
            headers["X-Server-Key"] = await CryptoHelper.hmacSha256(this.config.privateGameKey, this.config.publicGameKey);
        }
        return headers;
    }
    /**
     * The player's UserId as the signer gets it for session encryption. Requires user data to be
     * loaded.
     */
    getSessionUserId() {
        const userId = this.cachedUserData?.UserId;
        if (userId === undefined) {
            throw new Error("User data is not loaded. Cannot derive session encryption key.");
        }
        return String(userId);
    }
    /**
     * Signs a result with the game's signer. Null when the signer gave no usable answer; the caller
     * then sends nothing and rejects as it would on a failed request. A signer's exception propagates.
     */
    async signResult(kind, saltId, payloadJson) {
        const signed = await this.payloadSigner.Sign(kind, saltId, payloadJson);
        if (signed && typeof signed.Data === 'string' && signed.Data.length > 0 &&
            typeof signed.Hash === 'string' && signed.Hash.length > 0) {
            return signed;
        }
        return null;
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
     * Fresh random v4 UUID: the idempotency key of a join attempt, a craft or a fusion; the id of a
     * practice run.
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
    async JoinExternalMatch(eventId, matchId, password, useVoucher = false) {
        const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuid.test(eventId) || !uuid.test(matchId)) {
            throw new Error("JoinExternalMatch: eventId and matchId must be UUIDs");
        }
        const room = eventId.toLowerCase();
        const match = matchId.toLowerCase();
        // The password travels encrypted, keyed on the room id.
        const encryptedPassword = password ? await CryptoHelper.encrypt(password, room) : '';
        const url = `${this.apiUri}/Rooms/join-room?idempotencyKey=${this.newIdempotencyKey()}&getLobbyQuote=false`;
        const response = await fetch(url, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                tournamentId: room,
                communityId: null,
                password: encryptedPassword,
                UseVoucher: useVoucher
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to join external match: ${await response.text()}`);
        }
        const joinResponse = await response.json();
        // The player already has a game in this room: the same match is a rejoin, any other one has to
        // be finished first.
        const existing = joinResponse.game_session_id_or_match_id;
        if (typeof existing === 'string' && existing.trim().length > 0) {
            if (existing.trim().toLowerCase() === match) {
                return { EventId: eventId, SessionOrMatchId: match };
            }
            throw new Error(`Failed to join external match: the player has an unfinished game ${existing} in this room. Finish it before joining another match.`);
        }
        const started = await this.StartRoomSP(room, match, false);
        return { EventId: eventId, SessionOrMatchId: started.SessionOrMatchId || match };
    }
    /**
     * Ends a room session and sends the player's encrypted score to the game API (Client-side).
     *
     * The score is encrypted and signed with privateGameKey (or by the payloadSigner). If this fails
     * with HTTP 500 "Padding is invalid and cannot be removed", the privateGameKey is wrong.
     *
     * A failed submit, also one the signer could not sign, rejects and keeps the client session, its
     * events and its counts, so a retry sends them again.
     */
    async EndRoomSP(eventId, sessionOrMatchId, score, userId, ip = "127.0.0.1", gameEvents = []) {
        const scorePayload = {
            // Score must be an integer: a fractional value fails with HTTP 500 rather than a validation
            // error. Truncate before it leaves the client.
            Score: Math.trunc(score),
            UserId: userId,
            Ip: ip,
            GameEvents: gameEvents.length > 0 ? gameEvents : this.currentClientSessionEvents,
            ...this.getCollectedPayload()
        };
        const plainText = JSON.stringify(scorePayload);
        const signed = await this.signResult(PayloadKind.Room, sessionOrMatchId, plainText);
        if (!signed) {
            throw new Error("Failed to end gameplay session: the result could not be signed, so it was not sent.");
        }
        const response = await fetch(`${this.apiUri}/Rooms/end-room-sp?eventId=${eventId}&gameSessionIrOrMatchId=${sessionOrMatchId}`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                TournamentId: eventId,
                Hash: signed.Hash,
                EncryptedData: signed.Data
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
            GameEvents: this.currentClientSessionEvents,
            ...this.getCollectedPayload()
        };
        const plainText = JSON.stringify(scorePayload);
        // Keyed on saveScoreId. A result the signer could not sign is not sent; the session is kept.
        const signed = await this.signResult(PayloadKind.Tournament, saveScoreId, plainText);
        if (!signed) {
            throw new Error("Failed to submit client tournament result: the result could not be signed, so it was not sent.");
        }
        const response = await fetch(`${this.apiUri}/SpecialTournaments/result-tournament-client?tournamentId=${tournamentId}&saveScoreId=${saveScoreId}`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                EncryptedData: signed.Data,
                Hash: signed.Hash
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to submit client tournament result: ${await response.text()}`);
        }
        this.CloseCurrentSession_Client();
        return await response.json(); // returns boolean success
    }
    /* ================= Practice Methods ================= */
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
    async CompletePractice(score, options = {}) {
        const headers = this.getAuthHeaders(true);
        if (typeof score !== 'number' || !Number.isFinite(score) ||
            Math.trunc(score) < -2147483648 || Math.trunc(score) > 2147483647) {
            throw new Error(`CompletePractice: score must be a finite number that fits a 32-bit integer, got ${score}.`);
        }
        const wholeScore = Math.trunc(score);
        const user = this.cachedUserData ?? await this.GetUserData(false);
        if (this.practiceRunId === null) {
            this.practiceRunId = this.newIdempotencyKey();
        }
        const runId = this.practiceRunId;
        const collected = options?.collected ?? this.GetCurrentSessionCollected_Client();
        const gameEvents = options?.gameEvents ?? this.currentClientSessionEvents;
        const plainText = JSON.stringify({
            Score: wholeScore,
            RunId: runId,
            ...(Object.keys(collected).length > 0 ? { Collected: { ...collected } } : {}),
            ...(gameEvents.length > 0 ? { GameEvents: [...gameEvents] } : {})
        });
        // Same encrypt-and-sign scheme as EndRoomSP, keyed on the player's UserId instead of a session
        // id (see LocalPayloadSigner.Salt). A result the signer could not sign is not sent, and the run
        // id, counts and events are kept for a retry.
        const signed = await this.signResult(PayloadKind.Practice, String(user.UserId), plainText);
        if (!signed) {
            throw new Error("Failed to complete practice: the result could not be signed, so it was not sent.");
        }
        const response = await fetch(`${this.apiUri}/User/complete-practice`, {
            method: "POST",
            headers,
            body: JSON.stringify({ Data: signed.Data, Hash: signed.Hash })
        });
        if (!response.ok) {
            throw new Error(`Failed to complete practice: ${await response.text()}`);
        }
        await response.text();
        // The run is over: the next one gets a new id and starts with nothing recorded.
        if (this.practiceRunId === runId) {
            this.practiceRunId = null;
        }
        this.currentClientSessionCollected.clear();
        this.currentClientSessionEvents = [];
        return true;
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
        const signed = await this.signResult(PayloadKind.Campaign, activeAttempt.AttemptId, plainText);
        if (!signed) {
            // Nothing was sent: the attempt stays tracked, so the game may retry.
            throw new CampaignError(CampaignErrorCode.Unknown, "Failed to complete campaign level: the result could not be signed, so it was not sent.");
        }
        const response = await fetch(`${this.apiUri}/Campaign/complete-level`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                AttemptId: activeAttempt.AttemptId,
                EncryptedData: signed.Data,
                Hash: signed.Hash
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
        const userId = this.getSessionUserId();
        const decryptedState = await this.payloadSigner.DecryptSession(userId, data.Data);
        if (typeof decryptedState !== 'string') {
            throw new Error("Failed to reconnect to session: the saved session could not be decrypted.");
        }
        // Restore session tracking
        this.activeClientSessionDbId = data.Id;
        this.activeClientSessionId = data.SessionId;
        this.currentClientSessionId = data.SaveSessionId;
        this.currentClientSessionEvents = []; // clean logs to record new events during resume
        this.currentClientSessionCollected.clear();
        return decryptedState;
    }
    async CreateSession_Client(json, gameType, eventId, saveSessionId) {
        // Before the first await: the run is already live, and a pickup must not be wiped when the
        // request returns.
        this.currentClientSessionCollected.clear();
        // Encrypt custom data before storing
        const userId = this.getSessionUserId();
        const encryptedData = await this.payloadSigner.EncryptSession(userId, json);
        if (typeof encryptedData !== 'string' || encryptedData.length === 0) {
            throw new Error("Failed to create client session: the session could not be encrypted, so it was not saved.");
        }
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
        // Read before the first await: the checkpoint belongs to the session open now, even if it is
        // closed or replaced while the data is being encrypted.
        const sessionDbId = this.activeClientSessionDbId;
        const sessionId = this.activeClientSessionId;
        if (!sessionDbId || !sessionId) {
            throw new Error("No active client session found to update. Create or Reconnect first.");
        }
        const userId = this.getSessionUserId();
        const encryptedData = await this.payloadSigner.EncryptSession(userId, json);
        if (typeof encryptedData !== 'string' || encryptedData.length === 0) {
            throw new Error("Failed to update client session progress: the session could not be encrypted, so it was not saved.");
        }
        // Hash is calculated using activeClientSessionId (eventId) as key
        const hash = await CryptoHelper.hmacSha256(encryptedData, sessionId);
        const response = await fetch(`${this.apiUri}/Session/update-session`, {
            method: "POST",
            headers: this.getAuthHeaders(true),
            body: JSON.stringify({
                Id: sessionDbId,
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
        this.currentClientSessionCollected.clear();
        this.currentClientSessionEvents = [];
    }
    RecordEvent_Client(eventInfo) {
        this.currentClientSessionEvents.push(eventInfo);
    }
    GetCurrentSessionEvents_Client() {
        return [...this.currentClientSessionEvents];
    }
    /**
     * Counts an item the player collected during the current run, such as a chest. The counts are
     * sent with the result by EndRoomSP, ResultTournament_Client and CompletePractice, also when the
     * run was lost.
     *
     * @param key The reward key agreed for your game, for example "chest_1".
     * @param count How many to add. Use it to re-record what a resumed run had collected.
     */
    RecordCollected_Client(key, count = 1) {
        if (!key || !Number.isInteger(count) || count <= 0) {
            console.error(`RecordCollected_Client ignored an invalid call: key "${key}", count ${count}.`);
            return;
        }
        this.currentClientSessionCollected.set(key, (this.currentClientSessionCollected.get(key) ?? 0) + count);
    }
    /**
     * Returns a copy of what the current run has collected so far, by reward key.
     */
    GetCurrentSessionCollected_Client() {
        const collected = {};
        this.currentClientSessionCollected.forEach((count, key) => {
            collected[key] = count;
        });
        return collected;
    }
    // Absent rather than empty when nothing was collected, so the payload of a game that does not
    // use this stays exactly as it was.
    getCollectedPayload() {
        return this.currentClientSessionCollected.size > 0
            ? { Collected: this.GetCurrentSessionCollected_Client() }
            : {};
    }
    /* ================= Inventory Methods ================= */
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
    async GetInventory(useCache = true, includeOtherItems = false) {
        const cached = includeOtherItems ? this.cachedInventoryWithOtherItems : this.cachedInventory;
        if (useCache && cached && Date.now() < this.cacheExpiresAt) {
            return cached;
        }
        const query = includeOtherItems ? '?all=true' : '';
        const response = await fetch(`${this.apiUri}/Inventory${query}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwInventoryError(response, "Failed to fetch inventory");
        const wire = await response.json();
        const inventory = {
            Items: (wire.Items ?? []).map(item => this.mapInventoryItem(item))
        };
        if (includeOtherItems) {
            this.cachedInventoryWithOtherItems = inventory;
        }
        else {
            this.cachedInventory = inventory;
        }
        this.updateCacheExpiration();
        return inventory;
    }
    /** Returns the inventory already held in memory - no network call, no TTL check. */
    GetCachedInventory(includeOtherItems = false) {
        return includeOtherItems ? this.cachedInventoryWithOtherItems : this.cachedInventory;
    }
    /** Finds an owned item by your game's own item key, or null when the player has none. */
    FindInventoryItem(inventory, gameItemId) {
        return inventory.Items.find(item => item.GameItemId === gameItemId) ?? null;
    }
    /**
     * Parses an item's PropertiesJson into your game's own type.
     *
     * Returns null when the item has no properties. Throws a plain Error when the stored string is
     * not valid JSON.
     */
    GetInventoryItemProperties(item) {
        if (item.PropertiesJson === null) {
            return null;
        }
        try {
            return JSON.parse(item.PropertiesJson);
        }
        catch {
            throw new Error(`Inventory item "${item.Name}" carries properties that are not valid JSON.`);
        }
    }
    /**
     * The crafting recipes and fusions of this game: what CraftItem and FuseItems can do.
     *
     * Always calls the server. Rejects with an InventoryError.
     */
    async GetRecipes() {
        const response = await fetch(`${this.apiUri}/Inventory/recipes`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwInventoryError(response, "Failed to fetch recipes");
        const wire = await response.json();
        return {
            Recipes: (wire.Recipes ?? []).map(recipe => this.mapCraftRecipe(recipe)),
            Fusions: (wire.Fusions ?? []).map(fusion => this.mapFusionRecipe(fusion))
        };
    }
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
    async CraftItem(recipe, id = null, idempotencyKey = null) {
        const key = idempotencyKey || this.newIdempotencyKey();
        return this.postCraftAction('craft', { Recipe: recipe, Id: id ?? null, IdempotencyKey: key }, key, "Failed to craft");
    }
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
    async FuseItems(fusion, userItemIds, idempotencyKey = null) {
        const key = idempotencyKey || this.newIdempotencyKey();
        return this.postCraftAction('fuse', { Fusion: fusion, UserItemIds: [...(userItemIds ?? [])], IdempotencyKey: key }, key, "Failed to fuse items");
    }
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
    async GetRecentRewards(limit = 20, since = null) {
        const params = new URLSearchParams({ limit: String(Math.min(Math.max(Math.trunc(limit) || 20, 1), 100)) });
        if (since)
            params.set('since', since.toISOString());
        const response = await fetch(`${this.apiUri}/Rewards/recent?${params.toString()}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwInventoryError(response, "Failed to fetch recent rewards");
        const wire = await response.json();
        return { Rewards: (wire.Rewards ?? []).map(reward => this.mapRecentReward(reward)) };
    }
    mapRecentReward(reward) {
        return {
            Id: reward.Id,
            Source: reward.Source ?? '',
            RunId: reward.RunId ?? '',
            Key: reward.Key ?? '',
            Status: reward.Status ?? '',
            Items: (reward.Items ?? []).map(item => ({
                ItemId: item.ItemId,
                GameItemId: item.GameItemId ?? null,
                Name: item.Name ?? null,
                ImageUrl: item.ImageUrl ?? null,
                Amount: item.Amount ?? 1
            })),
            CreatedAt: reward.CreatedAt,
            DeliveredAt: reward.DeliveredAt ?? null
        };
    }
    mapInventoryItem(wire) {
        return {
            ItemId: wire.ItemId,
            GameItemId: wire.GameItemId ?? null,
            Name: wire.Name ?? '',
            Description: wire.Description ?? null,
            ImageUrl: wire.ImageUrl ?? null,
            Count: wire.Count,
            UserItemIds: wire.UserItemIds ?? [],
            IsConsumable: wire.IsConsumable,
            IsInfinity: wire.IsInfinity,
            IsGameItem: wire.IsGameItem,
            IsSellable: wire.IsSellable,
            Rarity: wire.Rarity ?? null,
            PropertiesJson: wire.PropertiesJson ?? null,
            BaseStatsJson: wire.BaseStatsJson ?? null,
            Copies: (wire.Copies ?? []).map(copy => ({
                UserItemId: copy.UserItemId,
                StatsJson: copy.StatsJson ?? '[]'
            }))
        };
    }
    mapCraftRecipe(wire) {
        const lines = (list) => (list ?? []).map(line => ({ Item: line.Item ?? '', Amount: line.Amount ?? 1 }));
        return {
            Key: wire.Key ?? '',
            Name: wire.Name ?? null,
            HasId: wire.HasId === true,
            Inputs: lines(wire.Inputs),
            Outputs: lines(wire.Outputs)
        };
    }
    mapFusionRecipe(wire) {
        return {
            Key: wire.Key ?? '',
            Name: wire.Name ?? null,
            Need: wire.Need ?? 0,
            Inputs: wire.Inputs ?? [],
            Results: wire.Results ?? []
        };
    }
    /**
     * Sends a craft or a fusion. 200, 202 and 422 answer with the outcome; a 422 without `Status`
     * and every other failure carry an Inventory error body instead.
     */
    async postCraftAction(path, body, idempotencyKey, fallback) {
        const response = await fetch(`${this.apiUri}/Inventory/${path}`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body)
        });
        const text = await response.text();
        if (response.ok || response.status === 422) {
            let wire = null;
            try {
                wire = JSON.parse(text);
            }
            catch {
                // Not a JSON body - handled below.
            }
            if (wire && typeof wire.Status === 'string' && wire.Status.length > 0) {
                const result = this.mapCraftResult(wire, idempotencyKey);
                // Items moved (or may have): the next GetInventory must read fresh.
                if (result.Status === CraftStatus.Succeeded || result.Status === CraftStatus.Pending) {
                    this.cachedInventory = null;
                    this.cachedInventoryWithOtherItems = null;
                }
                return result;
            }
            if (response.ok) {
                throw new InventoryError(InventoryErrorCode.Unknown, `${fallback}: the response carried no status.`);
            }
        }
        return this.throwInventoryError(response, fallback, text);
    }
    mapCraftResult(wire, idempotencyKey) {
        const items = (list) => (list ?? []).map(item => ({ GameItemId: item.GameItemId ?? '', UserItemIds: item.UserItemIds ?? [] }));
        return {
            OperationId: wire.OperationId ?? '',
            Status: wire.Status ?? '',
            Replayed: wire.Replayed === true,
            Burned: items(wire.Burned),
            Granted: items(wire.Granted),
            Reason: wire.Reason ?? null,
            Message: wire.Message ?? null,
            IdempotencyKey: idempotencyKey
        };
    }
    /** `bodyText`: the response body when the caller has already read it. */
    async throwInventoryError(response, fallback, bodyText) {
        const text = bodyText ?? await response.text();
        let code = InventoryErrorCode.Unknown;
        let message = text || `HTTP ${response.status}`;
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed.Error === 'string' &&
                Object.values(InventoryErrorCode).includes(parsed.Error)) {
                code = parsed.Error;
            }
            if (parsed && typeof parsed.Message === 'string') {
                message = parsed.Message;
            }
        }
        catch {
            // Not a JSON body - keep the raw text under the Unknown code.
        }
        throw new InventoryError(code, `${fallback}: ${message}`);
    }
    /* ================= Ghost Matchmaking Methods =================
     *
     * Asynchronous PvP: the player fights a stored ship of another player (a "ghost") or a bot.
     * The server decides the opponent, counts the run, keeps the ratings and accepts each fight's
     * result once, by MatchId. Every rule (attributes, search steps, run limits, bots, rating) is
     * configured per pool, so a game reads its pools instead of hardcoding them.
     */
    /** The game's ghost pools, their attributes and the player's rating in each. */
    async GetGhostPools() {
        const response = await fetch(`${this.apiUri}/Ghost/pools`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to fetch ghost pools");
        const wire = await response.json();
        return (wire.Pools ?? []).map(pool => ({
            ...pool,
            Attributes: pool.Attributes ?? [],
            Entry: pool.Entry ? { ...pool.Entry, DisplayPrice: pool.Entry.DisplayPrice ?? null } : null
        }));
    }
    /** The player's active run in the pool and its open match, if any (resume after a reload). */
    async GetGhostRun(pool) {
        return this.ghostRunCall('GET', 'run', pool, "Failed to fetch the ghost run");
    }
    /**
     * Starts a run in a pool with runs, or returns the active one.
     *
     * In a paid pool (GhostPool.Entry set) this charges the entry, once per run: calling it again
     * resumes the same run and never charges again. Rejects with `InsufficientFunds`, `KycRequired`
     * or `EntryUnavailable` when the entry cannot be paid (no run is started), and with
     * `PaymentPending` while the payment is not confirmed yet - call it again later.
     */
    async StartGhostRun(pool) {
        return this.ghostRunCall('POST', 'run/start', pool, "Failed to start a ghost run");
    }
    /**
     * Gives up the active run. An open match counts as not reported (usually a loss).
     *
     * In a paid pool, abandoning before the run got its first opponent refunds the entry (the run's
     * Entry.Status becomes Refunded, or RefundPending while the refund is on its way). After an
     * opponent was issued there is no refund.
     */
    async AbandonGhostRun(pool) {
        return this.ghostRunCall('POST', 'run/abandon', pool, "Failed to abandon the ghost run");
    }
    /**
     * Finds an opponent. Pass the values of the pool's attributes (attributes bound to the run may
     * be omitted: the server fills them) and, optionally, the player's own ship to store in the
     * same request. Searching again before reporting returns the same match.
     *
     * Rejects with GhostError; `NoOpponent` is a normal outcome. In a paid pool it rejects with
     * `PaymentPending` until the run's entry payment is confirmed (see StartGhostRun).
     */
    async FindGhostOpponent(pool, attributes, options = {}) {
        const response = await fetch(`${this.apiUri}/Ghost/find`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                Pool: pool,
                Attributes: attributes ?? {},
                Snapshot: options.snapshot ?? null,
                Exclude: options.exclude ?? [],
                AllowBots: options.allowBots ?? true
            })
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to find a ghost opponent");
        const wire = await response.json();
        return {
            Match: this.mapGhostMatch(wire.Match),
            Run: this.mapGhostRun(wire.Run),
            UploadedSnapshotId: wire.UploadedSnapshotId ?? null
        };
    }
    /** Stores the player's ship (your game's JSON as a string) without searching. */
    async UploadGhostSnapshot(pool, attributes, snapshot) {
        const response = await fetch(`${this.apiUri}/Ghost/upload`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ Pool: pool, Attributes: attributes ?? {}, Snapshot: snapshot })
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to upload the ghost snapshot");
        return await response.json();
    }
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
    async ReportGhostResult(matchId, outcome, fightHash = null, matchData = null) {
        const headers = this.getAuthHeaders();
        if (!Object.values(GhostOutcome).includes(outcome)) {
            throw new GhostError(GhostErrorCode.InvalidOutcome, `Outcome must be Win, Loss or Draw, got "${outcome}".`);
        }
        const id = String(matchId).toLowerCase();
        const plainText = JSON.stringify({
            MatchId: id,
            Outcome: outcome,
            FightHash: fightHash,
            ...(typeof matchData === 'string' && matchData.length > 0 ? { MatchData: matchData } : {})
        });
        const signed = await this.signResult(PayloadKind.Ghost, id, plainText);
        if (!signed) {
            throw new GhostError(GhostErrorCode.Unknown, "Failed to report the ghost fight: the result could not be signed, so it was not sent. Report again with the same match id.");
        }
        const response = await fetch(`${this.apiUri}/Ghost/report`, {
            method: "POST",
            headers,
            body: JSON.stringify({ MatchId: id, EncryptedData: signed.Data, Hash: signed.Hash })
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to report the ghost fight");
        const wire = await response.json();
        return { ...wire, Run: this.mapGhostRun(wire.Run) };
    }
    /** What the player's ghosts did since the previous call; the call resets the "New" counters. */
    async GetGhostReportSummary(pool) {
        const response = await fetch(`${this.apiUri}/Ghost/report-summary?pool=${encodeURIComponent(pool)}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to fetch the ghost report");
        return await response.json();
    }
    /** The player's fights and the fights against the player's ghosts, newest first. */
    async GetGhostHistory(pool, page = 1, limit = 20) {
        const query = `pool=${encodeURIComponent(pool)}&page=${page}&limit=${limit}`;
        const response = await fetch(`${this.apiUri}/Ghost/history?${query}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to fetch the ghost history");
        const wire = await response.json();
        return { ...wire, Items: wire.Items ?? [] };
    }
    /**
     * Players of the pool's season ranked by rating, plus the player's own place. Only players who
     * fought this season are ranked. Pass `partition` to read a past season.
     */
    async GetGhostLeaderboard(pool, page = 1, limit = 20, partition = null) {
        let query = `pool=${encodeURIComponent(pool)}&page=${page}&limit=${limit}`;
        if (partition)
            query += `&partition=${encodeURIComponent(partition)}`;
        const response = await fetch(`${this.apiUri}/Ghost/leaderboard?${query}`, {
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwGhostError(response, "Failed to fetch the ghost leaderboard");
        const wire = await response.json();
        return { ...wire, Items: wire.Items ?? [], Me: wire.Me ?? null };
    }
    async ghostRunCall(method, path, pool, fallback) {
        const response = await fetch(`${this.apiUri}/Ghost/${path}?pool=${encodeURIComponent(pool)}`, {
            method,
            headers: this.getAuthHeaders(false)
        });
        if (!response.ok)
            await this.throwGhostError(response, fallback);
        const wire = await response.json();
        return {
            Run: this.mapGhostRun(wire.Run),
            OpenMatch: wire.OpenMatch ? this.mapGhostMatch(wire.OpenMatch) : null
        };
    }
    mapGhostMatch(wire) {
        return { ...wire, OpponentAttributes: wire.OpponentAttributes ?? {} };
    }
    // Entry is null in a free pool (and absent from older answers).
    mapGhostRun(wire) {
        if (!wire)
            return null;
        const entry = wire.Entry;
        return {
            ...wire,
            Entry: entry ? { Status: entry.Status, Amount: entry.Amount ?? null, BalanceAfter: entry.BalanceAfter ?? null } : null
        };
    }
    async throwGhostError(response, fallback) {
        const text = await response.text();
        let code = GhostErrorCode.Unknown;
        let message = text || `HTTP ${response.status}`;
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed.Error === 'string' &&
                Object.values(GhostErrorCode).includes(parsed.Error)) {
                code = parsed.Error;
            }
            if (parsed && typeof parsed.Message === 'string') {
                message = parsed.Message;
            }
        }
        catch {
            // Not a JSON body - keep the raw text under the Unknown code.
        }
        throw new GhostError(code, `${fallback}: ${message}`);
    }
    /* ================= Community Goal Methods =================
     *
     * Every player of the game pushes one shared counter toward a target ("defeat the world boss",
     * "collect a million coins"). Goals of a chain open one after another. A player starts an attempt
     * (one of the day's attempts), plays, and completes it with a contribution: a whole number of
     * whatever the game counts. What a contribution means, and the goal's own data (PayloadJson), are
     * entirely the game's. Reads work before sign-in; attempts need a signed-in player.
     *
     * A chain may also sell paid attempts (CommunityGoalChain.PaidAttempts): StartGoalAttempt with
     * { paid: true } charges the price once and hands the attempt out when it is paid. Paid attempts have
     * their own daily limit and count in the goal and the leaderboard like free ones.
     */
    /** The chain's open goal (or its latest while the next one is not open yet) and the player's own state. */
    async GetCommunityGoal(chainKey) {
        const response = await fetch(`${this.apiUri}/CommunityGoal/${encodeURIComponent(chainKey)}`, {
            headers: this.getOptionalAuthHeaders()
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to fetch the community goal");
        return this.mapCommunityGoalState(await response.json());
    }
    /** Any goal of the game by id, open or past (e.g. the one NextGoalId names). */
    async GetCommunityGoalById(goalId) {
        const response = await fetch(`${this.apiUri}/CommunityGoal/goal/${encodeURIComponent(goalId)}`, {
            headers: this.getOptionalAuthHeaders()
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to fetch the community goal");
        return this.mapCommunityGoalState(await response.json());
    }
    /** The shared state only. Cheap; poll it no more often than PollAfterSeconds (or use WatchCommunityGoal). */
    async GetCommunityGoalLive(goalId) {
        const response = await fetch(`${this.apiUri}/CommunityGoal/goal/${encodeURIComponent(goalId)}/live`, {
            headers: this.getOptionalAuthHeaders()
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to fetch the live goal state");
        const wire = await response.json();
        return { ...wire, MilestonesPassed: wire.MilestonesPassed ?? [], StrikeCount: wire.StrikeCount ?? 0, NextGoalId: wire.NextGoalId ?? null };
    }
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
    async StartGoalAttempt(goalId, options = {}) {
        const hasData = typeof options.startData === 'string' && options.startData.length > 0;
        const paid = options.paid === true;
        const body = {};
        if (hasData)
            body.StartData = options.startData;
        if (paid)
            body.Paid = true;
        const hasBody = hasData || paid;
        const response = await fetch(`${this.apiUri}/CommunityGoal/attempt/start?goalId=${encodeURIComponent(goalId)}`, {
            method: "POST",
            headers: this.getAuthHeaders(hasBody),
            ...(hasBody ? { body: JSON.stringify(body) } : {})
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to start a goal attempt");
        const wire = await response.json();
        const entry = wire.Entry;
        return {
            ...wire, Attempt: this.mapGoalAttempt(wire.Attempt), Goal: this.mapCommunityGoal(wire.Goal),
            PaidAttemptsLeftToday: wire.PaidAttemptsLeftToday ?? null,
            Entry: entry ? { Status: entry.Status, Amount: entry.Amount ?? null, BalanceAfter: entry.BalanceAfter ?? null } : null
        };
    }
    /**
     * Completes an attempt with its contribution, once: a repeat returns the first result
     * (Replayed = true). The result is encrypted and signed like a campaign completion. An attempt
     * started before its goal closed still counts in full.
     *
     * Rejects with CommunityGoalError: `AttemptExpired`, `CompletionTooFast` (the attempt is used),
     * `InvalidContribution`, `DataTooLarge` (strikeData too long: nothing counted, send again without it).
     */
    async CompleteGoalAttempt(attempt, contribution, options = {}) {
        const headers = this.getAuthHeaders();
        if (!attempt || !attempt.AttemptId || !attempt.GoalId) {
            throw new CommunityGoalError(CommunityGoalErrorCode.AttemptNotFound, "Pass the attempt returned by StartGoalAttempt.");
        }
        if (!Number.isSafeInteger(contribution) || contribution < 0) {
            throw new CommunityGoalError(CommunityGoalErrorCode.InvalidContribution, `Contribution must be a whole number of 0 or more, got ${contribution}.`);
        }
        const id = String(attempt.AttemptId).toLowerCase();
        const plainText = JSON.stringify({
            AttemptId: id,
            GoalId: String(attempt.GoalId).toLowerCase(),
            Contribution: contribution,
            ClientDurationSeconds: options.clientDurationSeconds ?? null,
            Metrics: options.metrics ?? null,
            FightHash: options.fightHash ?? null,
            StrikeData: options.strikeData ?? null
        });
        const signed = await this.signResult(PayloadKind.CommunityGoal, id, plainText);
        if (!signed) {
            throw new CommunityGoalError(CommunityGoalErrorCode.Unknown, "Failed to complete the goal attempt: the result could not be signed, so it was not sent. Complete it again with the same attempt.");
        }
        const response = await fetch(`${this.apiUri}/CommunityGoal/attempt/complete`, {
            method: "POST",
            headers,
            body: JSON.stringify({ AttemptId: id, EncryptedData: signed.Data, Hash: signed.Hash })
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to complete the goal attempt");
        const wire = await response.json();
        return {
            ...wire, MilestonesCrossed: wire.MilestonesCrossed ?? [], NextGoalId: wire.NextGoalId ?? null, Place: wire.Place ?? null,
            Best: wire.Best ?? 0, IsNewBest: wire.IsNewBest ?? false, PaidAttemptsLeftToday: wire.PaidAttemptsLeftToday ?? null
        };
    }
    /** Contributors ranked by score (ties: who got there first), the player's own row and the rows around it. */
    async GetCommunityGoalLeaderboard(goalId, page = 1, limit = 20) {
        const query = `page=${page}&limit=${limit}`;
        const response = await fetch(`${this.apiUri}/CommunityGoal/goal/${encodeURIComponent(goalId)}/leaderboard?${query}`, {
            headers: this.getOptionalAuthHeaders()
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to fetch the goal leaderboard");
        const wire = await response.json();
        const entry = (row) => ({ ...row, Best: row.Best ?? 0, BestStrikeId: row.BestStrikeId ?? null });
        return { ...wire, Items: (wire.Items ?? []).map(entry), Around: (wire.Around ?? []).map(entry), Me: wire.Me ? entry(wire.Me) : null };
    }
    /**
     * A player's best strike on a goal, by the BestStrikeId of their leaderboard row, with the strikeData
     * sent with it (for example to copy the build or replay the strike). Works before sign-in.
     *
     * Rejects with CommunityGoalError: `StrikeNotFound` (no longer that player's best: reload the leaderboard).
     */
    async GetCommunityGoalStrike(goalId, strikeId) {
        const response = await fetch(`${this.apiUri}/CommunityGoal/goal/${encodeURIComponent(goalId)}/strike/${encodeURIComponent(strikeId)}`, {
            headers: this.getOptionalAuthHeaders()
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to fetch the strike");
        const wire = await response.json();
        return { ...wire, Name: wire.Name ?? null, AvatarUrl: wire.AvatarUrl ?? null, StrikeData: wire.StrikeData ?? null };
    }
    /**
     * The chain's past goals (closed or settled), newest first, with the signed-in player's part in
     * each: score, best strike, share of the goal, final place, bracket and reward status. Up to 20
     * per page. For one goal's full state and the rewards it paid, use GetCommunityGoalById.
     */
    async GetCommunityGoalHistory(chainKey, page = 1, limit = 10) {
        const query = `page=${page}&limit=${limit}`;
        const response = await fetch(`${this.apiUri}/CommunityGoal/${encodeURIComponent(chainKey)}/history?${query}`, {
            headers: this.getOptionalAuthHeaders()
        });
        if (!response.ok)
            await this.throwCommunityGoalError(response, "Failed to fetch the goal history");
        const wire = await response.json();
        return {
            ...wire,
            Items: (wire.Items ?? []).map(item => ({
                ...item,
                ClosedAt: item.ClosedAt ?? null,
                StrikeCount: item.StrikeCount ?? 0,
                ClosedBy: this.mapClosedBy(item.ClosedBy),
                Me: item.Me
                    ? { ...item.Me, FinalPlace: item.Me.FinalPlace ?? null, Bracket: item.Me.Bracket ?? null, RewardStatus: item.Me.RewardStatus ?? null }
                    : null
            }))
        };
    }
    /**
     * Polls a goal's live state at the interval the server asks for and calls onChange whenever the
     * value, status or contributor count changes (and once at the start). Pauses while the page is
     * hidden, and stops by itself once the goal is settled (it never changes again). Call stop() when
     * the goal leaves the screen.
     */
    WatchCommunityGoal(goalId, onChange, options = {}) {
        const minInterval = Math.max(1, options.minIntervalSeconds ?? 2);
        const hasDocument = typeof document !== 'undefined' && typeof document.addEventListener === 'function';
        let stopped = false;
        let running = false;
        let timer = null;
        let interval = 5;
        let last = null;
        const isHidden = () => !options.pollWhenHidden && hasDocument && document.hidden === true;
        const stop = () => {
            stopped = true;
            if (timer !== null)
                clearTimeout(timer);
            timer = null;
            if (hasDocument)
                document.removeEventListener('visibilitychange', onVisibility);
        };
        const tick = async () => {
            timer = null;
            if (stopped || running)
                return;
            if (isHidden())
                return; // resumed by the visibilitychange listener
            running = true;
            try {
                const live = await this.GetCommunityGoalLive(goalId);
                if (stopped)
                    return;
                if (live.PollAfterSeconds > 0)
                    interval = live.PollAfterSeconds;
                const key = `${live.Status}|${live.CurrentValue}|${live.ContributorCount}|${live.NextGoalId}`;
                if (key !== last) {
                    last = key;
                    onChange(live);
                }
                if (live.Status === 'Settled') {
                    stop();
                    return;
                }
            }
            catch (error) {
                if (!stopped)
                    options.onError?.(error);
            }
            finally {
                running = false;
            }
            if (!stopped)
                timer = setTimeout(() => void tick(), Math.max(minInterval, interval) * 1000);
        };
        function onVisibility() {
            if (!stopped && !isHidden() && timer === null && !running)
                void tick();
        }
        if (hasDocument)
            document.addEventListener('visibilitychange', onVisibility);
        void tick();
        return { stop };
    }
    /** X-User-Key always; the player's token only when signed in (Community Goal reads work before sign-in). */
    getOptionalAuthHeaders() {
        const headers = { "X-User-Key": this.config.publicGameKey };
        if (this.jwtToken) {
            headers["Authorization"] = `Bearer ${this.jwtToken}`;
        }
        return headers;
    }
    mapCommunityGoalState(wire) {
        const me = wire.Me ?? null;
        const rewards = me?.Rewards ?? [];
        const paid = wire.Chain?.PaidAttempts;
        return {
            ...wire,
            Chain: {
                ...wire.Chain, Milestones: wire.Chain?.Milestones ?? [],
                PaidAttempts: paid ? { ...paid, DisplayPrice: paid.DisplayPrice ?? null, PerDay: paid.PerDay ?? 0 } : null
            },
            Goal: this.mapCommunityGoal(wire.Goal),
            Me: me ? {
                ...me, OpenAttempt: this.mapGoalAttempt(me.OpenAttempt), Place: me.Place ?? null, FinalPlace: me.FinalPlace ?? null,
                Bracket: me.Bracket ?? null, Best: me.Best ?? 0, RewardStatus: me.RewardStatus ?? null,
                PaidAttemptsUsedToday: me.PaidAttemptsUsedToday ?? 0, PaidAttemptsLeftToday: me.PaidAttemptsLeftToday ?? null,
                Rewards: rewards.map(reward => this.mapRecentReward(reward))
            } : null
        };
    }
    mapGoalAttempt(wire) {
        if (!wire)
            return null;
        return { ...wire, MilestonesAtStart: wire.MilestonesAtStart ?? [], StartData: wire.StartData ?? null, Paid: wire.Paid ?? false };
    }
    mapClosedBy(wire) {
        if (!wire)
            return null;
        return { ...wire, Name: wire.Name ?? null, AvatarUrl: wire.AvatarUrl ?? null, IsMe: wire.IsMe ?? false };
    }
    mapCommunityGoal(wire) {
        if (!wire)
            return null;
        return {
            ...wire, MilestonesPassed: wire.MilestonesPassed ?? [], ClosedAt: wire.ClosedAt ?? null, NextGoalId: wire.NextGoalId ?? null,
            StrikeCount: wire.StrikeCount ?? 0, ClosedBy: this.mapClosedBy(wire.ClosedBy),
            Rewards: (wire.Rewards ?? []).map(bracket => ({
                ...bracket,
                Label: bracket.Label ?? null,
                MaxPlace: bracket.MaxPlace ?? null,
                MaxPercentile: bracket.MaxPercentile ?? null,
                AnyContribution: bracket.AnyContribution ?? false,
                Display: (bracket.Display ?? []).map(shown => ({ ...shown, Code: shown.Code ?? null, ImageUrl: shown.ImageUrl ?? null, Amount: shown.Amount ?? null }))
            }))
        };
    }
    async throwCommunityGoalError(response, fallback) {
        const text = await response.text();
        let code = CommunityGoalErrorCode.Unknown;
        let message = text || `HTTP ${response.status}`;
        let nextGoalId = null;
        let resetsAt = null;
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed.Error === 'string' &&
                Object.values(CommunityGoalErrorCode).includes(parsed.Error)) {
                code = parsed.Error;
            }
            if (parsed && typeof parsed.Message === 'string') {
                message = parsed.Message;
            }
            nextGoalId = parsed?.NextGoalId ?? null;
            resetsAt = parsed?.ResetsAt ?? null;
        }
        catch {
            // Not a JSON body - keep the raw text under the Unknown code.
        }
        throw new CommunityGoalError(code, `${fallback}: ${message}`, nextGoalId, resetsAt);
    }
    /* ================= Dedicated Server Session Methods =================
     *
     * FinishRoomSession_Server is supported: a trusted game server reports the final scores of an
     * external match with it (see JoinExternalMatch). RecordEvent_Server and
     * GetCurrentSessionEvents_Server are local and work.
     *
     * NOTE: CreateSession_Server, UserLeaveSession_Server and CloseCurrentSession_Server are not
     * supported at the moment; do not use them.
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
    async FinishRoomSession_Server(eventId, sessionId, participants) {
        const scores = participants.map(p => ({
            game_session_id_or_match_id: sessionId,
            // Must be an integer; truncate so a fractional score cannot fail the request. Null: the player left.
            score: p.Score == null ? null : Math.trunc(p.Score),
            is_suspected_cheater: false,
            user_ip_end_session: p.UserIp,
            user_id: p.FunticoUserId,
            // Only a number is accepted here; leave the field out otherwise.
            ...(typeof p.GameManagedAward === 'number' ? { game_managed_award: p.GameManagedAward } : {})
        }));
        const response = await fetch(`${this.apiUri}/Rooms/end-room-all-users?eventId=${eventId}`, {
            method: "POST",
            headers: await this.getServerHeaders(),
            body: JSON.stringify({ scores })
        });
        const text = await response.text();
        if (!response.ok)
            throw new Error(`Failed to finalize server match results: ${text}`);
        // The answer lists a result per score; a refused one means the match is not settled.
        let results;
        try {
            results = JSON.parse(text)?.results;
        }
        catch {
            results = undefined;
        }
        if (Array.isArray(results) && results.some(r => typeof r?.status === 'number' && r.status >= 400)) {
            throw new Error(`Failed to finalize server match results: ${text}`);
        }
        // Cleanup session tracking
        this.activeServerSessionId = null;
        this.activeServerSessionEvents.clear();
        return true;
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
 * // To keep the secret key on your own server, pass payloadSigner in place of privateGameKey
 * // (see PayloadSigner).
 */
class FunticoClient {
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
    /**
     * Fetches the player's inventory (FunticoSDK.GetInventory) and broadcasts it as
     * INVENTORY_UPDATED, so an inventory screen can rebind without owning the request.
     */
    async refreshInventory(useCache = false, includeOtherItems = false) {
        const inventory = await this.sdk.GetInventory(useCache, includeOtherItems);
        this.emit(FunticoClient.EVENTS.INVENTORY_UPDATED, inventory);
        return inventory;
    }
}
/** Event names. Keys and values are identical to FunticoPhaserPlugin.EVENTS. */
FunticoClient.EVENTS = {
    INITIALIZED: 'funtico_initialized',
    AUTHENTICATED: 'funtico_authenticated',
    USER_DATA_UPDATED: 'funtico_user_updated',
    BALANCE_UPDATED: 'funtico_balance_updated',
    CAMPAIGN_PROGRESS_UPDATED: 'funtico_campaign_progress_updated',
    INVENTORY_UPDATED: 'funtico_inventory_updated'
};

return {
  FunticoEnvironment: FunticoEnvironment,
  EntryFeeType: EntryFeeType,
  RoomTier: RoomTier,
  LeadersState: LeadersState,
  TournamentsFilterEnum: TournamentsFilterEnum,
  GameTypeEnum: GameTypeEnum,
  UserGameStatus: UserGameStatus,
  HallOfFamePeriodMode: HallOfFamePeriodMode,
  HallOfFameGameModeFilter: HallOfFameGameModeFilter,
  HallOfFameGameMode: HallOfFameGameMode,
  PrizeType: PrizeType,
  PrizeUtils: PrizeUtils,
  CampaignLevelStatus: CampaignLevelStatus,
  CampaignErrorCode: CampaignErrorCode,
  CampaignError: CampaignError,
  InventoryErrorCode: InventoryErrorCode,
  InventoryError: InventoryError,
  CraftStatus: CraftStatus,
  RecentRewardStatus: RecentRewardStatus,
  GhostErrorCode: GhostErrorCode,
  GhostError: GhostError,
  GhostOutcome: GhostOutcome,
  CommunityGoalErrorCode: CommunityGoalErrorCode,
  CommunityGoalError: CommunityGoalError,
  CryptoHelper: CryptoHelper,
  PayloadKind: PayloadKind,
  LocalPayloadSigner: LocalPayloadSigner,
  FunticoSDK: FunticoSDK,
  FunticoClient: FunticoClient
};
});
