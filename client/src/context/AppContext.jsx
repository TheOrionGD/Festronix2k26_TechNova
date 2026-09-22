import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation Screens: 'splash' | 'landing' | 'login' | 'dashboard' | 'round1' | 'round2' | 'round3' | 'admin' | 'coordinator'
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [currentUser, setCurrentUser] = useState(null);
  const [eventState, setEventState] = useState({
    status: 'REGISTRATION',
    round1MaxQuestions: 20,
    round1DurationMinutes: 20,
    round1QualifyCount: 30,
    round2QualifyCount: 10,
    round3StationCount: 5,
    registrationCount: 0,
    activeRound: 1
  });
  
  // Real Data Collections from Server
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [debugProblems, setDebugProblems] = useState([]);
  const [techClues, setTechClues] = useState([]);
  const [debugSubmissions, setDebugSubmissions] = useState({});
  const [huntProgress, setHuntProgress] = useState({
    currentStation: 1,
    solvedStations: [],
    hintsUsed: {},
    answers: {},
    score: 0
  });

  // Anti-Cheat Logger Signals
  const [antiCheatFlags, setAntiCheatFlags] = useState([]);
  const [warningCount, setWarningCount] = useState(0);

  // Coordinator Verification Modal State
  const [pendingVerificationProblemId, setPendingVerificationProblemId] = useState(null);
  const [isCoordinatorModalOpen, setIsCoordinatorModalOpen] = useState(false);

  // Fetch initial event state & live collections
  const fetchEventState = async () => {
    try {
      const res = await fetch(`${API_BASE}/event/status`);
      const data = await res.json();
      if (data.success && data.eventState) {
        setEventState(data.eventState);
      }
    } catch (err) {
      console.warn('Backend API connection offline, using default client state:', err.message);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaderboard`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      setLeaderboard([]);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      setAnnouncements([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/questions`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (err) {
      setQuestions([]);
    }
  };

  const fetchDebugProblems = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/debug-problems`);
      const data = await res.json();
      if (data.success) {
        setDebugProblems(data.problems || []);
      }
    } catch (err) {
      setDebugProblems([]);
    }
  };

  const fetchTechClues = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clues`);
      const data = await res.json();
      if (data.success) {
        setTechClues(data.clues || []);
      }
    } catch (err) {
      setTechClues([]);
    }
  };

  useEffect(() => {
    fetchEventState();
    fetchLeaderboard();
    fetchAnnouncements();
    fetchQuestions();
    fetchDebugProblems();
    fetchTechClues();
  }, []);

  // Tab switch & Blur monitoring logger
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentUser?.role === 'PARTICIPANT' && (currentScreen === 'round1' || currentScreen === 'round2')) {
        const flag = {
          id: Date.now(),
          participantId: currentUser?.id || 'UNKNOWN',
          type: 'TAB_BLUR',
          timestamp: new Date().toLocaleTimeString(),
          message: 'Browser tab switched / window unfocused'
        };
        setAntiCheatFlags(prev => [flag, ...prev]);
        setWarningCount(prev => prev + 1);

        // Send signal to backend
        fetch(`${API_BASE}/anticheat/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(flag)
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, currentScreen]);

  // Authentication via Backend API
  const loginUser = async (credentials) => {
    // credentials: { id, password, role, pin, email }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();

      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (data.user.role === 'ADMIN') {
          setCurrentScreen('admin');
        } else if (data.user.role === 'COORDINATOR') {
          setCurrentScreen('coordinator');
        } else {
          setCurrentScreen('dashboard');
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch (err) {
      return { success: false, message: 'Server unavailable. Please try again.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCurrentScreen('landing');
  };

  // Submit Debug Code Solution
  const submitDebugCode = async (problemId, code, output) => {
    setDebugSubmissions(prev => ({
      ...prev,
      [problemId]: {
        code,
        output,
        status: 'SUBMITTED',
        verifiedBy: null,
        marks: 0
      }
    }));

    if (currentUser?.id) {
      try {
        await fetch(`${API_BASE}/debug/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: currentUser.id,
            problemId,
            code,
            output
          })
        });
      } catch (err) {}
    }
  };

  // Verify Debug Submission (Coordinator)
  const verifyDebugSubmission = async (problemId, coordinatorId, pin, marksAwarded = 10, participantId) => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          coordinatorId,
          pin,
          marks: marksAwarded,
          participantId: participantId || currentUser?.id
        })
      });
      const data = await res.json();

      if (data.success) {
        setDebugSubmissions(prev => ({
          ...prev,
          [problemId]: {
            ...prev[problemId],
            status: 'VERIFIED',
            verifiedBy: coordinatorId,
            marks: marksAwarded
          }
        }));
        fetchLeaderboard();
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Verification failed.' };
      }
    } catch (err) {
      return { success: false, message: 'Server communication error.' };
    }
  };

  // Submit Tech Hunt Answer (Round 3)
  const submitHuntAnswer = async (stationId, answer) => {
    try {
      const res = await fetch(`${API_BASE}/hunt/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: currentUser?.id || 'GUEST',
          stationId,
          answer
        })
      });
      const data = await res.json();

      if (data.success && data.correct) {
        setHuntProgress(prev => {
          const newSolved = Array.from(new Set([...prev.solvedStations, stationId]));
          const nextStation = stationId + 1 <= techClues.length ? stationId + 1 : stationId;
          return {
            ...prev,
            currentStation: nextStation,
            solvedStations: newSolved,
            answers: { ...prev.answers, [stationId]: answer },
            score: data.progress ? data.progress.score : prev.score + 10
          };
        });
        fetchLeaderboard();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const requestHuntHint = (stationId) => {
    setHuntProgress(prev => ({
      ...prev,
      hintsUsed: { ...prev.hintsUsed, [stationId]: true }
    }));
  };

  const updateEventState = async (newSettings) => {
    setEventState(prev => ({ ...prev, ...newSettings }));
    try {
      await fetch(`${API_BASE}/event/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {}
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      currentUser,
      loginUser,
      logoutUser,
      eventState,
      updateEventState,
      leaderboard,
      announcements,
      questions,
      debugProblems,
      techClues,
      debugSubmissions,
      submitDebugCode,
      verifyDebugSubmission,
      huntProgress,
      submitHuntAnswer,
      requestHuntHint,
      antiCheatFlags,
      warningCount,
      isCoordinatorModalOpen,
      setIsCoordinatorModalOpen,
      pendingVerificationProblemId,
      setPendingVerificationProblemId,
      fetchEventState,
      fetchLeaderboard,
      fetchAnnouncements,
      fetchQuestions,
      fetchDebugProblems,
      fetchTechClues
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
