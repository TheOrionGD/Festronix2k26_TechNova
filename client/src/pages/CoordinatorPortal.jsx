import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CoordinatorModal from '../components/CoordinatorModal';
import ContentManagementHub from '../components/ContentManagementHub';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Clock,
  Database,
  CheckSquare,
  Users,
  UserPlus,
  Upload,
  Trash2,
  KeyRound,
  Megaphone,
  Send,
  Radio,
  Trophy,
  Sparkles,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export default function CoordinatorPortal() {
  const { 
    currentUser, 
    setIsCoordinatorModalOpen, 
    setPendingVerificationProblemId, 
    fetchLeaderboard,
    leaderboard,
    announcements,
    createAnnouncement,
    eventState,
    updateEventState
  } = useApp();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'participants' | 'announcements' | 'content' | 'leaderboard'
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Announcement Creation State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTag, setAnnTag] = useState('ROUND_UPDATE');
  const [isPostingAnn, setIsPostingAnn] = useState(false);
  const [annStatusMsg, setAnnStatusMsg] = useState({ text: '', type: '' });

  const handleSetRoundStatus = (status, activeRound) => {
    updateEventState({ status, activeRound });
    alert(`⚡ Event Status Updated to: ${status}`);
  };

  // Participant Management State
  const [participantsList, setParticipantsList] = useState([]);
  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [partName, setPartName] = useState('');
  const [partEmail, setPartEmail] = useState('');
  const [partCollege, setPartCollege] = useState('K. Ramakrishnan College of Technology');
  const [partDept, setPartDept] = useState('CSE');
  const [partYear, setPartYear] = useState('III');
  const [partMsg, setPartMsg] = useState('');
  // Participant Filter State
  const [filterMyTerminal, setFilterMyTerminal] = useState(false);

  // Bulk Count Generator State
  const [isCountGenOpen, setIsCountGenOpen] = useState(false);
  const [genCountInput, setGenCountInput] = useState('10');
  const [genDept, setGenDept] = useState('CSE');
  const [genYear, setGenYear] = useState('III');
  const [genCollege, setGenCollege] = useState('K. Ramakrishnan College of Technology');
  const [isGenCreating, setIsGenCreating] = useState(false);

  const myAllocatedCount = participantsList.filter(
    p => p.assignedCoordinator === currentUser?.id || (currentUser?.assignedRound && p.assignedRound === currentUser?.assignedRound)
  ).length;

  // Leaderboard Sorting & Progression Filter State
  const [leaderboardFilter, setLeaderboardFilter] = useState('ALL'); // 'ALL' | 'R1' | 'R2' | 'R3'
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  const displayedParticipants = filterMyTerminal
    ? participantsList.filter(p => p.assignedCoordinator === currentUser?.id || (currentUser?.assignedRound && p.assignedRound === currentUser?.assignedRound))
    : participantsList;

  const handleExecuteCountGeneration = async (e) => {
    e.preventDefault();
    const count = parseInt(genCountInput);
    if (isNaN(count) || count <= 0) {
      alert('Please enter a valid participant count (e.g. 10).');
      return;
    }

    setIsGenCreating(true);
    try {
      const startIdx = participantsList.length + 1;
      const generatedList = [];
      for (let i = 0; i < count; i++) {
        const idxNum = startIdx + i;
        generatedList.push({
          name: `Participant ${String(idxNum).padStart(3, '0')}`,
          email: `participant${idxNum}@technova.edu`,
          department: genDept,
          year: genYear,
          college: genCollege
        });
      }

      const res = await fetch(`${API_BASE}/coordinator/participants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantsList: generatedList })
      });
      const data = await res.json();
      if (data.success) {
        await fetchParticipants();
        await fetchLeaderboard();
        setIsCountGenOpen(false);
        alert(`✅ Created ${data.createdCount} participants with ID = Password credentials! Participants auto-assigned equally across coordinators.`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error generating participants: ' + err.message);
    } finally {
      setIsGenCreating(false);
    }
  };

  const fetchCoordinatorQueue = async () => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/submissions`);
      const data = await res.json();
      if (data.success) {
        setSubmissionsList(data.submissions);
      }
    } catch (err) {
      console.error('Fetch coordinator queue error:', err);
      setSubmissionsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users?role=PARTICIPANT`);
      const data = await res.json();
      if (data.success) {
        setParticipantsList(data.users || []);
      }
    } catch (err) {
      console.error('Fetch participants error:', err);
      setParticipantsList([]);
    }
  };

  // College Dropdown List State
  const [collegesList, setCollegesList] = useState([
    'K. Ramakrishnan College of Technology',
    'Anna University',
    'Saranathan College of Engineering',
    'National Institute of Technology Trichy',
    'SASTRA Deemed University',
    'Government College of Engineering'
  ]);
  const [newCollegeInput, setNewCollegeInput] = useState('');
  const [isAddingNewCollege, setIsAddingNewCollege] = useState(false);

  const fetchColleges = async () => {
    try {
      const res = await fetch(`${API_BASE}/colleges`);
      const data = await res.json();
      if (data.success && Array.isArray(data.colleges)) {
        setCollegesList(data.colleges);
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
    }
  };

  const handleAddNewCollege = async () => {
    if (!newCollegeInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/colleges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollegeInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        await fetchColleges();
        setPartCollege(newCollegeInput.trim());
        setGenCollege(newCollegeInput.trim());
        setNewCollegeInput('');
        setIsAddingNewCollege(false);
      }
    } catch (err) {
      console.error('Add new college error:', err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCoordinatorQueue();
      fetchParticipants();
      fetchColleges();
    });
  }, []);

  const handleVerifyClick = (problemId) => {
    setPendingVerificationProblemId(problemId);
    setIsCoordinatorModalOpen(true);
  };

  const handleCreateParticipant = async (e) => {
    e.preventDefault();
    setPartMsg('');
    if (!partName.trim() || !partEmail.trim()) {
      setPartMsg('Name and Email are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/coordinator/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partName.trim(),
          email: partEmail.trim(),
          college: partCollege,
          department: partDept,
          year: partYear
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchParticipants();
        fetchLeaderboard();
        setPartName('');
        setPartEmail('');
        setIsCreatingPart(false);
        alert(`Participant ${data.user.id} created! Credentials: User ID = ${data.user.id}, Password = ${data.generatedPassword}`);
      } else {
        setPartMsg(data.message);
      }
    } catch (err) {
      console.error('Create participant error:', err);
      setPartMsg('Server communication error.');
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) {
      setAnnStatusMsg({ text: 'Please fill in both Announcement Title and Message.', type: 'error' });
      return;
    }
    setIsPostingAnn(true);
    setAnnStatusMsg({ text: '', type: '' });
    try {
      const result = await createAnnouncement({
        title: annTitle.trim(),
        message: annMessage.trim(),
        tag: annTag,
        author: currentUser?.name ? `${currentUser.name} (${currentUser.id})` : currentUser?.id || 'Lab Coordinator'
      });
      if (result.success) {
        setAnnTitle('');
        setAnnMessage('');
        setAnnTag('ROUND_UPDATE');
        setAnnStatusMsg({ text: 'Announcement successfully broadcasted to all participants!', type: 'success' });
        setTimeout(() => setAnnStatusMsg({ text: '', type: '' }), 5000);
      } else {
        setAnnStatusMsg({ text: result.message || 'Failed to post announcement.', type: 'error' });
      }
    } catch (err) {
      console.error('Post announcement error:', err);
      setAnnStatusMsg({ text: 'Server communication error.', type: 'error' });
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleBulkImportParticipants = async (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(bulkJsonInput);
      if (!Array.isArray(parsed)) {
        alert('Invalid JSON. Array of participant objects expected.');
        return;
      }

      const res = await fetch(`${API_BASE}/coordinator/participants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantsList: parsed })
      });
      const data = await res.json();
      if (data.success) {
        fetchParticipants();
        fetchLeaderboard();
        setBulkJsonInput('');
        setIsBulkImportOpen(false);
        alert(`Successfully imported ${data.createdCount} participants! Password for each is set identical to User ID.`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Invalid JSON syntax: ' + err.message);
    }
  };

  const handleDeleteParticipant = async (id) => {
    if (!window.confirm(`Are you sure you want to remove Participant ${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchParticipants();
        fetchLeaderboard();
      }
    } catch (err) {
      console.error('Delete participant error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#595959] dark:text-[#f4f4f5] flex flex-col transition-colors duration-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full min-w-0 animate-hero-entrance">
          {/* Header */}
          <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#D60303] uppercase tracking-widest">COORDINATOR CONTROL CENTER</span>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">TECHNOVA CONTENT & VERIFICATION WORKSPACE</h2>
                <p className="text-xs text-zinc-600 dark:text-[#a1a1aa] font-medium">Manage competition participants, questions, and physical lab terminal verification.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-white font-bold shadow-2xs">
                STATION: {currentUser?.assignedRound}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-white font-bold shadow-2xs">
                COORD: {currentUser?.id} ({myAllocatedCount} Assigned)
              </span>
            </div>
          </div>

          {/* REAL-TIME EVENT ROUND CONTROL BAR */}
          <div className="bg-white dark:bg-[#141417] p-5 rounded-2xl border-2 border-[#D60303] shadow-md space-y-3 card-hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D60303] animate-pulse" />
                <h3 className="font-mono font-bold text-zinc-900 dark:text-white text-sm uppercase">
                  Lab Coordinator Round Access Controls
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#D60303] text-white">
                CURRENT STATUS: {eventState?.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-xs font-bold font-mono">
              <button
                onClick={() => handleSetRoundStatus('ROUND_1_RUNNING', 1)}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer btn-interactive text-center"
              >
                ▶ Initiate Round 1
              </button>

              <button
                onClick={() => handleSetRoundStatus('ROUND_1_ENDED', 1)}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer btn-interactive text-center"
              >
                ⏹ End Round 1
              </button>

              <button
                onClick={() => handleSetRoundStatus('ROUND_2_RUNNING', 2)}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer btn-interactive text-center"
              >
                ▶ Initiate Round 2
              </button>

              <button
                onClick={() => handleSetRoundStatus('ROUND_2_ENDED', 2)}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer btn-interactive text-center"
              >
                ⏹ End Round 2
              </button>

              <button
                onClick={() => handleSetRoundStatus('ROUND_3_RUNNING', 3)}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer btn-interactive text-center"
              >
                ▶ Initiate Round 3
              </button>

              <button
                onClick={() => handleSetRoundStatus('REGISTRATION', 1)}
                className="p-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-800 text-white transition cursor-pointer btn-interactive text-center"
              >
                🔒 Reset / Lock All
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-[#27272a] pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'verification' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Verification Queue ({submissionsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'participants' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Participants ({participantsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'announcements' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <Megaphone className="w-4 h-4 text-amber-300" />
              <span>Broadcast Announcements ({announcements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'content' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <Database className="w-4 h-4" />
              <span>Questions & Clues Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'leaderboard' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Live Leaderboard</span>
            </button>
          </div>

          {/* Tab 1: Physical Verification Queue */}
          {activeTab === 'verification' && (
            <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift animate-slide-up">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Round 2 Solution Verification Queue</h3>

              {isLoading ? (
                <p className="text-xs text-[#595959] py-6 text-center font-medium">Loading verification queue...</p>
              ) : submissionsList.length === 0 ? (
                <p className="text-xs text-[#595959] py-8 text-center font-medium">No submissions found for verification.</p>
              ) : (
                <div className="space-y-4">
                  {submissionsList.map((sub, idx) => {
                    const isVerified = sub.status === 'VERIFIED';

                    return (
                      <div key={idx} className="p-5 bg-[#EFEEEA] rounded-2xl border border-[#595959] space-y-4 shadow-xs card-hover-lift">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#595959]/20 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold text-xs flex items-center justify-center">
                              {sub.problemId}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-[#595959]">Participant: {sub.participantId}</h4>
                              <p className="text-[11px] text-[#595959]/80 font-mono font-medium">Problem #{sub.problemId} • Status: {sub.status}</p>
                            </div>
                          </div>

                          {isVerified ? (
                            <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-[#EFEEEA] text-xs font-bold flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-4 h-4 text-[#EFEEEA]" /> VERIFIED ({sub.marks} Marks)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-[#C23D31] text-[#EFEEEA] text-xs font-bold flex items-center gap-1 shadow-xs">
                              <Clock className="w-4 h-4 text-[#EFEEEA]" /> WAITING VERIFICATION
                            </span>
                          )}
                        </div>

                        {/* Submitted Code Preview */}
                        <div>
                          <p className="text-[11px] font-bold text-[#595959] mb-1">Submitted Code:</p>
                          <pre className="bg-[#595959] p-3 rounded-xl border border-[#595959] text-xs font-mono text-[#EFEEEA] leading-relaxed overflow-x-auto max-h-36">
                            {sub.code}
                          </pre>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleVerifyClick(sub.problemId)}
                            className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer btn-interactive"
                          >
                            <Award className="w-4 h-4 text-[#EFEEEA]" />
                            <span>{isVerified ? 'Modify Verification Marks' : 'Perform Physical Verification'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Participant Management */}
          {activeTab === 'participants' && (
            <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-6 card-hover-lift animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#A30B1A] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D60303]" />
                    <span>Registered Participant Management</span>
                  </h3>
                  <p className="text-xs text-[#595959]">Coordinators can add individual participants or bulk import participant datasets. User ID = Password.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => { setIsCountGenOpen(!isCountGenOpen); setIsCreatingPart(false); setIsBulkImportOpen(false); }}
                    className="px-4 py-2 rounded-xl bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs flex items-center gap-2 cursor-pointer btn-interactive shadow-xs"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isCountGenOpen ? 'Cancel' : '⚡ Quick Count Generator'}</span>
                  </button>

                  <button
                    onClick={() => { setIsBulkImportOpen(!isBulkImportOpen); setIsCreatingPart(false); setIsCountGenOpen(false); }}
                    className="px-4 py-2 rounded-xl bg-[#595959] text-[#EFEEEA] font-bold text-xs flex items-center gap-2 cursor-pointer btn-interactive"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Bulk Import JSON</span>
                  </button>

                  <button
                    onClick={() => { setIsCreatingPart(!isCreatingPart); setIsBulkImportOpen(false); setIsCountGenOpen(false); }}
                    className="px-4 py-2 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold text-xs flex items-center gap-2 cursor-pointer btn-interactive"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isCreatingPart ? 'Cancel' : 'Add Single Participant'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Count Generator Form */}
              {isCountGenOpen && (
                <form onSubmit={handleExecuteCountGeneration} className="p-5 bg-white/80 rounded-2xl border border-[#A30B1A]/40 space-y-4 text-xs animate-slide-up shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#595959]/20 pb-2">
                    <h4 className="font-bold text-[#A30B1A] uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#D60303]" />
                      <span>Dynamic Participant Count Generator (User ID = Password)</span>
                    </h4>
                    <span className="text-[10px] font-mono bg-[#A30B1A]/10 text-[#A30B1A] font-bold px-2 py-0.5 rounded">
                      Auto Segregation Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Number of Participants (Count)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        required
                        value={genCountInput}
                        onChange={(e) => setGenCountInput(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#A30B1A] rounded-xl outline-none font-mono text-sm font-bold text-[#A30B1A]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Department</label>
                      <input
                        type="text"
                        value={genDept}
                        onChange={(e) => setGenDept(e.target.value)}
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Year of Study</label>
                      <select
                        value={genYear}
                        onChange={(e) => setGenYear(e.target.value)}
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      >
                        <option value="I">I Year</option>
                        <option value="II">II Year</option>
                        <option value="III">III Year</option>
                        <option value="IV">IV Year</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-[#595959]">College Name</label>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewCollege(!isAddingNewCollege)}
                          className="text-[10px] font-bold text-[#D60303] hover:underline cursor-pointer"
                        >
                          {isAddingNewCollege ? 'Cancel' : '+ Add New'}
                        </button>
                      </div>

                      {isAddingNewCollege ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newCollegeInput}
                            onChange={(e) => setNewCollegeInput(e.target.value)}
                            placeholder="Type new college name..."
                            className="w-full px-2 py-1.5 bg-[#EFEEEA] border border-[#A30B1A] rounded-xl outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleAddNewCollege}
                            className="px-2 py-1.5 bg-[#A30B1A] text-[#EFEEEA] font-bold rounded-xl text-[10px] cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <select
                          value={genCollege}
                          onChange={(e) => setGenCollege(e.target.value)}
                          className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none text-xs font-medium"
                        >
                          {collegesList.map((c, idx) => (
                            <option key={idx} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Live Preview Section */}
                  {parseInt(genCountInput) > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#595959]/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#595959] text-[11px] uppercase tracking-wider">
                          Live Preview: Generating {parseInt(genCountInput)} Participant Credentials (TN2026-xxx)
                        </span>
                        <span className="text-[10px] font-mono text-[#D60303] font-bold">
                          Starting ID: TN2026-{String(participantsList.length + 1).padStart(3, '0')}
                        </span>
                      </div>

                      <div className="max-h-48 overflow-y-auto border border-[#595959]/30 rounded-xl bg-[#EFEEEA] p-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-mono">
                          {Array.from({ length: Math.min(parseInt(genCountInput) || 0, 60) }, (_, i) => {
                            const num = participantsList.length + 1 + i;
                            const pid = `TN2026-${String(num).padStart(3, '0')}`;
                            return (
                              <div key={pid} className="p-2 bg-white rounded-lg border border-[#595959]/20 flex items-center justify-between shadow-2xs">
                                <div>
                                  <p className="font-bold text-[#D60303]">{pid}</p>
                                  <p className="text-[10px] text-[#595959]">participant{num}@technova.edu</p>
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px]">
                                  Pass: {pid}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#595959] font-mono font-bold">
                      ⚡ FIFO Auto-Allocation: Accounts are created in bulk and dynamically assigned across all Lab Coordinators.
                    </span>
                    <button
                      type="submit"
                      disabled={isGenCreating}
                      className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold shadow-md transition cursor-pointer btn-interactive flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isGenCreating ? 'Generating Accounts...' : `Create ${parseInt(genCountInput) || 0} Participant Accounts`}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Single Participant Creation Form */}
              {isCreatingPart && (
                <form onSubmit={handleCreateParticipant} className="p-5 bg-white/60 rounded-2xl border border-[#595959]/40 space-y-4 text-xs animate-slide-up">
                  <h4 className="font-bold text-[#A30B1A] uppercase tracking-wider">Create Participant Account (Password = User ID)</h4>

                  {partMsg && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-xl font-bold">{partMsg}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Student Full Name</label>
                      <input
                        type="text"
                        required
                        value={partName}
                        onChange={(e) => setPartName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={partEmail}
                        onChange={(e) => setPartEmail(e.target.value)}
                        placeholder="alex@technova.edu"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Year of Study</label>
                      <select
                        value={partYear}
                        onChange={(e) => setPartYear(e.target.value)}
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      >
                        <option value="I">I Year</option>
                        <option value="II">II Year</option>
                        <option value="III">III Year</option>
                        <option value="IV">IV Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Department</label>
                      <input
                        type="text"
                        value={partDept}
                        onChange={(e) => setPartDept(e.target.value)}
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-[#595959]">College Name</label>
                        <span className="text-[10px] text-[#595959]">Select from registered institutions</span>
                      </div>
                      <select
                        value={partCollege}
                        onChange={(e) => setPartCollege(e.target.value)}
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none text-xs font-medium"
                      >
                        {collegesList.map((c, idx) => (
                          <option key={idx} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-[#595959] font-mono font-bold">
                      🔑 Auto-ID Rule: Participant ID format `TN2026-xxx` (Password set identical to ID).
                    </span>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold shadow-md hover:bg-[#A30B1A] transition cursor-pointer btn-interactive"
                    >
                      Generate & Create Participant
                    </button>
                  </div>
                </form>
              )}

              {/* Bulk Import JSON Form */}
              {isBulkImportOpen && (
                <form onSubmit={handleBulkImportParticipants} className="p-5 bg-white/60 rounded-2xl border border-[#595959]/40 space-y-3 text-xs animate-slide-up">
                  <h4 className="font-bold text-[#A30B1A] uppercase tracking-wider">Bulk Import Participants (JSON Format)</h4>
                  <p className="text-[11px] text-[#595959]">Paste JSON array of participant objects. Each participant gets auto-assigned `TN2026-xxx` ID with Password = ID.</p>

                  <textarea
                    rows="6"
                    value={bulkJsonInput}
                    onChange={(e) => setBulkJsonInput(e.target.value)}
                    placeholder={`[\n  { "name": "Sarah Connor", "email": "sarah@technova.edu", "department": "CSE", "year": "III" },\n  { "name": "Marcus Wright", "email": "marcus@technova.edu", "department": "CSE", "year": "III" }\n]`}
                    className="w-full p-3 font-mono text-xs bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkJsonInput(`[\n  { "name": "Demo Participant 1", "email": "p1@technova.edu", "department": "CSE", "year": "III" },\n  { "name": "Demo Participant 2", "email": "p2@technova.edu", "department": "CSE", "year": "III" }\n]`)}
                      className="px-4 py-2 rounded-xl bg-[#595959]/20 text-[#595959] font-bold text-xs"
                    >
                      Load Sample Template
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold shadow-md hover:bg-[#A30B1A] transition cursor-pointer"
                    >
                      Execute Bulk Import
                    </button>
                  </div>
                </form>
              )}

              {/* Participants Roster Table */}
              <div className="flex justify-between items-center text-xs font-semibold pb-1">
                <span className="text-[#595959]">Showing {displayedParticipants.length} of {participantsList.length} total participants</span>
                <button
                  onClick={() => setFilterMyTerminal(!filterMyTerminal)}
                  className={`px-3 py-1 rounded-lg border transition text-[11px] cursor-pointer ${filterMyTerminal
                      ? 'bg-[#A30B1A] text-[#EFEEEA] border-[#A30B1A] font-bold'
                      : 'bg-[#EFEEEA] text-[#595959] border-[#595959]'
                    }`}
                >
                  {filterMyTerminal ? 'Showing: My Lab Terminal Only' : 'Filter: Show My Terminal Participants Only'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#595959] text-[#EFEEEA] font-mono">
                    <tr>
                      <th className="p-3">Participant ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">College Name</th>
                      <th className="p-3">Assigned Lab Terminal</th>
                      <th className="p-3">Dept & Year</th>
                      <th className="p-3 text-center">Default Password</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#595959]/20 text-[#595959]">
                    {displayedParticipants.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-6 text-center text-[#595959]">No registered participants found for this view.</td>
                      </tr>
                    ) : (
                      displayedParticipants.map(p => (
                        <tr key={p.id} className="hover:bg-[#595959]/5 transition-colors font-medium">
                          <td className="p-3 font-mono font-bold text-[#D60303]">{p.id}</td>
                          <td className="p-3 font-semibold">{p.name}</td>
                          <td className="p-3 text-[#595959]/80">{p.email}</td>
                          <td className="p-3 text-[#595959] font-medium text-[11px]">{p.college}</td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              {p.assignedRound}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">{p.department} ({p.year})</td>
                          <td className="p-3 text-center font-mono font-bold text-[#A30B1A]">Same as ID ({p.id})</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 transition cursor-pointer"
                              title="Delete Participant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Broadcast Announcements (Coordinator) */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-slide-up">
              {/* Post New Announcement Card */}
              <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#27272a] pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-[#D60303] animate-pulse" />
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">Broadcast Real-Time Event Announcement</h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#D60303] border border-red-500/30">
                    Live WebSocket Push
                  </span>
                </div>

                {annStatusMsg.text && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium animate-slide-up ${
                    annStatusMsg.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40' 
                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-500/40'
                  }`}>
                    {annStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />}
                    <span>{annStatusMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-700 dark:text-[#a1a1aa] mb-1 font-mono">
                        Announcement Headline / Title
                      </label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. Round 2 Debugging — 10 Minutes Remaining!"
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-[#a1a1aa] mb-1 font-mono">
                        Urgency / Broadcast Tag
                      </label>
                      <select
                        value={annTag}
                        onChange={(e) => setAnnTag(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none transition-colors font-mono"
                      >
                        <option value="ROUND_UPDATE">🔴 ROUND_UPDATE (Critical Round State)</option>
                        <option value="URGENT">⚠️ URGENT (Action Required)</option>
                        <option value="INFO">ℹ️ INFO (General Notification)</option>
                        <option value="BROADCAST">📢 BROADCAST (Symposium Announcement)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-[#a1a1aa] mb-1 font-mono">
                      Announcement Detailed Body Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      placeholder="Write instructions, round rules update, or verification cues for participants..."
                      className="w-full p-3.5 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-xl text-xs text-zinc-900 dark:text-white focus:border-[#D60303] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Posting as: <strong className="text-zinc-800 dark:text-zinc-200">{currentUser?.name || currentUser?.id || 'Coordinator'}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isPostingAnn}
                      className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-white font-bold font-mono text-xs shadow-md transition flex items-center gap-2 cursor-pointer btn-interactive"
                    >
                      <Send className="w-4 h-4 text-white" />
                      <span>{isPostingAnn ? 'Broadcasting to All Terminals...' : 'Broadcast Announcement'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Announcements Feed */}
              <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#27272a] pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">Published Announcements Feed ({announcements.length})</h3>
                  </div>
                </div>

                {announcements.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-8 text-center font-mono">No announcements published yet.</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((ann, idx) => (
                      <div key={ann.id || idx} className="p-4 bg-[#F8F7F4] dark:bg-[#09090b] rounded-xl border border-zinc-200 dark:border-[#27272a] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              ann.tag === 'URGENT' 
                                ? 'bg-red-500 text-white' 
                                : ann.tag === 'ROUND_UPDATE'
                                ? 'bg-amber-500 text-white'
                                : 'bg-zinc-800 text-white'
                            }`}>
                              {ann.tag || 'INFO'}
                            </span>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white font-mono">{ann.title}</h4>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">{ann.time || 'Just now'}</span>
                        </div>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{ann.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Content Management Hub */}
          {activeTab === 'content' && (
            <div className="animate-slide-up">
              <ContentManagementHub userRole="COORDINATOR" />
            </div>
          )}

          {/* Tab 5: Live Competition Leaderboard */}
          {activeTab === 'leaderboard' && (() => {
            const r1Cutoff = eventState?.round1QualifyCount || 30;
            const r2Cutoff = eventState?.round2QualifyCount || 10;

            let filteredList = [...leaderboard];

            if (leaderboardFilter === 'R1') {
              // Sorted by Round 1 score descending
              filteredList = [...leaderboard].sort((a, b) => (b.r1 || b.r1Score || 0) - (a.r1 || a.r1Score || 0));
            } else if (leaderboardFilter === 'R2') {
              // Sorted by Round 1 + Round 2 score for Round 2 qualifiers
              filteredList = [...leaderboard]
                .filter(u => u.qualifiedR2 || u.qualifiedForRound2)
                .sort((a, b) => ((b.r1 || 0) + (b.r2 || 0)) - ((a.r1 || 0) + (a.r2 || 0)));
            } else if (leaderboardFilter === 'R3') {
              // Round 3 finalists sorted by total score
              filteredList = [...leaderboard]
                .filter(u => u.qualifiedR3 || u.qualifiedForRound3)
                .sort((a, b) => (b.total || b.totalScore || 0) - (a.total || a.totalScore || 0));
            }

            if (leaderboardSearch.trim()) {
              const q = leaderboardSearch.toLowerCase();
              filteredList = filteredList.filter(u => 
                u.name?.toLowerCase().includes(q) || 
                u.id?.toLowerCase().includes(q) || 
                u.college?.toLowerCase().includes(q)
              );
            }

            return (
              <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#27272a] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Live Symposium Standings & Round Progression</h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] mt-0.5">
                      Top {r1Cutoff} in Round 1 advance to Round 2 • Top {r2Cutoff} in Round 2 advance to Round 3 Finals.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchLeaderboard}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#D60303] text-white text-xs font-bold font-mono transition cursor-pointer btn-interactive flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>↻ Refresh Scores</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                    <button
                      onClick={() => setLeaderboardFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                        leaderboardFilter === 'ALL'
                          ? 'bg-[#D60303] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      All Overall Standings ({leaderboard.length})
                    </button>

                    <button
                      onClick={() => setLeaderboardFilter('R1')}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        leaderboardFilter === 'R1'
                          ? 'bg-[#D60303] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>Round 1 Results</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">Top {r1Cutoff} Qualify</span>
                    </button>

                    <button
                      onClick={() => setLeaderboardFilter('R2')}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        leaderboardFilter === 'R2'
                          ? 'bg-[#D60303] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>Round 2 Qualifiers</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">Top {r2Cutoff} Finalists</span>
                    </button>

                    <button
                      onClick={() => setLeaderboardFilter('R3')}
                      className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                        leaderboardFilter === 'R3'
                          ? 'bg-[#D60303] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>🏆 Round 3 Podium</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    placeholder="Search by ID, Name or College..."
                    className="px-3 py-1.5 bg-[#F8F7F4] dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-xl text-xs outline-none focus:border-[#D60303] w-full md:w-64 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Cutoff Explanatory Pill */}
                <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Progression Tier: Round 1 (Top {r1Cutoff}) ➔ Round 2 (Top {r2Cutoff}) ➔ Round 3 Podium</span>
                  </div>
                  <span className="text-zinc-500">Showing {filteredList.length} participants</span>
                </div>

                {filteredList.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-8 text-center font-mono">No matching participant records found.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#27272a]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-[#09090b] text-zinc-700 dark:text-[#a1a1aa] font-mono border-b border-zinc-200 dark:border-[#27272a]">
                          <th className="p-3 text-center">Rank</th>
                          <th className="p-3">Participant ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">College</th>
                          <th className="p-3 text-center">Round 1 (Quiz)</th>
                          <th className="p-3 text-center">Round 2 (Debug)</th>
                          <th className="p-3 text-center">Round 3 (Hunt)</th>
                          <th className="p-3 text-center font-bold text-[#D60303]">Total Score</th>
                          <th className="p-3 text-center">Status / Qualification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-[#27272a] text-zinc-800 dark:text-zinc-200">
                        {filteredList.map((u, idx) => {
                          const displayRank = u.rank || (idx + 1);
                          const isPodium = displayRank <= 3 && (u.totalScore > 0 || u.total > 0);

                          return (
                            <tr 
                              key={u.id || idx} 
                              className={`transition-colors ${
                                displayRank === 1 ? 'bg-amber-500/10 dark:bg-amber-500/5 hover:bg-amber-500/15 font-semibold' :
                                displayRank === 2 ? 'bg-zinc-200/40 dark:bg-zinc-800/40 hover:bg-zinc-200/60 font-semibold' :
                                displayRank === 3 ? 'bg-amber-700/10 dark:bg-amber-700/5 hover:bg-amber-700/15 font-semibold' :
                                'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                              }`}
                            >
                              <td className="p-3 text-center font-mono font-bold">
                                {displayRank === 1 ? '🥇 1' : displayRank === 2 ? '🥈 2' : displayRank === 3 ? '🥉 3' : `#${displayRank}`}
                              </td>
                              <td className="p-3 font-mono font-bold text-[#D60303]">{u.id}</td>
                              <td className="p-3 font-semibold">{u.name}</td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{u.college}</td>
                              <td className="p-3 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                {u.r1 ?? u.r1Score ?? u.round1Score ?? 0}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                {u.r2 ?? u.r2Score ?? u.round2Score ?? 0}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                {u.r3 ?? u.r3Score ?? u.round3Score ?? 0}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-[#D60303] text-sm">
                                {u.total ?? u.totalScore ?? 0} pts
                              </td>
                              <td className="p-3 text-center">
                                {u.qualifiedR3 || u.qualifiedForRound3 ? (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px] border border-amber-500/30 inline-flex items-center gap-1">
                                    🏆 Finalist (R3)
                                  </span>
                                ) : u.qualifiedR2 || u.qualifiedForRound2 ? (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/30 inline-flex items-center gap-1">
                                    ⭐ Qualified (R2)
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-medium text-[10px]">
                                    {u.status || 'Registered'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
