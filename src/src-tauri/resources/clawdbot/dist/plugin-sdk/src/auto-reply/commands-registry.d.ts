import type { SkillCommandSpec } from "../agents/skills.js";
import type { OpenClawConfig } from "../config/types.js";
import type { ChatCommandDefinition, CommandArgDefinition, CommandArgs, NativeCommandSpec, ShouldHandleTextCommandsParams } from "./commands-registry.types.js";
export { isCommandEnabled, listChatCommands, listChatCommandsForConfig, } from "./commands-registry-list.js";
export { getCommandDetection, maybeResolveTextAlias, normalizeCommandBody, resolveTextCommand, } from "./commands-registry-normalize.js";
export type { ChatCommandDefinition, CommandArgChoiceContext, CommandArgDefinition, CommandArgMenuSpec, CommandArgValues, CommandArgs, CommandDetection, CommandNormalizeOptions, CommandScope, NativeCommandSpec, ShouldHandleTextCommandsParams, } from "./commands-registry.types.js";
export declare function listNativeCommandSpecs(params?: {
    skillCommands?: SkillCommandSpec[];
    provider?: string;
}): NativeCommandSpec[];
export declare function listNativeCommandSpecsForConfig(cfg: OpenClawConfig, params?: {
    skillCommands?: SkillCommandSpec[];
    provider?: string;
}): NativeCommandSpec[];
export declare function findCommandByNativeName(name: string, provider?: string): ChatCommandDefinition | undefined;
export declare function buildCommandText(commandName: string, args?: string): string;
export declare function parseCommandArgs(command: ChatCommandDefinition, raw?: string): CommandArgs | undefined;
export declare function serializeCommandArgs(command: ChatCommandDefinition, args?: CommandArgs): string | undefined;
export declare function buildCommandTextFromArgs(command: ChatCommandDefinition, args?: CommandArgs): string;
export type ResolvedCommandArgChoice = {
    value: string;
    label: string;
};
export declare function resolveCommandArgChoices(params: {
    command: ChatCommandDefinition;
    arg: CommandArgDefinition;
    cfg?: OpenClawConfig;
    provider?: string;
    model?: string;
}): ResolvedCommandArgChoice[];
export declare function resolveCommandArgMenu(params: {
    command: ChatCommandDefinition;
    args?: CommandArgs;
    cfg?: OpenClawConfig;
}): {
    arg: CommandArgDefinition;
    choices: ResolvedCommandArgChoice[];
    title?: string;
} | null;
export declare function isCommandMessage(raw: string): boolean;
export declare function isNativeCommandSurface(surface?: string): boolean;
export declare function shouldHandleTextCommands(params: ShouldHandleTextCommandsParams): boolean;
