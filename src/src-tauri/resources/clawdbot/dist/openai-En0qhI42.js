import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/openai.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "openai",
		artifactBasename: "api.js"
	});
}
const applyOpenAIConfig = ((...args) => loadFacadeModule()["applyOpenAIConfig"](...args));
const applyOpenAIProviderConfig = ((...args) => loadFacadeModule()["applyOpenAIProviderConfig"](...args));
const buildOpenAICodexProvider = ((...args) => loadFacadeModule()["buildOpenAICodexProvider"](...args));
const buildOpenAIProvider = ((...args) => loadFacadeModule()["buildOpenAIProvider"](...args));
const OPENAI_CODEX_DEFAULT_MODEL = loadFacadeModule()["OPENAI_CODEX_DEFAULT_MODEL"];
const OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL = loadFacadeModule()["OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL"];
const OPENAI_DEFAULT_EMBEDDING_MODEL = loadFacadeModule()["OPENAI_DEFAULT_EMBEDDING_MODEL"];
const OPENAI_DEFAULT_IMAGE_MODEL = loadFacadeModule()["OPENAI_DEFAULT_IMAGE_MODEL"];
const OPENAI_DEFAULT_MODEL = loadFacadeModule()["OPENAI_DEFAULT_MODEL"];
const OPENAI_DEFAULT_TTS_MODEL = loadFacadeModule()["OPENAI_DEFAULT_TTS_MODEL"];
const OPENAI_DEFAULT_TTS_VOICE = loadFacadeModule()["OPENAI_DEFAULT_TTS_VOICE"];
//#endregion
export { OPENAI_DEFAULT_MODEL as a, applyOpenAIConfig as c, buildOpenAIProvider as d, OPENAI_DEFAULT_IMAGE_MODEL as i, applyOpenAIProviderConfig as l, OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL as n, OPENAI_DEFAULT_TTS_MODEL as o, OPENAI_DEFAULT_EMBEDDING_MODEL as r, OPENAI_DEFAULT_TTS_VOICE as s, OPENAI_CODEX_DEFAULT_MODEL as t, buildOpenAICodexProvider as u };
