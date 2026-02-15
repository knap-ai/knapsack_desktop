import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { R as CONFIG_PATH, h as defaultRuntime, q as resolveGatewayPort } from "./entry.js";
import { v as ensureAuthProfileStore } from "./auth-profiles-DnpV8DWM.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { S as shortenHomePath, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { i as loadConfig, l as writeConfigFile, o as readConfigFileSnapshot } from "./config-BJWIHf6x.js";
import { n as listChannelPlugins, t as getChannelPlugin } from "./plugins-DsHRVW6o.js";
import { p as findTailscaleBinary } from "./auth-DaQXd14b.js";
import { n as withProgress } from "./progress-C4IJwa0T.js";
import { _ as summarizeExistingConfig, a as ensureWorkspaceAndSessions, f as printWizardHeader, h as resolveControlUiLinks, m as randomToken, n as applyWizardMetadata, p as probeGatewayReachable, s as guardCancel, t as DEFAULT_WORKSPACE, u as normalizeGatewayTokenInput, v as validateGatewayPasswordInput, y as waitForGatewayReachable } from "./onboard-helpers-HBGG6t5A.js";
import { n as stylePromptMessage, r as stylePromptTitle, t as stylePromptHint } from "./prompt-style-f1NZuGno.js";
import { t as note$1 } from "./note-68V10H-1.js";
import { t as WizardCancelledError } from "./prompts-DxnxCHKt.js";
import { t as createClackPrompter } from "./clack-prompter-DQbUxHl-.js";
import { n as setupChannels, t as noteChannelStatus } from "./onboard-channels-orChigJn.js";
import { a as gatewayInstallErrorHint, i as buildGatewayInstallPlan, n as GATEWAY_DAEMON_RUNTIME_OPTIONS, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-CPrv-rEf.js";
import { t as resolveGatewayService } from "./service-q_Baxtp9.js";
import { d as applyPrimaryModel, f as promptDefaultModel, l as applyModelAllowlist, p as promptModelAllowlist, r as promptRemoteGatewayConfig, s as promptCustomApiConfig, t as setupSkills, u as applyModelFallbacksFromSelection } from "./onboard-skills-BwrWiu8R.js";
import { r as healthCommand } from "./health-ifSF2YWo.js";
import { n as ensureControlUiAssetsBuilt, t as formatHealthCheckFailure } from "./health-format-Bm9KnFIU.js";
import { l as promptAuthChoiceGrouped, r as applyAuthChoice, t as resolvePreferredProviderForAuthChoice } from "./auth-choice-D4mJmR9L.js";
import { n as logConfigUpdated } from "./logging-By_aaJZy.js";
import { t as ensureSystemdUserLingerInteractive } from "./systemd-linger-5cVJInPr.js";
import { confirm, intro, outro, select, text } from "@clack/prompts";

//#region src/commands/configure.shared.ts
const CONFIGURE_WIZARD_SECTIONS = [
	"workspace",
	"model",
	"web",
	"gateway",
	"daemon",
	"channels",
	"skills",
	"health"
];
const CONFIGURE_SECTION_OPTIONS = [
	{
		value: "workspace",
		label: "Workspace",
		hint: "Set workspace + sessions"
	},
	{
		value: "model",
		label: "Model",
		hint: "Pick provider + credentials"
	},
	{
		value: "web",
		label: "Web tools",
		hint: "Configure Brave search + fetch"
	},
	{
		value: "gateway",
		label: "Gateway",
		hint: "Port, bind, auth, tailscale"
	},
	{
		value: "daemon",
		label: "Daemon",
		hint: "Install/manage the background service"
	},
	{
		value: "channels",
		label: "Channels",
		hint: "Link WhatsApp/Telegram/etc and defaults"
	},
	{
		value: "skills",
		label: "Skills",
		hint: "Install/enable workspace skills"
	},
	{
		value: "health",
		label: "Health check",
		hint: "Run gateway + channel checks"
	}
];
const intro$1 = (message) => intro(stylePromptTitle(message) ?? message);
const outro$1 = (message) => outro(stylePromptTitle(message) ?? message);
const text$1 = (params) => text({
	...params,
	message: stylePromptMessage(params.message)
});
const confirm$1 = (params) => confirm({
	...params,
	message: stylePromptMessage(params.message)
});
const select$1 = (params) => select({
	...params,
	message: stylePromptMessage(params.message),
	options: params.options.map((opt) => opt.hint === void 0 ? opt : {
		...opt,
		hint: stylePromptHint(opt.hint)
	})
});

//#endregion
//#region src/commands/configure.channels.ts
async function removeChannelConfigWizard(cfg, runtime) {
	let next = { ...cfg };
	const listConfiguredChannels = () => listChannelPlugins().map((plugin) => plugin.meta).filter((meta) => next.channels?.[meta.id] !== void 0);
	while (true) {
		const configured = listConfiguredChannels();
		if (configured.length === 0) {
			note$1(["No channel config found in openclaw.json.", `Tip: \`${formatCliCommand("openclaw channels status")}\` shows what is configured and enabled.`].join("\n"), "Remove channel");
			return next;
		}
		const channel = guardCancel(await select$1({
			message: "Remove which channel config?",
			options: [...configured.map((meta) => ({
				value: meta.id,
				label: meta.label,
				hint: "Deletes tokens + settings from config (credentials stay on disk)"
			})), {
				value: "done",
				label: "Done"
			}]
		}), runtime);
		if (channel === "done") return next;
		const label = getChannelPlugin(channel)?.meta.label ?? channel;
		if (!guardCancel(await confirm$1({
			message: `Delete ${label} configuration from ${shortenHomePath(CONFIG_PATH)}?`,
			initialValue: false
		}), runtime)) continue;
		const nextChannels = { ...next.channels };
		delete nextChannels[channel];
		next = {
			...next,
			channels: Object.keys(nextChannels).length ? nextChannels : void 0
		};
		note$1([`${label} removed from config.`, "Note: credentials/sessions on disk are unchanged."].join("\n"), "Channel removed");
	}
}

//#endregion
//#region src/commands/configure.daemon.ts
async function maybeInstallDaemon(params) {
	const service = resolveGatewayService();
	const loaded = await service.isLoaded({ env: process.env });
	let shouldCheckLinger = false;
	let shouldInstall = true;
	let daemonRuntime = params.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
	if (loaded) {
		const action = guardCancel(await select$1({
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
		}), params.runtime);
		if (action === "restart") {
			await withProgress({
				label: "Gateway service",
				indeterminate: true,
				delayMs: 0
			}, async (progress) => {
				progress.setLabel("Restarting Gateway service…");
				await service.restart({
					env: process.env,
					stdout: process.stdout
				});
				progress.setLabel("Gateway service restarted.");
			});
			shouldCheckLinger = true;
			shouldInstall = false;
		}
		if (action === "skip") return;
		if (action === "reinstall") await withProgress({
			label: "Gateway service",
			indeterminate: true,
			delayMs: 0
		}, async (progress) => {
			progress.setLabel("Uninstalling Gateway service…");
			await service.uninstall({
				env: process.env,
				stdout: process.stdout
			});
			progress.setLabel("Gateway service uninstalled.");
		});
	}
	if (shouldInstall) {
		let installError = null;
		if (!params.daemonRuntime) if (GATEWAY_DAEMON_RUNTIME_OPTIONS.length === 1) daemonRuntime = GATEWAY_DAEMON_RUNTIME_OPTIONS[0]?.value ?? DEFAULT_GATEWAY_DAEMON_RUNTIME;
		else daemonRuntime = guardCancel(await select$1({
			message: "Gateway service runtime",
			options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
			initialValue: DEFAULT_GATEWAY_DAEMON_RUNTIME
		}), params.runtime);
		await withProgress({
			label: "Gateway service",
			indeterminate: true,
			delayMs: 0
		}, async (progress) => {
			progress.setLabel("Preparing Gateway service…");
			const cfg = loadConfig();
			const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
				env: process.env,
				port: params.port,
				token: params.gatewayToken,
				runtime: daemonRuntime,
				warn: (message, title) => note$1(message, title),
				config: cfg
			});
			progress.setLabel("Installing Gateway service…");
			try {
				await service.install({
					env: process.env,
					stdout: process.stdout,
					programArguments,
					workingDirectory,
					environment
				});
				progress.setLabel("Gateway service installed.");
			} catch (err) {
				installError = err instanceof Error ? err.message : String(err);
				progress.setLabel("Gateway service install failed.");
			}
		});
		if (installError) {
			note$1("Gateway service install failed: " + installError, "Gateway");
			note$1(gatewayInstallErrorHint(), "Gateway");
			return;
		}
		shouldCheckLinger = true;
	}
	if (shouldCheckLinger) await ensureSystemdUserLingerInteractive({
		runtime: params.runtime,
		prompter: {
			confirm: async (p) => guardCancel(await confirm$1(p), params.runtime),
			note: note$1
		},
		reason: "Linux installs use a systemd user service. Without lingering, systemd stops the user session on logout/idle and kills the Gateway.",
		requireConfirm: true
	});
}

