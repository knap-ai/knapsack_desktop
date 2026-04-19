import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { i as isFailoverError, r as describeFailoverError } from "./failover-error-CqpA2cGv.js";
import { a as normalizeDurationToClosestMax, i as hasMediaNormalizationEntry, n as buildNoCapabilityModelConfiguredMessage, o as resolveCapabilityModelCandidates, t as buildMediaGenerationNormalizationMetadata, u as throwCapabilityGenerationFailure } from "./runtime-shared-r36k9q42.js";
import { n as listMusicGenerationProviders, r as parseMusicGenerationModelRef, t as getMusicGenerationProvider } from "./provider-registry-B7dkIhK2.js";
//#region src/music-generation/capabilities.ts
function resolveMusicGenerationMode(params) {
	return (params.inputImageCount ?? 0) > 0 ? "edit" : "generate";
}
function listSupportedMusicGenerationModes(provider) {
	const modes = ["generate"];
	if (provider.capabilities.edit?.enabled) modes.push("edit");
	return modes;
}
function resolveMusicGenerationModeCapabilities(params) {
	const mode = resolveMusicGenerationMode(params);
	const capabilities = params.provider?.capabilities;
	if (!capabilities) return {
		mode,
		capabilities: void 0
	};
	if (mode === "generate") return {
		mode,
		capabilities: capabilities.generate
	};
	return {
		mode,
		capabilities: capabilities.edit
	};
}
//#endregion
//#region src/music-generation/normalization.ts
function resolveMusicGenerationOverrides(params) {
	const { capabilities: caps } = resolveMusicGenerationModeCapabilities({
		provider: params.provider,
		inputImageCount: params.inputImages?.length ?? 0
	});
	const ignoredOverrides = [];
	const normalization = {};
	let lyrics = params.lyrics;
	let instrumental = params.instrumental;
	let durationSeconds = params.durationSeconds;
	let format = params.format;
	if (!caps) return {
		lyrics,
		instrumental,
		durationSeconds,
		format,
		ignoredOverrides
	};
	if (lyrics?.trim() && !caps.supportsLyrics) {
		ignoredOverrides.push({
			key: "lyrics",
			value: lyrics
		});
		lyrics = void 0;
	}
	if (typeof instrumental === "boolean" && !caps.supportsInstrumental) {
		ignoredOverrides.push({
			key: "instrumental",
			value: instrumental
		});
		instrumental = void 0;
	}
	if (typeof durationSeconds === "number" && !caps.supportsDuration) {
		ignoredOverrides.push({
			key: "durationSeconds",
			value: durationSeconds
		});
		durationSeconds = void 0;
	} else if (typeof durationSeconds === "number") {
		const normalizedDurationSeconds = normalizeDurationToClosestMax(durationSeconds, caps.maxDurationSeconds);
		if (typeof normalizedDurationSeconds === "number" && normalizedDurationSeconds !== durationSeconds) normalization.durationSeconds = {
			requested: durationSeconds,
			applied: normalizedDurationSeconds
		};
		durationSeconds = normalizedDurationSeconds;
	}
	if (format) {
		const supportedFormats = caps.supportedFormatsByModel?.[params.model] ?? caps.supportedFormats ?? [];
		if (!caps.supportsFormat || supportedFormats.length > 0 && !supportedFormats.includes(format)) {
			ignoredOverrides.push({
				key: "format",
				value: format
			});
			format = void 0;
		}
	}
	return {
		lyrics,
		instrumental,
		durationSeconds,
		format,
		ignoredOverrides,
		normalization: hasMediaNormalizationEntry(normalization.durationSeconds) ? normalization : void 0
	};
}
//#endregion
//#region src/music-generation/runtime.ts
const log = createSubsystemLogger("music-generation");
function listRuntimeMusicGenerationProviders(params) {
	return listMusicGenerationProviders(params?.config);
}
async function generateMusic(params) {
	const candidates = resolveCapabilityModelCandidates({
		cfg: params.cfg,
		modelConfig: params.cfg.agents?.defaults?.musicGenerationModel,
		modelOverride: params.modelOverride,
		parseModelRef: parseMusicGenerationModelRef,
		agentDir: params.agentDir,
		listProviders: listMusicGenerationProviders
	});
	if (candidates.length === 0) throw new Error(buildNoCapabilityModelConfiguredMessage({
		capabilityLabel: "music-generation",
		modelConfigKey: "musicGenerationModel",
		providers: listMusicGenerationProviders(params.cfg),
		fallbackSampleRef: "google/lyria-3-clip-preview"
	}));
	const attempts = [];
	let lastError;
	for (const candidate of candidates) {
		const provider = getMusicGenerationProvider(candidate.provider, params.cfg);
		if (!provider) {
			const error = `No music-generation provider registered for ${candidate.provider}`;
			attempts.push({
				provider: candidate.provider,
				model: candidate.model,
				error
			});
			lastError = new Error(error);
			continue;
		}
		try {
			const sanitized = resolveMusicGenerationOverrides({
				provider,
				model: candidate.model,
				lyrics: params.lyrics,
				instrumental: params.instrumental,
				durationSeconds: params.durationSeconds,
				format: params.format,
				inputImages: params.inputImages
			});
			const result = await provider.generateMusic({
				provider: candidate.provider,
				model: candidate.model,
				prompt: params.prompt,
				cfg: params.cfg,
				agentDir: params.agentDir,
				authStore: params.authStore,
				lyrics: sanitized.lyrics,
				instrumental: sanitized.instrumental,
				durationSeconds: sanitized.durationSeconds,
				format: sanitized.format,
				inputImages: params.inputImages
			});
			if (!Array.isArray(result.tracks) || result.tracks.length === 0) throw new Error("Music generation provider returned no tracks.");
			return {
				tracks: result.tracks,
				provider: candidate.provider,
				model: result.model ?? candidate.model,
				attempts,
				lyrics: result.lyrics,
				normalization: sanitized.normalization,
				metadata: {
					...result.metadata,
					...buildMediaGenerationNormalizationMetadata({ normalization: sanitized.normalization })
				},
				ignoredOverrides: sanitized.ignoredOverrides
			};
		} catch (err) {
			lastError = err;
			const described = isFailoverError(err) ? describeFailoverError(err) : void 0;
			attempts.push({
				provider: candidate.provider,
				model: candidate.model,
				error: described?.message ?? formatErrorMessage(err),
				reason: described?.reason,
				status: described?.status,
				code: described?.code
			});
			log.debug(`music-generation candidate failed: ${candidate.provider}/${candidate.model}`);
		}
	}
	return throwCapabilityGenerationFailure({
		capabilityLabel: "music generation",
		attempts,
		lastError
	});
}
//#endregion
export { resolveMusicGenerationModeCapabilities as i, listRuntimeMusicGenerationProviders as n, listSupportedMusicGenerationModes as r, generateMusic as t };
