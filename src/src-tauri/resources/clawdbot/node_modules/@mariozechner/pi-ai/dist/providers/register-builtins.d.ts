import type { AssistantMessageEvent, Context, Model, SimpleStreamOptions } from "../types.js";
import type { BedrockOptions } from "./amazon-bedrock.js";
interface BedrockProviderModule {
    streamBedrock: (model: Model<"bedrock-converse-stream">, context: Context, options?: BedrockOptions) => AsyncIterable<AssistantMessageEvent>;
    streamSimpleBedrock: (model: Model<"bedrock-converse-stream">, context: Context, options?: SimpleStreamOptions) => AsyncIterable<AssistantMessageEvent>;
}
export declare function setBedrockProviderModule(module: BedrockProviderModule): void;
export declare function registerBuiltInApiProviders(): void;
export declare function resetApiProviders(): void;
export {};
//# sourceMappingURL=register-builtins.d.ts.map