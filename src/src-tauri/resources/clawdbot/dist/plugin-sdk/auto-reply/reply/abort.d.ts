import type { OpenClawConfig } from "../../config/config.js";
import type { FinalizedMsgContext } from "../templating.js";
export declare function isAbortTrigger(text?: string): boolean;
export declare function getAbortMemory(key: string): boolean | undefined;
export declare function setAbortMemory(key: string, value: boolean): void;
export declare function formatAbortReplyText(stoppedSubagents?: number): string;
export declare function stopSubagentsForRequester(params: {
    cfg: OpenClawConfig;
    requesterSessionKey?: string;
}): {
    stopped: number;
};
export declare function tryFastAbortFromMessage(params: {
    ctx: FinalizedMsgContext;
    cfg: OpenClawConfig;
}): Promise<{
    handled: boolean;
    aborted: boolean;
    stoppedSubagents?: number;
}>;
