import { type AudioTranscriptionRequest, type AudioTranscriptionResult, type MediaUnderstandingProvider, type VideoDescriptionRequest, type VideoDescriptionResult } from "openclaw/plugin-sdk/media-understanding";
export declare const DEFAULT_GOOGLE_AUDIO_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
export declare const DEFAULT_GOOGLE_VIDEO_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
export declare function transcribeGeminiAudio(params: AudioTranscriptionRequest): Promise<AudioTranscriptionResult>;
export declare function describeGeminiVideo(params: VideoDescriptionRequest): Promise<VideoDescriptionResult>;
export declare const googleMediaUnderstandingProvider: MediaUnderstandingProvider;
