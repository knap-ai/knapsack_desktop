import type { ReplyPayload } from "../types.js";
import type { TypingSignaler } from "./typing-mode.js";
import { type VerboseLevel } from "../thinking.js";
import { scheduleFollowupDrain } from "./queue.js";
export declare const isAudioPayload: (payload: ReplyPayload) => boolean;
export declare const createShouldEmitToolResult: (params: {
    sessionKey?: string;
    storePath?: string;
    resolvedVerboseLevel: VerboseLevel;
}) => (() => boolean);
export declare const createShouldEmitToolOutput: (params: {
    sessionKey?: string;
    storePath?: string;
    resolvedVerboseLevel: VerboseLevel;
}) => (() => boolean);
export declare const finalizeWithFollowup: <T>(value: T, queueKey: string, runFollowupTurn: Parameters<typeof scheduleFollowupDrain>[1]) => T;
export declare const signalTypingIfNeeded: (payloads: ReplyPayload[], typingSignals: TypingSignaler) => Promise<void>;
