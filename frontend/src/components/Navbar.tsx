import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';
import {
  MessageSquare,
  BookOpen,
  Calendar,
  Shield,
  LogIn,
  LogOut,
  PhoneCall,
  Settings,
  Plus,
  Bot,
  History,
  Sparkles,
  Home
} from 'lucide-react';

interface NavbarProps {
  onOpenEnquiry?: () => void;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
  onOpenSettings?: () => void;
  activeView?: 'landing' | 'chat';
  onSelectView?: (view: 'landing' | 'chat') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEnquiry,
  onToggleSidebar,
  onNewChat,
  onOpenSettings,
  activeView = 'landing',
  onSelectView,
}) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  // Real backend health check status
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setIsBackendHealthy(data.status === 'healthy');
          }
        } else {
          if (mounted) setIsBackendHealthy(false);
        }
      } catch {
        if (mounted) setIsBackendHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isChatRoute = location.pathname === '/';

  return (
    <header className="bg-[#080B12]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Open Chat History"
              aria-label="Open Chat History"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          <Link
            to="/"
            onClick={() => onSelectView && onSelectView('landing')}
            className="flex items-center gap-2.5 group"
          >
            {/* Robot mascot avatar */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
              <Bot className="w-4 h-4 text-white" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-slate-100 tracking-tight">
                  AI ASSISTANT
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono hidden sm:inline">
                  PRO
                </span>
              </div>
            </div>
          </Link>

          {/* Real Backend Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 ml-2 border-l border-slate-800 text-xs">
            {isBackendHealthy === null ? (
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
                Connecting...
              </span>
            ) : isBackendHealthy ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium" title="Real-time backend status from /api/health">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ready to help
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400" title="Backend service offline or unreachable">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs">
          {/* Home view toggle */}
          <button
            type="button"
            onClick={() => onSelectView && onSelectView('landing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              isChatRoute && activeView === 'landing'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Chat view toggle */}
          <button
            type="button"
            onClick={() => onSelectView && onSelectView('chat')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              isChatRoute && activeView === 'chat'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <Link
            to="/courses"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/courses'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Courses</span>
          </Link>

          <Link
            to="/study-plans"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/study-plans'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Study Plans</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                location.pathname === '/admin'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right: Quick Action Controls, Settings & Auth */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-slate-700/50 transition-all"
              title="New Conversation"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* History Button (triggers sidebar) */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors hidden sm:inline-flex"
              title="Conversation History"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Admissions Enquiry */}
          {onOpenEnquiry && (
            <button
              onClick={onOpenEnquiry}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.03] border border-slate-700/60 hover:bg-white/[0.08] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
              <span>Admissions</span>
            </button>
          )}

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <span className="text-xs text-slate-300 hidden sm:inline font-medium max-w-[100px] truncate" title={user.name}>
                {user.name}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-500/25 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
