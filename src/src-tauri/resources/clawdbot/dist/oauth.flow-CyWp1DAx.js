import { n as isWSL2Sync } from "./wsl-DlWsqZ4r.js";
import "./runtime-env-DjtBb0Ku.js";
import { a as MSTEAMS_OAUTH_REDIRECT_URI, i as MSTEAMS_OAUTH_CALLBACK_PORT, o as buildMSTeamsAuthEndpoint, r as MSTEAMS_OAUTH_CALLBACK_PATH, t as MSTEAMS_DEFAULT_DELEGATED_SCOPES } from "./oauth.shared-DksmvJo9.js";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
//#region extensions/msteams/src/oauth.flow.ts
function shouldUseManualOAuthFlow(isRemote) {
	return isRemote || isWSL2Sync();
}
function generatePkce() {
	const verifier = randomBytes(32).toString("hex");
	return {
		verifier,
		challenge: createHash("sha256").update(verifier).digest("base64url")
	};
}
/** Generate an opaque random state value for OAuth CSRF protection (separate from PKCE verifier). */
function generateOAuthState() {
	return randomBytes(32).toString("hex");
}
function buildMSTeamsAuthUrl(params) {
	const scopes = params.scopes ?? MSTEAMS_DEFAULT_DELEGATED_SCOPES;
	return `${buildMSTeamsAuthEndpoint(params.tenantId)}?${new URLSearchParams({
		client_id: params.clientId,
		response_type: "code",
		redirect_uri: MSTEAMS_OAUTH_REDIRECT_URI,
		scope: scopes.join(" "),
		code_challenge: params.challenge,
		code_challenge_method: "S256",
		state: params.state,
		prompt: "consent"
	}).toString()}`;
}
function parseCallbackInput(input, _expectedState) {
	const trimmed = input.trim();
	if (!trimmed) return { error: "No input provided" };
	try {
		const url = new URL(trimmed);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		if (!code) return { error: "Missing 'code' parameter in URL" };
		if (!state) return { error: "Missing 'state' parameter in URL. Paste the full redirect URL." };
		return {
			code,
			state
		};
	} catch {
		return { error: "Paste the full redirect URL (including code and state parameters), not just the authorization code." };
	}
}
async function waitForLocalCallback(params) {
	const port = MSTEAMS_OAUTH_CALLBACK_PORT;
	const hostname = "localhost";
	const expectedPath = MSTEAMS_OAUTH_CALLBACK_PATH;
	return new Promise((resolve, reject) => {
		let timeout = null;
		const server = createServer((req, res) => {
			try {
				const requestUrl = new URL(req.url ?? "/", `http://${hostname}:${port}`);
				if (requestUrl.pathname !== expectedPath) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "text/plain");
					res.end("Not found");
					return;
				}
				const error = requestUrl.searchParams.get("error");
				const code = requestUrl.searchParams.get("code")?.trim();
				const state = requestUrl.searchParams.get("state")?.trim();
				if (error) {
					res.statusCode = 400;
					res.setHeader("Content-Type", "text/plain");
					res.end(`Authentication failed: ${error}`);
					finish(/* @__PURE__ */ new Error(`OAuth error: ${error}`));
					return;
				}
				if (!code || !state) {
					res.statusCode = 400;
					res.setHeader("Content-Type", "text/plain");
					res.end("Missing code or state");
					finish(/* @__PURE__ */ new Error("Missing OAuth code or state"));
					return;
				}
				if (state !== params.expectedState) {
					res.statusCode = 400;
					res.setHeader("Content-Type", "text/plain");
					res.end("Invalid state");
					finish(/* @__PURE__ */ new Error("OAuth state mismatch"));
					return;
				}
				res.statusCode = 200;
				res.setHeader("Content-Type", "text/html; charset=utf-8");
				res.end("<!doctype html><html><head><meta charset='utf-8'/></head><body><h2>MSTeams Delegated OAuth complete</h2><p>You can close this window and return to OpenClaw.</p></body></html>");
				finish(void 0, {
					code,
					state
				});
			} catch (err) {
				finish(err instanceof Error ? err : /* @__PURE__ */ new Error("OAuth callback failed"));
			}
		});
		const finish = (err, result) => {
			if (timeout) clearTimeout(timeout);
			try {
				server.close();
			} catch {}
			if (err) reject(err);
			else if (result) resolve(result);
		};
		server.once("error", (err) => {
			finish(err instanceof Error ? err : /* @__PURE__ */ new Error("OAuth callback server error"));
		});
		server.listen(port, hostname, () => {
			params.onProgress?.(`Waiting for OAuth callback on ${MSTEAMS_OAUTH_REDIRECT_URI}...`);
		});
		timeout = setTimeout(() => {
			finish(/* @__PURE__ */ new Error("OAuth callback timeout"));
		}, params.timeoutMs);
	});
}
//#endregion
export { shouldUseManualOAuthFlow as a, parseCallbackInput as i, generateOAuthState as n, waitForLocalCallback as o, generatePkce as r, buildMSTeamsAuthUrl as t };
