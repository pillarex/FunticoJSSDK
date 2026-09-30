// Type-checked by test/t6-types.test.mjs (tsc --noEmit --strict, module nodenext). Never executed.
// A CommonJS consumer: require() of dist/funtico-sdk.js, typed by dist/funtico-sdk.d.ts.
import Funtico = require('../../dist/funtico-sdk.js');

const config: Funtico.FunticoConfig = {
  env: Funtico.FunticoEnvironment.PROD,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-private-key',
};

const client = new Funtico.FunticoClient();
const sdk: Funtico.FunticoSDK = client.sdk;

export async function flow(): Promise<string> {
  await client.init(config);
  const balance: Funtico.BalanceResponse = await client.refreshBalance(true);
  const tiers: Funtico.TierViewModel[] = await sdk.GetTiers();
  const level: Funtico.CampaignLevelViewModel = (await sdk.GetCampaignLevels()).Levels[0];
  const parsed = sdk.GetCampaignLevelConfig<{ enemies: number }>(level);
  const enemies: number = parsed.enemies;
  void balance; void tiers; void enemies;
  return Funtico.RoomTier[Funtico.RoomTier.Champion];
}

// @ts-expect-error Initialize returns Promise<void>, not a string
const notAString: string = sdk.Initialize(config);
// @ts-expect-error EVENTS keys are fixed
const unknownEvent: string = Funtico.FunticoClient.EVENTS.NOT_AN_EVENT;
// @ts-expect-error metrics values are numbers or booleans
client.completeCampaignLevel({ score: 'high' });

void notAString; void unknownEvent;
