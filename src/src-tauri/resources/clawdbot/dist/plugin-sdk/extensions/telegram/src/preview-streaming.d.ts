export type TelegramPreviewStreamMode = "off" | "partial" | "block";
export declare function resolveTelegramPreviewStreamMode(params?: {
    streamMode?: unknown;
    streaming?: unknown;
}): TelegramPreviewStreamMode;
