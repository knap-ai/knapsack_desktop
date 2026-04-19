export declare const COMMAND_NAME_MAX_LENGTH = 200;
export declare const COMMAND_DESCRIPTION_MAX_LENGTH = 2000;
export declare const COMMAND_ALIAS_MAX_ITEMS = 20;
export declare const COMMAND_ARGS_MAX_ITEMS = 20;
export declare const COMMAND_ARG_NAME_MAX_LENGTH = 200;
export declare const COMMAND_ARG_DESCRIPTION_MAX_LENGTH = 500;
export declare const COMMAND_ARG_CHOICES_MAX_ITEMS = 50;
export declare const COMMAND_CHOICE_VALUE_MAX_LENGTH = 200;
export declare const COMMAND_CHOICE_LABEL_MAX_LENGTH = 200;
export declare const COMMAND_LIST_MAX_ITEMS = 500;
export declare const CommandSourceSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"skill">, import("@sinclair/typebox").TLiteral<"plugin">]>;
export declare const CommandScopeSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"text">, import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"both">]>;
export declare const CommandCategorySchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"session">, import("@sinclair/typebox").TLiteral<"options">, import("@sinclair/typebox").TLiteral<"status">, import("@sinclair/typebox").TLiteral<"management">, import("@sinclair/typebox").TLiteral<"media">, import("@sinclair/typebox").TLiteral<"tools">, import("@sinclair/typebox").TLiteral<"docks">]>;
export declare const CommandArgChoiceSchema: import("@sinclair/typebox").TObject<{
    value: import("@sinclair/typebox").TString;
    label: import("@sinclair/typebox").TString;
}>;
export declare const CommandArgSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"string">, import("@sinclair/typebox").TLiteral<"number">, import("@sinclair/typebox").TLiteral<"boolean">]>;
    required: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    choices: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        value: import("@sinclair/typebox").TString;
        label: import("@sinclair/typebox").TString;
    }>>>;
    dynamic: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export declare const CommandEntrySchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    nativeName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    textAliases: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    description: import("@sinclair/typebox").TString;
    category: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"session">, import("@sinclair/typebox").TLiteral<"options">, import("@sinclair/typebox").TLiteral<"status">, import("@sinclair/typebox").TLiteral<"management">, import("@sinclair/typebox").TLiteral<"media">, import("@sinclair/typebox").TLiteral<"tools">, import("@sinclair/typebox").TLiteral<"docks">]>>;
    source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"skill">, import("@sinclair/typebox").TLiteral<"plugin">]>;
    scope: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"text">, import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"both">]>;
    acceptsArgs: import("@sinclair/typebox").TBoolean;
    args: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"string">, import("@sinclair/typebox").TLiteral<"number">, import("@sinclair/typebox").TLiteral<"boolean">]>;
        required: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        choices: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            value: import("@sinclair/typebox").TString;
            label: import("@sinclair/typebox").TString;
        }>>>;
        dynamic: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>>>;
}>;
export declare const CommandsListParamsSchema: import("@sinclair/typebox").TObject<{
    agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    provider: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    scope: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"text">, import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"both">]>>;
    includeArgs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export declare const CommandsListResultSchema: import("@sinclair/typebox").TObject<{
    commands: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TString;
        nativeName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        textAliases: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        description: import("@sinclair/typebox").TString;
        category: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"session">, import("@sinclair/typebox").TLiteral<"options">, import("@sinclair/typebox").TLiteral<"status">, import("@sinclair/typebox").TLiteral<"management">, import("@sinclair/typebox").TLiteral<"media">, import("@sinclair/typebox").TLiteral<"tools">, import("@sinclair/typebox").TLiteral<"docks">]>>;
        source: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"skill">, import("@sinclair/typebox").TLiteral<"plugin">]>;
        scope: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"text">, import("@sinclair/typebox").TLiteral<"native">, import("@sinclair/typebox").TLiteral<"both">]>;
        acceptsArgs: import("@sinclair/typebox").TBoolean;
        args: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            name: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TString;
            type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"string">, import("@sinclair/typebox").TLiteral<"number">, import("@sinclair/typebox").TLiteral<"boolean">]>;
            required: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            choices: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
                value: import("@sinclair/typebox").TString;
                label: import("@sinclair/typebox").TString;
            }>>>;
            dynamic: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        }>>>;
    }>>;
}>;
