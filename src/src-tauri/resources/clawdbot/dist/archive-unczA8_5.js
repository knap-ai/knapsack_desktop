import path from "node:path";
import fs from "node:fs/promises";
import JSZip from "jszip";
import * as tar from "tar";

//#region src/infra/archive.ts
const TAR_SUFFIXES = [
	".tgz",
	".tar.gz",
	".tar"
];
function resolveArchiveKind(filePath) {
	const lower = filePath.toLowerCase();
	if (lower.endsWith(".zip")) return "zip";
	if (TAR_SUFFIXES.some((suffix) => lower.endsWith(suffix))) return "tar";
	return null;
}
async function resolvePackedRootDir(extractDir) {
	const direct = path.join(extractDir, "package");
	try {
		if ((await fs.stat(direct)).isDirectory()) return direct;
	} catch {}
	const dirs = (await fs.readdir(extractDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
	if (dirs.length !== 1) throw new Error(`unexpected archive layout (dirs: ${dirs.join(", ")})`);
	const onlyDir = dirs[0];
	if (!onlyDir) throw new Error("unexpected archive layout (no package dir found)");
	return path.join(extractDir, onlyDir);
}
async function withTimeout(promise, timeoutMs, label) {
	let timeoutId;
	try {
		return await Promise.race([promise, new Promise((_, reject) => {
			timeoutId = setTimeout(() => reject(/* @__PURE__ */ new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
		})]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}
async function extractZip(params) {
	const buffer = await fs.readFile(params.archivePath);
	const zip = await JSZip.loadAsync(buffer);
	const entries = Object.values(zip.files);
	for (const entry of entries) {
		const entryPath = entry.name.replaceAll("\\", "/");
		if (!entryPath || entryPath.endsWith("/")) {
			const dirPath = path.resolve(params.destDir, entryPath);
			if (!dirPath.startsWith(params.destDir)) throw new Error(`zip entry escapes destination: ${entry.name}`);
			await fs.mkdir(dirPath, { recursive: true });
			continue;
		}
		const outPath = path.resolve(params.destDir, entryPath);
		if (!outPath.startsWith(params.destDir)) throw new Error(`zip entry escapes destination: ${entry.name}`);
		await fs.mkdir(path.dirname(outPath), { recursive: true });
		const data = await entry.async("nodebuffer");
		await fs.writeFile(outPath, data);
	}
}
async function extractArchive(params) {
	const kind = resolveArchiveKind(params.archivePath);
	if (!kind) throw new Error(`unsupported archive: ${params.archivePath}`);
	const label = kind === "zip" ? "extract zip" : "extract tar";
	if (kind === "tar") {
		await withTimeout(tar.x({
			file: params.archivePath,
			cwd: params.destDir
		}), params.timeoutMs, label);
		return;
	}
	await withTimeout(extractZip(params), params.timeoutMs, label);
}
async function fileExists(filePath) {
	try {
		await fs.stat(filePath);
		return true;
	} catch {
		return false;
	}
}
async function readJsonFile(filePath) {
	const raw = await fs.readFile(filePath, "utf-8");
	return JSON.parse(raw);
}

//#endregion
export { resolvePackedRootDir as a, resolveArchiveKind as i, fileExists as n, readJsonFile as r, extractArchive as t };