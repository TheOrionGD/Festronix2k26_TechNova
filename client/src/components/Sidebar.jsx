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
    <aside className="w-64 bg-[#EFEEEA] border-r border-[#595959]/30 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 text-[#595959]">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-[#595959]/70 uppercase tracking-wider mb-2">Main Navigation</p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.targetScreen;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.targetScreen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive 
                    ? 'bg-[#D60303] text-[#EFEEEA] shadow-md' 
                    : 'text-[#595959] hover:bg-[#595959]/10 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-[#EFEEEA]' : 
                    item.status === 'completed' ? 'text-[#A30B1A]' : 
                    item.status === 'active' ? 'text-[#D60303]' : 'text-[#595959]'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.status === 'completed' && (
                  <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-[#EFEEEA]' : 'text-[#A30B1A]'}`} />
                )}
                {item.status === 'active' && (
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#EFEEEA]' : 'bg-[#D60303]'} animate-ping`}></span>
                )}
                {item.status === 'locked' && (
                  <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-[#EFEEEA]' : 'text-[#595959]'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Portals & Secondary */}
        <div className="space-y-1 pt-4 border-t border-[#595959]/20">
          <p className="px-3 text-[11px] font-bold text-[#595959]/70 uppercase tracking-wider mb-2">System Portals</p>
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#A30B1A] text-[#EFEEEA]'
                    : 'text-[#595959] hover:bg-[#595959]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#EFEEEA]' : 'text-[#595959]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.role && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? 'bg-[#EFEEEA] text-[#A30B1A]' : 'bg-[#A30B1A] text-[#EFEEEA]'
                  }`}>
                    {item.role}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Branding Graphic */}
      <div className="p-4 border-t border-[#595959]/20 bg-[#595959]/5 relative overflow-hidden">
        <svg className="absolute bottom-0 left-0 opacity-15 w-full h-16 text-[#D60303]" viewBox="0 0 100 40" fill="none">
          <path d="M0 30 H30 L45 15 H80 L100 35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
          <circle cx="45" cy="15" r="2.5" fill="currentColor"/>
          <circle cx="80" cy="15" r="2.5" fill="currentColor"/>
        </svg>

        <div className="relative z-10">
          <p className="text-[11px] font-bold text-[#595959] tracking-wider">
            Decode <span className="text-[#D60303]">•</span> Debug <span className="text-[#D60303]">•</span> Discover
          </p>
          <p className="text-[10px] font-black text-[#A30B1A] tracking-widest mt-0.5 uppercase">
            TECHNOVA 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
