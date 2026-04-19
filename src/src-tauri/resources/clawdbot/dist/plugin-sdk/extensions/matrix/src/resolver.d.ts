import type { ChannelPlugin } from "openclaw/plugin-sdk/channel-core";
import type { ResolvedMatrixAccount } from "./matrix/accounts.js";
type MatrixResolver = NonNullable<ChannelPlugin<ResolvedMatrixAccount>["resolver"]>;
export declare const matrixResolverAdapter: MatrixResolver;
export {};
