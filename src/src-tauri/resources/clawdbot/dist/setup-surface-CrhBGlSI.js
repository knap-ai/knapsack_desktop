import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { A as promptLegacyChannelAllowFromForAccount, I as resolveEntriesWithOptionalToken } from "./setup-wizard-helpers-BfrhuTOh.js";
import "./setup-tools-D_0XhK0N.js";
import { n as resolveDiscordToken } from "./token-MkG2GNpU.js";
import { t as resolveDiscordUserAllowlist } from "./resolve-users-QVP1LD60.js";
import { a as resolveDefaultDiscordSetupAccountId, i as parseDiscordAllowFromId, o as resolveDiscordSetupAccountConfig, t as createDiscordSetupWizardBase } from "./setup-core-Dgl1xr2H.js";
import { t as resolveDiscordChannelAllowlist } from "./resolve-channels-BjmdxRGt.js";
//#region extensions/discord/src/setup-surface.ts
const channel = "discord";
async function resolveDiscordAllowFromEntries(params) {
	return await resolveEntriesWithOptionalToken({
		token: params.token,
		entries: params.entries,
		buildWithoutToken: (input) => ({
			input,
			resolved: false,
			id: null
		}),
		resolveEntries: async ({ token, entries }) => (await resolveDiscordUserAllowlist({
			token,
			entries
		})).map((entry) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.id ?? null
		}))
	});
}
async function promptDiscordAllowFrom(params) {
	return await promptLegacyChannelAllowFromForAccount({
		cfg: params.cfg,
		channel,
		prompter: params.prompter,
		accountId: params.accountId,
		defaultAccountId: resolveDefaultDiscordSetupAccountId(params.cfg),
		resolveAccount: (cfg, accountId) => resolveDiscordSetupAccountConfig({
			cfg,
			accountId
		}),
		noteTitle: "Discord allowlist",
		noteLines: [
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
		parseId: parseDiscordAllowFromId,
		invalidWithoutTokenNote: "Bot token missing; use numeric user ids (or mention form) only.",
		resolveExisting: (account) => {
			const config = account.config;
			return config.allowFrom ?? config.dm?.allowFrom ?? [];
		},
		resolveToken: (account) => resolveDiscordToken(params.cfg, { accountId: account.accountId }).token,
		resolveEntries: async ({ token, entries }) => (await resolveDiscordUserAllowlist({
			token,
			entries
		})).map((entry) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.id ?? null
		}))
	});
}
async function resolveDiscordGroupAllowlist(params) {
	return await resolveEntriesWithOptionalToken({
		token: resolveDiscordToken(params.cfg, { accountId: params.accountId }).token || (typeof params.credentialValues.token === "string" ? params.credentialValues.token : ""),
		entries: params.entries,
		buildWithoutToken: (input) => ({
			input,
			resolved: false
		}),
		resolveEntries: async ({ token, entries }) => await resolveDiscordChannelAllowlist({
			token,
			entries
		})
	});
}
const discordSetupWizard = createDiscordSetupWizardBase({
	promptAllowFrom: promptDiscordAllowFrom,
	resolveAllowFromEntries: async ({ cfg, accountId, credentialValues, entries }) => await resolveDiscordAllowFromEntries({
		token: resolveDiscordToken(cfg, { accountId }).token || (typeof credentialValues.token === "string" ? credentialValues.token : ""),
		entries
	}),
	resolveGroupAllowlist: async ({ cfg, accountId, credentialValues, entries }) => await resolveDiscordGroupAllowlist({
		cfg,
		accountId,
		credentialValues,
		entries
	})
});
//#endregion
export { discordSetupWizard };
