import { File as File$1, Expression as Expression$1 } from '@babel/types';
export { Expression, File } from '@babel/types';

declare const UnparenthesizedPipeBodyDescriptions: Set<"AssignmentExpression" | "ArrowFunctionExpression" | "ConditionalExpression" | "YieldExpression">;
type GetSetMemberType<T extends Set<any>> = T extends Set<infer M> ? M : unknown;
type UnparenthesizedPipeBodyTypes = GetSetMemberType<typeof UnparenthesizedPipeBodyDescriptions>;
declare const _default$4: {
    PipeTopicRequiresHackPipes: string;
    PipeTopicUnbound: string;
    PipeTopicUnconfiguredToken: ({ token }: {
        token: string;
    }) => string;
    PipeTopicUnused: string;
    PipeUnparenthesizedBody: ({ type }: {
        type: UnparenthesizedPipeBodyTypes;
    }) => string;
};

declare class Position {
    line: number;
    column: number;
    index: number;
    constructor(line: number, col: number, index: number);
}
declare class SourceLocation {
    start: Position;
    end: Position;
    filename: string | undefined;
    identifierName: string | undefined | null;
    constructor(start: Position, end?: Position);
}

declare const _default$3: {
    ImportMetaOutsideModule: {
        message: string;
        code: "BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED";
    };
    ImportOutsideModule: {
        message: string;
        code: "BABEL_PARSER_SOURCETYPE_MODULE_REQUIRED";
    };
};
//# sourceMappingURL=module-errors.d.ts.map

type LValAncestor = {
    type: "UpdateExpression";
    prefix: boolean;
} | {
    type: "ArrayPattern" | "AssignmentExpression" | "CatchClause" | "ForOfStatement" | "FormalParameters" | "ForInStatement" | "ForStatement" | "ImportSpecifier" | "ImportNamespaceSpecifier" | "ImportDefaultSpecifier" | "ParenthesizedExpression" | "ObjectPattern" | "RestElement" | "VariableDeclarator";
};
declare const _default$2: {
    AccessorIsGenerator: ({ kind }: {
        kind: "get" | "set";
    }) => string;
    ArgumentsInClass: string;
    AsyncFunctionInSingleStatementContext: string;
    AwaitBindingIdentifier: string;
    AwaitBindingIdentifierInStaticBlock: string;
    AwaitExpressionFormalParameter: string;
    AwaitUsingNotInAsyncContext: string;
    AwaitNotInAsyncContext: string;
    BadGetterArity: string;
    BadSetterArity: string;
    BadSetterRestParameter: string;
    ConstructorClassField: string;
    ConstructorClassPrivateField: string;
    ConstructorIsAccessor: string;
    ConstructorIsAsync: string;
    ConstructorIsGenerator: string;
    DeclarationMissingInitializer: ({ kind, }: {
        kind: "await using" | "const" | "destructuring" | "using";
    }) => string;
    DecoratorArgumentsOutsideParentheses: string;
    DecoratorsBeforeAfterExport: string;
    DecoratorConstructor: string;
    DecoratorSemicolon: string;
    DecoratorStaticBlock: string;
    DeferImportRequiresNamespace: string;
    DeletePrivateField: string;
    DestructureNamedImport: string;
    DuplicateConstructor: string;
    DuplicateDefaultExport: string;
    DuplicateExport: ({ exportName }: {
        exportName: string;
    }) => string;
    DuplicateProto: string;
    DuplicateRegExpFlags: string;
    ElementAfterRest: string;
    EscapedCharNotAnIdentifier: string;
    ExportBindingIsString: ({ localName, exportName, }: {
        localName: string;
        exportName: string;
    }) => string;
    ExportDefaultFromAsIdentifier: string;
    ForInOfLoopInitializer: ({ type, }: {
        type: "ForInStatement" | "ForOfStatement";
    }) => string;
    ForInUsing: string;
    ForOfAsync: string;
    ForOfLet: string;
    GeneratorInSingleStatementContext: string;
    IllegalBreakContinue: ({ type, }: {
        type: "BreakStatement" | "ContinueStatement";
    }) => string;
    IllegalLanguageModeDirective: string;
    IllegalReturn: string;
    ImportBindingIsString: ({ importName }: {
        importName: string;
    }) => string;
    ImportCallArity: string;
    ImportCallNotNewExpression: string;
    ImportCallSpreadArgument: string;
    IncompatibleRegExpUVFlags: string;
    InvalidBigIntLiteral: string;
    InvalidCodePoint: string;
    InvalidCoverDiscardElement: string;
    InvalidCoverInitializedName: string;
    InvalidDigit: ({ radix }: {
        radix: number;
    }) => string;
    InvalidEscapeSequence: string;
    InvalidEscapeSequenceTemplate: string;
    InvalidEscapedReservedWord: ({ reservedWord }: {
        reservedWord: string;
    }) => string;
    InvalidIdentifier: ({ identifierName }: {
        identifierName: string;
    }) => string;
    InvalidLhs: ({ ancestor }: {
        ancestor: LValAncestor;
    }) => string;
    InvalidLhsBinding: ({ ancestor }: {
        ancestor: LValAncestor;
    }) => string;
    InvalidLhsOptionalChaining: ({ ancestor }: {
        ancestor: LValAncestor;
    }) => string;
    InvalidNumber: string;
    InvalidOrMissingExponent: string;
    InvalidOrUnexpectedToken: ({ unexpected }: {
        unexpected: string;
    }) => string;
    InvalidParenthesizedAssignment: string;
    InvalidPrivateFieldResolution: ({ identifierName, }: {
        identifierName: string;
    }) => string;
    InvalidPropertyBindingPattern: string;
    InvalidRestAssignmentPattern: string;
    LabelRedeclaration: ({ labelName }: {
        labelName: string;
    }) => string;
    LetInLexicalBinding: string;
    LineTerminatorBeforeArrow: string;
    MalformedRegExpFlags: string;
    MissingClassName: string;
    MissingEqInAssignment: string;
    MissingSemicolon: string;
    MissingPlugin: ({ missingPlugin }: {
        missingPlugin: [string];
    }) => string;
    MissingOneOfPlugins: ({ missingPlugin }: {
        missingPlugin: string[];
    }) => string;
    MissingUnicodeEscape: string;
    MixingCoalesceWithLogical: string;
    ModuleAttributeInvalidValue: string;
    ModuleAttributesWithDuplicateKeys: ({ key }: {
        key: string;
    }) => string;
    ModuleExportNameHasLoneSurrogate: ({ surrogateCharCode, }: {
        surrogateCharCode: number;
    }) => string;
    ModuleExportUndefined: ({ localName }: {
        localName: string;
    }) => string;
    MultipleDefaultsInSwitch: string;
    NewlineAfterThrow: string;
    NoCatchOrFinally: string;
    NumberIdentifier: string;
    NumericSeparatorInEscapeSequence: string;
    ObsoleteAwaitStar: string;
    OptionalChainingNoNew: string;
    OptionalChainingNoTemplate: string;
    OverrideOnConstructor: string;
    ParamDupe: string;
    PatternHasAccessor: string;
    PatternHasMethod: string;
    PrivateInExpectedIn: ({ identifierName }: {
        identifierName: string;
    }) => string;
    PrivateNameRedeclaration: ({ identifierName }: {
        identifierName: string;
    }) => string;
    RestTrailingComma: string;
    SloppyFunction: string;
    SloppyFunctionAnnexB: string;
    SourcePhaseImportRequiresDefault: string;
    StaticPrototype: string;
    SuperNotAllowed: string;
    SuperPrivateField: string;
    TrailingDecorator: string;
    UnexpectedArgumentPlaceholder: string;
    UnexpectedDigitAfterHash: string;
    UnexpectedImportExport: string;
    UnexpectedKeyword: ({ keyword }: {
        keyword: string;
    }) => string;
    UnexpectedLeadingDecorator: string;
    UnexpectedLexicalDeclaration: string;
    UnexpectedNewTarget: string;
    UnexpectedNumericSeparator: string;
    UnexpectedPrivateField: string;
    UnexpectedReservedWord: ({ reservedWord }: {
        reservedWord: string;
    }) => string;
    UnexpectedSuper: string;
    UnexpectedToken: ({ expected, unexpected, }: {
        expected?: string | null;
        unexpected?: string | null;
    }) => string;
    UnexpectedTokenUnaryExponentiation: string;
    UnexpectedUsingDeclaration: string;
    UnexpectedVoidPattern: string;
    UnsupportedBind: string;
    UnsupportedDecoratorExport: string;
    UnsupportedDefaultExport: string;
    UnsupportedImport: string;
    UnsupportedMetaProperty: ({ target, onlyValidPropertyName, }: {
        target: string;
        onlyValidPropertyName: string;
    }) => string;
    UnsupportedParameterDecorator: string;
    UnsupportedPropertyDecorator: string;
    UnsupportedSuper: string;
    UnterminatedComment: string;
    UnterminatedRegExp: string;
    UnterminatedString: string;
    UnterminatedTemplate: string;
    UsingDeclarationExport: string;
    UsingDeclarationHasBindingPattern: string;
    VarRedeclaration: ({ identifierName }: {
        identifierName: string;
    }) => string;
    VoidPatternCatchClauseParam: string;
    VoidPatternInitializer: string;
    YieldBindingIdentifier: string;
    YieldInParameter: string;
    YieldNotInGeneratorFunction: string;
    ZeroDigitNumericSeparator: string;
};

declare const _default$1: {
    StrictDelete: string;
    StrictEvalArguments: ({ referenceName }: {
        referenceName: string;
    }) => string;
    StrictEvalArgumentsBinding: ({ bindingName }: {
        bindingName: string;
    }) => string;
    StrictFunction: string;
    StrictNumericEscape: string;
    StrictOctalLiteral: string;
    StrictWith: string;
};
//# sourceMappingURL=strict-mode-errors.d.ts.map

