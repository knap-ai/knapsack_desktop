import type { ReplyPayload } from "../types.js";
export declare function hasSlackDirectives(text: string): boolean;
export declare function parseSlackDirectives(payload: ReplyPayload): ReplyPayload;
