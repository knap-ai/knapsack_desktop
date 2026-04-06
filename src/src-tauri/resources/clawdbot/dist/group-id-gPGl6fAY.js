//#region src/auto-reply/reply/group-id.ts
function extractExplicitGroupId(raw) {
	const trimmed = (raw ?? "").trim();
	if (!trimmed) return;
	const parts = trimmed.split(":").filter(Boolean);
	if (parts.length >= 3 && (parts[1] === "group" || parts[1] === "channel")) return parts.slice(2).join(":").replace(/:topic:.*$/, "") || void 0;
	if (parts.length >= 2 && parts[0]?.toLowerCase() === "whatsapp" && trimmed.toLowerCase().includes("@g.us")) return parts.slice(1).join(":") || void 0;
	if (parts.length >= 2 && (parts[0] === "group" || parts[0] === "channel")) return parts.slice(1).join(":").replace(/:topic:.*$/, "") || void 0;
}
//#endregion
export { extractExplicitGroupId as t };
