import type { InlineKeyboardButton, InlineKeyboardMarkup } from './types.js';

export interface Button {
  text: string;
  callbackData?: string;
  url?: string;
}

export function createInlineKeyboard(buttons: Button[][]): InlineKeyboardMarkup {
  return {
    inline_keyboard: buttons.map(row =>
      row.map((btn): InlineKeyboardButton => {
        const b: InlineKeyboardButton = { text: btn.text };
        if (btn.callbackData) b.callback_data = btn.callbackData;
        if (btn.url) b.url = btn.url;
        return b;
      }),
    ),
  };
}

/** Parse structured callback_data of the form "action:arg1:arg2". */
export function parseCallbackData(data: string): { action: string; args: string[] } {
  const [action, ...args] = data.split(':');
  return { action, args };
}

/** Build callback_data (max 64 bytes). Throws if the result is too long. */
export function buildCallbackData(action: string, ...args: string[]): string {
  const result = [action, ...args].join(':');
  if (result.length > 64) {
    throw new Error(`callback_data too long: ${result.length} bytes (max 64)`);
  }
  return result;
}