declare const _default: {
    ParseExpressionEmptyInput: string;
    ParseExpressionExpectsEOF: ({ unexpected }: {
        unexpected: number;
    }) => string;
};
//# sourceMappingURL=parse-expression-errors.d.ts.map

declare class TokContext {
    constructor(token: string, preserveSpace?: boolean);
    token: string;
    preserveSpace: boolean;
}

type TokenOptions = {
    keyword?: string;
    beforeExpr?: boolean;
    startsExpr?: boolean;
    rightAssociative?: boolean;
    isLoop?: boolean;
    isAssign?: boolean;
    prefix?: boolean;
    postfix?: boolean;
    binop?: number | null;
};
type TokenType = number;
declare class ExportedTokenType {
    label: string;
    keyword: string | undefined | null;
    beforeExpr: boolean;
    startsExpr: boolean;
    rightAssociative: boolean;
    isLoop: boolean;
    isAssign: boolean;
    prefix: boolean;
    postfix: boolean;
    binop: number | undefined | null;
    constructor(label: string, conf?: TokenOptions);
}

type TopicContextState = {
    maxNumOfResolvableTopics: number;
    maxTopicIndex: null | 0;
};
declare const enum LoopLabelKind {
    Loop = 1,
    Switch = 2
}
declare class State {
    flags: number;
    accessor strict: boolean;
    startIndex: number;
    curLine: number;
    lineStart: number;
    startLoc: Position;
    endLoc: Position;
    init({ strictMode, sourceType, startIndex, startLine, startColumn, }: OptionsWithDefaults): void;
    errors: ParseError[];
    potentialArrowAt: number;
    noArrowAt: number[];
    noArrowParamsConversionAt: number[];
    accessor inType: boolean;
    accessor noAnonFunctionType: boolean;
    accessor hasFlowComment: boolean;
    accessor isAmbientContext: boolean;
    accessor inAbstractClass: boolean;
    accessor inDisallowConditionalTypesContext: boolean;
    topicContext: TopicContextState;
    accessor soloAwait: boolean;
    accessor inFSharpPipelineDirectBody: boolean;
    labels: {
        kind: LoopLabelKind | null;
        name?: string | null;
        statementStart?: number;
    }[];
    commentsLen: number;
    commentStack: CommentWhitespace[];
    pos: number;
    type: TokenType;
    value: any;
    start: number;
    end: number;
    lastTokEndLoc: Position | null;
    lastTokStartLoc: Position | null;
    context: TokContext[];
    accessor canStartJSXElement: boolean;
    accessor containsEsc: boolean;
    firstInvalidTemplateEscapePos: null | Position;
    accessor hasTopLevelAwait: boolean;
    strictErrors: Map<number, [ParseErrorConstructor<object>, Position]>;
    tokensLength: number;
    /**
     * When we add a new property, we must manually update the `clone` method
     * @see State#clone
     */
    curPosition(): Position;
    clone(): State;
}

