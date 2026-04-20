import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as extensionForMime } from "./mime-B6nXlmtY.js";
import { r as fetchWithTimeout } from "./fetch-timeout-DZD6CQL_.js";
import { i as postJsonRequest, s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import "./text-runtime-DTMxvodz.js";
import { t as isProviderApiKeyConfigured } from "./provider-auth-DWLaZig-.js";
import "./media-mime-B2CTMm7i.js";
import "./provider-http--wdeUhlc.js";
import { n as resolveApiKeyForProvider } from "./provider-auth-runtime-CcRok2NR.js";
//#region extensions/minimax/music-generation-provider.ts
const DEFAULT_MINIMAX_MUSIC_BASE_URL = "https://api.minimax.io";
const DEFAULT_MINIMAX_MUSIC_MODEL = "music-2.5+";
const DEFAULT_TIMEOUT_MS = 12e4;
function resolveMinimaxMusicBaseUrl(cfg) {
	const direct = normalizeOptionalString(cfg?.models?.providers?.minimax?.baseUrl);
	if (!direct) return DEFAULT_MINIMAX_MUSIC_BASE_URL;
	try {
		return new URL(direct).origin;
	} catch {
		return DEFAULT_MINIMAX_MUSIC_BASE_URL;
	}
}
function assertMinimaxBaseResp(baseResp, context) {
	if (!baseResp || typeof baseResp.status_code !== "number" || baseResp.status_code === 0) return;
	throw new Error(`${context} (${baseResp.status_code}): ${baseResp.status_msg ?? "unknown error"}`);
}
function decodePossibleBinary(data) {
	const trimmed = data.trim();
	if (/^[0-9a-f]+$/iu.test(trimmed) && trimmed.length % 2 === 0) return Buffer.from(trimmed, "hex");
	return Buffer.from(trimmed, "base64");
}
function decodePossibleText(data) {
	const trimmed = data.trim();
	if (!trimmed) return "";
	if (/^[0-9a-f]+$/iu.test(trimmed) && trimmed.length % 2 === 0) return Buffer.from(trimmed, "hex").toString("utf8").trim();
	return trimmed;
}
function isLikelyRemoteUrl(value) {
	const trimmed = normalizeOptionalString(value);
	return Boolean(trimmed && /^https?:\/\//iu.test(trimmed));
}
async function downloadTrackFromUrl(params) {
	const response = await fetchWithTimeout(params.url, { method: "GET" }, params.timeoutMs ?? DEFAULT_TIMEOUT_MS, params.fetchFn);
	await assertOkOrThrowHttpError(response, "MiniMax generated music download failed");
	const mimeType = normalizeOptionalString(response.headers.get("content-type")) ?? "audio/mpeg";
	const ext = extensionForMime(mimeType)?.replace(/^\./u, "") || "mp3";
	return {
		buffer: Buffer.from(await response.arrayBuffer()),
		mimeType,
		fileName: `track-1.${ext}`
	};
}
function buildPrompt(req) {
	const parts = [req.prompt.trim()];
	if (typeof req.durationSeconds === "number" && Number.isFinite(req.durationSeconds)) parts.push(`Target duration: about ${Math.max(1, Math.round(req.durationSeconds))} seconds.`);
	return parts.join("\n\n");
}
function resolveMinimaxMusicModel(model) {
	const trimmed = normalizeOptionalString(model);
	if (!trimmed) return DEFAULT_MINIMAX_MUSIC_MODEL;
	return trimmed;
}
function buildMinimaxMusicGenerationProvider() {
	return {
		id: "minimax",
		label: "MiniMax",
		defaultModel: DEFAULT_MINIMAX_MUSIC_MODEL,
		models: [
			DEFAULT_MINIMAX_MUSIC_MODEL,
			"music-2.5",
			"music-2.0"
		],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "minimax",
			agentDir
		}),
		capabilities: {
			generate: {
				maxTracks: 1,
				supportsLyrics: true,
				supportsInstrumental: true,
				supportsDuration: true,
				supportsFormat: true,
				supportedFormats: ["mp3"]
			},
			edit: { enabled: false }
		},
		async generateMusic(req) {
			if ((req.inputImages?.length ?? 0) > 0) throw new Error("MiniMax music generation does not support image reference inputs.");
			if (req.instrumental === true && normalizeOptionalString(req.lyrics)) throw new Error("MiniMax music generation cannot use lyrics when instrumental=true.");
			if (req.format && req.format !== "mp3") throw new Error("MiniMax music generation currently supports mp3 output only.");
			const auth = await resolveApiKeyForProvider({
				provider: "minimax",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("MiniMax API key missing");
			const fetchFn = fetch;
			const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: resolveMinimaxMusicBaseUrl(req.cfg),
				defaultBaseUrl: DEFAULT_MINIMAX_MUSIC_BASE_URL,
				allowPrivateNetwork: false,
				defaultHeaders: { Authorization: `Bearer ${auth.apiKey}` }
			});
			const jsonHeaders = new Headers(headers);
			jsonHeaders.set("Content-Type", "application/json");
			const model = resolveMinimaxMusicModel(req.model);
			const lyrics = normalizeOptionalString(req.lyrics);
			const body = {
				model,
				prompt: buildPrompt(req),
				...req.instrumental === true ? { is_instrumental: true } : {},
				...lyrics ? { lyrics } : req.instrumental === true ? {} : { lyrics_optimizer: true },
				output_format: "url",
				audio_setting: {
					sample_rate: 44100,
					bitrate: 256e3,
					format: "mp3"
				}
			};
			const { response: res, release } = await postJsonRequest({
				url: `${baseUrl}/v1/music_generation`,
				headers: jsonHeaders,
				body,
				timeoutMs: req.timeoutMs ?? DEFAULT_TIMEOUT_MS,
				fetchFn,
				pinDns: false,
				allowPrivateNetwork,
				dispatcherPolicy
			});
			try {
				await assertOkOrThrowHttpError(res, "MiniMax music generation failed");
				const payload = await res.json();
				assertMinimaxBaseResp(payload.base_resp, "MiniMax music generation failed");
				const audioCandidate = normalizeOptionalString(payload.audio) ?? normalizeOptionalString(payload.data?.audio);
				const audioUrl = normalizeOptionalString(payload.audio_url) || normalizeOptionalString(payload.data?.audio_url) || (isLikelyRemoteUrl(audioCandidate) ? audioCandidate : void 0);
				const inlineAudio = isLikelyRemoteUrl(audioCandidate) ? void 0 : audioCandidate;
				const lyrics = decodePossibleText(payload.lyrics ?? payload.data?.lyrics ?? "");
				const track = audioUrl ? await downloadTrackFromUrl({
					url: audioUrl,
					timeoutMs: req.timeoutMs,
					fetchFn
				}) : inlineAudio ? {
					buffer: decodePossibleBinary(inlineAudio),
					mimeType: "audio/mpeg",
					fileName: "track-1.mp3"
				} : null;
				if (!track) throw new Error("MiniMax music generation response missing audio output");
				return {
					tracks: [track],
					...lyrics ? { lyrics: [lyrics] } : {},
					model,
					metadata: {
						...normalizeOptionalString(payload.task_id) ? { taskId: normalizeOptionalString(payload.task_id) } : {},
						...audioUrl ? { audioUrl } : {},
						instrumental: req.instrumental === true,
						...lyrics ? { requestedLyrics: true } : {},
						...typeof req.durationSeconds === "number" ? { requestedDurationSeconds: req.durationSeconds } : {}
					}
				};
			} finally {
				await release();
			}
		}
	};
}
//#endregion
export { buildMinimaxMusicGenerationProvider as t };
