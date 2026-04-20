import { a as resolveSlackAccount, c as resolveSlackBotToken, i as resolveDefaultSlackAccountId, n as listSlackAccountIds, r as mergeSlackAccountConfig, s as resolveSlackAppToken, t as listEnabledSlackAccounts } from "./accounts-DJiceqJx.js";
import { a as resolveSlackGroupToolPolicy, i as resolveSlackGroupRequireMention, r as setSlackRuntime } from "./runtime-BPNbrviE.js";
import { t as resolveSlackChannelAllowlist } from "./resolve-channels-DpRJc8-4.js";
import { t as resolveSlackUserAllowlist } from "./resolve-users-CEjXgbpN.js";
import { t as sendMessageSlack } from "./send-a7txocw9.js";
import { a as listSlackEmojis, c as pinSlackMessage, d as removeOwnSlackReactions, f as removeSlackReaction, i as getSlackMemberInfo, l as reactSlackMessage, m as unpinSlackMessage, o as listSlackPins, p as sendSlackMessage, r as editSlackMessage, s as listSlackReactions, t as deleteSlackMessage, u as readSlackMessages } from "./actions-uj3tq0FI.js";
import { r as normalizeSlackWebhookPath } from "./registry-yFrXekPx.js";
import { t as probeSlack } from "./probe-DdF772dk.js";
import { t as monitorSlackProvider } from "./provider-BOXM2C31.js";
import { n as slackActionRuntime, t as handleSlackAction } from "./action-runtime-D9OUVlrr.js";
import { n as listSlackDirectoryGroupsLive, r as listSlackDirectoryPeersLive } from "./directory-live-CMdBVle-.js";
import "./monitor-B4VlkcS8.js";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-id";
//#region extensions/slack/src/http/plugin-routes.ts
let slackHttpHandlerRuntimePromise = null;
async function loadSlackHttpHandlerRuntime() {
	slackHttpHandlerRuntimePromise ??= import("./handler.runtime-oVp4Q6jc.js");
	return await slackHttpHandlerRuntimePromise;
}
function registerSlackPluginHttpRoutes(api) {
	const accountIds = new Set([DEFAULT_ACCOUNT_ID, ...listSlackAccountIds(api.config)]);
	const registeredPaths = /* @__PURE__ */ new Set();
	for (const accountId of accountIds) {
		const accountConfig = mergeSlackAccountConfig(api.config, accountId);
		registeredPaths.add(normalizeSlackWebhookPath(accountConfig.webhookPath));
	}
	if (registeredPaths.size === 0) registeredPaths.add(normalizeSlackWebhookPath());
	for (const path of registeredPaths) api.registerHttpRoute({
		path,
		auth: "plugin",
		handler: async (req, res) => await (await loadSlackHttpHandlerRuntime()).handleSlackHttpRequest(req, res)
	});
}
//#endregion
export { deleteSlackMessage, editSlackMessage, getSlackMemberInfo, handleSlackAction, listEnabledSlackAccounts, listSlackAccountIds, listSlackDirectoryGroupsLive, listSlackDirectoryPeersLive, listSlackEmojis, listSlackPins, listSlackReactions, monitorSlackProvider, pinSlackMessage, probeSlack, reactSlackMessage, readSlackMessages, registerSlackPluginHttpRoutes, removeOwnSlackReactions, removeSlackReaction, resolveDefaultSlackAccountId, resolveSlackAccount, resolveSlackAppToken, resolveSlackBotToken, resolveSlackChannelAllowlist, resolveSlackGroupRequireMention, resolveSlackGroupToolPolicy, resolveSlackUserAllowlist, sendMessageSlack, sendSlackMessage, setSlackRuntime, slackActionRuntime, unpinSlackMessage };
