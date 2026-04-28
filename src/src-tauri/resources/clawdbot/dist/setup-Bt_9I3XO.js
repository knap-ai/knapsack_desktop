import { u as resolveGatewayPort } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as formatCliCommand } from "./command-format-BORwwHyH.js";
import { p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { n as defaultRuntime } from "./runtime-izpjJukX.js";
import { u as normalizeSecretInputString } from "./types.secrets-ClP-vJ-P.js";
import { r as createConfigIO } from "./io-CFdEhZuM.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { r as replaceConfigFile } from "./config--k_1dtUP.js";
import { t as WizardCancelledError } from "./prompts-CsV4pT5z.js";
import { l as formatPluginCompatibilityNotice, r as buildPluginCompatibilitySnapshotNotices } from "./status-8bmXOkc1.js";
import { n as commitConfigWriteWithPendingPluginInstalls } from "./plugins-install-record-commit-D1LplN50.js";
import { t as resolveSetupSecretInputString } from "./setup.secret-input-G1v9x6qg.js";
import path from "node:path";
import fs from "node:fs/promises";
import chalk from "chalk";
//#region src/wizard/setup.migration-import.ts
const MEANINGFUL_CONFIG_IGNORED_KEYS = new Set(["$schema", "meta"]);
const MEANINGFUL_WORKSPACE_ENTRIES = [
	"AGENTS.md",
	"SOUL.md",
	"USER.md",
	"IDENTITY.md",
	"MEMORY.md",
	"skills"
];
const MEANINGFUL_STATE_ENTRIES = [
	"credentials",
	"sessions",
	"agents"
];
async function exists(candidate) {
	try {
		await fs.access(candidate);
		return true;
	} catch {
		return false;
	}
}
async function hasDirectoryEntries(candidate) {
	try {
		return (await fs.readdir(candidate)).length > 0;
	} catch {
		return false;
	}
}
function hasMeaningfulConfig(config) {
	return Object.keys(config).some((key) => !MEANINGFUL_CONFIG_IGNORED_KEYS.has(key));
}
async function inspectSetupMigrationFreshness(params) {
	const reasons = [];
	if (hasMeaningfulConfig(params.baseConfig)) reasons.push("existing config values are loaded");
	for (const entry of MEANINGFUL_WORKSPACE_ENTRIES) if (await exists(path.join(params.workspaceDir, entry))) reasons.push(`workspace ${entry} exists`);
	for (const entry of MEANINGFUL_STATE_ENTRIES) if (await hasDirectoryEntries(path.join(params.stateDir, entry))) reasons.push(`state ${entry}/ exists`);
	return {
		fresh: reasons.length === 0,
		reasons
	};
}
function assertFreshSetupMigrationTarget(freshness) {
	if (freshness.fresh || process.env.OPENCLAW_MIGRATION_EXISTING_IMPORT === "1") return;
	throw new Error([
		"Migration import during onboarding requires a fresh OpenClaw setup.",
		"Create a fresh setup or reset config, credentials, sessions, and workspace before importing.",
		"Backup plus overwrite/merge imports are feature-gated for now.",
		"Existing setup:",
		...freshness.reasons.map((reason) => `- ${reason}`)
	].join("\n"));
}
async function detectSetupMigrationSources(params) {
	const [{ resolvePluginMigrationProviders }, { createMigrationLogger }, { resolveStateDir }] = await Promise.all([
		import("./migration-provider-runtime-Qi54dYnO.js"),
		import("./context-CXWidOM4.js"),
		import("./paths-BMxaLwkU.js")
	]);
	const stateDir = resolveStateDir();
	const logger = createMigrationLogger(params.runtime);
	const detections = [];
	for (const provider of resolvePluginMigrationProviders({ cfg: params.config })) {
		if (!provider.detect) continue;
		try {
			const detection = await provider.detect({
				config: params.config,
				stateDir,
				logger
			});
			if (detection.found) detections.push({
				providerId: provider.id,
				label: detection.label ?? provider.label,
				...detection.source ? { source: detection.source } : {},
				...detection.message ? { message: detection.message } : {}
			});
		} catch (error) {
			logger.debug?.(`Migration provider ${provider.id} detection failed: ${formatErrorMessage(error)}`);
		}
	}
	return detections;
}
function resolveImportSourceDefault(params) {
	const detected = params.detections.find((detection) => detection.providerId === params.providerId);
	if (detected?.source) return detected.source;
	return params.providerId === "hermes" ? "~/.hermes" : "";
}
async function selectSetupMigrationProvider(params) {
	const { resolvePluginMigrationProvider, resolvePluginMigrationProviders } = await import("./migration-provider-runtime-Qi54dYnO.js");
	const providers = resolvePluginMigrationProviders({ cfg: params.baseConfig });
	if (providers.length === 0) throw new Error("No migration providers found.");
	const providerById = new Map(providers.map((provider) => [provider.id, provider]));
	const providerId = params.opts.importFrom?.trim() || await params.prompter.select({
		message: "Migration source",
		options: [...params.detections.map((detection) => ({
			value: detection.providerId,
			label: detection.label,
			...detection.source || detection.message ? { hint: detection.source ?? detection.message } : {}
		})), ...providers.filter((provider) => !params.detections.some((detection) => detection.providerId === provider.id)).map((provider) => ({
			value: provider.id,
			label: provider.label,
			hint: provider.description ?? "Enter a source path next"
		}))],
		initialValue: params.detections[0]?.providerId ?? providers[0]?.id
	});
	const provider = providerById.get(providerId) ?? resolvePluginMigrationProvider({
		providerId,
		cfg: params.baseConfig
	});
	if (!provider) throw new Error(`Unknown migration provider "${providerId}".`);
	return {
		provider,
		providerId
	};
}
async function runSetupMigrationImport(params) {
	const [{ applyLocalSetupWorkspaceConfig, applySkipBootstrapConfig }, { createMigrationLogger, buildMigrationReportDir }, { createPreMigrationBackup }, { assertApplySucceeded, assertConflictFreePlan, formatMigrationPlan }, { resolveStateDir }, onboardHelpers] = await Promise.all([
		import("./onboard-config-CqMcINFN.js"),
		import("./context-CXWidOM4.js"),
		import("./apply-CUstcIVJ.js"),
		import("./output-vxgl8FvO.js"),
		import("./paths-BMxaLwkU.js"),
		import("./onboard-helpers-rUrMc8dI.js")
	]);
	const { provider, providerId } = await selectSetupMigrationProvider({
		opts: params.opts,
		baseConfig: params.baseConfig,
		detections: params.detections,
		prompter: params.prompter
	});
	const sourceDefault = resolveImportSourceDefault({
		providerId,
		detections: params.detections
	});
	const sourceDir = params.opts.importSource?.trim() || sourceDefault || (params.opts.nonInteractive ? (() => {
		throw new Error("--import-source is required for non-interactive migration import.");
	})() : await params.prompter.text({
		message: "Source agent home",
		initialValue: providerId === "hermes" ? "~/.hermes" : void 0
	}));
	const workspaceDir = resolveUserPath((params.opts.workspace ?? (params.opts.nonInteractive ? params.baseConfig.agents?.defaults?.workspace ?? onboardHelpers.DEFAULT_WORKSPACE : await params.prompter.text({
		message: "Target workspace directory",
		initialValue: params.baseConfig.agents?.defaults?.workspace ?? onboardHelpers.DEFAULT_WORKSPACE
	}))).trim() || onboardHelpers.DEFAULT_WORKSPACE);
	let targetConfig = applyLocalSetupWorkspaceConfig(params.baseConfig, workspaceDir);
	if (params.opts.skipBootstrap) targetConfig = applySkipBootstrapConfig(targetConfig);
	const stateDir = resolveStateDir();
	assertFreshSetupMigrationTarget(await inspectSetupMigrationFreshness({
		baseConfig: params.baseConfig,
		stateDir,
		workspaceDir
	}));
	const ctx = {
		config: targetConfig,
		stateDir,
		source: sourceDir,
		includeSecrets: Boolean(params.opts.importSecrets),
		overwrite: false,
		logger: createMigrationLogger(params.runtime)
	};
	const plan = await provider.plan(ctx);
	await params.prompter.note(formatMigrationPlan(plan).join("\n"), "Migration preview");
	assertConflictFreePlan(plan, providerId);
	if (!(params.opts.nonInteractive === true ? true : await params.prompter.confirm({
		message: "Apply this migration now?",
		initialValue: false
	}))) throw new WizardCancelledError("migration cancelled");
	const reportDir = buildMigrationReportDir(providerId, stateDir);
	const backupPath = await createPreMigrationBackup({});
	targetConfig = onboardHelpers.applyWizardMetadata(targetConfig, {
		command: "onboard",
		mode: "local"
	});
	targetConfig = await params.commitConfigFile(targetConfig);
	const applyCtx = {
		...ctx,
		config: targetConfig,
		...backupPath ? { backupPath } : {},
		reportDir
	};
	const result = await provider.apply(applyCtx, plan);
	const withReport = {
		...result,
		...result.backupPath ?? backupPath ? { backupPath: result.backupPath ?? backupPath } : {},
		reportDir: result.reportDir ?? reportDir
	};
	assertApplySucceeded(withReport);
	await params.prompter.note(formatMigrationPlan(withReport).join("\n"), "Migration applied");
	await params.prompter.outro("Migration complete. Run `openclaw doctor` next.");
}
//#endregion
//#region src/wizard/setup.security-note.ts
const SECURITY_NOTE_TITLE = "Security disclaimer";
const heading = (text) => chalk.bold(text);
const SECURITY_NOTE_MESSAGE = [
	"OpenClaw is a hobby project and still in beta. Expect sharp edges.",
	"By default, OpenClaw is a personal agent: one trusted operator boundary.",
	"This bot can read files and run actions if tools are enabled.",
	"A bad prompt can trick it into doing unsafe things.",
	"",
	"OpenClaw is not a hostile multi-tenant boundary by default.",
	"If multiple users can message one tool-enabled agent, they share that delegated tool authority.",
	"",
	"If you’re not comfortable with security hardening and access control, don’t run OpenClaw.",
	"Ask someone experienced to help before enabling tools or exposing it to the internet.",
	"",
	heading("Recommended baseline"),
	"- Pairing/allowlists + mention gating.",
	"- Multi-user/shared inbox: split trust boundaries (separate gateway/credentials, ideally separate OS users/hosts).",
	"- Sandbox + least-privilege tools.",
	"- Shared inboxes: isolate DM sessions (session.dmScope: per-channel-peer) and keep tool access minimal.",
	"- Keep secrets out of the agent’s reachable filesystem.",
	"- Use the strongest available model for any bot with tools or untrusted inboxes.",
	"",
	heading("Run regularly"),
	formatCliCommand("openclaw security audit --deep"),
	formatCliCommand("openclaw security audit --fix"),
	"",
	heading("Learn more"),
	"- https://docs.openclaw.ai/gateway/security"
].join("\n");
//#endregion
//#region src/wizard/setup.ts
let authChoiceModulePromise;
let configLoggingModulePromise;
let modelPickerModulePromise;
function loadAuthChoiceModule() {
	authChoiceModulePromise ??= import("./auth-choice-CR9e13Ck.js");
	return authChoiceModulePromise;
}
function loadConfigLoggingModule() {
	configLoggingModulePromise ??= import("./logging-QYz7baDe.js");
	return configLoggingModulePromise;
}
function loadModelPickerModule() {
	modelPickerModulePromise ??= import("./model-picker-DeUNCuIc.js");
	return modelPickerModulePromise;
}
async function writeWizardConfigFile(config) {
	return (await commitConfigWriteWithPendingPluginInstalls({
		nextConfig: config,
		commit: async (nextConfig, writeOptions) => {
			await replaceConfigFile({
				nextConfig,
				...writeOptions ? { writeOptions } : {},
				afterWrite: { mode: "auto" }
			});
		}
	})).config;
}
async function readSetupConfigFileSnapshot() {
	return await createConfigIO({ pluginValidation: "skip" }).readConfigFileSnapshot();
}
async function resolveAuthChoiceModelSelectionPolicy(params) {
	const preferredProvider = await params.resolvePreferredProviderForAuthChoice({
		choice: params.authChoice,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const [{ resolveManifestProviderAuthChoice }, { resolvePluginSetupProvider }] = await Promise.all([import("./provider-auth-choices-VuEmb3vi.js"), import("./setup-registry-utK1scAg.js")]);
	const manifestChoice = resolveManifestProviderAuthChoice(params.authChoice, {
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		includeUntrustedWorkspacePlugins: false
	});
	if (manifestChoice) {
		const setupProvider = resolvePluginSetupProvider({
			provider: manifestChoice.providerId,
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env,
			pluginIds: [manifestChoice.pluginId]
		});
		const setupPolicy = (setupProvider?.auth.find((method) => normalizeProviderId(method.id) === normalizeProviderId(manifestChoice.methodId)))?.wizard?.modelSelection ?? setupProvider?.wizard?.setup?.modelSelection;
		return {
			preferredProvider,
			promptWhenAuthChoiceProvided: setupPolicy?.promptWhenAuthChoiceProvided === true,
			allowKeepCurrent: setupPolicy?.allowKeepCurrent ?? true
		};
	}
	const { resolvePluginProviders, resolveProviderPluginChoice } = await import("./provider-auth-choice.runtime-CFJ4q9So.js");
	const providers = resolvePluginProviders({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		mode: "setup"
	});
	const resolvedChoice = resolveProviderPluginChoice({
		providers,
		choice: params.authChoice
	});
	const matchedProvider = resolvedChoice?.provider ?? (() => {
		const preferredId = preferredProvider?.trim();
		if (!preferredId) return;
		return providers.find((provider) => typeof provider.id === "string" && provider.id.trim() === preferredId);
	})();
	const setupPolicy = resolvedChoice?.wizard?.modelSelection ?? matchedProvider?.wizard?.setup?.modelSelection;
	return {
		preferredProvider,
		promptWhenAuthChoiceProvided: setupPolicy?.promptWhenAuthChoiceProvided === true,
		allowKeepCurrent: setupPolicy?.allowKeepCurrent ?? true
	};
}
async function requireRiskAcknowledgement(params) {
	if (params.opts.acceptRisk === true) return;
	await params.prompter.note(SECURITY_NOTE_MESSAGE, SECURITY_NOTE_TITLE);
	if (!await params.prompter.confirm({
		message: "I understand this is personal-by-default and shared/multi-user use requires lock-down. Continue?",
		initialValue: false
	})) throw new WizardCancelledError("risk not accepted");
}
async function runSetupWizard(opts, runtime = defaultRuntime, prompter) {
	const onboardHelpers = await import("./onboard-helpers-rUrMc8dI.js");
	onboardHelpers.printWizardHeader(runtime);
	await prompter.intro("OpenClaw setup");
	await requireRiskAcknowledgement({
		opts,
		prompter
	});
	const snapshot = await readSetupConfigFileSnapshot();
	let baseConfig = snapshot.valid ? snapshot.exists ? snapshot.sourceConfig ?? snapshot.config : {} : {};
	if (snapshot.exists && !snapshot.valid) {
		await prompter.note(onboardHelpers.summarizeExistingConfig(baseConfig), "Invalid config");
		if (snapshot.issues.length > 0) await prompter.note([
			...snapshot.issues.map((iss) => `- ${iss.path}: ${iss.message}`),
			"",
			"Docs: https://docs.openclaw.ai/gateway/configuration"
		].join("\n"), "Config issues");
		await prompter.outro(`Config invalid. Run \`${formatCliCommand("openclaw doctor")}\` to repair it, then re-run setup.`);
		runtime.exit(1);
		return;
	}
	const compatibilityNotices = snapshot.valid ? buildPluginCompatibilitySnapshotNotices({ config: baseConfig }) : [];
	if (compatibilityNotices.length > 0) await prompter.note([
		`Detected ${compatibilityNotices.length} plugin compatibility notice${compatibilityNotices.length === 1 ? "" : "s"} in the current config.`,
		...compatibilityNotices.slice(0, 4).map((notice) => `- ${formatPluginCompatibilityNotice(notice)}`),
		...compatibilityNotices.length > 4 ? [`- ... +${compatibilityNotices.length - 4} more`] : [],
		"",
		`Review: ${formatCliCommand("openclaw doctor")}`,
		`Inspect: ${formatCliCommand("openclaw plugins inspect --all")}`
	].join("\n"), "Plugin compatibility");
	const quickstartHint = `Configure details later via ${formatCliCommand("openclaw configure")}.`;
	const manualHint = "Configure port, network, Tailscale, and auth options.";
	const migrationDetections = await detectSetupMigrationSources({
		config: baseConfig,
		runtime
	});
	const firstMigrationDetection = migrationDetections[0];
	const importOption = firstMigrationDetection ? {
		value: "import",
		label: `Import from ${firstMigrationDetection.label}`,
		...firstMigrationDetection.source ? { hint: firstMigrationDetection.source } : {}
	} : void 0;
	const explicitFlowRaw = opts.flow?.trim();
	const normalizedExplicitFlow = explicitFlowRaw === "manual" ? "advanced" : explicitFlowRaw;
	if (normalizedExplicitFlow && normalizedExplicitFlow !== "quickstart" && normalizedExplicitFlow !== "advanced" && normalizedExplicitFlow !== "import") {
		runtime.error("Invalid --flow (use quickstart, manual, advanced, or import).");
		runtime.exit(1);
		return;
	}
	let flow = (normalizedExplicitFlow === "quickstart" || normalizedExplicitFlow === "advanced" || normalizedExplicitFlow === "import" ? normalizedExplicitFlow : void 0) ?? await prompter.select({
		message: "Setup mode",
		options: [
			{
				value: "quickstart",
				label: "QuickStart",
				hint: quickstartHint
			},
			{
				value: "advanced",
				label: "Manual",
				hint: manualHint
			},
			...importOption ? [importOption] : []
		],
		initialValue: "quickstart"
	});
	if (opts.mode === "remote" && flow === "quickstart") {
		await prompter.note("QuickStart only supports local gateways. Switching to Manual mode.", "QuickStart");
		flow = "advanced";
	}
	if (snapshot.exists) {
		await prompter.note(onboardHelpers.summarizeExistingConfig(baseConfig), "Existing config detected");
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
			const workspaceDefault = baseConfig.agents?.defaults?.workspace ?? onboardHelpers.DEFAULT_WORKSPACE;
			const resetScope = await prompter.select({
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
			});
			await onboardHelpers.handleReset(resetScope, resolveUserPath(workspaceDefault), runtime);
			baseConfig = {};
		}
	}
	if (opts.importFrom || flow === "import") {
		await runSetupMigrationImport({
			opts,
			baseConfig,
			detections: migrationDetections,
			prompter,
			runtime,
			commitConfigFile: writeWizardConfigFile
		});
		return;
	}
	const wizardFlow = flow;
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
			`Gateway port: ${quickstartGateway.port}`,
			"Gateway bind: Loopback (127.0.0.1)",
			"Gateway auth: Token (default)",
			"Tailscale exposure: Off",
			"Direct to chat channels."
		];
		await prompter.note(quickstartLines.join("\n"), "QuickStart");
	}
	const localPort = resolveGatewayPort(baseConfig);
	const localUrl = `ws://127.0.0.1:${localPort}`;
	let localGatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;
	try {
		const resolvedGatewayToken = await resolveSetupSecretInputString({
			config: baseConfig,
			value: baseConfig.gateway?.auth?.token,
			path: "gateway.auth.token",
			env: process.env
		});
		if (resolvedGatewayToken) localGatewayToken = resolvedGatewayToken;
	} catch (error) {
		await prompter.note(["Could not resolve gateway.auth.token SecretRef for setup probe.", formatErrorMessage(error)].join("\n"), "Gateway auth");
	}
	let localGatewayPassword = process.env.OPENCLAW_GATEWAY_PASSWORD;
	try {
		const resolvedGatewayPassword = await resolveSetupSecretInputString({
			config: baseConfig,
			value: baseConfig.gateway?.auth?.password,
			path: "gateway.auth.password",
			env: process.env
		});
		if (resolvedGatewayPassword) localGatewayPassword = resolvedGatewayPassword;
	} catch (error) {
		await prompter.note(["Could not resolve gateway.auth.password SecretRef for setup probe.", formatErrorMessage(error)].join("\n"), "Gateway auth");
	}
	const localProbe = await onboardHelpers.probeGatewayReachable({
		url: localUrl,
		token: localGatewayToken,
		password: localGatewayPassword
	});
	const remoteUrl = baseConfig.gateway?.remote?.url?.trim() ?? "";
	let remoteGatewayToken = normalizeSecretInputString(baseConfig.gateway?.remote?.token);
	try {
		const resolvedRemoteGatewayToken = await resolveSetupSecretInputString({
			config: baseConfig,
			value: baseConfig.gateway?.remote?.token,
			path: "gateway.remote.token",
			env: process.env
		});
		if (resolvedRemoteGatewayToken) remoteGatewayToken = resolvedRemoteGatewayToken;
	} catch (error) {
		await prompter.note(["Could not resolve gateway.remote.token SecretRef for setup probe.", formatErrorMessage(error)].join("\n"), "Gateway auth");
	}
	const remoteProbe = remoteUrl ? await onboardHelpers.probeGatewayReachable({
		url: remoteUrl,
		token: remoteGatewayToken
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
		const { promptRemoteGatewayConfig } = await import("./onboard-remote-DAq1gpKL.js");
		const { applySkipBootstrapConfig } = await import("./onboard-config-CqMcINFN.js");
		const { logConfigUpdated } = await loadConfigLoggingModule();
		let nextConfig = await promptRemoteGatewayConfig(baseConfig, prompter, { secretInputMode: opts.secretInputMode });
		if (opts.skipBootstrap) nextConfig = applySkipBootstrapConfig(nextConfig);
		nextConfig = onboardHelpers.applyWizardMetadata(nextConfig, {
			command: "onboard",
			mode
		});
		nextConfig = await writeWizardConfigFile(nextConfig);
		logConfigUpdated(runtime);
		await prompter.outro("Remote gateway configured.");
		return;
	}
	const workspaceDir = resolveUserPath((opts.workspace ?? (flow === "quickstart" ? baseConfig.agents?.defaults?.workspace ?? onboardHelpers.DEFAULT_WORKSPACE : await prompter.text({
		message: "Workspace directory",
		initialValue: baseConfig.agents?.defaults?.workspace ?? onboardHelpers.DEFAULT_WORKSPACE
	}))).trim() || onboardHelpers.DEFAULT_WORKSPACE);
	const { applyLocalSetupWorkspaceConfig, applySkipBootstrapConfig } = await import("./onboard-config-CqMcINFN.js");
	let nextConfig = applyLocalSetupWorkspaceConfig(baseConfig, workspaceDir);
	if (opts.skipBootstrap) nextConfig = applySkipBootstrapConfig(nextConfig);
	const authChoiceFromPrompt = opts.authChoice === void 0;
	let authChoice = opts.authChoice;
	let authStore;
	let promptAuthChoiceGrouped;
	if (authChoiceFromPrompt) {
		const { ensureAuthProfileStore } = await import("./agents/auth-profiles.runtime.js");
		({promptAuthChoiceGrouped} = await import("./auth-choice-prompt-BwWLdZPK.js"));
		authStore = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
	}
	while (true) {
		if (authChoiceFromPrompt) authChoice = await promptAuthChoiceGrouped({
			prompter,
			store: authStore,
			includeSkip: true,
			config: nextConfig,
			workspaceDir
		});
		if (authChoice === void 0) throw new WizardCancelledError("auth choice is required");
		if (authChoice === "custom-api-key") {
			const { promptCustomApiConfig } = await import("./onboard-custom-CciDPs4z.js");
			nextConfig = (await promptCustomApiConfig({
				prompter,
				runtime,
				config: nextConfig,
				secretInputMode: opts.secretInputMode
			})).config;
			break;
		}
		if (authChoice === "skip") {
			if (authChoiceFromPrompt) {
				const { applyPrimaryModel, promptDefaultModel } = await loadModelPickerModule();
				const modelSelection = await promptDefaultModel({
					config: nextConfig,
					prompter,
					allowKeep: true,
					ignoreAllowlist: true,
					includeProviderPluginSetups: false,
					loadCatalog: false,
					workspaceDir,
					runtime
				});
				if (modelSelection.config) nextConfig = modelSelection.config;
				if (modelSelection.model) nextConfig = applyPrimaryModel(nextConfig, modelSelection.model);
				const { warnIfModelConfigLooksOff } = await loadAuthChoiceModule();
				await warnIfModelConfigLooksOff(nextConfig, prompter, { validateCatalog: false });
			}
			break;
		}
		const [{ applyAuthChoice, resolvePreferredProviderForAuthChoice, warnIfModelConfigLooksOff }, { applyPrimaryModel, promptDefaultModel }] = await Promise.all([loadAuthChoiceModule(), loadModelPickerModule()]);
		const authResult = await applyAuthChoice({
			authChoice,
			config: nextConfig,
			prompter,
			runtime,
			setDefaultModel: true,
			opts: {
				tokenProvider: opts.tokenProvider,
				token: opts.authChoice === "apiKey" && opts.token ? opts.token : void 0
			}
		});
		nextConfig = authResult.config;
		if (authResult.retrySelection) {
			if (authChoiceFromPrompt) continue;
			break;
		}
		if (authResult.agentModelOverride) nextConfig = applyPrimaryModel(nextConfig, authResult.agentModelOverride);
		const authChoiceModelSelectionPolicy = await resolveAuthChoiceModelSelectionPolicy({
			authChoice,
			config: nextConfig,
			workspaceDir,
			resolvePreferredProviderForAuthChoice
		});
		if (authChoiceFromPrompt || authChoiceModelSelectionPolicy?.promptWhenAuthChoiceProvided) {
			const modelSelection = await promptDefaultModel({
				config: nextConfig,
				prompter,
				allowKeep: authChoiceModelSelectionPolicy?.allowKeepCurrent ?? true,
				ignoreAllowlist: true,
				includeProviderPluginSetups: true,
				preferredProvider: authChoiceModelSelectionPolicy?.preferredProvider,
				browseCatalogOnDemand: true,
				workspaceDir,
				runtime
			});
			if (modelSelection.config) nextConfig = modelSelection.config;
			if (modelSelection.model) nextConfig = applyPrimaryModel(nextConfig, modelSelection.model);
		}
		await warnIfModelConfigLooksOff(nextConfig, prompter, { validateCatalog: false });
		break;
	}
	const { configureGatewayForSetup } = await import("./setup.gateway-config-Dwp5bn9B.js");
	const gateway = await configureGatewayForSetup({
		flow: wizardFlow,
		baseConfig,
		nextConfig,
		localPort,
		quickstartGateway,
		secretInputMode: opts.secretInputMode,
		prompter,
		runtime
	});
	nextConfig = gateway.nextConfig;
	const settings = gateway.settings;
	if (opts.skipChannels ?? opts.skipProviders) await prompter.note("Skipping channel setup.", "Channels");
	else {
		const { listChannelPlugins } = await import("./plugins-B9_ofpFl.js");
		const { setupChannels } = await import("./onboard-channels-Z30z-EXq.js");
		const quickstartAllowFromChannels = flow === "quickstart" ? listChannelPlugins().filter((plugin) => plugin.meta.quickstartAllowFrom).map((plugin) => plugin.id) : [];
		nextConfig = await setupChannels(nextConfig, runtime, prompter, {
			allowSignalInstall: true,
			deferStatusUntilSelection: flow === "quickstart",
			forceAllowFromChannels: quickstartAllowFromChannels,
			skipDmPolicyPrompt: flow === "quickstart",
			skipConfirm: flow === "quickstart",
			quickstartDefaults: flow === "quickstart",
			secretInputMode: opts.secretInputMode
		});
	}
	nextConfig = await writeWizardConfigFile(nextConfig);
	const { logConfigUpdated } = await loadConfigLoggingModule();
	logConfigUpdated(runtime);
	await onboardHelpers.ensureWorkspaceAndSessions(workspaceDir, runtime, { skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap) });
	if (opts.skipSearch) await prompter.note("Skipping search setup.", "Search");
	else {
		const { setupSearch } = await import("./onboard-search-V8M12JYU.js");
		nextConfig = await setupSearch(nextConfig, runtime, prompter, {
			quickstartDefaults: flow === "quickstart",
			secretInputMode: opts.secretInputMode
		});
	}
	if (opts.skipSkills) await prompter.note("Skipping skills setup.", "Skills");
	else {
		const { setupSkills } = await import("./onboard-skills-D1g-wyiM.js");
		nextConfig = await setupSkills(nextConfig, workspaceDir, runtime, prompter);
	}
	if (flow !== "quickstart") {
		const { setupPluginConfig } = await import("./setup.plugin-config-BkCuwGhl.js");
		nextConfig = await setupPluginConfig({
			config: nextConfig,
			prompter,
			workspaceDir
		});
	}
	const { setupInternalHooks } = await import("./onboard-hooks-DkcJbjrV.js");
	nextConfig = await setupInternalHooks(nextConfig, runtime, prompter);
	nextConfig = onboardHelpers.applyWizardMetadata(nextConfig, {
		command: "onboard",
		mode
	});
	nextConfig = await writeWizardConfigFile(nextConfig);
	const { finalizeSetupWizard } = await import("./setup.finalize-BPtMkq-s.js");
	const { launchedTui } = await finalizeSetupWizard({
		flow: wizardFlow,
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
export { runSetupWizard as t };
