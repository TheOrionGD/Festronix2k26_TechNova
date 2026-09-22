import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Code2, ArrowRight, ShieldCheck, Activity, CheckCircle2, Server } from 'lucide-react';

export default function SplashScreen() {
  const { setCurrentScreen, leaderboard, eventState } = useApp();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return prev + 5;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  const totalRegistered = eventState?.registrationCount || leaderboard?.length || 0;
  const round1Qualifiers = eventState?.round1QualifyCount || 30;

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#18181B] flex flex-col items-center justify-between p-6 sm:p-8 relative overflow-hidden select-none font-sans">
      {/* Quiet Technical Grid Background */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.05),transparent_70%)] pointer-events-none" />

      {/* Precise Thin Geometric Decorative Circles */}
      <svg className="absolute -top-32 -left-32 w-[520px] h-[520px] text-red-600/15 pointer-events-none" viewBox="0 0 520 520" fill="none">
        <circle cx="260" cy="260" r="259" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="260" cy="260" r="210" stroke="currentColor" strokeWidth="0.75" />
      </svg>
      <svg className="absolute -bottom-36 -right-36 w-[640px] h-[640px] text-zinc-900/10 pointer-events-none" viewBox="0 0 640 640" fill="none">
        <circle cx="320" cy="320" r="319" stroke="currentColor" strokeWidth="1" />
        <circle cx="320" cy="320" r="260" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 6" />
      </svg>

      {/* Technical Corner Crosshairs */}
      <div className="absolute top-6 left-6 text-[10px] font-mono text-zinc-400 font-medium hidden sm:flex items-center gap-2">
        <span className="text-red-600 font-bold">+</span>
        <span>KRCT_SYMPOSIUM // 2026</span>
      </div>
      <div className="absolute top-6 right-6 text-[10px] font-mono text-zinc-400 font-medium hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>SYS_VERIFIED</span>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-xl my-auto py-4 relative z-10 flex flex-col items-center text-center space-y-8">
        
        {/* SECTION 1: OFFICIAL COLLEGE BRANDING */}
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-zinc-200/80 shadow-sm flex items-center justify-center transition-all duration-300 hover:border-zinc-300">
            <img 
              src="/college.png" 
              alt="K. Ramakrishnan College of Technology Logo" 
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <span className="text-[10px] font-mono font-semibold text-zinc-500 tracking-wider uppercase">
            Official Competition Management Platform
          </span>
        </div>

        {/* SECTION 2 & 3: TECHNOVA ICON & BRANDING */}
        <div className="space-y-6 w-full flex flex-col items-center">
          
          {/* Refined Rounded-Square Technical Code Icon */}
          <div className="relative inline-block group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-red-500/30 p-1 shadow-lg shadow-red-950/5 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:border-red-500/50">
              <div className="w-full h-full bg-gradient-to-b from-white to-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                <Code2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#DC2626] transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <span className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-[#B91C1C] text-white text-[10px] font-mono font-bold tracking-widest uppercase shadow-md border border-red-800">
              2026
            </span>
          </div>

          {/* Typography Hierarchy */}
          <div className="space-y-2.5 text-center">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-none">
              TECH<span className="text-[#DC2626]">NOVA</span>
            </h1>
            
            <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-red-700 tracking-[0.25em] uppercase font-mono">
              <span>DECODE</span>
              <span className="text-zinc-400 font-normal">•</span>
              <span>DEBUG</span>
              <span className="text-zinc-400 font-normal">•</span>
              <span>DISCOVER</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-500 font-normal max-w-md mx-auto pt-1 leading-relaxed">
              Technical Symposium Competition Management System
            </p>
          </div>
        </div>

        {/* SECTION 4: POLISHED SYSTEM-STATUS & LOADING COMPONENT */}
        <div className="w-full max-w-sm space-y-3 pt-1">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-zinc-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 font-semibold">
              <span className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-red-600" />
                <span>SYSTEM INITIALIZATION</span>
              </span>
              <span className="text-red-600 font-bold">{progress}%</span>
            </div>

            {/* Clean Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden p-[1px] border border-zinc-200">
              <div 
                className="h-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-full transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* System Status Indicators */}
            <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-100">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                <span className="font-bold text-zinc-700">{isReady ? 'SYSTEM READY' : 'LOADING PROTOCOLS'}</span>
              </div>
              <span className="text-zinc-400">v2.6.0</span>
            </div>
          </div>
        </div>

        {/* SECTION 5: PRIMARY ACTIONS */}
        <div className="w-full max-w-xs sm:max-w-sm space-y-3 pt-2">
          <button
            onClick={() => setCurrentScreen('landing')}
            className="w-full py-3.5 px-6 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-900/10 transition-all duration-200 flex items-center justify-center gap-2.5 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span>ENTER SYMPOSIUM</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full py-3 px-6 rounded-xl bg-white/90 hover:bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-800 font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
          >
            PARTICIPANT / ADMIN LOGIN
          </button>
        </div>

        {/* SECTION 6: EVENT REAL-TIME DATA STATS STRIP */}
        <div className="pt-2 w-full max-w-sm grid grid-cols-3 gap-2">
          <div className="bg-white/60 p-2.5 rounded-lg border border-zinc-200/60 text-center">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase font-medium">REGISTERED</span>
            <span className="text-xs font-bold text-zinc-800 font-mono">{totalRegistered}</span>
          </div>
          <div className="bg-white/60 p-2.5 rounded-lg border border-zinc-200/60 text-center">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase font-medium">ROUNDS</span>
            <span className="text-xs font-bold text-red-600 font-mono">3 STAGES</span>
          </div>
          <div className="bg-white/60 p-2.5 rounded-lg border border-zinc-200/60 text-center">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase font-medium">QUALIFIERS</span>
            <span className="text-xs font-bold text-zinc-800 font-mono">TOP {round1Qualifiers}</span>
          </div>
        </div>

      </div>

      {/* SECTION 7: BOTTOM TECHNICAL STATUS STRIP */}
      <footer className="w-full max-w-4xl pt-4 border-t border-zinc-200/80 text-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>SYSTEM SECURED</span>
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-red-600" />
            <span>REAL-TIME AUDIT</span>
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
            <span>VERIFIED PROTOCOLS</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
