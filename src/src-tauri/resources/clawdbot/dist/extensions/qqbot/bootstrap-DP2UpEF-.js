import { i as registerPlatformAdapterFactory, n as hasPlatformAdapter, r as registerPlatformAdapter } from "./adapter-DfD2SNGz.js";
import { hasConfiguredSecretInput, normalizeResolvedSecretInputString, normalizeSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { resolvePreferredOpenClawTmpDir } from "openclaw/plugin-sdk/temp-path";
//#region extensions/qqbot/src/bridge/logger.ts
let _logger = null;
/** Register the framework logger. Called once in startGateway(). */
function setBridgeLogger(logger) {
	_logger = logger;
}
/** Get the bridge logger. Falls back to console if not yet registered. */
function getBridgeLogger() {
	return _logger ?? {
		info: (msg) => console.log(msg),
		error: (msg) => console.error(msg),
		debug: (msg) => console.log(msg)
	};
}
//#endregion
//#region extensions/qqbot/src/bridge/bootstrap.ts
/**
* Bootstrap the PlatformAdapter for the built-in version.
*
* ## Design
*
* The adapter is registered via two complementary mechanisms:
*
* 1. **Factory registration** (`registerPlatformAdapterFactory`) — a lightweight
*    callback stored in `adapter/index.ts` that is invoked lazily by
*    `getPlatformAdapter()` on first access. This guarantees the adapter is
*    available regardless of module evaluation order or bundler chunk splitting.
*
* 2. **Eager side-effect** (`ensurePlatformAdapter()`) — called at module
*    evaluation time when `channel.ts` imports this file. Provides the adapter
*    immediately for code that runs synchronously during startup.
*
* Heavy async-only dependencies (`media-runtime`, `config-runtime`,
* `approval-gateway-runtime`) are lazy-imported inside each async method body
* so that this module evaluates with minimal overhead.
*
* Synchronous dependencies (`secret-input`, `temp-path`) are imported
* statically at the top level so they work reliably in both production and
* vitest (which resolves bare specifiers via `resolve.alias`, not Node CJS).
*/
function createBuiltinAdapter() {
	return {
		async validateRemoteUrl(_url, _options) {},
		async resolveSecret(value) {
			if (typeof value === "string") return value || void 0;
		},
		async downloadFile(url, destDir, filename) {
			const { fetchRemoteMedia } = await import("openclaw/plugin-sdk/media-runtime");
			const result = await fetchRemoteMedia({
				url,
				filePathHint: filename
			});
			const fs = await import("node:fs");
			const path = await import("node:path");
			if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
			const destPath = path.join(destDir, filename ?? "download");
			fs.writeFileSync(destPath, result.buffer);
			return destPath;
		},
		async fetchMedia(options) {
			const { fetchRemoteMedia } = await import("openclaw/plugin-sdk/media-runtime");
			const result = await fetchRemoteMedia({
				url: options.url,
				filePathHint: options.filePathHint,
				maxBytes: options.maxBytes,
				maxRedirects: options.maxRedirects,
				ssrfPolicy: options.ssrfPolicy,
				requestInit: options.requestInit
			});
			return {
				buffer: result.buffer,
				fileName: result.fileName
			};
		},
		getTempDir() {
			return resolvePreferredOpenClawTmpDir();
		},
		hasConfiguredSecret(value) {
			return hasConfiguredSecretInput(value);
		},
		normalizeSecretInputString(value) {
			return normalizeSecretInputString(value) ?? void 0;
		},
		resolveSecretInputString(params) {
			return normalizeResolvedSecretInputString(params) ?? void 0;
		},
		async resolveApproval(approvalId, decision) {
			try {
				const { loadConfig } = await import("openclaw/plugin-sdk/config-runtime");
				const { resolveApprovalOverGateway } = await import("openclaw/plugin-sdk/approval-gateway-runtime");
				await resolveApprovalOverGateway({
					cfg: loadConfig(),
					approvalId,
					decision,
					clientDisplayName: "QQBot Approval Handler"
				});
				return true;
			} catch (err) {
				getBridgeLogger().error(`[qqbot] resolveApproval failed: ${String(err)}`);
				return false;
			}
		}
	};
}
/**
* Ensure the built-in PlatformAdapter is registered.
*
* Safe to call multiple times — only registers on the first invocation.
* Exported for backward compatibility with code that calls it explicitly.
*/
function ensurePlatformAdapter() {
	if (!hasPlatformAdapter()) registerPlatformAdapter(createBuiltinAdapter());
}
registerPlatformAdapterFactory(createBuiltinAdapter);
ensurePlatformAdapter();
//#endregion
export { getBridgeLogger as n, setBridgeLogger as r, ensurePlatformAdapter as t };
