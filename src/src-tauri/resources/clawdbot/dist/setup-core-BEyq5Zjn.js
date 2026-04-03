import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { i as createPatchedAccountSetupAdapter } from "./setup-helpers-CjYO5YkF.js";
import { a as createDelegatedSetupWizardProxy, c as createDelegatedTextInputShouldPrompt, o as createCliPathTextInput } from "./setup-wizard-proxy-CAoI5CTi.js";
import { C as parseSetupEntriesAllowingWildcard, J as setSetupChannelEnabled, V as setAccountAllowFromForChannel, j as promptParsedAllowFromForAccount, m as createTopLevelChannelDmPolicy } from "./setup-wizard-helpers-BfrhuTOh.js";
import "./setup-CPpe7OZc.js";
import "./setup-tools-D_0XhK0N.js";
import { b as resolveIMessageAccount, f as normalizeIMessageHandle, v as listIMessageAccountIds, y as resolveDefaultIMessageAccountId } from "./monitor-provider-BaCJr_L0.js";
//#region extensions/imessage/src/setup-core.ts
const channel = "imessage";
function parseIMessageAllowFromEntries(raw) {
	return parseSetupEntriesAllowingWildcard(raw, (entry) => {
		const lower = entry.toLowerCase();
		if (lower.startsWith("chat_id:")) {
			const id = entry.slice(8).trim();
			if (!/^\d+$/.test(id)) return { error: `Invalid chat_id: ${entry}` };
			return { value: entry };
		}
		if (lower.startsWith("chat_guid:")) {
			if (!entry.slice(10).trim()) return { error: "Invalid chat_guid entry" };
			return { value: entry };
		}
		if (lower.startsWith("chat_identifier:")) {
			if (!entry.slice(16).trim()) return { error: "Invalid chat_identifier entry" };
			return { value: entry };
		}
		if (!normalizeIMessageHandle(entry)) return { error: `Invalid handle: ${entry}` };
		return { value: entry };
	});
}
function buildIMessageSetupPatch(input) {
	return {
		...input.cliPath ? { cliPath: input.cliPath } : {},
		...input.dbPath ? { dbPath: input.dbPath } : {},
		...input.service ? { service: input.service } : {},
		...input.region ? { region: input.region } : {}
	};
}
async function promptIMessageAllowFrom(params) {
	return promptParsedAllowFromForAccount({
		cfg: params.cfg,
		accountId: params.accountId,
		defaultAccountId: resolveDefaultIMessageAccountId(params.cfg),
		prompter: params.prompter,
		noteTitle: "iMessage allowlist",
		noteLines: [
			"Allowlist iMessage DMs by handle or chat target.",
			"Examples:",
			"- +15555550123",
			"- user@example.com",
			"- chat_id:123",
			"- chat_guid:... or chat_identifier:...",
			"Multiple entries: comma-separated.",
			`Docs: ${formatDocsLink("/imessage", "imessage")}`
		],
		message: "iMessage allowFrom (handle or chat_id)",
		placeholder: "+15555550123, user@example.com, chat_id:123",
		parseEntries: parseIMessageAllowFromEntries,
		getExistingAllowFrom: ({ cfg, accountId }) => resolveIMessageAccount({
			cfg,
			accountId
		}).config.allowFrom ?? [],
		applyAllowFrom: ({ cfg, accountId, allowFrom }) => setAccountAllowFromForChannel({
			cfg,
			channel,
			accountId,
			allowFrom
		})
	});
}
const imessageDmPolicy = createTopLevelChannelDmPolicy({
	label: "iMessage",
	channel,
	policyKey: "channels.imessage.dmPolicy",
	allowFromKey: "channels.imessage.allowFrom",
	getCurrent: (cfg) => cfg.channels?.imessage?.dmPolicy ?? "pairing",
	promptAllowFrom: promptIMessageAllowFrom
});
function resolveIMessageCliPath(params) {
	return resolveIMessageAccount(params).config.cliPath ?? "imsg";
}
function createIMessageCliPathTextInput(shouldPrompt) {
	return createCliPathTextInput({
		inputKey: "cliPath",
		message: "imsg CLI path",
		resolvePath: ({ cfg, accountId }) => resolveIMessageCliPath({
			cfg,
			accountId
		}),
		shouldPrompt,
		helpTitle: "iMessage",
		helpLines: ["imsg CLI path required to enable iMessage."]
	});
}
const imessageCompletionNote = {
	title: "iMessage next steps",
	lines: [
		"This is still a work in progress.",
		"Ensure OpenClaw has Full Disk Access to Messages DB.",
		"Grant Automation permission for Messages when prompted.",
		"List chats with: imsg chats --limit 20",
		`Docs: ${formatDocsLink("/imessage", "imessage")}`
	]
};
const imessageSetupAdapter = createPatchedAccountSetupAdapter({
	channelKey: channel,
	buildPatch: (input) => buildIMessageSetupPatch(input)
});
const imessageSetupStatusBase = {
	configuredLabel: "configured",
	unconfiguredLabel: "needs setup",
	configuredHint: "imsg found",
	unconfiguredHint: "imsg missing",
	configuredScore: 1,
	unconfiguredScore: 0,
	resolveConfigured: ({ cfg }) => listIMessageAccountIds(cfg).some((accountId) => {
		const account = resolveIMessageAccount({
			cfg,
			accountId
		});
		return Boolean(account.config.cliPath || account.config.dbPath || account.config.allowFrom || account.config.service || account.config.region);
	})
};
function createIMessageSetupWizardProxy(loadWizard) {
	return createDelegatedSetupWizardProxy({
		channel,
		loadWizard,
		status: {
			configuredLabel: imessageSetupStatusBase.configuredLabel,
			unconfiguredLabel: imessageSetupStatusBase.unconfiguredLabel,
			configuredHint: imessageSetupStatusBase.configuredHint,
			unconfiguredHint: imessageSetupStatusBase.unconfiguredHint,
			configuredScore: imessageSetupStatusBase.configuredScore,
			unconfiguredScore: imessageSetupStatusBase.unconfiguredScore
		},
		credentials: [],
		textInputs: [createIMessageCliPathTextInput(createDelegatedTextInputShouldPrompt({
			loadWizard,
			inputKey: "cliPath"
		}))],
		completionNote: imessageCompletionNote,
		dmPolicy: imessageDmPolicy,
		disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
	});
}
//#endregion
export { imessageSetupAdapter as a, imessageDmPolicy as i, createIMessageSetupWizardProxy as n, imessageSetupStatusBase as o, imessageCompletionNote as r, createIMessageCliPathTextInput as t };
