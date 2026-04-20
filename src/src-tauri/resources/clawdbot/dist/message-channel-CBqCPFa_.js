import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeChatChannelId, t as CHANNEL_IDS } from "./ids-CYPyP4SY.js";
import { i as listRegisteredChannelPluginIds, r as getRegisteredChannelPluginMeta, s as getChatChannelMeta } from "./registry-CENZffQG.js";
import { n as normalizeMessageChannel$1, r as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-core-BIZsQ6dr.js";
//#region src/gateway/protocol/client-info.ts
const GATEWAY_CLIENT_IDS = {
	WEBCHAT_UI: "webchat-ui",
	CONTROL_UI: "openclaw-control-ui",
	TUI: "openclaw-tui",
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
	const normalized = normalizeOptionalLowercaseString(raw);
	if (!normalized) return;
	return GATEWAY_CLIENT_ID_SET.has(normalized) ? normalized : void 0;
}
function normalizeGatewayClientName(raw) {
	return normalizeGatewayClientId(raw);
}
function normalizeGatewayClientMode(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (!normalized) return;
	return GATEWAY_CLIENT_MODE_SET.has(normalized) ? normalized : void 0;
}
function hasGatewayClientCap(caps, cap) {
	if (!Array.isArray(caps)) return false;
	return caps.includes(cap);
}
//#endregion
//#region src/utils/message-channel-normalize.ts
function normalizeMessageChannel(raw) {
	return normalizeMessageChannel$1(raw);
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
//#endregion
//#region src/utils/message-channel.ts
function isGatewayCliClient(client) {
	return normalizeGatewayClientMode(client?.mode) === GATEWAY_CLIENT_MODES.CLI;
}
function isOperatorUiClient(client) {
	const clientId = normalizeGatewayClientName(client?.id);
	return clientId === GATEWAY_CLIENT_NAMES.CONTROL_UI || clientId === GATEWAY_CLIENT_NAMES.TUI;
}
function isBrowserOperatorUiClient(client) {
	return normalizeGatewayClientName(client?.id) === GATEWAY_CLIENT_NAMES.CONTROL_UI;
}
function isInternalMessageChannel(raw) {
	return normalizeMessageChannel(raw) === INTERNAL_MESSAGE_CHANNEL;
}
function isWebchatClient(client) {
	if (normalizeGatewayClientMode(client?.mode) === GATEWAY_CLIENT_MODES.WEBCHAT) return true;
	return normalizeGatewayClientName(client?.id) === GATEWAY_CLIENT_NAMES.WEBCHAT_UI;
}
function isMarkdownCapableMessageChannel(raw) {
	const channel = normalizeMessageChannel(raw);
	if (!channel) return false;
	if (channel === "webchat" || channel === "tui") return true;
	const builtInChannel = normalizeChatChannelId(channel);
	if (builtInChannel) return getChatChannelMeta(builtInChannel).markdownCapable === true;
	return getRegisteredChannelPluginMeta(channel)?.markdownCapable === true;
}
//#endregion
export { hasGatewayClientCap as _, isOperatorUiClient as a, isGatewayMessageChannel as c, resolveGatewayMessageChannel as d, resolveMessageChannel as f, GATEWAY_CLIENT_NAMES as g, GATEWAY_CLIENT_MODES as h, isMarkdownCapableMessageChannel as i, listDeliverableMessageChannels as l, GATEWAY_CLIENT_IDS as m, isGatewayCliClient as n, isWebchatClient as o, GATEWAY_CLIENT_CAPS as p, isInternalMessageChannel as r, isDeliverableMessageChannel as s, isBrowserOperatorUiClient as t, normalizeMessageChannel as u };
