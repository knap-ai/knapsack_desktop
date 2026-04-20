import { s as normalizeStringEntries } from "../string-normalization-xm3f27dv.js";
import { t as collectProviderDangerousNameMatchingScopes } from "../dangerous-name-matching-C88BNn_A.js";
import { n as formatPluginInstallPathIssue, t as detectPluginInstallPathIssue } from "../plugin-install-path-warnings-DcDQdIb1.js";
import { t as removePluginFromConfig } from "../uninstall-ZvkoimDi.js";
//#region src/config/channel-compat-normalization.ts
function asObjectRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function hasLegacyAccountStreamingAliases(value, match) {
	const accounts = asObjectRecord(value);
	if (!accounts) return false;
	return Object.values(accounts).some((account) => match(account));
}
function ensureNestedRecord(owner, key) {
	const existing = asObjectRecord(owner[key]);
	if (existing) return { ...existing };
	return {};
}
function allowFromListsMatch(left, right) {
	if (!Array.isArray(left) || !Array.isArray(right)) return false;
	const normalizedLeft = normalizeStringEntries(left);
	const normalizedRight = normalizeStringEntries(right);
	if (normalizedLeft.length !== normalizedRight.length) return false;
	return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}
function normalizeLegacyDmAliases(params) {
	let changed = false;
	let updated = params.entry;
	const rawDm = updated.dm;
	const dm = asObjectRecord(rawDm) ? structuredClone(rawDm) : null;
	let dmChanged = false;
	const topDmPolicy = updated.dmPolicy;
	const legacyDmPolicy = dm?.policy;
	if (topDmPolicy === void 0 && legacyDmPolicy !== void 0) {
		updated = {
			...updated,
			dmPolicy: legacyDmPolicy
		};
		changed = true;
		if (dm) {
			delete dm.policy;
			dmChanged = true;
		}
		params.changes.push(`Moved ${params.pathPrefix}.dm.policy → ${params.pathPrefix}.dmPolicy.`);
	} else if (topDmPolicy !== void 0 && legacyDmPolicy !== void 0 && topDmPolicy === legacyDmPolicy) {
		if (dm) {
			delete dm.policy;
			dmChanged = true;
			params.changes.push(`Removed ${params.pathPrefix}.dm.policy (dmPolicy already set).`);
		}
	}
	if (params.promoteAllowFrom !== false) {
		const topAllowFrom = updated.allowFrom;
		const legacyAllowFrom = dm?.allowFrom;
		if (topAllowFrom === void 0 && legacyAllowFrom !== void 0) {
			updated = {
				...updated,
				allowFrom: legacyAllowFrom
			};
			changed = true;
			if (dm) {
				delete dm.allowFrom;
				dmChanged = true;
			}
			params.changes.push(`Moved ${params.pathPrefix}.dm.allowFrom → ${params.pathPrefix}.allowFrom.`);
		} else if (topAllowFrom !== void 0 && legacyAllowFrom !== void 0 && allowFromListsMatch(topAllowFrom, legacyAllowFrom)) {
			if (dm) {
				delete dm.allowFrom;
				dmChanged = true;
				params.changes.push(`Removed ${params.pathPrefix}.dm.allowFrom (allowFrom already set).`);
			}
		}
	}
	if (dm && asObjectRecord(rawDm) && dmChanged) if (Object.keys(dm).length === 0) {
		if (updated.dm !== void 0) {
			const { dm: _ignored, ...rest } = updated;
			updated = rest;
			changed = true;
			params.changes.push(`Removed empty ${params.pathPrefix}.dm after migration.`);
		}
	} else {
		updated = {
			...updated,
			dm
		};
		changed = true;
	}
	return {
		entry: updated,
		changed
	};
}
function normalizeLegacyStreamingAliases(params) {
	const beforeStreaming = params.entry.streaming;
	const hadLegacyStreamMode = params.entry.streamMode !== void 0;
	const hasLegacyFlatFields = params.entry.chunkMode !== void 0 || params.entry.blockStreaming !== void 0 || params.entry.blockStreamingCoalesce !== void 0 || params.includePreviewChunk === true && params.entry.draftChunk !== void 0 || params.entry.nativeStreaming !== void 0;
	if (!(hadLegacyStreamMode || typeof beforeStreaming === "boolean" || typeof beforeStreaming === "string" || hasLegacyFlatFields)) return {
		entry: params.entry,
		changed: false
	};
	let updated = { ...params.entry };
	let changed = false;
	const streaming = ensureNestedRecord(updated, "streaming");
	const block = ensureNestedRecord(streaming, "block");
	const preview = ensureNestedRecord(streaming, "preview");
	if ((hadLegacyStreamMode || typeof beforeStreaming === "boolean" || typeof beforeStreaming === "string") && streaming.mode === void 0) {
		streaming.mode = params.resolvedMode;
		if (hadLegacyStreamMode) params.changes.push(`Moved ${params.pathPrefix}.streamMode → ${params.pathPrefix}.streaming.mode (${params.resolvedMode}).`);
		else if (typeof beforeStreaming === "boolean") params.changes.push(`Moved ${params.pathPrefix}.streaming (boolean) → ${params.pathPrefix}.streaming.mode (${params.resolvedMode}).`);
		else if (typeof beforeStreaming === "string") params.changes.push(`Moved ${params.pathPrefix}.streaming (scalar) → ${params.pathPrefix}.streaming.mode (${params.resolvedMode}).`);
		changed = true;
	}
	if (hadLegacyStreamMode) {
		delete updated.streamMode;
		changed = true;
	}
	if (updated.chunkMode !== void 0 && streaming.chunkMode === void 0) {
		streaming.chunkMode = updated.chunkMode;
		delete updated.chunkMode;
		params.changes.push(`Moved ${params.pathPrefix}.chunkMode → ${params.pathPrefix}.streaming.chunkMode.`);
		changed = true;
	}
	if (updated.blockStreaming !== void 0 && block.enabled === void 0) {
		block.enabled = updated.blockStreaming;
		delete updated.blockStreaming;
		params.changes.push(`Moved ${params.pathPrefix}.blockStreaming → ${params.pathPrefix}.streaming.block.enabled.`);
		changed = true;
	}
	if (params.includePreviewChunk === true && updated.draftChunk !== void 0 && preview.chunk === void 0) {
		preview.chunk = updated.draftChunk;
		delete updated.draftChunk;
		params.changes.push(`Moved ${params.pathPrefix}.draftChunk → ${params.pathPrefix}.streaming.preview.chunk.`);
		changed = true;
	}
	if (updated.blockStreamingCoalesce !== void 0 && block.coalesce === void 0) {
		block.coalesce = updated.blockStreamingCoalesce;
		delete updated.blockStreamingCoalesce;
		params.changes.push(`Moved ${params.pathPrefix}.blockStreamingCoalesce → ${params.pathPrefix}.streaming.block.coalesce.`);
		changed = true;
	}
	if (updated.nativeStreaming !== void 0 && streaming.nativeTransport === void 0 && params.resolvedNativeTransport !== void 0) {
		streaming.nativeTransport = params.resolvedNativeTransport;
		delete updated.nativeStreaming;
		params.changes.push(`Moved ${params.pathPrefix}.nativeStreaming → ${params.pathPrefix}.streaming.nativeTransport.`);
		changed = true;
	} else if (typeof beforeStreaming === "boolean" && streaming.nativeTransport === void 0 && params.resolvedNativeTransport !== void 0) {
		streaming.nativeTransport = params.resolvedNativeTransport;
		params.changes.push(`Moved ${params.pathPrefix}.streaming (boolean) → ${params.pathPrefix}.streaming.nativeTransport.`);
		changed = true;
	}
	if (Object.keys(preview).length > 0) streaming.preview = preview;
	if (Object.keys(block).length > 0) streaming.block = block;
	updated.streaming = streaming;
	if (hadLegacyStreamMode && params.resolvedMode === "off" && params.offModeLegacyNotice !== void 0) params.changes.push(params.offModeLegacyNotice(params.pathPrefix));
	return {
		entry: updated,
		changed
	};
}
function hasLegacyStreamingAliases(value, options) {
	const entry = asObjectRecord(value);
	if (!entry) return false;
	return entry.streamMode !== void 0 || typeof entry.streaming === "boolean" || typeof entry.streaming === "string" || entry.chunkMode !== void 0 || entry.blockStreaming !== void 0 || entry.blockStreamingCoalesce !== void 0 || options?.includePreviewChunk === true && entry.draftChunk !== void 0 || options?.includeNativeTransport === true && entry.nativeStreaming !== void 0;
}
//#endregion
export { asObjectRecord, collectProviderDangerousNameMatchingScopes, detectPluginInstallPathIssue, formatPluginInstallPathIssue, hasLegacyAccountStreamingAliases, hasLegacyStreamingAliases, normalizeLegacyDmAliases, normalizeLegacyStreamingAliases, removePluginFromConfig };
