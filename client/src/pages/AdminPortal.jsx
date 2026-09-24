import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ContentManagementHub from '../components/ContentManagementHub';
import {
  ShieldCheck,
  Settings,
  Trophy,
  Plus,
  Trash2,
  ShieldAlert,
  Sliders,
  Database,
  Users,
  UserPlus,
  Edit3,
  X,
  KeyRound,
  Sparkles
} from 'lucide-react';

export default function AdminPortal() {
  const {
    eventState,
    updateEventState,
    antiCheatFlags,
    leaderboard,
    fetchLeaderboard,
    questions,
    fetchQuestions
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'coordinators' | 'qualifications' | 'questions' | 'audit'

  // Leaderboard Filter & Search
  const [leaderboardFilter, setLeaderboardFilter] = useState('ALL'); // 'ALL' | 'R1' | 'R2' | 'R3'
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  // Editable Event Settings
  const [r1Qualify, setR1Qualify] = useState(eventState.round1QualifyCount);
  const [r2Qualify, setR2Qualify] = useState(eventState.round2QualifyCount);
  const [regCount, setRegCount] = useState(eventState.registrationCount);
  const [currentStatus, setCurrentStatus] = useState(eventState.status);

  // Coordinator Management State
  const [coordinatorsList, setCoordinatorsList] = useState([]);
  const [isCreatingCoord, setIsCreatingCoord] = useState(false);
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordDept, setCoordDept] = useState('CSE');
  const [coordLab, setCoordLab] = useState('Lab Terminal 1');
  const [coordPassword, setCoordPassword] = useState('');
  const [coordPin, setCoordPin] = useState('1234');
  const [coordMsg, setCoordMsg] = useState('');

  // Admin User Credential Editing Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editLab, setEditLab] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editMsg, setEditMsg] = useState('');

  // Segregation & Participant Allocation State
  const [segregationMatrix, setSegregationMatrix] = useState([]);
  const [isRebalancing, setIsRebalancing] = useState(false);

  const fetchCoordinators = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users?role=COORDINATOR`);
      const data = await res.json();
      if (data.success) {
        setCoordinatorsList(data.users || []);
      }
    } catch (err) {
      console.error('Fetch coordinators error:', err);
      setCoordinatorsList([]);
    }
  };

  const fetchSegregationMatrix = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/participant-segregation`);
      const data = await res.json();
      if (data.success) {
        setSegregationMatrix(data.matrix || []);
      }
    } catch (err) {
      console.error('Fetch segregation matrix error:', err);
      setSegregationMatrix([]);
    }
  };

  const handleAutoRebalance = async () => {
    setIsRebalancing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/auto-assign-participants`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSegregationMatrix(data.matrix || []);
        alert(`Auto-rebalance successful! ${data.totalParticipants} participants equally divided among ${data.totalCoordinators} active coordinators.`);
      }
    } catch (err) {
      console.error('Auto rebalance error:', err);
      alert('Failed to rebalance allocations.');
    } finally {
      setIsRebalancing(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCoordinators();
      fetchSegregationMatrix();
      if (typeof fetchQuestions === 'function') {
        fetchQuestions();
      }
    });
  }, [fetchQuestions]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateEventState({
      round1QualifyCount: parseInt(r1Qualify),
      round2QualifyCount: parseInt(r2Qualify),
      registrationCount: parseInt(regCount),
      status: currentStatus
    });
    alert('Event Control Settings Updated Successfully!');
  };

  const handleCreateCoordinator = async (e) => {
    e.preventDefault();
    setCoordMsg('');
    if (!coordName.trim() || !coordEmail.trim() || !coordPassword.trim()) {
      setCoordMsg('Please fill in Name, Email, and Password.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/coordinators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: coordName.trim(),
          email: coordEmail.trim(),
          department: coordDept,
          assignedRound: coordLab,
          password: coordPassword.trim(),
          pin: coordPin.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchCoordinators();
        setCoordName('');
        setCoordEmail('');
        setCoordPassword('');
        setCoordPin('1234');
        setIsCreatingCoord(false);
        alert(`Coordinator ${data.user.id} created successfully! Password set.`);
      } else {
        setCoordMsg(data.message);
      }
    } catch (err) {
      console.error('Create coordinator error:', err);
      setCoordMsg('Server communication error.');
    }
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPin(user.pin);
    setEditLab(user.assignedRound);
    setEditPassword('');
    setEditStatus(user.accountStatus);
    setEditMsg('');
  };

  const handleSaveUserCredentials = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditMsg('');

    try {
      const res = await fetch(`${API_BASE}/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          pin: editPin.trim(),
          assignedRound: editLab.trim(),
          password: editPassword.trim() || undefined,
          accountStatus: editStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchCoordinators();
        setEditingUser(null);
        alert(`Authentication record for ${editingUser.id} updated successfully!`);
      } else {
        setEditMsg(data.message);
      }
    } catch (err) {
      console.error('Save user error:', err);
      setEditMsg('Error connecting to backend server.');
    }
  };

  const handleDeleteCoordinator = async (id) => {
    if (!window.confirm(`Are you sure you want to remove Coordinator ${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCoordinators();
      }
    } catch (err) {
      console.error('Delete coordinator error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full min-w-0 animate-hero-entrance">
          {/* Top Banner */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-widest">SUPER ADMIN</span>
                <h2 className="text-xl font-bold text-[#A30B1A]">TECHNOVA SYMPOSIUM CONTROL CENTER</h2>
                <p className="text-xs text-[#595959] font-medium">Manage event states, coordinator accounts, user credential authentication records, and question banks.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-[#EFEEEA] font-bold shadow-2xs">
                STATE: {eventState.status}
              </span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#595959]/20 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'overview' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Event Controls & Limits</span>
            </button>

            <button
              onClick={() => setActiveTab('coordinators')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'coordinators' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Coordinator & Credentials Management ({coordinatorsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qualifications')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'qualifications' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Live Leaderboard ({leaderboard.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'questions' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <Database className="w-4 h-4" />
              <span>Question Bank ({questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${activeTab === 'audit' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
                }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Anti-Cheat Audit Logs ({antiCheatFlags.length})</span>
            </button>
          </div>

          {/* TAB 1: Event Controls */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              <form onSubmit={handleSaveSettings} className="bg-[#EFEEEA] p-6 rounded-2xl space-y-5 border border-[#595959] shadow-sm card-hover-lift">
                <h3 className="text-base font-bold text-[#A30B1A] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#D60303]" />
                  <span>Dynamic Registration & Qualification Limits</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#595959] mb-1">Total Participant Registration Limit</label>
                    <input
                      type="number"
                      value={regCount}
                      onChange={(e) => setRegCount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-[#595959] font-mono focus:border-[#D60303] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#595959] mb-1">Round 1 Qualification Limit</label>
                    <input
                      type="number"
                      value={r1Qualify}
                      onChange={(e) => setR1Qualify(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-[#595959] font-mono focus:border-[#D60303] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#595959] mb-1">Round 2 Qualification Limit</label>
                    <input
                      type="number"
                      value={r2Qualify}
                      onChange={(e) => setR2Qualify(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-[#595959] font-mono focus:border-[#D60303] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#595959] mb-1">Active Event Stage Machine State</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-[#595959] font-mono focus:border-[#D60303] focus:outline-none transition-colors"
                    >
                      <option value="REGISTRATION">REGISTRATION OPEN</option>
                      <option value="ROUND_1_RUNNING">ROUND 1 — TECH QUIZ RUNNING</option>
                      <option value="ROUND_1_ENDED">ROUND 1 — REVIEW & QUALIFICATION</option>
                      <option value="ROUND_2_RUNNING">ROUND 2 — DEBUG IT RUNNING</option>
                      <option value="ROUND_2_ENDED">ROUND 2 — REVIEW & QUALIFICATION</option>
                      <option value="ROUND_3_RUNNING">ROUND 3 — TECH HUNT RUNNING</option>
                      <option value="COMPLETED">EVENT COMPLETED</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-md transition cursor-pointer btn-interactive"
                >
                  Save Configuration Changes
                </button>
              </form>

              <div className="space-y-4">
                <div className="bg-[#EFEEEA] p-6 rounded-2xl space-y-4 border border-[#595959] shadow-sm card-hover-lift">
                  <h3 className="text-base font-bold text-[#A30B1A]">Symposium Live Metrics</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959]">
                      <p className="text-[#595959] font-semibold">Registered Contestants</p>
                      <p className="text-2xl font-black text-[#A30B1A] mt-1 font-mono">{leaderboard.length}</p>
                    </div>
                    <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959]">
                      <p className="text-[#595959] font-semibold">Coordinators Active</p>
                      <p className="text-2xl font-black text-[#D60303] mt-1 font-mono">{coordinatorsList.length}</p>
                    </div>
                    <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959]">
                      <p className="text-[#595959] font-semibold">Round 1 Target</p>
                      <p className="text-2xl font-black text-[#C23D31] mt-1 font-mono">{r1Qualify}</p>
                    </div>
                    <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959]">
                      <p className="text-[#595959] font-semibold">Questions Active</p>
                      <p className="text-2xl font-black text-[#595959] mt-1 font-mono">{questions.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Coordinator & Credentials Management */}
          {activeTab === 'coordinators' && (
            <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-6 card-hover-lift animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#A30B1A] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D60303]" />
                    <span>Lab Coordinator Roster & User Authentication Control</span>
                  </h3>
                  <p className="text-xs text-[#595959]">Admin can create coordinators and modify/reset any user's credentials (name, email, password, PIN, status).</p>
                </div>

                <button
                  onClick={() => setIsCreatingCoord(!isCreatingCoord)}
                  className="px-4 py-2 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold text-xs flex items-center gap-2 cursor-pointer btn-interactive"
                >
                  {isCreatingCoord ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{isCreatingCoord ? 'Cancel' : 'Add New Coordinator'}</span>
                </button>
              </div>

              {/* Create Coordinator Form */}
              {isCreatingCoord && (
                <form onSubmit={handleCreateCoordinator} className="p-5 bg-white/60 rounded-2xl border border-[#595959]/40 space-y-4 text-xs animate-slide-up">
                  <h4 className="font-bold text-[#A30B1A] uppercase tracking-wider">Create Coordinator Account</h4>

                  {coordMsg && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-xl font-bold">{coordMsg}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Coordinator Name</label>
                      <input
                        type="text"
                        required
                        value={coordName}
                        onChange={(e) => setCoordName(e.target.value)}
                        placeholder="e.g. Lab Coordinator 7"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={coordEmail}
                        onChange={(e) => setCoordEmail(e.target.value)}
                        placeholder="coord7@technova.edu"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Assigned Lab / Station</label>
                      <input
                        type="text"
                        value={coordLab}
                        onChange={(e) => setCoordLab(e.target.value)}
                        placeholder="Lab Terminal 7"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Secure Password</label>
                      <input
                        type="text"
                        required
                        value={coordPassword}
                        onChange={(e) => setCoordPassword(e.target.value)}
                        placeholder="TN2026#CoordPass"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Authorization PIN (4-Digits)</label>
                      <input
                        type="text"
                        required
                        value={coordPin}
                        onChange={(e) => setCoordPin(e.target.value)}
                        placeholder="1007"
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#595959] mb-1">Department</label>
                      <input
                        type="text"
                        value={coordDept}
                        onChange={(e) => setCoordDept(e.target.value)}
                        className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold shadow-md hover:bg-[#A30B1A] transition cursor-pointer btn-interactive flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Coordinator Account</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#595959] text-[#EFEEEA] font-mono">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Coordinator Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Assigned Lab</th>
                      <th className="p-3 text-center">Auth PIN</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#595959]/20 text-[#595959]">
                    {coordinatorsList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-6 text-center text-[#595959]">No Coordinators found in system.</td>
                      </tr>
                    ) : (
                      coordinatorsList.map(c => (
                        <tr key={c.id} className="hover:bg-[#595959]/5 transition-colors font-medium">
                          <td className="p-3 font-mono font-bold text-[#D60303]">{c.id}</td>
                          <td className="p-3 font-semibold">{c.name}</td>
                          <td className="p-3 text-[#595959]/80">{c.email}</td>
                          <td className="p-3 font-mono text-[11px]">{c.assignedRound}</td>
                          <td className="p-3 text-center font-mono font-bold text-[#A30B1A]">{c.pin}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {c.accountStatus}
                            </span>
                          </td>
                          <td className="p-3 text-center flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditUserModal(c)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 transition cursor-pointer"
                              title="Modify Authentication Credentials (Password, PIN, Name, Email)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoordinator(c.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 transition cursor-pointer"
                              title="Delete Coordinator"
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

              {/* Participant Segregation & Allocation Matrix */}
              <div className="pt-6 border-t border-[#595959]/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#A30B1A] flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#D60303]" />
                      <span>Equal Participant Segregation & Distribution Matrix</span>
                    </h4>
                    <p className="text-xs text-[#595959]">Dynamic equal allocation algorithm distributes all registered participants (N) across active Lab Coordinators (C).</p>
                  </div>

                  <button
                    onClick={handleAutoRebalance}
                    disabled={isRebalancing}
                    className="px-4 py-2 rounded-xl bg-[#595959] text-[#EFEEEA] font-bold text-xs hover:bg-[#A30B1A] transition cursor-pointer btn-interactive flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isRebalancing ? 'Rebalancing...' : 'Auto-Rebalance Allocation (N/C)'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {segregationMatrix.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-xs text-[#595959] bg-white/40 rounded-xl border border-[#595959]/20">
                      No participants registered or no active coordinators to display segregation.
                    </div>
                  ) : (
                    segregationMatrix.map((m, idx) => (
                      <div key={m.coordinatorId} className="p-4 bg-white/80 rounded-xl border border-[#595959]/30 space-y-2 card-hover-lift">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#D60303] bg-[#D60303]/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-[#D60303]" />
                            <span>Station #{idx + 1} — {m.coordinatorId}</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#595959] bg-[#595959]/10 px-2 py-0.5 rounded">
                            {m.assignedLab}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#A30B1A]">{m.coordinatorName}</p>
                          <p className="text-[11px] text-[#595959] font-mono">{m.coordinatorEmail}</p>
                        </div>

                        <div className="pt-2 border-t border-[#595959]/20 flex items-center justify-between text-xs">
                          <span className="text-[#595959] font-semibold">Allocated Count:</span>
                          <span className="font-mono font-bold text-[#D60303] text-sm bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {m.allocatedCount} Participants
                          </span>
                        </div>

                        {m.startId && m.endId && (
                          <div className="text-[10px] font-mono text-[#595959] bg-[#EFEEEA] p-2 rounded-lg border border-[#595959]/20 flex items-center justify-between">
                            <span>ID Range:</span>
                            <span className="font-bold text-[#A30B1A]">{m.startId} - {m.endId}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Live Leaderboard & Round Progression */}
          {activeTab === 'qualifications' && (() => {
            const r1Cutoff = eventState?.round1QualifyCount || 30;
            const r2Cutoff = eventState?.round2QualifyCount || 10;

            let filteredList = [...leaderboard];

            if (leaderboardFilter === 'R1') {
              filteredList = [...leaderboard].sort((a, b) => (b.r1 || b.r1Score || 0) - (a.r1 || a.r1Score || 0));
            } else if (leaderboardFilter === 'R2') {
              filteredList = [...leaderboard]
                .filter(u => u.qualifiedR2 || u.qualifiedForRound2)
                .sort((a, b) => ((b.r1 || 0) + (b.r2 || 0)) - ((a.r1 || 0) + (a.r2 || 0)));
            } else if (leaderboardFilter === 'R3') {
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
              <div className="bg-white dark:bg-[#141417] p-6 rounded-2xl border border-zinc-200 dark:border-[#27272a] shadow-sm space-y-4 card-hover-lift animate-slide-up relative z-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-[#27272a] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">Live Participant Scoreboard & Round Progression</h3>
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
                  <div className="p-8 text-center text-[#595959] dark:text-[#a1a1aa] text-xs font-medium">
                    No participants matching query or criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-[#27272a]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EFEEEA] dark:bg-[#09090b] text-[#18181B] dark:text-[#f4f4f5] font-mono border-b border-zinc-200 dark:border-[#27272a]">
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

          {/* TAB 4: Question & Content Bank Management Hub */}
          {activeTab === 'questions' && (
            <div className="animate-slide-up">
              <ContentManagementHub userRole="ADMIN" />
            </div>
          )}

          {/* TAB 5: Anti-Cheat Audit Logs */}
          {activeTab === 'audit' && (
            <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-4 card-hover-lift animate-slide-up">
              <h3 className="text-base font-bold text-[#A30B1A] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#C23D31]" />
                <span>Recorded Anti-Cheat Signals Audit Log</span>
              </h3>

              {antiCheatFlags.length === 0 ? (
                <p className="text-xs text-[#595959] py-6 text-center font-medium">No audit logs available.</p>
              ) : (
                <div className="space-y-2 text-xs font-mono">
                  {antiCheatFlags.map(flag => (
                    <div key={flag.id} className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959] flex items-center justify-between font-semibold hover:border-[#D60303] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[#C23D31] font-bold">[{flag.type}]</span>
                        <span className="text-[#595959]">{flag.message}</span>
                      </div>
                      <span className="text-[#595959]/70 text-[11px]">{flag.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ADMIN EDIT USER CREDENTIALS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-hero-entrance">
          <div className="bg-[#EFEEEA] border border-[#595959] rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-xs">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1.5 text-[#595959] hover:text-[#D60303] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-wider block">
                ADMIN AUTHENTICATION CONTROL
              </span>
              <h3 className="text-lg font-bold text-[#595959]">
                Modify Record for {editingUser.id}
              </h3>
              <p className="text-[11px] text-[#595959]/80">
                Redefine, rewrite, or reset credentials, PIN, and account status.
              </p>
            </div>

            {editMsg && (
              <div className="p-3 bg-red-100 text-red-700 rounded-xl font-bold">{editMsg}</div>
            )}

            <form onSubmit={handleSaveUserCredentials} className="space-y-3">
              <div>
                <label className="block font-bold text-[#595959] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#595959] mb-1">Email Address / Username</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#595959] mb-1">Authorization PIN (4-Digits)</label>
                  <input
                    type="text"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    placeholder="1001"
                    className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-mono font-bold text-[#A30B1A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#595959] mb-1">Assigned Lab / Station</label>
                  <input
                    type="text"
                    value={editLab}
                    onChange={(e) => setEditLab(e.target.value)}
                    placeholder="Lab Terminal 1"
                    className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#595959] mb-1">
                  Reset Password (Leave blank to keep existing password)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password to rewrite"
                  className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#595959] mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#EFEEEA] border border-[#595959] rounded-xl outline-none font-mono"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="LOCKED">LOCKED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#595959]/20 text-[#595959] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#D60303] text-[#EFEEEA] font-bold shadow-md hover:bg-[#A30B1A] transition cursor-pointer"
                >
                  Rewrite Authentication Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
