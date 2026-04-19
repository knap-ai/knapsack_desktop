export declare const ThreadType: {
    readonly User: 0;
    readonly Group: 1;
};
export declare const LoginQRCallbackEventType: {
    readonly QRCodeGenerated: 0;
    readonly QRCodeExpired: 1;
    readonly QRCodeScanned: 2;
    readonly QRCodeDeclined: 3;
    readonly GotLoginInfo: 4;
};
export declare const Reactions: {
    readonly HEART: "/-heart";
    readonly LIKE: "/-strong";
    readonly HAHA: ":>";
    readonly WOW: ":o";
    readonly CRY: ":-((";
    readonly ANGRY: ":-h";
    readonly NONE: "";
};
export declare const TextStyle: {
    readonly Bold: "b";
    readonly Italic: "i";
    readonly Underline: "u";
    readonly StrikeThrough: "s";
    readonly Red: "c_db342e";
    readonly Orange: "c_f27806";
    readonly Yellow: "c_f7b503";
    readonly Green: "c_15a85f";
    readonly Small: "f_13";
    readonly Big: "f_18";
    readonly UnorderedList: "lst_1";
    readonly OrderedList: "lst_2";
    readonly Indent: "ind_$";
};
type TextStyleValue = (typeof TextStyle)[keyof typeof TextStyle];
export type Style = {
    start: number;
    len: number;
    st: Exclude<TextStyleValue, typeof TextStyle.Indent>;
} | {
    start: number;
    len: number;
    st: typeof TextStyle.Indent;
    indentSize?: number;
};
export {};
