import { t as loadWebMedia } from "./web-media-B2LIgj-X.js";
import { t as buildOutboundMediaLoadOptions } from "./load-options-u_-v12gr.js";
import "./web-media-BFBS6C3r.js";
//#region src/plugin-sdk/outbound-media.ts
/** Load outbound media from a remote URL or approved local path using the shared web-media policy. */
async function loadOutboundMediaFromUrl(mediaUrl, options = {}) {
	return await loadWebMedia(mediaUrl, buildOutboundMediaLoadOptions({
		maxBytes: options.maxBytes,
		mediaAccess: options.mediaAccess,
		mediaLocalRoots: options.mediaLocalRoots,
		mediaReadFile: options.mediaReadFile
	}));
}
//#endregion
export { loadOutboundMediaFromUrl as t };
