import { r as resolveDefaultWhatsAppAccountId } from "./account-ids-CB5SOWjc.js";
import { r as hasWebCredsSync } from "./creds-files-B1kSWtBg.js";
import { a as resolveWhatsAppAccount, o as resolveWhatsAppAuthDir } from "./accounts-BPYgj8Fv.js";
import { a as normalizeWhatsAppAllowFromEntries, o as normalizeWhatsAppAllowFromEntry } from "./normalize-target-bVWjgftN.js";
import { t as whatsappSetupAdapter } from "./setup-core-BTDKEc-x.js";
import { DEFAULT_ACCOUNT_ID, createSetupTranslator, splitSetupEntries } from "openclaw/plugin-sdk/setup";
import { formatCliCommand, formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
//#region extensions/whatsapp/src/setup-finalize.ts
const t = createSetupTranslator();
function trimPromptText(value) {
	return value?.trim() ?? "";
}
function isDefaultWhatsAppAccountKey(accountId) {
	return accountId.trim().toLowerCase() === DEFAULT_ACCOUNT_ID;
}
function shouldWriteDefaultWhatsAppAccountConfigAtAccountScope(cfg) {
	const accounts = cfg.channels?.whatsapp?.accounts;
	if (!accounts) return false;
	if (accounts.default) return true;
	return Object.keys(accounts).some((accountId) => !isDefaultWhatsAppAccountKey(accountId));
}
function resolveDefaultWhatsAppAccountWriteKey(cfg) {
	const accounts = cfg.channels?.whatsapp?.accounts;
	if (!accounts) return DEFAULT_ACCOUNT_ID;
	return Object.keys(accounts).find((accountId) => isDefaultWhatsAppAccountKey(accountId)) ?? DEFAULT_ACCOUNT_ID;
}
function resolveWhatsAppConfigPathPrefix(cfg, accountId) {
	if (accountId === DEFAULT_ACCOUNT_ID && shouldWriteDefaultWhatsAppAccountConfigAtAccountScope(cfg)) return `channels.whatsapp.accounts.${resolveDefaultWhatsAppAccountWriteKey(cfg)}`;
	return accountId === DEFAULT_ACCOUNT_ID ? "channels.whatsapp" : `channels.whatsapp.accounts.${accountId}`;
}
function mergeWhatsAppConfig(cfg, accountId, patch, options) {
	const channelConfig = { ...cfg.channels?.whatsapp };
	const mutableChannelConfig = channelConfig;
	if (resolveWhatsAppConfigPathPrefix(cfg, accountId) === "channels.whatsapp") {
		for (const [key, value] of Object.entries(patch)) {
			if (value === void 0) {
				if (options?.unsetOnUndefined?.includes(key)) delete mutableChannelConfig[key];
				continue;
			}
			mutableChannelConfig[key] = value;
		}
		return {
			...cfg,
			channels: {
				...cfg.channels,
				whatsapp: channelConfig
			}
		};
	}
	const accounts = { ...channelConfig.accounts };
	const targetAccountId = accountId === DEFAULT_ACCOUNT_ID ? resolveDefaultWhatsAppAccountWriteKey(cfg) : accountId;
	const lowerDefaultAccount = accountId === DEFAULT_ACCOUNT_ID && targetAccountId !== DEFAULT_ACCOUNT_ID ? accounts[DEFAULT_ACCOUNT_ID] : void 0;
	const nextAccount = {
		...accounts[targetAccountId],
		...lowerDefaultAccount
	};
	const mutableNextAccount = nextAccount;
	for (const [key, value] of Object.entries(patch)) {
		if (value === void 0) {
			if (options?.unsetOnUndefined?.includes(key)) delete mutableNextAccount[key];
			continue;
		}
		mutableNextAccount[key] = value;
	}
	accounts[targetAccountId] = nextAccount;
	if (lowerDefaultAccount) delete accounts[DEFAULT_ACCOUNT_ID];
	return {
		...cfg,
		channels: {
			...cfg.channels,
			whatsapp: {
				...channelConfig,
				accounts
			}
		}
	};
}
function setWhatsAppDmPolicy(cfg, accountId, dmPolicy) {
	return mergeWhatsAppConfig(cfg, accountId, { dmPolicy });
}
function setWhatsAppAllowFrom(cfg, accountId, allowFrom) {
	return mergeWhatsAppConfig(cfg, accountId, { allowFrom }, { unsetOnUndefined: ["allowFrom"] });
}
function setWhatsAppSelfChatMode(cfg, accountId, selfChatMode) {
	return mergeWhatsAppConfig(cfg, accountId, { selfChatMode });
}
async function detectWhatsAppLinked(cfg, accountId) {
	const { authDir } = resolveWhatsAppAuthDir({
		cfg,
		accountId
	});
	return hasWebCredsSync(authDir);
}
async function promptWhatsAppOwnerAllowFrom(params) {
	const { prompter, existingAllowFrom } = params;
	await prompter.note(t("wizard.whatsapp.ownerNumberNote"), t("wizard.whatsapp.numberTitle"));
	const normalized = normalizeWhatsAppAllowFromEntry(trimPromptText(await prompter.text({
		message: t("wizard.whatsapp.personalNumberPrompt"),
		placeholder: "+15555550123",
		initialValue: existingAllowFrom[0],
		validate: (value) => {
			const raw = trimPromptText(value);
			if (!raw) return t("common.required");
			if (!normalizeWhatsAppAllowFromEntry(raw)) return `Invalid number: ${raw}`;
		}
	})));
	if (!normalized) throw new Error("Invalid WhatsApp owner number (expected E.164 after validation).");
	return {
		normalized,
		allowFrom: normalizeWhatsAppAllowFromEntries([...existingAllowFrom.filter((item) => item !== "*"), normalized])
	};
}
async function applyWhatsAppOwnerAllowlist(params) {
	const { normalized, allowFrom } = await promptWhatsAppOwnerAllowFrom({
		prompter: params.prompter,
		existingAllowFrom: params.existingAllowFrom
	});
	let next = setWhatsAppSelfChatMode(params.cfg, params.accountId, true);
	next = setWhatsAppDmPolicy(next, params.accountId, "allowlist");
	next = setWhatsAppAllowFrom(next, params.accountId, allowFrom);
	await params.prompter.note([...params.messageLines, `- allowFrom includes ${normalized}`].join("\n"), params.title);
	return next;
}
function parseWhatsAppAllowFromEntries(raw) {
	const parts = splitSetupEntries(raw);
	if (parts.length === 0) return { entries: [] };
	const entries = [];
	for (const part of parts) {
		if (part === "*") {
			entries.push("*");
			continue;
		}
		const normalized = normalizeWhatsAppAllowFromEntry(part);
		if (!normalized) return {
			entries: [],
			invalidEntry: part
		};
		entries.push(normalized);
	}
	return { entries: normalizeWhatsAppAllowFromEntries(entries) };
}
async function promptWhatsAppDmAccess(params) {
	const accountId = params.accountId.trim() || DEFAULT_ACCOUNT_ID;
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId
	});
	const existingPolicy = account.dmPolicy ?? "pairing";
	const existingAllowFrom = account.allowFrom ?? [];
	const existingLabel = existingAllowFrom.length > 0 ? existingAllowFrom.join(", ") : "unset";
	const configPathPrefix = resolveWhatsAppConfigPathPrefix(params.cfg, accountId);
	const policyKey = `${configPathPrefix}.dmPolicy`;
	const allowFromKey = `${configPathPrefix}.allowFrom`;
	if (params.forceAllowFrom) return await applyWhatsAppOwnerAllowlist({
		cfg: params.cfg,
		accountId,
		prompter: params.prompter,
		existingAllowFrom,
		title: t("wizard.whatsapp.allowlistTitle"),
		messageLines: [t("wizard.whatsapp.allowlistModeEnabled")]
	});
	await params.prompter.note([
		`WhatsApp direct chats are gated by \`${policyKey}\` + \`${allowFromKey}\`.`,
		"- pairing (default): unknown senders get a pairing code; owner approves",
		"- allowlist: unknown senders are blocked",
		"- open: public inbound DMs (requires allowFrom to include \"*\")",
		"- disabled: ignore WhatsApp DMs",
		"",
		`Current: dmPolicy=${existingPolicy}, allowFrom=${existingLabel}`,
		t("wizard.channels.docs", { link: formatDocsLink("/whatsapp", "whatsapp") })
	].join("\n"), t("wizard.whatsapp.dmAccessTitle"));
	if (await params.prompter.select({
		message: t("wizard.whatsapp.phoneSetupPrompt"),
		options: [{
			value: "personal",
			label: t("wizard.whatsapp.personalPhoneLabel")
		}, {
			value: "separate",
			label: t("wizard.whatsapp.separatePhoneLabel")
		}]
	}) === "personal") return await applyWhatsAppOwnerAllowlist({
		cfg: params.cfg,
		accountId,
		prompter: params.prompter,
		existingAllowFrom,
		title: t("wizard.whatsapp.personalPhoneTitle"),
		messageLines: [t("wizard.whatsapp.personalPhoneModeEnabled"), t("wizard.whatsapp.dmPolicySetAllowlist")]
	});
	const policy = await params.prompter.select({
		message: t("wizard.whatsapp.dmPolicyPrompt"),
		options: [
			{
				value: "pairing",
				label: t("wizard.channels.dmPolicyPairing")
			},
			{
				value: "allowlist",
				label: t("wizard.whatsapp.dmPolicyAllowlistOnly")
			},
			{
				value: "open",
				label: t("wizard.channels.dmPolicyOpenOption")
			},
			{
				value: "disabled",
				label: t("wizard.whatsapp.dmPolicyDisabled")
			}
		]
	});
	let next = setWhatsAppSelfChatMode(params.cfg, accountId, false);
	next = setWhatsAppDmPolicy(next, accountId, policy);
	if (policy === "open") {
		const allowFrom = normalizeWhatsAppAllowFromEntries(["*", ...existingAllowFrom]);
		next = setWhatsAppAllowFrom(next, accountId, allowFrom.length > 0 ? allowFrom : ["*"]);
		return next;
	}
	if (policy === "disabled") return next;
	const allowOptions = existingAllowFrom.length > 0 ? [
		{
			value: "keep",
			label: t("wizard.whatsapp.keepCurrentAllowFrom")
		},
		{
			value: "unset",
			label: t("wizard.whatsapp.unsetAllowFromPairing")
		},
		{
			value: "list",
			label: t("wizard.whatsapp.setAllowFromNumbers")
		}
	] : [{
		value: "unset",
		label: t("wizard.whatsapp.unsetAllowFromDefault")
	}, {
		value: "list",
		label: t("wizard.whatsapp.setAllowFromNumbers")
	}];
	const mode = await params.prompter.select({
		message: t("wizard.whatsapp.allowFromPrompt"),
		options: allowOptions.map((opt) => ({
			value: opt.value,
			label: opt.label
		}))
	});
	if (mode === "keep") return next;
	if (mode === "unset") return setWhatsAppAllowFrom(next, accountId, void 0);
	const parsed = parseWhatsAppAllowFromEntries(trimPromptText(await params.prompter.text({
		message: t("wizard.whatsapp.allowedSenderNumbers"),
		placeholder: "+15555550123, +447700900123",
		validate: (value) => {
			const raw = trimPromptText(value);
			if (!raw) return t("common.required");
			const parsed = parseWhatsAppAllowFromEntries(raw);
			if (parsed.entries.length === 0 && !parsed.invalidEntry) return t("common.required");
			if (parsed.invalidEntry) return `Invalid number: ${parsed.invalidEntry}`;
		}
	})));
	if (parsed.invalidEntry) throw new Error(`Invalid number: ${parsed.invalidEntry}`);
	if (parsed.entries.length === 0) throw new Error("Invalid WhatsApp allowFrom list (expected at least one E.164 number).");
	return setWhatsAppAllowFrom(next, accountId, parsed.entries);
}
async function finalizeWhatsAppSetup(params) {
	const accountId = params.accountId.trim() || resolveDefaultWhatsAppAccountId(params.cfg);
	let next = accountId === DEFAULT_ACCOUNT_ID ? params.cfg : whatsappSetupAdapter.applyAccountConfig({
		cfg: params.cfg,
		accountId,
		input: {}
	});
	const linked = await detectWhatsAppLinked(next, accountId);
	const { authDir } = resolveWhatsAppAuthDir({
		cfg: next,
		accountId
	});
	if (!linked) await params.prompter.note([
		t("wizard.whatsapp.scanQr"),
		t("wizard.whatsapp.credentialsStored", { authDir }),
		t("wizard.channels.docs", { link: formatDocsLink("/whatsapp", "whatsapp") })
	].join("\n"), t("wizard.whatsapp.linkingTitle"));
	if (await params.prompter.confirm({
		message: linked ? t("wizard.whatsapp.relinkPrompt") : t("wizard.whatsapp.linkNowPrompt"),
		initialValue: !linked
	})) try {
		const { loginWeb } = await import("./login-nJwaNuC-.js").then((n) => n.n);
		await loginWeb(false, void 0, params.runtime, accountId);
	} catch (error) {
		params.runtime.error(`WhatsApp login failed: ${String(error)}`);
		await params.prompter.note(t("wizard.channels.docs", { link: formatDocsLink("/whatsapp", "whatsapp") }), t("wizard.whatsapp.helpTitle"));
	}
	else if (!linked) await params.prompter.note(t("wizard.whatsapp.linkLater", { command: formatCliCommand("openclaw channels login") }), "WhatsApp");
	next = await promptWhatsAppDmAccess({
		cfg: next,
		accountId,
		forceAllowFrom: params.forceAllowFrom,
		prompter: params.prompter
	});
	return { cfg: next };
}
//#endregion
export { finalizeWhatsAppSetup };
