import { i as resolveCodexAppServerRuntimeOptions } from "./config-BqDfPmSH.js";
import { n as listCodexAppServerModels, t as listAllCodexAppServerModels } from "./models-BK4iJFwS.js";
import { t as isJsonObject } from "./protocol-C9UWI98H.js";
import { i as withTimeout, n as getSharedCodexAppServerClient } from "./shared-client-C3NXWlxU.js";
import { a as parseCodexFastModeArg, c as setCodexConversationFastMode, d as steerCodexConversationTurn, f as stopCodexConversationTurn, g as describeControlFailure, h as CODEX_CONTROL_METHODS, i as formatPermissionsMode, l as setCodexConversationModel, m as resolveCodexDefaultWorkspaceDir, o as parseCodexPermissionsModeArg, p as readCodexConversationBindingData, r as startCodexConversationThread, s as readCodexConversationActiveTurn, u as setCodexConversationPermissions } from "./conversation-binding-BTs128LH.js";
import { i as writeCodexAppServerBinding, n as readCodexAppServerBinding, t as clearCodexAppServerBinding } from "./session-binding-Cqn1xQfg.js";
//#region extensions/codex/src/command-formatters.ts
function formatCodexStatus(probes) {
	const lines = [`Codex app-server: ${probes.models.ok || probes.account.ok || probes.limits.ok || probes.mcps.ok || probes.skills.ok ? "connected" : "unavailable"}`];
	if (probes.models.ok) lines.push(`Models: ${probes.models.value.models.map((model) => model.id).slice(0, 8).join(", ") || "none"}`);
	else lines.push(`Models: ${probes.models.error}`);
	lines.push(`Account: ${probes.account.ok ? summarizeAccount(probes.account.value) : probes.account.error}`);
	lines.push(`Rate limits: ${probes.limits.ok ? summarizeArrayLike(probes.limits.value) : probes.limits.error}`);
	lines.push(`MCP servers: ${probes.mcps.ok ? summarizeArrayLike(probes.mcps.value) : probes.mcps.error}`);
	lines.push(`Skills: ${probes.skills.ok ? summarizeArrayLike(probes.skills.value) : probes.skills.error}`);
	return lines.join("\n");
}
function formatModels(result) {
	if (result.models.length === 0) return "No Codex app-server models returned.";
	const lines = ["Codex models:", ...result.models.map((model) => `- ${model.id}${model.isDefault ? " (default)" : ""}`)];
	if (result.truncated) lines.push("- More models available; output truncated.");
	return lines.join("\n");
}
function formatThreads(response) {
	const threads = extractArray(response);
	if (threads.length === 0) return "No Codex threads returned.";
	return ["Codex threads:", ...threads.slice(0, 10).map((thread) => {
		const record = isJsonObject(thread) ? thread : {};
		const id = readString(record, "threadId") ?? readString(record, "id") ?? "<unknown>";
		const title = readString(record, "title") ?? readString(record, "name") ?? readString(record, "summary");
		const details = [
			readString(record, "model"),
			readString(record, "cwd"),
			readString(record, "updatedAt") ?? readString(record, "lastUpdatedAt")
		].filter(Boolean);
		return `- ${id}${title ? ` - ${title}` : ""}${details.length > 0 ? ` (${details.join(", ")})` : ""}\n  Resume: /codex resume ${id}`;
	})].join("\n");
}
function formatAccount(account, limits) {
	return [`Account: ${account.ok ? summarizeAccount(account.value) : account.error}`, `Rate limits: ${limits.ok ? summarizeArrayLike(limits.value) : limits.error}`].join("\n");
}
function formatList(response, label) {
	const entries = extractArray(response);
	if (entries.length === 0) return `${label}: none returned.`;
	return [`${label}:`, ...entries.slice(0, 25).map((entry) => {
		const record = isJsonObject(entry) ? entry : {};
		return `- ${readString(record, "name") ?? readString(record, "id") ?? JSON.stringify(entry)}`;
	})].join("\n");
}
function buildHelp() {
	return [
		"Codex commands:",
		"- /codex status",
		"- /codex models",
		"- /codex threads [filter]",
		"- /codex resume <thread-id>",
		"- /codex bind [thread-id] [--cwd <path>] [--model <model>] [--provider <provider>]",
		"- /codex binding",
		"- /codex stop",
		"- /codex steer <message>",
		"- /codex model [model]",
		"- /codex fast [on|off|status]",
		"- /codex permissions [default|yolo|status]",
		"- /codex detach",
		"- /codex compact",
		"- /codex review",
		"- /codex account",
		"- /codex mcp",
		"- /codex skills"
	].join("\n");
}
function summarizeAccount(value) {
	if (!isJsonObject(value)) return "unavailable";
	const account = isJsonObject(value.account) ? value.account : value;
	if (readString(account, "type") === "amazonBedrock") return "Amazon Bedrock";
	return readString(account, "email") ?? readString(account, "accountEmail") ?? readString(account, "planType") ?? readString(account, "id") ?? "available";
}
function summarizeArrayLike(value) {
	const entries = extractArray(value);
	if (entries.length === 0) return "none returned";
	return `${entries.length}`;
}
function extractArray(value) {
	if (Array.isArray(value)) return value;
	if (!isJsonObject(value)) return [];
	for (const key of [
		"data",
		"items",
		"threads",
		"models",
		"skills",
		"servers",
		"rateLimits"
	]) {
		const child = value[key];
		if (Array.isArray(child)) return child;
	}
	return [];
}
function readString(record, key) {
	const value = record[key];
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
//#endregion
//#region extensions/codex/src/app-server/request.ts
async function requestCodexAppServerJson(params) {
	const timeoutMs = params.timeoutMs ?? 6e4;
	return await withTimeout((async () => {
		return await (await getSharedCodexAppServerClient({
			startOptions: params.startOptions,
			timeoutMs,
			authProfileId: params.authProfileId
		})).request(params.method, params.requestParams, { timeoutMs });
	})(), timeoutMs, `codex app-server ${params.method} timed out`);
}
//#endregion
//#region extensions/codex/src/command-rpc.ts
function requestOptions(pluginConfig, limit) {
	const runtime = resolveCodexAppServerRuntimeOptions({ pluginConfig });
	return {
		limit,
		timeoutMs: runtime.requestTimeoutMs,
		startOptions: runtime.start
	};
}
async function codexControlRequest(pluginConfig, method, requestParams) {
	const runtime = resolveCodexAppServerRuntimeOptions({ pluginConfig });
	return await requestCodexAppServerJson({
		method,
		requestParams,
		timeoutMs: runtime.requestTimeoutMs,
		startOptions: runtime.start
	});
}
async function safeCodexControlRequest(pluginConfig, method, requestParams) {
	return await safeValue(async () => await codexControlRequest(pluginConfig, method, requestParams));
}
async function safeCodexModelList(pluginConfig, limit) {
	return await safeValue(async () => await listCodexAppServerModels(requestOptions(pluginConfig, limit)));
}
async function readCodexStatusProbes(pluginConfig) {
	const [models, account, limits, mcps, skills] = await Promise.all([
		safeCodexModelList(pluginConfig, 20),
		safeCodexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.account, { refreshToken: false }),
		safeCodexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.rateLimits, void 0),
		safeCodexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.listMcpServers, { limit: 100 }),
		safeCodexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.listSkills, {})
	]);
	return {
		models,
		account,
		limits,
		mcps,
		skills
	};
}
async function safeValue(read) {
	try {
		return {
			ok: true,
			value: await read()
		};
	} catch (error) {
		return {
			ok: false,
			error: describeControlFailure(error)
		};
	}
}
//#endregion
//#region extensions/codex/src/command-handlers.ts
const defaultCodexCommandDeps = {
	codexControlRequest,
	listCodexAppServerModels: listAllCodexAppServerModels,
	readCodexStatusProbes,
	readCodexAppServerBinding,
	requestOptions,
	safeCodexControlRequest,
	writeCodexAppServerBinding,
	clearCodexAppServerBinding,
	resolveCodexDefaultWorkspaceDir,
	startCodexConversationThread,
	readCodexConversationActiveTurn,
	setCodexConversationFastMode,
	setCodexConversationModel,
	setCodexConversationPermissions,
	steerCodexConversationTurn,
	stopCodexConversationTurn
};
async function handleCodexSubcommand(ctx, options) {
	const deps = {
		...defaultCodexCommandDeps,
		...options.deps
	};
	const [subcommand = "status", ...rest] = splitArgs(ctx.args);
	const normalized = subcommand.toLowerCase();
	if (normalized === "help") return { text: buildHelp() };
	if (normalized === "status") return { text: formatCodexStatus(await deps.readCodexStatusProbes(options.pluginConfig)) };
	if (normalized === "models") return { text: formatModels(await deps.listCodexAppServerModels(deps.requestOptions(options.pluginConfig, 100))) };
	if (normalized === "threads") return { text: await buildThreads(deps, options.pluginConfig, rest.join(" ")) };
	if (normalized === "resume") return { text: await resumeThread(deps, ctx, options.pluginConfig, rest[0]) };
	if (normalized === "bind") return await bindConversation(deps, ctx, options.pluginConfig, rest);
	if (normalized === "detach" || normalized === "unbind") return { text: await detachConversation(deps, ctx) };
	if (normalized === "binding") return { text: await describeConversationBinding(deps, ctx) };
	if (normalized === "stop") return { text: await stopConversationTurn(deps, ctx, options.pluginConfig) };
	if (normalized === "steer") return { text: await steerConversationTurn(deps, ctx, options.pluginConfig, rest.join(" ")) };
	if (normalized === "model") return { text: await setConversationModel(deps, ctx, options.pluginConfig, rest.join(" ")) };
	if (normalized === "fast") return { text: await setConversationFastMode(deps, ctx, options.pluginConfig, rest[0]) };
	if (normalized === "permissions") return { text: await setConversationPermissions(deps, ctx, options.pluginConfig, rest[0]) };
	if (normalized === "compact") return { text: await startThreadAction(deps, ctx, options.pluginConfig, CODEX_CONTROL_METHODS.compact, "compaction") };
	if (normalized === "review") return { text: await startThreadAction(deps, ctx, options.pluginConfig, CODEX_CONTROL_METHODS.review, "review") };
	if (normalized === "mcp") return { text: formatList(await deps.codexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.listMcpServers, { limit: 100 }), "MCP servers") };
	if (normalized === "skills") return { text: formatList(await deps.codexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.listSkills, {}), "Codex skills") };
	if (normalized === "account") {
		const [account, limits] = await Promise.all([deps.safeCodexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.account, { refreshToken: false }), deps.safeCodexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.rateLimits, void 0)]);
		return { text: formatAccount(account, limits) };
	}
	return { text: `Unknown Codex command: ${subcommand}\n\n${buildHelp()}` };
}
async function bindConversation(deps, ctx, pluginConfig, args) {
	if (!ctx.sessionFile) return { text: "Cannot bind Codex because this command did not include an OpenClaw session file." };
	const parsed = parseBindArgs(args);
	if (parsed.help) return { text: "Usage: /codex bind [thread-id] [--cwd <path>] [--model <model>] [--provider <provider>]" };
	const workspaceDir = parsed.cwd ?? deps.resolveCodexDefaultWorkspaceDir(pluginConfig);
	const data = await deps.startCodexConversationThread({
		pluginConfig,
		sessionFile: ctx.sessionFile,
		workspaceDir,
		threadId: parsed.threadId,
		model: parsed.model,
		modelProvider: parsed.provider
	});
	const threadId = (await deps.readCodexAppServerBinding(ctx.sessionFile))?.threadId ?? parsed.threadId ?? "new thread";
	const summary = `Codex app-server thread ${threadId} in ${workspaceDir}`;
	let request;
	try {
		request = await ctx.requestConversationBinding({
			summary,
			detachHint: "/codex detach",
			data
		});
	} catch (error) {
		await deps.clearCodexAppServerBinding(ctx.sessionFile);
		throw error;
	}
	if (request.status === "bound") return { text: `Bound this conversation to Codex thread ${threadId} in ${workspaceDir}.` };
	if (request.status === "pending") return request.reply;
	await deps.clearCodexAppServerBinding(ctx.sessionFile);
	return { text: request.message };
}
async function detachConversation(deps, ctx) {
	const data = readCodexConversationBindingData(await ctx.getCurrentConversationBinding());
	const detached = await ctx.detachConversationBinding();
	if (data) await deps.clearCodexAppServerBinding(data.sessionFile);
	else if (ctx.sessionFile) await deps.clearCodexAppServerBinding(ctx.sessionFile);
	return detached.removed ? "Detached this conversation from Codex." : "No Codex conversation binding was attached.";
}
async function describeConversationBinding(deps, ctx) {
	const current = await ctx.getCurrentConversationBinding();
	const data = readCodexConversationBindingData(current);
	if (!current || !data) return "No Codex conversation binding is attached.";
	const threadBinding = await deps.readCodexAppServerBinding(data.sessionFile);
	const active = deps.readCodexConversationActiveTurn(data.sessionFile);
	return [
		"Codex conversation binding:",
		`- Thread: ${threadBinding?.threadId ?? "unknown"}`,
		`- Workspace: ${data.workspaceDir}`,
		`- Model: ${threadBinding?.model ?? "default"}`,
		`- Fast: ${threadBinding?.serviceTier === "fast" ? "on" : "off"}`,
		`- Permissions: ${threadBinding ? formatPermissionsMode(threadBinding) : "default"}`,
		`- Active run: ${active ? active.turnId : "none"}`,
		`- Session: ${data.sessionFile}`
	].join("\n");
}
async function buildThreads(deps, pluginConfig, filter) {
	return formatThreads(await deps.codexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.listThreads, {
		limit: 10,
		...filter.trim() ? { searchTerm: filter.trim() } : {}
	}));
}
async function resumeThread(deps, ctx, pluginConfig, threadId) {
	const normalizedThreadId = threadId?.trim();
	if (!normalizedThreadId) return "Usage: /codex resume <thread-id>";
	if (!ctx.sessionFile) return "Cannot attach a Codex thread because this command did not include an OpenClaw session file.";
	const response = await deps.codexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.resumeThread, {
		threadId: normalizedThreadId,
		persistExtendedHistory: true
	});
	const thread = isJsonObject(response) && isJsonObject(response.thread) ? response.thread : {};
	const effectiveThreadId = readString(thread, "id") ?? normalizedThreadId;
	await deps.writeCodexAppServerBinding(ctx.sessionFile, {
		threadId: effectiveThreadId,
		cwd: readString(thread, "cwd") ?? "",
		model: isJsonObject(response) ? readString(response, "model") : void 0,
		modelProvider: isJsonObject(response) ? readString(response, "modelProvider") : void 0
	});
	return `Attached this OpenClaw session to Codex thread ${effectiveThreadId}.`;
}
async function stopConversationTurn(deps, ctx, pluginConfig) {
	const sessionFile = await resolveControlSessionFile(ctx);
	if (!sessionFile) return "Cannot stop Codex because this command did not include an OpenClaw session file.";
	return (await deps.stopCodexConversationTurn({
		sessionFile,
		pluginConfig
	})).message;
}
async function steerConversationTurn(deps, ctx, pluginConfig, message) {
	const sessionFile = await resolveControlSessionFile(ctx);
	if (!sessionFile) return "Cannot steer Codex because this command did not include an OpenClaw session file.";
	return (await deps.steerCodexConversationTurn({
		sessionFile,
		pluginConfig,
		message
	})).message;
}
async function setConversationModel(deps, ctx, pluginConfig, model) {
	const sessionFile = await resolveControlSessionFile(ctx);
	if (!sessionFile) return "Cannot set Codex model because this command did not include an OpenClaw session file.";
	const normalized = model.trim();
	if (!normalized) {
		const binding = await deps.readCodexAppServerBinding(sessionFile);
		return binding?.model ? `Codex model: ${binding.model}` : "Usage: /codex model <model>";
	}
	return await deps.setCodexConversationModel({
		sessionFile,
		pluginConfig,
		model: normalized
	});
}
async function setConversationFastMode(deps, ctx, pluginConfig, value) {
	const sessionFile = await resolveControlSessionFile(ctx);
	if (!sessionFile) return "Cannot set Codex fast mode because this command did not include an OpenClaw session file.";
	const parsed = parseCodexFastModeArg(value);
	if (value && parsed == null && value.trim().toLowerCase() !== "status") return "Usage: /codex fast [on|off|status]";
	return await deps.setCodexConversationFastMode({
		sessionFile,
		pluginConfig,
		enabled: parsed
	});
}
async function setConversationPermissions(deps, ctx, pluginConfig, value) {
	const sessionFile = await resolveControlSessionFile(ctx);
	if (!sessionFile) return "Cannot set Codex permissions because this command did not include an OpenClaw session file.";
	const parsed = parseCodexPermissionsModeArg(value);
	if (value && !parsed && value.trim().toLowerCase() !== "status") return "Usage: /codex permissions [default|yolo|status]";
	return await deps.setCodexConversationPermissions({
		sessionFile,
		pluginConfig,
		mode: parsed
	});
}
async function resolveControlSessionFile(ctx) {
	return readCodexConversationBindingData(await ctx.getCurrentConversationBinding())?.sessionFile ?? ctx.sessionFile;
}
async function startThreadAction(deps, ctx, pluginConfig, method, label) {
	const sessionFile = await resolveControlSessionFile(ctx);
	if (!sessionFile) return `Cannot start Codex ${label} because this command did not include an OpenClaw session file.`;
	const binding = await deps.readCodexAppServerBinding(sessionFile);
	if (!binding?.threadId) return `No Codex thread is attached to this OpenClaw session yet.`;
	if (method === CODEX_CONTROL_METHODS.review) await deps.codexControlRequest(pluginConfig, method, {
		threadId: binding.threadId,
		target: { type: "uncommittedChanges" }
	});
	else await deps.codexControlRequest(pluginConfig, method, { threadId: binding.threadId });
	return `Started Codex ${label} for thread ${binding.threadId}.`;
}
function splitArgs(value) {
	return (value ?? "").trim().split(/\s+/).filter(Boolean);
}
function parseBindArgs(args) {
	const parsed = {};
	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === "--help" || arg === "-h") {
			parsed.help = true;
			continue;
		}
		if (arg === "--cwd") {
			parsed.cwd = args[index + 1];
			index += 1;
			continue;
		}
		if (arg === "--model") {
			parsed.model = args[index + 1];
			index += 1;
			continue;
		}
		if (arg === "--provider" || arg === "--model-provider") {
			parsed.provider = args[index + 1];
			index += 1;
			continue;
		}
		if (!arg.startsWith("-") && !parsed.threadId) {
			parsed.threadId = arg;
			continue;
		}
		parsed.help = true;
	}
	parsed.threadId = normalizeOptionalString(parsed.threadId);
	parsed.cwd = normalizeOptionalString(parsed.cwd);
	parsed.model = normalizeOptionalString(parsed.model);
	parsed.provider = normalizeOptionalString(parsed.provider);
	return parsed;
}
function normalizeOptionalString(value) {
	return value?.trim() || void 0;
}
//#endregion
export { handleCodexSubcommand };
