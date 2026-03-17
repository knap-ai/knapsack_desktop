import "./paths-tuenh9TL.js";
import { p as defaultRuntime, v as danger } from "./subsystem-D2xHvZZd.js";
import { r as theme } from "./theme-CipOb_We.js";
import "./utils-DwZbjiC4.js";
import "./reply-Bm8VrLQh.js";
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
import { n as callGatewayFromCli, t as addGatewayClientOptions } from "./gateway-rpc-wXY2FmJ7.js";
//#region src/cli/system-cli.ts
const normalizeWakeMode = (raw) => {
	const mode = typeof raw === "string" ? raw.trim() : "";
	if (!mode) return "next-heartbeat";
	if (mode === "now" || mode === "next-heartbeat") return mode;
	throw new Error("--mode must be now or next-heartbeat");
};
async function runSystemGatewayCommand(opts, action, successText) {
	try {
		const result = await action();
		if (opts.json || successText === void 0) defaultRuntime.log(JSON.stringify(result, null, 2));
		else defaultRuntime.log(successText);
	} catch (err) {
		defaultRuntime.error(danger(String(err)));
		defaultRuntime.exit(1);
	}
}
function registerSystemCli(program) {
	const system = program.command("system").description("System tools (events, heartbeat, presence)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/system", "docs.openclaw.ai/cli/system")}\n`);
	addGatewayClientOptions(system.command("event").description("Enqueue a system event and optionally trigger a heartbeat").requiredOption("--text <text>", "System event text").option("--mode <mode>", "Wake mode (now|next-heartbeat)", "next-heartbeat").option("--json", "Output JSON", false)).action(async (opts) => {
		await runSystemGatewayCommand(opts, async () => {
			const text = typeof opts.text === "string" ? opts.text.trim() : "";
			if (!text) throw new Error("--text is required");
			return await callGatewayFromCli("wake", opts, {
				mode: normalizeWakeMode(opts.mode),
				text
			}, { expectFinal: false });
		}, "ok");
	});
	const heartbeat = system.command("heartbeat").description("Heartbeat controls");
	addGatewayClientOptions(heartbeat.command("last").description("Show the last heartbeat event").option("--json", "Output JSON", false)).action(async (opts) => {
		await runSystemGatewayCommand(opts, async () => {
			return await callGatewayFromCli("last-heartbeat", opts, void 0, { expectFinal: false });
		});
	});
	addGatewayClientOptions(heartbeat.command("enable").description("Enable heartbeats").option("--json", "Output JSON", false)).action(async (opts) => {
		await runSystemGatewayCommand(opts, async () => {
			return await callGatewayFromCli("set-heartbeats", opts, { enabled: true }, { expectFinal: false });
		});
	});
	addGatewayClientOptions(heartbeat.command("disable").description("Disable heartbeats").option("--json", "Output JSON", false)).action(async (opts) => {
		await runSystemGatewayCommand(opts, async () => {
			return await callGatewayFromCli("set-heartbeats", opts, { enabled: false }, { expectFinal: false });
		});
	});
	addGatewayClientOptions(system.command("presence").description("List system presence entries").option("--json", "Output JSON", false)).action(async (opts) => {
		await runSystemGatewayCommand(opts, async () => {
			return await callGatewayFromCli("system-presence", opts, void 0, { expectFinal: false });
		});
	});
}
//#endregion
export { registerSystemCli };
