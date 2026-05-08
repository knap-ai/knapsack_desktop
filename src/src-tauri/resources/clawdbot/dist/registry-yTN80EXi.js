import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { n as getBundledChannelPlugin } from "./bundled-CAfVQCWF.js";
import { a as normalizeAnyChannelId } from "./registry-GHcDenJ3.js";
import { n as listLoadedChannelPlugins, t as getLoadedChannelPluginById } from "./registry-loaded-7KX8W8My.js";
//#region src/channels/plugins/registry.ts
function listChannelPlugins() {
	return listLoadedChannelPlugins();
}
function getLoadedChannelPlugin(id) {
	const resolvedId = normalizeOptionalString(id) ?? "";
	if (!resolvedId) return;
	return getLoadedChannelPluginById(resolvedId);
}
function getChannelPlugin(id) {
	const resolvedId = normalizeOptionalString(id) ?? "";
	if (!resolvedId) return;
	return getLoadedChannelPlugin(resolvedId) ?? getBundledChannelPlugin(resolvedId);
}
function normalizeChannelId(raw) {
	return normalizeAnyChannelId(raw);
}
//#endregion
export { normalizeChannelId as i, getLoadedChannelPlugin as n, listChannelPlugins as r, getChannelPlugin as t };
