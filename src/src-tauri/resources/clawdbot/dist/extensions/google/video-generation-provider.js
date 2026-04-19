import { normalizeGoogleApiBaseUrl } from "./provider-policy.js";
import "./api.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { GoogleGenAI } from "@google/genai";
import { isProviderApiKeyConfigured } from "openclaw/plugin-sdk/provider-auth";
import { resolveApiKeyForProvider } from "openclaw/plugin-sdk/provider-auth-runtime";
import { createProviderOperationDeadline, resolveProviderOperationTimeoutMs, waitProviderOperationPollInterval } from "openclaw/plugin-sdk/provider-http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { resolvePreferredOpenClawTmpDir } from "openclaw/plugin-sdk/temp-path";
//#region extensions/google/video-generation-provider.ts
const DEFAULT_GOOGLE_VIDEO_MODEL = "veo-3.1-fast-generate-preview";
const DEFAULT_TIMEOUT_MS = 18e4;
const POLL_INTERVAL_MS = 1e4;
const MAX_POLL_ATTEMPTS = 90;
const GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS = [
	4,
	6,
	8
];
const GOOGLE_VIDEO_MIN_DURATION_SECONDS = GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS[0];
const GOOGLE_VIDEO_MAX_DURATION_SECONDS = GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS[GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS.length - 1];
function resolveConfiguredGoogleVideoBaseUrl(req) {
	const configured = normalizeOptionalString(req.cfg?.models?.providers?.google?.baseUrl);
	return configured ? normalizeGoogleApiBaseUrl(configured) : void 0;
}
function parseVideoSize(size) {
	const trimmed = normalizeOptionalString(size);
	if (!trimmed) return;
	const match = /^(\d+)x(\d+)$/u.exec(trimmed);
	if (!match) return;
	const width = Number.parseInt(match[1] ?? "", 10);
	const height = Number.parseInt(match[2] ?? "", 10);
	if (!Number.isFinite(width) || !Number.isFinite(height)) return;
	return {
		width,
		height
	};
}
function resolveAspectRatio(params) {
	const direct = normalizeOptionalString(params.aspectRatio);
	if (direct === "16:9" || direct === "9:16") return direct;
	const parsedSize = parseVideoSize(params.size);
	if (!parsedSize) return;
	return parsedSize.width >= parsedSize.height ? "16:9" : "9:16";
}
function resolveResolution(params) {
	if (params.resolution === "720P") return "720p";
	if (params.resolution === "1080P") return "1080p";
	const parsedSize = parseVideoSize(params.size);
	if (!parsedSize) return;
	const maxEdge = Math.max(parsedSize.width, parsedSize.height);
	return maxEdge >= 1920 ? "1080p" : maxEdge >= 1280 ? "720p" : void 0;
}
function resolveDurationSeconds(durationSeconds) {
	if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds)) return;
	const rounded = Math.min(GOOGLE_VIDEO_MAX_DURATION_SECONDS, Math.max(GOOGLE_VIDEO_MIN_DURATION_SECONDS, Math.round(durationSeconds)));
	return GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS.reduce((best, current) => {
		const currentDistance = Math.abs(current - rounded);
		const bestDistance = Math.abs(best - rounded);
		if (currentDistance < bestDistance) return current;
		if (currentDistance === bestDistance && current > best) return current;
		return best;
	});
}
function resolveInputImage(req) {
	const input = req.inputImages?.[0];
	if (!input?.buffer) return;
	return {
		imageBytes: input.buffer.toString("base64"),
		mimeType: normalizeOptionalString(input.mimeType) || "image/png"
	};
}
function resolveInputVideo(req) {
	const input = req.inputVideos?.[0];
	if (!input?.buffer) return;
	return {
		videoBytes: input.buffer.toString("base64"),
		mimeType: normalizeOptionalString(input.mimeType) || "video/mp4"
	};
}
async function downloadGeneratedVideo(params) {
	const tempDir = await mkdtemp(path.join(resolvePreferredOpenClawTmpDir(), "openclaw-google-video-"));
	const downloadPath = path.join(tempDir, `video-${params.index + 1}.mp4`);
	try {
		await params.client.files.download({
			file: params.file,
			downloadPath
		});
		return {
			buffer: await readFile(downloadPath),
			mimeType: "video/mp4",
			fileName: `video-${params.index + 1}.mp4`
		};
	} finally {
		await rm(tempDir, {
			recursive: true,
			force: true
		});
	}
}
function buildGoogleVideoGenerationProvider() {
	return {
		id: "google",
		label: "Google",
		defaultModel: DEFAULT_GOOGLE_VIDEO_MODEL,
		models: [
			DEFAULT_GOOGLE_VIDEO_MODEL,
			"veo-3.1-generate-preview",
			"veo-3.1-lite-generate-preview",
			"veo-3.0-fast-generate-001",
			"veo-3.0-generate-001",
			"veo-2.0-generate-001"
		],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "google",
			agentDir
		}),
		capabilities: {
			generate: {
				maxVideos: 1,
				maxDurationSeconds: GOOGLE_VIDEO_MAX_DURATION_SECONDS,
				supportedDurationSeconds: GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS,
				aspectRatios: ["16:9", "9:16"],
				resolutions: ["720P", "1080P"],
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: true,
				supportsAudio: true
			},
			imageToVideo: {
				enabled: true,
				maxVideos: 1,
				maxInputImages: 1,
				maxDurationSeconds: GOOGLE_VIDEO_MAX_DURATION_SECONDS,
				supportedDurationSeconds: GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS,
				aspectRatios: ["16:9", "9:16"],
				resolutions: ["720P", "1080P"],
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: true,
				supportsAudio: true
			},
			videoToVideo: {
				enabled: true,
				maxVideos: 1,
				maxInputVideos: 1,
				maxDurationSeconds: GOOGLE_VIDEO_MAX_DURATION_SECONDS,
				supportedDurationSeconds: GOOGLE_VIDEO_ALLOWED_DURATION_SECONDS,
				aspectRatios: ["16:9", "9:16"],
				resolutions: ["720P", "1080P"],
				supportsAspectRatio: true,
				supportsResolution: true,
				supportsSize: true,
				supportsAudio: true
			}
		},
		async generateVideo(req) {
			if ((req.inputImages?.length ?? 0) > 1) throw new Error("Google video generation supports at most one input image.");
			if ((req.inputVideos?.length ?? 0) > 1) throw new Error("Google video generation supports at most one input video.");
			if ((req.inputImages?.length ?? 0) > 0 && (req.inputVideos?.length ?? 0) > 0) throw new Error("Google video generation does not support image and video inputs together.");
			const auth = await resolveApiKeyForProvider({
				provider: "google",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("Google API key missing");
			const configuredBaseUrl = resolveConfiguredGoogleVideoBaseUrl(req);
			const durationSeconds = resolveDurationSeconds(req.durationSeconds);
			const deadline = createProviderOperationDeadline({
				timeoutMs: req.timeoutMs,
				label: "Google video generation"
			});
			const client = new GoogleGenAI({
				apiKey: auth.apiKey,
				httpOptions: {
					...configuredBaseUrl ? { baseUrl: configuredBaseUrl } : {},
					timeout: resolveProviderOperationTimeoutMs({
						deadline,
						defaultTimeoutMs: DEFAULT_TIMEOUT_MS
					})
				}
			});
			let operation = await client.models.generateVideos({
				model: normalizeOptionalString(req.model) || DEFAULT_GOOGLE_VIDEO_MODEL,
				prompt: req.prompt,
				image: resolveInputImage(req),
				video: resolveInputVideo(req),
				config: {
					...typeof durationSeconds === "number" ? { durationSeconds } : {},
					...resolveAspectRatio({
						aspectRatio: req.aspectRatio,
						size: req.size
					}) ? { aspectRatio: resolveAspectRatio({
						aspectRatio: req.aspectRatio,
						size: req.size
					}) } : {},
					...resolveResolution({
						resolution: req.resolution,
						size: req.size
					}) ? { resolution: resolveResolution({
						resolution: req.resolution,
						size: req.size
					}) } : {},
					...req.audio === true ? { generateAudio: true } : {}
				}
			});
			for (let attempt = 0; !(operation.done ?? false); attempt += 1) {
				if (attempt >= MAX_POLL_ATTEMPTS) throw new Error("Google video generation did not finish in time");
				await waitProviderOperationPollInterval({
					deadline,
					pollIntervalMs: POLL_INTERVAL_MS
				});
				resolveProviderOperationTimeoutMs({
					deadline,
					defaultTimeoutMs: DEFAULT_TIMEOUT_MS
				});
				operation = await client.operations.getVideosOperation({ operation });
			}
			if (operation.error) throw new Error(JSON.stringify(operation.error));
			const generatedVideos = operation.response?.generatedVideos ?? [];
			if (generatedVideos.length === 0) throw new Error("Google video generation response missing generated videos");
			return {
				videos: await Promise.all(generatedVideos.map(async (entry, index) => {
					const inline = entry.video;
					if (inline?.videoBytes) return {
						buffer: Buffer.from(inline.videoBytes, "base64"),
						mimeType: normalizeOptionalString(inline.mimeType) || "video/mp4",
						fileName: `video-${index + 1}.mp4`
					};
					if (!inline) throw new Error("Google generated video missing file handle");
					return await downloadGeneratedVideo({
						client,
						file: inline,
						index
					});
				})),
				model: normalizeOptionalString(req.model) || DEFAULT_GOOGLE_VIDEO_MODEL,
				metadata: operation.name ? { operationName: operation.name } : void 0
			};
		}
	};
}
//#endregion
export { buildGoogleVideoGenerationProvider };
