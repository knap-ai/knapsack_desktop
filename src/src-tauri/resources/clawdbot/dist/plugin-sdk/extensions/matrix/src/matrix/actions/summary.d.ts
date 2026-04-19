import type { MatrixClient } from "../sdk.js";
import { type MatrixMessageSummary, type MatrixRawEvent } from "./types.js";
export declare function summarizeMatrixRawEvent(event: MatrixRawEvent): MatrixMessageSummary;
export declare function readPinnedEvents(client: MatrixClient, roomId: string): Promise<string[]>;
export declare function fetchEventSummary(client: MatrixClient, roomId: string, eventId: string): Promise<MatrixMessageSummary | null>;
