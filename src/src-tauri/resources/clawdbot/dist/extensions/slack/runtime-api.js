import { a as resolveSlackAccount, c as resolveSlackBotToken, i as resolveDefaultSlackAccountId, n as listSlackAccountIds, s as resolveSlackAppToken, t as listEnabledSlackAccounts } from "../../accounts-DHZuUL28.js";
import { r as createSlackWebClient } from "../../client-Cm0jR4_W.js";
import { n as resolveSlackGroupRequireMention, r as resolveSlackGroupToolPolicy, t as probeSlack } from "../../probe-B3VY9yHG.js";
import { t as sendMessageSlack } from "../../send-oLUIhqiG.js";
import { n as slackActionRuntime, t as handleSlackAction } from "../../action-runtime-DVOajs79.js";
import { n as resolveSlackUserAllowlist, t as resolveSlackChannelAllowlist } from "../../resolve-channels-C2Alnm2a.js";
import { a as listSlackEmojis, c as pinSlackMessage, d as removeOwnSlackReactions, f as removeSlackReaction, i as getSlackMemberInfo, l as reactSlackMessage, m as unpinSlackMessage, o as listSlackPins, p as sendSlackMessage, r as editSlackMessage, s as listSlackReactions, t as deleteSlackMessage, u as readSlackMessages } from "../../actions-D4m3sief.js";
import { t as monitorSlackProvider } from "../../provider-BFpCUlM7.js";
import "../../replies-D5StP5jn.js";
//#region extensions/slack/src/directory-live.ts
function resolveReadToken(params) {
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	return account.userToken ?? account.botToken?.trim();
}
function normalizeQuery(value) {
	return value?.trim().toLowerCase() ?? "";
}
function buildUserRank(user) {
	let rank = 0;
	if (!user.deleted) rank += 2;
	if (!user.is_bot && !user.is_app_user) rank += 1;
	return rank;
}
function buildChannelRank(channel) {
	return channel.is_archived ? 0 : 1;
}
async function listSlackDirectoryPeersLive(params) {
	const token = resolveReadToken(params);
	if (!token) return [];
	const client = createSlackWebClient(token);
	const query = normalizeQuery(params.query);
	const members = [];
	let cursor;
	do {
		const res = await client.users.list({
			limit: 200,
			cursor
		});
		if (Array.isArray(res.members)) members.push(...res.members);
		const next = res.response_metadata?.next_cursor?.trim();
		cursor = next ? next : void 0;
	} while (cursor);
	const rows = members.filter((member) => {
		const candidates = [
			member.profile?.display_name || member.profile?.real_name || member.real_name,
			member.name,
			member.profile?.email
		].map((item) => item?.trim().toLowerCase()).filter(Boolean);
		if (!query) return true;
		return candidates.some((candidate) => candidate?.includes(query));
	}).map((member) => {
		const id = member.id?.trim();
		if (!id) return null;
		const handle = member.name?.trim();
		const display = member.profile?.display_name?.trim() || member.profile?.real_name?.trim() || member.real_name?.trim() || handle;
		return {
			kind: "user",
			id: `user:${id}`,
			name: display || void 0,
			handle: handle ? `@${handle}` : void 0,
			rank: buildUserRank(member),
			raw: member
		};
	}).filter(Boolean);
	if (typeof params.limit === "number" && params.limit > 0) return rows.slice(0, params.limit);
	return rows;
}
async function listSlackDirectoryGroupsLive(params) {
	const token = resolveReadToken(params);
	if (!token) return [];
	const client = createSlackWebClient(token);
	const query = normalizeQuery(params.query);
	const channels = [];
	let cursor;
	do {
		const res = await client.conversations.list({
			types: "public_channel,private_channel",
			exclude_archived: false,
			limit: 1e3,
			cursor
		});
		if (Array.isArray(res.channels)) channels.push(...res.channels);
		const next = res.response_metadata?.next_cursor?.trim();
		cursor = next ? next : void 0;
	} while (cursor);
	const rows = channels.filter((channel) => {
		const name = channel.name?.trim().toLowerCase();
		if (!query) return true;
		return Boolean(name && name.includes(query));
	}).map((channel) => {
		const id = channel.id?.trim();
		const name = channel.name?.trim();
		if (!id || !name) return null;
		return {
			kind: "group",
			id: `channel:${id}`,
			name,
			handle: `#${name}`,
			rank: buildChannelRank(channel),
			raw: channel
		};
	}).filter(Boolean);
	if (typeof params.limit === "number" && params.limit > 0) return rows.slice(0, params.limit);
	return rows;
}
//#endregion
export { deleteSlackMessage, editSlackMessage, getSlackMemberInfo, handleSlackAction, listEnabledSlackAccounts, listSlackAccountIds, listSlackDirectoryGroupsLive, listSlackDirectoryPeersLive, listSlackEmojis, listSlackPins, listSlackReactions, monitorSlackProvider, pinSlackMessage, probeSlack, reactSlackMessage, readSlackMessages, removeOwnSlackReactions, removeSlackReaction, resolveDefaultSlackAccountId, resolveSlackAccount, resolveSlackAppToken, resolveSlackBotToken, resolveSlackChannelAllowlist, resolveSlackGroupRequireMention, resolveSlackGroupToolPolicy, resolveSlackUserAllowlist, sendMessageSlack, sendSlackMessage, slackActionRuntime, unpinSlackMessage };
