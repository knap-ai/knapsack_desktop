import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { a as modelSupportsVision, n as findModelInCatalog, r as loadModelCatalog } from "./model-catalog-k0g7_9Nb.js";
import "./agent-runtime-B7ucOTD-.js";
//#region extensions/telegram/src/sticker-vision.runtime.ts
async function resolveStickerVisionSupportRuntime(params) {
	const catalog = await loadModelCatalog({ config: params.cfg });
	const defaultModel = resolveDefaultModelForAgent({
		cfg: params.cfg,
		agentId: params.agentId
	});
	const entry = findModelInCatalog(catalog, defaultModel.provider, defaultModel.model);
	if (!entry) return false;
	return modelSupportsVision(entry);
}
//#endregion
export { resolveStickerVisionSupportRuntime };
