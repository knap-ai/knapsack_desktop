type ButtonRow = Array<{
    text: string;
    callback_data: string;
}>;
export type ProviderInfo = {
    id: string;
    count: number;
};
type ModelsKeyboardParams = {
    provider: string;
    models: readonly string[];
    currentModel?: string;
    currentPage: number;
    totalPages: number;
    pageSize?: number;
    modelNames?: ReadonlyMap<string, string>;
};
export declare function buildProviderKeyboard(providers: ProviderInfo[]): ButtonRow[];
export declare function buildModelsKeyboard(params: ModelsKeyboardParams): ButtonRow[];
export declare function buildBrowseProvidersButton(): ButtonRow[];
export declare function getModelsPageSize(): number;
export declare function calculateTotalPages(totalModels: number, pageSize?: number): number;
export {};
