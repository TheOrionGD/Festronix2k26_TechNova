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

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('technova_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('technova_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Anti-Cheat Logger Signals
  const [antiCheatFlags, setAntiCheatFlags] = useState([]);
  const [warningCount, setWarningCount] = useState(0);

  // Network Offline & 5-Second Heartbeat Synchronization
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineToast(false);
      fetchEventState();
      fetchLeaderboard();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const heartbeat = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/event/status`, { cache: 'no-store' });
        if (res.ok && isOffline) {
          setIsOffline(false);
          setShowOfflineToast(false);
        }
      } catch (err) {
        if (!isOffline) {
          setIsOffline(true);
          setShowOfflineToast(true);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeat);
    };
  }, [isOffline]);

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

  // Authentication via Backend API (User ID + Password -> Token + Role)
  const loginUser = async (credentials) => {
    // credentials: { id, password }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();

      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('technova_token', data.token);
        }
        setCurrentUser(data.user);

        // Auto-redirect to dashboard matching trusted backend user role
        if (data.user.role === 'ADMIN') {
          setCurrentScreen('admin');
        } else if (data.user.role === 'COORDINATOR') {
          setCurrentScreen('coordinator');
        } else {
          setCurrentScreen('dashboard');
        }
        return { success: true, role: data.user.role };
      } else {
        return { success: false, message: data.message || 'Invalid credentials.' };
      }
    } catch (err) {
      return { success: false, message: 'Server unavailable. Please try again.' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('technova_token');
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

  const requestFullScreen = async () => {
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      }
      return true;
    } catch (err) {
      console.warn('Fullscreen request blocked or denied:', err?.message);
      return false;
    }
  };

  // Notification Drawer & Notifications List State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'TECHNOVA 2026 Welcome',
      message: 'Welcome to the Department of CSE Technical Symposium. Please review event rules.',
      time: 'Just now',
      read: false,
      type: 'INFO'
    },
    {
      id: 'notif-2',
      title: 'Anti-Cheat Telemetry Active',
      message: 'Tab switches and fullscreen exits are monitored in real time.',
      time: '5 mins ago',
      read: false,
      type: 'SECURITY'
    }
  ]);

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Quiz Question Flagging State
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Round Access Validation Helper
  const isRoundUnlocked = (roundNumber) => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'COORDINATOR') return true;
    const status = eventState?.status || 'REGISTRATION';
    const activeR = eventState?.activeRound || 1;

    if (roundNumber === 1) {
      return status === 'ROUND_1_RUNNING' || status === 'ROUND_1_READY' || status === 'ROUND_1_ENDED' || activeR >= 1;
    }
    if (roundNumber === 2) {
      return status === 'ROUND_2_RUNNING' || status === 'ROUND_2_READY' || status === 'ROUND_2_ENDED' || activeR >= 2;
    }
    if (roundNumber === 3) {
      return status === 'ROUND_3_RUNNING' || status === 'ROUND_3_READY' || status === 'COMPLETED' || activeR >= 3;
    }
    return false;
  };

  const navigateToRound = async (roundScreen) => {
    let roundNum = 1;
    if (roundScreen === 'round2') roundNum = 2;
    if (roundScreen === 'round3') roundNum = 3;

    if (!isRoundUnlocked(roundNum)) {
      alert(`⚠️ Round ${roundNum} is currently locked!\nAwaiting Coordinator activation.`);
      return;
    }

    await requestFullScreen();
    setCurrentScreen(roundScreen);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      navigateToRound,
      isRoundUnlocked,
      requestFullScreen,
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
      fetchTechClues,
      isOffline,
      showOfflineToast,
      setShowOfflineToast,
      theme,
      toggleTheme,
      notifications,
      isNotificationsOpen,
      setIsNotificationsOpen,
      toggleNotifications,
      markAllNotificationsRead,
      flaggedQuestions,
      toggleFlagQuestion
    }}>
      {children}

      {/* BOTTOM-LEFT SYSTEM OFFLINE NOTIFICATION TOAST */}
      {showOfflineToast && (
        <div className="fixed bottom-5 left-5 z-50 bg-zinc-900/95 backdrop-blur-md border border-red-600/80 rounded-2xl p-4 shadow-2xl max-w-sm flex items-center gap-3.5 text-white animate-slide-up select-none">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 p-1 shrink-0 border border-red-500/40 flex items-center justify-center overflow-hidden">
            <img src="/technova_icon.jpg" alt="Technova Favicon" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="text-left text-xs font-mono leading-tight space-y-1">
            <span className="font-bold text-red-500 block uppercase tracking-wider">SYSTEM OFFLINE</span>
            <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">
              Your system gone to offline, no need to worry. The system now goes for offline first synchronization phase.
            </p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
