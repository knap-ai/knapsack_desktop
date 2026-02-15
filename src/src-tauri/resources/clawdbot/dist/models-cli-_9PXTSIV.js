import { M as theme, h as defaultRuntime } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./pi-model-discovery-EhM2JAQo.js";
import "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import "./plugins-DsHRVW6o.js";
import "./logging-B5vJSgy6.js";
import "./accounts-CXiTuiOz.js";
import "./send-DQh-tTYV.js";
import "./send-C34nHKc5.js";
import "./reply-DWlAlSNj.js";
import "./media-EWF5qDpT.js";
import "./message-channel-D-iPIX3C.js";
import "./render-DyRjoIgA.js";
import "./tables-DuWEJJJ_.js";
import "./image-ops-BuOO2fiP.js";
import "./fetch-CiM7YqYo.js";
import "./tool-images-Do-zTkGT.js";
import "./common-2Kd-SlSi.js";
import "./server-context-DSQVDg5o.js";
import "./chrome-Biwk6Xdw.js";
import "./auth-DaQXd14b.js";
import "./control-auth-B-AeOmM1.js";
import "./ports-C5vKQsaq.js";
import "./control-service-BWKREGJh.js";
import "./deliver-CPbyDZgw.js";
import "./pi-embedded-helpers-Bgii3Law.js";
import "./sessions-DGtM0qOW.js";
import "./runner-BY_Cu0GM.js";
import "./image-qihRjcmd.js";
import "./models-config-BUvHYVxN.js";
import "./sandbox-yPHyBnUy.js";
import "./skills-C1pxUa-I.js";
import "./routes-BpW33PMu.js";
import "./store-C2n2K571.js";
import "./paths-D9QhlJYC.js";
import "./redact-Bt-krp_b.js";
import "./tool-display-Dq-NBueh.js";
import "./context-DPQWp4WP.js";
import "./dispatcher-CLCH2DxP.js";
import "./send-C0RXgj4W.js";
import "./memory-cli-C--Zm-5F.js";
import "./manager-D5ku6Y-s.js";
import "./sqlite-hOA2wjjf.js";
import "./retry-CO00OgwL.js";
import "./commands-registry-B3DBZLId.js";
import "./client-DV6vI7ic.js";
import "./call-FZUZ5EU4.js";
import "./channel-activity-CuiCbmeL.js";
import "./send-h1nuAso5.js";
import { t as formatDocsLink } from "./links-C_tOT2wV.js";
import { n as runCommandWithRuntime, t as resolveOptionFromCommand } from "./cli-utils-r6pQ5iCT.js";
import "./progress-C4IJwa0T.js";
import "./pairing-store-C9d3jZbc.js";
import "./pi-tools.policy-CTtzXtkF.js";
import "./send-CnpwMynh.js";
import "./onboard-helpers-HBGG6t5A.js";
import "./prompt-style-f1NZuGno.js";
import "./pairing-labels-CxEJEpbD.js";
import "./session-cost-usage-DOubaz12.js";
import "./nodes-screen-ChgT1pbh.js";
import "./channel-selection-CHRRzvpU.js";
import "./delivery-queue-BFRO68fM.js";
import "./note-68V10H-1.js";
import "./clack-prompter-DQbUxHl-.js";
import "./table-DvO2pSzv.js";
import { t as githubCopilotLoginCommand } from "./github-copilot-auth-CzffPdhi.js";
import "./logging-By_aaJZy.js";
import { C as modelsAliasesListCommand, S as modelsAliasesAddCommand, _ as modelsAuthOrderSetCommand, a as modelsStatusCommand, b as modelsAuthPasteTokenCommand, c as modelsImageFallbacksClearCommand, d as modelsFallbacksAddCommand, f as modelsFallbacksClearCommand, g as modelsAuthOrderGetCommand, h as modelsAuthOrderClearCommand, i as modelsScanCommand, l as modelsImageFallbacksListCommand, m as modelsFallbacksRemoveCommand, n as modelsSetImageCommand, o as modelsListCommand, p as modelsFallbacksListCommand, r as modelsSetCommand, s as modelsImageFallbacksAddCommand, u as modelsImageFallbacksRemoveCommand, v as modelsAuthAddCommand, w as modelsAliasesRemoveCommand, x as modelsAuthSetupTokenCommand, y as modelsAuthLoginCommand } from "./models-BIcSB9ge.js";
import "./auth-health-UVQVyv5B.js";

