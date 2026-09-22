import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Copy, Shield, LogOut } from 'lucide-react';

export default function Header() {
  const { currentUser, logoutUser, setCurrentScreen, warningCount } = useApp();

  const copyParticipantId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      alert(`Copied Participant ID: ${currentUser.id}`);
    }
  };

  return (
    <header className="h-16 bg-[#A30B1A] border-b border-[#D60303] px-6 flex items-center justify-between sticky top-0 z-40 text-[#EFEEEA] transition-colors duration-200 shrink-0 select-none">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setCurrentScreen('landing')}>
          <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 overflow-hidden">
            <img src="/technova_icon.jpg" alt="Technova Icon" className="w-full h-full object-cover rounded-md" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#EFEEEA] flex items-center gap-2">
              FESTRONIX 2026
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D60303] text-[#EFEEEA] border border-[#EFEEEA]/30 animate-pulse">
                TECHNOVA
              </span>
            </h1>
            <p className="text-xs text-[#EFEEEA]/80 font-medium">CSE Symposium — Technical Competition Event</p>
          </div>
        </div>
      </div>

      {/* Right: Anti-cheat indicator, Notifications, User info & Actions */}
      <div className="flex items-center gap-4">
        {currentUser?.role === 'PARTICIPANT' && warningCount > 0 && (
          <div className="flex items-center gap-2 bg-[#C23D31] border border-[#D60303] text-[#EFEEEA] text-xs px-3 py-1.5 rounded-lg font-medium animate-pulse">
            <Shield className="w-4 h-4 text-[#EFEEEA]" />
            <span>Warnings: <strong>{warningCount}</strong></span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative cursor-pointer p-2 rounded-lg bg-[#D60303]/30 border border-[#D60303] text-[#EFEEEA] hover:bg-[#D60303]/50 transition btn-interactive">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D60303] animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D60303]"></span>
        </div>

        {/* User Card with Technova Icon Profile Avatar */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-3 border-l border-[#D60303]/60">
            <div className="w-9 h-9 rounded-full bg-white border border-[#EFEEEA]/40 flex items-center justify-center shadow-xs transition-transform hover:scale-105 overflow-hidden p-0.5" title={currentUser.name}>
              <img src="/technova_icon.jpg" alt={currentUser.name || 'User Profile'} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-[#EFEEEA]">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#EFEEEA]/80">
                <span className="font-mono text-[#EFEEEA] font-medium">{currentUser.id}</span>
                {currentUser.role === 'PARTICIPANT' && (
                  <button
                    onClick={copyParticipantId}
                    title="Copy Participant ID"
                    className="hover:text-[#EFEEEA] transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-[#EFEEEA]/70 hover:text-[#EFEEEA]" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={logoutUser}
              title="Logout"
              className="p-2 text-[#EFEEEA]/80 hover:text-[#EFEEEA] hover:bg-[#D60303] rounded-lg transition ml-1 cursor-pointer btn-interactive"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-4 py-1.5 rounded-lg bg-[#D60303] hover:bg-[#C23D31] text-[#EFEEEA] text-xs font-bold transition shadow-sm btn-interactive cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
