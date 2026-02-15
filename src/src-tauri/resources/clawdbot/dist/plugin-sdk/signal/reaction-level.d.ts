import type { OpenClawConfig } from "../config/config.js";
export type SignalReactionLevel = "off" | "ack" | "minimal" | "extensive";
export type ResolvedSignalReactionLevel = {
    level: SignalReactionLevel;
    /** Whether ACK reactions (e.g., 👀 when processing) are enabled. */
    ackEnabled: boolean;
    /** Whether agent-controlled reactions are enabled. */
    agentReactionsEnabled: boolean;
    /** Guidance level for agent reactions (minimal = sparse, extensive = liberal). */
    agentReactionGuidance?: "minimal" | "extensive";
};
/**
 * Resolve the effective reaction level and its implications for Signal.
 *
 * Levels:
 * - "off": No reactions at all
 * - "ack": Only automatic ack reactions (👀 when processing), no agent reactions
 * - "minimal": Agent can react, but sparingly (default)
 * - "extensive": Agent can react liberally
 */
export declare function resolveSignalReactionLevel(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): ResolvedSignalReactionLevel;