//#region src/cli/models-cli.ts
function runModelsCommand(action) {
	return runCommandWithRuntime(defaultRuntime, action);
}
function registerModelsCli(program) {
	const models = program.command("models").description("Model discovery, scanning, and configuration").option("--status-json", "Output JSON (alias for `models status --json`)", false).option("--status-plain", "Plain output (alias for `models status --plain`)", false).option("--agent <id>", "Agent id to inspect (overrides OPENCLAW_AGENT_DIR/PI_CODING_AGENT_DIR)").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/models", "docs.openclaw.ai/cli/models")}\n`);
	models.command("list").description("List models (configured by default)").option("--all", "Show full model catalog", false).option("--local", "Filter to local models", false).option("--provider <name>", "Filter by provider").option("--json", "Output JSON", false).option("--plain", "Plain line output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsListCommand(opts, defaultRuntime);
		});
	});
	models.command("status").description("Show configured model state").option("--json", "Output JSON", false).option("--plain", "Plain output", false).option("--check", "Exit non-zero if auth is expiring/expired (1=expired/missing, 2=expiring)", false).option("--probe", "Probe configured provider auth (live)", false).option("--probe-provider <name>", "Only probe a single provider").option("--probe-profile <id>", "Only probe specific auth profile ids (repeat or comma-separated)", (value, previous) => {
		const next = Array.isArray(previous) ? previous : previous ? [previous] : [];
		next.push(value);
		return next;
	}).option("--probe-timeout <ms>", "Per-probe timeout in ms").option("--probe-concurrency <n>", "Concurrent probes").option("--probe-max-tokens <n>", "Probe max tokens (best-effort)").option("--agent <id>", "Agent id to inspect (overrides OPENCLAW_AGENT_DIR/PI_CODING_AGENT_DIR)").action(async (opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsStatusCommand({
				json: Boolean(opts.json),
				plain: Boolean(opts.plain),
				check: Boolean(opts.check),
				probe: Boolean(opts.probe),
				probeProvider: opts.probeProvider,
				probeProfile: opts.probeProfile,
				probeTimeout: opts.probeTimeout,
				probeConcurrency: opts.probeConcurrency,
				probeMaxTokens: opts.probeMaxTokens,
				agent
			}, defaultRuntime);
		});
	});
	models.command("set").description("Set the default model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsSetCommand(model, defaultRuntime);
		});
	});
	models.command("set-image").description("Set the image model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsSetImageCommand(model, defaultRuntime);
		});
	});
	const aliases = models.command("aliases").description("Manage model aliases");
	aliases.command("list").description("List model aliases").option("--json", "Output JSON", false).option("--plain", "Plain output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAliasesListCommand(opts, defaultRuntime);
		});
	});
	aliases.command("add").description("Add or update a model alias").argument("<alias>", "Alias name").argument("<model>", "Model id or alias").action(async (alias, model) => {
		await runModelsCommand(async () => {
			await modelsAliasesAddCommand(alias, model, defaultRuntime);
		});
	});
	aliases.command("remove").description("Remove a model alias").argument("<alias>", "Alias name").action(async (alias) => {
		await runModelsCommand(async () => {
			await modelsAliasesRemoveCommand(alias, defaultRuntime);
		});
	});
	const fallbacks = models.command("fallbacks").description("Manage model fallback list");
	fallbacks.command("list").description("List fallback models").option("--json", "Output JSON", false).option("--plain", "Plain output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsFallbacksListCommand(opts, defaultRuntime);
		});
	});
	fallbacks.command("add").description("Add a fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsFallbacksAddCommand(model, defaultRuntime);
		});
	});
	fallbacks.command("remove").description("Remove a fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsFallbacksRemoveCommand(model, defaultRuntime);
		});
	});
	fallbacks.command("clear").description("Clear all fallback models").action(async () => {
		await runModelsCommand(async () => {
			await modelsFallbacksClearCommand(defaultRuntime);
		});
	});
	const imageFallbacks = models.command("image-fallbacks").description("Manage image model fallback list");
	imageFallbacks.command("list").description("List image fallback models").option("--json", "Output JSON", false).option("--plain", "Plain output", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksListCommand(opts, defaultRuntime);
		});
	});
	imageFallbacks.command("add").description("Add an image fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksAddCommand(model, defaultRuntime);
		});
	});
	imageFallbacks.command("remove").description("Remove an image fallback model").argument("<model>", "Model id or alias").action(async (model) => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksRemoveCommand(model, defaultRuntime);
		});
	});
	imageFallbacks.command("clear").description("Clear all image fallback models").action(async () => {
		await runModelsCommand(async () => {
			await modelsImageFallbacksClearCommand(defaultRuntime);
		});
	});
	models.command("scan").description("Scan OpenRouter free models for tools + images").option("--min-params <b>", "Minimum parameter size (billions)").option("--max-age-days <days>", "Skip models older than N days").option("--provider <name>", "Filter by provider prefix").option("--max-candidates <n>", "Max fallback candidates", "6").option("--timeout <ms>", "Per-probe timeout in ms").option("--concurrency <n>", "Probe concurrency").option("--no-probe", "Skip live probes; list free candidates only").option("--yes", "Accept defaults without prompting", false).option("--no-input", "Disable prompts (use defaults)").option("--set-default", "Set agents.defaults.model to the first selection", false).option("--set-image", "Set agents.defaults.imageModel to the first image selection", false).option("--json", "Output JSON", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsScanCommand(opts, defaultRuntime);
		});
	});
	models.action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsStatusCommand({
				json: Boolean(opts?.statusJson),
				plain: Boolean(opts?.statusPlain),
				agent: opts?.agent
			}, defaultRuntime);
		});
	});
	const auth = models.command("auth").description("Manage model auth profiles");
	auth.option("--agent <id>", "Agent id for auth order get/set/clear");
	auth.action(() => {
		auth.help();
	});
	auth.command("add").description("Interactive auth helper (setup-token or paste token)").action(async () => {
		await runModelsCommand(async () => {
			await modelsAuthAddCommand({}, defaultRuntime);
		});
	});
	auth.command("login").description("Run a provider plugin auth flow (OAuth/API key)").option("--provider <id>", "Provider id registered by a plugin").option("--method <id>", "Provider auth method id").option("--set-default", "Apply the provider's default model recommendation", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAuthLoginCommand({
				provider: opts.provider,
				method: opts.method,
				setDefault: Boolean(opts.setDefault)
			}, defaultRuntime);
		});
	});
	auth.command("setup-token").description("Run a provider CLI to create/sync a token (TTY required)").option("--provider <name>", "Provider id (default: anthropic)").option("--yes", "Skip confirmation", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAuthSetupTokenCommand({
				provider: opts.provider,
				yes: Boolean(opts.yes)
			}, defaultRuntime);
		});
	});
	auth.command("paste-token").description("Paste a token into auth-profiles.json and update config").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--profile-id <id>", "Auth profile id (default: <provider>:manual)").option("--expires-in <duration>", "Optional expiry duration (e.g. 365d, 12h). Stored as absolute expiresAt.").action(async (opts) => {
		await runModelsCommand(async () => {
			await modelsAuthPasteTokenCommand({
				provider: opts.provider,
				profileId: opts.profileId,
				expiresIn: opts.expiresIn
			}, defaultRuntime);
		});
	});
	auth.command("login-github-copilot").description("Login to GitHub Copilot via GitHub device flow (TTY required)").option("--profile-id <id>", "Auth profile id (default: github-copilot:github)").option("--yes", "Overwrite existing profile without prompting", false).action(async (opts) => {
		await runModelsCommand(async () => {
			await githubCopilotLoginCommand({
				profileId: opts.profileId,
				yes: Boolean(opts.yes)
			}, defaultRuntime);
		});
	});
	const order = auth.command("order").description("Manage per-agent auth profile order overrides");
	order.command("get").description("Show per-agent auth order override (from auth-profiles.json)").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--agent <id>", "Agent id (default: configured default agent)").option("--json", "Output JSON", false).action(async (opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsAuthOrderGetCommand({
				provider: opts.provider,
				agent,
				json: Boolean(opts.json)
			}, defaultRuntime);
		});
	});
	order.command("set").description("Set per-agent auth order override (locks rotation to this list)").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--agent <id>", "Agent id (default: configured default agent)").argument("<profileIds...>", "Auth profile ids (e.g. anthropic:default)").action(async (profileIds, opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsAuthOrderSetCommand({
				provider: opts.provider,
				agent,
				order: profileIds
			}, defaultRuntime);
		});
	});
	order.command("clear").description("Clear per-agent auth order override (fall back to config/round-robin)").requiredOption("--provider <name>", "Provider id (e.g. anthropic)").option("--agent <id>", "Agent id (default: configured default agent)").action(async (opts, command) => {
		const agent = resolveOptionFromCommand(command, "agent") ?? opts.agent;
		await runModelsCommand(async () => {
			await modelsAuthOrderClearCommand({
				provider: opts.provider,
				agent
			}, defaultRuntime);
		});
	});
}

//#endregion
export { registerModelsCli };