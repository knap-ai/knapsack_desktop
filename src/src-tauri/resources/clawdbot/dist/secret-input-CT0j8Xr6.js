import { l as normalizeResolvedSecretInputString, o as hasConfiguredSecretInput, p as resolveSecretInputRef, u as normalizeSecretInputString } from "./types.secrets-ClP-vJ-P.js";
//#region src/memory-host-sdk/host/secret-input.ts
function hasConfiguredMemorySecretInput(value) {
	return hasConfiguredSecretInput(value);
}
function resolveMemorySecretInputString(params) {
	const { ref } = resolveSecretInputRef({ value: params.value });
	if (ref?.source === "env") {
		const envValue = normalizeSecretInputString(process.env[ref.id]);
		if (envValue) return envValue;
	}
	return normalizeResolvedSecretInputString({
		value: params.value,
		path: params.path
	});
}
//#endregion
export { resolveMemorySecretInputString as n, hasConfiguredMemorySecretInput as t };
