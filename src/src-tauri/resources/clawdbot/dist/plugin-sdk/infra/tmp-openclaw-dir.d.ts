export declare const POSIX_OPENCLAW_TMP_DIR = "/tmp/openclaw";
type ResolvePreferredOpenClawTmpDirOptions = {
    accessSync?: (path: string, mode?: number) => void;
    statSync?: (path: string) => {
        isDirectory(): boolean;
    };
    tmpdir?: () => string;
};
export declare function resolvePreferredOpenClawTmpDir(options?: ResolvePreferredOpenClawTmpDirOptions): string;
export {};
