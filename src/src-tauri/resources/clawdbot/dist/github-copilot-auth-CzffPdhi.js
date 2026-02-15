import { o as createSubsystemLogger } from "./entry.js";
import { $ as buildVeniceModelDefinition, At as buildCloudflareAiGatewayModelDefinition, B as QIANFAN_BASE_URL, C as resolveOpenClawAgentDir, D as buildModelAliasIndex, Et as buildHuggingfaceModelDefinition, H as XIAOMI_DEFAULT_MODEL_ID, Pt as DEFAULT_PROVIDER, Q as VENICE_MODEL_CATALOG, R as resolveModelRefFromString, Tt as HUGGINGFACE_MODEL_CATALOG, U as buildQianfanProvider, V as QIANFAN_DEFAULT_MODEL_ID, W as buildXiaomiProvider, X as VENICE_BASE_URL, Z as VENICE_DEFAULT_MODEL_REF, at as SYNTHETIC_MODEL_CATALOG, et as TOGETHER_BASE_URL, g as upsertAuthProfile, it as SYNTHETIC_DEFAULT_MODEL_REF, j as normalizeProviderId, jt as resolveCloudflareAiGatewayBaseUrl, kt as CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF, nt as buildTogetherModelDefinition, ot as buildSyntheticModelDefinition, rt as SYNTHETIC_BASE_URL, tt as TOGETHER_MODEL_CATALOG, v as ensureAuthProfileStore, wt as HUGGINGFACE_BASE_URL } from "./auth-profiles-DnpV8DWM.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { l as normalizeAgentId } from "./session-key-DVvxnFKg.js";
import { t as listAgentIds } from "./agent-scope-Bu62UIQZ.js";
import { l as writeConfigFile, o as readConfigFileSnapshot } from "./config-BJWIHf6x.js";
import { _t as loadOpenClawPlugins } from "./reply-DWlAlSNj.js";
import { n as isWSLEnv } from "./wsl-D0QpX5NZ.js";
import { r as stylePromptTitle } from "./prompt-style-f1NZuGno.js";
import { n as logConfigUpdated } from "./logging-By_aaJZy.js";
import { intro, note, outro, spinner } from "@clack/prompts";

//#region src/commands/auth-token.ts
const ANTHROPIC_SETUP_TOKEN_PREFIX = "sk-ant-oat01-";
const ANTHROPIC_SETUP_TOKEN_MIN_LENGTH = 80;
const DEFAULT_TOKEN_PROFILE_NAME = "default";
function normalizeTokenProfileName(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return DEFAULT_TOKEN_PROFILE_NAME;
	return trimmed.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || DEFAULT_TOKEN_PROFILE_NAME;
}
function buildTokenProfileId(params) {
	return `${normalizeProviderId(params.provider)}:${normalizeTokenProfileName(params.name)}`;
}
function validateAnthropicSetupToken(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "Required";
	if (!trimmed.startsWith(ANTHROPIC_SETUP_TOKEN_PREFIX)) return `Expected token starting with ${ANTHROPIC_SETUP_TOKEN_PREFIX}`;
	if (trimmed.length < ANTHROPIC_SETUP_TOKEN_MIN_LENGTH) return "Token looks too short; paste the full setup-token";
}

