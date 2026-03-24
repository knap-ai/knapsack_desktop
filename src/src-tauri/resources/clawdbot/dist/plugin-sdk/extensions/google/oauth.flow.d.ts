export declare function shouldUseManualOAuthFlow(isRemote: boolean): boolean;
export declare function generatePkce(): {
    verifier: string;
    challenge: string;
};
export declare function buildAuthUrl(challenge: string, verifier: string): string;
export declare function parseCallbackInput(input: string, expectedState: string): {
    code: string;
    state: string;
} | {
    error: string;
};
export declare function waitForLocalCallback(params: {
    expectedState: string;
    timeoutMs: number;
    onProgress?: (message: string) => void;
}): Promise<{
    code: string;
    state: string;
}>;
