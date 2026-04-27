import { Type } from "typebox";
export declare const PushTestParamsSchema: Type.TObject<{
    nodeId: Type.TString;
    title: Type.TOptional<Type.TString>;
    body: Type.TOptional<Type.TString>;
    environment: Type.TOptional<Type.TString>;
}>;
export declare const PushTestResultSchema: Type.TObject<{
    ok: Type.TBoolean;
    status: Type.TInteger;
    apnsId: Type.TOptional<Type.TString>;
    reason: Type.TOptional<Type.TString>;
    tokenSuffix: Type.TString;
    topic: Type.TString;
    environment: Type.TString;
    transport: Type.TString;
}>;
