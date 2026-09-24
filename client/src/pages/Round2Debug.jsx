import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  Code,
  Copy,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Terminal
} from 'lucide-react';

export default function Round2Debug() {
  const { currentUser, setIsCoordinatorModalOpen, setPendingVerificationProblemId, isOffline, leaderboard } = useApp();

  const [problems, setProblems] = useState([]);
  const [currentProbIdx, setCurrentProbIdx] = useState(0);
  const [participantCode, setParticipantCode] = useState('');
  const [submissions, setSubmissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initDebug = async () => {
      const pid = currentUser?.id;
      try {
        const checkRes = await fetch(`${API_BASE}/debug/current?participantId=${pid}`);
        const checkData = await checkRes.json();

        if (checkData.success && checkData.hasAttempt) {
          setProblems(checkData.problems || []);
          setIsLoading(false);
          return;
        }

        const startRes = await fetch(`${API_BASE}/debug/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: pid })
        });
        const startData = await startRes.json();

        if (startData.success) {
          setProblems(startData.problems || []);
        } else {
          setErrorMessage(startData.message);
        }
      } catch (err) {
        console.error('Debug session init error:', err);
        setErrorMessage('Failed to connect to debug engine server.');
      } finally {
        setIsLoading(false);
      }
    };

    initDebug();
  }, [currentUser]);

  const [allDebugBank, setAllDebugBank] = useState([]);
  const [selectedBonusLang, setSelectedBonusLang] = useState('Python');

  useEffect(() => {
    const fetchAllBank = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/debug-problems`);
        const data = await res.json();
        if (data.success) {
          setAllDebugBank(data.problems || []);
        }
      } catch (err) {
        console.error('Fetch all debug bank error:', err);
      }
    };
    fetchAllBank();
  }, []);

  const currentProblem = problems[currentProbIdx];

  // Dynamic Bonus Practice Problem resolution when on Problem 4 or Bonus problem
  const displayedProblem = (currentProblem?.isBonus || currentProblem?.problemNumber === 4)
    ? (allDebugBank.find(p => p.language?.toUpperCase() === selectedBonusLang.toUpperCase() && p.isBonus) ||
      allDebugBank.find(p => p.language?.toUpperCase() === selectedBonusLang.toUpperCase()) ||
      currentProblem)
    : currentProblem;

  const handleCopyCode = () => {
    if (displayedProblem?.brokenCode) {
      navigator.clipboard.writeText(displayedProblem.brokenCode);
      alert('Broken code copied to clipboard!');
    }
  };

  const handleSubmitCode = async () => {
    if (!displayedProblem || !participantCode.trim()) {
      alert('Please enter your corrected solution code.');
      return;
    }

    if (isOffline) {
      alert('System is currently in offline synchronization phase. Connect Wi-Fi to submit.');
      return;
    }

    setIsSubmitting(true);
    const pid = currentUser?.id;
    const probId = displayedProblem.problemId;

    try {
      const res = await fetch(`${API_BASE}/debug/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: pid,
          problemId: probId,
          code: participantCode,
          output: 'Local execution output verified'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(prev => ({
          ...prev,
          [probId]: {
            code: participantCode,
            status: 'SUBMITTED',
            marks: 0
          }
        }));
        setPendingVerificationProblemId(probId);
        setIsCoordinatorModalOpen(true);
        alert('Code submitted for physical coordinator verification!');
      }
    } catch (err) {
      console.error('Submit debug code error:', err);
      alert('Error submitting debug code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subState = displayedProblem ? (submissions[displayedProblem.problemId] || { status: 'NOT_STARTED' }) : { status: 'NOT_STARTED' };

  return (
    <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-6xl mx-auto space-y-6 w-full min-w-0 animate-hero-entrance">
          {/* Header Bar */}
          <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between card-hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <Code className="w-6 h-6 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">ROUND 2</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">DEBUG IT — CODE DEBUGGING</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-white font-bold shadow-2xs">
                Assigned: {problems.length} Workstations (3 Graded + 1 Bonus Practice)
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-12 rounded-2xl text-center border border-zinc-200/80 dark:border-zinc-800/80">
              <p className="text-sm font-bold text-zinc-700 dark:text-[#a1a1aa]">Loading assigned debugging problem set...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-8 rounded-2xl text-center space-y-4 border border-[#D60303] animate-slide-up">
              <AlertTriangle className="w-12 h-12 text-[#D60303] mx-auto" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Cannot Start Round 2</h3>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium">{errorMessage}</p>
            </div>
          ) : displayedProblem ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
              {/* Problem Workspace */}
              <div className="md:col-span-3 space-y-6">
                {/* Problem Info */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#27272a] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#D60303] text-white font-mono font-bold text-xs rounded">
                        Problem #{currentProblem.problemNumber} of {currentProblem.totalProblems}
                      </span>

                      {(currentProblem?.isBonus || currentProblem?.problemNumber === 4) ? (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-mono font-bold text-[#D60303]">Select Practice Language:</label>
                          <select
                            value={selectedBonusLang}
                            onChange={(e) => setSelectedBonusLang(e.target.value)}
                            className="px-3 py-1 bg-white dark:bg-[#09090b] border-2 border-[#D60303] rounded-lg text-xs font-mono font-bold text-zinc-900 dark:text-white outline-none cursor-pointer"
                          >
                            <option value="Python">Python</option>
                            <option value="C">C Language</option>
                            <option value="Java">Java</option>
                            <option value="C++">C++</option>
                            <option value="JavaScript">JavaScript</option>
                          </select>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-zinc-100 dark:bg-[#09090b] text-zinc-700 dark:text-[#a1a1aa] font-bold text-xs rounded-full font-mono border border-zinc-200 dark:border-[#27272a]">
                          {displayedProblem.language}
                        </span>
                      )}
                    </div>

                    {(currentProblem?.isBonus || currentProblem?.problemNumber === 4) ? (
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs font-mono border border-amber-500/30">
                        ✨ BONUS PRACTICE (NON-MANDATORY)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] dark:text-rose-400 font-bold text-xs font-mono border border-[#A30B1A]/20">
                        {displayedProblem.marks || 10} Marks
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">{displayedProblem.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium leading-relaxed">{displayedProblem.description}</p>

                  {/* Broken Code Snippet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-[#D60303]" /> Broken Code Snippet ({displayedProblem.language})
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-[#D60303] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer btn-interactive shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </button>
                    </div>

                    <pre className="bg-zinc-950 p-4 rounded-xl text-xs font-mono text-[#22c55e] overflow-x-auto leading-relaxed border border-zinc-800 shadow-inner">
                      {displayedProblem.brokenCode}
                    </pre>
                  </div>

                  {/* Expected Output */}
                  {displayedProblem.expectedOutput && (
                    <div className="p-3 bg-zinc-100 dark:bg-[#09090b] rounded-xl text-xs text-zinc-700 dark:text-zinc-300 font-mono border border-zinc-200 dark:border-[#27272a]">
                      <span className="font-bold text-[#D60303] block mb-0.5">Expected Output:</span>
                      <code>{displayedProblem.expectedOutput}</code>
                    </div>
                  )}

                  {/* Corrected Code Textarea */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Paste Your Debugged / Corrected Code:
                    </label>
                    <textarea
                      rows={6}
                      value={participantCode}
                      onChange={(e) => setParticipantCode(e.target.value)}
                      placeholder="Paste your working, debugged code here after running it locally..."
                      className="w-full p-4 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-xl text-xs font-mono text-zinc-900 dark:text-[#f4f4f5] outline-none focus:border-[#D60303] transition-colors"
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-[#27272a]">
                    <div className="flex items-center gap-2">
                      {subState.status === 'VERIFIED' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" /> VERIFIED & LOCKED ({subState.marks} Marks)
                        </span>
                      ) : subState.status === 'SUBMITTED' ? (
                        <span className="px-3 py-1 rounded-full bg-[#C23D31] text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                          <Clock className="w-4 h-4" /> WAITING PHYSICAL COORDINATOR VERIFICATION
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">Status: WORK IN PROGRESS</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const targetProbId = displayedProblem?.problemId || (currentProbIdx + 1);
                          setPendingVerificationProblemId(targetProbId);
                          setIsCoordinatorModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer btn-interactive"
                      >
                        <Award className="w-4 h-4" />
                        <span>Request Verification</span>
                      </button>

                      <button
                        onClick={handleSubmitCode}
                        disabled={isSubmitting || subState.status === 'VERIFIED' || isOffline}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer btn-interactive ${isOffline
                            ? 'bg-zinc-400 text-white cursor-not-allowed opacity-60'
                            : 'bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-white'
                          }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isOffline ? 'Offline Sync Active' : isSubmitting ? 'Submitting...' : 'Submit Code'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Selector */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">Debug Problem Selector</h4>

                  <div className="space-y-2">
                    {problems.map((p, idx) => {
                      const isCurrent = idx === currentProbIdx;
                      const isBonus = idx === 3 || p.isBonus;
                      return (
                        <button
                          key={p.problemId}
                          onClick={() => {
                            setCurrentProbIdx(idx);
                            setParticipantCode(submissions[p.problemId]?.code);
                          }}
                          className={`w-full p-3 rounded-xl text-left text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer btn-interactive ${isCurrent
                              ? 'bg-[#D60303] text-white shadow-sm transform translate-x-1'
                              : 'bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-[#1a1a1e]'
                            }`}
                        >
                          <span>Problem #{p.problemNumber} {isBonus ? '(Bonus Practice)' : `(${p.language})`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Leaderboard Standings Panel */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3 card-hover-lift">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> Live Debug Rank
                  </h4>
                  {leaderboard && leaderboard.length > 0 ? (
                    <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
                      {leaderboard.slice(0, 5).map((item, index) => (
                        <div key={item.id || index} className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-[#09090b]">
                          <span className="truncate font-medium">{index + 1}. {item.name || item.id}</span>
                          <span className="font-bold text-[#D60303]">{item.totalScore || 0} pts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">Live scores syncing...</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
