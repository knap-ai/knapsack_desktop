import { c as resolveWhatsAppAuthDir, i as listWhatsAppAccountIds, o as resolveDefaultWhatsAppAccountId, s as resolveWhatsAppAccount } from "./accounts-DgAsOTS-.js";
import { startWebLoginWithQr as startWebLoginWithQr$1, waitForWebLogin as waitForWebLogin$1 } from "./login-qr-runtime.js";
import { t as whatsappSetupAdapter } from "./setup-core-C6FhfyML.js";
import { c as readWebSelfId$1, d as webAuthExists$1, i as logoutWeb$1, n as getWebAuthAgeMs$1, r as logWebSelfId$1 } from "./auth-store-3FRPEigM.js";
import { t as getActiveWebListener$1 } from "./active-listener-DvlWD5J-.js";
import { n as monitorWebChannel$1, t as loginWeb$1 } from "./login-BPCVMYVA.js";
import path from "node:path";
import { DEFAULT_ACCOUNT_ID, normalizeAllowFromEntries, normalizeE164, pathExists, setSetupChannelEnabled, splitSetupEntries } from "openclaw/plugin-sdk/setup";
import { formatCliCommand, formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
//#region extensions/whatsapp/src/setup-finalize.ts
function mergeWhatsAppConfig(cfg, accountId, patch, options) {
	const channelConfig = { ...cfg.channels?.whatsapp };
	const mutableChannelConfig = channelConfig;
	if (accountId === DEFAULT_ACCOUNT_ID) {
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
	const nextAccount = { ...accounts[accountId] };
	const mutableNextAccount = nextAccount;
	for (const [key, value] of Object.entries(patch)) {
		if (value === void 0) {
			if (options?.unsetOnUndefined?.includes(key)) delete mutableNextAccount[key];
			continue;
		}
		mutableNextAccount[key] = value;
	}
	accounts[accountId] = nextAccount;
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
	return await pathExists(path.join(authDir, "creds.json"));
}
async function promptWhatsAppOwnerAllowFrom(params) {
	const { prompter, existingAllowFrom } = params;
	await prompter.note("We need the sender/owner number so OpenClaw can allowlist you.", "WhatsApp number");
	const normalized = normalizeE164((await prompter.text({
		message: "Your personal WhatsApp number (the phone you will message from)",
		placeholder: "+15555550123",
		initialValue: existingAllowFrom[0],
		validate: (value) => {
			const raw = value.trim();
			if (!raw) return "Required";
			if (!normalizeE164(raw)) return `Invalid number: ${raw}`;
		}
	})).trim());
	if (!normalized) throw new Error("Invalid WhatsApp owner number (expected E.164 after validation).");
	return {
		normalized,
		allowFrom: normalizeAllowFromEntries([...existingAllowFrom.filter((item) => item !== "*"), normalized], normalizeE164)
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
		const normalized = normalizeE164(part);
		if (!normalized) return {
			entries: [],
			invalidEntry: part
		};
		entries.push(normalized);
	}
	return { entries: normalizeAllowFromEntries(entries, normalizeE164) };
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
	const policyKey = accountId === DEFAULT_ACCOUNT_ID ? "channels.whatsapp.dmPolicy" : `channels.whatsapp.accounts.${accountId}.dmPolicy`;
	const allowFromKey = accountId === DEFAULT_ACCOUNT_ID ? "channels.whatsapp.allowFrom" : `channels.whatsapp.accounts.${accountId}.allowFrom`;
	if (params.forceAllowFrom) return await applyWhatsAppOwnerAllowlist({
		cfg: params.cfg,
		accountId,
		prompter: params.prompter,
		existingAllowFrom,
		title: "WhatsApp allowlist",
		messageLines: ["Allowlist mode enabled."]
	});
	await params.prompter.note([
		`WhatsApp direct chats are gated by \`${policyKey}\` + \`${allowFromKey}\`.`,
		"- pairing (default): unknown senders get a pairing code; owner approves",
		"- allowlist: unknown senders are blocked",
		"- open: public inbound DMs (requires allowFrom to include \"*\")",
		"- disabled: ignore WhatsApp DMs",
		"",
		`Current: dmPolicy=${existingPolicy}, allowFrom=${existingLabel}`,
		`Docs: ${formatDocsLink("/whatsapp", "whatsapp")}`
	].join("\n"), "WhatsApp DM access");
	if (await params.prompter.select({
		message: "WhatsApp phone setup",
		options: [{
			value: "personal",
			label: "This is my personal phone number"
		}, {
			value: "separate",
			label: "Separate phone just for OpenClaw"
		}]
	}) === "personal") return await applyWhatsAppOwnerAllowlist({
		cfg: params.cfg,
		accountId,
		prompter: params.prompter,
		existingAllowFrom,
		title: "WhatsApp personal phone",
		messageLines: ["Personal phone mode enabled.", "- dmPolicy set to allowlist (pairing skipped)"]
	});
	const policy = await params.prompter.select({
		message: "WhatsApp DM policy",
		options: [
			{
				value: "pairing",
				label: "Pairing (recommended)"
			},
			{
				value: "allowlist",
				label: "Allowlist only (block unknown senders)"
			},
			{
				value: "open",
				label: "Open (public inbound DMs)"
			},
			{
				value: "disabled",
				label: "Disabled (ignore WhatsApp DMs)"
			}
		]
	});
	let next = setWhatsAppSelfChatMode(params.cfg, accountId, false);
	next = setWhatsAppDmPolicy(next, accountId, policy);
	if (policy === "open") {
		const allowFrom = normalizeAllowFromEntries(["*", ...existingAllowFrom], normalizeE164);
		next = setWhatsAppAllowFrom(next, accountId, allowFrom.length > 0 ? allowFrom : ["*"]);
		return next;
	}
	if (policy === "disabled") return next;
	const allowOptions = existingAllowFrom.length > 0 ? [
		{
			value: "keep",
			label: "Keep current allowFrom"
		},
		{
			value: "unset",
			label: "Unset allowFrom (use pairing approvals only)"
		},
		{
			value: "list",
			label: "Set allowFrom to specific numbers"
		}
	] : [{
		value: "unset",
		label: "Unset allowFrom (default)"
	}, {
		value: "list",
		label: "Set allowFrom to specific numbers"
	}];
	const mode = await params.prompter.select({
		message: "WhatsApp allowFrom (optional pre-allowlist)",
		options: allowOptions.map((opt) => ({
			value: opt.value,
			label: opt.label
		}))
	});
	if (mode === "keep") return next;
	if (mode === "unset") return setWhatsAppAllowFrom(next, accountId, void 0);
	const parsed = parseWhatsAppAllowFromEntries(await params.prompter.text({
		message: "Allowed sender numbers (comma-separated, E.164)",
		placeholder: "+15555550123, +447700900123",
		validate: (value) => {
			const raw = value.trim();
			if (!raw) return "Required";
			const parsed = parseWhatsAppAllowFromEntries(raw);
			if (parsed.entries.length === 0 && !parsed.invalidEntry) return "Required";
			if (parsed.invalidEntry) return `Invalid number: ${parsed.invalidEntry}`;
		}
	}));
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
		"Scan the QR with WhatsApp on your phone.",
		`Credentials are stored under ${authDir}/ for future runs.`,
		`Docs: ${formatDocsLink("/whatsapp", "whatsapp")}`
	].join("\n"), "WhatsApp linking");
	if (await params.prompter.confirm({
		message: linked ? "WhatsApp already linked. Re-link now?" : "Link WhatsApp now (QR)?",
		initialValue: !linked
	})) try {
		await loginWeb$1(false, void 0, params.runtime, accountId);
	} catch (error) {
		params.runtime.error(`WhatsApp login failed: ${String(error)}`);
		await params.prompter.note(`Docs: ${formatDocsLink("/whatsapp", "whatsapp")}`, "WhatsApp help");
	}
	else if (!linked) await params.prompter.note(`Run \`${formatCliCommand("openclaw channels login")}\` later to link WhatsApp.`, "WhatsApp");
	next = await promptWhatsAppDmAccess({
		cfg: next,
		accountId,
		forceAllowFrom: params.forceAllowFrom,
		prompter: params.prompter
	});
	return { cfg: next };
}
//#endregion
//#region extensions/whatsapp/src/setup-surface.ts
const channel = "whatsapp";
const whatsappSetupWizard$1 = {
	channel,
	status: {
		configuredLabel: "linked",
		unconfiguredLabel: "not linked",
		configuredHint: "linked",
		unconfiguredHint: "not linked",
		configuredScore: 5,
		unconfiguredScore: 4,
		resolveConfigured: async ({ cfg, accountId }) => {
			for (const resolvedAccountId of accountId ? [accountId] : listWhatsAppAccountIds(cfg)) if (await detectWhatsAppLinked(cfg, resolvedAccountId)) return true;
			return false;
		},
		resolveStatusLines: async ({ cfg, accountId, configured }) => {
			const linkedAccountId = (await Promise.all((accountId ? [accountId] : listWhatsAppAccountIds(cfg)).map(async (resolvedAccountId) => ({
				accountId: resolvedAccountId,
				linked: await detectWhatsAppLinked(cfg, resolvedAccountId)
			})))).find((entry) => entry.linked)?.accountId;
			const labelAccountId = accountId ?? linkedAccountId;
			return [`${labelAccountId ? `WhatsApp (${labelAccountId === DEFAULT_ACCOUNT_ID ? "default" : labelAccountId})` : "WhatsApp"}: ${configured ? "linked" : "not linked"}`];
		}
	},
	resolveShouldPromptAccountIds: ({ shouldPromptAccountIds }) => shouldPromptAccountIds,
	credentials: [],
	finalize: async ({ cfg, accountId, forceAllowFrom, prompter, runtime }) => await finalizeWhatsAppSetup({
		cfg,
		accountId,
		forceAllowFrom,
		prompter,
		runtime
	}),
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false),
	onAccountRecorded: (accountId, options) => {
		options?.onAccountId?.(channel, accountId);
	}
};
//#endregion
//#region extensions/whatsapp/src/channel.runtime.ts
function getActiveWebListener(...args) {
	return getActiveWebListener$1(...args);
}
function getWebAuthAgeMs(...args) {
	return getWebAuthAgeMs$1(...args);
}
function logWebSelfId(...args) {
	return logWebSelfId$1(...args);
}
function logoutWeb(...args) {
	return logoutWeb$1(...args);
}
function readWebSelfId(...args) {
	return readWebSelfId$1(...args);
}
function webAuthExists(...args) {
	return webAuthExists$1(...args);
}
function loginWeb(...args) {
	return loginWeb$1(...args);
}
async function startWebLoginWithQr(...args) {
	return await startWebLoginWithQr$1(...args);
}
async function waitForWebLogin(...args) {
	return await waitForWebLogin$1(...args);
}
const whatsappSetupWizard = { ...whatsappSetupWizard$1 };
function monitorWebChannel(...args) {
	return monitorWebChannel$1(...args);
}
//#endregion
export { getActiveWebListener, getWebAuthAgeMs, logWebSelfId, loginWeb, logoutWeb, monitorWebChannel, readWebSelfId, startWebLoginWithQr, waitForWebLogin, webAuthExists, whatsappSetupWizard };
