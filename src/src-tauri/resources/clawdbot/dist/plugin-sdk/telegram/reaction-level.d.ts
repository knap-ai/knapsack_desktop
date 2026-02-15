import type { OpenClawConfig } from "../config/config.js";
export type TelegramReactionLevel = "off" | "ack" | "minimal" | "extensive";
export type ResolvedReactionLevel = {
    level: TelegramReactionLevel;
    /** Whether ACK reactions (e.g., 👀 when processing) are enabled. */
    ackEnabled: boolean;
    /** Whether agent-controlled reactions are enabled. */
    agentReactionsEnabled: boolean;
    /** Guidance level for agent reactions (minimal = sparse, extensive = liberal). */
    agentReactionGuidance?: "minimal" | "extensive";
};
/**
 * Resolve the effective reaction level and its implications.
 */
export declare function resolveTelegramReactionLevel(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): ResolvedReactionLevel;
