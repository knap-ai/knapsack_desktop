import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { a as CodexAppServerRpcError, c as isJsonObject, i as withTimeout, n as listCodexAppServerModels, o as readCodexAppServerBinding, r as getSharedCodexAppServerClient, s as writeCodexAppServerBinding, t as createCodexAppServerAgentHarness, u as resolveCodexAppServerRuntimeOptions } from "../../harness-CEkXZeCP.js";
import { t as buildCodexProvider } from "../../provider-CJ964HiV.js";
//#region extensions/codex/src/app-server/capabilities.ts
const CODEX_CONTROL_METHODS = {
	account: "account/read",
	compact: "thread/compact/start",
	listMcpServers: "mcpServerStatus/list",
	listSkills: "skills/list",
	listThreads: "thread/list",
	rateLimits: "account/rateLimits/read",
	resumeThread: "thread/resume",
	review: "review/start"
};
function describeControlFailure(error) {
	if (isUnsupportedControlError(error)) return "unsupported by this Codex app-server";
	return error instanceof Error ? error.message : String(error);
}
function isUnsupportedControlError(error) {
	return error instanceof CodexAppServerRpcError && error.code === -32601;
}
//#endregion
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
	return ["Codex models:", ...result.models.map((model) => `- ${model.id}${model.isDefault ? " (default)" : ""}`)].join("\n");
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
		"- /codex compact",
		"- /codex review",
		"- /codex account",
		"- /codex mcp",
		"- /codex skills"
	].join("\n");
}
function summarizeAccount(value) {
	if (!isJsonObject(value)) return "unavailable";
	return readString(value, "email") ?? readString(value, "accountEmail") ?? readString(value, "planType") ?? readString(value, "id") ?? "available";
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
			timeoutMs
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
		safeCodexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.account, {}),
		safeCodexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.rateLimits, {}),
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
	listCodexAppServerModels,
	readCodexStatusProbes,
	readCodexAppServerBinding,
	requestOptions,
	safeCodexControlRequest,
	writeCodexAppServerBinding
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
	if (normalized === "compact") return { text: await startThreadAction(deps, ctx, options.pluginConfig, CODEX_CONTROL_METHODS.compact, "compaction") };
	if (normalized === "review") return { text: await startThreadAction(deps, ctx, options.pluginConfig, CODEX_CONTROL_METHODS.review, "review") };
	if (normalized === "mcp") return { text: formatList(await deps.codexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.listMcpServers, { limit: 100 }), "MCP servers") };
	if (normalized === "skills") return { text: formatList(await deps.codexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.listSkills, {}), "Codex skills") };
	if (normalized === "account") {
		const [account, limits] = await Promise.all([deps.safeCodexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.account, {}), deps.safeCodexControlRequest(options.pluginConfig, CODEX_CONTROL_METHODS.rateLimits, {})]);
		return { text: formatAccount(account, limits) };
	}
	return { text: `Unknown Codex command: ${subcommand}\n\n${buildHelp()}` };
}
async function buildThreads(deps, pluginConfig, filter) {
	return formatThreads(await deps.codexControlRequest(pluginConfig, CODEX_CONTROL_METHODS.listThreads, {
		limit: 10,
		...filter.trim() ? { filter: filter.trim() } : {}
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
async function startThreadAction(deps, ctx, pluginConfig, method, label) {
	if (!ctx.sessionFile) return `Cannot start Codex ${label} because this command did not include an OpenClaw session file.`;
	const binding = await deps.readCodexAppServerBinding(ctx.sessionFile);
	if (!binding?.threadId) return `No Codex thread is attached to this OpenClaw session yet.`;
	await deps.codexControlRequest(pluginConfig, method, { threadId: binding.threadId });
	return `Started Codex ${label} for thread ${binding.threadId}.`;
}
function splitArgs(value) {
	return (value ?? "").trim().split(/\s+/).filter(Boolean);
}
//#endregion
//#region extensions/codex/src/commands.ts
function createCodexCommand(options) {
	return {
		name: "codex",
		description: "Inspect and control the Codex app-server harness",
		acceptsArgs: true,
		requireAuth: true,
		handler: (ctx) => handleCodexCommand(ctx, options)
	};
}
async function handleCodexCommand(ctx, options = {}) {
	return await handleCodexSubcommand(ctx, options);
}
//#endregion
//#region extensions/codex/index.ts
var codex_default = definePluginEntry({
	id: "codex",
	name: "Codex",
	description: "Codex app-server harness and Codex-managed GPT model catalog.",
	register(api) {
		api.registerAgentHarness(createCodexAppServerAgentHarness({ pluginConfig: api.pluginConfig }));
		api.registerProvider(buildCodexProvider({ pluginConfig: api.pluginConfig }));
		api.registerCommand(createCodexCommand({ pluginConfig: api.pluginConfig }));
	}
});
//#endregion
export { codex_default as default };
