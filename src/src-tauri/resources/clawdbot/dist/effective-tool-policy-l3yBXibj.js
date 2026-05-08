import { c as mergeAlsoAllowPolicy, m as resolveToolProfilePolicy, n as applyOwnerOnlyToolPolicy } from "./tool-policy-CC72sL8W.js";
import { n as getPluginToolMeta } from "./tools-DHEGJXyc.js";
import { i as resolveSubagentCapabilityStore, t as isSubagentEnvelopeSession } from "./subagent-capabilities-CBMAugMB.js";
import { a as resolveSubagentToolPolicyForSession, i as resolveGroupToolPolicy, n as resolveEffectiveToolPolicy, r as resolveGroupContextFromSessionKey } from "./pi-tools.policy-CndtGqzr.js";
import { n as buildDefaultToolPolicyPipelineSteps, t as applyToolPolicyPipeline } from "./tool-policy-pipeline-ChGQVHbp.js";
//#region src/agents/pi-embedded-runner/effective-tool-policy.ts
function resolveTrustedGroupId(params) {
	const callerGroupId = (params.groupId ?? "").trim();
	if (!callerGroupId) return {
		groupId: params.groupId,
		dropped: false
	};
	const sessionGroupIds = resolveGroupContextFromSessionKey(params.sessionKey).groupIds ?? [];
	const spawnedGroupIds = resolveGroupContextFromSessionKey(params.spawnedBy).groupIds ?? [];
	const trusted = [...sessionGroupIds, ...spawnedGroupIds];
	if (trusted.length === 0) return {
		groupId: null,
		dropped: true
	};
	if (trusted.includes(callerGroupId)) return {
		groupId: params.groupId,
		dropped: false
	};
	return {
		groupId: null,
		dropped: true
	};
}
function applyFinalEffectiveToolPolicy(params) {
	if (params.bundledTools.length === 0) return params.bundledTools;
	const trustedGroup = resolveTrustedGroupId(params);
	if (trustedGroup.dropped) params.warn("effective tool policy: dropping caller-provided groupId that does not match session-derived group context");
	const { agentId, globalPolicy, globalProviderPolicy, agentPolicy, agentProviderPolicy, profile, providerProfile, profileAlsoAllow, providerProfileAlsoAllow } = resolveEffectiveToolPolicy({
		config: params.config,
		sessionKey: params.sessionKey,
		agentId: params.agentId,
		modelProvider: params.modelProvider,
		modelId: params.modelId
	});
	const groupPolicy = resolveGroupToolPolicy({
		config: params.config,
		sessionKey: params.sessionKey,
		spawnedBy: params.spawnedBy,
		messageProvider: params.messageProvider,
		groupId: trustedGroup.groupId,
		groupChannel: trustedGroup.dropped ? null : params.groupChannel,
		groupSpace: trustedGroup.dropped ? null : params.groupSpace,
		accountId: params.agentAccountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	const profilePolicy = resolveToolProfilePolicy(profile);
	const providerProfilePolicy = resolveToolProfilePolicy(providerProfile);
	const profilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(profilePolicy, profileAlsoAllow);
	const providerProfilePolicyWithAlsoAllow = mergeAlsoAllowPolicy(providerProfilePolicy, providerProfileAlsoAllow);
	const subagentStore = resolveSubagentCapabilityStore(params.sessionKey, { cfg: params.config });
	const subagentPolicy = params.sessionKey && isSubagentEnvelopeSession(params.sessionKey, {
		cfg: params.config,
		store: subagentStore
	}) ? resolveSubagentToolPolicyForSession(params.config, params.sessionKey, { store: subagentStore }) : void 0;
	const ownerFiltered = applyOwnerOnlyToolPolicy(params.bundledTools, params.senderIsOwner === true);
	const pipelineSteps = [
		...buildDefaultToolPolicyPipelineSteps({
			profilePolicy: profilePolicyWithAlsoAllow,
			profile,
			profileUnavailableCoreWarningAllowlist: profilePolicy?.allow,
			providerProfilePolicy: providerProfilePolicyWithAlsoAllow,
			providerProfile,
			providerProfileUnavailableCoreWarningAllowlist: providerProfilePolicy?.allow,
			globalPolicy,
			globalProviderPolicy,
			agentPolicy,
			agentProviderPolicy,
			groupPolicy,
			agentId
		}),
		{
			policy: params.sandboxToolPolicy,
			label: "sandbox tools.allow"
		},
		{
			policy: subagentPolicy,
			label: "subagent tools.allow"
		}
	].map((step) => Object.assign({}, step, { suppressUnavailableCoreToolWarning: true }));
	return applyToolPolicyPipeline({
		tools: ownerFiltered,
		toolMeta: (tool) => getPluginToolMeta(tool),
		warn: params.warn,
		steps: pipelineSteps
	});
}
//#endregion
export { applyFinalEffectiveToolPolicy as t };
