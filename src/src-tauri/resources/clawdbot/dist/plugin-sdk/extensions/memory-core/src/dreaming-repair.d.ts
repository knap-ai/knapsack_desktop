export type DreamingArtifactsAuditIssue = {
    severity: "warn" | "error";
    code: "dreaming-session-corpus-unreadable" | "dreaming-session-corpus-self-ingested" | "dreaming-session-ingestion-unreadable" | "dreaming-diary-unreadable";
    message: string;
    fixable: boolean;
};
export type DreamingArtifactsAuditSummary = {
    dreamsPath?: string;
    sessionCorpusDir: string;
    sessionCorpusFileCount: number;
    suspiciousSessionCorpusFileCount: number;
    suspiciousSessionCorpusLineCount: number;
    sessionIngestionPath: string;
    sessionIngestionExists: boolean;
    issues: DreamingArtifactsAuditIssue[];
};
export type RepairDreamingArtifactsResult = {
    changed: boolean;
    archiveDir?: string;
    archivedDreamsDiary: boolean;
    archivedSessionCorpus: boolean;
    archivedSessionIngestion: boolean;
    archivedPaths: string[];
    warnings: string[];
};
export declare function auditDreamingArtifacts(params: {
    workspaceDir: string;
}): Promise<DreamingArtifactsAuditSummary>;
export declare function repairDreamingArtifacts(params: {
    workspaceDir: string;
    archiveDiary?: boolean;
    now?: Date;
}): Promise<RepairDreamingArtifactsResult>;
