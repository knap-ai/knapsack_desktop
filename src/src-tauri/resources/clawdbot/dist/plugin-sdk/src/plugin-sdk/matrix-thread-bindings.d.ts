import type { SessionBindingRecord } from "../infra/outbound/session-binding-service.js";
type FacadeModule = {
    setMatrixThreadBindingIdleTimeoutBySessionKey: (params: {
        accountId: string;
        targetSessionKey: string;
        idleTimeoutMs: number;
    }) => SessionBindingRecord[];
    setMatrixThreadBindingMaxAgeBySessionKey: (params: {
        accountId: string;
        targetSessionKey: string;
        maxAgeMs: number;
    }) => SessionBindingRecord[];
};
export declare const setMatrixThreadBindingIdleTimeoutBySessionKey: FacadeModule["setMatrixThreadBindingIdleTimeoutBySessionKey"];
export declare const setMatrixThreadBindingMaxAgeBySessionKey: FacadeModule["setMatrixThreadBindingMaxAgeBySessionKey"];
export {};
