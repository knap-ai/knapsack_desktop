import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-C1IzJjqi.js";
import { r as isInternalMessageChannel } from "./message-channel-C2Lnao8s.js";
import { t as resolveCommandAuthorization } from "./command-auth-C20WL0YR.js";
//#region src/auto-reply/reply/commands-reset-mode.ts
function parseSoftResetCommand(commandBodyNormalized) {
	const resetMatch = normalizeLowercaseStringOrEmpty(commandBodyNormalized).match(/^\/reset(?:\s|$)/);
	if (!resetMatch) return { matched: false };
	const rest = commandBodyNormalized.slice(resetMatch[0].length).trimStart();
	if (!rest) return { matched: false };
	const restLower = normalizeLowercaseStringOrEmpty(rest);
	const softMatch = restLower.match(/^soft(?:\s|$)/);
	if (!softMatch) return { matched: false };
	if (restLower === "soft") return {
		matched: true,
		tail: ""
	};
	return {
		matched: true,
		tail: rest.slice(softMatch[0].length).trimStart()
	};
}
//#endregion
//#region src/auto-reply/reply/reset-authorization.ts
function isResetAuthorizedForContext(params) {
	const auth = resolveCommandAuthorization(params);
	if (!params.commandAuthorized && !auth.isAuthorizedSender) return false;
	const provider = params.ctx.Provider;
	if (!(provider ? isInternalMessageChannel(provider) : isInternalMessageChannel(params.ctx.Surface))) return true;
	const scopes = params.ctx.GatewayClientScopes;
	if (!Array.isArray(scopes) || scopes.length === 0) return true;
	return scopes.includes("operator.admin");
}
//#endregion
export { parseSoftResetCommand as n, isResetAuthorizedForContext as t };
