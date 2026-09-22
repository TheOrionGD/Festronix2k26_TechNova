import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  HelpCircle,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  Lock,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const { setCurrentScreen, leaderboard, eventState } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const totalRegistered = eventState?.registrationCount || leaderboard?.length || 0;

  const faqs = [
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#18181B] flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Quiet Background Grid */}
      <div 
        className="fixed inset-0 opacity-35 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="h-20 border-b border-zinc-200 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-50 bg-[#F8F7F4]/90 backdrop-blur-md">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentScreen('splash')}>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
            <img src="/college.png" alt="KRCT Logo" className="h-7 sm:h-8 w-auto object-contain" />
            <div className="h-6 w-[1px] bg-zinc-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#DC2626] flex items-center justify-center shadow-xs">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-zinc-900">
                TECH<span className="text-[#DC2626]">NOVA</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-14 pb-12 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#DC2626]" />
          <span>K. Ramakrishnan College of Technology — Annual Technical Symposium 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-zinc-900">
          The Ultimate Multi-Stage <br />
          <span className="text-[#DC2626]">Competition Platform</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
          A controlled multi-stage tournament engineered to test computer science mastery, rapid local debugging proficiency, and technical clue solving.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-8 py-3.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm shadow-lg shadow-red-900/10 transition-all flex items-center gap-3 cursor-pointer"
          >
            <span>Enter Competition Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Overview Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="bg-white p-5 rounded-2xl text-center space-y-1 border border-zinc-200/80 shadow-xs">
            <Users className="w-5 h-5 text-[#DC2626] mx-auto" />
            <p className="text-2xl font-black text-zinc-900 font-mono">{totalRegistered}</p>
            <p className="text-xs text-zinc-500 font-medium">Registered Participants</p>
          </div>
          <div className="bg-white p-5 rounded-2xl text-center space-y-1 border border-zinc-200/80 shadow-xs">
            <Brain className="w-5 h-5 text-[#DC2626] mx-auto" />
            <p className="text-2xl font-black text-zinc-900 font-mono">Top {eventState?.round1QualifyCount || 30}</p>
            <p className="text-xs text-zinc-500 font-medium">Round 1 Qualifiers</p>
          </div>
          <div className="bg-white p-5 rounded-2xl text-center space-y-1 border border-zinc-200/80 shadow-xs">
            <Terminal className="w-5 h-5 text-[#DC2626] mx-auto" />
            <p className="text-2xl font-black text-zinc-900 font-mono">Top {eventState?.round2QualifyCount || 10}</p>
            <p className="text-xs text-zinc-500 font-medium">Round 2 Finalists</p>
          </div>
          <div className="bg-white p-5 rounded-2xl text-center space-y-1 border border-zinc-200/80 shadow-xs">
            <Trophy className="w-5 h-5 text-[#DC2626] mx-auto" />
            <p className="text-2xl font-black text-[#DC2626] font-mono text-sm uppercase">{eventState?.status || 'REGISTRATION'}</p>
            <p className="text-xs text-zinc-500 font-medium">Event Status</p>
          </div>
        </div>
      </header>

      {/* SECTION 1: THE 3 COMPETITION STAGES */}
      <section className="relative z-10 py-12 px-6 max-w-6xl mx-auto space-y-8 w-full">
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
          <div className="bg-white p-6 rounded-2xl space-y-4 border border-zinc-200 border-l-4 border-l-[#DC2626] shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold">
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
          <div className="bg-white p-6 rounded-2xl space-y-4 border border-zinc-200 border-l-4 border-l-rose-600 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
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
          <div className="bg-white p-6 rounded-2xl space-y-4 border border-zinc-200 border-l-4 border-l-red-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold">
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
      <section className="relative z-10 py-12 px-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">REGULATIONS</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Official Competition Rules
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto font-normal">
            Strict compliance with tournament protocols is mandatory for all registered participants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2.5 rounded-xl bg-red-50">
                <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Anti-Cheat & Monitoring</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              The TECHNOVA system active window telemetry monitors tab switches, full-screen exits, and external keystroke anomalies. Any attempt to leave the evaluation screen will be logged in real-time.
            </p>
            <ul className="text-xs text-zinc-600 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] font-bold">•</span>
                <span>Maximum 3 tab-switch warnings before automatic quiz submission.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#DC2626] font-bold">•</span>
                <span>AI code generation tools and external chat tools are strictly prohibited.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="p-2.5 rounded-xl bg-zinc-100">
                <FileText className="w-5 h-5 text-zinc-800" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Verification & Scoring</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Scores are recorded and computed on the central server. For practical debugging rounds, marks are granted only after a physical coordinator verifies source code output at your terminal.
            </p>
            <ul className="text-xs text-zinc-600 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-zinc-800 font-bold">•</span>
                <span>Round 1: 1 Mark per correct answer (No negative marking).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-800 font-bold">•</span>
                <span>Round 2 & 3: Speed + test case coverage verification by Lab Coordinators.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="p-2.5 rounded-xl bg-zinc-100">
                <Lock className="w-5 h-5 text-zinc-800" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Authentication & Credentials</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Each participant is assigned a unique Participant ID (e.g. <span className="font-mono text-zinc-800 font-semibold">TN2026-001</span>). Sharing login credentials or attempting multiple concurrent sessions will invalidate the attempt.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="p-2.5 rounded-xl bg-zinc-100">
                <Award className="w-5 h-5 text-zinc-800" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base">Podium & Certificates</h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Winners of the final Round 3 will receive the official TECHNOVA 2026 Symposium Trophy and cash awards. All qualified participants receive verified digital certificates.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: STEP-BY-STEP COMPETITION PROCEDURES */}
      <section className="relative z-10 py-12 px-6 max-w-6xl mx-auto w-full space-y-8">
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
          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 space-y-3 relative">
            <span className="text-3xl font-black text-red-100 font-mono">01</span>
            <h4 className="font-bold text-zinc-900 text-sm">Sign In to Portal</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Login with your assigned Participant ID and Password provided during registration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 space-y-3 relative">
            <span className="text-3xl font-black text-red-100 font-mono">02</span>
            <h4 className="font-bold text-zinc-900 text-sm">Attempt Round 1 Quiz</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Answer 20 randomized computer science MCQs within 20 minutes under system supervision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 space-y-3 relative">
            <span className="text-3xl font-black text-red-100 font-mono">03</span>
            <h4 className="font-bold text-zinc-900 text-sm">Debug & Verify (R2)</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Debug source code in VS Code and request a coordinator to verify your terminal output.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 space-y-3 relative">
            <span className="text-3xl font-black text-red-100 font-mono">04</span>
            <h4 className="font-bold text-zinc-900 text-sm">Tech Hunt & Podium</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Solve clue stations across campus to secure your position on the live leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE LEADERBOARD PREVIEW */}
      <section className="relative z-10 py-12 px-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">LIVE RANKINGS</span>
            <h3 className="text-xl font-black text-zinc-900">Symposium Leaderboard</h3>
          </div>
          <p className="text-xs text-zinc-500 font-medium">Real-time scores verified by competition servers</p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-xs">
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-center">Round 1</th>
                  <th className="px-4 py-3 text-center">Round 2</th>
                  <th className="px-4 py-3 text-center">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {leaderboard.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50 transition font-medium">
                    <td className="px-4 py-3 font-bold text-[#DC2626]">#{row.rank}</td>
                    <td className="px-4 py-3 font-mono text-zinc-500">{row.id}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">{row.name}</td>
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
      <section className="relative z-10 py-12 px-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-widest">SUPPORT</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden transition"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-zinc-900 text-xs sm:text-sm cursor-pointer hover:bg-zinc-50"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#DC2626] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </button>
              {activeFaq === idx && (
                <div className="px-6 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto relative z-10 border-t border-zinc-200 py-10 px-8 bg-white">
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
