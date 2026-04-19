import { a as clearPluginCommands, c as listProviderPluginCommandSpecs, i as validatePluginCommandDefinition, n as registerPluginCommand, o as clearPluginCommandsForPlugin, r as validateCommandName, s as getPluginCommandSpecs } from "../command-registration-BkSkbo2n.js";
import { a as resetGlobalHookRunner, i as initializeGlobalHookRunner, n as getGlobalPluginRegistry, o as runGlobalGatewayStopSafely, r as hasGlobalHooks, t as getGlobalHookRunner } from "../hook-runner-global-CYvQf43U.js";
import { a as isPromptInjectionHookName, c as clearPluginInteractiveHandlers, d as resolvePluginInteractiveNamespaceMatch, f as claimPluginInteractiveCallbackDedupe, i as isPluginHookName, l as clearPluginInteractiveHandlersForPlugin, m as releasePluginInteractiveCallbackDedupe, n as PROMPT_INJECTION_HOOK_NAMES, o as PLUGIN_PROMPT_MUTATION_RESULT_FIELDS, p as commitPluginInteractiveCallbackDedupe, r as PluginApprovalResolutions, s as stripPromptMutationFieldsFromLegacyHookResult, t as PLUGIN_HOOK_NAMES, u as registerPluginInteractiveHandler } from "../types-9X9ddJgo.js";
import { a as normalizePluginHttpPath } from "../http-route-overlap-CZjpP4j6.js";
import { o as detachPluginConversationBinding, p as requestPluginConversationBinding, s as getCurrentPluginConversationBinding } from "../conversation-binding-COoBmA8F.js";
import { i as matchPluginCommand, n as executePluginCommand, r as listPluginCommands, t as __testing } from "../commands-7eF4g_YK.js";
import { t as registerPluginHttpRoute } from "../http-registry-C71owHCY.js";
import { t as startLazyPluginServiceModule } from "../lazy-service-module-C01vq5Ob.js";
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
export { PLUGIN_HOOK_NAMES, PLUGIN_PROMPT_MUTATION_RESULT_FIELDS, PROMPT_INJECTION_HOOK_NAMES, PluginApprovalResolutions, __testing, clearPluginCommands, clearPluginCommandsForPlugin, clearPluginInteractiveHandlers, clearPluginInteractiveHandlersForPlugin, createInteractiveConversationBindingHelpers, dispatchPluginInteractiveHandler, executePluginCommand, getGlobalHookRunner, getGlobalPluginRegistry, getPluginCommandSpecs, hasGlobalHooks, initializeGlobalHookRunner, isPluginHookName, isPromptInjectionHookName, listPluginCommands, listProviderPluginCommandSpecs, matchPluginCommand, normalizePluginHttpPath, registerPluginCommand, registerPluginHttpRoute, registerPluginInteractiveHandler, resetGlobalHookRunner, runGlobalGatewayStopSafely, startLazyPluginServiceModule, stripPromptMutationFieldsFromLegacyHookResult, validateCommandName, validatePluginCommandDefinition };
