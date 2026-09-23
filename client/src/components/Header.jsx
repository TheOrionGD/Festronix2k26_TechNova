import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Copy, Shield, LogOut, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { currentUser, logoutUser, setCurrentScreen, warningCount, theme, toggleTheme } = useApp();

  const copyParticipantId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      alert(`Copied Participant ID: ${currentUser.id}`);
    }
  };

  return (
    <header className="h-16 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-md border-b border-red-500/50 px-6 flex items-center justify-between sticky top-0 z-40 text-[#595959] dark:text-[#f4f4f5] transition-colors duration-200 shrink-0 select-none">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setCurrentScreen('landing')}>
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#141417] border border-red-500/60 p-1 flex items-center justify-center shadow-md transition-all duration-200 group-hover:border-[#D60303] overflow-hidden">
            <img src="/technova_icon.jpg" alt="Technova Icon" className="w-full h-full object-cover rounded-md" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 font-mono">
              FESTRONIX 2026
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D60303] text-white border border-red-400 shadow-xs">
                TECHNOVA
              </span>
            </h1>
            <p className="text-xs text-[#595959] dark:text-[#a1a1aa] font-medium font-mono">CSE Symposium — Competition System</p>
          </div>
        </div>
      </div>

      {/* Right: Theme Toggle, Anti-cheat indicator, Notifications, User info & Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* THEME CONVERSION TOGGLE BUTTON */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] border border-red-500/80 text-white transition cursor-pointer btn-interactive flex items-center gap-1.5 text-xs font-mono font-bold shadow-xs"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline text-white">LIGHT MODE</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-white" />
              <span className="hidden md:inline text-white">DARK MODE</span>
            </>
          )}
        </button>

        {currentUser?.role === 'PARTICIPANT' && warningCount > 0 && (
          <div className="flex items-center gap-2 bg-[#A30B1A]/20 dark:bg-[#991B1B]/40 border border-[#D60303] text-[#D60303] dark:text-[#f4f4f5] text-xs px-3 py-1.5 rounded-lg font-mono font-medium animate-pulse">
            <Shield className="w-4 h-4 text-[#D60303]" />
            <span>Warnings: <strong className="text-zinc-900 dark:text-white">{warningCount}</strong></span>
          </div>
        )}

        {/* System Notification Icon */}
        <div className="relative cursor-pointer p-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] border border-red-500/80 text-white transition btn-interactive">
          <Bell className="w-4 h-4 text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white"></span>
        </div>

        {/* User Card */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-3 border-l border-red-500/40">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-[#141417] border border-red-500/60 flex items-center justify-center shadow-xs transition-transform hover:scale-105 overflow-hidden p-0.5" title={currentUser.name}>
              <img src="/technova_icon.jpg" alt={currentUser.name || 'User Profile'} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#595959] dark:text-[#a1a1aa] font-mono">
                <span className="font-bold text-[#D60303]">{currentUser.id}</span>
                {currentUser.role === 'PARTICIPANT' && (
                  <button
                    onClick={copyParticipantId}
                    title="Copy Participant ID"
                    className="p-1 rounded bg-[#D60303] text-white hover:bg-[#A30B1A] transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={logoutUser}
              title="Logout"
              className="p-2 text-white bg-[#D60303] hover:bg-[#A30B1A] rounded-lg border border-red-500/80 transition ml-1 cursor-pointer btn-interactive"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentScreen('login')}
            className="px-4 py-1.5 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white border border-red-500/80 text-xs font-mono font-bold transition shadow-sm btn-interactive cursor-pointer"
          >
            SIGN IN
          </button>
        )}
      </div>
    </header>
  );
}
