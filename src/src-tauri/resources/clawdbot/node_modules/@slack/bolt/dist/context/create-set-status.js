"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSetStatus = void 0;
function createSetStatus(client, channelId, threadTs) {
    return (status) => {
        if (typeof status === 'string') {
            return client.assistant.threads.setStatus({
                channel_id: channelId,
                thread_ts: threadTs,
                status,
            });
        }
        return client.assistant.threads.setStatus({
            channel_id: channelId,
            thread_ts: threadTs,
            ...status,
        });
    };
}
exports.createSetStatus = createSetStatus;
//# sourceMappingURL=create-set-status.js.map