import { r as resolveCliName } from "./command-format-CVN3MX2Q.js";
import * as path$1 from "node:path";
import * as os$1 from "node:os";
import * as fs$1 from "node:fs/promises";
import { randomUUID } from "node:crypto";

//#region src/infra/node-shell.ts
function buildNodeShellCommand(command, platform) {
	if (String(platform ?? "").trim().toLowerCase().startsWith("win")) return [
		"cmd.exe",
		"/d",
		"/s",
		"/c",
		command
	];
	return [
		"/bin/sh",
		"-lc",
		command
	];
}

//#endregion
//#region src/cli/nodes-camera.ts
const MAX_CAMERA_URL_DOWNLOAD_BYTES = 250 * 1024 * 1024;
function asRecord$2(value) {
	return typeof value === "object" && value !== null ? value : {};
}
function asString$2(value) {
	return typeof value === "string" ? value : void 0;
}
function asNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asBoolean(value) {
	return typeof value === "boolean" ? value : void 0;
}
function parseCameraSnapPayload(value) {
	const obj = asRecord$2(value);
	const format = asString$2(obj.format);
	const base64 = asString$2(obj.base64);
	const url = asString$2(obj.url);
	const width = asNumber(obj.width);
	const height = asNumber(obj.height);
	if (!format || !base64 && !url || width === void 0 || height === void 0) throw new Error("invalid camera.snap payload");
	return {
		format,
		...base64 ? { base64 } : {},
		...url ? { url } : {},
		width,
		height
	};
}
function parseCameraClipPayload(value) {
	const obj = asRecord$2(value);
	const format = asString$2(obj.format);
	const base64 = asString$2(obj.base64);
	const url = asString$2(obj.url);
	const durationMs = asNumber(obj.durationMs);
	const hasAudio = asBoolean(obj.hasAudio);
	if (!format || !base64 && !url || durationMs === void 0 || hasAudio === void 0) throw new Error("invalid camera.clip payload");
	return {
		format,
		...base64 ? { base64 } : {},
		...url ? { url } : {},
		durationMs,
		hasAudio
	};
}
function cameraTempPath(opts) {
	const tmpDir = opts.tmpDir ?? os$1.tmpdir();
	const id = opts.id ?? randomUUID();
	const facingPart = opts.facing ? `-${opts.facing}` : "";
	const ext = opts.ext.startsWith(".") ? opts.ext : `.${opts.ext}`;
	const cliName = resolveCliName();
	return path$1.join(tmpDir, `${cliName}-camera-${opts.kind}${facingPart}-${id}${ext}`);
}
async function writeUrlToFile(filePath, url) {
	const parsed = new URL(url);
	if (parsed.protocol !== "https:") throw new Error(`writeUrlToFile: only https URLs are allowed, got ${parsed.protocol}`);
	const res = await fetch(url);
	if (!res.ok) throw new Error(`failed to download ${url}: ${res.status} ${res.statusText}`);
	const contentLengthRaw = res.headers.get("content-length");
	const contentLength = contentLengthRaw ? Number.parseInt(contentLengthRaw, 10) : void 0;
	if (typeof contentLength === "number" && Number.isFinite(contentLength) && contentLength > MAX_CAMERA_URL_DOWNLOAD_BYTES) throw new Error(`writeUrlToFile: content-length ${contentLength} exceeds max ${MAX_CAMERA_URL_DOWNLOAD_BYTES}`);
	const body = res.body;
	if (!body) throw new Error(`failed to download ${url}: empty response body`);
	const fileHandle = await fs$1.open(filePath, "w");
	let bytes = 0;
	let thrown;
	try {
		const reader = body.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (!value || value.byteLength === 0) continue;
			bytes += value.byteLength;
			if (bytes > MAX_CAMERA_URL_DOWNLOAD_BYTES) throw new Error(`writeUrlToFile: downloaded ${bytes} bytes, exceeds max ${MAX_CAMERA_URL_DOWNLOAD_BYTES}`);
			await fileHandle.write(value);
		}
	} catch (err) {
		thrown = err;
	} finally {
		await fileHandle.close();
	}
	if (thrown) {
		await fs$1.unlink(filePath).catch(() => {});
		throw thrown;
	}
	return {
		path: filePath,
		bytes
	};
}
async function writeBase64ToFile(filePath, base64) {
	const buf = Buffer.from(base64, "base64");
	await fs$1.writeFile(filePath, buf);
	return {
		path: filePath,
		bytes: buf.length
	};
}

//#endregion
//#region src/cli/nodes-canvas.ts
function asRecord$1(value) {
	return typeof value === "object" && value !== null ? value : {};
}
function asString$1(value) {
	return typeof value === "string" ? value : void 0;
}
function parseCanvasSnapshotPayload(value) {
	const obj = asRecord$1(value);
	const format = asString$1(obj.format);
	const base64 = asString$1(obj.base64);
	if (!format || !base64) throw new Error("invalid canvas.snapshot payload");
	return {
		format,
		base64
	};
}
function canvasSnapshotTempPath(opts) {
	const tmpDir = opts.tmpDir ?? os$1.tmpdir();
	const id = opts.id ?? randomUUID();
	const ext = opts.ext.startsWith(".") ? opts.ext : `.${opts.ext}`;
	const cliName = resolveCliName();
	return path$1.join(tmpDir, `${cliName}-canvas-snapshot-${id}${ext}`);
}

//#endregion
//#region src/cli/nodes-run.ts
function parseEnvPairs(pairs) {
	if (!Array.isArray(pairs) || pairs.length === 0) return;
	const env = {};
	for (const pair of pairs) {
		if (typeof pair !== "string") continue;
		const idx = pair.indexOf("=");
		if (idx <= 0) continue;
		const key = pair.slice(0, idx).trim();
		if (!key) continue;
		env[key] = pair.slice(idx + 1);
	}
	return Object.keys(env).length > 0 ? env : void 0;
}

//#endregion
//#region src/cli/nodes-screen.ts
function asRecord(value) {
	return typeof value === "object" && value !== null ? value : {};
}
function asString(value) {
	return typeof value === "string" ? value : void 0;
}
function parseScreenRecordPayload(value) {
	const obj = asRecord(value);
	const format = asString(obj.format);
	const base64 = asString(obj.base64);
	if (!format || !base64) throw new Error("invalid screen.record payload");
	return {
		format,
		base64,
		durationMs: typeof obj.durationMs === "number" ? obj.durationMs : void 0,
		fps: typeof obj.fps === "number" ? obj.fps : void 0,
		screenIndex: typeof obj.screenIndex === "number" ? obj.screenIndex : void 0,
		hasAudio: typeof obj.hasAudio === "boolean" ? obj.hasAudio : void 0
	};
}
function screenRecordTempPath(opts) {
	const tmpDir = opts.tmpDir ?? os$1.tmpdir();
	const id = opts.id ?? randomUUID();
	const ext = opts.ext.startsWith(".") ? opts.ext : `.${opts.ext}`;
	return path$1.join(tmpDir, `openclaw-screen-record-${id}${ext}`);
}
async function writeScreenRecordToFile(filePath, base64) {
	return writeBase64ToFile(filePath, base64);
}

//#endregion
export { canvasSnapshotTempPath as a, parseCameraClipPayload as c, writeUrlToFile as d, buildNodeShellCommand as f, parseEnvPairs as i, parseCameraSnapPayload as l, screenRecordTempPath as n, parseCanvasSnapshotPayload as o, writeScreenRecordToFile as r, cameraTempPath as s, parseScreenRecordPayload as t, writeBase64ToFile as u };