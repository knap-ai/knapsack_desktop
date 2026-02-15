import "./paths-DVBShlw6.js";
import { B as theme, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import "./utils-CrauP1IK.js";
import "./pi-embedded-helpers-BMGOFUCT.js";
import "./exec-BDyx_yxc.js";
import "./agent-scope-DMGrQp5u.js";
import "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import "./boolean-BgXe2hyu.js";
import "./env-BSjH4KuP.js";
import "./config-CWifpzL_.js";
import "./manifest-registry-DFR7U7LS.js";
import "./plugins-CLo5nH74.js";
import "./sessions-ezP1qtWM.js";
import "./sandbox-BOXx_Lgl.js";
import "./chrome-CGPBw-bD.js";
import "./skills-Dj7GqTPz.js";
import "./routes-CyIJmYmu.js";
import "./server-context-DGqqHDqz.js";
import "./image-ops-DS83Z7J2.js";
import "./store-DFW2MnP3.js";
import "./ports-DAxLoOFv.js";
import "./message-channel-BA527_ar.js";
import "./logging-CcxUDNcI.js";
import "./accounts-DmCS3XF8.js";
import "./paths-BuQbsACT.js";
import "./tool-images-C7cLCz1D.js";
import "./redact-Bb36nvYe.js";
import "./tool-display-CPUH9JiE.js";
import "./commands-registry-DBWrx0Xv.js";
import "./client-CEto0Pf6.js";
import "./call-i9290XP8.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import { t as parseTimeoutMs } from "./parse-timeout-mZ0bYwbj.js";
import { t as runTui } from "./tui-CMbEG2YE.js";

//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerTuiCli };