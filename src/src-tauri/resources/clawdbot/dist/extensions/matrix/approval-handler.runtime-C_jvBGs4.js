import { i as resolveMatrixAccount } from "./accounts-B8C2wBWb.js";
import { c as shouldHandleMatrixApprovalRequest, r as isMatrixAnyApprovalClientEnabled } from "./exec-approvals-6lCjP2at.js";
import { a as resolveMatrixTargetIdentity } from "./target-ids-SzOps7vq.js";
import { a as sendMessageMatrix, i as reactMatrixMessage } from "./send-hDTRqif4.js";
import { a as repairMatrixDirectRooms } from "./direct-management-BK42sApl.js";
import { a as unregisterMatrixApprovalReactionTarget, n as listMatrixApprovalReactionBindings, r as registerMatrixApprovalReactionTarget, t as buildMatrixApprovalReactionHint } from "./approval-reactions-D0ti_DpW.js";
import { n as editMatrixMessage, t as deleteMatrixMessage } from "./messages-DlJIMYaE.js";
import { buildChannelApprovalNativeTargetKey } from "openclaw/plugin-sdk/approval-native-runtime";
import { createChannelApprovalNativeRuntimeAdapter } from "openclaw/plugin-sdk/approval-handler-runtime";
import { buildExecApprovalPendingReplyPayload, buildPluginApprovalPendingReplyPayload } from "openclaw/plugin-sdk/approval-reply-runtime";
import { buildPluginApprovalResolvedReplyPayload } from "openclaw/plugin-sdk/approval-runtime";
//#region extensions/matrix/src/approval-handler.runtime.ts
function resolveHandlerContext(params) {
	const context = params.context;
	const accountId = params.accountId?.trim() || "";
	if (!context?.client || !accountId) return null;
	return {
		accountId,
		context
	};
}
function normalizePendingMessageIds(entry) {
	return Array.from(new Set(entry.messageIds.map((messageId) => messageId.trim()).filter(Boolean)));
}
function normalizeReactionTargetRef(params) {
	const roomId = params.roomId.trim();
	const eventId = params.eventId.trim();
	if (!roomId || !eventId) return null;
	return {
		roomId,
		eventId
	};
}
function normalizeThreadId(value) {
	return (value == null ? "" : String(value).trim()) || void 0;
}
async function prepareTarget(params) {
	const resolved = resolveHandlerContext(params);
	if (!resolved) return null;
	const target = resolveMatrixTargetIdentity(params.rawTarget.to);
	if (!target) return null;
	const threadId = normalizeThreadId(params.rawTarget.threadId);
	if (target.kind === "user") {
		const account = resolveMatrixAccount({
			cfg: params.cfg,
			accountId: resolved.accountId
		});
		const repaired = await (resolved.context.deps?.repairDirectRooms ?? repairMatrixDirectRooms)({
			client: resolved.context.client,
			remoteUserId: target.id,
			encrypted: account.config.encryption === true
		});
		if (!repaired.activeRoomId) return null;
		return {
			to: `room:${repaired.activeRoomId}`,
			roomId: repaired.activeRoomId,
			threadId
		};
	}
	return {
		to: `room:${target.id}`,
		roomId: target.id,
		threadId
	};
}
function buildPendingApprovalContent(params) {
	const allowedDecisions = params.view.actions.map((action) => action.decision);
	const payload = params.view.approvalKind === "plugin" ? buildPluginApprovalPendingReplyPayload({
		request: {
			id: params.view.approvalId,
			request: {
				title: params.view.title,
				description: params.view.description ?? "",
				severity: params.view.severity,
				toolName: params.view.toolName ?? void 0,
				pluginId: params.view.pluginId ?? void 0,
				agentId: params.view.agentId ?? void 0
			},
			createdAtMs: 0,
			expiresAtMs: params.view.expiresAtMs
		},
		nowMs: params.nowMs,
		allowedDecisions
	}) : buildExecApprovalPendingReplyPayload({
		approvalId: params.view.approvalId,
		approvalSlug: params.view.approvalId.slice(0, 8),
		approvalCommandId: params.view.approvalId,
		ask: params.view.ask ?? void 0,
		agentId: params.view.agentId ?? void 0,
		allowedDecisions,
		command: params.view.commandText,
		cwd: params.view.cwd ?? void 0,
		host: params.view.host === "node" ? "node" : "gateway",
		nodeId: params.view.nodeId ?? void 0,
		sessionKey: params.view.sessionKey ?? void 0,
		expiresAtMs: params.view.expiresAtMs,
		nowMs: params.nowMs
	});
	const hint = buildMatrixApprovalReactionHint(allowedDecisions);
	const text = payload.text ?? "";
	return {
		approvalId: params.view.approvalId,
		text: hint ? text ? `${hint}\n\n${text}` : hint : text,
		allowedDecisions
	};
}
function buildResolvedApprovalText(view) {
	if (view.approvalKind === "plugin") return buildPluginApprovalResolvedReplyPayload({ resolved: {
		id: view.approvalId,
		decision: view.decision,
		resolvedBy: view.resolvedBy ?? void 0,
		ts: 0
	} }).text ?? "";
	return [
		`Exec approval: ${view.decision === "allow-once" ? "Allowed once" : view.decision === "allow-always" ? "Allowed always" : "Denied"}`,
		"",
		"Command",
		buildMarkdownCodeBlock(view.commandText)
	].join("\n");
}
function buildMarkdownCodeBlock(text) {
	const longestFence = Math.max(...Array.from(text.matchAll(/`+/g), (match) => match[0].length), 0);
	const fence = "`".repeat(Math.max(3, longestFence + 1));
	return [
		fence,
		text,
		fence
	].join("\n");
}
const matrixApprovalNativeRuntime = createChannelApprovalNativeRuntimeAdapter({
	eventKinds: ["exec", "plugin"],
	availability: {
		isConfigured: ({ cfg, accountId, context }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return false;
			return isMatrixAnyApprovalClientEnabled({
				cfg,
				accountId: resolved.accountId
			});
		},
		shouldHandle: ({ cfg, accountId, request, context }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return false;
			return shouldHandleMatrixApprovalRequest({
				cfg,
				accountId: resolved.accountId,
				request
			});
		}
	},
	presentation: {
		buildPendingPayload: ({ view, nowMs }) => buildPendingApprovalContent({
			view,
			nowMs
		}),
		buildResolvedResult: ({ view }) => ({
			kind: "update",
			payload: buildResolvedApprovalText(view)
		}),
		buildExpiredResult: () => ({ kind: "delete" })
	},
	transport: {
		prepareTarget: ({ cfg, accountId, context, plannedTarget }) => {
			return prepareTarget({
				cfg,
				accountId,
				context,
				rawTarget: plannedTarget.target
			}).then((preparedTarget) => preparedTarget ? {
				dedupeKey: buildChannelApprovalNativeTargetKey({
					to: preparedTarget.roomId,
					threadId: preparedTarget.threadId
				}),
				target: preparedTarget
			} : null);
		},
		deliverPending: async ({ cfg, accountId, context, preparedTarget, pendingPayload }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return null;
			const sendMessage = resolved.context.deps?.sendMessage ?? sendMessageMatrix;
			const reactMessage = resolved.context.deps?.reactMessage ?? reactMatrixMessage;
			const result = await sendMessage(preparedTarget.to, pendingPayload.text, {
				cfg,
				accountId: resolved.accountId,
				client: resolved.context.client,
				threadId: preparedTarget.threadId
			});
			const messageIds = Array.from(new Set((result.messageIds ?? [result.messageId]).map((messageId) => messageId.trim()).filter(Boolean)));
			const reactionEventId = result.primaryMessageId?.trim() || messageIds[0] || result.messageId.trim();
			await Promise.allSettled(listMatrixApprovalReactionBindings(pendingPayload.allowedDecisions).map(async ({ emoji }) => {
				await reactMessage(result.roomId, reactionEventId, emoji, {
					cfg,
					accountId: resolved.accountId,
					client: resolved.context.client
				});
			}));
			return {
				roomId: result.roomId,
				messageIds,
				reactionEventId
			};
		},
		updateEntry: async ({ cfg, accountId, context, entry, payload }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return;
			const editMessage = resolved.context.deps?.editMessage ?? editMatrixMessage;
			const deleteMessage = resolved.context.deps?.deleteMessage ?? deleteMatrixMessage;
			const [primaryMessageId, ...staleMessageIds] = normalizePendingMessageIds(entry);
			if (!primaryMessageId) return;
			const text = payload;
			await Promise.allSettled([editMessage(entry.roomId, primaryMessageId, text, {
				cfg,
				accountId: resolved.accountId,
				client: resolved.context.client
			}), ...staleMessageIds.map(async (messageId) => {
				await deleteMessage(entry.roomId, messageId, {
					cfg,
					accountId: resolved.accountId,
					client: resolved.context.client,
					reason: "approval resolved"
				});
			})]);
		},
		deleteEntry: async ({ cfg, accountId, context, entry, phase }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return;
			const deleteMessage = resolved.context.deps?.deleteMessage ?? deleteMatrixMessage;
			await Promise.allSettled(normalizePendingMessageIds(entry).map(async (messageId) => {
				await deleteMessage(entry.roomId, messageId, {
					cfg,
					accountId: resolved.accountId,
					client: resolved.context.client,
					reason: phase === "expired" ? "approval expired" : "approval resolved"
				});
			}));
		}
	},
	interactions: {
		bindPending: ({ entry, pendingPayload }) => {
			const target = normalizeReactionTargetRef({
				roomId: entry.roomId,
				eventId: entry.reactionEventId
			});
			if (!target) return null;
			registerMatrixApprovalReactionTarget({
				roomId: target.roomId,
				eventId: target.eventId,
				approvalId: pendingPayload.approvalId,
				allowedDecisions: pendingPayload.allowedDecisions
			});
			return target;
		},
		unbindPending: ({ binding }) => {
			const target = normalizeReactionTargetRef(binding);
			if (!target) return;
			unregisterMatrixApprovalReactionTarget(target);
		}
	}
});
//#endregion
export { matrixApprovalNativeRuntime };
