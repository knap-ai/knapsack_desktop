import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { D as createDiscordClient, _ as stripUndefinedFields } from "./send.shared-DIBQaUs5.js";
import { a as isDiscordExecApprovalClientEnabled, n as shouldHandleDiscordApprovalRequest, t as DiscordUiContainer } from "./ui-BxLG13MU.js";
import { logDebug, logError, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { ButtonStyle, Routes } from "discord-api-types/v10";
import { Button, Row, Separator, TextDisplay, serializePayload } from "@buape/carbon";
import { createChannelApprovalNativeRuntimeAdapter } from "openclaw/plugin-sdk/approval-handler-runtime";
//#region extensions/discord/src/approval-handler.runtime.ts
var approval_handler_runtime_exports = /* @__PURE__ */ __exportAll({
	buildExecApprovalCustomId: () => buildExecApprovalCustomId,
	discordApprovalNativeRuntime: () => discordApprovalNativeRuntime
});
function resolveHandlerContext(params) {
	const context = params.context;
	const accountId = normalizeOptionalString(params.accountId) ?? "";
	if (!context?.token || !accountId) return null;
	return {
		accountId,
		context
	};
}
var ExecApprovalContainer = class extends DiscordUiContainer {
	constructor(params) {
		const components = [new TextDisplay(`## ${params.title}`)];
		if (params.description) components.push(new TextDisplay(params.description));
		components.push(new Separator({
			divider: true,
			spacing: "small"
		}));
		components.push(new TextDisplay(`### Command\n\`\`\`\n${params.commandPreview}\n\`\`\``));
		if (params.commandSecondaryPreview) components.push(new TextDisplay(`### Shell Preview\n\`\`\`\n${params.commandSecondaryPreview}\n\`\`\``));
		if (params.metadataLines?.length) components.push(new TextDisplay(params.metadataLines.join("\n")));
		if (params.actionRow) components.push(params.actionRow);
		if (params.footer) {
			components.push(new Separator({
				divider: false,
				spacing: "small"
			}));
			components.push(new TextDisplay(`-# ${params.footer}`));
		}
		super({
			cfg: params.cfg,
			accountId: params.accountId,
			components,
			accentColor: params.accentColor
		});
	}
};
var ExecApprovalActionButton = class extends Button {
	constructor(params) {
		super();
		this.customId = buildExecApprovalCustomId(params.approvalId, params.descriptor.decision);
		this.label = params.descriptor.label;
		this.style = params.descriptor.style === "success" ? ButtonStyle.Success : params.descriptor.style === "primary" ? ButtonStyle.Primary : params.descriptor.style === "danger" ? ButtonStyle.Danger : ButtonStyle.Secondary;
	}
};
var ExecApprovalActionRow = class extends Row {
	constructor(params) {
		super(params.actions.map((descriptor) => new ExecApprovalActionButton({
			approvalId: params.approvalId,
			descriptor
		})));
	}
};
function createApprovalActionRow(view) {
	return new ExecApprovalActionRow({
		approvalId: view.approvalId,
		actions: view.actions
	});
}
function buildApprovalMetadataLines(metadata) {
	return metadata.map((item) => `- ${item.label}: ${item.value}`);
}
function buildExecApprovalPayload(container) {
	return { components: [container] };
}
function formatCommandPreview(commandText, maxChars) {
	return (commandText.length > maxChars ? `${commandText.slice(0, maxChars)}...` : commandText).replace(/`/g, "​`");
}
function formatOptionalCommandPreview(commandText, maxChars) {
	if (!commandText) return null;
	return formatCommandPreview(commandText, maxChars);
}
function resolveCommandPreviews(commandText, commandPreview, maxChars, secondaryMaxChars) {
	return {
		commandPreview: formatCommandPreview(commandText, maxChars),
		commandSecondaryPreview: formatOptionalCommandPreview(commandPreview, secondaryMaxChars)
	};
}
function createExecApprovalRequestContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveCommandPreviews(params.view.commandText, params.view.commandPreview, 1e3, 500);
	const expiresAtSeconds = Math.max(0, Math.floor(params.view.expiresAtMs / 1e3));
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Exec Approval Required",
		description: "A command needs your approval.",
		commandPreview,
		commandSecondaryPreview,
		metadataLines: buildApprovalMetadataLines(params.view.metadata),
		actionRow: params.actionRow,
		footer: `Expires <t:${expiresAtSeconds}:R> · ID: ${params.view.approvalId}`,
		accentColor: "#FFA500"
	});
}
function createPluginApprovalRequestContainer(params) {
	const expiresAtSeconds = Math.max(0, Math.floor(params.view.expiresAtMs / 1e3));
	const severity = params.view.severity;
	const accentColor = severity === "critical" ? "#ED4245" : severity === "info" ? "#5865F2" : "#FAA61A";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Plugin Approval Required",
		description: "A plugin action needs your approval.",
		commandPreview: formatCommandPreview(params.view.title, 700),
		commandSecondaryPreview: formatOptionalCommandPreview(params.view.description, 1e3),
		metadataLines: buildApprovalMetadataLines(params.view.metadata),
		actionRow: params.actionRow,
		footer: `Expires <t:${expiresAtSeconds}:R> · ID: ${params.view.approvalId}`,
		accentColor
	});
}
function createExecResolvedContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveCommandPreviews(params.view.commandText, params.view.commandPreview, 500, 300);
	const decisionLabel = params.view.decision === "allow-once" ? "Allowed (once)" : params.view.decision === "allow-always" ? "Allowed (always)" : "Denied";
	const accentColor = params.view.decision === "deny" ? "#ED4245" : params.view.decision === "allow-always" ? "#5865F2" : "#57F287";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: `Exec Approval: ${decisionLabel}`,
		description: params.view.resolvedBy ? `Resolved by ${params.view.resolvedBy}` : "Resolved",
		commandPreview,
		commandSecondaryPreview,
		metadataLines: buildApprovalMetadataLines(params.view.metadata),
		footer: `ID: ${params.view.approvalId}`,
		accentColor
	});
}
function createPluginResolvedContainer(params) {
	const decisionLabel = params.view.decision === "allow-once" ? "Allowed (once)" : params.view.decision === "allow-always" ? "Allowed (always)" : "Denied";
	const accentColor = params.view.decision === "deny" ? "#ED4245" : params.view.decision === "allow-always" ? "#5865F2" : "#57F287";
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: `Plugin Approval: ${decisionLabel}`,
		description: params.view.resolvedBy ? `Resolved by ${params.view.resolvedBy}` : "Resolved",
		commandPreview: formatCommandPreview(params.view.title, 700),
		commandSecondaryPreview: formatOptionalCommandPreview(params.view.description, 1e3),
		metadataLines: buildApprovalMetadataLines(params.view.metadata),
		footer: `ID: ${params.view.approvalId}`,
		accentColor
	});
}
function createExecExpiredContainer(params) {
	const { commandPreview, commandSecondaryPreview } = resolveCommandPreviews(params.view.commandText, params.view.commandPreview, 500, 300);
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Exec Approval: Expired",
		description: "This approval request has expired.",
		commandPreview,
		commandSecondaryPreview,
		metadataLines: buildApprovalMetadataLines(params.view.metadata),
		footer: `ID: ${params.view.approvalId}`,
		accentColor: "#99AAB5"
	});
}
function createPluginExpiredContainer(params) {
	return new ExecApprovalContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		title: "Plugin Approval: Expired",
		description: "This approval request has expired.",
		commandPreview: formatCommandPreview(params.view.title, 700),
		commandSecondaryPreview: formatOptionalCommandPreview(params.view.description, 1e3),
		metadataLines: buildApprovalMetadataLines(params.view.metadata),
		footer: `ID: ${params.view.approvalId}`,
		accentColor: "#99AAB5"
	});
}
function buildExecApprovalCustomId(approvalId, action) {
	return [`execapproval:id=${encodeURIComponent(approvalId)}`, `action=${action}`].join(";");
}
async function updateMessage(params) {
	try {
		const { rest, request: discordRequest } = createDiscordClient({
			token: params.token,
			accountId: params.accountId
		}, params.cfg);
		const payload = buildExecApprovalPayload(params.container);
		await discordRequest(() => rest.patch(Routes.channelMessage(params.channelId, params.messageId), { body: stripUndefinedFields(serializePayload(payload)) }), "update-approval");
	} catch (err) {
		logError(`discord approvals: failed to update message: ${String(err)}`);
	}
}
async function finalizeMessage(params) {
	if (!params.cleanupAfterResolve) {
		await updateMessage(params);
		return;
	}
	try {
		const { rest, request: discordRequest } = createDiscordClient({
			token: params.token,
			accountId: params.accountId
		}, params.cfg);
		await discordRequest(() => rest.delete(Routes.channelMessage(params.channelId, params.messageId)), "delete-approval");
	} catch (err) {
		logError(`discord approvals: failed to delete message: ${String(err)}`);
		await updateMessage(params);
	}
}
const discordApprovalNativeRuntime = createChannelApprovalNativeRuntimeAdapter({
	eventKinds: ["exec", "plugin"],
	resolveApprovalKind: (request) => request.id.startsWith("plugin:") ? "plugin" : "exec",
	availability: {
		isConfigured: (params) => {
			const resolved = resolveHandlerContext(params);
			return resolved ? isDiscordExecApprovalClientEnabled({
				cfg: params.cfg,
				accountId: resolved.accountId,
				configOverride: resolved.context.config
			}) : false;
		},
		shouldHandle: (params) => {
			const resolved = resolveHandlerContext(params);
			return resolved ? shouldHandleDiscordApprovalRequest({
				cfg: params.cfg,
				accountId: resolved.accountId,
				request: params.request,
				configOverride: resolved.context.config
			}) : false;
		}
	},
	presentation: {
		buildPendingPayload: ({ cfg, accountId, context, view }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return { body: {} };
			const actionRow = createApprovalActionRow(view);
			return { body: stripUndefinedFields(serializePayload(buildExecApprovalPayload(view.approvalKind === "plugin" ? createPluginApprovalRequestContainer({
				view,
				cfg,
				accountId: resolved.accountId,
				actionRow
			}) : createExecApprovalRequestContainer({
				view,
				cfg,
				accountId: resolved.accountId,
				actionRow
			})))) };
		},
		buildResolvedResult: ({ cfg, accountId, context, view }) => {
			const resolvedContext = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolvedContext) return { kind: "delete" };
			return {
				kind: "update",
				payload: view.approvalKind === "plugin" ? createPluginResolvedContainer({
					view,
					cfg,
					accountId: resolvedContext.accountId
				}) : createExecResolvedContainer({
					view,
					cfg,
					accountId: resolvedContext.accountId
				})
			};
		},
		buildExpiredResult: ({ cfg, accountId, context, view }) => {
			const resolvedContext = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolvedContext) return { kind: "delete" };
			return {
				kind: "update",
				payload: view.approvalKind === "plugin" ? createPluginExpiredContainer({
					view,
					cfg,
					accountId: resolvedContext.accountId
				}) : createExecExpiredContainer({
					view,
					cfg,
					accountId: resolvedContext.accountId
				})
			};
		}
	},
	transport: {
		prepareTarget: async ({ cfg, accountId, context, plannedTarget }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return null;
			if (plannedTarget.surface === "origin") {
				const destinationId = typeof plannedTarget.target.threadId === "string" && plannedTarget.target.threadId.trim().length > 0 ? plannedTarget.target.threadId.trim() : plannedTarget.target.to;
				return {
					dedupeKey: destinationId,
					target: { discordChannelId: destinationId }
				};
			}
			const { rest, request: discordRequest } = createDiscordClient({
				token: resolved.context.token,
				accountId: resolved.accountId
			}, cfg);
			const userId = plannedTarget.target.to;
			const dmChannel = await discordRequest(() => rest.post(Routes.userChannels(), { body: { recipient_id: userId } }), "dm-channel");
			if (!dmChannel?.id) {
				logError(`discord approvals: failed to create DM for user ${userId}`);
				return null;
			}
			return {
				dedupeKey: dmChannel.id,
				target: {
					discordChannelId: dmChannel.id,
					recipientUserId: userId
				}
			};
		},
		deliverPending: async ({ cfg, accountId, context, plannedTarget, preparedTarget, pendingPayload }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return null;
			const { rest, request: discordRequest } = createDiscordClient({
				token: resolved.context.token,
				accountId: resolved.accountId
			}, cfg);
			const message = await discordRequest(() => rest.post(Routes.channelMessages(preparedTarget.discordChannelId), { body: pendingPayload.body }), plannedTarget.surface === "origin" ? "send-approval-channel" : "send-approval");
			if (!message?.id) {
				if (plannedTarget.surface === "origin") logError("discord approvals: failed to send to channel");
				else if (preparedTarget.recipientUserId) logError(`discord approvals: failed to send message to user ${preparedTarget.recipientUserId}`);
				return null;
			}
			return {
				discordMessageId: message.id,
				discordChannelId: preparedTarget.discordChannelId
			};
		},
		updateEntry: async ({ cfg, accountId, context, entry, payload, phase }) => {
			const resolved = resolveHandlerContext({
				cfg,
				accountId,
				context
			});
			if (!resolved) return;
			const container = payload;
			await finalizeMessage({
				cfg,
				accountId: resolved.accountId,
				token: resolved.context.token,
				cleanupAfterResolve: phase === "resolved" ? resolved.context.config.cleanupAfterResolve : false,
				channelId: entry.discordChannelId,
				messageId: entry.discordMessageId,
				container
			});
		}
	},
	observe: {
		onDuplicateSkipped: ({ preparedTarget, request }) => {
			logDebug(`discord approvals: skipping duplicate approval ${request.id} for channel ${preparedTarget.dedupeKey}`);
		},
		onDelivered: ({ plannedTarget, preparedTarget, request }) => {
			if (plannedTarget.surface === "origin") {
				logDebug(`discord approvals: sent approval ${request.id} to channel ${preparedTarget.target.discordChannelId}`);
				return;
			}
			logDebug(`discord approvals: sent approval ${request.id} to user ${plannedTarget.target.to}`);
		},
		onDeliveryError: ({ error, plannedTarget }) => {
			if (plannedTarget.surface === "origin") {
				logError(`discord approvals: failed to send to channel: ${String(error)}`);
				return;
			}
			logError(`discord approvals: failed to notify user ${plannedTarget.target.to}: ${String(error)}`);
		}
	}
});
//#endregion
export { approval_handler_runtime_exports as t };
