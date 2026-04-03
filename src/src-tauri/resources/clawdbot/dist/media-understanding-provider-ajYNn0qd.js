import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-DrCqEvKh.js";
import "./media-understanding-CbOWvFaG.js";
//#region extensions/zai/media-understanding-provider.ts
const zaiMediaUnderstandingProvider = {
	id: "zai",
	capabilities: ["image"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel
};
//#endregion
export { zaiMediaUnderstandingProvider as t };
