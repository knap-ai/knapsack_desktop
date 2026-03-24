import type { OpenClawConfig } from "../../config/config.js";
import type { CliBackendConfig } from "../../config/types.js";
type PreparedCliBundleMcpConfig = {
    backend: CliBackendConfig;
    cleanup?: () => Promise<void>;
};
export declare function prepareCliBundleMcpConfig(params: {
    backendId: string;
    backend: CliBackendConfig;
    workspaceDir: string;
    config?: OpenClawConfig;
    warn?: (message: string) => void;
}): Promise<PreparedCliBundleMcpConfig>;
export {};
