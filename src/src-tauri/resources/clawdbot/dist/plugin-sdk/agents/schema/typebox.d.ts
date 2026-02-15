type StringEnumOptions<T extends readonly string[]> = {
    description?: string;
    title?: string;
    default?: T[number];
};
export declare function stringEnum<T extends readonly string[]>(values: T, options?: StringEnumOptions<T>): import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnsafe<T[number]>;
export declare function optionalStringEnum<T extends readonly string[]>(values: T, options?: StringEnumOptions<T>): import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnsafe<T[number]>>;
export declare function channelTargetSchema(options?: {
    description?: string;
}): import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
export declare function channelTargetsSchema(options?: {
    description?: string;
}): import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
export {};
