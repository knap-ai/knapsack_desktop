import { n as resolveDefaultTelegramAccountId } from "./account-selection-CejmBnAP.js";
import fs from "node:fs";
import { resolveChannelAllowFromPath } from "openclaw/plugin-sdk/channel-pairing-paths";
//#region extensions/telegram/src/state-migrations.ts
function fileExists(pathValue) {
	try {
		return fs.existsSync(pathValue) && fs.statSync(pathValue).isFile();
	} catch {
		return false;
	}
}
function detectTelegramLegacyStateMigrations(params) {
	const legacyPath = resolveChannelAllowFromPath("telegram", params.env);
	if (!fileExists(legacyPath)) return [];
	const accountId = resolveDefaultTelegramAccountId(params.cfg);
	const targetPath = resolveChannelAllowFromPath("telegram", params.env, accountId);
	if (fileExists(targetPath)) return [];
	return [{
		kind: "copy",
		label: "Telegram pairing allowFrom",
		sourcePath: legacyPath,
		targetPath
	}];
}
//#endregion
export { detectTelegramLegacyStateMigrations as t };
