import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";
export type AnyAgentTool = AgentTool<any, unknown>;
export type StringParamOptions = {
    required?: boolean;
    trim?: boolean;
    label?: string;
    allowEmpty?: boolean;
};
export type ActionGate<T extends Record<string, boolean | undefined>> = (key: keyof T, defaultValue?: boolean) => boolean;
export declare class ToolInputError extends Error {
    readonly status = 400;
    constructor(message: string);
}
export declare function createActionGate<T extends Record<string, boolean | undefined>>(actions: T | undefined): ActionGate<T>;
export declare function readStringParam(params: Record<string, unknown>, key: string, options: StringParamOptions & {
    required: true;
}): string;
export declare function readStringParam(params: Record<string, unknown>, key: string, options?: StringParamOptions): string | undefined;
export declare function readStringOrNumberParam(params: Record<string, unknown>, key: string, options?: {
    required?: boolean;
    label?: string;
}): string | undefined;
export declare function readNumberParam(params: Record<string, unknown>, key: string, options?: {
    required?: boolean;
    label?: string;
    integer?: boolean;
}): number | undefined;
export declare function readStringArrayParam(params: Record<string, unknown>, key: string, options: StringParamOptions & {
    required: true;
}): string[];
export declare function readStringArrayParam(params: Record<string, unknown>, key: string, options?: StringParamOptions): string[] | undefined;
export type ReactionParams = {
    emoji: string;
    remove: boolean;
    isEmpty: boolean;
};
export declare function readReactionParams(params: Record<string, unknown>, options: {
    emojiKey?: string;
    removeKey?: string;
    removeErrorMessage: string;
}): ReactionParams;
export declare function jsonResult(payload: unknown): AgentToolResult<unknown>;
export declare function imageResult(params: {
    label: string;
    path: string;
    base64: string;
    mimeType: string;
    extraText?: string;
    details?: Record<string, unknown>;
}): Promise<AgentToolResult<unknown>>;
export declare function imageResultFromFile(params: {
    label: string;
    path: string;
    extraText?: string;
    details?: Record<string, unknown>;
}): Promise<AgentToolResult<unknown>>;
