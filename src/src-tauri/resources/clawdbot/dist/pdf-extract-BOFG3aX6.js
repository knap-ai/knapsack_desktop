import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { c as resolveEffectivePluginActivationState, n as createPluginActivationSource, o as normalizePluginsConfig } from "./config-state-Bw_lAn0M.js";
import { t as loadBundledPluginPublicArtifactModuleSync } from "./public-surface-loader-Q3U25ebK.js";
import { n as loadPluginManifestRegistryForPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
import { n as resolveBundledPluginCompatibleLoadValues } from "./activation-context-BoOFvRID.js";
//#region src/plugins/document-extractor-public-artifacts.ts
const DOCUMENT_EXTRACTOR_ARTIFACT_CANDIDATES = ["document-extractor.js", "document-extractor-api.js"];
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isDocumentExtractorPlugin(value) {
	return isRecord(value) && typeof value.id === "string" && typeof value.label === "string" && Array.isArray(value.mimeTypes) && value.mimeTypes.every((mimeType) => typeof mimeType === "string" && mimeType.trim()) && (value.autoDetectOrder === void 0 || typeof value.autoDetectOrder === "number") && typeof value.extract === "function";
}
function tryLoadBundledPublicArtifactModule(params) {
	for (const artifactBasename of DOCUMENT_EXTRACTOR_ARTIFACT_CANDIDATES) try {
		return loadBundledPluginPublicArtifactModuleSync({
			dirName: params.dirName,
			artifactBasename
		});
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("Unable to resolve bundled plugin public surface ")) continue;
		throw error;
	}
	return null;
}
function collectExtractorFactories(mod) {
	const extractors = [];
	const errors = [];
	for (const [name, exported] of Object.entries(mod).toSorted(([left], [right]) => left.localeCompare(right))) {
		if (typeof exported !== "function" || exported.length !== 0 || !name.startsWith("create") || !name.endsWith("DocumentExtractor")) continue;
		let candidate;
		try {
			candidate = exported();
		} catch (error) {
			errors.push(error);
			continue;
		}
		if (isDocumentExtractorPlugin(candidate)) extractors.push(candidate);
	}
	return {
		extractors,
		errors
	};
}
function loadBundledDocumentExtractorEntriesFromDir(params) {
	const mod = tryLoadBundledPublicArtifactModule({ dirName: params.dirName });
	if (!mod) return null;
	const { extractors, errors } = collectExtractorFactories(mod);
	if (extractors.length === 0) {
		if (errors.length > 0) throw new Error(`Unable to initialize document extractors for plugin ${params.pluginId}`, { cause: errors.length === 1 ? errors[0] : new AggregateError(errors) });
		return null;
	}
	return extractors.map((extractor) => Object.assign({}, extractor, { pluginId: params.pluginId }));
}
//#endregion
//#region src/plugins/document-extractors.runtime.ts
function compareExtractors(left, right) {
	const leftOrder = left.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
	const rightOrder = right.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
	if (leftOrder !== rightOrder) return leftOrder - rightOrder;
	return left.id.localeCompare(right.id) || left.pluginId.localeCompare(right.pluginId);
}
function listDocumentExtractorPluginIds(params) {
	const onlyPluginIdSet = params.onlyPluginIds && params.onlyPluginIds.length > 0 ? new Set(params.onlyPluginIds) : null;
	return params.plugins.filter((plugin) => plugin.origin === "bundled" && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && (plugin.contracts?.documentExtractors?.length ?? 0) > 0).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function loadDocumentExtractorManifestRecords(params) {
	return loadPluginManifestRegistryForPluginRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		includeDisabled: true
	}).plugins;
}
function resolveEnabledBundledDocumentExtractorPlugins(params) {
	if (params.config?.plugins?.enabled === false) return [];
	let manifestRecords;
	const loadManifestRecords = (config) => {
		manifestRecords ??= loadDocumentExtractorManifestRecords({
			config,
			workspaceDir: params.workspaceDir,
			env: params.env
		});
		return manifestRecords;
	};
	const activation = resolveBundledPluginCompatibleLoadValues({
		rawConfig: params.config,
		env: params.env,
		workspaceDir: params.workspaceDir,
		onlyPluginIds: params.onlyPluginIds,
		applyAutoEnable: true,
		compatMode: {
			allowlist: false,
			enablement: "allowlist",
			vitest: true
		},
		resolveCompatPluginIds: (compatParams) => listDocumentExtractorPluginIds({
			plugins: loadManifestRecords(compatParams.config),
			onlyPluginIds: compatParams.onlyPluginIds
		})
	});
	const normalizedPlugins = normalizePluginsConfig(activation.config?.plugins);
	const activationSource = createPluginActivationSource({ config: activation.activationSourceConfig });
	const onlyPluginIdSet = params.onlyPluginIds && params.onlyPluginIds.length > 0 ? new Set(params.onlyPluginIds) : null;
	return loadManifestRecords(activation.config).filter((plugin) => {
		if (plugin.origin !== "bundled" || onlyPluginIdSet && !onlyPluginIdSet.has(plugin.id) || (plugin.contracts?.documentExtractors?.length ?? 0) === 0) return false;
		return resolveEffectivePluginActivationState({
			id: plugin.id,
			origin: plugin.origin,
			config: normalizedPlugins,
			rootConfig: activation.config,
			enabledByDefault: plugin.enabledByDefault,
			activationSource
		}).enabled;
	});
}
function resolveExplicitAllowedDocumentExtractorPluginIds(params) {
	const allow = params.config?.plugins?.allow;
	if (!Array.isArray(allow) || allow.length === 0) return null;
	const onlyPluginIdSet = params.onlyPluginIds && params.onlyPluginIds.length > 0 ? new Set(params.onlyPluginIds) : null;
	const deniedPluginIds = new Set(params.config?.plugins?.deny ?? []);
	const entries = params.config?.plugins?.entries ?? {};
	return [...new Set(allow.map((pluginId) => pluginId.trim()).filter(Boolean).filter((pluginId) => !onlyPluginIdSet || onlyPluginIdSet.has(pluginId)).filter((pluginId) => !deniedPluginIds.has(pluginId)).filter((pluginId) => entries[pluginId]?.enabled !== false))].toSorted((left, right) => left.localeCompare(right));
}
function resolvePluginDocumentExtractors(params) {
	const extractors = [];
	const loadErrors = [];
	const pluginIds = resolveExplicitAllowedDocumentExtractorPluginIds({
		config: params?.config,
		onlyPluginIds: params?.onlyPluginIds
	}) ?? resolveEnabledBundledDocumentExtractorPlugins({
		config: params?.config,
		workspaceDir: params?.workspaceDir,
		env: params?.env,
		onlyPluginIds: params?.onlyPluginIds
	}).map((plugin) => plugin.id);
	for (const pluginId of pluginIds) {
		let loaded;
		try {
			loaded = loadBundledDocumentExtractorEntriesFromDir({
				dirName: pluginId,
				pluginId
			});
		} catch (error) {
			loadErrors.push(error);
			continue;
		}
		if (loaded) extractors.push(...loaded);
	}
	if (extractors.length === 0 && loadErrors.length > 0) throw new Error("Unable to load document extractor plugins", { cause: loadErrors.length === 1 ? loadErrors[0] : new AggregateError(loadErrors) });
	return extractors.toSorted(compareExtractors);
}
//#endregion
//#region src/media/document-extractors.runtime.ts
let extractorPromise;
const extractorPromisesByConfig = /* @__PURE__ */ new WeakMap();
async function loadDocumentExtractors(config) {
	if (config) {
		const cached = extractorPromisesByConfig.get(config);
		if (cached) return await cached;
		const promise = Promise.resolve().then(() => resolvePluginDocumentExtractors({ config }));
		extractorPromisesByConfig.set(config, promise);
		promise.catch(() => {
			extractorPromisesByConfig.delete(config);
		});
		return await promise;
	}
	extractorPromise ??= Promise.resolve(resolvePluginDocumentExtractors());
	return await extractorPromise;
}
async function extractDocumentContent(params) {
	const mimeType = normalizeLowercaseStringOrEmpty(params.mimeType);
	const extractors = await loadDocumentExtractors(params.config);
	const request = {
		buffer: params.buffer,
		mimeType: params.mimeType,
		maxPages: params.maxPages,
		maxPixels: params.maxPixels,
		minTextChars: params.minTextChars,
		...params.pageNumbers ? { pageNumbers: params.pageNumbers } : {},
		...params.onImageExtractionError ? { onImageExtractionError: params.onImageExtractionError } : {}
	};
	const errors = [];
	for (const extractor of extractors) {
		if (!extractor.mimeTypes.map((entry) => normalizeLowercaseStringOrEmpty(entry)).includes(mimeType)) continue;
		try {
			const result = await extractor.extract(request);
			if (result) return {
				...result,
				extractor: extractor.id
			};
		} catch (error) {
			errors.push(error);
		}
	}
	if (errors.length > 0) throw new Error(`Document extraction failed for ${mimeType || "unknown MIME type"}`, { cause: errors.length === 1 ? errors[0] : new AggregateError(errors) });
	return null;
}
//#endregion
//#region src/media/pdf-extract.ts
async function extractPdfContent(params) {
	const extracted = await extractDocumentContent({
		buffer: params.buffer,
		mimeType: "application/pdf",
		maxPages: params.maxPages,
		maxPixels: params.maxPixels,
		minTextChars: params.minTextChars,
		...params.pageNumbers ? { pageNumbers: params.pageNumbers } : {},
		...params.config ? { config: params.config } : {},
		...params.onImageExtractionError ? { onImageExtractionError: params.onImageExtractionError } : {}
	});
	if (!extracted) throw new Error("PDF extraction disabled or unavailable: enable the document-extract plugin to process application/pdf files.");
	return {
		text: extracted.text,
		images: extracted.images
	};
}
//#endregion
export { extractPdfContent as t };
