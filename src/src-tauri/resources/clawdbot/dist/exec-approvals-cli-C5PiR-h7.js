import "./redact-BDinS1q9.js";
import "./errors-BxyFnvP3.js";
import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import { n as isRich, r as theme } from "./theme-CdOoMzRk.js";
import "./globals-DBUMOBZ8.js";
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
import "./ports-lsof-BLEgL_Gn.js";
import "./restart-stale-pids-BsPvlGJd.js";
import "./runtime-parse-BUn1nl6s.js";
import "./launchd-yOx8f787.js";
import "./service-DdJ2Qk7P.js";
import "./ports-FldL_Lhq.js";
import "./systemd-bGhJCG6J.js";
import "./progress-C78aA91n.js";
import { b as saveExecApprovals, f as readExecApprovalsSnapshot } from "./exec-approvals-BF_Qfdq8.js";
import { n as formatTimeAgo } from "./format-relative-CicVg5ot.js";
import { n as callGatewayFromCli } from "./gateway-rpc-DWP720Xw.js";
import { n as renderTable, t as getTerminalTableWidth } from "./table-7g_hocqO.js";
import { t as describeUnknownError } from "./shared-DdWaoh8l.js";
import { a as resolveNodeId, r as nodesCallOpts } from "./rpc-B4CaPGkJ.js";
import JSON5 from "json5";
import fs from "node:fs/promises";
//#region src/cli/exec-approvals-cli.ts
async function readStdin() {
	const chunks = [];
	for await (const chunk of process.stdin) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
	return Buffer.concat(chunks).toString("utf8");
}
async function resolveTargetNodeId(opts) {
	if (opts.gateway) return null;
	const raw = opts.node?.trim() ?? "";
	if (!raw) return null;
	return await resolveNodeId(opts, raw);
}
async function loadSnapshot(opts, nodeId) {
	return await callGatewayFromCli(nodeId ? "exec.approvals.node.get" : "exec.approvals.get", opts, nodeId ? { nodeId } : {});
}
function loadSnapshotLocal() {
	const snapshot = readExecApprovalsSnapshot();
	return {
		path: snapshot.path,
		exists: snapshot.exists,
		hash: snapshot.hash,
		file: snapshot.file
	};
}
function saveSnapshotLocal(file) {
	saveExecApprovals(file);
	return loadSnapshotLocal();
}
async function loadSnapshotTarget(opts) {
	if (!opts.gateway && !opts.node) return {
		snapshot: loadSnapshotLocal(),
		nodeId: null,
		source: "local"
	};
	const nodeId = await resolveTargetNodeId(opts);
	return {
		snapshot: await loadSnapshot(opts, nodeId),
		nodeId,
		source: nodeId ? "node" : "gateway"
	};
}
function exitWithError(message) {
	defaultRuntime.error(message);
	defaultRuntime.exit(1);
	throw new Error(message);
}
function requireTrimmedNonEmpty(value, message) {
	const trimmed = value.trim();
	if (!trimmed) exitWithError(message);
	return trimmed;
}
async function loadWritableSnapshotTarget(opts) {
	const { snapshot, nodeId, source } = await loadSnapshotTarget(opts);
	if (source === "local") defaultRuntime.log(theme.muted("Writing local approvals."));
	const targetLabel = source === "local" ? "local" : nodeId ? `node:${nodeId}` : "gateway";
	const baseHash = snapshot.hash;
	if (!baseHash) exitWithError("Exec approvals hash missing; reload and retry.");
	return {
		snapshot,
		nodeId,
		source,
		targetLabel,
		baseHash
	};
}
async function saveSnapshotTargeted(params) {
	const next = params.source === "local" ? saveSnapshotLocal(params.file) : await saveSnapshot(params.opts, params.nodeId, params.file, params.baseHash);
	if (params.opts.json) {
		defaultRuntime.writeJson(next, 0);
		return;
	}
	defaultRuntime.log(theme.muted(`Target: ${params.targetLabel}`));
	renderApprovalsSnapshot(next, params.targetLabel);
}
function formatCliError(err) {
	const msg = describeUnknownError(err);
	return msg.includes("\n") ? msg.split("\n")[0] : msg;
}
function renderApprovalsSnapshot(snapshot, targetLabel) {
	const rich = isRich();
	const heading = (text) => rich ? theme.heading(text) : text;
	const muted = (text) => rich ? theme.muted(text) : text;
	const tableWidth = getTerminalTableWidth();
	const file = snapshot.file ?? { version: 1 };
	const defaults = file.defaults ?? {};
	const defaultsParts = [
		defaults.security ? `security=${defaults.security}` : null,
		defaults.ask ? `ask=${defaults.ask}` : null,
		defaults.askFallback ? `askFallback=${defaults.askFallback}` : null,
		typeof defaults.autoAllowSkills === "boolean" ? `autoAllowSkills=${defaults.autoAllowSkills ? "on" : "off"}` : null
	].filter(Boolean);
	const agents = file.agents ?? {};
	const allowlistRows = [];
	const now = Date.now();
	for (const [agentId, agent] of Object.entries(agents)) {
		const allowlist = Array.isArray(agent.allowlist) ? agent.allowlist : [];
		for (const entry of allowlist) {
			const pattern = entry?.pattern?.trim() ?? "";
			if (!pattern) continue;
			const lastUsedAt = typeof entry.lastUsedAt === "number" ? entry.lastUsedAt : null;
			allowlistRows.push({
				Target: targetLabel,
				Agent: agentId,
				Pattern: pattern,
				LastUsed: lastUsedAt ? formatTimeAgo(Math.max(0, now - lastUsedAt)) : muted("unknown")
			});
		}
	}
	const summaryRows = [
		{
			Field: "Target",
			Value: targetLabel
		},
		{
			Field: "Path",
			Value: snapshot.path
		},
		{
			Field: "Exists",
			Value: snapshot.exists ? "yes" : "no"
		},
		{
			Field: "Hash",
			Value: snapshot.hash
		},
		{
			Field: "Version",
			Value: String(file.version ?? 1)
		},
		{
			Field: "Socket",
			Value: file.socket?.path ?? "default"
		},
		{
			Field: "Defaults",
			Value: defaultsParts.length > 0 ? defaultsParts.join(", ") : "none"
		},
		{
			Field: "Agents",
			Value: String(Object.keys(agents).length)
		},
		{
			Field: "Allowlist",
			Value: String(allowlistRows.length)
		}
	];
	defaultRuntime.log(heading("Approvals"));
	defaultRuntime.log(renderTable({
		width: tableWidth,
		columns: [{
			key: "Field",
			header: "Field",
			minWidth: 8
		}, {
			key: "Value",
			header: "Value",
			minWidth: 24,
			flex: true
		}],
		rows: summaryRows
	}).trimEnd());
	if (allowlistRows.length === 0) {
		defaultRuntime.log("");
		defaultRuntime.log(muted("No allowlist entries."));
		return;
	}
	defaultRuntime.log("");
	defaultRuntime.log(heading("Allowlist"));
	defaultRuntime.log(renderTable({
		width: tableWidth,
		columns: [
			{
				key: "Target",
				header: "Target",
				minWidth: 10
			},
			{
				key: "Agent",
				header: "Agent",
				minWidth: 8
			},
			{
				key: "Pattern",
				header: "Pattern",
				minWidth: 20,
				flex: true
			},
			{
				key: "LastUsed",
				header: "Last Used",
				minWidth: 10
			}
		],
		rows: allowlistRows
	}).trimEnd());
}
async function saveSnapshot(opts, nodeId, file, baseHash) {
	return await callGatewayFromCli(nodeId ? "exec.approvals.node.set" : "exec.approvals.set", opts, nodeId ? {
		nodeId,
		file,
		baseHash
	} : {
		file,
		baseHash
	});
}
function resolveAgentKey(value) {
	const trimmed = value?.trim() ?? "";
	return trimmed ? trimmed : "*";
}
function normalizeAllowlistEntry(entry) {
	const pattern = entry?.pattern?.trim() ?? "";
	return pattern ? pattern : null;
}
function ensureAgent(file, agentKey) {
	const agents = file.agents ?? {};
	const entry = agents[agentKey] ?? {};
	file.agents = agents;
	return entry;
}
function isEmptyAgent(agent) {
	const allowlist = Array.isArray(agent.allowlist) ? agent.allowlist : [];
	return !agent.security && !agent.ask && !agent.askFallback && agent.autoAllowSkills === void 0 && allowlist.length === 0;
}
async function loadWritableAllowlistAgent(opts) {
	const { snapshot, nodeId, source, targetLabel, baseHash } = await loadWritableSnapshotTarget(opts);
	const file = snapshot.file ?? { version: 1 };
	file.version = 1;
	const agentKey = resolveAgentKey(opts.agent);
	const agent = ensureAgent(file, agentKey);
	return {
		nodeId,
		source,
		targetLabel,
		baseHash,
		file,
		agentKey,
		agent,
		allowlistEntries: Array.isArray(agent.allowlist) ? agent.allowlist : []
	};
}
async function runAllowlistMutation(pattern, opts, mutate) {
	try {
		const trimmedPattern = requireTrimmedNonEmpty(pattern, "Pattern required.");
		const context = await loadWritableAllowlistAgent(opts);
		if (!await mutate({
			...context,
			trimmedPattern
		})) return;
		await saveSnapshotTargeted({
			opts,
			source: context.source,
			nodeId: context.nodeId,
			file: context.file,
			baseHash: context.baseHash,
			targetLabel: context.targetLabel
		});
	} catch (err) {
		defaultRuntime.error(formatCliError(err));
		defaultRuntime.exit(1);
	}
}
function registerAllowlistMutationCommand(params) {
	const command = params.allowlist.command(`${params.name} <pattern>`).description(params.description).option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).option("--agent <id>", "Agent id (defaults to \"*\")").action(async (pattern, opts) => {
		await runAllowlistMutation(pattern, opts, params.mutate);
	});
	nodesCallOpts(command);
	return command;
}
function registerExecApprovalsCli(program) {
	const formatExample = (cmd, desc) => `  ${theme.command(cmd)}\n    ${theme.muted(desc)}`;
	const approvals = program.command("approvals").alias("exec-approvals").description("Manage exec approvals (gateway or node host)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/approvals", "docs.openclaw.ai/cli/approvals")}\n`);
	nodesCallOpts(approvals.command("get").description("Fetch exec approvals snapshot").option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).action(async (opts) => {
		try {
			const { snapshot, nodeId, source } = await loadSnapshotTarget(opts);
			if (opts.json) {
				defaultRuntime.writeJson(snapshot, 0);
				return;
			}
			const muted = (text) => isRich() ? theme.muted(text) : text;
			if (source === "local") {
				defaultRuntime.log(muted("Showing local approvals."));
				defaultRuntime.log("");
			}
			renderApprovalsSnapshot(snapshot, source === "local" ? "local" : nodeId ? `node:${nodeId}` : "gateway");
		} catch (err) {
			defaultRuntime.error(formatCliError(err));
			defaultRuntime.exit(1);
		}
	}));
	nodesCallOpts(approvals.command("set").description("Replace exec approvals with a JSON file").option("--node <node>", "Target node id/name/IP").option("--gateway", "Force gateway approvals", false).option("--file <path>", "Path to JSON file to upload").option("--stdin", "Read JSON from stdin", false).action(async (opts) => {
		try {
			if (!opts.file && !opts.stdin) exitWithError("Provide --file or --stdin.");
			if (opts.file && opts.stdin) exitWithError("Use either --file or --stdin (not both).");
			const { source, nodeId, targetLabel, baseHash } = await loadWritableSnapshotTarget(opts);
			const raw = opts.stdin ? await readStdin() : await fs.readFile(String(opts.file), "utf8");
			let file;
			try {
				file = JSON5.parse(raw);
			} catch (err) {
				exitWithError(`Failed to parse approvals JSON: ${String(err)}`);
			}
			file.version = 1;
			await saveSnapshotTargeted({
				opts,
				source,
				nodeId,
				file,
				baseHash,
				targetLabel
			});
		} catch (err) {
			defaultRuntime.error(formatCliError(err));
			defaultRuntime.exit(1);
		}
	}));
	const allowlist = approvals.command("allowlist").description("Edit the per-agent allowlist").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatExample("openclaw approvals allowlist add \"~/Projects/**/bin/rg\"", "Allowlist a local binary pattern for the main agent.")}\n${formatExample("openclaw approvals allowlist add --agent main --node <id|name|ip> \"/usr/bin/uptime\"", "Allowlist on a specific node/agent.")}\n${formatExample("openclaw approvals allowlist add --agent \"*\" \"/usr/bin/uname\"", "Allowlist for all agents (wildcard).")}\n${formatExample("openclaw approvals allowlist remove \"~/Projects/**/bin/rg\"", "Remove an allowlist pattern.")}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/approvals", "docs.openclaw.ai/cli/approvals")}\n`);
	registerAllowlistMutationCommand({
		allowlist,
		name: "add",
		description: "Add a glob pattern to an allowlist",
		mutate: ({ trimmedPattern, file, agent, agentKey, allowlistEntries }) => {
			if (allowlistEntries.some((entry) => normalizeAllowlistEntry(entry) === trimmedPattern)) {
				defaultRuntime.log("Already allowlisted.");
				return false;
			}
			allowlistEntries.push({
				pattern: trimmedPattern,
				lastUsedAt: Date.now()
			});
			agent.allowlist = allowlistEntries;
			file.agents = {
				...file.agents,
				[agentKey]: agent
			};
			return true;
		}
	});
	registerAllowlistMutationCommand({
		allowlist,
		name: "remove",
		description: "Remove a glob pattern from an allowlist",
		mutate: ({ trimmedPattern, file, agent, agentKey, allowlistEntries }) => {
			const nextEntries = allowlistEntries.filter((entry) => normalizeAllowlistEntry(entry) !== trimmedPattern);
			if (nextEntries.length === allowlistEntries.length) {
				defaultRuntime.log("Pattern not found.");
				return false;
			}
			if (nextEntries.length === 0) delete agent.allowlist;
			else agent.allowlist = nextEntries;
			if (isEmptyAgent(agent)) {
				const agents = { ...file.agents };
				delete agents[agentKey];
				file.agents = Object.keys(agents).length > 0 ? agents : void 0;
			} else file.agents = {
				...file.agents,
				[agentKey]: agent
			};
			return true;
		}
	});
}
//#endregion
export { registerExecApprovalsCli };