//#endregion
//#region src/commands/configure.gateway-auth.ts
/** Reject undefined, empty, and common JS string-coercion artifacts for token auth. */
function sanitizeTokenValue(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed || trimmed === "undefined" || trimmed === "null") return;
	return trimmed;
}
const ANTHROPIC_OAUTH_MODEL_KEYS = [
	"anthropic/claude-opus-4-6",
	"anthropic/claude-opus-4-5",
	"anthropic/claude-sonnet-4-5",
	"anthropic/claude-haiku-4-5"
];
function buildGatewayAuthConfig(params) {
	const allowTailscale = params.existing?.allowTailscale;
	const base = {};
	if (typeof allowTailscale === "boolean") base.allowTailscale = allowTailscale;
	if (params.mode === "token") {
		const token = sanitizeTokenValue(params.token) ?? randomToken();
		return {
			...base,
			mode: "token",
			token
		};
	}
	const password = params.password?.trim();
	return {
		...base,
		mode: "password",
		...password && { password }
	};
}
async function promptAuthConfig(cfg, runtime, prompter) {
	const authChoice = await promptAuthChoiceGrouped({
		prompter,
		store: ensureAuthProfileStore(void 0, { allowKeychainPrompt: false }),
		includeSkip: true
	});
	let next = cfg;
	if (authChoice === "custom-api-key") next = (await promptCustomApiConfig({
		prompter,
		runtime,
		config: next
	})).config;
	else if (authChoice !== "skip") next = (await applyAuthChoice({
		authChoice,
		config: next,
		prompter,
		runtime,
		setDefaultModel: true
	})).config;
	else {
		const modelSelection = await promptDefaultModel({
			config: next,
			prompter,
			allowKeep: true,
			ignoreAllowlist: true,
			preferredProvider: resolvePreferredProviderForAuthChoice(authChoice)
		});
		if (modelSelection.config) next = modelSelection.config;
		if (modelSelection.model) next = applyPrimaryModel(next, modelSelection.model);
	}
	const anthropicOAuth = authChoice === "setup-token" || authChoice === "token" || authChoice === "oauth";
	if (authChoice !== "custom-api-key") {
		const allowlistSelection = await promptModelAllowlist({
			config: next,
			prompter,
			allowedKeys: anthropicOAuth ? ANTHROPIC_OAUTH_MODEL_KEYS : void 0,
			initialSelections: anthropicOAuth ? ["anthropic/claude-opus-4-6"] : void 0,
			message: anthropicOAuth ? "Anthropic OAuth models" : void 0
		});
		if (allowlistSelection.models) {
			next = applyModelAllowlist(next, allowlistSelection.models);
			next = applyModelFallbacksFromSelection(next, allowlistSelection.models);
		}
	}
	return next;
}

