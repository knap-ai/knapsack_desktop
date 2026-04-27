import "./types.secrets-Zn5Zyn7M.js";
import "./ref-contract-BeQ-3fY_.js";
import "./provider-env-vars-DsK9fGJ1.js";
import { n as ensureAuthProfileStore } from "./store-CfHec0eX.js";
import "./agent-paths-Df60yWjf.js";
import "./model-auth-markers-CZrGSAU9.js";
import { t as resolveEnvApiKey } from "./model-auth-env-CC-y_Bin.js";
import "./models-config.providers.secrets-CFMXdHhM.js";
import { n as listProfilesForProvider } from "./profile-list-CPl71h59.js";
import "./repair-B9iL8IKa.js";
import "./profiles-RuCKjoVP.js";
import "./provider-auth-input-BHhtM4mz.js";
import "./provider-auth-helpers-BIVX-4NW.js";
import "./provider-api-key-auth-CRUz52Bz.js";
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
/** Generate a PKCE verifier/challenge pair with a 64-character hex verifier. */
function generateHexPkceVerifierChallenge() {
	const verifier = randomBytes(32).toString("hex");
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
export { toFormUrlEncoded as i, generateHexPkceVerifierChallenge as n, generatePkceVerifierChallenge as r, isProviderApiKeyConfigured as t };
