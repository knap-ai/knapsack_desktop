export type DeviceAuthPayloadParams = {
    deviceId: string;
    clientId: string;
    clientMode: string;
    role: string;
    scopes: string[];
    signedAtMs: number;
    token?: string | null;
    nonce?: string | null;
    version?: "v1" | "v2";
};
export declare function buildDeviceAuthPayload(params: DeviceAuthPayloadParams): string;
