import { n as fetchWithSsrFGuard } from "./fetch-guard-8smVA_M-.js";
import { i as assertOkOrThrowProviderError } from "./provider-http-errors-DzWFsTc6.js";
import "./ssrf-runtime-CIV6CU_8.js";
import "./provider-http-CPMTAn4V.js";
import { i as normalizeGradiumBaseUrl } from "./shared-nd_J_Pj0.js";
//#region extensions/gradium/tts.ts
async function gradiumTTS(params) {
	const { text, apiKey, baseUrl, voiceId, outputFormat, timeoutMs } = params;
	const normalizedBaseUrl = normalizeGradiumBaseUrl(baseUrl);
	const url = `${normalizedBaseUrl}/api/post/speech/tts`;
	const hostname = new URL(normalizedBaseUrl).hostname;
	const { response, release } = await fetchWithSsrFGuard({
		url,
		init: {
			method: "POST",
			headers: {
				"x-api-key": apiKey,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				text,
				voice_id: voiceId,
				only_audio: true,
				output_format: outputFormat,
				json_config: JSON.stringify({ padding_bonus: 0 })
			})
		},
		timeoutMs,
		policy: { hostnameAllowlist: [hostname] },
		auditContext: "gradium.tts"
	});
	try {
		await assertOkOrThrowProviderError(response, "Gradium API error");
		return Buffer.from(await response.arrayBuffer());
	} finally {
		await release();
	}
}
//#endregion
export { gradiumTTS as t };
