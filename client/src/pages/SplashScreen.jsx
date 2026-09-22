import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Code2, ArrowRight, ShieldCheck, Activity, Terminal, Play, Sparkles } from 'lucide-react';

export default function SplashScreen() {
  const { setCurrentScreen, leaderboard, eventState } = useApp();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [typedLines, setTypedLines] = useState(0);
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

  // Infinite Dense Matrix Code Snippets matching user reference photo
  const matrixCodeColumns = [
    [
      { text: "function(){try{this.each(function(){node.type=a===b?1:0;})}}catch(e){}", kw: "function", fn: "each", type: "pink" },
      { text: "var r,i,o,a,s; for(i=0; i<n.length; i++){ return e?a:b; }", kw: "var", fn: "for", type: "cyan" },
      { text: "textarea.value = attr,e,t,arguments; nodeType === 1;", kw: "attr", fn: "value", type: "amber" },
      { text: "std::vector<Participant> leaders = competition.getTopQualifiers(30);", kw: "vector", fn: "getTopQualifiers", type: "pink" },
      { text: "const PIN = coordinator.generateSecurityToken(); socket.emit('VERIFIED');", kw: "const", fn: "emit", type: "cyan" },
      { text: "if(target.matches('.btn')){ executeQuizEngine({ duration: 1200 }); }", kw: "if", fn: "matches", type: "pink" }
    ],
    [
      { text: "for(let j=0; j<array.length; j++){ if(r[j] == null) continue; }", kw: "for", fn: "continue", type: "cyan" },
      { text: "return function(e,t){ return new b.fn.init(e,t); }", kw: "return", fn: "init", type: "pink" },
      { text: "while(stack.length > 0){ const item = stack.pop(); audit(item); }", kw: "while", fn: "pop", type: "amber" },
      { text: "await bcrypt.compare(password, user.passwordHash); jwt.sign(token);", kw: "await", fn: "compare", type: "pink" },
      { text: "const { leaderboard, eventState } = useApp(); setProgress(100);", kw: "const", fn: "useApp", type: "cyan" }
    ],
    [
      { text: "each(function(index, el){ return el.getAttribute('data-id'); });", kw: "each", fn: "getAttribute", type: "pink" },
      { text: "try { window.telemetry.track('TAB_SWITCH', { warnings: count }); }", kw: "try", fn: "track", type: "amber" },
      { text: "export default function SplashScreen() { const [progress, setProgress] = useState(0); }", kw: "export", fn: "useState", type: "cyan" },
      { text: "KRCT_SYMPOSIUM_2026 // FESTRONIX CSE DEPARTMENT EVENT TECHNOVA", kw: "SYMPOSIUM", fn: "EVENT", type: "pink" }
    ]
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

  // Sync typed code lines with progress percentage
  useEffect(() => {
    const calculated = Math.min(fullCodeLines.length, Math.floor((progress / 100) * fullCodeLines.length) + 2);
    setTypedLines(calculated);
  }, [progress]);

  const totalRegistered = eventState?.registrationCount ?? leaderboard?.length ?? 0;
  const round1Qualifiers = eventState?.round1QualifyCount ?? 30;

  return (
    <div className="min-h-screen bg-zinc-950 text-[#EFEEEA] flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-y-auto overflow-x-hidden font-sans">

      {/* 0. BACKGROUND AMBIENT VIDEO LAYER (plays /BG.mp4) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0 mix-blend-screen transition-opacity duration-1000"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      >
        <source src="/BG.mp4" type="video/mp4" />
        <source src="/bg_video.mp4" type="video/mp4" />
      </video>

      {/* 1. INFINITE HORIZONTAL MATRIX CODE STREAM (LEFT-TO-RIGHT & RIGHT-TO-LEFT RANDOMLY) */}
      <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden flex flex-col justify-around py-4 select-none z-0">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((rowIdx) => {
          const rowData = matrixCodeColumns[rowIdx % matrixCodeColumns.length];
          const isLeftToRight = rowIdx % 2 === 0;
          const animClass = isLeftToRight
            ? (rowIdx % 4 === 0 ? 'animate-code-ltr' : 'animate-code-ltr-slow')
            : (rowIdx % 4 === 1 ? 'animate-code-rtl' : 'animate-code-rtl-slow');

          return (
            <div
              key={rowIdx}
              className={`flex items-center gap-8 font-mono text-xs sm:text-sm whitespace-nowrap w-[200%] ${animClass}`}
              style={{ animationDelay: `${rowIdx * -3.5}s` }}
            >
              {/* Duplicate array 3 times for seamless continuous horizontal loop */}
              {[...rowData, ...rowData, ...rowData, ...rowData].map((snippet, idx) => (
                <div key={idx} className="flex items-center gap-3 shrink-0 tracking-tight">
                  <span className="text-pink-500 font-bold">{snippet.kw}</span>
                  <span className="text-zinc-100">{snippet.text}</span>
                  <span className="text-teal-400 font-mono">// {snippet.fn}</span>
                  <span className="text-zinc-600 font-bold">•</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 2. GIANT BOLD "CSE" CENTERPIECE EMBLEM (MATCHING REFERENCE IMAGE EXACTLY) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none opacity-20">
        <h1
          className="text-[180px] sm:text-[320px] md:text-[420px] font-black tracking-tighter text-white uppercase drop-shadow-[0_10px_35px_rgba(220,38,38,0.3)] font-mono leading-none"
          style={{
            WebkitTextStroke: '6px rgba(255, 255, 255, 0.9)',
            letterSpacing: '-0.05em'
          }}
        >
          CSE
        </h1>
      </div>

      {/* Dark Backdrop Radial Vignette to maintain contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(24,24,27,0.75)_0%,rgba(9,9,11,0.92)_100%)] pointer-events-none z-0" />

      {/* Technical Corner Crosshairs */}
      <div className="absolute top-4 left-6 text-[10px] font-mono text-zinc-400 font-medium hidden sm:flex items-center gap-2 z-10">
        <span className="text-red-500 font-bold">+</span>
        <span>KRCT_SYMPOSIUM // 2026</span>
      </div>
      <div className="absolute top-4 right-6 text-[10px] font-mono text-zinc-400 font-medium hidden sm:flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>SYS_VERIFIED</span>
      </div>

      {/* 3. MAIN CONTENT CONTAINER (EXISTING SANDBOX UI INTACT) */}
      <div className="w-full max-w-4xl my-auto py-2 relative z-10 flex flex-col items-center text-center space-y-6 animate-hero-entrance">

        {/* SECTION 1: OFFICIAL COLLEGE BRANDING */}
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl border border-zinc-200/80 shadow-2xs flex items-center justify-center transition-all duration-300 hover:border-zinc-300 card-hover-lift">
            <img
              src="/college.png"
              alt="K. Ramakrishnan College of Technology Logo"
              className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <span className="text-[10px] font-mono font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#DC2626]" />
            <span>Department of CSE • National Level Technical Symposium</span>
          </span>
        </div>

        {/* SECTION 2: BRAND TITLE & TAGLINE */}
        <div className="space-y-1.5 text-center">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest block">
            FESTRONIX 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none drop-shadow-md">
            TECH<span className="text-[#DC2626]">NOVA</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium max-w-md mx-auto">
            Code the Ideas • Build the Tomorrow
          </p>
        </div>

        {/* SECTION 3: REAL-TIME COMPILER SANDBOX IDE CARD */}
        <div className="w-full max-w-2xl bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-700/80 shadow-2xl overflow-hidden text-left font-mono card-hover-lift">

          {/* Window Titlebar Controls & Tabs */}
          <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />

              <div className="ml-3 flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 text-xs text-zinc-200 border border-zinc-800 font-sans">
                <Code2 className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="font-semibold text-[11px]">{activeTab}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
              <span className="hidden sm:inline-flex items-center gap-1">
                <Terminal className="w-3 h-3 text-red-500" /> C++20 Standard
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> RUNNING
              </span>
            </div>
          </div>

          {/* IDE Editor Text Area */}
          <div className="p-4 sm:p-5 text-xs sm:text-sm leading-relaxed overflow-x-auto max-h-52 sm:max-h-60 scrollbar-thin scrollbar-thumb-zinc-700 bg-[#09090b]">
            {fullCodeLines.slice(0, typedLines).map((line) => (
              <div key={line.num} className="flex items-center gap-4 hover:bg-zinc-800/40 px-1.5 rounded transition-colors group">
                <span className="w-6 text-right text-zinc-600 text-[11px] select-none shrink-0 font-mono group-hover:text-zinc-400">
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
          <div className="bg-zinc-950 px-4 py-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>COMPILING KERNEL...</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">LN {typedLines}, COL 34</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">{progress}%</span>
              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PRIMARY ACTION BUTTONS */}
        <div className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={() => setCurrentScreen('landing')}
            className="w-full sm:w-1/2 py-3 px-5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs shadow-lg shadow-red-950/20 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer btn-interactive focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <span>ENTER PORTAL</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="w-full sm:w-1/2 py-3 px-5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs shadow-2xs transition-all duration-200 cursor-pointer btn-interactive focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            SIGN IN LOGIN
          </button>
        </div>

        {/* SECTION 5: EVENT STATS FOOTER BAR */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-2">
          <div className="bg-zinc-900/90 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 text-center shadow-2xs card-hover-lift">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase font-medium">REGISTERED</span>
            <span className="text-xs font-bold text-white font-mono">{totalRegistered}</span>
          </div>
          <div className="bg-zinc-900/90 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 text-center shadow-2xs card-hover-lift">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase font-medium">PIPELINE</span>
            <span className="text-xs font-bold text-[#DC2626] font-mono">3 ROUNDS</span>
          </div>
          <div className="bg-zinc-900/90 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 text-center shadow-2xs card-hover-lift">
            <span className="block text-[10px] font-mono text-zinc-400 uppercase font-medium">QUALIFIERS</span>
            <span className="text-xs font-bold text-white font-mono">TOP {round1Qualifiers}</span>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-4xl pt-3 border-t border-zinc-800/80 text-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AUTHENTICATED PROTOCOLS</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>REAL-TIME COMPILER ENGINE</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
