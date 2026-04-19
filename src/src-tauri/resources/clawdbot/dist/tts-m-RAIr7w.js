import { n as createLazyFacadeObjectValue } from "./facade-loader-CGu7k8Om.js";
import { t as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-gSGchfr7.js";
//#region src/plugin-sdk/tts-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "speech-core",
		artifactBasename: "runtime-api.js"
	});
}
const _test = createLazyFacadeObjectValue(() => loadFacadeModule()._test);
const buildTtsSystemPromptHint = createLazyFacadeValue("buildTtsSystemPromptHint");
const getLastTtsAttempt = createLazyFacadeValue("getLastTtsAttempt");
const getResolvedSpeechProviderConfig = createLazyFacadeValue("getResolvedSpeechProviderConfig");
const getTtsMaxLength = createLazyFacadeValue("getTtsMaxLength");
const getTtsProvider = createLazyFacadeValue("getTtsProvider");
const isSummarizationEnabled = createLazyFacadeValue("isSummarizationEnabled");
const isTtsEnabled = createLazyFacadeValue("isTtsEnabled");
const isTtsProviderConfigured = createLazyFacadeValue("isTtsProviderConfigured");
const listSpeechVoices = createLazyFacadeValue("listSpeechVoices");
const maybeApplyTtsToPayload = createLazyFacadeValue("maybeApplyTtsToPayload");
const resolveExplicitTtsOverrides = createLazyFacadeValue("resolveExplicitTtsOverrides");
const resolveTtsAutoMode = createLazyFacadeValue("resolveTtsAutoMode");
const resolveTtsConfig = createLazyFacadeValue("resolveTtsConfig");
const resolveTtsPrefsPath = createLazyFacadeValue("resolveTtsPrefsPath");
const resolveTtsProviderOrder = createLazyFacadeValue("resolveTtsProviderOrder");
const setLastTtsAttempt = createLazyFacadeValue("setLastTtsAttempt");
const setSummarizationEnabled = createLazyFacadeValue("setSummarizationEnabled");
const setTtsAutoMode = createLazyFacadeValue("setTtsAutoMode");
const setTtsEnabled = createLazyFacadeValue("setTtsEnabled");
const setTtsMaxLength = createLazyFacadeValue("setTtsMaxLength");
const setTtsProvider = createLazyFacadeValue("setTtsProvider");
const synthesizeSpeech = createLazyFacadeValue("synthesizeSpeech");
const textToSpeech = createLazyFacadeValue("textToSpeech");
const textToSpeechTelephony = createLazyFacadeValue("textToSpeechTelephony");
function createLazyFacadeValue(key) {
	return ((...args) => {
		const value = loadFacadeModule()[key];
		if (typeof value !== "function") return value;
		return value(...args);
	});
}
//#endregion
export { synthesizeSpeech as C, setTtsProvider as S, textToSpeechTelephony as T, setLastTtsAttempt as _, getTtsMaxLength as a, setTtsEnabled as b, isTtsEnabled as c, maybeApplyTtsToPayload as d, resolveExplicitTtsOverrides as f, resolveTtsProviderOrder as g, resolveTtsPrefsPath as h, getResolvedSpeechProviderConfig as i, isTtsProviderConfigured as l, resolveTtsConfig as m, buildTtsSystemPromptHint as n, getTtsProvider as o, resolveTtsAutoMode as p, getLastTtsAttempt as r, isSummarizationEnabled as s, _test as t, listSpeechVoices as u, setSummarizationEnabled as v, textToSpeech as w, setTtsMaxLength as x, setTtsAutoMode as y };
