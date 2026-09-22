import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Database
} from 'lucide-react';

export default function AdminPortal() {
  const { 
    eventState, 
    updateEventState, 
    antiCheatFlags, 
    leaderboard, 
    questions, 
    fetchQuestions 
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'qualifications' | 'questions' | 'audit'

  // Editable Event Settings
  const [r1Qualify, setR1Qualify] = useState(eventState.round1QualifyCount);
  const [r2Qualify, setR2Qualify] = useState(eventState.round2QualifyCount);
  const [regCount, setRegCount] = useState(eventState.registrationCount);
  const [currentStatus, setCurrentStatus] = useState(eventState.status);

  // Question bank state
  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState('Python');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);

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

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQText.trim() || !newOptA.trim() || !newOptB.trim()) {
      alert('Please fill out question text and at least 2 options.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: newQText,
          category: newQCategory,
          difficulty: 'Medium',
          options: [newOptA, newOptB, newOptC || 'Option C', newOptD || 'Option D'],
          correctOption: parseInt(correctIdx),
          explanation: 'Admin added question'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchQuestions();
        setNewQText('');
        setNewOptA('');
        setNewOptB('');
        setNewOptC('');
        setNewOptD('');
        alert('Question added to bank.');
      }
    } catch (err) {
      alert('Failed to add question to backend.');
    }
  };

  const handleDeleteQ = async (id) => {
    try {
      await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE'
      });
      fetchQuestions();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto space-y-6 animate-hero-entrance">
          {/* Top Banner */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-widest">SUPER ADMIN</span>
                <h2 className="text-xl font-bold text-[#A30B1A]">TECHNOVA SYMPOSIUM CONTROL CENTER</h2>
                <p className="text-xs text-[#595959] font-medium">Manage event states, dynamic qualification counts, question banks, and live monitoring.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-[#EFEEEA] font-bold shadow-2xs">
                STATE: {eventState.status}
              </span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#595959]/20 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${
                activeTab === 'overview' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Event Controls & Limits</span>
            </button>

            <button
              onClick={() => setActiveTab('qualifications')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${
                activeTab === 'qualifications' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Live Leaderboard ({leaderboard.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${
                activeTab === 'questions' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Question Bank ({questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer btn-interactive ${
                activeTab === 'audit' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
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
                      <p className="text-[#595959] font-semibold">Live Registered</p>
                      <p className="text-2xl font-black text-[#A30B1A] mt-1 font-mono">{leaderboard.length}</p>
                    </div>
                    <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959]">
                      <p className="text-[#595959] font-semibold">Round 1 Target</p>
                      <p className="text-2xl font-black text-[#D60303] mt-1 font-mono">{r1Qualify}</p>
                    </div>
                    <div className="p-3 bg-[#EFEEEA] rounded-xl border border-[#595959]">
                      <p className="text-[#595959] font-semibold">Round 2 Target</p>
                      <p className="text-2xl font-black text-[#C23D31] mt-1 font-mono">{r2Qualify}</p>
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

          {/* TAB 2: Live Leaderboard */}
          {activeTab === 'qualifications' && (
            <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-4 card-hover-lift animate-slide-up">
              <h3 className="text-base font-bold text-[#A30B1A]">Live Participant Scoreboard</h3>

              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-[#595959] text-xs font-medium">
                  No participants registered yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#595959] text-[#EFEEEA] font-mono">
                      <tr>
                        <th className="p-3">Rank</th>
                        <th className="p-3">ID</th>
                        <th className="p-3">Participant Name</th>
                        <th className="p-3 text-center">Round 1</th>
                        <th className="p-3 text-center">Round 2</th>
                        <th className="p-3 text-center">Round 3</th>
                        <th className="p-3 text-center">Total</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#595959]/20 text-[#595959]">
                      {leaderboard.map(row => (
                        <tr key={row.id} className="hover:bg-[#595959]/5 transition-colors font-medium">
                          <td className="p-3 font-bold text-[#D60303]">#{row.rank}</td>
                          <td className="p-3 font-mono text-[#595959]">{row.id}</td>
                          <td className="p-3 font-semibold">{row.name}</td>
                          <td className="p-3 text-center text-[#A30B1A] font-bold">{row.r1}</td>
                          <td className="p-3 text-center text-[#C23D31] font-bold">{row.r2}</td>
                          <td className="p-3 text-center text-[#D60303] font-bold">{row.r3}</td>
                          <td className="p-3 text-center font-bold text-[#A30B1A]">{row.total} pts</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-[#A30B1A] text-[#EFEEEA] font-bold text-[10px]">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Question & Content Bank Management Hub */}
          {activeTab === 'questions' && (
            <div className="animate-slide-up">
              <ContentManagementHub userRole="ADMIN" />
            </div>
          )}

          {/* TAB 4: Anti-Cheat Audit Logs */}
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
    </div>
  );
}
