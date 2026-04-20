import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-H0HMzsrb.js";
import "./media-understanding-B8ZG4o1-.js";
//#region extensions/openrouter/media-understanding-provider.ts
const openrouterMediaUnderstandingProvider = {
	id: "openrouter",
	capabilities: ["image"],
	defaultModels: { image: "auto" },
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel
};
//#endregion
export { openrouterMediaUnderstandingProvider as t };
