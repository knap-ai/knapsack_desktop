import type { VoyageEmbeddingClient } from "./embeddings-voyage.js";
/**
 * Voyage Batch API Input Line format.
 * See: https://docs.voyageai.com/docs/batch-inference
 */
export type VoyageBatchRequest = {
    custom_id: string;
    body: {
        input: string | string[];
    };
};
export type VoyageBatchStatus = {
    id?: string;
    status?: string;
    output_file_id?: string | null;
    error_file_id?: string | null;
};
export type VoyageBatchOutputLine = {
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
export declare const VOYAGE_BATCH_ENDPOINT = "/v1/embeddings";
export declare function runVoyageEmbeddingBatches(params: {
    client: VoyageEmbeddingClient;
    agentId: string;
    requests: VoyageBatchRequest[];
    wait: boolean;
    pollIntervalMs: number;
    timeoutMs: number;
    concurrency: number;
    debug?: (message: string, data?: Record<string, unknown>) => void;
}): Promise<Map<string, number[]>>;
