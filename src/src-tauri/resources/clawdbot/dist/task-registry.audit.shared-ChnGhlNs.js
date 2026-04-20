//#region src/tasks/task-registry.audit.shared.ts
function createEmptyTaskAuditSummary() {
	return {
		total: 0,
		warnings: 0,
		errors: 0,
		byCode: {
			stale_queued: 0,
			stale_running: 0,
			lost: 0,
			delivery_failed: 0,
			missing_cleanup: 0,
			inconsistent_timestamps: 0
		}
	};
}
//#endregion
export { createEmptyTaskAuditSummary as t };
