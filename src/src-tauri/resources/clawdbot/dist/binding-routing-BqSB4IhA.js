import { u as resolveAgentIdFromSessionKey } from "./session-key-EpIbK3Oz.js";
import { n as deriveLastRoutePolicy } from "./resolve-route-DWtJo8cH.js";
import { r as getSessionBindingService } from "./session-binding-service-CHlhSOHA.js";
import { n as resolveConfiguredBinding } from "./binding-registry-91VaibhB.js";
import { t as ensureConfiguredBindingTargetReady } from "./binding-targets-UeDuUVfI.js";
//#region src/channels/plugins/binding-routing.ts
function resolveConfiguredBindingConversationRef(params) {
	if ("conversation" in params) return params.conversation;
	return {
		channel: params.channel,
		accountId: params.accountId,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	};
}
function isPluginOwnedRuntimeBindingRecord(record) {
	const metadata = record?.metadata;
	if (!metadata || typeof metadata !== "object") return false;
	return metadata.pluginBindingOwner === "plugin" && typeof metadata.pluginId === "string" && typeof metadata.pluginRoot === "string";
}
function resolveConfiguredBindingRoute(params) {
	const bindingResolution = resolveConfiguredBinding({
		cfg: params.cfg,
		conversation: resolveConfiguredBindingConversationRef(params)
	}) ?? null;
	if (!bindingResolution) return {
		bindingResolution: null,
		route: params.route
	};
	const boundSessionKey = bindingResolution.statefulTarget.sessionKey.trim();
	if (!boundSessionKey) return {
		bindingResolution,
		route: params.route
	};
	const boundAgentId = resolveAgentIdFromSessionKey(boundSessionKey) || bindingResolution.statefulTarget.agentId;
	return {
		bindingResolution,
		boundSessionKey,
		boundAgentId,
		route: {
			...params.route,
			sessionKey: boundSessionKey,
			agentId: boundAgentId,
			lastRoutePolicy: deriveLastRoutePolicy({
				sessionKey: boundSessionKey,
				mainSessionKey: params.route.mainSessionKey
			}),
			matchedBy: "binding.channel"
		}
	};
}
function resolveRuntimeConversationBindingRoute(params) {
	const bindingRecord = getSessionBindingService().resolveByConversation(resolveConfiguredBindingConversationRef(params));
	const boundSessionKey = bindingRecord?.targetSessionKey?.trim();
	if (!bindingRecord || !boundSessionKey) return {
		bindingRecord: null,
		route: params.route
	};
	getSessionBindingService().touch(bindingRecord.bindingId);
	if (isPluginOwnedRuntimeBindingRecord(bindingRecord)) return {
		bindingRecord,
		route: params.route
	};
	const boundAgentId = resolveAgentIdFromSessionKey(boundSessionKey) || params.route.agentId;
	return {
		bindingRecord,
		boundSessionKey,
		boundAgentId,
		route: {
			...params.route,
			sessionKey: boundSessionKey,
			agentId: boundAgentId,
			lastRoutePolicy: deriveLastRoutePolicy({
				sessionKey: boundSessionKey,
				mainSessionKey: params.route.mainSessionKey
			}),
			matchedBy: "binding.channel"
		}
	};
}
async function ensureConfiguredBindingRouteReady(params) {
	return await ensureConfiguredBindingTargetReady(params);
}
//#endregion
export { resolveConfiguredBindingRoute as n, resolveRuntimeConversationBindingRoute as r, ensureConfiguredBindingRouteReady as t };
