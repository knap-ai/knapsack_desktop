import { normalizeGoogleApiBaseUrl } from "./provider-policy.js";
import "./api.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { GoogleGenAI } from "@google/genai";
import { extensionForMime } from "openclaw/plugin-sdk/media-mime";
import { isProviderApiKeyConfigured } from "openclaw/plugin-sdk/provider-auth";
import { resolveApiKeyForProvider } from "openclaw/plugin-sdk/provider-auth-runtime";
//#region extensions/google/music-generation-provider.ts
const DEFAULT_GOOGLE_MUSIC_MODEL = "lyria-3-clip-preview";
const GOOGLE_PRO_MUSIC_MODEL = "lyria-3-pro-preview";
const DEFAULT_TIMEOUT_MS = 18e4;
const GOOGLE_MAX_INPUT_IMAGES = 10;
function resolveConfiguredGoogleMusicBaseUrl(req) {
	const configured = normalizeOptionalString(req.cfg?.models?.providers?.google?.baseUrl);
	return configured ? normalizeGoogleApiBaseUrl(configured) : void 0;
}
function buildMusicPrompt(req) {
	const parts = [req.prompt.trim()];
	const lyrics = normalizeOptionalString(req.lyrics);
	if (req.instrumental === true) parts.push("Instrumental only. No vocals, no sung lyrics, no spoken word.");
	if (lyrics) parts.push(`Lyrics:\n${lyrics}`);
	return parts.join("\n\n");
}
function resolveSupportedFormats(model) {
	return model === GOOGLE_PRO_MUSIC_MODEL ? ["mp3", "wav"] : ["mp3"];
}
function resolveTrackFileName(params) {
	const ext = extensionForMime(params.mimeType)?.replace(/^\./u, "") || (params.model === GOOGLE_PRO_MUSIC_MODEL ? "wav" : "mp3");
	return `track-${params.index + 1}.${ext}`;
}
function extractTracks(params) {
	const lyrics = [];
	const tracks = [];
	for (const candidate of params.payload.candidates ?? []) for (const part of candidate.content?.parts ?? []) {
		const text = normalizeOptionalString(part.text);
		if (text) {
			lyrics.push(text);
			continue;
		}
		const inline = part.inlineData ?? part.inline_data;
		const data = normalizeOptionalString(inline?.data);
		if (!data) continue;
		const mimeType = normalizeOptionalString(inline?.mimeType) || normalizeOptionalString(inline?.mime_type) || "audio/mpeg";
		tracks.push({
			buffer: Buffer.from(data, "base64"),
			mimeType,
			fileName: resolveTrackFileName({
				index: tracks.length,
				mimeType,
				model: params.model
			})
		});
	}
	return {
		tracks,
		lyrics
	};
}
function buildGoogleMusicGenerationProvider() {
	return {
		id: "google",
		label: "Google",
		defaultModel: DEFAULT_GOOGLE_MUSIC_MODEL,
		models: [DEFAULT_GOOGLE_MUSIC_MODEL, GOOGLE_PRO_MUSIC_MODEL],
		isConfigured: ({ agentDir }) => isProviderApiKeyConfigured({
			provider: "google",
			agentDir
		}),
		capabilities: {
			generate: {
				maxTracks: 1,
				supportsLyrics: true,
				supportsInstrumental: true,
				supportsFormat: true,
				supportedFormatsByModel: {
					[DEFAULT_GOOGLE_MUSIC_MODEL]: ["mp3"],
					[GOOGLE_PRO_MUSIC_MODEL]: ["mp3", "wav"]
				}
			},
			edit: {
				enabled: true,
				maxTracks: 1,
				maxInputImages: GOOGLE_MAX_INPUT_IMAGES,
				supportsLyrics: true,
				supportsInstrumental: true,
				supportsFormat: true,
				supportedFormatsByModel: {
					[DEFAULT_GOOGLE_MUSIC_MODEL]: ["mp3"],
					[GOOGLE_PRO_MUSIC_MODEL]: ["mp3", "wav"]
				}
			}
		},
		async generateMusic(req) {
			if ((req.inputImages?.length ?? 0) > GOOGLE_MAX_INPUT_IMAGES) throw new Error(`Google music generation supports at most ${GOOGLE_MAX_INPUT_IMAGES} reference images.`);
			const auth = await resolveApiKeyForProvider({
				provider: "google",
				cfg: req.cfg,
				agentDir: req.agentDir,
				store: req.authStore
			});
			if (!auth.apiKey) throw new Error("Google API key missing");
			const model = normalizeOptionalString(req.model) || DEFAULT_GOOGLE_MUSIC_MODEL;
			if (req.format) {
				const supportedFormats = resolveSupportedFormats(model);
				if (!supportedFormats.includes(req.format)) throw new Error(`Google music generation model ${model} supports ${supportedFormats.join(", ")} output.`);
			}
			const { tracks, lyrics } = extractTracks({
				payload: await new GoogleGenAI({
					apiKey: auth.apiKey,
					httpOptions: {
						...resolveConfiguredGoogleMusicBaseUrl(req) ? { baseUrl: resolveConfiguredGoogleMusicBaseUrl(req) } : {},
						timeout: req.timeoutMs ?? DEFAULT_TIMEOUT_MS
					}
				}).models.generateContent({
					model,
					contents: [{ text: buildMusicPrompt(req) }, ...(req.inputImages ?? []).map((image) => ({ inlineData: {
						mimeType: normalizeOptionalString(image.mimeType) || "image/png",
						data: image.buffer?.toString("base64") ?? ""
					} }))],
					config: { responseModalities: ["AUDIO", "TEXT"] }
				}),
				model
			});
			if (tracks.length === 0) throw new Error("Google music generation response missing audio data");
			return {
				tracks,
				...lyrics.length > 0 ? { lyrics } : {},
				model,
				metadata: {
					inputImageCount: req.inputImages?.length ?? 0,
					instrumental: req.instrumental === true,
					...normalizeOptionalString(req.lyrics) ? { requestedLyrics: true } : {},
					...req.format ? { requestedFormat: req.format } : {}
				}
			};
		}
	};
}
//#endregion
export { buildGoogleMusicGenerationProvider };
