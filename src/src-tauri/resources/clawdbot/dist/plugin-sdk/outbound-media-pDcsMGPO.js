import { ei as loadWebMedia } from "./thread-bindings-SYAnWHuW.js";
//#region src/plugin-sdk/outbound-media.ts
async function loadOutboundMediaFromUrl(mediaUrl, options = {}) {
	return await loadWebMedia(mediaUrl, {
		maxBytes: options.maxBytes,
		localRoots: options.mediaLocalRoots
	});
}
//#endregion
export { loadOutboundMediaFromUrl as t };
