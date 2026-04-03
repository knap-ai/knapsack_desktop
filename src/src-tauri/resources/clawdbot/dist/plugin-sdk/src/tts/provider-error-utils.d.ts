export declare function trimToUndefined(value: unknown): string | undefined;
export declare function asObject(value: unknown): Record<string, unknown> | undefined;
export declare function truncateErrorDetail(detail: string, limit?: number): string;
export declare function readResponseTextLimited(response: Response, limitBytes?: number): Promise<string>;
