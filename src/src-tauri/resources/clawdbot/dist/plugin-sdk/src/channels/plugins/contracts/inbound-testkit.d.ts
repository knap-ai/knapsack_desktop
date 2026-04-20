import type { MsgContext } from "../../../auto-reply/templating.js";
export type InboundContextCapture = {
    ctx: MsgContext | undefined;
};
export declare function createInboundContextCapture(): InboundContextCapture;
export declare function buildDispatchInboundCaptureMock<T extends Record<string, unknown>>(actual: T, setCtx: (ctx: unknown) => void): T & {
    dispatchInboundMessage: import("vitest").Mock<(params: {
        ctx: unknown;
    }) => Promise<{
        queuedFinal: boolean;
        counts: {
            tool: number;
            block: number;
            final: number;
        };
    }>>;
    dispatchInboundMessageWithDispatcher: import("vitest").Mock<(params: {
        ctx: unknown;
    }) => Promise<{
        queuedFinal: boolean;
        counts: {
            tool: number;
            block: number;
            final: number;
        };
    }>>;
    dispatchInboundMessageWithBufferedDispatcher: import("vitest").Mock<(params: {
        ctx: unknown;
    }) => Promise<{
        queuedFinal: boolean;
        counts: {
            tool: number;
            block: number;
            final: number;
        };
    }>>;
};
export declare function buildDispatchInboundContextCapture(loadActual: <T extends Record<string, unknown>>() => Promise<T>, capture: InboundContextCapture): Promise<typeof import("../../../auto-reply/dispatch.js") & {
    dispatchInboundMessage: import("vitest").Mock<(params: {
        ctx: unknown;
    }) => Promise<{
        queuedFinal: boolean;
        counts: {
            tool: number;
            block: number;
            final: number;
        };
    }>>;
    dispatchInboundMessageWithDispatcher: import("vitest").Mock<(params: {
        ctx: unknown;
    }) => Promise<{
        queuedFinal: boolean;
        counts: {
            tool: number;
            block: number;
            final: number;
        };
    }>>;
    dispatchInboundMessageWithBufferedDispatcher: import("vitest").Mock<(params: {
        ctx: unknown;
    }) => Promise<{
        queuedFinal: boolean;
        counts: {
            tool: number;
            block: number;
            final: number;
        };
    }>>;
}>;
export declare const inboundCtxCapture: InboundContextCapture;
