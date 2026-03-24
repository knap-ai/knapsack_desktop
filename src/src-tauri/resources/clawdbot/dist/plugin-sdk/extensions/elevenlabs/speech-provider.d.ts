import type { SpeechProviderPlugin } from "openclaw/plugin-sdk/core";
import { type SpeechVoiceOption } from "openclaw/plugin-sdk/speech";
export declare function listElevenLabsVoices(params: {
    apiKey: string;
    baseUrl?: string;
}): Promise<SpeechVoiceOption[]>;
export declare function buildElevenLabsSpeechProvider(): SpeechProviderPlugin;
