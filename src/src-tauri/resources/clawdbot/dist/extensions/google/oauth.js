import { clearCredentialsCache, extractGeminiCliCredentials } from "./oauth.credentials.js";
import { buildAuthUrl, generateOAuthState, generatePkce, parseCallbackInput, shouldUseManualOAuthFlow, waitForLocalCallback } from "./oauth.flow.js";
import { exchangeCodeForTokens } from "./oauth.token.js";
//#region extensions/google/oauth.ts
async function loginGeminiCliOAuth(ctx) {
	const needsManual = shouldUseManualOAuthFlow(ctx.isRemote);
	await ctx.note(needsManual ? [
		"You are running in a remote/VPS environment.",
		"A URL will be shown for you to open in your LOCAL browser.",
		"After signing in, copy the redirect URL and paste it back here."
	].join("\n") : [
		"Browser will open for Google authentication.",
		"Sign in with your Google account for Gemini CLI access.",
		"The callback will be captured automatically on localhost:8085."
	].join("\n"), "Gemini CLI OAuth");
	const { verifier, challenge } = generatePkce();
	const state = generateOAuthState();
	const authUrl = buildAuthUrl(challenge, state);
	if (needsManual) {
		ctx.progress.update("OAuth URL ready");
		ctx.log(`\nOpen this URL in your LOCAL browser:\n\n${authUrl}\n`);
		ctx.progress.update("Waiting for you to paste the callback URL...");
		const parsed = parseCallbackInput(await ctx.prompt("Paste the redirect URL here: "));
		if ("error" in parsed) throw new Error(parsed.error);
		if (parsed.state !== state) throw new Error("OAuth state mismatch - please try again");
		ctx.progress.update("Exchanging authorization code for tokens...");
		return exchangeCodeForTokens(parsed.code, verifier);
	}
	ctx.progress.update("Complete sign-in in browser...");
	try {
		await ctx.openUrl(authUrl);
	} catch {
		ctx.log(`\nOpen this URL in your browser:\n\n${authUrl}\n`);
	}
	try {
		const { code } = await waitForLocalCallback({
			expectedState: state,
			timeoutMs: 300 * 1e3,
			onProgress: (msg) => ctx.progress.update(msg)
		});
		ctx.progress.update("Exchanging authorization code for tokens...");
		return await exchangeCodeForTokens(code, verifier);
	} catch (err) {
		if (err instanceof Error && (err.message.includes("EADDRINUSE") || err.message.includes("port") || err.message.includes("listen"))) {
			ctx.progress.update("Local callback server failed. Switching to manual mode...");
			ctx.log(`\nOpen this URL in your LOCAL browser:\n\n${authUrl}\n`);
			const parsed = parseCallbackInput(await ctx.prompt("Paste the redirect URL here: "));
			if ("error" in parsed) throw new Error(parsed.error, { cause: err });
			if (parsed.state !== state) throw new Error("OAuth state mismatch - please try again", { cause: err });
			ctx.progress.update("Exchanging authorization code for tokens...");
			return exchangeCodeForTokens(parsed.code, verifier);
		}
		throw err;
	}
}
//#endregion
export { clearCredentialsCache, extractGeminiCliCredentials, loginGeminiCliOAuth };
