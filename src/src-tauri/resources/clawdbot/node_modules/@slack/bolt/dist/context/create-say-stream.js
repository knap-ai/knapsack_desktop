"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSayStream = void 0;
function createSayStream(client, context, channelId, threadTs) {
    return (args) => {
        return client.chatStream({
            channel: channelId,
            thread_ts: threadTs,
            recipient_team_id: context.teamId ?? context.enterpriseId,
            recipient_user_id: context.userId,
            ...args,
        });
    };
}
exports.createSayStream = createSayStream;
//# sourceMappingURL=create-say-stream.js.map