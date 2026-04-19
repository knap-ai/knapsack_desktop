import { o as resolveRequiredHomeDir } from "./home-dir-BEqRdfoa.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import "./provider-auth-DWLaZig-.js";
import "./runtime-env-DjtBb0Ku.js";
import { t as trimNonEmptyString } from "./openai-codex-shared-DBcRvlKA.js";
import { n as resolveCodexAccessTokenExpiry, r as resolveCodexAuthIdentity } from "./openai-codex-auth-identity-SEhD0-Lx.js";
import fs from "node:fs";
import path from "node:path";
//#region extensions/openai/openai-codex-cli-auth.ts
const PROVIDER_ID = "openai-codex";
const log = createSubsystemLogger("openai/codex-cli-auth");
const CODEX_CLI_PROFILE_ID = `${PROVIDER_ID}:codex-cli`;
const OPENAI_CODEX_DEFAULT_PROFILE_ID = `${PROVIDER_ID}:default`;
function resolveCodexCliHome(env) {
	const configured = trimNonEmptyString(env.CODEX_HOME);
	if (!configured) return path.join(resolveRequiredHomeDir(), ".codex");
	if (configured === "~") return resolveRequiredHomeDir();
	if (configured.startsWith("~/")) return path.join(resolveRequiredHomeDir(), configured.slice(2));
	return path.resolve(configured);
}
function readCodexCliAuthFile(env) {
	try {
		const authPath = path.join(resolveCodexCliHome(env), "auth.json");
		const raw = fs.readFileSync(authPath, "utf8");
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch (error) {
		const code = error instanceof SyntaxError ? "INVALID_JSON" : error instanceof Error && "code" in error ? error.code : void 0;
		if (code === "ENOENT") return null;
		log.debug(`Failed to read Codex CLI auth file (code=${typeof code === "string" ? code : "UNKNOWN"})`);
		return null;
	}
}
function oauthCredentialMatches(a, b) {
	return a.type === b.type && a.provider === b.provider && a.access === b.access && a.refresh === b.refresh && a.expires === b.expires && a.clientId === b.clientId && a.email === b.email && a.displayName === b.displayName && a.enterpriseUrl === b.enterpriseUrl && a.projectId === b.projectId && a.accountId === b.accountId;
}
function readOpenAICodexCliOAuthProfile(params) {
	const authFile = readCodexCliAuthFile(params.env ?? process.env);
	if (!authFile || authFile.auth_mode !== "chatgpt") return null;
	const access = trimNonEmptyString(authFile.tokens?.access_token);
	const refresh = trimNonEmptyString(authFile.tokens?.refresh_token);
	if (!access || !refresh) return null;
	const accountId = trimNonEmptyString(authFile.tokens?.account_id);
	const identity = resolveCodexAuthIdentity({ accessToken: access });
	const credential = {
		type: "oauth",
		provider: PROVIDER_ID,
		access,
		refresh,
		expires: resolveCodexAccessTokenExpiry(access) ?? 0,
		...accountId ? { accountId } : {},
		...identity.email ? { email: identity.email } : {},
		...identity.profileName ? { displayName: identity.profileName } : {}
	};
	const existing = params.store.profiles[OPENAI_CODEX_DEFAULT_PROFILE_ID];
	if (existing && (existing.type !== "oauth" || !oauthCredentialMatches(existing, credential))) return null;
	return {
		profileId: OPENAI_CODEX_DEFAULT_PROFILE_ID,
		credential
	};
}
//#endregion
export { OPENAI_CODEX_DEFAULT_PROFILE_ID as n, readOpenAICodexCliOAuthProfile as r, CODEX_CLI_PROFILE_ID as t };
