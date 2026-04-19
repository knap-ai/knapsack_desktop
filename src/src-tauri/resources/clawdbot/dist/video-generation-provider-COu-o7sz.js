import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import "./text-runtime-DTMxvodz.js";
import { t as isProviderApiKeyConfigured } from "./provider-auth-DWLaZig-.js";
import { u as ssrfPolicyFromDangerouslyAllowPrivateNetwork } from "./ssrf-policy-CChtVzhj.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./provider-http--wdeUhlc.js";
import { n as resolveApiKeyForProvider } from "./provider-auth-runtime-CcRok2NR.js";
//#region extensions/fal/video-generation-provider.ts
const DEFAULT_FAL_BASE_URL = "https://fal.run";
const DEFAULT_FAL_QUEUE_BASE_URL = "https://queue.fal.run";
const DEFAULT_FAL_VIDEO_MODEL = "fal-ai/minimax/video-01-live";
const HEYGEN_VIDEO_AGENT_MODEL = "fal-ai/heygen/v2/video-agent";
const SEEDANCE_2_VIDEO_MODELS = [
	"bytedance/seedance-2.0/fast/text-to-video",
	"bytedance/seedance-2.0/fast/image-to-video",
	"bytedance/seedance-2.0/text-to-video",
	"bytedance/seedance-2.0/image-to-video"
];
const SEEDANCE_2_DURATION_SECONDS = [
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15
];
const DEFAULT_HTTP_TIMEOUT_MS = 3e4;
const DEFAULT_OPERATION_TIMEOUT_MS = 6e5;
const POLL_INTERVAL_MS = 5e3;
let falFetchGuard = fetchWithSsrFGuard;
function _setFalVideoFetchGuardForTesting(impl) {
	falFetchGuard = impl ?? fetchWithSsrFGuard;
}
function toDataUrl(buffer, mimeType) {
	return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
function buildPolicy(allowPrivateNetwork) {
	return allowPrivateNetwork ? ssrfPolicyFromDangerouslyAllowPrivateNetwork(true) : void 0;
}
function extractFalVideoEntry(payload) {
	if (normalizeOptionalString(payload.video?.url)) return payload.video;
	return payload.videos?.find((entry) => normalizeOptionalString(entry.url));
}
async function downloadFalVideo(url, policy) {
	const { response, release } = await falFetchGuard({
		url,
		timeoutMs: DEFAULT_HTTP_TIMEOUT_MS,
		policy,
		auditContext: "fal-video-download"
	});
	try {
		await assertOkOrThrowHttpError(response, "fal generated video download failed");
		const mimeType = normalizeOptionalString(response.headers.get("content-type")) ?? "video/mp4";
		const arrayBuffer = await response.arrayBuffer();
		return {
			buffer: Buffer.from(arrayBuffer),
			mimeType,
			fileName: `video-1.${mimeType.includes("webm") ? "webm" : "mp4"}`
		};
	} finally {
		await release();
	}
}
function resolveFalQueueBaseUrl(baseUrl) {
	try {
		const url = new URL(baseUrl);
		if (url.hostname === "fal.run") {
			url.hostname = "queue.fal.run";
			return url.toString().replace(/\/$/, "");
		}
		return baseUrl.replace(/\/$/, "");
	} catch {
		return DEFAULT_FAL_QUEUE_BASE_URL;
	}
}
function isFalMiniMaxLiveModel(model) {
	return normalizeLowercaseStringOrEmpty(model) === DEFAULT_FAL_VIDEO_MODEL;
}
function isFalSeedance2Model(model) {
	return SEEDANCE_2_VIDEO_MODELS.includes(model);
}
function isFalHeyGenVideoAgentModel(model) {
	return normalizeLowercaseStringOrEmpty(model) === HEYGEN_VIDEO_AGENT_MODEL;
}
function resolveFalResolution(resolution, model) {
	if (!resolution) return;
	if (isFalSeedance2Model(model)) return resolution.toLowerCase();
	return resolution;
}
function resolveFalDuration(durationSeconds, model) {
	if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds)) return;
	const duration = Math.max(1, Math.round(durationSeconds));
	if (isFalSeedance2Model(model)) return String(duration);
	return duration;
}
function buildFalVideoRequestBody(params) {
	const requestBody = { prompt: params.req.prompt };
	const input = params.req.inputImages?.[0];
	if (input) requestBody.image_url = normalizeOptionalString(input.url) ? normalizeOptionalString(input.url) : input.buffer ? toDataUrl(input.buffer, normalizeOptionalString(input.mimeType) ?? "image/png") : void 0;
	if (isFalMiniMaxLiveModel(params.model) || isFalHeyGenVideoAgentModel(params.model)) return requestBody;
	const aspectRatio = normalizeOptionalString(params.req.aspectRatio);
	if (aspectRatio) requestBody.aspect_ratio = aspectRatio;
	const size = normalizeOptionalString(params.req.size);
	if (size) requestBody.size = size;
	const resolution = resolveFalResolution(params.req.resolution, params.model);
	if (resolution) requestBody.resolution = resolution;
	const duration = resolveFalDuration(params.req.durationSeconds, params.model);
	if (duration) requestBody.duration = duration;
	if (isFalSeedance2Model(params.model) && typeof params.req.audio === "boolean") requestBody.generate_audio = params.req.audio;
	return requestBody;
}
async function fetchFalJson(params) {
	const { response, release } = await falFetchGuard({
		url: params.url,
		init: params.init,
		timeoutMs: params.timeoutMs,
		policy: params.policy,
		dispatcherPolicy: params.dispatcherPolicy,
		auditContext: params.auditContext
	});
	try {
		await assertOkOrThrowHttpError(response, params.errorContext);
		return await response.json();
	} finally {
		await release();
	}
}
async function waitForFalQueueResult(params) {
	const deadline = Date.now() + params.timeoutMs;
	let lastStatus = "unknown";
	while (Date.now() < deadline) {
		const payload = await fetchFalJson({
			url: params.statusUrl,
			init: {
				method: "GET",
				headers: params.headers
			},
			timeoutMs: DEFAULT_HTTP_TIMEOUT_MS,
			policy: params.policy,
			dispatcherPolicy: params.dispatcherPolicy,
			auditContext: "fal-video-status",
			errorContext: "fal video status request failed"
		});
		const status = normalizeOptionalString(payload.status)?.toUpperCase();
		if (status) lastStatus = status;
		if (status === "COMPLETED") return await fetchFalJson({
			url: params.responseUrl,
			init: {
				method: "GET",
				headers: params.headers
			},
			timeoutMs: DEFAULT_HTTP_TIMEOUT_MS,
			policy: params.policy,
			dispatcherPolicy: params.dispatcherPolicy,
			auditContext: "fal-video-result",
			errorContext: "fal video result request failed"
		});
		if (status === "FAILED" || status === "CANCELLED") throw new Error(normalizeOptionalString(payload.detail) || normalizeOptionalString(payload.error?.message) || `fal video generation ${normalizeLowercaseStringOrEmpty(status)}`);
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}
	throw new Error(`fal video generation did not finish in time (last status: ${lastStatus})`);
}
function extractFalVideoPayload(payload) {
	if (payload.response && typeof payload.response === "object") return payload.response;
	return payload;
}
function buildFalVideoGenerationProvider() {
	return {
		id: "fal",
		label: "fal",
		defaultModel: DEFAULT_FAL_VIDEO_MODEL,
		models: [
			DEFAULT_FAL_VIDEO_MODEL,
			HEYGEN_VIDEO_AGENT_MODEL,
			...SEEDANCE_2_VIDEO_MODELS,
			"fal-ai/kling-video/v2.1/master/text-to-video",
			"fal-ai/wan/v2.2-a14b/text-to-video",
			"fal-ai/wan/v2.2-a14b/image-to-video"
		],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "fal",
			agentDir
		}),
		capabilities: {
			generate: {
				maxVideos: 1,
				supportedDurationSecondsByModel: Object.fromEntries(SEEDANCE_2_VIDEO_MODELS.map((model) => [model, SEEDANCE_2_DURATION_SECONDS])),
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: true,
				supportsAudio: true
			},
			imageToVideo: {
				enabled: true,
				maxVideos: 1,
				maxInputImages: 1,
				supportedDurationSecondsByModel: Object.fromEntries(SEEDANCE_2_VIDEO_MODELS.map((model) => [model, SEEDANCE_2_DURATION_SECONDS])),
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: true,
				supportsAudio: true
			},
			videoToVideo: { enabled: false }
		},
		async generateVideo(req) {
			if ((req.inputVideos?.length ?? 0) > 0) throw new Error("fal video generation does not support video reference inputs.");
			if ((req.inputImages?.length ?? 0) > 1) throw new Error("fal video generation supports at most one image reference.");
			const auth = await resolveApiKeyForProvider({
				provider: "fal",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("fal API key missing");
			const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: normalizeOptionalString(req.cfg?.models?.providers?.fal?.baseUrl),
				defaultBaseUrl: DEFAULT_FAL_BASE_URL,
				allowPrivateNetwork: false,
				defaultHeaders: {
					Authorization: `Key ${auth.apiKey}`,
					"Content-Type": "application/json"
				},
				provider: "fal",
				capability: "video",
				transport: "http"
			});
			const model = normalizeOptionalString(req.model) || DEFAULT_FAL_VIDEO_MODEL;
			const requestBody = buildFalVideoRequestBody({
				req,
				model
			});
			const policy = buildPolicy(allowPrivateNetwork);
			const submitted = await fetchFalJson({
				url: `${resolveFalQueueBaseUrl(baseUrl)}/${model}`,
				init: {
					method: "POST",
					headers,
					body: JSON.stringify(requestBody)
				},
				timeoutMs: DEFAULT_HTTP_TIMEOUT_MS,
				policy,
				dispatcherPolicy,
				auditContext: "fal-video-submit",
				errorContext: "fal video generation failed"
			});
			const statusUrl = normalizeOptionalString(submitted.status_url);
			const responseUrl = normalizeOptionalString(submitted.response_url);
			if (!statusUrl || !responseUrl) throw new Error("fal video generation response missing queue URLs");
			const videoPayload = extractFalVideoPayload(await waitForFalQueueResult({
				statusUrl,
				responseUrl,
				headers,
				timeoutMs: req.timeoutMs ?? DEFAULT_OPERATION_TIMEOUT_MS,
				policy,
				dispatcherPolicy
			}));
			const url = normalizeOptionalString(extractFalVideoEntry(videoPayload)?.url);
			if (!url) throw new Error("fal video generation response missing output URL");
			return {
				videos: [await downloadFalVideo(url, policy)],
				model,
				metadata: {
					...normalizeOptionalString(submitted.request_id) ? { requestId: normalizeOptionalString(submitted.request_id) } : {},
					...videoPayload.prompt ? { prompt: videoPayload.prompt } : {},
					...typeof videoPayload.seed === "number" ? { seed: videoPayload.seed } : {}
				}
			};
		}
	};
}
//#endregion
export { buildFalVideoGenerationProvider as n, _setFalVideoFetchGuardForTesting as t };
