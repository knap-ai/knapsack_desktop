import { n as resolveAgentIdentity } from "./identity-BVAU5Jb3.js";
import { t as resolveAgentAvatar } from "./identity-avatar-DeLX78Th.js";
//#region src/infra/outbound/identity.ts
function normalizeOutboundIdentity(identity) {
	if (!identity) return;
	const name = identity.name?.trim() || void 0;
	const avatarUrl = identity.avatarUrl?.trim() || void 0;
	const emoji = identity.emoji?.trim() || void 0;
	const theme = identity.theme?.trim() || void 0;
	if (!name && !avatarUrl && !emoji && !theme) return;
	return {
		name,
		avatarUrl,
		emoji,
		theme
	};
}
function resolveAgentOutboundIdentity(cfg, agentId) {
	const agentIdentity = resolveAgentIdentity(cfg, agentId);
	const avatar = resolveAgentAvatar(cfg, agentId);
	return normalizeOutboundIdentity({
		name: agentIdentity?.name,
		emoji: agentIdentity?.emoji,
		avatarUrl: avatar.kind === "remote" ? avatar.url : void 0,
		theme: agentIdentity?.theme
	});
}
//#endregion
export { resolveAgentOutboundIdentity as n, normalizeOutboundIdentity as t };
