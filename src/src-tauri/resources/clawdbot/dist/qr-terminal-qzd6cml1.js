//#region src/media/qr-runtime.ts
let qrCodeTuiRuntimePromise = null;
async function loadQrCodeTuiRuntime() {
	if (!qrCodeTuiRuntimePromise) qrCodeTuiRuntimePromise = import("@vincentkoc/qrcode-tui");
	return await qrCodeTuiRuntimePromise;
}
//#endregion
//#region src/media/qr-terminal.ts
async function renderQrTerminal(input, opts = {}) {
	const { renderTerminal } = await loadQrCodeTuiRuntime();
	return await renderTerminal(input, { small: opts.small ?? true });
}
//#endregion
export { loadQrCodeTuiRuntime as n, renderQrTerminal as t };
