import { a as resolveSlackApprovalKind, f as normalizeSlackApproverId, i as isSlackAnyNativeApprovalClientEnabled, o as shouldHandleSlackNativeApprovalRequest, t as resolveSlackReplyBlocks } from "./reply-blocks-BlOURkUm.js";
import { s as truncateSlackText } from "./thread-ts-ks-O8cEG.js";
import { t as sendMessageSlack } from "./send-Bpc-Eks7.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
import { buildChannelApprovalNativeTargetKey } from "openclaw/plugin-sdk/approval-native-runtime";
import { logError } from "openclaw/plugin-sdk/logging-core";
import { buildApprovalPresentationFromActionDescriptors } from "openclaw/plugin-sdk/approval-reply-runtime";
import { createChannelApprovalNativeRuntimeAdapter } from "openclaw/plugin-sdk/approval-handler-runtime";
//#region extensions/slack/src/approval-handler.runtime.ts
const SLACK_CONTEXT_ELEMENTS_MAX = 10;
const SLACK_CHAT_UPDATE_TEXT_LIMIT = 4e3;
const SLACK_TEXT_OBJECT_MAX = 3e3;
function resolveHandlerContext(params) {
	const context = params.context;
	const accountId = normalizeOptionalString(params.accountId) ?? "";
	if (!context?.app || !accountId) return null;
	return {
		accountId,
		context
	};
}
function truncateSlackMrkdwn(text, maxChars) {
	return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1)}…`;
}
function buildSlackCodeBlock(text) {
	let fence = "```";
	while (text.includes(fence)) fence += "`";
	return `${fence}\n${text}\n${fence}`;
}
function formatSlackApprover(resolvedBy) {
	const normalized = resolvedBy ? normalizeSlackApproverId(resolvedBy) : void 0;
	if (normalized) return `<@${normalized}>`;
	const trimmed = normalizeOptionalString(resolvedBy);
	return trimmed ? trimmed : null;
}
function formatSlackMetadataLine(label, value) {
	return `*${label}:* ${value}`;
}
function buildSlackMetadataLines(metadata) {
	const lines = [];
	for (const item of metadata) lines.push(formatSlackMetadataLine(item.label, item.value));
	return lines;
}
function buildSlackMetadataContextElements(metadata) {
	const lines = buildSlackMetadataLines(metadata);
	const visibleLineCount = lines.length > SLACK_CONTEXT_ELEMENTS_MAX ? SLACK_CONTEXT_ELEMENTS_MAX - 1 : lines.length;
	const elements = [];
	for (let index = 0; index < visibleLineCount; index += 1) {
		const line = lines[index];
		if (line === void 0) continue;
		elements.push({
			type: "mrkdwn",
			text: truncateSlackMrkdwn(line, SLACK_TEXT_OBJECT_MAX)
		});
	}
	if (lines.length > SLACK_CONTEXT_ELEMENTS_MAX) elements.push({
		type: "mrkdwn",
		text: `…+${lines.length - visibleLineCount} more`
	});
	return elements;
}
function resolveSlackApprovalDecisionLabel(decision) {
	return decision === "allow-once" ? "Allowed once" : decision === "allow-always" ? "Allowed always" : "Denied";
}
function buildSlackPluginMetadata(view) {
	return [{
		label: "Approval ID",
		value: view.approvalId
	}, ...view.metadata];
}
function resolveSlackPluginDescription(view) {
	return normalizeOptionalString(view.description) ?? "A plugin action needs your approval.";
}
function buildSlackExecPendingApprovalText(view) {
	const metadataLines = buildSlackMetadataLines(view.metadata);
	return [
		"*Exec approval required*",
		"A command needs your approval.",
		"",
		"*Command*",
		buildSlackCodeBlock(view.commandText),
		...metadataLines
	].join("\n");
}
function buildSlackPluginPendingApprovalText(view) {
	const metadataLines = buildSlackMetadataLines(buildSlackPluginMetadata(view));
	return [
		"*Plugin approval required*",
		resolveSlackPluginDescription(view),
		"",
		"*Request*",
		view.title,
		...metadataLines
	].join("\n");
}
function buildSlackPendingApprovalText(view) {
	return view.approvalKind === "plugin" ? buildSlackPluginPendingApprovalText(view) : buildSlackExecPendingApprovalText(view);
}
function buildSlackExecPendingApprovalBlocks(view) {
	const metadataElements = buildSlackMetadataContextElements(view.metadata);
	const interactiveBlocks = resolveSlackReplyBlocks({
		text: "",
		presentation: buildApprovalPresentationFromActionDescriptors(view.actions)
	}) ?? [];
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "*Exec approval required*\nA command needs your approval."
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Command*\n${buildSlackCodeBlock(truncateSlackMrkdwn(view.commandText, 2600))}`
			}
		},
		...metadataElements.length > 0 ? [{
			type: "context",
			elements: metadataElements
		}] : [],
		...interactiveBlocks
	];
}
function buildSlackPluginPendingApprovalBlocks(view) {
	const metadataElements = buildSlackMetadataContextElements(buildSlackPluginMetadata(view));
	const interactiveBlocks = resolveSlackReplyBlocks({
		text: "",
		presentation: buildApprovalPresentationFromActionDescriptors(view.actions)
	}) ?? [];
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Plugin approval required*\n${truncateSlackMrkdwn(resolveSlackPluginDescription(view), 2600)}`
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Request*\n${truncateSlackMrkdwn(view.title, 2600)}`
			}
		},
		...metadataElements.length > 0 ? [{
			type: "context",
			elements: metadataElements
		}] : [],
		...interactiveBlocks
	];
}
function buildSlackPendingApprovalBlocks(view) {
	return view.approvalKind === "plugin" ? buildSlackPluginPendingApprovalBlocks(view) : buildSlackExecPendingApprovalBlocks(view);
}
function buildSlackExecResolvedText(view) {
	const resolvedBy = formatSlackApprover(view.resolvedBy);
	return [
		`*Exec approval: ${resolveSlackApprovalDecisionLabel(view.decision)}*`,
		resolvedBy ? `Resolved by ${resolvedBy}.` : "Resolved.",
		"",
		"*Command*",
		buildSlackCodeBlock(view.commandText)
	].join("\n");
}
function buildSlackPluginResolvedText(view) {
	const resolvedBy = formatSlackApprover(view.resolvedBy);
	const metadataLines = buildSlackMetadataLines(buildSlackPluginMetadata(view));
	return [
		`*Plugin approval: ${resolveSlackApprovalDecisionLabel(view.decision)}*`,
		resolvedBy ? `Resolved by ${resolvedBy}.` : "Resolved.",
		"",
		"*Request*",
		view.title,
		...metadataLines
	].join("\n");
}
function buildSlackResolvedText(view) {
	return view.approvalKind === "plugin" ? buildSlackPluginResolvedText(view) : buildSlackExecResolvedText(view);
}
function buildSlackExecResolvedBlocks(view) {
	const resolvedBy = formatSlackApprover(view.resolvedBy);
	return [{
		type: "section",
		text: {
			type: "mrkdwn",
			text: `*Exec approval: ${resolveSlackApprovalDecisionLabel(view.decision)}*\n${resolvedBy ? `Resolved by ${resolvedBy}.` : "Resolved."}`
		}
	}, {
		type: "section",
		text: {
			type: "mrkdwn",
			text: `*Command*\n${buildSlackCodeBlock(truncateSlackMrkdwn(view.commandText, 2600))}`
		}
	}];
}
function buildSlackPluginResolvedBlocks(view) {
	const resolvedBy = formatSlackApprover(view.resolvedBy);
	const metadataElements = buildSlackMetadataContextElements(buildSlackPluginMetadata(view));
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Plugin approval: ${resolveSlackApprovalDecisionLabel(view.decision)}*\n${resolvedBy ? `Resolved by ${resolvedBy}.` : "Resolved."}`
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Request*\n${truncateSlackMrkdwn(view.title, 2600)}`
			}
		},
		...metadataElements.length > 0 ? [{
			type: "context",
			elements: metadataElements
		}] : []
	];
}
function buildSlackResolvedBlocks(view) {
	return view.approvalKind === "plugin" ? buildSlackPluginResolvedBlocks(view) : buildSlackExecResolvedBlocks(view);
}
function buildSlackExecExpiredText(view) {
	return [
		"*Exec approval expired*",
		"This approval request expired before it was resolved.",
		"",
		"*Command*",
		buildSlackCodeBlock(view.commandText)
	].join("\n");
}
function buildSlackPluginExpiredText(view) {
	const metadataLines = buildSlackMetadataLines(buildSlackPluginMetadata(view));
	return [
		"*Plugin approval expired*",
		"This approval request expired before it was resolved.",
		"",
		"*Request*",
		view.title,
		...metadataLines
	].join("\n");
}
function buildSlackExpiredText(view) {
	return view.approvalKind === "plugin" ? buildSlackPluginExpiredText(view) : buildSlackExecExpiredText(view);
}
function buildSlackExecExpiredBlocks(view) {
	return [{
		type: "section",
		text: {
			type: "mrkdwn",
			text: "*Exec approval expired*\nThis approval request expired before it was resolved."
		}
	}, {
		type: "section",
		text: {
			type: "mrkdwn",
			text: `*Command*\n${buildSlackCodeBlock(truncateSlackMrkdwn(view.commandText, 2600))}`
		}
	}];
}
function buildSlackPluginExpiredBlocks(view) {
	const metadataElements = buildSlackMetadataContextElements(buildSlackPluginMetadata(view));
	return [
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: "*Plugin approval expired*\nThis approval request expired before it was resolved."
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: `*Request*\n${truncateSlackMrkdwn(view.title, 2600)}`
			}
		},
		...metadataElements.length > 0 ? [{
			type: "context",
			elements: metadataElements
		}] : []
	];
}
function buildSlackExpiredBlocks(view) {
	return view.approvalKind === "plugin" ? buildSlackPluginExpiredBlocks(view) : buildSlackExecExpiredBlocks(view);
}
async function updateMessage(params) {
	try {
		await params.app.client.chat.update({
			channel: params.channelId,
			ts: params.messageTs,
			text: truncateSlackText(params.text, SLACK_CHAT_UPDATE_TEXT_LIMIT),
			blocks: params.blocks
		});
	} catch (err) {
		logError(`slack approvals: failed to update message: ${String(err)}`);
	}
}
const slackApprovalNativeRuntime = createChannelApprovalNativeRuntimeAdapter({
	eventKinds: ["exec", "plugin"],
	availability: {
		isConfigured: (params) => {
			const resolved = resolveHandlerContext(params);
			return resolved ? isSlackAnyNativeApprovalClientEnabled({
				cfg: params.cfg,
				accountId: resolved.accountId
			}) : false;
		},
		shouldHandle: (params) => {
			const resolved = resolveHandlerContext(params);
			if (!resolved) return false;
			return shouldHandleSlackNativeApprovalRequest({
				cfg: params.cfg,
				accountId: resolved.accountId,
				approvalKind: resolveSlackApprovalKind(params.request),
				request: params.request
			});
		}
	},
	presentation: {
		buildPendingPayload: ({ view }) => ({
			text: buildSlackPendingApprovalText(view),
			blocks: buildSlackPendingApprovalBlocks(view)
		}),
		buildResolvedResult: ({ view }) => ({
			kind: "update",
			payload: {
				text: buildSlackResolvedText(view),
				blocks: buildSlackResolvedBlocks(view)
			}
		}),
		buildExpiredResult: ({ view }) => ({
			kind: "update",
			payload: {
				text: buildSlackExpiredText(view),
				blocks: buildSlackExpiredBlocks(view)
			}
		})
	},
	transport: {
		prepareTarget: ({ plannedTarget }) => ({
			dedupeKey: buildChannelApprovalNativeTargetKey(plannedTarget.target),
			target: {
				to: plannedTarget.target.to,
				threadTs: plannedTarget.target.threadId != null ? String(plannedTarget.target.threadId) : void 0
			}
		}),
		deliverPending: async ({ cfg, accountId, context, preparedTarget, pendingPayload }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return null;
			const message = await sendMessageSlack(preparedTarget.to, pendingPayload.text, {
				cfg,
				accountId: resolved.accountId,
				threadTs: preparedTarget.threadTs,
				blocks: pendingPayload.blocks,
				client: resolved.context.app.client
			});
			return {
				channelId: message.channelId,
				messageTs: message.messageId
			};
		},
		updateEntry: async ({ cfg, accountId, context, entry, payload }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return;
			const nextPayload = payload;
			await updateMessage({
				app: resolved.context.app,
				channelId: entry.channelId,
				messageTs: entry.messageTs,
				text: nextPayload.text,
				blocks: nextPayload.blocks
			});
		}
	},
	observe: { onDeliveryError: ({ error, request }) => {
		logError(`slack approvals: failed to deliver approval ${request.id}: ${String(error)}`);
	} }
});
//#endregion
export { slackApprovalNativeRuntime };
