import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

const MONGODB_URI = process.env.DATABASE_URL ?? process.env.MONGODB_URI;

async function runCleanup() {
  if (!MONGODB_URI) {
    console.error('ERROR: No MONGODB_URI found in environment.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  console.log('\n--- PRE-CLEANUP DATABASE COUNTS ---');
  console.log('Total Users:', await User.countDocuments());
  console.log(' - Admin/Coordinator accounts:', await User.countDocuments({ role: { $in: ['ADMIN', 'COORDINATOR'] } }));
  console.log(' - Participant accounts:', await User.countDocuments({ role: 'PARTICIPANT' }));
  console.log('Round 1 MCQs:', await Question.countDocuments());
  console.log('Round 2 Debug Problems:', await DebugProblem.countDocuments());
  console.log('Round 3 Tech Clues:', await TechClue.countDocuments());
  console.log('Quiz Attempts (R1):', await QuizAttempt.countDocuments());
  console.log('Debug Attempts (R2):', await DebugAttempt.countDocuments());
  console.log('Code Submissions (R2):', await Submission.countDocuments());
  console.log('Hunt Attempts (R3):', await HuntAttempt.countDocuments());
  console.log('Anti-Cheat Logs:', await AntiCheatLog.countDocuments());
  console.log('Audit Logs:', await AuditLog.countDocuments());

  console.log('\n--- EXECUTING PARTICIPANT PURGE ---');

  // 1. Delete all participants
  const userResult = await User.deleteMany({ role: { $nin: ['ADMIN', 'COORDINATOR'] } });
  console.log(`✓ Deleted ${userResult.deletedCount} participant user records.`);

  // 2. Delete all competition attempts & submissions
  const quizResult = await QuizAttempt.deleteMany({});
  console.log(`✓ Deleted ${quizResult.deletedCount} Round 1 quiz attempts.`);

  const debugResult = await DebugAttempt.deleteMany({});
  console.log(`✓ Deleted ${debugResult.deletedCount} Round 2 debug attempts.`);

  const subResult = await Submission.deleteMany({});
  console.log(`✓ Deleted ${subResult.deletedCount} Round 2 code submissions.`);

  const huntResult = await HuntAttempt.deleteMany({});
  console.log(`✓ Deleted ${huntResult.deletedCount} Round 3 hunt attempts.`);

  // 3. Delete anti-cheat flags & audit logs
  const antiCheatResult = await AntiCheatLog.deleteMany({});
  console.log(`✓ Deleted ${antiCheatResult.deletedCount} anti-cheat signal logs.`);

  const auditResult = await AuditLog.deleteMany({});
  console.log(`✓ Deleted ${auditResult.deletedCount} general audit logs.`);

  // 4. Reset Event State to REGISTRATION with 0 participant registration count
  await EventState.updateMany({}, {
    status: 'REGISTRATION',
    activeRound: 1,
    registrationCount: 0
  });
  console.log('✓ Reset EventState to REGISTRATION with registrationCount = 0.');

  console.log('\n--- POST-CLEANUP DATABASE COUNTS ---');
  const remainingUsers = await User.find({}, 'id name email role assignedRound');
  console.log(`Remaining User Accounts (${remainingUsers.length}):`);
  remainingUsers.forEach(u => console.log(` - [${u.role}] ${u.id}: ${u.name} (${u.email})`));

  console.log('\nContent Banks Preserved:');
  console.log(' - Round 1 MCQs:', await Question.countDocuments());
  console.log(' - Round 2 Debug Problems:', await DebugProblem.countDocuments());
  console.log(' - Round 3 Tech Clues:', await TechClue.countDocuments());

  console.log('\nCleanup completed successfully! Disconnecting...');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

runCleanup().catch(err => {
  console.error('Cleanup failed with error:', err);
  process.exit(1);
});
