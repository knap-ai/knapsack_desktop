import { EmailDocument } from 'src/utils/SourceDocument'
import { useEffect, useState } from 'react';
import { DraftTone, IEmailAutopilot } from 'src/hooks/dataSources/useEmailAutopilot'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'

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
  const [generatingTone, setGeneratingTone] = useState<DraftTone>('default');

  const handleGenerateDraft = async (tone: DraftTone = 'default') => {
    setIsGenerating(true)
    setGeneratingTone(tone)
    const draftedReply = await emailAutopilot.draftEmailReply(
      email,
      userEmail,
      userName,
      tone,
    )

    try {
      onSuccess?.(draftedReply)
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setIsGenerating(false)
      setGeneratingTone('default')
    }
  };

  useEffect(() => {
    if (isGeneratingDraft) {
      handleGenerateDraft()
    }
  }, [isGeneratingDraft]);

  if (isGenerating) {
    return (
      <Stack spacing={1} direction="row" className="items-center">
        <CircularProgress className="text-[#913631]" size="1rem" sx={{ color: '#913631' }} />
        <div className="text-sm text-ks-red-800 font-medium my-0">
          {generatingTone === 'yes' ? 'Writing yes...' : generatingTone === 'no' ? 'Writing decline...' : 'Writing...'}
        </div>
      </Stack>
    )
  }

  // After a draft exists, show only Rewrite
  if (isRegenerate) {
    return (
      <button
        onClick={() => handleGenerateDraft('default')}
        className="inline-flex items-center text-ks-red-800 hover:text-red-900 text-sm font-medium transition-colors focus:outline-none"
      >
        Rewrite
      </button>
    )
  }

  // No draft yet — show three tone options: Neutral, Yes pls, No thx
  return (
    <div className="inline-flex items-center gap-3">
      <button
        onClick={() => handleGenerateDraft('default')}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-ks-warm-grey-50 text-ks-warm-grey-800 hover:bg-ks-warm-grey-100 text-sm font-semibold font-InterTight transition-colors focus:outline-none"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Write Draft
      </button>
      <button
        onClick={() => handleGenerateDraft('yes')}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 text-sm font-semibold font-InterTight transition-colors focus:outline-none"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Yes pls
      </button>
      <button
        onClick={() => handleGenerateDraft('no')}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-ks-warm-grey-50 text-ks-warm-grey-700 hover:bg-ks-warm-grey-100 text-sm font-semibold font-InterTight transition-colors focus:outline-none"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        No thx
      </button>
    </div>
  );
};

export default GenerateDraftButton