interface CommentBase {
    type: "CommentBlock" | "CommentLine";
    value: string;
    start: number;
    end: number;
    loc: SourceLocation;
}
interface CommentBlock extends CommentBase {
    type: "CommentBlock";
}
interface CommentLine extends CommentBase {
    type: "CommentLine";
}
type Comment = CommentBlock | CommentLine;
interface NodeBase {
    start: number;
    end: number;
    loc: SourceLocation;
    range?: [number, number];
    leadingComments?: Comment[];
    trailingComments?: Comment[];
    innerComments?: Comment[];
    extra?: Record<string, any>;
}
type NodeAny<T extends string, KnownProps = object> = NodeBase & {
    type: T;
    [key: string]: any;
} & KnownProps;
type Expression = ArrayExpression | AssignmentExpression | BinaryExpression | CallExpression | ConditionalExpression | FunctionExpression | Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | RegExpLiteral | LogicalExpression | MemberExpression | NewExpression | ObjectExpression | SequenceExpression | ParenthesizedExpression | ThisExpression | UnaryExpression | UpdateExpression | ArrowFunctionExpression | ClassExpression | ImportExpression | MetaProperty | Super | TaggedTemplateExpression | TemplateLiteral | YieldExpression | AwaitExpression | Import | BigIntLiteral | OptionalMemberExpression | OptionalCallExpression | TypeCastExpression | JSXElement | JSXFragment | BindExpression | DoExpression | ModuleExpression | TopicReference | TsInstantiationExpression | TsAsExpression | TsSatisfiesExpression | TsTypeAssertion | TsTypeCastExpression | TsNonNullExpression | EstreeChainExpression | EstreeLiteral;
type Statement = BlockStatement | BreakStatement | ContinueStatement | DebuggerStatement | DoWhileStatement | EmptyStatement | ExpressionStatement | ForInStatement | ForStatement | FunctionDeclaration | IfStatement | LabeledStatement | ReturnStatement | SwitchStatement | ThrowStatement | TryStatement | VariableDeclaration | WhileStatement | WithStatement | ClassDeclaration | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ForOfStatement | ImportDeclaration | FlowDeclareClass | FlowDeclareFunction | FlowDeclareInterface | FlowDeclareModule | FlowDeclareModuleExports | FlowDeclareTypeAlias | FlowDeclareOpaqueType | FlowDeclareVariable | FlowDeclareExportDeclaration | FlowEnumDeclaration | FlowInterface | FlowOpaqueType | FlowTypeAlias | TSDeclareFunction | TsInterfaceDeclaration | TsTypeAliasDeclaration | TsEnumDeclaration | TsModuleDeclaration | TsImportEqualsDeclaration | TsExportAssignment | TsNamespaceExportDeclaration;
type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | VoidPattern;
type Declaration = VariableDeclaration | ClassDeclaration | FunctionDeclaration | TsImportEqualsDeclaration | TsInterfaceDeclaration | TsTypeAliasDeclaration | TsEnumDeclaration | TsModuleDeclaration;
interface DeclarationBase extends NodeBase {
    declare?: boolean;
}
interface HasDecorators extends NodeBase {
    decorators?: Decorator[];
}
interface InterpreterDirective extends NodeBase {
    type: "InterpreterDirective";
    value: string;
}
interface Identifier extends PatternBase {
    type: "Identifier";
    name: string;
    __clone(): Identifier;
    optional?: boolean;
}
interface V8IntrinsicIdentifier extends NodeBase {
    type: "V8IntrinsicIdentifier";
    name: string;
}
interface PrivateName extends NodeBase {
    type: "PrivateName";
    id: Identifier;
}
type Literal = RegExpLiteral | NullLiteral | StringLiteral | BooleanLiteral | NumericLiteral | BigIntLiteral;
type RegExpFlag = "g" | "i" | "m" | "u" | "s" | "y" | "v";
interface RegExpLiteral extends NodeBase {
    type: "RegExpLiteral";
    pattern: string;
    flags: RegExpFlag[];
}
interface NullLiteral extends NodeBase {
    type: "NullLiteral";
}
interface StringLiteral extends NodeBase {
    type: "StringLiteral";
    value: string;
}
interface BooleanLiteral extends NodeBase {
    type: "BooleanLiteral";
    value: boolean;
}
interface NumericLiteral extends NodeBase {
    type: "NumericLiteral";
    value: number;
}
interface BigIntLiteral extends NodeBase {
    type: "BigIntLiteral";
    value: bigint;
}
type ExportedToken = Omit<Token, "type"> & {
    type: ExportedTokenType;
};
interface ParserOutput {
    comments: Comment[];
    errors: ParseError[];
    tokens?: (ExportedToken | Comment)[];
}
interface File extends NodeBase, ParserOutput {
    type: "File";
    program: Program;
}
interface Program extends NodeBase {
    type: "Program";
    sourceType: SourceType;
    body: (Statement | ModuleDeclaration)[];
    directives: Directive[];
    interpreter: InterpreterDirective | null;
}
interface BodilessFunctionOrMethodBase extends HasDecorators {
    id: Identifier | undefined | null;
    params: (Pattern | TSParameterProperty)[];
    generator: boolean;
    async: boolean;
    expression: boolean;
    typeParameters?: TypeParameterDeclarationBase | null;
    returnType?: TypeAnnotationBase | null;
}
interface FunctionBase extends BodilessFunctionOrMethodBase {
    body: BlockStatement;
}
interface ExpressionStatement extends NodeBase {
    type: "ExpressionStatement";
    expression: Expression;
    directive?: Directive | undefined;
}
interface BlockStatement extends NodeBase {
    type: "BlockStatement";
    body: Statement[];
    directives: Directive[];
}
interface EmptyStatement extends NodeBase {
    type: "EmptyStatement";
}
interface DebuggerStatement extends NodeBase {
    type: "DebuggerStatement";
}
interface WithStatement extends NodeBase {
    type: "WithStatement";
    object: Expression;
    body: Statement;
}
interface ReturnStatement extends NodeBase {
    type: "ReturnStatement";
    argument: Expression | undefined | null;
}
interface LabeledStatement extends NodeBase {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}
interface BreakStatement extends NodeBase {
    type: "BreakStatement";
    label: Identifier | undefined | null;
}
interface ContinueStatement extends NodeBase {
    type: "ContinueStatement";
    label: Identifier | undefined | null;
}
interface IfStatement extends NodeBase {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate: Statement | undefined | null;
}
interface SwitchStatement extends NodeBase {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}
interface SwitchCase extends NodeBase {
    type: "SwitchCase";
    test: Expression | undefined | null;
    consequent: Statement[];
}
interface ThrowStatement extends NodeBase {
    type: "ThrowStatement";
    argument: Expression;
}
interface TryStatement extends NodeBase {
    type: "TryStatement";
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}
interface CatchClause extends NodeBase {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
}
interface WhileStatement extends NodeBase {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
}
interface DoWhileStatement extends NodeBase {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
}
interface ForStatement extends NodeBase {
    type: "ForStatement";
    init: VariableDeclaration | Expression | undefined | null;
    test: Expression | undefined | null;
    update: Expression | undefined | null;
    body: Statement;
}
interface ForInOfBase extends NodeBase {
    left: VariableDeclaration | Assignable;
    right: Expression;
    body: Statement;
}
interface ForInStatement extends ForInOfBase {
    type: "ForInStatement";
    await: boolean;
}
interface ForOfStatement extends ForInOfBase {
    type: "ForOfStatement";
    await: boolean;
}
interface OptFunctionDeclaration extends FunctionBase, DeclarationBase {
    type: "FunctionDeclaration";
}
interface FunctionDeclaration extends OptFunctionDeclaration {
    id: Identifier;
}
interface VariableDeclaration extends DeclarationBase, HasDecorators {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const" | "using" | "await using";
}
interface VariableDeclarator extends NodeBase {
    type: "VariableDeclarator";
    id: Pattern;
    init: Expression | undefined | null;
    definite?: boolean;
}
interface ArgumentPlaceholder extends NodeBase {
    type: "ArgumentPlaceholder";
}
interface Decorator extends NodeBase {
    type: "Decorator";
    expression: Expression;
}
interface Directive extends NodeBase {
    type: "Directive";
    value: DirectiveLiteral;
}
interface DirectiveLiteral extends NodeBase {
    type: "DirectiveLiteral";
    value: string;
}
interface ImportAttribute extends NodeBase {
    type: "ImportAttribute";
    key: Identifier | StringLiteral;
    value: StringLiteral;
}
interface Super extends NodeBase {
    type: "Super";
}
interface Import extends NodeBase {
    type: "Import";
}
interface ThisExpression extends NodeBase {
    type: "ThisExpression";
}
interface ArrowFunctionExpression extends BodilessFunctionOrMethodBase {
    type: "ArrowFunctionExpression";
    body: BlockStatement | Expression;
}
interface YieldExpression extends NodeBase {
    type: "YieldExpression";
    argument: Expression | undefined | null;
    delegate: boolean;
}
interface AwaitExpression extends NodeBase {
    type: "AwaitExpression";
    argument: Expression;
}
interface ArrayExpression extends NodeBase {
    type: "ArrayExpression";
    elements: (Expression | SpreadElement | null)[];
}
interface DoExpression extends NodeBase {
    type: "DoExpression";
    body: BlockStatement | undefined | null;
    async: boolean;
}
interface ObjectExpression extends NodeBase {
    type: "ObjectExpression";
    properties: (ObjectProperty | ObjectMethod | SpreadElement)[];
}
interface ObjectMemberBase extends NodeBase {
    computed: boolean;
    value: Expression | Pattern;
    decorators?: Decorator[];
    kind?: "get" | "set" | "method";
    method: boolean;
    typeParameters?: TypeParameterDeclarationBase | null;
    variance?: FlowVariance | null;
}
interface ObjectProperty extends ObjectMemberBase {
    type: "ObjectProperty";
    shorthand: boolean;
    key: Expression | PrivateName;
    value: Expression | Pattern;
}
interface ObjectMethod extends ObjectMemberBase, FunctionBase {
    type: "ObjectMethod";
    kind: "get" | "set" | "method";
    key: Expression;
    value: Expression;
}
interface FunctionExpression extends FunctionBase, DeclarationBase {
    type: "FunctionExpression";
}
interface UnaryExpression extends NodeBase {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: boolean;
    argument: Expression;
}
type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete" | "throw";
interface UpdateExpression extends NodeBase {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}
type UpdateOperator = "++" | "--";
interface BinaryExpression extends NodeBase {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression | PrivateName;
    right: Expression;
}
type BinaryOperator = "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "|" | "^" | "&" | "in" | "instanceof";
type Assignable = Pattern | MemberExpression | ParenthesizedExpression | TsTypeCastExpression | TypeCastExpression;
interface AssignmentExpression extends NodeBase {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Assignable;
    right: Expression;
}
type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=" | "&&=" | "||=" | "??=";
interface LogicalExpression extends NodeBase {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}
type LogicalOperator = "||" | "&&";
interface SpreadElement extends NodeBase, PatternBase {
    type: "SpreadElement";
    argument: Expression;
    value: undefined;
}
interface MemberExpression extends NodeBase {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateName;
    computed: boolean;
    optional?: boolean;
}
interface OptionalMemberExpression extends NodeBase {
    type: "OptionalMemberExpression";
    object: Expression | Super;
    property: Expression | PrivateName;
    computed: boolean;
    optional: boolean;
}
interface OptionalCallExpression extends CallOrNewBase {
    type: "OptionalCallExpression";
    optional: boolean;
}
interface BindExpression extends NodeBase {
    type: "BindExpression";
    object: Expression | undefined | null;
    callee: Expression;
}
interface ConditionalExpression extends NodeBase {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
}
interface CallOrNewBase extends NodeBase {
    callee: Expression | Super | Import;
    arguments: (Expression | SpreadElement)[];
    optional: boolean;
    typeArguments: TypeParameterInstantiationBase | undefined | null;
}
interface CallExpression extends CallOrNewBase {
    type: "CallExpression";
}
interface NewExpression extends CallOrNewBase {
    type: "NewExpression";
}
interface ImportExpression extends NodeBase {
    type: "ImportExpression";
    source: Expression;
    phase?: null | "source" | "defer";
    options: Expression | null;
}
interface SequenceExpression extends NodeBase {
    type: "SequenceExpression";
    expressions: Expression[];
}
interface ParenthesizedExpression extends NodeBase {
    type: "ParenthesizedExpression";
    expression: Expression;
}
interface TopicReference extends NodeBase {
    type: "TopicReference";
}
interface TemplateLiteral extends NodeBase {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[] | TsType[];
}
interface TaggedTemplateExpression extends NodeBase {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
    typeArguments?: TypeParameterInstantiationBase | null;
}
interface TemplateElement extends NodeBase {
    type: "TemplateElement";
    tail: boolean;
    value: {
        cooked: string;
        raw: string;
    };
}
interface ModuleExpression extends NodeBase {
    type: "ModuleExpression";
    body: Program;
}
type Accessibility = "public" | "protected" | "private";
type VarianceAnnotations = "in" | "out";
interface PatternBase extends HasDecorators {
    optional?: boolean;
    typeAnnotation?: TypeAnnotationBase | null;
}
interface AssignmentProperty extends ObjectProperty {
    value: Pattern;
}
interface ObjectPattern extends PatternBase {
    type: "ObjectPattern";
    properties: (AssignmentProperty | RestElement)[];
}
interface ArrayPattern extends PatternBase {
    type: "ArrayPattern";
    elements: (Pattern | null)[];
}
interface RestElement extends PatternBase {
    type: "RestElement";
    argument: Pattern;
    value: undefined;
}
interface AssignmentPattern extends PatternBase {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
}
interface VoidPattern extends PatternBase {
    type: "VoidPattern";
}
interface ClassBase extends HasDecorators {
    id: Identifier | undefined | null;
    superClass: Expression | undefined | null;
    body: ClassBody;
    decorators?: Decorator[];
    typeParameters?: TypeParameterDeclarationBase | null;
    superTypeArguments?: TypeParameterInstantiationBase | null;
    abstract?: boolean;
    implements?: TSClassImplements[] | undefined | null | FlowClassImplements[];
}
interface ClassBody extends NodeBase {
    type: "ClassBody";
    body: (ClassMember | StaticBlock | TsIndexSignature)[];
}
interface ClassMemberBase extends NodeBase, HasDecorators {
    static: boolean;
    computed: boolean;
    accessibility?: Accessibility | null;
    override?: true | null;
    abstract?: true | null;
    optional?: true | null;
}
interface StaticBlock extends NodeBase {
    type: "StaticBlock";
    body: Statement[];
}
type ClassMember = ClassMethod | ClassPrivateMethod | ClassProperty | ClassPrivateProperty | ClassAccessorProperty;
interface MethodBase extends FunctionBase {
    kind: MethodKind;
}
type MethodKind = "constructor" | "method" | "get" | "set";
interface ClassMethodOrDeclareMethodCommon extends ClassMemberBase {
    key: Expression | PrivateName;
    kind: MethodKind;
    static: boolean;
    declare?: boolean;
    decorators?: Decorator[];
}
interface ClassMethod extends MethodBase, ClassMethodOrDeclareMethodCommon {
    type: "ClassMethod";
    variance?: FlowVariance | null;
}
interface ClassPrivateMethod extends NodeBase, ClassMethodOrDeclareMethodCommon, MethodBase {
    type: "ClassPrivateMethod";
    key: PrivateName;
    computed: false;
    variance?: FlowVariance | null;
}
interface ClassProperty extends ClassMemberBase, DeclarationBase {
    type: "ClassProperty";
    key: Expression;
    value: Expression | undefined | null;
    typeAnnotation?: TypeAnnotationBase | null;
    variance?: FlowVariance | null;
    readonly?: true;
    definite?: true;
}
interface ClassPrivateProperty extends NodeBase {
    type: "ClassPrivateProperty";
    key: PrivateName;
    value: Expression | undefined | null;
    static: boolean;
    computed: false;
    typeAnnotation?: TypeAnnotationBase | null;
    optional?: true;
    definite?: true;
    readonly?: true;
    override?: true;
    abstract?: null;
    accessibility?: null;
    variance?: FlowVariance | null;
}
interface ClassAccessorProperty extends ClassMemberBase, DeclarationBase {
    type: "ClassAccessorProperty";
    key: Expression | PrivateName;
    value: Expression | undefined | null;
    typeAnnotation?: TypeAnnotationBase | null;
    variance?: FlowVariance | null;
    readonly?: true;
    definite?: true;
}
interface OptClassDeclaration extends ClassBase, DeclarationBase, HasDecorators {
    type: "ClassDeclaration";
    abstract?: boolean;
}
interface ClassDeclaration extends OptClassDeclaration {
    id: Identifier;
}
interface ClassExpression extends ClassBase, DeclarationBase {
    type: "ClassExpression";
}
interface MetaProperty extends NodeBase {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
}
type ModuleDeclaration = AnyImport | AnyExport;
type AnyImport = ImportDeclaration | TsImportEqualsDeclaration;
type AnyExport = ExportNamedDeclaration | ExportDefaultDeclaration | ExportAllDeclaration | TsExportAssignment | TsImportEqualsDeclaration | TsNamespaceExportDeclaration;
interface ModuleSpecifier extends NodeBase {
    local: Identifier;
}
interface ImportDeclaration extends NodeBase {
    type: "ImportDeclaration";
    specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
    source: Literal;
    importKind?: "type" | "typeof" | "value";
    phase?: null | "source" | "defer";
    attributes?: ImportAttribute[];
    module?: boolean;
}
interface ImportSpecifier extends ModuleSpecifier {
    type: "ImportSpecifier";
    imported: Identifier | StringLiteral;
    importKind?: "type" | "value";
}
interface ImportDefaultSpecifier extends ModuleSpecifier {
    type: "ImportDefaultSpecifier";
}
interface ImportNamespaceSpecifier extends ModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}
interface ExportNamedDeclaration extends NodeBase {
    type: "ExportNamedDeclaration";
    declaration: Declaration | undefined | null;
    specifiers: (ExportSpecifier | ExportDefaultSpecifier | ExportNamespaceSpecifier)[];
    source: Literal | undefined | null;
    exportKind?: "type" | "value";
    attributes?: ImportAttribute[];
}
interface ExportSpecifier extends NodeBase {
    type: "ExportSpecifier";
    exported: Identifier | StringLiteral;
    local: Identifier;
    exportKind?: "type" | "value";
}
interface ExportDefaultSpecifier extends NodeBase {
    type: "ExportDefaultSpecifier";
    exported: Identifier;
}
interface ExportNamespaceSpecifier extends NodeBase {
    type: "ExportNamespaceSpecifier";
    exported: Identifier | StringLiteral;
}
interface ExportDefaultDeclaration extends NodeBase {
    type: "ExportDefaultDeclaration";
    declaration: OptFunctionDeclaration | OptTSDeclareFunction | OptClassDeclaration | FlowEnumDeclaration | TsInterfaceDeclaration | Expression;
}
interface ExportAllDeclaration extends NodeBase {
    type: "ExportAllDeclaration";
    source: Literal;
    exportKind?: "type" | "value";
    attributes?: ImportAttribute[];
}
type JSXIdentifier = NodeAny<"JSXIdentifier">;
type JSXNamespacedName = NodeAny<"JSXNamespacedName">;
type JSXMemberExpression = NodeAny<"JSXMemberExpression">;
type JSXEmptyExpression = NodeAny<"JSXEmptyExpression">;
type JSXSpreadChild = NodeAny<"JSXSpreadChild">;
type JSXExpressionContainer = NodeAny<"JSXExpressionContainer">;
type JSXAttribute = NodeAny<"JSXAttribute">;
type JSXSpreadAttribute = NodeAny<"JSXSpreadAttribute">;
interface JSXOpeningElement extends NodeBase {
    type: "JSXOpeningElement";
    name: JSXNamespacedName | JSXMemberExpression;
    typeArguments?: TypeParameterInstantiationBase | null;
    attributes: (JSXAttribute | JSXSpreadAttribute)[];
    selfClosing: boolean;
}
type JSXClosingElement = NodeAny<"JSXClosingElement">;
type JSXElement = NodeAny<"JSXElement">;
type JSXOpeningFragment = NodeAny<"JSXOpeningFragment">;
type JSXClosingFragment = NodeAny<"JSXClosingFragment">;
type JSXFragment = NodeAny<"JSXFragment">;
type JSXText = NodeAny<"JSXText">;
interface TypeAnnotationBase extends NodeBase {
    typeAnnotation: Node;
}
interface TypeAnnotation extends NodeBase {
    type: "TypeAnnotation";
    typeAnnotation: FlowType;
}
interface TsTypeAnnotation extends NodeBase {
    type: "TSTypeAnnotation";
    typeAnnotation: TsType;
}
interface TypeParameterDeclarationBase extends NodeBase {
    params: (TypeParameter | TsTypeParameter)[];
}
interface TypeParameterDeclaration extends TypeParameterDeclarationBase {
    type: "TypeParameterDeclaration";
    params: TypeParameter[];
}
interface TsTypeParameterDeclaration extends TypeParameterDeclarationBase {
    type: "TSTypeParameterDeclaration";
    params: TsTypeParameter[];
}
interface TypeParameter extends NodeBase {
    type: "TypeParameter";
    name: string;
    default?: TypeAnnotation;
}
interface TsTypeParameter extends NodeBase {
    type: "TSTypeParameter";
    name: Identifier;
    in?: boolean;
    out?: boolean;
    const?: boolean;
    constraint?: TsType;
    default?: TsType;
}
interface TypeParameterInstantiationBase extends NodeBase {
    params: Node[];
}
interface TypeParameterInstantiation extends TypeParameterInstantiationBase {
    type: "TypeParameterInstantiation";
    params: FlowType[];
}
interface TsTypeParameterInstantiation extends TypeParameterInstantiationBase {
    type: "TSTypeParameterInstantiation";
    params: TsType[];
}
interface TypeCastExpression extends NodeBase {
    type: "TypeCastExpression";
    expression: Expression;
    typeAnnotation: TypeAnnotation;
}
interface TsTypeCastExpression extends NodeBase {
    type: "TSTypeCastExpression";
    expression: Expression;
    typeAnnotation: TsTypeAnnotation;
}
type FlowPredicate = NodeAny<"DeclaredPredicate"> | NodeAny<"InferredPredicate">;
type FlowDeclareClass = NodeAny<"DeclareClass">;
type FlowDeclareExportDeclaration = NodeAny<"DeclareExportDeclaration"> | NodeAny<"DeclareExportDefaultDeclaration"> | NodeAny<"DeclareExportAllDeclaration">;
type FlowDeclareFunction = NodeAny<"DeclareFunction">;
type FlowDeclareVariable = NodeAny<"DeclareVariable">;
type FlowDeclareModule = NodeAny<"DeclareModule">;
type FlowDeclareModuleExports = NodeAny<"DeclareModuleExports">;
type FlowDeclareTypeAlias = NodeAny<"DeclareTypeAlias">;
type FlowDeclareOpaqueType = NodeAny<"DeclareOpaqueType">;
type FlowDeclareInterface = NodeAny<"DeclareInterface">;
type FlowInterface = NodeAny<"InterfaceDeclaration">;
type FlowInterfaceExtends = NodeAny<"InterfaceExtends">;
type FlowTypeAlias = NodeAny<"TypeAlias">;
type FlowOpaqueType = NodeAny<"OpaqueType">;
type FlowObjectTypeIndexer = NodeAny<"ObjectTypeIndexer">;
type FlowObjectTypeInternalSlot = NodeAny<"ObjectTypeInternalSlot">;
type FlowEnumDeclaration = NodeAny<"EnumDeclaration">;
type FlowEnumBody = NodeAny<"EnumBooleanBody" | "EnumNumberBody" | "EnumStringBody" | "EnumSymbolBody">;
type FlowEnumMember = NodeAny<"EnumBooleanMember"> | NodeAny<"EnumNumberMember"> | NodeAny<"EnumStringMember"> | NodeAny<"EnumDefaultedMember">;
type FlowFunctionTypeAnnotation = NodeAny<"FunctionTypeAnnotation">;
type FlowObjectTypeProperty = NodeAny<"ObjectTypeProperty">;
type FlowObjectTypeSpreadProperty = NodeAny<"ObjectTypeSpreadProperty">;
type FlowObjectTypeCallProperty = NodeAny<"ObjectTypeCallProperty">;
type FlowObjectTypeAnnotation = NodeAny<"ObjectTypeAnnotation">;
type FlowQualifiedTypeIdentifier = NodeAny<"QualifiedTypeIdentifier">;
type FlowGenericTypeAnnotation = NodeAny<"GenericTypeAnnotation">;
type FlowTypeofTypeAnnotation = NodeAny<"TypeofTypeAnnotation">;
type FlowTupleTypeAnnotation = NodeAny<"TupleTypeAnnotation">;
type FlowFunctionTypeParam = NodeAny<"FunctionTypeParam">;
type FlowOtherTypeAnnotation = NodeAny<"AnyTypeAnnotation" | "BooleanTypeAnnotation" | "MixedTypeAnnotation" | "EmptyTypeAnnotation" | "ExistsTypeAnnotation" | "NumberTypeAnnotation" | "StringTypeAnnotation" | "SymbolTypeAnnotation" | "NullLiteralTypeAnnotation" | "VoidTypeAnnotation" | "ThisTypeAnnotation" | "ArrayTypeAnnotation" | "NullableTypeAnnotation" | "IntersectionTypeAnnotation" | "UnionTypeAnnotation">;
type FlowType = FlowFunctionTypeAnnotation | FlowObjectTypeAnnotation | FlowGenericTypeAnnotation | FlowTypeofTypeAnnotation | FlowTupleTypeAnnotation | FlowInterfaceType | FlowIndexedAccessType | FlowOptionalIndexedAccessType | FlowOtherTypeAnnotation | StringLiteralTypeAnnotation | BooleanLiteralTypeAnnotation | NumberLiteralTypeAnnotation | BigIntLiteralTypeAnnotation | Identifier;
type FlowVariance = NodeAny<"Variance">;
type FlowClassImplements = NodeAny<"ClassImplements">;
interface FlowInterfaceType extends NodeBase {
    type: "InterfaceTypeAnnotation";
    extends: FlowInterfaceExtends[];
    body: FlowObjectTypeAnnotation;
}
interface FlowIndexedAccessType extends NodeBase {
    type: "IndexedAccessType";
    objectType: FlowType;
    indexType: FlowType;
}
interface FlowOptionalIndexedAccessType extends NodeBase {
    type: "OptionalIndexedAccessType";
    objectType: FlowType;
    indexType: FlowType;
    optional: boolean;
}
interface StringLiteralTypeAnnotation extends NodeBase {
    type: "StringLiteralTypeAnnotation";
    value: string;
}
interface BooleanLiteralTypeAnnotation extends NodeBase {
    type: "BooleanLiteralTypeAnnotation";
    value: boolean;
}
interface NumberLiteralTypeAnnotation extends NodeBase {
    type: "NumberLiteralTypeAnnotation";
    value: number;
}
interface BigIntLiteralTypeAnnotation extends NodeBase {
    type: "BigIntLiteralTypeAnnotation";
    value: number;
}
interface EstreeLiteral extends NodeBase {
    type: "Literal";
    value: any;
    raw: any;
}
interface EstreeProperty extends NodeBase {
    type: "Property";
    method: boolean;
    shorthand: boolean;
    key: Expression | EstreePrivateIdentifier;
    computed: boolean;
    value: Expression;
    decorators: Decorator[];
    kind?: "get" | "set" | "init";
    variance?: FlowVariance | null;
    optional?: boolean;
}
interface EstreeMethodDefinitionBase extends NodeBase {
    static: boolean;
    key: Expression;
    computed: boolean;
    decorators: Decorator[];
    kind?: "get" | "set" | "method";
    accessibility?: Accessibility | null;
    override?: boolean;
    optional?: boolean;
}
interface EstreeMethodDefinition extends EstreeMethodDefinitionBase {
    type: "MethodDefinition";
    value: FunctionExpression;
    variance?: FlowVariance | null;
}
interface EstreePrivateIdentifier extends NodeBase {
    type: "PrivateIdentifier";
    name: string;
}
interface EstreePropertyDefinitionBase extends NodeBase {
    static: boolean;
    key: Expression | EstreePrivateIdentifier;
    computed: boolean;
    accessibility?: Accessibility | null;
    override?: boolean;
    optional?: boolean;
    declare?: boolean;
    decorators?: Decorator[];
    definite?: boolean;
    readonly?: boolean;
    typeAnnotation?: TsTypeAnnotation | null;
}
interface EstreePropertyDefinition extends EstreePropertyDefinitionBase {
    type: "PropertyDefinition";
    value: Expression;
}
interface EstreeAccessorProperty extends EstreePropertyDefinitionBase {
    type: "AccessorProperty";
    value: Expression;
}
interface EstreeChainExpression extends NodeBase {
    type: "ChainExpression";
    expression: Expression;
}
interface TSParameterProperty extends HasDecorators {
    type: "TSParameterProperty";
    accessibility?: Accessibility | null;
    readonly?: boolean;
    override?: boolean;
    parameter: Identifier | AssignmentPattern;
    static?: false;
}
interface OptTSDeclareFunction extends FunctionBase, DeclarationBase {
    type: "TSDeclareFunction";
}
interface TSDeclareFunction extends OptTSDeclareFunction {
    id: Identifier;
}
interface TSDeclareMethod extends FunctionBase, ClassMethodOrDeclareMethodCommon {
    type: "TSDeclareMethod";
    kind: MethodKind;
}
interface TsQualifiedName extends NodeBase {
    type: "TSQualifiedName";
    left: TsEntityName;
    right: Identifier;
}
type TsEntityName = Identifier | ThisExpression | TsQualifiedName;
interface TsSignatureDeclarationOrIndexSignatureBase extends NodeBase {
    returnType: TsTypeAnnotation | undefined | null;
    typeAnnotation: TsTypeAnnotation | undefined | null;
}
interface TsSignatureDeclarationBase extends TsSignatureDeclarationOrIndexSignatureBase {
    params: (Identifier | RestElement | ObjectPattern | ArrayPattern | VoidPattern)[];
    typeParameters: TsTypeParameterDeclaration | undefined | null;
}
interface TsIndexSignatureBase extends TsSignatureDeclarationOrIndexSignatureBase {
    parameters: (Identifier | RestElement | ObjectPattern | ArrayPattern | VoidPattern)[];
}
type TsTypeElement = TsCallSignatureDeclaration | TsConstructSignatureDeclaration | TsPropertySignature | TsMethodSignature | TsIndexSignature;
interface TsCallSignatureDeclaration extends TsSignatureDeclarationBase {
    type: "TSCallSignatureDeclaration";
}
interface TsConstructSignatureDeclaration extends TsSignatureDeclarationBase {
    type: "TSConstructSignatureDeclaration";
}
interface TsNamedTypeElementBase extends NodeBase {
    key: Expression;
    computed: boolean;
    optional?: boolean;
    accessibility?: Accessibility | undefined;
    readonly?: boolean;
    static?: boolean;
}
interface TsPropertySignature extends TsNamedTypeElementBase {
    type: "TSPropertySignature";
    typeAnnotation?: TsTypeAnnotation;
}
interface TsMethodSignature extends TsSignatureDeclarationBase, TsNamedTypeElementBase {
    type: "TSMethodSignature";
    kind: "method" | "get" | "set";
}
interface TsIndexSignature extends TsIndexSignatureBase {
    readonly?: boolean;
    static?: boolean;
    type: "TSIndexSignature";
    accessibility?: Accessibility | undefined;
}
interface EstreeTSEmptyBodyFunctionExpression extends BodilessFunctionOrMethodBase, DeclarationBase {
    type: "TSEmptyBodyFunctionExpression";
    body: null;
}
interface EstreeTSAbstractMethodDefinition extends EstreeMethodDefinitionBase {
    type: "TSAbstractMethodDefinition";
    value: EstreeTSEmptyBodyFunctionExpression;
}
interface EstreeTSAbstractPropertyDefinition extends EstreePropertyDefinitionBase {
    type: "TSAbstractPropertyDefinition";
    value: null;
}
interface EstreeTSAbstractAccessorProperty extends EstreePropertyDefinitionBase {
    type: "TSAbstractAccessorProperty";
    value: null;
}
type TsType = TsKeywordType | TsThisType | TsFunctionOrConstructorType | TsTypeReference | TsTypeQuery | TsTypeLiteral | TsArrayType | TsTupleType | TsOptionalType | TsRestType | TsUnionOrIntersectionType | TsConditionalType | TsInferType | TsParenthesizedType | TsTypeOperator | TsIndexedAccessType | TsMappedType | TsLiteralType | TsTemplateLiteralType | TsImportType | TsTypePredicate;
type TsTypeBase = NodeBase;
type TsKeywordTypeType = "TSAnyKeyword" | "TSUnknownKeyword" | "TSNumberKeyword" | "TSObjectKeyword" | "TSBooleanKeyword" | "TSBigIntKeyword" | "TSStringKeyword" | "TSSymbolKeyword" | "TSVoidKeyword" | "TSUndefinedKeyword" | "TSNullKeyword" | "TSNeverKeyword" | "TSIntrinsicKeyword";
interface TsKeywordType extends TsTypeBase {
    type: TsKeywordTypeType;
}
interface TsThisType extends TsTypeBase {
    type: "TSThisType";
}
type TsFunctionOrConstructorType = TsFunctionType | TsConstructorType;
interface TsFunctionType extends TsTypeBase, TsSignatureDeclarationBase {
    type: "TSFunctionType";
    typeAnnotation: TsTypeAnnotation;
}
interface TsConstructorType extends TsTypeBase, TsSignatureDeclarationBase {
    type: "TSConstructorType";
    typeAnnotation: TsTypeAnnotation;
    abstract: boolean;
}
interface TsTypeReference extends TsTypeBase {
    type: "TSTypeReference";
    typeName: TsEntityName;
    typeArguments?: TsTypeParameterInstantiation;
}
interface TsTypePredicate extends TsTypeBase {
    type: "TSTypePredicate";
    parameterName: Identifier | TsThisType;
    typeAnnotation: TsTypeAnnotation | null;
    asserts: boolean;
}
interface TsTypeQuery extends TsTypeBase {
    type: "TSTypeQuery";
    exprName: TsEntityName | TsImportType;
    typeArguments?: TsTypeParameterInstantiation;
}
interface TsTypeLiteral extends TsTypeBase {
    type: "TSTypeLiteral";
    members: TsTypeElement[];
}
interface TsArrayType extends TsTypeBase {
    type: "TSArrayType";
    elementType: TsType;
}
interface TsTupleType extends TsTypeBase {
    type: "TSTupleType";
    elementTypes: (TsType | TsNamedTupleMember)[];
}
interface TsNamedTupleMember extends TsTypeBase {
    type: "TSNamedTupleMember";
    label: Identifier;
    optional: boolean;
    elementType: TsType;
}
interface TsOptionalType extends TsTypeBase {
    type: "TSOptionalType";
    typeAnnotation: TsType;
}
interface TsRestType extends TsTypeBase {
    type: "TSRestType";
    typeAnnotation: TsType | TsNamedTupleMember;
}
type TsUnionOrIntersectionType = TsUnionType | TsIntersectionType;
interface TsUnionOrIntersectionTypeBase extends TsTypeBase {
    types: TsType[];
}
interface TsUnionType extends TsUnionOrIntersectionTypeBase {
    type: "TSUnionType";
}
interface TsIntersectionType extends TsUnionOrIntersectionTypeBase {
    type: "TSIntersectionType";
}
interface TsConditionalType extends TsTypeBase {
    type: "TSConditionalType";
    checkType: TsType;
    extendsType: TsType;
    trueType: TsType;
    falseType: TsType;
}
interface TsInferType extends TsTypeBase {
    type: "TSInferType";
    typeParameter: TsTypeParameter;
}
interface TsParenthesizedType extends TsTypeBase {
    type: "TSParenthesizedType";
    typeAnnotation: TsType;
}
interface TsTypeOperator extends TsTypeBase {
    type: "TSTypeOperator";
    operator: "keyof" | "unique" | "readonly";
    typeAnnotation: TsType;
}
interface TsIndexedAccessType extends TsTypeBase {
    type: "TSIndexedAccessType";
    objectType: TsType;
    indexType: TsType;
}
interface TsMappedType extends TsTypeBase {
    type: "TSMappedType";
    key: Identifier;
    constraint: TsType;
    readonly?: true | "+" | "-";
    optional?: boolean | "+" | "-";
    typeAnnotation: TsType | undefined | null;
    nameType: TsType | undefined | null;
}
interface TsTemplateLiteralType extends TsTypeBase {
    type: "TSTemplateLiteralType";
    quasis: TemplateElement[];
    types: TsType[];
}
interface TsLiteralType extends TsTypeBase {
    type: "TSLiteralType";
    literal: NumericLiteral | StringLiteral | BooleanLiteral | TemplateLiteral | UnaryExpression;
}
interface TsImportType extends TsTypeBase {
    type: "TSImportType";
    source: StringLiteral;
    qualifier?: TsEntityName | null;
    typeArguments?: TsTypeParameterInstantiation | null;
    options?: Expression | null;
}
interface TsInterfaceDeclaration extends DeclarationBase {
    type: "TSInterfaceDeclaration";
    id: Identifier | undefined | null;
    typeParameters: TsTypeParameterDeclaration | undefined | null;
    extends?: TSInterfaceHeritage[];
    body: TSInterfaceBody;
}
interface TSInterfaceBody extends NodeBase {
    type: "TSInterfaceBody";
    body: TsTypeElement[];
}
interface TSHeritageBase extends NodeBase {
    expression: Expression;
    typeArguments?: TsTypeParameterInstantiation;
}
interface TSClassImplements extends TSHeritageBase {
    type: "TSClassImplements";
}
interface TSInterfaceHeritage extends TSHeritageBase {
    type: "TSInterfaceHeritage";
}
interface TsTypeAliasDeclaration extends DeclarationBase {
    type: "TSTypeAliasDeclaration";
    id: Identifier;
    typeParameters: TsTypeParameterDeclaration | undefined | null;
    typeAnnotation: TsType;
}
interface TsEnumDeclaration extends DeclarationBase {
    type: "TSEnumDeclaration";
    const?: boolean;
    id: Identifier;
    body: TsEnumBody;
}
interface TsEnumBody extends NodeBase {
    type: "TSEnumBody";
    members: TsEnumMember[];
}
interface TsEnumMember extends NodeBase {
    type: "TSEnumMember";
    id: Identifier | StringLiteral;
    initializer?: Expression;
    computed?: false;
}
interface TsModuleDeclaration extends DeclarationBase {
    type: "TSModuleDeclaration";
    kind: "global" | "module" | "namespace";
    global?: boolean;
    id: TsModuleName;
    body: TsNamespaceBody;
}
type TsNamespaceBody = TsModuleBlock | TsNamespaceDeclaration;
interface TsModuleBlock extends NodeBase {
    type: "TSModuleBlock";
    body: Statement[];
}
interface TsNamespaceDeclaration extends TsModuleDeclaration {
    id: Identifier;
    body: TsNamespaceBody;
}
type TsModuleName = TsEntityName | StringLiteral;
interface TsImportEqualsDeclaration extends NodeBase {
    type: "TSImportEqualsDeclaration";
    id: Identifier;
    importKind: "type" | "value";
    moduleReference: TsModuleReference;
}
type TsModuleReference = TsEntityName | TsExternalModuleReference;
interface TsExternalModuleReference extends NodeBase {
    type: "TSExternalModuleReference";
    expression: StringLiteral;
}
interface TsExportAssignment extends NodeBase {
    type: "TSExportAssignment";
    expression: Expression;
}
interface TsNamespaceExportDeclaration extends NodeBase {
    type: "TSNamespaceExportDeclaration";
    id: Identifier;
}
interface TsTypeAssertionLikeBase extends NodeBase {
    expression: Expression;
    typeAnnotation: TsType;
}
interface TsAsExpression extends TsTypeAssertionLikeBase {
    type: "TSAsExpression";
}
interface TsTypeAssertion extends TsTypeAssertionLikeBase {
    type: "TSTypeAssertion";
}
type TsSatisfiesExpression = TsTypeAssertionLikeBase & {
    type: "TSSatisfiesExpression";
};
interface TsNonNullExpression extends NodeBase {
    type: "TSNonNullExpression";
    expression: Expression;
}
interface TsInstantiationExpression extends NodeBase {
    type: "TSInstantiationExpression";
    expression: Expression;
    typeArguments?: TsTypeParameterInstantiation;
}
interface Placeholder<N extends PlaceholderTypes = PlaceholderTypes> extends NodeBase {
    type: "Placeholder";
    name: Identifier;
    expectedNode: N;
}
type Node = ArgumentPlaceholder | ArrayExpression | ArrayPattern | ArrowFunctionExpression | AssignmentExpression | AssignmentPattern | AwaitExpression | BigIntLiteral | BigIntLiteralTypeAnnotation | BinaryExpression | BindExpression | BlockStatement | BooleanLiteral | BooleanLiteralTypeAnnotation | BreakStatement | CallExpression | CatchClause | ClassAccessorProperty | ClassBody | ClassDeclaration | ClassExpression | ClassMethod | ClassPrivateMethod | ClassPrivateProperty | ClassProperty | ConditionalExpression | ContinueStatement | DebuggerStatement | Decorator | Directive | DirectiveLiteral | DoExpression | DoWhileStatement | EmptyStatement | EstreeAccessorProperty | EstreeChainExpression | EstreeLiteral | EstreeMethodDefinition | EstreePrivateIdentifier | EstreeProperty | EstreePropertyDefinition | EstreeTSAbstractAccessorProperty | EstreeTSAbstractMethodDefinition | EstreeTSAbstractPropertyDefinition | EstreeTSEmptyBodyFunctionExpression | ExportAllDeclaration | ExportDefaultDeclaration | ExportDefaultSpecifier | ExportNamedDeclaration | ExportNamespaceSpecifier | ExportSpecifier | ExpressionStatement | File | FlowClassImplements | FlowDeclareClass | FlowDeclareExportDeclaration | FlowDeclareFunction | FlowDeclareInterface | FlowDeclareModule | FlowDeclareModuleExports | FlowDeclareOpaqueType | FlowDeclareTypeAlias | FlowDeclareVariable | FlowEnumBody | FlowEnumDeclaration | FlowEnumMember | FlowFunctionTypeAnnotation | FlowFunctionTypeParam | FlowGenericTypeAnnotation | FlowIndexedAccessType | FlowInterface | FlowInterfaceExtends | FlowInterfaceType | FlowObjectTypeAnnotation | FlowObjectTypeCallProperty | FlowObjectTypeIndexer | FlowObjectTypeInternalSlot | FlowObjectTypeProperty | FlowObjectTypeSpreadProperty | FlowOpaqueType | FlowOptionalIndexedAccessType | FlowOtherTypeAnnotation | FlowPredicate | FlowPredicate | FlowQualifiedTypeIdentifier | FlowTupleTypeAnnotation | FlowTypeAlias | FlowTypeofTypeAnnotation | FlowVariance | ForInStatement | ForOfStatement | ForStatement | FunctionDeclaration | FunctionExpression | Identifier | IfStatement | Import | ImportAttribute | ImportDeclaration | ImportDefaultSpecifier | ImportExpression | ImportExpression | ImportNamespaceSpecifier | ImportSpecifier | InterpreterDirective | JSXAttribute | JSXClosingElement | JSXClosingFragment | JSXElement | JSXEmptyExpression | JSXExpressionContainer | JSXFragment | JSXIdentifier | JSXMemberExpression | JSXNamespacedName | JSXOpeningElement | JSXOpeningFragment | JSXSpreadAttribute | JSXSpreadChild | JSXText | LabeledStatement | Literal | LogicalExpression | MemberExpression | MetaProperty | ModuleExpression | NewExpression | NullLiteral | NumberLiteralTypeAnnotation | NumericLiteral | ObjectExpression | ObjectMethod | ObjectPattern | ObjectProperty | OptionalCallExpression | OptionalMemberExpression | ParenthesizedExpression | Placeholder | PrivateName | Program | RegExpLiteral | RestElement | ReturnStatement | SequenceExpression | SpreadElement | StaticBlock | StringLiteral | StringLiteralTypeAnnotation | Super | SwitchCase | SwitchStatement | TSDeclareFunction | TSDeclareMethod | TSInterfaceBody | TSParameterProperty | TaggedTemplateExpression | TemplateElement | TemplateLiteral | ThisExpression | ThrowStatement | TopicReference | TryStatement | TsArrayType | TsAsExpression | TsCallSignatureDeclaration | TsConditionalType | TsConstructSignatureDeclaration | TsConstructorType | TsEnumDeclaration | TsEnumBody | TsEnumMember | TsExportAssignment | TSClassImplements | TSInterfaceHeritage | TsExternalModuleReference | TsFunctionType | TsImportEqualsDeclaration | TsImportType | TsIndexSignature | TsIndexedAccessType | TsInferType | TsInstantiationExpression | TsInterfaceDeclaration | TsIntersectionType | TsKeywordType | TsLiteralType | TsMappedType | TsMethodSignature | TsModuleBlock | TsModuleDeclaration | TsNamedTupleMember | TsNamespaceExportDeclaration | TsNonNullExpression | TsOptionalType | TsParenthesizedType | TsPropertySignature | TsQualifiedName | TsRestType | TsSatisfiesExpression | TsTemplateLiteralType | TsThisType | TsTupleType | TsTypeAliasDeclaration | TsTypeAnnotation | TsTypeAssertion | TsTypeCastExpression | TsTypeLiteral | TsTypeOperator | TsTypeParameter | TsTypeParameterDeclaration | TsTypeParameterInstantiation | TsTypePredicate | TsTypeQuery | TsTypeReference | TsUnionType | TypeAnnotation | TypeCastExpression | TypeParameter | TypeParameterDeclaration | TypeParameterInstantiation | UnaryExpression | UpdateExpression | VariableDeclaration | VariableDeclarator | VoidPattern | V8IntrinsicIdentifier | WhileStatement | WithStatement | YieldExpression;

