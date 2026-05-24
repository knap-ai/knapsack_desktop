import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { n as buildSlackPresentationBlocks, r as resolveSlackInteractiveBlockOffsets, t as buildSlackInteractiveBlocks } from "./blocks-render-CNC4vQnd.js";
import { i as parseSlackBlocksInput, n as resolveSlackThreadTsValue, o as SLACK_TEXT_LIMIT } from "./thread-ts-ks-O8cEG.js";
import { t as compileSlackInteractiveReplies } from "./interactive-replies-9v8OYeGV.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
import { attachChannelToResult, createAttachedChannelResultAdapter } from "openclaw/plugin-sdk/channel-send-result";
import { resolveOutboundSendDep } from "openclaw/plugin-sdk/outbound-send-deps";
import { resolveInteractiveTextFallback } from "openclaw/plugin-sdk/interactive-runtime";
import { resolvePayloadMediaUrls, sendPayloadMediaSequenceAndFinalize, sendTextMediaPayload } from "openclaw/plugin-sdk/reply-payload";
//#region extensions/slack/src/outbound-adapter.ts
var outbound_adapter_exports = /* @__PURE__ */ __exportAll({ slackOutbound: () => slackOutbound });
const SLACK_MAX_BLOCKS = 50;
let slackSendRuntimePromise;
async function loadSlackSendRuntime() {
	slackSendRuntimePromise ??= import("./send.runtime-BfvtdHKC.js");
	return await slackSendRuntimePromise;
}
function resolveRenderedInteractiveBlocks(interactive, previousBlocks) {
	if (!interactive) return;
	const blocks = buildSlackInteractiveBlocks(interactive, resolveSlackInteractiveBlockOffsets(previousBlocks));
	return blocks.length > 0 ? blocks : void 0;
}
function resolveSlackSendIdentity(identity) {
	if (!identity) return;
	const username = normalizeOptionalString(identity.name);
	const iconUrl = normalizeOptionalString(identity.avatarUrl);
	const rawEmoji = normalizeOptionalString(identity.emoji);
	const iconEmoji = !iconUrl && rawEmoji && /^:[^:\s]+:$/.test(rawEmoji) ? rawEmoji : void 0;
	if (!username && !iconUrl && !iconEmoji) return;
	return {
		username,
		iconUrl,
		iconEmoji
	};
}
async function sendSlackOutboundMessage(params) {
	const send = resolveOutboundSendDep(params.deps, "slack") ?? (await loadSlackSendRuntime()).sendMessageSlack;
	const slackIdentity = resolveSlackSendIdentity(params.identity);
	const threadTs = resolveSlackThreadTsValue({
		replyToId: params.replyToId,
		threadId: params.threadId
	});
	return await send(params.to, params.text, {
		cfg: params.cfg,
		threadTs,
		accountId: params.accountId ?? void 0,
		...params.mediaUrl ? {
			mediaUrl: params.mediaUrl,
			mediaAccess: params.mediaAccess,
			mediaLocalRoots: params.mediaLocalRoots,
			mediaReadFile: params.mediaReadFile
		} : {},
		...params.blocks ? { blocks: params.blocks } : {},
		...slackIdentity ? { identity: slackIdentity } : {}
	});
}
function resolveSlackBlocks(payload) {
	const slackData = payload.channelData?.slack;
	const nativeBlocks = parseSlackBlocksInput(slackData?.blocks);
	const renderedPresentation = slackData?.presentationBlocks ?? buildSlackPresentationBlocks(payload.presentation, resolveSlackInteractiveBlockOffsets(nativeBlocks));
	const previousBlocks = [...nativeBlocks ?? [], ...renderedPresentation];
	const renderedInteractive = resolveRenderedInteractiveBlocks(payload.interactive, previousBlocks);
	const mergedBlocks = [...previousBlocks, ...renderedInteractive ?? []];
	if (mergedBlocks.length === 0) return;
	if (mergedBlocks.length > SLACK_MAX_BLOCKS) throw new Error(`Slack blocks cannot exceed ${SLACK_MAX_BLOCKS} items after interactive render`);
	return mergedBlocks;
}
const slackOutbound = {
	deliveryMode: "direct",
	chunker: null,
	textChunkLimit: SLACK_TEXT_LIMIT,
	normalizePayload: ({ payload }) => compileSlackInteractiveReplies(payload),
	presentationCapabilities: {
		supported: true,
		buttons: true,
		selects: true,
		context: true,
		divider: true,
		limits: {
			actions: {
				maxActionsPerRow: 25,
				maxLabelLength: 75,
				maxValueBytes: 2e3,
				supportsStyles: true
			},
			selects: {
				maxOptions: 100,
				maxLabelLength: 75,
				maxValueBytes: 150
			},
			text: {
				maxLength: SLACK_TEXT_LIMIT,
				encoding: "characters",
				markdownDialect: "slack-mrkdwn",
				supportsEdit: true
			}
		}
	},
	renderPresentation: ({ payload, presentation }) => {
		const slackData = payload.channelData?.slack;
		const presentationBlocks = buildSlackPresentationBlocks(presentation, resolveSlackInteractiveBlockOffsets(parseSlackBlocksInput(slackData?.blocks)));
		if (presentationBlocks.length === 0) return null;
		return {
			...payload,
			channelData: {
				...payload.channelData,
				slack: {
					...slackData,
					presentationBlocks
				}
			}
		};
	},
	sendPayload: async (ctx) => {
		const payload = {
			...ctx.payload,
			text: resolveInteractiveTextFallback({
				text: ctx.payload.text,
				interactive: ctx.payload.interactive
			}) ?? ""
		};
		const blocks = resolveSlackBlocks(payload);
		if (!blocks) return await sendTextMediaPayload({
			channel: "slack",
			ctx: {
				...ctx,
				payload
			},
			adapter: slackOutbound
		});
		return attachChannelToResult("slack", await sendPayloadMediaSequenceAndFinalize({
			text: "",
			mediaUrls: resolvePayloadMediaUrls(payload),
			send: async ({ text, mediaUrl }) => await sendSlackOutboundMessage({
				cfg: ctx.cfg,
				to: ctx.to,
				text,
				mediaUrl,
				mediaAccess: ctx.mediaAccess,
				mediaLocalRoots: ctx.mediaLocalRoots,
				mediaReadFile: ctx.mediaReadFile,
				accountId: ctx.accountId,
				deps: ctx.deps,
				replyToId: ctx.replyToId,
				threadId: ctx.threadId,
				identity: ctx.identity
			}),
			finalize: async () => await sendSlackOutboundMessage({
				cfg: ctx.cfg,
				to: ctx.to,
				text: payload.text ?? "",
				mediaAccess: ctx.mediaAccess,
				mediaLocalRoots: ctx.mediaLocalRoots,
				mediaReadFile: ctx.mediaReadFile,
				blocks,
				accountId: ctx.accountId,
				deps: ctx.deps,
				replyToId: ctx.replyToId,
				threadId: ctx.threadId,
				identity: ctx.identity
			})
		}));
	},
	...createAttachedChannelResultAdapter({
		channel: "slack",
		sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, identity }) => await sendSlackOutboundMessage({
			cfg,
			to,
			text,
			accountId,
			deps,
			replyToId,
			threadId,
			identity
		}),
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaAccess, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, identity }) => await sendSlackOutboundMessage({
			cfg,
			to,
			text,
			mediaUrl,
			mediaAccess,
			mediaLocalRoots,
			mediaReadFile,
			accountId,
			deps,
			replyToId,
			threadId,
			identity
		})
	})
};
//#endregion
export { slackOutbound as n, outbound_adapter_exports as t };
