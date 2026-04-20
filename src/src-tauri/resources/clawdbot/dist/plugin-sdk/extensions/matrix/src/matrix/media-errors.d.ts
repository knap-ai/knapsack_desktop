export declare const MATRIX_MEDIA_SIZE_LIMIT_ERROR_MESSAGE = "Matrix media exceeds configured size limit";
export declare class MatrixMediaSizeLimitError extends Error {
    readonly code: "MATRIX_MEDIA_SIZE_LIMIT";
    constructor(message?: string, options?: ErrorOptions);
}
export declare function isMatrixMediaSizeLimitError(err: unknown): err is MatrixMediaSizeLimitError;
