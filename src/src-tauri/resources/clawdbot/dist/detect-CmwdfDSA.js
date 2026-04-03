import { t as detectZaiEndpoint$1 } from "./provider-zai-endpoint-Cwtdsxf0.js";
import "./runtime-api-HUXeSxrV.js";
//#region extensions/zai/detect.ts
let detectZaiEndpointImpl = detectZaiEndpoint$1;
function setDetectZaiEndpointForTesting(fn) {
	detectZaiEndpointImpl = fn ?? detectZaiEndpoint$1;
}
async function detectZaiEndpoint(...args) {
	return await detectZaiEndpointImpl(...args);
}
//#endregion
export { setDetectZaiEndpointForTesting as n, detectZaiEndpoint as t };
