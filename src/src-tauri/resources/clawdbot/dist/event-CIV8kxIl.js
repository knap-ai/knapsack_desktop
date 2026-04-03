import { t as __commonJSMin } from "./chunk-iyeSoAlh.js";
import { t as require_Reflect } from "./Reflect-BoJyzBy4.js";
//#region node_modules/@microsoft/teams.apps/dist/types/plugin/decorators/event.js
var require_event = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PLUGIN_EVENTS_METADATA_KEY = void 0;
	exports.Event = Event;
	require_Reflect();
	exports.PLUGIN_EVENTS_METADATA_KEY = "teams:plugin:events";
	/**
	* add an event emitter to your plugin
	* via `@Event(...)`
	*/
	function Event(name) {
		return (target, propertyKey) => {
			if (typeof propertyKey === "string") {
				const TargetType = target.constructor;
				const targetEventsMetadata = Reflect.getOwnMetadata(exports.PLUGIN_EVENTS_METADATA_KEY, TargetType) || [];
				targetEventsMetadata.push({
					key: propertyKey,
					name
				});
				Reflect.defineMetadata(exports.PLUGIN_EVENTS_METADATA_KEY, targetEventsMetadata, TargetType);
			}
		};
	}
}));
//#endregion
export { require_event as t };
