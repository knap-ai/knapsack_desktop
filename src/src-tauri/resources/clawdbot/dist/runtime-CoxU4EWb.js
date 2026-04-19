import { r as normalizeMediaProviderId } from "./entry-capabilities-7cOlAQEs.js";
import "./resolve-DqYzTtEU.js";
import { a as runCapability, o as createMediaAttachmentCache, s as normalizeMediaAttachments, t as buildProviderRegistry } from "./runner-GjYg-C-v.js";
import { i as normalizeDecisionReason, n as findDecisionReason } from "./runner.entries-DUh05bfx.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/media-understanding/runtime.ts
const KIND_BY_CAPABILITY = {
	audio: "audio.transcription",
	image: "image.description",
	video: "video.description"
};
function resolveDecisionFailureReason(decision) {
	return normalizeDecisionReason(findDecisionReason(decision, "failed"));
}
function buildFileContext(params) {
	return {
		MediaPath: params.filePath,
		MediaType: params.mime
	};
}
async function runMediaUnderstandingFile(params) {
	const ctx = buildFileContext(params);
	const attachments = normalizeMediaAttachments(ctx);
	if (attachments.length === 0) return { text: void 0 };
	const config = params.cfg.tools?.media?.[params.capability];
	if (config?.enabled === false) return {
		text: void 0,
		provider: void 0,
		model: void 0,
		output: void 0
	};
	const providerRegistry = buildProviderRegistry(void 0, params.cfg);
	const cache = createMediaAttachmentCache(attachments, { localPathRoots: [path.dirname(params.filePath)] });
	try {
		const result = await runCapability({
			capability: params.capability,
			cfg: params.cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config,
			activeModel: params.activeModel
		});
		if (result.outputs.length === 0 && result.decision.outcome === "failed") throw new Error(resolveDecisionFailureReason(result.decision) ?? `${params.capability} understanding failed`);
		const output = result.outputs.find((entry) => entry.kind === KIND_BY_CAPABILITY[params.capability]);
		return {
			text: output?.text?.trim() || void 0,
			provider: output?.provider,
			model: output?.model,
			output
		};
	} finally {
		await cache.cleanup();
	}
}
async function describeImageFile(params) {
	return await runMediaUnderstandingFile({
		...params,
		capability: "image"
	});
}
async function describeImageFileWithModel(params) {
	const timeoutMs = params.timeoutMs ?? 3e4;
	const provider = buildProviderRegistry(void 0, params.cfg).get(normalizeMediaProviderId(params.provider));
	if (!provider?.describeImage) throw new Error(`Provider does not support image analysis: ${params.provider}`);
	const buffer = await fs.readFile(params.filePath);
	return await provider.describeImage({
		buffer,
		fileName: path.basename(params.filePath),
		mime: params.mime,
		provider: params.provider,
		model: params.model,
		prompt: params.prompt,
		maxTokens: params.maxTokens,
		timeoutMs,
		cfg: params.cfg,
		agentDir: params.agentDir ?? ""
	});
}
async function describeVideoFile(params) {
	return await runMediaUnderstandingFile({
		...params,
		capability: "video"
	});
}
async function transcribeAudioFile(params) {
	const cfg = params.language || params.prompt ? {
		...params.cfg,
		tools: {
			...params.cfg.tools,
			media: {
				...params.cfg.tools?.media,
				audio: {
					...params.cfg.tools?.media?.audio,
					...params.language ? { _requestLanguageOverride: params.language } : {},
					...params.prompt ? { _requestPromptOverride: params.prompt } : {},
					...params.language ? { language: params.language } : {},
					...params.prompt ? { prompt: params.prompt } : {}
				}
			}
		}
	} : params.cfg;
	return { text: (await runMediaUnderstandingFile({
		...params,
		cfg,
		capability: "audio"
	})).text };
}
//#endregion
export { transcribeAudioFile as a, runMediaUnderstandingFile as i, describeImageFileWithModel as n, describeVideoFile as r, describeImageFile as t };
