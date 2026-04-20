export type OpenAIReasoningEffort = "minimal" | "low" | "medium" | "high" | "xhigh";
export type OpenAIApiReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh";
export declare function normalizeOpenAIReasoningEffort(effort: string): string;
