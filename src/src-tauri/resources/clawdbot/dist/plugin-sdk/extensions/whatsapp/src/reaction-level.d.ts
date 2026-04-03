import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { type ReactionLevel, type ResolvedReactionLevel } from "openclaw/plugin-sdk/text-runtime";
export type WhatsAppReactionLevel = ReactionLevel;
export type ResolvedWhatsAppReactionLevel = ResolvedReactionLevel;
/** Resolve the effective reaction level and its implications for WhatsApp. */
export declare function resolveWhatsAppReactionLevel(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): ResolvedWhatsAppReactionLevel;
