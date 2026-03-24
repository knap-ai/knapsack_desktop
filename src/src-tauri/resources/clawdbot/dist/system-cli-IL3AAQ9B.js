import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import { r as theme } from "./theme-CdOoMzRk.js";
import { t as danger } from "./globals-DBUMOBZ8.js";
import { m as defaultRuntime } from "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import "./env-Dnra1IpT.js";
import "./utils-CS0Ikux6.js";
import { t as formatDocsLink } from "./links-8xRhWBQL.js";
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
import "./audit-fs-DTQIjp2r.js";
import "./resolve-B7S4PlnO.js";
import "./tailnet-DHiKSG7V.js";
import "./net-JAg9zL0G.js";
import "./credentials-D8pfRimu.js";
import "./message-channel-BliByQBl.js";
import "./method-scopes-BiEi0X2g.js";
import "./call-CQbSO4Fr.js";
import "./progress-C78aA91n.js";
import { n as callGatewayFromCli, t as addGatewayClientOptions } from "./gateway-rpc-DWP720Xw.js";
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
		if (opts.json || successText === void 0) defaultRuntime.writeJson(result);
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
