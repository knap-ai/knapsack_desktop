import "./paths-tuenh9TL.js";
import { p as defaultRuntime } from "./subsystem-D2xHvZZd.js";
import { r as theme } from "./theme-CipOb_We.js";
import "./utils-DwZbjiC4.js";
import { cg as pickPrimaryTailnetIPv6, sg as pickPrimaryTailnetIPv4, u_ as loadConfig } from "./reply-Bm8VrLQh.js";
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
import { n as renderTable, t as getTerminalTableWidth } from "./table-DCPsyAGn.js";
import { n as resolveWideAreaDiscoveryDomain, t as getWideAreaZonePath } from "./widearea-dns-DU3fopSs.js";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
//#region src/cli/dns-cli.ts
function run(cmd, args, opts) {
	const res = spawnSync(cmd, args, {
		encoding: "utf-8",
		stdio: opts?.inherit ? "inherit" : "pipe"
	});
	if (res.error) throw res.error;
	if (!opts?.allowFailure && res.status !== 0) {
		const errText = typeof res.stderr === "string" && res.stderr.trim() ? res.stderr.trim() : `exit ${res.status ?? "unknown"}`;
		throw new Error(`${cmd} ${args.join(" ")} failed: ${errText}`);
	}
	return typeof res.stdout === "string" ? res.stdout : "";
}
function writeFileSudoIfNeeded(filePath, content) {
	try {
		fs.writeFileSync(filePath, content, "utf-8");
		return;
	} catch (err) {
		const code = err.code;
		if (code !== "EACCES" && code !== "EPERM") throw err instanceof Error ? err : new Error(String(err));
	}
	const res = spawnSync("sudo", ["tee", filePath], {
		input: content,
		encoding: "utf-8",
		stdio: [
			"pipe",
			"ignore",
			"inherit"
		]
	});
	if (res.error) throw res.error;
	if (res.status !== 0) throw new Error(`sudo tee ${filePath} failed: exit ${res.status ?? "unknown"}`);
}
function mkdirSudoIfNeeded(dirPath) {
	try {
		fs.mkdirSync(dirPath, { recursive: true });
		return;
	} catch (err) {
		const code = err.code;
		if (code !== "EACCES" && code !== "EPERM") throw err instanceof Error ? err : new Error(String(err));
	}
	run("sudo", [
		"mkdir",
		"-p",
		dirPath
	], { inherit: true });
}
function zoneFileNeedsBootstrap(zonePath) {
	if (!fs.existsSync(zonePath)) return true;
	try {
		const content = fs.readFileSync(zonePath, "utf-8");
		return !/\bSOA\b/.test(content) || !/\bNS\b/.test(content);
	} catch {
		return true;
	}
}
function detectBrewPrefix() {
	const prefix = run("brew", ["--prefix"]).trim();
	if (!prefix) throw new Error("failed to resolve Homebrew prefix");
	return prefix;
}
function ensureImportLine(corefilePath, importGlob) {
	const existing = fs.readFileSync(corefilePath, "utf-8");
	if (existing.includes(importGlob)) return false;
	writeFileSudoIfNeeded(corefilePath, `${existing.replace(/\s*$/, "")}\n\nimport ${importGlob}\n`);
	return true;
}
function registerDnsCli(program) {
	program.command("dns").description("DNS helpers for wide-area discovery (Tailscale + CoreDNS)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/dns", "docs.openclaw.ai/cli/dns")}\n`).command("setup").description("Set up CoreDNS to serve your discovery domain for unicast DNS-SD (Wide-Area Bonjour)").option("--domain <domain>", "Wide-area discovery domain (e.g. openclaw.internal)").option("--apply", "Install/update CoreDNS config and (re)start the service (requires sudo)", false).action(async (opts) => {
		const cfg = loadConfig();
		const tailnetIPv4 = pickPrimaryTailnetIPv4();
		const tailnetIPv6 = pickPrimaryTailnetIPv6();
		const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: opts.domain ?? cfg.discovery?.wideArea?.domain });
		if (!wideAreaDomain) throw new Error("No wide-area domain configured. Set discovery.wideArea.domain or pass --domain.");
		const zonePath = getWideAreaZonePath(wideAreaDomain);
		const tableWidth = getTerminalTableWidth();
		defaultRuntime.log(theme.heading("DNS setup"));
		defaultRuntime.log(renderTable({
			width: tableWidth,
			columns: [{
				key: "Key",
				header: "Key",
				minWidth: 18
			}, {
				key: "Value",
				header: "Value",
				minWidth: 24,
				flex: true
			}],
			rows: [
				{
					Key: "Domain",
					Value: wideAreaDomain
				},
				{
					Key: "Zone file",
					Value: zonePath
				},
				{
					Key: "Tailnet IP",
					Value: `${tailnetIPv4 ?? "—"}${tailnetIPv6 ? ` (v6 ${tailnetIPv6})` : ""}`
				}
			]
		}).trimEnd());
		defaultRuntime.log("");
		defaultRuntime.log(theme.heading("Recommended ~/.openclaw/openclaw.json:"));
		defaultRuntime.log(JSON.stringify({
			gateway: { bind: "auto" },
			discovery: { wideArea: {
				enabled: true,
				domain: wideAreaDomain
			} }
		}, null, 2));
		defaultRuntime.log("");
		defaultRuntime.log(theme.heading("Tailscale admin (DNS → Nameservers):"));
		defaultRuntime.log(theme.muted(`- Add nameserver: ${tailnetIPv4 ?? "<this machine's tailnet IPv4>"}`));
		defaultRuntime.log(theme.muted(`- Restrict to domain (Split DNS): ${wideAreaDomain.replace(/\.$/, "")}`));
		if (!opts.apply) {
			defaultRuntime.log("");
			defaultRuntime.log(theme.muted("Run with --apply to install CoreDNS and configure it."));
			return;
		}
		if (process.platform !== "darwin") throw new Error("dns setup is currently supported on macOS only");
		if (!tailnetIPv4 && !tailnetIPv6) throw new Error("no tailnet IP detected; ensure Tailscale is running on this machine");
		const prefix = detectBrewPrefix();
		const etcDir = path.join(prefix, "etc", "coredns");
		const corefilePath = path.join(etcDir, "Corefile");
		const confDir = path.join(etcDir, "conf.d");
		const importGlob = path.join(confDir, "*.server");
		const serverPath = path.join(confDir, `${wideAreaDomain.replace(/\.$/, "")}.server`);
		run("brew", ["list", "coredns"], { allowFailure: true });
		run("brew", ["install", "coredns"], {
			inherit: true,
			allowFailure: true
		});
		mkdirSudoIfNeeded(confDir);
		if (!fs.existsSync(corefilePath)) writeFileSudoIfNeeded(corefilePath, `import ${importGlob}\n`);
		else ensureImportLine(corefilePath, importGlob);
		const bindArgs = [tailnetIPv4, tailnetIPv6].filter((v) => Boolean(v?.trim()));
		writeFileSudoIfNeeded(serverPath, [
			`${wideAreaDomain.replace(/\.$/, "")}:53 {`,
			`  bind ${bindArgs.join(" ")}`,
			`  file ${zonePath} {`,
			`    reload 10s`,
			`  }`,
			`  errors`,
			`  log`,
			`}`,
			``
		].join("\n"));
		await fs.promises.mkdir(path.dirname(zonePath), { recursive: true });
		if (zoneFileNeedsBootstrap(zonePath)) {
			const serial = `${(/* @__PURE__ */ new Date()).getUTCFullYear()}${String((/* @__PURE__ */ new Date()).getUTCMonth() + 1).padStart(2, "0")}${String((/* @__PURE__ */ new Date()).getUTCDate()).padStart(2, "0")}01`;
			const zoneLines = [
				`; created by openclaw dns setup (will be overwritten by the gateway when wide-area discovery is enabled)`,
				`$ORIGIN ${wideAreaDomain}`,
				`$TTL 60`,
				`@ IN SOA ns1 hostmaster ${serial} 7200 3600 1209600 60`,
				`@ IN NS ns1`,
				tailnetIPv4 ? `ns1 IN A ${tailnetIPv4}` : null,
				tailnetIPv6 ? `ns1 IN AAAA ${tailnetIPv6}` : null,
				``
			].filter((line) => Boolean(line));
			fs.writeFileSync(zonePath, zoneLines.join("\n"), "utf-8");
		}
		defaultRuntime.log("");
		defaultRuntime.log(theme.heading("Starting CoreDNS (sudo)…"));
		run("sudo", [
			"brew",
			"services",
			"restart",
			"coredns"
		], { inherit: true });
		if (cfg.discovery?.wideArea?.enabled !== true) {
			defaultRuntime.log("");
			defaultRuntime.log(theme.muted("Note: enable discovery.wideArea.enabled in ~/.openclaw/openclaw.json on the gateway and restart the gateway so it writes the DNS-SD zone."));
		}
	});
}
//#endregion
export { registerDnsCli };
