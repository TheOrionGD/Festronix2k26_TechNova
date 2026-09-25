import React from 'react';
import { useApp } from '../context/useApp';
import { Bell, Copy, Shield, LogOut, Sun, Moon, Clock } from 'lucide-react';

export default function Header() {
  const { 
    currentUser, 
    logoutUser, 
    setCurrentScreen, 
    warningCount, 
    theme, 
    toggleTheme,
    notifications,
    isNotificationsOpen,
    toggleNotifications,
    markAllNotificationsRead,
    announcements,
    eventState,
    roundTimeLeft,
    formatRoundTime
  } = useApp();

  const copyParticipantId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      alert(`Copied Participant ID: ${currentUser.id}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-md border-b border-red-500/50 px-6 flex items-center justify-between sticky top-0 z-40 text-[#595959] dark:text-[#f4f4f5] transition-colors duration-200 shrink-0 select-none">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => {
            if (currentUser?.role === 'ADMIN') setCurrentScreen('admin');
            else if (currentUser?.role === 'COORDINATOR') setCurrentScreen('coordinator');
            else if (currentUser?.role === 'PARTICIPANT') setCurrentScreen('dashboard');
            else setCurrentScreen('landing');
          }}
        >
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

      {/* Center: Live Round Time & Status Badge */}
      {eventState?.status?.includes('_RUNNING') && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 dark:bg-red-500/20 border-2 border-[#D60303] text-zinc-900 dark:text-white shadow-xs font-mono text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D60303] animate-ping" />
          <span className="text-[#D60303] uppercase tracking-wider">
            {eventState.status === 'ROUND_1_RUNNING' && 'R1 QUIZ'}
            {eventState.status === 'ROUND_2_RUNNING' && 'R2 DEBUG'}
            {eventState.status === 'ROUND_3_RUNNING' && 'R3 HUNT'}
          </span>
          <span className="text-zinc-400">|</span>
          <span className={`flex items-center gap-1.5 ${roundTimeLeft < 300 ? 'text-[#D60303] font-black animate-bounce' : 'text-zinc-800 dark:text-zinc-100'}`}>
            <Clock className="w-3.5 h-3.5 text-[#D60303] animate-pulse" />
            <span>{formatRoundTime(roundTimeLeft)}</span>
          </span>
        </div>
      )}
      {['ROUND_1_ENDED', 'ROUND_2_ENDED', 'ROUND_3_ENDED', 'COMPLETED'].includes(eventState?.status) && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>{eventState.status.replace(/_/g, ' ')}</span>
        </div>
      )}

      {/* Right: Theme Toggle, Anti-cheat indicator, Notifications, User info & Actions */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
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

        {/* System Notification Icon with Interactive Drawer Toggle */}
        <div 
          onClick={toggleNotifications}
          className="relative cursor-pointer p-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] border border-red-500/80 text-white transition btn-interactive"
        >
          <Bell className="w-4 h-4 text-white" />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white"></span>
            </>
          )}
        </div>

        {/* NOTIFICATIONS DROPDOWN DRAWER */}
        {isNotificationsOpen && (
          <div className="absolute right-20 top-14 w-80 sm:w-96 bg-white dark:bg-[#141417] border-2 border-[#D60303] rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-slide-up text-left">
            <div className="flex items-center justify-between border-b border-red-500/40 pb-2">
              <span className="text-xs font-mono font-bold text-[#D60303] uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#D60303]" /> System Notifications
              </span>
              <button 
                onClick={markAllNotificationsRead} 
                className="text-[10px] font-mono text-zinc-500 dark:text-[#a1a1aa] hover:text-[#D60303] cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {notifications.map(n => (
                <div key={n.id} className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                  n.read ? 'bg-zinc-50 dark:bg-[#09090b] border-zinc-200 dark:border-[#27272a]' : 'bg-red-50 dark:bg-[#991B1B]/20 border-red-300 dark:border-red-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white text-[11px] font-mono">{n.title}</span>
                    <span className="text-[9px] font-mono text-zinc-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-[#a1a1aa] leading-snug">{n.message}</p>
                </div>
              ))}

              {announcements.map(a => (
                <div key={a.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#D60303] text-[11px] font-mono">{a.title}</span>
                    <span className="text-[9px] font-mono text-zinc-400">{a.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-[#a1a1aa] leading-snug">{a.message}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                toggleNotifications();
                setCurrentScreen('announcements');
              }}
              className="w-full py-2 bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-mono font-bold rounded-xl transition cursor-pointer btn-interactive text-center block"
            >
              View All Announcements & Notifications →
            </button>
          </div>
        )}

        {/* User Card */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-3 border-l border-red-500/40">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-[#141417] border border-red-500/60 flex items-center justify-center shadow-xs transition-transform hover:scale-105 overflow-hidden p-0.5" title={currentUser.name}>
              <img src="/technova_icon.jpg" alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate max-w-[130px]">{currentUser.name}</p>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  currentUser.role === 'ADMIN' ? 'bg-red-500 text-white' : currentUser.role === 'COORDINATOR' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {currentUser.role}
                </span>
              </div>
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
