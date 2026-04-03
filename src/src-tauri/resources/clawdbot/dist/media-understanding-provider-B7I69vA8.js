import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-DrCqEvKh.js";
import "./media-understanding-CbOWvFaG.js";
//#region extensions/anthropic/media-understanding-provider.ts
const anthropicMediaUnderstandingProvider = {
	id: "anthropic",
	capabilities: ["image"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel
};
//#endregion
export { anthropicMediaUnderstandingProvider as t };
