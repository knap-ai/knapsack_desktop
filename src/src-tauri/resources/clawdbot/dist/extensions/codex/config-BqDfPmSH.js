import { createHash } from "node:crypto";
import { z } from "zod";
//#region extensions/codex/src/app-server/config.ts
const codexAppServerTransportSchema = z.enum(["stdio", "websocket"]);
const codexAppServerPolicyModeSchema = z.enum(["yolo", "guardian"]);
const codexAppServerApprovalPolicySchema = z.enum([
	"never",
	"on-request",
	"on-failure",
	"untrusted"
]);
const codexAppServerSandboxSchema = z.enum([
	"read-only",
	"workspace-write",
	"danger-full-access"
]);
const codexAppServerApprovalsReviewerSchema = z.enum([
	"user",
	"auto_review",
	"guardian_subagent"
]);
const codexAppServerServiceTierSchema = z.preprocess((value) => value === null ? null : resolveServiceTier(value), z.enum(["fast", "flex"]).nullable().optional());
const codexPluginConfigSchema = z.object({
	discovery: z.object({
		enabled: z.boolean().optional(),
		timeoutMs: z.number().positive().optional()
	}).strict().optional(),
	appServer: z.object({
		mode: codexAppServerPolicyModeSchema.optional(),
		transport: codexAppServerTransportSchema.optional(),
		command: z.string().optional(),
		args: z.union([z.array(z.string()), z.string()]).optional(),
		url: z.string().optional(),
		authToken: z.string().optional(),
		headers: z.record(z.string(), z.string()).optional(),
		requestTimeoutMs: z.number().positive().optional(),
		approvalPolicy: codexAppServerApprovalPolicySchema.optional(),
		sandbox: codexAppServerSandboxSchema.optional(),
		approvalsReviewer: codexAppServerApprovalsReviewerSchema.optional(),
		serviceTier: codexAppServerServiceTierSchema,
		defaultWorkspaceDir: z.string().optional()
	}).strict().optional()
}).strict();
function readCodexPluginConfig(value) {
	const parsed = codexPluginConfigSchema.safeParse(value);
	return parsed.success ? parsed.data : {};
}
function resolveCodexAppServerRuntimeOptions(params = {}) {
	const env = params.env ?? process.env;
	const config = readCodexPluginConfig(params.pluginConfig).appServer ?? {};
	const transport = resolveTransport(config.transport);
	const command = readNonEmptyString(config.command) ?? env.OPENCLAW_CODEX_APP_SERVER_BIN ?? "codex";
	const args = resolveArgs(config.args, env.OPENCLAW_CODEX_APP_SERVER_ARGS);
	const headers = normalizeHeaders(config.headers);
	const authToken = readNonEmptyString(config.authToken);
	const url = readNonEmptyString(config.url);
	const policyMode = resolvePolicyMode(config.mode) ?? resolvePolicyMode(env.OPENCLAW_CODEX_APP_SERVER_MODE) ?? "yolo";
	const serviceTier = resolveServiceTier(config.serviceTier);
	if (transport === "websocket" && !url) throw new Error("plugins.entries.codex.config.appServer.url is required when appServer.transport is websocket");
	return {
		start: {
			transport,
			command,
			args: args.length > 0 ? args : [
				"app-server",
				"--listen",
				"stdio://"
			],
			...url ? { url } : {},
			...authToken ? { authToken } : {},
			headers
		},
		requestTimeoutMs: normalizePositiveNumber(config.requestTimeoutMs, 6e4),
		approvalPolicy: resolveApprovalPolicy(config.approvalPolicy) ?? resolveApprovalPolicy(env.OPENCLAW_CODEX_APP_SERVER_APPROVAL_POLICY) ?? (policyMode === "guardian" ? "on-request" : "never"),
		sandbox: resolveSandbox(config.sandbox) ?? resolveSandbox(env.OPENCLAW_CODEX_APP_SERVER_SANDBOX) ?? (policyMode === "guardian" ? "workspace-write" : "danger-full-access"),
		approvalsReviewer: resolveApprovalsReviewer(config.approvalsReviewer) ?? (policyMode === "guardian" ? "auto_review" : "user"),
		...serviceTier ? { serviceTier } : {}
	};
}
function codexAppServerStartOptionsKey(options, params = {}) {
	return JSON.stringify({
		transport: options.transport,
		command: options.command,
		args: options.args,
		url: options.url ?? null,
		authToken: hashSecretForKey(options.authToken),
		headers: Object.entries(options.headers).toSorted(([left], [right]) => left.localeCompare(right)),
		env: Object.entries(options.env ?? {}).toSorted(([left], [right]) => left.localeCompare(right)),
		clearEnv: [...options.clearEnv ?? []].toSorted(),
		authProfileId: params.authProfileId ?? null
	});
}
function codexSandboxPolicyForTurn(mode, cwd) {
	if (mode === "danger-full-access") return { type: "dangerFullAccess" };
	if (mode === "read-only") return {
		type: "readOnly",
		access: { type: "fullAccess" },
		networkAccess: false
	};
	return {
		type: "workspaceWrite",
		writableRoots: [cwd],
		readOnlyAccess: { type: "fullAccess" },
		networkAccess: false,
		excludeTmpdirEnvVar: false,
		excludeSlashTmp: false
	};
}
function resolveTransport(value) {
	return value === "websocket" ? "websocket" : "stdio";
}
function resolvePolicyMode(value) {
	return value === "guardian" || value === "yolo" ? value : void 0;
}
function resolveApprovalPolicy(value) {
	return value === "on-request" || value === "on-failure" || value === "untrusted" || value === "never" ? value : void 0;
}
function resolveSandbox(value) {
	return value === "read-only" || value === "workspace-write" || value === "danger-full-access" ? value : void 0;
}
function resolveApprovalsReviewer(value) {
	return value === "auto_review" || value === "guardian_subagent" || value === "user" ? value : void 0;
}
function resolveServiceTier(value) {
	return value === "fast" || value === "flex" ? value : void 0;
}
function normalizePositiveNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function normalizeHeaders(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	return Object.fromEntries(Object.entries(value).map(([key, child]) => [key.trim(), readNonEmptyString(child)]).filter((entry) => Boolean(entry[0] && entry[1])));
}
function resolveArgs(configArgs, envArgs) {
	if (Array.isArray(configArgs)) return configArgs.map((entry) => readNonEmptyString(entry)).filter((entry) => entry !== void 0);
	if (typeof configArgs === "string") return splitShellWords(configArgs);
	return splitShellWords(envArgs ?? "");
}
function readNonEmptyString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function hashSecretForKey(value) {
	if (!value) return null;
	return createHash("sha256").update(value).digest("hex");
}
function splitShellWords(value) {
	const words = [];
	let current = "";
	let quote = null;
	for (const char of value) {
		if (quote) {
			if (char === quote) quote = null;
			else current += char;
			continue;
		}
		if (char === "\"" || char === "'") {
			quote = char;
			continue;
		}
		if (/\s/.test(char)) {
			if (current) {
				words.push(current);
				current = "";
			}
			continue;
		}
		current += char;
	}
	if (current) words.push(current);
	return words;
}
//#endregion
export { resolveCodexAppServerRuntimeOptions as i, codexSandboxPolicyForTurn as n, readCodexPluginConfig as r, codexAppServerStartOptionsKey as t };
