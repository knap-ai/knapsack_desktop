import { a as shouldLogVerbose, r as logVerbose } from "./globals-DeRFSEIV.js";
import "./mime-Zn7U6BSf.js";
import "./image-ops-DFAxz8Ri.js";
import { x as sendTextMediaPayload } from "./reply-payload-COWCxmsk.js";
import "./local-roots-BT2K9A8q.js";
import "./store-B9O3InEv.js";
import "./local-media-access-r3yk8NLU.js";
import "./fetch-p2uITHmD.js";
import "./resolve-uanx1GVd.js";
import "./image-runtime-tqu_Maks.js";
import { a as runCapability, i as resolveMediaAttachmentLocalRoots, l as isAudioAttachment, o as createMediaAttachmentCache, s as normalizeMediaAttachments, t as buildProviderRegistry } from "./runner-DxwBmbs2.js";
import "./runner.entries-aiQXQXfz.js";
import { a as chunkText } from "./chunk-CpCakLTa.js";
import "./audio-V_M8o5vA.js";
import { t as resolveChannelMediaMaxBytes } from "./media-limits-DYln5NHj.js";
import "./agent-media-payload-CEcSGySl.js";
import { t as sanitizeForPlainText } from "./sanitize-text-rioSXvZ3.js";
import "./outbound-runtime-CgZ7kl3n.js";
import "./outbound-attachment-VvTVLCZv.js";
import { n as loadQrCodeTuiRuntime } from "./qr-terminal-ghtJU78W.js";
import path from "node:path";
import fs, { mkdtemp, rm, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
//#region src/media/png-encode.ts
/**
* Minimal PNG encoder for generating simple RGBA images without native dependencies.
* Used for QR codes, live probes, and other programmatic image generation.
*/
const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i += 1) {
		let c = i;
		for (let k = 0; k < 8; k += 1) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[i] = c >>> 0;
	}
	return table;
})();
/** Compute CRC32 checksum for a buffer (used in PNG chunk encoding). */
function crc32(buf) {
	let crc = 4294967295;
	for (let i = 0; i < buf.length; i += 1) crc = CRC_TABLE[(crc ^ buf[i]) & 255] ^ crc >>> 8;
	return (crc ^ 4294967295) >>> 0;
}
/** Create a PNG chunk with type, data, and CRC. */
function pngChunk(type, data) {
	const typeBuf = Buffer.from(type, "ascii");
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const crc = crc32(Buffer.concat([typeBuf, data]));
	const crcBuf = Buffer.alloc(4);
	crcBuf.writeUInt32BE(crc, 0);
	return Buffer.concat([
		len,
		typeBuf,
		data,
		crcBuf
	]);
}
/** Write a pixel to an RGBA buffer. Ignores out-of-bounds writes. */
function fillPixel(buf, x, y, width, r, g, b, a = 255) {
	if (x < 0 || y < 0 || x >= width) return;
	const idx = (y * width + x) * 4;
	if (idx < 0 || idx + 3 >= buf.length) return;
	buf[idx] = r;
	buf[idx + 1] = g;
	buf[idx + 2] = b;
	buf[idx + 3] = a;
}
/** Encode an RGBA buffer as a PNG image. */
function encodePngRgba(buffer, width, height) {
	const stride = width * 4;
	const raw = Buffer.alloc((stride + 1) * height);
	for (let row = 0; row < height; row += 1) {
		const rawOffset = row * (stride + 1);
		raw[rawOffset] = 0;
		buffer.copy(raw, rawOffset + 1, row * stride, row * stride + stride);
	}
	const compressed = deflateSync(raw);
	const signature = Buffer.from([
		137,
		80,
		78,
		71,
		13,
		10,
		26,
		10
	]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8;
	ihdr[9] = 6;
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;
	return Buffer.concat([
		signature,
		pngChunk("IHDR", ihdr),
		pngChunk("IDAT", compressed),
		pngChunk("IEND", Buffer.alloc(0))
	]);
}
//#endregion
//#region src/media/qr-image.ts
const DEFAULT_QR_PNG_SCALE = 6;
const DEFAULT_QR_PNG_MARGIN_MODULES = 4;
const MIN_QR_PNG_SCALE = 1;
const MAX_QR_PNG_SCALE = 12;
const MIN_QR_PNG_MARGIN_MODULES = 0;
const MAX_QR_PNG_MARGIN_MODULES = 16;
const QR_PNG_DATA_URL_PREFIX = "data:image/png;base64,";
function resolveQrPngIntegerOption(params) {
	if (params.value === void 0) return params.defaultValue;
	if (!Number.isFinite(params.value)) throw new RangeError(`${params.name} must be a finite number.`);
	const value = Math.floor(params.value);
	if (value < params.min || value > params.max) throw new RangeError(`${params.name} must be between ${params.min} and ${params.max}.`);
	return value;
}
function resolveQrTempPathSegment(name, value) {
	if (!value || value === "." || value === ".." || path.basename(value) !== value) throw new RangeError(`${name} must be a non-empty filename segment.`);
	return value;
}
async function renderQrPngBase64(input, opts = {}) {
	const scale = resolveQrPngIntegerOption({
		name: "scale",
		value: opts.scale,
		defaultValue: DEFAULT_QR_PNG_SCALE,
		min: MIN_QR_PNG_SCALE,
		max: MAX_QR_PNG_SCALE
	});
	const marginModules = resolveQrPngIntegerOption({
		name: "marginModules",
		value: opts.marginModules,
		defaultValue: DEFAULT_QR_PNG_MARGIN_MODULES,
		min: MIN_QR_PNG_MARGIN_MODULES,
		max: MAX_QR_PNG_MARGIN_MODULES
	});
	const { renderPngBase64 } = await loadQrCodeTuiRuntime();
	return await renderPngBase64(input, {
		margin: marginModules,
		scale
	});
}
function formatQrPngDataUrl(base64) {
	return `${QR_PNG_DATA_URL_PREFIX}${base64}`;
}
async function renderQrPngDataUrl(input, opts = {}) {
	return formatQrPngDataUrl(await renderQrPngBase64(input, opts));
}
async function writeQrPngTempFile(input, opts) {
	const dirPrefix = resolveQrTempPathSegment("dirPrefix", opts.dirPrefix);
	const fileName = resolveQrTempPathSegment("fileName", opts.fileName ?? "qr.png");
	const pngBase64 = await renderQrPngBase64(input, opts);
	const dirPath = await mkdtemp(path.join(opts.tmpRoot, dirPrefix));
	const filePath = path.join(dirPath, fileName);
	try {
		await writeFile(filePath, Buffer.from(pngBase64, "base64"));
	} catch (err) {
		await rm(dirPath, {
			recursive: true,
			force: true
		}).catch(() => {});
		throw err;
	}
	return {
		filePath,
		dirPath,
		mediaLocalRoots: [dirPath]
	};
}
//#endregion
//#region src/media/temp-files.ts
async function unlinkIfExists(filePath) {
	if (!filePath) return;
	try {
		await fs.unlink(filePath);
	} catch {}
}
//#endregion
//#region src/media-understanding/audio-transcription-runner.ts
async function runAudioTranscription(params) {
	const attachments = params.attachments ?? normalizeMediaAttachments(params.ctx);
	if (attachments.length === 0) return {
		transcript: void 0,
		attachments
	};
	const providerRegistry = buildProviderRegistry(params.providers, params.cfg);
	const cache = createMediaAttachmentCache(attachments, {
		...params.localPathRoots ? { localPathRoots: params.localPathRoots } : {},
		ssrfPolicy: params.cfg.tools?.web?.fetch?.ssrfPolicy
	});
	try {
		return {
			transcript: (await runCapability({
				capability: "audio",
				cfg: params.cfg,
				ctx: params.ctx,
				attachments: cache,
				media: attachments,
				agentDir: params.agentDir,
				providerRegistry,
				config: params.cfg.tools?.media?.audio,
				activeModel: params.activeModel
			})).outputs.find((entry) => entry.kind === "audio.transcription")?.text?.trim() || void 0,
			attachments
		};
	} finally {
		await cache.cleanup();
	}
}
//#endregion
//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	if ((cfg.tools?.media?.audio)?.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	try {
		const { transcript } = await runAudioTranscription({
			ctx,
			cfg,
			attachments,
			agentDir: params.agentDir,
			providers: params.providers,
			activeModel: params.activeModel,
			localPathRoots: resolveMediaAttachmentLocalRoots({
				cfg,
				ctx
			})
		});
		if (!transcript) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${transcript.length} chars from attachment ${firstAudio.index}`);
		return transcript;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	}
}
//#endregion
//#region src/channels/plugins/outbound/direct-text-media.ts
function resolveScopedChannelMediaMaxBytes(params) {
	return resolveChannelMediaMaxBytes({
		cfg: params.cfg,
		resolveChannelLimitMb: params.resolveChannelLimitMb,
		accountId: params.accountId
	});
}
function createScopedChannelMediaMaxBytesResolver(channel) {
	return (params) => resolveScopedChannelMediaMaxBytes({
		cfg: params.cfg,
		accountId: params.accountId,
		resolveChannelLimitMb: ({ cfg, accountId }) => (cfg.channels?.[channel]?.accounts?.[accountId])?.mediaMaxMb ?? cfg.channels?.[channel]?.mediaMaxMb
	});
}
function createDirectTextMediaOutbound(params) {
	const sendDirect = async (sendParams) => {
		const send = params.resolveSender(sendParams.deps);
		const maxBytes = params.resolveMaxBytes({
			cfg: sendParams.cfg,
			accountId: sendParams.accountId
		});
		const result = await send(sendParams.to, sendParams.text, sendParams.buildOptions({
			cfg: sendParams.cfg,
			mediaUrl: sendParams.mediaUrl,
			mediaAccess: sendParams.mediaAccess,
			mediaLocalRoots: sendParams.mediaAccess?.localRoots,
			mediaReadFile: sendParams.mediaAccess?.readFile,
			accountId: sendParams.accountId,
			replyToId: sendParams.replyToId,
			maxBytes
		}));
		return {
			channel: params.channel,
			...result
		};
	};
	const outbound = {
		deliveryMode: "direct",
		chunker: chunkText,
		chunkerMode: "text",
		textChunkLimit: 4e3,
		sanitizeText: ({ text }) => sanitizeForPlainText(text),
		sendPayload: async (ctx) => await sendTextMediaPayload({
			channel: params.channel,
			ctx,
			adapter: outbound
		}),
		sendText: async ({ cfg, to, text, accountId, deps, replyToId }) => {
			return await sendDirect({
				cfg,
				to,
				text,
				accountId,
				deps,
				replyToId,
				buildOptions: params.buildTextOptions
			});
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaAccess, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId }) => {
			return await sendDirect({
				cfg,
				to,
				text,
				mediaUrl,
				mediaAccess: mediaAccess ?? (mediaLocalRoots || mediaReadFile ? {
					...mediaLocalRoots?.length ? { localRoots: mediaLocalRoots } : {},
					...mediaReadFile ? { readFile: mediaReadFile } : {}
				} : void 0),
				accountId,
				deps,
				replyToId,
				buildOptions: params.buildMediaOptions
			});
		}
	};
	return outbound;
}
//#endregion
export { unlinkIfExists as a, renderQrPngDataUrl as c, encodePngRgba as d, fillPixel as f, transcribeFirstAudio as i, writeQrPngTempFile as l, createScopedChannelMediaMaxBytesResolver as n, formatQrPngDataUrl as o, pngChunk as p, resolveScopedChannelMediaMaxBytes as r, renderQrPngBase64 as s, createDirectTextMediaOutbound as t, crc32 as u };
