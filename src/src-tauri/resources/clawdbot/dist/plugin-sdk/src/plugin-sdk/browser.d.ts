import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["browser"];
type FacadeModule = FacadeEntry["module"];
export declare const browserHandlers: FacadeModule["browserHandlers"];
export declare const createBrowserPluginService: FacadeModule["createBrowserPluginService"];
export declare const createBrowserTool: FacadeModule["createBrowserTool"];
export declare const handleBrowserGatewayRequest: FacadeModule["handleBrowserGatewayRequest"];
export declare const registerBrowserCli: FacadeModule["registerBrowserCli"];
export {};
