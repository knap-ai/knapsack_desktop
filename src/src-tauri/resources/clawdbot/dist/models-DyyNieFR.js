import { i as buildVolcModelDefinition, n as VOLC_MODEL_KIMI_K2_5, r as VOLC_SHARED_CODING_MODEL_CATALOG, t as VOLC_MODEL_GLM_4_7 } from "./volc-model-catalog-shared-DVTEU3_C.js";
//#region extensions/volcengine/models.ts
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DOUBAO_CODING_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3";
const DOUBAO_DEFAULT_MODEL_ID = "doubao-seed-1-8-251228";
const DOUBAO_CODING_DEFAULT_MODEL_ID = "ark-code-latest";
const DOUBAO_DEFAULT_MODEL_REF = `volcengine/${DOUBAO_DEFAULT_MODEL_ID}`;
const DOUBAO_DEFAULT_COST = {
	input: 1e-4,
	output: 2e-4,
	cacheRead: 0,
	cacheWrite: 0
};
const DOUBAO_MODEL_CATALOG = [
	{
		id: "doubao-seed-code-preview-251028",
		name: "doubao-seed-code-preview-251028",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "doubao-seed-1-8-251228",
		name: "Doubao Seed 1.8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	VOLC_MODEL_KIMI_K2_5,
	VOLC_MODEL_GLM_4_7,
	{
		id: "deepseek-v3-2-251201",
		name: "DeepSeek V3.2",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 4096
	}
];
const DOUBAO_CODING_MODEL_CATALOG = [...VOLC_SHARED_CODING_MODEL_CATALOG, {
	id: "doubao-seed-code-preview-251028",
	name: "Doubao Seed Code Preview",
	reasoning: false,
	input: ["text"],
	contextWindow: 256e3,
	maxTokens: 4096
}];
function buildDoubaoModelDefinition(entry) {
	return buildVolcModelDefinition(entry, DOUBAO_DEFAULT_COST);
}
//#endregion
export { DOUBAO_DEFAULT_COST as a, DOUBAO_MODEL_CATALOG as c, DOUBAO_CODING_MODEL_CATALOG as i, buildDoubaoModelDefinition as l, DOUBAO_CODING_BASE_URL as n, DOUBAO_DEFAULT_MODEL_ID as o, DOUBAO_CODING_DEFAULT_MODEL_ID as r, DOUBAO_DEFAULT_MODEL_REF as s, DOUBAO_BASE_URL as t };
