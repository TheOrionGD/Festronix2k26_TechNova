import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { User, QuizAttempt, DebugAttempt, HuntAttempt, Submission, AntiCheatLog, AuditLog } from './models.js';

dotenv.config();

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || '';

async function clearUserData() {
  console.log('--- TECHNOVA USER DATA PURGE UTILITY ---');

  if (!mongoUri) {
    console.error('❌ Error: Neither DATABASE_URL nor MONGODB_URI is set in process.env. Aborting purge.');
    process.exit(1);
  }

  let connected = false;
  try {
    console.log('Connecting to MongoDB Atlas Cloud Database using process.env...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected successfully to MongoDB Atlas!');
    connected = true;
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }

  if (connected) {
    try {
      console.log('\n--- EXECUTING COLLECTION PURGES ---');
      const userRes = await User.deleteMany({});
      console.log(`Deleted ${userRes.deletedCount} user records.`);

      const qAttemptRes = await QuizAttempt.deleteMany({});
      console.log(`Deleted ${qAttemptRes.deletedCount} quiz attempts.`);

      const dAttemptRes = await DebugAttempt.deleteMany({});
      console.log(`Deleted ${dAttemptRes.deletedCount} debug attempts.`);

      const hAttemptRes = await HuntAttempt.deleteMany({});
      console.log(`Deleted ${hAttemptRes.deletedCount} hunt attempts.`);

      const subRes = await Submission.deleteMany({});
      console.log(`Deleted ${subRes.deletedCount} submissions.`);

      const acRes = await AntiCheatLog.deleteMany({});
      console.log(`Deleted ${acRes.deletedCount} anti-cheat logs.`);

      const auditRes = await AuditLog.deleteMany({});
      console.log(`Deleted ${auditRes.deletedCount} audit logs.`);

      await EventState.updateMany({}, { registrationCount: 0 });
      console.log('Reset EventState registrationCount to 0.');

      await mongoose.disconnect();
      console.log('\n✅ SUCCESS: Database user collections have been completely cleared.');
    } catch (err) {
      console.error('❌ Error purging database collections:', err.message);
    }
  }

  console.log('--- PURGE COMPLETE ---');
  process.exit(0);
}

clearUserData();
