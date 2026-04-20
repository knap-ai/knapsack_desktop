import { a as loadConfig, l as readConfigFileSnapshot } from "./io-5pxHCi7V.js";
import "./config-Q9XZc_2I.js";
import { t as resolveManifestActivationPluginIds } from "./activation-planner-Cty9b1m-.js";
import { n as loadOpenClawPluginCliRegistry, r as loadOpenClawPlugins } from "./loader-DYW2PvbF.js";
import { i as resolvePluginRuntimeLoadContext, r as createPluginRuntimeLoaderLogger, t as buildPluginRuntimeLoadOptions } from "./load-context-HY3FwKJn.js";
import { a as registerLazyCommandGroup, c as collectUniqueCommandDescriptors, n as getCommandGroupNames, o as removeCommandGroupNames, t as findCommandGroupEntry } from "./register-command-groups-CYJh89EB.js";
//#region src/plugins/cli-registry-loader.ts
function createPluginCliLogger() {
	return createPluginRuntimeLoaderLogger();
}
function resolvePluginCliLogger(logger) {
	return logger ?? createPluginCliLogger();
}
function hasIgnoredAsyncPluginRegistration(registry) {
	return (registry.diagnostics ?? []).some((entry) => entry.message === "plugin register returned a promise; async registration is ignored");
}
function mergeCliRegistrars(params) {
	const runtimeCommands = new Set(params.runtimeRegistry.cliRegistrars.flatMap((entry) => entry.commands));
	return [...params.runtimeRegistry.cliRegistrars, ...params.metadataRegistry.cliRegistrars.filter((entry) => !entry.commands.some((command) => runtimeCommands.has(command)))];
}
function buildPluginCliLoaderParams(context, params, loaderOptions) {
	const onlyPluginIds = resolvePrimaryCommandPluginIds(context, params?.primaryCommand);
	return buildPluginRuntimeLoadOptions(context, {
		...loaderOptions,
		...onlyPluginIds.length > 0 ? { onlyPluginIds } : {}
	});
}
function resolvePrimaryCommandPluginIds(context, primaryCommand) {
	const normalizedPrimary = primaryCommand?.trim();
	if (!normalizedPrimary) return [];
	return resolveManifestActivationPluginIds({
		trigger: {
			kind: "command",
			command: normalizedPrimary
		},
		config: context.activationSourceConfig,
		workspaceDir: context.workspaceDir,
		env: context.env
	});
}
function resolvePluginCliLoadContext(params) {
	return resolvePluginRuntimeLoadContext({
		config: params.cfg,
		env: params.env,
		logger: params.logger
	});
}
async function loadPluginCliMetadataRegistryWithContext(context, params, loaderOptions) {
	return {
		...context,
		registry: await loadOpenClawPluginCliRegistry(buildPluginCliLoaderParams(context, params, loaderOptions))
	};
}
async function loadPluginCliCommandRegistryWithContext(params) {
	const runtimeRegistry = loadOpenClawPlugins(buildPluginCliLoaderParams(params.context, { primaryCommand: params.primaryCommand }, params.loaderOptions));
	if (!hasIgnoredAsyncPluginRegistration(runtimeRegistry)) return {
		...params.context,
		registry: runtimeRegistry
	};
	try {
		const metadataRegistry = await loadOpenClawPluginCliRegistry(buildPluginCliLoaderParams(params.context, { primaryCommand: params.primaryCommand }, params.loaderOptions));
		return {
			...params.context,
			registry: {
				...runtimeRegistry,
				cliRegistrars: mergeCliRegistrars({
					runtimeRegistry,
					metadataRegistry
				})
			}
		};
	} catch (error) {
		params.onMetadataFallbackError(error);
		return {
			...params.context,
			registry: runtimeRegistry
		};
	}
}
function buildPluginCliCommandGroupEntries(params) {
	return params.registry.cliRegistrars.map((entry) => ({
		pluginId: entry.pluginId,
		placeholders: entry.descriptors,
		names: entry.commands,
		register: async (program) => {
			await entry.register({
				program,
				config: params.config,
				workspaceDir: params.workspaceDir,
				logger: params.logger
			});
		}
	}));
}
function logPluginCliMetadataFallbackError(logger, error) {
	logger.warn(`plugin CLI metadata fallback failed: ${String(error)}`);
}
async function loadPluginCliDescriptors(params) {
	try {
		const logger = resolvePluginCliLogger(params.logger);
		const { registry } = await loadPluginCliMetadataRegistryWithContext(resolvePluginCliLoadContext({
			cfg: params.cfg,
			env: params.env,
			logger
		}), { primaryCommand: params.primaryCommand }, params.loaderOptions);
		return collectUniqueCommandDescriptors(registry.cliRegistrars.map((entry) => entry.descriptors));
	} catch {
		return [];
	}
}
async function loadPluginCliRegistrationEntries(params) {
	const resolvedLogger = resolvePluginCliLogger(params.logger);
	const { config, workspaceDir, logger, registry } = await loadPluginCliCommandRegistryWithContext({
		context: resolvePluginCliLoadContext({
			cfg: params.cfg,
			env: params.env,
			logger: resolvedLogger
		}),
		primaryCommand: params.primaryCommand,
		loaderOptions: params.loaderOptions,
		onMetadataFallbackError: params.onMetadataFallbackError
	});
	return buildPluginCliCommandGroupEntries({
		registry,
		config,
		workspaceDir,
		logger
	});
}
async function loadPluginCliRegistrationEntriesWithDefaults(params) {
	const logger = resolvePluginCliLogger(params.logger);
	return loadPluginCliRegistrationEntries({
		...params,
		logger,
		onMetadataFallbackError: (error) => {
			logPluginCliMetadataFallbackError(logger, error);
		}
	});
}
//#endregion
//#region src/plugins/register-plugin-cli-command-groups.ts
function canRegisterPluginCliLazily(entry) {
	if (entry.placeholders.length === 0) return false;
	const descriptorNames = new Set(entry.placeholders.map((descriptor) => descriptor.name));
	return getCommandGroupNames(entry).every((command) => descriptorNames.has(command));
}
async function registerPluginCliCommandGroups(program, entries, params) {
	for (const entry of entries) {
		const registerEntry = async () => {
			await entry.register(program);
			for (const command of getCommandGroupNames(entry)) params.existingCommands.add(command);
		};
		if (params.primary && findCommandGroupEntry([entry], params.primary)) {
			removeCommandGroupNames(program, entry);
			await registerEntry();
			continue;
		}
		const overlaps = getCommandGroupNames(entry).filter((command) => params.existingCommands.has(command));
		if (overlaps.length > 0) {
			params.logger.debug?.(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
			continue;
		}
		try {
			if (params.mode === "lazy" && canRegisterPluginCliLazily(entry)) {
				for (const placeholder of entry.placeholders) registerLazyCommandGroup(program, entry, placeholder);
				continue;
			}
			if (params.mode === "lazy" && entry.placeholders.length > 0) params.logger.debug?.(`plugin CLI lazy register fallback to eager (${entry.pluginId}): descriptors do not cover all command roots`);
			await registerEntry();
		} catch (error) {
			params.logger.warn(`plugin CLI register failed (${entry.pluginId}): ${String(error)}`);
		}
	}
}
//#endregion
//#region src/plugins/cli.ts
const logger = createPluginCliLogger();
const loadValidatedConfigForPluginRegistration = async () => {
	if (!(await readConfigFileSnapshot()).valid) return null;
	return loadConfig();
};
async function getPluginCliCommandDescriptors(cfg, env, loaderOptions) {
	return loadPluginCliDescriptors({
		cfg,
		env,
		loaderOptions
	});
}
async function registerPluginCliCommands(program, cfg, env, loaderOptions, options) {
	const mode = options?.mode ?? "eager";
	const primary = options?.primary ?? void 0;
	await registerPluginCliCommandGroups(program, await loadPluginCliRegistrationEntriesWithDefaults({
		cfg,
		env,
		loaderOptions,
		primaryCommand: primary
	}), {
		mode,
		primary,
		existingCommands: new Set(program.commands.map((cmd) => cmd.name())),
		logger
	});
}
async function registerPluginCliCommandsFromValidatedConfig(program, env, loaderOptions, options) {
	const config = await loadValidatedConfigForPluginRegistration();
	if (!config) return null;
	await registerPluginCliCommands(program, config, env, loaderOptions, options);
	return config;
}
//#endregion
export { registerPluginCliCommandsFromValidatedConfig as i, loadValidatedConfigForPluginRegistration as n, registerPluginCliCommands as r, getPluginCliCommandDescriptors as t };
