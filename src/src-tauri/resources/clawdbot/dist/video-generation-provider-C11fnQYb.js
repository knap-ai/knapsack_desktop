import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as fetchWithTimeout } from "./fetch-timeout-DZD6CQL_.js";
import { c as resolveProviderOperationTimeoutMs, i as postJsonRequest, l as waitProviderOperationPollInterval, n as createProviderOperationDeadline, s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import "./text-runtime-DTMxvodz.js";
import { t as isProviderApiKeyConfigured } from "./provider-auth-DWLaZig-.js";
import "./provider-http--wdeUhlc.js";
import { n as resolveApiKeyForProvider } from "./provider-auth-runtime-CcRok2NR.js";
//#region extensions/xai/video-generation-provider.ts
const DEFAULT_XAI_VIDEO_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_XAI_VIDEO_MODEL = "grok-imagine-video";
const DEFAULT_TIMEOUT_MS = 12e4;
const POLL_INTERVAL_MS = 5e3;
const MAX_POLL_ATTEMPTS = 120;
const XAI_VIDEO_ASPECT_RATIOS = new Set([
	"1:1",
	"16:9",
	"9:16",
	"4:3",
	"3:4",
	"3:2",
	"2:3"
]);
function resolveXaiVideoBaseUrl(req) {
	return normalizeOptionalString(req.cfg?.models?.providers?.xai?.baseUrl) ?? DEFAULT_XAI_VIDEO_BASE_URL;
}
function toDataUrl(buffer, mimeType) {
	return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
function resolveImageUrl(input) {
	if (!input) return;
	const inputUrl = normalizeOptionalString(input.url);
	if (inputUrl) return inputUrl;
	if (!input.buffer) throw new Error("xAI image-to-video input is missing image data.");
	return toDataUrl(input.buffer, normalizeOptionalString(input.mimeType) ?? "image/png");
}
function resolveInputVideoUrl(input) {
	if (!input) return;
	const url = normalizeOptionalString(input.url);
	if (url) return url;
	if (input.buffer) throw new Error("xAI video editing currently requires a remote mp4 URL input.");
	throw new Error("xAI video editing input is missing video data.");
}
function resolveDurationSeconds(params) {
	if (typeof params.durationSeconds !== "number" || !Number.isFinite(params.durationSeconds)) return;
	const rounded = Math.round(params.durationSeconds);
	return Math.max(params.min ?? 1, Math.min(params.max ?? 15, rounded));
}
function resolveAspectRatio(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed || !XAI_VIDEO_ASPECT_RATIOS.has(trimmed)) return;
	return trimmed;
}
function resolveResolution(value) {
	if (value === "480P") return "480p";
	if (value === "720P" || value === "1080P") return "720p";
}
function resolveXaiVideoMode(req) {
	if (!((req.inputVideos?.length ?? 0) > 0)) return "generate";
	return typeof resolveDurationSeconds({
		durationSeconds: req.durationSeconds,
		min: 2,
		max: 10
	}) === "number" ? "extend" : "edit";
}
function buildCreateBody(req) {
	if ((req.inputImages?.length ?? 0) > 1) throw new Error("xAI video generation supports at most one reference image.");
	if ((req.inputVideos?.length ?? 0) > 1) throw new Error("xAI video generation supports at most one input video.");
	if ((req.inputImages?.length ?? 0) > 0 && (req.inputVideos?.length ?? 0) > 0) throw new Error("xAI video generation does not support image and video inputs together.");
	const mode = resolveXaiVideoMode(req);
	const body = {
		model: normalizeOptionalString(req.model) ?? DEFAULT_XAI_VIDEO_MODEL,
		prompt: req.prompt
	};
	if (mode === "generate") {
		const imageUrl = resolveImageUrl(req.inputImages?.[0]);
		if (imageUrl) body.image = { url: imageUrl };
		const duration = resolveDurationSeconds({
			durationSeconds: req.durationSeconds,
			min: 1,
			max: 15
		});
		if (typeof duration === "number") body.duration = duration;
		const aspectRatio = resolveAspectRatio(req.aspectRatio);
		if (aspectRatio) body.aspect_ratio = aspectRatio;
		const resolution = resolveResolution(req.resolution);
		if (resolution) body.resolution = resolution;
		return body;
	}
	body.video = { url: resolveInputVideoUrl(req.inputVideos?.[0]) };
	if (mode === "extend") {
		const duration = resolveDurationSeconds({
			durationSeconds: req.durationSeconds,
			min: 2,
			max: 10
		});
		if (typeof duration === "number") body.duration = duration;
	}
	return body;
}
function resolveCreateEndpoint(req) {
	switch (resolveXaiVideoMode(req)) {
		case "edit": return "/videos/edits";
		case "extend": return "/videos/extensions";
		default: return "/videos/generations";
	}
}
async function pollXaiVideo(params) {
	const deadline = createProviderOperationDeadline({
		timeoutMs: params.timeoutMs,
		label: `xAI video generation request ${params.requestId}`
	});
	for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
		const response = await fetchWithTimeout(`${params.baseUrl}/videos/${params.requestId}`, {
			method: "GET",
			headers: params.headers
		}, resolveProviderOperationTimeoutMs({
			deadline,
			defaultTimeoutMs: DEFAULT_TIMEOUT_MS
		}), params.fetchFn);
		await assertOkOrThrowHttpError(response, "xAI video status request failed");
		const payload = await response.json();
		switch (payload.status) {
			case "done": return payload;
			case "failed":
			case "expired": throw new Error(normalizeOptionalString(payload.error?.message) ?? `xAI video generation ${payload.status}`);
			default:
				await waitProviderOperationPollInterval({
					deadline,
					pollIntervalMs: POLL_INTERVAL_MS
				});
				break;
		}
	}
	throw new Error(`xAI video generation task ${params.requestId} did not finish in time`);
}
async function downloadXaiVideo(params) {
	const response = await fetchWithTimeout(params.url, { method: "GET" }, params.timeoutMs ?? DEFAULT_TIMEOUT_MS, params.fetchFn);
	await assertOkOrThrowHttpError(response, "xAI generated video download failed");
	const mimeType = normalizeOptionalString(response.headers.get("content-type")) ?? "video/mp4";
	const arrayBuffer = await response.arrayBuffer();
	return {
		buffer: Buffer.from(arrayBuffer),
		mimeType,
		fileName: `video-1.${mimeType.includes("webm") ? "webm" : "mp4"}`
	};
}
function buildXaiVideoGenerationProvider() {
	return {
		id: "xai",
		label: "xAI",
		defaultModel: DEFAULT_XAI_VIDEO_MODEL,
		models: [DEFAULT_XAI_VIDEO_MODEL],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "xai",
			agentDir
		}),
		capabilities: {
			generate: {
				maxVideos: 1,
				maxDurationSeconds: 15,
				aspectRatios: [...XAI_VIDEO_ASPECT_RATIOS],
				resolutions: ["480P", "720P"],
				supportsAspectRatio: true,
				supportsResolution: true
			},
			imageToVideo: {
				enabled: true,
				maxVideos: 1,
				maxInputImages: 1,
				maxDurationSeconds: 15,
				aspectRatios: [...XAI_VIDEO_ASPECT_RATIOS],
				resolutions: ["480P", "720P"],
				supportsAspectRatio: true,
				supportsResolution: true
			},
			videoToVideo: {
				enabled: true,
				maxVideos: 1,
				maxInputVideos: 1,
				maxDurationSeconds: 15,
				supportsAspectRatio: true,
				supportsResolution: true
			}
		},
		async generateVideo(req) {
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
				label: "xAI video generation"
			});
			const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: resolveXaiVideoBaseUrl(req),
				defaultBaseUrl: DEFAULT_XAI_VIDEO_BASE_URL,
				allowPrivateNetwork: false,
				defaultHeaders: {
					Authorization: `Bearer ${auth.apiKey}`,
					"Content-Type": "application/json"
				},
				provider: "xai",
				capability: "video",
				transport: "http"
			});
			const { response, release } = await postJsonRequest({
				url: `${baseUrl}${resolveCreateEndpoint(req)}`,
				headers,
				body: buildCreateBody(req),
				timeoutMs: resolveProviderOperationTimeoutMs({
					deadline,
					defaultTimeoutMs: DEFAULT_TIMEOUT_MS
				}),
				fetchFn,
				allowPrivateNetwork,
				dispatcherPolicy
			});
			try {
				await assertOkOrThrowHttpError(response, "xAI video generation failed");
				const submitted = await response.json();
				const requestId = normalizeOptionalString(submitted.request_id);
				if (!requestId) throw new Error(normalizeOptionalString(submitted.error?.message) ?? "xAI video generation response missing request_id");
				const completed = await pollXaiVideo({
					requestId,
					headers,
					timeoutMs: resolveProviderOperationTimeoutMs({
						deadline,
						defaultTimeoutMs: DEFAULT_TIMEOUT_MS
					}),
					baseUrl,
					fetchFn
				});
				const videoUrl = normalizeOptionalString(completed.video?.url);
				if (!videoUrl) throw new Error("xAI video generation completed without an output URL");
				return {
					videos: [await downloadXaiVideo({
						url: videoUrl,
						timeoutMs: resolveProviderOperationTimeoutMs({
							deadline,
							defaultTimeoutMs: DEFAULT_TIMEOUT_MS
						}),
						fetchFn
					})],
					model: normalizeOptionalString(req.model) ?? DEFAULT_XAI_VIDEO_MODEL,
					metadata: {
						requestId,
						status: completed.status,
						videoUrl,
						mode: resolveXaiVideoMode(req)
					}
				};
			} finally {
				await release();
			}
		}
	};
}
//#endregion
export { buildXaiVideoGenerationProvider as t };
