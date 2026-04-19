import { _ as shortenHomePath } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { t as hasExplicitOptions } from "./command-options-0jYAGXoL.js";
import { n as safeParseWithSchema } from "./zod-parse-EztZP0fF.js";
import { n as runCommandWithRuntime } from "./cli-utils-PbJDKJWK.js";
import { t as setupWizardCommand } from "./onboard-DN7QwJOD.js";
import fs from "node:fs/promises";
import JSON5 from "json5";
import { z } from "zod";
//#region src/commands/setup.ts
const JsonRecordSchema = z.record(z.string(), z.unknown());
async function createDefaultConfigIO() {
	const { createConfigIO } = await import("./io-DaWBDr7L.js");
	return createConfigIO();
}
async function resolveDefaultAgentWorkspaceDir(deps) {
	const override = deps.defaultAgentWorkspaceDir;
	if (typeof override === "string") return override;
	if (typeof override === "function") return await override();
	const { DEFAULT_AGENT_WORKSPACE_DIR } = await import("./workspace-DPKBmybV.js");
	return DEFAULT_AGENT_WORKSPACE_DIR;
}
async function ensureDefaultAgentWorkspace(params) {
	const { ensureAgentWorkspace } = await import("./workspace-DPKBmybV.js");
	return ensureAgentWorkspace(params);
}
async function writeDefaultConfigFile(config) {
	const { writeConfigFile } = await import("./io-DaWBDr7L.js");
	await writeConfigFile(config);
}
async function formatDefaultConfigPath(configPath) {
	const { formatConfigPath } = await import("./logging-DCe_l_be.js");
	return formatConfigPath(configPath);
}
async function logDefaultConfigUpdated(runtime, opts) {
	const { logConfigUpdated } = await import("./logging-DCe_l_be.js");
	logConfigUpdated(runtime, opts);
}
async function resolveDefaultSessionTranscriptsDir() {
	const { resolveSessionTranscriptsDir } = await import("./sessions-g68NGrOA.js");
	return resolveSessionTranscriptsDir();
}
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fs.readFile(configPath, "utf-8");
		return {
			exists: true,
			parsed: safeParseWithSchema(JsonRecordSchema, JSON5.parse(raw)) ?? {}
		};
	} catch {
		return {
			exists: false,
			parsed: {}
		};
	}
}
async function setupCommand(opts, runtime = defaultRuntime, deps = {}) {
	const desiredWorkspace = typeof opts?.workspace === "string" && opts.workspace.trim() ? opts.workspace.trim() : void 0;
	const configPath = (deps.createConfigIO?.() ?? await createDefaultConfigIO()).configPath;
	const existingRaw = await readConfigFileRaw(configPath);
	const cfg = existingRaw.parsed;
	const defaults = cfg.agents?.defaults ?? {};
	const workspace = desiredWorkspace ?? defaults.workspace ?? await resolveDefaultAgentWorkspaceDir(deps);
	const next = {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				workspace
			}
		},
		gateway: {
			...cfg.gateway,
			mode: cfg.gateway?.mode ?? "local"
		}
	};
	if (!existingRaw.exists || defaults.workspace !== workspace || cfg.gateway?.mode !== next.gateway?.mode) {
		await (deps.writeConfigFile ?? writeDefaultConfigFile)(next);
		if (!existingRaw.exists) {
			const formatConfigPath = deps.formatConfigPath ?? formatDefaultConfigPath;
			runtime.log(`Wrote ${await formatConfigPath(configPath)}`);
		} else {
			const updates = [];
			if (defaults.workspace !== workspace) updates.push("set agents.defaults.workspace");
			if (cfg.gateway?.mode !== next.gateway?.mode) updates.push("set gateway.mode");
			const suffix = updates.length > 0 ? `(${updates.join(", ")})` : void 0;
			await (deps.logConfigUpdated ?? logDefaultConfigUpdated)(runtime, {
				path: configPath,
				suffix
			});
		}
	} else {
		const formatConfigPath = deps.formatConfigPath ?? formatDefaultConfigPath;
		runtime.log(`Config OK: ${await formatConfigPath(configPath)}`);
	}
	const ws = await (deps.ensureAgentWorkspace ?? ensureDefaultAgentWorkspace)({
		dir: workspace,
		ensureBootstrapFiles: !next.agents?.defaults?.skipBootstrap
	});
	runtime.log(`Workspace OK: ${shortenHomePath(ws.dir)}`);
	const sessionsDir = await (deps.resolveSessionTranscriptsDir ?? resolveDefaultSessionTranscriptsDir)();
	await (deps.mkdir ?? fs.mkdir)(sessionsDir, { recursive: true });
	runtime.log(`Sessions OK: ${shortenHomePath(sessionsDir)}`);
}
//#endregion
//#region src/cli/program/register.setup.ts
function registerSetupCommand(program) {
	program.command("setup").description("Initialize the active OpenClaw config and agent workspace").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.openclaw.ai/cli/setup")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)").option("--wizard", "Run interactive onboarding", false).option("--non-interactive", "Run onboarding without prompts", false).option("--mode <mode>", "Onboard mode: local|remote").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasWizardFlags = hasExplicitOptions(command, [
				"wizard",
				"nonInteractive",
				"mode",
				"remoteUrl",
				"remoteToken"
			]);
			if (opts.wizard || hasWizardFlags) {
				await setupWizardCommand({
					workspace: opts.workspace,
					nonInteractive: Boolean(opts.nonInteractive),
					mode: opts.mode,
					remoteUrl: opts.remoteUrl,
					remoteToken: opts.remoteToken
				}, defaultRuntime);
				return;
			}
			await setupCommand({ workspace: opts.workspace }, defaultRuntime);
		});
	});
}
//#endregion
export { registerSetupCommand };
