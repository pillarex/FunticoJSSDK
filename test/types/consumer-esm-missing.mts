// Type-checked by test/t6-types.test.mjs. Imports that must NOT resolve: internal or stripped names.
// @ts-expect-error TicketType is internal to the SDK and not exported
import { TicketType } from '../../dist/funtico-sdk.mjs';
// @ts-expect-error the Phaser plugin is stripped from the JS SDK
import { FunticoPhaserPlugin } from '../../dist/funtico-sdk.mjs';

export { TicketType, FunticoPhaserPlugin };
