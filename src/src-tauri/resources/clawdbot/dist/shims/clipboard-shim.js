/**
 * Clipboard graceful-degradation shim.
 *
 * @mariozechner/clipboard is a native N-API module that throws at require()
 * time when the platform-specific binary (e.g. clipboard-darwin-arm64) is
 * missing. Because it is a transitive dependency of @mariozechner/pi-coding-agent,
 * the throw propagates up through the gateway import chain and kills the
 * entire process before it can start.
 *
 * This shim must be loaded BEFORE any module that transitively requires
 * @mariozechner/clipboard. It:
 *   1. Resolves the package path via require.resolve()
 *   2. Attempts to require() it (CJS)
 *   3. On failure, populates require.cache with lazy stub exports so that
 *      subsequent require() calls (from pi-coding-agent or elsewhere) get
 *      the stubs instead of re-evaluating the throwing module.
 *
 * The real clipboard functionality is provided by dist/infra/clipboard.js,
 * which falls back to CLI tools (pbcopy, xclip, wl-copy, etc.).
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let clipboardPath;
try {
    clipboardPath = require.resolve("@mariozechner/clipboard");
}
catch {
    // Package not installed at all — nothing to shim.
}

if (clipboardPath) {
    try {
        require(clipboardPath);
    }
    catch (loadError) {
        // Native binding unavailable. Pre-populate the CJS require cache
        // with stub exports so transitive imports don't crash the process.
        const unavailable = (name) => () => {
            throw new Error(
                `Native clipboard binding unavailable (${name}): ${loadError.message}`,
            );
        };
        require.cache[clipboardPath] = {
            id: clipboardPath,
            filename: clipboardPath,
            loaded: true,
            exports: {
                availableFormats: unavailable("availableFormats"),
                getText: unavailable("getText"),
                setText: unavailable("setText"),
                hasText: unavailable("hasText"),
                getImageBinary: unavailable("getImageBinary"),
                getImageBase64: unavailable("getImageBase64"),
                setImageBinary: unavailable("setImageBinary"),
                setImageBase64: unavailable("setImageBase64"),
                hasImage: unavailable("hasImage"),
                getHtml: unavailable("getHtml"),
                setHtml: unavailable("setHtml"),
                hasHtml: unavailable("hasHtml"),
                getRtf: unavailable("getRtf"),
                setRtf: unavailable("setRtf"),
                hasRtf: unavailable("hasRtf"),
                clear: unavailable("clear"),
                watch: unavailable("watch"),
                callThreadsafeFunction: unavailable("callThreadsafeFunction"),
            },
        };
    }
}
