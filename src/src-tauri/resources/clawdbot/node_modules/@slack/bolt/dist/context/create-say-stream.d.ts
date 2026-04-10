import type { WebClient } from '@slack/web-api';
import type { Context } from '../types';
type ChatStreamParams = Parameters<WebClient['chatStream']>[0];
export type SayStreamArguments = Partial<Omit<ChatStreamParams, 'token'>>;
export type SayStreamFn = (args?: SayStreamArguments) => ReturnType<WebClient['chatStream']>;
export declare function createSayStream(client: WebClient, context: Context, channelId: string, threadTs: string): SayStreamFn;
export {};
//# sourceMappingURL=create-say-stream.d.ts.map