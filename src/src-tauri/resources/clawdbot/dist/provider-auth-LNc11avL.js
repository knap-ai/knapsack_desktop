import "./types.secrets-ClP-vJ-P.js";
import "./ref-contract-DYUJg6ZQ.js";
import "./provider-env-vars-COSpaRlD.js";
import { n as ensureAuthProfileStore } from "./store-D-8DaAtv.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-Cvhc4iGK.js";
import "./model-auth-markers-Huk_Auss.js";
import { t as resolveEnvApiKey } from "./model-auth-env-D8dQbXPk.js";
import "./models-config.providers.secrets-BfMn6k2P.js";
import { t as resolveApiKeyForProfile } from "./oauth-BMVacBS0.js";
import { n as listProfilesForProvider } from "./profile-list-zV5Cv5VC.js";
import "./repair-BeS4nI_5.js";
import { n as resolveAuthProfileOrder } from "./order-Din7_cCm.js";
import "./profiles-CrHNjqxk.js";
import "./provider-auth-input-DHREnmQa.js";
import "./provider-auth-helpers-byAcxGN1.js";
import "./provider-api-key-auth-Ca3FnLkQ.js";
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
function listUsableProviderAuthProfileIds(params) {
	try {
		const agentDir = params.agentDir?.trim() || resolveOpenClawAgentDir();
		const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
		return {
			agentDir,
			profileIds: resolveAuthProfileOrder({
				cfg: params.cfg,
				store,
				provider: params.provider
			})
		};
	} catch {
		return {
			agentDir: "",
			profileIds: []
		};
	}
}
function isProviderAuthProfileConfigured(params) {
	return listUsableProviderAuthProfileIds(params).profileIds.length > 0;
}
async function resolveProviderAuthProfileApiKey(params) {
	const { agentDir, profileIds } = listUsableProviderAuthProfileIds(params);
	if (!agentDir || profileIds.length === 0) return;
	const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	for (const profileId of profileIds) {
		const resolved = await resolveApiKeyForProfile({
			cfg: params.cfg,
			store,
			agentDir,
			profileId
		});
		if (resolved?.apiKey) return resolved.apiKey;
	}
}
//#endregion
export { generateHexPkceVerifierChallenge as a, resolveProviderAuthProfileApiKey as i, isProviderAuthProfileConfigured as n, generatePkceVerifierChallenge as o, listUsableProviderAuthProfileIds as r, toFormUrlEncoded as s, isProviderApiKeyConfigured as t };
