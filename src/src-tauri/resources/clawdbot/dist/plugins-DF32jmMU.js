import "./registry-fiJfPVib.js";
//#region src/channels/plugins/approvals.ts
function buildApprovalCapabilityFromLegacyPlugin(plugin) {
	const authorizeActorAction = plugin?.auth?.authorizeActorAction;
	const getActionAvailabilityState = plugin?.auth?.getActionAvailabilityState;
	const approvals = plugin?.approvals;
	if (!authorizeActorAction && !getActionAvailabilityState && !approvals?.delivery && !approvals?.render && !approvals?.native) return;
	return {
		authorizeActorAction,
		getActionAvailabilityState,
		delivery: approvals?.delivery,
		render: approvals?.render,
		native: approvals?.native
	};
}
function resolveChannelApprovalCapability(plugin) {
	const capability = plugin?.approvalCapability;
	const legacyCapability = buildApprovalCapabilityFromLegacyPlugin(plugin);
	if (!capability) return legacyCapability;
	if (!legacyCapability) return capability;
	return {
		authorizeActorAction: capability.authorizeActorAction ?? legacyCapability.authorizeActorAction,
		getActionAvailabilityState: capability.getActionAvailabilityState ?? legacyCapability.getActionAvailabilityState,
		delivery: capability.delivery ?? legacyCapability.delivery,
		render: capability.render ?? legacyCapability.render,
		native: capability.native ?? legacyCapability.native
	};
}
function resolveChannelApprovalAdapter(plugin) {
	const capability = resolveChannelApprovalCapability(plugin);
	if (!capability) return;
	if (!capability.delivery && !capability.render && !capability.native) return;
	return {
		delivery: capability.delivery,
		render: capability.render,
		native: capability.native
	};
}
//#endregion
export { resolveChannelApprovalCapability as n, resolveChannelApprovalAdapter as t };
