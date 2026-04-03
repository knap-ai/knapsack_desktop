import { n as resolveGlobalSingleton } from "./global-singleton-BuWJMSMa.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { n as resolveGlobalDedupeCache } from "./dedupe-_6bbS8VC.js";
import { o as detachPluginConversationBinding, p as requestPluginConversationBinding, s as getCurrentPluginConversationBinding } from "./conversation-binding-oQzcUiHT.js";
//#region src/plugins/command-registry-state.ts
const PLUGIN_COMMAND_STATE_KEY = Symbol.for("openclaw.pluginCommandsState");
const getState$1 = () => resolveGlobalSingleton(PLUGIN_COMMAND_STATE_KEY, () => ({
	pluginCommands: /* @__PURE__ */ new Map(),
	registryLocked: false
}));
const getPluginCommandMap = () => getState$1().pluginCommands;
const pluginCommands = new Proxy(/* @__PURE__ */ new Map(), { get(_target, property) {
	const value = Reflect.get(getPluginCommandMap(), property, getPluginCommandMap());
	return typeof value === "function" ? value.bind(getPluginCommandMap()) : value;
} });
function isPluginCommandRegistryLocked() {
	return getState$1().registryLocked;
}
function setPluginCommandRegistryLocked(locked) {
	getState$1().registryLocked = locked;
}
function clearPluginCommands() {
	pluginCommands.clear();
}
function clearPluginCommandsForPlugin(pluginId) {
	for (const [key, cmd] of pluginCommands.entries()) if (cmd.pluginId === pluginId) pluginCommands.delete(key);
}
function resolvePluginNativeName(command, provider) {
	const providerName = provider?.trim().toLowerCase();
	const providerOverride = providerName ? command.nativeNames?.[providerName] : void 0;
	if (typeof providerOverride === "string" && providerOverride.trim()) return providerOverride.trim();
	const defaultOverride = command.nativeNames?.default;
	if (typeof defaultOverride === "string" && defaultOverride.trim()) return defaultOverride.trim();
	return command.name;
}
function getPluginCommandSpecs(provider) {
	const providerName = provider?.trim().toLowerCase();
	if (providerName && providerName !== "telegram" && providerName !== "discord") return [];
	return Array.from(pluginCommands.values()).map((cmd) => ({
		name: resolvePluginNativeName(cmd, provider),
		description: cmd.description,
		acceptsArgs: cmd.acceptsArgs ?? false
	}));
}
//#endregion
//#region src/plugins/interactive-dispatch-adapters.ts
function createConversationBindingHelpers(params) {
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
function dispatchTelegramInteractiveHandler(params) {
	const { callbackMessage, ...handlerContext } = params.ctx;
	return params.registration.handler({
		...handlerContext,
		channel: "telegram",
		callback: {
			data: params.data,
			namespace: params.namespace,
			payload: params.payload,
			messageId: callbackMessage.messageId,
			chatId: callbackMessage.chatId,
			messageText: callbackMessage.messageText
		},
		respond: params.respond,
		...createConversationBindingHelpers({
			registration: params.registration,
			senderId: handlerContext.senderId,
			conversation: {
				channel: "telegram",
				accountId: handlerContext.accountId,
				conversationId: handlerContext.conversationId,
				parentConversationId: handlerContext.parentConversationId,
				threadId: handlerContext.threadId
			}
		})
	});
}
function dispatchDiscordInteractiveHandler(params) {
	const handlerContext = params.ctx;
	return params.registration.handler({
		...handlerContext,
		channel: "discord",
		interaction: {
			...handlerContext.interaction,
			data: params.data,
			namespace: params.namespace,
			payload: params.payload
		},
		respond: params.respond,
		...createConversationBindingHelpers({
			registration: params.registration,
			senderId: handlerContext.senderId,
			conversation: {
				channel: "discord",
				accountId: handlerContext.accountId,
				conversationId: handlerContext.conversationId,
				parentConversationId: handlerContext.parentConversationId
			}
		})
	});
}
function dispatchSlackInteractiveHandler(params) {
	const handlerContext = params.ctx;
	return params.registration.handler({
		...handlerContext,
		channel: "slack",
		interaction: {
			...handlerContext.interaction,
			data: params.data,
			namespace: params.namespace,
			payload: params.payload
		},
		respond: params.respond,
		...createConversationBindingHelpers({
			registration: params.registration,
			senderId: handlerContext.senderId,
			conversation: {
				channel: "slack",
				accountId: handlerContext.accountId,
				conversationId: handlerContext.conversationId,
				parentConversationId: handlerContext.parentConversationId,
				threadId: handlerContext.threadId
			}
		})
	});
}
//#endregion
//#region src/plugins/interactive.ts
const PLUGIN_INTERACTIVE_STATE_KEY = Symbol.for("openclaw.pluginInteractiveState");
const getState = () => resolveGlobalSingleton(PLUGIN_INTERACTIVE_STATE_KEY, () => ({
	interactiveHandlers: /* @__PURE__ */ new Map(),
	callbackDedupe: resolveGlobalDedupeCache(Symbol.for("openclaw.pluginInteractiveCallbackDedupe"), {
		ttlMs: 5 * 6e4,
		maxSize: 4096
	})
}));
const getInteractiveHandlers = () => getState().interactiveHandlers;
const getCallbackDedupe = () => getState().callbackDedupe;
function toRegistryKey(channel, namespace) {
	return `${channel.trim().toLowerCase()}:${namespace.trim()}`;
}
function normalizeNamespace(namespace) {
	return namespace.trim();
}
function validateNamespace(namespace) {
	if (!namespace.trim()) return "Interactive handler namespace cannot be empty";
	if (!/^[A-Za-z0-9._-]+$/.test(namespace.trim())) return "Interactive handler namespace must contain only letters, numbers, dots, underscores, and hyphens";
	return null;
}
function resolveNamespaceMatch(channel, data) {
	const interactiveHandlers = getInteractiveHandlers();
	const trimmedData = data.trim();
	if (!trimmedData) return null;
	const separatorIndex = trimmedData.indexOf(":");
	const namespace = separatorIndex >= 0 ? trimmedData.slice(0, separatorIndex) : normalizeNamespace(trimmedData);
	const registration = interactiveHandlers.get(toRegistryKey(channel, namespace));
	if (!registration) return null;
	return {
		registration,
		namespace,
		payload: separatorIndex >= 0 ? trimmedData.slice(separatorIndex + 1) : ""
	};
}
function registerPluginInteractiveHandler(pluginId, registration, opts) {
	const interactiveHandlers = getInteractiveHandlers();
	const namespace = normalizeNamespace(registration.namespace);
	const validationError = validateNamespace(namespace);
	if (validationError) return {
		ok: false,
		error: validationError
	};
	const key = toRegistryKey(registration.channel, namespace);
	const existing = interactiveHandlers.get(key);
	if (existing) return {
		ok: false,
		error: `Interactive handler namespace "${namespace}" already registered by plugin "${existing.pluginId}"`
	};
	if (registration.channel === "telegram") interactiveHandlers.set(key, {
		...registration,
		namespace,
		channel: "telegram",
		pluginId,
		pluginName: opts?.pluginName,
		pluginRoot: opts?.pluginRoot
	});
	else if (registration.channel === "slack") interactiveHandlers.set(key, {
		...registration,
		namespace,
		channel: "slack",
		pluginId,
		pluginName: opts?.pluginName,
		pluginRoot: opts?.pluginRoot
	});
	else interactiveHandlers.set(key, {
		...registration,
		namespace,
		channel: "discord",
		pluginId,
		pluginName: opts?.pluginName,
		pluginRoot: opts?.pluginRoot
	});
	return { ok: true };
}
function clearPluginInteractiveHandlers() {
	const interactiveHandlers = getInteractiveHandlers();
	const callbackDedupe = getCallbackDedupe();
	interactiveHandlers.clear();
	callbackDedupe.clear();
}
function clearPluginInteractiveHandlersForPlugin(pluginId) {
	const interactiveHandlers = getInteractiveHandlers();
	for (const [key, value] of interactiveHandlers.entries()) if (value.pluginId === pluginId) interactiveHandlers.delete(key);
}
async function dispatchPluginInteractiveHandler(params) {
	const callbackDedupe = getCallbackDedupe();
	const match = resolveNamespaceMatch(params.channel, params.data);
	if (!match) return {
		matched: false,
		handled: false,
		duplicate: false
	};
	const dedupeKey = params.channel === "telegram" ? params.callbackId?.trim() : params.interactionId?.trim();
	if (dedupeKey && callbackDedupe.peek(dedupeKey)) return {
		matched: true,
		handled: true,
		duplicate: true
	};
	await params.onMatched?.();
	let result;
	if (params.channel === "telegram") result = dispatchTelegramInteractiveHandler({
		registration: match.registration,
		data: params.data,
		namespace: match.namespace,
		payload: match.payload,
		ctx: params.ctx,
		respond: params.respond
	});
	else if (params.channel === "discord") result = dispatchDiscordInteractiveHandler({
		registration: match.registration,
		data: params.data,
		namespace: match.namespace,
		payload: match.payload,
		ctx: params.ctx,
		respond: params.respond
	});
	else result = dispatchSlackInteractiveHandler({
		registration: match.registration,
		data: params.data,
		namespace: match.namespace,
		payload: match.payload,
		ctx: params.ctx,
		respond: params.respond
	});
	const resolved = await result;
	if (dedupeKey) callbackDedupe.check(dedupeKey);
	return {
		matched: true,
		handled: resolved?.handled ?? true,
		duplicate: false
	};
}
//#endregion
//#region src/plugins/command-registration.ts
/**
* Reserved command names that plugins cannot override (built-in commands).
*
* Constructed lazily inside validateCommandName to avoid TDZ errors: the
* bundler can place this module's body after call sites within the same
* output chunk, so any module-level const/let would be uninitialized when
* first accessed during plugin registration.
*/
var reservedCommands;
function validateCommandName(name) {
	const trimmed = name.trim().toLowerCase();
	if (!trimmed) return "Command name cannot be empty";
	if (!/^[a-z][a-z0-9_-]*$/.test(trimmed)) return "Command name must start with a letter and contain only letters, numbers, hyphens, and underscores";
	reservedCommands ??= new Set([
		"help",
		"commands",
		"status",
		"whoami",
		"context",
		"btw",
		"stop",
		"restart",
		"reset",
		"new",
		"compact",
		"config",
		"debug",
		"allowlist",
		"activation",
		"skill",
		"subagents",
		"kill",
		"steer",
		"tell",
		"model",
		"models",
		"queue",
		"send",
		"bash",
		"exec",
		"think",
		"verbose",
		"reasoning",
		"elevated",
		"usage"
	]);
	if (reservedCommands.has(trimmed)) return `Command name "${trimmed}" is reserved by a built-in command`;
	return null;
}
/**
* Validate a plugin command definition without registering it.
* Returns an error message if invalid, or null if valid.
* Shared by both the global registration path and snapshot (non-activating) loads.
*/
function validatePluginCommandDefinition(command) {
	if (typeof command.handler !== "function") return "Command handler must be a function";
	if (typeof command.name !== "string") return "Command name must be a string";
	if (typeof command.description !== "string") return "Command description must be a string";
	if (!command.description.trim()) return "Command description cannot be empty";
	const nameError = validateCommandName(command.name.trim());
	if (nameError) return nameError;
	for (const [label, alias] of Object.entries(command.nativeNames ?? {})) {
		if (typeof alias !== "string") continue;
		const aliasError = validateCommandName(alias.trim());
		if (aliasError) return `Native command alias "${label}" invalid: ${aliasError}`;
	}
	return null;
}
function listPluginInvocationKeys(command) {
	const keys = /* @__PURE__ */ new Set();
	const push = (value) => {
		const normalized = value?.trim().toLowerCase();
		if (!normalized) return;
		keys.add(`/${normalized}`);
	};
	push(command.name);
	push(command.nativeNames?.default);
	push(command.nativeNames?.telegram);
	push(command.nativeNames?.discord);
	return [...keys];
}
function registerPluginCommand(pluginId, command, opts) {
	if (isPluginCommandRegistryLocked()) return {
		ok: false,
		error: "Cannot register commands while processing is in progress"
	};
	const definitionError = validatePluginCommandDefinition(command);
	if (definitionError) return {
		ok: false,
		error: definitionError
	};
	const name = command.name.trim();
	const description = command.description.trim();
	const normalizedCommand = {
		...command,
		name,
		description
	};
	const invocationKeys = listPluginInvocationKeys(normalizedCommand);
	const key = `/${name.toLowerCase()}`;
	for (const invocationKey of invocationKeys) {
		const existing = pluginCommands.get(invocationKey) ?? Array.from(pluginCommands.values()).find((candidate) => listPluginInvocationKeys(candidate).includes(invocationKey));
		if (existing) return {
			ok: false,
			error: `Command "${invocationKey.slice(1)}" already registered by plugin "${existing.pluginId}"`
		};
	}
	pluginCommands.set(key, {
		...normalizedCommand,
		pluginId,
		pluginName: opts?.pluginName,
		pluginRoot: opts?.pluginRoot
	});
	logVerbose(`Registered plugin command: ${key} (plugin: ${pluginId})`);
	return { ok: true };
}
//#endregion
//#region src/plugins/types.ts
const PLUGIN_HOOK_NAMES = [
	"before_model_resolve",
	"before_prompt_build",
	"before_agent_start",
	"before_agent_reply",
	"llm_input",
	"llm_output",
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
	"before_install"
];
const pluginHookNameSet = new Set(PLUGIN_HOOK_NAMES);
const isPluginHookName = (hookName) => typeof hookName === "string" && pluginHookNameSet.has(hookName);
const PROMPT_INJECTION_HOOK_NAMES = ["before_prompt_build", "before_agent_start"];
const promptInjectionHookNameSet = new Set(PROMPT_INJECTION_HOOK_NAMES);
const isPromptInjectionHookName = (hookName) => promptInjectionHookNameSet.has(hookName);
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
const PluginApprovalResolutions = {
	ALLOW_ONCE: "allow-once",
	ALLOW_ALWAYS: "allow-always",
	DENY: "deny",
	TIMEOUT: "timeout",
	CANCELLED: "cancelled"
};
//#endregion
export { clearPluginCommandsForPlugin as _, isPluginHookName as a, setPluginCommandRegistryLocked as b, listPluginInvocationKeys as c, validatePluginCommandDefinition as d, clearPluginInteractiveHandlers as f, clearPluginCommands as g, registerPluginInteractiveHandler as h, PluginApprovalResolutions as i, registerPluginCommand as l, dispatchPluginInteractiveHandler as m, PLUGIN_PROMPT_MUTATION_RESULT_FIELDS as n, isPromptInjectionHookName as o, clearPluginInteractiveHandlersForPlugin as p, PROMPT_INJECTION_HOOK_NAMES as r, stripPromptMutationFieldsFromLegacyHookResult as s, PLUGIN_HOOK_NAMES as t, validateCommandName as u, getPluginCommandSpecs as v, pluginCommands as y };
