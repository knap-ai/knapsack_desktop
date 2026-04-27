import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { t as formatCliCommand } from "./command-format-BFuugklF.js";
import { i as normalizeEnvVarKey, n as isDangerousHostEnvOverrideVarName, r as isDangerousHostEnvVarName } from "./host-env-security-Btzm9BXg.js";
import { t as collectDurableServiceEnvVars } from "./state-dir-dotenv-ZLC8-JVP.js";
import { d as resolveGatewayLaunchAgentLabel } from "./paths-CT9AMIex.js";
import { i as resolveGatewayProgramArguments, n as resolveDaemonInstallRuntimeInputs, r as resolveDaemonNodeBinDir, t as emitDaemonInstallRuntimeWarning } from "./daemon-install-plan.shared-fVpeywJV.js";
import { c as buildServiceEnvironment } from "./runtime-paths-CCzEV4ja.js";
import { o as hasConfiguredSecretInput } from "./types.secrets-Zn5Zyn7M.js";
import path from "node:path";
import os from "node:os";
//#region src/commands/daemon-install-helpers.ts
const MANAGED_SERVICE_ENV_KEYS_VAR = "OPENCLAW_SERVICE_MANAGED_ENV_KEYS";
let daemonInstallAuthProfileSourceRuntimePromise;
let daemonInstallAuthProfileStoreRuntimePromise;
function loadDaemonInstallAuthProfileSourceRuntime() {
	daemonInstallAuthProfileSourceRuntimePromise ??= import("./daemon-install-auth-profiles-source.runtime-DHZfk7bU.js");
	return daemonInstallAuthProfileSourceRuntimePromise;
}
function loadDaemonInstallAuthProfileStoreRuntime() {
	daemonInstallAuthProfileStoreRuntimePromise ??= import("./daemon-install-auth-profiles-store.runtime-DhuVlX1V.js");
	return daemonInstallAuthProfileStoreRuntimePromise;
}
async function collectAuthProfileServiceEnvVars(params) {
	let authStore = params.authStore;
	if (!authStore) {
		const { hasAnyAuthProfileStoreSource } = await loadDaemonInstallAuthProfileSourceRuntime();
		if (!hasAnyAuthProfileStoreSource()) return {};
		const { loadAuthProfileStoreForSecretsRuntime } = await loadDaemonInstallAuthProfileStoreRuntime();
		authStore = loadAuthProfileStoreForSecretsRuntime();
	}
	if (!authStore) return {};
	const entries = {};
	for (const credential of Object.values(authStore.profiles)) {
		const ref = credential.type === "api_key" ? credential.keyRef : credential.type === "token" ? credential.tokenRef : void 0;
		if (!ref || ref.source !== "env") continue;
		const key = normalizeEnvVarKey(ref.id, { portable: true });
		if (!key) continue;
		if (isDangerousHostEnvVarName(key) || isDangerousHostEnvOverrideVarName(key)) {
			params.warn?.(`Auth profile env ref "${key}" blocked by host-env security policy`, "Auth profile");
			continue;
		}
		const value = params.env[key]?.trim();
		if (!value) continue;
		entries[key] = value;
	}
	return entries;
}
function mergeServicePath(nextPath, existingPath, tmpDir) {
	const segments = [];
	const seen = /* @__PURE__ */ new Set();
	const normalizedTmpDirs = [tmpDir, os.tmpdir()].map((value) => value?.trim()).filter((value) => Boolean(value)).map((value) => path.resolve(value));
	const shouldPreservePathSegment = (segment) => {
		if (!path.isAbsolute(segment)) return false;
		const resolved = path.resolve(segment);
		return !normalizedTmpDirs.some((tmpRoot) => resolved === tmpRoot || resolved.startsWith(`${tmpRoot}${path.sep}`));
	};
	const addPath = (value, options) => {
		if (typeof value !== "string" || value.trim().length === 0) return;
		for (const segment of value.split(path.delimiter)) {
			const trimmed = segment.trim();
			if (options?.preserve && !shouldPreservePathSegment(trimmed)) continue;
			if (!trimmed || seen.has(trimmed)) continue;
			seen.add(trimmed);
			segments.push(trimmed);
		}
	};
	addPath(nextPath);
	addPath(existingPath, { preserve: true });
	return segments.length > 0 ? segments.join(path.delimiter) : void 0;
}
function readManagedServiceEnvKeys(existingEnvironment) {
	if (!existingEnvironment) return /* @__PURE__ */ new Set();
	for (const [rawKey, rawValue] of Object.entries(existingEnvironment)) {
		const key = normalizeEnvVarKey(rawKey, { portable: true });
		if (!key || key.toUpperCase() !== MANAGED_SERVICE_ENV_KEYS_VAR) continue;
		return new Set(rawValue?.split(",").flatMap((value) => {
			const normalized = normalizeEnvVarKey(value, { portable: true });
			return normalized ? [normalized.toUpperCase()] : [];
		}) ?? []);
	}
	return /* @__PURE__ */ new Set();
}
function formatManagedServiceEnvKeys(managedEnvironment) {
	const keys = Object.keys(managedEnvironment).flatMap((key) => {
		const normalized = normalizeEnvVarKey(key, { portable: true });
		return normalized ? [normalized.toUpperCase()] : [];
	}).toSorted();
	return keys.length > 0 ? keys.join(",") : void 0;
}
function collectPreservedExistingServiceEnvVars(existingEnvironment, managedServiceEnvKeys) {
	if (!existingEnvironment) return {};
	const preserved = {};
	for (const [rawKey, rawValue] of Object.entries(existingEnvironment)) {
		const key = normalizeEnvVarKey(rawKey, { portable: true });
		if (!key) continue;
		const upper = key.toUpperCase();
		if (upper === "HOME" || upper === "PATH" || upper === "TMPDIR" || upper.startsWith("OPENCLAW_")) continue;
		if (managedServiceEnvKeys.has(upper)) continue;
		if (isDangerousHostEnvVarName(key) || isDangerousHostEnvOverrideVarName(key)) continue;
		const value = rawValue?.trim();
		if (!value) continue;
		preserved[key] = value;
	}
	return preserved;
}
async function buildGatewayInstallEnvironment(params) {
	const managedEnvironment = {
		...collectDurableServiceEnvVars({
			env: params.env,
			config: params.config
		}),
		...await collectAuthProfileServiceEnvVars({
			env: params.env,
			authStore: params.authStore,
			warn: params.warn
		})
	};
	const environment = {
		...collectPreservedExistingServiceEnvVars(params.existingEnvironment, readManagedServiceEnvKeys(params.existingEnvironment)),
		...managedEnvironment
	};
	Object.assign(environment, params.serviceEnvironment);
	const mergedPath = mergeServicePath(params.serviceEnvironment.PATH, params.existingEnvironment?.PATH, params.serviceEnvironment.TMPDIR);
	if (mergedPath) environment.PATH = mergedPath;
	const managedServiceEnvKeys = formatManagedServiceEnvKeys(managedEnvironment);
	if (managedServiceEnvKeys) environment[MANAGED_SERVICE_ENV_KEYS_VAR] = managedServiceEnvKeys;
	return environment;
}
async function buildGatewayInstallPlan(params) {
	const { devMode, nodePath } = await resolveDaemonInstallRuntimeInputs({
		env: params.env,
		runtime: params.runtime,
		devMode: params.devMode,
		nodePath: params.nodePath
	});
	const { programArguments, workingDirectory } = await resolveGatewayProgramArguments({
		port: params.port,
		dev: devMode,
		runtime: params.runtime,
		nodePath
	});
	await emitDaemonInstallRuntimeWarning({
		env: params.env,
		runtime: params.runtime,
		programArguments,
		warn: params.warn,
		title: "Gateway runtime"
	});
	const serviceEnvironment = buildServiceEnvironment({
		env: params.env,
		port: params.port,
		launchdLabel: process.platform === "darwin" ? resolveGatewayLaunchAgentLabel(params.env.OPENCLAW_PROFILE) : void 0,
		extraPathDirs: resolveDaemonNodeBinDir(nodePath)
	});
	return {
		programArguments,
		workingDirectory,
		environment: await buildGatewayInstallEnvironment({
			env: params.env,
			config: params.config,
			authStore: params.authStore,
			warn: params.warn,
			serviceEnvironment,
			existingEnvironment: params.existingEnvironment
		})
	};
}
function gatewayInstallErrorHint(platform = process.platform) {
	return platform === "win32" ? "Tip: native Windows now falls back to a per-user Startup-folder login item when Scheduled Task creation is denied; if install still fails, rerun from an elevated PowerShell or skip service install." : `Tip: rerun \`${formatCliCommand("openclaw gateway install")}\` after fixing the error.`;
}
//#endregion
//#region src/gateway/auth-install-policy.ts
function hasExplicitGatewayInstallAuthMode(mode) {
	if (mode === "token") return true;
	if (mode === "password" || mode === "none" || mode === "trusted-proxy") return false;
}
function hasConfiguredGatewayPasswordForInstall(cfg) {
	return hasConfiguredSecretInput(cfg.gateway?.auth?.password, cfg.secrets?.defaults);
}
function hasDurableGatewayPasswordEnvForInstall(cfg, env) {
	const durableServiceEnv = collectDurableServiceEnvVars({
		env,
		config: cfg
	});
	return Boolean(normalizeOptionalString(durableServiceEnv.OPENCLAW_GATEWAY_PASSWORD) || normalizeOptionalString(durableServiceEnv.CLAWDBOT_GATEWAY_PASSWORD));
}
function shouldRequireGatewayTokenForInstall(cfg, env) {
	const explicitModeDecision = hasExplicitGatewayInstallAuthMode(cfg.gateway?.auth?.mode);
	if (explicitModeDecision !== void 0) return explicitModeDecision;
	if (hasConfiguredGatewayPasswordForInstall(cfg)) return false;
	if (hasDurableGatewayPasswordEnvForInstall(cfg, env)) return false;
	return true;
}
//#endregion
export { buildGatewayInstallPlan as n, gatewayInstallErrorHint as r, shouldRequireGatewayTokenForInstall as t };
