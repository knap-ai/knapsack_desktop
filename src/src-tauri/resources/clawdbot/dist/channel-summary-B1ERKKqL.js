import { r as theme } from "./theme-D5sxSdHD.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import "./account-id-j7GeQlaZ.js";
import { r as listChannelPlugins } from "./registry-Delpa74L.js";
import "./config-Q9XZc_2I.js";
import "./plugins-D4ODSIPT.js";
import { n as formatTimeAgo } from "./format-relative-BErnCbgi.js";
import { t as inspectReadOnlyChannelAccount } from "./read-only-account-inspect-BiLlFb9q.js";
import { n as hasResolvedCredentialValue, t as hasConfiguredUnavailableCredentialStatus } from "./account-snapshot-fields-DXlFJrtW.js";
import { i as resolveChannelAccountEnabled, n as formatChannelAllowFrom, r as resolveChannelAccountConfigured, t as buildChannelAccountSnapshot } from "./account-summary-BQJhTf0A.js";
//#region src/infra/channel-summary.ts
const DEFAULT_OPTIONS = {
	colorize: false,
	includeAllowFrom: false
};
const formatAccountLabel = (params) => {
	const base = params.accountId || "default";
	if (params.name?.trim()) return `${base} (${params.name.trim()})`;
	return base;
};
const accountLine = (label, details) => `  - ${label}${details.length ? ` (${details.join(", ")})` : ""}`;
const buildAccountDetails = (params) => {
	const details = [];
	const snapshot = params.entry.snapshot;
	if (snapshot.enabled === false) details.push("disabled");
	if (snapshot.dmPolicy) details.push(`dm:${snapshot.dmPolicy}`);
	if (snapshot.tokenSource && snapshot.tokenSource !== "none") details.push(`token:${snapshot.tokenSource}`);
	if (snapshot.botTokenSource && snapshot.botTokenSource !== "none") details.push(`bot:${snapshot.botTokenSource}`);
	if (snapshot.appTokenSource && snapshot.appTokenSource !== "none") details.push(`app:${snapshot.appTokenSource}`);
	if (snapshot.signingSecretSource && snapshot.signingSecretSource !== "none") details.push(`signing:${snapshot.signingSecretSource}`);
	if (hasConfiguredUnavailableCredentialStatus(params.entry.account)) details.push("secret unavailable in this command path");
	if (snapshot.baseUrl) details.push(snapshot.baseUrl);
	if (snapshot.port != null) details.push(`port:${snapshot.port}`);
	if (snapshot.cliPath) details.push(`cli:${snapshot.cliPath}`);
	if (snapshot.dbPath) details.push(`db:${snapshot.dbPath}`);
	if (params.includeAllowFrom && snapshot.allowFrom?.length) {
		const formatted = formatChannelAllowFrom({
			plugin: params.plugin,
			cfg: params.cfg,
			accountId: snapshot.accountId,
			allowFrom: snapshot.allowFrom
		}).slice(0, 2);
		if (formatted.length > 0) details.push(`allow:${formatted.join(",")}`);
	}
	return details;
};
async function inspectChannelAccount(plugin, cfg, accountId) {
	return plugin.config.inspectAccount?.(cfg, accountId) ?? await inspectReadOnlyChannelAccount({
		channelId: plugin.id,
		cfg,
		accountId
	});
}
async function buildChannelSummary(cfg, options) {
	const effective = cfg ?? loadConfig();
	const lines = [];
	const resolved = {
		...DEFAULT_OPTIONS,
		...options
	};
	const tint = (value, color) => resolved.colorize && color ? color(value) : value;
	const sourceConfig = options?.sourceConfig ?? effective;
	for (const plugin of listChannelPlugins()) {
		const accountIds = plugin.config.listAccountIds(effective);
		const defaultAccountId = plugin.config.defaultAccountId?.(effective) ?? accountIds[0] ?? "default";
		const resolvedAccountIds = accountIds.length > 0 ? accountIds : [defaultAccountId];
		const entries = [];
		for (const accountId of resolvedAccountIds) {
			const sourceInspectedAccount = await inspectChannelAccount(plugin, sourceConfig, accountId);
			const resolvedInspectedAccount = await inspectChannelAccount(plugin, effective, accountId);
			const resolvedInspection = resolvedInspectedAccount;
			const sourceInspection = sourceInspectedAccount;
			const resolvedAccount = resolvedInspectedAccount ?? plugin.config.resolveAccount(effective, accountId);
			const useSourceUnavailableAccount = Boolean(sourceInspectedAccount && hasConfiguredUnavailableCredentialStatus(sourceInspectedAccount) && (!hasResolvedCredentialValue(resolvedAccount) || sourceInspection?.configured === true && resolvedInspection?.configured === false));
			const account = useSourceUnavailableAccount ? sourceInspectedAccount : resolvedAccount;
			const selectedInspection = useSourceUnavailableAccount ? sourceInspection : resolvedInspection;
			const enabled = selectedInspection?.enabled ?? resolveChannelAccountEnabled({
				plugin,
				account,
				cfg: effective
			});
			const configured = selectedInspection?.configured ?? await resolveChannelAccountConfigured({
				plugin,
				account,
				cfg: effective,
				readAccountConfiguredField: true
			});
			const snapshot = buildChannelAccountSnapshot({
				plugin,
				account,
				cfg: effective,
				accountId,
				enabled,
				configured
			});
			entries.push({
				accountId,
				account,
				enabled,
				configured,
				snapshot
			});
		}
		const configuredEntries = entries.filter((entry) => entry.configured);
		const anyEnabled = entries.some((entry) => entry.enabled);
		const fallbackEntry = entries.find((entry) => entry.accountId === defaultAccountId) ?? entries[0];
		const summaryRecord = plugin.status?.buildChannelSummary ? await plugin.status.buildChannelSummary({
			account: fallbackEntry?.account ?? {},
			cfg: effective,
			defaultAccountId,
			snapshot: fallbackEntry?.snapshot ?? { accountId: defaultAccountId }
		}) : void 0;
		const linked = summaryRecord && typeof summaryRecord.linked === "boolean" ? summaryRecord.linked : null;
		const configured = summaryRecord && typeof summaryRecord.configured === "boolean" ? summaryRecord.configured : configuredEntries.length > 0;
		const status = !anyEnabled ? "disabled" : linked !== null ? linked ? "linked" : "not linked" : configured ? "configured" : "not configured";
		const statusColor = status === "linked" || status === "configured" ? theme.success : status === "not linked" ? theme.error : theme.muted;
		let line = `${plugin.meta.label ?? plugin.id}: ${status}`;
		const authAgeMs = summaryRecord && typeof summaryRecord.authAgeMs === "number" ? summaryRecord.authAgeMs : null;
		const self = summaryRecord?.self;
		if (self?.e164) line += ` ${self.e164}`;
		if (authAgeMs != null && authAgeMs >= 0) line += ` auth ${formatTimeAgo(authAgeMs)}`;
		lines.push(tint(line, statusColor));
		if (configuredEntries.length > 0) for (const entry of configuredEntries) {
			const details = buildAccountDetails({
				entry,
				plugin,
				cfg: effective,
				includeAllowFrom: resolved.includeAllowFrom
			});
			lines.push(accountLine(formatAccountLabel({
				accountId: entry.accountId,
				name: entry.snapshot.name
			}), details));
		}
	}
	return lines;
}
//#endregion
export { buildChannelSummary as t };
