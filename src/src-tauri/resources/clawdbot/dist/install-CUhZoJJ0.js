import { t as resolveNodeStartupTlsEnvironment } from "./node-startup-env-BRa4mYVi.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { n as buildGatewayInstallPlan, t as resolveGatewayInstallToken } from "./gateway-install-token-BelEbFnC.js";
import { r as isGatewayDaemonRuntime, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-CniEQXCk.js";
import { u as readConfigFileSnapshotForWrite } from "./io-5pxHCi7V.js";
import { n as isNonFatalSystemdInstallProbeError } from "./systemd-D3GGnU7N.js";
import { r as resolveGatewayService } from "./service-DkbTemHA.js";
import { h as installDaemonServiceAndEmit, n as createDaemonInstallActionContext, p as buildDaemonServiceSnapshot, r as failIfNixDaemonInstallMode } from "./shared-B7diuUph.js";
import { t as parsePort } from "./parse-port-Bd1Ciu7u.js";
//#region src/cli/daemon-cli/install.ts
function mergeInstallInvocationEnv(params) {
	if (!params.existingServiceEnv || Object.keys(params.existingServiceEnv).length === 0) return params.env;
	return {
		...params.existingServiceEnv,
		...params.env
	};
}
async function runDaemonInstall(opts) {
	const { json, stdout, warnings, emit, fail } = createDaemonInstallActionContext(opts.json);
	if (failIfNixDaemonInstallMode(fail)) return;
	const { snapshot: configSnapshot, writeOptions: configWriteOptions } = await readConfigFileSnapshotForWrite();
	const cfg = configSnapshot.valid ? configSnapshot.sourceConfig : configSnapshot.config;
	const portOverride = parsePort(opts.port);
	if (opts.port !== void 0 && portOverride === null) {
		fail("Invalid port");
		return;
	}
	const port = portOverride ?? resolveGatewayPort(cfg);
	if (!Number.isFinite(port) || port <= 0) {
		fail("Invalid port");
		return;
	}
	const runtimeRaw = opts.runtime ? opts.runtime : DEFAULT_GATEWAY_DAEMON_RUNTIME;
	if (!isGatewayDaemonRuntime(runtimeRaw)) {
		fail("Invalid --runtime (use \"node\" or \"bun\")");
		return;
	}
	const service = resolveGatewayService();
	let loaded = false;
	let existingServiceEnv;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch (err) {
		if (isNonFatalSystemdInstallProbeError(err)) loaded = false;
		else {
			fail(`Gateway service check failed: ${String(err)}`);
			return;
		}
	}
	if (loaded) existingServiceEnv = (await service.readCommand(process.env).catch(() => null))?.environment;
	const installEnv = mergeInstallInvocationEnv({
		env: process.env,
		existingServiceEnv
	});
	if (loaded) {
		if (!opts.force) if (await gatewayServiceNeedsAutoNodeExtraCaCertsRefresh({
			service,
			env: process.env
		})) {
			const message = "Gateway service is missing the nvm TLS CA bundle; refreshing the install.";
			if (json) warnings.push(message);
			else defaultRuntime.log(message);
		} else {
			emit({
				ok: true,
				result: "already-installed",
				message: `Gateway service already ${service.loadedText}.`,
				service: buildDaemonServiceSnapshot(service, loaded)
			});
			if (!json) {
				defaultRuntime.log(`Gateway service already ${service.loadedText}.`);
				defaultRuntime.log(`Reinstall with: ${formatCliCommand("openclaw gateway install --force")}`);
			}
			return;
		}
	}
	const tokenResolution = await resolveGatewayInstallToken({
		config: cfg,
		configSnapshot,
		configWriteOptions,
		env: installEnv,
		explicitToken: opts.token,
		autoGenerateWhenMissing: true,
		persistGeneratedToken: true
	});
	if (tokenResolution.unavailableReason) {
		fail(`Gateway install blocked: ${tokenResolution.unavailableReason}`);
		return;
	}
	for (const warning of tokenResolution.warnings) if (json) warnings.push(warning);
	else defaultRuntime.log(warning);
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: installEnv,
		port,
		runtime: runtimeRaw,
		existingEnvironment: existingServiceEnv,
		warn: (message) => {
			if (json) warnings.push(message);
			else defaultRuntime.log(message);
		},
		config: cfg
	});
	await installDaemonServiceAndEmit({
		serviceNoun: "Gateway",
		service,
		warnings,
		emit,
		fail,
		install: async () => {
			await service.install({
				env: installEnv,
				stdout,
				programArguments,
				workingDirectory,
				environment
			});
		}
	});
}
async function gatewayServiceNeedsAutoNodeExtraCaCertsRefresh(params) {
	try {
		const currentCommand = await params.service.readCommand(params.env);
		if (!currentCommand) return false;
		const currentExecPath = currentCommand.programArguments[0]?.trim();
		if (!currentExecPath) return false;
		const currentEnvironment = currentCommand.environment ?? {};
		const currentNodeExtraCaCerts = currentEnvironment.NODE_EXTRA_CA_CERTS?.trim();
		const expectedNodeExtraCaCerts = resolveNodeStartupTlsEnvironment({
			env: {
				...params.env,
				...currentEnvironment,
				NODE_EXTRA_CA_CERTS: void 0
			},
			execPath: currentExecPath,
			includeDarwinDefaults: false
		}).NODE_EXTRA_CA_CERTS;
		if (!expectedNodeExtraCaCerts) return false;
		return currentNodeExtraCaCerts !== expectedNodeExtraCaCerts;
	} catch {
		return false;
	}
}
//#endregion
export { runDaemonInstall as t };
