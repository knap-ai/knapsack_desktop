import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { d as normalizeMessageChannel } from "./message-channel-D19EDm2g.js";
import "./exec-approvals-D6YTmZxM.js";
import { l as getExecApprovalReplyMetadata } from "./exec-approval-reply-B909d7mK.js";
import "./routing-Br1fEo8A.js";
import { r as resolveApprovalRequestOriginTarget } from "./exec-approval-session-target-C1KSzAWi.js";
import { a as matchesApprovalRequestFilters } from "./approval-renderers-0W2CFM48.js";
import "./approval-native-runtime-C3EqZgQD.js";
//#region src/plugin-sdk/approval-auth-helpers.ts
function defaultNormalizeSenderId$1(value) {
	return value.trim() || void 0;
}
function createResolvedApproverActionAuthAdapter(params) {
	const normalizeSenderId = params.normalizeSenderId ?? defaultNormalizeSenderId$1;
	return { authorizeActorAction({ cfg, accountId, senderId, approvalKind }) {
		const approvers = params.resolveApprovers({
			cfg,
			accountId
		});
		if (approvers.length === 0) return { authorized: true };
		const normalizedSenderId = senderId ? normalizeSenderId(senderId) : void 0;
		if (normalizedSenderId && approvers.includes(normalizedSenderId)) return { authorized: true };
		return {
			authorized: false,
			reason: `❌ You are not authorized to approve ${approvalKind} requests on ${params.channelLabel}.`
		};
	} };
}
//#endregion
//#region src/plugin-sdk/approval-client-helpers.ts
function defaultNormalizeSenderId(value) {
	return value.trim() || void 0;
}
function isApprovalTargetsMode(cfg) {
	const execApprovals = cfg.approvals?.exec;
	if (!execApprovals?.enabled) return false;
	return execApprovals.mode === "targets" || execApprovals.mode === "both";
}
function isChannelExecApprovalClientEnabledFromConfig(params) {
	if (params.approverCount <= 0) return false;
	return params.enabled !== false;
}
function isChannelExecApprovalTargetRecipient(params) {
	const normalizeSenderId = params.normalizeSenderId ?? defaultNormalizeSenderId;
	const normalizedSenderId = params.senderId ? normalizeSenderId(params.senderId) : void 0;
	const normalizedChannel = params.channel.trim().toLowerCase();
	if (!normalizedSenderId || !isApprovalTargetsMode(params.cfg)) return false;
	const targets = params.cfg.approvals?.exec?.targets;
	if (!targets) return false;
	const normalizedAccountId = params.accountId ? normalizeAccountId(params.accountId) : void 0;
	return targets.some((target) => {
		if (target.channel?.trim().toLowerCase() !== normalizedChannel) return false;
		if (normalizedAccountId && target.accountId && normalizeAccountId(target.accountId) !== normalizedAccountId) return false;
		return params.matchTarget({
			target,
			normalizedSenderId,
			normalizedAccountId
		});
	});
}
function createChannelExecApprovalProfile(params) {
	const normalizeSenderId = params.normalizeSenderId ?? defaultNormalizeSenderId;
	const isClientEnabled = (input) => {
		return isChannelExecApprovalClientEnabledFromConfig({
			enabled: params.resolveConfig(input)?.enabled,
			approverCount: params.resolveApprovers(input).length
		});
	};
	const isApprover = (input) => {
		const normalizedSenderId = input.senderId ? normalizeSenderId(input.senderId) : void 0;
		if (!normalizedSenderId) return false;
		return params.resolveApprovers(input).includes(normalizedSenderId);
	};
	const isAuthorizedSender = (input) => {
		return isApprover(input) || (params.isTargetRecipient?.(input) ?? false);
	};
	const resolveTarget = (input) => {
		return params.resolveConfig(input)?.target ?? "dm";
	};
	const shouldHandleRequest = (input) => {
		if (params.matchesRequestAccount && !params.matchesRequestAccount(input)) return false;
		const config = params.resolveConfig(input);
		const approverCount = params.resolveApprovers(input).length;
		if (!isChannelExecApprovalClientEnabledFromConfig({
			enabled: config?.enabled,
			approverCount
		})) return false;
		return matchesApprovalRequestFilters({
			request: input.request.request,
			agentFilter: config?.agentFilter,
			sessionFilter: config?.sessionFilter,
			fallbackAgentIdFromSessionKey: params.fallbackAgentIdFromSessionKey === true
		});
	};
	const shouldSuppressLocalPrompt = (input) => {
		if (params.requireClientEnabledForLocalPromptSuppression !== false && !isClientEnabled(input)) return false;
		return getExecApprovalReplyMetadata(input.payload) !== null;
	};
	return {
		isClientEnabled,
		isApprover,
		isAuthorizedSender,
		resolveTarget,
		shouldHandleRequest,
		shouldSuppressLocalPrompt
	};
}
//#endregion
//#region src/plugin-sdk/approval-native-helpers.ts
function createChannelNativeOriginTargetResolver(params) {
	return (input) => {
		if (params.shouldHandleRequest && !params.shouldHandleRequest(input)) return null;
		return resolveApprovalRequestOriginTarget({
			cfg: input.cfg,
			request: input.request,
			channel: params.channel,
			accountId: input.accountId,
			resolveTurnSourceTarget: params.resolveTurnSourceTarget,
			resolveSessionTarget: (sessionTarget) => params.resolveSessionTarget(sessionTarget, input.request),
			targetsMatch: params.targetsMatch,
			resolveFallbackTarget: params.resolveFallbackTarget
		});
	};
}
function createChannelApproverDmTargetResolver(params) {
	return (input) => {
		if (params.shouldHandleRequest && !params.shouldHandleRequest(input)) return [];
		const targets = [];
		for (const approver of params.resolveApprovers({
			cfg: input.cfg,
			accountId: input.accountId
		})) {
			const target = params.mapApprover(approver, input);
			if (target) targets.push(target);
		}
		return targets;
	};
}
//#endregion
//#region src/plugin-sdk/approval-delivery-helpers.ts
function buildApproverRestrictedNativeApprovalCapability(params) {
	const pluginSenderAuth = params.isPluginAuthorizedSender ?? params.isExecAuthorizedSender;
	const normalizePreferredSurface = (mode) => mode === "channel" ? "origin" : mode === "dm" ? "approver-dm" : "both";
	return createChannelApprovalCapability({
		authorizeActorAction: ({ cfg, accountId, senderId, approvalKind }) => {
			return (approvalKind === "plugin" ? pluginSenderAuth({
				cfg,
				accountId,
				senderId
			}) : params.isExecAuthorizedSender({
				cfg,
				accountId,
				senderId
			})) ? { authorized: true } : {
				authorized: false,
				reason: `❌ You are not authorized to approve ${approvalKind} requests on ${params.channelLabel}.`
			};
		},
		getActionAvailabilityState: ({ cfg, accountId }) => params.hasApprovers({
			cfg,
			accountId
		}) ? { kind: "enabled" } : { kind: "disabled" },
		approvals: {
			delivery: {
				hasConfiguredDmRoute: ({ cfg }) => params.listAccountIds(cfg).some((accountId) => {
					if (!params.hasApprovers({
						cfg,
						accountId
					})) return false;
					if (!params.isNativeDeliveryEnabled({
						cfg,
						accountId
					})) return false;
					const target = params.resolveNativeDeliveryMode({
						cfg,
						accountId
					});
					return target === "dm" || target === "both";
				}),
				shouldSuppressForwardingFallback: (input) => {
					if ((normalizeMessageChannel(input.target.channel) ?? input.target.channel) !== params.channel) return false;
					if (params.requireMatchingTurnSourceChannel) {
						if (normalizeMessageChannel(input.request.request.turnSourceChannel) !== params.channel) return false;
					}
					const resolvedAccountId = params.resolveSuppressionAccountId?.(input);
					const accountId = (resolvedAccountId === void 0 ? input.target.accountId?.trim() : resolvedAccountId.trim()) || void 0;
					return params.isNativeDeliveryEnabled({
						cfg: input.cfg,
						accountId
					});
				}
			},
			native: params.resolveOriginTarget || params.resolveApproverDmTargets ? {
				describeDeliveryCapabilities: ({ cfg, accountId }) => ({
					enabled: params.hasApprovers({
						cfg,
						accountId
					}) && params.isNativeDeliveryEnabled({
						cfg,
						accountId
					}),
					preferredSurface: normalizePreferredSurface(params.resolveNativeDeliveryMode({
						cfg,
						accountId
					})),
					supportsOriginSurface: Boolean(params.resolveOriginTarget),
					supportsApproverDmSurface: Boolean(params.resolveApproverDmTargets),
					notifyOriginWhenDmOnly: params.notifyOriginWhenDmOnly ?? false
				}),
				resolveOriginTarget: params.resolveOriginTarget,
				resolveApproverDmTargets: params.resolveApproverDmTargets
			} : void 0
		}
	});
}
function createApproverRestrictedNativeApprovalAdapter(params) {
	return splitChannelApprovalCapability(buildApproverRestrictedNativeApprovalCapability(params));
}
function createChannelApprovalCapability(params) {
	return {
		authorizeActorAction: params.authorizeActorAction,
		getActionAvailabilityState: params.getActionAvailabilityState,
		delivery: params.approvals?.delivery,
		render: params.approvals?.render,
		native: params.approvals?.native
	};
}
function splitChannelApprovalCapability(capability) {
	return {
		auth: {
			authorizeActorAction: capability.authorizeActorAction,
			getActionAvailabilityState: capability.getActionAvailabilityState
		},
		delivery: capability.delivery,
		render: capability.render,
		native: capability.native
	};
}
function createApproverRestrictedNativeApprovalCapability(params) {
	return buildApproverRestrictedNativeApprovalCapability(params);
}
//#endregion
//#region src/plugin-sdk/approval-approvers.ts
function dedupeDefined(values) {
	const resolved = /* @__PURE__ */ new Set();
	for (const value of values) {
		if (!value) continue;
		resolved.add(value);
	}
	return [...resolved];
}
function resolveApprovalApprovers(params) {
	const explicit = dedupeDefined((params.explicit ?? []).map((entry) => params.normalizeApprover(entry)));
	if (explicit.length > 0) return explicit;
	return dedupeDefined([
		...(params.allowFrom ?? []).map((entry) => params.normalizeApprover(entry)),
		...(params.extraAllowFrom ?? []).map((entry) => params.normalizeApprover(entry)),
		...params.defaultTo?.trim() ? [(params.normalizeDefaultTo ?? ((value) => params.normalizeApprover(value)))(params.defaultTo.trim())] : []
	]);
}
//#endregion
export { splitChannelApprovalCapability as a, createChannelExecApprovalProfile as c, createResolvedApproverActionAuthAdapter as d, createChannelApprovalCapability as i, isChannelExecApprovalClientEnabledFromConfig as l, createApproverRestrictedNativeApprovalAdapter as n, createChannelApproverDmTargetResolver as o, createApproverRestrictedNativeApprovalCapability as r, createChannelNativeOriginTargetResolver as s, resolveApprovalApprovers as t, isChannelExecApprovalTargetRecipient as u };
