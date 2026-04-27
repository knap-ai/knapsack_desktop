export type QrPngRenderOptions = {
    scale?: number;
    marginModules?: number;
};
export type QrPngTempFileOptions = QrPngRenderOptions & {
    tmpRoot: string;
    dirPrefix: string;
    fileName?: string;
};
export type QrPngTempFile = {
    filePath: string;
    dirPath: string;
    mediaLocalRoots: string[];
};
export declare function renderQrPngBase64(input: string, opts?: QrPngRenderOptions): Promise<string>;
export declare function formatQrPngDataUrl(base64: string): string;
export declare function renderQrPngDataUrl(input: string, opts?: QrPngRenderOptions): Promise<string>;
export declare function writeQrPngTempFile(input: string, opts: QrPngTempFileOptions): Promise<QrPngTempFile>;
