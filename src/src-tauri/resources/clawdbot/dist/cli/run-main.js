import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "../string-coerce-Bje8XVt9.js";
import { _ as resolveStateDir } from "../paths-B2cMK-wd.js";
import { t as isMainModule } from "../is-main-BEaTwLZn.js";
import { t as resolveCliArgvInvocation } from "../argv-invocation-C0QUafZn.js";
import { a as parseCliContainerArgs, i as maybeRunCliInContainer, n as applyCliProfileEnv, r as parseCliProfileArgs, t as normalizeWindowsArgv } from "../windows-argv-LT6IiqDq.js";
import { i as normalizeEnv } from "../env-BAymvSVL.js";
import { t as assertSupportedRuntime } from "../runtime-guard-CbAnL_Sd.js";
import { n as resolveManifestCommandAliasOwnerInRegistry } from "../manifest-command-aliases-DLn3d24t.js";
import { t as ensureOpenClawCliOnPath } from "../path-env-BMBxRDDc.js";
import { i as shouldSkipPluginCommandRegistration, n as shouldRegisterPrimaryCommandOnly } from "../command-registration-policy-vjojuaYv.js";
import { t as resolveCliCommandPathPolicy } from "../command-path-policy-DRdOarWv.js";
import process$1 from "node:process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
//#region src/cli/run-main-policy.ts
function rewriteUpdateFlagArgv(argv) {
	const index = argv.indexOf("--update");
	if (index === -1) return argv;
	const next = [...argv];
	next.splice(index, 1, "update");
	return next;
}
function shouldEnsureCliPath(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	if (invocation.hasHelpOrVersion || shouldStartCrestodianForBareRoot(argv)) return false;
	return resolveCliCommandPathPolicy(invocation.commandPath).ensureCliPath;
}
function shouldUseRootHelpFastPath(argv, env = process.env) {
	const invocation = resolveCliArgvInvocation(argv);
	return env.OPENCLAW_DISABLE_CLI_STARTUP_HELP_FAST_PATH !== "1" && (invocation.isRootHelpInvocation || invocation.commandPath.length === 1 && invocation.commandPath[0] === "help" && invocation.hasHelpOrVersion);
}
function shouldUseBrowserHelpFastPath(argv, env = process.env) {
	if (env.OPENCLAW_DISABLE_CLI_STARTUP_HELP_FAST_PATH === "1") return false;
	const invocation = resolveCliArgvInvocation(argv);
	return invocation.commandPath.length === 1 && invocation.commandPath[0] === "browser" && invocation.hasHelpOrVersion;
}
function shouldStartCrestodianForBareRoot(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	return invocation.commandPath.length === 0 && !invocation.hasHelpOrVersion;
}
function shouldStartCrestodianForModernOnboard(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	return invocation.commandPath[0] === "onboard" && argv.includes("--modern") && !invocation.hasHelpOrVersion;
}
function resolveMissingPluginCommandMessage$1(pluginId, config, options) {
	const normalizedPluginId = normalizeLowercaseStringOrEmpty(pluginId);
	if (!normalizedPluginId) return null;
	const allow = Array.isArray(config?.plugins?.allow) && config.plugins.allow.length > 0 ? config.plugins.allow.filter((entry) => typeof entry === "string").map((entry) => normalizeOptionalLowercaseString(entry)).filter(Boolean) : [];
	const commandAlias = options?.registry ? resolveManifestCommandAliasOwnerInRegistry({
		command: normalizedPluginId,
		registry: options.registry
	}) : options?.resolveCommandAliasOwner?.({
		command: normalizedPluginId,
		config,
		...options?.registry ? { registry: options.registry } : {}
	});
	const parentPluginId = commandAlias?.pluginId;
	if (parentPluginId) {
		if (allow.length > 0 && !allow.includes(parentPluginId)) return `"${normalizedPluginId}" is not a plugin; it is a command provided by the "${parentPluginId}" plugin. Add "${parentPluginId}" to \`plugins.allow\` instead of "${normalizedPluginId}".`;
		if (config?.plugins?.entries?.[parentPluginId]?.enabled === false) return `The \`openclaw ${normalizedPluginId}\` command is unavailable because \`plugins.entries.${parentPluginId}.enabled=false\`. Re-enable that entry if you want the bundled plugin command surface.`;
		if (commandAlias.kind === "runtime-slash") return `"${normalizedPluginId}" is a runtime slash command (/${normalizedPluginId}), not a CLI command. It is provided by the "${parentPluginId}" plugin. ${commandAlias.cliCommand ? `Use \`openclaw ${commandAlias.cliCommand}\` for related CLI operations, or ` : "Use "}\`/${normalizedPluginId}\` in a chat session.`;
	}
	if (allow.length > 0 && !allow.includes(normalizedPluginId)) {
		if (parentPluginId && allow.includes(parentPluginId)) return null;
		return `The \`openclaw ${normalizedPluginId}\` command is unavailable because \`plugins.allow\` excludes "${normalizedPluginId}". Add "${normalizedPluginId}" to \`plugins.allow\` if you want that bundled plugin CLI surface.`;
	}
	if (config?.plugins?.entries?.[normalizedPluginId]?.enabled === false) return `The \`openclaw ${normalizedPluginId}\` command is unavailable because \`plugins.entries.${normalizedPluginId}.enabled=false\`. Re-enable that entry if you want the bundled plugin CLI surface.`;
	return null;
}
//#endregion
//#region src/cli/run-main.ts
async function closeCliMemoryManagers() {
	const { hasMemoryRuntime } = await import("../memory-state-CcqRgDZU.js");
	if (!hasMemoryRuntime()) return;
	try {
		const { closeActiveMemorySearchManagers } = await import("../memory-runtime-W_tjxzjs.js");
		await closeActiveMemorySearchManagers();
	} catch {}
}
function resolveMissingPluginCommandMessage(pluginId, config, options) {
	return resolveMissingPluginCommandMessage$1(pluginId, config, options?.registry ? { registry: options.registry } : void 0);
}
function shouldLoadCliDotEnv(env = process$1.env) {
	if (existsSync(path.join(process$1.cwd(), ".env"))) return true;
	return existsSync(path.join(resolveStateDir(env), ".env"));
}
function isCommanderParseExit(error) {
	if (!error || typeof error !== "object") return false;
	const candidate = error;
	return typeof candidate.exitCode === "number" && Number.isInteger(candidate.exitCode) && typeof candidate.code === "string" && candidate.code.startsWith("commander.");
}
async function ensureCliEnvProxyDispatcher() {
	try {
		const { hasEnvHttpProxyAgentConfigured } = await import("../proxy-env-BaTLmIgh.js");
		if (!hasEnvHttpProxyAgentConfigured()) return;
		const { ensureGlobalUndiciEnvProxyDispatcher } = await import("../undici-global-dispatcher-D6VLUiK_.js");
		ensureGlobalUndiciEnvProxyDispatcher();
	} catch {}
}
async function runCli(argv = process$1.argv) {
	const originalArgv = normalizeWindowsArgv(argv);
	const parsedContainer = parseCliContainerArgs(originalArgv);
	if (!parsedContainer.ok) throw new Error(parsedContainer.error);
	const parsedProfile = parseCliProfileArgs(parsedContainer.argv);
	if (!parsedProfile.ok) throw new Error(parsedProfile.error);
	if (parsedProfile.profile) applyCliProfileEnv({ profile: parsedProfile.profile });
	if ((parsedContainer.container ?? normalizeOptionalString(process$1.env.OPENCLAW_CONTAINER) ?? null) && parsedProfile.profile) throw new Error("--container cannot be combined with --profile/--dev");
	const containerTarget = maybeRunCliInContainer(originalArgv);
	if (containerTarget.handled) {
		if (containerTarget.exitCode !== 0) process$1.exitCode = containerTarget.exitCode;
		return;
	}
	let normalizedArgv = parsedProfile.argv;
	if (shouldLoadCliDotEnv()) {
		const { loadCliDotEnv } = await import("../dotenv-CA2wPrkh.js");
		loadCliDotEnv({ quiet: true });
	}
	normalizeEnv();
	if (shouldEnsureCliPath(normalizedArgv)) ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	try {
		if (shouldUseRootHelpFastPath(normalizedArgv)) {
			const { outputPrecomputedRootHelpText } = await import("../root-help-metadata-DK0ege7M.js");
			if (!outputPrecomputedRootHelpText()) {
				const { outputRootHelp } = await import("../root-help-CcutKxHf.js");
				await outputRootHelp();
			}
			return;
		}
		if (shouldUseBrowserHelpFastPath(normalizedArgv)) {
			const { outputPrecomputedBrowserHelpText } = await import("../root-help-metadata-DK0ege7M.js");
			if (outputPrecomputedBrowserHelpText()) return;
		}
		const shouldRunBareRootCrestodian = shouldStartCrestodianForBareRoot(normalizedArgv);
		const shouldRunModernOnboardCrestodian = shouldStartCrestodianForModernOnboard(normalizedArgv);
		if (shouldRunBareRootCrestodian || shouldRunModernOnboardCrestodian) await ensureCliEnvProxyDispatcher();
		if (shouldRunBareRootCrestodian) {
			if (!process$1.stdin.isTTY || !process$1.stdout.isTTY) {
				console.error("Crestodian needs an interactive TTY. Use `openclaw crestodian --message \"status\"` for one command.");
				process$1.exitCode = 1;
				return;
			}
			const { runCrestodian } = await import("../crestodian/crestodian.js");
			const { createCliProgress } = await import("../progress-DvLtPNBN.js");
			const progress = createCliProgress({
				label: "Starting Crestodian…",
				indeterminate: true,
				delayMs: 0,
				fallback: "none"
			});
			let progressStopped = false;
			const stopProgress = () => {
				if (progressStopped) return;
				progressStopped = true;
				progress.done();
			};
			try {
				await runCrestodian({ onReady: stopProgress });
			} finally {
				stopProgress();
			}
			return;
		}
		if (shouldRunModernOnboardCrestodian) {
			const { runCrestodian } = await import("../crestodian/crestodian.js");
			const nonInteractive = normalizedArgv.includes("--non-interactive");
			await runCrestodian({
				message: nonInteractive ? "overview" : void 0,
				yes: false,
				json: normalizedArgv.includes("--json"),
				interactive: !nonInteractive
			});
			return;
		}
		const [{ initializeDebugProxyCapture, finalizeDebugProxyCapture }, { maybeWarnAboutDebugProxyCoverage }] = await Promise.all([import("../runtime-Brb6KtJC.js"), import("../coverage-B-Yl5rnX.js")]);
		initializeDebugProxyCapture("cli");
		process$1.once("exit", () => {
			finalizeDebugProxyCapture();
		});
		await ensureCliEnvProxyDispatcher();
		maybeWarnAboutDebugProxyCoverage();
		const { tryRouteCli } = await import("../route-oWPuyRNu.js");
		if (await tryRouteCli(normalizedArgv)) return;
		const { createCliProgress } = await import("../progress-DvLtPNBN.js");
		const startupProgress = createCliProgress({
			label: "Loading OpenClaw CLI…",
			indeterminate: true,
			delayMs: 0,
			fallback: "none"
		});
		let startupProgressStopped = false;
		const stopStartupProgress = () => {
			if (startupProgressStopped) return;
			startupProgressStopped = true;
			startupProgress.done();
		};
		try {
			const { enableConsoleCapture } = await import("../logging-DJVyz0NO.js");
			enableConsoleCapture();
			const [{ buildProgram }, { formatUncaughtError }, { runFatalErrorHooks }, { installUnhandledRejectionHandler, isUncaughtExceptionHandled }, { restoreTerminalState }] = await Promise.all([
				import("../program-B7UMD7mC.js"),
				import("../infra/errors.js"),
				import("../fatal-error-hooks-DxqbkWSf.js"),
				import("../unhandled-rejections-C8zuE08J.js"),
				import("../restore-qsU-mNJM.js")
			]);
			const program = buildProgram();
			installUnhandledRejectionHandler();
			process$1.on("uncaughtException", (error) => {
				if (isUncaughtExceptionHandled(error)) return;
				console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
				for (const message of runFatalErrorHooks({
					reason: "uncaught_exception",
					error
				})) console.error("[openclaw]", message);
				restoreTerminalState("uncaught exception", { resumeStdinIfPaused: false });
				process$1.exit(1);
			});
			const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
			const { primary } = resolveCliArgvInvocation(parseArgv);
			if (primary && shouldRegisterPrimaryCommandOnly(parseArgv)) {
				const { getProgramContext } = await import("../program-context-DQcRYcs8.js");
				const ctx = getProgramContext(program);
				if (ctx) {
					const { registerCoreCliByName } = await import("../command-registry-CZTnsBMh.js");
					await registerCoreCliByName(program, ctx, primary, parseArgv);
				}
				const { registerSubCliByName } = await import("../register.subclis-CvhrxO-c.js");
				await registerSubCliByName(program, primary);
			}
			if (!shouldSkipPluginCommandRegistration({
				argv: parseArgv,
				primary,
				hasBuiltinPrimary: primary !== null && program.commands.some((command) => command.name() === primary || command.aliases().includes(primary))
			})) {
				const { registerPluginCliCommandsFromValidatedConfig } = await import("../cli-BRQ448dj.js");
				const config = await registerPluginCliCommandsFromValidatedConfig(program, void 0, void 0, {
					mode: "lazy",
					primary
				});
				if (config) {
					if (primary && !program.commands.some((command) => command.name() === primary || command.aliases().includes(primary))) {
						const { resolveManifestCommandAliasOwner } = await import("../manifest-command-aliases.runtime-vTvDCj0G.js");
						const missingPluginCommandMessage = resolveMissingPluginCommandMessage$1(primary, config, { resolveCommandAliasOwner: resolveManifestCommandAliasOwner });
						if (missingPluginCommandMessage) throw new Error(missingPluginCommandMessage);
					}
				}
			}
			stopStartupProgress();
			try {
				await program.parseAsync(parseArgv);
			} catch (error) {
				if (!isCommanderParseExit(error)) throw error;
				process$1.exitCode = error.exitCode;
			}
		} finally {
			stopStartupProgress();
		}
	} finally {
		await closeCliMemoryManagers();
	}
}
function isCliMainModule() {
	return isMainModule({ currentFile: fileURLToPath(import.meta.url) });
}
//#endregion
export { isCliMainModule, resolveMissingPluginCommandMessage, rewriteUpdateFlagArgv, runCli, shouldEnsureCliPath, shouldStartCrestodianForBareRoot, shouldStartCrestodianForModernOnboard, shouldUseBrowserHelpFastPath, shouldUseRootHelpFastPath };
