import type { ModelDefinitionConfig } from "../config/types.models.js";
import { KILOCODE_DEFAULT_CONTEXT_WINDOW, KILOCODE_DEFAULT_COST, KILOCODE_DEFAULT_MAX_TOKENS, KILOCODE_DEFAULT_MODEL_ID } from "./provider-model-kilocode.js";
declare const KIMI_CODING_BASE_URL = "https://api.kimi.com/coding/";
declare const KIMI_CODING_MODEL_ID = "kimi-code";
declare const KIMI_CODING_MODEL_REF = "kimi/kimi-code";
declare const DEFAULT_MINIMAX_BASE_URL = "https://api.minimax.io/v1";
declare const MINIMAX_API_BASE_URL = "https://api.minimax.io/anthropic";
declare const MINIMAX_CN_API_BASE_URL = "https://api.minimaxi.com/anthropic";
declare const MINIMAX_HOSTED_MODEL_ID = "MiniMax-M2.7";
declare const MINIMAX_HOSTED_MODEL_REF = "minimax/MiniMax-M2.7";
declare const MINIMAX_API_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare const MINIMAX_HOSTED_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare const MINIMAX_LM_STUDIO_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";
declare const MISTRAL_DEFAULT_MODEL_ID = "mistral-large-latest";
declare const MISTRAL_DEFAULT_MODEL_REF = "mistral/mistral-large-latest";
declare const MISTRAL_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare const MODELSTUDIO_CN_BASE_URL = "https://coding.dashscope.aliyuncs.com/v1";
declare const MODELSTUDIO_GLOBAL_BASE_URL = "https://coding-intl.dashscope.aliyuncs.com/v1";
declare const MODELSTUDIO_DEFAULT_MODEL_ID = "qwen3.5-plus";
declare const MODELSTUDIO_DEFAULT_MODEL_REF = "modelstudio/qwen3.5-plus";
declare const MODELSTUDIO_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare const MOONSHOT_BASE_URL = "https://api.moonshot.ai/v1";
declare const MOONSHOT_CN_BASE_URL = "https://api.moonshot.cn/v1";
declare const MOONSHOT_DEFAULT_MODEL_ID = "kimi-k2.5";
declare const MOONSHOT_DEFAULT_MODEL_REF = "moonshot/kimi-k2.5";
declare const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
declare const QIANFAN_DEFAULT_MODEL_ID = "deepseek-v3.2";
declare const QIANFAN_DEFAULT_MODEL_REF = "qianfan/deepseek-v3.2";
declare const XAI_BASE_URL = "https://api.x.ai/v1";
declare const XAI_DEFAULT_MODEL_ID = "grok-4";
declare const XAI_DEFAULT_MODEL_REF = "xai/grok-4";
declare const XAI_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare const ZAI_CODING_GLOBAL_BASE_URL = "https://api.z.ai/api/coding/paas/v4";
declare const ZAI_CODING_CN_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4";
declare const ZAI_GLOBAL_BASE_URL = "https://api.z.ai/api/paas/v4";
declare const ZAI_CN_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
declare const ZAI_DEFAULT_MODEL_ID = "glm-5";
declare const ZAI_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
declare function buildMinimaxModelDefinition(params: {
    id: string;
    name?: string;
    reasoning?: boolean;
    cost: ModelDefinitionConfig["cost"];
    contextWindow: number;
    maxTokens: number;
}): ModelDefinitionConfig;
declare function buildMinimaxApiModelDefinition(modelId: string): ModelDefinitionConfig;
declare function buildMistralModelDefinition(): ModelDefinitionConfig;
declare function buildModelStudioModelDefinition(params: {
    id: string;
    name?: string;
    reasoning?: boolean;
    input?: string[];
    cost?: ModelDefinitionConfig["cost"];
    contextWindow?: number;
    maxTokens?: number;
}): ModelDefinitionConfig;
declare function buildModelStudioDefaultModelDefinition(): ModelDefinitionConfig;
declare function buildXaiModelDefinition(): ModelDefinitionConfig;
declare function resolveZaiBaseUrl(endpoint?: string): string;
declare function buildZaiModelDefinition(params: {
    id: string;
    name?: string;
    reasoning?: boolean;
    cost?: ModelDefinitionConfig["cost"];
    contextWindow?: number;
    maxTokens?: number;
}): ModelDefinitionConfig;
export { DEFAULT_MINIMAX_BASE_URL, MINIMAX_API_BASE_URL, MINIMAX_API_COST, MINIMAX_CN_API_BASE_URL, MINIMAX_HOSTED_COST, MINIMAX_HOSTED_MODEL_ID, MINIMAX_HOSTED_MODEL_REF, MINIMAX_LM_STUDIO_COST, MISTRAL_BASE_URL, MISTRAL_DEFAULT_COST, MISTRAL_DEFAULT_MODEL_ID, MISTRAL_DEFAULT_MODEL_REF, MODELSTUDIO_CN_BASE_URL, MODELSTUDIO_DEFAULT_COST, MODELSTUDIO_DEFAULT_MODEL_ID, MODELSTUDIO_DEFAULT_MODEL_REF, MODELSTUDIO_GLOBAL_BASE_URL, MOONSHOT_BASE_URL, MOONSHOT_CN_BASE_URL, MOONSHOT_DEFAULT_MODEL_ID, MOONSHOT_DEFAULT_MODEL_REF, QIANFAN_BASE_URL, QIANFAN_DEFAULT_MODEL_ID, QIANFAN_DEFAULT_MODEL_REF, XAI_BASE_URL, XAI_DEFAULT_COST, XAI_DEFAULT_MODEL_ID, XAI_DEFAULT_MODEL_REF, ZAI_CN_BASE_URL, ZAI_CODING_CN_BASE_URL, ZAI_CODING_GLOBAL_BASE_URL, ZAI_DEFAULT_COST, ZAI_DEFAULT_MODEL_ID, ZAI_GLOBAL_BASE_URL, KIMI_CODING_BASE_URL, KIMI_CODING_MODEL_ID, KIMI_CODING_MODEL_REF, KILOCODE_DEFAULT_CONTEXT_WINDOW, KILOCODE_DEFAULT_COST, KILOCODE_DEFAULT_MAX_TOKENS, KILOCODE_DEFAULT_MODEL_ID, buildMinimaxApiModelDefinition, buildMinimaxModelDefinition, buildMistralModelDefinition, buildModelStudioDefaultModelDefinition, buildModelStudioModelDefinition, buildXaiModelDefinition, buildZaiModelDefinition, resolveZaiBaseUrl, };
export declare function buildMoonshotModelDefinition(): ModelDefinitionConfig;
export declare function buildKilocodeModelDefinition(): ModelDefinitionConfig;
