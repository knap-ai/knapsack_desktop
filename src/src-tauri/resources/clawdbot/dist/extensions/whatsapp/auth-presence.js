import { t as hasWebCredsSync } from "./creds-files-BD3Rjqo2.js";
import fs from "node:fs";
import path from "node:path";
import { resolveOAuthDir } from "openclaw/plugin-sdk/state-paths";
import { resolveUserPath } from "openclaw/plugin-sdk/account-resolution";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk/account-id";
//#region extensions/whatsapp/auth-presence.ts
function addAccountAuthDirs(authDirs, accountId, authDir, accountsRoot, env) {
	authDirs.add(path.join(accountsRoot, normalizeAccountId(accountId)));
	const configuredAuthDir = authDir?.trim();
	if (configuredAuthDir) authDirs.add(resolveUserPath(configuredAuthDir, env));
}
function listWhatsAppAuthDirs(cfg, env = process.env) {
	const oauthDir = resolveOAuthDir(env);
	const accountsRoot = path.join(oauthDir, "whatsapp");
	const channel = cfg.channels?.whatsapp;
	const authDirs = new Set([oauthDir, path.join(accountsRoot, DEFAULT_ACCOUNT_ID)]);
	addAccountAuthDirs(authDirs, DEFAULT_ACCOUNT_ID, void 0, accountsRoot, env);
	if (channel?.defaultAccount?.trim()) addAccountAuthDirs(authDirs, channel.defaultAccount, channel.accounts?.[channel.defaultAccount]?.authDir, accountsRoot, env);
	const accounts = channel?.accounts;
	if (accounts) for (const [accountId, account] of Object.entries(accounts)) addAccountAuthDirs(authDirs, accountId, account?.authDir, accountsRoot, env);
	try {
		const entries = fs.readdirSync(accountsRoot, { withFileTypes: true });
		for (const entry of entries) if (entry.isDirectory()) authDirs.add(path.join(accountsRoot, entry.name));
	} catch {}
	return [...authDirs];
}
function hasAnyWhatsAppAuth(params, env = process.env) {
	return listWhatsAppAuthDirs(params && typeof params === "object" && "cfg" in params ? params.cfg : params, params && typeof params === "object" && "cfg" in params ? params.env ?? env : env).some((authDir) => hasWebCredsSync(authDir));
}
//#endregion
export { hasAnyWhatsAppAuth };
