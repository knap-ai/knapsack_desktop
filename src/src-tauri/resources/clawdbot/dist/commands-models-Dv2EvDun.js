import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import { p as resolveSessionAgentId, y as resolveAgentDir } from "./agent-scope-KFH9bkHi.js";
import "./plugins-D4ODSIPT.js";
import { f as resolveDefaultModelForAgent, i as buildModelAliasIndex, m as resolveModelRefFromString, t as buildAllowedModelSet } from "./model-selection-CTdyYoio.js";
import { r as loadModelCatalog } from "./model-catalog-CdCqmHkW.js";
import { r as rejectUnauthorizedCommand } from "./command-gates-CM511X5Y.js";
import { t as resolveModelAuthLabel } from "./model-auth-label-DqgXEmQ1.js";
//#region src/auto-reply/reply/commands-models.ts
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 100;
/**
* Build provider/model data from config and catalog.
* Exported for reuse by callback handlers.
*/
async function buildModelsProviderData(cfg, agentId) {
	const resolvedDefault = resolveDefaultModelForAgent({
		cfg,
		agentId
	});
	const catalog = await loadModelCatalog({ config: cfg });
	const allowed = buildAllowedModelSet({
		cfg,
		catalog,
		defaultProvider: resolvedDefault.provider,
		defaultModel: resolvedDefault.model,
		agentId
	});
	const aliasIndex = buildModelAliasIndex({
		cfg,
		defaultProvider: resolvedDefault.provider
	});
	const byProvider = /* @__PURE__ */ new Map();
	const add = (p, m) => {
		const key = normalizeProviderId(p);
		const set = byProvider.get(key) ?? /* @__PURE__ */ new Set();
		set.add(m);
		byProvider.set(key, set);
	};
	const addRawModelRef = (raw) => {
		const trimmed = normalizeOptionalString(raw);
		if (!trimmed) return;
		const resolved = resolveModelRefFromString({
			raw: trimmed,
			defaultProvider: resolvedDefault.provider,
			aliasIndex
		});
		if (!resolved) return;
		add(resolved.ref.provider, resolved.ref.model);
	};
	const addModelConfigEntries = () => {
		const modelConfig = cfg.agents?.defaults?.model;
		if (typeof modelConfig === "string") addRawModelRef(modelConfig);
		else if (modelConfig && typeof modelConfig === "object") {
			addRawModelRef(modelConfig.primary);
			for (const fallback of modelConfig.fallbacks ?? []) addRawModelRef(fallback);
		}
		const imageConfig = cfg.agents?.defaults?.imageModel;
		if (typeof imageConfig === "string") addRawModelRef(imageConfig);
		else if (imageConfig && typeof imageConfig === "object") {
			addRawModelRef(imageConfig.primary);
			for (const fallback of imageConfig.fallbacks ?? []) addRawModelRef(fallback);
		}
	};
	for (const entry of allowed.allowedCatalog) add(entry.provider, entry.id);
	for (const raw of Object.keys(cfg.agents?.defaults?.models ?? {})) addRawModelRef(raw);
	add(resolvedDefault.provider, resolvedDefault.model);
	addModelConfigEntries();
	const providers = [...byProvider.keys()].toSorted();
	const modelNames = /* @__PURE__ */ new Map();
	for (const entry of catalog) if (entry.name && entry.name !== entry.id) modelNames.set(`${normalizeProviderId(entry.provider)}/${entry.id}`, entry.name);
	return {
		byProvider,
		providers,
		resolvedDefault,
		modelNames
	};
}
function formatProviderLine(params) {
	return `- ${params.provider} (${params.count})`;
}
function parseModelsArgs(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {
		page: 1,
		pageSize: PAGE_SIZE_DEFAULT,
		all: false
	};
	const tokens = trimmed.split(/\s+/g).filter(Boolean);
	const provider = normalizeOptionalString(tokens[0]);
	let page = 1;
	let all = false;
	for (const token of tokens.slice(1)) {
		const lower = normalizeLowercaseStringOrEmpty(token);
		if (lower === "all" || lower === "--all") {
			all = true;
			continue;
		}
		if (lower.startsWith("page=")) {
			const value = Number.parseInt(lower.slice(5), 10);
			if (Number.isFinite(value) && value > 0) page = value;
			continue;
		}
		if (/^[0-9]+$/.test(lower)) {
			const value = Number.parseInt(lower, 10);
			if (Number.isFinite(value) && value > 0) page = value;
		}
	}
	let pageSize = PAGE_SIZE_DEFAULT;
	for (const token of tokens) {
		const lower = normalizeLowercaseStringOrEmpty(token);
		if (lower.startsWith("limit=") || lower.startsWith("size=")) {
			const rawValue = lower.slice(lower.indexOf("=") + 1);
			const value = Number.parseInt(rawValue, 10);
			if (Number.isFinite(value) && value > 0) pageSize = Math.min(PAGE_SIZE_MAX, value);
		}
	}
	return {
		provider: provider ? normalizeProviderId(provider) : void 0,
		page,
		pageSize,
		all
	};
}
function resolveProviderLabel(params) {
	const authLabel = resolveModelAuthLabel({
		provider: params.provider,
		cfg: params.cfg,
		sessionEntry: params.sessionEntry,
		agentDir: params.agentDir
	});
	if (!authLabel || authLabel === "unknown") return params.provider;
	return `${params.provider} · 🔑 ${authLabel}`;
}
function formatModelsAvailableHeader(params) {
	return `Models (${resolveProviderLabel({
		provider: params.provider,
		cfg: params.cfg,
		agentDir: params.agentDir,
		sessionEntry: params.sessionEntry
	})}) — ${params.total} available`;
}
async function resolveModelsCommandReply(params) {
	const body = params.commandBodyNormalized.trim();
	if (!body.startsWith("/models")) return null;
	const { provider, page, pageSize, all } = parseModelsArgs(body.replace(/^\/models\b/i, "").trim());
	const { byProvider, providers, modelNames } = await buildModelsProviderData(params.cfg, params.agentId);
	const commandPlugin = params.surface ? getChannelPlugin(params.surface) : null;
	if (!provider) {
		const providerInfos = providers.map((p) => ({
			id: p,
			count: byProvider.get(p)?.size ?? 0
		}));
		const channelData = commandPlugin?.commands?.buildModelsProviderChannelData?.({ providers: providerInfos });
		if (channelData) return {
			text: "Select a provider:",
			channelData
		};
		return { text: [
			"Providers:",
			...providers.map((p) => formatProviderLine({
				provider: p,
				count: byProvider.get(p)?.size ?? 0
			})),
			"",
			"Use: /models <provider>",
			"Switch: /model <provider/model>"
		].join("\n") };
	}
	if (!byProvider.has(provider)) return { text: [
		`Unknown provider: ${provider}`,
		"",
		"Available providers:",
		...providers.map((p) => `- ${p}`),
		"",
		"Use: /models <provider>"
	].join("\n") };
	const models = [...byProvider.get(provider) ?? /* @__PURE__ */ new Set()].toSorted();
	const total = models.length;
	const providerLabel = resolveProviderLabel({
		provider,
		cfg: params.cfg,
		agentDir: params.agentDir,
		sessionEntry: params.sessionEntry
	});
	if (total === 0) return { text: [
		`Models (${providerLabel}) — none`,
		"",
		"Browse: /models",
		"Switch: /model <provider/model>"
	].join("\n") };
	const interactivePageSize = 8;
	const interactiveTotalPages = Math.max(1, Math.ceil(total / interactivePageSize));
	const interactivePage = Math.max(1, Math.min(page, interactiveTotalPages));
	const interactiveChannelData = commandPlugin?.commands?.buildModelsListChannelData?.({
		provider,
		models,
		currentModel: params.currentModel,
		currentPage: interactivePage,
		totalPages: interactiveTotalPages,
		pageSize: interactivePageSize,
		modelNames
	});
	if (interactiveChannelData) return {
		text: formatModelsAvailableHeader({
			provider,
			total,
			cfg: params.cfg,
			agentDir: params.agentDir,
			sessionEntry: params.sessionEntry
		}),
		channelData: interactiveChannelData
	};
	const effectivePageSize = all ? total : pageSize;
	const pageCount = effectivePageSize > 0 ? Math.ceil(total / effectivePageSize) : 1;
	const safePage = all ? 1 : Math.max(1, Math.min(page, pageCount));
	if (!all && page !== safePage) return { text: [
		`Page out of range: ${page} (valid: 1-${pageCount})`,
		"",
		`Try: /models ${provider} ${safePage}`,
		`All: /models ${provider} all`
	].join("\n") };
	const startIndex = (safePage - 1) * effectivePageSize;
	const endIndexExclusive = Math.min(total, startIndex + effectivePageSize);
	const pageModels = models.slice(startIndex, endIndexExclusive);
	const lines = [`Models (${providerLabel}) — showing ${startIndex + 1}-${endIndexExclusive} of ${total} (page ${safePage}/${pageCount})`];
	for (const id of pageModels) lines.push(`- ${provider}/${id}`);
	lines.push("", "Switch: /model <provider/model>");
	if (!all && safePage < pageCount) lines.push(`More: /models ${provider} ${safePage + 1}`);
	if (!all) lines.push(`All: /models ${provider} all`);
	return { text: lines.join("\n") };
}
const handleModelsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const commandBodyNormalized = params.command.commandBodyNormalized.trim();
	if (!commandBodyNormalized.startsWith("/models")) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/models");
	if (unauthorized) return unauthorized;
	const modelsAgentId = params.sessionKey ? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	}) : params.agentId ?? "main";
	const modelsAgentDir = modelsAgentId === (params.agentId ?? "main") && params.agentDir ? params.agentDir : resolveAgentDir(params.cfg, modelsAgentId);
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	const reply = await resolveModelsCommandReply({
		cfg: params.cfg,
		commandBodyNormalized,
		surface: params.ctx.Surface,
		currentModel: params.model ? `${params.provider}/${params.model}` : void 0,
		agentId: modelsAgentId,
		agentDir: modelsAgentDir,
		sessionEntry: targetSessionEntry
	});
	if (!reply) return null;
	return {
		reply,
		shouldContinue: false
	};
};
//#endregion
export { resolveModelsCommandReply as i, formatModelsAvailableHeader as n, handleModelsCommand as r, buildModelsProviderData as t };
