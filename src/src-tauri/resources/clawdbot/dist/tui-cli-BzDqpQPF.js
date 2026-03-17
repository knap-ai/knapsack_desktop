import "./paths-tuenh9TL.js";
import { p as defaultRuntime } from "./subsystem-D2xHvZZd.js";
import { r as theme } from "./theme-CipOb_We.js";
import "./utils-DwZbjiC4.js";
import { Ji as parseTimeoutMs } from "./reply-Bm8VrLQh.js";
import "./agent-scope-DvYJ0Ktc.js";
import "./openclaw-root-3m-COvjr.js";
import "./logger-BZyLeV9r.js";
import "./exec-BQevMHrc.js";
import "./github-copilot-token-Dz62-0BI.js";
import "./boolean-CJxfhBkG.js";
import "./env-CqXKEsUZ.js";
import "./env-overrides-DfvB37sI.js";
import "./registry-DIAhVWwq.js";
import "./skills-CZKYRFRI.js";
import "./frontmatter-7FVJq8_7.js";
import "./plugins-Csb211Yn.js";
import "./query-expansion-CxfqvqXX.js";
import "./redact-BaAECW8K.js";
import "./path-alias-guards-DSeY3vyo.js";
import "./fetch-DdL1XWlW.js";
import "./errors-C1t_6llh.js";
import "./cmd-argv-GXSSysSW.js";
import "./delivery-queue-B182HpX5.js";
import "./paths-DBVuZIGo.js";
import "./session-cost-usage-BlB91_zm.js";
import "./prompt-style-ytG4p-pp.js";
import { t as formatDocsLink } from "./links-D1S6as3q.js";
import "./cli-utils-BSURvrmb.js";
import { t as runTui } from "./tui-Cc1s56fY.js";
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
