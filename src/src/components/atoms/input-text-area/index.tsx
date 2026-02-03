import React, { useState, useEffect, useRef } from 'react';
import Arrow from '/assets/images/icons/arrow-up.svg'

interface TextAreaProps {
  className?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', value, placeholder, onChange, onEnter, onKeyDown, onBlur, ...props }, ref) => {
    const [textValue, setTextValue] = useState(value || '');
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (value !== undefined) {
        setTextValue(value);
        adjustHeight();
      }
    }, [value]);

    const adjustHeight = () => {
      const textarea = textAreaRef.current;
      if (textarea) {
        textarea.style.height = 'inherit';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = `${Math.max(44, newHeight)}px`;
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setTextValue(newValue);
      onChange?.(newValue);
      adjustHeight();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      onKeyDown?.(e);
    };

    const handleSubmit = () => {
      if (textValue.trim()) {
        onEnter?.(textValue);
        setTextValue('');
        onChange?.('');
        if (textAreaRef.current) {
          textAreaRef.current.style.height = '44px';
        }
      }
    };

    const combinedRef = (node: HTMLTextAreaElement | null) => {
      textAreaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div className="relative flex items-center w-full">
        <textarea
          ref={combinedRef}
          value={textValue}
          placeholder={placeholder}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          className={`
            h-11 min-h-[2.75rem] max-h-[200px]
            w-full mx-1.5
            bg-white rounded-[32px]
            resize-none border-0
            focus:outline-none focus:ring-2 focus:ring-blue-500
            text-ks-neutral-500
            px-6 pr-14
            py-3.5
            leading-6
            overflow-y-auto
            transition-all
            ${className}
          `}
          rows={1}
          {...props}
        />
        {textValue.trim() && (
          <button
            type="button"
            className="absolute right-3 flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
            onClick={handleSubmit}
          >
            <img src={Arrow} alt="Arrow Icon" className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

InputTextArea.displayName = 'InputTextArea';

export { InputTextArea };
