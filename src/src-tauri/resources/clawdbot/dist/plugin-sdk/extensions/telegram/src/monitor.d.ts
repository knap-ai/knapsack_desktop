import type { RunOptions } from "@grammyjs/runner";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { MonitorTelegramOpts } from "./monitor.types.js";
export type { MonitorTelegramOpts } from "./monitor.types.js";
export declare function createTelegramRunnerOptions(cfg: OpenClawConfig): RunOptions<unknown>;
export declare function monitorTelegramProvider(opts?: MonitorTelegramOpts): Promise<void>;
