import "./subsystem-BDbeCphF.js";
import "./paths-dQ_clcF4.js";
import "./theme-H80Q3Qtv.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-DRjqKE3G.js";
import "./agent-scope-CZIF93u7.js";
import "./utils-B88a096J.js";
import "./boundary-file-read-Bb0WDUIN.js";
import "./logger-D0msxOz2.js";
import "./exec-CdZJtviz.js";
import "./github-copilot-token-DQd7axD5.js";
import "./registry-DtTKJfN8.js";
import "./skills-CtzUimzY.js";
import "./frontmatter-D0K3qXQH.js";
import "./env-overrides-D7R3RscC.js";
import "./version-DcA9ITyc.js";
import "./search-manager-CR5cykjp.js";
import "./plugins-C-z6VZlO.js";
import "./query-expansion-E78fX0en.js";
import "./redact-DrUa2v4S.js";
import "./errors-Bgu5Y3JI.js";
import "./fetch-BmEnSimV.js";
import "./path-alias-guards-C2fEXRX9.js";
import "./cmd-argv-Cnl266PT.js";
import "./delivery-queue-uotfwRH3.js";
import "./paths-B9q4Ev3T.js";
import "./session-cost-usage-B7YSslo_.js";
import "./prompt-style-C94HXvSH.js";
import "./links-BuWtQKK5.js";
import "./cli-utils-CCDylRkX.js";
import "./note-CU6pYH8p.js";
import "./daemon-install-plan.shared-C827UpZv.js";
import "./runtime-guard-BGuMyQeT.js";
import { n as buildGatewayInstallPlan, r as gatewayInstallErrorHint, t as resolveGatewayInstallToken } from "./gateway-install-token-BCj54YDR.js";
import { r as isGatewayDaemonRuntime } from "./daemon-runtime-Cefje0FR.js";
import "./runtime-parse-BCRWcre9.js";
import "./launchd-DnTV_bc7.js";
import { n as resolveGatewayService } from "./service-B6O2Y9L1.js";
import { i as isSystemdUserServiceAvailable } from "./systemd---Z1c197.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-CdgSjHC6.js";
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
			"Fix gateway auth config/token input and rerun onboarding."
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
