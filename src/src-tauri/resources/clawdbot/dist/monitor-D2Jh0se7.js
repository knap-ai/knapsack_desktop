import { i as deliverTextOrMediaReply, p as resolveSendableOutboundReplyParts } from "./reply-payload-Db_8BQiX.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, r as resolveDefaultGroupPolicy } from "./runtime-group-policy-B7-UthCu.js";
import { r as logTypingFailure } from "./logging-BRNZxone.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-DHFpjrzi.js";
import { n as createChannelPairingController } from "./channel-pairing-DMzs787S.js";
import { n as resolveWebhookPath } from "./webhook-path-K1OULEo3.js";
import { t as waitForAbortSignal } from "./abort-signal-DrCDGoNC.js";
import { r as resolveInboundRouteEnvelopeBuilderWithRuntime } from "./inbound-envelope-DEcn47BC.js";
import { i as resolveDirectDmAuthorizationOutcome, o as resolveSenderCommandAuthorizationWithRuntime } from "./command-auth-Da7bqm4r.js";
import { n as isZaloSenderAllowed, t as evaluateZaloGroupAccess } from "./group-access-B5K73xaw.js";
import { t as getZaloRuntime } from "./runtime-api-BdOCWE1N.js";
import { a as getUpdates, c as sendMessage, l as sendPhoto, n as ZaloApiError, o as getWebhookInfo, r as deleteWebhook, s as sendChatAction, t as resolveZaloProxyFetch, u as setWebhook } from "./proxy-nxZa0Q2l.js";
//#region extensions/zalo/src/monitor.ts
const ZALO_TEXT_LIMIT = 2e3;
const DEFAULT_MEDIA_MAX_MB = 5;
const WEBHOOK_CLEANUP_TIMEOUT_MS = 5e3;
const ZALO_TYPING_TIMEOUT_MS = 5e3;
function formatZaloError(error) {
	if (error instanceof Error) return error.stack ?? `${error.name}: ${error.message}`;
	return String(error);
}
function describeWebhookTarget(rawUrl) {
	try {
		const parsed = new URL(rawUrl);
		return `${parsed.origin}${parsed.pathname}`;
	} catch {
		return rawUrl;
	}
}
function normalizeWebhookUrl(url) {
	const trimmed = url?.trim();
	return trimmed ? trimmed : void 0;
}
function logVerbose(core, runtime, message) {
	if (core.logging.shouldLogVerbose()) runtime.log?.(`[zalo] ${message}`);
}
async function handleZaloWebhookRequest(req, res) {
	const { handleZaloWebhookRequest: handleZaloWebhookRequestInternal } = await import("./monitor.webhook-CR996P_c.js");
	return await handleZaloWebhookRequestInternal(req, res, async ({ update, target }) => {
		await processUpdate({
			update,
			token: target.token,
			account: target.account,
			config: target.config,
			runtime: target.runtime,
			core: target.core,
			mediaMaxMb: target.mediaMaxMb,
			statusSink: target.statusSink,
			fetcher: target.fetcher
		});
	});
}
function startPollingLoop(params) {
	const { token, account, config, runtime, core, abortSignal, isStopped, mediaMaxMb, statusSink, fetcher } = params;
	const pollTimeout = 30;
	const processingContext = {
		token,
		account,
		config,
		runtime,
		core,
		mediaMaxMb,
		statusSink,
		fetcher
	};
	runtime.log?.(`[${account.accountId}] Zalo polling loop started timeout=${String(pollTimeout)}s`);
	const poll = async () => {
		if (isStopped() || abortSignal.aborted) return;
		try {
			const response = await getUpdates(token, { timeout: pollTimeout }, fetcher);
			if (response.ok && response.result) {
				statusSink?.({ lastInboundAt: Date.now() });
				await processUpdate({
					update: response.result,
					...processingContext
				});
			}
		} catch (err) {
			if (err instanceof ZaloApiError && err.isPollingTimeout) {} else if (!isStopped() && !abortSignal.aborted) {
				runtime.error?.(`[${account.accountId}] Zalo polling error: ${formatZaloError(err)}`);
				await new Promise((resolve) => setTimeout(resolve, 5e3));
			}
		}
		if (!isStopped() && !abortSignal.aborted) setImmediate(poll);
	};
	poll();
}
async function processUpdate(params) {
	const { update, token, account, config, runtime, core, mediaMaxMb, statusSink, fetcher } = params;
	const { event_name, message } = update;
	const sharedContext = {
		token,
		account,
		config,
		runtime,
		core,
		statusSink,
		fetcher
	};
	if (!message) return;
	switch (event_name) {
		case "message.text.received":
			await handleTextMessage({
				message,
				...sharedContext
			});
			break;
		case "message.image.received":
			await handleImageMessage({
				message,
				...sharedContext,
				mediaMaxMb
			});
			break;
		case "message.sticker.received":
			logVerbose(core, runtime, `[${account.accountId}] Received sticker from ${message.from.id}`);
			break;
		case "message.unsupported.received":
			logVerbose(core, runtime, `[${account.accountId}] Received unsupported message type from ${message.from.id}`);
			break;
	}
}
async function handleTextMessage(params) {
	const { message } = params;
	const { text } = message;
	if (!text?.trim()) return;
	await processMessageWithPipeline({
		...params,
		text,
		mediaPath: void 0,
		mediaType: void 0
	});
}
async function handleImageMessage(params) {
	const { message, mediaMaxMb, account, core, runtime } = params;
	const { photo_url, caption } = message;
	const authorization = await authorizeZaloMessage({
		...params,
		text: caption,
		mediaPath: photo_url ? "__pending_media__" : void 0,
		mediaType: void 0
	});
	if (!authorization) return;
	let mediaPath;
	let mediaType;
	if (photo_url) try {
		const maxBytes = mediaMaxMb * 1024 * 1024;
		const fetched = await core.channel.media.fetchRemoteMedia({
			url: photo_url,
			maxBytes
		});
		const saved = await core.channel.media.saveMediaBuffer(fetched.buffer, fetched.contentType, "inbound", maxBytes);
		mediaPath = saved.path;
		mediaType = saved.contentType;
	} catch (err) {
		runtime.error?.(`[${account.accountId}] Failed to download Zalo image: ${String(err)}`);
	}
	await processMessageWithPipeline({
		...params,
		authorization,
		text: caption,
		mediaPath,
		mediaType
	});
}
async function authorizeZaloMessage(params) {
	const { message, account, config, runtime, core, text, mediaPath, token, statusSink, fetcher } = params;
	const pairing = createChannelPairingController({
		core,
		channel: "zalo",
		accountId: account.accountId
	});
	const { from, chat } = message;
	const isGroup = chat.chat_type === "GROUP";
	const chatId = chat.id;
	const senderId = from.id;
	const senderName = from.display_name ?? from.name;
	const dmPolicy = account.config.dmPolicy ?? "pairing";
	const configAllowFrom = (account.config.allowFrom ?? []).map((v) => String(v));
	const configuredGroupAllowFrom = (account.config.groupAllowFrom ?? []).map((v) => String(v));
	const groupAllowFrom = configuredGroupAllowFrom.length > 0 ? configuredGroupAllowFrom : configAllowFrom;
	const defaultGroupPolicy = resolveDefaultGroupPolicy(config);
	const groupAccess = isGroup ? evaluateZaloGroupAccess({
		providerConfigPresent: config.channels?.zalo !== void 0,
		configuredGroupPolicy: account.config.groupPolicy,
		defaultGroupPolicy,
		groupAllowFrom,
		senderId
	}) : void 0;
	if (groupAccess) {
		warnMissingProviderGroupPolicyFallbackOnce({
			providerMissingFallbackApplied: groupAccess.providerMissingFallbackApplied,
			providerKey: "zalo",
			accountId: account.accountId,
			log: (message) => logVerbose(core, runtime, message)
		});
		if (!groupAccess.allowed) {
			if (groupAccess.reason === "disabled") logVerbose(core, runtime, `zalo: drop group ${chatId} (groupPolicy=disabled)`);
			else if (groupAccess.reason === "empty_allowlist") logVerbose(core, runtime, `zalo: drop group ${chatId} (groupPolicy=allowlist, no groupAllowFrom)`);
			else if (groupAccess.reason === "sender_not_allowlisted") logVerbose(core, runtime, `zalo: drop group sender ${senderId} (groupPolicy=allowlist)`);
			return;
		}
	}
	const rawBody = text?.trim() || (mediaPath ? "<media:image>" : "");
	const { senderAllowedForCommands, commandAuthorized } = await resolveSenderCommandAuthorizationWithRuntime({
		cfg: config,
		rawBody,
		isGroup,
		dmPolicy,
		configuredAllowFrom: configAllowFrom,
		configuredGroupAllowFrom: groupAllowFrom,
		senderId,
		isSenderAllowed: isZaloSenderAllowed,
		readAllowFromStore: pairing.readAllowFromStore,
		runtime: core.channel.commands
	});
	const directDmOutcome = resolveDirectDmAuthorizationOutcome({
		isGroup,
		dmPolicy,
		senderAllowedForCommands
	});
	if (directDmOutcome === "disabled") {
		logVerbose(core, runtime, `Blocked zalo DM from ${senderId} (dmPolicy=disabled)`);
		return;
	}
	if (directDmOutcome === "unauthorized") {
		if (dmPolicy === "pairing") await pairing.issueChallenge({
			senderId,
			senderIdLine: `Your Zalo user id: ${senderId}`,
			meta: { name: senderName ?? void 0 },
			onCreated: () => {
				logVerbose(core, runtime, `zalo pairing request sender=${senderId}`);
			},
			sendPairingReply: async (text) => {
				await sendMessage(token, {
					chat_id: chatId,
					text
				}, fetcher);
				statusSink?.({ lastOutboundAt: Date.now() });
			},
			onReplyError: (err) => {
				logVerbose(core, runtime, `zalo pairing reply failed for ${senderId}: ${String(err)}`);
			}
		});
		else logVerbose(core, runtime, `Blocked unauthorized zalo sender ${senderId} (dmPolicy=${dmPolicy})`);
		return;
	}
	return {
		chatId,
		commandAuthorized,
		isGroup,
		rawBody,
		senderId,
		senderName
	};
}
async function processMessageWithPipeline(params) {
	const { message, token, account, config, runtime, core, mediaPath, mediaType, statusSink, fetcher, authorization: authorizationOverride } = params;
	const { message_id, date } = message;
	const authorization = authorizationOverride ?? await authorizeZaloMessage({
		...params,
		mediaPath,
		mediaType
	});
	if (!authorization) return;
	const { isGroup, chatId, senderId, senderName, rawBody, commandAuthorized } = authorization;
	const { route, buildEnvelope } = resolveInboundRouteEnvelopeBuilderWithRuntime({
		cfg: config,
		channel: "zalo",
		accountId: account.accountId,
		peer: {
			kind: isGroup ? "group" : "direct",
			id: chatId
		},
		runtime: core.channel,
		sessionStore: config.session?.store
	});
	if (isGroup && core.channel.commands.isControlCommandMessage(rawBody, config) && commandAuthorized !== true) {
		logVerbose(core, runtime, `zalo: drop control command from unauthorized sender ${senderId}`);
		return;
	}
	const fromLabel = isGroup ? `group:${chatId}` : senderName || `user:${senderId}`;
	const { storePath, body } = buildEnvelope({
		channel: "Zalo",
		from: fromLabel,
		timestamp: date ? date * 1e3 : void 0,
		body: rawBody
	});
	const ctxPayload = core.channel.reply.finalizeInboundContext({
		Body: body,
		BodyForAgent: rawBody,
		RawBody: rawBody,
		CommandBody: rawBody,
		From: isGroup ? `zalo:group:${chatId}` : `zalo:${senderId}`,
		To: `zalo:${chatId}`,
		SessionKey: route.sessionKey,
		AccountId: route.accountId,
		ChatType: isGroup ? "group" : "direct",
		ConversationLabel: fromLabel,
		SenderName: senderName || void 0,
		SenderId: senderId,
		CommandAuthorized: commandAuthorized,
		Provider: "zalo",
		Surface: "zalo",
		MessageSid: message_id,
		MediaPath: mediaPath,
		MediaType: mediaType,
		MediaUrl: mediaPath,
		OriginatingChannel: "zalo",
		OriginatingTo: `zalo:${chatId}`
	});
	await core.channel.session.recordInboundSession({
		storePath,
		sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
		ctx: ctxPayload,
		onRecordError: (err) => {
			runtime.error?.(`zalo: failed updating session meta: ${String(err)}`);
		}
	});
	const tableMode = core.channel.text.resolveMarkdownTableMode({
		cfg: config,
		channel: "zalo",
		accountId: account.accountId
	});
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg: config,
		agentId: route.agentId,
		channel: "zalo",
		accountId: account.accountId,
		typing: {
			start: async () => {
				await sendChatAction(token, {
					chat_id: chatId,
					action: "typing"
				}, fetcher, ZALO_TYPING_TIMEOUT_MS);
			},
			onStartError: (err) => {
				logTypingFailure({
					log: (message) => logVerbose(core, runtime, message),
					channel: "zalo",
					action: "start",
					target: chatId,
					error: err
				});
			}
		}
	});
	await core.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
		ctx: ctxPayload,
		cfg: config,
		dispatcherOptions: {
			...replyPipeline,
			deliver: async (payload) => {
				await deliverZaloReply({
					payload,
					token,
					chatId,
					runtime,
					core,
					config,
					accountId: account.accountId,
					statusSink,
					fetcher,
					tableMode
				});
			},
			onError: (err, info) => {
				runtime.error?.(`[${account.accountId}] Zalo ${info.kind} reply failed: ${String(err)}`);
			}
		},
		replyOptions: { onModelSelected }
	});
}
async function deliverZaloReply(params) {
	const { payload, token, chatId, runtime, core, config, accountId, statusSink, fetcher } = params;
	const tableMode = params.tableMode ?? "code";
	const reply = resolveSendableOutboundReplyParts(payload, { text: core.channel.text.convertMarkdownTables(payload.text ?? "", tableMode) });
	const chunkMode = core.channel.text.resolveChunkMode(config, "zalo", accountId);
	await deliverTextOrMediaReply({
		payload,
		text: reply.text,
		chunkText: (value) => core.channel.text.chunkMarkdownTextWithMode(value, ZALO_TEXT_LIMIT, chunkMode),
		sendText: async (chunk) => {
			try {
				await sendMessage(token, {
					chat_id: chatId,
					text: chunk
				}, fetcher);
				statusSink?.({ lastOutboundAt: Date.now() });
			} catch (err) {
				runtime.error?.(`Zalo message send failed: ${String(err)}`);
			}
		},
		sendMedia: async ({ mediaUrl, caption }) => {
			await sendPhoto(token, {
				chat_id: chatId,
				photo: mediaUrl,
				caption
			}, fetcher);
			statusSink?.({ lastOutboundAt: Date.now() });
		},
		onMediaError: (error) => {
			runtime.error?.(`Zalo photo send failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
		}
	});
}
async function monitorZaloProvider(options) {
	const { token, account, config, runtime, abortSignal, useWebhook, webhookUrl, webhookSecret, webhookPath, statusSink, fetcher: fetcherOverride } = options;
	const core = getZaloRuntime();
	const effectiveMediaMaxMb = account.config.mediaMaxMb ?? DEFAULT_MEDIA_MAX_MB;
	const fetcher = fetcherOverride ?? resolveZaloProxyFetch(account.config.proxy);
	const mode = useWebhook ? "webhook" : "polling";
	let stopped = false;
	const stopHandlers = [];
	let cleanupWebhook;
	const stop = () => {
		if (stopped) return;
		stopped = true;
		for (const handler of stopHandlers) handler();
	};
	runtime.log?.(`[${account.accountId}] Zalo provider init mode=${mode} mediaMaxMb=${String(effectiveMediaMaxMb)}`);
	try {
		if (useWebhook) {
			const { registerZaloWebhookTarget } = await import("./monitor.webhook-CR996P_c.js");
			if (!webhookUrl || !webhookSecret) throw new Error("Zalo webhookUrl and webhookSecret are required for webhook mode");
			if (!webhookUrl.startsWith("https://")) throw new Error("Zalo webhook URL must use HTTPS");
			if (webhookSecret.length < 8 || webhookSecret.length > 256) throw new Error("Zalo webhook secret must be 8-256 characters");
			const path = resolveWebhookPath({
				webhookPath,
				webhookUrl,
				defaultPath: null
			});
			if (!path) throw new Error("Zalo webhookPath could not be derived");
			runtime.log?.(`[${account.accountId}] Zalo configuring webhook path=${path} target=${describeWebhookTarget(webhookUrl)}`);
			await setWebhook(token, {
				url: webhookUrl,
				secret_token: webhookSecret
			}, fetcher);
			let webhookCleanupPromise;
			cleanupWebhook = async () => {
				if (!webhookCleanupPromise) webhookCleanupPromise = (async () => {
					runtime.log?.(`[${account.accountId}] Zalo stopping; deleting webhook`);
					try {
						await deleteWebhook(token, fetcher, WEBHOOK_CLEANUP_TIMEOUT_MS);
						runtime.log?.(`[${account.accountId}] Zalo webhook deleted`);
					} catch (err) {
						const detail = err instanceof Error && err.name === "AbortError" ? `timed out after ${String(WEBHOOK_CLEANUP_TIMEOUT_MS)}ms` : formatZaloError(err);
						runtime.error?.(`[${account.accountId}] Zalo webhook delete failed: ${detail}`);
					}
				})();
				await webhookCleanupPromise;
			};
			runtime.log?.(`[${account.accountId}] Zalo webhook registered path=${path}`);
			const unregister = registerZaloWebhookTarget({
				token,
				account,
				config,
				runtime,
				core,
				path,
				secret: webhookSecret,
				statusSink: (patch) => statusSink?.(patch),
				mediaMaxMb: effectiveMediaMaxMb,
				fetcher
			}, { route: {
				auth: "plugin",
				match: "exact",
				pluginId: "zalo",
				source: "zalo-webhook",
				accountId: account.accountId,
				log: runtime.log,
				handler: async (req, res) => {
					if (!await handleZaloWebhookRequest(req, res) && !res.headersSent) {
						res.statusCode = 404;
						res.setHeader("Content-Type", "text/plain; charset=utf-8");
						res.end("Not Found");
					}
				}
			} });
			stopHandlers.push(unregister);
			await waitForAbortSignal(abortSignal);
			return;
		}
		runtime.log?.(`[${account.accountId}] Zalo polling mode: clearing webhook before startup`);
		try {
			try {
				const currentWebhookUrl = normalizeWebhookUrl((await getWebhookInfo(token, fetcher)).result?.url);
				if (!currentWebhookUrl) runtime.log?.(`[${account.accountId}] Zalo polling mode ready (no webhook configured)`);
				else {
					runtime.log?.(`[${account.accountId}] Zalo polling mode disabling existing webhook ${describeWebhookTarget(currentWebhookUrl)}`);
					await deleteWebhook(token, fetcher);
					runtime.log?.(`[${account.accountId}] Zalo polling mode ready (webhook disabled)`);
				}
			} catch (err) {
				if (err instanceof ZaloApiError && err.errorCode === 404) runtime.log?.(`[${account.accountId}] Zalo polling mode webhook inspection unavailable; continuing without webhook cleanup`);
				else throw err;
			}
		} catch (err) {
			runtime.error?.(`[${account.accountId}] Zalo polling startup could not clear webhook: ${formatZaloError(err)}`);
		}
		startPollingLoop({
			token,
			account,
			config,
			runtime,
			core,
			abortSignal,
			isStopped: () => stopped,
			mediaMaxMb: effectiveMediaMaxMb,
			statusSink,
			fetcher
		});
		await waitForAbortSignal(abortSignal);
	} catch (err) {
		runtime.error?.(`[${account.accountId}] Zalo provider startup failed mode=${mode}: ${formatZaloError(err)}`);
		throw err;
	} finally {
		await cleanupWebhook?.();
		stop();
		runtime.log?.(`[${account.accountId}] Zalo provider stopped mode=${mode}`);
	}
}
//#endregion
export { monitorZaloProvider };
