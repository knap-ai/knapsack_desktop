/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { Signal } from 'signal-polyfill';
let effectsPending = false;
const effectWatcher = new Signal.subtle.Watcher(() => {
    if (effectsPending) {
        return;
    }
    effectsPending = true;
    queueMicrotask(() => {
        effectsPending = false;
        for (const signal of effectWatcher.getPending()) {
            signal.get();
        }
        effectWatcher.watch();
    });
});
const signalWatcherBrand = Symbol('SignalWatcherBrand');
// Memory management: We need to ensure that we don't leak memory by creating a
// reference cycle between an element and its watcher, which then it kept alive
// by the signals it watches. To avoid this, we break the cycle by using a
// WeakMap to store the watcher for each element, and a FinalizationRegistry to
// clean up the watcher when the element is garbage collected.
const elementFinalizationRegistry = new FinalizationRegistry((watcher) => {
    watcher.unwatch(...Signal.subtle.introspectSources(watcher));
});
const elementForWatcher = new WeakMap();
/**
 * Adds the ability for a LitElement or other ReactiveElement class to
 * watch for access to signals during the update lifecycle and trigger a new
 * update when signals values change.
 */
export function SignalWatcher(Base) {
    // Only apply the mixin once
    if (Base[signalWatcherBrand] === true) {
        console.warn('SignalWatcher should not be applied to the same class more than once.');
        return Base;
    }
    class SignalWatcher extends Base {
        constructor() {
            super(...arguments);
            // list signals managing effects, stored with effect options.
            this.__effects = new Map();
            /**
             * Used to force an uncached read of the __performUpdateSignal when we need
             * to read the current value during an update.
             *
             * If https://github.com/tc39/proposal-signals/issues/151 is resolved, we
             * won't need this.
             */
            this.__forceUpdateSignal = new Signal.State(0);
            /*
             * This field is used within the watcher to determine if the watcher
             * notification was triggered by our performUpdate() override. Because we
             * force a fresh read of the __performUpdateSignal by changing value of the
             * __forceUpdate signal, the watcher will be notified. But we're already
             * performing an update, so we don't want to enqueue another one.
             */
            // @ts-expect-error This field is accessed in a watcher function with a
            // different `this` context, so TypeScript can't see the access.
            this.__forcingUpdate = false;
        }
        /**
         * Flushes effects in required order:
         * 1. Before update effects
         * 2. Perform update
         * 3. Pending watches
         * 4. After update effects
         * */
        __flushEffects() {
            var _a, _b;
            const beforeEffects = [];
            const afterEffects = [];
            this.__effects.forEach((options, signal) => {
                const list = (options === null || options === void 0 ? void 0 : options.beforeUpdate) ? beforeEffects : afterEffects;
                list.push(signal);
            });
            const pendingWatches = (_a = this._watcher) === null || _a === void 0 ? void 0 : _a.getPending().filter((signal) => signal !== this.__performUpdateSignal && !this.__effects.has(signal));
            beforeEffects.forEach((signal) => signal.get());
            (_b = this.__performUpdateSignal) === null || _b === void 0 ? void 0 : _b.get();
            pendingWatches.forEach((signal) => signal.get());
            afterEffects.forEach((signal) => signal.get());
        }
        // @ts-expect-error This method is called anonymously in a watcher function
        __queueEffects() {
            if (this.isUpdatePending) {
                return;
            }
            queueMicrotask(() => {
                if (!this.isUpdatePending) {
                    this.__flushEffects();
                }
            });
        }
        __watch() {
            if (this._watcher !== undefined) {
                return;
            }
            // We create a fresh computed instead of just re-using the existing one
            // because of https://github.com/proposal-signals/signal-polyfill/issues/27
            this.__performUpdateSignal = new Signal.Computed(() => {
                this.__forceUpdateSignal.get();
                super.performUpdate();
            });
            const watcher = (this._watcher = new Signal.subtle.Watcher(function () {
                // All top-level references in this function body must either be `this`
                // (the `watcher`) or a module global to prevent this closure from keeping
                // the enclosing scopes alive, which would keep the element alive. So
                // The only two references are `this` and `elementForWatcher`.
                const el = elementForWatcher.get(this);
                if (el === undefined) {
                    // The element was garbage collected, so we can stop watching.
                    return;
                }
                if (el.__forcingUpdate === false) {
                    const needsUpdate = new Set(this.getPending()).has(el.__performUpdateSignal);
                    if (needsUpdate) {
                        el.requestUpdate();
                    }
                    else {
                        el.__queueEffects();
                    }
                }
                this.watch();
            }));
            elementForWatcher.set(watcher, this);
            elementFinalizationRegistry.register(this, watcher);
            watcher.watch(this.__performUpdateSignal);
            watcher.watch(...Array.from(this.__effects).map(([signal]) => signal));
        }
        __unwatch() {
            if (this._watcher === undefined) {
                return;
            }
            let keepAlive = false;
            // We unwatch all signals that are not manually disposed, so that we don't
            // keep the element alive by holding references to it.
            this._watcher.unwatch(...Signal.subtle.introspectSources(this._watcher).filter((signal) => {
                var _a;
                const shouldUnwatch = ((_a = this.__effects.get(signal)) === null || _a === void 0 ? void 0 : _a.manualDispose) !== true;
                if (shouldUnwatch) {
                    this.__effects.delete(signal);
                }
                keepAlive || (keepAlive = !shouldUnwatch);
                return shouldUnwatch;
            }));
            if (!keepAlive) {
                this.__performUpdateSignal = undefined;
                this._watcher = undefined;
                this.__effects.clear();
            }
        }
        /**
         * Executes the provided callback function when any of the signals it
         * accesses change. By default, the function is called after any pending
         * element update. Set the `beforeUpdate` property to `true` to run the
         * effect before the element updates. An effect is automatically disposed
         * when the element is disconnected. Set the `manualDispose` property to
         * `true` to prevent this. Call the returned function to manually dispose
         * of the effect.
         *
         * @param callback
         * @param options {beforeUpdate, manualDispose}
         */
        updateEffect(fn, options) {
            var _a;
            this.__watch();
            const signal = new Signal.Computed(() => {
                fn();
            });
            this._watcher.watch(signal);
            this.__effects.set(signal, options);
            const beforeUpdate = (_a = options === null || options === void 0 ? void 0 : options.beforeUpdate) !== null && _a !== void 0 ? _a : false;
            // An untracked read is safer and all that it takes to
            // tell the watcher to go.
            if (beforeUpdate) {
                Signal.subtle.untrack(() => signal.get());
            }
            else {
                this.updateComplete.then(() => Signal.subtle.untrack(() => signal.get()));
            }
            return () => {
                this.__effects.delete(signal);
                this._watcher.unwatch(signal);
                if (this.isConnected === false) {
                    this.__unwatch();
                }
            };
        }
        performUpdate() {
            if (!this.isUpdatePending) {
                // super.performUpdate() performs this check, so we bail early so that
                // we don't read the __performUpdateSignal when it's not going to access
                // any signals. This keeps the last signals read as the sources so that
                // we'll get notified of changes to them.
                return;
            }
            // Always enable watching before an update, even if disconnected, so that
            // we can track signals that are accessed during the update.
            this.__watch();
            // Force an uncached read of __performUpdateSignal
            this.__forcingUpdate = true;
            this.__forceUpdateSignal.set(this.__forceUpdateSignal.get() + 1);
            this.__forcingUpdate = false;
            // Flush all queued effects...
            this.__flushEffects();
        }
        connectedCallback() {
            super.connectedCallback();
            // Because we might have missed some signal updates while disconnected,
            // we force a full render on the next update.
            this.requestUpdate();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            // Clean up the watcher earlier than the FinalizationRegistry will, to
            // avoid memory pressure from signals holding references to the element
            // via the watcher.
            //
            // This means that while disconnected, regular reactive property updates
            // will trigger a re-render, but signal updates will not. To ensure that
            // current signal usage is still correctly tracked, we re-enable watching
            // in performUpdate() even while disconnected. From that point on, a
            // disconnected element will be retained by the signals it accesses during
            // the update lifecycle.
            //
            // We use queueMicrotask() to ensure that this cleanup does not happen
            // because of moves in the DOM within the same task, such as removing an
            // element with .remove() and then adding it back later with .append()
            // in the same task. For example, repeat() works this way.
            queueMicrotask(() => {
                if (this.isConnected === false) {
                    this.__unwatch();
                }
            });
        }
    }
    return SignalWatcher;
}
//# sourceMappingURL=signal-watcher.js.map