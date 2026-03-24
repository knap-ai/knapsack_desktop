import { _ as normalizeAccountId } from "./session-key-DAhnzjyr.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-C5JbULY6.js";
//#region extensions/matrix/src/auth-precedence.ts
const MATRIX_DEFAULT_ACCOUNT_AUTH_ONLY_FIELDS = new Set([
	"userId",
	"accessToken",
	"password",
	"deviceId"
]);
function resolveMatrixStringSourceValue(value) {
	return typeof value === "string" ? value : "";
}
function shouldAllowBaseAuthFallback(accountId, field) {
	return normalizeAccountId(accountId) === "default" || !MATRIX_DEFAULT_ACCOUNT_AUTH_ONLY_FIELDS.has(field);
}
function resolveMatrixAccountStringValues(params) {
	const fields = [
		"homeserver",
		"userId",
		"accessToken",
		"password",
		"deviceId",
		"deviceName"
	];
	const resolved = {};
	for (const field of fields) resolved[field] = resolveMatrixStringSourceValue(params.account?.[field]) || resolveMatrixStringSourceValue(params.scopedEnv?.[field]) || (shouldAllowBaseAuthFallback(params.accountId, field) ? resolveMatrixStringSourceValue(params.channel?.[field]) || resolveMatrixStringSourceValue(params.globalEnv?.[field]) : "");
	return resolved;
}
//#endregion
//#region src/plugin-sdk/matrix.ts
const matrixSetup = createOptionalChannelSetupSurface({
	channel: "matrix",
	label: "Matrix",
	npmSpec: "@openclaw/matrix",
	docsPath: "/channels/matrix"
});
const matrixSetupWizard = matrixSetup.setupWizard;
const matrixSetupAdapter = matrixSetup.setupAdapter;
//#endregion
export { matrixSetupWizard as n, resolveMatrixAccountStringValues as r, matrixSetupAdapter as t };
