import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { d as setRuntimeConfigSnapshotRefreshHandler, t as clearRuntimeConfigSnapshot, u as setRuntimeConfigSnapshot } from "./runtime-snapshot-BwqEmc6G.js";
import { b as resolveAgentWorkspaceDir, g as listAgentIds, x as resolveDefaultAgentId, y as resolveAgentDir } from "./agent-scope-KFH9bkHi.js";
import "./config-Q9XZc_2I.js";
import { o as loadAuthProfileStoreForSecretsRuntime, s as replaceRuntimeAuthProfileStoreSnapshots, t as clearRuntimeAuthProfileStoreSnapshots } from "./store-C1I9Mkh8.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import "./auth-profiles-BQEgLpFI.js";
import { n as getActiveRuntimeWebToolsMetadata$1, r as setActiveRuntimeWebToolsMetadata, t as clearActiveRuntimeWebToolsMetadata } from "./runtime-web-tools-state-DuT4kvJs.js";
//#region src/secrets/runtime.ts
const RUNTIME_PATH_ENV_KEYS = [
	"HOME",
	"USERPROFILE",
	"HOMEDRIVE",
	"HOMEPATH",
	"OPENCLAW_HOME",
	"OPENCLAW_STATE_DIR",
	"OPENCLAW_CONFIG_PATH",
	"OPENCLAW_AGENT_DIR",
	"PI_CODING_AGENT_DIR",
	"OPENCLAW_TEST_FAST"
];
let activeSnapshot = null;
let activeRefreshContext = null;
const preparedSnapshotRefreshContext = /* @__PURE__ */ new WeakMap();
let runtimeManifestPromise = null;
let runtimePreparePromise = null;
function loadRuntimeManifestHelpers() {
	runtimeManifestPromise ??= import("./runtime-manifest.runtime-BDbLcRC0.js");
	return runtimeManifestPromise;
}
function loadRuntimePrepareHelpers() {
	runtimePreparePromise ??= import("./runtime-prepare.runtime-DgfYp7Rb.js");
	return runtimePreparePromise;
}
function cloneSnapshot(snapshot) {
	return {
		sourceConfig: structuredClone(snapshot.sourceConfig),
		config: structuredClone(snapshot.config),
		authStores: snapshot.authStores.map((entry) => ({
			agentDir: entry.agentDir,
			store: structuredClone(entry.store)
		})),
		warnings: snapshot.warnings.map((warning) => ({ ...warning })),
		webTools: structuredClone(snapshot.webTools)
	};
}
function cloneRefreshContext(context) {
	return {
		env: { ...context.env },
		explicitAgentDirs: context.explicitAgentDirs ? [...context.explicitAgentDirs] : null,
		loadAuthStore: context.loadAuthStore,
		loadablePluginOrigins: new Map(context.loadablePluginOrigins)
	};
}
function clearActiveSecretsRuntimeState() {
	activeSnapshot = null;
	activeRefreshContext = null;
	clearActiveRuntimeWebToolsMetadata();
	setRuntimeConfigSnapshotRefreshHandler(null);
	clearRuntimeConfigSnapshot();
	clearRuntimeAuthProfileStoreSnapshots();
}
function collectCandidateAgentDirs(config, env = process.env) {
	const dirs = /* @__PURE__ */ new Set();
	dirs.add(resolveUserPath(resolveOpenClawAgentDir(env), env));
	for (const agentId of listAgentIds(config)) dirs.add(resolveUserPath(resolveAgentDir(config, agentId, env), env));
	return [...dirs];
}
function resolveRefreshAgentDirs(config, context) {
	const configDerived = collectCandidateAgentDirs(config, context.env);
	if (!context.explicitAgentDirs || context.explicitAgentDirs.length === 0) return configDerived;
	return [...new Set([...context.explicitAgentDirs, ...configDerived])];
}
async function resolveLoadablePluginOrigins(params) {
	const workspaceDir = resolveAgentWorkspaceDir(params.config, resolveDefaultAgentId(params.config));
	const { loadPluginManifestRegistry } = await loadRuntimeManifestHelpers();
	const manifestRegistry = loadPluginManifestRegistry({
		config: params.config,
		workspaceDir,
		cache: true,
		env: params.env
	});
	return new Map(manifestRegistry.plugins.map((record) => [record.id, record.origin]));
}
function mergeSecretsRuntimeEnv(env) {
	const merged = { ...env ?? process.env };
	for (const key of RUNTIME_PATH_ENV_KEYS) {
		if (merged[key] !== void 0) continue;
		const processValue = process.env[key];
		if (processValue !== void 0) merged[key] = processValue;
	}
	return merged;
}
function hasConfiguredPluginEntries(config) {
	const entries = config.plugins?.entries;
	return !!entries && typeof entries === "object" && !Array.isArray(entries) && Object.keys(entries).length > 0;
}
async function prepareSecretsRuntimeSnapshot(params) {
	const { applyResolvedAssignments, collectAuthStoreAssignments, collectConfigAssignments, createResolverContext, resolveRuntimeWebTools, resolveSecretRefValues } = await loadRuntimePrepareHelpers();
	const runtimeEnv = mergeSecretsRuntimeEnv(params.env);
	const sourceConfig = structuredClone(params.config);
	const resolvedConfig = structuredClone(params.config);
	const loadablePluginOrigins = params.loadablePluginOrigins ?? (hasConfiguredPluginEntries(sourceConfig) ? await resolveLoadablePluginOrigins({
		config: sourceConfig,
		env: runtimeEnv
	}) : /* @__PURE__ */ new Map());
	const context = createResolverContext({
		sourceConfig,
		env: runtimeEnv
	});
	collectConfigAssignments({
		config: resolvedConfig,
		context,
		loadablePluginOrigins
	});
	const includeAuthStoreRefs = params.includeAuthStoreRefs ?? true;
	const authStores = [];
	const loadAuthStore = params.loadAuthStore ?? loadAuthProfileStoreForSecretsRuntime;
	const candidateDirs = params.agentDirs?.length ? [...new Set(params.agentDirs.map((entry) => resolveUserPath(entry, runtimeEnv)))] : collectCandidateAgentDirs(resolvedConfig, runtimeEnv);
	if (includeAuthStoreRefs) for (const agentDir of candidateDirs) {
		const store = structuredClone(loadAuthStore(agentDir));
		collectAuthStoreAssignments({
			store,
			context,
			agentDir
		});
		authStores.push({
			agentDir,
			store
		});
	}
	if (context.assignments.length > 0) {
		const resolved = await resolveSecretRefValues(context.assignments.map((assignment) => assignment.ref), {
			config: sourceConfig,
			env: context.env,
			cache: context.cache
		});
		applyResolvedAssignments({
			assignments: context.assignments,
			resolved
		});
	}
	const snapshot = {
		sourceConfig,
		config: resolvedConfig,
		authStores,
		warnings: context.warnings,
		webTools: await resolveRuntimeWebTools({
			sourceConfig,
			resolvedConfig,
			context
		})
	};
	preparedSnapshotRefreshContext.set(snapshot, {
		env: runtimeEnv,
		explicitAgentDirs: params.agentDirs?.length ? [...candidateDirs] : null,
		loadAuthStore,
		loadablePluginOrigins
	});
	return snapshot;
}
function activateSecretsRuntimeSnapshot(snapshot) {
	const next = cloneSnapshot(snapshot);
	const refreshContext = preparedSnapshotRefreshContext.get(snapshot) ?? activeRefreshContext ?? {
		env: { ...process.env },
		explicitAgentDirs: null,
		loadAuthStore: loadAuthProfileStoreForSecretsRuntime,
		loadablePluginOrigins: /* @__PURE__ */ new Map()
	};
	setRuntimeConfigSnapshot(next.config, next.sourceConfig);
	replaceRuntimeAuthProfileStoreSnapshots(next.authStores);
	activeSnapshot = next;
	activeRefreshContext = cloneRefreshContext(refreshContext);
	setActiveRuntimeWebToolsMetadata(next.webTools);
	setRuntimeConfigSnapshotRefreshHandler({ refresh: async ({ sourceConfig }) => {
		if (!activeSnapshot || !activeRefreshContext) return false;
		activateSecretsRuntimeSnapshot(await prepareSecretsRuntimeSnapshot({
			config: sourceConfig,
			env: activeRefreshContext.env,
			agentDirs: resolveRefreshAgentDirs(sourceConfig, activeRefreshContext),
			loadAuthStore: activeRefreshContext.loadAuthStore,
			loadablePluginOrigins: activeRefreshContext.loadablePluginOrigins
		}));
		return true;
	} });
}
function getActiveSecretsRuntimeSnapshot() {
	if (!activeSnapshot) return null;
	const snapshot = cloneSnapshot(activeSnapshot);
	if (activeRefreshContext) preparedSnapshotRefreshContext.set(snapshot, cloneRefreshContext(activeRefreshContext));
	return snapshot;
}
function getActiveRuntimeWebToolsMetadata() {
	return getActiveRuntimeWebToolsMetadata$1();
}
function clearSecretsRuntimeSnapshot() {
	clearActiveSecretsRuntimeState();
}
//#endregion
export { prepareSecretsRuntimeSnapshot as a, getActiveSecretsRuntimeSnapshot as i, clearSecretsRuntimeSnapshot as n, getActiveRuntimeWebToolsMetadata as r, activateSecretsRuntimeSnapshot as t };
