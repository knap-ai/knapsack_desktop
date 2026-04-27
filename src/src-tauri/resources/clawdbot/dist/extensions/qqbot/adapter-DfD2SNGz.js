//#region extensions/qqbot/src/engine/adapter/index.ts
let _adapter = null;
let _adapterFactory = null;
/** Register the platform adapter. Called once during startup. */
function registerPlatformAdapter(adapter) {
	_adapter = adapter;
}
/**
* Register a factory that creates the PlatformAdapter on first access.
*
* This decouples adapter availability from side-effect import ordering.
* The factory is invoked at most once — on the first `getPlatformAdapter()`
* call when no adapter has been explicitly registered yet.
*/
function registerPlatformAdapterFactory(factory) {
	_adapterFactory = factory;
}
/**
* Get the registered platform adapter.
*
* If no adapter has been explicitly registered yet but a factory was provided
* via `registerPlatformAdapterFactory()`, the factory is invoked to create
* and register the adapter automatically.
*/
function getPlatformAdapter() {
	if (!_adapter && _adapterFactory) _adapter = _adapterFactory();
	if (!_adapter) throw new Error("PlatformAdapter not registered. Call registerPlatformAdapter() during bootstrap.");
	return _adapter;
}
/** Check whether a platform adapter has been registered (or can be created from a factory). */
function hasPlatformAdapter() {
	return _adapter !== null || _adapterFactory !== null;
}
//#endregion
export { registerPlatformAdapterFactory as i, hasPlatformAdapter as n, registerPlatformAdapter as r, getPlatformAdapter as t };
