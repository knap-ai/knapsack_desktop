import { w as resolveExecApprovalAllowedDecisions } from "./exec-approvals-D6YTmZxM.js";
//#region src/infra/exec-approval-reply.ts
function resolveAllowedDecisions(params) {
	return params.allowedDecisions ?? resolveExecApprovalAllowedDecisions({ ask: params.ask });
}
function buildApprovalCommandFence(descriptors) {
	if (descriptors.length === 0) return null;
	return buildFence(descriptors.map((descriptor) => descriptor.command).join("\n"), "txt");
}
function buildExecApprovalCommandText(params) {
	return `/approve ${params.approvalCommandId} ${params.decision}`;
}
function buildExecApprovalActionDescriptors(params) {
	const approvalCommandId = params.approvalCommandId.trim();
	if (!approvalCommandId) return [];
	const allowedDecisions = resolveAllowedDecisions(params);
	const descriptors = [];
	if (allowedDecisions.includes("allow-once")) descriptors.push({
		decision: "allow-once",
		label: "Allow Once",
		style: "success",
		command: buildExecApprovalCommandText({
			approvalCommandId,
			decision: "allow-once"
		})
	});
	if (allowedDecisions.includes("allow-always")) descriptors.push({
		decision: "allow-always",
		label: "Allow Always",
		style: "primary",
		command: buildExecApprovalCommandText({
			approvalCommandId,
			decision: "allow-always"
		})
	});
	if (allowedDecisions.includes("deny")) descriptors.push({
		decision: "deny",
		label: "Deny",
		style: "danger",
		command: buildExecApprovalCommandText({
			approvalCommandId,
			decision: "deny"
		})
	});
	return descriptors;
}
function buildApprovalInteractiveButtons(allowedDecisions, approvalId) {
	return buildExecApprovalActionDescriptors({
		approvalCommandId: approvalId,
		allowedDecisions
	}).map((descriptor) => ({
		label: descriptor.label,
		value: descriptor.command,
		style: descriptor.style
	}));
}
function buildApprovalInteractiveReply(params) {
	const buttons = buildApprovalInteractiveButtons(resolveAllowedDecisions(params), params.approvalId);
	return buttons.length > 0 ? { blocks: [{
		type: "buttons",
		buttons
	}] } : void 0;
}
function buildExecApprovalInteractiveReply(params) {
	return buildApprovalInteractiveReply({
		approvalId: params.approvalCommandId,
		ask: params.ask,
		allowedDecisions: params.allowedDecisions
	});
}
function getExecApprovalApproverDmNoticeText() {
	return "Approval required. I sent approval DMs to the approvers for this account.";
}
function parseExecApprovalCommandText(raw) {
	const match = raw.trim().match(/^\/?approve(?:@[^\s]+)?\s+([A-Za-z0-9][A-Za-z0-9._:-]*)\s+(allow-once|allow-always|always|deny)\b/i);
	if (!match) return null;
	const rawDecision = match[2].toLowerCase();
	return {
		approvalId: match[1],
		decision: rawDecision === "always" ? "allow-always" : rawDecision
	};
}
function formatExecApprovalExpiresIn(expiresAtMs, nowMs) {
	const totalSeconds = Math.max(0, Math.round((expiresAtMs - nowMs) / 1e3));
	if (totalSeconds < 60) return `${totalSeconds}s`;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor(totalSeconds % 3600 / 60);
	const seconds = totalSeconds % 60;
	const parts = [];
	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (hours === 0 && minutes < 5 && seconds > 0) parts.push(`${seconds}s`);
	return parts.join(" ");
}
function buildFence(text, language) {
	let fence = "```";
	while (text.includes(fence)) fence += "`";
	return `${fence}${language ? language : ""}\n${text}\n${fence}`;
}
function getExecApprovalReplyMetadata(payload) {
	const channelData = payload.channelData;
	if (!channelData || typeof channelData !== "object" || Array.isArray(channelData)) return null;
	const execApproval = channelData.execApproval;
	if (!execApproval || typeof execApproval !== "object" || Array.isArray(execApproval)) return null;
	const record = execApproval;
	const approvalId = typeof record.approvalId === "string" ? record.approvalId.trim() : "";
	const approvalSlug = typeof record.approvalSlug === "string" ? record.approvalSlug.trim() : "";
	if (!approvalId || !approvalSlug) return null;
	return {
		approvalId,
		approvalSlug,
		allowedDecisions: Array.isArray(record.allowedDecisions) ? record.allowedDecisions.filter((value) => value === "allow-once" || value === "allow-always" || value === "deny") : void 0
	};
}
function buildExecApprovalPendingReplyPayload(params) {
	const approvalCommandId = params.approvalCommandId?.trim() || params.approvalSlug;
	const allowedDecisions = resolveAllowedDecisions(params);
	const descriptors = buildExecApprovalActionDescriptors({
		approvalCommandId,
		allowedDecisions
	});
	const primaryAction = descriptors[0] ?? null;
	const secondaryActions = descriptors.slice(1);
	const lines = [];
	const warningText = params.warningText?.trim();
	if (warningText) lines.push(warningText);
	lines.push("Approval required.");
	if (primaryAction) {
		lines.push("Run:");
		lines.push(buildFence(primaryAction.command, "txt"));
	}
	lines.push("Pending command:");
	lines.push(buildFence(params.command, "sh"));
	const secondaryFence = buildApprovalCommandFence(secondaryActions);
	if (secondaryFence) {
		lines.push("Other options:");
		lines.push(secondaryFence);
	}
	if (!allowedDecisions.includes("allow-always")) lines.push("The effective approval policy requires approval every time, so Allow Always is unavailable.");
	const info = [];
	info.push(`Host: ${params.host}`);
	if (params.nodeId) info.push(`Node: ${params.nodeId}`);
	if (params.cwd) info.push(`CWD: ${params.cwd}`);
	if (typeof params.expiresAtMs === "number" && Number.isFinite(params.expiresAtMs)) info.push(`Expires in: ${formatExecApprovalExpiresIn(params.expiresAtMs, params.nowMs ?? Date.now())}`);
	info.push(`Full id: \`${params.approvalId}\``);
	lines.push(info.join("\n"));
	return {
		text: lines.join("\n\n"),
		interactive: buildApprovalInteractiveReply({
			approvalId: params.approvalId,
			allowedDecisions
		}),
		channelData: { execApproval: {
			approvalId: params.approvalId,
			approvalSlug: params.approvalSlug,
			allowedDecisions
		} }
	};
}
function buildExecApprovalUnavailableReplyPayload(params) {
	const lines = [];
	const warningText = params.warningText?.trim();
	if (warningText) lines.push(warningText);
	if (params.sentApproverDms) {
		lines.push(getExecApprovalApproverDmNoticeText());
		return { text: lines.join("\n\n") };
	}
	if (params.reason === "initiating-platform-disabled") {
		lines.push(`Exec approval is required, but chat exec approvals are not enabled on ${params.channelLabel ?? "this platform"}.`);
		lines.push("Approve it from the Web UI or terminal UI, or enable a native chat approval client such as Discord, Slack, or Telegram. If those accounts already know your owner ID via allowFrom or owner config, OpenClaw can often infer approvers automatically.");
	} else if (params.reason === "initiating-platform-unsupported") {
		lines.push(`Exec approval is required, but ${params.channelLabel ?? "this platform"} does not support chat exec approvals.`);
		lines.push("Approve it from the Web UI or terminal UI, or enable a native chat approval client such as Discord, Slack, or Telegram. If those accounts already know your owner ID via allowFrom or owner config, OpenClaw can often infer approvers automatically.");
	} else {
		lines.push("Exec approval is required, but no interactive approval client is currently available.");
		lines.push("Open the Web UI or terminal UI, or enable a native chat approval client such as Discord, Slack, or Telegram, then retry the command. If those accounts already know your owner ID via allowFrom or owner config, you can usually leave execApprovals.approvers unset.");
	}
	return { text: lines.join("\n\n") };
}
//#endregion
export { buildExecApprovalPendingReplyPayload as a, getExecApprovalApproverDmNoticeText as c, buildExecApprovalInteractiveReply as i, getExecApprovalReplyMetadata as l, buildExecApprovalActionDescriptors as n, buildExecApprovalUnavailableReplyPayload as o, buildExecApprovalCommandText as r, formatExecApprovalExpiresIn as s, buildApprovalInteractiveReply as t, parseExecApprovalCommandText as u };
