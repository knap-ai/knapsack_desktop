import { n as CLI_RESUME_WATCHDOG_DEFAULTS, t as CLI_FRESH_WATCHDOG_DEFAULTS } from "./cli-watchdog-defaults-1fHqmcbd.js";
import { a as CLAUDE_CLI_MODEL_ALIASES, c as normalizeClaudeBackendConfig, i as CLAUDE_CLI_DEFAULT_MODEL_REF, n as CLAUDE_CLI_CLEAR_ENV, o as CLAUDE_CLI_SESSION_ID_FIELDS, t as CLAUDE_CLI_BACKEND_ID } from "./cli-shared-D-OMKlVw.js";
//#region extensions/anthropic/cli-backend.ts
function buildAnthropicCliBackend() {
	return {
		id: CLAUDE_CLI_BACKEND_ID,
		liveTest: {
			defaultModelRef: CLAUDE_CLI_DEFAULT_MODEL_REF,
			defaultImageProbe: true,
			defaultMcpProbe: true,
			docker: {
				npmPackage: "@anthropic-ai/claude-code",
				binaryName: "claude"
			}
		},
		bundleMcp: true,
		bundleMcpMode: "claude-config-file",
		config: {
			command: "claude",
			args: [
				"-p",
				"--output-format",
				"stream-json",
				"--include-partial-messages",
				"--verbose",
				"--setting-sources",
				"user",
				"--permission-mode",
				"bypassPermissions"
			],
			resumeArgs: [
				"-p",
				"--output-format",
				"stream-json",
				"--include-partial-messages",
				"--verbose",
				"--setting-sources",
				"user",
				"--permission-mode",
				"bypassPermissions",
				"--resume",
				"{sessionId}"
			],
			output: "jsonl",
			input: "stdin",
			modelArg: "--model",
			modelAliases: CLAUDE_CLI_MODEL_ALIASES,
			sessionArg: "--session-id",
			sessionMode: "always",
			sessionIdFields: [...CLAUDE_CLI_SESSION_ID_FIELDS],
			systemPromptArg: "--append-system-prompt",
			systemPromptMode: "append",
			systemPromptWhen: "first",
			clearEnv: [...CLAUDE_CLI_CLEAR_ENV],
			reliability: { watchdog: {
				fresh: { ...CLI_FRESH_WATCHDOG_DEFAULTS },
				resume: { ...CLI_RESUME_WATCHDOG_DEFAULTS }
			} },
			serialize: true
		},
		normalizeConfig: normalizeClaudeBackendConfig
	};
}
//#endregion
export { buildAnthropicCliBackend as t };
