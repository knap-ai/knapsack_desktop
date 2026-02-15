import { $ as resolveStateDir, M as theme, h as defaultRuntime } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import { n as replaceCliName, r as resolveCliName, t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { h as pathExists } from "./utils-q1rHOG-N.js";
import { t as runCommandWithTimeout } from "./exec-B52LZOrO.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-BKsZvO6K.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./pi-model-discovery-EhM2JAQo.js";
import { l as writeConfigFile, o as readConfigFileSnapshot } from "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import "./plugins-DsHRVW6o.js";
import "./logging-B5vJSgy6.js";
import "./accounts-CXiTuiOz.js";
import "./send-DQh-tTYV.js";
import "./send-C34nHKc5.js";
import { nt as trimLogTail } from "./reply-DWlAlSNj.js";
import "./media-EWF5qDpT.js";
import "./message-channel-D-iPIX3C.js";
import "./render-DyRjoIgA.js";
import "./tables-DuWEJJJ_.js";
import "./image-ops-BuOO2fiP.js";
import "./fetch-CiM7YqYo.js";
import "./tool-images-Do-zTkGT.js";
import "./common-2Kd-SlSi.js";
import "./server-context-DSQVDg5o.js";
import "./chrome-Biwk6Xdw.js";
import "./auth-DaQXd14b.js";
import "./control-auth-B-AeOmM1.js";
import "./ports-C5vKQsaq.js";
import "./control-service-BWKREGJh.js";
import "./deliver-CPbyDZgw.js";
import "./pi-embedded-helpers-Bgii3Law.js";
import "./sessions-DGtM0qOW.js";
import "./runner-BY_Cu0GM.js";
import "./image-qihRjcmd.js";
import "./models-config-BUvHYVxN.js";
import "./sandbox-yPHyBnUy.js";
import "./skills-C1pxUa-I.js";
import "./routes-BpW33PMu.js";
import "./store-C2n2K571.js";
import "./paths-D9QhlJYC.js";
import "./redact-Bt-krp_b.js";
import "./tool-display-Dq-NBueh.js";
import "./context-DPQWp4WP.js";
import "./dispatcher-CLCH2DxP.js";
import "./send-C0RXgj4W.js";
import "./memory-cli-C--Zm-5F.js";
import "./manager-D5ku6Y-s.js";
import "./sqlite-hOA2wjjf.js";
import "./retry-CO00OgwL.js";
import "./commands-registry-B3DBZLId.js";
import "./client-DV6vI7ic.js";
import "./call-FZUZ5EU4.js";
import { r as formatDurationPrecise } from "./format-duration-ChmN5gMF.js";
import "./channel-activity-CuiCbmeL.js";
import "./send-h1nuAso5.js";
import { t as formatDocsLink } from "./links-C_tOT2wV.js";
import "./progress-C4IJwa0T.js";
import "./pairing-store-C9d3jZbc.js";
import "./pi-tools.policy-CTtzXtkF.js";
import "./send-CnpwMynh.js";
import "./onboard-helpers-HBGG6t5A.js";
import { n as stylePromptMessage, t as stylePromptHint } from "./prompt-style-f1NZuGno.js";
import "./pairing-labels-CxEJEpbD.js";
import "./session-cost-usage-DOubaz12.js";
import "./nodes-screen-ChgT1pbh.js";
import "./channel-selection-CHRRzvpU.js";
import "./delivery-queue-BFRO68fM.js";
import "./plugin-auto-enable-Mb_Vhtp_.js";
import "./note-68V10H-1.js";
import "./archive-unczA8_5.js";
import "./skill-scanner-DFG_N86N.js";
import "./installs-D1z7Sba0.js";
import "./channels-status-issues-BO3fKgRs.js";
import "./register.subclis-_zfREDBy.js";
import { r as installCompletion } from "./completion-cli-BSCl5sV2.js";
import "./daemon-runtime-CPrv-rEf.js";
import { r as parseSemver } from "./runtime-guard-HatUnkUH.js";
import "./service-q_Baxtp9.js";
import "./systemd-BmDw_juR.js";
import "./shared-B3kg6sBC.js";
import { r as runDaemonRestart } from "./daemon-cli-BS_4J_PM.js";
import "./diagnostics-D5dLtThb.js";
import "./service-audit-b749O_L6.js";
import { t as renderTable } from "./table-DvO2pSzv.js";
import "./health-ifSF2YWo.js";
import "./health-format-Bm9KnFIU.js";
import { _ as resolveEffectiveUpdateChannel, a as checkUpdateStatus, c as resolveNpmChannelTag, f as channelToNpmTag, g as normalizeUpdateChannel, i as resolveUpdateAvailability, l as DEFAULT_GIT_CHANNEL, n as formatUpdateOneLiner, o as compareSemverStrings, p as formatUpdateChannelLabel, s as fetchNpmTagVersion, t as formatUpdateAvailableHint, u as DEFAULT_PACKAGE_CHANNEL } from "./status.update-uo3ZMBFb.js";
import "./logging-By_aaJZy.js";
import "./skills-status-C0KraF77.js";
import { a as globalInstallArgs, i as detectGlobalInstallManagerForRoot, l as ensureCompletionCacheExists, n as cleanupGlobalRenameDirs, o as resolveGlobalPackageRoot, r as detectGlobalInstallManagerByPresence, s as checkShellCompletionStatus, t as runGatewayUpdate } from "./update-runner-sgHYPKhC.js";
import "./auth-health-UVQVyv5B.js";
import { n as updateNpmInstalledPlugins, t as syncPluginsForUpdateChannel } from "./update-DZdC7cgL.js";
import { t as formatHelpExamples } from "./help-format-Bc2TR_uq.js";
import "./systemd-linger-5cVJInPr.js";
import { t as doctorCommand } from "./doctor-COfsFLam.js";
import "./doctor-config-flow-CshtmTM3.js";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { confirm, isCancel, select, spinner } from "@clack/prompts";

//#region src/cli/update-cli/shared.ts
const OPENCLAW_REPO_URL = "https://github.com/openclaw/openclaw.git";
const MAX_LOG_CHARS = 8e3;
const DEFAULT_PACKAGE_NAME = "openclaw";
const CORE_PACKAGE_NAMES = new Set([DEFAULT_PACKAGE_NAME]);
function normalizeTag(value) {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith("openclaw@")) return trimmed.slice(9);
	if (trimmed.startsWith(`${DEFAULT_PACKAGE_NAME}@`)) return trimmed.slice(`${DEFAULT_PACKAGE_NAME}@`.length);
	return trimmed;
}
function normalizeVersionTag(tag) {
	const trimmed = tag.trim();
	if (!trimmed) return null;
	const cleaned = trimmed.startsWith("v") ? trimmed.slice(1) : trimmed;
	return parseSemver(cleaned) ? cleaned : null;
}
async function readPackageVersion(root) {
	try {
		const raw = await fs.readFile(path.join(root, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.version === "string" ? parsed.version : null;
	} catch {
		return null;
	}
}
async function resolveTargetVersion(tag, timeoutMs) {
	const direct = normalizeVersionTag(tag);
	if (direct) return direct;
	return (await fetchNpmTagVersion({
		tag,
		timeoutMs
	})).version ?? null;
}
async function isGitCheckout(root) {
	try {
		await fs.stat(path.join(root, ".git"));
		return true;
	} catch {
		return false;
	}
}
async function readPackageName(root) {
	try {
		const raw = await fs.readFile(path.join(root, "package.json"), "utf-8");
		const name = JSON.parse(raw)?.name?.trim();
		return name ? name : null;
	} catch {
		return null;
	}
}
async function isCorePackage(root) {
	const name = await readPackageName(root);
	return Boolean(name && CORE_PACKAGE_NAMES.has(name));
}
async function isEmptyDir(targetPath) {
	try {
		return (await fs.readdir(targetPath)).length === 0;
	} catch {
		return false;
	}
}
function resolveGitInstallDir() {
	const override = process.env.OPENCLAW_GIT_DIR?.trim();
	if (override) return path.resolve(override);
	return resolveDefaultGitDir();
}
function resolveDefaultGitDir() {
	return resolveStateDir(process.env, os.homedir);
}
function resolveNodeRunner() {
	const base = path.basename(process.execPath).toLowerCase();
	if (base === "node" || base === "node.exe") return process.execPath;
	return "node";
}
async function resolveUpdateRoot() {
	return await resolveOpenClawPackageRoot({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	}) ?? process.cwd();
}
async function runUpdateStep(params) {
	const command = params.argv.join(" ");
	params.progress?.onStepStart?.({
		name: params.name,
		command,
		index: 0,
		total: 0
	});
	const started = Date.now();
	const res = await runCommandWithTimeout(params.argv, {
		cwd: params.cwd,
		timeoutMs: params.timeoutMs
	});
	const durationMs = Date.now() - started;
	const stderrTail = trimLogTail(res.stderr, MAX_LOG_CHARS);
	params.progress?.onStepComplete?.({
		name: params.name,
		command,
		index: 0,
		total: 0,
		durationMs,
		exitCode: res.code,
		stderrTail
	});
	return {
		name: params.name,
		command,
		cwd: params.cwd ?? process.cwd(),
		durationMs,
		exitCode: res.code,
		stdoutTail: trimLogTail(res.stdout, MAX_LOG_CHARS),
		stderrTail
	};
}
async function ensureGitCheckout(params) {
	if (!await pathExists(params.dir)) return await runUpdateStep({
		name: "git clone",
		argv: [
			"git",
			"clone",
			OPENCLAW_REPO_URL,
			params.dir
		],
		timeoutMs: params.timeoutMs,
		progress: params.progress
	});
	if (!await isGitCheckout(params.dir)) {
		if (!await isEmptyDir(params.dir)) throw new Error(`OPENCLAW_GIT_DIR points at a non-git directory: ${params.dir}. Set OPENCLAW_GIT_DIR to an empty folder or an openclaw checkout.`);
		return await runUpdateStep({
			name: "git clone",
			argv: [
				"git",
				"clone",
				OPENCLAW_REPO_URL,
				params.dir
			],
			cwd: params.dir,
			timeoutMs: params.timeoutMs,
			progress: params.progress
		});
	}
	if (!await isCorePackage(params.dir)) throw new Error(`OPENCLAW_GIT_DIR does not look like a core checkout: ${params.dir}.`);
	return null;
}
async function resolveGlobalManager(params) {
	const runCommand = async (argv, options) => {
		const res = await runCommandWithTimeout(argv, options);
		return {
			stdout: res.stdout,
			stderr: res.stderr,
			code: res.code
		};
	};
	if (params.installKind === "package") {
		const detected = await detectGlobalInstallManagerForRoot(runCommand, params.root, params.timeoutMs);
		if (detected) return detected;
	}
	return await detectGlobalInstallManagerByPresence(runCommand, params.timeoutMs) ?? "npm";
}
async function tryWriteCompletionCache(root, jsonMode) {
	const binPath = path.join(root, "openclaw.mjs");
	if (!await pathExists(binPath)) return;
	const result = spawnSync(resolveNodeRunner(), [
		binPath,
		"completion",
		"--write-state"
	], {
		cwd: root,
		env: process.env,
		encoding: "utf-8"
	});
	if (result.error) {
		if (!jsonMode) defaultRuntime.log(theme.warn(`Completion cache update failed: ${String(result.error)}`));
		return;
	}
	if (result.status !== 0 && !jsonMode) {
		const stderr = (result.stderr ?? "").toString().trim();
		const detail = stderr ? ` (${stderr})` : "";
		defaultRuntime.log(theme.warn(`Completion cache update failed${detail}.`));
	}
}

//#endregion
//#region src/cli/update-cli/status.ts
function formatGitStatusLine(params) {
	const shortSha = params.sha ? params.sha.slice(0, 8) : null;
	const branch = params.branch && params.branch !== "HEAD" ? params.branch : null;
	const tag = params.tag;
	return [
		branch ?? (tag ? "detached" : "git"),
		tag ? `tag ${tag}` : null,
		shortSha ? `@ ${shortSha}` : null
	].filter(Boolean).join(" · ");
}
async function updateStatusCommand(opts) {
	const timeoutMs = opts.timeout ? Number.parseInt(opts.timeout, 10) * 1e3 : void 0;
	if (timeoutMs !== void 0 && (Number.isNaN(timeoutMs) || timeoutMs <= 0)) {
		defaultRuntime.error("--timeout must be a positive integer (seconds)");
		defaultRuntime.exit(1);
		return;
	}
	const root = await resolveUpdateRoot();
	const configSnapshot = await readConfigFileSnapshot();
	const configChannel = configSnapshot.valid ? normalizeUpdateChannel(configSnapshot.config.update?.channel) : null;
	const update = await checkUpdateStatus({
		root,
		timeoutMs: timeoutMs ?? 3500,
		fetchGit: true,
		includeRegistry: true
	});
	const channelInfo = resolveEffectiveUpdateChannel({
		configChannel,
		installKind: update.installKind,
		git: update.git ? {
			tag: update.git.tag,
			branch: update.git.branch
		} : void 0
	});
	const channelLabel = formatUpdateChannelLabel({
		channel: channelInfo.channel,
		source: channelInfo.source,
		gitTag: update.git?.tag ?? null,
		gitBranch: update.git?.branch ?? null
	});
	const gitLabel = update.installKind === "git" ? formatGitStatusLine({
		branch: update.git?.branch ?? null,
		tag: update.git?.tag ?? null,
		sha: update.git?.sha ?? null
	}) : null;
	const updateAvailability = resolveUpdateAvailability(update);
	const updateLine = formatUpdateOneLiner(update).replace(/^Update:\s*/i, "");
	if (opts.json) {
		defaultRuntime.log(JSON.stringify({
			update,
			channel: {
				value: channelInfo.channel,
				source: channelInfo.source,
				label: channelLabel,
				config: configChannel
			},
			availability: updateAvailability
		}, null, 2));
		return;
	}
	const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
	const rows = [
		{
			Item: "Install",
			Value: update.installKind === "git" ? `git (${update.root ?? "unknown"})` : update.installKind === "package" ? update.packageManager : "unknown"
		},
		{
			Item: "Channel",
			Value: channelLabel
		},
		...gitLabel ? [{
			Item: "Git",
			Value: gitLabel
		}] : [],
		{
			Item: "Update",
			Value: updateAvailability.available ? theme.warn(`available · ${updateLine}`) : updateLine
		}
	];
	defaultRuntime.log(theme.heading("OpenClaw update status"));
	defaultRuntime.log("");
	defaultRuntime.log(renderTable({
		width: tableWidth,
		columns: [{
			key: "Item",
			header: "Item",
			minWidth: 10
		}, {
			key: "Value",
			header: "Value",
			flex: true,
			minWidth: 24
		}],
		rows
	}).trimEnd());
	defaultRuntime.log("");
	const updateHint = formatUpdateAvailableHint(update);
	if (updateHint) defaultRuntime.log(theme.warn(updateHint));
}

//#endregion
//#region src/cli/update-cli/progress.ts
const STEP_LABELS = {
	"clean check": "Working directory is clean",
	"upstream check": "Upstream branch exists",
	"git fetch": "Fetching latest changes",
	"git rebase": "Rebasing onto target commit",
	"git rev-parse @{upstream}": "Resolving upstream commit",
	"git rev-list": "Enumerating candidate commits",
	"git clone": "Cloning git checkout",
	"preflight worktree": "Preparing preflight worktree",
	"preflight cleanup": "Cleaning preflight worktree",
	"deps install": "Installing dependencies",
	build: "Building",
	"ui:build": "Building UI assets",
	"ui:build (post-doctor repair)": "Restoring missing UI assets",
	"ui assets verify": "Validating UI assets",
	"openclaw doctor entry": "Checking doctor entrypoint",
	"openclaw doctor": "Running doctor checks",
	"git rev-parse HEAD (after)": "Verifying update",
	"global update": "Updating via package manager",
	"global install": "Installing global package"
};
function getStepLabel(step) {
	return STEP_LABELS[step.name] ?? step.name;
}
function createUpdateProgress(enabled) {
	if (!enabled) return {
		progress: {},
		stop: () => {}
	};
	let currentSpinner = null;
	return {
		progress: {
			onStepStart: (step) => {
				currentSpinner = spinner();
				currentSpinner.start(theme.accent(getStepLabel(step)));
			},
			onStepComplete: (step) => {
				if (!currentSpinner) return;
				const label = getStepLabel(step);
				const duration = theme.muted(`(${formatDurationPrecise(step.durationMs)})`);
				const icon = step.exitCode === 0 ? theme.success("✓") : theme.error("✗");
				currentSpinner.stop(`${icon} ${label} ${duration}`);
				currentSpinner = null;
				if (step.exitCode !== 0 && step.stderrTail) {
					const lines = step.stderrTail.split("\n").slice(-10);
					for (const line of lines) if (line.trim()) defaultRuntime.log(`    ${theme.error(line)}`);
				}
			}
		},
		stop: () => {
			if (currentSpinner) {
				currentSpinner.stop();
				currentSpinner = null;
			}
		}
	};
}
function formatStepStatus(exitCode) {
	if (exitCode === 0) return theme.success("✓");
	if (exitCode === null) return theme.warn("?");
	return theme.error("✗");
}
function printResult(result, opts) {
	if (opts.json) {
		defaultRuntime.log(JSON.stringify(result, null, 2));
		return;
	}
	const statusColor = result.status === "ok" ? theme.success : result.status === "skipped" ? theme.warn : theme.error;
	defaultRuntime.log("");
	defaultRuntime.log(`${theme.heading("Update Result:")} ${statusColor(result.status.toUpperCase())}`);
	if (result.root) defaultRuntime.log(`  Root: ${theme.muted(result.root)}`);
	if (result.reason) defaultRuntime.log(`  Reason: ${theme.muted(result.reason)}`);
	if (result.before?.version || result.before?.sha) {
		const before = result.before.version ?? result.before.sha?.slice(0, 8) ?? "";
		defaultRuntime.log(`  Before: ${theme.muted(before)}`);
	}
	if (result.after?.version || result.after?.sha) {
		const after = result.after.version ?? result.after.sha?.slice(0, 8) ?? "";
		defaultRuntime.log(`  After: ${theme.muted(after)}`);
	}
	if (!opts.hideSteps && result.steps.length > 0) {
		defaultRuntime.log("");
		defaultRuntime.log(theme.heading("Steps:"));
		for (const step of result.steps) {
			const status = formatStepStatus(step.exitCode);
			const duration = theme.muted(`(${formatDurationPrecise(step.durationMs)})`);
			defaultRuntime.log(`  ${status} ${step.name} ${duration}`);
			if (step.exitCode !== 0 && step.stderrTail) {
				const lines = step.stderrTail.split("\n").slice(0, 5);
				for (const line of lines) if (line.trim()) defaultRuntime.log(`      ${theme.error(line)}`);
			}
		}
	}
	defaultRuntime.log("");
	defaultRuntime.log(`Total time: ${theme.muted(formatDurationPrecise(result.durationMs))}`);
}

//#endregion
//#region src/cli/update-cli/suppress-deprecations.ts
/**
* Suppress Node.js deprecation warnings.
*
* On Node.js v23+ `process.noDeprecation` may be a read-only property
* (defined via a getter on the prototype with no setter), so the
* assignment can throw. We fall back to the environment variable which
* achieves the same effect.
*/
function suppressDeprecations() {
	try {
		process.noDeprecation = true;
	} catch {}
	process.env.NODE_NO_WARNINGS = "1";
}

//#endregion
//#region src/cli/update-cli/update-command.ts
const CLI_NAME = resolveCliName();
const UPDATE_QUIPS = [
	"Leveled up! New skills unlocked. You're welcome.",
	"Fresh code, same lobster. Miss me?",
	"Back and better. Did you even notice I was gone?",
	"Update complete. I learned some new tricks while I was out.",
	"Upgraded! Now with 23% more sass.",
	"I've evolved. Try to keep up.",
	"New version, who dis? Oh right, still me but shinier.",
	"Patched, polished, and ready to pinch. Let's go.",
	"The lobster has molted. Harder shell, sharper claws.",
	"Update done! Check the changelog or just trust me, it's good.",
	"Reborn from the boiling waters of npm. Stronger now.",
	"I went away and came back smarter. You should try it sometime.",
	"Update complete. The bugs feared me, so they left.",
	"New version installed. Old version sends its regards.",
	"Firmware fresh. Brain wrinkles: increased.",
	"I've seen things you wouldn't believe. Anyway, I'm updated.",
	"Back online. The changelog is long but our friendship is longer.",
	"Upgraded! Peter fixed stuff. Blame him if it breaks.",
	"Molting complete. Please don't look at my soft shell phase.",
	"Version bump! Same chaos energy, fewer crashes (probably)."
];
function pickUpdateQuip() {
	return UPDATE_QUIPS[Math.floor(Math.random() * UPDATE_QUIPS.length)] ?? "Update complete.";
}
async function tryInstallShellCompletion(opts) {
	if (opts.jsonMode || !process.stdin.isTTY) return;
	const status = await checkShellCompletionStatus(CLI_NAME);
	if (status.usesSlowPattern) {
		defaultRuntime.log(theme.muted("Upgrading shell completion to cached version..."));
		if (await ensureCompletionCacheExists(CLI_NAME)) await installCompletion(status.shell, true, CLI_NAME);
		return;
	}
	if (status.profileInstalled && !status.cacheExists) {
		defaultRuntime.log(theme.muted("Regenerating shell completion cache..."));
		await ensureCompletionCacheExists(CLI_NAME);
		return;
	}
	if (!status.profileInstalled) {
		defaultRuntime.log("");
		defaultRuntime.log(theme.heading("Shell completion"));
		const shouldInstall = await confirm({
			message: stylePromptMessage(`Enable ${status.shell} shell completion for ${CLI_NAME}?`),
			initialValue: true
		});
		if (isCancel(shouldInstall) || !shouldInstall) {
			if (!opts.skipPrompt) defaultRuntime.log(theme.muted(`Skipped. Run \`${replaceCliName(formatCliCommand("openclaw completion --install"), CLI_NAME)}\` later to enable.`));
			return;
		}
		if (!await ensureCompletionCacheExists(CLI_NAME)) {
			defaultRuntime.log(theme.warn("Failed to generate completion cache."));
			return;
		}
		await installCompletion(status.shell, opts.skipPrompt, CLI_NAME);
	}
}
async function runPackageInstallUpdate(params) {
	const manager = await resolveGlobalManager({
		root: params.root,
		installKind: params.installKind,
		timeoutMs: params.timeoutMs
	});
	const runCommand = async (argv, options) => {
		const res = await runCommandWithTimeout(argv, options);
		return {
			stdout: res.stdout,
			stderr: res.stderr,
			code: res.code
		};
	};
	const pkgRoot = await resolveGlobalPackageRoot(manager, runCommand, params.timeoutMs);
	const packageName = (pkgRoot ? await readPackageName(pkgRoot) : await readPackageName(params.root)) ?? DEFAULT_PACKAGE_NAME;
	const beforeVersion = pkgRoot ? await readPackageVersion(pkgRoot) : null;
	if (pkgRoot) await cleanupGlobalRenameDirs({
		globalRoot: path.dirname(pkgRoot),
		packageName
	});
	const steps = [await runUpdateStep({
		name: "global update",
		argv: globalInstallArgs(manager, `${packageName}@${params.tag}`),
		timeoutMs: params.timeoutMs,
		progress: params.progress
	})];
	let afterVersion = beforeVersion;
	if (pkgRoot) {
		afterVersion = await readPackageVersion(pkgRoot);
		const entryPath = path.join(pkgRoot, "dist", "entry.js");
		if (await pathExists(entryPath)) {
			const doctorStep = await runUpdateStep({
				name: `${CLI_NAME} doctor`,
				argv: [
					resolveNodeRunner(),
					entryPath,
					"doctor",
					"--non-interactive"
				],
				timeoutMs: params.timeoutMs,
				progress: params.progress
			});
			steps.push(doctorStep);
		}
	}
	const failedStep = steps.find((step) => step.exitCode !== 0);
	return {
		status: failedStep ? "error" : "ok",
		mode: manager,
		root: pkgRoot ?? params.root,
		reason: failedStep ? failedStep.name : void 0,
		before: { version: beforeVersion },
		after: { version: afterVersion },
		steps,
		durationMs: Date.now() - params.startedAt
	};
}
async function runGitUpdate(params) {
	const updateRoot = params.switchToGit ? resolveGitInstallDir() : params.root;
	const effectiveTimeout = params.timeoutMs ?? 20 * 6e4;
	const cloneStep = params.switchToGit ? await ensureGitCheckout({
		dir: updateRoot,
		timeoutMs: effectiveTimeout,
		progress: params.progress
	}) : null;
	if (cloneStep && cloneStep.exitCode !== 0) {
		const result = {
			status: "error",
			mode: "git",
			root: updateRoot,
			reason: cloneStep.name,
			steps: [cloneStep],
			durationMs: Date.now() - params.startedAt
		};
		params.stop();
		printResult(result, {
			...params.opts,
			hideSteps: params.showProgress
		});
		defaultRuntime.exit(1);
		return result;
	}
	const updateResult = await runGatewayUpdate({
		cwd: updateRoot,
		argv1: params.switchToGit ? void 0 : process.argv[1],
		timeoutMs: params.timeoutMs,
		progress: params.progress,
		channel: params.channel,
		tag: params.tag
	});
	const steps = [...cloneStep ? [cloneStep] : [], ...updateResult.steps];
	if (params.switchToGit && updateResult.status === "ok") {
		const installStep = await runUpdateStep({
			name: "global install",
			argv: globalInstallArgs(await resolveGlobalManager({
				root: params.root,
				installKind: params.installKind,
				timeoutMs: effectiveTimeout
			}), updateRoot),
			cwd: updateRoot,
			timeoutMs: effectiveTimeout,
			progress: params.progress
		});
		steps.push(installStep);
		const failedStep = installStep.exitCode !== 0 ? installStep : null;
		return {
			...updateResult,
			status: updateResult.status === "ok" && !failedStep ? "ok" : "error",
			steps,
			durationMs: Date.now() - params.startedAt
		};
	}
	return {
		...updateResult,
		steps,
		durationMs: Date.now() - params.startedAt
	};
}
async function updatePluginsAfterCoreUpdate(params) {
	if (!params.configSnapshot.valid) {
		if (!params.opts.json) defaultRuntime.log(theme.warn("Skipping plugin updates: config is invalid."));
		return;
	}
	const pluginLogger = params.opts.json ? {} : {
		info: (msg) => defaultRuntime.log(msg),
		warn: (msg) => defaultRuntime.log(theme.warn(msg)),
		error: (msg) => defaultRuntime.log(theme.error(msg))
	};
	if (!params.opts.json) {
		defaultRuntime.log("");
		defaultRuntime.log(theme.heading("Updating plugins..."));
	}
	const syncResult = await syncPluginsForUpdateChannel({
		config: params.configSnapshot.config,
		channel: params.channel,
		workspaceDir: params.root,
		logger: pluginLogger
	});
	let pluginConfig = syncResult.config;
	const npmResult = await updateNpmInstalledPlugins({
		config: pluginConfig,
		skipIds: new Set(syncResult.summary.switchedToNpm),
		logger: pluginLogger
	});
	pluginConfig = npmResult.config;
	if (syncResult.changed || npmResult.changed) await writeConfigFile(pluginConfig);
	if (params.opts.json) return;
	const summarizeList = (list) => {
		if (list.length <= 6) return list.join(", ");
		return `${list.slice(0, 6).join(", ")} +${list.length - 6} more`;
	};
	if (syncResult.summary.switchedToBundled.length > 0) defaultRuntime.log(theme.muted(`Switched to bundled plugins: ${summarizeList(syncResult.summary.switchedToBundled)}.`));
	if (syncResult.summary.switchedToNpm.length > 0) defaultRuntime.log(theme.muted(`Restored npm plugins: ${summarizeList(syncResult.summary.switchedToNpm)}.`));
	for (const warning of syncResult.summary.warnings) defaultRuntime.log(theme.warn(warning));
	for (const error of syncResult.summary.errors) defaultRuntime.log(theme.error(error));
	const updated = npmResult.outcomes.filter((entry) => entry.status === "updated").length;
	const unchanged = npmResult.outcomes.filter((entry) => entry.status === "unchanged").length;
	const failed = npmResult.outcomes.filter((entry) => entry.status === "error").length;
	const skipped = npmResult.outcomes.filter((entry) => entry.status === "skipped").length;
	if (npmResult.outcomes.length === 0) defaultRuntime.log(theme.muted("No plugin updates needed."));
	else {
		const parts = [`${updated} updated`, `${unchanged} unchanged`];
		if (failed > 0) parts.push(`${failed} failed`);
		if (skipped > 0) parts.push(`${skipped} skipped`);
		defaultRuntime.log(theme.muted(`npm plugins: ${parts.join(", ")}.`));
	}
	for (const outcome of npmResult.outcomes) {
		if (outcome.status !== "error") continue;
		defaultRuntime.log(theme.error(outcome.message));
	}
}
async function maybeRestartService(params) {
	if (params.shouldRestart) {
		if (!params.opts.json) {
			defaultRuntime.log("");
			defaultRuntime.log(theme.heading("Restarting service..."));
		}
		try {
			const restarted = await runDaemonRestart();
			if (!params.opts.json && restarted) {
				defaultRuntime.log(theme.success("Daemon restarted successfully."));
				defaultRuntime.log("");
				process.env.OPENCLAW_UPDATE_IN_PROGRESS = "1";
				try {
					await doctorCommand(defaultRuntime, { nonInteractive: !(Boolean(process.stdin.isTTY) && !params.opts.json && params.opts.yes !== true) });
				} catch (err) {
					defaultRuntime.log(theme.warn(`Doctor failed: ${String(err)}`));
				} finally {
					delete process.env.OPENCLAW_UPDATE_IN_PROGRESS;
				}
			}
		} catch (err) {
			if (!params.opts.json) {
				defaultRuntime.log(theme.warn(`Daemon restart failed: ${String(err)}`));
				defaultRuntime.log(theme.muted(`You may need to restart the service manually: ${replaceCliName(formatCliCommand("openclaw gateway restart"), CLI_NAME)}`));
			}
		}
		return;
	}
	if (!params.opts.json) {
		defaultRuntime.log("");
		if (params.result.mode === "npm" || params.result.mode === "pnpm") defaultRuntime.log(theme.muted(`Tip: Run \`${replaceCliName(formatCliCommand("openclaw doctor"), CLI_NAME)}\`, then \`${replaceCliName(formatCliCommand("openclaw gateway restart"), CLI_NAME)}\` to apply updates to a running gateway.`));
		else defaultRuntime.log(theme.muted(`Tip: Run \`${replaceCliName(formatCliCommand("openclaw gateway restart"), CLI_NAME)}\` to apply updates to a running gateway.`));
	}
}
async function updateCommand(opts) {
	suppressDeprecations();
	const timeoutMs = opts.timeout ? Number.parseInt(opts.timeout, 10) * 1e3 : void 0;
	const shouldRestart = opts.restart !== false;
	if (timeoutMs !== void 0 && (Number.isNaN(timeoutMs) || timeoutMs <= 0)) {
		defaultRuntime.error("--timeout must be a positive integer (seconds)");
		defaultRuntime.exit(1);
		return;
	}
	const root = await resolveUpdateRoot();
	const updateStatus = await checkUpdateStatus({
		root,
		timeoutMs: timeoutMs ?? 3500,
		fetchGit: false,
		includeRegistry: false
	});
	const configSnapshot = await readConfigFileSnapshot();
	const storedChannel = configSnapshot.valid ? normalizeUpdateChannel(configSnapshot.config.update?.channel) : null;
	const requestedChannel = normalizeUpdateChannel(opts.channel);
	if (opts.channel && !requestedChannel) {
		defaultRuntime.error(`--channel must be "stable", "beta", or "dev" (got "${opts.channel}")`);
		defaultRuntime.exit(1);
		return;
	}
	if (opts.channel && !configSnapshot.valid) {
		const issues = configSnapshot.issues.map((issue) => `- ${issue.path}: ${issue.message}`);
		defaultRuntime.error(["Config is invalid; cannot set update channel.", ...issues].join("\n"));
		defaultRuntime.exit(1);
		return;
	}
	const installKind = updateStatus.installKind;
	const switchToGit = requestedChannel === "dev" && installKind !== "git";
	const switchToPackage = requestedChannel !== null && requestedChannel !== "dev" && installKind === "git";
	const updateInstallKind = switchToGit ? "git" : switchToPackage ? "package" : installKind;
	const channel = requestedChannel ?? storedChannel ?? (updateInstallKind === "git" ? DEFAULT_GIT_CHANNEL : DEFAULT_PACKAGE_CHANNEL);
	const explicitTag = normalizeTag(opts.tag);
	let tag = explicitTag ?? channelToNpmTag(channel);
	if (updateInstallKind !== "git") {
		const currentVersion = switchToPackage ? null : await readPackageVersion(root);
		let fallbackToLatest = false;
		const targetVersion = explicitTag ? await resolveTargetVersion(tag, timeoutMs) : await resolveNpmChannelTag({
			channel,
			timeoutMs
		}).then((resolved) => {
			tag = resolved.tag;
			fallbackToLatest = channel === "beta" && resolved.tag === "latest";
			return resolved.version;
		});
		const cmp = currentVersion && targetVersion ? compareSemverStrings(currentVersion, targetVersion) : null;
		if (!fallbackToLatest && currentVersion != null && (targetVersion == null || cmp != null && cmp > 0) && !opts.yes) {
			if (!process.stdin.isTTY || opts.json) {
				defaultRuntime.error(["Downgrade confirmation required.", "Downgrading can break configuration. Re-run in a TTY to confirm."].join("\n"));
				defaultRuntime.exit(1);
				return;
			}
			const ok = await confirm({
				message: stylePromptMessage(`Downgrading from ${currentVersion} to ${targetVersion ?? `${tag} (unknown)`} can break configuration. Continue?`),
				initialValue: false
			});
			if (isCancel(ok) || !ok) {
				if (!opts.json) defaultRuntime.log(theme.muted("Update cancelled."));
				defaultRuntime.exit(0);
				return;
			}
		}
	} else if (opts.tag && !opts.json) defaultRuntime.log(theme.muted("Note: --tag applies to npm installs only; git updates ignore it."));
	if (requestedChannel && configSnapshot.valid) {
		await writeConfigFile({
			...configSnapshot.config,
			update: {
				...configSnapshot.config.update,
				channel: requestedChannel
			}
		});
		if (!opts.json) defaultRuntime.log(theme.muted(`Update channel set to ${requestedChannel}.`));
	}
	const showProgress = !opts.json && process.stdout.isTTY;
	if (!opts.json) {
		defaultRuntime.log(theme.heading("Updating OpenClaw..."));
		defaultRuntime.log("");
	}
	const { progress, stop } = createUpdateProgress(showProgress);
	const startedAt = Date.now();
	const result = switchToPackage ? await runPackageInstallUpdate({
		root,
		installKind,
		tag,
		timeoutMs: timeoutMs ?? 20 * 6e4,
		startedAt,
		progress
	}) : await runGitUpdate({
		root,
		switchToGit,
		installKind,
		timeoutMs,
		startedAt,
		progress,
		channel,
		tag,
		showProgress,
		opts,
		stop
	});
	stop();
	printResult(result, {
		...opts,
		hideSteps: showProgress
	});
	if (result.status === "error") {
		defaultRuntime.exit(1);
		return;
	}
	if (result.status === "skipped") {
		if (result.reason === "dirty") defaultRuntime.log(theme.warn("Skipped: working directory has uncommitted changes. Commit or stash them first."));
		if (result.reason === "not-git-install") {
			defaultRuntime.log(theme.warn(`Skipped: this OpenClaw install isn't a git checkout, and the package manager couldn't be detected. Update via your package manager, then run \`${replaceCliName(formatCliCommand("openclaw doctor"), CLI_NAME)}\` and \`${replaceCliName(formatCliCommand("openclaw gateway restart"), CLI_NAME)}\`.`));
			defaultRuntime.log(theme.muted(`Examples: \`${replaceCliName("npm i -g openclaw@latest", CLI_NAME)}\` or \`${replaceCliName("pnpm add -g openclaw@latest", CLI_NAME)}\``));
		}
		defaultRuntime.exit(0);
		return;
	}
	await updatePluginsAfterCoreUpdate({
		root,
		channel,
		configSnapshot,
		opts
	});
	await tryWriteCompletionCache(root, Boolean(opts.json));
	await tryInstallShellCompletion({
		jsonMode: Boolean(opts.json),
		skipPrompt: Boolean(opts.yes)
	});
	await maybeRestartService({
		shouldRestart,
		result,
		opts
	});
	if (!opts.json) defaultRuntime.log(theme.muted(pickUpdateQuip()));
}

//#endregion
//#region src/cli/update-cli/wizard.ts
const selectStyled = (params) => select({
	...params,
	message: stylePromptMessage(params.message),
	options: params.options.map((opt) => opt.hint === void 0 ? opt : {
		...opt,
		hint: stylePromptHint(opt.hint)
	})
});
async function updateWizardCommand(opts = {}) {
	if (!process.stdin.isTTY) {
		defaultRuntime.error("Update wizard requires a TTY. Use `openclaw update --channel <stable|beta|dev>` instead.");
		defaultRuntime.exit(1);
		return;
	}
	const timeoutMs = opts.timeout ? Number.parseInt(opts.timeout, 10) * 1e3 : void 0;
	if (timeoutMs !== void 0 && (Number.isNaN(timeoutMs) || timeoutMs <= 0)) {
		defaultRuntime.error("--timeout must be a positive integer (seconds)");
		defaultRuntime.exit(1);
		return;
	}
	const root = await resolveUpdateRoot();
	const [updateStatus, configSnapshot] = await Promise.all([checkUpdateStatus({
		root,
		timeoutMs: timeoutMs ?? 3500,
		fetchGit: false,
		includeRegistry: false
	}), readConfigFileSnapshot()]);
	const channelInfo = resolveEffectiveUpdateChannel({
		configChannel: configSnapshot.valid ? normalizeUpdateChannel(configSnapshot.config.update?.channel) : null,
		installKind: updateStatus.installKind,
		git: updateStatus.git ? {
			tag: updateStatus.git.tag,
			branch: updateStatus.git.branch
		} : void 0
	});
	const channelLabel = formatUpdateChannelLabel({
		channel: channelInfo.channel,
		source: channelInfo.source,
		gitTag: updateStatus.git?.tag ?? null,
		gitBranch: updateStatus.git?.branch ?? null
	});
	const pickedChannel = await selectStyled({
		message: "Update channel",
		options: [
			{
				value: "keep",
				label: `Keep current (${channelInfo.channel})`,
				hint: channelLabel
			},
			{
				value: "stable",
				label: "Stable",
				hint: "Tagged releases (npm latest)"
			},
			{
				value: "beta",
				label: "Beta",
				hint: "Prereleases (npm beta)"
			},
			{
				value: "dev",
				label: "Dev",
				hint: "Git main"
			}
		],
		initialValue: "keep"
	});
	if (isCancel(pickedChannel)) {
		defaultRuntime.log(theme.muted("Update cancelled."));
		defaultRuntime.exit(0);
		return;
	}
	const requestedChannel = pickedChannel === "keep" ? null : pickedChannel;
	if (requestedChannel === "dev" && updateStatus.installKind !== "git") {
		const gitDir = resolveGitInstallDir();
		if (!await isGitCheckout(gitDir)) {
			if (await pathExists(gitDir)) {
				if (!await isEmptyDir(gitDir)) {
					defaultRuntime.error(`OPENCLAW_GIT_DIR points at a non-git directory: ${gitDir}. Set OPENCLAW_GIT_DIR to an empty folder or an openclaw checkout.`);
					defaultRuntime.exit(1);
					return;
				}
			}
			const ok = await confirm({
				message: stylePromptMessage(`Create a git checkout at ${gitDir}? (override via OPENCLAW_GIT_DIR)`),
				initialValue: true
			});
			if (isCancel(ok) || !ok) {
				defaultRuntime.log(theme.muted("Update cancelled."));
				defaultRuntime.exit(0);
				return;
			}
		}
	}
	const restart = await confirm({
		message: stylePromptMessage("Restart the gateway service after update?"),
		initialValue: true
	});
	if (isCancel(restart)) {
		defaultRuntime.log(theme.muted("Update cancelled."));
		defaultRuntime.exit(0);
		return;
	}
	try {
		await updateCommand({
			channel: requestedChannel ?? void 0,
			restart: Boolean(restart),
			timeout: opts.timeout
		});
	} catch (err) {
		defaultRuntime.error(String(err));
		defaultRuntime.exit(1);
	}
}

//#endregion
//#region src/cli/update-cli.ts
function registerUpdateCli(program) {
	const update = program.command("update").description("Update OpenClaw to the latest version").option("--json", "Output result as JSON", false).option("--no-restart", "Skip restarting the gateway service after a successful update").option("--channel <stable|beta|dev>", "Persist update channel (git + npm)").option("--tag <dist-tag|version>", "Override npm dist-tag or version for this update").option("--timeout <seconds>", "Timeout for each update step in seconds (default: 1200)").option("--yes", "Skip confirmation prompts (non-interactive)", false).addHelpText("after", () => {
		const fmtExamples = [
			["openclaw update", "Update a source checkout (git)"],
			["openclaw update --channel beta", "Switch to beta channel (git + npm)"],
			["openclaw update --channel dev", "Switch to dev channel (git + npm)"],
			["openclaw update --tag beta", "One-off update to a dist-tag or version"],
			["openclaw update --no-restart", "Update without restarting the service"],
			["openclaw update --json", "Output result as JSON"],
			["openclaw update --yes", "Non-interactive (accept downgrade prompts)"],
			["openclaw update wizard", "Interactive update wizard"],
			["openclaw --update", "Shorthand for openclaw update"]
		].map(([cmd, desc]) => `  ${theme.command(cmd)} ${theme.muted(`# ${desc}`)}`).join("\n");
		return `
${theme.heading("What this does:")}
  - Git checkouts: fetches, rebases, installs deps, builds, and runs doctor
  - npm installs: updates via detected package manager

${theme.heading("Switch channels:")}
  - Use --channel stable|beta|dev to persist the update channel in config
  - Run openclaw update status to see the active channel and source
  - Use --tag <dist-tag|version> for a one-off npm update without persisting

${theme.heading("Non-interactive:")}
  - Use --yes to accept downgrade prompts
  - Combine with --channel/--tag/--restart/--json/--timeout as needed

${theme.heading("Examples:")}
${fmtExamples}

${theme.heading("Notes:")}
  - Switch channels with --channel stable|beta|dev
  - For global installs: auto-updates via detected package manager when possible (see docs/install/updating.md)
  - Downgrades require confirmation (can break configuration)
  - Skips update if the working directory has uncommitted changes

${theme.muted("Docs:")} ${formatDocsLink("/cli/update", "docs.openclaw.ai/cli/update")}`;
	}).action(async (opts) => {
		try {
			await updateCommand({
				json: Boolean(opts.json),
				restart: Boolean(opts.restart),
				channel: opts.channel,
				tag: opts.tag,
				timeout: opts.timeout,
				yes: Boolean(opts.yes)
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
	update.command("wizard").description("Interactive update wizard").option("--timeout <seconds>", "Timeout for each update step in seconds (default: 1200)").addHelpText("after", `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/update", "docs.openclaw.ai/cli/update")}\n`).action(async (opts) => {
		try {
			await updateWizardCommand({ timeout: opts.timeout });
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
	update.command("status").description("Show update channel and version status").option("--json", "Output result as JSON", false).option("--timeout <seconds>", "Timeout for update checks in seconds (default: 3)").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw update status", "Show channel + version status."],
		["openclaw update status --json", "JSON output."],
		["openclaw update status --timeout 10", "Custom timeout."]
	])}\n\n${theme.heading("Notes:")}\n${theme.muted("- Shows current update channel (stable/beta/dev) and source")}\n${theme.muted("- Includes git tag/branch/SHA for source checkouts")}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/update", "docs.openclaw.ai/cli/update")}`).action(async (opts) => {
		try {
			await updateStatusCommand({
				json: Boolean(opts.json),
				timeout: opts.timeout
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerUpdateCli };