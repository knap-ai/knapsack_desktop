import type { StreamFn } from "@mariozechner/pi-agent-core";
export declare function createXaiToolPayloadCompatibilityWrapper(baseStreamFn: StreamFn | undefined): StreamFn;
export declare function createXaiToolCallArgumentDecodingWrapper(baseStreamFn: StreamFn): StreamFn;
