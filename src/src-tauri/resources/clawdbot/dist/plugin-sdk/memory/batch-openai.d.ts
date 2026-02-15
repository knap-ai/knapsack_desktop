import type { OpenAiEmbeddingClient } from "./embeddings-openai.js";
export type OpenAiBatchRequest = {
    custom_id: string;
    method: "POST";
    url: "/v1/embeddings";
    body: {
        model: string;
        input: string;
    };
};
export type OpenAiBatchStatus = {
    id?: string;
    status?: string;
    output_file_id?: string | null;
    error_file_id?: string | null;
};
export type OpenAiBatchOutputLine = {
    custom_id?: string;
    response?: {
        status_code?: number;
        body?: {
            data?: Array<{
                embedding?: number[];
                index?: number;
            }>;
            error?: {
                message?: string;
            };
        };
    };
    error?: {
        message?: string;
    };
};
export declare const OPENAI_BATCH_ENDPOINT = "/v1/embeddings";
export declare function runOpenAiEmbeddingBatches(params: {
    openAi: OpenAiEmbeddingClient;
    agentId: string;
    requests: OpenAiBatchRequest[];
    wait: boolean;
    pollIntervalMs: number;
    timeoutMs: number;
    concurrency: number;
    debug?: (message: string, data?: Record<string, unknown>) => void;
}): Promise<Map<string, number[]>>;
