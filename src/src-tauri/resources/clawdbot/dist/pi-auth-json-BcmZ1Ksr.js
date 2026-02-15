import "./paths-BZtyHNCi.js";
import "./workspace-CUznpDHg.js";
import "./exec-DBtWJ4Ld.js";
import "./agent-scope-xZu8sXcF.js";
import "./boolean-Bb19hm9Y.js";
import { h as ensureAuthProfileStore, p as listProfilesForProvider } from "./model-auth-BffKC6OJ.js";
import "./github-copilot-token-BRNzgUa_.js";
import fs from "node:fs/promises";
import path from "node:path";

//#region src/agents/pi-auth-json.ts
async function readAuthJson(filePath) {
	try {
		const raw = await fs.readFile(filePath, "utf8");
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		return parsed;
	} catch {
		return {};
	}
}
/**
* pi-coding-agent's ModelRegistry/AuthStorage expects OAuth credentials in auth.json.
*
* OpenClaw stores OAuth credentials in auth-profiles.json instead. This helper
* bridges a subset of credentials into agentDir/auth.json so pi-coding-agent can
* (a) consider the provider authenticated and (b) include built-in models in its
* registry/catalog output.
*
* Currently used for openai-codex.
*/
async function ensurePiAuthJsonFromAuthProfiles(agentDir) {
	const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	const codexProfiles = listProfilesForProvider(store, "openai-codex");
	if (codexProfiles.length === 0) return {
		wrote: false,
		authPath: path.join(agentDir, "auth.json")
	};
	const profileId = codexProfiles[0];
	const cred = profileId ? store.profiles[profileId] : void 0;
	if (!cred || cred.type !== "oauth") return {
		wrote: false,
		authPath: path.join(agentDir, "auth.json")
	};
	const accessRaw = cred.access;
	const refreshRaw = cred.refresh;
	const expiresRaw = cred.expires;
	const access = typeof accessRaw === "string" ? accessRaw.trim() : "";
	const refresh = typeof refreshRaw === "string" ? refreshRaw.trim() : "";
	const expires = typeof expiresRaw === "number" ? expiresRaw : NaN;
	if (!access || !refresh || !Number.isFinite(expires) || expires <= 0) return {
		wrote: false,
		authPath: path.join(agentDir, "auth.json")
	};
	const authPath = path.join(agentDir, "auth.json");
	const next = await readAuthJson(authPath);
	const existing = next["openai-codex"];
	const desired = {
		type: "oauth",
		access,
		refresh,
		expires
	};
	if (existing && typeof existing === "object" && existing.type === "oauth" && existing.access === access && existing.refresh === refresh && existing.expires === expires) return {
		wrote: false,
		authPath
	};
	next["openai-codex"] = desired;
	await fs.mkdir(agentDir, {
		recursive: true,
		mode: 448
	});
	await fs.writeFile(authPath, `${JSON.stringify(next, null, 2)}\n`, { mode: 384 });
	return {
		wrote: true,
		authPath
	};
}

//#endregion
export { ensurePiAuthJsonFromAuthProfiles };