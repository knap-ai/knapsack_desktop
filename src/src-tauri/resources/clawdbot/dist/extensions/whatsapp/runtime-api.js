import { n as resolveWebCredsBackupPath, r as resolveWebCredsPath, t as hasWebCredsSync } from "./creds-files-BD3Rjqo2.js";
import { n as whatsAppActionRuntime, t as handleWhatsAppAction } from "./action-runtime-lXscyQq5.js";
import { n as sendPollWhatsApp, r as sendReactionWhatsApp, t as sendMessageWhatsApp } from "./send-RylHu2jU.js";
import { startWebLoginWithQr, waitForWebLogin } from "./login-qr-runtime.js";
import { t as createWhatsAppLoginTool } from "./agent-tools-login-BwV6-7My.js";
import { t as resolveWhatsAppHeartbeatRecipients } from "./heartbeat-recipients-DZfPzRUS.js";
import { n as setWhatsAppRuntime } from "./runtime-Cf-gW1xY.js";
import { a as maybeRestoreCredsFromBackup, c as readWebSelfId, d as webAuthExists, i as logoutWeb, l as readWebSelfIdentity, n as getWebAuthAgeMs, o as pickWebChannel, r as logWebSelfId, s as readCredsJsonRaw, t as WA_WEB_AUTH_DIR, u as resolveDefaultWebAuthDir } from "./auth-store-3FRPEigM.js";
import { t as DEFAULT_WEB_MEDIA_BYTES } from "./constants-f5LlBu0G.js";
import "./runtime-api-vb71a5Kp.js";
import { n as resolveWebAccountId, t as getActiveWebListener } from "./active-listener-DvlWD5J-.js";
import { n as getStatusCode, t as formatError } from "./session-errors-CjMYNFqh.js";
import { c as waitForCredsSaveQueue, d as writeCredsJsonAtomically, l as waitForCredsSaveQueueWithTimeout, m as newConnectionId$1, o as createWaSocket, s as newConnectionId, u as waitForWaConnection } from "./connection-controller-ByQ0-fZO.js";
import { S as whatsappHeartbeatLog, _ as resolveSessionKey$1, a as loadWebMedia, b as resolveStorePath$1, c as optimizeImageToPng, d as extractMediaPlaceholder, f as extractText, g as resolveChannelResetConfig, h as loadSessionStore$1, i as getDefaultLocalRoots, l as monitorWebInbox, m as evaluateSessionFreshness, n as monitorWebChannel, o as loadWebMediaRaw, p as resetWebInboundDedupe, r as LocalMediaAccessError, s as optimizeImageToJpeg, t as loginWeb, u as extractLocationData, v as resolveSessionResetPolicy, x as resolveThreadFlag, y as resolveSessionResetType } from "./login-BPCVMYVA.js";
import { normalizeOptionalLowercaseString, redactIdentifier as redactIdentifier$1 } from "openclaw/plugin-sdk/text-runtime";
import { canonicalizeMainSessionAlias, loadConfig as loadConfig$1, loadSessionStore, resolveSessionKey, resolveStorePath, updateSessionStore } from "openclaw/plugin-sdk/config-runtime";
import { getChildLogger as getChildLogger$2 } from "openclaw/plugin-sdk/runtime-env";
import { emitHeartbeatEvent, resolveHeartbeatVisibility, resolveIndicatorType } from "openclaw/plugin-sdk/infra-runtime";
import { normalizeMainKey, normalizeMainKey as normalizeMainKey$1 } from "openclaw/plugin-sdk/routing";
import { DEFAULT_HEARTBEAT_ACK_MAX_CHARS, HEARTBEAT_PROMPT, HEARTBEAT_TOKEN, HEARTBEAT_TOKEN as HEARTBEAT_TOKEN$1, SILENT_REPLY_TOKEN, getReplyFromConfig, resolveHeartbeatPrompt, resolveHeartbeatReplyPayload, stripHeartbeatToken, stripHeartbeatToken as stripHeartbeatToken$1 } from "openclaw/plugin-sdk/reply-runtime";
import { appendCronStyleCurrentTimeLine } from "openclaw/plugin-sdk/agent-runtime";
import { hasOutboundReplyContent, resolveSendableOutboundReplyParts as resolveSendableOutboundReplyParts$1 } from "openclaw/plugin-sdk/reply-payload";
//#region extensions/whatsapp/src/auto-reply/session-snapshot.ts
function getSessionSnapshot(cfg, from, _isHeartbeat = false, ctx) {
	const sessionCfg = cfg.session;
	const scope = sessionCfg?.scope ?? "per-sender";
	const key = ctx?.sessionKey?.trim() ?? resolveSessionKey$1(scope, {
		From: from,
		To: "",
		Body: ""
	}, normalizeMainKey(sessionCfg?.mainKey));
	const entry = loadSessionStore$1(resolveStorePath$1(sessionCfg?.store))[key];
	const isThread = resolveThreadFlag({
		sessionKey: key,
		messageThreadId: ctx?.messageThreadId ?? null,
		threadLabel: ctx?.threadLabel ?? null,
		threadStarterBody: ctx?.threadStarterBody ?? null,
		parentSessionKey: ctx?.parentSessionKey ?? null
	});
	const resetType = resolveSessionResetType({
		sessionKey: key,
		isGroup: ctx?.isGroup,
		isThread
	});
	const resetPolicy = resolveSessionResetPolicy({
		sessionCfg,
		resetType,
		resetOverride: resolveChannelResetConfig({
			sessionCfg,
			channel: entry?.lastChannel ?? entry?.channel
		})
	});
	const now = Date.now();
	const freshness = entry ? evaluateSessionFreshness({
		updatedAt: entry.updatedAt,
		now,
		policy: resetPolicy
	}) : { fresh: false };
	return {
		key,
		entry,
		fresh: freshness.fresh,
		resetPolicy,
		resetType,
		dailyResetAt: freshness.dailyResetAt,
		idleExpiresAt: freshness.idleExpiresAt
	};
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/heartbeat-runner.ts
function resolveDefaultAgentIdFromConfig(cfg) {
	const agents = cfg.agents?.list ?? [];
	return normalizeOptionalLowercaseString(agents.find((agent) => agent?.default)?.id ?? agents[0]?.id ?? "main") ?? "main";
}
async function runWebHeartbeatOnce(opts) {
	const { cfg: cfgOverride, to, verbose = false, sessionId, overrideBody, dryRun = false } = opts;
	const replyResolver = opts.replyResolver ?? getReplyFromConfig;
	const sender = opts.sender ?? sendMessageWhatsApp;
	const runId = newConnectionId$1();
	const redactedTo = redactIdentifier$1(to);
	const heartbeatLogger = getChildLogger$2({
		module: "web-heartbeat",
		runId,
		to: redactedTo
	});
	const cfg = cfgOverride ?? loadConfig$1();
	const visibility = resolveHeartbeatVisibility({
		cfg,
		channel: "whatsapp"
	});
	const heartbeatOkText = HEARTBEAT_TOKEN$1;
	const maybeSendHeartbeatOk = async () => {
		if (!visibility.showOk) return false;
		if (dryRun) {
			whatsappHeartbeatLog.info(`[dry-run] heartbeat ok -> ${redactedTo}`);
			return false;
		}
		const sendResult = await sender(to, heartbeatOkText, { verbose });
		heartbeatLogger.info({
			to: redactedTo,
			messageId: sendResult.messageId,
			chars: heartbeatOkText.length,
			reason: "heartbeat-ok"
		}, "heartbeat ok sent");
		whatsappHeartbeatLog.info(`heartbeat ok sent to ${redactedTo} (id ${sendResult.messageId})`);
		return true;
	};
	const sessionCfg = cfg.session;
	const sessionScope = sessionCfg?.scope ?? "per-sender";
	const mainKey = normalizeMainKey$1(sessionCfg?.mainKey);
	const rawSessionKey = resolveSessionKey(sessionScope, { From: to }, mainKey);
	const sessionKey = canonicalizeMainSessionAlias({
		cfg,
		agentId: resolveDefaultAgentIdFromConfig(cfg),
		sessionKey: rawSessionKey
	});
	if (sessionId) {
		const storePath = resolveStorePath(cfg.session?.store);
		const store = loadSessionStore(storePath);
		const current = store[sessionKey] ?? {};
		store[sessionKey] = {
			...current,
			sessionId,
			updatedAt: Date.now()
		};
		await updateSessionStore(storePath, (nextStore) => {
			nextStore[sessionKey] = {
				...nextStore[sessionKey] ?? current,
				sessionId,
				updatedAt: Date.now()
			};
		});
	}
	const sessionSnapshot = getSessionSnapshot(cfg, to, true, { sessionKey });
	if (verbose) heartbeatLogger.info({
		to: redactedTo,
		sessionKey: sessionSnapshot.key,
		sessionId: sessionId ?? sessionSnapshot.entry?.sessionId ?? null,
		sessionFresh: sessionSnapshot.fresh,
		resetMode: sessionSnapshot.resetPolicy.mode,
		resetAtHour: sessionSnapshot.resetPolicy.atHour,
		idleMinutes: sessionSnapshot.resetPolicy.idleMinutes ?? null,
		dailyResetAt: sessionSnapshot.dailyResetAt ?? null,
		idleExpiresAt: sessionSnapshot.idleExpiresAt ?? null
	}, "heartbeat session snapshot");
	if (overrideBody && overrideBody.trim().length === 0) throw new Error("Override body must be non-empty when provided.");
	try {
		if (overrideBody) {
			if (dryRun) {
				whatsappHeartbeatLog.info(`[dry-run] web send -> ${redactedTo} (${overrideBody.trim().length} chars, manual message)`);
				return;
			}
			const sendResult = await sender(to, overrideBody, { verbose });
			emitHeartbeatEvent({
				status: "sent",
				to,
				preview: overrideBody.slice(0, 160),
				hasMedia: false,
				channel: "whatsapp",
				indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
			});
			heartbeatLogger.info({
				to: redactedTo,
				messageId: sendResult.messageId,
				chars: overrideBody.length,
				reason: "manual-message"
			}, "manual heartbeat message sent");
			whatsappHeartbeatLog.info(`manual heartbeat sent to ${redactedTo} (id ${sendResult.messageId})`);
			return;
		}
		if (!visibility.showAlerts && !visibility.showOk && !visibility.useIndicator) {
			heartbeatLogger.info({
				to: redactedTo,
				reason: "alerts-disabled"
			}, "heartbeat skipped");
			emitHeartbeatEvent({
				status: "skipped",
				to,
				reason: "alerts-disabled",
				channel: "whatsapp"
			});
			return;
		}
		const replyPayload = resolveHeartbeatReplyPayload(await replyResolver({
			Body: appendCronStyleCurrentTimeLine(resolveHeartbeatPrompt(cfg.agents?.defaults?.heartbeat?.prompt), cfg, Date.now()),
			From: to,
			To: to,
			MessageSid: sessionId ?? sessionSnapshot.entry?.sessionId
		}, { isHeartbeat: true }, cfg));
		if (!replyPayload || !hasOutboundReplyContent(replyPayload)) {
			heartbeatLogger.info({
				to: redactedTo,
				reason: "empty-reply",
				sessionId: sessionSnapshot.entry?.sessionId ?? null
			}, "heartbeat skipped");
			emitHeartbeatEvent({
				status: "ok-empty",
				to,
				channel: "whatsapp",
				silent: !await maybeSendHeartbeatOk(),
				indicatorType: visibility.useIndicator ? resolveIndicatorType("ok-empty") : void 0
			});
			return;
		}
		const reply = resolveSendableOutboundReplyParts$1(replyPayload);
		const hasMedia = reply.hasMedia;
		const ackMaxChars = Math.max(0, cfg.agents?.defaults?.heartbeat?.ackMaxChars ?? DEFAULT_HEARTBEAT_ACK_MAX_CHARS);
		const stripped = stripHeartbeatToken$1(replyPayload.text, {
			mode: "heartbeat",
			maxAckChars: ackMaxChars
		});
		if (stripped.shouldSkip && !hasMedia) {
			const storePath = resolveStorePath(cfg.session?.store);
			const store = loadSessionStore(storePath);
			if (sessionSnapshot.entry && store[sessionSnapshot.key]) {
				store[sessionSnapshot.key].updatedAt = sessionSnapshot.entry.updatedAt;
				await updateSessionStore(storePath, (nextStore) => {
					const nextEntry = nextStore[sessionSnapshot.key];
					if (!nextEntry) return;
					nextStore[sessionSnapshot.key] = {
						...nextEntry,
						updatedAt: sessionSnapshot.entry.updatedAt
					};
				});
			}
			heartbeatLogger.info({
				to: redactedTo,
				reason: "heartbeat-token",
				rawLength: replyPayload.text?.length
			}, "heartbeat skipped");
			emitHeartbeatEvent({
				status: "ok-token",
				to,
				channel: "whatsapp",
				silent: !await maybeSendHeartbeatOk(),
				indicatorType: visibility.useIndicator ? resolveIndicatorType("ok-token") : void 0
			});
			return;
		}
		if (hasMedia) heartbeatLogger.warn({ to: redactedTo }, "heartbeat reply contained media; sending text only");
		const finalText = stripped.text || reply.text;
		if (!visibility.showAlerts) {
			heartbeatLogger.info({
				to: redactedTo,
				reason: "alerts-disabled"
			}, "heartbeat skipped");
			emitHeartbeatEvent({
				status: "skipped",
				to,
				reason: "alerts-disabled",
				preview: finalText.slice(0, 200),
				channel: "whatsapp",
				hasMedia,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
			});
			return;
		}
		if (dryRun) {
			heartbeatLogger.info({
				to: redactedTo,
				reason: "dry-run",
				chars: finalText.length
			}, "heartbeat dry-run");
			whatsappHeartbeatLog.info(`[dry-run] heartbeat -> ${redactedTo} (${finalText.length} chars)`);
			return;
		}
		const sendResult = await sender(to, finalText, { verbose });
		emitHeartbeatEvent({
			status: "sent",
			to,
			preview: finalText.slice(0, 160),
			hasMedia,
			channel: "whatsapp",
			indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
		});
		heartbeatLogger.info({
			to: redactedTo,
			messageId: sendResult.messageId,
			chars: finalText.length
		}, "heartbeat sent");
		whatsappHeartbeatLog.info(`heartbeat alert sent to ${redactedTo}`);
	} catch (err) {
		const reason = formatError(err);
		heartbeatLogger.warn({
			to: redactedTo,
			error: reason
		}, "heartbeat failed");
		whatsappHeartbeatLog.warn(`heartbeat failed (${reason})`);
		emitHeartbeatEvent({
			status: "failed",
			to,
			reason,
			channel: "whatsapp",
			indicatorType: visibility.useIndicator ? resolveIndicatorType("failed") : void 0
		});
		throw err;
	}
}
function resolveHeartbeatRecipients(cfg, opts = {}) {
	return resolveWhatsAppHeartbeatRecipients(cfg, opts);
}
//#endregion
export { DEFAULT_WEB_MEDIA_BYTES, HEARTBEAT_PROMPT, HEARTBEAT_TOKEN, LocalMediaAccessError, SILENT_REPLY_TOKEN, WA_WEB_AUTH_DIR, createWaSocket, createWhatsAppLoginTool, extractLocationData, extractMediaPlaceholder, extractText, formatError, getActiveWebListener, getDefaultLocalRoots, getStatusCode, getWebAuthAgeMs, handleWhatsAppAction, hasWebCredsSync, loadWebMedia, loadWebMediaRaw, logWebSelfId, loginWeb, logoutWeb, maybeRestoreCredsFromBackup, monitorWebChannel, monitorWebInbox, newConnectionId, optimizeImageToJpeg, optimizeImageToPng, pickWebChannel, readCredsJsonRaw, readWebSelfId, readWebSelfIdentity, resetWebInboundDedupe, resolveDefaultWebAuthDir, resolveHeartbeatRecipients, resolveWebAccountId, resolveWebCredsBackupPath, resolveWebCredsPath, runWebHeartbeatOnce, sendMessageWhatsApp, sendPollWhatsApp, sendReactionWhatsApp, setWhatsAppRuntime, startWebLoginWithQr, stripHeartbeatToken, waitForCredsSaveQueue, waitForCredsSaveQueueWithTimeout, waitForWaConnection, waitForWebLogin, webAuthExists, whatsAppActionRuntime, writeCredsJsonAtomically };
