//#region src/channels/targets.ts
function normalizeTargetId(kind, id) {
	return `${kind}:${id}`.toLowerCase();
}
function buildMessagingTarget(kind, id, raw) {
	return {
		kind,
		id,
		raw,
		normalized: normalizeTargetId(kind, id)
	};
}
function ensureTargetId(params) {
	if (!params.pattern.test(params.candidate)) throw new Error(params.errorMessage);
	return params.candidate;
}
function requireTargetKind(params) {
	const kindLabel = params.kind;
	if (!params.target) throw new Error(`${params.platform} ${kindLabel} id is required.`);
	if (params.target.kind !== params.kind) throw new Error(`${params.platform} ${kindLabel} id is required (use ${kindLabel}:<id>).`);
	return params.target.id;
}

//#endregion
export { ensureTargetId as n, requireTargetKind as r, buildMessagingTarget as t };