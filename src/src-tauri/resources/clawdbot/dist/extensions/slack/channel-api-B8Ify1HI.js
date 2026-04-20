import "./target-parsing-CQmv-iSm.js";
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID$1 } from "openclaw/plugin-sdk/account-id";
import { PAIRING_APPROVED_MESSAGE, projectCredentialSnapshotFields, resolveConfiguredFromRequiredCredentialStatuses } from "openclaw/plugin-sdk/channel-status";
//#region extensions/slack/src/channel-api.ts
const SLACK_CHANNEL_META = {
	id: "slack",
	label: "Slack",
	selectionLabel: "Slack",
	docsPath: "/channels/slack",
	docsLabel: "slack",
	blurb: "supports bot + app tokens, channels, threads, and interactive replies.",
	systemImage: "number.square",
	markdownCapable: true
};
function getChatChannelMeta(id) {
	if (id !== SLACK_CHANNEL_META.id) throw new Error(`Unsupported Slack channel meta lookup: ${id}`);
	return SLACK_CHANNEL_META;
}
//#endregion
export { resolveConfiguredFromRequiredCredentialStatuses as a, projectCredentialSnapshotFields as i, PAIRING_APPROVED_MESSAGE as n, getChatChannelMeta as r, DEFAULT_ACCOUNT_ID$1 as t };
