import { w as normalizeMediaProviderId } from "../../resolve-B10t5zo0.js";
import { i as normalizeMediaAttachments, r as createMediaAttachmentCache, s as runCapability, t as buildProviderRegistry } from "../../runner-D2riOkUz.js";
import "../../media-runtime-DdCWeFPm.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region extensions/media-understanding-core/src/runtime.ts
const KIND_BY_CAPABILITY = {
	audio: "audio.transcription",
	image: "image.description",
	video: "video.description"
};
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
		const output = (await runCapability({
			capability: params.capability,
			cfg: params.cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config,
			activeModel: params.activeModel
		})).outputs.find((entry) => entry.kind === KIND_BY_CAPABILITY[params.capability]);
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
	return { text: (await runMediaUnderstandingFile({
		...params,
		capability: "audio"
	})).text };
}
//#endregion
export { describeImageFile, describeImageFileWithModel, describeVideoFile, runMediaUnderstandingFile, transcribeAudioFile };
