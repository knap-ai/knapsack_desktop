import path from "node:path";
import fs from "node:fs";
import fs$1 from "node:fs/promises";
import { fileURLToPath } from "node:url";

//#region src/infra/openclaw-root.ts
const CORE_PACKAGE_NAMES = new Set(["openclaw"]);
async function readPackageName(dir) {
	try {
		const raw = await fs$1.readFile(path.join(dir, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.name === "string" ? parsed.name : null;
	} catch {
		return null;
	}
}
function readPackageNameSync(dir) {
	try {
		const raw = fs.readFileSync(path.join(dir, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.name === "string" ? parsed.name : null;
	} catch {
		return null;
	}
}
async function findPackageRoot(startDir, maxDepth = 12) {
	let current = path.resolve(startDir);
	for (let i = 0; i < maxDepth; i += 1) {
		const name = await readPackageName(current);
		if (name && CORE_PACKAGE_NAMES.has(name)) return current;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return null;
}
function findPackageRootSync(startDir, maxDepth = 12) {
	let current = path.resolve(startDir);
	for (let i = 0; i < maxDepth; i += 1) {
		const name = readPackageNameSync(current);
		if (name && CORE_PACKAGE_NAMES.has(name)) return current;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return null;
}
function candidateDirsFromArgv1(argv1) {
	const normalized = path.resolve(argv1);
	const candidates = [path.dirname(normalized)];
	try {
		const resolved = fs.realpathSync(normalized);
		if (resolved !== normalized) candidates.push(path.dirname(resolved));
	} catch {}
	const parts = normalized.split(path.sep);
	const binIndex = parts.lastIndexOf(".bin");
	if (binIndex > 0 && parts[binIndex - 1] === "node_modules") {
		const binName = path.basename(normalized);
		const nodeModulesDir = parts.slice(0, binIndex).join(path.sep);
		candidates.push(path.join(nodeModulesDir, binName));
	}
	return candidates;
}
async function resolveOpenClawPackageRoot(opts) {
	const candidates = [];
	if (opts.moduleUrl) candidates.push(path.dirname(fileURLToPath(opts.moduleUrl)));
	if (opts.argv1) candidates.push(...candidateDirsFromArgv1(opts.argv1));
	if (opts.cwd) candidates.push(opts.cwd);
	for (const candidate of candidates) {
		const found = await findPackageRoot(candidate);
		if (found) return found;
	}
	return null;
}
function resolveOpenClawPackageRootSync(opts) {
	const candidates = [];
	if (opts.moduleUrl) candidates.push(path.dirname(fileURLToPath(opts.moduleUrl)));
	if (opts.argv1) candidates.push(...candidateDirsFromArgv1(opts.argv1));
	if (opts.cwd) candidates.push(opts.cwd);
	for (const candidate of candidates) {
		const found = findPackageRootSync(candidate);
		if (found) return found;
	}
	return null;
}

//#endregion
export { resolveOpenClawPackageRootSync as n, resolveOpenClawPackageRoot as t };