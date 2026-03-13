import { createStorage } from './-private/util.ts.js';

class SignalMap {
  collection = createStorage();
  storages = new Map();
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
    this.vals = existing ? new Map(existing) : new Map();
  }

  // **** KEY GETTERS ****
  get(key) {
    // entangle the storage for the key
    this.readStorageFor(key);
    return this.vals.get(key);
  }
  has(key) {
    this.readStorageFor(key);
    return this.vals.has(key);
  }

  // **** ALL GETTERS ****
  entries() {
    this.collection.get();
    return this.vals.entries();
  }
  keys() {
    this.collection.get();
    return this.vals.keys();
  }
  values() {
    this.collection.get();
    return this.vals.values();
  }
  forEach(fn) {
    this.collection.get();
    this.vals.forEach(fn);
  }
  get size() {
    this.collection.get();
    return this.vals.size;
  }
  [Symbol.iterator]() {
    this.collection.get();
    return this.vals[Symbol.iterator]();
  }
  get [Symbol.toStringTag]() {
    return this.vals[Symbol.toStringTag];
  }

  // **** KEY SETTERS ****
  set(key, value) {
    this.dirtyStorageFor(key);
    this.collection.set(null);
    this.vals.set(key, value);
    return this;
  }
  delete(key) {
    this.dirtyStorageFor(key);
    this.collection.set(null);
    return this.vals.delete(key);
  }

  // **** ALL SETTERS ****
  clear() {
    this.storages.forEach(s => s.set(null));
    this.collection.set(null);
    this.vals.clear();
  }
}

// So instanceof works
Object.setPrototypeOf(SignalMap.prototype, Map.prototype);

export { SignalMap };
//# sourceMappingURL=map.ts.js.map
