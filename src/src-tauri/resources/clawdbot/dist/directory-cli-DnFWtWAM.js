import { p as defaultRuntime, v as danger } from "./subsystem-BDbeCphF.js";
import "./paths-dQ_clcF4.js";
import { r as theme } from "./theme-H80Q3Qtv.js";
import "./boolean-DTgd5CzD.js";
import { G as formatHelpExamples, ao as resolveMessageChannelSelection, jg as loadConfig } from "./auth-profiles-DRjqKE3G.js";
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
import { t as getChannelPlugin, ut as resolveChannelDefaultAccountId } from "./plugins-C-z6VZlO.js";
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
import { n as renderTable, t as getTerminalTableWidth } from "./table-BF1XI13C.js";
//#region src/cli/directory-cli.ts
function parseLimit(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		if (value <= 0) return null;
		return Math.floor(value);
	}
	if (typeof value !== "string") return null;
	const raw = value.trim();
	if (!raw) return null;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return null;
	return parsed;
}
function buildRows(entries) {
	return entries.map((entry) => ({
		ID: entry.id,
		Name: entry.name?.trim() ?? ""
	}));
}
function printDirectoryList(params) {
	if (params.entries.length === 0) {
		defaultRuntime.log(theme.muted(params.emptyMessage));
		return;
	}
	const tableWidth = getTerminalTableWidth();
	defaultRuntime.log(`${theme.heading(params.title)} ${theme.muted(`(${params.entries.length})`)}`);
	defaultRuntime.log(renderTable({
		width: tableWidth,
		columns: [{
			key: "ID",
			header: "ID",
			minWidth: 16,
			flex: true
		}, {
			key: "Name",
			header: "Name",
			minWidth: 18,
			flex: true
		}],
		rows: buildRows(params.entries)
	}).trimEnd());
}
function registerDirectoryCli(program) {
	const directory = program.command("directory").description("Lookup contact and group IDs (self, peers, groups) for supported chat channels").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw directory self --channel slack", "Show the connected account identity."],
		["openclaw directory peers list --channel slack --query \"alice\"", "Search contact/user IDs by name."],
		["openclaw directory groups list --channel discord", "List available groups/channels."],
		["openclaw directory groups members --channel discord --group-id <id>", "List members for a specific group."]
	])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/directory", "docs.openclaw.ai/cli/directory")}\n`).action(() => {
		directory.help({ error: true });
	});
	const withChannel = (cmd) => cmd.option("--channel <name>", "Channel (auto when only one is configured)").option("--account <id>", "Account id (accountId)").option("--json", "Output JSON", false);
	const resolve = async (opts) => {
		const cfg = loadConfig();
		const channelId = (await resolveMessageChannelSelection({
			cfg,
			channel: opts.channel ?? null
		})).channel;
		const plugin = getChannelPlugin(channelId);
		if (!plugin) throw new Error(`Unsupported channel: ${String(channelId)}`);
		return {
			cfg,
			channelId,
			accountId: opts.account?.trim() || resolveChannelDefaultAccountId({
				plugin,
				cfg
			}),
			plugin
		};
	};
	const runDirectoryList = async (params) => {
		const { cfg, channelId, accountId, plugin } = await resolve({
			channel: params.opts.channel,
			account: params.opts.account
		});
		const fn = params.action === "listPeers" ? plugin.directory?.listPeers : plugin.directory?.listGroups;
		if (!fn) throw new Error(`Channel ${channelId} does not support directory ${params.unsupported}`);
		const result = await fn({
			cfg,
			accountId,
			query: params.opts.query ?? null,
			limit: parseLimit(params.opts.limit),
			runtime: defaultRuntime
		});
		if (params.opts.json) {
			defaultRuntime.log(JSON.stringify(result, null, 2));
			return;
		}
		printDirectoryList({
			title: params.title,
			emptyMessage: params.emptyMessage,
			entries: result
		});
	};
	withChannel(directory.command("self").description("Show the current account user")).action(async (opts) => {
		try {
			const { cfg, channelId, accountId, plugin } = await resolve({
				channel: opts.channel,
				account: opts.account
			});
			const fn = plugin.directory?.self;
			if (!fn) throw new Error(`Channel ${channelId} does not support directory self`);
			const result = await fn({
				cfg,
				accountId,
				runtime: defaultRuntime
			});
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			if (!result) {
				defaultRuntime.log(theme.muted("Not available."));
				return;
			}
			const tableWidth = getTerminalTableWidth();
			defaultRuntime.log(theme.heading("Self"));
			defaultRuntime.log(renderTable({
				width: tableWidth,
				columns: [{
					key: "ID",
					header: "ID",
					minWidth: 16,
					flex: true
				}, {
					key: "Name",
					header: "Name",
					minWidth: 18,
					flex: true
				}],
				rows: buildRows([result])
			}).trimEnd());
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	withChannel(directory.command("peers").description("Peer directory (contacts/users)").command("list").description("List peers")).option("--query <text>", "Optional search query").option("--limit <n>", "Limit results").action(async (opts) => {
		try {
			await runDirectoryList({
				opts,
				action: "listPeers",
				unsupported: "peers",
				title: "Peers",
				emptyMessage: "No peers found."
			});
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	const groups = directory.command("groups").description("Group directory");
	withChannel(groups.command("list").description("List groups")).option("--query <text>", "Optional search query").option("--limit <n>", "Limit results").action(async (opts) => {
		try {
			await runDirectoryList({
				opts,
				action: "listGroups",
				unsupported: "groups",
				title: "Groups",
				emptyMessage: "No groups found."
			});
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	withChannel(groups.command("members").description("List group members").requiredOption("--group-id <id>", "Group id")).option("--limit <n>", "Limit results").action(async (opts) => {
		try {
			const { cfg, channelId, accountId, plugin } = await resolve({
				channel: opts.channel,
				account: opts.account
			});
			const fn = plugin.directory?.listGroupMembers;
			if (!fn) throw new Error(`Channel ${channelId} does not support group members listing`);
			const groupId = String(opts.groupId ?? "").trim();
			if (!groupId) throw new Error("Missing --group-id");
			const result = await fn({
				cfg,
				accountId,
				groupId,
				limit: parseLimit(opts.limit),
				runtime: defaultRuntime
			});
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			printDirectoryList({
				title: "Group Members",
				emptyMessage: "No group members found.",
				entries: result
			});
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
}
//#endregion
export { registerDirectoryCli };