type Plugin$1 =
  | "asyncDoExpressions"
  | "decorators"
  | "decorators-legacy"
  | "decoratorAutoAccessors"
  | "deferredImportEvaluation"
  | "destructuringPrivate"
  | "doExpressions"
  | "exportDefaultFrom"
  | "flow"
  | "flowComments"
  | "functionBind"
  | "functionSent"
  | "importMeta"
  | "jsx"
  | "moduleBlocks"
  | "placeholders"
  | "sourcePhaseImports"
  | "throwExpressions"
  | "v8intrinsic"
  | ParserPluginWithOptions[0];

type ParserPluginWithOptions =
  | ["discardBinding", { syntaxType: "void" }]
  | ["estree", { classFeatures?: boolean }]
  | ["optionalChainingAssign", { version: "2023-07" }]
  | ["partialApplication", PartialApplicationPluginOptions]
  | ["pipelineOperator", PipelineOperatorPluginOptions]
  | ["flow", FlowPluginOptions]
  | ["typescript", TypeScriptPluginOptions];

type PluginConfig = Plugin$1 | ParserPluginWithOptions;

interface PartialApplicationPluginOptions {
  version: "2018-07";
}

interface PipelineOperatorPluginOptions {
  proposal: "fsharp" | "hack";
  topicToken?: "%" | "#" | "@@" | "^^" | "^";
}

