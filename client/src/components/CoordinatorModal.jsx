import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 bg-[#595959]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#EFEEEA] border border-[#595959] rounded-2xl shadow-2xl overflow-hidden text-[#595959]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#A30B1A] flex items-center justify-between text-[#EFEEEA]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-[#EFEEEA]" />
            <span>Coordinator Physical Verification</span>
          </div>
          <button 
            onClick={() => setIsCoordinatorModalOpen(false)}
            className="p-1 text-[#EFEEEA]/80 hover:text-[#EFEEEA] rounded-lg hover:bg-[#D60303] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-[#A30B1A]/20 text-[#A30B1A] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Award className="w-8 h-8 text-[#A30B1A]" />
            </div>
            <h3 className="text-lg font-bold text-[#A30B1A]">Solution Verified & Locked!</h3>
            <p className="text-xs text-[#595959] font-medium">
              {marks} Marks awarded by {coordId} for Problem {pendingVerificationProblemId || 1}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-[#C23D31]/10 border border-[#C23D31] rounded-xl text-[#A30B1A] text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#A30B1A]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959] text-xs space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-[#595959] mb-1">Target Participant ID</label>
                <input
                  type="text"
                  value={participantIdInput}
                  onChange={(e) => setParticipantIdInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#EFEEEA] border border-[#595959] rounded-lg text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                  placeholder="e.g. TN2026-001"
                  required
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#595959] uppercase tracking-wider">Physical Verification Checklist</p>
              <div className="space-y-2 text-xs text-[#595959]">
                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#EFEEEA] border border-[#595959] hover:border-[#D60303]">
                  <input
                    type="checkbox"
                    checked={checklist.codeChecked}
                    onChange={(e) => setChecklist({ ...checklist, codeChecked: e.target.checked })}
                    className="rounded border-[#595959] text-[#D60303] focus:ring-0"
                  />
                  <span>1. Corrected code logic inspected</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#EFEEEA] border border-[#595959] hover:border-[#D60303]">
                  <input
                    type="checkbox"
                    checked={checklist.errorCorrected}
                    onChange={(e) => setChecklist({ ...checklist, errorCorrected: e.target.checked })}
                    className="rounded border-[#595959] text-[#D60303] focus:ring-0"
                  />
                  <span>2. Syntax/Logical error fix verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#EFEEEA] border border-[#595959] hover:border-[#D60303]">
                  <input
                    type="checkbox"
                    checked={checklist.localExecution}
                    onChange={(e) => setChecklist({ ...checklist, localExecution: e.target.checked })}
                    className="rounded border-[#595959] text-[#D60303] focus:ring-0"
                  />
                  <span>3. Local execution demonstrated</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-[#EFEEEA] border border-[#595959] hover:border-[#D60303]">
                  <input
                    type="checkbox"
                    checked={checklist.outputVerified}
                    onChange={(e) => setChecklist({ ...checklist, outputVerified: e.target.checked })}
                    className="rounded border-[#595959] text-[#D60303] focus:ring-0"
                  />
                  <span>4. Output matches expected problem criteria</span>
                </label>
              </div>
            </div>

            {/* Coordinator Authorization Inputs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[#595959] mb-1">Coordinator ID</label>
                <input
                  type="text"
                  value={coordId}
                  onChange={(e) => setCoordId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] focus:border-[#D60303] focus:outline-none font-mono"
                  placeholder="COORD-ID"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#595959] mb-1">Authorization PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] focus:border-[#D60303] focus:outline-none font-mono"
                  placeholder="****"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#595959] mb-1">Award Marks (Max 10)</label>
              <select
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] focus:border-[#D60303] focus:outline-none font-mono"
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
              className="w-full py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-[#EFEEEA] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : `Verify & Award ${marks} Marks`}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
