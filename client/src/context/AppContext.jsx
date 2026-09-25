import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { BACKEND_URL, API_BASE } from '../config';
import { AppContext } from './AppContextObject';

export { AppContext };

export const AppProvider = ({ children }) => {
  // Navigation Screens: 'splash' | 'landing' | 'login' | 'dashboard' | 'round1' | 'round2' | 'round3' | 'admin' | 'coordinator'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('technova_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentScreen, setCurrentScreenState] = useState(() => {
    try {
      const saved = localStorage.getItem('technova_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'ADMIN') return 'admin';
        if (u.role === 'COORDINATOR') return 'coordinator';
        if (u.role === 'PARTICIPANT') return 'dashboard';
      }
    } catch {}
    return 'splash';
  });

  // setCurrentScreen is defined later, after isOfflineReconnectionEligible is declared
  const [eventState, setEventState] = useState({
    status: 'REGISTRATION',
    round1MaxQuestions: 20,
    round1DurationMinutes: 10,
    round2DurationMinutes: 15,
    round3DurationMinutes: 15,
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
  // Per-participant grading status per round (fetched from /api/quiz/grading-status)
  // Shape: { round1: { gradingStatus, hasAttempt }, round2: { gradingStatus, hasAttempt }, round3: ... }
  const [gradingStatusMap, setGradingStatusMap] = useState(null);
  const [roundGradingConfig, setRoundGradingConfig] = useState({
    1: { gradingPercentage: 100 },
    2: { gradingPercentage: 80 },
    3: { gradingPercentage: 50 }
  });

  // Central Real-Time Round Timer
  const [roundTimeLeft, setRoundTimeLeft] = useState(0);

  useEffect(() => {
    const computeRemaining = () => {
      const status = eventState?.status || '';
      if (!status.includes('_RUNNING')) {
        setRoundTimeLeft(0);
        return;
      }

      if (eventState?.roundEndsAt) {
        const diff = Math.max(0, Math.floor((new Date(eventState.roundEndsAt).getTime() - Date.now()) / 1000));
        setRoundTimeLeft(diff);
      } else if (eventState?.roundStartedAt) {
        let dur = 10;
        if (status === 'ROUND_2_RUNNING') dur = eventState?.round2DurationMinutes || 15;
        else if (status === 'ROUND_3_RUNNING') dur = eventState?.round3DurationMinutes || 15;
        else dur = eventState?.round1DurationMinutes || 10;

        const end = new Date(eventState.roundStartedAt).getTime() + dur * 60 * 1000;
        const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
        setRoundTimeLeft(diff);
      } else {
        let defaultSec = 10 * 60;
        if (status === 'ROUND_2_RUNNING') defaultSec = (eventState?.round2DurationMinutes || 15) * 60;
        else if (status === 'ROUND_3_RUNNING') defaultSec = (eventState?.round3DurationMinutes || 15) * 60;
        else defaultSec = (eventState?.round1DurationMinutes || 10) * 60;
        setRoundTimeLeft(defaultSec);
      }
    };

    computeRemaining();
    const interval = setInterval(computeRemaining, 1000);
    return () => clearInterval(interval);
  }, [
    eventState?.status,
    eventState?.roundEndsAt,
    eventState?.roundStartedAt,
    eventState?.round1DurationMinutes,
    eventState?.round2DurationMinutes,
    eventState?.round3DurationMinutes
  ]);

  const formatRoundTime = useCallback((secs) => {
    if (secs === null || secs === undefined || isNaN(secs) || secs < 0) return '00:00';
    const totalSec = Math.floor(secs);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('technova_theme') ?? 'light';
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

  // Anti-Cheat Logger Signals & Disqualification State
  const [antiCheatFlags, setAntiCheatFlags] = useState([]);

  // Disqualification state (Frozen participant due to 3 anti-cheat violations)
  const [isDisqualified, setIsDisqualified] = useState(() => {
    try {
      const savedUser = localStorage.getItem('technova_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u?.id) {
        return localStorage.getItem(`technova_disqualified_${u.id}`) === 'true' || u.accountStatus === 'DISQUALIFIED';
      }
    } catch {}
    return false;
  });

  const [disqualificationReason, setDisqualificationReason] = useState(() => {
    try {
      const savedUser = localStorage.getItem('technova_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u?.id) {
        return localStorage.getItem(`technova_disqualified_reason_${u.id}`) || '';
      }
    } catch {}
    return '';
  });

  // Safe zone where tab switching and exiting full screen are allowed (e.g. offline network reconnection before submission)
  const [isOfflineReconnectionEligible, setIsOfflineReconnectionEligible] = useState(false);

  const [warningCount, setWarningCount] = useState(() => {
    try {
      const savedUser = localStorage.getItem('technova_user');
      const u = savedUser ? JSON.parse(savedUser) : null;
      if (u?.id) {
        const c = localStorage.getItem(`technova_warnings_${u.id}`);
        return c ? parseInt(c, 10) : 0;
      }
    } catch {}
    return 0;
  });

  const lastViolationTimeRef = useRef(0);
  const isOfflineReconnectionRef = useRef(isOfflineReconnectionEligible);
  const isDisqualifiedRef = useRef(isDisqualified);

  useEffect(() => {
    isOfflineReconnectionRef.current = isOfflineReconnectionEligible;
  }, [isOfflineReconnectionEligible]);

  useEffect(() => {
    isDisqualifiedRef.current = isDisqualified;
  }, [isDisqualified]);

  // setCurrentScreen wrapper – resets safe zone when navigating away from round screens
  const setCurrentScreen = useCallback((screenOrUpdater) => {
    setCurrentScreenState(prev => {
      const next = typeof screenOrUpdater === 'function' ? screenOrUpdater(prev) : screenOrUpdater;
      if (!['round1', 'round2', 'round3'].includes(next)) {
        setIsOfflineReconnectionEligible(false);
      }
      return next;
    });
  }, [setIsOfflineReconnectionEligible]);

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
      console.error('Fetch leaderboard error:', err);
      setLeaderboard([]);
    }
  };

  // Fetch grading status for the current participant
  const fetchGradingStatus = useCallback(async (participantId) => {
    if (!participantId) return;
    try {
      const res = await fetch(`${API_BASE}/quiz/grading-status?participantId=${participantId}`);
      const data = await res.json();
      if (data.success) {
        setGradingStatusMap(data.gradingResults);
      }
    } catch (err) {
      console.warn('Fetch grading status error:', err);
    }
  }, []);

  // Fetch round grading configuration
  const fetchRoundGradingConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/round-grading-config`);
      const data = await res.json();
      if (data.success && data.roundGradingConfig) {
        setRoundGradingConfig(data.roundGradingConfig);
      }
    } catch (err) {
      console.warn('Fetch round grading config error:', err);
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
      console.error('Fetch announcements error:', err);
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
      console.error('Fetch questions error:', err);
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
      console.error('Fetch debug problems error:', err);
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
      console.error('Fetch tech clues error:', err);
      setTechClues([]);
    }
  };

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
        console.error('Heartbeat check failed:', err);
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
  const [pendingVerificationParticipantId, setPendingVerificationParticipantId] = useState(null);
  const [isCoordinatorModalOpen, setIsCoordinatorModalOpen] = useState(false);

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

  // Fetch grading status when participant logs in or changes
  useEffect(() => {
    if (currentUser?.role === 'PARTICIPANT' && currentUser?.id) {
      const pid = currentUser.id;
      Promise.resolve().then(() => {
        fetchGradingStatus(pid);
      });
    }
  }, [currentUser?.role, currentUser?.id, fetchGradingStatus]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchEventState();
      fetchLeaderboard();
      fetchAnnouncements();
      fetchQuestions();
      fetchDebugProblems();
      fetchTechClues();
      fetchRoundGradingConfig();
    });

    // Real-Time WebSocket Connection
    let socket = null;
    try {
      socket = io(BACKEND_URL, { transports: ['websocket', 'polling'] });

      socket.on('verification:updated', (data) => {
        if (data && data.problemId) {
          setDebugSubmissions(prev => ({
            ...prev,
            [data.problemId]: {
              ...prev[data.problemId],
              status: 'VERIFIED',
              verifiedBy: data.verifiedBy,
              marks: data.marks
            }
          }));
          fetchLeaderboard();
        }
      });

      socket.on('announcement:added', (ann) => {
        if (ann) {
          setAnnouncements(prev => [ann, ...prev.filter(a => a.id !== ann.id)]);
          setNotifications(prev => [
            {
              id: Date.now(),
              title: `📢 ${ann.title}`,
              message: ann.message,
              time: 'Just now',
              read: false
            },
            ...prev
          ]);
        }
      });

      socket.on('participant:disqualified', (data) => {
        if (data && data.participantId === currentUser?.id) {
          setIsDisqualified(true);
          isDisqualifiedRef.current = true;
          setDisqualificationReason(data.reason || 'Disqualified due to malpractice');
          if (currentUser?.id) {
            localStorage.setItem(`technova_disqualified_${currentUser.id}`, 'true');
            if (data.reason) {
              localStorage.setItem(`technova_disqualified_reason_${currentUser.id}`, data.reason);
            }
          }
        }
      });

      socket.on('participant:reinstated', (data) => {
        if (data && data.participantId === currentUser?.id) {
          setIsDisqualified(false);
          isDisqualifiedRef.current = false;
          setDisqualificationReason(null);
          setWarningCount(0);
          if (currentUser?.id) {
            localStorage.removeItem(`technova_disqualified_${currentUser.id}`);
            localStorage.removeItem(`technova_disqualified_reason_${currentUser.id}`);
            localStorage.setItem(`technova_warnings_${currentUser.id}`, '0');
          }
        }
      });

      socket.on('leaderboard:updated', (data) => {
        if (data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      });

      socket.on('submission:updated', () => {
        fetchLeaderboard();
      });

      socket.on('hunt:updated', () => {
        fetchLeaderboard();
      });

      const handleStateUpdate = (state) => {
        if (state) {
          setEventState(prev => ({ ...prev, ...state }));
          fetchLeaderboard();
        }
      };

      socket.on('eventState:updated', handleStateUpdate);
      socket.on('event:state_changed', handleStateUpdate);
      socket.on('eventState:changed', handleStateUpdate);
    } catch (e) {
      console.error('Socket.io connection error:', e);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [currentUser?.id]);

  // Record Anti-Cheat Violation with 2.5s debounce, safe zone exemption, and 3-strike freeze/disqualification
  const recordAntiCheatViolation = useCallback((type, message) => {
    if (isDisqualifiedRef.current) return;
    if (currentUser?.role !== 'PARTICIPANT') return;
    if (!['round1', 'round2', 'round3'].includes(currentScreen)) return;

    // SAFE ZONE: User is in offline reconnection / submission section
    if (isOfflineReconnectionRef.current) {
      console.log('Anti-cheat violation exempted: candidate in network reconnection safe zone');
      return;
    }

    // Debounce to prevent multiple events (blur, visibilitychange, fullscreenchange) firing simultaneously
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2500) {
      return;
    }
    lastViolationTimeRef.current = now;

    setWarningCount(prev => {
      const next = prev + 1;
      const pid = currentUser?.id;
      if (pid) {
        localStorage.setItem(`technova_warnings_${pid}`, String(next));
      }

      const flag = {
        id: Date.now(),
        participantId: pid,
        type: type || 'MALPRACTICE_WARNING',
        timestamp: new Date().toLocaleTimeString(),
        message: message || `Anti-cheat violation #${next} in ${currentScreen}`
      };
      setAntiCheatFlags(f => [flag, ...f]);

      fetch(`${API_BASE}/anticheat/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flag)
      }).catch(() => {});

      if (next >= 3) {
        const reason = `Exceeded maximum allowable anti-cheat violations (${next}/3) due to tab switching or full screen exit in ${currentScreen.toUpperCase()}. Automatically frozen and disqualified for malpractice.`;
        setIsDisqualified(true);
        isDisqualifiedRef.current = true;
        setDisqualificationReason(reason);
        if (pid) {
          localStorage.setItem(`technova_disqualified_${pid}`, 'true');
          localStorage.setItem(`technova_disqualified_reason_${pid}`, reason);
        }

        fetch(`${API_BASE}/anticheat/disqualify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: pid,
            round: currentScreen,
            reason
          })
        }).catch(() => {});
      }

      return next;
    });
  }, [currentUser?.role, currentUser?.id, currentScreen]);

  // Tab switch, Window blur & Full screen monitoring for active rounds (round1 and round3 only; Round 2 is exempt from fullscreen/blur to permit local coding/compilers)
  useEffect(() => {
    if (currentUser?.role !== 'PARTICIPANT' || !['round1', 'round3'].includes(currentScreen)) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordAntiCheatViolation('TAB_SWITCH', 'Browser tab switched or window minimized');
      }
    };

    const handleWindowBlur = () => {
      recordAntiCheatViolation('WINDOW_BLUR', 'Window lost focus or application switched');
    };

    const handleFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFull) {
        recordAntiCheatViolation('FULLSCREEN_EXIT', 'Full screen mode exited during active round');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [currentUser?.role, currentScreen, recordAntiCheatViolation]);

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
        localStorage.setItem('technova_user', JSON.stringify(data.user));
        setCurrentUser(data.user);

        const pid = data.user.id;
        const isDisq = localStorage.getItem(`technova_disqualified_${pid}`) === 'true' || data.user.accountStatus === 'DISQUALIFIED';
        const reason = localStorage.getItem(`technova_disqualified_reason_${pid}`) || '';
        const wCount = parseInt(localStorage.getItem(`technova_warnings_${pid}`) || '0', 10);
        setIsDisqualified(isDisq);
        isDisqualifiedRef.current = isDisq;
        setDisqualificationReason(reason);
        setWarningCount(wCount);

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
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server unavailable. Please try again.' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('technova_token');
    localStorage.removeItem('technova_user');
    setIsDisqualified(false);
    isDisqualifiedRef.current = false;
    setDisqualificationReason('');
    setWarningCount(0);
    setIsOfflineReconnectionEligible(false);
    setCurrentUser(null);
    setCurrentScreen('landing');
  };

  // Broadcast New Announcement
  const createAnnouncement = async (announcementData) => {
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAnnouncements();
        return { success: true, announcement: data.announcement };
      }
      return { success: false, message: data.message || 'Failed to post announcement' };
    } catch (err) {
      console.error('Create announcement error:', err);
      return { success: false, message: 'Server error creating announcement.' };
    }
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
      } catch (err) {
        console.error('Submit debug code error:', err);
      }
    }
  };

  // Verify Debug Submission (Coordinator)
  const verifyDebugSubmission = async (problemId, coordinatorId, pin, marksAwarded = 10, participantId, rubricBreakdown = {}) => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          coordinatorId,
          pin,
          marks: marksAwarded,
          participantId: participantId || currentUser?.id,
          rubricBreakdown
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
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Verify debug submission error:', err);
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
          participantId: currentUser?.id,
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
      console.error('Submit hunt answer error:', err);
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
    } catch (err) {
      console.error('Update event state error:', err);
    }
  };

  const recalculateLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/recalculate`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
        return data;
      }
    } catch (err) {
      console.error('Recalculate error:', err);
      fetchLeaderboard();
    }
  }, []);

  const disqualifyParticipantManual = async (participantId, reason, round = 'ALL') => {
    try {
      const res = await fetch(`${API_BASE}/anticheat/disqualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, reason, round })
      });
      const data = await res.json();
      fetchLeaderboard();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const reinstateParticipant = async (participantId) => {
    try {
      const res = await fetch(`${API_BASE}/anticheat/reinstate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, coordinatorId: currentUser?.id })
      });
      const data = await res.json();
      fetchLeaderboard();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
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

  // Quiz Question Flagging State
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────────
  // PARTICIPATION vs GRADING
  // ───────────────────────────────────────────────────────────────────────────────
  // IMPORTANT: Every registered participant can PARTICIPATE in EVERY round.
  // The distinction is between PARTICIPATION (access) and GRADING (official score).
  // Non-graded participants can attend, answer, and submit — but their
  // results are excluded from the official leaderboard and qualification.
  //
  // isParticipantQualified() now ALWAYS returns true for participation purposes.
  // To check grading status, use isParticipantGraded().
  // ───────────────────────────────────────────────────────────────────────────────
  const isParticipantQualified = (_roundNumber) => {
    // All participants can access all rounds — this function is kept for backward compatibility
    // but now always returns true. Grading eligibility is separate (see isParticipantGraded).
    return true;
  };

  // Returns grading status for current participant for a given round
  // 'graded' = attempt counts officially | 'non_graded' = stored but excluded from leaderboard
  const isParticipantGraded = (roundNumber) => {
    if (!gradingStatusMap) return null; // not yet fetched
    const key = `round${roundNumber}`;
    return gradingStatusMap[key]?.gradingStatus || null;
  };

  // Returns whether the current participant's leaderboard entry shows graded status
  // (server-authoritative from the leaderboard data)
  const isGradedInLeaderboard = (roundNumber) => {
    if (currentUser?.role !== 'PARTICIPANT') return true;
    const entry = leaderboard.find(l => l.id === currentUser?.id);
    if (!entry) return true; // fallback while loading
    if (roundNumber === 2) return entry.isGradedR2 !== false && entry.qualifiedR2 !== false;
    if (roundNumber === 3) return entry.isGradedR3 === true || entry.qualifiedR3 === true;
    return true;
  };

  // Round Access Validation Helper
  // Returns true if the round is open AND the participant is allowed to enter.
  // Check if a round has been completed/submitted by the logged in participant
  const isRoundCompletedByUser = (roundNumber) => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'COORDINATOR') return false;
    const pid = currentUser?.id;
    if (!pid) return false;

    // 1. Direct local storage submission marker
    if (localStorage.getItem(`technova_r${roundNumber}_completed_${pid}`) === 'true') {
      return true;
    }

    // 2. Leaderboard entry check
    const userEntry = leaderboard.find(
      (entry) => entry.participantId === pid || entry.id === pid || entry.email === currentUser?.email
    );
    if (!userEntry) return false;

    if (roundNumber === 1) {
      return !!userEntry.r1Completed;
    }
    if (roundNumber === 2) {
      return !!userEntry.r2Completed;
    }
    if (roundNumber === 3) {
      return !!userEntry.r3Completed;
    }
    return false;
  };

  const markRoundCompletedByUser = (roundNumber) => {
    const pid = currentUser?.id;
    if (pid) {
      localStorage.setItem(`technova_r${roundNumber}_completed_${pid}`, 'true');
    }
  };

  // Participant round access logic:
  // A round is ONLY accessible if:
  // 1. It is currently RUNNING (e.g. ROUND_1_RUNNING).
  // 2. Once coordinator ends the round (e.g. ROUND_1_ENDED), it is LOCKED for everyone.
  // 3. If a participant has already completed that round, it CANNOT be accessed again!
  const isRoundUnlocked = (roundNumber) => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'COORDINATOR') return true;
    const status = eventState?.status || 'REGISTRATION';

    // If user already completed this round, it is LOCKED for them
    if (isRoundCompletedByUser(roundNumber)) {
      return false;
    }

    if (roundNumber === 1) {
      return status === 'ROUND_1_RUNNING';
    }
    if (roundNumber === 2) {
      return status === 'ROUND_2_RUNNING';
    }
    if (roundNumber === 3) {
      return status === 'ROUND_3_RUNNING';
    }
    return false;
  };

  const isRoundActive = (roundNumber) => {
    const status = eventState?.status;
    if (roundNumber === 1) return status === 'ROUND_1_RUNNING';
    if (roundNumber === 2) return status === 'ROUND_2_RUNNING';
    if (roundNumber === 3) return status === 'ROUND_3_RUNNING';
    return false;
  };

  const isRoundCompleted = (roundNumber) => {
    const status = eventState?.status || 'REGISTRATION';
    if (roundNumber === 1) {
      return ['ROUND_1_ENDED', 'ROUND_2_READY', 'ROUND_2_RUNNING', 'ROUND_2_ENDED', 'ROUND_3_READY', 'ROUND_3_RUNNING', 'COMPLETED'].includes(status);
    }
    if (roundNumber === 2) {
      return ['ROUND_2_ENDED', 'ROUND_3_READY', 'ROUND_3_RUNNING', 'COMPLETED'].includes(status);
    }
    if (roundNumber === 3) {
      return status === 'COMPLETED' || status === 'ROUND_3_ENDED';
    }
    return false;
  };

  // Dynamic Announcement Timestamp Formatter
  const formatAnnouncementTime = (ann) => {
    if (!ann) return '';
    if (ann.createdAt) {
      const created = new Date(ann.createdAt).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - created) / 1000));
      if (diffSecs < 45) return 'Just now';
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
             new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return ann.time || 'Just now';
  };

  const updateParticipantGradingOverride = async (participantId, round, status) => {
    try {
      const res = await fetch(`${API_BASE}/coordinator/participant-grading-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, round, status })
      });
      const data = await res.json();
      if (data.success) {
        await fetchLeaderboard();
      }
      return data;
    } catch (err) {
      console.error('Update grading override error:', err);
      return { success: false, message: err.message };
    }
  };

  const navigateToRound = async (roundScreen) => {
    let roundNum = 1;
    if (roundScreen === 'round2') roundNum = 2;
    if (roundScreen === 'round3') roundNum = 3;

    // Check if user has already completed this round
    if (isRoundCompletedByUser(roundNum)) {
      alert(`🔒 You have already completed Round ${roundNum}. Re-attempts are not permitted.`);
      return;
    }

    if (!isRoundUnlocked(roundNum)) {
      const status = eventState?.status;
      if (['ROUND_1_ENDED', 'ROUND_2_ENDED', 'ROUND_3_ENDED', 'COMPLETED'].includes(status)) {
        alert(`🔒 Round ${roundNum} has already concluded and is now closed.`);
      } else {
        alert(`⚠️ Round ${roundNum} is currently locked!\nIt will be activated once the Coordinator initiates Round ${roundNum}.`);
      }
      return;
    }

    // Do NOT request or enforce fullscreen for Round 2 only
    if (roundScreen !== 'round2') {
      await requestFullScreen();
    }
    setCurrentScreen(roundScreen);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      navigateToRound,
      isRoundUnlocked,
      isRoundActive,
      isRoundCompleted,
      isParticipantQualified,
      isParticipantGraded,
      isGradedInLeaderboard,
      requestFullScreen,
      currentUser,
      loginUser,
      logoutUser,
      eventState,
      updateEventState,
      leaderboard,
      announcements,
      createAnnouncement,
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
      isDisqualified,
      setIsDisqualified,
      disqualificationReason,
      setDisqualificationReason,
      isOfflineReconnectionEligible,
      setIsOfflineReconnectionEligible,
      recordAntiCheatViolation,
      isCoordinatorModalOpen,
      setIsCoordinatorModalOpen,
      pendingVerificationProblemId,
      setPendingVerificationProblemId,
      pendingVerificationParticipantId,
      setPendingVerificationParticipantId,
      fetchEventState,
      fetchLeaderboard,
      fetchAnnouncements,
      fetchQuestions,
      fetchDebugProblems,
      fetchTechClues,
      fetchGradingStatus,
      fetchRoundGradingConfig,
      gradingStatusMap,
      roundGradingConfig,
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
      toggleFlagQuestion,
      roundTimeLeft,
      formatRoundTime,
      recalculateLeaderboard,
      disqualifyParticipantManual,
      reinstateParticipant,
      isRoundCompletedByUser,
      markRoundCompletedByUser,
      formatAnnouncementTime,
      updateParticipantGradingOverride
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


