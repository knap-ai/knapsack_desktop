import type { OpenClawConfig } from "../config/config.js";
import { type SkillCommandSpec } from "../agents/skills.js";
export declare function listSkillCommandsForWorkspace(params: {
    workspaceDir: string;
    cfg: OpenClawConfig;
    skillFilter?: string[];
}): SkillCommandSpec[];
export declare function listSkillCommandsForAgents(params: {
    cfg: OpenClawConfig;
    agentIds?: string[];
}): SkillCommandSpec[];
export declare function resolveSkillCommandInvocation(params: {
    commandBodyNormalized: string;
    skillCommands: SkillCommandSpec[];
}): {
    command: SkillCommandSpec;
    args?: string;
} | null;
