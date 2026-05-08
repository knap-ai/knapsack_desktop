import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { r as assertOkOrThrowHttpError } from "./provider-http-errors-DzWFsTc6.js";
import { l as sanitizeConfiguredModelProviderRequest } from "./provider-request-config-R6tp_Cvt.js";
import { a as postJsonRequest, u as resolveProviderHttpRequestConfig } from "./shared-BaGWsvKy.js";
import "./text-runtime-DfALcXL5.js";
import { t as isProviderApiKeyConfigured } from "./provider-auth-LNc11avL.js";
import "./provider-http-CPMTAn4V.js";
import { a as resolveApiKeyForProvider } from "./provider-auth-runtime-Brialwug.js";
import { t as LITELLM_BASE_URL } from "./onboard-BTnx7hPL.js";
//#region extensions/litellm/image-generation-provider.ts
const DEFAULT_OUTPUT_MIME = "image/png";
const DEFAULT_SIZE = "1024x1024";
const DEFAULT_LITELLM_IMAGE_MODEL = "gpt-image-2";
const LITELLM_SUPPORTED_SIZES = [
	"256x256",
	"512x512",
	"1024x1024",
	"1024x1536",
	"1024x1792",
	"1536x1024",
	"1792x1024",
	"2048x2048",
	"2048x1152",
	"3840x2160",
	"2160x3840"
];
const LITELLM_MAX_INPUT_IMAGES = 5;
function resolveLitellmProviderConfig(cfg) {
	return cfg?.models?.providers?.litellm;
}
function resolveConfiguredLitellmBaseUrl(cfg) {
	return normalizeOptionalString(resolveLitellmProviderConfig(cfg)?.baseUrl) ?? "http://localhost:4000";
}
function isAutoAllowedLitellmHostname(hostname) {
	if (!hostname) return false;
	const lowered = (hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname).toLowerCase();
	if (lowered === "localhost" || lowered === "host.docker.internal" || lowered.endsWith(".localhost")) return true;
	if (lowered === "127.0.0.1" || lowered.startsWith("127.")) return true;
	if (lowered === "::1" || lowered === "0:0:0:0:0:0:0:1") return true;
	return false;
}
function shouldAutoAllowPrivateLitellmEndpoint(baseUrl) {
	try {
		const parsed = new URL(baseUrl);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
		return isAutoAllowedLitellmHostname(parsed.hostname);
	} catch {
		return false;
	}
}
function toDataUrl(buffer, mimeType) {
	return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
function buildLitellmImageGenerationProvider() {
	return {
		id: "litellm",
		label: "LiteLLM",
		defaultModel: DEFAULT_LITELLM_IMAGE_MODEL,
		models: [DEFAULT_LITELLM_IMAGE_MODEL],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "litellm",
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
				maxInputImages: LITELLM_MAX_INPUT_IMAGES,
				supportsSize: true,
				supportsAspectRatio: false,
				supportsResolution: false
			},
			geometry: { sizes: [...LITELLM_SUPPORTED_SIZES] }
		},
		async generateImage(req) {
			const inputImages = req.inputImages ?? [];
			const isEdit = inputImages.length > 0;
			const auth = await resolveApiKeyForProvider({
				provider: "litellm",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("LiteLLM API key missing");
			const providerConfig = resolveLitellmProviderConfig(req.cfg);
			const resolvedBaseUrl = resolveConfiguredLitellmBaseUrl(req.cfg);
			const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: resolvedBaseUrl,
				defaultBaseUrl: LITELLM_BASE_URL,
				allowPrivateNetwork: shouldAutoAllowPrivateLitellmEndpoint(resolvedBaseUrl) ? true : void 0,
				request: sanitizeConfiguredModelProviderRequest(providerConfig?.request),
				defaultHeaders: { Authorization: `Bearer ${auth.apiKey}` },
				provider: "litellm",
				capability: "image",
				transport: "http"
			});
			const model = req.model || DEFAULT_LITELLM_IMAGE_MODEL;
			const count = req.count ?? 1;
			const size = req.size ?? DEFAULT_SIZE;
			const jsonHeaders = new Headers(headers);
			jsonHeaders.set("Content-Type", "application/json");
			const endpoint = isEdit ? "images/edits" : "images/generations";
			const body = isEdit ? {
				model,
				prompt: req.prompt,
				n: count,
				size,
				images: inputImages.map((image) => ({ image_url: toDataUrl(image.buffer, image.mimeType?.trim() || DEFAULT_OUTPUT_MIME) }))
			} : {
				model,
				prompt: req.prompt,
				n: count,
				size
			};
			const { response, release } = await postJsonRequest({
				url: `${baseUrl}/${endpoint}`,
				headers: jsonHeaders,
				body,
				timeoutMs: req.timeoutMs,
				fetchFn: fetch,
				allowPrivateNetwork,
				dispatcherPolicy
			});
			try {
				await assertOkOrThrowHttpError(response, isEdit ? "LiteLLM image edit failed" : "LiteLLM image generation failed");
				return {
					images: ((await response.json()).data ?? []).map((entry, index) => {
						if (!entry.b64_json) return null;
						return Object.assign({
							buffer: Buffer.from(entry.b64_json, `base64`),
							mimeType: DEFAULT_OUTPUT_MIME,
							fileName: `image-${index + 1}.png`
						}, entry.revised_prompt ? { revisedPrompt: entry.revised_prompt } : {});
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
export { buildLitellmImageGenerationProvider as t };
