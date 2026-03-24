import { $_ as generatePkceVerifierChallenge, ev as toFormUrlEncoded } from "./pi-embedded-CbCYZxIb.js";
import { randomUUID } from "node:crypto";
//#region extensions/qwen-portal-auth/oauth.ts
const QWEN_OAUTH_BASE_URL = "https://chat.qwen.ai";
const QWEN_OAUTH_DEVICE_CODE_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/device/code`;
const QWEN_OAUTH_TOKEN_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/token`;
const QWEN_OAUTH_CLIENT_ID = "f0304373b74a44d2b584a3fb70ca9e56";
const QWEN_OAUTH_SCOPE = "openid profile email model.completion";
const QWEN_OAUTH_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";
async function requestDeviceCode(params) {
	const response = await fetch(QWEN_OAUTH_DEVICE_CODE_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
			"x-request-id": randomUUID()
		},
		body: toFormUrlEncoded({
			client_id: QWEN_OAUTH_CLIENT_ID,
			scope: QWEN_OAUTH_SCOPE,
			code_challenge: params.challenge,
			code_challenge_method: "S256"
		})
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Qwen device authorization failed: ${text || response.statusText}`);
	}
	const payload = await response.json();
	if (!payload.device_code || !payload.user_code || !payload.verification_uri) throw new Error(payload.error ?? "Qwen device authorization returned an incomplete payload (missing user_code or verification_uri).");
	return payload;
}
async function pollDeviceToken(params) {
	const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json"
		},
		body: toFormUrlEncoded({
			grant_type: QWEN_OAUTH_GRANT_TYPE,
			client_id: QWEN_OAUTH_CLIENT_ID,
			device_code: params.deviceCode,
			code_verifier: params.verifier
		})
	});
	if (!response.ok) {
		let payload;
		try {
			payload = await response.json();
		} catch {
			return {
				status: "error",
				message: await response.text() || response.statusText
			};
		}
		if (payload?.error === "authorization_pending") return { status: "pending" };
		if (payload?.error === "slow_down") return {
			status: "pending",
			slowDown: true
		};
		return {
			status: "error",
			message: payload?.error_description || payload?.error || response.statusText
		};
	}
	const tokenPayload = await response.json();
	if (!tokenPayload.access_token || !tokenPayload.refresh_token || !tokenPayload.expires_in) return {
		status: "error",
		message: "Qwen OAuth returned incomplete token payload."
	};
	return {
		status: "success",
		token: {
			access: tokenPayload.access_token,
			refresh: tokenPayload.refresh_token,
			expires: Date.now() + tokenPayload.expires_in * 1e3,
			resourceUrl: tokenPayload.resource_url
		}
	};
}
async function loginQwenPortalOAuth(params) {
	const { verifier, challenge } = generatePkceVerifierChallenge();
	const device = await requestDeviceCode({ challenge });
	const verificationUrl = device.verification_uri_complete || device.verification_uri;
	await params.note([`Open ${verificationUrl} to approve access.`, `If prompted, enter the code ${device.user_code}.`].join("\n"), "Qwen OAuth");
	try {
		await params.openUrl(verificationUrl);
	} catch {}
	const start = Date.now();
	let pollIntervalMs = device.interval ? device.interval * 1e3 : 2e3;
	const timeoutMs = device.expires_in * 1e3;
	while (Date.now() - start < timeoutMs) {
		params.progress.update("Waiting for Qwen OAuth approval…");
		const result = await pollDeviceToken({
			deviceCode: device.device_code,
			verifier
		});
		if (result.status === "success") return result.token;
		if (result.status === "error") throw new Error(`Qwen OAuth failed: ${result.message}`);
		if (result.status === "pending" && result.slowDown) pollIntervalMs = Math.min(pollIntervalMs * 1.5, 1e4);
		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
	}
	throw new Error("Qwen OAuth timed out waiting for authorization.");
}
//#endregion
export { loginQwenPortalOAuth as t };
