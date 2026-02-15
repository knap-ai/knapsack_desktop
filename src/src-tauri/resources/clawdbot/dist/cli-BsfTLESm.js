import { o as createSubsystemLogger } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./pi-model-discovery-EhM2JAQo.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import "./plugins-DsHRVW6o.js";
import "./logging-B5vJSgy6.js";
import "./accounts-CXiTuiOz.js";
import "./send-DQh-tTYV.js";
import "./send-C34nHKc5.js";
import { _t as loadOpenClawPlugins } from "./reply-DWlAlSNj.js";
import "./media-EWF5qDpT.js";
import "./message-channel-D-iPIX3C.js";
import "./render-DyRjoIgA.js";
import "./tables-DuWEJJJ_.js";
import "./image-ops-BuOO2fiP.js";
import "./fetch-CiM7YqYo.js";
import "./tool-images-Do-zTkGT.js";
import "./common-2Kd-SlSi.js";
import "./server-context-DSQVDg5o.js";
import "./chrome-Biwk6Xdw.js";
import "./auth-DaQXd14b.js";
import "./control-auth-B-AeOmM1.js";
import "./ports-C5vKQsaq.js";
import "./control-service-BWKREGJh.js";
import "./deliver-CPbyDZgw.js";
import "./pi-embedded-helpers-Bgii3Law.js";
import "./sessions-DGtM0qOW.js";
import "./runner-BY_Cu0GM.js";
import "./image-qihRjcmd.js";
import "./models-config-BUvHYVxN.js";
import "./sandbox-yPHyBnUy.js";
import "./skills-C1pxUa-I.js";
import "./routes-BpW33PMu.js";
import "./store-C2n2K571.js";
import "./paths-D9QhlJYC.js";
import "./redact-Bt-krp_b.js";
import "./tool-display-Dq-NBueh.js";
import "./context-DPQWp4WP.js";
import "./dispatcher-CLCH2DxP.js";
import "./send-C0RXgj4W.js";
import "./memory-cli-C--Zm-5F.js";
import "./manager-D5ku6Y-s.js";
import "./sqlite-hOA2wjjf.js";
import "./retry-CO00OgwL.js";
import "./commands-registry-B3DBZLId.js";
import "./client-DV6vI7ic.js";
import "./call-FZUZ5EU4.js";
import "./channel-activity-CuiCbmeL.js";
import "./send-h1nuAso5.js";
import "./links-C_tOT2wV.js";
import "./progress-C4IJwa0T.js";
import "./pairing-store-C9d3jZbc.js";
import "./pi-tools.policy-CTtzXtkF.js";
import "./send-CnpwMynh.js";
import "./onboard-helpers-HBGG6t5A.js";
import "./prompt-style-f1NZuGno.js";
import "./pairing-labels-CxEJEpbD.js";
import "./session-cost-usage-DOubaz12.js";
import "./nodes-screen-ChgT1pbh.js";
import "./channel-selection-CHRRzvpU.js";
import "./delivery-queue-BFRO68fM.js";

//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}

//#endregion
export { registerPluginCliCommands };