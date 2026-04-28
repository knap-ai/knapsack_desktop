import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as formatCliCommand } from "./command-format-BORwwHyH.js";
import { i as normalizeEnvVarKey, n as isDangerousHostEnvOverrideVarName, r as isDangerousHostEnvVarName } from "./host-env-security-DZcto3_u.js";
import { t as collectDurableServiceEnvVars } from "./state-dir-dotenv-DAjQHBxO.js";
import { d as resolveGatewayLaunchAgentLabel, t as resolveGatewayStateDir } from "./paths-Dxz5MWt4.js";
import { a as resolveGatewayProgramArguments, i as OPENCLAW_WRAPPER_ENV_KEY, n as resolveDaemonInstallRuntimeInputs, r as resolveDaemonNodeBinDir, s as resolveOpenClawWrapperPath, t as emitDaemonInstallRuntimeWarning } from "./daemon-install-plan.shared-RHE7zPtY.js";
import { c as formatManagedServiceEnvKeys, d as readManagedServiceEnvKeysFromEnvironment, f as writeManagedServiceEnvKeysToEnvironment, h as buildServiceEnvironment } from "./runtime-paths-C81fwo06.js";
import { o as hasConfiguredSecretInput } from "./types.secrets-ClP-vJ-P.js";
import path from "node:path";
import os from "node:os";
//#region src/commands/daemon-install-helpers.ts
let daemonInstallAuthProfileSourceRuntimePromise;
let daemonInstallAuthProfileStoreRuntimePromise;
function loadDaemonInstallAuthProfileSourceRuntime() {
	daemonInstallAuthProfileSourceRuntimePromise ??= import("./daemon-install-auth-profiles-source.runtime-9V3Whnri.js");
	return daemonInstallAuthProfileSourceRuntimePromise;
}
function loadDaemonInstallAuthProfileStoreRuntime() {
	daemonInstallAuthProfileStoreRuntimePromise ??= import("./daemon-install-auth-profiles-store.runtime-DY2W84x0.js");
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
function resolveGatewayInstallWorkingDirectory(params) {
	if (params.workingDirectory) return params.workingDirectory;
	if (params.platform !== "darwin") return;
	return resolveGatewayStateDir(params.env);
}
async function buildGatewayInstallEnvironment(params) {
	const durableEnvironment = collectDurableServiceEnvVars({
		env: params.env,
		config: params.config
	});
	const authProfileEnvironment = await collectAuthProfileServiceEnvVars({
		env: params.env,
		authStore: params.authStore,
		warn: params.warn
	});
	const environment = {
		...collectPreservedExistingServiceEnvVars(params.existingEnvironment, readManagedServiceEnvKeysFromEnvironment(params.existingEnvironment)),
		...durableEnvironment,
		...authProfileEnvironment
	};
	writeManagedServiceEnvKeysToEnvironment(environment, formatManagedServiceEnvKeys(durableEnvironment, { omitKeys: Object.keys(params.serviceEnvironment) }));
	Object.assign(environment, params.serviceEnvironment);
	const mergedPath = mergeServicePath(params.serviceEnvironment.PATH, params.existingEnvironment?.PATH, params.serviceEnvironment.TMPDIR);
	if (mergedPath) environment.PATH = mergedPath;
	return environment;
}
async function buildGatewayInstallPlan(params) {
	const platform = params.platform ?? process.platform;
	const { devMode, nodePath } = await resolveDaemonInstallRuntimeInputs({
		env: params.env,
		runtime: params.runtime,
		devMode: params.devMode,
		nodePath: params.nodePath
	});
	const wrapperPath = await resolveOpenClawWrapperPath(params.wrapperPath ?? params.env["OPENCLAW_WRAPPER"]);
	const serviceInputEnv = wrapperPath ? {
		...params.env,
		[OPENCLAW_WRAPPER_ENV_KEY]: wrapperPath
	} : params.env;
	const { programArguments, workingDirectory } = await resolveGatewayProgramArguments({
		port: params.port,
		dev: devMode,
		runtime: params.runtime,
		nodePath,
		wrapperPath
	});
	await emitDaemonInstallRuntimeWarning({
		env: params.env,
		runtime: params.runtime,
		programArguments,
		warn: params.warn,
		title: "Gateway runtime"
	});
	const serviceEnvironment = buildServiceEnvironment({
		env: serviceInputEnv,
		port: params.port,
		launchdLabel: platform === "darwin" ? resolveGatewayLaunchAgentLabel(serviceInputEnv.OPENCLAW_PROFILE) : void 0,
		platform,
		extraPathDirs: resolveDaemonNodeBinDir(nodePath)
	});
	return {
		programArguments,
		workingDirectory: resolveGatewayInstallWorkingDirectory({
			env: serviceInputEnv,
			platform,
			workingDirectory
		}),
		environment: await buildGatewayInstallEnvironment({
			env: serviceInputEnv,
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
