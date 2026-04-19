export type MatrixManagedDeviceInfo = {
    deviceId: string;
    displayName: string | null;
    current: boolean;
};
export type MatrixDeviceHealthSummary = {
    currentDeviceId: string | null;
    staleOpenClawDevices: MatrixManagedDeviceInfo[];
    currentOpenClawDevices: MatrixManagedDeviceInfo[];
};
export declare function isOpenClawManagedMatrixDevice(displayName: string | null | undefined): boolean;
export declare function summarizeMatrixDeviceHealth(devices: MatrixManagedDeviceInfo[]): MatrixDeviceHealthSummary;
