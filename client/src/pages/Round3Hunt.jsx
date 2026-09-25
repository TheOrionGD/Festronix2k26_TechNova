import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
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
  Sparkles,
  SkipForward,
  Clock,
  ArrowLeft
} from 'lucide-react';

export default function Round3Hunt() {
  const { 
    currentUser, 
    fetchLeaderboard, 
    setCurrentScreen, 
    requestFullScreen, 
    isOffline, 
    leaderboard, 
    isRoundUnlocked,
    isRoundCompletedByUser,
    markRoundCompletedByUser,
    eventState,
    warningCount,
    isOfflineReconnectionEligible,
    isDisqualified,
    roundTimeLeft,
    formatRoundTime
  } = useApp();

  const [isFullscreenActive, setIsFullscreenActive] = useState(
    !!(document.fullscreenElement || document.webkitFullscreenElement)
  );

  useEffect(() => {
    if (typeof requestFullScreen === 'function') {
      requestFullScreen();
    }

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
  }, [requestFullScreen]);

  const [currentClueData, setCurrentClueData] = useState(null);
  const [participantAnswer, setParticipantAnswer] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5);
  const [selectedClueIds, setSelectedClueIds] = useState([]);
  const [solvedClueIds, setSolvedClueIds] = useState([]);
  const [skippedClueIds, setSkippedClueIds] = useState([]);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintText, setHintText] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [gradingStatus, setGradingStatus] = useState(null);

  const fetchHuntState = React.useCallback(async () => {
    const pid = currentUser?.id;
    try {
      const checkRes = await fetch(`${API_BASE}/hunt/current?participantId=${pid}`);
      const checkData = await checkRes.json();

      if (checkData.success && checkData.hasAttempt) {
        setIsCompleted(checkData.isCompleted || false);
        if (checkData.isCompleted) {
          markRoundCompletedByUser(3);
        }
        setScore(checkData.score || 0);
        setCurrentStep(checkData.currentStep || 1);
        setTotalSteps(checkData.totalSteps || 5);
        setSelectedClueIds(checkData.selectedClueIds || []);
        setSolvedClueIds(checkData.solvedClueIds || []);
        setSkippedClueIds(checkData.skippedClueIds || []);
        if (checkData.gradingStatus) {
          setGradingStatus(checkData.gradingStatus);
        }
        if (checkData.clue) {
          setCurrentClueData(checkData.clue);
          setHintText(checkData.clue.hint);
        } else {
          setCurrentClueData(null);
          setHintText(null);
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
        setSelectedClueIds(startData.selectedClueIds || []);
        setSolvedClueIds(startData.solvedClueIds || []);
        setSkippedClueIds(startData.skippedClueIds || []);
        setScore(startData.score || 0);
        setIsCompleted(startData.isCompleted || false);
        if (startData.isCompleted) {
          markRoundCompletedByUser(3);
        }
        if (startData.gradingStatus) {
          setGradingStatus(startData.gradingStatus);
        }
        if (startData.clue) {
          setCurrentClueData(startData.clue);
          setHintText(startData.clue.hint);
        } else {
          setCurrentClueData(null);
          setHintText(null);
        }
      } else {
        setErrorMessage(startData.message);
      }
    } catch (err) {
      console.error('Fetch hunt state error:', err);
      setErrorMessage('Failed to connect to Tech Hunt engine server.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchHuntState();
    });
  }, [fetchHuntState]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentClueData || !participantAnswer.trim()) return;

    if (isOffline) {
      setFeedbackMsg({ type: 'error', text: 'System is currently in offline synchronization phase. Connect Wi-Fi to submit.' });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);
    const pid = currentUser?.id;
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
        setFeedbackMsg({ type: 'success', text: 'CORRECT! Station solved. Unlocking next clue...' });
        fetchLeaderboard();

        if (data.isCompleted) {
          setIsCompleted(true);
          markRoundCompletedByUser(3);
          setScore(data.score);
          if (data.solvedClueIds) setSolvedClueIds(data.solvedClueIds);
          if (data.skippedClueIds) setSkippedClueIds(data.skippedClueIds);
        } else {
          setTimeout(() => {
            fetchHuntState();
            setFeedbackMsg(null);
          }, 1200);
        }
      } else {
        setFeedbackMsg({ 
          type: 'error', 
          text: data.message || 'INCORRECT ANSWER. Re-examine the station clue and try again, or skip to move to the next station.' 
        });
      }
    } catch (err) {
      console.error('Submit clue error:', err);
      setFeedbackMsg({ type: 'error', text: 'Network error verifying clue answer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipStation = async () => {
    if (!currentClueData || isSkipping) return;

    if (isOffline) {
      setFeedbackMsg({ type: 'error', text: 'System is currently in offline synchronization phase. Connect Wi-Fi to skip.' });
      return;
    }

    setIsSkipping(true);
    setFeedbackMsg(null);
    const pid = currentUser?.id;
    const clueId = currentClueData.clueId;

    try {
      const res = await fetch(`${API_BASE}/hunt/${clueId}/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: pid })
      });
      const data = await res.json();

      if (data.success) {
        setParticipantAnswer('');
        setShowSkipModal(false);
        setFeedbackMsg({ type: 'warning', text: 'Station skipped (0 pts). Advancing to next clue...' });
        fetchLeaderboard();

        if (data.isCompleted) {
          setIsCompleted(true);
          markRoundCompletedByUser(3);
          setScore(data.score);
          if (data.solvedClueIds) setSolvedClueIds(data.solvedClueIds);
          if (data.skippedClueIds) setSkippedClueIds(data.skippedClueIds);
        } else {
          setTimeout(() => {
            fetchHuntState();
            setFeedbackMsg(null);
          }, 1000);
        }
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Failed to skip station.' });
      }
    } catch (err) {
      console.error('Skip station error:', err);
      setFeedbackMsg({ type: 'error', text: 'Network error processing station skip.' });
    } finally {
      setIsSkipping(false);
    }
  };

  const handleRequestHint = async () => {
    if (!currentClueData) return;
    const pid = currentUser?.id;
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
    } catch (err) {
      console.error('Request hint error:', err);
    }
  };

  if (isRoundCompletedByUser(3)) {
    return (
      <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-8 rounded-3xl border border-emerald-500/50 shadow-2xl max-w-lg w-full text-center space-y-5 animate-slide-up card-border-glow">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest block">
                  ROUND 3 COMPLETE & LOCKED
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Tech Hunt Course Concluded
                </h2>
                <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
                  You have completed Round 3 (Tech Hunt). In accordance with competition regulations, completed rounds cannot be re-entered.
                </p>
              </div>

              <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Round 3 Score:</span>
                  <span className="font-bold text-emerald-600">{currentUser?.round3Score ?? score ?? 0} / 50 pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Grading Status:</span>
                  <span className="font-bold capitalize">{gradingStatus || (currentUser?.isRound3Graded ? 'Graded' : 'Non-Graded')}</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md btn-interactive"
              >
                <span>Return to Participant Dashboard</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isRoundUnlocked(3)) {
    return (
      <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-8 rounded-3xl border border-red-500/50 shadow-2xl max-w-lg w-full text-center space-y-5 animate-slide-up card-border-glow">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border-2 border-red-500/40 text-[#D60303] flex items-center justify-center shadow-lg shadow-red-500/10 mx-auto animate-pulse">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest block">
                  ROUND 3 IS CURRENTLY LOCKED
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Campus Tech Hunt Inactive
                </h2>
                <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
                  This workstation is locked. Please wait for the Lab Coordinator to initiate Round 3 from their control portal.
                </p>
              </div>

              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Current Status: <span className="text-red-500 font-bold">{eventState?.status || 'REGISTRATION'}</span>
              </div>

              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md btn-interactive"
              >
                <span>Return to Participant Dashboard</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              {/* Grading Status Badge */}
              {gradingStatus && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                  gradingStatus === 'graded'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                }`}>
                  {gradingStatus === 'graded' ? '✓ Graded Official' : '◎ Non-Graded'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#D60303] hover:text-white text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs btn-interactive"
                title="Return to Participant Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold shadow-xs">
                <Clock className={`w-3.5 h-3.5 ${roundTimeLeft < 300 ? 'text-[#D60303] animate-pulse' : 'text-[#D60303]'}`} />
                <span className={roundTimeLeft < 300 ? 'text-[#D60303] font-black animate-bounce' : 'text-zinc-800 dark:text-zinc-100'}>
                  {formatRoundTime(roundTimeLeft)}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${warningCount > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'}`}>
                Warnings: {warningCount || 0}/3
              </span>
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-white font-bold shadow-2xs">
                SCORE: {score} PTS
              </span>
            </div>
          </div>

          {/* Non-Graded Info Banner */}
          {gradingStatus === 'non_graded' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 animate-slide-up">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Non-Graded Participation:</strong> You are participating in Round 3 for experience. You can explore, solve, or skip station clues, but your score will not alter the official tournament leaderboard or rankings.
              </p>
            </div>
          )}

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
              {/* GAMIFIED PODIUM COMPLETION CARD */}
              <div className="gradient-border-card p-8 text-center space-y-6 shadow-2xl relative overflow-hidden bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md">
                <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 via-red-600 to-[#A30B1A] text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl ring-4 ring-amber-300 animate-bounce">
                  <Trophy className="w-12 h-12 text-yellow-300" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>ROUND 3 TECH HUNT COMPLETED</span>
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  </span>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white">
                    {solvedClueIds.length === totalSteps ? 'ALL STATIONS SOLVED!' : 'TECH HUNT COURSE FINISHED'}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium max-w-md mx-auto">
                    {solvedClueIds.length === totalSteps 
                      ? 'Flawless performance! You successfully solved all station clues in TECHNOVA 2026.'
                      : `You have completed your journey through all ${totalSteps} stations of the Tech Hunt.`}
                  </p>
                </div>

                {/* Score & Progression Summary Badges */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm min-w-[140px]">
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold block uppercase tracking-wider">Final Hunt Score</span>
                    <span className="text-3xl font-black text-[#D60303]">{score} PTS</span>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm min-w-[120px]">
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block uppercase tracking-wider">Stations Solved</span>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{solvedClueIds.length} / {totalSteps}</span>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm min-w-[120px]">
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold block uppercase tracking-wider">Stations Skipped</span>
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{skippedClueIds.length} / {totalSteps}</span>
                  </div>
                </div>

                {/* Contestant Official Performance Scorecard (Private, no public leaderboard for participants) */}
                <div className="p-4 bg-zinc-50 dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-[#27272a] text-left space-y-2.5 font-mono text-xs">
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Contestant Performance Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Round 1</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">{currentUser?.round1Score ?? 0} / 20</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Round 2</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">{currentUser?.round2Score ?? 0} / 30</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Round 3</div>
                      <div className="text-sm font-bold text-[#D60303]">{currentUser?.round3Score ?? score ?? 0} / 50</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center">
                      <div className="text-[10px] text-red-600 uppercase font-bold">Total</div>
                      <div className="text-sm font-black text-[#D60303]">{(currentUser?.round1Score ?? 0) + (currentUser?.round2Score ?? 0) + (currentUser?.round3Score ?? score ?? 0)} / 100</div>
                    </div>
                  </div>
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
              <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-hover-lift">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-wider">
                    Station {currentStep} of {totalSteps}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    ({solvedClueIds.length} solved, {skippedClueIds.length} skipped)
                  </span>
                </div>

                {/* Visual Step Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from({ length: totalSteps }).map((_, idx) => {
                    const stepNum = idx + 1;
                    const stepClueId = selectedClueIds[idx];
                    const isSolved = stepClueId ? solvedClueIds.includes(stepClueId) : (stepNum < currentStep);
                    const isSkipped = stepClueId ? skippedClueIds.includes(stepClueId) : false;
                    const isCurrent = stepNum === currentStep;

                    let badgeClasses = 'bg-zinc-100 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-400';
                    let titleText = `Station ${stepNum}: Locked`;

                    if (isSolved) {
                      badgeClasses = 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-500';
                      titleText = `Station ${stepNum}: Solved (+Marks)`;
                    } else if (isSkipped) {
                      badgeClasses = 'bg-amber-600/90 text-white shadow-2xs ring-1 ring-amber-500';
                      titleText = `Station ${stepNum}: Skipped (0 Marks)`;
                    } else if (isCurrent) {
                      badgeClasses = 'bg-[#D60303] text-white ring-2 ring-[#D60303] shadow-md transform scale-110';
                      titleText = `Station ${stepNum}: Active`;
                    }

                    return (
                      <div
                        key={idx}
                        title={titleText}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all duration-300 ${badgeClasses}`}
                      >
                        {isSolved ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : isSkipped ? (
                          <SkipForward className="w-3.5 h-3.5 text-white" />
                        ) : isCurrent ? (
                          stepNum
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        )}
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

                {/* Hint Section */}
                {hintText ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-slide-up">
                    <span className="font-bold text-[#D60303] block text-[11px] uppercase tracking-wide">REVEALED HINT (-2 PTS Penalty):</span>
                    <p className="font-medium">{hintText}</p>
                  </div>
                ) : currentClueData.hasHint ? (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    className="px-4 py-2 bg-zinc-100 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-[#1a1a1e] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer btn-interactive transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-[#D60303]" />
                    <span>Request Station Hint (-2 PTS Penalty)</span>
                  </button>
                ) : null}

                {/* Answer Form & Actions */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Enter Station Clue Answer:
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        required
                        value={participantAnswer}
                        onChange={(e) => setParticipantAnswer(e.target.value)}
                        placeholder="Type clue answer..."
                        disabled={isSubmitting || isSkipping}
                        className="flex-1 p-3 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-xl text-xs font-bold text-zinc-900 dark:text-[#f4f4f5] outline-none focus:border-[#D60303] transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || isSkipping || isOffline}
                        className={`px-6 py-3 rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive ${
                          isOffline 
                            ? 'bg-zinc-400 text-white cursor-not-allowed opacity-60'
                            : 'bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-white'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>{isOffline ? 'Offline Sync Active' : isSubmitting ? 'Submitting...' : 'Submit Answer'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Banner */}
                  {feedbackMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-slide-up ${
                      feedbackMsg.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                        : feedbackMsg.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                      {feedbackMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : feedbackMsg.type === 'warning' ? (
                        <SkipForward className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{feedbackMsg.text}</span>
                    </div>
                  )}

                  {/* Move On / Skip Mechanism Container */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-[#27272a] flex items-center justify-between flex-wrap gap-2">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Don't know the answer? Skip to the next station so you never get permanently stuck.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowSkipModal(true)}
                      disabled={isSubmitting || isSkipping || isOffline}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-colors btn-interactive"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Skip Station & Move On</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-slide-up select-none">
          <div className="max-w-md w-full bg-white dark:bg-[#141417] border-2 border-amber-500/50 rounded-2xl p-6 space-y-4 text-zinc-900 dark:text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <SkipForward className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Skip Station {currentClueData?.station}?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium font-mono">
                  Clue {currentStep} of {totalSteps}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
              Are you sure you want to skip this station? 
              <strong className="text-amber-600 dark:text-amber-400 block mt-1">
                • You will receive 0 marks for this station.
              </strong>
              <strong className="text-zinc-700 dark:text-zinc-200 block mt-0.5">
                • You will immediately advance to the next station without getting blocked.
              </strong>
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSkipModal(false)}
                disabled={isSkipping}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSkipStation}
                disabled={isSkipping}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                {isSkipping ? (
                  <span>Skipping Station...</span>
                ) : (
                  <>
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Yes, Skip & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Enforcement Modal Overlay (RELAXED DURING OFFLINE SYNC STATE / SAFE ZONE) */}
      {!isFullscreenActive && !isOffline && !isOfflineReconnectionEligible && !isDisqualified && (
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
