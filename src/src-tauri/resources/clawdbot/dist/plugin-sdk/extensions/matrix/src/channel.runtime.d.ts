import { listMatrixDirectoryGroupsLive, listMatrixDirectoryPeersLive } from "./directory-live.js";
import { resolveMatrixAuth } from "./matrix/client.js";
import { probeMatrix } from "./matrix/probe.js";
import { sendMessageMatrix } from "./matrix/send.js";
import { resolveMatrixTargets } from "./resolve-targets.js";
export declare const matrixChannelRuntime: {
    listMatrixDirectoryGroupsLive: typeof listMatrixDirectoryGroupsLive;
    listMatrixDirectoryPeersLive: typeof listMatrixDirectoryPeersLive;
    matrixOutbound: import("openclaw/plugin-sdk/channel-contract").ChannelOutboundAdapter;
    probeMatrix: typeof probeMatrix;
    resolveMatrixAuth: typeof resolveMatrixAuth;
    resolveMatrixTargets: typeof resolveMatrixTargets;
    sendMessageMatrix: typeof sendMessageMatrix;
};
