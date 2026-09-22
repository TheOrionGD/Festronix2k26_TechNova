import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
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
  KeyRound
} from 'lucide-react';

export default function CoordinatorPortal() {
  const { currentUser, setIsCoordinatorModalOpen, setPendingVerificationProblemId, fetchLeaderboard } = useApp();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'participants' | 'content'
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        alert(data.message || 'Generation failed.');
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
    } catch (err) { }
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
    } catch (err) { }
  };

  useEffect(() => {
    fetchCoordinatorQueue();
    fetchParticipants();
    fetchColleges();
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
        setPartMsg(data.message || 'Failed to create participant.');
      }
    } catch (err) {
      setPartMsg('Server communication error.');
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
        alert(data.message || 'Bulk import failed.');
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
    } catch (err) { }
  };

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto space-y-6 animate-hero-entrance">
          {/* Header */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-widest">COORDINATOR CONTROL CENTER</span>
                <h2 className="text-xl font-bold text-[#A30B1A]">TECHNOVA CONTENT & VERIFICATION WORKSPACE</h2>
                <p className="text-xs text-[#595959] font-medium">Manage competition participants, questions, and physical lab terminal verification.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-[#595959] text-[#EFEEEA] font-bold shadow-2xs">
                STATION: {currentUser?.assignedRound || 'Lab Terminal'}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-[#EFEEEA] font-bold shadow-2xs">
                COORD: {currentUser?.id || 'COORDINATOR'} ({myAllocatedCount} Assigned)
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#595959]/20 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'verification' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Physical Verification Queue ({submissionsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'participants' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Participant Management ({participantsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'content' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <Database className="w-4 h-4" />
              <span>Question & Content Management Hub</span>
            </button>
          </div>

          {/* Tab 1: Physical Verification Queue */}
          {activeTab === 'verification' && (
            <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-4 card-hover-lift animate-slide-up">
              <h3 className="text-base font-bold text-[#A30B1A]">Round 2 Solution Verification Queue</h3>

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
                            {sub.code || '// No code content'}
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
                          <td className="p-3 text-[#595959] font-medium text-[11px]">{p.college || 'K. Ramakrishnan College of Technology'}</td>
                          <td className="p-3 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              {p.assignedRound || 'Unassigned'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px]">{p.department || 'CSE'} ({p.year || 'III'})</td>
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

          {/* Tab 3: Content Management Hub */}
          {activeTab === 'content' && (
            <div className="animate-slide-up">
              <ContentManagementHub userRole="COORDINATOR" />
            </div>
          )}
        </main>
      </div>

      <CoordinatorModal />
    </div>
  );
}
