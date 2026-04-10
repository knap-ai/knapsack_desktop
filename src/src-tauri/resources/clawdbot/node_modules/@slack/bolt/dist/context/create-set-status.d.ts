import type { AssistantThreadsSetStatusArguments, AssistantThreadsSetStatusResponse, WebClient } from '@slack/web-api';
export type SetStatusArguments = Omit<AssistantThreadsSetStatusArguments, 'channel_id' | 'thread_ts'>;
export type SetStatusFn = (status: string | SetStatusArguments) => Promise<AssistantThreadsSetStatusResponse>;
export declare function createSetStatus(client: WebClient, channelId: string, threadTs: string): SetStatusFn;
//# sourceMappingURL=create-set-status.d.ts.map