import { g as restoreTerminalState, h as defaultRuntime, q as resolveGatewayPort, z as DEFAULT_GATEWAY_PORT } from "./entry.js";
import { v as ensureAuthProfileStore } from "./auth-profiles-DnpV8DWM.js";
import { r as resolveCliName, t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { C as sleep, h as pathExists, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { c as resolveDefaultAgentId, p as DEFAULT_BOOTSTRAP_FILENAME, s as resolveAgentWorkspaceDir } from "./agent-scope-Bu62UIQZ.js";
import { l as writeConfigFile, o as readConfigFileSnapshot } from "./config-BJWIHf6x.js";
import { n as listChannelPlugins } from "./plugins-DsHRVW6o.js";
import { p as findTailscaleBinary } from "./auth-DaQXd14b.js";
import { r as resolveLsofCommandSync } from "./ports-C5vKQsaq.js";
import { _ as summarizeExistingConfig, a as ensureWorkspaceAndSessions, c as handleReset, d as openUrl, f as printWizardHeader, h as resolveControlUiLinks, i as detectBrowserOpenSupport, m as randomToken, n as applyWizardMetadata, o as formatControlUiSshHint, p as probeGatewayReachable, t as DEFAULT_WORKSPACE, u as normalizeGatewayTokenInput, v as validateGatewayPasswordInput, y as waitForGatewayReachable } from "./onboard-helpers-HBGG6t5A.js";
import { t as WizardCancelledError } from "./prompts-DxnxCHKt.js";
import { n as setupChannels } from "./onboard-channels-orChigJn.js";
import { r as installCompletion } from "./completion-cli-BSCl5sV2.js";
import { a as gatewayInstallErrorHint, i as buildGatewayInstallPlan, n as GATEWAY_DAEMON_RUNTIME_OPTIONS, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-CPrv-rEf.js";
import { t as resolveGatewayService } from "./service-q_Baxtp9.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-BmDw_juR.js";
import { d as applyPrimaryModel, f as promptDefaultModel, r as promptRemoteGatewayConfig, s as promptCustomApiConfig, t as setupSkills } from "./onboard-skills-BwrWiu8R.js";
import { r as healthCommand } from "./health-ifSF2YWo.js";
import { n as ensureControlUiAssetsBuilt, t as formatHealthCheckFailure } from "./health-format-Bm9KnFIU.js";
import { l as promptAuthChoiceGrouped, n as warnIfModelConfigLooksOff, r as applyAuthChoice, t as resolvePreferredProviderForAuthChoice } from "./auth-choice-D4mJmR9L.js";
import { n as logConfigUpdated } from "./logging-By_aaJZy.js";
import { t as buildWorkspaceHookStatus } from "./hooks-status-DcIvepJB.js";
import { t as runTui } from "./tui-DnMcbuoR.js";
import { l as ensureCompletionCacheExists, s as checkShellCompletionStatus } from "./update-runner-sgHYPKhC.js";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

//#region src/commands/onboard-hooks.ts
async function setupInternalHooks(cfg, runtime, prompter) {
	await prompter.note([
		"Hooks let you automate actions when agent commands are issued.",
		"Example: Save session context to memory when you issue /new.",
		"",
		"Learn more: https://docs.openclaw.ai/hooks"
	].join("\n"), "Hooks");
	const eligibleHooks = buildWorkspaceHookStatus(resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)), { config: cfg }).hooks.filter((h) => h.eligible);
	if (eligibleHooks.length === 0) {
		await prompter.note("No eligible hooks found. You can configure hooks later in your config.", "No Hooks Available");
		return cfg;
	}
	const selected = (await prompter.multiselect({
		message: "Enable hooks?",
		options: [{
			value: "__skip__",
			label: "Skip for now"
		}, ...eligibleHooks.map((hook) => ({
			value: hook.name,
			label: `${hook.emoji ?? "🔗"} ${hook.name}`,
			hint: hook.description
		}))]
	})).filter((name) => name !== "__skip__");
	if (selected.length === 0) return cfg;
	const entries = { ...cfg.hooks?.internal?.entries };
	for (const name of selected) entries[name] = { enabled: true };
	const next = {
		...cfg,
		hooks: {
			...cfg.hooks,
			internal: {
				enabled: true,
				entries
			}
		}
	};
	await prompter.note([
		`Enabled ${selected.length} hook${selected.length > 1 ? "s" : ""}: ${selected.join(", ")}`,
		"",
		"You can manage hooks later with:",
		`  ${formatCliCommand("openclaw hooks list")}`,
		`  ${formatCliCommand("openclaw hooks enable <name>")}`,
		`  ${formatCliCommand("openclaw hooks disable <name>")}`
	].join("\n"), "Hooks Configured");
	return next;
}

//#endregion
//#region src/wizard/onboarding.completion.ts
async function resolveProfileHint(shell) {
	const home = process.env.HOME || os.homedir();
	if (shell === "zsh") return "~/.zshrc";
	if (shell === "bash") return await pathExists(path.join(home, ".bashrc")) ? "~/.bashrc" : "~/.bash_profile";
	if (shell === "fish") return "~/.config/fish/config.fish";
	return "$PROFILE";
}
function formatReloadHint(shell, profileHint) {
	if (shell === "powershell") return "Restart your shell (or reload your PowerShell profile).";
	return `Restart your shell or run: source ${profileHint}`;
}
async function setupOnboardingShellCompletion(params) {
	const deps = {
		resolveCliName,
		checkShellCompletionStatus,
		ensureCompletionCacheExists,
		installCompletion,
		...params.deps
	};
	const cliName = deps.resolveCliName();
	const completionStatus = await deps.checkShellCompletionStatus(cliName);
	if (completionStatus.usesSlowPattern) {
		if (await deps.ensureCompletionCacheExists(cliName)) await deps.installCompletion(completionStatus.shell, true, cliName);
		return;
	}
	if (completionStatus.profileInstalled && !completionStatus.cacheExists) {
		await deps.ensureCompletionCacheExists(cliName);
		return;
	}
	if (!completionStatus.profileInstalled) {
		if (!(params.flow === "quickstart" ? true : await params.prompter.confirm({
			message: `Enable ${completionStatus.shell} shell completion for ${cliName}?`,
			initialValue: true
		}))) return;
		if (!await deps.ensureCompletionCacheExists(cliName)) {
			await params.prompter.note(`Failed to generate completion cache. Run \`${cliName} completion --install\` later.`, "Shell completion");
			return;
		}
		await deps.installCompletion(completionStatus.shell, true, cliName);
		const profileHint = await resolveProfileHint(completionStatus.shell);
		await params.prompter.note(`Shell completion installed. ${formatReloadHint(completionStatus.shell, profileHint)}`, "Shell completion");
	}
}

//#endregion
//#region src/wizard/onboarding.finalize.ts
async function finalizeOnboardingWizard(options) {
	const { flow, opts, baseConfig, nextConfig, settings, prompter, runtime } = options;
	const withWizardProgress = async (label, options, work) => {
		const progress = prompter.progress(label);
		try {
			return await work(progress);
		} finally {
			progress.stop(options.doneMessage);
		}
	};
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) await prompter.note("Systemd user services are unavailable. Skipping lingering checks and service install.", "Systemd");
	if (process.platform === "linux" && systemdAvailable) {
		const { ensureSystemdUserLingerInteractive } = await import("./systemd-linger-5cVJInPr.js").then((n) => n.r);
		await ensureSystemdUserLingerInteractive({
			runtime,
			prompter: {
				confirm: prompter.confirm,
				note: prompter.note
			},
			reason: "Linux installs use a systemd user service by default. Without lingering, systemd stops the user session on logout/idle and kills the Gateway.",
			requireConfirm: false
		});
	}
	const explicitInstallDaemon = typeof opts.installDaemon === "boolean" ? opts.installDaemon : void 0;
	let installDaemon;
	if (explicitInstallDaemon !== void 0) installDaemon = explicitInstallDaemon;
	else if (process.platform === "linux" && !systemdAvailable) installDaemon = false;
	else if (flow === "quickstart") installDaemon = true;
	else installDaemon = await prompter.confirm({
		message: "Install Gateway service (recommended)",
		initialValue: true
	});
	if (process.platform === "linux" && !systemdAvailable && installDaemon) {
		await prompter.note("Systemd user services are unavailable; skipping service install. Use your container supervisor or `docker compose up -d`.", "Gateway service");
		installDaemon = false;
	}
	if (installDaemon) {
		const daemonRuntime = flow === "quickstart" ? DEFAULT_GATEWAY_DAEMON_RUNTIME : await prompter.select({
			message: "Gateway service runtime",
			options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
			initialValue: opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME
		});
		if (flow === "quickstart") await prompter.note("QuickStart uses Node for the Gateway service (stable + supported).", "Gateway service runtime");
		const service = resolveGatewayService();
		const loaded = await service.isLoaded({ env: process.env });
		if (loaded) {
			const action = await prompter.select({
				message: "Gateway service already installed",
				options: [
					{
						value: "restart",
						label: "Restart"
					},
					{
						value: "reinstall",
						label: "Reinstall"
					},
					{
						value: "skip",
						label: "Skip"
					}
				]
			});
			if (action === "restart") await withWizardProgress("Gateway service", { doneMessage: "Gateway service restarted." }, async (progress) => {
				progress.update("Restarting Gateway service…");
				await service.restart({
					env: process.env,
					stdout: process.stdout
				});
			});
			else if (action === "reinstall") await withWizardProgress("Gateway service", { doneMessage: "Gateway service uninstalled." }, async (progress) => {
				progress.update("Uninstalling Gateway service…");
				await service.uninstall({
					env: process.env,
					stdout: process.stdout
				});
			});
		}
		if (!loaded || loaded && !await service.isLoaded({ env: process.env })) {
			const progress = prompter.progress("Gateway service");
			let installError = null;
			try {
				progress.update("Preparing Gateway service…");
				const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
					env: process.env,
					port: settings.port,
					token: settings.gatewayToken,
					runtime: daemonRuntime,
					warn: (message, title) => prompter.note(message, title),
					config: nextConfig
				});
				progress.update("Installing Gateway service…");
				await service.install({
					env: process.env,
					stdout: process.stdout,
					programArguments,
					workingDirectory,
					environment
				});
			} catch (err) {
				installError = err instanceof Error ? err.message : String(err);
			} finally {
				progress.stop(installError ? "Gateway service install failed." : "Gateway service installed.");
			}
			if (installError) {
				await prompter.note(`Gateway service install failed: ${installError}`, "Gateway");
				await prompter.note(gatewayInstallErrorHint(), "Gateway");
			}
		}
	}
	if (!opts.skipHealth) {
		await waitForGatewayReachable({
			url: resolveControlUiLinks({
				bind: nextConfig.gateway?.bind ?? "loopback",
				port: settings.port,
				customBindHost: nextConfig.gateway?.customBindHost,
				basePath: void 0
			}).wsUrl,
			token: settings.gatewayToken,
			deadlineMs: 15e3
		});
		try {
			await healthCommand({
				json: false,
				timeoutMs: 1e4
			}, runtime);
		} catch (err) {
			runtime.error(formatHealthCheckFailure(err));
			await prompter.note([
				"Docs:",
				"https://docs.openclaw.ai/gateway/health",
				"https://docs.openclaw.ai/gateway/troubleshooting"
			].join("\n"), "Health check help");
		}
	}
	const controlUiEnabled = nextConfig.gateway?.controlUi?.enabled ?? baseConfig.gateway?.controlUi?.enabled ?? true;
	if (!opts.skipUi && controlUiEnabled) {
		const controlUiAssets = await ensureControlUiAssetsBuilt(runtime);
		if (!controlUiAssets.ok && controlUiAssets.message) runtime.error(controlUiAssets.message);
	}
	await prompter.note([
		"Add nodes for extra features:",
		"- macOS app (system + notifications)",
		"- iOS app (camera/canvas)",
		"- Android app (camera/canvas)"
	].join("\n"), "Optional apps");
	const controlUiBasePath = nextConfig.gateway?.controlUi?.basePath ?? baseConfig.gateway?.controlUi?.basePath;
	const links = resolveControlUiLinks({
		bind: settings.bind,
		port: settings.port,
		customBindHost: settings.customBindHost,
		basePath: controlUiBasePath
	});
	const authedUrl = settings.authMode === "token" && settings.gatewayToken ? `${links.httpUrl}#token=${encodeURIComponent(settings.gatewayToken)}` : links.httpUrl;
	const gatewayProbe = await probeGatewayReachable({
		url: links.wsUrl,
		token: settings.authMode === "token" ? settings.gatewayToken : void 0,
		password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : ""
	});
	const gatewayStatusLine = gatewayProbe.ok ? "Gateway: reachable" : `Gateway: not detected${gatewayProbe.detail ? ` (${gatewayProbe.detail})` : ""}`;
	const bootstrapPath = path.join(resolveUserPath(options.workspaceDir), DEFAULT_BOOTSTRAP_FILENAME);
	const hasBootstrap = await fs.access(bootstrapPath).then(() => true).catch(() => false);
	await prompter.note([
		`Web UI: ${links.httpUrl}`,
		settings.authMode === "token" && settings.gatewayToken ? `Web UI (with token): ${authedUrl}` : void 0,
		`Gateway WS: ${links.wsUrl}`,
		gatewayStatusLine,
		"Docs: https://docs.openclaw.ai/web/control-ui"
	].filter(Boolean).join("\n"), "Control UI");
	let controlUiOpened = false;
	let controlUiOpenHint;
	let hatchChoice = null;
	let launchedTui = false;
	if (!opts.skipUi && gatewayProbe.ok) {
		if (hasBootstrap) await prompter.note([
			"This is the defining action that makes your agent you.",
			"Please take your time.",
			"The more you tell it, the better the experience will be.",
			"We will send: \"Wake up, my friend!\""
		].join("\n"), "Start TUI (best option!)");
		await prompter.note([
			"Gateway token: shared auth for the Gateway + Control UI.",
			"Stored in: ~/.openclaw/openclaw.json (gateway.auth.token) or OPENCLAW_GATEWAY_TOKEN.",
			`View token: ${formatCliCommand("openclaw config get gateway.auth.token")}`,
			`Generate token: ${formatCliCommand("openclaw doctor --generate-gateway-token")}`,
			"Web UI stores a copy in this browser's localStorage (openclaw.control.settings.v1).",
			`Open the dashboard anytime: ${formatCliCommand("openclaw dashboard --no-open")}`,
			"If prompted: paste the token into Control UI settings (or use the tokenized dashboard URL)."
		].join("\n"), "Token");
		hatchChoice = await prompter.select({
			message: "How do you want to hatch your bot?",
			options: [
				{
					value: "tui",
					label: "Hatch in TUI (recommended)"
				},
				{
					value: "web",
					label: "Open the Web UI"
				},
				{
					value: "later",
					label: "Do this later"
				}
			],
			initialValue: "tui"
		});
		if (hatchChoice === "tui") {
			restoreTerminalState("pre-onboarding tui");
			await runTui({
				url: links.wsUrl,
				token: settings.authMode === "token" ? settings.gatewayToken : void 0,
				password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : "",
				deliver: false,
				message: hasBootstrap ? "Wake up, my friend!" : void 0
			});
			launchedTui = true;
		} else if (hatchChoice === "web") {
			if ((await detectBrowserOpenSupport()).ok) {
				controlUiOpened = await openUrl(authedUrl);
				if (!controlUiOpened) controlUiOpenHint = formatControlUiSshHint({
					port: settings.port,
					basePath: controlUiBasePath,
					token: settings.authMode === "token" ? settings.gatewayToken : void 0
				});
			} else controlUiOpenHint = formatControlUiSshHint({
				port: settings.port,
				basePath: controlUiBasePath,
				token: settings.authMode === "token" ? settings.gatewayToken : void 0
			});
			await prompter.note([
				`Dashboard link (with token): ${authedUrl}`,
				controlUiOpened ? "Opened in your browser. Keep that tab to control OpenClaw." : "Copy/paste this URL in a browser on this machine to control OpenClaw.",
				controlUiOpenHint
			].filter(Boolean).join("\n"), "Dashboard ready");
		} else await prompter.note(`When you're ready: ${formatCliCommand("openclaw dashboard --no-open")}`, "Later");
	} else if (opts.skipUi) await prompter.note("Skipping Control UI/TUI prompts.", "Control UI");
	await prompter.note(["Back up your agent workspace.", "Docs: https://docs.openclaw.ai/concepts/agent-workspace"].join("\n"), "Workspace backup");
	await prompter.note("Running agents on your computer is risky — harden your setup: https://docs.openclaw.ai/security", "Security");
	await setupOnboardingShellCompletion({
		flow,
		prompter
	});
	if (!opts.skipUi && settings.authMode === "token" && Boolean(settings.gatewayToken) && hatchChoice === null) {
		if ((await detectBrowserOpenSupport()).ok) {
			controlUiOpened = await openUrl(authedUrl);
			if (!controlUiOpened) controlUiOpenHint = formatControlUiSshHint({
				port: settings.port,
				basePath: controlUiBasePath,
				token: settings.gatewayToken
			});
		} else controlUiOpenHint = formatControlUiSshHint({
			port: settings.port,
			basePath: controlUiBasePath,
			token: settings.gatewayToken
		});
		await prompter.note([
			`Dashboard link (with token): ${authedUrl}`,
			controlUiOpened ? "Opened in your browser. Keep that tab to control OpenClaw." : "Copy/paste this URL in a browser on this machine to control OpenClaw.",
			controlUiOpenHint
		].filter(Boolean).join("\n"), "Dashboard ready");
	}
	const webSearchKey = (nextConfig.tools?.web?.search?.apiKey ?? "").trim();
	const webSearchEnv = (process.env.BRAVE_API_KEY ?? "").trim();
	const hasWebSearchKey = Boolean(webSearchKey || webSearchEnv);
	await prompter.note(hasWebSearchKey ? [
		"Web search is enabled, so your agent can look things up online when needed.",
		"",
		webSearchKey ? "API key: stored in config (tools.web.search.apiKey)." : "API key: provided via BRAVE_API_KEY env var (Gateway environment).",
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n") : [
		"If you want your agent to be able to search the web, you’ll need an API key.",
		"",
		"OpenClaw uses Brave Search for the `web_search` tool. Without a Brave Search API key, web search won’t work.",
		"",
		"Set it up interactively:",
		`- Run: ${formatCliCommand("openclaw configure --section web")}`,
		"- Enable web_search and paste your Brave Search API key",
		"",
		"Alternative: set BRAVE_API_KEY in the Gateway environment (no config changes).",
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n"), "Web search (optional)");
	await prompter.note("What now: https://openclaw.ai/showcase (\"What People Are Building\").", "What now");
	await prompter.outro(controlUiOpened ? "Onboarding complete. Dashboard opened; keep that tab to control OpenClaw." : "Onboarding complete. Use the dashboard link above to control OpenClaw.");
	return { launchedTui };
}

//#endregion
//#region src/wizard/onboarding.gateway-config.ts
const DEFAULT_DANGEROUS_NODE_DENY_COMMANDS = [
	"camera.snap",
	"camera.clip",
	"screen.record",
	"calendar.add",
	"contacts.add",
	"reminders.add"
];
async function configureGatewayForOnboarding(opts) {
	const { flow, localPort, quickstartGateway, prompter } = opts;
	let { nextConfig } = opts;
	const port = flow === "quickstart" ? quickstartGateway.port : Number.parseInt(String(await prompter.text({
		message: "Gateway port",
		initialValue: String(localPort),
		validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
	})), 10);
	let bind = flow === "quickstart" ? quickstartGateway.bind : await prompter.select({
		message: "Gateway bind",
		options: [
			{
				value: "loopback",
				label: "Loopback (127.0.0.1)"
			},
			{
				value: "lan",
				label: "LAN (0.0.0.0)"
			},
			{
				value: "tailnet",
				label: "Tailnet (Tailscale IP)"
			},
			{
				value: "auto",
				label: "Auto (Loopback → LAN)"
			},
			{
				value: "custom",
				label: "Custom IP"
			}
		]
	});
	let customBindHost = quickstartGateway.customBindHost;
	if (bind === "custom") {
		if (flow !== "quickstart" || !customBindHost) {
			const input = await prompter.text({
				message: "Custom IP address",
				placeholder: "192.168.1.100",
				initialValue: customBindHost ?? "",
				validate: (value) => {
					if (!value) return "IP address is required for custom bind mode";
					const parts = value.trim().split(".");
					if (parts.length !== 4) return "Invalid IPv4 address (e.g., 192.168.1.100)";
					if (parts.every((part) => {
						const n = parseInt(part, 10);
						return !Number.isNaN(n) && n >= 0 && n <= 255 && part === String(n);
					})) return;
					return "Invalid IPv4 address (each octet must be 0-255)";
				}
			});
			customBindHost = typeof input === "string" ? input.trim() : void 0;
		}
	}
	let authMode = flow === "quickstart" ? quickstartGateway.authMode : await prompter.select({
		message: "Gateway auth",
		options: [{
			value: "token",
			label: "Token",
			hint: "Recommended default (local + remote)"
		}, {
			value: "password",
			label: "Password"
		}],
		initialValue: "token"
	});
	const tailscaleMode = flow === "quickstart" ? quickstartGateway.tailscaleMode : await prompter.select({
		message: "Tailscale exposure",
		options: [
			{
				value: "off",
				label: "Off",
				hint: "No Tailscale exposure"
			},
			{
				value: "serve",
				label: "Serve",
				hint: "Private HTTPS for your tailnet (devices on Tailscale)"
			},
			{
				value: "funnel",
				label: "Funnel",
				hint: "Public HTTPS via Tailscale Funnel (internet)"
			}
		]
	});
	if (tailscaleMode !== "off") {
		if (!await findTailscaleBinary()) await prompter.note([
			"Tailscale binary not found in PATH or /Applications.",
			"Ensure Tailscale is installed from:",
			"  https://tailscale.com/download/mac",
			"",
			"You can continue setup, but serve/funnel will fail at runtime."
		].join("\n"), "Tailscale Warning");
	}
	let tailscaleResetOnExit = flow === "quickstart" ? quickstartGateway.tailscaleResetOnExit : false;
	if (tailscaleMode !== "off" && flow !== "quickstart") {
		await prompter.note([
			"Docs:",
			"https://docs.openclaw.ai/gateway/tailscale",
			"https://docs.openclaw.ai/web"
		].join("\n"), "Tailscale");
		tailscaleResetOnExit = Boolean(await prompter.confirm({
			message: "Reset Tailscale serve/funnel on exit?",
			initialValue: false
		}));
	}
	if (tailscaleMode !== "off" && bind !== "loopback") {
		await prompter.note("Tailscale requires bind=loopback. Adjusting bind to loopback.", "Note");
		bind = "loopback";
		customBindHost = void 0;
	}
	if (tailscaleMode === "funnel" && authMode !== "password") {
		await prompter.note("Tailscale funnel requires password auth.", "Note");
		authMode = "password";
	}
	let gatewayToken;
	if (authMode === "token") if (flow === "quickstart") gatewayToken = quickstartGateway.token ?? randomToken();
	else gatewayToken = normalizeGatewayTokenInput(await prompter.text({
		message: "Gateway token (blank to generate)",
		placeholder: "Needed for multi-machine or non-loopback access",
		initialValue: quickstartGateway.token ?? ""
	})) || randomToken();
	if (authMode === "password") {
		const password = flow === "quickstart" && quickstartGateway.password ? quickstartGateway.password : await prompter.text({
			message: "Gateway password",
			validate: validateGatewayPasswordInput
		});
		nextConfig = {
			...nextConfig,
			gateway: {
				...nextConfig.gateway,
				auth: {
					...nextConfig.gateway?.auth,
					mode: "password",
					password: String(password ?? "").trim()
				}
			}
		};
	} else if (authMode === "token") nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			auth: {
				...nextConfig.gateway?.auth,
				mode: "token",
				token: gatewayToken
			}
		}
	};
	nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			port,
			bind,
			...bind === "custom" && customBindHost ? { customBindHost } : {},
			tailscale: {
				...nextConfig.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	if (!quickstartGateway.hasExisting && nextConfig.gateway?.nodes?.denyCommands === void 0 && nextConfig.gateway?.nodes?.allowCommands === void 0 && nextConfig.gateway?.nodes?.browser === void 0) nextConfig = {
		...nextConfig,
		gateway: {
			...nextConfig.gateway,
			nodes: {
				...nextConfig.gateway?.nodes,
				denyCommands: [...DEFAULT_DANGEROUS_NODE_DENY_COMMANDS]
			}
		}
	};
	return {
		nextConfig,
		settings: {
			port,
			bind,
			customBindHost: bind === "custom" ? customBindHost : void 0,
			authMode,
			gatewayToken,
			tailscaleMode,
			tailscaleResetOnExit
		}
	};
}

