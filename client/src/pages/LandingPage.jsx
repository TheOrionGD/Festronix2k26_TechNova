import React from 'react';
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
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const { setCurrentScreen, leaderboard, eventState } = useApp();

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      {/* Top Navigation */}
      <nav className="h-20 border-b border-[#595959]/30 px-8 flex items-center justify-between sticky top-0 z-40 bg-[#EFEEEA]/95 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen('splash')}>
          <div className="w-10 h-10 rounded-xl bg-[#D60303] flex items-center justify-center shadow-md">
            <Code2 className="w-5 h-5 text-[#EFEEEA]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#595959] flex items-center gap-2">
              TECHNOVA <span className="text-[#D60303] text-xs font-mono">2026</span>
            </h1>
            <p className="text-[11px] text-[#595959]/80 font-semibold">Decode • Debug • Discover</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-5 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-14 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C23D31]/10 border border-[#C23D31]/30 text-[#A30B1A] text-xs font-bold">
          <Sparkles className="w-4 h-4 text-[#D60303] animate-pulse" />
          <span>Annual Technical Symposium Competition Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-[#595959]">
          The Ultimate Technical Competition <br />
          <span className="text-gradient">DECODE • DEBUG • DISCOVER</span>
        </h1>

        <p className="text-sm md:text-base text-[#595959] max-w-2xl mx-auto leading-relaxed font-medium">
          A controlled multi-stage tournament engineered to test broad computer science mastery, rapid debugging skills in local environments, and technical clue progression.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-8 py-3.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-sm shadow-lg transition flex items-center gap-3 cursor-pointer"
          >
            <span>Enter Competition Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Live Event Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
          <div className="bg-[#EFEEEA] p-5 rounded-2xl text-center space-y-1 border border-[#595959] shadow-sm">
            <Users className="w-5 h-5 text-[#D60303] mx-auto" />
            <p className="text-2xl font-black text-[#A30B1A]">{eventState.registrationCount || leaderboard.length}</p>
            <p className="text-xs text-[#595959] font-semibold">Registered Participants</p>
          </div>
          <div className="bg-[#EFEEEA] p-5 rounded-2xl text-center space-y-1 border border-[#595959] shadow-sm">
            <Brain className="w-5 h-5 text-[#C23D31] mx-auto" />
            <p className="text-2xl font-black text-[#A30B1A]">Top {eventState.round1QualifyCount}</p>
            <p className="text-xs text-[#595959] font-semibold">Round 1 Qualifiers</p>
          </div>
          <div className="bg-[#EFEEEA] p-5 rounded-2xl text-center space-y-1 border border-[#595959] shadow-sm">
            <Terminal className="w-5 h-5 text-[#A30B1A] mx-auto" />
            <p className="text-2xl font-black text-[#A30B1A]">Top {eventState.round2QualifyCount}</p>
            <p className="text-xs text-[#595959] font-semibold">Round 2 Finalists</p>
          </div>
          <div className="bg-[#EFEEEA] p-5 rounded-2xl text-center space-y-1 border border-[#595959] shadow-sm">
            <Trophy className="w-5 h-5 text-[#D60303] mx-auto" />
            <p className="text-2xl font-black text-[#A30B1A]">{eventState.status}</p>
            <p className="text-xs text-[#595959] font-semibold">Event Status</p>
          </div>
        </div>
      </header>

      {/* The 3 Competition Rounds */}
      <section className="py-14 px-6 max-w-6xl mx-auto space-y-10 w-full">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#595959]">
            Symposium Round Pipeline
          </h2>
          <p className="text-xs text-[#595959] max-w-xl mx-auto font-medium">
            Participants must qualify sequentially through backend verification to unlock subsequent rounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Round 1 Card */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl space-y-4 border border-[#595959] border-l-4 border-l-[#D60303] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">ROUND 1</span>
              <h3 className="text-lg font-bold text-[#A30B1A]">TECH QUIZ</h3>
              <p className="text-xs text-[#595959] mt-1 font-medium">
                Randomized questions across CS domains. Timed with anti-cheat monitoring.
              </p>
            </div>
            <div className="pt-4 border-t border-[#595959]/20 text-xs text-[#595959] space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D60303]" />
                <span>Format: MCQs</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D60303]" />
                <span>Time Limit: {eventState.round1DurationMinutes} Mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#D60303]" />
                <span>Qualification: Top {eventState.round1QualifyCount}</span>
              </div>
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl space-y-4 border border-[#595959] border-l-4 border-l-[#C23D31] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#C23D31]/10 text-[#C23D31] flex items-center justify-center font-bold">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C23D31] uppercase tracking-widest">ROUND 2</span>
              <h3 className="text-lg font-bold text-[#A30B1A]">DEBUG IT</h3>
              <p className="text-xs text-[#595959] mt-1 font-medium">
                Broken code challenges. Debug locally, then request physical coordinator verification.
              </p>
            </div>
            <div className="pt-4 border-t border-[#595959]/20 text-xs text-[#595959] space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C23D31]" />
                <span>Local execution in VS Code</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C23D31]" />
                <span>Physical Coordinator Signoff</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#C23D31]" />
                <span>Qualification: Top {eventState.round2QualifyCount}</span>
              </div>
            </div>
          </div>

          {/* Round 3 Card */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl space-y-4 border border-[#595959] border-l-4 border-l-[#A30B1A] shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#A30B1A]/10 text-[#A30B1A] flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-widest">ROUND 3</span>
              <h3 className="text-lg font-bold text-[#A30B1A]">TECH HUNT</h3>
              <p className="text-xs text-[#595959] mt-1 font-medium">
                Technical clue stations. Solve complex riddles to reach the final leaderboard.
              </p>
            </div>
            <div className="pt-4 border-t border-[#595959]/20 text-xs text-[#595959] space-y-2 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A30B1A]" />
                <span>{eventState.round3StationCount} Clue Stations</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A30B1A]" />
                <span>Station Route Solver</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#A30B1A]" />
                <span>Final Symposium Podium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Leaderboard Section */}
      <section className="py-12 px-6 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#595959]">Live Leaderboard</h3>
          <p className="text-xs text-[#595959]/80 font-medium">Current top performers across all verified rounds</p>
        </div>

        <div className="bg-[#EFEEEA] rounded-2xl overflow-hidden border border-[#595959] shadow-sm">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-[#595959] text-xs font-medium">
              No participant scores recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#595959] text-[#EFEEEA] font-mono">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Participant ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-center">Round 1</th>
                  <th className="px-4 py-3 text-center">Round 2</th>
                  <th className="px-4 py-3 text-center">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#595959]/20 text-[#595959]">
                {leaderboard.map((row) => (
                  <tr key={row.id} className="hover:bg-[#595959]/5 transition font-medium">
                    <td className="px-4 py-3 font-bold text-[#D60303]">#{row.rank}</td>
                    <td className="px-4 py-3 font-mono text-[#595959]">{row.id}</td>
                    <td className="px-4 py-3 font-semibold">{row.name}</td>
                    <td className="px-4 py-3 text-center text-[#A30B1A] font-bold">{row.r1}</td>
                    <td className="px-4 py-3 text-center text-[#C23D31] font-bold">{row.r2}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#D60303]">{row.total} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#595959]/30 py-8 px-8 text-center text-xs text-[#595959] font-medium">
        <p>TECHNOVA 2026 — Technical Symposium Competition & Management Platform</p>
      </footer>
    </div>
  );
}
