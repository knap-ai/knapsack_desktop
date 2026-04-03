import { p as createNonExitingRuntime } from "./subsystem-CJEvHE2o.js";
import { p as normalizeE164 } from "./utils-CE3P21nG.js";
import { a as shouldLogVerbose, r as logVerbose, t as danger } from "./globals-BJZkpw-q.js";
import { r as normalizeStringEntries } from "./string-normalization-De1VSx5S.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { o as readSessionUpdatedAt } from "./store-BGmy-Wot.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "./runtime-group-policy-Dj5ka44z.js";
import { i as resolveHumanDelayConfig } from "./identity-BVAU5Jb3.js";
import { s as kindFromMime } from "./mime-C9472kP8.js";
import { c as jsonResult, h as readStringParam, i as createActionGate } from "./common-RGbDbB5n.js";
import { r as enqueueSystemEvent } from "./system-events-DOxYwk9w.js";
import { i as deliverTextOrMediaReply, p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { c as resolveTextChunkLimit, o as chunkTextWithMode, s as resolveChunkMode } from "./chunk-D6CtZg6q.js";
import { l as saveMediaBuffer } from "./store-CCBPdtW9.js";
import { i as resolveAgentRoute } from "./resolve-route-DID7K3Jm.js";
import { n as sleepWithAbort, t as computeBackoff } from "./backoff-JR-Kmsdz.js";
import { n as resolveChannelGroupRequireMention } from "./group-policy-B1uRyci5.js";
import "./routing-Br1fEo8A.js";
import { t as hasControlCommand } from "./command-detection-Bz_HOEgu.js";
import { o as createReplyDispatcherWithTyping, t as dispatchInboundMessage } from "./dispatch-C2z_6KF9.js";
import { t as finalizeInboundContext } from "./inbound-context-1KETU_yq.js";
import { a as resolveEnvelopeFormatOptions, i as formatInboundFromLabel, r as formatInboundEnvelope } from "./envelope-CTj2Ympv.js";
import { n as buildMentionRegexes, r as matchesMentionPatterns } from "./mentions-Bfkn0E5p.js";
import { n as resolveControlCommandGate } from "./command-gating-Ch_OhMao.js";
import { t as recordInboundSession } from "./session-BiguA5nC.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { i as evaluateSenderGroupAccessForPolicy } from "./group-access-Cc77nG5J.js";
import { c as resolvePinnedMainDmOwnerFromAllowlist, n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists, t as DM_GROUP_ACCESS_REASON } from "./dm-policy-shared-ikRqobo8.js";
import { a as buildPendingHistoryContextFromMap, s as clearHistoryEntriesIfEnabled, u as recordPendingHistoryEntryIfEnabled } from "./history-5RBVRj2e.js";
import "./reply-history-D4cGNH0x.js";
import "./runtime-env-CoykX19-.js";
import "./config-runtime-CmISCurQ.js";
import "./reply-runtime-DxFWfQpm.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-S26JmiPz.js";
import { t as waitForTransportReady } from "./transport-ready-D5kIICoW.js";
import "./channel-runtime-BQArgtty.js";
import "./media-runtime-DdCWeFPm.js";
import "./conversation-runtime-DIsQmaYR.js";
import { t as resolveReactionLevel } from "./text-runtime-B0ZpmkER.js";
import "./agent-runtime-B7ucOTD-.js";
import "./security-runtime-DCa00BFS.js";
import { n as logInboundDrop, r as logTypingFailure } from "./logging-N7W67_op.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-Nk7oRFrM.js";
import "./command-auth-Bajp-QXz.js";
import { r as resolveReactionMessageId } from "./channel-actions-DVMcrs0t.js";
import { n as shouldDebounceTextInbound, t as createChannelInboundDebouncer } from "./channel-inbound-BTUonbdp.js";
import { n as resolveMentionGatingWithBypass } from "./mention-gating-DzHPTjeG.js";
import { i as resolveSignalAccount, t as listEnabledSignalAccounts } from "./accounts-CbGSIdyw.js";
import { n as sendReadReceiptSignal, r as sendTypingSignal, t as sendMessageSignal } from "./send-AGNkLmlC.js";
import { i as streamSignalEvents, n as signalCheck, r as signalRpcRequest } from "./rpc-context-0KpFzjBZ.js";
import { n as sendReactionSignal, t as removeReactionSignal } from "./reaction-runtime-api-C4Qt7LoL.js";
import { spawn } from "node:child_process";
//#region extensions/signal/src/identity.ts
const UUID_HYPHENATED_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_COMPACT_RE = /^[0-9a-f]{32}$/i;
function looksLikeUuid(value) {
	if (UUID_HYPHENATED_RE.test(value) || UUID_COMPACT_RE.test(value)) return true;
	const compact = value.replace(/-/g, "");
	if (!/^[0-9a-f]+$/i.test(compact)) return false;
	return /[a-f]/i.test(compact);
}
function stripSignalPrefix(value) {
	return value.replace(/^signal:/i, "").trim();
}
function resolveSignalSender(params) {
	const sourceNumber = params.sourceNumber?.trim();
	if (sourceNumber) return {
		kind: "phone",
		raw: sourceNumber,
		e164: normalizeE164(sourceNumber)
	};
	const sourceUuid = params.sourceUuid?.trim();
	if (sourceUuid) return {
		kind: "uuid",
		raw: sourceUuid
	};
	return null;
}
function formatSignalSenderId(sender) {
	return sender.kind === "phone" ? sender.e164 : `uuid:${sender.raw}`;
}
function formatSignalSenderDisplay(sender) {
	return sender.kind === "phone" ? sender.e164 : `uuid:${sender.raw}`;
}
function formatSignalPairingIdLine(sender) {
	if (sender.kind === "phone") return `Your Signal number: ${sender.e164}`;
	return `Your Signal sender id: ${formatSignalSenderId(sender)}`;
}
function resolveSignalRecipient(sender) {
	return sender.kind === "phone" ? sender.e164 : sender.raw;
}
function resolveSignalPeerId(sender) {
	return sender.kind === "phone" ? sender.e164 : `uuid:${sender.raw}`;
}
function parseSignalAllowEntry(entry) {
	const trimmed = entry.trim();
	if (!trimmed) return null;
	if (trimmed === "*") return { kind: "any" };
	const stripped = stripSignalPrefix(trimmed);
	if (stripped.toLowerCase().startsWith("uuid:")) {
		const raw = stripped.slice(5).trim();
		if (!raw) return null;
		return {
			kind: "uuid",
			raw
		};
	}
	if (looksLikeUuid(stripped)) return {
		kind: "uuid",
		raw: stripped
	};
	return {
		kind: "phone",
		e164: normalizeE164(stripped)
	};
}
function normalizeSignalAllowRecipient(entry) {
	const parsed = parseSignalAllowEntry(entry);
	if (!parsed || parsed.kind === "any") return;
	return parsed.kind === "phone" ? parsed.e164 : parsed.raw;
}
function isSignalSenderAllowed(sender, allowFrom) {
	if (allowFrom.length === 0) return false;
	const parsed = allowFrom.map(parseSignalAllowEntry).filter((entry) => entry !== null);
	if (parsed.some((entry) => entry.kind === "any")) return true;
	return parsed.some((entry) => {
		if (entry.kind === "phone" && sender.kind === "phone") return entry.e164 === sender.e164;
		if (entry.kind === "uuid" && sender.kind === "uuid") return entry.raw === sender.raw;
		return false;
	});
}
function isSignalGroupAllowed(params) {
	return evaluateSenderGroupAccessForPolicy({
		groupPolicy: params.groupPolicy,
		groupAllowFrom: params.allowFrom,
		senderId: params.sender.raw,
		isSenderAllowed: () => isSignalSenderAllowed(params.sender, params.allowFrom)
	}).allowed;
}
//#endregion
//#region extensions/signal/src/normalize.ts
function normalizeSignalMessagingTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	let normalized = trimmed;
	if (normalized.toLowerCase().startsWith("signal:")) normalized = normalized.slice(7).trim();
	if (!normalized) return;
	const lower = normalized.toLowerCase();
	if (lower.startsWith("group:")) {
		const id = normalized.slice(6).trim();
		return id ? `group:${id}` : void 0;
	}
	if (lower.startsWith("username:")) {
		const id = normalized.slice(9).trim();
		return id ? `username:${id}`.toLowerCase() : void 0;
	}
	if (lower.startsWith("u:")) {
		const id = normalized.slice(2).trim();
		return id ? `username:${id}`.toLowerCase() : void 0;
	}
	if (lower.startsWith("uuid:")) {
		const id = normalized.slice(5).trim();
		return id ? id.toLowerCase() : void 0;
	}
	return normalized.toLowerCase();
}
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_COMPACT_PATTERN = /^[0-9a-f]{32}$/i;
function looksLikeSignalTargetId(raw, normalized) {
	const candidates = [raw, normalized ?? ""].map((value) => value.trim()).filter(Boolean);
	for (const candidate of candidates) {
		if (/^(signal:)?(group:|username:|u:)/i.test(candidate)) return true;
		if (/^(signal:)?uuid:/i.test(candidate)) {
			const stripped = candidate.replace(/^signal:/i, "").replace(/^uuid:/i, "").trim();
			if (!stripped) continue;
			if (UUID_PATTERN.test(stripped) || UUID_COMPACT_PATTERN.test(stripped)) return true;
			continue;
		}
		const withoutSignalPrefix = candidate.replace(/^signal:/i, "").trim();
		if (UUID_PATTERN.test(withoutSignalPrefix) || UUID_COMPACT_PATTERN.test(withoutSignalPrefix)) return true;
		if (/^\+?\d{3,}$/.test(withoutSignalPrefix)) return true;
	}
	return false;
}
//#endregion
//#region extensions/signal/src/reaction-level.ts
/**
* Resolve the effective reaction level and its implications for Signal.
*
* Levels:
* - "off": No reactions at all
* - "ack": Only automatic ack reactions (👀 when processing), no agent reactions
* - "minimal": Agent can react, but sparingly (default)
* - "extensive": Agent can react liberally
*/
function resolveSignalReactionLevel(params) {
	return resolveReactionLevel({
		value: resolveSignalAccount({
			cfg: params.cfg,
			accountId: params.accountId
		}).config.reactionLevel,
		defaultLevel: "minimal",
		invalidFallback: "minimal"
	});
}
//#endregion
//#region extensions/signal/src/message-actions.ts
const providerId = "signal";
const GROUP_PREFIX = "group:";
function normalizeSignalReactionRecipient(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return trimmed;
	const withoutSignal = trimmed.replace(/^signal:/i, "").trim();
	if (!withoutSignal) return withoutSignal;
	if (withoutSignal.toLowerCase().startsWith("uuid:")) return withoutSignal.slice(5).trim();
	return withoutSignal;
}
function resolveSignalReactionTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {};
	const withoutSignal = trimmed.replace(/^signal:/i, "").trim();
	if (!withoutSignal) return {};
	if (withoutSignal.toLowerCase().startsWith(GROUP_PREFIX)) {
		const groupId = withoutSignal.slice(6).trim();
		return groupId ? { groupId } : {};
	}
	return { recipient: normalizeSignalReactionRecipient(withoutSignal) };
}
async function mutateSignalReaction(params) {
	const options = {
		cfg: params.cfg,
		accountId: params.accountId,
		groupId: params.target.groupId,
		targetAuthor: params.targetAuthor,
		targetAuthorUuid: params.targetAuthorUuid
	};
	if (params.remove) {
		await removeReactionSignal(params.target.recipient ?? "", params.timestamp, params.emoji, options);
		return jsonResult({
			ok: true,
			removed: params.emoji
		});
	}
	await sendReactionSignal(params.target.recipient ?? "", params.timestamp, params.emoji, options);
	return jsonResult({
		ok: true,
		added: params.emoji
	});
}
const signalMessageActions = {
	describeMessageTool: ({ cfg }) => {
		const accounts = listEnabledSignalAccounts(cfg);
		if (accounts.length === 0) return null;
		const configuredAccounts = accounts.filter((account) => account.configured);
		if (configuredAccounts.length === 0) return null;
		const actions = new Set(["send"]);
		if (configuredAccounts.some((account) => createActionGate(account.config.actions)("reactions"))) actions.add("react");
		return { actions: Array.from(actions) };
	},
	supportsAction: ({ action }) => action !== "send",
	handleAction: async ({ action, params, cfg, accountId, toolContext }) => {
		if (action === "send") throw new Error("Send should be handled by outbound, not actions handler.");
		if (action === "react") {
			const reactionLevelInfo = resolveSignalReactionLevel({
				cfg,
				accountId: accountId ?? void 0
			});
			if (!reactionLevelInfo.agentReactionsEnabled) throw new Error(`Signal agent reactions disabled (reactionLevel="${reactionLevelInfo.level}"). Set channels.signal.reactionLevel to "minimal" or "extensive" to enable.`);
			const actionConfig = resolveSignalAccount({
				cfg,
				accountId
			}).config.actions;
			if (!createActionGate(actionConfig)("reactions")) throw new Error("Signal reactions are disabled via actions.reactions.");
			const target = resolveSignalReactionTarget(readStringParam(params, "recipient") ?? readStringParam(params, "to", {
				required: true,
				label: "recipient (UUID, phone number, or group)"
			}));
			if (!target.recipient && !target.groupId) throw new Error("recipient or group required");
			const messageIdRaw = resolveReactionMessageId({
				args: params,
				toolContext
			});
			const messageId = messageIdRaw != null ? String(messageIdRaw) : void 0;
			if (!messageId) throw new Error("messageId (timestamp) required. Provide messageId explicitly or react to the current inbound message.");
			const targetAuthor = readStringParam(params, "targetAuthor");
			const targetAuthorUuid = readStringParam(params, "targetAuthorUuid");
			if (target.groupId && !targetAuthor && !targetAuthorUuid) throw new Error("targetAuthor or targetAuthorUuid required for group reactions.");
			const emoji = readStringParam(params, "emoji", { allowEmpty: true });
			const remove = typeof params.remove === "boolean" ? params.remove : void 0;
			const timestamp = parseInt(messageId, 10);
			if (!Number.isFinite(timestamp)) throw new Error(`Invalid messageId: ${messageId}. Expected numeric timestamp.`);
			if (remove) {
				if (!emoji) throw new Error("Emoji required to remove reaction.");
				return await mutateSignalReaction({
					cfg,
					accountId: accountId ?? void 0,
					target,
					timestamp,
					emoji,
					remove: true,
					targetAuthor,
					targetAuthorUuid
				});
			}
			if (!emoji) throw new Error("Emoji required to add reaction.");
			return await mutateSignalReaction({
				cfg,
				accountId: accountId ?? void 0,
				target,
				timestamp,
				emoji,
				remove: false,
				targetAuthor,
				targetAuthorUuid
			});
		}
		throw new Error(`Action ${action} not supported for ${providerId}.`);
	}
};
//#endregion
//#region extensions/signal/src/probe.ts
function parseSignalVersion(value) {
	if (typeof value === "string" && value.trim()) return value.trim();
	if (typeof value === "object" && value !== null) {
		const version = value.version;
		if (typeof version === "string" && version.trim()) return version.trim();
	}
	return null;
}
async function probeSignal(baseUrl, timeoutMs) {
	const started = Date.now();
	const result = {
		ok: false,
		status: null,
		error: null,
		elapsedMs: 0,
		version: null
	};
	const check = await signalCheck(baseUrl, timeoutMs);
	if (!check.ok) return {
		...result,
		status: check.status ?? null,
		error: check.error ?? "unreachable",
		elapsedMs: Date.now() - started
	};
	try {
		result.version = parseSignalVersion(await signalRpcRequest("version", void 0, {
			baseUrl,
			timeoutMs
		}));
	} catch (err) {
		result.error = err instanceof Error ? err.message : String(err);
	}
	return {
		...result,
		ok: true,
		status: check.status ?? null,
		elapsedMs: Date.now() - started
	};
}
//#endregion
//#region extensions/signal/src/daemon.ts
function formatSignalDaemonExit(exit) {
	return `signal daemon exited (source=${exit.source} code=${String(exit.code ?? "null")} signal=${String(exit.signal ?? "null")})`;
}
function classifySignalCliLogLine(line) {
	const trimmed = line.trim();
	if (!trimmed) return null;
	if (/\b(ERROR|WARN|WARNING)\b/.test(trimmed)) return "error";
	if (/\b(FAILED|SEVERE|EXCEPTION)\b/i.test(trimmed)) return "error";
	return "log";
}
function bindSignalCliOutput(params) {
	params.stream?.on("data", (data) => {
		for (const line of data.toString().split(/\r?\n/)) {
			const kind = classifySignalCliLogLine(line);
			if (kind === "log") params.log(`signal-cli: ${line.trim()}`);
			else if (kind === "error") params.error(`signal-cli: ${line.trim()}`);
		}
	});
}
function buildDaemonArgs(opts) {
	const args = [];
	if (opts.account) args.push("-a", opts.account);
	args.push("daemon");
	args.push("--http", `${opts.httpHost}:${opts.httpPort}`);
	args.push("--no-receive-stdout");
	if (opts.receiveMode) args.push("--receive-mode", opts.receiveMode);
	if (opts.ignoreAttachments) args.push("--ignore-attachments");
	if (opts.ignoreStories) args.push("--ignore-stories");
	if (opts.sendReadReceipts) args.push("--send-read-receipts");
	return args;
}
function spawnSignalDaemon(opts) {
	const args = buildDaemonArgs(opts);
	const child = spawn(opts.cliPath, args, { stdio: [
		"ignore",
		"pipe",
		"pipe"
	] });
	const log = opts.runtime?.log ?? (() => {});
	const error = opts.runtime?.error ?? (() => {});
	let exited = false;
	let settledExit = false;
	let resolveExit;
	const exitedPromise = new Promise((resolve) => {
		resolveExit = resolve;
	});
	const settleExit = (value) => {
		if (settledExit) return;
		settledExit = true;
		exited = true;
		resolveExit(value);
	};
	bindSignalCliOutput({
		stream: child.stdout,
		log,
		error
	});
	bindSignalCliOutput({
		stream: child.stderr,
		log,
		error
	});
	child.once("exit", (code, signal) => {
		settleExit({
			source: "process",
			code: typeof code === "number" ? code : null,
			signal: signal ?? null
		});
		error(formatSignalDaemonExit({
			source: "process",
			code: code ?? null,
			signal: signal ?? null
		}));
	});
	child.once("close", (code, signal) => {
		settleExit({
			source: "process",
			code: typeof code === "number" ? code : null,
			signal: signal ?? null
		});
	});
	child.on("error", (err) => {
		error(`signal-cli spawn error: ${String(err)}`);
		settleExit({
			source: "spawn-error",
			code: null,
			signal: null
		});
	});
	return {
		pid: child.pid ?? void 0,
		exited: exitedPromise,
		isExited: () => exited,
		stop: () => {
			if (!child.killed && !exited) child.kill("SIGTERM");
		}
	};
}
//#endregion
//#region extensions/signal/src/monitor/access-policy.ts
async function resolveSignalAccessState(params) {
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "signal",
		accountId: params.accountId,
		dmPolicy: params.dmPolicy
	});
	const resolveAccessDecision = (isGroup) => resolveDmGroupAccessWithLists({
		isGroup,
		dmPolicy: params.dmPolicy,
		groupPolicy: params.groupPolicy,
		allowFrom: params.allowFrom,
		groupAllowFrom: params.groupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => isSignalSenderAllowed(params.sender, allowEntries)
	});
	const dmAccess = resolveAccessDecision(false);
	return {
		resolveAccessDecision,
		dmAccess,
		effectiveDmAllow: dmAccess.effectiveAllowFrom,
		effectiveGroupAllow: dmAccess.effectiveGroupAllowFrom
	};
}
async function handleSignalDirectMessageAccess(params) {
	if (params.dmAccessDecision === "allow") return true;
	if (params.dmAccessDecision === "block") {
		if (params.dmPolicy !== "disabled") params.log(`Blocked signal sender ${params.senderDisplay} (dmPolicy=${params.dmPolicy})`);
		return false;
	}
	if (params.dmPolicy === "pairing") await createChannelPairingChallengeIssuer({
		channel: "signal",
		upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
			channel: "signal",
			id,
			accountId: params.accountId,
			meta
		})
	})({
		senderId: params.senderId,
		senderIdLine: params.senderIdLine,
		meta: { name: params.senderName },
		sendPairingReply: params.sendPairingReply,
		onCreated: () => {
			params.log(`signal pairing request sender=${params.senderId}`);
		},
		onReplyError: (err) => {
			params.log(`signal pairing reply failed for ${params.senderId}: ${String(err)}`);
		}
	});
	return false;
}
//#endregion
//#region extensions/signal/src/monitor/mentions.ts
const OBJECT_REPLACEMENT = "￼";
function isValidMention(mention) {
	if (!mention) return false;
	if (!(mention.uuid || mention.number)) return false;
	if (typeof mention.start !== "number" || Number.isNaN(mention.start)) return false;
	if (typeof mention.length !== "number" || Number.isNaN(mention.length)) return false;
	return mention.length > 0;
}
function clampBounds(start, length, textLength) {
	const safeStart = Math.max(0, Math.trunc(start));
	return {
		start: safeStart,
		end: Math.min(textLength, safeStart + Math.max(0, Math.trunc(length)))
	};
}
function renderSignalMentions(message, mentions) {
	if (!message || !mentions?.length) return message;
	let normalized = message;
	const candidates = mentions.filter(isValidMention).toSorted((a, b) => b.start - a.start);
	for (const mention of candidates) {
		const identifier = mention.uuid ?? mention.number;
		if (!identifier) continue;
		const { start, end } = clampBounds(mention.start, mention.length, normalized.length);
		if (start >= end) continue;
		if (!normalized.slice(start, end).includes(OBJECT_REPLACEMENT)) continue;
		normalized = normalized.slice(0, start) + `@${identifier}` + normalized.slice(end);
	}
	return normalized;
}
//#endregion
//#region extensions/signal/src/monitor/event-handler.ts
function formatAttachmentKindCount(kind, count) {
	if (kind === "attachment") return `${count} file${count > 1 ? "s" : ""}`;
	return `${count} ${kind}${count > 1 ? "s" : ""}`;
}
function formatAttachmentSummaryPlaceholder(contentTypes) {
	const kindCounts = /* @__PURE__ */ new Map();
	for (const contentType of contentTypes) {
		const kind = kindFromMime(contentType) ?? "attachment";
		kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1);
	}
	return `[${[...kindCounts.entries()].map(([kind, count]) => formatAttachmentKindCount(kind, count)).join(" + ")} attached]`;
}
function resolveSignalInboundRoute(params) {
	return resolveAgentRoute({
		cfg: params.cfg,
		channel: "signal",
		accountId: params.accountId,
		peer: {
			kind: params.isGroup ? "group" : "direct",
			id: params.isGroup ? params.groupId ?? "unknown" : params.senderPeerId
		}
	});
}
function createSignalEventHandler(deps) {
	async function handleSignalInboundMessage(entry) {
		const fromLabel = formatInboundFromLabel({
			isGroup: entry.isGroup,
			groupLabel: entry.groupName ?? void 0,
			groupId: entry.groupId ?? "unknown",
			groupFallback: "Group",
			directLabel: entry.senderName,
			directId: entry.senderDisplay
		});
		const route = resolveSignalInboundRoute({
			cfg: deps.cfg,
			accountId: deps.accountId,
			isGroup: entry.isGroup,
			groupId: entry.groupId,
			senderPeerId: entry.senderPeerId
		});
		const storePath = resolveStorePath(deps.cfg.session?.store, { agentId: route.agentId });
		const envelopeOptions = resolveEnvelopeFormatOptions(deps.cfg);
		const previousTimestamp = readSessionUpdatedAt({
			storePath,
			sessionKey: route.sessionKey
		});
		const body = formatInboundEnvelope({
			channel: "Signal",
			from: fromLabel,
			timestamp: entry.timestamp ?? void 0,
			body: entry.bodyText,
			chatType: entry.isGroup ? "group" : "direct",
			sender: {
				name: entry.senderName,
				id: entry.senderDisplay
			},
			previousTimestamp,
			envelope: envelopeOptions
		});
		let combinedBody = body;
		const historyKey = entry.isGroup ? String(entry.groupId ?? "unknown") : void 0;
		if (entry.isGroup && historyKey) combinedBody = buildPendingHistoryContextFromMap({
			historyMap: deps.groupHistories,
			historyKey,
			limit: deps.historyLimit,
			currentMessage: combinedBody,
			formatEntry: (historyEntry) => formatInboundEnvelope({
				channel: "Signal",
				from: fromLabel,
				timestamp: historyEntry.timestamp,
				body: `${historyEntry.body}${historyEntry.messageId ? ` [id:${historyEntry.messageId}]` : ""}`,
				chatType: "group",
				senderLabel: historyEntry.sender,
				envelope: envelopeOptions
			})
		});
		const signalToRaw = entry.isGroup ? `group:${entry.groupId}` : `signal:${entry.senderRecipient}`;
		const signalTo = normalizeSignalMessagingTarget(signalToRaw) ?? signalToRaw;
		const inboundHistory = entry.isGroup && historyKey && deps.historyLimit > 0 ? (deps.groupHistories.get(historyKey) ?? []).map((historyEntry) => ({
			sender: historyEntry.sender,
			body: historyEntry.body,
			timestamp: historyEntry.timestamp
		})) : void 0;
		const ctxPayload = finalizeInboundContext({
			Body: combinedBody,
			BodyForAgent: entry.bodyText,
			InboundHistory: inboundHistory,
			RawBody: entry.bodyText,
			CommandBody: entry.commandBody,
			BodyForCommands: entry.commandBody,
			From: entry.isGroup ? `group:${entry.groupId ?? "unknown"}` : `signal:${entry.senderRecipient}`,
			To: signalTo,
			SessionKey: route.sessionKey,
			AccountId: route.accountId,
			ChatType: entry.isGroup ? "group" : "direct",
			ConversationLabel: fromLabel,
			GroupSubject: entry.isGroup ? entry.groupName ?? void 0 : void 0,
			SenderName: entry.senderName,
			SenderId: entry.senderDisplay,
			Provider: "signal",
			Surface: "signal",
			MessageSid: entry.messageId,
			Timestamp: entry.timestamp ?? void 0,
			MediaPath: entry.mediaPath,
			MediaType: entry.mediaType,
			MediaUrl: entry.mediaPath,
			MediaPaths: entry.mediaPaths,
			MediaUrls: entry.mediaPaths,
			MediaTypes: entry.mediaTypes,
			WasMentioned: entry.isGroup ? entry.wasMentioned === true : void 0,
			CommandAuthorized: entry.commandAuthorized,
			OriginatingChannel: "signal",
			OriginatingTo: signalTo
		});
		await recordInboundSession({
			storePath,
			sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
			ctx: ctxPayload,
			updateLastRoute: !entry.isGroup ? {
				sessionKey: route.mainSessionKey,
				channel: "signal",
				to: entry.senderRecipient,
				accountId: route.accountId,
				mainDmOwnerPin: (() => {
					const pinnedOwner = resolvePinnedMainDmOwnerFromAllowlist({
						dmScope: deps.cfg.session?.dmScope,
						allowFrom: deps.allowFrom,
						normalizeEntry: normalizeSignalAllowRecipient
					});
					if (!pinnedOwner) return;
					return {
						ownerRecipient: pinnedOwner,
						senderRecipient: entry.senderRecipient,
						onSkip: ({ ownerRecipient, senderRecipient }) => {
							logVerbose(`signal: skip main-session last route for ${senderRecipient} (pinned owner ${ownerRecipient})`);
						}
					};
				})()
			} : void 0,
			onRecordError: (err) => {
				logVerbose(`signal: failed updating session meta: ${String(err)}`);
			}
		});
		if (shouldLogVerbose()) {
			const preview = body.slice(0, 200).replace(/\\n/g, "\\\\n");
			logVerbose(`signal inbound: from=${ctxPayload.From} len=${body.length} preview="${preview}"`);
		}
		const { onModelSelected, typingCallbacks, ...replyPipeline } = createChannelReplyPipeline({
			cfg: deps.cfg,
			agentId: route.agentId,
			channel: "signal",
			accountId: route.accountId,
			typing: {
				start: async () => {
					if (!ctxPayload.To) return;
					await sendTypingSignal(ctxPayload.To, {
						baseUrl: deps.baseUrl,
						account: deps.account,
						accountId: deps.accountId
					});
				},
				onStartError: (err) => {
					logTypingFailure({
						log: logVerbose,
						channel: "signal",
						target: ctxPayload.To ?? void 0,
						error: err
					});
				}
			}
		});
		const { dispatcher, replyOptions, markDispatchIdle } = createReplyDispatcherWithTyping({
			...replyPipeline,
			humanDelay: resolveHumanDelayConfig(deps.cfg, route.agentId),
			typingCallbacks,
			deliver: async (payload) => {
				await deps.deliverReplies({
					replies: [payload],
					target: ctxPayload.To,
					baseUrl: deps.baseUrl,
					account: deps.account,
					accountId: deps.accountId,
					runtime: deps.runtime,
					maxBytes: deps.mediaMaxBytes,
					textLimit: deps.textLimit
				});
			},
			onError: (err, info) => {
				deps.runtime.error?.(danger(`signal ${info.kind} reply failed: ${String(err)}`));
			}
		});
		const { queuedFinal } = await dispatchInboundMessage({
			ctx: ctxPayload,
			cfg: deps.cfg,
			dispatcher,
			replyOptions: {
				...replyOptions,
				disableBlockStreaming: typeof deps.blockStreaming === "boolean" ? !deps.blockStreaming : void 0,
				onModelSelected
			}
		});
		markDispatchIdle();
		if (!queuedFinal) {
			if (entry.isGroup && historyKey) clearHistoryEntriesIfEnabled({
				historyMap: deps.groupHistories,
				historyKey,
				limit: deps.historyLimit
			});
			return;
		}
		if (entry.isGroup && historyKey) clearHistoryEntriesIfEnabled({
			historyMap: deps.groupHistories,
			historyKey,
			limit: deps.historyLimit
		});
	}
	const { debouncer: inboundDebouncer } = createChannelInboundDebouncer({
		cfg: deps.cfg,
		channel: "signal",
		buildKey: (entry) => {
			const conversationId = entry.isGroup ? entry.groupId ?? "unknown" : entry.senderPeerId;
			if (!conversationId || !entry.senderPeerId) return null;
			return `signal:${deps.accountId}:${conversationId}:${entry.senderPeerId}`;
		},
		shouldDebounce: (entry) => {
			return shouldDebounceTextInbound({
				text: entry.bodyText,
				cfg: deps.cfg,
				hasMedia: Boolean(entry.mediaPath || entry.mediaType || entry.mediaPaths?.length)
			});
		},
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			if (entries.length === 1) {
				await handleSignalInboundMessage(last);
				return;
			}
			const combinedText = entries.map((entry) => entry.bodyText).filter(Boolean).join("\\n");
			if (!combinedText.trim()) return;
			await handleSignalInboundMessage({
				...last,
				bodyText: combinedText,
				mediaPath: void 0,
				mediaType: void 0,
				mediaPaths: void 0,
				mediaTypes: void 0
			});
		},
		onError: (err) => {
			deps.runtime.error?.(`signal debounce flush failed: ${String(err)}`);
		}
	});
	function handleReactionOnlyInbound(params) {
		if (params.hasBodyContent) return false;
		if (params.reaction.isRemove) return true;
		const emojiLabel = params.reaction.emoji?.trim() || "emoji";
		const senderName = params.envelope.sourceName ?? params.senderDisplay;
		logVerbose(`signal reaction: ${emojiLabel} from ${senderName}`);
		const groupId = params.reaction.groupInfo?.groupId ?? void 0;
		const groupName = params.reaction.groupInfo?.groupName ?? void 0;
		const isGroup = Boolean(groupId);
		const reactionAccess = params.resolveAccessDecision(isGroup);
		if (reactionAccess.decision !== "allow") {
			logVerbose(`Blocked signal reaction sender ${params.senderDisplay} (${reactionAccess.reason})`);
			return true;
		}
		const targets = deps.resolveSignalReactionTargets(params.reaction);
		if (!deps.shouldEmitSignalReactionNotification({
			mode: deps.reactionMode,
			account: deps.account,
			targets,
			sender: params.sender,
			allowlist: deps.reactionAllowlist
		})) return true;
		const senderPeerId = resolveSignalPeerId(params.sender);
		const route = resolveSignalInboundRoute({
			cfg: deps.cfg,
			accountId: deps.accountId,
			isGroup,
			groupId,
			senderPeerId
		});
		const groupLabel = isGroup ? `${groupName ?? "Signal Group"} id:${groupId}` : void 0;
		const messageId = params.reaction.targetSentTimestamp ? String(params.reaction.targetSentTimestamp) : "unknown";
		const text = deps.buildSignalReactionSystemEventText({
			emojiLabel,
			actorLabel: senderName,
			messageId,
			targetLabel: targets[0]?.display,
			groupLabel
		});
		const contextKey = [
			"signal",
			"reaction",
			"added",
			messageId,
			formatSignalSenderId(params.sender),
			emojiLabel,
			groupId ?? ""
		].filter(Boolean).join(":");
		enqueueSystemEvent(text, {
			sessionKey: route.sessionKey,
			contextKey
		});
		return true;
	}
	return async (event) => {
		if (event.event !== "receive" || !event.data) return;
		let payload = null;
		try {
			payload = JSON.parse(event.data);
		} catch (err) {
			deps.runtime.error?.(`failed to parse event: ${String(err)}`);
			return;
		}
		if (payload?.exception?.message) deps.runtime.error?.(`receive exception: ${payload.exception.message}`);
		const envelope = payload?.envelope;
		if (!envelope) return;
		const sender = resolveSignalSender(envelope);
		if (!sender) return;
		const normalizedAccount = deps.account ? normalizeE164(deps.account) : void 0;
		if (sender.kind === "phone" && normalizedAccount != null && sender.e164 === normalizedAccount || sender.kind === "uuid" && deps.accountUuid != null && sender.raw === deps.accountUuid) return;
		if ("syncMessage" in envelope) return;
		const dataMessage = envelope.dataMessage ?? envelope.editMessage?.dataMessage;
		const reaction = deps.isSignalReactionMessage(envelope.reactionMessage) ? envelope.reactionMessage : deps.isSignalReactionMessage(dataMessage?.reaction) ? dataMessage?.reaction : null;
		const messageText = renderSignalMentions(dataMessage?.message ?? "", dataMessage?.mentions).trim();
		const quoteText = dataMessage?.quote?.text?.trim() ?? "";
		const hasBodyContent = Boolean(messageText || quoteText) || Boolean(!reaction && dataMessage?.attachments?.length);
		const senderDisplay = formatSignalSenderDisplay(sender);
		const { resolveAccessDecision, dmAccess, effectiveDmAllow, effectiveGroupAllow } = await resolveSignalAccessState({
			accountId: deps.accountId,
			dmPolicy: deps.dmPolicy,
			groupPolicy: deps.groupPolicy,
			allowFrom: deps.allowFrom,
			groupAllowFrom: deps.groupAllowFrom,
			sender
		});
		if (reaction && handleReactionOnlyInbound({
			envelope,
			sender,
			senderDisplay,
			reaction,
			hasBodyContent,
			resolveAccessDecision
		})) return;
		if (!dataMessage) return;
		const senderRecipient = resolveSignalRecipient(sender);
		const senderPeerId = resolveSignalPeerId(sender);
		const senderAllowId = formatSignalSenderId(sender);
		if (!senderRecipient) return;
		const senderIdLine = formatSignalPairingIdLine(sender);
		const groupId = dataMessage.groupInfo?.groupId ?? void 0;
		const groupName = dataMessage.groupInfo?.groupName ?? void 0;
		const isGroup = Boolean(groupId);
		if (!isGroup) {
			if (!await handleSignalDirectMessageAccess({
				dmPolicy: deps.dmPolicy,
				dmAccessDecision: dmAccess.decision,
				senderId: senderAllowId,
				senderIdLine,
				senderDisplay,
				senderName: envelope.sourceName ?? void 0,
				accountId: deps.accountId,
				sendPairingReply: async (text) => {
					await sendMessageSignal(`signal:${senderRecipient}`, text, {
						baseUrl: deps.baseUrl,
						account: deps.account,
						maxBytes: deps.mediaMaxBytes,
						accountId: deps.accountId
					});
				},
				log: logVerbose
			})) return;
		}
		if (isGroup) {
			const groupAccess = resolveAccessDecision(true);
			if (groupAccess.decision !== "allow") {
				if (groupAccess.reasonCode === DM_GROUP_ACCESS_REASON.GROUP_POLICY_DISABLED) logVerbose("Blocked signal group message (groupPolicy: disabled)");
				else if (groupAccess.reasonCode === DM_GROUP_ACCESS_REASON.GROUP_POLICY_EMPTY_ALLOWLIST) logVerbose("Blocked signal group message (groupPolicy: allowlist, no groupAllowFrom)");
				else logVerbose(`Blocked signal group sender ${senderDisplay} (not in groupAllowFrom)`);
				return;
			}
		}
		const useAccessGroups = deps.cfg.commands?.useAccessGroups !== false;
		const commandDmAllow = isGroup ? deps.allowFrom : effectiveDmAllow;
		const ownerAllowedForCommands = isSignalSenderAllowed(sender, commandDmAllow);
		const groupAllowedForCommands = isSignalSenderAllowed(sender, effectiveGroupAllow);
		const hasControlCommandInMessage = hasControlCommand(messageText, deps.cfg);
		const commandGate = resolveControlCommandGate({
			useAccessGroups,
			authorizers: [{
				configured: commandDmAllow.length > 0,
				allowed: ownerAllowedForCommands
			}, {
				configured: effectiveGroupAllow.length > 0,
				allowed: groupAllowedForCommands
			}],
			allowTextCommands: true,
			hasControlCommand: hasControlCommandInMessage
		});
		const commandAuthorized = commandGate.commandAuthorized;
		if (isGroup && commandGate.shouldBlock) {
			logInboundDrop({
				log: logVerbose,
				channel: "signal",
				reason: "control command (unauthorized)",
				target: senderDisplay
			});
			return;
		}
		const route = resolveSignalInboundRoute({
			cfg: deps.cfg,
			accountId: deps.accountId,
			isGroup,
			groupId,
			senderPeerId
		});
		const mentionRegexes = buildMentionRegexes(deps.cfg, route.agentId);
		const wasMentioned = isGroup && matchesMentionPatterns(messageText, mentionRegexes);
		const requireMention = isGroup && resolveChannelGroupRequireMention({
			cfg: deps.cfg,
			channel: "signal",
			groupId,
			accountId: deps.accountId
		});
		const canDetectMention = mentionRegexes.length > 0;
		const mentionGate = resolveMentionGatingWithBypass({
			isGroup,
			requireMention: Boolean(requireMention),
			canDetectMention,
			wasMentioned,
			implicitMention: false,
			hasAnyMention: false,
			allowTextCommands: true,
			hasControlCommand: hasControlCommandInMessage,
			commandAuthorized
		});
		const effectiveWasMentioned = mentionGate.effectiveWasMentioned;
		if (isGroup && requireMention && canDetectMention && mentionGate.shouldSkip) {
			logInboundDrop({
				log: logVerbose,
				channel: "signal",
				reason: "no mention",
				target: senderDisplay
			});
			const quoteText = dataMessage.quote?.text?.trim() || "";
			const pendingPlaceholder = (() => {
				if (!dataMessage.attachments?.length) return "";
				if (deps.ignoreAttachments) return "<media:attachment>";
				const attachmentTypes = (dataMessage.attachments ?? []).map((attachment) => typeof attachment?.contentType === "string" ? attachment.contentType : void 0);
				if (attachmentTypes.length > 1) return formatAttachmentSummaryPlaceholder(attachmentTypes);
				const firstContentType = dataMessage.attachments?.[0]?.contentType;
				const pendingKind = kindFromMime(firstContentType ?? void 0);
				return pendingKind ? `<media:${pendingKind}>` : "<media:attachment>";
			})();
			const pendingBodyText = messageText || pendingPlaceholder || quoteText;
			const historyKey = groupId ?? "unknown";
			recordPendingHistoryEntryIfEnabled({
				historyMap: deps.groupHistories,
				historyKey,
				limit: deps.historyLimit,
				entry: {
					sender: envelope.sourceName ?? senderDisplay,
					body: pendingBodyText,
					timestamp: envelope.timestamp ?? void 0,
					messageId: typeof envelope.timestamp === "number" ? String(envelope.timestamp) : void 0
				}
			});
			return;
		}
		let mediaPath;
		let mediaType;
		const mediaPaths = [];
		const mediaTypes = [];
		let placeholder = "";
		const attachments = dataMessage.attachments ?? [];
		if (!deps.ignoreAttachments) for (const attachment of attachments) {
			if (!attachment?.id) continue;
			try {
				const fetched = await deps.fetchAttachment({
					baseUrl: deps.baseUrl,
					account: deps.account,
					attachment,
					sender: senderRecipient,
					groupId,
					maxBytes: deps.mediaMaxBytes
				});
				if (fetched) {
					mediaPaths.push(fetched.path);
					mediaTypes.push(fetched.contentType ?? attachment.contentType ?? "application/octet-stream");
					if (!mediaPath) {
						mediaPath = fetched.path;
						mediaType = fetched.contentType ?? attachment.contentType ?? void 0;
					}
				}
			} catch (err) {
				deps.runtime.error?.(danger(`attachment fetch failed: ${String(err)}`));
			}
		}
		if (mediaPaths.length > 1) placeholder = formatAttachmentSummaryPlaceholder(mediaTypes);
		else {
			const kind = kindFromMime(mediaType ?? void 0);
			if (kind) placeholder = `<media:${kind}>`;
			else if (attachments.length) placeholder = "<media:attachment>";
		}
		const bodyText = messageText || placeholder || dataMessage.quote?.text?.trim() || "";
		if (!bodyText) return;
		const receiptTimestamp = typeof envelope.timestamp === "number" ? envelope.timestamp : typeof dataMessage.timestamp === "number" ? dataMessage.timestamp : void 0;
		if (deps.sendReadReceipts && !deps.readReceiptsViaDaemon && !isGroup && receiptTimestamp) try {
			await sendReadReceiptSignal(`signal:${senderRecipient}`, receiptTimestamp, {
				baseUrl: deps.baseUrl,
				account: deps.account,
				accountId: deps.accountId
			});
		} catch (err) {
			logVerbose(`signal read receipt failed for ${senderDisplay}: ${String(err)}`);
		}
		else if (deps.sendReadReceipts && !deps.readReceiptsViaDaemon && !isGroup && !receiptTimestamp) logVerbose(`signal read receipt skipped (missing timestamp) for ${senderDisplay}`);
		const senderName = envelope.sourceName ?? senderDisplay;
		const messageId = typeof envelope.timestamp === "number" ? String(envelope.timestamp) : void 0;
		await inboundDebouncer.enqueue({
			senderName,
			senderDisplay,
			senderRecipient,
			senderPeerId,
			groupId,
			groupName,
			isGroup,
			bodyText,
			commandBody: messageText,
			timestamp: envelope.timestamp ?? void 0,
			messageId,
			mediaPath,
			mediaType,
			mediaPaths: mediaPaths.length > 0 ? mediaPaths : void 0,
			mediaTypes: mediaTypes.length > 0 ? mediaTypes : void 0,
			commandAuthorized,
			wasMentioned: effectiveWasMentioned
		});
	};
}
//#endregion
//#region extensions/signal/src/sse-reconnect.ts
const DEFAULT_RECONNECT_POLICY = {
	initialMs: 1e3,
	maxMs: 1e4,
	factor: 2,
	jitter: .2
};
async function runSignalSseLoop({ baseUrl, account, abortSignal, runtime, onEvent, policy }) {
	const reconnectPolicy = {
		...DEFAULT_RECONNECT_POLICY,
		...policy
	};
	let reconnectAttempts = 0;
	const logReconnectVerbose = (message) => {
		if (!shouldLogVerbose()) return;
		logVerbose(message);
	};
	while (!abortSignal?.aborted) try {
		await streamSignalEvents({
			baseUrl,
			account,
			abortSignal,
			onEvent: (event) => {
				reconnectAttempts = 0;
				onEvent(event);
			}
		});
		if (abortSignal?.aborted) return;
		reconnectAttempts += 1;
		const delayMs = computeBackoff(reconnectPolicy, reconnectAttempts);
		logReconnectVerbose(`Signal SSE stream ended, reconnecting in ${delayMs / 1e3}s...`);
		await sleepWithAbort(delayMs, abortSignal);
	} catch (err) {
		if (abortSignal?.aborted) return;
		runtime.error?.(`Signal SSE stream error: ${String(err)}`);
		reconnectAttempts += 1;
		const delayMs = computeBackoff(reconnectPolicy, reconnectAttempts);
		runtime.log?.(`Signal SSE connection lost, reconnecting in ${delayMs / 1e3}s...`);
		try {
			await sleepWithAbort(delayMs, abortSignal);
		} catch (sleepErr) {
			if (abortSignal?.aborted) return;
			throw sleepErr;
		}
	}
}
//#endregion
//#region extensions/signal/src/monitor.ts
function resolveRuntime(opts) {
	return opts.runtime ?? createNonExitingRuntime();
}
function mergeAbortSignals(a, b) {
	if (!a && !b) return {
		signal: void 0,
		dispose: () => {}
	};
	if (!a) return {
		signal: b,
		dispose: () => {}
	};
	if (!b) return {
		signal: a,
		dispose: () => {}
	};
	const controller = new AbortController();
	const abortFrom = (source) => {
		if (!controller.signal.aborted) controller.abort(source.reason);
	};
	if (a.aborted) {
		abortFrom(a);
		return {
			signal: controller.signal,
			dispose: () => {}
		};
	}
	if (b.aborted) {
		abortFrom(b);
		return {
			signal: controller.signal,
			dispose: () => {}
		};
	}
	const onAbortA = () => abortFrom(a);
	const onAbortB = () => abortFrom(b);
	a.addEventListener("abort", onAbortA, { once: true });
	b.addEventListener("abort", onAbortB, { once: true });
	return {
		signal: controller.signal,
		dispose: () => {
			a.removeEventListener("abort", onAbortA);
			b.removeEventListener("abort", onAbortB);
		}
	};
}
function createSignalDaemonLifecycle(params) {
	let daemonHandle = null;
	let daemonStopRequested = false;
	let daemonExitError;
	const daemonAbortController = new AbortController();
	const mergedAbort = mergeAbortSignals(params.abortSignal, daemonAbortController.signal);
	const stop = () => {
		daemonStopRequested = true;
		daemonHandle?.stop();
	};
	const attach = (handle) => {
		daemonHandle = handle;
		handle.exited.then((exit) => {
			if (daemonStopRequested || params.abortSignal?.aborted) return;
			daemonExitError = new Error(formatSignalDaemonExit(exit));
			if (!daemonAbortController.signal.aborted) daemonAbortController.abort(daemonExitError);
		});
	};
	const getExitError = () => daemonExitError;
	return {
		attach,
		stop,
		getExitError,
		abortSignal: mergedAbort.signal,
		dispose: mergedAbort.dispose
	};
}
function normalizeAllowList(raw) {
	return normalizeStringEntries(raw);
}
function resolveSignalReactionTargets(reaction) {
	const targets = [];
	const uuid = reaction.targetAuthorUuid?.trim();
	if (uuid) targets.push({
		kind: "uuid",
		id: uuid,
		display: `uuid:${uuid}`
	});
	const author = reaction.targetAuthor?.trim();
	if (author) {
		const normalized = normalizeE164(author);
		targets.push({
			kind: "phone",
			id: normalized,
			display: normalized
		});
	}
	return targets;
}
function isSignalReactionMessage(reaction) {
	if (!reaction) return false;
	const emoji = reaction.emoji?.trim();
	const timestamp = reaction.targetSentTimestamp;
	const hasTarget = Boolean(reaction.targetAuthor?.trim() || reaction.targetAuthorUuid?.trim());
	return Boolean(emoji && typeof timestamp === "number" && timestamp > 0 && hasTarget);
}
function shouldEmitSignalReactionNotification(params) {
	const { mode, account, targets, sender, allowlist } = params;
	const effectiveMode = mode ?? "own";
	if (effectiveMode === "off") return false;
	if (effectiveMode === "own") {
		const accountId = account?.trim();
		if (!accountId || !targets || targets.length === 0) return false;
		const normalizedAccount = normalizeE164(accountId);
		return targets.some((target) => {
			if (target.kind === "uuid") return accountId === target.id || accountId === `uuid:${target.id}`;
			return normalizedAccount === target.id;
		});
	}
	if (effectiveMode === "allowlist") {
		if (!sender || !allowlist || allowlist.length === 0) return false;
		return isSignalSenderAllowed(sender, allowlist);
	}
	return true;
}
function buildSignalReactionSystemEventText(params) {
	const base = `Signal reaction added: ${params.emojiLabel} by ${params.actorLabel} msg ${params.messageId}`;
	const withTarget = params.targetLabel ? `${base} from ${params.targetLabel}` : base;
	return params.groupLabel ? `${withTarget} in ${params.groupLabel}` : withTarget;
}
async function waitForSignalDaemonReady(params) {
	await (params.waitForTransportReadyFn ?? waitForTransportReady)({
		label: "signal daemon",
		timeoutMs: params.timeoutMs,
		logAfterMs: params.logAfterMs,
		logIntervalMs: params.logIntervalMs,
		pollIntervalMs: 150,
		abortSignal: params.abortSignal,
		runtime: params.runtime,
		check: async () => {
			const res = await signalCheck(params.baseUrl, 1e3);
			if (res.ok) return { ok: true };
			return {
				ok: false,
				error: res.error ?? (res.status ? `HTTP ${res.status}` : "unreachable")
			};
		}
	});
}
async function fetchAttachment(params) {
	const { attachment } = params;
	if (!attachment?.id) return null;
	if (attachment.size && attachment.size > params.maxBytes) throw new Error(`Signal attachment ${attachment.id} exceeds ${(params.maxBytes / (1024 * 1024)).toFixed(0)}MB limit`);
	const rpcParams = { id: attachment.id };
	if (params.account) rpcParams.account = params.account;
	if (params.groupId) rpcParams.groupId = params.groupId;
	else if (params.sender) rpcParams.recipient = params.sender;
	else return null;
	const result = await signalRpcRequest("getAttachment", rpcParams, { baseUrl: params.baseUrl });
	if (!result?.data) return null;
	const saved = await saveMediaBuffer(Buffer.from(result.data, "base64"), attachment.contentType ?? void 0, "inbound", params.maxBytes);
	return {
		path: saved.path,
		contentType: saved.contentType
	};
}
async function deliverReplies(params) {
	const { replies, target, baseUrl, account, accountId, runtime, maxBytes, textLimit, chunkMode } = params;
	for (const payload of replies) if (await deliverTextOrMediaReply({
		payload,
		text: resolveSendableOutboundReplyParts(payload).text,
		chunkText: (value) => chunkTextWithMode(value, textLimit, chunkMode),
		sendText: async (chunk) => {
			await sendMessageSignal(target, chunk, {
				baseUrl,
				account,
				maxBytes,
				accountId
			});
		},
		sendMedia: async ({ mediaUrl, caption }) => {
			await sendMessageSignal(target, caption ?? "", {
				baseUrl,
				account,
				mediaUrl,
				maxBytes,
				accountId
			});
		}
	}) !== "empty") runtime.log?.(`delivered reply to ${target}`);
}
async function monitorSignalProvider(opts = {}) {
	const runtime = resolveRuntime(opts);
	const cfg = opts.config ?? loadConfig();
	const accountInfo = resolveSignalAccount({
		cfg,
		accountId: opts.accountId
	});
	const historyLimit = Math.max(0, accountInfo.config.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? 50);
	const groupHistories = /* @__PURE__ */ new Map();
	const textLimit = resolveTextChunkLimit(cfg, "signal", accountInfo.accountId);
	const chunkMode = resolveChunkMode(cfg, "signal", accountInfo.accountId);
	const baseUrl = opts.baseUrl?.trim() || accountInfo.baseUrl;
	const account = opts.account?.trim() || accountInfo.config.account?.trim();
	const dmPolicy = accountInfo.config.dmPolicy ?? "pairing";
	const allowFrom = normalizeAllowList(opts.allowFrom ?? accountInfo.config.allowFrom);
	const groupAllowFrom = normalizeAllowList(opts.groupAllowFrom ?? accountInfo.config.groupAllowFrom ?? (accountInfo.config.allowFrom && accountInfo.config.allowFrom.length > 0 ? accountInfo.config.allowFrom : []));
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveAllowlistProviderRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.signal !== void 0,
		groupPolicy: accountInfo.config.groupPolicy,
		defaultGroupPolicy
	});
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "signal",
		accountId: accountInfo.accountId,
		log: (message) => runtime.log?.(message)
	});
	const reactionMode = accountInfo.config.reactionNotifications ?? "own";
	const reactionAllowlist = normalizeAllowList(accountInfo.config.reactionAllowlist);
	const mediaMaxBytes = (opts.mediaMaxMb ?? accountInfo.config.mediaMaxMb ?? 8) * 1024 * 1024;
	const ignoreAttachments = opts.ignoreAttachments ?? accountInfo.config.ignoreAttachments ?? false;
	const sendReadReceipts = Boolean(opts.sendReadReceipts ?? accountInfo.config.sendReadReceipts);
	const waitForTransportReadyFn = opts.waitForTransportReady ?? waitForTransportReady;
	const autoStart = opts.autoStart ?? accountInfo.config.autoStart ?? !accountInfo.config.httpUrl;
	const startupTimeoutMs = Math.min(12e4, Math.max(1e3, opts.startupTimeoutMs ?? accountInfo.config.startupTimeoutMs ?? 3e4));
	const readReceiptsViaDaemon = Boolean(autoStart && sendReadReceipts);
	const daemonLifecycle = createSignalDaemonLifecycle({ abortSignal: opts.abortSignal });
	let daemonHandle = null;
	if (autoStart) {
		daemonHandle = spawnSignalDaemon({
			cliPath: opts.cliPath ?? accountInfo.config.cliPath ?? "signal-cli",
			account,
			httpHost: opts.httpHost ?? accountInfo.config.httpHost ?? "127.0.0.1",
			httpPort: opts.httpPort ?? accountInfo.config.httpPort ?? 8080,
			receiveMode: opts.receiveMode ?? accountInfo.config.receiveMode,
			ignoreAttachments: opts.ignoreAttachments ?? accountInfo.config.ignoreAttachments,
			ignoreStories: opts.ignoreStories ?? accountInfo.config.ignoreStories,
			sendReadReceipts,
			runtime
		});
		daemonLifecycle.attach(daemonHandle);
	}
	const onAbort = () => {
		daemonLifecycle.stop();
	};
	opts.abortSignal?.addEventListener("abort", onAbort, { once: true });
	try {
		if (daemonHandle) {
			await waitForSignalDaemonReady({
				baseUrl,
				abortSignal: daemonLifecycle.abortSignal,
				timeoutMs: startupTimeoutMs,
				logAfterMs: 1e4,
				logIntervalMs: 1e4,
				runtime,
				waitForTransportReadyFn
			});
			const daemonExitError = daemonLifecycle.getExitError();
			if (daemonExitError) throw daemonExitError;
		}
		const handleEvent = createSignalEventHandler({
			runtime,
			cfg,
			baseUrl,
			account,
			accountUuid: accountInfo.config.accountUuid,
			accountId: accountInfo.accountId,
			blockStreaming: accountInfo.config.blockStreaming,
			historyLimit,
			groupHistories,
			textLimit,
			dmPolicy,
			allowFrom,
			groupAllowFrom,
			groupPolicy,
			reactionMode,
			reactionAllowlist,
			mediaMaxBytes,
			ignoreAttachments,
			sendReadReceipts,
			readReceiptsViaDaemon,
			fetchAttachment,
			deliverReplies: (params) => deliverReplies({
				...params,
				chunkMode
			}),
			resolveSignalReactionTargets,
			isSignalReactionMessage,
			shouldEmitSignalReactionNotification,
			buildSignalReactionSystemEventText
		});
		await runSignalSseLoop({
			baseUrl,
			account,
			abortSignal: daemonLifecycle.abortSignal,
			runtime,
			policy: opts.reconnectPolicy,
			onEvent: (event) => {
				handleEvent(event).catch((err) => {
					runtime.error?.(`event handler failed: ${String(err)}`);
				});
			}
		});
		const daemonExitError = daemonLifecycle.getExitError();
		if (daemonExitError) throw daemonExitError;
	} catch (err) {
		const daemonExitError = daemonLifecycle.getExitError();
		if (opts.abortSignal?.aborted && !daemonExitError) return;
		throw err;
	} finally {
		daemonLifecycle.dispose();
		opts.abortSignal?.removeEventListener("abort", onAbort);
		daemonLifecycle.stop();
	}
}
//#endregion
export { looksLikeSignalTargetId as a, formatSignalSenderDisplay as c, isSignalSenderAllowed as d, looksLikeUuid as f, resolveSignalSender as g, resolveSignalRecipient as h, resolveSignalReactionLevel as i, formatSignalSenderId as l, resolveSignalPeerId as m, probeSignal as n, normalizeSignalMessagingTarget as o, normalizeSignalAllowRecipient as p, signalMessageActions as r, formatSignalPairingIdLine as s, monitorSignalProvider as t, isSignalGroupAllowed as u };
