import { A as listIMessageAccountIds, I as looksLikeHandleOrPhoneTarget, L as trimMessagingTarget, M as resolveIMessageAccount, j as resolveDefaultIMessageAccountId } from "./channel-config-helpers-BAi2qlAE.js";
import { $n as normalizeIMessageHandle, E as formatDocsLink, z as detectBinary } from "./thread-bindings-SYAnWHuW.js";
import { S as setOnboardingChannelEnabled, b as setChannelDmPolicyWithAllowFrom, g as resolveAccountIdForConfigure, l as parseOnboardingEntriesAllowingWildcard, p as promptParsedAllowFromForScopedChannel, u as patchChannelConfigForAccount } from "./helpers-uRGq4pbi.js";
//#region src/channels/plugins/onboarding/imessage.ts
const channel = "imessage";
function parseIMessageAllowFromEntries(raw) {
	return parseOnboardingEntriesAllowingWildcard(raw, (entry) => {
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
async function promptIMessageAllowFrom(params) {
	return promptParsedAllowFromForScopedChannel({
		cfg: params.cfg,
		channel: "imessage",
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
		getExistingAllowFrom: ({ cfg, accountId }) => {
			return resolveIMessageAccount({
				cfg,
				accountId
			}).config.allowFrom ?? [];
		}
	});
}
const imessageOnboardingAdapter = {
	channel,
	getStatus: async ({ cfg }) => {
		const configured = listIMessageAccountIds(cfg).some((accountId) => {
			const account = resolveIMessageAccount({
				cfg,
				accountId
			});
			return Boolean(account.config.cliPath || account.config.dbPath || account.config.allowFrom || account.config.service || account.config.region);
		});
		const imessageCliPath = cfg.channels?.imessage?.cliPath ?? "imsg";
		const imessageCliDetected = await detectBinary(imessageCliPath);
		return {
			channel,
			configured,
			statusLines: [`iMessage: ${configured ? "configured" : "needs setup"}`, `imsg: ${imessageCliDetected ? "found" : "missing"} (${imessageCliPath})`],
			selectionHint: imessageCliDetected ? "imsg found" : "imsg missing",
			quickstartScore: imessageCliDetected ? 1 : 0
		};
	},
	configure: async ({ cfg, prompter, accountOverrides, shouldPromptAccountIds }) => {
		const defaultIMessageAccountId = resolveDefaultIMessageAccountId(cfg);
		const imessageAccountId = await resolveAccountIdForConfigure({
			cfg,
			prompter,
			label: "iMessage",
			accountOverride: accountOverrides.imessage,
			shouldPromptAccountIds,
			listAccountIds: listIMessageAccountIds,
			defaultAccountId: defaultIMessageAccountId
		});
		let next = cfg;
		let resolvedCliPath = resolveIMessageAccount({
			cfg: next,
			accountId: imessageAccountId
		}).config.cliPath ?? "imsg";
		if (!await detectBinary(resolvedCliPath)) {
			const entered = await prompter.text({
				message: "imsg CLI path",
				initialValue: resolvedCliPath,
				validate: (value) => value?.trim() ? void 0 : "Required"
			});
			resolvedCliPath = String(entered).trim();
			if (!resolvedCliPath) await prompter.note("imsg CLI path required to enable iMessage.", "iMessage");
		}
		if (resolvedCliPath) next = patchChannelConfigForAccount({
			cfg: next,
			channel: "imessage",
			accountId: imessageAccountId,
			patch: { cliPath: resolvedCliPath }
		});
		await prompter.note([
			"This is still a work in progress.",
			"Ensure OpenClaw has Full Disk Access to Messages DB.",
			"Grant Automation permission for Messages when prompted.",
			"List chats with: imsg chats --limit 20",
			`Docs: ${formatDocsLink("/imessage", "imessage")}`
		].join("\n"), "iMessage next steps");
		return {
			cfg: next,
			accountId: imessageAccountId
		};
	},
	dmPolicy: {
		label: "iMessage",
		channel,
		policyKey: "channels.imessage.dmPolicy",
		allowFromKey: "channels.imessage.allowFrom",
		getCurrent: (cfg) => cfg.channels?.imessage?.dmPolicy ?? "pairing",
		setPolicy: (cfg, policy) => setChannelDmPolicyWithAllowFrom({
			cfg,
			channel: "imessage",
			dmPolicy: policy
		}),
		promptAllowFrom: promptIMessageAllowFrom
	},
	disable: (cfg) => setOnboardingChannelEnabled(cfg, channel, false)
};
//#endregion
//#region src/channels/plugins/normalize/imessage.ts
const SERVICE_PREFIXES = [
	"imessage:",
	"sms:",
	"auto:"
];
const CHAT_TARGET_PREFIX_RE = /^(chat_id:|chatid:|chat:|chat_guid:|chatguid:|guid:|chat_identifier:|chatidentifier:|chatident:)/i;
function normalizeIMessageMessagingTarget(raw) {
	const trimmed = trimMessagingTarget(raw);
	if (!trimmed) return;
	const lower = trimmed.toLowerCase();
	for (const prefix of SERVICE_PREFIXES) if (lower.startsWith(prefix)) {
		const normalizedHandle = normalizeIMessageHandle(trimmed.slice(prefix.length).trim());
		if (!normalizedHandle) return;
		if (CHAT_TARGET_PREFIX_RE.test(normalizedHandle)) return normalizedHandle;
		return `${prefix}${normalizedHandle}`;
	}
	return normalizeIMessageHandle(trimmed) || void 0;
}
function looksLikeIMessageTargetId(raw) {
	const trimmed = trimMessagingTarget(raw);
	if (!trimmed) return false;
	if (CHAT_TARGET_PREFIX_RE.test(trimmed)) return true;
	return looksLikeHandleOrPhoneTarget({
		raw: trimmed,
		prefixPattern: /^(imessage:|sms:|auto:)/i
	});
}
//#endregion
export { normalizeIMessageMessagingTarget as n, imessageOnboardingAdapter as r, looksLikeIMessageTargetId as t };
