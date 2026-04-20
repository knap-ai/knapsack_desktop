import "./types.secrets-CeL3gSMO.js";
import "./ref-contract-B0QmVSlT.js";
import "./provider-env-vars-Sj-BhOn9.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import "./model-auth-markers-ve-OgG6R.js";
import { t as resolveEnvApiKey } from "./model-auth-env-B-45Q6PX.js";
import "./models-config.providers.secrets-ClAqHxSG.js";
import { n as listProfilesForProvider } from "./profiles-CVErLX2C.js";
import "./repair-taA0zK8p.js";
import "./provider-auth-input-fye6IC_1.js";
import "./provider-auth-helpers-DKL5bJRR.js";
import "./provider-api-key-auth-nkL4zxbI.js";
import { createHash, randomBytes } from "node:crypto";
//#region src/plugin-sdk/oauth-utils.ts
/** Encode a flat object as application/x-www-form-urlencoded form data. */
function toFormUrlEncoded(data) {
	return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}
/** Generate a PKCE verifier/challenge pair suitable for OAuth authorization flows. */
function generatePkceVerifierChallenge() {
	const verifier = randomBytes(32).toString("base64url");
	return {
		verifier,
		challenge: createHash("sha256").update(verifier).digest("base64url")
	};
}
//#endregion
//#region src/plugin-sdk/provider-auth.ts
function isProviderApiKeyConfigured(params) {
	if (resolveEnvApiKey(params.provider)?.apiKey) return true;
	const agentDir = params.agentDir?.trim();
	if (!agentDir) return false;
	return listProfilesForProvider(ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false }), params.provider).length > 0;
}
//#endregion
export { generatePkceVerifierChallenge as n, toFormUrlEncoded as r, isProviderApiKeyConfigured as t };
