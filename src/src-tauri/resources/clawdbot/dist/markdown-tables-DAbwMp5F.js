import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { t as resolveAccountEntry } from "./account-lookup-DI_0omIr.js";
import { r as normalizeChannelId } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
//#region src/config/markdown-tables.ts
const DEFAULT_TABLE_MODES = new Map([
	["signal", "bullets"],
	["whatsapp", "bullets"],
	["mattermost", "off"]
]);
const isMarkdownTableMode = (value) => value === "off" || value === "bullets" || value === "code" || value === "block";
function resolveMarkdownModeFromSection(section, accountId) {
	if (!section) return;
	const normalizedAccountId = normalizeAccountId(accountId);
	const accounts = section.accounts;
	if (accounts && typeof accounts === "object") {
		const matchMode = resolveAccountEntry(accounts, normalizedAccountId)?.markdown?.tables;
		if (isMarkdownTableMode(matchMode)) return matchMode;
	}
	const sectionMode = section.markdown?.tables;
	return isMarkdownTableMode(sectionMode) ? sectionMode : void 0;
}
function resolveMarkdownTableMode(params) {
	const channel = normalizeChannelId(params.channel);
	const defaultMode = channel ? DEFAULT_TABLE_MODES.get(channel) ?? "code" : "code";
	if (!channel || !params.cfg) return defaultMode;
	const resolved = resolveMarkdownModeFromSection(params.cfg.channels?.[channel] ?? params.cfg?.[channel], params.accountId) ?? defaultMode;
	return resolved === "block" ? "code" : resolved;
}
//#endregion
export { resolveMarkdownTableMode as t };
