import React from 'react';
import { useApp } from '../context/useApp';
import {
  LayoutDashboard,
  CheckCircle2,
  Code2,
  Lock,
  Trophy,
  FileText,
  Megaphone,
  User,
  HelpCircle,
  ShieldCheck,
  CheckSquare,
  Users,
  Database,
  Radio,
  Sliders,
  ShieldAlert,
  Home,
  LogIn
} from 'lucide-react';

export default function Sidebar() {
  const { currentScreen, setCurrentScreen, navigateToRound, currentUser, isRoundUnlocked } = useApp();

  const role = currentUser?.role;

  // 1. PARTICIPANT MENU ITEMS
  const participantNavItems = [
    { id: 'dashboard', label: 'Participant Dashboard', icon: LayoutDashboard, targetScreen: 'dashboard' },
    {
      id: 'round1',
      label: 'Round 1 — Tech Quiz',
      icon: CheckCircle2,
      status: isRoundUnlocked(1) ? 'active' : 'locked',
      targetScreen: 'round1'
    },
    {
      id: 'round2',
      label: 'Round 2 — Debug It',
      icon: Code2,
      status: isRoundUnlocked(2) ? 'active' : 'locked',
      targetScreen: 'round2'
    },
    {
      id: 'round3',
      label: 'Round 3 — Tech Hunt',
      icon: Lock,
      status: isRoundUnlocked(3) ? 'active' : 'locked',
      targetScreen: 'round3'
    }
  ];

  const participantSecondaryItems = [
    { id: 'announcements', label: 'Live Announcements', icon: Megaphone, targetScreen: 'announcements' },
    { id: 'rules', label: 'Competition Rules', icon: FileText, targetScreen: 'rules' },
    { id: 'profile', label: 'My Profile & Status', icon: User, targetScreen: 'profile' },
    { id: 'support', label: 'Help & Lab Assistance', icon: HelpCircle, targetScreen: 'support' }
  ];

  // 2. COORDINATOR MENU ITEMS
  const coordinatorNavItems = [
    { id: 'coord_queue', label: 'Verification Queue', icon: CheckSquare, targetScreen: 'coordinator' },
    { id: 'coord_parts', label: 'Allocated Participants', icon: Users, targetScreen: 'coordinator' },
    { id: 'coord_ann', label: 'Broadcast Announcement', icon: Radio, targetScreen: 'coordinator' },
    { id: 'coord_content', label: 'Questions & Clues Hub', icon: Database, targetScreen: 'coordinator' },
    { id: 'coord_lead', label: 'Live Symposium Standings', icon: Trophy, targetScreen: 'coordinator' }
  ];

  const coordinatorSecondaryItems = [
    { id: 'rules', label: 'Coordinator SOP & Rules', icon: FileText, targetScreen: 'rules' },
    { id: 'announcements', label: 'All Announcements Feed', icon: Megaphone, targetScreen: 'announcements' },
    { id: 'profile', label: 'Coordinator Profile', icon: User, targetScreen: 'profile' }
  ];

  // 3. ADMIN MENU ITEMS
  const adminNavItems = [
    { id: 'admin_control', label: 'Event Master Lifecycle', icon: Sliders, targetScreen: 'admin' },
    { id: 'admin_users', label: 'User & Coordinator Accounts', icon: Users, targetScreen: 'admin' },
    { id: 'admin_content', label: 'Full Question & Clue Bank', icon: Database, targetScreen: 'admin' },
    { id: 'admin_ann', label: 'Broadcast Announcements', icon: Radio, targetScreen: 'admin' },
    { id: 'admin_logs', label: 'Anti-Cheat & Audit Logs', icon: ShieldAlert, targetScreen: 'admin' },
    { id: 'admin_scores', label: 'Master Scoreboard & Export', icon: Trophy, targetScreen: 'admin' }
  ];

  const adminSecondaryItems = [
    { id: 'coordinator', label: 'Open Coordinator View', icon: ShieldCheck, targetScreen: 'coordinator' },
    { id: 'rules', label: 'Event Master Rules', icon: FileText, targetScreen: 'rules' },
    { id: 'announcements', label: 'Public Announcements', icon: Megaphone, targetScreen: 'announcements' }
  ];

  // 4. GUEST / NON-LOGGED IN MENU ITEMS
  const guestNavItems = [
    { id: 'landing', label: 'Home Page', icon: Home, targetScreen: 'landing' },
    { id: 'login', label: 'Sign In to Portal', icon: LogIn, targetScreen: 'login' },
    { id: 'rules', label: 'Competition Rules', icon: FileText, targetScreen: 'rules' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, targetScreen: 'announcements' }
  ];

  let primaryItems = participantNavItems;
  let secondaryItems = participantSecondaryItems;
  let primaryTitle = 'Participant Competition';
  let secondaryTitle = 'Participant Resources';

  if (role === 'COORDINATOR') {
    primaryItems = coordinatorNavItems;
    secondaryItems = coordinatorSecondaryItems;
    primaryTitle = 'Coordinator Workspace';
    secondaryTitle = 'Operational Tools';
  } else if (role === 'ADMIN') {
    primaryItems = adminNavItems;
    secondaryItems = adminSecondaryItems;
    primaryTitle = 'Admin Command Center';
    secondaryTitle = 'System Portals';
  } else if (!currentUser) {
    primaryItems = guestNavItems;
    secondaryItems = [];
    primaryTitle = 'Technova Symposium';
    secondaryTitle = '';
  }

  return (
    <aside className="w-64 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-md border-r border-red-500/50 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 text-[#595959] dark:text-[#a1a1aa] transition-colors duration-200">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider font-mono">{primaryTitle}</p>
            {role && (
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                role === 'ADMIN' ? 'bg-red-500 text-white' : role === 'COORDINATOR' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {role}
              </span>
            )}
          </div>

          {primaryItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.targetScreen;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id.startsWith('round')) {
                    navigateToRound(item.targetScreen);
                  } else {
                    setCurrentScreen(item.targetScreen);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer border ${
                  isActive
                    ? 'bg-[#D60303] text-white border-red-400 shadow-md transform translate-x-1'
                    : 'bg-[#D60303] text-white border-red-500/70 hover:bg-[#A30B1A] hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-white transition-transform duration-200 group-hover:scale-110 shrink-0" />
                  <span className="text-white truncate">{item.label}</span>
                </div>

                {item.status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                )}
                {item.status === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0"></span>
                )}
                {item.status === 'locked' && (
                  <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        {secondaryItems.length > 0 && (
          <div className="space-y-1 pt-4 border-t border-red-500/40">
            <p className="px-3 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 font-mono">{secondaryTitle}</p>
            {secondaryItems.map(item => {
              const Icon = item.icon;
              const isActive = currentScreen === item.targetScreen;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.targetScreen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-[#A30B1A] text-white border-red-400 transform translate-x-1'
                      : 'bg-[#D60303] text-white border-red-500/70 hover:bg-[#A30B1A] hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-white shrink-0" />
                    <span className="text-white truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Branding Graphic */}
      <div className="p-4 border-t border-[#595959]/20 dark:border-[#27272a] bg-[#595959]/5 dark:bg-[#141417]/50 relative overflow-hidden">
        <svg className="absolute bottom-0 left-0 opacity-15 w-full h-16 text-[#D60303] animate-pulse-glow" viewBox="0 0 100 40" fill="none">
          <path d="M0 30 H30 L45 15 H80 L100 35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="45" cy="15" r="2.5" fill="currentColor" />
          <circle cx="80" cy="15" r="2.5" fill="currentColor" />
        </svg>

        <div className="relative z-10">
          <p className="text-[11px] font-bold text-[#595959] dark:text-[#a1a1aa] tracking-wider">
            Decode <span className="text-[#D60303]">•</span> Debug <span className="text-[#D60303]">•</span> Discover
          </p>
          <p className="text-[10px] font-black text-[#A30B1A] dark:text-[#ef4444] tracking-widest mt-0.5 uppercase font-mono">
            TECHNOVA 2026
          </p>
          <p className="text-[9px] font-mono text-zinc-400/80 dark:text-zinc-600/80 mt-1 select-none font-medium">
            The system is built using Antigravity
          </p>
        </div>
      </div>
    </aside>
  );
}
