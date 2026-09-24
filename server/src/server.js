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

// In-Memory Fallback Data Store (Initialized empty)
const memoryStore = {
  eventState: {
    status: 'REGISTRATION', // REGISTRATION | ROUND_1_READY | ROUND_1_RUNNING | ROUND_1_ENDED | ROUND_2_READY | ROUND_2_RUNNING | ROUND_2_ENDED | ROUND_3_READY | ROUND_3_RUNNING | COMPLETED
    round1MaxQuestions: 20,
    round1DurationMinutes: 20,
    round1QualifyCount: 30,
    round2QualifyCount: 10,
    round3StationCount: 5,
    registrationCount: 0,
    activeRound: 1,
    colleges: []
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
    round1DurationMinutes: 20,
    round1QualifyCount: 30,
    round2QualifyCount: 10,
    round3StationCount: 5,
    registrationCount: 0,
    activeRound: 1,
    colleges: []
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
      await EventState.updateMany({}, { registrationCount: 0, status: 'REGISTRATION', activeRound: 1, colleges: [] });
    }
    res.json({ success: true, message: 'All in-memory state and database collections purged successfully.' });
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

const JWT_SECRET = process.env.JWT_SECRET;

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
  const newSettings = req.body;
  try {
    let updatedState = null;
    if (isDbConnected) {
      updatedState = await EventState.findOneAndUpdate({}, newSettings, { new: true, upsert: true });
    } else {
      memoryStore.eventState = { ...memoryStore.eventState, ...newSettings };
      updatedState = memoryStore.eventState;
    }
    io.emit('eventState:updated', updatedState);
    res.json({ success: true, eventState: updatedState });
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

app.get('/api/leaderboard', async (req, res) => {
  try {
    let participants = [];
    let quizAttemptsList = [];
    let submissions = [];
    let huntAttemptsList = [];

    if (isDbConnected) {
      participants = await User.find({ role: 'PARTICIPANT' });
      quizAttemptsList = await QuizAttempt.find({ status: 'SUBMITTED' });
      submissions = await Submission.find({ status: 'VERIFIED' });
      huntAttemptsList = await HuntAttempt.find();
    } else {
      participants = memoryStore.users.filter(u => u.role === 'PARTICIPANT');
      quizAttemptsList = Object.values(memoryStore.quizAttempts).filter(a => a.status === 'SUBMITTED');
      submissions = memoryStore.submissions.filter(s => s.status === 'VERIFIED');
      huntAttemptsList = Object.values(memoryStore.huntAttempts);
    }

    const board = participants.map(p => {
      const qAttempt = quizAttemptsList.find(a => a.participantId === p.id);
      const r2Subs = submissions.filter(s => s.participantId === p.id);
      const hAttempt = huntAttemptsList.find(a => a.participantId === p.id);

      const r1Score = qAttempt ? qAttempt.score : 0;
      const r2Score = r2Subs.reduce((acc, curr) => acc + (curr.marks || 0), 0);
      const r3Score = hAttempt ? hAttempt.score : 0;
      const total = r1Score + r2Score + r3Score;

      return {
        id: p.id,
        name: p.name,
        college: p.college,
        r1: r1Score,
        r2: r2Score,
        r3: r3Score,
        total,
        flags: 0,
        status: total > 0 ? 'Qualified' : 'Registered'
      };
    });

    board.sort((a, b) => b.total - a.total);
    const rankedBoard = board.map((item, idx) => ({ ...item, rank: idx + 1 }));

    res.json({ success: true, leaderboard: rankedBoard });
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

    // 3. Check for existing attempt (Persistence check)
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
        userAnswers: existingAttempt.userAnswers || {},
        startedAt: existingAttempt.startedAt,
        endsAt: existingAttempt.endsAt,
        questions: sanitizedQuestions
      });
    }

    // 4. Perform SERVER-SIDE secure random selection & option shuffling
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

    const durationMinutes = state.round1DurationMinutes || 20;
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
      score: 0
    };

    if (isDbConnected) {
      await QuizAttempt.create(newAttempt);
    } else {
      memoryStore.quizAttempts[participantId] = newAttempt;
    }

    await createAuditLog(participantId, 'PARTICIPANT', 'QUESTION_SET_GENERATED', attemptId, { count: requiredCount });

    // 5. Build SANITIZED participant payload (NO correctOption, NO explanation)
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

    if (attempt.status === 'SUBMITTED') {
      return res.json({ success: true, message: 'Quiz already submitted.', score: attempt.score });
    }

    const answersToEvaluate = userAnswers || (attempt.userAnswers instanceof Map ? Object.fromEntries(attempt.userAnswers) : attempt.userAnswers) || {};

    let score = 0;
    attempt.selectedQuestions.forEach(sq => {
      const selected = answersToEvaluate[sq.questionId];
      if (selected !== undefined && parseInt(selected) === sq.correctOptionIndex) {
        score += 1;
      }
    });

    const submittedAt = new Date();

    if (isDbConnected) {
      attempt.status = 'SUBMITTED';
      attempt.score = score;
      attempt.submittedAt = submittedAt;
      attempt.userAnswers = answersToEvaluate;
      await attempt.save();

      // Record in Submissions model for leaderboard
      await Submission.create({
        participantId,
        problemId: -1,
        marks: score,
        status: 'VERIFIED',
        verifiedAt: submittedAt
      });
    } else {
      attempt.status = 'SUBMITTED';
      attempt.score = score;
      attempt.submittedAt = submittedAt;
      attempt.userAnswers = answersToEvaluate;

      const subIdx = memoryStore.submissions.findIndex(s => s.participantId === participantId && s.problemId === -1);
      const sub = { participantId, problemId: -1, marks: score, status: 'VERIFIED', verifiedAt: submittedAt };
      if (subIdx >= 0) memoryStore.submissions[subIdx] = sub;
      else memoryStore.submissions.push(sub);
    }

    await createAuditLog(participantId, 'PARTICIPANT', 'QUIZ_SUBMITTED', attempt.attemptId, { score, total: attempt.selectedQuestions.length });
    io.emit('submission:updated', { participantId, round: 1, score });

    res.json({
      success: true,
      message: 'Quiz submitted successfully.',
      score,
      total: attempt.selectedQuestions.length
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
      // Pick 1 C problem, 1 Python problem, 1 Java problem, and 1 Bonus problem
      const cProbs = secureShuffle(activeProblems.filter(p => p.language?.toUpperCase() === 'C'));
      const pyProbs = secureShuffle(activeProblems.filter(p => p.language?.toUpperCase() === 'PYTHON'));
      const javaProbs = secureShuffle(activeProblems.filter(p => p.language?.toUpperCase() === 'JAVA'));
      const bonusProbs = secureShuffle(activeProblems.filter(p => p.isBonus || (p.marks === 0)));

      const picked = [];
      if (cProbs.length > 0) picked.push(cProbs[0]);
      if (pyProbs.length > 0) picked.push(pyProbs[0]);
      if (javaProbs.length > 0) picked.push(javaProbs[0]);
      if (bonusProbs.length > 0) picked.push(bonusProbs[0]);

      // Fallback if specific languages missing
      if (picked.length < 4) {
        const remaining = secureShuffle(activeProblems.filter(p => !picked.includes(p)));
        picked.push(...remaining.slice(0, 4 - picked.length));
      }

      const selectedIds = picked.map(p => p.problemId || p.id);
      const attemptId = `ATT2-${participantId}-${Date.now()}`;
      const newAttempt = {
        attemptId,
        participantId,
        roundId: 'ROUND_2',
        selectedProblemIds: selectedIds,
        startedAt: new Date(),
        status: 'ACTIVE'
      };

      if (isDbConnected) await DebugAttempt.create(newAttempt);
      else memoryStore.debugAttempts[participantId] = newAttempt;

      selectedProblems = picked;
    }

    // SANITIZE DEBUG PAYLOAD (Remove solutionSnippet)
    const sanitizedProblems = selectedProblems.map((p, idx) => ({
      problemId: p.problemId || p.id,
      title: p.title,
      description: p.description,
      language: p.language,
      brokenCode: p.brokenCode,
      expectedOutput: p.expectedOutput,
      marks: p.marks || 0,
      isBonus: !!p.isBonus || idx === 3,
      problemNumber: idx + 1,
      totalProblems: selectedProblems.length
    }));

    res.json({ success: true, problems: sanitizedProblems });
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

    res.json({ success: true, hasAttempt: true, problems: sanitizedProblems });
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
  const { problemId, coordinatorId, pin, marks, participantId } = req.body;

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

    const update = {
      status: 'VERIFIED',
      verifiedBy: coordinatorId,
      marks: parseInt(marks),
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

    await createAuditLog(coordinatorId, 'COORDINATOR', 'DEBUG_SUBMISSION_VERIFIED', problemId, { participantId, marks });
    io.emit('verification:updated', { participantId, problemId, ...update });
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

      existingAttempt = {
        attemptId,
        participantId,
        roundId: 'ROUND_3',
        selectedClueIds: selectedIds,
        currentClueIndex: 0,
        solvedClueIds: [],
        hintsUsed: {},
        answers: {},
        score: 0,
        startedAt: new Date(),
        status: 'ACTIVE'
      };

      if (isDbConnected) await HuntAttempt.create(existingAttempt);
      else memoryStore.huntAttempts[participantId] = existingAttempt;
    }

    const currentClueId = existingAttempt.selectedClueIds[existingAttempt.currentClueIndex];
    const targetClue = activeClues.find(c => (c.clueId || c.id) === currentClueId);

    if (!targetClue) {
      return res.status(404).json({ success: false, message: 'Current clue station not found.' });
    }

    // SANITIZE CLUE PAYLOAD (Never expose answer)
    res.json({
      success: true,
      currentStep: existingAttempt.currentClueIndex + 1,
      totalSteps: existingAttempt.selectedClueIds.length,
      solvedClueIds: existingAttempt.solvedClueIds || [],
      score: existingAttempt.score,
      clue: {
        clueId: targetClue.clueId || targetClue.id,
        station: targetClue.station,
        category: targetClue.category,
        title: targetClue.title,
        clueText: targetClue.clueText ?? targetClue.description,
        marks: targetClue.marks || 10,
        hasHint: Boolean(targetClue.hint),
        hint: existingAttempt.hintsUsed[targetClue.clueId || targetClue.id] ? targetClue.hint : null
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

    if (isDbConnected) {
      attempt = await HuntAttempt.findOne({ participantId });
      activeClues = await TechClue.find();
    } else {
      attempt = memoryStore.huntAttempts[participantId];
      activeClues = memoryStore.techClues;
    }

    if (!attempt) return res.json({ success: true, hasAttempt: false });

    const currentClueId = attempt.selectedClueIds[attempt.currentClueIndex];
    const targetClue = activeClues.find(c => (c.clueId || c.id) === currentClueId);

    if (!targetClue) {
      return res.json({ success: true, hasAttempt: true, isCompleted: true, score: attempt.score });
    }

    const hintsMap = attempt.hintsUsed instanceof Map ? Object.fromEntries(attempt.hintsUsed) : (attempt.hintsUsed || {});

    res.json({
      success: true,
      hasAttempt: true,
      isCompleted: attempt.status === 'COMPLETED',
      currentStep: attempt.currentClueIndex + 1,
      totalSteps: attempt.selectedClueIds.length,
      solvedClueIds: attempt.solvedClueIds || [],
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

  try {
    let clue = null;
    let attempt = null;

    if (isDbConnected) {
      clue = await TechClue.findOne({ $or: [{ clueId: parseInt(clueId) }, { id: parseInt(clueId) }] });
      attempt = await HuntAttempt.findOne({ participantId });
    } else {
      clue = memoryStore.techClues.find(c => c.clueId === parseInt(clueId) || c.id === parseInt(clueId));
      attempt = memoryStore.huntAttempts[participantId];
    }

    if (!clue || !attempt) {
      return res.status(404).json({ success: false, message: 'Clue or attempt not found.' });
    }

    const isCorrect = answer && String(answer).trim().toUpperCase() === String(clue.answer).trim().toUpperCase();

    if (isCorrect) {
      const cIdNum = parseInt(clueId);
      if (!attempt.solvedClueIds.includes(cIdNum)) {
        attempt.solvedClueIds.push(cIdNum);

        const hintsMap = attempt.hintsUsed instanceof Map ? Object.fromEntries(attempt.hintsUsed) : (attempt.hintsUsed || {});
        const hintPenalty = hintsMap[cIdNum] ? (clue.hintPenalty || 2) : 0;
        const awardedMarks = Math.max(0, (clue.marks || 10) - hintPenalty);
        attempt.score += awardedMarks;

        if (attempt.currentClueIndex + 1 >= attempt.selectedClueIds.length) {
          attempt.status = 'COMPLETED';
        } else {
          attempt.currentClueIndex += 1;
        }

        if (isDbConnected) await attempt.save();
      }

      return res.json({
        success: true,
        correct: true,
        score: attempt.score,
        isCompleted: attempt.status === 'COMPLETED'
      });
    }

    res.json({ success: true, correct: false, message: 'Incorrect answer.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/hunt/:clueId/hint', async (req, res) => {
  const { clueId } = req.params;
  const { participantId } = req.body;

  try {
    let clue = null;
    let attempt = null;

    if (isDbConnected) {
      clue = await TechClue.findOne({ $or: [{ clueId: parseInt(clueId) }, { id: parseInt(clueId) }] });
      attempt = await HuntAttempt.findOne({ participantId });
    } else {
      clue = memoryStore.techClues.find(c => c.clueId === parseInt(clueId) || c.id === parseInt(clueId));
      attempt = memoryStore.huntAttempts[participantId];
    }

    if (!clue || !attempt) return res.status(404).json({ success: false, message: 'Clue or attempt not found.' });

    const cIdNum = parseInt(clueId);
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

    const newA = { id: count + 1, title, message, tag, time: 'Just now' };

    if (isDbConnected) await Announcement.create(newA);
    else memoryStore.announcements.push(newA);

    io.emit('announcement:added', newA);
    res.json({ success: true, announcement: newA });
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
