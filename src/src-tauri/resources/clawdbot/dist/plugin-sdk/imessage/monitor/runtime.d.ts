import type { MonitorIMessageOpts } from "./types.js";
import { type RuntimeEnv } from "../../runtime.js";
export declare function resolveRuntime(opts: MonitorIMessageOpts): RuntimeEnv;
export declare function normalizeAllowList(list?: Array<string | number>): string[];
