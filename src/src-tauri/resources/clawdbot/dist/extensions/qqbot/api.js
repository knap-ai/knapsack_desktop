import { A as getAccessToken, F as sendC2CImageMessage, J as sendProactiveGroupMessage, U as sendGroupImageMessage, a as sendCronMessage, c as sendPhoto, d as sendVideoMsg, f as sendVoice, i as recordMessageReply, l as sendProactiveMessage, n as getMessageReplyConfig, o as sendDocument, ot as debugError, q as sendProactiveC2CMessage, r as getMessageReplyStats, s as sendMedia, st as debugLog, t as checkMessageReplyLimit, u as sendText } from "../../outbound-DE5EbLPn.js";
import { a as resolveQQBotAccount, i as resolveDefaultQQBotAccountId, n as applyQQBotAccountConfig, r as listQQBotAccountIds, t as DEFAULT_ACCOUNT_ID } from "../../config-DODp7r-t.js";
import { a as recordKnownUser, i as listKnownUsers$1, n as flushKnownUsers, o as removeKnownUser$1, r as getKnownUser$1, t as clearKnownUsers$1 } from "../../known-users-t_aADrCa.js";
//#region extensions/qqbot/src/proactive.ts
/** Look up a known user entry (adapter for the old proactive API shape). */
function getKnownUser(type, openid, accountId) {
	return getKnownUser$1(accountId, openid, type);
}
/** List known users with optional filtering and sorting (adapter). */
function listKnownUsers(options) {
	const type = options?.type;
	return listKnownUsers$1({
		type: type === "channel" ? void 0 : type,
		accountId: options?.accountId,
		limit: options?.limit,
		sortBy: options?.sortByLastInteraction !== false ? "lastSeenAt" : void 0,
		sortOrder: "desc"
	});
}
/** Remove one known user entry (adapter). */
function removeKnownUser(type, openid, accountId) {
	return removeKnownUser$1(accountId, openid, type);
}
/** Clear all known users, optionally scoped to a single account (adapter). */
function clearKnownUsers(accountId) {
	return clearKnownUsers$1(accountId);
}
/** Resolve account config and send a proactive message. */
async function sendProactive(options, cfg) {
	const { to, text, type = "c2c", imageUrl, accountId = "default" } = options;
	const account = resolveQQBotAccount(cfg, accountId);
	if (!account.appId || !account.clientSecret) return {
		success: false,
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	try {
		const accessToken = await getAccessToken(account.appId, account.clientSecret);
		if (imageUrl) try {
			if (type === "c2c") await sendC2CImageMessage(account.appId, accessToken, to, imageUrl, void 0, void 0);
			else if (type === "group") await sendGroupImageMessage(account.appId, accessToken, to, imageUrl, void 0, void 0);
			debugLog(`[qqbot:proactive] Sent image to ${type}:${to}`);
		} catch (err) {
			debugError(`[qqbot:proactive] Failed to send image: ${err}`);
		}
		let result;
		if (type === "c2c") result = await sendProactiveC2CMessage(account.appId, accessToken, to, text);
		else if (type === "group") result = await sendProactiveGroupMessage(account.appId, accessToken, to, text);
		else if (type === "channel") return {
			success: false,
			error: "Channel proactive messages are not supported. Please use group or c2c."
		};
		else return {
			success: false,
			error: `Unknown message type: ${type}`
		};
		debugLog(`[qqbot:proactive] Sent message to ${type}:${to}, id: ${result.id}`);
		return {
			success: true,
			messageId: result.id,
			timestamp: result.timestamp
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		debugError(`[qqbot:proactive] Failed to send message: ${message}`);
		return {
			success: false,
			error: message
		};
	}
}
/** Send one proactive message to each recipient. */
async function sendBulkProactiveMessage(recipients, text, type, cfg, accountId = "default") {
	const results = [];
	for (const to of recipients) {
		const result = await sendProactive({
			to,
			text,
			type,
			accountId
		}, cfg);
		results.push({
			to,
			result
		});
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return results;
}
/**
* Send a message to all known users.
*
* @param text Message content.
* @param cfg OpenClaw config.
* @param options Optional filters.
* @returns Aggregate send statistics.
*/
async function broadcastMessage(text, cfg, options) {
	const validUsers = listKnownUsers({
		type: options?.type,
		accountId: options?.accountId,
		limit: options?.limit,
		sortByLastInteraction: true
	}).filter((u) => u.type === "c2c" || u.type === "group");
	const results = [];
	let success = 0;
	let failed = 0;
	for (const user of validUsers) {
		const targetId = user.type === "group" ? user.groupOpenid ?? user.openid : user.openid;
		const result = await sendProactive({
			to: targetId,
			text,
			type: user.type,
			accountId: user.accountId
		}, cfg);
		results.push({
			to: targetId,
			result
		});
		if (result.success) success++;
		else failed++;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return {
		total: validUsers.length,
		success,
		failed,
		results
	};
}
/**
* Send a proactive message using a resolved account without a full config object.
*
* @param account Resolved account configuration.
* @param to Target openid.
* @param text Message content.
* @param type Message type.
*/
async function sendProactiveMessageDirect(account, to, text, type = "c2c") {
	if (!account.appId || !account.clientSecret) return {
		success: false,
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	try {
		const accessToken = await getAccessToken(account.appId, account.clientSecret);
		let result;
		if (type === "c2c") result = await sendProactiveC2CMessage(account.appId, accessToken, to, text);
		else result = await sendProactiveGroupMessage(account.appId, accessToken, to, text);
		return {
			success: true,
			messageId: result.id,
			timestamp: result.timestamp
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
/**
* Return known-user counts for the selected account.
*/
function getKnownUsersStats(accountId) {
	const users = listKnownUsers({ accountId });
	return {
		total: users.length,
		c2c: users.filter((u) => u.type === "c2c").length,
		group: users.filter((u) => u.type === "group").length,
		channel: 0
	};
}
//#endregion
export { DEFAULT_ACCOUNT_ID, applyQQBotAccountConfig, broadcastMessage, checkMessageReplyLimit, clearKnownUsers, clearKnownUsers$1 as clearKnownUsersFromStore, flushKnownUsers, getKnownUser, getKnownUser$1 as getKnownUserFromStore, getKnownUsersStats, getMessageReplyConfig, getMessageReplyStats, listKnownUsers, listKnownUsers$1 as listKnownUsersFromStore, listQQBotAccountIds, recordKnownUser, recordMessageReply, removeKnownUser, removeKnownUser$1 as removeKnownUserFromStore, resolveDefaultQQBotAccountId, resolveQQBotAccount, sendBulkProactiveMessage, sendCronMessage, sendDocument, sendMedia, sendPhoto, sendProactive, sendProactiveMessage, sendProactiveMessageDirect, sendText, sendVideoMsg, sendVoice };
