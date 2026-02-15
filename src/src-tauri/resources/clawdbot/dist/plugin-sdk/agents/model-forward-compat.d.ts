import type { Api, Model } from "@mariozechner/pi-ai";
import type { ModelRegistry } from "./pi-model-discovery.js";
export declare const ANTIGRAVITY_OPUS_46_FORWARD_COMPAT_CANDIDATES: readonly [{
    readonly id: "claude-opus-4-6-thinking";
    readonly templatePrefixes: readonly ["google-antigravity/claude-opus-4-5-thinking", "google-antigravity/claude-opus-4.5-thinking"];
}, {
    readonly id: "claude-opus-4-6";
    readonly templatePrefixes: readonly ["google-antigravity/claude-opus-4-5", "google-antigravity/claude-opus-4.5"];
}];
export declare function resolveForwardCompatModel(provider: string, modelId: string, modelRegistry: ModelRegistry): Model<Api> | undefined;
