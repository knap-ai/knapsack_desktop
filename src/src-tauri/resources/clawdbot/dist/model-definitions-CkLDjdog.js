//#region extensions/modelstudio/model-definitions.ts
const MODELSTUDIO_CN_BASE_URL = "https://coding.dashscope.aliyuncs.com/v1";
const MODELSTUDIO_GLOBAL_BASE_URL = "https://coding-intl.dashscope.aliyuncs.com/v1";
const MODELSTUDIO_STANDARD_CN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODELSTUDIO_STANDARD_GLOBAL_BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const MODELSTUDIO_DEFAULT_MODEL_ID = "qwen3.5-plus";
const MODELSTUDIO_DEFAULT_MODEL_REF = `modelstudio/${MODELSTUDIO_DEFAULT_MODEL_ID}`;
const MODELSTUDIO_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MODELSTUDIO_MODEL_CATALOG = {
	"qwen3.5-plus": {
		name: "qwen3.5-plus",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 65536
	},
	"qwen3-max-2026-01-23": {
		name: "qwen3-max-2026-01-23",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536
	},
	"qwen3-coder-next": {
		name: "qwen3-coder-next",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536
	},
	"qwen3-coder-plus": {
		name: "qwen3-coder-plus",
		reasoning: false,
		input: ["text"],
		contextWindow: 1e6,
		maxTokens: 65536
	},
	"MiniMax-M2.5": {
		name: "MiniMax-M2.5",
		reasoning: false,
		input: ["text"],
		contextWindow: 1e6,
		maxTokens: 65536
	},
	"glm-5": {
		name: "glm-5",
		reasoning: false,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 16384
	},
	"glm-4.7": {
		name: "glm-4.7",
		reasoning: false,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 16384
	},
	"kimi-k2.5": {
		name: "kimi-k2.5",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 262144,
		maxTokens: 32768
	}
};
function buildModelStudioModelDefinition(params) {
	const catalog = MODELSTUDIO_MODEL_CATALOG[params.id];
	return {
		id: params.id,
		name: params.name ?? catalog?.name ?? params.id,
		reasoning: params.reasoning ?? catalog?.reasoning ?? false,
		input: params.input ?? [...catalog?.input ?? ["text"]],
		cost: params.cost ?? MODELSTUDIO_DEFAULT_COST,
		contextWindow: params.contextWindow ?? catalog?.contextWindow ?? 262144,
		maxTokens: params.maxTokens ?? catalog?.maxTokens ?? 65536
	};
}
function buildModelStudioDefaultModelDefinition() {
	return buildModelStudioModelDefinition({ id: MODELSTUDIO_DEFAULT_MODEL_ID });
}
//#endregion
export { MODELSTUDIO_GLOBAL_BASE_URL as a, buildModelStudioDefaultModelDefinition as c, MODELSTUDIO_DEFAULT_MODEL_REF as i, buildModelStudioModelDefinition as l, MODELSTUDIO_DEFAULT_COST as n, MODELSTUDIO_STANDARD_CN_BASE_URL as o, MODELSTUDIO_DEFAULT_MODEL_ID as r, MODELSTUDIO_STANDARD_GLOBAL_BASE_URL as s, MODELSTUDIO_CN_BASE_URL as t };
