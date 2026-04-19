//#region extensions/minimax/tts.ts
const DEFAULT_MINIMAX_TTS_BASE_URL = "https://api.minimax.io";
const MINIMAX_TTS_MODELS = ["speech-2.8-hd", "speech-01-240228"];
const MINIMAX_TTS_VOICES = [
	"English_expressive_narrator",
	"Chinese (Mandarin)_Warm_Girl",
	"Chinese (Mandarin)_Lively_Girl",
	"Chinese (Mandarin)_Gentle_Boy",
	"Chinese (Mandarin)_Steady_Boy"
];
function normalizeMinimaxTtsBaseUrl(baseUrl) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return DEFAULT_MINIMAX_TTS_BASE_URL;
	return trimmed.replace(/\/+$/, "");
}
async function minimaxTTS(params) {
	const { text, apiKey, baseUrl, model, voiceId, speed = 1, vol = 1, pitch = 0, format = "mp3", sampleRate = 32e3, timeoutMs } = params;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(`${baseUrl}/v1/t2a_v2`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model,
				text,
				voice_setting: {
					voice_id: voiceId,
					speed,
					vol,
					pitch
				},
				audio_setting: {
					format,
					sample_rate: sampleRate
				}
			}),
			signal: controller.signal
		});
		if (!response.ok) {
			const errBody = await response.text().catch(() => "");
			throw new Error(`MiniMax TTS API error (${response.status})${errBody ? `: ${errBody}` : ""}`);
		}
		const hexAudio = (await response.json())?.data?.audio;
		if (!hexAudio) throw new Error("MiniMax TTS API returned no audio data");
		return Buffer.from(hexAudio, "hex");
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
export { normalizeMinimaxTtsBaseUrl as a, minimaxTTS as i, MINIMAX_TTS_MODELS as n, MINIMAX_TTS_VOICES as r, DEFAULT_MINIMAX_TTS_BASE_URL as t };
