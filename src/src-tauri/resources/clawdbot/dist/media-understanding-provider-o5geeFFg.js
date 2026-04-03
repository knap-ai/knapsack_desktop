import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-DrCqEvKh.js";
import "./media-understanding-CbOWvFaG.js";
//#region extensions/openrouter/media-understanding-provider.ts
const openrouterMediaUnderstandingProvider = {
	id: "openrouter",
	capabilities: ["image"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel
};
//#endregion
export { openrouterMediaUnderstandingProvider as t };
