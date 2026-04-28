//#region src/plugins/plugin-lru-cache.ts
var PluginLruCache = class {
	#defaultMaxEntries;
	#maxEntries;
	#entries = /* @__PURE__ */ new Map();
	constructor(defaultMaxEntries) {
		this.#defaultMaxEntries = normalizeMaxEntries(defaultMaxEntries, 1);
		this.#maxEntries = this.#defaultMaxEntries;
	}
	get maxEntries() {
		return this.#maxEntries;
	}
	get size() {
		return this.#entries.size;
	}
	setMaxEntriesForTest(value) {
		this.#maxEntries = typeof value === "number" ? normalizeMaxEntries(value, this.#defaultMaxEntries) : this.#defaultMaxEntries;
		this.#evictOldestEntries();
	}
	clear() {
		this.#entries.clear();
	}
	get(cacheKey) {
		const cached = this.getResult(cacheKey);
		return cached.hit ? cached.value : void 0;
	}
	getResult(cacheKey) {
		if (!this.#entries.has(cacheKey)) return { hit: false };
		const cached = this.#entries.get(cacheKey);
		this.#entries.delete(cacheKey);
		this.#entries.set(cacheKey, cached);
		return {
			hit: true,
			value: cached
		};
	}
	set(cacheKey, value) {
		if (this.#entries.has(cacheKey)) this.#entries.delete(cacheKey);
		this.#entries.set(cacheKey, value);
		this.#evictOldestEntries();
	}
	#evictOldestEntries() {
		while (this.#entries.size > this.#maxEntries) {
			const oldestEntry = this.#entries.keys().next();
			if (oldestEntry.done) break;
			this.#entries.delete(oldestEntry.value);
		}
	}
};
function normalizeMaxEntries(value, fallback) {
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return Math.max(1, Math.floor(value));
}
//#endregion
export { PluginLruCache as t };
