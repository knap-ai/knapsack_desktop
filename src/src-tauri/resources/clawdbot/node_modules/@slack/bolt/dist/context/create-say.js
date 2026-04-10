"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSay = void 0;
function createSay(client, channelId) {
    return (message) => {
        let postMessageArguments;
        if (typeof message === 'string') {
            postMessageArguments = { text: message, channel: channelId };
        }
        else {
            postMessageArguments = { ...message, channel: channelId };
        }
        return client.chat.postMessage(postMessageArguments);
    };
}
exports.createSay = createSay;
//# sourceMappingURL=create-say.js.map