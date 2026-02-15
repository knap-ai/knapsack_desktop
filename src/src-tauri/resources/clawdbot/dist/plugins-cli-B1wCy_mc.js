import { g as resolveStateDir } from "./paths-DVBShlw6.js";
import { B as theme, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import { C as shortenHomePath, S as shortenHomeInString, _ as resolveConfigDir, b as resolveUserPath } from "./utils-CrauP1IK.js";
import "./pi-embedded-helpers-BMGOFUCT.js";
import "./reply-BNEkWD6b.js";
import "./exec-BDyx_yxc.js";
import "./agent-scope-DMGrQp5u.js";
import "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import "./boolean-BgXe2hyu.js";
import "./env-BSjH4KuP.js";
import { i as loadConfig, l as writeConfigFile } from "./config-CWifpzL_.js";
import { f as applyExclusiveSlotSelection, o as resolveBundledPluginsDir, p as defaultSlotIdForKey } from "./manifest-registry-DFR7U7LS.js";
import "./plugins-CLo5nH74.js";
import "./sessions-ezP1qtWM.js";
import "./runner-BDxtyEy4.js";
import "./image-w4Unf0wW.js";
import "./pi-model-discovery-EwKVHlZB.js";
import "./sandbox-BOXx_Lgl.js";
import "./chrome-CGPBw-bD.js";
import "./skills-Dj7GqTPz.js";
import "./routes-CyIJmYmu.js";
import "./server-context-DGqqHDqz.js";
import "./image-ops-DS83Z7J2.js";
import "./store-DFW2MnP3.js";
import "./ports-DAxLoOFv.js";
import "./message-channel-BA527_ar.js";
import "./logging-CcxUDNcI.js";
import "./accounts-DmCS3XF8.js";
import "./send-CUpDmT_F.js";
import "./send-C8AhSqO8.js";
import "./paths-BuQbsACT.js";
import "./tool-images-C7cLCz1D.js";
import "./redact-Bb36nvYe.js";
import "./tool-display-CPUH9JiE.js";
import "./fetch-_IAZS3Vz.js";
import "./deliver-BUfUVLsa.js";
import "./dispatcher-CKUm3wsK.js";
import "./send-Div41qfG.js";
import "./manager-BK_KHPSI.js";
import "./sqlite-DLuWRI0D.js";
import "./retry-UPMRcKEG.js";
import "./common-DwTaPWKf.js";
import "./ir-CGIUordM.js";
import "./render-DIvHuHqk.js";
import "./commands-registry-DBWrx0Xv.js";
import "./client-CEto0Pf6.js";
import "./call-i9290XP8.js";
import "./channel-activity-Ds_g7OEt.js";
import "./tables-1llcV3qs.js";
import "./send-oaAcLlhT.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import "./progress-DitCFjx_.js";
import "./pairing-store-88eMFj2v.js";
import "./pi-tools.policy-BKT9HswJ.js";
import "./send-DbQ_i4Qf.js";
import "./onboard-helpers-tLA-tN_l.js";
import "./prompt-style-ciYaT-3f.js";
import "./pairing-labels-C_rjFixf.js";
import "./session-cost-usage-CbsU4YHL.js";
import "./nodes-screen-BeEWwXR4.js";
import { _ as promptYesNo } from "./auth-DT6fiHDK.js";
import "./control-auth-Drf7IiLj.js";
import "./control-service-BKUh8p7b.js";
import "./channel-selection-BN6_hiIf.js";
import "./delivery-queue-46I6nBfA.js";
import { i as resolveArchiveKind } from "./archive-3RxGtdg9.js";
import "./skill-scanner-BDTjIBGW.js";
import { i as resolvePluginInstallDir, n as installPluginFromNpmSpec, r as installPluginFromPath, t as recordPluginInstall } from "./installs-NHf37wyZ.js";
import { t as renderTable } from "./table-BuqaalSN.js";
import { t as buildPluginStatusReport } from "./status-KJxlkH62.js";
import { n as updateNpmInstalledPlugins } from "./update-DUPx6JQo.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import fsPromises from "node:fs/promises";

//#region src/plugins/source-display.ts
function tryRelative(root, filePath) {
	const rel = path.relative(root, filePath);
	if (!rel || rel === ".") return null;
	if (rel === "..") return null;
	if (rel.startsWith(`..${path.sep}`) || rel.startsWith("../") || rel.startsWith("..\\")) return null;
	if (path.isAbsolute(rel)) return null;
	return rel.replaceAll("\\", "/");
}
function resolvePluginSourceRoots(params) {
	return {
		stock: resolveBundledPluginsDir(),
		global: path.join(resolveConfigDir(), "extensions"),
		workspace: params.workspaceDir ? path.join(params.workspaceDir, ".openclaw", "extensions") : void 0
	};
}
function formatPluginSourceForTable(plugin, roots) {
	const raw = plugin.source;
	if (plugin.origin === "bundled" && roots.stock) {
		const rel = tryRelative(roots.stock, raw);
		if (rel) return {
			value: `stock:${rel}`,
			rootKey: "stock"
		};
	}
	if (plugin.origin === "workspace" && roots.workspace) {
		const rel = tryRelative(roots.workspace, raw);
		if (rel) return {
			value: `workspace:${rel}`,
			rootKey: "workspace"
		};
	}
	if (plugin.origin === "global" && roots.global) {
		const rel = tryRelative(roots.global, raw);
		if (rel) return {
			value: `global:${rel}`,
			rootKey: "global"
		};
	}
	return { value: shortenHomeInString(raw) };
}

//#endregion
//#region src/plugins/uninstall.ts
function resolveUninstallDirectoryTarget(params) {
	if (!params.hasInstall) return null;
	if (params.installRecord?.source === "path") return null;
	let defaultPath;
	try {
		defaultPath = resolvePluginInstallDir(params.pluginId, params.extensionsDir);
	} catch {
		return null;
	}
	const configuredPath = params.installRecord?.installPath;
	if (!configuredPath) return defaultPath;
	if (path.resolve(configuredPath) === path.resolve(defaultPath)) return configuredPath;
	return defaultPath;
}
/**
* Remove plugin references from config (pure config mutation).
* Returns a new config with the plugin removed from entries, installs, allow, load.paths, and slots.
*/
function removePluginFromConfig(cfg, pluginId) {
	const actions = {
		entry: false,
		install: false,
		allowlist: false,
		loadPath: false,
		memorySlot: false
	};
	const pluginsConfig = cfg.plugins ?? {};
	let entries = pluginsConfig.entries;
	if (entries && pluginId in entries) {
		const { [pluginId]: _, ...rest } = entries;
		entries = Object.keys(rest).length > 0 ? rest : void 0;
		actions.entry = true;
	}
	let installs = pluginsConfig.installs;
	const installRecord = installs?.[pluginId];
	if (installs && pluginId in installs) {
		const { [pluginId]: _, ...rest } = installs;
		installs = Object.keys(rest).length > 0 ? rest : void 0;
		actions.install = true;
	}
	let allow = pluginsConfig.allow;
	if (Array.isArray(allow) && allow.includes(pluginId)) {
		allow = allow.filter((id) => id !== pluginId);
		if (allow.length === 0) allow = void 0;
		actions.allowlist = true;
	}
	let load = pluginsConfig.load;
	if (installRecord?.source === "path" && installRecord.sourcePath) {
		const sourcePath = installRecord.sourcePath;
		const loadPaths = load?.paths;
		if (Array.isArray(loadPaths) && loadPaths.includes(sourcePath)) {
			const nextLoadPaths = loadPaths.filter((p) => p !== sourcePath);
			load = nextLoadPaths.length > 0 ? {
				...load,
				paths: nextLoadPaths
			} : void 0;
			actions.loadPath = true;
		}
	}
	let slots = pluginsConfig.slots;
	if (slots?.memory === pluginId) {
		slots = {
			...slots,
			memory: defaultSlotIdForKey("memory")
		};
		actions.memorySlot = true;
	}
	if (slots && Object.keys(slots).length === 0) slots = void 0;
	const cleanedPlugins = {
		...pluginsConfig,
		entries,
		installs,
		allow,
		load,
		slots
	};
	if (cleanedPlugins.entries === void 0) delete cleanedPlugins.entries;
	if (cleanedPlugins.installs === void 0) delete cleanedPlugins.installs;
	if (cleanedPlugins.allow === void 0) delete cleanedPlugins.allow;
	if (cleanedPlugins.load === void 0) delete cleanedPlugins.load;
	if (cleanedPlugins.slots === void 0) delete cleanedPlugins.slots;
	return {
		config: {
			...cfg,
			plugins: Object.keys(cleanedPlugins).length > 0 ? cleanedPlugins : void 0
		},
		actions
	};
}
/**
* Uninstall a plugin by removing it from config and optionally deleting installed files.
* Linked plugins (source === "path") never have their source directory deleted.
*/
async function uninstallPlugin(params) {
	const { config, pluginId, deleteFiles = true, extensionsDir } = params;
	const hasEntry = pluginId in (config.plugins?.entries ?? {});
	const hasInstall = pluginId in (config.plugins?.installs ?? {});
	if (!hasEntry && !hasInstall) return {
		ok: false,
		error: `Plugin not found: ${pluginId}`
	};
	const installRecord = config.plugins?.installs?.[pluginId];
	const isLinked = installRecord?.source === "path";
	const { config: newConfig, actions: configActions } = removePluginFromConfig(config, pluginId);
	const actions = {
		...configActions,
		directory: false
	};
	const warnings = [];
	const deleteTarget = deleteFiles && !isLinked ? resolveUninstallDirectoryTarget({
		pluginId,
		hasInstall,
		installRecord,
		extensionsDir
	}) : null;
	if (deleteTarget) {
		const existed = await fsPromises.access(deleteTarget).then(() => true).catch(() => false) ?? false;
		try {
			await fsPromises.rm(deleteTarget, {
				recursive: true,
				force: true
			});
			actions.directory = existed;
		} catch (error) {
			warnings.push(`Failed to remove plugin directory ${deleteTarget}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	return {
		ok: true,
		config: newConfig,
		pluginId,
		actions,
		warnings
	};
}

//#endregion
//#region src/cli/plugins-cli.ts
function formatPluginLine(plugin, verbose = false) {
	const status = plugin.status === "loaded" ? theme.success("loaded") : plugin.status === "disabled" ? theme.warn("disabled") : theme.error("error");
	const name = theme.command(plugin.name || plugin.id);
	const idSuffix = plugin.name && plugin.name !== plugin.id ? theme.muted(` (${plugin.id})`) : "";
	const desc = plugin.description ? theme.muted(plugin.description.length > 60 ? `${plugin.description.slice(0, 57)}...` : plugin.description) : theme.muted("(no description)");
	if (!verbose) return `${name}${idSuffix} ${status} - ${desc}`;
	const parts = [
		`${name}${idSuffix} ${status}`,
		`  source: ${theme.muted(shortenHomeInString(plugin.source))}`,
		`  origin: ${plugin.origin}`
	];
	if (plugin.version) parts.push(`  version: ${plugin.version}`);
	if (plugin.providerIds.length > 0) parts.push(`  providers: ${plugin.providerIds.join(", ")}`);
	if (plugin.error) parts.push(theme.error(`  error: ${plugin.error}`));
	return parts.join("\n");
}
function applySlotSelectionForPlugin(config, pluginId) {
	const report = buildPluginStatusReport({ config });
	const plugin = report.plugins.find((entry) => entry.id === pluginId);
	if (!plugin) return {
		config,
		warnings: []
	};
	const result = applyExclusiveSlotSelection({
		config,
		selectedId: plugin.id,
		selectedKind: plugin.kind,
		registry: report
	});
	return {
		config: result.config,
		warnings: result.warnings
	};
}
function logSlotWarnings(warnings) {
	if (warnings.length === 0) return;
	for (const warning of warnings) defaultRuntime.log(theme.warn(warning));
}
function registerPluginsCli(program) {
	const plugins = program.command("plugins").description("Manage OpenClaw plugins/extensions").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/plugins", "docs.openclaw.ai/cli/plugins")}\n`);
	plugins.command("list").description("List discovered plugins").option("--json", "Print JSON").option("--enabled", "Only show enabled plugins", false).option("--verbose", "Show detailed entries", false).action((opts) => {
		const report = buildPluginStatusReport();
		const list = opts.enabled ? report.plugins.filter((p) => p.status === "loaded") : report.plugins;
		if (opts.json) {
			const payload = {
				workspaceDir: report.workspaceDir,
				plugins: list,
				diagnostics: report.diagnostics
			};
			defaultRuntime.log(JSON.stringify(payload, null, 2));
			return;
		}
		if (list.length === 0) {
			defaultRuntime.log(theme.muted("No plugins found."));
			return;
		}
		const loaded = list.filter((p) => p.status === "loaded").length;
		defaultRuntime.log(`${theme.heading("Plugins")} ${theme.muted(`(${loaded}/${list.length} loaded)`)}`);
		if (!opts.verbose) {
			const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
			const sourceRoots = resolvePluginSourceRoots({ workspaceDir: report.workspaceDir });
			const usedRoots = /* @__PURE__ */ new Set();
			const rows = list.map((plugin) => {
				const desc = plugin.description ? theme.muted(plugin.description) : "";
				const formattedSource = formatPluginSourceForTable(plugin, sourceRoots);
				if (formattedSource.rootKey) usedRoots.add(formattedSource.rootKey);
				const sourceLine = desc ? `${formattedSource.value}\n${desc}` : formattedSource.value;
				return {
					Name: plugin.name || plugin.id,
					ID: plugin.name && plugin.name !== plugin.id ? plugin.id : "",
					Status: plugin.status === "loaded" ? theme.success("loaded") : plugin.status === "disabled" ? theme.warn("disabled") : theme.error("error"),
					Source: sourceLine,
					Version: plugin.version ?? ""
				};
			});
			if (usedRoots.size > 0) {
				defaultRuntime.log(theme.muted("Source roots:"));
				for (const key of [
					"stock",
					"workspace",
					"global"
				]) {
					if (!usedRoots.has(key)) continue;
					const dir = sourceRoots[key];
					if (!dir) continue;
					defaultRuntime.log(`  ${theme.command(`${key}:`)} ${theme.muted(dir)}`);
				}
				defaultRuntime.log("");
			}
			defaultRuntime.log(renderTable({
				width: tableWidth,
				columns: [
					{
						key: "Name",
						header: "Name",
						minWidth: 14,
						flex: true
					},
					{
						key: "ID",
						header: "ID",
						minWidth: 10,
						flex: true
					},
					{
						key: "Status",
						header: "Status",
						minWidth: 10
					},
					{
						key: "Source",
						header: "Source",
						minWidth: 26,
						flex: true
					},
					{
						key: "Version",
						header: "Version",
						minWidth: 8
					}
				],
				rows
			}).trimEnd());
			return;
		}
		const lines = [];
		for (const plugin of list) {
			lines.push(formatPluginLine(plugin, true));
			lines.push("");
		}
		defaultRuntime.log(lines.join("\n").trim());
	});
	plugins.command("info").description("Show plugin details").argument("<id>", "Plugin id").option("--json", "Print JSON").action((id, opts) => {
		const plugin = buildPluginStatusReport().plugins.find((p) => p.id === id || p.name === id);
		if (!plugin) {
			defaultRuntime.error(`Plugin not found: ${id}`);
			process.exit(1);
		}
		const install = loadConfig().plugins?.installs?.[plugin.id];
		if (opts.json) {
			defaultRuntime.log(JSON.stringify(plugin, null, 2));
			return;
		}
		const lines = [];
		lines.push(theme.heading(plugin.name || plugin.id));
		if (plugin.name && plugin.name !== plugin.id) lines.push(theme.muted(`id: ${plugin.id}`));
		if (plugin.description) lines.push(plugin.description);
		lines.push("");
		lines.push(`${theme.muted("Status:")} ${plugin.status}`);
		lines.push(`${theme.muted("Source:")} ${shortenHomeInString(plugin.source)}`);
		lines.push(`${theme.muted("Origin:")} ${plugin.origin}`);
		if (plugin.version) lines.push(`${theme.muted("Version:")} ${plugin.version}`);
		if (plugin.toolNames.length > 0) lines.push(`${theme.muted("Tools:")} ${plugin.toolNames.join(", ")}`);
		if (plugin.hookNames.length > 0) lines.push(`${theme.muted("Hooks:")} ${plugin.hookNames.join(", ")}`);
		if (plugin.gatewayMethods.length > 0) lines.push(`${theme.muted("Gateway methods:")} ${plugin.gatewayMethods.join(", ")}`);
		if (plugin.providerIds.length > 0) lines.push(`${theme.muted("Providers:")} ${plugin.providerIds.join(", ")}`);
		if (plugin.cliCommands.length > 0) lines.push(`${theme.muted("CLI commands:")} ${plugin.cliCommands.join(", ")}`);
		if (plugin.services.length > 0) lines.push(`${theme.muted("Services:")} ${plugin.services.join(", ")}`);
		if (plugin.error) lines.push(`${theme.error("Error:")} ${plugin.error}`);
		if (install) {
			lines.push("");
			lines.push(`${theme.muted("Install:")} ${install.source}`);
			if (install.spec) lines.push(`${theme.muted("Spec:")} ${install.spec}`);
			if (install.sourcePath) lines.push(`${theme.muted("Source path:")} ${shortenHomePath(install.sourcePath)}`);
			if (install.installPath) lines.push(`${theme.muted("Install path:")} ${shortenHomePath(install.installPath)}`);
			if (install.version) lines.push(`${theme.muted("Recorded version:")} ${install.version}`);
			if (install.installedAt) lines.push(`${theme.muted("Installed at:")} ${install.installedAt}`);
		}
		defaultRuntime.log(lines.join("\n"));
	});
	plugins.command("enable").description("Enable a plugin in config").argument("<id>", "Plugin id").action(async (id) => {
		const cfg = loadConfig();
		let next = {
			...cfg,
			plugins: {
				...cfg.plugins,
				entries: {
					...cfg.plugins?.entries,
					[id]: {
						...(cfg.plugins?.entries)?.[id],
						enabled: true
					}
				}
			}
		};
		const slotResult = applySlotSelectionForPlugin(next, id);
		next = slotResult.config;
		await writeConfigFile(next);
		logSlotWarnings(slotResult.warnings);
		defaultRuntime.log(`Enabled plugin "${id}". Restart the gateway to apply.`);
	});
	plugins.command("disable").description("Disable a plugin in config").argument("<id>", "Plugin id").action(async (id) => {
		const cfg = loadConfig();
		await writeConfigFile({
			...cfg,
			plugins: {
				...cfg.plugins,
				entries: {
					...cfg.plugins?.entries,
					[id]: {
						...(cfg.plugins?.entries)?.[id],
						enabled: false
					}
				}
			}
		});
		defaultRuntime.log(`Disabled plugin "${id}". Restart the gateway to apply.`);
	});
	plugins.command("uninstall").description("Uninstall a plugin").argument("<id>", "Plugin id").option("--keep-files", "Keep installed files on disk", false).option("--keep-config", "Deprecated alias for --keep-files", false).option("--force", "Skip confirmation prompt", false).option("--dry-run", "Show what would be removed without making changes", false).action(async (id, opts) => {
		const cfg = loadConfig();
		const report = buildPluginStatusReport({ config: cfg });
		const extensionsDir = path.join(resolveStateDir(process.env, os.homedir), "extensions");
		const keepFiles = Boolean(opts.keepFiles || opts.keepConfig);
		if (opts.keepConfig) defaultRuntime.log(theme.warn("`--keep-config` is deprecated, use `--keep-files`."));
		const plugin = report.plugins.find((p) => p.id === id || p.name === id);
		const pluginId = plugin?.id ?? id;
		const hasEntry = pluginId in (cfg.plugins?.entries ?? {});
		const hasInstall = pluginId in (cfg.plugins?.installs ?? {});
		if (!hasEntry && !hasInstall) {
			if (plugin) defaultRuntime.error(`Plugin "${pluginId}" is not managed by plugins config/install records and cannot be uninstalled.`);
			else defaultRuntime.error(`Plugin not found: ${id}`);
			process.exit(1);
		}
		const install = cfg.plugins?.installs?.[pluginId];
		const isLinked = install?.source === "path";
		const preview = [];
		if (hasEntry) preview.push("config entry");
		if (hasInstall) preview.push("install record");
		if (cfg.plugins?.allow?.includes(pluginId)) preview.push("allowlist entry");
		if (isLinked && install?.sourcePath && cfg.plugins?.load?.paths?.includes(install.sourcePath)) preview.push("load path");
		if (cfg.plugins?.slots?.memory === pluginId) preview.push(`memory slot (will reset to "memory-core")`);
		const deleteTarget = !keepFiles ? resolveUninstallDirectoryTarget({
			pluginId,
			hasInstall,
			installRecord: install,
			extensionsDir
		}) : null;
		if (deleteTarget) preview.push(`directory: ${shortenHomePath(deleteTarget)}`);
		const pluginName = plugin?.name || pluginId;
		defaultRuntime.log(`Plugin: ${theme.command(pluginName)}${pluginName !== pluginId ? theme.muted(` (${pluginId})`) : ""}`);
		defaultRuntime.log(`Will remove: ${preview.length > 0 ? preview.join(", ") : "(nothing)"}`);
		if (opts.dryRun) {
			defaultRuntime.log(theme.muted("Dry run, no changes made."));
			return;
		}
		if (!opts.force) {
			if (!await promptYesNo(`Uninstall plugin "${pluginId}"?`)) {
				defaultRuntime.log("Cancelled.");
				return;
			}
		}
		const result = await uninstallPlugin({
			config: cfg,
			pluginId,
			deleteFiles: !keepFiles,
			extensionsDir
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			process.exit(1);
		}
		for (const warning of result.warnings) defaultRuntime.log(theme.warn(warning));
		await writeConfigFile(result.config);
		const removed = [];
		if (result.actions.entry) removed.push("config entry");
		if (result.actions.install) removed.push("install record");
		if (result.actions.allowlist) removed.push("allowlist");
		if (result.actions.loadPath) removed.push("load path");
		if (result.actions.memorySlot) removed.push("memory slot");
		if (result.actions.directory) removed.push("directory");
		defaultRuntime.log(`Uninstalled plugin "${pluginId}". Removed: ${removed.length > 0 ? removed.join(", ") : "nothing"}.`);
		defaultRuntime.log("Restart the gateway to apply changes.");
	});
	plugins.command("install").description("Install a plugin (path, archive, or npm spec)").argument("<path-or-spec>", "Path (.ts/.js/.zip/.tgz/.tar.gz) or an npm package spec").option("-l, --link", "Link a local path instead of copying", false).action(async (raw, opts) => {
		const resolved = resolveUserPath(raw);
		const cfg = loadConfig();
		if (fs.existsSync(resolved)) {
			if (opts.link) {
				const existing = cfg.plugins?.load?.paths ?? [];
				const merged = Array.from(new Set([...existing, resolved]));
				const probe = await installPluginFromPath({
					path: resolved,
					dryRun: true
				});
				if (!probe.ok) {
					defaultRuntime.error(probe.error);
					process.exit(1);
				}
				let next = {
					...cfg,
					plugins: {
						...cfg.plugins,
						load: {
							...cfg.plugins?.load,
							paths: merged
						},
						entries: {
							...cfg.plugins?.entries,
							[probe.pluginId]: {
								...cfg.plugins?.entries?.[probe.pluginId],
								enabled: true
							}
						}
					}
				};
				next = recordPluginInstall(next, {
					pluginId: probe.pluginId,
					source: "path",
					sourcePath: resolved,
					installPath: resolved,
					version: probe.version
				});
				const slotResult = applySlotSelectionForPlugin(next, probe.pluginId);
				next = slotResult.config;
				await writeConfigFile(next);
				logSlotWarnings(slotResult.warnings);
				defaultRuntime.log(`Linked plugin path: ${shortenHomePath(resolved)}`);
				defaultRuntime.log(`Restart the gateway to load plugins.`);
				return;
			}
			const result = await installPluginFromPath({
				path: resolved,
				logger: {
					info: (msg) => defaultRuntime.log(msg),
					warn: (msg) => defaultRuntime.log(theme.warn(msg))
				}
			});
			if (!result.ok) {
				defaultRuntime.error(result.error);
				process.exit(1);
			}
			let next = {
				...cfg,
				plugins: {
					...cfg.plugins,
					entries: {
						...cfg.plugins?.entries,
						[result.pluginId]: {
							...cfg.plugins?.entries?.[result.pluginId],
							enabled: true
						}
					}
				}
			};
			const source = resolveArchiveKind(resolved) ? "archive" : "path";
			next = recordPluginInstall(next, {
				pluginId: result.pluginId,
				source,
				sourcePath: resolved,
				installPath: result.targetDir,
				version: result.version
			});
			const slotResult = applySlotSelectionForPlugin(next, result.pluginId);
			next = slotResult.config;
			await writeConfigFile(next);
			logSlotWarnings(slotResult.warnings);
			defaultRuntime.log(`Installed plugin: ${result.pluginId}`);
			defaultRuntime.log(`Restart the gateway to load plugins.`);
			return;
		}
		if (opts.link) {
			defaultRuntime.error("`--link` requires a local path.");
			process.exit(1);
		}
		if (raw.startsWith(".") || raw.startsWith("~") || path.isAbsolute(raw) || raw.endsWith(".ts") || raw.endsWith(".js") || raw.endsWith(".mjs") || raw.endsWith(".cjs") || raw.endsWith(".tgz") || raw.endsWith(".tar.gz") || raw.endsWith(".tar") || raw.endsWith(".zip")) {
			defaultRuntime.error(`Path not found: ${resolved}`);
			process.exit(1);
		}
		const result = await installPluginFromNpmSpec({
			spec: raw,
			logger: {
				info: (msg) => defaultRuntime.log(msg),
				warn: (msg) => defaultRuntime.log(theme.warn(msg))
			}
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			process.exit(1);
		}
		let next = {
			...cfg,
			plugins: {
				...cfg.plugins,
				entries: {
					...cfg.plugins?.entries,
					[result.pluginId]: {
						...cfg.plugins?.entries?.[result.pluginId],
						enabled: true
					}
				}
			}
		};
		next = recordPluginInstall(next, {
			pluginId: result.pluginId,
			source: "npm",
			spec: raw,
			installPath: result.targetDir,
			version: result.version
		});
		const slotResult = applySlotSelectionForPlugin(next, result.pluginId);
		next = slotResult.config;
		await writeConfigFile(next);
		logSlotWarnings(slotResult.warnings);
		defaultRuntime.log(`Installed plugin: ${result.pluginId}`);
		defaultRuntime.log(`Restart the gateway to load plugins.`);
	});
	plugins.command("update").description("Update installed plugins (npm installs only)").argument("[id]", "Plugin id (omit with --all)").option("--all", "Update all tracked plugins", false).option("--dry-run", "Show what would change without writing", false).action(async (id, opts) => {
		const cfg = loadConfig();
		const installs = cfg.plugins?.installs ?? {};
		const targets = opts.all ? Object.keys(installs) : id ? [id] : [];
		if (targets.length === 0) {
			if (opts.all) {
				defaultRuntime.log("No npm-installed plugins to update.");
				return;
			}
			defaultRuntime.error("Provide a plugin id or use --all.");
			process.exit(1);
		}
		const result = await updateNpmInstalledPlugins({
			config: cfg,
			pluginIds: targets,
			dryRun: opts.dryRun,
			logger: {
				info: (msg) => defaultRuntime.log(msg),
				warn: (msg) => defaultRuntime.log(theme.warn(msg))
			}
		});
		for (const outcome of result.outcomes) {
			if (outcome.status === "error") {
				defaultRuntime.log(theme.error(outcome.message));
				continue;
			}
			if (outcome.status === "skipped") {
				defaultRuntime.log(theme.warn(outcome.message));
				continue;
			}
			defaultRuntime.log(outcome.message);
		}
		if (!opts.dryRun && result.changed) {
			await writeConfigFile(result.config);
			defaultRuntime.log("Restart the gateway to load plugins.");
		}
	});
	plugins.command("doctor").description("Report plugin load issues").action(() => {
		const report = buildPluginStatusReport();
		const errors = report.plugins.filter((p) => p.status === "error");
		const diags = report.diagnostics.filter((d) => d.level === "error");
		if (errors.length === 0 && diags.length === 0) {
			defaultRuntime.log("No plugin issues detected.");
			return;
		}
		const lines = [];
		if (errors.length > 0) {
			lines.push(theme.error("Plugin errors:"));
			for (const entry of errors) lines.push(`- ${entry.id}: ${entry.error ?? "failed to load"} (${entry.source})`);
		}
		if (diags.length > 0) {
			if (lines.length > 0) lines.push("");
			lines.push(theme.warn("Diagnostics:"));
			for (const diag of diags) {
				const target = diag.pluginId ? `${diag.pluginId}: ` : "";
				lines.push(`- ${target}${diag.message}`);
			}
		}
		const docs = formatDocsLink("/plugin", "docs.openclaw.ai/plugin");
		lines.push("");
		lines.push(`${theme.muted("Docs:")} ${docs}`);
		defaultRuntime.log(lines.join("\n"));
	});
}

//#endregion
export { registerPluginsCli };