import { r as getPackageManifestMetadata } from "./manifest-UasFm2SQ.js";
import { s as resolveBundledPluginScanDir } from "./bundled-plugin-metadata-DBCPq4zK.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/bundled-package-channel-metadata.ts
const PACKAGE_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const RUNNING_FROM_BUILT_ARTIFACT = CURRENT_MODULE_PATH.includes(`${path.sep}dist${path.sep}`) || CURRENT_MODULE_PATH.includes(`${path.sep}dist-runtime${path.sep}`);
let bundledPackageChannelMetadataCache;
function readPackageManifest(pluginDir) {
	const packagePath = path.join(pluginDir, "package.json");
	if (!fs.existsSync(packagePath)) return;
	try {
		return JSON.parse(fs.readFileSync(packagePath, "utf-8"));
	} catch {
		return;
	}
}
function listBundledPackageChannelMetadata() {
	if (bundledPackageChannelMetadataCache) return bundledPackageChannelMetadataCache;
	const scanDir = resolveBundledPluginScanDir({
		packageRoot: PACKAGE_ROOT,
		runningFromBuiltArtifact: RUNNING_FROM_BUILT_ARTIFACT
	});
	if (!scanDir || !fs.existsSync(scanDir)) {
		bundledPackageChannelMetadataCache = [];
		return bundledPackageChannelMetadataCache;
	}
	bundledPackageChannelMetadataCache = fs.readdirSync(scanDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => readPackageManifest(path.join(scanDir, entry.name))).map((manifest) => getPackageManifestMetadata(manifest)?.channel).filter((channel) => Boolean(channel?.id));
	return bundledPackageChannelMetadataCache;
}
function findBundledPackageChannelMetadata(channelId) {
	return listBundledPackageChannelMetadata().find((channel) => channel.id === channelId || channel.aliases?.includes(channelId));
}
//#endregion
export { listBundledPackageChannelMetadata as n, findBundledPackageChannelMetadata as t };
