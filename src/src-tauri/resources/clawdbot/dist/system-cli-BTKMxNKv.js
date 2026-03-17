import { p as defaultRuntime, v as danger } from "./subsystem-BDbeCphF.js";
import "./paths-dQ_clcF4.js";
import { r as theme } from "./theme-H80Q3Qtv.js";
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
import { t as formatDocsLink } from "./links-BuWtQKK5.js";
import "./cli-utils-CCDylRkX.js";
import { n as callGatewayFromCli, t as addGatewayClientOptions } from "./gateway-rpc-DDuWmIVq.js";
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
