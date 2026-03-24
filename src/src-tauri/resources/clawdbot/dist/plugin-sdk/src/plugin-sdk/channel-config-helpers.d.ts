import { authorizeConfigWrite, canBypassConfigWritePolicy, formatConfigWriteDeniedMessage, resolveChannelConfigWrites, type ConfigWriteAuthorizationResult, type ConfigWriteScope, type ConfigWriteTarget } from "../channels/plugins/config-writes.js";
import { collectAllowlistProviderGroupPolicyWarnings, collectAllowlistProviderRestrictSendersWarnings, collectOpenGroupPolicyConfiguredRouteWarnings, collectOpenGroupPolicyRouteAllowlistWarnings, collectOpenProviderGroupPolicyWarnings } from "../channels/plugins/group-policy-warnings.js";
import { buildAccountScopedDmSecurityPolicy } from "../channels/plugins/helpers.js";
import type { ChannelConfigAdapter } from "../channels/plugins/types.adapters.js";
import type { OpenClawConfig } from "../config/config.js";
export { authorizeConfigWrite, canBypassConfigWritePolicy, formatConfigWriteDeniedMessage, resolveChannelConfigWrites, };
export type { ConfigWriteAuthorizationResult, ConfigWriteScope, ConfigWriteTarget };
/** Coerce mixed allowlist config values into plain strings without trimming or deduping. */
export declare function mapAllowFromEntries(allowFrom: Array<string | number> | null | undefined): string[];
/** Normalize user-facing allowlist entries the same way config and doctor flows expect. */
export declare function formatTrimmedAllowFromEntries(allowFrom: Array<string | number>): string[];
/** Collapse nullable config scalars into a trimmed optional string. */
export declare function resolveOptionalConfigString(value: string | number | null | undefined): string | undefined;
/** Adapt `{ cfg, accountId }` accessors to callback sites that pass positional args. */
export declare function adaptScopedAccountAccessor<Result, Config extends OpenClawConfig = OpenClawConfig>(accessor: (params: {
    cfg: Config;
    accountId?: string | null;
}) => Result): (cfg: Config, accountId?: string | null) => Result;
/** Build the shared allowlist/default target adapter surface for account-scoped channel configs. */
export declare function createScopedAccountConfigAccessors<ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    resolveAccount: (params: {
        cfg: Config;
        accountId?: string | null;
    }) => ResolvedAccount;
    resolveAllowFrom: (account: ResolvedAccount) => Array<string | number> | null | undefined;
    formatAllowFrom: (allowFrom: Array<string | number>) => string[];
    resolveDefaultTo?: (account: ResolvedAccount) => string | number | null | undefined;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "resolveAllowFrom" | "formatAllowFrom" | "resolveDefaultTo">;
/** Build the common CRUD/config helpers for channels that store multiple named accounts. */
export declare function createScopedChannelConfigBase<ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    listAccountIds: (cfg: Config) => string[];
    resolveAccount: (cfg: Config, accountId?: string | null) => ResolvedAccount;
    defaultAccountId: (cfg: Config) => string;
    inspectAccount?: (cfg: Config, accountId?: string | null) => unknown;
    clearBaseFields: string[];
    allowTopLevel?: boolean;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount">;
/** Build the full shared config adapter for account-scoped channels with allowlist/default target accessors. */
export declare function createScopedChannelConfigAdapter<ResolvedAccount, AccessorAccount = ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    listAccountIds: (cfg: Config) => string[];
    resolveAccount: (cfg: Config, accountId?: string | null) => ResolvedAccount;
    resolveAccessorAccount?: (params: {
        cfg: Config;
        accountId?: string | null;
    }) => AccessorAccount;
    defaultAccountId: (cfg: Config) => string;
    inspectAccount?: (cfg: Config, accountId?: string | null) => unknown;
    clearBaseFields: string[];
    allowTopLevel?: boolean;
    resolveAllowFrom: (account: AccessorAccount) => Array<string | number> | null | undefined;
    formatAllowFrom: (allowFrom: Array<string | number>) => string[];
    resolveDefaultTo?: (account: AccessorAccount) => string | number | null | undefined;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount" | "resolveAllowFrom" | "formatAllowFrom" | "resolveDefaultTo">;
