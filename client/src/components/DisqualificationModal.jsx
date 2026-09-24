import React from 'react';
import { useApp } from '../context/useApp';
import { AlertOctagon, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default function DisqualificationModal() {
  const { 
    isDisqualified, 
    disqualificationReason, 
    warningCount, 
    currentUser, 
    currentScreen,
    logoutUser, 
    setCurrentScreen 
  } = useApp();

  if (!isDisqualified) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-slide-up">
      <div className="max-w-lg w-full bg-[#0e0e11] border-2 border-red-600 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-2xl shadow-red-950/50 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Pulsing Icon */}
        <div className="w-20 h-20 rounded-2xl bg-red-600/20 border-2 border-red-500/60 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-950/40 animate-pulse">
          <AlertOctagon className="w-10 h-10" />
        </div>

        {/* Heading & Badge */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-widest inline-block shadow-xs">
            MALPRACTICE DISQUALIFICATION
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            ACCOUNT FROZEN FOR THIS ROUND
          </h2>
          <p className="text-xs text-red-300/90 leading-relaxed font-medium max-w-md mx-auto">
            Due to malpractice, you have been disqualified from this round/event. The maximum allowable anti-cheat limit (3 violations) has been exceeded.
          </p>
        </div>

        {/* Telemetry Details Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-red-500/40 text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400">Participant ID:</span>
            <span className="text-red-400 font-bold">{currentUser?.id || 'UNKNOWN'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400">Active Stage:</span>
            <span className="text-white uppercase">{currentScreen}</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-400">Recorded Violations:</span>
            <span className="text-red-500 font-extrabold">{warningCount >= 3 ? 3 : warningCount} / 3 (MAX REACHED)</span>
          </div>
          <div className="flex items-start justify-between pt-1">
            <span className="text-zinc-400 shrink-0 mr-2">Official Reason:</span>
            <span className="text-zinc-300 text-right text-[11px] leading-tight">
              {disqualificationReason || '3 Tab switches / Full screen exits detected during live round.'}
            </span>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-[11px] text-red-200/80 flex items-center gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>This incident has been logged and transmitted to the Lab Coordinator and Admin verification console.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 font-mono text-xs font-bold">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={() => logoutUser()}
            className="w-full sm:w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-red-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit / Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
