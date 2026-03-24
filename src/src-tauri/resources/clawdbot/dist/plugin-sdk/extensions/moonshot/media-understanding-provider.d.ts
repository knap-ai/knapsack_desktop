import { type MediaUnderstandingProvider, type VideoDescriptionRequest, type VideoDescriptionResult } from "openclaw/plugin-sdk/media-understanding";
export declare const DEFAULT_MOONSHOT_VIDEO_BASE_URL = "https://api.moonshot.ai/v1";
export declare function describeMoonshotVideo(params: VideoDescriptionRequest): Promise<VideoDescriptionResult>;
export declare const moonshotMediaUnderstandingProvider: MediaUnderstandingProvider;
