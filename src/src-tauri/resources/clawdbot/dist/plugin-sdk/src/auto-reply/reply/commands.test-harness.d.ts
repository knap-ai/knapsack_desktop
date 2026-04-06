import type { OpenClawConfig } from "../../config/config.js";
import type { MsgContext } from "../templating.js";
import type { HandleCommandsParams } from "./commands-types.js";
export declare function buildCommandTestParams(commandBody: string, cfg: OpenClawConfig, ctxOverrides?: Partial<MsgContext>, options?: {
    workspaceDir?: string;
}): HandleCommandsParams;
