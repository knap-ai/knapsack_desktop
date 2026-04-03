import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { n as listChatChannels } from "./chat-meta-Cdrnv7R-.js";
import { n as formatChannelSelectionLine, t as formatChannelPrimerLine } from "./registry-DTO_OK4F.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { t as isChannelConfigured } from "./channel-configured-xOWKXdGR.js";
import { i as resolveChannelDefaultAccountId } from "./helpers-BsTwPM1c.js";
import { t as enablePluginInConfig } from "./enable-CpDMTfhy.js";
import { n as getChannelSetupPlugin, r as listChannelSetupPlugins, t as resolveChannelSetupWizardAdapterForPlugin } from "./registry-DfIHWCSq.js";
import { r as listChannelPluginCatalogEntries } from "./catalog-CAEFn2QM.js";
import { n as loadChannelSetupPluginRegistrySnapshotForChannel, t as ensureChannelSetupPluginInstalled } from "./plugin-install-CsVSPbgh.js";
//#region src/commands/channel-setup/discovery.ts
function resolveWorkspaceDir(cfg, workspaceDir) {
	return workspaceDir ?? resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
}
function listManifestInstalledChannelIds(params) {
	const resolvedConfig = applyPluginAutoEnable({
		config: params.cfg,
		env: params.env ?? process.env
	}).config;
	const workspaceDir = resolveWorkspaceDir(resolvedConfig, params.workspaceDir);
	return new Set(loadPluginManifestRegistry({
		config: resolvedConfig,
		workspaceDir,
		env: params.env ?? process.env
	}).plugins.flatMap((plugin) => plugin.channels));
}
function isCatalogChannelInstalled(params) {
	return listManifestInstalledChannelIds(params).has(params.entry.id);
}
function resolveChannelSetupEntries(params) {
	const workspaceDir = resolveWorkspaceDir(params.cfg, params.workspaceDir);
	const manifestInstalledIds = listManifestInstalledChannelIds({
		cfg: params.cfg,
		workspaceDir,
		env: params.env
	});
	const installedPluginIds = new Set(params.installedPlugins.map((plugin) => plugin.id));
	const catalogEntries = listChannelPluginCatalogEntries({ workspaceDir });
	const installedCatalogEntries = catalogEntries.filter((entry) => !installedPluginIds.has(entry.id) && manifestInstalledIds.has(entry.id));
	const installableCatalogEntries = catalogEntries.filter((entry) => !installedPluginIds.has(entry.id) && !manifestInstalledIds.has(entry.id));
	const metaById = /* @__PURE__ */ new Map();
	for (const meta of listChatChannels()) metaById.set(meta.id, meta);
	for (const plugin of params.installedPlugins) metaById.set(plugin.id, plugin.meta);
	for (const entry of installedCatalogEntries) if (!metaById.has(entry.id)) metaById.set(entry.id, entry.meta);
	for (const entry of installableCatalogEntries) if (!metaById.has(entry.id)) metaById.set(entry.id, entry.meta);
	return {
		entries: Array.from(metaById, ([id, meta]) => ({
			id,
			meta
		})),
		installedCatalogEntries,
		installableCatalogEntries,
		installedCatalogById: new Map(installedCatalogEntries.map((entry) => [entry.id, entry])),
		installableCatalogById: new Map(installableCatalogEntries.map((entry) => [entry.id, entry]))
	};
}
//#endregion
//#region src/flows/channel-setup.prompts.ts
function formatAccountLabel(accountId) {
	return accountId === "default" ? "default (primary)" : accountId;
}
async function promptConfiguredAction(params) {
	const { prompter, label, supportsDisable, supportsDelete } = params;
	const options = [
		{
			value: "update",
			label: "Modify settings"
		},
		...supportsDisable ? [{
			value: "disable",
			label: "Disable (keeps config)"
		}] : [],
		...supportsDelete ? [{
			value: "delete",
			label: "Delete config"
		}] : [],
		{
			value: "skip",
			label: "Skip (leave as-is)"
		}
	];
	return await prompter.select({
		message: `${label} already configured. What do you want to do?`,
		options,
		initialValue: "update"
	});
}
async function promptRemovalAccountId(params) {
	const { cfg, prompter, label, channel } = params;
	const plugin = params.plugin ?? getChannelSetupPlugin(channel);
	if (!plugin) return DEFAULT_ACCOUNT_ID;
	const accountIds = plugin.config.listAccountIds(cfg).filter(Boolean);
	const defaultAccountId = resolveChannelDefaultAccountId({
		plugin,
		cfg,
		accountIds
	});
	if (accountIds.length <= 1) return defaultAccountId;
	return normalizeAccountId(await prompter.select({
		message: `${label} account`,
		options: accountIds.map((accountId) => ({
			value: accountId,
			label: formatAccountLabel(accountId)
		})),
		initialValue: defaultAccountId
	})) ?? defaultAccountId;
}
async function maybeConfigureDmPolicies(params) {
	const { selection, prompter, accountIdsByChannel } = params;
	const resolve = params.resolveAdapter ?? (() => void 0);
	const dmPolicies = selection.map((channel) => resolve(channel)?.dmPolicy).filter(Boolean);
	if (dmPolicies.length === 0) return params.cfg;
	if (!await prompter.confirm({
		message: "Configure DM access policies now? (default: pairing)",
		initialValue: false
	})) return params.cfg;
	let cfg = params.cfg;
	for (const policy of dmPolicies) {
		const accountId = accountIdsByChannel?.get(policy.channel);
		const { policyKey, allowFromKey } = policy.resolveConfigKeys?.(cfg, accountId) ?? {
			policyKey: policy.policyKey,
			allowFromKey: policy.allowFromKey
		};
		await prompter.note([
			"Default: pairing (unknown DMs get a pairing code).",
			`Approve: ${formatCliCommand(`openclaw pairing approve ${policy.channel} <code>`)}`,
			`Allowlist DMs: ${policyKey}="allowlist" + ${allowFromKey} entries.`,
			`Public DMs: ${policyKey}="open" + ${allowFromKey} includes "*".`,
			"Multi-user DMs: run: " + formatCliCommand("openclaw config set session.dmScope \"per-channel-peer\"") + " (or \"per-account-channel-peer\" for multi-account channels) to isolate sessions.",
			`Docs: ${formatDocsLink("/channels/pairing", "channels/pairing")}`
		].join("\n"), `${policy.label} DM access`);
		const nextPolicy = await prompter.select({
			message: `${policy.label} DM policy`,
			options: [
				{
					value: "pairing",
					label: "Pairing (recommended)"
				},
				{
					value: "allowlist",
					label: "Allowlist (specific users only)"
				},
				{
					value: "open",
					label: "Open (public inbound DMs)"
				},
				{
					value: "disabled",
					label: "Disabled (ignore DMs)"
				}
			]
		});
		if (nextPolicy !== policy.getCurrent(cfg, accountId)) cfg = policy.setPolicy(cfg, nextPolicy, accountId);
		if (nextPolicy === "allowlist" && policy.promptAllowFrom) cfg = await policy.promptAllowFrom({
			cfg,
			prompter,
			accountId
		});
	}
	return cfg;
}
//#endregion
//#region src/flows/channel-setup.status.ts
function buildChannelSetupSelectionContribution(params) {
	return {
		id: `channel:setup:${params.channel}`,
		kind: "channel",
		surface: "setup",
		channel: params.channel,
		option: {
			value: params.channel,
			label: params.label,
			...params.hint ? { hint: params.hint } : {}
		},
		source: params.source
	};
}
async function collectChannelStatus(params) {
	const installedPlugins = params.installedPlugins ?? listChannelSetupPlugins();
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, resolveDefaultAgentId(params.cfg));
	const { installedCatalogEntries, installableCatalogEntries } = resolveChannelSetupEntries({
		cfg: params.cfg,
		installedPlugins,
		workspaceDir
	});
	const resolveAdapter = params.resolveAdapter ?? ((channel) => resolveChannelSetupWizardAdapterForPlugin(installedPlugins.find((plugin) => plugin.id === channel)));
	const statusEntries = await Promise.all(installedPlugins.flatMap((plugin) => {
		const adapter = resolveAdapter(plugin.id);
		if (!adapter) return [];
		return adapter.getStatus({
			cfg: params.cfg,
			options: params.options,
			accountOverrides: params.accountOverrides
		});
	}));
	const statusByChannel = new Map(statusEntries.map((entry) => [entry.channel, entry]));
	const fallbackStatuses = listChatChannels().filter((meta) => !statusByChannel.has(meta.id)).map((meta) => {
		const configured = isChannelConfigured(params.cfg, meta.id);
		const statusLabel = configured ? "configured (plugin disabled)" : "not configured";
		return {
			channel: meta.id,
			configured,
			statusLines: [`${meta.label}: ${statusLabel}`],
			selectionHint: configured ? "configured · plugin disabled" : "not configured",
			quickstartScore: 0
		};
	});
	const discoveredPluginStatuses = installedCatalogEntries.filter((entry) => !statusByChannel.has(entry.id)).map((entry) => {
		const configured = isChannelConfigured(params.cfg, entry.id);
		const pluginEnabled = params.cfg.plugins?.entries?.[entry.pluginId ?? entry.id]?.enabled !== false;
		const statusLabel = configured ? pluginEnabled ? "configured" : "configured (plugin disabled)" : pluginEnabled ? "installed" : "installed (plugin disabled)";
		return {
			channel: entry.id,
			configured,
			statusLines: [`${entry.meta.label}: ${statusLabel}`],
			selectionHint: statusLabel,
			quickstartScore: 0
		};
	});
	const catalogStatuses = installableCatalogEntries.map((entry) => ({
		channel: entry.id,
		configured: false,
		statusLines: [`${entry.meta.label}: install plugin to enable`],
		selectionHint: "plugin · install",
		quickstartScore: 0
	}));
	const combinedStatuses = [
		...statusEntries,
		...fallbackStatuses,
		...discoveredPluginStatuses,
		...catalogStatuses
	];
	return {
		installedPlugins,
		catalogEntries: installableCatalogEntries,
		installedCatalogEntries,
		statusByChannel: new Map(combinedStatuses.map((entry) => [entry.channel, entry])),
		statusLines: combinedStatuses.flatMap((entry) => entry.statusLines)
	};
}
async function noteChannelStatus(params) {
	const { statusLines } = await collectChannelStatus({
		cfg: params.cfg,
		options: params.options,
		accountOverrides: params.accountOverrides ?? {},
		installedPlugins: params.installedPlugins,
		resolveAdapter: params.resolveAdapter
	});
	if (statusLines.length > 0) await params.prompter.note(statusLines.join("\n"), "Channel status");
}
async function noteChannelPrimer(prompter, channels) {
	const channelLines = channels.map((channel) => formatChannelPrimerLine({
		id: channel.id,
		label: channel.label,
		selectionLabel: channel.label,
		docsPath: "/",
		blurb: channel.blurb
	}));
	await prompter.note([
		"DM security: default is pairing; unknown DMs get a pairing code.",
		`Approve with: ${formatCliCommand("openclaw pairing approve <channel> <code>")}`,
		"Public DMs require dmPolicy=\"open\" + allowFrom=[\"*\"].",
		"Multi-user DMs: run: " + formatCliCommand("openclaw config set session.dmScope \"per-channel-peer\"") + " (or \"per-account-channel-peer\" for multi-account channels) to isolate sessions.",
		`Docs: ${formatDocsLink("/channels/pairing", "channels/pairing")}`,
		"",
		...channelLines
	].join("\n"), "How channels work");
}
function resolveQuickstartDefault(statusByChannel) {
	let best = null;
	for (const [channel, status] of statusByChannel) {
		if (status.quickstartScore == null) continue;
		if (!best || status.quickstartScore > best.score) best = {
			channel,
			score: status.quickstartScore
		};
	}
	return best?.channel;
}
function resolveChannelSelectionNoteLines(params) {
	const { entries } = resolveChannelSetupEntries({
		cfg: params.cfg,
		installedPlugins: params.installedPlugins,
		workspaceDir: resolveAgentWorkspaceDir(params.cfg, resolveDefaultAgentId(params.cfg))
	});
	const selectionNotes = /* @__PURE__ */ new Map();
	for (const entry of entries) selectionNotes.set(entry.id, formatChannelSelectionLine(entry.meta, formatDocsLink));
	return params.selection.map((channel) => selectionNotes.get(channel)).filter((line) => Boolean(line));
}
function resolveChannelSetupSelectionContributions(params) {
	return params.entries.map((entry) => {
		const disabledHint = params.resolveDisabledHint(entry.id);
		const hint = [params.statusByChannel.get(entry.id)?.selectionHint, disabledHint].filter(Boolean).join(" · ") || void 0;
		return buildChannelSetupSelectionContribution({
			channel: entry.id,
			label: entry.meta.selectionLabel ?? entry.meta.label,
			hint,
			source: listChatChannels().some((channel) => channel.id === entry.id) ? "core" : "plugin"
		});
	});
}
//#endregion
//#region src/flows/channel-setup.ts
function createChannelOnboardingPostWriteHookCollector() {
	const hooks = /* @__PURE__ */ new Map();
	return {
		collect(hook) {
			hooks.set(`${hook.channel}:${hook.accountId}`, hook);
		},
		drain() {
			const next = [...hooks.values()];
			hooks.clear();
			return next;
		}
	};
}
async function runCollectedChannelOnboardingPostWriteHooks(params) {
	for (const hook of params.hooks) try {
		await hook.run({
			cfg: params.cfg,
			runtime: params.runtime
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		params.runtime.error(`Channel ${hook.channel} post-setup warning for "${hook.accountId}": ${message}`);
	}
}
async function setupChannels(cfg, runtime, prompter, options) {
	let next = cfg;
	const forceAllowFromChannels = new Set(options?.forceAllowFromChannels ?? []);
	const accountOverrides = { ...options?.accountIds };
	const scopedPluginsById = /* @__PURE__ */ new Map();
	const resolveWorkspaceDir = () => resolveAgentWorkspaceDir(next, resolveDefaultAgentId(next));
	const rememberScopedPlugin = (plugin) => {
		const channel = plugin.id;
		scopedPluginsById.set(channel, plugin);
		options?.onResolvedPlugin?.(channel, plugin);
	};
	const getVisibleChannelPlugin = (channel) => scopedPluginsById.get(channel) ?? getChannelSetupPlugin(channel);
	const listVisibleInstalledPlugins = () => {
		const merged = /* @__PURE__ */ new Map();
		for (const plugin of listChannelSetupPlugins()) merged.set(plugin.id, plugin);
		for (const plugin of scopedPluginsById.values()) merged.set(plugin.id, plugin);
		return Array.from(merged.values());
	};
	const loadScopedChannelPlugin = async (channel, pluginId) => {
		const existing = getVisibleChannelPlugin(channel);
		if (existing) return existing;
		const snapshot = loadChannelSetupPluginRegistrySnapshotForChannel({
			cfg: next,
			runtime,
			channel,
			...pluginId ? { pluginId } : {},
			workspaceDir: resolveWorkspaceDir()
		});
		const plugin = snapshot.channels.find((entry) => entry.plugin.id === channel)?.plugin ?? snapshot.channelSetups.find((entry) => entry.plugin.id === channel)?.plugin;
		if (plugin) {
			rememberScopedPlugin(plugin);
			return plugin;
		}
	};
	const getVisibleSetupFlowAdapter = (channel) => {
		const scopedPlugin = scopedPluginsById.get(channel);
		if (scopedPlugin) return resolveChannelSetupWizardAdapterForPlugin(scopedPlugin);
		return resolveChannelSetupWizardAdapterForPlugin(getChannelSetupPlugin(channel));
	};
	const preloadConfiguredExternalPlugins = () => {
		const workspaceDir = resolveWorkspaceDir();
		for (const entry of listChannelPluginCatalogEntries({ workspaceDir })) {
			const channel = entry.id;
			if (getVisibleChannelPlugin(channel)) continue;
			if (!(next.plugins?.entries?.[entry.pluginId ?? channel]?.enabled === true) && !isChannelConfigured(next, channel)) continue;
			loadScopedChannelPlugin(channel, entry.pluginId);
		}
	};
	if (options?.whatsappAccountId?.trim()) accountOverrides.whatsapp = options.whatsappAccountId.trim();
	preloadConfiguredExternalPlugins();
	const { installedPlugins, catalogEntries, installedCatalogEntries, statusByChannel, statusLines } = await collectChannelStatus({
		cfg: next,
		options,
		accountOverrides,
		installedPlugins: listVisibleInstalledPlugins(),
		resolveAdapter: getVisibleSetupFlowAdapter
	});
	if (!options?.skipStatusNote && statusLines.length > 0) await prompter.note(statusLines.join("\n"), "Channel status");
	if (!(options?.skipConfirm ? true : await prompter.confirm({
		message: "Configure chat channels now?",
		initialValue: true
	}))) return cfg;
	const corePrimer = listChatChannels().map((meta) => ({
		id: meta.id,
		label: meta.label,
		blurb: meta.blurb
	}));
	const coreIds = new Set(corePrimer.map((entry) => entry.id));
	await noteChannelPrimer(prompter, [
		...corePrimer,
		...installedPlugins.filter((plugin) => !coreIds.has(plugin.id)).map((plugin) => ({
			id: plugin.id,
			label: plugin.meta.label,
			blurb: plugin.meta.blurb
		})),
		...installedCatalogEntries.filter((entry) => !coreIds.has(entry.id)).map((entry) => ({
			id: entry.id,
			label: entry.meta.label,
			blurb: entry.meta.blurb
		})),
		...catalogEntries.filter((entry) => !coreIds.has(entry.id)).map((entry) => ({
			id: entry.id,
			label: entry.meta.label,
			blurb: entry.meta.blurb
		}))
	]);
	const quickstartDefault = options?.initialSelection?.[0] ?? resolveQuickstartDefault(statusByChannel);
	const shouldPromptAccountIds = options?.promptAccountIds === true;
	const accountIdsByChannel = /* @__PURE__ */ new Map();
	const recordAccount = (channel, accountId) => {
		options?.onAccountId?.(channel, accountId);
		getVisibleSetupFlowAdapter(channel)?.onAccountRecorded?.(accountId, options);
		accountIdsByChannel.set(channel, accountId);
	};
	const selection = [];
	const addSelection = (channel) => {
		if (!selection.includes(channel)) selection.push(channel);
	};
	const resolveDisabledHint = (channel) => {
		if (typeof next.channels?.[channel]?.enabled === "boolean") return next.channels[channel]?.enabled === false ? "disabled" : void 0;
		const plugin = getVisibleChannelPlugin(channel);
		if (!plugin) {
			if (next.plugins?.entries?.[channel]?.enabled === false) return "plugin disabled";
			if (next.plugins?.enabled === false) return "plugins disabled";
			return;
		}
		const accountId = resolveChannelDefaultAccountId({
			plugin,
			cfg: next
		});
		const account = plugin.config.resolveAccount(next, accountId);
		let enabled;
		if (plugin.config.isEnabled) enabled = plugin.config.isEnabled(account, next);
		else if (typeof account?.enabled === "boolean") enabled = account.enabled;
		return enabled === false ? "disabled" : void 0;
	};
	const getChannelEntries = () => {
		const resolved = resolveChannelSetupEntries({
			cfg: next,
			installedPlugins: listVisibleInstalledPlugins(),
			workspaceDir: resolveWorkspaceDir()
		});
		return {
			entries: resolved.entries,
			catalogById: resolved.installableCatalogById,
			installedCatalogById: resolved.installedCatalogById
		};
	};
	const refreshStatus = async (channel) => {
		const adapter = getVisibleSetupFlowAdapter(channel);
		if (!adapter) return;
		const status = await adapter.getStatus({
			cfg: next,
			options,
			accountOverrides
		});
		statusByChannel.set(channel, status);
	};
	const enableBundledPluginForSetup = async (channel) => {
		if (getVisibleChannelPlugin(channel)) {
			await refreshStatus(channel);
			return true;
		}
		const result = enablePluginInConfig(next, channel);
		next = result.config;
		if (!result.enabled) {
			await prompter.note(`Cannot enable ${channel}: ${result.reason ?? "plugin disabled"}.`, "Channel setup");
			return false;
		}
		const plugin = await loadScopedChannelPlugin(channel);
		const adapter = getVisibleSetupFlowAdapter(channel);
		if (!plugin) {
			if (adapter) {
				await prompter.note(`${channel} plugin not available (continuing with setup). If the channel still doesn't work after setup, run \`${formatCliCommand("openclaw plugins list")}\` and \`${formatCliCommand("openclaw plugins enable " + channel)}\`, then restart the gateway.`, "Channel setup");
				await refreshStatus(channel);
				return true;
			}
			await prompter.note(`${channel} plugin not available.`, "Channel setup");
			return false;
		}
		await refreshStatus(channel);
		return true;
	};
	const applySetupResult = async (channel, result) => {
		const previousCfg = next;
		next = result.cfg;
		const adapter = getVisibleSetupFlowAdapter(channel);
		if (result.accountId) {
			recordAccount(channel, result.accountId);
			if (adapter?.afterConfigWritten) options?.onPostWriteHook?.({
				channel,
				accountId: result.accountId,
				run: async ({ cfg, runtime }) => await adapter.afterConfigWritten?.({
					previousCfg,
					cfg,
					accountId: result.accountId,
					runtime
				})
			});
		}
		addSelection(channel);
		await refreshStatus(channel);
	};
	const applyCustomSetupResult = async (channel, result) => {
		if (result === "skip") return false;
		await applySetupResult(channel, result);
		return true;
	};
	const configureChannel = async (channel) => {
		const adapter = getVisibleSetupFlowAdapter(channel);
		if (!adapter) {
			await prompter.note(`${channel} does not support guided setup yet.`, "Channel setup");
			return;
		}
		await applySetupResult(channel, await adapter.configure({
			cfg: next,
			runtime,
			prompter,
			options,
			accountOverrides,
			shouldPromptAccountIds,
			forceAllowFrom: forceAllowFromChannels.has(channel)
		}));
	};
	const handleConfiguredChannel = async (channel, label) => {
		const plugin = getVisibleChannelPlugin(channel);
		const adapter = getVisibleSetupFlowAdapter(channel);
		if (adapter?.configureWhenConfigured) {
			if (!await applyCustomSetupResult(channel, await adapter.configureWhenConfigured({
				cfg: next,
				runtime,
				prompter,
				options,
				accountOverrides,
				shouldPromptAccountIds,
				forceAllowFrom: forceAllowFromChannels.has(channel),
				configured: true,
				label
			}))) return;
			return;
		}
		const supportsDisable = Boolean(options?.allowDisable && (plugin?.config.setAccountEnabled || adapter?.disable));
		const supportsDelete = Boolean(options?.allowDisable && plugin?.config.deleteAccount);
		const action = await promptConfiguredAction({
			prompter,
			label,
			supportsDisable,
			supportsDelete
		});
		if (action === "skip") return;
		if (action === "update") {
			await configureChannel(channel);
			return;
		}
		if (!options?.allowDisable) return;
		if (action === "delete" && !supportsDelete) {
			await prompter.note(`${label} does not support deleting config entries.`, "Remove channel");
			return;
		}
		const resolvedAccountId = normalizeAccountId((action === "delete" ? Boolean(plugin?.config.deleteAccount) : Boolean(plugin?.config.setAccountEnabled)) ? await promptRemovalAccountId({
			cfg: next,
			prompter,
			label,
			channel,
			plugin
		}) : "default") ?? (plugin ? resolveChannelDefaultAccountId({
			plugin,
			cfg: next
		}) : "default");
		const accountLabel = formatAccountLabel(resolvedAccountId);
		if (action === "delete") {
			if (!await prompter.confirm({
				message: `Delete ${label} account "${accountLabel}"?`,
				initialValue: false
			})) return;
			if (plugin?.config.deleteAccount) next = plugin.config.deleteAccount({
				cfg: next,
				accountId: resolvedAccountId
			});
			await refreshStatus(channel);
			return;
		}
		if (plugin?.config.setAccountEnabled) next = plugin.config.setAccountEnabled({
			cfg: next,
			accountId: resolvedAccountId,
			enabled: false
		});
		else if (adapter?.disable) next = adapter.disable(next);
		await refreshStatus(channel);
	};
	const handleChannelChoice = async (channel) => {
		const { catalogById, installedCatalogById } = getChannelEntries();
		const catalogEntry = catalogById.get(channel);
		const installedCatalogEntry = installedCatalogById.get(channel);
		if (catalogEntry) {
			const workspaceDir = resolveWorkspaceDir();
			const result = await ensureChannelSetupPluginInstalled({
				cfg: next,
				entry: catalogEntry,
				prompter,
				runtime,
				workspaceDir
			});
			next = result.cfg;
			if (!result.installed) return;
			await loadScopedChannelPlugin(channel, result.pluginId ?? catalogEntry.pluginId);
			await refreshStatus(channel);
		} else if (installedCatalogEntry) {
			if (!await loadScopedChannelPlugin(channel, installedCatalogEntry.pluginId)) {
				await prompter.note(`${channel} plugin not available.`, "Channel setup");
				return;
			}
			await refreshStatus(channel);
		} else if (!await enableBundledPluginForSetup(channel)) return;
		const plugin = getVisibleChannelPlugin(channel);
		const adapter = getVisibleSetupFlowAdapter(channel);
		const label = plugin?.meta.label ?? catalogEntry?.meta.label ?? channel;
		const configured = statusByChannel.get(channel)?.configured ?? false;
		if (adapter?.configureInteractive) {
			if (!await applyCustomSetupResult(channel, await adapter.configureInteractive({
				cfg: next,
				runtime,
				prompter,
				options,
				accountOverrides,
				shouldPromptAccountIds,
				forceAllowFrom: forceAllowFromChannels.has(channel),
				configured,
				label
			}))) return;
			return;
		}
		if (configured) {
			await handleConfiguredChannel(channel, label);
			return;
		}
		await configureChannel(channel);
	};
	if (options?.quickstartDefaults) {
		const { entries } = getChannelEntries();
		const choice = await prompter.select({
			message: "Select channel (QuickStart)",
			options: [...resolveChannelSetupSelectionContributions({
				entries,
				statusByChannel,
				resolveDisabledHint
			}).map((contribution) => contribution.option), {
				value: "__skip__",
				label: "Skip for now",
				hint: `You can add channels later via \`${formatCliCommand("openclaw channels add")}\``
			}],
			initialValue: quickstartDefault
		});
		if (choice !== "__skip__") await handleChannelChoice(choice);
	} else {
		const doneValue = "__done__";
		const initialValue = options?.initialSelection?.[0] ?? quickstartDefault;
		while (true) {
			const { entries } = getChannelEntries();
			const choice = await prompter.select({
				message: "Select a channel",
				options: [...resolveChannelSetupSelectionContributions({
					entries,
					statusByChannel,
					resolveDisabledHint
				}).map((contribution) => contribution.option), {
					value: doneValue,
					label: "Finished",
					hint: selection.length > 0 ? "Done" : "Skip for now"
				}],
				initialValue
			});
			if (choice === doneValue) break;
			await handleChannelChoice(choice);
		}
	}
	options?.onSelection?.(selection);
	const selectedLines = resolveChannelSelectionNoteLines({
		cfg: next,
		installedPlugins: listVisibleInstalledPlugins(),
		selection
	});
	if (selectedLines.length > 0) await prompter.note(selectedLines.join("\n"), "Selected channels");
	if (!options?.skipDmPolicyPrompt) next = await maybeConfigureDmPolicies({
		cfg: next,
		selection,
		prompter,
		accountIdsByChannel,
		resolveAdapter: getVisibleSetupFlowAdapter
	});
	return next;
}
//#endregion
export { isCatalogChannelInstalled as a, noteChannelStatus as i, runCollectedChannelOnboardingPostWriteHooks as n, setupChannels as r, createChannelOnboardingPostWriteHookCollector as t };