//#endregion
//#region src/commands/configure.gateway.ts
async function promptGatewayConfig(cfg, runtime) {
	const portRaw = guardCancel(await text$1({
		message: "Gateway port",
		initialValue: String(resolveGatewayPort(cfg)),
		validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
	}), runtime);
	const port = Number.parseInt(String(portRaw), 10);
	let bind = guardCancel(await select$1({
		message: "Gateway bind mode",
		options: [
			{
				value: "loopback",
				label: "Loopback (Local only)",
				hint: "Bind to 127.0.0.1 - secure, local-only access"
			},
			{
				value: "tailnet",
				label: "Tailnet (Tailscale IP)",
				hint: "Bind to your Tailscale IP only (100.x.x.x)"
			},
			{
				value: "auto",
				label: "Auto (Loopback → LAN)",
				hint: "Prefer loopback; fall back to all interfaces if unavailable"
			},
			{
				value: "lan",
				label: "LAN (All interfaces)",
				hint: "Bind to 0.0.0.0 - accessible from anywhere on your network"
			},
			{
				value: "custom",
				label: "Custom IP",
				hint: "Specify a specific IP address, with 0.0.0.0 fallback if unavailable"
			}
		]
	}), runtime);
	let customBindHost;
	if (bind === "custom") {
		const input = guardCancel(await text$1({
			message: "Custom IP address",
			placeholder: "192.168.1.100",
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
		}), runtime);
		customBindHost = typeof input === "string" ? input : void 0;
	}
	let authMode = guardCancel(await select$1({
		message: "Gateway auth",
		options: [{
			value: "token",
			label: "Token",
			hint: "Recommended default"
		}, {
			value: "password",
			label: "Password"
		}],
		initialValue: "token"
	}), runtime);
	const tailscaleMode = guardCancel(await select$1({
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
	}), runtime);
	if (tailscaleMode !== "off") {
		if (!await findTailscaleBinary()) note$1([
			"Tailscale binary not found in PATH or /Applications.",
			"Ensure Tailscale is installed from:",
			"  https://tailscale.com/download/mac",
			"",
			"You can continue setup, but serve/funnel will fail at runtime."
		].join("\n"), "Tailscale Warning");
	}
	let tailscaleResetOnExit = false;
	if (tailscaleMode !== "off") {
		note$1([
			"Docs:",
			"https://docs.openclaw.ai/gateway/tailscale",
			"https://docs.openclaw.ai/web"
		].join("\n"), "Tailscale");
		tailscaleResetOnExit = Boolean(guardCancel(await confirm$1({
			message: "Reset Tailscale serve/funnel on exit?",
			initialValue: false
		}), runtime));
	}
	if (tailscaleMode !== "off" && bind !== "loopback") {
		note$1("Tailscale requires bind=loopback. Adjusting bind to loopback.", "Note");
		bind = "loopback";
	}
	if (tailscaleMode === "funnel" && authMode !== "password") {
		note$1("Tailscale funnel requires password auth.", "Note");
		authMode = "password";
	}
	let gatewayToken;
	let gatewayPassword;
	let next = cfg;
	if (authMode === "token") gatewayToken = normalizeGatewayTokenInput(guardCancel(await text$1({
		message: "Gateway token (blank to generate)",
		initialValue: randomToken()
	}), runtime)) || randomToken();
	if (authMode === "password") {
		const password = guardCancel(await text$1({
			message: "Gateway password",
			validate: validateGatewayPasswordInput
		}), runtime);
		gatewayPassword = String(password ?? "").trim();
	}
	const authConfig = buildGatewayAuthConfig({
		existing: next.gateway?.auth,
		mode: authMode,
		token: gatewayToken,
		password: gatewayPassword
	});
	next = {
		...next,
		gateway: {
			...next.gateway,
			mode: "local",
			port,
			bind,
			auth: authConfig,
			...customBindHost && { customBindHost },
			tailscale: {
				...next.gateway?.tailscale,
				mode: tailscaleMode,
				resetOnExit: tailscaleResetOnExit
			}
		}
	};
	return {
		config: next,
		port,
		token: gatewayToken
	};
}

