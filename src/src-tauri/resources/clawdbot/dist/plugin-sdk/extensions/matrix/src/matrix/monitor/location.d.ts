import type { LocationMessageEventContent } from "../sdk.js";
import { toLocationContext } from "./runtime-api.js";
export type MatrixLocationPayload = {
    text: string;
    context: ReturnType<typeof toLocationContext>;
};
export declare function resolveMatrixLocation(params: {
    eventType: string;
    content: LocationMessageEventContent;
}): MatrixLocationPayload | null;
