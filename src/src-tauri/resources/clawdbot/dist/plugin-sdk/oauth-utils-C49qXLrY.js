import { createHash, randomBytes } from "node:crypto";
//#region src/plugin-sdk/oauth-utils.ts
function toFormUrlEncoded(data) {
	return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}
function generatePkceVerifierChallenge() {
	const verifier = randomBytes(32).toString("base64url");
	return {
		verifier,
		challenge: createHash("sha256").update(verifier).digest("base64url")
	};
}
//#endregion
export { toFormUrlEncoded as n, generatePkceVerifierChallenge as t };
