import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
//#region extensions/voice-call/src/telephony-audio.ts
const TELEPHONY_SAMPLE_RATE = 8e3;
const RESAMPLE_FILTER_TAPS = 31;
const RESAMPLE_CUTOFF_GUARD = .94;
function clamp16(value) {
	return Math.max(-32768, Math.min(32767, value));
}
function sinc(x) {
	if (x === 0) return 1;
	return Math.sin(Math.PI * x) / (Math.PI * x);
}
/**
* Build a finite low-pass kernel centered on `srcPos`.
* The kernel is windowed (Hann) to reduce ringing artifacts.
*/
function sampleBandlimited(input, inputSamples, srcPos, cutoffCyclesPerSample) {
	const half = Math.floor(RESAMPLE_FILTER_TAPS / 2);
	const center = Math.floor(srcPos);
	let weighted = 0;
	let weightSum = 0;
	for (let tap = -half; tap <= half; tap++) {
		const sampleIndex = center + tap;
		if (sampleIndex < 0 || sampleIndex >= inputSamples) continue;
		const distance = sampleIndex - srcPos;
		const lowPass = 2 * cutoffCyclesPerSample * sinc(2 * cutoffCyclesPerSample * distance);
		const tapIndex = tap + half;
		const coeff = lowPass * (.5 - .5 * Math.cos(2 * Math.PI * tapIndex / (RESAMPLE_FILTER_TAPS - 1)));
		weighted += input.readInt16LE(sampleIndex * 2) * coeff;
		weightSum += coeff;
	}
	if (weightSum === 0) {
		const nearest = Math.max(0, Math.min(inputSamples - 1, Math.round(srcPos)));
		return input.readInt16LE(nearest * 2);
	}
	return weighted / weightSum;
}
/**
* Resample 16-bit PCM (little-endian mono) to 8kHz using a windowed low-pass kernel.
*/
function resamplePcmTo8k(input, inputSampleRate) {
	if (inputSampleRate === TELEPHONY_SAMPLE_RATE) return input;
	const inputSamples = Math.floor(input.length / 2);
	if (inputSamples === 0) return Buffer.alloc(0);
	const ratio = inputSampleRate / TELEPHONY_SAMPLE_RATE;
	const outputSamples = Math.floor(inputSamples / ratio);
	const output = Buffer.alloc(outputSamples * 2);
	const maxCutoff = .5;
	const downsampleCutoff = ratio > 1 ? maxCutoff / ratio : maxCutoff;
	const cutoffCyclesPerSample = Math.max(.01, downsampleCutoff * RESAMPLE_CUTOFF_GUARD);
	for (let i = 0; i < outputSamples; i++) {
		const srcPos = i * ratio;
		const sample = Math.round(sampleBandlimited(input, inputSamples, srcPos, cutoffCyclesPerSample));
		output.writeInt16LE(clamp16(sample), i * 2);
	}
	return output;
}
/**
* Convert 16-bit PCM to 8-bit mu-law (G.711).
*/
function pcmToMulaw(pcm) {
	const samples = Math.floor(pcm.length / 2);
	const mulaw = Buffer.alloc(samples);
	for (let i = 0; i < samples; i++) mulaw[i] = linearToMulaw(pcm.readInt16LE(i * 2));
	return mulaw;
}
function convertPcmToMulaw8k(pcm, inputSampleRate) {
	return pcmToMulaw(resamplePcmTo8k(pcm, inputSampleRate));
}
/**
* Chunk audio buffer into 20ms frames for streaming (8kHz mono mu-law).
*/
function chunkAudio(audio, chunkSize = 160) {
	return (function* () {
		for (let i = 0; i < audio.length; i += chunkSize) yield audio.subarray(i, Math.min(i + chunkSize, audio.length));
	})();
}
function linearToMulaw(sample) {
	const BIAS = 132;
	const CLIP = 32635;
	const sign = sample < 0 ? 128 : 0;
	if (sample < 0) sample = -sample;
	if (sample > CLIP) sample = CLIP;
	sample += BIAS;
	let exponent = 7;
	for (let expMask = 16384; (sample & expMask) === 0 && exponent > 0; exponent--) expMask >>= 1;
	const mantissa = sample >> exponent + 3 & 15;
	return ~(sign | exponent << 4 | mantissa) & 255;
}
//#endregion
//#region extensions/voice-call/src/providers/shared/call-status.ts
const TERMINAL_PROVIDER_STATUS_TO_END_REASON = {
	completed: "completed",
	failed: "failed",
	busy: "busy",
	"no-answer": "no-answer",
	canceled: "hangup-bot"
};
function normalizeProviderStatus(status) {
	const normalized = normalizeOptionalLowercaseString(status);
	return normalized && normalized.length > 0 ? normalized : "unknown";
}
function mapProviderStatusToEndReason(status) {
	return TERMINAL_PROVIDER_STATUS_TO_END_REASON[normalizeProviderStatus(status)] ?? null;
}
function isProviderStatusTerminal(status) {
	return mapProviderStatusToEndReason(status) !== null;
}
//#endregion
export { convertPcmToMulaw8k as a, chunkAudio as i, mapProviderStatusToEndReason as n, normalizeProviderStatus as r, isProviderStatusTerminal as t };
