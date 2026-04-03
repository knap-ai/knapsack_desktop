import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type BrowserExecutable = PluginSdkFacadeTypeMap["browser-runtime"]["types"]["BrowserExecutable"];
export declare function resolveGoogleChromeExecutableForPlatform(platform: NodeJS.Platform): BrowserExecutable | null;
export declare function readBrowserVersion(executablePath: string): string | null;
export declare function parseBrowserMajorVersion(rawVersion: string | null | undefined): number | null;
export {};
