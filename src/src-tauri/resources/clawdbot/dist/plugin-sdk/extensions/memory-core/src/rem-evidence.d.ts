export type GroundedRemPreviewItem = {
    text: string;
    refs: string[];
};
export type GroundedRemCandidate = GroundedRemPreviewItem & {
    lean: "likely_durable" | "unclear" | "likely_situational";
};
export type GroundedRemFilePreview = {
    path: string;
    facts: GroundedRemPreviewItem[];
    reflections: GroundedRemPreviewItem[];
    memoryImplications: GroundedRemPreviewItem[];
    candidates: GroundedRemCandidate[];
    renderedMarkdown: string;
};
export type GroundedRemPreviewResult = {
    workspaceDir: string;
    scannedFiles: number;
    files: GroundedRemFilePreview[];
};
export declare function previewGroundedRemMarkdown(params: {
    workspaceDir: string;
    inputPaths: string[];
}): Promise<GroundedRemPreviewResult>;
