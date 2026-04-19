import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { a as normalizeAnyChannelId } from "./registry-CENZffQG.js";
import { t as getLoadedChannelPluginById } from "./registry-loaded-C109837J.js";
//#region src/auto-reply/reply/group-id-simple.ts
function extractSimpleExplicitGroupId(raw) {
	const trimmed = normalizeOptionalString(raw) ?? "";
	if (!trimmed) return;
	const parts = trimmed.split(":").filter(Boolean);
	if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) return parts.slice(2).join(":").replace(/:topic:.*$/, "") || void 0;
	if (parts.length >= 2 && (parts[0] === "group" || parts[0] === "channel")) return parts.slice(1).join(":").replace(/:topic:.*$/, "") || void 0;
	if (parts.length >= 2 && parts[0] === "whatsapp") {
		const joined = parts.slice(1).join(":").replace(/:topic:.*$/, "");
		if (/@g\.us$/i.test(joined)) return joined || void 0;
	}
}
//#endregion
//#region src/auto-reply/reply/group-id.ts
function extractExplicitGroupId(raw) {
	const trimmed = normalizeOptionalString(raw) ?? "";
	if (!trimmed) return;
	const simple = extractSimpleExplicitGroupId(trimmed);
	if (simple) return simple;
	const firstPart = trimmed.split(":").find(Boolean);
	const channelId = normalizeAnyChannelId(firstPart ?? "") ?? normalizeOptionalLowercaseString(firstPart);
	const parsed = (channelId ? getLoadedChannelPluginById(channelId)?.messaging : void 0)?.parseExplicitTarget?.({ raw: trimmed }) ?? null;
	if (parsed && parsed.chatType && parsed.chatType !== "direct") return parsed.to.replace(/:topic:.*$/, "") || void 0;
}
//#endregion
//#region src/auto-reply/reply/elevated-unavailable.ts
function formatElevatedUnavailableMessage(params) {
	const lines = [];
	lines.push(`elevated is not available right now (runtime=${params.runtimeSandboxed ? "sandboxed" : "direct"}).`);
	if (params.failures.length > 0) lines.push(`Failing gates: ${params.failures.map((f) => `${f.gate} (${f.key})`).join(", ")}`);
	else lines.push("Failing gates: enabled (tools.elevated.enabled / agents.list[].tools.elevated.enabled), allowFrom (tools.elevated.allowFrom.<provider>).");
	lines.push("Fix-it keys:");
	lines.push("- tools.elevated.enabled");
	lines.push("- tools.elevated.allowFrom.<provider>");
	lines.push("- agents.list[].tools.elevated.enabled");
	lines.push("- agents.list[].tools.elevated.allowFrom.<provider>");
	if (params.sessionKey) lines.push(`See: ${formatCliCommand(`openclaw sandbox explain --session ${params.sessionKey}`)}`);
	return lines.join("\n");
}
//#endregion
export { extractExplicitGroupId as n, formatElevatedUnavailableMessage as t };
