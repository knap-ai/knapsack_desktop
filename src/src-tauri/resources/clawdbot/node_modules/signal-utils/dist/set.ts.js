import { createStorage } from './-private/util.ts.js';

class SignalSet {
  collection = createStorage();
  storages = new Map();
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
  constructor(existing) {
    this.vals = new Set(existing);
  }

  // **** KEY GETTERS ****
  has(value) {
    this.storageFor(value).get();
    return this.vals.has(value);
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
  add(value) {
    this.dirtyStorageFor(value);
    this.collection.set(null);
    this.vals.add(value);
    return this;
  }
  delete(value) {
    this.dirtyStorageFor(value);
    this.collection.set(null);
    return this.vals.delete(value);
  }

  // **** ALL SETTERS ****
  clear() {
    this.storages.forEach(s => s.set(null));
    this.collection.set(null);
    this.vals.clear();
  }
}

// So instanceof works
Object.setPrototypeOf(SignalSet.prototype, Set.prototype);

export { SignalSet };
//# sourceMappingURL=set.ts.js.map
