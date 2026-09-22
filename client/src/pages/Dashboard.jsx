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
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto animate-hero-entrance">
          {/* Welcome Banner */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover-lift">
            <div className="space-y-1.5 z-10">
              <h2 className="text-2xl font-black text-[#595959]">
                Welcome back, <span className="text-[#A30B1A]">{currentUser?.name || 'Participant'}!</span>
              </h2>
              <p className="text-xs text-[#595959] font-medium max-w-xl">
                Stay focused and complete competition modules sequentially to unlock final round qualification.
              </p>
            </div>

            <div className="flex items-center gap-3 z-10">
              {/* Participant ID Pill */}
              <div className="px-4 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl flex items-center gap-3 shadow-2xs">
                <div>
                  <p className="text-[10px] text-[#595959] uppercase tracking-wider font-bold">Participant ID</p>
                  <p className="text-xs font-mono font-bold text-[#D60303]">{currentUser?.id || 'TN2026-UNASSIGNED'}</p>
                </div>
                {currentUser?.id && (
                  <button 
                    onClick={copyParticipantId} 
                    title="Copy Participant ID"
                    className="p-1 text-[#595959] hover:text-[#D60303] transition cursor-pointer btn-interactive"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Institution Pill */}
              <div className="px-4 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl flex items-center gap-3 shadow-2xs">
                <Building2 className="w-4 h-4 text-[#595959]" />
                <div>
                  <p className="text-[10px] text-[#595959] uppercase tracking-wider font-bold">College</p>
                  <p className="text-xs font-bold text-[#595959]">{currentUser?.college || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Progress Bar */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl space-y-4 border border-[#595959] shadow-sm card-hover-lift">
            <h3 className="text-xs font-bold text-[#595959] uppercase tracking-wider">Your Progress</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Step 1: Round 1 */}
              <div 
                onClick={() => navigateToRound('round1')}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#EFEEEA] border border-[#595959] cursor-pointer hover:border-[#D60303] transition-all duration-200 card-hover-lift shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#595959] truncate">Round 1 — Tech Quiz</p>
                  <p className="text-[11px] font-bold text-[#A30B1A]">Score Recorded</p>
                  <p className="text-[11px] text-[#595959]">Score: <strong className="text-[#A30B1A]">{r1Score} pts</strong></p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#595959]" />
              </div>

              {/* Step 2: Round 2 */}
              <div 
                onClick={() => navigateToRound('round2')}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#EFEEEA] border border-[#D60303] cursor-pointer hover:border-[#A30B1A] transition-all duration-200 card-hover-lift shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D60303] text-[#EFEEEA] flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#595959] truncate">Round 2 — Debug It</p>
                  <p className="text-[11px] font-bold text-[#D60303]">Workstation</p>
                  <p className="text-[11px] text-[#595959]">Score: <strong className="text-[#D60303]">{r2Score} pts</strong></p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D60303]" />
              </div>

              {/* Step 3: Round 3 */}
              <div 
                onClick={() => navigateToRound('round3')}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#EFEEEA] border border-[#595959]/50 cursor-pointer hover:border-[#595959] transition-all duration-200 card-hover-lift"
              >
                <div className="w-10 h-10 rounded-full bg-[#595959]/20 text-[#595959] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#595959] truncate">Round 3 — Tech Hunt</p>
                  <p className="text-[11px] font-semibold text-[#595959]">Qualification Pending</p>
                  <p className="text-[11px] text-[#595959]">Unlocks after Round 2 verification</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#595959]" />
              </div>
            </div>
          </div>

          {/* Main Grid: Active Round Module (Left) & Right Sidebar Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Round 2 Debug Workspace */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-6 card-hover-lift">
                {/* Round Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#D60303] uppercase tracking-widest">ROUND 2</span>
                      <h3 className="text-lg font-bold text-[#A30B1A]">Debug It Workstation</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#D60303] text-[#EFEEEA] text-[11px] font-mono font-bold tracking-wider uppercase animate-pulse">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-[#595959] font-medium">
                  Identify syntax & logical errors, execute locally, then request coordinator physical verification.
                </p>

                {debugProblems.length === 0 ? (
                  <div className="p-8 text-center bg-[#EFEEEA] rounded-xl border border-[#595959] text-[#595959] text-xs font-medium">
                    No debugging problems are currently available.
                  </div>
                ) : (
                  <>
                    {/* Problem Selector Buttons */}
                    <div className="flex items-center gap-2 border-b border-[#595959]/20 pb-2 text-xs">
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
                              ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs'
                              : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                          }`}
                        >
                          Problem {p.id}
                        </button>
                      ))}
                    </div>

                    {currentProblem && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                        {/* Left Box: Code Viewer */}
                        <div className="bg-[#595959] rounded-xl p-4 border border-[#595959] text-[#EFEEEA] space-y-3 flex flex-col justify-between shadow-xs">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#D60303] text-[#EFEEEA] text-[11px] font-bold flex items-center justify-center">
                                  {currentProblem.id}
                                </span>
                                <span className="text-xs font-bold text-[#EFEEEA]">{currentProblem.title}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-[#A30B1A] text-[#EFEEEA] text-[10px] font-mono font-bold">
                                {currentProblem.difficulty}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#EFEEEA]/80 font-mono mb-2">Language: {currentProblem.language}</p>

                            <div className="bg-[#595959]/90 p-3 rounded-lg border border-[#EFEEEA]/20 font-mono text-[11px] leading-relaxed text-[#EFEEEA] relative overflow-x-auto max-h-48">
                              <pre>{currentProblem.brokenCode}</pre>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#EFEEEA]/20">
                            <button 
                              onClick={() => setCurrentScreen('round2')}
                              className="w-full py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>View Workstation Instructions</span>
                            </button>
                          </div>
                        </div>

                        {/* Right Box: Submission */}
                        <form onSubmit={handleUpdateSubmission} className="bg-[#EFEEEA] rounded-xl p-4 border border-[#595959] space-y-3 flex flex-col justify-between shadow-xs">
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-[#595959] flex items-center justify-between">
                              <span>Your Submission</span>
                              {submission.status === 'VERIFIED' && (
                                <span className="text-[10px] text-[#A30B1A] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> VERIFIED ({submission.marks} Marks)
                                </span>
                              )}
                            </p>

                            {/* Code Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-[#595959] mb-1">Corrected Code</label>
                              <textarea
                                rows={3}
                                value={correctedCodeInput}
                                onChange={(e) => setCorrectedCodeInput(e.target.value)}
                                className="w-full p-2 bg-[#EFEEEA] border border-[#595959] rounded-lg font-mono text-[11px] text-[#595959] focus:border-[#D60303] focus:outline-none transition-colors"
                                placeholder="// Paste your corrected solution code here..."
                              />
                            </div>

                            {/* Output Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-[#595959] mb-1">Terminal Output</label>
                              <textarea
                                rows={2}
                                value={outputInput}
                                onChange={(e) => setOutputInput(e.target.value)}
                                className="w-full p-2 bg-[#EFEEEA] border border-[#595959] rounded-lg font-mono text-[11px] text-[#595959] focus:border-[#D60303] focus:outline-none transition-colors"
                                placeholder="// Observed execution output..."
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#595959]/20">
                            <button
                              type="submit"
                              className="w-full py-2 rounded-lg bg-transparent border border-[#595959] hover:bg-[#595959] hover:text-[#EFEEEA] text-[#595959] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Update Solution</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerVerificationModal(activeProblemId)}
                              className="w-full py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs btn-interactive"
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
              <div className="bg-[#EFEEEA] p-5 rounded-2xl border border-[#595959] shadow-sm space-y-4 card-hover-lift">
                <h3 className="text-xs font-bold text-[#595959] uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#D60303]">★</span> Live Score Summary
                </h3>

                <div className="space-y-2 text-xs border-t border-[#595959]/20 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#595959] font-semibold">Round 1 Quiz Score</span>
                    <span className="font-bold text-[#A30B1A]">{r1Score} pts</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#595959] font-semibold">Round 2 Debug Score</span>
                    <span className="font-bold text-[#D60303]">{r2Score} pts</span>
                  </div>
                </div>
              </div>

              {/* Announcements Card */}
              <div className="bg-[#EFEEEA] p-5 rounded-2xl border border-[#595959] shadow-sm space-y-4 card-hover-lift">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#595959] uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#D60303]" />
                    <span>Important Announcements</span>
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {announcements.length === 0 ? (
                    <p className="text-[#595959] py-4 text-center font-medium">No announcements available.</p>
                  ) : (
                    announcements.map((a) => (
                      <div key={a.id} className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959] space-y-1 transition-all hover:border-[#D60303]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#A30B1A] text-[11px]">{a.title}</span>
                          <span className="text-[10px] text-[#595959]">{a.time}</span>
                        </div>
                        <p className="text-[11px] text-[#595959] leading-snug font-medium">{a.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Event Rules Link */}
              <div 
                onClick={() => setCurrentScreen('landing')}
                className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] hover:border-[#D60303] transition-all cursor-pointer flex items-center justify-between shadow-sm card-hover-lift"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#D60303]" />
                  <div>
                    <p className="text-xs font-bold text-[#595959]">Event Rules</p>
                    <p className="text-[11px] text-[#595959]/80 font-medium">View symposium rules & guidelines.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#595959] shrink-0" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <CoordinatorModal />
    </div>
  );
}
