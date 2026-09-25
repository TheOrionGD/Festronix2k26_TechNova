import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { ShieldCheck, X, Lock, Award, AlertCircle, Calculator } from 'lucide-react';

function CoordinatorModalContent() {
  const { 
    setIsCoordinatorModalOpen, 
    pendingVerificationProblemId, 
    pendingVerificationParticipantId,
    verifyDebugSubmission,
    currentUser
  } = useApp();

  const isCoordOrAdmin = currentUser?.role === 'COORDINATOR' || currentUser?.role === 'ADMIN';
  const [coordId, setCoordId] = useState(isCoordOrAdmin ? (currentUser?.id || '') : '');
  const [pin, setPin] = useState(currentUser?.pin || '');
  const [participantIdInput, setParticipantIdInput] = useState(
    pendingVerificationParticipantId || (currentUser?.role === 'PARTICIPANT' ? currentUser?.id : '') || ''
  );
  
  // Checklist
  const [checklist, setChecklist] = useState({
    codeChecked: false,
    errorCorrected: false,
    localExecution: false,
    outputVerified: false
  });

  // 4 Official Rubric Evaluation Criteria (Max 10 Marks total)
  const [logicMarks, setLogicMarks] = useState(4); // 4 (Excellent), 2 (Good), 0 (Poor)
  const [outputMarks, setOutputMarks] = useState(3); // 3 (Excellent), 1.5 (Good), 0 (Poor)
  const [qualityMarks, setQualityMarks] = useState(2); // 2 (Excellent), 1 (Good), 0 (Poor)
  const [vivaMarks, setVivaMarks] = useState(1); // 1 (Excellent), 0.5 (Good), 0 (Poor)

  const calculatedMarks = Number((logicMarks + outputMarks + qualityMarks + vivaMarks).toFixed(1));

  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCoordinatorModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCoordinatorModalOpen]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      setErrorMsg('Please complete all 4 coordinator checklist items before verifying.');
      return;
    }

    if (!participantIdInput.trim()) {
      setErrorMsg('Participant ID is required to authorize the evaluated score.');
      return;
    }

    if (!coordId.trim() || !pin.trim()) {
      setErrorMsg('Coordinator ID and authorization PIN are required.');
      return;
    }

    setIsLoading(true);
    const result = await verifyDebugSubmission(
      pendingVerificationProblemId || 1, 
      coordId, 
      pin, 
      calculatedMarks, 
      participantIdInput.trim(),
      {
        logicMarks,
        outputMarks,
        qualityMarks,
        vivaMarks
      }
    );
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      window.dispatchEvent(new CustomEvent('verification:updated', { 
        detail: { problemId: pendingVerificationProblemId || 1, participantId: participantIdInput.trim(), marks: calculatedMarks } 
      }));
      setTimeout(() => {
        setIsSuccess(false);
        setIsCoordinatorModalOpen(false);
      }, 1500);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-slide-up"
      onClick={() => setIsCoordinatorModalOpen(false)}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#141417] border-2 border-red-500/60 rounded-2xl shadow-2xl overflow-hidden text-zinc-900 dark:text-[#f4f4f5] transition-all duration-300 transform scale-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#D60303] flex items-center justify-between text-white font-mono border-b border-red-400 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>Round 2 — Debugging Physical Terminal Evaluation</span>
          </div>
          <button 
            onClick={() => setIsCoordinatorModalOpen(false)}
            className="p-1 text-white hover:text-white rounded-lg bg-[#A30B1A] hover:bg-[#800814] border border-red-400 transition cursor-pointer btn-interactive"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-slide-up">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce border border-emerald-500">
              <Award className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">Solution Verified & Locked!</h3>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium">
              {calculatedMarks} Marks awarded by {coordId} for Problem #{pendingVerificationProblemId || 1}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="p-6 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-[#991B1B]/20 border border-red-500 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2 font-semibold animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D60303]" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Coordinator On-Desk Banner */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-700 dark:text-amber-400">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Rubric-Based Evaluation Criteria (30-Sec Viva + Terminal Run)</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                Inspect local compiler execution, select performance attainment for each rubric criterion, and authorize with your PIN.
              </p>
            </div>

            {/* Terminal & Problem Context */}
            <div className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] text-xs grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 dark:text-[#a1a1aa] mb-0.5 font-mono">Participant ID</label>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs block">
                  {participantIdInput || currentUser?.id || 'TN2026'}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 dark:text-[#a1a1aa] mb-0.5 font-mono">Verifying Question</label>
                <span className="font-mono font-bold text-[#D60303] text-xs block">
                  Problem #{pendingVerificationProblemId || 1}
                </span>
              </div>
            </div>

            {/* 4 Official Rubric Evaluation Criteria */}
            <div className="space-y-3 p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#D60303]" />
                  <span>Official Rubric Criteria Evaluation</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#D60303]/10 text-[#D60303] font-mono font-bold text-xs">
                  Total: {calculatedMarks} / 10 Marks
                </span>
              </div>

              {/* 1. Logic & Root Cause Fix (4 Marks) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Logic & Root Cause Fix (Max 4 Marks)</span>
                  <span className="font-mono font-bold text-[#D60303]">{logicMarks} M</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLogicMarks(4)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      logicMarks === 4 
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Excellent (4 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Accurate root flaw fix</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogicMarks(2)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      logicMarks === 2 
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Good (2 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Partial / workaround</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogicMarks(0)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      logicMarks === 0 
                        ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Poor (0 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Unresolved / crash</div>
                  </button>
                </div>
              </div>

              {/* 2. Test Output Conformance (3 Marks) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Test Output Conformance (Max 3 Marks)</span>
                  <span className="font-mono font-bold text-[#D60303]">{outputMarks} M</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setOutputMarks(3)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      outputMarks === 3 
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Excellent (3 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Matches spec perfectly</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputMarks(1.5)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      outputMarks === 1.5 
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Good (1.5 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Spacing / casing issues</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputMarks(0)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      outputMarks === 0 
                        ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Poor (0 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Incorrect output</div>
                  </button>
                </div>
              </div>

              {/* 3. Code Quality & Memory Safety (2 Marks) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Code Quality & Memory Safety (Max 2 Marks)</span>
                  <span className="font-mono font-bold text-[#D60303]">{qualityMarks} M</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setQualityMarks(2)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      qualityMarks === 2 
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Excellent (2 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Clean, freed resources</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQualityMarks(1)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      qualityMarks === 1 
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Good (1 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Minor leak / indentation</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQualityMarks(0)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      qualityMarks === 0 
                        ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Poor (0 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Major memory bug</div>
                  </button>
                </div>
              </div>

              {/* 4. Live Explanation / Viva (1 Mark) */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Live Explanation / Viva (Max 1 Mark)</span>
                  <span className="font-mono font-bold text-[#D60303]">{vivaMarks} M</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setVivaMarks(1)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      vivaMarks === 1 
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Excellent (1 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Clear articulation &lt;30s</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVivaMarks(0.5)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      vivaMarks === 0.5 
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Good (0.5 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Hesitant / vague</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVivaMarks(0)}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      vivaMarks === 0 
                        ? 'bg-red-500/15 border-red-500 text-red-700 dark:text-red-300 font-bold shadow-xs' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-bold">Poor (0 M)</div>
                    <div className="text-[10px] opacity-80 leading-tight">Cannot explain fix</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-700 dark:text-white uppercase tracking-wider font-mono">Terminal Checklist</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-[#a1a1aa]">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.codeChecked}
                    onChange={(e) => setChecklist({ ...checklist, codeChecked: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>1. Code inspected</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.errorCorrected}
                    onChange={(e) => setChecklist({ ...checklist, errorCorrected: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>2. Error fixed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.localExecution}
                    onChange={(e) => setChecklist({ ...checklist, localExecution: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>3. Local execution</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.outputVerified}
                    onChange={(e) => setChecklist({ ...checklist, outputVerified: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>4. Output matched</span>
                </label>
              </div>
            </div>

            {/* Coordinator Authorization Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Participant ID</label>
                <input
                  type="text"
                  value={participantIdInput}
                  onChange={(e) => setParticipantIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 rounded-xl text-xs text-[#D60303] font-bold focus:border-[#D60303] focus:outline-none font-mono transition-colors"
                  placeholder="TN2026-xxx"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Coordinator ID</label>
                <input
                  type="text"
                  value={coordId}
                  onChange={(e) => setCoordId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none font-mono transition-colors font-semibold"
                  placeholder="COORD-ID"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Authorization PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none font-mono transition-colors"
                  placeholder="****"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] border border-red-500/80 disabled:opacity-50 text-white font-bold font-mono text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer btn-interactive shrink-0"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>{isLoading ? 'Verifying...' : `Authorize & Lock Evaluated Score: ${calculatedMarks} Marks`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CoordinatorModal() {
  const { isCoordinatorModalOpen, pendingVerificationProblemId, pendingVerificationParticipantId } = useApp();
  if (!isCoordinatorModalOpen) return null;
  return <CoordinatorModalContent key={`${pendingVerificationProblemId || 1}-${pendingVerificationParticipantId || 'default'}`} />;
}
