import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { 
  User, 
  QuizAttempt, 
  DebugAttempt, 
  HuntAttempt, 
  Submission, 
  AntiCheatLog,
  EventState,
  Question,
  DebugProblem,
  TechClue,
  Announcement
} from '../src/models.js';

const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

async function deleteParticipantsData() {
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI or DATABASE_URL not set in environment.');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB database...');
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully.');

    // Count before deletion
    const participantCountBefore = await User.countDocuments({ role: 'PARTICIPANT' });
    const quizAttemptsBefore = await QuizAttempt.countDocuments({});
    const debugAttemptsBefore = await DebugAttempt.countDocuments({});
    const submissionsBefore = await Submission.countDocuments({});
    const huntAttemptsBefore = await HuntAttempt.countDocuments({});
    const antiCheatLogsBefore = await AntiCheatLog.countDocuments({});

    console.log('\n--- DATA FOUND BEFORE DELETION ---');
    console.log(`• Participants: ${participantCountBefore}`);
    console.log(`• Round 1 Quiz Attempts: ${quizAttemptsBefore}`);
    console.log(`• Round 2 Debug Attempts: ${debugAttemptsBefore}`);
    console.log(`• Round 2 Problem Submissions: ${submissionsBefore}`);
    console.log(`• Round 3 Hunt Attempts: ${huntAttemptsBefore}`);
    console.log(`• AntiCheat Malpractice Logs: ${antiCheatLogsBefore}`);

    // Execute deletions
    console.log('\n🗑️ Deleting all participant-related records from database...');
    
    const delUsers = await User.deleteMany({ role: 'PARTICIPANT' });
    const delQuiz = await QuizAttempt.deleteMany({});
    const delDebug = await DebugAttempt.deleteMany({});
    const delSub = await Submission.deleteMany({});
    const delHunt = await HuntAttempt.deleteMany({});
    const delAntiCheat = await AntiCheatLog.deleteMany({});

    // Reset EventState registration count
    await EventState.updateMany({}, {
      registrationCount: 0
    });

    console.log('\n--- DELETION SUMMARY ---');
    console.log(`✓ Deleted ${delUsers.deletedCount} participant user account(s)`);
    console.log(`✓ Deleted ${delQuiz.deletedCount} quiz attempt record(s)`);
    console.log(`✓ Deleted ${delDebug.deletedCount} debug attempt record(s)`);
    console.log(`✓ Deleted ${delSub.deletedCount} problem submission record(s)`);
    console.log(`✓ Deleted ${delHunt.deletedCount} tech hunt attempt record(s)`);
    console.log(`✓ Deleted ${delAntiCheat.deletedCount} anticheat/malpractice log(s)`);
    console.log(`✓ Reset EventState registrationCount to 0`);

    // Verify preserved data
    const remainingUsers = await User.countDocuments({});
    const coordinators = await User.countDocuments({ role: 'COORDINATOR' });
    const admins = await User.countDocuments({ role: 'ADMIN' });
    const questions = await Question.countDocuments({});
    const debugProblems = await DebugProblem.countDocuments({});
    const clues = await TechClue.countDocuments({});
    const announcements = await Announcement.countDocuments({});

    console.log('\n--- PRESERVED SYSTEM DATA ---');
    console.log(`• Coordinators Preserved: ${coordinators}`);
    console.log(`• Admins Preserved: ${admins}`);
    console.log(`• Total Remaining System Users: ${remainingUsers}`);
    console.log(`• Question Bank Preserved: ${questions} questions`);
    console.log(`• Debug Problems Preserved: ${debugProblems} problems`);
    console.log(`• Tech Clues Preserved: ${clues} clues`);
    console.log(`• Announcements Preserved: ${announcements}`);

    console.log('\n✅ All participant data successfully removed from database.');
  } catch (err) {
    console.error('❌ Failed to delete participant data:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database.');
  }
}

deleteParticipantsData();
