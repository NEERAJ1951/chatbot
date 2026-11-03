import React, { useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, RotateCcw, Bot } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: {
    id?: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations?: Array<{ document_title: string; page_number?: number; snippet: string }>;
    feedback?: 'up' | 'down' | null;
    created_at?: string;
  };
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
  onFeedback?: (type: 'up' | 'down') => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onRetry,
  onFeedback,
}) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isError = !isUser && message.content.startsWith('⚠️');
  const isThinking = isStreaming && (!message.content || message.content === '...' || message.content === 'Thinking...');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API not available
    }
  };

  // User message
  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="ml-auto max-w-[85%] md:max-w-[70%] bg-blue-500/20 border border-blue-400/20 rounded-2xl rounded-br-md px-5 py-3.5"
        >
          <p className="text-slate-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Error message
  if (isError) {
    return (
      <div className="flex mb-4 group">
        <div className="flex gap-3 max-w-[90%] md:max-w-[80%]">
          {/* Avatar */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-red-500/10 border border-red-400/20 rounded-2xl rounded-tl-md px-5 py-3.5">
              <p className="text-red-300 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>

            {/* Retry button */}
            {onRetry && (
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex mb-4 group">
      <div className="flex gap-3 max-w-[90%] md:max-w-[80%]">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white/[0.02] rounded-2xl rounded-tl-md px-5 py-3.5">
            {isThinking ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[15px]">Thinking</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            ) : (
              <div className="text-slate-100 text-[15px] leading-relaxed">
                <MarkdownRenderer content={message.content} />
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
                )}
              </div>
            )}
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {message.citations.map((citation, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] border border-slate-700/40 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <span>{citation.document_title}</span>
                    {citation.page_number != null && (
                      <span className="text-slate-500">• p.{citation.page_number}</span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-0.5 line-clamp-2">{citation.snippet}</p>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          {!isStreaming && (
            <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                title="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

              {onFeedback && (
                <>
                  <button
                    onClick={() => onFeedback('up')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                      message.feedback === 'up'
                        ? 'text-blue-400 bg-blue-500/10'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onFeedback('down')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                      message.feedback === 'down'
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
