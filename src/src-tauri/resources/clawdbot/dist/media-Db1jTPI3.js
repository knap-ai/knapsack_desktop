import { m as mediaKindFromMime } from "./mime-C9472kP8.js";
import { i as withTempDownloadPath } from "./temp-download-BOGUEcoP.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { t as convertMarkdownTables } from "./tables-Dmh1EQ3k.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CIDSrOnb.js";
import "./config-runtime-CmISCurQ.js";
import "./media-runtime-DdCWeFPm.js";
import "./text-runtime-B0ZpmkER.js";
import { a as createFeishuClient, c as listEnabledFeishuAccounts, d as resolveFeishuAccount, f as resolveFeishuRuntimeAccount, l as listFeishuAccountIds } from "./probe-Sr6ZihvE.js";
import "./runtime-api-B9CFXC5g.js";
import { n as normalizeFeishuTarget, r as resolveReceiveIdType } from "./targets-DLSGBpV_.js";
import { Type } from "@sinclair/typebox";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
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
function normalizeOptionalAccountId(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function readConfiguredDefaultAccountId(config) {
	const value = (config?.channels?.feishu)?.defaultAccount;
	if (typeof value !== "string") return;
	return normalizeOptionalAccountId(value);
}
function resolveImplicitToolAccountId(params) {
	const explicitAccountId = normalizeOptionalAccountId(params.executeParams?.accountId);
	if (explicitAccountId) return explicitAccountId;
	const configuredDefaultAccountId = readConfiguredDefaultAccountId(params.api.config);
	if (configuredDefaultAccountId) return configuredDefaultAccountId;
	const contextualAccountId = normalizeOptionalAccountId(params.defaultAccountId);
	if (!contextualAccountId) return;
	if (!listFeishuAccountIds(params.api.config).includes(contextualAccountId)) return;
	return resolveFeishuAccount({
		cfg: params.api.config,
		accountId: contextualAccountId
	}).enabled ? contextualAccountId : void 0;
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
//#region extensions/feishu/src/runtime.ts
const { setRuntime: setFeishuRuntime, getRuntime: getFeishuRuntime } = createPluginRuntimeStore("Feishu runtime not initialized");
//#endregion
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
	return jsonToolResult({ error: error instanceof Error ? error.message : String(error) });
}
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
function encodeQuery(params) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		const trimmed = value?.trim();
		if (trimmed) search.set(key, trimmed);
	}
	const query = search.toString();
	return query ? `?${query}` : "";
}
function readString(value) {
	return typeof value === "string" ? value : void 0;
}
function isRecord$1(value) {
	return typeof value === "object" && value !== null;
}
function extractCommentElementText(element) {
	if (!isRecord$1(element)) return;
	const type = readString(element.type)?.trim();
	if (type === "text_run" && isRecord$1(element.text_run)) return readString(element.text_run.content)?.trim() || readString(element.text_run.text)?.trim() || void 0;
	if (type === "mention") {
		const mention = isRecord$1(element.mention) ? element.mention : void 0;
		const mentionName = readString(mention?.name)?.trim() || readString(mention?.display_name)?.trim() || readString(element.name)?.trim();
		return mentionName ? `@${mentionName}` : "@mention";
	}
	if (type === "docs_link") {
		const docsLink = isRecord$1(element.docs_link) ? element.docs_link : void 0;
		return readString(docsLink?.text)?.trim() || readString(docsLink?.url)?.trim() || readString(element.text)?.trim() || readString(element.url)?.trim() || void 0;
	}
	return readString(element.text)?.trim() || readString(element.content)?.trim() || readString(element.name)?.trim() || void 0;
}
function extractReplyText(reply) {
	if (!reply || !isRecord$1(reply.content)) return;
	return (Array.isArray(reply.content.elements) ? reply.content.elements : []).map(extractCommentElementText).filter((part) => Boolean(part && part.trim())).join("").trim() || void 0;
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
	if (!isRecord$1(error)) return String(error);
	const response = isRecord$1(error.response) ? error.response : void 0;
	const responseData = isRecord$1(response?.data) ? response?.data : void 0;
	return JSON.stringify({
		message: typeof error.message === "string" ? error.message : String(error),
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
	if (!isRecord$1(error)) return { message: String(error) };
	const response = isRecord$1(error.response) ? error.response : void 0;
	const responseData = isRecord$1(response?.data) ? response?.data : void 0;
	return {
		message: typeof error.message === "string" ? error.message : String(error),
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
		console.warn(`[feishu_drive] comment metadata preflight failed comment=${params.comment_id} file_type=${params.file_type} error=${error instanceof Error ? error.message : String(error)}`);
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
						case "add_comment": return jsonToolResult(await addComment(client, applyAddCommentDefaults(applyAddCommentAmbientDefaults(p, ctx))));
						case "reply_comment": return jsonToolResult(await deliverCommentThreadText(client, applyCommentFileTypeDefault(applyAmbientCommentDefaults(p, ctx), "reply_comment")));
						default: return unknownToolActionResult(p.action);
					}
				} catch (err) {
					return toolExecutionErrorResult(err);
				}
			}
		};
	}, { name: "feishu_drive" });
	api.logger.info?.(`feishu_drive: Registered feishu_drive tool`);
}
//#endregion
//#region extensions/feishu/src/mention.ts
/**
* Escape regex metacharacters so user-controlled mention fields are treated literally.
*/
function escapeRegExp(input) {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
* Extract mention targets from message event (excluding the bot itself)
*/
function extractMentionTargets(event, botOpenId) {
	return (event.message.mentions ?? []).filter((m) => {
		if (botOpenId && m.id.open_id === botOpenId) return false;
		return !!m.id.open_id;
	}).map((m) => ({
		openId: m.id.open_id,
		name: m.name,
		key: m.key
	}));
}
/**
* Check if message is a mention forward request
* Rules:
* - Group: message mentions bot + at least one other user
* - DM: message mentions any user (no need to mention bot)
*/
function isMentionForwardRequest(event, botOpenId) {
	const mentions = event.message.mentions ?? [];
	if (mentions.length === 0) return false;
	const isDirectMessage = event.message.chat_type !== "group";
	const hasOtherMention = mentions.some((m) => m.id.open_id !== botOpenId);
	if (isDirectMessage) return hasOtherMention;
	else return mentions.some((m) => m.id.open_id === botOpenId) && hasOtherMention;
}
/**
* Extract message body from text (remove @ placeholders)
*/
function extractMessageBody(text, allMentionKeys) {
	let result = text;
	for (const key of allMentionKeys) result = result.replace(new RegExp(escapeRegExp(key), "g"), "");
	return result.replace(/\s+/g, " ").trim();
}
/**
* Format @mention for text message
*/
function formatMentionForText(target) {
	return `<at user_id="${target.openId}">${target.name}</at>`;
}
/**
* Format @everyone for text message
*/
function formatMentionAllForText() {
	return `<at user_id="all">Everyone</at>`;
}
/**
* Format @mention for card message (lark_md)
*/
function formatMentionForCard(target) {
	return `<at id=${target.openId}></at>`;
}
/**
* Format @everyone for card message
*/
function formatMentionAllForCard() {
	return `<at id=all></at>`;
}
/**
* Build complete message with @mentions (text format)
*/
function buildMentionedMessage(targets, message) {
	if (targets.length === 0) return message;
	return `${targets.map((t) => formatMentionForText(t)).join(" ")} ${message}`;
}
/**
* Build card content with @mentions (Markdown format)
*/
function buildMentionedCardContent(targets, message) {
	if (targets.length === 0) return message;
	return `${targets.map((t) => formatMentionForCard(t)).join(" ")} ${message}`;
}
//#endregion
//#region extensions/feishu/src/external-keys.ts
const CONTROL_CHARS_RE = /[\u0000-\u001f\u007f]/;
const MAX_EXTERNAL_KEY_LENGTH = 512;
function normalizeFeishuExternalKey(value) {
	if (typeof value !== "string") return;
	const normalized = value.trim();
	if (!normalized || normalized.length > MAX_EXTERNAL_KEY_LENGTH) return;
	if (CONTROL_CHARS_RE.test(normalized)) return;
	if (normalized.includes("/") || normalized.includes("\\") || normalized.includes("..")) return;
	return normalized;
}
//#endregion
//#region extensions/feishu/src/post.ts
const FALLBACK_POST_TEXT = "[Rich text message]";
const MARKDOWN_SPECIAL_CHARS = /([\\`*_{}\[\]()#+\-!|>~])/g;
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function toStringOrEmpty(value) {
	return typeof value === "string" ? value : "";
}
function escapeMarkdownText(text) {
	return text.replace(MARKDOWN_SPECIAL_CHARS, "\\$1");
}
function toBoolean(value) {
	return value === true || value === 1 || value === "true";
}
function isStyleEnabled(style, key) {
	if (!style) return false;
	return toBoolean(style[key]);
}
function wrapInlineCode(text) {
	const maxRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
	const fence = "`".repeat(maxRun + 1);
	return `${fence}${text.startsWith("`") || text.endsWith("`") ? ` ${text} ` : text}${fence}`;
}
function sanitizeFenceLanguage(language) {
	return language.trim().replace(/[^A-Za-z0-9_+#.-]/g, "");
}
function renderTextElement(element) {
	const text = toStringOrEmpty(element.text);
	const style = isRecord(element.style) ? element.style : void 0;
	if (isStyleEnabled(style, "code")) return wrapInlineCode(text);
	let rendered = escapeMarkdownText(text);
	if (!rendered) return "";
	if (isStyleEnabled(style, "bold")) rendered = `**${rendered}**`;
	if (isStyleEnabled(style, "italic")) rendered = `*${rendered}*`;
	if (isStyleEnabled(style, "underline")) rendered = `<u>${rendered}</u>`;
	if (isStyleEnabled(style, "strikethrough") || isStyleEnabled(style, "line_through") || isStyleEnabled(style, "lineThrough")) rendered = `~~${rendered}~~`;
	return rendered;
}
function renderLinkElement(element) {
	const href = toStringOrEmpty(element.href).trim();
	const text = toStringOrEmpty(element.text) || href;
	if (!text) return "";
	if (!href) return escapeMarkdownText(text);
	return `[${escapeMarkdownText(text)}](${href})`;
}
function renderMentionElement(element) {
	const mention = toStringOrEmpty(element.user_name) || toStringOrEmpty(element.user_id) || toStringOrEmpty(element.open_id);
	if (!mention) return "";
	return `@${escapeMarkdownText(mention)}`;
}
function renderEmotionElement(element) {
	return escapeMarkdownText(toStringOrEmpty(element.emoji) || toStringOrEmpty(element.text) || toStringOrEmpty(element.emoji_type));
}
function renderCodeBlockElement(element) {
	const language = sanitizeFenceLanguage(toStringOrEmpty(element.language) || toStringOrEmpty(element.lang));
	const code = (toStringOrEmpty(element.text) || toStringOrEmpty(element.content)).replace(/\r\n/g, "\n");
	return `\`\`\`${language}\n${code}${code.endsWith("\n") ? "" : "\n"}\`\`\``;
}
function renderElement(element, imageKeys, mediaKeys, mentionedOpenIds) {
	if (!isRecord(element)) return escapeMarkdownText(toStringOrEmpty(element));
	switch (toStringOrEmpty(element.tag).toLowerCase()) {
		case "text": return renderTextElement(element);
		case "a": return renderLinkElement(element);
		case "at":
			{
				const normalizedMention = normalizeFeishuExternalKey(toStringOrEmpty(element.open_id) || toStringOrEmpty(element.user_id));
				if (normalizedMention) mentionedOpenIds.push(normalizedMention);
			}
			return renderMentionElement(element);
		case "img": {
			const imageKey = normalizeFeishuExternalKey(toStringOrEmpty(element.image_key));
			if (imageKey) imageKeys.push(imageKey);
			return "![image]";
		}
		case "media": {
			const fileKey = normalizeFeishuExternalKey(toStringOrEmpty(element.file_key));
			if (fileKey) {
				const fileName = toStringOrEmpty(element.file_name) || void 0;
				mediaKeys.push({
					fileKey,
					fileName
				});
			}
			return "[media]";
		}
		case "emotion": return renderEmotionElement(element);
		case "br": return "\n";
		case "hr": return "\n\n---\n\n";
		case "code": {
			const code = toStringOrEmpty(element.text) || toStringOrEmpty(element.content);
			return code ? wrapInlineCode(code) : "";
		}
		case "code_block":
		case "pre": return renderCodeBlockElement(element);
		default: return escapeMarkdownText(toStringOrEmpty(element.text));
	}
}
function toPostPayload(candidate) {
	if (!isRecord(candidate) || !Array.isArray(candidate.content)) return null;
	return {
		title: toStringOrEmpty(candidate.title),
		content: candidate.content
	};
}
function resolveLocalePayload(candidate) {
	const direct = toPostPayload(candidate);
	if (direct) return direct;
	if (!isRecord(candidate)) return null;
	for (const value of Object.values(candidate)) {
		const localePayload = toPostPayload(value);
		if (localePayload) return localePayload;
	}
	return null;
}
function resolvePostPayload(parsed) {
	const direct = toPostPayload(parsed);
	if (direct) return direct;
	if (!isRecord(parsed)) return null;
	const wrappedPost = resolveLocalePayload(parsed.post);
	if (wrappedPost) return wrappedPost;
	return resolveLocalePayload(parsed);
}
function parsePostContent(content) {
	try {
		const payload = resolvePostPayload(JSON.parse(content));
		if (!payload) return {
			textContent: FALLBACK_POST_TEXT,
			imageKeys: [],
			mediaKeys: [],
			mentionedOpenIds: []
		};
		const imageKeys = [];
		const mediaKeys = [];
		const mentionedOpenIds = [];
		const paragraphs = [];
		for (const paragraph of payload.content) {
			if (!Array.isArray(paragraph)) continue;
			let renderedParagraph = "";
			for (const element of paragraph) renderedParagraph += renderElement(element, imageKeys, mediaKeys, mentionedOpenIds);
			paragraphs.push(renderedParagraph);
		}
		return {
			textContent: [escapeMarkdownText(payload.title.trim()), paragraphs.join("\n").trim()].filter(Boolean).join("\n\n").trim() || FALLBACK_POST_TEXT,
			imageKeys,
			mediaKeys,
			mentionedOpenIds
		};
	} catch {
		return {
			textContent: FALLBACK_POST_TEXT,
			imageKeys: [],
			mediaKeys: [],
			mentionedOpenIds: []
		};
	}
}
//#endregion
//#region extensions/feishu/src/send-result.ts
function assertFeishuMessageApiSuccess(response, errorPrefix) {
	if (response.code !== 0) throw new Error(`${errorPrefix}: ${response.msg || `code ${response.code}`}`);
}
function toFeishuSendResult(response, chatId) {
	return {
		messageId: response.data?.message_id ?? "unknown",
		chatId
	};
}
//#endregion
//#region extensions/feishu/src/send-target.ts
function resolveFeishuSendTarget(params) {
	const target = params.to.trim();
	const account = resolveFeishuRuntimeAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const client = createFeishuClient(account);
	const receiveId = normalizeFeishuTarget(target);
	if (!receiveId) throw new Error(`Invalid Feishu target: ${params.to}`);
	return {
		client,
		receiveId,
		receiveIdType: resolveReceiveIdType(target.replace(/^(feishu|lark):/i, ""))
	};
}
//#endregion
//#region extensions/feishu/src/send.ts
const WITHDRAWN_REPLY_ERROR_CODES = new Set([230011, 231003]);
const FEISHU_CARD_TEMPLATES = new Set([
	"blue",
	"green",
	"red",
	"orange",
	"purple",
	"indigo",
	"wathet",
	"turquoise",
	"yellow",
	"grey",
	"carmine",
	"violet",
	"lime"
]);
function shouldFallbackFromReplyTarget(response) {
	if (response.code !== void 0 && WITHDRAWN_REPLY_ERROR_CODES.has(response.code)) return true;
	const msg = response.msg?.toLowerCase() ?? "";
	return msg.includes("withdrawn") || msg.includes("not found");
}
/** Check whether a thrown error indicates a withdrawn/not-found reply target. */
function isWithdrawnReplyError(err) {
	if (typeof err !== "object" || err === null) return false;
	const code = err.code;
	if (typeof code === "number" && WITHDRAWN_REPLY_ERROR_CODES.has(code)) return true;
	const response = err.response;
	if (typeof response?.data?.code === "number" && WITHDRAWN_REPLY_ERROR_CODES.has(response.data.code)) return true;
	return false;
}
/** Send a direct message as a fallback when a reply target is unavailable. */
async function sendFallbackDirect(client, params, errorPrefix) {
	const response = await client.im.message.create({
		params: { receive_id_type: params.receiveIdType },
		data: {
			receive_id: params.receiveId,
			content: params.content,
			msg_type: params.msgType
		}
	});
	assertFeishuMessageApiSuccess(response, errorPrefix);
	return toFeishuSendResult(response, params.receiveId);
}
async function sendReplyOrFallbackDirect(client, params) {
	if (!params.replyToMessageId) return sendFallbackDirect(client, params.directParams, params.directErrorPrefix);
	const threadReplyFallbackError = params.replyInThread ? /* @__PURE__ */ new Error("Feishu thread reply failed: reply target is unavailable and cannot safely fall back to a top-level send.") : null;
	let response;
	try {
		response = await client.im.message.reply({
			path: { message_id: params.replyToMessageId },
			data: {
				content: params.content,
				msg_type: params.msgType,
				...params.replyInThread ? { reply_in_thread: true } : {}
			}
		});
	} catch (err) {
		if (!isWithdrawnReplyError(err)) throw err;
		if (threadReplyFallbackError) throw threadReplyFallbackError;
		return sendFallbackDirect(client, params.directParams, params.directErrorPrefix);
	}
	if (shouldFallbackFromReplyTarget(response)) {
		if (threadReplyFallbackError) throw threadReplyFallbackError;
		return sendFallbackDirect(client, params.directParams, params.directErrorPrefix);
	}
	assertFeishuMessageApiSuccess(response, params.replyErrorPrefix);
	return toFeishuSendResult(response, params.directParams.receiveId);
}
function parseInteractiveCardContent(parsed) {
	if (!parsed || typeof parsed !== "object") return "[Interactive Card]";
	const candidate = parsed;
	const elements = Array.isArray(candidate.elements) ? candidate.elements : Array.isArray(candidate.body?.elements) ? candidate.body.elements : null;
	if (!elements) return "[Interactive Card]";
	const texts = [];
	for (const element of elements) {
		if (!element || typeof element !== "object") continue;
		const item = element;
		if (item.tag === "div" && typeof item.text?.content === "string") {
			texts.push(item.text.content);
			continue;
		}
		if (item.tag === "markdown" && typeof item.content === "string") texts.push(item.content);
	}
	return texts.join("\n").trim() || "[Interactive Card]";
}
function parseFeishuMessageContent(rawContent, msgType) {
	if (!rawContent) return "";
	let parsed;
	try {
		parsed = JSON.parse(rawContent);
	} catch {
		return rawContent;
	}
	if (msgType === "text") {
		const text = parsed?.text;
		return typeof text === "string" ? text : "[Text message]";
	}
	if (msgType === "post") return parsePostContent(rawContent).textContent;
	if (msgType === "interactive") return parseInteractiveCardContent(parsed);
	if (typeof parsed === "string") return parsed;
	const genericText = parsed?.text;
	if (typeof genericText === "string" && genericText.trim()) return genericText;
	const genericTitle = parsed?.title;
	if (typeof genericTitle === "string" && genericTitle.trim()) return genericTitle;
	return `[${msgType || "unknown"} message]`;
}
function parseFeishuMessageItem(item, fallbackMessageId) {
	const msgType = item.msg_type ?? "text";
	const rawContent = item.body?.content ?? "";
	return {
		messageId: item.message_id ?? fallbackMessageId ?? "",
		chatId: item.chat_id ?? "",
		chatType: item.chat_type === "group" || item.chat_type === "private" || item.chat_type === "p2p" ? item.chat_type : void 0,
		senderId: item.sender?.id,
		senderOpenId: item.sender?.id_type === "open_id" ? item.sender?.id : void 0,
		senderType: item.sender?.sender_type,
		content: parseFeishuMessageContent(rawContent, msgType),
		contentType: msgType,
		createTime: item.create_time ? parseInt(String(item.create_time), 10) : void 0,
		threadId: item.thread_id || void 0
	};
}
/**
* Get a message by its ID.
* Useful for fetching quoted/replied message content.
*/
async function getMessageFeishu(params) {
	const { cfg, messageId, accountId } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const client = createFeishuClient(account);
	try {
		const response = await client.im.message.get({ path: { message_id: messageId } });
		if (response.code !== 0) return null;
		const rawItem = response.data?.items?.[0] ?? response.data;
		const item = rawItem && (rawItem.body !== void 0 || rawItem.message_id !== void 0) ? rawItem : null;
		if (!item) return null;
		return parseFeishuMessageItem(item, messageId);
	} catch {
		return null;
	}
}
/**
* List messages in a Feishu thread (topic).
* Uses container_id_type=thread to directly query thread messages,
* which includes both the root message and all replies (including bot replies).
*/
async function listFeishuThreadMessages(params) {
	const { cfg, threadId, currentMessageId, rootMessageId, limit = 20, accountId } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const response = await createFeishuClient(account).im.message.list({ params: {
		container_id_type: "thread",
		container_id: threadId,
		sort_type: "ByCreateTimeDesc",
		page_size: Math.min(limit + 1, 50)
	} });
	if (response.code !== 0) throw new Error(`Feishu thread list failed: code=${response.code} msg=${response.msg ?? "unknown"}`);
	const items = response.data?.items ?? [];
	const results = [];
	for (const item of items) {
		if (currentMessageId && item.message_id === currentMessageId) continue;
		if (rootMessageId && item.message_id === rootMessageId) continue;
		const parsed = parseFeishuMessageItem(item);
		results.push({
			messageId: parsed.messageId,
			senderId: parsed.senderId,
			senderType: parsed.senderType,
			content: parsed.content,
			contentType: parsed.contentType,
			createTime: parsed.createTime
		});
		if (results.length >= limit) break;
	}
	results.reverse();
	return results;
}
function buildFeishuPostMessagePayload(params) {
	const { messageText } = params;
	return {
		content: JSON.stringify({ zh_cn: { content: [[{
			tag: "md",
			text: messageText
		}]] } }),
		msgType: "post"
	};
}
async function sendMessageFeishu(params) {
	const { cfg, to, text, replyToMessageId, replyInThread, mentions, accountId } = params;
	const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({
		cfg,
		to,
		accountId
	});
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "feishu"
	});
	let rawText = text ?? "";
	if (mentions && mentions.length > 0) rawText = buildMentionedMessage(mentions, rawText);
	const { content, msgType } = buildFeishuPostMessagePayload({ messageText: convertMarkdownTables(rawText, tableMode) });
	return sendReplyOrFallbackDirect(client, {
		replyToMessageId,
		replyInThread,
		content,
		msgType,
		directParams: {
			receiveId,
			receiveIdType,
			content,
			msgType
		},
		directErrorPrefix: "Feishu send failed",
		replyErrorPrefix: "Feishu reply failed"
	});
}
async function sendCardFeishu(params) {
	const { cfg, to, card, replyToMessageId, replyInThread, accountId } = params;
	const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({
		cfg,
		to,
		accountId
	});
	const content = JSON.stringify(card);
	return sendReplyOrFallbackDirect(client, {
		replyToMessageId,
		replyInThread,
		content,
		msgType: "interactive",
		directParams: {
			receiveId,
			receiveIdType,
			content,
			msgType: "interactive"
		},
		directErrorPrefix: "Feishu card send failed",
		replyErrorPrefix: "Feishu card reply failed"
	});
}
async function editMessageFeishu(params) {
	const { cfg, messageId, text, card, accountId } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	if ((typeof text === "string" && text.trim().length > 0) === Boolean(card)) throw new Error("Feishu edit requires exactly one of text or card.");
	const client = createFeishuClient(account);
	if (card) {
		const content = JSON.stringify(card);
		const response = await client.im.message.patch({
			path: { message_id: messageId },
			data: { content }
		});
		if (response.code !== 0) throw new Error(`Feishu message edit failed: ${response.msg || `code ${response.code}`}`);
		return {
			messageId,
			contentType: "interactive"
		};
	}
	const payload = buildFeishuPostMessagePayload({ messageText: convertMarkdownTables(text, resolveMarkdownTableMode({
		cfg,
		channel: "feishu"
	})) });
	const response = await client.im.message.patch({
		path: { message_id: messageId },
		data: { content: payload.content }
	});
	if (response.code !== 0) throw new Error(`Feishu message edit failed: ${response.msg || `code ${response.code}`}`);
	return {
		messageId,
		contentType: "post"
	};
}
async function updateCardFeishu(params) {
	const { cfg, messageId, card, accountId } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const client = createFeishuClient(account);
	const content = JSON.stringify(card);
	const response = await client.im.message.patch({
		path: { message_id: messageId },
		data: { content }
	});
	if (response.code !== 0) throw new Error(`Feishu card update failed: ${response.msg || `code ${response.code}`}`);
}
/**
* Build a Feishu interactive card with markdown content.
* Cards render markdown properly (code blocks, tables, links, etc.)
* Uses schema 2.0 format for proper markdown rendering.
*/
function buildMarkdownCard(text) {
	return {
		schema: "2.0",
		config: { wide_screen_mode: true },
		body: { elements: [{
			tag: "markdown",
			content: text
		}] }
	};
}
function resolveFeishuCardTemplate(template) {
	const normalized = template?.trim().toLowerCase();
	if (!normalized || !FEISHU_CARD_TEMPLATES.has(normalized)) return;
	return normalized;
}
/**
* Build a Feishu interactive card with optional header and note footer.
* When header/note are omitted, behaves identically to buildMarkdownCard.
*/
function buildStructuredCard(text, options) {
	const elements = [{
		tag: "markdown",
		content: text
	}];
	if (options?.note) {
		elements.push({ tag: "hr" });
		elements.push({
			tag: "markdown",
			content: `<font color='grey'>${options.note}</font>`
		});
	}
	const card = {
		schema: "2.0",
		config: { wide_screen_mode: true },
		body: { elements }
	};
	if (options?.header) card.header = {
		title: {
			tag: "plain_text",
			content: options.header.title
		},
		template: resolveFeishuCardTemplate(options.header.template) ?? "blue"
	};
	return card;
}
/**
* Send a message as a structured card with optional header and note.
*/
async function sendStructuredCardFeishu(params) {
	const { cfg, to, text, replyToMessageId, replyInThread, mentions, accountId, header, note } = params;
	let cardText = text;
	if (mentions && mentions.length > 0) cardText = buildMentionedCardContent(mentions, text);
	return sendCardFeishu({
		cfg,
		to,
		card: buildStructuredCard(cardText, {
			header,
			note
		}),
		replyToMessageId,
		replyInThread,
		accountId
	});
}
/**
* Send a message as a markdown card (interactive message).
* This renders markdown properly in Feishu (code blocks, tables, bold/italic, etc.)
*/
async function sendMarkdownCardFeishu(params) {
	const { cfg, to, text, replyToMessageId, replyInThread, mentions, accountId } = params;
	let cardText = text;
	if (mentions && mentions.length > 0) cardText = buildMentionedCardContent(mentions, text);
	return sendCardFeishu({
		cfg,
		to,
		card: buildMarkdownCard(cardText),
		replyToMessageId,
		replyInThread,
		accountId
	});
}
//#endregion
//#region extensions/feishu/src/media.ts
const FEISHU_MEDIA_HTTP_TIMEOUT_MS = 12e4;
function createConfiguredFeishuMediaClient(params) {
	const account = resolveFeishuRuntimeAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	return {
		account,
		client: createFeishuClient({
			...account,
			httpTimeoutMs: FEISHU_MEDIA_HTTP_TIMEOUT_MS
		})
	};
}
function asHeaderMap(value) {
	if (!value) return;
	const entries = Object.entries(value);
	if (entries.every(([, entry]) => typeof entry === "string" || Array.isArray(entry))) return Object.fromEntries(entries);
}
function extractFeishuUploadKey(response, params) {
	if (!response) throw new Error(`${params.errorPrefix}: empty response`);
	const wrappedResponse = response;
	if (wrappedResponse.code !== void 0 && wrappedResponse.code !== 0) throw new Error(`${params.errorPrefix}: ${wrappedResponse.msg || `code ${wrappedResponse.code}`}`);
	const key = params.key === "image_key" ? wrappedResponse.image_key ?? wrappedResponse.data?.image_key : wrappedResponse.file_key ?? wrappedResponse.data?.file_key;
	if (!key) throw new Error(`${params.errorPrefix}: no ${params.key} returned`);
	return key;
}
function readHeaderValue(headers, name) {
	if (!headers) return;
	const target = name.toLowerCase();
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() !== target) continue;
		if (typeof value === "string" && value.trim()) return value.trim();
		if (Array.isArray(value)) {
			const first = value.find((entry) => typeof entry === "string" && entry.trim());
			if (typeof first === "string") return first.trim();
		}
	}
}
function decodeDispositionFileName(value) {
	const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8Match?.[1]) try {
		return decodeURIComponent(utf8Match[1].trim().replace(/^"(.*)"$/, "$1"));
	} catch {
		return utf8Match[1].trim().replace(/^"(.*)"$/, "$1");
	}
	return value.match(/filename="?([^";]+)"?/i)?.[1]?.trim();
}
function extractFeishuDownloadMetadata(response) {
	const responseWithOptionalFields = response;
	const headers = asHeaderMap(responseWithOptionalFields.headers) ?? asHeaderMap(responseWithOptionalFields.header);
	const contentType = readHeaderValue(headers, "content-type") ?? responseWithOptionalFields.contentType ?? responseWithOptionalFields.mime_type ?? responseWithOptionalFields.data?.contentType ?? responseWithOptionalFields.data?.mime_type;
	const disposition = readHeaderValue(headers, "content-disposition");
	return {
		contentType,
		fileName: (disposition ? decodeDispositionFileName(disposition) : void 0) ?? responseWithOptionalFields.file_name ?? responseWithOptionalFields.fileName ?? responseWithOptionalFields.data?.file_name ?? responseWithOptionalFields.data?.fileName
	};
}
async function readReadableBuffer(stream) {
	const chunks = [];
	for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	return Buffer.concat(chunks);
}
async function readFeishuResponseBuffer(params) {
	const { response } = params;
	if (Buffer.isBuffer(response)) return response;
	if (response instanceof ArrayBuffer) return Buffer.from(response);
	const responseWithOptionalFields = response;
	if (responseWithOptionalFields.code !== void 0 && responseWithOptionalFields.code !== 0) throw new Error(`${params.errorPrefix}: ${responseWithOptionalFields.msg || `code ${responseWithOptionalFields.code}`}`);
	if (responseWithOptionalFields.data && Buffer.isBuffer(responseWithOptionalFields.data)) return responseWithOptionalFields.data;
	if (responseWithOptionalFields.data instanceof ArrayBuffer) return Buffer.from(responseWithOptionalFields.data);
	if (typeof response.getReadableStream === "function") return readReadableBuffer(response.getReadableStream());
	if (typeof response.writeFile === "function") return await withTempDownloadPath({ prefix: params.tmpDirPrefix }, async (tmpPath) => {
		await response.writeFile(tmpPath);
		return await fs.promises.readFile(tmpPath);
	});
	if (responseWithOptionalFields[Symbol.asyncIterator]) {
		const asyncIterable = responseWithOptionalFields;
		const chunks = [];
		for await (const chunk of asyncIterable) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		return Buffer.concat(chunks);
	}
	if (response instanceof Readable) return readReadableBuffer(response);
	const keys = Object.keys(response);
	throw new Error(`${params.errorPrefix}: unexpected response format. Keys: [${keys.join(", ")}]`);
}
/**
* Download a message resource (file/image/audio/video) from Feishu.
* Used for downloading files, audio, and video from messages.
*/
async function downloadMessageResourceFeishu(params) {
	const { cfg, messageId, fileKey, type, accountId } = params;
	const normalizedFileKey = normalizeFeishuExternalKey(fileKey);
	if (!normalizedFileKey) throw new Error("Feishu message resource download failed: invalid file_key");
	const { client } = createConfiguredFeishuMediaClient({
		cfg,
		accountId
	});
	const response = await client.im.messageResource.get({
		path: {
			message_id: messageId,
			file_key: normalizedFileKey
		},
		params: { type }
	});
	return {
		buffer: await readFeishuResponseBuffer({
			response,
			tmpDirPrefix: "openclaw-feishu-resource-",
			errorPrefix: "Feishu message resource download failed"
		}),
		...extractFeishuDownloadMetadata(response)
	};
}
/**
* Upload an image to Feishu and get an image_key for sending.
* Supports: JPEG, PNG, WEBP, GIF, TIFF, BMP, ICO
*/
async function uploadImageFeishu(params) {
	const { cfg, image, imageType = "message", accountId } = params;
	const { client } = createConfiguredFeishuMediaClient({
		cfg,
		accountId
	});
	const imageData = typeof image === "string" ? fs.createReadStream(image) : image;
	return { imageKey: extractFeishuUploadKey(await client.im.image.create({ data: {
		image_type: imageType,
		image: imageData
	} }), {
		key: "image_key",
		errorPrefix: "Feishu image upload failed"
	}) };
}
/**
* Sanitize a filename for safe use in Feishu multipart/form-data uploads.
* Strips control characters and multipart-injection vectors (CWE-93) while
* preserving the original UTF-8 display name (Chinese, emoji, etc.).
*
* Previous versions percent-encoded non-ASCII characters, but the Feishu
* `im.file.create` API uses `file_name` as a literal display name — it does
* NOT decode percent-encoding — so encoded filenames appeared as garbled text
* in chat (regression in v2026.3.2).
*/
function sanitizeFileNameForUpload(fileName) {
	return fileName.replace(/[\x00-\x1F\x7F\r\n"\\]/g, "_");
}
/**
* Upload a file to Feishu and get a file_key for sending.
* Max file size: 30MB
*/
async function uploadFileFeishu(params) {
	const { cfg, file, fileName, fileType, duration, accountId } = params;
	const { client } = createConfiguredFeishuMediaClient({
		cfg,
		accountId
	});
	const fileData = typeof file === "string" ? fs.createReadStream(file) : file;
	const safeFileName = sanitizeFileNameForUpload(fileName);
	return { fileKey: extractFeishuUploadKey(await client.im.file.create({ data: {
		file_type: fileType,
		file_name: safeFileName,
		file: fileData,
		...duration !== void 0 && { duration }
	} }), {
		key: "file_key",
		errorPrefix: "Feishu file upload failed"
	}) };
}
/**
* Send an image message using an image_key
*/
async function sendImageFeishu(params) {
	const { cfg, to, imageKey, replyToMessageId, replyInThread, accountId } = params;
	const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({
		cfg,
		to,
		accountId
	});
	const content = JSON.stringify({ image_key: imageKey });
	if (replyToMessageId) {
		const response = await client.im.message.reply({
			path: { message_id: replyToMessageId },
			data: {
				content,
				msg_type: "image",
				...replyInThread ? { reply_in_thread: true } : {}
			}
		});
		assertFeishuMessageApiSuccess(response, "Feishu image reply failed");
		return toFeishuSendResult(response, receiveId);
	}
	const response = await client.im.message.create({
		params: { receive_id_type: receiveIdType },
		data: {
			receive_id: receiveId,
			content,
			msg_type: "image"
		}
	});
	assertFeishuMessageApiSuccess(response, "Feishu image send failed");
	return toFeishuSendResult(response, receiveId);
}
/**
* Send a file message using a file_key
*/
async function sendFileFeishu(params) {
	const { cfg, to, fileKey, replyToMessageId, replyInThread, accountId } = params;
	const msgType = params.msgType ?? "file";
	const { client, receiveId, receiveIdType } = resolveFeishuSendTarget({
		cfg,
		to,
		accountId
	});
	const content = JSON.stringify({ file_key: fileKey });
	if (replyToMessageId) {
		const response = await client.im.message.reply({
			path: { message_id: replyToMessageId },
			data: {
				content,
				msg_type: msgType,
				...replyInThread ? { reply_in_thread: true } : {}
			}
		});
		assertFeishuMessageApiSuccess(response, "Feishu file reply failed");
		return toFeishuSendResult(response, receiveId);
	}
	const response = await client.im.message.create({
		params: { receive_id_type: receiveIdType },
		data: {
			receive_id: receiveId,
			content,
			msg_type: msgType
		}
	});
	assertFeishuMessageApiSuccess(response, "Feishu file send failed");
	return toFeishuSendResult(response, receiveId);
}
/**
* Helper to detect file type from extension
*/
function detectFileType(fileName) {
	switch (path.extname(fileName).toLowerCase()) {
		case ".opus":
		case ".ogg": return "opus";
		case ".mp4":
		case ".mov":
		case ".avi": return "mp4";
		case ".pdf": return "pdf";
		case ".doc":
		case ".docx": return "doc";
		case ".xls":
		case ".xlsx": return "xls";
		case ".ppt":
		case ".pptx": return "ppt";
		default: return "stream";
	}
}
function resolveFeishuOutboundMediaKind(params) {
	const { fileName, contentType } = params;
	const ext = path.extname(fileName).toLowerCase();
	const mimeKind = mediaKindFromMime(contentType);
	if ([
		".jpg",
		".jpeg",
		".png",
		".gif",
		".webp",
		".bmp",
		".ico",
		".tiff"
	].includes(ext) || mimeKind === "image") return { msgType: "image" };
	if (ext === ".opus" || ext === ".ogg" || contentType === "audio/ogg" || contentType === "audio/opus") return {
		fileType: "opus",
		msgType: "audio"
	};
	if ([
		".mp4",
		".mov",
		".avi"
	].includes(ext) || contentType === "video/mp4" || contentType === "video/quicktime" || contentType === "video/x-msvideo") return {
		fileType: "mp4",
		msgType: "media"
	};
	const fileType = detectFileType(fileName);
	return {
		fileType,
		msgType: fileType === "stream" ? "file" : fileType === "opus" ? "audio" : fileType === "mp4" ? "media" : "file"
	};
}
/**
* Upload and send media (image or file) from URL, local path, or buffer.
* When mediaUrl is a local path, mediaLocalRoots (from core outbound context)
* must be passed so loadWebMedia allows the path (post CVE-2026-26321).
*/
async function sendMediaFeishu(params) {
	const { cfg, to, mediaUrl, mediaBuffer, fileName, replyToMessageId, replyInThread, accountId, mediaLocalRoots } = params;
	const account = resolveFeishuRuntimeAccount({
		cfg,
		accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const mediaMaxBytes = (account.config?.mediaMaxMb ?? 30) * 1024 * 1024;
	let buffer;
	let name;
	let contentType;
	if (mediaBuffer) {
		buffer = mediaBuffer;
		name = fileName ?? "file";
	} else if (mediaUrl) {
		const loaded = await getFeishuRuntime().media.loadWebMedia(mediaUrl, {
			maxBytes: mediaMaxBytes,
			optimizeImages: false,
			localRoots: mediaLocalRoots?.length ? mediaLocalRoots : void 0
		});
		buffer = loaded.buffer;
		name = fileName ?? loaded.fileName ?? "file";
		contentType = loaded.contentType;
	} else throw new Error("Either mediaUrl or mediaBuffer must be provided");
	const routing = resolveFeishuOutboundMediaKind({
		fileName: name,
		contentType
	});
	if (routing.msgType === "image") {
		const { imageKey } = await uploadImageFeishu({
			cfg,
			image: buffer,
			accountId
		});
		return sendImageFeishu({
			cfg,
			to,
			imageKey,
			replyToMessageId,
			replyInThread,
			accountId
		});
	} else {
		const { fileKey } = await uploadFileFeishu({
			cfg,
			file: buffer,
			fileName: name,
			fileType: routing.fileType ?? "stream",
			accountId
		});
		return sendFileFeishu({
			cfg,
			to,
			fileKey,
			msgType: routing.msgType,
			replyToMessageId,
			replyInThread,
			accountId
		});
	}
}
//#endregion
export { jsonToolResult as A, resolveFeishuToolAccount as B, formatMentionAllForText as C, deliverCommentThreadText as D, isMentionForwardRequest as E, parseFeishuCommentTarget as F, getFeishuRuntime as I, setFeishuRuntime as L, unknownToolActionResult as M, buildFeishuCommentTarget as N, registerFeishuDriveTools as O, normalizeCommentFileType as P, createFeishuToolClient as R, formatMentionAllForCard as S, formatMentionForText as T, resolveToolsConfig as V, normalizeFeishuExternalKey as _, uploadFileFeishu as a, extractMentionTargets as b, getMessageFeishu as c, sendCardFeishu as d, sendMarkdownCardFeishu as f, parsePostContent as g, updateCardFeishu as h, sendMediaFeishu as i, toolExecutionErrorResult as j, replyComment as k, listFeishuThreadMessages as l, sendStructuredCardFeishu as m, sendFileFeishu as n, uploadImageFeishu as o, sendMessageFeishu as p, sendImageFeishu as r, editMessageFeishu as s, downloadMessageResourceFeishu as t, resolveFeishuCardTemplate as u, buildMentionedCardContent as v, formatMentionForCard as w, extractMessageBody as x, buildMentionedMessage as y, resolveAnyEnabledFeishuToolsConfig as z };
