import { p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { o as normalizePluginsConfig, s as resolveEffectiveEnableState } from "./config-state-Bw_lAn0M.js";
import { i as resolveNpmSpecMetadata } from "./install-source-utils-QP0jJI8P.js";
import { n as recordPluginInstall, t as buildNpmResolutionInstallFields } from "./installs-31vZ2PVW.js";
import { o as resolvePluginInstallDir, r as installPluginFromNpmSpec, t as PLUGIN_INSTALL_ERROR_CODE } from "./install-BrXYq_UK.js";
import { i as resolveBundledPluginSources } from "./bundled-sources-CqkGtVM8.js";
import { n as installPluginFromClawHub } from "./clawhub-BQekueYp.js";
import { t as installPluginFromMarketplace } from "./marketplace-Q_gOHJ1-.js";
import { n as readInstalledPackageVersion, t as expectedIntegrityForUpdate } from "./package-update-utils-CPL3s3zj.js";
import path from "node:path";
//#region src/plugins/externalized-bundled-plugins.ts
function normalizePluginId(value) {
	return value?.trim() ?? "";
}
function getExternalizedBundledPluginTargetId(bridge) {
	return normalizePluginId(bridge.pluginId) || normalizePluginId(bridge.bundledPluginId);
}
function getExternalizedBundledPluginLookupIds(bridge) {
	return Array.from(new Set([
		bridge.bundledPluginId,
		bridge.pluginId,
		...bridge.legacyPluginIds ?? [],
		...bridge.channelIds ?? []
	].map(normalizePluginId).filter(Boolean)));
}
function getExternalizedBundledPluginLegacyPathSuffix(bridge) {
	return ["extensions", bridge.bundledDirName ?? bridge.bundledPluginId].join("/");
}
//#endregion
//#region src/plugins/update.ts
function formatNpmInstallFailure(params) {
	if (params.result.code === PLUGIN_INSTALL_ERROR_CODE.NPM_PACKAGE_NOT_FOUND) return `Failed to ${params.phase} ${params.pluginId}: npm package not found for ${params.spec}.`;
	return `Failed to ${params.phase} ${params.pluginId}: ${params.result.error}`;
}
function formatMarketplaceInstallFailure(params) {
	return `Failed to ${params.phase} ${params.pluginId}: ${params.error} (marketplace plugin ${params.marketplacePlugin} from ${params.marketplaceSource}).`;
}
function formatClawHubInstallFailure(params) {
	return `Failed to ${params.phase} ${params.pluginId}: ${params.error} (ClawHub ${params.spec}).`;
}
function shouldSkipUnchangedNpmInstall(params) {
	if (!params.currentVersion || !params.metadata.version) return false;
	if (params.currentVersion !== params.metadata.version) return false;
	if (!params.record.resolvedName || !params.record.resolvedSpec || !params.record.resolvedVersion) return false;
	if (!params.metadata.name || !params.metadata.resolvedSpec) return false;
	if (params.metadata.integrity && !params.record.integrity) return false;
	if (params.metadata.shasum && !params.record.shasum) return false;
	return (!params.metadata.integrity || params.record.integrity === params.metadata.integrity) && (!params.metadata.shasum || params.record.shasum === params.metadata.shasum) && params.record.resolvedName === params.metadata.name && params.record.resolvedSpec === params.metadata.resolvedSpec && params.record.resolvedVersion === params.metadata.version;
}
function pathsEqual(left, right, env = process.env) {
	if (!left || !right) return false;
	return resolveUserPath(left, env) === resolveUserPath(right, env);
}
function resolveRecordedExtensionsDir(params) {
	const parentDir = path.dirname(params.installPath);
	try {
		return resolvePluginInstallDir(params.pluginId, parentDir) === params.installPath ? parentDir : void 0;
	} catch {
		return;
	}
}
function buildLoadPathHelpers(existing, env = process.env) {
	let paths = [...existing];
	const resolveSet = () => new Set(paths.map((entry) => resolveUserPath(entry, env)));
	let resolved = resolveSet();
	let changed = false;
	const addPath = (value) => {
		const normalized = resolveUserPath(value, env);
		if (resolved.has(normalized)) return;
		paths.push(value);
		resolved.add(normalized);
		changed = true;
	};
	const removePath = (value) => {
		const normalized = resolveUserPath(value, env);
		if (!resolved.has(normalized)) return;
		paths = paths.filter((entry) => resolveUserPath(entry, env) !== normalized);
		resolved = resolveSet();
		changed = true;
	};
	const removeMatching = (predicate) => {
		const next = paths.filter((entry) => !predicate(entry));
		if (next.length === paths.length) return;
		paths = next;
		resolved = resolveSet();
		changed = true;
	};
	return {
		addPath,
		removePath,
		removeMatching,
		get changed() {
			return changed;
		},
		get paths() {
			return paths;
		}
	};
}
function normalizePathSegment(value) {
	return value?.trim().replaceAll("\\", "/").replace(/^\/+|\/+$/g, "") ?? "";
}
function pathEndsWithSegment(params) {
	const value = normalizePathSegment(params.value ? resolveUserPath(params.value, params.env) : "");
	const segment = normalizePathSegment(params.segment);
	return Boolean(value && segment && (value === segment || value.endsWith(`/${segment}`)));
}
function isBridgeBundledPathRecord(params) {
	if (params.record.source !== "path") return false;
	if (params.bundledLocalPath && (pathsEqual(params.record.sourcePath, params.bundledLocalPath, params.env) || pathsEqual(params.record.installPath, params.bundledLocalPath, params.env))) return true;
	const bundledPathSuffix = getExternalizedBundledPluginLegacyPathSuffix(params.bridge);
	return pathEndsWithSegment({
		value: params.record.sourcePath,
		segment: bundledPathSuffix,
		env: params.env
	}) || pathEndsWithSegment({
		value: params.record.installPath,
		segment: bundledPathSuffix,
		env: params.env
	});
}
function removeBridgeBundledLoadPaths(params) {
	const bundledPathSuffix = getExternalizedBundledPluginLegacyPathSuffix(params.bridge);
	params.loadPaths.removeMatching((entry) => pathEndsWithSegment({
		value: entry,
		segment: bundledPathSuffix,
		env: params.env
	}));
}
function resolveBridgeInstallRecord(params) {
	for (const pluginId of getExternalizedBundledPluginLookupIds(params.bridge)) {
		const record = params.installs[pluginId];
		if (record) return {
			pluginId,
			record
		};
	}
}
function isBridgeChannelEnabledByConfig(params) {
	const channels = params.config.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return false;
	for (const channelId of params.bridge.channelIds ?? []) {
		const entry = channels[channelId];
		if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
		if (Object.is(entry.enabled, true)) return true;
	}
	return false;
}
function isExternalizedBundledPluginEnabled(params) {
	const normalized = normalizePluginsConfig(params.config.plugins);
	if (!normalized.enabled) return false;
	const pluginIds = getExternalizedBundledPluginLookupIds(params.bridge);
	if (pluginIds.some((pluginId) => normalized.deny.includes(pluginId) || Object.is(normalized.entries[pluginId]?.enabled, false))) return false;
	for (const pluginId of pluginIds) if (resolveEffectiveEnableState({
		id: pluginId,
		origin: "bundled",
		config: normalized,
		rootConfig: params.config,
		enabledByDefault: params.bridge.enabledByDefault
	}).enabled) return true;
	if (isBridgeChannelEnabledByConfig(params)) return true;
	return false;
}
function replacePluginIdInList(entries, fromId, toId) {
	if (!entries || entries.length === 0 || fromId === toId) return entries;
	const next = [];
	for (const entry of entries) {
		const value = entry === fromId ? toId : entry;
		if (!next.includes(value)) next.push(value);
	}
	return next;
}
function migratePluginConfigId(cfg, fromId, toId) {
	if (fromId === toId) return cfg;
	const installs = cfg.plugins?.installs;
	const entries = cfg.plugins?.entries;
	const slots = cfg.plugins?.slots;
	const allow = replacePluginIdInList(cfg.plugins?.allow, fromId, toId);
	const deny = replacePluginIdInList(cfg.plugins?.deny, fromId, toId);
	const nextInstalls = installs ? { ...installs } : void 0;
	if (nextInstalls && fromId in nextInstalls) {
		const record = nextInstalls[fromId];
		if (record && !(toId in nextInstalls)) nextInstalls[toId] = record;
		delete nextInstalls[fromId];
	}
	const nextEntries = entries ? { ...entries } : void 0;
	if (nextEntries && fromId in nextEntries) {
		const entry = nextEntries[fromId];
		if (entry) nextEntries[toId] = nextEntries[toId] ? {
			...entry,
			...nextEntries[toId]
		} : entry;
		delete nextEntries[fromId];
	}
	const nextSlots = slots ? {
		...slots,
		...slots.memory === fromId ? { memory: toId } : {},
		...slots.contextEngine === fromId ? { contextEngine: toId } : {}
	} : void 0;
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			allow,
			deny,
			entries: nextEntries,
			installs: nextInstalls,
			slots: nextSlots
		}
	};
}
function createPluginUpdateIntegrityDriftHandler(params) {
	return async (drift) => {
		const payload = {
			pluginId: params.pluginId,
			spec: drift.spec,
			expectedIntegrity: drift.expectedIntegrity,
			actualIntegrity: drift.actualIntegrity,
			resolvedSpec: drift.resolution.resolvedSpec,
			resolvedVersion: drift.resolution.version,
			dryRun: params.dryRun
		};
		if (params.onIntegrityDrift) return await params.onIntegrityDrift(payload);
		params.logger.warn?.(`Integrity drift for "${params.pluginId}" (${payload.resolvedSpec ?? payload.spec}): expected ${payload.expectedIntegrity}, got ${payload.actualIntegrity}`);
		return false;
	};
}
async function updateNpmInstalledPlugins(params) {
	const logger = params.logger ?? {};
	const installs = params.config.plugins?.installs ?? {};
	const targets = params.pluginIds?.length ? params.pluginIds : Object.keys(installs);
	const outcomes = [];
	let next = params.config;
	let changed = false;
	for (const pluginId of targets) {
		if (params.skipIds?.has(pluginId)) {
			outcomes.push({
				pluginId,
				status: "skipped",
				message: `Skipping "${pluginId}" (already updated).`
			});
			continue;
		}
		const record = installs[pluginId];
		if (!record) {
			outcomes.push({
				pluginId,
				status: "skipped",
				message: `No install record for "${pluginId}".`
			});
			continue;
		}
		if (record.source !== "npm" && record.source !== "marketplace" && record.source !== "clawhub") {
			outcomes.push({
				pluginId,
				status: "skipped",
				message: `Skipping "${pluginId}" (source: ${record.source}).`
			});
			continue;
		}
		const effectiveSpec = record.source === "npm" ? params.specOverrides?.[pluginId] ?? record.spec : record.spec;
		const expectedIntegrity = record.source === "npm" && effectiveSpec === record.spec ? expectedIntegrityForUpdate(record.spec, record.integrity) : void 0;
		if (record.source === "npm" && !effectiveSpec) {
			outcomes.push({
				pluginId,
				status: "skipped",
				message: `Skipping "${pluginId}" (missing npm spec).`
			});
			continue;
		}
		if (record.source === "clawhub" && !record.clawhubPackage) {
			outcomes.push({
				pluginId,
				status: "skipped",
				message: `Skipping "${pluginId}" (missing ClawHub package metadata).`
			});
			continue;
		}
		if (record.source === "marketplace" && (!record.marketplaceSource || !record.marketplacePlugin)) {
			outcomes.push({
				pluginId,
				status: "skipped",
				message: `Skipping "${pluginId}" (missing marketplace source metadata).`
			});
			continue;
		}
		let installPath;
		try {
			installPath = resolveUserPath(record.installPath?.trim() || resolvePluginInstallDir(pluginId));
		} catch (err) {
			outcomes.push({
				pluginId,
				status: "error",
				message: `Invalid install path for "${pluginId}": ${String(err)}`
			});
			continue;
		}
		const currentVersion = await readInstalledPackageVersion(installPath);
		const extensionsDir = resolveRecordedExtensionsDir({
			pluginId,
			installPath
		});
		if (!params.dryRun && record.source === "npm" && currentVersion) {
			const metadataResult = await resolveNpmSpecMetadata({
				spec: effectiveSpec,
				timeoutMs: params.timeoutMs
			});
			if (metadataResult.ok) {
				if (shouldSkipUnchangedNpmInstall({
					currentVersion,
					record,
					metadata: metadataResult.metadata
				})) {
					outcomes.push({
						pluginId,
						status: "unchanged",
						currentVersion,
						nextVersion: metadataResult.metadata.version,
						message: `${pluginId} is up to date (${currentVersion}).`
					});
					continue;
				}
			} else logger.warn?.(`Could not check ${pluginId} before update; falling back to installer path: ${metadataResult.error}`);
		}
		if (params.dryRun) {
			let probe;
			try {
				probe = record.source === "npm" ? await installPluginFromNpmSpec({
					spec: effectiveSpec,
					mode: "update",
					extensionsDir,
					timeoutMs: params.timeoutMs,
					dryRun: true,
					dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
					expectedPluginId: pluginId,
					expectedIntegrity,
					onIntegrityDrift: createPluginUpdateIntegrityDriftHandler({
						pluginId,
						dryRun: true,
						logger,
						onIntegrityDrift: params.onIntegrityDrift
					}),
					logger
				}) : record.source === "clawhub" ? await installPluginFromClawHub({
					spec: effectiveSpec ?? `clawhub:${record.clawhubPackage}`,
					baseUrl: record.clawhubUrl,
					mode: "update",
					extensionsDir,
					timeoutMs: params.timeoutMs,
					dryRun: true,
					dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
					expectedPluginId: pluginId,
					logger
				}) : await installPluginFromMarketplace({
					marketplace: record.marketplaceSource,
					plugin: record.marketplacePlugin,
					mode: "update",
					extensionsDir,
					timeoutMs: params.timeoutMs,
					dryRun: true,
					dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
					expectedPluginId: pluginId,
					logger
				});
			} catch (err) {
				outcomes.push({
					pluginId,
					status: "error",
					message: `Failed to check ${pluginId}: ${String(err)}`
				});
				continue;
			}
			if (!probe.ok) {
				outcomes.push({
					pluginId,
					status: "error",
					message: record.source === "npm" ? formatNpmInstallFailure({
						pluginId,
						spec: effectiveSpec,
						phase: "check",
						result: probe
					}) : record.source === "clawhub" ? formatClawHubInstallFailure({
						pluginId,
						spec: effectiveSpec ?? `clawhub:${record.clawhubPackage}`,
						phase: "check",
						error: probe.error
					}) : formatMarketplaceInstallFailure({
						pluginId,
						marketplaceSource: record.marketplaceSource,
						marketplacePlugin: record.marketplacePlugin,
						phase: "check",
						error: probe.error
					})
				});
				continue;
			}
			const nextVersion = probe.version ?? "unknown";
			const currentLabel = currentVersion ?? "unknown";
			if (currentVersion && probe.version && currentVersion === probe.version) outcomes.push({
				pluginId,
				status: "unchanged",
				currentVersion: currentVersion ?? void 0,
				nextVersion: probe.version ?? void 0,
				message: `${pluginId} is up to date (${currentLabel}).`
			});
			else outcomes.push({
				pluginId,
				status: "updated",
				currentVersion: currentVersion ?? void 0,
				nextVersion: probe.version ?? void 0,
				message: `Would update ${pluginId}: ${currentLabel} -> ${nextVersion}.`
			});
			continue;
		}
		let result;
		try {
			result = record.source === "npm" ? await installPluginFromNpmSpec({
				spec: effectiveSpec,
				mode: "update",
				extensionsDir,
				timeoutMs: params.timeoutMs,
				dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
				expectedPluginId: pluginId,
				expectedIntegrity,
				onIntegrityDrift: createPluginUpdateIntegrityDriftHandler({
					pluginId,
					dryRun: false,
					logger,
					onIntegrityDrift: params.onIntegrityDrift
				}),
				logger
			}) : record.source === "clawhub" ? await installPluginFromClawHub({
				spec: effectiveSpec ?? `clawhub:${record.clawhubPackage}`,
				baseUrl: record.clawhubUrl,
				mode: "update",
				extensionsDir,
				timeoutMs: params.timeoutMs,
				dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
				expectedPluginId: pluginId,
				logger
			}) : await installPluginFromMarketplace({
				marketplace: record.marketplaceSource,
				plugin: record.marketplacePlugin,
				mode: "update",
				extensionsDir,
				timeoutMs: params.timeoutMs,
				dangerouslyForceUnsafeInstall: params.dangerouslyForceUnsafeInstall,
				expectedPluginId: pluginId,
				logger
			});
		} catch (err) {
			outcomes.push({
				pluginId,
				status: "error",
				message: `Failed to update ${pluginId}: ${String(err)}`
			});
			continue;
		}
		if (!result.ok) {
			outcomes.push({
				pluginId,
				status: "error",
				message: record.source === "npm" ? formatNpmInstallFailure({
					pluginId,
					spec: effectiveSpec,
					phase: "update",
					result
				}) : record.source === "clawhub" ? formatClawHubInstallFailure({
					pluginId,
					spec: effectiveSpec ?? `clawhub:${record.clawhubPackage}`,
					phase: "update",
					error: result.error
				}) : formatMarketplaceInstallFailure({
					pluginId,
					marketplaceSource: record.marketplaceSource,
					marketplacePlugin: record.marketplacePlugin,
					phase: "update",
					error: result.error
				})
			});
			continue;
		}
		const resolvedPluginId = result.pluginId;
		if (resolvedPluginId !== pluginId) next = migratePluginConfigId(next, pluginId, resolvedPluginId);
		const nextVersion = result.version ?? await readInstalledPackageVersion(result.targetDir);
		if (record.source === "npm") next = recordPluginInstall(next, {
			pluginId: resolvedPluginId,
			source: "npm",
			spec: effectiveSpec,
			installPath: result.targetDir,
			version: nextVersion,
			...buildNpmResolutionInstallFields(result.npmResolution)
		});
		else if (record.source === "clawhub") {
			const clawhubResult = result;
			next = recordPluginInstall(next, {
				pluginId: resolvedPluginId,
				source: "clawhub",
				spec: effectiveSpec ?? record.spec ?? `clawhub:${record.clawhubPackage}`,
				installPath: result.targetDir,
				version: nextVersion,
				integrity: clawhubResult.clawhub.integrity,
				resolvedAt: clawhubResult.clawhub.resolvedAt,
				clawhubUrl: clawhubResult.clawhub.clawhubUrl,
				clawhubPackage: clawhubResult.clawhub.clawhubPackage,
				clawhubFamily: clawhubResult.clawhub.clawhubFamily,
				clawhubChannel: clawhubResult.clawhub.clawhubChannel
			});
		} else {
			const marketplaceResult = result;
			next = recordPluginInstall(next, {
				pluginId: resolvedPluginId,
				source: "marketplace",
				installPath: result.targetDir,
				version: nextVersion,
				marketplaceName: marketplaceResult.marketplaceName ?? record.marketplaceName,
				marketplaceSource: record.marketplaceSource,
				marketplacePlugin: record.marketplacePlugin
			});
		}
		changed = true;
		const currentLabel = currentVersion ?? "unknown";
		const nextLabel = nextVersion ?? "unknown";
		if (currentVersion && nextVersion && currentVersion === nextVersion) outcomes.push({
			pluginId,
			status: "unchanged",
			currentVersion: currentVersion ?? void 0,
			nextVersion: nextVersion ?? void 0,
			message: `${pluginId} already at ${currentLabel}.`
		});
		else outcomes.push({
			pluginId,
			status: "updated",
			currentVersion: currentVersion ?? void 0,
			nextVersion: nextVersion ?? void 0,
			message: `Updated ${pluginId}: ${currentLabel} -> ${nextLabel}.`
		});
	}
	return {
		config: next,
		changed,
		outcomes
	};
}
async function syncPluginsForUpdateChannel(params) {
	const env = params.env ?? process.env;
	const logger = params.logger ?? {};
	const summary = {
		switchedToBundled: [],
		switchedToNpm: [],
		warnings: [],
		errors: []
	};
	const bundled = resolveBundledPluginSources({
		workspaceDir: params.workspaceDir,
		env
	});
	let next = params.config;
	const loadHelpers = buildLoadPathHelpers(next.plugins?.load?.paths ?? [], env);
	let installs = next.plugins?.installs ?? {};
	let changed = false;
	if (params.channel === "dev") for (const [pluginId, record] of Object.entries(installs)) {
		const bundledInfo = bundled.get(pluginId);
		if (!bundledInfo) continue;
		loadHelpers.addPath(bundledInfo.localPath);
		if (record.source === "path" && pathsEqual(record.sourcePath, bundledInfo.localPath, env)) continue;
		next = recordPluginInstall(next, {
			pluginId,
			source: "path",
			sourcePath: bundledInfo.localPath,
			installPath: bundledInfo.localPath,
			spec: record.spec ?? bundledInfo.npmSpec,
			version: record.version
		});
		summary.switchedToBundled.push(pluginId);
		changed = true;
	}
	else {
		const bridges = params.externalizedBundledPluginBridges ?? [];
		for (const bridge of bridges) {
			const targetPluginId = getExternalizedBundledPluginTargetId(bridge);
			if (bundled.get(bridge.bundledPluginId)) continue;
			const existing = resolveBridgeInstallRecord({
				installs,
				bridge
			});
			if (!existing && !isExternalizedBundledPluginEnabled({
				config: next,
				bridge
			})) continue;
			if (existing && !isExternalizedBundledPluginEnabled({
				config: next,
				bridge
			})) continue;
			if (existing?.record.source === "npm" && existing.record.spec === bridge.npmSpec) {
				if (existing.pluginId !== targetPluginId) {
					next = migratePluginConfigId(next, existing.pluginId, targetPluginId);
					installs = next.plugins?.installs ?? {};
					changed = true;
				}
				removeBridgeBundledLoadPaths({
					bridge,
					loadPaths: loadHelpers,
					env
				});
				continue;
			}
			if (existing && !isBridgeBundledPathRecord({
				bridge,
				record: existing.record,
				env
			})) continue;
			const result = await installPluginFromNpmSpec({
				spec: bridge.npmSpec,
				mode: "update",
				expectedPluginId: targetPluginId,
				logger
			});
			if (!result.ok) {
				const message = formatNpmInstallFailure({
					pluginId: targetPluginId,
					spec: bridge.npmSpec,
					phase: "update",
					result
				});
				summary.errors.push(message);
				logger.error?.(message);
				continue;
			}
			const resolvedPluginId = result.pluginId;
			if (existing && existing.pluginId !== resolvedPluginId) next = migratePluginConfigId(next, existing.pluginId, resolvedPluginId);
			const nextVersion = result.version ?? await readInstalledPackageVersion(result.targetDir);
			next = recordPluginInstall(next, {
				pluginId: resolvedPluginId,
				source: "npm",
				spec: bridge.npmSpec,
				installPath: result.targetDir,
				version: nextVersion,
				...buildNpmResolutionInstallFields(result.npmResolution)
			});
			installs = next.plugins?.installs ?? {};
			if (existing?.record.sourcePath) loadHelpers.removePath(existing.record.sourcePath);
			if (existing?.record.installPath) loadHelpers.removePath(existing.record.installPath);
			removeBridgeBundledLoadPaths({
				bridge,
				loadPaths: loadHelpers,
				env
			});
			summary.switchedToNpm.push(resolvedPluginId);
			changed = true;
		}
		for (const [pluginId, record] of Object.entries(installs)) {
			const bundledInfo = bundled.get(pluginId);
			if (!bundledInfo) continue;
			if (record.source === "npm") {
				loadHelpers.removePath(bundledInfo.localPath);
				continue;
			}
			if (record.source !== "path") continue;
			if (!pathsEqual(record.sourcePath, bundledInfo.localPath, env)) continue;
			loadHelpers.addPath(bundledInfo.localPath);
			if (record.source === "path" && pathsEqual(record.sourcePath, bundledInfo.localPath, env) && pathsEqual(record.installPath, bundledInfo.localPath, env)) continue;
			next = recordPluginInstall(next, {
				pluginId,
				source: "path",
				sourcePath: bundledInfo.localPath,
				installPath: bundledInfo.localPath,
				spec: record.spec ?? bundledInfo.npmSpec,
				version: record.version
			});
			changed = true;
		}
	}
	if (loadHelpers.changed) {
		next = {
			...next,
			plugins: {
				...next.plugins,
				load: {
					...next.plugins?.load,
					paths: loadHelpers.paths
				}
			}
		};
		changed = true;
	}
	return {
		config: next,
		changed,
		summary
	};
}
//#endregion
export { updateNpmInstalledPlugins as n, syncPluginsForUpdateChannel as t };