//#endregion
//#region src/wizard/onboarding.ts
async function requireRiskAcknowledgement(params) {
	if (params.opts.acceptRisk === true) return;
	await params.prompter.note([
		"Security warning — please read.",
		"",
		"OpenClaw is a hobby project and still in beta. Expect sharp edges.",
		"This bot can read files and run actions if tools are enabled.",
		"A bad prompt can trick it into doing unsafe things.",
		"",
		"If you’re not comfortable with basic security and access control, don’t run OpenClaw.",
		"Ask someone experienced to help before enabling tools or exposing it to the internet.",
		"",
		"Recommended baseline:",
		"- Pairing/allowlists + mention gating.",
		"- Sandbox + least-privilege tools.",
		"- Keep secrets out of the agent’s reachable filesystem.",
		"- Use the strongest available model for any bot with tools or untrusted inboxes.",
		"",
		"Run regularly:",
		"openclaw security audit --deep",
		"openclaw security audit --fix",
		"",
		"Must read: https://docs.openclaw.ai/gateway/security"
	].join("\n"), "Security");
	if (!await params.prompter.confirm({
		message: "I understand this is powerful and inherently risky. Continue?",
		initialValue: false
	})) throw new WizardCancelledError("risk not accepted");
}
async function runOnboardingWizard(opts, runtime = defaultRuntime, prompter) {
	printWizardHeader(runtime);
	await prompter.intro("OpenClaw onboarding");
	await requireRiskAcknowledgement({
		opts,
		prompter
	});
	const snapshot = await readConfigFileSnapshot();
	let baseConfig = snapshot.valid ? snapshot.config : {};
	if (snapshot.exists && !snapshot.valid) {
		await prompter.note(summarizeExistingConfig(baseConfig), "Invalid config");
		if (snapshot.issues.length > 0) await prompter.note([
			...snapshot.issues.map((iss) => `- ${iss.path}: ${iss.message}`),
			"",
			"Docs: https://docs.openclaw.ai/gateway/configuration"
		].join("\n"), "Config issues");
		await prompter.outro(`Config invalid. Run \`${formatCliCommand("openclaw doctor")}\` to repair it, then re-run onboarding.`);
		runtime.exit(1);
		return;
	}
	const quickstartHint = `Configure details later via ${formatCliCommand("openclaw configure")}.`;
	const manualHint = "Configure port, network, Tailscale, and auth options.";
	const explicitFlowRaw = opts.flow?.trim();
	const normalizedExplicitFlow = explicitFlowRaw === "manual" ? "advanced" : explicitFlowRaw;
	if (normalizedExplicitFlow && normalizedExplicitFlow !== "quickstart" && normalizedExplicitFlow !== "advanced") {
		runtime.error("Invalid --flow (use quickstart, manual, or advanced).");
		runtime.exit(1);
		return;
	}
	let flow = (normalizedExplicitFlow === "quickstart" || normalizedExplicitFlow === "advanced" ? normalizedExplicitFlow : void 0) ?? await prompter.select({
		message: "Onboarding mode",
		options: [{
			value: "quickstart",
			label: "QuickStart",
			hint: quickstartHint
		}, {
			value: "advanced",
			label: "Manual",
			hint: manualHint
		}],
		initialValue: "quickstart"
	});
	if (opts.mode === "remote" && flow === "quickstart") {
		await prompter.note("QuickStart only supports local gateways. Switching to Manual mode.", "QuickStart");
		flow = "advanced";
	}
	if (snapshot.exists) {
		await prompter.note(summarizeExistingConfig(baseConfig), "Existing config detected");
		if (await prompter.select({
			message: "Config handling",
			options: [
				{
					value: "keep",
					label: "Use existing values"
				},
				{
					value: "modify",
					label: "Update values"
				},
				{
					value: "reset",
					label: "Reset"
				}
			]
		}) === "reset") {
			const workspaceDefault = baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE;
			await handleReset(await prompter.select({
				message: "Reset scope",
				options: [
					{
						value: "config",
						label: "Config only"
					},
					{
						value: "config+creds+sessions",
						label: "Config + creds + sessions"
					},
					{
						value: "full",
						label: "Full reset (config + creds + sessions + workspace)"
					}
				]
			}), resolveUserPath(workspaceDefault), runtime);
			baseConfig = {};
		}
	}
	const quickstartGateway = (() => {
		const hasExisting = typeof baseConfig.gateway?.port === "number" || baseConfig.gateway?.bind !== void 0 || baseConfig.gateway?.auth?.mode !== void 0 || baseConfig.gateway?.auth?.token !== void 0 || baseConfig.gateway?.auth?.password !== void 0 || baseConfig.gateway?.customBindHost !== void 0 || baseConfig.gateway?.tailscale?.mode !== void 0;
		const bindRaw = baseConfig.gateway?.bind;
		const bind = bindRaw === "loopback" || bindRaw === "lan" || bindRaw === "auto" || bindRaw === "custom" || bindRaw === "tailnet" ? bindRaw : "loopback";
		let authMode = "token";
		if (baseConfig.gateway?.auth?.mode === "token" || baseConfig.gateway?.auth?.mode === "password") authMode = baseConfig.gateway.auth.mode;
		else if (baseConfig.gateway?.auth?.token) authMode = "token";
		else if (baseConfig.gateway?.auth?.password) authMode = "password";
		const tailscaleRaw = baseConfig.gateway?.tailscale?.mode;
		const tailscaleMode = tailscaleRaw === "off" || tailscaleRaw === "serve" || tailscaleRaw === "funnel" ? tailscaleRaw : "off";
		return {
			hasExisting,
			port: resolveGatewayPort(baseConfig),
			bind,
			authMode,
			tailscaleMode,
			token: baseConfig.gateway?.auth?.token,
			password: baseConfig.gateway?.auth?.password,
			customBindHost: baseConfig.gateway?.customBindHost,
			tailscaleResetOnExit: baseConfig.gateway?.tailscale?.resetOnExit ?? false
		};
	})();
	if (flow === "quickstart") {
		const formatBind = (value) => {
			if (value === "loopback") return "Loopback (127.0.0.1)";
			if (value === "lan") return "LAN";
			if (value === "custom") return "Custom IP";
			if (value === "tailnet") return "Tailnet (Tailscale IP)";
			return "Auto";
		};
		const formatAuth = (value) => {
			if (value === "token") return "Token (default)";
			return "Password";
		};
		const formatTailscale = (value) => {
			if (value === "off") return "Off";
			if (value === "serve") return "Serve";
			return "Funnel";
		};
		const quickstartLines = quickstartGateway.hasExisting ? [
			"Keeping your current gateway settings:",
			`Gateway port: ${quickstartGateway.port}`,
			`Gateway bind: ${formatBind(quickstartGateway.bind)}`,
			...quickstartGateway.bind === "custom" && quickstartGateway.customBindHost ? [`Gateway custom IP: ${quickstartGateway.customBindHost}`] : [],
			`Gateway auth: ${formatAuth(quickstartGateway.authMode)}`,
			`Tailscale exposure: ${formatTailscale(quickstartGateway.tailscaleMode)}`,
			"Direct to chat channels."
		] : [
			`Gateway port: ${DEFAULT_GATEWAY_PORT}`,
			"Gateway bind: Loopback (127.0.0.1)",
			"Gateway auth: Token (default)",
			"Tailscale exposure: Off",
			"Direct to chat channels."
		];
		await prompter.note(quickstartLines.join("\n"), "QuickStart");
	}
	const localPort = resolveGatewayPort(baseConfig);
	const localUrl = `ws://127.0.0.1:${localPort}`;
	const localProbe = await probeGatewayReachable({
		url: localUrl,
		token: baseConfig.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN,
		password: baseConfig.gateway?.auth?.password ?? process.env.OPENCLAW_GATEWAY_PASSWORD
	});
	const remoteUrl = baseConfig.gateway?.remote?.url?.trim() ?? "";
	const remoteProbe = remoteUrl ? await probeGatewayReachable({
		url: remoteUrl,
		token: baseConfig.gateway?.remote?.token
	}) : null;
	const mode = opts.mode ?? (flow === "quickstart" ? "local" : await prompter.select({
		message: "What do you want to set up?",
		options: [{
			value: "local",
			label: "Local gateway (this machine)",
			hint: localProbe.ok ? `Gateway reachable (${localUrl})` : `No gateway detected (${localUrl})`
		}, {
			value: "remote",
			label: "Remote gateway (info-only)",
			hint: !remoteUrl ? "No remote URL configured yet" : remoteProbe?.ok ? `Gateway reachable (${remoteUrl})` : `Configured but unreachable (${remoteUrl})`
		}]
	}));
	if (mode === "remote") {
		let nextConfig = await promptRemoteGatewayConfig(baseConfig, prompter);
		nextConfig = applyWizardMetadata(nextConfig, {
			command: "onboard",
			mode
		});
		await writeConfigFile(nextConfig);
		logConfigUpdated(runtime);
		await prompter.outro("Remote gateway configured.");
		return;
	}
	const workspaceDir = resolveUserPath((opts.workspace ?? (flow === "quickstart" ? baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE : await prompter.text({
		message: "Workspace directory",
		initialValue: baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE
	}))).trim() || DEFAULT_WORKSPACE);
	let nextConfig = {
		...baseConfig,
		agents: {
			...baseConfig.agents,
			defaults: {
				...baseConfig.agents?.defaults,
				workspace: workspaceDir
			}
		},
		gateway: {
			...baseConfig.gateway,
			mode: "local"
		}
	};
	const authStore = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
	const authChoiceFromPrompt = opts.authChoice === void 0;
	const authChoice = opts.authChoice ?? await promptAuthChoiceGrouped({
		prompter,
		store: authStore,
		includeSkip: true
	});
	if (authChoice === "custom-api-key") nextConfig = (await promptCustomApiConfig({
		prompter,
		runtime,
		config: nextConfig
	})).config;
	else nextConfig = (await applyAuthChoice({
		authChoice,
		config: nextConfig,
		prompter,
		runtime,
		setDefaultModel: true,
		opts: {
			tokenProvider: opts.tokenProvider,
			token: opts.authChoice === "apiKey" && opts.token ? opts.token : void 0
		}
	})).config;
	if (authChoiceFromPrompt && authChoice !== "custom-api-key") {
		const modelSelection = await promptDefaultModel({
			config: nextConfig,
			prompter,
			allowKeep: true,
			ignoreAllowlist: true,
			includeVllm: true,
			preferredProvider: resolvePreferredProviderForAuthChoice(authChoice)
		});
		if (modelSelection.config) nextConfig = modelSelection.config;
		if (modelSelection.model) nextConfig = applyPrimaryModel(nextConfig, modelSelection.model);
	}
	await warnIfModelConfigLooksOff(nextConfig, prompter);
	const gateway = await configureGatewayForOnboarding({
		flow,
		baseConfig,
		nextConfig,
		localPort,
		quickstartGateway,
		prompter,
		runtime
	});
	nextConfig = gateway.nextConfig;
	const settings = gateway.settings;
	if (opts.skipChannels ?? opts.skipProviders) await prompter.note("Skipping channel setup.", "Channels");
	else {
		const quickstartAllowFromChannels = flow === "quickstart" ? listChannelPlugins().filter((plugin) => plugin.meta.quickstartAllowFrom).map((plugin) => plugin.id) : [];
		nextConfig = await setupChannels(nextConfig, runtime, prompter, {
			allowSignalInstall: true,
			forceAllowFromChannels: quickstartAllowFromChannels,
			skipDmPolicyPrompt: flow === "quickstart",
			skipConfirm: flow === "quickstart",
			quickstartDefaults: flow === "quickstart"
		});
	}
	await writeConfigFile(nextConfig);
	logConfigUpdated(runtime);
	await ensureWorkspaceAndSessions(workspaceDir, runtime, { skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap) });
	if (opts.skipSkills) await prompter.note("Skipping skills setup.", "Skills");
	else nextConfig = await setupSkills(nextConfig, workspaceDir, runtime, prompter);
	nextConfig = await setupInternalHooks(nextConfig, runtime, prompter);
	nextConfig = applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	await writeConfigFile(nextConfig);
	const { launchedTui } = await finalizeOnboardingWizard({
		flow,
		opts,
		baseConfig,
		nextConfig,
		workspaceDir,
		settings,
		prompter,
		runtime
	});
	if (launchedTui) return;
}

