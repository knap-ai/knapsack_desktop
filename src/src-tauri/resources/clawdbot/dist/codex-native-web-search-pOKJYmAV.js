import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import "./auth-profiles-bVW1e9Dr.js";
import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { n as listProfilesForProvider } from "./profiles-RmR8EAZC.js";
//#region src/agents/codex-native-web-search.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function trimToUndefined(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function normalizeAllowedDomains(value) {
	if (!Array.isArray(value)) return;
	const deduped = [...new Set(value.map((entry) => trimToUndefined(entry)).filter((entry) => typeof entry === "string"))];
	return deduped.length > 0 ? deduped : void 0;
}
function normalizeContextSize(value) {
	if (value === "low" || value === "medium" || value === "high") return value;
}
function normalizeMode(value) {
	return value === "live" ? "live" : "cached";
}
function normalizeUserLocation(value) {
	if (!isRecord(value)) return;
	const location = {
		country: trimToUndefined(value.country),
		region: trimToUndefined(value.region),
		city: trimToUndefined(value.city),
		timezone: trimToUndefined(value.timezone)
	};
	return location.country || location.region || location.city || location.timezone ? location : void 0;
}
function resolveCodexNativeWebSearchConfig(config) {
	const nativeConfig = config?.tools?.web?.search?.openaiCodex;
	return {
		enabled: nativeConfig?.enabled === true,
		mode: normalizeMode(nativeConfig?.mode),
		allowedDomains: normalizeAllowedDomains(nativeConfig?.allowedDomains),
		contextSize: normalizeContextSize(nativeConfig?.contextSize),
		userLocation: normalizeUserLocation(nativeConfig?.userLocation)
	};
}
function isCodexNativeSearchEligibleModel(params) {
	return params.modelProvider === "openai-codex" || params.modelApi === "openai-codex-responses";
}
function hasCodexNativeWebSearchTool(tools) {
	if (!Array.isArray(tools)) return false;
	return tools.some((tool) => isRecord(tool) && typeof tool.type === "string" && tool.type === "web_search");
}
function hasAvailableCodexAuth(params) {
	if (params.agentDir) try {
		if (listProfilesForProvider(ensureAuthProfileStore(params.agentDir), "openai-codex").length > 0) return true;
	} catch {}
	return Object.values(params.config?.auth?.profiles ?? {}).some((profile) => isRecord(profile) && profile.provider === "openai-codex");
}
function resolveCodexNativeSearchActivation(params) {
	const globalWebSearchEnabled = params.config?.tools?.web?.search?.enabled !== false;
	const codexConfig = resolveCodexNativeWebSearchConfig(params.config);
	const nativeEligible = isCodexNativeSearchEligibleModel(params);
	const hasRequiredAuth = params.modelProvider !== "openai-codex" || hasAvailableCodexAuth(params);
	if (!globalWebSearchEnabled) return {
		globalWebSearchEnabled,
		codexNativeEnabled: codexConfig.enabled,
		codexMode: codexConfig.mode,
		nativeEligible,
		hasRequiredAuth,
		state: "managed_only",
		inactiveReason: "globally_disabled"
	};
	if (!codexConfig.enabled) return {
		globalWebSearchEnabled,
		codexNativeEnabled: false,
		codexMode: codexConfig.mode,
		nativeEligible,
		hasRequiredAuth,
		state: "managed_only",
		inactiveReason: "codex_not_enabled"
	};
	if (!nativeEligible) return {
		globalWebSearchEnabled,
		codexNativeEnabled: true,
		codexMode: codexConfig.mode,
		nativeEligible: false,
		hasRequiredAuth,
		state: "managed_only",
		inactiveReason: "model_not_eligible"
	};
	if (!hasRequiredAuth) return {
		globalWebSearchEnabled,
		codexNativeEnabled: true,
		codexMode: codexConfig.mode,
		nativeEligible: true,
		hasRequiredAuth: false,
		state: "managed_only",
		inactiveReason: "codex_auth_missing"
	};
	return {
		globalWebSearchEnabled,
		codexNativeEnabled: true,
		codexMode: codexConfig.mode,
		nativeEligible: true,
		hasRequiredAuth: true,
		state: "native_active"
	};
}
function buildCodexNativeWebSearchTool(config) {
	const nativeConfig = resolveCodexNativeWebSearchConfig(config);
	const tool = {
		type: "web_search",
		external_web_access: nativeConfig.mode === "live"
	};
	if (nativeConfig.allowedDomains) tool.filters = { allowed_domains: nativeConfig.allowedDomains };
	if (nativeConfig.contextSize) tool.search_context_size = nativeConfig.contextSize;
	if (nativeConfig.userLocation) tool.user_location = {
		type: "approximate",
		...nativeConfig.userLocation
	};
	return tool;
}
function patchCodexNativeWebSearchPayload(params) {
	if (!isRecord(params.payload)) return { status: "payload_not_object" };
	const payload = params.payload;
	if (hasCodexNativeWebSearchTool(payload.tools)) return { status: "native_tool_already_present" };
	const tools = Array.isArray(payload.tools) ? [...payload.tools] : [];
	tools.push(buildCodexNativeWebSearchTool(params.config));
	payload.tools = tools;
	return { status: "injected" };
}
function shouldSuppressManagedWebSearchTool(params) {
	return resolveCodexNativeSearchActivation(params).state === "native_active";
}
function isCodexNativeWebSearchRelevant(params) {
	if (resolveCodexNativeWebSearchConfig(params.config).enabled) return true;
	if (hasAvailableCodexAuth(params)) return true;
	const defaultModel = resolveDefaultModelForAgent({
		cfg: params.config,
		agentId: params.agentId
	});
	const configuredProvider = params.config.models?.providers?.[defaultModel.provider];
	const configuredModelApi = configuredProvider?.models?.find((candidate) => candidate.id === defaultModel.model)?.api;
	return isCodexNativeSearchEligibleModel({
		modelProvider: defaultModel.provider,
		modelApi: configuredModelApi ?? configuredProvider?.api
	});
}
function describeCodexNativeWebSearch(config) {
	if (config?.tools?.web?.search?.enabled === false) return;
	const nativeConfig = resolveCodexNativeWebSearchConfig(config);
	if (!nativeConfig.enabled) return;
	return `Codex native search: ${nativeConfig.mode} for Codex-capable models`;
}
//#endregion
export { isCodexNativeSearchEligibleModel as a, resolveCodexNativeSearchActivation as c, hasCodexNativeWebSearchTool as i, resolveCodexNativeWebSearchConfig as l, describeCodexNativeWebSearch as n, isCodexNativeWebSearchRelevant as o, hasAvailableCodexAuth as r, patchCodexNativeWebSearchPayload as s, buildCodexNativeWebSearchTool as t, shouldSuppressManagedWebSearchTool as u };
