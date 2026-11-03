import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Code block with language label and copy button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg border border-slate-700/50 bg-black/40 text-slate-200 overflow-hidden text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-black/30 border-b border-slate-700/40 text-slate-500 font-mono text-[11px]">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 hover:text-slate-300 transition-colors text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono leading-relaxed text-[12.5px]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Helper to render inline elements: bold, italic, inline code, links
const renderInlineText = (text: string): React.ReactNode => {
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-slate-100">
          {renderInlineText(part.slice(2, -2))}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-white/[0.08] text-blue-300 font-mono text-[12px] border border-slate-700/40 font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline decoration-blue-400/30 hover:decoration-blue-400 hover:text-blue-300 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Italic *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into block sections (code blocks vs regular text blocks)
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)(?:```|$)/g;
  const blocks: Array<{ type: 'code' | 'text'; language?: string; content: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }
    blocks.push({
      type: 'code',
      language: match[1] || '',
      content: match[2].trimEnd(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return (
    <div className={`space-y-3 leading-relaxed text-slate-300 text-[14.5px] sm:text-[15px] ${className}`}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'code') {
          return (
            <CodeBlock
              key={blockIndex}
              language={block.language || 'code'}
              code={block.content}
            />
          );
        }

        // Parse regular text block lines
        const lines = block.content.split('\n');
        const elements: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
          const line = lines[i];
          const trimmed = line.trim();

          // Empty line
          if (!trimmed) {
            i++;
            continue;
          }

          // Horizontal rule
          if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            elements.push(
              <hr key={`hr-${i}`} className="border-slate-700/40 my-4" />
            );
            i++;
            continue;
          }

          // Table detection
          if (
            trimmed.startsWith('|') &&
            i + 1 < lines.length &&
            lines[i + 1].trim().startsWith('|') &&
            lines[i + 1].includes('-')
          ) {
            const tableLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
              tableLines.push(lines[i].trim());
              i++;
            }

            if (tableLines.length >= 2) {
              const parseRow = (rowStr: string) =>
                rowStr
                  .slice(1, rowStr.endsWith('|') ? -1 : undefined)
                  .split('|')
                  .map((c) => c.trim());

              const headers = parseRow(tableLines[0]);
              const rows = tableLines.slice(2).map(parseRow);

              elements.push(
                <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-slate-700/40">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-white/[0.04] border-b border-slate-700/40">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-3.5 py-2 font-semibold text-slate-200">
                            {renderInlineText(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-white/[0.02]' : ''}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3.5 py-2 text-slate-400">
                              {renderInlineText(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
              continue;
            }
          }

          // Headings
          if (trimmed.startsWith('#### ')) {
            elements.push(
              <h4 key={i} className="text-sm font-semibold text-slate-200 mt-3 mb-1">
                {renderInlineText(trimmed.slice(5))}
              </h4>
            );
            i++;
            continue;
          }
          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={i} className="text-base sm:text-[17px] font-semibold text-slate-100 mt-3 mb-1.5">
                {renderInlineText(trimmed.slice(4))}
              </h3>
            );
            i++;
            continue;
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={i} className="text-lg sm:text-xl font-bold text-slate-50 mt-4 mb-2 tracking-tight">
                {renderInlineText(trimmed.slice(3))}
              </h2>
            );
            i++;
            continue;
          }
          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={i} className="text-xl sm:text-2xl font-bold text-slate-50 mt-4 mb-2 tracking-tight">
                {renderInlineText(trimmed.slice(2))}
              </h1>
            );
            i++;
            continue;
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            const quoteLines: string[] = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
              quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
              i++;
            }
            elements.push(
              <blockquote
                key={`quote-${i}`}
                className="border-l-[3px] border-blue-500/50 pl-3.5 py-1.5 my-2 bg-blue-500/5 text-slate-400 italic rounded-r text-sm"
              >
                {quoteLines.map((ql, qIdx) => (
                  <p key={qIdx}>{renderInlineText(ql)}</p>
                ))}
              </blockquote>
            );
            continue;
          }

          // Unordered list item
          if (/^[-*+]\s+/.test(trimmed)) {
            const listItems: string[] = [];
            while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
              listItems.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
              i++;
            }
            elements.push(
              <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-blue-500/60 text-slate-400">
                {listItems.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {renderInlineText(item)}
                  </li>
                ))}
              </ul>
            );
            continue;
          }

          // Ordered list item
          if (/^\d+\.\s+/.test(trimmed)) {
            const listItems: string[] = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
              listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
              i++;
            }
            elements.push(
              <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-4 list-decimal marker:text-blue-400/70 font-medium text-slate-400">
                {listItems.map((item, idx) => (
                  <li key={idx} className="leading-relaxed font-normal">
                    {renderInlineText(item)}
                  </li>
                ))}
              </ol>
            );
            continue;
          }

          // Regular paragraph
          const paragraphLines: string[] = [];
          while (
            i < lines.length &&
            lines[i].trim() &&
            !lines[i].trim().startsWith('#') &&
            !lines[i].trim().startsWith('>') &&
            !lines[i].trim().startsWith('|') &&
            !/^[-*+]\s+/.test(lines[i].trim()) &&
            !/^\d+\.\s+/.test(lines[i].trim()) &&
            !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
          ) {
            paragraphLines.push(lines[i]);
            i++;
          }

          elements.push(
            <p key={`p-${i}`} className="leading-relaxed text-slate-300">
              {renderInlineText(paragraphLines.join(' '))}
            </p>
          );
        }

        return <div key={blockIndex} className="space-y-2">{elements}</div>;
      })}
    </div>
  );
};
