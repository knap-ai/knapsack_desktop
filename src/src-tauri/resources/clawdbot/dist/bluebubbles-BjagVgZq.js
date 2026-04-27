import "./zod-schema.core-BR1v7ukx.js";
import "./config-schema-BEuj464I.js";
import "./zod-schema.agent-runtime-C-c82OTL.js";
import "./identity-lSr9N8UI.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-2P4UQTnv.js";
import "./common-B4WrK_Ib.js";
import "./text-runtime-B1c54bxG.js";
import "./setup-helpers-CErkrrS9.js";
import "./dm-policy-shared-CF1kNTSS.js";
import "./history-yaBRQgK8.js";
import "./bluebubbles-policy-OHURr1wz.js";
import "./setup-wizard-helpers-B8Qrpsoj.js";
import "./channel-reply-pipeline-zp0MNhbR.js";
import "./channel-targets-Cnyzt4b1.js";
import "./channel-pairing-DF6gWII4.js";
import "./status-helpers-Jbf-oZqp.js";
import "./webhook-ingress-S9T0oiq6.js";
//#region src/channels/plugins/bluebubbles-actions.ts
const BLUEBUBBLES_ACTIONS = {
	react: { gate: "reactions" },
	edit: {
		gate: "edit",
		unsupportedOnMacOS26: true
	},
	unsend: { gate: "unsend" },
	reply: { gate: "reply" },
	sendWithEffect: { gate: "sendWithEffect" },
	renameGroup: {
		gate: "renameGroup",
		groupOnly: true
	},
	setGroupIcon: {
		gate: "setGroupIcon",
		groupOnly: true
	},
	addParticipant: {
		gate: "addParticipant",
		groupOnly: true
	},
	removeParticipant: {
		gate: "removeParticipant",
		groupOnly: true
	},
	leaveGroup: {
		gate: "leaveGroup",
		groupOnly: true
	},
	sendAttachment: { gate: "sendAttachment" }
};
const BLUEBUBBLES_ACTION_SPECS = BLUEBUBBLES_ACTIONS;
const BLUEBUBBLES_ACTION_NAMES = Object.keys(BLUEBUBBLES_ACTIONS);
new Set(BLUEBUBBLES_ACTION_NAMES.filter((action) => BLUEBUBBLES_ACTION_SPECS[action]?.groupOnly));
//#endregion
//#region src/plugin-sdk/bluebubbles.ts
function loadBlueBubblesFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "bluebubbles",
		artifactBasename: "api.js"
	});
}
function createBlueBubblesConversationBindingManager(params) {
	return loadBlueBubblesFacadeModule().createBlueBubblesConversationBindingManager(params);
}
function normalizeBlueBubblesAcpConversationId(conversationId) {
	return loadBlueBubblesFacadeModule().normalizeBlueBubblesAcpConversationId(conversationId);
}
function matchBlueBubblesAcpConversation(params) {
	return loadBlueBubblesFacadeModule().matchBlueBubblesAcpConversation(params);
}
function resolveBlueBubblesConversationIdFromTarget(target) {
	return loadBlueBubblesFacadeModule().resolveBlueBubblesConversationIdFromTarget(target);
}
function collectBlueBubblesStatusIssues(accounts) {
	return loadBlueBubblesFacadeModule().collectBlueBubblesStatusIssues(accounts);
}
//#endregion
export { resolveBlueBubblesConversationIdFromTarget as a, normalizeBlueBubblesAcpConversationId as i, createBlueBubblesConversationBindingManager as n, BLUEBUBBLES_ACTIONS as o, matchBlueBubblesAcpConversation as r, BLUEBUBBLES_ACTION_NAMES as s, collectBlueBubblesStatusIssues as t };
