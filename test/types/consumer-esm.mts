// Type-checked by test/t6-types.test.mjs (tsc --noEmit --strict, module nodenext). Never executed.
// An ES-module consumer of dist/funtico-sdk.mjs (types come from dist/funtico-sdk.d.mts).
// Every @ts-expect-error line MUST fail to type-check - if the types degraded to `any`, the unused
// directive itself would become an error, so these lines prove the declarations are real.
import {
  FunticoSDK, FunticoClient, FunticoEnvironment, EntryFeeType, CampaignError, CampaignErrorCode,
  HallOfFamePeriodMode, PrizeUtils, CryptoHelper, LocalPayloadSigner, PayloadKind,
} from '../../dist/funtico-sdk.mjs';
import type {
  FunticoConfig, FunticoSignerConfig, PayloadSigner, SignedPayload, RoomViewModel, UserData, BalanceResponse,
  CampaignCompletionResult, TournamentEnterData,
} from '../../dist/funtico-sdk.mjs';

const config: FunticoConfig = {
  env: FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-private-key',
  userToken: 'platform-token',
  cacheTTL: 30000,
};

// A signer that asks the game's own backend.
const backendSigner: PayloadSigner = {
  async Sign(kind: PayloadKind, saltId: string, payloadJson: string): Promise<SignedPayload | null> {
    const response = await fetch('/sign', { method: 'POST', body: JSON.stringify({ kind, saltId, payloadJson }) });
    return response.ok ? (await response.json()) as SignedPayload : null;
  },
  async EncryptSession(userId: string, sessionJson: string): Promise<string | null> {
    return userId + sessionJson;
  },
  async DecryptSession(userId: string, encryptedData: string): Promise<string | null> {
    return encryptedData.startsWith(userId) ? encryptedData.slice(userId.length) : null;
  },
};
const signerConfig: FunticoSignerConfig = {
  env: FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  payloadSigner: backendSigner,
  userToken: 'platform-token',
};
const localSigner: PayloadSigner = new LocalPayloadSigner('your-private-key');
const salt: string = LocalPayloadSigner.Salt(PayloadKind.Practice, '42');

const funtico = new FunticoClient();
const sdk: FunticoSDK = funtico.sdk;
const same: boolean = sdk === FunticoSDK.Instance;
const eventName: string = FunticoClient.EVENTS.BALANCE_UPDATED;

const chained: FunticoClient = funtico
  .on(FunticoClient.EVENTS.BALANCE_UPDATED, (balance: BalanceResponse) => console.log(balance.Coins))
  .once(FunticoClient.EVENTS.INITIALIZED, () => undefined, { any: 'context' })
  .off(FunticoClient.EVENTS.USER_DATA_UPDATED);

export async function flow(): Promise<number> {
  await funtico.init(config);
  await funtico.init(signerConfig);
  await sdk.Initialize(signerConfig);
  const signed: SignedPayload = await localSigner.Sign(PayloadKind.Room, 'session-id', '{}') ?? { Data: '', Hash: '' };
  void signed; void salt;
  const user: UserData = await funtico.refreshUserData();
  const rooms: RoomViewModel[] = await sdk.GetRooms(0, 10);
  const guid: string = rooms[0].Guid;
  const session = await sdk.JoinRoom(guid);
  await sdk.EndRoomSP(session.EventId, session.SessionOrMatchId, 1234, user.UserId);
  const enter: TournamentEnterData = await sdk.EnterTournament('tournament-id');
  await sdk.ResultTournament_Client('tournament-id', enter.TournamentScoreUuid, 10, true);
  await sdk.GetHallOfFame(HallOfFamePeriodMode.Monthly);
  const affordable: boolean = sdk.CanAffordFromCache(EntryFeeType.Tico, 5);
  const prize: number = PrizeUtils.calculatePrize([], 100);
  const cipher: Promise<string> = CryptoHelper.encrypt('text', 'key');
  void same; void eventName; void chained; void affordable; void prize; void cipher;
  try {
    const result: CampaignCompletionResult = await funtico.completeCampaignLevel({ score: 1.5, perfect: true });
    return result.Stars;
  } catch (err) {
    if (err instanceof CampaignError && err.Code === CampaignErrorCode.NoActiveAttempt) return -1;
    throw err;
  }
}

// @ts-expect-error env must be a FunticoEnvironment member, not an arbitrary string
const badEnv: FunticoConfig = { env: 'dev', publicGameKey: 'a', privateGameKey: 'b' };
// @ts-expect-error privateGameKey is required
const missingKey: FunticoConfig = { env: FunticoEnvironment.PROD, publicGameKey: 'a' };
// @ts-expect-error a config takes privateGameKey or payloadSigner, not both
const bothKeys: FunticoConfig | FunticoSignerConfig = { env: FunticoEnvironment.PROD, publicGameKey: 'a', privateGameKey: 'b', payloadSigner: backendSigner };
// @ts-expect-error a signer config needs its payloadSigner
const noSigner: FunticoSignerConfig = { env: FunticoEnvironment.PROD, publicGameKey: 'a' };
// @ts-expect-error a signer must implement all three methods
const halfSigner: PayloadSigner = { Sign: backendSigner.Sign };
// @ts-expect-error the constructor is private (use FunticoSDK.Instance)
const direct = new FunticoSDK();
// @ts-expect-error validateConfig is private
FunticoSDK.validateConfig(config);
// @ts-expect-error Guid is a string
const wrongType: number = ({} as RoomViewModel).Guid;
// @ts-expect-error init requires a config
funtico.init();
// @ts-expect-error methods are PascalCase on the SDK
sdk.getRooms();

void badEnv; void missingKey; void direct; void wrongType; void bothKeys; void noSigner; void halfSigner;
