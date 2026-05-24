import { a as resolveSlackAccount, i as resolveDefaultSlackAccountId, o as resolveSlackAccountAllowFrom } from "./accounts-BnLQ3fe2.js";
import "./shared-C9qcXNm_.js";
import { i as SLACK_CHANNEL, t as createSlackSetupWizardBase } from "./setup-core-CJxjcOda.js";
import { t as resolveSlackChannelAllowlist } from "./resolve-channels-CXV6oSKF.js";
import { t as resolveSlackUserAllowlist } from "./resolve-users-BCBZwBB5.js";
import { adaptScopedAccountAccessor } from "openclaw/plugin-sdk/channel-config-helpers";
import { createSetupTranslator, noteChannelLookupFailure, noteChannelLookupSummary, parseMentionOrPrefixedId, promptLegacyChannelAllowFromForAccount, resolveEntriesWithOptionalToken } from "openclaw/plugin-sdk/setup-runtime";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
//#region extensions/slack/src/setup-surface.ts
const t = createSetupTranslator();
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
		resolveExisting: (account, cfg) => resolveSlackAccountAllowFrom({
			cfg,
			accountId: account.accountId
		}) ?? [],
		resolveToken: (account) => account.userToken ?? account.botToken ?? "",
		noteTitle: t("wizard.slack.allowlistTitle"),
		noteLines: [
			t("wizard.slack.allowlistIntro"),
			t("wizard.slack.examples"),
			"- U12345678",
			"- @alice",
			t("wizard.slack.multipleEntries"),
			t("wizard.channels.docs", { link: formatDocsLink("/slack", "slack") })
		],
		message: t("wizard.slack.allowFromPrompt"),
		placeholder: "@alice, U12345678",
		parseId,
		invalidWithoutTokenNote: t("wizard.slack.allowFromInvalidWithoutToken"),
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
			label: t("wizard.slack.channelsLabel"),
			resolvedSections: [{
				title: t("wizard.channels.resolvedTitle"),
				values: resolvedKeys
			}],
			unresolved
		});
	} catch (error) {
		await noteChannelLookupFailure({
			prompter: params.prompter,
			label: t("wizard.slack.channelsLabel"),
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
export { slackSetupWizard };
