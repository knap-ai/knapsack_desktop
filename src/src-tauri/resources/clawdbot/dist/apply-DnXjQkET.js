import { u as summarizeMigrationItems } from "./migration-W015rITt.js";
import { n as copyMigrationFileItem, r as writeMigrationReport, t as archiveMigrationItem } from "./migration-runtime-0uuJvY2B.js";
import { t as appendItem } from "./helpers-89ezfCfr.js";
import { n as applyManualItem, t as applyConfigItem } from "./config-GAfnc7V-.js";
import { t as applyGeneratedSkillItem } from "./skills-BejVbSWV.js";
import { t as buildClaudePlan } from "./plan-CGKYcQ3w.js";
import path from "node:path";
//#region extensions/migrate-claude/apply.ts
function withCachedConfigRuntime(runtime, fallbackConfig) {
	if (!runtime) return;
	const configApi = runtime.config;
	if (!configApi?.current || !configApi.mutateConfigFile) return runtime;
	let cachedConfig;
	const current = () => {
		cachedConfig ??= structuredClone(configApi.current() ?? fallbackConfig);
		return cachedConfig;
	};
	return {
		...runtime,
		config: {
			...runtime.config,
			current,
			mutateConfigFile: async (params) => {
				const result = await configApi.mutateConfigFile({
					...params,
					mutate: async (draft, context) => {
						const mutationResult = await params.mutate(draft, context);
						cachedConfig = structuredClone(draft);
						return mutationResult;
					}
				});
				cachedConfig = structuredClone(result.nextConfig);
				return result;
			},
			...configApi.replaceConfigFile ? { replaceConfigFile: async (params) => {
				const result = await configApi.replaceConfigFile(params);
				cachedConfig = structuredClone(result.nextConfig);
				return result;
			} } : {}
		}
	};
}
async function applyClaudePlan(params) {
	const plan = params.plan ?? await buildClaudePlan(params.ctx);
	const reportDir = params.ctx.reportDir ?? path.join(params.ctx.stateDir, "migration", "claude");
	const runtime = withCachedConfigRuntime(params.ctx.runtime ?? params.runtime, params.ctx.config);
	const applyCtx = {
		...params.ctx,
		runtime
	};
	const items = [];
	for (const item of plan.items) {
		if (item.status !== "planned") {
			items.push(item);
			continue;
		}
		if (item.kind === "config") items.push(await applyConfigItem(applyCtx, item));
		else if (item.kind === "manual") items.push(applyManualItem(item));
		else if (item.action === "archive") items.push(await archiveMigrationItem(item, reportDir));
		else if (item.action === "append") items.push(await appendItem(item));
		else if (item.action === "create" && item.kind === "skill") items.push(await applyGeneratedSkillItem(item, { overwrite: params.ctx.overwrite }));
		else items.push(await copyMigrationFileItem(item, reportDir, { overwrite: params.ctx.overwrite }));
	}
	const result = {
		...plan,
		items,
		summary: summarizeMigrationItems(items),
		backupPath: params.ctx.backupPath,
		reportDir
	};
	await writeMigrationReport(result, { title: "Claude Migration Report" });
	return result;
}
//#endregion
export { applyClaudePlan as t };
