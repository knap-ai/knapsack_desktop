import { type Mock } from "vitest";
import type { MsgContext } from "../../../auto-reply/templating.js";
export declare function primeChannelOutboundSendMock<TArgs extends unknown[]>(sendMock: Mock<(...args: TArgs) => Promise<unknown>>, fallbackResult: Record<string, unknown>, sendResults?: Record<string, unknown>[]): void;
export declare function expectChannelInboundContextContract(ctx: MsgContext): void;
