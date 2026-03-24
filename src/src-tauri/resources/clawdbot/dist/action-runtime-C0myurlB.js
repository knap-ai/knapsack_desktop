import { Ac as downloadSlackFile, Bc as removeSlackReaction, Fc as listSlackReactions, Hc as unpinSlackMessage, Ic as pinSlackMessage, Lc as reactSlackMessage, Mc as getSlackMemberInfo, Nc as listSlackEmojis, Pc as listSlackPins, Rc as readSlackMessages, Vc as sendSlackMessage, jc as editSlackMessage, kc as deleteSlackMessage, rl as parseSlackBlocksInput, sc as recordSlackThreadParticipation, ul as resolveSlackAccount, zc as removeOwnSlackReactions } from "./pi-embedded-CbCYZxIb.js";
import { a as withNormalizedTimestamp } from "./date-time-DcBRR7Wo.js";
import { c as jsonResult, d as readNumberParam, f as readReactionParams, h as readStringParam, i as createActionGate, s as imageResultFromFile } from "./common-zReYuoMM.js";
import { n as resolveSlackChannelId, t as parseSlackTarget } from "./targets-Uq-JgGuY.js";
//#region extensions/slack/src/action-runtime.ts
const messagingActions = new Set([
	"sendMessage",
	"editMessage",
	"deleteMessage",
	"readMessages",
	"downloadFile"
]);
const reactionsActions = new Set(["react", "reactions"]);
const pinActions = new Set([
	"pinMessage",
	"unpinMessage",
	"listPins"
]);
const slackActionRuntime = {
	deleteSlackMessage,
	downloadSlackFile,
	editSlackMessage,
	getSlackMemberInfo,
	listSlackEmojis,
	listSlackPins,
	listSlackReactions,
	parseSlackBlocksInput,
	pinSlackMessage,
	reactSlackMessage,
	readSlackMessages,
	recordSlackThreadParticipation,
	removeOwnSlackReactions,
	removeSlackReaction,
	sendSlackMessage,
	unpinSlackMessage
};
/**
* Resolve threadTs for a Slack message based on context and replyToMode.
* - "all": always inject threadTs
* - "first": inject only for first message (updates hasRepliedRef)
* - "off": never auto-inject
*/
function resolveThreadTsFromContext(explicitThreadTs, targetChannel, context) {
	if (explicitThreadTs) return explicitThreadTs;
	if (!context?.currentThreadTs || !context?.currentChannelId) return;
	const parsedTarget = parseSlackTarget(targetChannel, { defaultKind: "channel" });
	if (!parsedTarget || parsedTarget.kind !== "channel") return;
	if (parsedTarget.id !== context.currentChannelId) return;
	if (context.replyToMode === "all") return context.currentThreadTs;
	if (context.replyToMode === "first" && context.hasRepliedRef && !context.hasRepliedRef.value) {
		context.hasRepliedRef.value = true;
		return context.currentThreadTs;
	}
}
function readSlackBlocksParam(params) {
	return slackActionRuntime.parseSlackBlocksInput(params.blocks);
}
async function handleSlackAction(params, cfg, context) {
	const resolveChannelId = () => resolveSlackChannelId(readStringParam(params, "channelId", { required: true }));
	const action = readStringParam(params, "action", { required: true });
	const accountId = readStringParam(params, "accountId");
	const account = resolveSlackAccount({
		cfg,
		accountId
	});
	const isActionEnabled = createActionGate(account.actions ?? cfg.channels?.slack?.actions);
	const userToken = account.userToken;
	const botToken = account.botToken?.trim();
	const allowUserWrites = account.config.userTokenReadOnly === false;
	const getTokenForOperation = (operation) => {
		if (operation === "read") return userToken ?? botToken;
		if (!allowUserWrites) return botToken;
		return botToken ?? userToken;
	};
	const buildActionOpts = (operation) => {
		const token = getTokenForOperation(operation);
		const tokenOverride = token && token !== botToken ? token : void 0;
		if (!accountId && !tokenOverride) return;
		return {
			...accountId ? { accountId } : {},
			...tokenOverride ? { token: tokenOverride } : {}
		};
	};
	const readOpts = buildActionOpts("read");
	const writeOpts = buildActionOpts("write");
	if (reactionsActions.has(action)) {
		if (!isActionEnabled("reactions")) throw new Error("Slack reactions are disabled.");
		const channelId = resolveChannelId();
		const messageId = readStringParam(params, "messageId", { required: true });
		if (action === "react") {
			const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a Slack reaction." });
			if (remove) {
				if (writeOpts) await slackActionRuntime.removeSlackReaction(channelId, messageId, emoji, writeOpts);
				else await slackActionRuntime.removeSlackReaction(channelId, messageId, emoji);
				return jsonResult({
					ok: true,
					removed: emoji
				});
			}
			if (isEmpty) return jsonResult({
				ok: true,
				removed: writeOpts ? await slackActionRuntime.removeOwnSlackReactions(channelId, messageId, writeOpts) : await slackActionRuntime.removeOwnSlackReactions(channelId, messageId)
			});
			if (writeOpts) await slackActionRuntime.reactSlackMessage(channelId, messageId, emoji, writeOpts);
			else await slackActionRuntime.reactSlackMessage(channelId, messageId, emoji);
			return jsonResult({
				ok: true,
				added: emoji
			});
		}
		return jsonResult({
			ok: true,
			reactions: readOpts ? await slackActionRuntime.listSlackReactions(channelId, messageId, readOpts) : await slackActionRuntime.listSlackReactions(channelId, messageId)
		});
	}
	if (messagingActions.has(action)) {
		if (!isActionEnabled("messages")) throw new Error("Slack messages are disabled.");
		switch (action) {
			case "sendMessage": {
				const to = readStringParam(params, "to", { required: true });
				const content = readStringParam(params, "content", { allowEmpty: true });
				const mediaUrl = readStringParam(params, "mediaUrl");
				const blocks = readSlackBlocksParam(params);
				if (!content && !mediaUrl && !blocks) throw new Error("Slack sendMessage requires content, blocks, or mediaUrl.");
				if (mediaUrl && blocks) throw new Error("Slack sendMessage does not support blocks with mediaUrl.");
				const threadTs = resolveThreadTsFromContext(readStringParam(params, "threadTs"), to, context);
				const result = await slackActionRuntime.sendSlackMessage(to, content ?? "", {
					...writeOpts,
					mediaUrl: mediaUrl ?? void 0,
					mediaLocalRoots: context?.mediaLocalRoots,
					threadTs: threadTs ?? void 0,
					blocks
				});
				if (threadTs && result.channelId && account.accountId) slackActionRuntime.recordSlackThreadParticipation(account.accountId, result.channelId, threadTs);
				if (context?.hasRepliedRef && context.currentChannelId) {
					const parsedTarget = parseSlackTarget(to, { defaultKind: "channel" });
					if (parsedTarget?.kind === "channel" && parsedTarget.id === context.currentChannelId) context.hasRepliedRef.value = true;
				}
				return jsonResult({
					ok: true,
					result
				});
			}
			case "editMessage": {
				const channelId = resolveChannelId();
				const messageId = readStringParam(params, "messageId", { required: true });
				const content = readStringParam(params, "content", { allowEmpty: true });
				const blocks = readSlackBlocksParam(params);
				if (!content && !blocks) throw new Error("Slack editMessage requires content or blocks.");
				if (writeOpts) await slackActionRuntime.editSlackMessage(channelId, messageId, content ?? "", {
					...writeOpts,
					blocks
				});
				else await slackActionRuntime.editSlackMessage(channelId, messageId, content ?? "", { blocks });
				return jsonResult({ ok: true });
			}
			case "deleteMessage": {
				const channelId = resolveChannelId();
				const messageId = readStringParam(params, "messageId", { required: true });
				if (writeOpts) await slackActionRuntime.deleteSlackMessage(channelId, messageId, writeOpts);
				else await slackActionRuntime.deleteSlackMessage(channelId, messageId);
				return jsonResult({ ok: true });
			}
			case "readMessages": {
				const channelId = resolveChannelId();
				const limitRaw = params.limit;
				const limit = typeof limitRaw === "number" && Number.isFinite(limitRaw) ? limitRaw : void 0;
				const before = readStringParam(params, "before");
				const after = readStringParam(params, "after");
				const threadId = readStringParam(params, "threadId");
				const result = await slackActionRuntime.readSlackMessages(channelId, {
					...readOpts,
					limit,
					before: before ?? void 0,
					after: after ?? void 0,
					threadId: threadId ?? void 0
				});
				return jsonResult({
					ok: true,
					messages: result.messages.map((message) => withNormalizedTimestamp(message, message.ts)),
					hasMore: result.hasMore
				});
			}
			case "downloadFile": {
				const fileId = readStringParam(params, "fileId", { required: true });
				const channelTarget = readStringParam(params, "channelId") ?? readStringParam(params, "to");
				const channelId = channelTarget ? resolveSlackChannelId(channelTarget) : void 0;
				const threadId = readStringParam(params, "threadId") ?? readStringParam(params, "replyTo");
				const maxBytes = account.config?.mediaMaxMb ? account.config.mediaMaxMb * 1024 * 1024 : 20 * 1024 * 1024;
				const downloaded = await slackActionRuntime.downloadSlackFile(fileId, {
					...readOpts,
					maxBytes,
					channelId,
					threadId: threadId ?? void 0
				});
				if (!downloaded) return jsonResult({
					ok: false,
					error: "File could not be downloaded (not found, too large, or inaccessible)."
				});
				return await imageResultFromFile({
					label: "slack-file",
					path: downloaded.path,
					extraText: downloaded.placeholder,
					details: {
						fileId,
						path: downloaded.path
					}
				});
			}
			default: break;
		}
	}
	if (pinActions.has(action)) {
		if (!isActionEnabled("pins")) throw new Error("Slack pins are disabled.");
		const channelId = resolveChannelId();
		if (action === "pinMessage") {
			const messageId = readStringParam(params, "messageId", { required: true });
			if (writeOpts) await slackActionRuntime.pinSlackMessage(channelId, messageId, writeOpts);
			else await slackActionRuntime.pinSlackMessage(channelId, messageId);
			return jsonResult({ ok: true });
		}
		if (action === "unpinMessage") {
			const messageId = readStringParam(params, "messageId", { required: true });
			if (writeOpts) await slackActionRuntime.unpinSlackMessage(channelId, messageId, writeOpts);
			else await slackActionRuntime.unpinSlackMessage(channelId, messageId);
			return jsonResult({ ok: true });
		}
		return jsonResult({
			ok: true,
			pins: (writeOpts ? await slackActionRuntime.listSlackPins(channelId, readOpts) : await slackActionRuntime.listSlackPins(channelId)).map((pin) => {
				const message = pin.message ? withNormalizedTimestamp(pin.message, pin.message.ts) : pin.message;
				return message ? {
					...pin,
					message
				} : pin;
			})
		});
	}
	if (action === "memberInfo") {
		if (!isActionEnabled("memberInfo")) throw new Error("Slack member info is disabled.");
		const userId = readStringParam(params, "userId", { required: true });
		return jsonResult({
			ok: true,
			info: writeOpts ? await slackActionRuntime.getSlackMemberInfo(userId, readOpts) : await slackActionRuntime.getSlackMemberInfo(userId)
		});
	}
	if (action === "emojiList") {
		if (!isActionEnabled("emojiList")) throw new Error("Slack emoji list is disabled.");
		const result = readOpts ? await slackActionRuntime.listSlackEmojis(readOpts) : await slackActionRuntime.listSlackEmojis();
		const limit = readNumberParam(params, "limit", { integer: true });
		if (limit != null && limit > 0 && result.emoji != null) {
			const entries = Object.entries(result.emoji).toSorted(([a], [b]) => a.localeCompare(b));
			if (entries.length > limit) return jsonResult({
				ok: true,
				emojis: {
					...result,
					emoji: Object.fromEntries(entries.slice(0, limit))
				}
			});
		}
		return jsonResult({
			ok: true,
			emojis: result
		});
	}
	throw new Error(`Unknown action: ${action}`);
}
//#endregion
export { slackActionRuntime as n, handleSlackAction as t };