interface FlowPluginOptions {
  all?: boolean;
}

interface TypeScriptPluginOptions {
  dts?: boolean;
  disallowAmbiguousJSXLike?: boolean;
}

/**
 * A whitespace token containing comments
 */
type CommentWhitespace = {
    /**
     * the start of the whitespace token.
     */
    start: number;
    /**
     * the end of the whitespace token.
     */
    end: number;
    /**
     * the containing comments
     */
    comments: Comment[];
    /**
     * the immediately preceding AST node of the whitespace token
     */
    leadingNode: Node | null;
    /**
     * the immediately following AST node of the whitespace token
     */
    trailingNode: Node | null;
    /**
     * the innermost AST node containing the whitespace with minimal size (|end - start|)
     */
    containingNode: Node | null;
};

declare class Token {
    constructor(state: State);
    type: TokenType;
    value: any;
    start: number;
    end: number;
    loc: SourceLocation;
}

declare const JsxErrorTemplates: {
    AttributeIsEmpty: string;
    MissingClosingTagElement: ({ openingTagName }: {
        openingTagName: string;
    }) => string;
    MissingClosingTagFragment: string;
    UnexpectedSequenceExpression: string;
    UnexpectedToken: ({ unexpected, HTMLEntity, }: {
        unexpected: string;
        HTMLEntity: string;
    }) => string;
    UnsupportedJsxValue: string;
    UnterminatedJsxContent: string;
    UnwrappedAdjacentJSXElements: string;
};

