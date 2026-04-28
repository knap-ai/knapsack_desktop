import type { MigrationDetection, MigrationItem, MigrationPlan, MigrationProviderContext, MigrationProviderPlugin, MigrationSummary } from "../plugins/types.js";
export type { MigrationDetection, MigrationItem, MigrationPlan, MigrationProviderContext, MigrationProviderPlugin, MigrationSummary, };
export declare const MIGRATION_REASON_MISSING_SOURCE_OR_TARGET = "missing source or target";
export declare const MIGRATION_REASON_TARGET_EXISTS = "target exists";
export declare function createMigrationItem(params: Omit<MigrationItem, "status"> & {
    status?: MigrationItem["status"];
}): MigrationItem;
export declare function markMigrationItemConflict(item: MigrationItem, reason: string): MigrationItem;
export declare function markMigrationItemError(item: MigrationItem, reason: string): MigrationItem;
export declare function markMigrationItemSkipped(item: MigrationItem, reason: string): MigrationItem;
export declare function summarizeMigrationItems(items: readonly MigrationItem[]): MigrationSummary;
export declare function redactMigrationValue(value: unknown): unknown;
export declare function redactMigrationItem(item: MigrationItem): MigrationItem;
export declare function redactMigrationPlan<T extends MigrationPlan>(plan: T): T;
