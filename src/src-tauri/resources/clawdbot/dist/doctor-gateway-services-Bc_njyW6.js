import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { d as resolveIsNixMode, u as resolveGatewayPort } from "./paths-BG0ad0P6.js";
import { a as resolveSystemNodeInfo, r as renderSystemNodeWarning } from "./runtime-paths-CCzEV4ja.js";
import { n as buildGatewayInstallPlan } from "./auth-install-policy-5UmJXrca.js";
import { t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-BFK5T_3J.js";
import { p as resolveSecretInputRef } from "./types.secrets-Zn5Zyn7M.js";
import { t as resolveGatewayAuthToken } from "./auth-token-resolution-BmFKG0kh.js";
import { y as writeConfigFile } from "./io-Dv_xNAZB.js";
import { d as uninstallLegacySystemdUnits } from "./systemd-CRs0dE8y.js";
import { r as resolveGatewayService } from "./service-DKsVbGBH.js";
import "./config-yDDhhyz6.js";
import { a as readEmbeddedGatewayToken, i as needsNodeRuntimeMigration, n as auditGatewayServiceConfig, t as SERVICE_AUDIT_CODES } from "./service-audit-0P5dqReY.js";
import { n as findExtraGatewayServices, r as renderGatewayServiceCleanupHints } from "./inspect-bfGRZyXG.js";
import { t as note } from "./note-D_Kkgdi2.js";
import { t as isDoctorUpdateRepairMode } from "./doctor-repair-mode-DXyYDjRX.js";
import path from "node:path";
import { execFile } from "node:child_process";
import os from "node:os";
import fs from "node:fs/promises";
import { promisify } from "node:util";
//#region src/commands/doctor-gateway-auth-token.ts
async function resolveGatewayAuthTokenForService(cfg, env) {
	const resolved = await resolveGatewayAuthToken({
		cfg,
		env,
		unresolvedReasonStyle: "detailed",
		envFallback: "always"
	});
	if (resolved.token) return { token: resolved.token };
	if (!resolved.secretRefConfigured) return {};
	if (resolved.unresolvedRefReason?.includes("resolved to an empty value")) return { unavailableReason: resolved.unresolvedRefReason };
	return { unavailableReason: `gateway.auth.token SecretRef is configured but unresolved (${resolved.unresolvedRefReason ?? "unknown reason"}).` };
}
//#endregion
//#region src/commands/doctor-gateway-services.ts
const execFileAsync = promisify(execFile);
function detectGatewayRuntime(programArguments) {
	const first = programArguments?.[0];
	if (first) {
		const base = normalizeLowercaseStringOrEmpty(path.basename(first));
		if (base === "bun" || base === "bun.exe") return "bun";
		if (base === "node" || base === "node.exe") return "node";
	}
	return DEFAULT_GATEWAY_DAEMON_RUNTIME;
}
function findGatewayEntrypoint(programArguments) {
	if (!programArguments || programArguments.length === 0) return null;
	const gatewayIndex = programArguments.indexOf("gateway");
	if (gatewayIndex <= 0) return null;
	return programArguments[gatewayIndex - 1] ?? null;
}
async function normalizeExecutablePath(value) {
	const resolvedPath = path.resolve(value);
	try {
		return await fs.realpath(resolvedPath);
	} catch {
		return resolvedPath;
	}
}
function extractDetailPath(detail, prefix) {
	if (!detail.startsWith(prefix)) return null;
	const value = detail.slice(prefix.length).trim();
	return value.length > 0 ? value : null;
}
async function cleanupLegacyLaunchdService(params) {
	await execFileAsync("launchctl", [
		"bootout",
		typeof process.getuid === "function" ? `gui/${process.getuid()}` : "gui/501",
		params.plistPath
	]).catch(() => void 0);
	await execFileAsync("launchctl", ["unload", params.plistPath]).catch(() => void 0);
	const trashDir = path.join(os.homedir(), ".Trash");
	try {
		await fs.mkdir(trashDir, { recursive: true });
	} catch {}
	try {
		await fs.access(params.plistPath);
	} catch {
		return null;
	}
	const dest = path.join(trashDir, `${params.label}-${Date.now()}.plist`);
	try {
		await fs.rename(params.plistPath, dest);
		return dest;
	} catch {
		return null;
	}
}
function classifyLegacyServices(legacyServices) {
	const darwinUserServices = [];
	const linuxUserServices = [];
	const failed = [];
	for (const svc of legacyServices) {
		if (svc.platform === "darwin") {
			if (svc.scope === "user") darwinUserServices.push(svc);
			else failed.push(`${svc.label} (${svc.scope})`);
			continue;
		}
		if (svc.platform === "linux") {
			if (svc.scope === "user") linuxUserServices.push(svc);
			else failed.push(`${svc.label} (${svc.scope})`);
			continue;
		}
		failed.push(`${svc.label} (${svc.platform})`);
	}
	return {
		darwinUserServices,
		linuxUserServices,
		failed
	};
}
async function cleanupLegacyDarwinServices(services) {
	const removed = [];
	const failed = [];
	for (const svc of services) {
		const plistPath = extractDetailPath(svc.detail, "plist:");
		if (!plistPath) {
			failed.push(`${svc.label} (missing plist path)`);
			continue;
		}
		const dest = await cleanupLegacyLaunchdService({
			label: svc.label,
			plistPath
		});
		removed.push(dest ? `${svc.label} -> ${dest}` : svc.label);
	}
	return {
		removed,
		failed
	};
}
async function cleanupLegacyLinuxUserServices(services, runtime) {
	const removed = [];
	const failed = [];
	try {
		const removedUnits = await uninstallLegacySystemdUnits({
			env: process.env,
			stdout: process.stdout
		});
		const removedByLabel = new Map(removedUnits.map((unit) => [`${unit.name}.service`, unit]));
		for (const svc of services) {
			const removedUnit = removedByLabel.get(svc.label);
			if (!removedUnit) {
				failed.push(`${svc.label} (legacy unit name not recognized)`);
				continue;
			}
			removed.push(`${svc.label} -> ${removedUnit.unitPath}`);
		}
	} catch (err) {
		runtime.error(`Legacy Linux gateway cleanup failed: ${String(err)}`);
		for (const svc of services) failed.push(`${svc.label} (linux cleanup failed)`);
	}
	return {
		removed,
		failed
	};
}
async function maybeRepairGatewayServiceConfig(cfg, mode, runtime, prompter) {
	if (resolveIsNixMode(process.env)) {
		note("Nix mode detected; skip service updates.", "Gateway");
		return;
	}
	if (mode === "remote") {
		note("Gateway mode is remote; skipped local service audit.", "Gateway");
		return;
	}
	const service = resolveGatewayService();
	let command = null;
	try {
		command = await service.readCommand(process.env);
	} catch {
		command = null;
	}
	if (!command) return;
	const tokenRefConfigured = Boolean(resolveSecretInputRef({
		value: cfg.gateway?.auth?.token,
		defaults: cfg.secrets?.defaults
	}).ref);
	const gatewayTokenResolution = await resolveGatewayAuthTokenForService(cfg, process.env);
	if (gatewayTokenResolution.unavailableReason) note(`Unable to verify gateway service token drift: ${gatewayTokenResolution.unavailableReason}`, "Gateway service config");
	const expectedGatewayToken = tokenRefConfigured ? void 0 : gatewayTokenResolution.token;
	const audit = await auditGatewayServiceConfig({
		env: process.env,
		command,
		expectedGatewayToken
	});
	const serviceToken = readEmbeddedGatewayToken(command);
	if (tokenRefConfigured && serviceToken) audit.issues.push({
		code: SERVICE_AUDIT_CODES.gatewayTokenMismatch,
		message: "Gateway service OPENCLAW_GATEWAY_TOKEN should be unset when gateway.auth.token is SecretRef-managed",
		detail: "service token is stale",
		level: "recommended"
	});
	const needsNodeRuntime = needsNodeRuntimeMigration(audit.issues);
	const systemNodeInfo = needsNodeRuntime ? await resolveSystemNodeInfo({ env: process.env }) : null;
	const systemNodePath = systemNodeInfo?.supported ? systemNodeInfo.path : null;
	if (needsNodeRuntime && !systemNodePath) {
		const warning = renderSystemNodeWarning(systemNodeInfo);
		if (warning) note(warning, "Gateway runtime");
		note("System Node 22 LTS (22.14+) or Node 24 not found. Install via Homebrew/apt/choco and rerun doctor to migrate off Bun/version managers.", "Gateway runtime");
	}
	const port = resolveGatewayPort(cfg, process.env);
	const runtimeChoice = detectGatewayRuntime(command.programArguments);
	const { programArguments } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		runtime: needsNodeRuntime && systemNodePath ? "node" : runtimeChoice,
		nodePath: systemNodePath ?? void 0,
		warn: (message, title) => note(message, title),
		config: cfg
	});
	const expectedEntrypoint = findGatewayEntrypoint(programArguments);
	const currentEntrypoint = findGatewayEntrypoint(command.programArguments);
	const normalizedExpectedEntrypoint = expectedEntrypoint ? await normalizeExecutablePath(expectedEntrypoint) : null;
	const normalizedCurrentEntrypoint = currentEntrypoint ? await normalizeExecutablePath(currentEntrypoint) : null;
	if (normalizedExpectedEntrypoint && normalizedCurrentEntrypoint && normalizedExpectedEntrypoint !== normalizedCurrentEntrypoint) audit.issues.push({
		code: SERVICE_AUDIT_CODES.gatewayEntrypointMismatch,
		message: "Gateway service entrypoint does not match the current install.",
		detail: `${currentEntrypoint} -> ${expectedEntrypoint}`,
		level: "recommended"
	});
	if (audit.issues.length === 0) return;
	note(audit.issues.map((issue) => issue.detail ? `- ${issue.message} (${issue.detail})` : `- ${issue.message}`).join("\n"), "Gateway service config");
	const needsAggressive = audit.issues.filter((issue) => issue.level === "aggressive").length > 0;
	if (needsAggressive && !prompter.shouldForce) note("Custom or unexpected service edits detected. Rerun with --force to overwrite.", "Gateway service config");
	if (!(needsAggressive ? await prompter.confirmAggressiveAutoFix({
		message: "Overwrite gateway service config with current defaults now?",
		initialValue: prompter.shouldForce
	}) : await prompter.confirmAutoFix({
		message: "Update gateway service config to the recommended defaults now?",
		initialValue: true
	}))) return;
	const updateRepairMode = isDoctorUpdateRepairMode(prompter.repairMode);
	const serviceEmbeddedToken = readEmbeddedGatewayToken(command);
	const gatewayTokenForRepair = expectedGatewayToken ?? serviceEmbeddedToken;
	const configuredGatewayToken = typeof cfg.gateway?.auth?.token === "string" ? normalizeOptionalString(cfg.gateway.auth.token) : void 0;
	let cfgForServiceInstall = cfg;
	if (!updateRepairMode && !tokenRefConfigured && !configuredGatewayToken && gatewayTokenForRepair) {
		const nextCfg = {
			...cfg,
			gateway: {
				...cfg.gateway,
				auth: {
					...cfg.gateway?.auth,
					mode: cfg.gateway?.auth?.mode ?? "token",
					token: gatewayTokenForRepair
				}
			}
		};
		try {
			await writeConfigFile(nextCfg);
			cfgForServiceInstall = nextCfg;
			note(expectedGatewayToken ? "Persisted gateway.auth.token from environment before reinstalling service." : "Persisted gateway.auth.token from existing service definition before reinstalling service.", "Gateway");
		} catch (err) {
			runtime.error(`Failed to persist gateway.auth.token before service repair: ${String(err)}`);
			return;
		}
	}
	const updatedPort = resolveGatewayPort(cfgForServiceInstall, process.env);
	const updatedPlan = await buildGatewayInstallPlan({
		env: process.env,
		port: updatedPort,
		runtime: needsNodeRuntime && systemNodePath ? "node" : runtimeChoice,
		nodePath: systemNodePath ?? void 0,
		warn: (message, title) => note(message, title),
		config: cfgForServiceInstall
	});
	try {
		await (updateRepairMode ? service.stage : service.install)({
			env: process.env,
			stdout: process.stdout,
			programArguments: updatedPlan.programArguments,
			workingDirectory: updatedPlan.workingDirectory,
			environment: updatedPlan.environment
		});
	} catch (err) {
		runtime.error(`Gateway service update failed: ${String(err)}`);
	}
}
async function maybeScanExtraGatewayServices(options, runtime, prompter) {
	const extraServices = await findExtraGatewayServices(process.env, { deep: options.deep });
	if (extraServices.length === 0) return;
	note(extraServices.map((svc) => `- ${svc.label} (${svc.scope}, ${svc.detail})`).join("\n"), "Other gateway-like services detected");
	const legacyServices = extraServices.filter((svc) => svc.legacy === true);
	if (legacyServices.length > 0) {
		if (await prompter.confirmRuntimeRepair({
			message: "Remove legacy gateway services now?",
			initialValue: true
		})) {
			const removed = [];
			const { darwinUserServices, linuxUserServices, failed } = classifyLegacyServices(legacyServices);
			if (darwinUserServices.length > 0) {
				const result = await cleanupLegacyDarwinServices(darwinUserServices);
				removed.push(...result.removed);
				failed.push(...result.failed);
			}
			if (linuxUserServices.length > 0) {
				const result = await cleanupLegacyLinuxUserServices(linuxUserServices, runtime);
				removed.push(...result.removed);
				failed.push(...result.failed);
			}
			if (removed.length > 0) note(removed.map((line) => `- ${line}`).join("\n"), "Legacy gateway removed");
			if (failed.length > 0) note(failed.map((line) => `- ${line}`).join("\n"), "Legacy gateway cleanup skipped");
			if (removed.length > 0) runtime.log("Legacy gateway services removed. Installing OpenClaw gateway next.");
		}
	}
	const cleanupHints = renderGatewayServiceCleanupHints();
	if (cleanupHints.length > 0) note(cleanupHints.map((hint) => `- ${hint}`).join("\n"), "Cleanup hints");
	note([
		"Recommendation: run a single gateway per machine for most setups.",
		"One gateway supports multiple agents.",
		"If you need multiple gateways (e.g., a rescue bot on the same host), isolate ports + config/state (see docs: /gateway#multiple-gateways-same-host)."
	].join("\n"), "Gateway recommendation");
}
//#endregion
export { maybeRepairGatewayServiceConfig, maybeScanExtraGatewayServices };
