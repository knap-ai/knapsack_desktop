import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { FlowContribution, FlowOption } from "./types.js";
export type ProviderFlowScope = "text-inference" | "image-generation";
export type ProviderSetupFlowOption = FlowOption & {
    onboardingScopes?: ProviderFlowScope[];
};
export type ProviderModelPickerFlowEntry = FlowOption;
export type ProviderSetupFlowContribution = FlowContribution & {
    kind: "provider";
    surface: "setup";
    providerId: string;
    pluginId?: string;
    option: ProviderSetupFlowOption;
    onboardingScopes?: ProviderFlowScope[];
    source: "manifest" | "install-catalog";
};
declare function includesProviderFlowScope(scopes: readonly ProviderFlowScope[] | undefined, scope: ProviderFlowScope): boolean;
export declare function resolveProviderSetupFlowContributions(params?: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    env?: NodeJS.ProcessEnv;
    scope?: ProviderFlowScope;
}): ProviderSetupFlowContribution[];
export { includesProviderFlowScope };
