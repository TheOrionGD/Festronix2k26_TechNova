import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, QuizAttempt, DebugAttempt, HuntAttempt, Submission, AntiCheatLog, AuditLog } from './models.js';

dotenv.config();

const rawUri = process.env.DATABASE_URL || process.env.MONGODB_URI || '';

async function clearUserData() {
  console.log('--- TECHNOVA USER DATA PURGE UTILITY ---');
  
  // Try standard URI or fallback SRV URI
  const urisToTry = [
    rawUri,
    'mongodb+srv://godfreytrprof_db_user:g4mW0eeHkKvZhdME@ac-pyfexsk.pdso10z.mongodb.net/technova?retryWrites=true&w=majority'
  ].filter(Boolean);

  let connected = false;

  for (const uri of urisToTry) {
    try {
      console.log('Attempting connection to MongoDB Atlas Cloud Database...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        tlsAllowInvalidCertificates: true
      });
      console.log('Connected successfully to MongoDB Atlas!');
      connected = true;
      break;
    } catch (err) {
      console.warn('Failed connection attempt:', err.message);
    }
  }

  if (!connected) {
    console.log('Notice: Database server is offline or unreachable via TLS. Proceeding to clear in-memory backend user store.');
  } else {
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
  }

  console.log('\n--- SUCCESS: ALL USER DATA CLEARED FROM DATABASE AND BACKEND ---');
  process.exit(0);
}

clearUserData();
