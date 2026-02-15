import "./paths-DVBShlw6.js";
import { B as theme, O as danger, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import "./utils-CrauP1IK.js";
import "./exec-BDyx_yxc.js";
import "./agent-scope-DMGrQp5u.js";
import "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import "./boolean-BgXe2hyu.js";
import "./env-BSjH4KuP.js";
import "./config-CWifpzL_.js";
import "./manifest-registry-DFR7U7LS.js";
import "./message-channel-BA527_ar.js";
import "./client-CEto0Pf6.js";
import "./call-i9290XP8.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import "./progress-DitCFjx_.js";
import { n as callGatewayFromCli, t as addGatewayClientOptions } from "./gateway-rpc-Dq_D40Lw.js";

//#region src/cli/system-cli.ts
const normalizeWakeMode = (raw) => {
	const mode = typeof raw === "string" ? raw.trim() : "";
	if (!mode) return "next-heartbeat";
	if (mode === "now" || mode === "next-heartbeat") return mode;
	throw new Error("--mode must be now or next-heartbeat");
};
function registerSystemCli(program) {
	const system = program.command("system").description("System tools (events, heartbeat, presence)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/system", "docs.openclaw.ai/cli/system")}\n`);
	addGatewayClientOptions(system.command("event").description("Enqueue a system event and optionally trigger a heartbeat").requiredOption("--text <text>", "System event text").option("--mode <mode>", "Wake mode (now|next-heartbeat)", "next-heartbeat").option("--json", "Output JSON", false)).action(async (opts) => {
		try {
			const text = typeof opts.text === "string" ? opts.text.trim() : "";
			if (!text) throw new Error("--text is required");
			const result = await callGatewayFromCli("wake", opts, {
				mode: normalizeWakeMode(opts.mode),
				text
			}, { expectFinal: false });
			if (opts.json) defaultRuntime.log(JSON.stringify(result, null, 2));
			else defaultRuntime.log("ok");
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	const heartbeat = system.command("heartbeat").description("Heartbeat controls");
	addGatewayClientOptions(heartbeat.command("last").description("Show the last heartbeat event").option("--json", "Output JSON", false)).action(async (opts) => {
		try {
			const result = await callGatewayFromCli("last-heartbeat", opts, void 0, { expectFinal: false });
			defaultRuntime.log(JSON.stringify(result, null, 2));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	addGatewayClientOptions(heartbeat.command("enable").description("Enable heartbeats").option("--json", "Output JSON", false)).action(async (opts) => {
		try {
			const result = await callGatewayFromCli("set-heartbeats", opts, { enabled: true }, { expectFinal: false });
			defaultRuntime.log(JSON.stringify(result, null, 2));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	addGatewayClientOptions(heartbeat.command("disable").description("Disable heartbeats").option("--json", "Output JSON", false)).action(async (opts) => {
		try {
			const result = await callGatewayFromCli("set-heartbeats", opts, { enabled: false }, { expectFinal: false });
			defaultRuntime.log(JSON.stringify(result, null, 2));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	addGatewayClientOptions(system.command("presence").description("List system presence entries").option("--json", "Output JSON", false)).action(async (opts) => {
		try {
			const result = await callGatewayFromCli("system-presence", opts, void 0, { expectFinal: false });
			defaultRuntime.log(JSON.stringify(result, null, 2));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerSystemCli };