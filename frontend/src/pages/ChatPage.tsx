import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Conversation, Message, Citation } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { LandingPage } from './LandingPage';
import { SettingsModal } from '../components/SettingsModal';
import { MainsEvaluatorModal } from '../components/MainsEvaluatorModal';
import { MCQPracticeModal } from '../components/MCQPracticeModal';
import { StudyPlannerModal } from '../components/StudyPlannerModal';
import { AdmissionEnquiryModal } from '../components/AdmissionEnquiryModal';
import { PanelLeft, Plus, Settings, Sparkles, Trash2, ArrowLeft } from 'lucide-react';

interface ChatPageProps {
  viewMode?: 'landing' | 'chat';
  onViewModeChange?: (mode: 'landing' | 'chat') => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  viewMode: controlledViewMode,
  onViewModeChange,
}) => {
  const { user } = useAuth();
  const [internalViewMode, setInternalViewMode] = useState<'landing' | 'chat'>('landing');
  
  const currentView = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const setView = (mode: 'landing' | 'chat') => {
    if (onViewModeChange) onViewModeChange(mode);
    setInternalViewMode(mode);
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [useRag, setUseRag] = useState<boolean>(true);
  const [preferredLang, setPreferredLang] = useState<string>(user?.preferred_language || 'English');

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentCitations, setCurrentCitations] = useState<Citation[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modals & Navigation
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMainsModal, setShowMainsModal] = useState(false);
  const [showMCQModal, setShowMCQModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load conversations on mount or auth change
  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const loadConversationMessages = async (id: string) => {
    try {
      setActiveConvId(id);
      setView('chat');
      const detail = await api.getConversationDetail(id);
      setMessages(detail.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setStreamingContent('');
    setCurrentCitations([]);
    setView('chat');
  };

  const handleClearCurrentConversation = () => {
    setMessages([]);
    setStreamingContent('');
    setCurrentCitations([]);
    setActiveConvId(null);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await api.renameConversation(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (err) {
      console.error('Failed to rename conversation', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const handleSend = async (text: string, withRag = useRag) => {
    if (!text.trim() || isStreaming) return;

    // Switch to chat view if still in landing view
    if (currentView !== 'chat') {
      setView('chat');
    }

    // Append User Message
    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);

    // Prepare for streaming
    setIsStreaming(true);
    setStreamingContent('');
    setCurrentCitations([]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulatedText = '';
    let citationsCollected: Citation[] = [];

    await api.streamChat(
      {
        message: text,
        conversation_id: activeConvId || undefined,
        subject_filter: selectedSubject || undefined,
        language_override: preferredLang,
        use_rag: withRag,
      },
      (token) => {
        accumulatedText += token;
        setStreamingContent(accumulatedText);
      },
      (citations) => {
        citationsCollected = citations;
        setCurrentCitations(citations);
      },
      (doneData) => {
        setIsStreaming(false);
        const assistantMessage: Message = {
          role: 'assistant',
          content: accumulatedText,
          citations: citationsCollected,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');
        setCurrentCitations([]);

        if (doneData.conversation_id && !activeConvId) {
          setActiveConvId(doneData.conversation_id);
          loadConversations();
        }
      },
      (err) => {
        setIsStreaming(false);
        const errMessage: Message = {
          role: 'assistant',
          content: `⚠️ ${err}`,
        };
        setMessages((prev) => [...prev, errMessage]);
        setStreamingContent('');
      },
      abortController.signal
    );
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      if (streamingContent) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: streamingContent + '\n\n*[Response stopped by user]*',
            citations: currentCitations,
          },
        ]);
        setStreamingContent('');
        setCurrentCitations([]);
      }
    }
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  // Auto-scroll to bottom on new message or stream token
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const hasMessages = messages.length > 0 || isStreaming;

  // Render Landing View if user hasn't switched to Chat yet
  if (currentView === 'landing') {
    return (
      <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#080B12]">
        <LandingPage onStartChat={() => setView('chat')} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#080B12] overflow-hidden text-slate-100">
      
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={loadConversationMessages}
        onNewChat={handleNewChat}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        onOpenMainsModal={() => setShowMainsModal(true)}
        onOpenMCQModal={() => setShowMCQModal(true)}
        onOpenPlanModal={() => setShowPlanModal(true)}
        onOpenEnquiryModal={() => setShowEnquiryModal(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Conversational Workspace */}
      <main className="flex-1 flex flex-col h-full bg-[#080B12] relative overflow-hidden">
        
        {/* Top Control Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-[#0A0F1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Open history"
              aria-label="Open history"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Desktop Expand Button when sidebar is collapsed */}
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                title="Expand sidebar"
              >
                <PanelLeft className="w-4 h-4" />
                <span className="font-semibold text-slate-200 text-xs">History</span>
              </button>
            )}

            {/* Back to Hero / Landing button */}
            <button
              type="button"
              onClick={() => setView('landing')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Return to Hero Screen"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            {/* Active Subject Badge if filtered */}
            {selectedSubject && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                <span>Module:</span>
                <span className="font-semibold">{selectedSubject}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubject(null)}
                  className="ml-1 text-slate-400 hover:text-slate-200"
                  title="Clear module filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Clear conversation option */}
            {hasMessages && (
              <button
                type="button"
                onClick={handleClearCurrentConversation}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="AI Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* New chat button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-slate-700/50 transition-colors"
              title="Start a new chat"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>New chat</span>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          {!hasMessages ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => handleSend(prompt)}
              isStreaming={isStreaming}
              onStop={handleStopStreaming}
              selectedSubject={selectedSubject}
              onOpenMains={() => setShowMainsModal(true)}
              onOpenMCQs={() => setShowMCQModal(true)}
              onOpenPlan={() => setShowPlanModal(true)}
              onOpenEnquiry={() => setShowEnquiryModal(true)}
            />
          ) : (
            <div className="max-w-3xl mx-auto py-6 pb-36">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  message={msg}
                  onRegenerate={
                    idx === messages.length - 1 && msg.role === 'assistant'
                      ? handleRegenerate
                      : undefined
                  }
                  onRetry={handleRegenerate}
                  onFeedback={(type) => {
                    if (activeConvId && msg.id) {
                      api.submitMessageFeedback(activeConvId, msg.id, type);
                    }
                  }}
                />
              ))}

              {/* Streaming AI Message */}
              {isStreaming && (
                <ChatMessage
                  message={{
                    role: 'assistant',
                    content: streamingContent || 'Thinking...',
                    citations: currentCitations,
                  }}
                  isStreaming={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Sticky Chat Composer (when conversation is active) */}
        {hasMessages && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080B12] via-[#080B12]/95 to-transparent pt-6 pb-4 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSend}
                isStreaming={isStreaming}
                onStop={handleStopStreaming}
                selectedSubject={selectedSubject}
              />
              <p className="mt-2 text-center text-[11px] text-slate-500">
                AI Companion provides intelligent answers. Verify critical information.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onClearConversation={hasMessages ? handleClearCurrentConversation : undefined}
        selectedLanguage={preferredLang}
        onSelectLanguage={setPreferredLang}
        useRag={useRag}
        onToggleRag={setUseRag}
      />

      {/* Interactive UPSC Feature Modals (Preserved from original) */}
      <MainsEvaluatorModal
        isOpen={showMainsModal}
        onClose={() => setShowMainsModal(false)}
      />

      <MCQPracticeModal
        isOpen={showMCQModal}
        onClose={() => setShowMCQModal(false)}
      />

      <StudyPlannerModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />

      <AdmissionEnquiryModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
      />

    </div>
  );
};

export default ChatPage;
