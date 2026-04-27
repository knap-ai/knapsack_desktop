//#region extensions/stepfun/provider-catalog.ts
const STEPFUN_PROVIDER_ID = "stepfun";
const STEPFUN_PLAN_PROVIDER_ID = "stepfun-plan";
const STEPFUN_STANDARD_CN_BASE_URL = "https://api.stepfun.com/v1";
const STEPFUN_STANDARD_INTL_BASE_URL = "https://api.stepfun.ai/v1";
const STEPFUN_PLAN_CN_BASE_URL = "https://api.stepfun.com/step_plan/v1";
const STEPFUN_PLAN_INTL_BASE_URL = "https://api.stepfun.ai/step_plan/v1";
const STEPFUN_DEFAULT_MODEL_ID = "step-3.5-flash";
const STEPFUN_FLASH_2603_MODEL_ID = "step-3.5-flash-2603";
const STEPFUN_DEFAULT_MODEL_REF = `${STEPFUN_PROVIDER_ID}/${STEPFUN_DEFAULT_MODEL_ID}`;
const STEPFUN_PLAN_DEFAULT_MODEL_REF = `${STEPFUN_PLAN_PROVIDER_ID}/${STEPFUN_DEFAULT_MODEL_ID}`;
const STEPFUN_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildStepFunModel(id, name) {
	return {
		id,
		name,
		reasoning: true,
		input: ["text"],
		cost: STEPFUN_DEFAULT_COST,
		contextWindow: 262144,
		maxTokens: 65536
	};
}
const STEPFUN_STANDARD_MODEL_CATALOG = [buildStepFunModel(STEPFUN_DEFAULT_MODEL_ID, "Step 3.5 Flash")];
const STEPFUN_PLAN_MODEL_CATALOG = [buildStepFunModel(STEPFUN_DEFAULT_MODEL_ID, "Step 3.5 Flash"), buildStepFunModel(STEPFUN_FLASH_2603_MODEL_ID, "Step 3.5 Flash 2603")];
function cloneCatalog(models) {
	return models.map((model) => ({ ...model }));
}
function buildStepFunProvider(baseUrl = STEPFUN_STANDARD_INTL_BASE_URL) {
	return {
		baseUrl,
		api: "openai-completions",
		models: cloneCatalog(STEPFUN_STANDARD_MODEL_CATALOG)
	};
}
function buildStepFunPlanProvider(baseUrl = STEPFUN_PLAN_INTL_BASE_URL) {
	return {
		baseUrl,
		api: "openai-completions",
		models: cloneCatalog(STEPFUN_PLAN_MODEL_CATALOG)
	};
}
//#endregion
export { STEPFUN_PLAN_DEFAULT_MODEL_REF as a, STEPFUN_PROVIDER_ID as c, buildStepFunPlanProvider as d, buildStepFunProvider as f, STEPFUN_PLAN_CN_BASE_URL as i, STEPFUN_STANDARD_CN_BASE_URL as l, STEPFUN_DEFAULT_MODEL_REF as n, STEPFUN_PLAN_INTL_BASE_URL as o, STEPFUN_FLASH_2603_MODEL_ID as r, STEPFUN_PLAN_PROVIDER_ID as s, STEPFUN_DEFAULT_MODEL_ID as t, STEPFUN_STANDARD_INTL_BASE_URL as u };
