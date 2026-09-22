import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Code2, User, Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, setCurrentScreen } = useApp();
  const [activeTab, setActiveTab] = useState('PARTICIPANT'); // 'PARTICIPANT' | 'COORDINATOR' | 'ADMIN'

  // Participant state
  const [participantId, setParticipantId] = useState('');
  const [participantPass, setParticipantPass] = useState('');

  // Coordinator state
  const [coordId, setCoordId] = useState('');
  const [coordPin, setCoordPin] = useState('');
  const [coordPass, setCoordPass] = useState('');

  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    let credentials = {};
    if (activeTab === 'PARTICIPANT') {
      credentials = { id: participantId, password: participantPass, role: 'PARTICIPANT' };
    } else if (activeTab === 'COORDINATOR') {
      credentials = { id: coordId, pin: coordPin, password: coordPass, role: 'COORDINATOR' };
    } else if (activeTab === 'ADMIN') {
      credentials = { email: adminEmail, password: adminPass, role: 'ADMIN' };
    }

    const result = await loginUser(credentials);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message || 'Invalid authentication details.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EFEEEA] flex flex-col justify-center items-center p-6 relative overflow-hidden select-none text-[#595959]">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(214,3,3,0.08),transparent_60%)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => setCurrentScreen('landing')}
            className="inline-flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#D60303] flex items-center justify-center shadow-md">
              <Code2 className="w-5 h-5 text-[#EFEEEA]" />
            </div>
            <h1 className="text-2xl font-black text-[#595959]">TECHNOVA</h1>
          </div>
          <p className="text-xs text-[#595959] font-medium">Sign in to access your competition portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#EFEEEA] p-1.5 rounded-2xl border border-[#595959] text-xs font-bold">
          <button
            onClick={() => { setActiveTab('PARTICIPANT'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'PARTICIPANT'
                ? 'bg-[#D60303] text-[#EFEEEA] shadow-md'
                : 'text-[#595959] hover:bg-[#595959]/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Participant</span>
          </button>

          <button
            onClick={() => { setActiveTab('COORDINATOR'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'COORDINATOR'
                ? 'bg-[#D60303] text-[#EFEEEA] shadow-md'
                : 'text-[#595959] hover:bg-[#595959]/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Coordinator</span>
          </button>

          <button
            onClick={() => { setActiveTab('ADMIN'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-[#D60303] text-[#EFEEEA] shadow-md'
                : 'text-[#595959] hover:bg-[#595959]/10'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[#EFEEEA] p-6 rounded-2xl space-y-5 border border-[#595959] shadow-sm">
          {errorMsg && (
            <div className="p-3 bg-[#C23D31]/10 border border-[#C23D31] rounded-xl text-[#A30B1A] text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#A30B1A]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'PARTICIPANT' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#595959] mb-1.5">
                    Participant ID
                  </label>
                  <input
                    type="text"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    placeholder="Enter assigned Participant ID (e.g. TN2026-001)"
                    className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#595959] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={participantPass}
                    onChange={(e) => setParticipantPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            {activeTab === 'COORDINATOR' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#595959] mb-1.5">
                    Coordinator ID
                  </label>
                  <input
                    type="text"
                    value={coordId}
                    onChange={(e) => setCoordId(e.target.value)}
                    placeholder="Enter Coordinator ID (e.g. COORD-01)"
                    className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#595959] mb-1.5">
                    Authorization PIN
                  </label>
                  <input
                    type="password"
                    value={coordPin}
                    onChange={(e) => setCoordPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            {activeTab === 'ADMIN' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#595959] mb-1.5">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@technova.edu"
                    className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#595959] mb-1.5">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[#EFEEEA] border border-[#595959] rounded-xl text-xs text-[#595959] font-mono focus:border-[#D60303] focus:outline-none"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] disabled:opacity-50 text-[#EFEEEA] font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating...' : `Access ${activeTab} Portal`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
