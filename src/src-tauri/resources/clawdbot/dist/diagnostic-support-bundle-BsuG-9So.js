import fs from "node:fs";
import path from "node:path";
//#region src/logging/diagnostic-support-bundle.ts
function supportBundleByteLength(content) {
	return Buffer.byteLength(content, "utf8");
}
function jsonSupportBundleFile(pathName, value) {
	return {
		path: assertSafeBundleRelativePath(pathName),
		mediaType: "application/json",
		content: `${JSON.stringify(value, null, 2)}\n`
	};
}
function jsonlSupportBundleFile(pathName, lines) {
	return {
		path: assertSafeBundleRelativePath(pathName),
		mediaType: "application/x-ndjson",
		content: `${lines.join("\n")}\n`
	};
}
function textSupportBundleFile(pathName, content) {
	return {
		path: assertSafeBundleRelativePath(pathName),
		mediaType: "text/plain; charset=utf-8",
		content: content.endsWith("\n") ? content : `${content}\n`
	};
}
function supportBundleContents(files) {
	return files.map((file) => ({
		path: file.path,
		mediaType: file.mediaType,
		bytes: supportBundleByteLength(file.content)
	}));
}
function assertSafeBundleRelativePath(pathName) {
	const normalized = pathName.replaceAll("\\", "/");
	if (!normalized || normalized.startsWith("/") || normalized.split("/").some((part) => part === "" || part === "." || part === "..")) throw new Error(`Invalid bundle file path: ${pathName}`);
	return normalized;
}
function prepareSupportBundleDirectory(outputDir) {
	fs.mkdirSync(path.dirname(outputDir), {
		recursive: true,
		mode: 448
	});
	fs.mkdirSync(outputDir, { mode: 448 });
}
function resolveSupportBundleFilePath(outputDir, pathName) {
	const safePath = assertSafeBundleRelativePath(pathName);
	const resolvedBase = path.resolve(outputDir);
	const resolvedFile = path.resolve(resolvedBase, safePath);
	const relative = path.relative(resolvedBase, resolvedFile);
	if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Bundle file path escaped output directory: ${pathName}`);
	return resolvedFile;
}
function writeSupportBundleFile(outputDir, file) {
	const filePath = resolveSupportBundleFilePath(outputDir, file.path);
	fs.mkdirSync(path.dirname(filePath), {
		recursive: true,
		mode: 448
	});
	fs.writeFileSync(filePath, file.content, {
		encoding: "utf8",
		flag: "wx",
		mode: 384
	});
}
function writeSupportBundleDirectory(params) {
	prepareSupportBundleDirectory(params.outputDir);
	for (const file of params.files) writeSupportBundleFile(params.outputDir, file);
	return supportBundleContents(params.files);
}
async function writeSupportBundleZip(params) {
	const { default: JSZip } = await import("jszip");
	const zip = new JSZip();
	for (const file of params.files) zip.file(assertSafeBundleRelativePath(file.path), file.content);
	const buffer = await zip.generateAsync({
		type: "nodebuffer",
		compression: "DEFLATE",
		compressionOptions: { level: params.compressionLevel ?? 6 }
	});
	fs.mkdirSync(path.dirname(params.outputPath), {
		recursive: true,
		mode: 448
	});
	fs.writeFileSync(params.outputPath, buffer, { mode: 384 });
	return buffer.length;
}
//#endregion
export { writeSupportBundleDirectory as a, textSupportBundleFile as i, jsonlSupportBundleFile as n, writeSupportBundleZip as o, supportBundleContents as r, jsonSupportBundleFile as t };
