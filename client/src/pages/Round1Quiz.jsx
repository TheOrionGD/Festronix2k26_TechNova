import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  Clock,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Lock,
  Wifi,
  WifiOff,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export default function Round1Quiz() {
  const {
    setCurrentScreen,
    currentUser,
    warningCount,
    fetchLeaderboard,
    eventState,
    requestFullScreen,
    isOffline,
    isRoundUnlocked,
    fetchGradingStatus,
    isDisqualified,
    isOfflineReconnectionEligible,
    setIsOfflineReconnectionEligible
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

  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInitiatedBanner, setShowInitiatedBanner] = useState(true);
  // gradingStatus: 'graded' | 'non_graded' | null (null = not yet known)
  const [gradingStatus, setGradingStatus] = useState(null);
  const [showNonGradedInfo, setShowNonGradedInfo] = useState(false);

  const [showOfflineReconnectionSection, setShowOfflineReconnectionSection] = useState(false);

  const handleOpenOfflineReconnection = React.useCallback(() => {
    setShowOfflineReconnectionSection(true);
    setIsOfflineReconnectionEligible(true);
  }, [setIsOfflineReconnectionEligible]);

  const handleCloseOfflineReconnection = React.useCallback(() => {
    setShowOfflineReconnectionSection(false);
    setIsOfflineReconnectionEligible(false);
  }, [setIsOfflineReconnectionEligible]);

  useEffect(() => {
    if (isOffline && showOfflineReconnectionSection) {
      setIsOfflineReconnectionEligible(true);
    }
  }, [isOffline, showOfflineReconnectionSection, setIsOfflineReconnectionEligible]);

  const { flaggedQuestions, toggleFlagQuestion, markRoundCompletedByUser } = useApp();

  // Initialize or Restore Quiz Attempt
  useEffect(() => {
    const initQuiz = async () => {
      const pid = currentUser?.id;
      try {
        const checkRes = await fetch(`${API_BASE}/quiz/current?participantId=${pid}`);
        const checkData = await checkRes.json();

        if (checkData.success && checkData.hasAttempt) {
          setAttemptId(checkData.attemptId);
          setQuestions(checkData.questions || []);
          setUserAnswers(checkData.userAnswers || {});
          // Capture grading status from server response
          if (checkData.gradingStatus) {
            setGradingStatus(checkData.gradingStatus);
            if (checkData.gradingStatus === 'non_graded') setShowNonGradedInfo(true);
          }

          if (checkData.status === 'SUBMITTED') {
            setIsSubmitted(true);
            setScoreResult(checkData.score);
            if (markRoundCompletedByUser) markRoundCompletedByUser(1);
          } else if (checkData.endsAt) {
            const remSecs = Math.max(0, Math.floor((new Date(checkData.endsAt).getTime() - Date.now()) / 1000));
            setTimeLeft(remSecs);
          }
          setIsLoading(false);
          return;
        }

        const startRes = await fetch(`${API_BASE}/quiz/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: pid })
        });
        const startData = await startRes.json();

        if (startData.success) {
          setAttemptId(startData.attemptId);
          setQuestions(startData.questions || []);
          setUserAnswers(startData.userAnswers || {});
          // Capture grading status assigned by server
          if (startData.gradingStatus) {
            setGradingStatus(startData.gradingStatus);
            if (startData.gradingStatus === 'non_graded') setShowNonGradedInfo(true);
          }
          if (startData.endsAt) {
            const remSecs = Math.max(0, Math.floor((new Date(startData.endsAt).getTime() - Date.now()) / 1000));
            setTimeLeft(remSecs);
          }
        } else {
          setErrorMessage(startData.message);
        }
      } catch (err) {
        console.error('Init quiz error:', err);
        setErrorMessage('Failed to connect to backend quiz engine.');
      } finally {
        setIsLoading(false);
        // Refresh grading status in global context after quiz init
        if (pid) fetchGradingStatus(pid);
      }
    };

    initQuiz();
  }, [currentUser, fetchGradingStatus, markRoundCompletedByUser]);

  const handleSubmitQuiz = React.useCallback(async () => {
    if (isSubmitting || isSubmitted) return;
    if (isOffline) {
      handleOpenOfflineReconnection();
      return;
    }
    setIsSubmitting(true);
    setIsOfflineReconnectionEligible(false);
    setShowOfflineReconnectionSection(false);

    try {
      const res = await fetch(`${API_BASE}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: currentUser?.id,
          attemptId: attemptId,
          userAnswers
        })
      });
      const data = await res.json();
      if (data.success) {
        setScoreResult(data.score);
        setIsSubmitted(true);
        if (markRoundCompletedByUser) markRoundCompletedByUser(1);
        fetchLeaderboard();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
      alert('Network error submitting quiz.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isSubmitted, isOffline, currentUser, attemptId, userAnswers, fetchLeaderboard, handleOpenOfflineReconnection, setIsOfflineReconnectionEligible, markRoundCompletedByUser]);

  // Countdown Timer
  useEffect(() => {
    if (isSubmitted || isLoading || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, isLoading, questions, handleSubmitQuiz]);

  // Synchronize with official event state round timer and auto-submit if round ends
  useEffect(() => {
    if (isSubmitted || isLoading) return;
    if (eventState?.status === 'ROUND_1_ENDED' || eventState?.status === 'COMPLETED') {
      const autoSubmitTimer = setTimeout(() => {
        handleSubmitQuiz();
      }, 0);
      return () => clearTimeout(autoSubmitTimer);
    }
    if (eventState?.roundEndsAt && eventState?.status === 'ROUND_1_RUNNING') {
      const globalRemSecs = Math.max(0, Math.floor((new Date(eventState.roundEndsAt).getTime() - Date.now()) / 1000));
      const syncTimer = setTimeout(() => {
        setTimeLeft(prev => Math.min(prev, globalRemSecs));
      }, 0);
      return () => clearTimeout(syncTimer);
    }
  }, [eventState?.roundEndsAt, eventState?.status, isSubmitted, isLoading, handleSubmitQuiz]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = async (optIndex) => {
    if (isSubmitted || !currentQ) return;
    const qId = currentQ.questionId;
    const updatedAnswers = { ...userAnswers, [qId]: optIndex };
    setUserAnswers(updatedAnswers);

    // Auto-advance to next question smoothly after 250ms
    if (currentIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1));
      }, 250);
    }

    try {
      await fetch(`${API_BASE}/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: currentUser?.id,
          questionId: qId,
          selectedOption: optIndex
        })
      });
    } catch (err) {
      console.warn('Save answer error:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;

  if (!isRoundUnlocked(1)) {
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
                  ROUND 1 IS CURRENTLY LOCKED
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Tech Quiz Workstation Inactive
                </h2>
                <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
                  This workstation is locked. Please wait for the Lab Coordinator to initiate Round 1 from their control portal.
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

        <main className="flex-1 p-6 max-w-6xl mx-auto space-y-6 w-full min-w-0 animate-hero-entrance">
          {/* Header Bar */}
          <div className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm flex items-center justify-between card-hover-lift">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <Brain className="w-6 h-6 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">
                  ROUND 1 {eventState?.status ? `// ${eventState.status}` : ''}
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">TECH QUIZ</h2>
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

            {/* Countdown Timer, Anti-Cheat Warning Badge, & Attempt Token */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  if (isSubmitted || window.confirm('Return to dashboard? (Your answered questions are saved).')) {
                    setCurrentScreen('dashboard');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#D60303] hover:text-white text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs btn-interactive"
                title="Return to Participant Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {attemptId && (
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#09090b] text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-[#27272a] hidden sm:inline-block">
                  Attempt: {attemptId}
                </span>
              )}

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${warningCount > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'}`}>
                Anti-Cheat Warnings: {warningCount || 0}/3
              </span>

              <div className="px-4 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-xl flex items-center gap-2 font-mono shadow-2xs">
                <Clock className="w-4 h-4 text-[#D60303] animate-pulse" />
                <span className="text-xs text-[#595959] dark:text-[#a1a1aa] font-bold">Time:</span>
                <span className={`text-sm font-extrabold ${timeLeft < 300 ? 'text-[#A30B1A] animate-bounce' : 'text-[#D60303]'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {!isSubmitted && questions.length > 0 && (
                <button
                  onClick={isOffline ? handleOpenOfflineReconnection : handleSubmitQuiz}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer btn-interactive ${
                    isOffline
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#D60303] hover:bg-[#A30B1A] text-white'
                  }`}
                >
                  {isOffline ? <WifiOff className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>
                    {isOffline ? 'Offline Sync & Submit' : isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white dark:bg-[#141417] p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 border border-zinc-200 dark:border-[#27272a]">
              <p className="text-sm font-bold text-[#595959] dark:text-[#a1a1aa]">Loading personalized quiz attempt...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-white dark:bg-[#141417] p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 border border-[#D60303] shadow-md animate-slide-up">
              <AlertTriangle className="w-12 h-12 text-[#D60303] mx-auto" />
              <h3 className="text-lg font-bold text-[#A30B1A] dark:text-[#ef4444]">Cannot Start Quiz</h3>
              <p className="text-xs text-[#595959] dark:text-[#a1a1aa] font-medium">{errorMessage}</p>
            </div>
          ) : isSubmitted ? (
            <div className="space-y-6 max-w-2xl mx-auto my-8 animate-slide-up">
              {/* GAMIFIED QUALIFIER BADGE & REWARD CARD */}
              <div className="gradient-border-card p-8 text-center space-y-6 shadow-2xl relative overflow-hidden bg-white dark:bg-[#141417] border border-zinc-200 dark:border-[#27272a]">
                <div className="w-24 h-24 bg-gradient-to-tr from-[#D60303] to-[#A30B1A] text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-red-200 dark:ring-red-950 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest">ROUND 1 COMPLETED</span>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white">TECHNOVA QUIZ MASTER</h3>
                  <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium max-w-md mx-auto">
                    Congratulations! You have completed Round 1. Your attempt is scored and stored securely.
                  </p>
                </div>

                {scoreResult !== null && (
                  <div className="p-4 bg-red-50 dark:bg-[#991B1B]/20 border border-red-200 dark:border-[#D60303] rounded-2xl inline-block shadow-sm">
                    <span className="text-xs text-red-700 dark:text-red-400 font-bold block uppercase tracking-wider font-mono">Verified Score</span>
                    <span className="text-4xl font-black text-[#D60303] font-mono">{scoreResult} / {questions.length} PTS</span>
                  </div>
                )}

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold shadow-md cursor-pointer transition btn-interactive"
                  >
                    Return to Control Dashboard
                  </button>
                </div>
              </div>

              {/* PERSONAL ATTEMPT SUMMARY */}
              <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Your Official Round 1 Record</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                  <div className="p-3 bg-zinc-50 dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Questions</span>
                    <span className="text-base font-bold text-zinc-900 dark:text-white">20 Questions</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Answered</span>
                    <span className="text-base font-bold text-zinc-900 dark:text-white">{Object.keys(userAnswers).length} / 20</span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-600 uppercase block">Score</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{scoreResult} / 20 pts</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Attempt Status</span>
                    <span className="text-xs font-bold text-emerald-500 uppercase block mt-1">LOCKED</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono text-center">
                  Round 1 is completed. Return to the participant dashboard to await Round 2 initiation.
                </p>
              </div>
            </div>
          ) : currentQ ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
              {/* Question Box */}
              <div className="md:col-span-3 space-y-6">
                <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-6 card-hover-lift">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-[#27272a] pb-4">
                    <span className="text-xs font-bold text-[#D60303] uppercase tracking-wider font-mono">
                      Question {currentIdx + 1} of {questions.length}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFlagQuestion(currentQ.questionId)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer btn-interactive ${flaggedQuestions[currentQ.questionId]
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-[#09090b] text-zinc-600 dark:text-[#a1a1aa] hover:bg-amber-100 dark:hover:bg-amber-950/30'
                          }`}
                      >
                        🚩 {flaggedQuestions[currentQ.questionId] ? 'Flagged' : 'Flag for Review'}
                      </button>

                      <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-[#991B1B]/20 text-[#D60303] text-xs font-bold font-mono">
                        1 Mark
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-relaxed">
                    {currentQ.questionText}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options && currentQ.options.map((optionText, optIdx) => {
                      const isSelected = userAnswers[currentQ.questionId] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-xl text-left text-xs font-bold transition-all duration-200 flex items-center justify-between cursor-pointer btn-interactive ${isSelected
                              ? 'bg-[#D60303] text-white shadow-md border-transparent transform translate-x-1'
                              : 'bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-900 dark:text-[#f4f4f5] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold transition-colors font-mono ${isSelected ? 'bg-white text-[#D60303]' : 'bg-zinc-200 dark:bg-[#27272a] text-zinc-700 dark:text-[#a1a1aa]'
                              }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{optionText}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white animate-slide-up" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-[#27272a]">
                    <button
                      onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] disabled:opacity-30 text-xs font-bold flex items-center gap-1 cursor-pointer btn-interactive"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <button
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentIdx === questions.length - 1}
                      className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 disabled:opacity-30 text-xs font-bold flex items-center gap-1 cursor-pointer btn-interactive"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Question Palette */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift">
                  <h4 className="text-xs font-bold text-[#D60303] uppercase tracking-wider font-mono">Question Navigator</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = userAnswers[q.questionId] !== undefined;
                      const isFlagged = flaggedQuestions[q.questionId];
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={q.questionId}
                          onClick={() => setCurrentIdx(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all duration-200 flex items-center justify-center cursor-pointer btn-interactive ${isCurrent
                              ? 'ring-2 ring-[#D60303] font-extrabold shadow-md'
                              : ''
                            } ${isFlagged
                              ? 'bg-amber-500 text-white'
                              : isAnswered
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa]'
                            }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-[11px] text-[#595959] dark:text-[#71717a] font-medium space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-600 rounded"></span>
                      <span>Answered ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-500 rounded"></span>
                      <span>Flagged for Review ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded"></span>
                      <span>Unanswered ({questions.length - answeredCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OFFLINE FIRST SYNCHRONIZATION & NETWORK RECONNECTION PADDING SECTION */}
            {(isOffline || showOfflineReconnectionSection) && !isSubmitted && (
              <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border-2 border-amber-500/60 shadow-xl space-y-5 animate-slide-up text-zinc-900 dark:text-white card-border-glow select-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      {isOffline ? <WifiOff className="w-6 h-6 animate-pulse" /> : <Wifi className="w-6 h-6 text-emerald-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                          OFFLINE FIRST PROTOCOL
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                          SAFE ZONE ACTIVE
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase mt-1">
                        Network Reconnection & Submission Station
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Telemetry Status:</span>
                    <span className={`font-bold px-3 py-1 rounded-xl border ${isOffline ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                      {isOffline ? '🔴 OFFLINE' : '🟢 RECONNECTED'}
                    </span>
                  </div>
                </div>

                {/* Core instruction required by prompt */}
                <div className="p-5 rounded-2xl bg-white/90 dark:bg-[#141417]/90 border border-amber-500/40 space-y-2">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 text-xs">
                      <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                        You are now eligible to exit Full Screen and reconnect to the network.
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                        In this offline submission state, tab switching and exiting full screen are <strong>permitted</strong> without incurring any anti-cheat warnings or account freeze penalties. All your selected answers ({answeredCount}/{questions.length}) are saved securely in your browser cache.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 font-mono text-xs font-bold">
                  <button
                    onClick={() => {
                      if (document.fullscreenElement || document.webkitFullscreenElement) {
                        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>Exit Full Screen to Connect Network</span>
                  </button>

                  {!isOffline ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Submitting Responses...' : 'Submit Official Quiz Attempt Now'}</span>
                    </button>
                  ) : (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 font-medium">
                      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
                      <span>Waiting for network reconnection... (Connect Wi-Fi / Hotspot)</span>
                    </div>
                  )}

                  {showOfflineReconnectionSection && (
                    <button
                      onClick={handleCloseOfflineReconnection}
                      className="w-full sm:w-auto sm:ml-auto px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Hide Section & Continue Reviewing
                    </button>
                  )}
                </div>
              </div>
            )}
            </>
          ) : null}
        </main>
      </div>

      {/* ROUND 1 INITIATED CELEBRATION OVERLAY */}
      {showInitiatedBanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center animate-slide-up select-none">
          <div className="max-w-md w-full bg-white dark:bg-[#141417] border-2 border-[#D60303] rounded-3xl p-8 space-y-6 text-zinc-900 dark:text-white shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#D60303] to-[#A30B1A] text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-red-200 dark:ring-red-950 animate-bounce">
              <Brain className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-widest bg-red-100 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-300 dark:border-red-800">
                🚀 CELEBRATION — ACTIVATED
              </span>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                ROUND 1 INITIATED
              </h3>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-medium">
                The Lab Coordinator has launched Round 1 (Tech Quiz). Your 20-minute timed module is now live with auto-advancing questions!
              </p>
            </div>

            <button
              onClick={() => setShowInitiatedBanner(false)}
              className="w-full py-3.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer btn-interactive font-mono"
            >
              START ROUND 1 QUIZ NOW ➔
            </button>
          </div>
        </div>
      )}

      {/* NON-GRADED PARTICIPANT NOTICE */}
      {showNonGradedInfo && !showInitiatedBanner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-slide-up">
          <div className="max-w-md w-full bg-white dark:bg-[#141417] border-2 border-amber-500/60 rounded-2xl p-6 space-y-4 text-zinc-900 dark:text-white shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest block">◎ NON-GRADED PARTICIPATION</span>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Your Round 1 is Non-Graded</h3>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-medium">
                You are participating in Round 1, but your score will <strong>not</strong> be counted in the official leaderboard or qualification standings.
                This can happen when a new round grading cohort is configured by the admin.
                You can still complete the quiz for practice.
              </p>
            </div>
            <button
              onClick={() => setShowNonGradedInfo(false)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow transition cursor-pointer btn-interactive font-mono"
            >
              I UNDERSTAND — CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Enforcement Modal Overlay */}
      {!isFullscreenActive && !isOffline && !showInitiatedBanner && !isOfflineReconnectionEligible && !showOfflineReconnectionSection && !isDisqualified && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center animate-slide-up select-none">
          <div className="max-w-md w-full bg-white dark:bg-[#141417] border-2 border-[#D60303] rounded-2xl p-6 space-y-4 text-zinc-900 dark:text-white shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-[#991B1B]/20 text-[#D60303] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-[#D60303] uppercase tracking-wide font-mono">FULL SCREEN REQUIRED</h3>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-medium">
              Round 1 (Tech Quiz) requires Full Screen mode for real-time telemetry supervision and anti-cheat compliance.
            </p>
            <button
              onClick={() => requestFullScreen()}
              className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer btn-interactive font-mono"
            >
              ENABLE FULL SCREEN MODE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

