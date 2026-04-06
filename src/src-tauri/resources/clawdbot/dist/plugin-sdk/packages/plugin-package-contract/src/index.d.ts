export type JsonObject = Record<string, unknown>;
export type ExternalPluginCompatibility = {
    pluginApiRange?: string;
    builtWithOpenClawVersion?: string;
    pluginSdkVersion?: string;
    minGatewayVersion?: string;
};
export type ExternalPluginValidationIssue = {
    fieldPath: string;
    message: string;
};
export type ExternalCodePluginValidationResult = {
    compatibility?: ExternalPluginCompatibility;
    issues: ExternalPluginValidationIssue[];
};
export declare const EXTERNAL_CODE_PLUGIN_REQUIRED_FIELD_PATHS: readonly ["openclaw.compat.pluginApi", "openclaw.build.openclawVersion"];
export declare function normalizeExternalPluginCompatibility(packageJson: unknown): ExternalPluginCompatibility | undefined;
export declare function listMissingExternalCodePluginFieldPaths(packageJson: unknown): string[];
export declare function validateExternalCodePluginPackageJson(packageJson: unknown): ExternalCodePluginValidationResult;
