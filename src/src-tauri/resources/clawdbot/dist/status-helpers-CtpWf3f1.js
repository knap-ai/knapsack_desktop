import "./shared-CJJtMTbb.js";
//#region src/plugin-sdk/status-helpers.ts
/** Create the baseline runtime snapshot shape used by channel/account status stores. */
function createDefaultChannelRuntimeState(accountId, extra) {
	return {
		accountId,
		running: false,
		lastStartAt: null,
		lastStopAt: null,
		lastError: null,
		...extra ?? {}
	};
}
/** Normalize a channel-level status summary so missing lifecycle fields become explicit nulls. */
function buildBaseChannelStatusSummary(snapshot, extra) {
	return {
		configured: snapshot.configured ?? false,
		...extra ?? {},
		running: snapshot.running ?? false,
		lastStartAt: snapshot.lastStartAt ?? null,
		lastStopAt: snapshot.lastStopAt ?? null,
		lastError: snapshot.lastError ?? null
	};
}
/** Extend the base summary with probe fields while preserving stable null defaults. */
function buildProbeChannelStatusSummary(snapshot, extra) {
	return {
		...buildBaseChannelStatusSummary(snapshot, extra),
		probe: snapshot.probe,
		lastProbeAt: snapshot.lastProbeAt ?? null
	};
}
/** Build webhook channel summaries with a stable default mode. */
function buildWebhookChannelStatusSummary(snapshot, extra) {
	return buildBaseChannelStatusSummary(snapshot, {
		mode: snapshot.mode ?? "webhook",
		...extra ?? {}
	});
}
/** Build the standard per-account status payload from config metadata plus runtime state. */
function buildBaseAccountStatusSnapshot(params, extra) {
	const { account, runtime, probe } = params;
	return {
		accountId: account.accountId,
		name: account.name,
		enabled: account.enabled,
		configured: account.configured,
		...buildRuntimeAccountStatusSnapshot({
			runtime,
			probe
		}),
		lastInboundAt: runtime?.lastInboundAt ?? null,
		lastOutboundAt: runtime?.lastOutboundAt ?? null,
		...extra ?? {}
	};
}
/** Convenience wrapper when the caller already has flattened account fields instead of an account object. */
function buildComputedAccountStatusSnapshot(params, extra) {
	const { accountId, name, enabled, configured, runtime, probe } = params;
	return buildBaseAccountStatusSnapshot({
		account: {
			accountId,
			name,
			enabled,
			configured
		},
		runtime,
		probe
	}, extra);
}
/** Build a full status adapter when only configured/extras vary per account. */
function createComputedAccountStatusAdapter(options) {
	return {
		defaultRuntime: options.defaultRuntime,
		buildChannelSummary: options.buildChannelSummary,
		probeAccount: options.probeAccount,
		formatCapabilitiesProbe: options.formatCapabilitiesProbe,
		auditAccount: options.auditAccount,
		buildCapabilitiesDiagnostics: options.buildCapabilitiesDiagnostics,
		logSelfId: options.logSelfId,
		resolveAccountState: options.resolveAccountState,
		collectStatusIssues: options.collectStatusIssues,
		buildAccountSnapshot: (params) => {
			const typedParams = params;
			const { extra, ...snapshot } = options.resolveAccountSnapshot(typedParams);
			return buildComputedAccountStatusSnapshot({
				...snapshot,
				runtime: typedParams.runtime,
				probe: typedParams.probe
			}, extra);
		}
	};
}
/** Async variant for channels that compute configured state or snapshot extras from I/O. */
function createAsyncComputedAccountStatusAdapter(options) {
	return {
		defaultRuntime: options.defaultRuntime,
		buildChannelSummary: options.buildChannelSummary,
		probeAccount: options.probeAccount,
		formatCapabilitiesProbe: options.formatCapabilitiesProbe,
		auditAccount: options.auditAccount,
		buildCapabilitiesDiagnostics: options.buildCapabilitiesDiagnostics,
		logSelfId: options.logSelfId,
		resolveAccountState: options.resolveAccountState,
		collectStatusIssues: options.collectStatusIssues,
		buildAccountSnapshot: async (params) => {
			const typedParams = params;
			const { extra, ...snapshot } = await options.resolveAccountSnapshot(typedParams);
			return buildComputedAccountStatusSnapshot({
				...snapshot,
				runtime: typedParams.runtime,
				probe: typedParams.probe
			}, extra);
		}
	};
}
/** Normalize runtime-only account state into the shared status snapshot fields. */
function buildRuntimeAccountStatusSnapshot(params, extra) {
	const { runtime, probe } = params;
	return {
		running: runtime?.running ?? false,
		lastStartAt: runtime?.lastStartAt ?? null,
		lastStopAt: runtime?.lastStopAt ?? null,
		lastError: runtime?.lastError ?? null,
		probe,
		...extra ?? {}
	};
}
/** Build token-based channel status summaries with optional mode reporting. */
function buildTokenChannelStatusSummary(snapshot, opts) {
	const base = {
		...buildBaseChannelStatusSummary(snapshot),
		tokenSource: snapshot.tokenSource ?? "none",
		probe: snapshot.probe,
		lastProbeAt: snapshot.lastProbeAt ?? null
	};
	if (opts?.includeMode === false) return base;
	return {
		...base,
		mode: snapshot.mode ?? null
	};
}
/** Build a config-issue collector from snapshot-safe source metadata only. */
function createDependentCredentialStatusIssueCollector(options) {
	const isDependencyConfigured = options.isDependencyConfigured ?? ((value) => typeof value === "string" && value.trim().length > 0 && value !== "none");
	return (accounts) => accounts.flatMap((account) => {
		if (account.configured !== false) return [];
		return [{
			channel: options.channel,
			accountId: account.accountId ?? "",
			kind: "config",
			message: isDependencyConfigured(account[options.dependencySourceKey]) ? options.missingDependentMessage : options.missingPrimaryMessage
		}];
	});
}
/** Convert account runtime errors into the generic channel status issue format. */
function collectStatusIssuesFromLastError(channel, accounts) {
	return accounts.flatMap((account) => {
		const lastError = typeof account.lastError === "string" ? account.lastError.trim() : "";
		if (!lastError) return [];
		return [{
			channel,
			accountId: account.accountId,
			kind: "runtime",
			message: `Channel error: ${lastError}`
		}];
	});
}
//#endregion
export { buildRuntimeAccountStatusSnapshot as a, collectStatusIssuesFromLastError as c, createDefaultChannelRuntimeState as d, createDependentCredentialStatusIssueCollector as f, buildProbeChannelStatusSummary as i, createAsyncComputedAccountStatusAdapter as l, buildBaseChannelStatusSummary as n, buildTokenChannelStatusSummary as o, buildComputedAccountStatusSnapshot as r, buildWebhookChannelStatusSummary as s, buildBaseAccountStatusSnapshot as t, createComputedAccountStatusAdapter as u };
