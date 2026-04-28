export declare const LOW_DISK_SPACE_WARNING_THRESHOLD_BYTES: number;
export type DiskSpaceSnapshot = {
    targetPath: string;
    checkedPath: string;
    availableBytes: number;
    totalBytes: number | null;
};
export declare function tryReadDiskSpace(targetPath: string): DiskSpaceSnapshot | null;
export declare function formatDiskSpaceBytes(bytes: number): string;
export declare function createLowDiskSpaceWarning(params: {
    targetPath: string;
    purpose: string;
    thresholdBytes?: number;
}): string | null;