//#endregion
//#region src/cli/ports.ts
function parseLsofOutput(output) {
	const lines = output.split(/\r?\n/).filter(Boolean);
	const results = [];
	let current = {};
	for (const line of lines) if (line.startsWith("p")) {
		if (current.pid) results.push(current);
		current = { pid: Number.parseInt(line.slice(1), 10) };
	} else if (line.startsWith("c")) current.command = line.slice(1);
	if (current.pid) results.push(current);
	return results;
}
function listPortListeners(port) {
	try {
		return parseLsofOutput(execFileSync(resolveLsofCommandSync(), [
			"-nP",
			`-iTCP:${port}`,
			"-sTCP:LISTEN",
			"-FpFc"
		], { encoding: "utf-8" }));
	} catch (err) {
		const status = err.status;
		if (err.code === "ENOENT") throw new Error("lsof not found; required for --force", { cause: err });
		if (status === 1) return [];
		throw err instanceof Error ? err : new Error(String(err));
	}
}
function forceFreePort(port) {
	const listeners = listPortListeners(port);
	for (const proc of listeners) try {
		process.kill(proc.pid, "SIGTERM");
	} catch (err) {
		throw new Error(`failed to kill pid ${proc.pid}${proc.command ? ` (${proc.command})` : ""}: ${String(err)}`, { cause: err });
	}
	return listeners;
}
function killPids(listeners, signal) {
	for (const proc of listeners) try {
		process.kill(proc.pid, signal);
	} catch (err) {
		throw new Error(`failed to kill pid ${proc.pid}${proc.command ? ` (${proc.command})` : ""}: ${String(err)}`, { cause: err });
	}
}
async function forceFreePortAndWait(port, opts = {}) {
	const timeoutMs = Math.max(opts.timeoutMs ?? 1500, 0);
	const intervalMs = Math.max(opts.intervalMs ?? 100, 1);
	const sigtermTimeoutMs = Math.min(Math.max(opts.sigtermTimeoutMs ?? 600, 0), timeoutMs);
	const killed = forceFreePort(port);
	if (killed.length === 0) return {
		killed,
		waitedMs: 0,
		escalatedToSigkill: false
	};
	let waitedMs = 0;
	const triesSigterm = intervalMs > 0 ? Math.ceil(sigtermTimeoutMs / intervalMs) : 0;
	for (let i = 0; i < triesSigterm; i++) {
		if (listPortListeners(port).length === 0) return {
			killed,
			waitedMs,
			escalatedToSigkill: false
		};
		await sleep(intervalMs);
		waitedMs += intervalMs;
	}
	if (listPortListeners(port).length === 0) return {
		killed,
		waitedMs,
		escalatedToSigkill: false
	};
	killPids(listPortListeners(port), "SIGKILL");
	const remainingBudget = Math.max(timeoutMs - waitedMs, 0);
	const triesSigkill = intervalMs > 0 ? Math.ceil(remainingBudget / intervalMs) : 0;
	for (let i = 0; i < triesSigkill; i++) {
		if (listPortListeners(port).length === 0) return {
			killed,
			waitedMs,
			escalatedToSigkill: true
		};
		await sleep(intervalMs);
		waitedMs += intervalMs;
	}
	const still = listPortListeners(port);
	if (still.length === 0) return {
		killed,
		waitedMs,
		escalatedToSigkill: true
	};
	throw new Error(`port ${port} still has listeners after --force: ${still.map((p) => p.pid).join(", ")}`);
}

//#endregion
export { forceFreePortAndWait as n, runOnboardingWizard as r, forceFreePort as t };