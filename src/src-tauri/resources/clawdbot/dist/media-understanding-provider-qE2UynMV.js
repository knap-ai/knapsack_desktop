import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-H0HMzsrb.js";
import { i as postJsonRequest, s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import { i as resolveMediaUnderstandingString, n as buildOpenAiCompatibleVideoRequestBody, r as coerceOpenAiCompatibleVideoText } from "./media-understanding-B8ZG4o1-.js";
import "./provider-http--wdeUhlc.js";
import { v as QWEN_STANDARD_CN_BASE_URL, y as QWEN_STANDARD_GLOBAL_BASE_URL } from "./models-CRAy6kvH.js";
//#region extensions/qwen/media-understanding-provider.ts
const DEFAULT_QWEN_VIDEO_MODEL = "qwen-vl-max-latest";
const DEFAULT_QWEN_VIDEO_PROMPT = "Describe the video in detail.";
function resolveQwenStandardBaseUrl(cfg, providerId) {
	const direct = cfg?.models?.providers?.[providerId]?.baseUrl?.trim();
	if (!direct) return QWEN_STANDARD_GLOBAL_BASE_URL;
	try {
		const url = new URL(direct);
		if (url.hostname === "coding-intl.dashscope.aliyuncs.com") return QWEN_STANDARD_GLOBAL_BASE_URL;
		if (url.hostname === "coding.dashscope.aliyuncs.com") return QWEN_STANDARD_CN_BASE_URL;
		return `${url.origin}${url.pathname}`.replace(/\/+$/u, "");
	} catch {
		return QWEN_STANDARD_GLOBAL_BASE_URL;
	}
}
async function describeQwenVideo(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const model = resolveMediaUnderstandingString(params.model, DEFAULT_QWEN_VIDEO_MODEL);
	const mime = resolveMediaUnderstandingString(params.mime, "video/mp4");
	const prompt = resolveMediaUnderstandingString(params.prompt, DEFAULT_QWEN_VIDEO_PROMPT);
	const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
		baseUrl: params.baseUrl,
		defaultBaseUrl: QWEN_STANDARD_GLOBAL_BASE_URL,
		headers: params.headers,
		request: params.request,
		defaultHeaders: {
			"content-type": "application/json",
			authorization: `Bearer ${params.apiKey}`
		},
		provider: "qwen",
		api: "openai-completions",
		capability: "video",
		transport: "media-understanding"
	});
	const { response: res, release } = await postJsonRequest({
		url: `${baseUrl}/chat/completions`,
		headers,
		body: buildOpenAiCompatibleVideoRequestBody({
			model,
			prompt,
			mime,
			buffer: params.buffer
		}),
		timeoutMs: params.timeoutMs,
		fetchFn,
		allowPrivateNetwork,
		dispatcherPolicy
	});
	try {
		await assertOkOrThrowHttpError(res, "Qwen video description failed");
		const text = coerceOpenAiCompatibleVideoText(await res.json());
		if (!text) throw new Error("Qwen video description response missing content");
		return {
			text,
			model
		};
	} finally {
		await release();
	}
}
function buildQwenMediaUnderstandingProvider() {
	return {
		id: "qwen",
		capabilities: ["image", "video"],
		defaultModels: {
			image: "qwen-vl-max-latest",
			video: DEFAULT_QWEN_VIDEO_MODEL
		},
		autoPriority: { video: 15 },
		describeImage: describeImageWithModel,
		describeImages: describeImagesWithModel,
		describeVideo: describeQwenVideo
	};
}
function resolveQwenMediaUnderstandingBaseUrl(cfg) {
	return resolveQwenStandardBaseUrl(cfg, "qwen");
}
//#endregion
export { describeQwenVideo as n, resolveQwenMediaUnderstandingBaseUrl as r, buildQwenMediaUnderstandingProvider as t };
