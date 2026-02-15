import type { SandboxDockerConfig, SandboxWorkspaceAccess } from "./types.js";
type SandboxHashInput = {
    docker: SandboxDockerConfig;
    workspaceAccess: SandboxWorkspaceAccess;
    workspaceDir: string;
    agentWorkspaceDir: string;
};
export declare function computeSandboxConfigHash(input: SandboxHashInput): string;
export {};
