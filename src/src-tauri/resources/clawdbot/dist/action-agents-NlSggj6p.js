import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-B2TRwbJD.js";
import "./plugins-BZ_I3cWH.js";
import { A as subagentRuns, s as countPendingDescendantRunsFromRuns, t as getSubagentRunsSnapshotForRead } from "./subagent-registry-state-BdxY8kqY.js";
import { r as getSessionBindingService } from "./session-binding-service-CHlhSOHA.js";
import { c as sortSubagentRuns, i as formatRunLabel } from "./subagents-format-Cqhgw9EJ.js";
import { d as resolveChannelAccountId, f as resolveCommandSurfaceChannel, u as stopWithText } from "./shared-DOdpx7Ch.js";
//#region src/auto-reply/reply/commands-subagents/action-agents.ts
function formatConversationBindingText(params) {
	return `binding:${params.conversationId}`;
}
function supportsConversationBindings(channel) {
	const channelId = normalizeChannelId(channel);
	if (!channelId) return false;
	return getChannelPlugin(channelId)?.conversationBindings?.supportsCurrentConversationBinding === true;
}
function handleSubagentsAgentsAction(ctx) {
	const { params, requesterKey, runs } = ctx;
	const runsSnapshot = getSubagentRunsSnapshotForRead(subagentRuns);
	const channel = resolveCommandSurfaceChannel(params);
	const accountId = resolveChannelAccountId(params);
	const currentConversationBindingsSupported = supportsConversationBindings(channel);
	const bindingService = getSessionBindingService();
	const bindingsBySession = /* @__PURE__ */ new Map();
	const resolveSessionBindings = (sessionKey) => {
		const cached = bindingsBySession.get(sessionKey);
		if (cached) return cached;
		const resolved = bindingService.listBySession(sessionKey).filter((entry) => entry.status === "active" && entry.conversation.channel === channel && entry.conversation.accountId === accountId);
		bindingsBySession.set(sessionKey, resolved);
		return resolved;
	};
	const dedupedRuns = [];
	const seenChildSessionKeys = /* @__PURE__ */ new Set();
	for (const entry of sortSubagentRuns(runs)) {
		if (seenChildSessionKeys.has(entry.childSessionKey)) continue;
		seenChildSessionKeys.add(entry.childSessionKey);
		dedupedRuns.push(entry);
	}
	const recentCutoff = Date.now() - 30 * 6e4;
	const numericOrder = [...dedupedRuns.filter((entry) => !entry.endedAt || countPendingDescendantRunsFromRuns(runsSnapshot, entry.childSessionKey) > 0), ...dedupedRuns.filter((entry) => entry.endedAt && countPendingDescendantRunsFromRuns(runsSnapshot, entry.childSessionKey) === 0 && entry.endedAt >= recentCutoff)];
	const indexByChildSessionKey = new Map(numericOrder.map((entry, idx) => [entry.childSessionKey, idx + 1]));
	const visibleRuns = [];
	for (const entry of dedupedRuns) {
		if (!(!entry.endedAt || countPendingDescendantRunsFromRuns(runsSnapshot, entry.childSessionKey) > 0 || resolveSessionBindings(entry.childSessionKey).length > 0)) continue;
		visibleRuns.push(entry);
	}
	const lines = ["agents:", "-----"];
	if (visibleRuns.length === 0) lines.push("(none)");
	else for (const entry of visibleRuns) {
		const binding = resolveSessionBindings(entry.childSessionKey)[0];
		const bindingText = binding ? formatConversationBindingText({ conversationId: binding.conversation.conversationId }) : currentConversationBindingsSupported ? "unbound" : "bindings unavailable";
		const resolvedIndex = indexByChildSessionKey.get(entry.childSessionKey);
		const prefix = resolvedIndex ? `${resolvedIndex}.` : "-";
		lines.push(`${prefix} ${formatRunLabel(entry)} (${bindingText})`);
	}
	const requesterBindings = resolveSessionBindings(requesterKey).filter((entry) => entry.targetKind === "session");
	if (requesterBindings.length > 0) {
		lines.push("", "acp/session bindings:", "-----");
		for (const binding of requesterBindings) {
			const label = normalizeOptionalString(binding.metadata?.label) ?? binding.targetSessionKey;
			lines.push(`- ${label} (${formatConversationBindingText({ conversationId: binding.conversation.conversationId })}, session:${binding.targetSessionKey})`);
		}
	}
	return stopWithText(lines.join("\n"));
}
//#endregion
export { handleSubagentsAgentsAction };
