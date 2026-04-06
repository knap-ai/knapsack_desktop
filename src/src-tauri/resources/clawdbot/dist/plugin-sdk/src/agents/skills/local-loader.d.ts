import { type Skill } from "@mariozechner/pi-coding-agent";
export declare function loadSkillsFromDirSafe(params: {
    dir: string;
    source: string;
    maxBytes?: number;
}): {
    skills: Skill[];
};
export declare function readSkillFrontmatterSafe(params: {
    rootDir: string;
    filePath: string;
    maxBytes?: number;
}): Record<string, string> | null;
