import { i as postJsonRequest, s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import { t as isProviderApiKeyConfigured } from "./provider-auth-DWLaZig-.js";
import "./provider-http--wdeUhlc.js";
import { n as resolveApiKeyForProvider } from "./provider-auth-runtime-CcRok2NR.js";
import { i as OPENAI_DEFAULT_IMAGE_MODEL } from "./default-models-Cx4ERJPE.js";
import { a as resolveConfiguredOpenAIBaseUrl, o as toOpenAIDataUrl } from "./shared-ZzBZzSl4.js";
//#region extensions/openai/image-generation-provider.ts
const DEFAULT_OPENAI_IMAGE_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OUTPUT_MIME = "image/png";
const DEFAULT_SIZE = "1024x1024";
const OPENAI_SUPPORTED_SIZES = [
	"1024x1024",
	"1024x1536",
	"1536x1024"
];
const OPENAI_MAX_INPUT_IMAGES = 5;
const MOCK_OPENAI_PROVIDER_ID = "mock-openai";
function shouldAllowPrivateImageEndpoint(req) {
	if (req.provider === MOCK_OPENAI_PROVIDER_ID) return true;
	const baseUrl = resolveConfiguredOpenAIBaseUrl(req.cfg);
	if (!baseUrl.startsWith("http://127.0.0.1:") && !baseUrl.startsWith("http://localhost:")) return false;
	return process.env.OPENCLAW_QA_ALLOW_LOCAL_IMAGE_PROVIDER === "1";
}
function buildOpenAIImageGenerationProvider() {
	return {
		id: "openai",
		label: "OpenAI",
		defaultModel: OPENAI_DEFAULT_IMAGE_MODEL,
		models: [OPENAI_DEFAULT_IMAGE_MODEL],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "openai",
			agentDir
		}),
		capabilities: {
			generate: {
				maxCount: 4,
				supportsSize: true,
				supportsAspectRatio: false,
				supportsResolution: false
			},
			edit: {
				enabled: true,
				maxCount: 4,
				maxInputImages: OPENAI_MAX_INPUT_IMAGES,
				supportsSize: true,
				supportsAspectRatio: false,
				supportsResolution: false
			},
			geometry: { sizes: [...OPENAI_SUPPORTED_SIZES] }
		},
		async generateImage(req) {
			const inputImages = req.inputImages ?? [];
			const isEdit = inputImages.length > 0;
			const auth = await resolveApiKeyForProvider({
				provider: "openai",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("OpenAI API key missing");
			const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: resolveConfiguredOpenAIBaseUrl(req.cfg),
				defaultBaseUrl: DEFAULT_OPENAI_IMAGE_BASE_URL,
				allowPrivateNetwork: shouldAllowPrivateImageEndpoint(req),
				defaultHeaders: { Authorization: `Bearer ${auth.apiKey}` },
				provider: "openai",
				capability: "image",
				transport: "http"
			});
			const model = req.model || "gpt-image-1";
			const count = req.count ?? 1;
			const size = req.size ?? DEFAULT_SIZE;
			const { response, release } = isEdit ? await (() => {
				const jsonHeaders = new Headers(headers);
				jsonHeaders.set("Content-Type", "application/json");
				return postJsonRequest({
					url: `${baseUrl}/images/edits`,
					headers: jsonHeaders,
					body: {
						model,
						prompt: req.prompt,
						n: count,
						size,
						images: inputImages.map((image) => ({ image_url: toOpenAIDataUrl(image.buffer, image.mimeType?.trim() || DEFAULT_OUTPUT_MIME) }))
					},
					timeoutMs: req.timeoutMs,
					fetchFn: fetch,
					allowPrivateNetwork,
					dispatcherPolicy
				});
			})() : await (() => {
				const jsonHeaders = new Headers(headers);
				jsonHeaders.set("Content-Type", "application/json");
				return postJsonRequest({
					url: `${baseUrl}/images/generations`,
					headers: jsonHeaders,
					body: {
						model,
						prompt: req.prompt,
						n: count,
						size
					},
					timeoutMs: req.timeoutMs,
					fetchFn: fetch,
					allowPrivateNetwork,
					dispatcherPolicy
				});
			})();
			try {
				await assertOkOrThrowHttpError(response, isEdit ? "OpenAI image edit failed" : "OpenAI image generation failed");
				return {
					images: ((await response.json()).data ?? []).map((entry, index) => {
						if (!entry.b64_json) return null;
						return {
							buffer: Buffer.from(entry.b64_json, "base64"),
							mimeType: DEFAULT_OUTPUT_MIME,
							fileName: `image-${index + 1}.png`,
							...entry.revised_prompt ? { revisedPrompt: entry.revised_prompt } : {}
						};
					}).filter((entry) => entry !== null),
					model
				};
			} finally {
				await release();
			}
		}
	};
}
//#endregion
export { buildOpenAIImageGenerationProvider as t };
