//#region src/channels/plugins/stateful-target-drivers.ts
const registeredStatefulBindingTargetDrivers = /* @__PURE__ */ new Map();
function listStatefulBindingTargetDrivers() {
	return [...registeredStatefulBindingTargetDrivers.values()];
}
function registerStatefulBindingTargetDriver(driver) {
	const id = driver.id.trim();
	if (!id) throw new Error("Stateful binding target driver id is required");
	const normalized = {
		...driver,
		id
	};
	if (registeredStatefulBindingTargetDrivers.get(id)) return;
	registeredStatefulBindingTargetDrivers.set(id, normalized);
}
function getStatefulBindingTargetDriver(id) {
	const normalizedId = id.trim();
	if (!normalizedId) return null;
	return registeredStatefulBindingTargetDrivers.get(normalizedId) ?? null;
}
function resolveStatefulBindingTargetBySessionKey(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return null;
	for (const driver of listStatefulBindingTargetDrivers()) {
		const bindingTarget = driver.resolveTargetBySessionKey?.({
			cfg: params.cfg,
			sessionKey
		});
		if (bindingTarget) return {
			driver,
			bindingTarget
		};
	}
	return null;
}
//#endregion
//#region src/channels/plugins/stateful-target-builtins.ts
let builtinsRegisteredPromise = null;
async function ensureStatefulTargetBuiltinsRegistered() {
	if (builtinsRegisteredPromise) {
		await builtinsRegisteredPromise;
		return;
	}
	builtinsRegisteredPromise = (async () => {
		const { acpStatefulBindingTargetDriver } = await import("./acp-stateful-target-driver-Dhna8wi5.js");
		registerStatefulBindingTargetDriver(acpStatefulBindingTargetDriver);
	})();
	try {
		await builtinsRegisteredPromise;
	} catch (error) {
		builtinsRegisteredPromise = null;
		throw error;
	}
}
//#endregion
//#region src/channels/plugins/binding-targets.ts
async function ensureConfiguredBindingTargetReady(params) {
	await ensureStatefulTargetBuiltinsRegistered();
	if (!params.bindingResolution) return { ok: true };
	const driver = getStatefulBindingTargetDriver(params.bindingResolution.statefulTarget.driverId);
	if (!driver) return {
		ok: false,
		error: `Configured binding target driver unavailable: ${params.bindingResolution.statefulTarget.driverId}`
	};
	return await driver.ensureReady({
		cfg: params.cfg,
		bindingResolution: params.bindingResolution
	});
}
async function resetConfiguredBindingTargetInPlace(params) {
	await ensureStatefulTargetBuiltinsRegistered();
	const resolved = resolveStatefulBindingTargetBySessionKey({
		cfg: params.cfg,
		sessionKey: params.sessionKey
	});
	if (!resolved?.driver.resetInPlace) return {
		ok: false,
		skipped: true
	};
	return await resolved.driver.resetInPlace({
		...params,
		bindingTarget: resolved.bindingTarget
	});
}
async function ensureConfiguredBindingTargetSession(params) {
	await ensureStatefulTargetBuiltinsRegistered();
	const driver = getStatefulBindingTargetDriver(params.bindingResolution.statefulTarget.driverId);
	if (!driver) return {
		ok: false,
		sessionKey: params.bindingResolution.statefulTarget.sessionKey,
		error: `Configured binding target driver unavailable: ${params.bindingResolution.statefulTarget.driverId}`
	};
	return await driver.ensureSession({
		cfg: params.cfg,
		bindingResolution: params.bindingResolution
	});
}
//#endregion
export { ensureConfiguredBindingTargetSession as n, resetConfiguredBindingTargetInPlace as r, ensureConfiguredBindingTargetReady as t };