//#endregion
//#region src/commands/configure.wizard.ts
async function promptConfigureSection(runtime, hasSelection) {
	return guardCancel(await select$1({
		message: "Select sections to configure",
		options: [...CONFIGURE_SECTION_OPTIONS, {
			value: "__continue",
			label: "Continue",
			hint: hasSelection ? "Done" : "Skip for now"
		}],
		initialValue: CONFIGURE_SECTION_OPTIONS[0]?.value
	}), runtime);
}
async function promptChannelMode(runtime) {
	return guardCancel(await select$1({
		message: "Channels",
		options: [{
			value: "configure",
			label: "Configure/link",
			hint: "Add/update channels; disable unselected accounts"
		}, {
			value: "remove",
			label: "Remove channel config",
			hint: "Delete channel tokens/settings from openclaw.json"
		}],
		initialValue: "configure"
	}), runtime);
}
async function promptWebToolsConfig(nextConfig, runtime) {
	const existingSearch = nextConfig.tools?.web?.search;
	const existingFetch = nextConfig.tools?.web?.fetch;
	const hasSearchKey = Boolean(existingSearch?.apiKey);
	note$1([
		"Web search lets your agent look things up online using the `web_search` tool.",
		"It requires a Brave Search API key (you can store it in the config or set BRAVE_API_KEY in the Gateway environment).",
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n"), "Web search");
	const enableSearch = guardCancel(await confirm$1({
		message: "Enable web_search (Brave Search)?",
		initialValue: existingSearch?.enabled ?? hasSearchKey
	}), runtime);
	let nextSearch = {
		...existingSearch,
		enabled: enableSearch
	};
	if (enableSearch) {
		const keyInput = guardCancel(await text$1({
			message: hasSearchKey ? "Brave Search API key (leave blank to keep current or use BRAVE_API_KEY)" : "Brave Search API key (paste it here; leave blank to use BRAVE_API_KEY)",
			placeholder: hasSearchKey ? "Leave blank to keep current" : "BSA..."
		}), runtime);
		const key = String(keyInput ?? "").trim();
		if (key) nextSearch = {
			...nextSearch,
			apiKey: key
		};
		else if (!hasSearchKey) note$1([
			"No key stored yet, so web_search will stay unavailable.",
			"Store a key here or set BRAVE_API_KEY in the Gateway environment.",
			"Docs: https://docs.openclaw.ai/tools/web"
		].join("\n"), "Web search");
	}
	const enableFetch = guardCancel(await confirm$1({
		message: "Enable web_fetch (keyless HTTP fetch)?",
		initialValue: existingFetch?.enabled ?? true
	}), runtime);
	const nextFetch = {
		...existingFetch,
		enabled: enableFetch
	};
	return {
		...nextConfig,
		tools: {
			...nextConfig.tools,
			web: {
				...nextConfig.tools?.web,
				search: nextSearch,
				fetch: nextFetch
			}
		}
	};
}
async function runConfigureWizard(opts, runtime = defaultRuntime) {
	try {
		printWizardHeader(runtime);
		intro$1(opts.command === "update" ? "OpenClaw update wizard" : "OpenClaw configure");
		const prompter = createClackPrompter();
		const snapshot = await readConfigFileSnapshot();
		const baseConfig = snapshot.valid ? snapshot.config : {};
		if (snapshot.exists) {
			const title = snapshot.valid ? "Existing config detected" : "Invalid config";
			note$1(summarizeExistingConfig(baseConfig), title);
			if (!snapshot.valid && snapshot.issues.length > 0) note$1([
				...snapshot.issues.map((iss) => `- ${iss.path}: ${iss.message}`),
				"",
				"Docs: https://docs.openclaw.ai/gateway/configuration"
			].join("\n"), "Config issues");
			if (!snapshot.valid) {
				outro$1(`Config invalid. Run \`${formatCliCommand("openclaw doctor")}\` to repair it, then re-run configure.`);
				runtime.exit(1);
				return;
			}
		}
		const localUrl = "ws://127.0.0.1:18789";
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
		const mode = guardCancel(await select$1({
			message: "Where will the Gateway run?",
			options: [{
				value: "local",
				label: "Local (this machine)",
				hint: localProbe.ok ? `Gateway reachable (${localUrl})` : `No gateway detected (${localUrl})`
			}, {
				value: "remote",
				label: "Remote (info-only)",
				hint: !remoteUrl ? "No remote URL configured yet" : remoteProbe?.ok ? `Gateway reachable (${remoteUrl})` : `Configured but unreachable (${remoteUrl})`
			}]
		}), runtime);
		if (mode === "remote") {
			let remoteConfig = await promptRemoteGatewayConfig(baseConfig, prompter);
			remoteConfig = applyWizardMetadata(remoteConfig, {
				command: opts.command,
				mode
			});
			await writeConfigFile(remoteConfig);
			logConfigUpdated(runtime);
			outro$1("Remote gateway configured.");
			return;
		}
		let nextConfig = { ...baseConfig };
		let didSetGatewayMode = false;
		if (nextConfig.gateway?.mode !== "local") {
			nextConfig = {
				...nextConfig,
				gateway: {
					...nextConfig.gateway,
					mode: "local"
				}
			};
			didSetGatewayMode = true;
		}
		let workspaceDir = nextConfig.agents?.defaults?.workspace ?? baseConfig.agents?.defaults?.workspace ?? DEFAULT_WORKSPACE;
		let gatewayPort = resolveGatewayPort(baseConfig);
		let gatewayToken = nextConfig.gateway?.auth?.token ?? baseConfig.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN;
		const persistConfig = async () => {
			nextConfig = applyWizardMetadata(nextConfig, {
				command: opts.command,
				mode
			});
			await writeConfigFile(nextConfig);
			logConfigUpdated(runtime);
		};
		if (opts.sections) {
			const selected = opts.sections;
			if (!selected || selected.length === 0) {
				outro$1("No changes selected.");
				return;
			}
			if (selected.includes("workspace")) {
				const workspaceInput = guardCancel(await text$1({
					message: "Workspace directory",
					initialValue: workspaceDir
				}), runtime);
				workspaceDir = resolveUserPath(String(workspaceInput ?? "").trim() || DEFAULT_WORKSPACE);
				nextConfig = {
					...nextConfig,
					agents: {
						...nextConfig.agents,
						defaults: {
							...nextConfig.agents?.defaults,
							workspace: workspaceDir
						}
					}
				};
				await ensureWorkspaceAndSessions(workspaceDir, runtime);
			}
			if (selected.includes("model")) nextConfig = await promptAuthConfig(nextConfig, runtime, prompter);
			if (selected.includes("web")) nextConfig = await promptWebToolsConfig(nextConfig, runtime);
			if (selected.includes("gateway")) {
				const gateway = await promptGatewayConfig(nextConfig, runtime);
				nextConfig = gateway.config;
				gatewayPort = gateway.port;
				gatewayToken = gateway.token;
			}
			if (selected.includes("channels")) {
				await noteChannelStatus({
					cfg: nextConfig,
					prompter
				});
				if (await promptChannelMode(runtime) === "configure") nextConfig = await setupChannels(nextConfig, runtime, prompter, {
					allowDisable: true,
					allowSignalInstall: true,
					skipConfirm: true,
					skipStatusNote: true
				});
				else nextConfig = await removeChannelConfigWizard(nextConfig, runtime);
			}
			if (selected.includes("skills")) {
				const wsDir = resolveUserPath(workspaceDir);
				nextConfig = await setupSkills(nextConfig, wsDir, runtime, prompter);
			}
			await persistConfig();
			if (selected.includes("daemon")) {
				if (!selected.includes("gateway")) {
					const portInput = guardCancel(await text$1({
						message: "Gateway port for service install",
						initialValue: String(gatewayPort),
						validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
					}), runtime);
					gatewayPort = Number.parseInt(String(portInput), 10);
				}
				await maybeInstallDaemon({
					runtime,
					port: gatewayPort,
					gatewayToken
				});
			}
			if (selected.includes("health")) {
				const localLinks = resolveControlUiLinks({
					bind: nextConfig.gateway?.bind ?? "loopback",
					port: gatewayPort,
					customBindHost: nextConfig.gateway?.customBindHost,
					basePath: void 0
				});
				const remoteUrl = nextConfig.gateway?.remote?.url?.trim();
				await waitForGatewayReachable({
					url: nextConfig.gateway?.mode === "remote" && remoteUrl ? remoteUrl : localLinks.wsUrl,
					token: nextConfig.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN,
					password: nextConfig.gateway?.auth?.password ?? process.env.OPENCLAW_GATEWAY_PASSWORD,
					deadlineMs: 15e3
				});
				try {
					await healthCommand({
						json: false,
						timeoutMs: 1e4
					}, runtime);
				} catch (err) {
					runtime.error(formatHealthCheckFailure(err));
					note$1([
						"Docs:",
						"https://docs.openclaw.ai/gateway/health",
						"https://docs.openclaw.ai/gateway/troubleshooting"
					].join("\n"), "Health check help");
				}
			}
		} else {
			let ranSection = false;
			let didConfigureGateway = false;
			while (true) {
				const choice = await promptConfigureSection(runtime, ranSection);
				if (choice === "__continue") break;
				ranSection = true;
				if (choice === "workspace") {
					const workspaceInput = guardCancel(await text$1({
						message: "Workspace directory",
						initialValue: workspaceDir
					}), runtime);
					workspaceDir = resolveUserPath(String(workspaceInput ?? "").trim() || DEFAULT_WORKSPACE);
					nextConfig = {
						...nextConfig,
						agents: {
							...nextConfig.agents,
							defaults: {
								...nextConfig.agents?.defaults,
								workspace: workspaceDir
							}
						}
					};
					await ensureWorkspaceAndSessions(workspaceDir, runtime);
					await persistConfig();
				}
				if (choice === "model") {
					nextConfig = await promptAuthConfig(nextConfig, runtime, prompter);
					await persistConfig();
				}
				if (choice === "web") {
					nextConfig = await promptWebToolsConfig(nextConfig, runtime);
					await persistConfig();
				}
				if (choice === "gateway") {
					const gateway = await promptGatewayConfig(nextConfig, runtime);
					nextConfig = gateway.config;
					gatewayPort = gateway.port;
					gatewayToken = gateway.token;
					didConfigureGateway = true;
					await persistConfig();
				}
				if (choice === "channels") {
					await noteChannelStatus({
						cfg: nextConfig,
						prompter
					});
					if (await promptChannelMode(runtime) === "configure") nextConfig = await setupChannels(nextConfig, runtime, prompter, {
						allowDisable: true,
						allowSignalInstall: true,
						skipConfirm: true,
						skipStatusNote: true
					});
					else nextConfig = await removeChannelConfigWizard(nextConfig, runtime);
					await persistConfig();
				}
				if (choice === "skills") {
					const wsDir = resolveUserPath(workspaceDir);
					nextConfig = await setupSkills(nextConfig, wsDir, runtime, prompter);
					await persistConfig();
				}
				if (choice === "daemon") {
					if (!didConfigureGateway) {
						const portInput = guardCancel(await text$1({
							message: "Gateway port for service install",
							initialValue: String(gatewayPort),
							validate: (value) => Number.isFinite(Number(value)) ? void 0 : "Invalid port"
						}), runtime);
						gatewayPort = Number.parseInt(String(portInput), 10);
					}
					await maybeInstallDaemon({
						runtime,
						port: gatewayPort,
						gatewayToken
					});
				}
				if (choice === "health") {
					const localLinks = resolveControlUiLinks({
						bind: nextConfig.gateway?.bind ?? "loopback",
						port: gatewayPort,
						customBindHost: nextConfig.gateway?.customBindHost,
						basePath: void 0
					});
					const remoteUrl = nextConfig.gateway?.remote?.url?.trim();
					await waitForGatewayReachable({
						url: nextConfig.gateway?.mode === "remote" && remoteUrl ? remoteUrl : localLinks.wsUrl,
						token: nextConfig.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN,
						password: nextConfig.gateway?.auth?.password ?? process.env.OPENCLAW_GATEWAY_PASSWORD,
						deadlineMs: 15e3
					});
					try {
						await healthCommand({
							json: false,
							timeoutMs: 1e4
						}, runtime);
					} catch (err) {
						runtime.error(formatHealthCheckFailure(err));
						note$1([
							"Docs:",
							"https://docs.openclaw.ai/gateway/health",
							"https://docs.openclaw.ai/gateway/troubleshooting"
						].join("\n"), "Health check help");
					}
				}
			}
			if (!ranSection) {
				if (didSetGatewayMode) {
					await persistConfig();
					outro$1("Gateway mode set to local.");
					return;
				}
				outro$1("No changes selected.");
				return;
			}
		}
		const controlUiAssets = await ensureControlUiAssetsBuilt(runtime);
		if (!controlUiAssets.ok && controlUiAssets.message) runtime.error(controlUiAssets.message);
		const links = resolveControlUiLinks({
			bind: nextConfig.gateway?.bind ?? "loopback",
			port: gatewayPort,
			customBindHost: nextConfig.gateway?.customBindHost,
			basePath: nextConfig.gateway?.controlUi?.basePath
		});
		const newPassword = nextConfig.gateway?.auth?.password ?? process.env.OPENCLAW_GATEWAY_PASSWORD;
		const oldPassword = baseConfig.gateway?.auth?.password ?? process.env.OPENCLAW_GATEWAY_PASSWORD;
		const token = nextConfig.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN;
		let gatewayProbe = await probeGatewayReachable({
			url: links.wsUrl,
			token,
			password: newPassword
		});
		if (!gatewayProbe.ok && newPassword !== oldPassword && oldPassword) gatewayProbe = await probeGatewayReachable({
			url: links.wsUrl,
			token,
			password: oldPassword
		});
		const gatewayStatusLine = gatewayProbe.ok ? "Gateway: reachable" : `Gateway: not detected${gatewayProbe.detail ? ` (${gatewayProbe.detail})` : ""}`;
		note$1([
			`Web UI: ${links.httpUrl}`,
			`Gateway WS: ${links.wsUrl}`,
			gatewayStatusLine,
			"Docs: https://docs.openclaw.ai/web/control-ui"
		].join("\n"), "Control UI");
		outro$1("Configure complete.");
	} catch (err) {
		if (err instanceof WizardCancelledError) {
			runtime.exit(1);
			return;
		}
		throw err;
	}
}

//#endregion
//#region src/commands/configure.commands.ts
async function configureCommand(runtime = defaultRuntime) {
	await runConfigureWizard({ command: "configure" }, runtime);
}
async function configureCommandWithSections(sections, runtime = defaultRuntime) {
	await runConfigureWizard({
		command: "configure",
		sections
	}, runtime);
}

//#endregion
//#region src/commands/configure.ts
var configure_exports = /* @__PURE__ */ __exportAll({
	CONFIGURE_WIZARD_SECTIONS: () => CONFIGURE_WIZARD_SECTIONS,
	configureCommand: () => configureCommand,
	configureCommandWithSections: () => configureCommandWithSections
});

//#endregion
export { CONFIGURE_WIZARD_SECTIONS as i, configureCommand as n, configureCommandWithSections as r, configure_exports as t };