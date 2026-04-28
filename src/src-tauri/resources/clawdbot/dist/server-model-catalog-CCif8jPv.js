import { i as getRuntimeConfig } from "./io-CFdEhZuM.js";
import "./config--k_1dtUP.js";
import { r as loadModelCatalog, s as resetModelCatalogCacheForTest } from "./model-catalog-iwhpeFqc.js";
//#region src/gateway/server-model-catalog.ts
function __resetModelCatalogCacheForTest() {
	resetModelCatalogCacheForTest();
}
async function loadGatewayModelCatalog(params) {
	return await loadModelCatalog({ config: (params?.getConfig ?? getRuntimeConfig)() });
}
//#endregion
export { loadGatewayModelCatalog as n, __resetModelCatalogCacheForTest as t };