type TsModifier = "readonly" | "abstract" | "declare" | "static" | "override" | "const" | Accessibility | VarianceAnnotations;
declare const TSErrorTemplates: {
    AbstractMethodHasImplementation: ({ methodName }: {
        methodName: string;
    }) => string;
    AbstractPropertyHasInitializer: ({ propertyName, }: {
        propertyName: string;
    }) => string;
    AccessorCannotBeOptional: string;
    AccessorCannotDeclareThisParameter: string;
    AccessorCannotHaveTypeParameters: string;
    ClassMethodHasDeclare: string;
    ClassMethodHasReadonly: string;
    ConstInitializerMustBeStringOrNumericLiteralOrLiteralEnumReference: string;
    ConstructorHasTypeParameters: string;
    DeclareAccessor: ({ kind }: {
        kind: "get" | "set";
    }) => string;
    DeclareClassFieldHasInitializer: string;
    DeclareFunctionHasImplementation: string;
    DuplicateAccessibilityModifier: ({ modifier, }: {
        modifier: Accessibility;
    }) => string;
    DuplicateModifier: ({ modifier }: {
        modifier: TsModifier;
    }) => string;
    EmptyHeritageClauseType: ({ token }: {
        token: "extends" | "implements";
    }) => string;
    EmptyTypeArguments: string;
    EmptyTypeParameters: string;
    ExpectedAmbientAfterExportDeclare: string;
    ImportAliasHasImportType: string;
    IncompatibleModifiers: ({ modifiers, }: {
        modifiers: [TsModifier, TsModifier];
    }) => string;
    IndexSignatureHasAbstract: string;
    IndexSignatureHasAccessibility: ({ modifier, }: {
        modifier: Accessibility;
    }) => string;
    IndexSignatureHasDeclare: string;
    IndexSignatureHasOverride: string;
    IndexSignatureHasStatic: string;
    InitializerNotAllowedInAmbientContext: string;
    InlineModuleDeclarationMustUseString: string;
    InvalidHeritageClauseType: ({ token }: {
        token: "extends" | "implements";
    }) => string;
    InvalidModifierOnAwaitUsingDeclaration: (modifier: TsModifier) => string;
    InvalidModifierOnTypeMember: ({ modifier }: {
        modifier: TsModifier;
    }) => string;
    InvalidModifierOnTypeParameter: ({ modifier }: {
        modifier: TsModifier;
    }) => string;
    InvalidModifierOnTypeParameterPositions: ({ modifier, }: {
        modifier: TsModifier;
    }) => string;
    InvalidModifierOnUsingDeclaration: (modifier: TsModifier) => string;
    InvalidModifiersOrder: ({ orderedModifiers, }: {
        orderedModifiers: [TsModifier, TsModifier];
    }) => string;
    InvalidPropertyAccessAfterInstantiationExpression: string;
    InvalidTupleMemberLabel: string;
    MissingInterfaceName: string;
    NonAbstractClassHasAbstractMethod: string;
    NonClassMethodPropertyHasAbstractModifier: string;
    OptionalTypeBeforeRequired: string;
    OverrideNotInSubClass: string;
    PatternIsOptional: string;
    PrivateElementHasAbstract: string;
    PrivateElementHasAccessibility: ({ modifier, }: {
        modifier: Accessibility;
    }) => string;
    ReadonlyForMethodSignature: string;
    ReservedArrowTypeParam: string;
    ReservedTypeAssertion: string;
    SetAccessorCannotHaveOptionalParameter: string;
    SetAccessorCannotHaveRestParameter: string;
    SetAccessorCannotHaveReturnType: string;
    SingleTypeParameterWithoutTrailingComma: ({ typeParameterName, }: {
        typeParameterName: string;
    }) => string;
    StaticBlockCannotHaveModifier: string;
    TupleOptionalAfterType: string;
    TypeAnnotationAfterAssign: string;
    TypeImportCannotSpecifyDefaultAndNamed: string;
    TypeModifierIsUsedInTypeExports: string;
    TypeModifierIsUsedInTypeImports: string;
    UnexpectedParameterModifier: string;
    UnexpectedReadonly: string;
    UnexpectedTypeAnnotation: string;
    UnexpectedTypeCastInParameter: string;
    UnsupportedImportTypeArgument: string;
    UnsupportedParameterPropertyKind: string;
    UnsupportedSignatureParameterKind: ({ type }: {
        type: string;
    }) => string;
    UsingDeclarationInAmbientContext: (kind: "using" | "await using") => string;
};