/** Build CRUD/config helpers for top-level single-account channels. */
export declare function createTopLevelChannelConfigBase<ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    resolveAccount: (cfg: Config) => ResolvedAccount;
    listAccountIds?: (cfg: Config) => string[];
    defaultAccountId?: (cfg: Config) => string;
    inspectAccount?: (cfg: Config) => unknown;
    deleteMode?: "remove-section" | "clear-fields";
    clearBaseFields?: string[];
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount">;
/** Build the full shared config adapter for top-level single-account channels with allowlist/default target accessors. */
export declare function createTopLevelChannelConfigAdapter<ResolvedAccount, AccessorAccount = ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    resolveAccount: (cfg: Config) => ResolvedAccount;
    resolveAccessorAccount?: (params: {
        cfg: Config;
        accountId?: string | null;
    }) => AccessorAccount;
    listAccountIds?: (cfg: Config) => string[];
    defaultAccountId?: (cfg: Config) => string;
    inspectAccount?: (cfg: Config) => unknown;
    deleteMode?: "remove-section" | "clear-fields";
    clearBaseFields?: string[];
    resolveAllowFrom: (account: AccessorAccount) => Array<string | number> | null | undefined;
    formatAllowFrom: (allowFrom: Array<string | number>) => string[];
    resolveDefaultTo?: (account: AccessorAccount) => string | number | null | undefined;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount" | "resolveAllowFrom" | "formatAllowFrom" | "resolveDefaultTo">;
/** Build CRUD/config helpers for channels where the default account lives at channel root and named accounts live under `accounts`. */
export declare function createHybridChannelConfigBase<ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    listAccountIds: (cfg: Config) => string[];
    resolveAccount: (cfg: Config, accountId?: string | null) => ResolvedAccount;
    defaultAccountId: (cfg: Config) => string;
    inspectAccount?: (cfg: Config, accountId?: string | null) => unknown;
    clearBaseFields: string[];
    preserveSectionOnDefaultDelete?: boolean;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount">;
/** Build the full shared config adapter for hybrid channels with allowlist/default target accessors. */
export declare function createHybridChannelConfigAdapter<ResolvedAccount, AccessorAccount = ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    listAccountIds: (cfg: Config) => string[];
    resolveAccount: (cfg: Config, accountId?: string | null) => ResolvedAccount;
    resolveAccessorAccount?: (params: {
        cfg: Config;
        accountId?: string | null;
    }) => AccessorAccount;
    defaultAccountId: (cfg: Config) => string;
    inspectAccount?: (cfg: Config, accountId?: string | null) => unknown;
    clearBaseFields: string[];
    preserveSectionOnDefaultDelete?: boolean;
    resolveAllowFrom: (account: AccessorAccount) => Array<string | number> | null | undefined;
    formatAllowFrom: (allowFrom: Array<string | number>) => string[];
    resolveDefaultTo?: (account: AccessorAccount) => string | number | null | undefined;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount" | "resolveAllowFrom" | "formatAllowFrom" | "resolveDefaultTo">;
/** Convert account-specific DM security fields into the shared runtime policy resolver shape. */
export declare function createScopedDmSecurityResolver<ResolvedAccount extends {
    accountId?: string | null;
}>(params: {
    channelKey: string;
    resolvePolicy: (account: ResolvedAccount) => string | null | undefined;
    resolveAllowFrom: (account: ResolvedAccount) => Array<string | number> | null | undefined;
    resolveFallbackAccountId?: (account: ResolvedAccount) => string | null | undefined;
    defaultPolicy?: string;
    allowFromPathSuffix?: string;
    policyPathSuffix?: string;
    approveChannelId?: string;
    approveHint?: string;
    normalizeEntry?: (raw: string) => string;
}): ({ cfg, accountId, account, }: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    account: ResolvedAccount;
}) => import("./channel-runtime.ts").ChannelSecurityDmPolicy;
export { buildAccountScopedDmSecurityPolicy };
export { collectAllowlistProviderGroupPolicyWarnings, collectAllowlistProviderRestrictSendersWarnings, collectOpenGroupPolicyConfiguredRouteWarnings, collectOpenGroupPolicyRouteAllowlistWarnings, collectOpenProviderGroupPolicyWarnings, };
/** Read the effective WhatsApp allowlist through the active plugin contract. */
export declare function resolveWhatsAppConfigAllowFrom(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
/** Format WhatsApp allowlist entries with the same normalization used by the channel plugin. */
export declare function formatWhatsAppConfigAllowFromEntries(allowFrom: Array<string | number>): string[];
/** Resolve the effective WhatsApp default recipient after account and root config fallback. */
export declare function resolveWhatsAppConfigDefaultTo(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string | undefined;
/** Read iMessage allowlist entries from the active plugin's resolved account view. */
export declare function resolveIMessageConfigAllowFrom(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
/** Resolve the effective iMessage default recipient from the plugin-resolved account config. */
export declare function resolveIMessageConfigDefaultTo(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string | undefined;