//#endregion
//#region src/commands/onboard-auth.models.ts
const MINIMAX_API_BASE_URL = "https://api.minimax.io/anthropic";
const MINIMAX_HOSTED_MODEL_ID = "MiniMax-M2.1";
const MINIMAX_HOSTED_MODEL_REF = `minimax/${MINIMAX_HOSTED_MODEL_ID}`;
const DEFAULT_MINIMAX_CONTEXT_WINDOW = 2e5;
const DEFAULT_MINIMAX_MAX_TOKENS = 8192;
const MOONSHOT_BASE_URL = "https://api.moonshot.ai/v1";
const MOONSHOT_CN_BASE_URL = "https://api.moonshot.cn/v1";
const MOONSHOT_DEFAULT_MODEL_ID = "kimi-k2.5";
const MOONSHOT_DEFAULT_MODEL_REF = `moonshot/${MOONSHOT_DEFAULT_MODEL_ID}`;
const MOONSHOT_DEFAULT_CONTEXT_WINDOW = 256e3;
const MOONSHOT_DEFAULT_MAX_TOKENS = 8192;
const KIMI_CODING_MODEL_ID = "k2p5";
const KIMI_CODING_MODEL_REF = `kimi-coding/${KIMI_CODING_MODEL_ID}`;
const QIANFAN_DEFAULT_MODEL_REF = `qianfan/${QIANFAN_DEFAULT_MODEL_ID}`;
const ZAI_CODING_GLOBAL_BASE_URL = "https://api.z.ai/api/coding/paas/v4";
const ZAI_CODING_CN_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4";
const ZAI_GLOBAL_BASE_URL = "https://api.z.ai/api/paas/v4";
const ZAI_CN_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const ZAI_DEFAULT_MODEL_ID = "glm-5";
function resolveZaiBaseUrl(endpoint) {
	switch (endpoint) {
		case "coding-cn": return ZAI_CODING_CN_BASE_URL;
		case "global": return ZAI_GLOBAL_BASE_URL;
		case "cn": return ZAI_CN_BASE_URL;
		case "coding-global": return ZAI_CODING_GLOBAL_BASE_URL;
		default: return ZAI_GLOBAL_BASE_URL;
	}
}
const MINIMAX_API_COST = {
	input: 15,
	output: 60,
	cacheRead: 2,
	cacheWrite: 10
};
const MINIMAX_LM_STUDIO_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MOONSHOT_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const ZAI_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MINIMAX_MODEL_CATALOG = {
	"MiniMax-M2.1": {
		name: "MiniMax M2.1",
		reasoning: false
	},
	"MiniMax-M2.1-lightning": {
		name: "MiniMax M2.1 Lightning",
		reasoning: false
	},
	"MiniMax-M2.5": {
		name: "MiniMax M2.5",
		reasoning: true
	},
	"MiniMax-M2.5-Lightning": {
		name: "MiniMax M2.5 Lightning",
		reasoning: true
	}
};
const ZAI_MODEL_CATALOG = {
	"glm-5": {
		name: "GLM-5",
		reasoning: true
	},
	"glm-4.7": {
		name: "GLM-4.7",
		reasoning: true
	},
	"glm-4.7-flash": {
		name: "GLM-4.7 Flash",
		reasoning: true
	},
	"glm-4.7-flashx": {
		name: "GLM-4.7 FlashX",
		reasoning: true
	}
};
function buildMinimaxModelDefinition(params) {
	const catalog = MINIMAX_MODEL_CATALOG[params.id];
	return {
		id: params.id,
		name: params.name ?? catalog?.name ?? `MiniMax ${params.id}`,
		reasoning: params.reasoning ?? catalog?.reasoning ?? false,
		input: ["text"],
		cost: params.cost,
		contextWindow: params.contextWindow,
		maxTokens: params.maxTokens
	};
}
function buildMinimaxApiModelDefinition(modelId) {
	return buildMinimaxModelDefinition({
		id: modelId,
		cost: MINIMAX_API_COST,
		contextWindow: DEFAULT_MINIMAX_CONTEXT_WINDOW,
		maxTokens: DEFAULT_MINIMAX_MAX_TOKENS
	});
}
function buildMoonshotModelDefinition() {
	return {
		id: MOONSHOT_DEFAULT_MODEL_ID,
		name: "Kimi K2.5",
		reasoning: false,
		input: ["text"],
		cost: MOONSHOT_DEFAULT_COST,
		contextWindow: MOONSHOT_DEFAULT_CONTEXT_WINDOW,
		maxTokens: MOONSHOT_DEFAULT_MAX_TOKENS
	};
}
function buildZaiModelDefinition(params) {
	const catalog = ZAI_MODEL_CATALOG[params.id];
	return {
		id: params.id,
		name: params.name ?? catalog?.name ?? `GLM ${params.id}`,
		reasoning: params.reasoning ?? catalog?.reasoning ?? true,
		input: ["text"],
		cost: params.cost ?? ZAI_DEFAULT_COST,
		contextWindow: params.contextWindow ?? 204800,
		maxTokens: params.maxTokens ?? 131072
	};
}
const XAI_BASE_URL = "https://api.x.ai/v1";
const XAI_DEFAULT_MODEL_ID = "grok-4";
const XAI_DEFAULT_MODEL_REF = `xai/${XAI_DEFAULT_MODEL_ID}`;
const XAI_DEFAULT_CONTEXT_WINDOW = 131072;
const XAI_DEFAULT_MAX_TOKENS = 8192;
const XAI_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildXaiModelDefinition() {
	return {
		id: XAI_DEFAULT_MODEL_ID,
		name: "Grok 4",
		reasoning: false,
		input: ["text"],
		cost: XAI_DEFAULT_COST,
		contextWindow: XAI_DEFAULT_CONTEXT_WINDOW,
		maxTokens: XAI_DEFAULT_MAX_TOKENS
	};
}

