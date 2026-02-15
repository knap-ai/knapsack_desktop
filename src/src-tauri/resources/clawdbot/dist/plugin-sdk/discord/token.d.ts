import type { OpenClawConfig } from "../config/config.js";
export type DiscordTokenSource = "env" | "config" | "none";
export type DiscordTokenResolution = {
    token: string;
    source: DiscordTokenSource;
};
export declare function normalizeDiscordToken(raw?: string | null): string | undefined;
export declare function resolveDiscordToken(cfg?: OpenClawConfig, opts?: {
    accountId?: string | null;
    envToken?: string | null;
}): DiscordTokenResolution;
