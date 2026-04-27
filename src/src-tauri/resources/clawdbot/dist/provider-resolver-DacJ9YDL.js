import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { n as resolvePluginCapabilityProviders } from "./capability-provider-runtime-DlsoCSX1.js";
import { n as normalizeCapabilityProviderId, t as buildCapabilityProviderMaps } from "./provider-registry-shared-CLcF4ZRQ.js";
import { t as resolveConfiguredCapabilityProvider } from "./provider-selection-runtime-BEJ-O7-c.js";
//#region src/realtime-voice/agent-consult-tool.ts
const REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME = "openclaw_agent_consult";
const REALTIME_VOICE_AGENT_CONSULT_TOOL_POLICIES = [
	"safe-read-only",
	"owner",
	"none"
];
const REALTIME_VOICE_AGENT_CONSULT_TOOL = {
	type: "function",
	name: REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME,
	description: "Ask the full OpenClaw agent for deeper reasoning, current information, or tool-backed help before speaking.",
	parameters: {
		type: "object",
		properties: {
			question: {
				type: "string",
				description: "The concrete question or task the user asked."
			},
			context: {
				type: "string",
				description: "Optional relevant context or transcript summary."
			},
			responseStyle: {
				type: "string",
				description: "Optional style hint for the spoken answer."
			}
		},
		required: ["question"]
	}
};
const SAFE_READ_ONLY_TOOLS = [
	"read",
	"web_search",
	"web_fetch",
	"x_search",
	"memory_search",
	"memory_get"
];
function isRealtimeVoiceAgentConsultToolPolicy(value) {
	return typeof value === "string" && REALTIME_VOICE_AGENT_CONSULT_TOOL_POLICIES.includes(value);
}
function resolveRealtimeVoiceAgentConsultToolPolicy(value, fallback) {
	const normalized = normalizeOptionalLowercaseString(value);
	return isRealtimeVoiceAgentConsultToolPolicy(normalized) ? normalized : fallback;
}
function resolveRealtimeVoiceAgentConsultTools(policy, customTools = []) {
	const tools = /* @__PURE__ */ new Map();
	if (policy !== "none") tools.set(REALTIME_VOICE_AGENT_CONSULT_TOOL.name, REALTIME_VOICE_AGENT_CONSULT_TOOL);
	for (const tool of customTools) if (!tools.has(tool.name)) tools.set(tool.name, tool);
	return [...tools.values()];
}
function resolveRealtimeVoiceAgentConsultToolsAllow(policy) {
	if (policy === "owner") return;
	if (policy === "safe-read-only") return [...SAFE_READ_ONLY_TOOLS];
	return [];
}
function parseRealtimeVoiceAgentConsultArgs(args) {
	const question = readConsultStringArg(args, "question");
	if (!question) throw new Error("question required");
	return {
		question,
		context: readConsultStringArg(args, "context"),
		responseStyle: readConsultStringArg(args, "responseStyle")
	};
}
function buildRealtimeVoiceAgentConsultChatMessage(args) {
	const parsed = parseRealtimeVoiceAgentConsultArgs(args);
	return [
		parsed.question,
		parsed.context ? `Context:\n${parsed.context}` : void 0,
		parsed.responseStyle ? `Spoken style:\n${parsed.responseStyle}` : void 0
	].filter(Boolean).join("\n\n");
}
function buildRealtimeVoiceAgentConsultPrompt(params) {
	const parsed = parseRealtimeVoiceAgentConsultArgs(params.args);
	const assistantLabel = params.assistantLabel ?? "Agent";
	const questionSourceLabel = params.questionSourceLabel ?? params.userLabel.toLowerCase();
	const transcript = params.transcript.slice(-12).map((entry) => `${entry.role === "assistant" ? assistantLabel : params.userLabel}: ${entry.text}`).join("\n");
	return [
		`You are helping an OpenClaw realtime voice agent during ${params.surface}.`,
		`Answer the ${questionSourceLabel}'s question with the strongest useful reasoning and available tools.`,
		"Return only the concise answer the realtime voice agent should speak next.",
		"Do not include markdown, citations unless needed, tool logs, or private reasoning.",
		parsed.responseStyle ? `Spoken style: ${parsed.responseStyle}` : void 0,
		transcript ? `Recent transcript:\n${transcript}` : void 0,
		parsed.context ? `Additional context:\n${parsed.context}` : void 0,
		`Question:\n${parsed.question}`
	].filter(Boolean).join("\n\n");
}
function collectRealtimeVoiceAgentConsultVisibleText(payloads) {
	const chunks = [];
	for (const payload of payloads) {
		if (payload.isError || payload.isReasoning) continue;
		const text = normalizeOptionalString(payload.text);
		if (text) chunks.push(text);
	}
	return chunks.length > 0 ? chunks.join("\n\n").trim() : null;
}
function readConsultStringArg(args, key) {
	if (!args || typeof args !== "object" || Array.isArray(args)) return;
	return normalizeOptionalString(args[key]);
}
//#endregion
//#region src/realtime-voice/provider-registry.ts
function normalizeRealtimeVoiceProviderId(providerId) {
	return normalizeCapabilityProviderId(providerId);
}
function resolveRealtimeVoiceProviderEntries(cfg) {
	return resolvePluginCapabilityProviders({
		key: "realtimeVoiceProviders",
		cfg
	});
}
function buildProviderMaps(cfg) {
	return buildCapabilityProviderMaps(resolveRealtimeVoiceProviderEntries(cfg));
}
function listRealtimeVoiceProviders(cfg) {
	return [...buildProviderMaps(cfg).canonical.values()];
}
function getRealtimeVoiceProvider(providerId, cfg) {
	const normalized = normalizeRealtimeVoiceProviderId(providerId);
	if (!normalized) return;
	return buildProviderMaps(cfg).aliases.get(normalized);
}
function canonicalizeRealtimeVoiceProviderId(providerId, cfg) {
	const normalized = normalizeRealtimeVoiceProviderId(providerId);
	if (!normalized) return;
	return getRealtimeVoiceProvider(normalized, cfg)?.id ?? normalized;
}
//#endregion
//#region src/realtime-voice/provider-resolver.ts
function resolveConfiguredRealtimeVoiceProvider(params) {
	const cfgForResolve = params.cfgForResolve ?? params.cfg ?? {};
	const providers = params.providers ?? listRealtimeVoiceProviders(params.cfg);
	const resolution = resolveConfiguredCapabilityProvider({
		configuredProviderId: params.configuredProviderId,
		providerConfigs: params.providerConfigs,
		cfg: params.cfg,
		cfgForResolve,
		getConfiguredProvider: (providerId) => params.providers?.find((entry) => entry.id === providerId) ?? getRealtimeVoiceProvider(providerId, params.cfg),
		listProviders: () => providers,
		resolveProviderConfig: ({ provider, cfg, rawConfig }) => {
			const rawConfigWithModel = params.defaultModel && rawConfig.model === void 0 ? {
				...rawConfig,
				model: params.defaultModel
			} : rawConfig;
			return provider.resolveConfig?.({
				cfg,
				rawConfig: rawConfigWithModel
			}) ?? rawConfigWithModel;
		},
		isProviderConfigured: ({ provider, cfg, providerConfig }) => provider.isConfigured({
			cfg,
			providerConfig
		})
	});
	if (!resolution.ok && resolution.code === "missing-configured-provider") throw new Error(`Realtime voice provider "${resolution.configuredProviderId}" is not registered`);
	if (!resolution.ok && resolution.code === "no-registered-provider") throw new Error(params.noRegisteredProviderMessage ?? "No realtime voice provider registered");
	if (!resolution.ok) throw new Error(`Realtime voice provider "${resolution.provider?.id}" is not configured`);
	return {
		provider: resolution.provider,
		providerConfig: resolution.providerConfig
	};
}
//#endregion
export { normalizeRealtimeVoiceProviderId as a, REALTIME_VOICE_AGENT_CONSULT_TOOL_POLICIES as c, collectRealtimeVoiceAgentConsultVisibleText as d, isRealtimeVoiceAgentConsultToolPolicy as f, resolveRealtimeVoiceAgentConsultToolsAllow as g, resolveRealtimeVoiceAgentConsultTools as h, listRealtimeVoiceProviders as i, buildRealtimeVoiceAgentConsultChatMessage as l, resolveRealtimeVoiceAgentConsultToolPolicy as m, canonicalizeRealtimeVoiceProviderId as n, REALTIME_VOICE_AGENT_CONSULT_TOOL as o, parseRealtimeVoiceAgentConsultArgs as p, getRealtimeVoiceProvider as r, REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME as s, resolveConfiguredRealtimeVoiceProvider as t, buildRealtimeVoiceAgentConsultPrompt as u };
