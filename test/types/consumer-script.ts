// Type-checked by test/t6-types.test.mjs (tsc --noEmit --strict). Never executed.
// A classic <script> consumer: no imports, the global `FunticoSDK` namespace declared by
// `export as namespace FunticoSDK;` at the end of dist/funtico-sdk.d.ts.
/// <reference path="../../dist/funtico-sdk.d.ts" />

const scriptConfig: FunticoSDK.FunticoConfig = {
  env: FunticoSDK.FunticoEnvironment.STAGING,
  publicGameKey: 'your-public-key',
  privateGameKey: 'your-private-key',
};

const scriptSdk: FunticoSDK.FunticoSDK = FunticoSDK.FunticoSDK.Instance;
const scriptClient = new FunticoSDK.FunticoClient();
scriptClient.on(FunticoSDK.FunticoClient.EVENTS.AUTHENTICATED, (jwt: string) => console.log(jwt.length));

async function scriptFlow(): Promise<void> {
  await scriptClient.init(scriptConfig);
  const hof: FunticoSDK.HallOfFameResponse = await scriptSdk.GetHallOfFame(FunticoSDK.HallOfFamePeriodMode.Global);
  const firstName: string = hof.leaderboard[0].displayName;
  void firstName;
}

// @ts-expect-error GetHallOfFame needs a period mode
scriptSdk.GetHallOfFame();
// @ts-expect-error the namespace has no such member
FunticoSDK.NotExported;
// @ts-expect-error displayName is camelCase on the Hall of Fame wire model
const pascal: string = ({} as FunticoSDK.HallOfFamePlayerEntry).DisplayName;

void scriptFlow; void pascal;
