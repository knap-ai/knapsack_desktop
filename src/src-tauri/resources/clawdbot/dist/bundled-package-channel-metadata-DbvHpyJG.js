import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { r as getPackageManifestMetadata } from "./manifest-DkU_xlZi.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/bundled-package-channel-metadata.ts
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
	const scanDir = resolveBundledPluginsDir();
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
