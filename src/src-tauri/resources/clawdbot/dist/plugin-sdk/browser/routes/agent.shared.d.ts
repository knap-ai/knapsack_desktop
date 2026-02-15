import type { PwAiModule } from "../pw-ai-module.js";
import type { BrowserRouteContext, ProfileContext } from "../server-context.js";
import type { BrowserRequest, BrowserResponse } from "./types.js";
export declare const SELECTOR_UNSUPPORTED_MESSAGE: string;
export declare function readBody(req: BrowserRequest): Record<string, unknown>;
export declare function handleRouteError(ctx: BrowserRouteContext, res: BrowserResponse, err: unknown): void;
export declare function resolveProfileContext(req: BrowserRequest, res: BrowserResponse, ctx: BrowserRouteContext): ProfileContext | null;
export declare function getPwAiModule(): Promise<PwAiModule | null>;
export declare function requirePwAi(res: BrowserResponse, feature: string): Promise<PwAiModule | null>;
