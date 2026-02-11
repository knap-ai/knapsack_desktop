import { runCommandWithTimeout } from "../process/exec.js";
// Try to load the native clipboard module; fall back to CLI tools if unavailable.
let nativeClipboard = null;
try {
    const mod = await import("@mariozechner/clipboard");
    // Verify setText is a real function, not a degradation stub
    if (typeof mod.setText === "function") {
        nativeClipboard = mod;
    }
}
catch {
    // Native clipboard unavailable — CLI fallbacks will be used
}
export async function copyToClipboard(value) {
    // Prefer the native binding when available
    if (nativeClipboard) {
        try {
            nativeClipboard.setText(value);
            return true;
        }
        catch {
            // native call failed, fall through to CLI fallbacks
        }
    }
    const attempts = [
        { argv: ["pbcopy"] },
        { argv: ["xclip", "-selection", "clipboard"] },
        { argv: ["wl-copy"] },
        { argv: ["clip.exe"] }, // WSL / Windows
        { argv: ["powershell", "-NoProfile", "-Command", "Set-Clipboard"] },
    ];
    for (const attempt of attempts) {
        try {
            const result = await runCommandWithTimeout(attempt.argv, {
                timeoutMs: 3_000,
                input: value,
            });
            if (result.code === 0 && !result.killed)
                return true;
        }
        catch {
            // keep trying the next fallback
        }
    }
    return false;
}
