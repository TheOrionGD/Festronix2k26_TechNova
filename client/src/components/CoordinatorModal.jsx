import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, Lock, Award, AlertCircle } from 'lucide-react';

export default function CoordinatorModal() {
  const { 
    isCoordinatorModalOpen, 
    setIsCoordinatorModalOpen, 
    pendingVerificationProblemId, 
    verifyDebugSubmission,
    currentUser
  } = useApp();

  const [coordId, setCoordId] = useState(currentUser?.id || '');
  const [pin, setPin] = useState('');
  const [participantIdInput, setParticipantIdInput] = useState(currentUser?.id || '');
  const [checklist, setChecklist] = useState({
    codeChecked: false,
    errorCorrected: false,
    localExecution: false,
    outputVerified: false
  });
  const [marks, setMarks] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCoordinatorModalOpen) {
        setIsCoordinatorModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCoordinatorModalOpen, setIsCoordinatorModalOpen]);

  if (!isCoordinatorModalOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      setErrorMsg('Please complete all 4 coordinator checklist items before verifying.');
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
      parseInt(marks), 
      participantIdInput
    );
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsCoordinatorModalOpen(false);
      }, 1500);
    } else {
      setErrorMsg(result.message || 'Verification rejected by backend.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-slide-up"
      onClick={() => setIsCoordinatorModalOpen(false)}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#141417] border-2 border-red-500/60 rounded-2xl shadow-2xl overflow-hidden text-zinc-900 dark:text-[#f4f4f5] transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#D60303] flex items-center justify-between text-white font-mono border-b border-red-400">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
            <span>Coordinator Physical Verification</span>
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
            <div className="w-16 h-16 bg-[#D60303]/20 text-[#D60303] rounded-full flex items-center justify-center mx-auto animate-bounce border border-red-500">
              <Award className="w-8 h-8 text-[#D60303]" />
            </div>
            <h3 className="text-lg font-bold text-[#D60303] font-mono">Solution Verified & Locked!</h3>
            <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium">
              {marks} Marks awarded by {coordId} for Problem {pendingVerificationProblemId || 1}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-[#991B1B]/20 border border-red-500 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2 font-semibold animate-slide-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D60303]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-red-500/50 text-xs space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Target Participant ID</label>
                <input
                  type="text"
                  value={participantIdInput}
                  onChange={(e) => setParticipantIdInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-[#141417] border border-red-500/50 rounded-lg text-xs text-zinc-900 dark:text-white font-mono focus:border-[#D60303] focus:outline-none transition-colors"
                  placeholder="e.g. TN2026-001"
                  required
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-700 dark:text-white uppercase tracking-wider font-mono">Physical Verification Checklist</p>
              <div className="space-y-2 text-xs text-zinc-700 dark:text-[#a1a1aa]">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.codeChecked}
                    onChange={(e) => setChecklist({ ...checklist, codeChecked: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>1. Corrected code logic inspected</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.errorCorrected}
                    onChange={(e) => setChecklist({ ...checklist, errorCorrected: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>2. Syntax/Logical error fix verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.localExecution}
                    onChange={(e) => setChecklist({ ...checklist, localExecution: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>3. Local execution demonstrated</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 hover:border-[#D60303] transition-colors">
                  <input
                    type="checkbox"
                    checked={checklist.outputVerified}
                    onChange={(e) => setChecklist({ ...checklist, outputVerified: e.target.checked })}
                    className="rounded border-red-500 text-[#D60303] focus:ring-0"
                  />
                  <span>4. Output matches expected problem criteria</span>
                </label>
              </div>
            </div>

            {/* Coordinator Authorization Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Coordinator ID</label>
                <input
                  type="text"
                  value={coordId}
                  onChange={(e) => setCoordId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none font-mono transition-colors"
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

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Award Marks (Max 10)</label>
              <select
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-red-500/50 rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none font-mono transition-colors"
              >
                <option value={10}>10 Marks (Full Score)</option>
                <option value={8}>8 Marks (Minor issue)</option>
                <option value={5}>5 Marks (Partial Credit)</option>
                <option value={0}>0 Marks (Invalid)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] border border-red-500/80 disabled:opacity-50 text-white font-bold font-mono text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer btn-interactive"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>{isLoading ? 'Verifying...' : `Verify & Award ${marks} Marks`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
