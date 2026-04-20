import { a as resolveSlackAccount, c as resolveSlackBotToken, s as resolveSlackAppToken } from "./accounts-DJiceqJx.js";
import { r as isSlackExecApprovalClientEnabled } from "./exec-approvals-D4uUgK_Y.js";
import { n as isSlackInteractiveRepliesEnabled, t as compileSlackInteractiveReplies } from "./interactive-replies-CK9mrnAH.js";
import { a as truncateSlackText } from "./reply-blocks-DXRUer2P.js";
import { a as resolveSlackWebClientOptions } from "./client-BfPZ6k8d.js";
import { i as normalizeSlackAllowOwnerEntry, n as normalizeAllowList, o as resolveSlackAllowListMatch, s as resolveSlackUserAllowed } from "./allow-list-GR9Gx-es.js";
import { t as SLACK_TEXT_LIMIT } from "./limits-DeULmw1T.js";
import { n as resolveSlackNativeStreaming, r as resolveSlackStreamingMode, t as mapStreamingModeToSlackLegacyDraftStreamMode } from "./streaming-compat-CTCaOncA.js";
import { t as resolveSlackChannelAllowlist } from "./resolve-channels-DpRJc8-4.js";
import { t as resolveSlackUserAllowlist } from "./resolve-users-CEjXgbpN.js";
import { i as buildSlackBlocksFallbackText, r as normalizeSlackOutboundText, t as sendMessageSlack } from "./send-a7txocw9.js";
import { f as removeSlackReaction, l as reactSlackMessage, r as editSlackMessage, t as deleteSlackMessage } from "./actions-uj3tq0FI.js";
import { n as registerSlackHttpHandler, r as normalizeSlackWebhookPath } from "./registry-yFrXekPx.js";
import { r as recordSlackThreadParticipation } from "./sent-thread-cache-Bq-r8qPc.js";
import { C as resolveSlackSlashCommandConfig, S as buildSlackSlashCommandMatcher, _ as resolveDefaultGroupPolicy, a as buildPluginBindingResolvedText, b as updateLastRoute, c as authorizeSlackSystemEventSender, d as isSlackChannelAllowedByPolicy, f as normalizeSlackChannelType, g as loadConfig$1, h as isDangerousNameMatchingEnabled, i as resolveSlackThreadTargets, l as resolveSlackEffectiveAllowFrom, m as resolveSlackChannelLabel, n as resolveSlackRoomContextHints, o as parsePluginBindingApprovalCustomId, p as resolveSlackChannelConfig, r as authorizeSlackDirectMessage, s as resolvePluginConversationBindingApproval, t as prepareSlackMessage, u as createSlackMonitorContext, v as resolveOpenProviderRuntimeGroupPolicy, w as stripSlackMentionsForCommandDetection, x as warnMissingProviderGroupPolicyFallbackOnce, y as resolveStorePath } from "./prepare-DpeqO6Wo.js";
import { a as dispatchInboundMessage, c as resolveTextChunkLimit, r as createReplyDispatcherWithTyping } from "./send.runtime-D3zICEBW.js";
import { a as resolveSlackThreadTs, i as readSlackReplyBlocks, n as deliverReplies, t as createSlackReplyDeliveryPlan } from "./replies-B4oveS5b.js";
import { normalizeResolvedSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { chunkItems, normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString, normalizeOptionalString, normalizeStringEntries } from "openclaw/plugin-sdk/text-runtime";
import { resolveAgentOutboundIdentity } from "openclaw/plugin-sdk/outbound-runtime";
import { normalizeAccountId, normalizeMainKey } from "openclaw/plugin-sdk/routing";
import { CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY } from "openclaw/plugin-sdk/approval-handler-adapter-runtime";
import { enqueueSystemEvent, generateSecureToken } from "openclaw/plugin-sdk/infra-runtime";
import { addAllowlistUserEntriesFromConfigEntry, buildAllowlistResolutionSummary, mergeAllowlist, patchAllowlistUsersInConfigEntries, summarizeMapping } from "openclaw/plugin-sdk/allow-from";
import { createInteractiveConversationBindingHelpers, dispatchPluginInteractiveHandler } from "openclaw/plugin-sdk/plugin-runtime";
import { resolveSendableOutboundReplyParts } from "openclaw/plugin-sdk/reply-payload";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { resolveChannelStreamingBlockEnabled, resolveChannelStreamingNativeTransport } from "openclaw/plugin-sdk/channel-streaming";
import { loadConfig, resolveNativeCommandsEnabled, resolveNativeSkillsEnabled, writeConfigFile } from "openclaw/plugin-sdk/config-runtime";
import { computeBackoff, createNonExitingRuntime, danger, logVerbose, shouldLogVerbose, sleepWithAbort, warn } from "openclaw/plugin-sdk/runtime-env";
import * as SlackBoltNamespace from "@slack/bolt";
import SlackBolt from "@slack/bolt";
import { registerChannelRuntimeContext } from "openclaw/plugin-sdk/channel-runtime-context";
import { createConnectedChannelStatusPatch } from "openclaw/plugin-sdk/gateway-runtime";
import { DEFAULT_GROUP_HISTORY_LIMIT, clearHistoryEntriesIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { installRequestBodyLimitGuard } from "openclaw/plugin-sdk/webhook-request-guards";
import { resolveChannelConfigWrites } from "openclaw/plugin-sdk/channel-config-writes";
import { resolvePinnedMainDmOwnerFromAllowlist } from "openclaw/plugin-sdk/security-runtime";
import { createChannelInboundDebouncer, shouldDebounceTextInbound } from "openclaw/plugin-sdk/channel-inbound";
import { resolveHumanDelayConfig } from "openclaw/plugin-sdk/agent-runtime";
import { DEFAULT_TIMING, createStatusReactionController, logAckFailure, logTypingFailure, removeAckReactionAfterReply } from "openclaw/plugin-sdk/channel-feedback";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { createDraftStreamLoop } from "openclaw/plugin-sdk/channel-lifecycle";
import { listProviderPluginCommandSpecs, resolveCommandAuthorizedFromAuthorizers, resolveNativeCommandSessionTargets } from "openclaw/plugin-sdk/command-auth";
import { pruneMapToMaxSize } from "openclaw/plugin-sdk/collection-runtime";
//#region extensions/slack/src/channel-migration.ts
function resolveAccountChannels(cfg, accountId) {
	if (!accountId) return {};
	const normalized = normalizeAccountId(accountId);
	const accounts = cfg.channels?.slack?.accounts;
	if (!accounts || typeof accounts !== "object") return {};
	const exact = accounts[normalized];
	if (exact?.channels) return { channels: exact.channels };
	const matchKey = Object.keys(accounts).find((key) => normalizeLowercaseStringOrEmpty(key) === normalizeLowercaseStringOrEmpty(normalized));
	return { channels: matchKey ? accounts[matchKey]?.channels : void 0 };
}
function migrateSlackChannelsInPlace(channels, oldChannelId, newChannelId) {
	if (!channels) return {
		migrated: false,
		skippedExisting: false
	};
	if (oldChannelId === newChannelId) return {
		migrated: false,
		skippedExisting: false
	};
	if (!Object.hasOwn(channels, oldChannelId)) return {
		migrated: false,
		skippedExisting: false
	};
	if (Object.hasOwn(channels, newChannelId)) return {
		migrated: false,
		skippedExisting: true
	};
	channels[newChannelId] = channels[oldChannelId];
	delete channels[oldChannelId];
	return {
		migrated: true,
		skippedExisting: false
	};
}
function migrateSlackChannelConfig(params) {
	const scopes = [];
	let migrated = false;
	let skippedExisting = false;
	const accountChannels = resolveAccountChannels(params.cfg, params.accountId).channels;
	if (accountChannels) {
		const result = migrateSlackChannelsInPlace(accountChannels, params.oldChannelId, params.newChannelId);
		if (result.migrated) {
			migrated = true;
			scopes.push("account");
		}
		if (result.skippedExisting) skippedExisting = true;
	}
	const globalChannels = params.cfg.channels?.slack?.channels;
	if (globalChannels) {
		const result = migrateSlackChannelsInPlace(globalChannels, params.oldChannelId, params.newChannelId);
		if (result.migrated) {
			migrated = true;
			scopes.push("global");
		}
		if (result.skippedExisting) skippedExisting = true;
	}
	return {
		migrated,
		skippedExisting,
		scopes
	};
}
//#endregion
//#region extensions/slack/src/monitor/events/channels.ts
function registerSlackChannelEvents(params) {
	const { ctx, trackEvent } = params;
	const enqueueChannelSystemEvent = (params) => {
		if (!ctx.isChannelAllowed({
			channelId: params.channelId,
			channelName: params.channelName,
			channelType: "channel"
		})) return;
		const label = resolveSlackChannelLabel({
			channelId: params.channelId,
			channelName: params.channelName
		});
		const sessionKey = ctx.resolveSlackSystemEventSessionKey({
			channelId: params.channelId,
			channelType: "channel"
		});
		enqueueSystemEvent(`Slack channel ${params.kind}: ${label}.`, {
			sessionKey,
			contextKey: `slack:channel:${params.kind}:${params.channelId ?? params.channelName ?? "unknown"}`
		});
	};
	ctx.app.event("channel_created", async ({ event, body }) => {
		try {
			if (ctx.shouldDropMismatchedSlackEvent(body)) return;
			trackEvent?.();
			const payload = event;
			const channelId = payload.channel?.id;
			const channelName = payload.channel?.name;
			enqueueChannelSystemEvent({
				kind: "created",
				channelId,
				channelName
			});
		} catch (err) {
			ctx.runtime.error?.(danger(`slack channel created handler failed: ${String(err)}`));
		}
	});
	ctx.app.event("channel_rename", async ({ event, body }) => {
		try {
			if (ctx.shouldDropMismatchedSlackEvent(body)) return;
			trackEvent?.();
			const payload = event;
			const channelId = payload.channel?.id;
			enqueueChannelSystemEvent({
				kind: "renamed",
				channelId,
				channelName: payload.channel?.name_normalized ?? payload.channel?.name
			});
		} catch (err) {
			ctx.runtime.error?.(danger(`slack channel rename handler failed: ${String(err)}`));
		}
	});
	ctx.app.event("channel_id_changed", async ({ event, body }) => {
		try {
			if (ctx.shouldDropMismatchedSlackEvent(body)) return;
			trackEvent?.();
			const payload = event;
			const oldChannelId = payload.old_channel_id;
			const newChannelId = payload.new_channel_id;
			if (!oldChannelId || !newChannelId) return;
			const label = resolveSlackChannelLabel({
				channelId: newChannelId,
				channelName: (await ctx.resolveChannelName(newChannelId))?.name
			});
			ctx.runtime.log?.(warn(`[slack] Channel ID changed: ${oldChannelId} → ${newChannelId} (${label})`));
			if (!resolveChannelConfigWrites({
				cfg: ctx.cfg,
				channelId: "slack",
				accountId: ctx.accountId
			})) {
				ctx.runtime.log?.(warn("[slack] Config writes disabled; skipping channel config migration."));
				return;
			}
			const currentConfig = loadConfig();
			const migration = migrateSlackChannelConfig({
				cfg: currentConfig,
				accountId: ctx.accountId,
				oldChannelId,
				newChannelId
			});
			if (migration.migrated) {
				migrateSlackChannelConfig({
					cfg: ctx.cfg,
					accountId: ctx.accountId,
					oldChannelId,
					newChannelId
				});
				await writeConfigFile(currentConfig);
				ctx.runtime.log?.(warn("[slack] Channel config migrated and saved successfully."));
			} else if (migration.skippedExisting) ctx.runtime.log?.(warn(`[slack] Channel config already exists for ${newChannelId}; leaving ${oldChannelId} unchanged`));
			else ctx.runtime.log?.(warn(`[slack] No config found for old channel ID ${oldChannelId}; migration logged only`));
		} catch (err) {
			ctx.runtime.error?.(danger(`slack channel_id_changed handler failed: ${String(err)}`));
		}
	});
}
//#endregion
//#region extensions/slack/src/interactive-dispatch.ts
async function dispatchSlackPluginInteractiveHandler(params) {
	return await dispatchPluginInteractiveHandler({
		channel: "slack",
		data: params.data,
		dedupeId: params.interactionId,
		onMatched: params.onMatched,
		invoke: ({ registration, namespace, payload }) => registration.handler({
			...params.ctx,
			channel: "slack",
			interaction: {
				...params.ctx.interaction,
				data: params.data,
				namespace,
				payload
			},
			respond: params.respond,
			...createInteractiveConversationBindingHelpers({
				registration,
				senderId: params.ctx.senderId,
				conversation: {
					channel: "slack",
					accountId: params.ctx.accountId,
					conversationId: params.ctx.conversationId,
					parentConversationId: params.ctx.parentConversationId,
					threadId: params.ctx.threadId
				}
			})
		})
	});
}
//#endregion
//#region extensions/slack/src/monitor/mrkdwn.ts
function escapeSlackMrkdwn(value) {
	return value.replaceAll("\\", "\\\\").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/([*_`~])/g, "\\$1");
}
//#endregion
//#region extensions/slack/src/monitor/events/interactions.block-actions.ts
function readOptionValues(options) {
	if (!Array.isArray(options)) return;
	const values = options.map((option) => option && typeof option === "object" ? option.value : null).filter((value) => typeof value === "string" && value.trim().length > 0);
	return values.length > 0 ? values : void 0;
}
function readOptionLabels(options) {
	if (!Array.isArray(options)) return;
	const labels = options.map((option) => option && typeof option === "object" ? option.text?.text ?? null : null).filter((label) => typeof label === "string" && label.trim().length > 0);
	return labels.length > 0 ? labels : void 0;
}
function uniqueNonEmptyStrings(values) {
	const unique = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of values) {
		if (typeof entry !== "string") continue;
		const trimmed = entry.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		unique.push(trimmed);
	}
	return unique;
}
function collectRichTextFragments(value, out) {
	if (!value || typeof value !== "object") return;
	const typed = value;
	if (typeof typed.text === "string" && typed.text.trim().length > 0) out.push(typed.text.trim());
	if (Array.isArray(typed.elements)) for (const child of typed.elements) collectRichTextFragments(child, out);
}
function summarizeRichTextPreview(value) {
	const fragments = [];
	collectRichTextFragments(value, fragments);
	if (fragments.length === 0) return;
	const joined = fragments.join(" ").replace(/\s+/g, " ").trim();
	if (!joined) return;
	const max = 120;
	return joined.length <= max ? joined : `${joined.slice(0, max - 1)}…`;
}
function readInteractionAction(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	return raw;
}
function summarizeAction(action) {
	const typed = action;
	const actionType = typed.type;
	const selectedUsers = uniqueNonEmptyStrings([...typed.selected_user ? [typed.selected_user] : [], ...Array.isArray(typed.selected_users) ? typed.selected_users : []]);
	const selectedChannels = uniqueNonEmptyStrings([...typed.selected_channel ? [typed.selected_channel] : [], ...Array.isArray(typed.selected_channels) ? typed.selected_channels : []]);
	const selectedConversations = uniqueNonEmptyStrings([...typed.selected_conversation ? [typed.selected_conversation] : [], ...Array.isArray(typed.selected_conversations) ? typed.selected_conversations : []]);
	const selectedValues = uniqueNonEmptyStrings([
		...typed.selected_option?.value ? [typed.selected_option.value] : [],
		...readOptionValues(typed.selected_options) ?? [],
		...selectedUsers,
		...selectedChannels,
		...selectedConversations
	]);
	const selectedLabels = uniqueNonEmptyStrings([...typed.selected_option?.text?.text ? [typed.selected_option.text.text] : [], ...readOptionLabels(typed.selected_options) ?? []]);
	const inputValue = typeof typed.value === "string" ? typed.value : void 0;
	const inputNumber = actionType === "number_input" && inputValue != null ? Number.parseFloat(inputValue) : void 0;
	const parsedNumber = Number.isFinite(inputNumber) ? inputNumber : void 0;
	const inputEmail = actionType === "email_text_input" && inputValue?.includes("@") ? inputValue : void 0;
	let inputUrl;
	if (actionType === "url_text_input" && inputValue) try {
		inputUrl = new URL(inputValue).toString();
	} catch {
		inputUrl = void 0;
	}
	const richTextValue = actionType === "rich_text_input" ? typed.rich_text_value : void 0;
	const richTextPreview = summarizeRichTextPreview(richTextValue);
	return {
		actionType,
		inputKind: actionType === "number_input" ? "number" : actionType === "email_text_input" ? "email" : actionType === "url_text_input" ? "url" : actionType === "rich_text_input" ? "rich_text" : inputValue != null ? "text" : void 0,
		value: typed.value,
		selectedValues: selectedValues.length > 0 ? selectedValues : void 0,
		selectedUsers: selectedUsers.length > 0 ? selectedUsers : void 0,
		selectedChannels: selectedChannels.length > 0 ? selectedChannels : void 0,
		selectedConversations: selectedConversations.length > 0 ? selectedConversations : void 0,
		selectedLabels: selectedLabels.length > 0 ? selectedLabels : void 0,
		selectedDate: typed.selected_date,
		selectedTime: typed.selected_time,
		selectedDateTime: typeof typed.selected_date_time === "number" ? typed.selected_date_time : void 0,
		inputValue,
		inputNumber: parsedNumber,
		inputEmail,
		inputUrl,
		richTextValue,
		richTextPreview,
		workflowTriggerUrl: typed.workflow?.trigger_url,
		workflowId: typed.workflow?.workflow_id
	};
}
function isBulkActionsBlock(block) {
	return block.type === "actions" && Array.isArray(block.elements) && block.elements.length > 0 && block.elements.every((el) => typeof el.action_id === "string" && el.action_id.includes("_all_"));
}
function formatInteractionSelectionLabel(params) {
	if (params.summary.actionType === "button" && params.buttonText?.trim()) return params.buttonText.trim();
	if (params.summary.selectedLabels?.length) {
		if (params.summary.selectedLabels.length <= 3) return params.summary.selectedLabels.join(", ");
		return `${params.summary.selectedLabels.slice(0, 3).join(", ")} +${params.summary.selectedLabels.length - 3}`;
	}
	if (params.summary.selectedValues?.length) {
		if (params.summary.selectedValues.length <= 3) return params.summary.selectedValues.join(", ");
		return `${params.summary.selectedValues.slice(0, 3).join(", ")} +${params.summary.selectedValues.length - 3}`;
	}
	if (params.summary.selectedDate) return params.summary.selectedDate;
	if (params.summary.selectedTime) return params.summary.selectedTime;
	if (typeof params.summary.selectedDateTime === "number") return (/* @__PURE__ */ new Date(params.summary.selectedDateTime * 1e3)).toISOString();
	if (params.summary.richTextPreview) return params.summary.richTextPreview;
	if (params.summary.value?.trim()) return params.summary.value.trim();
	return params.actionId;
}
function formatInteractionConfirmationText(params) {
	const userId = normalizeOptionalString(params.userId);
	const actor = userId ? ` by <@${userId}>` : "";
	return `:white_check_mark: *${escapeSlackMrkdwn(params.selectedLabel)}* selected${actor}`;
}
function buildSlackPluginInteractionData(params) {
	const actionId = normalizeOptionalString(params.actionId) ?? "";
	if (!actionId) return null;
	const payload = normalizeOptionalString(params.summary.value) || params.summary.selectedValues?.map((value) => normalizeOptionalString(value)).find(Boolean) || "";
	if (actionId === "openclaw:reply_button" || actionId === "openclaw:reply_select" || actionId.startsWith(`openclaw:reply_button:`) || actionId.startsWith(`openclaw:reply_select:`)) return payload || null;
	return payload ? `${actionId}:${payload}` : actionId;
}
function isSlackReplyActionId(actionId) {
	return actionId === "openclaw:reply_button" || actionId === "openclaw:reply_select" || actionId.startsWith(`openclaw:reply_button:`) || actionId.startsWith(`openclaw:reply_select:`);
}
function buildSlackPluginInteractionId(params) {
	const primaryValue = normalizeOptionalString(params.summary.value) || params.summary.selectedValues?.map((value) => normalizeOptionalString(value)).find(Boolean) || "";
	return [
		normalizeOptionalString(params.userId) ?? "",
		normalizeOptionalString(params.channelId) ?? "",
		normalizeOptionalString(params.messageTs) ?? "",
		normalizeOptionalString(params.triggerId) ?? "",
		normalizeOptionalString(params.actionId) ?? "",
		primaryValue
	].join(":");
}
function parseSlackBlockAction(params) {
	const typedBody = params.body;
	const typedAction = readInteractionAction(params.action);
	if (!typedAction) {
		params.log?.(`slack:interaction malformed action payload channel=${typedBody.channel?.id ?? typedBody.container?.channel_id ?? "unknown"} user=${typedBody.user?.id ?? "unknown"}`);
		return null;
	}
	const typedActionWithText = typedAction;
	return {
		typedBody,
		typedAction,
		typedActionWithText,
		actionId: typeof typedActionWithText.action_id === "string" ? typedActionWithText.action_id : "unknown",
		blockId: typedActionWithText.block_id,
		userId: typedBody.user?.id ?? "unknown",
		channelId: typedBody.channel?.id ?? typedBody.container?.channel_id,
		messageTs: typedBody.message?.ts ?? typedBody.container?.message_ts,
		threadTs: typedBody.container?.thread_ts,
		actionSummary: summarizeAction(typedAction)
	};
}
async function respondEphemeral(respond, text) {
	if (!respond) return;
	try {
		await respond({
			text,
			response_type: "ephemeral"
		});
	} catch {}
}
async function updateSlackInteractionMessage(params) {
	if (!params.channelId || !params.messageTs) return;
	await params.ctx.app.client.chat.update({
		channel: params.channelId,
		ts: params.messageTs,
		text: params.text,
		...params.blocks ? { blocks: params.blocks } : {}
	});
}
async function authorizeSlackBlockAction(params) {
	const auth = await authorizeSlackSystemEventSender({
		ctx: params.ctx,
		senderId: params.parsed.userId,
		channelId: params.parsed.channelId,
		expectedSenderId: params.parsed.userId,
		interactiveEvent: true
	});
	if (auth.allowed) return auth;
	params.ctx.runtime.log?.(`slack:interaction drop action=${params.parsed.actionId} user=${params.parsed.userId} channel=${params.parsed.channelId ?? "unknown"} reason=${auth.reason ?? "unauthorized"}`);
	await respondEphemeral(params.respond, "You are not authorized to use this control.");
	return { allowed: false };
}
async function handleSlackPluginBindingApproval(params) {
	const pluginBindingApproval = parsePluginBindingApprovalCustomId(params.pluginInteractionData);
	if (!pluginBindingApproval) return false;
	const resolved = await resolvePluginConversationBindingApproval({
		approvalId: pluginBindingApproval.approvalId,
		decision: pluginBindingApproval.decision,
		senderId: params.parsed.userId
	});
	try {
		await updateSlackInteractionMessage({
			ctx: params.ctx,
			channelId: params.parsed.channelId,
			messageTs: params.parsed.messageTs,
			text: params.parsed.typedBody.message?.text ?? "",
			blocks: []
		});
	} catch {}
	await respondEphemeral(params.respond, buildPluginBindingResolvedText(resolved));
	return true;
}
async function dispatchSlackPluginInteraction(params) {
	const pluginInteractionId = buildSlackPluginInteractionId({
		userId: params.parsed.userId,
		channelId: params.parsed.channelId,
		messageTs: params.parsed.messageTs,
		triggerId: params.parsed.typedBody.trigger_id,
		actionId: params.parsed.actionId,
		summary: params.parsed.actionSummary
	});
	if (await handleSlackPluginBindingApproval({
		ctx: params.ctx,
		parsed: params.parsed,
		pluginInteractionData: params.pluginInteractionData,
		respond: params.respond
	})) return true;
	const pluginResult = await dispatchSlackPluginInteractiveHandler({
		data: params.pluginInteractionData,
		interactionId: pluginInteractionId,
		ctx: {
			accountId: params.ctx.accountId,
			interactionId: pluginInteractionId,
			conversationId: params.parsed.channelId ?? "",
			parentConversationId: void 0,
			threadId: params.parsed.threadTs,
			senderId: params.parsed.userId,
			senderUsername: void 0,
			auth: params.auth,
			interaction: {
				kind: params.parsed.actionSummary.actionType === "button" ? "button" : "select",
				actionId: params.parsed.actionId,
				blockId: params.parsed.blockId,
				messageTs: params.parsed.messageTs,
				threadTs: params.parsed.threadTs,
				value: params.parsed.actionSummary.value,
				selectedValues: params.parsed.actionSummary.selectedValues,
				selectedLabels: params.parsed.actionSummary.selectedLabels,
				triggerId: params.parsed.typedBody.trigger_id,
				responseUrl: params.parsed.typedBody.response_url
			}
		},
		respond: {
			acknowledge: async () => {},
			reply: async ({ text, responseType }) => {
				if (!text) return;
				await params.respond?.({
					text,
					response_type: responseType ?? "ephemeral"
				});
			},
			followUp: async ({ text, responseType }) => {
				if (!text) return;
				await params.respond?.({
					text,
					response_type: responseType ?? "ephemeral"
				});
			},
			editMessage: async ({ text, blocks }) => {
				await updateSlackInteractionMessage({
					ctx: params.ctx,
					channelId: params.parsed.channelId,
					messageTs: params.parsed.messageTs,
					text: text ?? params.parsed.typedBody.message?.text ?? "",
					blocks: Array.isArray(blocks) ? blocks : void 0
				});
			}
		}
	});
	return pluginResult.matched && pluginResult.handled;
}
function enqueueSlackBlockActionEvent(params) {
	const eventPayload = {
		interactionType: "block_action",
		actionId: params.parsed.actionId,
		blockId: params.parsed.blockId,
		...params.parsed.actionSummary,
		userId: params.parsed.userId,
		teamId: params.parsed.typedBody.team?.id,
		triggerId: params.parsed.typedBody.trigger_id,
		responseUrl: params.parsed.typedBody.response_url,
		channelId: params.parsed.channelId,
		messageTs: params.parsed.messageTs,
		threadTs: params.parsed.threadTs
	};
	params.ctx.runtime.log?.(`slack:interaction action=${params.parsed.actionId} type=${params.parsed.actionSummary.actionType ?? "unknown"} user=${params.parsed.userId} channel=${params.parsed.channelId}`);
	const sessionKey = params.ctx.resolveSlackSystemEventSessionKey({
		channelId: params.parsed.channelId,
		channelType: params.auth.channelType,
		senderId: params.parsed.userId
	});
	const contextParts = [
		"slack:interaction",
		params.parsed.channelId,
		params.parsed.messageTs,
		params.parsed.actionId
	].filter(Boolean);
	enqueueSystemEvent(params.formatSystemEvent(eventPayload), {
		sessionKey,
		contextKey: contextParts.join(":")
	});
}
function buildSlackConfirmationBlocks(params) {
	const selectedLabel = formatInteractionSelectionLabel({
		actionId: params.parsed.actionId,
		summary: params.parsed.actionSummary,
		buttonText: params.parsed.typedActionWithText.text?.text
	});
	let updatedBlocks = params.originalBlocks.map((block) => {
		const typedBlock = block;
		if (typedBlock.type === "actions" && typedBlock.block_id === params.parsed.blockId) return {
			type: "context",
			elements: [{
				type: "mrkdwn",
				text: formatInteractionConfirmationText({
					selectedLabel,
					userId: params.parsed.userId
				})
			}]
		};
		return block;
	});
	if (!updatedBlocks.some((block) => {
		const typedBlock = block;
		return typedBlock.type === "actions" && !isBulkActionsBlock(typedBlock);
	})) updatedBlocks = updatedBlocks.filter((block, index) => {
		const typedBlock = block;
		if (isBulkActionsBlock(typedBlock)) return false;
		if (typedBlock.type !== "divider") return true;
		const next = updatedBlocks[index + 1];
		return !next || !isBulkActionsBlock(next);
	});
	return updatedBlocks;
}
async function updateSlackLegacyBlockAction(params) {
	const originalBlocks = params.parsed.typedBody.message?.blocks;
	if (!Array.isArray(originalBlocks) || !params.parsed.channelId || !params.parsed.messageTs || !params.parsed.blockId) return;
	try {
		await updateSlackInteractionMessage({
			ctx: params.ctx,
			channelId: params.parsed.channelId,
			messageTs: params.parsed.messageTs,
			text: params.parsed.typedBody.message?.text ?? "",
			blocks: buildSlackConfirmationBlocks({
				parsed: params.parsed,
				originalBlocks
			})
		});
	} catch {
		await respondEphemeral(params.respond, `Button "${params.parsed.actionId}" clicked!`);
	}
}
async function handleSlackBlockAction(params) {
	const { ack, body, action, respond } = params.args;
	await ack();
	if (params.ctx.shouldDropMismatchedSlackEvent?.(body)) {
		params.ctx.runtime.log?.("slack:interaction drop block action payload (mismatched app/team)");
		return;
	}
	const parsed = parseSlackBlockAction({
		body,
		action,
		log: params.ctx.runtime.log
	});
	if (!parsed) return;
	const auth = await authorizeSlackBlockAction({
		ctx: params.ctx,
		parsed,
		respond
	});
	if (!auth.allowed) return;
	const pluginInteractionData = buildSlackPluginInteractionData({
		actionId: parsed.actionId,
		summary: parsed.actionSummary
	});
	if (pluginInteractionData && isSlackReplyActionId(parsed.actionId)) {
		if (await handleSlackPluginBindingApproval({
			ctx: params.ctx,
			parsed,
			pluginInteractionData,
			respond
		})) return;
	} else if (pluginInteractionData) {
		if (await dispatchSlackPluginInteraction({
			ctx: params.ctx,
			parsed,
			pluginInteractionData,
			auth: { isAuthorizedSender: true },
			respond
		})) return;
	}
	enqueueSlackBlockActionEvent({
		ctx: params.ctx,
		parsed,
		auth,
		formatSystemEvent: params.formatSystemEvent
	});
	await updateSlackLegacyBlockAction({
		ctx: params.ctx,
		parsed,
		respond
	});
}
function registerSlackBlockActionHandler(params) {
	if (typeof params.ctx.app.action !== "function") return;
	params.ctx.app.action(/.+/, async (args) => {
		await handleSlackBlockAction({
			ctx: params.ctx,
			args,
			formatSystemEvent: params.formatSystemEvent
		});
	});
}
//#endregion
//#region extensions/slack/src/modal-metadata.ts
function parseSlackModalPrivateMetadata(raw) {
	if (typeof raw !== "string" || raw.trim().length === 0) return {};
	try {
		const parsed = JSON.parse(raw);
		return {
			sessionKey: normalizeOptionalString(parsed.sessionKey),
			channelId: normalizeOptionalString(parsed.channelId),
			channelType: normalizeOptionalString(parsed.channelType),
			userId: normalizeOptionalString(parsed.userId)
		};
	} catch {
		return {};
	}
}
//#endregion
//#region extensions/slack/src/monitor/events/interactions.modal.ts
function resolveModalSessionRouting(params) {
	const metadata = params.metadata;
	if (metadata.sessionKey) return {
		sessionKey: metadata.sessionKey,
		channelId: metadata.channelId,
		channelType: metadata.channelType
	};
	if (metadata.channelId) return {
		sessionKey: params.ctx.resolveSlackSystemEventSessionKey({
			channelId: metadata.channelId,
			channelType: metadata.channelType,
			senderId: params.userId
		}),
		channelId: metadata.channelId,
		channelType: metadata.channelType
	};
	return { sessionKey: params.ctx.resolveSlackSystemEventSessionKey({}) };
}
function summarizeSlackViewLifecycleContext(view) {
	const rootViewId = view.root_view_id;
	const previousViewId = view.previous_view_id;
	return {
		rootViewId,
		previousViewId,
		externalId: view.external_id,
		viewHash: view.hash,
		isStackedView: Boolean(previousViewId)
	};
}
function resolveSlackModalEventBase(params) {
	const metadata = parseSlackModalPrivateMetadata(params.body.view?.private_metadata);
	const callbackId = params.body.view?.callback_id ?? "unknown";
	const userId = params.body.user?.id ?? "unknown";
	const viewId = params.body.view?.id;
	const inputs = params.summarizeViewState(params.body.view?.state?.values);
	const sessionRouting = resolveModalSessionRouting({
		ctx: params.ctx,
		metadata,
		userId
	});
	return {
		callbackId,
		userId,
		expectedUserId: metadata.userId,
		viewId,
		sessionRouting,
		payload: {
			actionId: `view:${callbackId}`,
			callbackId,
			viewId,
			userId,
			teamId: params.body.team?.id,
			...summarizeSlackViewLifecycleContext({
				root_view_id: params.body.view?.root_view_id,
				previous_view_id: params.body.view?.previous_view_id,
				external_id: params.body.view?.external_id,
				hash: params.body.view?.hash
			}),
			privateMetadata: params.body.view?.private_metadata,
			routedChannelId: sessionRouting.channelId,
			routedChannelType: sessionRouting.channelType,
			inputs
		}
	};
}
async function emitSlackModalLifecycleEvent(params) {
	const { callbackId, userId, expectedUserId, viewId, sessionRouting, payload } = resolveSlackModalEventBase({
		ctx: params.ctx,
		body: params.body,
		summarizeViewState: params.summarizeViewState
	});
	const isViewClosed = params.interactionType === "view_closed";
	const isCleared = params.body.is_cleared === true;
	const eventPayload = isViewClosed ? {
		interactionType: params.interactionType,
		...payload,
		isCleared
	} : {
		interactionType: params.interactionType,
		...payload
	};
	if (isViewClosed) params.ctx.runtime.log?.(`slack:interaction view_closed callback=${callbackId} user=${userId} cleared=${isCleared}`);
	else params.ctx.runtime.log?.(`slack:interaction view_submission callback=${callbackId} user=${userId} inputs=${payload.inputs.length}`);
	if (!expectedUserId) {
		params.ctx.runtime.log?.(`slack:interaction drop modal callback=${callbackId} user=${userId} reason=missing-expected-user`);
		return;
	}
	const auth = await authorizeSlackSystemEventSender({
		ctx: params.ctx,
		senderId: userId,
		channelId: sessionRouting.channelId,
		channelType: sessionRouting.channelType,
		expectedSenderId: expectedUserId,
		interactiveEvent: true
	});
	if (!auth.allowed) {
		params.ctx.runtime.log?.(`slack:interaction drop modal callback=${callbackId} user=${userId} reason=${auth.reason ?? "unauthorized"}`);
		return;
	}
	enqueueSystemEvent(params.formatSystemEvent(eventPayload), {
		sessionKey: sessionRouting.sessionKey,
		contextKey: [
			params.contextPrefix,
			callbackId,
			viewId,
			userId
		].filter(Boolean).join(":")
	});
}
function registerModalLifecycleHandler(params) {
	params.register(params.matcher, async ({ ack, body }) => {
		await ack();
		if (params.ctx.shouldDropMismatchedSlackEvent?.(body)) {
			params.ctx.runtime.log?.(`slack:interaction drop ${params.interactionType} payload (mismatched app/team)`);
			return;
		}
		await emitSlackModalLifecycleEvent({
			ctx: params.ctx,
			body,
			interactionType: params.interactionType,
			contextPrefix: params.contextPrefix,
			summarizeViewState: params.summarizeViewState,
			formatSystemEvent: params.formatSystemEvent
		});
	});
}
//#endregion
//#region extensions/slack/src/monitor/events/interactions.ts
const OPENCLAW_ACTION_PREFIX = "openclaw:";
const SLACK_INTERACTION_EVENT_PREFIX = "Slack interaction: ";
const REDACTED_INTERACTION_VALUE = "[redacted]";
const SLACK_INTERACTION_EVENT_MAX_CHARS = 2400;
const SLACK_INTERACTION_STRING_MAX_CHARS = 160;
const SLACK_INTERACTION_ARRAY_MAX_ITEMS = 64;
const SLACK_INTERACTION_COMPACT_INPUTS_MAX_ITEMS = 3;
const SLACK_INTERACTION_REDACTED_KEYS = new Set([
	"triggerId",
	"responseUrl",
	"workflowTriggerUrl",
	"privateMetadata",
	"viewHash"
]);
function sanitizeSlackInteractionPayloadValue(value, key) {
	if (value === void 0) return;
	if (key && SLACK_INTERACTION_REDACTED_KEYS.has(key)) {
		if (typeof value !== "string" || value.trim().length === 0) return;
		return REDACTED_INTERACTION_VALUE;
	}
	if (typeof value === "string") return truncateSlackText(value, SLACK_INTERACTION_STRING_MAX_CHARS);
	if (Array.isArray(value)) {
		const sanitized = value.slice(0, SLACK_INTERACTION_ARRAY_MAX_ITEMS).map((entry) => sanitizeSlackInteractionPayloadValue(entry)).filter((entry) => entry !== void 0);
		if (value.length > SLACK_INTERACTION_ARRAY_MAX_ITEMS) sanitized.push(`…+${value.length - SLACK_INTERACTION_ARRAY_MAX_ITEMS} more`);
		return sanitized;
	}
	if (!value || typeof value !== "object") return value;
	const output = {};
	for (const [entryKey, entryValue] of Object.entries(value)) {
		const sanitized = sanitizeSlackInteractionPayloadValue(entryValue, entryKey);
		if (sanitized === void 0) continue;
		if (typeof sanitized === "string" && sanitized.length === 0) continue;
		if (Array.isArray(sanitized) && sanitized.length === 0) continue;
		output[entryKey] = sanitized;
	}
	return output;
}
function buildCompactSlackInteractionPayload(payload) {
	const rawInputs = Array.isArray(payload.inputs) ? payload.inputs : [];
	const compactInputs = rawInputs.slice(0, SLACK_INTERACTION_COMPACT_INPUTS_MAX_ITEMS).flatMap((entry) => {
		if (!entry || typeof entry !== "object") return [];
		const typed = entry;
		return [{
			actionId: typed.actionId,
			blockId: typed.blockId,
			actionType: typed.actionType,
			inputKind: typed.inputKind,
			selectedValues: typed.selectedValues,
			selectedLabels: typed.selectedLabels,
			inputValue: typed.inputValue,
			inputNumber: typed.inputNumber,
			selectedDate: typed.selectedDate,
			selectedTime: typed.selectedTime,
			selectedDateTime: typed.selectedDateTime,
			richTextPreview: typed.richTextPreview
		}];
	});
	return {
		interactionType: payload.interactionType,
		actionId: payload.actionId,
		callbackId: payload.callbackId,
		actionType: payload.actionType,
		userId: payload.userId,
		teamId: payload.teamId,
		channelId: payload.channelId ?? payload.routedChannelId,
		messageTs: payload.messageTs,
		threadTs: payload.threadTs,
		viewId: payload.viewId,
		isCleared: payload.isCleared,
		selectedValues: payload.selectedValues,
		selectedLabels: payload.selectedLabels,
		selectedDate: payload.selectedDate,
		selectedTime: payload.selectedTime,
		selectedDateTime: payload.selectedDateTime,
		workflowId: payload.workflowId,
		routedChannelType: payload.routedChannelType,
		inputs: compactInputs.length > 0 ? compactInputs : void 0,
		inputsOmitted: rawInputs.length > SLACK_INTERACTION_COMPACT_INPUTS_MAX_ITEMS ? rawInputs.length - SLACK_INTERACTION_COMPACT_INPUTS_MAX_ITEMS : void 0,
		payloadTruncated: true
	};
}
function formatSlackInteractionSystemEvent(payload) {
	const toEventText = (value) => `${SLACK_INTERACTION_EVENT_PREFIX}${JSON.stringify(value)}`;
	const sanitizedPayload = sanitizeSlackInteractionPayloadValue(payload) ?? {};
	let eventText = toEventText(sanitizedPayload);
	if (eventText.length <= SLACK_INTERACTION_EVENT_MAX_CHARS) return eventText;
	eventText = toEventText(sanitizeSlackInteractionPayloadValue(buildCompactSlackInteractionPayload(sanitizedPayload)));
	if (eventText.length <= SLACK_INTERACTION_EVENT_MAX_CHARS) return eventText;
	return toEventText({
		interactionType: sanitizedPayload.interactionType,
		actionId: sanitizedPayload.actionId ?? "unknown",
		userId: sanitizedPayload.userId,
		channelId: sanitizedPayload.channelId ?? sanitizedPayload.routedChannelId,
		payloadTruncated: true
	});
}
function summarizeViewState(values) {
	if (!values || typeof values !== "object") return [];
	const entries = [];
	for (const [blockId, blockValue] of Object.entries(values)) {
		if (!blockValue || typeof blockValue !== "object") continue;
		for (const [actionId, rawAction] of Object.entries(blockValue)) {
			if (!rawAction || typeof rawAction !== "object") continue;
			const actionSummary = summarizeAction(rawAction);
			entries.push({
				blockId,
				actionId,
				...actionSummary
			});
		}
	}
	return entries;
}
function registerSlackInteractionEvents(params) {
	const { ctx } = params;
	registerSlackBlockActionHandler({
		ctx,
		formatSystemEvent: formatSlackInteractionSystemEvent
	});
	if (typeof ctx.app.view !== "function") return;
	const modalMatcher = new RegExp(`^${OPENCLAW_ACTION_PREFIX}`);
	registerModalLifecycleHandler({
		register: (matcher, handler) => ctx.app.view(matcher, handler),
		matcher: modalMatcher,
		ctx,
		interactionType: "view_submission",
		contextPrefix: "slack:interaction:view",
		summarizeViewState,
		formatSystemEvent: formatSlackInteractionSystemEvent
	});
	const viewClosed = ctx.app.viewClosed;
	if (typeof viewClosed !== "function") return;
	registerModalLifecycleHandler({
		register: viewClosed,
		matcher: modalMatcher,
		ctx,
		interactionType: "view_closed",
		contextPrefix: "slack:interaction:view-closed",
		summarizeViewState,
		formatSystemEvent: formatSlackInteractionSystemEvent
	});
}
//#endregion
//#region extensions/slack/src/monitor/events/system-event-context.ts
async function authorizeAndResolveSlackSystemEventContext(params) {
	const { ctx, senderId, channelId, channelType, eventKind } = params;
	const auth = await authorizeSlackSystemEventSender({
		ctx,
		senderId,
		channelId,
		channelType
	});
	if (!auth.allowed) {
		logVerbose(`slack: drop ${eventKind} sender ${senderId ?? "unknown"} channel=${channelId ?? "unknown"} reason=${auth.reason ?? "unauthorized"}`);
		return;
	}
	return {
		channelLabel: resolveSlackChannelLabel({
			channelId,
			channelName: auth.channelName
		}),
		sessionKey: ctx.resolveSlackSystemEventSessionKey({
			channelId,
			channelType: auth.channelType,
			senderId
		})
	};
}
//#endregion
//#region extensions/slack/src/monitor/events/members.ts
function registerSlackMemberEvents(params) {
	const { ctx, trackEvent } = params;
	const handleMemberChannelEvent = async (params) => {
		try {
			if (ctx.shouldDropMismatchedSlackEvent(params.body)) return;
			trackEvent?.();
			const payload = params.event;
			const channelId = payload.channel;
			const channelInfo = channelId ? await ctx.resolveChannelName(channelId) : {};
			const channelType = payload.channel_type ?? channelInfo?.type;
			const ingressContext = await authorizeAndResolveSlackSystemEventContext({
				ctx,
				senderId: payload.user,
				channelId,
				channelType,
				eventKind: `member-${params.verb}`
			});
			if (!ingressContext) return;
			enqueueSystemEvent(`Slack: ${(payload.user ? await ctx.resolveUserName(payload.user) : {})?.name ?? payload.user ?? "someone"} ${params.verb} ${ingressContext.channelLabel}.`, {
				sessionKey: ingressContext.sessionKey,
				contextKey: `slack:member:${params.verb}:${channelId ?? "unknown"}:${payload.user ?? "unknown"}`
			});
		} catch (err) {
			ctx.runtime.error?.(danger(`slack ${params.verb} handler failed: ${String(err)}`));
		}
	};
	ctx.app.event("member_joined_channel", async ({ event, body }) => {
		await handleMemberChannelEvent({
			verb: "joined",
			event,
			body
		});
	});
	ctx.app.event("member_left_channel", async ({ event, body }) => {
		await handleMemberChannelEvent({
			verb: "left",
			event,
			body
		});
	});
}
//#endregion
//#region extensions/slack/src/monitor/events/message-subtype-handlers.ts
const SUBTYPE_HANDLER_REGISTRY = {
	message_changed: {
		subtype: "message_changed",
		eventKind: "message_changed",
		describe: (channelLabel) => `Slack message edited in ${channelLabel}.`,
		contextKey: (event) => {
			const changed = event;
			return `slack:message:changed:${changed.channel ?? "unknown"}:${changed.message?.ts ?? changed.previous_message?.ts ?? changed.event_ts ?? "unknown"}`;
		},
		resolveSenderId: (event) => {
			const changed = event;
			return changed.message?.user ?? changed.previous_message?.user ?? changed.message?.bot_id ?? changed.previous_message?.bot_id;
		},
		resolveChannelId: (event) => event.channel,
		resolveChannelType: () => void 0
	},
	message_deleted: {
		subtype: "message_deleted",
		eventKind: "message_deleted",
		describe: (channelLabel) => `Slack message deleted in ${channelLabel}.`,
		contextKey: (event) => {
			const deleted = event;
			return `slack:message:deleted:${deleted.channel ?? "unknown"}:${deleted.deleted_ts ?? deleted.event_ts ?? "unknown"}`;
		},
		resolveSenderId: (event) => {
			const deleted = event;
			return deleted.previous_message?.user ?? deleted.previous_message?.bot_id;
		},
		resolveChannelId: (event) => event.channel,
		resolveChannelType: () => void 0
	},
	thread_broadcast: {
		subtype: "thread_broadcast",
		eventKind: "thread_broadcast",
		describe: (channelLabel) => `Slack thread reply broadcast in ${channelLabel}.`,
		contextKey: (event) => {
			const thread = event;
			return `slack:thread:broadcast:${thread.channel ?? "unknown"}:${thread.message?.ts ?? thread.event_ts ?? "unknown"}`;
		},
		resolveSenderId: (event) => {
			const thread = event;
			return thread.user ?? thread.message?.user ?? thread.message?.bot_id;
		},
		resolveChannelId: (event) => event.channel,
		resolveChannelType: () => void 0
	}
};
function resolveSlackMessageSubtypeHandler(event) {
	const subtype = event.subtype;
	if (subtype !== "message_changed" && subtype !== "message_deleted" && subtype !== "thread_broadcast") return;
	return SUBTYPE_HANDLER_REGISTRY[subtype];
}
//#endregion
//#region extensions/slack/src/monitor/events/messages.ts
function registerSlackMessageEvents(params) {
	const { ctx, handleSlackMessage } = params;
	const handleIncomingMessageEvent = async ({ event, body }) => {
		try {
			if (ctx.shouldDropMismatchedSlackEvent(body)) return;
			const message = event;
			const subtypeHandler = resolveSlackMessageSubtypeHandler(message);
			if (subtypeHandler) {
				const channelId = subtypeHandler.resolveChannelId(message);
				const ingressContext = await authorizeAndResolveSlackSystemEventContext({
					ctx,
					senderId: subtypeHandler.resolveSenderId(message),
					channelId,
					channelType: subtypeHandler.resolveChannelType(message),
					eventKind: subtypeHandler.eventKind
				});
				if (!ingressContext) return;
				enqueueSystemEvent(subtypeHandler.describe(ingressContext.channelLabel), {
					sessionKey: ingressContext.sessionKey,
					contextKey: subtypeHandler.contextKey(message)
				});
				return;
			}
			await handleSlackMessage(message, { source: "message" });
		} catch (err) {
			ctx.runtime.error?.(danger(`slack handler failed: ${String(err)}`));
		}
	};
	ctx.app.event("message", async ({ event, body }) => {
		await handleIncomingMessageEvent({
			event,
			body
		});
	});
	ctx.app.event("app_mention", async ({ event, body }) => {
		try {
			if (ctx.shouldDropMismatchedSlackEvent(body)) return;
			const mention = event;
			const channelType = normalizeSlackChannelType(mention.channel_type, mention.channel);
			if (channelType === "im" || channelType === "mpim") return;
			await handleSlackMessage(mention, {
				source: "app_mention",
				wasMentioned: true
			});
		} catch (err) {
			ctx.runtime.error?.(danger(`slack mention handler failed: ${String(err)}`));
		}
	});
}
//#endregion
//#region extensions/slack/src/monitor/events/pins.ts
async function handleSlackPinEvent(params) {
	const { ctx, trackEvent, body, event, action, contextKeySuffix, errorLabel } = params;
	try {
		if (ctx.shouldDropMismatchedSlackEvent(body)) return;
		trackEvent?.();
		const payload = event;
		const channelId = payload.channel_id;
		const ingressContext = await authorizeAndResolveSlackSystemEventContext({
			ctx,
			senderId: payload.user,
			channelId,
			eventKind: "pin"
		});
		if (!ingressContext) return;
		const userLabel = (payload.user ? await ctx.resolveUserName(payload.user) : {})?.name ?? payload.user ?? "someone";
		const itemType = payload.item?.type ?? "item";
		const messageId = payload.item?.message?.ts ?? payload.event_ts;
		enqueueSystemEvent(`Slack: ${userLabel} ${action} a ${itemType} in ${ingressContext.channelLabel}.`, {
			sessionKey: ingressContext.sessionKey,
			contextKey: `slack:pin:${contextKeySuffix}:${channelId ?? "unknown"}:${messageId ?? "unknown"}`
		});
	} catch (err) {
		ctx.runtime.error?.(danger(`slack ${errorLabel} handler failed: ${String(err)}`));
	}
}
function registerSlackPinEvents(params) {
	const { ctx, trackEvent } = params;
	ctx.app.event("pin_added", async ({ event, body }) => {
		await handleSlackPinEvent({
			ctx,
			trackEvent,
			body,
			event,
			action: "pinned",
			contextKeySuffix: "added",
			errorLabel: "pin added"
		});
	});
	ctx.app.event("pin_removed", async ({ event, body }) => {
		await handleSlackPinEvent({
			ctx,
			trackEvent,
			body,
			event,
			action: "unpinned",
			contextKeySuffix: "removed",
			errorLabel: "pin removed"
		});
	});
}
//#endregion
//#region extensions/slack/src/monitor/events/reactions.ts
function registerSlackReactionEvents(params) {
	const { ctx, trackEvent } = params;
	const handleReactionEvent = async (event, action) => {
		try {
			const item = event.item;
			if (!item || item.type !== "message") return;
			trackEvent?.();
			const ingressContext = await authorizeAndResolveSlackSystemEventContext({
				ctx,
				senderId: event.user,
				channelId: item.channel,
				eventKind: "reaction"
			});
			if (!ingressContext) return;
			const actorInfoPromise = event.user ? ctx.resolveUserName(event.user) : Promise.resolve(void 0);
			const authorInfoPromise = event.item_user ? ctx.resolveUserName(event.item_user) : Promise.resolve(void 0);
			const [actorInfo, authorInfo] = await Promise.all([actorInfoPromise, authorInfoPromise]);
			const actorLabel = actorInfo?.name ?? event.user;
			const emojiLabel = event.reaction ?? "emoji";
			const authorLabel = authorInfo?.name ?? event.item_user;
			const baseText = `Slack reaction ${action}: :${emojiLabel}: by ${actorLabel} in ${ingressContext.channelLabel} msg ${item.ts}`;
			enqueueSystemEvent(authorLabel ? `${baseText} from ${authorLabel}` : baseText, {
				sessionKey: ingressContext.sessionKey,
				contextKey: `slack:reaction:${action}:${item.channel}:${item.ts}:${event.user}:${emojiLabel}`
			});
		} catch (err) {
			ctx.runtime.error?.(danger(`slack reaction handler failed: ${String(err)}`));
		}
	};
	ctx.app.event("reaction_added", async ({ event, body }) => {
		if (ctx.shouldDropMismatchedSlackEvent(body)) return;
		await handleReactionEvent(event, "added");
	});
	ctx.app.event("reaction_removed", async ({ event, body }) => {
		if (ctx.shouldDropMismatchedSlackEvent(body)) return;
		await handleReactionEvent(event, "removed");
	});
}
//#endregion
//#region extensions/slack/src/monitor/events.ts
function registerSlackMonitorEvents(params) {
	registerSlackMessageEvents({
		ctx: params.ctx,
		handleSlackMessage: params.handleSlackMessage
	});
	registerSlackReactionEvents({
		ctx: params.ctx,
		trackEvent: params.trackEvent
	});
	registerSlackMemberEvents({
		ctx: params.ctx,
		trackEvent: params.trackEvent
	});
	registerSlackChannelEvents({
		ctx: params.ctx,
		trackEvent: params.trackEvent
	});
	registerSlackPinEvents({
		ctx: params.ctx,
		trackEvent: params.trackEvent
	});
	registerSlackInteractionEvents({ ctx: params.ctx });
}
//#endregion
//#region extensions/slack/src/draft-stream.ts
const DEFAULT_THROTTLE_MS = 1e3;
function createSlackDraftStream(params) {
	const maxChars = Math.min(params.maxChars ?? 8e3, SLACK_TEXT_LIMIT);
	const throttleMs = Math.max(250, params.throttleMs ?? DEFAULT_THROTTLE_MS);
	const send = params.send ?? sendMessageSlack;
	const edit = params.edit ?? editSlackMessage;
	const remove = params.remove ?? deleteSlackMessage;
	let streamMessageId;
	let streamChannelId;
	let lastSentText = "";
	let stopped = false;
	const sendOrEditStreamMessage = async (text) => {
		if (stopped) return;
		const trimmed = text.trimEnd();
		if (!trimmed) return;
		if (trimmed.length > maxChars) {
			stopped = true;
			params.warn?.(`slack stream preview stopped (text length ${trimmed.length} > ${maxChars})`);
			return;
		}
		if (trimmed === lastSentText) return;
		lastSentText = trimmed;
		try {
			if (streamChannelId && streamMessageId) {
				await edit(streamChannelId, streamMessageId, trimmed, {
					token: params.token,
					accountId: params.accountId
				});
				return;
			}
			const sent = await send(params.target, trimmed, {
				token: params.token,
				accountId: params.accountId,
				threadTs: params.resolveThreadTs?.()
			});
			streamChannelId = sent.channelId || streamChannelId;
			streamMessageId = sent.messageId || streamMessageId;
			if (!streamChannelId || !streamMessageId) {
				stopped = true;
				params.warn?.("slack stream preview stopped (missing identifiers from sendMessage)");
				return;
			}
			params.onMessageSent?.();
		} catch (err) {
			stopped = true;
			params.warn?.(`slack stream preview failed: ${formatErrorMessage(err)}`);
		}
	};
	const loop = createDraftStreamLoop({
		throttleMs,
		isStopped: () => stopped,
		sendOrEditStreamMessage
	});
	const stop = () => {
		stopped = true;
		loop.stop();
	};
	const clear = async () => {
		stop();
		await loop.waitForInFlight();
		const channelId = streamChannelId;
		const messageId = streamMessageId;
		streamChannelId = void 0;
		streamMessageId = void 0;
		lastSentText = "";
		if (!channelId || !messageId) return;
		try {
			await remove(channelId, messageId, {
				token: params.token,
				accountId: params.accountId
			});
		} catch (err) {
			params.warn?.(`slack stream preview cleanup failed: ${formatErrorMessage(err)}`);
		}
	};
	const forceNewMessage = () => {
		streamMessageId = void 0;
		streamChannelId = void 0;
		lastSentText = "";
		loop.resetPending();
	};
	params.log?.(`slack stream preview ready (maxChars=${maxChars}, throttleMs=${throttleMs})`);
	return {
		update: loop.update,
		flush: loop.flush,
		clear,
		stop,
		forceNewMessage,
		messageId: () => streamMessageId,
		channelId: () => streamChannelId
	};
}
//#endregion
//#region extensions/slack/src/stream-mode.ts
function resolveSlackStreamingConfig(params) {
	const mode = resolveSlackStreamingMode(params);
	return {
		mode,
		nativeStreaming: resolveSlackNativeStreaming(params),
		draftMode: mapStreamingModeToSlackLegacyDraftStreamMode(mode)
	};
}
function applyAppendOnlyStreamUpdate(params) {
	const incoming = params.incoming.trimEnd();
	if (!incoming) return {
		rendered: params.rendered,
		source: params.source,
		changed: false
	};
	if (!params.rendered) return {
		rendered: incoming,
		source: incoming,
		changed: true
	};
	if (incoming === params.source) return {
		rendered: params.rendered,
		source: params.source,
		changed: false
	};
	if (incoming.startsWith(params.source) || incoming.startsWith(params.rendered)) return {
		rendered: incoming,
		source: incoming,
		changed: incoming !== params.rendered
	};
	if (params.source.startsWith(incoming)) return {
		rendered: params.rendered,
		source: params.source,
		changed: false
	};
	const separator = params.rendered.endsWith("\n") ? "" : "\n";
	return {
		rendered: `${params.rendered}${separator}${incoming}`,
		source: incoming,
		changed: true
	};
}
function buildStatusFinalPreviewText(updateCount) {
	return `Status: thinking${".".repeat(Math.max(1, updateCount) % 3 + 1)}`;
}
//#endregion
//#region extensions/slack/src/streaming.ts
/**
* Start a new Slack text stream.
*
* Returns a {@link SlackStreamSession} that should be passed to
* {@link appendSlackStream} and {@link stopSlackStream}.
*
* The first chunk of text can optionally be included via `text`.
*/
async function startSlackStream(params) {
	const { client, channel, threadTs, text, teamId, userId } = params;
	logVerbose(`slack-stream: starting stream in ${channel} thread=${threadTs}${teamId ? ` team=${teamId}` : ""}${userId ? ` user=${userId}` : ""}`);
	const streamer = client.chatStream({
		channel,
		thread_ts: threadTs,
		...teamId ? { recipient_team_id: teamId } : {},
		...userId ? { recipient_user_id: userId } : {}
	});
	const session = {
		streamer,
		channel,
		threadTs,
		stopped: false
	};
	if (text) {
		await streamer.append({ markdown_text: text });
		logVerbose(`slack-stream: appended initial text (${text.length} chars)`);
	}
	return session;
}
/**
* Append markdown text to an active Slack stream.
*/
async function appendSlackStream(params) {
	const { session, text } = params;
	if (session.stopped) {
		logVerbose("slack-stream: attempted to append to a stopped stream, ignoring");
		return;
	}
	if (!text) return;
	await session.streamer.append({ markdown_text: text });
	logVerbose(`slack-stream: appended ${text.length} chars`);
}
/**
* Stop (finalize) a Slack stream.
*
* After calling this the stream message becomes a normal Slack message.
* Optionally include final text to append before stopping.
*/
async function stopSlackStream(params) {
	const { session, text } = params;
	if (session.stopped) {
		logVerbose("slack-stream: stream already stopped, ignoring duplicate stop");
		return;
	}
	session.stopped = true;
	logVerbose(`slack-stream: stopping stream in ${session.channel} thread=${session.threadTs}${text ? ` (final text: ${text.length} chars)` : ""}`);
	await session.streamer.stop(text ? { markdown_text: text } : void 0);
	logVerbose("slack-stream: stream stopped");
}
//#endregion
//#region extensions/slack/src/monitor/message-handler/preview-finalize.ts
function buildExpectedSlackEditText(params) {
	const trimmed = normalizeSlackOutboundText(params.text.trim());
	if (trimmed) return trimmed;
	if (params.blocks?.length) return buildSlackBlocksFallbackText(params.blocks);
	return " ";
}
function blocksMatch(expected, actual) {
	if (!expected?.length) return !actual?.length;
	if (!actual?.length) return false;
	return JSON.stringify(expected) === JSON.stringify(actual);
}
async function readSlackMessageAfterEditError(params) {
	if (params.threadTs) return ((await params.client.conversations.replies({
		token: params.token,
		channel: params.channelId,
		ts: params.threadTs,
		latest: params.messageId,
		inclusive: true,
		limit: 100
	})).messages ?? []).find((message) => message?.ts === params.messageId) ?? null;
	const message = (await params.client.conversations.history({
		token: params.token,
		channel: params.channelId,
		latest: params.messageId,
		oldest: params.messageId,
		inclusive: true,
		limit: 1
	})).messages?.[0];
	if (!message?.ts || message.ts !== params.messageId) return null;
	return message;
}
async function didSlackPreviewEditApplyAfterError(params) {
	const readback = await readSlackMessageAfterEditError(params);
	if (!readback) return false;
	const expectedText = buildExpectedSlackEditText({
		text: params.text,
		blocks: params.blocks
	});
	const actualText = normalizeSlackOutboundText((readback.text ?? "").trim());
	if (params.blocks?.length) return actualText === expectedText && blocksMatch(params.blocks, readback.blocks);
	return actualText === expectedText;
}
async function finalizeSlackPreviewEdit(params) {
	try {
		await editSlackMessage(params.channelId, params.messageId, params.text, {
			token: params.token,
			accountId: params.accountId,
			client: params.client,
			...params.blocks?.length ? { blocks: params.blocks } : {}
		});
		return;
	} catch (err) {
		try {
			if (await didSlackPreviewEditApplyAfterError({
				client: params.client,
				token: params.token,
				channelId: params.channelId,
				messageId: params.messageId,
				text: params.text,
				blocks: params.blocks,
				threadTs: params.threadTs
			})) {
				logVerbose(`slack: preview final edit response failed but readback matched message ${params.channelId}/${params.messageId}; suppressing duplicate fallback send`);
				return;
			}
		} catch (readbackErr) {
			logVerbose(`slack: preview final edit readback failed (${String(readbackErr)})`);
		}
		throw err;
	}
}
//#endregion
//#region extensions/slack/src/monitor/message-handler/dispatch.ts
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
const UNICODE_TO_SLACK = {
	"👀": "eyes",
	"🤔": "thinking_face",
	"🔥": "fire",
	"👨‍💻": "male-technologist",
	"👨💻": "male-technologist",
	"👩‍💻": "female-technologist",
	"⚡": "zap",
	"🌐": "globe_with_meridians",
	"✅": "white_check_mark",
	"👍": "thumbsup",
	"❌": "x",
	"😱": "scream",
	"🥱": "yawning_face",
	"😨": "fearful",
	"⏳": "hourglass_flowing_sand",
	"⚠️": "warning",
	"✍": "writing_hand",
	"🧠": "brain",
	"🛠️": "hammer_and_wrench",
	"💻": "computer"
};
function toSlackEmojiName(emoji) {
	const trimmed = emoji.trim().replace(/^:+|:+$/g, "");
	return UNICODE_TO_SLACK[trimmed] ?? trimmed;
}
function isSlackStreamingEnabled(params) {
	if (params.mode !== "partial") return false;
	return params.nativeStreaming;
}
function shouldEnableSlackPreviewStreaming(params) {
	if (params.mode === "off") return false;
	if (!params.isDirectMessage) return true;
	return Boolean(params.threadTs);
}
function shouldInitializeSlackDraftStream(params) {
	return params.previewStreamingEnabled && !params.useStreaming;
}
function resolveSlackStreamingThreadHint(params) {
	return resolveSlackThreadTs({
		replyToMode: params.replyToMode,
		incomingThreadTs: params.incomingThreadTs,
		messageTs: params.messageTs,
		hasReplied: false,
		isThreadReply: params.isThreadReply
	});
}
function buildSlackTurnDeliveryKey(params) {
	const reply = resolveSendableOutboundReplyParts(params.payload, { text: params.textOverride });
	const slackBlocks = readSlackReplyBlocks(params.payload);
	if (!reply.hasContent && !slackBlocks?.length) return null;
	return JSON.stringify({
		kind: params.kind,
		threadTs: params.threadTs ?? "",
		replyToId: params.payload.replyToId ?? null,
		text: reply.trimmedText,
		mediaUrls: reply.mediaUrls,
		blocks: slackBlocks ?? null
	});
}
function createSlackTurnDeliveryTracker() {
	const deliveredKeys = /* @__PURE__ */ new Set();
	return {
		hasDelivered(params) {
			const key = buildSlackTurnDeliveryKey(params);
			return key ? deliveredKeys.has(key) : false;
		},
		markDelivered(params) {
			const key = buildSlackTurnDeliveryKey(params);
			if (key) deliveredKeys.add(key);
		}
	};
}
function shouldUseStreaming(params) {
	if (!params.streamingEnabled) return false;
	if (!params.threadTs) {
		logVerbose("slack-stream: streaming disabled — no reply thread target available");
		return false;
	}
	return true;
}
async function dispatchPreparedSlackMessage(prepared) {
	const { ctx, account, message, route } = prepared;
	const cfg = ctx.cfg;
	const runtime = ctx.runtime;
	const outboundIdentity = resolveAgentOutboundIdentity(cfg, route.agentId);
	const slackIdentity = outboundIdentity ? {
		username: outboundIdentity.name,
		iconUrl: outboundIdentity.avatarUrl,
		iconEmoji: outboundIdentity.emoji
	} : void 0;
	if (prepared.isDirectMessage) {
		const sessionCfg = cfg.session;
		const storePath = resolveStorePath(sessionCfg?.store, { agentId: route.agentId });
		const pinnedMainDmOwner = resolvePinnedMainDmOwnerFromAllowlist({
			dmScope: cfg.session?.dmScope,
			allowFrom: ctx.allowFrom,
			normalizeEntry: normalizeSlackAllowOwnerEntry
		});
		const senderRecipient = normalizeOptionalLowercaseString(message.user);
		if (pinnedMainDmOwner && senderRecipient && normalizeOptionalLowercaseString(pinnedMainDmOwner) !== senderRecipient) logVerbose(`slack: skip main-session last route for ${senderRecipient} (pinned owner ${pinnedMainDmOwner})`);
		else await updateLastRoute({
			storePath,
			sessionKey: route.mainSessionKey,
			deliveryContext: {
				channel: "slack",
				to: `user:${message.user}`,
				accountId: route.accountId,
				threadId: prepared.ctxPayload.MessageThreadId
			},
			ctx: prepared.ctxPayload
		});
	}
	const { statusThreadTs, isThreadReply } = resolveSlackThreadTargets({
		message,
		replyToMode: prepared.replyToMode
	});
	const reactionMessageTs = prepared.ackReactionMessageTs;
	const messageTs = message.ts ?? message.event_ts;
	const incomingThreadTs = message.thread_ts;
	let didSetStatus = false;
	const statusReactionsEnabled = Boolean(prepared.ackReactionPromise) && Boolean(reactionMessageTs) && cfg.messages?.statusReactions?.enabled !== false;
	const slackStatusAdapter = {
		setReaction: async (emoji) => {
			await reactSlackMessage(message.channel, reactionMessageTs ?? "", toSlackEmojiName(emoji), {
				token: ctx.botToken,
				client: ctx.app.client
			}).catch((err) => {
				if (String(err).includes("already_reacted")) return;
				throw err;
			});
		},
		removeReaction: async (emoji) => {
			await removeSlackReaction(message.channel, reactionMessageTs ?? "", toSlackEmojiName(emoji), {
				token: ctx.botToken,
				client: ctx.app.client
			}).catch((err) => {
				if (String(err).includes("no_reaction")) return;
				throw err;
			});
		}
	};
	const statusReactionTiming = {
		...DEFAULT_TIMING,
		...cfg.messages?.statusReactions?.timing
	};
	const statusReactions = createStatusReactionController({
		enabled: statusReactionsEnabled,
		adapter: slackStatusAdapter,
		initialEmoji: prepared.ackReactionValue || "eyes",
		emojis: cfg.messages?.statusReactions?.emojis,
		timing: cfg.messages?.statusReactions?.timing,
		onError: (err) => {
			logAckFailure({
				log: logVerbose,
				channel: "slack",
				target: `${message.channel}/${message.ts}`,
				error: err
			});
		}
	});
	if (statusReactionsEnabled) statusReactions.setQueued();
	const hasRepliedRef = { value: false };
	const replyPlan = createSlackReplyDeliveryPlan({
		replyToMode: prepared.replyToMode,
		incomingThreadTs,
		messageTs,
		hasRepliedRef,
		isThreadReply
	});
	const typingTarget = statusThreadTs ? `${message.channel}/${statusThreadTs}` : message.channel;
	const typingReaction = ctx.typingReaction;
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg,
		agentId: route.agentId,
		channel: "slack",
		accountId: route.accountId,
		transformReplyPayload: (payload) => isSlackInteractiveRepliesEnabled({
			cfg,
			accountId: route.accountId
		}) ? compileSlackInteractiveReplies(payload) : payload,
		typing: {
			start: async () => {
				didSetStatus = true;
				await ctx.setSlackThreadStatus({
					channelId: message.channel,
					threadTs: statusThreadTs,
					status: "is typing..."
				});
				if (typingReaction && message.ts) await reactSlackMessage(message.channel, message.ts, typingReaction, {
					token: ctx.botToken,
					client: ctx.app.client
				}).catch(() => {});
			},
			stop: async () => {
				if (!didSetStatus) return;
				didSetStatus = false;
				await ctx.setSlackThreadStatus({
					channelId: message.channel,
					threadTs: statusThreadTs,
					status: ""
				});
				if (typingReaction && message.ts) await removeSlackReaction(message.channel, message.ts, typingReaction, {
					token: ctx.botToken,
					client: ctx.app.client
				}).catch(() => {});
			},
			onStartError: (err) => {
				logTypingFailure({
					log: (message) => runtime.error?.(danger(message)),
					channel: "slack",
					action: "start",
					target: typingTarget,
					error: err
				});
			},
			onStopError: (err) => {
				logTypingFailure({
					log: (message) => runtime.error?.(danger(message)),
					channel: "slack",
					action: "stop",
					target: typingTarget,
					error: err
				});
			}
		}
	});
	const slackStreaming = resolveSlackStreamingConfig({
		streaming: account.config.streaming,
		nativeStreaming: resolveChannelStreamingNativeTransport(account.config)
	});
	const streamThreadHint = resolveSlackStreamingThreadHint({
		replyToMode: prepared.replyToMode,
		incomingThreadTs,
		messageTs,
		isThreadReply
	});
	const previewStreamingEnabled = shouldEnableSlackPreviewStreaming({
		mode: slackStreaming.mode,
		isDirectMessage: prepared.isDirectMessage,
		threadTs: streamThreadHint
	});
	const useStreaming = shouldUseStreaming({
		streamingEnabled: isSlackStreamingEnabled({
			mode: slackStreaming.mode,
			nativeStreaming: slackStreaming.nativeStreaming
		}),
		threadTs: streamThreadHint
	});
	const shouldUseDraftStream = shouldInitializeSlackDraftStream({
		previewStreamingEnabled,
		useStreaming
	});
	let streamSession = null;
	let streamFailed = false;
	let usedReplyThreadTs;
	let observedReplyDelivery = false;
	const deliveryTracker = createSlackTurnDeliveryTracker();
	const deliverNormally = async (params) => {
		const replyThreadTs = params.forcedThreadTs ?? replyPlan.nextThreadTs();
		if (deliveryTracker.hasDelivered({
			kind: params.kind,
			payload: params.payload,
			threadTs: replyThreadTs
		})) {
			logVerbose("slack: suppressed duplicate normal delivery within the same turn");
			return;
		}
		await deliverReplies({
			replies: [params.payload],
			target: prepared.replyTarget,
			token: ctx.botToken,
			accountId: account.accountId,
			runtime,
			textLimit: ctx.textLimit,
			replyThreadTs,
			replyToMode: prepared.replyToMode,
			...slackIdentity ? { identity: slackIdentity } : {}
		});
		observedReplyDelivery = true;
		if (replyThreadTs) usedReplyThreadTs ??= replyThreadTs;
		replyPlan.markSent();
		deliveryTracker.markDelivered({
			kind: params.kind,
			payload: params.payload,
			threadTs: replyThreadTs
		});
	};
	const deliverWithStreaming = async (params) => {
		const reply = resolveSendableOutboundReplyParts(params.payload);
		if (streamFailed || reply.hasMedia || readSlackReplyBlocks(params.payload)?.length || !reply.hasText) {
			await deliverNormally({
				payload: params.payload,
				kind: params.kind,
				forcedThreadTs: streamSession?.threadTs
			});
			return;
		}
		const text = reply.trimmedText;
		let plannedThreadTs;
		try {
			if (!streamSession) {
				const streamThreadTs = replyPlan.nextThreadTs();
				plannedThreadTs = streamThreadTs;
				if (!streamThreadTs) {
					logVerbose("slack-stream: no reply thread target for stream start, falling back to normal delivery");
					streamFailed = true;
					await deliverNormally({
						payload: params.payload,
						kind: params.kind
					});
					return;
				}
				if (deliveryTracker.hasDelivered({
					kind: params.kind,
					payload: params.payload,
					threadTs: streamThreadTs,
					textOverride: text
				})) {
					logVerbose("slack-stream: suppressed duplicate stream start payload");
					return;
				}
				streamSession = await startSlackStream({
					client: ctx.app.client,
					channel: message.channel,
					threadTs: streamThreadTs,
					text,
					teamId: ctx.teamId,
					userId: message.user
				});
				observedReplyDelivery = true;
				usedReplyThreadTs ??= streamThreadTs;
				replyPlan.markSent();
				deliveryTracker.markDelivered({
					kind: params.kind,
					payload: params.payload,
					threadTs: streamThreadTs,
					textOverride: text
				});
				return;
			}
			if (deliveryTracker.hasDelivered({
				kind: params.kind,
				payload: params.payload,
				threadTs: streamSession.threadTs,
				textOverride: text
			})) {
				logVerbose("slack-stream: suppressed duplicate append payload");
				return;
			}
			await appendSlackStream({
				session: streamSession,
				text: "\n" + text
			});
			deliveryTracker.markDelivered({
				kind: params.kind,
				payload: params.payload,
				threadTs: streamSession.threadTs,
				textOverride: text
			});
		} catch (err) {
			runtime.error?.(danger(`slack-stream: streaming API call failed: ${String(err)}, falling back`));
			streamFailed = true;
			await deliverNormally({
				payload: params.payload,
				kind: params.kind,
				forcedThreadTs: streamSession?.threadTs ?? plannedThreadTs
			});
		}
	};
	const { dispatcher, replyOptions, markDispatchIdle } = createReplyDispatcherWithTyping({
		...replyPipeline,
		humanDelay: resolveHumanDelayConfig(cfg, route.agentId),
		deliver: async (payload, info) => {
			if (useStreaming) {
				await deliverWithStreaming({
					payload,
					kind: info.kind
				});
				return;
			}
			const reply = resolveSendableOutboundReplyParts(payload);
			const slackBlocks = readSlackReplyBlocks(payload);
			const draftMessageId = draftStream?.messageId();
			const draftChannelId = draftStream?.channelId();
			const trimmedFinalText = reply.trimmedText;
			if (previewStreamingEnabled && streamMode !== "status_final" && !reply.hasMedia && !payload.isError && (trimmedFinalText.length > 0 || Boolean(slackBlocks?.length)) && typeof draftMessageId === "string" && typeof draftChannelId === "string") {
				const finalThreadTs = usedReplyThreadTs ?? statusThreadTs;
				if (deliveryTracker.hasDelivered({
					kind: info.kind,
					payload,
					threadTs: finalThreadTs
				})) {
					observedReplyDelivery = true;
					return;
				}
				draftStream?.stop();
				try {
					await finalizeSlackPreviewEdit({
						client: ctx.app.client,
						token: ctx.botToken,
						accountId: account.accountId,
						channelId: draftChannelId,
						messageId: draftMessageId,
						text: normalizeSlackOutboundText(trimmedFinalText),
						...slackBlocks?.length ? { blocks: slackBlocks } : {},
						threadTs: finalThreadTs
					});
					observedReplyDelivery = true;
					deliveryTracker.markDelivered({
						kind: info.kind,
						payload,
						threadTs: finalThreadTs
					});
					return;
				} catch (err) {
					logVerbose(`slack: preview final edit failed; falling back to standard send (${String(err)})`);
				}
			} else if (previewStreamingEnabled && streamMode === "status_final" && hasStreamedMessage) try {
				const statusChannelId = draftStream?.channelId();
				const statusMessageId = draftStream?.messageId();
				if (statusChannelId && statusMessageId) await ctx.app.client.chat.update({
					token: ctx.botToken,
					channel: statusChannelId,
					ts: statusMessageId,
					text: "Status: complete. Final answer posted below."
				});
			} catch (err) {
				logVerbose(`slack: status_final completion update failed (${String(err)})`);
			}
			else if (reply.hasMedia) {
				await draftStream?.clear();
				hasStreamedMessage = false;
			}
			await deliverNormally({
				payload,
				kind: info.kind
			});
		},
		onError: (err, info) => {
			runtime.error?.(danger(`slack ${info.kind} reply failed: ${String(err)}`));
			replyPipeline.typingCallbacks?.onIdle?.();
		}
	});
	const draftStream = shouldUseDraftStream ? createSlackDraftStream({
		target: prepared.replyTarget,
		token: ctx.botToken,
		accountId: account.accountId,
		maxChars: Math.min(ctx.textLimit, SLACK_TEXT_LIMIT),
		resolveThreadTs: () => {
			const ts = replyPlan.nextThreadTs();
			if (ts) usedReplyThreadTs ??= ts;
			return ts;
		},
		onMessageSent: () => replyPlan.markSent(),
		log: logVerbose,
		warn: logVerbose
	}) : void 0;
	let hasStreamedMessage = false;
	const streamMode = slackStreaming.draftMode;
	let appendRenderedText = "";
	let appendSourceText = "";
	let statusUpdateCount = 0;
	const updateDraftFromPartial = (text) => {
		const trimmed = text?.trimEnd();
		if (!trimmed) return;
		if (streamMode === "append") {
			const next = applyAppendOnlyStreamUpdate({
				incoming: trimmed,
				rendered: appendRenderedText,
				source: appendSourceText
			});
			appendRenderedText = next.rendered;
			appendSourceText = next.source;
			if (!next.changed) return;
			draftStream?.update(next.rendered);
			hasStreamedMessage = true;
			return;
		}
		if (streamMode === "status_final") {
			statusUpdateCount += 1;
			if (statusUpdateCount > 1 && statusUpdateCount % 4 !== 0) return;
			draftStream?.update(buildStatusFinalPreviewText(statusUpdateCount));
			hasStreamedMessage = true;
			return;
		}
		draftStream?.update(trimmed);
		hasStreamedMessage = true;
	};
	const onDraftBoundary = !shouldUseDraftStream ? void 0 : async () => {
		if (hasStreamedMessage) {
			draftStream?.forceNewMessage();
			hasStreamedMessage = false;
			appendRenderedText = "";
			appendSourceText = "";
			statusUpdateCount = 0;
		}
	};
	let dispatchError;
	let queuedFinal = false;
	let counts = {};
	try {
		const result = await dispatchInboundMessage({
			ctx: prepared.ctxPayload,
			cfg,
			dispatcher,
			replyOptions: {
				...replyOptions,
				skillFilter: prepared.channelConfig?.skills,
				hasRepliedRef,
				disableBlockStreaming: useStreaming ? true : typeof resolveChannelStreamingBlockEnabled(account.config) === "boolean" ? !resolveChannelStreamingBlockEnabled(account.config) : void 0,
				onModelSelected,
				onPartialReply: useStreaming ? void 0 : !previewStreamingEnabled ? void 0 : async (payload) => {
					updateDraftFromPartial(payload.text);
				},
				onAssistantMessageStart: onDraftBoundary,
				onReasoningEnd: onDraftBoundary,
				onReasoningStream: statusReactionsEnabled ? async () => {
					await statusReactions.setThinking();
				} : void 0,
				onToolStart: statusReactionsEnabled ? async (payload) => {
					await statusReactions.setTool(payload.name);
				} : void 0
			}
		});
		queuedFinal = result.queuedFinal;
		counts = result.counts;
	} catch (err) {
		dispatchError = err;
	} finally {
		await draftStream?.flush();
		draftStream?.stop();
		markDispatchIdle();
	}
	const finalStream = streamSession;
	if (finalStream && !finalStream.stopped) try {
		await stopSlackStream({ session: finalStream });
	} catch (err) {
		runtime.error?.(danger(`slack-stream: failed to stop stream: ${String(err)}`));
	}
	const anyReplyDelivered = observedReplyDelivery || queuedFinal || (counts.block ?? 0) > 0 || (counts.final ?? 0) > 0;
	if (statusReactionsEnabled) if (dispatchError) {
		await statusReactions.setError();
		if (ctx.removeAckAfterReply) (async () => {
			await sleep(statusReactionTiming.errorHoldMs);
			if (anyReplyDelivered) {
				await statusReactions.clear();
				return;
			}
			await statusReactions.restoreInitial();
		})();
		else statusReactions.restoreInitial();
	} else if (anyReplyDelivered) {
		await statusReactions.setDone();
		if (ctx.removeAckAfterReply) (async () => {
			await sleep(statusReactionTiming.doneHoldMs);
			await statusReactions.clear();
		})();
		else statusReactions.restoreInitial();
	} else await statusReactions.restoreInitial();
	if (dispatchError) throw dispatchError;
	const participationThreadTs = usedReplyThreadTs ?? statusThreadTs;
	if (anyReplyDelivered && participationThreadTs) recordSlackThreadParticipation(account.accountId, message.channel, participationThreadTs);
	if (!anyReplyDelivered) {
		await draftStream?.clear();
		if (prepared.isRoomish) clearHistoryEntriesIfEnabled({
			historyMap: ctx.channelHistories,
			historyKey: prepared.historyKey,
			limit: ctx.historyLimit
		});
		return;
	}
	if (shouldLogVerbose()) {
		const finalCount = counts.final;
		logVerbose(`slack: delivered ${finalCount} reply${finalCount === 1 ? "" : "ies"} to ${prepared.replyTarget}`);
	}
	if (!statusReactionsEnabled) removeAckReactionAfterReply({
		removeAfterReply: ctx.removeAckAfterReply && anyReplyDelivered,
		ackReactionPromise: prepared.ackReactionPromise,
		ackReactionValue: prepared.ackReactionValue,
		remove: () => removeSlackReaction(message.channel, prepared.ackReactionMessageTs ?? "", prepared.ackReactionValue, {
			token: ctx.botToken,
			client: ctx.app.client
		}),
		onError: (err) => {
			logAckFailure({
				log: logVerbose,
				channel: "slack",
				target: `${message.channel}/${message.ts}`,
				error: err
			});
		}
	});
	if (prepared.isRoomish) clearHistoryEntriesIfEnabled({
		historyMap: ctx.channelHistories,
		historyKey: prepared.historyKey,
		limit: ctx.historyLimit
	});
}
//#endregion
//#region extensions/slack/src/monitor/thread-resolution.ts
const DEFAULT_THREAD_TS_CACHE_TTL_MS = 6e4;
const DEFAULT_THREAD_TS_CACHE_MAX = 500;
const normalizeThreadTs = (threadTs) => {
	const trimmed = threadTs?.trim();
	return trimmed ? trimmed : void 0;
};
async function resolveThreadTsFromHistory(params) {
	try {
		const response = await params.client.conversations.history({
			channel: params.channelId,
			latest: params.messageTs,
			oldest: params.messageTs,
			inclusive: true,
			limit: 1
		});
		return normalizeThreadTs((response.messages?.find((entry) => entry.ts === params.messageTs) ?? response.messages?.[0])?.thread_ts);
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`slack inbound: failed to resolve thread_ts via conversations.history for channel=${params.channelId} ts=${params.messageTs}: ${String(err)}`);
		return;
	}
}
function createSlackThreadTsResolver(params) {
	const ttlMs = Math.max(0, params.cacheTtlMs ?? DEFAULT_THREAD_TS_CACHE_TTL_MS);
	const maxSize = Math.max(0, params.maxSize ?? DEFAULT_THREAD_TS_CACHE_MAX);
	const cache = /* @__PURE__ */ new Map();
	const inflight = /* @__PURE__ */ new Map();
	const getCached = (key, now) => {
		const entry = cache.get(key);
		if (!entry) return;
		if (ttlMs > 0 && now - entry.updatedAt > ttlMs) {
			cache.delete(key);
			return;
		}
		cache.delete(key);
		cache.set(key, {
			...entry,
			updatedAt: now
		});
		return entry.threadTs;
	};
	const setCached = (key, threadTs, now) => {
		cache.delete(key);
		cache.set(key, {
			threadTs,
			updatedAt: now
		});
		pruneMapToMaxSize(cache, maxSize);
	};
	return { resolve: async (request) => {
		const { message } = request;
		if (!message.parent_user_id || message.thread_ts || !message.ts) return message;
		const cacheKey = `${message.channel}:${message.ts}`;
		const cached = getCached(cacheKey, Date.now());
		if (cached !== void 0) return cached ? {
			...message,
			thread_ts: cached
		} : message;
		if (shouldLogVerbose()) logVerbose(`slack inbound: missing thread_ts for thread reply channel=${message.channel} ts=${message.ts} source=${request.source}`);
		let pending = inflight.get(cacheKey);
		if (!pending) {
			pending = resolveThreadTsFromHistory({
				client: params.client,
				channelId: message.channel,
				messageTs: message.ts
			});
			inflight.set(cacheKey, pending);
		}
		let resolved;
		try {
			resolved = await pending;
		} finally {
			inflight.delete(cacheKey);
		}
		setCached(cacheKey, resolved ?? null, Date.now());
		if (resolved) {
			if (shouldLogVerbose()) logVerbose(`slack inbound: resolved missing thread_ts channel=${message.channel} ts=${message.ts} -> thread_ts=${resolved}`);
			return {
				...message,
				thread_ts: resolved
			};
		}
		if (shouldLogVerbose()) logVerbose(`slack inbound: could not resolve missing thread_ts channel=${message.channel} ts=${message.ts}`);
		return message;
	} };
}
//#endregion
//#region extensions/slack/src/monitor/message-handler.ts
const APP_MENTION_RETRY_TTL_MS = 6e4;
var SlackRetryableInboundError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "SlackRetryableInboundError";
	}
};
function resolveSlackSenderId(message) {
	return message.user ?? message.bot_id ?? null;
}
function isSlackDirectMessageChannel(channelId) {
	return channelId.startsWith("D");
}
function isTopLevelSlackMessage(message) {
	return !message.thread_ts && !message.parent_user_id;
}
function buildTopLevelSlackConversationKey(message, accountId) {
	if (!isTopLevelSlackMessage(message)) return null;
	const senderId = resolveSlackSenderId(message);
	if (!senderId) return null;
	return `slack:${accountId}:${message.channel}:${senderId}`;
}
function shouldDebounceSlackMessage(message, cfg) {
	return shouldDebounceTextInbound({
		text: stripSlackMentionsForCommandDetection(message.text ?? ""),
		cfg,
		hasMedia: Boolean(message.files && message.files.length > 0)
	});
}
function buildSeenMessageKey(channelId, ts) {
	if (!channelId || !ts) return null;
	return `${channelId}:${ts}`;
}
/**
* Build a debounce key that isolates messages by thread (or by message timestamp
* for top-level non-DM channel messages). Without per-message scoping, concurrent
* top-level messages from the same sender can share a key and get merged
* into a single reply on the wrong thread.
*
* DMs intentionally stay channel-scoped to preserve short-message batching.
*/
function buildSlackDebounceKey(message, accountId) {
	const senderId = resolveSlackSenderId(message);
	if (!senderId) return null;
	const messageTs = message.ts ?? message.event_ts;
	return `slack:${accountId}:${message.thread_ts ? `${message.channel}:${message.thread_ts}` : message.parent_user_id && messageTs ? `${message.channel}:maybe-thread:${messageTs}` : messageTs && !isSlackDirectMessageChannel(message.channel) ? `${message.channel}:${messageTs}` : message.channel}:${senderId}`;
}
function createSlackMessageHandler(params) {
	const { ctx, account, trackEvent } = params;
	const { debounceMs, debouncer } = createChannelInboundDebouncer({
		cfg: ctx.cfg,
		channel: "slack",
		buildKey: (entry) => buildSlackDebounceKey(entry.message, ctx.accountId),
		shouldDebounce: (entry) => shouldDebounceSlackMessage(entry.message, ctx.cfg),
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			const flushedKey = buildSlackDebounceKey(last.message, ctx.accountId);
			const topLevelConversationKey = buildTopLevelSlackConversationKey(last.message, ctx.accountId);
			if (flushedKey && topLevelConversationKey) {
				const pendingKeys = pendingTopLevelDebounceKeys.get(topLevelConversationKey);
				if (pendingKeys) {
					pendingKeys.delete(flushedKey);
					if (pendingKeys.size === 0) pendingTopLevelDebounceKeys.delete(topLevelConversationKey);
				}
			}
			const combinedText = entries.length === 1 ? last.message.text ?? "" : entries.map((entry) => entry.message.text ?? "").filter(Boolean).join("\n");
			const combinedMentioned = entries.some((entry) => Boolean(entry.opts.wasMentioned));
			const syntheticMessage = {
				...last.message,
				text: combinedText
			};
			const seenMessageKey = buildSeenMessageKey(last.message.channel, last.message.ts);
			try {
				const prepared = await prepareSlackMessage({
					ctx,
					account,
					message: syntheticMessage,
					opts: {
						...last.opts,
						wasMentioned: combinedMentioned || last.opts.wasMentioned
					}
				});
				if (!prepared) return;
				if (seenMessageKey) {
					pruneAppMentionRetryKeys(Date.now());
					if (last.opts.source === "app_mention") appMentionDispatchedKeys.set(seenMessageKey, Date.now() + APP_MENTION_RETRY_TTL_MS);
					else if (last.opts.source === "message" && appMentionDispatchedKeys.has(seenMessageKey)) {
						appMentionDispatchedKeys.delete(seenMessageKey);
						appMentionRetryKeys.delete(seenMessageKey);
						return;
					}
					appMentionRetryKeys.delete(seenMessageKey);
				}
				if (entries.length > 1) {
					const ids = entries.map((entry) => entry.message.ts).filter(Boolean);
					if (ids.length > 0) {
						prepared.ctxPayload.MessageSids = ids;
						prepared.ctxPayload.MessageSidFirst = ids[0];
						prepared.ctxPayload.MessageSidLast = ids[ids.length - 1];
					}
				}
				await dispatchPreparedSlackMessage(prepared);
			} catch (error) {
				if (error instanceof SlackRetryableInboundError) {
					if (seenMessageKey) appMentionDispatchedKeys.delete(seenMessageKey);
					ctx.releaseSeenMessage(last.message.channel, last.message.ts);
				}
				throw error;
			}
		},
		onError: (err) => {
			ctx.runtime.error?.(`slack inbound debounce flush failed: ${String(err)}`);
		}
	});
	const threadTsResolver = createSlackThreadTsResolver({ client: ctx.app.client });
	const pendingTopLevelDebounceKeys = /* @__PURE__ */ new Map();
	const appMentionRetryKeys = /* @__PURE__ */ new Map();
	const appMentionDispatchedKeys = /* @__PURE__ */ new Map();
	const pruneAppMentionRetryKeys = (now) => {
		for (const [key, expiresAt] of appMentionRetryKeys) if (expiresAt <= now) appMentionRetryKeys.delete(key);
		for (const [key, expiresAt] of appMentionDispatchedKeys) if (expiresAt <= now) appMentionDispatchedKeys.delete(key);
	};
	const rememberAppMentionRetryKey = (key) => {
		const now = Date.now();
		pruneAppMentionRetryKeys(now);
		appMentionRetryKeys.set(key, now + APP_MENTION_RETRY_TTL_MS);
	};
	const consumeAppMentionRetryKey = (key) => {
		pruneAppMentionRetryKeys(Date.now());
		if (!appMentionRetryKeys.has(key)) return false;
		appMentionRetryKeys.delete(key);
		return true;
	};
	return async (message, opts) => {
		if (opts.source === "message" && message.type !== "message") return;
		if (opts.source === "message" && message.subtype && message.subtype !== "file_share" && message.subtype !== "bot_message") return;
		const seenMessageKey = buildSeenMessageKey(message.channel, message.ts);
		const wasSeen = seenMessageKey ? ctx.markMessageSeen(message.channel, message.ts) : false;
		if (seenMessageKey && opts.source === "message" && !wasSeen) rememberAppMentionRetryKey(seenMessageKey);
		if (seenMessageKey && wasSeen) {
			if (opts.source !== "app_mention" || !consumeAppMentionRetryKey(seenMessageKey)) return;
		}
		trackEvent?.();
		const resolvedMessage = await threadTsResolver.resolve({
			message,
			source: opts.source
		});
		const debounceKey = buildSlackDebounceKey(resolvedMessage, ctx.accountId);
		const conversationKey = buildTopLevelSlackConversationKey(resolvedMessage, ctx.accountId);
		const canDebounce = debounceMs > 0 && shouldDebounceSlackMessage(resolvedMessage, ctx.cfg);
		if (!canDebounce && conversationKey) {
			const pendingKeys = pendingTopLevelDebounceKeys.get(conversationKey);
			if (pendingKeys && pendingKeys.size > 0) {
				const keysToFlush = Array.from(pendingKeys);
				for (const pendingKey of keysToFlush) await debouncer.flushKey(pendingKey);
			}
		}
		if (canDebounce && debounceKey && conversationKey) {
			const pendingKeys = pendingTopLevelDebounceKeys.get(conversationKey) ?? /* @__PURE__ */ new Set();
			pendingKeys.add(debounceKey);
			pendingTopLevelDebounceKeys.set(conversationKey, pendingKeys);
		}
		await debouncer.enqueue({
			message: resolvedMessage,
			opts
		});
	};
}
//#endregion
//#region extensions/slack/src/monitor/reconnect-policy.ts
const SLACK_AUTH_ERROR_RE = /account_inactive|invalid_auth|token_revoked|token_expired|not_authed|org_login_required|team_access_not_granted|missing_scope|cannot_find_service|invalid_token/i;
const SLACK_SOCKET_RECONNECT_POLICY = {
	initialMs: 2e3,
	maxMs: 3e4,
	factor: 1.8,
	jitter: .25,
	maxAttempts: 12
};
function getSocketEmitter(app) {
	const receiver = app.receiver;
	const client = receiver && typeof receiver === "object" ? receiver.client : void 0;
	if (!client || typeof client !== "object") return null;
	const on = client.on;
	const off = client.off;
	if (typeof on !== "function" || typeof off !== "function") return null;
	return {
		on: (event, listener) => on.call(client, event, listener),
		off: (event, listener) => off.call(client, event, listener)
	};
}
function waitForSlackSocketDisconnect(app, abortSignal) {
	return new Promise((resolve) => {
		const emitter = getSocketEmitter(app);
		if (!emitter) {
			abortSignal?.addEventListener("abort", () => resolve({ event: "disconnect" }), { once: true });
			return;
		}
		const disconnectListener = () => resolveOnce({ event: "disconnect" });
		const startFailListener = (error) => resolveOnce({
			event: "unable_to_socket_mode_start",
			error
		});
		const errorListener = (error) => resolveOnce({
			event: "error",
			error
		});
		const abortListener = () => resolveOnce({ event: "disconnect" });
		const cleanup = () => {
			emitter.off("disconnected", disconnectListener);
			emitter.off("unable_to_socket_mode_start", startFailListener);
			emitter.off("error", errorListener);
			abortSignal?.removeEventListener("abort", abortListener);
		};
		const resolveOnce = (value) => {
			cleanup();
			resolve(value);
		};
		emitter.on("disconnected", disconnectListener);
		emitter.on("unable_to_socket_mode_start", startFailListener);
		emitter.on("error", errorListener);
		abortSignal?.addEventListener("abort", abortListener, { once: true });
	});
}
/**
* Detect non-recoverable Slack API / auth errors that should NOT be retried.
* These indicate permanent credential problems (revoked bot, deactivated account, etc.)
* and retrying will never succeed — continuing to retry blocks the entire gateway.
*/
function isNonRecoverableSlackAuthError(error) {
	const msg = error instanceof Error ? error.message : typeof error === "string" ? error : "";
	return SLACK_AUTH_ERROR_RE.test(msg);
}
function formatUnknownError(error) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	try {
		return JSON.stringify(error);
	} catch {
		return "unknown error";
	}
}
//#endregion
//#region extensions/slack/src/monitor/external-arg-menu-store.ts
const SLACK_EXTERNAL_ARG_MENU_TOKEN_BYTES = 18;
const SLACK_EXTERNAL_ARG_MENU_TOKEN_LENGTH = Math.ceil(SLACK_EXTERNAL_ARG_MENU_TOKEN_BYTES * 8 / 6);
const SLACK_EXTERNAL_ARG_MENU_TOKEN_PATTERN = new RegExp(`^[A-Za-z0-9_-]{${SLACK_EXTERNAL_ARG_MENU_TOKEN_LENGTH}}$`);
const SLACK_EXTERNAL_ARG_MENU_TTL_MS = 600 * 1e3;
const SLACK_EXTERNAL_ARG_MENU_PREFIX = "openclaw_cmdarg_ext:";
function pruneSlackExternalArgMenuStore(store, now) {
	for (const [token, entry] of store.entries()) if (entry.expiresAt <= now) store.delete(token);
}
function createSlackExternalArgMenuToken(store) {
	let token = "";
	do
		token = generateSecureToken(SLACK_EXTERNAL_ARG_MENU_TOKEN_BYTES);
	while (store.has(token));
	return token;
}
function createSlackExternalArgMenuStore() {
	const store = /* @__PURE__ */ new Map();
	return {
		create(params, now = Date.now()) {
			pruneSlackExternalArgMenuStore(store, now);
			const token = createSlackExternalArgMenuToken(store);
			store.set(token, {
				choices: params.choices,
				userId: params.userId,
				expiresAt: now + SLACK_EXTERNAL_ARG_MENU_TTL_MS
			});
			return token;
		},
		readToken(raw) {
			if (typeof raw !== "string" || !raw.startsWith("openclaw_cmdarg_ext:")) return;
			const token = raw.slice(20).trim();
			return SLACK_EXTERNAL_ARG_MENU_TOKEN_PATTERN.test(token) ? token : void 0;
		},
		get(token, now = Date.now()) {
			pruneSlackExternalArgMenuStore(store, now);
			return store.get(token);
		}
	};
}
//#endregion
//#region extensions/slack/src/monitor/slash.ts
const SLACK_COMMAND_ARG_ACTION_ID = "openclaw_cmdarg";
const SLACK_COMMAND_ARG_ACTION_LISTENER = /^openclaw_cmdarg/;
const SLACK_COMMAND_ARG_VALUE_PREFIX = "cmdarg";
const SLACK_COMMAND_ARG_BUTTON_ROW_SIZE = 5;
const SLACK_COMMAND_ARG_OVERFLOW_MIN = 3;
const SLACK_COMMAND_ARG_OVERFLOW_MAX = 5;
const SLACK_COMMAND_ARG_SELECT_OPTIONS_MAX = 100;
const SLACK_COMMAND_ARG_SELECT_OPTION_VALUE_MAX = 75;
const SLACK_HEADER_TEXT_MAX = 150;
let slashCommandsRuntimePromise = null;
let slashDispatchRuntimePromise = null;
let slashSkillCommandsRuntimePromise = null;
function loadSlashCommandsRuntime() {
	slashCommandsRuntimePromise ??= import("./slash-commands.runtime-BNoABodS.js");
	return slashCommandsRuntimePromise;
}
function loadSlashDispatchRuntime() {
	slashDispatchRuntimePromise ??= import("./slash-dispatch.runtime-XKC40ycP.js");
	return slashDispatchRuntimePromise;
}
function loadSlashSkillCommandsRuntime() {
	slashSkillCommandsRuntimePromise ??= import("./slash-skill-commands.runtime-SYbIts6Y.js");
	return slashSkillCommandsRuntimePromise;
}
const slackExternalArgMenuStore = createSlackExternalArgMenuStore();
function buildSlackArgMenuConfirm(params) {
	return {
		title: {
			type: "plain_text",
			text: "Confirm selection"
		},
		text: {
			type: "mrkdwn",
			text: `Run */${escapeSlackMrkdwn(params.command)}* with *${escapeSlackMrkdwn(params.arg)}* set to this value?`
		},
		confirm: {
			type: "plain_text",
			text: "Run command"
		},
		deny: {
			type: "plain_text",
			text: "Cancel"
		}
	};
}
function storeSlackExternalArgMenu(params) {
	return slackExternalArgMenuStore.create({
		choices: params.choices,
		userId: params.userId
	});
}
function readSlackExternalArgMenuToken(raw) {
	return slackExternalArgMenuStore.readToken(raw);
}
function encodeSlackCommandArgValue(parts) {
	return [
		SLACK_COMMAND_ARG_VALUE_PREFIX,
		encodeURIComponent(parts.command),
		encodeURIComponent(parts.arg),
		encodeURIComponent(parts.value),
		encodeURIComponent(parts.userId)
	].join("|");
}
function parseSlackCommandArgValue(raw) {
	if (!raw) return null;
	const parts = raw.split("|");
	if (parts.length !== 5 || parts[0] !== SLACK_COMMAND_ARG_VALUE_PREFIX) return null;
	const [, command, arg, value, userId] = parts;
	if (!command || !arg || !value || !userId) return null;
	const decode = (text) => {
		try {
			return decodeURIComponent(text);
		} catch {
			return null;
		}
	};
	const decodedCommand = decode(command);
	const decodedArg = decode(arg);
	const decodedValue = decode(value);
	const decodedUserId = decode(userId);
	if (!decodedCommand || !decodedArg || !decodedValue || !decodedUserId) return null;
	return {
		command: decodedCommand,
		arg: decodedArg,
		value: decodedValue,
		userId: decodedUserId
	};
}
function buildSlackArgMenuOptions(choices) {
	return choices.map((choice) => ({
		text: {
			type: "plain_text",
			text: choice.label.slice(0, 75)
		},
		value: choice.value
	}));
}
function buildSlackCommandArgMenuBlocks(params) {
	const encodedChoices = params.choices.map((choice) => ({
		label: choice.label,
		value: encodeSlackCommandArgValue({
			command: params.command,
			arg: params.arg,
			value: choice.value,
			userId: params.userId
		})
	}));
	const canUseStaticSelect = encodedChoices.every((choice) => choice.value.length <= SLACK_COMMAND_ARG_SELECT_OPTION_VALUE_MAX);
	const canUseOverflow = canUseStaticSelect && encodedChoices.length >= SLACK_COMMAND_ARG_OVERFLOW_MIN && encodedChoices.length <= SLACK_COMMAND_ARG_OVERFLOW_MAX;
	const canUseExternalSelect = params.supportsExternalSelect && canUseStaticSelect && encodedChoices.length > SLACK_COMMAND_ARG_SELECT_OPTIONS_MAX;
	const rows = canUseOverflow ? [{
		type: "actions",
		elements: [{
			type: "overflow",
			action_id: SLACK_COMMAND_ARG_ACTION_ID,
			confirm: buildSlackArgMenuConfirm({
				command: params.command,
				arg: params.arg
			}),
			options: buildSlackArgMenuOptions(encodedChoices)
		}]
	}] : canUseExternalSelect ? [{
		type: "actions",
		block_id: `${SLACK_EXTERNAL_ARG_MENU_PREFIX}${params.createExternalMenuToken(encodedChoices)}`,
		elements: [{
			type: "external_select",
			action_id: SLACK_COMMAND_ARG_ACTION_ID,
			confirm: buildSlackArgMenuConfirm({
				command: params.command,
				arg: params.arg
			}),
			min_query_length: 0,
			placeholder: {
				type: "plain_text",
				text: `Search ${params.arg}`
			}
		}]
	}] : encodedChoices.length <= SLACK_COMMAND_ARG_BUTTON_ROW_SIZE || !canUseStaticSelect ? chunkItems(encodedChoices, SLACK_COMMAND_ARG_BUTTON_ROW_SIZE).map((choices, rowIndex) => ({
		type: "actions",
		elements: choices.map((choice, colIndex) => ({
			type: "button",
			action_id: `${SLACK_COMMAND_ARG_ACTION_ID}_${rowIndex}_${colIndex}`,
			text: {
				type: "plain_text",
				text: choice.label
			},
			value: choice.value,
			confirm: buildSlackArgMenuConfirm({
				command: params.command,
				arg: params.arg
			})
		}))
	})) : chunkItems(encodedChoices, SLACK_COMMAND_ARG_SELECT_OPTIONS_MAX).map((choices, index) => ({
		type: "actions",
		elements: [{
			type: "static_select",
			action_id: SLACK_COMMAND_ARG_ACTION_ID,
			confirm: buildSlackArgMenuConfirm({
				command: params.command,
				arg: params.arg
			}),
			placeholder: {
				type: "plain_text",
				text: index === 0 ? `Choose ${params.arg}` : `Choose ${params.arg} (${index + 1})`
			},
			options: buildSlackArgMenuOptions(choices)
		}]
	}));
	const headerText = truncateSlackText(`/${params.command}: choose ${params.arg}`, SLACK_HEADER_TEXT_MAX);
	const sectionText = truncateSlackText(params.title, 3e3);
	const contextText = truncateSlackText(`Select one option to continue /${params.command} (${params.arg})`, 3e3);
	return [
		{
			type: "header",
			text: {
				type: "plain_text",
				text: headerText
			}
		},
		{
			type: "section",
			text: {
				type: "mrkdwn",
				text: sectionText
			}
		},
		{
			type: "context",
			elements: [{
				type: "mrkdwn",
				text: contextText
			}]
		},
		...rows
	];
}
async function registerSlackMonitorSlashCommands(params) {
	const { ctx, account } = params;
	const cfg = ctx.cfg;
	const runtime = ctx.runtime;
	const supportsInteractiveArgMenus = typeof ctx.app.action === "function";
	let supportsExternalArgMenus = typeof ctx.app.options === "function";
	const slashCommand = resolveSlackSlashCommandConfig(ctx.slashCommand ?? account.config.slashCommand);
	const handleSlashCommand = async (p) => {
		const { command, ack, respond, body, prompt, commandArgs, commandDefinition } = p;
		try {
			if (ctx.shouldDropMismatchedSlackEvent?.(body)) {
				await ack();
				runtime.log?.(`slack: drop slash command from user=${command.user_id ?? "unknown"} channel=${command.channel_id ?? "unknown"} (mismatched app/team)`);
				return;
			}
			if (!prompt.trim()) {
				await ack({
					text: "Message required.",
					response_type: "ephemeral"
				});
				return;
			}
			await ack();
			if (ctx.botUserId && command.user_id === ctx.botUserId) return;
			const channelInfo = await ctx.resolveChannelName(command.channel_id);
			const channelType = normalizeSlackChannelType(channelInfo?.type ?? (command.channel_name === "directmessage" ? "im" : void 0), command.channel_id);
			const isDirectMessage = channelType === "im";
			const isGroupDm = channelType === "mpim";
			const isRoom = channelType === "channel" || channelType === "group";
			const isRoomish = isRoom || isGroupDm;
			if (!ctx.isChannelAllowed({
				channelId: command.channel_id,
				channelName: channelInfo?.name,
				channelType
			})) {
				await respond({
					text: "This channel is not allowed.",
					response_type: "ephemeral"
				});
				return;
			}
			const { allowFromLower: effectiveAllowFromLower } = await resolveSlackEffectiveAllowFrom(ctx, { includePairingStore: isDirectMessage });
			let commandAuthorized = false;
			let channelConfig = null;
			if (isDirectMessage) {
				if (!await authorizeSlackDirectMessage({
					ctx,
					accountId: ctx.accountId,
					senderId: command.user_id,
					allowFromLower: effectiveAllowFromLower,
					resolveSenderName: ctx.resolveUserName,
					sendPairingReply: async (text) => {
						await respond({
							text,
							response_type: "ephemeral"
						});
					},
					onDisabled: async () => {
						await respond({
							text: "Slack DMs are disabled.",
							response_type: "ephemeral"
						});
					},
					onUnauthorized: async ({ allowMatchMeta }) => {
						logVerbose(`slack: blocked slash sender ${command.user_id} (dmPolicy=${ctx.dmPolicy}, ${allowMatchMeta})`);
						await respond({
							text: "You are not authorized to use this command.",
							response_type: "ephemeral"
						});
					},
					log: logVerbose
				})) return;
			}
			if (isRoom) {
				channelConfig = resolveSlackChannelConfig({
					channelId: command.channel_id,
					channelName: channelInfo?.name,
					channels: ctx.channelsConfig,
					channelKeys: ctx.channelsConfigKeys,
					defaultRequireMention: ctx.defaultRequireMention,
					allowNameMatching: ctx.allowNameMatching
				});
				if (ctx.useAccessGroups) {
					const channelAllowlistConfigured = (ctx.channelsConfigKeys?.length ?? 0) > 0;
					const channelAllowed = channelConfig?.allowed !== false;
					if (!isSlackChannelAllowedByPolicy({
						groupPolicy: ctx.groupPolicy,
						channelAllowlistConfigured,
						channelAllowed
					})) {
						await respond({
							text: "This channel is not allowed.",
							response_type: "ephemeral"
						});
						return;
					}
					const hasExplicitConfig = Boolean(channelConfig?.matchSource);
					if (!channelAllowed && (ctx.groupPolicy !== "open" || hasExplicitConfig)) {
						await respond({
							text: "This channel is not allowed.",
							response_type: "ephemeral"
						});
						return;
					}
				}
			}
			const senderName = (await ctx.resolveUserName(command.user_id))?.name ?? command.user_name ?? command.user_id;
			const channelUsersAllowlistConfigured = isRoom && Array.isArray(channelConfig?.users) && channelConfig.users.length > 0;
			const channelUserAllowed = channelUsersAllowlistConfigured ? resolveSlackUserAllowed({
				allowList: channelConfig?.users,
				userId: command.user_id,
				userName: senderName,
				allowNameMatching: ctx.allowNameMatching
			}) : false;
			if (channelUsersAllowlistConfigured && !channelUserAllowed) {
				await respond({
					text: "You are not authorized to use this command here.",
					response_type: "ephemeral"
				});
				return;
			}
			const ownerAllowed = resolveSlackAllowListMatch({
				allowList: effectiveAllowFromLower,
				id: command.user_id,
				name: senderName,
				allowNameMatching: ctx.allowNameMatching
			}).allowed;
			commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
				useAccessGroups: ctx.useAccessGroups,
				authorizers: [{
					configured: effectiveAllowFromLower.length > 0,
					allowed: ownerAllowed
				}],
				modeWhenAccessGroupsOff: "configured"
			});
			if (isRoomish) {
				commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
					useAccessGroups: ctx.useAccessGroups,
					authorizers: [{
						configured: effectiveAllowFromLower.length > 0,
						allowed: ownerAllowed
					}, {
						configured: channelUsersAllowlistConfigured,
						allowed: channelUserAllowed
					}],
					modeWhenAccessGroupsOff: "configured"
				});
				if (ctx.useAccessGroups && !commandAuthorized) {
					await respond({
						text: "You are not authorized to use this command.",
						response_type: "ephemeral"
					});
					return;
				}
			}
			if (commandDefinition && supportsInteractiveArgMenus) {
				const { resolveCommandArgMenu } = await loadSlashCommandsRuntime();
				const menu = resolveCommandArgMenu({
					command: commandDefinition,
					args: commandArgs,
					cfg
				});
				if (menu) {
					const commandLabel = commandDefinition.nativeName ?? commandDefinition.key;
					const title = menu.title ?? `Choose ${menu.arg.description || menu.arg.name} for /${commandLabel}.`;
					await respond({
						text: title,
						blocks: buildSlackCommandArgMenuBlocks({
							title,
							command: commandLabel,
							arg: menu.arg.name,
							choices: menu.choices,
							userId: command.user_id,
							supportsExternalSelect: supportsExternalArgMenus,
							createExternalMenuToken: (choices) => storeSlackExternalArgMenu({
								choices,
								userId: command.user_id
							})
						}),
						response_type: "ephemeral"
					});
					return;
				}
			}
			const channelName = channelInfo?.name;
			const roomLabel = channelName ? `#${channelName}` : `#${command.channel_id}`;
			const { deliverSlackSlashReplies, dispatchReplyWithDispatcher, finalizeInboundContext, recordInboundSessionMetaSafe, resolveAgentRoute, resolveChunkMode, resolveConversationLabel, resolveMarkdownTableMode } = await loadSlashDispatchRuntime();
			const route = resolveAgentRoute({
				cfg,
				channel: "slack",
				accountId: account.accountId,
				teamId: ctx.teamId || void 0,
				peer: {
					kind: isDirectMessage ? "direct" : isRoom ? "channel" : "group",
					id: isDirectMessage ? command.user_id : command.channel_id
				}
			});
			const { untrustedChannelMetadata, groupSystemPrompt } = resolveSlackRoomContextHints({
				isRoomish,
				channelInfo,
				channelConfig
			});
			const { sessionKey, commandTargetSessionKey } = resolveNativeCommandSessionTargets({
				agentId: route.agentId,
				sessionPrefix: slashCommand.sessionPrefix,
				userId: command.user_id,
				targetSessionKey: route.sessionKey,
				lowercaseSessionKey: true
			});
			const ctxPayload = finalizeInboundContext({
				Body: prompt,
				BodyForAgent: prompt,
				RawBody: prompt,
				CommandBody: prompt,
				CommandArgs: commandArgs,
				From: isDirectMessage ? `slack:${command.user_id}` : isRoom ? `slack:channel:${command.channel_id}` : `slack:group:${command.channel_id}`,
				To: `slash:${command.user_id}`,
				ChatType: isDirectMessage ? "direct" : "channel",
				ConversationLabel: resolveConversationLabel({
					ChatType: isDirectMessage ? "direct" : "channel",
					SenderName: senderName,
					GroupSubject: isRoomish ? roomLabel : void 0,
					From: isDirectMessage ? `slack:${command.user_id}` : isRoom ? `slack:channel:${command.channel_id}` : `slack:group:${command.channel_id}`
				}) ?? (isDirectMessage ? senderName : roomLabel),
				GroupSubject: isRoomish ? roomLabel : void 0,
				GroupSystemPrompt: groupSystemPrompt,
				UntrustedContext: untrustedChannelMetadata ? [untrustedChannelMetadata] : void 0,
				SenderName: senderName,
				SenderId: command.user_id,
				Provider: "slack",
				Surface: "slack",
				WasMentioned: true,
				MessageSid: command.trigger_id,
				Timestamp: Date.now(),
				SessionKey: sessionKey,
				CommandTargetSessionKey: commandTargetSessionKey,
				AccountId: route.accountId,
				CommandSource: "native",
				CommandAuthorized: commandAuthorized,
				OriginatingChannel: "slack",
				OriginatingTo: `user:${command.user_id}`
			});
			await recordInboundSessionMetaSafe({
				cfg,
				agentId: route.agentId,
				sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
				ctx: ctxPayload,
				onError: (err) => runtime.error?.(danger(`slack slash: failed updating session meta: ${String(err)}`))
			});
			const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
				cfg,
				agentId: route.agentId,
				channel: "slack",
				accountId: route.accountId
			});
			const deliverSlashPayloads = async (replies) => {
				await deliverSlackSlashReplies({
					replies,
					respond,
					ephemeral: slashCommand.ephemeral,
					textLimit: ctx.textLimit,
					chunkMode: resolveChunkMode(cfg, "slack", route.accountId),
					tableMode: resolveMarkdownTableMode({
						cfg,
						channel: "slack",
						accountId: route.accountId
					})
				});
			};
			const { counts } = await dispatchReplyWithDispatcher({
				ctx: ctxPayload,
				cfg,
				dispatcherOptions: {
					...replyPipeline,
					deliver: async (payload) => deliverSlashPayloads([payload]),
					onError: (err, info) => {
						runtime.error?.(danger(`slack slash ${info.kind} reply failed: ${String(err)}`));
					}
				},
				replyOptions: {
					skillFilter: channelConfig?.skills,
					onModelSelected
				}
			});
			if (counts.final + counts.tool + counts.block === 0) await deliverSlashPayloads([]);
		} catch (err) {
			runtime.error?.(danger(`slack slash handler failed: ${String(err)}`));
			await respond({
				text: "Sorry, something went wrong handling that command.",
				response_type: "ephemeral"
			});
		}
	};
	const nativeEnabled = resolveNativeCommandsEnabled({
		providerId: "slack",
		providerSetting: account.config.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const nativeSkillsEnabled = resolveNativeSkillsEnabled({
		providerId: "slack",
		providerSetting: account.config.commands?.nativeSkills,
		globalSetting: cfg.commands?.nativeSkills
	});
	let nativeCommands = [];
	let slashCommandsRuntime = null;
	if (nativeEnabled) {
		slashCommandsRuntime = await loadSlashCommandsRuntime();
		const skillCommands = nativeSkillsEnabled ? (await loadSlashSkillCommandsRuntime()).listSkillCommandsForAgents({ cfg }) : [];
		nativeCommands = slashCommandsRuntime.listNativeCommandSpecsForConfig(cfg, {
			skillCommands,
			provider: "slack"
		});
		const existingNativeNames = new Set(nativeCommands.map((c) => normalizeLowercaseStringOrEmpty(c.name)).filter(Boolean));
		for (const pluginCommand of listProviderPluginCommandSpecs("slack")) {
			const normalizedName = normalizeLowercaseStringOrEmpty(pluginCommand.name);
			if (!normalizedName || existingNativeNames.has(normalizedName)) continue;
			existingNativeNames.add(normalizedName);
			nativeCommands.push(pluginCommand);
		}
	}
	if (nativeCommands.length > 0) {
		if (!slashCommandsRuntime) throw new Error("Missing commands runtime for native Slack commands.");
		for (const command of nativeCommands) ctx.app.command(`/${command.name}`, async ({ command: cmd, ack, respond, body }) => {
			const commandDefinition = slashCommandsRuntime.findCommandByNativeName(command.name, "slack");
			const rawText = cmd.text?.trim() ?? "";
			const commandArgs = commandDefinition ? slashCommandsRuntime.parseCommandArgs(commandDefinition, rawText) : rawText ? { raw: rawText } : void 0;
			await handleSlashCommand({
				command: cmd,
				ack,
				respond,
				body,
				prompt: commandDefinition ? slashCommandsRuntime.buildCommandTextFromArgs(commandDefinition, commandArgs) : rawText ? `/${command.name} ${rawText}` : `/${command.name}`,
				commandArgs,
				commandDefinition: commandDefinition ?? void 0
			});
		});
	} else if (slashCommand.enabled) ctx.app.command(buildSlackSlashCommandMatcher(slashCommand.name), async ({ command, ack, respond, body }) => {
		await handleSlashCommand({
			command,
			ack,
			respond,
			body,
			prompt: command.text?.trim() ?? ""
		});
	});
	else logVerbose("slack: slash commands disabled");
	if (nativeCommands.length === 0 || !supportsInteractiveArgMenus) return;
	const registerArgOptions = () => {
		const appWithOptions = ctx.app;
		if (typeof appWithOptions.options !== "function") return;
		appWithOptions.options(SLACK_COMMAND_ARG_ACTION_ID, async ({ ack, body }) => {
			if (ctx.shouldDropMismatchedSlackEvent?.(body)) {
				await ack({ options: [] });
				runtime.log?.("slack: drop slash arg options payload (mismatched app/team)");
				return;
			}
			const typedBody = body;
			const token = readSlackExternalArgMenuToken(typedBody.actions?.[0]?.block_id ?? typedBody.block_id);
			if (!token) {
				await ack({ options: [] });
				return;
			}
			const entry = slackExternalArgMenuStore.get(token);
			if (!entry) {
				await ack({ options: [] });
				return;
			}
			const requesterUserId = typedBody.user?.id?.trim();
			if (!requesterUserId || requesterUserId !== entry.userId) {
				await ack({ options: [] });
				return;
			}
			const query = normalizeLowercaseStringOrEmpty(typedBody.value);
			await ack({ options: entry.choices.filter((choice) => !query || normalizeLowercaseStringOrEmpty(choice.label).includes(query)).slice(0, SLACK_COMMAND_ARG_SELECT_OPTIONS_MAX).map((choice) => ({
				text: {
					type: "plain_text",
					text: choice.label.slice(0, 75)
				},
				value: choice.value
			})) });
		});
	};
	try {
		registerArgOptions();
	} catch (err) {
		supportsExternalArgMenus = false;
		logVerbose(`slack: external arg-menu registration failed, falling back to static menus: ${String(err)}`);
	}
	const registerArgAction = (actionId) => {
		ctx.app.action(actionId, async (args) => {
			const { ack, body, respond } = args;
			const action = args.action;
			await ack();
			if (ctx.shouldDropMismatchedSlackEvent?.(body)) {
				runtime.log?.("slack: drop slash arg action payload (mismatched app/team)");
				return;
			}
			const respondFn = respond ?? (async (payload) => {
				if (!body.channel?.id || !body.user?.id) return;
				await ctx.app.client.chat.postEphemeral({
					token: ctx.botToken,
					channel: body.channel.id,
					user: body.user.id,
					text: payload.text,
					blocks: payload.blocks
				});
			});
			const parsed = parseSlackCommandArgValue(action?.value ?? action?.selected_option?.value);
			if (!parsed) {
				await respondFn({
					text: "Sorry, that button is no longer valid.",
					response_type: "ephemeral"
				});
				return;
			}
			if (body.user?.id && parsed.userId !== body.user.id) {
				await respondFn({
					text: "That menu is for another user.",
					response_type: "ephemeral"
				});
				return;
			}
			const { buildCommandTextFromArgs, findCommandByNativeName } = await loadSlashCommandsRuntime();
			const commandDefinition = findCommandByNativeName(parsed.command, "slack");
			const commandArgs = { values: { [parsed.arg]: parsed.value } };
			const prompt = commandDefinition ? buildCommandTextFromArgs(commandDefinition, commandArgs) : `/${parsed.command} ${parsed.value}`;
			const user = body.user;
			const userName = user && "name" in user && user.name ? user.name : user && "username" in user && user.username ? user.username : user?.id ?? "";
			const triggerId = "trigger_id" in body ? body.trigger_id : void 0;
			await handleSlashCommand({
				command: {
					user_id: user?.id ?? "",
					user_name: userName,
					channel_id: body.channel?.id ?? "",
					channel_name: body.channel?.name ?? body.channel?.id ?? "",
					trigger_id: triggerId
				},
				ack: async () => {},
				respond: respondFn,
				body,
				prompt,
				commandArgs,
				commandDefinition: commandDefinition ?? void 0
			});
		});
	};
	registerArgAction(SLACK_COMMAND_ARG_ACTION_LISTENER);
}
//#endregion
//#region extensions/slack/src/monitor/provider.ts
function isConstructorFunction(value) {
	return typeof value === "function";
}
function resolveSlackBoltModule(value) {
	if (!value || typeof value !== "object") return null;
	const app = Reflect.get(value, "App");
	const httpReceiver = Reflect.get(value, "HTTPReceiver");
	if (!isConstructorFunction(app) || !isConstructorFunction(httpReceiver)) return null;
	return {
		App: app,
		HTTPReceiver: httpReceiver
	};
}
function resolveSlackBoltInterop(params) {
	const { defaultImport, namespaceImport } = params;
	const nestedDefault = defaultImport && typeof defaultImport === "object" ? Reflect.get(defaultImport, "default") : void 0;
	const namespaceDefault = namespaceImport && typeof namespaceImport === "object" ? Reflect.get(namespaceImport, "default") : void 0;
	const namespaceReceiver = namespaceImport && typeof namespaceImport === "object" ? Reflect.get(namespaceImport, "HTTPReceiver") : void 0;
	const directModule = resolveSlackBoltModule(defaultImport) ?? resolveSlackBoltModule(nestedDefault) ?? resolveSlackBoltModule(namespaceDefault) ?? resolveSlackBoltModule(namespaceImport);
	if (directModule) return directModule;
	if (isConstructorFunction(defaultImport) && isConstructorFunction(namespaceReceiver)) return {
		App: defaultImport,
		HTTPReceiver: namespaceReceiver
	};
	throw new TypeError("Unable to resolve @slack/bolt App/HTTPReceiver exports");
}
let slackBoltInterop;
function getSlackBoltInterop() {
	if (!slackBoltInterop) slackBoltInterop = resolveSlackBoltInterop({
		defaultImport: SlackBolt,
		namespaceImport: SlackBoltNamespace
	});
	return slackBoltInterop;
}
const SLACK_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024;
const SLACK_WEBHOOK_BODY_TIMEOUT_MS = 3e4;
function parseApiAppIdFromAppToken(raw) {
	const token = raw?.trim();
	if (!token) return;
	return /^xapp-\d-([a-z0-9]+)-/i.exec(token)?.[1]?.toUpperCase();
}
function publishSlackConnectedStatus(setStatus) {
	if (!setStatus) return;
	setStatus({
		...createConnectedChannelStatusPatch(Date.now()),
		lastError: null
	});
}
function publishSlackDisconnectedStatus(setStatus, error) {
	if (!setStatus) return;
	const at = Date.now();
	const message = error ? formatUnknownError(error) : void 0;
	setStatus({
		connected: false,
		lastDisconnect: message ? {
			at,
			error: message
		} : { at },
		lastError: message ?? null
	});
}
function resolveSlackSocketShutdownClient(app) {
	if (!app || typeof app !== "object") return;
	const receiver = Reflect.get(app, "receiver");
	if (!receiver || typeof receiver !== "object") return;
	const client = Reflect.get(receiver, "client");
	if (!client || typeof client !== "object") return;
	return client;
}
async function gracefulStopSlackApp(app) {
	const socketClient = resolveSlackSocketShutdownClient(app);
	if (socketClient) socketClient.shuttingDown = true;
	await Promise.resolve(app.stop()).catch(() => void 0);
}
function formatSlackResolvedLabel(params) {
	const extras = params.extra?.filter(Boolean) ?? [];
	const suffix = extras.length > 0 ? ` (id:${params.id}, ${extras.join(", ")})` : ` (id:${params.id})`;
	return `${params.input}→${params.name ?? params.id}${suffix}`;
}
function formatSlackChannelResolved(entry) {
	const id = entry.id ?? entry.input;
	return formatSlackResolvedLabel({
		input: entry.input,
		id,
		name: entry.name,
		extra: entry.archived ? ["archived"] : []
	});
}
function formatSlackUserResolved(entry) {
	const id = entry.id ?? entry.input;
	return formatSlackResolvedLabel({
		input: entry.input,
		id,
		name: entry.name,
		extra: entry.note ? [entry.note] : []
	});
}
async function monitorSlackProvider(opts = {}) {
	const cfg = opts.config ?? loadConfig$1();
	const runtime = opts.runtime ?? createNonExitingRuntime();
	let account = resolveSlackAccount({
		cfg,
		accountId: opts.accountId
	});
	if (!account.enabled) {
		runtime.log?.(`[${account.accountId}] slack account disabled; monitor startup skipped`);
		if (opts.abortSignal?.aborted) return;
		await new Promise((resolve) => {
			opts.abortSignal?.addEventListener("abort", () => resolve(), { once: true });
		});
		return;
	}
	const historyLimit = Math.max(0, account.config.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? DEFAULT_GROUP_HISTORY_LIMIT);
	const sessionCfg = cfg.session;
	const sessionScope = sessionCfg?.scope ?? "per-sender";
	const mainKey = normalizeMainKey(sessionCfg?.mainKey);
	const slackMode = opts.mode ?? account.config.mode ?? "socket";
	const slackWebhookPath = normalizeSlackWebhookPath(account.config.webhookPath);
	const signingSecret = normalizeResolvedSecretInputString({
		value: account.config.signingSecret,
		path: `channels.slack.accounts.${account.accountId}.signingSecret`
	});
	const botToken = resolveSlackBotToken(opts.botToken ?? account.botToken);
	const appToken = resolveSlackAppToken(opts.appToken ?? account.appToken);
	if (!botToken || slackMode !== "http" && !appToken) {
		const missing = slackMode === "http" ? `Slack bot token missing for account "${account.accountId}" (set channels.slack.accounts.${account.accountId}.botToken or SLACK_BOT_TOKEN for default).` : `Slack bot + app tokens missing for account "${account.accountId}" (set channels.slack.accounts.${account.accountId}.botToken/appToken or SLACK_BOT_TOKEN/SLACK_APP_TOKEN for default).`;
		throw new Error(missing);
	}
	if (slackMode === "http" && !signingSecret) throw new Error(`Slack signing secret missing for account "${account.accountId}" (set channels.slack.signingSecret or channels.slack.accounts.${account.accountId}.signingSecret).`);
	const slackCfg = account.config;
	const dmConfig = slackCfg.dm;
	const dmEnabled = dmConfig?.enabled ?? true;
	const dmPolicy = slackCfg.dmPolicy ?? dmConfig?.policy ?? "pairing";
	let allowFrom = slackCfg.allowFrom ?? dmConfig?.allowFrom;
	const groupDmEnabled = dmConfig?.groupEnabled ?? false;
	const groupDmChannels = dmConfig?.groupChannels;
	let channelsConfig = slackCfg.channels;
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.slack !== void 0,
		groupPolicy: slackCfg.groupPolicy,
		defaultGroupPolicy
	});
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "slack",
		accountId: account.accountId,
		log: (message) => runtime.log?.(warn(message))
	});
	const resolveToken = account.userToken || botToken;
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const reactionMode = slackCfg.reactionNotifications ?? "own";
	const reactionAllowlist = slackCfg.reactionAllowlist ?? [];
	const replyToMode = slackCfg.replyToMode ?? "off";
	const threadHistoryScope = slackCfg.thread?.historyScope ?? "thread";
	const threadInheritParent = slackCfg.thread?.inheritParent ?? false;
	const threadRequireExplicitMention = slackCfg.thread?.requireExplicitMention ?? false;
	const slashCommand = resolveSlackSlashCommandConfig(opts.slashCommand ?? slackCfg.slashCommand);
	const textLimit = resolveTextChunkLimit(cfg, "slack", account.accountId, { fallbackLimit: SLACK_TEXT_LIMIT });
	const ackReactionScope = cfg.messages?.ackReactionScope ?? "group-mentions";
	const typingReaction = slackCfg.typingReaction?.trim() ?? "";
	const mediaMaxBytes = (opts.mediaMaxMb ?? slackCfg.mediaMaxMb ?? 20) * 1024 * 1024;
	const removeAckAfterReply = cfg.messages?.removeAckAfterReply ?? false;
	const { App, HTTPReceiver } = getSlackBoltInterop();
	const receiver = slackMode === "http" ? new HTTPReceiver({
		signingSecret: signingSecret ?? "",
		endpoints: slackWebhookPath
	}) : null;
	const clientOptions = resolveSlackWebClientOptions();
	const app = new App(slackMode === "socket" ? {
		token: botToken,
		appToken,
		socketMode: true,
		clientOptions
	} : {
		token: botToken,
		receiver: receiver ?? void 0,
		clientOptions
	});
	const gracefulStop = async () => {
		await gracefulStopSlackApp(app);
	};
	const slackHttpHandler = slackMode === "http" && receiver ? async (req, res) => {
		const guard = installRequestBodyLimitGuard(req, res, {
			maxBytes: SLACK_WEBHOOK_MAX_BODY_BYTES,
			timeoutMs: SLACK_WEBHOOK_BODY_TIMEOUT_MS,
			responseFormat: "text"
		});
		if (guard.isTripped()) return;
		try {
			await Promise.resolve(receiver.requestListener(req, res));
		} catch (err) {
			if (!guard.isTripped()) throw err;
		} finally {
			guard.dispose();
		}
	} : null;
	let unregisterHttpHandler = null;
	let botUserId = "";
	let teamId = "";
	let apiAppId = "";
	const expectedApiAppIdFromAppToken = parseApiAppIdFromAppToken(appToken);
	try {
		const auth = await app.client.auth.test({ token: botToken });
		botUserId = auth.user_id ?? "";
		teamId = auth.team_id ?? "";
		apiAppId = auth.api_app_id ?? "";
	} catch {}
	if (apiAppId && expectedApiAppIdFromAppToken && apiAppId !== expectedApiAppIdFromAppToken) runtime.error?.(`slack token mismatch: bot token api_app_id=${apiAppId} but app token looks like api_app_id=${expectedApiAppIdFromAppToken}`);
	const ctx = createSlackMonitorContext({
		cfg,
		accountId: account.accountId,
		botToken,
		app,
		runtime,
		botUserId,
		teamId,
		apiAppId,
		historyLimit,
		sessionScope,
		mainKey,
		dmEnabled,
		dmPolicy,
		allowFrom,
		allowNameMatching: isDangerousNameMatchingEnabled(slackCfg),
		groupDmEnabled,
		groupDmChannels,
		defaultRequireMention: slackCfg.requireMention,
		channelsConfig,
		groupPolicy,
		useAccessGroups,
		reactionMode,
		reactionAllowlist,
		replyToMode,
		threadHistoryScope,
		threadInheritParent,
		threadRequireExplicitMention,
		slashCommand,
		textLimit,
		ackReactionScope,
		typingReaction,
		mediaMaxBytes,
		removeAckAfterReply
	});
	const trackEvent = opts.setStatus ? () => {
		opts.setStatus({
			lastEventAt: Date.now(),
			lastInboundAt: Date.now()
		});
	} : void 0;
	const handleSlackMessage = createSlackMessageHandler({
		ctx,
		account,
		trackEvent
	});
	if (isSlackExecApprovalClientEnabled({
		cfg,
		accountId: account.accountId
	})) registerChannelRuntimeContext({
		channelRuntime: opts.channelRuntime,
		channelId: "slack",
		accountId: account.accountId,
		capability: CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY,
		context: {
			app,
			config: slackCfg.execApprovals ?? {}
		},
		abortSignal: opts.abortSignal
	});
	registerSlackMonitorEvents({
		ctx,
		account,
		handleSlackMessage,
		trackEvent
	});
	await registerSlackMonitorSlashCommands({
		ctx,
		account
	});
	if (slackMode === "http" && slackHttpHandler) unregisterHttpHandler = registerSlackHttpHandler({
		path: slackWebhookPath,
		handler: slackHttpHandler,
		log: runtime.log,
		accountId: account.accountId
	});
	if (resolveToken) (async () => {
		if (opts.abortSignal?.aborted) return;
		if (channelsConfig && Object.keys(channelsConfig).length > 0) try {
			const entries = Object.keys(channelsConfig).filter((key) => key !== "*");
			if (entries.length > 0) {
				const resolved = await resolveSlackChannelAllowlist({
					token: resolveToken,
					entries
				});
				const nextChannels = { ...channelsConfig };
				const mapping = [];
				const unresolved = [];
				for (const entry of resolved) {
					const source = channelsConfig?.[entry.input];
					if (!source) continue;
					if (!entry.resolved || !entry.id) {
						unresolved.push(entry.input);
						continue;
					}
					mapping.push(formatSlackChannelResolved(entry));
					const existing = nextChannels[entry.id] ?? {};
					nextChannels[entry.id] = {
						...source,
						...existing
					};
				}
				channelsConfig = nextChannels;
				ctx.channelsConfig = nextChannels;
				summarizeMapping("slack channels", mapping, unresolved, runtime);
			}
		} catch (err) {
			runtime.log?.(`slack channel resolve failed; using config entries. ${String(err)}`);
		}
		const allowEntries = normalizeStringEntries(allowFrom).filter((entry) => entry !== "*");
		if (allowEntries.length > 0) try {
			const { mapping, unresolved, additions } = buildAllowlistResolutionSummary(await resolveSlackUserAllowlist({
				token: resolveToken,
				entries: allowEntries
			}), { formatResolved: formatSlackUserResolved });
			allowFrom = mergeAllowlist({
				existing: allowFrom,
				additions
			});
			ctx.allowFrom = normalizeAllowList(allowFrom);
			summarizeMapping("slack users", mapping, unresolved, runtime);
		} catch (err) {
			runtime.log?.(`slack user resolve failed; using config entries. ${String(err)}`);
		}
		if (channelsConfig && Object.keys(channelsConfig).length > 0) {
			const userEntries = /* @__PURE__ */ new Set();
			for (const channel of Object.values(channelsConfig)) addAllowlistUserEntriesFromConfigEntry(userEntries, channel);
			if (userEntries.size > 0) try {
				const { resolvedMap, mapping, unresolved } = buildAllowlistResolutionSummary(await resolveSlackUserAllowlist({
					token: resolveToken,
					entries: Array.from(userEntries)
				}), { formatResolved: formatSlackUserResolved });
				const nextChannels = patchAllowlistUsersInConfigEntries({
					entries: channelsConfig,
					resolvedMap
				});
				channelsConfig = nextChannels;
				ctx.channelsConfig = nextChannels;
				summarizeMapping("slack channel users", mapping, unresolved, runtime);
			} catch (err) {
				runtime.log?.(`slack channel user resolve failed; using config entries. ${String(err)}`);
			}
		}
	})();
	const stopOnAbort = () => {
		if (opts.abortSignal?.aborted && slackMode === "socket") gracefulStop();
	};
	opts.abortSignal?.addEventListener("abort", stopOnAbort, { once: true });
	try {
		if (slackMode === "socket") {
			let reconnectAttempts = 0;
			while (!opts.abortSignal?.aborted) {
				try {
					await app.start();
					reconnectAttempts = 0;
					publishSlackConnectedStatus(opts.setStatus);
					runtime.log?.("slack socket mode connected");
				} catch (err) {
					if (isNonRecoverableSlackAuthError(err)) {
						runtime.error?.(`slack socket mode failed to start due to non-recoverable auth error — skipping channel (${formatUnknownError(err)})`);
						throw err;
					}
					reconnectAttempts += 1;
					if (SLACK_SOCKET_RECONNECT_POLICY.maxAttempts > 0 && reconnectAttempts >= SLACK_SOCKET_RECONNECT_POLICY.maxAttempts) throw err;
					const delayMs = computeBackoff(SLACK_SOCKET_RECONNECT_POLICY, reconnectAttempts);
					runtime.error?.(`slack socket mode failed to start. retry ${reconnectAttempts}/${SLACK_SOCKET_RECONNECT_POLICY.maxAttempts || "∞"} in ${Math.round(delayMs / 1e3)}s (${formatUnknownError(err)})`);
					try {
						await sleepWithAbort(delayMs, opts.abortSignal);
					} catch {
						break;
					}
					continue;
				}
				if (opts.abortSignal?.aborted) break;
				const disconnect = await waitForSlackSocketDisconnect(app, opts.abortSignal);
				if (opts.abortSignal?.aborted) break;
				publishSlackDisconnectedStatus(opts.setStatus, disconnect.error);
				if (disconnect.error && isNonRecoverableSlackAuthError(disconnect.error)) {
					runtime.error?.(`slack socket mode disconnected due to non-recoverable auth error — skipping channel (${formatUnknownError(disconnect.error)})`);
					throw disconnect.error instanceof Error ? disconnect.error : new Error(formatUnknownError(disconnect.error));
				}
				reconnectAttempts += 1;
				if (SLACK_SOCKET_RECONNECT_POLICY.maxAttempts > 0 && reconnectAttempts >= SLACK_SOCKET_RECONNECT_POLICY.maxAttempts) throw new Error(`Slack socket mode reconnect max attempts reached (${reconnectAttempts}/${SLACK_SOCKET_RECONNECT_POLICY.maxAttempts}) after ${disconnect.event}`);
				const delayMs = computeBackoff(SLACK_SOCKET_RECONNECT_POLICY, reconnectAttempts);
				runtime.error?.(`slack socket disconnected (${disconnect.event}). retry ${reconnectAttempts}/${SLACK_SOCKET_RECONNECT_POLICY.maxAttempts || "∞"} in ${Math.round(delayMs / 1e3)}s${disconnect.error ? ` (${formatUnknownError(disconnect.error)})` : ""}`);
				await gracefulStop();
				try {
					await sleepWithAbort(delayMs, opts.abortSignal);
				} catch {
					break;
				}
			}
		} else {
			runtime.log?.(`slack http mode listening at ${slackWebhookPath}`);
			if (!opts.abortSignal?.aborted) await new Promise((resolve) => {
				opts.abortSignal?.addEventListener("abort", () => resolve(), { once: true });
			});
		}
	} finally {
		opts.abortSignal?.removeEventListener("abort", stopOnAbort);
		unregisterHttpHandler?.();
		await gracefulStop();
	}
}
const resolveSlackRuntimeGroupPolicy = resolveOpenProviderRuntimeGroupPolicy;
//#endregion
export { resolveSlackRuntimeGroupPolicy as n, monitorSlackProvider as t };
