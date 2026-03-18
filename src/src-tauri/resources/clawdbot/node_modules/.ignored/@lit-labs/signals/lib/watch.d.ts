/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { DirectiveResult, Part } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';
import { Signal } from 'signal-polyfill';
export declare class WatchDirective<T> extends AsyncDirective {
    private __host?;
    private __signal?;
    private __watcher?;
    private __computed;
    private __watch;
    private __unwatch;
    render(signal: Signal.State<T> | Signal.Computed<T>): T;
    update(part: Part, [signal]: [signal: Signal.State<T> | Signal.Computed<T>]): T;
    protected disconnected(): void;
    protected reconnected(): void;
}
export type WatchDirectiveFunction = <T>(signal: Signal.State<T> | Signal.Computed<T>) => DirectiveResult<typeof WatchDirective<T>>;
/**
 * Renders a signal and subscribes to it, updating the part when the signal
 * changes.
 *
 * watch() can only be used in a reactive element that applies the
 * SignalWatcher mixin.
 */
export declare const watch: WatchDirectiveFunction;
//# sourceMappingURL=watch.d.ts.map