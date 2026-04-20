import type { ChannelMessageActionAdapter } from "openclaw/plugin-sdk/channel-contract";
export declare const telegramMessageActionRuntime: {
    handleTelegramAction: (params: Record<string, unknown>, cfg: import("openclaw/plugin-sdk/config-runtime").OpenClawConfig, options?: {
        mediaLocalRoots?: readonly string[];
        mediaReadFile?: (filePath: string) => Promise<Buffer>;
    } | undefined) => ReturnType<typeof import("./action-runtime.js").handleTelegramAction>;
};
export declare const telegramMessageActions: ChannelMessageActionAdapter;
