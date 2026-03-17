import { a as resolveOpenProviderRuntimeGroupPolicy, i as resolveDefaultGroupPolicy, r as resolveAllowlistProviderRuntimeGroupPolicy } from "./runtime-group-policy-KevvtwrL.js";
//#region src/plugin-sdk/allowlist-resolution.ts
function mapBasicAllowlistResolutionEntries(entries) {
	return entries.map((entry) => ({
		input: entry.input,
		resolved: entry.resolved,
		id: entry.id,
		name: entry.name,
		note: entry.note
	}));
}
async function mapAllowlistResolutionInputs(params) {
	const results = [];
	for (const input of params.inputs) results.push(await params.mapInput(input));
	return results;
}
//#endregion
//#region src/plugin-sdk/discord-send.ts
function buildDiscordSendOptions(input) {
	return {
		verbose: false,
		replyTo: input.replyToId ?? void 0,
		accountId: input.accountId ?? void 0,
		silent: input.silent ?? void 0
	};
}
function buildDiscordSendMediaOptions(input) {
	return {
		...buildDiscordSendOptions(input),
		mediaUrl: input.mediaUrl,
		mediaLocalRoots: input.mediaLocalRoots
	};
}
function tagDiscordChannelResult(result) {
	return {
		channel: "discord",
		...result
	};
}
//#endregion
//#region src/plugin-sdk/runtime-store.ts
function createPluginRuntimeStore(errorMessage) {
	let runtime = null;
	return {
		setRuntime(next) {
			runtime = next;
		},
		clearRuntime() {
			runtime = null;
		},
		tryGetRuntime() {
			return runtime;
		},
		getRuntime() {
			if (!runtime) throw new Error(errorMessage);
			return runtime;
		}
	};
}
//#endregion
//#region src/plugin-sdk/fetch-auth.ts
function isAuthFailureStatus(status) {
	return status === 401 || status === 403;
}
async function fetchWithBearerAuthScopeFallback(params) {
	const fetchFn = params.fetchFn ?? fetch;
	let parsedUrl;
	try {
		parsedUrl = new URL(params.url);
	} catch {
		throw new Error(`Invalid URL: ${params.url}`);
	}
	if (params.requireHttps === true && parsedUrl.protocol !== "https:") throw new Error(`URL must use HTTPS: ${params.url}`);
	const fetchOnce = (headers) => fetchFn(params.url, {
		...params.requestInit,
		...headers ? { headers } : {}
	});
	const firstAttempt = await fetchOnce();
	if (firstAttempt.ok) return firstAttempt;
	if (!params.tokenProvider) return firstAttempt;
	const shouldRetry = params.shouldRetry ?? ((response) => isAuthFailureStatus(response.status));
	if (!shouldRetry(firstAttempt)) return firstAttempt;
	if (params.shouldAttachAuth && !params.shouldAttachAuth(params.url)) return firstAttempt;
	for (const scope of params.scopes) try {
		const token = await params.tokenProvider.getAccessToken(scope);
		const authHeaders = new Headers(params.requestInit?.headers);
		authHeaders.set("Authorization", `Bearer ${token}`);
		const authAttempt = await fetchOnce(authHeaders);
		if (authAttempt.ok) return authAttempt;
		if (!shouldRetry(authAttempt)) continue;
	} catch {}
	return firstAttempt;
}
//#endregion
//#region src/channels/plugins/group-policy-warnings.ts
function buildOpenGroupPolicyWarning(params) {
	return `- ${params.surface}: groupPolicy="open" ${params.openBehavior}. ${params.remediation}.`;
}
function buildOpenGroupPolicyRestrictSendersWarning(params) {
	const mentionSuffix = params.mentionGated === false ? "" : " (mention-gated)";
	return buildOpenGroupPolicyWarning({
		surface: params.surface,
		openBehavior: `allows ${params.openScope} to trigger${mentionSuffix}`,
		remediation: `Set ${params.groupPolicyPath}="allowlist" + ${params.groupAllowFromPath} to restrict senders`
	});
}
function buildOpenGroupPolicyNoRouteAllowlistWarning(params) {
	const mentionSuffix = params.mentionGated === false ? "" : " (mention-gated)";
	return buildOpenGroupPolicyWarning({
		surface: params.surface,
		openBehavior: `with no ${params.routeAllowlistPath} allowlist; any ${params.routeScope} can add + ping${mentionSuffix}`,
		remediation: `Set ${params.groupPolicyPath}="allowlist" + ${params.groupAllowFromPath} or configure ${params.routeAllowlistPath}`
	});
}
function buildOpenGroupPolicyConfigureRouteAllowlistWarning(params) {
	const mentionSuffix = params.mentionGated === false ? "" : " (mention-gated)";
	return buildOpenGroupPolicyWarning({
		surface: params.surface,
		openBehavior: `allows ${params.openScope} to trigger${mentionSuffix}`,
		remediation: `Set ${params.groupPolicyPath}="allowlist" and configure ${params.routeAllowlistPath}`
	});
}
function collectOpenGroupPolicyRestrictSendersWarnings(params) {
	if (params.groupPolicy !== "open") return [];
	return [buildOpenGroupPolicyRestrictSendersWarning(params)];
}
function collectAllowlistProviderRestrictSendersWarnings(params) {
	return collectAllowlistProviderGroupPolicyWarnings({
		cfg: params.cfg,
		providerConfigPresent: params.providerConfigPresent,
		configuredGroupPolicy: params.configuredGroupPolicy,
		collect: (groupPolicy) => collectOpenGroupPolicyRestrictSendersWarnings({
			groupPolicy,
			surface: params.surface,
			openScope: params.openScope,
			groupPolicyPath: params.groupPolicyPath,
			groupAllowFromPath: params.groupAllowFromPath,
			mentionGated: params.mentionGated
		})
	});
}
function collectAllowlistProviderGroupPolicyWarnings(params) {
	const defaultGroupPolicy = resolveDefaultGroupPolicy(params.cfg);
	const { groupPolicy } = resolveAllowlistProviderRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.configuredGroupPolicy ?? void 0,
		defaultGroupPolicy
	});
	return params.collect(groupPolicy);
}
function collectOpenProviderGroupPolicyWarnings(params) {
	const defaultGroupPolicy = resolveDefaultGroupPolicy(params.cfg);
	const { groupPolicy } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.configuredGroupPolicy ?? void 0,
		defaultGroupPolicy
	});
	return params.collect(groupPolicy);
}
function collectOpenGroupPolicyRouteAllowlistWarnings(params) {
	if (params.groupPolicy !== "open") return [];
	if (params.routeAllowlistConfigured) return [buildOpenGroupPolicyRestrictSendersWarning(params.restrictSenders)];
	return [buildOpenGroupPolicyNoRouteAllowlistWarning(params.noRouteAllowlist)];
}
function collectOpenGroupPolicyConfiguredRouteWarnings(params) {
	if (params.groupPolicy !== "open") return [];
	if (params.routeAllowlistConfigured) return [buildOpenGroupPolicyConfigureRouteAllowlistWarning(params.configureRouteAllowlist)];
	return [buildOpenGroupPolicyWarning(params.missingRouteAllowlist)];
}
//#endregion
export { mapBasicAllowlistResolutionEntries as _, collectAllowlistProviderGroupPolicyWarnings as a, collectOpenGroupPolicyRestrictSendersWarnings as c, fetchWithBearerAuthScopeFallback as d, createPluginRuntimeStore as f, mapAllowlistResolutionInputs as g, tagDiscordChannelResult as h, buildOpenGroupPolicyWarning as i, collectOpenGroupPolicyRouteAllowlistWarnings as l, buildDiscordSendOptions as m, buildOpenGroupPolicyNoRouteAllowlistWarning as n, collectAllowlistProviderRestrictSendersWarnings as o, buildDiscordSendMediaOptions as p, buildOpenGroupPolicyRestrictSendersWarning as r, collectOpenGroupPolicyConfiguredRouteWarnings as s, buildOpenGroupPolicyConfigureRouteAllowlistWarning as t, collectOpenProviderGroupPolicyWarnings as u };
