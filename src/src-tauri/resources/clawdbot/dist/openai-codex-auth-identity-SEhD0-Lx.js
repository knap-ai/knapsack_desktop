import { t as trimNonEmptyString } from "./openai-codex-shared-DBcRvlKA.js";
//#region extensions/openai/openai-codex-auth-identity.ts
function normalizeFutureEpochSeconds(value) {
	if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.trunc(value);
	if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number.parseInt(value.trim(), 10);
}
function decodeCodexJwtPayload(accessToken) {
	const parts = accessToken.split(".");
	if (parts.length !== 3) return null;
	try {
		const decoded = Buffer.from(parts[1], "base64url").toString("utf8");
		const parsed = JSON.parse(decoded);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
}
function resolveCodexStableSubject(payload) {
	const auth = payload?.["https://api.openai.com/auth"];
	const accountUserId = trimNonEmptyString(auth?.chatgpt_account_user_id);
	if (accountUserId) return accountUserId;
	const userId = trimNonEmptyString(auth?.chatgpt_user_id) ?? trimNonEmptyString(auth?.user_id);
	if (userId) return userId;
	const iss = trimNonEmptyString(payload?.iss);
	const sub = trimNonEmptyString(payload?.sub);
	if (iss && sub) return `${iss}|${sub}`;
	return sub;
}
function resolveCodexAccessTokenExpiry(accessToken) {
	const exp = normalizeFutureEpochSeconds(decodeCodexJwtPayload(accessToken)?.exp);
	return exp ? exp * 1e3 : void 0;
}
function resolveCodexAuthIdentity(params) {
	const payload = decodeCodexJwtPayload(params.accessToken);
	const email = trimNonEmptyString(payload?.["https://api.openai.com/profile"]?.email) ?? trimNonEmptyString(params.email);
	if (email) return {
		email,
		profileName: email
	};
	const stableSubject = resolveCodexStableSubject(payload);
	if (!stableSubject) return {};
	return { profileName: `id-${Buffer.from(stableSubject).toString("base64url")}` };
}
//#endregion
export { resolveCodexStableSubject as i, resolveCodexAccessTokenExpiry as n, resolveCodexAuthIdentity as r, decodeCodexJwtPayload as t };
