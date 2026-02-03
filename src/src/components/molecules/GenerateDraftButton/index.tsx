import { EmailDocument } from 'src/utils/SourceDocument'
import { useEffect, useState } from 'react';
import { IEmailAutopilot } from 'src/hooks/dataSources/useEmailAutopilot'
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

  const handleGenerateDraft = async () => {
    setIsGenerating(true)
    const draftedReply = await emailAutopilot.draftEmailReply(
      email,
      userEmail,
      userName,
    )

    try {
      onSuccess?.(draftedReply)
    } catch (error) {
      onError?.(error as Error)
    } finally {
      setIsGenerating(false)
    }
  };

  useEffect(() => {
    if (isGeneratingDraft) {
      handleGenerateDraft()
    }
  }, [isGeneratingDraft]);

  return (
    <button
      onClick={handleGenerateDraft}
      disabled={isGenerating}
      className={`inline-flex items-center text-ks-red-800 hover:text-red-900 text-sm font-medium transition-colors focus:outline-none gap-1 ${
        isGenerating ? 'opacity-85 cursor-not-allowed' : ''
      }`}
    >
      {!isGenerating && (
        <>
          <div className="text-sm font-medium my-0">
            {isRegenerate ? "Rewrite" : "Write Draft"}
          </div>
        </>
      )}
      {isGenerating && (
        <>
        <Stack spacing={1} direction="row" className="items-center">
          <CircularProgress className="text-[#913631]" size="1rem" sx={{ color: '#913631' }} />
          <div className="text-sm text-ks-red-800 font-medium my-0">
            Writing...
          </div>
        </Stack>
        </>
      )}
    </button>
  );
};

export default GenerateDraftButton
