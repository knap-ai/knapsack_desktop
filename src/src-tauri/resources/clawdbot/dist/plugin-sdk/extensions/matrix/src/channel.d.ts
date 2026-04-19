import { type ChannelPlugin } from "openclaw/plugin-sdk/channel-core";
import { type ResolvedMatrixAccount } from "./matrix/accounts.js";
import type { MatrixProbe } from "./matrix/probe.js";
export declare const matrixPlugin: ChannelPlugin<ResolvedMatrixAccount, MatrixProbe>;
