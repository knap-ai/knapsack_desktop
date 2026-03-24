import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { r as getChatChannelMeta } from "./registry-C5UkPpaO.js";
import { o as ToolPolicySchema } from "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import { F as requireOpenAllowFrom, a as DmPolicySchema, c as GroupPolicySchema, m as MarkdownConfigSchema, y as ReplyRuntimeConfigSchemaShape } from "./zod-schema.core-BuVz8Rk7.js";
import { Jb as adaptScopedAccountAccessor, Mv as dispatchInboundReplyWithBase, Ob as formatNormalizedAllowFromEntries, Px as createAllowlistProviderOpenWarningCollector, Qb as createScopedChannelConfigAdapter, Vb as createChatChannelPlugin, ex as createScopedDmSecurityResolver, jx as composeAccountWarningCollectors } from "./pi-embedded-CbCYZxIb.js";
import { n as describeAccountSnapshot } from "./account-helpers-BzkeDMfB.js";
import { r as buildChannelConfigSchema } from "./config-schema-CPzP2Ds6.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "./runtime-group-policy-D8ugNNDZ.js";
import { l as createComputedAccountStatusAdapter, n as buildBaseChannelStatusSummary, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { n as createChannelPairingController } from "./channel-pairing-BrG9NqjP.js";
import { n as readStoreAllowFromForDmPolicy, s as resolveEffectiveAllowFromLists, u as resolveControlCommandGate } from "./dm-policy-shared-DtcQProI.js";
import { n as isDangerousNameMatchingEnabled } from "./dangerous-name-matching-BQW4HoPt.js";
import { c as logInboundDrop } from "./channel-feedback-BSaFwmB3.js";
import { r as deliverFormattedTextWithAttachments } from "./reply-payload-CiQ7TPgp.js";
import { l as listResolvedDirectoryEntriesFromSources, p as createChannelDirectoryAdapter } from "./directory-runtime-D9Y42mW-.js";
import { t as createAccountStatusSink } from "./channel-lifecycle-DmiShiUP.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { c as resolveLoggerBackedRuntime, l as runStoppablePassiveMonitor, s as requireChannelOpenAllowFrom } from "./extension-shared-B8dMu-tU.js";
import { a as normalizeIrcAllowEntry, c as resolveIrcAllowlistMatch, f as listIrcAccountIds, i as looksLikeIrcTargetId, l as hasIrcControlChars, m as resolveIrcAccount, n as ircSetupAdapter, o as normalizeIrcAllowlist, p as resolveDefaultIrcAccountId, r as isChannelTarget, s as normalizeIrcMessagingTarget, t as ircSetupWizard, u as stripIrcControlChars } from "./api-qOpfHwS8.js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import net from "node:net";
import tls from "node:tls";
//#region extensions/irc/src/config-schema.ts
const IrcGroupSchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: z.record(z.string(), ToolPolicySchema).optional(),
	skills: z.array(z.string()).optional(),
	enabled: z.boolean().optional(),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	systemPrompt: z.string().optional()
}).strict();
const IrcNickServSchema = z.object({
	enabled: z.boolean().optional(),
	service: z.string().optional(),
	password: z.string().optional(),
	passwordFile: z.string().optional(),
	register: z.boolean().optional(),
	registerEmail: z.string().optional()
}).strict().superRefine((value, ctx) => {
	if (value.register && !value.registerEmail?.trim()) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["registerEmail"],
		message: "channels.irc.nickserv.register=true requires channels.irc.nickserv.registerEmail"
	});
});
const IrcAccountSchemaBase = z.object({
	name: z.string().optional(),
	enabled: z.boolean().optional(),
	dangerouslyAllowNameMatching: z.boolean().optional(),
	host: z.string().optional(),
	port: z.number().int().min(1).max(65535).optional(),
	tls: z.boolean().optional(),
	nick: z.string().optional(),
	username: z.string().optional(),
	realname: z.string().optional(),
	password: z.string().optional(),
	passwordFile: z.string().optional(),
	nickserv: IrcNickServSchema.optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groups: z.record(z.string(), IrcGroupSchema.optional()).optional(),
	channels: z.array(z.string()).optional(),
	mentionPatterns: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	...ReplyRuntimeConfigSchemaShape
}).strict();
const IrcAccountSchema = IrcAccountSchemaBase.superRefine((value, ctx) => {
	requireChannelOpenAllowFrom({
		channel: "irc",
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		requireOpenAllowFrom
	});
});
const IrcConfigSchema = IrcAccountSchemaBase.extend({
	accounts: z.record(z.string(), IrcAccountSchema.optional()).optional(),
	defaultAccount: z.string().optional()
}).superRefine((value, ctx) => {
	requireChannelOpenAllowFrom({
		channel: "irc",
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		requireOpenAllowFrom
	});
});
//#endregion
//#region extensions/irc/src/protocol.ts
const IRC_TARGET_PATTERN = /^[^\s:]+$/u;
function parseIrcLine(line) {
	const raw = line.replace(/[\r\n]+/g, "").trim();
	if (!raw) return null;
	let cursor = raw;
	let prefix;
	if (cursor.startsWith(":")) {
		const idx = cursor.indexOf(" ");
		if (idx <= 1) return null;
		prefix = cursor.slice(1, idx);
		cursor = cursor.slice(idx + 1).trimStart();
	}
	if (!cursor) return null;
	const firstSpace = cursor.indexOf(" ");
	const command = (firstSpace === -1 ? cursor : cursor.slice(0, firstSpace)).trim();
	if (!command) return null;
	cursor = firstSpace === -1 ? "" : cursor.slice(firstSpace + 1);
	const params = [];
	let trailing;
	while (cursor.length > 0) {
		cursor = cursor.trimStart();
		if (!cursor) break;
		if (cursor.startsWith(":")) {
			trailing = cursor.slice(1);
			break;
		}
		const spaceIdx = cursor.indexOf(" ");
		if (spaceIdx === -1) {
			params.push(cursor);
			break;
		}
		params.push(cursor.slice(0, spaceIdx));
		cursor = cursor.slice(spaceIdx + 1);
	}
	return {
		raw,
		prefix,
		command: command.toUpperCase(),
		params,
		trailing
	};
}
function parseIrcPrefix(prefix) {
	if (!prefix) return {};
	const nickPart = prefix.match(/^([^!@]+)!([^@]+)@(.+)$/);
	if (nickPart) return {
		nick: nickPart[1],
		user: nickPart[2],
		host: nickPart[3]
	};
	const nickHostPart = prefix.match(/^([^@]+)@(.+)$/);
	if (nickHostPart) return {
		nick: nickHostPart[1],
		host: nickHostPart[2]
	};
	if (prefix.includes("!")) {
		const [nick, user] = prefix.split("!", 2);
		return {
			nick,
			user
		};
	}
	if (prefix.includes(".")) return { server: prefix };
	return { nick: prefix };
}
function decodeLiteralEscapes(input) {
	return input.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\t/g, "	").replace(/\\0/g, "\0").replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16))).replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
}
function sanitizeIrcOutboundText(text) {
	return stripIrcControlChars(decodeLiteralEscapes(text).replace(/\r?\n/g, " ")).trim();
}
function sanitizeIrcTarget(raw) {
	const decoded = decodeLiteralEscapes(raw);
	if (!decoded) throw new Error("IRC target is required");
	if (decoded !== decoded.trim()) throw new Error(`Invalid IRC target: ${raw}`);
	if (hasIrcControlChars(decoded)) throw new Error(`Invalid IRC target: ${raw}`);
	if (!IRC_TARGET_PATTERN.test(decoded)) throw new Error(`Invalid IRC target: ${raw}`);
	return decoded;
}
function makeIrcMessageId() {
	return randomUUID();
}
//#endregion
//#region extensions/irc/src/client.ts
const IRC_ERROR_CODES = new Set([
	"432",
	"464",
	"465"
]);
const IRC_NICK_COLLISION_CODES = new Set(["433", "436"]);
function toError(err) {
	if (err instanceof Error) return err;
	return new Error(typeof err === "string" ? err : JSON.stringify(err));
}
function withTimeout(promise, timeoutMs, label) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(/* @__PURE__ */ new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
		promise.then((result) => {
			clearTimeout(timer);
			resolve(result);
		}).catch((error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}
function buildFallbackNick(nick) {
	const base = nick.replace(/\s+/g, "").replace(/[^A-Za-z0-9_\-\[\]\\`^{}|]/g, "") || "openclaw";
	const suffix = "_";
	const maxNickLen = 30;
	if (base.length >= maxNickLen) return `${base.slice(0, maxNickLen - 1)}${suffix}`;
	return `${base}${suffix}`;
}
function buildIrcNickServCommands(options) {
	if (!options || options.enabled === false) return [];
	const password = sanitizeIrcOutboundText(options.password ?? "");
	if (!password) return [];
	const service = sanitizeIrcTarget(options.service?.trim() || "NickServ");
	const commands = [`PRIVMSG ${service} :IDENTIFY ${password}`];
	if (options.register) {
		const registerEmail = sanitizeIrcOutboundText(options.registerEmail ?? "");
		if (!registerEmail) throw new Error("IRC NickServ register requires registerEmail");
		commands.push(`PRIVMSG ${service} :REGISTER ${password} ${registerEmail}`);
	}
	return commands;
}
async function connectIrcClient(options) {
	const timeoutMs = options.connectTimeoutMs != null ? options.connectTimeoutMs : 15e3;
	const messageChunkMaxChars = options.messageChunkMaxChars != null ? options.messageChunkMaxChars : 350;
	if (!options.host.trim()) throw new Error("IRC host is required");
	if (!options.nick.trim()) throw new Error("IRC nick is required");
	const desiredNick = options.nick.trim();
	let currentNick = desiredNick;
	let ready = false;
	let closed = false;
	let nickServRecoverAttempted = false;
	let fallbackNickAttempted = false;
	const socket = options.tls ? tls.connect({
		host: options.host,
		port: options.port,
		servername: options.host
	}) : net.connect({
		host: options.host,
		port: options.port
	});
	socket.setEncoding("utf8");
	let resolveReady = null;
	let rejectReady = null;
	const readyPromise = new Promise((resolve, reject) => {
		resolveReady = resolve;
		rejectReady = reject;
	});
	const fail = (err) => {
		const error = toError(err);
		if (options.onError) options.onError(error);
		if (!ready && rejectReady) {
			rejectReady(error);
			rejectReady = null;
			resolveReady = null;
		}
	};
	const sendRaw = (line) => {
		const cleaned = line.replace(/[\r\n]+/g, "").trim();
		if (!cleaned) throw new Error("IRC command cannot be empty");
		socket.write(`${cleaned}\r\n`);
	};
	const tryRecoverNickCollision = () => {
		const nickServEnabled = options.nickserv?.enabled !== false;
		const nickservPassword = sanitizeIrcOutboundText(options.nickserv?.password ?? "");
		if (nickServEnabled && !nickServRecoverAttempted && nickservPassword) {
			nickServRecoverAttempted = true;
			try {
				sendRaw(`PRIVMSG ${sanitizeIrcTarget(options.nickserv?.service?.trim() || "NickServ")} :GHOST ${desiredNick} ${nickservPassword}`);
				sendRaw(`NICK ${desiredNick}`);
				return true;
			} catch (err) {
				fail(err);
			}
		}
		if (!fallbackNickAttempted) {
			fallbackNickAttempted = true;
			const fallbackNick = buildFallbackNick(desiredNick);
			if (fallbackNick.toLowerCase() !== currentNick.toLowerCase()) try {
				sendRaw(`NICK ${fallbackNick}`);
				currentNick = fallbackNick;
				return true;
			} catch (err) {
				fail(err);
			}
		}
		return false;
	};
	const join = (channel) => {
		const target = sanitizeIrcTarget(channel);
		if (!target.startsWith("#") && !target.startsWith("&")) throw new Error(`IRC JOIN target must be a channel: ${channel}`);
		sendRaw(`JOIN ${target}`);
	};
	const sendPrivmsg = (target, text) => {
		const normalizedTarget = sanitizeIrcTarget(target);
		const cleaned = sanitizeIrcOutboundText(text);
		if (!cleaned) return;
		let remaining = cleaned;
		while (remaining.length > 0) {
			let chunk = remaining;
			if (chunk.length > messageChunkMaxChars) {
				let splitAt = chunk.lastIndexOf(" ", messageChunkMaxChars);
				if (splitAt < Math.floor(messageChunkMaxChars / 2)) splitAt = messageChunkMaxChars;
				chunk = chunk.slice(0, splitAt).trim();
			}
			if (!chunk) break;
			sendRaw(`PRIVMSG ${normalizedTarget} :${chunk}`);
			remaining = remaining.slice(chunk.length).trimStart();
		}
	};
	const quit = (reason) => {
		if (closed) return;
		closed = true;
		const safeReason = sanitizeIrcOutboundText(reason != null ? reason : "bye");
		try {
			if (safeReason) sendRaw(`QUIT :${safeReason}`);
			else sendRaw("QUIT");
		} catch {}
		socket.end();
	};
	const close = () => {
		if (closed) return;
		closed = true;
		socket.destroy();
	};
	let buffer = "";
	socket.on("data", (chunk) => {
		buffer += chunk;
		let idx = buffer.indexOf("\n");
		while (idx !== -1) {
			const rawLine = buffer.slice(0, idx).replace(/\r$/, "");
			buffer = buffer.slice(idx + 1);
			idx = buffer.indexOf("\n");
			if (!rawLine) continue;
			if (options.onLine) options.onLine(rawLine);
			const line = parseIrcLine(rawLine);
			if (!line) continue;
			if (line.command === "PING") {
				sendRaw(`PONG :${line.trailing != null ? line.trailing : line.params[0] != null ? line.params[0] : ""}`);
				continue;
			}
			if (line.command === "NICK") {
				const prefix = parseIrcPrefix(line.prefix);
				if (prefix.nick && prefix.nick.toLowerCase() === currentNick.toLowerCase()) {
					const next = line.trailing != null ? line.trailing : line.params[0] != null ? line.params[0] : currentNick;
					currentNick = String(next).trim();
				}
				continue;
			}
			if (!ready && IRC_NICK_COLLISION_CODES.has(line.command)) {
				if (tryRecoverNickCollision()) continue;
				const detail = line.trailing != null ? line.trailing : line.params.join(" ") || "nickname in use";
				fail(/* @__PURE__ */ new Error(`IRC login failed (${line.command}): ${detail}`));
				close();
				return;
			}
			if (!ready && IRC_ERROR_CODES.has(line.command)) {
				const detail = line.trailing != null ? line.trailing : line.params.join(" ") || "login rejected";
				fail(/* @__PURE__ */ new Error(`IRC login failed (${line.command}): ${detail}`));
				close();
				return;
			}
			if (line.command === "001") {
				ready = true;
				const nickParam = line.params[0];
				if (nickParam && nickParam.trim()) currentNick = nickParam.trim();
				try {
					const nickServCommands = buildIrcNickServCommands(options.nickserv);
					for (const command of nickServCommands) sendRaw(command);
				} catch (err) {
					fail(err);
				}
				for (const channel of options.channels || []) {
					const trimmed = channel.trim();
					if (!trimmed) continue;
					try {
						join(trimmed);
					} catch (err) {
						fail(err);
					}
				}
				if (resolveReady) resolveReady();
				resolveReady = null;
				rejectReady = null;
				continue;
			}
			if (line.command === "NOTICE") {
				if (options.onNotice) options.onNotice(line.trailing != null ? line.trailing : "", line.params[0]);
				continue;
			}
			if (line.command === "PRIVMSG") {
				const targetParam = line.params[0];
				const target = targetParam ? targetParam.trim() : "";
				const text = line.trailing != null ? line.trailing : "";
				const prefix = parseIrcPrefix(line.prefix);
				const senderNick = prefix.nick ? prefix.nick.trim() : "";
				if (!target || !senderNick || !text.trim()) continue;
				if (options.onPrivmsg) Promise.resolve(options.onPrivmsg({
					senderNick,
					senderUser: prefix.user ? prefix.user.trim() : void 0,
					senderHost: prefix.host ? prefix.host.trim() : void 0,
					target,
					text,
					rawLine
				})).catch((error) => {
					fail(error);
				});
			}
		}
	});
	socket.once("connect", () => {
		try {
			if (options.password && options.password.trim()) sendRaw(`PASS ${options.password.trim()}`);
			sendRaw(`NICK ${options.nick.trim()}`);
			sendRaw(`USER ${options.username.trim()} 0 * :${sanitizeIrcOutboundText(options.realname)}`);
		} catch (err) {
			fail(err);
			close();
		}
	});
	socket.once("error", (err) => {
		fail(err);
	});
	socket.once("close", () => {
		if (!closed) {
			closed = true;
			if (!ready) fail(/* @__PURE__ */ new Error("IRC connection closed before ready"));
		}
	});
	if (options.abortSignal) {
		const abort = () => {
			quit("shutdown");
		};
		if (options.abortSignal.aborted) abort();
		else options.abortSignal.addEventListener("abort", abort, { once: true });
	}
	await withTimeout(readyPromise, timeoutMs, "IRC connect");
	return {
		get nick() {
			return currentNick;
		},
		isReady: () => ready && !closed,
		sendRaw,
		join,
		sendPrivmsg,
		quit,
		close
	};
}
//#endregion
//#region extensions/irc/src/connect-options.ts
function buildIrcConnectOptions(account, overrides = {}) {
	return {
		host: account.host,
		port: account.port,
		tls: account.tls,
		nick: account.nick,
		username: account.username,
		realname: account.realname,
		password: account.password,
		nickserv: {
			enabled: account.config.nickserv?.enabled,
			service: account.config.nickserv?.service,
			password: account.config.nickserv?.password,
			register: account.config.nickserv?.register,
			registerEmail: account.config.nickserv?.registerEmail
		},
		...overrides
	};
}
//#endregion
//#region extensions/irc/src/policy.ts
function resolveIrcGroupMatch(params) {
	const groups = params.groups ?? {};
	const hasConfiguredGroups = Object.keys(groups).length > 0;
	const direct = groups[params.target];
	if (direct) return {
		allowed: true,
		groupConfig: direct,
		wildcardConfig: groups["*"],
		hasConfiguredGroups
	};
	const targetLower = params.target.toLowerCase();
	const directKey = Object.keys(groups).find((key) => key.toLowerCase() === targetLower);
	if (directKey) {
		const matched = groups[directKey];
		if (matched) return {
			allowed: true,
			groupConfig: matched,
			wildcardConfig: groups["*"],
			hasConfiguredGroups
		};
	}
	const wildcard = groups["*"];
	if (wildcard) return {
		allowed: true,
		wildcardConfig: wildcard,
		hasConfiguredGroups
	};
	return {
		allowed: false,
		hasConfiguredGroups
	};
}
function resolveIrcGroupAccessGate(params) {
	const policy = params.groupPolicy ?? "allowlist";
	if (policy === "disabled") return {
		allowed: false,
		reason: "groupPolicy=disabled"
	};
	if (policy === "allowlist") {
		if (!params.groupMatch.hasConfiguredGroups) return {
			allowed: false,
			reason: "groupPolicy=allowlist and no groups configured"
		};
		if (!params.groupMatch.allowed) return {
			allowed: false,
			reason: "not allowlisted"
		};
	}
	if (params.groupMatch.groupConfig?.enabled === false || params.groupMatch.wildcardConfig?.enabled === false) return {
		allowed: false,
		reason: "disabled"
	};
	return {
		allowed: true,
		reason: policy === "open" ? "open" : "allowlisted"
	};
}
function resolveIrcRequireMention(params) {
	if (params.groupConfig?.requireMention !== void 0) return params.groupConfig.requireMention;
	if (params.wildcardConfig?.requireMention !== void 0) return params.wildcardConfig.requireMention;
	return true;
}
function resolveIrcMentionGate(params) {
	if (!params.isGroup) return {
		shouldSkip: false,
		reason: "direct"
	};
	if (!params.requireMention) return {
		shouldSkip: false,
		reason: "mention-not-required"
	};
	if (params.wasMentioned) return {
		shouldSkip: false,
		reason: "mentioned"
	};
	if (params.hasControlCommand && params.allowTextCommands && params.commandAuthorized) return {
		shouldSkip: false,
		reason: "authorized-command"
	};
	return {
		shouldSkip: true,
		reason: "missing-mention"
	};
}
function resolveIrcGroupSenderAllowed(params) {
	const policy = params.groupPolicy ?? "allowlist";
	const inner = normalizeIrcAllowlist(params.innerAllowFrom);
	const outer = normalizeIrcAllowlist(params.outerAllowFrom);
	if (inner.length > 0) return resolveIrcAllowlistMatch({
		allowFrom: inner,
		message: params.message,
		allowNameMatching: params.allowNameMatching
	}).allowed;
	if (outer.length > 0) return resolveIrcAllowlistMatch({
		allowFrom: outer,
		message: params.message,
		allowNameMatching: params.allowNameMatching
	}).allowed;
	return policy === "open";
}
//#endregion
//#region extensions/irc/src/runtime.ts
const { setRuntime: setIrcRuntime, getRuntime: getIrcRuntime } = createPluginRuntimeStore("IRC runtime not initialized");
//#endregion
//#region extensions/irc/src/send.ts
function resolveTarget(to, opts) {
	const fromArg = normalizeIrcMessagingTarget(to);
	if (fromArg) return fromArg;
	const fromOpt = normalizeIrcMessagingTarget(opts?.target ?? "");
	if (fromOpt) return fromOpt;
	throw new Error(`Invalid IRC target: ${to}`);
}
async function sendMessageIrc(to, text, opts = {}) {
	const runtime = getIrcRuntime();
	const cfg = opts.cfg ?? runtime.config.loadConfig();
	const account = resolveIrcAccount({
		cfg,
		accountId: opts.accountId
	});
	if (!account.configured) throw new Error(`IRC is not configured for account "${account.accountId}" (need host and nick in channels.irc).`);
	const target = resolveTarget(to, opts);
	const tableMode = runtime.channel.text.resolveMarkdownTableMode({
		cfg,
		channel: "irc",
		accountId: account.accountId
	});
	const prepared = runtime.channel.text.convertMarkdownTables(text.trim(), tableMode);
	const payload = opts.replyTo ? `${prepared}\n\n[reply:${opts.replyTo}]` : prepared;
	if (!payload.trim()) throw new Error("Message must be non-empty for IRC sends");
	const client = opts.client;
	if (client?.isReady()) client.sendPrivmsg(target, payload);
	else {
		const transient = await connectIrcClient(buildIrcConnectOptions(account, { connectTimeoutMs: 12e3 }));
		transient.sendPrivmsg(target, payload);
		transient.quit("sent");
	}
	runtime.channel.activity.record({
		channel: "irc",
		accountId: account.accountId,
		direction: "outbound"
	});
	return {
		messageId: makeIrcMessageId(),
		target
	};
}
//#endregion
//#region extensions/irc/src/inbound.ts
const CHANNEL_ID = "irc";
const escapeIrcRegexLiteral = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function resolveIrcEffectiveAllowlists(params) {
	const { effectiveAllowFrom, effectiveGroupAllowFrom } = resolveEffectiveAllowFromLists({
		allowFrom: params.configAllowFrom,
		groupAllowFrom: params.configGroupAllowFrom,
		storeAllowFrom: params.storeAllowList,
		dmPolicy: params.dmPolicy,
		groupAllowFromFallbackToAllowFrom: false
	});
	return {
		effectiveAllowFrom,
		effectiveGroupAllowFrom
	};
}
async function deliverIrcReply(params) {
	if (!await deliverFormattedTextWithAttachments({
		payload: params.payload,
		send: async ({ text, replyToId }) => {
			if (params.sendReply) await params.sendReply(params.target, text, replyToId);
			else await sendMessageIrc(params.target, text, {
				accountId: params.accountId,
				replyTo: replyToId
			});
			params.statusSink?.({ lastOutboundAt: Date.now() });
		}
	})) return;
}
async function handleIrcInbound(params) {
	const { message, account, config, runtime, connectedNick, statusSink } = params;
	const core = getIrcRuntime();
	const pairing = createChannelPairingController({
		core,
		channel: CHANNEL_ID,
		accountId: account.accountId
	});
	const rawBody = message.text?.trim() ?? "";
	if (!rawBody) return;
	statusSink?.({ lastInboundAt: message.timestamp });
	const senderDisplay = message.senderHost ? `${message.senderNick}!${message.senderUser ?? "?"}@${message.senderHost}` : message.senderNick;
	const allowNameMatching = isDangerousNameMatchingEnabled(account.config);
	const dmPolicy = account.config.dmPolicy ?? "pairing";
	const defaultGroupPolicy = resolveDefaultGroupPolicy(config);
	const { groupPolicy, providerMissingFallbackApplied } = resolveAllowlistProviderRuntimeGroupPolicy({
		providerConfigPresent: config.channels?.irc !== void 0,
		groupPolicy: account.config.groupPolicy,
		defaultGroupPolicy
	});
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "irc",
		accountId: account.accountId,
		blockedLabel: GROUP_POLICY_BLOCKED_LABEL.channel,
		log: (message) => runtime.log?.(message)
	});
	const configAllowFrom = normalizeIrcAllowlist(account.config.allowFrom);
	const configGroupAllowFrom = normalizeIrcAllowlist(account.config.groupAllowFrom);
	const storeAllowList = normalizeIrcAllowlist(await readStoreAllowFromForDmPolicy({
		provider: CHANNEL_ID,
		accountId: account.accountId,
		dmPolicy,
		readStore: pairing.readStoreForDmPolicy
	}));
	const groupMatch = resolveIrcGroupMatch({
		groups: account.config.groups,
		target: message.target
	});
	if (message.isGroup) {
		const groupAccess = resolveIrcGroupAccessGate({
			groupPolicy,
			groupMatch
		});
		if (!groupAccess.allowed) {
			runtime.log?.(`irc: drop channel ${message.target} (${groupAccess.reason})`);
			return;
		}
	}
	const directGroupAllowFrom = normalizeIrcAllowlist(groupMatch.groupConfig?.allowFrom);
	const wildcardGroupAllowFrom = normalizeIrcAllowlist(groupMatch.wildcardConfig?.allowFrom);
	const groupAllowFrom = directGroupAllowFrom.length > 0 ? directGroupAllowFrom : wildcardGroupAllowFrom;
	const { effectiveAllowFrom, effectiveGroupAllowFrom } = resolveIrcEffectiveAllowlists({
		configAllowFrom,
		configGroupAllowFrom,
		storeAllowList,
		dmPolicy
	});
	const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
		cfg: config,
		surface: CHANNEL_ID
	});
	const useAccessGroups = config.commands?.useAccessGroups !== false;
	const senderAllowedForCommands = resolveIrcAllowlistMatch({
		allowFrom: message.isGroup ? effectiveGroupAllowFrom : effectiveAllowFrom,
		message,
		allowNameMatching
	}).allowed;
	const hasControlCommand = core.channel.text.hasControlCommand(rawBody, config);
	const commandGate = resolveControlCommandGate({
		useAccessGroups,
		authorizers: [{
			configured: (message.isGroup ? effectiveGroupAllowFrom : effectiveAllowFrom).length > 0,
			allowed: senderAllowedForCommands
		}],
		allowTextCommands,
		hasControlCommand
	});
	const commandAuthorized = commandGate.commandAuthorized;
	if (message.isGroup) {
		if (!resolveIrcGroupSenderAllowed({
			groupPolicy,
			message,
			outerAllowFrom: effectiveGroupAllowFrom,
			innerAllowFrom: groupAllowFrom,
			allowNameMatching
		})) {
			runtime.log?.(`irc: drop group sender ${senderDisplay} (policy=${groupPolicy})`);
			return;
		}
	} else {
		if (dmPolicy === "disabled") {
			runtime.log?.(`irc: drop DM sender=${senderDisplay} (dmPolicy=disabled)`);
			return;
		}
		if (dmPolicy !== "open") {
			if (!resolveIrcAllowlistMatch({
				allowFrom: effectiveAllowFrom,
				message,
				allowNameMatching
			}).allowed) {
				if (dmPolicy === "pairing") await pairing.issueChallenge({
					senderId: senderDisplay.toLowerCase(),
					senderIdLine: `Your IRC id: ${senderDisplay}`,
					meta: { name: message.senderNick || void 0 },
					sendPairingReply: async (text) => {
						await deliverIrcReply({
							payload: { text },
							target: message.senderNick,
							accountId: account.accountId,
							sendReply: params.sendReply,
							statusSink
						});
					},
					onReplyError: (err) => {
						runtime.error?.(`irc: pairing reply failed for ${senderDisplay}: ${String(err)}`);
					}
				});
				runtime.log?.(`irc: drop DM sender ${senderDisplay} (dmPolicy=${dmPolicy})`);
				return;
			}
		}
	}
	if (message.isGroup && commandGate.shouldBlock) {
		logInboundDrop({
			log: (line) => runtime.log?.(line),
			channel: CHANNEL_ID,
			reason: "control command (unauthorized)",
			target: senderDisplay
		});
		return;
	}
	const mentionRegexes = core.channel.mentions.buildMentionRegexes(config);
	const mentionNick = connectedNick?.trim() || account.nick;
	const explicitMentionRegex = mentionNick ? new RegExp(`\\b${escapeIrcRegexLiteral(mentionNick)}\\b[:,]?`, "i") : null;
	const wasMentioned = core.channel.mentions.matchesMentionPatterns(rawBody, mentionRegexes) || (explicitMentionRegex ? explicitMentionRegex.test(rawBody) : false);
	const requireMention = message.isGroup ? resolveIrcRequireMention({
		groupConfig: groupMatch.groupConfig,
		wildcardConfig: groupMatch.wildcardConfig
	}) : false;
	const mentionGate = resolveIrcMentionGate({
		isGroup: message.isGroup,
		requireMention,
		wasMentioned,
		hasControlCommand,
		allowTextCommands,
		commandAuthorized
	});
	if (mentionGate.shouldSkip) {
		runtime.log?.(`irc: drop channel ${message.target} (${mentionGate.reason})`);
		return;
	}
	const peerId = message.isGroup ? message.target : message.senderNick;
	const route = core.channel.routing.resolveAgentRoute({
		cfg: config,
		channel: CHANNEL_ID,
		accountId: account.accountId,
		peer: {
			kind: message.isGroup ? "group" : "direct",
			id: peerId
		}
	});
	const fromLabel = message.isGroup ? message.target : senderDisplay;
	const storePath = core.channel.session.resolveStorePath(config.session?.store, { agentId: route.agentId });
	const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(config);
	const previousTimestamp = core.channel.session.readSessionUpdatedAt({
		storePath,
		sessionKey: route.sessionKey
	});
	const body = core.channel.reply.formatAgentEnvelope({
		channel: "IRC",
		from: fromLabel,
		timestamp: message.timestamp,
		previousTimestamp,
		envelope: envelopeOptions,
		body: rawBody
	});
	const groupSystemPrompt = groupMatch.groupConfig?.systemPrompt?.trim() || void 0;
	const ctxPayload = core.channel.reply.finalizeInboundContext({
		Body: body,
		RawBody: rawBody,
		CommandBody: rawBody,
		From: message.isGroup ? `irc:channel:${message.target}` : `irc:${senderDisplay}`,
		To: `irc:${peerId}`,
		SessionKey: route.sessionKey,
		AccountId: route.accountId,
		ChatType: message.isGroup ? "group" : "direct",
		ConversationLabel: fromLabel,
		SenderName: message.senderNick || void 0,
		SenderId: senderDisplay,
		GroupSubject: message.isGroup ? message.target : void 0,
		GroupSystemPrompt: message.isGroup ? groupSystemPrompt : void 0,
		Provider: CHANNEL_ID,
		Surface: CHANNEL_ID,
		WasMentioned: message.isGroup ? wasMentioned : void 0,
		MessageSid: message.messageId,
		Timestamp: message.timestamp,
		OriginatingChannel: CHANNEL_ID,
		OriginatingTo: `irc:${peerId}`,
		CommandAuthorized: commandAuthorized
	});
	await dispatchInboundReplyWithBase({
		cfg: config,
		channel: CHANNEL_ID,
		accountId: account.accountId,
		route,
		storePath,
		ctxPayload,
		core,
		deliver: async (payload) => {
			await deliverIrcReply({
				payload,
				target: peerId,
				accountId: account.accountId,
				sendReply: params.sendReply,
				statusSink
			});
		},
		onRecordError: (err) => {
			runtime.error?.(`irc: failed updating session meta: ${String(err)}`);
		},
		onDispatchError: (err, info) => {
			runtime.error?.(`irc ${info.kind} reply failed: ${String(err)}`);
		},
		replyOptions: {
			skillFilter: groupMatch.groupConfig?.skills,
			disableBlockStreaming: typeof account.config.blockStreaming === "boolean" ? !account.config.blockStreaming : void 0
		}
	});
}
//#endregion
//#region extensions/irc/src/monitor.ts
function resolveIrcInboundTarget(params) {
	const rawTarget = params.target;
	if (isChannelTarget(rawTarget)) return {
		isGroup: true,
		target: rawTarget,
		rawTarget
	};
	return {
		isGroup: false,
		target: params.senderNick.trim() || rawTarget,
		rawTarget
	};
}
async function monitorIrcProvider(opts) {
	const core = getIrcRuntime();
	const cfg = opts.config ?? core.config.loadConfig();
	const account = resolveIrcAccount({
		cfg,
		accountId: opts.accountId
	});
	const runtime = resolveLoggerBackedRuntime(opts.runtime, core.logging.getChildLogger());
	if (!account.configured) throw new Error(`IRC is not configured for account "${account.accountId}" (need host and nick in channels.irc).`);
	const logger = core.logging.getChildLogger({
		channel: "irc",
		accountId: account.accountId
	});
	let client = null;
	client = await connectIrcClient(buildIrcConnectOptions(account, {
		channels: account.config.channels,
		abortSignal: opts.abortSignal,
		onLine: (line) => {
			if (core.logging.shouldLogVerbose()) logger.debug?.(`[${account.accountId}] << ${line}`);
		},
		onNotice: (text, target) => {
			if (core.logging.shouldLogVerbose()) logger.debug?.(`[${account.accountId}] notice ${target ?? ""}: ${text}`);
		},
		onError: (error) => {
			logger.error(`[${account.accountId}] IRC error: ${error.message}`);
		},
		onPrivmsg: async (event) => {
			if (!client) return;
			if (event.senderNick.toLowerCase() === client.nick.toLowerCase()) return;
			const inboundTarget = resolveIrcInboundTarget({
				target: event.target,
				senderNick: event.senderNick
			});
			const message = {
				messageId: makeIrcMessageId(),
				target: inboundTarget.target,
				rawTarget: inboundTarget.rawTarget,
				senderNick: event.senderNick,
				senderUser: event.senderUser,
				senderHost: event.senderHost,
				text: event.text,
				timestamp: Date.now(),
				isGroup: inboundTarget.isGroup
			};
			core.channel.activity.record({
				channel: "irc",
				accountId: account.accountId,
				direction: "inbound",
				at: message.timestamp
			});
			if (opts.onMessage) {
				await opts.onMessage(message, client);
				return;
			}
			await handleIrcInbound({
				message,
				account,
				config: cfg,
				runtime,
				connectedNick: client.nick,
				sendReply: async (target, text) => {
					client?.sendPrivmsg(target, text);
					opts.statusSink?.({ lastOutboundAt: Date.now() });
					core.channel.activity.record({
						channel: "irc",
						accountId: account.accountId,
						direction: "outbound"
					});
				},
				statusSink: opts.statusSink
			});
		}
	}));
	logger.info(`[${account.accountId}] connected to ${account.host}:${account.port}${account.tls ? " (tls)" : ""} as ${client.nick}`);
	return { stop: () => {
		client?.quit("shutdown");
		client = null;
	} };
}
//#endregion
//#region extensions/irc/src/probe.ts
function formatError(err) {
	if (err instanceof Error) return err.message;
	return typeof err === "string" ? err : JSON.stringify(err);
}
async function probeIrc(cfg, opts) {
	const account = resolveIrcAccount({
		cfg,
		accountId: opts?.accountId
	});
	const base = {
		ok: false,
		host: account.host,
		port: account.port,
		tls: account.tls,
		nick: account.nick
	};
	if (!account.configured) return {
		...base,
		error: "missing host or nick"
	};
	const started = Date.now();
	try {
		const client = await connectIrcClient(buildIrcConnectOptions(account, { connectTimeoutMs: opts?.timeoutMs ?? 8e3 }));
		const elapsed = Date.now() - started;
		client.quit("probe");
		return {
			...base,
			ok: true,
			latencyMs: elapsed
		};
	} catch (err) {
		return {
			...base,
			error: formatError(err)
		};
	}
}
//#endregion
//#region extensions/irc/src/channel.ts
const meta = getChatChannelMeta("irc");
function normalizePairingTarget(raw) {
	const normalized = normalizeIrcAllowEntry(raw);
	if (!normalized) return "";
	return normalized.split(/[!@]/, 1)[0]?.trim() ?? "";
}
const ircConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: "irc",
	listAccountIds: listIrcAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveIrcAccount),
	defaultAccountId: resolveDefaultIrcAccountId,
	clearBaseFields: [
		"name",
		"host",
		"port",
		"tls",
		"nick",
		"username",
		"realname",
		"password",
		"passwordFile",
		"channels"
	],
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => formatNormalizedAllowFromEntries({
		allowFrom,
		normalizeEntry: normalizeIrcAllowEntry
	}),
	resolveDefaultTo: (account) => account.config.defaultTo
});
const resolveIrcDmPolicy = createScopedDmSecurityResolver({
	channelKey: "irc",
	resolvePolicy: (account) => account.config.dmPolicy,
	resolveAllowFrom: (account) => account.config.allowFrom,
	policyPathSuffix: "dmPolicy",
	normalizeEntry: (raw) => normalizeIrcAllowEntry(raw)
});
const collectIrcSecurityWarnings = composeAccountWarningCollectors(createAllowlistProviderOpenWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.irc !== void 0,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	buildOpenWarning: {
		surface: "IRC channels",
		openBehavior: "allows all channels and senders (mention-gated)",
		remediation: "Prefer channels.irc.groupPolicy=\"allowlist\" with channels.irc.groups"
	}
}), (account) => !account.config.tls && "- IRC TLS is disabled (channels.irc.tls=false); traffic and credentials are plaintext.", (account) => account.config.nickserv?.register && "- IRC NickServ registration is enabled (channels.irc.nickserv.register=true); this sends \"REGISTER\" on every connect. Disable after first successful registration.", (account) => account.config.nickserv?.register && !account.config.nickserv.password?.trim() && "- IRC NickServ registration is enabled but no NickServ password is resolved; set channels.irc.nickserv.password, channels.irc.nickserv.passwordFile, or IRC_NICKSERV_PASSWORD.");
const ircPlugin = createChatChannelPlugin({
	base: {
		id: "irc",
		meta: {
			...meta,
			quickstartAllowFrom: true
		},
		setup: ircSetupAdapter,
		setupWizard: ircSetupWizard,
		capabilities: {
			chatTypes: ["direct", "group"],
			media: true,
			blockStreaming: true
		},
		reload: { configPrefixes: ["channels.irc"] },
		configSchema: buildChannelConfigSchema(IrcConfigSchema),
		config: {
			...ircConfigAdapter,
			isConfigured: (account) => account.configured,
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.configured,
				extra: {
					host: account.host,
					port: account.port,
					tls: account.tls,
					nick: account.nick,
					passwordSource: account.passwordSource
				}
			})
		},
		groups: {
			resolveRequireMention: ({ cfg, accountId, groupId }) => {
				const account = resolveIrcAccount({
					cfg,
					accountId
				});
				if (!groupId) return true;
				const match = resolveIrcGroupMatch({
					groups: account.config.groups,
					target: groupId
				});
				return resolveIrcRequireMention({
					groupConfig: match.groupConfig,
					wildcardConfig: match.wildcardConfig
				});
			},
			resolveToolPolicy: ({ cfg, accountId, groupId }) => {
				const account = resolveIrcAccount({
					cfg,
					accountId
				});
				if (!groupId) return;
				const match = resolveIrcGroupMatch({
					groups: account.config.groups,
					target: groupId
				});
				return match.groupConfig?.tools ?? match.wildcardConfig?.tools;
			}
		},
		messaging: {
			normalizeTarget: normalizeIrcMessagingTarget,
			targetResolver: {
				looksLikeId: looksLikeIrcTargetId,
				hint: "<#channel|nick>"
			}
		},
		resolver: { resolveTargets: async ({ inputs, kind }) => {
			return inputs.map((input) => {
				const normalized = normalizeIrcMessagingTarget(input);
				if (!normalized) return {
					input,
					resolved: false,
					note: "invalid IRC target"
				};
				if (kind === "group") {
					const groupId = isChannelTarget(normalized) ? normalized : `#${normalized}`;
					return {
						input,
						resolved: true,
						id: groupId,
						name: groupId
					};
				}
				if (isChannelTarget(normalized)) return {
					input,
					resolved: false,
					note: "expected user target"
				};
				return {
					input,
					resolved: true,
					id: normalized,
					name: normalized
				};
			});
		} },
		directory: createChannelDirectoryAdapter({
			listPeers: async (params) => listResolvedDirectoryEntriesFromSources({
				...params,
				kind: "user",
				resolveAccount: adaptScopedAccountAccessor(resolveIrcAccount),
				resolveSources: (account) => [
					account.config.allowFrom ?? [],
					account.config.groupAllowFrom ?? [],
					...Object.values(account.config.groups ?? {}).map((group) => group.allowFrom ?? [])
				],
				normalizeId: (entry) => normalizePairingTarget(entry) || null
			}),
			listGroups: async (params) => {
				return listResolvedDirectoryEntriesFromSources({
					...params,
					kind: "group",
					resolveAccount: adaptScopedAccountAccessor(resolveIrcAccount),
					resolveSources: (account) => [account.config.channels ?? [], Object.keys(account.config.groups ?? {})],
					normalizeId: (entry) => {
						const normalized = normalizeIrcMessagingTarget(entry);
						return normalized && isChannelTarget(normalized) ? normalized : null;
					}
				}).map((entry) => ({
					...entry,
					name: entry.id
				}));
			}
		}),
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			buildChannelSummary: ({ account, snapshot }) => ({
				...buildBaseChannelStatusSummary(snapshot),
				host: account.host,
				port: snapshot.port,
				tls: account.tls,
				nick: account.nick,
				probe: snapshot.probe,
				lastProbeAt: snapshot.lastProbeAt ?? null
			}),
			probeAccount: async ({ cfg, account, timeoutMs }) => probeIrc(cfg, {
				accountId: account.accountId,
				timeoutMs
			}),
			resolveAccountSnapshot: ({ account }) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured,
				extra: {
					host: account.host,
					port: account.port,
					tls: account.tls,
					nick: account.nick,
					passwordSource: account.passwordSource
				}
			})
		}),
		gateway: { startAccount: async (ctx) => {
			const account = ctx.account;
			const statusSink = createAccountStatusSink({
				accountId: ctx.accountId,
				setStatus: ctx.setStatus
			});
			if (!account.configured) throw new Error(`IRC is not configured for account "${account.accountId}" (need host and nick in channels.irc).`);
			ctx.log?.info(`[${account.accountId}] starting IRC provider (${account.host}:${account.port}${account.tls ? " tls" : ""})`);
			await runStoppablePassiveMonitor({
				abortSignal: ctx.abortSignal,
				start: async () => await monitorIrcProvider({
					accountId: account.accountId,
					config: ctx.cfg,
					runtime: ctx.runtime,
					abortSignal: ctx.abortSignal,
					statusSink
				})
			});
		} }
	},
	pairing: { text: {
		idLabel: "ircUser",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: (entry) => normalizeIrcAllowEntry(entry),
		notify: async ({ id, message }) => {
			const target = normalizePairingTarget(id);
			if (!target) throw new Error(`invalid IRC pairing id: ${id}`);
			await sendMessageIrc(target, message);
		}
	} },
	security: {
		resolveDmPolicy: resolveIrcDmPolicy,
		collectWarnings: collectIrcSecurityWarnings
	},
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: (text, limit) => getIrcRuntime().channel.text.chunkMarkdownText(text, limit),
			chunkerMode: "markdown",
			textChunkLimit: 350
		},
		attachedResults: {
			channel: "irc",
			sendText: async ({ cfg, to, text, accountId, replyToId }) => await sendMessageIrc(to, text, {
				cfg,
				accountId: accountId ?? void 0,
				replyTo: replyToId ?? void 0
			}),
			sendMedia: async ({ cfg, to, text, mediaUrl, accountId, replyToId }) => await sendMessageIrc(to, mediaUrl ? `${text}\n\nAttachment: ${mediaUrl}` : text, {
				cfg,
				accountId: accountId ?? void 0,
				replyTo: replyToId ?? void 0
			})
		}
	}
});
//#endregion
export { setIrcRuntime as n, ircPlugin as t };
