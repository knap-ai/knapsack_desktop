import { type RmOptions } from "node:fs";
export declare function createPluginSdkTestHarness(options?: {
    cleanup?: RmOptions;
}): {
    createTempDir: (prefix: string) => Promise<string>;
    createTempDirSync: (prefix: string) => string;
};
export declare function createBundledPluginPublicSurfaceFixture(params: {
    createTempDirSync: (prefix: string) => string;
    marker: string;
    prefix: string;
}): string;
export declare function createThrowingBundledPluginPublicSurfaceFixture(params: {
    createTempDirSync: (prefix: string) => string;
    prefix: string;
}): string;
