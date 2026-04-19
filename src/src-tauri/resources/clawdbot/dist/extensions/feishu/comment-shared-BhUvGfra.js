import { asOptionalRecord, hasNonEmptyString, isRecord, normalizeOptionalString, readStringValue } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/feishu/src/comment-target.ts
const FEISHU_COMMENT_FILE_TYPES = [
	"doc",
	"docx",
	"file",
	"sheet",
	"slides"
];
function normalizeCommentFileType(value) {
	return typeof value === "string" && FEISHU_COMMENT_FILE_TYPES.includes(value) ? value : void 0;
}
function buildFeishuCommentTarget(params) {
	return `comment:${params.fileType}:${params.fileToken}:${params.commentId}`;
}
function parseFeishuCommentTarget(raw) {
	const trimmed = raw?.trim();
	if (!trimmed?.startsWith("comment:")) return null;
	const parts = trimmed.split(":");
	if (parts.length !== 4) return null;
	const fileType = normalizeCommentFileType(parts[1]);
	const fileToken = parts[2]?.trim();
	const commentId = parts[3]?.trim();
	if (!fileType || !fileToken || !commentId) return null;
	return {
		fileType,
		fileToken,
		commentId
	};
}
//#endregion
//#region extensions/feishu/src/comment-shared.ts
function encodeQuery(params) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		const trimmed = value?.trim();
		if (trimmed) query.set(key, trimmed);
	}
	const queryString = query.toString();
	return queryString ? `?${queryString}` : "";
}
const readString = readStringValue;
const normalizeString = normalizeOptionalString;
const isRecord$1 = isRecord;
const asRecord = asOptionalRecord;
const hasNonEmptyString$1 = hasNonEmptyString;
function readDocsLinkUrl(element) {
	const docsLink = isRecord$1(element.docs_link) ? element.docs_link : void 0;
	return normalizeString(docsLink?.url) || normalizeString(docsLink?.link) || normalizeString(element.url) || normalizeString(element.link) || void 0;
}
function readMentionUserId(element) {
	const mention = isRecord$1(element.mention) ? element.mention : void 0;
	return normalizeString((isRecord$1(element.person) ? element.person : void 0)?.user_id) || normalizeString(mention?.user_id) || normalizeString(mention?.open_id) || normalizeString(element.mention_user) || normalizeString(element.user_id) || void 0;
}
function readMentionDisplayText(element, userId) {
	const mention = isRecord$1(element.mention) ? element.mention : void 0;
	const mentionName = normalizeString(mention?.name) || normalizeString(mention?.display_name) || normalizeString(element.name);
	return mentionName ? `@${mentionName}` : `@${userId}`;
}
function normalizeCommentText(parts) {
	return parts.join("").trim() || void 0;
}
function normalizeCommentSemanticText(parts) {
	return parts.join("").replace(/\s+/g, " ").trim() || void 0;
}
function readElementTextPreservingWhitespace(element) {
	return (isRecord$1(element.text_run) ? readString(element.text_run.content) || readString(element.text_run.text) : void 0) || readString(element.text) || readString(element.content) || readString(element.name) || void 0;
}
const FEISHU_LINK_TOKEN_MIN_LENGTH = 22;
const FEISHU_LINK_TOKEN_MAX_LENGTH = 28;
const COMMENT_LINK_KIND_ALIASES = new Map([
	["doc", "doc"],
	["docs", "doc"],
	["docx", "docx"],
	["sheet", "sheet"],
	["sheets", "sheet"],
	["slide", "slides"],
	["slides", "slides"],
	["file", "file"],
	["files", "file"],
	["wiki", "wiki"],
	["mindnote", "mindnote"],
	["mindnotes", "mindnote"],
	["bitable", "bitable"],
	["base", "base"]
]);
function isCommentFileType(value) {
	return typeof value === "string" && FEISHU_COMMENT_FILE_TYPES.includes(value);
}
function isReasonableFeishuLinkToken(token) {
	return typeof token === "string" && token.length >= FEISHU_LINK_TOKEN_MIN_LENGTH && token.length <= FEISHU_LINK_TOKEN_MAX_LENGTH;
}
function parseCommentLinkedDocumentPath(pathname) {
	const segments = pathname.split("/").map((segment) => segment.trim()).filter(Boolean);
	const offset = segments[0]?.toLowerCase() === "space" ? 1 : 0;
	const kind = COMMENT_LINK_KIND_ALIASES.get(segments[offset]?.toLowerCase() ?? "");
	const token = normalizeString(segments[offset + 1]);
	if (!kind || !isReasonableFeishuLinkToken(token)) return null;
	return {
		urlKind: kind,
		token
	};
}
function hasResolvedLinkedDocumentReference(link) {
	return link.urlKind !== "unknown" && (Boolean(link.resolvedObjToken) || Boolean(link.wikiNodeToken));
}
function resolveCommentLinkedDocumentFromUrl(params) {
	const link = {
		rawUrl: params.rawUrl,
		urlKind: "unknown"
	};
	try {
		const parsedPath = parseCommentLinkedDocumentPath(new URL(params.rawUrl).pathname);
		if (!parsedPath) return link;
		const { urlKind, token } = parsedPath;
		link.urlKind = urlKind;
		if (urlKind === "wiki") {
			link.urlKind = "wiki";
			link.wikiNodeToken = token;
		} else {
			link.resolvedObjType = urlKind;
			link.resolvedObjToken = token;
		}
		if (link.resolvedObjType && link.resolvedObjToken && isCommentFileType(link.resolvedObjType) && params.currentDocument?.fileType === link.resolvedObjType && params.currentDocument.fileToken === link.resolvedObjToken) link.isCurrentDocument = true;
		else if (link.resolvedObjType && link.resolvedObjToken && isCommentFileType(link.resolvedObjType)) link.isCurrentDocument = false;
	} catch {
		return link;
	}
	return link;
}
function parseCommentContentElements(params) {
	const elements = Array.isArray(params.elements) ? params.elements : [];
	const plainTextParts = [];
	const semanticTextParts = [];
	const mentions = [];
	const linkedDocuments = [];
	const botIds = new Set(Array.from(params.botOpenIds ?? []).map((value) => normalizeString(value)).filter((value) => Boolean(value)));
	const linkedDocumentKeys = /* @__PURE__ */ new Set();
	let botMentioned = false;
	for (const rawElement of elements) {
		if (!isRecord$1(rawElement)) continue;
		const element = rawElement;
		const type = normalizeString(element.type);
		const text = (type === "text_run" ? readElementTextPreservingWhitespace(element) : void 0) || (type === "text" ? readElementTextPreservingWhitespace(element) : void 0) || (type === "docs_link" || type === "link" ? readDocsLinkUrl(element) : void 0) || (type === "mention" || type === "mention_user" || type === "person" ? (() => {
			const userId = readMentionUserId(element);
			return userId ? readMentionDisplayText(element, userId) : void 0;
		})() : void 0) || readElementTextPreservingWhitespace(element) || void 0;
		if (type === "mention" || type === "mention_user" || type === "person") {
			const userId = readMentionUserId(element);
			if (userId) {
				const displayText = readMentionDisplayText(element, userId);
				const isBotMention = botIds.has(userId);
				mentions.push({
					userId,
					displayText,
					isBotMention
				});
				plainTextParts.push(displayText);
				if (!isBotMention) semanticTextParts.push(displayText);
				else botMentioned = true;
				continue;
			}
		}
		if (type === "docs_link" || type === "link") {
			const rawUrl = readDocsLinkUrl(element);
			if (rawUrl) {
				plainTextParts.push(rawUrl);
				semanticTextParts.push(rawUrl);
				const linkedDocument = resolveCommentLinkedDocumentFromUrl({
					rawUrl,
					currentDocument: params.currentDocument
				});
				if (hasResolvedLinkedDocumentReference(linkedDocument)) {
					const key = [
						linkedDocument.rawUrl,
						linkedDocument.urlKind,
						linkedDocument.resolvedObjType,
						linkedDocument.resolvedObjToken,
						linkedDocument.wikiNodeToken
					].join(":");
					if (!linkedDocumentKeys.has(key)) {
						linkedDocumentKeys.add(key);
						linkedDocuments.push(linkedDocument);
					}
				}
				continue;
			}
		}
		if (text) {
			plainTextParts.push(text);
			semanticTextParts.push(text);
		}
	}
	return {
		plainText: normalizeCommentText(plainTextParts),
		semanticText: normalizeCommentSemanticText(semanticTextParts),
		mentions,
		linkedDocuments,
		botMentioned
	};
}
function extractReplyText(reply) {
	if (!reply || !isRecord$1(reply.content)) return;
	return parseCommentContentElements({ elements: Array.isArray(reply.content.elements) ? reply.content.elements : [] }).plainText;
}
//#endregion
export { isRecord$1 as a, readString as c, parseFeishuCommentTarget as d, hasNonEmptyString$1 as i, buildFeishuCommentTarget as l, encodeQuery as n, normalizeString as o, extractReplyText as r, parseCommentContentElements as s, asRecord as t, normalizeCommentFileType as u };
