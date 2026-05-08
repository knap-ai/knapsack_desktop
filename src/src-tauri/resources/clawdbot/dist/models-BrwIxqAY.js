//#region extensions/deepseek/models.ts
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_V3_2_COST = {
	input: .28,
	output: .42,
	cacheRead: .028,
	cacheWrite: 0
};
const DEEPSEEK_MODEL_CATALOG = [
	{
		id: "deepseek-v4-flash",
		name: "DeepSeek V4 Flash",
		reasoning: true,
		input: ["text"],
		contextWindow: 1e6,
		maxTokens: 384e3,
		cost: {
			input: .14,
			output: .28,
			cacheRead: .028,
			cacheWrite: 0
		},
		compat: {
			supportsUsageInStreaming: true,
			supportsReasoningEffort: true,
			maxTokensField: "max_tokens"
		}
	},
	{
		id: "deepseek-v4-pro",
		name: "DeepSeek V4 Pro",
		reasoning: true,
		input: ["text"],
		contextWindow: 1e6,
		maxTokens: 384e3,
		cost: {
			input: 1.74,
			output: 3.48,
			cacheRead: .145,
			cacheWrite: 0
		},
		compat: {
			supportsUsageInStreaming: true,
			supportsReasoningEffort: true,
			maxTokensField: "max_tokens"
		}
	},
	{
		id: "deepseek-chat",
		name: "DeepSeek Chat",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: DEEPSEEK_V3_2_COST,
		compat: {
			supportsUsageInStreaming: true,
			maxTokensField: "max_tokens"
		}
	},
	{
		id: "deepseek-reasoner",
		name: "DeepSeek Reasoner",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 65536,
		cost: DEEPSEEK_V3_2_COST,
		compat: {
			supportsUsageInStreaming: true,
			supportsReasoningEffort: false,
			maxTokensField: "max_tokens"
		}
	}
];
function buildDeepSeekModelDefinition(model) {
	return {
		...model,
		api: "openai-completions"
	};
}
//#endregion
export { DEEPSEEK_MODEL_CATALOG as n, buildDeepSeekModelDefinition as r, DEEPSEEK_BASE_URL as t };
