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
  const { currentUser, fetchLeaderboard, setCurrentScreen } = useApp();

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
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <Compass className="w-6 h-6 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">ROUND 3</span>
                <h2 className="text-lg font-bold text-[#A30B1A]">TECH HUNT — SEQUENTIAL CLUE CHASE</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-[#EFEEEA] font-bold">
                SCORE: {score} PTS
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-[#EFEEEA] p-12 rounded-2xl text-center border border-[#595959]">
              <p className="text-sm font-bold text-[#595959]">Loading active station clue...</p>
            </div>
          ) : errorMessage ? (
            <div className="bg-[#EFEEEA] p-8 rounded-2xl text-center space-y-4 border border-[#D60303]">
              <AlertTriangle className="w-12 h-12 text-[#D60303] mx-auto" />
              <h3 className="text-lg font-bold text-[#A30B1A]">Cannot Start Tech Hunt</h3>
              <p className="text-xs text-[#595959] font-medium">{errorMessage}</p>
            </div>
          ) : isCompleted ? (
            <div className="bg-[#EFEEEA] p-8 rounded-2xl text-center space-y-6 max-w-xl mx-auto my-12 border border-[#595959] shadow-md">
              <div className="w-20 h-20 bg-[#A30B1A]/20 text-[#A30B1A] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-10 h-10 text-[#A30B1A]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#A30B1A]">Tech Hunt Completed!</h3>
                <p className="text-xs text-[#595959] font-medium">You have successfully solved all assigned station clues!</p>
              </div>

              <div className="p-4 bg-[#EFEEEA] border border-[#595959] rounded-xl inline-block">
                <span className="text-xs text-[#595959] font-bold block uppercase tracking-wider">Final Tech Hunt Score</span>
                <span className="text-3xl font-extrabold text-[#D60303]">{score} PTS</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-[#595959] hover:bg-[#A30B1A] text-[#EFEEEA] text-xs font-bold shadow-md cursor-pointer transition"
                >
                  Return to Control Dashboard
                </button>
              </div>
            </div>
          ) : currentClueData ? (
            <div className="space-y-6">
              {/* Clue Progress Stepper */}
              <div className="bg-[#EFEEEA] p-4 rounded-2xl border border-[#595959] shadow-sm flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#A30B1A] uppercase tracking-wider">
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
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center ${
                          isPassed ? 'bg-[#A30B1A] text-[#EFEEEA]' :
                          isCurrent ? 'bg-[#D60303] text-[#EFEEEA] ring-2 ring-[#D60303]' :
                          'bg-[#EFEEEA] border border-[#595959] text-[#595959]/50'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4 text-[#EFEEEA]" /> : isCurrent ? stepNum : <Lock className="w-3.5 h-3.5 text-[#595959]/50" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clue Card */}
              <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#595959]/20 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs rounded-full font-mono">
                      Station {currentClueData.station}
                    </span>
                    <span className="px-3 py-1 bg-[#595959]/10 text-[#595959] font-bold text-xs rounded-full">
                      {currentClueData.category}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#A30B1A]/10 text-[#A30B1A] font-bold text-xs font-mono">
                    {currentClueData.marks} Marks
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#A30B1A]">{currentClueData.title}</h3>
                  <p className="text-sm text-[#595959] font-medium leading-relaxed bg-[#EFEEEA] p-4 rounded-xl border border-[#595959]">
                    {currentClueData.clueText}
                  </p>
                </div>

                {/* Hint Box */}
                {hintText ? (
                  <div className="p-4 bg-[#595959]/10 border border-[#595959] rounded-xl text-xs text-[#595959] space-y-1">
                    <span className="font-bold text-[#A30B1A] block">REVEALED HINT (-2 PTS Penalty):</span>
                    <p className="font-medium">{hintText}</p>
                  </div>
                ) : currentClueData.hasHint ? (
                  <button
                    onClick={handleRequestHint}
                    className="px-4 py-2 bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[#D60303]" />
                    <span>Request Station Hint (-2 PTS Penalty)</span>
                  </button>
                ) : null}

                {/* Answer Form */}
                <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#595959]">
                      Enter Station Clue Answer:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={participantAnswer}
                        onChange={(e) => setParticipantAnswer(e.target.value)}
                        placeholder="Type answer..."
                        className="flex-1 p-3 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs font-bold text-[#595959] outline-none focus:border-[#D60303]"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-[#EFEEEA] text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit</span>
                      </button>
                    </div>
                  </div>

                  {feedbackMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      feedbackMsg.type === 'success' ? 'bg-[#A30B1A]/20 text-[#A30B1A]' : 'bg-[#D60303]/20 text-[#D60303]'
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
    </div>
  );
}
