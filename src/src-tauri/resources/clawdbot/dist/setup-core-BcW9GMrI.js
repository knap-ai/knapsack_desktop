import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-DgX397vI.js";
import { $S as resolveDiscordAccountConfig, XS as mergeDiscordAccountConfig, nC as resolveDiscordToken } from "./pi-embedded-CbCYZxIb.js";
import { r as listCombinedAccountIds } from "./account-helpers-BzkeDMfB.js";
import { r as createEnvPatchedAccountSetupAdapter } from "./setup-helpers-B2gYys18.js";
import { x as createStandardChannelSetupStatus } from "./setup-wizard-proxy-DoOpOF8S.js";
//#region extensions/discord/src/setup-account-state.ts
function inspectConfiguredToken(value) {
	const normalized = normalizeSecretInputString(value);
	if (normalized) return {
		token: normalized.replace(/^Bot\s+/i, ""),
		tokenSource: "config",
		tokenStatus: "available"
	};
	if (hasConfiguredSecretInput(value)) return {
		token: "",
		tokenSource: "config",
		tokenStatus: "configured_unavailable"
	};
	return null;
}
function listDiscordSetupAccountIds(cfg) {
	const accounts = cfg.channels?.discord?.accounts;
	return listCombinedAccountIds({
		configuredAccountIds: accounts && typeof accounts === "object" && !Array.isArray(accounts) ? Object.keys(accounts).map((accountId) => normalizeAccountId(accountId)) : [],
		implicitAccountId: DEFAULT_ACCOUNT_ID
	});
}
function resolveDefaultDiscordSetupAccountId(cfg) {
	return listDiscordSetupAccountIds(cfg)[0] ?? "default";
}
function resolveDiscordSetupAccountConfig(params) {
	const accountId = normalizeAccountId(params.accountId ?? "default");
	return {
		accountId,
		config: mergeDiscordAccountConfig(params.cfg, accountId)
	};
}
function inspectDiscordSetupAccount(params) {
	const { accountId, config } = resolveDiscordSetupAccountConfig(params);
	const enabled = params.cfg.channels?.discord?.enabled !== false && config.enabled !== false;
	const accountConfig = resolveDiscordAccountConfig(params.cfg, accountId);
	const hasAccountToken = Boolean(accountConfig && Object.prototype.hasOwnProperty.call(accountConfig, "token"));
	const accountToken = inspectConfiguredToken(accountConfig?.token);
	if (accountToken) return {
		accountId,
		enabled,
		token: accountToken.token,
		tokenSource: accountToken.tokenSource,
		tokenStatus: accountToken.tokenStatus,
		configured: true,
		config
	};
	if (hasAccountToken) return {
		accountId,
		enabled,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config
	};
	const channelToken = inspectConfiguredToken(params.cfg.channels?.discord?.token);
	if (channelToken) return {
		accountId,
		enabled,
		token: channelToken.token,
		tokenSource: channelToken.tokenSource,
		tokenStatus: channelToken.tokenStatus,
		configured: true,
		config
	};
	const tokenResolution = resolveDiscordToken(params.cfg, { accountId });
	if (tokenResolution.token) return {
		accountId,
		enabled,
		token: tokenResolution.token,
		tokenSource: tokenResolution.source,
		tokenStatus: "available",
		configured: true,
		config
	};
	return {
		accountId,
		enabled,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config
	};
}
//#endregion
//#region extensions/discord/src/setup-runtime-helpers.ts
function parseMentionOrPrefixedId(params) {
	const trimmed = params.value.trim();
	if (!trimmed) return null;
	const mentionMatch = trimmed.match(params.mentionPattern);
	if (mentionMatch?.[1]) return params.normalizeId ? params.normalizeId(mentionMatch[1]) : mentionMatch[1];
	if (params.prefixPattern?.test(trimmed)) {
		const stripped = trimmed.replace(params.prefixPattern, "").trim();
		if (!stripped || !params.idPattern.test(stripped)) return null;
		return params.normalizeId ? params.normalizeId(stripped) : stripped;
	}
	if (!params.idPattern.test(trimmed)) return null;
	return params.normalizeId ? params.normalizeId(trimmed) : trimmed;
}
function splitSetupEntries(raw) {
	return raw.split(/[\n,;]+/g).map((entry) => entry.trim()).filter(Boolean);
}
function mergeAllowFromEntries(current, additions) {
	const merged = [...current ?? [], ...additions].map((value) => String(value).trim()).filter(Boolean);
	return [...new Set(merged)];
}
function patchDiscordChannelConfigForAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const channelConfig = params.cfg.channels?.discord ?? {};
	if (accountId === "default") return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			discord: {
				...channelConfig,
				...params.patch,
				enabled: true
			}
		}
	};
	const accounts = channelConfig.accounts ?? {};
	const accountConfig = accounts[accountId] ?? {};
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			discord: {
				...channelConfig,
				enabled: true,
				accounts: {
					...accounts,
					[accountId]: {
						...accountConfig,
						...params.patch,
						enabled: true
					}
				}
			}
		}
	};
}
function setSetupChannelEnabled(cfg, channel, enabled) {
	const channelConfig = cfg.channels?.[channel] ?? {};
	return {
		...cfg,
		channels: {
			...cfg.channels,
			[channel]: {
				...channelConfig,
				enabled
			}
		}
	};
}
function patchChannelConfigForAccount(params) {
	return patchDiscordChannelConfigForAccount({
		cfg: params.cfg,
		accountId: params.accountId,
		patch: params.patch
	});
}
function createLegacyCompatChannelDmPolicy(params) {
	return {
		label: params.label,
		channel: params.channel,
		policyKey: `channels.${params.channel}.dmPolicy`,
		allowFromKey: `channels.${params.channel}.allowFrom`,
		getCurrent: (cfg) => (cfg.channels?.[params.channel])?.dmPolicy ?? (cfg.channels?.[params.channel])?.dm?.policy ?? "pairing",
		setPolicy: (cfg, policy) => patchDiscordChannelConfigForAccount({
			cfg,
			accountId: DEFAULT_ACCOUNT_ID,
			patch: {
				dmPolicy: policy,
				...policy === "open" ? { allowFrom: [...new Set([...(cfg.channels?.discord)?.allowFrom ?? [], "*"].map((value) => String(value).trim()).filter(Boolean))] } : {}
			}
		}),
		...params.promptAllowFrom ? { promptAllowFrom: params.promptAllowFrom } : {}
	};
}
async function noteChannelLookupFailure(params) {
	await params.prompter.note(`Channel lookup failed; keeping entries as typed. ${String(params.error)}`, params.label);
}
function createAccountScopedAllowFromSection(params) {
	return {
		...params.helpTitle ? { helpTitle: params.helpTitle } : {},
		...params.helpLines ? { helpLines: params.helpLines } : {},
		...params.credentialInputKey ? { credentialInputKey: params.credentialInputKey } : {},
		message: params.message,
		placeholder: params.placeholder,
		invalidWithoutCredentialNote: params.invalidWithoutCredentialNote,
		parseId: params.parseId,
		resolveEntries: params.resolveEntries,
		apply: ({ cfg, accountId, allowFrom }) => patchDiscordChannelConfigForAccount({
			cfg,
			accountId,
			patch: {
				dmPolicy: "allowlist",
				allowFrom
			}
		})
	};
}
function createAccountScopedGroupAccessSection(params) {
	return {
		label: params.label,
		placeholder: params.placeholder,
		...params.helpTitle ? { helpTitle: params.helpTitle } : {},
		...params.helpLines ? { helpLines: params.helpLines } : {},
		...params.skipAllowlistEntries ? { skipAllowlistEntries: true } : {},
		currentPolicy: params.currentPolicy,
		currentEntries: params.currentEntries,
		updatePrompt: params.updatePrompt,
		setPolicy: ({ cfg, accountId, policy }) => patchDiscordChannelConfigForAccount({
			cfg,
			accountId,
			patch: { groupPolicy: policy }
		}),
		...params.resolveAllowlist ? { resolveAllowlist: async ({ cfg, accountId, credentialValues, entries, prompter }) => {
			try {
				return await params.resolveAllowlist({
					cfg,
					accountId,
					credentialValues,
					entries,
					prompter
				});
			} catch (error) {
				await noteChannelLookupFailure({
					prompter,
					label: params.label,
					error
				});
				return params.fallbackResolved(entries);
			}
		} } : {},
		applyAllowlist: ({ cfg, accountId, resolved }) => params.applyAllowlist({
			cfg,
			accountId,
			resolved
		})
	};
}
function createAllowlistSetupWizardProxy(params) {
	return params.createBase({
		promptAllowFrom: async ({ cfg, prompter, accountId }) => {
			const wizard = await params.loadWizard();
			if (!wizard.dmPolicy?.promptAllowFrom) return cfg;
			return await wizard.dmPolicy.promptAllowFrom({
				cfg,
				prompter,
				accountId
			});
		},
		resolveAllowFromEntries: async ({ cfg, accountId, credentialValues, entries }) => {
			const wizard = await params.loadWizard();
			if (!wizard.allowFrom) return entries.map((input) => ({
				input,
				resolved: false,
				id: null
			}));
			return await wizard.allowFrom.resolveEntries({
				cfg,
				accountId,
				credentialValues,
				entries
			});
		},
		resolveGroupAllowlist: async ({ cfg, accountId, credentialValues, entries, prompter }) => {
			const wizard = await params.loadWizard();
			if (!wizard.groupAccess?.resolveAllowlist) return params.fallbackResolvedGroupAllowlist(entries);
			return await wizard.groupAccess.resolveAllowlist({
				cfg,
				accountId,
				credentialValues,
				entries,
				prompter
			});
		}
	});
}
async function resolveEntriesWithOptionalToken(params) {
	const token = params.token?.trim();
	if (!token) return params.entries.map(params.buildWithoutToken);
	return await params.resolveEntries({
		token,
		entries: params.entries
	});
}
async function promptLegacyChannelAllowFromForAccount(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultDiscordSetupAccountId(params.cfg));
	await params.prompter.note(params.noteLines.join("\n"), params.noteTitle);
	const token = params.resolveToken(accountId);
	const existing = params.resolveExisting(accountId, params.cfg);
	while (true) {
		const entry = await params.prompter.text({
			message: params.message,
			placeholder: params.placeholder,
			initialValue: existing[0] ? String(existing[0]) : void 0,
			validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
		});
		const parts = splitSetupEntries(String(entry));
		if (!token) {
			const ids = parts.map(params.parseId).filter(Boolean);
			if (ids.length !== parts.length) {
				await params.prompter.note(params.invalidWithoutTokenNote, params.noteTitle);
				continue;
			}
			return patchDiscordChannelConfigForAccount({
				cfg: params.cfg,
				accountId,
				patch: {
					dmPolicy: "allowlist",
					allowFrom: mergeAllowFromEntries(existing, ids)
				}
			});
		}
		const results = await params.resolveEntries({
			token,
			entries: parts
		}).catch(() => null);
		if (!results) {
			await params.prompter.note("Failed to resolve usernames. Try again.", params.noteTitle);
			continue;
		}
		const unresolved = results.filter((result) => !result.resolved || !result.id);
		if (unresolved.length > 0) {
			await params.prompter.note(`Could not resolve: ${unresolved.map((result) => result.input).join(", ")}`, params.noteTitle);
			continue;
		}
		return patchDiscordChannelConfigForAccount({
			cfg: params.cfg,
			accountId,
			patch: {
				dmPolicy: "allowlist",
				allowFrom: mergeAllowFromEntries(existing, results.map((result) => result.id))
			}
		});
	}
}
//#endregion
//#region extensions/discord/src/setup-core.ts
const channel = "discord";
const DISCORD_TOKEN_HELP_LINES = [
	"1) Discord Developer Portal -> Applications -> New Application",
	"2) Bot -> Add Bot -> Reset Token -> copy token",
	"3) OAuth2 -> URL Generator -> scope 'bot' -> invite to your server",
	"Tip: enable Message Content Intent if you need message text. (Bot -> Privileged Gateway Intents -> Message Content Intent)",
	`Docs: ${formatDocsLink("/discord", "discord")}`
];
function setDiscordGuildChannelAllowlist(cfg, accountId, entries) {
	const guilds = { ...accountId === "default" ? cfg.channels?.discord?.guilds ?? {} : cfg.channels?.discord?.accounts?.[accountId]?.guilds ?? {} };
	for (const entry of entries) {
		const guildKey = entry.guildKey || "*";
		const existing = guilds[guildKey] ?? {};
		if (entry.channelKey) {
			const channels = { ...existing.channels };
			channels[entry.channelKey] = { allow: true };
			guilds[guildKey] = {
				...existing,
				channels
			};
		} else guilds[guildKey] = existing;
	}
	return patchChannelConfigForAccount({
		cfg,
		channel,
		accountId,
		patch: { guilds }
	});
}
function parseDiscordAllowFromId(value) {
	return parseMentionOrPrefixedId({
		value,
		mentionPattern: /^<@!?(\d+)>$/,
		prefixPattern: /^(user:|discord:)/i,
		idPattern: /^\d+$/
	});
}
const discordSetupAdapter = createEnvPatchedAccountSetupAdapter({
	channelKey: channel,
	defaultAccountOnlyEnvError: "DISCORD_BOT_TOKEN can only be used for the default account.",
	missingCredentialError: "Discord requires token (or --use-env).",
	hasCredentials: (input) => Boolean(input.token),
	buildPatch: (input) => input.token ? { token: input.token } : {}
});
function createDiscordSetupWizardBase(handlers) {
	const discordDmPolicy = createLegacyCompatChannelDmPolicy({
		label: "Discord",
		channel,
		promptAllowFrom: handlers.promptAllowFrom
	});
	return {
		channel,
		status: createStandardChannelSetupStatus({
			channelLabel: "Discord",
			configuredLabel: "configured",
			unconfiguredLabel: "needs token",
			configuredHint: "configured",
			unconfiguredHint: "needs token",
			configuredScore: 2,
			unconfiguredScore: 1,
			resolveConfigured: ({ cfg }) => listDiscordSetupAccountIds(cfg).some((accountId) => {
				return inspectDiscordSetupAccount({
					cfg,
					accountId
				}).configured;
			})
		}),
		credentials: [{
			inputKey: "token",
			providerHint: channel,
			credentialLabel: "Discord bot token",
			preferredEnvVar: "DISCORD_BOT_TOKEN",
			helpTitle: "Discord bot token",
			helpLines: DISCORD_TOKEN_HELP_LINES,
			envPrompt: "DISCORD_BOT_TOKEN detected. Use env var?",
			keepPrompt: "Discord token already configured. Keep it?",
			inputPrompt: "Enter Discord bot token",
			allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
			inspect: ({ cfg, accountId }) => {
				const account = inspectDiscordSetupAccount({
					cfg,
					accountId
				});
				return {
					accountConfigured: account.configured,
					hasConfiguredValue: account.tokenStatus !== "missing",
					resolvedValue: account.token?.trim() || void 0,
					envValue: accountId === "default" ? process.env.DISCORD_BOT_TOKEN?.trim() || void 0 : void 0
				};
			}
		}],
		groupAccess: createAccountScopedGroupAccessSection({
			label: "Discord channels",
			placeholder: "My Server/#general, guildId/channelId, #support",
			currentPolicy: ({ cfg, accountId }) => resolveDiscordSetupAccountConfig({
				cfg,
				accountId
			}).config.groupPolicy ?? "allowlist",
			currentEntries: ({ cfg, accountId }) => Object.entries(resolveDiscordSetupAccountConfig({
				cfg,
				accountId
			}).config.guilds ?? {}).flatMap(([guildKey, value]) => {
				const channels = value?.channels ?? {};
				const channelKeys = Object.keys(channels);
				if (channelKeys.length === 0) return [/^\d+$/.test(guildKey) ? `guild:${guildKey}` : guildKey];
				return channelKeys.map((channelKey) => `${guildKey}/${channelKey}`);
			}),
			updatePrompt: ({ cfg, accountId }) => Boolean(resolveDiscordSetupAccountConfig({
				cfg,
				accountId
			}).config.guilds),
			resolveAllowlist: handlers.resolveGroupAllowlist,
			fallbackResolved: (entries) => entries.map((input) => ({
				input,
				resolved: false
			})),
			applyAllowlist: ({ cfg, accountId, resolved }) => setDiscordGuildChannelAllowlist(cfg, accountId, resolved)
		}),
		allowFrom: createAccountScopedAllowFromSection({
			credentialInputKey: "token",
			helpTitle: "Discord allowlist",
			helpLines: [
				"Allowlist Discord DMs by username (we resolve to user ids).",
				"Examples:",
				"- 123456789012345678",
				"- @alice",
				"- alice#1234",
				"Multiple entries: comma-separated.",
				`Docs: ${formatDocsLink("/discord", "discord")}`
			],
			message: "Discord allowFrom (usernames or ids)",
			placeholder: "@alice, 123456789012345678",
			invalidWithoutCredentialNote: "Bot token missing; use numeric user ids (or mention form) only.",
			parseId: parseDiscordAllowFromId,
			resolveEntries: handlers.resolveAllowFromEntries
		}),
		dmPolicy: discordDmPolicy,
		disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
	};
}
function createDiscordSetupWizardProxy(loadWizard) {
	return createAllowlistSetupWizardProxy({
		loadWizard,
		createBase: createDiscordSetupWizardBase,
		fallbackResolvedGroupAllowlist: (entries) => entries.map((input) => ({
			input,
			resolved: false
		}))
	});
}
//#endregion
export { promptLegacyChannelAllowFromForAccount as a, parseDiscordAllowFromId as i, createDiscordSetupWizardProxy as n, resolveEntriesWithOptionalToken as o, discordSetupAdapter as r, resolveDiscordSetupAccountConfig as s, createDiscordSetupWizardBase as t };
