import { i as formatErrorMessage, r as extractErrorCode } from "./errors-D8p6rxH8.js";
import { _ as shortenHomePath, m as resolveUserPath, t as CONFIG_DIR } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { t as promptYesNo } from "./prompt-B7xbaEu3.js";
import { n as MANIFEST_KEY } from "./legacy-names-C9DuzOy_.js";
import { a as loadConfig, l as readConfigFileSnapshot } from "./io-5pxHCi7V.js";
import { a as clearPluginManifestRegistryCache } from "./manifest-registry-Bd3A4lqx.js";
import { r as replaceConfigFile } from "./config-Q9XZc_2I.js";
import { r as parseRegistryNpmSpec } from "./npm-registry-spec-DAd5Xcsy.js";
import { o as unscopedPackageName, r as resolveSafeInstallDir } from "./install-safe-path-T8fz8O29.js";
import { i as installPluginFromPath, r as installPluginFromNpmSpec, t as PLUGIN_INSTALL_ERROR_CODE } from "./install-CFYMfNJH.js";
import { l as resolveArchiveKind } from "./archive-ZLnFzXpc.js";
import { t as parseFrontmatter } from "./frontmatter-BNHvzv38.js";
import { t as findBundledPluginSource } from "./bundled-sources-BvJsgWU4.js";
import { a as resolvePinnedNpmInstallRecordForCli, n as persistPluginInstall, r as recordHookInstall, t as persistHookPackInstall } from "./plugins-install-persist-CXdOkX08.js";
import { m as parseClawHubPluginSpec } from "./clawhub-C1bALXwq.js";
import { n as formatClawHubSpecifier, r as installPluginFromClawHub } from "./clawhub-DAOMs4kO.js";
import { a as decidePreferredClawHubFallback, d as extractInstalledNpmHookPackageName, f as extractInstalledNpmPackageName, i as createPluginInstallLogger, n as buildPreferredClawHubSpec, r as createHookPackInstallLogger, s as formatPluginInstallWithHookFallbackError } from "./plugins-command-helpers-DeoNpLjg.js";
import { r as resolveBundledInstallPlanForNpmFailure, t as resolveBundledInstallPlanBeforeNpm } from "./plugin-install-plan-BGiWDXK8.js";
import { o as collectChannelDoctorStaleConfigMutations } from "./channel-doctor-B1lIzbaP.js";
import { a as resolveMarketplaceInstallShortcut, n as updateNpmInstalledPlugins, r as installPluginFromMarketplace } from "./update-nL01l-yw.js";
import { r as resolvePluginInstallRequestContext, t as resolvePluginInstallInvalidConfigPolicy } from "./plugin-install-config-policy-CcC_76Uj.js";
import { n as readInstalledPackageVersion, t as expectedIntegrityForUpdate } from "./package-update-utils-Dwl4Go6_.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
//#region src/hooks/install.ts
let hookInstallRuntimePromise;
async function loadHookInstallRuntime() {
	hookInstallRuntimePromise ??= import("./install.runtime-Q0PBeOlK.js");
	return hookInstallRuntimePromise;
}
const defaultLogger = {};
function buildHookInstallForwardParams(params) {
	return {
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		hooksDir: params.hooksDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	};
}
function validateHookId(hookId) {
	if (!hookId) return "invalid hook name: missing";
	if (hookId === "." || hookId === "..") return "invalid hook name: reserved path segment";
	if (hookId.includes("/") || hookId.includes("\\")) return "invalid hook name: path separators not allowed";
	return null;
}
function resolveHookInstallDir(hookId, hooksDir) {
	const hooksBase = hooksDir ? resolveUserPath(hooksDir) : path.join(CONFIG_DIR, "hooks");
	const hookIdError = validateHookId(hookId);
	if (hookIdError) throw new Error(hookIdError);
	const targetDirResult = resolveSafeInstallDir({
		baseDir: hooksBase,
		id: hookId,
		invalidNameMessage: "invalid hook name: path traversal detected"
	});
	if (!targetDirResult.ok) throw new Error(targetDirResult.error);
	return targetDirResult.path;
}
async function ensureOpenClawHooks(manifest) {
	const hooks = manifest[MANIFEST_KEY]?.hooks;
	if (!Array.isArray(hooks)) throw new Error("package.json missing openclaw.hooks");
	const list = hooks.map((e) => typeof e === "string" ? e.trim() : "").filter(Boolean);
	if (list.length === 0) throw new Error("package.json openclaw.hooks is empty");
	return list;
}
async function resolveInstallTargetDir(id, hooksDir) {
	const runtime = await loadHookInstallRuntime();
	const baseHooksDir = hooksDir ? resolveUserPath(hooksDir) : path.join(CONFIG_DIR, "hooks");
	return await runtime.resolveCanonicalInstallTarget({
		baseDir: baseHooksDir,
		id,
		invalidNameMessage: "invalid hook name: path traversal detected",
		boundaryLabel: "hooks directory"
	});
}
async function resolveAvailableHookInstallTarget(params) {
	const runtime = await loadHookInstallRuntime();
	const targetDirResult = await resolveInstallTargetDir(params.id, params.hooksDir);
	if (!targetDirResult.ok) return targetDirResult;
	const targetDir = targetDirResult.targetDir;
	const availability = await runtime.ensureInstallTargetAvailable({
		mode: params.mode,
		targetDir,
		alreadyExistsError: params.alreadyExistsError(targetDir)
	});
	if (!availability.ok) return availability;
	return {
		ok: true,
		targetDir
	};
}
async function installFromResolvedHookDir(resolvedDir, params) {
	const runtime = await loadHookInstallRuntime();
	const manifestPath = path.join(resolvedDir, "package.json");
	if (await runtime.fileExists(manifestPath)) return await installHookPackageFromDir({
		packageDir: resolvedDir,
		hooksDir: params.hooksDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
	return await installHookFromDir({
		hookDir: resolvedDir,
		hooksDir: params.hooksDir,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
}
async function resolveHookNameFromDir(hookDir) {
	const runtime = await loadHookInstallRuntime();
	const hookMdPath = path.join(hookDir, "HOOK.md");
	if (!await runtime.fileExists(hookMdPath)) throw new Error(`HOOK.md missing in ${hookDir}`);
	return parseFrontmatter(await fs$1.readFile(hookMdPath, "utf-8")).name || path.basename(hookDir);
}
async function validateHookDir(hookDir) {
	const runtime = await loadHookInstallRuntime();
	const hookMdPath = path.join(hookDir, "HOOK.md");
	if (!await runtime.fileExists(hookMdPath)) throw new Error(`HOOK.md missing in ${hookDir}`);
	if (!await Promise.all([
		"handler.ts",
		"handler.js",
		"index.ts",
		"index.js"
	].map(async (candidate) => runtime.fileExists(path.join(hookDir, candidate)))).then((results) => results.some(Boolean))) throw new Error(`handler.ts/handler.js/index.ts/index.js missing in ${hookDir}`);
}
async function installHookPackageFromDir(params) {
	const runtime = await loadHookInstallRuntime();
	const { logger, timeoutMs, mode, dryRun } = runtime.resolveTimedInstallModeOptions(params, defaultLogger);
	const manifestPath = path.join(params.packageDir, "package.json");
	if (!await runtime.fileExists(manifestPath)) return {
		ok: false,
		error: "package.json missing"
	};
	let manifest;
	try {
		manifest = await runtime.readJsonFile(manifestPath);
	} catch (err) {
		return {
			ok: false,
			error: `invalid package.json: ${String(err)}`
		};
	}
	let hookEntries;
	try {
		hookEntries = await ensureOpenClawHooks(manifest);
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
	const pkgName = typeof manifest.name === "string" ? manifest.name : "";
	const hookPackId = pkgName ? unscopedPackageName(pkgName) : path.basename(params.packageDir);
	const hookIdError = validateHookId(hookPackId);
	if (hookIdError) return {
		ok: false,
		error: hookIdError
	};
	if (params.expectedHookPackId && params.expectedHookPackId !== hookPackId) return {
		ok: false,
		error: `hook pack id mismatch: expected ${params.expectedHookPackId}, got ${hookPackId}`
	};
	const target = await resolveAvailableHookInstallTarget({
		id: hookPackId,
		hooksDir: params.hooksDir,
		mode,
		alreadyExistsError: (targetDir) => `hook pack already exists: ${targetDir} (delete it first)`
	});
	if (!target.ok) return target;
	const targetDir = target.targetDir;
	const resolvedHooks = [];
	for (const entry of hookEntries) {
		const hookDir = path.resolve(params.packageDir, entry);
		if (!runtime.isPathInside(params.packageDir, hookDir)) return {
			ok: false,
			error: `openclaw.hooks entry escapes package directory: ${entry}`
		};
		await validateHookDir(hookDir);
		if (!runtime.isPathInsideWithRealpath(params.packageDir, hookDir, { requireRealpath: true })) return {
			ok: false,
			error: `openclaw.hooks entry resolves outside package directory: ${entry}`
		};
		const hookName = await resolveHookNameFromDir(hookDir);
		resolvedHooks.push(hookName);
	}
	if (dryRun) return {
		ok: true,
		hookPackId,
		hooks: resolvedHooks,
		targetDir,
		version: typeof manifest.version === "string" ? manifest.version : void 0
	};
	const installRes = await runtime.installPackageDirWithManifestDeps({
		sourceDir: params.packageDir,
		targetDir,
		mode,
		timeoutMs,
		logger,
		copyErrorPrefix: "failed to copy hook pack",
		depsLogMessage: "Installing hook pack dependencies…",
		manifestDependencies: manifest.dependencies
	});
	if (!installRes.ok) return installRes;
	return {
		ok: true,
		hookPackId,
		hooks: resolvedHooks,
		targetDir,
		version: typeof manifest.version === "string" ? manifest.version : void 0
	};
}
async function installHookFromDir(params) {
	const runtime = await loadHookInstallRuntime();
	const { logger, mode, dryRun } = runtime.resolveInstallModeOptions(params, defaultLogger);
	await validateHookDir(params.hookDir);
	const hookName = await resolveHookNameFromDir(params.hookDir);
	const hookIdError = validateHookId(hookName);
	if (hookIdError) return {
		ok: false,
		error: hookIdError
	};
	if (params.expectedHookPackId && params.expectedHookPackId !== hookName) return {
		ok: false,
		error: `hook id mismatch: expected ${params.expectedHookPackId}, got ${hookName}`
	};
	const target = await resolveAvailableHookInstallTarget({
		id: hookName,
		hooksDir: params.hooksDir,
		mode,
		alreadyExistsError: (targetDir) => `hook already exists: ${targetDir} (delete it first)`
	});
	if (!target.ok) return target;
	const targetDir = target.targetDir;
	if (dryRun) return {
		ok: true,
		hookPackId: hookName,
		hooks: [hookName],
		targetDir
	};
	const installRes = await runtime.installPackageDir({
		sourceDir: params.hookDir,
		targetDir,
		mode,
		timeoutMs: 12e4,
		logger,
		copyErrorPrefix: "failed to copy hook",
		hasDeps: false,
		depsLogMessage: "Installing hook dependencies…"
	});
	if (!installRes.ok) return installRes;
	return {
		ok: true,
		hookPackId: hookName,
		hooks: [hookName],
		targetDir
	};
}
async function installHooksFromArchive(params) {
	const runtime = await loadHookInstallRuntime();
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const archivePathResult = await runtime.resolveArchiveSourcePath(params.archivePath);
	if (!archivePathResult.ok) return archivePathResult;
	const archivePath = archivePathResult.path;
	return await runtime.withExtractedArchiveRoot({
		archivePath,
		tempDirPrefix: "openclaw-hook-",
		timeoutMs,
		logger,
		onExtracted: async (rootDir) => await installFromResolvedHookDir(rootDir, buildHookInstallForwardParams({
			hooksDir: params.hooksDir,
			timeoutMs,
			logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		}))
	});
}
async function installHooksFromNpmSpec(params) {
	const runtime = await loadHookInstallRuntime();
	const { logger, timeoutMs, mode, dryRun } = runtime.resolveTimedInstallModeOptions(params, defaultLogger);
	const expectedHookPackId = params.expectedHookPackId;
	const spec = params.spec;
	logger.info?.(`Downloading ${spec.trim()}…`);
	return await runtime.installFromValidatedNpmSpecArchive({
		tempDirPrefix: "openclaw-hook-pack-",
		spec,
		timeoutMs,
		expectedIntegrity: params.expectedIntegrity,
		onIntegrityDrift: params.onIntegrityDrift,
		warn: (message) => {
			logger.warn?.(message);
		},
		installFromArchive: installHooksFromArchive,
		archiveInstallParams: buildHookInstallForwardParams({
			hooksDir: params.hooksDir,
			timeoutMs,
			logger,
			mode,
			dryRun,
			expectedHookPackId
		})
	});
}
async function installHooksFromPath(params) {
	const runtime = await loadHookInstallRuntime();
	const pathResult = await runtime.resolveExistingInstallPath(params.path);
	if (!pathResult.ok) return pathResult;
	const { resolvedPath: resolved, stat } = pathResult;
	const forwardParams = buildHookInstallForwardParams({
		dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
		hooksDir: params.hooksDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
	if (stat.isDirectory()) return await installFromResolvedHookDir(resolved, forwardParams);
	if (!runtime.resolveArchiveKind(resolved)) return {
		ok: false,
		error: `unsupported hook file: ${resolved}`
	};
	return await installHooksFromArchive({
		archivePath: resolved,
		...forwardParams
	});
}
//#endregion
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
async function installBundledPluginSource(params) {
	const existing = params.config.plugins?.load?.paths ?? [];
	const mergedPaths = Array.from(new Set([...existing, params.bundledSource.localPath]));
	await persistPluginInstall({
		config: {
			...params.config,
			plugins: {
				...params.config.plugins,
				load: {
					...params.config.plugins?.load,
					paths: mergedPaths
				}
			}
		},
		pluginId: params.bundledSource.pluginId,
		install: {
			source: "path",
			spec: params.rawSpec,
			sourcePath: params.bundledSource.localPath,
			installPath: params.bundledSource.localPath
		},
		warningMessage: params.warning
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
		const existing = params.config.hooks?.internal?.load?.extraDirs ?? [];
		const merged = Array.from(new Set([...existing, params.resolvedPath]));
		await persistHookPackInstall({
			config: {
				...params.config,
				hooks: {
					...params.config.hooks,
					internal: {
						...params.config.hooks?.internal,
						enabled: true,
						load: {
							...params.config.hooks?.internal?.load,
							extraDirs: merged
						}
					}
				}
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
		config: params.config,
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
		config: params.config,
		hookPackId: result.hookPackId,
		hooks: result.hooks,
		install: installRecord
	});
	return { ok: true };
}
function shouldExitOnForcedUnsafeInstall(params) {
	return params.forceUnsafeInstall && (params.code === PLUGIN_INSTALL_ERROR_CODE.SECURITY_SCAN_BLOCKED || params.code === PLUGIN_INSTALL_ERROR_CODE.SECURITY_SCAN_FAILED);
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
async function loadConfigFromSnapshotForInstall(request) {
	if (resolvePluginInstallInvalidConfigPolicy(request) !== "allow-bundled-recovery") throw buildInvalidPluginInstallConfigError("Config invalid; run `openclaw doctor --fix` before installing plugins.");
	const snapshot = await readConfigFileSnapshot();
	const parsed = snapshot.parsed ?? {};
	if (!snapshot.exists || Object.keys(parsed).length === 0) throw buildInvalidPluginInstallConfigError("Config file could not be parsed; run `openclaw doctor` to repair it.");
	if (snapshot.legacyIssues.length > 0 || snapshot.issues.length === 0 || snapshot.issues.some((issue) => !isAllowedBundledRecoveryIssue(issue, request))) throw buildInvalidPluginInstallConfigError(`Config invalid outside the bundled recovery path for ${request.bundledPluginId ?? "the requested plugin"}; run \`openclaw doctor --fix\` before reinstalling it.`);
	let nextConfig = snapshot.config;
	for (const mutation of await collectChannelDoctorStaleConfigMutations(snapshot.config)) nextConfig = mutation.config;
	return nextConfig;
}
async function loadConfigForInstall(request) {
	try {
		return loadConfig();
	} catch (err) {
		if (extractErrorCode(err) !== "INVALID_CONFIG") throw err;
	}
	return loadConfigFromSnapshotForInstall(request);
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
	const cfg = await loadConfigForInstall(request).catch((error) => {
		defaultRuntime.error(formatErrorMessage(error));
		return null;
	});
	if (!cfg) return defaultRuntime.exit(1);
	const installMode = resolveInstallMode(opts.force);
	const safetyOverrides = resolveInstallSafetyOverrides(opts);
	if (opts.marketplace) {
		const result = await installPluginFromMarketplace({
			...safetyOverrides,
			marketplace: opts.marketplace,
			mode: installMode,
			plugin: raw,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			return defaultRuntime.exit(1);
		}
		clearPluginManifestRegistryCache();
		await persistPluginInstall({
			config: cfg,
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
	const forceUnsafeInstall = opts.dangerouslyForceUnsafeInstall === true;
	if (fs.existsSync(resolved)) {
		if (opts.link) {
			const existing = cfg.plugins?.load?.paths ?? [];
			const merged = Array.from(new Set([...existing, resolved]));
			const probe = await installPluginFromPath({
				...safetyOverrides,
				mode: installMode,
				path: resolved,
				dryRun: true,
				logger: createPluginInstallLogger()
			});
			if (!probe.ok) {
				if (shouldExitOnForcedUnsafeInstall({
					forceUnsafeInstall,
					code: probe.code
				})) {
					defaultRuntime.error(probe.error);
					return defaultRuntime.exit(1);
				}
				const hookFallback = await tryInstallHookPackFromLocalPath({
					config: cfg,
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
			logger: createPluginInstallLogger()
		});
		if (!result.ok) {
			if (shouldExitOnForcedUnsafeInstall({
				forceUnsafeInstall,
				code: result.code
			})) {
				defaultRuntime.error(result.error);
				return defaultRuntime.exit(1);
			}
			const hookFallback = await tryInstallHookPackFromLocalPath({
				config: cfg,
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
			config: cfg,
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
			config: cfg,
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
			logger: createPluginInstallLogger()
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			return defaultRuntime.exit(1);
		}
		clearPluginManifestRegistryCache();
		await persistPluginInstall({
			config: cfg,
			pluginId: result.pluginId,
			install: {
				source: "clawhub",
				spec: formatClawHubSpecifier({
					name: result.clawhub.clawhubPackage,
					version: result.clawhub.version
				}),
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
			logger: createPluginInstallLogger()
		});
		if (clawhubResult.ok) {
			clearPluginManifestRegistryCache();
			await persistPluginInstall({
				config: cfg,
				pluginId: clawhubResult.pluginId,
				install: {
					source: "clawhub",
					spec: formatClawHubSpecifier({
						name: clawhubResult.clawhub.clawhubPackage,
						version: clawhubResult.clawhub.version
					}),
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
	const result = await installPluginFromNpmSpec({
		...safetyOverrides,
		mode: installMode,
		spec: raw,
		logger: createPluginInstallLogger()
	});
	if (!result.ok) {
		if (shouldExitOnForcedUnsafeInstall({
			forceUnsafeInstall,
			code: result.code
		})) {
			defaultRuntime.error(result.error);
			return defaultRuntime.exit(1);
		}
		const bundledFallbackPlan = resolveBundledInstallPlanForNpmFailure({
			rawSpec: raw,
			code: result.code,
			findBundledSource: (lookup) => findBundledPluginSource({ lookup })
		});
		if (!bundledFallbackPlan) {
			const hookFallback = await tryInstallHookPackFromNpmSpec({
				config: cfg,
				installMode,
				spec: raw,
				pin: opts.pin
			});
			if (hookFallback.ok) return;
			defaultRuntime.error(formatPluginInstallWithHookFallbackError(result.error, hookFallback.error));
			return defaultRuntime.exit(1);
		}
		await installBundledPluginSource({
			config: cfg,
			rawSpec: raw,
			bundledSource: bundledFallbackPlan.bundledSource,
			warning: bundledFallbackPlan.warning
		});
		return;
	}
	clearPluginManifestRegistryCache();
	const installRecord = resolvePinnedNpmInstallRecordForCli(raw, Boolean(opts.pin), result.targetDir, result.version, result.npmResolution, defaultRuntime.log, theme.warn);
	await persistPluginInstall({
		config: cfg,
		pluginId: result.pluginId,
		install: installRecord
	});
}
//#endregion
//#region src/hooks/update.ts
function createHookPackUpdateIntegrityDriftHandler(params) {
	return async (drift) => {
		const payload = {
			hookId: params.hookId,
			spec: drift.spec,
			expectedIntegrity: drift.expectedIntegrity,
			actualIntegrity: drift.actualIntegrity,
			resolution: drift.resolution,
			resolvedSpec: drift.resolution.resolvedSpec,
			resolvedVersion: drift.resolution.version,
			dryRun: params.dryRun
		};
		if (params.onIntegrityDrift) return await params.onIntegrityDrift(payload);
		params.logger.warn?.(`Integrity drift for hook pack "${params.hookId}" (${payload.resolvedSpec ?? payload.spec}): expected ${payload.expectedIntegrity}, got ${payload.actualIntegrity}`);
		return true;
	};
}
async function updateNpmInstalledHookPacks(params) {
	const logger = params.logger ?? {};
	const installs = params.config.hooks?.internal?.installs ?? {};
	const targets = params.hookIds?.length ? params.hookIds : Object.keys(installs);
	const outcomes = [];
	let next = params.config;
	let changed = false;
	for (const hookId of targets) {
		const record = installs[hookId];
		if (!record) {
			outcomes.push({
				hookId,
				status: "skipped",
				message: `No install record for hook pack "${hookId}".`
			});
			continue;
		}
		if (record.source !== "npm") {
			outcomes.push({
				hookId,
				status: "skipped",
				message: `Skipping hook pack "${hookId}" (source: ${record.source}).`
			});
			continue;
		}
		const effectiveSpec = params.specOverrides?.[hookId] ?? record.spec;
		const expectedIntegrity = effectiveSpec === record.spec ? expectedIntegrityForUpdate(record.spec, record.integrity) : void 0;
		if (!effectiveSpec) {
			outcomes.push({
				hookId,
				status: "skipped",
				message: `Skipping hook pack "${hookId}" (missing npm spec).`
			});
			continue;
		}
		let installPath;
		try {
			installPath = record.installPath ?? resolveHookInstallDir(hookId);
		} catch (err) {
			outcomes.push({
				hookId,
				status: "error",
				message: `Invalid install path for hook pack "${hookId}": ${String(err)}`
			});
			continue;
		}
		const currentVersion = await readInstalledPackageVersion(installPath);
		const result = await installHooksFromNpmSpec({
			spec: effectiveSpec,
			mode: "update",
			dryRun: params.dryRun,
			expectedHookPackId: hookId,
			expectedIntegrity,
			onIntegrityDrift: createHookPackUpdateIntegrityDriftHandler({
				hookId,
				dryRun: Boolean(params.dryRun),
				logger,
				onIntegrityDrift: params.onIntegrityDrift
			}),
			logger
		});
		if (!result.ok) {
			outcomes.push({
				hookId,
				status: "error",
				message: `Failed to ${params.dryRun ? "check" : "update"} hook pack "${hookId}": ${result.error}`
			});
			continue;
		}
		const nextVersion = result.version ?? await readInstalledPackageVersion(result.targetDir);
		const currentLabel = currentVersion ?? "unknown";
		const nextLabel = nextVersion ?? "unknown";
		const status = currentVersion && nextVersion && currentVersion === nextVersion ? "unchanged" : "updated";
		if (params.dryRun) {
			outcomes.push({
				hookId,
				status,
				currentVersion: currentVersion ?? void 0,
				nextVersion: nextVersion ?? void 0,
				message: status === "unchanged" ? `Hook pack "${hookId}" is up to date (${currentLabel}).` : `Would update hook pack "${hookId}": ${currentLabel} -> ${nextLabel}.`
			});
			continue;
		}
		next = recordHookInstall(next, {
			hookId,
			source: "npm",
			spec: effectiveSpec,
			installPath: result.targetDir,
			version: nextVersion,
			resolvedName: result.npmResolution?.name,
			resolvedSpec: result.npmResolution?.resolvedSpec,
			integrity: result.npmResolution?.integrity,
			hooks: result.hooks
		});
		changed = true;
		outcomes.push({
			hookId,
			status,
			currentVersion: currentVersion ?? void 0,
			nextVersion: nextVersion ?? void 0,
			message: status === "unchanged" ? `Hook pack "${hookId}" already at ${currentLabel}.` : `Updated hook pack "${hookId}": ${currentLabel} -> ${nextLabel}.`
		});
	}
	return {
		config: next,
		changed,
		outcomes
	};
}
//#endregion
//#region src/cli/plugins-update-selection.ts
function resolvePluginUpdateSelection(params) {
	if (params.all) return { pluginIds: Object.keys(params.installs) };
	if (!params.rawId) return { pluginIds: [] };
	const parsedSpec = parseRegistryNpmSpec(params.rawId);
	if (!parsedSpec || parsedSpec.selectorKind === "none") return { pluginIds: [params.rawId] };
	const matches = Object.entries(params.installs).filter(([, install]) => {
		return extractInstalledNpmPackageName(install) === parsedSpec.name;
	});
	if (matches.length !== 1) return { pluginIds: [params.rawId] };
	const [pluginId] = matches[0];
	if (!pluginId) return { pluginIds: [params.rawId] };
	return {
		pluginIds: [pluginId],
		specOverrides: { [pluginId]: parsedSpec.raw }
	};
}
function resolveHookPackUpdateSelection(params) {
	if (params.all) return { hookIds: Object.keys(params.installs) };
	if (!params.rawId) return { hookIds: [] };
	if (params.rawId in params.installs) return { hookIds: [params.rawId] };
	const parsedSpec = parseRegistryNpmSpec(params.rawId);
	if (!parsedSpec || parsedSpec.selectorKind === "none") return { hookIds: [] };
	const matches = Object.entries(params.installs).filter(([, install]) => {
		return extractInstalledNpmHookPackageName(install) === parsedSpec.name;
	});
	if (matches.length !== 1) return { hookIds: [] };
	const [hookId] = matches[0];
	if (!hookId) return { hookIds: [] };
	return {
		hookIds: [hookId],
		specOverrides: { [hookId]: parsedSpec.raw }
	};
}
//#endregion
//#region src/cli/plugins-update-command.ts
async function runPluginUpdateCommand(params) {
	const sourceSnapshotPromise = readConfigFileSnapshot().catch(() => null);
	const cfg = loadConfig();
	const logger = {
		info: (msg) => defaultRuntime.log(msg),
		warn: (msg) => defaultRuntime.log(theme.warn(msg))
	};
	const pluginSelection = resolvePluginUpdateSelection({
		installs: cfg.plugins?.installs ?? {},
		rawId: params.id,
		all: params.opts.all
	});
	const hookSelection = resolveHookPackUpdateSelection({
		installs: cfg.hooks?.internal?.installs ?? {},
		rawId: params.id,
		all: params.opts.all
	});
	if (pluginSelection.pluginIds.length === 0 && hookSelection.hookIds.length === 0) {
		if (params.opts.all) {
			defaultRuntime.log("No tracked plugins or hook packs to update.");
			return;
		}
		defaultRuntime.error("Provide a plugin or hook-pack id, or use --all.");
		return defaultRuntime.exit(1);
	}
	const pluginResult = await updateNpmInstalledPlugins({
		config: cfg,
		pluginIds: pluginSelection.pluginIds,
		specOverrides: pluginSelection.specOverrides,
		dryRun: params.opts.dryRun,
		dangerouslyForceUnsafeInstall: params.opts.dangerouslyForceUnsafeInstall,
		logger,
		onIntegrityDrift: async (drift) => {
			const specLabel = drift.resolvedSpec ?? drift.spec;
			defaultRuntime.log(theme.warn(`Integrity drift detected for "${drift.pluginId}" (${specLabel})\nExpected: ${drift.expectedIntegrity}\nActual:   ${drift.actualIntegrity}`));
			if (drift.dryRun) return true;
			return await promptYesNo(`Continue updating "${drift.pluginId}" with this artifact?`);
		}
	});
	const hookResult = await updateNpmInstalledHookPacks({
		config: pluginResult.config,
		hookIds: hookSelection.hookIds,
		specOverrides: hookSelection.specOverrides,
		dryRun: params.opts.dryRun,
		logger,
		onIntegrityDrift: async (drift) => {
			const specLabel = drift.resolvedSpec ?? drift.spec;
			defaultRuntime.log(theme.warn(`Integrity drift detected for hook pack "${drift.hookId}" (${specLabel})\nExpected: ${drift.expectedIntegrity}\nActual:   ${drift.actualIntegrity}`));
			if (drift.dryRun) return true;
			return await promptYesNo(`Continue updating hook pack "${drift.hookId}" with this artifact?`);
		}
	});
	for (const outcome of pluginResult.outcomes) {
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
	for (const outcome of hookResult.outcomes) {
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
	if (!params.opts.dryRun && (pluginResult.changed || hookResult.changed)) {
		await replaceConfigFile({
			nextConfig: hookResult.config,
			baseHash: (await sourceSnapshotPromise)?.hash
		});
		defaultRuntime.log("Restart the gateway to load plugins and hooks.");
	}
}
//#endregion
export { runPluginInstallCommand as n, runPluginUpdateCommand as t };
