import { sendMessageTelegram as sendMessageTelegramImpl } from "../../../extensions/telegram/runtime-api.js";
export declare const runtimeSend: {
    sendMessage: typeof sendMessageTelegramImpl;
};
