import { r as loadInstalledPluginIndexInstallRecords } from "./manifest-registry-CXpW6f0a.js";
import { o as withoutPluginInstallRecords, s as writePersistedInstalledPluginIndexInstallRecords, t as PLUGIN_INSTALLS_CONFIG_PATH } from "./installed-plugin-index-records-Z8-yA-Tm.js";
import { r as replaceConfigFile } from "./config--k_1dtUP.js";
//#region src/cli/plugins-install-record-commit.ts
function mergeUnsetPaths(left, right) {
	const merged = [...left ?? [], ...right ?? []];
	return merged.length > 0 ? merged : void 0;
}
async function commitPluginInstallRecordsWithWriter(params) {
	const previousInstallRecords = params.previousInstallRecords ?? await loadInstalledPluginIndexInstallRecords();
	await writePersistedInstalledPluginIndexInstallRecords(params.nextInstallRecords);
	try {
		await params.commit(params.nextConfig, {
			...params.writeOptions,
			unsetPaths: mergeUnsetPaths(params.writeOptions?.unsetPaths, [Array.from(PLUGIN_INSTALLS_CONFIG_PATH)])
		});
	} catch (error) {
		try {
			await writePersistedInstalledPluginIndexInstallRecords(previousInstallRecords);
		} catch (rollbackError) {
			throw new Error("Failed to commit plugin install records and could not restore the previous plugin index", { cause: rollbackError });
		}
		throw error;
	}
}
async function commitPluginInstallRecordsWithConfig(params) {
	await commitPluginInstallRecordsWithWriter({
		...params,
		commit: async (nextConfig, writeOptions) => {
			await replaceConfigFile({
				nextConfig,
				...params.baseHash !== void 0 ? { baseHash: params.baseHash } : {},
				...writeOptions ? { writeOptions } : {}
			});
		}
	});
}
async function commitConfigWriteWithPendingPluginInstalls(params) {
	const pendingInstallRecords = params.nextConfig.plugins?.installs ?? {};
	if (Object.keys(pendingInstallRecords).length === 0) {
		if (params.writeOptions) await params.commit(params.nextConfig, params.writeOptions);
		else await params.commit(params.nextConfig);
		return {
			config: params.nextConfig,
			installRecords: {},
			movedInstallRecords: false
		};
	}
	const previousInstallRecords = await loadInstalledPluginIndexInstallRecords();
	const nextInstallRecords = {
		...previousInstallRecords,
		...pendingInstallRecords
	};
	const strippedConfig = withoutPluginInstallRecords(params.nextConfig);
	await commitPluginInstallRecordsWithWriter({
		previousInstallRecords,
		nextInstallRecords,
		nextConfig: strippedConfig,
		...params.writeOptions ? { writeOptions: params.writeOptions } : {},
		commit: params.commit
	});
	return {
		config: strippedConfig,
		installRecords: nextInstallRecords,
		movedInstallRecords: true
	};
}
async function commitConfigWithPendingPluginInstalls(params) {
	return await commitConfigWriteWithPendingPluginInstalls({
		nextConfig: params.nextConfig,
		...params.writeOptions ? { writeOptions: params.writeOptions } : {},
		commit: async (nextConfig, writeOptions) => {
			await replaceConfigFile({
				nextConfig,
				...params.baseHash !== void 0 ? { baseHash: params.baseHash } : {},
				...writeOptions ? { writeOptions } : {}
			});
		}
	});
}
//#endregion
export { commitConfigWriteWithPendingPluginInstalls as n, commitPluginInstallRecordsWithConfig as r, commitConfigWithPendingPluginInstalls as t };
