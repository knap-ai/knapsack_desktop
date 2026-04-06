import { u as isRecord, v as resolveUserPath } from "./utils-CE3P21nG.js";
import { h as resolveOAuthDir } from "./paths-CD8i0MSg.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import fsSync from "node:fs";
import path from "node:path";
//#region src/plugin-sdk/whatsapp-auth-presence.ts
function hasWebCredsSync(authDir) {
	try {
		return fsSync.existsSync(path.join(authDir, "creds.json"));
	} catch {
		return false;
	}
}
function resolveWhatsAppChannelConfig(cfg) {
	return cfg.channels?.whatsapp;
}
function addAccountAuthDirs(authDirs, accountId, account, accountsRoot, env) {
	authDirs.add(path.join(accountsRoot, normalizeAccountId(accountId)));
	const configuredAuthDir = account?.authDir?.trim();
	if (configuredAuthDir) authDirs.add(resolveUserPath(configuredAuthDir, env));
}
function listWhatsAppAuthDirs(cfg, env = process.env) {
	const oauthDir = resolveOAuthDir(env);
	const accountsRoot = path.join(oauthDir, "whatsapp");
	const channel = resolveWhatsAppChannelConfig(cfg);
	const authDirs = new Set([oauthDir, path.join(accountsRoot, DEFAULT_ACCOUNT_ID)]);
	addAccountAuthDirs(authDirs, DEFAULT_ACCOUNT_ID, void 0, accountsRoot, env);
	if (channel?.defaultAccount?.trim()) addAccountAuthDirs(authDirs, channel.defaultAccount, channel.accounts?.[channel.defaultAccount], accountsRoot, env);
	const accounts = channel?.accounts;
	if (isRecord(accounts)) for (const [accountId, value] of Object.entries(accounts)) addAccountAuthDirs(authDirs, accountId, isRecord(value) ? value : void 0, accountsRoot, env);
	try {
		const entries = fsSync.readdirSync(accountsRoot, { withFileTypes: true });
		for (const entry of entries) if (entry.isDirectory()) authDirs.add(path.join(accountsRoot, entry.name));
	} catch {}
	return [...authDirs];
}
function hasAnyWhatsAppAuth(cfg, env = process.env) {
	return listWhatsAppAuthDirs(cfg, env).some((authDir) => hasWebCredsSync(authDir));
}
//#endregion
export { hasAnyWhatsAppAuth as t };
