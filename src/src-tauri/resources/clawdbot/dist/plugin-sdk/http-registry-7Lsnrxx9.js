import { d as logVerbose, t as createSubsystemLogger } from "./subsystem-7GlwMGJM.js";
import { h as resolveUserPath } from "./utils-B2utBG_m.js";
import path from "node:path";
//#region src/plugins/slots.ts
const DEFAULT_SLOT_BY_KEY = {
	memory: "memory-core",
	contextEngine: "legacy"
};
function defaultSlotIdForKey(slotKey) {
	return DEFAULT_SLOT_BY_KEY[slotKey];
}
//#endregion
//#region src/context-engine/registry.ts
const CONTEXT_ENGINE_REGISTRY_STATE = Symbol.for("openclaw.contextEngineRegistryState");
function getContextEngineRegistryState() {
	const globalState = globalThis;
	if (!globalState[CONTEXT_ENGINE_REGISTRY_STATE]) globalState[CONTEXT_ENGINE_REGISTRY_STATE] = { engines: /* @__PURE__ */ new Map() };
	return globalState[CONTEXT_ENGINE_REGISTRY_STATE];
}
/**
* Register a context engine implementation under the given id.
*/
function registerContextEngine(id, factory) {
	getContextEngineRegistryState().engines.set(id, factory);
}
/**
* List all registered engine ids.
*/
function listContextEngineIds() {
	return [...getContextEngineRegistryState().engines.keys()];
}
/**
* Resolve which ContextEngine to use based on plugin slot configuration.
*
* Resolution order:
*   1. `config.plugins.slots.contextEngine` (explicit slot override)
*   2. Default slot value ("legacy")
*
* Throws if the resolved engine id has no registered factory.
*/
async function resolveContextEngine(config) {
	const slotValue = config?.plugins?.slots?.contextEngine;
	const engineId = typeof slotValue === "string" && slotValue.trim() ? slotValue.trim() : defaultSlotIdForKey("contextEngine");
	const factory = getContextEngineRegistryState().engines.get(engineId);
	if (!factory) throw new Error(`Context engine "${engineId}" is not registered. Available engines: ${listContextEngineIds().join(", ") || "(none)"}`);
	return factory();
}
//#endregion
//#region src/hooks/internal-hooks.ts
/**
* Registry of hook handlers by event key.
*
* Uses a globalThis singleton so that registerInternalHook and
* triggerInternalHook always share the same Map even when the bundler
* emits multiple copies of this module into separate chunks (bundle
* splitting). Without the singleton, handlers registered in one chunk
* are invisible to triggerInternalHook in another chunk, causing hooks
* to silently fire with zero handlers.
*/
const _g = globalThis;
const handlers = _g.__openclaw_internal_hook_handlers__ ??= /* @__PURE__ */ new Map();
const log = createSubsystemLogger("internal-hooks");
/**
* Register a hook handler for a specific event type or event:action combination
*
* @param eventKey - Event type (e.g., 'command') or specific action (e.g., 'command:new')
* @param handler - Function to call when the event is triggered
*
* @example
* ```ts
* // Listen to all command events
* registerInternalHook('command', async (event) => {
*   console.log('Command:', event.action);
* });
*
* // Listen only to /new commands
* registerInternalHook('command:new', async (event) => {
*   await saveSessionToMemory(event);
* });
* ```
*/
function registerInternalHook(eventKey, handler) {
	if (!handlers.has(eventKey)) handlers.set(eventKey, []);
	handlers.get(eventKey).push(handler);
}
/**
* Trigger a hook event
*
* Calls all handlers registered for:
* 1. The general event type (e.g., 'command')
* 2. The specific event:action combination (e.g., 'command:new')
*
* Handlers are called in registration order. Errors are caught and logged
* but don't prevent other handlers from running.
*
* @param event - The event to trigger
*/
async function triggerInternalHook(event) {
	const typeHandlers = handlers.get(event.type) ?? [];
	const specificHandlers = handlers.get(`${event.type}:${event.action}`) ?? [];
	const allHandlers = [...typeHandlers, ...specificHandlers];
	if (allHandlers.length === 0) return;
	for (const handler of allHandlers) try {
		await handler(event);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.error(`Hook error [${event.type}:${event.action}]: ${message}`);
	}
}
/**
* Create a hook event with common fields filled in
*
* @param type - The event type
* @param action - The action within that type
* @param sessionKey - The session key
* @param context - Additional context
*/
function createInternalHookEvent(type, action, sessionKey, context = {}) {
	return {
		type,
		action,
		sessionKey,
		context,
		timestamp: /* @__PURE__ */ new Date(),
		messages: []
	};
}
//#endregion
//#region src/plugins/commands.ts
const pluginCommands = /* @__PURE__ */ new Map();
let registryLocked = false;
const MAX_ARGS_LENGTH = 4096;
/**
* Reserved command names that plugins cannot override.
* These are built-in commands from commands-registry.data.ts.
*/
const RESERVED_COMMANDS = new Set([
	"help",
	"commands",
	"status",
	"whoami",
	"context",
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
/**
* Validate a command name.
* Returns an error message if invalid, or null if valid.
*/
function validateCommandName(name) {
	const trimmed = name.trim().toLowerCase();
	if (!trimmed) return "Command name cannot be empty";
	if (!/^[a-z][a-z0-9_-]*$/.test(trimmed)) return "Command name must start with a letter and contain only letters, numbers, hyphens, and underscores";
	if (RESERVED_COMMANDS.has(trimmed)) return `Command name "${trimmed}" is reserved by a built-in command`;
	return null;
}
/**
* Register a plugin command.
* Returns an error if the command name is invalid or reserved.
*/
function registerPluginCommand(pluginId, command) {
	if (registryLocked) return {
		ok: false,
		error: "Cannot register commands while processing is in progress"
	};
	if (typeof command.handler !== "function") return {
		ok: false,
		error: "Command handler must be a function"
	};
	if (typeof command.name !== "string") return {
		ok: false,
		error: "Command name must be a string"
	};
	if (typeof command.description !== "string") return {
		ok: false,
		error: "Command description must be a string"
	};
	const name = command.name.trim();
	const description = command.description.trim();
	if (!description) return {
		ok: false,
		error: "Command description cannot be empty"
	};
	const validationError = validateCommandName(name);
	if (validationError) return {
		ok: false,
		error: validationError
	};
	const key = `/${name.toLowerCase()}`;
	if (pluginCommands.has(key)) return {
		ok: false,
		error: `Command "${name}" already registered by plugin "${pluginCommands.get(key).pluginId}"`
	};
	pluginCommands.set(key, {
		...command,
		name,
		description,
		pluginId
	});
	logVerbose(`Registered plugin command: ${key} (plugin: ${pluginId})`);
	return { ok: true };
}
/**
* Clear all registered plugin commands.
* Called during plugin reload.
*/
function clearPluginCommands() {
	pluginCommands.clear();
}
/**
* Check if a command body matches a registered plugin command.
* Returns the command definition and parsed args if matched.
*
* Note: If a command has `acceptsArgs: false` and the user provides arguments,
* the command will not match. This allows the message to fall through to
* built-in handlers or the agent. Document this behavior to plugin authors.
*/
function matchPluginCommand(commandBody) {
	const trimmed = commandBody.trim();
	if (!trimmed.startsWith("/")) return null;
	const spaceIndex = trimmed.indexOf(" ");
	const commandName = spaceIndex === -1 ? trimmed : trimmed.slice(0, spaceIndex);
	const args = spaceIndex === -1 ? void 0 : trimmed.slice(spaceIndex + 1).trim();
	const key = commandName.toLowerCase();
	const command = pluginCommands.get(key);
	if (!command) return null;
	if (args && !command.acceptsArgs) return null;
	return {
		command,
		args: args || void 0
	};
}
/**
* Sanitize command arguments to prevent injection attacks.
* Removes control characters and enforces length limits.
*/
function sanitizeArgs(args) {
	if (!args) return;
	if (args.length > MAX_ARGS_LENGTH) return args.slice(0, MAX_ARGS_LENGTH);
	let sanitized = "";
	for (const char of args) {
		const code = char.charCodeAt(0);
		if (!(code <= 31 && code !== 9 && code !== 10 || code === 127)) sanitized += char;
	}
	return sanitized;
}
/**
* Execute a plugin command handler.
*
* Note: Plugin authors should still validate and sanitize ctx.args for their
* specific use case. This function provides basic defense-in-depth sanitization.
*/
async function executePluginCommand(params) {
	const { command, args, senderId, channel, isAuthorizedSender, commandBody, config } = params;
	if (command.requireAuth !== false && !isAuthorizedSender) {
		logVerbose(`Plugin command /${command.name} blocked: unauthorized sender ${senderId || "<unknown>"}`);
		return { text: "⚠️ This command requires authorization." };
	}
	const sanitizedArgs = sanitizeArgs(args);
	const ctx = {
		senderId,
		channel,
		channelId: params.channelId,
		isAuthorizedSender,
		args: sanitizedArgs,
		commandBody,
		config,
		from: params.from,
		to: params.to,
		accountId: params.accountId,
		messageThreadId: params.messageThreadId
	};
	registryLocked = true;
	try {
		const result = await command.handler(ctx);
		logVerbose(`Plugin command /${command.name} executed successfully for ${senderId || "unknown"}`);
		return result;
	} catch (err) {
		const error = err;
		logVerbose(`Plugin command /${command.name} error: ${error.message}`);
		return { text: "⚠️ Command failed. Please try again later." };
	} finally {
		registryLocked = false;
	}
}
/**
* List all registered plugin commands.
* Used for /help and /commands output.
*/
function listPluginCommands() {
	return Array.from(pluginCommands.values()).map((cmd) => ({
		name: cmd.name,
		description: cmd.description,
		pluginId: cmd.pluginId
	}));
}
function resolvePluginNativeName(command, provider) {
	const providerName = provider?.trim().toLowerCase();
	const providerOverride = providerName ? command.nativeNames?.[providerName] : void 0;
	if (typeof providerOverride === "string" && providerOverride.trim()) return providerOverride.trim();
	const defaultOverride = command.nativeNames?.default;
	if (typeof defaultOverride === "string" && defaultOverride.trim()) return defaultOverride.trim();
	return command.name;
}
/**
* Get plugin command specs for native command registration (e.g., Telegram).
*/
function getPluginCommandSpecs(provider) {
	return Array.from(pluginCommands.values()).map((cmd) => ({
		name: resolvePluginNativeName(cmd, provider),
		description: cmd.description,
		acceptsArgs: cmd.acceptsArgs ?? false
	}));
}
//#endregion
//#region src/plugins/http-path.ts
function normalizePluginHttpPath(path, fallback) {
	const trimmed = path?.trim();
	if (!trimmed) {
		const fallbackTrimmed = fallback?.trim();
		if (!fallbackTrimmed) return null;
		return fallbackTrimmed.startsWith("/") ? fallbackTrimmed : `/${fallbackTrimmed}`;
	}
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
//#endregion
//#region src/gateway/security-path.ts
const MAX_PATH_DECODE_PASSES = 32;
function normalizePathSeparators(pathname) {
	const collapsed = pathname.replace(/\/{2,}/g, "/");
	if (collapsed.length <= 1) return collapsed;
	return collapsed.replace(/\/+$/, "");
}
function resolveDotSegments(pathname) {
	try {
		return new URL(pathname, "http://localhost").pathname;
	} catch {
		return pathname;
	}
}
function normalizePathForSecurity(pathname) {
	return normalizePathSeparators(resolveDotSegments(pathname).toLowerCase()) || "/";
}
function pushNormalizedCandidate(candidates, seen, value) {
	const normalized = normalizePathForSecurity(value);
	if (seen.has(normalized)) return;
	seen.add(normalized);
	candidates.push(normalized);
}
function buildCanonicalPathCandidates(pathname, maxDecodePasses = MAX_PATH_DECODE_PASSES) {
	const candidates = [];
	const seen = /* @__PURE__ */ new Set();
	pushNormalizedCandidate(candidates, seen, pathname);
	let decoded = pathname;
	let malformedEncoding = false;
	let decodePasses = 0;
	for (let pass = 0; pass < maxDecodePasses; pass++) {
		let nextDecoded = decoded;
		try {
			nextDecoded = decodeURIComponent(decoded);
		} catch {
			malformedEncoding = true;
			break;
		}
		if (nextDecoded === decoded) break;
		decodePasses += 1;
		decoded = nextDecoded;
		pushNormalizedCandidate(candidates, seen, decoded);
	}
	let decodePassLimitReached = false;
	if (!malformedEncoding) try {
		decodePassLimitReached = decodeURIComponent(decoded) !== decoded;
	} catch {
		malformedEncoding = true;
	}
	return {
		candidates,
		decodePasses,
		decodePassLimitReached,
		malformedEncoding
	};
}
function canonicalizePathVariant(pathname) {
	const { candidates } = buildCanonicalPathCandidates(pathname);
	return candidates[candidates.length - 1] ?? "/";
}
//#endregion
//#region src/plugins/http-route-overlap.ts
function prefixMatchPath(pathname, prefix) {
	return pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}%`);
}
function doPluginHttpRoutesOverlap(a, b) {
	const aPath = canonicalizePathVariant(a.path);
	const bPath = canonicalizePathVariant(b.path);
	if (a.match === "exact" && b.match === "exact") return aPath === bPath;
	if (a.match === "prefix" && b.match === "prefix") return prefixMatchPath(aPath, bPath) || prefixMatchPath(bPath, aPath);
	const prefixRoute = a.match === "prefix" ? a : b;
	return prefixMatchPath(canonicalizePathVariant((a.match === "exact" ? a : b).path), canonicalizePathVariant(prefixRoute.path));
}
function findOverlappingPluginHttpRoute(routes, candidate) {
	return routes.find((route) => doPluginHttpRoutesOverlap(route, candidate));
}
//#endregion
//#region src/plugins/provider-validation.ts
function pushProviderDiagnostic(params) {
	params.pushDiagnostic({
		level: params.level,
		pluginId: params.pluginId,
		source: params.source,
		message: params.message
	});
}
function normalizeText(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function normalizeTextList(values) {
	const normalized = Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeProviderAuthMethods(params) {
	const seenMethodIds = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const method of params.auth) {
		const methodId = normalizeText(method.id);
		if (!methodId) {
			pushProviderDiagnostic({
				level: "error",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" auth method missing id`,
				pushDiagnostic: params.pushDiagnostic
			});
			continue;
		}
		if (seenMethodIds.has(methodId)) {
			pushProviderDiagnostic({
				level: "error",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" auth method duplicated id "${methodId}"`,
				pushDiagnostic: params.pushDiagnostic
			});
			continue;
		}
		seenMethodIds.add(methodId);
		normalized.push({
			...method,
			id: methodId,
			label: normalizeText(method.label) ?? methodId,
			...normalizeText(method.hint) ? { hint: normalizeText(method.hint) } : {}
		});
	}
	return normalized;
}
function normalizeProviderWizard(params) {
	if (!params.wizard) return;
	const hasAuthMethods = params.auth.length > 0;
	const hasMethod = (methodId) => Boolean(methodId && params.auth.some((method) => method.id === methodId));
	const normalizeOnboarding = () => {
		const onboarding = params.wizard?.onboarding;
		if (!onboarding) return;
		if (!hasAuthMethods) {
			pushProviderDiagnostic({
				level: "warn",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" onboarding metadata ignored because it has no auth methods`,
				pushDiagnostic: params.pushDiagnostic
			});
			return;
		}
		const methodId = normalizeText(onboarding.methodId);
		if (methodId && !hasMethod(methodId)) pushProviderDiagnostic({
			level: "warn",
			pluginId: params.pluginId,
			source: params.source,
			message: `provider "${params.providerId}" onboarding method "${methodId}" not found; falling back to available methods`,
			pushDiagnostic: params.pushDiagnostic
		});
		return {
			...normalizeText(onboarding.choiceId) ? { choiceId: normalizeText(onboarding.choiceId) } : {},
			...normalizeText(onboarding.choiceLabel) ? { choiceLabel: normalizeText(onboarding.choiceLabel) } : {},
			...normalizeText(onboarding.choiceHint) ? { choiceHint: normalizeText(onboarding.choiceHint) } : {},
			...normalizeText(onboarding.groupId) ? { groupId: normalizeText(onboarding.groupId) } : {},
			...normalizeText(onboarding.groupLabel) ? { groupLabel: normalizeText(onboarding.groupLabel) } : {},
			...normalizeText(onboarding.groupHint) ? { groupHint: normalizeText(onboarding.groupHint) } : {},
			...methodId && hasMethod(methodId) ? { methodId } : {}
		};
	};
	const normalizeModelPicker = () => {
		const modelPicker = params.wizard?.modelPicker;
		if (!modelPicker) return;
		if (!hasAuthMethods) {
			pushProviderDiagnostic({
				level: "warn",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" model-picker metadata ignored because it has no auth methods`,
				pushDiagnostic: params.pushDiagnostic
			});
			return;
		}
		const methodId = normalizeText(modelPicker.methodId);
		if (methodId && !hasMethod(methodId)) pushProviderDiagnostic({
			level: "warn",
			pluginId: params.pluginId,
			source: params.source,
			message: `provider "${params.providerId}" model-picker method "${methodId}" not found; falling back to available methods`,
			pushDiagnostic: params.pushDiagnostic
		});
		return {
			...normalizeText(modelPicker.label) ? { label: normalizeText(modelPicker.label) } : {},
			...normalizeText(modelPicker.hint) ? { hint: normalizeText(modelPicker.hint) } : {},
			...methodId && hasMethod(methodId) ? { methodId } : {}
		};
	};
	const onboarding = normalizeOnboarding();
	const modelPicker = normalizeModelPicker();
	if (!onboarding && !modelPicker) return;
	return {
		...onboarding ? { onboarding } : {},
		...modelPicker ? { modelPicker } : {}
	};
}
function normalizeRegisteredProvider(params) {
	const id = normalizeText(params.provider.id);
	if (!id) {
		pushProviderDiagnostic({
			level: "error",
			pluginId: params.pluginId,
			source: params.source,
			message: "provider registration missing id",
			pushDiagnostic: params.pushDiagnostic
		});
		return null;
	}
	const auth = normalizeProviderAuthMethods({
		providerId: id,
		pluginId: params.pluginId,
		source: params.source,
		auth: params.provider.auth ?? [],
		pushDiagnostic: params.pushDiagnostic
	});
	const docsPath = normalizeText(params.provider.docsPath);
	const aliases = normalizeTextList(params.provider.aliases);
	const envVars = normalizeTextList(params.provider.envVars);
	const wizard = normalizeProviderWizard({
		providerId: id,
		pluginId: params.pluginId,
		source: params.source,
		auth,
		wizard: params.provider.wizard,
		pushDiagnostic: params.pushDiagnostic
	});
	const { wizard: _ignoredWizard, docsPath: _ignoredDocsPath, aliases: _ignoredAliases, envVars: _ignoredEnvVars, ...restProvider } = params.provider;
	return {
		...restProvider,
		id,
		label: normalizeText(params.provider.label) ?? id,
		...docsPath ? { docsPath } : {},
		...aliases ? { aliases } : {},
		...envVars ? { envVars } : {},
		auth,
		...wizard ? { wizard } : {}
	};
}
const pluginHookNameSet = new Set([
	"before_model_resolve",
	"before_prompt_build",
	"before_agent_start",
	"llm_input",
	"llm_output",
	"agent_end",
	"before_compaction",
	"after_compaction",
	"before_reset",
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
	"gateway_stop"
]);
const isPluginHookName = (hookName) => typeof hookName === "string" && pluginHookNameSet.has(hookName);
const promptInjectionHookNameSet = new Set(["before_prompt_build", "before_agent_start"]);
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
//#endregion
//#region src/plugins/registry.ts
const constrainLegacyPromptInjectionHook = (handler) => {
	return (event, ctx) => {
		const result = handler(event, ctx);
		if (result && typeof result === "object" && "then" in result) return Promise.resolve(result).then((resolved) => stripPromptMutationFieldsFromLegacyHookResult(resolved));
		return stripPromptMutationFieldsFromLegacyHookResult(result);
	};
};
function createEmptyPluginRegistry() {
	return {
		plugins: [],
		tools: [],
		hooks: [],
		typedHooks: [],
		channels: [],
		providers: [],
		gatewayHandlers: {},
		httpRoutes: [],
		cliRegistrars: [],
		services: [],
		commands: [],
		diagnostics: []
	};
}
function createPluginRegistry(registryParams) {
	const registry = createEmptyPluginRegistry();
	const coreGatewayMethods = new Set(Object.keys(registryParams.coreGatewayHandlers ?? {}));
	const pushDiagnostic = (diag) => {
		registry.diagnostics.push(diag);
	};
	const registerTool = (record, tool, opts) => {
		const names = opts?.names ?? (opts?.name ? [opts.name] : []);
		const optional = opts?.optional === true;
		const factory = typeof tool === "function" ? tool : (_ctx) => tool;
		if (typeof tool !== "function") names.push(tool.name);
		const normalized = names.map((name) => name.trim()).filter(Boolean);
		if (normalized.length > 0) record.toolNames.push(...normalized);
		registry.tools.push({
			pluginId: record.id,
			factory,
			names: normalized,
			optional,
			source: record.source
		});
	};
	const registerHook = (record, events, handler, opts, config) => {
		const normalizedEvents = (Array.isArray(events) ? events : [events]).map((event) => event.trim()).filter(Boolean);
		const entry = opts?.entry ?? null;
		const name = entry?.hook.name ?? opts?.name?.trim();
		if (!name) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: "hook registration missing name"
			});
			return;
		}
		const description = entry?.hook.description ?? opts?.description ?? "";
		const hookEntry = entry ? {
			...entry,
			hook: {
				...entry.hook,
				name,
				description,
				source: "openclaw-plugin",
				pluginId: record.id
			},
			metadata: {
				...entry.metadata,
				events: normalizedEvents
			}
		} : {
			hook: {
				name,
				description,
				source: "openclaw-plugin",
				pluginId: record.id,
				filePath: record.source,
				baseDir: path.dirname(record.source),
				handlerPath: record.source
			},
			frontmatter: {},
			metadata: { events: normalizedEvents },
			invocation: { enabled: true }
		};
		record.hookNames.push(name);
		registry.hooks.push({
			pluginId: record.id,
			entry: hookEntry,
			events: normalizedEvents,
			source: record.source
		});
		if (!(config?.hooks?.internal?.enabled === true) || opts?.register === false) return;
		for (const event of normalizedEvents) registerInternalHook(event, handler);
	};
	const registerGatewayMethod = (record, method, handler) => {
		const trimmed = method.trim();
		if (!trimmed) return;
		if (coreGatewayMethods.has(trimmed) || registry.gatewayHandlers[trimmed]) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `gateway method already registered: ${trimmed}`
			});
			return;
		}
		registry.gatewayHandlers[trimmed] = handler;
		record.gatewayMethods.push(trimmed);
	};
	const describeHttpRouteOwner = (entry) => {
		return `${entry.pluginId?.trim() || "unknown-plugin"} (${entry.source?.trim() || "unknown-source"})`;
	};
	const registerHttpRoute = (record, params) => {
		const normalizedPath = normalizePluginHttpPath(params.path);
		if (!normalizedPath) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: "http route registration missing path"
			});
			return;
		}
		if (params.auth !== "gateway" && params.auth !== "plugin") {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `http route registration missing or invalid auth: ${normalizedPath}`
			});
			return;
		}
		const match = params.match ?? "exact";
		const overlappingRoute = findOverlappingPluginHttpRoute(registry.httpRoutes, {
			path: normalizedPath,
			match
		});
		if (overlappingRoute && overlappingRoute.auth !== params.auth) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `http route overlap rejected: ${normalizedPath} (${match}, ${params.auth}) overlaps ${overlappingRoute.path} (${overlappingRoute.match}, ${overlappingRoute.auth}) owned by ${describeHttpRouteOwner(overlappingRoute)}`
			});
			return;
		}
		const existingIndex = registry.httpRoutes.findIndex((entry) => entry.path === normalizedPath && entry.match === match);
		if (existingIndex >= 0) {
			const existing = registry.httpRoutes[existingIndex];
			if (!existing) return;
			if (!params.replaceExisting) {
				pushDiagnostic({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: `http route already registered: ${normalizedPath} (${match}) by ${describeHttpRouteOwner(existing)}`
				});
				return;
			}
			if (existing.pluginId && existing.pluginId !== record.id) {
				pushDiagnostic({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: `http route replacement rejected: ${normalizedPath} (${match}) owned by ${describeHttpRouteOwner(existing)}`
				});
				return;
			}
			registry.httpRoutes[existingIndex] = {
				pluginId: record.id,
				path: normalizedPath,
				handler: params.handler,
				auth: params.auth,
				match,
				source: record.source
			};
			return;
		}
		record.httpRoutes += 1;
		registry.httpRoutes.push({
			pluginId: record.id,
			path: normalizedPath,
			handler: params.handler,
			auth: params.auth,
			match,
			source: record.source
		});
	};
	const registerChannel = (record, registration) => {
		const normalized = typeof registration.plugin === "object" ? registration : { plugin: registration };
		const plugin = normalized.plugin;
		const id = typeof plugin?.id === "string" ? plugin.id.trim() : String(plugin?.id ?? "").trim();
		if (!id) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "channel registration missing id"
			});
			return;
		}
		const existing = registry.channels.find((entry) => entry.plugin.id === id);
		if (existing) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `channel already registered: ${id} (${existing.pluginId})`
			});
			return;
		}
		record.channelIds.push(id);
		registry.channels.push({
			pluginId: record.id,
			plugin,
			dock: normalized.dock,
			source: record.source
		});
	};
	const registerProvider = (record, provider) => {
		const normalizedProvider = normalizeRegisteredProvider({
			pluginId: record.id,
			source: record.source,
			provider,
			pushDiagnostic
		});
		if (!normalizedProvider) return;
		const id = normalizedProvider.id;
		const existing = registry.providers.find((entry) => entry.provider.id === id);
		if (existing) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `provider already registered: ${id} (${existing.pluginId})`
			});
			return;
		}
		record.providerIds.push(id);
		registry.providers.push({
			pluginId: record.id,
			provider: normalizedProvider,
			source: record.source
		});
	};
	const registerCli = (record, registrar, opts) => {
		const commands = (opts?.commands ?? []).map((cmd) => cmd.trim()).filter(Boolean);
		record.cliCommands.push(...commands);
		registry.cliRegistrars.push({
			pluginId: record.id,
			register: registrar,
			commands,
			source: record.source
		});
	};
	const registerService = (record, service) => {
		const id = service.id.trim();
		if (!id) return;
		record.services.push(id);
		registry.services.push({
			pluginId: record.id,
			service,
			source: record.source
		});
	};
	const registerCommand = (record, command) => {
		const name = command.name.trim();
		if (!name) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "command registration missing name"
			});
			return;
		}
		const result = registerPluginCommand(record.id, command);
		if (!result.ok) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `command registration failed: ${result.error}`
			});
			return;
		}
		record.commands.push(name);
		registry.commands.push({
			pluginId: record.id,
			command,
			source: record.source
		});
	};
	const registerTypedHook = (record, hookName, handler, opts, policy) => {
		if (!isPluginHookName(hookName)) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: `unknown typed hook "${String(hookName)}" ignored`
			});
			return;
		}
		let effectiveHandler = handler;
		if (policy?.allowPromptInjection === false && isPromptInjectionHookName(hookName)) {
			if (hookName === "before_prompt_build") {
				pushDiagnostic({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `typed hook "${hookName}" blocked by plugins.entries.${record.id}.hooks.allowPromptInjection=false`
				});
				return;
			}
			if (hookName === "before_agent_start") {
				pushDiagnostic({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `typed hook "${hookName}" prompt fields constrained by plugins.entries.${record.id}.hooks.allowPromptInjection=false`
				});
				effectiveHandler = constrainLegacyPromptInjectionHook(handler);
			}
		}
		record.hookCount += 1;
		registry.typedHooks.push({
			pluginId: record.id,
			hookName,
			handler: effectiveHandler,
			priority: opts?.priority,
			source: record.source
		});
	};
	const normalizeLogger = (logger) => ({
		info: logger.info,
		warn: logger.warn,
		error: logger.error,
		debug: logger.debug
	});
	const createApi = (record, params) => {
		return {
			id: record.id,
			name: record.name,
			version: record.version,
			description: record.description,
			source: record.source,
			config: params.config,
			pluginConfig: params.pluginConfig,
			runtime: registryParams.runtime,
			logger: normalizeLogger(registryParams.logger),
			registerTool: (tool, opts) => registerTool(record, tool, opts),
			registerHook: (events, handler, opts) => registerHook(record, events, handler, opts, params.config),
			registerHttpRoute: (params) => registerHttpRoute(record, params),
			registerChannel: (registration) => registerChannel(record, registration),
			registerProvider: (provider) => registerProvider(record, provider),
			registerGatewayMethod: (method, handler) => registerGatewayMethod(record, method, handler),
			registerCli: (registrar, opts) => registerCli(record, registrar, opts),
			registerService: (service) => registerService(record, service),
			registerCommand: (command) => registerCommand(record, command),
			registerContextEngine: (id, factory) => registerContextEngine(id, factory),
			resolvePath: (input) => resolveUserPath(input),
			on: (hookName, handler, opts) => registerTypedHook(record, hookName, handler, opts, params.hookPolicy)
		};
	};
	return {
		registry,
		createApi,
		pushDiagnostic,
		registerTool,
		registerChannel,
		registerProvider,
		registerGatewayMethod,
		registerCli,
		registerService,
		registerCommand,
		registerHook,
		registerTypedHook
	};
}
//#endregion
//#region src/plugins/runtime.ts
const REGISTRY_STATE = Symbol.for("openclaw.pluginRegistryState");
const state = (() => {
	const globalState = globalThis;
	if (!globalState[REGISTRY_STATE]) globalState[REGISTRY_STATE] = {
		registry: createEmptyPluginRegistry(),
		key: null,
		version: 0
	};
	return globalState[REGISTRY_STATE];
})();
function setActivePluginRegistry(registry, cacheKey) {
	state.registry = registry;
	state.key = cacheKey ?? null;
	state.version += 1;
}
function getActivePluginRegistry() {
	return state.registry;
}
function requireActivePluginRegistry() {
	if (!state.registry) {
		state.registry = createEmptyPluginRegistry();
		state.version += 1;
	}
	return state.registry;
}
function getActivePluginRegistryKey() {
	return state.key;
}
function getActivePluginRegistryVersion() {
	return state.version;
}
//#endregion
//#region src/plugins/http-registry.ts
function registerPluginHttpRoute(params) {
	const registry = params.registry ?? requireActivePluginRegistry();
	const routes = registry.httpRoutes ?? [];
	registry.httpRoutes = routes;
	const normalizedPath = normalizePluginHttpPath(params.path, params.fallbackPath);
	const suffix = params.accountId ? ` for account "${params.accountId}"` : "";
	if (!normalizedPath) {
		params.log?.(`plugin: webhook path missing${suffix}`);
		return () => {};
	}
	const routeMatch = params.match ?? "exact";
	const overlappingRoute = findOverlappingPluginHttpRoute(routes, {
		path: normalizedPath,
		match: routeMatch
	});
	if (overlappingRoute && overlappingRoute.auth !== params.auth) {
		params.log?.(`plugin: route overlap denied at ${normalizedPath} (${routeMatch}, ${params.auth})${suffix}; overlaps ${overlappingRoute.path} (${overlappingRoute.match}, ${overlappingRoute.auth}) owned by ${overlappingRoute.pluginId ?? "unknown-plugin"} (${overlappingRoute.source ?? "unknown-source"})`);
		return () => {};
	}
	const existingIndex = routes.findIndex((entry) => entry.path === normalizedPath && entry.match === routeMatch);
	if (existingIndex >= 0) {
		const existing = routes[existingIndex];
		if (!existing) return () => {};
		if (!params.replaceExisting) {
			params.log?.(`plugin: route conflict at ${normalizedPath} (${routeMatch})${suffix}; owned by ${existing.pluginId ?? "unknown-plugin"} (${existing.source ?? "unknown-source"})`);
			return () => {};
		}
		if (existing.pluginId && params.pluginId && existing.pluginId !== params.pluginId) {
			params.log?.(`plugin: route replacement denied for ${normalizedPath} (${routeMatch})${suffix}; owned by ${existing.pluginId}`);
			return () => {};
		}
		const pluginHint = params.pluginId ? ` (${params.pluginId})` : "";
		params.log?.(`plugin: replacing stale webhook path ${normalizedPath} (${routeMatch})${suffix}${pluginHint}`);
		routes.splice(existingIndex, 1);
	}
	const entry = {
		path: normalizedPath,
		handler: params.handler,
		auth: params.auth,
		match: routeMatch,
		pluginId: params.pluginId,
		source: params.source
	};
	routes.push(entry);
	return () => {
		const index = routes.indexOf(entry);
		if (index >= 0) routes.splice(index, 1);
	};
}
//#endregion
export { resolveContextEngine as _, requireActivePluginRegistry as a, normalizePluginHttpPath as c, getPluginCommandSpecs as d, listPluginCommands as f, registerContextEngine as g, triggerInternalHook as h, getActivePluginRegistryVersion as i, clearPluginCommands as l, createInternalHookEvent as m, getActivePluginRegistry as n, setActivePluginRegistry as o, matchPluginCommand as p, getActivePluginRegistryKey as r, createPluginRegistry as s, registerPluginHttpRoute as t, executePluginCommand as u, defaultSlotIdForKey as v };
