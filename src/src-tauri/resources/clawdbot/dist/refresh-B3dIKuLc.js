import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
//#region extensions/qwen-portal-auth/refresh.ts
const QWEN_OAUTH_TOKEN_ENDPOINT = `https://chat.qwen.ai/api/v1/oauth2/token`;
const QWEN_OAUTH_CLIENT_ID = "f0304373b74a44d2b584a3fb70ca9e56";
async function refreshQwenPortalCredentials(credentials) {
	const refreshToken = credentials.refresh?.trim();
	if (!refreshToken) throw new Error("Qwen OAuth refresh token missing; re-authenticate.");
	const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json"
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: QWEN_OAUTH_CLIENT_ID
		})
	});
	if (!response.ok) {
		const text = await response.text();
		if (response.status === 400) throw new Error(`Qwen OAuth refresh token expired or invalid. Re-authenticate with \`${formatCliCommand("openclaw models auth login --provider qwen-portal")}\`.`);
		throw new Error(`Qwen OAuth refresh failed: ${text || response.statusText}`);
	}
	const payload = await response.json();
	const accessToken = payload.access_token?.trim();
	const newRefreshToken = payload.refresh_token?.trim();
	const expiresIn = payload.expires_in;
	if (!accessToken) throw new Error("Qwen OAuth refresh response missing access token.");
	if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn) || expiresIn <= 0) throw new Error("Qwen OAuth refresh response missing or invalid expires_in.");
	return {
		...credentials,
		refresh: newRefreshToken || refreshToken,
		access: accessToken,
		expires: Date.now() + expiresIn * 1e3
	};
}
//#endregion
export { refreshQwenPortalCredentials as t };
