import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  User, 
  EventState, 
  Question, 
  QuizAttempt,
  DebugProblem, 
  DebugAttempt,
  TechClue, 
  HuntAttempt,
  Submission, 
  Announcement, 
  AntiCheatLog,
  AuditLog
} from './models.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const MONGODB_URI = process.env.DATABASE_URL ?? process.env.MONGODB_URI;
let isDbConnected = false;

import fs from 'fs';
import path from 'path';

async function autoSeedBanks() {
  try {
    let seedModule = null;
    try {
      seedModule = await import('./seedData.js');
    } catch (e) {
      console.log('Notice: Initial seed data file (seedData.js) not present. Skipping auto-seed.');
      return;
    }

    const { seedQuestions = [], seedDebugProblems = [], seedTechClues = [], seedUsers = [] } = seedModule;

    if (isDbConnected) {
      const uCount = await User.countDocuments();
      if (uCount === 0 && seedUsers.length > 0) {
        for (const uDef of seedUsers) {
          const hashedPassword = await bcrypt.hash(uDef.password, 10);
          await User.create({ ...uDef, password: hashedPassword });
        }
        console.log(`Initial seed: Added ${seedUsers.length} official accounts into MongoDB.`);
      }

      const qCount = await Question.countDocuments();
      if (qCount === 0 && seedQuestions.length > 0) {
        await Question.insertMany(seedQuestions);
        console.log(`Initial seed: Added ${seedQuestions.length} CS MCQs into MongoDB.`);
      }

      const dCount = await DebugProblem.countDocuments();
      if (dCount === 0 && seedDebugProblems.length > 0) {
        await DebugProblem.insertMany(seedDebugProblems);
        console.log(`Initial seed: Added ${seedDebugProblems.length} Debug Problems into MongoDB.`);
      }

      const cCount = await TechClue.countDocuments();
      if (cCount === 0 && seedTechClues.length > 0) {
        await TechClue.insertMany(seedTechClues);
        console.log(`Initial seed: Added ${seedTechClues.length} Tech Hunt Clues into MongoDB.`);
      }
    } else {
      if ((!memoryStore.users || memoryStore.users.length === 0) && seedUsers.length > 0) {
        memoryStore.users = seedUsers.map(u => ({ ...u, password: bcrypt.hashSync(u.password, 10) }));
      }
      if ((!memoryStore.questions || memoryStore.questions.length === 0) && seedQuestions.length > 0) {
        memoryStore.questions = [...seedQuestions];
      }
      if ((!memoryStore.debugProblems || memoryStore.debugProblems.length === 0) && seedDebugProblems.length > 0) {
        memoryStore.debugProblems = [...seedDebugProblems];
      }
      if ((!memoryStore.techClues || memoryStore.techClues.length === 0) && seedTechClues.length > 0) {
        memoryStore.techClues = [...seedTechClues];
      }
    }
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
}

async function connectDatabase() {
  if (!MONGODB_URI) {
    console.log('MongoDB Connection Notice: DATABASE_URL not configured in process.env. Operating in local dynamic memory mode.');
    autoSeedBanks();
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    isDbConnected = true;
    console.log('MongoDB Cloud Atlas connected successfully.');
    await autoSeedBanks();
  } catch (err) {
    console.warn('MongoDB Connection Notice: Operating in local dynamic memory mode.', err.message);
    autoSeedBanks();
  }
}
connectDatabase();

// ─── ROUND CONFIGURATION ──────────────────────────────────────────────────────
// Defines what percentage of participants are OFFICIALLY GRADED in each round.
// 100 = everyone is graded (Round 1: all participants compete fully)
//  80 = top 80% from Round 1 official leaderboard are graded in Round 2
//  50 = top 50% from Round 2 official leaderboard are graded in Round 3
// NOTE: 100% of participants can PARTICIPATE in every round regardless.
//       Only the graded cohort affects official scores, rankings, and qualification.
const DEFAULT_ROUND_GRADING_CONFIG = {
  1: { gradingPercentage: 100 },
  2: { gradingPercentage: 70 },
  3: { gradingPercentage: 50 }
};

// ─── QUALIFICATION COUNT CALCULATOR ───────────────────────────────────────────
// Centralized, deterministic function for calculating how many participants
// receive official graded status in a given round.
//
// Strategy: Math.ceil — ensures at least 1 participant is always graded
// (prevents edge case of 0 when total < 100 and percentage is small).
function calculateQualifiedCount(totalParticipants, percentage) {
  if (totalParticipants <= 0) return 0;
  if (percentage >= 100) return totalParticipants;
  if (percentage <= 0) return 0;
  return Math.ceil((percentage / 100) * totalParticipants);
}

// In-Memory Fallback Data Store (Initialized empty)
const memoryStore = {
  eventState: {
    status: 'REGISTRATION', // REGISTRATION | ROUND_1_READY | ROUND_1_RUNNING | ROUND_1_ENDED | ROUND_2_READY | ROUND_2_RUNNING | ROUND_2_ENDED | ROUND_3_READY | ROUND_3_RUNNING | COMPLETED
    round1MaxQuestions: 20,
    round1DurationMinutes: 10,
    round2DurationMinutes: 15,
    round3DurationMinutes: 15,
    roundStartedAt: null,
    roundEndsAt: null,
    round1QualifyMode: 'PERCENTAGE',
    round1QualifyPercentage: 70, // 70% of R1 users go to R2 as graded
    round1QualifyCount: 30,
    round2QualifyMode: 'PERCENTAGE',
    round2QualifyPercentage: 50, // 50% of R2 users go to R3 as graded
    round2QualifyCount: 10,
    round3StationCount: 5,
    registrationCount: 0,
    activeRound: 1,
    colleges: [],
    roundGradingConfig: { ...DEFAULT_ROUND_GRADING_CONFIG }
  },
  users: [],
  questions: [],
  quizAttempts: {},
  debugProblems: [],
  debugAttempts: {},
  techClues: [],
  huntAttempts: {},
  submissions: [],
  announcements: [],
  auditLogs: [],
  antiCheatLogs: []
};

// Helper: Reset In-Memory Store Completely
function resetMemoryStore() {
  memoryStore.eventState = {
    status: 'REGISTRATION',
    round1MaxQuestions: 20,
    round1DurationMinutes: 10,
    round2DurationMinutes: 15,
    round3DurationMinutes: 15,
    roundStartedAt: null,
    roundEndsAt: null,
    round1QualifyMode: 'PERCENTAGE',
    round1QualifyPercentage: 70,
    round1QualifyCount: 30,
    round2QualifyMode: 'PERCENTAGE',
    round2QualifyPercentage: 50,
    round2QualifyCount: 10,
    round3StationCount: 5,
    registrationCount: 0,
    activeRound: 1,
    colleges: [],
    roundGradingConfig: { ...DEFAULT_ROUND_GRADING_CONFIG }
  };
  memoryStore.users = [];
  memoryStore.questions = [];
  memoryStore.quizAttempts = {};
  memoryStore.debugProblems = [];
  memoryStore.debugAttempts = {};
  memoryStore.techClues = [];
  memoryStore.huntAttempts = {};
  memoryStore.submissions = [];
  memoryStore.announcements = [];
  memoryStore.auditLogs = [];
  memoryStore.antiCheatLogs = [];
}

// REST API Endpoint: Purge All In-Memory & Database Data
app.post('/api/admin/purge-all-data', async (req, res) => {
  try {
    resetMemoryStore();
    if (isDbConnected) {
      await User.deleteMany({});
      await QuizAttempt.deleteMany({});
      await DebugAttempt.deleteMany({});
      await HuntAttempt.deleteMany({});
      await Submission.deleteMany({});
      await AntiCheatLog.deleteMany({});
      await AuditLog.deleteMany({});
      await Question.deleteMany({});
      await DebugProblem.deleteMany({});
      await TechClue.deleteMany({});
      await Announcement.deleteMany({});
      await EventState.updateMany({}, {
        registrationCount: 0,
        status: 'REGISTRATION',
        activeRound: 1,
        colleges: [],
        roundGradingConfig: DEFAULT_ROUND_GRADING_CONFIG
      });
    }
    res.json({ success: true, message: 'All in-memory state and database collections purged successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Purge only participant-related data while preserving coordinators, admins, questions, and clues
app.post('/api/coordinator/delete-all-participants', async (req, res) => {
  try {
    memoryStore.users = memoryStore.users.filter(u => u.role !== 'PARTICIPANT');
    memoryStore.quizAttempts = {};
    memoryStore.debugAttempts = {};
    memoryStore.huntAttempts = {};
    memoryStore.submissions = [];
    memoryStore.antiCheatLogs = [];

    if (isDbConnected) {
      await User.deleteMany({ role: 'PARTICIPANT' });
      await QuizAttempt.deleteMany({});
      await DebugAttempt.deleteMany({});
      await HuntAttempt.deleteMany({});
      await Submission.deleteMany({});
      await AntiCheatLog.deleteMany({});
      await EventState.updateMany({}, { registrationCount: 0 });
    }

    try {
      const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
      io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });
      io.emit('participants:cleared');
    } catch (e) {}

    res.json({ success: true, message: 'All participant accounts, submissions, and attempts deleted successfully from database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper: Secure Server-Side Fisher-Yates Array Shuffle
function secureShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const randomBuffer = crypto.randomBytes(4);
    const randomNumber = randomBuffer.readUInt32BE(0) / 0xffffffff;
    const j = Math.floor(randomNumber * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper: Record Audit Log
async function createAuditLog(userId = 'SYSTEM', role = 'SYSTEM', action = '', targetId = '', metadata = {}) {
  const logEntry = {
    userId,
    role,
    action,
    targetId: String(targetId),
    metadata,
    timestamp: new Date()
  };

  try {
    if (isDbConnected) {
      await AuditLog.create(logEntry);
    } else {
      memoryStore.auditLogs.unshift(logEntry);
    }
  } catch (err) {
    console.error('Failed to log audit event:', err.message);
  }
}

// Helper: Get Event State
async function getEventState() {
  if (isDbConnected) {
    let state = await EventState.findOne();
    if (!state) {
      state = await EventState.create(memoryStore.eventState);
    }
    return state;
  }
  return memoryStore.eventState;
}

// ----------------------------------------------------
// PUBLIC & AUTH ROUTES
// ----------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || 'efbab4439c61d68d0ddecc8933614372f2d53029baffc803122e797da467719a';

// GET List of Colleges for Dropdowns
app.get('/api/colleges', async (req, res) => {
  try {
    let colleges = [];
    if (isDbConnected) {
      const state = await getEventState();
      colleges = state?.colleges || [];
      const userColleges = await User.distinct('college', { college: { $ne: '' } });
      colleges = Array.from(new Set([...colleges, ...userColleges]));
    } else {
      const stateColleges = memoryStore.eventState.colleges || [];
      const userColleges = memoryStore.users.map(u => u.college).filter(Boolean);
      colleges = Array.from(new Set([...stateColleges, ...userColleges]));
    }

    res.json({ success: true, colleges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Add New College
app.post('/api/colleges', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'College name is required.' });
  }
  const cleanName = name.trim();

  try {
    if (isDbConnected) {
      await EventState.updateOne({}, { $addToSet: { colleges: cleanName } });
    } else {
      if (!memoryStore.eventState.colleges) memoryStore.eventState.colleges = [];
      if (!memoryStore.eventState.colleges.includes(cleanName)) {
        memoryStore.eventState.colleges.push(cleanName);
      }
    }
    res.json({ success: true, message: `College "${cleanName}" added successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rate Limiter for Login Endpoint (200 requests per minute per IP to support shared lab network IPs)
const loginRateLimitMap = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.ip ?? req.headers['x-forwarded-for'];
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 200;

  const record = loginRateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  loginRateLimitMap.set(ip, record);

  if (record.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please wait 1 minute before retrying.'
    });
  }
  next();
}

// Authentication & Role Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
    }
    req.user = decodedUser;
    next();
  });
}

export function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
}

// ----------------------------------------------------
// USER CREATION & MANAGEMENT ROUTES (STRICT HIERARCHY)
// ADMIN -> Creates COORDINATOR
// COORDINATOR -> Creates PARTICIPANT (ID = Password)
// ----------------------------------------------------

app.get('/api/admin/users', async (req, res) => {
  const { role } = req.query;
  try {
    let list = [];
    if (isDbConnected) {
      const query = role ? { role: role.toUpperCase() } : {};
      list = await User.find(query).select('-password');
    } else {
      list = role ? memoryStore.users.filter(u => u.role === role.toUpperCase()) : memoryStore.users;
    }
    res.json({ success: true, count: list.length, users: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/coordinators', async (req, res) => {
  const { name, email, college, department, password, pin, assignedRound } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required for Coordinator creation.' });
  }

  try {
    let count = 0;
    if (isDbConnected) {
      count = await User.countDocuments({ role: 'COORDINATOR' });
    } else {
      count = memoryStore.users.filter(u => u.role === 'COORDINATOR').length;
    }

    const coordId = `COORD-${String(count + 1).padStart(2, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCoord = {
      id: coordId,
      name,
      email: email.toLowerCase().trim(),
      college,
      department,
      role: 'COORDINATOR',
      password: hashedPassword,
      pin,
      assignedRound,
      permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS'],
      accountStatus: 'ACTIVE'
    };

    if (isDbConnected) {
      await User.create(newCoord);
    } else {
      memoryStore.users.push(newCoord);
    }

    await createAuditLog('ADMIN', 'ADMIN', 'COORDINATOR_CREATED', coordId, { name, email });
    const safeUser = { ...newCoord };
    delete safeUser.password;

    res.json({ success: true, user: safeUser, message: `Coordinator ${coordId} created successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dynamic Equal Participant Segregation Algorithm
async function autoAssignParticipants() {
  try {
    let coordinators = [];
    let participants = [];

    if (isDbConnected) {
      coordinators = await User.find({ role: 'COORDINATOR' }).sort({ id: 1 });
      participants = await User.find({ role: 'PARTICIPANT' }).sort({ id: 1 });
    } else {
      coordinators = memoryStore.users.filter(u => u.role === 'COORDINATOR').sort((a, b) => a.id.localeCompare(b.id));
      participants = memoryStore.users.filter(u => u.role === 'PARTICIPANT').sort((a, b) => a.id.localeCompare(b.id));
    }

    if (coordinators.length === 0 || participants.length === 0) {
      return { success: true, totalParticipants: participants.length, totalCoordinators: coordinators.length, matrix: [] };
    }

    const N = participants.length;
    const C = coordinators.length;

    // Mathematical Equal Segregation Algorithm
    const k = Math.floor(N / C); // base allocation per coordinator
    const r = N % C; // remainder to distribute among first r coordinators

    let currentIdx = 0;
    const matrix = [];

    for (let i = 0; i < C; i++) {
      const coord = coordinators[i];
      const quota = i < r ? k + 1 : k;
      const assignedGroup = participants.slice(currentIdx, currentIdx + quota);
      currentIdx += quota;

      const participantIds = assignedGroup.map(p => p.id);
      const labName = coord.assignedRound || `Lab Terminal ${i + 1}`;

      for (const p of assignedGroup) {
        if (isDbConnected) {
          await User.updateOne(
            { _id: p._id },
            { $set: { assignedCoordinator: coord.id, assignedRound: labName } }
          );
        } else {
          p.assignedCoordinator = coord.id;
          p.assignedRound = labName;
        }
      }

      matrix.push({
        coordinatorId: coord.id,
        coordinatorName: coord.name,
        coordinatorEmail: coord.email,
        assignedLab: labName,
        allocatedCount: assignedGroup.length,
        participantIds: participantIds,
        startId: participantIds.length > 0 ? participantIds[0] : null,
        endId: participantIds.length > 0 ? participantIds[participantIds.length - 1] : null
      });
    }

    return { success: true, totalParticipants: N, totalCoordinators: C, matrix };
  } catch (err) {
    console.error('Error in autoAssignParticipants:', err);
    return { success: false, error: err.message };
  }
}

app.get('/api/admin/participant-segregation', async (req, res) => {
  try {
    const result = await autoAssignParticipants();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/auto-assign-participants', async (req, res) => {
  try {
    const result = await autoAssignParticipants();
    res.json({ success: true, message: 'Participants auto-assigned equally across all Lab Coordinators.', ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coordinator/participants', async (req, res) => {
  const { name, email, college, department, year } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Participant name and email are required.' });
  }

  try {
    let count = 0;
    if (isDbConnected) {
      count = await User.countDocuments({ role: 'PARTICIPANT' });
    } else {
      count = memoryStore.users.filter(u => u.role === 'PARTICIPANT').length;
    }

    const participantId = `TN2026-${String(count + 1).padStart(3, '0')}`;
    // User ID and Password are identical for Participants
    const hashedPassword = await bcrypt.hash(participantId, 10);

    const newParticipant = {
      id: participantId,
      name,
      email: email.toLowerCase().trim(),
      college,
      department,
      year,
      role: 'PARTICIPANT',
      password: hashedPassword,
      accountStatus: 'ACTIVE'
    };

    if (isDbConnected) {
      await User.create(newParticipant);
      await EventState.updateOne({}, { $inc: { registrationCount: 1 } });
    } else {
      memoryStore.users.push(newParticipant);
      memoryStore.eventState.registrationCount += 1;
    }

    // Trigger equal segregation auto-assignment
    await autoAssignParticipants();

    const currentState = await getEventState();
    io.emit('eventState:updated', currentState);

    const safeUser = { ...newParticipant };
    delete safeUser.password;

    res.json({ 
      success: true, 
      user: safeUser, 
      generatedPassword: participantId,
      message: `Participant ${participantId} created successfully. Password set identical to User ID.` 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coordinator/participants/bulk', async (req, res) => {
  const { participantsList } = req.body;
  if (!Array.isArray(participantsList)) {
    return res.status(400).json({ success: false, message: 'Invalid payload. Array of participants expected.' });
  }

  try {
    let createdCount = 0;
    let currentCount = 0;
    if (isDbConnected) {
      currentCount = await User.countDocuments({ role: 'PARTICIPANT' });
    } else {
      currentCount = memoryStore.users.filter(u => u.role === 'PARTICIPANT').length;
    }

    const createdUsers = [];
    for (const p of participantsList) {
      if (!p.name || !p.email) continue;
      currentCount++;
      const pid = `TN2026-${String(currentCount).padStart(3, '0')}`;
      const hashedPassword = await bcrypt.hash(pid, 10);

      const userObj = {
        id: pid,
        name: p.name,
        email: String(p.email).toLowerCase().trim(),
        college: p.college,
        department: p.department,
        year: p.year,
        role: 'PARTICIPANT',
        password: hashedPassword,
        accountStatus: 'ACTIVE'
      };

      if (isDbConnected) {
        await User.create(userObj);
      } else {
        memoryStore.users.push(userObj);
      }
      createdCount++;
      createdUsers.push({ id: pid, name: p.name, email: p.email });
    }

    if (isDbConnected) {
      await EventState.updateOne({}, { $inc: { registrationCount: createdCount } });
    } else {
      memoryStore.eventState.registrationCount += createdCount;
    }

    // Trigger equal segregation auto-assignment
    await autoAssignParticipants();

    const currentState = await getEventState();
    io.emit('eventState:updated', currentState);

    res.json({
      success: true,
      createdCount,
      users: createdUsers,
      message: `Successfully created ${createdCount} participants with ID = Password credentials.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, pin, assignedRound, accountStatus, role } = req.body;

  try {
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (pin !== undefined) updates.pin = String(pin).trim();
    if (assignedRound !== undefined) updates.assignedRound = String(assignedRound).trim();
    if (accountStatus) updates.accountStatus = accountStatus;
    if (role) updates.role = role.toUpperCase();
    if (password && password.trim().length > 0) {
      updates.password = await bcrypt.hash(password.trim(), 10);
    }

    let updatedUser = null;
    if (isDbConnected) {
      updatedUser = await User.findOneAndUpdate({ id }, updates, { new: true }).select('-password');
    } else {
      const idx = memoryStore.users.findIndex(u => u.id === id);
      if (idx >= 0) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates };
        updatedUser = { ...memoryStore.users[idx] };
        delete updatedUser.password;
      }
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: `User ${id} not found.` });
    }

    await createAuditLog('ADMIN', 'ADMIN', 'USER_CREDENTIALS_MODIFIED', id, { updates: Object.keys(updates) });

    res.json({
      success: true,
      user: updatedUser,
      message: `User ${id} authentication record updated successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected) {
      await User.deleteOne({ id });
    } else {
      memoryStore.users = memoryStore.users.filter(u => u.id !== id);
    }
    res.json({ success: true, message: `User ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Technova 2026 Event Management Server is running.',
    health: '/api/health',
    status: '/api/event/status'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', dbConnected: isDbConnected, timestamp: new Date() });
});

app.get('/api/event/status', async (req, res) => {
  try {
    const state = await getEventState();
    res.json({ success: true, eventState: state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single Secure Authentication Endpoint (User ID / Email + Password / User ID -> JWT Token + Role Authorization)
app.post('/api/auth/login', rateLimitLogin, async (req, res) => {
  const { id, userId, password, email } = req.body;
  const inputId = String(id ?? userId ?? email ?? '').trim();
  const cleanPassword = String(password ?? '').trim();

  if (!inputId || !cleanPassword) {
    return res.status(400).json({ success: false, message: 'User ID / Email and Password are required.' });
  }

  try {
    let user = null;
    const isConnected = isDbConnected || (mongoose.connection && mongoose.connection.readyState === 1);

    if (isConnected) {
      const escapedId = inputId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({
        $or: [
          { id: { $regex: `^${escapedId}$`, $options: 'i' } },
          { email: { $regex: `^${escapedId}$`, $options: 'i' } }
        ]
      });
    } else {
      user = memoryStore.users.find(u => 
        (u.id && u.id.toLowerCase() === inputId.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === inputId.toLowerCase())
      );
    }

    if (!user) {
      await createAuditLog(inputId, 'GUEST', 'LOGIN_FAILURE', inputId, { reason: 'User not found' });
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check account status
    if (user.accountStatus && user.accountStatus !== 'ACTIVE') {
      await createAuditLog(user.id, user.role, 'LOGIN_FAILURE', user.id, { reason: `Account ${user.accountStatus}` });
      return res.status(401).json({ success: false, message: `Account is ${user.accountStatus.toLowerCase()}. Please contact administrator.` });
    }

    // Server-Side Password Verification (Bcrypt + fallback matching for password as User ID / Email)
    let isPasswordValid = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isPasswordValid = await bcrypt.compare(cleanPassword, user.password);
      // Secondary fallback: check if password passed is user's ID or email (case-insensitive)
      if (!isPasswordValid && (
        cleanPassword.toLowerCase() === user.id.toLowerCase() ||
        cleanPassword.toLowerCase() === (user.email || '').toLowerCase()
      )) {
        isPasswordValid = true;
      }
    } else {
      if (
        user.password === cleanPassword ||
        (user.password && user.password.toLowerCase() === cleanPassword.toLowerCase()) ||
        cleanPassword.toLowerCase() === user.id.toLowerCase() ||
        cleanPassword.toLowerCase() === (user.email || '').toLowerCase()
      ) {
        isPasswordValid = true;
        const newHash = await bcrypt.hash(cleanPassword, 10);
        user.password = newHash;
        if (isConnected) {
          await User.updateOne({ _id: user._id }, { password: newHash });
        }
      }
    }

    if (!isPasswordValid) {
      await createAuditLog(user.id, user.role, 'LOGIN_FAILURE', user.id, { reason: 'Incorrect password' });
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Issue JWT token with identity & trusted role claims
    const tokenPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
      permissions: user.permissions || []
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

    await createAuditLog(user.id, user.role, 'LOGIN_SUCCESS', user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
        role: user.role,
        assignedRound: user.assignedRound,
        permissions: user.permissions || []
      }
    });
  } catch (err) {
    console.error('Login Endpoint Error:', err);
    res.status(500).json({ success: false, message: 'Server error processing authentication.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, college, department, year, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  try {
    let count = 0;
    if (isDbConnected) {
      count = await User.countDocuments({ role: 'PARTICIPANT' });
    } else {
      count = memoryStore.users.filter(u => u.role === 'PARTICIPANT').length;
    }

    const participantId = `TN2026-${String(count + 1).padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: participantId,
      name,
      email: email.toLowerCase().trim(),
      college,
      department,
      year,
      role: 'PARTICIPANT',
      password: hashedPassword,
      accountStatus: 'ACTIVE'
    };

    if (isDbConnected) {
      await User.create(newUser);
      await EventState.updateOne({}, { $inc: { registrationCount: 1 } });
    } else {
      memoryStore.users.push(newUser);
      memoryStore.eventState.registrationCount += 1;
    }

    const currentState = await getEventState();
    io.emit('eventState:updated', currentState);

    const safeUser = { ...newUser };
    delete safeUser.password;

    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/event/settings', async (req, res) => {
  const newSettings = { ...req.body };
  try {
    const currentState = await getEventState();
    const now = new Date();

    // Automatically manage live round start and end countdown timestamps
    if (newSettings.status) {
      if (newSettings.status === 'ROUND_1_RUNNING') {
        const dMin = newSettings.round1DurationMinutes ?? currentState.round1DurationMinutes ?? 10;
        newSettings.roundStartedAt = now;
        newSettings.roundEndsAt = new Date(now.getTime() + dMin * 60 * 1000);
      } else if (newSettings.status === 'ROUND_2_RUNNING') {
        const dMin = newSettings.round2DurationMinutes ?? currentState.round2DurationMinutes ?? 15;
        newSettings.roundStartedAt = now;
        newSettings.roundEndsAt = new Date(now.getTime() + dMin * 60 * 1000);
      } else if (newSettings.status === 'ROUND_3_RUNNING') {
        const dMin = newSettings.round3DurationMinutes ?? currentState.round3DurationMinutes ?? 15;
        newSettings.roundStartedAt = now;
        newSettings.roundEndsAt = new Date(now.getTime() + dMin * 60 * 1000);
      } else if (['ROUND_1_ENDED', 'ROUND_2_ENDED', 'ROUND_3_ENDED', 'COMPLETED'].includes(newSettings.status)) {
        newSettings.roundEndsAt = now;
      } else if (newSettings.status === 'REGISTRATION') {
        newSettings.roundStartedAt = null;
        newSettings.roundEndsAt = null;
      }
    }

    let updatedState = null;
    if (isDbConnected) {
      updatedState = await EventState.findOneAndUpdate({}, newSettings, { new: true, upsert: true });
    } else {
      memoryStore.eventState = { ...memoryStore.eventState, ...newSettings };
      updatedState = memoryStore.eventState;
    }

    // Broadcast live event state
    io.emit('eventState:updated', updatedState);
    io.emit('event:state_changed', updatedState);

    // Live Calculation Update for all connected clients
    try {
      const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
      io.emit('leaderboard:updated', { 
        success: true, 
        leaderboard: formattedLeaderboard, 
        qualifySettings,
        eventState: updatedState
      });
    } catch (e) {
      console.warn('Leaderboard recomputation after state update warning:', e.message);
    }

    res.json({ success: true, eventState: updatedState });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Explicit endpoint to trigger real-time calculations across all 3 rounds
app.post('/api/admin/recalculate', async (req, res) => {
  try {
    const { formattedLeaderboard, qualifySettings, gradedR2Set, gradedR3Set } = await computeLeaderboardData();
    const state = await getEventState();

    io.emit('leaderboard:updated', {
      success: true,
      leaderboard: formattedLeaderboard,
      qualifySettings,
      eventState: state
    });

    res.json({
      success: true,
      message: 'Recalculation executed and broadcast successfully.',
      leaderboard: formattedLeaderboard,
      qualifySettings,
      gradedCountR2: gradedR2Set?.size || 0,
      gradedCountR3: gradedR3Set?.size || 0
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    let registeredCount = 0;
    let round1Submissions = 0;
    let round2Verifications = 0;
    let questionsCount = 0;

    if (isDbConnected) {
      registeredCount = await User.countDocuments({ role: 'PARTICIPANT' });
      round1Submissions = await QuizAttempt.countDocuments({ status: 'SUBMITTED' });
      round2Verifications = await Submission.countDocuments({ status: 'VERIFIED' });
      questionsCount = await Question.countDocuments({ status: 'ACTIVE' });
    } else {
      registeredCount = memoryStore.users.filter(u => u.role === 'PARTICIPANT').length;
      round1Submissions = Object.values(memoryStore.quizAttempts).filter(a => a.status === 'SUBMITTED').length;
      round2Verifications = memoryStore.submissions.filter(s => s.status === 'VERIFIED').length;
      questionsCount = memoryStore.questions.filter(q => q.status === 'ACTIVE').length;
    }

    const state = await getEventState();

    res.json({
      success: true,
      stats: {
        totalParticipants: registeredCount,
        round1Qualifiers: state.round1QualifyCount,
        round2Qualifiers: state.round2QualifyCount,
        questionsCount,
        round1Submissions,
        round2Verifications,
        status: state.status
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND GRADING CONFIG API (Admin)
// ----------------------------------------------------

// GET current round grading configuration
app.get('/api/admin/round-grading-config', async (req, res) => {
  try {
    const state = await getEventState();
    const config = state.roundGradingConfig || DEFAULT_ROUND_GRADING_CONFIG;
    res.json({ success: true, roundGradingConfig: config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update round grading configuration
// Body: { roundGradingConfig: { 1: { gradingPercentage: 100 }, 2: { gradingPercentage: 80 }, 3: { gradingPercentage: 50 } } }
app.put('/api/admin/round-grading-config', async (req, res) => {
  const { roundGradingConfig } = req.body;
  if (!roundGradingConfig || typeof roundGradingConfig !== 'object') {
    return res.status(400).json({ success: false, message: 'roundGradingConfig object is required.' });
  }

  // Validate all percentages are 0-100
  for (const [round, cfg] of Object.entries(roundGradingConfig)) {
    const pct = cfg?.gradingPercentage;
    if (typeof pct !== 'number' || pct < 0 || pct > 100) {
      return res.status(400).json({
        success: false,
        message: `Round ${round}: gradingPercentage must be a number between 0 and 100.`
      });
    }
  }

  try {
    if (isDbConnected) {
      await EventState.updateOne({}, { $set: { roundGradingConfig } }, { upsert: true });
    } else {
      memoryStore.eventState.roundGradingConfig = roundGradingConfig;
    }

    const updatedState = await getEventState();
    io.emit('eventState:updated', updatedState);

    await createAuditLog('ADMIN', 'ADMIN', 'ROUND_GRADING_CONFIG_UPDATED', '', { roundGradingConfig });
    res.json({ success: true, message: 'Round grading configuration updated.', roundGradingConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET grading status for a specific participant and round
app.get('/api/quiz/grading-status', async (req, res) => {
  const { participantId, roundId } = req.query;
  if (!participantId) {
    return res.status(400).json({ success: false, message: 'participantId is required.' });
  }

  try {
    const results = {};

    // Round 1
    let r1Attempt = null;
    if (isDbConnected) {
      r1Attempt = await QuizAttempt.findOne({ participantId });
    } else {
      r1Attempt = memoryStore.quizAttempts[participantId];
    }
    results.round1 = {
      hasAttempt: !!r1Attempt,
      gradingStatus: r1Attempt?.gradingStatus || 'graded', // R1 always graded
      participationStatus: r1Attempt?.participationStatus || 'not_started',
      qualificationStatus: r1Attempt?.qualificationStatus || 'not_applicable'
    };

    // Round 2
    let r2Attempt = null;
    if (isDbConnected) {
      r2Attempt = await DebugAttempt.findOne({ participantId });
    } else {
      r2Attempt = memoryStore.debugAttempts[participantId];
    }
    results.round2 = {
      hasAttempt: !!r2Attempt,
      gradingStatus: r2Attempt?.gradingStatus || null,
      participationStatus: r2Attempt?.participationStatus || 'not_started',
      qualificationStatus: r2Attempt?.qualificationStatus || 'not_applicable'
    };

    // Round 3
    let r3Attempt = null;
    if (isDbConnected) {
      r3Attempt = await HuntAttempt.findOne({ participantId });
    } else {
      r3Attempt = memoryStore.huntAttempts[participantId];
    }
    results.round3 = {
      hasAttempt: !!r3Attempt,
      gradingStatus: r3Attempt?.gradingStatus || null,
      participationStatus: r3Attempt?.participationStatus || 'not_started',
      qualificationStatus: r3Attempt?.qualificationStatus || 'not_applicable'
    };

    res.json({ success: true, participantId, gradingResults: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// LEADERBOARD COMPUTATION & SEQUENTIAL QUALIFICATION HELPER
// ----------------------------------------------------

// Attainment Performance Bands based on official Rubric criteria
function getR1Band(score) {
  if (score >= 16) return { band: 'Excellent', label: '16–20 pts (Excellent)', badgeColor: 'emerald' };
  if (score >= 10) return { band: 'Good', label: '10–15 pts (Good)', badgeColor: 'amber' };
  return { band: 'Poor', label: '<10 pts (Poor)', badgeColor: 'rose' };
}

function getR2Band(score) {
  if (score >= 24) return { band: 'Excellent', label: '24–30 pts (Excellent)', badgeColor: 'emerald' };
  if (score >= 15) return { band: 'Good', label: '15–23.5 pts (Good)', badgeColor: 'amber' };
  return { band: 'Poor', label: '<15 pts (Poor)', badgeColor: 'rose' };
}

function getR3Band(score) {
  if (score >= 40) return { band: 'Excellent', label: '40–50 pts (Excellent)', badgeColor: 'emerald' };
  if (score >= 25) return { band: 'Good', label: '25–39 pts (Good)', badgeColor: 'amber' };
  return { band: 'Poor', label: '<25 pts (Poor)', badgeColor: 'rose' };
}

function getGrandTotalBand(score) {
  if (score >= 80) return { band: 'Excellent', label: '80–100 pts (Distinction / Excellent)', badgeColor: 'emerald' };
  if (score >= 50) return { band: 'Good', label: '50–79.5 pts (Merit / Good)', badgeColor: 'amber' };
  return { band: 'Poor', label: '<50 pts (Needs Improvement)', badgeColor: 'rose' };
}

async function computeLeaderboardData() {
  let participants = [];
  let quizAttemptsList = [];
  let submissions = [];
  let huntAttemptsList = [];

  if (isDbConnected) {
    participants = await User.find({ role: 'PARTICIPANT' });
    quizAttemptsList = await QuizAttempt.find();
    submissions = await Submission.find({ status: 'VERIFIED' });
    huntAttemptsList = await HuntAttempt.find();
  } else {
    participants = memoryStore.users.filter(u => u.role === 'PARTICIPANT');
    quizAttemptsList = Object.values(memoryStore.quizAttempts);
    submissions = memoryStore.submissions.filter(s => s.status === 'VERIFIED');
    huntAttemptsList = Object.values(memoryStore.huntAttempts);
  }

  const state = await getEventState();
  const isR1EndedOrFurther = ['ROUND_1_ENDED', 'ROUND_2_READY', 'ROUND_2_RUNNING', 'ROUND_2_ENDED', 'ROUND_3_READY', 'ROUND_3_RUNNING', 'COMPLETED'].includes(state.status);
  const isR2EndedOrFurther = ['ROUND_2_ENDED', 'ROUND_3_READY', 'ROUND_3_RUNNING', 'COMPLETED'].includes(state.status);
  const isEventCompleted = state.status === 'COMPLETED' || state.status === 'ROUND_3_ENDED';
  const isAllRoundsEnded = ['ROUND_3_ENDED', 'COMPLETED'].includes(state.status);

  // ── DYNAMIC ROUND GRADING & QUALIFICATION CONFIGURATION ─────────────────
  const roundGradingConfig = state.roundGradingConfig || DEFAULT_ROUND_GRADING_CONFIG;
  const totalParticipants = participants.length;

  // Round 1 is 100% of participants
  const r1GradingPct = 100;
  
  // Round 2 Graded Cohort (Default: 70% of R1 participants)
  let r2GradedCount = 0;
  const r2GradingPct = state.round1QualifyPercentage ?? roundGradingConfig[2]?.gradingPercentage ?? 70;
  if (state.round1QualifyMode === 'COUNT' && state.round1QualifyCount > 0) {
    r2GradedCount = Math.min(totalParticipants, parseInt(state.round1QualifyCount));
  } else {
    r2GradedCount = calculateQualifiedCount(totalParticipants, r2GradingPct);
  }

  // Round 3 Graded Cohort (Default: 50% of Round 2 Graded participants)
  let r3GradedCount = 0;
  const r3GradingPct = state.round2QualifyPercentage ?? roundGradingConfig[3]?.gradingPercentage ?? 50;
  if (state.round2QualifyMode === 'COUNT' && state.round2QualifyCount > 0) {
    r3GradedCount = Math.min(r2GradedCount, parseInt(state.round2QualifyCount));
  } else {
    r3GradedCount = calculateQualifiedCount(r2GradedCount, r3GradingPct);
  }

  // 1. Build participant base records
  const rawList = participants.map(p => {
    const qAttempt = quizAttemptsList.find(a => a.participantId === p.id);
    const r2Subs = submissions.filter(s => s.participantId === p.id);
    const hAttempt = huntAttemptsList.find(a => a.participantId === p.id);

    let r1Score = 0;
    if (qAttempt) {
      if (qAttempt.score !== undefined && qAttempt.score > 0) {
        r1Score = qAttempt.score;
      } else if (qAttempt.userAnswers && qAttempt.selectedQuestions) {
        const ans = qAttempt.userAnswers instanceof Map ? Object.fromEntries(qAttempt.userAnswers) : (qAttempt.userAnswers || {});
        qAttempt.selectedQuestions.forEach(sq => {
          if (ans[sq.questionId] !== undefined && parseInt(ans[sq.questionId]) === sq.correctOptionIndex) {
            r1Score += 1;
          }
        });
      }
    }
    const r1SubmittedAt = qAttempt?.submittedAt ? new Date(qAttempt.submittedAt).getTime() : (qAttempt?.updatedAt ? new Date(qAttempt.updatedAt).getTime() : 0);
    const r1Duration = (qAttempt?.startedAt && qAttempt?.submittedAt)
      ? (new Date(qAttempt.submittedAt).getTime() - new Date(qAttempt.startedAt).getTime())
      : 999999999;
    const hasAttemptedR1 = !!qAttempt;
    const r1Completed = (qAttempt?.status === 'SUBMITTED') || (r1SubmittedAt > 0) || (r1Score > 0 && isR1EndedOrFurther);

    const r2Score = r2Subs.reduce((acc, curr) => acc + (curr.marks || 0), 0);
    const r2LatestVerified = r2Subs.length > 0
      ? Math.max(...r2Subs.map(s => s.verifiedAt ? new Date(s.verifiedAt).getTime() : 0))
      : 0;
    const hasAttemptedR2 = r2Subs.length > 0;
    const r2Completed = (r2Subs.length >= 3 && r2Subs.every(s => s.status === 'VERIFIED')) || (memoryStore.debugAttempts[p.id]?.status === 'COMPLETED');

    const r3Score = hAttempt ? (hAttempt.score || 0) : 0;
    const r3SubmittedAt = hAttempt?.updatedAt ? new Date(hAttempt.updatedAt).getTime() : 0;
    const hasAttemptedR3 = !!hAttempt;
    const r3Completed = (hAttempt?.status === 'COMPLETED') || (r3SubmittedAt > 0);

    const hintsMap = hAttempt?.hintsUsed instanceof Map ? Object.fromEntries(hAttempt.hintsUsed) : (hAttempt?.hintsUsed || {});
    const r3HintsCount = Object.values(hintsMap).filter(Boolean).length;
    const r3Duration = (hAttempt?.startedAt && hAttempt?.status === 'COMPLETED' && hAttempt?.updatedAt)
      ? (new Date(hAttempt.updatedAt).getTime() - new Date(hAttempt.startedAt).getTime())
      : 999999999;

    const roundedR2Score = Number(r2Score.toFixed(1));
    const totalScore = Number((r1Score + roundedR2Score + r3Score).toFixed(1));

    const isDisqualified = p.accountStatus === 'DISQUALIFIED' || qAttempt?.status === 'DISQUALIFIED' || hAttempt?.status === 'DISQUALIFIED';

    return {
      id: p.id,
      name: p.name,
      email: p.email,
      college: p.college,
      department: p.department,
      year: p.year,
      accountStatus: p.accountStatus,
      isDisqualified,
      manualGradingOverrides: p.manualGradingOverrides || {},
      r1Score: isDisqualified ? 0 : r1Score,
      r1SubmittedAt,
      r1Duration,
      hasAttemptedR1,
      r1Completed,
      r2Score: isDisqualified ? 0 : roundedR2Score,
      r2LatestVerified,
      hasAttemptedR2,
      r2Completed,
      r3Score: isDisqualified ? 0 : r3Score,
      r3SubmittedAt,
      r3HintsCount,
      r3Duration,
      hasAttemptedR3,
      r3Completed,
      totalScore: isDisqualified ? 0 : totalScore
    };
  });

  // 2. Step 1: Round 1 Sorting & R2 Graded Cohort Selection
  // Priority: r1Score DESC → r1Duration ASC → r1SubmittedAt ASC → id ASC (deterministic)
  const r1Sorted = [...rawList].sort((a, b) => {
    if (b.r1Score !== a.r1Score) return b.r1Score - a.r1Score;
    if (a.r1Duration !== b.r1Duration) return a.r1Duration - b.r1Duration;
    if (a.r1SubmittedAt && b.r1SubmittedAt) return a.r1SubmittedAt - b.r1SubmittedAt;
    return a.id.localeCompare(b.id);
  });

  const r1RankMap = new Map();
  // gradedR2Set: official graded cohort for Round 2 (top 70% or custom count by R1 leaderboard, with manual override support)
  const gradedR2Set = new Set();
  const qualifiedR2Set = new Set(); // alias for backward compat

  r1Sorted.forEach((p, idx) => {
    const rank = idx + 1;
    r1RankMap.set(p.id, rank);
    if (p.manualGradingOverrides?.round2 === 'graded') {
      gradedR2Set.add(p.id);
      qualifiedR2Set.add(p.id);
    } else if (p.manualGradingOverrides?.round2 === 'non_graded') {
      // Coordinator explicitly marked as non-graded
    } else if (rank <= r2GradedCount) {
      gradedR2Set.add(p.id);
      qualifiedR2Set.add(p.id);
    }
  });

  // 3. Step 2: Round 2 Sorting & R3 Graded Cohort Selection
  // Only the gradedR2Set participants feed into R3 graded cohort calculation (Top 50% of R2)
  const r2GradedList = rawList.filter(p => gradedR2Set.has(p.id));
  const r2Sorted = [...r2GradedList].sort((a, b) => {
    const aR1R2 = a.r1Score + a.r2Score;
    const bR1R2 = b.r1Score + b.r2Score;
    if (bR1R2 !== aR1R2) return bR1R2 - aR1R2;
    if (b.r2Score !== a.r2Score) return b.r2Score - a.r2Score;
    if (a.r2LatestVerified && b.r2LatestVerified) return a.r2LatestVerified - b.r2LatestVerified;
    return (r1RankMap.get(a.id) || 999) - (r1RankMap.get(b.id) || 999);
  });

  const r2RankMap = new Map();
  const gradedR3Set = new Set();
  const qualifiedR3Set = new Set(); // alias for backward compat

  r2Sorted.forEach((p, idx) => {
    const rank = idx + 1;
    r2RankMap.set(p.id, rank);
    if (p.manualGradingOverrides?.round3 === 'graded') {
      gradedR3Set.add(p.id);
      qualifiedR3Set.add(p.id);
    } else if (p.manualGradingOverrides?.round3 === 'non_graded') {
      // Coordinator explicitly marked as non-graded
    } else if (rank <= r3GradedCount) {
      gradedR3Set.add(p.id);
      qualifiedR3Set.add(p.id);
    }
  });

  // 4. Step 3: Final Overall Ranking with Master Tie-Breaking Hierarchy
  const finalLeaderboard = [...rawList].sort((a, b) => {
    const aInR3 = gradedR3Set.has(a.id);
    const bInR3 = gradedR3Set.has(b.id);
    const aInR2 = gradedR2Set.has(a.id);
    const bInR2 = gradedR2Set.has(b.id);

    // Official graded cohort priority:
    // Only participants in the official Round 3 Graded Cohort contend for official Podium Ranks
    if (isR2EndedOrFurther || isEventCompleted) {
      if (aInR3 && !bInR3) return -1;
      if (!aInR3 && bInR3) return 1;
    }
    if (isR1EndedOrFurther || isEventCompleted) {
      if (aInR2 && !bInR2) return -1;
      if (!aInR2 && bInR2) return 1;
    }

    // ── MASTER TIE-BREAKING HIERARCHY ──────────────────────────────────────────
    // 1. Primary: Grand Total Cumulative Score (R1 + R2 + R3) DESC
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

    // 2. Tie-Breaker 1: Higher Score in Round 2 Debugging DESC
    if (b.r2Score !== a.r2Score) return b.r2Score - a.r2Score;

    // 3. Tie-Breaker 2: Fewer Hints Used in Round 3 ASC
    if (a.r3HintsCount !== b.r3HintsCount) return a.r3HintsCount - b.r3HintsCount;

    // 4. Tie-Breaker 3: Faster Time in Round 3 Tech Hunt ASC
    if (a.r3Duration !== b.r3Duration) return a.r3Duration - b.r3Duration;
    if (a.r3SubmittedAt && b.r3SubmittedAt && a.r3SubmittedAt !== b.r3SubmittedAt) {
      return a.r3SubmittedAt - b.r3SubmittedAt;
    }

    // 5. Tie-Breaker 4: Faster Time in Round 1 Tech Quiz ASC
    if (a.r1Duration !== b.r1Duration) return a.r1Duration - b.r1Duration;
    if (a.r1SubmittedAt && b.r1SubmittedAt && a.r1SubmittedAt !== b.r1SubmittedAt) {
      return a.r1SubmittedAt - b.r1SubmittedAt;
    }

    // Deterministic tie-breaker
    return a.id.localeCompare(b.id);
  });

  // 5. Format sanitized output
  const formattedLeaderboard = finalLeaderboard.map((item, idx) => {
    const overallRank = idx + 1;
    const isQualifiedR2 = gradedR2Set.has(item.id);
    const isQualifiedR3 = gradedR3Set.has(item.id);
    const r1R = r1RankMap.get(item.id) || overallRank;
    const r2R = r2RankMap.get(item.id) || null;

    let statusText = 'Registered';
    let qualificationStatus = 'REGISTERED';

    if (item.isDisqualified) {
      statusText = '🚨 Disqualified (Malpractice)';
      qualificationStatus = 'DISQUALIFIED';
    } else if (isEventCompleted) {
      if (overallRank === 1 && isQualifiedR3) { statusText = '🥇 1st Place (Champion)'; qualificationStatus = 'PODIUM_WINNER'; }
      else if (overallRank === 2 && isQualifiedR3) { statusText = '🥈 2nd Place (Runner Up)'; qualificationStatus = 'PODIUM_WINNER'; }
      else if (overallRank === 3 && isQualifiedR3) { statusText = '🥉 3rd Place'; qualificationStatus = 'PODIUM_WINNER'; }
      else if (isQualifiedR3) { statusText = 'Round 3 Finalist'; qualificationStatus = 'QUALIFIED_R3'; }
      else if (isQualifiedR2) { statusText = 'Round 2 Graded Qualifier'; qualificationStatus = 'QUALIFIED_R2'; }
      else { statusText = 'Completed (Non-Graded)'; qualificationStatus = 'COMPLETED'; }
    } else if (state.status.startsWith('ROUND_3')) {
      if (isQualifiedR3) { statusText = '⭐ Official Round 3 Finalist'; qualificationStatus = 'QUALIFIED_R3'; }
      else if (isQualifiedR2) { statusText = 'Round 3 Non-Graded'; qualificationStatus = 'NON_GRADED_R3'; }
      else { statusText = 'Non-Graded Participant'; qualificationStatus = 'NON_GRADED'; }
    } else if (state.status.startsWith('ROUND_2')) {
      if (isQualifiedR2) { statusText = '⭐ Official Round 2 Graded'; qualificationStatus = 'QUALIFIED_R2'; }
      else { statusText = 'Round 2 Non-Graded'; qualificationStatus = 'NON_GRADED_R2'; }
    } else if (state.status === 'ROUND_1_ENDED') {
      if (isQualifiedR2) { statusText = '⭐ Graded for Round 2'; qualificationStatus = 'QUALIFIED_R2'; }
      else { statusText = 'Non-Graded for Round 2'; qualificationStatus = 'NON_GRADED_R2'; }
    } else if (state.status === 'ROUND_1_RUNNING') {
      statusText = item.hasAttemptedR1 ? 'Round 1 Submitted' : 'Round 1 Active';
      qualificationStatus = 'IN_CONTENTION';
    }

    return {
      id: item.id,
      name: item.name,
      college: item.college,
      department: item.department,
      year: item.year,
      r1: item.r1Score,
      r1Score: item.r1Score,
      r1Rank: r1R,
      r1Band: getR1Band(item.r1Score),
      r1Duration: item.r1Duration,
      r2: item.r2Score,
      r2Score: item.r2Score,
      r2Rank: r2R,
      r2Band: getR2Band(item.r2Score),
      r2LatestVerified: item.r2LatestVerified,
      r3: item.r3Score,
      r3Score: item.r3Score,
      r3Band: getR3Band(item.r3Score),
      r3HintsCount: item.r3HintsCount,
      r3Duration: item.r3Duration,
      total: item.totalScore,
      totalScore: item.totalScore,
      grandBand: getGrandTotalBand(item.totalScore),
      rank: overallRank,
      // qualifiedR2/R3 means "graded" for that round; ALL participants can always PARTICIPATE
      qualifiedR2: isQualifiedR2,
      qualifiedForRound2: isQualifiedR2,
      qualifiedR3: isQualifiedR3,
      qualifiedForRound3: isQualifiedR3,
      isGradedR2: isQualifiedR2,
      isGradedR3: isQualifiedR3,
      canParticipateR2: true,
      canParticipateR3: true,
      r1Completed: item.r1Completed,
      r2Completed: item.r2Completed,
      r3Completed: item.r3Completed,
      manualGradingOverrides: item.manualGradingOverrides || {},
      isWinner: overallRank <= 3 && item.totalScore > 0 && isQualifiedR3 && !item.isDisqualified,
      isDisqualified: !!item.isDisqualified,
      status: statusText,
      qualificationStatus
    };
  });

  const qualifySettings = {
    round1QualifyCount: r2GradedCount,
    round2QualifyCount: r3GradedCount,
    r2GradedCount,
    r3GradedCount,
    r2GradingPct,
    r3GradingPct,
    round1QualifyMode: state.round1QualifyMode || 'PERCENTAGE',
    round2QualifyMode: state.round2QualifyMode || 'PERCENTAGE',
    round3StationCount: state.round3StationCount ?? 5,
    totalParticipants,
    status: state.status,
    activeRound: state.activeRound,
    isAllRoundsEnded,
    isEventCompleted,
    r1MaxMarks: 20,
    r2MaxMarks: 30,
    r3MaxMarks: 50,
    grandTotalMaxMarks: 100
  };

  return { formattedLeaderboard, qualifySettings, qualifiedR2Set, qualifiedR3Set, gradedR2Set, gradedR3Set };
}

app.get('/api/leaderboard', async (req, res) => {
  try {
    const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
    res.json({ 
      success: true, 
      leaderboard: formattedLeaderboard,
      qualifySettings
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND 1 — QUESTION BANK CONTENT MANAGEMENT (ADMIN / COORD)
// ----------------------------------------------------

app.get('/api/admin/questions', async (req, res) => {
  const { category, difficulty, status, search } = req.query;

  try {
    let list = [];
    if (isDbConnected) {
      list = await Question.find();
    } else {
      list = memoryStore.questions;
    }

    let filtered = list;

    if (category && category !== 'ALL') {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty && difficulty !== 'ALL') {
      filtered = filtered.filter(q => q.difficulty.toUpperCase() === difficulty.toUpperCase());
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter(q => q.status?.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const qLower = search.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText.toLowerCase().includes(qLower) || 
        q.category.toLowerCase().includes(qLower) ||
        (q.tags && q.tags.some(t => t.toLowerCase().includes(qLower)))
      );
    }

    res.json({
      success: true,
      totalCount: list.length,
      filteredCount: filtered.length,
      questions: filtered
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/questions', async (req, res) => {
  const { questionText, category, difficulty, options, correctOption, explanation, tags, status, createdBy } = req.body;

  if (!questionText || !options || options.length < 2 || correctOption === undefined) {
    return res.status(400).json({ success: false, message: 'Question text, at least 2 options, and correct option are required.' });
  }

  try {
    let allQuestions = [];
    if (isDbConnected) {
      allQuestions = await Question.find();
    } else {
      allQuestions = memoryStore.questions;
    }

    // Duplicate text check
    const isDuplicate = allQuestions.some(q => q.questionText.trim().toLowerCase() === questionText.trim().toLowerCase());
    let warning = null;
    if (isDuplicate) {
      warning = 'Warning: A question with identical question text already exists in the bank.';
    }

    const questionId = `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newQ = {
      questionId,
      id: questionId,
      questionText,
      category,
      difficulty: difficulty?.toUpperCase(),
      options: options.map(o => String(o).trim()),
      correctOption: parseInt(correctOption),
      marks: 1,
      explanation,
      tags: tags || [],
      status,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDbConnected) {
      await Question.create(newQ);
    } else {
      memoryStore.questions.push(newQ);
    }

    await createAuditLog(createdBy, 'ADMIN', 'QUESTION_CREATED', questionId, { category, difficulty });

    res.json({ success: true, question: newQ, warning });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/questions/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    updates.updatedAt = new Date();
    let updatedQ = null;

    if (isDbConnected) {
      updatedQ = await Question.findOneAndUpdate(
        { $or: [{ questionId: id }, { id }] },
        updates,
        { new: true }
      );
    } else {
      const idx = memoryStore.questions.findIndex(q => q.questionId === id || q.id === id);
      if (idx >= 0) {
        memoryStore.questions[idx] = { ...memoryStore.questions[idx], ...updates };
        updatedQ = memoryStore.questions[idx];
      }
    }

    if (!updatedQ) {
      return res.status(404).json({ success: false, message: `Question ${id} not found.` });
    }

    await createAuditLog(updates.updatedBy, 'ADMIN', 'QUESTION_UPDATED', id, { updates });
    res.json({ success: true, question: updatedQ });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/questions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected) {
      await Question.deleteOne({ $or: [{ questionId: id }, { id }] });
    } else {
      memoryStore.questions = memoryStore.questions.filter(q => q.questionId !== id && q.id !== id);
    }

    await createAuditLog('ADMIN', 'ADMIN', 'QUESTION_DELETED', id);
    res.json({ success: true, message: `Question ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/questions/import', async (req, res) => {
  const { questionsList, importedBy } = req.body;
  if (!Array.isArray(questionsList)) {
    return res.status(400).json({ success: false, message: 'Invalid payload. Array expected.' });
  }

  try {
    let importedCount = 0;
    for (const q of questionsList) {
      if (!q.questionText || !q.options || q.options.length < 2) continue;

      const qId = q.questionId || `Q-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const formatted = {
        questionId: qId,
        id: qId,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty?.toUpperCase(),
        options: q.options,
        correctOption: q.correctOption !== undefined ? parseInt(q.correctOption) : 0,
        marks: q.marks || 1,
        explanation: q.explanation,
        tags: q.tags || [],
        status: q.status,
        createdBy: importedBy,
        updatedBy: importedBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isDbConnected) {
        await Question.updateOne({ questionId: qId }, formatted, { upsert: true });
      } else {
        const idx = memoryStore.questions.findIndex(item => item.questionId === qId);
        if (idx >= 0) memoryStore.questions[idx] = formatted;
        else memoryStore.questions.push(formatted);
      }
      importedCount++;
    }

    await createAuditLog(importedBy, 'ADMIN', 'QUESTIONS_BULK_IMPORTED', '', { importedCount });
    res.json({ success: true, importedCount, message: `Successfully imported ${importedCount} questions.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/questions/export', async (req, res) => {
  try {
    let list = [];
    if (isDbConnected) {
      list = await Question.find();
    } else {
      list = memoryStore.questions;
    }
    res.json({ success: true, questions: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND 1 — PARTICIPANT QUIZ ENGINE (SERVER RANDOMIZATION & SANITIZATION)
// ----------------------------------------------------

app.post('/api/quiz/start', async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) {
    return res.status(400).json({ success: false, message: 'Participant ID is required.' });
  }

  try {
    const state = await getEventState();
    if (!['ROUND_1_RUNNING', 'ROUND_1_ACTIVE'].includes(state.status)) {
      return res.status(403).json({
        success: false,
        message: 'Round 1 Quiz is currently locked. It will activate when the coordinator initiates Round 1.'
      });
    }
    const requiredCount = state.round1MaxQuestions || 20;

    // 1. Fetch active question bank
    let activeQuestions = [];
    if (isDbConnected) {
      activeQuestions = await Question.find({ status: 'ACTIVE' });
    } else {
      activeQuestions = memoryStore.questions.filter(q => q.status === 'ACTIVE');
    }

    // 2. Validate content count
    if (activeQuestions.length < requiredCount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient active questions available for this round. Required: ${requiredCount}, Active: ${activeQuestions.length}`
      });
    }

    // 3. Check for existing attempt (Persistence check — idempotent)
    let existingAttempt = null;
    if (isDbConnected) {
      existingAttempt = await QuizAttempt.findOne({ participantId });
    } else {
      existingAttempt = memoryStore.quizAttempts[participantId];
    }

    if (existingAttempt) {
      // Re-hydrate sanitized questions from stored attempt (DO NOT RANDOMIZE AGAIN)
      const sanitizedQuestions = existingAttempt.selectedQuestions.map((sq, idx) => ({
        questionId: sq.questionId,
        position: idx + 1,
        questionText: (activeQuestions.find(q => q.questionId === sq.questionId))?.questionText,
        options: sq.options,
        marks: 1,
        questionNumber: idx + 1,
        totalQuestions: existingAttempt.selectedQuestions.length
      }));

      return res.json({
        success: true,
        attemptId: existingAttempt.attemptId,
        status: existingAttempt.status,
        gradingStatus: existingAttempt.gradingStatus || 'graded',
        participationStatus: existingAttempt.participationStatus || 'active',
        userAnswers: existingAttempt.userAnswers instanceof Map
          ? Object.fromEntries(existingAttempt.userAnswers)
          : (existingAttempt.userAnswers || {}),
        startedAt: existingAttempt.startedAt,
        endsAt: existingAttempt.endsAt,
        questions: sanitizedQuestions
      });
    }

    // 4. Round 1 is ALWAYS 100% graded — all participants are in the official cohort
    // (gradingPercentage for round 1 is 100 by configuration)
    const roundConfig = state.roundGradingConfig || DEFAULT_ROUND_GRADING_CONFIG;
    const r1Pct = roundConfig[1]?.gradingPercentage ?? 100;
    // For R1, everyone is graded
    const r1GradingStatus = r1Pct >= 100 ? 'graded' : 'non_graded';
    // In practice r1GradingStatus is always 'graded' since R1 = 100%

    // 5. Perform SERVER-SIDE secure random selection & option shuffling
    const shuffledBank = secureShuffle(activeQuestions);
    const selectedBank = shuffledBank.slice(0, requiredCount);

    const selectedQuestions = selectedBank.map((q, idx) => {
      const originalOptions = [...q.options];
      const correctText = originalOptions[q.correctOption];
      const shuffledOptions = secureShuffle(originalOptions);
      const newCorrectIndex = shuffledOptions.indexOf(correctText);

      return {
        questionId: q.questionId,
        position: idx + 1,
        options: shuffledOptions,
        correctOptionIndex: newCorrectIndex
      };
    });

    const durationMinutes = state.round1DurationMinutes || 10;
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    const attemptId = `ATT1-${participantId}-${Date.now()}`;

    const newAttempt = {
      attemptId,
      participantId,
      roundId: 'ROUND_1',
      selectedQuestions,
      userAnswers: {},
      startedAt,
      endsAt,
      status: 'ACTIVE',
      score: 0,
      correctAnswers: 0,
      participationStatus: 'active',
      gradingStatus: r1GradingStatus,
      qualificationStatus: 'not_applicable'
    };

    if (isDbConnected) {
      await QuizAttempt.create(newAttempt);
    } else {
      memoryStore.quizAttempts[participantId] = newAttempt;
    }

    await createAuditLog(participantId, 'PARTICIPANT', 'QUESTION_SET_GENERATED', attemptId, {
      count: requiredCount,
      gradingStatus: r1GradingStatus
    });

    // 6. Build SANITIZED participant payload (NO correctOption, NO explanation)
    const sanitizedQuestions = selectedBank.map((q, idx) => ({
      questionId: q.questionId,
      position: idx + 1,
      questionText: q.questionText,
      options: selectedQuestions[idx].options,
      marks: 1,
      questionNumber: idx + 1,
      totalQuestions: requiredCount
    }));

    res.json({
      success: true,
      attemptId,
      status: 'ACTIVE',
      gradingStatus: r1GradingStatus,
      participationStatus: 'active',
      userAnswers: {},
      startedAt,
      endsAt,
      questions: sanitizedQuestions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quiz/current', async (req, res) => {
  const { participantId } = req.query;
  if (!participantId) {
    return res.status(400).json({ success: false, message: 'Participant ID required.' });
  }

  try {
    let attempt = null;
    let activeQuestions = [];
    if (isDbConnected) {
      attempt = await QuizAttempt.findOne({ participantId });
      activeQuestions = await Question.find();
    } else {
      attempt = memoryStore.quizAttempts[participantId];
      activeQuestions = memoryStore.questions;
    }

    if (!attempt) {
      return res.json({ success: true, hasAttempt: false });
    }

    const sanitizedQuestions = attempt.selectedQuestions.map((sq, idx) => ({
      questionId: sq.questionId,
      position: idx + 1,
      questionText: (activeQuestions.find(q => q.questionId === sq.questionId || q.id === sq.questionId))?.questionText,
      options: sq.options,
      marks: 1,
      questionNumber: idx + 1,
      totalQuestions: attempt.selectedQuestions.length
    }));

    res.json({
      success: true,
      hasAttempt: true,
      attemptId: attempt.attemptId,
      status: attempt.status,
      gradingStatus: attempt.gradingStatus || 'graded',
      participationStatus: attempt.participationStatus || 'active',
      isNonGraded: attempt.gradingStatus === 'non_graded',
      userAnswers: attempt.userAnswers || {},
      score: attempt.status === 'SUBMITTED' ? attempt.score : undefined,
      startedAt: attempt.startedAt,
      endsAt: attempt.endsAt,
      questions: sanitizedQuestions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quiz/answer', async (req, res) => {
  const { participantId, questionId, selectedOption } = req.body;

  try {
    let attempt = null;
    if (isDbConnected) {
      attempt = await QuizAttempt.findOne({ participantId, status: 'ACTIVE' });
      if (attempt) {
        attempt.userAnswers.set(questionId, parseInt(selectedOption));
        await attempt.save();
      }
    } else {
      attempt = memoryStore.quizAttempts[participantId];
      if (attempt && attempt.status === 'ACTIVE') {
        attempt.userAnswers = attempt.userAnswers || {};
        attempt.userAnswers[questionId] = parseInt(selectedOption);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quiz/submit', async (req, res) => {
  const { participantId, userAnswers } = req.body;

  try {
    let attempt = null;
    if (isDbConnected) {
      attempt = await QuizAttempt.findOne({ participantId });
    } else {
      attempt = memoryStore.quizAttempts[participantId];
    }

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No active attempt found to submit.' });
    }

    // Idempotent: if already submitted, return stored result
    if (attempt.status === 'SUBMITTED') {
      return res.json({
        success: true,
        message: 'Quiz already submitted.',
        score: attempt.score,
        correctAnswers: attempt.correctAnswers || attempt.score,
        gradingStatus: attempt.gradingStatus || 'graded',
        total: attempt.selectedQuestions?.length || 0
      });
    }

    const answersToEvaluate = userAnswers ||
      (attempt.userAnswers instanceof Map ? Object.fromEntries(attempt.userAnswers) : attempt.userAnswers) ||
      {};

    let score = 0;
    let correctAnswers = 0;
    attempt.selectedQuestions.forEach(sq => {
      const selected = answersToEvaluate[sq.questionId];
      if (selected !== undefined && parseInt(selected) === sq.correctOptionIndex) {
        score += 1;
        correctAnswers += 1;
      }
    });

    const submittedAt = new Date();
    const gradingStatus = attempt.gradingStatus || 'graded';

    if (isDbConnected) {
      attempt.status = 'SUBMITTED';
      attempt.score = score;
      attempt.correctAnswers = correctAnswers;
      attempt.submittedAt = submittedAt;
      attempt.participationStatus = 'completed';
      attempt.userAnswers = answersToEvaluate;
      await attempt.save();
    } else {
      attempt.status = 'SUBMITTED';
      attempt.score = score;
      attempt.correctAnswers = correctAnswers;
      attempt.submittedAt = submittedAt;
      attempt.participationStatus = 'completed';
      attempt.userAnswers = answersToEvaluate;
    }

    await createAuditLog(participantId, 'PARTICIPANT', 'QUIZ_SUBMITTED', attempt.attemptId, {
      score,
      correctAnswers,
      total: attempt.selectedQuestions.length,
      gradingStatus
    });
    io.emit('submission:updated', { participantId, round: 1, score, gradingStatus });

    // Live Calculation Update
    try {
      const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
      io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });
    } catch (e) {
      console.warn('Leaderboard recomputation error on quiz submit:', e.message);
    }

    res.json({
      success: true,
      message: 'Quiz submitted successfully.',
      score,
      correctAnswers,
      total: attempt.selectedQuestions.length,
      gradingStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND 2 — DEBUG PROBLEM BANK MANAGEMENT (ADMIN / COORD)
// ----------------------------------------------------

app.get('/api/admin/debug-problems', async (req, res) => {
  const { language, difficulty, status, search } = req.query;

  try {
    let list = [];
    if (isDbConnected) {
      list = await DebugProblem.find();
    } else {
      list = memoryStore.debugProblems;
    }

    let filtered = list;
    if (language && language !== 'ALL') {
      filtered = filtered.filter(p => p.language.toLowerCase() === language.toLowerCase());
    }
    if (difficulty && difficulty !== 'ALL') {
      filtered = filtered.filter(p => p.difficulty.toUpperCase() === difficulty.toUpperCase());
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter(p => p.status?.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const qLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(qLower) || 
        p.description.toLowerCase().includes(qLower)
      );
    }

    res.json({ success: true, totalCount: list.length, problems: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/debug-problems', async (req, res) => {
  const { title, description, language, difficulty, brokenCode, expectedOutput, solutionSnippet, marks, category, tags, status, createdBy } = req.body;

  if (!title || !description || !brokenCode || !expectedOutput) {
    return res.status(400).json({ success: false, message: 'Title, description, broken code, and expected output are required.' });
  }

  try {
    let allProblems = [];
    if (isDbConnected) {
      allProblems = await DebugProblem.find();
    } else {
      allProblems = memoryStore.debugProblems;
    }

    const problemId = allProblems.length > 0 ? Math.max(...allProblems.map(p => p.problemId || p.id || 0)) + 1 : 1;
    const isDuplicate = allProblems.some(p => p.title.trim().toLowerCase() === title.trim().toLowerCase());
    let warning = isDuplicate ? 'Warning: A debug problem with an identical title already exists.' : null;

    const newProblem = {
      problemId,
      id: problemId,
      title,
      description,
      language,
      difficulty: difficulty?.toUpperCase(),
      brokenCode,
      expectedOutput,
      solutionSnippet,
      marks: marks ? parseInt(marks) : 10,
      category,
      tags: tags || [],
      status,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDbConnected) {
      await DebugProblem.create(newProblem);
    } else {
      memoryStore.debugProblems.push(newProblem);
    }

    await createAuditLog(createdBy, 'ADMIN', 'DEBUG_PROBLEM_CREATED', problemId, { title });
    res.json({ success: true, problem: newProblem, warning });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/debug-problems/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    updates.updatedAt = new Date();
    let updated = null;

    if (isDbConnected) {
      updated = await DebugProblem.findOneAndUpdate(
        { $or: [{ problemId: parseInt(id) }, { id: parseInt(id) }] },
        updates,
        { new: true }
      );
    } else {
      const idx = memoryStore.debugProblems.findIndex(p => p.problemId === parseInt(id) || p.id === parseInt(id));
      if (idx >= 0) {
        memoryStore.debugProblems[idx] = { ...memoryStore.debugProblems[idx], ...updates };
        updated = memoryStore.debugProblems[idx];
      }
    }

    await createAuditLog(updates.updatedBy, 'ADMIN', 'DEBUG_PROBLEM_UPDATED', id);
    res.json({ success: true, problem: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/debug-problems/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected) {
      await DebugProblem.deleteOne({ $or: [{ problemId: parseInt(id) }, { id: parseInt(id) }] });
    } else {
      memoryStore.debugProblems = memoryStore.debugProblems.filter(p => p.problemId !== parseInt(id) && p.id !== parseInt(id));
    }
    await createAuditLog('ADMIN', 'ADMIN', 'DEBUG_PROBLEM_DELETED', id);
    res.json({ success: true, message: `Debug problem ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/debug-problems/import', async (req, res) => {
  const { problemsList, importedBy } = req.body;
  if (!Array.isArray(problemsList)) return res.status(400).json({ success: false, message: 'Array expected.' });

  try {
    let count = 0;
    for (const p of problemsList) {
      if (!p.title || !p.brokenCode) continue;
      const pId = p.problemId || p.id || (count + 1);

      const formatted = {
        problemId: parseInt(pId),
        id: parseInt(pId),
        title: p.title,
        description: p.description,
        language: p.language,
        difficulty: p.difficulty?.toUpperCase(),
        brokenCode: p.brokenCode,
        expectedOutput: p.expectedOutput,
        solutionSnippet: p.solutionSnippet,
        marks: p.marks ? parseInt(p.marks) : 10,
        category: p.category,
        tags: p.tags || [],
        status: p.status,
        createdBy: importedBy,
        updatedBy: importedBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isDbConnected) {
        await DebugProblem.updateOne({ problemId: parseInt(pId) }, formatted, { upsert: true });
      } else {
        const idx = memoryStore.debugProblems.findIndex(item => item.problemId === parseInt(pId));
        if (idx >= 0) memoryStore.debugProblems[idx] = formatted;
        else memoryStore.debugProblems.push(formatted);
      }
      count++;
    }

    res.json({ success: true, importedCount: count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/debug-problems/export', async (req, res) => {
  try {
    let list = [];
    if (isDbConnected) list = await DebugProblem.find();
    else list = memoryStore.debugProblems;
    res.json({ success: true, problems: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND 2 — PARTICIPANT DEBUG ENGINE
// ----------------------------------------------------

app.post('/api/debug/start', async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json({ success: false, message: 'Participant ID required.' });

  try {
    const state = await getEventState();
    if (!['ROUND_2_RUNNING', 'ROUND_2_ACTIVE'].includes(state.status)) {
      return res.status(403).json({
        success: false,
        message: 'Round 2 is currently locked. It will activate when the coordinator initiates Round 2.'
      });
    }

    // ── PARTICIPATION vs GRADING SEPARATION ──────────────────────────────────
    // ALL registered participants can enter Round 2 (participation = eligible for everyone).
    // Only participants in the official graded cohort (top X% from R1) have graded=true.
    // Non-graded participants can still attempt all problems; their result is stored
    // but excluded from the official leaderboard and qualification.
    const { gradedR2Set } = await computeLeaderboardData();
    // Determine this participant's R2 grading status:
    // If gradedR2Set is empty (no R1 data yet) → treat as graded (open access mode)
    // If gradedR2Set is populated  → check membership
    const r2GradingStatus = (gradedR2Set.size === 0 || gradedR2Set.has(participantId)) ? 'graded' : 'non_graded';

    let activeProblems = [];
    if (isDbConnected) activeProblems = await DebugProblem.find({ status: 'ACTIVE' });
    else activeProblems = memoryStore.debugProblems.filter(p => p.status === 'ACTIVE');

    if (activeProblems.length < 3) {
      return res.status(400).json({
        success: false,
        message: `Insufficient active debug problems available for this round. Required: 3, Active: ${activeProblems.length}`
      });
    }

    let existingAttempt = null;
    if (isDbConnected) existingAttempt = await DebugAttempt.findOne({ participantId });
    else existingAttempt = memoryStore.debugAttempts[participantId];

    let selectedProblems = [];
    if (existingAttempt) {
      selectedProblems = activeProblems.filter(p => existingAttempt.selectedProblemIds.includes(p.problemId || p.id));
    } else {
      // Pick 3 problems: 1 C problem, 1 Python problem, 1 Java problem (3 Questions x 10 Marks = 30 Marks)
      const cProbs = secureShuffle(activeProblems.filter(p => p.language?.toUpperCase() === 'C' && !p.isBonus));
      const pyProbs = secureShuffle(activeProblems.filter(p => p.language?.toUpperCase() === 'PYTHON' && !p.isBonus));
      const javaProbs = secureShuffle(activeProblems.filter(p => p.language?.toUpperCase() === 'JAVA' && !p.isBonus));

      const picked = [];
      if (cProbs.length > 0) picked.push(cProbs[0]);
      if (pyProbs.length > 0) picked.push(pyProbs[0]);
      if (javaProbs.length > 0) picked.push(javaProbs[0]);

      // Fallback if specific languages missing to guarantee exactly 3 questions
      if (picked.length < 3) {
        const remaining = secureShuffle(activeProblems.filter(p => !picked.includes(p) && !p.isBonus));
        picked.push(...remaining.slice(0, 3 - picked.length));
      }

      const selectedIds = picked.map(p => p.problemId || p.id);
      const attemptId = `ATT2-${participantId}-${Date.now()}`;
      const startedAt = new Date();
      const dMin = state.round2DurationMinutes || 15;
      const endsAt = state.roundEndsAt ? new Date(state.roundEndsAt) : new Date(startedAt.getTime() + dMin * 60 * 1000);

      const newAttempt = {
        attemptId,
        participantId,
        roundId: 'ROUND_2',
        selectedProblemIds: selectedIds,
        startedAt,
        endsAt,
        status: 'ACTIVE',
        // ── GRADING STATUS assigned here server-side (cannot be overridden by client) ──
        participationStatus: 'active',
        gradingStatus: r2GradingStatus,
        qualificationStatus: 'not_applicable'
      };

      if (isDbConnected) await DebugAttempt.create(newAttempt);
      else memoryStore.debugAttempts[participantId] = newAttempt;

      selectedProblems = picked;
      await createAuditLog(participantId, 'PARTICIPANT', 'ROUND2_STARTED', newAttempt.attemptId, {
        gradingStatus: r2GradingStatus
      });
      existingAttempt = newAttempt;
    }

    // SANITIZE DEBUG PAYLOAD (Remove solutionSnippet)
    const sanitizedProblems = selectedProblems.map((p, idx) => ({
      problemId: p.problemId || p.id,
      title: p.title,
      description: p.description,
      language: p.language,
      brokenCode: p.brokenCode,
      expectedOutput: p.expectedOutput,
      marks: p.marks || 10,
      isBonus: false,
      problemNumber: idx + 1,
      totalProblems: selectedProblems.length
    }));

    res.json({
      success: true,
      problems: sanitizedProblems,
      startedAt: existingAttempt?.startedAt,
      endsAt: existingAttempt?.endsAt || (state.roundEndsAt ? state.roundEndsAt : null),
      gradingStatus: existingAttempt?.gradingStatus || r2GradingStatus,
      participationStatus: 'active',
      isNonGraded: (existingAttempt?.gradingStatus || r2GradingStatus) === 'non_graded'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/debug/current', async (req, res) => {
  const { participantId } = req.query;
  if (!participantId) return res.status(400).json({ success: false, message: 'Participant ID required.' });

  try {
    let attempt = null;
    let activeProblems = [];
    const state = await getEventState();

    if (isDbConnected) {
      attempt = await DebugAttempt.findOne({ participantId });
      activeProblems = await DebugProblem.find();
    } else {
      attempt = memoryStore.debugAttempts[participantId];
      activeProblems = memoryStore.debugProblems;
    }

    if (!attempt) return res.json({ success: true, hasAttempt: false });

    const selectedProblems = activeProblems.filter(p => attempt.selectedProblemIds.includes(p.problemId || p.id));
    const sanitizedProblems = selectedProblems.map((p, idx) => ({
      problemId: p.problemId || p.id,
      title: p.title,
      description: p.description,
      language: p.language,
      brokenCode: p.brokenCode,
      expectedOutput: p.expectedOutput,
      marks: p.marks || 10,
      problemNumber: idx + 1,
      totalProblems: selectedProblems.length
    }));

    let userSubmissions = [];
    if (isDbConnected) {
      userSubmissions = await Submission.find({ participantId, problemId: { $gt: 0 } });
    } else {
      userSubmissions = memoryStore.submissions.filter(s => s.participantId === participantId && s.problemId > 0);
    }

    const submissionsMap = {};
    userSubmissions.forEach(s => {
      submissionsMap[s.problemId] = {
        code: s.code,
        output: s.output,
        status: s.status,
        marks: s.marks || 0,
        verifiedBy: s.verifiedBy
      };
    });

    res.json({ 
      success: true, 
      hasAttempt: true, 
      startedAt: attempt.startedAt,
      endsAt: attempt.endsAt || (state.roundEndsAt ? state.roundEndsAt : null),
      gradingStatus: attempt.gradingStatus || 'graded',
      participationStatus: attempt.participationStatus || 'active',
      isNonGraded: attempt.gradingStatus === 'non_graded',
      problems: sanitizedProblems, 
      submissions: submissionsMap 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/debug/submit', async (req, res) => {
  const { participantId, problemId, code, output } = req.body;

  try {
    const record = {
      participantId,
      problemId: parseInt(problemId),
      code,
      output,
      status: 'SUBMITTED',
      verifiedBy: null,
      marks: 0
    };

    if (isDbConnected) {
      await Submission.findOneAndUpdate(
        { participantId, problemId: parseInt(problemId) },
        record,
        { upsert: true, new: true }
      );
    } else {
      const idx = memoryStore.submissions.findIndex(s => s.participantId === participantId && s.problemId === parseInt(problemId));
      if (idx >= 0) memoryStore.submissions[idx] = { ...memoryStore.submissions[idx], ...record };
      else memoryStore.submissions.push(record);
    }

    io.emit('submission:updated', record);
    res.json({ success: true, submission: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/coordinator/submissions', async (req, res) => {
  try {
    let list = [];
    if (isDbConnected) list = await Submission.find({ problemId: { $gt: 0 } });
    else list = memoryStore.submissions.filter(s => s.problemId > 0);
    res.json({ success: true, submissions: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/coordinator/verify', async (req, res) => {
  const { problemId, coordinatorId, pin, marks, participantId, rubricBreakdown } = req.body;

  try {
    let coordinator = null;
    if (isDbConnected) {
      coordinator = await User.findOne({ id: coordinatorId, role: 'COORDINATOR' });
    } else {
      coordinator = memoryStore.users.find(u => u.id === coordinatorId && u.role === 'COORDINATOR');
    }

    if (!coordinator) {
      return res.status(401).json({ success: false, message: 'Invalid Coordinator ID.' });
    }

    if (coordinator && coordinator.pin && pin && coordinator.pin !== pin) {
      return res.status(401).json({ success: false, message: 'Invalid Coordinator Authorization PIN.' });
    }

    const numericMarks = Number(parseFloat(marks ?? 0).toFixed(1));

    const update = {
      status: 'VERIFIED',
      verifiedBy: coordinatorId,
      marks: numericMarks,
      rubricBreakdown: rubricBreakdown || {},
      verifiedAt: new Date()
    };

    if (isDbConnected) {
      await Submission.findOneAndUpdate(
        { participantId, problemId: parseInt(problemId) },
        update,
        { upsert: true, new: true }
      );
    } else {
      const idx = memoryStore.submissions.findIndex(s => s.participantId === participantId && s.problemId === parseInt(problemId));
      if (idx >= 0) memoryStore.submissions[idx] = { ...memoryStore.submissions[idx], ...update };
      else memoryStore.submissions.push({ participantId, problemId: parseInt(problemId), ...update });
    }

    await createAuditLog(coordinatorId, 'COORDINATOR', 'DEBUG_SUBMISSION_VERIFIED', problemId, { participantId, marks: numericMarks, rubricBreakdown });
    io.emit('verification:updated', { participantId, problemId, ...update });

    // Live Calculation Update
    try {
      const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
      io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });
    } catch (e) {
      console.warn('Leaderboard recomputation error on coordinator verify:', e.message);
    }

    res.json({ success: true, message: 'Verification recorded successfully.', update });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND 3 — TECH HUNT CLUE BANK MANAGEMENT (ADMIN / COORD)
// ----------------------------------------------------

app.get('/api/admin/clues', async (req, res) => {
  const { station, category, status, search } = req.query;

  try {
    let list = [];
    if (isDbConnected) list = await TechClue.find();
    else list = memoryStore.techClues;

    let filtered = list;
    if (station && station !== 'ALL') {
      filtered = filtered.filter(c => String(c.station) === String(station));
    }
    if (category && category !== 'ALL') {
      filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter(c => c.status?.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const qLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(qLower) || 
        c.clueText.toLowerCase().includes(qLower)
      );
    }

    res.json({ success: true, totalCount: list.length, clues: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/clues', async (req, res) => {
  const { station, category, title, clueText, answer, hint, hintPenalty, marks, order, status, createdBy } = req.body;

  if (!station || !title || !clueText || !answer) {
    return res.status(400).json({ success: false, message: 'Station, title, clue text, and answer are required.' });
  }

  try {
    let allClues = [];
    if (isDbConnected) allClues = await TechClue.find();
    else allClues = memoryStore.techClues;

    const clueId = allClues.length > 0 ? Math.max(...allClues.map(c => c.clueId || c.id || 0)) + 1 : 1;
    const isDuplicate = allClues.some(c => c.clueText.trim().toLowerCase() === clueText.trim().toLowerCase());
    let warning = isDuplicate ? 'Warning: A clue with identical text already exists.' : null;

    const newClue = {
      clueId,
      id: clueId,
      station: parseInt(station),
      category,
      title,
      clueText,
      answer: String(answer).trim(),
      hint,
      hintPenalty: hintPenalty ? parseInt(hintPenalty) : 2,
      marks: marks ? parseInt(marks) : 10,
      order: order ? parseInt(order) : 1,
      status,
      createdBy,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isDbConnected) await TechClue.create(newClue);
    else memoryStore.techClues.push(newClue);

    await createAuditLog(createdBy, 'ADMIN', 'CLUE_CREATED', clueId, { title });
    res.json({ success: true, clue: newClue, warning });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/clues/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    updates.updatedAt = new Date();
    let updated = null;

    if (isDbConnected) {
      updated = await TechClue.findOneAndUpdate(
        { $or: [{ clueId: parseInt(id) }, { id: parseInt(id) }] },
        updates,
        { new: true }
      );
    } else {
      const idx = memoryStore.techClues.findIndex(c => c.clueId === parseInt(id) || c.id === parseInt(id));
      if (idx >= 0) {
        memoryStore.techClues[idx] = { ...memoryStore.techClues[idx], ...updates };
        updated = memoryStore.techClues[idx];
      }
    }

    await createAuditLog(updates.updatedBy, 'ADMIN', 'CLUE_UPDATED', id);
    res.json({ success: true, clue: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/clues/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected) {
      await TechClue.deleteOne({ $or: [{ clueId: parseInt(id) }, { id: parseInt(id) }] });
    } else {
      memoryStore.techClues = memoryStore.techClues.filter(c => c.clueId !== parseInt(id) && c.id !== parseInt(id));
    }
    await createAuditLog('ADMIN', 'ADMIN', 'CLUE_DELETED', id);
    res.json({ success: true, message: `Clue ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/clues/import', async (req, res) => {
  const { cluesList, importedBy } = req.body;
  if (!Array.isArray(cluesList)) return res.status(400).json({ success: false, message: 'Array expected.' });

  try {
    let count = 0;
    for (const c of cluesList) {
      if (!c.title || !c.clueText || !c.answer) continue;
      const cId = c.clueId || c.id || (count + 1);

      const formatted = {
        clueId: parseInt(cId),
        id: parseInt(cId),
        station: parseInt(c.station || 1),
        category: c.category,
        title: c.title,
        clueText: c.clueText,
        answer: String(c.answer).trim(),
        hint: c.hint,
        hintPenalty: c.hintPenalty ? parseInt(c.hintPenalty) : 2,
        marks: c.marks ? parseInt(c.marks) : 10,
        order: c.order ? parseInt(c.order) : 1,
        status: c.status,
        createdBy: importedBy,
        updatedBy: importedBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isDbConnected) {
        await TechClue.updateOne({ clueId: parseInt(cId) }, formatted, { upsert: true });
      } else {
        const idx = memoryStore.techClues.findIndex(item => item.clueId === parseInt(cId));
        if (idx >= 0) memoryStore.techClues[idx] = formatted;
        else memoryStore.techClues.push(formatted);
      }
      count++;
    }

    res.json({ success: true, importedCount: count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/clues/export', async (req, res) => {
  try {
    let list = [];
    if (isDbConnected) list = await TechClue.find();
    else list = memoryStore.techClues;
    res.json({ success: true, clues: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ROUND 3 — PARTICIPANT TECH HUNT ENGINE
// ----------------------------------------------------

app.post('/api/hunt/start', async (req, res) => {
  const { participantId } = req.body;
  if (!participantId) return res.status(400).json({ success: false, message: 'Participant ID required.' });

  try {
    const state = await getEventState();
    if (!['ROUND_3_RUNNING', 'ROUND_3_ACTIVE'].includes(state.status)) {
      return res.status(403).json({
        success: false,
        message: 'Round 3 is currently locked. It will activate when the coordinator initiates Round 3.'
      });
    }

    // ── PARTICIPATION vs GRADING SEPARATION ──────────────────────────────────
    // ALL registered participants can enter Round 3 (participation = eligible for everyone).
    // Only participants in the official graded cohort (top X% from R2 official leaderboard)
    // have gradingStatus = 'graded'. Non-graded participants can still attempt all clues.
    const { gradedR3Set } = await computeLeaderboardData();
    const r3GradingStatus = (gradedR3Set.size === 0 || gradedR3Set.has(participantId)) ? 'graded' : 'non_graded';

    let activeClues = [];
    if (isDbConnected) activeClues = await TechClue.find({ status: 'ACTIVE' }).sort({ station: 1, order: 1 });
    else activeClues = memoryStore.techClues.filter(c => c.status === 'ACTIVE').sort((a, b) => a.station - b.station);

    if (activeClues.length < 5) {
      return res.status(400).json({
        success: false,
        message: `Insufficient active clues available for this round. Required: 5, Active: ${activeClues.length}`
      });
    }

    let existingAttempt = null;
    if (isDbConnected) existingAttempt = await HuntAttempt.findOne({ participantId });
    else existingAttempt = memoryStore.huntAttempts[participantId];

    if (!existingAttempt) {
      const selectedClues = activeClues.slice(0, 5);
      const selectedIds = selectedClues.map(c => c.clueId || c.id);
      const attemptId = `ATT3-${participantId}-${Date.now()}`;
      const startedAt = new Date();
      const dMin = state.round3DurationMinutes || 15;
      const endsAt = state.roundEndsAt ? new Date(state.roundEndsAt) : new Date(startedAt.getTime() + dMin * 60 * 1000);

      existingAttempt = {
        attemptId,
        participantId,
        roundId: 'ROUND_3',
        selectedClueIds: selectedIds,
        currentClueIndex: 0,
        solvedClueIds: [],
        skippedClueIds: [],
        hintsUsed: {},
        answers: {},
        incorrectAttempts: {},
        score: 0,
        startedAt,
        endsAt,
        status: 'ACTIVE',
        // ── GRADING STATUS assigned here server-side (cannot be overridden by client) ──
        participationStatus: 'active',
        gradingStatus: r3GradingStatus,
        qualificationStatus: 'not_applicable'
      };

      if (isDbConnected) await HuntAttempt.create(existingAttempt);
      else memoryStore.huntAttempts[participantId] = existingAttempt;

      await createAuditLog(participantId, 'PARTICIPANT', 'ROUND3_STARTED', attemptId, {
        gradingStatus: r3GradingStatus
      });
    }

    const isCompleted = existingAttempt.status === 'COMPLETED' || existingAttempt.currentClueIndex >= existingAttempt.selectedClueIds.length;
    if (isCompleted) {
      return res.json({
        success: true,
        hasAttempt: true,
        isCompleted: true,
        currentStep: existingAttempt.selectedClueIds.length,
        totalSteps: existingAttempt.selectedClueIds.length,
        selectedClueIds: existingAttempt.selectedClueIds || [],
        solvedClueIds: existingAttempt.solvedClueIds || [],
        skippedClueIds: existingAttempt.skippedClueIds || [],
        score: existingAttempt.score,
        gradingStatus: existingAttempt.gradingStatus || r3GradingStatus,
        participationStatus: 'completed',
        isNonGraded: (existingAttempt.gradingStatus || r3GradingStatus) === 'non_graded',
        clue: null
      });
    }

    const currentClueId = existingAttempt.selectedClueIds[existingAttempt.currentClueIndex];
    const targetClue = activeClues.find(c => (c.clueId || c.id) === currentClueId);

    if (!targetClue) {
      return res.status(404).json({ success: false, message: 'Current clue station not found.' });
    }

    const hintsMap = existingAttempt.hintsUsed instanceof Map ? Object.fromEntries(existingAttempt.hintsUsed) : (existingAttempt.hintsUsed || {});

    // SANITIZE CLUE PAYLOAD (Never expose answer)
    res.json({
      success: true,
      hasAttempt: true,
      isCompleted: false,
      startedAt: existingAttempt.startedAt,
      endsAt: existingAttempt.endsAt || (state.roundEndsAt ? state.roundEndsAt : null),
      currentStep: existingAttempt.currentClueIndex + 1,
      totalSteps: existingAttempt.selectedClueIds.length,
      selectedClueIds: existingAttempt.selectedClueIds || [],
      solvedClueIds: existingAttempt.solvedClueIds || [],
      skippedClueIds: existingAttempt.skippedClueIds || [],
      score: existingAttempt.score,
      gradingStatus: existingAttempt.gradingStatus || r3GradingStatus,
      participationStatus: 'active',
      isNonGraded: (existingAttempt.gradingStatus || r3GradingStatus) === 'non_graded',
      clue: {
        clueId: targetClue.clueId || targetClue.id,
        station: targetClue.station,
        category: targetClue.category,
        title: targetClue.title,
        clueText: targetClue.clueText ?? targetClue.description,
        marks: targetClue.marks || 10,
        hasHint: Boolean(targetClue.hint),
        hint: hintsMap[targetClue.clueId || targetClue.id] ? targetClue.hint : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/hunt/current', async (req, res) => {
  const { participantId } = req.query;
  if (!participantId) return res.status(400).json({ success: false, message: 'Participant ID required.' });

  try {
    let attempt = null;
    let activeClues = [];
    const state = await getEventState();

    if (isDbConnected) {
      attempt = await HuntAttempt.findOne({ participantId });
      activeClues = await TechClue.find();
    } else {
      attempt = memoryStore.huntAttempts[participantId];
      activeClues = memoryStore.techClues;
    }

    if (!attempt) return res.json({ success: true, hasAttempt: false });

    const isCompleted = attempt.status === 'COMPLETED' || attempt.currentClueIndex >= attempt.selectedClueIds.length;
    if (isCompleted) {
      return res.json({
        success: true,
        hasAttempt: true,
        isCompleted: true,
        startedAt: attempt.startedAt,
        endsAt: attempt.endsAt || (state.roundEndsAt ? state.roundEndsAt : null),
        gradingStatus: attempt.gradingStatus || 'graded',
        participationStatus: attempt.participationStatus || 'completed',
        isNonGraded: attempt.gradingStatus === 'non_graded',
        currentStep: attempt.selectedClueIds.length,
        totalSteps: attempt.selectedClueIds.length,
        selectedClueIds: attempt.selectedClueIds || [],
        solvedClueIds: attempt.solvedClueIds || [],
        skippedClueIds: attempt.skippedClueIds || [],
        score: attempt.score,
        clue: null
      });
    }

    const currentClueId = attempt.selectedClueIds[attempt.currentClueIndex];
    const targetClue = activeClues.find(c => (c.clueId || c.id) === currentClueId);

    if (!targetClue) {
      return res.json({
        success: true,
        hasAttempt: true,
        isCompleted: true,
        startedAt: attempt.startedAt,
        endsAt: attempt.endsAt || (state.roundEndsAt ? state.roundEndsAt : null),
        gradingStatus: attempt.gradingStatus || 'graded',
        participationStatus: attempt.participationStatus || 'completed',
        isNonGraded: attempt.gradingStatus === 'non_graded',
        currentStep: attempt.selectedClueIds.length,
        totalSteps: attempt.selectedClueIds.length,
        selectedClueIds: attempt.selectedClueIds || [],
        solvedClueIds: attempt.solvedClueIds || [],
        skippedClueIds: attempt.skippedClueIds || [],
        score: attempt.score,
        clue: null
      });
    }

    const hintsMap = attempt.hintsUsed instanceof Map ? Object.fromEntries(attempt.hintsUsed) : (attempt.hintsUsed || {});

    res.json({
      success: true,
      hasAttempt: true,
      isCompleted: false,
      startedAt: attempt.startedAt,
      endsAt: attempt.endsAt || (state.roundEndsAt ? state.roundEndsAt : null),
      gradingStatus: attempt.gradingStatus || 'graded',
      participationStatus: attempt.participationStatus || 'active',
      isNonGraded: attempt.gradingStatus === 'non_graded',
      currentStep: attempt.currentClueIndex + 1,
      totalSteps: attempt.selectedClueIds.length,
      selectedClueIds: attempt.selectedClueIds || [],
      solvedClueIds: attempt.solvedClueIds || [],
      skippedClueIds: attempt.skippedClueIds || [],
      score: attempt.score,
      clue: {
        clueId: targetClue.clueId || targetClue.id,
        station: targetClue.station,
        category: targetClue.category,
        title: targetClue.title,
        clueText: targetClue.clueText ?? targetClue.description,
        marks: targetClue.marks || 10,
        hasHint: Boolean(targetClue.hint),
        hint: hintsMap[targetClue.clueId || targetClue.id] ? targetClue.hint : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hunt/:clueId/answer', async (req, res) => {
  const { clueId } = req.params;
  const { participantId, answer } = req.body;
  const cIdNum = parseInt(clueId);

  if (!participantId) {
    return res.status(400).json({ success: false, message: 'Participant ID required.' });
  }

  try {
    let clue = null;
    let attempt = null;

    if (isDbConnected) {
      clue = await TechClue.findOne({ $or: [{ clueId: cIdNum }, { id: cIdNum }] });
      attempt = await HuntAttempt.findOne({ participantId });
    } else {
      clue = memoryStore.techClues.find(c => c.clueId === cIdNum || c.id === cIdNum);
      attempt = memoryStore.huntAttempts[participantId];
    }

    if (!clue || !attempt) {
      return res.status(404).json({ success: false, message: 'Clue or attempt not found.' });
    }

    if (attempt.status === 'COMPLETED' || attempt.currentClueIndex >= attempt.selectedClueIds.length) {
      return res.status(400).json({ success: false, message: 'Round 3 hunt is already completed.' });
    }

    // Security check: Participant cannot answer questions other than their currently active station!
    const activeClueId = attempt.selectedClueIds[attempt.currentClueIndex];
    if (activeClueId !== cIdNum) {
      return res.status(403).json({
        success: false,
        message: 'This station is not your currently active clue.'
      });
    }

    // Prevent re-answering already solved or skipped clues
    if (attempt.solvedClueIds && attempt.solvedClueIds.includes(cIdNum)) {
      return res.status(400).json({ success: false, message: 'This clue has already been solved.' });
    }
    if (attempt.skippedClueIds && attempt.skippedClueIds.includes(cIdNum)) {
      return res.status(400).json({ success: false, message: 'This clue has already been skipped.' });
    }

    const isCorrect = answer && String(answer).trim().toUpperCase() === String(clue.answer).trim().toUpperCase();

    if (isCorrect) {
      if (!attempt.solvedClueIds) attempt.solvedClueIds = [];
      attempt.solvedClueIds.push(cIdNum);

      // Record answer
      if (isDbConnected && attempt.answers instanceof Map) {
        attempt.answers.set(String(cIdNum), String(answer).trim());
      } else {
        attempt.answers = attempt.answers || {};
        attempt.answers[cIdNum] = String(answer).trim();
      }

      const hintsMap = attempt.hintsUsed instanceof Map ? Object.fromEntries(attempt.hintsUsed) : (attempt.hintsUsed || {});
      const hintPenalty = hintsMap[cIdNum] ? (clue.hintPenalty || 2) : 0;
      const awardedMarks = Math.max(0, (clue.marks || 10) - hintPenalty);
      attempt.score += awardedMarks;

      if (attempt.currentClueIndex + 1 >= attempt.selectedClueIds.length) {
        attempt.status = 'COMPLETED';
        attempt.participationStatus = 'completed';
      } else {
        attempt.currentClueIndex += 1;
      }

      if (isDbConnected) {
        await attempt.save();
      }

      await createAuditLog(participantId, 'PARTICIPANT', 'ROUND3_CLUE_SOLVED', attempt.attemptId, {
        clueId: cIdNum,
        score: attempt.score,
        isCompleted: attempt.status === 'COMPLETED'
      });

      io.emit('hunt:updated', { participantId, clueId: cIdNum, score: attempt.score, isCompleted: attempt.status === 'COMPLETED' });

      // Live Calculation Update
      try {
        const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
        io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });
      } catch (e) {
        console.warn('Leaderboard recomputation error on hunt answer:', e.message);
      }

      return res.json({
        success: true,
        correct: true,
        score: attempt.score,
        currentStep: attempt.currentClueIndex + 1,
        totalSteps: attempt.selectedClueIds.length,
        solvedClueIds: attempt.solvedClueIds || [],
        skippedClueIds: attempt.skippedClueIds || [],
        isCompleted: attempt.status === 'COMPLETED'
      });
    }

    // INCORRECT ANSWER:
    // Do NOT block participant. Record incorrect attempt and keep clue available for retry or skip.
    if (isDbConnected && attempt.incorrectAttempts instanceof Map) {
      const prevCount = attempt.incorrectAttempts.get(String(cIdNum)) || 0;
      attempt.incorrectAttempts.set(String(cIdNum), prevCount + 1);
      await attempt.save();
    } else {
      attempt.incorrectAttempts = attempt.incorrectAttempts || {};
      attempt.incorrectAttempts[cIdNum] = (attempt.incorrectAttempts[cIdNum] || 0) + 1;
    }

    await createAuditLog(participantId, 'PARTICIPANT', 'ROUND3_INCORRECT_ATTEMPT', attempt.attemptId, {
      clueId: cIdNum,
      attemptedAnswer: String(answer).trim().slice(0, 100)
    });

    res.json({
      success: true,
      correct: false,
      message: 'Incorrect answer. You can re-examine the station clue and try again, or skip to move to the next station.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Round 3 Skip / Pass Mechanism
app.post('/api/hunt/:clueId/skip', async (req, res) => {
  const { clueId } = req.params;
  const { participantId } = req.body;
  const cIdNum = parseInt(clueId);

  if (!participantId) {
    return res.status(400).json({ success: false, message: 'Participant ID required.' });
  }

  try {
    let clue = null;
    let attempt = null;

    if (isDbConnected) {
      clue = await TechClue.findOne({ $or: [{ clueId: cIdNum }, { id: cIdNum }] });
      attempt = await HuntAttempt.findOne({ participantId });
    } else {
      clue = memoryStore.techClues.find(c => c.clueId === cIdNum || c.id === cIdNum);
      attempt = memoryStore.huntAttempts[participantId];
    }

    if (!clue || !attempt) {
      return res.status(404).json({ success: false, message: 'Clue or attempt not found.' });
    }

    if (attempt.status === 'COMPLETED' || attempt.currentClueIndex >= attempt.selectedClueIds.length) {
      return res.status(400).json({ success: false, message: 'Round 3 hunt is already completed.' });
    }

    // Security check: Participant cannot skip questions other than their currently active station!
    const activeClueId = attempt.selectedClueIds[attempt.currentClueIndex];
    if (activeClueId !== cIdNum) {
      return res.status(403).json({
        success: false,
        message: 'This station is not your currently active clue.'
      });
    }

    // Prevent skipping an already solved clue
    if (attempt.solvedClueIds && attempt.solvedClueIds.includes(cIdNum)) {
      return res.status(400).json({ success: false, message: 'Cannot skip an already solved clue.' });
    }

    // Record as skipped (no duplicate entries)
    if (!attempt.skippedClueIds) attempt.skippedClueIds = [];
    if (!attempt.skippedClueIds.includes(cIdNum)) {
      attempt.skippedClueIds.push(cIdNum);
    }

    // Record answer in attempts as skipped
    if (isDbConnected && attempt.answers instanceof Map) {
      attempt.answers.set(String(cIdNum), '[SKIPPED]');
    } else {
      attempt.answers = attempt.answers || {};
      attempt.answers[cIdNum] = '[SKIPPED]';
    }

    // Progression:
    // Skipping does NOT award points (score remains unchanged).
    if (attempt.currentClueIndex + 1 >= attempt.selectedClueIds.length) {
      attempt.status = 'COMPLETED';
      attempt.participationStatus = 'completed';
    } else {
      attempt.currentClueIndex += 1;
    }

    if (isDbConnected) {
      await attempt.save();
    }

    await createAuditLog(participantId, 'PARTICIPANT', 'ROUND3_CLUE_SKIPPED', attempt.attemptId, {
      clueId: cIdNum,
      score: attempt.score,
      isCompleted: attempt.status === 'COMPLETED'
    });

    io.emit('hunt:updated', { participantId, clueId: cIdNum, score: attempt.score, isCompleted: attempt.status === 'COMPLETED' });

    // Live Calculation Update
    try {
      const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
      io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });
    } catch (e) {
      console.warn('Leaderboard recomputation error on hunt skip:', e.message);
    }

    return res.json({
      success: true,
      skipped: true,
      score: attempt.score,
      currentStep: attempt.currentClueIndex + 1,
      totalSteps: attempt.selectedClueIds.length,
      solvedClueIds: attempt.solvedClueIds || [],
      skippedClueIds: attempt.skippedClueIds || [],
      isCompleted: attempt.status === 'COMPLETED',
      message: 'Station skipped. Advancing to next clue.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hunt/:clueId/hint', async (req, res) => {
  const { clueId } = req.params;
  const { participantId } = req.body;
  const cIdNum = parseInt(clueId);

  try {
    let clue = null;
    let attempt = null;

    if (isDbConnected) {
      clue = await TechClue.findOne({ $or: [{ clueId: cIdNum }, { id: cIdNum }] });
      attempt = await HuntAttempt.findOne({ participantId });
    } else {
      clue = memoryStore.techClues.find(c => c.clueId === cIdNum || c.id === cIdNum);
      attempt = memoryStore.huntAttempts[participantId];
    }

    if (!clue || !attempt) return res.status(404).json({ success: false, message: 'Clue or attempt not found.' });

    // Validate active station
    const activeClueId = attempt.selectedClueIds[attempt.currentClueIndex];
    if (activeClueId !== cIdNum) {
      return res.status(403).json({ success: false, message: 'Clue is not your active station.' });
    }

    if (isDbConnected) {
      attempt.hintsUsed.set(String(cIdNum), true);
      await attempt.save();
    } else {
      attempt.hintsUsed = attempt.hintsUsed || {};
      attempt.hintsUsed[cIdNum] = true;
    }

    res.json({ success: true, hint: clue.hint });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// ANNOUNCEMENTS & AUDIT LOGS
// ----------------------------------------------------

app.get('/api/announcements', async (req, res) => {
  try {
    let list = [];
    if (isDbConnected) list = await Announcement.find();
    else list = memoryStore.announcements;
    res.json({ success: true, announcements: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, message, tag } = req.body;
  try {
    let count = 0;
    if (isDbConnected) count = await Announcement.countDocuments();
    else count = memoryStore.announcements.length;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const newA = { 
      id: count + 1, 
      title, 
      message, 
      tag, 
      time: timeStr,
      createdAt: now.toISOString()
    };

    if (isDbConnected) await Announcement.create(newA);
    else memoryStore.announcements.unshift(newA);

    io.emit('announcement:added', newA);
    res.json({ success: true, announcement: newA });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Coordinator Manual Override for Graded / Non-Graded status
app.post('/api/coordinator/participant-grading-override', async (req, res) => {
  const { participantId, round, status } = req.body; // status: 'graded' | 'non_graded' | 'auto'
  if (!participantId || !round) {
    return res.status(400).json({ success: false, message: 'participantId and round are required.' });
  }
  try {
    const roundKey = (round === 2 || round === '2' || round === 'round2') ? 'round2' : 'round3';
    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ id: participantId });
      if (user) {
        if (!user.manualGradingOverrides) user.manualGradingOverrides = {};
        if (status === 'auto') {
          delete user.manualGradingOverrides[roundKey];
        } else {
          user.manualGradingOverrides[roundKey] = status;
        }
        user.markModified('manualGradingOverrides');
        await user.save();
      }
    } else {
      user = memoryStore.users.find(u => u.id === participantId);
      if (user) {
        if (!user.manualGradingOverrides) user.manualGradingOverrides = {};
        if (status === 'auto') {
          delete user.manualGradingOverrides[roundKey];
        } else {
          user.manualGradingOverrides[roundKey] = status;
        }
      }
    }

    // Recompute leaderboard and broadcast updated cohorts
    const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
    io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });

    res.json({ success: true, message: `Updated Round ${roundKey} grading override for ${participantId} to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/anticheat/logs', async (req, res) => {
  try {
    let list = [];
    if (isDbConnected) list = await AntiCheatLog.find();
    else list = memoryStore.antiCheatLogs;
    res.json({ success: true, logs: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/anticheat/log', async (req, res) => {
  const { participantId, type, message } = req.body;
  try {
    let count = 0;
    if (isDbConnected) count = await AntiCheatLog.countDocuments();
    else count = memoryStore.antiCheatLogs.length;

    const log = {
      id: count + 1,
      participantId,
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };

    if (isDbConnected) await AntiCheatLog.create(log);
    else memoryStore.antiCheatLogs.push(log);

    io.emit('anticheat:flag', log);
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/anticheat/disqualify', async (req, res) => {
  const { participantId, round, reason } = req.body;
  try {
    const timestamp = new Date();
    const log = {
      participantId,
      type: 'DISQUALIFIED_MALPRACTICE',
      message: reason || `Participant disqualified from round ${round || 'ALL'} due to 3 anti-cheat violations`,
      timestamp: timestamp.toLocaleTimeString()
    };

    if (isDbConnected) {
      await AntiCheatLog.create(log);
      await User.findOneAndUpdate({ id: participantId }, { accountStatus: 'DISQUALIFIED' });
      if (round === 1 || round === '1' || round === 'ROUND_1') {
        await QuizAttempt.findOneAndUpdate({ participantId }, { status: 'DISQUALIFIED', participationStatus: 'disqualified' });
      } else if (round === 2 || round === '2' || round === 'ROUND_2') {
        await DebugAttempt.findOneAndUpdate({ participantId }, { status: 'DISQUALIFIED', participationStatus: 'disqualified' });
      } else if (round === 3 || round === '3' || round === 'ROUND_3') {
        await HuntAttempt.findOneAndUpdate({ participantId }, { status: 'DISQUALIFIED', participationStatus: 'disqualified' });
      } else {
        await QuizAttempt.findOneAndUpdate({ participantId }, { status: 'DISQUALIFIED', participationStatus: 'disqualified' });
        await DebugAttempt.findOneAndUpdate({ participantId }, { status: 'DISQUALIFIED', participationStatus: 'disqualified' });
        await HuntAttempt.findOneAndUpdate({ participantId }, { status: 'DISQUALIFIED', participationStatus: 'disqualified' });
      }
    } else {
      memoryStore.antiCheatLogs.push({ id: memoryStore.antiCheatLogs.length + 1, ...log });
      const u = memoryStore.users.find(usr => usr.id === participantId);
      if (u) u.accountStatus = 'DISQUALIFIED';
      if (memoryStore.quizAttempts[participantId]) {
        memoryStore.quizAttempts[participantId].status = 'DISQUALIFIED';
        memoryStore.quizAttempts[participantId].participationStatus = 'disqualified';
      }
      if (memoryStore.debugAttempts[participantId]) {
        memoryStore.debugAttempts[participantId].status = 'DISQUALIFIED';
        memoryStore.debugAttempts[participantId].participationStatus = 'disqualified';
      }
      if (memoryStore.huntAttempts[participantId]) {
        memoryStore.huntAttempts[participantId].status = 'DISQUALIFIED';
        memoryStore.huntAttempts[participantId].participationStatus = 'disqualified';
      }
    }

    io.emit('anticheat:flag', log);
    io.emit('participant:disqualified', { participantId, round, reason });
    res.json({ success: true, message: `Participant ${participantId} disqualified and frozen.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Re-instate participant after disqualification (Coordinator / Admin)
app.post('/api/anticheat/reinstate', async (req, res) => {
  const { participantId, coordinatorId } = req.body;
  if (!participantId) {
    return res.status(400).json({ success: false, message: 'Participant ID is required.' });
  }
  try {
    if (isDbConnected) {
      await User.findOneAndUpdate({ id: participantId }, { accountStatus: 'ACTIVE' });
      await QuizAttempt.findOneAndUpdate({ participantId, status: 'DISQUALIFIED' }, { status: 'ACTIVE', participationStatus: 'active' });
      await DebugAttempt.findOneAndUpdate({ participantId, status: 'DISQUALIFIED' }, { status: 'ACTIVE', participationStatus: 'active' });
      await HuntAttempt.findOneAndUpdate({ participantId, status: 'DISQUALIFIED' }, { status: 'ACTIVE', participationStatus: 'active' });
    } else {
      const u = memoryStore.users.find(usr => usr.id === participantId);
      if (u) u.accountStatus = 'ACTIVE';
      if (memoryStore.quizAttempts[participantId] && memoryStore.quizAttempts[participantId].status === 'DISQUALIFIED') {
        memoryStore.quizAttempts[participantId].status = 'ACTIVE';
        memoryStore.quizAttempts[participantId].participationStatus = 'active';
      }
      if (memoryStore.debugAttempts[participantId] && memoryStore.debugAttempts[participantId].status === 'DISQUALIFIED') {
        memoryStore.debugAttempts[participantId].status = 'ACTIVE';
        memoryStore.debugAttempts[participantId].participationStatus = 'active';
      }
      if (memoryStore.huntAttempts[participantId] && memoryStore.huntAttempts[participantId].status === 'DISQUALIFIED') {
        memoryStore.huntAttempts[participantId].status = 'ACTIVE';
        memoryStore.huntAttempts[participantId].participationStatus = 'active';
      }
    }

    const log = {
      participantId,
      type: 'REINSTATED',
      message: `Participant reinstated by ${coordinatorId || 'Coordinator'}.`,
      timestamp: new Date().toLocaleTimeString()
    };
    if (isDbConnected) await AntiCheatLog.create(log);
    else memoryStore.antiCheatLogs.push({ id: memoryStore.antiCheatLogs.length + 1, ...log });

    io.emit('participant:reinstated', { participantId, coordinatorId });
    io.emit('anticheat:flag', log);

    // Refresh standings
    try {
      const { formattedLeaderboard, qualifySettings } = await computeLeaderboardData();
      io.emit('leaderboard:updated', { leaderboard: formattedLeaderboard, qualifySettings });
    } catch (e) {}

    res.json({ success: true, message: `Participant ${participantId} has been successfully reinstated.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Coordinator malpractice records & participant anti-cheat status list
app.get('/api/coordinator/malpractice-records', async (req, res) => {
  try {
    let participants = [];
    let antiCheatLogs = [];
    if (isDbConnected) {
      participants = await User.find({ role: 'PARTICIPANT' });
      antiCheatLogs = await AntiCheatLog.find().sort({ createdAt: -1 });
    } else {
      participants = memoryStore.users.filter(u => u.role === 'PARTICIPANT');
      antiCheatLogs = [...memoryStore.antiCheatLogs].reverse();
    }

    const records = participants.map(p => {
      const logs = antiCheatLogs.filter(l => l.participantId === p.id);
      const isDisqualified = p.accountStatus === 'DISQUALIFIED';
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        college: p.college,
        department: p.department,
        assignedRound: p.assignedRound,
        assignedCoordinator: p.assignedCoordinator,
        accountStatus: p.accountStatus,
        isDisqualified,
        warningCount: logs.length,
        violations: logs.slice(0, 5)
      };
    });

    res.json({ success: true, total: records.length, records, logs: antiCheatLogs.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    let logs = [];
    if (isDbConnected) logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    else logs = memoryStore.auditLogs.slice(0, 100);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
  getEventState().then(state => socket.emit('eventState:updated', state));
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT ?? 5000;
server.listen(PORT, () => {
  console.log(`TECHNOVA Data Server running on port ${PORT}`);
});
