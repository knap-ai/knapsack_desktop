import { type ChannelDoctorAdapter } from "openclaw/plugin-sdk/channel-contract";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { detectLegacyMatrixCrypto, detectLegacyMatrixState } from "./matrix-migration.runtime.js";
export declare function formatMatrixLegacyStatePreview(detection: Exclude<ReturnType<typeof detectLegacyMatrixState>, null | {
    warning: string;
}>): string;
export declare function formatMatrixLegacyCryptoPreview(detection: ReturnType<typeof detectLegacyMatrixCrypto>): string[];
export declare function collectMatrixInstallPathWarnings(cfg: OpenClawConfig): Promise<string[]>;
export declare function cleanStaleMatrixPluginConfig(cfg: OpenClawConfig): Promise<{
    config: OpenClawConfig;
    changes: string[];
}>;
export declare function applyMatrixDoctorRepair(params: {
    cfg: OpenClawConfig;
    env: NodeJS.ProcessEnv;
}): Promise<{
    changes: string[];
    warnings: string[];
}>;
export declare function runMatrixDoctorSequence(params: {
    cfg: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    shouldRepair: boolean;
}): Promise<{
    changeNotes: string[];
    warningNotes: string[];
}>;
export declare const matrixDoctor: ChannelDoctorAdapter;
