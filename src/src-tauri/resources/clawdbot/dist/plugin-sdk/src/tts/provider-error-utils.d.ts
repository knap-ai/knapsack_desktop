export { asFiniteNumber } from "../shared/number-coercion.js";
export { normalizeOptionalString as trimToUndefined } from "../shared/string-coerce.js";
export declare function asBoolean(value: unknown): boolean | undefined;
export declare function asObject(value: unknown): Record<string, unknown> | undefined;
export declare function truncateErrorDetail(detail: string, limit?: number): string;
export declare function readResponseTextLimited(response: Response, limitBytes?: number): Promise<string>;
