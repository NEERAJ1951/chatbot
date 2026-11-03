import React from 'react';
import { Lightbulb, Code, PenLine, Sparkles, Bot } from 'lucide-react';
import { ChatInput } from './ChatInput';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  isStreaming?: boolean;
  onStop?: () => void;
  selectedSubject?: string | null;
  onOpenMains?: () => void;
  onOpenMCQs?: () => void;
  onOpenPlan?: () => void;
  onOpenEnquiry?: () => void;
}

const suggestions = [
  {
    icon: Lightbulb,
    title: 'Explain a Concept',
    desc: 'Make difficult topics easy to understand.',
    prompt: 'Can you explain a complex topic in simple terms?',
  },
  {
    icon: Code,
    title: 'Write Code',
    desc: 'Generate and explain code with examples.',
    prompt: 'Help me write a Python program that...',
  },
  {
    icon: PenLine,
    title: 'Improve My Writing',
    desc: 'Rewrite text to make it clearer and more professional.',
    prompt: 'Can you improve this text to make it more professional?',
  },
  {
    icon: Sparkles,
    title: 'Brainstorm Ideas',
    desc: 'Explore creative solutions and new possibilities.',
    prompt: 'Help me brainstorm ideas for...',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  isStreaming,
  onStop,
  selectedSubject,
}) => {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-16 px-6">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
        <Bot className="w-6 h-6 text-white" />
      </div>

      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-100 text-center">
        What can I help you with today?
      </h1>

      {/* Supporting text */}
      <p className="text-slate-400 text-center mt-3 text-sm md:text-base leading-relaxed">
        Ask anything. Get clear explanations, useful ideas, and step-by-step guidance.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => onSelectPrompt(item.prompt)}
              className="bg-white/[0.03] border border-slate-700/40 hover:border-blue-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-white/[0.05] group text-left"
            >
              <Icon className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-slate-500 mt-1.5">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Chat input */}
      <div className="w-full mt-8">
        <ChatInput
          onSend={onSelectPrompt}
          isStreaming={isStreaming}
          onStop={onStop}
          selectedSubject={selectedSubject}
        />
      </div>

      {/* Footer */}
      <p className="text-[11px] text-slate-600 text-center mt-3">
        AI Assistant provides helpful guidance. Always verify important information.
      </p>
    </div>
  );
};

export default WelcomeScreen;
