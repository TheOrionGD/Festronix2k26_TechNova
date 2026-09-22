import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
  AlertTriangle
} from 'lucide-react';

export default function Round1Quiz() {
  const { 
    setCurrentScreen, 
    currentUser, 
    warningCount, 
    fetchLeaderboard,
    eventState 
  } = useApp();

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

  // Initialize or Restore Quiz Attempt
  useEffect(() => {
    const initQuiz = async () => {
      const pid = currentUser?.id || 'TN2026-GUEST';
      try {
        // First check current active attempt
        const checkRes = await fetch(`${API_BASE}/quiz/current?participantId=${pid}`);
        const checkData = await checkRes.json();

        if (checkData.success && checkData.hasAttempt) {
          setAttemptId(checkData.attemptId);
          setQuestions(checkData.questions || []);
          setUserAnswers(checkData.userAnswers || {});

          if (checkData.status === 'SUBMITTED') {
            setIsSubmitted(true);
            setScoreResult(checkData.score);
          } else if (checkData.endsAt) {
            const remSecs = Math.max(0, Math.floor((new Date(checkData.endsAt).getTime() - Date.now()) / 1000));
            setTimeLeft(remSecs);
          }
          setIsLoading(false);
          return;
        }

        // Otherwise start a new attempt (Server-side randomization)
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
          if (startData.endsAt) {
            const remSecs = Math.max(0, Math.floor((new Date(startData.endsAt).getTime() - Date.now()) / 1000));
            setTimeLeft(remSecs);
          }
        } else {
          setErrorMessage(startData.message || 'Unable to start quiz.');
        }
      } catch (err) {
        setErrorMessage('Failed to connect to backend quiz engine.');
      } finally {
        setIsLoading(false);
      }
    };

    initQuiz();
  }, [currentUser]);

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
  }, [isSubmitted, isLoading, questions]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = async (optIndex) => {
    if (isSubmitted || !currentQ) return;
    const qId = currentQ.questionId;
    const updatedAnswers = { ...userAnswers, [qId]: optIndex };
    setUserAnswers(updatedAnswers);

    // Sync answer incrementally to backend
    try {
      await fetch(`${API_BASE}/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: currentUser?.id || 'TN2026-GUEST',
          questionId: qId,
          selectedOption: optIndex
        })
      });
    } catch (err) {}
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: currentUser?.id || 'TN2026-GUEST',
          userAnswers
        })
      });
      const data = await res.json();
      if (data.success) {
        setScoreResult(data.score);
        setIsSubmitted(true);
        fetchLeaderboard();
      } else {
        alert(data.message || 'Failed to submit quiz.');
      }
    } catch (err) {
      alert('Network error submitting quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-6xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <Brain className="w-6 h-6 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">ROUND 1</span>
                <h2 className="text-lg font-bold text-[#A30B1A]">TECH QUIZ</h2>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-[#D60303] animate-pulse" />
                <span className="text-xs text-[#595959] font-bold">Time Remaining:</span>
                <span className={`text-sm font-extrabold ${timeLeft < 300 ? 'text-[#A30B1A] animate-bounce' : 'text-[#D60303]'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {!isSubmitted && questions.length > 0 && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-[#EFEEEA] text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Quiz'}</span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="bg-[#EFEEEA] p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 border border-[#595959]">
              <p className="text-sm font-bold text-[#595959]">Loading personalized quiz attempt...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-[#EFEEEA] p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 border border-[#D60303] shadow-md">
              <AlertTriangle className="w-12 h-12 text-[#D60303] mx-auto" />
              <h3 className="text-lg font-bold text-[#A30B1A]">Cannot Start Quiz</h3>
              <p className="text-xs text-[#595959] font-medium">{errorMessage}</p>
            </div>
          ) : isSubmitted ? (
            <div className="bg-[#EFEEEA] p-8 rounded-2xl text-center space-y-6 max-w-xl mx-auto my-12 border border-[#595959] shadow-md">
              <div className="w-20 h-20 bg-[#A30B1A]/20 text-[#A30B1A] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-[#A30B1A]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#A30B1A]">Round 1 Quiz Submitted</h3>
                <p className="text-xs text-[#595959] font-medium">Your attempt has been recorded and scored by the server.</p>
              </div>

              {scoreResult !== null && (
                <div className="p-4 bg-[#EFEEEA] border border-[#595959] rounded-xl inline-block">
                  <span className="text-xs text-[#595959] font-bold block uppercase tracking-wider">Your Verified Score</span>
                  <span className="text-3xl font-extrabold text-[#D60303]">{scoreResult} / {questions.length}</span>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-[#595959] hover:bg-[#A30B1A] text-[#EFEEEA] text-xs font-bold shadow-md cursor-pointer transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Question Box */}
              <div className="md:col-span-3 space-y-6">
                <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-[#595959]/20 pb-4">
                    <span className="text-xs font-bold text-[#D60303] uppercase tracking-wider font-mono">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] text-xs font-bold font-mono">
                      1 Mark
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#595959] leading-relaxed">
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
                          className={`w-full p-4 rounded-xl text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#A30B1A] text-[#EFEEEA] shadow-md border-transparent'
                              : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold ${
                              isSelected ? 'bg-[#EFEEEA] text-[#A30B1A]' : 'bg-[#595959]/10 text-[#595959]'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{optionText}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#EFEEEA]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-[#595959]/20">
                    <button
                      onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-4 py-2 rounded-xl border border-[#595959] text-[#595959] disabled:opacity-30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <button
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentIdx === questions.length - 1}
                      className="px-4 py-2 rounded-xl bg-[#595959] text-[#EFEEEA] disabled:opacity-30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Question Palette */}
              <div className="space-y-6">
                <div className="bg-[#EFEEEA] p-5 rounded-2xl border border-[#595959] shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#A30B1A] uppercase tracking-wider">Question Navigator</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = userAnswers[q.questionId] !== undefined;
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={q.questionId}
                          onClick={() => setCurrentIdx(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition flex items-center justify-center cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-[#D60303] bg-[#D60303] text-[#EFEEEA]'
                              : isAnswered
                              ? 'bg-[#A30B1A] text-[#EFEEEA]'
                              : 'bg-[#EFEEEA] border border-[#595959] text-[#595959]'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-[11px] text-[#595959] font-medium space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#A30B1A] rounded"></span>
                      <span>Answered ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-[#EFEEEA] border border-[#595959] rounded"></span>
                      <span>Unanswered ({questions.length - answeredCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
