import { u as createSlackMonitorContext } from "./room-context-B0-np1vF.js";
import "openclaw/plugin-sdk/temp-path";
//#region extensions/slack/src/monitor/message-handler/prepare.test-helpers.ts
function createInboundSlackTestContext(params) {
	return createSlackMonitorContext({
		cfg: params.cfg,
		accountId: "default",
		botToken: "token",
		app: { client: params.appClient ?? {} },
		runtime: {},
		botUserId: "B1",
		botId: "B1",
		teamId: "T1",
		apiAppId: "A1",
		historyLimit: 0,
		sessionScope: "per-sender",
		mainKey: "main",
		dmEnabled: true,
		dmPolicy: "open",
		allowFrom: [],
		allowNameMatching: false,
		groupDmEnabled: true,
		groupDmChannels: [],
		defaultRequireMention: params.defaultRequireMention ?? true,
		channelsConfig: params.channelsConfig,
		groupPolicy: "open",
		useAccessGroups: false,
		reactionMode: "off",
		reactionAllowlist: [],
		replyToMode: params.replyToMode ?? "off",
		threadHistoryScope: "thread",
		threadInheritParent: false,
		threadRequireExplicitMention: params.threadRequireExplicitMention ?? false,
		slashCommand: {
			enabled: false,
			name: "openclaw",
			sessionPrefix: "slack:slash",
			ephemeral: true
		},
		textLimit: 4e3,
		ackReactionScope: "group-mentions",
		typingReaction: "",
		mediaMaxBytes: 1024,
		removeAckAfterReply: false
	});
}
//#endregion
export { createInboundSlackTestContext as t };
