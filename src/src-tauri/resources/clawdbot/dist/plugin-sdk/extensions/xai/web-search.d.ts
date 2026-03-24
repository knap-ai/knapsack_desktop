import { type WebSearchProviderPlugin } from "openclaw/plugin-sdk/provider-web-search";
import { buildXaiWebSearchPayload, extractXaiWebSearchContent, requestXaiWebSearch, resolveXaiInlineCitations, resolveXaiWebSearchModel } from "./src/web-search-shared.js";
export declare function createXaiWebSearchProvider(): WebSearchProviderPlugin;
export declare const __testing: {
    buildXaiWebSearchPayload: typeof buildXaiWebSearchPayload;
    extractXaiWebSearchContent: typeof extractXaiWebSearchContent;
    resolveXaiInlineCitations: typeof resolveXaiInlineCitations;
    resolveXaiWebSearchModel: typeof resolveXaiWebSearchModel;
    requestXaiWebSearch: typeof requestXaiWebSearch;
};
