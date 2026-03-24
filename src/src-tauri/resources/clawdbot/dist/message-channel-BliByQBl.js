import { a as listRegisteredChannelPluginIds, c as normalizeChatChannelId, l as CHANNEL_IDS, o as normalizeAnyChannelId } from "./registry-C5UkPpaO.js";
//#region src/gateway/protocol/client-info.ts
const GATEWAY_CLIENT_IDS = {
	WEBCHAT_UI: "webchat-ui",
	CONTROL_UI: "openclaw-control-ui",
	WEBCHAT: "webchat",
	CLI: "cli",
	GATEWAY_CLIENT: "gateway-client",
	MACOS_APP: "openclaw-macos",
	IOS_APP: "openclaw-ios",
	ANDROID_APP: "openclaw-android",
	NODE_HOST: "node-host",
	TEST: "test",
	FINGERPRINT: "fingerprint",
	PROBE: "openclaw-probe"
};
const GATEWAY_CLIENT_NAMES = GATEWAY_CLIENT_IDS;
const GATEWAY_CLIENT_MODES = {
	WEBCHAT: "webchat",
	CLI: "cli",
	UI: "ui",
	BACKEND: "backend",
	NODE: "node",
	PROBE: "probe",
	TEST: "test"
};
const GATEWAY_CLIENT_CAPS = { TOOL_EVENTS: "tool-events" };
const GATEWAY_CLIENT_ID_SET = new Set(Object.values(GATEWAY_CLIENT_IDS));
const GATEWAY_CLIENT_MODE_SET = new Set(Object.values(GATEWAY_CLIENT_MODES));
function normalizeGatewayClientId(raw) {
	const normalized = raw?.trim().toLowerCase();
	if (!normalized) return;
	return GATEWAY_CLIENT_ID_SET.has(normalized) ? normalized : void 0;
}
function normalizeGatewayClientName(raw) {
	return normalizeGatewayClientId(raw);
}
function normalizeGatewayClientMode(raw) {
	const normalized = raw?.trim().toLowerCase();
	if (!normalized) return;
	return GATEWAY_CLIENT_MODE_SET.has(normalized) ? normalized : void 0;
}
function hasGatewayClientCap(caps, cap) {
	if (!Array.isArray(caps)) return false;
	return caps.includes(cap);
}
//#endregion
//#region src/utils/message-channel.ts
const INTERNAL_MESSAGE_CHANNEL = "webchat";
const MARKDOWN_CAPABLE_CHANNELS = new Set([
	"slack",
	"telegram",
	"signal",
	"discord",
	"googlechat",
	"tui",
	INTERNAL_MESSAGE_CHANNEL
]);
function isGatewayCliClient(client) {
	return normalizeGatewayClientMode(client?.mode) === GATEWAY_CLIENT_MODES.CLI;
}
function isInternalMessageChannel(raw) {
	return normalizeMessageChannel(raw) === INTERNAL_MESSAGE_CHANNEL;
}
function isWebchatClient(client) {
	if (normalizeGatewayClientMode(client?.mode) === GATEWAY_CLIENT_MODES.WEBCHAT) return true;
	return normalizeGatewayClientName(client?.id) === GATEWAY_CLIENT_NAMES.WEBCHAT_UI;
}
function normalizeMessageChannel(raw) {
	const normalized = raw?.trim().toLowerCase();
	if (!normalized) return;
	if (normalized === "webchat") return INTERNAL_MESSAGE_CHANNEL;
	const builtIn = normalizeChatChannelId(normalized);
	if (builtIn) return builtIn;
	return normalizeAnyChannelId(normalized) ?? normalized;
}
const listPluginChannelIds = () => {
	return listRegisteredChannelPluginIds();
};
const listDeliverableMessageChannels = () => Array.from(new Set([...CHANNEL_IDS, ...listPluginChannelIds()]));
const listGatewayMessageChannels = () => [...listDeliverableMessageChannels(), INTERNAL_MESSAGE_CHANNEL];
function isGatewayMessageChannel(value) {
	return listGatewayMessageChannels().includes(value);
}
function isDeliverableMessageChannel(value) {
	return listDeliverableMessageChannels().includes(value);
}
function resolveGatewayMessageChannel(raw) {
	const normalized = normalizeMessageChannel(raw);
	if (!normalized) return;
	return isGatewayMessageChannel(normalized) ? normalized : void 0;
}
function resolveMessageChannel(primary, fallback) {
	return normalizeMessageChannel(primary) ?? normalizeMessageChannel(fallback);
}
function isMarkdownCapableMessageChannel(raw) {
	const channel = normalizeMessageChannel(raw);
	if (!channel) return false;
	return MARKDOWN_CAPABLE_CHANNELS.has(channel);
}
//#endregion
export { normalizeGatewayClientMode as _, isInternalMessageChannel as a, listDeliverableMessageChannels as c, resolveMessageChannel as d, GATEWAY_CLIENT_CAPS as f, hasGatewayClientCap as g, GATEWAY_CLIENT_NAMES as h, isGatewayMessageChannel as i, normalizeMessageChannel as l, GATEWAY_CLIENT_MODES as m, isDeliverableMessageChannel as n, isMarkdownCapableMessageChannel as o, GATEWAY_CLIENT_IDS as p, isGatewayCliClient as r, isWebchatClient as s, INTERNAL_MESSAGE_CHANNEL as t, resolveGatewayMessageChannel as u };
