import { i as buildVolcModelDefinition, n as VOLC_MODEL_KIMI_K2_5, r as VOLC_SHARED_CODING_MODEL_CATALOG, t as VOLC_MODEL_GLM_4_7 } from "./volc-model-catalog-shared-DVTEU3_C.js";
//#region extensions/byteplus/models.ts
const BYTEPLUS_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3";
const BYTEPLUS_CODING_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/coding/v3";
const BYTEPLUS_DEFAULT_MODEL_ID = "seed-1-8-251228";
const BYTEPLUS_CODING_DEFAULT_MODEL_ID = "ark-code-latest";
const BYTEPLUS_DEFAULT_MODEL_REF = `byteplus/${BYTEPLUS_DEFAULT_MODEL_ID}`;
const BYTEPLUS_DEFAULT_COST = {
	input: 1e-4,
	output: 2e-4,
	cacheRead: 0,
	cacheWrite: 0
};
const BYTEPLUS_MODEL_CATALOG = [
	{
		id: "seed-1-8-251228",
		name: "Seed 1.8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	VOLC_MODEL_KIMI_K2_5,
	VOLC_MODEL_GLM_4_7
];
const BYTEPLUS_CODING_MODEL_CATALOG = VOLC_SHARED_CODING_MODEL_CATALOG;
function buildBytePlusModelDefinition(entry) {
	return buildVolcModelDefinition(entry, BYTEPLUS_DEFAULT_COST);
}
//#endregion
export { BYTEPLUS_DEFAULT_COST as a, BYTEPLUS_MODEL_CATALOG as c, BYTEPLUS_CODING_MODEL_CATALOG as i, buildBytePlusModelDefinition as l, BYTEPLUS_CODING_BASE_URL as n, BYTEPLUS_DEFAULT_MODEL_ID as o, BYTEPLUS_CODING_DEFAULT_MODEL_ID as r, BYTEPLUS_DEFAULT_MODEL_REF as s, BYTEPLUS_BASE_URL as t };
