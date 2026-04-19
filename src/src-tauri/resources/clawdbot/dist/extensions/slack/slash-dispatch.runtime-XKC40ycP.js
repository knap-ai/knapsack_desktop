import { r as deliverSlackSlashReplies$1 } from "./replies-B4oveS5b.js";
import { resolveAgentRoute as resolveAgentRoute$1 } from "openclaw/plugin-sdk/routing";
import { recordInboundSessionMetaSafe as recordInboundSessionMetaSafe$1, resolveConversationLabel as resolveConversationLabel$1 } from "openclaw/plugin-sdk/conversation-runtime";
import { resolveMarkdownTableMode as resolveMarkdownTableMode$1 } from "openclaw/plugin-sdk/config-runtime";
import { dispatchReplyWithDispatcher as dispatchReplyWithDispatcher$1, finalizeInboundContext as finalizeInboundContext$1, resolveChunkMode as resolveChunkMode$1 } from "openclaw/plugin-sdk/reply-runtime";
//#region extensions/slack/src/monitor/slash-dispatch.runtime.ts
function resolveChunkMode(...args) {
	return resolveChunkMode$1(...args);
}
function finalizeInboundContext(...args) {
	return finalizeInboundContext$1(...args);
}
function dispatchReplyWithDispatcher(...args) {
	return dispatchReplyWithDispatcher$1(...args);
}
function resolveConversationLabel(...args) {
	return resolveConversationLabel$1(...args);
}
function recordInboundSessionMetaSafe(...args) {
	return recordInboundSessionMetaSafe$1(...args);
}
function resolveMarkdownTableMode(...args) {
	return resolveMarkdownTableMode$1(...args);
}
function resolveAgentRoute(...args) {
	return resolveAgentRoute$1(...args);
}
function deliverSlackSlashReplies(...args) {
	return deliverSlackSlashReplies$1(...args);
}
//#endregion
export { deliverSlackSlashReplies, dispatchReplyWithDispatcher, finalizeInboundContext, recordInboundSessionMetaSafe, resolveAgentRoute, resolveChunkMode, resolveConversationLabel, resolveMarkdownTableMode };
