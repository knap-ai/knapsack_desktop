import "./zod-schema.core-Dkd4NgDa.js";
import "./config-schema-Di5PBhdS.js";
import "./zod-schema.agent-runtime-CcRKs3kU.js";
import "./identity-CviweAtG.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-BAtcmKGO.js";
import "./common-C4RGIxnG.js";
import "./text-runtime-DfALcXL5.js";
import "./setup-helpers-CWjxgWew.js";
import "./dm-policy-shared-DzT5EPsb.js";
import "./history-D7zjWV0P.js";
import "./bluebubbles-policy-DMePNH1E.js";
import "./setup-wizard-helpers-CCAvauB7.js";
import "./channel-reply-pipeline-BYR66qkC.js";
import "./channel-targets-D_s7_z06.js";
import "./channel-pairing-DFE8Potd.js";
import "./status-helpers-C00ai5Oy.js";
import "./webhook-ingress-CAGeq6oN.js";
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
