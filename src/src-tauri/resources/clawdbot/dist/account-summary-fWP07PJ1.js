import { r as normalizeStringEntries } from "./string-normalization-CohoSMRS.js";
import { i as projectSafeChannelAccountSnapshotFields } from "./account-snapshot-fields-QM0tdgga.js";
//#region src/channels/account-summary.ts
function buildChannelAccountSnapshot(params) {
	const described = params.plugin.config.describeAccount?.(params.account, params.cfg);
	return {
		enabled: params.enabled,
		configured: params.configured,
		...projectSafeChannelAccountSnapshotFields(params.account),
		...described,
		accountId: params.accountId
	};
}
function formatChannelAllowFrom(params) {
	if (params.plugin.config.formatAllowFrom) return params.plugin.config.formatAllowFrom({
		cfg: params.cfg,
		accountId: params.accountId,
		allowFrom: params.allowFrom
	});
	return normalizeStringEntries(params.allowFrom);
}
function asRecord(value) {
	if (!value || typeof value !== "object") return;
	return value;
}
function resolveChannelAccountEnabled(params) {
	if (params.plugin.config.isEnabled) return params.plugin.config.isEnabled(params.account, params.cfg);
	return asRecord(params.account)?.enabled !== false;
}
async function resolveChannelAccountConfigured(params) {
	if (params.plugin.config.isConfigured) return await params.plugin.config.isConfigured(params.account, params.cfg);
	if (params.readAccountConfiguredField) return asRecord(params.account)?.configured !== false;
	return true;
}
//#endregion
export { resolveChannelAccountEnabled as i, formatChannelAllowFrom as n, resolveChannelAccountConfigured as r, buildChannelAccountSnapshot as t };