declare const FlowErrorTemplates: {
    AmbiguousConditionalArrow: string;
    AmbiguousDeclareModuleKind: string;
    AssignReservedType: ({ reservedType }: {
        reservedType: string;
    }) => string;
    DeclareClassElement: string;
    DeclareClassFieldInitializer: string;
    DuplicateDeclareModuleExports: string;
    EnumBooleanMemberNotInitialized: ({ memberName, enumName, }: {
        memberName: string;
        enumName: string;
    }) => string;
    EnumDuplicateMemberName: ({ memberName, enumName, }: {
        memberName: string;
        enumName: string;
    }) => string;
    EnumInconsistentMemberValues: ({ enumName }: {
        enumName: string;
    }) => string;
    EnumInvalidExplicitType: ({ invalidEnumType, enumName, }: {
        invalidEnumType: string;
        enumName: string;
    }) => string;
    EnumInvalidExplicitTypeUnknownSupplied: ({ enumName, }: {
        enumName: string;
    }) => string;
    EnumInvalidMemberInitializerPrimaryType: ({ enumName, memberName, explicitType, }: {
        enumName: string;
        memberName: string;
        explicitType: EnumExplicitType;
    }) => string;
    EnumInvalidMemberInitializerSymbolType: ({ enumName, memberName, }: {
        enumName: string;
        memberName: string;
        explicitType: EnumExplicitType;
    }) => string;
    EnumInvalidMemberInitializerUnknownType: ({ enumName, memberName, }: {
        enumName: string;
        memberName: string;
        explicitType: EnumExplicitType;
    }) => string;
    EnumInvalidMemberName: ({ enumName, memberName, suggestion, }: {
        enumName: string;
        memberName: string;
        suggestion: string;
    }) => string;
    EnumNumberMemberNotInitialized: ({ enumName, memberName, }: {
        enumName: string;
        memberName: string;
    }) => string;
    EnumStringMemberInconsistentlyInitialized: ({ enumName, }: {
        enumName: string;
    }) => string;
    GetterMayNotHaveThisParam: string;
    ImportTypeShorthandOnlyInPureImport: string;
    InexactInsideExact: string;
    InexactInsideNonObject: string;
    InexactVariance: string;
    InvalidNonTypeImportInDeclareModule: string;
    MissingTypeParamDefault: string;
    NestedDeclareModule: string;
    NestedFlowComment: string;
    PatternIsOptional: {
        message: string;
    };
    SetterMayNotHaveThisParam: string;
    SpreadVariance: string;
    ThisParamAnnotationRequired: string;
    ThisParamBannedInConstructor: string;
    ThisParamMayNotBeOptional: string;
    ThisParamMustBeFirst: string;
    ThisParamNoDefault: string;
    TypeBeforeInitializer: string;
    TypeCastInPattern: string;
    UnexpectedExplicitInexactInObject: string;
    UnexpectedReservedType: ({ reservedType }: {
        reservedType: string;
    }) => string;
    UnexpectedReservedUnderscore: string;
    UnexpectedSpaceBetweenModuloChecks: string;
    UnexpectedSpreadType: string;
    UnexpectedSubtractionOperand: string;
    UnexpectedTokenAfterTypeParameter: string;
    UnexpectedTypeParameterBeforeAsyncArrowFunction: string;
    UnsupportedDeclareExportKind: ({ unsupportedExportKind, suggestion, }: {
        unsupportedExportKind: string;
        suggestion: string;
    }) => string;
    UnsupportedStatementInDeclareModule: string;
    UnterminatedFlowComment: string;
};
type EnumExplicitType = null | "boolean" | "number" | "string" | "symbol";

