import { SignalNode } from './signal.js';
import { ReactiveNode } from './graph.js';
import { ComputedNode } from './computed.js';

declare const NODE: unique symbol;
export declare namespace Signal {
    export let isState: (s: any) => boolean, isComputed: (s: any) => boolean, isWatcher: (s: any) => boolean;
    export class State<T> {
        #private;
        readonly [NODE]: SignalNode<T>;
        constructor(initialValue: T, options?: Signal.Options<T>);
        get(): T;
        set(newValue: T): void;
    }
    export class Computed<T> {
        #private;
        readonly [NODE]: ComputedNode<T>;
        constructor(computation: () => T, options?: Signal.Options<T>);
        get(): T;
    }
    type AnySignal<T = any> = State<T> | Computed<T>;
    type AnySink = Computed<any> | subtle.Watcher;
    export namespace subtle {
        function untrack<T>(cb: () => T): T;
        function introspectSources(sink: AnySink): AnySignal[];
        function introspectSinks(signal: AnySignal): AnySink[];
        function hasSinks(signal: AnySignal): boolean;
        function hasSources(signal: AnySink): boolean;
        class Watcher {
            #private;
            readonly [NODE]: ReactiveNode;
            constructor(notify: (this: Watcher) => void);
            watch(...signals: AnySignal[]): void;
            unwatch(...signals: AnySignal[]): void;
            getPending(): Computed<any>[];
        }
        function currentComputed(): Computed<any> | undefined;
        const watched: unique symbol;
        const unwatched: unique symbol;
    }
    export interface Options<T> {
        equals?: (this: AnySignal<T>, t: T, t2: T) => boolean;
        [Signal.subtle.watched]?: (this: AnySignal<T>) => void;
        [Signal.subtle.unwatched]?: (this: AnySignal<T>) => void;
    }
    export {};
}
export {};
//# sourceMappingURL=wrapper.d.ts.map