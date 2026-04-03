import { a as resolveAgentDir, p as resolveAgentWorkspaceDir, v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
import { Gr as getChannelAgentToolMeta, k as resolveEffectiveToolPolicy, st as summarizeToolDescriptionText, w as createOpenClawCodingTools } from "./pi-embedded-BYdcxQ5A.js";
import { n as getPluginToolMeta } from "./tools-rapDi4Fi.js";
import { r as resolveToolDisplay } from "./tool-display-CSvtnoK0.js";
import { n as resolveModel } from "./anthropic-vertex-stream-DeiIH5Mp.js";
//#region src/agents/tools-effective-inventory.ts
function resolveEffectiveToolLabel(tool) {
	const rawLabel = typeof tool.label === "string" ? tool.label.trim() : "";
	if (rawLabel && rawLabel.toLowerCase() !== tool.name.toLowerCase()) return rawLabel;
	return resolveToolDisplay({ name: tool.name }).title;
}
function resolveRawToolDescription(tool) {
	return typeof tool.description === "string" ? tool.description.trim() : "";
}
function summarizeToolDescription(tool) {
	return summarizeToolDescriptionText({
		rawDescription: resolveRawToolDescription(tool),
		displaySummary: tool.displaySummary
	});
}
function resolveEffectiveToolSource(tool) {
	const pluginMeta = getPluginToolMeta(tool);
	if (pluginMeta) return {
		source: "plugin",
		pluginId: pluginMeta.pluginId
	};
	const channelMeta = getChannelAgentToolMeta(tool);
	if (channelMeta) return {
		source: "channel",
		channelId: channelMeta.channelId
	};
	return { source: "core" };
}
function groupLabel(source) {
	switch (source) {
		case "plugin": return "Connected tools";
		case "channel": return "Channel tools";
		default: return "Built-in tools";
	}
}
function disambiguateLabels(entries) {
	const counts = /* @__PURE__ */ new Map();
	for (const entry of entries) counts.set(entry.label, (counts.get(entry.label) ?? 0) + 1);
	return entries.map((entry) => {
		if ((counts.get(entry.label) ?? 0) < 2) return entry;
		const suffix = entry.pluginId ?? entry.channelId ?? entry.id;
		return {
			...entry,
			label: `${entry.label} (${suffix})`
		};
	});
}
function resolveEffectiveModelCompat(params) {
	const provider = params.modelProvider?.trim();
	const modelId = params.modelId?.trim();
	if (!provider || !modelId) return;
	try {
		return resolveModel(provider, modelId, params.agentDir, params.cfg).model?.compat;
	} catch {
		return;
	}
}
function resolveEffectiveToolInventory(params) {
	const agentId = params.agentId?.trim() || resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.cfg, agentId);
	const agentDir = params.agentDir ?? resolveAgentDir(params.cfg, agentId);
	const modelCompat = resolveEffectiveModelCompat({
		cfg: params.cfg,
		agentDir,
		modelProvider: params.modelProvider,
		modelId: params.modelId
	});
	const effectiveTools = createOpenClawCodingTools({
		agentId,
		sessionKey: params.sessionKey,
		workspaceDir,
		agentDir,
		config: params.cfg,
		modelProvider: params.modelProvider,
		modelId: params.modelId,
		modelCompat,
		messageProvider: params.messageProvider,
		senderIsOwner: params.senderIsOwner,
		senderId: params.senderId,
		senderName: params.senderName ?? void 0,
		senderUsername: params.senderUsername ?? void 0,
		senderE164: params.senderE164 ?? void 0,
		agentAccountId: params.accountId ?? void 0,
		currentChannelId: params.currentChannelId,
		currentThreadTs: params.currentThreadTs,
		currentMessageId: params.currentMessageId,
		groupId: params.groupId ?? void 0,
		groupChannel: params.groupChannel ?? void 0,
		groupSpace: params.groupSpace ?? void 0,
		replyToMode: params.replyToMode,
		allowGatewaySubagentBinding: true,
		modelHasVision: params.modelHasVision,
		requireExplicitMessageTarget: params.requireExplicitMessageTarget,
		disableMessageTool: params.disableMessageTool
	});
	const effectivePolicy = resolveEffectiveToolPolicy({
		config: params.cfg,
		agentId,
		sessionKey: params.sessionKey,
		modelProvider: params.modelProvider,
		modelId: params.modelId
	});
	const profile = effectivePolicy.providerProfile ?? effectivePolicy.profile ?? "full";
	const entries = disambiguateLabels(effectiveTools.map((tool) => {
		const source = resolveEffectiveToolSource(tool);
		return {
			id: tool.name,
			label: resolveEffectiveToolLabel(tool),
			description: summarizeToolDescription(tool),
			rawDescription: resolveRawToolDescription(tool) || summarizeToolDescription(tool),
			...source
		};
	}).toSorted((a, b) => a.label.localeCompare(b.label)));
	const groupsBySource = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const tools = groupsBySource.get(entry.source) ?? [];
		tools.push(entry);
		groupsBySource.set(entry.source, tools);
	}
	return {
		agentId,
		profile,
		groups: [
			"core",
			"plugin",
			"channel"
		].map((source) => {
			const tools = groupsBySource.get(source);
			if (!tools || tools.length === 0) return null;
			return {
				id: source,
				label: groupLabel(source),
				source,
				tools
			};
		}).filter((group) => group !== null)
	};
}
//#endregion
export { resolveEffectiveToolInventory as t };
