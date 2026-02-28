import { EmailDocument } from 'src/utils/SourceDocument'
import { useEffect, useState } from 'react';
import { IEmailAutopilot } from 'src/hooks/dataSources/useEmailAutopilot'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'

interface GenerateDraftButtonProps {
  emailAutopilot: IEmailAutopilot,
  email: EmailDocument,
  userEmail: string,
  userName: string,
  isRegenerate: boolean,
  isGeneratingDraft: boolean,
  onSuccess?: (draft: string) => void;
  onError?: (error: Error) => void;
}

const GenerateDraftButton = ({
  emailAutopilot,
  email,
  userEmail,
  userName,
  isRegenerate,
  isGeneratingDraft,
  onSuccess,
  onError
}: GenerateDraftButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState('Writing...');
  const [toneLevel, setToneLevel] = useState(0);

  const handleGenerateDraft = async (newToneLevel: number) => {
    setIsGenerating(true)
    setToneLevel(newToneLevel)
    if (newToneLevel > 0) {
      setGeneratingLabel('Making more positive...')
    } else if (newToneLevel < 0) {
      setGeneratingLabel('Rewriting decline...')
    } else {
      setGeneratingLabel('Rewriting...')
    }

    try {
      const draftedReply = await emailAutopilot.draftEmailReply(
        email,
        userEmail,
        userName,
        'default',
        newToneLevel,
      )
      onSuccess?.(draftedReply)
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setIsGenerating(false)
    }
  };

  // Reset tone level when email changes
  useEffect(() => {
    setToneLevel(0)
  }, [email.emailUid]);

  useEffect(() => {
    if (isGeneratingDraft) {
      handleGenerateDraft(0)
    }
  }, [isGeneratingDraft]);

  if (isGenerating) {
    return (
      <Stack spacing={1} direction="row" className="items-center">
        <CircularProgress className="text-[#913631]" size="1rem" sx={{ color: '#913631' }} />
        <div className="text-sm text-ks-red-800 font-medium my-0">
          {generatingLabel}
        </div>
      </Stack>
    )
  }

  // Before auto-draft completes, show a subtle waiting state
  if (!isRegenerate) {
    return (
      <Stack spacing={1} direction="row" className="items-center">
        <CircularProgress className="text-ks-warm-grey-400" size="0.85rem" sx={{ color: '#999' }} />
        <div className="text-sm text-ks-warm-grey-500 font-medium my-0">
          Drafting response...
        </div>
      </Stack>
    )
  }

  // Draft exists — show Rewrite, +, - buttons
  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => handleGenerateDraft(0)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-ks-warm-grey-50 text-ks-warm-grey-800 hover:bg-ks-warm-grey-100 text-sm font-semibold font-InterTight transition-colors focus:outline-none"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Rewrite
      </button>
      <Tooltip title="More positive" arrow placement="top">
        <button
          onClick={() => handleGenerateDraft(toneLevel + 1)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-lg font-bold font-InterTight transition-colors focus:outline-none"
        >
          +
        </button>
      </Tooltip>
      <Tooltip title="Politely decline" arrow placement="top">
        <button
          onClick={() => handleGenerateDraft(toneLevel - 1)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-ks-warm-grey-50 text-ks-warm-grey-700 hover:bg-ks-warm-grey-100 text-lg font-bold font-InterTight transition-colors focus:outline-none"
        >
          &minus;
        </button>
      </Tooltip>
    </div>
  );
};

export default GenerateDraftButton
