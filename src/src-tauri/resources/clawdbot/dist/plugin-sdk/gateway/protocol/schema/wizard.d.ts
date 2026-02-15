export declare const WizardStartParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"local">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"remote">]>>;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const WizardAnswerSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    stepId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    value: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
}>;
export declare const WizardNextParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    answer: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        stepId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        value: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    }>>;
}>;
export declare const WizardCancelParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const WizardStatusParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const WizardStepOptionSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    value: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown;
    label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    hint: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const WizardStepSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"note">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"select">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"text">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"confirm">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"multiselect">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"progress">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"action">]>;
    title: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    options: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        value: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown;
        label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        hint: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>>;
    initialValue: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    placeholder: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    sensitive: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    executor: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"gateway">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"client">]>>;
}>;
export declare const WizardNextResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    done: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    step: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"note">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"select">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"text">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"confirm">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"multiselect">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"progress">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"action">]>;
        title: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        options: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            value: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown;
            label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            hint: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>>;
        initialValue: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
        placeholder: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        sensitive: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        executor: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"gateway">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"client">]>>;
    }>>;
    status: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"running">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"done">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cancelled">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">]>>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const WizardStartResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    done: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    step: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"note">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"select">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"text">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"confirm">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"multiselect">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"progress">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"action">]>;
        title: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        options: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            value: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown;
            label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            hint: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>>;
        initialValue: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
        placeholder: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        sensitive: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        executor: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"gateway">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"client">]>>;
    }>>;
    status: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"running">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"done">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cancelled">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">]>>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const WizardStatusResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    status: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"running">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"done">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cancelled">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">]>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
