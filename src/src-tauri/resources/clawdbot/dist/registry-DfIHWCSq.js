import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import "./session-key-D7XpmyVq.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-LPHTYrMX.js";
import { a as getActivePluginRegistryVersion, h as requireActivePluginRegistry } from "./runtime-DZz1f0_h.js";
import { a as CHAT_CHANNEL_ORDER, d as buildPluginLoaderJitiOptions, g as shouldPreferNativeJiti, u as buildPluginLoaderAliasMap } from "./chat-meta-Cdrnv7R-.js";
import "./registry-DTO_OK4F.js";
import { i as discoverOpenClawPlugins, n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { B as runSingleChannelSecretStep, F as resolveAccountIdForConfigure, N as promptResolvedAllowFrom, Q as splitSetupEntries } from "./setup-wizard-helpers-BfrhuTOh.js";
import { t as promptChannelAccessConfig } from "./setup-group-access-Eg0ylq60.js";
import fsSync from "node:fs";
import { createJiti } from "jiti";
//#region src/channels/plugins/bundled.ts
const log = createSubsystemLogger("channels");
function resolveChannelPluginModuleEntry(moduleExport) {
	const resolved = moduleExport && typeof moduleExport === "object" && "default" in moduleExport ? moduleExport.default : moduleExport;
	if (!resolved || typeof resolved !== "object") return null;
	const record = resolved;
	if (!record.channelPlugin || typeof record.channelPlugin !== "object") return null;
	return {
		channelPlugin: record.channelPlugin,
		...typeof record.setChannelRuntime === "function" ? { setChannelRuntime: record.setChannelRuntime } : {}
	};
}
function resolveChannelSetupModuleEntry(moduleExport) {
	const resolved = moduleExport && typeof moduleExport === "object" && "default" in moduleExport ? moduleExport.default : moduleExport;
	if (!resolved || typeof resolved !== "object") return null;
	const record = resolved;
	if (!record.plugin || typeof record.plugin !== "object") return null;
	return { plugin: record.plugin };
}
function createModuleLoader() {
	const jitiLoaders = /* @__PURE__ */ new Map();
	return (modulePath) => {
		const tryNative = shouldPreferNativeJiti(modulePath);
		const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url);
		const cacheKey = JSON.stringify({
			tryNative,
			aliasMap: Object.entries(aliasMap).toSorted(([left], [right]) => left.localeCompare(right))
		});
		const cached = jitiLoaders.get(cacheKey);
		if (cached) return cached;
		const loader = createJiti(import.meta.url, {
			...buildPluginLoaderJitiOptions(aliasMap),
			tryNative
		});
		jitiLoaders.set(cacheKey, loader);
		return loader;
	};
}
const loadModule = createModuleLoader();
function loadBundledModule(modulePath, rootDir) {
	const opened = openBoundaryFileSync({
		absolutePath: modulePath,
		rootPath: rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: false,
		skipLexicalRootCheck: true
	});
	if (!opened.ok) throw new Error("plugin entry path escapes plugin root or fails alias checks");
	const safePath = opened.path;
	fsSync.closeSync(opened.fd);
	return loadModule(safePath)(safePath);
}
function loadGeneratedBundledChannelEntries() {
	const discovery = discoverOpenClawPlugins({ cache: false });
	const manifestRegistry = loadPluginManifestRegistry({
		cache: false,
		config: {},
		candidates: discovery.candidates,
		diagnostics: discovery.diagnostics
	});
	const manifestByRoot = new Map(manifestRegistry.plugins.map((plugin) => [plugin.rootDir, plugin]));
	const seenIds = /* @__PURE__ */ new Set();
	const entries = [];
	for (const candidate of discovery.candidates) {
		const manifest = manifestByRoot.get(candidate.rootDir);
		if (!manifest || manifest.origin !== "bundled" || manifest.channels.length === 0) continue;
		if (seenIds.has(manifest.id)) continue;
		seenIds.add(manifest.id);
		try {
			const entry = resolveChannelPluginModuleEntry(loadBundledModule(candidate.source, candidate.rootDir));
			if (!entry) {
				log.warn(`[channels] bundled channel entry ${manifest.id} missing channelPlugin export; skipping`);
				continue;
			}
			const setupEntry = manifest.setupSource ? resolveChannelSetupModuleEntry(loadBundledModule(manifest.setupSource, candidate.rootDir)) : null;
			entries.push({
				id: manifest.id,
				entry,
				...setupEntry ? { setupEntry } : {}
			});
		} catch (error) {
			log.warn(`[channels] failed to load bundled channel ${manifest.id} from ${candidate.source}: ${String(error)}`);
		}
	}
	return entries;
}
function buildBundledChannelPluginsById(plugins) {
	const byId = /* @__PURE__ */ new Map();
	for (const plugin of plugins) {
		if (byId.has(plugin.id)) throw new Error(`duplicate bundled channel plugin id: ${plugin.id}`);
		byId.set(plugin.id, plugin);
	}
	return byId;
}
let cachedBundledChannelState = null;
function getBundledChannelState() {
	if (cachedBundledChannelState) return cachedBundledChannelState;
	const entries = loadGeneratedBundledChannelEntries();
	const plugins = entries.map(({ entry }) => entry.channelPlugin);
	const setupPlugins = entries.flatMap(({ setupEntry }) => {
		const plugin = setupEntry?.plugin;
		return plugin ? [plugin] : [];
	});
	const runtimeSettersById = /* @__PURE__ */ new Map();
	for (const { entry } of entries) if (entry.setChannelRuntime) runtimeSettersById.set(entry.channelPlugin.id, entry.setChannelRuntime);
	cachedBundledChannelState = {
		entries,
		plugins,
		setupPlugins,
		pluginsById: buildBundledChannelPluginsById(plugins),
		runtimeSettersById
	};
	return cachedBundledChannelState;
}
function listBundledChannelPlugins() {
	return getBundledChannelState().plugins;
}
function listBundledChannelSetupPlugins() {
	return getBundledChannelState().setupPlugins;
}
//#endregion
//#region src/channels/plugins/setup-registry.ts
let cachedChannelSetupPlugins = {
	registryVersion: -1,
	sorted: [],
	byId: /* @__PURE__ */ new Map()
};
function dedupeSetupPlugins(plugins) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const plugin of plugins) {
		const id = String(plugin.id).trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		resolved.push(plugin);
	}
	return resolved;
}
function sortChannelSetupPlugins(plugins) {
	return dedupeSetupPlugins(plugins).toSorted((a, b) => {
		const indexA = CHAT_CHANNEL_ORDER.indexOf(a.id);
		const indexB = CHAT_CHANNEL_ORDER.indexOf(b.id);
		const orderA = a.meta.order ?? (indexA === -1 ? 999 : indexA);
		const orderB = b.meta.order ?? (indexB === -1 ? 999 : indexB);
		if (orderA !== orderB) return orderA - orderB;
		return a.id.localeCompare(b.id);
	});
}
function resolveCachedChannelSetupPlugins() {
	const registry = requireActivePluginRegistry();
	const registryVersion = getActivePluginRegistryVersion();
	const cached = cachedChannelSetupPlugins;
	if (cached.registryVersion === registryVersion) return cached;
	const registryPlugins = (registry.channelSetups ?? []).map((entry) => entry.plugin);
	const sorted = sortChannelSetupPlugins(registryPlugins.length > 0 ? registryPlugins : listBundledChannelSetupPlugins());
	const byId = /* @__PURE__ */ new Map();
	for (const plugin of sorted) byId.set(plugin.id, plugin);
	const next = {
		registryVersion,
		sorted,
		byId
	};
	cachedChannelSetupPlugins = next;
	return next;
}
function listChannelSetupPlugins() {
	return resolveCachedChannelSetupPlugins().sorted.slice();
}
function getChannelSetupPlugin(id) {
	const resolvedId = String(id).trim();
	if (!resolvedId) return;
	return resolveCachedChannelSetupPlugins().byId.get(resolvedId);
}
//#endregion
//#region src/channels/plugins/setup-group-access-configure.ts
async function configureChannelAccessWithAllowlist(params) {
	let next = params.cfg;
	const accessConfig = await promptChannelAccessConfig({
		prompter: params.prompter,
		label: params.label,
		currentPolicy: params.currentPolicy,
		currentEntries: params.currentEntries,
		placeholder: params.placeholder,
		updatePrompt: params.updatePrompt,
		skipAllowlistEntries: params.skipAllowlistEntries
	});
	if (!accessConfig) return next;
	if (accessConfig.policy !== "allowlist") return params.setPolicy(next, accessConfig.policy);
	if (params.skipAllowlistEntries || !params.resolveAllowlist || !params.applyAllowlist) return params.setPolicy(next, "allowlist");
	const resolved = await params.resolveAllowlist({
		cfg: next,
		entries: accessConfig.entries
	});
	next = params.setPolicy(next, "allowlist");
	return params.applyAllowlist({
		cfg: next,
		resolved
	});
}
//#endregion
//#region src/channels/plugins/setup-wizard.ts
async function buildStatus(plugin, wizard, ctx) {
	const configured = await wizard.status.resolveConfigured({ cfg: ctx.cfg });
	const statusLines = await wizard.status.resolveStatusLines?.({
		cfg: ctx.cfg,
		configured
	}) ?? [`${plugin.meta.label}: ${configured ? wizard.status.configuredLabel : wizard.status.unconfiguredLabel}`];
	const selectionHint = await wizard.status.resolveSelectionHint?.({
		cfg: ctx.cfg,
		configured
	}) ?? (configured ? wizard.status.configuredHint : wizard.status.unconfiguredHint);
	const quickstartScore = await wizard.status.resolveQuickstartScore?.({
		cfg: ctx.cfg,
		configured
	}) ?? (configured ? wizard.status.configuredScore : wizard.status.unconfiguredScore);
	return {
		channel: plugin.id,
		configured,
		statusLines,
		selectionHint,
		quickstartScore
	};
}
function applySetupInput(params) {
	const setup = params.plugin.setup;
	if (!setup?.applyAccountConfig) throw new Error(`${params.plugin.id} does not support setup`);
	const resolvedAccountId = setup.resolveAccountId?.({
		cfg: params.cfg,
		accountId: params.accountId,
		input: params.input
	}) ?? params.accountId;
	const validationError = setup.validateInput?.({
		cfg: params.cfg,
		accountId: resolvedAccountId,
		input: params.input
	});
	if (validationError) throw new Error(validationError);
	let next = setup.applyAccountConfig({
		cfg: params.cfg,
		accountId: resolvedAccountId,
		input: params.input
	});
	if (params.input.name?.trim() && setup.applyAccountName) next = setup.applyAccountName({
		cfg: next,
		accountId: resolvedAccountId,
		name: params.input.name
	});
	return {
		cfg: next,
		accountId: resolvedAccountId
	};
}
function trimResolvedValue(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function collectCredentialValues(params) {
	const values = {};
	for (const credential of params.wizard.credentials) {
		const resolvedValue = trimResolvedValue(credential.inspect({
			cfg: params.cfg,
			accountId: params.accountId
		}).resolvedValue);
		if (resolvedValue) values[credential.inputKey] = resolvedValue;
	}
	return values;
}
async function applyWizardTextInputValue(params) {
	return params.input.applySet ? await params.input.applySet({
		cfg: params.cfg,
		accountId: params.accountId,
		value: params.value
	}) : applySetupInput({
		plugin: params.plugin,
		cfg: params.cfg,
		accountId: params.accountId,
		input: { [params.input.inputKey]: params.value }
	}).cfg;
}
function buildChannelSetupWizardAdapterFromSetupWizard(params) {
	const { plugin, wizard } = params;
	return {
		channel: plugin.id,
		getStatus: async (ctx) => buildStatus(plugin, wizard, ctx),
		configure: async ({ cfg, runtime, prompter, options, accountOverrides, shouldPromptAccountIds, forceAllowFrom }) => {
			const defaultAccountId = plugin.config.defaultAccountId?.(cfg) ?? plugin.config.listAccountIds(cfg)[0] ?? "default";
			const resolvedShouldPromptAccountIds = wizard.resolveShouldPromptAccountIds?.({
				cfg,
				options,
				shouldPromptAccountIds
			}) ?? shouldPromptAccountIds;
			const accountId = await (wizard.resolveAccountIdForConfigure ? wizard.resolveAccountIdForConfigure({
				cfg,
				prompter,
				options,
				accountOverride: accountOverrides[plugin.id],
				shouldPromptAccountIds: resolvedShouldPromptAccountIds,
				listAccountIds: plugin.config.listAccountIds,
				defaultAccountId
			}) : resolveAccountIdForConfigure({
				cfg,
				prompter,
				label: plugin.meta.label,
				accountOverride: accountOverrides[plugin.id],
				shouldPromptAccountIds: resolvedShouldPromptAccountIds,
				listAccountIds: plugin.config.listAccountIds,
				defaultAccountId
			}));
			let next = cfg;
			let credentialValues = collectCredentialValues({
				wizard,
				cfg: next,
				accountId
			});
			let usedEnvShortcut = false;
			if (wizard.envShortcut?.isAvailable({
				cfg: next,
				accountId
			})) {
				if (await prompter.confirm({
					message: wizard.envShortcut.prompt,
					initialValue: true
				})) {
					next = await wizard.envShortcut.apply({
						cfg: next,
						accountId
					});
					credentialValues = collectCredentialValues({
						wizard,
						cfg: next,
						accountId
					});
					usedEnvShortcut = true;
				}
			}
			if (!usedEnvShortcut && (wizard.introNote?.shouldShow ? await wizard.introNote.shouldShow({
				cfg: next,
				accountId,
				credentialValues
			}) : Boolean(wizard.introNote)) && wizard.introNote) await prompter.note(wizard.introNote.lines.join("\n"), wizard.introNote.title);
			if (wizard.prepare) {
				const prepared = await wizard.prepare({
					cfg: next,
					accountId,
					credentialValues,
					runtime,
					prompter,
					options
				});
				if (prepared?.cfg) next = prepared.cfg;
				if (prepared?.credentialValues) credentialValues = {
					...credentialValues,
					...prepared.credentialValues
				};
			}
			const runCredentialSteps = async () => {
				if (usedEnvShortcut) return;
				for (const credential of wizard.credentials) {
					let credentialState = credential.inspect({
						cfg: next,
						accountId
					});
					let resolvedCredentialValue = trimResolvedValue(credentialState.resolvedValue);
					if (!(credential.shouldPrompt ? await credential.shouldPrompt({
						cfg: next,
						accountId,
						credentialValues,
						currentValue: resolvedCredentialValue,
						state: credentialState
					}) : true)) {
						if (resolvedCredentialValue) credentialValues[credential.inputKey] = resolvedCredentialValue;
						else delete credentialValues[credential.inputKey];
						continue;
					}
					const allowEnv = credential.allowEnv?.({
						cfg: next,
						accountId
					}) ?? false;
					const credentialResult = await runSingleChannelSecretStep({
						cfg: next,
						prompter,
						providerHint: credential.providerHint,
						credentialLabel: credential.credentialLabel,
						secretInputMode: options?.secretInputMode,
						accountConfigured: credentialState.accountConfigured,
						hasConfigToken: credentialState.hasConfiguredValue,
						allowEnv,
						envValue: credentialState.envValue,
						envPrompt: credential.envPrompt,
						keepPrompt: credential.keepPrompt,
						inputPrompt: credential.inputPrompt,
						preferredEnvVar: credential.preferredEnvVar,
						onMissingConfigured: credential.helpLines && credential.helpLines.length > 0 ? async () => {
							await prompter.note(credential.helpLines.join("\n"), credential.helpTitle ?? credential.credentialLabel);
						} : void 0,
						applyUseEnv: async (currentCfg) => credential.applyUseEnv ? await credential.applyUseEnv({
							cfg: currentCfg,
							accountId
						}) : applySetupInput({
							plugin,
							cfg: currentCfg,
							accountId,
							input: {
								[credential.inputKey]: void 0,
								useEnv: true
							}
						}).cfg,
						applySet: async (currentCfg, value, resolvedValue) => {
							resolvedCredentialValue = resolvedValue;
							return credential.applySet ? await credential.applySet({
								cfg: currentCfg,
								accountId,
								credentialValues,
								value,
								resolvedValue
							}) : applySetupInput({
								plugin,
								cfg: currentCfg,
								accountId,
								input: {
									[credential.inputKey]: value,
									useEnv: false
								}
							}).cfg;
						}
					});
					next = credentialResult.cfg;
					credentialState = credential.inspect({
						cfg: next,
						accountId
					});
					resolvedCredentialValue = trimResolvedValue(credentialResult.resolvedValue) || trimResolvedValue(credentialState.resolvedValue);
					if (resolvedCredentialValue) credentialValues[credential.inputKey] = resolvedCredentialValue;
					else delete credentialValues[credential.inputKey];
				}
			};
			const runTextInputSteps = async () => {
				for (const textInput of wizard.textInputs ?? []) {
					let currentValue = trimResolvedValue(typeof credentialValues[textInput.inputKey] === "string" ? credentialValues[textInput.inputKey] : void 0);
					if (!currentValue && textInput.currentValue) currentValue = trimResolvedValue(await textInput.currentValue({
						cfg: next,
						accountId,
						credentialValues
					}));
					if (!(textInput.shouldPrompt ? await textInput.shouldPrompt({
						cfg: next,
						accountId,
						credentialValues,
						currentValue
					}) : true)) {
						if (currentValue) {
							credentialValues[textInput.inputKey] = currentValue;
							if (textInput.applyCurrentValue) next = await applyWizardTextInputValue({
								plugin,
								input: textInput,
								cfg: next,
								accountId,
								value: currentValue
							});
						}
						continue;
					}
					if (textInput.helpLines && textInput.helpLines.length > 0) await prompter.note(textInput.helpLines.join("\n"), textInput.helpTitle ?? textInput.message);
					if (currentValue && textInput.confirmCurrentValue !== false) {
						if (await prompter.confirm({
							message: typeof textInput.keepPrompt === "function" ? textInput.keepPrompt(currentValue) : textInput.keepPrompt ?? `${textInput.message} set (${currentValue}). Keep it?`,
							initialValue: true
						})) {
							credentialValues[textInput.inputKey] = currentValue;
							if (textInput.applyCurrentValue) next = await applyWizardTextInputValue({
								plugin,
								input: textInput,
								cfg: next,
								accountId,
								value: currentValue
							});
							continue;
						}
					}
					const initialValue = trimResolvedValue(await textInput.initialValue?.({
						cfg: next,
						accountId,
						credentialValues
					}) ?? currentValue);
					const trimmedValue = String(await prompter.text({
						message: textInput.message,
						initialValue,
						placeholder: textInput.placeholder,
						validate: (value) => {
							const trimmed = String(value ?? "").trim();
							if (!trimmed && textInput.required !== false) return "Required";
							return textInput.validate?.({
								value: trimmed,
								cfg: next,
								accountId,
								credentialValues
							});
						}
					})).trim();
					if (!trimmedValue && textInput.required === false) {
						if (textInput.applyEmptyValue) next = await applyWizardTextInputValue({
							plugin,
							input: textInput,
							cfg: next,
							accountId,
							value: ""
						});
						delete credentialValues[textInput.inputKey];
						continue;
					}
					const normalizedValue = trimResolvedValue(textInput.normalizeValue?.({
						value: trimmedValue,
						cfg: next,
						accountId,
						credentialValues
					}) ?? trimmedValue);
					if (!normalizedValue) {
						delete credentialValues[textInput.inputKey];
						continue;
					}
					next = await applyWizardTextInputValue({
						plugin,
						input: textInput,
						cfg: next,
						accountId,
						value: normalizedValue
					});
					credentialValues[textInput.inputKey] = normalizedValue;
				}
			};
			if (wizard.stepOrder === "text-first") {
				await runTextInputSteps();
				await runCredentialSteps();
			} else {
				await runCredentialSteps();
				await runTextInputSteps();
			}
			if (wizard.groupAccess) {
				const access = wizard.groupAccess;
				if (access.helpLines && access.helpLines.length > 0) await prompter.note(access.helpLines.join("\n"), access.helpTitle ?? access.label);
				next = await configureChannelAccessWithAllowlist({
					cfg: next,
					prompter,
					label: access.label,
					currentPolicy: access.currentPolicy({
						cfg: next,
						accountId
					}),
					currentEntries: access.currentEntries({
						cfg: next,
						accountId
					}),
					placeholder: access.placeholder,
					updatePrompt: access.updatePrompt({
						cfg: next,
						accountId
					}),
					skipAllowlistEntries: access.skipAllowlistEntries,
					setPolicy: (currentCfg, policy) => access.setPolicy({
						cfg: currentCfg,
						accountId,
						policy
					}),
					resolveAllowlist: access.resolveAllowlist ? async ({ cfg: currentCfg, entries }) => await access.resolveAllowlist({
						cfg: currentCfg,
						accountId,
						credentialValues,
						entries,
						prompter
					}) : void 0,
					applyAllowlist: access.applyAllowlist ? ({ cfg: currentCfg, resolved }) => access.applyAllowlist({
						cfg: currentCfg,
						accountId,
						resolved
					}) : void 0
				});
			}
			if (forceAllowFrom && wizard.allowFrom) {
				const allowFrom = wizard.allowFrom;
				const allowFromCredentialValue = trimResolvedValue(credentialValues[allowFrom.credentialInputKey ?? wizard.credentials[0]?.inputKey]);
				if (allowFrom.helpLines && allowFrom.helpLines.length > 0) await prompter.note(allowFrom.helpLines.join("\n"), allowFrom.helpTitle ?? `${plugin.meta.label} allowlist`);
				const unique = await promptResolvedAllowFrom({
					prompter,
					existing: plugin.config.resolveAllowFrom?.({
						cfg: next,
						accountId
					}) ?? [],
					token: allowFromCredentialValue,
					message: allowFrom.message,
					placeholder: allowFrom.placeholder,
					label: allowFrom.helpTitle ?? `${plugin.meta.label} allowlist`,
					parseInputs: allowFrom.parseInputs ?? splitSetupEntries,
					parseId: allowFrom.parseId,
					invalidWithoutTokenNote: allowFrom.invalidWithoutCredentialNote,
					resolveEntries: async ({ entries }) => allowFrom.resolveEntries({
						cfg: next,
						accountId,
						credentialValues,
						entries
					})
				});
				next = await allowFrom.apply({
					cfg: next,
					accountId,
					allowFrom: unique
				});
			}
			if (wizard.finalize) {
				const finalized = await wizard.finalize({
					cfg: next,
					accountId,
					credentialValues,
					runtime,
					prompter,
					options,
					forceAllowFrom
				});
				if (finalized?.cfg) next = finalized.cfg;
				if (finalized?.credentialValues) credentialValues = {
					...credentialValues,
					...finalized.credentialValues
				};
			}
			if (wizard.completionNote && (wizard.completionNote.shouldShow ? await wizard.completionNote.shouldShow({
				cfg: next,
				accountId,
				credentialValues
			}) : true) && wizard.completionNote) await prompter.note(wizard.completionNote.lines.join("\n"), wizard.completionNote.title);
			return {
				cfg: next,
				accountId
			};
		},
		dmPolicy: wizard.dmPolicy,
		disable: wizard.disable,
		onAccountRecorded: wizard.onAccountRecorded
	};
}
//#endregion
//#region src/commands/channel-setup/registry.ts
const setupWizardAdapters = /* @__PURE__ */ new WeakMap();
function isChannelSetupWizardAdapter(setupWizard) {
	return Boolean(setupWizard && typeof setupWizard === "object" && "getStatus" in setupWizard && typeof setupWizard.getStatus === "function" && "configure" in setupWizard && typeof setupWizard.configure === "function");
}
function isDeclarativeChannelSetupWizard(setupWizard) {
	return Boolean(setupWizard && typeof setupWizard === "object" && "status" in setupWizard && "credentials" in setupWizard);
}
function resolveChannelSetupWizardAdapterForPlugin(plugin) {
	if (!plugin) return;
	const { setupWizard } = plugin;
	if (isChannelSetupWizardAdapter(setupWizard)) return setupWizard;
	if (isDeclarativeChannelSetupWizard(setupWizard)) {
		const cached = setupWizardAdapters.get(plugin);
		if (cached) return cached;
		const adapter = buildChannelSetupWizardAdapterFromSetupWizard({
			plugin,
			wizard: setupWizard
		});
		setupWizardAdapters.set(plugin, adapter);
		return adapter;
	}
}
//#endregion
export { listBundledChannelPlugins as i, getChannelSetupPlugin as n, listChannelSetupPlugins as r, resolveChannelSetupWizardAdapterForPlugin as t };
