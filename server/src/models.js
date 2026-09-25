import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  college: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  role: { type: String, enum: ['PARTICIPANT', 'COORDINATOR', 'ADMIN'], default: 'PARTICIPANT' },
  password: { type: String, required: true },
  accountStatus: { type: String, enum: ['ACTIVE', 'LOCKED', 'SUSPENDED', 'PENDING', 'DISQUALIFIED'], default: 'ACTIVE' },
  assignedRound: { type: String, default: '' },
  assignedCoordinator: { type: String, default: '' },
  pin: { type: String, default: '' },
  manualGradingOverrides: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { round2: 'graded' | 'non_graded', round3: 'graded' | 'non_graded' }
  permissions: [{ type: String }] // e.g. MANAGE_QUESTIONS, MANAGE_DEBUG_PROBLEMS, MANAGE_CLUES
}, { timestamps: true });

// EventState Schema
const eventStateSchema = new mongoose.Schema({
  status: { type: String, default: 'REGISTRATION' }, // REGISTRATION | ROUND_1_READY | ROUND_1_RUNNING | ROUND_1_ENDED | ROUND_2_READY | ROUND_2_RUNNING | ROUND_2_ENDED | ROUND_3_READY | ROUND_3_RUNNING | COMPLETED
  round1MaxQuestions: { type: Number, default: 20 },
  round1DurationMinutes: { type: Number, default: 10 },
  round2DurationMinutes: { type: Number, default: 15 },
  round3DurationMinutes: { type: Number, default: 15 },
  roundStartedAt: { type: Date, default: null },
  roundEndsAt: { type: Date, default: null },
  round1QualifyMode: { type: String, enum: ['PERCENTAGE', 'COUNT'], default: 'PERCENTAGE' },
  round1QualifyPercentage: { type: Number, default: 70 }, // 70% of R1 participants advance to R2 as graded
  round1QualifyCount: { type: Number, default: 30 },
  round2QualifyMode: { type: String, enum: ['PERCENTAGE', 'COUNT'], default: 'PERCENTAGE' },
  round2QualifyPercentage: { type: Number, default: 50 }, // 50% of R2 participants advance to R3 as graded
  round2QualifyCount: { type: Number, default: 10 },
  round3StationCount: { type: Number, default: 5 },
  registrationCount: { type: Number, default: 0 },
  activeRound: { type: Number, default: 1 },
  colleges: { 
    type: [String], 
    default: [
      'K. Ramakrishnan College of Technology', 
      'Anna University', 
      'Saranathan College of Engineering', 
      'National Institute of Technology Trichy', 
      'SASTRA Deemed University',
      'Government College of Engineering'
    ] 
  },
  // ─── Per-round grading percentage configuration ─────────────────────────
  // 100 = 100% of participants are graded in Round 1
  // 70  = top 70% by R1 leaderboard are graded in Round 2, remaining 30% are non_graded
  // 50  = top 50% by R2 leaderboard are graded in Round 3, remaining 50% are non_graded
  roundGradingConfig: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      1: { gradingPercentage: 100 },
      2: { gradingPercentage: 70 },
      3: { gradingPercentage: 50 }
    }
  }
}, { timestamps: true });

// Question Schema (Round 1 MCQ)
const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true, unique: true },
  id: { type: String }, // Alias for backwards compatibility
  questionText: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // Backend-only! 0-indexed
  marks: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
  tags: [{ type: String }],
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  createdBy: { type: String, default: 'SYSTEM' },
  updatedBy: { type: String, default: 'SYSTEM' }
}, { timestamps: true });

// QuizAttempt Schema (Persisted Round 1 Attempt per Participant)
const quizAttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  participantId: { type: String, required: true },
  roundId: { type: String, default: 'ROUND_1' },
  selectedQuestions: [{
    questionId: { type: String, required: true },
    position: { type: Number, required: true },
    options: [{ type: String }], // Option order randomized for this specific participant attempt
    correctOptionIndex: { type: Number } // Mapped correct index for backend validation
  }],
  userAnswers: { type: Map, of: Number, default: {} }, // questionId -> selectedOptionIndex
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date },
  submittedAt: { type: Date, default: null },
  status: { type: String, enum: ['ACTIVE', 'SUBMITTED', 'EXPIRED', 'DISQUALIFIED'], default: 'ACTIVE' },
  score: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  // ─── NEW: Participation & Grading separation ────────────────────────────────
  // participationStatus: whether the participant is allowed to attend this round
  //   eligible | active | completed | not_started | disqualified
  participationStatus: {
    type: String,
    enum: ['eligible', 'active', 'completed', 'not_started', 'disqualified'],
    default: 'eligible'
  },
  // gradingStatus: whether this attempt counts toward official leaderboard
  //   graded    → attempt affects official score, rank, qualification
  //   non_graded → attempt is stored but excluded from official leaderboard
  gradingStatus: {
    type: String,
    enum: ['graded', 'non_graded'],
    default: 'graded'
  },
  // qualificationStatus: result of this round for next-round cohort determination
  //   qualified | not_qualified | not_applicable
  qualificationStatus: {
    type: String,
    enum: ['qualified', 'not_qualified', 'not_applicable'],
    default: 'not_applicable'
  }
}, { timestamps: true });

