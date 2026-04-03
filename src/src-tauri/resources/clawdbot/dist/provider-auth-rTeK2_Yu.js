import "./store-CY-e50gT.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./profiles-RmR8EAZC.js";
import "./repair-CfT1BuIb.js";
import "./provider-env-vars-BgFCVfb6.js";
import "./model-auth-markers-BjPX15EF.js";
import "./provider-auth-helpers-DN8kDr8X.js";
import "./provider-auth-input-cJfyGWtW.js";
import "./provider-api-key-auth-BF3kHzmf.js";
import { createHash, randomBytes } from "node:crypto";
//#region src/plugins/provider-auth-token.ts
const ANTHROPIC_SETUP_TOKEN_PREFIX = "sk-ant-oat01-";
const DEFAULT_TOKEN_PROFILE_NAME = "default";
function normalizeTokenProfileName(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return DEFAULT_TOKEN_PROFILE_NAME;
	return trimmed.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "default";
}
function buildTokenProfileId(params) {
	return `${normalizeProviderId(params.provider)}:${normalizeTokenProfileName(params.name)}`;
}
function validateAnthropicSetupToken(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "Required";
	if (!trimmed.startsWith("sk-ant-oat01-")) return `Expected token starting with ${ANTHROPIC_SETUP_TOKEN_PREFIX}`;
	if (trimmed.length < 80) return "Token looks too short; paste the full setup-token";
}
//#endregion
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
export { validateAnthropicSetupToken as i, toFormUrlEncoded as n, buildTokenProfileId as r, generatePkceVerifierChallenge as t };
