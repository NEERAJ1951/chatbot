import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { FloatingParticles } from '../components/FloatingParticles';

interface LandingPageProps {
  onStartChat: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="relative min-h-screen bg-[#080B12] overflow-hidden">
      {/* Background particles */}
      <FloatingParticles />

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Hero content */}
      <HeroSection onStartChat={onStartChat} />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080B12] to-transparent pointer-events-none" />
    </div>
  );
};

export default LandingPage;

