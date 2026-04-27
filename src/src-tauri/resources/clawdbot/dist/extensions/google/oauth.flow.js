import { AUTH_URL, REDIRECT_URI, SCOPES } from "./oauth.shared.js";
import { resolveOAuthClientConfig } from "./oauth.credentials.js";
import { generateHexPkceVerifierChallenge } from "openclaw/plugin-sdk/provider-auth";
import { generateOAuthState, parseOAuthCallbackInput, waitForLocalOAuthCallback } from "openclaw/plugin-sdk/provider-auth-runtime";
import { isWSL2Sync } from "openclaw/plugin-sdk/runtime-env";
//#region extensions/google/oauth.flow.ts
function shouldUseManualOAuthFlow(isRemote) {
	return isRemote || isWSL2Sync();
}
function generatePkce() {
	return generateHexPkceVerifierChallenge();
}
function buildAuthUrl(challenge, state) {
	const { clientId } = resolveOAuthClientConfig();
	return `${AUTH_URL}?${new URLSearchParams({
		client_id: clientId,
		response_type: "code",
		redirect_uri: REDIRECT_URI,
		scope: SCOPES.join(" "),
		code_challenge: challenge,
		code_challenge_method: "S256",
		state,
		access_type: "offline",
		prompt: "consent"
	}).toString()}`;
}
function parseCallbackInput(input) {
	return parseOAuthCallbackInput(input, {
		missingState: "Missing 'state' parameter. Paste the full URL.",
		invalidInput: "Paste the full redirect URL, not just the code."
	});
}
async function waitForLocalCallback(params) {
	return await waitForLocalOAuthCallback({
		expectedState: params.expectedState,
		timeoutMs: params.timeoutMs,
		port: 8085,
		callbackPath: "/oauth2callback",
		redirectUri: REDIRECT_URI,
		successTitle: "Gemini CLI OAuth complete",
		progressMessage: `Waiting for OAuth callback on ${REDIRECT_URI}…`,
		onProgress: params.onProgress
	});
}
//#endregion
export { buildAuthUrl, generateOAuthState, generatePkce, parseCallbackInput, shouldUseManualOAuthFlow, waitForLocalCallback };
