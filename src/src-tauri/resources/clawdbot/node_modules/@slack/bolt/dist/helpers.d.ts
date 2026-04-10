import type { AnyMiddlewareArgs, KnownEventFromType, ReceiverEvent } from './types';
/**
 * Internal data type for capturing the class of event processed in App#onIncomingEvent()
 */
export declare enum IncomingEventType {
    Event = 0,
    Action = 1,
    Command = 2,
    Options = 3,
    ViewAction = 4,// TODO: terminology: ViewAction? Why Action?
    Shortcut = 5
}
/**
 * Helper which finds the type and channel (if any) that any specific incoming event is related to.
 *
 * This is analogous to WhenEventHasChannelContext and the conditional type that checks SlackAction for a channel
 * context.
 */
export declare function getTypeAndConversation(body: any): {
    type?: IncomingEventType;
    conversationId?: string;
};
/**
 * Helper which determines if the body of a request is enterprise install.
 *
 * Providing the type is optional but if you do the execution will be faster
 */
export declare function isBodyWithTypeEnterpriseInstall(body: AnyMiddlewareArgs['body'], type?: IncomingEventType): boolean;
/**
 * Helper which determines if the event type will skip Authorize.
 *
 * Token revocation use cases
 * https://github.com/slackapi/bolt-js/issues/674
 */
export declare function isEventTypeToSkipAuthorize(event: ReceiverEvent): boolean;
/** Helper that should never be called, but is useful for exhaustiveness checking in conditional branches */
export declare function assertNever(x?: never): never;
/**
 * Extracts thread_ts from the event payload, checking common locations where it may appear.
 */
export declare function extractEventThreadTs<T extends string>(event: KnownEventFromType<T>): string | undefined;
/**
 * Extracts ts from the event payload.
 */
export declare function extractEventTs<T extends string>(event: KnownEventFromType<T>): string | undefined;
/**
 * Extracts the channel ID from the event payload, checking common locations where it may appear.
 *
 * TODO: When ready use this in getTypeAndConversation
 * Note: this intentionally prefers channel (string) > channel (object.id) > channel_id > item.channel > assistant_thread.channel_id,
 * which differs from getTypeAndConversation where channel_id overwrites channel. Align when consolidating.
 */
export declare function extractEventChannelId<T extends string>(event: KnownEventFromType<T>): string | undefined;
/**
 * Type guard that narrows an unknown value to a record (non-null object).
 * @example
 * isRecord({ key: 'value' }) // true
 * isRecord(null)             // false
 * isRecord('string')         // false
 */
export declare function isRecord<T extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>>(value: unknown): value is T;
/**
 * Type guard that checks whether an object contains a specific key with a string value.
 * @example
 * hasStringProperty({ channel: 'C123' }, 'channel') // true
 * hasStringProperty({ count: 42 }, 'count')         // false (not a string)
 * hasStringProperty({}, 'channel')                   // false (key missing)
 */
export declare function hasStringProperty<T, K extends PropertyKey>(obj: T, key: K): obj is T & Record<K, string>;
//# sourceMappingURL=helpers.d.ts.map