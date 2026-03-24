import { sendMessageSlack as sendMessageSlackImpl } from "../../../extensions/slack/runtime-api.js";
export declare const runtimeSend: {
    sendMessage: typeof sendMessageSlackImpl;
};
