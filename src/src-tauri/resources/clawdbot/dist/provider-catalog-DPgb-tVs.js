//#region extensions/modelstudio/provider-catalog.ts
const MODELSTUDIO_BASE_URL = "https://coding-intl.dashscope.aliyuncs.com/v1";
const MODELSTUDIO_DEFAULT_MODEL_ID = "qwen3.5-plus";
const MODELSTUDIO_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MODELSTUDIO_MODEL_CATALOG = [
	{
		id: "qwen3.5-plus",
		name: "qwen3.5-plus",
		reasoning: false,
		input: ["text", "image"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 1e6,
		maxTokens: 65536
	},
	{
		id: "qwen3-max-2026-01-23",
		name: "qwen3-max-2026-01-23",
		reasoning: false,
		input: ["text"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 262144,
		maxTokens: 65536
	},
	{
		id: "qwen3-coder-next",
		name: "qwen3-coder-next",
		reasoning: false,
		input: ["text"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 262144,
		maxTokens: 65536
	},
	{
		id: "qwen3-coder-plus",
		name: "qwen3-coder-plus",
		reasoning: false,
		input: ["text"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 1e6,
		maxTokens: 65536
	},
	{
		id: "MiniMax-M2.5",
		name: "MiniMax-M2.5",
		reasoning: true,
		input: ["text"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 1e6,
		maxTokens: 65536
	},
	{
		id: "glm-5",
		name: "glm-5",
		reasoning: false,
		input: ["text"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 202752,
		maxTokens: 16384
	},
	{
		id: "glm-4.7",
		name: "glm-4.7",
		reasoning: false,
		input: ["text"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 202752,
		maxTokens: 16384
	},
	{
		id: "kimi-k2.5",
		name: "kimi-k2.5",
		reasoning: false,
		input: ["text", "image"],
		cost: MODELSTUDIO_DEFAULT_COST,
		contextWindow: 262144,
		maxTokens: 32768
	}
];
function buildModelStudioProvider() {
	return {
		baseUrl: MODELSTUDIO_BASE_URL,
		api: "openai-completions",
		models: MODELSTUDIO_MODEL_CATALOG.map((model) => ({ ...model }))
	};
}
//#endregion
export { MODELSTUDIO_DEFAULT_MODEL_ID as n, buildModelStudioProvider as r, MODELSTUDIO_BASE_URL as t };
