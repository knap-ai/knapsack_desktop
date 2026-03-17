import { h as DEFAULT_ACCOUNT_ID } from "./session-key-CbP51u9x.js";
import { $t as resolveSlackUserAllowlist, E as formatDocsLink, Jr as createActionGate, Qr as readStringParam, Xr as readNumberParam, _o as resolveSlackAccount, go as resolveDefaultSlackAccountId, ho as listSlackAccountIds, j as resolveSlackChannelAllowlist, mo as listEnabledSlackAccounts, po as inspectSlackAccount, ui as parseSlackBlocksInput } from "./thread-bindings-SYAnWHuW.js";
import { tt as hasConfiguredSecretInput } from "./zod-schema.core-CtLVNGPW.js";
import { S as setOnboardingChannelEnabled, _ as resolveOnboardingAccountId, c as parseMentionOrPrefixedId, f as promptLegacyChannelAllowFrom, g as resolveAccountIdForConfigure, o as noteChannelLookupFailure, s as noteChannelLookupSummary, u as patchChannelConfigForAccount, v as runSingleChannelSecretStep, x as setLegacyChannelDmPolicyWithAllowFrom, y as setAccountGroupPolicyForChannel } from "./helpers-uRGq4pbi.js";
import { t as configureChannelAccessWithAllowlist } from "./channel-access-configure-CjNwEzW9.js";
//#region src/plugin-sdk/slack-message-actions.ts
function readSlackBlocksParam(actionParams) {
	return parseSlackBlocksInput(actionParams.blocks);
}
async function handleSlackMessageAction(params) {
	const { providerId, ctx, invoke, normalizeChannelId, includeReadThreadId = false } = params;
	const { action, cfg, params: actionParams } = ctx;
	const accountId = ctx.accountId ?? void 0;
	const resolveChannelId = () => {
		const channelId = readStringParam(actionParams, "channelId") ?? readStringParam(actionParams, "to", { required: true });
		return normalizeChannelId ? normalizeChannelId(channelId) : channelId;
	};
	if (action === "send") {
		const to = readStringParam(actionParams, "to", { required: true });
		const content = readStringParam(actionParams, "message", {
			required: false,
			allowEmpty: true
		});
		const mediaUrl = readStringParam(actionParams, "media", { trim: false });
		const blocks = readSlackBlocksParam(actionParams);
		if (!content && !mediaUrl && !blocks) throw new Error("Slack send requires message, blocks, or media.");
		if (mediaUrl && blocks) throw new Error("Slack send does not support blocks with media.");
		const threadId = readStringParam(actionParams, "threadId");
		const replyTo = readStringParam(actionParams, "replyTo");
		return await invoke({
			action: "sendMessage",
			to,
			content: content ?? "",
			mediaUrl: mediaUrl ?? void 0,
			blocks,
			accountId,
			threadTs: threadId ?? replyTo ?? void 0
		}, cfg, ctx.toolContext);
	}
	if (action === "react") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		const emoji = readStringParam(actionParams, "emoji", { allowEmpty: true });
		const remove = typeof actionParams.remove === "boolean" ? actionParams.remove : void 0;
		return await invoke({
			action: "react",
			channelId: resolveChannelId(),
			messageId,
			emoji,
			remove,
			accountId
		}, cfg);
	}
	if (action === "reactions") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		const limit = readNumberParam(actionParams, "limit", { integer: true });
		return await invoke({
			action: "reactions",
			channelId: resolveChannelId(),
			messageId,
			limit,
			accountId
		}, cfg);
	}
	if (action === "read") {
		const limit = readNumberParam(actionParams, "limit", { integer: true });
		const readAction = {
			action: "readMessages",
			channelId: resolveChannelId(),
			limit,
			before: readStringParam(actionParams, "before"),
			after: readStringParam(actionParams, "after"),
			accountId
		};
		if (includeReadThreadId) readAction.threadId = readStringParam(actionParams, "threadId");
		return await invoke(readAction, cfg);
	}
	if (action === "edit") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		const content = readStringParam(actionParams, "message", { allowEmpty: true });
		const blocks = readSlackBlocksParam(actionParams);
		if (!content && !blocks) throw new Error("Slack edit requires message or blocks.");
		return await invoke({
			action: "editMessage",
			channelId: resolveChannelId(),
			messageId,
			content: content ?? "",
			blocks,
			accountId
		}, cfg);
	}
	if (action === "delete") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		return await invoke({
			action: "deleteMessage",
			channelId: resolveChannelId(),
			messageId,
			accountId
		}, cfg);
	}
	if (action === "pin" || action === "unpin" || action === "list-pins") {
		const messageId = action === "list-pins" ? void 0 : readStringParam(actionParams, "messageId", { required: true });
		return await invoke({
			action: action === "pin" ? "pinMessage" : action === "unpin" ? "unpinMessage" : "listPins",
			channelId: resolveChannelId(),
			messageId,
			accountId
		}, cfg);
	}
	if (action === "member-info") return await invoke({
		action: "memberInfo",
		userId: readStringParam(actionParams, "userId", { required: true }),
		accountId
	}, cfg);
	if (action === "emoji-list") return await invoke({
		action: "emojiList",
		limit: readNumberParam(actionParams, "limit", { integer: true }),
		accountId
	}, cfg);
	if (action === "download-file") {
		const fileId = readStringParam(actionParams, "fileId", { required: true });
		const channelId = readStringParam(actionParams, "channelId") ?? readStringParam(actionParams, "to");
		const threadId = readStringParam(actionParams, "threadId") ?? readStringParam(actionParams, "replyTo");
		return await invoke({
			action: "downloadFile",
			fileId,
			channelId: channelId ?? void 0,
			threadId: threadId ?? void 0,
			accountId
		}, cfg);
	}
	throw new Error(`Action ${action} is not supported for provider ${providerId}.`);
}
//#endregion
//#region src/slack/message-actions.ts
function listSlackMessageActions(cfg) {
	const accounts = listEnabledSlackAccounts(cfg).filter((account) => account.botTokenSource !== "none");
	if (accounts.length === 0) return [];
	const isActionEnabled = (key, defaultValue = true) => {
		for (const account of accounts) if (createActionGate(account.actions ?? cfg.channels?.slack?.actions)(key, defaultValue)) return true;
		return false;
	};
	const actions = new Set(["send"]);
	if (isActionEnabled("reactions")) {
		actions.add("react");
		actions.add("reactions");
	}
	if (isActionEnabled("messages")) {
		actions.add("read");
		actions.add("edit");
		actions.add("delete");
		actions.add("download-file");
	}
	if (isActionEnabled("pins")) {
		actions.add("pin");
		actions.add("unpin");
		actions.add("list-pins");
	}
	if (isActionEnabled("memberInfo")) actions.add("member-info");
	if (isActionEnabled("emojiList")) actions.add("emoji-list");
	return Array.from(actions);
}
function extractSlackToolSend(args) {
	if ((typeof args.action === "string" ? args.action.trim() : "") !== "sendMessage") return null;
	const to = typeof args.to === "string" ? args.to : void 0;
	if (!to) return null;
	return {
		to,
		accountId: typeof args.accountId === "string" ? args.accountId.trim() : void 0
	};
}
//#endregion
//#region src/channels/plugins/onboarding/slack.ts
const channel = "slack";
function buildSlackManifest(botName) {
	const safeName = botName.trim() || "OpenClaw";
	const manifest = {
		display_information: {
			name: safeName,
			description: `${safeName} connector for OpenClaw`
		},
		features: {
			bot_user: {
				display_name: safeName,
				always_online: false
			},
			app_home: {
				messages_tab_enabled: true,
				messages_tab_read_only_enabled: false
			},
			slash_commands: [{
				command: "/openclaw",
				description: "Send a message to OpenClaw",
				should_escape: false
			}]
		},
		oauth_config: { scopes: { bot: [
			"chat:write",
			"channels:history",
			"channels:read",
			"groups:history",
			"im:history",
			"mpim:history",
			"users:read",
			"app_mentions:read",
			"reactions:read",
			"reactions:write",
			"pins:read",
			"pins:write",
			"emoji:read",
			"commands",
			"files:read",
			"files:write"
		] } },
		settings: {
			socket_mode_enabled: true,
			event_subscriptions: { bot_events: [
				"app_mention",
				"message.channels",
				"message.groups",
				"message.im",
				"message.mpim",
				"reaction_added",
				"reaction_removed",
				"member_joined_channel",
				"member_left_channel",
				"channel_rename",
				"pin_added",
				"pin_removed"
			] }
		}
	};
	return JSON.stringify(manifest, null, 2);
}
async function noteSlackTokenHelp(prompter, botName) {
	const manifest = buildSlackManifest(botName);
	await prompter.note([
		"1) Slack API → Create App → From scratch or From manifest (with the JSON below)",
		"2) Add Socket Mode + enable it to get the app-level token (xapp-...)",
		"3) Install App to workspace to get the xoxb- bot token",
		"4) Enable Event Subscriptions (socket) for message events",
		"5) App Home → enable the Messages tab for DMs",
		"Tip: set SLACK_BOT_TOKEN + SLACK_APP_TOKEN in your env.",
		`Docs: ${formatDocsLink("/slack", "slack")}`,
		"",
		"Manifest (JSON):",
		manifest
	].join("\n"), "Slack socket mode tokens");
}
function setSlackChannelAllowlist(cfg, accountId, channelKeys) {
	return patchChannelConfigForAccount({
		cfg,
		channel: "slack",
		accountId,
		patch: { channels: Object.fromEntries(channelKeys.map((key) => [key, { allow: true }])) }
	});
}
async function promptSlackAllowFrom(params) {
	const accountId = resolveOnboardingAccountId({
		accountId: params.accountId,
		defaultAccountId: resolveDefaultSlackAccountId(params.cfg)
	});
	const resolved = resolveSlackAccount({
		cfg: params.cfg,
		accountId
	});
	const token = resolved.userToken ?? resolved.botToken ?? "";
	const existing = params.cfg.channels?.slack?.allowFrom ?? params.cfg.channels?.slack?.dm?.allowFrom ?? [];
	const parseId = (value) => parseMentionOrPrefixedId({
		value,
		mentionPattern: /^<@([A-Z0-9]+)>$/i,
		prefixPattern: /^(slack:|user:)/i,
		idPattern: /^[A-Z][A-Z0-9]+$/i,
		normalizeId: (id) => id.toUpperCase()
	});
	return promptLegacyChannelAllowFrom({
		cfg: params.cfg,
		channel: "slack",
		prompter: params.prompter,
		existing,
		token,
		noteTitle: "Slack allowlist",
		noteLines: [
			"Allowlist Slack DMs by username (we resolve to user ids).",
			"Examples:",
			"- U12345678",
			"- @alice",
			"Multiple entries: comma-separated.",
			`Docs: ${formatDocsLink("/slack", "slack")}`
		],
		message: "Slack allowFrom (usernames or ids)",
		placeholder: "@alice, U12345678",
		parseId,
		invalidWithoutTokenNote: "Slack token missing; use user ids (or mention form) only.",
		resolveEntries: ({ token, entries }) => resolveSlackUserAllowlist({
			token,
			entries
		})
	});
}
const slackOnboardingAdapter = {
	channel,
	getStatus: async ({ cfg }) => {
		const configured = listSlackAccountIds(cfg).some((accountId) => {
			return inspectSlackAccount({
				cfg,
				accountId
			}).configured;
		});
		return {
			channel,
			configured,
			statusLines: [`Slack: ${configured ? "configured" : "needs tokens"}`],
			selectionHint: configured ? "configured" : "needs tokens",
			quickstartScore: configured ? 2 : 1
		};
	},
	configure: async ({ cfg, prompter, options, accountOverrides, shouldPromptAccountIds }) => {
		const defaultSlackAccountId = resolveDefaultSlackAccountId(cfg);
		const slackAccountId = await resolveAccountIdForConfigure({
			cfg,
			prompter,
			label: "Slack",
			accountOverride: accountOverrides.slack,
			shouldPromptAccountIds,
			listAccountIds: listSlackAccountIds,
			defaultAccountId: defaultSlackAccountId
		});
		let next = cfg;
		const resolvedAccount = resolveSlackAccount({
			cfg: next,
			accountId: slackAccountId
		});
		const hasConfiguredBotToken = hasConfiguredSecretInput(resolvedAccount.config.botToken);
		const hasConfiguredAppToken = hasConfiguredSecretInput(resolvedAccount.config.appToken);
		const hasConfigTokens = hasConfiguredBotToken && hasConfiguredAppToken;
		const accountConfigured = Boolean(resolvedAccount.botToken && resolvedAccount.appToken) || hasConfigTokens;
		const allowEnv = slackAccountId === DEFAULT_ACCOUNT_ID;
		let resolvedBotTokenForAllowlist = resolvedAccount.botToken;
		const slackBotName = String(await prompter.text({
			message: "Slack bot display name (used for manifest)",
			initialValue: "OpenClaw"
		})).trim();
		if (!accountConfigured) await noteSlackTokenHelp(prompter, slackBotName);
		const botTokenStep = await runSingleChannelSecretStep({
			cfg: next,
			prompter,
			providerHint: "slack-bot",
			credentialLabel: "Slack bot token",
			secretInputMode: options?.secretInputMode,
			accountConfigured: Boolean(resolvedAccount.botToken) || hasConfiguredBotToken,
			hasConfigToken: hasConfiguredBotToken,
			allowEnv,
			envValue: process.env.SLACK_BOT_TOKEN,
			envPrompt: "SLACK_BOT_TOKEN detected. Use env var?",
			keepPrompt: "Slack bot token already configured. Keep it?",
			inputPrompt: "Enter Slack bot token (xoxb-...)",
			preferredEnvVar: allowEnv ? "SLACK_BOT_TOKEN" : void 0,
			applySet: async (cfg, value) => patchChannelConfigForAccount({
				cfg,
				channel: "slack",
				accountId: slackAccountId,
				patch: { botToken: value }
			})
		});
		next = botTokenStep.cfg;
		if (botTokenStep.resolvedValue) resolvedBotTokenForAllowlist = botTokenStep.resolvedValue;
		next = (await runSingleChannelSecretStep({
			cfg: next,
			prompter,
			providerHint: "slack-app",
			credentialLabel: "Slack app token",
			secretInputMode: options?.secretInputMode,
			accountConfigured: Boolean(resolvedAccount.appToken) || hasConfiguredAppToken,
			hasConfigToken: hasConfiguredAppToken,
			allowEnv,
			envValue: process.env.SLACK_APP_TOKEN,
			envPrompt: "SLACK_APP_TOKEN detected. Use env var?",
			keepPrompt: "Slack app token already configured. Keep it?",
			inputPrompt: "Enter Slack app token (xapp-...)",
			preferredEnvVar: allowEnv ? "SLACK_APP_TOKEN" : void 0,
			applySet: async (cfg, value) => patchChannelConfigForAccount({
				cfg,
				channel: "slack",
				accountId: slackAccountId,
				patch: { appToken: value }
			})
		})).cfg;
		next = await configureChannelAccessWithAllowlist({
			cfg: next,
			prompter,
			label: "Slack channels",
			currentPolicy: resolvedAccount.config.groupPolicy ?? "allowlist",
			currentEntries: Object.entries(resolvedAccount.config.channels ?? {}).filter(([, value]) => value?.allow !== false && value?.enabled !== false).map(([key]) => key),
			placeholder: "#general, #private, C123",
			updatePrompt: Boolean(resolvedAccount.config.channels),
			setPolicy: (cfg, policy) => setAccountGroupPolicyForChannel({
				cfg,
				channel: "slack",
				accountId: slackAccountId,
				groupPolicy: policy
			}),
			resolveAllowlist: async ({ cfg, entries }) => {
				let keys = entries;
				const activeBotToken = resolveSlackAccount({
					cfg,
					accountId: slackAccountId
				}).botToken || resolvedBotTokenForAllowlist || "";
				if (activeBotToken && entries.length > 0) try {
					const resolved = await resolveSlackChannelAllowlist({
						token: activeBotToken,
						entries
					});
					const resolvedKeys = resolved.filter((entry) => entry.resolved && entry.id).map((entry) => entry.id);
					const unresolved = resolved.filter((entry) => !entry.resolved).map((entry) => entry.input);
					keys = [...resolvedKeys, ...unresolved.map((entry) => entry.trim()).filter(Boolean)];
					await noteChannelLookupSummary({
						prompter,
						label: "Slack channels",
						resolvedSections: [{
							title: "Resolved",
							values: resolvedKeys
						}],
						unresolved
					});
				} catch (err) {
					await noteChannelLookupFailure({
						prompter,
						label: "Slack channels",
						error: err
					});
				}
				return keys;
			},
			applyAllowlist: ({ cfg, resolved }) => {
				return setSlackChannelAllowlist(cfg, slackAccountId, resolved);
			}
		});
		return {
			cfg: next,
			accountId: slackAccountId
		};
	},
	dmPolicy: {
		label: "Slack",
		channel,
		policyKey: "channels.slack.dmPolicy",
		allowFromKey: "channels.slack.allowFrom",
		getCurrent: (cfg) => cfg.channels?.slack?.dmPolicy ?? cfg.channels?.slack?.dm?.policy ?? "pairing",
		setPolicy: (cfg, policy) => setLegacyChannelDmPolicyWithAllowFrom({
			cfg,
			channel: "slack",
			dmPolicy: policy
		}),
		promptAllowFrom: promptSlackAllowFrom
	},
	disable: (cfg) => setOnboardingChannelEnabled(cfg, channel, false)
};
//#endregion
export { handleSlackMessageAction as i, extractSlackToolSend as n, listSlackMessageActions as r, slackOnboardingAdapter as t };
