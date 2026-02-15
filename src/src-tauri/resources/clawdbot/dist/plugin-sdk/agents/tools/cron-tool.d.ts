import { type AnyAgentTool } from "./common.js";
type CronToolOptions = {
    agentSessionKey?: string;
};
export declare function createCronTool(opts?: CronToolOptions): AnyAgentTool;
export {};
