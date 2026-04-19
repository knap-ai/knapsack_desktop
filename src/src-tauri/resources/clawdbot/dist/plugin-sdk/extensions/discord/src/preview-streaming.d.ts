export type DiscordPreviewStreamMode = "off" | "partial" | "block";
export declare function resolveDiscordPreviewStreamMode(params?: {
    streamMode?: unknown;
    streaming?: unknown;
}): DiscordPreviewStreamMode;
