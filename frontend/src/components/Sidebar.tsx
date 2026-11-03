import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  MessageSquare,
  FileText,
  ListChecks,
  Calendar,
  GraduationCap,
  ChevronLeft,
  Bot,
  PanelLeftClose,
} from 'lucide-react';

interface SidebarProps {
  conversations: Array<{ id: string; title: string; created_at: string; updated_at: string }>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  selectedSubject: string | null;
  onSelectSubject: (subject: string | null) => void;
  onOpenMainsModal: () => void;
  onOpenMCQModal: () => void;
  onOpenPlanModal: () => void;
  onOpenEnquiryModal: () => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  onOpenMainsModal,
  onOpenMCQModal,
  onOpenPlanModal,
  onOpenEnquiryModal,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
    setDeletingId(null);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  const tools = [
    { label: 'Mains Evaluator', icon: FileText, onClick: onOpenMainsModal },
    { label: 'MCQ Practice', icon: ListChecks, onClick: onOpenMCQModal },
    { label: 'Study Planner', icon: Calendar, onClick: onOpenPlanModal },
    { label: 'Admissions', icon: GraduationCap, onClick: onOpenEnquiryModal },
  ];

  // Collapsed sidebar (desktop only)
  const collapsedContent = (
    <div className="hidden lg:flex flex-col items-center py-4 gap-3 h-full w-16 bg-[#0A0F1A] border-r border-slate-800/50">
      {/* Bot icon */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center mb-1">
        <Bot className="w-4 h-4 text-white" />
      </div>

      {/* New chat */}
      <button
        onClick={onNewChat}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-colors"
        title="New Chat"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Expand */}
      <button
        onClick={onToggleCollapse}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
        title="Expand sidebar"
      >
        <PanelLeftClose className="w-4 h-4 rotate-180" />
      </button>

      <div className="flex-1" />

      {/* Tool icons */}
      <div className="flex flex-col gap-2 pb-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.label}
              onClick={tool.onClick}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-blue-400 transition-colors"
              title={tool.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );

  // Expanded sidebar content (shared between mobile and desktop)
  const expandedContent = (
    <div className="flex flex-col h-full w-72 bg-[#0A0F1A] border-r border-slate-800/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-slate-200 font-semibold text-sm">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Collapse button (desktop only) */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors"
            title="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New chat button */}
      <div className="px-3 pt-2 pb-3">
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl w-full py-2.5 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder-slate-600 pl-9 pr-3 py-2 outline-none focus:border-slate-600 transition-colors"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {filteredConversations.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.id === activeId;
            const isRenaming = renamingId === conv.id;
            const isDeleting = deletingId === conv.id;

            return (
              <div
                key={conv.id}
                className={`group relative flex items-center rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-400'
                    : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border-l-2 border-transparent'
                }`}
              >
                {isRenaming ? (
                  <div className="flex items-center gap-1 w-full px-2 py-1.5">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                      className="flex-1 bg-white/5 border border-slate-600 rounded text-sm text-slate-200 px-2 py-1 outline-none focus:border-blue-500/50 min-w-0"
                    />
                    <button
                      onClick={confirmRename}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelRename}
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center justify-between w-full px-3 py-2.5">
                    <span className="text-red-400 text-xs font-medium">Delete?</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => confirmDelete(conv.id)}
                        className="px-2 py-0.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center w-full px-3 py-2.5"
                    onClick={() => {
                      onSelect(conv.id);
                      onClose();
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mr-2.5 opacity-50" />
                    <span className="text-sm truncate flex-1">{conv.title}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRename(conv.id, conv.title);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(conv.id);
                          setRenamingId(null);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom tools section */}
      <div className="border-t border-slate-800/50 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-600 font-medium mb-2 px-1">
          Tools
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                onClick={tool.onClick}
                className="flex flex-col items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-lg p-2.5 text-slate-500 hover:text-blue-400 transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] leading-tight text-center">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sidebar */}
          <div className="relative z-10 h-full animate-slide-in-left">
            {expandedContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full">
        {isCollapsed ? collapsedContent : expandedContent}
      </div>
    </>
  );
};

export default Sidebar;
