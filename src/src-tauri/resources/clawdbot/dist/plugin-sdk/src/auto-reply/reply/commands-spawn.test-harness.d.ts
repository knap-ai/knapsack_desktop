import type { OpenClawConfig } from "../../config/config.js";
import type { MsgContext } from "../templating.js";
export declare function buildCommandTestParams(commandBody: string, cfg: OpenClawConfig, ctxOverrides?: Partial<MsgContext>): import("./commands-types.ts").HandleCommandsParams;
