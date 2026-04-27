import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-2P4UQTnv.js";
import { t as note } from "./note-D_Kkgdi2.js";
//#region src/commands/doctor-browser.ts
function loadBrowserDoctorSurface() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "browser-doctor.js"
	});
}
async function noteChromeMcpBrowserReadiness(cfg, deps) {
	try {
		await loadBrowserDoctorSurface().noteChromeMcpBrowserReadiness(cfg, deps);
	} catch (error) {
		(deps?.noteFn ?? note)(`- Browser health check is unavailable: ${error instanceof Error ? error.message : String(error)}`, "Browser");
	}
}
//#endregion
export { noteChromeMcpBrowserReadiness };
