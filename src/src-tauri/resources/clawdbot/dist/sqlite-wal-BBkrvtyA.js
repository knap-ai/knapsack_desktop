function normalizeNonNegativeInteger(value, label) {
	if (!Number.isInteger(value) || value < 0) throw new Error(`${label} must be a non-negative integer`);
	return value;
}
function configureSqliteWalMaintenance(db, options = {}) {
	const autoCheckpointPages = normalizeNonNegativeInteger(options.autoCheckpointPages ?? 1e3, "autoCheckpointPages");
	const checkpointIntervalMs = normalizeNonNegativeInteger(options.checkpointIntervalMs ?? 18e5, "checkpointIntervalMs");
	const checkpointMode = options.checkpointMode ?? "TRUNCATE";
	db.exec("PRAGMA journal_mode = WAL;");
	db.exec(`PRAGMA wal_autocheckpoint = ${autoCheckpointPages};`);
	const checkpoint = () => {
		try {
			db.exec(`PRAGMA wal_checkpoint(${checkpointMode});`);
			return true;
		} catch (error) {
			options.onCheckpointError?.(error);
			return false;
		}
	};
	let timer = null;
	if (checkpointIntervalMs > 0) {
		timer = setInterval(checkpoint, checkpointIntervalMs);
		timer.unref?.();
	}
	return {
		checkpoint,
		close: () => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
			return checkpoint();
		}
	};
}
//#endregion
export { configureSqliteWalMaintenance as t };
