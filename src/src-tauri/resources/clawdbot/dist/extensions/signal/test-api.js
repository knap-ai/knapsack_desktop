import { c as resolveTextChunkLimit } from "../../chunk-D6CtZg6q.js";
import { t as resolveOutboundSendDep } from "../../send-deps-DLS-OK3u.js";
import { t as resolveMarkdownTableMode } from "../../markdown-tables-DAbwMp5F.js";
import "../../config-runtime-CmISCurQ.js";
import "../../reply-runtime-DxFWfQpm.js";
import "../../outbound-runtime-D_hcnwUl.js";
import { n as createScopedChannelMediaMaxBytesResolver } from "../../media-runtime-DdCWeFPm.js";
import { i as createAttachedChannelResultAdapter, n as attachChannelToResults, t as attachChannelToResult } from "../../channel-send-result-COXGPSxL.js";
import { a as markdownToSignalTextChunks, t as sendMessageSignal } from "../../send-AGNkLmlC.js";
//#region extensions/signal/src/outbound-adapter.ts
function resolveSignalSender(deps) {
	return resolveOutboundSendDep(deps, "signal") ?? sendMessageSignal;
}
const resolveSignalMaxBytes = createScopedChannelMediaMaxBytesResolver("signal");
function inferSignalTableMode(params) {
	return resolveMarkdownTableMode({
		cfg: params.cfg,
		channel: "signal",
		accountId: params.accountId ?? void 0
	});
}
const signalOutbound = {
	deliveryMode: "direct",
	chunker: (text, _limit) => text.split(/\n{2,}/).flatMap((chunk) => chunk ? [chunk] : []),
	chunkerMode: "text",
	textChunkLimit: 4e3,
	sendFormattedText: async ({ cfg, to, text, accountId, deps, abortSignal }) => {
		const send = resolveSignalSender(deps);
		const maxBytes = resolveSignalMaxBytes({
			cfg,
			accountId: accountId ?? void 0
		});
		const limit = resolveTextChunkLimit(cfg, "signal", accountId ?? void 0, { fallbackLimit: 4e3 });
		const tableMode = inferSignalTableMode({
			cfg,
			accountId
		});
		let chunks = limit === void 0 ? markdownToSignalTextChunks(text, Number.POSITIVE_INFINITY, { tableMode }) : markdownToSignalTextChunks(text, limit, { tableMode });
		if (chunks.length === 0 && text) chunks = [{
			text,
			styles: []
		}];
		const results = [];
		for (const chunk of chunks) {
			abortSignal?.throwIfAborted();
			const result = await send(to, chunk.text, {
				cfg,
				maxBytes,
				accountId: accountId ?? void 0,
				textMode: "plain",
				textStyles: chunk.styles
			});
			results.push(result);
		}
		return attachChannelToResults("signal", results);
	},
	sendFormattedMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, mediaReadFile, accountId, deps, abortSignal }) => {
		abortSignal?.throwIfAborted();
		const send = resolveSignalSender(deps);
		const maxBytes = resolveSignalMaxBytes({
			cfg,
			accountId: accountId ?? void 0
		});
		const tableMode = inferSignalTableMode({
			cfg,
			accountId
		});
		const formatted = markdownToSignalTextChunks(text, Number.POSITIVE_INFINITY, { tableMode })[0] ?? {
			text,
			styles: []
		};
		return attachChannelToResult("signal", await send(to, formatted.text, {
			cfg,
			mediaUrl,
			maxBytes,
			accountId: accountId ?? void 0,
			textMode: "plain",
			textStyles: formatted.styles,
			mediaLocalRoots,
			mediaReadFile
		}));
	},
	...createAttachedChannelResultAdapter({
		channel: "signal",
		sendText: async ({ cfg, to, text, accountId, deps }) => {
			return await resolveSignalSender(deps)(to, text, {
				cfg,
				maxBytes: resolveSignalMaxBytes({
					cfg,
					accountId: accountId ?? void 0
				}),
				accountId: accountId ?? void 0
			});
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, mediaReadFile, accountId, deps }) => {
			return await resolveSignalSender(deps)(to, text, {
				cfg,
				mediaUrl,
				maxBytes: resolveSignalMaxBytes({
					cfg,
					accountId: accountId ?? void 0
				}),
				accountId: accountId ?? void 0,
				mediaLocalRoots,
				mediaReadFile
			});
		}
	})
};
//#endregion
export { signalOutbound };
