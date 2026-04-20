import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
/**
 * Parse LINE-specific directives from text and extract them into ReplyPayload fields.
 *
 * Supported directives:
 * - [[quick_replies: option1, option2, option3]]
 * - [[location: title | address | latitude | longitude]]
 * - [[confirm: question | yes_label | no_label]]
 * - [[buttons: title | text | btn1:data1, btn2:data2]]
 * - [[media_player: title | artist | source | imageUrl | playing/paused]]
 * - [[event: title | date | time | location | description]]
 * - [[agenda: title | event1_title:event1_time, event2_title:event2_time, ...]]
 * - [[device: name | type | status | ctrl1:data1, ctrl2:data2]]
 * - [[appletv_remote: name | status]]
 */
export declare function parseLineDirectives(payload: ReplyPayload): ReplyPayload;
export declare function hasLineDirectives(text: string): boolean;
