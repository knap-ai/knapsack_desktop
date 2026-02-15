export declare const DEFAULT_BROWSER_TMP_DIR: string;
export declare const DEFAULT_TRACE_DIR: string;
export declare const DEFAULT_DOWNLOAD_DIR: string;
export declare function resolvePathWithinRoot(params: {
    rootDir: string;
    requestedPath: string;
    scopeLabel: string;
    defaultFileName?: string;
}): {
    ok: true;
    path: string;
} | {
    ok: false;
    error: string;
};
