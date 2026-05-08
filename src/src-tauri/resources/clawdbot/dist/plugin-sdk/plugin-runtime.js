import { a as clearPluginCommands, i as validatePluginCommandDefinition, n as registerPluginCommand, o as clearPluginCommandsForPlugin, r as validateCommandName, s as listProviderPluginCommandSpecs } from "../command-registration-h0xR6wWQ.js";
import { a as resetGlobalHookRunner, i as initializeGlobalHookRunner, n as getGlobalPluginRegistry, o as runGlobalGatewayStopSafely, r as hasGlobalHooks, t as getGlobalHookRunner } from "../hook-runner-global-_PCECtwt.js";
import { _ as commitPluginInteractiveCallbackDedupe, a as isConversationHookName, c as PLUGIN_PROMPT_MUTATION_RESULT_FIELDS, d as clearPluginInteractiveHandlersForPlugin, g as claimPluginInteractiveCallbackDedupe, i as PluginApprovalResolutions, l as stripPromptMutationFieldsFromLegacyHookResult, m as resolvePluginInteractiveNamespaceMatch, n as PLUGIN_HOOK_NAMES, o as isPluginHookName, p as registerPluginInteractiveHandler, r as PROMPT_INJECTION_HOOK_NAMES, s as isPromptInjectionHookName, t as CONVERSATION_HOOK_NAMES, u as clearPluginInteractiveHandlers, v as releasePluginInteractiveCallbackDedupe } from "../types-CSFx9bdF.js";
import { n as normalizePluginHttpPath } from "../http-route-overlap-8XNsaGjg.js";
import { t as getPluginRuntimeGatewayRequestScope } from "../gateway-request-scope-BrfRtlzX.js";
import { a as getPluginCommandSpecs, i as matchPluginCommand, n as executePluginCommand, r as listPluginCommands, t as __testing } from "../commands-CgVoTNyj.js";
import { o as detachPluginConversationBinding, p as requestPluginConversationBinding, s as getCurrentPluginConversationBinding } from "../conversation-binding-DIzQqGtm.js";
import { t as registerPluginHttpRoute } from "../http-registry-C0SEFHH6.js";
import { n as startLazyPluginServiceModule, t as defaultLoadOverrideModule } from "../lazy-service-module-2HZrBZvK.js";
//#region src/plugins/interactive-binding-helpers.ts
function createInteractiveConversationBindingHelpers(params) {
	const { registration, senderId, conversation } = params;
	const pluginRoot = registration.pluginRoot;
	return {
		requestConversationBinding: async (binding = {}) => {
			if (!pluginRoot) return {
				status: "error",
				message: "This interaction cannot bind the current conversation."
			};
			return requestPluginConversationBinding({
				pluginId: registration.pluginId,
				pluginName: registration.pluginName,
				pluginRoot,
				requestedBySenderId: senderId,
				conversation,
				binding
			});
		},
		detachConversationBinding: async () => {
			if (!pluginRoot) return { removed: false };
			return detachPluginConversationBinding({
				pluginRoot,
				conversation
			});
		},
		getCurrentConversationBinding: async () => {
			if (!pluginRoot) return null;
			return getCurrentPluginConversationBinding({
				pluginRoot,
				conversation
			});
		}
	};
}
//#endregion
//#region src/plugins/interactive.ts
async function dispatchPluginInteractiveHandler(params) {
	const match = resolvePluginInteractiveNamespaceMatch(params.channel, params.data);
	if (!match) return {
		matched: false,
		handled: false,
		duplicate: false
	};
	const dedupeKey = params.dedupeId?.trim();
	if (dedupeKey && !claimPluginInteractiveCallbackDedupe(dedupeKey)) return {
		matched: true,
		handled: true,
		duplicate: true
	};
	try {
		await params.onMatched?.();
		const resolved = await params.invoke(match);
		if (dedupeKey) commitPluginInteractiveCallbackDedupe(dedupeKey);
		return {
			matched: true,
			handled: resolved?.handled ?? true,
			duplicate: false
		};
	} catch (error) {
		if (dedupeKey) releasePluginInteractiveCallbackDedupe(dedupeKey);
		throw error;
	}
}
//#endregion
export { CONVERSATION_HOOK_NAMES, PLUGIN_HOOK_NAMES, PLUGIN_PROMPT_MUTATION_RESULT_FIELDS, PROMPT_INJECTION_HOOK_NAMES, PluginApprovalResolutions, __testing, clearPluginCommands, clearPluginCommandsForPlugin, clearPluginInteractiveHandlers, clearPluginInteractiveHandlersForPlugin, createInteractiveConversationBindingHelpers, defaultLoadOverrideModule, dispatchPluginInteractiveHandler, executePluginCommand, getGlobalHookRunner, getGlobalPluginRegistry, getPluginCommandSpecs, getPluginRuntimeGatewayRequestScope, hasGlobalHooks, initializeGlobalHookRunner, isConversationHookName, isPluginHookName, isPromptInjectionHookName, listPluginCommands, listProviderPluginCommandSpecs, matchPluginCommand, normalizePluginHttpPath, registerPluginCommand, registerPluginHttpRoute, registerPluginInteractiveHandler, resetGlobalHookRunner, runGlobalGatewayStopSafely, startLazyPluginServiceModule, stripPromptMutationFieldsFromLegacyHookResult, validateCommandName, validatePluginCommandDefinition };
