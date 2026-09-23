import React, { useEffect, useState } from 'react';
import { useApp } from '../context/useApp';
import { Code2, ArrowRight, ShieldCheck, Activity, Terminal, Play, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const { setCurrentScreen, leaderboard, eventState } = useApp();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [activeTab] = useState('welcome_technova.cpp');

  const fullCodeLines = [
    { num: 1, tokens: [{ text: '// FESTRONIX 2026 — TECHNOVA PORTAL INITIALIZATION', color: 'text-zinc-500' }] },
    { num: 2, tokens: [{ text: '#include', color: 'text-[#DC2626] font-bold' }, { text: ' <technova/welcome.h>', color: 'text-amber-400' }] },
    { num: 3, tokens: [{ text: 'using namespace', color: 'text-[#DC2626] font-bold' }, { text: ' festronix::cse;', color: 'text-zinc-200' }] },
    { num: 4, tokens: [{ text: '', color: '' }] },
    { num: 5, tokens: [{ text: 'template', color: 'text-[#DC2626]' }, { text: '<typename Participant>', color: 'text-zinc-400' }] },
    { num: 6, tokens: [{ text: 'class', color: 'text-[#DC2626] font-bold' }, { text: ' WelcomeProtocol {', color: 'text-white' }] },
    { num: 7, tokens: [{ text: 'public:', color: 'text-rose-400' }] },
    { num: 8, tokens: [{ text: '  auto', color: 'text-[#DC2626]' }, { text: ' openSymposiumPortal(', color: 'text-amber-300' }, { text: 'Participant', color: 'text-rose-300' }, { text: '& p) {', color: 'text-white' }] },
    { num: 9, tokens: [{ text: '    // Welcoming first-time participant to FESTRONIX 2026', color: 'text-zinc-500' }] },
    { num: 10, tokens: [{ text: '    std::cout << ', color: 'text-zinc-200' }, { text: '"Welcome to TECHNOVA 2026!\\n"', color: 'text-rose-400' }, { text: ';', color: 'text-zinc-400' }] },
    { num: 11, tokens: [{ text: '    if', color: 'text-[#DC2626] font-bold' }, { text: ' (p.isFirstTimeVisitor()) {', color: 'text-white' }] },
    { num: 12, tokens: [{ text: '      p.loadEventOverview();', color: 'text-amber-300' }] },
    { num: 13, tokens: [{ text: '      p.grantPortalAccess();', color: 'text-amber-300' }] },
    { num: 14, tokens: [{ text: '    }', color: 'text-white' }] },
    { num: 15, tokens: [{ text: '    return', color: 'text-[#DC2626] font-bold' }, { text: ' Status::READY_FOR_COMPETITION;', color: 'text-emerald-400 font-bold' }] },
    { num: 16, tokens: [{ text: '  }', color: 'text-white' }] },
    { num: 17, tokens: [{ text: '};', color: 'text-white' }] }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return prev + 4;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

  const typedLines = Math.min(fullCodeLines.length, Math.floor((progress / 100) * fullCodeLines.length) + 2);

  const totalRegistered = eventState?.registrationCount ?? leaderboard?.length ?? 0;
  const round1Qualifiers = eventState?.round1QualifyCount ?? 30;

  return (
    <div className="min-h-screen bg-transparent text-[#18181B] dark:text-[#f4f4f5] flex flex-col items-center justify-between p-4 sm:p-8 relative font-sans transition-colors duration-300 w-full min-w-0">

      {/* GIANT BOLD "CSE" CENTERPIECE EMBLEM */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 select-none opacity-15">
        <h1
          className="text-[180px] sm:text-[320px] md:text-[420px] font-black tracking-tighter text-zinc-900 dark:text-white uppercase drop-shadow-[0_10px_35px_rgba(220,38,38,0.3)] font-mono leading-none"
          style={{
            WebkitTextStroke: '6px rgba(255, 255, 255, 0.4)',
            letterSpacing: '-0.05em'
          }}
        >
          CSE
        </h1>
      </div>

      {/* Technical Corner Crosshairs */}
      <div className="absolute top-4 left-6 text-[10px] font-mono text-zinc-400 font-medium hidden sm:flex items-center gap-2 z-10">
        <span className="text-red-500 font-bold">+</span>
        <span>KRCT_SYMPOSIUM // 2026</span>
      </div>
      <div className="absolute top-4 right-6 text-[10px] font-mono text-zinc-400 font-medium hidden sm:flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>SYS_VERIFIED</span>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (MATCHING USER'S EXACT UI CARD SPECIFICATION) */}
      <div className="w-full max-w-3xl my-auto p-6 sm:p-10 relative z-10 flex flex-col items-center text-center space-y-6 animate-hero-entrance tech-container glass-card border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-2xl bg-white/70 dark:bg-[#0a0a0d]/90 backdrop-blur-xl">

        {/* STATUS PILL BADGE */}
        <div className="status-pill-ready">
          <span className={`dot ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="flex items-center gap-1.5">
            {isReady && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            <span>{isReady ? 'SYSTEM READY' : 'INITIALIZING CORE'}</span>
          </span>
        </div>

        {/* BRAND TITLE & DESCRIPTIVE MODULE SUBTITLE */}
        <div className="space-y-2 max-w-xl text-center">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white uppercase font-sans sm:font-mono drop-shadow-sm flex items-center justify-center gap-2">
            {isReady && <Sparkles className="w-8 h-8 text-[#D60303] animate-pulse hidden sm:inline-block" />}
            <span>TECHNOVA COMPETITION PORTAL</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-md mx-auto">
            Server authentication & participant access module. Enter your assigned User ID and Password to launch your workstation.
          </p>
        </div>


        {/* REAL-TIME COMPILER SANDBOX IDE CARD */}
        <div className="w-full max-w-2xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border-2 border-red-500/60 shadow-xl overflow-hidden text-left font-mono card-hover-lift">

          {/* Window Titlebar Controls & Tabs */}
          <div className="bg-white/40 dark:bg-zinc-900/50 backdrop-blur-md px-4 py-2.5 border-b border-red-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />

              <div className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DC2626] text-xs text-white border border-red-400 font-sans shadow-xs">
                <Code2 className="w-3.5 h-3.5 text-white" />
                <span className="font-semibold text-[11px]">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="hidden sm:inline-flex items-center gap-1">
                <Terminal className="w-3 h-3 text-red-500" /> C++20 Standard
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> RUNNING
              </span>
            </div>
          </div>

          {/* IDE Editor Text Area */}
          <div className="p-4 sm:p-5 text-xs sm:text-sm leading-relaxed overflow-x-auto max-h-52 sm:max-h-60 scrollbar-thin scrollbar-thumb-zinc-700 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-zinc-900 dark:text-white border-t border-b border-red-500/40">
            {fullCodeLines.slice(0, typedLines).map((line) => (
              <div key={line.num} className="flex items-center gap-4 hover:bg-zinc-500/10 px-1.5 rounded transition-colors group">
                <span className="w-6 text-right text-zinc-400 dark:text-zinc-600 text-[11px] select-none shrink-0 font-mono group-hover:text-zinc-700 dark:group-hover:text-zinc-400">
                  {line.num}
                </span>
                <div className="font-mono whitespace-pre">
                  {line.tokens.map((token, idx) => (
                    <span key={idx} className={token.color}>{token.text}</span>
                  ))}
                  {line.num === typedLines && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#DC2626] animate-pulse align-middle" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Editor Status Bar */}
          <div className="bg-white/40 dark:bg-zinc-900/50 backdrop-blur-md px-4 py-2 border-t border-red-500/50 flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>COMPILING KERNEL...</span>
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">|</span>
              <span className="text-zinc-600 dark:text-zinc-400">LN {typedLines}, COL 34</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">{progress}%</span>
              <div className="w-24 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full sm:w-1/2 py-3 px-6 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white font-bold text-xs border border-red-500/80 shadow-[0_0_20px_rgba(214,3,3,0.4)] hover:shadow-[0_0_28px_rgba(214,3,3,0.65)] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer btn-interactive"
          >
            <span>ENTER PORTAL</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => setCurrentScreen('landing')}
            className="w-full sm:w-1/2 py-3 px-6 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white font-bold text-xs border border-red-500/80 shadow-[0_0_20px_rgba(214,3,3,0.4)] hover:shadow-[0_0_28px_rgba(214,3,3,0.65)] transition-all duration-200 cursor-pointer btn-interactive"
          >
            EXPLORE SYMPOSIUM
          </button>
        </div>

        {/* EVENT STATS FOOTER BAR */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-2">
          <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md p-2.5 rounded-xl border border-red-500/60 text-center shadow-2xs card-hover-lift">
            <span className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-medium">REGISTERED</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">{totalRegistered}</span>
          </div>
          <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md p-2.5 rounded-xl border border-red-500/60 text-center shadow-2xs card-hover-lift">
            <span className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-medium">PIPELINE</span>
            <span className="text-xs font-bold text-[#DC2626] font-mono">3 ROUNDS</span>
          </div>
          <div className="bg-white/50 dark:bg-zinc-900/40 backdrop-blur-md p-2.5 rounded-xl border border-red-500/60 text-center shadow-2xs card-hover-lift">
            <span className="block text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-medium">QUALIFIERS</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">TOP {round1Qualifiers}</span>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-4xl pt-3 border-t border-red-500/50 text-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AUTHENTICATED PROTOCOLS</span>
          </span>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>REAL-TIME COMPILER ENGINE</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
