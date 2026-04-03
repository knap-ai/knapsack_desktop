import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { g as resolveDefaultModelForAgent, i as buildModelAliasIndex, t as buildAllowedModelSet, v as resolveModelRefFromString } from "./model-selection-8a6zD_aX.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { a as resolveAgentDir, v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
import { t as redactIdentifier } from "./redact-identifier-3CI3eDo3.js";
import { o as isInternalMessageChannel } from "./message-channel-D19EDm2g.js";
import { t as isCommandFlagEnabled } from "./commands-Cgp2RFyz.js";
import { r as loadModelCatalog } from "./model-catalog-k0g7_9Nb.js";
import { t as resolveModelAuthLabel } from "./model-auth-label-CoKP1BHZ.js";
//#region src/auto-reply/reply/command-gates.ts
function buildNativeCommandGateReply(text) {
	return {
		shouldContinue: false,
		reply: { text }
	};
}
function rejectUnauthorizedCommand(params, commandLabel) {
	if (params.command.isAuthorizedSender) return null;
	logVerbose(`Ignoring ${commandLabel} from unauthorized sender: ${redactIdentifier(params.command.senderId)}`);
	if (params.ctx.CommandSource === "native") return buildNativeCommandGateReply("You are not authorized to use this command.");
	return { shouldContinue: false };
}
function rejectNonOwnerCommand(params, commandLabel) {
	if (params.command.senderIsOwner) return null;
	logVerbose(`Ignoring ${commandLabel} from non-owner sender: ${redactIdentifier(params.command.senderId)}`);
	if (params.ctx.CommandSource === "native") return buildNativeCommandGateReply("You are not authorized to use this command.");
	return { shouldContinue: false };
}
function requireGatewayClientScopeForInternalChannel(params, config) {
	if (!isInternalMessageChannel(params.command.channel)) return null;
	const scopes = params.ctx.GatewayClientScopes ?? [];
	if (config.allowedScopes.some((scope) => scopes.includes(scope))) return null;
	logVerbose(`Ignoring ${config.label} from gateway client missing scope: ${config.allowedScopes.join(" or ")}`);
	return {
		shouldContinue: false,
		reply: { text: config.missingText }
	};
}
function buildDisabledCommandReply(params) {
	const disabledVerb = params.disabledVerb ?? "is";
	const docsSuffix = params.docsUrl ? ` Docs: ${params.docsUrl}` : "";
	return { text: `⚠️ ${params.label} ${disabledVerb} disabled. Set commands.${params.configKey}=true to enable.${docsSuffix}` };
}
function requireCommandFlagEnabled(cfg, params) {
	if (isCommandFlagEnabled(cfg, params.configKey)) return null;
	return {
		shouldContinue: false,
		reply: buildDisabledCommandReply(params)
	};
}
//#endregion
//#region src/auto-reply/reply/commands-models.telegram.ts
const MODELS_PAGE_SIZE = 8;
const MAX_CALLBACK_DATA_BYTES = 64;
const CALLBACK_PREFIX = {
	providers: "mdl_prov",
	back: "mdl_back",
	list: "mdl_list_",
	selectStandard: "mdl_sel_",
	selectCompact: "mdl_sel/"
};
function truncateModelId(value, maxChars) {
	if (value.length <= maxChars) return value;
	return `${value.slice(0, Math.max(0, maxChars - 3))}...`;
}
function buildModelSelectionCallbackData(params) {
	const fullCallbackData = `${CALLBACK_PREFIX.selectStandard}${params.provider}/${params.model}`;
	if (Buffer.byteLength(fullCallbackData, "utf8") <= MAX_CALLBACK_DATA_BYTES) return fullCallbackData;
	const compactCallbackData = `${CALLBACK_PREFIX.selectCompact}${params.model}`;
	return Buffer.byteLength(compactCallbackData, "utf8") <= MAX_CALLBACK_DATA_BYTES ? compactCallbackData : null;
}
function buildProviderKeyboard(providers) {
	if (providers.length === 0) return [];
	const rows = [];
	let currentRow = [];
	for (const provider of providers) {
		currentRow.push({
			text: `${provider.id} (${provider.count})`,
			callback_data: `mdl_list_${provider.id}_1`
		});
		if (currentRow.length === 2) {
			rows.push(currentRow);
			currentRow = [];
		}
	}
	if (currentRow.length > 0) rows.push(currentRow);
	return rows;
}
function buildModelsKeyboard(params) {
	const { provider, models, currentModel, currentPage, totalPages, modelNames } = params;
	const pageSize = params.pageSize ?? MODELS_PAGE_SIZE;
	if (models.length === 0) return [[{
		text: "<< Back",
		callback_data: CALLBACK_PREFIX.back
	}]];
	const rows = [];
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, models.length);
	const pageModels = models.slice(startIndex, endIndex);
	const currentModelId = currentModel?.includes("/") ? currentModel.split("/").slice(1).join("/") : currentModel;
	for (const model of pageModels) {
		const callbackData = buildModelSelectionCallbackData({
			provider,
			model
		});
		if (!callbackData) continue;
		const isCurrentModel = model === currentModelId;
		const displayText = truncateModelId(modelNames?.get(`${provider}/${model}`) ?? model, 38);
		rows.push([{
			text: isCurrentModel ? `${displayText} ✓` : displayText,
			callback_data: callbackData
		}]);
	}
	const navRow = [];
	if (currentPage > 1) navRow.push({
		text: "Previous",
		callback_data: `${CALLBACK_PREFIX.list}${provider}_${currentPage - 1}`
	});
	if (currentPage < totalPages) navRow.push({
		text: "Next",
		callback_data: `${CALLBACK_PREFIX.list}${provider}_${currentPage + 1}`
	});
	if (navRow.length > 0) rows.push(navRow);
	rows.push([{
		text: "<< Back",
		callback_data: CALLBACK_PREFIX.providers
	}]);
	return rows;
}
function buildBrowseProvidersButton() {
	return [[{
		text: "Browse providers",
		callback_data: CALLBACK_PREFIX.providers
	}]];
}
function getModelsPageSize() {
	return MODELS_PAGE_SIZE;
}
function calculateTotalPages(totalModels, pageSize = MODELS_PAGE_SIZE) {
	if (totalModels <= 0) return 0;
	return Math.ceil(totalModels / pageSize);
}
//#endregion
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
		const trimmed = raw?.trim();
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
	const provider = tokens[0]?.trim();
	let page = 1;
	let all = false;
	for (const token of tokens.slice(1)) {
		const lower = token.toLowerCase();
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
		const lower = token.toLowerCase();
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
	const isTelegram = params.surface === "telegram";
	if (!provider) {
		if (isTelegram && providers.length > 0) return {
			text: "Select a provider:",
			channelData: { telegram: { buttons: buildProviderKeyboard(providers.map((p) => ({
				id: p,
				count: byProvider.get(p)?.size ?? 0
			}))) } }
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
	if (isTelegram) {
		const telegramPageSize = getModelsPageSize();
		const totalPages = calculateTotalPages(total, telegramPageSize);
		const safePage = Math.max(1, Math.min(page, totalPages));
		const buttons = buildModelsKeyboard({
			provider,
			models,
			currentModel: params.currentModel,
			currentPage: safePage,
			totalPages,
			pageSize: telegramPageSize,
			modelNames
		});
		return {
			text: formatModelsAvailableHeader({
				provider,
				total,
				cfg: params.cfg,
				agentDir: params.agentDir,
				sessionEntry: params.sessionEntry
			}),
			channelData: { telegram: { buttons } }
		};
	}
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
	const modelsAgentId = params.agentId ?? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	const modelsAgentDir = resolveAgentDir(params.cfg, modelsAgentId);
	const reply = await resolveModelsCommandReply({
		cfg: params.cfg,
		commandBodyNormalized,
		surface: params.ctx.Surface,
		currentModel: params.model ? `${params.provider}/${params.model}` : void 0,
		agentId: modelsAgentId,
		agentDir: modelsAgentDir,
		sessionEntry: params.sessionEntry
	});
	if (!reply) return null;
	return {
		reply,
		shouldContinue: false
	};
};
//#endregion
export { buildBrowseProvidersButton as a, rejectUnauthorizedCommand as c, resolveModelsCommandReply as i, requireCommandFlagEnabled as l, formatModelsAvailableHeader as n, buildDisabledCommandReply as o, handleModelsCommand as r, rejectNonOwnerCommand as s, buildModelsProviderData as t, requireGatewayClientScopeForInternalChannel as u };
