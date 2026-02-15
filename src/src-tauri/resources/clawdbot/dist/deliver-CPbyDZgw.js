import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { dt as getActivePluginRegistry, o as createSubsystemLogger } from "./entry.js";
import { c as normalizeAccountId$1 } from "./session-key-DVvxnFKg.js";
import { c as escapeRegExp } from "./utils-q1rHOG-N.js";
import { r as normalizeChannelId, t as getChannelPlugin } from "./plugins-DsHRVW6o.js";
import { _ as resolveMarkdownTableMode, f as resolveChunkMode, g as parseFenceSpans, l as chunkMarkdownTextWithMode, p as resolveTextChunkLimit, s as chunkByParagraph } from "./media-EWF5qDpT.js";
import { i as isMessagingToolDuplicate } from "./pi-embedded-helpers-Bgii3Law.js";
import { F as getChannelDock, n as appendAssistantMessageToSessionTranscript, r as resolveMirroredTranscriptText } from "./sessions-DGtM0qOW.js";
import { a as markdownToSignalTextChunks, t as sendMessageSignal } from "./send-h1nuAso5.js";
import { i as failDelivery, r as enqueueDelivery, t as ackDelivery } from "./delivery-queue-BFRO68fM.js";

//#region src/auto-reply/tokens.ts
const HEARTBEAT_TOKEN = "HEARTBEAT_OK";
const SILENT_REPLY_TOKEN = "NO_REPLY";
function isSilentReplyText(text, token = SILENT_REPLY_TOKEN) {
	if (!text) return false;
	const escaped = escapeRegExp(token);
	if (new RegExp(`^\\s*${escaped}(?=$|\\W)`).test(text)) return true;
	return new RegExp(`\\b${escaped}\\b\\W*$`).test(text);
}

