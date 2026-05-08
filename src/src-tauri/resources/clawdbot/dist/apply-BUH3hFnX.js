import { o as markMigrationItemSkipped, u as summarizeMigrationItems } from "./migration-W015rITt.js";
import { n as copyMigrationFileItem, r as writeMigrationReport, t as archiveMigrationItem } from "./migration-runtime-0uuJvY2B.js";
import { t as appendItem } from "./helpers-BQy9WYxr.js";
import { n as applyManualItem, t as applyConfigItem } from "./config-SJYmAKUS.js";
import { t as applyModelItem } from "./model-CilJWxv-.js";
import { t as applySecretItem } from "./secrets-D7CS9dFq.js";
import { t as resolveTargets } from "./targets-CYTUDH7E.js";
import { t as buildHermesPlan } from "./plan-By7E04-Z.js";
import path from "node:path";
//#region extensions/migrate-hermes/apply.ts
const HERMES_REASON_BLOCKED_BY_APPLY_CONFLICT = "blocked by earlier apply conflict";
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
async function applyHermesPlan(params) {
	const plan = params.plan ?? await buildHermesPlan(params.ctx);
	const reportDir = params.ctx.reportDir ?? path.join(params.ctx.stateDir, "migration", "hermes");
	const targets = resolveTargets(params.ctx);
	const items = [];
	const runtime = withCachedConfigRuntime(params.ctx.runtime ?? params.runtime, params.ctx.config);
	const applyCtx = {
		...params.ctx,
		runtime
	};
	let blockedByApplyConflict = false;
	for (const item of plan.items) {
		if (item.status !== "planned") {
			items.push(item);
			continue;
		}
		if (blockedByApplyConflict) {
			items.push(markMigrationItemSkipped(item, HERMES_REASON_BLOCKED_BY_APPLY_CONFLICT));
			continue;
		}
		let appliedItem;
		if (item.id === "config:default-model") appliedItem = await applyModelItem(applyCtx, item);
		else if (item.kind === "config") appliedItem = await applyConfigItem(applyCtx, item);
		else if (item.kind === "manual") appliedItem = applyManualItem(item);
		else if (item.action === "archive") appliedItem = await archiveMigrationItem(item, reportDir);
		else if (item.kind === "secret") appliedItem = await applySecretItem(params.ctx, item, targets);
		else if (item.action === "append") appliedItem = await appendItem(item);
		else appliedItem = await copyMigrationFileItem(item, reportDir, { overwrite: params.ctx.overwrite });
		items.push(appliedItem);
		if (item.kind === "config" && (appliedItem.status === "conflict" || appliedItem.status === "error")) blockedByApplyConflict = true;
	}
	const result = {
		...plan,
		items,
		summary: summarizeMigrationItems(items),
		backupPath: params.ctx.backupPath,
		reportDir
	};
	await writeMigrationReport(result, { title: "Hermes Migration Report" });
	return result;
}
//#endregion
export { applyHermesPlan as t };
