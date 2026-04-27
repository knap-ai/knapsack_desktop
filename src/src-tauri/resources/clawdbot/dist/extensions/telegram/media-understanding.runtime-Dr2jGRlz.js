import { describeImageWithModel as describeImageWithModel$1, transcribeFirstAudio as transcribeFirstAudio$1 } from "openclaw/plugin-sdk/media-runtime";
//#region extensions/telegram/src/media-understanding.runtime.ts
async function describeImageWithModel(...args) {
	return await describeImageWithModel$1(...args);
}
async function transcribeFirstAudio(...args) {
	return await transcribeFirstAudio$1(...args);
}
//#endregion
export { describeImageWithModel, transcribeFirstAudio };
