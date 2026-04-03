import { o as resolveProviderHttpRequestConfig, r as postJsonRequest, t as assertOkOrThrowHttpError } from "./shared-bNb64sx7.js";
import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-DrCqEvKh.js";
import "./media-understanding-CbOWvFaG.js";
import "./provider-http-CMHzFsgV.js";
//#region extensions/moonshot/media-understanding-provider.ts
const DEFAULT_MOONSHOT_VIDEO_BASE_URL = "https://api.moonshot.ai/v1";
const DEFAULT_MOONSHOT_VIDEO_MODEL = "kimi-k2.5";
const DEFAULT_MOONSHOT_VIDEO_PROMPT = "Describe the video.";
function resolveModel(model) {
	return model?.trim() || DEFAULT_MOONSHOT_VIDEO_MODEL;
}
function resolvePrompt(prompt) {
	return prompt?.trim() || DEFAULT_MOONSHOT_VIDEO_PROMPT;
}
function coerceMoonshotText(payload) {
	const message = payload.choices?.[0]?.message;
	if (!message) return null;
	if (typeof message.content === "string" && message.content.trim()) return message.content.trim();
	if (Array.isArray(message.content)) {
		const text = message.content.map((part) => typeof part.text === "string" ? part.text.trim() : "").filter(Boolean).join("\n").trim();
		if (text) return text;
	}
	if (typeof message.reasoning_content === "string" && message.reasoning_content.trim()) return message.reasoning_content.trim();
	return null;
}
async function describeMoonshotVideo(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const model = resolveModel(params.model);
	const mime = params.mime ?? "video/mp4";
	const prompt = resolvePrompt(params.prompt);
	const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
		baseUrl: params.baseUrl,
		defaultBaseUrl: DEFAULT_MOONSHOT_VIDEO_BASE_URL,
		headers: params.headers,
		request: params.request,
		defaultHeaders: {
			"content-type": "application/json",
			authorization: `Bearer ${params.apiKey}`
		},
		provider: "moonshot",
		api: "openai-completions",
		capability: "video",
		transport: "media-understanding"
	});
	const { response: res, release } = await postJsonRequest({
		url: `${baseUrl}/chat/completions`,
		headers,
		body: {
			model,
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: prompt
				}, {
					type: "video_url",
					video_url: { url: `data:${mime};base64,${params.buffer.toString("base64")}` }
				}]
			}]
		},
		timeoutMs: params.timeoutMs,
		fetchFn,
		allowPrivateNetwork,
		dispatcherPolicy
	});
	try {
		await assertOkOrThrowHttpError(res, "Moonshot video description failed");
		const text = coerceMoonshotText(await res.json());
		if (!text) throw new Error("Moonshot video description response missing content");
		return {
			text,
			model
		};
	} finally {
		await release();
	}
}
const moonshotMediaUnderstandingProvider = {
	id: "moonshot",
	capabilities: ["image", "video"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel,
	describeVideo: describeMoonshotVideo
};
//#endregion
export { describeMoonshotVideo as n, moonshotMediaUnderstandingProvider as r, DEFAULT_MOONSHOT_VIDEO_BASE_URL as t };
