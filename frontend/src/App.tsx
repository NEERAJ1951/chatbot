import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ChatPage } from './pages/ChatPage';
import { CoursesPage } from './pages/CoursesPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdmissionEnquiryModal } from './components/AdmissionEnquiryModal';
import { SettingsModal } from './components/SettingsModal';

const AppContent: React.FC = () => {
  const [showGlobalEnquiry, setShowGlobalEnquiry] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'chat'>('landing');
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white">
      <Navbar
        onOpenEnquiry={() => setShowGlobalEnquiry(true)}
        onOpenSettings={() => setShowGlobalSettings(true)}
        activeView={viewMode}
        onSelectView={(mode) => setViewMode(mode)}
        onNewChat={() => setViewMode('chat')}
      />
      
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <ChatPage
                viewMode={viewMode}
                onViewModeChange={(mode) => setViewMode(mode)}
              />
            }
          />
          <Route
            path="/chat"
            element={
              <ChatPage
                viewMode="chat"
                onViewModeChange={(mode) => setViewMode(mode)}
              />
            }
          />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/study-plans" element={<StudyPlanPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <AdmissionEnquiryModal
        isOpen={showGlobalEnquiry}
        onClose={() => setShowGlobalEnquiry(false)}
      />

      <SettingsModal
        isOpen={showGlobalSettings}
        onClose={() => setShowGlobalSettings(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
