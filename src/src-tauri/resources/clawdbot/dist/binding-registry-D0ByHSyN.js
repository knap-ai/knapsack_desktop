import { _ as normalizeAccountId, f as sanitizeAgentId, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { i as resolveAgentConfig, m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { n as getActivePluginChannelRegistryVersion } from "./runtime-DZz1f0_h.js";
import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { r as listConfiguredBindings } from "./bindings-DwYMv--S.js";
import { r as pickFirstExistingAgentId } from "./resolve-route-DID7K3Jm.js";
import { createHash } from "node:crypto";
//#region src/acp/persistent-bindings.types.ts
function normalizeText(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeMode(value) {
	return normalizeText(value)?.toLowerCase() === "oneshot" ? "oneshot" : "persistent";
}
function normalizeBindingConfig(raw) {
	if (!raw || typeof raw !== "object") return {};
	const shape = raw;
	const mode = normalizeText(shape.mode);
	return {
		mode: mode ? normalizeMode(mode) : void 0,
		cwd: normalizeText(shape.cwd),
		backend: normalizeText(shape.backend),
		label: normalizeText(shape.label)
	};
}
function buildBindingHash(params) {
	return createHash("sha256").update(`${params.channel}:${params.accountId}:${params.conversationId}`).digest("hex").slice(0, 16);
}
function buildConfiguredAcpSessionKey(spec) {
	const hash = buildBindingHash({
		channel: spec.channel,
		accountId: spec.accountId,
		conversationId: spec.conversationId
	});
	return `agent:${sanitizeAgentId(spec.agentId)}:acp:binding:${spec.channel}:${spec.accountId}:${hash}`;
}
function toConfiguredAcpBindingRecord(spec) {
	return {
		bindingId: `config:acp:${spec.channel}:${spec.accountId}:${spec.conversationId}`,
		targetSessionKey: buildConfiguredAcpSessionKey(spec),
		targetKind: "session",
		conversation: {
			channel: spec.channel,
			accountId: spec.accountId,
			conversationId: spec.conversationId,
			parentConversationId: spec.parentConversationId
		},
		status: "active",
		boundAt: 0,
		metadata: {
			source: "config",
			mode: spec.mode,
			agentId: spec.agentId,
			...spec.acpAgentId ? { acpAgentId: spec.acpAgentId } : {},
			label: spec.label,
			...spec.backend ? { backend: spec.backend } : {},
			...spec.cwd ? { cwd: spec.cwd } : {}
		}
	};
}
function parseConfiguredAcpSessionKey(sessionKey) {
	const trimmed = sessionKey.trim();
	if (!trimmed.startsWith("agent:")) return null;
	const rest = trimmed.slice(trimmed.indexOf(":") + 1);
	const nextSeparator = rest.indexOf(":");
	if (nextSeparator === -1) return null;
	const tokens = rest.slice(nextSeparator + 1).split(":");
	if (tokens.length !== 5 || tokens[0] !== "acp" || tokens[1] !== "binding") return null;
	const channel = tokens[2]?.trim().toLowerCase();
	if (!channel) return null;
	return {
		channel,
		accountId: normalizeAccountId(tokens[3] ?? "default")
	};
}
function resolveConfiguredAcpBindingSpecFromRecord(record) {
	if (record.targetKind !== "session") return null;
	const conversationId = record.conversation.conversationId.trim();
	if (!conversationId) return null;
	const agentId = normalizeText(record.metadata?.agentId) ?? resolveAgentIdFromSessionKey(record.targetSessionKey);
	if (!agentId) return null;
	return {
		channel: record.conversation.channel,
		accountId: normalizeAccountId(record.conversation.accountId),
		conversationId,
		parentConversationId: normalizeText(record.conversation.parentConversationId),
		agentId,
		acpAgentId: normalizeText(record.metadata?.acpAgentId),
		mode: normalizeMode(record.metadata?.mode),
		cwd: normalizeText(record.metadata?.cwd),
		backend: normalizeText(record.metadata?.backend),
		label: normalizeText(record.metadata?.label)
	};
}
function toResolvedConfiguredAcpBinding(record) {
	const spec = resolveConfiguredAcpBindingSpecFromRecord(record);
	if (!spec) return null;
	return {
		spec,
		record
	};
}
//#endregion
//#region src/channels/plugins/acp-configured-binding-consumer.ts
function resolveAgentRuntimeAcpDefaults(params) {
	const agent = params.cfg.agents?.list?.find((entry) => entry.id?.trim().toLowerCase() === params.ownerAgentId.toLowerCase());
	if (!agent || agent.runtime?.type !== "acp") return {};
	return {
		acpAgentId: normalizeText(agent.runtime.acp?.agent),
		mode: normalizeText(agent.runtime.acp?.mode),
		cwd: normalizeText(agent.runtime.acp?.cwd),
		backend: normalizeText(agent.runtime.acp?.backend)
	};
}
function resolveConfiguredBindingWorkspaceCwd(params) {
	if (normalizeText(resolveAgentConfig(params.cfg, params.agentId)?.workspace)) return resolveAgentWorkspaceDir(params.cfg, params.agentId);
	if (params.agentId === resolveDefaultAgentId(params.cfg)) {
		if (normalizeText(params.cfg.agents?.defaults?.workspace)) return resolveAgentWorkspaceDir(params.cfg, params.agentId);
	}
}
function buildConfiguredAcpSpec(params) {
	return {
		channel: params.channel,
		accountId: params.accountId,
		conversationId: params.conversation.conversationId,
		parentConversationId: params.conversation.parentConversationId,
		agentId: params.agentId,
		acpAgentId: params.acpAgentId,
		mode: params.mode,
		cwd: params.cwd,
		backend: params.backend,
		label: params.label
	};
}
function buildAcpTargetFactory(params) {
	if (params.binding.type !== "acp") return null;
	const runtimeDefaults = resolveAgentRuntimeAcpDefaults({
		cfg: params.cfg,
		ownerAgentId: params.agentId
	});
	const bindingOverrides = normalizeBindingConfig(params.binding.acp);
	const mode = normalizeMode(bindingOverrides.mode ?? runtimeDefaults.mode);
	const cwd = bindingOverrides.cwd ?? runtimeDefaults.cwd ?? resolveConfiguredBindingWorkspaceCwd({
		cfg: params.cfg,
		agentId: params.agentId
	});
	const backend = bindingOverrides.backend ?? runtimeDefaults.backend;
	const label = bindingOverrides.label;
	const acpAgentId = normalizeText(runtimeDefaults.acpAgentId);
	return {
		driverId: "acp",
		materialize: ({ accountId, conversation }) => {
			const spec = buildConfiguredAcpSpec({
				channel: params.channel,
				accountId,
				conversation,
				agentId: params.agentId,
				acpAgentId,
				mode,
				cwd,
				backend,
				label
			});
			return {
				record: toConfiguredAcpBindingRecord(spec),
				statefulTarget: {
					kind: "stateful",
					driverId: "acp",
					sessionKey: buildConfiguredAcpSessionKey(spec),
					agentId: params.agentId,
					...label ? { label } : {}
				}
			};
		}
	};
}
const acpConfiguredBindingConsumer = {
	id: "acp",
	supports: (binding) => binding.type === "acp",
	buildTargetFactory: (params) => buildAcpTargetFactory({
		cfg: params.cfg,
		binding: params.binding,
		channel: params.channel,
		agentId: params.agentId
	}),
	parseSessionKey: ({ sessionKey }) => parseConfiguredAcpSessionKey(sessionKey),
	matchesSessionKey: ({ sessionKey, materializedTarget }) => materializedTarget.record.targetSessionKey === sessionKey
};
//#endregion
//#region src/channels/plugins/configured-binding-consumers.ts
const registeredConfiguredBindingConsumers = /* @__PURE__ */ new Map();
function listConfiguredBindingConsumers() {
	return [...registeredConfiguredBindingConsumers.values()];
}
function resolveConfiguredBindingConsumer(binding) {
	for (const consumer of listConfiguredBindingConsumers()) if (consumer.supports(binding)) return consumer;
	return null;
}
function registerConfiguredBindingConsumer(consumer) {
	const id = consumer.id.trim();
	if (!id) throw new Error("Configured binding consumer id is required");
	if (registeredConfiguredBindingConsumers.get(id)) return;
	registeredConfiguredBindingConsumers.set(id, {
		...consumer,
		id
	});
}
//#endregion
//#region src/channels/plugins/configured-binding-builtins.ts
function ensureConfiguredBindingBuiltinsRegistered() {
	registerConfiguredBindingConsumer(acpConfiguredBindingConsumer);
}
//#endregion
//#region src/channels/plugins/binding-provider.ts
function resolveChannelConfiguredBindingProvider(plugin) {
	return plugin?.bindings;
}
//#endregion
//#region src/channels/plugins/configured-binding-compiler.ts
const compiledRegistryCache = /* @__PURE__ */ new WeakMap();
function resolveLoadedChannelPlugin(channel) {
	const normalized = channel.trim().toLowerCase();
	if (!normalized) return;
	return getChannelPlugin(normalized);
}
function resolveConfiguredBindingAdapter(channel) {
	const normalized = channel.trim().toLowerCase();
	if (!normalized) return null;
	const plugin = resolveLoadedChannelPlugin(normalized);
	const provider = resolveChannelConfiguredBindingProvider(plugin);
	if (!plugin || !provider || !provider.compileConfiguredBinding || !provider.matchInboundConversation) return null;
	return {
		channel: plugin.id,
		provider
	};
}
function resolveBindingConversationId(binding) {
	const id = binding.match?.peer?.id?.trim();
	return id ? id : null;
}
function compileConfiguredBindingTarget(params) {
	return params.provider.compileConfiguredBinding({
		binding: params.binding,
		conversationId: params.conversationId
	});
}
function compileConfiguredBindingRule(params) {
	const agentId = pickFirstExistingAgentId(params.cfg, params.binding.agentId ?? "main");
	const consumer = resolveConfiguredBindingConsumer(params.binding);
	if (!consumer) return null;
	const targetFactory = consumer.buildTargetFactory({
		cfg: params.cfg,
		binding: params.binding,
		channel: params.channel,
		agentId,
		target: params.target,
		bindingConversationId: params.bindingConversationId
	});
	if (!targetFactory) return null;
	return {
		channel: params.channel,
		accountPattern: params.binding.match.accountId?.trim() || void 0,
		binding: params.binding,
		bindingConversationId: params.bindingConversationId,
		target: params.target,
		agentId,
		provider: params.provider,
		targetFactory
	};
}
function pushCompiledRule(target, rule) {
	const existing = target.get(rule.channel);
	if (existing) {
		existing.push(rule);
		return;
	}
	target.set(rule.channel, [rule]);
}
function compileConfiguredBindingRegistry(params) {
	const rulesByChannel = /* @__PURE__ */ new Map();
	for (const binding of listConfiguredBindings(params.cfg)) {
		const bindingConversationId = resolveBindingConversationId(binding);
		if (!bindingConversationId) continue;
		const resolvedChannel = resolveConfiguredBindingAdapter(binding.match.channel);
		if (!resolvedChannel) continue;
		const target = compileConfiguredBindingTarget({
			provider: resolvedChannel.provider,
			binding,
			conversationId: bindingConversationId
		});
		if (!target) continue;
		const rule = compileConfiguredBindingRule({
			cfg: params.cfg,
			channel: resolvedChannel.channel,
			binding,
			target,
			bindingConversationId,
			provider: resolvedChannel.provider
		});
		if (!rule) continue;
		pushCompiledRule(rulesByChannel, rule);
	}
	return { rulesByChannel };
}
function resolveCompiledBindingRegistry(cfg) {
	const registryVersion = getActivePluginChannelRegistryVersion();
	const cached = compiledRegistryCache.get(cfg);
	if (cached?.registryVersion === registryVersion) return cached.registry;
	const registry = compileConfiguredBindingRegistry({ cfg });
	compiledRegistryCache.set(cfg, {
		registryVersion,
		registry
	});
	return registry;
}
function primeCompiledBindingRegistry(cfg) {
	const registry = compileConfiguredBindingRegistry({ cfg });
	compiledRegistryCache.set(cfg, {
		registryVersion: getActivePluginChannelRegistryVersion(),
		registry
	});
	return registry;
}
function countCompiledBindingRegistry(registry) {
	return {
		bindingCount: [...registry.rulesByChannel.values()].reduce((sum, rules) => sum + rules.length, 0),
		channelCount: registry.rulesByChannel.size
	};
}
//#endregion
//#region src/channels/plugins/configured-binding-match.ts
function resolveAccountMatchPriority(match, actual) {
	const trimmed = (match ?? "").trim();
	if (!trimmed) return actual === "default" ? 2 : 0;
	if (trimmed === "*") return 1;
	return normalizeAccountId(trimmed) === actual ? 2 : 0;
}
function matchCompiledBindingConversation(params) {
	return params.rule.provider.matchInboundConversation({
		binding: params.rule.binding,
		compiledBinding: params.rule.target,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	});
}
function resolveCompiledBindingChannel(raw) {
	const normalized = raw.trim().toLowerCase();
	return normalized ? normalized : null;
}
function toConfiguredBindingConversationRef(conversation) {
	const channel = resolveCompiledBindingChannel(conversation.channel);
	const conversationId = conversation.conversationId.trim();
	if (!channel || !conversationId) return null;
	return {
		channel,
		accountId: normalizeAccountId(conversation.accountId),
		conversationId,
		parentConversationId: conversation.parentConversationId?.trim() || void 0
	};
}
function materializeConfiguredBindingRecord(params) {
	return params.rule.targetFactory.materialize({
		accountId: normalizeAccountId(params.accountId),
		conversation: params.conversation
	});
}
function resolveMatchingConfiguredBinding(params) {
	if (!params.conversation) return null;
	let wildcardMatch = null;
	let exactMatch = null;
	for (const rule of params.rules) {
		const accountMatchPriority = resolveAccountMatchPriority(rule.accountPattern, params.conversation.accountId);
		if (accountMatchPriority === 0) continue;
		const match = matchCompiledBindingConversation({
			rule,
			conversationId: params.conversation.conversationId,
			parentConversationId: params.conversation.parentConversationId
		});
		if (!match) continue;
		const matchPriority = match.matchPriority ?? 0;
		if (accountMatchPriority === 2) {
			if (!exactMatch || matchPriority > (exactMatch.match.matchPriority ?? 0)) exactMatch = {
				rule,
				match
			};
			continue;
		}
		if (!wildcardMatch || matchPriority > (wildcardMatch.match.matchPriority ?? 0)) wildcardMatch = {
			rule,
			match
		};
	}
	return exactMatch ?? wildcardMatch;
}
//#endregion
//#region src/channels/plugins/configured-binding-session-lookup.ts
function resolveConfiguredBindingRecordBySessionKeyFromRegistry(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return null;
	for (const consumer of listConfiguredBindingConsumers()) {
		const parsed = consumer.parseSessionKey?.({ sessionKey });
		if (!parsed) continue;
		const channel = resolveCompiledBindingChannel(parsed.channel);
		if (!channel) continue;
		const rules = params.registry.rulesByChannel.get(channel);
		if (!rules || rules.length === 0) continue;
		let wildcardMatch = null;
		let exactMatch = null;
		for (const rule of rules) {
			if (rule.targetFactory.driverId !== consumer.id) continue;
			const accountMatchPriority = resolveAccountMatchPriority(rule.accountPattern, parsed.accountId);
			if (accountMatchPriority === 0) continue;
			const materializedTarget = materializeConfiguredBindingRecord({
				rule,
				accountId: parsed.accountId,
				conversation: rule.target
			});
			if (consumer.matchesSessionKey?.({
				sessionKey,
				compiledBinding: rule,
				accountId: parsed.accountId,
				materializedTarget
			}) ?? materializedTarget.record.targetSessionKey === sessionKey) {
				if (accountMatchPriority === 2) {
					exactMatch = materializedTarget;
					break;
				}
				wildcardMatch = materializedTarget;
			}
		}
		if (exactMatch) return exactMatch;
		if (wildcardMatch) return wildcardMatch;
	}
	return null;
}
//#endregion
//#region src/channels/plugins/configured-binding-registry.ts
function resolveMaterializedConfiguredBinding(params) {
	const conversation = toConfiguredBindingConversationRef(params.conversation);
	if (!conversation) return null;
	const rules = resolveCompiledBindingRegistry(params.cfg).rulesByChannel.get(conversation.channel);
	if (!rules || rules.length === 0) return null;
	const resolved = resolveMatchingConfiguredBinding({
		rules,
		conversation
	});
	if (!resolved) return null;
	return {
		conversation,
		resolved,
		materializedTarget: materializeConfiguredBindingRecord({
			rule: resolved.rule,
			accountId: conversation.accountId,
			conversation: resolved.match
		})
	};
}
function primeConfiguredBindingRegistry$1(params) {
	return countCompiledBindingRegistry(primeCompiledBindingRegistry(params.cfg));
}
function resolveConfiguredBindingRecord$1(params) {
	const conversation = toConfiguredBindingConversationRef({
		channel: params.channel,
		accountId: params.accountId,
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	});
	if (!conversation) return null;
	return resolveConfiguredBindingRecordForConversation$1({
		cfg: params.cfg,
		conversation
	});
}
function resolveConfiguredBindingRecordForConversation$1(params) {
	const resolved = resolveMaterializedConfiguredBinding(params);
	if (!resolved) return null;
	return resolved.materializedTarget;
}
function resolveConfiguredBinding$1(params) {
	const resolved = resolveMaterializedConfiguredBinding(params);
	if (!resolved) return null;
	return {
		conversation: resolved.conversation,
		compiledBinding: resolved.resolved.rule,
		match: resolved.resolved.match,
		...resolved.materializedTarget
	};
}
function resolveConfiguredBindingRecordBySessionKey$1(params) {
	return resolveConfiguredBindingRecordBySessionKeyFromRegistry({
		registry: resolveCompiledBindingRegistry(params.cfg),
		sessionKey: params.sessionKey
	});
}
//#endregion
//#region src/channels/plugins/binding-registry.ts
function primeConfiguredBindingRegistry(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return primeConfiguredBindingRegistry$1(...args);
}
function resolveConfiguredBindingRecord(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBindingRecord$1(...args);
}
function resolveConfiguredBindingRecordForConversation(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBindingRecordForConversation$1(...args);
}
function resolveConfiguredBinding(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBinding$1(...args);
}
function resolveConfiguredBindingRecordBySessionKey(...args) {
	ensureConfiguredBindingBuiltinsRegistered();
	return resolveConfiguredBindingRecordBySessionKey$1(...args);
}
//#endregion
export { resolveConfiguredBindingRecordForConversation as a, normalizeText as c, resolveConfiguredBindingRecordBySessionKey as i, resolveConfiguredAcpBindingSpecFromRecord as l, resolveConfiguredBinding as n, buildConfiguredAcpSessionKey as o, resolveConfiguredBindingRecord as r, normalizeBindingConfig as s, primeConfiguredBindingRegistry as t, toResolvedConfiguredAcpBinding as u };
