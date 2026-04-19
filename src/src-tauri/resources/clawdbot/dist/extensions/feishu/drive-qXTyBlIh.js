import { a as isRecord$1, c as readString, d as parseFeishuCommentTarget, n as encodeQuery, r as extractReplyText } from "./comment-shared-BhUvGfra.js";
import { a as createFeishuClient, f as resolveFeishuAccount, l as listEnabledFeishuAccounts, p as resolveFeishuRuntimeAccount, u as listFeishuAccountIds } from "./probe-DftphXPF.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { Type } from "@sinclair/typebox";
//#region extensions/feishu/src/targets.ts
const CHAT_ID_PREFIX = "oc_";
const OPEN_ID_PREFIX = "ou_";
const USER_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
function stripProviderPrefix(raw) {
	return raw.replace(/^(feishu|lark):/i, "").trim();
}
function detectIdType(id) {
	const trimmed = id.trim();
	if (trimmed.startsWith(CHAT_ID_PREFIX)) return "chat_id";
	if (trimmed.startsWith(OPEN_ID_PREFIX)) return "open_id";
	if (USER_ID_REGEX.test(trimmed)) return "user_id";
	return null;
}
function normalizeFeishuTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const withoutProvider = stripProviderPrefix(trimmed);
	const lowered = normalizeLowercaseStringOrEmpty(withoutProvider);
	if (lowered.startsWith("chat:")) return withoutProvider.slice(5).trim() || null;
	if (lowered.startsWith("group:")) return withoutProvider.slice(6).trim() || null;
	if (lowered.startsWith("channel:")) return withoutProvider.slice(8).trim() || null;
	if (lowered.startsWith("user:")) return withoutProvider.slice(5).trim() || null;
	if (lowered.startsWith("dm:")) return withoutProvider.slice(3).trim() || null;
	if (lowered.startsWith("open_id:")) return withoutProvider.slice(8).trim() || null;
	return withoutProvider;
}
function resolveReceiveIdType(id) {
	const trimmed = id.trim();
	const lowered = normalizeLowercaseStringOrEmpty(trimmed);
	if (lowered.startsWith("chat:") || lowered.startsWith("group:") || lowered.startsWith("channel:")) return "chat_id";
	if (lowered.startsWith("open_id:")) return "open_id";
	if (lowered.startsWith("user:") || lowered.startsWith("dm:")) return trimmed.replace(/^(user|dm):/i, "").trim().startsWith(OPEN_ID_PREFIX) ? "open_id" : "user_id";
	if (trimmed.startsWith(CHAT_ID_PREFIX)) return "chat_id";
	if (trimmed.startsWith(OPEN_ID_PREFIX)) return "open_id";
	return "user_id";
}
function looksLikeFeishuId(raw) {
	const trimmed = stripProviderPrefix(raw.trim());
	if (!trimmed) return false;
	if (/^(chat|group|channel|user|dm|open_id):/i.test(trimmed)) return true;
	if (trimmed.startsWith(CHAT_ID_PREFIX)) return true;
	if (trimmed.startsWith(OPEN_ID_PREFIX)) return true;
	return false;
}
//#endregion
//#region extensions/feishu/src/tools-config.ts
/**
* Default tool configuration.
* - doc, chat, wiki, drive, scopes: enabled by default
* - perm: disabled by default (sensitive operation)
*/
const DEFAULT_TOOLS_CONFIG = {
	doc: true,
	chat: true,
	wiki: true,
	drive: true,
	perm: false,
	scopes: true
};
/**
* Resolve tools config with defaults.
*/
function resolveToolsConfig(cfg) {
	return {
		...DEFAULT_TOOLS_CONFIG,
		...cfg
	};
}
//#endregion
//#region extensions/feishu/src/tool-account.ts
function resolveImplicitToolAccountId(params) {
	const explicitAccountId = normalizeOptionalString(params.executeParams?.accountId);
	if (explicitAccountId) return explicitAccountId;
	const contextualAccountId = normalizeOptionalString(params.defaultAccountId);
	if (contextualAccountId && listFeishuAccountIds(params.api.config).includes(contextualAccountId)) {
		if (resolveFeishuAccount({
			cfg: params.api.config,
			accountId: contextualAccountId
		}).enabled) return contextualAccountId;
	}
	const configuredDefaultAccountId = normalizeOptionalString((params.api.config?.channels?.feishu)?.defaultAccount);
	if (configuredDefaultAccountId) return configuredDefaultAccountId;
}
function resolveFeishuToolAccount(params) {
	if (!params.api.config) throw new Error("Feishu config unavailable");
	return resolveFeishuRuntimeAccount({
		cfg: params.api.config,
		accountId: resolveImplicitToolAccountId(params)
	});
}
function createFeishuToolClient(params) {
	return createFeishuClient(resolveFeishuToolAccount(params));
}
function resolveAnyEnabledFeishuToolsConfig(accounts) {
	const merged = {
		doc: false,
		chat: false,
		wiki: false,
		drive: false,
		perm: false,
		scopes: false
	};
	for (const account of accounts) {
		const cfg = resolveToolsConfig(account.config.tools);
		merged.doc = merged.doc || cfg.doc;
		merged.chat = merged.chat || cfg.chat;
		merged.wiki = merged.wiki || cfg.wiki;
		merged.drive = merged.drive || cfg.drive;
		merged.perm = merged.perm || cfg.perm;
		merged.scopes = merged.scopes || cfg.scopes;
	}
	return merged;
}
//#endregion
//#region extensions/feishu/src/tool-result.ts
function jsonToolResult(data) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(data, null, 2)
		}],
		details: data
	};
}
function unknownToolActionResult(action) {
	return jsonToolResult({ error: `Unknown action: ${String(action)}` });
}
function toolExecutionErrorResult(error) {
	return jsonToolResult({ error: formatErrorMessage(error) });
}
//#endregion
//#region extensions/feishu/src/comment-reaction.ts
const COMMENT_TYPING_REACTION_TYPE = "Typing";
const COMMENT_REACTION_TIMEOUT_MS = 3e4;
const commentTypingReactionState = /* @__PURE__ */ new Map();
function buildCommentTypingReactionKey(params) {
	return `${params.fileType}:${params.fileToken}:${params.replyId}`;
}
function ensureCommentTypingReactionState(key) {
	const existing = commentTypingReactionState.get(key);
	if (existing) return existing;
	const created = {
		active: false,
		cleaned: false,
		cleanupPromise: void 0
	};
	commentTypingReactionState.set(key, created);
	return created;
}
async function requestCommentTypingReactionWithClient(params) {
	try {
		const response = await params.client.request({
			method: "POST",
			url: `/open-apis/drive/v2/files/${encodeURIComponent(params.fileToken)}/comments/reaction` + encodeQuery({ file_type: params.fileType }),
			data: {
				action: params.action,
				reply_id: params.replyId,
				reaction_type: COMMENT_TYPING_REACTION_TYPE
			},
			timeout: COMMENT_REACTION_TIMEOUT_MS
		});
		if (response.code === 0) return true;
		params.runtime?.log?.(`${params.logPrefix ?? "[feishu]"}: comment typing reaction ${params.action} failed reply=${params.replyId} file=${params.fileType}:${params.fileToken} code=${response.code ?? "unknown"} msg=${response.msg ?? "unknown"} log_id=${response.log_id ?? response.error?.log_id ?? "unknown"}`);
	} catch (error) {
		params.runtime?.log?.(`${params.logPrefix ?? "[feishu]"}: comment typing reaction ${params.action} threw reply=${params.replyId} file=${params.fileType}:${params.fileToken} error=${formatCommentReactionFailure(error)}`);
	}
	return false;
}
function formatCommentReactionFailure(error) {
	if (!isRecord$1(error)) return typeof error === "string" ? error : JSON.stringify(error);
	const response = isRecord$1(error.response) ? error.response : void 0;
	const responseData = isRecord$1(response?.data) ? response?.data : void 0;
	return JSON.stringify({
		message: typeof error.message === "string" ? error.message : typeof error === "string" ? error : JSON.stringify(error),
		code: readString(error.code),
		method: readString(isRecord$1(error.config) ? error.config.method : void 0),
		url: readString(isRecord$1(error.config) ? error.config.url : void 0),
		http_status: typeof response?.status === "number" ? response.status : void 0,
		feishu_code: typeof responseData?.code === "number" ? responseData.code : readString(responseData?.code),
		feishu_msg: readString(responseData?.msg),
		feishu_log_id: readString(responseData?.log_id) || readString(isRecord$1(responseData?.error) ? responseData.error.log_id : void 0)
	});
}
async function requestCommentTypingReaction(params) {
	const account = resolveFeishuRuntimeAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured || !(account.config.typingIndicator ?? true)) return false;
	return requestCommentTypingReactionWithClient({
		client: createFeishuClient(account),
		fileToken: params.fileToken,
		fileType: params.fileType,
		replyId: params.replyId,
		action: params.action,
		runtime: params.runtime,
		logPrefix: `feishu[${account.accountId}]`
	});
}
async function cleanupCommentTypingReactionByKey(params) {
	const state = ensureCommentTypingReactionState(params.key);
	if (state.cleaned) return false;
	if (state.cleanupPromise) return await state.cleanupPromise;
	const cleanupPromise = (async () => {
		if (!state.active) {
			state.cleaned = true;
			return false;
		}
		const deleted = await params.performDelete();
		if (deleted) {
			state.cleaned = true;
			state.active = false;
		}
		return deleted;
	})();
	state.cleanupPromise = cleanupPromise;
	try {
		return await cleanupPromise;
	} finally {
		state.cleanupPromise = void 0;
		if (state.cleaned) {
			state.active = false;
			commentTypingReactionState.delete(params.key);
		}
	}
}
async function cleanupAmbientCommentTypingReaction(params) {
	const deliveryContext = params.deliveryContext;
	if (deliveryContext?.channel && deliveryContext.channel !== "feishu" && deliveryContext.channel !== "feishu-comment") return false;
	const target = parseFeishuCommentTarget(deliveryContext?.to);
	const replyId = typeof deliveryContext?.threadId === "string" || typeof deliveryContext?.threadId === "number" ? String(deliveryContext.threadId).trim() : "";
	if (!target || !replyId) return false;
	return cleanupCommentTypingReactionByKey({
		key: buildCommentTypingReactionKey({
			fileToken: target.fileToken,
			fileType: target.fileType,
			replyId
		}),
		performDelete: () => requestCommentTypingReactionWithClient({
			client: params.client,
			fileToken: target.fileToken,
			fileType: target.fileType,
			replyId,
			action: "delete",
			runtime: params.runtime,
			logPrefix: "[feishu]"
		})
	});
}
function createCommentTypingReactionLifecycle(params) {
	const key = params.replyId?.trim() ? buildCommentTypingReactionKey({
		fileToken: params.fileToken,
		fileType: params.fileType,
		replyId: params.replyId.trim()
	}) : void 0;
	const state = key ? ensureCommentTypingReactionState(key) : void 0;
	return {
		start: async () => {
			const replyId = params.replyId?.trim();
			if (!state || state.cleaned || state.active || !replyId) return;
			state.active = await requestCommentTypingReaction({
				cfg: params.cfg,
				fileToken: params.fileToken,
				fileType: params.fileType,
				replyId,
				action: "add",
				accountId: params.accountId,
				runtime: params.runtime
			});
		},
		cleanup: async () => {
			const replyId = params.replyId?.trim();
			if (!key || !replyId) return;
			await cleanupCommentTypingReactionByKey({
				key,
				performDelete: () => requestCommentTypingReaction({
					cfg: params.cfg,
					fileToken: params.fileToken,
					fileType: params.fileType,
					replyId,
					action: "delete",
					accountId: params.accountId,
					runtime: params.runtime
				})
			});
		}
	};
}
//#endregion
//#region extensions/feishu/src/drive-schema.ts
const FileType = Type.Union([
	Type.Literal("doc"),
	Type.Literal("docx"),
	Type.Literal("sheet"),
	Type.Literal("bitable"),
	Type.Literal("folder"),
	Type.Literal("file"),
	Type.Literal("mindnote"),
	Type.Literal("shortcut")
]);
const CommentFileType = Type.Union([
	Type.Literal("doc"),
	Type.Literal("docx"),
	Type.Literal("sheet"),
	Type.Literal("file"),
	Type.Literal("slides")
]);
const FeishuDriveSchema = Type.Union([
	Type.Object({
		action: Type.Literal("list"),
		folder_token: Type.Optional(Type.String({ description: "Folder token (optional, omit for root directory)" }))
	}),
	Type.Object({
		action: Type.Literal("info"),
		file_token: Type.String({ description: "File or folder token" }),
		type: FileType
	}),
	Type.Object({
		action: Type.Literal("create_folder"),
		name: Type.String({ description: "Folder name" }),
		folder_token: Type.Optional(Type.String({ description: "Parent folder token (optional, omit for root)" }))
	}),
	Type.Object({
		action: Type.Literal("move"),
		file_token: Type.String({ description: "File token to move" }),
		type: FileType,
		folder_token: Type.String({ description: "Target folder token" })
	}),
	Type.Object({
		action: Type.Literal("delete"),
		file_token: Type.String({ description: "File token to delete" }),
		type: FileType
	}),
	Type.Object({
		action: Type.Literal("list_comments"),
		file_token: Type.String({ description: "Document token" }),
		file_type: Type.Optional(CommentFileType),
		page_size: Type.Optional(Type.Integer({
			minimum: 1,
			maximum: 100,
			description: "Page size"
		})),
		page_token: Type.Optional(Type.String({ description: "Comment page token" }))
	}),
	Type.Object({
		action: Type.Literal("list_comment_replies"),
		file_token: Type.String({ description: "Document token" }),
		file_type: Type.Optional(CommentFileType),
		comment_id: Type.String({ description: "Comment id" }),
		page_size: Type.Optional(Type.Integer({
			minimum: 1,
			maximum: 100,
			description: "Page size"
		})),
		page_token: Type.Optional(Type.String({ description: "Reply page token" }))
	}),
	Type.Object({
		action: Type.Literal("add_comment"),
		file_token: Type.String({ description: "Document token" }),
		file_type: Type.Optional(Type.Union([Type.Literal("doc"), Type.Literal("docx")], { description: "Document type. Defaults to docx when omitted." })),
		content: Type.String({ description: "Comment text content" }),
		block_id: Type.Optional(Type.String({ description: "Optional docx block id for a local comment. Omit to create a full-document comment." }))
	}),
	Type.Object({
		action: Type.Literal("reply_comment"),
		file_token: Type.String({ description: "Document token" }),
		file_type: Type.Optional(CommentFileType),
		comment_id: Type.String({ description: "Comment id" }),
		content: Type.String({ description: "Reply text content" })
	})
]);
//#endregion
//#region extensions/feishu/src/drive.ts
var FeishuReplyCommentError = class extends Error {
	constructor(params) {
		super(params.message);
		this.name = "FeishuReplyCommentError";
		this.httpStatus = params.httpStatus;
		this.feishuCode = params.feishuCode;
		this.feishuMsg = params.feishuMsg;
		this.feishuLogId = params.feishuLogId;
	}
};
const FEISHU_DRIVE_REQUEST_TIMEOUT_MS = 3e4;
function getDriveInternalClient(client) {
	return client;
}
function buildReplyElements(content) {
	return [{
		type: "text",
		text: content
	}];
}
async function requestDriveApi(params) {
	return await getDriveInternalClient(params.client).request({
		method: params.method,
		url: params.url,
		params: params.query ?? {},
		data: params.data ?? {},
		timeout: FEISHU_DRIVE_REQUEST_TIMEOUT_MS
	});
}
function assertDriveApiSuccess(response) {
	if (response.code !== 0) throw new Error(response.msg ?? "Feishu Drive API request failed");
	return response;
}
function normalizeCommentReply(reply) {
	return {
		reply_id: reply.reply_id,
		user_id: reply.user_id,
		create_time: reply.create_time,
		update_time: reply.update_time,
		text: extractReplyText(reply)
	};
}
function normalizeCommentCard(comment) {
	const replies = comment.reply_list?.replies ?? [];
	const rootReply = replies[0];
	return {
		comment_id: comment.comment_id,
		user_id: comment.user_id,
		create_time: comment.create_time,
		update_time: comment.update_time,
		is_solved: comment.is_solved,
		is_whole: comment.is_whole,
		quote: comment.quote,
		text: extractReplyText(rootReply),
		has_more_replies: comment.has_more,
		replies_page_token: comment.page_token,
		replies: replies.slice(1).map(normalizeCommentReply)
	};
}
function normalizeCommentPageSize(pageSize) {
	if (typeof pageSize !== "number" || !Number.isFinite(pageSize)) return;
	return String(Math.min(Math.max(Math.floor(pageSize), 1), 100));
}
function resolveAmbientCommentTarget(context) {
	const deliveryContext = context?.deliveryContext;
	if (deliveryContext?.channel && deliveryContext.channel !== "feishu") return null;
	return parseFeishuCommentTarget(deliveryContext?.to);
}
function applyAmbientCommentDefaults(params, context) {
	const ambient = resolveAmbientCommentTarget(context);
	if (!ambient) return params;
	return {
		...params,
		file_token: params.file_token?.trim() || ambient.fileToken,
		file_type: params.file_type ?? ambient.fileType,
		comment_id: params.comment_id?.trim() || ambient.commentId
	};
}
function applyAddCommentAmbientDefaults(params, context) {
	const ambient = resolveAmbientCommentTarget(context);
	if (!ambient || ambient.fileType !== "doc" && ambient.fileType !== "docx") return params;
	return {
		...params,
		file_token: params.file_token?.trim() || ambient.fileToken,
		file_type: params.file_type ?? ambient.fileType
	};
}
function applyAddCommentDefaults(params) {
	const fileType = params.file_type ?? "docx";
	if (!params.file_type) console.info(`[feishu_drive] add_comment missing file_type; defaulting to docx file_token=${params.file_token ?? "unknown"}`);
	return {
		...params,
		file_type: fileType
	};
}
function applyCommentFileTypeDefault(params, action) {
	const fileType = params.file_type ?? "docx";
	if (!params.file_type) console.info(`[feishu_drive] ${action} missing file_type; defaulting to docx file_token=${params.file_token ?? "unknown"}`);
	return {
		...params,
		file_type: fileType
	};
}
function formatDriveApiError(error) {
	if (!isRecord$1(error)) return typeof error === "string" ? error : JSON.stringify(error);
	const response = isRecord$1(error.response) ? error.response : void 0;
	const responseData = isRecord$1(response?.data) ? response?.data : void 0;
	return JSON.stringify({
		message: typeof error.message === "string" ? error.message : typeof error === "string" ? error : JSON.stringify(error),
		code: readString(error.code),
		method: readString(isRecord$1(error.config) ? error.config.method : void 0),
		url: readString(isRecord$1(error.config) ? error.config.url : void 0),
		params: isRecord$1(error.config) ? error.config.params : void 0,
		http_status: typeof response?.status === "number" ? response.status : void 0,
		feishu_code: typeof responseData?.code === "number" ? responseData.code : readString(responseData?.code),
		feishu_msg: readString(responseData?.msg),
		feishu_log_id: readString(responseData?.log_id)
	});
}
function extractDriveApiErrorMeta(error) {
	if (!isRecord$1(error)) return { message: typeof error === "string" ? error : JSON.stringify(error) };
	const response = isRecord$1(error.response) ? error.response : void 0;
	const responseData = isRecord$1(response?.data) ? response?.data : void 0;
	return {
		message: typeof error.message === "string" ? error.message : typeof error === "string" ? error : JSON.stringify(error),
		httpStatus: typeof response?.status === "number" ? response.status : void 0,
		feishuCode: typeof responseData?.code === "number" ? responseData.code : readString(responseData?.code),
		feishuMsg: readString(responseData?.msg),
		feishuLogId: readString(responseData?.log_id)
	};
}
function isReplyNotAllowedError(error) {
	if (!(error instanceof FeishuReplyCommentError)) return false;
	return error.feishuCode === 1069302;
}
async function getRootFolderToken(client) {
	const internalClient = getDriveInternalClient(client);
	const domain = internalClient.domain ?? "https://open.feishu.cn";
	const res = await internalClient.httpInstance.get(`${domain}/open-apis/drive/explorer/v2/root_folder/meta`);
	if (res.code !== 0) throw new Error(res.msg ?? "Failed to get root folder");
	const token = res.data?.token;
	if (!token) throw new Error("Root folder token not found");
	return token;
}
async function listFolder(client, folderToken) {
	const validFolderToken = folderToken && folderToken !== "0" ? folderToken : void 0;
	const res = await client.drive.file.list({ params: validFolderToken ? { folder_token: validFolderToken } : {} });
	if (res.code !== 0) throw new Error(res.msg);
	return {
		files: res.data?.files?.map((f) => ({
			token: f.token,
			name: f.name,
			type: f.type,
			url: f.url,
			created_time: f.created_time,
			modified_time: f.modified_time,
			owner_id: f.owner_id
		})) ?? [],
		next_page_token: res.data?.next_page_token
	};
}
async function getFileInfo(client, fileToken, folderToken) {
	const res = await client.drive.file.list({ params: folderToken ? { folder_token: folderToken } : {} });
	if (res.code !== 0) throw new Error(res.msg);
	const file = res.data?.files?.find((f) => f.token === fileToken);
	if (!file) throw new Error(`File not found: ${fileToken}`);
	return {
		token: file.token,
		name: file.name,
		type: file.type,
		url: file.url,
		created_time: file.created_time,
		modified_time: file.modified_time,
		owner_id: file.owner_id
	};
}
async function createFolder(client, name, folderToken) {
	let effectiveToken = folderToken && folderToken !== "0" ? folderToken : "0";
	if (effectiveToken === "0") try {
		effectiveToken = await getRootFolderToken(client);
	} catch {}
	const res = await client.drive.file.createFolder({ data: {
		name,
		folder_token: effectiveToken
	} });
	if (res.code !== 0) throw new Error(res.msg);
	return {
		token: res.data?.token,
		url: res.data?.url
	};
}
async function moveFile(client, fileToken, type, folderToken) {
	const res = await client.drive.file.move({
		path: { file_token: fileToken },
		data: {
			type,
			folder_token: folderToken
		}
	});
	if (res.code !== 0) throw new Error(res.msg);
	return {
		success: true,
		task_id: res.data?.task_id
	};
}
async function deleteFile(client, fileToken, type) {
	const res = await client.drive.file.delete({
		path: { file_token: fileToken },
		params: { type }
	});
	if (res.code !== 0) throw new Error(res.msg);
	return {
		success: true,
		task_id: res.data?.task_id
	};
}
async function listComments(client, params) {
	const response = assertDriveApiSuccess(await requestDriveApi({
		client,
		method: "GET",
		url: `/open-apis/drive/v1/files/${encodeURIComponent(params.file_token)}/comments` + encodeQuery({
			file_type: params.file_type,
			page_size: normalizeCommentPageSize(params.page_size),
			page_token: params.page_token,
			user_id_type: "open_id"
		})
	}));
	return {
		has_more: response.data?.has_more ?? false,
		page_token: response.data?.page_token,
		comments: (response.data?.items ?? []).map(normalizeCommentCard)
	};
}
async function listCommentReplies(client, params) {
	const response = assertDriveApiSuccess(await requestDriveApi({
		client,
		method: "GET",
		url: `/open-apis/drive/v1/files/${encodeURIComponent(params.file_token)}/comments/${encodeURIComponent(params.comment_id)}/replies` + encodeQuery({
			file_type: params.file_type,
			page_size: normalizeCommentPageSize(params.page_size),
			page_token: params.page_token,
			user_id_type: "open_id"
		})
	}));
	return {
		has_more: response.data?.has_more ?? false,
		page_token: response.data?.page_token,
		replies: (response.data?.items ?? []).map(normalizeCommentReply)
	};
}
async function addComment(client, params) {
	if (params.block_id?.trim() && params.file_type !== "docx") throw new Error("block_id is only supported for docx comments");
	return {
		success: true,
		...assertDriveApiSuccess(await requestDriveApi({
			client,
			method: "POST",
			url: `/open-apis/drive/v1/files/${encodeURIComponent(params.file_token)}/new_comments`,
			data: {
				file_type: params.file_type,
				reply_elements: buildReplyElements(params.content),
				...params.block_id?.trim() ? { anchor: { block_id: params.block_id.trim() } } : {}
			}
		})).data
	};
}
async function queryCommentById(client, params) {
	return assertDriveApiSuccess(await requestDriveApi({
		client,
		method: "POST",
		url: `/open-apis/drive/v1/files/${encodeURIComponent(params.file_token)}/comments/batch_query` + encodeQuery({
			file_type: params.file_type,
			user_id_type: "open_id"
		}),
		data: { comment_ids: [params.comment_id] }
	})).data?.items?.find((comment) => comment.comment_id?.trim() === params.comment_id);
}
async function replyComment(client, params) {
	const url = `/open-apis/drive/v1/files/${encodeURIComponent(params.file_token)}/comments/${encodeURIComponent(params.comment_id)}/replies`;
	const query = { file_type: params.file_type };
	try {
		const response = await requestDriveApi({
			client,
			method: "POST",
			url,
			query,
			data: { content: { elements: [{
				type: "text_run",
				text_run: { text: params.content }
			}] } }
		});
		if (response.code === 0) return {
			success: true,
			...response.data
		};
		console.warn(`[feishu_drive] replyComment failed comment=${params.comment_id} file_type=${params.file_type} code=${response.code ?? "unknown"} msg=${response.msg ?? "unknown"} log_id=${response.log_id ?? "unknown"}`);
		throw new FeishuReplyCommentError({
			message: response.msg ?? "Feishu Drive reply comment failed",
			feishuCode: response.code,
			feishuMsg: response.msg,
			feishuLogId: response.log_id
		});
	} catch (error) {
		if (error instanceof FeishuReplyCommentError) throw error;
		const meta = extractDriveApiErrorMeta(error);
		console.warn(`[feishu_drive] replyComment threw comment=${params.comment_id} file_type=${params.file_type} error=${formatDriveApiError(error)}`);
		throw new FeishuReplyCommentError({
			message: meta.message,
			httpStatus: meta.httpStatus,
			feishuCode: meta.feishuCode,
			feishuMsg: meta.feishuMsg,
			feishuLogId: meta.feishuLogId
		});
	}
}
async function deliverCommentThreadText(client, params) {
	let isWholeComment = params.is_whole_comment;
	if (isWholeComment === void 0) try {
		isWholeComment = (await queryCommentById(client, params))?.is_whole === true;
	} catch (error) {
		console.warn(`[feishu_drive] comment metadata preflight failed comment=${params.comment_id} file_type=${params.file_type} error=${formatErrorMessage(error)}`);
		isWholeComment = false;
	}
	if (isWholeComment) {
		if (params.file_type !== "doc" && params.file_type !== "docx") throw new Error(`Whole-document comment follow-ups are only supported for doc/docx (got ${params.file_type})`);
		const wholeCommentFileType = params.file_type;
		console.info(`[feishu_drive] whole-comment compatibility path comment=${params.comment_id} file_type=${params.file_type} mode=add_comment`);
		return {
			delivery_mode: "add_comment",
			...await addComment(client, {
				file_token: params.file_token,
				file_type: wholeCommentFileType,
				content: params.content
			})
		};
	}
	try {
		return {
			delivery_mode: "reply_comment",
			...await replyComment(client, params)
		};
	} catch (error) {
		if (error instanceof FeishuReplyCommentError && isReplyNotAllowedError(error)) {
			if (params.file_type !== "doc" && params.file_type !== "docx") throw error;
			const fallbackFileType = params.file_type;
			console.info(`[feishu_drive] reply-not-allowed compatibility path comment=${params.comment_id} file_type=${params.file_type} mode=add_comment log_id=${error.feishuLogId ?? "unknown"}`);
			return {
				delivery_mode: "add_comment",
				...await addComment(client, {
					file_token: params.file_token,
					file_type: fallbackFileType,
					content: params.content
				})
			};
		}
		throw error;
	}
}
function registerFeishuDriveTools(api) {
	if (!api.config) {
		api.logger.debug?.("feishu_drive: No config available, skipping drive tools");
		return;
	}
	const accounts = listEnabledFeishuAccounts(api.config);
	if (accounts.length === 0) {
		api.logger.debug?.("feishu_drive: No Feishu accounts configured, skipping drive tools");
		return;
	}
	if (!resolveAnyEnabledFeishuToolsConfig(accounts).drive) {
		api.logger.debug?.("feishu_drive: drive tool disabled in config");
		return;
	}
	api.registerTool((ctx) => {
		const defaultAccountId = ctx.agentAccountId;
		return {
			name: "feishu_drive",
			label: "Feishu Drive",
			description: "Feishu cloud storage operations. Actions: list, info, create_folder, move, delete, list_comments, list_comment_replies, add_comment, reply_comment",
			parameters: FeishuDriveSchema,
			async execute(_toolCallId, params) {
				const p = params;
				try {
					const client = createFeishuToolClient({
						api,
						executeParams: p,
						defaultAccountId
					});
					switch (p.action) {
						case "list": return jsonToolResult(await listFolder(client, p.folder_token));
						case "info": return jsonToolResult(await getFileInfo(client, p.file_token));
						case "create_folder": return jsonToolResult(await createFolder(client, p.name, p.folder_token));
						case "move": return jsonToolResult(await moveFile(client, p.file_token, p.type, p.folder_token));
						case "delete": return jsonToolResult(await deleteFile(client, p.file_token, p.type));
						case "list_comments": return jsonToolResult(await listComments(client, applyCommentFileTypeDefault(applyAmbientCommentDefaults(p, ctx), "list_comments")));
						case "list_comment_replies": return jsonToolResult(await listCommentReplies(client, applyCommentFileTypeDefault(applyAmbientCommentDefaults(p, ctx), "list_comment_replies")));
						case "add_comment": {
							const resolved = applyAddCommentDefaults(applyAddCommentAmbientDefaults(p, ctx));
							try {
								return jsonToolResult(await addComment(client, resolved));
							} finally {
								cleanupAmbientCommentTypingReaction({
									client: getDriveInternalClient(client),
									deliveryContext: ctx.deliveryContext
								});
							}
						}
						case "reply_comment": {
							const resolved = applyCommentFileTypeDefault(applyAmbientCommentDefaults(p, ctx), "reply_comment");
							try {
								return jsonToolResult(await deliverCommentThreadText(client, resolved));
							} finally {
								cleanupAmbientCommentTypingReaction({
									client: getDriveInternalClient(client),
									deliveryContext: ctx.deliveryContext
								});
							}
						}
						default: return unknownToolActionResult(p.action);
					}
				} catch (err) {
					return toolExecutionErrorResult(err);
				}
			}
		};
	}, { name: "feishu_drive" });
	api.logger.debug?.(`feishu_drive: Registered feishu_drive tool`);
}
//#endregion
export { jsonToolResult as a, createFeishuToolClient as c, resolveToolsConfig as d, detectIdType as f, resolveReceiveIdType as h, createCommentTypingReactionLifecycle as i, resolveAnyEnabledFeishuToolsConfig as l, normalizeFeishuTarget as m, registerFeishuDriveTools as n, toolExecutionErrorResult as o, looksLikeFeishuId as p, cleanupAmbientCommentTypingReaction as r, unknownToolActionResult as s, deliverCommentThreadText as t, resolveFeishuToolAccount as u };