//#endregion
//#region src/plugins/hooks.ts
/**
* Get hooks for a specific hook name, sorted by priority (higher first).
*/
function getHooksForName(registry, hookName) {
	return registry.typedHooks.filter((h) => h.hookName === hookName).toSorted((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}
/**
* Create a hook runner for a specific registry.
*/
function createHookRunner(registry, options = {}) {
	const logger = options.logger;
	const catchErrors = options.catchErrors ?? true;
	/**
	* Run a hook that doesn't return a value (fire-and-forget style).
	* All handlers are executed in parallel for performance.
	*/
	async function runVoidHook(hookName, event, ctx) {
		const hooks = getHooksForName(registry, hookName);
		if (hooks.length === 0) return;
		logger?.debug?.(`[hooks] running ${hookName} (${hooks.length} handlers)`);
		const promises = hooks.map(async (hook) => {
			try {
				await hook.handler(event, ctx);
			} catch (err) {
				const msg = `[hooks] ${hookName} handler from ${hook.pluginId} failed: ${String(err)}`;
				if (catchErrors) logger?.error(msg);
				else throw new Error(msg, { cause: err });
			}
		});
		await Promise.all(promises);
	}
	/**
	* Run a hook that can return a modifying result.
	* Handlers are executed sequentially in priority order, and results are merged.
	*/
	async function runModifyingHook(hookName, event, ctx, mergeResults) {
		const hooks = getHooksForName(registry, hookName);
		if (hooks.length === 0) return;
		logger?.debug?.(`[hooks] running ${hookName} (${hooks.length} handlers, sequential)`);
		let result;
		for (const hook of hooks) try {
			const handlerResult = await hook.handler(event, ctx);
			if (handlerResult !== void 0 && handlerResult !== null) if (mergeResults && result !== void 0) result = mergeResults(result, handlerResult);
			else result = handlerResult;
		} catch (err) {
			const msg = `[hooks] ${hookName} handler from ${hook.pluginId} failed: ${String(err)}`;
			if (catchErrors) logger?.error(msg);
			else throw new Error(msg, { cause: err });
		}
		return result;
	}
	/**
	* Run before_agent_start hook.
	* Allows plugins to inject context into the system prompt.
	* Runs sequentially, merging systemPrompt and prependContext from all handlers.
	*/
	async function runBeforeAgentStart(event, ctx) {
		return runModifyingHook("before_agent_start", event, ctx, (acc, next) => ({
			systemPrompt: next.systemPrompt ?? acc?.systemPrompt,
			prependContext: acc?.prependContext && next.prependContext ? `${acc.prependContext}\n\n${next.prependContext}` : next.prependContext ?? acc?.prependContext
		}));
	}
	/**
	* Run agent_end hook.
	* Allows plugins to analyze completed conversations.
	* Runs in parallel (fire-and-forget).
	*/
	async function runAgentEnd(event, ctx) {
		return runVoidHook("agent_end", event, ctx);
	}
	/**
	* Run before_compaction hook.
	*/
	async function runBeforeCompaction(event, ctx) {
		return runVoidHook("before_compaction", event, ctx);
	}
	/**
	* Run after_compaction hook.
	*/
	async function runAfterCompaction(event, ctx) {
		return runVoidHook("after_compaction", event, ctx);
	}
	/**
	* Run before_reset hook.
	* Fired when /new or /reset clears a session, before messages are lost.
	* Runs in parallel (fire-and-forget).
	*/
	async function runBeforeReset(event, ctx) {
		return runVoidHook("before_reset", event, ctx);
	}
	/**
	* Run message_received hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runMessageReceived(event, ctx) {
		return runVoidHook("message_received", event, ctx);
	}
	/**
	* Run message_sending hook.
	* Allows plugins to modify or cancel outgoing messages.
	* Runs sequentially.
	*/
	async function runMessageSending(event, ctx) {
		return runModifyingHook("message_sending", event, ctx, (acc, next) => ({
			content: next.content ?? acc?.content,
			cancel: next.cancel ?? acc?.cancel
		}));
	}
	/**
	* Run message_sent hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runMessageSent(event, ctx) {
		return runVoidHook("message_sent", event, ctx);
	}
	/**
	* Run before_tool_call hook.
	* Allows plugins to modify or block tool calls.
	* Runs sequentially.
	*/
	async function runBeforeToolCall(event, ctx) {
		return runModifyingHook("before_tool_call", event, ctx, (acc, next) => ({
			params: next.params ?? acc?.params,
			block: next.block ?? acc?.block,
			blockReason: next.blockReason ?? acc?.blockReason
		}));
	}
	/**
	* Run after_tool_call hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runAfterToolCall(event, ctx) {
		return runVoidHook("after_tool_call", event, ctx);
	}
	/**
	* Run tool_result_persist hook.
	*
	* This hook is intentionally synchronous: it runs in hot paths where session
	* transcripts are appended synchronously.
	*
	* Handlers are executed sequentially in priority order (higher first). Each
	* handler may return `{ message }` to replace the message passed to the next
	* handler.
	*/
	function runToolResultPersist(event, ctx) {
		const hooks = getHooksForName(registry, "tool_result_persist");
		if (hooks.length === 0) return;
		let current = event.message;
		for (const hook of hooks) try {
			const out = hook.handler({
				...event,
				message: current
			}, ctx);
			if (out && typeof out.then === "function") {
				const msg = `[hooks] tool_result_persist handler from ${hook.pluginId} returned a Promise; this hook is synchronous and the result was ignored.`;
				if (catchErrors) {
					logger?.warn?.(msg);
					continue;
				}
				throw new Error(msg);
			}
			const next = out?.message;
			if (next) current = next;
		} catch (err) {
			const msg = `[hooks] tool_result_persist handler from ${hook.pluginId} failed: ${String(err)}`;
			if (catchErrors) logger?.error(msg);
			else throw new Error(msg, { cause: err });
		}
		return { message: current };
	}
	/**
	* Run session_start hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runSessionStart(event, ctx) {
		return runVoidHook("session_start", event, ctx);
	}
	/**
	* Run session_end hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runSessionEnd(event, ctx) {
		return runVoidHook("session_end", event, ctx);
	}
	/**
	* Run gateway_start hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runGatewayStart(event, ctx) {
		return runVoidHook("gateway_start", event, ctx);
	}
	/**
	* Run gateway_stop hook.
	* Runs in parallel (fire-and-forget).
	*/
	async function runGatewayStop(event, ctx) {
		return runVoidHook("gateway_stop", event, ctx);
	}
	/**
	* Check if any hooks are registered for a given hook name.
	*/
	function hasHooks(hookName) {
		return registry.typedHooks.some((h) => h.hookName === hookName);
	}
	/**
	* Get count of registered hooks for a given hook name.
	*/
	function getHookCount(hookName) {
		return registry.typedHooks.filter((h) => h.hookName === hookName).length;
	}
	return {
		runBeforeAgentStart,
		runAgentEnd,
		runBeforeCompaction,
		runAfterCompaction,
		runBeforeReset,
		runMessageReceived,
		runMessageSending,
		runMessageSent,
		runBeforeToolCall,
		runAfterToolCall,
		runToolResultPersist,
		runSessionStart,
		runSessionEnd,
		runGatewayStart,
		runGatewayStop,
		hasHooks,
		getHookCount
	};
}

//#endregion
//#region src/plugins/hook-runner-global.ts
const log = createSubsystemLogger("plugins");
let globalHookRunner = null;
let globalRegistry = null;
/**
* Initialize the global hook runner with a plugin registry.
* Called once when plugins are loaded during gateway startup.
*/
function initializeGlobalHookRunner(registry) {
	globalRegistry = registry;
	globalHookRunner = createHookRunner(registry, {
		logger: {
			debug: (msg) => log.debug(msg),
			warn: (msg) => log.warn(msg),
			error: (msg) => log.error(msg)
		},
		catchErrors: true
	});
	const hookCount = registry.hooks.length;
	if (hookCount > 0) log.info(`hook runner initialized with ${hookCount} registered hooks`);
}
/**
* Get the global hook runner.
* Returns null if plugins haven't been loaded yet.
*/
function getGlobalHookRunner() {
	return globalHookRunner;
}

//#endregion
//#region src/utils/directive-tags.ts
const AUDIO_TAG_RE = /\[\[\s*audio_as_voice\s*\]\]/gi;
const REPLY_TAG_RE = /\[\[\s*(?:reply_to_current|reply_to\s*:\s*([^\]\n]+))\s*\]\]/gi;
function normalizeDirectiveWhitespace(text) {
	return text.replace(/[ \t]+/g, " ").replace(/[ \t]*\n[ \t]*/g, "\n").trim();
}
function parseInlineDirectives(text, options = {}) {
	const { currentMessageId, stripAudioTag = true, stripReplyTags = true } = options;
	if (!text) return {
		text: "",
		audioAsVoice: false,
		replyToCurrent: false,
		hasAudioTag: false,
		hasReplyTag: false
	};
	let cleaned = text;
	let audioAsVoice = false;
	let hasAudioTag = false;
	let hasReplyTag = false;
	let sawCurrent = false;
	let lastExplicitId;
	cleaned = cleaned.replace(AUDIO_TAG_RE, (match) => {
		audioAsVoice = true;
		hasAudioTag = true;
		return stripAudioTag ? " " : match;
	});
	cleaned = cleaned.replace(REPLY_TAG_RE, (match, idRaw) => {
		hasReplyTag = true;
		if (idRaw === void 0) sawCurrent = true;
		else {
			const id = idRaw.trim();
			if (id) lastExplicitId = id;
		}
		return stripReplyTags ? " " : match;
	});
	cleaned = normalizeDirectiveWhitespace(cleaned);
	const replyToId = lastExplicitId ?? (sawCurrent ? currentMessageId?.trim() || void 0 : void 0);
	return {
		text: cleaned,
		audioAsVoice,
		replyToId,
		replyToExplicitId: lastExplicitId,
		replyToCurrent: sawCurrent,
		hasAudioTag,
		hasReplyTag
	};
}

//#endregion
//#region src/media/audio-tags.ts
/**
* Extract audio mode tag from text.
* Supports [[audio_as_voice]] to send audio as voice bubble instead of file.
* Default is file (preserves backward compatibility).
*/
function parseAudioTag(text) {
	const result = parseInlineDirectives(text, { stripReplyTags: false });
	return {
		text: result.text,
		audioAsVoice: result.audioAsVoice,
		hadTag: result.hasAudioTag
	};
}

//#endregion
//#region src/media/parse.ts
const MEDIA_TOKEN_RE = /\bMEDIA:\s*`?([^\n]+)`?/gi;
function normalizeMediaSource(src) {
	return src.startsWith("file://") ? src.replace("file://", "") : src;
}
function cleanCandidate(raw) {
	return raw.replace(/^[`"'[{(]+/, "").replace(/[`"'\\})\],]+$/, "");
}
const WINDOWS_DRIVE_RE = /^[a-zA-Z]:[\\/]/;
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const HAS_FILE_EXT = /\.\w{1,10}$/;
function isLikelyLocalPath(candidate) {
	return candidate.startsWith("/") || candidate.startsWith("./") || candidate.startsWith("../") || candidate.startsWith("~") || WINDOWS_DRIVE_RE.test(candidate) || candidate.startsWith("\\\\") || !SCHEME_RE.test(candidate) && (candidate.includes("/") || candidate.includes("\\"));
}
function isValidMedia(candidate, opts) {
	if (!candidate) return false;
	if (candidate.length > 4096) return false;
	if (!opts?.allowSpaces && /\s/.test(candidate)) return false;
	if (/^https?:\/\//i.test(candidate)) return true;
	if (isLikelyLocalPath(candidate)) return true;
	if (opts?.allowBareFilename && !SCHEME_RE.test(candidate) && HAS_FILE_EXT.test(candidate)) return true;
	return false;
}
function unwrapQuoted(value) {
	const trimmed = value.trim();
	if (trimmed.length < 2) return;
	const first = trimmed[0];
	if (first !== trimmed[trimmed.length - 1]) return;
	if (first !== `"` && first !== "'" && first !== "`") return;
	return trimmed.slice(1, -1).trim();
}
function isInsideFence(fenceSpans, offset) {
	return fenceSpans.some((span) => offset >= span.start && offset < span.end);
}
function splitMediaFromOutput(raw) {
	const trimmedRaw = raw.trimEnd();
	if (!trimmedRaw.trim()) return { text: "" };
	const media = [];
	let foundMediaToken = false;
	const fenceSpans = parseFenceSpans(trimmedRaw);
	const lines = trimmedRaw.split("\n");
	const keptLines = [];
	let lineOffset = 0;
	for (const line of lines) {
		if (isInsideFence(fenceSpans, lineOffset)) {
			keptLines.push(line);
			lineOffset += line.length + 1;
			continue;
		}
		if (!line.trimStart().startsWith("MEDIA:")) {
			keptLines.push(line);
			lineOffset += line.length + 1;
			continue;
		}
		const matches = Array.from(line.matchAll(MEDIA_TOKEN_RE));
		if (matches.length === 0) {
			keptLines.push(line);
			lineOffset += line.length + 1;
			continue;
		}
		const pieces = [];
		let cursor = 0;
		for (const match of matches) {
			const start = match.index ?? 0;
			pieces.push(line.slice(cursor, start));
			const payload = match[1];
			const unwrapped = unwrapQuoted(payload);
			const payloadValue = unwrapped ?? payload;
			const parts = unwrapped ? [unwrapped] : payload.split(/\s+/).filter(Boolean);
			const mediaStartIndex = media.length;
			let validCount = 0;
			const invalidParts = [];
			let hasValidMedia = false;
			for (const part of parts) {
				const candidate = normalizeMediaSource(cleanCandidate(part));
				if (isValidMedia(candidate, unwrapped ? { allowSpaces: true } : void 0)) {
					media.push(candidate);
					hasValidMedia = true;
					foundMediaToken = true;
					validCount += 1;
				} else invalidParts.push(part);
			}
			const trimmedPayload = payloadValue.trim();
			const looksLikeLocalPath = isLikelyLocalPath(trimmedPayload) || trimmedPayload.startsWith("file://");
			if (!unwrapped && validCount === 1 && invalidParts.length > 0 && /\s/.test(payloadValue) && looksLikeLocalPath) {
				const fallback = normalizeMediaSource(cleanCandidate(payloadValue));
				if (isValidMedia(fallback, { allowSpaces: true })) {
					media.splice(mediaStartIndex, media.length - mediaStartIndex, fallback);
					hasValidMedia = true;
					foundMediaToken = true;
					validCount = 1;
					invalidParts.length = 0;
				}
			}
			if (!hasValidMedia) {
				const fallback = normalizeMediaSource(cleanCandidate(payloadValue));
				if (isValidMedia(fallback, {
					allowSpaces: true,
					allowBareFilename: true
				})) {
					media.push(fallback);
					hasValidMedia = true;
					foundMediaToken = true;
					invalidParts.length = 0;
				}
			}
			if (hasValidMedia) {
				if (invalidParts.length > 0) pieces.push(invalidParts.join(" "));
			} else if (looksLikeLocalPath) foundMediaToken = true;
			else pieces.push(match[0]);
			cursor = start + match[0].length;
		}
		pieces.push(line.slice(cursor));
		const cleanedLine = pieces.join("").replace(/[ \t]{2,}/g, " ").trim();
		if (cleanedLine) keptLines.push(cleanedLine);
		lineOffset += line.length + 1;
	}
	let cleanedText = keptLines.join("\n").replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{2,}/g, "\n").trim();
	const audioTagResult = parseAudioTag(cleanedText);
	const hasAudioAsVoice = audioTagResult.audioAsVoice;
	if (audioTagResult.hadTag) cleanedText = audioTagResult.text.replace(/\n{2,}/g, "\n").trim();
	if (media.length === 0) {
		const result = { text: foundMediaToken || hasAudioAsVoice ? cleanedText : trimmedRaw };
		if (hasAudioAsVoice) result.audioAsVoice = true;
		return result;
	}
	return {
		text: cleanedText,
		mediaUrls: media,
		mediaUrl: media[0],
		...hasAudioAsVoice ? { audioAsVoice: true } : {}
	};
}

//#endregion
//#region src/auto-reply/reply/reply-directives.ts
function parseReplyDirectives(raw, options = {}) {
	const split = splitMediaFromOutput(raw);
	let text = split.text ?? "";
	const replyParsed = parseInlineDirectives(text, {
		currentMessageId: options.currentMessageId,
		stripAudioTag: false,
		stripReplyTags: true
	});
	if (replyParsed.hasReplyTag) text = replyParsed.text;
	const silentToken = options.silentToken ?? SILENT_REPLY_TOKEN;
	const isSilent = isSilentReplyText(text, silentToken);
	if (isSilent) text = "";
	return {
		text,
		mediaUrls: split.mediaUrls,
		mediaUrl: split.mediaUrl,
		replyToId: replyParsed.replyToId,
		replyToCurrent: replyParsed.replyToCurrent,
		replyToTag: replyParsed.hasReplyTag,
		audioAsVoice: split.audioAsVoice,
		isSilent
	};
}

//#endregion
//#region src/infra/outbound/abort.ts
/**
* Utility for checking AbortSignal state and throwing a standard AbortError.
*/
/**
* Throws an AbortError if the given signal has been aborted.
* Use at async checkpoints to support cancellation.
*/
function throwIfAborted(abortSignal) {
	if (abortSignal?.aborted) {
		const err = /* @__PURE__ */ new Error("Operation aborted");
		err.name = "AbortError";
		throw err;
	}
}

//#endregion
//#region src/infra/outbound/target-normalization.ts
function normalizeChannelTargetInput(raw) {
	return raw.trim();
}
function normalizeTargetForProvider(provider, raw) {
	if (!raw) return;
	const providerId = normalizeChannelId(provider);
	return ((providerId ? getChannelPlugin(providerId) : void 0)?.messaging?.normalizeTarget?.(raw) ?? (raw.trim() || void 0)) || void 0;
}
function buildTargetResolverSignature(channel) {
	const resolver = getChannelPlugin(channel)?.messaging?.targetResolver;
	const hint = resolver?.hint ?? "";
	const looksLike = resolver?.looksLikeId;
	return hashSignature(`${hint}|${looksLike ? looksLike.toString() : ""}`);
}
function hashSignature(value) {
	let hash = 5381;
	for (let i = 0; i < value.length; i += 1) hash = (hash << 5) + hash ^ value.charCodeAt(i);
	return (hash >>> 0).toString(36);
}

//#endregion
//#region src/channels/plugins/media-limits.ts
const MB = 1024 * 1024;
function resolveChannelMediaMaxBytes(params) {
	const accountId = normalizeAccountId$1(params.accountId);
	const channelLimit = params.resolveChannelLimitMb({
		cfg: params.cfg,
		accountId
	});
	if (channelLimit) return channelLimit * MB;
	if (params.cfg.agents?.defaults?.mediaMaxMb) return params.cfg.agents.defaults.mediaMaxMb * MB;
}

//#endregion
//#region src/channels/plugins/outbound/load.ts
const cache = /* @__PURE__ */ new Map();
let lastRegistry = null;
function ensureCacheForRegistry(registry) {
	if (registry === lastRegistry) return;
	cache.clear();
	lastRegistry = registry;
}
async function loadChannelOutboundAdapter(id) {
	const registry = getActivePluginRegistry();
	ensureCacheForRegistry(registry);
	const cached = cache.get(id);
	if (cached) return cached;
	const outbound = (registry?.channels.find((entry) => entry.plugin.id === id))?.plugin.outbound;
	if (outbound) {
		cache.set(id, outbound);
		return outbound;
	}
}

//#endregion
//#region src/auto-reply/reply/reply-tags.ts
function extractReplyToTag(text, currentMessageId) {
	const result = parseInlineDirectives(text, {
		currentMessageId,
		stripAudioTag: false
	});
	return {
		cleaned: result.text,
		replyToId: result.replyToId,
		replyToCurrent: result.replyToCurrent,
		hasTag: result.hasReplyTag
	};
}

//#endregion
//#region src/auto-reply/reply/reply-threading.ts
function resolveReplyToMode(cfg, channel, accountId, chatType) {
	const provider = normalizeChannelId(channel);
	if (!provider) return "all";
	return getChannelDock(provider)?.threading?.resolveReplyToMode?.({
		cfg,
		accountId,
		chatType
	}) ?? "all";
}
function createReplyToModeFilter(mode, opts = {}) {
	let hasThreaded = false;
	return (payload) => {
		if (!payload.replyToId) return payload;
		if (mode === "off") {
			if (opts.allowTagsWhenOff && payload.replyToTag) return payload;
			return {
				...payload,
				replyToId: void 0
			};
		}
		if (mode === "all") return payload;
		if (hasThreaded) return {
			...payload,
			replyToId: void 0
		};
		hasThreaded = true;
		return payload;
	};
}
function createReplyToModeFilterForChannel(mode, channel) {
	const provider = normalizeChannelId(channel);
	return createReplyToModeFilter(mode, { allowTagsWhenOff: provider ? Boolean(getChannelDock(provider)?.threading?.allowTagsWhenOff) : false });
}

//#endregion
//#region src/auto-reply/reply/reply-payloads.ts
function applyReplyTagsToPayload(payload, currentMessageId) {
	if (typeof payload.text !== "string") {
		if (!payload.replyToCurrent || payload.replyToId) return payload;
		return {
			...payload,
			replyToId: currentMessageId?.trim() || void 0
		};
	}
	if (!payload.text.includes("[[")) {
		if (!payload.replyToCurrent || payload.replyToId) return payload;
		return {
			...payload,
			replyToId: currentMessageId?.trim() || void 0,
			replyToTag: payload.replyToTag ?? true
		};
	}
	const { cleaned, replyToId, replyToCurrent, hasTag } = extractReplyToTag(payload.text, currentMessageId);
	return {
		...payload,
		text: cleaned ? cleaned : void 0,
		replyToId: replyToId ?? payload.replyToId,
		replyToTag: hasTag || payload.replyToTag,
		replyToCurrent: replyToCurrent || payload.replyToCurrent
	};
}
function isRenderablePayload(payload) {
	return Boolean(payload.text || payload.mediaUrl || payload.mediaUrls && payload.mediaUrls.length > 0 || payload.audioAsVoice || payload.channelData);
}
function applyReplyThreading(params) {
	const { payloads, replyToMode, replyToChannel, currentMessageId } = params;
	const applyReplyToMode = createReplyToModeFilterForChannel(replyToMode, replyToChannel);
	const implicitReplyToId = currentMessageId?.trim() || void 0;
	return payloads.map((payload) => {
		return applyReplyTagsToPayload(payload.replyToId || payload.replyToCurrent === false || !implicitReplyToId ? payload : {
			...payload,
			replyToId: implicitReplyToId
		}, currentMessageId);
	}).filter(isRenderablePayload).map(applyReplyToMode);
}
function filterMessagingToolDuplicates(params) {
	const { payloads, sentTexts } = params;
	if (sentTexts.length === 0) return payloads;
	return payloads.filter((payload) => !isMessagingToolDuplicate(payload.text ?? "", sentTexts));
}
function normalizeAccountId(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed.toLowerCase() : void 0;
}
function shouldSuppressMessagingToolReplies(params) {
	const provider = params.messageProvider?.trim().toLowerCase();
	if (!provider) return false;
	const originTarget = normalizeTargetForProvider(provider, params.originatingTo);
	if (!originTarget) return false;
	const originAccount = normalizeAccountId(params.accountId);
	const sentTargets = params.messagingToolSentTargets ?? [];
	if (sentTargets.length === 0) return false;
	return sentTargets.some((target) => {
		if (!target?.provider) return false;
		if (target.provider.trim().toLowerCase() !== provider) return false;
		const targetKey = normalizeTargetForProvider(provider, target.to);
		if (!targetKey) return false;
		const targetAccount = normalizeAccountId(target.accountId);
		if (originAccount && targetAccount && originAccount !== targetAccount) return false;
		return targetKey === originTarget;
	});
}

//#endregion
//#region src/infra/outbound/payloads.ts
function mergeMediaUrls(...lists) {
	const seen = /* @__PURE__ */ new Set();
	const merged = [];
	for (const list of lists) {
		if (!list) continue;
		for (const entry of list) {
			const trimmed = entry?.trim();
			if (!trimmed) continue;
			if (seen.has(trimmed)) continue;
			seen.add(trimmed);
			merged.push(trimmed);
		}
	}
	return merged;
}
function normalizeReplyPayloadsForDelivery(payloads) {
	return payloads.flatMap((payload) => {
		const parsed = parseReplyDirectives(payload.text ?? "");
		const explicitMediaUrls = payload.mediaUrls ?? parsed.mediaUrls;
		const explicitMediaUrl = payload.mediaUrl ?? parsed.mediaUrl;
		const mergedMedia = mergeMediaUrls(explicitMediaUrls, explicitMediaUrl ? [explicitMediaUrl] : void 0);
		const resolvedMediaUrl = (explicitMediaUrls?.length ?? 0) > 1 ? void 0 : explicitMediaUrl;
		const next = {
			...payload,
			text: parsed.text ?? "",
			mediaUrls: mergedMedia.length ? mergedMedia : void 0,
			mediaUrl: resolvedMediaUrl,
			replyToId: payload.replyToId ?? parsed.replyToId,
			replyToTag: payload.replyToTag || parsed.replyToTag,
			replyToCurrent: payload.replyToCurrent || parsed.replyToCurrent,
			audioAsVoice: Boolean(payload.audioAsVoice || parsed.audioAsVoice)
		};
		if (parsed.isSilent && mergedMedia.length === 0) return [];
		if (!isRenderablePayload(next)) return [];
		return [next];
	});
}
function normalizeOutboundPayloads(payloads) {
	return normalizeReplyPayloadsForDelivery(payloads).map((payload) => {
		const channelData = payload.channelData;
		const normalized = {
			text: payload.text ?? "",
			mediaUrls: payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : [])
		};
		if (channelData && Object.keys(channelData).length > 0) normalized.channelData = channelData;
		return normalized;
	}).filter((payload) => payload.text || payload.mediaUrls.length > 0 || Boolean(payload.channelData && Object.keys(payload.channelData).length > 0));
}
function normalizeOutboundPayloadsForJson(payloads) {
	return normalizeReplyPayloadsForDelivery(payloads).map((payload) => ({
		text: payload.text ?? "",
		mediaUrl: payload.mediaUrl ?? null,
		mediaUrls: payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : void 0),
		channelData: payload.channelData
	}));
}
function formatOutboundPayloadLog(payload) {
	const lines = [];
	if (payload.text) lines.push(payload.text.trimEnd());
	for (const url of payload.mediaUrls) lines.push(`MEDIA:${url}`);
	return lines.join("\n");
}

//#endregion
//#region src/infra/outbound/deliver.ts
var deliver_exports = /* @__PURE__ */ __exportAll({ deliverOutboundPayloads: () => deliverOutboundPayloads });
async function createChannelHandler(params) {
	const outbound = await loadChannelOutboundAdapter(params.channel);
	if (!outbound?.sendText || !outbound?.sendMedia) throw new Error(`Outbound not configured for channel: ${params.channel}`);
	const handler = createPluginHandler({
		outbound,
		cfg: params.cfg,
		channel: params.channel,
		to: params.to,
		accountId: params.accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		deps: params.deps,
		gifPlayback: params.gifPlayback,
		silent: params.silent
	});
	if (!handler) throw new Error(`Outbound not configured for channel: ${params.channel}`);
	return handler;
}
function createPluginHandler(params) {
	const outbound = params.outbound;
	if (!outbound?.sendText || !outbound?.sendMedia) return null;
	const sendText = outbound.sendText;
	const sendMedia = outbound.sendMedia;
	return {
		chunker: outbound.chunker ?? null,
		chunkerMode: outbound.chunkerMode,
		textChunkLimit: outbound.textChunkLimit,
		sendPayload: outbound.sendPayload ? async (payload) => outbound.sendPayload({
			cfg: params.cfg,
			to: params.to,
			text: payload.text ?? "",
			mediaUrl: payload.mediaUrl,
			accountId: params.accountId,
			replyToId: params.replyToId,
			threadId: params.threadId,
			gifPlayback: params.gifPlayback,
			deps: params.deps,
			silent: params.silent,
			payload
		}) : void 0,
		sendText: async (text) => sendText({
			cfg: params.cfg,
			to: params.to,
			text,
			accountId: params.accountId,
			replyToId: params.replyToId,
			threadId: params.threadId,
			gifPlayback: params.gifPlayback,
			deps: params.deps,
			silent: params.silent
		}),
		sendMedia: async (caption, mediaUrl) => sendMedia({
			cfg: params.cfg,
			to: params.to,
			text: caption,
			mediaUrl,
			accountId: params.accountId,
			replyToId: params.replyToId,
			threadId: params.threadId,
			gifPlayback: params.gifPlayback,
			deps: params.deps,
			silent: params.silent
		})
	};
}
const isAbortError = (err) => err instanceof Error && err.name === "AbortError";
async function deliverOutboundPayloads(params) {
	const { channel, to, payloads } = params;
	const queueId = params.skipQueue ? null : await enqueueDelivery({
		channel,
		to,
		accountId: params.accountId,
		payloads,
		threadId: params.threadId,
		replyToId: params.replyToId,
		bestEffort: params.bestEffort,
		gifPlayback: params.gifPlayback,
		silent: params.silent,
		mirror: params.mirror
	}).catch(() => null);
	let hadPartialFailure = false;
	const wrappedParams = params.onError ? {
		...params,
		onError: (err, payload) => {
			hadPartialFailure = true;
			params.onError(err, payload);
		}
	} : params;
	try {
		const results = await deliverOutboundPayloadsCore(wrappedParams);
		if (queueId) if (hadPartialFailure) await failDelivery(queueId, "partial delivery failure (bestEffort)").catch(() => {});
		else await ackDelivery(queueId).catch(() => {});
		return results;
	} catch (err) {
		if (queueId) if (isAbortError(err)) await ackDelivery(queueId).catch(() => {});
		else await failDelivery(queueId, err instanceof Error ? err.message : String(err)).catch(() => {});
		throw err;
	}
}
/** Core delivery logic (extracted for queue wrapper). */
async function deliverOutboundPayloadsCore(params) {
	const { cfg, channel, to, payloads } = params;
	const accountId = params.accountId;
	const deps = params.deps;
	const abortSignal = params.abortSignal;
	const sendSignal = params.deps?.sendSignal ?? sendMessageSignal;
	const results = [];
	const handler = await createChannelHandler({
		cfg,
		channel,
		to,
		deps,
		accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		gifPlayback: params.gifPlayback,
		silent: params.silent
	});
	const textLimit = handler.chunker ? resolveTextChunkLimit(cfg, channel, accountId, { fallbackLimit: handler.textChunkLimit }) : void 0;
	const chunkMode = handler.chunker ? resolveChunkMode(cfg, channel, accountId) : "length";
	const isSignalChannel = channel === "signal";
	const signalTableMode = isSignalChannel ? resolveMarkdownTableMode({
		cfg,
		channel: "signal",
		accountId
	}) : "code";
	const signalMaxBytes = isSignalChannel ? resolveChannelMediaMaxBytes({
		cfg,
		resolveChannelLimitMb: ({ cfg, accountId }) => cfg.channels?.signal?.accounts?.[accountId]?.mediaMaxMb ?? cfg.channels?.signal?.mediaMaxMb,
		accountId
	}) : void 0;
	const sendTextChunks = async (text) => {
		throwIfAborted(abortSignal);
		if (!handler.chunker || textLimit === void 0) {
			results.push(await handler.sendText(text));
			return;
		}
		if (chunkMode === "newline") {
			const blockChunks = (handler.chunkerMode ?? "text") === "markdown" ? chunkMarkdownTextWithMode(text, textLimit, "newline") : chunkByParagraph(text, textLimit);
			if (!blockChunks.length && text) blockChunks.push(text);
			for (const blockChunk of blockChunks) {
				const chunks = handler.chunker(blockChunk, textLimit);
				if (!chunks.length && blockChunk) chunks.push(blockChunk);
				for (const chunk of chunks) {
					throwIfAborted(abortSignal);
					results.push(await handler.sendText(chunk));
				}
			}
			return;
		}
		const chunks = handler.chunker(text, textLimit);
		for (const chunk of chunks) {
			throwIfAborted(abortSignal);
			results.push(await handler.sendText(chunk));
		}
	};
	const sendSignalText = async (text, styles) => {
		throwIfAborted(abortSignal);
		return {
			channel: "signal",
			...await sendSignal(to, text, {
				maxBytes: signalMaxBytes,
				accountId: accountId ?? void 0,
				textMode: "plain",
				textStyles: styles
			})
		};
	};
	const sendSignalTextChunks = async (text) => {
		throwIfAborted(abortSignal);
		let signalChunks = textLimit === void 0 ? markdownToSignalTextChunks(text, Number.POSITIVE_INFINITY, { tableMode: signalTableMode }) : markdownToSignalTextChunks(text, textLimit, { tableMode: signalTableMode });
		if (signalChunks.length === 0 && text) signalChunks = [{
			text,
			styles: []
		}];
		for (const chunk of signalChunks) {
			throwIfAborted(abortSignal);
			results.push(await sendSignalText(chunk.text, chunk.styles));
		}
	};
	const sendSignalMedia = async (caption, mediaUrl) => {
		throwIfAborted(abortSignal);
		const formatted = markdownToSignalTextChunks(caption, Number.POSITIVE_INFINITY, { tableMode: signalTableMode })[0] ?? {
			text: caption,
			styles: []
		};
		return {
			channel: "signal",
			...await sendSignal(to, formatted.text, {
				mediaUrl,
				maxBytes: signalMaxBytes,
				accountId: accountId ?? void 0,
				textMode: "plain",
				textStyles: formatted.styles
			})
		};
	};
	const normalizeWhatsAppPayload = (payload) => {
		const hasMedia = Boolean(payload.mediaUrl) || (payload.mediaUrls?.length ?? 0) > 0;
		const normalizedText = (typeof payload.text === "string" ? payload.text : "").replace(/^(?:[ \t]*\r?\n)+/, "");
		if (!normalizedText.trim()) {
			if (!hasMedia) return null;
			return {
				...payload,
				text: ""
			};
		}
		return {
			...payload,
			text: normalizedText
		};
	};
	const normalizedPayloads = normalizeReplyPayloadsForDelivery(payloads).flatMap((payload) => {
		if (channel !== "whatsapp") return [payload];
		const normalized = normalizeWhatsAppPayload(payload);
		return normalized ? [normalized] : [];
	});
	const hookRunner = getGlobalHookRunner();
	for (const payload of normalizedPayloads) {
		const payloadSummary = {
			text: payload.text ?? "",
			mediaUrls: payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : []),
			channelData: payload.channelData
		};
		const emitMessageSent = (success, error) => {
			if (!hookRunner?.hasHooks("message_sent")) return;
			hookRunner.runMessageSent({
				to,
				content: payloadSummary.text,
				success,
				...error ? { error } : {}
			}, {
				channelId: channel,
				accountId: accountId ?? void 0
			}).catch(() => {});
		};
		try {
			throwIfAborted(abortSignal);
			let effectivePayload = payload;
			if (hookRunner?.hasHooks("message_sending")) try {
				const sendingResult = await hookRunner.runMessageSending({
					to,
					content: payloadSummary.text,
					metadata: {
						channel,
						accountId,
						mediaUrls: payloadSummary.mediaUrls
					}
				}, {
					channelId: channel,
					accountId: accountId ?? void 0
				});
				if (sendingResult?.cancel) continue;
				if (sendingResult?.content != null) {
					effectivePayload = {
						...payload,
						text: sendingResult.content
					};
					payloadSummary.text = sendingResult.content;
				}
			} catch {}
			params.onPayload?.(payloadSummary);
			if (handler.sendPayload && effectivePayload.channelData) {
				results.push(await handler.sendPayload(effectivePayload));
				emitMessageSent(true);
				continue;
			}
			if (payloadSummary.mediaUrls.length === 0) {
				if (isSignalChannel) await sendSignalTextChunks(payloadSummary.text);
				else await sendTextChunks(payloadSummary.text);
				emitMessageSent(true);
				continue;
			}
			let first = true;
			for (const url of payloadSummary.mediaUrls) {
				throwIfAborted(abortSignal);
				const caption = first ? payloadSummary.text : "";
				first = false;
				if (isSignalChannel) results.push(await sendSignalMedia(caption, url));
				else results.push(await handler.sendMedia(caption, url));
			}
			emitMessageSent(true);
		} catch (err) {
			emitMessageSent(false, err instanceof Error ? err.message : String(err));
			if (!params.bestEffort) throw err;
			params.onError?.(err, payloadSummary);
		}
	}
	if (params.mirror && results.length > 0) {
		const mirrorText = resolveMirroredTranscriptText({
			text: params.mirror.text,
			mediaUrls: params.mirror.mediaUrls
		});
		if (mirrorText) await appendAssistantMessageToSessionTranscript({
			agentId: params.mirror.agentId,
			sessionKey: params.mirror.sessionKey,
			text: mirrorText
		});
	}
	return results;
}

//#endregion
export { HEARTBEAT_TOKEN as C, initializeGlobalHookRunner as S, isSilentReplyText as T, throwIfAborted as _, normalizeOutboundPayloadsForJson as a, parseInlineDirectives as b, applyReplyThreading as c, shouldSuppressMessagingToolReplies as d, createReplyToModeFilterForChannel as f, normalizeTargetForProvider as g, normalizeChannelTargetInput as h, normalizeOutboundPayloads as i, filterMessagingToolDuplicates as l, buildTargetResolverSignature as m, deliver_exports as n, normalizeReplyPayloadsForDelivery as o, resolveReplyToMode as p, formatOutboundPayloadLog as r, applyReplyTagsToPayload as s, deliverOutboundPayloads as t, isRenderablePayload as u, parseReplyDirectives as v, SILENT_REPLY_TOKEN as w, getGlobalHookRunner as x, splitMediaFromOutput as y };