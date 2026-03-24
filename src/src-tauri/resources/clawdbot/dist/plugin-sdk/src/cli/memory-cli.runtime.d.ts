import type { Command } from "commander";
import type { MemoryCommandOptions, MemorySearchCommandOptions } from "./memory-cli.types.js";
export declare function runMemoryStatus(opts: MemoryCommandOptions): Promise<void>;
export declare function runMemoryIndex(opts: MemoryCommandOptions): Promise<void>;
export declare function runMemorySearch(queryArg: string | undefined, opts: MemorySearchCommandOptions): Promise<void>;
export declare function registerMemoryCli(program: Command): void;
