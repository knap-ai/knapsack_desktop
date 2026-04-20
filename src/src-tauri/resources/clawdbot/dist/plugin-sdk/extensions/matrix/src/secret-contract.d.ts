import { type ResolverContext, type SecretDefaults } from "openclaw/plugin-sdk/channel-secret-basic-runtime";
export declare const secretTargetRegistryEntries: {
    id: string;
    targetType: string;
    configFile: "openclaw.json";
    pathPattern: string;
    secretShape: "secret_input";
    expectedResolvedValue: "string";
    includeInPlan: true;
    includeInConfigure: true;
    includeInAudit: true;
}[];
export declare function collectRuntimeConfigAssignments(params: {
    config: {
        channels?: Record<string, unknown>;
    };
    defaults?: SecretDefaults;
    context: ResolverContext;
}): void;
export declare const channelSecrets: {
    secretTargetRegistryEntries: {
        id: string;
        targetType: string;
        configFile: "openclaw.json";
        pathPattern: string;
        secretShape: "secret_input";
        expectedResolvedValue: "string";
        includeInPlan: true;
        includeInConfigure: true;
        includeInAudit: true;
    }[];
    collectRuntimeConfigAssignments: typeof collectRuntimeConfigAssignments;
};
