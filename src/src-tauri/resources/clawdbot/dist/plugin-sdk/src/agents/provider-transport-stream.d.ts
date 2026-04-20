import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { Api, Model } from "@mariozechner/pi-ai";
export declare function isTransportAwareApiSupported(api: Api): boolean;
export declare function resolveTransportAwareSimpleApi(api: Api): Api | undefined;
export declare function createTransportAwareStreamFnForModel(model: Model<Api>): StreamFn | undefined;
export declare function createBoundaryAwareStreamFnForModel(model: Model<Api>): StreamFn | undefined;
export declare function prepareTransportAwareSimpleModel<TApi extends Api>(model: Model<TApi>): Model<Api>;
export declare function buildTransportAwareSimpleStreamFn(model: Model<Api>): StreamFn | undefined;
