export { resolveAssistantEventPhase } from "../shared/chat-message-content.js";
export declare function resolveMergedAssistantText(params: {
    previousText: string;
    nextText: string;
    nextDelta: string;
}): string;
export declare function normalizeLiveAssistantEventText(params: {
    text: string;
    delta?: unknown;
}): {
    text: string;
    delta: string;
};
export declare function projectLiveAssistantBufferedText(rawText: string, options?: {
    suppressLeadFragments?: boolean;
}): {
    text: string;
    suppress: boolean;
    pendingLeadFragment: boolean;
};
export declare function shouldSuppressAssistantEventForLiveChat(data: unknown): boolean;
