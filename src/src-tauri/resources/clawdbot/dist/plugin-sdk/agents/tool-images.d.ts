import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ImageContent } from "@mariozechner/pi-ai";
type ToolContentBlock = AgentToolResult<unknown>["content"][number];
export declare function sanitizeContentBlocksImages(blocks: ToolContentBlock[], label: string, opts?: {
    maxDimensionPx?: number;
    maxBytes?: number;
}): Promise<ToolContentBlock[]>;
export declare function sanitizeImageBlocks(images: ImageContent[], label: string, opts?: {
    maxDimensionPx?: number;
    maxBytes?: number;
}): Promise<{
    images: ImageContent[];
    dropped: number;
}>;
export declare function sanitizeToolResultImages(result: AgentToolResult<unknown>, label: string, opts?: {
    maxDimensionPx?: number;
    maxBytes?: number;
}): Promise<AgentToolResult<unknown>>;
export {};
