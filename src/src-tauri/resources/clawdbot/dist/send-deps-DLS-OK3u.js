//#region src/infra/outbound/send-deps.ts
const LEGACY_SEND_DEP_KEYS = {
	whatsapp: "sendWhatsApp",
	telegram: "sendTelegram",
	discord: "sendDiscord",
	slack: "sendSlack",
	signal: "sendSignal",
	imessage: "sendIMessage",
	matrix: "sendMatrix",
	msteams: "sendMSTeams"
};
function resolveOutboundSendDep(deps, channelId) {
	const dynamic = deps?.[channelId];
	if (dynamic !== void 0) return dynamic;
	const legacyKey = LEGACY_SEND_DEP_KEYS[channelId];
	return deps?.[legacyKey];
}
//#endregion
export { resolveOutboundSendDep as t };
