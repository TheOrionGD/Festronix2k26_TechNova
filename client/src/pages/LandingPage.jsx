import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { useScrollReveal, useAnimatedCounter } from '../hooks/useMotion';
import {
  Code2,
  Brain,
  Terminal,
  Compass,
  Trophy,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  FileText,
  Award,
  ChevronDown,
  Lock,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  User,
  X,
  Play,
  Cpu,
  Activity,
  Layers,
  FileCode,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

export default function LandingPage() {
  const { setCurrentScreen, leaderboard, eventState, theme, toggleTheme } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll reveal references for major sections
  const [heroRef, heroVisible] = useScrollReveal({ threshold: 0.1 });
  const [posterRef, posterVisible] = useScrollReveal({ threshold: 0.1 });
  const [roundsRef, roundsVisible] = useScrollReveal({ threshold: 0.1 });
  const [rulesRef, rulesVisible] = useScrollReveal({ threshold: 0.1 });
  const [workflowRef, workflowVisible] = useScrollReveal({ threshold: 0.1 });
  const [leaderboardRef, leaderboardVisible] = useScrollReveal({ threshold: 0.1 });
  const [faqRef, faqVisible] = useScrollReveal({ threshold: 0.1 });

  // Animated counters for stats
  const totalRegisteredRaw = eventState?.registrationCount ?? leaderboard?.length ?? 0;
  const round1CountRaw = eventState?.round1QualifyCount ?? 30;
  const round2CountRaw = eventState?.round2QualifyCount ?? 10;

  const countRegistered = useAnimatedCounter(totalRegisteredRaw, 1200, heroVisible);
  const countRound1 = useAnimatedCounter(round1CountRaw, 1000, heroVisible);
  const countRound2 = useAnimatedCounter(round2CountRaw, 800, heroVisible);

  // Scroll listener for top navigation bar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape key for poster modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPosterModal) {
        setShowPosterModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPosterModal]);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "What is the team size for TECHNOVA 2026?",
      a: "Each team consists of 2 members. Both members must actively participate throughout all event rounds."
    },
    {
      q: "What happens if I accidentally refresh or close my browser during Round 1?",
      a: "Your attempt state and countdown timer are securely stored on the server. Re-opening the portal will resume your quiz seamlessly with the remaining time intact."
    },
    {
      q: "How does physical verification work in Round 2 (Debug It)?",
      a: "Once you successfully debug and run the problem locally in VS Code, request a physical lab coordinator. The coordinator will inspect your output and enter their secure PIN on your screen to award marks."
    },
    {
      q: "Are internet references or AI assistance tools allowed?",
      a: "No. Participants must use only local IDE tools and compiler documentation. The platform enforces real-time anti-cheat telemetry monitoring window focus changes and copy-paste events."
    },
    {
      q: "How are qualifiers selected for the next round?",
      a: "Qualification is purely merit-based determined by verified backend scores. The top 30 participants from Round 1 qualify for Round 2, and the top 10 from Round 2 advance to Round 3."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#18181B] dark:text-[#f4f4f5] flex flex-col font-sans selection:bg-[#D60303] selection:text-white relative transition-colors duration-300">
      {/* HEADER / NAVIGATION WITH THEME TOGGLE */}
      <nav className={`h-16 border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 shrink-0 select-none ${scrolled
        ? 'bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md shadow-md border-zinc-200/80 dark:border-zinc-800/80'
        : 'bg-white/40 dark:bg-zinc-900/30 backdrop-blur-sm border-zinc-200/40 dark:border-zinc-800/40'
        }`}>
        {/* Left: Branding */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentScreen('splash')}
        >
          <div className="bg-white/90 dark:bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-2.5 transition-all duration-200 group-hover:border-[#D60303]">
            <img src="/college.png" alt="KRCT Logo" className="h-6 sm:h-7 w-auto object-contain" />
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-[#D60303] p-0.5 flex items-center justify-center overflow-hidden">
                <img src="/technova_icon.jpg" alt="Technova Icon" className="w-full h-full object-cover rounded" />
              </div>
              <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white font-mono">
                TECH<span className="text-[#D60303]">NOVA</span>
              </span>
            </div>
          </div>
        </div>


        {/* Middle: Quick Jump Links */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
          <button onClick={() => scrollToSection('pipeline')} className="hover:text-[#D60303] transition cursor-pointer">
            PIPELINE
          </button>
          <button onClick={() => scrollToSection('rules')} className="hover:text-[#D60303] transition cursor-pointer">
            RULES
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-[#D60303] transition cursor-pointer">
            FAQ
          </button>
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* THEME CONVERSION TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 transition cursor-pointer btn-interactive flex items-center gap-1.5 text-xs font-mono font-bold shadow-xs"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline text-white">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-white">DARK MODE</span>
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentScreen('login')}
            className="px-3.5 py-1.5 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 font-mono text-xs font-bold transition cursor-pointer btn-interactive shadow-xs"
          >
            SIGN IN
          </button>
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-4 py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 font-mono font-bold text-xs shadow-md shadow-red-950/30 transition flex items-center gap-2 cursor-pointer btn-interactive"
          >
            <span>ENTER PORTAL</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header
        id="hero"
        ref={heroRef}
        className="relative z-10 pt-10 pb-8 px-4 max-w-6xl mx-auto text-center space-y-6"
      >
        {/* Top Technical Badge */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/30 border border-red-500/70 text-[#D60303] dark:text-red-400 font-mono text-xs font-semibold shadow-xs reveal-init ${heroVisible ? 'revealed' : ''}`}>
          <Sparkles className="w-3.5 h-3.5 text-[#D60303] dark:text-red-400 animate-pulse" />
          <span>FESTRONIX 2026 • DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</span>
        </div>

        {/* Hero Title Hierarchy */}
        <div className={`space-y-2 reveal-init stagger-delay-1 ${heroVisible ? 'revealed' : ''}`}>
          <p className="text-xs sm:text-sm font-mono tracking-widest text-zinc-500 dark:text-[#a1a1aa] uppercase font-semibold">
            FESTRONIX 2026
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-zinc-900 dark:text-white">
            TECH<span className="text-[#D60303]">NOVA</span>
          </h1>
          <p className="text-base sm:text-xl font-bold tracking-tight text-zinc-800 dark:text-[#f4f4f5] uppercase font-mono">
            Technical Competition Platform
          </p>
        </div>

        <div className={`space-y-1 text-xs sm:text-sm text-zinc-600 dark:text-[#a1a1aa] max-w-2xl mx-auto font-medium leading-relaxed reveal-init stagger-delay-2 ${heroVisible ? 'revealed' : ''}`}>
          <p className="text-zinc-900 dark:text-white font-semibold">Department of Computer Science and Engineering National Level Technical Symposium</p>
          <p className="text-[#D60303] dark:text-red-400 font-mono font-bold tracking-wider pt-1">"Code the Ideas / Build the Tomorrow"</p>
          <p className="text-xs text-zinc-500 dark:text-[#71717a] pt-1">An elite technical competition platform engineered for competitive programming, rapid debugging, and campus clue solving.</p>
        </div>

        {/* Action CTAs */}
        <div className={`flex flex-wrap items-center justify-center gap-3 pt-2 reveal-init stagger-delay-3 ${heroVisible ? 'revealed' : ''}`}>
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-6 py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 font-mono font-bold text-xs sm:text-sm shadow-lg shadow-red-950/30 transition flex items-center gap-2.5 cursor-pointer btn-interactive group"
          >
            <span>ENTER COMPETITION PORTAL</span>
            <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-6 py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 font-mono font-bold text-xs sm:text-sm shadow-lg shadow-red-950/30 transition flex items-center gap-2 cursor-pointer btn-interactive"
          >
            <span>SIGN IN</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* CODE EDITOR / TERMINAL PANEL */}
        <div className={`pt-6 max-w-4xl mx-auto reveal-init stagger-delay-4 ${heroVisible ? 'revealed' : ''}`}>
          <div className="bg-white/60 dark:bg-zinc-900/40 rounded-xl border-2 border-red-500/60 overflow-hidden shadow-2xl text-left font-mono backdrop-blur-xl">
            {/* Top Editor Window Bar */}
            <div className="bg-white/40 dark:bg-zinc-900/60 px-4 py-2.5 border-b border-red-500/50 flex items-center justify-between text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                  <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                </div>
                <span className="ml-2 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#D60303]" />
                  welcome_technova.cpp
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-zinc-500 dark:text-[#71717a]">
                <span>C++20 Standard</span>
                <span className="px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                  RUNNING
                </span>
              </div>
            </div>

            {/* Editor Body */}
            <div className="p-4 sm:p-5 text-xs text-zinc-900 dark:text-[#f4f4f5] leading-relaxed overflow-x-auto bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border-t border-b border-red-500/40">
              <div className="flex gap-4">
                <div className="text-zinc-400 dark:text-[#52525b] select-none text-right font-mono text-[11px] space-y-1">
                  <p>01</p><p>02</p><p>03</p><p>04</p><p>05</p><p>06</p><p>07</p><p>08</p>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <p><span className="text-[#ef4444]">#include</span> <span className="text-[#22c55e]">&lt;technova/symposium.hpp&gt;</span></p>
                  <p><span className="text-[#ef4444]">using namespace</span> <span className="text-zinc-800 dark:text-[#f4f4f5]">festronix2026;</span></p>
                  <p><span className="text-zinc-400 dark:text-[#a1a1aa]"></span></p>
                  <p><span className="text-[#60a5fa]">int</span> <span className="text-[#eab308]">main</span>() &#123;</p>
                  <p className="pl-4"><span className="text-zinc-600 dark:text-[#a1a1aa]">CompetitionEngine</span> engine(<span className="text-[#22c55e]">"TECHNOVA 2026"</span>);</p>
                  <p className="pl-4">engine.<span className="text-[#60a5fa]">verifyParticipantCredentials</span>();</p>
                  <p className="pl-4"><span className="text-[#ef4444]">return</span> engine.<span className="text-[#22c55e]">startCompetitionPipeline</span>();</p>
                  <p>&#125;</p>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-white/40 dark:bg-zinc-900/60 px-4 py-1.5 border-t border-red-500/50 flex items-center justify-between text-[10px] text-zinc-600 dark:text-[#71717a] backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="text-[#22c55e] font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3" /> COMPILING KERNEL...
                </span>
                <span>UTF-8</span>
              </div>
              <div className="flex items-center gap-3">
                <span>LN 08, COL 02</span>
                <span className="text-[#D60303] font-bold">100% READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* EVENT INFORMATION METADATA CARDS */}
        <div id="metadata" className={`grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto pt-6 reveal-init stagger-delay-5 ${heroVisible ? 'revealed' : ''}`}>
          <div className="bg-white/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-red-500/60 flex items-center gap-3 card-hover-lift card-shimmer card-border-glow group text-left shadow-2xs backdrop-blur-md">
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/50 text-[#D60303] shrink-0 micro-hover-badge">
              <Calendar className="w-4 h-4 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-zinc-400 dark:text-[#71717a] uppercase">EVENT DATE</span>
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">25 / 09 / 2026 (Friday)</span>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-red-500/60 flex items-center gap-3 card-hover-lift card-shimmer card-border-glow group text-left shadow-2xs backdrop-blur-md">
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/50 text-[#D60303] shrink-0 micro-hover-badge">
              <User className="w-4 h-4 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-zinc-400 dark:text-[#71717a] uppercase">FACULTY IN-CHARGE</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Mrs. Vallipriyadharshini (CSE)</span>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-red-500/60 flex items-center gap-3 card-hover-lift card-shimmer card-border-glow group text-left shadow-2xs backdrop-blur-md">
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/50 text-[#D60303] shrink-0 micro-hover-badge">
              <Phone className="w-4 h-4 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="block text-[10px] font-mono text-zinc-400 dark:text-[#71717a] uppercase">STUDENT CO-ORDINATOR</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Godfrey T R (9344462238)</span>
            </div>
          </div>
        </div>

        {/* LIVE EVENT STATISTICS CONTROL PANEL */}
        <div className="max-w-4xl mx-auto pt-4">
          <div className="bg-white/50 dark:bg-zinc-900/40 p-4 rounded-xl border-2 border-red-500/60 space-y-3 card-border-glow card-shimmer shadow-2xs backdrop-blur-md">
            <div className="flex items-center justify-between text-xs border-b border-red-500/40 pb-2">
              <span className="font-mono text-[11px] text-zinc-500 dark:text-[#71717a] uppercase font-bold flex items-center gap-2 group">
                <Cpu className="w-3.5 h-3.5 text-[#D60303] micro-hover-icon" /> SYSTEM TELEMETRY CONTROL PANEL
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-[#22c55e] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#22c55e] animate-ping" /> LIVE CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/40 dark:bg-zinc-950/40 p-3.5 rounded-lg border border-red-500/50 text-center space-y-1 card-hover-lift card-shimmer card-border-glow group">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-[#71717a] block">01 — REGISTERED</span>
                <p className="text-xl font-black text-zinc-900 dark:text-white font-mono micro-hover-badge">{countRegistered}</p>
                <span className="text-[10px] text-zinc-500 dark:text-[#a1a1aa] font-mono uppercase">PARTICIPANTS</span>
              </div>
              <div className="bg-white/40 dark:bg-zinc-950/40 p-3.5 rounded-lg border border-red-500/50 text-center space-y-1 card-hover-lift card-shimmer card-border-glow group">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-[#71717a] block">02 — QUALIFIERS</span>
                <p className="text-xl font-black text-[#D60303] font-mono micro-hover-badge">TOP {countRound1}</p>
                <span className="text-[10px] text-zinc-500 dark:text-[#a1a1aa] font-mono uppercase">ROUND 1 CUTOFF</span>
              </div>
              <div className="bg-white/40 dark:bg-zinc-950/40 p-3.5 rounded-lg border border-red-500/50 text-center space-y-1 card-hover-lift card-shimmer card-border-glow group">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-[#71717a] block">03 — FINALISTS</span>
                <p className="text-xl font-black text-zinc-900 dark:text-white font-mono micro-hover-badge">TOP {countRound2}</p>
                <span className="text-[10px] text-zinc-500 dark:text-[#a1a1aa] font-mono uppercase">ROUND 2 CUTOFF</span>
              </div>
              <div className="bg-white/40 dark:bg-zinc-950/40 p-3.5 rounded-lg border border-red-500/50 text-center space-y-1 card-hover-lift card-shimmer card-border-glow group">
                <span className="text-[10px] font-mono text-zinc-400 dark:text-[#71717a] block">04 — STATUS</span>
                <p className="text-[#D60303] font-mono font-bold text-xs uppercase pt-1 micro-hover-badge">{eventState?.status}</p>
                <span className="text-[10px] text-zinc-500 dark:text-[#a1a1aa] font-mono uppercase">ACTIVE PHASE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* OFFICIAL BROCHURE & POSTER ANNOUNCEMENT */}
      <section
        id="brochure"
        ref={posterRef}
        className={`relative z-10 py-8 px-4 max-w-5xl mx-auto w-full space-y-4 reveal-init ${posterVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">// OFFICIAL DOCUMENTATION</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Symposium Brochure & Announcement
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] max-w-xl mx-auto font-normal">
            Official TECHNOVA 2026 schedule, rules, and departmental guidelines.
          </p>
        </div>

        <div className="bg-white/50 dark:bg-zinc-900/40 p-6 rounded-xl border-2 border-red-500/60 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center card-hover-lift card-shimmer card-border-glow group shadow-2xs backdrop-blur-md">
          {/* Poster Image Preview */}
          <div className="md:col-span-5 relative rounded-lg overflow-hidden border border-red-500/60 aspect-[3/4] bg-zinc-900 group cursor-pointer" onClick={() => setShowPosterModal(true)}>
            <img
              src="/poster.png"
              alt="TECHNOVA 2026 Official Event Poster"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold">
              <span>CLICK TO VIEW BROCHURE →</span>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-4 text-left">
            <div>
              <span className="px-3 py-1 rounded-md bg-red-950/40 border border-red-500/70 text-[#D60303] dark:text-red-400 text-[10px] font-mono font-bold micro-hover-badge">
                NATIONAL LEVEL SYMPOSIUM
              </span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-2">TECHNOVA 2026 BROCHURE</h3>
              <p className="text-xs text-zinc-500 dark:text-[#a1a1aa]">"Ideas Today, A Smarter Tomorrow"</p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-zinc-600 dark:text-[#a1a1aa]">
              <div className="flex items-start gap-3 group">
                <Calendar className="w-4 h-4 text-[#D60303] shrink-0 mt-0.5 micro-hover-icon" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">Schedule</span>
                  <span>25th September 2026 (Friday)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <MapPin className="w-4 h-4 text-[#D60303] shrink-0 mt-0.5 micro-hover-icon" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">Venue Location</span>
                  <span>Technova: Lab 1 & 2 → Circuit Block, 3rd Floor</span>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <User className="w-4 h-4 text-[#D60303] shrink-0 mt-0.5 micro-hover-icon" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">Faculty In-Charge</span>
                  <span>Mrs. Vallipriyadharshini (Dept. of CSE)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <Phone className="w-4 h-4 text-[#D60303] shrink-0 mt-0.5 micro-hover-icon" />
                <div>
                  <span className="font-bold text-zinc-900 dark:text-white block">Student Coordinator</span>
                  <span>Godfrey T R — Phone: <a href="tel:9344462238" className="text-[#D60303] font-bold hover:underline font-mono">9344462238</a></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPosterModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer btn-interactive shadow-xs"
            >
              <FileText className="w-4 h-4 text-white micro-hover-icon" />
              <span>VIEW FULL BROCHURE →</span>
            </button>
          </div>
        </div>
      </section>

      {/* COMPETITION TIMELINE / PIPELINE */}
      <section
        id="pipeline"
        ref={(node) => {
          workflowRef.current = node;
          roundsRef.current = node;
        }}
        className={`relative z-10 py-8 px-4 max-w-5xl mx-auto space-y-6 w-full reveal-init ${workflowVisible || roundsVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">// SYSTEM PIPELINE</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-2">
            <Layers className="w-6 h-6 text-[#D60303]" />
            <span>Competition Progression Pipeline</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] max-w-xl mx-auto font-normal">
            Merit-based qualification system calculated and verified dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Pipeline Step 1 */}
          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 relative card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-[#D60303] font-mono micro-hover-badge inline-block">01</span>
              <Users className="w-5 h-5 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-[#a1a1aa] uppercase tracking-widest block">STAGE 01</span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">REGISTRATION</h3>
              <p className="text-xs text-zinc-500 dark:text-[#71717a] mt-1 leading-relaxed">
                Participant onboarding & account credential assignment.
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-[#27272a] text-[11px] font-mono text-zinc-600 dark:text-[#a1a1aa] space-y-1">
              <span className="text-emerald-600 dark:text-[#22c55e] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE ONBOARDING
              </span>
              <span>Team Size: 2 Members</span>
            </div>
          </div>

          {/* Pipeline Step 2 */}
          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 relative card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono micro-hover-badge inline-block">02</span>
              <Brain className="w-5 h-5 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest block">ROUND 01</span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">TECH QUIZ</h3>
              <p className="text-xs text-zinc-500 dark:text-[#71717a] mt-1 leading-relaxed flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>20 randomized CS MCQs in 20 Mins. Real-time supervision.</span>
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-[#27272a] text-[11px] font-mono text-zinc-600 dark:text-[#a1a1aa] space-y-1">
              <span className="text-zinc-900 dark:text-white font-bold block">• TOP {eventState?.round1QualifyCount || 30} QUALIFY</span>
              <span>Online Server Quiz</span>
            </div>
          </div>

          {/* Pipeline Step 3 */}
          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 relative card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono micro-hover-badge inline-block">03</span>
              <Code2 className="w-5 h-5 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest block">ROUND 02</span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">DEBUG IT</h3>
              <p className="text-xs text-zinc-500 dark:text-[#71717a] mt-1 leading-relaxed flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Local VS Code execution & coordinator PIN verification.</span>
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-[#27272a] text-[11px] font-mono text-zinc-600 dark:text-[#a1a1aa] space-y-1">
              <span className="text-zinc-900 dark:text-white font-bold block">• TOP {eventState?.round2QualifyCount || 10} FINALISTS</span>
              <span>Physical Lab Verification</span>
            </div>
          </div>

          {/* Pipeline Step 4 */}
          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 relative card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono micro-hover-badge inline-block">04</span>
              <Compass className="w-5 h-5 text-[#D60303] micro-hover-icon" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest block">FINALS</span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">TECH HUNT</h3>
              <p className="text-xs text-zinc-500 dark:text-[#71717a] mt-1 leading-relaxed flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Solve campus clue stations to reach the podium.</span>
              </p>
            </div>
            <div className="pt-3 border-t border-zinc-100 dark:border-[#27272a] text-[11px] font-mono text-zinc-600 dark:text-[#a1a1aa] space-y-1">
              <span className="text-[#D60303] font-bold flex items-center gap-1">
                <Play className="w-3 h-3 text-[#D60303]" /> SYMPOSIUM PODIUM
              </span>
              <span>Speed & Accuracy Scoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETITION RULES & ANTI-CHEAT PROTOCOLS */}
      <section
        id="rules"
        ref={rulesRef}
        className={`relative z-10 py-8 px-4 max-w-5xl mx-auto w-full space-y-6 reveal-init ${rulesVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">// REGULATIONS</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Competition Rules & Anti-Cheat Protocols
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] max-w-xl mx-auto font-normal">
            Enforced telemetry rules to guarantee competitive integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#D60303]">
              <ShieldAlert className="w-5 h-5 micro-hover-icon" />
              <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Anti-Cheat Monitoring</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
              Active window focus, tab switches, and full-screen exits are monitored in real time. Maximum 3 warnings allowed before automatic submission.
            </p>
          </div>

          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#D60303]">
              <UserCheck className="w-5 h-5 micro-hover-icon" />
              <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Physical PIN Verification</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
              For practical debugging rounds, marks are granted only after a physical lab coordinator inspects source code execution and inputs their secret PIN.
            </p>
          </div>

          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#D60303]">
              <Lock className="w-5 h-5 micro-hover-icon" />
              <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Participant ID Privacy</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
              Participants are identified by unique IDs (e.g., <span className="font-mono text-zinc-900 dark:text-white">TN2026-001</span>). Public leaderboards display Participant IDs to protect identity.
            </p>
          </div>

          <div className="bg-white dark:bg-[#141417] p-5 rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow group shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#D60303]">
              <Award className="w-5 h-5 micro-hover-icon" />
              <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Podium Awards & Trophy</h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
              Final winners receive the official TECHNOVA 2026 Symposium Trophy and cash awards. Digital certificates provided to all qualifiers.
            </p>
          </div>
        </div>
      </section>

      {/* PORTAL ENTRY SECTION */}
      <section className="relative z-10 py-10 px-4 max-w-5xl mx-auto w-full">
        <div className="bg-[#18181b] dark:bg-[#0f0f11] p-8 sm:p-10 rounded-2xl border border-zinc-700 dark:border-[#27272a] text-center space-y-4 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(214,3,3,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27272a] dark:bg-[#141417] border border-zinc-600 dark:border-[#27272a] text-emerald-400 dark:text-[#22c55e] font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-[#22c55e] animate-ping" />
            SYSTEM READY
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            TECHNOVA COMPETITION PORTAL
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 dark:text-[#a1a1aa] max-w-xl mx-auto font-normal">
            Server authentication & participant access module. Enter your assigned User ID and Password to launch your workstation.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setCurrentScreen('login')}
              className="px-8 py-3.5 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white font-mono font-bold text-xs sm:text-sm shadow-xl shadow-red-950/60 transition flex items-center gap-3 cursor-pointer btn-interactive"
            >
              <span>ENTER PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* LIVE SYMPOSIUM LEADERBOARD SECTION */}
      <section
        id="leaderboard"
        ref={leaderboardRef}
        className={`relative z-10 py-8 px-4 max-w-5xl mx-auto w-full space-y-4 reveal-init ${leaderboardVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">// LIVE STANDINGS</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Leaderboard Telemetry</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] max-w-xl mx-auto font-normal">
            Real-time merit rankings across all rounds based on score & completion timestamp.
          </p>
        </div>

        {leaderboard && leaderboard.length > 0 ? (
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm font-mono text-xs overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <th className="py-2 px-3 text-center">RANK</th>
                  <th className="py-2 px-3">PARTICIPANT</th>
                  <th className="py-2 px-3 text-center">ROUND 1</th>
                  <th className="py-2 px-3 text-center">ROUND 2</th>
                  <th className="py-2 px-3 text-center">ROUND 3</th>
                  <th className="py-2 px-3 text-right">TOTAL SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {leaderboard.slice(0, 10).map((item, idx) => {
                  const displayRank = item.rank || (idx + 1);
                  return (
                    <tr key={item.id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                      <td className="py-2.5 px-3 text-center font-bold text-[#D60303]">
                        {displayRank === 1 ? '🥇 #1' : displayRank === 2 ? '🥈 #2' : displayRank === 3 ? '🥉 #3' : `#${displayRank}`}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>{item.name || item.id}</span>
                        {item.qualifiedR3 ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">R3 Finalist</span>
                        ) : item.qualifiedR2 ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">R2 Qualifier</span>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-3 text-center text-zinc-600 dark:text-zinc-300">{item.r1 ?? item.r1Score ?? 0}</td>
                      <td className="py-2.5 px-3 text-center text-zinc-600 dark:text-zinc-300">{item.r2 ?? item.r2Score ?? 0}</td>
                      <td className="py-2.5 px-3 text-center text-zinc-600 dark:text-zinc-300">{item.r3 ?? item.r3Score ?? 0}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {item.total ?? item.totalScore ?? 0} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#141417] p-8 rounded-2xl border border-zinc-200 dark:border-[#27272a] text-center text-xs text-zinc-500 font-mono">
            Competition leaderboard initializing... Sign in to participate!
          </div>
        )}
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section
        id="faq"
        ref={faqRef}
        className={`relative z-10 py-8 px-4 max-w-4xl mx-auto w-full space-y-4 reveal-init ${faqVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">// SUPPORT</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#141417] rounded-xl border border-zinc-200 dark:border-[#27272a] overflow-hidden transition-all duration-200 shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-zinc-900 dark:text-white text-xs sm:text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-[#1a1a1e] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#D60303] shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed border-t border-zinc-100 dark:border-[#27272a] pt-3 animate-slide-up">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto relative z-10 border-t border-zinc-200 dark:border-[#27272a] py-6 px-6 bg-white dark:bg-[#09090b] shrink-0 select-none transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/college.png" alt="KRCT Logo" className="h-8 w-auto object-contain" />
            <div className="text-xs text-zinc-500 dark:text-[#71717a] font-medium">
              <span className="font-bold text-zinc-900 dark:text-white block">DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</span>
              <span>K. Ramakrishnan College of Technology • TECHNOVA / FESTRONIX 2026</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 text-xs font-mono text-zinc-500 dark:text-[#71717a]">
            <span className="text-emerald-600 dark:text-[#22c55e] flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#22c55e] animate-ping" /> SYSTEM STATUS: ONLINE
            </span>
            <span>© 2026 TECHNOVA</span>
            <span className="text-[10px] text-zinc-400/80 dark:text-zinc-600/80 font-normal select-none">
              The system is built using Antigravity
            </span>
          </div>
        </div>
      </footer>

      {/* Brochure / Poster Fullscreen Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-hero-entrance">
          <div className="relative max-w-3xl w-full max-h-[90vh] bg-white dark:bg-[#0f0f11] rounded-xl border border-zinc-300 dark:border-[#27272a] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-3 bg-zinc-100 dark:bg-[#141417] border-b border-zinc-200 dark:border-[#27272a] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">TECHNOVA 2026 OFFICIAL BROCHURE</span>
              <button
                onClick={() => setShowPosterModal(false)}
                className="p-1 rounded text-zinc-500 dark:text-[#a1a1aa] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#27272a] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center">
              <img src="/poster.png" alt="Official Poster" className="max-w-full h-auto rounded border border-zinc-200 dark:border-[#27272a]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
