import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import http from 'http';
import { 
  User, 
  QuizAttempt, 
  DebugAttempt, 
  HuntAttempt, 
  Submission, 
  AntiCheatLog, 
  AuditLog, 
  EventState, 
  Question, 
  DebugProblem, 
  TechClue, 
  Announcement 
} from './models.js';

dotenv.config();

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || '';
const PORT = process.env.PORT || 5000;

async function clearAllData() {
  console.log('--- TECHNOVA TOTAL DATA PURGE UTILITY ---');

  // Step 1: Wipe MongoDB Database Collections
  if (mongoUri) {
    try {
      console.log('Connecting to MongoDB Atlas Cloud Database using process.env...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000
      });
      console.log('✅ Connected successfully to MongoDB Atlas!');

      console.log('\n--- EXECUTING TOTAL DATA & USER PURGES ---');
      const userRes = await User.deleteMany({});
      console.log(`Deleted ${userRes.deletedCount} user records (ALL users purged).`);

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

      const qRes = await Question.deleteMany({});
      console.log(`Deleted ${qRes.deletedCount} questions.`);

      const dpRes = await DebugProblem.deleteMany({});
      console.log(`Deleted ${dpRes.deletedCount} debug problems.`);

      const tcRes = await TechClue.deleteMany({});
      console.log(`Deleted ${tcRes.deletedCount} tech clues.`);

      const annRes = await Announcement.deleteMany({});
      console.log(`Deleted ${annRes.deletedCount} announcements.`);

      await EventState.updateMany({}, { registrationCount: 0, status: 'REGISTRATION', activeRound: 1, colleges: [] });
      console.log('Reset EventState to 0 registrationCount and REGISTRATION status.');

      await mongoose.disconnect();
      console.log('✅ SUCCESS: ALL users and database collections have been completely purged.');
    } catch (err) {
      console.error('❌ Error purging MongoDB collections:', err.message);
    }
  } else {
    console.log('Notice: DATABASE_URL/MONGODB_URI not found. Skipping MongoDB direct purge.');
  }

  // Step 2: Clear Running Server In-Memory Cache via REST API
  try {
    console.log(`\nPurging live in-memory server state at http://localhost:${PORT}/api/admin/purge-all-data...`);
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/purge-all-data',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ In-memory server cache cleared:', data);
        console.log('--- PURGE COMPLETE ---');
        process.exit(0);
      });
    });

    req.on('error', (err) => {
      console.log('Server process not currently active on port', PORT, '(No running memory cache to clear).');
      console.log('--- PURGE COMPLETE ---');
      process.exit(0);
    });

    req.end();
  } catch (err) {
    console.log('--- PURGE COMPLETE ---');
    process.exit(0);
  }
}

clearAllData();
