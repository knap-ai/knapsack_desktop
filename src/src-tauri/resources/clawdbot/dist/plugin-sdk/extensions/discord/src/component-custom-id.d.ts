import { type ComponentParserResult } from "@buape/carbon";
export declare const DISCORD_COMPONENT_CUSTOM_ID_KEY = "occomp";
export declare const DISCORD_MODAL_CUSTOM_ID_KEY = "ocmodal";
export declare function buildDiscordComponentCustomId(params: {
    componentId: string;
    modalId?: string;
}): string;
export declare function buildDiscordModalCustomId(modalId: string): string;
export declare function parseDiscordComponentCustomId(id: string): {
    componentId: string;
    modalId?: string;
} | null;
export declare function parseDiscordModalCustomId(id: string): string | null;
export declare function parseDiscordComponentCustomIdForCarbon(id: string): ComponentParserResult;
export declare function parseDiscordModalCustomIdForCarbon(id: string): ComponentParserResult;
