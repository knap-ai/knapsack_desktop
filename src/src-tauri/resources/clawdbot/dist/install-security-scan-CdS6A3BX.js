//#region src/plugins/install-security-scan.ts
async function loadInstallSecurityScanRuntime() {
	return await import("./install-security-scan.runtime-ZJWErf_0.js");
}
async function scanBundleInstallSource(params) {
	const { scanBundleInstallSourceRuntime } = await loadInstallSecurityScanRuntime();
	return await scanBundleInstallSourceRuntime(params);
}
async function scanPackageInstallSource(params) {
	const { scanPackageInstallSourceRuntime } = await loadInstallSecurityScanRuntime();
	return await scanPackageInstallSourceRuntime(params);
}
async function scanFileInstallSource(params) {
	const { scanFileInstallSourceRuntime } = await loadInstallSecurityScanRuntime();
	return await scanFileInstallSourceRuntime(params);
}
async function scanSkillInstallSource(params) {
	const { scanSkillInstallSourceRuntime } = await loadInstallSecurityScanRuntime();
	return await scanSkillInstallSourceRuntime(params);
}
//#endregion
export { scanSkillInstallSource as i, scanFileInstallSource as n, scanPackageInstallSource as r, scanBundleInstallSource as t };
