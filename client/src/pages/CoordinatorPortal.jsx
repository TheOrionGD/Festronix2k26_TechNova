import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CoordinatorModal from '../components/CoordinatorModal';
import ContentManagementHub from '../components/ContentManagementHub';
import { ShieldCheck, CheckCircle2, Award, Clock, Database, CheckSquare } from 'lucide-react';

export default function CoordinatorPortal() {
  const { currentUser, setIsCoordinatorModalOpen, setPendingVerificationProblemId } = useApp();
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'content'
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchCoordinatorQueue();
  }, []);

  const handleVerifyClick = (problemId) => {
    setPendingVerificationProblemId(problemId);
    setIsCoordinatorModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#EFEEEA] text-[#595959] flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D60303]/10 text-[#D60303] flex items-center justify-center font-bold">
                <ShieldCheck className="w-7 h-7 text-[#D60303]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#A30B1A] uppercase tracking-widest">COORDINATOR CONTROL CENTER</span>
                <h2 className="text-xl font-bold text-[#A30B1A]">TECHNOVA CONTENT & VERIFICATION WORKSPACE</h2>
                <p className="text-xs text-[#595959] font-medium">Manage competition questions/problems and verify physical terminal execution.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-[#A30B1A] text-[#EFEEEA] font-bold">
                COORD: {currentUser?.id || 'COORDINATOR'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#595959]/20 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'verification' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Physical Verification Queue ({submissionsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'content' ? 'bg-[#D60303] text-[#EFEEEA] shadow-xs' : 'bg-[#EFEEEA] border border-[#595959] text-[#595959] hover:bg-[#595959]/10'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Question & Content Management Hub</span>
            </button>
          </div>

          {/* Tab 1: Physical Verification Queue */}
          {activeTab === 'verification' && (
            <div className="bg-[#EFEEEA] p-6 rounded-2xl border border-[#595959] shadow-sm space-y-4">
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
                      <div key={idx} className="p-5 bg-[#EFEEEA] rounded-2xl border border-[#595959] space-y-4 shadow-xs">
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
                            className="px-6 py-2.5 rounded-xl bg-[#D60303] hover:bg-[#A30B1A] text-[#EFEEEA] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
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

          {/* Tab 2: Content Management Hub */}
          {activeTab === 'content' && (
            <ContentManagementHub userRole="COORDINATOR" />
          )}
        </main>
      </div>

      <CoordinatorModal />
    </div>
  );
}
