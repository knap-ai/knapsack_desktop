import { m as normalizeE164 } from "./utils-CS0Ikux6.js";
import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
import { $u as resolveDefaultSignalAccountId, ed as resolveSignalAccount } from "./pi-embedded-CbCYZxIb.js";
import { i as createPatchedAccountSetupAdapter } from "./setup-helpers-B2gYys18.js";
import { $ as setChannelDmPolicyWithAllowFrom, B as promptParsedAllowFromForAccount, M as parseSetupEntriesAllowingWildcard, X as setAccountAllowFromForChannel, a as createDelegatedSetupWizardProxy, c as createDelegatedTextInputShouldPrompt, o as createCliPathTextInput, rt as setSetupChannelEnabled } from "./setup-wizard-proxy-DoOpOF8S.js";
//#region extensions/signal/src/setup-core.ts
const channel = "signal";
const MIN_E164_DIGITS = 5;
const MAX_E164_DIGITS = 15;
const DIGITS_ONLY = /^\d+$/;
const INVALID_SIGNAL_ACCOUNT_ERROR = "Invalid E.164 phone number (must start with + and country code, e.g. +15555550123)";
function normalizeSignalAccountInput(value) {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const digits = normalizeE164(trimmed).slice(1);
	if (!DIGITS_ONLY.test(digits)) return null;
	if (digits.length < MIN_E164_DIGITS || digits.length > MAX_E164_DIGITS) return null;
	return `+${digits}`;
}
function isUuidLike(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function parseSignalAllowFromEntries(raw) {
	return parseSetupEntriesAllowingWildcard(raw, (entry) => {
		if (entry.toLowerCase().startsWith("uuid:")) {
			const id = entry.slice(5).trim();
			if (!id) return { error: "Invalid uuid entry" };
			return { value: `uuid:${id}` };
		}
		if (isUuidLike(entry)) return { value: `uuid:${entry}` };
		const normalized = normalizeSignalAccountInput(entry);
		if (!normalized) return { error: `Invalid entry: ${entry}` };
		return { value: normalized };
	});
}
function buildSignalSetupPatch(input) {
	return {
		...input.signalNumber ? { account: input.signalNumber } : {},
		...input.cliPath ? { cliPath: input.cliPath } : {},
		...input.httpUrl ? { httpUrl: input.httpUrl } : {},
		...input.httpHost ? { httpHost: input.httpHost } : {},
		...input.httpPort ? { httpPort: Number(input.httpPort) } : {}
	};
}
async function promptSignalAllowFrom(params) {
	return promptParsedAllowFromForAccount({
		cfg: params.cfg,
		accountId: params.accountId,
		defaultAccountId: resolveDefaultSignalAccountId(params.cfg),
		prompter: params.prompter,
		noteTitle: "Signal allowlist",
		noteLines: [
			"Allowlist Signal DMs by sender id.",
			"Examples:",
			"- +15555550123",
			"- uuid:123e4567-e89b-12d3-a456-426614174000",
			"Multiple entries: comma-separated.",
			`Docs: ${formatDocsLink("/signal", "signal")}`
		],
		message: "Signal allowFrom (E.164 or uuid)",
		placeholder: "+15555550123, uuid:123e4567-e89b-12d3-a456-426614174000",
		parseEntries: parseSignalAllowFromEntries,
		getExistingAllowFrom: ({ cfg, accountId }) => resolveSignalAccount({
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
const signalDmPolicy = {
	label: "Signal",
	channel,
	policyKey: "channels.signal.dmPolicy",
	allowFromKey: "channels.signal.allowFrom",
	getCurrent: (cfg) => cfg.channels?.signal?.dmPolicy ?? "pairing",
	setPolicy: (cfg, policy) => setChannelDmPolicyWithAllowFrom({
		cfg,
		channel,
		dmPolicy: policy
	}),
	promptAllowFrom: promptSignalAllowFrom
};
function resolveSignalCliPath(params) {
	return (typeof params.credentialValues.cliPath === "string" ? params.credentialValues.cliPath : void 0) ?? resolveSignalAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).config.cliPath ?? "signal-cli";
}
function createSignalCliPathTextInput(shouldPrompt) {
	return createCliPathTextInput({
		inputKey: "cliPath",
		message: "signal-cli path",
		resolvePath: ({ cfg, accountId, credentialValues }) => resolveSignalCliPath({
			cfg,
			accountId,
			credentialValues
		}),
		shouldPrompt,
		helpTitle: "Signal",
		helpLines: ["signal-cli not found. Install it, then rerun this step or set channels.signal.cliPath."]
	});
}
const signalNumberTextInput = {
	inputKey: "signalNumber",
	message: "Signal bot number (E.164)",
	currentValue: ({ cfg, accountId }) => normalizeSignalAccountInput(resolveSignalAccount({
		cfg,
		accountId
	}).config.account) ?? void 0,
	keepPrompt: (value) => `Signal account set (${value}). Keep it?`,
	validate: ({ value }) => normalizeSignalAccountInput(value) ? void 0 : INVALID_SIGNAL_ACCOUNT_ERROR,
	normalizeValue: ({ value }) => normalizeSignalAccountInput(value) ?? value
};
const signalCompletionNote = {
	title: "Signal next steps",
	lines: [
		"Link device with: signal-cli link -n \"OpenClaw\"",
		"Scan QR in Signal -> Linked Devices",
		`Then run: ${formatCliCommand("openclaw gateway call channels.status --params '{\"probe\":true}'")}`,
		`Docs: ${formatDocsLink("/signal", "signal")}`
	]
};
const signalSetupAdapter = createPatchedAccountSetupAdapter({
	channelKey: channel,
	validateInput: ({ input }) => {
		if (!input.signalNumber && !input.httpUrl && !input.httpHost && !input.httpPort && !input.cliPath) return "Signal requires --signal-number or --http-url/--http-host/--http-port/--cli-path.";
		return null;
	},
	buildPatch: (input) => buildSignalSetupPatch(input)
});
function createSignalSetupWizardProxy(loadWizard) {
	return createDelegatedSetupWizardProxy({
		channel,
		loadWizard,
		status: {
			configuredLabel: "configured",
			unconfiguredLabel: "needs setup",
			configuredHint: "signal-cli found",
			unconfiguredHint: "signal-cli missing",
			configuredScore: 1,
			unconfiguredScore: 0
		},
		delegatePrepare: true,
		credentials: [],
		textInputs: [createSignalCliPathTextInput(createDelegatedTextInputShouldPrompt({
			loadWizard,
			inputKey: "cliPath"
		})), signalNumberTextInput],
		completionNote: signalCompletionNote,
		dmPolicy: signalDmPolicy,
		disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
	});
}
//#endregion
export { signalNumberTextInput as a, signalDmPolicy as i, createSignalSetupWizardProxy as n, signalSetupAdapter as o, signalCompletionNote as r, createSignalCliPathTextInput as t };
