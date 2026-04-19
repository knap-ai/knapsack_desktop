export type MatrixLegacyCryptoInspectionResult = {
    deviceId: string | null;
    roomKeyCounts: {
        total: number;
        backedUp: number;
    } | null;
    backupVersion: string | null;
    decryptionKeyBase64: string | null;
};
export declare function inspectLegacyMatrixCryptoStore(params: {
    cryptoRootDir: string;
    userId: string;
    deviceId: string;
    log?: (message: string) => void;
}): Promise<MatrixLegacyCryptoInspectionResult>;
