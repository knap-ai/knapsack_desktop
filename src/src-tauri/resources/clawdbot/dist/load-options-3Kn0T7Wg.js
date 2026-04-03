//#region src/media/load-options.ts
function resolveOutboundMediaLocalRoots(mediaLocalRoots) {
	return mediaLocalRoots && mediaLocalRoots.length > 0 ? mediaLocalRoots : void 0;
}
function resolveOutboundMediaAccess(params = {}) {
	const localRoots = resolveOutboundMediaLocalRoots(params.mediaAccess?.localRoots ?? params.mediaLocalRoots);
	const readFile = params.mediaAccess?.readFile ?? params.mediaReadFile;
	const workspaceDir = params.mediaAccess?.workspaceDir;
	if (!localRoots && !readFile && !workspaceDir) return;
	return {
		...localRoots ? { localRoots } : {},
		...readFile ? { readFile } : {},
		...workspaceDir ? { workspaceDir } : {}
	};
}
function buildOutboundMediaLoadOptions(params = {}) {
	const mediaAccess = resolveOutboundMediaAccess(params);
	const workspaceDir = mediaAccess?.workspaceDir ?? params.workspaceDir;
	if (mediaAccess?.readFile) return {
		...params.maxBytes !== void 0 ? { maxBytes: params.maxBytes } : {},
		localRoots: "any",
		readFile: mediaAccess.readFile,
		hostReadCapability: true,
		...params.optimizeImages !== void 0 ? { optimizeImages: params.optimizeImages } : {},
		...workspaceDir ? { workspaceDir } : {}
	};
	const localRoots = mediaAccess?.localRoots;
	return {
		...params.maxBytes !== void 0 ? { maxBytes: params.maxBytes } : {},
		...localRoots ? { localRoots } : {},
		...params.optimizeImages !== void 0 ? { optimizeImages: params.optimizeImages } : {},
		...workspaceDir ? { workspaceDir } : {}
	};
}
//#endregion
export { resolveOutboundMediaAccess as n, resolveOutboundMediaLocalRoots as r, buildOutboundMediaLoadOptions as t };
