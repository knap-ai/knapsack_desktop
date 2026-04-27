import { describeImageWithModel, describeImagesWithModel } from "openclaw/plugin-sdk/media-understanding";
//#region extensions/anthropic/media-understanding-provider.ts
const anthropicMediaUnderstandingProvider = {
	id: "anthropic",
	capabilities: ["image"],
	defaultModels: { image: "claude-opus-4-7" },
	autoPriority: { image: 20 },
	nativeDocumentInputs: ["pdf"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel
};
//#endregion
export { anthropicMediaUnderstandingProvider };
