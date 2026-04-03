import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { n as loadOpenClawPlugins, t as loadOpenClawPluginCliRegistry } from "./loader-BkOjign1.js";
import { n as removeCommandByName, t as registerLazyCommand } from "./register-lazy-command-BDe8hgmC.js";
//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function canRegisterPluginCliLazily(entry) {
	if (entry.descriptors.length === 0) return false;
	const descriptorNames = new Set(entry.descriptors.map((descriptor) => descriptor.name));
	return entry.commands.every((command) => descriptorNames.has(command));
}
function hasIgnoredAsyncPluginRegistration(registry) {
	return (registry.diagnostics ?? []).some((entry) => entry.message === "plugin register returned a promise; async registration is ignored");
}
function mergeCliRegistrars(params) {
	const metadataCommands = new Set(params.metadataRegistry.cliRegistrars.flatMap((entry) => entry.commands));
	return [...params.metadataRegistry.cliRegistrars, ...params.runtimeRegistry.cliRegistrars.filter((entry) => !entry.commands.some((command) => metadataCommands.has(command)))];
}
function resolvePluginCliLoadContext(cfg, env) {
	const config = cfg ?? loadConfig();
	const autoEnabled = applyPluginAutoEnable({
		config,
		env: env ?? process.env
	});
	const resolvedConfig = autoEnabled.config;
	const workspaceDir = resolveAgentWorkspaceDir(resolvedConfig, resolveDefaultAgentId(resolvedConfig));
	return {
		rawConfig: config,
		config: resolvedConfig,
		autoEnabledReasons: autoEnabled.autoEnabledReasons,
		workspaceDir,
		logger: {
			info: (msg) => log.info(msg),
			warn: (msg) => log.warn(msg),
			error: (msg) => log.error(msg),
			debug: (msg) => log.debug(msg)
		}
	};
}
async function loadPluginCliMetadataRegistry(cfg, env, loaderOptions) {
	const context = resolvePluginCliLoadContext(cfg, env);
	return {
		...context,
		registry: await loadOpenClawPluginCliRegistry({
			config: context.config,
			activationSourceConfig: context.rawConfig,
			autoEnabledReasons: context.autoEnabledReasons,
			workspaceDir: context.workspaceDir,
			env,
			logger: context.logger,
			...loaderOptions
		})
	};
}
async function loadPluginCliCommandRegistry(cfg, env, loaderOptions) {
	const context = resolvePluginCliLoadContext(cfg, env);
	const runtimeRegistry = loadOpenClawPlugins({
		config: context.config,
		activationSourceConfig: context.rawConfig,
		autoEnabledReasons: context.autoEnabledReasons,
		workspaceDir: context.workspaceDir,
		env,
		logger: context.logger,
		...loaderOptions
	});
	if (!hasIgnoredAsyncPluginRegistration(runtimeRegistry)) return {
		...context,
		registry: runtimeRegistry
	};
	try {
		const metadataRegistry = await loadOpenClawPluginCliRegistry({
			config: context.config,
			activationSourceConfig: context.rawConfig,
			autoEnabledReasons: context.autoEnabledReasons,
			workspaceDir: context.workspaceDir,
			env,
			logger: context.logger,
			...loaderOptions
		});
		return {
			...context,
			registry: {
				...runtimeRegistry,
				cliRegistrars: mergeCliRegistrars({
					runtimeRegistry,
					metadataRegistry
				})
			}
		};
	} catch (error) {
		log.warn(`plugin CLI metadata fallback failed: ${String(error)}`);
		return {
			...context,
			registry: runtimeRegistry
		};
	}
}
async function getPluginCliCommandDescriptors(cfg, env) {
	try {
		const { registry } = await loadPluginCliMetadataRegistry(cfg, env);
		const seen = /* @__PURE__ */ new Set();
		const descriptors = [];
		for (const entry of registry.cliRegistrars) for (const descriptor of entry.descriptors) {
			if (seen.has(descriptor.name)) continue;
			seen.add(descriptor.name);
			descriptors.push(descriptor);
		}
		return descriptors;
	} catch {
		return [];
	}
}
async function registerPluginCliCommands(program, cfg, env, loaderOptions, options) {
	const { config, workspaceDir, logger, registry } = await loadPluginCliCommandRegistry(cfg, env, loaderOptions);
	const mode = options?.mode ?? "eager";
	const primary = options?.primary ?? null;
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		const registerEntry = async () => {
			await entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
		};
		if (primary && entry.commands.includes(primary)) {
			for (const commandName of new Set(entry.commands)) removeCommandByName(program, commandName);
			await registerEntry();
			for (const command of entry.commands) existingCommands.add(command);
			continue;
		}
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			if (mode === "lazy" && canRegisterPluginCliLazily(entry)) for (const descriptor of entry.descriptors) registerLazyCommand({
				program,
				name: descriptor.name,
				description: descriptor.description,
				removeNames: entry.commands,
				register: async () => {
					await registerEntry();
				}
			});
			else {
				if (mode === "lazy" && entry.descriptors.length > 0) log.debug(`plugin CLI lazy register fallback to eager (${entry.pluginId}): descriptors do not cover all command roots`);
				await registerEntry();
			}
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}
//#endregion
export { registerPluginCliCommands as n, getPluginCliCommandDescriptors as t };
