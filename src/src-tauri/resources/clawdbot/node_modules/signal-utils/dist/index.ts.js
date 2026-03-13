import { Signal } from 'signal-polyfill';

/**
 * Usage:
 * ```js
 * export class Counter {
 *   @signal accessor #value = 0;
 *
 *   get doubled() {
 *     return this.#value * 2;
 *   }
 *
 *   increment() {
 *     this.#value++;
 *   }
 *
 *   decrement() {
 *     if (this.#value > 0) {
 *       this.#value--;
 *     }
 *   }
 * }
 * ```
 */

/**
 * Usage:
 * ```js
 * import { signal } from 'signal-utils';
 *
 * export class Counter {
 *   @signal accessor #value = 0;
 *
 *   @signal
 *   get expensive() {
 *     // some expensive operation
 *     return this.#value * 2;
 *   }
 *
 *   increment() {
 *     this.#value++;
 *   }
 * }
 * ```
 */

function signal(...args) {
  if (args[1].kind === "accessor") {
    return stateDecorator(...args);
  }
  if (args[1].kind === "getter") {
    return computedDecorator(...args);
  }
  throw new Error(`@signal can only be used on accessors or getters`);
}
function stateDecorator(target, context) {
  const {
    get
  } = target;
  if (context.kind !== "accessor") {
    throw new Error(`Expected to be used on an accessor property`);
  }
  return {
    get() {
      // SAFETY: does TS not allow us to have a different type internally?
      //         maybe I did something goofy.
      return get.call(this).get();
    },
    set(value) {
      // SAFETY: does TS not allow us to have a different type internally?
      //         maybe I did something goofy.
      get.call(this).set(value);
    },
    init(value) {
      // SAFETY: does TS not allow us to have a different type internally?
      //         maybe I did something goofy.
      return new Signal.State(value);
    }
  };
}
function computedDecorator(target, context) {
  const kind = context.kind;
  if (kind !== "getter") {
    throw new Error(`Can only use @cached on getters.`);
  }
  const caches = new WeakMap();
  return function () {
    let cache = caches.get(target);
    if (!cache) {
      cache = new WeakMap();
      caches.set(target, cache);
    }
    let effect = cache.get(this);
    if (!effect) {
      effect = new Signal.Computed(() => target.call(this));
      cache.set(this, effect);
    }
    return effect.get();
  };
}

export { signal };
//# sourceMappingURL=index.ts.js.map
