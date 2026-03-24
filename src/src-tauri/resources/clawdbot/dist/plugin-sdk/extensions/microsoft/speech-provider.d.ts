import type { SpeechProviderPlugin } from "openclaw/plugin-sdk/core";
import { type SpeechVoiceOption } from "openclaw/plugin-sdk/speech";
export declare function listMicrosoftVoices(): Promise<SpeechVoiceOption[]>;
export declare function buildMicrosoftSpeechProvider(): SpeechProviderPlugin;
