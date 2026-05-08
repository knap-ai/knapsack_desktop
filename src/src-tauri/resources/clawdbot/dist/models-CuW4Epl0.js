//#region extensions/cerebras/models.ts
const CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1";
const CEREBRAS_MODEL_CATALOG = [
	{
		id: "zai-glm-4.7",
		name: "Z.ai GLM 4.7",
		reasoning: true,
		input: ["text"],
		cost: {
			input: 2.25,
			output: 2.75,
			cacheRead: 2.25,
			cacheWrite: 2.75
		}
	},
	{
		id: "gpt-oss-120b",
		name: "GPT OSS 120B",
		reasoning: true,
		input: ["text"],
		cost: {
			input: .35,
			output: .75,
			cacheRead: .35,
			cacheWrite: .75
		}
	},
	{
		id: "qwen-3-235b-a22b-instruct-2507",
		name: "Qwen 3 235B Instruct",
		reasoning: false,
		input: ["text"],
		cost: {
			input: .6,
			output: 1.2,
			cacheRead: .6,
			cacheWrite: 1.2
		}
	},
	{
		id: "llama3.1-8b",
		name: "Llama 3.1 8B",
		reasoning: false,
		input: ["text"],
		cost: {
			input: .1,
			output: .1,
			cacheRead: .1,
			cacheWrite: .1
		}
	}
];
function buildCerebrasModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		api: "openai-completions",
		reasoning: model.reasoning,
		input: [...model.input],
		cost: model.cost,
		contextWindow: 128e3,
		maxTokens: 8192
	};
}
//#endregion
export { CEREBRAS_MODEL_CATALOG as n, buildCerebrasModelDefinition as r, CEREBRAS_BASE_URL as t };
