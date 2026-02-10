/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import type { ReactiveElement } from 'lit';
import { Signal } from 'signal-polyfill';
export interface SignalWatcher extends ReactiveElement {
    _watcher?: Signal.subtle.Watcher;
}
interface EffectOptions {
    /**
     * By default effects run after the element has updated. If `beforeUpdate`
     * is set to `true`, the effect will run before the element updates.
     */
    beforeUpdate?: boolean;
    /**
     * By default, effects are automatically disposed when the element is
     * disconnected. If `manualDispose` is set to `true`, the effect will not
     * be automatically disposed, and you must call the returned function to
     * dispose of the effect manually.
     */
    manualDispose?: boolean;
}
interface SignalWatcherApi {
    updateEffect(fn: () => void, options?: EffectOptions): () => void;
}
type Constructor<T = {}> = new (...args: any[]) => T;
/**
 * Adds the ability for a LitElement or other ReactiveElement class to
 * watch for access to signals during the update lifecycle and trigger a new
 * update when signals values change.
 */
export declare function SignalWatcher<T extends Constructor<ReactiveElement>>(Base: T): T & Constructor<SignalWatcherApi>;
export {};
//# sourceMappingURL=signal-watcher.d.ts.map