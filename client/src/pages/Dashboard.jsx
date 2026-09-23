import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CoordinatorModal from '../components/CoordinatorModal';
import { 
  Copy, 
  Building2, 
  CheckCircle2, 
  Lock, 
  FileCode2, 
  BookOpen, 
  Send, 
  Megaphone, 
  FileText, 
  ChevronRight,
  Award
} from 'lucide-react';

export default function Dashboard() {
  const { 
    currentUser, 
    setCurrentScreen, 
    navigateToRound,
    debugSubmissions, 
    submitDebugCode,
    setIsCoordinatorModalOpen,
    setPendingVerificationProblemId,
    announcements,
    debugProblems,
    leaderboard
  } = useApp();

  const userLeaderboardEntry = leaderboard.find(l => l.id === currentUser?.id) || {};
  const r1Score = userLeaderboardEntry.r1 || 0;
  const r2Score = userLeaderboardEntry.r2 || 0;

  const [activeProblemId, setActiveProblemId] = useState(1);
  const currentProblem = debugProblems.find(p => p.id === activeProblemId) || debugProblems[0];
  const submission = debugSubmissions[activeProblemId] || {};

  const [correctedCodeInput, setCorrectedCodeInput] = useState(submission.code || '');
  const [outputInput, setOutputInput] = useState(submission.output || '');

  const handleUpdateSubmission = (e) => {
    e.preventDefault();
    if (!currentProblem) return;
    submitDebugCode(activeProblemId, correctedCodeInput, outputInput);
    alert('Submission updated! Now request physical coordinator verification.');
  };

  const triggerVerificationModal = (probId) => {
    setPendingVerificationProblemId(probId);
    setIsCoordinatorModalOpen(true);
  };

  const copyParticipantId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      alert(`Copied ID: ${currentUser.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full min-w-0 animate-hero-entrance">
          {/* Welcome Banner */}
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-[#595959]/30 dark:border-[#27272a] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover-lift">
            <div className="space-y-1.5 z-10">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Welcome back, <span className="text-[#D60303]">{currentUser?.name || 'Participant'}!</span>
              </h2>
              <p className="text-xs text-[#595959] dark:text-[#a1a1aa] font-medium max-w-xl">
                Stay focused and complete competition modules sequentially to unlock final round qualification.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              {/* Participant ID Pill */}
              <div className="px-4 py-2 bg-[#EFEEEA] dark:bg-[#09090b] border border-[#595959]/30 dark:border-[#27272a] rounded-xl flex items-center gap-3 shadow-2xs">
                <div>
                  <p className="text-[10px] text-[#595959] dark:text-[#71717a] uppercase tracking-wider font-bold font-mono">Participant ID</p>
                  <p className="text-xs font-mono font-bold text-[#D60303]">{currentUser?.id || 'TN2026-UNASSIGNED'}</p>
                </div>
                {currentUser?.id && (
                  <button 
                    onClick={copyParticipantId} 
                    title="Copy Participant ID"
                    className="p-1 text-[#595959] dark:text-[#a1a1aa] hover:text-[#D60303] transition cursor-pointer btn-interactive"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Institution Pill */}
              <div className="px-4 py-2 bg-[#EFEEEA] dark:bg-[#09090b] border border-[#595959]/30 dark:border-[#27272a] rounded-xl flex items-center gap-3 shadow-2xs">
                <Building2 className="w-4 h-4 text-[#D60303]" />
                <div>
                  <p className="text-[10px] text-[#595959] dark:text-[#71717a] uppercase tracking-wider font-bold font-mono">College</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">{currentUser?.college || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Progress Bar */}
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl space-y-4 border border-[#595959]/30 dark:border-[#27272a] shadow-sm card-hover-lift">
            <h3 className="text-xs font-bold text-[#595959] dark:text-[#a1a1aa] uppercase tracking-wider font-mono">Your Progress</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Step 1: Round 1 */}
              <div 
                onClick={() => navigateToRound('round1')}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#09090b] border border-[#595959]/30 dark:border-[#27272a] cursor-pointer hover:border-[#D60303] transition-all duration-200 card-hover-lift shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] dark:text-[#ef4444] flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">Round 1 — Tech Quiz</p>
                  <p className="text-[11px] font-bold text-[#A30B1A] dark:text-[#ef4444]">Score Recorded</p>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">Score: <strong className="text-[#A30B1A] dark:text-[#ef4444]">{r1Score} pts</strong></p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#595959] dark:text-[#71717a]" />
              </div>

              {/* Step 2: Round 2 */}
              <div 
                onClick={() => navigateToRound('round2')}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#09090b] border border-[#D60303] cursor-pointer hover:border-[#A30B1A] transition-all duration-200 card-hover-lift shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D60303] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">Round 2 — Debug It</p>
                  <p className="text-[11px] font-bold text-[#D60303]">Workstation</p>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">Score: <strong className="text-[#D60303]">{r2Score} pts</strong></p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D60303]" />
              </div>

              {/* Step 3: Round 3 */}
              <div 
                onClick={() => navigateToRound('round3')}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] cursor-pointer hover:border-[#595959] transition-all duration-200 card-hover-lift"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-[#27272a] text-zinc-600 dark:text-[#a1a1aa] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">Round 3 — Tech Hunt</p>
                  <p className="text-[11px] font-semibold text-zinc-500 dark:text-[#71717a]">Qualification Pending</p>
                  <p className="text-[11px] text-zinc-500 dark:text-[#71717a]">Unlocks after Round 2 verification</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Main Grid: Active Round Module (Left) & Right Sidebar Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Round 2 Debug Workspace */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-[#595959]/30 dark:border-[#27272a] shadow-sm space-y-6 card-hover-lift">
                {/* Round Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#D60303] uppercase tracking-widest font-mono">ROUND 2</span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Debug It Workstation</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#D60303] text-white text-[11px] font-mono font-bold tracking-wider uppercase animate-pulse">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-[#595959] dark:text-[#a1a1aa] font-medium">
                  Identify syntax & logical errors, execute locally, then request coordinator physical verification.
                </p>

                {debugProblems.length === 0 ? (
                  <div className="p-8 text-center bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] text-[#595959] dark:text-[#a1a1aa] text-xs font-medium">
                    No debugging problems are currently available.
                  </div>
                ) : (
                  <>
                    {/* Problem Selector Buttons */}
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-[#27272a] pb-2 text-xs">
                      {debugProblems.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProblemId(p.id);
                            setCorrectedCodeInput(debugSubmissions[p.id]?.code || '');
                            setOutputInput(debugSubmissions[p.id]?.output || '');
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer btn-interactive ${
                            activeProblemId === p.id 
                              ? 'bg-[#D60303] text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-[#1a1a1e]'
                          }`}
                        >
                          Problem {p.id}
                        </button>
                      ))}
                    </div>

                    {currentProblem && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                        {/* Left Box: Code Viewer */}
                        <div className="bg-[#18181b] dark:bg-[#09090b] rounded-xl p-4 border border-zinc-700 dark:border-[#27272a] text-white space-y-3 flex flex-col justify-between shadow-xs">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#D60303] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                                  {currentProblem.id}
                                </span>
                                <span className="text-xs font-bold text-white">{currentProblem.title}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-[#A30B1A] text-white text-[10px] font-mono font-bold">
                                {currentProblem.difficulty}
                              </span>
                            </div>

                            <p className="text-[11px] text-zinc-400 font-mono mb-2">Language: {currentProblem.language}</p>

                            <div className="bg-black/80 p-3 rounded-lg border border-zinc-700 dark:border-[#27272a] font-mono text-[11px] leading-relaxed text-[#22c55e] relative overflow-x-auto max-h-48">
                              <pre>{currentProblem.brokenCode}</pre>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-zinc-700 dark:border-[#27272a]">
                            <button 
                              onClick={() => setCurrentScreen('round2')}
                              className="w-full py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>View Workstation Instructions</span>
                            </button>
                          </div>
                        </div>

                        {/* Right Box: Submission */}
                        <form onSubmit={handleUpdateSubmission} className="bg-white dark:bg-[#09090b] rounded-xl p-4 border border-zinc-200 dark:border-[#27272a] space-y-3 flex flex-col justify-between shadow-xs">
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                              <span>Your Submission</span>
                              {submission.status === 'VERIFIED' && (
                                <span className="text-[10px] text-emerald-600 dark:text-[#22c55e] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> VERIFIED ({submission.marks} Marks)
                                </span>
                              )}
                            </p>

                            {/* Code Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Corrected Code</label>
                              <textarea
                                rows={3}
                                value={correctedCodeInput}
                                onChange={(e) => setCorrectedCodeInput(e.target.value)}
                                className="w-full p-2 bg-[#F8F7F4] dark:bg-[#141417] border border-zinc-300 dark:border-[#27272a] rounded-lg font-mono text-[11px] text-zinc-900 dark:text-[#f4f4f5] focus:border-[#D60303] focus:outline-none transition-colors"
                                placeholder="// Paste your corrected solution code here..."
                              />
                            </div>

                            {/* Output Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Terminal Output</label>
                              <textarea
                                rows={2}
                                value={outputInput}
                                onChange={(e) => setOutputInput(e.target.value)}
                                className="w-full p-2 bg-[#F8F7F4] dark:bg-[#141417] border border-zinc-300 dark:border-[#27272a] rounded-lg font-mono text-[11px] text-zinc-900 dark:text-[#f4f4f5] focus:border-[#D60303] focus:outline-none transition-colors"
                                placeholder="// Observed execution output..."
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-[#27272a]">
                            <button
                              type="submit"
                              className="w-full py-2 rounded-lg bg-zinc-100 dark:bg-[#141417] border border-zinc-300 dark:border-[#27272a] hover:bg-zinc-200 dark:hover:bg-[#1a1a1e] text-zinc-900 dark:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive"
                            >
                              <Send className="w-3.5 h-3.5 text-[#D60303]" />
                              <span>Update Solution</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerVerificationModal(activeProblemId)}
                              className="w-full py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs btn-interactive"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Call Coordinator to Verify</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Quick Stats & Announcements */}
            <div className="space-y-6">
              {/* Quick Stats Card */}
              <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                  <span className="text-[#D60303]">★</span> Live Score Summary
                </h3>

                <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-[#27272a] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#595959] dark:text-[#a1a1aa] font-semibold">Round 1 Quiz Score</span>
                    <span className="font-bold text-[#A30B1A] dark:text-[#ef4444] font-mono">{r1Score} pts</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#595959] dark:text-[#a1a1aa] font-semibold">Round 2 Debug Score</span>
                    <span className="font-bold text-[#D60303] font-mono">{r2Score} pts</span>
                  </div>
                </div>
              </div>

              {/* Announcements Card */}
              <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Megaphone className="w-4 h-4 text-[#D60303]" />
                    <span>Important Announcements</span>
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {announcements.length === 0 ? (
                    <p className="text-[#595959] dark:text-[#71717a] py-4 text-center font-medium">No announcements available.</p>
                  ) : (
                    announcements.map((a) => (
                      <div key={a.id} className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-1 transition-all hover:border-[#D60303]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#A30B1A] dark:text-[#ef4444] text-[11px]">{a.title}</span>
                          <span className="text-[10px] text-[#595959] dark:text-[#71717a] font-mono">{a.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-700 dark:text-[#a1a1aa] leading-snug font-medium">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Event Rules Link */}
              <div 
                onClick={() => setCurrentScreen('landing')}
                className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] hover:border-[#D60303] transition-all cursor-pointer flex items-center justify-between shadow-sm card-hover-lift"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#D60303]" />
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">Event Rules</p>
                    <p className="text-[11px] text-[#595959] dark:text-[#71717a] font-medium">View symposium rules & guidelines.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#595959] dark:text-[#71717a] shrink-0" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <CoordinatorModal />
    </div>
  );
}
