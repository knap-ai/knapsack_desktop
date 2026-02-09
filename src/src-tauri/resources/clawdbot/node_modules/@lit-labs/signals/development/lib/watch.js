/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { directive } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';
import { Signal } from 'signal-polyfill';
// Watcher for directives that are not associated with a host element.
let effectsPending = false;
const hostlessWatcher = new Signal.subtle.Watcher(async () => {
    if (effectsPending) {
        return;
    }
    effectsPending = true;
    queueMicrotask(() => {
        effectsPending = false;
        for (const signal of hostlessWatcher.getPending()) {
            signal.get();
        }
        hostlessWatcher.watch();
    });
});
export class WatchDirective extends AsyncDirective {
    __watch() {
        var _a, _b;
        if (this.__watcher !== undefined) {
            return;
        }
        this.__computed = new Signal.Computed(() => {
            var _a;
            const value = (_a = this.__signal) === null || _a === void 0 ? void 0 : _a.get();
            this.setValue(value);
            return value;
        });
        this.__watcher = (_b = (_a = this.__host) === null || _a === void 0 ? void 0 : _a._watcher) !== null && _b !== void 0 ? _b : hostlessWatcher;
        this.__watcher.watch(this.__computed);
        // get to trigger watcher but untracked so it's not part of performUpdate
        Signal.subtle.untrack(() => { var _a; return (_a = this.__computed) === null || _a === void 0 ? void 0 : _a.get(); });
    }
    __unwatch() {
        if (this.__watcher !== undefined) {
            this.__watcher.unwatch(this.__signal);
            this.__watcher = undefined;
        }
    }
    render(signal) {
        // This would only be called if render is called directly, like in SSR.
        return Signal.subtle.untrack(() => signal.get());
    }
    update(part, [signal]) {
        var _a, _b;
        (_a = this.__host) !== null && _a !== void 0 ? _a : (this.__host = (_b = part.options) === null || _b === void 0 ? void 0 : _b.host);
        if (signal !== this.__signal && this.__signal !== undefined) {
            // Unwatch the old signal
            this.__unwatch();
        }
        this.__signal = signal;
        this.__watch();
        // We use untrack() so that the signal access is not tracked by the watcher
        // created by SignalWatcher. This means that an can use both SignalWatcher
        // and watch() and a signal update won't trigger a full element update if
        // it's only passed to watch() and not otherwise accessed by the element.
        return Signal.subtle.untrack(() => this.__signal.get());
    }
    disconnected() {
        this.__unwatch();
    }
    reconnected() {
        this.__watch();
    }
}
/**
 * Renders a signal and subscribes to it, updating the part when the signal
 * changes.
 *
 * watch() can only be used in a reactive element that applies the
 * SignalWatcher mixin.
 */
export const watch = directive(WatchDirective);
//# sourceMappingURL=watch.js.map