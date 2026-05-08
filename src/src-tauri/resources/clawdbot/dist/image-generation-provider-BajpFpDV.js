import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { r as assertOkOrThrowHttpError } from "./provider-http-errors-DzWFsTc6.js";
import { a as postJsonRequest, d as resolveProviderOperationTimeoutMs, n as createProviderOperationDeadline, u as resolveProviderHttpRequestConfig } from "./shared-BaGWsvKy.js";
import "./text-runtime-DfALcXL5.js";
import { t as isProviderApiKeyConfigured } from "./provider-auth-LNc11avL.js";
import "./provider-http-CPMTAn4V.js";
import { a as resolveApiKeyForProvider } from "./provider-auth-runtime-Brialwug.js";
import { c as XAI_IMAGE_MODELS, i as XAI_DEFAULT_IMAGE_MODEL, t as XAI_BASE_URL } from "./model-definitions-CEROa3L0.js";
//#region extensions/xai/image-generation-provider.ts
const DEFAULT_OUTPUT_MIME = "image/png";
const DEFAULT_TIMEOUT_MS = 6e4;
const XAI_SUPPORTED_ASPECT_RATIOS = [
	"1:1",
	"16:9",
	"9:16",
	"4:3",
	"3:4",
	"2:3",
	"3:2"
];
function toDataUrl(buffer, mimeType) {
	return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
function resolveImageForEdit(input) {
	if (!input) throw new Error("xAI image edit requires an input image.");
	const url = normalizeOptionalString(input.url);
	if (url) return url;
	if (!input.buffer) throw new Error("xAI image edit input is missing both URL and buffer data.");
	const mime = normalizeOptionalString(input.mimeType) ?? "image/png";
	return toDataUrl(input.buffer, mime);
}
function isEdit(req) {
	return (req.inputImages?.length ?? 0) > 0;
}
function resolveXaiImageBaseUrl(req) {
	return normalizeOptionalString(req.cfg?.models?.providers?.xai?.baseUrl) ?? "https://api.x.ai/v1";
}
function buildBody(req, edit) {
	const model = normalizeOptionalString(req.model) ?? "grok-imagine-image";
	const count = req.count ?? 1;
	const body = {
		model,
		prompt: req.prompt,
		n: Math.min(count, 4),
		response_format: "b64_json"
	};
	const aspect = normalizeOptionalString(req.aspectRatio);
	if (aspect && XAI_SUPPORTED_ASPECT_RATIOS.includes(aspect)) body.aspect_ratio = aspect;
	const resolution = normalizeOptionalLowercaseString(req.resolution);
	if (resolution) body.resolution = resolution;
	if (edit) {
		const inputImages = req.inputImages ?? [];
		if (inputImages.length > 1) body.images = inputImages.map((input) => ({
			url: resolveImageForEdit(input),
			type: "image_url"
		}));
		else body.image = {
			url: resolveImageForEdit(inputImages[0]),
			type: "image_url"
		};
	}
	return body;
}
function buildXaiImageGenerationProvider() {
	return {
		id: "xai",
		label: "xAI",
		defaultModel: XAI_DEFAULT_IMAGE_MODEL,
		models: [...XAI_IMAGE_MODELS],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "xai",
			agentDir
		}),
		capabilities: {
			generate: {
				maxCount: 4,
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: false
			},
			edit: {
				enabled: true,
				maxCount: 4,
				maxInputImages: 5,
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: false
			},
			geometry: {
				aspectRatios: [...XAI_SUPPORTED_ASPECT_RATIOS],
				resolutions: ["1K", "2K"]
			}
		},
		async generateImage(req) {
			const edit = isEdit(req);
			const auth = await resolveApiKeyForProvider({
				provider: "xai",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("xAI API key missing");
			const fetchFn = fetch;
			const deadline = createProviderOperationDeadline({
				timeoutMs: req.timeoutMs,
				label: edit ? "xAI image edit" : "xAI image generation"
			});
			const { baseUrl: resolvedBaseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: resolveXaiImageBaseUrl(req),
				defaultBaseUrl: XAI_BASE_URL,
				allowPrivateNetwork: false,
				defaultHeaders: {
					Authorization: `Bearer ${auth.apiKey}`,
					"Content-Type": "application/json"
				},
				provider: "xai",
				capability: "image",
				transport: "http"
			});
			const body = buildBody(req, edit);
			const { response, release } = await postJsonRequest({
				url: `${resolvedBaseUrl}${edit ? "/images/edits" : "/images/generations"}`,
				headers,
				body,
				timeoutMs: resolveProviderOperationTimeoutMs({
					deadline,
					defaultTimeoutMs: DEFAULT_TIMEOUT_MS
				}),
				fetchFn,
				allowPrivateNetwork,
				dispatcherPolicy
			});
			try {
				await assertOkOrThrowHttpError(response, edit ? "xAI image edit failed" : "xAI image generation failed");
				return {
					images: ((await response.json()).data ?? []).flatMap((item, idx) => {
						if (!item) return [];
						const b64 = normalizeOptionalString(item.b64_json);
						if (!b64) return [];
						const mimeType = normalizeOptionalString(item.mime_type) ?? DEFAULT_OUTPUT_MIME;
						return [{
							buffer: Buffer.from(b64, "base64"),
							mimeType,
							fileName: `image-${idx + 1}.${mimeType.split("/")[1] || "png"}`,
							...item.revised_prompt ? { revisedPrompt: normalizeOptionalString(item.revised_prompt) } : {}
						}];
					}),
					model: normalizeOptionalString(req.model) ?? "grok-imagine-image"
				};
			} finally {
				await release();
			}
		}
	};
}
//#endregion
export { buildXaiImageGenerationProvider as t };
