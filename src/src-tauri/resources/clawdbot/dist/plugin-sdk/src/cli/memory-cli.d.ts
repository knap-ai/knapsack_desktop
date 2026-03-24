import type { Command } from "commander";
import type { MemoryCommandOptions } from "./memory-cli.types.js";
export declare function runMemoryStatus(opts: MemoryCommandOptions): Promise<void>;
export declare function registerMemoryCli(program: Command): void;
