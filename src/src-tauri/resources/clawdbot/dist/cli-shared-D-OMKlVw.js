import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
//#region extensions/anthropic/cli-shared.ts
const CLAUDE_CLI_BACKEND_ID = "claude-cli";
const CLAUDE_CLI_DEFAULT_MODEL_REF = `${CLAUDE_CLI_BACKEND_ID}/claude-opus-4-7`;
const CLAUDE_CLI_DEFAULT_ALLOWLIST_REFS = [
	CLAUDE_CLI_DEFAULT_MODEL_REF,
	`${CLAUDE_CLI_BACKEND_ID}/claude-sonnet-4-6`,
	`${CLAUDE_CLI_BACKEND_ID}/claude-opus-4-6`,
	`${CLAUDE_CLI_BACKEND_ID}/claude-opus-4-5`,
	`${CLAUDE_CLI_BACKEND_ID}/claude-sonnet-4-5`,
	`${CLAUDE_CLI_BACKEND_ID}/claude-haiku-4-5`
];
const CLAUDE_CLI_MODEL_ALIASES = {
	opus: "opus",
	"opus-4.7": "opus",
	"opus-4.6": "opus",
	"opus-4.5": "opus",
	"opus-4": "opus",
	"claude-opus-4-7": "opus",
	"claude-opus-4-6": "opus",
	"claude-opus-4-5": "opus",
	"claude-opus-4": "opus",
	sonnet: "sonnet",
	"sonnet-4.6": "sonnet",
	"sonnet-4.5": "sonnet",
	"sonnet-4.1": "sonnet",
	"sonnet-4.0": "sonnet",
	"claude-sonnet-4-6": "sonnet",
	"claude-sonnet-4-5": "sonnet",
	"claude-sonnet-4-1": "sonnet",
	"claude-sonnet-4-0": "sonnet",
	haiku: "haiku",
	"haiku-3.5": "haiku",
	"claude-haiku-3-5": "haiku"
};
const CLAUDE_CLI_SESSION_ID_FIELDS = [
	"session_id",
	"sessionId",
	"conversation_id",
	"conversationId"
];
const CLAUDE_CLI_CLEAR_ENV = [
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_API_KEY_OLD",
	"ANTHROPIC_API_TOKEN",
	"ANTHROPIC_AUTH_TOKEN",
	"ANTHROPIC_BASE_URL",
	"ANTHROPIC_CUSTOM_HEADERS",
	"ANTHROPIC_OAUTH_TOKEN",
	"ANTHROPIC_UNIX_SOCKET",
	"CLAUDE_CONFIG_DIR",
	"CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR",
	"CLAUDE_CODE_ENTRYPOINT",
	"CLAUDE_CODE_OAUTH_REFRESH_TOKEN",
	"CLAUDE_CODE_OAUTH_SCOPES",
	"CLAUDE_CODE_OAUTH_TOKEN",
	"CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR",
	"CLAUDE_CODE_PLUGIN_CACHE_DIR",
	"CLAUDE_CODE_PLUGIN_SEED_DIR",
	"CLAUDE_CODE_REMOTE",
	"CLAUDE_CODE_USE_COWORK_PLUGINS",
	"CLAUDE_CODE_USE_BEDROCK",
	"CLAUDE_CODE_USE_FOUNDRY",
	"CLAUDE_CODE_USE_VERTEX",
	"OTEL_EXPORTER_OTLP_ENDPOINT",
	"OTEL_EXPORTER_OTLP_HEADERS",
	"OTEL_EXPORTER_OTLP_LOGS_ENDPOINT",
	"OTEL_EXPORTER_OTLP_LOGS_HEADERS",
	"OTEL_EXPORTER_OTLP_LOGS_PROTOCOL",
	"OTEL_EXPORTER_OTLP_METRICS_ENDPOINT",
	"OTEL_EXPORTER_OTLP_METRICS_HEADERS",
	"OTEL_EXPORTER_OTLP_METRICS_PROTOCOL",
	"OTEL_EXPORTER_OTLP_PROTOCOL",
	"OTEL_EXPORTER_OTLP_TRACES_ENDPOINT",
	"OTEL_EXPORTER_OTLP_TRACES_HEADERS",
	"OTEL_EXPORTER_OTLP_TRACES_PROTOCOL",
	"OTEL_LOGS_EXPORTER",
	"OTEL_METRICS_EXPORTER",
	"OTEL_SDK_DISABLED",
	"OTEL_TRACES_EXPORTER"
];
const CLAUDE_LEGACY_SKIP_PERMISSIONS_ARG = "--dangerously-skip-permissions";
const CLAUDE_PERMISSION_MODE_ARG = "--permission-mode";
const CLAUDE_BYPASS_PERMISSIONS_MODE = "bypassPermissions";
const CLAUDE_SETTING_SOURCES_ARG = "--setting-sources";
const CLAUDE_SAFE_SETTING_SOURCES = "user";
function isClaudeCliProvider(providerId) {
	return normalizeOptionalLowercaseString(providerId) === CLAUDE_CLI_BACKEND_ID;
}
function normalizeClaudePermissionArgs(args) {
	if (!args) return args;
	const normalized = [];
	let hasPermissionMode = false;
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === CLAUDE_LEGACY_SKIP_PERMISSIONS_ARG) continue;
		if (arg === CLAUDE_PERMISSION_MODE_ARG) {
			const maybeValue = args[i + 1];
			if (typeof maybeValue === "string" && maybeValue.trim().length > 0 && !maybeValue.startsWith("-")) {
				hasPermissionMode = true;
				normalized.push(arg);
				normalized.push(maybeValue);
				i += 1;
			}
			continue;
		}
		if (arg.startsWith(`${CLAUDE_PERMISSION_MODE_ARG}=`)) hasPermissionMode = true;
		normalized.push(arg);
	}
	if (!hasPermissionMode) normalized.push(CLAUDE_PERMISSION_MODE_ARG, CLAUDE_BYPASS_PERMISSIONS_MODE);
	return normalized;
}
function normalizeClaudeSettingSourcesArgs(args) {
	if (!args) return args;
	const normalized = [];
	let hasSettingSources = false;
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === CLAUDE_SETTING_SOURCES_ARG) {
			const maybeValue = args[i + 1];
			if (typeof maybeValue === "string" && maybeValue.trim().length > 0 && !maybeValue.startsWith("-")) {
				hasSettingSources = true;
				normalized.push(arg, CLAUDE_SAFE_SETTING_SOURCES);
				i += 1;
			}
			continue;
		}
		if (arg.startsWith(`${CLAUDE_SETTING_SOURCES_ARG}=`)) {
			hasSettingSources = true;
			normalized.push(`${CLAUDE_SETTING_SOURCES_ARG}=${CLAUDE_SAFE_SETTING_SOURCES}`);
			continue;
		}
		normalized.push(arg);
	}
	if (!hasSettingSources) normalized.push(CLAUDE_SETTING_SOURCES_ARG, CLAUDE_SAFE_SETTING_SOURCES);
	return normalized;
}
function normalizeClaudeBackendConfig(config) {
	return {
		...config,
		args: normalizeClaudePermissionArgs(normalizeClaudeSettingSourcesArgs(config.args)),
		resumeArgs: normalizeClaudePermissionArgs(normalizeClaudeSettingSourcesArgs(config.resumeArgs))
	};
}
//#endregion
export { CLAUDE_CLI_MODEL_ALIASES as a, normalizeClaudeBackendConfig as c, CLAUDE_CLI_DEFAULT_MODEL_REF as i, normalizeClaudePermissionArgs as l, CLAUDE_CLI_CLEAR_ENV as n, CLAUDE_CLI_SESSION_ID_FIELDS as o, CLAUDE_CLI_DEFAULT_ALLOWLIST_REFS as r, isClaudeCliProvider as s, CLAUDE_CLI_BACKEND_ID as t, normalizeClaudeSettingSourcesArgs as u };
