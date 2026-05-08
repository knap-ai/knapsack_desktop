import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { n as resolveGlobalDedupeCache } from "./dedupe-pCHVfTe7.js";
//#region src/plugins/interactive-shared.ts
function toPluginInteractiveRegistryKey(channel, namespace) {
	return `${normalizeOptionalLowercaseString(channel) ?? ""}:${namespace.trim()}`;
}
function normalizePluginInteractiveNamespace(namespace) {
	return namespace.trim();
}
function validatePluginInteractiveNamespace(namespace) {
	if (!namespace.trim()) return "Interactive handler namespace cannot be empty";
	if (!/^[A-Za-z0-9._-]+$/.test(namespace.trim())) return "Interactive handler namespace must contain only letters, numbers, dots, underscores, and hyphens";
	return null;
}
function resolvePluginInteractiveMatch(params) {
	const trimmedData = params.data.trim();
	if (!trimmedData) return null;
	const separatorIndex = trimmedData.indexOf(":");
	const namespace = separatorIndex >= 0 ? trimmedData.slice(0, separatorIndex) : normalizePluginInteractiveNamespace(trimmedData);
	const registration = params.interactiveHandlers.get(toPluginInteractiveRegistryKey(params.channel, namespace));
	if (!registration) return null;
	return {
		registration,
		namespace,
		payload: separatorIndex >= 0 ? trimmedData.slice(separatorIndex + 1) : ""
	};
}
//#endregion
//#region src/plugins/interactive-state.ts
const PLUGIN_INTERACTIVE_STATE_KEY = Symbol.for("openclaw.pluginInteractiveState");
const PLUGIN_INTERACTIVE_CALLBACK_DEDUPE_KEY = Symbol.for("openclaw.pluginInteractiveCallbackDedupe");
function createInteractiveCallbackDedupe() {
	return resolveGlobalDedupeCache(PLUGIN_INTERACTIVE_CALLBACK_DEDUPE_KEY, {
		ttlMs: 5 * 6e4,
		maxSize: 4096
	});
}
function createInteractiveState() {
	return {
		interactiveHandlers: /* @__PURE__ */ new Map(),
		callbackDedupe: createInteractiveCallbackDedupe(),
		inflightCallbackDedupe: /* @__PURE__ */ new Set()
	};
}
function hydrateInteractiveState(value) {
	const state = typeof value === "object" && value !== null ? value : {};
	return {
		interactiveHandlers: state.interactiveHandlers instanceof Map ? state.interactiveHandlers : /* @__PURE__ */ new Map(),
		callbackDedupe: createInteractiveCallbackDedupe(),
		inflightCallbackDedupe: state.inflightCallbackDedupe instanceof Set ? state.inflightCallbackDedupe : /* @__PURE__ */ new Set()
	};
}
function getState() {
	const globalStore = globalThis;
	const existing = globalStore[PLUGIN_INTERACTIVE_STATE_KEY];
	if (existing !== void 0) {
		const hydrated = hydrateInteractiveState(existing);
		globalStore[PLUGIN_INTERACTIVE_STATE_KEY] = hydrated;
		return hydrated;
	}
	const created = createInteractiveState();
	globalStore[PLUGIN_INTERACTIVE_STATE_KEY] = created;
	return created;
}
function getPluginInteractiveHandlersState() {
	return getState().interactiveHandlers;
}
function getPluginInteractiveCallbackDedupeState() {
	return getState().callbackDedupe;
}
function claimPluginInteractiveCallbackDedupe(dedupeKey, now = Date.now()) {
	if (!dedupeKey) return true;
	const state = getState();
	if (state.inflightCallbackDedupe.has(dedupeKey) || state.callbackDedupe.peek(dedupeKey, now)) return false;
	state.inflightCallbackDedupe.add(dedupeKey);
	return true;
}
function commitPluginInteractiveCallbackDedupe(dedupeKey, now = Date.now()) {
	if (!dedupeKey) return;
	const state = getState();
	state.inflightCallbackDedupe.delete(dedupeKey);
	state.callbackDedupe.check(dedupeKey, now);
}
function releasePluginInteractiveCallbackDedupe(dedupeKey) {
	if (!dedupeKey) return;
	getState().inflightCallbackDedupe.delete(dedupeKey);
}
function clearPluginInteractiveHandlersState() {
	clearPluginInteractiveHandlerRegistrationsState();
	getPluginInteractiveCallbackDedupeState().clear();
	getState().inflightCallbackDedupe.clear();
}
function clearPluginInteractiveHandlerRegistrationsState() {
	getPluginInteractiveHandlersState().clear();
}
//#endregion
//#region src/plugins/interactive-registry.ts
function resolvePluginInteractiveNamespaceMatch(channel, data) {
	return resolvePluginInteractiveMatch({
		interactiveHandlers: getPluginInteractiveHandlersState(),
		channel,
		data
	});
}
function registerPluginInteractiveHandler(pluginId, registration, opts) {
	const interactiveHandlers = getPluginInteractiveHandlersState();
	const namespace = normalizePluginInteractiveNamespace(registration.namespace);
	const validationError = validatePluginInteractiveNamespace(namespace);
	if (validationError) return {
		ok: false,
		error: validationError
	};
	const key = toPluginInteractiveRegistryKey(registration.channel, namespace);
	const existing = interactiveHandlers.get(key);
	if (existing) return {
		ok: false,
		error: `Interactive handler namespace "${namespace}" already registered by plugin "${existing.pluginId}"`
	};
	interactiveHandlers.set(key, {
		...registration,
		namespace,
		channel: normalizeOptionalLowercaseString(registration.channel) ?? "",
		pluginId,
		pluginName: opts?.pluginName,
		pluginRoot: opts?.pluginRoot
	});
	return { ok: true };
}
function clearPluginInteractiveHandlers() {
	clearPluginInteractiveHandlersState();
}
function clearPluginInteractiveHandlerRegistrations() {
	clearPluginInteractiveHandlerRegistrationsState();
}
function clearPluginInteractiveHandlersForPlugin(pluginId) {
	const interactiveHandlers = getPluginInteractiveHandlersState();
	for (const [key, value] of interactiveHandlers.entries()) if (value.pluginId === pluginId) interactiveHandlers.delete(key);
}
function listPluginInteractiveHandlers() {
	return Array.from(getPluginInteractiveHandlersState().values());
}
function restorePluginInteractiveHandlers(registrations) {
	clearPluginInteractiveHandlerRegistrations();
	const interactiveHandlers = getPluginInteractiveHandlersState();
	for (const registration of registrations) {
		const namespace = normalizePluginInteractiveNamespace(registration.namespace);
		if (!namespace) continue;
		interactiveHandlers.set(toPluginInteractiveRegistryKey(registration.channel, namespace), {
			...registration,
			namespace,
			channel: normalizeOptionalLowercaseString(registration.channel) ?? ""
		});
	}
}
//#endregion
//#region src/plugins/hook-before-agent-start.types.ts
const PLUGIN_PROMPT_MUTATION_RESULT_FIELDS = [
	"systemPrompt",
	"prependContext",
	"prependSystemContext",
	"appendSystemContext"
];
const stripPromptMutationFieldsFromLegacyHookResult = (result) => {
	if (!result || typeof result !== "object") return result;
	const remaining = { ...result };
	for (const field of PLUGIN_PROMPT_MUTATION_RESULT_FIELDS) delete remaining[field];
	return Object.keys(remaining).length > 0 ? remaining : void 0;
};
//#endregion
//#region src/plugins/hook-types.ts
const PLUGIN_HOOK_NAMES = [
	"before_model_resolve",
	"before_prompt_build",
	"before_agent_start",
	"before_agent_reply",
	"model_call_started",
	"model_call_ended",
	"llm_input",
	"llm_output",
	"before_agent_finalize",
	"agent_end",
	"before_compaction",
	"after_compaction",
	"before_reset",
	"inbound_claim",
	"message_received",
	"message_sending",
	"message_sent",
	"before_tool_call",
	"after_tool_call",
	"tool_result_persist",
	"before_message_write",
	"session_start",
	"session_end",
	"subagent_spawning",
	"subagent_delivery_target",
	"subagent_spawned",
	"subagent_ended",
	"gateway_start",
	"gateway_stop",
	"before_dispatch",
	"reply_dispatch",
	"before_install"
];
const pluginHookNameSet = new Set(PLUGIN_HOOK_NAMES);
const isPluginHookName = (hookName) => typeof hookName === "string" && pluginHookNameSet.has(hookName);
const PROMPT_INJECTION_HOOK_NAMES = ["before_prompt_build", "before_agent_start"];
const promptInjectionHookNameSet = new Set(PROMPT_INJECTION_HOOK_NAMES);
const isPromptInjectionHookName = (hookName) => promptInjectionHookNameSet.has(hookName);
const CONVERSATION_HOOK_NAMES = [
	"llm_input",
	"llm_output",
	"before_agent_finalize",
	"agent_end"
];
const conversationHookNameSet = new Set(CONVERSATION_HOOK_NAMES);
const isConversationHookName = (hookName) => conversationHookNameSet.has(hookName);
const PluginApprovalResolutions = {
	ALLOW_ONCE: "allow-once",
	ALLOW_ALWAYS: "allow-always",
	DENY: "deny",
	TIMEOUT: "timeout",
	CANCELLED: "cancelled"
};
//#endregion
export { commitPluginInteractiveCallbackDedupe as _, isConversationHookName as a, PLUGIN_PROMPT_MUTATION_RESULT_FIELDS as c, clearPluginInteractiveHandlersForPlugin as d, listPluginInteractiveHandlers as f, claimPluginInteractiveCallbackDedupe as g, restorePluginInteractiveHandlers as h, PluginApprovalResolutions as i, stripPromptMutationFieldsFromLegacyHookResult as l, resolvePluginInteractiveNamespaceMatch as m, PLUGIN_HOOK_NAMES as n, isPluginHookName as o, registerPluginInteractiveHandler as p, PROMPT_INJECTION_HOOK_NAMES as r, isPromptInjectionHookName as s, CONVERSATION_HOOK_NAMES as t, clearPluginInteractiveHandlers as u, releasePluginInteractiveCallbackDedupe as v };
