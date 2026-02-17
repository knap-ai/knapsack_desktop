import { createStorage } from './-private/util.ts.js';

class SignalWeakSet {
  storages = new WeakMap();
  vals;
  storageFor(key) {
    const storages = this.storages;
    let storage = storages.get(key);
    if (storage === undefined) {
      storage = createStorage();
      storages.set(key, storage);
    }
    return storage;
  }
  dirtyStorageFor(key) {
    const storage = this.storages.get(key);
    if (storage) {
      storage.set(null);
    }
  }
  constructor(values) {
    this.vals = new WeakSet(values);
  }
  has(value) {
    this.storageFor(value).get();
    return this.vals.has(value);
  }
  add(value) {
    // Add to vals first to get better error message
    this.vals.add(value);
    this.dirtyStorageFor(value);
    return this;
  }
  delete(value) {
    this.dirtyStorageFor(value);
    return this.vals.delete(value);
  }
  get [Symbol.toStringTag]() {
    return this.vals[Symbol.toStringTag];
  }
}

// So instanceof works
Object.setPrototypeOf(SignalWeakSet.prototype, WeakSet.prototype);

export { SignalWeakSet };
//# sourceMappingURL=weak-set.ts.js.map
