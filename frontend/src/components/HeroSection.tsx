import React from 'react';

interface HeroSectionProps {
  onStartChat: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartChat }) => {
  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }

        .float-delay-0 { animation-delay: 0s; }
        .float-delay-1 { animation-delay: 0.5s; }
        .float-delay-2 { animation-delay: 1s; }
        .float-delay-3 { animation-delay: 1.5s; }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
            opacity: 1;
          }
          .animate-float {
            animation: none;
          }
          .animate-pulse-glow {
            animation: none;
            opacity: 0.8;
          }
        }
      `}</style>

      <section className="min-h-screen flex items-center relative overflow-hidden" style={{ backgroundColor: '#080B12' }}>
        {/* Background radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(96,165,250,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-6 z-10">
              {/* Label */}
              <span className="animate-fade-in-up delay-100 uppercase tracking-widest text-xs font-medium" style={{ color: '#38BDF8' }}>
                Your Intelligent AI Assistant
              </span>

              {/* Heading */}
              <h1 className="animate-fade-in-up delay-200 text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: '#F8FAFC' }}>
                Meet Your New
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
                  AI Companion.
                </span>
              </h1>

              {/* Supporting text */}
              <p className="animate-fade-in-up delay-300 text-lg max-w-lg" style={{ color: '#94A3B8' }}>
                Ask questions, explore ideas, solve problems, and discover better answers through natural conversation.
              </p>

              {/* Buttons */}
              <div className="animate-fade-in-up delay-400 flex flex-wrap gap-4">
                <button
                  onClick={onStartChat}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 cursor-pointer"
                >
                  Start Chatting
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border border-slate-600 hover:border-slate-400 text-slate-300 px-8 py-3 rounded-xl font-semibold backdrop-blur transition-colors duration-200 cursor-pointer"
                >
                  Explore Features
                </button>
              </div>

              {/* Trust indicator */}
              <p className="animate-fade-in-up delay-500 text-xs" style={{ color: '#64748B' }}>
                ✦ Intelligent Conversations. Simple Answers.
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="relative flex items-center justify-center lg:min-h-[500px]">
              {/* Radial glow behind robot */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(96,165,250,0.1) 0%, rgba(56,189,248,0.04) 35%, transparent 65%)',
                }}
              />

              {/* World map network SVG */}
              <svg
                className="absolute inset-0 w-full h-full animate-fade-in-up delay-300"
                viewBox="0 0 600 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ opacity: 0.35 }}
              >
                {/* Network nodes (dots suggesting continents) */}
                {/* North America */}
                <circle cx="120" cy="140" r="2.5" fill="#60A5FA" opacity="0.4" />
                <circle cx="145" cy="155" r="2" fill="#60A5FA" opacity="0.3" />
                <circle cx="100" cy="170" r="2" fill="#60A5FA" opacity="0.35" />
                <circle cx="160" cy="180" r="1.5" fill="#60A5FA" opacity="0.3" />
                <circle cx="130" cy="195" r="2" fill="#60A5FA" opacity="0.25" />

                {/* Europe */}
                <circle cx="310" cy="120" r="2.5" fill="#60A5FA" opacity="0.4" />
                <circle cx="330" cy="135" r="2" fill="#60A5FA" opacity="0.35" />
                <circle cx="295" cy="145" r="1.5" fill="#60A5FA" opacity="0.3" />
                <circle cx="350" cy="150" r="2" fill="#60A5FA" opacity="0.3" />

                {/* Asia */}
                <circle cx="420" cy="140" r="2.5" fill="#60A5FA" opacity="0.4" />
                <circle cx="460" cy="160" r="2" fill="#60A5FA" opacity="0.35" />
                <circle cx="490" cy="175" r="2.5" fill="#60A5FA" opacity="0.3" />
                <circle cx="510" cy="200" r="1.5" fill="#60A5FA" opacity="0.25" />
                <circle cx="440" cy="185" r="2" fill="#60A5FA" opacity="0.3" />

                {/* South America */}
                <circle cx="180" cy="310" r="2.5" fill="#60A5FA" opacity="0.35" />
                <circle cx="195" cy="340" r="2" fill="#60A5FA" opacity="0.3" />
                <circle cx="170" cy="360" r="1.5" fill="#60A5FA" opacity="0.25" />

                {/* Africa */}
                <circle cx="320" cy="250" r="2.5" fill="#60A5FA" opacity="0.35" />
                <circle cx="340" cy="280" r="2" fill="#60A5FA" opacity="0.3" />
                <circle cx="310" cy="310" r="1.5" fill="#60A5FA" opacity="0.25" />

                {/* Australia */}
                <circle cx="500" cy="350" r="2" fill="#60A5FA" opacity="0.3" />
                <circle cx="520" cy="340" r="1.5" fill="#60A5FA" opacity="0.25" />

                {/* Connection lines */}
                <line x1="120" y1="140" x2="310" y2="120" stroke="#60A5FA" strokeWidth="0.5" opacity="0.12" />
                <line x1="310" y1="120" x2="420" y2="140" stroke="#60A5FA" strokeWidth="0.5" opacity="0.12" />
                <line x1="145" y1="155" x2="330" y2="135" stroke="#60A5FA" strokeWidth="0.4" opacity="0.08" />
                <line x1="420" y1="140" x2="490" y2="175" stroke="#60A5FA" strokeWidth="0.5" opacity="0.1" />
                <line x1="310" y1="120" x2="320" y2="250" stroke="#60A5FA" strokeWidth="0.4" opacity="0.08" />
                <line x1="320" y1="250" x2="180" y2="310" stroke="#60A5FA" strokeWidth="0.4" opacity="0.08" />
                <line x1="460" y1="160" x2="500" y2="350" stroke="#60A5FA" strokeWidth="0.4" opacity="0.08" />
                <line x1="120" y1="140" x2="180" y2="310" stroke="#60A5FA" strokeWidth="0.4" opacity="0.08" />
                <line x1="350" y1="150" x2="440" y2="185" stroke="#60A5FA" strokeWidth="0.4" opacity="0.1" />
                <line x1="340" y1="280" x2="500" y2="350" stroke="#60A5FA" strokeWidth="0.4" opacity="0.06" />
                <line x1="295" y1="145" x2="310" y2="250" stroke="#60A5FA" strokeWidth="0.3" opacity="0.06" />
              </svg>

              {/* Robot mascot SVG */}
              <svg
                className="relative z-10 w-48 h-64 sm:w-56 sm:h-72 lg:w-72 lg:h-96 animate-fade-in-up delay-400"
                viewBox="0 0 300 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Antenna */}
                <line x1="150" y1="60" x2="150" y2="30" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
                <circle cx="150" cy="24" r="8" fill="#1E293B" stroke="#60A5FA" strokeWidth="2" />
                <circle cx="150" cy="24" r="4" fill="#60A5FA" className="animate-pulse-glow" />

                {/* Head */}
                <rect x="75" y="60" width="150" height="120" rx="40" fill="#1E293B" stroke="#334155" strokeWidth="2" />
                {/* Head highlight */}
                <rect x="85" y="68" width="130" height="50" rx="25" fill="#334155" opacity="0.3" />

                {/* Left eye */}
                <circle cx="120" cy="120" r="18" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                <circle cx="120" cy="120" r="12" fill="#60A5FA" opacity="0.3" />
                <circle cx="120" cy="120" r="8" fill="#60A5FA" className="animate-pulse-glow" />
                <circle cx="116" cy="116" r="3" fill="#ffffff" opacity="0.6" />

                {/* Right eye */}
                <circle cx="180" cy="120" r="18" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                <circle cx="180" cy="120" r="12" fill="#38BDF8" opacity="0.3" />
                <circle cx="180" cy="120" r="8" fill="#38BDF8" className="animate-pulse-glow" />
                <circle cx="176" cy="116" r="3" fill="#ffffff" opacity="0.6" />

                {/* Smile */}
                <path d="M125 150 Q150 168 175 150" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />

                {/* Ear accents */}
                <rect x="65" y="100" width="12" height="30" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
                <rect x="223" y="100" width="12" height="30" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

                {/* Neck */}
                <rect x="130" y="180" width="40" height="20" rx="5" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
                {/* Neck detail lines */}
                <line x1="138" y1="185" x2="162" y2="185" stroke="#334155" strokeWidth="1" opacity="0.5" />
                <line x1="138" y1="192" x2="162" y2="192" stroke="#334155" strokeWidth="1" opacity="0.5" />

                {/* Body */}
                <path
                  d="M85 200 L215 200 Q230 200 230 215 L230 310 Q230 330 210 330 L90 330 Q70 330 70 310 L70 215 Q70 200 85 200Z"
                  fill="#1E293B"
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Chest plate */}
                <rect x="110" y="220" width="80" height="50" rx="12" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />

                {/* Chest reactor / core */}
                <circle cx="150" cy="245" r="15" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />
                <circle cx="150" cy="245" r="9" fill="#60A5FA" opacity="0.15" />
                <circle cx="150" cy="245" r="5" fill="#60A5FA" className="animate-pulse-glow" />

                {/* Body detail lines */}
                <line x1="95" y1="285" x2="205" y2="285" stroke="#334155" strokeWidth="1" opacity="0.4" />
                <line x1="95" y1="295" x2="205" y2="295" stroke="#334155" strokeWidth="1" opacity="0.3" />
                <line x1="95" y1="305" x2="205" y2="305" stroke="#334155" strokeWidth="1" opacity="0.2" />

                {/* Left shoulder */}
                <rect x="45" y="210" width="28" height="45" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
                <circle cx="59" cy="230" r="4" fill="#60A5FA" opacity="0.3" />

                {/* Right shoulder */}
                <rect x="227" y="210" width="28" height="45" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
                <circle cx="241" cy="230" r="4" fill="#38BDF8" opacity="0.3" />

                {/* Eye glow effect (soft) */}
                <circle cx="120" cy="120" r="22" fill="#60A5FA" opacity="0.06" className="animate-pulse-glow" />
                <circle cx="180" cy="120" r="22" fill="#38BDF8" opacity="0.06" className="animate-pulse-glow" />
              </svg>

              {/* Floating conversation bubbles */}
              {/* Top-right: User bubble */}
              <div
                className="absolute top-4 right-0 lg:top-8 lg:-right-4 animate-float float-delay-0 hidden sm:block"
                style={{ animationDuration: '4s' }}
              >
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl px-4 py-2.5 text-sm text-slate-200 max-w-[220px] backdrop-blur-sm">
                  Can you explain machine learning simply?
                </div>
              </div>

              {/* Middle-right: AI bubble */}
              <div
                className="absolute top-1/3 -right-6 lg:top-1/3 lg:-right-10 animate-float float-delay-1 hidden md:block"
                style={{ animationDuration: '4.5s' }}
              >
                <div className="bg-white/5 border border-slate-600/30 rounded-2xl px-4 py-2.5 text-sm text-slate-300 max-w-[250px] backdrop-blur-sm">
                  Machine learning helps computers learn patterns from data.
                </div>
              </div>

              {/* Bottom-left: User bubble */}
              <div
                className="absolute bottom-16 -left-4 lg:bottom-20 lg:-left-8 animate-float float-delay-2 hidden sm:block"
                style={{ animationDuration: '5s' }}
              >
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl px-4 py-2.5 text-sm text-slate-200 max-w-[220px] backdrop-blur-sm">
                  Help me write a Python program.
                </div>
              </div>

              {/* Left-center: AI bubble */}
              <div
                className="absolute top-1/2 -left-8 lg:top-[45%] lg:-left-14 animate-float float-delay-3 hidden lg:block"
                style={{ animationDuration: '4.2s' }}
              >
                <div className="bg-white/5 border border-slate-600/30 rounded-2xl px-4 py-2.5 text-sm text-slate-300 max-w-[240px] backdrop-blur-sm">
                  Of course! Let&apos;s build it step by step.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export { HeroSection };
export default HeroSection;
