import { n as createLazyFacadeObjectValue } from "./facade-loader-2P4UQTnv.js";
import { n as loadActivatedBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeValue } from "./facade-runtime-wWkqgIbw.js";
//#region src/plugin-sdk/tts-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "speech-core",
		artifactBasename: "runtime-api.js"
	});
}
const _test = createLazyFacadeObjectValue(() => loadFacadeModule()._test);
const buildTtsSystemPromptHint = createLazyFacadeValue(loadFacadeModule, "buildTtsSystemPromptHint");
const getLastTtsAttempt = createLazyFacadeValue(loadFacadeModule, "getLastTtsAttempt");
const getResolvedSpeechProviderConfig = createLazyFacadeValue(loadFacadeModule, "getResolvedSpeechProviderConfig");
const getTtsMaxLength = createLazyFacadeValue(loadFacadeModule, "getTtsMaxLength");
const getTtsProvider = createLazyFacadeValue(loadFacadeModule, "getTtsProvider");
const isSummarizationEnabled = createLazyFacadeValue(loadFacadeModule, "isSummarizationEnabled");
const isTtsEnabled = createLazyFacadeValue(loadFacadeModule, "isTtsEnabled");
const isTtsProviderConfigured = createLazyFacadeValue(loadFacadeModule, "isTtsProviderConfigured");
const listSpeechVoices = createLazyFacadeValue(loadFacadeModule, "listSpeechVoices");
const maybeApplyTtsToPayload = createLazyFacadeValue(loadFacadeModule, "maybeApplyTtsToPayload");
const resolveExplicitTtsOverrides = createLazyFacadeValue(loadFacadeModule, "resolveExplicitTtsOverrides");
const resolveTtsAutoMode = createLazyFacadeValue(loadFacadeModule, "resolveTtsAutoMode");
const resolveTtsConfig = createLazyFacadeValue(loadFacadeModule, "resolveTtsConfig");
const resolveTtsPrefsPath = createLazyFacadeValue(loadFacadeModule, "resolveTtsPrefsPath");
const resolveTtsProviderOrder = createLazyFacadeValue(loadFacadeModule, "resolveTtsProviderOrder");
const setLastTtsAttempt = createLazyFacadeValue(loadFacadeModule, "setLastTtsAttempt");
const setSummarizationEnabled = createLazyFacadeValue(loadFacadeModule, "setSummarizationEnabled");
const setTtsAutoMode = createLazyFacadeValue(loadFacadeModule, "setTtsAutoMode");
const setTtsEnabled = createLazyFacadeValue(loadFacadeModule, "setTtsEnabled");
const setTtsMaxLength = createLazyFacadeValue(loadFacadeModule, "setTtsMaxLength");
const setTtsProvider = createLazyFacadeValue(loadFacadeModule, "setTtsProvider");
const synthesizeSpeech = createLazyFacadeValue(loadFacadeModule, "synthesizeSpeech");
const textToSpeech = createLazyFacadeValue(loadFacadeModule, "textToSpeech");
const textToSpeechTelephony = createLazyFacadeValue(loadFacadeModule, "textToSpeechTelephony");
//#endregion
export { synthesizeSpeech as C, setTtsProvider as S, textToSpeechTelephony as T, setLastTtsAttempt as _, getTtsMaxLength as a, setTtsEnabled as b, isTtsEnabled as c, maybeApplyTtsToPayload as d, resolveExplicitTtsOverrides as f, resolveTtsProviderOrder as g, resolveTtsPrefsPath as h, getResolvedSpeechProviderConfig as i, isTtsProviderConfigured as l, resolveTtsConfig as m, buildTtsSystemPromptHint as n, getTtsProvider as o, resolveTtsAutoMode as p, getLastTtsAttempt as r, isSummarizationEnabled as s, _test as t, listSpeechVoices as u, setSummarizationEnabled as v, textToSpeech as w, setTtsMaxLength as x, setTtsAutoMode as y };
