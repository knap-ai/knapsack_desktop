import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-BNWw3cXT.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import fs from "node:fs";
import path from "node:path";
//#region src/channels/bundled-channel-catalog-read.ts
const OFFICIAL_CHANNEL_CATALOG_RELATIVE_PATH = path.join("dist", "channel-catalog.json");
function listPackageRoots() {
	return [resolveOpenClawPackageRootSync({ cwd: process.cwd() }), resolveOpenClawPackageRootSync({ moduleUrl: import.meta.url })].filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index);
}
function listBundledExtensionPackageJsonPaths(env = process.env) {
	const extensionsRoot = resolveBundledPluginsDir(env);
	if (!extensionsRoot) return [];
	try {
		return fs.readdirSync(extensionsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => path.join(extensionsRoot, entry.name, "package.json")).filter((entry) => fs.existsSync(entry));
	} catch {
		return [];
	}
}
function readBundledExtensionCatalogEntriesSync() {
	const entries = [];
	for (const packageJsonPath of listBundledExtensionPackageJsonPaths()) try {
		const payload = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		entries.push(payload);
	} catch {
		continue;
	}
	return entries;
}
function readOfficialCatalogFileSync() {
	for (const packageRoot of listPackageRoots()) {
		const candidate = path.join(packageRoot, OFFICIAL_CHANNEL_CATALOG_RELATIVE_PATH);
		if (!fs.existsSync(candidate)) continue;
		try {
			const payload = JSON.parse(fs.readFileSync(candidate, "utf8"));
			return Array.isArray(payload.entries) ? payload.entries : [];
		} catch {
			continue;
		}
	}
	return [];
}
function toBundledChannelEntry(entry) {
	const channel = entry.openclaw?.channel;
	const id = normalizeOptionalLowercaseString(channel?.id);
	if (!id || !channel) return null;
	return {
		id,
		channel,
		aliases: Array.isArray(channel.aliases) ? channel.aliases.map((alias) => normalizeOptionalLowercaseString(alias)).filter((alias) => Boolean(alias)) : [],
		order: typeof channel.order === "number" && Number.isFinite(channel.order) ? channel.order : Number.MAX_SAFE_INTEGER
	};
}
function listBundledChannelCatalogEntries() {
	const bundledEntries = readBundledExtensionCatalogEntriesSync().map((entry) => toBundledChannelEntry(entry)).filter((entry) => Boolean(entry));
	if (bundledEntries.length > 0) return bundledEntries;
	return readOfficialCatalogFileSync().map((entry) => toBundledChannelEntry(entry)).filter((entry) => Boolean(entry));
}
//#endregion
//#region src/channels/ids.ts
function listBundledChatChannelEntries() {
	return listBundledChannelCatalogEntries().map((entry) => ({
		id: normalizeOptionalLowercaseString(entry.id) ?? entry.id,
		aliases: entry.aliases,
		order: entry.order
	})).toSorted((left, right) => left.order - right.order || left.id.localeCompare(right.id, "en", { sensitivity: "base" }));
}
const BUNDLED_CHAT_CHANNEL_ENTRIES = Object.freeze(listBundledChatChannelEntries());
const CHAT_CHANNEL_ID_SET = new Set(BUNDLED_CHAT_CHANNEL_ENTRIES.map((entry) => entry.id));
const CHAT_CHANNEL_ORDER = Object.freeze(BUNDLED_CHAT_CHANNEL_ENTRIES.map((entry) => entry.id));
const CHANNEL_IDS = CHAT_CHANNEL_ORDER;
const CHAT_CHANNEL_ALIASES = Object.freeze(Object.fromEntries(BUNDLED_CHAT_CHANNEL_ENTRIES.flatMap((entry) => entry.aliases.map((alias) => [alias, entry.id]))));
function normalizeChatChannelId(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (!normalized) return null;
	const resolved = CHAT_CHANNEL_ALIASES[normalized] ?? normalized;
	return CHAT_CHANNEL_ID_SET.has(resolved) ? resolved : null;
}
//#endregion
export { listBundledChannelCatalogEntries as i, CHAT_CHANNEL_ORDER as n, normalizeChatChannelId as r, CHANNEL_IDS as t };
