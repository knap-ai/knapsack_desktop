export declare function resolveMemorySearchPreflight(params: {
    query: string;
    hasIndexedContent: boolean;
}): {
    normalizedQuery: string;
    shouldInitializeProvider: boolean;
    shouldSearch: true;
} | {
    normalizedQuery: string;
    shouldInitializeProvider: false;
    shouldSearch: false;
};
