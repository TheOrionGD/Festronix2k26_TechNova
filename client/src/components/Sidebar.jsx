import React from 'react';
import { useApp } from '../context/AppContext';
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
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { currentScreen, setCurrentScreen, currentUser } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, targetScreen: 'dashboard' },
    {
      id: 'round1',
      label: 'Round 1 — Tech Quiz',
      icon: CheckCircle2,
      status: 'completed',
      targetScreen: 'round1'
    },
    {
      id: 'round2',
      label: 'Round 2 — Debug It',
      icon: Code2,
      status: 'active',
      targetScreen: 'round2'
    },
    {
      id: 'round3',
      label: 'Round 3 — Tech Hunt',
      icon: Lock,
      status: 'locked',
      targetScreen: 'round3'
    }
  ];

  const secondaryNavItems = [
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck, role: 'ADMIN', targetScreen: 'admin' },
    { id: 'coordinator', label: 'Coordinator Workspace', icon: Trophy, role: 'COORDINATOR', targetScreen: 'coordinator' },
    { id: 'rules', label: 'Event Rules', icon: FileText, targetScreen: 'landing' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, targetScreen: 'dashboard' },
    { id: 'profile', label: 'Profile', icon: User, targetScreen: 'dashboard' },
    { id: 'support', label: 'Help & Support', icon: HelpCircle, targetScreen: 'dashboard' }
  ];

  return (
    <aside className="w-64 bg-white/40 dark:bg-zinc-900/50 backdrop-blur-md border-r border-red-500/50 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 text-[#595959] dark:text-[#a1a1aa] transition-colors duration-200">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 font-mono">Main Navigation</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.targetScreen;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.targetScreen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer border ${
                  isActive
                    ? 'bg-[#D60303] text-white border-red-400 shadow-md transform translate-x-1'
                    : 'bg-[#D60303] text-white border-red-500/70 hover:bg-[#A30B1A] hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-white transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-white">{item.label}</span>
                </div>

                {item.status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
                {item.status === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                )}
                {item.status === 'locked' && (
                  <Lock className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Portals & Secondary */}
        <div className="space-y-1 pt-4 border-t border-red-500/40">
          <p className="px-3 text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2 font-mono">System Portals</p>
          {secondaryNavItems.map(item => {
            const Icon = item.icon;
            if (item.role && currentUser?.role !== item.role && currentUser?.role !== 'ADMIN') {
              return null;
            }
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
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-white">{item.label}</span>
                </div>
                {item.role && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-white text-[#D60303]">
                    {item.role}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
        </div>
      </div>
    </aside>
  );
}
