import { t as isCommandEnabled } from "./commands-registry-list-BcqSFuWe.js";
import { n as maybeResolveTextAlias } from "./commands-registry-normalize-RdSq7yWA.js";
import { f as shouldHandleTextCommands } from "./commands-registry-D1HuZY_U.js";
//#region src/auto-reply/reply/dispatch-acp-command-bypass.ts
function resolveFirstContextText(ctx, keys) {
	for (const key of keys) {
		const value = ctx[key];
		if (typeof value === "string") return value;
	}
	return "";
}
function resolveCommandCandidateText(ctx) {
	return resolveFirstContextText(ctx, [
		"CommandBody",
		"BodyForCommands",
		"RawBody",
		"Body"
	]).trim();
}
function isResetCommandCandidate(text) {
	return /^\/(?:new|reset)(?:\s|$)/i.test(text);
}
function shouldBypassAcpDispatchForCommand(ctx, cfg) {
	const candidate = resolveCommandCandidateText(ctx);
	if (!candidate) return false;
	const normalized = candidate.trim();
	const allowTextCommands = shouldHandleTextCommands({
		cfg,
		surface: ctx.Surface ?? ctx.Provider ?? "",
		commandSource: ctx.CommandSource
	});
	if (!normalized.startsWith("/") && maybeResolveTextAlias(candidate, cfg) != null) return allowTextCommands;
	if (isResetCommandCandidate(normalized)) return true;
	if (!normalized.startsWith("!")) return false;
	if (!ctx.CommandAuthorized) return false;
	if (!isCommandEnabled(cfg, "bash")) return false;
	return allowTextCommands;
}
//#endregion
export { shouldBypassAcpDispatchForCommand };
