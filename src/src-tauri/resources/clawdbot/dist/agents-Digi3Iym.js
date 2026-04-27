import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, r as lowercasePreservingWhitespace } from "./string-coerce-C1IzJjqi.js";
import { _ as shortenHomePath, m as resolveUserPath } from "./utils-BMRcljdi.js";
import { n as defaultRuntime, r as writeRuntimeJson } from "./runtime-Dx7oeLYq.js";
import { t as formatCliCommand } from "./command-format-BFuugklF.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-C3j_3_su.js";
import { c as normalizeAgentId, t as DEFAULT_AGENT_ID } from "./session-key-EpIbK3Oz.js";
import { n as isChannelVisibleInConfiguredLists } from "./channel-meta-BEaGWV3f.js";
import { i as normalizeChannelId, r as listChannelPlugins, t as getChannelPlugin } from "./registry-B2TRwbJD.js";
import "./workspace-DiB6mKpP.js";
import { b as resolveAgentWorkspaceDir, h as listAgentEntries, x as resolveDefaultAgentId, y as resolveAgentDir } from "./agent-scope-_6dFncNS.js";
import { r as replaceConfigFile } from "./mutate-JCkOvgvT.js";
import "./config-yDDhhyz6.js";
import { l as resolveAuthStorePath } from "./source-check-CDjVC_TR.js";
import { n as ensureAuthProfileStore } from "./store-CfHec0eX.js";
import "./plugins-BZ_I3cWH.js";
import { l as resolveSessionTranscriptsDirForAgent } from "./paths-DvU8Tgvw.js";
import "./sessions-DIdqAx7y.js";
import "./auth-profiles-DFHxywz9.js";
import { i as listRouteBindings, t as isRouteBinding } from "./bindings-CPyZiwzQ.js";
import { i as resolveChannelDefaultAccountId } from "./helpers-TGDlD7dJ.js";
import { t as WizardCancelledError } from "./prompts-ocoL7LgP.js";
import { t as createClackPrompter } from "./clack-prompter-D3hD0jBu.js";
import { n as logConfigUpdated } from "./logging-BkeHTbB2.js";
import { i as parseIdentityMarkdown, t as identityHasValues } from "./identity-file-BHDsQals.js";
import { r as ensureWorkspaceAndSessions, s as moveToTrash } from "./onboard-helpers-BO_Xr0ZZ.js";
import { a as describeBinding, n as buildChannelBindings, r as parseBindingSpecs, t as applyAgentBindings } from "./agents.bindings-YAkWWUlT.js";
import { i as requireValidConfigFileSnapshot, n as purgeAgentSessionStoreEntries, r as requireValidConfig, t as createQuietRuntime } from "./agents.command-shared-FKrUGAF4.js";
import { i as loadAgentIdentity, n as buildAgentSummaries, o as pruneAgentConfig, r as findAgentEntryIndex, t as applyAgentConfig } from "./agents.config-g0JNazYz.js";
import { t as promptAuthChoiceGrouped } from "./auth-choice-prompt-Bs2ekYcM.js";
import { n as applyAuthChoice, t as warnIfModelConfigLooksOff } from "./auth-choice-Q8YPWoW7.js";
import { i as setupChannels } from "./onboard-channels-VoIHpNzn.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
//#region src/commands/agents.commands.bind.ts
let agentBindingsModulePromise;
function loadAgentBindingsModule() {
	agentBindingsModulePromise ??= import("./agents.bindings-C7x_RpC-.js");
	return agentBindingsModulePromise;
}
function resolveAgentId(cfg, agentInput, params) {
	if (!cfg) return null;
	if (agentInput?.trim()) return normalizeAgentId(agentInput);
	if (params?.fallbackToDefault) return resolveDefaultAgentId(cfg);
	return null;
}
function hasAgent(cfg, agentId) {
	if (!cfg) return false;
	const targetAgentId = normalizeAgentId(agentId);
	const agents = listAgentEntries(cfg);
	if (agents.length === 0) return targetAgentId === normalizeAgentId(resolveDefaultAgentId(cfg));
	return agents.some((agent) => normalizeAgentId(agent.id) === targetAgentId);
}
function formatBindingOwnerLine(binding) {
	return `${normalizeAgentId(binding.agentId)} <- ${describeBinding(binding)}`;
}
function resolveTargetAgentIdOrExit(params) {
	const agentId = resolveAgentId(params.cfg, params.agentInput?.trim(), { fallbackToDefault: true });
	if (!agentId) {
		params.runtime.error("Unable to resolve agent id.");
		params.runtime.exit(1);
		return null;
	}
	if (!hasAgent(params.cfg, agentId)) {
		params.runtime.error(`Agent "${agentId}" not found.`);
		params.runtime.exit(1);
		return null;
	}
	return agentId;
}
function formatBindingConflicts(conflicts) {
	return conflicts.map((conflict) => `${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`);
}
async function resolveParsedBindingsOrExit(params) {
	const specs = (params.bindValues ?? []).map((value) => value.trim()).filter(Boolean);
	if (specs.length === 0) {
		params.runtime.error(params.emptyMessage);
		params.runtime.exit(1);
		return null;
	}
	const { parseBindingSpecs } = await loadAgentBindingsModule();
	const parsed = parseBindingSpecs({
		agentId: params.agentId,
		specs,
		config: params.cfg
	});
	if (parsed.errors.length > 0) {
		params.runtime.error(parsed.errors.join("\n"));
		params.runtime.exit(1);
		return null;
	}
	return parsed;
}
function emitJsonPayload(params) {
	if (!params.json) return false;
	writeRuntimeJson(params.runtime, params.payload);
	if ((params.conflictCount ?? 0) > 0) params.runtime.exit(1);
	return true;
}
async function resolveConfigAndTargetAgentIdOrExit(params) {
	const configSnapshot = await requireValidConfigFileSnapshot(params.runtime);
	if (!configSnapshot) return null;
	const cfg = configSnapshot.sourceConfig ?? configSnapshot.config;
	const agentId = resolveTargetAgentIdOrExit({
		cfg,
		runtime: params.runtime,
		agentInput: params.agentInput
	});
	if (!agentId) return null;
	return {
		cfg,
		agentId,
		baseHash: configSnapshot.hash
	};
}
async function agentsBindingsCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const filterAgentId = resolveAgentId(cfg, opts.agent?.trim());
	if (opts.agent && !filterAgentId) {
		runtime.error("Agent id is required.");
		runtime.exit(1);
		return;
	}
	if (filterAgentId && !hasAgent(cfg, filterAgentId)) {
		runtime.error(`Agent "${filterAgentId}" not found.`);
		runtime.exit(1);
		return;
	}
	const filtered = listRouteBindings(cfg).filter((binding) => !filterAgentId || normalizeAgentId(binding.agentId) === filterAgentId);
	if (opts.json) {
		writeRuntimeJson(runtime, filtered.map((binding) => ({
			agentId: normalizeAgentId(binding.agentId),
			match: binding.match,
			description: describeBinding(binding)
		})));
		return;
	}
	if (filtered.length === 0) {
		runtime.log(filterAgentId ? `No routing bindings for agent "${filterAgentId}".` : "No routing bindings.");
		return;
	}
	runtime.log(["Routing bindings:", ...filtered.map((binding) => `- ${formatBindingOwnerLine(binding)}`)].join("\n"));
}
async function agentsBindCommand(opts, runtime = defaultRuntime) {
	const resolved = await resolveConfigAndTargetAgentIdOrExit({
		runtime,
		agentInput: opts.agent
	});
	if (!resolved) return;
	const { cfg, agentId, baseHash } = resolved;
	const parsed = await resolveParsedBindingsOrExit({
		runtime,
		cfg,
		agentId,
		bindValues: opts.bind,
		emptyMessage: "Provide at least one --bind <channel[:accountId]>."
	});
	if (!parsed) return;
	const { applyAgentBindings } = await loadAgentBindingsModule();
	const result = applyAgentBindings(cfg, parsed.bindings);
	if (result.added.length > 0 || result.updated.length > 0) {
		await replaceConfigFile({
			nextConfig: result.config,
			...baseHash !== void 0 ? { baseHash } : {}
		});
		if (!opts.json) logConfigUpdated(runtime);
	}
	const payload = {
		agentId,
		added: result.added.map(describeBinding),
		updated: result.updated.map(describeBinding),
		skipped: result.skipped.map(describeBinding),
		conflicts: formatBindingConflicts(result.conflicts)
	};
	if (emitJsonPayload({
		runtime,
		json: opts.json,
		payload,
		conflictCount: result.conflicts.length
	})) return;
	if (result.added.length > 0) {
		runtime.log("Added bindings:");
		for (const binding of result.added) runtime.log(`- ${describeBinding(binding)}`);
	} else if (result.updated.length === 0) runtime.log("No new bindings added.");
	if (result.updated.length > 0) {
		runtime.log("Updated bindings:");
		for (const binding of result.updated) runtime.log(`- ${describeBinding(binding)}`);
	}
	if (result.skipped.length > 0) {
		runtime.log("Already present:");
		for (const binding of result.skipped) runtime.log(`- ${describeBinding(binding)}`);
	}
	if (result.conflicts.length > 0) {
		runtime.error("Skipped bindings already claimed by another agent:");
		for (const conflict of result.conflicts) runtime.error(`- ${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`);
		runtime.exit(1);
	}
}
async function agentsUnbindCommand(opts, runtime = defaultRuntime) {
	const resolved = await resolveConfigAndTargetAgentIdOrExit({
		runtime,
		agentInput: opts.agent
	});
	if (!resolved) return;
	const { cfg, agentId, baseHash } = resolved;
	if (opts.all && (opts.bind?.length ?? 0) > 0) {
		runtime.error("Use either --all or --bind, not both.");
		runtime.exit(1);
		return;
	}
	if (opts.all) {
		const existing = listRouteBindings(cfg);
		const removed = existing.filter((binding) => normalizeAgentId(binding.agentId) === agentId);
		const keptRoutes = existing.filter((binding) => normalizeAgentId(binding.agentId) !== agentId);
		const nonRoutes = (cfg.bindings ?? []).filter((binding) => !isRouteBinding(binding));
		if (removed.length === 0) {
			runtime.log(`No bindings to remove for agent "${agentId}".`);
			return;
		}
		await replaceConfigFile({
			nextConfig: {
				...cfg,
				bindings: [...keptRoutes, ...nonRoutes].length > 0 ? [...keptRoutes, ...nonRoutes] : void 0
			},
			...baseHash !== void 0 ? { baseHash } : {}
		});
		if (!opts.json) logConfigUpdated(runtime);
		const payload = {
			agentId,
			removed: removed.map(describeBinding),
			missing: [],
			conflicts: []
		};
		if (emitJsonPayload({
			runtime,
			json: opts.json,
			payload
		})) return;
		runtime.log(`Removed ${removed.length} binding(s) for "${agentId}".`);
		return;
	}
	const parsed = await resolveParsedBindingsOrExit({
		runtime,
		cfg,
		agentId,
		bindValues: opts.bind,
		emptyMessage: "Provide at least one --bind <channel[:accountId]> or use --all."
	});
	if (!parsed) return;
	const { removeAgentBindings } = await loadAgentBindingsModule();
	const result = removeAgentBindings(cfg, parsed.bindings);
	if (result.removed.length > 0) {
		await replaceConfigFile({
			nextConfig: result.config,
			...baseHash !== void 0 ? { baseHash } : {}
		});
		if (!opts.json) logConfigUpdated(runtime);
	}
	const payload = {
		agentId,
		removed: result.removed.map(describeBinding),
		missing: result.missing.map(describeBinding),
		conflicts: formatBindingConflicts(result.conflicts)
	};
	if (emitJsonPayload({
		runtime,
		json: opts.json,
		payload,
		conflictCount: result.conflicts.length
	})) return;
	if (result.removed.length > 0) {
		runtime.log("Removed bindings:");
		for (const binding of result.removed) runtime.log(`- ${describeBinding(binding)}`);
	} else runtime.log("No bindings removed.");
	if (result.missing.length > 0) {
		runtime.log("Not found:");
		for (const binding of result.missing) runtime.log(`- ${describeBinding(binding)}`);
	}
	if (result.conflicts.length > 0) {
		runtime.error("Bindings are owned by another agent:");
		for (const conflict of result.conflicts) runtime.error(`- ${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`);
		runtime.exit(1);
	}
}
//#endregion
//#region src/commands/agents.commands.add.ts
async function fileExists(pathname) {
	try {
		await fs$1.stat(pathname);
		return true;
	} catch {
		return false;
	}
}
async function agentsAddCommand(opts, runtime = defaultRuntime, params) {
	const configSnapshot = await requireValidConfigFileSnapshot(runtime);
	if (!configSnapshot) return;
	const cfg = configSnapshot.sourceConfig ?? configSnapshot.config;
	const baseHash = configSnapshot.hash;
	const workspaceFlag = opts.workspace?.trim();
	const nameInput = opts.name?.trim();
	const hasFlags = params?.hasFlags === true;
	const nonInteractive = opts.nonInteractive === true || hasFlags;
	if (nonInteractive && !workspaceFlag) {
		runtime.error("Non-interactive mode requires --workspace. Re-run without flags to use the wizard.");
		runtime.exit(1);
		return;
	}
	if (nonInteractive) {
		if (!nameInput) {
			runtime.error("Agent name is required in non-interactive mode.");
			runtime.exit(1);
			return;
		}
		if (!workspaceFlag) {
			runtime.error("Non-interactive mode requires --workspace. Re-run without flags to use the wizard.");
			runtime.exit(1);
			return;
		}
		const agentId = normalizeAgentId(nameInput);
		if (agentId === "main") {
			runtime.error(`"${DEFAULT_AGENT_ID}" is reserved. Choose another name.`);
			runtime.exit(1);
			return;
		}
		if (agentId !== nameInput) runtime.log(`Normalized agent id to "${agentId}".`);
		if (findAgentEntryIndex(listAgentEntries(cfg), agentId) >= 0) {
			runtime.error(`Agent "${agentId}" already exists.`);
			runtime.exit(1);
			return;
		}
		const workspaceDir = resolveUserPath(workspaceFlag);
		const agentDir = opts.agentDir?.trim() ? resolveUserPath(opts.agentDir.trim()) : resolveAgentDir(cfg, agentId);
		const model = opts.model?.trim();
		const nextConfig = applyAgentConfig(cfg, {
			agentId,
			name: nameInput,
			workspace: workspaceDir,
			agentDir,
			...model ? { model } : {}
		});
		const bindingParse = parseBindingSpecs({
			agentId,
			specs: opts.bind,
			config: nextConfig
		});
		if (bindingParse.errors.length > 0) {
			runtime.error(bindingParse.errors.join("\n"));
			runtime.exit(1);
			return;
		}
		const bindingResult = bindingParse.bindings.length > 0 ? applyAgentBindings(nextConfig, bindingParse.bindings) : {
			config: nextConfig,
			added: [],
			updated: [],
			skipped: [],
			conflicts: []
		};
		await replaceConfigFile({
			nextConfig: bindingResult.config,
			...baseHash !== void 0 ? { baseHash } : {}
		});
		if (!opts.json) logConfigUpdated(runtime);
		await ensureWorkspaceAndSessions(workspaceDir, opts.json ? createQuietRuntime(runtime) : runtime, {
			skipBootstrap: Boolean(bindingResult.config.agents?.defaults?.skipBootstrap),
			agentId
		});
		const payload = {
			agentId,
			name: nameInput,
			workspace: workspaceDir,
			agentDir,
			model,
			bindings: {
				added: bindingResult.added.map(describeBinding),
				updated: bindingResult.updated.map(describeBinding),
				skipped: bindingResult.skipped.map(describeBinding),
				conflicts: bindingResult.conflicts.map((conflict) => `${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`)
			}
		};
		if (opts.json) writeRuntimeJson(runtime, payload);
		else {
			runtime.log(`Agent: ${agentId}`);
			runtime.log(`Workspace: ${shortenHomePath(workspaceDir)}`);
			runtime.log(`Agent dir: ${shortenHomePath(agentDir)}`);
			if (model) runtime.log(`Model: ${model}`);
			if (bindingResult.conflicts.length > 0) runtime.error(["Skipped bindings already claimed by another agent:", ...bindingResult.conflicts.map((conflict) => `- ${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`)].join("\n"));
		}
		return;
	}
	const prompter = createClackPrompter();
	try {
		await prompter.intro("Add OpenClaw agent");
		const agentName = normalizeOptionalString(nameInput ?? await prompter.text({
			message: "Agent name",
			validate: (value) => {
				if (!value?.trim()) return "Required";
				if (normalizeAgentId(value) === "main") return `"main" is reserved. Choose another name.`;
			}
		})) ?? "";
		const agentId = normalizeAgentId(agentName);
		if (agentName !== agentId) await prompter.note(`Normalized id to "${agentId}".`, "Agent id");
		if (listAgentEntries(cfg).find((agent) => normalizeAgentId(agent.id) === agentId)) {
			if (!await prompter.confirm({
				message: `Agent "${agentId}" already exists. Update it?`,
				initialValue: false
			})) {
				await prompter.outro("No changes made.");
				return;
			}
		}
		const workspaceDefault = resolveAgentWorkspaceDir(cfg, agentId);
		const workspaceDir = resolveUserPath(normalizeOptionalString(await prompter.text({
			message: "Workspace directory",
			initialValue: workspaceDefault,
			validate: (value) => value?.trim() ? void 0 : "Required"
		})) || workspaceDefault);
		const agentDir = resolveAgentDir(cfg, agentId);
		let nextConfig = applyAgentConfig(cfg, {
			agentId,
			name: agentName,
			workspace: workspaceDir,
			agentDir
		});
		const defaultAgentId = resolveDefaultAgentId(cfg);
		if (defaultAgentId !== agentId) {
			const sourceAuthPath = resolveAuthStorePath(resolveAgentDir(cfg, defaultAgentId));
			const destAuthPath = resolveAuthStorePath(agentDir);
			if (!(normalizeLowercaseStringOrEmpty(path.resolve(sourceAuthPath)) === normalizeLowercaseStringOrEmpty(path.resolve(destAuthPath))) && await fileExists(sourceAuthPath) && !await fileExists(destAuthPath)) {
				if (await prompter.confirm({
					message: `Copy auth profiles from "${defaultAgentId}"?`,
					initialValue: false
				})) {
					await fs$1.mkdir(path.dirname(destAuthPath), { recursive: true });
					await fs$1.copyFile(sourceAuthPath, destAuthPath);
					await prompter.note(`Copied auth profiles from "${defaultAgentId}".`, "Auth profiles");
				}
			}
		}
		if (await prompter.confirm({
			message: "Configure model/auth for this agent now?",
			initialValue: false
		})) {
			const authStore = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
			while (true) {
				const authResult = await applyAuthChoice({
					authChoice: await promptAuthChoiceGrouped({
						prompter,
						store: authStore,
						includeSkip: true,
						config: nextConfig
					}),
					config: nextConfig,
					prompter,
					runtime,
					agentDir,
					setDefaultModel: false,
					agentId
				});
				nextConfig = authResult.config;
				if (authResult.retrySelection) continue;
				if (authResult.agentModelOverride) nextConfig = applyAgentConfig(nextConfig, {
					agentId,
					model: authResult.agentModelOverride
				});
				break;
			}
		}
		await warnIfModelConfigLooksOff(nextConfig, prompter, {
			agentId,
			agentDir
		});
		let selection = [];
		const channelAccountIds = {};
		nextConfig = await setupChannels(nextConfig, runtime, prompter, {
			allowSignalInstall: true,
			onSelection: (value) => {
				selection = value;
			},
			promptAccountIds: true,
			onAccountId: (channel, accountId) => {
				channelAccountIds[channel] = accountId;
			}
		});
		if (selection.length > 0) if (await prompter.confirm({
			message: "Route selected channels to this agent now? (bindings)",
			initialValue: false
		})) {
			const desiredBindings = buildChannelBindings({
				agentId,
				selection,
				config: nextConfig,
				accountIds: channelAccountIds
			});
			const result = applyAgentBindings(nextConfig, desiredBindings);
			nextConfig = result.config;
			if (result.conflicts.length > 0) await prompter.note(["Skipped bindings already claimed by another agent:", ...result.conflicts.map((conflict) => `- ${describeBinding(conflict.binding)} (agent=${conflict.existingAgentId})`)].join("\n"), "Routing bindings");
		} else await prompter.note(["Routing unchanged. Add bindings when you're ready.", "Docs: https://docs.openclaw.ai/concepts/multi-agent"].join("\n"), "Routing");
		await replaceConfigFile({
			nextConfig,
			...baseHash !== void 0 ? { baseHash } : {}
		});
		logConfigUpdated(runtime);
		await ensureWorkspaceAndSessions(workspaceDir, runtime, {
			skipBootstrap: Boolean(nextConfig.agents?.defaults?.skipBootstrap),
			agentId
		});
		const payload = {
			agentId,
			name: agentName,
			workspace: workspaceDir,
			agentDir
		};
		if (opts.json) writeRuntimeJson(runtime, payload);
		await prompter.outro(`Agent "${agentId}" ready.`);
	} catch (err) {
		if (err instanceof WizardCancelledError) {
			runtime.exit(1);
			return;
		}
		throw err;
	}
}
//#endregion
//#region src/commands/agents.commands.delete.ts
function normalizeWorkspacePathForComparison(input) {
	const resolved = path.resolve(input.replaceAll("\0", ""));
	let normalized = resolved;
	try {
		normalized = fs.realpathSync.native(resolved);
	} catch {}
	if (process.platform === "win32") return lowercasePreservingWhitespace(normalized);
	return normalized;
}
function isPathWithinRoot(candidatePath, rootPath) {
	const relative = path.relative(rootPath, candidatePath);
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
function workspacePathsOverlap(left, right) {
	const normalizedLeft = normalizeWorkspacePathForComparison(left);
	const normalizedRight = normalizeWorkspacePathForComparison(right);
	return isPathWithinRoot(normalizedLeft, normalizedRight) || isPathWithinRoot(normalizedRight, normalizedLeft);
}
function findOverlappingWorkspaceAgentIds(cfg, agentId, workspaceDir) {
	const entries = listAgentEntries(cfg);
	const normalizedAgentId = normalizeAgentId(agentId);
	const overlappingAgentIds = [];
	for (const entry of entries) {
		const otherAgentId = normalizeAgentId(entry.id);
		if (otherAgentId === normalizedAgentId) continue;
		if (workspacePathsOverlap(workspaceDir, resolveAgentWorkspaceDir(cfg, otherAgentId))) overlappingAgentIds.push(otherAgentId);
	}
	return overlappingAgentIds;
}
async function agentsDeleteCommand(opts, runtime = defaultRuntime) {
	const configSnapshot = await requireValidConfigFileSnapshot(runtime);
	if (!configSnapshot) return;
	const cfg = configSnapshot.sourceConfig ?? configSnapshot.config;
	const baseHash = configSnapshot.hash;
	const input = opts.id?.trim();
	if (!input) {
		runtime.error("Agent id is required.");
		runtime.exit(1);
		return;
	}
	const agentId = normalizeAgentId(input);
	if (agentId !== input) runtime.log(`Normalized agent id to "${agentId}".`);
	if (agentId === "main") {
		runtime.error(`"${DEFAULT_AGENT_ID}" cannot be deleted.`);
		runtime.exit(1);
		return;
	}
	if (findAgentEntryIndex(listAgentEntries(cfg), agentId) < 0) {
		runtime.error(`Agent "${agentId}" not found.`);
		runtime.exit(1);
		return;
	}
	if (!opts.force) {
		if (!process.stdin.isTTY) {
			runtime.error("Non-interactive session. Re-run with --force.");
			runtime.exit(1);
			return;
		}
		if (!await createClackPrompter().confirm({
			message: `Delete agent "${agentId}" and prune workspace/state?`,
			initialValue: false
		})) {
			runtime.log("Cancelled.");
			return;
		}
	}
	const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
	const agentDir = resolveAgentDir(cfg, agentId);
	const sessionsDir = resolveSessionTranscriptsDirForAgent(agentId);
	const result = pruneAgentConfig(cfg, agentId);
	await replaceConfigFile({
		nextConfig: result.config,
		...baseHash !== void 0 ? { baseHash } : {},
		writeOptions: opts.json ? { skipOutputLogs: true } : void 0
	});
	if (!opts.json) logConfigUpdated(runtime);
	await purgeAgentSessionStoreEntries(cfg, agentId);
	const quietRuntime = opts.json ? createQuietRuntime(runtime) : runtime;
	const workspaceSharedWith = findOverlappingWorkspaceAgentIds(cfg, agentId, workspaceDir);
	const workspaceRetained = workspaceSharedWith.length > 0;
	if (workspaceRetained) quietRuntime.log(`Skipped workspace removal (shared with other agents: ${workspaceSharedWith.join(", ")}): ${workspaceDir}`);
	else await moveToTrash(workspaceDir, quietRuntime);
	await moveToTrash(agentDir, quietRuntime);
	await moveToTrash(sessionsDir, quietRuntime);
	if (opts.json) writeRuntimeJson(runtime, {
		agentId,
		workspace: workspaceDir,
		workspaceRetained: workspaceRetained || void 0,
		workspaceRetainedReason: workspaceRetained ? "shared" : void 0,
		workspaceSharedWith: workspaceRetained ? workspaceSharedWith : void 0,
		agentDir,
		sessionsDir,
		removedBindings: result.removedBindings,
		removedAllow: result.removedAllow
	});
	else runtime.log(`Deleted agent: ${agentId}`);
}
//#endregion
//#region src/commands/agents.commands.identity.ts
const normalizeWorkspacePath = (input) => path.resolve(resolveUserPath(input));
async function loadIdentityFromFile(filePath) {
	try {
		const parsed = parseIdentityMarkdown(await fs$1.readFile(filePath, "utf-8"));
		if (!identityHasValues(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function resolveAgentIdByWorkspace(cfg, workspaceDir) {
	const list = listAgentEntries(cfg);
	const ids = list.length > 0 ? list.map((entry) => normalizeAgentId(entry.id)) : [resolveDefaultAgentId(cfg)];
	const normalizedTarget = normalizeWorkspacePath(workspaceDir);
	return ids.filter((id) => normalizeWorkspacePath(resolveAgentWorkspaceDir(cfg, id)) === normalizedTarget);
}
async function agentsSetIdentityCommand(opts, runtime = defaultRuntime) {
	const configSnapshot = await requireValidConfigFileSnapshot(runtime);
	if (!configSnapshot) return;
	const cfg = configSnapshot.sourceConfig ?? configSnapshot.config;
	const baseHash = configSnapshot.hash;
	const agentRaw = normalizeOptionalString(opts.agent);
	const nameRaw = normalizeOptionalString(opts.name);
	const emojiRaw = normalizeOptionalString(opts.emoji);
	const themeRaw = normalizeOptionalString(opts.theme);
	const avatarRaw = normalizeOptionalString(opts.avatar);
	const hasExplicitIdentity = Boolean(nameRaw || emojiRaw || themeRaw || avatarRaw);
	const identityFileRaw = normalizeOptionalString(opts.identityFile);
	const workspaceRaw = normalizeOptionalString(opts.workspace);
	const wantsIdentityFile = Boolean(opts.fromIdentity || identityFileRaw || !hasExplicitIdentity);
	let identityFilePath;
	let workspaceDir;
	if (identityFileRaw) {
		identityFilePath = normalizeWorkspacePath(identityFileRaw);
		workspaceDir = path.dirname(identityFilePath);
	} else if (workspaceRaw) workspaceDir = normalizeWorkspacePath(workspaceRaw);
	else if (wantsIdentityFile || !agentRaw) workspaceDir = path.resolve(process.cwd());
	let agentId = agentRaw ? normalizeAgentId(agentRaw) : void 0;
	if (!agentId) {
		if (!workspaceDir) {
			runtime.error("Select an agent with --agent or provide a workspace via --workspace.");
			runtime.exit(1);
			return;
		}
		const matches = resolveAgentIdByWorkspace(cfg, workspaceDir);
		if (matches.length === 0) {
			runtime.error(`No agent workspace matches ${shortenHomePath(workspaceDir)}. Pass --agent to target a specific agent.`);
			runtime.exit(1);
			return;
		}
		if (matches.length > 1) {
			runtime.error(`Multiple agents match ${shortenHomePath(workspaceDir)}: ${matches.join(", ")}. Pass --agent to choose one.`);
			runtime.exit(1);
			return;
		}
		agentId = matches[0];
	}
	let identityFromFile = null;
	if (wantsIdentityFile) {
		if (identityFilePath) identityFromFile = await loadIdentityFromFile(identityFilePath);
		else if (workspaceDir) identityFromFile = loadAgentIdentity(workspaceDir);
		if (!identityFromFile) {
			const targetPath = identityFilePath ?? (workspaceDir ? path.join(workspaceDir, "IDENTITY.md") : "IDENTITY.md");
			runtime.error(`No identity data found in ${shortenHomePath(targetPath)}.`);
			runtime.exit(1);
			return;
		}
	}
	const fileTheme = identityFromFile?.theme ?? identityFromFile?.creature ?? identityFromFile?.vibe ?? void 0;
	const incomingIdentity = {
		...nameRaw || identityFromFile?.name ? { name: nameRaw ?? identityFromFile?.name } : {},
		...emojiRaw || identityFromFile?.emoji ? { emoji: emojiRaw ?? identityFromFile?.emoji } : {},
		...themeRaw || fileTheme ? { theme: themeRaw ?? fileTheme } : {},
		...avatarRaw || identityFromFile?.avatar ? { avatar: avatarRaw ?? identityFromFile?.avatar } : {}
	};
	if (!incomingIdentity.name && !incomingIdentity.emoji && !incomingIdentity.theme && !incomingIdentity.avatar) {
		runtime.error("No identity fields provided. Use --name/--emoji/--theme/--avatar or --from-identity.");
		runtime.exit(1);
		return;
	}
	const list = listAgentEntries(cfg);
	const index = findAgentEntryIndex(list, agentId);
	const base = index >= 0 ? list[index] : { id: agentId };
	const nextIdentity = {
		...base.identity,
		...incomingIdentity
	};
	const nextEntry = {
		...base,
		identity: nextIdentity
	};
	const nextList = [...list];
	if (index >= 0) nextList[index] = nextEntry;
	else {
		const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
		if (nextList.length === 0 && agentId !== defaultId) nextList.push({ id: defaultId });
		nextList.push(nextEntry);
	}
	await replaceConfigFile({
		nextConfig: {
			...cfg,
			agents: {
				...cfg.agents,
				list: nextList
			}
		},
		...baseHash !== void 0 ? { baseHash } : {}
	});
	if (opts.json) {
		writeRuntimeJson(runtime, {
			agentId,
			identity: nextIdentity,
			workspace: workspaceDir ?? null,
			identityFile: identityFilePath ?? null
		});
		return;
	}
	logConfigUpdated(runtime);
	runtime.log(`Agent: ${agentId}`);
	if (nextIdentity.name) runtime.log(`Name: ${nextIdentity.name}`);
	if (nextIdentity.theme) runtime.log(`Theme: ${nextIdentity.theme}`);
	if (nextIdentity.emoji) runtime.log(`Emoji: ${nextIdentity.emoji}`);
	if (nextIdentity.avatar) runtime.log(`Avatar: ${nextIdentity.avatar}`);
	if (workspaceDir) runtime.log(`Workspace: ${shortenHomePath(workspaceDir)}`);
}
//#endregion
//#region src/commands/agents.providers.ts
function providerAccountKey(provider, accountId) {
	return `${provider}:${accountId ?? "default"}`;
}
function isUnresolvedSecretRefResolutionError(error) {
	return error instanceof Error && typeof error.message === "string" && /unresolved SecretRef/i.test(error.message);
}
function formatChannelAccountLabel(params) {
	return `${getChannelPlugin(params.provider)?.meta.label ?? params.provider} ${params.name?.trim() ? `${params.accountId} (${params.name.trim()})` : params.accountId}`;
}
function formatProviderState(entry) {
	const parts = [entry.state];
	if (entry.enabled === false && entry.state !== "disabled") parts.push("disabled");
	return parts.join(", ");
}
async function resolveReadOnlyAccount(params) {
	if (params.plugin.config.inspectAccount) return await Promise.resolve(params.plugin.config.inspectAccount(params.cfg, params.accountId));
	return params.plugin.config.resolveAccount(params.cfg, params.accountId);
}
async function buildProviderStatusIndex(cfg) {
	const map = /* @__PURE__ */ new Map();
	for (const plugin of listChannelPlugins()) {
		const accountIds = plugin.config.listAccountIds(cfg);
		for (const accountId of accountIds) {
			let account;
			try {
				account = await resolveReadOnlyAccount({
					plugin,
					cfg,
					accountId
				});
			} catch (error) {
				if (!isUnresolvedSecretRefResolutionError(error)) throw error;
				map.set(providerAccountKey(plugin.id, accountId), {
					provider: plugin.id,
					accountId,
					state: "not configured",
					configured: false
				});
				continue;
			}
			if (!account) continue;
			const snapshot = plugin.config.describeAccount?.(account, cfg);
			const enabled = plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : typeof snapshot?.enabled === "boolean" ? snapshot.enabled : account.enabled;
			const configured = plugin.config.isConfigured ? await plugin.config.isConfigured(account, cfg) : snapshot?.configured;
			const resolvedEnabled = typeof enabled === "boolean" ? enabled : true;
			const resolvedConfigured = typeof configured === "boolean" ? configured : true;
			const state = plugin.status?.resolveAccountState?.({
				account,
				cfg,
				configured: resolvedConfigured,
				enabled: resolvedEnabled
			}) ?? (typeof snapshot?.linked === "boolean" ? snapshot.linked ? "linked" : "not linked" : resolvedConfigured ? "configured" : "not configured");
			const name = snapshot?.name ?? account.name;
			map.set(providerAccountKey(plugin.id, accountId), {
				provider: plugin.id,
				accountId,
				name,
				state,
				enabled,
				configured
			});
		}
	}
	return map;
}
function resolveDefaultAccountId(cfg, provider) {
	const plugin = getChannelPlugin(provider);
	if (!plugin) return DEFAULT_ACCOUNT_ID;
	return resolveChannelDefaultAccountId({
		plugin,
		cfg
	});
}
function shouldShowProviderEntry(entry, cfg) {
	const plugin = getChannelPlugin(entry.provider);
	if (!plugin) return Boolean(entry.configured);
	if (!isChannelVisibleInConfiguredLists(plugin.meta)) {
		const providerConfig = cfg[plugin.id];
		return Boolean(entry.configured) || Boolean(providerConfig);
	}
	return Boolean(entry.configured);
}
function formatProviderEntry(entry) {
	return `${formatChannelAccountLabel({
		provider: entry.provider,
		accountId: entry.accountId,
		name: entry.name
	})}: ${formatProviderState(entry)}`;
}
function summarizeBindings(cfg, bindings) {
	if (bindings.length === 0) return [];
	const seen = /* @__PURE__ */ new Map();
	for (const binding of bindings) {
		const channel = normalizeChannelId(binding.match.channel);
		if (!channel) continue;
		const accountId = binding.match.accountId ?? resolveDefaultAccountId(cfg, channel);
		const key = providerAccountKey(channel, accountId);
		if (!seen.has(key)) {
			const label = formatChannelAccountLabel({
				provider: channel,
				accountId
			});
			seen.set(key, label);
		}
	}
	return [...seen.values()];
}
function listProvidersForAgent(params) {
	const allProviderEntries = [...params.providerStatus.values()];
	const providerLines = [];
	if (params.bindings.length > 0) {
		const seen = /* @__PURE__ */ new Set();
		for (const binding of params.bindings) {
			const channel = normalizeChannelId(binding.match.channel);
			if (!channel) continue;
			const accountId = binding.match.accountId ?? resolveDefaultAccountId(params.cfg, channel);
			const key = providerAccountKey(channel, accountId);
			if (seen.has(key)) continue;
			seen.add(key);
			const status = params.providerStatus.get(key);
			if (status) providerLines.push(formatProviderEntry(status));
			else providerLines.push(`${formatChannelAccountLabel({
				provider: channel,
				accountId
			})}: unknown`);
		}
		return providerLines;
	}
	if (params.summaryIsDefault) {
		for (const entry of allProviderEntries) if (shouldShowProviderEntry(entry, params.cfg)) providerLines.push(formatProviderEntry(entry));
	}
	return providerLines;
}
//#endregion
//#region src/commands/agents.commands.list.ts
function formatSummary(summary) {
	const defaultTag = summary.isDefault ? " (default)" : "";
	const header = summary.name && summary.name !== summary.id ? `${summary.id}${defaultTag} (${summary.name})` : `${summary.id}${defaultTag}`;
	const identityParts = [];
	if (summary.identityEmoji) identityParts.push(summary.identityEmoji);
	if (summary.identityName) identityParts.push(summary.identityName);
	const identityLine = identityParts.length > 0 ? identityParts.join(" ") : null;
	const identitySource = summary.identitySource === "identity" ? "IDENTITY.md" : summary.identitySource === "config" ? "config" : null;
	const lines = [`- ${header}`];
	if (identityLine) lines.push(`  Identity: ${identityLine}${identitySource ? ` (${identitySource})` : ""}`);
	lines.push(`  Workspace: ${shortenHomePath(summary.workspace)}`);
	lines.push(`  Agent dir: ${shortenHomePath(summary.agentDir)}`);
	if (summary.model) lines.push(`  Model: ${summary.model}`);
	lines.push(`  Routing rules: ${summary.bindings}`);
	if (summary.routes?.length) lines.push(`  Routing: ${summary.routes.join(", ")}`);
	if (summary.providers?.length) {
		lines.push("  Providers:");
		for (const provider of summary.providers) lines.push(`    - ${provider}`);
	}
	if (summary.bindingDetails?.length) {
		lines.push("  Routing rules:");
		for (const binding of summary.bindingDetails) lines.push(`    - ${binding}`);
	}
	return lines.join("\n");
}
async function agentsListCommand(opts, runtime = defaultRuntime) {
	const cfg = await requireValidConfig(runtime);
	if (!cfg) return;
	const summaries = buildAgentSummaries(cfg);
	const bindingMap = /* @__PURE__ */ new Map();
	for (const binding of listRouteBindings(cfg)) {
		const agentId = normalizeAgentId(binding.agentId);
		const list = bindingMap.get(agentId) ?? [];
		list.push(binding);
		bindingMap.set(agentId, list);
	}
	if (opts.bindings) for (const summary of summaries) {
		const bindings = bindingMap.get(summary.id) ?? [];
		if (bindings.length > 0) summary.bindingDetails = bindings.map((binding) => describeBinding(binding));
	}
	const providerStatus = await buildProviderStatusIndex(cfg);
	for (const summary of summaries) {
		const bindings = bindingMap.get(summary.id) ?? [];
		const routes = summarizeBindings(cfg, bindings);
		if (routes.length > 0) summary.routes = routes;
		else if (summary.isDefault) summary.routes = ["default (no explicit rules)"];
		const providerLines = listProvidersForAgent({
			summaryIsDefault: summary.isDefault,
			cfg,
			bindings,
			providerStatus
		});
		if (providerLines.length > 0) summary.providers = providerLines;
	}
	if (opts.json) {
		writeRuntimeJson(runtime, summaries);
		return;
	}
	const lines = ["Agents:", ...summaries.map(formatSummary)];
	lines.push("Routing rules map channel/account/peer to an agent. Use --bindings for full rules.");
	lines.push(`Channel status reflects local config/creds. For live health: ${formatCliCommand("openclaw channels status --probe")}.`);
	runtime.log(lines.join("\n"));
}
//#endregion
export { agentsBindCommand as a, agentsAddCommand as i, agentsSetIdentityCommand as n, agentsBindingsCommand as o, agentsDeleteCommand as r, agentsUnbindCommand as s, agentsListCommand as t };
