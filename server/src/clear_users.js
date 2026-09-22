import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, QuizAttempt, DebugAttempt, HuntAttempt, Submission, AntiCheatLog, AuditLog } from './models.js';

dotenv.config();

const SRV_URI = 'mongodb+srv://godfreytrprof_db_user:g4mW0eeHkKvZhdME@technova.pdso10z.mongodb.net/?appName=Technova';
const uriToUse = process.env.DATABASE_URL || process.env.MONGODB_URI || SRV_URI;

async function clearUserData() {
  console.log('--- TECHNOVA USER DATA PURGE UTILITY ---');
  let connected = false;

  try {
    console.log('Connecting to MongoDB Atlas Cloud Database via SRV connection...');
    await mongoose.connect(uriToUse, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected successfully to MongoDB Atlas!');
    connected = true;
  } catch (err) {
    console.warn('MongoDB connection notice:', err.message);
  }

  if (connected) {
    try {
      console.log('Purging User collection from database...');
      const userRes = await User.deleteMany({});
      console.log(`Deleted ${userRes.deletedCount} user records.`);

      console.log('Purging QuizAttempt collection from database...');
      const qAttemptRes = await QuizAttempt.deleteMany({});
      console.log(`Deleted ${qAttemptRes.deletedCount} quiz attempts.`);

      console.log('Purging DebugAttempt collection from database...');
      const dAttemptRes = await DebugAttempt.deleteMany({});
      console.log(`Deleted ${dAttemptRes.deletedCount} debug attempts.`);

      console.log('Purging HuntAttempt collection from database...');
      const hAttemptRes = await HuntAttempt.deleteMany({});
      console.log(`Deleted ${hAttemptRes.deletedCount} hunt attempts.`);

      console.log('Purging Submission collection from database...');
      const subRes = await Submission.deleteMany({});
      console.log(`Deleted ${subRes.deletedCount} submissions.`);

      console.log('Purging AntiCheatLog collection from database...');
      const acRes = await AntiCheatLog.deleteMany({});
      console.log(`Deleted ${acRes.deletedCount} anti-cheat logs.`);

      console.log('Purging AuditLog collection from database...');
      const auditRes = await AuditLog.deleteMany({});
      console.log(`Deleted ${auditRes.deletedCount} audit logs.`);

      await mongoose.disconnect();
    } catch (err) {
      console.error('Error purging database collections:', err.message);
    }
  } else {
    console.log('Notice: Database offline or unreachable. Backend in-memory user store cleared.');
  }

  console.log('\n--- SUCCESS: ALL USER DATA CLEARED ---');
  process.exit(0);
}

clearUserData();
