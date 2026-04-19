import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-j7GeQlaZ.js";
import { i as createLazyRuntimeNamedExport } from "./lazy-runtime-DQGYmUDC.js";
import { d as createTopLevelChannelConfigAdapter } from "./channel-config-helpers-9F9ZxFrZ.js";
import "./text-runtime-DTMxvodz.js";
import { n as describeAccountSnapshot } from "./account-helpers-BWbrvOLB.js";
import { c as stripTargetKindPrefix, r as createChatChannelPlugin, s as stripChannelTargetPrefix, t as buildChannelOutboundSessionRoute } from "./core-Dh0sB0kj.js";
import "./channel-core-3hub9E3l.js";
import { t as formatAllowFromLowercase } from "./allow-from-3zjA49Rt.js";
import { E as projectConfigWarningCollector, h as createAllowlistProviderGroupPolicyWarningCollector, n as createDangerousNameMatchingMutableAllowlistWarningCollector } from "./channel-policy-G84s3mXs.js";
import { t as createChannelDirectoryAdapter } from "./directory-runtime-DNbenseh.js";
import { a as listDirectoryEntriesFromSources } from "./directory-config-helpers-Di0_Q0I-.js";
import { n as createRuntimeOutboundDelegates, t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-R9_lIgsW.js";
import { Q as splitSetupEntries, f as createStandardChannelSetupStatus, g as createTopLevelChannelGroupPolicySetter, m as createTopLevelChannelDmPolicy, p as createTopLevelChannelAllowFromSetter, v as mergeAllowFromEntries } from "./setup-wizard-helpers-C8R_wm_7.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-DXbuAoem.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-DMzs787S.js";
import { d as createDefaultChannelRuntimeState, i as buildProbeChannelStatusSummary, u as createComputedAccountStatusAdapter } from "./status-helpers-BEDVo_4L.js";
import "./setup-Ben3xLZg.js";
import "./setup-tools-ChX5E-WF.js";
import { t as resolveApprovalApprovers } from "./approval-approvers-DSMmMQzI.js";
import { t as createResolvedApproverActionAuthAdapter } from "./approval-auth-helpers-CMPTk8Vz.js";
import "./outbound-runtime-CbUxpWN7.js";
import { t as chunkTextForOutbound } from "./text-chunking-CtENq2zv.js";
import { n as createMessageToolCardSchema } from "./channel-actions-CkAP8jIY.js";
import "./runtime-api-Ds1QPION.js";
import { S as formatUnknownError } from "./graph-users-DskbJ6I1.js";
import { a as resolveMSTeamsCredentials, t as hasConfiguredMSTeamsCredentials } from "./token-GSTWn7zC.js";
import { c as normalizeMSTeamsUserInput, d as parseMSTeamsTeamEntry, f as resolveMSTeamsChannelAllowlist, l as parseMSTeamsConversationId, o as looksLikeMSTeamsTargetId, p as resolveMSTeamsUserAllowlist, r as resolveMSTeamsGroupToolPolicy, s as normalizeMSTeamsMessagingTarget, u as parseMSTeamsTeamChannelInput } from "./policy-CVsrOHwt.js";
import { t as MSTeamsChannelConfigSchema } from "./config-schema-bn5rUifL.js";
import { spawn } from "node:child_process";
import { Type } from "@sinclair/typebox";
//#region extensions/msteams/src/approval-auth.ts
const MSTEAMS_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function normalizeMSTeamsApproverId(value) {
	const normalized = normalizeMSTeamsMessagingTarget(String(value));
	if (!normalized?.startsWith("user:")) return;
	const id = normalizeOptionalLowercaseString(normalized.slice(5));
	if (!id) return;
	return MSTEAMS_ID_RE.test(id) ? id : void 0;
}
function resolveMSTeamsChannelConfig$1(cfg) {
	return cfg.channels?.msteams;
}
const msTeamsApprovalAuth = createResolvedApproverActionAuthAdapter({
	channelLabel: "Microsoft Teams",
	resolveApprovers: ({ cfg }) => {
		const channel = resolveMSTeamsChannelConfig$1(cfg);
		return resolveApprovalApprovers({
			allowFrom: channel?.allowFrom,
			defaultTo: channel?.defaultTo,
			normalizeApprover: normalizeMSTeamsApproverId
		});
	},
	normalizeSenderId: (value) => {
		const trimmed = normalizeOptionalLowercaseString(value);
		if (!trimmed) return;
		return MSTEAMS_ID_RE.test(trimmed) ? trimmed : void 0;
	}
});
//#endregion
//#region extensions/msteams/src/doctor.ts
function isMSTeamsMutableAllowEntry(raw) {
	const text = raw.trim();
	if (!text || text === "*") return false;
	const withoutPrefix = text.replace(/^(msteams|user):/i, "").trim();
	return /\s/.test(withoutPrefix) || withoutPrefix.includes("@");
}
const collectMSTeamsMutableAllowlistWarnings = createDangerousNameMatchingMutableAllowlistWarningCollector({
	channel: "msteams",
	detector: isMSTeamsMutableAllowEntry,
	collectLists: (scope) => [{
		pathLabel: `${scope.prefix}.allowFrom`,
		list: scope.account.allowFrom
	}, {
		pathLabel: `${scope.prefix}.groupAllowFrom`,
		list: scope.account.groupAllowFrom
	}]
});
//#endregion
//#region extensions/msteams/src/session-route.ts
function resolveMSTeamsOutboundSessionRoute(params) {
	let trimmed = stripChannelTargetPrefix(params.target, "msteams", "teams");
	if (!trimmed) return null;
	const isUser = normalizeLowercaseStringOrEmpty(trimmed).startsWith("user:");
	const rawId = stripTargetKindPrefix(trimmed);
	if (!rawId) return null;
	const conversationId = rawId.split(";")[0] ?? rawId;
	const isChannel = !isUser && /@thread\.tacv2/i.test(conversationId);
	return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "msteams",
		accountId: params.accountId,
		peer: {
			kind: isUser ? "direct" : isChannel ? "channel" : "group",
			id: conversationId
		},
		chatType: isUser ? "direct" : isChannel ? "channel" : "group",
		from: isUser ? `msteams:${conversationId}` : isChannel ? `msteams:channel:${conversationId}` : `msteams:group:${conversationId}`,
		to: isUser ? `user:${conversationId}` : `conversation:${conversationId}`
	});
}
//#endregion
//#region extensions/msteams/src/setup-core.ts
const msteamsSetupAdapter = {
	resolveAccountId: () => DEFAULT_ACCOUNT_ID,
	applyAccountConfig: ({ cfg }) => ({
		...cfg,
		channels: {
			...cfg.channels,
			msteams: {
				...cfg.channels?.msteams,
				enabled: true
			}
		}
	})
};
const channel$1 = "msteams";
async function promptMSTeamsCredentials(prompter) {
	return {
		appId: (await prompter.text({
			message: "Enter MS Teams App ID",
			validate: (value) => value?.trim() ? void 0 : "Required"
		})).trim(),
		appPassword: (await prompter.text({
			message: "Enter MS Teams App Password",
			validate: (value) => value?.trim() ? void 0 : "Required"
		})).trim(),
		tenantId: (await prompter.text({
			message: "Enter MS Teams Tenant ID",
			validate: (value) => value?.trim() ? void 0 : "Required"
		})).trim()
	};
}
async function noteMSTeamsCredentialHelp(prompter) {
	await prompter.note([
		"1) Azure Bot registration -> get App ID + Tenant ID",
		"2) Add a client secret (App Password)",
		"3) Set webhook URL + messaging endpoint",
		"Tip: you can also set MSTEAMS_APP_ID / MSTEAMS_APP_PASSWORD / MSTEAMS_TENANT_ID.",
		`Docs: ${formatDocsLink("/channels/msteams", "msteams")}`
	].join("\n"), "MS Teams credentials");
}
function createMSTeamsSetupWizardBase() {
	return {
		channel: channel$1,
		resolveAccountIdForConfigure: () => DEFAULT_ACCOUNT_ID,
		resolveShouldPromptAccountIds: () => false,
		status: createStandardChannelSetupStatus({
			channelLabel: "MS Teams",
			configuredLabel: "configured",
			unconfiguredLabel: "needs app credentials",
			configuredHint: "configured",
			unconfiguredHint: "needs app creds",
			configuredScore: 2,
			unconfiguredScore: 0,
			includeStatusLine: true,
			resolveConfigured: ({ cfg }) => Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams)) || hasConfiguredMSTeamsCredentials(cfg.channels?.msteams)
		}),
		credentials: [],
		finalize: async ({ cfg, prompter }) => {
			const resolved = resolveMSTeamsCredentials(cfg.channels?.msteams);
			const hasConfigCreds = hasConfiguredMSTeamsCredentials(cfg.channels?.msteams);
			const canUseEnv = Boolean(!hasConfigCreds && normalizeSecretInputString(process.env.MSTEAMS_APP_ID) && normalizeSecretInputString(process.env.MSTEAMS_APP_PASSWORD) && normalizeSecretInputString(process.env.MSTEAMS_TENANT_ID));
			let next = cfg;
			let appId = null;
			let appPassword = null;
			let tenantId = null;
			if (!resolved && !hasConfigCreds) await noteMSTeamsCredentialHelp(prompter);
			if (canUseEnv) if (await prompter.confirm({
				message: "MSTEAMS_APP_ID + MSTEAMS_APP_PASSWORD + MSTEAMS_TENANT_ID detected. Use env vars?",
				initialValue: true
			})) next = msteamsSetupAdapter.applyAccountConfig({
				cfg: next,
				accountId: DEFAULT_ACCOUNT_ID,
				input: {}
			});
			else ({appId, appPassword, tenantId} = await promptMSTeamsCredentials(prompter));
			else if (hasConfigCreds) {
				if (!await prompter.confirm({
					message: "MS Teams credentials already configured. Keep them?",
					initialValue: true
				})) ({appId, appPassword, tenantId} = await promptMSTeamsCredentials(prompter));
			} else ({appId, appPassword, tenantId} = await promptMSTeamsCredentials(prompter));
			if (appId && appPassword && tenantId) next = {
				...next,
				channels: {
					...next.channels,
					msteams: {
						...next.channels?.msteams,
						enabled: true,
						appId,
						appPassword,
						tenantId
					}
				}
			};
			return {
				cfg: next,
				accountId: DEFAULT_ACCOUNT_ID
			};
		}
	};
}
//#endregion
//#region extensions/msteams/src/setup-surface.ts
const channel = "msteams";
const setMSTeamsAllowFrom = createTopLevelChannelAllowFromSetter({ channel });
const setMSTeamsGroupPolicy = createTopLevelChannelGroupPolicySetter({
	channel,
	enabled: true
});
function openDelegatedOAuthUrl(url) {
	return new Promise((resolve, reject) => {
		const cmd = process.platform === "darwin" ? "open" : "xdg-open";
		const child = spawn(cmd, [url], {
			stdio: "ignore",
			shell: false
		});
		child.once("error", reject);
		child.once("exit", (code, signal) => {
			if (code === 0) {
				resolve();
				return;
			}
			const reason = signal ? `signal ${signal}` : `code ${code ?? "unknown"}`;
			reject(/* @__PURE__ */ new Error(`${cmd} failed with ${reason}`));
		});
	});
}
function looksLikeGuid(value) {
	return /^[0-9a-fA-F-]{16,}$/.test(value);
}
async function promptMSTeamsAllowFrom(params) {
	const existing = params.cfg.channels?.msteams?.allowFrom ?? [];
	await params.prompter.note([
		"Allowlist MS Teams DMs by display name, UPN/email, or user id.",
		"We resolve names to user IDs via Microsoft Graph when credentials allow.",
		"Examples:",
		"- alex@example.com",
		"- Alex Johnson",
		"- 00000000-0000-0000-0000-000000000000"
	].join("\n"), "MS Teams allowlist");
	while (true) {
		const parts = splitSetupEntries(await params.prompter.text({
			message: "MS Teams allowFrom (usernames or ids)",
			placeholder: "alex@example.com, Alex Johnson",
			initialValue: existing[0] ? existing[0] : void 0,
			validate: (value) => value.trim() ? void 0 : "Required"
		}));
		if (parts.length === 0) {
			await params.prompter.note("Enter at least one user.", "MS Teams allowlist");
			continue;
		}
		const resolved = await resolveMSTeamsUserAllowlist({
			cfg: params.cfg,
			entries: parts
		}).catch(() => null);
		if (!resolved) {
			const ids = parts.filter((part) => looksLikeGuid(part));
			if (ids.length !== parts.length) {
				await params.prompter.note("Graph lookup unavailable. Use user IDs only.", "MS Teams allowlist");
				continue;
			}
			const unique = mergeAllowFromEntries(existing, ids);
			return setMSTeamsAllowFrom(params.cfg, unique);
		}
		const unresolved = resolved.filter((item) => !item.resolved || !item.id);
		if (unresolved.length > 0) {
			await params.prompter.note(`Could not resolve: ${unresolved.map((item) => item.input).join(", ")}`, "MS Teams allowlist");
			continue;
		}
		const unique = mergeAllowFromEntries(existing, resolved.map((item) => item.id));
		return setMSTeamsAllowFrom(params.cfg, unique);
	}
}
function setMSTeamsTeamsAllowlist(cfg, entries) {
	const teams = { ...cfg.channels?.msteams?.teams ?? {} };
	for (const entry of entries) {
		const teamKey = entry.teamKey;
		if (!teamKey) continue;
		const existing = teams[teamKey] ?? {};
		if (entry.channelKey) {
			const channels = { ...existing.channels };
			channels[entry.channelKey] = channels[entry.channelKey] ?? {};
			teams[teamKey] = {
				...existing,
				channels
			};
		} else teams[teamKey] = existing;
	}
	return {
		...cfg,
		channels: {
			...cfg.channels,
			msteams: {
				...cfg.channels?.msteams,
				enabled: true,
				teams
			}
		}
	};
}
function listMSTeamsGroupEntries(cfg) {
	return Object.entries(cfg.channels?.msteams?.teams ?? {}).flatMap(([teamKey, value]) => {
		const channels = value?.channels ?? {};
		const channelKeys = Object.keys(channels);
		if (channelKeys.length === 0) return [teamKey];
		return channelKeys.map((channelKey) => `${teamKey}/${channelKey}`);
	});
}
async function resolveMSTeamsGroupAllowlist(params) {
	let resolvedEntries = params.entries.map((entry) => parseMSTeamsTeamEntry(entry)).filter(Boolean);
	if (params.entries.length === 0 || !resolveMSTeamsCredentials(params.cfg.channels?.msteams)) return resolvedEntries;
	try {
		const lookups = await resolveMSTeamsChannelAllowlist({
			cfg: params.cfg,
			entries: params.entries
		});
		const resolvedChannels = lookups.filter((entry) => entry.resolved && entry.teamId && entry.channelId);
		const resolvedTeams = lookups.filter((entry) => entry.resolved && entry.teamId && !entry.channelId);
		const unresolved = lookups.filter((entry) => !entry.resolved).map((entry) => entry.input);
		resolvedEntries = [
			...resolvedChannels.map((entry) => ({
				teamKey: entry.teamId,
				channelKey: entry.channelId
			})),
			...resolvedTeams.map((entry) => ({ teamKey: entry.teamId })),
			...unresolved.map((entry) => parseMSTeamsTeamEntry(entry)).filter(Boolean)
		];
		const summary = [];
		if (resolvedChannels.length > 0) summary.push(`Resolved channels: ${resolvedChannels.map((entry) => entry.channelId).filter(Boolean).join(", ")}`);
		if (resolvedTeams.length > 0) summary.push(`Resolved teams: ${resolvedTeams.map((entry) => entry.teamId).filter(Boolean).join(", ")}`);
		if (unresolved.length > 0) summary.push(`Unresolved (kept as typed): ${unresolved.join(", ")}`);
		if (summary.length > 0) await params.prompter.note(summary.join("\n"), "MS Teams channels");
		return resolvedEntries;
	} catch (err) {
		await params.prompter.note(`Channel lookup failed; keeping entries as typed. ${formatUnknownError(err)}`, "MS Teams channels");
		return resolvedEntries;
	}
}
const msteamsGroupAccess = {
	label: "MS Teams channels",
	placeholder: "Team Name/Channel Name, teamId/conversationId",
	currentPolicy: ({ cfg }) => cfg.channels?.msteams?.groupPolicy ?? "allowlist",
	currentEntries: ({ cfg }) => listMSTeamsGroupEntries(cfg),
	updatePrompt: ({ cfg }) => Boolean(cfg.channels?.msteams?.teams),
	setPolicy: ({ cfg, policy }) => setMSTeamsGroupPolicy(cfg, policy),
	resolveAllowlist: async ({ cfg, entries, prompter }) => await resolveMSTeamsGroupAllowlist({
		cfg,
		entries,
		prompter
	}),
	applyAllowlist: ({ cfg, resolved }) => setMSTeamsTeamsAllowlist(cfg, resolved)
};
const msteamsDmPolicy = createTopLevelChannelDmPolicy({
	label: "MS Teams",
	channel,
	policyKey: "channels.msteams.dmPolicy",
	allowFromKey: "channels.msteams.allowFrom",
	getCurrent: (cfg) => cfg.channels?.msteams?.dmPolicy ?? "pairing",
	promptAllowFrom: promptMSTeamsAllowFrom
});
const msteamsSetupWizardBase = createMSTeamsSetupWizardBase();
const msteamsSetupWizard = {
	...msteamsSetupWizardBase,
	finalize: async (params) => {
		const baseFinalize = msteamsSetupWizardBase.finalize;
		const baseResult = baseFinalize ? await baseFinalize(params) : void 0;
		let next = baseResult?.cfg ?? params.cfg;
		const finalCreds = resolveMSTeamsCredentials(next.channels?.msteams);
		if (finalCreds?.type === "secret") {
			if (await params.prompter.confirm({
				message: "Enable delegated auth? (required for reactions and write operations)",
				initialValue: false
			})) {
				next = {
					...next,
					channels: {
						...next.channels,
						msteams: {
							...next.channels?.msteams,
							delegatedAuth: { enabled: true }
						}
					}
				};
				try {
					const { loginMSTeamsDelegated } = await import("./oauth-DlyBkuod.js");
					const { saveDelegatedTokens } = await import("./token---oXt4Ni.js");
					const { shouldUseManualOAuthFlow } = await import("./oauth.flow-Xj8sh7to.js");
					const isRemote = Boolean(process.env.SSH_TTY || process.env.SSH_CONNECTION);
					const progress = params.prompter.progress("MSTeams Delegated OAuth");
					saveDelegatedTokens(await loginMSTeamsDelegated({
						isRemote: shouldUseManualOAuthFlow(isRemote),
						openUrl: openDelegatedOAuthUrl,
						log: (msg) => params.prompter.note(msg),
						note: (msg, title) => params.prompter.note(msg, title),
						prompt: (msg) => params.prompter.text({ message: msg }),
						progress
					}, {
						tenantId: finalCreds.tenantId,
						clientId: finalCreds.appId,
						clientSecret: finalCreds.appPassword
					}));
					progress.stop("Delegated auth configured");
				} catch (err) {
					await params.prompter.note(`Delegated auth setup failed: ${formatUnknownError(err)}\nYou can retry later via the setup wizard.`, "MS Teams delegated auth");
				}
			}
		}
		return {
			...baseResult,
			cfg: next
		};
	},
	dmPolicy: msteamsDmPolicy,
	groupAccess: msteamsGroupAccess,
	disable: (cfg) => ({
		...cfg,
		channels: {
			...cfg.channels,
			msteams: {
				...cfg.channels?.msteams,
				enabled: false
			}
		}
	})
};
//#endregion
//#region extensions/msteams/src/channel.ts
const meta = {
	id: "msteams",
	label: "Microsoft Teams",
	selectionLabel: "Microsoft Teams (Bot Framework)",
	docsPath: "/channels/msteams",
	docsLabel: "msteams",
	blurb: "Teams SDK; enterprise support.",
	aliases: ["teams"],
	order: 60
};
const TEAMS_GRAPH_PERMISSION_HINTS = {
	"ChannelMessage.Read.All": "channel history",
	"Chat.Read.All": "chat history",
	"Channel.ReadBasic.All": "channel list",
	"Team.ReadBasic.All": "team list",
	"TeamsActivity.Read.All": "teams activity",
	"Sites.Read.All": "files (SharePoint)",
	"Files.Read.All": "files (OneDrive)"
};
const collectMSTeamsSecurityWarnings = createAllowlistProviderGroupPolicyWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.msteams !== void 0,
	resolveGroupPolicy: ({ cfg }) => cfg.channels?.msteams?.groupPolicy,
	collect: ({ groupPolicy }) => groupPolicy === "open" ? ["- MS Teams groups: groupPolicy=\"open\" allows any member to trigger (mention-gated). Set channels.msteams.groupPolicy=\"allowlist\" + channels.msteams.groupAllowFrom to restrict senders."] : []
});
const loadMSTeamsChannelRuntime = createLazyRuntimeNamedExport(() => import("./channel.runtime-BpR4Cjoq.js"), "msTeamsChannelRuntime");
const resolveMSTeamsChannelConfig = (cfg) => ({
	allowFrom: cfg.channels?.msteams?.allowFrom,
	defaultTo: cfg.channels?.msteams?.defaultTo
});
const msteamsConfigAdapter = createTopLevelChannelConfigAdapter({
	sectionKey: "msteams",
	resolveAccount: (cfg) => ({
		accountId: DEFAULT_ACCOUNT_ID,
		enabled: cfg.channels?.msteams?.enabled !== false,
		configured: Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams))
	}),
	resolveAccessorAccount: ({ cfg }) => resolveMSTeamsChannelConfig(cfg),
	resolveAllowFrom: (account) => account.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({ allowFrom }),
	resolveDefaultTo: (account) => account.defaultTo
});
function jsonActionResult(data) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data)
		}],
		details: data
	};
}
function jsonMSTeamsActionResult(action, data = {}) {
	return jsonActionResult({
		channel: "msteams",
		action,
		...data
	});
}
function jsonMSTeamsOkActionResult(action, data = {}) {
	return jsonActionResult({
		ok: true,
		channel: "msteams",
		action,
		...data
	});
}
function jsonMSTeamsConversationResult(conversationId) {
	return jsonActionResultWithDetails({
		ok: true,
		channel: "msteams",
		conversationId
	}, {
		ok: true,
		channel: "msteams"
	});
}
function jsonActionResultWithDetails(contentData, details) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(contentData)
		}],
		details
	};
}
const MSTEAMS_REACTION_TYPES = [
	"like",
	"heart",
	"laugh",
	"surprised",
	"sad",
	"angry"
];
function actionError(message) {
	return {
		isError: true,
		content: [{
			type: "text",
			text: message
		}],
		details: { error: message }
	};
}
function resolveActionTarget(params, currentChannelId) {
	return typeof params.to === "string" ? params.to.trim() : typeof params.target === "string" ? params.target.trim() : currentChannelId?.trim() ?? "";
}
function resolveGraphActionTarget(params, currentChannelId, currentGraphChannelId) {
	return resolveActionTarget(params, currentGraphChannelId ?? currentChannelId);
}
function resolveActionMessageId(params) {
	return normalizeOptionalString(params.messageId) ?? "";
}
function resolveActionPinnedMessageId(params) {
	return typeof params.pinnedMessageId === "string" ? params.pinnedMessageId.trim() : typeof params.messageId === "string" ? params.messageId.trim() : "";
}
function resolveActionQuery(params) {
	return normalizeOptionalString(params.query) ?? "";
}
function resolveActionContent(params) {
	return typeof params.text === "string" ? params.text : typeof params.content === "string" ? params.content : typeof params.message === "string" ? params.message : "";
}
function readOptionalTrimmedString(params, key) {
	return typeof params[key] === "string" ? params[key].trim() || void 0 : void 0;
}
function resolveActionUploadFilePath(params) {
	for (const key of [
		"filePath",
		"path",
		"media"
	]) if (typeof params[key] === "string") {
		const value = params[key];
		if (value.trim()) return value;
	}
}
function resolveRequiredActionTarget(params) {
	const to = params.graphOnly ? resolveGraphActionTarget(params.toolParams, params.currentChannelId, params.currentGraphChannelId) : resolveActionTarget(params.toolParams, params.currentChannelId);
	if (!to) return actionError(`${params.actionLabel} requires a target (to).`);
	return to;
}
function resolveRequiredActionMessageTarget(params) {
	const to = params.graphOnly ? resolveGraphActionTarget(params.toolParams, params.currentChannelId, params.currentGraphChannelId) : resolveActionTarget(params.toolParams, params.currentChannelId);
	const messageId = resolveActionMessageId(params.toolParams);
	if (!to || !messageId) return actionError(`${params.actionLabel} requires a target (to) and messageId.`);
	return {
		to,
		messageId
	};
}
function resolveRequiredActionPinnedMessageTarget(params) {
	const to = params.graphOnly ? resolveGraphActionTarget(params.toolParams, params.currentChannelId, params.currentGraphChannelId) : resolveActionTarget(params.toolParams, params.currentChannelId);
	const pinnedMessageId = resolveActionPinnedMessageId(params.toolParams);
	if (!to || !pinnedMessageId) return actionError(`${params.actionLabel} requires a target (to) and pinnedMessageId.`);
	return {
		to,
		pinnedMessageId
	};
}
async function runWithRequiredActionTarget(params) {
	const to = resolveRequiredActionTarget({
		actionLabel: params.actionLabel,
		toolParams: params.toolParams,
		currentChannelId: params.currentChannelId,
		currentGraphChannelId: params.currentGraphChannelId,
		graphOnly: params.graphOnly
	});
	if (typeof to !== "string") return to;
	return await params.run(to);
}
async function runWithRequiredActionMessageTarget(params) {
	const target = resolveRequiredActionMessageTarget({
		actionLabel: params.actionLabel,
		toolParams: params.toolParams,
		currentChannelId: params.currentChannelId,
		currentGraphChannelId: params.currentGraphChannelId,
		graphOnly: params.graphOnly
	});
	if ("isError" in target) return target;
	return await params.run(target);
}
async function runWithRequiredActionPinnedMessageTarget(params) {
	const target = resolveRequiredActionPinnedMessageTarget({
		actionLabel: params.actionLabel,
		toolParams: params.toolParams,
		currentChannelId: params.currentChannelId,
		currentGraphChannelId: params.currentGraphChannelId,
		graphOnly: params.graphOnly
	});
	if ("isError" in target) return target;
	return await params.run(target);
}
function describeMSTeamsMessageTool({ cfg }) {
	const enabled = cfg.channels?.msteams?.enabled !== false && Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams));
	return {
		actions: enabled ? [
			"upload-file",
			"poll",
			"edit",
			"delete",
			"pin",
			"unpin",
			"list-pins",
			"read",
			"react",
			"reactions",
			"search",
			"member-info",
			"channel-list",
			"channel-info",
			"addParticipant",
			"removeParticipant",
			"renameGroup"
		] : [],
		capabilities: enabled ? ["cards"] : [],
		schema: enabled ? { properties: {
			card: createMessageToolCardSchema(),
			pinnedMessageId: Type.Optional(Type.String({ description: "Pinned message resource ID for unpin (from pin or list-pins, not the chat message ID)." }))
		} } : null
	};
}
const msteamsPlugin = createChatChannelPlugin({
	base: {
		id: "msteams",
		meta: {
			...meta,
			aliases: [...meta.aliases]
		},
		setupWizard: msteamsSetupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			polls: true,
			threads: true,
			media: true
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		agentPrompt: { messageToolHints: () => ["- Adaptive Cards supported. Use `action=send` with `card={type,version,body}` to send rich cards.", "- MSTeams targeting: omit `target` to reply to the current conversation (auto-inferred). Explicit targets: `user:ID` or `user:Display Name` (requires Graph API) for DMs, `conversation:19:...@thread.tacv2` for groups/channels. Prefer IDs over display names for speed."] },
		groups: { resolveToolPolicy: resolveMSTeamsGroupToolPolicy },
		reload: { configPrefixes: ["channels.msteams"] },
		configSchema: MSTeamsChannelConfigSchema,
		config: {
			...msteamsConfigAdapter,
			isConfigured: (_account, cfg) => Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams)),
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.configured
			})
		},
		approvalCapability: msTeamsApprovalAuth,
		doctor: {
			dmAllowFromMode: "topOnly",
			groupModel: "hybrid",
			groupAllowFromFallbackToAllowFrom: false,
			warnOnEmptyGroupSenderAllowlist: true,
			collectMutableAllowlistWarnings: collectMSTeamsMutableAllowlistWarnings
		},
		setup: msteamsSetupAdapter,
		messaging: {
			normalizeTarget: normalizeMSTeamsMessagingTarget,
			resolveOutboundSessionRoute: (params) => resolveMSTeamsOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: (raw) => looksLikeMSTeamsTargetId(raw),
				hint: "<conversationId|user:ID|conversation:ID>"
			}
		},
		directory: createChannelDirectoryAdapter({
			self: async ({ cfg }) => {
				const creds = resolveMSTeamsCredentials(cfg.channels?.msteams);
				if (!creds) return null;
				return {
					kind: "user",
					id: creds.appId,
					name: creds.appId
				};
			},
			listPeers: async ({ cfg, query, limit }) => listDirectoryEntriesFromSources({
				kind: "user",
				sources: [cfg.channels?.msteams?.allowFrom ?? [], Object.keys(cfg.channels?.msteams?.dms ?? {})],
				query,
				limit,
				normalizeId: (raw) => {
					const normalized = normalizeMSTeamsMessagingTarget(raw) ?? raw;
					const lowered = normalized.toLowerCase();
					if (lowered.startsWith("user:") || lowered.startsWith("conversation:")) return normalized;
					return `user:${normalized}`;
				}
			}),
			listGroups: async ({ cfg, query, limit }) => listDirectoryEntriesFromSources({
				kind: "group",
				sources: [Object.values(cfg.channels?.msteams?.teams ?? {}).flatMap((team) => Object.keys(team.channels ?? {}))],
				query,
				limit,
				normalizeId: (raw) => `conversation:${raw.replace(/^conversation:/i, "").trim()}`
			}),
			...createRuntimeDirectoryLiveAdapter({
				getRuntime: loadMSTeamsChannelRuntime,
				listPeersLive: (runtime) => runtime.listMSTeamsDirectoryPeersLive,
				listGroupsLive: (runtime) => runtime.listMSTeamsDirectoryGroupsLive
			})
		}),
		resolver: { resolveTargets: async ({ cfg, inputs, kind, runtime }) => {
			const results = inputs.map((input) => ({
				input,
				resolved: false,
				id: void 0,
				name: void 0,
				note: void 0
			}));
			const stripPrefix = (value) => normalizeMSTeamsUserInput(value);
			const markPendingLookupFailed = (pending) => {
				pending.forEach(({ index }) => {
					const entry = results[index];
					if (entry) entry.note = "lookup failed";
				});
			};
			const resolvePending = async (pending, resolveEntries, applyResolvedEntry) => {
				if (pending.length === 0) return;
				try {
					(await resolveEntries(pending.map((entry) => entry.query))).forEach((entry, idx) => {
						const target = results[pending[idx]?.index ?? -1];
						if (!target) return;
						applyResolvedEntry(target, entry);
					});
				} catch (err) {
					runtime.error?.(`msteams resolve failed: ${String(err)}`);
					markPendingLookupFailed(pending);
				}
			};
			if (kind === "user") {
				const pending = [];
				results.forEach((entry, index) => {
					const trimmed = entry.input.trim();
					if (!trimmed) {
						entry.note = "empty input";
						return;
					}
					const cleaned = stripPrefix(trimmed);
					if (/^[0-9a-fA-F-]{16,}$/.test(cleaned) || cleaned.includes("@")) {
						entry.resolved = true;
						entry.id = cleaned;
						return;
					}
					pending.push({
						input: entry.input,
						query: cleaned,
						index
					});
				});
				await resolvePending(pending, (entries) => resolveMSTeamsUserAllowlist({
					cfg,
					entries
				}), (target, entry) => {
					target.resolved = entry.resolved;
					target.id = entry.id;
					target.name = entry.name;
					target.note = entry.note;
				});
				return results;
			}
			const pending = [];
			results.forEach((entry, index) => {
				const trimmed = entry.input.trim();
				if (!trimmed) {
					entry.note = "empty input";
					return;
				}
				const conversationId = parseMSTeamsConversationId(trimmed);
				if (conversationId !== null) {
					entry.resolved = Boolean(conversationId);
					entry.id = conversationId || void 0;
					entry.note = conversationId ? "conversation id" : "empty conversation id";
					return;
				}
				const parsed = parseMSTeamsTeamChannelInput(trimmed);
				if (!parsed.team) {
					entry.note = "missing team";
					return;
				}
				const query = parsed.channel ? `${parsed.team}/${parsed.channel}` : parsed.team;
				pending.push({
					input: entry.input,
					query,
					index
				});
			});
			await resolvePending(pending, (entries) => resolveMSTeamsChannelAllowlist({
				cfg,
				entries
			}), (target, entry) => {
				if (!entry.resolved || !entry.teamId) {
					target.resolved = false;
					target.note = entry.note;
					return;
				}
				target.resolved = true;
				if (entry.channelId) {
					target.id = `${entry.teamId}/${entry.channelId}`;
					target.name = entry.channelName && entry.teamName ? `${entry.teamName}/${entry.channelName}` : entry.channelName ?? entry.teamName;
				} else {
					target.id = entry.teamId;
					target.name = entry.teamName;
					target.note = "team id";
				}
				if (entry.note) target.note = entry.note;
			});
			return results;
		} },
		actions: {
			describeMessageTool: describeMSTeamsMessageTool,
			handleAction: async (ctx) => {
				if (ctx.action === "send" && ctx.params.card) {
					const card = ctx.params.card;
					return await runWithRequiredActionTarget({
						actionLabel: "Card send",
						toolParams: ctx.params,
						run: async (to) => {
							const { sendAdaptiveCardMSTeams } = await loadMSTeamsChannelRuntime();
							const result = await sendAdaptiveCardMSTeams({
								cfg: ctx.cfg,
								to,
								card
							});
							return jsonActionResultWithDetails({
								ok: true,
								channel: "msteams",
								messageId: result.messageId,
								conversationId: result.conversationId
							}, {
								ok: true,
								channel: "msteams",
								messageId: result.messageId
							});
						}
					});
				}
				if (ctx.action === "upload-file") {
					const mediaUrl = resolveActionUploadFilePath(ctx.params);
					if (!mediaUrl) return actionError("Upload-file requires media, filePath, or path.");
					return await runWithRequiredActionTarget({
						actionLabel: "Upload-file",
						toolParams: ctx.params,
						currentChannelId: ctx.toolContext?.currentChannelId,
						run: async (to) => {
							const { sendMessageMSTeams } = await loadMSTeamsChannelRuntime();
							const result = await sendMessageMSTeams({
								cfg: ctx.cfg,
								to,
								text: resolveActionContent(ctx.params),
								mediaUrl,
								filename: readOptionalTrimmedString(ctx.params, "filename") ?? readOptionalTrimmedString(ctx.params, "title"),
								mediaLocalRoots: ctx.mediaLocalRoots,
								mediaReadFile: ctx.mediaReadFile
							});
							return jsonActionResultWithDetails({
								ok: true,
								channel: "msteams",
								action: "upload-file",
								messageId: result.messageId,
								conversationId: result.conversationId,
								...result.pendingUploadId ? { pendingUploadId: result.pendingUploadId } : {}
							}, {
								ok: true,
								channel: "msteams",
								messageId: result.messageId,
								...result.pendingUploadId ? { pendingUploadId: result.pendingUploadId } : {}
							});
						}
					});
				}
				if (ctx.action === "edit") {
					const content = resolveActionContent(ctx.params);
					if (!content) return actionError("Edit requires content.");
					return await runWithRequiredActionMessageTarget({
						actionLabel: "Edit",
						toolParams: ctx.params,
						currentChannelId: ctx.toolContext?.currentChannelId,
						run: async (target) => {
							const { editMessageMSTeams } = await loadMSTeamsChannelRuntime();
							return jsonMSTeamsConversationResult((await editMessageMSTeams({
								cfg: ctx.cfg,
								to: target.to,
								activityId: target.messageId,
								text: content
							})).conversationId);
						}
					});
				}
				if (ctx.action === "delete") return await runWithRequiredActionMessageTarget({
					actionLabel: "Delete",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					run: async (target) => {
						const { deleteMessageMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsConversationResult((await deleteMessageMSTeams({
							cfg: ctx.cfg,
							to: target.to,
							activityId: target.messageId
						})).conversationId);
					}
				});
				if (ctx.action === "read") return await runWithRequiredActionMessageTarget({
					actionLabel: "Read",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (target) => {
						const { getMessageMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsOkActionResult("read", { message: await getMessageMSTeams({
							cfg: ctx.cfg,
							to: target.to,
							messageId: target.messageId
						}) });
					}
				});
				if (ctx.action === "pin") return await runWithRequiredActionMessageTarget({
					actionLabel: "Pin",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (target) => {
						const { pinMessageMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsActionResult("pin", await pinMessageMSTeams({
							cfg: ctx.cfg,
							to: target.to,
							messageId: target.messageId
						}));
					}
				});
				if (ctx.action === "unpin") return await runWithRequiredActionPinnedMessageTarget({
					actionLabel: "Unpin",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (target) => {
						const { unpinMessageMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsActionResult("unpin", await unpinMessageMSTeams({
							cfg: ctx.cfg,
							to: target.to,
							pinnedMessageId: target.pinnedMessageId
						}));
					}
				});
				if (ctx.action === "list-pins") return await runWithRequiredActionTarget({
					actionLabel: "List-pins",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (to) => {
						const { listPinsMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsOkActionResult("list-pins", await listPinsMSTeams({
							cfg: ctx.cfg,
							to
						}));
					}
				});
				if (ctx.action === "react") return await runWithRequiredActionMessageTarget({
					actionLabel: "React",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (target) => {
						const emoji = typeof ctx.params.emoji === "string" ? ctx.params.emoji.trim() : "";
						const remove = typeof ctx.params.remove === "boolean" ? ctx.params.remove : false;
						if (!emoji) return {
							isError: true,
							content: [{
								type: "text",
								text: `React requires an emoji (reaction type). Valid types: ${MSTEAMS_REACTION_TYPES.join(", ")}.`
							}],
							details: {
								error: "React requires an emoji (reaction type).",
								validTypes: [...MSTEAMS_REACTION_TYPES]
							}
						};
						if (remove) {
							const { unreactMessageMSTeams } = await loadMSTeamsChannelRuntime();
							return jsonMSTeamsActionResult("react", {
								removed: true,
								reactionType: emoji,
								...await unreactMessageMSTeams({
									cfg: ctx.cfg,
									to: target.to,
									messageId: target.messageId,
									reactionType: emoji
								})
							});
						}
						const { reactMessageMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsActionResult("react", {
							reactionType: emoji,
							...await reactMessageMSTeams({
								cfg: ctx.cfg,
								to: target.to,
								messageId: target.messageId,
								reactionType: emoji
							})
						});
					}
				});
				if (ctx.action === "reactions") return await runWithRequiredActionMessageTarget({
					actionLabel: "Reactions",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (target) => {
						const { listReactionsMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsOkActionResult("reactions", await listReactionsMSTeams({
							cfg: ctx.cfg,
							to: target.to,
							messageId: target.messageId
						}));
					}
				});
				if (ctx.action === "search") return await runWithRequiredActionTarget({
					actionLabel: "Search",
					toolParams: ctx.params,
					currentChannelId: ctx.toolContext?.currentChannelId,
					currentGraphChannelId: ctx.toolContext?.currentGraphChannelId,
					graphOnly: true,
					run: async (to) => {
						const query = resolveActionQuery(ctx.params);
						if (!query) return actionError("Search requires a target (to) and query.");
						const limit = typeof ctx.params.limit === "number" ? ctx.params.limit : void 0;
						const from = typeof ctx.params.from === "string" ? ctx.params.from.trim() : void 0;
						const { searchMessagesMSTeams } = await loadMSTeamsChannelRuntime();
						return jsonMSTeamsOkActionResult("search", await searchMessagesMSTeams({
							cfg: ctx.cfg,
							to,
							query,
							from: from || void 0,
							limit
						}));
					}
				});
				if (ctx.action === "member-info") {
					const userId = normalizeOptionalString(ctx.params.userId) ?? "";
					if (!userId) return actionError("member-info requires a userId.");
					const { getMemberInfoMSTeams } = await loadMSTeamsChannelRuntime();
					return jsonMSTeamsOkActionResult("member-info", await getMemberInfoMSTeams({
						cfg: ctx.cfg,
						userId
					}));
				}
				if (ctx.action === "channel-list") {
					const teamId = normalizeOptionalString(ctx.params.teamId) ?? "";
					if (!teamId) return actionError("channel-list requires a teamId.");
					const { listChannelsMSTeams } = await loadMSTeamsChannelRuntime();
					return jsonMSTeamsOkActionResult("channel-list", await listChannelsMSTeams({
						cfg: ctx.cfg,
						teamId
					}));
				}
				if (ctx.action === "channel-info") {
					const teamId = normalizeOptionalString(ctx.params.teamId) ?? "";
					const channelId = normalizeOptionalString(ctx.params.channelId) ?? "";
					if (!teamId || !channelId) return actionError("channel-info requires teamId and channelId.");
					const { getChannelInfoMSTeams } = await loadMSTeamsChannelRuntime();
					return jsonMSTeamsOkActionResult("channel-info", { channelInfo: (await getChannelInfoMSTeams({
						cfg: ctx.cfg,
						teamId,
						channelId
					})).channel });
				}
				if (ctx.action === "addParticipant") {
					const userId = typeof ctx.params.userId === "string" ? ctx.params.userId.trim() : "";
					if (!userId) return actionError("addParticipant requires a userId.");
					return await runWithRequiredActionTarget({
						actionLabel: "addParticipant",
						toolParams: ctx.params,
						currentChannelId: ctx.toolContext?.currentChannelId,
						run: async (to) => {
							const role = readOptionalTrimmedString(ctx.params, "role");
							const { addParticipantMSTeams } = await loadMSTeamsChannelRuntime();
							return jsonMSTeamsOkActionResult("addParticipant", await addParticipantMSTeams({
								cfg: ctx.cfg,
								to,
								userId,
								role
							}));
						}
					});
				}
				if (ctx.action === "removeParticipant") {
					const userId = typeof ctx.params.userId === "string" ? ctx.params.userId.trim() : "";
					if (!userId) return actionError("removeParticipant requires a userId.");
					return await runWithRequiredActionTarget({
						actionLabel: "removeParticipant",
						toolParams: ctx.params,
						currentChannelId: ctx.toolContext?.currentChannelId,
						run: async (to) => {
							const { removeParticipantMSTeams } = await loadMSTeamsChannelRuntime();
							return jsonMSTeamsOkActionResult("removeParticipant", await removeParticipantMSTeams({
								cfg: ctx.cfg,
								to,
								userId
							}));
						}
					});
				}
				if (ctx.action === "renameGroup") {
					const name = typeof ctx.params.name === "string" ? ctx.params.name.trim() : "";
					if (!name) return actionError("renameGroup requires a name.");
					return await runWithRequiredActionTarget({
						actionLabel: "renameGroup",
						toolParams: ctx.params,
						currentChannelId: ctx.toolContext?.currentChannelId,
						run: async (to) => {
							const { renameGroupMSTeams } = await loadMSTeamsChannelRuntime();
							return jsonMSTeamsOkActionResult("renameGroup", await renameGroupMSTeams({
								cfg: ctx.cfg,
								to,
								name
							}));
						}
					});
				}
				return null;
			}
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID, { port: null }),
			buildChannelSummary: ({ snapshot }) => buildProbeChannelStatusSummary(snapshot, { port: snapshot.port ?? null }),
			probeAccount: async ({ cfg }) => await (await loadMSTeamsChannelRuntime()).probeMSTeams(cfg.channels?.msteams),
			formatCapabilitiesProbe: ({ probe }) => {
				const teamsProbe = probe;
				const lines = [];
				const appId = typeof teamsProbe?.appId === "string" ? teamsProbe.appId.trim() : "";
				if (appId) lines.push({ text: `App: ${appId}` });
				const graph = teamsProbe?.graph;
				if (graph) {
					const roles = Array.isArray(graph.roles) ? graph.roles.map((role) => role.trim()).filter(Boolean) : [];
					const scopes = Array.isArray(graph.scopes) ? graph.scopes.map((scope) => scope.trim()).filter(Boolean) : [];
					const formatPermission = (permission) => {
						const hint = TEAMS_GRAPH_PERMISSION_HINTS[permission];
						return hint ? `${permission} (${hint})` : permission;
					};
					if (!graph.ok) lines.push({
						text: `Graph: ${graph.error ?? "failed"}`,
						tone: "error"
					});
					else if (roles.length > 0 || scopes.length > 0) {
						if (roles.length > 0) lines.push({ text: `Graph roles: ${roles.map(formatPermission).join(", ")}` });
						if (scopes.length > 0) lines.push({ text: `Graph scopes: ${scopes.map(formatPermission).join(", ")}` });
					} else if (graph.ok) lines.push({ text: "Graph: ok" });
				}
				return lines;
			},
			resolveAccountSnapshot: ({ account, runtime }) => ({
				accountId: account.accountId,
				enabled: account.enabled,
				configured: account.configured,
				extra: { port: runtime?.port ?? null }
			})
		}),
		gateway: { startAccount: async (ctx) => {
			const { monitorMSTeamsProvider } = await import("./src-B16REEoz.js");
			const port = ctx.cfg.channels?.msteams?.webhook?.port ?? 3978;
			ctx.setStatus({
				accountId: ctx.accountId,
				port
			});
			ctx.log?.info(`starting provider (port ${port})`);
			return monitorMSTeamsProvider({
				cfg: ctx.cfg,
				runtime: ctx.runtime,
				abortSignal: ctx.abortSignal
			});
		} }
	},
	security: { collectWarnings: projectConfigWarningCollector(collectMSTeamsSecurityWarnings) },
	pairing: { text: {
		idLabel: "msteamsUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^(msteams|user):/i),
		notify: async ({ cfg, id, message }) => {
			const { sendMessageMSTeams } = await loadMSTeamsChannelRuntime();
			await sendMessageMSTeams({
				cfg,
				to: id,
				text: message
			});
		}
	} },
	threading: { buildToolContext: ({ context, hasRepliedRef }) => {
		const nativeChannelId = context.NativeChannelId?.trim();
		const hasChannelRoute = Boolean(nativeChannelId && nativeChannelId.includes("/"));
		return {
			currentChannelId: normalizeOptionalString(context.To),
			currentGraphChannelId: hasChannelRoute ? nativeChannelId : void 0,
			currentThreadTs: context.ReplyToId,
			hasRepliedRef
		};
	} },
	outbound: {
		deliveryMode: "direct",
		chunker: chunkTextForOutbound,
		chunkerMode: "markdown",
		textChunkLimit: 4e3,
		pollMaxOptions: 12,
		...createRuntimeOutboundDelegates({
			getRuntime: loadMSTeamsChannelRuntime,
			sendText: { resolve: (runtime) => runtime.msteamsOutbound.sendText },
			sendMedia: { resolve: (runtime) => runtime.msteamsOutbound.sendMedia },
			sendPoll: { resolve: (runtime) => runtime.msteamsOutbound.sendPoll }
		})
	}
});
//#endregion
export { msteamsSetupAdapter as a, createMSTeamsSetupWizardBase as i, msteamsSetupWizard as n, openDelegatedOAuthUrl as r, msteamsPlugin as t };
