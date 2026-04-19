import type { OpenClawConfig, TelegramAccountConfig, TelegramDirectConfig } from "openclaw/plugin-sdk/config-runtime";
export declare const AUTO_TOPIC_LABEL_DEFAULT_PROMPT = "Generate a very short topic label (2-4 words, max 25 chars) for a chat conversation based on the user's first message below. No emoji. Use the same language as the message. Be concise and descriptive. Return ONLY the topic name, nothing else.";
export declare function resolveAutoTopicLabelConfig(directConfig?: TelegramDirectConfig["autoTopicLabel"], accountConfig?: TelegramAccountConfig["autoTopicLabel"]): {
    enabled: true;
    prompt: string;
} | null;
export declare function generateTelegramTopicLabel(params: {
    userMessage: string;
    prompt: string;
    cfg: OpenClawConfig;
    agentId?: string;
    agentDir?: string;
}): Promise<string | null>;
