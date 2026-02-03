import React, { useState, useEffect } from 'react'

import { Button, ButtonSize, ButtonVariant } from 'src/components/atoms/button'

interface CopyButtonProps {
  onClick: () => void
}

export enum CopyButtonVariant {
  regular = 'regular',
  disabled = 'disabled',
  recordingInProgress = 'recordingInProgress',
  white = 'white',
}

const CopyButton: React.FC<CopyButtonProps> = ({
  onClick,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCopied) {
      timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCopied]);

  const handleClick = () => {
    setIsCopied(true);
    onClick();
  };

  return (
    <div className="flex flex-row items-center gap-2" onClick={handleClick}>
      <Button
        label={isCopied ? "Copied!" : "Copy"}
        variant={ButtonVariant.regular}
        size={ButtonSize.medium}
        icon={
          isCopied ? (
            <img className="mr-1.5" src="/assets/images/icons/GreenCheckmarkIcon.svg" />
          ) : (
            <img className="mr-1.5" src="/assets/images/icons/ClipboardIcon.svg" />
          )
        }
        className={`h-fit py-0 px-0 bg-transparent text-xxs uppercase font-semibold hover:underline font-InterTight tracking-[0.08em] transition-all duration-150 rounded-sm ${
          isCopied ? "text-green-500" : "text-ks-warm-grey-800"
        }`}
        onClick={handleClick}
      />
    </div>
  )
}

export default CopyButton
