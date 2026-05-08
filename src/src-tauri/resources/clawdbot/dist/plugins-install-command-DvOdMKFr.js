import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { r as theme } from "./theme-B128avno.js";
import { g as shortenHomePath } from "./utils-DvkbxKCZ.js";
import { n as defaultRuntime } from "./runtime-izpjJukX.js";
import { u as readConfigFileSnapshot } from "./io-CFdEhZuM.js";
import { n as clearPluginManifestRegistryCache } from "./manifest-registry-CXpW6f0a.js";
import { f as resolveArchiveKind } from "./archive-CsgTa6c_.js";
import { t as validateJsonSchemaValue } from "./schema-validator-CY2IX5dY.js";
import "./config--k_1dtUP.js";
import { a as resolveDefaultPluginExtensionsDir, i as installPluginFromPath, r as installPluginFromNpmSpec, t as PLUGIN_INSTALL_ERROR_CODE } from "./install-BrXYq_UK.js";
import { t as findBundledPluginSource } from "./bundled-sources-CqkGtVM8.js";
import { i as resolvePinnedNpmInstallRecordForCli, n as persistPluginInstall, t as persistHookPackInstall } from "./plugins-install-persist-CGROasl4.js";
import { t as parseClawHubPluginSpec } from "./clawhub-spec-Bq7_dhr9.js";
import "./clawhub-CGP935vu.js";
import { n as installPluginFromClawHub } from "./clawhub-BQekueYp.js";
import { a as createPluginInstallLogger, c as formatPluginInstallWithHookFallbackError, d as parseNpmPrefixSpec, i as createHookPackInstallLogger, o as decidePreferredClawHubFallback, r as buildPreferredClawHubSpec } from "./plugins-command-helpers--nexq2_8.js";
import { r as resolveBundledInstallPlanForNpmFailure, t as resolveBundledInstallPlanBeforeNpm } from "./plugin-install-plan-iAiXlNqM.js";
import { o as collectChannelDoctorStaleConfigMutations } from "./channel-doctor-D3hwC4Yh.js";
import { n as installHooksFromPath, t as installHooksFromNpmSpec } from "./install-D-M7yaBy.js";
import { r as resolveMarketplaceInstallShortcut, t as installPluginFromMarketplace } from "./marketplace-Q_gOHJ1-.js";
import { r as resolvePluginInstallRequestContext, t as resolvePluginInstallInvalidConfigPolicy } from "./plugin-install-config-policy-BewKHRqc.js";
import fs from "node:fs";
import path from "node:path";
//#region src/cli/install-spec.ts
function looksLikeLocalInstallSpec(spec, knownSuffixes) {
	return spec.startsWith(".") || spec.startsWith("~") || path.isAbsolute(spec) || knownSuffixes.some((suffix) => spec.endsWith(suffix));
}
//#endregion
//#region src/cli/plugins-install-command.ts
function resolveInstallMode(force) {
	return force ? "update" : "install";
}
function resolveInstallSafetyOverrides(overrides) {
	return { dangerouslyForceUnsafeInstall: overrides.dangerouslyForceUnsafeInstall };
}
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function isEmptyRecord(value) {
	return Object.keys(value).length === 0;
}
function hasValidBundledPluginConfig(params) {
	if (!params.bundledSource.requiresConfig) return true;
	if (!isRecord(params.existingEntry)) return false;
	const config = params.existingEntry.config;
	if (!isRecord(config)) return false;
	if (!params.bundledSource.configSchema) return !isEmptyRecord(config);
	return validateJsonSchemaValue({
		schema: params.bundledSource.configSchema,
		cacheKey: `bundled-install:${params.bundledSource.pluginId}`,
		value: config,
		applyDefaults: true
	}).ok;
}
function prepareConfigForDisabledBundledInstall(config, pluginId) {
	const { [pluginId]: _removedEntry, ...nextEntries } = config.plugins?.entries ?? {};
	return {
		...config,
		plugins: {
			...config.plugins,
			entries: nextEntries
		}
	};
}
async function installBundledPluginSource(params) {
	const existing = params.snapshot.config.plugins?.load?.paths ?? [];
	const mergedPaths = Array.from(new Set([...existing, params.bundledSource.localPath]));
	const existingEntry = params.snapshot.config.plugins?.entries?.[params.bundledSource.pluginId];
	const shouldEnable = hasValidBundledPluginConfig({
		bundledSource: params.bundledSource,
		existingEntry
	});
	const configBase = shouldEnable ? params.snapshot.config : prepareConfigForDisabledBundledInstall(params.snapshot.config, params.bundledSource.pluginId);
	const configWarning = shouldEnable ? "" : `Installed bundled plugin "${params.bundledSource.pluginId}" without enabling it because it requires configuration first. Configure it, then run \`openclaw plugins enable ${params.bundledSource.pluginId}\`.`;
	await persistPluginInstall({
		snapshot: {
			config: {
				...configBase,
				plugins: {
					...configBase.plugins,
					load: {
						...configBase.plugins?.load,
						paths: mergedPaths
					}
				}
			},
			baseHash: params.snapshot.baseHash
		},
		pluginId: params.bundledSource.pluginId,
		install: {
			source: "path",
			spec: params.rawSpec,
			sourcePath: params.bundledSource.localPath,
			installPath: params.bundledSource.localPath
		},
		enable: shouldEnable,
		warningMessage: [params.warning, configWarning].filter(Boolean).join("\n")
	});
}
async function tryInstallHookPackFromLocalPath(params) {
	if (params.link) {
		if (!fs.statSync(params.resolvedPath).isDirectory()) return {
			ok: false,
			error: "Linked hook pack paths must be directories."
		};
		const probe = await installHooksFromPath({
			...resolveInstallSafetyOverrides(params.safetyOverrides ?? {}),
			path: params.resolvedPath,
			dryRun: true
		});
		if (!probe.ok) return probe;
		const existing = params.snapshot.config.hooks?.internal?.load?.extraDirs ?? [];
		const merged = Array.from(new Set([...existing, params.resolvedPath]));
		await persistHookPackInstall({
			snapshot: {
				config: {
					...params.snapshot.config,
					hooks: {
						...params.snapshot.config.hooks,
						internal: {
							...params.snapshot.config.hooks?.internal,
							enabled: true,
							load: {
								...params.snapshot.config.hooks?.internal?.load,
								extraDirs: merged
							}
						}
					}
				},
				baseHash: params.snapshot.baseHash
			},
			hookPackId: probe.hookPackId,
			hooks: probe.hooks,
			install: {
				source: "path",
				sourcePath: params.resolvedPath,
				installPath: params.resolvedPath,
				version: probe.version
			},
			successMessage: `Linked hook pack path: ${shortenHomePath(params.resolvedPath)}`
		});
		return { ok: true };
	}
	const result = await installHooksFromPath({
		...resolveInstallSafetyOverrides(params.safetyOverrides ?? {}),
		path: params.resolvedPath,
		mode: params.installMode,
		logger: createHookPackInstallLogger()
	});
	if (!result.ok) return result;
	const source = resolveArchiveKind(params.resolvedPath) ? "archive" : "path";
	await persistHookPackInstall({
		snapshot: params.snapshot,
		hookPackId: result.hookPackId,
		hooks: result.hooks,
		install: {
			source,
			sourcePath: params.resolvedPath,
			installPath: result.targetDir,
			version: result.version
		}
	});
	return { ok: true };
}
async function tryInstallHookPackFromNpmSpec(params) {
	const result = await installHooksFromNpmSpec({
		spec: params.spec,
		mode: params.installMode,
		logger: createHookPackInstallLogger()
	});
	if (!result.ok) return result;
	const installRecord = resolvePinnedNpmInstallRecordForCli(params.spec, Boolean(params.pin), result.targetDir, result.version, result.npmResolution, defaultRuntime.log, theme.warn);
	await persistHookPackInstall({
		snapshot: params.snapshot,
		hookPackId: result.hookPackId,
		hooks: result.hooks,
		install: installRecord
	});
	return { ok: true };
}
async function tryInstallPluginOrHookPackFromNpmSpec(params) {
	const result = await installPluginFromNpmSpec({
		...params.safetyOverrides,
		mode: params.installMode,
		spec: params.spec,
		extensionsDir: params.extensionsDir,
		logger: createPluginInstallLogger()
	});
	if (!result.ok) {
		if (isTerminalPluginInstallSecurityFailure(result.code)) {
			defaultRuntime.error(result.error);
			return { ok: false };
		}
		if (params.allowBundledFallback) {
			const bundledFallbackPlan = resolveBundledInstallPlanForNpmFailure({
				rawSpec: params.spec,
				code: result.code,
				findBundledSource: (lookup) => findBundledPluginSource({ lookup })
			});
			if (bundledFallbackPlan) {
				await installBundledPluginSource({
					snapshot: params.snapshot,
					rawSpec: params.spec,
					bundledSource: bundledFallbackPlan.bundledSource,
					warning: bundledFallbackPlan.warning
				});
				return { ok: true };
			}
		}
		const hookFallback = await tryInstallHookPackFromNpmSpec({
			snapshot: params.snapshot,
			installMode: params.installMode,
			spec: params.spec,
			pin: params.pin
		});
		if (hookFallback.ok) return { ok: true };
		defaultRuntime.error(formatPluginInstallWithHookFallbackError(result.error, hookFallback.error));
		return { ok: false };
	}
	clearPluginManifestRegistryCache();
	const installRecord = resolvePinnedNpmInstallRecordForCli(params.spec, Boolean(params.pin), result.targetDir, result.version, result.npmResolution, defaultRuntime.log, theme.warn);
	await persistPluginInstall({
		snapshot: params.snapshot,
		pluginId: result.pluginId,
		install: installRecord
	});
	return { ok: true };
}
function isTerminalPluginInstallSecurityFailure(code) {
	return code === PLUGIN_INSTALL_ERROR_CODE.SECURITY_SCAN_BLOCKED || code === PLUGIN_INSTALL_ERROR_CODE.SECURITY_SCAN_FAILED;
}
function isAllowedBundledRecoveryIssue(issue, request) {
	const pluginId = request.bundledPluginId?.trim();
	if (!pluginId) return false;
	return issue.path === `channels.${pluginId}` && issue.message === `unknown channel id: ${pluginId}` || issue.path === "plugins.load.paths" && typeof issue.message === "string" && issue.message.includes("plugin path not found");
}
function buildInvalidPluginInstallConfigError(message) {
	const error = new Error(message);
	error.code = "INVALID_CONFIG";
	return error;
}
async function loadConfigFromSnapshotForInstall(request, snapshot) {
	if (resolvePluginInstallInvalidConfigPolicy(request) !== "allow-bundled-recovery") throw buildInvalidPluginInstallConfigError("Config invalid; run `openclaw doctor --fix` before installing plugins.");
	const parsed = snapshot.parsed ?? {};
	if (!snapshot.exists || Object.keys(parsed).length === 0) throw buildInvalidPluginInstallConfigError("Config file could not be parsed; run `openclaw doctor` to repair it.");
	if (snapshot.legacyIssues.length > 0 || snapshot.issues.length === 0 || snapshot.issues.some((issue) => !isAllowedBundledRecoveryIssue(issue, request))) throw buildInvalidPluginInstallConfigError(`Config invalid outside the bundled recovery path for ${request.bundledPluginId ?? "the requested plugin"}; run \`openclaw doctor --fix\` before reinstalling it.`);
	let nextConfig = snapshot.config;
	for (const mutation of await collectChannelDoctorStaleConfigMutations(snapshot.config, { env: process.env })) nextConfig = mutation.config;
	return {
		config: nextConfig,
		baseHash: snapshot.hash
	};
}
async function loadConfigForInstall(request) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.valid) return {
		config: snapshot.sourceConfig,
		baseHash: snapshot.hash
	};
	return loadConfigFromSnapshotForInstall(request, snapshot);
}
async function runPluginInstallCommand(params) {
	const shorthand = !params.opts.marketplace ? await resolveMarketplaceInstallShortcut(params.raw) : null;
	if (shorthand?.ok === false) {
		defaultRuntime.error(shorthand.error);
		return defaultRuntime.exit(1);
	}
	const raw = shorthand?.ok ? shorthand.plugin : params.raw;
	const opts = {
		...params.opts,
		marketplace: params.opts.marketplace ?? (shorthand?.ok ? shorthand.marketplaceSource : void 0)
	};
	if (opts.marketplace) {
		if (opts.link) {
			defaultRuntime.error("`--link` is not supported with `--marketplace`.");
			return defaultRuntime.exit(1);
		}
		if (opts.pin) {
			defaultRuntime.error("`--pin` is not supported with `--marketplace`.");
			return defaultRuntime.exit(1);
		}
	}
	if (opts.link && opts.force) {
		defaultRuntime.error("`--force` is not supported with `--link`.");
		return defaultRuntime.exit(1);
	}
	const requestResolution = resolvePluginInstallRequestContext({
		rawSpec: raw,
		marketplace: opts.marketplace
	});
	if (!requestResolution.ok) {
		defaultRuntime.error(requestResolution.error);
		return defaultRuntime.exit(1);
	}
	const request = requestResolution.request;
	const snapshot = await loadConfigForInstall(request).catch((error) => {
		defaultRuntime.error(formatErrorMessage(error));
		return null;
	});
	if (!snapshot) return defaultRuntime.exit(1);
	const cfg = snapshot.config;
	const installMode = resolveInstallMode(opts.force);
	const safetyOverrides = resolveInstallSafetyOverrides(opts);
	const extensionsDir = resolveDefaultPluginExtensionsDir();
	if (opts.marketplace) {
		const result = await installPluginFromMarketplace({
			...safetyOverrides,
			marketplace: opts.marketplace,
			mode: installMode,
			plugin: raw,
			extensionsDir,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			return defaultRuntime.exit(1);
		}
		clearPluginManifestRegistryCache();
		await persistPluginInstall({
			snapshot,
			pluginId: result.pluginId,
			install: {
				source: "marketplace",
				installPath: result.targetDir,
				version: result.version,
				marketplaceName: result.marketplaceName,
				marketplaceSource: result.marketplaceSource,
				marketplacePlugin: result.marketplacePlugin
			}
		});
		return;
	}
	const resolved = request.resolvedPath ?? request.normalizedSpec;
	if (fs.existsSync(resolved)) {
		if (opts.link) {
			const existing = cfg.plugins?.load?.paths ?? [];
			const merged = Array.from(new Set([...existing, resolved]));
			const probe = await installPluginFromPath({
				...safetyOverrides,
				mode: installMode,
				path: resolved,
				dryRun: true,
				extensionsDir,
				logger: createPluginInstallLogger()
			});
			if (!probe.ok) {
				if (isTerminalPluginInstallSecurityFailure(probe.code)) {
					defaultRuntime.error(probe.error);
					return defaultRuntime.exit(1);
				}
				const hookFallback = await tryInstallHookPackFromLocalPath({
					snapshot,
					installMode,
					resolvedPath: resolved,
					safetyOverrides,
					link: true
				});
				if (hookFallback.ok) return;
				defaultRuntime.error(formatPluginInstallWithHookFallbackError(probe.error, hookFallback.error));
				return defaultRuntime.exit(1);
			}
			await persistPluginInstall({
				snapshot: {
					config: {
						...cfg,
						plugins: {
							...cfg.plugins,
							load: {
								...cfg.plugins?.load,
								paths: merged
							}
						}
					},
					baseHash: snapshot.baseHash
				},
				pluginId: probe.pluginId,
				install: {
					source: "path",
					sourcePath: resolved,
					installPath: resolved,
					version: probe.version
				},
				successMessage: `Linked plugin path: ${shortenHomePath(resolved)}`
			});
			return;
		}
		const result = await installPluginFromPath({
			...safetyOverrides,
			mode: installMode,
			path: resolved,
			extensionsDir,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) {
			if (isTerminalPluginInstallSecurityFailure(result.code)) {
				defaultRuntime.error(result.error);
				return defaultRuntime.exit(1);
			}
			const hookFallback = await tryInstallHookPackFromLocalPath({
				snapshot,
				installMode,
				resolvedPath: resolved,
				safetyOverrides
			});
			if (hookFallback.ok) return;
			defaultRuntime.error(formatPluginInstallWithHookFallbackError(result.error, hookFallback.error));
			return defaultRuntime.exit(1);
		}
		clearPluginManifestRegistryCache();
		const source = resolveArchiveKind(resolved) ? "archive" : "path";
		await persistPluginInstall({
			snapshot,
			pluginId: result.pluginId,
			install: {
				source,
				sourcePath: resolved,
				installPath: result.targetDir,
				version: result.version
			}
		});
		return;
	}
	if (opts.link) {
		defaultRuntime.error("`--link` requires a local path.");
		return defaultRuntime.exit(1);
	}
	const npmPrefixSpec = parseNpmPrefixSpec(raw);
	if (npmPrefixSpec !== null) {
		if (!npmPrefixSpec) {
			defaultRuntime.error("unsupported npm: spec: missing package");
			return defaultRuntime.exit(1);
		}
		if (!(await tryInstallPluginOrHookPackFromNpmSpec({
			snapshot,
			installMode,
			spec: npmPrefixSpec,
			pin: opts.pin,
			safetyOverrides,
			allowBundledFallback: false,
			extensionsDir
		})).ok) return defaultRuntime.exit(1);
		return;
	}
	if (looksLikeLocalInstallSpec(raw, [
		".ts",
		".js",
		".mjs",
		".cjs",
		".tgz",
		".tar.gz",
		".tar",
		".zip"
	])) {
		defaultRuntime.error(`Path not found: ${resolved}`);
		return defaultRuntime.exit(1);
	}
	const bundledPreNpmPlan = resolveBundledInstallPlanBeforeNpm({
		rawSpec: raw,
		findBundledSource: (lookup) => findBundledPluginSource({ lookup })
	});
	if (bundledPreNpmPlan) {
		await installBundledPluginSource({
			snapshot,
			rawSpec: raw,
			bundledSource: bundledPreNpmPlan.bundledSource,
			warning: bundledPreNpmPlan.warning
		});
		return;
	}
	if (parseClawHubPluginSpec(raw)) {
		const result = await installPluginFromClawHub({
			...safetyOverrides,
			mode: installMode,
			spec: raw,
			extensionsDir,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			return defaultRuntime.exit(1);
		}
		clearPluginManifestRegistryCache();
		await persistPluginInstall({
			snapshot,
			pluginId: result.pluginId,
			install: {
				source: "clawhub",
				spec: raw,
				installPath: result.targetDir,
				version: result.version,
				integrity: result.clawhub.integrity,
				resolvedAt: result.clawhub.resolvedAt,
				clawhubUrl: result.clawhub.clawhubUrl,
				clawhubPackage: result.clawhub.clawhubPackage,
				clawhubFamily: result.clawhub.clawhubFamily,
				clawhubChannel: result.clawhub.clawhubChannel
			}
		});
		return;
	}
	const preferredClawHubSpec = buildPreferredClawHubSpec(raw);
	if (preferredClawHubSpec) {
		const clawhubResult = await installPluginFromClawHub({
			...safetyOverrides,
			mode: installMode,
			spec: preferredClawHubSpec,
			extensionsDir,
			logger: createPluginInstallLogger()
		});
		if (clawhubResult.ok) {
			clearPluginManifestRegistryCache();
			await persistPluginInstall({
				snapshot,
				pluginId: clawhubResult.pluginId,
				install: {
					source: "clawhub",
					spec: preferredClawHubSpec,
					installPath: clawhubResult.targetDir,
					version: clawhubResult.version,
					integrity: clawhubResult.clawhub.integrity,
					resolvedAt: clawhubResult.clawhub.resolvedAt,
					clawhubUrl: clawhubResult.clawhub.clawhubUrl,
					clawhubPackage: clawhubResult.clawhub.clawhubPackage,
					clawhubFamily: clawhubResult.clawhub.clawhubFamily,
					clawhubChannel: clawhubResult.clawhub.clawhubChannel
				}
			});
			return;
		}
		if (decidePreferredClawHubFallback(clawhubResult) !== "fallback_to_npm") {
			defaultRuntime.error(clawhubResult.error);
			return defaultRuntime.exit(1);
		}
	}
	if (!(await tryInstallPluginOrHookPackFromNpmSpec({
		snapshot,
		installMode,
		spec: raw,
		pin: opts.pin,
		safetyOverrides,
		allowBundledFallback: true,
		extensionsDir
	})).ok) return defaultRuntime.exit(1);
}
//#endregion
export { runPluginInstallCommand as n, loadConfigForInstall as t };
