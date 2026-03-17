import "./github-copilot-token-KWLIdhbX.js";
import { cr as resolveMediaAttachmentLocalRoots, fr as isAudioAttachment, ir as runAudioTranscription, sr as normalizeMediaAttachments } from "./discord-CcCLMjHw.js";
import "./accounts-Cneuuvrk.js";
import "./token-BRx5M4Kl.js";
import "./query-expansion-Dpf_vNBe.js";
import { A as shouldLogVerbose, D as logVerbose } from "./utils-BBQx0yHF.js";
import "./paths-DO_VTrpA.js";
import "./logger-DLTnPbcB.js";
import "./fetch-HywgTLdP.js";
import "./secret-file-C1EbnaAx.js";
//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	const audioConfig = cfg.tools?.media?.audio;
	if (!audioConfig || audioConfig.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	try {
		const { transcript } = await runAudioTranscription({
			ctx,
			cfg,
			attachments,
			agentDir: params.agentDir,
			providers: params.providers,
			activeModel: params.activeModel,
			localPathRoots: resolveMediaAttachmentLocalRoots({
				cfg,
				ctx
			})
		});
		if (!transcript) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${transcript.length} chars from attachment ${firstAudio.index}`);
		return transcript;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	}
}
//#endregion
export { transcribeFirstAudio };
