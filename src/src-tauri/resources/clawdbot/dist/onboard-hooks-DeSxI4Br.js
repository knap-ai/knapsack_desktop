import "./paths-tuenh9TL.js";
import "./subsystem-D2xHvZZd.js";
import "./theme-CipOb_We.js";
import "./utils-DwZbjiC4.js";
import { d as resolveAgentWorkspaceDir, f as resolveDefaultAgentId } from "./agent-scope-DvYJ0Ktc.js";
import "./openclaw-root-3m-COvjr.js";
import "./logger-BZyLeV9r.js";
import "./exec-BQevMHrc.js";
import { t as formatCliCommand } from "./command-format-3Z_Kl5PP.js";
import "./boolean-CJxfhBkG.js";
import "./frontmatter-7FVJq8_7.js";
import "./workspace-y1LuVOrM.js";
import { t as buildWorkspaceHookStatus } from "./hooks-status-Dd_IFsrn.js";
//#region src/commands/onboard-hooks.ts
async function setupInternalHooks(cfg, runtime, prompter) {
	await prompter.note([
		"Hooks let you automate actions when agent commands are issued.",
		"Example: Save session context to memory when you issue /new or /reset.",
		"",
		"Learn more: https://docs.openclaw.ai/automation/hooks"
	].join("\n"), "Hooks");
	const eligibleHooks = buildWorkspaceHookStatus(resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)), { config: cfg }).hooks.filter((h) => h.eligible);
	if (eligibleHooks.length === 0) {
		await prompter.note("No eligible hooks found. You can configure hooks later in your config.", "No Hooks Available");
		return cfg;
	}
	const selected = (await prompter.multiselect({
		message: "Enable hooks?",
		options: [{
			value: "__skip__",
			label: "Skip for now"
		}, ...eligibleHooks.map((hook) => ({
			value: hook.name,
			label: `${hook.emoji ?? "🔗"} ${hook.name}`,
			hint: hook.description
		}))]
	})).filter((name) => name !== "__skip__");
	if (selected.length === 0) return cfg;
	const entries = { ...cfg.hooks?.internal?.entries };
	for (const name of selected) entries[name] = { enabled: true };
	const next = {
		...cfg,
		hooks: {
			...cfg.hooks,
			internal: {
				enabled: true,
				entries
			}
		}
	};
	await prompter.note([
		`Enabled ${selected.length} hook${selected.length > 1 ? "s" : ""}: ${selected.join(", ")}`,
		"",
		"You can manage hooks later with:",
		`  ${formatCliCommand("openclaw hooks list")}`,
		`  ${formatCliCommand("openclaw hooks enable <name>")}`,
		`  ${formatCliCommand("openclaw hooks disable <name>")}`
	].join("\n"), "Hooks Configured");
	return next;
}
//#endregion
export { setupInternalHooks };
