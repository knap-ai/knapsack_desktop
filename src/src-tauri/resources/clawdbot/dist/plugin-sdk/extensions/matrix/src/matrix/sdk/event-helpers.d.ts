import type { MatrixEvent } from "matrix-js-sdk";
import type { MatrixRawEvent } from "./types.js";
export type MatrixEventContentMode = "current" | "original";
export declare function matrixEventToRaw(event: MatrixEvent, opts?: {
    contentMode?: MatrixEventContentMode;
}): MatrixRawEvent;
export declare function parseMxc(url: string): {
    server: string;
    mediaId: string;
} | null;
export declare function buildHttpError(statusCode: number, bodyText: string): Error & {
    statusCode: number;
};
