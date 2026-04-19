import { a as resolveSlackAccount, i as resolveDefaultSlackAccountId, n as listSlackAccountIds } from "./accounts-DJiceqJx.js";
import { t as inspectSlackAccount } from "./account-inspect-DL0-mXTO.js";
import { n as isSlackInteractiveRepliesEnabled } from "./interactive-replies-CK9mrnAH.js";
import { r as getChatChannelMeta } from "./channel-api-B8Ify1HI.js";
import { t as SlackChannelConfigSchema } from "./config-schema-D0V1omo5.js";
import { n as normalizeCompatibilityConfig, t as legacyConfigRules } from "./doctor-contract-hI_lCiar.js";
import { n as collectRuntimeConfigAssignments, r as secretTargetRegistryEntries } from "./secret-contract-DasfT9zK.js";
import { t as resolveSlackChannelAllowlist } from "./resolve-channels-DpRJc8-4.js";
import { t as resolveSlackUserAllowlist } from "./resolve-users-CEjXgbpN.js";
import { hasConfiguredSecretInput } from "openclaw/plugin-sdk/secret-input";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { adaptScopedAccountAccessor, createScopedChannelConfigAdapter } from "openclaw/plugin-sdk/channel-config-helpers";
import { createDangerousNameMatchingMutableAllowlistWarningCollector } from "openclaw/plugin-sdk/channel-policy";
import { formatAllowFromLowercase } from "openclaw/plugin-sdk/allow-from";
import { DEFAULT_ACCOUNT_ID, createAccountScopedAllowFromSection, createAccountScopedGroupAccessSection, createEnvPatchedAccountSetupAdapter, createLegacyCompatChannelDmPolicy, createStandardChannelSetupStatus, noteChannelLookupFailure, noteChannelLookupSummary, parseMentionOrPrefixedId, patchChannelConfigForAccount, promptLegacyChannelAllowFromForAccount, resolveEntriesWithOptionalToken, setSetupChannelEnabled } from "openclaw/plugin-sdk/setup-runtime";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
import { describeAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
//#region extensions/slack/src/security-doctor.ts
function isSlackMutableAllowEntry(raw) {
	const text = raw.trim();
	if (!text || text === "*") return false;
	const mentionMatch = text.match(/^<@([A-Z0-9]+)>$/i);
	if (mentionMatch && /^[A-Z0-9]{8,}$/i.test(mentionMatch[1] ?? "")) return false;
	const withoutPrefix = text.replace(/^(slack|user):/i, "").trim();
	if (/^[UWBCGDT][A-Z0-9]{2,}$/.test(withoutPrefix)) return false;
	if (/^[A-Z0-9]{8,}$/i.test(withoutPrefix)) return false;
	return true;
}
//#endregion
//#region extensions/slack/src/doctor.ts
function asObjectRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
const slackDoctor = {
	dmAllowFromMode: "topOrNested",
	groupModel: "route",
	groupAllowFromFallbackToAllowFrom: false,
	warnOnEmptyGroupSenderAllowlist: false,
	legacyConfigRules,
	normalizeCompatibilityConfig,
	collectMutableAllowlistWarnings: createDangerousNameMatchingMutableAllowlistWarningCollector({
		channel: "slack",
		detector: isSlackMutableAllowEntry,
		collectLists: (scope) => {
			const lists = [{
				pathLabel: `${scope.prefix}.allowFrom`,
				list: scope.account.allowFrom
			}];
			const dm = asObjectRecord(scope.account.dm);
			if (dm) lists.push({
				pathLabel: `${scope.prefix}.dm.allowFrom`,
				list: dm.allowFrom
			});
			const channels = asObjectRecord(scope.account.channels);
			if (channels) for (const [channelKey, channelRaw] of Object.entries(channels)) {
				const channel = asObjectRecord(channelRaw);
				if (!channel) continue;
				lists.push({
					pathLabel: `${scope.prefix}.channels.${channelKey}.users`,
					list: channel.users
				});
			}
			return lists;
		}
	})
};
//#endregion
//#region extensions/slack/src/shared.ts
const SLACK_CHANNEL = "slack";
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
				always_online: true
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
			"users:read"
		] } },
		settings: {
			socket_mode_enabled: true,
			event_subscriptions: { bot_events: [
				"app_mention",
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
function buildSlackSetupLines(botName = "OpenClaw") {
	return [
		"1) Slack API -> Create App -> From scratch or From manifest (with the JSON below)",
		"2) Add Socket Mode + enable it to get the app-level token (xapp-...)",
		"3) Install App to workspace to get the xoxb- bot token",
		"4) Enable Event Subscriptions (socket) for message events",
		"5) App Home -> enable the Messages tab for DMs",
		"Tip: set SLACK_BOT_TOKEN + SLACK_APP_TOKEN in your env.",
		`Docs: ${formatDocsLink("/slack", "slack")}`,
		"",
		"Manifest (JSON):",
		buildSlackManifest(botName)
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
function isSlackPluginAccountConfigured(account) {
	const mode = account.config.mode ?? "socket";
	if (!Boolean(account.botToken?.trim())) return false;
	if (mode === "http") return Boolean(account.config.signingSecret?.trim());
	return Boolean(account.appToken?.trim());
}
function isSlackSetupAccountConfigured(account) {
	const hasConfiguredBotToken = Boolean(account.botToken?.trim()) || hasConfiguredSecretInput(account.config.botToken);
	const hasConfiguredAppToken = Boolean(account.appToken?.trim()) || hasConfiguredSecretInput(account.config.appToken);
	return hasConfiguredBotToken && hasConfiguredAppToken;
}
const slackConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: SLACK_CHANNEL,
	listAccountIds: listSlackAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveSlackAccount),
	inspectAccount: adaptScopedAccountAccessor(inspectSlackAccount),
	defaultAccountId: resolveDefaultSlackAccountId,
	clearBaseFields: [
		"botToken",
		"appToken",
		"name"
	],
	resolveAllowFrom: (account) => account.dm?.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({ allowFrom }),
	resolveDefaultTo: (account) => account.config.defaultTo
});
function createSlackPluginBase(params) {
	return {
		id: SLACK_CHANNEL,
		meta: {
			...getChatChannelMeta(SLACK_CHANNEL),
			preferSessionLookupForAnnounceTarget: true
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			reactions: true,
			threads: true,
			media: true,
			nativeCommands: true
		},
		commands: {
			nativeCommandsAutoEnabled: false,
			nativeSkillsAutoEnabled: false,
			resolveNativeCommandName: ({ commandKey, defaultName }) => commandKey === "status" ? "agentstatus" : defaultName
		},
		doctor: slackDoctor,
		agentPrompt: {
			inboundFormattingHints: () => ({
				text_markup: "slack_mrkdwn",
				rules: [
					"Use Slack mrkdwn, not standard Markdown.",
					"Bold uses *single asterisks*.",
					"Links use <url|label>.",
					"Code blocks use triple backticks without a language identifier.",
					"Do not use markdown headings or pipe tables."
				]
			}),
			messageToolHints: ({ cfg, accountId }) => isSlackInteractiveRepliesEnabled({
				cfg,
				accountId
			}) ? [
				"- Prefer Slack buttons/selects for 2-5 discrete choices or parameter picks instead of asking the user to type one.",
				"- Slack interactive replies: use `[[slack_buttons: Label:value, Other:other]]` to add action buttons that route clicks back as Slack interaction system events.",
				"- Slack selects: use `[[slack_select: Placeholder | Label:value, Other:other]]` to add a static select menu that routes the chosen value back as a Slack interaction system event."
			] : ["- Slack interactive replies are disabled. If needed, ask to set `channels.slack.capabilities.interactiveReplies=true` (or the same under `channels.slack.accounts.<account>.capabilities`)."]
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.slack"] },
		configSchema: SlackChannelConfigSchema,
		config: {
			...slackConfigAdapter,
			hasConfiguredState: ({ env }) => [
				"SLACK_APP_TOKEN",
				"SLACK_BOT_TOKEN",
				"SLACK_USER_TOKEN"
			].some((key) => typeof env?.[key] === "string" && env[key]?.trim().length > 0),
			isConfigured: (account) => isSlackPluginAccountConfigured(account),
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: isSlackPluginAccountConfigured(account),
				extra: {
					botTokenSource: account.botTokenSource,
					appTokenSource: account.appTokenSource
				}
			})
		},
		secrets: {
			secretTargetRegistryEntries,
			collectRuntimeConfigAssignments
		},
		setup: params.setup
	};
}
//#endregion
//#region extensions/slack/src/setup-core.ts
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
			configuredLabel: "configured",
			unconfiguredLabel: "needs tokens",
			configuredHint: "configured",
			unconfiguredHint: "needs tokens",
			configuredScore: 2,
			unconfiguredScore: 1,
			resolveConfigured: ({ cfg, accountId }) => inspectSlackAccount({
				cfg,
				accountId
			}).configured
		}),
		introNote: {
			title: "Slack socket mode tokens",
			lines: buildSlackSetupLines(),
			shouldShow: ({ cfg, accountId }) => !isSlackSetupAccountConfigured(resolveSlackAccount({
				cfg,
				accountId
			}))
		},
		envShortcut: {
			prompt: "SLACK_BOT_TOKEN + SLACK_APP_TOKEN detected. Use env vars?",
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
			credentialLabel: "Slack bot token",
			preferredEnvVar: "SLACK_BOT_TOKEN",
			keepPrompt: "Slack bot token already configured. Keep it?",
			inputPrompt: "Enter Slack bot token (xoxb-...)"
		}), createSlackTokenCredential({
			inputKey: "appToken",
			providerHint: "slack-app",
			credentialLabel: "Slack app token",
			preferredEnvVar: "SLACK_APP_TOKEN",
			keepPrompt: "Slack app token already configured. Keep it?",
			inputPrompt: "Enter Slack app token (xapp-...)"
		})],
		dmPolicy: slackDmPolicy,
		allowFrom: createAccountScopedAllowFromSection({
			channel: SLACK_CHANNEL,
			credentialInputKey: "botToken",
			helpTitle: "Slack allowlist",
			helpLines: [
				"Allowlist Slack DMs by username (we resolve to user ids).",
				"Examples:",
				"- U12345678",
				"- @alice",
				"Multiple entries: comma-separated.",
				`Docs: ${formatDocsLink("/slack", "slack")}`
			],
			message: "Slack allowFrom (usernames or ids)",
			placeholder: "@alice, U12345678",
			invalidWithoutCredentialNote: "Slack token missing; use user ids (or mention form) only.",
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
			label: "Slack channels",
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
				message: "Enable Slack interactive replies (buttons/selects) for agent responses?",
				initialValue: true
			})) };
		},
		disable: (cfg) => setSetupChannelEnabled(cfg, SLACK_CHANNEL, false)
	};
}
//#endregion
//#region extensions/slack/src/setup-surface.ts
async function resolveSlackAllowFromEntries(params) {
	return await resolveEntriesWithOptionalToken({
		token: params.token,
		entries: params.entries,
		buildWithoutToken: (input) => ({
			input,
			resolved: false,
			id: null
		}),
		resolveEntries: async ({ token, entries }) => (await resolveSlackUserAllowlist({
			token,
			entries
		})).map((entry) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.id ?? null
		}))
	});
}
async function promptSlackAllowFrom(params) {
	const parseId = (value) => parseMentionOrPrefixedId({
		value,
		mentionPattern: /^<@([A-Z0-9]+)>$/i,
		prefixPattern: /^(slack:|user:)/i,
		idPattern: /^[A-Z][A-Z0-9]+$/i,
		normalizeId: (id) => id.toUpperCase()
	});
	return await promptLegacyChannelAllowFromForAccount({
		cfg: params.cfg,
		channel: SLACK_CHANNEL,
		prompter: params.prompter,
		accountId: params.accountId,
		defaultAccountId: resolveDefaultSlackAccountId(params.cfg),
		resolveAccount: adaptScopedAccountAccessor(resolveSlackAccount),
		resolveExisting: (_account, cfg) => cfg.channels?.slack?.allowFrom ?? cfg.channels?.slack?.dm?.allowFrom ?? [],
		resolveToken: (account) => account.userToken ?? account.botToken ?? "",
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
		resolveEntries: async ({ token, entries }) => (await resolveSlackUserAllowlist({
			token,
			entries
		})).map((entry) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.id ?? null
		}))
	});
}
async function resolveSlackGroupAllowlist(params) {
	let keys = params.entries;
	const activeBotToken = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).botToken || params.credentialValues.botToken || "";
	if (params.entries.length > 0) try {
		const resolved = await resolveEntriesWithOptionalToken({
			token: activeBotToken,
			entries: params.entries,
			buildWithoutToken: (input) => ({
				input,
				resolved: false,
				id: void 0
			}),
			resolveEntries: async ({ token, entries }) => await resolveSlackChannelAllowlist({
				token,
				entries
			})
		});
		const resolvedKeys = resolved.filter((entry) => entry.resolved && entry.id).map((entry) => entry.id);
		const unresolved = resolved.filter((entry) => !entry.resolved).map((entry) => entry.input);
		keys = [...resolvedKeys, ...unresolved.map((entry) => entry.trim()).filter(Boolean)];
		await noteChannelLookupSummary({
			prompter: params.prompter,
			label: "Slack channels",
			resolvedSections: [{
				title: "Resolved",
				values: resolvedKeys
			}],
			unresolved
		});
	} catch (error) {
		await noteChannelLookupFailure({
			prompter: params.prompter,
			label: "Slack channels",
			error
		});
	}
	return keys;
}
const slackSetupWizard = createSlackSetupWizardBase({
	promptAllowFrom: promptSlackAllowFrom,
	resolveAllowFromEntries: async ({ credentialValues, entries }) => await resolveSlackAllowFromEntries({
		token: credentialValues.botToken,
		entries
	}),
	resolveGroupAllowlist: async ({ cfg, accountId, credentialValues, entries, prompter }) => await resolveSlackGroupAllowlist({
		cfg,
		accountId,
		credentialValues,
		entries,
		prompter
	})
});
//#endregion
export { isSlackPluginAccountConfigured as a, createSlackPluginBase as i, slackSetupAdapter as n, slackConfigAdapter as o, SLACK_CHANNEL as r, slackSetupWizard as t };
