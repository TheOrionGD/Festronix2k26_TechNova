import React, { useState } from 'react';
import { useApp } from '../context/useApp';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CoordinatorModal from '../components/CoordinatorModal';
import { 
  Copy, 
  Building2, 
  CheckCircle2, 
  Lock, 
  FileCode2, 
  BookOpen, 
  Send, 
  Megaphone, 
  FileText, 
  ChevronRight,
  Award,
  User,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Brain,
  Compass,
  Clock,
  Radio,
  Check
} from 'lucide-react';

export default function Dashboard() {
  const { 
    currentUser, 
    currentScreen,
    setCurrentScreen, 
    navigateToRound,
    isRoundUnlocked,
    isRoundActive,
    isRoundCompleted,
    debugSubmissions, 
    submitDebugCode,
    setIsCoordinatorModalOpen,
    setPendingVerificationProblemId,
    announcements,
    debugProblems,
    leaderboard,
    eventState
  } = useApp();

  const userLeaderboardEntry = leaderboard.find(l => l.id === currentUser?.id) || {};
  const r1Score = userLeaderboardEntry.r1 || 0;
  const r2Score = userLeaderboardEntry.r2 || 0;

  const [activeProblemId, setActiveProblemId] = useState(1);
  const currentProblem = debugProblems.find(p => p.id === activeProblemId) || debugProblems[0];
  const submission = debugSubmissions[activeProblemId] || {};

  const [correctedCodeInput, setCorrectedCodeInput] = useState(submission.code);
  const [outputInput, setOutputInput] = useState(submission.output);
  const [announcementSearch, setAnnouncementSearch] = useState('');

  const handleUpdateSubmission = (e) => {
    e.preventDefault();
    if (!currentProblem) return;
    submitDebugCode(activeProblemId, correctedCodeInput, outputInput);
    alert('Submission updated! Now request physical coordinator verification.');
  };

  const triggerVerificationModal = (probId) => {
    setPendingVerificationProblemId(probId);
    setIsCoordinatorModalOpen(true);
  };

  const copyParticipantId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
      alert(`Copied ID: ${currentUser.id}`);
    }
  };

  // Round Unlock & Active Helpers
  const r1Unlocked = isRoundUnlocked(1);
  const r2Unlocked = isRoundUnlocked(2);
  const r3Unlocked = isRoundUnlocked(3);

  const r1Active = isRoundActive ? isRoundActive(1) : (eventState?.status === 'ROUND_1_RUNNING');
  const r2Active = isRoundActive ? isRoundActive(2) : (eventState?.status === 'ROUND_2_RUNNING');
  const r3Active = isRoundActive ? isRoundActive(3) : (eventState?.status === 'ROUND_3_RUNNING');

  const r1Done = isRoundCompleted ? isRoundCompleted(1) : (r1Score > 0 || eventState?.status === 'ROUND_1_ENDED');
  const r2Done = isRoundCompleted ? isRoundCompleted(2) : (r2Score > 0 || eventState?.status === 'ROUND_2_ENDED');
  const r3Done = isRoundCompleted ? isRoundCompleted(3) : (eventState?.status === 'COMPLETED');

  // Render Sub-Views based on Navigation Selection
  const renderWorkspaceContent = () => {
    // ----------------------------------------------------
    // VIEW 1: DEDICATED EVENT RULES PAGE VIEW
    // ----------------------------------------------------
    if (currentScreen === 'rules') {
      return (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-red-500/60 shadow-sm space-y-2 card-border-glow">
            <div className="flex items-center gap-2 text-[#D60303]">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest">OFFICIAL REGULATIONS</span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">TECHNOVA 2026 Event Rules & Guidelines</h2>
            <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] font-medium">
              Department of Computer Science and Engineering National Level Technical Symposium Rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow">
              <div className="flex items-center gap-2.5 text-[#D60303]">
                <ShieldAlert className="w-5 h-5 micro-hover-icon" />
                <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Anti-Cheat Monitoring</h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
                Active window focus, tab switches, and full-screen exits are monitored in real time. Maximum 3 warnings allowed before automatic quiz submission.
              </p>
            </div>

            <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow">
              <div className="flex items-center gap-2.5 text-[#D60303]">
                <ShieldCheck className="w-5 h-5 micro-hover-icon" />
                <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Physical Coordinator PIN Verification</h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
                For practical debugging rounds, marks are granted only after a physical lab coordinator inspects source code execution and inputs their secret PIN.
              </p>
            </div>

            <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow">
              <div className="flex items-center gap-2.5 text-[#D60303]">
                <Lock className="w-5 h-5 micro-hover-icon" />
                <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Sequential Progression</h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
                Every round is locked by default and unlocks strictly when initiated by the Coordinator. Once a round is submitted, previous answers cannot be modified.
              </p>
            </div>

            <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-3 card-hover-lift card-shimmer card-border-glow">
              <div className="flex items-center gap-2.5 text-[#D60303]">
                <Award className="w-5 h-5 micro-hover-icon" />
                <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">Podium Scoring & Trophy</h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed font-normal">
                Cumulative scores across all 3 rounds determine the final symposium winners and podium finishers.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // VIEW 2: DEDICATED ANNOUNCEMENTS PAGE VIEW
    // ----------------------------------------------------
    if (currentScreen === 'announcements') {
      const filteredAnnouncements = announcements.filter(a => 
        a.title.toLowerCase().includes(announcementSearch.toLowerCase()) ||
        a.message.toLowerCase().includes(announcementSearch.toLowerCase())
      );

      return (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-red-500/60 shadow-sm space-y-3 card-border-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#D60303]">
                <Megaphone className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">LIVE BROADCAST</span>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                • BROADCAST ACTIVE
              </span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Symposium Announcements</h2>

            {/* Search Bar */}
            <div className="relative max-w-md pt-2">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-5" />
              <input 
                type="text"
                value={announcementSearch}
                onChange={(e) => setAnnouncementSearch(e.target.value)}
                placeholder="Search announcements..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-xl text-xs font-medium text-zinc-900 dark:text-[#f4f4f5] outline-none focus:border-[#D60303]"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredAnnouncements.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#141417] rounded-2xl border border-zinc-200 dark:border-[#27272a] text-zinc-500 text-xs font-medium">
                No announcements found matching your filter.
              </div>
            ) : (
              filteredAnnouncements.map((a) => (
                <div key={a.id} className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-2 card-hover-lift card-shimmer card-border-glow">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#D60303] text-sm font-mono">{a.title}</span>
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-100 dark:bg-[#09090b] px-2.5 py-1 rounded-md">{a.time}</span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-[#a1a1aa] leading-relaxed">{a.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // VIEW 3: DEDICATED PROFILE PAGE VIEW
    // ----------------------------------------------------
    if (currentScreen === 'profile') {
      return (
        <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-red-500/60 shadow-sm space-y-4 card-border-glow card-shimmer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#D60303] text-white flex items-center justify-center font-bold text-2xl shadow-lg font-mono">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{currentUser?.name}</h2>
                <p className="text-xs font-mono font-bold text-[#D60303]">{currentUser?.id}</p>
                <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 mt-1 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-[#27272a] text-xs">
              <div className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">COLLEGE / INSTITUTION</span>
                <span className="font-bold text-zinc-900 dark:text-white">{currentUser?.college}</span>
              </div>

              <div className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">DEPARTMENT & YEAR</span>
                <span className="font-bold text-zinc-900 dark:text-white">{currentUser?.department} — {currentUser?.year}</span>
              </div>

              <div className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">ASSIGNED LAB TERMINAL</span>
                <span className="font-bold text-[#D60303] font-mono">{currentUser?.department}</span>
              </div>

              <div className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">SECURITY TOKEN STATUS</span>
                <span className="font-bold text-emerald-500 font-mono">ACTIVE JWT BEARER</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // VIEW 4: DEDICATED HELP & SUPPORT PAGE VIEW
    // ----------------------------------------------------
    if (currentScreen === 'support') {
      return (
        <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
          <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-red-500/60 shadow-sm space-y-2 card-border-glow">
            <div className="flex items-center gap-2 text-[#D60303]">
              <HelpCircle className="w-5 h-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest">TECHNICAL HELP DESK</span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Help & Support Desk</h2>
            <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] font-medium">
              Need assistance during TECHNOVA 2026? Reach out to our student and faculty coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-2 card-hover-lift card-shimmer card-border-glow">
              <Phone className="w-5 h-5 text-[#D60303]" />
              <h3 className="font-bold text-zinc-900 dark:text-white text-xs">Student Coordinator</h3>
              <p className="text-xs font-mono text-[#D60303] font-bold">Godfrey T R</p>
              <p className="text-[11px] font-mono text-zinc-500">Phone: 9344462238</p>
            </div>

            <div className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-2 card-hover-lift card-shimmer card-border-glow">
              <User className="w-5 h-5 text-[#D60303]" />
              <h3 className="font-bold text-zinc-900 dark:text-white text-xs">Faculty In-Charge</h3>
              <p className="text-xs font-bold text-zinc-800 dark:text-white">Mrs. Vallipriyadharshini</p>
              <p className="text-[11px] text-zinc-500 font-mono">Department of CSE</p>
            </div>

            <div className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] space-y-2 card-hover-lift card-shimmer card-border-glow">
              <MapPin className="w-5 h-5 text-[#D60303]" />
              <h3 className="font-bold text-zinc-900 dark:text-white text-xs">Symposium Venue</h3>
              <p className="text-xs text-zinc-800 dark:text-white font-bold">Lab 1 & 2</p>
              <p className="text-[11px] text-zinc-500 font-mono">Circuit Block, 3rd Floor</p>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // DEFAULT VIEW: UNIFIED DASHBOARD OVERVIEW PAGE
    // ----------------------------------------------------
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-red-500/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 card-hover-lift card-shimmer card-border-glow">
          <div className="space-y-1.5 z-10">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
              Welcome back, <span className="text-[#D60303]">{currentUser?.name}!</span>
            </h2>
            <p className="text-xs text-[#595959] dark:text-[#a1a1aa] font-medium max-w-xl">
              Complete competition modules sequentially. Every round is locked by default and activates when initiated by the Coordinator.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="px-4 py-2 bg-[#EFEEEA] dark:bg-[#09090b] border border-[#595959]/30 dark:border-[#27272a] rounded-xl flex items-center gap-3 shadow-2xs">
              <div>
                <p className="text-[10px] text-[#595959] dark:text-[#71717a] uppercase tracking-wider font-bold font-mono">Participant ID</p>
                <p className="text-xs font-mono font-bold text-[#D60303]">{currentUser?.id}</p>
              </div>
              {currentUser?.id && (
                <button 
                  onClick={copyParticipantId} 
                  title="Copy Participant ID"
                  className="p-1 text-[#595959] dark:text-[#a1a1aa] hover:text-[#D60303] transition cursor-pointer btn-interactive"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="px-4 py-2 bg-[#EFEEEA] dark:bg-[#09090b] border border-[#595959]/30 dark:border-[#27272a] rounded-xl flex items-center gap-3 shadow-2xs">
              <Building2 className="w-4 h-4 text-[#D60303]" />
              <div>
                <p className="text-[10px] text-[#595959] dark:text-[#71717a] uppercase tracking-wider font-bold font-mono">College</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">{currentUser?.college}</p>
              </div>
            </div>

            <div className="px-4 py-2 bg-[#EFEEEA] dark:bg-[#09090b] border border-[#595959]/30 dark:border-[#27272a] rounded-xl flex items-center gap-3 shadow-2xs">
              <Calendar className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-[10px] text-[#595959] dark:text-[#71717a] uppercase tracking-wider font-bold font-mono">Symposium Date</p>
                <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                  <span>Sept 25, 2026</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UNIFIED ROUND STATUS CONTAINERS (ROUND 1, ROUND 2, ROUND 3) */}
        <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-6 rounded-2xl space-y-4 border border-zinc-200 dark:border-[#27272a] shadow-sm card-hover-lift card-border-glow">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#595959] dark:text-[#a1a1aa] uppercase tracking-wider font-mono flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#D60303] animate-pulse" />
              <span>Competition Rounds Status & Progression</span>
            </h3>
            <span className="text-[10px] font-mono text-[#D60303] font-bold uppercase px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
              ACTIVE PHASE: {eventState?.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Round 1 Card */}
            {!r1Unlocked ? (
              <div 
                onClick={() => {
                  alert('🔒 Round 1 is currently locked!\nIt will be activated as soon as the Lab Coordinator initiates Round 1.');
                }}
                className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/40 cursor-not-allowed group transition-all duration-300 shadow-sm"
              >
                {/* Blurred background content */}
                <div className="p-4 flex flex-col justify-between space-y-3 filter blur-[3px] opacity-35 select-none pointer-events-none">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">ROUND 1</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Tech Quiz Workstation</h4>
                    <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">20 randomized CS MCQs. Auto-advancing option selection.</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400 font-bold">20 Mins • Single Attempt</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                {/* Frosted Glass Lock Overlay */}
                <div className="absolute inset-0 z-10 bg-zinc-900/35 dark:bg-black/60 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 p-3 text-center transition-all group-hover:bg-zinc-900/45 dark:group-hover:bg-black/70">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/95 border border-red-500/60 text-red-500 flex items-center justify-center shadow-lg shadow-red-950/30 group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[11px] text-red-400 uppercase tracking-wider block">
                      ROUND 1 LOCKED
                    </span>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-400 font-mono">
                      Awaiting Coordinator Start
                    </p>
                  </div>
                </div>
              </div>
            ) : r1Active ? (
              <div 
                onClick={() => navigateToRound('round1')}
                className="p-4 rounded-2xl border-2 border-red-500 dark:border-red-500 bg-white/90 dark:bg-[#141417]/95 shadow-md shadow-red-500/10 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 card-hover-lift card-shimmer relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">ROUND 1</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ACTIVE NOW
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">Tech Quiz Workstation</h4>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">20 randomized CS MCQs. Timed assessment.</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">Score: {r1Score} pts</span>
                  <span className="flex items-center gap-1 font-bold text-xs text-red-600 dark:text-red-400">
                    <span>Launch</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => navigateToRound('round1')}
                className="p-4 rounded-2xl border border-emerald-500/40 bg-white/80 dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 card-hover-lift"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">ROUND 1</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> COMPLETED
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Tech Quiz Workstation</h4>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">Quiz module completed & submitted.</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Score: {r1Score} pts</span>
                  <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            )}

            {/* Round 2 Card */}
            {!r2Unlocked ? (
              <div 
                onClick={() => {
                  alert('🔒 Round 2 is currently locked!\nIt will be activated as soon as the Lab Coordinator initiates Round 2.');
                }}
                className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/40 cursor-not-allowed group transition-all duration-300 shadow-sm"
              >
                {/* Blurred background content */}
                <div className="p-4 flex flex-col justify-between space-y-3 filter blur-[3px] opacity-35 select-none pointer-events-none">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">ROUND 2</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Debug It Workstation</h4>
                    <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">3 Debugging problems. Physical coordinator PIN verification.</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400 font-bold">C • Python • Java</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                {/* Frosted Glass Lock Overlay */}
                <div className="absolute inset-0 z-10 bg-zinc-900/35 dark:bg-black/60 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 p-3 text-center transition-all group-hover:bg-zinc-900/45 dark:group-hover:bg-black/70">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/95 border border-red-500/60 text-red-500 flex items-center justify-center shadow-lg shadow-red-950/30 group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[11px] text-red-400 uppercase tracking-wider block">
                      ROUND 2 LOCKED
                    </span>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-400 font-mono">
                      Awaiting Coordinator Start
                    </p>
                  </div>
                </div>
              </div>
            ) : r2Active ? (
              <div 
                onClick={() => navigateToRound('round2')}
                className="p-4 rounded-2xl border-2 border-red-500 dark:border-red-500 bg-white/90 dark:bg-[#141417]/95 shadow-md shadow-red-500/10 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 card-hover-lift card-shimmer relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">ROUND 2</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ACTIVE NOW
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">Debug It Workstation</h4>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">3 Debugging problems. Physical coordinator PIN verification required.</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">Score: {r2Score} pts</span>
                  <span className="flex items-center gap-1 font-bold text-xs text-red-600 dark:text-red-400">
                    <span>Launch</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => navigateToRound('round2')}
                className="p-4 rounded-2xl border border-emerald-500/40 bg-white/80 dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 card-hover-lift"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">ROUND 2</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> COMPLETED
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Debug It Workstation</h4>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">Debugging problems verified & recorded.</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Score: {r2Score} pts</span>
                  <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            )}

            {/* Round 3 Card */}
            {!r3Unlocked ? (
              <div 
                onClick={() => {
                  alert('🔒 Round 3 is currently locked!\nIt will be activated as soon as the Lab Coordinator initiates Round 3.');
                }}
                className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/40 cursor-not-allowed group transition-all duration-300 shadow-sm"
              >
                {/* Blurred background content */}
                <div className="p-4 flex flex-col justify-between space-y-3 filter blur-[3px] opacity-35 select-none pointer-events-none">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">ROUND 3</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Campus Tech Hunt</h4>
                    <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">5 Station clues. Reach the symposium podium.</p>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-zinc-400 font-bold">Campus Clues • Podium</span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>

                {/* Frosted Glass Lock Overlay */}
                <div className="absolute inset-0 z-10 bg-zinc-900/35 dark:bg-black/60 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 p-3 text-center transition-all group-hover:bg-zinc-900/45 dark:group-hover:bg-black/70">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/95 border border-red-500/60 text-red-500 flex items-center justify-center shadow-lg shadow-red-950/30 group-hover:scale-110 transition-transform">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[11px] text-red-400 uppercase tracking-wider block">
                      ROUND 3 LOCKED
                    </span>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-400 font-mono">
                      Awaiting Coordinator Start
                    </p>
                  </div>
                </div>
              </div>
            ) : r3Active ? (
              <div 
                onClick={() => navigateToRound('round3')}
                className="p-4 rounded-2xl border-2 border-red-500 dark:border-red-500 bg-white/90 dark:bg-[#141417]/95 shadow-md shadow-red-500/10 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 card-hover-lift card-shimmer relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">ROUND 3</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-mono font-bold border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ACTIVE NOW
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">Campus Tech Hunt</h4>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">5 Station clues. Reach the symposium podium.</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-red-600 dark:text-red-400 font-bold">Final Podium</span>
                  <span className="flex items-center gap-1 font-bold text-xs text-red-600 dark:text-red-400">
                    <span>Launch</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => navigateToRound('round3')}
                className="p-4 rounded-2xl border border-emerald-500/40 bg-white/80 dark:bg-zinc-900/60 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 card-hover-lift"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">ROUND 3</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> COMPLETED
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Campus Tech Hunt</h4>
                  <p className="text-[11px] text-[#595959] dark:text-[#a1a1aa]">Tech Hunt completed.</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Symposium Finish</span>
                  <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Active Round Module (Left) & Right Sidebar Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Dynamic Round Workstation Container */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CASE 1: ALL ROUNDS LOCKED / STANDBY MODE */}
            {!r1Unlocked && (
              <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-8 rounded-2xl border border-red-500/50 dark:border-red-500/40 shadow-sm space-y-6 card-border-glow relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#D60303] flex items-center justify-center border border-red-500/30">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#D60303] uppercase tracking-widest font-mono">
                        STANDBY MODE
                      </span>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                        Competition Workstations Locked
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold tracking-wider uppercase border border-zinc-700">
                    AWAITING INITIALIZATION
                  </span>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-red-500/10 border-2 border-red-500/40 text-[#D60303] flex items-center justify-center shadow-lg shadow-red-500/10 animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 max-w-lg">
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                      All 3 Competition Rounds Are Locked
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
                      Please remain at your assigned terminal. When the Lab Coordinator clicks <span className="font-mono font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Initiate Round 1</span>, Round 1 (Tech Quiz) will automatically activate in real time.
                    </p>
                  </div>

                  {/* Readiness Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left pt-2">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="text-xs">
                        <span className="text-[10px] text-zinc-400 block font-mono">PARTICIPANT ID</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{currentUser?.id}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="text-xs">
                        <span className="text-[10px] text-zinc-400 block font-mono">TERMINAL VENUE</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{currentUser?.department || 'CSE Circuit Lab'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="text-xs">
                        <span className="text-[10px] text-zinc-400 block font-mono">ANTI-CHEAT ENGINE</span>
                        <span className="font-bold text-emerald-500 font-mono">ARMED & ACTIVE</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-spin" />
                      <div className="text-xs">
                        <span className="text-[10px] text-zinc-400 block font-mono">COORDINATOR SIGNAL</span>
                        <span className="font-bold text-amber-500 font-mono">LISTENING LIVE...</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-[#a1a1aa] font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live WebSocket Connection Active
                  </span>
                  <button 
                    onClick={() => setCurrentScreen('rules')}
                    className="text-[#D60303] hover:underline font-bold cursor-pointer"
                  >
                    Review Event Rules →
                  </button>
                </div>
              </div>
            )}

            {/* CASE 2: ROUND 1 IS ACTIVE */}
            {r1Active && (
              <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-6 rounded-2xl border-2 border-[#D60303] shadow-md space-y-6 card-hover-lift card-border-glow animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#D60303] flex items-center justify-center border border-red-500/30">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#D60303] uppercase tracking-widest font-mono">ROUND 1 ACTIVE</span>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">Tech Quiz Workstation</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase animate-pulse">
                    • IN PROGRESS
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                    Round 1 is officially live! You will receive 20 randomized Multiple Choice Questions covering core Computer Science domains.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">Questions</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">20 MCQs</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">Duration</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">20 Minutes</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-mono block uppercase">Anti-Cheat</span>
                      <span className="font-bold text-red-500 text-sm">Max 3 Warnings</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigateToRound('round1')}
                  className="w-full py-3.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md btn-interactive"
                >
                  <Brain className="w-4 h-4" />
                  <span>Launch Tech Quiz Workstation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CASE 3: ROUND 2 IS ACTIVE (INTERACTIVE DEBUG WORKSPACE) */}
            {r2Active && (
              <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-6 rounded-2xl border-2 border-[#D60303] shadow-md space-y-6 card-hover-lift card-border-glow animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center">
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#D60303] uppercase tracking-widest font-mono">ROUND 2 ACTIVE</span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Debug It Workstation</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#D60303] text-white text-[11px] font-mono font-bold tracking-wider uppercase animate-pulse">
                    ACTIVE
                  </span>
                </div>

                <p className="text-xs text-[#595959] dark:text-[#a1a1aa] font-medium">
                  Identify syntax & logical errors, execute locally, then request coordinator physical verification.
                </p>

                {debugProblems.length === 0 ? (
                  <div className="p-8 text-center bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] text-[#595959] dark:text-[#a1a1aa] text-xs font-medium">
                    No debugging problems are currently available.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-[#27272a] pb-2 text-xs">
                      {debugProblems.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveProblemId(p.id);
                            setCorrectedCodeInput(debugSubmissions[p.id]?.code);
                            setOutputInput(debugSubmissions[p.id]?.output);
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer btn-interactive ${
                            activeProblemId === p.id 
                              ? 'bg-[#D60303] text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-200 dark:hover:bg-[#1a1a1e]'
                          }`}
                        >
                          Problem {p.id}
                        </button>
                      ))}
                    </div>

                    {currentProblem && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                        <div className="bg-[#18181b] dark:bg-[#09090b] rounded-xl p-4 border border-zinc-700 dark:border-[#27272a] text-white space-y-3 flex flex-col justify-between shadow-xs">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#D60303] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                                  {currentProblem.id}
                                </span>
                                <span className="text-xs font-bold text-white">{currentProblem.title}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-[#A30B1A] text-white text-[10px] font-mono font-bold">
                                {currentProblem.difficulty}
                              </span>
                            </div>

                            <p className="text-[11px] text-zinc-400 font-mono mb-2">Language: {currentProblem.language}</p>

                            <div className="bg-black/80 p-3 rounded-lg border border-zinc-700 dark:border-[#27272a] font-mono text-[11px] leading-relaxed text-[#22c55e] relative overflow-x-auto max-h-48">
                              <pre>{currentProblem.brokenCode}</pre>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-zinc-700 dark:border-[#27272a]">
                            <button 
                              onClick={() => setCurrentScreen('round2')}
                              className="w-full py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>View Workstation Instructions</span>
                            </button>
                          </div>
                        </div>

                        <form onSubmit={handleUpdateSubmission} className="bg-white dark:bg-[#09090b] rounded-xl p-4 border border-zinc-200 dark:border-[#27272a] space-y-3 flex flex-col justify-between shadow-xs">
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                              <span>Your Submission</span>
                              {submission.status === 'VERIFIED' && (
                                <span className="text-[10px] text-emerald-600 dark:text-[#22c55e] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> VERIFIED ({submission.marks} Marks)
                                </span>
                              )}
                            </p>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Corrected Code</label>
                              <textarea
                                rows={3}
                                value={correctedCodeInput}
                                onChange={(e) => setCorrectedCodeInput(e.target.value)}
                                className="w-full p-2 bg-[#F8F7F4] dark:bg-[#141417] border border-zinc-300 dark:border-[#27272a] rounded-lg font-mono text-[11px] text-zinc-900 dark:text-[#f4f4f5] focus:border-[#D60303] focus:outline-none transition-colors"
                                placeholder="// Paste your corrected solution code here..."
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-600 dark:text-[#a1a1aa] mb-1 font-mono">Terminal Output</label>
                              <textarea
                                rows={2}
                                value={outputInput}
                                onChange={(e) => setOutputInput(e.target.value)}
                                className="w-full p-2 bg-[#F8F7F4] dark:bg-[#141417] border border-zinc-300 dark:border-[#27272a] rounded-lg font-mono text-[11px] text-zinc-900 dark:text-[#f4f4f5] focus:border-[#D60303] focus:outline-none transition-colors"
                                placeholder="// Observed execution output..."
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-[#27272a]">
                            <button
                              type="submit"
                              className="w-full py-2 rounded-lg bg-zinc-100 dark:bg-[#141417] border border-zinc-300 dark:border-[#27272a] hover:bg-zinc-200 dark:hover:bg-[#1a1a1e] text-zinc-900 dark:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer btn-interactive"
                            >
                              <Send className="w-3.5 h-3.5 text-[#D60303]" />
                              <span>Update Solution</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => triggerVerificationModal(activeProblemId)}
                              className="w-full py-2 rounded-lg bg-[#D60303] hover:bg-[#A30B1A] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs btn-interactive"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Call Coordinator to Verify</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* CASE 4: ROUND 3 IS ACTIVE */}
            {r3Active && (
              <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-6 rounded-2xl border-2 border-[#D60303] shadow-md space-y-6 card-hover-lift card-border-glow animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#D60303] flex items-center justify-center border border-red-500/30">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#D60303] uppercase tracking-widest font-mono">ROUND 3 ACTIVE</span>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">Campus Tech Hunt</h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase animate-pulse">
                    • FINAL STAGE
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                    The final championship round is active! Solve 5 sequential campus technology station clues to reach the symposium podium.
                  </p>
                </div>

                <button 
                  onClick={() => navigateToRound('round3')}
                  className="w-full py-3.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-white text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md btn-interactive"
                >
                  <Compass className="w-4 h-4" />
                  <span>Launch Campus Tech Hunt Workstation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* CASE 5: ROUND 1 COMPLETED & WAITING FOR ROUND 2 */}
            {r1Done && !r2Unlocked && !r1Active && (
              <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift card-border-glow animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">
                      Round 1 Concluded — Quiz Score: {r1Score} pts
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold border border-amber-500/20">
                    WAITING FOR ROUND 2
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
                  You have successfully submitted your Round 1 Tech Quiz. Round 2 (Debug It) will unlock as soon as the Lab Coordinator initiates Round 2.
                </p>
              </div>
            )}

            {/* CASE 6: ROUND 2 COMPLETED & WAITING FOR ROUND 3 */}
            {r2Done && !r3Unlocked && !r2Active && (
              <div className="bg-white/80 dark:bg-[#141417]/90 backdrop-blur-md p-6 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift card-border-glow animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">
                      Round 2 Concluded — Debug Score: {r2Score} pts
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold border border-amber-500/20">
                    WAITING FOR ROUND 3
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] leading-relaxed">
                  All Round 2 debugging submissions have been recorded. Round 3 (Campus Tech Hunt) will unlock when the Coordinator initiates the final round.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Quick Stats & Announcements */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift card-border-glow">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="text-[#D60303]">★</span> Live Score Summary
              </h3>

              <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-[#27272a] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#595959] dark:text-[#a1a1aa] font-semibold">Round 1 Quiz Score</span>
                  <span className="font-bold text-[#A30B1A] dark:text-[#ef4444] font-mono">{r1Score} pts</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#595959] dark:text-[#a1a1aa] font-semibold">Round 2 Debug Score</span>
                  <span className="font-bold text-[#D60303] font-mono">{r2Score} pts</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift card-border-glow">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Megaphone className="w-4 h-4 text-[#D60303]" />
                  <span>Important Announcements</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                {announcements.length === 0 ? (
                  <p className="text-[#595959] dark:text-[#71717a] py-4 text-center font-medium">No announcements available.</p>
                ) : (
                  announcements.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-3 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-1 transition-all hover:border-[#D60303]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#A30B1A] dark:text-[#ef4444] text-[11px]">{a.title}</span>
                        <span className="text-[10px] text-[#595959] dark:text-[#71717a] font-mono">{a.time}</span>
                      </div>
                      <p className="text-[11px] text-zinc-700 dark:text-[#a1a1aa] leading-snug font-medium">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div 
              onClick={() => setCurrentScreen('rules')}
              className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-zinc-200 dark:border-[#27272a] hover:border-[#D60303] transition-all cursor-pointer flex items-center justify-between shadow-sm card-hover-lift card-shimmer card-border-glow"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#D60303]" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Event Rules & Guidelines</p>
                  <p className="text-[11px] text-[#595959] dark:text-[#71717a] font-medium">View symposium regulations & anti-cheat rules.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#595959] dark:text-[#71717a] shrink-0" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full min-w-0 animate-hero-entrance">
          {renderWorkspaceContent()}
        </main>
      </div>
    </div>
  );
}
