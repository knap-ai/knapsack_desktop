import { i as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/media-understanding-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "media-understanding-core",
		artifactBasename: "runtime-api.js"
	});
}
const describeImageFile = ((...args) => loadFacadeModule()["describeImageFile"](...args));
const describeImageFileWithModel = ((...args) => loadFacadeModule()["describeImageFileWithModel"](...args));
const describeVideoFile = ((...args) => loadFacadeModule()["describeVideoFile"](...args));
const runMediaUnderstandingFile = ((...args) => loadFacadeModule()["runMediaUnderstandingFile"](...args));
const transcribeAudioFile = ((...args) => loadFacadeModule()["transcribeAudioFile"](...args));
//#endregion
export { transcribeAudioFile as a, runMediaUnderstandingFile as i, describeImageFileWithModel as n, describeVideoFile as r, describeImageFile as t };
