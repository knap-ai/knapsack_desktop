import { type Skill } from "./skill-contract.js";
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
