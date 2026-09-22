import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || '';

async function verifyDatabaseConnection() {
  console.log('TECHNOVA Seed Utility');
  console.log('Notice: All automatic seed data has been removed from this system.');
  console.log('Database records must be created through real Admin and Coordinator workflows.');

  if (!MONGODB_URI) {
    console.log('No production DATABASE_URL configured. Skipping MongoDB connection verification.');
    process.exit(0);
  }

  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB Cloud Atlas connected successfully. No seed records were inserted.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.log('MongoDB connection check completed. Database offline or unavailable.', err.message);
    process.exit(0);
  }
}

verifyDatabaseConnection();