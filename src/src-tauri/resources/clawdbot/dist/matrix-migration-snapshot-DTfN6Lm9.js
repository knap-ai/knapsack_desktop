import { C as resolveRequiredHomeDir, _ as resolveStateDir } from "./paths-ViKUYWUK.js";
import { _ as normalizeAccountId } from "./session-key-DAhnzjyr.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DcZxlWD8.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-B5JNQdOM.js";
import { b as shouldPreferNativeJiti } from "./runtime-whatsapp-boundary-XjdkYMz_.js";
import { n as writeJsonFileAtomically } from "./json-store--JDX3zNL.js";
import { t as createBackupArchive } from "./backup-create-BuxXJpr7.js";
import { r as resolveMatrixAccountStringValues } from "./matrix-wu3iTLk7.js";
import { a as resolveMatrixCredentialsPath, d as requiresExplicitMatrixDefaultAccount, f as resolveConfiguredMatrixAccountIds, h as getMatrixScopedEnvVarNames, m as resolveMatrixDefaultOrOnlyAccountId, n as resolveMatrixAccountStorageRoot, p as resolveMatrixChannelConfig, s as resolveMatrixLegacyFlatStoragePaths, u as findMatrixAccountEntry } from "./helper-api-CFToxS1G.js";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createJiti } from "jiti";
//#region src/infra/matrix-migration-config.ts
function clean(value) {
	return typeof value === "string" ? value.trim() : "";
}
function resolveScopedMatrixEnvConfig(accountId, env) {
	const keys = getMatrixScopedEnvVarNames(accountId);
	return {
		homeserver: clean(env[keys.homeserver]),
		userId: clean(env[keys.userId]),
		accessToken: clean(env[keys.accessToken])
	};
}
function resolveGlobalMatrixEnvConfig(env) {
	return {
		homeserver: clean(env.MATRIX_HOMESERVER),
		userId: clean(env.MATRIX_USER_ID),
		accessToken: clean(env.MATRIX_ACCESS_TOKEN)
	};
}
function resolveMatrixAccountConfigEntry(cfg, accountId) {
	return findMatrixAccountEntry(cfg, accountId);
}
function resolveMatrixFlatStoreSelectionNote(cfg, accountId) {
	if (resolveConfiguredMatrixAccountIds(cfg).length <= 1) return;
	return `Legacy Matrix flat store uses one shared on-disk state, so it will be migrated into account "${accountId}".`;
}
function resolveMatrixMigrationConfigFields(params) {
	const channel = resolveMatrixChannelConfig(params.cfg);
	const account = resolveMatrixAccountConfigEntry(params.cfg, params.accountId);
	const scopedEnv = resolveScopedMatrixEnvConfig(params.accountId, params.env);
	const globalEnv = resolveGlobalMatrixEnvConfig(params.env);
	const resolvedStrings = resolveMatrixAccountStringValues({
		accountId: normalizeAccountId(params.accountId),
		account: {
			homeserver: clean(account?.homeserver),
			userId: clean(account?.userId),
			accessToken: clean(account?.accessToken)
		},
		scopedEnv,
		channel: {
			homeserver: clean(channel?.homeserver),
			userId: clean(channel?.userId),
			accessToken: clean(channel?.accessToken)
		},
		globalEnv
	});
	return {
		homeserver: resolvedStrings.homeserver,
		userId: resolvedStrings.userId,
		accessToken: resolvedStrings.accessToken
	};
}
function loadStoredMatrixCredentials(env, accountId) {
	const credentialsPath = resolveMatrixCredentialsPath({
		stateDir: resolveStateDir(env, os.homedir),
		accountId: normalizeAccountId(accountId)
	});
	try {
		if (!fs.existsSync(credentialsPath)) return null;
		const parsed = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
		if (typeof parsed.homeserver !== "string" || typeof parsed.userId !== "string" || typeof parsed.accessToken !== "string") return null;
		return {
			homeserver: parsed.homeserver,
			userId: parsed.userId,
			accessToken: parsed.accessToken,
			deviceId: typeof parsed.deviceId === "string" ? parsed.deviceId : void 0
		};
	} catch {
		return null;
	}
}
function credentialsMatchResolvedIdentity(stored, identity) {
	if (!stored || !identity.homeserver) return false;
	if (!identity.userId) {
		if (!identity.accessToken) return false;
		return stored.homeserver === identity.homeserver && stored.accessToken === identity.accessToken;
	}
	return stored.homeserver === identity.homeserver && stored.userId === identity.userId;
}
function resolveMatrixMigrationAccountTarget(params) {
	const stored = loadStoredMatrixCredentials(params.env, params.accountId);
	const resolved = resolveMatrixMigrationConfigFields(params);
	const matchingStored = credentialsMatchResolvedIdentity(stored, {
		homeserver: resolved.homeserver,
		userId: resolved.userId,
		accessToken: resolved.accessToken
	}) ? stored : null;
	const homeserver = resolved.homeserver;
	const userId = resolved.userId || matchingStored?.userId || "";
	const accessToken = resolved.accessToken || matchingStored?.accessToken || "";
	if (!homeserver || !userId || !accessToken) return null;
	const { rootDir } = resolveMatrixAccountStorageRoot({
		stateDir: resolveStateDir(params.env, os.homedir),
		homeserver,
		userId,
		accessToken,
		accountId: params.accountId
	});
	return {
		accountId: params.accountId,
		homeserver,
		userId,
		accessToken,
		rootDir,
		storedDeviceId: matchingStored?.deviceId ?? null
	};
}
function resolveLegacyMatrixFlatStoreTarget(params) {
	if (!resolveMatrixChannelConfig(params.cfg)) return { warning: `Legacy Matrix ${params.detectedKind} detected at ${params.detectedPath}, but channels.matrix is not configured yet. Configure Matrix, then rerun "openclaw doctor --fix" or restart the gateway.` };
	if (requiresExplicitMatrixDefaultAccount(params.cfg)) return { warning: `Legacy Matrix ${params.detectedKind} detected at ${params.detectedPath}, but multiple Matrix accounts are configured and channels.matrix.defaultAccount is not set. Set "channels.matrix.defaultAccount" to the intended target account before rerunning "openclaw doctor --fix" or restarting the gateway.` };
	const accountId = resolveMatrixDefaultOrOnlyAccountId(params.cfg);
	const target = resolveMatrixMigrationAccountTarget({
		cfg: params.cfg,
		env: params.env,
		accountId
	});
	if (!target) {
		const targetDescription = params.detectedKind === "state" ? "the new account-scoped target" : "the account-scoped target";
		return { warning: `Legacy Matrix ${params.detectedKind} detected at ${params.detectedPath}, but ${targetDescription} could not be resolved yet (need homeserver, userId, and access token for channels.matrix${accountId === "default" ? "" : `.accounts.${accountId}`}). Start the gateway once with a working Matrix login, or rerun "openclaw doctor --fix" after cached credentials are available.` };
	}
	return {
		...target,
		selectionNote: resolveMatrixFlatStoreSelectionNote(params.cfg, accountId)
	};
}
//#endregion
//#region src/infra/matrix-plugin-helper.ts
const MATRIX_PLUGIN_ID = "matrix";
const MATRIX_HELPER_CANDIDATES = [
	"legacy-crypto-inspector.ts",
	"legacy-crypto-inspector.js",
	path.join("dist", "legacy-crypto-inspector.js")
];
const MATRIX_LEGACY_CRYPTO_INSPECTOR_UNAVAILABLE_MESSAGE = "Legacy Matrix encrypted state was detected, but the Matrix plugin helper is unavailable. Install or repair @openclaw/matrix so OpenClaw can inspect the old rust crypto store before upgrading.";
function resolveMatrixPluginRecord(params) {
	return loadPluginManifestRegistry({
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.find((plugin) => plugin.id === MATRIX_PLUGIN_ID) ?? null;
}
function resolveMatrixLegacyCryptoInspectorPath(params) {
	const plugin = resolveMatrixPluginRecord(params);
	if (!plugin) return { status: "missing" };
	for (const relativePath of MATRIX_HELPER_CANDIDATES) {
		const candidatePath = path.join(plugin.rootDir, relativePath);
		const opened = openBoundaryFileSync({
			absolutePath: candidatePath,
			rootPath: plugin.rootDir,
			boundaryLabel: "plugin root",
			rejectHardlinks: plugin.origin !== "bundled",
			allowedType: "file"
		});
		if (opened.ok) {
			fs.closeSync(opened.fd);
			return {
				status: "ok",
				helperPath: opened.path
			};
		}
		if (opened.reason !== "path") return {
			status: "unsafe",
			candidatePath
		};
	}
	return { status: "missing" };
}
function isMatrixLegacyCryptoInspectorAvailable(params) {
	return resolveMatrixLegacyCryptoInspectorPath(params).status === "ok";
}
let jitiLoader = null;
const inspectorCache = /* @__PURE__ */ new Map();
function getJiti() {
	if (jitiLoader) return jitiLoader;
	jitiLoader = createJiti(import.meta.url, {
		interopDefault: false,
		tryNative: false,
		extensions: [
			".ts",
			".tsx",
			".mts",
			".cts",
			".mtsx",
			".ctsx",
			".js",
			".mjs",
			".cjs",
			".json"
		]
	});
	return jitiLoader;
}
function canRetryWithJiti(error) {
	if (!error || typeof error !== "object") return false;
	const code = "code" in error ? error.code : void 0;
	return code === "ERR_MODULE_NOT_FOUND" || code === "ERR_UNKNOWN_FILE_EXTENSION";
}
function isObjectRecord(value) {
	return typeof value === "object" && value !== null;
}
function resolveInspectorExport(loaded) {
	if (!isObjectRecord(loaded)) return null;
	const directInspector = loaded.inspectLegacyMatrixCryptoStore;
	if (typeof directInspector === "function") return directInspector;
	const directDefault = loaded.default;
	if (typeof directDefault === "function") return directDefault;
	if (!isObjectRecord(directDefault)) return null;
	const nestedInspector = directDefault.inspectLegacyMatrixCryptoStore;
	return typeof nestedInspector === "function" ? nestedInspector : null;
}
async function loadMatrixLegacyCryptoInspector(params) {
	const resolution = resolveMatrixLegacyCryptoInspectorPath(params);
	if (resolution.status === "missing") throw new Error(MATRIX_LEGACY_CRYPTO_INSPECTOR_UNAVAILABLE_MESSAGE);
	if (resolution.status === "unsafe") throw new Error(`Matrix plugin helper path is unsafe: ${resolution.candidatePath}. Reinstall @openclaw/matrix and try again.`);
	const helperPath = resolution.helperPath;
	const cached = inspectorCache.get(helperPath);
	if (cached) return await cached;
	const pending = (async () => {
		let loaded;
		if (shouldPreferNativeJiti(helperPath)) try {
			loaded = await import(pathToFileURL(helperPath).href);
		} catch (error) {
			if (!canRetryWithJiti(error)) throw error;
			loaded = getJiti()(helperPath);
		}
		else loaded = getJiti()(helperPath);
		const inspectLegacyMatrixCryptoStore = resolveInspectorExport(loaded);
		if (!inspectLegacyMatrixCryptoStore) throw new Error(`Matrix plugin helper at ${helperPath} does not export inspectLegacyMatrixCryptoStore(). Reinstall @openclaw/matrix and try again.`);
		return inspectLegacyMatrixCryptoStore;
	})();
	inspectorCache.set(helperPath, pending);
	try {
		return await pending;
	} catch (err) {
		inspectorCache.delete(helperPath);
		throw err;
	}
}
//#endregion
//#region src/infra/matrix-legacy-crypto.ts
function detectLegacyBotSdkCryptoStore(cryptoRootDir) {
	try {
		if (!fs.statSync(cryptoRootDir).isDirectory()) return {
			detected: false,
			warning: `Legacy Matrix encrypted state path exists but is not a directory: ${cryptoRootDir}. OpenClaw skipped automatic crypto migration for that path.`
		};
	} catch (err) {
		return {
			detected: false,
			warning: `Failed reading legacy Matrix encrypted state path (${cryptoRootDir}): ${String(err)}. OpenClaw skipped automatic crypto migration for that path.`
		};
	}
	try {
		return { detected: fs.existsSync(path.join(cryptoRootDir, "bot-sdk.json")) || fs.existsSync(path.join(cryptoRootDir, "matrix-sdk-crypto.sqlite3")) || fs.readdirSync(cryptoRootDir, { withFileTypes: true }).some((entry) => entry.isDirectory() && fs.existsSync(path.join(cryptoRootDir, entry.name, "matrix-sdk-crypto.sqlite3"))) };
	} catch (err) {
		return {
			detected: false,
			warning: `Failed scanning legacy Matrix encrypted state path (${cryptoRootDir}): ${String(err)}. OpenClaw skipped automatic crypto migration for that path.`
		};
	}
}
function resolveMatrixAccountIds(cfg) {
	return resolveConfiguredMatrixAccountIds(cfg);
}
function resolveLegacyMatrixFlatStorePlan(params) {
	const legacy = resolveMatrixLegacyFlatStoragePaths(resolveStateDir(params.env, os.homedir));
	if (!fs.existsSync(legacy.cryptoPath)) return null;
	const legacyStore = detectLegacyBotSdkCryptoStore(legacy.cryptoPath);
	if (legacyStore.warning) return { warning: legacyStore.warning };
	if (!legacyStore.detected) return null;
	const target = resolveLegacyMatrixFlatStoreTarget({
		cfg: params.cfg,
		env: params.env,
		detectedPath: legacy.cryptoPath,
		detectedKind: "encrypted state"
	});
	if ("warning" in target) return target;
	const metadata = loadLegacyBotSdkMetadata(legacy.cryptoPath);
	return {
		accountId: target.accountId,
		rootDir: target.rootDir,
		recoveryKeyPath: path.join(target.rootDir, "recovery-key.json"),
		statePath: path.join(target.rootDir, "legacy-crypto-migration.json"),
		legacyCryptoPath: legacy.cryptoPath,
		homeserver: target.homeserver,
		userId: target.userId,
		accessToken: target.accessToken,
		deviceId: metadata.deviceId ?? target.storedDeviceId
	};
}
function loadLegacyBotSdkMetadata(cryptoRootDir) {
	const metadataPath = path.join(cryptoRootDir, "bot-sdk.json");
	const fallback = { deviceId: null };
	try {
		if (!fs.existsSync(metadataPath)) return fallback;
		const parsed = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
		return { deviceId: typeof parsed.deviceId === "string" && parsed.deviceId.trim() ? parsed.deviceId : null };
	} catch {
		return fallback;
	}
}
function resolveMatrixLegacyCryptoPlans(params) {
	const warnings = [];
	const plans = [];
	const flatPlan = resolveLegacyMatrixFlatStorePlan(params);
	if (flatPlan) if ("warning" in flatPlan) warnings.push(flatPlan.warning);
	else plans.push(flatPlan);
	for (const accountId of resolveMatrixAccountIds(params.cfg)) {
		const target = resolveMatrixMigrationAccountTarget({
			cfg: params.cfg,
			env: params.env,
			accountId
		});
		if (!target) continue;
		const legacyCryptoPath = path.join(target.rootDir, "crypto");
		if (!fs.existsSync(legacyCryptoPath)) continue;
		const detectedStore = detectLegacyBotSdkCryptoStore(legacyCryptoPath);
		if (detectedStore.warning) {
			warnings.push(detectedStore.warning);
			continue;
		}
		if (!detectedStore.detected) continue;
		if (plans.some((plan) => plan.accountId === accountId && path.resolve(plan.legacyCryptoPath) === path.resolve(legacyCryptoPath))) continue;
		const metadata = loadLegacyBotSdkMetadata(legacyCryptoPath);
		plans.push({
			accountId: target.accountId,
			rootDir: target.rootDir,
			recoveryKeyPath: path.join(target.rootDir, "recovery-key.json"),
			statePath: path.join(target.rootDir, "legacy-crypto-migration.json"),
			legacyCryptoPath,
			homeserver: target.homeserver,
			userId: target.userId,
			accessToken: target.accessToken,
			deviceId: metadata.deviceId ?? target.storedDeviceId
		});
	}
	return {
		plans,
		warnings
	};
}
function loadStoredRecoveryKey(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}
}
function loadLegacyCryptoMigrationState(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}
}
async function persistLegacyMigrationState(params) {
	await params.writeJsonFileAtomically(params.filePath, params.state);
}
function detectLegacyMatrixCrypto(params) {
	const detection = resolveMatrixLegacyCryptoPlans({
		cfg: params.cfg,
		env: params.env ?? process.env
	});
	if (detection.plans.length > 0 && !isMatrixLegacyCryptoInspectorAvailable({
		cfg: params.cfg,
		env: params.env
	})) return {
		plans: detection.plans,
		warnings: [...detection.warnings, MATRIX_LEGACY_CRYPTO_INSPECTOR_UNAVAILABLE_MESSAGE]
	};
	return detection;
}
async function autoPrepareLegacyMatrixCrypto(params) {
	const env = params.env ?? process.env;
	const detection = params.deps?.inspectLegacyStore ? resolveMatrixLegacyCryptoPlans({
		cfg: params.cfg,
		env
	}) : detectLegacyMatrixCrypto({
		cfg: params.cfg,
		env
	});
	const warnings = [...detection.warnings];
	const changes = [];
	let inspectLegacyStore = params.deps?.inspectLegacyStore;
	const writeJsonFileAtomically$1 = params.deps?.writeJsonFileAtomically ?? writeJsonFileAtomically;
	if (!inspectLegacyStore) try {
		inspectLegacyStore = await loadMatrixLegacyCryptoInspector({
			cfg: params.cfg,
			env
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		if (!warnings.includes(message)) warnings.push(message);
		if (warnings.length > 0) params.log?.warn?.(`matrix: legacy encrypted-state warnings:\n${warnings.map((entry) => `- ${entry}`).join("\n")}`);
		return {
			migrated: false,
			changes,
			warnings
		};
	}
	for (const plan of detection.plans) {
		if (loadLegacyCryptoMigrationState(plan.statePath)?.version === 1) continue;
		if (!plan.deviceId) {
			warnings.push(`Legacy Matrix encrypted state detected at ${plan.legacyCryptoPath}, but no device ID was found for account "${plan.accountId}". OpenClaw will continue, but old encrypted history cannot be recovered automatically.`);
			continue;
		}
		let summary;
		try {
			summary = await inspectLegacyStore({
				cryptoRootDir: plan.legacyCryptoPath,
				userId: plan.userId,
				deviceId: plan.deviceId,
				log: params.log?.info
			});
		} catch (err) {
			warnings.push(`Failed inspecting legacy Matrix encrypted state for account "${plan.accountId}" (${plan.legacyCryptoPath}): ${String(err)}`);
			continue;
		}
		let decryptionKeyImported = false;
		if (summary.decryptionKeyBase64) {
			const existingRecoveryKey = loadStoredRecoveryKey(plan.recoveryKeyPath);
			if (existingRecoveryKey?.privateKeyBase64 && existingRecoveryKey.privateKeyBase64 !== summary.decryptionKeyBase64) warnings.push(`Legacy Matrix backup key was found for account "${plan.accountId}", but ${plan.recoveryKeyPath} already contains a different recovery key. Leaving the existing file unchanged.`);
			else if (!existingRecoveryKey?.privateKeyBase64) {
				const payload = {
					version: 1,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					keyId: null,
					privateKeyBase64: summary.decryptionKeyBase64
				};
				try {
					await writeJsonFileAtomically$1(plan.recoveryKeyPath, payload);
					changes.push(`Imported Matrix legacy backup key for account "${plan.accountId}": ${plan.recoveryKeyPath}`);
					decryptionKeyImported = true;
				} catch (err) {
					warnings.push(`Failed writing Matrix recovery key for account "${plan.accountId}" (${plan.recoveryKeyPath}): ${String(err)}`);
				}
			} else decryptionKeyImported = true;
		}
		const localOnlyKeys = summary.roomKeyCounts && summary.roomKeyCounts.total > summary.roomKeyCounts.backedUp ? summary.roomKeyCounts.total - summary.roomKeyCounts.backedUp : 0;
		if (localOnlyKeys > 0) warnings.push(`Legacy Matrix encrypted state for account "${plan.accountId}" contains ${localOnlyKeys} room key(s) that were never backed up. Backed-up keys can be restored automatically, but local-only encrypted history may remain unavailable after upgrade.`);
		if (!summary.decryptionKeyBase64 && (summary.roomKeyCounts?.backedUp ?? 0) > 0) warnings.push(`Legacy Matrix encrypted state for account "${plan.accountId}" has backed-up room keys, but no local backup decryption key was found. Ask the operator to run "openclaw matrix verify backup restore --recovery-key <key>" after upgrade if they have the recovery key.`);
		if (!summary.decryptionKeyBase64 && (summary.roomKeyCounts?.total ?? 0) > 0) warnings.push(`Legacy Matrix encrypted state for account "${plan.accountId}" cannot be fully converted automatically because the old rust crypto store does not expose all local room keys for export.`);
		if (summary.decryptionKeyBase64 && !decryptionKeyImported && !loadStoredRecoveryKey(plan.recoveryKeyPath)) continue;
		const state = {
			version: 1,
			source: "matrix-bot-sdk-rust",
			accountId: plan.accountId,
			deviceId: summary.deviceId,
			roomKeyCounts: summary.roomKeyCounts,
			backupVersion: summary.backupVersion,
			decryptionKeyImported,
			restoreStatus: decryptionKeyImported ? "pending" : "manual-action-required",
			detectedAt: (/* @__PURE__ */ new Date()).toISOString(),
			lastError: null
		};
		try {
			await persistLegacyMigrationState({
				filePath: plan.statePath,
				state,
				writeJsonFileAtomically: writeJsonFileAtomically$1
			});
			changes.push(`Prepared Matrix legacy encrypted-state migration for account "${plan.accountId}": ${plan.statePath}`);
		} catch (err) {
			warnings.push(`Failed writing Matrix legacy encrypted-state migration record for account "${plan.accountId}" (${plan.statePath}): ${String(err)}`);
		}
	}
	if (changes.length > 0) params.log?.info?.(`matrix: prepared encrypted-state upgrade.\n${changes.map((entry) => `- ${entry}`).join("\n")}`);
	if (warnings.length > 0) params.log?.warn?.(`matrix: legacy encrypted-state warnings:\n${warnings.map((entry) => `- ${entry}`).join("\n")}`);
	return {
		migrated: changes.length > 0,
		changes,
		warnings
	};
}
//#endregion
//#region src/infra/matrix-legacy-state.ts
function resolveLegacyMatrixPaths(env) {
	return resolveMatrixLegacyFlatStoragePaths(resolveStateDir(env, os.homedir));
}
function resolveMatrixMigrationPlan(params) {
	const legacy = resolveLegacyMatrixPaths(params.env);
	if (!fs.existsSync(legacy.storagePath) && !fs.existsSync(legacy.cryptoPath)) return null;
	const target = resolveLegacyMatrixFlatStoreTarget({
		cfg: params.cfg,
		env: params.env,
		detectedPath: legacy.rootDir,
		detectedKind: "state"
	});
	if ("warning" in target) return target;
	return {
		accountId: target.accountId,
		legacyStoragePath: legacy.storagePath,
		legacyCryptoPath: legacy.cryptoPath,
		targetRootDir: target.rootDir,
		targetStoragePath: path.join(target.rootDir, "bot-storage.json"),
		targetCryptoPath: path.join(target.rootDir, "crypto"),
		selectionNote: target.selectionNote
	};
}
function detectLegacyMatrixState(params) {
	return resolveMatrixMigrationPlan({
		cfg: params.cfg,
		env: params.env ?? process.env
	});
}
function moveLegacyPath(params) {
	if (!fs.existsSync(params.sourcePath)) return;
	if (fs.existsSync(params.targetPath)) {
		params.warnings.push(`Matrix legacy ${params.label} not migrated because the target already exists (${params.targetPath}).`);
		return;
	}
	try {
		fs.mkdirSync(path.dirname(params.targetPath), { recursive: true });
		fs.renameSync(params.sourcePath, params.targetPath);
		params.changes.push(`Migrated Matrix legacy ${params.label}: ${params.sourcePath} -> ${params.targetPath}`);
	} catch (err) {
		params.warnings.push(`Failed migrating Matrix legacy ${params.label} (${params.sourcePath} -> ${params.targetPath}): ${String(err)}`);
	}
}
async function autoMigrateLegacyMatrixState(params) {
	const env = params.env ?? process.env;
	const detection = detectLegacyMatrixState({
		cfg: params.cfg,
		env
	});
	if (!detection) return {
		migrated: false,
		changes: [],
		warnings: []
	};
	if ("warning" in detection) {
		params.log?.warn?.(`matrix: ${detection.warning}`);
		return {
			migrated: false,
			changes: [],
			warnings: [detection.warning]
		};
	}
	const changes = [];
	const warnings = [];
	moveLegacyPath({
		sourcePath: detection.legacyStoragePath,
		targetPath: detection.targetStoragePath,
		label: "sync store",
		changes,
		warnings
	});
	moveLegacyPath({
		sourcePath: detection.legacyCryptoPath,
		targetPath: detection.targetCryptoPath,
		label: "crypto store",
		changes,
		warnings
	});
	if (changes.length > 0) {
		const details = [
			...changes.map((entry) => `- ${entry}`),
			...detection.selectionNote ? [`- ${detection.selectionNote}`] : [],
			"- No user action required."
		];
		params.log?.info?.(`matrix: plugin upgraded in place for account "${detection.accountId}".\n${details.join("\n")}`);
	}
	if (warnings.length > 0) params.log?.warn?.(`matrix: legacy state migration warnings:\n${warnings.map((entry) => `- ${entry}`).join("\n")}`);
	return {
		migrated: changes.length > 0,
		changes,
		warnings
	};
}
//#endregion
//#region src/infra/matrix-migration-snapshot.ts
const MATRIX_MIGRATION_SNAPSHOT_DIRNAME = "openclaw-migrations";
function loadSnapshotMarker(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
		if (parsed.version !== 1 || typeof parsed.createdAt !== "string" || typeof parsed.archivePath !== "string" || typeof parsed.trigger !== "string") return null;
		return {
			version: 1,
			createdAt: parsed.createdAt,
			archivePath: parsed.archivePath,
			trigger: parsed.trigger,
			includeWorkspace: parsed.includeWorkspace === true
		};
	} catch {
		return null;
	}
}
function resolveMatrixMigrationSnapshotMarkerPath(env = process.env) {
	const stateDir = resolveStateDir(env, os.homedir);
	return path.join(stateDir, "matrix", "migration-snapshot.json");
}
function resolveMatrixMigrationSnapshotOutputDir(env = process.env) {
	const homeDir = resolveRequiredHomeDir(env, os.homedir);
	return path.join(homeDir, "Backups", MATRIX_MIGRATION_SNAPSHOT_DIRNAME);
}
function hasPendingMatrixMigration(params) {
	const env = params.env ?? process.env;
	if (detectLegacyMatrixState({
		cfg: params.cfg,
		env
	})) return true;
	const legacyCrypto = detectLegacyMatrixCrypto({
		cfg: params.cfg,
		env
	});
	return legacyCrypto.plans.length > 0 || legacyCrypto.warnings.length > 0;
}
function hasActionableMatrixMigration(params) {
	const env = params.env ?? process.env;
	const legacyState = detectLegacyMatrixState({
		cfg: params.cfg,
		env
	});
	if (legacyState && !("warning" in legacyState)) return true;
	return detectLegacyMatrixCrypto({
		cfg: params.cfg,
		env
	}).plans.length > 0 && isMatrixLegacyCryptoInspectorAvailable({
		cfg: params.cfg,
		env
	});
}
async function maybeCreateMatrixMigrationSnapshot(params) {
	const env = params.env ?? process.env;
	const markerPath = resolveMatrixMigrationSnapshotMarkerPath(env);
	const existingMarker = loadSnapshotMarker(markerPath);
	if (existingMarker?.archivePath && fs.existsSync(existingMarker.archivePath)) {
		params.log?.info?.(`matrix: reusing existing pre-migration backup snapshot: ${existingMarker.archivePath}`);
		return {
			created: false,
			archivePath: existingMarker.archivePath,
			markerPath
		};
	}
	if (existingMarker?.archivePath && !fs.existsSync(existingMarker.archivePath)) params.log?.warn?.(`matrix: previous migration snapshot is missing (${existingMarker.archivePath}); creating a replacement backup before continuing`);
	const snapshot = await createBackupArchive({
		output: (() => {
			const outputDir = params.outputDir ?? resolveMatrixMigrationSnapshotOutputDir(env);
			fs.mkdirSync(outputDir, { recursive: true });
			return outputDir;
		})(),
		includeWorkspace: false
	});
	await writeJsonFileAtomically(markerPath, {
		version: 1,
		createdAt: snapshot.createdAt,
		archivePath: snapshot.archivePath,
		trigger: params.trigger,
		includeWorkspace: snapshot.includeWorkspace
	});
	params.log?.info?.(`matrix: created pre-migration backup snapshot: ${snapshot.archivePath}`);
	return {
		created: true,
		archivePath: snapshot.archivePath,
		markerPath
	};
}
//#endregion
export { detectLegacyMatrixState as a, autoMigrateLegacyMatrixState as i, hasPendingMatrixMigration as n, autoPrepareLegacyMatrixCrypto as o, maybeCreateMatrixMigrationSnapshot as r, detectLegacyMatrixCrypto as s, hasActionableMatrixMigration as t };