//#endregion
//#region src/commands/onboard-auth.credentials.ts
const resolveAuthAgentDir = (agentDir) => agentDir ?? resolveOpenClawAgentDir();
async function writeOAuthCredentials(provider, creds, agentDir) {
	upsertAuthProfile({
		profileId: `${provider}:${typeof creds.email === "string" && creds.email.trim() ? creds.email.trim() : "default"}`,
		credential: {
			type: "oauth",
			provider,
			...creds
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setAnthropicApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "anthropic:default",
		credential: {
			type: "api_key",
			provider: "anthropic",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setGeminiApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "google:default",
		credential: {
			type: "api_key",
			provider: "google",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setMinimaxApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "minimax:default",
		credential: {
			type: "api_key",
			provider: "minimax",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setMoonshotApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "moonshot:default",
		credential: {
			type: "api_key",
			provider: "moonshot",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setKimiCodingApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "kimi-coding:default",
		credential: {
			type: "api_key",
			provider: "kimi-coding",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setSyntheticApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "synthetic:default",
		credential: {
			type: "api_key",
			provider: "synthetic",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setVeniceApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "venice:default",
		credential: {
			type: "api_key",
			provider: "venice",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
const ZAI_DEFAULT_MODEL_REF = "zai/glm-5";
const XIAOMI_DEFAULT_MODEL_REF = "xiaomi/mimo-v2-flash";
const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";
const HUGGINGFACE_DEFAULT_MODEL_REF = "huggingface/deepseek-ai/DeepSeek-R1";
const TOGETHER_DEFAULT_MODEL_REF = "together/moonshotai/Kimi-K2.5";
const LITELLM_DEFAULT_MODEL_REF = "litellm/claude-opus-4-6";
const VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF = "vercel-ai-gateway/anthropic/claude-opus-4.6";
async function setZaiApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "zai:default",
		credential: {
			type: "api_key",
			provider: "zai",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setXiaomiApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "xiaomi:default",
		credential: {
			type: "api_key",
			provider: "xiaomi",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setOpenrouterApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "openrouter:default",
		credential: {
			type: "api_key",
			provider: "openrouter",
			key: key === "undefined" ? "" : key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setCloudflareAiGatewayConfig(accountId, gatewayId, apiKey, agentDir) {
	const normalizedAccountId = accountId.trim();
	const normalizedGatewayId = gatewayId.trim();
	upsertAuthProfile({
		profileId: "cloudflare-ai-gateway:default",
		credential: {
			type: "api_key",
			provider: "cloudflare-ai-gateway",
			key: apiKey.trim(),
			metadata: {
				accountId: normalizedAccountId,
				gatewayId: normalizedGatewayId
			}
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setLitellmApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "litellm:default",
		credential: {
			type: "api_key",
			provider: "litellm",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setVercelAiGatewayApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "vercel-ai-gateway:default",
		credential: {
			type: "api_key",
			provider: "vercel-ai-gateway",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setOpencodeZenApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "opencode:default",
		credential: {
			type: "api_key",
			provider: "opencode",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setTogetherApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "together:default",
		credential: {
			type: "api_key",
			provider: "together",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setHuggingfaceApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "huggingface:default",
		credential: {
			type: "api_key",
			provider: "huggingface",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
function setQianfanApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "qianfan:default",
		credential: {
			type: "api_key",
			provider: "qianfan",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
function setXaiApiKey(key, agentDir) {
	upsertAuthProfile({
		profileId: "xai:default",
		credential: {
			type: "api_key",
			provider: "xai",
			key
		},
		agentDir: resolveAuthAgentDir(agentDir)
	});
}

//#endregion
//#region src/commands/onboard-auth.config-gateways.ts
function applyVercelAiGatewayProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF] = {
		...models[VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF],
		alias: models[VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF]?.alias ?? "Vercel AI Gateway"
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		}
	};
}
function applyCloudflareAiGatewayProviderConfig(cfg, params) {
	const models = { ...cfg.agents?.defaults?.models };
	models[CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF] = {
		...models[CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF],
		alias: models[CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF]?.alias ?? "Cloudflare AI Gateway"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers["cloudflare-ai-gateway"];
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModel = buildCloudflareAiGatewayModelDefinition();
	const mergedModels = existingModels.some((model) => model.id === defaultModel.id) ? existingModels : [...existingModels, defaultModel];
	const baseUrl = params?.accountId && params?.gatewayId ? resolveCloudflareAiGatewayBaseUrl({
		accountId: params.accountId,
		gatewayId: params.gatewayId
	}) : existingProvider?.baseUrl;
	if (!baseUrl) return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		}
	};
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers["cloudflare-ai-gateway"] = {
		...existingProviderRest,
		baseUrl,
		api: "anthropic-messages",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : [defaultModel]
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyVercelAiGatewayConfig(cfg) {
	const next = applyVercelAiGatewayProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyCloudflareAiGatewayConfig(cfg, params) {
	const next = applyCloudflareAiGatewayProviderConfig(cfg, params);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF
				}
			}
		}
	};
}

//#endregion
//#region src/commands/onboard-auth.config-litellm.ts
const LITELLM_BASE_URL = "http://localhost:4000";
const LITELLM_DEFAULT_MODEL_ID = "claude-opus-4-6";
const LITELLM_DEFAULT_CONTEXT_WINDOW = 128e3;
const LITELLM_DEFAULT_MAX_TOKENS = 8192;
const LITELLM_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildLitellmModelDefinition() {
	return {
		id: LITELLM_DEFAULT_MODEL_ID,
		name: "Claude Opus 4.6",
		reasoning: true,
		input: ["text", "image"],
		cost: LITELLM_DEFAULT_COST,
		contextWindow: LITELLM_DEFAULT_CONTEXT_WINDOW,
		maxTokens: LITELLM_DEFAULT_MAX_TOKENS
	};
}
function applyLitellmProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[LITELLM_DEFAULT_MODEL_REF] = {
		...models[LITELLM_DEFAULT_MODEL_REF],
		alias: models[LITELLM_DEFAULT_MODEL_REF]?.alias ?? "LiteLLM"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.litellm;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModel = buildLitellmModelDefinition();
	const mergedModels = existingModels.some((model) => model.id === LITELLM_DEFAULT_MODEL_ID) ? existingModels : [...existingModels, defaultModel];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const resolvedBaseUrl = typeof existingProvider?.baseUrl === "string" ? existingProvider.baseUrl.trim() : "";
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.litellm = {
		...existingProviderRest,
		baseUrl: resolvedBaseUrl || LITELLM_BASE_URL,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : [defaultModel]
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyLitellmConfig(cfg) {
	const next = applyLitellmProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: LITELLM_DEFAULT_MODEL_REF
				}
			}
		}
	};
}

//#endregion
//#region src/commands/onboard-auth.config-core.ts
function applyZaiProviderConfig(cfg, params) {
	const modelRef = `zai/${params?.modelId?.trim() || ZAI_DEFAULT_MODEL_ID}`;
	const models = { ...cfg.agents?.defaults?.models };
	models[modelRef] = {
		...models[modelRef],
		alias: models[modelRef]?.alias ?? "GLM"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.zai;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModels = [
		buildZaiModelDefinition({ id: "glm-5" }),
		buildZaiModelDefinition({ id: "glm-4.7" }),
		buildZaiModelDefinition({ id: "glm-4.7-flash" }),
		buildZaiModelDefinition({ id: "glm-4.7-flashx" })
	];
	const mergedModels = [...existingModels];
	const seen = new Set(existingModels.map((m) => m.id));
	for (const model of defaultModels) if (!seen.has(model.id)) {
		mergedModels.push(model);
		seen.add(model.id);
	}
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	const baseUrl = params?.endpoint ? resolveZaiBaseUrl(params.endpoint) : (typeof existingProvider?.baseUrl === "string" ? existingProvider.baseUrl : "") || resolveZaiBaseUrl();
	providers.zai = {
		...existingProviderRest,
		baseUrl,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : defaultModels
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyZaiConfig(cfg, params) {
	const modelId = params?.modelId?.trim() || ZAI_DEFAULT_MODEL_ID;
	const modelRef = modelId === ZAI_DEFAULT_MODEL_ID ? ZAI_DEFAULT_MODEL_REF : `zai/${modelId}`;
	const next = applyZaiProviderConfig(cfg, params);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: modelRef
				}
			}
		}
	};
}
function applyOpenrouterProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[OPENROUTER_DEFAULT_MODEL_REF] = {
		...models[OPENROUTER_DEFAULT_MODEL_REF],
		alias: models[OPENROUTER_DEFAULT_MODEL_REF]?.alias ?? "OpenRouter"
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		}
	};
}
function applyOpenrouterConfig(cfg) {
	const next = applyOpenrouterProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: OPENROUTER_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyMoonshotProviderConfig(cfg) {
	return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_BASE_URL);
}
function applyMoonshotProviderConfigCn(cfg) {
	return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_CN_BASE_URL);
}
function applyMoonshotProviderConfigWithBaseUrl(cfg, baseUrl) {
	const models = { ...cfg.agents?.defaults?.models };
	models[MOONSHOT_DEFAULT_MODEL_REF] = {
		...models[MOONSHOT_DEFAULT_MODEL_REF],
		alias: models[MOONSHOT_DEFAULT_MODEL_REF]?.alias ?? "Kimi"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.moonshot;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModel = buildMoonshotModelDefinition();
	const mergedModels = existingModels.some((model) => model.id === MOONSHOT_DEFAULT_MODEL_ID) ? existingModels : [...existingModels, defaultModel];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.moonshot = {
		...existingProviderRest,
		baseUrl,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : [defaultModel]
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyMoonshotConfig(cfg) {
	const next = applyMoonshotProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: MOONSHOT_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyMoonshotConfigCn(cfg) {
	const next = applyMoonshotProviderConfigCn(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: MOONSHOT_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyKimiCodeProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[KIMI_CODING_MODEL_REF] = {
		...models[KIMI_CODING_MODEL_REF],
		alias: models[KIMI_CODING_MODEL_REF]?.alias ?? "Kimi K2.5"
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		}
	};
}
function applyKimiCodeConfig(cfg) {
	const next = applyKimiCodeProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: KIMI_CODING_MODEL_REF
				}
			}
		}
	};
}
function applySyntheticProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[SYNTHETIC_DEFAULT_MODEL_REF] = {
		...models[SYNTHETIC_DEFAULT_MODEL_REF],
		alias: models[SYNTHETIC_DEFAULT_MODEL_REF]?.alias ?? "MiniMax M2.1"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.synthetic;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const syntheticModels = SYNTHETIC_MODEL_CATALOG.map(buildSyntheticModelDefinition);
	const mergedModels = [...existingModels, ...syntheticModels.filter((model) => !existingModels.some((existing) => existing.id === model.id))];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.synthetic = {
		...existingProviderRest,
		baseUrl: SYNTHETIC_BASE_URL,
		api: "anthropic-messages",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : syntheticModels
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applySyntheticConfig(cfg) {
	const next = applySyntheticProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: SYNTHETIC_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyXiaomiProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[XIAOMI_DEFAULT_MODEL_REF] = {
		...models[XIAOMI_DEFAULT_MODEL_REF],
		alias: models[XIAOMI_DEFAULT_MODEL_REF]?.alias ?? "Xiaomi"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.xiaomi;
	const defaultProvider = buildXiaomiProvider();
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModels = defaultProvider.models ?? [];
	const hasDefaultModel = existingModels.some((model) => model.id === XIAOMI_DEFAULT_MODEL_ID);
	const mergedModels = existingModels.length > 0 ? hasDefaultModel ? existingModels : [...existingModels, ...defaultModels] : defaultModels;
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.xiaomi = {
		...existingProviderRest,
		baseUrl: defaultProvider.baseUrl,
		api: defaultProvider.api,
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : defaultProvider.models
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyXiaomiConfig(cfg) {
	const next = applyXiaomiProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: XIAOMI_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
/**
* Apply Venice provider configuration without changing the default model.
* Registers Venice models and sets up the provider, but preserves existing model selection.
*/
function applyVeniceProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[VENICE_DEFAULT_MODEL_REF] = {
		...models[VENICE_DEFAULT_MODEL_REF],
		alias: models[VENICE_DEFAULT_MODEL_REF]?.alias ?? "Llama 3.3 70B"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.venice;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const veniceModels = VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition);
	const mergedModels = [...existingModels, ...veniceModels.filter((model) => !existingModels.some((existing) => existing.id === model.id))];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.venice = {
		...existingProviderRest,
		baseUrl: VENICE_BASE_URL,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : veniceModels
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
/**
* Apply Venice provider configuration AND set Venice as the default model.
* Use this when Venice is the primary provider choice during onboarding.
*/
function applyVeniceConfig(cfg) {
	const next = applyVeniceProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: VENICE_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
/**
* Apply Together provider configuration without changing the default model.
* Registers Together models and sets up the provider, but preserves existing model selection.
*/
function applyTogetherProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[TOGETHER_DEFAULT_MODEL_REF] = {
		...models[TOGETHER_DEFAULT_MODEL_REF],
		alias: models[TOGETHER_DEFAULT_MODEL_REF]?.alias ?? "Together AI"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.together;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const togetherModels = TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition);
	const mergedModels = [...existingModels, ...togetherModels.filter((model) => !existingModels.some((existing) => existing.id === model.id))];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.together = {
		...existingProviderRest,
		baseUrl: TOGETHER_BASE_URL,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : togetherModels
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
/**
* Apply Together provider configuration AND set Together as the default model.
* Use this when Together is the primary provider choice during onboarding.
*/
function applyTogetherConfig(cfg) {
	const next = applyTogetherProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: TOGETHER_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
/**
* Apply Hugging Face (Inference Providers) provider configuration without changing the default model.
*/
function applyHuggingfaceProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[HUGGINGFACE_DEFAULT_MODEL_REF] = {
		...models[HUGGINGFACE_DEFAULT_MODEL_REF],
		alias: models[HUGGINGFACE_DEFAULT_MODEL_REF]?.alias ?? "Hugging Face"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.huggingface;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const hfModels = HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	const mergedModels = [...existingModels, ...hfModels.filter((model) => !existingModels.some((existing) => existing.id === model.id))];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.huggingface = {
		...existingProviderRest,
		baseUrl: HUGGINGFACE_BASE_URL,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : hfModels
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
/**
* Apply Hugging Face provider configuration AND set Hugging Face as the default model.
*/
function applyHuggingfaceConfig(cfg) {
	const next = applyHuggingfaceProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: HUGGINGFACE_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyXaiProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[XAI_DEFAULT_MODEL_REF] = {
		...models[XAI_DEFAULT_MODEL_REF],
		alias: models[XAI_DEFAULT_MODEL_REF]?.alias ?? "Grok"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.xai;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModel = buildXaiModelDefinition();
	const mergedModels = existingModels.some((model) => model.id === XAI_DEFAULT_MODEL_ID) ? existingModels : [...existingModels, defaultModel];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.xai = {
		...existingProviderRest,
		baseUrl: XAI_BASE_URL,
		api: "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : [defaultModel]
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyXaiConfig(cfg) {
	const next = applyXaiProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: XAI_DEFAULT_MODEL_REF
				}
			}
		}
	};
}
function applyAuthProfileConfig(cfg, params) {
	const profiles = {
		...cfg.auth?.profiles,
		[params.profileId]: {
			provider: params.provider,
			mode: params.mode,
			...params.email ? { email: params.email } : {}
		}
	};
	const existingProviderOrder = cfg.auth?.order?.[params.provider];
	const preferProfileFirst = params.preferProfileFirst ?? true;
	const reorderedProviderOrder = existingProviderOrder && preferProfileFirst ? [params.profileId, ...existingProviderOrder.filter((profileId) => profileId !== params.profileId)] : existingProviderOrder;
	const order = existingProviderOrder !== void 0 ? {
		...cfg.auth?.order,
		[params.provider]: reorderedProviderOrder?.includes(params.profileId) ? reorderedProviderOrder : [...reorderedProviderOrder ?? [], params.profileId]
	} : cfg.auth?.order;
	return {
		...cfg,
		auth: {
			...cfg.auth,
			profiles,
			...order ? { order } : {}
		}
	};
}
function applyQianfanProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[QIANFAN_DEFAULT_MODEL_REF] = {
		...models[QIANFAN_DEFAULT_MODEL_REF],
		alias: models[QIANFAN_DEFAULT_MODEL_REF]?.alias ?? "QIANFAN"
	};
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.qianfan;
	const defaultProvider = buildQianfanProvider();
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const defaultModels = defaultProvider.models ?? [];
	const hasDefaultModel = existingModels.some((model) => model.id === QIANFAN_DEFAULT_MODEL_ID);
	const mergedModels = existingModels.length > 0 ? hasDefaultModel ? existingModels : [...existingModels, ...defaultModels] : defaultModels;
	const { apiKey: existingApiKey, baseUrl: existingBaseUrl, api: existingApi, ...existingProviderRest } = existingProvider ?? {};
	const normalizedApiKey = (typeof existingApiKey === "string" ? existingApiKey : void 0)?.trim();
	providers.qianfan = {
		...existingProviderRest,
		baseUrl: existingBaseUrl ?? QIANFAN_BASE_URL,
		api: existingApi ?? "openai-completions",
		...normalizedApiKey ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : defaultProvider.models
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyQianfanConfig(cfg) {
	const next = applyQianfanProviderConfig(cfg);
	const existingModel = next.agents?.defaults?.model;
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...existingModel && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: QIANFAN_DEFAULT_MODEL_REF
				}
			}
		}
	};
}

//#endregion
//#region src/commands/onboard-auth.config-minimax.ts
function applyMinimaxProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models["anthropic/claude-opus-4-6"] = {
		...models["anthropic/claude-opus-4-6"],
		alias: models["anthropic/claude-opus-4-6"]?.alias ?? "Opus"
	};
	models["lmstudio/minimax-m2.1-gs32"] = {
		...models["lmstudio/minimax-m2.1-gs32"],
		alias: models["lmstudio/minimax-m2.1-gs32"]?.alias ?? "Minimax"
	};
	const providers = { ...cfg.models?.providers };
	if (!providers.lmstudio) providers.lmstudio = {
		baseUrl: "http://127.0.0.1:1234/v1",
		apiKey: "lmstudio",
		api: "openai-responses",
		models: [buildMinimaxModelDefinition({
			id: "minimax-m2.1-gs32",
			name: "MiniMax M2.1 GS32",
			reasoning: false,
			cost: MINIMAX_LM_STUDIO_COST,
			contextWindow: 196608,
			maxTokens: 8192
		})]
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyMinimaxConfig(cfg) {
	const next = applyMinimaxProviderConfig(cfg);
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...next.agents?.defaults?.model && "fallbacks" in next.agents.defaults.model ? { fallbacks: next.agents.defaults.model.fallbacks } : void 0,
					primary: "lmstudio/minimax-m2.1-gs32"
				}
			}
		}
	};
}
function applyMinimaxApiProviderConfig(cfg, modelId = "MiniMax-M2.1") {
	const providers = { ...cfg.models?.providers };
	const existingProvider = providers.minimax;
	const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
	const apiModel = buildMinimaxApiModelDefinition(modelId);
	const mergedModels = existingModels.some((model) => model.id === modelId) ? existingModels : [...existingModels, apiModel];
	const { apiKey: existingApiKey, ...existingProviderRest } = existingProvider ?? {};
	const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : void 0;
	const normalizedApiKey = resolvedApiKey?.trim() === "minimax" ? "" : resolvedApiKey;
	providers.minimax = {
		...existingProviderRest,
		baseUrl: MINIMAX_API_BASE_URL,
		api: "anthropic-messages",
		...normalizedApiKey?.trim() ? { apiKey: normalizedApiKey } : {},
		models: mergedModels.length > 0 ? mergedModels : [apiModel]
	};
	const models = { ...cfg.agents?.defaults?.models };
	models[`minimax/${modelId}`] = {
		...models[`minimax/${modelId}`],
		alias: "Minimax"
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		},
		models: {
			mode: cfg.models?.mode ?? "merge",
			providers
		}
	};
}
function applyMinimaxApiConfig(cfg, modelId = "MiniMax-M2.1") {
	const next = applyMinimaxApiProviderConfig(cfg, modelId);
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...next.agents?.defaults?.model && "fallbacks" in next.agents.defaults.model ? { fallbacks: next.agents.defaults.model.fallbacks } : void 0,
					primary: `minimax/${modelId}`
				}
			}
		}
	};
}

//#endregion
//#region src/agents/opencode-zen-models.ts
const OPENCODE_ZEN_DEFAULT_MODEL = "claude-opus-4-6";
const OPENCODE_ZEN_DEFAULT_MODEL_REF = `opencode/${OPENCODE_ZEN_DEFAULT_MODEL}`;
const CACHE_TTL_MS = 3600 * 1e3;

//#endregion
//#region src/commands/onboard-auth.config-opencode.ts
function applyOpencodeZenProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[OPENCODE_ZEN_DEFAULT_MODEL_REF] = {
		...models[OPENCODE_ZEN_DEFAULT_MODEL_REF],
		alias: models[OPENCODE_ZEN_DEFAULT_MODEL_REF]?.alias ?? "Opus"
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		}
	};
}
function applyOpencodeZenConfig(cfg) {
	const next = applyOpencodeZenProviderConfig(cfg);
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: {
					...next.agents?.defaults?.model && "fallbacks" in next.agents.defaults.model ? { fallbacks: next.agents.defaults.model.fallbacks } : void 0,
					primary: OPENCODE_ZEN_DEFAULT_MODEL_REF
				}
			}
		}
	};
}

//#endregion
//#region src/plugins/providers.ts
const log = createSubsystemLogger("plugins");
function resolvePluginProviders(params) {
	return loadOpenClawPlugins({
		config: params.config,
		workspaceDir: params.workspaceDir,
		logger: {
			info: (msg) => log.info(msg),
			warn: (msg) => log.warn(msg),
			error: (msg) => log.error(msg),
			debug: (msg) => log.debug(msg)
		}
	}).providers.map((entry) => entry.provider);
}

//#endregion
//#region src/commands/oauth-env.ts
function isRemoteEnvironment() {
	if (process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION) return true;
	if (process.env.REMOTE_CONTAINERS || process.env.CODESPACES) return true;
	if (process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY && !isWSLEnv()) return true;
	return false;
}

//#endregion
//#region src/commands/oauth-flow.ts
const validateRequiredInput = (value) => value.trim().length > 0 ? void 0 : "Required";
function createVpsAwareOAuthHandlers(params) {
	const manualPromptMessage = params.manualPromptMessage ?? "Paste the redirect URL (or authorization code)";
	let manualCodePromise;
	return {
		onAuth: async ({ url }) => {
			if (params.isRemote) {
				params.spin.stop("OAuth URL ready");
				params.runtime.log(`\nOpen this URL in your LOCAL browser:\n\n${url}\n`);
				manualCodePromise = params.prompter.text({
					message: manualPromptMessage,
					validate: validateRequiredInput
				}).then((value) => String(value));
				return;
			}
			params.spin.update(params.localBrowserMessage);
			await params.openUrl(url);
			params.runtime.log(`Open: ${url}`);
		},
		onPrompt: async (prompt) => {
			if (manualCodePromise) return manualCodePromise;
			const code = await params.prompter.text({
				message: prompt.message,
				placeholder: prompt.placeholder,
				validate: validateRequiredInput
			});
			return String(code);
		}
	};
}

//#endregion
//#region src/commands/provider-auth-helpers.ts
function resolveProviderMatch(providers, rawProvider) {
	const raw = rawProvider?.trim();
	if (!raw) return null;
	const normalized = normalizeProviderId(raw);
	return providers.find((provider) => normalizeProviderId(provider.id) === normalized) ?? providers.find((provider) => provider.aliases?.some((alias) => normalizeProviderId(alias) === normalized) ?? false) ?? null;
}
function pickAuthMethod(provider, rawMethod) {
	const raw = rawMethod?.trim();
	if (!raw) return null;
	const normalized = raw.toLowerCase();
	return provider.auth.find((method) => method.id.toLowerCase() === normalized) ?? provider.auth.find((method) => method.label.toLowerCase() === normalized) ?? null;
}
function isPlainRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function mergeConfigPatch(base, patch) {
	if (!isPlainRecord(base) || !isPlainRecord(patch)) return patch;
	const next = { ...base };
	for (const [key, value] of Object.entries(patch)) {
		const existing = next[key];
		if (isPlainRecord(existing) && isPlainRecord(value)) next[key] = mergeConfigPatch(existing, value);
		else next[key] = value;
	}
	return next;
}
function applyDefaultModel(cfg, model) {
	const models = { ...cfg.agents?.defaults?.models };
	models[model] = models[model] ?? {};
	const existingModel = cfg.agents?.defaults?.model;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models,
				model: {
					...existingModel && typeof existingModel === "object" && "fallbacks" in existingModel ? { fallbacks: existingModel.fallbacks } : void 0,
					primary: model
				}
			}
		}
	};
}

//#endregion
//#region src/commands/models/shared.ts
const ensureFlagCompatibility = (opts) => {
	if (opts.json && opts.plain) throw new Error("Choose either --json or --plain, not both.");
};
const formatTokenK = (value) => {
	if (!value || !Number.isFinite(value)) return "-";
	if (value < 1024) return `${Math.round(value)}`;
	return `${Math.round(value / 1024)}k`;
};
const formatMs = (value) => {
	if (value === null || value === void 0) return "-";
	if (!Number.isFinite(value)) return "-";
	if (value < 1e3) return `${Math.round(value)}ms`;
	return `${Math.round(value / 100) / 10}s`;
};
const isLocalBaseUrl = (baseUrl) => {
	try {
		const host = new URL(baseUrl).hostname.toLowerCase();
		return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local");
	} catch {
		return false;
	}
};
async function updateConfig(mutator) {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) {
		const issues = snapshot.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n");
		throw new Error(`Invalid config at ${snapshot.path}\n${issues}`);
	}
	const next = mutator(snapshot.config);
	await writeConfigFile(next);
	return next;
}
function resolveModelTarget(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	const resolved = resolveModelRefFromString({
		raw: params.raw,
		defaultProvider: DEFAULT_PROVIDER,
		aliasIndex
	});
	if (!resolved) throw new Error(`Invalid model reference: ${params.raw}`);
	return resolved.ref;
}
function normalizeAlias(alias) {
	const trimmed = alias.trim();
	if (!trimmed) throw new Error("Alias cannot be empty.");
	if (!/^[A-Za-z0-9_.:-]+$/.test(trimmed)) throw new Error("Alias must use letters, numbers, dots, underscores, colons, or dashes.");
	return trimmed;
}
function resolveKnownAgentId(params) {
	const raw = params.rawAgentId?.trim();
	if (!raw) return;
	const agentId = normalizeAgentId(raw);
	if (!listAgentIds(params.cfg).includes(agentId)) throw new Error(`Unknown agent id "${raw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	return agentId;
}
/**
* Model key format: "provider/model"
*
* The model key is displayed in `/model status` and used to reference models.
* When using `/model <key>`, use the exact format shown (e.g., "openrouter/moonshotai/kimi-k2").
*
* For providers with hierarchical model IDs (e.g., OpenRouter), the model ID may include
* sub-providers (e.g., "moonshotai/kimi-k2"), resulting in a key like "openrouter/moonshotai/kimi-k2".
*/

//#endregion
//#region src/providers/github-copilot-auth.ts
const CLIENT_ID = "Iv1.b507a08c87ecfe98";
const DEVICE_CODE_URL = "https://github.com/login/device/code";
const ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
function parseJsonResponse(value) {
	if (!value || typeof value !== "object") throw new Error("Unexpected response from GitHub");
	return value;
}
async function requestDeviceCode(params) {
	const body = new URLSearchParams({
		client_id: CLIENT_ID,
		scope: params.scope
	});
	const res = await fetch(DEVICE_CODE_URL, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body
	});
	if (!res.ok) throw new Error(`GitHub device code failed: HTTP ${res.status}`);
	const json = parseJsonResponse(await res.json());
	if (!json.device_code || !json.user_code || !json.verification_uri) throw new Error("GitHub device code response missing fields");
	return json;
}
async function pollForAccessToken(params) {
	const bodyBase = new URLSearchParams({
		client_id: CLIENT_ID,
		device_code: params.deviceCode,
		grant_type: "urn:ietf:params:oauth:grant-type:device_code"
	});
	while (Date.now() < params.expiresAt) {
		const res = await fetch(ACCESS_TOKEN_URL, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: bodyBase
		});
		if (!res.ok) throw new Error(`GitHub device token failed: HTTP ${res.status}`);
		const json = parseJsonResponse(await res.json());
		if ("access_token" in json && typeof json.access_token === "string") return json.access_token;
		const err = "error" in json ? json.error : "unknown";
		if (err === "authorization_pending") {
			await new Promise((r) => setTimeout(r, params.intervalMs));
			continue;
		}
		if (err === "slow_down") {
			await new Promise((r) => setTimeout(r, params.intervalMs + 2e3));
			continue;
		}
		if (err === "expired_token") throw new Error("GitHub device code expired; run login again");
		if (err === "access_denied") throw new Error("GitHub login cancelled");
		throw new Error(`GitHub device flow error: ${err}`);
	}
	throw new Error("GitHub device code expired; run login again");
}
async function githubCopilotLoginCommand(opts, runtime) {
	if (!process.stdin.isTTY) throw new Error("github-copilot login requires an interactive TTY.");
	intro(stylePromptTitle("GitHub Copilot login"));
	const profileId = opts.profileId?.trim() || "github-copilot:github";
	if (ensureAuthProfileStore(void 0, { allowKeychainPrompt: false }).profiles[profileId] && !opts.yes) note(`Auth profile already exists: ${profileId}\nRe-running will overwrite it.`, stylePromptTitle("Existing credentials"));
	const spin = spinner();
	spin.start("Requesting device code from GitHub...");
	const device = await requestDeviceCode({ scope: "read:user" });
	spin.stop("Device code ready");
	note([`Visit: ${device.verification_uri}`, `Code: ${device.user_code}`].join("\n"), stylePromptTitle("Authorize"));
	const expiresAt = Date.now() + device.expires_in * 1e3;
	const intervalMs = Math.max(1e3, device.interval * 1e3);
	const polling = spinner();
	polling.start("Waiting for GitHub authorization...");
	const accessToken = await pollForAccessToken({
		deviceCode: device.device_code,
		intervalMs,
		expiresAt
	});
	polling.stop("GitHub access token acquired");
	upsertAuthProfile({
		profileId,
		credential: {
			type: "token",
			provider: "github-copilot",
			token: accessToken
		}
	});
	await updateConfig((cfg) => applyAuthProfileConfig(cfg, {
		provider: "github-copilot",
		profileId,
		mode: "token"
	}));
	logConfigUpdated(runtime);
	runtime.log(`Auth profile: ${profileId} (github-copilot/token)`);
	outro("Done");
}

//#endregion
export { applyVercelAiGatewayProviderConfig as $, applyMoonshotProviderConfig as A, ZAI_CN_BASE_URL as At, applyVeniceConfig as B, applyAuthProfileConfig as C, setXiaomiApiKey as Ct, applyKimiCodeProviderConfig as D, MOONSHOT_DEFAULT_MODEL_REF as Dt, applyKimiCodeConfig as E, KIMI_CODING_MODEL_REF as Et, applyQianfanProviderConfig as F, validateAnthropicSetupToken as Ft, applyXiaomiProviderConfig as G, applyXaiConfig as H, applySyntheticConfig as I, applyLitellmConfig as J, applyZaiConfig as K, applySyntheticProviderConfig as L, applyOpenrouterConfig as M, ZAI_CODING_GLOBAL_BASE_URL as Mt, applyOpenrouterProviderConfig as N, ZAI_GLOBAL_BASE_URL as Nt, applyMoonshotConfig as O, QIANFAN_DEFAULT_MODEL_REF as Ot, applyQianfanConfig as P, buildTokenProfileId as Pt, applyVercelAiGatewayConfig as Q, applyTogetherConfig as R, applyMinimaxProviderConfig as S, setXaiApiKey as St, applyHuggingfaceProviderConfig as T, writeOAuthCredentials as Tt, applyXaiProviderConfig as U, applyVeniceProviderConfig as V, applyXiaomiConfig as W, applyCloudflareAiGatewayConfig as X, applyLitellmProviderConfig as Y, applyCloudflareAiGatewayProviderConfig as Z, applyOpencodeZenConfig as _, setQianfanApiKey as _t, isLocalBaseUrl as a, XIAOMI_DEFAULT_MODEL_REF as at, applyMinimaxApiProviderConfig as b, setVeniceApiKey as bt, resolveModelTarget as c, setCloudflareAiGatewayConfig as ct, mergeConfigPatch as d, setKimiCodingApiKey as dt, HUGGINGFACE_DEFAULT_MODEL_REF as et, pickAuthMethod as f, setLitellmApiKey as ft, resolvePluginProviders as g, setOpenrouterApiKey as gt, isRemoteEnvironment as h, setOpencodeZenApiKey as ht, formatTokenK as i, VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF as it, applyMoonshotProviderConfigCn as j, ZAI_CODING_CN_BASE_URL as jt, applyMoonshotConfigCn as k, XAI_DEFAULT_MODEL_REF as kt, updateConfig as l, setGeminiApiKey as lt, createVpsAwareOAuthHandlers as m, setMoonshotApiKey as mt, ensureFlagCompatibility as n, OPENROUTER_DEFAULT_MODEL_REF as nt, normalizeAlias as o, ZAI_DEFAULT_MODEL_REF as ot, resolveProviderMatch as p, setMinimaxApiKey as pt, applyZaiProviderConfig as q, formatMs as r, TOGETHER_DEFAULT_MODEL_REF as rt, resolveKnownAgentId as s, setAnthropicApiKey as st, githubCopilotLoginCommand as t, LITELLM_DEFAULT_MODEL_REF as tt, applyDefaultModel as u, setHuggingfaceApiKey as ut, applyOpencodeZenProviderConfig as v, setSyntheticApiKey as vt, applyHuggingfaceConfig as w, setZaiApiKey as wt, applyMinimaxConfig as x, setVercelAiGatewayApiKey as xt, applyMinimaxApiConfig as y, setTogetherApiKey as yt, applyTogetherProviderConfig as z };