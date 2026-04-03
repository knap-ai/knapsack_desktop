import { t as __commonJSMin } from "./chunk-iyeSoAlh.js";
import { t as require_Reflect } from "./Reflect-BoJyzBy4.js";
import { t as require_plugin } from "./plugin-CMrRyV1o.js";
//#region node_modules/@microsoft/teams.apps/dist/types/plugin/decorators/dependency.js
var require_dependency = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PLUGIN_DEPENDENCIES_METADATA_KEY = void 0;
	exports.Dependency = Dependency;
	exports.Logger = Logger;
	exports.Storage = Storage;
	exports.HttpServer = HttpServer;
	require_Reflect();
	const plugin_1 = require_plugin();
	exports.PLUGIN_DEPENDENCIES_METADATA_KEY = "teams:plugin:dependencies";
	/**
	* add plugin dependencies via
	* `@Dependency()`
	*/
	function Dependency(options = {}) {
		const name = options.name;
		const optional = options.optional || false;
		return (target, propertyKey) => {
			if (typeof propertyKey === "string") {
				const TargetType = target.constructor;
				const FieldType = Reflect.getMetadata("design:type", target, propertyKey);
				let fieldTypeKey = name || FieldType.name;
				if (Reflect.hasMetadata(plugin_1.PLUGIN_METADATA_KEY, FieldType)) fieldTypeKey = Reflect.getMetadata(plugin_1.PLUGIN_METADATA_KEY, FieldType).name;
				const targetFieldsMetadata = Reflect.getOwnMetadata(exports.PLUGIN_DEPENDENCIES_METADATA_KEY, TargetType) || [];
				targetFieldsMetadata.push({
					key: propertyKey,
					type: fieldTypeKey,
					optional
				});
				Reflect.defineMetadata(exports.PLUGIN_DEPENDENCIES_METADATA_KEY, targetFieldsMetadata, TargetType);
			}
		};
	}
	/**
	* inject the `App` `ILogger` instance
	*/
	function Logger() {
		return Dependency({ name: "ILogger" });
	}
	/**
	* inject the `App` `IStorage` instance
	*/
	function Storage() {
		return Dependency({ name: "IStorage" });
	}
	/**
	* inject the `App` `IHttpServer` instance
	*/
	function HttpServer() {
		return Dependency({ name: "IHttpServer" });
	}
}));
//#endregion
export { require_dependency as t };
