import { u as createScopedDmSecurityResolver } from "./channel-config-helpers-B0S2z66F.js";
import { p as createAllowlistProviderRestrictSendersWarningCollector } from "./group-policy-warnings-B8ZU4B4D.js";
import "./dm-policy-shared-ikRqobo8.js";
//#region src/plugin-sdk/channel-policy.ts
/** Compose the common DM policy resolver with restrict-senders group warnings. */
function createRestrictSendersChannelSecurity(params) {
	return {
		resolveDmPolicy: createScopedDmSecurityResolver({
			channelKey: params.channelKey,
			resolvePolicy: params.resolveDmPolicy,
			resolveAllowFrom: params.resolveDmAllowFrom,
			resolveFallbackAccountId: params.resolveFallbackAccountId,
			defaultPolicy: params.defaultDmPolicy,
			allowFromPathSuffix: params.allowFromPathSuffix,
			policyPathSuffix: params.policyPathSuffix,
			approveChannelId: params.approveChannelId,
			approveHint: params.approveHint,
			normalizeEntry: params.normalizeDmEntry
		}),
		collectWarnings: createAllowlistProviderRestrictSendersWarningCollector({
			providerConfigPresent: params.providerConfigPresent ?? ((cfg) => cfg.channels?.[params.channelKey] !== void 0),
			resolveGroupPolicy: params.resolveGroupPolicy,
			surface: params.surface,
			openScope: params.openScope,
			groupPolicyPath: params.groupPolicyPath,
			groupAllowFromPath: params.groupAllowFromPath,
			mentionGated: params.mentionGated
		})
	};
}
//#endregion
export { createRestrictSendersChannelSecurity as t };
