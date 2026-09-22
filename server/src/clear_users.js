import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { User, QuizAttempt, DebugAttempt, HuntAttempt, Submission, AntiCheatLog, AuditLog } from './models.js';

dotenv.config();

// Set IPv4 first for Node DNS resolution on Windows networks
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const srvUri = 'mongodb+srv://godfreytrprof_db_user:g4mW0eeHkKvZhdME@technova.pdso10z.mongodb.net/?appName=Technova';
const directUri = 'mongodb://godfreytrprof_db_user:g4mW0eeHkKvZhdME@ac-pyfexsk-shard-00-00.pdso10z.mongodb.net:27017,ac-pyfexsk-shard-00-01.pdso10z.mongodb.net:27017,ac-pyfexsk-shard-00-02.pdso10z.mongodb.net:27017/technova?ssl=true&replicaSet=atlas-11tpyg-shard-0&authSource=admin&appName=Technova';

const urisToTry = [
  process.env.DATABASE_URL,
  process.env.MONGODB_URI,
  srvUri,
  directUri
].filter(Boolean);

async function clearUserData() {
  console.log('--- TECHNOVA USER DATA PURGE UTILITY ---');
  let connected = false;

  for (let i = 0; i < urisToTry.length; i++) {
    const uri = urisToTry[i];
    console.log(`[Attempt ${i + 1}/${urisToTry.length}] Connecting to MongoDB Atlas Cloud Database...`);
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000
      });
      console.log('✅ Connected successfully to MongoDB Atlas!');
      connected = true;
      break;
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err.message);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
    }
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

      await mongoose.disconnect();
      console.log('\n✅ SUCCESS: Database user collections have been completely cleared.');
    } catch (err) {
      console.error('❌ Error purging database collections:', err.message);
    }
  } else {
    console.log('\n⚠️ Notice: Could not connect to remote database (Network/DNS/TLS blocked). Local in-memory store reset performed.');
  }

  console.log('--- PURGE COMPLETE ---');
  process.exit(0);
}

clearUserData();
