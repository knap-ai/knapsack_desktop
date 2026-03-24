import "./redact-BDinS1q9.js";
import "./errors-BxyFnvP3.js";
import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import "./theme-CdOoMzRk.js";
import "./globals-DBUMOBZ8.js";
import "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import "./env-Dnra1IpT.js";
import "./utils-CS0Ikux6.js";
import "./paths-C4Oy7wjk.js";
import "./auth-profiles-DRuJBw5y.js";
import "./agent-scope-bjWqU22i.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./boundary-file-read-DcZxlWD8.js";
import "./logger-BmpSCz93.js";
import "./exec-B5_AYfQG.js";
import "./workspace-D4K6QX9X.js";
import "./model-selection-BnFtDmP7.js";
import "./io-y3Az_Onx.js";
import "./shell-env-BOu7XeT_.js";
import "./safe-text-yavot2qw.js";
import "./version-CD3oP1-d.js";
import "./env-substitution-O6uabUmO.js";
import "./includes-Bj3eLUWH.js";
import "./zod-schema.providers-core-COy5nBQ0.js";
import "./legacy-web-search-BB-ZHEhz.js";
import "./registry-C5UkPpaO.js";
import "./config-state-Br0ucqMb.js";
import "./min-host-version-RMBWtIAR.js";
import "./manifest-registry-B5JNQdOM.js";
import "./runtime-guard-PhQ6PwQa.js";
import "./avatar-policy-B5nOfso_.js";
import "./ip-Ce8EDTBZ.js";
import "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import "./zod-schema.core-BuVz8Rk7.js";
import "./config-D4zN4BRl.js";
import "./file-lock-DEiVq2ow.js";
import "./audit-fs-DTQIjp2r.js";
import "./resolve-B7S4PlnO.js";
import "./profiles-COPO-hHI.js";
import "./daemon-install-plan.shared-DlNoT_tA.js";
import "./runtime-paths-DOEOEFe-.js";
import { n as buildGatewayInstallPlan, r as gatewayInstallErrorHint, t as resolveGatewayInstallToken } from "./gateway-install-token-De_pFluK.js";
import { r as isGatewayDaemonRuntime } from "./daemon-runtime-lubXrOfs.js";
import "./tailscale-CxY-91GZ.js";
import "./tailnet-DHiKSG7V.js";
import "./net-JAg9zL0G.js";
import "./auth-Buq0Niri.js";
import "./credentials-D8pfRimu.js";
import "./message-channel-BliByQBl.js";
import "./store-C5UK26Ce.js";
import "./runtime-Iz8uZ7EU.js";
import "./plugins-B09-vgme.js";
import "./sessions-D9ZgHCHb.js";
import "./paths-rhN9LKM_.js";
import "./session-write-lock-va3qZE6f.js";
import "./method-scopes-BiEi0X2g.js";
import "./call-CQbSO4Fr.js";
import "./control-ui-shared-BBhZvISc.js";
import "./onboard-helpers-D5cfC-Ra.js";
import "./prompt-style-C4CV4Y_p.js";
import "./ports-lsof-BLEgL_Gn.js";
import "./restart-stale-pids-BsPvlGJd.js";
import "./runtime-parse-BUn1nl6s.js";
import "./launchd-yOx8f787.js";
import { n as resolveGatewayService } from "./service-DdJ2Qk7P.js";
import "./ports-FldL_Lhq.js";
import { i as isSystemdUserServiceAvailable } from "./systemd-bGhJCG6J.js";
import "./note-Cq-EkeJ6.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-CPlvYre1.js";
//#region src/commands/onboard-non-interactive/local/daemon-install.ts
async function installGatewayDaemonNonInteractive(params) {
	const { opts, runtime, port } = params;
	if (!opts.installDaemon) return { installed: false };
	const daemonRuntimeRaw = opts.daemonRuntime ?? "node";
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) {
		runtime.log("Systemd user services are unavailable; skipping service install. Use a direct shell run (`openclaw gateway run`) or rerun without --install-daemon on this session.");
		return {
			installed: false,
			skippedReason: "systemd-user-unavailable"
		};
	}
	if (!isGatewayDaemonRuntime(daemonRuntimeRaw)) {
		runtime.error("Invalid --daemon-runtime (use node or bun)");
		runtime.exit(1);
		return { installed: false };
	}
	const service = resolveGatewayService();
	const tokenResolution = await resolveGatewayInstallToken({
		config: params.nextConfig,
		env: process.env
	});
	for (const warning of tokenResolution.warnings) runtime.log(warning);
	if (tokenResolution.unavailableReason) {
		runtime.error([
			"Gateway install blocked:",
			tokenResolution.unavailableReason,
			"Fix gateway auth config/token input and rerun setup."
		].join(" "));
		runtime.exit(1);
		return { installed: false };
	}
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		runtime: daemonRuntimeRaw,
		warn: (message) => runtime.log(message),
		config: params.nextConfig
	});
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		runtime.error(`Gateway service install failed: ${String(err)}`);
		runtime.log(gatewayInstallErrorHint());
		return { installed: false };
	}
	await ensureSystemdUserLingerNonInteractive({ runtime });
	return { installed: true };
}
//#endregion
export { installGatewayDaemonNonInteractive };
