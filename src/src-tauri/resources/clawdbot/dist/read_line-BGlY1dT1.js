//#region node_modules/@clawdbot/lobster/dist/src/read_line.js
function readLineFromStream(stream, opts) {
	const timeoutMs = Number(opts?.timeoutMs ?? 0);
	return new Promise((resolve, reject) => {
		let settled = false;
		let buf = "";
		let timer = null;
		const cleanup = () => {
			stream.off("data", onData);
			stream.off("end", onEnd);
			stream.off("close", onClose);
			stream.off("error", onError);
			if (timer) clearTimeout(timer);
		};
		const finish = (value) => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(value);
		};
		const fail = (err) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(err);
		};
		const onData = (chunk) => {
			buf += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
			const idx = buf.indexOf("\n");
			if (idx !== -1) finish(buf.slice(0, idx));
		};
		const onEnd = () => finish(buf);
		const onClose = () => finish(buf);
		const onError = (err) => fail(err);
		if (timeoutMs > 0) timer = setTimeout(() => {
			fail(/* @__PURE__ */ new Error(`Timed out waiting for input (${timeoutMs}ms)`));
		}, timeoutMs);
		stream.on("data", onData);
		stream.on("end", onEnd);
		stream.on("close", onClose);
		stream.on("error", onError);
	});
}
//#endregion
export { readLineFromStream as t };
