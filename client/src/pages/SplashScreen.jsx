import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Code2, ArrowRight } from 'lucide-react';

export default function SplashScreen() {
  const { setCurrentScreen } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 4;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(214,3,3,0.08),transparent_70%)] pointer-events-none" />

      {/* Floating Decorative Rings */}
      <div className="absolute top-12 left-12 w-64 h-64 border border-[#A30B1A]/20 rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-96 h-96 border border-[#C23D31]/20 rounded-full animate-pulse pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* Logo Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-[#D60303] p-1 shadow-xl flex items-center justify-center border border-[#A30B1A]">
            <div className="w-full h-full bg-[#EFEEEA] rounded-[12px] flex items-center justify-center">
              <Code2 className="w-12 h-12 text-[#D60303]" />
            </div>
          </div>
          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-[#A30B1A] text-[#EFEEEA] text-[10px] font-mono font-bold tracking-widest uppercase shadow-sm">
            2026
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-[#595959]">
            TECH<span className="text-[#D60303]">NOVA</span>
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-[#A30B1A] tracking-wider">
            <span>DECODE</span>
            <span className="text-[#C23D31]">•</span>
            <span>DEBUG</span>
            <span className="text-[#C23D31]">•</span>
            <span>DISCOVER</span>
          </div>
          <p className="text-xs text-[#595959] font-medium max-w-xs mx-auto">
            Technical Symposium Competition Management System
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="space-y-2 max-w-xs mx-auto">
          <div className="h-2 w-full bg-[#595959]/20 rounded-full overflow-hidden p-[1px] border border-[#595959]/30">
            <div 
              className="h-full bg-gradient-to-r from-[#D60303] via-[#C23D31] to-[#A30B1A] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#595959]">
            <span className="font-semibold">INITIALIZING SYSTEM...</span>
            <span className="text-[#D60303] font-bold">{progress}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={() => setCurrentScreen('landing')}
            className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Enter Symposium</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full py-2.5 rounded-xl bg-transparent hover:bg-[#595959]/10 border border-[#595959] text-[#595959] font-bold text-xs transition cursor-pointer"
          >
            Direct Participant / Admin Login
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center text-[11px] text-[#595959] font-mono font-semibold">
        SYSTEM SECURED • REAL-TIME AUDIT LOGGING • VERIFIED PROTOCOLS
      </div>
    </div>
  );
}
