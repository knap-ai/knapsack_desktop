import type { OpenClawConfig, SkillConfig } from "../../config/config.js";
import type { SkillEligibilityContext, SkillEntry } from "./types.js";
export declare function resolveConfigPath(config: OpenClawConfig | undefined, pathStr: string): unknown;
export declare function isConfigPathTruthy(config: OpenClawConfig | undefined, pathStr: string): boolean;
export declare function resolveSkillConfig(config: OpenClawConfig | undefined, skillKey: string): SkillConfig | undefined;
export declare function resolveRuntimePlatform(): string;
export declare function resolveBundledAllowlist(config?: OpenClawConfig): string[] | undefined;
export declare function isBundledSkillAllowed(entry: SkillEntry, allowlist?: string[]): boolean;
export declare function hasBinary(bin: string): boolean;
export declare function shouldIncludeSkill(params: {
    entry: SkillEntry;
    config?: OpenClawConfig;
    eligibility?: SkillEligibilityContext;
}): boolean;
