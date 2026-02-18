import { createStorage } from './-private/util.ts.js';

class SignalWeakMap {
  storages = new WeakMap();
  vals;
  readStorageFor(key) {
    const {
      storages
    } = this;
    let storage = storages.get(key);
    if (storage === undefined) {
      storage = createStorage();
      storages.set(key, storage);
    }
    storage.get();
  }
  dirtyStorageFor(key) {
    const storage = this.storages.get(key);
    if (storage) {
      storage.set(null);
    }
  }
  constructor(existing) {
    // TypeScript doesn't correctly resolve the overloads for calling the `Map`
    // constructor for the no-value constructor. This resolves that.
    this.vals = existing ? new WeakMap(existing) : new WeakMap();
  }
  get(key) {
    this.readStorageFor(key);
    return this.vals.get(key);
  }
  has(key) {
    this.readStorageFor(key);
    return this.vals.has(key);
  }
  set(key, value) {
    this.dirtyStorageFor(key);
    this.vals.set(key, value);
    return this;
  }
  delete(key) {
    this.dirtyStorageFor(key);
    return this.vals.delete(key);
  }
  get [Symbol.toStringTag]() {
    return this.vals[Symbol.toStringTag];
  }
}

// So instanceof works
Object.setPrototypeOf(SignalWeakMap.prototype, WeakMap.prototype);

export { SignalWeakMap };
//# sourceMappingURL=weak-map.ts.js.map
