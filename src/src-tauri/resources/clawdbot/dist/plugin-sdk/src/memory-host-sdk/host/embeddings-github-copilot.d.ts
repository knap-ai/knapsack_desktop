import type { EmbeddingProvider } from "./embeddings.types.js";
export type GitHubCopilotEmbeddingClient = {
    githubToken: string;
    model: string;
    baseUrl?: string;
    headers?: Record<string, string>;
    env?: NodeJS.ProcessEnv;
    fetchImpl?: typeof fetch;
};
export declare function createGitHubCopilotEmbeddingProvider(client: GitHubCopilotEmbeddingClient): Promise<{
    provider: EmbeddingProvider;
    client: GitHubCopilotEmbeddingClient;
}>;
