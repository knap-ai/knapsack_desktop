//#region extensions/fireworks/provider-catalog.ts
const FIREWORKS_BASE_URL = "https://api.fireworks.ai/inference/v1";
const FIREWORKS_DEFAULT_MODEL_ID = "accounts/fireworks/routers/kimi-k2p5-turbo";
const FIREWORKS_DEFAULT_CONTEXT_WINDOW = 256e3;
const FIREWORKS_DEFAULT_MAX_TOKENS = 256e3;
const ZERO_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildFireworksCatalogModels() {
	return [{
		id: FIREWORKS_DEFAULT_MODEL_ID,
		name: "Kimi K2.5 Turbo (Fire Pass)",
		reasoning: false,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: FIREWORKS_DEFAULT_CONTEXT_WINDOW,
		maxTokens: FIREWORKS_DEFAULT_MAX_TOKENS
	}];
}
function buildFireworksProvider() {
	return {
		baseUrl: FIREWORKS_BASE_URL,
		api: "openai-completions",
		models: buildFireworksCatalogModels()
	};
}
//#endregion
export { buildFireworksCatalogModels as a, FIREWORKS_DEFAULT_MODEL_ID as i, FIREWORKS_DEFAULT_CONTEXT_WINDOW as n, buildFireworksProvider as o, FIREWORKS_DEFAULT_MAX_TOKENS as r, FIREWORKS_BASE_URL as t };
