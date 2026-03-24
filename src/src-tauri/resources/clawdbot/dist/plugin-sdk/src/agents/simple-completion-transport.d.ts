import type { Api, Model } from "@mariozechner/pi-ai";
import type { OpenClawConfig } from "../config/config.js";
export declare function prepareModelForSimpleCompletion<TApi extends Api>(params: {
    model: Model<TApi>;
    cfg?: OpenClawConfig;
}): Model<Api>;
