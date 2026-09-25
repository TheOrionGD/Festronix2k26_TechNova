import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
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
  MessageSquare,
  Calculator,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  UserX,
  Search,
  GitBranch,
  Sliders,
  Save,
  AlertCircle,
  Edit3,
  Check,
  X
} from 'lucide-react';

export default function CoordinatorPortal() {
  const { 
    currentUser, 
    setIsCoordinatorModalOpen, 
    setPendingVerificationProblemId, 
    setPendingVerificationParticipantId,
    fetchLeaderboard,
    leaderboard,
    announcements,
    createAnnouncement,
    eventState,
    updateEventState,
    roundTimeLeft,
    formatRoundTime,
    recalculateLeaderboard,
    disqualifyParticipantManual,
    reinstateParticipant,
    updateParticipantGradingOverride,
    formatAnnouncementTime
  } = useApp();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'participants' | 'cohorts' | 'malpractice' | 'announcements' | 'content' | 'leaderboard'
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Malpractice & Disqualification Management State
  const [malpracticeRecords, setMalpracticeRecords] = useState([]);
  const [malpracticeLogs, setMalpracticeLogs] = useState([]);
  const [malpracticeSearch, setMalpracticeSearch] = useState('');
  const [malpracticeFilter, setMalpracticeFilter] = useState('ALL'); // 'ALL' | 'DISQUALIFIED' | 'WARNINGS' | 'MY_STATION'
  const [disqualifyingParticipant, setDisqualifyingParticipant] = useState(null);
  const [disqualifyReason, setDisqualifyReason] = useState('Tab Switching / Background Process');
  const [customReason, setCustomReason] = useState('');
  const [isProcessingMalpractice, setIsProcessingMalpractice] = useState(false);
  const [malpracticeMsg, setMalpracticeMsg] = useState(null);

  // Graded vs Non-Graded Cohort & Dynamic Qualification Management State
  const [cohortSearch, setCohortSearch] = useState('');
  const [cohortFilter, setCohortFilter] = useState('ALL'); // 'ALL' | 'R2_GRADED' | 'R2_NON_GRADED' | 'R3_GRADED' | 'R3_NON_GRADED' | 'DISQUALIFIED'
  const [qR1Mode, setQR1Mode] = useState(eventState?.round1QualifyMode || 'PERCENTAGE');
  const [qR1Percentage, setQR1Percentage] = useState(eventState?.round1QualifyPercentage ?? 70);
  const [qR1Count, setQR1Count] = useState(eventState?.round1QualifyCount ?? 30);
  const [qR2Mode, setQR2Mode] = useState(eventState?.round2QualifyMode || 'PERCENTAGE');
  const [qR2Percentage, setQR2Percentage] = useState(eventState?.round2QualifyPercentage ?? 50);
  const [qR2Count, setQR2Count] = useState(eventState?.round2QualifyCount ?? 10);
  const [qR3Stations, setQR3Stations] = useState(eventState?.round3StationCount ?? 5);
  const [isSavingQualification, setIsSavingQualification] = useState(false);
  const [cohortActionMsg, setCohortActionMsg] = useState(null);

  useEffect(() => {
    if (eventState) {
      const syncTimer = setTimeout(() => {
        if (eventState.round1QualifyMode) setQR1Mode(eventState.round1QualifyMode);
        if (eventState.round1QualifyPercentage !== undefined) setQR1Percentage(eventState.round1QualifyPercentage);
        if (eventState.round1QualifyCount !== undefined) setQR1Count(eventState.round1QualifyCount);
        if (eventState.round2QualifyMode) setQR2Mode(eventState.round2QualifyMode);
        if (eventState.round2QualifyPercentage !== undefined) setQR2Percentage(eventState.round2QualifyPercentage);
        if (eventState.round2QualifyCount !== undefined) setQR2Count(eventState.round2QualifyCount);
        if (eventState.round3StationCount !== undefined) setQR3Stations(eventState.round3StationCount);
      }, 0);
      return () => clearTimeout(syncTimer);
    }
  }, [eventState]);

  const handleSaveQualificationSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingQualification(true);
    try {
      const payload = {
        round1QualifyMode: qR1Mode,
        round1QualifyPercentage: Number(qR1Percentage),
        round1QualifyCount: Number(qR1Count),
        round2QualifyMode: qR2Mode,
        round2QualifyPercentage: Number(qR2Percentage),
        round2QualifyCount: Number(qR2Count),
        round3StationCount: Number(qR3Stations)
      };
      await updateEventState(payload);
      if (recalculateLeaderboard) {
        await recalculateLeaderboard();
      }
      await fetchLeaderboard();
      setCohortActionMsg({ type: 'success', text: 'Qualification parameters updated! Dynamic cohorts have been recomputed.' });
    } catch (err) {
      console.error('Save qualification parameters error:', err);
      setCohortActionMsg({ type: 'error', text: 'Error saving qualification parameters.' });
    } finally {
      setIsSavingQualification(false);
      setTimeout(() => setCohortActionMsg(null), 4000);
    }
  };

  const handleToggleGradingOverride = async (participantId, round, newStatus) => {
    try {
      const res = await updateParticipantGradingOverride(participantId, round, newStatus);
      if (res.success) {
        setCohortActionMsg({ type: 'success', text: `Participant ${participantId} Round ${round} status set to ${newStatus}.` });
        await fetchLeaderboard();
      } else {
        setCohortActionMsg({ type: 'error', text: res.message || 'Failed to update cohort status.' });
      }
    } catch (err) {
      console.error('Toggle grading override error:', err);
      setCohortActionMsg({ type: 'error', text: 'Network error updating cohort status.' });
    } finally {
      setTimeout(() => setCohortActionMsg(null), 4000);
    }
  };

  const fetchMalpracticeData = async () => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/malpractice-records`);
      const data = await res.json();
      if (data.success) {
        setMalpracticeRecords(data.records || []);
        setMalpracticeLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Fetch malpractice records error:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'malpractice') {
      const timer = setTimeout(() => {
        fetchMalpracticeData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleExecuteDisqualify = async () => {
    if (!disqualifyingParticipant) return;
    setIsProcessingMalpractice(true);
    const finalReason = disqualifyReason === 'OTHER' ? (customReason.trim() || 'Malpractice violation') : disqualifyReason;
    try {
      const res = await disqualifyParticipantManual(disqualifyingParticipant.id, finalReason);
      if (res.success) {
        setMalpracticeMsg({ type: 'success', text: `Participant ${disqualifyingParticipant.id} has been disqualified and frozen.` });
        setDisqualifyingParticipant(null);
        setCustomReason('');
        await fetchMalpracticeData();
        await fetchLeaderboard();
      } else {
        setMalpracticeMsg({ type: 'error', text: res.message || 'Failed to disqualify participant.' });
      }
    } catch (err) {
      console.error('Disqualify participant error:', err);
      setMalpracticeMsg({ type: 'error', text: 'Server communication error.' });
    } finally {
      setIsProcessingMalpractice(false);
    }
  };

  const handleExecuteReinstate = async (participantId) => {
    if (!window.confirm(`Are you sure you want to reinstate participant ${participantId}? This will restore their active competition status.`)) return;
    setIsProcessingMalpractice(true);
    try {
      const res = await reinstateParticipant(participantId);
      if (res.success) {
        setMalpracticeMsg({ type: 'success', text: `Participant ${participantId} has been successfully reinstated.` });
        await fetchMalpracticeData();
        await fetchLeaderboard();
      } else {
        setMalpracticeMsg({ type: 'error', text: res.message || 'Failed to reinstate participant.' });
      }
    } catch (err) {
      console.error('Reinstate participant error:', err);
      setMalpracticeMsg({ type: 'error', text: 'Server communication error.' });
    } finally {
      setIsProcessingMalpractice(false);
    }
  };

  const handleIssueWarning = async (participantId) => {
    try {
      await fetch(`${API_BASE}/anticheat/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          type: 'COORDINATOR_WARNING',
          message: `Official malpractice warning issued by Lab Coordinator ${currentUser?.id || ''}`
        })
      });
      setMalpracticeMsg({ type: 'success', text: `Official warning issued to participant ${participantId}.` });
      await fetchMalpracticeData();
    } catch (err) {
      console.error('Issue warning error:', err);
      setMalpracticeMsg({ type: 'error', text: 'Error issuing warning.' });
    }
  };

  // Announcement Creation State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTag, setAnnTag] = useState('ROUND_UPDATE');
  const [isPostingAnn, setIsPostingAnn] = useState(false);
  const [annStatusMsg, setAnnStatusMsg] = useState({ text: '', type: '' });

  const handleSetRoundStatus = (status, activeRound) => {
    updateEventState({ status, activeRound });
    setTimeout(() => {
      fetchLeaderboard();
    }, 400);
    alert(`⚡ Event Status Updated to: ${status}`);
  };

  // Participant Management State
  const [participantsList, setParticipantsList] = useState([]);
  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkJsonInput, setBulkJsonInput] = useState('');
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

  // College Manual Editing & Bulk Change State
  const [editingParticipantCollegeId, setEditingParticipantCollegeId] = useState(null);
  const [editingCollegeValue, setEditingCollegeValue] = useState('');
  const [isSavingCollege, setIsSavingCollege] = useState(false);
  const [isBatchCollegeOpen, setIsBatchCollegeOpen] = useState(false);
  const [batchCollegeValue, setBatchCollegeValue] = useState('');
  const [isBatchSaving, setIsBatchSaving] = useState(false);

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

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCoordinatorQueue();
      fetchParticipants();
      fetchColleges();
    });

    const handleVerificationUpdate = () => {
      fetchCoordinatorQueue();
    };
    window.addEventListener('verification:updated', handleVerificationUpdate);
    return () => window.removeEventListener('verification:updated', handleVerificationUpdate);
  }, []);

  const handleVerifyClick = (problemId, participantId) => {
    setPendingVerificationProblemId(problemId);
    setPendingVerificationParticipantId(participantId);
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

  const handleSaveParticipantCollege = async (participantId) => {
    if (!editingCollegeValue.trim()) {
      alert('College name cannot be empty.');
      return;
    }
    const cleanCollege = editingCollegeValue.trim();
    setIsSavingCollege(true);
    try {
      const res = await fetch(`${API_BASE}/coordinator/participants/${participantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college: cleanCollege })
      });
      const data = await res.json();
      if (data.success) {
        setParticipantsList(prev => prev.map(p => p.id === participantId ? { ...p, college: cleanCollege } : p));
        setEditingParticipantCollegeId(null);
        await fetchLeaderboard();
        await fetchColleges();
      } else {
        alert(data.message || 'Failed to update college.');
      }
    } catch (err) {
      console.error('Update participant college error:', err);
      alert('Network error updating college.');
    } finally {
      setIsSavingCollege(false);
    }
  };

  const handleBatchUpdateCollege = async (e) => {
    e.preventDefault();
    if (!batchCollegeValue.trim()) {
      alert('Please enter a valid college name.');
      return;
    }
    const cleanCollege = batchCollegeValue.trim();
    const targetIds = displayedParticipants.map(p => p.id);
    if (targetIds.length === 0) {
      alert('No participants in current view to update.');
      return;
    }
    if (!window.confirm(`Are you sure you want to change the college name to "${cleanCollege}" for all ${targetIds.length} participant(s)?`)) {
      return;
    }

    setIsBatchSaving(true);
    try {
      const res = await fetch(`${API_BASE}/coordinator/participants/update-college-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: targetIds, college: cleanCollege })
      });
      const data = await res.json();
      if (data.success) {
        setParticipantsList(prev => prev.map(p => targetIds.includes(p.id) ? { ...p, college: cleanCollege } : p));
        setIsBatchCollegeOpen(false);
        setBatchCollegeValue('');
        await fetchLeaderboard();
        await fetchColleges();
        alert(data.message || 'College names updated successfully!');
      } else {
        alert(data.message || 'Failed to bulk update college.');
      }
    } catch (err) {
      console.error('Bulk update college error:', err);
      alert('Network error bulk updating college.');
    } finally {
      setIsBatchSaving(false);
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

  const handleDeleteAllParticipants = async () => {
    if (!window.confirm("⚠️ DANGER: Are you sure you want to delete ALL participant accounts, submissions, and attempts from the database? This cannot be undone.")) {
      return;
    }
    const confirmTxt = prompt("Type 'DELETE' to confirm permanent deletion of all participants:");
    if (confirmTxt !== 'DELETE') {
      alert("Deletion cancelled.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/coordinator/delete-all-participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await fetchParticipants();
        await fetchLeaderboard();
      } else {
        alert(data.error || 'Failed to delete all participants.');
      }
    } catch (err) {
      console.error('Delete all participants error:', err);
      alert('Network error deleting participants.');
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
              <div className="flex items-center gap-2">
                {eventState?.status?.includes('RUNNING') && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    LIVE: {formatRoundTime(roundTimeLeft)}
                  </span>
                )}
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#D60303] text-white">
                  CURRENT STATUS: {eventState?.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 pt-1 text-xs font-bold font-mono">
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
                onClick={() => handleSetRoundStatus('COMPLETED', 3)}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer btn-interactive text-center font-black shadow-xs ring-1 ring-purple-400"
              >
                🏁 Conclude All 3 Rounds
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
              onClick={() => {
                setActiveTab('cohorts');
                fetchLeaderboard();
              }}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'cohorts' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>Graded Cohorts & Qualification</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                100% → 70% → 50%
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('malpractice');
                fetchMalpracticeData();
              }}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'malpractice' ? 'bg-[#D60303] text-white shadow-xs' : 'bg-white/80 dark:bg-[#141417]/80 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-[#a1a1aa] hover:bg-zinc-100 dark:hover:bg-[#1a1a1e]'
                }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Malpractice & Disqualification</span>
              {malpracticeRecords.filter(r => r.isDisqualified).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">
                  {malpracticeRecords.filter(r => r.isDisqualified).length}
                </span>
              )}
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
              <span>Mark Grading & Standings (All 3 Rounds)</span>
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
                            onClick={() => handleVerifyClick(sub.problemId, sub.participantId)}
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

                  <button
                    onClick={handleDeleteAllParticipants}
                    className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer btn-interactive shadow-xs"
                    title="Permanently delete all participant accounts, attempts, and submissions from database"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                    <span>Delete All Participants</span>
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
                        <span className="text-[10px] text-[#A30B1A] font-semibold">Type manually or select below</span>
                      </div>
                      <input
                        type="text"
                        list="coordinator-colleges-datalist"
                        value={genCollege}
                        onChange={(e) => setGenCollege(e.target.value)}
                        placeholder="Type or select college name..."
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none text-xs font-medium focus:border-[#A30B1A]"
                      />
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
                        <span className="text-[10px] text-[#A30B1A] font-semibold">Type manually or select below</span>
                      </div>
                      <input
                        type="text"
                        list="coordinator-colleges-datalist"
                        value={partCollege}
                        onChange={(e) => setPartCollege(e.target.value)}
                        placeholder="Type or select college name..."
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none text-xs font-medium focus:border-[#A30B1A]"
                      />
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

              {/* Datalist for manually typing or selecting registered colleges */}
              <datalist id="coordinator-colleges-datalist">
                {collegesList.map((c, idx) => (
                  <option key={idx} value={c} />
                ))}
              </datalist>

              {/* Participants Roster Table Toolbar */}
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-semibold pb-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#595959]">Showing {displayedParticipants.length} of {participantsList.length} total participants</span>
                  {displayedParticipants.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsBatchCollegeOpen(!isBatchCollegeOpen)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Quickly change college name for all displayed participants"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isBatchCollegeOpen ? 'Close Batch Edit' : `Change College for All (${displayedParticipants.length})`}</span>
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFilterMyTerminal(!filterMyTerminal)}
                  className={`px-3 py-1 rounded-lg border transition text-[11px] cursor-pointer ${filterMyTerminal
                      ? 'bg-[#A30B1A] text-[#EFEEEA] border-[#A30B1A] font-bold'
                      : 'bg-[#EFEEEA] text-[#595959] border-[#595959]'
                    }`}
                >
                  {filterMyTerminal ? 'Showing: My Lab Terminal Only' : 'Filter: Show My Terminal Participants Only'}
                </button>
              </div>

              {/* Batch College Update Bar */}
              {isBatchCollegeOpen && (
                <form onSubmit={handleBatchUpdateCollege} className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-wrap items-center gap-2 text-xs animate-slide-up">
                  <span className="font-bold text-blue-900">Change College for All Displayed Participants:</span>
                  <input
                    type="text"
                    list="coordinator-colleges-datalist"
                    value={batchCollegeValue}
                    onChange={(e) => setBatchCollegeValue(e.target.value)}
                    placeholder="Type or select new college name for all..."
                    className="flex-1 min-w-[240px] px-3 py-1.5 bg-white border border-blue-300 rounded-lg outline-none text-xs font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isBatchSaving}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    {isBatchSaving ? 'Updating...' : `Apply to ${displayedParticipants.length} Participants`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchCollegeOpen(false)}
                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#595959] text-[#EFEEEA] font-mono">
                    <tr>
                      <th className="p-3">Participant ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span>College Name</span>
                          <span className="text-[10px] font-normal text-amber-200 font-sans">(Editable)</span>
                        </div>
                      </th>
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
                          <td className="p-3 text-[#595959] font-medium text-[11px]">
                            {editingParticipantCollegeId === p.id ? (
                              <div className="flex items-center gap-1.5 min-w-[220px]">
                                <input
                                  type="text"
                                  list="coordinator-colleges-datalist"
                                  autoFocus
                                  value={editingCollegeValue}
                                  onChange={(e) => setEditingCollegeValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveParticipantCollege(p.id);
                                    if (e.key === 'Escape') setEditingParticipantCollegeId(null);
                                  }}
                                  placeholder="Type college name..."
                                  className="flex-1 px-2.5 py-1 text-xs bg-white border border-[#A30B1A] rounded-lg outline-none font-medium text-zinc-900 shadow-inner"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveParticipantCollege(p.id)}
                                  disabled={isSavingCollege}
                                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                                  title="Save College Name"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingParticipantCollegeId(null)}
                                  className="p-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 transition cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1 group/col">
                                <span className="truncate max-w-[200px]" title={p.college || 'No college specified'}>
                                  {p.college || <span className="italic text-zinc-400">Not specified</span>}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingParticipantCollegeId(p.id);
                                    setEditingCollegeValue(p.college || '');
                                  }}
                                  className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-zinc-200 text-zinc-500 hover:text-[#A30B1A] transition cursor-pointer"
                                  title="Click to change or type College Name manually"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              {p.assignedRound}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">{p.department} ({p.year})</td>
                          <td className="p-3 text-center font-mono font-bold text-[#A30B1A]">Same as ID ({p.id})</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingParticipantCollegeId(p.id);
                                  setEditingCollegeValue(p.college || '');
                                }}
                                className="p-1.5 text-zinc-600 hover:text-[#A30B1A] transition cursor-pointer rounded hover:bg-zinc-100"
                                title="Change College Name manually"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParticipant(p.id)}
                                className="p-1.5 text-red-600 hover:text-red-800 transition cursor-pointer rounded hover:bg-red-50"
                                title="Delete Participant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Graded Cohorts & Dynamic Qualification Separation */}
          {activeTab === 'cohorts' && (() => {
            const totalCount = leaderboard.length || participantsList.length || 0;
            
            const getR2Graded = (item) => !!(item.isRound2Graded ?? item.isGradedR2 ?? item.qualifiedR2);
            const getR3Graded = (item) => !!(item.isRound3Graded ?? item.isGradedR3 ?? item.qualifiedR3);

            // Round 2 Graded Target
            const r2Target = qR1Mode === 'PERCENTAGE'
              ? Math.max(1, Math.ceil(totalCount * (Number(qR1Percentage) / 100)))
              : Math.min(totalCount, Number(qR1Count));
            const r2Actual = leaderboard.filter(p => getR2Graded(p) && !p.isDisqualified).length;
            const r2NonGraded = totalCount - r2Actual;

            // Round 3 Graded Target
            const r3Target = qR2Mode === 'PERCENTAGE'
              ? Math.max(1, Math.ceil(r2Actual * (Number(qR2Percentage) / 100)))
              : Math.min(r2Actual || totalCount, Number(qR2Count));
            const r3Actual = leaderboard.filter(p => getR3Graded(p) && !p.isDisqualified).length;
            const r3NonGraded = totalCount - r3Actual;

            const disqualifiedCount = leaderboard.filter(p => p.isDisqualified || p.accountStatus === 'DISQUALIFIED').length;

            let displayed = [...leaderboard];
            if (cohortFilter === 'R2_GRADED') {
              displayed = displayed.filter(p => getR2Graded(p) && !p.isDisqualified);
            } else if (cohortFilter === 'R2_NON_GRADED') {
              displayed = displayed.filter(p => !getR2Graded(p) && !p.isDisqualified);
            } else if (cohortFilter === 'R3_GRADED') {
              displayed = displayed.filter(p => getR3Graded(p) && !p.isDisqualified);
            } else if (cohortFilter === 'R3_NON_GRADED') {
              displayed = displayed.filter(p => !getR3Graded(p) && !p.isDisqualified);
            } else if (cohortFilter === 'DISQUALIFIED') {
              displayed = displayed.filter(p => p.isDisqualified || p.accountStatus === 'DISQUALIFIED');
            }

            if (cohortSearch.trim()) {
              const q = cohortSearch.toLowerCase();
              displayed = displayed.filter(p => 
                p.id?.toLowerCase().includes(q) || 
                p.name?.toLowerCase().includes(q) || 
                p.college?.toLowerCase().includes(q) || 
                p.department?.toLowerCase().includes(q)
              );
            }

            return (
              <div className="space-y-6 animate-slide-up">
                {/* Status Messages */}
                {cohortActionMsg && (
                  <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-slide-up ${
                    cohortActionMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-600 border border-red-500/30'
                  }`}>
                    {cohortActionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />}
                    <span>{cohortActionMsg.text}</span>
                  </div>
                )}

                {/* DYNAMIC FUNNEL DASHBOARD HEADER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Participants (100%) */}
                  <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-2 card-hover-lift">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      <span className="font-bold uppercase tracking-wider">Total Registered (100%)</span>
                      <Users className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-zinc-900 dark:text-white">{totalCount}</span>
                      <span className="text-xs font-mono text-zinc-500">Participants</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Dynamic total from coordinator accounts
                    </p>
                  </div>

                  {/* Round 1 Cohort (100% Graded) */}
                  <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-blue-500/20 shadow-sm space-y-2 card-hover-lift">
                    <div className="flex items-center justify-between text-xs font-mono text-blue-600 dark:text-blue-400">
                      <span className="font-bold uppercase tracking-wider">Round 1 (Quiz)</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 font-bold text-[10px]">100% Cohort</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">{totalCount}</span>
                      <span className="text-xs font-mono text-zinc-500">Graded (20M)</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      100% of participants compete & graded
                    </p>
                  </div>

                  {/* Round 2 Cohort (70% Target) */}
                  <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/30 shadow-sm space-y-2 card-hover-lift">
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      <span className="font-bold uppercase tracking-wider">Round 2 (Debug It)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 font-bold text-[10px]">
                        {qR1Mode === 'PERCENTAGE' ? `${qR1Percentage}% Target` : `${qR1Count} Target`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{r2Actual}</span>
                      <span className="text-xs font-mono text-zinc-500">Graded / {r2NonGraded} Non-Graded</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Target: {r2Target} contestants (3 × 10M = 30M)
                    </p>
                  </div>

                  {/* Round 3 Cohort (50% of R2 Target) */}
                  <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-red-500/30 shadow-sm space-y-2 card-hover-lift">
                    <div className="flex items-center justify-between text-xs font-mono text-[#D60303]">
                      <span className="font-bold uppercase tracking-wider">Round 3 (Tech Hunt)</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 font-bold text-[10px]">
                        {qR2Mode === 'PERCENTAGE' ? `${qR2Percentage}% of R2` : `${qR2Count} Target`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-[#D60303]">{r3Actual}</span>
                      <span className="text-xs font-mono text-zinc-500">Graded / {qR3Stations} Stations</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Target: {r3Target} contestants ({qR3Stations} × 10M = 50M)
                    </p>
                  </div>
                </div>

                {/* DYNAMIC QUALIFICATION PARAMETERS CONFIGURATION CARD */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-5 card-hover-lift">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#27272a] pb-4">
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-5 h-5 text-[#D60303]" />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Dynamic Qualification & Cohort Cutoff Rules</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Set the dynamic qualification threshold percentage or exact participant counts entered by coordinator.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQR1Mode('PERCENTAGE');
                        setQR1Percentage(70);
                        setQR1Count(30);
                        setQR2Mode('PERCENTAGE');
                        setQR2Percentage(50);
                        setQR2Count(10);
                        setQR3Stations(5);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-mono font-bold transition cursor-pointer self-start sm:self-auto"
                    >
                      Reset Defaults (100% → 70% → 50%)
                    </button>
                  </div>

                  <form onSubmit={handleSaveQualificationSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Round 1 -> Round 2 Qualification */}
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            R1 → R2 Qualification (70%)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">Dynamic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="r1Mode"
                              value="PERCENTAGE"
                              checked={qR1Mode === 'PERCENTAGE'}
                              onChange={() => setQR1Mode('PERCENTAGE')}
                            />
                            <span>Percentage (%)</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer ml-3">
                            <input
                              type="radio"
                              name="r1Mode"
                              value="COUNT"
                              checked={qR1Mode === 'COUNT'}
                              onChange={() => setQR1Mode('COUNT')}
                            />
                            <span>Exact Count</span>
                          </label>
                        </div>
                        {qR1Mode === 'PERCENTAGE' ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                required
                                value={qR1Percentage}
                                onChange={(e) => setQR1Percentage(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
                              />
                              <span className="text-xs font-mono font-bold">%</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                              Target: ~{Math.ceil(totalCount * (Number(qR1Percentage || 70) / 100))} of {totalCount} participants
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max={totalCount || 500}
                                required
                                value={qR1Count}
                                onChange={(e) => setQR1Count(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
                              />
                              <span className="text-xs font-mono font-bold">Users</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                              Exact cutoff: {qR1Count} participants
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Round 2 -> Round 3 Qualification */}
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            R2 → R3 Qualification (50%)
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">Dynamic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="r2Mode"
                              value="PERCENTAGE"
                              checked={qR2Mode === 'PERCENTAGE'}
                              onChange={() => setQR2Mode('PERCENTAGE')}
                            />
                            <span>Percentage (%)</span>
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer ml-3">
                            <input
                              type="radio"
                              name="r2Mode"
                              value="COUNT"
                              checked={qR2Mode === 'COUNT'}
                              onChange={() => setQR2Mode('COUNT')}
                            />
                            <span>Exact Count</span>
                          </label>
                        </div>
                        {qR2Mode === 'PERCENTAGE' ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                required
                                value={qR2Percentage}
                                onChange={(e) => setQR2Percentage(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
                              />
                              <span className="text-xs font-mono font-bold">%</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                              Target: ~{Math.ceil(r2Actual * (Number(qR2Percentage || 50) / 100))} of {r2Actual} R2 users
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max={r2Actual || 200}
                                required
                                value={qR2Count}
                                onChange={(e) => setQR2Count(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
                              />
                              <span className="text-xs font-mono font-bold">Users</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                              Exact cutoff: {qR2Count} participants
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Round 3 Station Count */}
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Round 3 Station Count
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">Dynamic</span>
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-500 font-mono block mb-1">
                            Number of Sequential Stations (10 pts each)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="20"
                              required
                              value={qR3Stations}
                              onChange={(e) => setQR3Stations(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
                            />
                            <span className="text-xs font-mono font-bold">Stations</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                            Total Hunt Marks: {Number(qR3Stations || 5) * 10} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isSavingQualification}
                        className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer btn-interactive"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSavingQualification ? 'Recalculating Dynamic Cohorts...' : 'Save & Dynamically Recalculate Cohorts'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* GRADED VS NON-GRADED PARTICIPANT SEPARATION TABLE */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#27272a] pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D60303]" />
                        <span>Graded vs Non-Graded Contestant Management</span>
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        View and manually promote/demote contestants between Graded (ranked for awards) and Non-Graded cohorts.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                        <input
                          type="text"
                          value={cohortSearch}
                          onChange={(e) => setCohortSearch(e.target.value)}
                          placeholder="Search contestant..."
                          className="pl-9 pr-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono focus:outline-none focus:border-[#D60303]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <button
                      onClick={() => setCohortFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        cohortFilter === 'ALL'
                          ? 'bg-[#D60303] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      All ({totalCount})
                    </button>
                    <button
                      onClick={() => setCohortFilter('R2_GRADED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        cohortFilter === 'R2_GRADED'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      R2 Graded ({r2Actual})
                    </button>
                    <button
                      onClick={() => setCohortFilter('R2_NON_GRADED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        cohortFilter === 'R2_NON_GRADED'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      R2 Non-Graded ({r2NonGraded})
                    </button>
                    <button
                      onClick={() => setCohortFilter('R3_GRADED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        cohortFilter === 'R3_GRADED'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      R3 Graded ({r3Actual})
                    </button>
                    <button
                      onClick={() => setCohortFilter('R3_NON_GRADED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        cohortFilter === 'R3_NON_GRADED'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      R3 Non-Graded ({r3NonGraded})
                    </button>
                    <button
                      onClick={() => setCohortFilter('DISQUALIFIED')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        cohortFilter === 'DISQUALIFIED'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Disqualified ({disqualifiedCount})
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                        <tr>
                          <th className="p-3">Contestant</th>
                          <th className="p-3 text-center">Account Status</th>
                          <th className="p-3 text-center">Round 1 (20M)</th>
                          <th className="p-3 text-center">Round 2 Cohort (70%)</th>
                          <th className="p-3 text-center">Round 2 (30M)</th>
                          <th className="p-3 text-center">Round 3 Cohort (50%)</th>
                          <th className="p-3 text-center">Round 3 (50M)</th>
                          <th className="p-3 text-right">Grand Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {displayed.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-zinc-500">
                              No contestants match the selected filter.
                            </td>
                          </tr>
                        ) : (
                          displayed.map((p) => {
                            const isDisq = p.isDisqualified || p.accountStatus === 'DISQUALIFIED';
                            const r1Score = p.round1Score ?? p.r1Score ?? 0;
                            const r2Score = p.round2Score ?? p.r2Score ?? 0;
                            const r3Score = p.round3Score ?? p.r3Score ?? 0;
                            const totalScore = p.totalScore ?? p.total ?? 0;

                            const r2Override = p.manualGradingOverrides?.round2;
                            const r3Override = p.manualGradingOverrides?.round3;

                            return (
                              <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                                <td className="p-3">
                                  <div className="font-bold text-zinc-900 dark:text-white">{p.name || p.id}</div>
                                  <div className="text-[10px] text-zinc-500">{p.id} • {p.college} ({p.department})</div>
                                </td>

                                <td className="p-3 text-center">
                                  {isDisq ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px]">
                                        DISQUALIFIED
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleExecuteReinstate(p.id)}
                                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                        title="Requalify & reinstate participant account"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Requalify</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                      ACTIVE
                                    </span>
                                  )}
                                </td>

                                <td className="p-3 text-center">
                                  <div className="font-bold text-zinc-900 dark:text-white">{r1Score} / 20</div>
                                  <div className="text-[10px] text-zinc-500">
                                    {p.r1Completed ? '✓ Completed' : 'Pending'} • 100% Graded
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                      getR2Graded(p)
                                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                                    }`}>
                                      {getR2Graded(p) ? '✓ Graded' : '◎ Non-Graded'}
                                      {r2Override && ` (Manual)`}
                                    </span>

                                    <div className="flex items-center gap-1">
                                      {getR2Graded(p) ? (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleGradingOverride(p.id, 2, 'non_graded')}
                                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-400 font-bold text-[10px] transition cursor-pointer"
                                          title="Demote to Non-Graded for Round 2"
                                        >
                                          Set Non-Graded
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleGradingOverride(p.id, 2, 'graded')}
                                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 font-bold text-[10px] transition cursor-pointer"
                                          title="Promote to Graded for Round 2"
                                        >
                                          Set Graded
                                        </button>
                                      )}
                                      {r2Override && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleGradingOverride(p.id, 2, 'auto')}
                                          className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px]"
                                          title="Reset to automatic rank calculation"
                                        >
                                          Auto
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <div className="font-bold text-zinc-900 dark:text-white">{r2Score} / 30</div>
                                  <div className="text-[10px] text-zinc-500">
                                    {p.r2Completed ? '✓ Completed' : 'Pending'}
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                      getR3Graded(p)
                                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                                    }`}>
                                      {getR3Graded(p) ? '✓ Graded' : '◎ Non-Graded'}
                                      {r3Override && ` (Manual)`}
                                    </span>

                                    <div className="flex items-center gap-1">
                                      {getR3Graded(p) ? (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleGradingOverride(p.id, 3, 'non_graded')}
                                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-400 font-bold text-[10px] transition cursor-pointer"
                                          title="Demote to Non-Graded for Round 3"
                                        >
                                          Set Non-Graded
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleGradingOverride(p.id, 3, 'graded')}
                                          className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 font-bold text-[10px] transition cursor-pointer"
                                          title="Promote to Graded for Round 3"
                                        >
                                          Set Graded
                                        </button>
                                      )}
                                      {r3Override && (
                                        <button
                                          type="button"
                                          onClick={() => handleToggleGradingOverride(p.id, 3, 'auto')}
                                          className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[10px]"
                                          title="Reset to automatic rank calculation"
                                        >
                                          Auto
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <div className="font-bold text-zinc-900 dark:text-white">{r3Score} / 50</div>
                                  <div className="text-[10px] text-zinc-500">
                                    {p.r3Completed ? '✓ Completed' : 'Pending'}
                                  </div>
                                </td>

                                <td className="p-3 text-right">
                                  <div className="text-sm font-black text-[#D60303]">{totalScore} / 100</div>
                                  <div className="text-[10px] text-zinc-500">Grand Total</div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Tab: Malpractice & Disqualification Operations */}
          {activeTab === 'malpractice' && (() => {
            let filtered = [...malpracticeRecords];
            if (malpracticeFilter === 'DISQUALIFIED') {
              filtered = filtered.filter(r => r.isDisqualified);
            } else if (malpracticeFilter === 'WARNINGS') {
              filtered = filtered.filter(r => r.warningCount > 0 && !r.isDisqualified);
            } else if (malpracticeFilter === 'MY_STATION') {
              filtered = filtered.filter(r => r.assignedRound === currentUser?.assignedRound || r.assignedCoordinator === currentUser?.id);
            }

            if (malpracticeSearch.trim()) {
              const q = malpracticeSearch.toLowerCase();
              filtered = filtered.filter(r =>
                r.id?.toLowerCase().includes(q) ||
                r.name?.toLowerCase().includes(q) ||
                r.college?.toLowerCase().includes(q) ||
                r.assignedRound?.toLowerCase().includes(q)
              );
            }

            const disqualifiedCount = malpracticeRecords.filter(r => r.isDisqualified).length;
            const warnedCount = malpracticeRecords.filter(r => r.warningCount > 0 && !r.isDisqualified).length;

            return (
              <div className="space-y-6 animate-slide-up">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Monitored Participants</span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">{malpracticeRecords.length}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 shadow-sm space-y-1">
                    <span className="text-[10px] font-mono uppercase text-red-600 dark:text-red-400 font-bold block">Disqualified / Frozen</span>
                    <span className="text-2xl font-black font-mono text-[#D60303]">{disqualifiedCount}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold block">Active Warnings (&gt;0)</span>
                    <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{warnedCount}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#141417] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Total Audit Logs</span>
                    <span className="text-2xl font-black font-mono text-zinc-700 dark:text-zinc-300">{malpracticeLogs.length}</span>
                  </div>
                </div>

                {malpracticeMsg && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-slide-up ${
                    malpracticeMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    <span>{malpracticeMsg.text}</span>
                    <button onClick={() => setMalpracticeMsg(null)} className="cursor-pointer text-xs font-mono">✕</button>
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                      <button
                        onClick={() => setMalpracticeFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                          malpracticeFilter === 'ALL'
                            ? 'bg-[#D60303] text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        All Contestants ({malpracticeRecords.length})
                      </button>

                      <button
                        onClick={() => setMalpracticeFilter('DISQUALIFIED')}
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                          malpracticeFilter === 'DISQUALIFIED'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Disqualified ({disqualifiedCount})</span>
                      </button>

                      <button
                        onClick={() => setMalpracticeFilter('WARNINGS')}
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                          malpracticeFilter === 'WARNINGS'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Warnings ({warnedCount})</span>
                      </button>

                      <button
                        onClick={() => setMalpracticeFilter('MY_STATION')}
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                          malpracticeFilter === 'MY_STATION'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        <span>My Lab Station</span>
                      </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search contestant ID, name..."
                        value={malpracticeSearch}
                        onChange={(e) => setMalpracticeSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono focus:border-[#D60303] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Malpractice Participant Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#595959] dark:bg-zinc-900 text-white font-mono">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Participant Name</th>
                          <th className="p-3">Assigned Station</th>
                          <th className="p-3 text-center">Warnings</th>
                          <th className="p-3 text-center">Account Status</th>
                          <th className="p-3 text-center">Disqualification / Malpractice Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-zinc-500 font-mono">
                              No participants matching the selected malpractice filter.
                            </td>
                          </tr>
                        ) : (
                          filtered.map(p => {
                            const isDisq = p.isDisqualified || p.accountStatus === 'DISQUALIFIED';
                            return (
                              <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <td className="p-3 font-mono font-bold text-[#D60303]">{p.id}</td>
                                <td className="p-3">
                                  <div className="font-semibold">{p.name}</div>
                                  <div className="text-[10px] text-zinc-500">{p.college}</div>
                                </td>
                                <td className="p-3 font-mono text-[11px]">
                                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                    {p.assignedRound || 'Lab Terminal 1'}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                    p.warningCount >= 3 ? 'bg-red-500/20 text-red-500 border border-red-500/40' :
                                    p.warningCount > 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' :
                                    'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                                  }`}>
                                    {p.warningCount || 0} / 3 Warnings
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {isDisq ? (
                                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] flex items-center justify-center gap-1 mx-auto w-fit shadow-xs">
                                      <UserX className="w-3 h-3" /> DISQUALIFIED
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px]">
                                      ACTIVE
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-2 font-mono text-xs">
                                    {isDisq ? (
                                      <button
                                        onClick={() => handleExecuteReinstate(p.id)}
                                        disabled={isProcessingMalpractice}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                                        title="Restore contestant access to active tournament"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Reinstate Access</span>
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleIssueWarning(p.id)}
                                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-500/30 font-bold transition cursor-pointer flex items-center gap-1"
                                          title="Record malpractice warning without instant disqualification"
                                        >
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                          <span>Warn</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            setDisqualifyingParticipant(p);
                                            setDisqualifyReason('Tab Switching / Background Process');
                                            setCustomReason('');
                                          }}
                                          className="px-3 py-1.5 rounded-lg bg-[#D60303] hover:bg-[#b00202] text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                                          title="Instantly freeze and disqualify contestant for malpractice"
                                        >
                                          <ShieldAlert className="w-3.5 h-3.5" />
                                          <span>Disqualify</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Real-Time Telemetry Audit Stream */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D60303]" />
                      <span>Live Anti-Cheat Telemetry Audit Feed</span>
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400">Latest 100 System Events</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
                    {malpracticeLogs.length === 0 ? (
                      <p className="text-zinc-500 text-center py-4">No anti-cheat infractions recorded yet.</p>
                    ) : (
                      malpracticeLogs.map((log, idx) => (
                        <div key={log.id || idx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              log.type?.includes('DISQUALIF') ? 'bg-red-500 text-white' :
                              log.type?.includes('WARNING') ? 'bg-amber-500/20 text-amber-600' :
                              'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}>
                              {log.type}
                            </span>
                            <span className="font-bold text-[#D60303]">{log.participantId}:</span>
                            <span className="text-zinc-700 dark:text-zinc-300 truncate">{log.message}</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 shrink-0">{log.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Disqualification Reason Modal */}
                {disqualifyingParticipant && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-[#141417] p-6 rounded-3xl border-2 border-red-600 shadow-2xl max-w-lg w-full space-y-5 animate-slide-up">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-2xl bg-red-500/10 text-red-600 shrink-0">
                          <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                            Disqualify Participant: {disqualifyingParticipant.id}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            Contestant: {disqualifyingParticipant.name} ({disqualifyingParticipant.college})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <label className="block font-bold text-zinc-700 dark:text-zinc-300">Select Malpractice Violation Reason:</label>
                        <select
                          value={disqualifyReason}
                          onChange={(e) => setDisqualifyReason(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:border-red-600 focus:outline-none"
                        >
                          <option value="Tab Switching / Background Process">Tab Switching / Background Browser Window</option>
                          <option value="Unauthorized Electronic Device / Mobile">Unauthorized Electronic Device / Mobile Usage</option>
                          <option value="Screen Sharing / External Assistance">Screen Sharing / External Chat Assistance</option>
                          <option value="Code Plagiarism / Solution Sharing">Code Plagiarism / Unauthorized Code Copying</option>
                          <option value="Physical Lab Misconduct">Physical Misconduct / Disobeying Lab Protocol</option>
                          <option value="Exceeded Anti-Cheat Violation Threshold">Exceeded 3 Anti-Cheat Warnings Threshold</option>
                          <option value="OTHER">Custom Reason...</option>
                        </select>

                        {disqualifyReason === 'OTHER' && (
                          <textarea
                            rows={3}
                            placeholder="Enter specific malpractice violation details..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-mono text-xs focus:border-red-600 focus:outline-none"
                          />
                        )}

                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                          ⚠️ Disqualifying will immediately freeze their tournament workstation, set their accountStatus to DISQUALIFIED, nullify scores, and record an audit log.
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setDisqualifyingParticipant(null)}
                          className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleExecuteDisqualify}
                          disabled={isProcessingMalpractice}
                          className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md flex items-center gap-1.5"
                        >
                          <UserX className="w-4 h-4" />
                          <span>{isProcessingMalpractice ? 'Freezing...' : 'Confirm Disqualification'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
                          <span className="text-[10px] font-mono text-zinc-500">{formatAnnouncementTime(ann)}</span>
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

          {/* Tab 5: Live Competition Leaderboard & Mark Grading */}
          {activeTab === 'leaderboard' && (() => {
            const isAllRoundsEnded = ['COMPLETED', 'ROUND_3_ENDED'].includes(eventState?.status);
            const showCalculations = true;

            const r1Cutoff = eventState?.round1QualifyCount || Math.ceil((leaderboard.length || 1) * 0.8);
            const r2Cutoff = eventState?.round2QualifyCount || Math.ceil((leaderboard.length || 1) * 0.5);

            let filteredList = [...leaderboard];

            if (leaderboardFilter === 'R1') {
              filteredList = [...leaderboard].sort((a, b) => (b.r1Score ?? b.r1 ?? 0) - (a.r1Score ?? a.r1 ?? 0));
            } else if (leaderboardFilter === 'R2') {
              filteredList = [...leaderboard]
                .filter(u => u.qualifiedR2 || u.qualifiedForRound2 || u.isGradedR2)
                .sort((a, b) => ((b.r1Score ?? b.r1 ?? 0) + (b.r2Score ?? b.r2 ?? 0)) - ((a.r1Score ?? a.r1 ?? 0) + (a.r2Score ?? a.r2 ?? 0)));
            } else if (leaderboardFilter === 'R3') {
              filteredList = [...leaderboard]
                .filter(u => u.qualifiedR3 || u.qualifiedForRound3 || u.isGradedR3)
                .sort((a, b) => (b.totalScore ?? b.total ?? 0) - (a.totalScore ?? a.total ?? 0));
            }

            if (leaderboardSearch.trim()) {
              const q = leaderboardSearch.toLowerCase();
              filteredList = filteredList.filter(u => 
                u.name?.toLowerCase().includes(q) || 
                u.id?.toLowerCase().includes(q) || 
                u.college?.toLowerCase().includes(q)
              );
            }

            const formatDuration = (ms) => {
              if (!ms || ms >= 999999999) return '—';
              const totalSec = Math.floor(ms / 1000);
              const m = Math.floor(totalSec / 60);
              const s = totalSec % 60;
              return `${m}m ${s}s`;
            };

            const r1BandsCount = { Excellent: 0, Good: 0, Poor: 0 };
            const r2BandsCount = { Excellent: 0, Good: 0, Poor: 0 };
            const r3BandsCount = { Excellent: 0, Good: 0, Poor: 0 };
            const grandBandsCount = { Excellent: 0, Good: 0, Poor: 0 };

            leaderboard.forEach(u => {
              const r1Val = u.r1Score ?? u.r1 ?? 0;
              const r2Val = u.r2Score ?? u.r2 ?? 0;
              const r3Val = u.r3Score ?? u.r3 ?? 0;
              const gVal = u.totalScore ?? u.total ?? 0;

              const r1B = u.r1Band?.band || (r1Val >= 16 ? 'Excellent' : r1Val >= 10 ? 'Good' : 'Poor');
              const r2B = u.r2Band?.band || (r2Val >= 24 ? 'Excellent' : r2Val >= 15 ? 'Good' : 'Poor');
              const r3B = u.r3Band?.band || (r3Val >= 40 ? 'Excellent' : r3Val >= 25 ? 'Good' : 'Poor');
              const gB = u.grandBand?.band || (gVal >= 80 ? 'Excellent' : gVal >= 50 ? 'Good' : 'Poor');

              if (r1BandsCount[r1B] !== undefined) r1BandsCount[r1B]++;
              if (r2BandsCount[r2B] !== undefined) r2BandsCount[r2B]++;
              if (r3BandsCount[r3B] !== undefined) r3BandsCount[r3B]++;
              if (grandBandsCount[gB] !== undefined) grandBandsCount[gB]++;
            });

            // Podium cohort (Top 3)
            const podiumWinners = leaderboard.slice(0, 3);

            return (
              <div className="space-y-6 animate-slide-up">
                {/* Status Bar */}
                <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-zinc-900 dark:text-zinc-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <span>{isAllRoundsEnded ? '✅ All 3 Rounds Concluded — Official Final Standings' : '⚡ Live Real-Time Mark Grading & Standings Active'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          {eventState?.status}
                        </span>
                        {eventState?.status?.includes('RUNNING') && (
                          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            {formatRoundTime(roundTimeLeft)}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        Live dynamic calculations across all active rounds (Grand Total: 100 Marks) using the Master Tie-Breaking Hierarchy.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <button
                      onClick={async () => {
                        await recalculateLeaderboard();
                        await fetchLeaderboard();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Trigger immediate live re-evaluation of scores across all rounds"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Recalculate Live Scores</span>
                    </button>
                    <button
                      onClick={fetchLeaderboard}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                      <span>↻ Refresh Standings</span>
                    </button>
                    {!isAllRoundsEnded && (
                      <button
                        onClick={() => {
                          handleSetRoundStatus('COMPLETED', 3);
                          fetchLeaderboard();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-300" />
                        <span>Conclude Rounds</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Rubrics Performance Attainment Summary */}
                {showCalculations && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Round 1 Attainment */}
                    <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">ROUND 1: TECH QUIZ</span>
                        <span className="text-xs font-mono font-bold text-[#D60303]">20 Marks</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">20 MCQs, 1 mark each, auto-graded.</p>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between p-1.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <span>Excellent (16–20 pts)</span>
                          <span className="font-bold">{r1BandsCount.Excellent}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <span>Good (10–15 pts)</span>
                          <span className="font-bold">{r1BandsCount.Good}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          <span>Poor (&lt;10 pts)</span>
                          <span className="font-bold">{r1BandsCount.Poor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Round 2 Attainment */}
                    <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">ROUND 2: DEBUG IT</span>
                        <span className="text-xs font-mono font-bold text-[#D60303]">30 Marks</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">3 problems × 10M (Logic 4 + Out 3 + Qual 2 + Viva 1).</p>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between p-1.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <span>Excellent (24–30 pts)</span>
                          <span className="font-bold">{r2BandsCount.Excellent}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <span>Good (15–23.5 pts)</span>
                          <span className="font-bold">{r2BandsCount.Good}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          <span>Poor (&lt;15 pts)</span>
                          <span className="font-bold">{r2BandsCount.Poor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Round 3 Attainment */}
                    <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">ROUND 3: TECH HUNT</span>
                        <span className="text-xs font-mono font-bold text-[#D60303]">50 Marks</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">5 stations × 10M (−2 penalty per hint reveal).</p>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between p-1.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <span>Excellent (40–50 pts)</span>
                          <span className="font-bold">{r3BandsCount.Excellent}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <span>Good (25–39 pts)</span>
                          <span className="font-bold">{r3BandsCount.Good}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          <span>Poor (&lt;25 pts)</span>
                          <span className="font-bold">{r3BandsCount.Poor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Grand Total Attainment */}
                    <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-5 rounded-2xl border border-[#D60303]/40 shadow-sm space-y-3 bg-[#D60303]/5">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">GRAND TOTAL & PODIUM</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#D60303] text-white">100 Marks</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">R1(20) + R2(30) + R3(50). Top 80% → Top 50%.</p>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between p-1.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <span>Distinction (80–100 pts)</span>
                          <span className="font-bold">{grandBandsCount.Excellent}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <span>Merit (50–79.5 pts)</span>
                          <span className="font-bold">{grandBandsCount.Good}</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400">
                          <span>Improvement (&lt;50 pts)</span>
                          <span className="font-bold">{grandBandsCount.Poor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Official Podium Showcase (Top 3) */}
                {showCalculations && podiumWinners.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 dark:from-amber-500/5 dark:via-purple-500/5 dark:to-amber-500/5 p-6 rounded-2xl border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                          🏆 Official Symposium Podium (Master Tie-Breaker Evaluated)
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">
                        Higher R2 Score ➔ Fewer R3 Hints ➔ Faster R3 Time ➔ Faster R1 Time
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {podiumWinners.map((winner, idx) => {
                        const rankNum = idx + 1;
                        const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉';
                        const title = rankNum === 1 ? '1st Place (Champion)' : rankNum === 2 ? '2nd Place (Runner-Up)' : '3rd Place';
                        const borderColor = rankNum === 1 ? 'border-amber-400 bg-amber-500/10' : rankNum === 2 ? 'border-zinc-400 bg-zinc-500/10' : 'border-amber-700 bg-amber-700/10';

                        return (
                          <div key={winner.id || idx} className={`p-4 rounded-xl border ${borderColor} space-y-2`}>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl">{medal}</span>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/20 text-zinc-800 dark:text-zinc-200">
                                {title}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-sm text-zinc-900 dark:text-white">{winner.name}</div>
                              <div className="text-xs text-zinc-500 font-mono">{winner.id} • {winner.college}</div>
                            </div>
                            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-600 dark:text-zinc-400">Total Marks:</span>
                              <span className="font-bold text-sm text-[#D60303]">{winner.totalScore ?? winner.total ?? 0} / 100</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center pt-1 text-zinc-600 dark:text-zinc-400">
                              <div className="p-1 rounded bg-black/5 dark:bg-white/5">R1: {winner.r1Score ?? winner.r1 ?? 0}/20</div>
                              <div className="p-1 rounded bg-black/5 dark:bg-white/5">R2: {winner.r2Score ?? winner.r2 ?? 0}/30</div>
                              <div className="p-1 rounded bg-black/5 dark:bg-white/5">R3: {winner.r3Score ?? winner.r3 ?? 0}/50</div>
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500 text-center">
                              Hints: {winner.r3HintsCount ?? 0} • R3 Time: {formatDuration(winner.r3Duration)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mark Grading Table Container */}
                <div className="bg-white/80 dark:bg-[#141417]/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4 card-hover-lift">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#27272a] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-[#D60303]" />
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                          Automated Mark Grading Table & Standings
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-[#a1a1aa] mt-0.5">
                        Top {r1Cutoff} in Round 1 graded for Round 2 • Top {r2Cutoff} in Round 2 graded for Round 3 Finals.
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
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">Top {r1Cutoff} Graded</span>
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
                        <span>🏆 Round 3 Podium Cohort</span>
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
                      <span>Progression: Round 1 (Top 80% Graded) ➔ Round 2 (Top 50% Graded) ➔ Round 3 Podium</span>
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
                            <th className="p-3">Participant</th>
                            <th className="p-3 text-center">R1: Decode<br/><span className="text-[10px] font-normal text-zinc-500">20 Marks</span></th>
                            <th className="p-3 text-center">R2: Debug<br/><span className="text-[10px] font-normal text-zinc-500">30 Marks</span></th>
                            <th className="p-3 text-center">R3: Hunt<br/><span className="text-[10px] font-normal text-zinc-500">50 Marks</span></th>
                            <th className="p-3 text-center font-bold text-[#D60303]">Grand Total<br/><span className="text-[10px] font-normal text-zinc-500">100 Marks</span></th>
                            <th className="p-3 text-center">Tie-Breaker Metrics<br/><span className="text-[10px] font-normal text-zinc-500">R2 / Hints / Time</span></th>
                            <th className="p-3 text-center">Official Qualification Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-[#27272a] text-zinc-800 dark:text-zinc-200">
                          {filteredList.map((u, idx) => {
                            const displayRank = u.rank || (idx + 1);
                            const r1Val = u.r1Score ?? u.r1 ?? 0;
                            const r2Val = u.r2Score ?? u.r2 ?? 0;
                            const r3Val = u.r3Score ?? u.r3 ?? 0;
                            const totalVal = u.totalScore ?? u.total ?? 0;

                            const r1Band = u.r1Band || (r1Val >= 16 ? { band: 'Excellent', badgeColor: 'emerald' } : r1Val >= 10 ? { band: 'Good', badgeColor: 'amber' } : { band: 'Poor', badgeColor: 'rose' });
                            const r2Band = u.r2Band || (r2Val >= 24 ? { band: 'Excellent', badgeColor: 'emerald' } : r2Val >= 15 ? { band: 'Good', badgeColor: 'amber' } : { band: 'Poor', badgeColor: 'rose' });
                            const r3Band = u.r3Band || (r3Val >= 40 ? { band: 'Excellent', badgeColor: 'emerald' } : r3Val >= 25 ? { band: 'Good', badgeColor: 'amber' } : { band: 'Poor', badgeColor: 'rose' });
                            const grandBand = u.grandBand || (totalVal >= 80 ? { band: 'Excellent', badgeColor: 'emerald' } : totalVal >= 50 ? { band: 'Good', badgeColor: 'amber' } : { band: 'Poor', badgeColor: 'rose' });

                            const bandColorClass = (color) => {
                              if (color === 'emerald') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                              if (color === 'amber') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
                              return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
                            };

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
                                <td className="p-3">
                                  <div className="font-mono font-bold text-[#D60303]">{u.id}</div>
                                  <div className="font-semibold">{u.name}</div>
                                  <div className="text-[11px] text-zinc-500">{u.college}</div>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{r1Val} / 20</div>
                                  <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-bold border mt-0.5 ${bandColorClass(r1Band.badgeColor)}`}>
                                    {r1Band.band}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{r2Val} / 30</div>
                                  <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-bold border mt-0.5 ${bandColorClass(r2Band.badgeColor)}`}>
                                    {r2Band.band}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{r3Val} / 50</div>
                                  <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-bold border mt-0.5 ${bandColorClass(r3Band.badgeColor)}`}>
                                    {r3Band.band}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono">
                                  <div className="font-bold text-[#D60303] text-sm">{totalVal} / 100</div>
                                  <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-bold border mt-0.5 ${bandColorClass(grandBand.badgeColor)}`}>
                                    {grandBand.band}
                                  </span>
                                </td>
                                <td className="p-3 text-center font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                                  <div>R2: <span className="font-bold text-zinc-900 dark:text-zinc-100">{r2Val}</span></div>
                                  <div>Hints: <span className="font-bold text-zinc-900 dark:text-zinc-100">{u.r3HintsCount ?? 0}</span></div>
                                  <div>R3 Time: {formatDuration(u.r3Duration)}</div>
                                </td>
                                <td className="p-3 text-center">
                                  {u.isWinner || (displayRank <= 3 && totalVal > 0 && (u.qualifiedR3 || u.isGradedR3)) ? (
                                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px] border border-amber-500/30 inline-flex items-center gap-1">
                                      🏆 Podium Winner
                                    </span>
                                  ) : u.qualifiedR3 || u.qualifiedForRound3 || u.isGradedR3 ? (
                                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono font-bold text-[10px] border border-purple-500/30 inline-flex items-center gap-1">
                                      ⭐ R3 Finalist (Graded)
                                    </span>
                                  ) : u.qualifiedR2 || u.qualifiedForRound2 || u.isGradedR2 ? (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/30 inline-flex items-center gap-1">
                                      ⭐ R2 Qualifier (Graded)
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
              </div>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
