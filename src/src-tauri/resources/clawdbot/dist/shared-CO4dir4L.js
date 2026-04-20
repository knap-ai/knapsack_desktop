import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { l as readConfigFileSnapshot } from "./io-5pxHCi7V.js";
import { c as normalizeAgentId } from "./session-key-Bh1lMwK5.js";
import { r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { r as toAgentModelListLike } from "./model-input-DFbXtnkw.js";
import { g as listAgentIds } from "./agent-scope-KFH9bkHi.js";
import { r as replaceConfigFile } from "./config-Q9XZc_2I.js";
import { n as formatConfigIssueLines } from "./issue-format-EKtDEAmx.js";
import { d as legacyModelKey, f as modelKey } from "./model-selection-cli-_3Gn8Wcd.js";
import { i as buildModelAliasIndex, m as resolveModelRefFromString } from "./model-selection-CTdyYoio.js";
//#region src/commands/models/shared.ts
const ensureFlagCompatibility = (opts) => {
	if (opts.json && opts.plain) throw new Error("Choose either --json or --plain, not both.");
};
const formatTokenK = (value) => {
	if (!value || !Number.isFinite(value)) return "-";
	if (value < 1024) return `${Math.round(value)}`;
	return `${Math.round(value / 1024)}k`;
};
const formatMs = (value) => {
	if (value === null || value === void 0) return "-";
	if (!Number.isFinite(value)) return "-";
	if (value < 1e3) return `${Math.round(value)}ms`;
	return `${Math.round(value / 100) / 10}s`;
};
const isLocalBaseUrl = (baseUrl) => {
	try {
		const host = normalizeLowercaseStringOrEmpty(new URL(baseUrl).hostname);
		return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local");
	} catch {
		return false;
	}
};
async function loadValidConfigOrThrow() {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) {
		const issues = formatConfigIssueLines(snapshot.issues, "-").join("\n");
		throw new Error(`Invalid config at ${snapshot.path}\n${issues}`);
	}
	return snapshot.runtimeConfig ?? snapshot.config;
}
async function updateConfig(mutator) {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) {
		const issues = formatConfigIssueLines(snapshot.issues, "-").join("\n");
		throw new Error(`Invalid config at ${snapshot.path}\n${issues}`);
	}
	const next = mutator(structuredClone(snapshot.sourceConfig ?? snapshot.config));
	await replaceConfigFile({
		nextConfig: next,
		baseHash: snapshot.hash
	});
	return next;
}
function resolveModelTarget(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	const resolved = resolveModelRefFromString({
		raw: params.raw,
		defaultProvider: DEFAULT_PROVIDER,
		aliasIndex
	});
	if (!resolved) throw new Error(`Invalid model reference: ${params.raw}`);
	return resolved.ref;
}
function resolveModelKeysFromEntries(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	return params.entries.map((entry) => resolveModelRefFromString({
		raw: entry,
		defaultProvider: DEFAULT_PROVIDER,
		aliasIndex
	})).filter((entry) => Boolean(entry)).map((entry) => modelKey(entry.ref.provider, entry.ref.model));
}
function normalizeAlias(alias) {
	const trimmed = alias.trim();
	if (!trimmed) throw new Error("Alias cannot be empty.");
	if (!/^[A-Za-z0-9_.:-]+$/.test(trimmed)) throw new Error("Alias must use letters, numbers, dots, underscores, colons, or dashes.");
	return trimmed;
}
function resolveKnownAgentId(params) {
	const raw = params.rawAgentId?.trim();
	if (!raw) return;
	const agentId = normalizeAgentId(raw);
	if (!listAgentIds(params.cfg).includes(agentId)) throw new Error(`Unknown agent id "${raw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	return agentId;
}
function upsertCanonicalModelConfigEntry(models, params) {
	const key = modelKey(params.provider, params.model);
	const legacyKey = legacyModelKey(params.provider, params.model);
	if (!models[key]) if (legacyKey && models[legacyKey]) models[key] = models[legacyKey];
	else models[key] = {};
	if (legacyKey) delete models[legacyKey];
	return key;
}
function mergePrimaryFallbackConfig(existing, patch) {
	const next = { ...existing && typeof existing === "object" ? existing : void 0 };
	if (patch.primary !== void 0) next.primary = patch.primary;
	if (patch.fallbacks !== void 0) next.fallbacks = patch.fallbacks;
	return next;
}
function applyDefaultModelPrimaryUpdate(params) {
	const resolved = resolveModelTarget({
		raw: params.modelRaw,
		cfg: params.cfg
	});
	const nextModels = { ...params.cfg.agents?.defaults?.models };
	const key = upsertCanonicalModelConfigEntry(nextModels, resolved);
	const defaults = params.cfg.agents?.defaults ?? {};
	const existing = toAgentModelListLike(defaults[params.field]);
	return {
		...params.cfg,
		agents: {
			...params.cfg.agents,
			defaults: {
				...defaults,
				[params.field]: mergePrimaryFallbackConfig(existing, { primary: key }),
				models: nextModels
			}
		}
	};
}
/**
* Model key format: "provider/model"
*
* The model key is displayed in `/model status` and used to reference models.
* When using `/model <key>`, use the exact format shown (e.g., "openrouter/moonshotai/kimi-k2").
*
* For providers with hierarchical model IDs (e.g., OpenRouter), the model ID may include
* sub-providers (e.g., "moonshotai/kimi-k2"), resulting in a key like "openrouter/moonshotai/kimi-k2".
*/
//#endregion
export { isLocalBaseUrl as a, normalizeAlias as c, resolveModelTarget as d, updateConfig as f, formatTokenK as i, resolveKnownAgentId as l, ensureFlagCompatibility as n, loadValidConfigOrThrow as o, upsertCanonicalModelConfigEntry as p, formatMs as r, mergePrimaryFallbackConfig as s, applyDefaultModelPrimaryUpdate as t, resolveModelKeysFromEntries as u };
