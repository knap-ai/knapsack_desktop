import type { DiscordMessagePreflightContext, DiscordMessagePreflightParams } from "./message-handler.preflight.types.js";
export type { DiscordMessagePreflightContext, DiscordMessagePreflightParams, } from "./message-handler.preflight.types.js";
export declare function preflightDiscordMessage(params: DiscordMessagePreflightParams): Promise<DiscordMessagePreflightContext | null>;
