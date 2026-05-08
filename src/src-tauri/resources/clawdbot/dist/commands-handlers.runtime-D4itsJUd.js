import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, i as normalizeFastMode, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { _ as resolveStateDir } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { p as resolveUserPath, r as clampInt } from "./utils-DvkbxKCZ.js";
import { r as logVerbose } from "./globals-CJu56k75.js";
import { r as normalizeOptionalAccountId } from "./account-id-DhSD7lhD.js";
import { u as resolveAgentIdFromSessionKey } from "./session-key-hxP9B3Or.js";
import { b as resolveAgentDir, p as resolveSessionAgentId, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { s as normalizeStringEntries } from "./string-normalization-Cz5hTdB3.js";
import { D as validateConfigObjectWithPlugins, F as setConfigOverride, I as unsetConfigOverride, N as getConfigOverrides, P as resetConfigOverrides, u as readConfigFileSnapshot } from "./io-CFdEhZuM.js";
import { n as clearPluginManifestRegistryCache, r as loadInstalledPluginIndexInstallRecords } from "./manifest-registry-CXpW6f0a.js";
import { o as normalizeChannelId } from "./registry-GHcDenJ3.js";
import { i as normalizeChannelId$1, t as getChannelPlugin } from "./registry-yTN80EXi.js";
import { f as resolveArchiveKind } from "./archive-CsgTa6c_.js";
import "./installed-plugin-index-records-Z8-yA-Tm.js";
import { i as unsetConfigValueAtPath, n as parseConfigPath, r as setConfigValueAtPath, t as getConfigValueAtPath } from "./config-paths-B_UaJ6Jd.js";
import { t as parseDurationMs } from "./parse-duration-D7zSmneY.js";
import { r as replaceConfigFile } from "./config--k_1dtUP.js";
import { n as isRestartEnabled, t as isCommandFlagEnabled } from "./commands.flags-MaTsudt1.js";
import { i as GATEWAY_CLIENT_NAMES, r as GATEWAY_CLIENT_MODES } from "./client-info-B22NhLQV.js";
import { r as isInternalMessageChannel, u as normalizeMessageChannel } from "./message-channel-B32dwK-Q.js";
import { f as triggerOpenClawRestart, l as scheduleGatewaySigusr1Restart } from "./restart-BEJNVwEm.js";
import { n as resolveChannelApprovalCapability } from "./plugins-D-K4uCVI.js";
import { m as triggerInternalHook, n as createInternalHookEvent } from "./internal-hooks-BafH2tQ8.js";
import { S as prepareProviderRuntimeAuth } from "./provider-runtime-CwkNkui5.js";
import { n as ensureOpenClawModelsJson } from "./models-config-Bv7OnXdx.js";
import { _ as resolveResponseUsageMode, h as normalizeUsageDisplay } from "./thinking-DhTFkZJF.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-BQozaooK.js";
import { i as discoverModels, r as discoverAuthStorage } from "./pi-model-discovery-CsMq3g6_.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath, r as resolveDefaultSessionStorePath } from "./paths-CHP3g1Fg.js";
import { t as loadSessionStore } from "./store-load-DLuD4etm.js";
import { o as resolveFreshSessionTotalTokens } from "./types-UHw-opRq.js";
import { o as updateSessionStore } from "./store-CR7YmZjp.js";
import { t as extractDeliveryInfo } from "./sessions-CLHVJJOI.js";
import { r as readLatestAssistantTextFromSessionTranscript } from "./transcript-BhP11178.js";
import { i as formatUsd, r as formatTokenCount } from "./usage-format-CxRWdJfK.js";
import { n as stripInboundMetadata } from "./strip-inbound-meta-DIrNhXW1.js";
import { t as diagnosticLogger } from "./diagnostic-runtime-Dm_GuBgJ.js";
import { r as isSilentReplyPayloadText } from "./tokens-D3yEVrkk.js";
import { n as redactSupportString } from "./diagnostic-support-redaction-DSVR3jb7.js";
import { C as resolveTrajectoryFilePath, D as sanitizeDiagnosticPayload, E as safeJsonStringify, S as TRAJECTORY_RUNTIME_FILE_MAX_BYTES, T as safeTrajectorySessionFileName, w as resolveTrajectoryPointerFilePath } from "./selection-D9uTvvsw.js";
import { C as setTtsMaxLength, D as textToSpeech, S as setTtsEnabled, T as setTtsProvider, _ as resolveTtsPrefsPath, a as getTtsMaxLength, b as setSummarizationEnabled, c as isSummarizationEnabled, f as listTtsPersonas, g as resolveTtsConfig, i as getResolvedSpeechProviderConfig, l as isTtsEnabled, o as getTtsPersona, r as getLastTtsAttempt, s as getTtsProvider, u as isTtsProviderConfigured, w as setTtsPersona, y as setLastTtsAttempt } from "./tts-runtime-B_NCSUbj.js";
import "./tts-DGauou57.js";
import { t as analyzeBootstrapBudget } from "./bootstrap-budget-FLCjP_87.js";
import { g as resolveBootstrapTotalMaxChars, m as resolveBootstrapMaxChars } from "./pi-embedded-helpers-QjS8cMrW.js";
import { n as resolveSandboxRuntimeStatus } from "./runtime-status-C_nvYxR5.js";
import { i as resolveImageSanitizationLimits, n as sanitizeImageBlocks } from "./tool-images-gG8dJ_Bm.js";
import { r as getApiKeyForModel } from "./model-auth-Bic7ggHC.js";
import { t as registerProviderStreamForModel } from "./provider-stream-BtN3gEYv.js";
import { a as stripToolResultDetails } from "./session-transcript-repair-D9T_omS-.js";
import { t as EmbeddedBlockChunker } from "./pi-embedded-block-chunker-C90lJNMO.js";
import { r as callGateway } from "./call-CP7A3sdw.js";
import { i as formatDoctorNonInteractiveHint, l as removeRestartSentinelFile, m as writeRestartSentinel, n as buildRestartSuccessContinuation } from "./restart-sentinel-xJkrCnsf.js";
import { i as resolveReplyToMode } from "./reply-threading-BA5HnoRq.js";
import { _ as authorizeConfigWriteShared, b as resolveConfigWriteTargetFromPathShared, v as canBypassConfigWritePolicyShared, y as formatConfigWriteDeniedMessageShared } from "./channel-config-helpers-C9OhAb3g.js";
import { n as formatTaskStatusDetail, r as formatTaskStatusTitle, t as buildTaskStatusSnapshot } from "./task-status-B_agTNy0.js";
import { a as clearSessionQueues } from "./queue-B4CxW4nn.js";
import { r as getSessionBindingService } from "./session-binding-service-BQV_OJiA.js";
import { h as replyRunRegistry, r as getActiveEmbeddedRunSnapshot } from "./runs-CCsjme9h.js";
import "./diagnostic-DitKp9ni.js";
import { t as formatDurationCompact } from "./format-duration-RKAeRo-j.js";
import "./sandbox-C77UjGet.js";
import { t as buildSystemPromptReport } from "./system-prompt-report-DGlITDCC.js";
import { n as estimateTokensFromChars } from "./cjk-chars-BExHXToM.js";
import { i as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-BqR0jo0c.js";
import { r as resolveModelWithRegistry } from "./model-CkUlgtmi.js";
import { i as matchPluginCommand, n as executePluginCommand } from "./commands-CgVoTNyj.js";
import { t as isApprovalNotFoundError } from "./approval-errors-DuQyMtYt.js";
import { r as normalizeCommandBody } from "./commands-registry-normalize-DsZjXurY.js";
import { i as setAbortMemory, r as isAbortTrigger } from "./abort-primitives-DiKONiMC.js";
import "./commands-registry-DPcvwVIV.js";
import { n as getSpeechProvider, r as listSpeechProviders, t as canonicalizeSpeechProviderId } from "./provider-registry-C_yMfURD.js";
import { r as resolveConversationBindingContextFromAcpCommand } from "./conversation-binding-input-B2xFrfDD.js";
import { o as stripMentions, s as stripStructuralPrefixes } from "./mentions-DBu-D91I.js";
import { n as formatTimeAgo } from "./format-relative-X9cyrG2_.js";
import { n as setChannelConversationBindingMaxAgeBySessionKey, t as setChannelConversationBindingIdleTimeoutBySessionKey } from "./conversation-bindings-BxkhqJJr.js";
import { a as readChannelAllowFromStore, l as removeChannelAllowFromStoreEntry, t as addChannelAllowFromStoreEntry } from "./pairing-store-YNHOr2Zu.js";
import { t as handleCrestodianCommand } from "./commands-crestodian-BHDxlb5m.js";
import { i as installPluginFromPath, r as installPluginFromNpmSpec } from "./install-BrXYq_UK.js";
import { n as isImplicitSameChatApprovalAuthorization } from "./approval-auth-helpers-OH0f7fUH.js";
import { n as parseActivationCommand } from "./group-activation-CCArcZ5m.js";
import { t as resolveFastModeState } from "./fast-mode-_3gtSJl4.js";
import { n as resolveSessionAuthProfileOverride } from "./session-override-ee-t8Wkq.js";
import { n as extractExplicitGroupId, t as formatElevatedUnavailableMessage } from "./elevated-unavailable-UDwkq1P0.js";
import { t as resolveRuntimePolicySessionKey } from "./runtime-policy-session-key-D3idRY2M.js";
import { a as shouldPersistAbortCutoff, i as resolveAbortCutoffFromContext, t as applyAbortCutoffToSessionEntry } from "./abort-cutoff-CBx1z2gb.js";
import { t as resolveEffectiveToolInventory } from "./tools-effective-inventory-BUnrcBOQ.js";
import { n as resolveSessionEntryForKey, r as stopSubagentsForRequester, t as formatAbortReplyText } from "./abort--I4OWmJd.js";
import { t as extractBtwQuestion } from "./btw-command-a8FDMj9y.js";
import { t as formatThreadBindingDurationLabel } from "./thread-bindings-messages-B-NBj3dt.js";
import { a as requireGatewayClientScopeForInternalChannel, i as requireCommandFlagEnabled, n as rejectNonOwnerCommand, r as rejectUnauthorizedCommand, t as buildDisabledCommandReply } from "./command-gates-B8faL7lt.js";
import { t as handleAcpCommand } from "./commands-acp-Bjbq9ThE.js";
import { n as buildCommandsMessagePaginated, r as buildHelpMessage, t as buildCommandsMessage } from "./command-status-builders-NPB4ErhF.js";
import { _ as getFinishedSession, v as getSession } from "./bash-tools.exec-runtime-omWiLrNq.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-Dh4XF0y6.js";
import { r as handleModelsCommand } from "./commands-models-bNPIHm04.js";
import { t as setPluginEnabledInConfig } from "./toggle-config-DABeGYsX.js";
import { r as createExecTool } from "./bash-tools-Db6p2FC5.js";
import { n as listTasksForAgentIdForStatus, r as listTasksForSessionKeyForStatus } from "./status-text-6KOM63ES.js";
import { n as buildThreadingToolContext } from "./agent-runner-utils-Cnp6pEMl.js";
import { d as resolveChannelAccountId, f as resolveCommandSurfaceChannel, l as resolveSubagentsAction, o as resolveHandledPrefix, s as resolveRequesterSessionKey, u as stopWithText } from "./shared-DuvhyTe6.js";
import { t as buildToolsMessage } from "./status-BldShvE2.js";
import { i as parseConfigValue, n as setConfiguredMcpServer, r as unsetConfiguredMcpServer, t as listConfiguredMcpServers } from "./mcp-config-DwhMFqwk.js";
import { t as resolveCommandsSystemPromptBundle } from "./commands-system-prompt-C5541ZfB.js";
import { a as writeSupportBundleDirectory, i as textSupportBundleFile, n as jsonlSupportBundleFile, r as supportBundleContents, t as jsonSupportBundleFile } from "./diagnostic-support-bundle-BsuG-9So.js";
import { t as buildStatusReply } from "./commands-status-D4s59VB4.js";
import { n as persistPluginInstall, r as buildNpmInstallRecordFields } from "./plugins-install-persist-CGROasl4.js";
import { t as parseClawHubPluginSpec } from "./clawhub-spec-Bq7_dhr9.js";
import "./clawhub-CGP935vu.js";
import { n as installPluginFromClawHub } from "./clawhub-BQekueYp.js";
import { a as buildPluginDiagnosticsReport, l as formatPluginCompatibilityNotice, o as buildPluginInspectReport, s as buildPluginRegistrySnapshotReport, t as buildAllPluginInspectReports } from "./status-8bmXOkc1.js";
import { a as createPluginInstallLogger, f as resolveFileNpmSpecToLocalPath, o as decidePreferredClawHubFallback, r as buildPreferredClawHubSpec } from "./plugins-command-helpers--nexq2_8.js";
import { t as refreshPluginRegistryAfterConfigMutation } from "./plugins-registry-refresh-pFqI_Vqq.js";
import { n as loadCostUsageSummary, r as loadSessionCostSummary } from "./session-cost-usage-BwDaKDyw.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/channels/plugins/config-writes.ts
function isInternalConfigWriteMessageChannel(channel) {
	return normalizeLowercaseStringOrEmpty(channel) === "webchat";
}
function authorizeConfigWrite(params) {
	return authorizeConfigWriteShared(params);
}
function resolveConfigWriteTargetFromPath(path) {
	return resolveConfigWriteTargetFromPathShared({
		path,
		normalizeChannelId: (raw) => normalizeLowercaseStringOrEmpty(raw)
	});
}
function canBypassConfigWritePolicy(params) {
	return canBypassConfigWritePolicyShared({
		...params,
		isInternalMessageChannel: isInternalConfigWriteMessageChannel
	});
}
function formatConfigWriteDeniedMessage(params) {
	return formatConfigWriteDeniedMessageShared(params);
}
//#endregion
//#region src/auto-reply/reply/config-write-authorization.ts
function resolveConfigWriteDeniedText(params) {
	const writeAuth = authorizeConfigWrite({
		cfg: params.cfg,
		origin: {
			channelId: params.channelId,
			accountId: params.accountId
		},
		target: params.target,
		allowBypass: canBypassConfigWritePolicy({
			channel: params.channel ?? "",
			gatewayClientScopes: params.gatewayClientScopes
		})
	});
	if (writeAuth.allowed) return null;
	return formatConfigWriteDeniedMessage({
		result: writeAuth,
		fallbackChannelId: params.channelId
	});
}
//#endregion
//#region src/auto-reply/reply/commands-allowlist.ts
const ACTIONS = new Set([
	"list",
	"add",
	"remove"
]);
const SCOPES = new Set([
	"dm",
	"group",
	"all"
]);
function resolveAllowlistAccountId(params) {
	const explicitAccountId = normalizeOptionalAccountId(params.parsedAccount);
	if (explicitAccountId) return explicitAccountId;
	const configuredDefaultAccountId = normalizeOptionalString(getChannelPlugin(params.channelId)?.config.defaultAccountId?.(params.cfg));
	const ctxAccountId = normalizeOptionalAccountId(params.ctxAccountId);
	return configuredDefaultAccountId || ctxAccountId || "default";
}
function parseAllowlistCommand(raw) {
	const trimmed = raw.trim();
	if (!(normalizeOptionalLowercaseString(trimmed) ?? "").startsWith("/allowlist")) return null;
	const rest = trimmed.slice(10).trim();
	if (!rest) return {
		action: "list",
		scope: "dm"
	};
	const tokens = rest.split(/\s+/);
	let action = "list";
	let scope = "dm";
	let resolve = false;
	let target = "both";
	let channel;
	let account;
	const entryTokens = [];
	let i = 0;
	const firstAction = normalizeOptionalLowercaseString(tokens[i]);
	if (firstAction && ACTIONS.has(firstAction)) {
		action = firstAction;
		i += 1;
	}
	const firstScope = normalizeOptionalLowercaseString(tokens[i]);
	if (firstScope && SCOPES.has(firstScope)) {
		scope = firstScope;
		i += 1;
	}
	for (; i < tokens.length; i += 1) {
		const token = tokens[i];
		const lowered = normalizeOptionalLowercaseString(token) ?? "";
		if (lowered === "--resolve" || lowered === "resolve") {
			resolve = true;
			continue;
		}
		if (lowered === "--config" || lowered === "config") {
			target = "config";
			continue;
		}
		if (lowered === "--store" || lowered === "store") {
			target = "store";
			continue;
		}
		if (lowered === "--channel" && tokens[i + 1]) {
			channel = tokens[i + 1];
			i += 1;
			continue;
		}
		if (lowered === "--account" && tokens[i + 1]) {
			account = tokens[i + 1];
			i += 1;
			continue;
		}
		const kv = token.split("=");
		if (kv.length === 2) {
			const key = normalizeOptionalLowercaseString(kv[0]);
			const value = normalizeOptionalString(kv[1]);
			if (key === "channel") {
				if (value) channel = value;
				continue;
			}
			if (key === "account") {
				if (value) account = value;
				continue;
			}
			const normalizedValue = normalizeOptionalLowercaseString(value);
			if (key === "scope" && normalizedValue && SCOPES.has(normalizedValue)) {
				scope = normalizedValue;
				continue;
			}
		}
		entryTokens.push(token);
	}
	if (action === "add" || action === "remove") {
		const entry = entryTokens.join(" ").trim();
		if (!entry) return {
			action: "error",
			message: "Usage: /allowlist add|remove <entry>"
		};
		return {
			action,
			scope,
			entry,
			channel,
			account,
			resolve,
			target
		};
	}
	return {
		action: "list",
		scope,
		channel,
		account,
		resolve
	};
}
function normalizeAllowFrom(params) {
	const plugin = getChannelPlugin(params.channelId);
	if (plugin?.config.formatAllowFrom) return plugin.config.formatAllowFrom({
		cfg: params.cfg,
		accountId: params.accountId,
		allowFrom: params.values
	});
	return normalizeStringEntries(params.values);
}
function formatEntryList(entries, resolved) {
	if (entries.length === 0) return "(none)";
	return entries.map((entry) => {
		const name = resolved?.get(entry);
		return name ? `${entry} (${name})` : entry;
	}).join(", ");
}
async function updatePairingStoreAllowlist(params) {
	const storeEntry = {
		channel: params.channelId,
		entry: params.entry,
		accountId: params.accountId
	};
	if (params.action === "add") {
		await addChannelAllowFromStoreEntry(storeEntry);
		return;
	}
	await removeChannelAllowFromStoreEntry(storeEntry);
	if (params.accountId === "default") await removeChannelAllowFromStoreEntry({
		channel: params.channelId,
		entry: params.entry
	});
}
function mapResolvedAllowlistNames(entries) {
	const map = /* @__PURE__ */ new Map();
	for (const entry of entries) if (entry.resolved && entry.name) map.set(entry.input, entry.name);
	return map;
}
async function resolveAllowlistNames(params) {
	return mapResolvedAllowlistNames(await getChannelPlugin(params.channelId)?.allowlist?.resolveNames?.({
		cfg: params.cfg,
		accountId: params.accountId,
		scope: params.scope,
		entries: params.entries
	}) ?? []);
}
async function readAllowlistConfig(params) {
	return await getChannelPlugin(params.channelId)?.allowlist?.readConfig?.({
		cfg: params.cfg,
		accountId: params.accountId
	}) ?? {};
}
const handleAllowlistCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const parsed = parseAllowlistCommand(params.command.commandBodyNormalized);
	if (!parsed) return null;
	if (parsed.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${parsed.message}` }
	};
	const unauthorized = rejectUnauthorizedCommand(params, "/allowlist");
	if (unauthorized) return unauthorized;
	if (parsed.action !== "list") {
		const nonOwner = rejectNonOwnerCommand(params, "/allowlist");
		if (nonOwner) return nonOwner;
	}
	const channelId = normalizeChannelId(parsed.channel) ?? params.command.channelId ?? normalizeChannelId(params.command.channel);
	if (!channelId) return {
		shouldContinue: false,
		reply: { text: "⚠️ Unknown channel. Add channel=<id> to the command." }
	};
	if (normalizeOptionalString(parsed.account) && !normalizeOptionalAccountId(parsed.account)) return {
		shouldContinue: false,
		reply: { text: "⚠️ Invalid account id. Reserved keys (__proto__, constructor, prototype) are blocked." }
	};
	const accountId = resolveAllowlistAccountId({
		cfg: params.cfg,
		channelId,
		parsedAccount: parsed.account,
		ctxAccountId: params.ctx.AccountId
	});
	const plugin = getChannelPlugin(channelId);
	if (parsed.action === "list") {
		const supportsStore = Boolean(plugin?.pairing);
		if (!plugin?.allowlist?.readConfig && !supportsStore) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${channelId} does not expose allowlist configuration.` }
		};
		const storeAllowFrom = supportsStore ? await readChannelAllowFromStore(channelId, process.env, accountId).catch(() => []) : [];
		const configState = await readAllowlistConfig({
			cfg: params.cfg,
			channelId,
			accountId
		});
		const dmAllowFrom = (configState.dmAllowFrom ?? []).map(String);
		const groupAllowFrom = (configState.groupAllowFrom ?? []).map(String);
		const groupOverrides = (configState.groupOverrides ?? []).map((entry) => ({
			label: entry.label,
			entries: entry.entries.map(String).filter(Boolean)
		}));
		const dmDisplay = normalizeAllowFrom({
			cfg: params.cfg,
			channelId,
			accountId,
			values: dmAllowFrom
		});
		const groupDisplay = normalizeAllowFrom({
			cfg: params.cfg,
			channelId,
			accountId,
			values: groupAllowFrom
		});
		const groupOverrideEntries = groupOverrides.flatMap((entry) => entry.entries);
		const groupOverrideDisplay = normalizeAllowFrom({
			cfg: params.cfg,
			channelId,
			accountId,
			values: groupOverrideEntries
		});
		const resolvedDm = parsed.resolve && dmDisplay.length > 0 ? await resolveAllowlistNames({
			cfg: params.cfg,
			channelId,
			accountId,
			scope: "dm",
			entries: dmDisplay
		}) : void 0;
		const resolvedGroup = parsed.resolve && groupOverrideDisplay.length > 0 ? await resolveAllowlistNames({
			cfg: params.cfg,
			channelId,
			accountId,
			scope: "group",
			entries: groupOverrideDisplay
		}) : void 0;
		const lines = ["🧾 Allowlist"];
		lines.push(`Channel: ${channelId}${accountId ? ` (account ${accountId})` : ""}`);
		if (configState.dmPolicy) lines.push(`DM policy: ${configState.dmPolicy}`);
		if (configState.groupPolicy) lines.push(`Group policy: ${configState.groupPolicy}`);
		const showDm = parsed.scope === "dm" || parsed.scope === "all";
		const showGroup = parsed.scope === "group" || parsed.scope === "all";
		if (showDm) lines.push(`DM allowFrom (config): ${formatEntryList(dmDisplay, resolvedDm)}`);
		if (supportsStore && storeAllowFrom.length > 0) {
			const storeLabel = normalizeAllowFrom({
				cfg: params.cfg,
				channelId,
				accountId,
				values: storeAllowFrom
			});
			lines.push(`Paired allowFrom (store): ${formatEntryList(storeLabel)}`);
		}
		if (showGroup) {
			if (groupAllowFrom.length > 0) lines.push(`Group allowFrom (config): ${formatEntryList(groupDisplay, resolvedGroup)}`);
			if (groupOverrides.length > 0) {
				lines.push("Group overrides:");
				for (const entry of groupOverrides) {
					const normalized = normalizeAllowFrom({
						cfg: params.cfg,
						channelId,
						accountId,
						values: entry.entries
					});
					lines.push(`- ${entry.label}: ${formatEntryList(normalized, resolvedGroup)}`);
				}
			}
		}
		return {
			shouldContinue: false,
			reply: { text: lines.join("\n") }
		};
	}
	const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/allowlist write",
		allowedScopes: ["operator.admin"],
		missingText: "❌ /allowlist add|remove requires operator.admin for gateway clients."
	});
	if (missingAdminScope) return missingAdminScope;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/allowlist edits",
		configKey: "config",
		disabledVerb: "are"
	});
	if (disabled) return disabled;
	const shouldUpdateConfig = parsed.target !== "store";
	const shouldTouchStore = parsed.target !== "config" && Boolean(plugin?.pairing);
	if (shouldUpdateConfig) {
		if (parsed.scope === "all") return {
			shouldContinue: false,
			reply: { text: "⚠️ /allowlist add|remove requires scope dm or group." }
		};
		if (!plugin?.allowlist?.applyConfigEdit) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${channelId} does not support ${parsed.scope} allowlist edits via /allowlist.` }
		};
		const snapshot = await readConfigFileSnapshot();
		if (!snapshot.valid || !snapshot.parsed || typeof snapshot.parsed !== "object") return {
			shouldContinue: false,
			reply: { text: "⚠️ Config file is invalid; fix it before using /allowlist." }
		};
		const parsedConfig = structuredClone(snapshot.parsed);
		const editResult = await plugin.allowlist.applyConfigEdit({
			cfg: params.cfg,
			parsedConfig,
			accountId,
			scope: parsed.scope,
			action: parsed.action,
			entry: parsed.entry
		});
		if (!editResult) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${channelId} does not support ${parsed.scope} allowlist edits via /allowlist.` }
		};
		if (editResult.kind === "invalid-entry") return {
			shouldContinue: false,
			reply: { text: "⚠️ Invalid allowlist entry." }
		};
		const deniedText = resolveConfigWriteDeniedText({
			cfg: params.cfg,
			channel: params.command.channel,
			channelId,
			accountId,
			gatewayClientScopes: params.ctx.GatewayClientScopes,
			target: editResult.writeTarget
		});
		if (deniedText) return {
			shouldContinue: false,
			reply: { text: deniedText }
		};
		const configChanged = editResult.changed;
		if (configChanged) {
			const validated = validateConfigObjectWithPlugins(parsedConfig);
			if (!validated.ok) {
				const issue = validated.issues[0];
				return {
					shouldContinue: false,
					reply: { text: `⚠️ Config invalid after update (${issue.path}: ${issue.message}).` }
				};
			}
			await replaceConfigFile({
				nextConfig: validated.config,
				afterWrite: { mode: "auto" }
			});
		}
		if (!configChanged && !shouldTouchStore) return {
			shouldContinue: false,
			reply: { text: parsed.action === "add" ? "✅ Already allowlisted." : "⚠️ Entry not found." }
		};
		if (shouldTouchStore) await updatePairingStoreAllowlist({
			action: parsed.action,
			channelId,
			accountId,
			entry: parsed.entry
		});
		const actionLabel = parsed.action === "add" ? "added" : "removed";
		const scopeLabel = parsed.scope === "dm" ? "DM" : "group";
		const locations = [];
		if (configChanged) locations.push(editResult.pathLabel);
		if (shouldTouchStore) locations.push("pairing store");
		return {
			shouldContinue: false,
			reply: { text: `✅ ${scopeLabel} allowlist ${actionLabel}: ${locations.length > 0 ? locations.join(" + ") : "no-op"}.` }
		};
	}
	if (!shouldTouchStore) return {
		shouldContinue: false,
		reply: { text: "⚠️ This channel does not support allowlist storage." }
	};
	await updatePairingStoreAllowlist({
		action: parsed.action,
		channelId,
		accountId,
		entry: parsed.entry
	});
	const actionLabel = parsed.action === "add" ? "added" : "removed";
	return {
		shouldContinue: false,
		reply: { text: `✅ ${parsed.scope === "dm" ? "DM" : "group"} allowlist ${actionLabel} in pairing store.` }
	};
};
//#endregion
//#region src/infra/channel-approval-auth.ts
function resolveApprovalCommandAuthorization(params) {
	const channel = normalizeMessageChannel(params.channel);
	if (!channel) return {
		authorized: true,
		explicit: false
	};
	const approvalCapability = resolveChannelApprovalCapability(getChannelPlugin(channel));
	const resolved = approvalCapability?.authorizeActorAction?.({
		cfg: params.cfg,
		accountId: params.accountId,
		senderId: params.senderId,
		action: "approve",
		approvalKind: params.kind
	});
	if (!resolved) return {
		authorized: true,
		explicit: false
	};
	const implicitSameChatAuthorization = isImplicitSameChatApprovalAuthorization(resolved);
	const availability = approvalCapability?.getActionAvailabilityState?.({
		cfg: params.cfg,
		accountId: params.accountId,
		action: "approve",
		approvalKind: params.kind
	});
	return {
		authorized: resolved.authorized,
		reason: resolved.reason,
		explicit: resolved.authorized ? !implicitSameChatAuthorization && availability?.kind !== "disabled" : true
	};
}
//#endregion
//#region src/auto-reply/reply/commands-approve.ts
const COMMAND_REGEX = /^\/?approve(?:\s|$)/i;
const FOREIGN_COMMAND_MENTION_REGEX = /^\/approve@([^\s]+)(?:\s|$)/i;
const DECISION_ALIASES = {
	allow: "allow-once",
	once: "allow-once",
	"allow-once": "allow-once",
	allowonce: "allow-once",
	always: "allow-always",
	"allow-always": "allow-always",
	allowalways: "allow-always",
	deny: "deny",
	reject: "deny",
	block: "deny"
};
const APPROVE_USAGE_TEXT = "Usage: /approve <id> <decision> (see the pending approval message for available decisions)";
function parseApproveCommand(raw) {
	const trimmed = raw.trim();
	if (FOREIGN_COMMAND_MENTION_REGEX.test(trimmed)) return {
		ok: false,
		error: "❌ This /approve command targets a different Telegram bot."
	};
	const commandMatch = trimmed.match(COMMAND_REGEX);
	if (!commandMatch) return null;
	const rest = trimmed.slice(commandMatch[0].length).trim();
	if (!rest) return {
		ok: false,
		error: APPROVE_USAGE_TEXT
	};
	const tokens = rest.split(/\s+/).filter(Boolean);
	if (tokens.length < 2) return {
		ok: false,
		error: APPROVE_USAGE_TEXT
	};
	const first = normalizeLowercaseStringOrEmpty(tokens[0]);
	const second = normalizeLowercaseStringOrEmpty(tokens[1]);
	if (DECISION_ALIASES[first]) return {
		ok: true,
		decision: DECISION_ALIASES[first],
		id: tokens.slice(1).join(" ").trim()
	};
	if (DECISION_ALIASES[second]) return {
		ok: true,
		decision: DECISION_ALIASES[second],
		id: tokens[0]
	};
	return {
		ok: false,
		error: APPROVE_USAGE_TEXT
	};
}
function buildResolvedByLabel(params) {
	return `${params.command.channel}:${params.command.senderId ?? "unknown"}`;
}
function formatApprovalSubmitError(error) {
	return formatErrorMessage(error);
}
function resolveApprovalMethods(params) {
	if (params.approvalId.startsWith("plugin:")) return params.pluginAuthorization.authorized ? ["plugin.approval.resolve"] : [];
	if (params.execAuthorization.authorized && params.pluginAuthorization.authorized) return ["exec.approval.resolve", "plugin.approval.resolve"];
	if (params.execAuthorization.authorized) return ["exec.approval.resolve"];
	if (params.pluginAuthorization.authorized) return ["plugin.approval.resolve"];
	return [];
}
function resolveApprovalAuthorizationError(params) {
	if (params.approvalId.startsWith("plugin:")) return params.pluginAuthorization.reason ?? "❌ You are not authorized to approve this request.";
	return params.execAuthorization.reason ?? params.pluginAuthorization.reason ?? "❌ You are not authorized to approve this request.";
}
const handleApproveCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	const parsed = parseApproveCommand(normalized);
	if (!parsed) return null;
	if (!parsed.ok) return {
		shouldContinue: false,
		reply: { text: parsed.error }
	};
	const isPluginId = parsed.id.startsWith("plugin:");
	const effectiveAccountId = resolveChannelAccountId({
		cfg: params.cfg,
		ctx: params.ctx,
		command: params.command
	});
	const approveCommandBehavior = resolveChannelApprovalCapability(getChannelPlugin(params.command.channel))?.resolveApproveCommandBehavior?.({
		cfg: params.cfg,
		accountId: effectiveAccountId,
		senderId: params.command.senderId,
		approvalKind: isPluginId ? "plugin" : "exec"
	});
	if (approveCommandBehavior?.kind === "ignore") return { shouldContinue: false };
	if (approveCommandBehavior?.kind === "reply") return {
		shouldContinue: false,
		reply: { text: approveCommandBehavior.text }
	};
	const execApprovalAuthorization = resolveApprovalCommandAuthorization({
		cfg: params.cfg,
		channel: params.command.channel,
		accountId: effectiveAccountId,
		senderId: params.command.senderId,
		kind: "exec"
	});
	const pluginApprovalAuthorization = resolveApprovalCommandAuthorization({
		cfg: params.cfg,
		channel: params.command.channel,
		accountId: effectiveAccountId,
		senderId: params.command.senderId,
		kind: "plugin"
	});
	const hasExplicitApprovalAuthorization = execApprovalAuthorization.explicit && execApprovalAuthorization.authorized || pluginApprovalAuthorization.explicit && pluginApprovalAuthorization.authorized;
	if (!params.command.isAuthorizedSender && !hasExplicitApprovalAuthorization) {
		logVerbose(`Ignoring /approve from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const missingScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/approve",
		allowedScopes: ["operator.approvals", "operator.admin"],
		missingText: "❌ /approve requires operator.approvals for gateway clients."
	});
	if (missingScope) return missingScope;
	const resolvedBy = buildResolvedByLabel(params);
	const callApprovalMethod = async (method) => {
		await callGateway({
			method,
			params: {
				id: parsed.id,
				decision: parsed.decision
			},
			clientName: GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
			clientDisplayName: `Chat approval (${resolvedBy})`,
			mode: GATEWAY_CLIENT_MODES.BACKEND
		});
	};
	const methods = resolveApprovalMethods({
		approvalId: parsed.id,
		execAuthorization: execApprovalAuthorization,
		pluginAuthorization: pluginApprovalAuthorization
	});
	if (methods.length === 0) return {
		shouldContinue: false,
		reply: { text: resolveApprovalAuthorizationError({
			approvalId: parsed.id,
			execAuthorization: execApprovalAuthorization,
			pluginAuthorization: pluginApprovalAuthorization
		}) }
	};
	let lastError = null;
	for (const [index, method] of methods.entries()) try {
		await callApprovalMethod(method);
		lastError = null;
		break;
	} catch (error) {
		lastError = error;
		const isLastMethod = index === methods.length - 1;
		if (!isApprovalNotFoundError(error) || isLastMethod) return {
			shouldContinue: false,
			reply: { text: `❌ Failed to submit approval: ${formatApprovalSubmitError(error)}` }
		};
	}
	if (lastError) return {
		shouldContinue: false,
		reply: { text: `❌ Failed to submit approval: ${formatApprovalSubmitError(lastError)}` }
	};
	return {
		shouldContinue: false,
		reply: { text: `✅ Approval ${parsed.decision} submitted for ${parsed.id}.` }
	};
};
//#endregion
//#region src/auto-reply/reply/bash-command.ts
const CHAT_BASH_SCOPE_KEY = "chat:bash";
const DEFAULT_FOREGROUND_MS = 2e3;
const MAX_FOREGROUND_MS = 3e4;
let activeJob = null;
function resolveForegroundMs(cfg) {
	const raw = cfg.commands?.bashForegroundMs;
	if (typeof raw !== "number" || Number.isNaN(raw)) return DEFAULT_FOREGROUND_MS;
	return clampInt(raw, 0, MAX_FOREGROUND_MS);
}
function formatSessionSnippet(sessionId) {
	const trimmed = sessionId.trim();
	if (trimmed.length <= 12) return trimmed;
	return `${trimmed.slice(0, 8)}…`;
}
function formatOutputBlock(text) {
	const trimmed = text.trim();
	if (!trimmed) return "(no output)";
	return `\`\`\`txt\n${trimmed}\n\`\`\``;
}
function parseBashRequest(raw) {
	const trimmed = raw.trimStart();
	let restSource = "";
	if (normalizeLowercaseStringOrEmpty(trimmed).startsWith("/bash")) {
		const match = trimmed.match(/^\/bash(?:\s*:\s*|\s+|$)([\s\S]*)$/i);
		if (!match) return null;
		restSource = match[1] ?? "";
	} else if (trimmed.startsWith("!")) {
		restSource = trimmed.slice(1);
		if (restSource.trimStart().startsWith(":")) restSource = restSource.trimStart().slice(1);
	} else return null;
	const rest = restSource.trimStart();
	if (!rest) return { action: "help" };
	const tokenMatch = rest.match(/^(\S+)(?:\s+([\s\S]+))?$/);
	const token = normalizeOptionalString(tokenMatch?.[1]) ?? "";
	const remainder = normalizeOptionalString(tokenMatch?.[2]) ?? "";
	const lowered = normalizeLowercaseStringOrEmpty(token);
	if (lowered === "poll") return {
		action: "poll",
		sessionId: remainder || void 0
	};
	if (lowered === "stop") return {
		action: "stop",
		sessionId: remainder || void 0
	};
	if (lowered === "help") return { action: "help" };
	return {
		action: "run",
		command: rest
	};
}
function resolveRawCommandBody(params) {
	const stripped = stripStructuralPrefixes(params.ctx.CommandBody ?? params.ctx.RawBody ?? params.ctx.Body ?? "");
	return params.isGroup ? stripMentions(stripped, params.ctx, params.cfg, params.agentId) : stripped;
}
function getScopedSession(sessionId) {
	const running = getSession(sessionId);
	if (running && running.scopeKey === CHAT_BASH_SCOPE_KEY) return { running };
	const finished = getFinishedSession(sessionId);
	if (finished && finished.scopeKey === CHAT_BASH_SCOPE_KEY) return { finished };
	return {};
}
function ensureActiveJobState() {
	if (!activeJob) return null;
	if (activeJob.state === "starting") return activeJob;
	const { running, finished } = getScopedSession(activeJob.sessionId);
	if (running) return activeJob;
	if (finished) {
		activeJob = null;
		return null;
	}
	activeJob = null;
	return null;
}
function attachActiveWatcher(sessionId) {
	if (!activeJob || activeJob.state !== "running") return;
	if (activeJob.sessionId !== sessionId) return;
	if (activeJob.watcherAttached) return;
	const { running } = getScopedSession(sessionId);
	const child = running?.child;
	if (!child) return;
	activeJob.watcherAttached = true;
	child.once("close", () => {
		if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
	});
}
function buildUsageReply() {
	return { text: [
		"⚙️ Usage:",
		"- ! <command>",
		"- !poll | ! poll",
		"- !stop | ! stop",
		"- /bash ... (alias; same subcommands as !)"
	].join("\n") };
}
async function handleBashChatCommand(params) {
	if (!isCommandFlagEnabled(params.cfg, "bash")) return buildDisabledCommandReply({
		label: "bash",
		configKey: "bash",
		docsUrl: "https://docs.openclaw.ai/tools/slash-commands#config"
	});
	const agentId = params.agentId ?? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	if (!params.elevated.enabled || !params.elevated.allowed) {
		const runtimeSandboxed = resolveSandboxRuntimeStatus({
			cfg: params.cfg,
			sessionKey: resolveRuntimePolicySessionKey({
				cfg: params.cfg,
				ctx: params.ctx,
				sessionKey: params.sessionKey
			})
		}).sandboxed;
		return { text: formatElevatedUnavailableMessage({
			runtimeSandboxed,
			failures: params.elevated.failures,
			sessionKey: params.sessionKey
		}) };
	}
	const request = parseBashRequest(resolveRawCommandBody({
		ctx: params.ctx,
		cfg: params.cfg,
		agentId,
		isGroup: params.isGroup
	}).trim());
	if (!request) return { text: "⚠️ Unrecognized bash request." };
	const liveJob = ensureActiveJobState();
	if (request.action === "help") return buildUsageReply();
	if (request.action === "poll") {
		const sessionId = normalizeOptionalString(request.sessionId) || (liveJob?.state === "running" ? liveJob.sessionId : "");
		if (!sessionId) return { text: "⚙️ No active bash job." };
		const { running, finished } = getScopedSession(sessionId);
		if (running) {
			attachActiveWatcher(sessionId);
			const runtimeSec = Math.max(0, Math.floor((Date.now() - running.startedAt) / 1e3));
			const tail = running.tail || "(no output yet)";
			return { text: [
				`⚙️ bash still running (session ${formatSessionSnippet(sessionId)}, ${runtimeSec}s).`,
				formatOutputBlock(tail),
				"Hint: !stop (or /bash stop)"
			].join("\n") };
		}
		if (finished) {
			if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
			const exitLabel = finished.exitSignal ? `signal ${String(finished.exitSignal)}` : `code ${String(finished.exitCode ?? 0)}`;
			return { text: [
				`${finished.status === "completed" ? "⚙️" : "⚠️"} bash finished (session ${formatSessionSnippet(sessionId)}).`,
				`Exit: ${exitLabel}`,
				formatOutputBlock(finished.aggregated || finished.tail)
			].join("\n") };
		}
		if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
		return { text: `⚙️ No bash session found for ${formatSessionSnippet(sessionId)}.` };
	}
	if (request.action === "stop") {
		const sessionId = normalizeOptionalString(request.sessionId) || (liveJob?.state === "running" ? liveJob.sessionId : "");
		if (!sessionId) return { text: "⚙️ No active bash job." };
		const { running } = getScopedSession(sessionId);
		if (!running) {
			if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
			return { text: `⚙️ No running bash job found for ${formatSessionSnippet(sessionId)}.` };
		}
		if (!running.backgrounded) return { text: `⚠️ Session ${formatSessionSnippet(sessionId)} is not backgrounded.` };
		const pid = running.pid ?? running.child?.pid;
		if (!pid) return { text: `⚠️ Unable to stop bash session ${formatSessionSnippet(sessionId)} because no process ID is available. Use !poll ${sessionId} to check whether it exits on its own.` };
		const { killProcessTree } = await import("./kill-tree-DlAtdwht.js");
		killProcessTree(pid);
		return { text: `⚙️ bash stopping (session ${formatSessionSnippet(sessionId)}). Use !poll ${sessionId} to confirm exit.` };
	}
	if (liveJob) return { text: `⚠️ A bash job is already running (${liveJob.state === "running" ? formatSessionSnippet(liveJob.sessionId) : "starting"}). Use !poll / !stop (or /bash poll / /bash stop).` };
	const commandText = request.command.trim();
	if (!commandText) return buildUsageReply();
	activeJob = {
		state: "starting",
		startedAt: Date.now(),
		command: commandText
	};
	try {
		const foregroundMs = resolveForegroundMs(params.cfg);
		const shouldBackgroundImmediately = foregroundMs <= 0;
		const timeoutSec = params.cfg.tools?.exec?.timeoutSec;
		const notifyOnExit = params.cfg.tools?.exec?.notifyOnExit;
		const notifyOnExitEmptySuccess = params.cfg.tools?.exec?.notifyOnExitEmptySuccess;
		const result = await createExecTool({
			scopeKey: CHAT_BASH_SCOPE_KEY,
			allowBackground: true,
			timeoutSec,
			sessionKey: params.sessionKey,
			notifyOnExit,
			notifyOnExitEmptySuccess,
			elevated: {
				enabled: params.elevated.enabled,
				allowed: params.elevated.allowed,
				defaultLevel: "on"
			}
		}).execute("chat-bash", {
			command: commandText,
			background: shouldBackgroundImmediately,
			yieldMs: shouldBackgroundImmediately ? void 0 : foregroundMs,
			timeout: timeoutSec,
			elevated: true
		});
		if (result.details?.status === "running") {
			const sessionId = result.details.sessionId;
			activeJob = {
				state: "running",
				sessionId,
				startedAt: result.details.startedAt,
				command: commandText,
				watcherAttached: false
			};
			attachActiveWatcher(sessionId);
			logVerbose(`Started bash session ${formatSessionSnippet(sessionId)}: ${commandText}`);
			return { text: `⚙️ bash started (session ${sessionId}). Still running; use !poll / !stop (or /bash poll / /bash stop).` };
		}
		activeJob = null;
		const exitCode = result.details?.status === "completed" ? result.details.exitCode : 0;
		const output = result.details?.status === "completed" ? result.details.aggregated : result.content.map((chunk) => chunk.type === "text" ? chunk.text : "").join("\n");
		return { text: [
			`⚙️ bash: ${commandText}`,
			`Exit: ${exitCode}`,
			formatOutputBlock(output || "(no output)")
		].join("\n") };
	} catch (err) {
		activeJob = null;
		const message = formatErrorMessage(err);
		return { text: [`⚠️ bash failed: ${commandText}`, formatOutputBlock(message)].join("\n") };
	}
}
//#endregion
//#region src/auto-reply/reply/commands-bash.ts
const handleBashCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const { command } = params;
	const bashSlashRequested = command.commandBodyNormalized === "/bash" || command.commandBodyNormalized.startsWith("/bash ");
	const bashBangRequested = command.commandBodyNormalized.startsWith("!");
	if (!bashSlashRequested && !(bashBangRequested && command.isAuthorizedSender)) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/bash");
	if (unauthorized) return unauthorized;
	const agentId = params.sessionKey ? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	}) : params.agentId;
	return {
		shouldContinue: false,
		reply: await handleBashChatCommand({
			ctx: params.ctx,
			cfg: params.cfg,
			agentId,
			sessionKey: params.sessionKey,
			isGroup: params.isGroup,
			elevated: params.elevated
		})
	};
};
//#endregion
//#region src/agents/btw.ts
function collectTextContent(content) {
	return content.filter((part) => part.type === "text").map((part) => part.text).join("");
}
function collectThinkingContent(content) {
	return content.filter((part) => part.type === "thinking").map((part) => part.thinking).join("");
}
function buildBtwSystemPrompt() {
	return [
		"You are answering an ephemeral /btw side question about the current conversation.",
		"Use the conversation only as background context.",
		"Answer only the side question in the last user message.",
		"Do not continue, resume, or complete any unfinished task from the conversation.",
		"Do not emit tool calls, pseudo-tool calls, shell commands, file writes, patches, or code unless the side question explicitly asks for them.",
		"Do not say you will continue the main task after answering.",
		"If the question can be answered briefly, answer briefly."
	].join("\n");
}
function buildBtwQuestionPrompt(question, inFlightPrompt) {
	const lines = ["Answer this side question only.", "Ignore any unfinished task in the conversation while answering it."];
	const trimmedPrompt = inFlightPrompt?.trim();
	if (trimmedPrompt) lines.push("", "Current in-flight main task request for background context only:", "<in_flight_main_task>", trimmedPrompt, "</in_flight_main_task>", "Do not continue or complete that task while answering the side question.");
	lines.push("", "<btw_side_question>", question.trim(), "</btw_side_question>");
	return lines.join("\n");
}
function normalizeBtwContentBlocks(content) {
	if (Array.isArray(content)) return content;
	if (content && typeof content === "object") return [content];
}
function isBtwTextBlock(block) {
	if (!block || typeof block !== "object") return false;
	const record = block;
	return normalizeLowercaseStringOrEmpty(record.type) === "text" && typeof record.text === "string";
}
function isBtwImageBlock(block) {
	if (!block || typeof block !== "object") return false;
	const record = block;
	return normalizeLowercaseStringOrEmpty(record.type) === "image" && typeof record.data === "string" && typeof record.mimeType === "string";
}
async function sanitizeBtwUserMessage(params) {
	if (typeof params.message.content === "string") return params.message;
	const blocks = normalizeBtwContentBlocks(params.message.content);
	if (!blocks) return;
	const content = [];
	for (const block of blocks) {
		if (isBtwTextBlock(block)) {
			content.push({
				type: "text",
				text: block.text
			});
			continue;
		}
		if (!isBtwImageBlock(block)) continue;
		const { images } = await sanitizeImageBlocks([block], "btw:context", params.imageLimits);
		const image = images[0];
		if (image) content.push(image);
	}
	if (content.length === 0) return;
	return {
		...params.message,
		content
	};
}
function sanitizeBtwAssistantMessage(message) {
	const rawContent = message.content;
	if (typeof rawContent === "string") {
		const trimmed = rawContent.trim();
		return trimmed.length > 0 ? {
			...message,
			content: [{
				type: "text",
				text: trimmed
			}]
		} : void 0;
	}
	const blocks = normalizeBtwContentBlocks(rawContent);
	if (!blocks) return;
	const content = blocks.flatMap((block) => isBtwTextBlock(block) ? [{
		type: "text",
		text: block.text
	}] : []);
	if (content.length === 0) return;
	return {
		...message,
		content
	};
}
async function toSimpleContextMessages(params) {
	const contextMessages = [];
	for (const message of params.messages) {
		if (!message || typeof message !== "object") continue;
		const role = message.role;
		if (role === "user") {
			const sanitizedMessage = await sanitizeBtwUserMessage({
				message,
				imageLimits: params.imageLimits
			});
			if (sanitizedMessage) contextMessages.push(sanitizedMessage);
			continue;
		}
		if (role !== "assistant") continue;
		const sanitizedMessage = sanitizeBtwAssistantMessage(message);
		if (sanitizedMessage) contextMessages.push(sanitizedMessage);
	}
	return stripToolResultDetails(contextMessages);
}
function resolveSessionTranscriptPath(params) {
	try {
		const agentId = params.sessionKey?.split(":")[1];
		const pathOpts = resolveSessionFilePathOptions({
			agentId,
			storePath: params.storePath
		});
		return resolveSessionFilePath(params.sessionId, params.sessionEntry, pathOpts);
	} catch (error) {
		diagnosticLogger.debug(`resolveSessionTranscriptPath failed: sessionId=${params.sessionId} err=${String(error)}`);
		return;
	}
}
async function resolveRuntimeModel(params) {
	await ensureOpenClawModelsJson(params.cfg, params.agentDir);
	const modelRegistry = discoverModels(discoverAuthStorage(params.agentDir), params.agentDir);
	const model = resolveModelWithRegistry({
		provider: params.provider,
		modelId: params.model,
		modelRegistry,
		cfg: params.cfg
	});
	if (!model) throw new Error(`Unknown model: ${params.provider}/${params.model}`);
	return {
		model,
		authProfileId: await resolveSessionAuthProfileOverride({
			cfg: params.cfg,
			provider: params.provider,
			agentDir: params.agentDir,
			sessionEntry: params.sessionEntry,
			sessionStore: params.sessionStore,
			sessionKey: params.sessionKey,
			storePath: params.storePath,
			isNewSession: params.isNewSession
		}),
		authProfileIdSource: params.sessionEntry?.authProfileOverrideSource
	};
}
async function runBtwSideQuestion(params) {
	const sessionId = params.sessionEntry.sessionId?.trim();
	if (!sessionId) throw new Error("No active session context.");
	const sessionFile = resolveSessionTranscriptPath({
		sessionId,
		sessionEntry: params.sessionEntry,
		sessionKey: params.sessionKey,
		storePath: params.storePath
	});
	if (!sessionFile) throw new Error("No active session transcript.");
	const sessionManager = SessionManager.open(sessionFile);
	const activeRunSnapshot = getActiveEmbeddedRunSnapshot(sessionId);
	const imageLimits = resolveImageSanitizationLimits(params.cfg);
	let messages = [];
	let inFlightPrompt;
	if (Array.isArray(activeRunSnapshot?.messages) && activeRunSnapshot.messages.length > 0) {
		messages = await toSimpleContextMessages({
			messages: activeRunSnapshot.messages,
			imageLimits
		});
		inFlightPrompt = activeRunSnapshot.inFlightPrompt;
	} else if (activeRunSnapshot) {
		inFlightPrompt = activeRunSnapshot.inFlightPrompt;
		if (activeRunSnapshot.transcriptLeafId && sessionManager.branch) try {
			sessionManager.branch(activeRunSnapshot.transcriptLeafId);
		} catch (error) {
			diagnosticLogger.debug(`btw snapshot leaf unavailable: sessionId=${sessionId} leaf=${activeRunSnapshot.transcriptLeafId} err=${String(error)}`);
			sessionManager.resetLeaf?.();
		}
		else sessionManager.resetLeaf?.();
	} else {
		const leafEntry = sessionManager.getLeafEntry?.();
		if (leafEntry?.type === "message" && leafEntry.message?.role === "user") if (leafEntry.parentId && sessionManager.branch) sessionManager.branch(leafEntry.parentId);
		else sessionManager.resetLeaf?.();
	}
	if (messages.length === 0) {
		const sessionContext = sessionManager.buildSessionContext();
		messages = await toSimpleContextMessages({
			messages: Array.isArray(sessionContext.messages) ? sessionContext.messages : [],
			imageLimits
		});
	}
	if (messages.length === 0 && !inFlightPrompt?.trim()) throw new Error("No active session context.");
	const { model, authProfileId } = await resolveRuntimeModel({
		cfg: params.cfg,
		provider: params.provider,
		model: params.model,
		agentDir: params.agentDir,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore,
		sessionKey: params.sessionKey,
		storePath: params.storePath,
		isNewSession: params.isNewSession
	});
	const apiKeyInfo = await getApiKeyForModel({
		model,
		cfg: params.cfg,
		profileId: authProfileId,
		agentDir: params.agentDir
	});
	let runtimeModel = model;
	let apiKey = apiKeyInfo.mode === "aws-sdk" && !apiKeyInfo.apiKey ? void 0 : requireApiKey(apiKeyInfo, model.provider);
	const sessionAgentId = resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, sessionAgentId);
	if (apiKey) {
		const preparedAuth = await prepareProviderRuntimeAuth({
			provider: model.provider,
			config: params.cfg,
			workspaceDir,
			env: process.env,
			context: {
				config: params.cfg,
				agentDir: params.agentDir,
				workspaceDir,
				env: process.env,
				provider: model.provider,
				modelId: model.id,
				model,
				apiKey,
				authMode: apiKeyInfo.mode,
				profileId: authProfileId
			}
		});
		if (preparedAuth?.baseUrl) runtimeModel = {
			...runtimeModel,
			baseUrl: preparedAuth.baseUrl
		};
		if (preparedAuth?.apiKey) apiKey = preparedAuth.apiKey;
	}
	const providerStreamFn = registerProviderStreamForModel({
		model: runtimeModel,
		cfg: params.cfg,
		agentDir: params.agentDir,
		workspaceDir,
		env: process.env
	});
	const chunker = params.opts?.onBlockReply && params.blockReplyChunking ? new EmbeddedBlockChunker(params.blockReplyChunking) : void 0;
	let emittedBlocks = 0;
	let blockEmitChain = Promise.resolve();
	let answerText = "";
	let reasoningText = "";
	let assistantStarted = false;
	let sawTextEvent = false;
	const emitBlockChunk = async (text) => {
		if (!text.trim() || !params.opts?.onBlockReply) return;
		emittedBlocks += 1;
		blockEmitChain = blockEmitChain.then(async () => {
			await params.opts?.onBlockReply?.({
				text,
				btw: { question: params.question }
			});
		});
		await blockEmitChain;
	};
	const stream = await streamWithPayloadPatch(providerStreamFn ?? streamSimple, runtimeModel, {
		systemPrompt: buildBtwSystemPrompt(),
		messages: [...messages, {
			role: "user",
			content: [{
				type: "text",
				text: buildBtwQuestionPrompt(params.question, inFlightPrompt)
			}],
			timestamp: Date.now()
		}]
	}, {
		apiKey,
		reasoning: void 0,
		signal: params.opts?.abortSignal
	}, (payloadObj) => {
		if (Array.isArray(payloadObj.tools) && payloadObj.tools.length === 0) delete payloadObj.tools;
	});
	let finalEvent;
	for await (const event of stream) {
		finalEvent = event.type === "done" || event.type === "error" ? event : finalEvent;
		if (!assistantStarted && (event.type === "text_start" || event.type === "start")) {
			assistantStarted = true;
			await params.opts?.onAssistantMessageStart?.();
		}
		if (event.type === "text_delta") {
			sawTextEvent = true;
			answerText += event.delta;
			chunker?.append(event.delta);
			if (chunker && params.resolvedBlockStreamingBreak === "text_end") chunker.drain({
				force: false,
				emit: (chunk) => void emitBlockChunk(chunk)
			});
			continue;
		}
		if (event.type === "text_end" && chunker && params.resolvedBlockStreamingBreak === "text_end") {
			chunker.drain({
				force: true,
				emit: (chunk) => void emitBlockChunk(chunk)
			});
			continue;
		}
		if (event.type === "thinking_delta") {
			reasoningText += event.delta;
			if (params.resolvedReasoningLevel !== "off") await params.opts?.onReasoningStream?.({
				text: reasoningText,
				isReasoning: true
			});
			continue;
		}
		if (event.type === "thinking_end" && params.resolvedReasoningLevel !== "off") await params.opts?.onReasoningEnd?.();
	}
	if (chunker && params.resolvedBlockStreamingBreak !== "text_end" && chunker.hasBuffered()) chunker.drain({
		force: true,
		emit: (chunk) => void emitBlockChunk(chunk)
	});
	await blockEmitChain;
	if (finalEvent?.type === "error") {
		const message = collectTextContent(finalEvent.error.content);
		throw new Error(message || finalEvent.error.errorMessage || "BTW failed.");
	}
	const finalMessage = finalEvent?.type === "done" ? finalEvent.message : void 0;
	if (finalMessage) {
		if (!sawTextEvent) answerText = collectTextContent(finalMessage.content);
		if (!reasoningText) reasoningText = collectThinkingContent(finalMessage.content);
	}
	const answer = answerText.trim();
	if (!answer) throw new Error("No BTW response generated.");
	if (emittedBlocks > 0) return;
	return { text: answer };
}
//#endregion
//#region src/auto-reply/reply/commands-btw.ts
const BTW_USAGE = "Usage: /btw <side question>";
const handleBtwCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const question = extractBtwQuestion(params.command.commandBodyNormalized);
	if (question === null) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/btw");
	if (unauthorized) return unauthorized;
	if (!question) return {
		shouldContinue: false,
		reply: { text: BTW_USAGE }
	};
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	if (!targetSessionEntry?.sessionId) return {
		shouldContinue: false,
		reply: { text: "⚠️ /btw requires an active session with existing context." }
	};
	const sessionAgentId = params.sessionKey ? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	}) : params.agentId;
	const agentDir = (sessionAgentId ? resolveAgentDir(params.cfg, sessionAgentId) : void 0) ?? params.agentDir;
	if (!agentDir) return {
		shouldContinue: false,
		reply: { text: "⚠️ /btw is unavailable because the active agent directory could not be resolved." }
	};
	try {
		await params.typing?.startTypingLoop();
		const reply = await runBtwSideQuestion({
			cfg: params.cfg,
			agentDir,
			provider: params.provider,
			model: params.model,
			question,
			sessionEntry: targetSessionEntry,
			sessionStore: params.sessionStore,
			sessionKey: params.sessionKey,
			storePath: params.storePath,
			resolvedThinkLevel: "off",
			resolvedReasoningLevel: "off",
			blockReplyChunking: params.blockReplyChunking,
			resolvedBlockStreamingBreak: params.resolvedBlockStreamingBreak,
			opts: params.opts,
			isNewSession: false
		});
		return {
			shouldContinue: false,
			reply: reply ? {
				...reply,
				btw: { question }
			} : reply
		};
	} catch (error) {
		const message = error instanceof Error ? error.message.trim() : "";
		return {
			shouldContinue: false,
			reply: {
				text: `⚠️ /btw failed${message ? `: ${message}` : "."}`,
				btw: { question },
				isError: true
			}
		};
	}
};
//#endregion
//#region src/auto-reply/reply/commands-compact.ts
let compactRuntimePromise = null;
function loadCompactRuntime() {
	compactRuntimePromise ??= import("./commands-compact.runtime-B_mQSRgk.js");
	return compactRuntimePromise;
}
function extractCompactInstructions(params) {
	const raw = stripStructuralPrefixes(params.rawBody ?? "");
	const trimmed = (params.isGroup ? stripMentions(raw, params.ctx, params.cfg, params.agentId) : raw).trim();
	if (!trimmed) return;
	const prefix = normalizeLowercaseStringOrEmpty(trimmed).startsWith("/compact") ? "/compact" : null;
	if (!prefix) return;
	let rest = trimmed.slice(prefix.length).trimStart();
	if (rest.startsWith(":")) rest = rest.slice(1).trimStart();
	return rest.length ? rest : void 0;
}
function isCompactionSkipReason(reason) {
	const text = normalizeOptionalLowercaseString(reason) ?? "";
	return text.includes("nothing to compact") || text.includes("below threshold") || text.includes("already compacted") || text.includes("no real conversation messages");
}
function formatCompactionReason(reason) {
	const text = normalizeOptionalString(reason);
	if (!text) return;
	const lower = normalizeLowercaseStringOrEmpty(text);
	if (lower.includes("nothing to compact")) return "nothing compactable in this session yet";
	if (lower.includes("below threshold")) return "context is below the compaction threshold";
	if (lower.includes("already compacted")) return "session was already compacted recently";
	if (lower.includes("no real conversation messages")) return "no real conversation messages yet";
	return text;
}
const handleCompactCommand = async (params) => {
	if (!(params.command.commandBodyNormalized === "/compact" || params.command.commandBodyNormalized.startsWith("/compact "))) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /compact from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	if (!targetSessionEntry?.sessionId) return {
		shouldContinue: false,
		reply: { text: "⚙️ Compaction unavailable (missing session id)." }
	};
	const runtime = await loadCompactRuntime();
	const sessionId = targetSessionEntry.sessionId;
	if (runtime.isEmbeddedPiRunActive(sessionId)) {
		runtime.abortEmbeddedPiRun(sessionId);
		await runtime.waitForEmbeddedPiRunEnd(sessionId, 15e3);
	}
	const sessionAgentId = params.sessionKey ? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	}) : params.agentId ?? "main";
	const sessionAgentDir = sessionAgentId === (params.agentId ?? "main") && params.agentDir ? params.agentDir : resolveAgentDir(params.cfg, sessionAgentId);
	const customInstructions = extractCompactInstructions({
		rawBody: params.ctx.CommandBody ?? params.ctx.RawBody ?? params.ctx.Body,
		ctx: params.ctx,
		cfg: params.cfg,
		agentId: sessionAgentId,
		isGroup: params.isGroup
	});
	const result = await runtime.compactEmbeddedPiSession({
		sessionId,
		sessionKey: params.sessionKey,
		allowGatewaySubagentBinding: true,
		messageChannel: params.command.channel,
		groupId: targetSessionEntry.groupId,
		groupChannel: targetSessionEntry.groupChannel,
		groupSpace: targetSessionEntry.space,
		spawnedBy: targetSessionEntry.spawnedBy,
		senderId: params.command.senderId,
		senderName: params.ctx.SenderName,
		senderUsername: params.ctx.SenderUsername,
		senderE164: params.ctx.SenderE164,
		sessionFile: runtime.resolveSessionFilePath(sessionId, targetSessionEntry, runtime.resolveSessionFilePathOptions({
			agentId: sessionAgentId,
			storePath: params.storePath
		})),
		workspaceDir: params.workspaceDir,
		agentDir: sessionAgentDir,
		config: params.cfg,
		skillsSnapshot: targetSessionEntry.skillsSnapshot,
		provider: params.provider,
		model: params.model,
		agentHarnessId: targetSessionEntry.sessionId === sessionId ? targetSessionEntry.agentHarnessId : void 0,
		thinkLevel: params.resolvedThinkLevel ?? await params.resolveDefaultThinkingLevel(),
		bashElevated: {
			enabled: false,
			allowed: false,
			defaultLevel: "off"
		},
		customInstructions,
		trigger: "manual",
		senderIsOwner: params.command.senderIsOwner,
		ownerNumbers: params.command.ownerList.length > 0 ? params.command.ownerList : void 0
	});
	const compactLabel = result.ok || isCompactionSkipReason(result.reason) ? result.compacted ? result.result?.tokensBefore != null && result.result?.tokensAfter != null ? `Compacted (${runtime.formatTokenCount(result.result.tokensBefore)} → ${runtime.formatTokenCount(result.result.tokensAfter)})` : result.result?.tokensBefore ? `Compacted (${runtime.formatTokenCount(result.result.tokensBefore)} before)` : "Compacted" : "Compaction skipped" : "Compaction failed";
	if (result.ok && result.compacted) await runtime.incrementCompactionCount({
		cfg: params.cfg,
		sessionEntry: targetSessionEntry,
		sessionStore: params.sessionStore,
		sessionKey: params.sessionKey,
		storePath: params.storePath,
		tokensAfter: result.result?.tokensAfter,
		newSessionId: result.result?.sessionId,
		newSessionFile: result.result?.sessionFile
	});
	const totalTokens = result.result?.tokensAfter ?? runtime.resolveFreshSessionTotalTokens(targetSessionEntry);
	const contextSummary = runtime.formatContextUsageShort(typeof totalTokens === "number" && totalTokens > 0 ? totalTokens : null, params.contextTokens ?? targetSessionEntry.contextTokens ?? null);
	const reason = formatCompactionReason(result.reason);
	const line = reason ? `${compactLabel}: ${reason} • ${contextSummary}` : `${compactLabel} • ${contextSummary}`;
	runtime.enqueueSystemEvent(line, { sessionKey: params.sessionKey });
	return {
		shouldContinue: false,
		reply: { text: `⚙️ ${line}` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-slash-parse.ts
function parseSlashCommandActionArgs(raw, slash) {
	const trimmed = raw.trim();
	const slashLower = normalizeLowercaseStringOrEmpty(slash);
	if (!normalizeLowercaseStringOrEmpty(trimmed).startsWith(slashLower)) return { kind: "no-match" };
	const rest = trimmed.slice(slash.length).trim();
	if (!rest) return { kind: "empty" };
	const match = rest.match(/^(\S+)(?:\s+([\s\S]+))?$/);
	if (!match) return { kind: "invalid" };
	return {
		kind: "parsed",
		action: normalizeLowercaseStringOrEmpty(match[1]),
		args: (match[2] ?? "").trim()
	};
}
function parseSlashCommandOrNull(raw, slash, opts) {
	const parsed = parseSlashCommandActionArgs(raw, slash);
	if (parsed.kind === "no-match") return null;
	if (parsed.kind === "invalid") return {
		ok: false,
		message: opts.invalidMessage
	};
	if (parsed.kind === "empty") return {
		ok: true,
		action: opts.defaultAction ?? "show",
		args: ""
	};
	return {
		ok: true,
		action: parsed.action,
		args: parsed.args
	};
}
//#endregion
//#region src/auto-reply/reply/commands-setunset.ts
function parseSetUnsetCommand(params) {
	const action = params.action;
	const args = params.args.trim();
	if (action === "unset") {
		if (!args) return {
			kind: "error",
			message: `Usage: ${params.slash} unset path`
		};
		return {
			kind: "unset",
			path: args
		};
	}
	if (!args) return {
		kind: "error",
		message: `Usage: ${params.slash} set path=value`
	};
	const eqIndex = args.indexOf("=");
	if (eqIndex <= 0) return {
		kind: "error",
		message: `Usage: ${params.slash} set path=value`
	};
	const path = args.slice(0, eqIndex).trim();
	const rawValue = args.slice(eqIndex + 1);
	if (!path) return {
		kind: "error",
		message: `Usage: ${params.slash} set path=value`
	};
	const parsed = parseConfigValue(rawValue);
	if (parsed.error) return {
		kind: "error",
		message: parsed.error
	};
	return {
		kind: "set",
		path,
		value: parsed.value
	};
}
function parseSetUnsetCommandAction(params) {
	if (params.action !== "set" && params.action !== "unset") return null;
	const parsed = parseSetUnsetCommand({
		slash: params.slash,
		action: params.action,
		args: params.args
	});
	if (parsed.kind === "error") return params.onError(parsed.message);
	return parsed.kind === "set" ? params.onSet(parsed.path, parsed.value) : params.onUnset(parsed.path);
}
function parseSlashCommandWithSetUnset(params) {
	const parsed = parseSlashCommandOrNull(params.raw, params.slash, { invalidMessage: params.invalidMessage });
	if (!parsed) return null;
	if (!parsed.ok) return params.onError(parsed.message);
	const { action, args } = parsed;
	const setUnset = parseSetUnsetCommandAction({
		slash: params.slash,
		action,
		args,
		onSet: params.onSet,
		onUnset: params.onUnset,
		onError: params.onError
	});
	if (setUnset) return setUnset;
	const knownAction = params.onKnownAction(action, args);
	if (knownAction) return knownAction;
	return params.onError(params.usageMessage);
}
//#endregion
//#region src/auto-reply/reply/commands-setunset-standard.ts
function parseStandardSetUnsetSlashCommand(params) {
	return parseSlashCommandWithSetUnset({
		raw: params.raw,
		slash: params.slash,
		invalidMessage: params.invalidMessage,
		usageMessage: params.usageMessage,
		onKnownAction: params.onKnownAction,
		onSet: params.onSet ?? ((path, value) => ({
			action: "set",
			path,
			value
		})),
		onUnset: params.onUnset ?? ((path) => ({
			action: "unset",
			path
		})),
		onError: params.onError ?? ((message) => ({
			action: "error",
			message
		}))
	});
}
//#endregion
//#region src/auto-reply/reply/config-commands.ts
function parseConfigCommand(raw) {
	return parseStandardSetUnsetSlashCommand({
		raw,
		slash: "/config",
		invalidMessage: "Invalid /config syntax.",
		usageMessage: "Usage: /config show|set|unset",
		onKnownAction: (action, args) => {
			if (action === "show" || action === "get") return {
				action: "show",
				path: args || void 0
			};
		}
	});
}
//#endregion
//#region src/auto-reply/reply/debug-commands.ts
function parseDebugCommand(raw) {
	return parseStandardSetUnsetSlashCommand({
		raw,
		slash: "/debug",
		invalidMessage: "Invalid /debug syntax.",
		usageMessage: "Usage: /debug show|set|unset|reset",
		onKnownAction: (action) => {
			if (action === "show") return { action: "show" };
			if (action === "reset") return { action: "reset" };
		}
	});
}
//#endregion
//#region src/auto-reply/reply/commands-config.ts
const handleConfigCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const configCommand = parseConfigCommand(params.command.commandBodyNormalized);
	if (!configCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/config");
	if (unauthorized) return unauthorized;
	const nonOwner = configCommand.action === "show" && isInternalMessageChannel(params.command.channel) ? null : rejectNonOwnerCommand(params, "/config");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/config",
		configKey: "config"
	});
	if (disabled) return disabled;
	if (configCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${configCommand.message}` }
	};
	let parsedWritePath;
	if (configCommand.action === "set" || configCommand.action === "unset") {
		const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
			label: "/config write",
			allowedScopes: ["operator.admin"],
			missingText: "❌ /config set|unset requires operator.admin for gateway clients."
		});
		if (missingAdminScope) return missingAdminScope;
		const parsedPath = parseConfigPath(configCommand.path);
		if (!parsedPath.ok || !parsedPath.path) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${parsedPath.error ?? "Invalid path."}` }
		};
		parsedWritePath = parsedPath.path;
		const channelId = params.command.channelId ?? normalizeChannelId(params.command.channel);
		const deniedText = resolveConfigWriteDeniedText({
			cfg: params.cfg,
			channel: params.command.channel,
			channelId,
			accountId: resolveChannelAccountId({
				cfg: params.cfg,
				ctx: params.ctx,
				command: params.command
			}),
			gatewayClientScopes: params.ctx.GatewayClientScopes,
			target: resolveConfigWriteTargetFromPath(parsedWritePath)
		});
		if (deniedText) return {
			shouldContinue: false,
			reply: { text: deniedText }
		};
	}
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid || !snapshot.parsed || typeof snapshot.parsed !== "object") return {
		shouldContinue: false,
		reply: { text: "⚠️ Config file is invalid; fix it before using /config." }
	};
	const parsedBase = structuredClone(snapshot.parsed);
	if (configCommand.action === "show") {
		const pathRaw = normalizeOptionalString(configCommand.path);
		if (pathRaw) {
			const parsedPath = parseConfigPath(pathRaw);
			if (!parsedPath.ok || !parsedPath.path) return {
				shouldContinue: false,
				reply: { text: `⚠️ ${parsedPath.error ?? "Invalid path."}` }
			};
			const value = getConfigValueAtPath(parsedBase, parsedPath.path);
			return {
				shouldContinue: false,
				reply: { text: `⚙️ Config ${pathRaw}:\n\`\`\`json\n${JSON.stringify(value ?? null, null, 2)}\n\`\`\`` }
			};
		}
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Config (raw):\n\`\`\`json\n${JSON.stringify(parsedBase, null, 2)}\n\`\`\`` }
		};
	}
	if (configCommand.action === "unset") {
		if (!unsetConfigValueAtPath(parsedBase, parsedWritePath ?? [])) return {
			shouldContinue: false,
			reply: { text: `⚙️ No config value found for ${configCommand.path}.` }
		};
		const validated = validateConfigObjectWithPlugins(parsedBase);
		if (!validated.ok) {
			const issue = validated.issues[0];
			return {
				shouldContinue: false,
				reply: { text: `⚠️ Config invalid after unset (${issue.path}: ${issue.message}).` }
			};
		}
		await replaceConfigFile({
			nextConfig: validated.config,
			afterWrite: { mode: "auto" }
		});
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Config updated: ${configCommand.path} removed.` }
		};
	}
	if (configCommand.action === "set") {
		setConfigValueAtPath(parsedBase, parsedWritePath ?? [], configCommand.value);
		const validated = validateConfigObjectWithPlugins(parsedBase);
		if (!validated.ok) {
			const issue = validated.issues[0];
			return {
				shouldContinue: false,
				reply: { text: `⚠️ Config invalid after set (${issue.path}: ${issue.message}).` }
			};
		}
		await replaceConfigFile({
			nextConfig: validated.config,
			afterWrite: { mode: "auto" }
		});
		const valueLabel = typeof configCommand.value === "string" ? `"${configCommand.value}"` : JSON.stringify(configCommand.value);
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Config updated: ${configCommand.path}=${valueLabel ?? "null"}` }
		};
	}
	return null;
};
const handleDebugCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const debugCommand = parseDebugCommand(params.command.commandBodyNormalized);
	if (!debugCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/debug");
	if (unauthorized) return unauthorized;
	const nonOwner = rejectNonOwnerCommand(params, "/debug");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/debug",
		configKey: "debug"
	});
	if (disabled) return disabled;
	if (debugCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${debugCommand.message}` }
	};
	if (debugCommand.action === "show") {
		const overrides = getConfigOverrides();
		if (!(Object.keys(overrides).length > 0)) return {
			shouldContinue: false,
			reply: { text: "⚙️ Debug overrides: (none)" }
		};
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Debug overrides (memory-only):\n\`\`\`json\n${JSON.stringify(overrides, null, 2)}\n\`\`\`` }
		};
	}
	if (debugCommand.action === "reset") {
		resetConfigOverrides();
		return {
			shouldContinue: false,
			reply: { text: "⚙️ Debug overrides cleared; using config on disk." }
		};
	}
	if (debugCommand.action === "unset") {
		const result = unsetConfigOverride(debugCommand.path);
		if (!result.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${result.error ?? "Invalid path."}` }
		};
		if (!result.removed) return {
			shouldContinue: false,
			reply: { text: `⚙️ No debug override found for ${debugCommand.path}.` }
		};
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Debug override removed for ${debugCommand.path}.` }
		};
	}
	if (debugCommand.action === "set") {
		const result = setConfigOverride(debugCommand.path, debugCommand.value);
		if (!result.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${result.error ?? "Invalid override."}` }
		};
		const valueLabel = typeof debugCommand.value === "string" ? `"${debugCommand.value}"` : JSON.stringify(debugCommand.value);
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Debug override set: ${debugCommand.path}=${valueLabel ?? "null"}` }
		};
	}
	return null;
};
//#endregion
//#region src/auto-reply/reply/commands-context-report.ts
function formatInt(n) {
	return new Intl.NumberFormat("en-US").format(n);
}
function formatCharsAndTokens(chars) {
	return `${formatInt(chars)} chars (~${formatInt(estimateTokensFromChars(chars))} tok)`;
}
function parseContextArgs(commandBodyNormalized) {
	if (commandBodyNormalized === "/context") return "";
	if (commandBodyNormalized.startsWith("/context ")) return commandBodyNormalized.slice(8).trim();
	return "";
}
function formatListTop(entries, cap) {
	const sorted = [...entries].toSorted((a, b) => b.value - a.value);
	const top = sorted.slice(0, cap);
	const omitted = Math.max(0, sorted.length - top.length);
	return {
		lines: top.map((e) => `- ${e.name}: ${formatCharsAndTokens(e.value)}`),
		omitted
	};
}
async function resolveContextReport(params) {
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	const existing = targetSessionEntry?.systemPromptReport;
	if (existing && existing.source === "run") return existing;
	const bootstrapMaxChars = resolveBootstrapMaxChars(params.cfg);
	const bootstrapTotalMaxChars = resolveBootstrapTotalMaxChars(params.cfg);
	const { resolveCommandsSystemPromptBundle } = await import("./commands-system-prompt-6S_PzuTa.js");
	const { systemPrompt, tools, skillsPrompt, bootstrapFiles, injectedFiles, sandboxRuntime } = await resolveCommandsSystemPromptBundle(params);
	return buildSystemPromptReport({
		source: "estimate",
		generatedAt: Date.now(),
		sessionId: targetSessionEntry?.sessionId,
		sessionKey: params.sessionKey,
		provider: params.provider,
		model: params.model,
		workspaceDir: params.workspaceDir,
		bootstrapMaxChars,
		bootstrapTotalMaxChars,
		sandbox: {
			mode: sandboxRuntime.mode,
			sandboxed: sandboxRuntime.sandboxed
		},
		systemPrompt,
		bootstrapFiles,
		injectedFiles,
		skillsPrompt,
		tools
	});
}
async function buildContextReply(params) {
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	const sub = normalizeLowercaseStringOrEmpty(parseContextArgs(params.command.commandBodyNormalized).split(/\s+/).find(Boolean));
	if (!sub || sub === "help") return { text: [
		"🧠 /context",
		"",
		"What counts as context (high-level), plus a breakdown mode.",
		"",
		"Try:",
		"- /context list   (short breakdown)",
		"- /context detail (per-file + per-tool + per-skill + system prompt size)",
		"- /context json   (same, machine-readable)",
		"",
		"Inline shortcut = a command token inside a normal message (e.g. “hey /status”). It runs immediately (allowlisted senders only) and is stripped before the model sees the remaining text."
	].join("\n") };
	const report = await resolveContextReport(params);
	const cachedContextUsageTokens = resolveFreshSessionTotalTokens(targetSessionEntry);
	const session = {
		totalTokens: targetSessionEntry?.totalTokens ?? null,
		totalTokensFresh: targetSessionEntry?.totalTokensFresh ?? null,
		inputTokens: targetSessionEntry?.inputTokens ?? null,
		outputTokens: targetSessionEntry?.outputTokens ?? null,
		contextTokens: params.contextTokens ?? null
	};
	if (sub === "json") return { text: JSON.stringify({
		report,
		session
	}, null, 2) };
	if (sub !== "list" && sub !== "show" && sub !== "detail" && sub !== "deep") return { text: ["Unknown /context mode.", "Use: /context, /context list, /context detail, or /context json"].join("\n") };
	const fileLines = report.injectedWorkspaceFiles.map((f) => {
		const status = f.missing ? "MISSING" : f.truncated ? "TRUNCATED" : "OK";
		const raw = f.missing ? "0" : formatCharsAndTokens(f.rawChars);
		const injected = f.missing ? "0" : formatCharsAndTokens(f.injectedChars);
		return `- ${f.name}: ${status} | raw ${raw} | injected ${injected}`;
	});
	const sandboxLine = `Sandbox: mode=${report.sandbox?.mode ?? "unknown"} sandboxed=${report.sandbox?.sandboxed ?? false}`;
	const toolSchemaLine = `Tool schemas (JSON): ${formatCharsAndTokens(report.tools.schemaChars)} (counts toward context; not shown as text)`;
	const toolListLine = `Tool list (system prompt text): ${formatCharsAndTokens(report.tools.listChars)}`;
	const skillNameSet = new Set(report.skills.entries.map((s) => s.name));
	const skillNames = Array.from(skillNameSet);
	const toolNames = report.tools.entries.map((t) => t.name);
	const formatNameList = (names, cap) => names.length <= cap ? names.join(", ") : `${names.slice(0, cap).join(", ")}, … (+${names.length - cap} more)`;
	const skillsLine = `Skills list (system prompt text): ${formatCharsAndTokens(report.skills.promptChars)} (${skillNameSet.size} skills)`;
	const skillsNamesLine = skillNameSet.size ? `Skills: ${formatNameList(skillNames, 20)}` : "Skills: (none)";
	const toolsNamesLine = toolNames.length ? `Tools: ${formatNameList(toolNames, 30)}` : "Tools: (none)";
	const systemPromptLine = `System prompt (${report.source}): ${formatCharsAndTokens(report.systemPrompt.chars)} (Project Context ${formatCharsAndTokens(report.systemPrompt.projectContextChars)})`;
	const workspaceLabel = report.workspaceDir ?? params.workspaceDir;
	const bootstrapMaxChars = typeof report.bootstrapMaxChars === "number" && Number.isFinite(report.bootstrapMaxChars) && report.bootstrapMaxChars > 0 ? report.bootstrapMaxChars : resolveBootstrapMaxChars(params.cfg);
	const bootstrapTotalMaxChars = typeof report.bootstrapTotalMaxChars === "number" && Number.isFinite(report.bootstrapTotalMaxChars) && report.bootstrapTotalMaxChars > 0 ? report.bootstrapTotalMaxChars : resolveBootstrapTotalMaxChars(params.cfg);
	const bootstrapMaxLabel = `${formatInt(bootstrapMaxChars)} chars`;
	const bootstrapTotalLabel = `${formatInt(bootstrapTotalMaxChars)} chars`;
	const bootstrapAnalysis = analyzeBootstrapBudget({
		files: report.injectedWorkspaceFiles,
		bootstrapMaxChars,
		bootstrapTotalMaxChars
	});
	const truncatedBootstrapFiles = bootstrapAnalysis.truncatedFiles;
	const truncationCauseCounts = truncatedBootstrapFiles.reduce((acc, file) => {
		for (const cause of file.causes) if (cause === "per-file-limit") acc.perFile += 1;
		else if (cause === "total-limit") acc.total += 1;
		return acc;
	}, {
		perFile: 0,
		total: 0
	});
	const truncationCauseParts = [truncationCauseCounts.perFile > 0 ? `${truncationCauseCounts.perFile} file(s) exceeded max/file` : null, truncationCauseCounts.total > 0 ? `${truncationCauseCounts.total} file(s) hit max/total` : null].filter(Boolean);
	const bootstrapWarningLines = truncatedBootstrapFiles.length > 0 ? [
		`⚠ Bootstrap context is over configured limits: ${truncatedBootstrapFiles.length} file(s) truncated (${formatInt(bootstrapAnalysis.totals.rawChars)} raw chars -> ${formatInt(bootstrapAnalysis.totals.injectedChars)} injected chars).`,
		...truncationCauseParts.length ? [`Causes: ${truncationCauseParts.join("; ")}.`] : [],
		"Tip: increase `agents.defaults.bootstrapMaxChars` and/or `agents.defaults.bootstrapTotalMaxChars` if this truncation is not intentional."
	] : [];
	const contextWindowLabel = session.contextTokens != null ? formatInt(session.contextTokens) : "?";
	const totalsLine = cachedContextUsageTokens != null ? `Session tokens (cached): ${formatInt(cachedContextUsageTokens)} total / ctx=${contextWindowLabel}` : `Session tokens (cached): unknown / ctx=${contextWindowLabel}`;
	const sharedContextLines = [
		`Workspace: ${workspaceLabel}`,
		`Bootstrap max/file: ${bootstrapMaxLabel}`,
		`Bootstrap max/total: ${bootstrapTotalLabel}`,
		sandboxLine,
		systemPromptLine,
		...bootstrapWarningLines.length ? ["", ...bootstrapWarningLines] : [],
		"",
		"Injected workspace files:",
		...fileLines,
		"",
		skillsLine,
		skillsNamesLine
	];
	if (sub === "detail" || sub === "deep") {
		const perSkill = formatListTop(report.skills.entries.map((s) => ({
			name: s.name,
			value: s.blockChars
		})), 30);
		const perToolSchema = formatListTop(report.tools.entries.map((t) => ({
			name: t.name,
			value: t.schemaChars
		})), 30);
		const perToolSummary = formatListTop(report.tools.entries.map((t) => ({
			name: t.name,
			value: t.summaryChars
		})), 30);
		const toolPropsLines = report.tools.entries.filter((t) => t.propertiesCount != null).toSorted((a, b) => (b.propertiesCount ?? 0) - (a.propertiesCount ?? 0)).slice(0, 30).map((t) => `- ${t.name}: ${t.propertiesCount} params`);
		const trackedPromptChars = report.systemPrompt.chars + report.tools.schemaChars;
		const trackedPromptLine = `Tracked prompt estimate: ${formatCharsAndTokens(trackedPromptChars)}`;
		const actualContextLine = cachedContextUsageTokens != null ? `Actual context usage (cached): ${formatInt(cachedContextUsageTokens)} tok` : "Actual context usage (cached): unavailable";
		const overheadTokens = cachedContextUsageTokens != null ? cachedContextUsageTokens - estimateTokensFromChars(trackedPromptChars) : null;
		const overheadLine = overheadTokens == null ? null : overheadTokens > 0 ? `Untracked provider/runtime overhead: ~${formatInt(overheadTokens)} tok` : "Untracked provider/runtime overhead: not observed in cached usage";
		return { text: [
			"🧠 Context breakdown (detailed)",
			...sharedContextLines,
			...perSkill.lines.length ? ["Top skills (prompt entry size):", ...perSkill.lines] : [],
			...perSkill.omitted ? [`… (+${perSkill.omitted} more skills)`] : [],
			"",
			toolListLine,
			toolSchemaLine,
			toolsNamesLine,
			"Top tools (schema size):",
			...perToolSchema.lines,
			...perToolSchema.omitted ? [`… (+${perToolSchema.omitted} more tools)`] : [],
			"",
			"Top tools (summary text size):",
			...perToolSummary.lines,
			...perToolSummary.omitted ? [`… (+${perToolSummary.omitted} more tools)`] : [],
			...toolPropsLines.length ? [
				"",
				"Tools (param count):",
				...toolPropsLines
			] : [],
			"",
			trackedPromptLine,
			actualContextLine,
			...overheadLine ? [overheadLine] : [],
			"",
			totalsLine,
			"",
			"Inline shortcut: a command token inside normal text (e.g. “hey /status”) that runs immediately (allowlisted senders only) and is stripped before the model sees the remaining message."
		].filter(Boolean).join("\n") };
	}
	return { text: [
		"🧠 Context breakdown",
		...sharedContextLines,
		toolListLine,
		toolSchemaLine,
		toolsNamesLine,
		"",
		totalsLine,
		"",
		"Inline shortcut: a command token inside normal text (e.g. “hey /status”) that runs immediately (allowlisted senders only) and is stripped before the model sees the remaining message."
	].join("\n") };
}
//#endregion
//#region src/auto-reply/reply/commands-context-command.ts
const handleContextCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/context" && !normalized.startsWith("/context ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /context from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: await buildContextReply(params)
	};
};
//#endregion
//#region src/auto-reply/reply/commands-export-common.ts
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function parseExportCommandOutputPath(commandBodyNormalized, aliases) {
	const normalized = commandBodyNormalized.trim();
	if (aliases.some((alias) => normalized === `/${alias}`)) return {};
	const aliasPattern = aliases.map(escapeRegExp).join("|");
	return { outputPath: normalized.replace(new RegExp(`^/(${aliasPattern})\\s*`), "").trim().split(/\s+/).find((part) => !part.startsWith("-")) };
}
function resolveExportCommandSessionTarget(params) {
	const targetAgentId = resolveAgentIdFromSessionKey(params.sessionKey) || params.agentId;
	const storePath = params.storePath ?? resolveDefaultSessionStorePath(targetAgentId);
	const entry = loadSessionStore(storePath, { skipCache: true })[params.sessionKey];
	if (!entry?.sessionId) return { text: `❌ Session not found: ${params.sessionKey}` };
	try {
		return {
			entry,
			sessionFile: resolveSessionFilePath(entry.sessionId, entry, resolveSessionFilePathOptions({
				agentId: targetAgentId,
				storePath
			}))
		};
	} catch (err) {
		return { text: `❌ Failed to resolve session file: ${formatErrorMessage(err)}` };
	}
}
function isReplyPayload(value) {
	return "text" in value;
}
//#endregion
//#region src/auto-reply/reply/commands-export-session.ts
const EXPORT_HTML_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "export-html");
function loadTemplate(fileName) {
	return fs.readFileSync(path.join(EXPORT_HTML_DIR, fileName), "utf-8");
}
function generateHtml(sessionData) {
	const template = loadTemplate("template.html");
	const templateCss = loadTemplate("template.css");
	const templateJs = loadTemplate("template.js");
	const markedJs = loadTemplate(path.join("vendor", "marked.min.js"));
	const hljsJs = loadTemplate(path.join("vendor", "highlight.min.js"));
	const themeVars = `
    --cyan: #00d7ff;
    --blue: #5f87ff;
    --green: #b5bd68;
    --red: #cc6666;
    --yellow: #ffff00;
    --gray: #808080;
    --dimGray: #666666;
    --darkGray: #505050;
    --accent: #8abeb7;
    --selectedBg: #3a3a4a;
    --userMsgBg: #343541;
    --toolPendingBg: #282832;
    --toolSuccessBg: #283228;
    --toolErrorBg: #3c2828;
    --customMsgBg: #2d2838;
    --text: #e0e0e0;
    --dim: #666666;
    --muted: #808080;
    --border: #5f87ff;
    --borderAccent: #00d7ff;
    --borderMuted: #505050;
    --success: #b5bd68;
    --error: #cc6666;
    --warning: #ffff00;
    --thinkingText: #808080;
    --userMessageBg: #343541;
    --userMessageText: #e0e0e0;
    --customMessageBg: #2d2838;
    --customMessageText: #e0e0e0;
    --customMessageLabel: #9575cd;
    --toolTitle: #e0e0e0;
    --toolOutput: #808080;
    --mdHeading: #f0c674;
    --mdLink: #81a2be;
    --mdLinkUrl: #666666;
    --mdCode: #8abeb7;
    --mdCodeBlock: #b5bd68;
  `;
	const bodyBg = "#1e1e28";
	const containerBg = "#282832";
	const infoBg = "#343541";
	const sessionDataBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64");
	const css = templateCss.replace("/* {{THEME_VARS}} */", themeVars.trim()).replace("/* {{BODY_BG_DECL}} */", `--body-bg: ${bodyBg};`).replace("/* {{CONTAINER_BG_DECL}} */", `--container-bg: ${containerBg};`).replace("/* {{INFO_BG_DECL}} */", `--info-bg: ${infoBg};`);
	return template.replace("{{CSS}}", css).replace("{{JS}}", templateJs).replace("{{SESSION_DATA}}", sessionDataBase64).replace("{{MARKED_JS}}", markedJs).replace("{{HIGHLIGHT_JS}}", hljsJs);
}
async function buildExportSessionReply(params) {
	const args = parseExportCommandOutputPath(params.command.commandBodyNormalized, ["export-session", "export"]);
	const sessionTarget = resolveExportCommandSessionTarget(params);
	if (isReplyPayload(sessionTarget)) return sessionTarget;
	const { entry, sessionFile } = sessionTarget;
	if (!fs.existsSync(sessionFile)) return { text: `❌ Session file not found: ${sessionFile}` };
	const sessionManager = SessionManager.open(sessionFile);
	const entries = sessionManager.getEntries();
	const header = sessionManager.getHeader();
	const leafId = sessionManager.getLeafId();
	const { systemPrompt, tools } = await resolveCommandsSystemPromptBundle({
		...params,
		sessionEntry: entry
	});
	const html = generateHtml({
		header,
		entries,
		leafId,
		systemPrompt,
		tools: tools.map((t) => ({
			name: t.name,
			description: t.description,
			parameters: t.parameters
		}))
	});
	const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const defaultFileName = `openclaw-session-${entry.sessionId.slice(0, 8)}-${timestamp}.html`;
	const outputPath = args.outputPath ? path.resolve(args.outputPath.startsWith("~") ? args.outputPath.replace("~", process.env.HOME ?? "") : args.outputPath) : path.join(params.workspaceDir, defaultFileName);
	const outputDir = path.dirname(outputPath);
	if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
	fs.writeFileSync(outputPath, html, "utf-8");
	const relativePath = path.relative(params.workspaceDir, outputPath);
	return { text: [
		"✅ Session exported!",
		"",
		`📄 File: ${relativePath.startsWith("..") ? outputPath : relativePath}`,
		`📊 Entries: ${entries.length}`,
		`🧠 System prompt: ${systemPrompt.length.toLocaleString()} chars`,
		`🔧 Tools: ${tools.length}`
	].join("\n") };
}
//#endregion
//#region src/trajectory/export.ts
const MAX_TRAJECTORY_RUNTIME_EVENTS = 2e5;
const MAX_TRAJECTORY_TOTAL_EVENTS = 25e4;
const MAX_TRAJECTORY_SESSION_FILE_BYTES = 50 * 1024 * 1024;
function parseSessionEntries(content) {
	return content.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean).flatMap((line) => {
		try {
			return [JSON.parse(line)];
		} catch {
			return [];
		}
	});
}
function migrateLegacySessionEntries(entries) {
	const version = entries.find((entry) => entry.type === "session")?.version ?? 1;
	if (version < 2) {
		let previousId = null;
		let index = 0;
		for (const entry of entries) {
			if (entry.type === "session") {
				entry.version = 2;
				continue;
			}
			const mutable = entry;
			if (typeof mutable.id !== "string") mutable.id = `legacy-${index++}`;
			mutable.parentId = previousId;
			const entryId = mutable.id;
			previousId = typeof entryId === "string" ? entryId : null;
			if (entry.type === "compaction" && typeof mutable.firstKeptEntryIndex === "number") {
				const target = entries[mutable.firstKeptEntryIndex];
				if (target && target.type !== "session") mutable.firstKeptEntryId = target.id;
				delete mutable.firstKeptEntryIndex;
			}
		}
	}
	if (version < 3) for (const entry of entries) {
		if (entry.type === "session") {
			entry.version = 3;
			continue;
		}
		if (entry.type === "message") {
			const message = entry.message;
			if (message?.role === "hookMessage") message.role = "custom";
		}
	}
}
function readSessionBranch(filePath) {
	const fileEntries = parseSessionEntries(fs.readFileSync(filePath, "utf8"));
	migrateLegacySessionEntries(fileEntries);
	const header = fileEntries.find((entry) => entry.type === "session") ?? null;
	const entries = fileEntries.filter((entry) => entry.type !== "session" && typeof entry.id === "string" && (typeof entry.timestamp === "string" || typeof entry.timestamp === "number"));
	const byId = new Map(entries.map((entry) => [entry.id, entry]));
	const leafId = entries.at(-1)?.id ?? null;
	const branchEntries = [];
	let current = leafId ? byId.get(leafId) : void 0;
	while (current) {
		branchEntries.unshift(current);
		current = current.parentId ? byId.get(current.parentId) : void 0;
	}
	return {
		header,
		leafId,
		branchEntries
	};
}
function parseJsonlFile(filePath, params) {
	if (!fs.existsSync(filePath)) return [];
	const stat = fs.statSync(filePath);
	if (stat.size > params.maxBytes) throw new Error(`Trajectory runtime file is too large to export (${stat.size} bytes; limit ${params.maxBytes})`);
	const rows = fs.readFileSync(filePath, "utf8").split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
	const parsed = [];
	for (const row of rows) {
		if (parsed.length >= params.maxEvents) throw new Error(`Trajectory runtime file has too many events to export (limit ${params.maxEvents})`);
		try {
			const value = JSON.parse(row);
			if (!params.validate || params.validate(value)) parsed.push(value);
		} catch {}
	}
	return parsed;
}
function isFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value);
}
function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isRuntimeTrajectoryEventForSession(value, sessionId) {
	if (!isRecord(value)) return false;
	return value.traceSchema === "openclaw-trajectory" && value.schemaVersion === 1 && value.source === "runtime" && typeof value.type === "string" && typeof value.ts === "string" && !Number.isNaN(Date.parse(value.ts)) && isFiniteNumber(value.seq) && value.sessionId === sessionId && (!("data" in value) || value.data === void 0 || isRecord(value.data));
}
function isRegularNonSymlinkFile(filePath) {
	try {
		const linkStat = fs.lstatSync(filePath);
		if (linkStat.isSymbolicLink() || !linkStat.isFile()) return false;
		const stat = fs.statSync(filePath);
		return stat.isFile() && stat.dev === linkStat.dev && stat.ino === linkStat.ino;
	} catch {
		return false;
	}
}
function readRuntimePointerFile(sessionFile, sessionId) {
	const pointerPath = resolveTrajectoryPointerFilePath(sessionFile);
	if (!isRegularNonSymlinkFile(pointerPath)) return;
	try {
		const parsed = JSON.parse(fs.readFileSync(pointerPath, "utf8"));
		if (!isRecord(parsed)) return;
		if (parsed.sessionId !== sessionId || typeof parsed.runtimeFile !== "string") return;
		const runtimeFile = path.resolve(parsed.runtimeFile);
		const safeRuntimeFileName = `${safeTrajectorySessionFileName(sessionId)}.jsonl`;
		if (runtimeFile !== path.resolve(resolveTrajectoryFilePath({
			env: {},
			sessionFile,
			sessionId
		})) && path.basename(runtimeFile) !== safeRuntimeFileName) return;
		return runtimeFile;
	} catch {
		return;
	}
}
function resolveTrajectoryRuntimeFile(params) {
	if (params.runtimeFile) return params.runtimeFile;
	return [
		readRuntimePointerFile(params.sessionFile, params.sessionId),
		resolveTrajectoryFilePath({
			env: {},
			sessionFile: params.sessionFile,
			sessionId: params.sessionId
		}),
		resolveTrajectoryFilePath({
			sessionFile: params.sessionFile,
			sessionId: params.sessionId
		})
	].filter((candidate) => Boolean(candidate)).find((candidate) => isRegularNonSymlinkFile(candidate));
}
function normalizeTimestamp(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
	}
	if (typeof value === "string") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
	}
	return (/* @__PURE__ */ new Date(0)).toISOString();
}
function resolveMessageEventType(message) {
	if (message.role === "user") return "user.message";
	if (message.role === "assistant") return "assistant.message";
	if (message.role === "toolResult") return "tool.result";
	return `message.${message.role}`;
}
function extractAssistantToolCalls(message) {
	if (message.role !== "assistant" || !Array.isArray(message.content)) return [];
	return message.content.flatMap((block, index) => {
		if (!block || typeof block !== "object") return [];
		const typedBlock = block;
		const blockType = typeof typedBlock.type === "string" ? typedBlock.type.trim().toLowerCase() : "";
		if (blockType !== "toolcall" && blockType !== "tooluse" && blockType !== "functioncall") return [];
		return [{
			id: typeof typedBlock.id === "string" ? typedBlock.id : void 0,
			name: typeof typedBlock.name === "string" ? typedBlock.name : void 0,
			arguments: typedBlock.arguments ?? typedBlock.input ?? typedBlock.parameters,
			index
		}];
	});
}
function buildTranscriptEvents(params) {
	const events = [];
	let seq = 0;
	for (const entry of params.entries) {
		const push = (type, data) => {
			events.push({
				traceSchema: "openclaw-trajectory",
				schemaVersion: 1,
				traceId: params.traceId,
				source: "transcript",
				type,
				ts: normalizeTimestamp(entry.timestamp),
				seq: 0,
				sourceSeq: seq += 1,
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				workspaceDir: params.workspaceDir,
				entryId: entry.id,
				parentEntryId: entry.parentId,
				data
			});
		};
		switch (entry.type) {
			case "message":
				push(resolveMessageEventType(entry.message), { message: sanitizeDiagnosticPayload(entry.message) });
				for (const toolCall of extractAssistantToolCalls(entry.message)) push("tool.call", {
					toolCallId: toolCall.id,
					name: toolCall.name,
					arguments: sanitizeDiagnosticPayload(toolCall.arguments),
					assistantEntryId: entry.id,
					blockIndex: toolCall.index
				});
				break;
			case "compaction":
				push("session.compaction", {
					summary: entry.summary,
					firstKeptEntryId: entry.firstKeptEntryId,
					tokensBefore: entry.tokensBefore,
					details: sanitizeDiagnosticPayload(entry.details),
					fromHook: entry.fromHook ?? false
				});
				break;
			case "branch_summary":
				push("session.branch_summary", {
					fromId: entry.fromId,
					summary: entry.summary,
					details: sanitizeDiagnosticPayload(entry.details),
					fromHook: entry.fromHook ?? false
				});
				break;
			case "custom":
				push("session.custom", {
					customType: entry.customType,
					data: sanitizeDiagnosticPayload(entry.data)
				});
				break;
			case "custom_message":
				push("session.custom_message", {
					customType: entry.customType,
					content: sanitizeDiagnosticPayload(entry.content),
					details: sanitizeDiagnosticPayload(entry.details),
					display: entry.display
				});
				break;
			case "thinking_level_change":
				push("session.thinking_level_change", { thinkingLevel: entry.thinkingLevel });
				break;
			case "model_change":
				push("session.model_change", {
					provider: entry.provider,
					modelId: entry.modelId
				});
				break;
			case "label":
				push("session.label", {
					targetId: entry.targetId,
					label: entry.label
				});
				break;
			case "session_info":
				push("session.info", { name: entry.name });
				break;
		}
	}
	return events;
}
function sortTrajectoryEvents(events) {
	const sourceOrder = {
		runtime: 0,
		transcript: 1,
		export: 2
	};
	const sorted = events.toSorted((left, right) => {
		const byTs = left.ts.localeCompare(right.ts);
		if (byTs !== 0) return byTs;
		const bySource = sourceOrder[left.source] - sourceOrder[right.source];
		if (bySource !== 0) return bySource;
		return (left.sourceSeq ?? left.seq) - (right.sourceSeq ?? right.seq);
	});
	for (const [index, event] of sorted.entries()) event.seq = index + 1;
	return sorted;
}
function trajectoryJsonlFile(pathName, events) {
	return jsonlSupportBundleFile(pathName, events.map((event) => safeJsonStringify(event)).filter((line) => Boolean(line)));
}
function buildTrajectoryExportRedaction(params) {
	const env = process.env;
	return {
		env,
		stateDir: resolveStateDir(env),
		workspaceDir: path.resolve(params.workspaceDir)
	};
}
function redactWorkspacePathString(value, redaction) {
	const workspaceDir = redaction.workspaceDir;
	if (!workspaceDir) return value;
	const normalizedWorkspaceDir = workspaceDir.replaceAll("\\", "/");
	let next = value;
	for (const candidate of new Set([workspaceDir, normalizedWorkspaceDir])) {
		if (!candidate) continue;
		const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
		next = next.replace(new RegExp(`${escaped}(?=$|[\\\\/])`, "gu"), "$WORKSPACE_DIR");
	}
	return next;
}
function maybeRedactPathString(value, redaction) {
	const workspaceRedacted = redactWorkspacePathString(value, redaction);
	if (workspaceRedacted !== value || path.isAbsolute(workspaceRedacted) || workspaceRedacted.includes(redaction.stateDir) || (redaction.env.HOME ? workspaceRedacted.includes(redaction.env.HOME) : false) || (redaction.env.USERPROFILE ? workspaceRedacted.includes(redaction.env.USERPROFILE) : false)) return redactSupportString(workspaceRedacted, redaction);
	return workspaceRedacted;
}
function redactLocalPathValues(value, redaction) {
	if (typeof value === "string") return maybeRedactPathString(value, redaction);
	if (Array.isArray(value)) return value.map((entry) => redactLocalPathValues(entry, redaction));
	if (!value || typeof value !== "object") return value;
	const record = value;
	const next = {};
	for (const [key, entry] of Object.entries(record)) next[key] = redactLocalPathValues(entry, redaction);
	return next;
}
function redactEventForExport(event, redaction) {
	return {
		...event,
		workspaceDir: event.workspaceDir ? maybeRedactPathString(event.workspaceDir, redaction) : void 0,
		data: event.data ? redactLocalPathValues(event.data, redaction) : void 0
	};
}
function resolveRuntimeContext(runtimeEvents) {
	const runtimeData = runtimeEvents.slice().toReversed().find((event) => event.type === "context.compiled")?.data;
	const toolsValue = Array.isArray(runtimeData?.tools) ? runtimeData.tools : void 0;
	return {
		systemPrompt: typeof runtimeData?.systemPrompt === "string" ? runtimeData.systemPrompt : void 0,
		tools: toolsValue
	};
}
function resolveLatestRuntimeEventData(runtimeEvents, type) {
	return runtimeEvents.slice().toReversed().find((candidate) => candidate.type === type)?.data;
}
function normalizePathForMatch(value) {
	return value.replaceAll("\\", "/").trim().toLowerCase();
}
function collectPotentialPathStrings(value) {
	const found = /* @__PURE__ */ new Set();
	const visit = (input) => {
		if (!input || typeof input !== "object") return;
		if (Array.isArray(input)) {
			for (const entry of input) visit(entry);
			return;
		}
		for (const [key, entry] of Object.entries(input)) if (typeof entry === "string" && (key.toLowerCase().includes("path") || entry.endsWith("SKILL.md") || entry.endsWith("skill.md"))) found.add(entry);
		else visit(entry);
	};
	visit(value);
	return [...found];
}
function markInvokedSkills(params) {
	if (!params.skills || typeof params.skills !== "object") return params.skills;
	const skillsRecord = params.skills;
	if (!Array.isArray(skillsRecord.entries) || skillsRecord.entries.length === 0) return params.skills;
	const invokedPaths = new Set(params.events.flatMap((event) => {
		if (event.type !== "tool.call") return [];
		return collectPotentialPathStrings(event.data?.arguments);
	}));
	const normalizedInvokedPaths = new Set([...invokedPaths].map((value) => normalizePathForMatch(value)));
	const entries = skillsRecord.entries.map((entry) => {
		const rawPath = typeof entry.filePath === "string" ? entry.filePath : void 0;
		const normalizedPath = rawPath ? normalizePathForMatch(rawPath) : void 0;
		const skillDirName = rawPath?.replaceAll("\\", "/").split("/").slice(-2, -1)[0]?.toLowerCase() ?? void 0;
		const invoked = normalizedPath ? [...normalizedInvokedPaths].some((candidate) => candidate === normalizedPath || candidate.endsWith(normalizedPath) || (skillDirName ? candidate.endsWith(`/${skillDirName}/skill.md`) : false)) : false;
		return invoked ? {
			...entry,
			invoked,
			invocationDetectedBy: "tool-call-file-path"
		} : {
			...entry,
			invoked: false
		};
	});
	return {
		...skillsRecord,
		entries
	};
}
function buildMetadataCapture(params) {
	const runtimeMetadata = resolveLatestRuntimeEventData(params.runtimeEvents, "trace.metadata");
	if (!runtimeMetadata) return;
	const modelFallback = (() => {
		const latest = params.runtimeEvents.slice().toReversed().find((event) => event.provider || event.modelId || event.modelApi);
		if (!latest?.provider && !latest?.modelId && !latest?.modelApi) return;
		return {
			provider: latest.provider,
			name: latest.modelId,
			api: latest.modelApi
		};
	})();
	return {
		traceSchema: "openclaw-trajectory",
		schemaVersion: 1,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		traceId: params.manifest.traceId,
		sessionId: params.manifest.sessionId,
		sessionKey: params.manifest.sessionKey,
		harness: runtimeMetadata.harness,
		model: runtimeMetadata.model ?? modelFallback,
		config: runtimeMetadata.config,
		plugins: runtimeMetadata.plugins,
		skills: markInvokedSkills({
			skills: runtimeMetadata.skills,
			events: params.events
		}),
		prompting: runtimeMetadata.prompting,
		redaction: runtimeMetadata.redaction,
		metadata: runtimeMetadata.metadata
	};
}
function buildArtifactsCapture(params) {
	const runtimeArtifacts = resolveLatestRuntimeEventData(params.runtimeEvents, "trace.artifacts");
	const runtimeCompletion = resolveLatestRuntimeEventData(params.runtimeEvents, "model.completed");
	const runtimeEnd = resolveLatestRuntimeEventData(params.runtimeEvents, "session.ended");
	if (!runtimeArtifacts && !runtimeCompletion && !runtimeEnd) return;
	return {
		traceSchema: "openclaw-trajectory",
		schemaVersion: 1,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		traceId: params.manifest.traceId,
		sessionId: params.manifest.sessionId,
		sessionKey: params.manifest.sessionKey,
		finalStatus: runtimeArtifacts?.finalStatus ?? runtimeEnd?.status,
		aborted: runtimeArtifacts?.aborted ?? runtimeEnd?.aborted,
		externalAbort: runtimeArtifacts?.externalAbort ?? runtimeEnd?.externalAbort,
		timedOut: runtimeArtifacts?.timedOut ?? runtimeEnd?.timedOut,
		idleTimedOut: runtimeArtifacts?.idleTimedOut ?? runtimeEnd?.idleTimedOut,
		timedOutDuringCompaction: runtimeArtifacts?.timedOutDuringCompaction ?? runtimeEnd?.timedOutDuringCompaction,
		promptError: runtimeArtifacts?.promptError ?? runtimeEnd?.promptError ?? runtimeCompletion?.promptError,
		promptErrorSource: runtimeArtifacts?.promptErrorSource ?? runtimeCompletion?.promptErrorSource,
		usage: runtimeArtifacts?.usage ?? runtimeCompletion?.usage,
		promptCache: runtimeArtifacts?.promptCache ?? runtimeCompletion?.promptCache,
		compactionCount: runtimeArtifacts?.compactionCount ?? runtimeCompletion?.compactionCount,
		assistantTexts: runtimeArtifacts?.assistantTexts ?? runtimeCompletion?.assistantTexts,
		finalPromptText: runtimeArtifacts?.finalPromptText ?? runtimeCompletion?.finalPromptText,
		itemLifecycle: runtimeArtifacts?.itemLifecycle,
		toolMetas: runtimeArtifacts?.toolMetas,
		didSendViaMessagingTool: runtimeArtifacts?.didSendViaMessagingTool,
		successfulCronAdds: runtimeArtifacts?.successfulCronAdds,
		messagingToolSentTexts: runtimeArtifacts?.messagingToolSentTexts,
		messagingToolSentMediaUrls: runtimeArtifacts?.messagingToolSentMediaUrls,
		messagingToolSentTargets: runtimeArtifacts?.messagingToolSentTargets,
		lastToolError: runtimeArtifacts?.lastToolError
	};
}
function buildPromptsCapture(params) {
	const runtimeMetadata = resolveLatestRuntimeEventData(params.runtimeEvents, "trace.metadata");
	const latestCompiled = resolveLatestRuntimeEventData(params.runtimeEvents, "context.compiled");
	const submittedPrompts = params.runtimeEvents.filter((event) => event.type === "prompt.submitted").map((event) => event.data?.prompt).filter((prompt) => typeof prompt === "string");
	const systemPrompt = (typeof latestCompiled?.systemPrompt === "string" ? latestCompiled.systemPrompt : void 0) ?? params.runtimeContext.systemPrompt;
	const skillsPrompt = runtimeMetadata?.prompting && typeof runtimeMetadata.prompting === "object" && typeof runtimeMetadata.prompting.skillsPrompt === "string" ? runtimeMetadata.prompting.skillsPrompt : void 0;
	const userPromptPrefixText = runtimeMetadata?.prompting && typeof runtimeMetadata.prompting === "object" && typeof runtimeMetadata.prompting.userPromptPrefixText === "string" ? runtimeMetadata.prompting.userPromptPrefixText : void 0;
	const promptReport = runtimeMetadata?.prompting && typeof runtimeMetadata.prompting === "object" && typeof runtimeMetadata.prompting.systemPromptReport === "object" ? runtimeMetadata.prompting.systemPromptReport : void 0;
	if (!systemPrompt && submittedPrompts.length === 0 && !skillsPrompt && !userPromptPrefixText) return;
	return {
		traceSchema: "openclaw-trajectory",
		schemaVersion: 1,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		traceId: params.manifest.traceId,
		sessionId: params.manifest.sessionId,
		sessionKey: params.manifest.sessionKey,
		system: systemPrompt,
		submittedPrompts,
		latestSubmittedPrompt: submittedPrompts.at(-1),
		skillsPrompt,
		userPromptPrefixText,
		systemPromptReport: promptReport
	};
}
function resolveDefaultTrajectoryExportDir(params) {
	const timestamp = (params.now ?? /* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const sessionFileName = safeTrajectorySessionFileName(params.sessionId);
	return path.join(params.workspaceDir, ".openclaw", "trajectory-exports", `openclaw-trajectory-${sessionFileName.slice(0, 8)}-${timestamp}`);
}
function exportTrajectoryBundle(params) {
	const redaction = buildTrajectoryExportRedaction({ workspaceDir: params.workspaceDir });
	const sessionStat = fs.statSync(params.sessionFile);
	if (sessionStat.size > MAX_TRAJECTORY_SESSION_FILE_BYTES) throw new Error(`Trajectory session file is too large to export (${sessionStat.size} bytes; limit ${MAX_TRAJECTORY_SESSION_FILE_BYTES})`);
	const { header, leafId, branchEntries } = readSessionBranch(params.sessionFile);
	const runtimeFile = resolveTrajectoryRuntimeFile({
		runtimeFile: params.runtimeFile,
		sessionFile: params.sessionFile,
		sessionId: params.sessionId
	});
	const runtimeEvents = runtimeFile ? parseJsonlFile(runtimeFile, {
		maxBytes: TRAJECTORY_RUNTIME_FILE_MAX_BYTES,
		maxEvents: MAX_TRAJECTORY_RUNTIME_EVENTS,
		validate: (value) => isRuntimeTrajectoryEventForSession(value, params.sessionId)
	}) : [];
	const transcriptEvents = buildTranscriptEvents({
		entries: branchEntries,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		workspaceDir: params.workspaceDir,
		traceId: params.sessionId
	});
	const maxTotalEvents = params.maxTotalEvents ?? MAX_TRAJECTORY_TOTAL_EVENTS;
	const totalEventCount = runtimeEvents.length + transcriptEvents.length;
	if (totalEventCount > maxTotalEvents) throw new Error(`Trajectory export has too many events (${totalEventCount}; limit ${maxTotalEvents})`);
	const rawEvents = sortTrajectoryEvents([...runtimeEvents, ...transcriptEvents]);
	const events = rawEvents.map((event) => redactEventForExport(event, redaction));
	const manifest = {
		traceSchema: "openclaw-trajectory",
		schemaVersion: 1,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		traceId: params.sessionId,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		workspaceDir: maybeRedactPathString(params.workspaceDir, redaction),
		leafId,
		eventCount: events.length,
		runtimeEventCount: runtimeEvents.length,
		transcriptEventCount: transcriptEvents.length,
		sourceFiles: {
			session: maybeRedactPathString(params.sessionFile, redaction),
			runtime: runtimeFile && isRegularNonSymlinkFile(runtimeFile) ? maybeRedactPathString(runtimeFile, redaction) : void 0
		}
	};
	const bundleRuntimeContext = resolveRuntimeContext(runtimeEvents);
	const files = [];
	const supplementalFiles = [];
	const metadataCapture = buildMetadataCapture({
		manifest,
		runtimeEvents,
		events: rawEvents
	});
	const artifactsCapture = buildArtifactsCapture({
		manifest,
		runtimeEvents
	});
	const promptsCapture = buildPromptsCapture({
		manifest,
		runtimeEvents,
		runtimeContext: bundleRuntimeContext
	});
	if (metadataCapture) {
		files.push(jsonSupportBundleFile("metadata.json", redactLocalPathValues(metadataCapture, redaction)));
		supplementalFiles.push("metadata.json");
	}
	if (artifactsCapture) {
		files.push(jsonSupportBundleFile("artifacts.json", redactLocalPathValues(artifactsCapture, redaction)));
		supplementalFiles.push("artifacts.json");
	}
	if (promptsCapture) {
		files.push(jsonSupportBundleFile("prompts.json", redactLocalPathValues(promptsCapture, redaction)));
		supplementalFiles.push("prompts.json");
	}
	if (supplementalFiles.length > 0) manifest.supplementalFiles = supplementalFiles;
	files.push(trajectoryJsonlFile("events.jsonl", events));
	files.push(jsonSupportBundleFile("session-branch.json", redactLocalPathValues(sanitizeDiagnosticPayload({
		header,
		leafId,
		entries: branchEntries
	}), redaction)));
	if (bundleRuntimeContext.systemPrompt) files.push(textSupportBundleFile("system-prompt.txt", redactLocalPathValues(bundleRuntimeContext.systemPrompt, redaction)));
	if (bundleRuntimeContext.tools) files.push(jsonSupportBundleFile("tools.json", redactLocalPathValues(bundleRuntimeContext.tools, redaction)));
	manifest.contents = [...supportBundleContents(files)];
	writeSupportBundleDirectory({
		outputDir: params.outputDir,
		files: [jsonSupportBundleFile("manifest.json", manifest), ...files]
	});
	return {
		manifest,
		outputDir: params.outputDir,
		events,
		header,
		runtimeFile: runtimeFile && isRegularNonSymlinkFile(runtimeFile) ? runtimeFile : void 0,
		supplementalFiles
	};
}
//#endregion
//#region src/auto-reply/reply/commands-export-trajectory.ts
function isPathInsideOrEqual(baseDir, candidate) {
	const relative = path.relative(baseDir, candidate);
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
function validateExistingExportDirectory(params) {
	const linkStat = fs.lstatSync(params.dir);
	if (linkStat.isSymbolicLink() || !linkStat.isDirectory()) throw new Error(`${params.label} must be a real directory inside the workspace`);
	const realDir = fs.realpathSync(params.dir);
	if (!isPathInsideOrEqual(params.realWorkspace, realDir)) throw new Error("Trajectory exports directory must stay inside the workspace");
	return realDir;
}
function mkdirIfMissingThenValidate(params) {
	if (!fs.existsSync(params.dir)) try {
		fs.mkdirSync(params.dir, { mode: 448 });
	} catch (error) {
		if (error.code !== "EEXIST") throw error;
	}
	return validateExistingExportDirectory(params);
}
function resolveTrajectoryExportBaseDir(workspaceDir) {
	const workspacePath = path.resolve(workspaceDir);
	const realWorkspace = fs.realpathSync(workspacePath);
	const stateDir = path.join(workspacePath, ".openclaw");
	mkdirIfMissingThenValidate({
		dir: stateDir,
		label: "OpenClaw state directory",
		realWorkspace
	});
	const baseDir = path.join(stateDir, "trajectory-exports");
	const realBase = mkdirIfMissingThenValidate({
		dir: baseDir,
		label: "Trajectory exports directory",
		realWorkspace
	});
	return {
		baseDir: path.resolve(baseDir),
		realBase
	};
}
function resolveTrajectoryCommandOutputDir(params) {
	const { baseDir, realBase } = resolveTrajectoryExportBaseDir(params.workspaceDir);
	const raw = params.outputPath?.trim();
	if (!raw) {
		const defaultDir = resolveDefaultTrajectoryExportDir({
			workspaceDir: params.workspaceDir,
			sessionId: params.sessionId
		});
		return path.join(baseDir, path.basename(defaultDir));
	}
	if (path.isAbsolute(raw) || raw.startsWith("~")) throw new Error("Output path must be relative to the workspace trajectory exports directory");
	const resolvedBase = path.resolve(baseDir);
	const outputDir = path.resolve(resolvedBase, raw);
	const relative = path.relative(resolvedBase, outputDir);
	if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Output path must stay inside the workspace trajectory exports directory");
	let existingParent = outputDir;
	while (!fs.existsSync(existingParent)) {
		const next = path.dirname(existingParent);
		if (next === existingParent) break;
		existingParent = next;
	}
	if (!isPathInsideOrEqual(realBase, fs.realpathSync(existingParent))) throw new Error("Output path must stay inside the real trajectory exports directory");
	return outputDir;
}
async function buildExportTrajectoryReply(params) {
	const args = parseExportCommandOutputPath(params.command.commandBodyNormalized, ["export-trajectory", "trajectory"]);
	const sessionTarget = resolveExportCommandSessionTarget(params);
	if (isReplyPayload(sessionTarget)) return sessionTarget;
	const { entry, sessionFile } = sessionTarget;
	if (!fs.existsSync(sessionFile)) return { text: "❌ Session file not found." };
	let outputDir;
	try {
		outputDir = resolveTrajectoryCommandOutputDir({
			outputPath: args.outputPath,
			workspaceDir: params.workspaceDir,
			sessionId: entry.sessionId
		});
	} catch (err) {
		return { text: `❌ Failed to resolve output path: ${formatErrorMessage(err)}` };
	}
	let bundle;
	try {
		bundle = exportTrajectoryBundle({
			outputDir,
			sessionFile,
			sessionId: entry.sessionId,
			sessionKey: params.sessionKey,
			workspaceDir: params.workspaceDir
		});
	} catch (err) {
		return { text: `❌ Failed to export trajectory: ${formatErrorMessage(err)}` };
	}
	const relativePath = path.relative(params.workspaceDir, bundle.outputDir);
	const displayPath = relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath) ? relativePath : path.basename(bundle.outputDir);
	const files = [
		"manifest.json",
		"events.jsonl",
		"session-branch.json"
	];
	if (bundle.events.some((event) => event.type === "context.compiled")) files.push("system-prompt.txt", "tools.json");
	files.push(...bundle.supplementalFiles);
	return { text: [
		"✅ Trajectory exported!",
		"",
		`📦 Bundle: ${displayPath}`,
		`🧵 Session: ${entry.sessionId}`,
		`📊 Events: ${bundle.manifest.eventCount}`,
		`🧪 Runtime events: ${bundle.manifest.runtimeEventCount}`,
		`📝 Transcript events: ${bundle.manifest.transcriptEventCount}`,
		`📁 Files: ${files.join(", ")}`
	].join("\n") };
}
//#endregion
//#region src/auto-reply/reply/commands-whoami.ts
const handleWhoamiCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/whoami") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /whoami from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const senderId = params.ctx.SenderId ?? "";
	const senderUsername = params.ctx.SenderUsername ?? "";
	const lines = ["🧭 Identity", `Channel: ${params.command.channel}`];
	if (senderId) lines.push(`User id: ${senderId}`);
	if (senderUsername) {
		const handle = senderUsername.startsWith("@") ? senderUsername : `@${senderUsername}`;
		lines.push(`Username: ${handle}`);
	}
	if (params.ctx.ChatType === "group" && params.ctx.From) lines.push(`Chat: ${params.ctx.From}`);
	if (params.ctx.MessageThreadId != null) lines.push(`Thread: ${params.ctx.MessageThreadId}`);
	const allowFromSender = params.command.senderId ?? "";
	if (allowFromSender) lines.push(`AllowFrom: ${allowFromSender}`);
	return {
		shouldContinue: false,
		reply: { text: lines.join("\n") }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-info.ts
const handleHelpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/help") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /help from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: { text: buildHelpMessage(params.cfg) }
	};
};
const handleCommandsListCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/commands") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /commands from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const agentId = params.sessionKey ? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	}) : params.agentId;
	const skillCommands = params.skillCommands ?? listSkillCommandsForAgents({
		cfg: params.cfg,
		agentIds: agentId ? [agentId] : void 0
	});
	const surface = params.ctx.Surface;
	const commandPlugin = surface ? getChannelPlugin(surface) : null;
	const paginated = buildCommandsMessagePaginated(params.cfg, skillCommands, {
		page: 1,
		surface
	});
	const channelData = commandPlugin?.commands?.buildCommandsListChannelData?.({
		currentPage: paginated.currentPage,
		totalPages: paginated.totalPages,
		agentId
	});
	if (channelData) return {
		shouldContinue: false,
		reply: {
			text: paginated.text,
			channelData
		}
	};
	return {
		shouldContinue: false,
		reply: { text: buildCommandsMessage(params.cfg, skillCommands, { surface }) }
	};
};
const handleToolsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	let verbose = false;
	if (normalized === "/tools" || normalized === "/tools compact") verbose = false;
	else if (normalized === "/tools verbose") verbose = true;
	else if (normalized.startsWith("/tools ")) return {
		shouldContinue: false,
		reply: { text: "Usage: /tools [compact|verbose]" }
	};
	else return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /tools from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	try {
		const effectiveAccountId = resolveChannelAccountId({
			cfg: params.cfg,
			ctx: params.ctx,
			command: params.command
		});
		const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
		const sessionBound = Boolean(params.sessionKey);
		const agentId = sessionBound ? resolveSessionAgentId({
			sessionKey: params.sessionKey,
			config: params.cfg
		}) : params.agentId;
		const threadingContext = buildThreadingToolContext({
			sessionCtx: params.ctx,
			config: params.cfg,
			hasRepliedRef: void 0
		});
		return {
			shouldContinue: false,
			reply: { text: buildToolsMessage(resolveEffectiveToolInventory({
				cfg: params.cfg,
				agentId,
				sessionKey: params.sessionKey,
				workspaceDir: params.workspaceDir,
				agentDir: sessionBound ? void 0 : params.agentDir,
				modelProvider: params.provider,
				modelId: params.model,
				messageProvider: params.command.channel,
				senderIsOwner: params.command.senderIsOwner,
				senderId: params.command.senderId,
				senderName: params.ctx.SenderName,
				senderUsername: params.ctx.SenderUsername,
				senderE164: params.ctx.SenderE164,
				accountId: effectiveAccountId,
				currentChannelId: threadingContext.currentChannelId,
				currentThreadTs: typeof params.ctx.MessageThreadId === "string" || typeof params.ctx.MessageThreadId === "number" ? String(params.ctx.MessageThreadId) : void 0,
				currentMessageId: threadingContext.currentMessageId,
				groupId: targetSessionEntry?.groupId ?? extractExplicitGroupId(params.ctx.From),
				groupChannel: targetSessionEntry?.groupChannel ?? params.ctx.GroupChannel ?? params.ctx.GroupSubject,
				groupSpace: targetSessionEntry?.space ?? params.ctx.GroupSpace,
				replyToMode: resolveReplyToMode(params.cfg, params.ctx.OriginatingChannel ?? params.ctx.Provider, effectiveAccountId, params.ctx.ChatType)
			}), { verbose }) }
		};
	} catch (err) {
		return {
			shouldContinue: false,
			reply: { text: String(err).includes("missing scope:") ? "You do not have permission to view available tools." : "Couldn't load available tools right now. Try again in a moment." }
		};
	}
};
const handleStatusCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (!(params.directives.hasStatusDirective || params.command.commandBodyNormalized === "/status")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /status from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	return {
		shouldContinue: false,
		reply: await buildStatusReply({
			cfg: params.cfg,
			command: params.command,
			sessionEntry: targetSessionEntry,
			sessionKey: params.sessionKey,
			parentSessionKey: targetSessionEntry?.parentSessionKey ?? params.ctx.ParentSessionKey,
			sessionScope: params.sessionScope,
			storePath: params.storePath,
			provider: params.provider,
			model: params.model,
			contextTokens: params.contextTokens,
			resolvedThinkLevel: params.resolvedThinkLevel,
			resolvedFastMode: params.resolvedFastMode,
			resolvedVerboseLevel: params.resolvedVerboseLevel,
			resolvedReasoningLevel: params.resolvedReasoningLevel,
			resolvedElevatedLevel: params.resolvedElevatedLevel,
			resolveDefaultThinkingLevel: params.resolveDefaultThinkingLevel,
			isGroup: params.isGroup,
			defaultGroupActivation: params.defaultGroupActivation,
			mediaDecisions: params.ctx.MediaUnderstandingDecisions
		})
	};
};
const handleExportSessionCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/export-session" && !normalized.startsWith("/export-session ") && normalized !== "/export" && !normalized.startsWith("/export ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /export-session from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	return {
		shouldContinue: false,
		reply: await buildExportSessionReply(params)
	};
};
const handleExportTrajectoryCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/export-trajectory" && !normalized.startsWith("/export-trajectory ") && normalized !== "/trajectory" && !normalized.startsWith("/trajectory ")) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/export-trajectory");
	if (unauthorized) return unauthorized;
	const nonOwner = rejectNonOwnerCommand(params, "/export-trajectory");
	if (nonOwner) return nonOwner;
	return {
		shouldContinue: false,
		reply: await buildExportTrajectoryReply(params)
	};
};
//#endregion
//#region src/auto-reply/reply/mcp-commands.ts
function parseMcpCommand(raw) {
	return parseStandardSetUnsetSlashCommand({
		raw,
		slash: "/mcp",
		invalidMessage: "Invalid /mcp syntax.",
		usageMessage: "Usage: /mcp show|set|unset",
		onKnownAction: (action, args) => {
			if (action === "show" || action === "get") return {
				action: "show",
				name: args || void 0
			};
		},
		onSet: (name, value) => ({
			action: "set",
			name,
			value
		}),
		onUnset: (name) => ({
			action: "unset",
			name
		})
	});
}
//#endregion
//#region src/auto-reply/reply/commands-mcp.ts
function renderJsonBlock$1(label, value) {
	return `${label}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}
const handleMcpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const mcpCommand = parseMcpCommand(params.command.commandBodyNormalized);
	if (!mcpCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/mcp");
	if (unauthorized) return unauthorized;
	const nonOwner = mcpCommand.action === "show" && isInternalMessageChannel(params.command.channel) ? null : rejectNonOwnerCommand(params, "/mcp");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/mcp",
		configKey: "mcp"
	});
	if (disabled) return disabled;
	if (mcpCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${mcpCommand.message}` }
	};
	if (mcpCommand.action === "show") {
		const loaded = await listConfiguredMcpServers();
		if (!loaded.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${loaded.error}` }
		};
		if (mcpCommand.name) {
			const server = loaded.mcpServers[mcpCommand.name];
			if (!server) return {
				shouldContinue: false,
				reply: { text: `🔌 No MCP server named "${mcpCommand.name}" in ${loaded.path}.` }
			};
			return {
				shouldContinue: false,
				reply: { text: renderJsonBlock$1(`🔌 MCP server "${mcpCommand.name}" (${loaded.path})`, server) }
			};
		}
		if (Object.keys(loaded.mcpServers).length === 0) return {
			shouldContinue: false,
			reply: { text: `🔌 No MCP servers configured in ${loaded.path}.` }
		};
		return {
			shouldContinue: false,
			reply: { text: renderJsonBlock$1(`🔌 MCP servers (${loaded.path})`, loaded.mcpServers) }
		};
	}
	const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/mcp write",
		allowedScopes: ["operator.admin"],
		missingText: "❌ /mcp set|unset requires operator.admin for gateway clients."
	});
	if (missingAdminScope) return missingAdminScope;
	if (mcpCommand.action === "set") {
		const result = await setConfiguredMcpServer({
			name: mcpCommand.name,
			server: mcpCommand.value
		});
		if (!result.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${result.error}` }
		};
		return {
			shouldContinue: false,
			reply: { text: `🔌 MCP server "${mcpCommand.name}" saved to ${result.path}.` }
		};
	}
	const result = await unsetConfiguredMcpServer({ name: mcpCommand.name });
	if (!result.ok) return {
		shouldContinue: false,
		reply: { text: `⚠️ ${result.error}` }
	};
	if (!result.removed) return {
		shouldContinue: false,
		reply: { text: `🔌 No MCP server named "${mcpCommand.name}" in ${result.path}.` }
	};
	return {
		shouldContinue: false,
		reply: { text: `🔌 MCP server "${mcpCommand.name}" removed from ${result.path}.` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-plugin.ts
/**
* Plugin Command Handler
*
* Handles commands registered by plugins, bypassing the LLM agent.
* This handler is called before built-in command handlers.
*/
/**
* Handle plugin-registered commands.
* Returns a result if a plugin command was matched and executed,
* or null to continue to the next handler.
*/
const handlePluginCommand = async (params, allowTextCommands) => {
	const { command, cfg } = params;
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	if (!allowTextCommands) return null;
	const match = matchPluginCommand(command.commandBodyNormalized);
	if (!match) return null;
	return {
		shouldContinue: false,
		reply: await executePluginCommand({
			command: match.command,
			args: match.args,
			senderId: command.senderId,
			channel: command.channel,
			channelId: command.channelId,
			isAuthorizedSender: command.isAuthorizedSender,
			gatewayClientScopes: params.ctx.GatewayClientScopes,
			sessionKey: params.sessionKey,
			sessionId: targetSessionEntry?.sessionId,
			sessionFile: targetSessionEntry?.sessionFile,
			commandBody: command.commandBodyNormalized,
			config: cfg,
			from: command.from,
			to: command.to,
			accountId: params.ctx.AccountId ?? void 0,
			messageThreadId: typeof params.ctx.MessageThreadId === "string" || typeof params.ctx.MessageThreadId === "number" ? params.ctx.MessageThreadId : void 0,
			threadParentId: normalizeOptionalString(params.ctx.ThreadParentId)
		})
	};
};
//#endregion
//#region src/auto-reply/reply/plugins-commands.ts
function parsePluginsCommand(raw) {
	const match = raw.match(/^\/plugins?(?:\s+(.*))?$/i);
	if (!match) return null;
	const tail = normalizeOptionalString(match?.[1]) ?? "";
	if (!tail) return { action: "list" };
	const [rawAction, ...rest] = tail.split(/\s+/);
	const action = normalizeOptionalLowercaseString(rawAction);
	const name = rest.join(" ").trim();
	if (action === "list") return name ? {
		action: "error",
		message: "Usage: /plugins list|inspect|show|get|enable|disable [plugin]"
	} : { action: "list" };
	if (action === "inspect" || action === "show" || action === "get") return {
		action: "inspect",
		name: name || void 0
	};
	if (action === "install" || action === "add") {
		if (!name) return {
			action: "error",
			message: "Usage: /plugins install <path|archive|npm-spec|clawhub:pkg>"
		};
		return {
			action: "install",
			spec: name
		};
	}
	if (action === "enable" || action === "disable") {
		if (!name) return {
			action: "error",
			message: `Usage: /plugins ${action} <plugin-id-or-name>`
		};
		return {
			action,
			name
		};
	}
	return {
		action: "error",
		message: "Usage: /plugins list|inspect|show|get|install|enable|disable [plugin]"
	};
}
//#endregion
//#region src/auto-reply/reply/commands-plugins.ts
function renderJsonBlock(label, value) {
	return `${label}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}
function buildPluginInspectJson(params) {
	const inspect = buildPluginInspectReport({
		id: params.id,
		config: params.config,
		report: params.report
	});
	if (!inspect) return null;
	return {
		inspect,
		compatibilityWarnings: inspect.compatibility.map((warning) => ({
			code: warning.code,
			severity: warning.severity,
			message: formatPluginCompatibilityNotice(warning)
		})),
		install: params.installRecords[inspect.plugin.id] ?? null
	};
}
function buildAllPluginInspectJson(params) {
	return buildAllPluginInspectReports({
		config: params.config,
		report: params.report
	}).map((inspect) => ({
		inspect,
		compatibilityWarnings: inspect.compatibility.map((warning) => ({
			code: warning.code,
			severity: warning.severity,
			message: formatPluginCompatibilityNotice(warning)
		})),
		install: params.installRecords[inspect.plugin.id] ?? null
	}));
}
function formatPluginLabel(plugin) {
	if (!plugin.name || plugin.name === plugin.id) return plugin.id;
	return `${plugin.name} (${plugin.id})`;
}
function formatPluginsList(report) {
	if (report.plugins.length === 0) return `🔌 No plugins found for workspace ${report.workspaceDir ?? "(unknown workspace)"}.`;
	return [`🔌 Plugins (${report.plugins.filter((plugin) => plugin.status === "loaded").length}/${report.plugins.length} loaded)`, ...report.plugins.map((plugin) => {
		const format = plugin.bundleFormat ? `${plugin.format ?? "openclaw"}/${plugin.bundleFormat}` : plugin.format ?? "openclaw";
		return `- ${formatPluginLabel(plugin)} [${plugin.status}] ${format}`;
	})].join("\n");
}
function findPlugin(report, rawName) {
	const target = normalizeOptionalLowercaseString(rawName);
	if (!target) return;
	return report.plugins.find((plugin) => normalizeOptionalLowercaseString(plugin.id) === target || normalizeOptionalLowercaseString(plugin.name) === target);
}
function looksLikeLocalPluginInstallSpec(raw) {
	return raw.startsWith(".") || raw.startsWith("~") || raw.startsWith("/") || raw.endsWith(".ts") || raw.endsWith(".js") || raw.endsWith(".mjs") || raw.endsWith(".cjs") || raw.endsWith(".tgz") || raw.endsWith(".tar.gz") || raw.endsWith(".tar") || raw.endsWith(".zip");
}
async function installPluginFromPluginsCommand(params) {
	const fileSpec = resolveFileNpmSpecToLocalPath(params.raw);
	if (fileSpec && !fileSpec.ok) return {
		ok: false,
		error: fileSpec.error
	};
	const resolved = resolveUserPath(fileSpec && fileSpec.ok ? fileSpec.path : params.raw);
	if (fs.existsSync(resolved)) {
		const result = await installPluginFromPath({
			path: resolved,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) return {
			ok: false,
			error: result.error
		};
		clearPluginManifestRegistryCache();
		const source = resolveArchiveKind(resolved) ? "archive" : "path";
		await persistPluginInstall({
			snapshot: params.snapshot,
			pluginId: result.pluginId,
			install: {
				source,
				sourcePath: resolved,
				installPath: result.targetDir,
				version: result.version
			}
		});
		return {
			ok: true,
			pluginId: result.pluginId
		};
	}
	if (looksLikeLocalPluginInstallSpec(params.raw)) return {
		ok: false,
		error: `Path not found: ${resolved}`
	};
	if (parseClawHubPluginSpec(params.raw)) {
		const result = await installPluginFromClawHub({
			spec: params.raw,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) return {
			ok: false,
			error: result.error
		};
		clearPluginManifestRegistryCache();
		await persistPluginInstall({
			snapshot: params.snapshot,
			pluginId: result.pluginId,
			install: {
				source: "clawhub",
				spec: params.raw,
				installPath: result.targetDir,
				version: result.version,
				integrity: result.clawhub.integrity,
				resolvedAt: result.clawhub.resolvedAt,
				clawhubUrl: result.clawhub.clawhubUrl,
				clawhubPackage: result.clawhub.clawhubPackage,
				clawhubFamily: result.clawhub.clawhubFamily,
				clawhubChannel: result.clawhub.clawhubChannel
			}
		});
		return {
			ok: true,
			pluginId: result.pluginId
		};
	}
	const preferredClawHubSpec = buildPreferredClawHubSpec(params.raw);
	if (preferredClawHubSpec) {
		const clawhubResult = await installPluginFromClawHub({
			spec: preferredClawHubSpec,
			logger: createPluginInstallLogger()
		});
		if (clawhubResult.ok) {
			clearPluginManifestRegistryCache();
			await persistPluginInstall({
				snapshot: params.snapshot,
				pluginId: clawhubResult.pluginId,
				install: {
					source: "clawhub",
					spec: preferredClawHubSpec,
					installPath: clawhubResult.targetDir,
					version: clawhubResult.version,
					integrity: clawhubResult.clawhub.integrity,
					resolvedAt: clawhubResult.clawhub.resolvedAt,
					clawhubUrl: clawhubResult.clawhub.clawhubUrl,
					clawhubPackage: clawhubResult.clawhub.clawhubPackage,
					clawhubFamily: clawhubResult.clawhub.clawhubFamily,
					clawhubChannel: clawhubResult.clawhub.clawhubChannel
				}
			});
			return {
				ok: true,
				pluginId: clawhubResult.pluginId
			};
		}
		if (decidePreferredClawHubFallback(clawhubResult) !== "fallback_to_npm") return {
			ok: false,
			error: clawhubResult.error
		};
	}
	const result = await installPluginFromNpmSpec({
		spec: params.raw,
		logger: createPluginInstallLogger()
	});
	if (!result.ok) return {
		ok: false,
		error: result.error
	};
	clearPluginManifestRegistryCache();
	const installRecord = buildNpmInstallRecordFields({
		spec: params.raw,
		installPath: result.targetDir,
		version: result.version,
		resolution: result.npmResolution
	});
	await persistPluginInstall({
		snapshot: params.snapshot,
		pluginId: result.pluginId,
		install: installRecord
	});
	return {
		ok: true,
		pluginId: result.pluginId
	};
}
async function loadPluginCommandState(workspaceDir, options) {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) return {
		ok: false,
		path: snapshot.path,
		error: "Config file is invalid; fix it before using /plugins."
	};
	const config = structuredClone(snapshot.resolved);
	return {
		ok: true,
		path: snapshot.path,
		config,
		report: options?.loadModules === true ? buildPluginDiagnosticsReport({
			config,
			workspaceDir
		}) : buildPluginRegistrySnapshotReport({
			config,
			workspaceDir
		})
	};
}
async function loadPluginCommandConfig() {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) return {
		ok: false,
		path: snapshot.path,
		error: "Config file is invalid; fix it before using /plugins."
	};
	return {
		ok: true,
		path: snapshot.path,
		snapshot: {
			config: structuredClone(snapshot.sourceConfig),
			baseHash: snapshot.hash
		}
	};
}
const handlePluginsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const pluginsCommand = parsePluginsCommand(params.command.commandBodyNormalized);
	if (!pluginsCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/plugins");
	if (unauthorized) return unauthorized;
	const nonOwner = (pluginsCommand.action === "list" || pluginsCommand.action === "inspect") && isInternalMessageChannel(params.command.channel) ? null : rejectNonOwnerCommand(params, "/plugins");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/plugins",
		configKey: "plugins"
	});
	if (disabled) return disabled;
	if (pluginsCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${pluginsCommand.message}` }
	};
	const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/plugins write",
		allowedScopes: ["operator.admin"],
		missingText: "❌ /plugins install|enable|disable requires operator.admin for gateway clients."
	});
	if (missingAdminScope) return missingAdminScope;
	if (pluginsCommand.action === "install") {
		const loadedConfig = await loadPluginCommandConfig();
		if (!loadedConfig.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${loadedConfig.error}` }
		};
		const installed = await installPluginFromPluginsCommand({
			raw: pluginsCommand.spec,
			snapshot: loadedConfig.snapshot
		});
		if (!installed.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${installed.error}` }
		};
		return {
			shouldContinue: false,
			reply: { text: `🔌 Installed plugin "${installed.pluginId}". Restart the gateway to load plugins.` }
		};
	}
	const loaded = await loadPluginCommandState(params.workspaceDir, { loadModules: pluginsCommand.action === "inspect" });
	if (!loaded.ok) return {
		shouldContinue: false,
		reply: { text: `⚠️ ${loaded.error}` }
	};
	if (pluginsCommand.action === "list") return {
		shouldContinue: false,
		reply: { text: formatPluginsList(loaded.report) }
	};
	if (pluginsCommand.action === "inspect") {
		const installRecords = await loadInstalledPluginIndexInstallRecords();
		if (!pluginsCommand.name) return {
			shouldContinue: false,
			reply: { text: formatPluginsList(loaded.report) }
		};
		if (normalizeOptionalLowercaseString(pluginsCommand.name) === "all") return {
			shouldContinue: false,
			reply: { text: renderJsonBlock("🔌 Plugins", buildAllPluginInspectJson({
				...loaded,
				installRecords
			})) }
		};
		const payload = buildPluginInspectJson({
			id: pluginsCommand.name,
			config: loaded.config,
			installRecords,
			report: loaded.report
		});
		if (!payload) return {
			shouldContinue: false,
			reply: { text: `🔌 No plugin named "${pluginsCommand.name}" found.` }
		};
		return {
			shouldContinue: false,
			reply: { text: renderJsonBlock(`🔌 Plugin "${payload.inspect.plugin.id}"`, {
				...payload.inspect,
				compatibilityWarnings: payload.compatibilityWarnings,
				install: payload.install
			}) }
		};
	}
	const plugin = findPlugin(loaded.report, pluginsCommand.name);
	if (!plugin) return {
		shouldContinue: false,
		reply: { text: `🔌 No plugin named "${pluginsCommand.name}" found.` }
	};
	const validated = validateConfigObjectWithPlugins(setPluginEnabledInConfig(structuredClone(loaded.config), plugin.id, pluginsCommand.action === "enable"));
	if (!validated.ok) {
		const issue = validated.issues[0];
		return {
			shouldContinue: false,
			reply: { text: `⚠️ Config invalid after /plugins ${pluginsCommand.action} (${issue.path}: ${issue.message}).` }
		};
	}
	await replaceConfigFile({
		nextConfig: validated.config,
		afterWrite: { mode: "auto" }
	});
	let registryWarning;
	await refreshPluginRegistryAfterConfigMutation({
		config: validated.config,
		reason: "policy-changed",
		logger: { warn: (message) => {
			registryWarning = message;
		} }
	});
	return {
		shouldContinue: false,
		reply: { text: `🔌 Plugin "${plugin.id}" ${pluginsCommand.action}d in ${loaded.path}. Restart the gateway to apply.` + (registryWarning ? `\n${registryWarning}` : "") }
	};
};
//#endregion
//#region src/auto-reply/send-policy.ts
function normalizeSendPolicyOverride(raw) {
	const value = normalizeOptionalLowercaseString(raw);
	if (!value) return;
	if (value === "allow" || value === "on") return "allow";
	if (value === "deny" || value === "off") return "deny";
}
function parseSendPolicyCommand(raw) {
	if (!raw) return { hasCommand: false };
	const trimmed = raw.trim();
	if (!trimmed) return { hasCommand: false };
	const match = normalizeCommandBody(stripInboundMetadata(trimmed)).match(/^\/send(?:\s+([a-zA-Z]+))?\s*$/i);
	if (!match) return { hasCommand: false };
	const token = normalizeOptionalLowercaseString(match[1]);
	if (!token) return { hasCommand: true };
	if (token === "inherit" || token === "default" || token === "reset") return {
		hasCommand: true,
		mode: "inherit"
	};
	return {
		hasCommand: true,
		mode: normalizeSendPolicyOverride(token)
	};
}
//#endregion
//#region src/auto-reply/reply/commands-session-store.ts
async function persistSessionEntry(params) {
	if (!params.sessionEntry || !params.sessionStore || !params.sessionKey) return false;
	params.sessionEntry.updatedAt = Date.now();
	params.sessionStore[params.sessionKey] = params.sessionEntry;
	if (params.storePath) await updateSessionStore(params.storePath, (store) => {
		store[params.sessionKey] = params.sessionEntry;
	});
	return true;
}
async function persistAbortTargetEntry(params) {
	const { entry, key, sessionStore, storePath, abortCutoff } = params;
	if (!entry || !key || !sessionStore) return false;
	entry.abortedLastRun = true;
	applyAbortCutoffToSessionEntry(entry, abortCutoff);
	entry.updatedAt = Date.now();
	sessionStore[key] = entry;
	if (storePath) await updateSessionStore(storePath, (store) => {
		const nextEntry = store[key] ?? entry;
		if (!nextEntry) return;
		nextEntry.abortedLastRun = true;
		applyAbortCutoffToSessionEntry(nextEntry, abortCutoff);
		nextEntry.updatedAt = Date.now();
		store[key] = nextEntry;
	});
	return true;
}
//#endregion
//#region src/auto-reply/reply/commands-session-abort.ts
async function abortEmbeddedPiRunForSession(sessionId) {
	const { abortEmbeddedPiRun } = await import("./runs-DSsOaWs9.js");
	abortEmbeddedPiRun(sessionId);
}
function resolveAbortTarget(params) {
	const targetSessionKey = normalizeOptionalString(params.ctx.CommandTargetSessionKey) || params.sessionKey;
	const { entry, key } = resolveSessionEntryForKey(params.sessionStore, targetSessionKey);
	if (entry && key) return {
		entry,
		key,
		sessionId: replyRunRegistry.resolveSessionId(key) ?? entry.sessionId
	};
	if (params.sessionEntry && params.sessionKey && (!targetSessionKey || targetSessionKey === params.sessionKey)) return {
		entry: params.sessionEntry,
		key: params.sessionKey,
		sessionId: replyRunRegistry.resolveSessionId(params.sessionKey) ?? params.sessionEntry.sessionId
	};
	return {
		entry: void 0,
		key: targetSessionKey,
		sessionId: targetSessionKey ? replyRunRegistry.resolveSessionId(targetSessionKey) : void 0
	};
}
function resolveAbortCutoffForTarget(params) {
	if (!shouldPersistAbortCutoff({
		commandSessionKey: params.commandSessionKey,
		targetSessionKey: params.targetSessionKey
	})) return;
	return resolveAbortCutoffFromContext(params.ctx);
}
async function applyAbortTarget(params) {
	const { abortTarget } = params;
	if (abortTarget.key) replyRunRegistry.abort(abortTarget.key);
	if (abortTarget.sessionId) await abortEmbeddedPiRunForSession(abortTarget.sessionId);
	if (!await persistAbortTargetEntry({
		entry: abortTarget.entry,
		key: abortTarget.key,
		sessionStore: params.sessionStore,
		storePath: params.storePath,
		abortCutoff: params.abortCutoff
	}) && params.abortKey) setAbortMemory(params.abortKey, true);
}
function buildAbortTargetApplyParams(params, abortTarget) {
	return {
		abortTarget,
		sessionStore: params.sessionStore,
		storePath: params.storePath,
		abortKey: params.command.abortKey,
		abortCutoff: resolveAbortCutoffForTarget({
			ctx: params.ctx,
			commandSessionKey: params.sessionKey,
			targetSessionKey: abortTarget.key
		})
	};
}
const handleStopCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/stop") return null;
	const unauthorizedStop = rejectUnauthorizedCommand(params, "/stop");
	if (unauthorizedStop) return unauthorizedStop;
	const abortTarget = resolveAbortTarget({
		ctx: params.ctx,
		sessionKey: params.sessionKey,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore
	});
	const cleared = clearSessionQueues([abortTarget.key, abortTarget.sessionId]);
	if (cleared.followupCleared > 0 || cleared.laneCleared > 0) logVerbose(`stop: cleared followups=${cleared.followupCleared} lane=${cleared.laneCleared} keys=${cleared.keys.join(",")}`);
	await applyAbortTarget(buildAbortTargetApplyParams(params, abortTarget));
	await triggerInternalHook(createInternalHookEvent("command", "stop", abortTarget.key ?? params.sessionKey ?? "", {
		sessionEntry: abortTarget.entry,
		sessionId: abortTarget.sessionId,
		commandSource: params.command.surface,
		senderId: params.command.senderId
	}));
	const { stopped } = stopSubagentsForRequester({
		cfg: params.cfg,
		requesterSessionKey: abortTarget.key ?? params.sessionKey
	});
	return {
		shouldContinue: false,
		reply: { text: formatAbortReplyText(stopped) }
	};
};
const handleAbortTrigger = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (!isAbortTrigger(params.command.rawBodyNormalized)) return null;
	const unauthorizedAbortTrigger = rejectUnauthorizedCommand(params, "abort trigger");
	if (unauthorizedAbortTrigger) return unauthorizedAbortTrigger;
	await applyAbortTarget(buildAbortTargetApplyParams(params, resolveAbortTarget({
		ctx: params.ctx,
		sessionKey: params.sessionKey,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore
	})));
	return {
		shouldContinue: false,
		reply: { text: "⚙️ Agent was aborted." }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-session.ts
const SESSION_DURATION_OFF_VALUES = new Set([
	"off",
	"disable",
	"disabled",
	"none",
	"0"
]);
const SESSION_ACTION_IDLE = "idle";
const SESSION_ACTION_MAX_AGE = "max-age";
function buildRestartCommandSentinel(params) {
	const sessionKey = normalizeOptionalString(params.sessionKey);
	if (!sessionKey) return null;
	const { deliveryContext, threadId } = extractDeliveryInfo(sessionKey);
	return {
		kind: "restart",
		status: "ok",
		ts: Date.now(),
		sessionKey,
		deliveryContext,
		threadId,
		message: "/restart",
		continuation: buildRestartSuccessContinuation({ sessionKey }),
		doctorHint: formatDoctorNonInteractiveHint(),
		stats: {
			mode: "gateway.restart",
			reason: "/restart"
		}
	};
}
function resolveSessionCommandUsage() {
	return "Usage: /session idle <duration|off> | /session max-age <duration|off> (example: /session idle 24h)";
}
function parseSessionDurationMs(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (!normalized) throw new Error("missing duration");
	if (SESSION_DURATION_OFF_VALUES.has(normalized)) return 0;
	if (/^\d+(?:\.\d+)?$/.test(normalized)) {
		const hours = Number(normalized);
		if (!Number.isFinite(hours) || hours < 0) throw new Error("invalid duration");
		return Math.round(hours * 60 * 60 * 1e3);
	}
	return parseDurationMs(normalized, { defaultUnit: "h" });
}
function formatSessionExpiry(expiresAt) {
	return new Date(expiresAt).toISOString();
}
function resolveSessionBindingDurationMs(binding, key, fallbackMs) {
	const raw = binding.metadata?.[key];
	if (typeof raw !== "number" || !Number.isFinite(raw)) return fallbackMs;
	return Math.max(0, Math.floor(raw));
}
function resolveSessionBindingLastActivityAt(binding) {
	const raw = binding.metadata?.lastActivityAt;
	if (typeof raw !== "number" || !Number.isFinite(raw)) return binding.boundAt;
	return Math.max(Math.floor(raw), binding.boundAt);
}
function resolveSessionBindingBoundBy(binding) {
	const raw = binding.metadata?.boundBy;
	return normalizeOptionalString(raw) ?? "";
}
function isSessionBindingRecord(binding) {
	return "bindingId" in binding;
}
function resolveUpdatedLifecycleDurationMs(binding, key) {
	if (!isSessionBindingRecord(binding)) {
		const raw = binding[key];
		if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
	}
	if (!isSessionBindingRecord(binding)) return;
	const raw = binding.metadata?.[key];
	if (typeof raw !== "number" || !Number.isFinite(raw)) return;
	return Math.max(0, Math.floor(raw));
}
function toUpdatedLifecycleBinding(binding) {
	const lastActivityAt = isSessionBindingRecord(binding) ? resolveSessionBindingLastActivityAt(binding) : Math.max(Math.floor(binding.lastActivityAt), binding.boundAt);
	return {
		boundAt: binding.boundAt,
		lastActivityAt,
		idleTimeoutMs: resolveUpdatedLifecycleDurationMs(binding, "idleTimeoutMs"),
		maxAgeMs: resolveUpdatedLifecycleDurationMs(binding, "maxAgeMs")
	};
}
function resolveUpdatedBindingExpiry(params) {
	const expiries = params.bindings.map((binding) => {
		if (params.action === SESSION_ACTION_IDLE) {
			const idleTimeoutMs = typeof binding.idleTimeoutMs === "number" && Number.isFinite(binding.idleTimeoutMs) ? Math.max(0, Math.floor(binding.idleTimeoutMs)) : 0;
			if (idleTimeoutMs <= 0) return;
			return Math.max(binding.lastActivityAt, binding.boundAt) + idleTimeoutMs;
		}
		const maxAgeMs = typeof binding.maxAgeMs === "number" && Number.isFinite(binding.maxAgeMs) ? Math.max(0, Math.floor(binding.maxAgeMs)) : 0;
		if (maxAgeMs <= 0) return;
		return binding.boundAt + maxAgeMs;
	}).filter((expiresAt) => typeof expiresAt === "number");
	if (expiries.length === 0) return;
	return Math.min(...expiries);
}
const handleActivationCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const activationCommand = parseActivationCommand(params.command.commandBodyNormalized);
	if (!activationCommand.hasCommand) return null;
	if (!params.isGroup) return {
		shouldContinue: false,
		reply: { text: "⚙️ Group activation only applies to group chats." }
	};
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /activation from unauthorized sender in group: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (!activationCommand.mode) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /activation mention|always" }
	};
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		params.sessionEntry.groupActivation = activationCommand.mode;
		params.sessionEntry.groupActivationNeedsSystemIntro = true;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Group activation set to ${activationCommand.mode}.` }
	};
};
const handleSendPolicyCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const sendPolicyCommand = parseSendPolicyCommand(params.command.commandBodyNormalized);
	if (!sendPolicyCommand.hasCommand) return null;
	const unauthorizedResult = rejectUnauthorizedCommand(params, "/send");
	if (unauthorizedResult) return unauthorizedResult;
	const nonOwnerResult = rejectNonOwnerCommand(params, "/send");
	if (nonOwnerResult) return nonOwnerResult;
	if (!sendPolicyCommand.mode) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /send on|off|inherit" }
	};
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		if (sendPolicyCommand.mode === "inherit") delete params.sessionEntry.sendPolicy;
		else params.sessionEntry.sendPolicy = sendPolicyCommand.mode;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Send policy set to ${sendPolicyCommand.mode === "inherit" ? "inherit" : sendPolicyCommand.mode === "allow" ? "on" : "off"}.` }
	};
};
const handleUsageCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/usage" && !normalized.startsWith("/usage ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /usage from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const rawArgs = normalized === "/usage" ? "" : normalized.slice(6).trim();
	const requested = rawArgs ? normalizeUsageDisplay(rawArgs) : void 0;
	if (normalizeLowercaseStringOrEmpty(rawArgs).startsWith("cost")) {
		const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
		const sessionAgentId = params.sessionKey ? resolveSessionAgentId({
			sessionKey: params.sessionKey,
			config: params.cfg
		}) : params.agentId;
		const sessionSummary = await loadSessionCostSummary({
			sessionId: targetSessionEntry?.sessionId,
			sessionEntry: targetSessionEntry,
			sessionFile: targetSessionEntry?.sessionFile,
			config: params.cfg,
			agentId: sessionAgentId
		});
		const summary = await loadCostUsageSummary({
			days: 30,
			config: params.cfg
		});
		const sessionCost = formatUsd(sessionSummary?.totalCost);
		const sessionTokens = sessionSummary?.totalTokens ? formatTokenCount(sessionSummary.totalTokens) : void 0;
		const sessionSuffix = (sessionSummary?.missingCostEntries ?? 0) > 0 ? " (partial)" : "";
		const sessionLine = sessionCost || sessionTokens ? `Session ${sessionCost ?? "n/a"}${sessionSuffix}${sessionTokens ? ` · ${sessionTokens} tokens` : ""}` : "Session n/a";
		const todayKey = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
		const todayEntry = summary.daily.find((entry) => entry.date === todayKey);
		const todayCost = formatUsd(todayEntry?.totalCost);
		const todaySuffix = (todayEntry?.missingCostEntries ?? 0) > 0 ? " (partial)" : "";
		const todayLine = `Today ${todayCost ?? "n/a"}${todaySuffix}`;
		const last30Cost = formatUsd(summary.totals.totalCost);
		const last30Suffix = summary.totals.missingCostEntries > 0 ? " (partial)" : "";
		return {
			shouldContinue: false,
			reply: { text: `💸 Usage cost\n${sessionLine}\n${todayLine}\n${`Last 30d ${last30Cost ?? "n/a"}${last30Suffix}`}` }
		};
	}
	if (rawArgs && !requested) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /usage off|tokens|full|cost" }
	};
	const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
	const currentRaw = targetSessionEntry?.responseUsage;
	const current = resolveResponseUsageMode(currentRaw);
	const next = requested ?? (current === "off" ? "tokens" : current === "tokens" ? "full" : "off");
	if (targetSessionEntry && params.sessionStore && params.sessionKey) {
		if (next === "off") delete targetSessionEntry.responseUsage;
		else targetSessionEntry.responseUsage = next;
		params.sessionStore[params.sessionKey] = targetSessionEntry;
		await persistSessionEntry({
			...params,
			sessionEntry: targetSessionEntry
		});
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Usage footer: ${next}.` }
	};
};
const handleFastCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/fast" && !normalized.startsWith("/fast ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /fast from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const rawMode = normalizeLowercaseStringOrEmpty(normalized === "/fast" ? "" : normalized.slice(5).trim());
	if (!rawMode || rawMode === "status") {
		const targetSessionEntry = params.sessionStore?.[params.sessionKey] ?? params.sessionEntry;
		const sessionAgentId = params.sessionKey ? resolveSessionAgentId({
			sessionKey: params.sessionKey,
			config: params.cfg
		}) : params.agentId;
		const state = resolveFastModeState({
			cfg: params.cfg,
			provider: params.provider,
			model: params.model,
			agentId: sessionAgentId,
			sessionEntry: targetSessionEntry
		});
		const suffix = state.source === "agent" ? " (agent)" : state.source === "config" ? " (config)" : state.source === "default" ? " (default)" : "";
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Current fast mode: ${state.enabled ? "on" : "off"}${suffix}.` }
		};
	}
	const nextMode = normalizeFastMode(rawMode);
	if (nextMode === void 0) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /fast status|on|off" }
	};
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		params.sessionEntry.fastMode = nextMode;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Fast mode ${nextMode ? "enabled" : "disabled"}.` }
	};
};
const handleSessionCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (!/^\/session(?:\s|$)/.test(normalized)) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /session from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const tokens = normalized.slice(8).trim().split(/\s+/).filter(Boolean);
	const action = normalizeOptionalLowercaseString(tokens[0]);
	if (action !== SESSION_ACTION_IDLE && action !== SESSION_ACTION_MAX_AGE) return {
		shouldContinue: false,
		reply: { text: resolveSessionCommandUsage() }
	};
	const channelId = params.command.channelId ?? normalizeChannelId$1(resolveCommandSurfaceChannel(params)) ?? void 0;
	const commandConversationBindings = channelId ? getChannelPlugin(channelId)?.conversationBindings : void 0;
	const commandSupportsCurrentConversationBinding = Boolean(commandConversationBindings?.supportsCurrentConversationBinding);
	const commandSupportsLifecycleUpdate = action === SESSION_ACTION_IDLE ? typeof commandConversationBindings?.setIdleTimeoutBySessionKey === "function" : typeof commandConversationBindings?.setMaxAgeBySessionKey === "function";
	const bindingContext = resolveConversationBindingContextFromAcpCommand(params);
	if (!bindingContext) {
		if (!channelId || !commandSupportsCurrentConversationBinding || !commandSupportsLifecycleUpdate) return {
			shouldContinue: false,
			reply: { text: "⚠️ /session idle and /session max-age are currently available only on channels that support focused conversation bindings." }
		};
		return {
			shouldContinue: false,
			reply: { text: "⚠️ /session idle and /session max-age must be run inside a focused conversation." }
		};
	}
	const resolvedChannelId = bindingContext.channel || channelId;
	const conversationBindings = resolvedChannelId ? getChannelPlugin(resolvedChannelId)?.conversationBindings : void 0;
	const supportsCurrentConversationBinding = Boolean(conversationBindings?.supportsCurrentConversationBinding);
	const supportsLifecycleUpdate = action === SESSION_ACTION_IDLE ? typeof conversationBindings?.setIdleTimeoutBySessionKey === "function" : typeof conversationBindings?.setMaxAgeBySessionKey === "function";
	if (!resolvedChannelId || !supportsCurrentConversationBinding || !supportsLifecycleUpdate) return {
		shouldContinue: false,
		reply: { text: "⚠️ /session idle and /session max-age are currently available only on channels that support focused conversation bindings." }
	};
	const activeBinding = getSessionBindingService().resolveByConversation(bindingContext);
	if (!activeBinding) return {
		shouldContinue: false,
		reply: { text: "ℹ️ This conversation is not currently focused." }
	};
	const idleTimeoutMs = resolveSessionBindingDurationMs(activeBinding, "idleTimeoutMs", 1440 * 60 * 1e3);
	const idleExpiresAt = idleTimeoutMs > 0 ? resolveSessionBindingLastActivityAt(activeBinding) + idleTimeoutMs : void 0;
	const maxAgeMs = resolveSessionBindingDurationMs(activeBinding, "maxAgeMs", 0);
	const maxAgeExpiresAt = maxAgeMs > 0 ? activeBinding.boundAt + maxAgeMs : void 0;
	const durationArgRaw = tokens.slice(1).join("");
	if (!durationArgRaw) {
		if (action === SESSION_ACTION_IDLE) {
			if (typeof idleExpiresAt === "number" && Number.isFinite(idleExpiresAt) && idleExpiresAt > Date.now()) return {
				shouldContinue: false,
				reply: { text: `ℹ️ Idle timeout active (${formatThreadBindingDurationLabel(idleTimeoutMs)}, next auto-unfocus at ${formatSessionExpiry(idleExpiresAt)}).` }
			};
			return {
				shouldContinue: false,
				reply: { text: "ℹ️ Idle timeout is currently disabled for this focused session." }
			};
		}
		if (typeof maxAgeExpiresAt === "number" && Number.isFinite(maxAgeExpiresAt) && maxAgeExpiresAt > Date.now()) return {
			shouldContinue: false,
			reply: { text: `ℹ️ Max age active (${formatThreadBindingDurationLabel(maxAgeMs)}, hard auto-unfocus at ${formatSessionExpiry(maxAgeExpiresAt)}).` }
		};
		return {
			shouldContinue: false,
			reply: { text: "ℹ️ Max age is currently disabled for this focused session." }
		};
	}
	const senderId = normalizeOptionalString(params.command.senderId) ?? "";
	const boundBy = resolveSessionBindingBoundBy(activeBinding);
	if (boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return {
		shouldContinue: false,
		reply: { text: `⚠️ Only ${boundBy} can update session lifecycle settings for this conversation.` }
	};
	let durationMs;
	try {
		durationMs = parseSessionDurationMs(durationArgRaw);
	} catch {
		return {
			shouldContinue: false,
			reply: { text: resolveSessionCommandUsage() }
		};
	}
	const updatedBindings = action === SESSION_ACTION_IDLE ? setChannelConversationBindingIdleTimeoutBySessionKey({
		channelId: bindingContext.channel,
		targetSessionKey: activeBinding.targetSessionKey,
		accountId: bindingContext.accountId,
		idleTimeoutMs: durationMs
	}) : setChannelConversationBindingMaxAgeBySessionKey({
		channelId: bindingContext.channel,
		targetSessionKey: activeBinding.targetSessionKey,
		accountId: bindingContext.accountId,
		maxAgeMs: durationMs
	});
	if (updatedBindings.length === 0) return {
		shouldContinue: false,
		reply: { text: action === SESSION_ACTION_IDLE ? "⚠️ Failed to update idle timeout for the current binding." : "⚠️ Failed to update max age for the current binding." }
	};
	if (durationMs <= 0) return {
		shouldContinue: false,
		reply: { text: action === SESSION_ACTION_IDLE ? `✅ Idle timeout disabled for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"}.` : `✅ Max age disabled for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"}.` }
	};
	const nextExpiry = resolveUpdatedBindingExpiry({
		action,
		bindings: updatedBindings.map((binding) => toUpdatedLifecycleBinding(binding))
	});
	const expiryLabel = typeof nextExpiry === "number" && Number.isFinite(nextExpiry) ? formatSessionExpiry(nextExpiry) : "n/a";
	return {
		shouldContinue: false,
		reply: { text: action === SESSION_ACTION_IDLE ? `✅ Idle timeout set to ${formatThreadBindingDurationLabel(durationMs)} for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"} (next auto-unfocus at ${expiryLabel}).` : `✅ Max age set to ${formatThreadBindingDurationLabel(durationMs)} for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"} (hard auto-unfocus at ${expiryLabel}).` }
	};
};
const handleRestartCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/restart") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /restart from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const nonOwner = rejectNonOwnerCommand(params, "/restart");
	if (nonOwner) return nonOwner;
	if (!isRestartEnabled(params.cfg)) return {
		shouldContinue: false,
		reply: { text: "⚠️ /restart is disabled (commands.restart=false)." }
	};
	const hasSigusr1Listener = process.listenerCount("SIGUSR1") > 0;
	const sentinelPayload = buildRestartCommandSentinel(params);
	if (hasSigusr1Listener) {
		let sentinelPath = null;
		scheduleGatewaySigusr1Restart({
			reason: "/restart",
			emitHooks: sentinelPayload ? {
				beforeEmit: async () => {
					sentinelPath = await writeRestartSentinel(sentinelPayload);
				},
				afterEmitRejected: async () => {
					await removeRestartSentinelFile(sentinelPath);
				}
			} : void 0
		});
		return {
			shouldContinue: false,
			reply: { text: "⚙️ Restarting OpenClaw in-process (SIGUSR1); back in a few seconds." }
		};
	}
	let sentinelPath = null;
	try {
		if (sentinelPayload) sentinelPath = await writeRestartSentinel(sentinelPayload);
	} catch (err) {
		logVerbose(`failed to write /restart sentinel: ${String(err)}`);
		return {
			shouldContinue: false,
			reply: { text: "⚠️ Restart failed: could not persist the post-restart acknowledgement." }
		};
	}
	const restartMethod = triggerOpenClawRestart();
	if (!restartMethod.ok) {
		await removeRestartSentinelFile(sentinelPath);
		const detail = restartMethod.detail ? ` Details: ${restartMethod.detail}` : "";
		return {
			shouldContinue: false,
			reply: { text: `⚠️ Restart failed (${restartMethod.method}).${detail}` }
		};
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Restarting OpenClaw via ${restartMethod.method}; give me a few seconds to come back online.` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-subagents.ts
let actionAgentsPromise = null;
let actionFocusPromise = null;
let actionHelpPromise = null;
let actionInfoPromise = null;
let actionKillPromise = null;
let actionListPromise = null;
let actionLogPromise = null;
let actionSendPromise = null;
let actionSpawnPromise = null;
let actionUnfocusPromise = null;
let controlRuntimePromise = null;
function loadAgentsAction() {
	actionAgentsPromise ??= import("./action-agents-DawVvFe6.js");
	return actionAgentsPromise;
}
function loadFocusAction() {
	actionFocusPromise ??= import("./action-focus-CSTurqiV.js");
	return actionFocusPromise;
}
function loadHelpAction() {
	actionHelpPromise ??= import("./action-help-DuaC4yqE.js");
	return actionHelpPromise;
}
function loadInfoAction() {
	actionInfoPromise ??= import("./action-info-BndDBszu.js");
	return actionInfoPromise;
}
function loadKillAction() {
	actionKillPromise ??= import("./action-kill-DW78O9Un.js");
	return actionKillPromise;
}
function loadListAction() {
	actionListPromise ??= import("./action-list-CsBGeojG.js");
	return actionListPromise;
}
function loadLogAction() {
	actionLogPromise ??= import("./action-log-sGJnOXQQ.js");
	return actionLogPromise;
}
function loadSendAction() {
	actionSendPromise ??= import("./action-send-BegEtV6W.js");
	return actionSendPromise;
}
function loadSpawnAction() {
	actionSpawnPromise ??= import("./action-spawn-BYWIgjiJ.js");
	return actionSpawnPromise;
}
function loadUnfocusAction() {
	actionUnfocusPromise ??= import("./action-unfocus-Cz8MTURc.js");
	return actionUnfocusPromise;
}
function loadControlRuntime() {
	controlRuntimePromise ??= import("./commands-subagents-control.runtime-DRcRWn5d.js");
	return controlRuntimePromise;
}
const handleSubagentsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	const handledPrefix = resolveHandledPrefix(normalized);
	if (!handledPrefix) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring ${handledPrefix} from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const restTokens = normalized.slice(handledPrefix.length).trim().split(/\s+/).filter(Boolean);
	const action = resolveSubagentsAction({
		handledPrefix,
		restTokens
	});
	if (!action) return (await loadHelpAction()).handleSubagentsHelpAction();
	const requesterKey = action === "spawn" ? resolveRequesterSessionKey(params, { preferCommandTarget: true }) : resolveRequesterSessionKey(params);
	if (!requesterKey) return stopWithText("⚠️ Missing session key.");
	const ctx = {
		params,
		handledPrefix,
		requesterKey,
		runs: (await loadControlRuntime()).listControlledSubagentRuns(requesterKey),
		restTokens
	};
	switch (action) {
		case "help": return (await loadHelpAction()).handleSubagentsHelpAction();
		case "agents": return (await loadAgentsAction()).handleSubagentsAgentsAction(ctx);
		case "focus": return await (await loadFocusAction()).handleSubagentsFocusAction(ctx);
		case "unfocus": return await (await loadUnfocusAction()).handleSubagentsUnfocusAction(ctx);
		case "list": return (await loadListAction()).handleSubagentsListAction(ctx);
		case "kill": return await (await loadKillAction()).handleSubagentsKillAction(ctx);
		case "info": return (await loadInfoAction()).handleSubagentsInfoAction(ctx);
		case "log": return await (await loadLogAction()).handleSubagentsLogAction(ctx);
		case "send": return await (await loadSendAction()).handleSubagentsSendAction(ctx, false);
		case "steer": return await (await loadSendAction()).handleSubagentsSendAction(ctx, true);
		case "spawn": return await (await loadSpawnAction()).handleSubagentsSpawnAction(ctx);
		default: return (await loadHelpAction()).handleSubagentsHelpAction();
	}
};
//#endregion
//#region src/auto-reply/reply/commands-tasks.ts
const MAX_VISIBLE_TASKS = 5;
const TASK_STATUS_ICONS = {
	queued: "🟡",
	running: "🟢",
	succeeded: "✅",
	failed: "🔴",
	timed_out: "⏱️",
	cancelled: "⚪️",
	lost: "⚠️"
};
const TASK_RUNTIME_LABELS = {
	subagent: "Subagent",
	acp: "ACP",
	cli: "CLI",
	cron: "Cron"
};
function formatTaskHeadline(snapshot) {
	if (snapshot.totalCount === 0) return "All clear - nothing linked to this session right now.";
	return `Current session: ${snapshot.activeCount} active · ${snapshot.totalCount} total`;
}
function formatAgentFallbackLine(agentId) {
	const snapshot = buildTaskStatusSnapshot(listTasksForAgentIdForStatus(agentId));
	if (snapshot.totalCount === 0) return;
	return `Agent-local: ${snapshot.activeCount} active · ${snapshot.totalCount} total`;
}
function formatTaskTiming(task) {
	if (task.status === "running") {
		const startedAt = task.startedAt ?? task.createdAt;
		return `elapsed ${formatDurationCompact(Date.now() - startedAt, { spaced: true }) ?? "0s"}`;
	}
	if (task.status === "queued") return `queued ${formatTimeAgo(Date.now() - task.createdAt)}`;
	const endedAt = task.endedAt ?? task.lastEventAt ?? task.createdAt;
	return `finished ${formatTimeAgo(Date.now() - endedAt)}`;
}
function formatTaskDetail(task) {
	return formatTaskStatusDetail(task);
}
function formatVisibleTask(task, index) {
	const title = formatTaskStatusTitle(task);
	const status = task.status.replaceAll("_", " ");
	const timing = formatTaskTiming(task);
	const detail = formatTaskDetail(task);
	const meta = [
		TASK_RUNTIME_LABELS[task.runtime],
		status,
		timing
	].filter(Boolean).join(" · ");
	const lines = [`${index + 1}. ${TASK_STATUS_ICONS[task.status]} ${title}`, `   ${meta}`];
	if (detail) lines.push(`   ${detail}`);
	return lines.join("\n");
}
function buildTasksText(params) {
	const sessionSnapshot = buildTaskStatusSnapshot(listTasksForSessionKeyForStatus(params.sessionKey));
	const lines = ["📋 Tasks", formatTaskHeadline(sessionSnapshot)];
	if (sessionSnapshot.totalCount > 0) {
		const visible = sessionSnapshot.visible.slice(0, MAX_VISIBLE_TASKS);
		lines.push("");
		for (const [index, task] of visible.entries()) {
			lines.push(formatVisibleTask(task, index));
			if (index < visible.length - 1) lines.push("");
		}
		const hiddenCount = sessionSnapshot.visible.length - visible.length;
		if (hiddenCount > 0) lines.push("", `+${hiddenCount} more recent task${hiddenCount === 1 ? "" : "s"}`);
		return lines.join("\n");
	}
	const agentFallback = formatAgentFallbackLine(params.agentId);
	if (agentFallback) lines.push(agentFallback);
	return lines.join("\n");
}
async function buildTasksReply(params) {
	const agentId = resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	return { text: buildTasksText({
		sessionKey: params.sessionKey,
		agentId
	}) };
}
const handleTasksCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/tasks" && !normalized.startsWith("/tasks ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /tasks from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (normalized !== "/tasks") return {
		shouldContinue: false,
		reply: { text: "Usage: /tasks" }
	};
	return {
		shouldContinue: false,
		reply: await buildTasksReply(params)
	};
};
//#endregion
//#region src/auto-reply/reply/commands-tts.ts
function parseTtsCommand(normalized) {
	if (normalized === "/tts") return {
		action: "status",
		args: ""
	};
	if (!normalized.startsWith("/tts ")) return null;
	const rest = normalized.slice(5).trim();
	if (!rest) return {
		action: "status",
		args: ""
	};
	const [action, ...tail] = rest.split(/\s+/);
	return {
		action: normalizeOptionalLowercaseString(action) ?? "",
		args: normalizeOptionalString(tail.join(" ")) ?? ""
	};
}
function formatAttemptDetails(attempts) {
	if (!attempts || attempts.length === 0) return;
	return attempts.map((attempt) => {
		const reason = attempt.reasonCode === "success" ? "ok" : attempt.reasonCode;
		const latency = Number.isFinite(attempt.latencyMs) ? ` ${attempt.latencyMs}ms` : "";
		const persona = attempt.persona && attempt.personaBinding && attempt.personaBinding !== "none" ? ` persona=${attempt.persona}:${attempt.personaBinding}` : "";
		return `${attempt.provider}:${attempt.outcome}(${reason})${persona}${latency}`;
	}).join(", ");
}
function ttsUsage() {
	return { text: "🔊 **TTS (Text-to-Speech) Help**\n\n**Commands:**\n• /tts on — Enable automatic TTS for replies\n• /tts off — Disable TTS\n• /tts status — Show current settings\n• /tts provider [name] — View/change provider\n• /tts persona [id|off] — View/change persona\n• /tts limit [number] — View/change text limit\n• /tts summary [on|off] — View/change auto-summary\n• /tts audio <text> — Generate audio from text\n• /tts latest — Read the latest assistant reply once\n• /tts chat on|off|default — Override auto-TTS for this chat\n\n**Providers:**\nUse /tts provider to list the registered speech providers and their status.\n\n**Text Limit (default: 1500, max: 4096):**\nWhen text exceeds the limit:\n• Summary ON: AI summarizes, then generates audio\n• Summary OFF: Truncates text, then generates audio\n\n**Examples:**\n/tts provider <id>\n/tts persona <id>\n/tts limit 2000\n/tts latest\n/tts audio Hello, this is a test!" };
}
function hashTtsReadLatestText(text) {
	return crypto.createHash("sha256").update(text).digest("hex");
}
async function buildTtsAudioReply(params) {
	const start = Date.now();
	const result = await textToSpeech({
		text: params.text,
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		prefsPath: params.prefsPath,
		agentId: params.agentId
	});
	if (result.success && result.audioPath) {
		setLastTtsAttempt({
			timestamp: Date.now(),
			success: true,
			textLength: params.text.length,
			summarized: false,
			provider: result.provider,
			persona: result.persona,
			fallbackFrom: result.fallbackFrom,
			attemptedProviders: result.attemptedProviders,
			attempts: result.attempts,
			latencyMs: result.latencyMs
		});
		return {
			provider: result.provider,
			reply: {
				mediaUrl: result.audioPath,
				audioAsVoice: result.voiceCompatible === true,
				trustedLocalMedia: true,
				spokenText: params.text
			}
		};
	}
	setLastTtsAttempt({
		timestamp: Date.now(),
		success: false,
		textLength: params.text.length,
		summarized: false,
		persona: result.persona,
		attemptedProviders: result.attemptedProviders,
		attempts: result.attempts,
		error: result.error,
		latencyMs: Date.now() - start
	});
	return { error: result.error ?? "unknown error" };
}
const handleTtsCommands = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const parsed = parseTtsCommand(params.command.commandBodyNormalized);
	if (!parsed) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring TTS command from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const accountId = params.ctx?.AccountId;
	const config = resolveTtsConfig(params.cfg, {
		agentId: params.agentId,
		channelId: params.command.channel,
		accountId
	});
	const prefsPath = resolveTtsPrefsPath(config);
	const action = parsed.action;
	const args = parsed.args;
	if (action === "help") return {
		shouldContinue: false,
		reply: ttsUsage()
	};
	if (action === "on") {
		setTtsEnabled(prefsPath, true);
		return {
			shouldContinue: false,
			reply: { text: "🔊 TTS enabled." }
		};
	}
	if (action === "off") {
		setTtsEnabled(prefsPath, false);
		return {
			shouldContinue: false,
			reply: { text: "🔇 TTS disabled." }
		};
	}
	if (action === "chat") {
		const requested = normalizeOptionalLowercaseString(args) ?? "";
		if (!params.sessionEntry || !params.sessionStore || !params.sessionKey) return {
			shouldContinue: false,
			reply: { text: "🔇 No active chat session is available for a chat-scoped TTS override." }
		};
		if (!requested || requested === "status") return {
			shouldContinue: false,
			reply: { text: `🔊 Chat TTS override: ${params.sessionEntry.ttsAuto ?? "default"}.` }
		};
		if (requested === "on") {
			params.sessionEntry.ttsAuto = "always";
			await persistSessionEntry(params);
			return {
				shouldContinue: false,
				reply: { text: "🔊 TTS enabled for this chat." }
			};
		}
		if (requested === "off") {
			params.sessionEntry.ttsAuto = "off";
			await persistSessionEntry(params);
			return {
				shouldContinue: false,
				reply: { text: "🔇 TTS disabled for this chat." }
			};
		}
		if (requested === "default" || requested === "inherit" || requested === "clear") {
			delete params.sessionEntry.ttsAuto;
			await persistSessionEntry(params);
			return {
				shouldContinue: false,
				reply: { text: "🔊 TTS chat override cleared." }
			};
		}
		return {
			shouldContinue: false,
			reply: ttsUsage()
		};
	}
	if (action === "latest" || action === "read" && normalizeOptionalLowercaseString(args) === "latest") {
		if (!params.sessionEntry || !params.sessionStore || !params.sessionKey) return {
			shouldContinue: false,
			reply: { text: "🎤 No active chat session is available for `/tts latest`." }
		};
		const latestText = (await readLatestAssistantTextFromSessionTranscript(params.sessionEntry.sessionFile))?.text.trim();
		if (!latestText || isSilentReplyPayloadText(latestText)) return {
			shouldContinue: false,
			reply: { text: "🎤 No readable assistant reply was found in this chat yet." }
		};
		const hash = hashTtsReadLatestText(latestText);
		if (params.sessionEntry.lastTtsReadLatestHash === hash) return {
			shouldContinue: false,
			reply: { text: "🔊 Latest assistant reply was already sent as audio." }
		};
		const audio = await buildTtsAudioReply({
			text: latestText,
			cfg: params.cfg,
			channel: params.command.channel,
			accountId,
			prefsPath,
			agentId: params.agentId
		});
		if ("error" in audio) return {
			shouldContinue: false,
			reply: { text: `❌ Error generating audio: ${audio.error}` }
		};
		params.sessionEntry.lastTtsReadLatestHash = hash;
		params.sessionEntry.lastTtsReadLatestAt = Date.now();
		await persistSessionEntry(params);
		return {
			shouldContinue: false,
			reply: audio.reply
		};
	}
	if (action === "audio") {
		if (!args.trim()) return {
			shouldContinue: false,
			reply: { text: "🎤 Generate audio from text.\n\nUsage: /tts audio <text>\nExample: /tts audio Hello, this is a test!" }
		};
		const audio = await buildTtsAudioReply({
			text: args,
			cfg: params.cfg,
			channel: params.command.channel,
			accountId,
			prefsPath,
			agentId: params.agentId
		});
		if (!("error" in audio)) return {
			shouldContinue: false,
			reply: audio.reply
		};
		return {
			shouldContinue: false,
			reply: { text: `❌ Error generating audio: ${audio.error}` }
		};
	}
	if (action === "provider") {
		const currentProvider = getTtsProvider(config, prefsPath);
		if (!args.trim()) {
			const providers = listSpeechProviders(params.cfg);
			return {
				shouldContinue: false,
				reply: { text: `🎙️ TTS provider\nPrimary: ${currentProvider}\n` + providers.map((provider) => `${provider.label}: ${provider.isConfigured({
					cfg: params.cfg,
					providerConfig: getResolvedSpeechProviderConfig(config, provider.id, params.cfg),
					timeoutMs: config.timeoutMs
				}) ? "✅" : "❌"}`).join("\n") + `\nUsage: /tts provider <id>` }
			};
		}
		const requested = normalizeOptionalLowercaseString(args) ?? "";
		const resolvedProvider = getSpeechProvider(requested, params.cfg);
		if (!resolvedProvider) return {
			shouldContinue: false,
			reply: ttsUsage()
		};
		const nextProvider = canonicalizeSpeechProviderId(requested, params.cfg) ?? resolvedProvider.id;
		setTtsProvider(prefsPath, nextProvider);
		return {
			shouldContinue: false,
			reply: { text: `✅ TTS provider set to ${nextProvider}.` }
		};
	}
	if (action === "persona") {
		const personas = listTtsPersonas(config);
		const activePersona = getTtsPersona(config, prefsPath);
		if (!args.trim()) return {
			shouldContinue: false,
			reply: { text: [
				"🎭 TTS persona",
				`Active: ${activePersona?.id ?? "none"}`,
				personas.length > 0 ? personas.map((persona) => {
					const label = persona.label ? ` (${persona.label})` : "";
					const provider = persona.provider ? ` provider=${persona.provider}` : "";
					return `${persona.id}${label}${provider}`;
				}).join("\n") : "No personas configured.",
				"Usage: /tts persona <id> | off"
			].join("\n") }
		};
		const requested = normalizeOptionalLowercaseString(args) ?? "";
		if (requested === "off" || requested === "none" || requested === "default") {
			setTtsPersona(prefsPath, null);
			return {
				shouldContinue: false,
				reply: { text: "✅ TTS persona disabled." }
			};
		}
		const persona = personas.find((entry) => entry.id === requested);
		if (!persona) return {
			shouldContinue: false,
			reply: { text: `❌ Unknown TTS persona: ${requested || args}.\nUse /tts persona to list configured personas.` }
		};
		setTtsPersona(prefsPath, persona.id);
		return {
			shouldContinue: false,
			reply: { text: `✅ TTS persona set to ${persona.id}.` }
		};
	}
	if (action === "limit") {
		if (!args.trim()) return {
			shouldContinue: false,
			reply: { text: `📏 TTS limit: ${getTtsMaxLength(prefsPath)} characters.\n\nText longer than this triggers summary (if enabled).\nRange: 100-4096 chars (Telegram max).\n\nTo change: /tts limit <number>\nExample: /tts limit 2000` }
		};
		const next = Number.parseInt(args.trim(), 10);
		if (!Number.isFinite(next) || next < 100 || next > 4096) return {
			shouldContinue: false,
			reply: { text: "❌ Limit must be between 100 and 4096 characters." }
		};
		setTtsMaxLength(prefsPath, next);
		return {
			shouldContinue: false,
			reply: { text: `✅ TTS limit set to ${next} characters.` }
		};
	}
	if (action === "summary") {
		if (!args.trim()) {
			const enabled = isSummarizationEnabled(prefsPath);
			const maxLen = getTtsMaxLength(prefsPath);
			return {
				shouldContinue: false,
				reply: { text: `📝 TTS auto-summary: ${enabled ? "on" : "off"}.\n\nWhen text exceeds ${maxLen} chars:\n• ON: summarizes text, then generates audio\n• OFF: truncates text, then generates audio\n\nTo change: /tts summary on | off` }
			};
		}
		const requested = normalizeOptionalLowercaseString(args) ?? "";
		if (requested !== "on" && requested !== "off") return {
			shouldContinue: false,
			reply: ttsUsage()
		};
		setSummarizationEnabled(prefsPath, requested === "on");
		return {
			shouldContinue: false,
			reply: { text: requested === "on" ? "✅ TTS auto-summary enabled." : "❌ TTS auto-summary disabled." }
		};
	}
	if (action === "status") {
		const enabled = isTtsEnabled(config, prefsPath);
		const provider = getTtsProvider(config, prefsPath);
		const persona = getTtsPersona(config, prefsPath);
		const hasKey = isTtsProviderConfigured(config, provider, params.cfg);
		const maxLength = getTtsMaxLength(prefsPath);
		const summarize = isSummarizationEnabled(prefsPath);
		const last = getLastTtsAttempt();
		const lines = [
			"📊 TTS status",
			`State: ${enabled ? "✅ enabled" : "❌ disabled"}`,
			`Chat override: ${params.sessionEntry?.ttsAuto ?? "default"}`,
			`Provider: ${provider} (${hasKey ? "✅ configured" : "❌ not configured"})`,
			`Persona: ${persona?.id ?? "none"}`,
			`Text limit: ${maxLength} chars`,
			`Auto-summary: ${summarize ? "on" : "off"}`
		];
		if (last) {
			const timeAgo = Math.round((Date.now() - last.timestamp) / 1e3);
			lines.push("");
			lines.push(`Last attempt (${timeAgo}s ago): ${last.success ? "✅" : "❌"}`);
			lines.push(`Text: ${last.textLength} chars${last.summarized ? " (summarized)" : ""}`);
			if (last.success) {
				lines.push(`Provider: ${last.provider ?? "unknown"}`);
				if (last.persona) lines.push(`Persona: ${last.persona}`);
				if (last.fallbackFrom && last.provider && last.fallbackFrom !== last.provider) lines.push(`Fallback: ${last.fallbackFrom} -> ${last.provider}`);
				if (last.attemptedProviders && last.attemptedProviders.length > 1) lines.push(`Attempts: ${last.attemptedProviders.join(" -> ")}`);
				const details = formatAttemptDetails(last.attempts);
				if (details) lines.push(`Attempt details: ${details}`);
				lines.push(`Latency: ${last.latencyMs ?? 0}ms`);
			} else if (last.error) {
				lines.push(`Error: ${last.error}`);
				if (last.attemptedProviders && last.attemptedProviders.length > 0) lines.push(`Attempts: ${last.attemptedProviders.join(" -> ")}`);
				const details = formatAttemptDetails(last.attempts);
				if (details) lines.push(`Attempt details: ${details}`);
			}
		}
		return {
			shouldContinue: false,
			reply: { text: lines.join("\n") }
		};
	}
	return {
		shouldContinue: false,
		reply: ttsUsage()
	};
};
//#endregion
//#region src/auto-reply/reply/commands-handlers.runtime.ts
function loadCommandHandlers() {
	return [
		handlePluginCommand,
		handleBtwCommand,
		handleBashCommand,
		handleActivationCommand,
		handleSendPolicyCommand,
		handleFastCommand,
		handleUsageCommand,
		handleSessionCommand,
		handleRestartCommand,
		handleTtsCommands,
		handleHelpCommand,
		handleCommandsListCommand,
		handleToolsCommand,
		handleStatusCommand,
		handleTasksCommand,
		handleAllowlistCommand,
		handleApproveCommand,
		handleContextCommand,
		handleExportSessionCommand,
		handleExportTrajectoryCommand,
		handleWhoamiCommand,
		handleCrestodianCommand,
		handleSubagentsCommand,
		handleAcpCommand,
		handleMcpCommand,
		handlePluginsCommand,
		handleConfigCommand,
		handleDebugCommand,
		handleModelsCommand,
		handleStopCommand,
		handleCompactCommand,
		handleAbortTrigger
	];
}
//#endregion
export { loadCommandHandlers };
