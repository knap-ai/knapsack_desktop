import { i as loadActivatedBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/speech-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "speech-core",
		artifactBasename: "runtime-api.js"
	});
}
const _test = createLazyFacadeObjectValue(() => loadFacadeModule()["_test"]);
const buildTtsSystemPromptHint = ((...args) => loadFacadeModule()["buildTtsSystemPromptHint"](...args));
const getLastTtsAttempt = ((...args) => loadFacadeModule()["getLastTtsAttempt"](...args));
const getResolvedSpeechProviderConfig = ((...args) => loadFacadeModule()["getResolvedSpeechProviderConfig"](...args));
const getTtsMaxLength = ((...args) => loadFacadeModule()["getTtsMaxLength"](...args));
const getTtsProvider = ((...args) => loadFacadeModule()["getTtsProvider"](...args));
const isSummarizationEnabled = ((...args) => loadFacadeModule()["isSummarizationEnabled"](...args));
const isTtsEnabled = ((...args) => loadFacadeModule()["isTtsEnabled"](...args));
const isTtsProviderConfigured = ((...args) => loadFacadeModule()["isTtsProviderConfigured"](...args));
const listSpeechVoices = ((...args) => loadFacadeModule()["listSpeechVoices"](...args));
const maybeApplyTtsToPayload = ((...args) => loadFacadeModule()["maybeApplyTtsToPayload"](...args));
const resolveTtsAutoMode = ((...args) => loadFacadeModule()["resolveTtsAutoMode"](...args));
const resolveTtsConfig = ((...args) => loadFacadeModule()["resolveTtsConfig"](...args));
const resolveTtsPrefsPath = ((...args) => loadFacadeModule()["resolveTtsPrefsPath"](...args));
const resolveTtsProviderOrder = ((...args) => loadFacadeModule()["resolveTtsProviderOrder"](...args));
const setLastTtsAttempt = ((...args) => loadFacadeModule()["setLastTtsAttempt"](...args));
const setSummarizationEnabled = ((...args) => loadFacadeModule()["setSummarizationEnabled"](...args));
const setTtsAutoMode = ((...args) => loadFacadeModule()["setTtsAutoMode"](...args));
const setTtsEnabled = ((...args) => loadFacadeModule()["setTtsEnabled"](...args));
const setTtsMaxLength = ((...args) => loadFacadeModule()["setTtsMaxLength"](...args));
const setTtsProvider = ((...args) => loadFacadeModule()["setTtsProvider"](...args));
const synthesizeSpeech = ((...args) => loadFacadeModule()["synthesizeSpeech"](...args));
const textToSpeech = ((...args) => loadFacadeModule()["textToSpeech"](...args));
const textToSpeechTelephony = ((...args) => loadFacadeModule()["textToSpeechTelephony"](...args));
//#endregion
export { textToSpeech as C, synthesizeSpeech as S, setSummarizationEnabled as _, getTtsMaxLength as a, setTtsMaxLength as b, isTtsEnabled as c, maybeApplyTtsToPayload as d, resolveTtsAutoMode as f, setLastTtsAttempt as g, resolveTtsProviderOrder as h, getResolvedSpeechProviderConfig as i, isTtsProviderConfigured as l, resolveTtsPrefsPath as m, buildTtsSystemPromptHint as n, getTtsProvider as o, resolveTtsConfig as p, getLastTtsAttempt as r, isSummarizationEnabled as s, _test as t, listSpeechVoices as u, setTtsAutoMode as v, textToSpeechTelephony as w, setTtsProvider as x, setTtsEnabled as y };
