import { m as defaultRuntime } from "./subsystem-CJEvHE2o.js";
import { d as resolveIsNixMode } from "./paths-CD8i0MSg.js";
import { d as readBestEffortConfig, f as readConfigFileSnapshot } from "./io-DhtVmzAJ.js";
import { d as resolveSecretInputRef } from "./types.secrets-DTXJhyWe.js";
import "./config-CJQx-9zo.js";
import { d as trimToUndefined, n as isGatewaySecretRefUnavailableError, o as createGatewayCredentialPlan, t as GatewaySecretRefUnavailableError } from "./credentials-DyjdApQe.js";
import { t as isWSL } from "./wsl-BhLRdu8m.js";
import { i as startGatewayService, t as describeGatewayServiceRestart } from "./service-BaabAHxx.js";
import { i as isSystemdUserServiceAvailable } from "./systemd-B4S0Zwlt.js";
import { i as filterContainerGenericHints, m as createDaemonActionContext, p as buildDaemonServiceSnapshot } from "./shared-Bng_ohlG.js";
import { a as checkTokenDrift, n as renderSystemdUnavailableHints } from "./systemd-hints-enHHgxXj.js";
import { n as formatConfigIssueLines } from "./issue-format-DnqtJUII.js";
import { t as resolveConfiguredSecretInputString } from "./resolve-configured-secret-input-string-9ATuSkYC.js";
//#region src/cli/daemon-cli/gateway-token-drift.ts
function authModeDisablesToken(mode) {
	return mode === "password" || mode === "none" || mode === "trusted-proxy";
}
function isPasswordFallbackActive(params) {
	const plan = createGatewayCredentialPlan({
		config: params.cfg,
		env: params.env
	});
	if (plan.authMode !== void 0) return false;
	return plan.passwordCanWin && !plan.tokenCanWin;
}
async function resolveGatewayTokenForDriftCheck(params) {
	const env = params.env ?? process.env;
	const mode = params.cfg.gateway?.auth?.mode;
	if (authModeDisablesToken(mode)) return;
	if (isPasswordFallbackActive({
		cfg: params.cfg,
		env
	})) return;
	const tokenInput = params.cfg.gateway?.auth?.token;
	if (!resolveSecretInputRef({
		value: tokenInput,
		defaults: params.cfg.secrets?.defaults
	}).ref) return trimToUndefined(tokenInput);
	const resolved = await resolveConfiguredSecretInputString({
		config: params.cfg,
		env,
		value: tokenInput,
		path: "gateway.auth.token",
		unresolvedReasonStyle: "detailed"
	});
	if (resolved.value) return resolved.value;
	throw new GatewaySecretRefUnavailableError("gateway.auth.token");
}
//#endregion
//#region src/cli/daemon-cli/lifecycle-core.ts
async function maybeAugmentSystemdHints(hints) {
	if (process.platform !== "linux") return hints;
	if (await isSystemdUserServiceAvailable().catch(() => false)) return hints;
	return [...hints, ...renderSystemdUnavailableHints({
		wsl: await isWSL(),
		kind: "generic_unavailable"
	})];
}
function emitActionMessage(params) {
	params.emit(params.payload);
	if (!params.json && params.payload.message) defaultRuntime.log(params.payload.message);
}
async function handleServiceNotLoaded(params) {
	const hints = filterContainerGenericHints(await maybeAugmentSystemdHints(params.renderStartHints()));
	params.emit({
		ok: true,
		result: "not-loaded",
		message: `${params.serviceNoun} service ${params.service.notLoadedText}.`,
		hints,
		service: buildDaemonServiceSnapshot(params.service, params.loaded)
	});
	if (!params.json) {
		defaultRuntime.log(`${params.serviceNoun} service ${params.service.notLoadedText}.`);
		for (const hint of hints) defaultRuntime.log(`Start with: ${hint}`);
	}
}
async function resolveServiceLoadedOrFail(params) {
	try {
		return await params.service.isLoaded({ env: process.env });
	} catch (err) {
		params.fail(`${params.serviceNoun} service check failed: ${String(err)}`);
		return null;
	}
}
/**
* Best-effort config validation. Returns a string describing the issues if
* config exists and is invalid, or null if config is valid/missing/unreadable.
*
* Note: This reads the config file snapshot in the current CLI environment.
* Configs using env vars only available in the service context (launchd/systemd)
* may produce false positives, but the check is intentionally best-effort —
* a false positive here is safer than a crash on startup. (#35862)
*/
async function getConfigValidationError() {
	try {
		const snapshot = await readConfigFileSnapshot();
		if (!snapshot.exists || snapshot.valid) return null;
		return snapshot.issues.length > 0 ? formatConfigIssueLines(snapshot.issues, "", { normalizeRoot: true }).join("\n") : "Unknown validation issue.";
	} catch {
		return null;
	}
}
async function runServiceUninstall(params) {
	const { stdout, emit, fail } = createDaemonActionContext({
		action: "uninstall",
		json: Boolean(params.opts?.json)
	});
	if (resolveIsNixMode(process.env)) {
		fail("Nix mode detected; service uninstall is disabled.");
		return;
	}
	let loaded = false;
	try {
		loaded = await params.service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	if (loaded && params.stopBeforeUninstall) try {
		await params.service.stop({
			env: process.env,
			stdout
		});
	} catch {}
	try {
		await params.service.uninstall({
			env: process.env,
			stdout
		});
	} catch (err) {
		fail(`${params.serviceNoun} uninstall failed: ${String(err)}`);
		return;
	}
	loaded = false;
	try {
		loaded = await params.service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	if (loaded && params.assertNotLoadedAfterUninstall) {
		fail(`${params.serviceNoun} service still loaded after uninstall.`);
		return;
	}
	emit({
		ok: true,
		result: "uninstalled",
		service: buildDaemonServiceSnapshot(params.service, loaded)
	});
}
async function runServiceStart(params) {
	const json = Boolean(params.opts?.json);
	const { stdout, emit, fail } = createDaemonActionContext({
		action: "start",
		json
	});
	if (await resolveServiceLoadedOrFail({
		serviceNoun: params.serviceNoun,
		service: params.service,
		fail
	}) === null) return;
	{
		const configError = await getConfigValidationError();
		if (configError) {
			fail(`${params.serviceNoun} aborted: config is invalid.\n${configError}\nFix the config and retry, or run "openclaw doctor" to repair.`);
			return;
		}
	}
	try {
		const startResult = await startGatewayService(params.service, {
			env: process.env,
			stdout
		});
		if (startResult.outcome === "missing-install") {
			await handleServiceNotLoaded({
				serviceNoun: params.serviceNoun,
				service: params.service,
				loaded: startResult.state.loaded,
				renderStartHints: params.renderStartHints,
				json,
				emit
			});
			return;
		}
		if (startResult.outcome === "scheduled") {
			emitActionMessage({
				json,
				emit,
				payload: {
					ok: true,
					result: "scheduled",
					message: describeGatewayServiceRestart(params.serviceNoun, { outcome: "scheduled" }).message,
					service: buildDaemonServiceSnapshot(params.service, startResult.state.loaded)
				}
			});
			return;
		}
		emit({
			ok: true,
			result: "started",
			service: buildDaemonServiceSnapshot(params.service, startResult.state.loaded)
		});
	} catch (err) {
		const hints = params.renderStartHints();
		fail(`${params.serviceNoun} start failed: ${String(err)}`, hints);
		return;
	}
}
async function runServiceStop(params) {
	const json = Boolean(params.opts?.json);
	const { stdout, emit, fail } = createDaemonActionContext({
		action: "stop",
		json
	});
	const loaded = await resolveServiceLoadedOrFail({
		serviceNoun: params.serviceNoun,
		service: params.service,
		fail
	});
	if (loaded === null) return;
	if (!loaded) {
		try {
			const handled = await params.onNotLoaded?.({
				json,
				stdout,
				fail
			});
			if (handled) {
				emit({
					ok: true,
					result: handled.result,
					message: handled.message,
					warnings: handled.warnings,
					service: buildDaemonServiceSnapshot(params.service, false)
				});
				if (!json && handled.message) defaultRuntime.log(handled.message);
				return;
			}
		} catch (err) {
			fail(`${params.serviceNoun} stop failed: ${String(err)}`);
			return;
		}
		emit({
			ok: true,
			result: "not-loaded",
			message: `${params.serviceNoun} service ${params.service.notLoadedText}.`,
			service: buildDaemonServiceSnapshot(params.service, loaded)
		});
		if (!json) defaultRuntime.log(`${params.serviceNoun} service ${params.service.notLoadedText}.`);
		return;
	}
	try {
		await params.service.stop({
			env: process.env,
			stdout
		});
	} catch (err) {
		fail(`${params.serviceNoun} stop failed: ${String(err)}`);
		return;
	}
	let stopped = false;
	try {
		stopped = await params.service.isLoaded({ env: process.env });
	} catch {
		stopped = false;
	}
	emit({
		ok: true,
		result: "stopped",
		service: buildDaemonServiceSnapshot(params.service, stopped)
	});
}
async function runServiceRestart(params) {
	const json = Boolean(params.opts?.json);
	const { stdout, emit, fail } = createDaemonActionContext({
		action: "restart",
		json
	});
	const warnings = [];
	let handledNotLoaded = null;
	const emitScheduledRestart = (restartStatus, serviceLoaded) => {
		emitActionMessage({
			json,
			emit,
			payload: {
				ok: true,
				result: restartStatus.daemonActionResult,
				message: restartStatus.message,
				service: buildDaemonServiceSnapshot(params.service, serviceLoaded),
				warnings: warnings.length ? warnings : void 0
			}
		});
		return true;
	};
	const loaded = await resolveServiceLoadedOrFail({
		serviceNoun: params.serviceNoun,
		service: params.service,
		fail
	});
	if (loaded === null) return false;
	{
		const configError = await getConfigValidationError();
		if (configError) {
			fail(`${params.serviceNoun} aborted: config is invalid.\n${configError}\nFix the config and retry, or run "openclaw doctor" to repair.`);
			return false;
		}
	}
	if (!loaded) {
		try {
			handledNotLoaded = await params.onNotLoaded?.({
				json,
				stdout,
				fail
			}) ?? null;
		} catch (err) {
			fail(`${params.serviceNoun} restart failed: ${String(err)}`);
			return false;
		}
		if (!handledNotLoaded) {
			await handleServiceNotLoaded({
				serviceNoun: params.serviceNoun,
				service: params.service,
				loaded,
				renderStartHints: params.renderStartHints,
				json,
				emit
			});
			return false;
		}
		if (handledNotLoaded.warnings?.length) warnings.push(...handledNotLoaded.warnings);
	}
	if (loaded && params.checkTokenDrift) try {
		const command = await params.service.readCommand(process.env);
		const serviceToken = command?.environment?.OPENCLAW_GATEWAY_TOKEN;
		const driftIssue = checkTokenDrift({
			serviceToken,
			configToken: await resolveGatewayTokenForDriftCheck({
				cfg: await readBestEffortConfig(),
				env: {
					...process.env,
					...command?.environment
				}
			})
		});
		if (driftIssue) {
			const warning = driftIssue.detail ? `${driftIssue.message} ${driftIssue.detail}` : driftIssue.message;
			warnings.push(warning);
			if (!json) {
				defaultRuntime.log(`\n⚠️  ${driftIssue.message}`);
				if (driftIssue.detail) defaultRuntime.log(`   ${driftIssue.detail}\n`);
			}
		}
	} catch (err) {
		if (isGatewaySecretRefUnavailableError(err, "gateway.auth.token")) {
			const warning = "Unable to verify gateway token drift: gateway.auth.token SecretRef is configured but unavailable in this command path.";
			warnings.push(warning);
			if (!json) defaultRuntime.log(`\n⚠️  ${warning}\n`);
		}
	}
	try {
		let restartResult = { outcome: "completed" };
		if (loaded) restartResult = await params.service.restart({
			env: process.env,
			stdout
		});
		let restartStatus = describeGatewayServiceRestart(params.serviceNoun, restartResult);
		if (restartStatus.scheduled) return emitScheduledRestart(restartStatus, loaded);
		if (params.postRestartCheck) {
			const postRestartResult = await params.postRestartCheck({
				json,
				stdout,
				warnings,
				fail
			});
			if (postRestartResult) {
				restartStatus = describeGatewayServiceRestart(params.serviceNoun, postRestartResult);
				if (restartStatus.scheduled) return emitScheduledRestart(restartStatus, loaded);
			}
		}
		let restarted = loaded;
		if (loaded) try {
			restarted = await params.service.isLoaded({ env: process.env });
		} catch {
			restarted = true;
		}
		emit({
			ok: true,
			result: "restarted",
			message: handledNotLoaded?.message,
			service: buildDaemonServiceSnapshot(params.service, restarted),
			warnings: warnings.length ? warnings : void 0
		});
		if (!json && handledNotLoaded?.message) defaultRuntime.log(handledNotLoaded.message);
		return true;
	} catch (err) {
		const hints = params.renderStartHints();
		fail(`${params.serviceNoun} restart failed: ${String(err)}`, hints);
		return false;
	}
}
//#endregion
export { runServiceUninstall as i, runServiceStart as n, runServiceStop as r, runServiceRestart as t };
