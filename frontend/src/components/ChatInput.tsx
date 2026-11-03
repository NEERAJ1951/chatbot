import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Square, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string, useRag?: boolean) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  selectedSubject?: string | null;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isStreaming = false,
  onStop,
  selectedSubject,
  placeholder,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '44px';
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.min(scrollH, 140)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed, !!selectedSubject);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = text.trim().length === 0;

  return (
    <div className="w-full">
      <div className="bg-white/[0.03] border border-slate-700/50 rounded-2xl p-1.5 focus-within:border-blue-500/50 transition-colors">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Ask anything...'}
            rows={1}
            className="bg-transparent text-slate-100 placeholder-slate-500 resize-none w-full outline-none px-4 py-3 text-[15px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700"
            style={{ height: '44px', maxHeight: '140px' }}
          />

          <div className="flex-shrink-0 pb-1.5 pr-1.5">
            {isStreaming ? (
              <button
                onClick={onStop}
                className="rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2.5 transition-colors"
                title="Stop generating"
              >
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={isEmpty}
                className={`rounded-xl bg-blue-500 hover:bg-blue-600 text-white p-2.5 transition-colors ${
                  isEmpty ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subject badge */}
      {selectedSubject && (
        <div className="flex items-center mt-2 ml-1">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-lg">
            Module: {selectedSubject}
            <button
              onClick={() => onSend('', false)}
              className="hover:text-blue-300 transition-colors"
              title="Clear subject"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
