import type { GatewayAuthConfig } from "../config/types.gateway.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { type SupportedGatewaySecretInputPath } from "./secret-input-paths.js";
export type GatewayAuthSecretInputPath = Extract<SupportedGatewaySecretInputPath, "gateway.auth.token" | "gateway.auth.password">;
export type GatewayAuthSecretRefResolutionParams = {
    cfg: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    mode?: GatewayAuthConfig["mode"];
    hasPasswordCandidate: boolean;
    hasTokenCandidate: boolean;
};
export declare function hasConfiguredGatewayAuthSecretInput(cfg: OpenClawConfig, path: GatewayAuthSecretInputPath): boolean;
export declare function shouldResolveGatewayAuthSecretRef(params: {
    mode?: GatewayAuthConfig["mode"];
    path: GatewayAuthSecretInputPath;
    hasPasswordCandidate: boolean;
    hasTokenCandidate: boolean;
}): boolean;
export declare function shouldResolveGatewayTokenSecretRef(params: Omit<GatewayAuthSecretRefResolutionParams, "cfg" | "env">): boolean;
export declare function shouldResolveGatewayPasswordSecretRef(params: Omit<GatewayAuthSecretRefResolutionParams, "cfg" | "env">): boolean;
export declare function resolveGatewayAuthSecretRefValue(params: {
    cfg: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    path: GatewayAuthSecretInputPath;
    shouldResolve: boolean;
}): Promise<string | undefined>;
export declare function resolveGatewayTokenSecretRefValue(params: GatewayAuthSecretRefResolutionParams): Promise<string | undefined>;
export declare function resolveGatewayPasswordSecretRefValue(params: GatewayAuthSecretRefResolutionParams): Promise<string | undefined>;
export declare function resolveGatewayAuthSecretRef(params: {
    cfg: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    path: GatewayAuthSecretInputPath;
    shouldResolve: boolean;
}): Promise<OpenClawConfig>;
export declare function resolveGatewayPasswordSecretRef(params: {
    cfg: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    mode?: GatewayAuthConfig["mode"];
    hasPasswordCandidate: boolean;
    hasTokenCandidate: boolean;
}): Promise<OpenClawConfig>;
export declare function materializeGatewayAuthSecretRefs(params: GatewayAuthSecretRefResolutionParams): Promise<OpenClawConfig>;
