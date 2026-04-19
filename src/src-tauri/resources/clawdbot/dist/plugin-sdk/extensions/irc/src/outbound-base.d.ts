import { chunkTextForOutbound } from "./channel-api.js";
export declare const ircOutboundBaseAdapter: {
    deliveryMode: "direct";
    chunker: typeof chunkTextForOutbound;
    chunkerMode: "markdown";
    textChunkLimit: number;
    sanitizeText: ({ text }: {
        text: string;
    }) => string;
};
