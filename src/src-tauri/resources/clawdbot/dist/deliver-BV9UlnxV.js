import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { v as resolveUserPath } from "./utils-CE3P21nG.js";
import { i as resolveAgentConfig, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { u as normalizeWindowsPathForComparison } from "./file-identity-B8OnIgGC.js";
import { a as appendAssistantMessageToSessionTranscript, o as resolveMirroredTranscriptText } from "./sessions-DC7OiAdD.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-CmW7Xsw3.js";
import { n as createInternalHookEvent, p as triggerInternalHook } from "./internal-hooks-LWzilokd.js";
import { r as isSilentReplyPayloadText } from "./tokens-Bot0VGKf.js";
import { a as mergeAlsoAllowPolicy, u as resolveToolProfilePolicy } from "./tool-policy-Bk9WQZ0U.js";
import { l as readLocalFileSafely } from "./fs-safe-Dv_jH6UN.js";
import { r as resolveSandboxInputPath } from "./sandbox-paths-COznanRn.js";
import { h as sendMediaWithLeadingCaption, p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { n as resolveOutboundChannelPlugin } from "./channel-resolution-DMj4FWdt.js";
import { c as resolveTextChunkLimit, d as parseFenceSpans, i as chunkMarkdownTextWithMode, n as chunkByParagraph, s as resolveChunkMode } from "./chunk-D6CtZg6q.js";
import { t as loadChannelOutboundAdapter } from "./load-1Moal5cB.js";
import { a as toInternalMessageSentContext, d as toPluginMessageSentEvent, f as fireAndForgetHook, l as toPluginMessageContext, t as buildCanonicalSentMessageHookContext } from "./message-hook-mappers-DkZ6SgzR.js";
import { i as hasReplyPayloadContent, n as hasReplyChannelData, t as hasInteractiveReplyBlocks } from "./payload-CLtYAQwf.js";
import { r as pickSandboxToolPolicy, t as isToolAllowedByPolicies } from "./tool-policy-match-DmicyxHj.js";
import { r as getAgentScopedMediaLocalRootsForSources } from "./local-roots-CaV3b967.js";
import { a as ackDelivery, c as failDelivery, o as enqueueDelivery } from "./delivery-queue-m5WdYSfO.js";
import { t as parseInlineDirectives } from "./directive-tags-DiTMItsK.js";
import { a as shouldSuppressReasoningPayload, i as isRenderablePayload, r as formatBtwTextForExternalDelivery } from "./reply-payloads-esYr_ziX.js";
import path from "node:path";
//#region src/agents/path-policy.ts
function throwPathEscapesBoundary(params) {
	const boundary = params.options?.boundaryLabel ?? "workspace root";
	const suffix = params.options?.includeRootInError ? ` (${params.rootResolved})` : "";
	throw new Error(`Path escapes ${boundary}${suffix}: ${params.candidate}`);
}
function validateRelativePathWithinBoundary(params) {
	if (params.relativePath === "" || params.relativePath === ".") {
		if (params.options?.allowRoot) return "";
		throwPathEscapesBoundary({
			options: params.options,
			rootResolved: params.rootResolved,
			candidate: params.candidate
		});
	}
	if (params.relativePath.startsWith("..") || params.isAbsolutePath(params.relativePath)) throwPathEscapesBoundary({
		options: params.options,
		rootResolved: params.rootResolved,
		candidate: params.candidate
	});
	return params.relativePath;
}
function toRelativePathUnderRoot(params) {
	const resolvedInput = resolveSandboxInputPath(params.candidate, params.options?.cwd ?? params.root);
	if (process.platform === "win32") {
		const rootResolved = path.win32.resolve(params.root);
		const resolvedCandidate = path.win32.resolve(resolvedInput);
		const rootForCompare = normalizeWindowsPathForComparison(rootResolved);
		const targetForCompare = normalizeWindowsPathForComparison(resolvedCandidate);
		return validateRelativePathWithinBoundary({
			relativePath: path.win32.relative(rootForCompare, targetForCompare),
			isAbsolutePath: path.win32.isAbsolute,
			options: params.options,
			rootResolved,
			candidate: params.candidate
		});
	}
	const rootResolved = path.resolve(params.root);
	const resolvedCandidate = path.resolve(resolvedInput);
	return validateRelativePathWithinBoundary({
		relativePath: path.relative(rootResolved, resolvedCandidate),
		isAbsolutePath: path.isAbsolute,
		options: params.options,
		rootResolved,
		candidate: params.candidate
	});
}
function toRelativeBoundaryPath(params) {
	return toRelativePathUnderRoot({
		root: params.root,
		candidate: params.candidate,
		options: {
			allowRoot: params.options?.allowRoot,
			cwd: params.options?.cwd,
			boundaryLabel: params.boundaryLabel,
			includeRootInError: params.includeRootInError
		}
	});
}
function toRelativeWorkspacePath(root, candidate, options) {
	return toRelativeBoundaryPath({
		root,
		candidate,
		options,
		boundaryLabel: "workspace root"
	});
}
function toRelativeSandboxPath(root, candidate, options) {
	return toRelativeBoundaryPath({
		root,
		candidate,
		options,
		boundaryLabel: "sandbox root",
		includeRootInError: true
	});
}
function resolvePathFromInput(filePath, cwd) {
	return path.normalize(resolveSandboxInputPath(filePath, cwd));
}
//#endregion
//#region src/agents/tool-fs-policy.ts
function createToolFsPolicy(params) {
	return { workspaceOnly: params.workspaceOnly === true };
}
function resolveToolFsConfig(params) {
	const cfg = params.cfg;
	const globalFs = cfg?.tools?.fs;
	return { workspaceOnly: (cfg && params.agentId ? resolveAgentConfig(cfg, params.agentId)?.tools?.fs : void 0)?.workspaceOnly ?? globalFs?.workspaceOnly };
}
function resolveEffectiveToolFsWorkspaceOnly(params) {
	return resolveToolFsConfig(params).workspaceOnly === true;
}
function resolveEffectiveToolFsRootExpansionAllowed(params) {
	const cfg = params.cfg;
	if (!cfg) return true;
	const agentTools = params.agentId ? resolveAgentConfig(cfg, params.agentId)?.tools : void 0;
	const globalTools = cfg.tools;
	const profile = agentTools?.profile ?? globalTools?.profile;
	const profileAlsoAllow = new Set(agentTools?.alsoAllow ?? globalTools?.alsoAllow ?? []);
	const fsConfig = resolveToolFsConfig(params);
	const hasExplicitFsConfig = agentTools?.fs !== void 0 || globalTools?.fs !== void 0;
	if (fsConfig.workspaceOnly === true) return false;
	if (hasExplicitFsConfig) {
		profileAlsoAllow.add("read");
		profileAlsoAllow.add("write");
		profileAlsoAllow.add("edit");
	}
	return isToolAllowedByPolicies("read", [
		mergeAlsoAllowPolicy(resolveToolProfilePolicy(profile), profileAlsoAllow.size > 0 ? Array.from(profileAlsoAllow) : void 0),
		pickSandboxToolPolicy(globalTools),
		pickSandboxToolPolicy(agentTools)
	]);
}
//#endregion
//#region src/agents/workspace-dir.ts
function normalizeWorkspaceDir(workspaceDir) {
	const trimmed = workspaceDir?.trim();
	if (!trimmed) return null;
	const expanded = trimmed.startsWith("~") ? resolveUserPath(trimmed) : trimmed;
	const resolved = path.resolve(expanded);
	if (resolved === path.parse(resolved).root) return null;
	return resolved;
}
function resolveWorkspaceRoot(workspaceDir) {
	return normalizeWorkspaceDir(workspaceDir) ?? process.cwd();
}
//#endregion
//#region src/media/read-capability.ts
function createAgentScopedHostMediaReadFile(params) {
	if (!resolveEffectiveToolFsRootExpansionAllowed({
		cfg: params.cfg,
		agentId: params.agentId
	})) return;
	const workspaceRoot = resolveWorkspaceRoot(params.workspaceDir ?? (params.agentId ? resolveAgentWorkspaceDir(params.cfg, params.agentId) : void 0));
	return async (filePath) => {
		return (await readLocalFileSafely({ filePath: resolvePathFromInput(filePath, workspaceRoot) })).buffer;
	};
}
function resolveAgentScopedOutboundMediaAccess(params) {
	const localRoots = params.mediaAccess?.localRoots ?? getAgentScopedMediaLocalRootsForSources({
		cfg: params.cfg,
		agentId: params.agentId,
		mediaSources: params.mediaSources
	});
	const resolvedWorkspaceDir = params.workspaceDir ?? params.mediaAccess?.workspaceDir ?? (params.agentId ? resolveAgentWorkspaceDir(params.cfg, params.agentId) : void 0);
	const readFile = params.mediaAccess?.readFile ?? params.mediaReadFile ?? createAgentScopedHostMediaReadFile({
		cfg: params.cfg,
		agentId: params.agentId,
		workspaceDir: resolvedWorkspaceDir
	});
	return {
		...localRoots?.length ? { localRoots } : {},
		...readFile ? { readFile } : {},
		...resolvedWorkspaceDir ? { workspaceDir: resolvedWorkspaceDir } : {}
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
//#region src/media/audio-tags.ts
/**
* Extract audio mode tag from text.
* Supports [[audio_as_voice]] to send audio as voice message instead of file.
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
const TRAVERSAL_SEGMENT_RE = /(?:^|[/\\])\.\.(?:[/\\]|$)/;
function hasTraversalOrHomeDirPrefix(candidate) {
	return candidate.startsWith("../") || candidate === ".." || candidate.startsWith("~") || TRAVERSAL_SEGMENT_RE.test(candidate);
}
function looksLikeLocalFilePath(candidate) {
	return candidate.startsWith("/") || candidate.startsWith("./") || candidate.startsWith("../") || candidate.startsWith("~") || WINDOWS_DRIVE_RE.test(candidate) || candidate.startsWith("\\\\") || !SCHEME_RE.test(candidate) && (candidate.includes("/") || candidate.includes("\\"));
}
function isLikelyLocalPath(candidate) {
	if (hasTraversalOrHomeDirPrefix(candidate)) return false;
	return candidate.startsWith("/") || candidate.startsWith("./") || WINDOWS_DRIVE_RE.test(candidate) || candidate.startsWith("\\\\") || !SCHEME_RE.test(candidate) && (candidate.includes("/") || candidate.includes("\\"));
}
function isValidMedia(candidate, opts) {
	if (!candidate) return false;
	if (candidate.length > 4096) return false;
	if (!opts?.allowSpaces && /\s/.test(candidate)) return false;
	if (/^https?:\/\//i.test(candidate)) return true;
	if (isLikelyLocalPath(candidate)) return true;
	if (hasTraversalOrHomeDirPrefix(candidate)) return false;
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
function mayContainFenceMarkers(input) {
	return input.includes("```") || input.includes("~~~");
}
function isInsideFence(fenceSpans, offset) {
	return fenceSpans.some((span) => offset >= span.start && offset < span.end);
}
function splitMediaFromOutput(raw) {
	const trimmedRaw = raw.trimEnd();
	if (!trimmedRaw.trim()) return { text: "" };
	const mayContainMediaToken = /media:/i.test(trimmedRaw);
	const mayContainAudioTag = trimmedRaw.includes("[[");
	if (!mayContainMediaToken && !mayContainAudioTag) return { text: trimmedRaw };
	const media = [];
	let foundMediaToken = false;
	const hasFenceMarkers = mayContainFenceMarkers(trimmedRaw);
	const fenceSpans = hasFenceMarkers ? parseFenceSpans(trimmedRaw) : [];
	const lines = trimmedRaw.split("\n");
	const keptLines = [];
	let lineOffset = 0;
	for (const line of lines) {
		if (hasFenceMarkers && isInsideFence(fenceSpans, lineOffset)) {
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
			const looksLikeLocalPath = looksLikeLocalFilePath(trimmedPayload) || trimmedPayload.startsWith("file://");
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
	const silentToken = options.silentToken ?? "NO_REPLY";
	const isSilent = isSilentReplyPayloadText(text, silentToken);
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
	const normalized = [];
	for (const payload of payloads) {
		if (shouldSuppressReasoningPayload(payload)) continue;
		const parsed = parseReplyDirectives(payload.text ?? "");
		const explicitMediaUrls = payload.mediaUrls ?? parsed.mediaUrls;
		const explicitMediaUrl = payload.mediaUrl ?? parsed.mediaUrl;
		const mergedMedia = mergeMediaUrls(explicitMediaUrls, explicitMediaUrl ? [explicitMediaUrl] : void 0);
		const resolvedMediaUrl = (explicitMediaUrls?.length ?? 0) > 1 ? void 0 : explicitMediaUrl;
		const next = {
			...payload,
			text: formatBtwTextForExternalDelivery({
				...payload,
				text: parsed.text ?? ""
			}) ?? "",
			mediaUrls: mergedMedia.length ? mergedMedia : void 0,
			mediaUrl: resolvedMediaUrl,
			replyToId: payload.replyToId ?? parsed.replyToId,
			replyToTag: payload.replyToTag || parsed.replyToTag,
			replyToCurrent: payload.replyToCurrent || parsed.replyToCurrent,
			audioAsVoice: Boolean(payload.audioAsVoice || parsed.audioAsVoice)
		};
		if (parsed.isSilent && mergedMedia.length === 0) continue;
		if (!isRenderablePayload(next)) continue;
		normalized.push(next);
	}
	return normalized;
}
function normalizeOutboundPayloads(payloads) {
	const normalizedPayloads = [];
	for (const payload of normalizeReplyPayloadsForDelivery(payloads)) {
		const parts = resolveSendableOutboundReplyParts(payload);
		const interactive = payload.interactive;
		const channelData = payload.channelData;
		const hasChannelData = hasReplyChannelData(channelData);
		const hasInteractive = hasInteractiveReplyBlocks(interactive);
		const text = parts.text;
		if (!hasReplyPayloadContent({
			...payload,
			text,
			mediaUrls: parts.mediaUrls
		}, { hasChannelData })) continue;
		normalizedPayloads.push({
			text,
			mediaUrls: parts.mediaUrls,
			audioAsVoice: payload.audioAsVoice === true ? true : void 0,
			...hasInteractive ? { interactive } : {},
			...hasChannelData ? { channelData } : {}
		});
	}
	return normalizedPayloads;
}
function normalizeOutboundPayloadsForJson(payloads) {
	const normalized = [];
	for (const payload of normalizeReplyPayloadsForDelivery(payloads)) {
		const parts = resolveSendableOutboundReplyParts(payload);
		normalized.push({
			text: parts.text,
			mediaUrl: payload.mediaUrl ?? null,
			mediaUrls: parts.mediaUrls.length ? parts.mediaUrls : void 0,
			audioAsVoice: payload.audioAsVoice === true ? true : void 0,
			interactive: payload.interactive,
			channelData: payload.channelData
		});
	}
	return normalized;
}
function formatOutboundPayloadLog(payload) {
	const lines = [];
	if (payload.text) lines.push(payload.text.trimEnd());
	for (const url of payload.mediaUrls) lines.push(`MEDIA:${url}`);
	return lines.join("\n");
}
//#endregion
//#region src/infra/outbound/sanitize-text.ts
/**
* Sanitize model output for plain-text messaging surfaces.
*
* LLMs occasionally produce HTML tags (`<br>`, `<b>`, `<i>`, etc.) that render
* correctly on web but appear as literal text on WhatsApp, Signal, SMS, and IRC.
*
* Converts common inline HTML to lightweight-markup equivalents used by
* WhatsApp/Signal/Telegram and strips any remaining tags.
*
* @see https://github.com/openclaw/openclaw/issues/31884
* @see https://github.com/openclaw/openclaw/issues/18558
*/
/** Channels where HTML tags should be converted/stripped. */
const PLAIN_TEXT_SURFACES = new Set([
	"whatsapp",
	"signal",
	"sms",
	"irc",
	"telegram",
	"imessage",
	"googlechat"
]);
/** Returns `true` when the channel cannot render raw HTML. */
function isPlainTextSurface(channelId) {
	return PLAIN_TEXT_SURFACES.has(channelId.toLowerCase());
}
/**
* Convert common HTML tags to their plain-text/lightweight-markup equivalents
* and strip anything that remains.
*
* The function is intentionally conservative — it only targets tags that models
* are known to produce and avoids false positives on angle brackets in normal
* prose (e.g. `a < b`).
*/
function sanitizeForPlainText(text) {
	return text.replace(/<((?:https?:\/\/|mailto:)[^<>\s]+)>/gi, "$1").replace(/<br\s*\/?>/gi, "\n").replace(/<\/?(p|div)>/gi, "\n").replace(/<(b|strong)>(.*?)<\/\1>/gi, "*$2*").replace(/<(i|em)>(.*?)<\/\1>/gi, "_$2_").replace(/<(s|strike|del)>(.*?)<\/\1>/gi, "~$2~").replace(/<code>(.*?)<\/code>/gi, "`$1`").replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n*$1*\n").replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n").replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, "").replace(/\n{3,}/g, "\n\n");
}
//#endregion
//#region src/infra/outbound/deliver.ts
const log = createSubsystemLogger("outbound/deliver");
async function createChannelHandler(params) {
	resolveOutboundChannelPlugin({
		channel: params.channel,
		cfg: params.cfg
	});
	const outbound = await loadChannelOutboundAdapter(params.channel);
	const handler = createPluginHandler({
		...params,
		outbound
	});
	if (!handler) throw new Error(`Outbound not configured for channel: ${params.channel}`);
	return handler;
}
function createPluginHandler(params) {
	const outbound = params.outbound;
	if (!outbound?.sendText) return null;
	const baseCtx = createChannelOutboundContextBase(params);
	const sendText = outbound.sendText;
	const sendMedia = outbound.sendMedia;
	const chunker = outbound.chunker ?? null;
	const chunkerMode = outbound.chunkerMode;
	const resolveCtx = (overrides) => ({
		...baseCtx,
		replyToId: overrides?.replyToId ?? baseCtx.replyToId,
		threadId: overrides?.threadId ?? baseCtx.threadId,
		audioAsVoice: overrides?.audioAsVoice
	});
	return {
		chunker,
		chunkerMode,
		textChunkLimit: outbound.textChunkLimit,
		supportsMedia: Boolean(sendMedia),
		normalizePayload: outbound.normalizePayload ? (payload) => outbound.normalizePayload({ payload }) : void 0,
		shouldSkipPlainTextSanitization: outbound.shouldSkipPlainTextSanitization ? (payload) => outbound.shouldSkipPlainTextSanitization({ payload }) : void 0,
		resolveEffectiveTextChunkLimit: outbound.resolveEffectiveTextChunkLimit ? (fallbackLimit) => outbound.resolveEffectiveTextChunkLimit({
			cfg: params.cfg,
			accountId: params.accountId ?? void 0,
			fallbackLimit
		}) : void 0,
		sendPayload: outbound.sendPayload ? async (payload, overrides) => outbound.sendPayload({
			...resolveCtx(overrides),
			text: payload.text ?? "",
			mediaUrl: payload.mediaUrl,
			payload
		}) : void 0,
		sendFormattedText: outbound.sendFormattedText ? async (text, overrides) => outbound.sendFormattedText({
			...resolveCtx(overrides),
			text
		}) : void 0,
		sendFormattedMedia: outbound.sendFormattedMedia ? async (caption, mediaUrl, overrides) => outbound.sendFormattedMedia({
			...resolveCtx(overrides),
			text: caption,
			mediaUrl
		}) : void 0,
		sendText: async (text, overrides) => sendText({
			...resolveCtx(overrides),
			text
		}),
		sendMedia: async (caption, mediaUrl, overrides) => {
			if (sendMedia) return sendMedia({
				...resolveCtx(overrides),
				text: caption,
				mediaUrl
			});
			return sendText({
				...resolveCtx(overrides),
				text: caption
			});
		}
	};
}
function createChannelOutboundContextBase(params) {
	return {
		cfg: params.cfg,
		to: params.to,
		accountId: params.accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		identity: params.identity,
		gifPlayback: params.gifPlayback,
		forceDocument: params.forceDocument,
		deps: params.deps,
		silent: params.silent,
		mediaAccess: params.mediaAccess,
		mediaLocalRoots: params.mediaAccess?.localRoots,
		mediaReadFile: params.mediaAccess?.readFile,
		gatewayClientScopes: params.gatewayClientScopes
	};
}
const isAbortError = (err) => err instanceof Error && err.name === "AbortError";
function collectPayloadMediaSources(payloads) {
	const mediaSources = [];
	for (const payload of normalizeReplyPayloadsForDelivery(payloads)) mediaSources.push(...resolveSendableOutboundReplyParts(payload).mediaUrls);
	return mediaSources;
}
function normalizeEmptyPayloadForDelivery(payload) {
	const text = typeof payload.text === "string" ? payload.text : "";
	if (!text.trim()) {
		if (!hasReplyPayloadContent({
			...payload,
			text
		})) return null;
		if (text) return {
			...payload,
			text: ""
		};
	}
	return payload;
}
function normalizePayloadsForChannelDelivery(payloads, channel, handler) {
	const normalizedPayloads = [];
	for (const payload of normalizeReplyPayloadsForDelivery(payloads)) {
		let sanitizedPayload = payload;
		if (isPlainTextSurface(channel) && sanitizedPayload.text) {
			if (!handler.shouldSkipPlainTextSanitization?.(sanitizedPayload)) sanitizedPayload = {
				...sanitizedPayload,
				text: sanitizeForPlainText(sanitizedPayload.text)
			};
		}
		const normalizedPayload = handler.normalizePayload ? handler.normalizePayload(sanitizedPayload) : sanitizedPayload;
		const normalized = normalizedPayload ? normalizeEmptyPayloadForDelivery(normalizedPayload) : null;
		if (normalized) normalizedPayloads.push(normalized);
	}
	return normalizedPayloads;
}
function buildPayloadSummary(payload) {
	const parts = resolveSendableOutboundReplyParts(payload);
	return {
		text: parts.text,
		mediaUrls: parts.mediaUrls,
		audioAsVoice: payload.audioAsVoice === true ? true : void 0,
		interactive: payload.interactive,
		channelData: payload.channelData
	};
}
function createMessageSentEmitter(params) {
	const hasMessageSentHooks = params.hookRunner?.hasHooks("message_sent") ?? false;
	const canEmitInternalHook = Boolean(params.sessionKeyForInternalHooks);
	const emitMessageSent = (event) => {
		if (!hasMessageSentHooks && !canEmitInternalHook) return;
		const canonical = buildCanonicalSentMessageHookContext({
			to: params.to,
			content: event.content,
			success: event.success,
			error: event.error,
			channelId: params.channel,
			accountId: params.accountId ?? void 0,
			conversationId: params.to,
			messageId: event.messageId,
			isGroup: params.mirrorIsGroup,
			groupId: params.mirrorGroupId
		});
		if (hasMessageSentHooks) fireAndForgetHook(params.hookRunner.runMessageSent(toPluginMessageSentEvent(canonical), toPluginMessageContext(canonical)), "deliverOutboundPayloads: message_sent plugin hook failed", (message) => {
			log.warn(message);
		});
		if (!canEmitInternalHook) return;
		fireAndForgetHook(triggerInternalHook(createInternalHookEvent("message", "sent", params.sessionKeyForInternalHooks, toInternalMessageSentContext(canonical))), "deliverOutboundPayloads: message:sent internal hook failed", (message) => {
			log.warn(message);
		});
	};
	return {
		emitMessageSent,
		hasMessageSentHooks
	};
}
async function applyMessageSendingHook(params) {
	if (!params.enabled) return {
		cancelled: false,
		payload: params.payload,
		payloadSummary: params.payloadSummary
	};
	try {
		const sendingResult = await params.hookRunner.runMessageSending({
			to: params.to,
			content: params.payloadSummary.text,
			metadata: {
				channel: params.channel,
				accountId: params.accountId,
				mediaUrls: params.payloadSummary.mediaUrls
			}
		}, {
			channelId: params.channel,
			accountId: params.accountId ?? void 0
		});
		if (sendingResult?.cancel) return {
			cancelled: true,
			payload: params.payload,
			payloadSummary: params.payloadSummary
		};
		if (sendingResult?.content == null) return {
			cancelled: false,
			payload: params.payload,
			payloadSummary: params.payloadSummary
		};
		return {
			cancelled: false,
			payload: {
				...params.payload,
				text: sendingResult.content
			},
			payloadSummary: {
				...params.payloadSummary,
				text: sendingResult.content
			}
		};
	} catch {
		return {
			cancelled: false,
			payload: params.payload,
			payloadSummary: params.payloadSummary
		};
	}
}
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
		forceDocument: params.forceDocument,
		silent: params.silent,
		mirror: params.mirror,
		gatewayClientScopes: params.gatewayClientScopes
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
	const mediaAccess = resolveAgentScopedOutboundMediaAccess({
		cfg,
		agentId: params.session?.agentId ?? params.mirror?.agentId,
		mediaSources: collectPayloadMediaSources(payloads)
	});
	const results = [];
	const handler = await createChannelHandler({
		cfg,
		channel,
		to,
		deps,
		accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		identity: params.identity,
		gifPlayback: params.gifPlayback,
		forceDocument: params.forceDocument,
		silent: params.silent,
		mediaAccess,
		gatewayClientScopes: params.gatewayClientScopes
	});
	const configuredTextLimit = handler.chunker ? resolveTextChunkLimit(cfg, channel, accountId, { fallbackLimit: handler.textChunkLimit }) : void 0;
	const textLimit = handler.resolveEffectiveTextChunkLimit ? handler.resolveEffectiveTextChunkLimit(configuredTextLimit) : configuredTextLimit;
	const chunkMode = handler.chunker ? resolveChunkMode(cfg, channel, accountId) : "length";
	const sendTextChunks = async (text, overrides) => {
		throwIfAborted(abortSignal);
		if (!handler.chunker || textLimit === void 0) {
			results.push(await handler.sendText(text, overrides));
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
					results.push(await handler.sendText(chunk, overrides));
				}
			}
			return;
		}
		const chunks = handler.chunker(text, textLimit);
		for (const chunk of chunks) {
			throwIfAborted(abortSignal);
			results.push(await handler.sendText(chunk, overrides));
		}
	};
	const normalizedPayloads = normalizePayloadsForChannelDelivery(payloads, channel, handler);
	const hookRunner = getGlobalHookRunner();
	const sessionKeyForInternalHooks = params.mirror?.sessionKey ?? params.session?.key;
	const mirrorIsGroup = params.mirror?.isGroup;
	const mirrorGroupId = params.mirror?.groupId;
	const { emitMessageSent, hasMessageSentHooks } = createMessageSentEmitter({
		hookRunner,
		channel,
		to,
		accountId,
		sessionKeyForInternalHooks,
		mirrorIsGroup,
		mirrorGroupId
	});
	const hasMessageSendingHooks = hookRunner?.hasHooks("message_sending") ?? false;
	if (hasMessageSentHooks && params.session?.agentId && !sessionKeyForInternalHooks) log.warn("deliverOutboundPayloads: session.agentId present without session key; internal message:sent hook will be skipped", {
		channel,
		to,
		agentId: params.session.agentId
	});
	for (const payload of normalizedPayloads) {
		let payloadSummary = buildPayloadSummary(payload);
		try {
			throwIfAborted(abortSignal);
			const hookResult = await applyMessageSendingHook({
				hookRunner,
				enabled: hasMessageSendingHooks,
				payload,
				payloadSummary,
				to,
				channel,
				accountId
			});
			if (hookResult.cancelled) continue;
			const effectivePayload = hookResult.payload;
			payloadSummary = hookResult.payloadSummary;
			params.onPayload?.(payloadSummary);
			const sendOverrides = {
				replyToId: effectivePayload.replyToId ?? params.replyToId ?? void 0,
				threadId: params.threadId ?? void 0,
				audioAsVoice: effectivePayload.audioAsVoice === true ? true : void 0,
				forceDocument: params.forceDocument
			};
			if (handler.sendPayload && hasReplyPayloadContent({
				interactive: effectivePayload.interactive,
				channelData: effectivePayload.channelData
			})) {
				const delivery = await handler.sendPayload(effectivePayload, sendOverrides);
				results.push(delivery);
				emitMessageSent({
					success: true,
					content: payloadSummary.text,
					messageId: delivery.messageId
				});
				continue;
			}
			if (payloadSummary.mediaUrls.length === 0) {
				const beforeCount = results.length;
				if (handler.sendFormattedText) results.push(...await handler.sendFormattedText(payloadSummary.text, sendOverrides));
				else await sendTextChunks(payloadSummary.text, sendOverrides);
				const messageId = results.at(-1)?.messageId;
				emitMessageSent({
					success: results.length > beforeCount,
					content: payloadSummary.text,
					messageId
				});
				continue;
			}
			if (!handler.supportsMedia) {
				log.warn("Plugin outbound adapter does not implement sendMedia; media URLs will be dropped and text fallback will be used", {
					channel,
					to,
					mediaCount: payloadSummary.mediaUrls.length
				});
				const fallbackText = payloadSummary.text.trim();
				if (!fallbackText) throw new Error("Plugin outbound adapter does not implement sendMedia and no text fallback is available for media payload");
				const beforeCount = results.length;
				await sendTextChunks(fallbackText, sendOverrides);
				const messageId = results.at(-1)?.messageId;
				emitMessageSent({
					success: results.length > beforeCount,
					content: payloadSummary.text,
					messageId
				});
				continue;
			}
			let lastMessageId;
			await sendMediaWithLeadingCaption({
				mediaUrls: payloadSummary.mediaUrls,
				caption: payloadSummary.text,
				send: async ({ mediaUrl, caption }) => {
					throwIfAborted(abortSignal);
					if (handler.sendFormattedMedia) {
						const delivery = await handler.sendFormattedMedia(caption ?? "", mediaUrl, sendOverrides);
						results.push(delivery);
						lastMessageId = delivery.messageId;
						return;
					}
					const delivery = await handler.sendMedia(caption ?? "", mediaUrl, sendOverrides);
					results.push(delivery);
					lastMessageId = delivery.messageId;
				}
			});
			emitMessageSent({
				success: true,
				content: payloadSummary.text,
				messageId: lastMessageId
			});
		} catch (err) {
			emitMessageSent({
				success: false,
				content: payloadSummary.text,
				error: err instanceof Error ? err.message : String(err)
			});
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
			text: mirrorText,
			idempotencyKey: params.mirror.idempotencyKey
		});
	}
	return results;
}
//#endregion
export { toRelativeWorkspacePath as _, normalizeReplyPayloadsForDelivery as a, throwIfAborted as c, resolveWorkspaceRoot as d, createToolFsPolicy as f, toRelativeSandboxPath as g, resolvePathFromInput as h, normalizeOutboundPayloadsForJson as i, resolveAgentScopedOutboundMediaAccess as l, resolveToolFsConfig as m, formatOutboundPayloadLog as n, parseReplyDirectives as o, resolveEffectiveToolFsWorkspaceOnly as p, normalizeOutboundPayloads as r, splitMediaFromOutput as s, deliverOutboundPayloads as t, normalizeWorkspaceDir as u };
