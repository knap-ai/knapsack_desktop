import type { OpenClawConfig } from "../config/types.openclaw.js";
export type AgentAvatarResolution = {
    kind: "none";
    reason: string;
} | {
    kind: "local";
    filePath: string;
} | {
    kind: "remote";
    url: string;
} | {
    kind: "data";
    url: string;
};
export declare function resolveAgentAvatar(cfg: OpenClawConfig, agentId: string, opts?: {
    includeUiOverride?: boolean;
}): AgentAvatarResolution;
