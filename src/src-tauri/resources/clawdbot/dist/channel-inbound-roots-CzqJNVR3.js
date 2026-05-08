import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { t as loadBundledPluginPublicArtifactModuleSync } from "./public-surface-loader-Q3U25ebK.js";
//#region src/media/channel-inbound-roots.ts
const mediaContractApiByResolver = /* @__PURE__ */ new Map();
function mediaContractCacheKey(channelId, resolver) {
	return `${channelId}:${resolver}`;
}
function loadChannelMediaContractApi(channelId, resolver) {
	const cacheKey = mediaContractCacheKey(channelId, resolver);
	if (mediaContractApiByResolver.has(cacheKey)) return mediaContractApiByResolver.get(cacheKey) ?? void 0;
	try {
		const loaded = loadBundledPluginPublicArtifactModuleSync({
			dirName: channelId,
			artifactBasename: "media-contract-api.js"
		});
		if (typeof loaded[resolver] === "function") {
			mediaContractApiByResolver.set(cacheKey, loaded);
			return loaded;
		}
	} catch (error) {
		if (!(error instanceof Error && error.message.startsWith("Unable to resolve bundled plugin public surface "))) throw error;
	}
	mediaContractApiByResolver.set(cacheKey, null);
}
function findChannelMediaContractApi(channelId, resolver) {
	const normalized = normalizeOptionalLowercaseString(channelId);
	if (!normalized) return;
	return loadChannelMediaContractApi(normalized, resolver);
}
function resolveChannelInboundAttachmentRoots(params) {
	const contractApi = findChannelMediaContractApi(params.ctx.Surface ?? params.ctx.Provider, "resolveInboundAttachmentRoots");
	if (contractApi?.resolveInboundAttachmentRoots) return contractApi.resolveInboundAttachmentRoots({
		cfg: params.cfg,
		accountId: params.ctx.AccountId
	});
}
function resolveChannelRemoteInboundAttachmentRoots(params) {
	const contractApi = findChannelMediaContractApi(params.ctx.Surface ?? params.ctx.Provider, "resolveRemoteInboundAttachmentRoots");
	if (contractApi?.resolveRemoteInboundAttachmentRoots) return contractApi.resolveRemoteInboundAttachmentRoots({
		cfg: params.cfg,
		accountId: params.ctx.AccountId
	});
}
//#endregion
export { resolveChannelRemoteInboundAttachmentRoots as n, resolveChannelInboundAttachmentRoots as t };