// DebugProblem Schema (Round 2)
const debugProblemSchema = new mongoose.Schema({
  problemId: { type: Number, required: true, unique: true },
  id: { type: Number }, // Alias
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, default: 'Python' },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  brokenCode: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  solutionSnippet: { type: String, default: '' }, // Coordinator-only
  marks: { type: Number, default: 10 },
  category: { type: String, default: 'Logic' },
  tags: [{ type: String }],
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  createdBy: { type: String, default: 'SYSTEM' },
  updatedBy: { type: String, default: 'SYSTEM' }
}, { timestamps: true });

// DebugAttempt Schema (Persisted Round 2 Attempt per Participant)
const debugAttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  participantId: { type: String, required: true },
  roundId: { type: String, default: 'ROUND_2' },
  selectedProblemIds: [{ type: Number }],
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'DISQUALIFIED'], default: 'ACTIVE' },
  // ─── NEW: Participation & Grading separation ────────────────────────────────
  participationStatus: {
    type: String,
    enum: ['eligible', 'active', 'completed', 'not_started', 'disqualified'],
    default: 'eligible'
  },
  gradingStatus: {
    type: String,
    enum: ['graded', 'non_graded'],
    default: 'graded'
  },
  qualificationStatus: {
    type: String,
    enum: ['qualified', 'not_qualified', 'not_applicable'],
    default: 'not_applicable'
  }
}, { timestamps: true });

// TechClue Schema (Round 3)
const techClueSchema = new mongoose.Schema({
  clueId: { type: Number, required: true, unique: true },
  id: { type: Number }, // Alias
  station: { type: Number, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  clueText: { type: String, required: true },
  answer: { type: String, required: true }, // Backend-only!
  hint: { type: String, default: '' },
  hintPenalty: { type: Number, default: 2 },
  marks: { type: Number, default: 10 },
  order: { type: Number, default: 1 },
  status: { type: String, enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  createdBy: { type: String, default: 'SYSTEM' },
  updatedBy: { type: String, default: 'SYSTEM' }
}, { timestamps: true });

// HuntAttempt Schema (Persisted Round 3 Attempt per Participant)
const huntAttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  participantId: { type: String, required: true },
  roundId: { type: String, default: 'ROUND_3' },
  selectedClueIds: [{ type: Number }],
  currentClueIndex: { type: Number, default: 0 },
  solvedClueIds: [{ type: Number }],
  skippedClueIds: [{ type: Number }],
  hintsUsed: { type: Map, of: Boolean, default: {} },
  answers: { type: Map, of: String, default: {} },
  incorrectAttempts: { type: Map, of: Number, default: {} },
  score: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  endsAt: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'DISQUALIFIED'], default: 'ACTIVE' },
  // ─── NEW: Participation & Grading separation ────────────────────────────────
  participationStatus: {
    type: String,
    enum: ['eligible', 'active', 'completed', 'not_started', 'disqualified'],
    default: 'eligible'
  },
  gradingStatus: {
    type: String,
    enum: ['graded', 'non_graded'],
    default: 'graded'
  },
  qualificationStatus: {
    type: String,
    enum: ['qualified', 'not_qualified', 'not_applicable'],
    default: 'not_applicable'
  }
}, { timestamps: true });

// Submission / Verification Schema (Round 2 Physical Verification)
const submissionSchema = new mongoose.Schema({
  participantId: { type: String, required: true },
  problemId: { type: Number, required: true },
  code: { type: String, default: '' },
  output: { type: String, default: '' },
  status: { type: String, enum: ['NOT_STARTED', 'WORKING', 'SUBMITTED', 'WAITING_VERIFICATION', 'VERIFIED', 'LOCKED'], default: 'NOT_STARTED' },
  verifiedBy: { type: String, default: null },
  marks: { type: Number, default: 0 },
  verifiedAt: { type: Date, default: null },
  // gradingStatus inherited from participant's DebugAttempt; stored here for leaderboard filtering
  gradingStatus: { type: String, enum: ['graded', 'non_graded'], default: 'graded' },
  rubricBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, default: 'Just now' },
  tag: { type: String, default: 'General' }
}, { timestamps: true });

// AntiCheatLog Schema
const antiCheatLogSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  participantId: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String, required: true }
}, { timestamps: true });

// AuditLog Schema
const auditLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true }, // e.g. QUESTION_CREATED, QUESTION_SET_GENERATED
  targetId: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const EventState = mongoose.model('EventState', eventStateSchema);
export const Question = mongoose.model('Question', questionSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export const DebugProblem = mongoose.model('DebugProblem', debugProblemSchema);
export const DebugAttempt = mongoose.model('DebugAttempt', debugAttemptSchema);
export const TechClue = mongoose.model('TechClue', techClueSchema);
export const HuntAttempt = mongoose.model('HuntAttempt', huntAttemptSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const AntiCheatLog = mongoose.model('AntiCheatLog', antiCheatLogSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
