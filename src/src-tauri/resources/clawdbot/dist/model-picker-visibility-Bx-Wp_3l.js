import { at as isLegacyRuntimeModelProvider } from "./io-Dv_xNAZB.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
//#region src/agents/model-picker-visibility.ts
function isModelPickerVisibleProvider(provider) {
	return !isLegacyRuntimeModelProvider(normalizeProviderId(provider));
}
function isModelPickerVisibleModelRef(ref) {
	const separatorIndex = ref.indexOf("/");
	if (separatorIndex <= 0) return true;
	return isModelPickerVisibleProvider(ref.slice(0, separatorIndex));
}
//#endregion
export { isModelPickerVisibleProvider as n, isModelPickerVisibleModelRef as t };
