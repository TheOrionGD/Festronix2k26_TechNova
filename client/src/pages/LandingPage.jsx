import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
  Maximize2,
  X
} from 'lucide-react';

export default function LandingPage() {
  const { setCurrentScreen, leaderboard, eventState } = useApp();
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

  // Handle scroll detection for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key for modal
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#18181B] flex flex-col font-sans selection:bg-[#DC2626] selection:text-white">
      {/* Background Ambient Video Layer (plays /BG.mp4) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0 mix-blend-multiply transition-opacity duration-1000"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      >
        <source src="/BG.mp4" type="video/mp4" />
        <source src="/bg_video.mp4" type="video/mp4" />
      </video>

      {/* Quiet Technical Ambient Grid & Moving Particles */}
      <div
        className="fixed inset-0 opacity-35 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />
      <div className="fixed top-1/4 left-10 w-96 h-96 bg-[radial-gradient(circle,rgba(220,38,38,0.04)_0%,transparent_70%)] pointer-events-none animate-float-slow z-0" />
      <div className="fixed bottom-1/3 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(163,11,26,0.03)_0%,transparent_70%)] pointer-events-none animate-float-slow z-0" style={{ animationDelay: '3s' }} />

      {/* Top Navigation Bar */}
      <nav className={`h-14 border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 shrink-0 select-none ${scrolled ? 'bg-[#F8F7F4]/95 backdrop-blur-md shadow-sm border-zinc-300' : 'bg-[#F8F7F4]/80 backdrop-blur-sm'
        }`}>
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentScreen('splash')}
        >
          <div className="bg-white px-2.5 py-1 rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-2.5 transition-transform duration-200 group-hover:scale-[1.02]">
            <img src="/college.png" alt="KRCT Logo" className="h-6 sm:h-7 w-auto object-contain" />
            <div className="h-5 w-[1px] bg-zinc-200 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#DC2626] p-0.5 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:rotate-6 overflow-hidden">
                <img src="/technova_icon.jpg" alt="Technova Icon" className="w-full h-full object-cover rounded-md" />
              </div>
              <span className="text-sm sm:text-base font-black tracking-tight text-zinc-900">
                TECH<span className="text-[#DC2626]">NOVA</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs shadow-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer btn-interactive focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="relative z-10 pt-6 pb-4 px-4 max-w-5xl mx-auto text-center space-y-4"
      >
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-2xs reveal-init ${heroVisible ? 'revealed' : ''}`}>
          <Sparkles className="w-3.5 h-3.5 text-[#DC2626] animate-pulse" />
          <span>FESTRONIX 2026 • Department of Computer Science & Engineering Presents</span>
        </div>

        <h1 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto text-zinc-900 reveal-init stagger-delay-1 ${heroVisible ? 'revealed' : ''}`}>
          FESTRONIX 2026 <br />
          <span className="text-[#DC2626] text-gradient-red">TECHNOVA Technical Competition</span>
        </h1>

        <p className={`text-xs sm:text-sm text-zinc-600 max-w-2xl mx-auto leading-relaxed font-medium reveal-init stagger-delay-2 ${heroVisible ? 'revealed' : ''}`}>
          Department of Computer Science and Engineering National Level Technical Symposium <br />
          Featuring TECHNOVA <br />
          Code the Ideas / Build the Tomorrow <br />
          An elite competition engineered for competitive programming, rapid debugging, and clue solving
        </p>

        {/* Action CTAs */}
        <div className={`flex flex-wrap items-center justify-center gap-3 pt-1 reveal-init stagger-delay-3 ${heroVisible ? 'revealed' : ''}`}>
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm shadow-md shadow-red-900/10 transition-all flex items-center gap-2 cursor-pointer btn-interactive group"
          >
            <span>Enter Competition Portal</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Key Event Quick Info Banner */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto pt-2 reveal-init stagger-delay-4 ${heroVisible ? 'revealed' : ''}`}>
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-center gap-3 card-hover-lift">
            <Calendar className="w-4 h-4 text-[#DC2626] shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] font-mono text-zinc-400 uppercase">EVENT DATE</span>
              <span className="text-xs font-bold text-zinc-900">25 / 09 / 2026 (Friday)</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-center gap-3 card-hover-lift">
            <User className="w-4 h-4 text-[#DC2626] shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] font-mono text-zinc-400 uppercase">FACULTY IN-CHARGE</span>
              <span className="text-xs font-bold text-zinc-900">Mrs. Vallipriyadharshini (CSE)</span>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-center gap-3 card-hover-lift">
            <Phone className="w-4 h-4 text-[#DC2626] shrink-0" />
            <div className="text-left">
              <span className="block text-[10px] font-mono text-zinc-400 uppercase">STUDENT CO-ORDINATOR</span>
              <span className="text-xs font-bold text-zinc-900">Godfrey T R (9344462238)</span>
            </div>
          </div>
        </div>

        {/* Real-time Overview Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2 reveal-init stagger-delay-5 ${heroVisible ? 'revealed' : ''}`}>
          <div className="bg-white p-4 rounded-xl text-center space-y-0.5 border border-zinc-200/80 shadow-2xs card-hover-lift">
            <Users className="w-4 h-4 text-[#DC2626] mx-auto" />
            <p className="text-xl font-black text-zinc-900 font-mono">{countRegistered}</p>
            <p className="text-[11px] text-zinc-500 font-medium">Registered Participants</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center space-y-0.5 border border-zinc-200/80 shadow-2xs card-hover-lift">
            <Brain className="w-4 h-4 text-[#DC2626] mx-auto" />
            <p className="text-xl font-black text-zinc-900 font-mono">Top {countRound1}</p>
            <p className="text-[11px] text-zinc-500 font-medium">Round 1 Qualifiers</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center space-y-0.5 border border-zinc-200/80 shadow-2xs card-hover-lift">
            <Terminal className="w-4 h-4 text-[#DC2626] mx-auto" />
            <p className="text-xl font-black text-zinc-900 font-mono">Top {countRound2}</p>
            <p className="text-[11px] text-zinc-500 font-medium">Round 2 Finalists</p>
          </div>
          <div className="bg-white p-4 rounded-xl text-center space-y-0.5 border border-zinc-200/80 shadow-2xs card-hover-lift">
            <Trophy className="w-4 h-4 text-[#DC2626] mx-auto" />
            <p className="text-xl font-black text-[#DC2626] font-mono text-xs uppercase">{eventState?.status || 'REGISTRATION'}</p>
            <p className="text-[11px] text-zinc-500 font-medium">Event Status</p>
          </div>
        </div>
      </header>

      {/* SECTION: OFFICIAL SYMPOSIUM POSTER SHOWCASE */}
      <section
        ref={posterRef}
        className={`relative z-10 py-5 px-4 max-w-5xl mx-auto w-full space-y-4 reveal-init ${posterVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">OFFICIAL BROCHURE</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Event Poster & Announcement
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Department of Computer Science & Engineering — Official TECHNOVA 2026 Poster.
          </p>
        </div>

        <div className="gradient-border-card p-6 sm:p-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center card-hover-lift">
          {/* Poster Image Preview */}
          <div className="md:col-span-6 relative rounded-2xl overflow-hidden border border-zinc-200 shadow-md aspect-[3/4] bg-zinc-900">
            <img
              src="/poster.png"
              alt="TECHNOVA 2026 Official Event Poster"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Contacts & Overview */}
          <div className="md:col-span-6 space-y-6 text-left">
            <div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-[#DC2626] text-[11px] font-bold font-mono">
                NATIONAL LEVEL SYMPOSIUM
              </span>
              <h3 className="text-2xl font-black text-zinc-900 mt-2">TECHNOVA 2026</h3>
              <p className="text-xs text-zinc-500 mt-1">"Ideas Today, A Smarter Tomorrow"</p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-zinc-600">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 block">Date & Schedule</span>
                  <span>25th September 2026 (Friday)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 block">Location</span>
                  <span>Technova: Lab 1 & 2 → Circuit Block, 3rd Floor</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 block">Faculty In-Charge / Staff Coordinator</span>
                  <span>Mrs. Vallipriyadharshini (Dept. of CSE)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 block">Student Coordinator</span>
                  <span>Godfrey T R — Phone: <a href="tel:9344462238" className="text-[#DC2626] font-bold hover:underline">9344462238</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THE 3 COMPETITION STAGES */}
      <section
        ref={roundsRef}
        className={`relative z-10 py-5 px-4 max-w-5xl mx-auto space-y-4 w-full reveal-init ${roundsVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">STRUCTURE</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Symposium Round Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Participants progress sequentially based on verified backend evaluation and coordinator signoff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 Card */}
          <div className="gradient-border-card p-6 space-y-4 card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#DC2626] uppercase tracking-widest">ROUND 1</span>
              <h3 className="text-lg font-bold text-zinc-900">TECH QUIZ</h3>
              <p className="text-xs text-zinc-500 mt-1 font-normal leading-relaxed">
                Randomized questions across CS domains. Timed online evaluation with real-time telemetry.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-600 space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#DC2626]" />
                <span>Format: Randomized MCQs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#DC2626]" />
                <span>Time Limit: {eventState?.round1DurationMinutes || 20} Mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#DC2626]" />
                <span>Qualification: Top {eventState?.round1QualifyCount || 30}</span>
              </div>
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="gradient-border-rose p-6 space-y-4 card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-widest">ROUND 2</span>
              <h3 className="text-lg font-bold text-zinc-900">DEBUG IT</h3>
              <p className="text-xs text-zinc-500 mt-1 font-normal leading-relaxed">
                Broken code challenges executed locally in VS Code. Requires physical coordinator verification.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-600 space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                <span>Local execution in VS Code</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-600" />
                <span>Physical Coordinator PIN Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-rose-600" />
                <span>Qualification: Top {eventState?.round2QualifyCount || 10}</span>
              </div>
            </div>
          </div>

          {/* Round 3 Card */}
          <div className="gradient-border-dark p-6 space-y-4 card-hover-lift group">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-800 uppercase tracking-widest">ROUND 3</span>
              <h3 className="text-lg font-bold text-zinc-900">TECH HUNT</h3>
              <p className="text-xs text-zinc-500 mt-1 font-normal leading-relaxed">
                Technical clue stations spread across campus. Solve complex technical riddles to reach the podium.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-600 space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-800" />
                <span>{eventState?.round3StationCount || 5} Station Route Solver</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-800" />
                <span>Time + Accuracy Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-red-800" />
                <span>Final Symposium Podium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OFFICIAL COMPETITION RULES & CODE OF CONDUCT */}
      <section
        ref={rulesRef}
        className={`relative z-10 py-5 px-4 max-w-5xl mx-auto w-full space-y-4 reveal-init ${rulesVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">REGULATIONS</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Official Competition Rules & System Policies
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Strict compliance with tournament protocols, anti-cheat telemetry, and fair play norms is mandatory for all registered participants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gradient-border-card p-6 space-y-4 card-hover-lift">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2.5 rounded-xl bg-red-50">
                <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Anti-Cheat & Monitoring Protocols</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              The TECHNOVA telemetry engine monitors active window focus, tab switches, full-screen exits, and external keystroke anomalies in real-time. Any attempt to bypass evaluation boundaries will be logged to server security feeds.
            </p>
            <ul className="text-xs text-zinc-600 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] font-bold">•</span>
                <span>Maximum 3 tab-switch warnings before automatic attempt submission.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] font-bold">•</span>
                <span>AI code generation tools and external chat bots are strictly prohibited.</span>
              </li>
            </ul>
          </div>

          <div className="gradient-border-card p-6 space-y-4 card-hover-lift">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="p-2.5 rounded-xl bg-zinc-100">
                <FileText className="w-5 h-5 text-zinc-800" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Evaluation & Physical Verification</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Scores are calculated and computed on central backend servers. For practical debugging rounds, marks are granted only after a physical lab coordinator inspects source code execution at your terminal and enters their secret PIN.
            </p>
            <ul className="text-xs text-zinc-600 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-zinc-800 font-bold">•</span>
                <span>Round 1: 1 Mark per correct answer (No negative marking).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-800 font-bold">•</span>
                <span>Round 2 & 3: Speed + test case coverage verified by Lab Coordinators.</span>
              </li>
            </ul>
          </div>

          <div className="gradient-border-card p-6 space-y-4 card-hover-lift">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="p-2.5 rounded-xl bg-zinc-100">
                <Lock className="w-5 h-5 text-zinc-800" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Authentication & Privacy Compliance</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Each participant is assigned a unique Participant ID (e.g. <span className="font-mono text-zinc-800 font-semibold">TN2026-001</span>). Public leaderboards display ONLY Participant IDs to safeguard personal identity privacy.
            </p>
          </div>

          <div className="gradient-border-card p-6 space-y-4 card-hover-lift">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="p-2.5 rounded-xl bg-zinc-100">
                <Award className="w-5 h-5 text-zinc-800" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Podium Awards & Certificates</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Winners of the final Round 3 will receive the official TECHNOVA 2026 Symposium Trophy and cash awards. All qualified participants receive verified digital certificates.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: PARTICIPANT PRIVILEGES & SYSTEM FEATURES */}
      <section className="relative z-10 py-5 px-4 max-w-5xl mx-auto w-full space-y-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">PRIVILEGES & CAPABILITIES</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Participant Privileges & Platform Features
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Built with state-of-the-art resilient architecture to ensure zero data loss during competitive evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zinc-900 text-sm">Offline First Sync Engine</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              If network connectivity drops during evaluation, your progress is saved locally. Background 5-second heartbeats pings the network and enables submit buttons seamlessly once Wi-Fi reconnects.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zinc-900 text-sm">Disconnection Grace Privileges</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              During network disconnection phases, full-screen lock and tab anti-cheat penalties are automatically suspended so you can access Wi-Fi settings or reconnect cables without penalty.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-zinc-900 text-sm">Gamified Badges & Trophies</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-normal">
              Earn real-time digital badges (Round 1 Quiz Master Badge, Round 2 Terminal Ninja Badge, and Round 3 Champion Trophy) displayed on your participant dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: PROHIBITED ACTIVITIES & ZERO-TOLERANCE VIOLATIONS */}
      <section className="relative z-10 py-5 px-4 max-w-5xl mx-auto w-full space-y-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">ZERO TOLERANCE POLICY</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Prohibited Activities & Disqualification Norms
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Engaging in any of the following unauthorized activities will result in immediate disqualification.
          </p>
        </div>

        <div className="gradient-border-card p-6 sm:p-8 space-y-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 space-y-1.5">
              <span className="font-bold text-[#DC2626] block uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" /> Tab Switching & Window Unfocus
              </span>
              <p className="text-zinc-700 leading-relaxed">
                Switching browser tabs or minimizing the evaluation window more than 3 times will automatically trigger immediate quiz submission and log violation telemetry.
              </p>
            </div>

            <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 space-y-1.5">
              <span className="font-bold text-[#DC2626] block uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" /> AI Assistants & External Code Copying
              </span>
              <p className="text-zinc-700 leading-relaxed">
                Using AI code assistants (ChatGPT, Copilot, Gemini) or copying code snippets from external websites during evaluation is strictly banned.
              </p>
            </div>

            <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 space-y-1.5">
              <span className="font-bold text-[#DC2626] block uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" /> Account & Credential Sharing
              </span>
              <p className="text-zinc-700 leading-relaxed">
                Attempting concurrent login sessions or sharing Participant ID credentials across multiple workstations will invalidate all participant attempts.
              </p>
            </div>

            <div className="p-3.5 bg-red-50/80 rounded-xl border border-red-200 space-y-1.5">
              <span className="font-bold text-[#DC2626] block uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" /> Impersonation & Unauthorized Assistance
              </span>
              <p className="text-zinc-700 leading-relaxed">
                Soliciting unauthorized external assistance during Round 2 local debugging or Round 3 campus station hunt will result in immediate disqualification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: STEP-BY-STEP COMPETITION PROCEDURES */}
      <section
        ref={workflowRef}
        className={`relative z-10 py-5 px-4 max-w-5xl mx-auto w-full space-y-4 reveal-init ${workflowVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">WORKFLOW</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Participant Procedure
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Follow these 4 simple steps to participate in the TECHNOVA symposium.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="gradient-border-card p-6 space-y-3 relative card-hover-lift">
            <span className="text-3xl font-black text-red-100 font-mono">01</span>
            <h4 className="font-bold text-zinc-900 text-sm">Sign In to Portal</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Login with your assigned Participant ID and Password provided during registration.
            </p>
          </div>

          <div className="gradient-border-card p-6 space-y-3 relative card-hover-lift">
            <span className="text-3xl font-black text-red-100 font-mono">02</span>
            <h4 className="font-bold text-zinc-900 text-sm">Attempt Round 1 Quiz</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Answer 20 randomized computer science MCQs within 20 minutes under system supervision.
            </p>
          </div>

          <div className="gradient-border-card p-6 space-y-3 relative card-hover-lift">
            <span className="text-3xl font-black text-red-100 font-mono">03</span>
            <h4 className="font-bold text-zinc-900 text-sm">Debug & Verify (R2)</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Debug source code in VS Code and request a coordinator to verify your terminal output.
            </p>
          </div>

          <div className="gradient-border-card p-6 space-y-3 relative card-hover-lift">
            <span className="text-3xl font-black text-red-100 font-mono">04</span>
            <h4 className="font-bold text-zinc-900 text-sm">Tech Hunt & Podium</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Solve clue stations across campus to secure your position on the live leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE LEADERBOARD PREVIEW (PRIVACY-PRESERVING: PARTICIPANT ID ONLY) */}
      <section
        ref={leaderboardRef}
        className={`relative z-10 py-5 px-4 max-w-4xl mx-auto w-full space-y-4 reveal-init ${leaderboardVisible ? 'revealed' : ''}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">LIVE RANKINGS</span>
            <h3 className="text-xl font-black text-zinc-900">Symposium Leaderboard</h3>
          </div>
          <p className="text-xs text-zinc-500 font-medium">Real-time scores (Privacy Protected: Participant ID Displayed Only)</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-2xs card-hover-lift">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs font-medium">
              No participant scores recorded yet. Leaderboard updates automatically during active rounds.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-white font-mono">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Participant ID</th>
                  <th className="px-4 py-3 text-center">Round 1</th>
                  <th className="px-4 py-3 text-center">Round 2</th>
                  <th className="px-4 py-3 text-center">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {leaderboard.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50 transition-colors duration-150 font-medium">
                    <td className="px-4 py-3 font-bold text-[#DC2626]">#{row.rank}</td>
                    <td className="px-4 py-3 font-mono text-zinc-900 font-semibold">{row.id}</td>
                    <td className="px-4 py-3 text-center text-red-700 font-bold">{row.r1}</td>
                    <td className="px-4 py-3 text-center text-rose-600 font-bold">{row.r2}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#DC2626]">{row.total} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
      <section
        ref={faqRef}
        className={`relative z-10 py-5 px-4 max-w-4xl mx-auto w-full space-y-4 reveal-init ${faqVisible ? 'revealed' : ''}`}
      >
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">SUPPORT</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-zinc-900 text-xs sm:text-sm cursor-pointer hover:bg-zinc-50/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#DC2626] shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : 'rotate-0'
                    }`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3 animate-slide-up">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>



      {/* Footer */}
      <footer className="mt-auto relative z-10 border-t border-zinc-200 py-5 px-6 bg-white shrink-0 select-none">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/college.png" alt="KRCT Logo" className="h-9 w-auto object-contain" />
            <div className="text-xs text-zinc-500 font-medium">
              <span className="font-bold text-zinc-900 block">K. RAMAKRISHNAN COLLEGE OF TECHNOLOGY</span>
              <span>TECHNOVA 2026 Technical Symposium Platform</span>
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            <span>© 2026 TECHNOVA. All Rights Reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
