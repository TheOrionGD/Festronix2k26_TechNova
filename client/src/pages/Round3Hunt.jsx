import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  Compass, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Trophy,
  Sparkles
} from 'lucide-react';

export default function Round3Hunt() {
  const { currentUser, fetchLeaderboard, setCurrentScreen, requestFullScreen, isOffline, leaderboard } = useApp();

  const [isFullscreenActive, setIsFullscreenActive] = useState(
    !!(document.fullscreenElement || document.webkitFullscreenElement)
  );

  useEffect(() => {
    requestFullScreen();

    const handleFullscreenChange = () => {
      const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreenActive(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const [currentClueData, setCurrentClueData] = useState(null);
  const [participantAnswer, setParticipantAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHuntState = async () => {
    const pid = currentUser?.id || 'TN2026-GUEST';
    try {
      const checkRes = await fetch(`${API_BASE}/hunt/current?participantId=${pid}`);
      const checkData = await checkRes.json();

      if (checkData.success && checkData.hasAttempt) {
        setIsCompleted(checkData.isCompleted || false);
        setScore(checkData.score || 0);
        setCurrentStep(checkData.currentStep || 1);
        setTotalSteps(checkData.totalSteps || 5);
        if (checkData.clue) {
          setCurrentClueData(checkData.clue);
          setHintText(checkData.clue.hint || null);
        }
        setIsLoading(false);
        return;
      }

      const startRes = await fetch(`${API_BASE}/hunt/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: pid })
      });
      const startData = await startRes.json();

      if (startData.success) {
        setCurrentStep(startData.currentStep || 1);
        setTotalSteps(startData.totalSteps || 5);
        setScore(startData.score || 0);
        setCurrentClueData(startData.clue);
        setHintText(startData.clue.hint || null);
      } else {
        setErrorMessage(startData.message || 'Unable to start Tech Hunt.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to Tech Hunt engine server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHuntState();
  }, [currentUser]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentClueData || !participantAnswer.trim()) return;

    if (isOffline) {
      setFeedbackMsg({ type: 'error', text: 'System is currently in offline synchronization phase. Connect Wi-Fi to submit.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);
    const pid = currentUser?.id || 'TN2026-GUEST';
    const clueId = currentClueData.clueId;

    try {
      const res = await fetch(`${API_BASE}/hunt/${clueId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: pid,
          answer: participantAnswer
        })
      });
      const data = await res.json();

      if (data.success && data.correct) {
        setParticipantAnswer('');
        setFeedbackMsg({ type: 'success', text: 'CORRECT! Unlocking next clue...' });
        fetchLeaderboard();

        if (data.isCompleted) {
          setIsCompleted(true);
          setScore(data.score);
        } else {
          setTimeout(() => {
            fetchHuntState();
            setFeedbackMsg(null);
          }, 1200);
        }
      } else {
        setFeedbackMsg({ type: 'error', text: 'INCORRECT ANSWER. Re-examine the station clue and try again.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network error verifying clue answer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    if (!currentClueData) return;
    const pid = currentUser?.id || 'TN2026-GUEST';
    const clueId = currentClueData.clueId;

    try {
      const res = await fetch(`${API_BASE}/hunt/${clueId}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: pid })
      });
      const data = await res.json();
      if (data.success && data.hint) {
        setHintText(data.hint);
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-5xl mx-auto space-y-6 w-full min-w-0 animate-hero-entrance">
          {/* Header Bar */}
          <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between card-hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <Compass className="w-6 h-6 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">ROUND 3</span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">TECH HUNT — SEQUENTIAL CLUE CHASE</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-white font-bold shadow-2xs">
                SCORE: {score} PTS
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-12 rounded-2xl text-center border border-zinc-200/80 dark:border-zinc-800/80">
              <p className="text-sm font-bold text-zinc-700 dark:text-[#a1a1aa]">Loading active station clue...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-8 rounded-2xl text-center space-y-4 border border-[#D60303] animate-slide-up">
              <AlertTriangle className="w-12 h-12 text-[#D60303] mx-auto" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Cannot Start Tech Hunt</h3>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium">{errorMessage}</p>
            </div>
          ) : isCompleted ? (
            <div className="space-y-6 max-w-2xl mx-auto my-8 animate-slide-up">
              {/* GAMIFIED CHAMPION TROPHY BADGE CARD */}
              <div className="gradient-border-card p-8 text-center space-y-6 shadow-2xl relative overflow-hidden bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 via-red-600 to-[#A30B1A] text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl ring-4 ring-amber-300 animate-bounce">
                  <Trophy className="w-12 h-12 text-yellow-300" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">SYMPOSIUM PODIUM FINISHER</span>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white">TECHNOVA 2026 CHAMPION</h3>
                  <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium max-w-md mx-auto">
                    Grand victory! You have solved all station clues in TECHNOVA 2026.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl inline-block shadow-sm">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block uppercase tracking-wider">Final Hunt Score</span>
                  <span className="text-4xl font-black text-[#D60303]">{score} PTS</span>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold shadow-md cursor-pointer transition btn-interactive"
                  >
                    Return to Control Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : currentClueData ? (
            <div className="space-y-6 animate-slide-up">
              {/* Clue Progress Stepper */}
              <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between card-hover-lift">
                <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-wider">
                  Sequential Progression: Clue {currentStep} of {totalSteps}
                </span>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, idx) => {
                    const stepNum = idx + 1;
                    const isPassed = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;

                    return (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all duration-300 ${
                          isPassed ? 'bg-[#A30B1A] text-white shadow-2xs' :
                          isCurrent ? 'bg-[#D60303] text-white ring-2 ring-[#D60303] shadow-md transform scale-110' :
                          'bg-zinc-100 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4 text-white" /> : isCurrent ? stepNum : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clue Card */}
              <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6 card-hover-lift">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#27272a] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#D60303] text-white font-bold text-xs rounded-full font-mono">
                      Station {currentClueData.station}
                    </span>
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-[#09090b] text-zinc-700 dark:text-[#a1a1aa] font-bold text-xs rounded-full border border-zinc-200 dark:border-[#27272a]">
                      {currentClueData.category}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] dark:text-rose-400 font-bold text-xs font-mono border border-[#A30B1A]/20">
                    {currentClueData.marks} Marks
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{currentClueData.title}</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed bg-[#F8F7F4] dark:bg-[#09090b] p-4 rounded-xl border border-zinc-200 dark:border-[#27272a]">
                    {currentClueData.clueText}
                  </p>
                </div>

                {/* Hint Box */}
                {hintText ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-slide-up">
                    <span className="font-bold text-[#D60303] block">REVEALED HINT (-2 PTS Penalty):</span>
                    <p className="font-medium">{hintText}</p>
                  </div>
                ) : currentClueData.hasHint ? (
                  <button
                    onClick={handleRequestHint}
                    className="px-4 py-2 bg-zinc-100 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-[#1a1a1e] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-interactive"
                  >
                    <HelpCircle className="w-4 h-4 text-[#D60303]" />
                    <span>Request Station Hint (-2 PTS Penalty)</span>
                  </button>
                ) : null}

                {/* Answer Form */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Enter Station Clue Answer:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={participantAnswer}
                        onChange={(e) => setParticipantAnswer(e.target.value)}
                        placeholder="Type answer..."
                        className="flex-1 p-3 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-xl text-xs font-bold text-zinc-900 dark:text-[#f4f4f5] outline-none focus:border-[#D60303] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || isOffline}
                        className={`px-6 py-3 rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer btn-interactive ${
                          isOffline 
                            ? 'bg-zinc-400 text-white cursor-not-allowed opacity-60'
                            : 'bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-white'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isOffline ? 'Offline Sync Active' : isSubmitting ? 'Submitting...' : 'Submit'}</span>
                      </button>
                    </div>
                  </div>

                  {feedbackMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-slide-up ${
                      feedbackMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                      {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{feedbackMsg.text}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Full Screen Enforcement Modal Overlay (RELAXED DURING OFFLINE SYNC STATE) */}
      {!isFullscreenActive && !isOffline && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center animate-slide-up select-none">
          <div className="max-w-md w-full bg-white dark:bg-[#141417] border-2 border-[#D60303] rounded-2xl p-6 space-y-4 text-zinc-900 dark:text-white shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#D60303]/10 text-[#D60303] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wide">FULL SCREEN REQUIRED</h3>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-medium">
              Round 3 (Tech Hunt) requires Full Screen mode for station clue solving and anti-cheat compliance.
            </p>
            <button
              onClick={() => requestFullScreen()}
              className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#C23D31] text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer btn-interactive"
            >
              ENABLE FULL SCREEN MODE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