type ParseError = SyntaxError & {
    missingPlugin?: string | string[];
    loc: Position;
    pos: number;
} & ErrorInfo;
type ParseErrorConstructor<ErrorDetails> = (loc: Position, details: ErrorDetails) => ParseError;
type ToMessage<ErrorDetails> = (self: ErrorDetails) => string;
type ErrorToObject<T> = {
    [K in keyof T]: {
        code: T[K] extends {
            code: string;
        } ? T[K]["code"] : "BABEL_PARSER_SYNTAX_ERROR";
        reasonCode: K;
        details: T[K] extends {
            message: string | ToMessage<any>;
        } ? T[K]["message"] extends ToMessage<any> ? Parameters<T[K]["message"]>[0] : object : T[K] extends ToMessage<any> ? Parameters<T[K]>[0] : object;
    };
};
type __ExtractMe = typeof _default$3 & typeof _default$2 & typeof _default$1 & typeof _default & typeof _default$4 & typeof TSErrorTemplates & typeof FlowErrorTemplates & typeof JsxErrorTemplates & typeof PlaceholderErrorTemplates;
type __PatchMe = never & Decompress<ErrorInfoCompressed>;
type ErrorsObjects = ErrorToObject<__ExtractMe>;
type ErrorInfo = __PatchMe | ErrorsObjects[keyof ErrorsObjects];
type ErrorInfoCompressed = {};
type Decompress<T extends object> = {
    [K in keyof T]: T[K] extends [infer Param, infer Code] ? {
        code: Code;
        reasonCode: K;
        details: Param;
    } : T[K] extends [infer Param] ? {
        code: "BABEL_PARSER_SYNTAX_ERROR";
        reasonCode: K;
        details: Param;
    } : T[K] extends [] ? {
        code: "BABEL_PARSER_SYNTAX_ERROR";
        reasonCode: K;
        details: object;
    } : never;
};

type PossiblePlaceholders = {
    Identifier: Identifier;
    StringLiteral: StringLiteral;
    Expression: Expression;
    Statement: Statement;
    Declaration: Declaration;
    BlockStatement: BlockStatement;
    ClassBody: ClassBody;
    Pattern: Pattern;
};
type PlaceholderTypes = keyof PossiblePlaceholders;
declare const PlaceholderErrorTemplates: {
    ClassNameIsRequired: string;
    UnexpectedSpace: string;
};

type Plugin = PluginConfig;

type SourceType = "script" | "commonjs" | "module" | "unambiguous";
interface Options {
    /**
     * By default, import and export declarations can only appear at a program's top level.
     * Setting this option to true allows them anywhere where a statement is allowed.
     */
    allowImportExportEverywhere?: boolean;
    /**
     * By default, await use is not allowed outside of an async function.
     * Set this to true to accept such code.
     */
    allowAwaitOutsideFunction?: boolean;
    /**
     * By default, a return statement at the top level raises an error.
     * Set this to true to accept such code.
     */
    allowReturnOutsideFunction?: boolean;
    /**
     * By default, new.target use is not allowed outside of a function or class.
     * Set this to true to accept such code.
     */
    allowNewTargetOutsideFunction?: boolean;
    /**
     * By default, super calls are not allowed outside of a method.
     * Set this to true to accept such code.
     */
    allowSuperOutsideMethod?: boolean;
    /**
     * By default, exported identifiers must refer to a declared variable.
     * Set this to true to allow export statements to reference undeclared variables.
     */
    allowUndeclaredExports?: boolean;
    /**
     * By default, yield use is not allowed outside of a generator function.
     * Set this to true to accept such code.
     */
    allowYieldOutsideFunction?: boolean;
    /**
     * By default, Babel parser JavaScript code according to Annex B syntax.
     * Set this to `false` to disable such behavior.
     */
    annexB?: boolean;
    /**
     * By default, Babel attaches comments to adjacent AST nodes.
     * When this option is set to false, comments are not attached.
     * It can provide up to 30% performance improvement when the input code has many comments.
     * @babel/eslint-parser will set it for you.
     * It is not recommended to use attachComment: false with Babel transform,
     * as doing so removes all the comments in output code, and renders annotations such as
     * /* istanbul ignore next *\/ nonfunctional.
     */
    attachComment?: boolean;
    /**
     * By default, Babel always throws an error when it finds some invalid code.
     * When this option is set to true, it will store the parsing error and
     * try to continue parsing the invalid input file.
     */
    errorRecovery?: boolean;
    /**
     * Indicate the mode the code should be parsed in.
     * Can be one of "script", "commonjs", "module", or "unambiguous". Defaults to "script".
     * "unambiguous" will make @babel/parser attempt to guess, based on the presence
     * of ES6 import or export statements.
     * Files with ES6 imports and exports are considered "module" and are otherwise "script".
     *
     * Use "commonjs" to parse code that is intended to be run in a CommonJS environment such as Node.js.
     */
    sourceType?: SourceType;
    /**
     * Correlate output AST nodes with their source filename.
     * Useful when generating code and source maps from the ASTs of multiple input files.
     */
    sourceFilename?: string;
    /**
     * By default, all source indexes start from 0.
     * You can provide a start index to alternatively start with.
     * Useful for integration with other source tools.
     */
    startIndex?: number;
    /**
     * By default, the first line of code parsed is treated as line 1.
     * You can provide a line number to alternatively start with.
     * Useful for integration with other source tools.
     */
    startLine?: number;
    /**
     * By default, the parsed code is treated as if it starts from line 1, column 0.
     * You can provide a column number to alternatively start with.
     * Useful for integration with other source tools.
     */
    startColumn?: number;
    /**
     * Array containing the plugins that you want to enable.
     */
    plugins?: Plugin[];
    /**
     * Should the parser work in strict mode.
     * Defaults to true if sourceType === 'module'. Otherwise, false.
     */
    strictMode?: boolean;
    /**
     * Adds a ranges property to each node: [node.start, node.end]
     */
    ranges?: boolean;
    /**
     * Adds all parsed tokens to a tokens property on the File node.
     */
    tokens?: boolean;
    /**
     * By default, the parser adds information about parentheses by setting
     * `extra.parenthesized` to `true` as needed.
     * When this option is `true` the parser creates `ParenthesizedExpression`
     * AST nodes instead of using the `extra` property.
     */
    createParenthesizedExpressions?: boolean;
    /**
     * By default, the parser parses import expressions as an `ImportExpression` node.
     * Set this to false to parse it as `CallExpression(Import, [Identifier(foo)])`.
     */
    createImportExpressions?: boolean;
}
type KeepOptionalKeys = "sourceFilename" | "strictMode";
type OptionsWithDefaults = Omit<Required<Options>, KeepOptionalKeys> & Pick<Options, KeepOptionalKeys>;

type ParserOptions = Partial<Options>;
type ParseResult<Result extends File$1 | Expression$1 = File$1> = Result & {
    comments: File$1["comments"];
    errors: ParseError[];
    tokens?: File$1["tokens"];
};
/**
 * Parse the provided code as an entire ECMAScript program.
 */
declare function parse(input: string, options?: ParserOptions): ParseResult<File$1>;
declare function parseExpression(input: string, options?: ParserOptions): ParseResult<Expression$1>;
declare const tokTypes: Record<string, ExportedTokenType>;

export { type FlowPluginOptions, type ParseError, type ParseResult, type ParserOptions, type PluginConfig as ParserPlugin, type PipelineOperatorPluginOptions, Token, type TypeScriptPluginOptions, parse, parseExpression, tokTypes };
