import { a as resolveSlackAccount } from "./accounts-BnLQ3fe2.js";
import { t as inspectSlackAccount } from "./account-inspect-vVg3pT03.js";
import { hasConfiguredSecretInput } from "openclaw/plugin-sdk/secret-input";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
import { DEFAULT_ACCOUNT_ID, createAccountScopedAllowFromSection, createAccountScopedGroupAccessSection, createAllowlistSetupWizardProxy, createEnvPatchedAccountSetupAdapter, createLegacyCompatChannelDmPolicy, createSetupTranslator, createStandardChannelSetupStatus, parseMentionOrPrefixedId, patchChannelConfigForAccount, setSetupChannelEnabled } from "openclaw/plugin-sdk/setup-runtime";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
import { describeAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
//#region extensions/slack/src/setup-shared.ts
const SLACK_CHANNEL = "slack";
function buildSlackManifest(botName = "OpenClaw") {
	const safeName = botName.trim() || "OpenClaw";
	const manifest = {
		display_information: {
			name: safeName,
			description: `${safeName} connector for OpenClaw`
		},
		features: {
			bot_user: {
				display_name: safeName,
				always_online: true
			},
			app_home: {
				home_tab_enabled: true,
				messages_tab_enabled: true,
				messages_tab_read_only_enabled: false
			},
			assistant_view: {
				assistant_description: `${safeName} connects Slack assistant threads to OpenClaw agents.`,
				suggested_prompts: [
					{
						title: "What can you do?",
						message: "What can you help me with?"
					},
					{
						title: "Summarize this channel",
						message: "Summarize the recent activity in this channel."
					},
					{
						title: "Draft a reply",
						message: "Help me draft a reply."
					}
				]
			},
			slash_commands: [{
				command: "/openclaw",
				description: "Send a message to OpenClaw",
				should_escape: false
			}]
		},
		oauth_config: { scopes: { bot: [
			"app_mentions:read",
			"assistant:write",
			"channels:history",
			"channels:read",
			"chat:write",
			"commands",
			"emoji:read",
			"files:read",
			"files:write",
			"groups:history",
			"groups:read",
			"im:history",
			"im:read",
			"im:write",
			"mpim:history",
			"mpim:read",
			"mpim:write",
			"pins:read",
			"pins:write",
			"reactions:read",
			"reactions:write",
			"usergroups:read",
			"users:read"
		] } },
		settings: {
			socket_mode_enabled: true,
			event_subscriptions: { bot_events: [
				"app_home_opened",
				"app_mention",
				"assistant_thread_context_changed",
				"assistant_thread_started",
				"channel_rename",
				"member_joined_channel",
				"member_left_channel",
				"message.channels",
				"message.groups",
				"message.im",
				"message.mpim",
				"pin_added",
				"pin_removed",
				"reaction_added",
				"reaction_removed"
			] }
		}
	};
	return JSON.stringify(manifest, null, 2);
}
function buildSlackSetupLines() {
	return [
		"1) Slack API -> Create App -> From scratch or From manifest (with the JSON below)",
		"2) Add Socket Mode + enable it to get the app-level token (xapp-...)",
		"3) Install App to workspace to get the xoxb- bot token",
		"4) Enable Event Subscriptions (socket) for message, App Home, and assistant events",
		"5) App Home -> enable the Home tab, Messages tab for DMs, and AI assistant view",
		"Manifest JSON follows as plain text for copy/paste.",
		"Tip: set SLACK_BOT_TOKEN + SLACK_APP_TOKEN in your env.",
		`Docs: ${formatDocsLink("/slack", "slack")}`
	];
}
function setSlackChannelAllowlist(cfg, accountId, channelKeys) {
	return patchChannelConfigForAccount({
		cfg,
		channel: SLACK_CHANNEL,
		accountId,
		patch: { channels: Object.fromEntries(channelKeys.map((key) => [key, { enabled: true }])) }
	});
}
function isSlackSetupAccountConfigured(account) {
	const hasConfiguredBotToken = Boolean(account.botToken?.trim()) || hasConfiguredSecretInput(account.config.botToken);
	const hasConfiguredAppToken = Boolean(account.appToken?.trim()) || hasConfiguredSecretInput(account.config.appToken);
	return hasConfiguredBotToken && hasConfiguredAppToken;
}
function describeSlackSetupAccount(account) {
	return describeAccountSnapshot({
		account,
		configured: isSlackSetupAccountConfigured(account),
		extra: {
			botTokenSource: account.botTokenSource,
			appTokenSource: account.appTokenSource
		}
	});
}
//#endregion
//#region extensions/slack/src/setup-core.ts
const t = createSetupTranslator();
function enableSlackAccount(cfg, accountId) {
	return patchChannelConfigForAccount({
		cfg,
		channel: SLACK_CHANNEL,
		accountId,
		patch: { enabled: true }
	});
}
function hasSlackInteractiveRepliesConfig(cfg, accountId) {
	const capabilities = resolveSlackAccount({
		cfg,
		accountId
	}).config.capabilities;
	if (Array.isArray(capabilities)) return capabilities.some((entry) => normalizeLowercaseStringOrEmpty(entry) === "interactivereplies");
	if (!capabilities || typeof capabilities !== "object") return false;
	return "interactiveReplies" in capabilities;
}
function setSlackInteractiveReplies(cfg, accountId, interactiveReplies) {
	const capabilities = resolveSlackAccount({
		cfg,
		accountId
	}).config.capabilities;
	return patchChannelConfigForAccount({
		cfg,
		channel: SLACK_CHANNEL,
		accountId,
		patch: { capabilities: Array.isArray(capabilities) ? interactiveReplies ? [...new Set([...capabilities, "interactiveReplies"])] : capabilities.filter((entry) => normalizeLowercaseStringOrEmpty(entry) !== "interactivereplies") : {
			...capabilities && typeof capabilities === "object" ? capabilities : {},
			interactiveReplies
		} }
	});
}
function createSlackTokenCredential(params) {
	return {
		inputKey: params.inputKey,
		providerHint: params.providerHint,
		credentialLabel: params.credentialLabel,
		preferredEnvVar: params.preferredEnvVar,
		envPrompt: `${params.preferredEnvVar} detected. Use env var?`,
		keepPrompt: params.keepPrompt,
		inputPrompt: params.inputPrompt,
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveSlackAccount({
				cfg,
				accountId
			});
			const configuredValue = params.inputKey === "botToken" ? resolved.config.botToken : resolved.config.appToken;
			const resolvedValue = params.inputKey === "botToken" ? resolved.botToken : resolved.appToken;
			return {
				accountConfigured: Boolean(resolvedValue) || hasConfiguredSecretInput(configuredValue),
				hasConfiguredValue: hasConfiguredSecretInput(configuredValue),
				resolvedValue: normalizeOptionalString(resolvedValue),
				envValue: accountId === DEFAULT_ACCOUNT_ID ? normalizeOptionalString(process.env[params.preferredEnvVar]) : void 0
			};
		},
		applyUseEnv: ({ cfg, accountId }) => enableSlackAccount(cfg, accountId),
		applySet: ({ cfg, accountId, value }) => patchChannelConfigForAccount({
			cfg,
			channel: SLACK_CHANNEL,
			accountId,
			patch: {
				enabled: true,
				[params.inputKey]: value
			}
		})
	};
}
const slackSetupAdapter = createEnvPatchedAccountSetupAdapter({
	channelKey: SLACK_CHANNEL,
	defaultAccountOnlyEnvError: "Slack env tokens can only be used for the default account.",
	missingCredentialError: "Slack requires --bot-token and --app-token (or --use-env).",
	hasCredentials: (input) => Boolean(input.botToken && input.appToken),
	buildPatch: (input) => ({
		...input.botToken ? { botToken: input.botToken } : {},
		...input.appToken ? { appToken: input.appToken } : {}
	})
});
function createSlackSetupWizardBase(handlers) {
	const slackDmPolicy = createLegacyCompatChannelDmPolicy({
		label: "Slack",
		channel: SLACK_CHANNEL,
		promptAllowFrom: handlers.promptAllowFrom
	});
	return {
		channel: SLACK_CHANNEL,
		status: createStandardChannelSetupStatus({
			channelLabel: "Slack",
			configuredLabel: t("wizard.channels.statusConfigured"),
			unconfiguredLabel: t("wizard.channels.statusNeedsTokens"),
			configuredHint: t("wizard.channels.statusConfigured"),
			unconfiguredHint: t("wizard.channels.statusNeedsTokens"),
			configuredScore: 2,
			unconfiguredScore: 1,
			resolveConfigured: ({ cfg, accountId }) => inspectSlackAccount({
				cfg,
				accountId
			}).configured
		}),
		introNote: {
			title: t("wizard.slack.socketModeTokensTitle"),
			lines: buildSlackSetupLines(),
			shouldShow: ({ cfg, accountId }) => !isSlackSetupAccountConfigured(resolveSlackAccount({
				cfg,
				accountId
			}))
		},
		prepare: async ({ cfg, accountId, prompter }) => {
			if (isSlackSetupAccountConfigured(resolveSlackAccount({
				cfg,
				accountId
			}))) return;
			const manifest = buildSlackManifest();
			if (prompter.plain) await prompter.plain(manifest);
			else await prompter.note(manifest, "Slack manifest JSON");
		},
		envShortcut: {
			prompt: t("wizard.slack.envPrompt"),
			preferredEnvVar: "SLACK_BOT_TOKEN",
			isAvailable: ({ cfg, accountId }) => accountId === DEFAULT_ACCOUNT_ID && Boolean(process.env.SLACK_BOT_TOKEN?.trim()) && Boolean(process.env.SLACK_APP_TOKEN?.trim()) && !isSlackSetupAccountConfigured(resolveSlackAccount({
				cfg,
				accountId
			})),
			apply: ({ cfg, accountId }) => enableSlackAccount(cfg, accountId)
		},
		credentials: [createSlackTokenCredential({
			inputKey: "botToken",
			providerHint: "slack-bot",
			credentialLabel: t("wizard.slack.botToken"),
			preferredEnvVar: "SLACK_BOT_TOKEN",
			keepPrompt: t("wizard.slack.botTokenKeep"),
			inputPrompt: t("wizard.slack.botTokenInput")
		}), createSlackTokenCredential({
			inputKey: "appToken",
			providerHint: "slack-app",
			credentialLabel: t("wizard.slack.appToken"),
			preferredEnvVar: "SLACK_APP_TOKEN",
			keepPrompt: t("wizard.slack.appTokenKeep"),
			inputPrompt: t("wizard.slack.appTokenInput")
		})],
		dmPolicy: slackDmPolicy,
		allowFrom: createAccountScopedAllowFromSection({
			channel: SLACK_CHANNEL,
			credentialInputKey: "botToken",
			helpTitle: t("wizard.slack.allowlistTitle"),
			helpLines: [
				t("wizard.slack.allowlistIntro"),
				t("wizard.slack.examples"),
				"- U12345678",
				"- @alice",
				t("wizard.slack.multipleEntries"),
				t("wizard.channels.docs", { link: formatDocsLink("/slack", "slack") })
			],
			message: t("wizard.slack.allowFromPrompt"),
			placeholder: "@alice, U12345678",
			invalidWithoutCredentialNote: t("wizard.slack.allowFromInvalidWithoutToken"),
			parseId: (value) => parseMentionOrPrefixedId({
				value,
				mentionPattern: /^<@([A-Z0-9]+)>$/i,
				prefixPattern: /^(slack:|user:)/i,
				idPattern: /^[A-Z][A-Z0-9]+$/i,
				normalizeId: (id) => id.toUpperCase()
			}),
			resolveEntries: handlers.resolveAllowFromEntries
		}),
		groupAccess: createAccountScopedGroupAccessSection({
			channel: SLACK_CHANNEL,
			label: t("wizard.slack.channelsLabel"),
			placeholder: "#general, #private, C123",
			currentPolicy: ({ cfg, accountId }) => resolveSlackAccount({
				cfg,
				accountId
			}).config.groupPolicy ?? "allowlist",
			currentEntries: ({ cfg, accountId }) => Object.entries(resolveSlackAccount({
				cfg,
				accountId
			}).config.channels ?? {}).filter(([, value]) => value?.enabled !== false).map(([key]) => key),
			updatePrompt: ({ cfg, accountId }) => Boolean(resolveSlackAccount({
				cfg,
				accountId
			}).config.channels),
			resolveAllowlist: handlers.resolveGroupAllowlist,
			fallbackResolved: (entries) => entries,
			applyAllowlist: ({ cfg, accountId, resolved }) => setSlackChannelAllowlist(cfg, accountId, resolved)
		}),
		finalize: async ({ cfg, accountId, options, prompter }) => {
			if (hasSlackInteractiveRepliesConfig(cfg, accountId)) return;
			if (options?.quickstartDefaults) return { cfg: setSlackInteractiveReplies(cfg, accountId, true) };
			return { cfg: setSlackInteractiveReplies(cfg, accountId, await prompter.confirm({
				message: t("wizard.slack.interactiveRepliesPrompt"),
				initialValue: true
			})) };
		},
		disable: (cfg) => setSetupChannelEnabled(cfg, SLACK_CHANNEL, false)
	};
}
function createSlackSetupWizardProxy(loadWizard) {
	return createAllowlistSetupWizardProxy({
		loadWizard: async () => (await loadWizard()).slackSetupWizard,
		createBase: createSlackSetupWizardBase,
		fallbackResolvedGroupAllowlist: (entries) => entries
	});
}
//#endregion
export { describeSlackSetupAccount as a, SLACK_CHANNEL as i, createSlackSetupWizardProxy as n, isSlackSetupAccountConfigured as o, slackSetupAdapter as r, createSlackSetupWizardBase as t };
