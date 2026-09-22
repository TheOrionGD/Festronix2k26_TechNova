import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import { User, EventState } from './models.js';

dotenv.config();

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const urisToTry = [
  process.env.DATABASE_URL,
  process.env.MONGODB_URI
].filter(Boolean);

const adminUser = {
  id: 'ADMIN-01',
  name: 'Technova Super Admin',
  email: 'admin@technova.edu',
  college: 'K. Ramakrishnan College of Technology',
  department: 'CSE',
  role: 'ADMIN',
  passwordPlain: 'TN2026#AdminPass',
  password: bcrypt.hashSync('TN2026#AdminPass', 10),
  accountStatus: 'ACTIVE',
  permissions: ['MANAGE_ALL', 'MANAGE_QUESTIONS', 'MANAGE_DEBUG_PROBLEMS', 'MANAGE_CLUES']
};

const coordinatorUsers = [
  {
    id: 'COORD-01',
    name: 'Lab Coordinator 1',
    email: 'coord1@technova.edu',
    college: 'K. Ramakrishnan College of Technology',
    department: 'CSE',
    role: 'COORDINATOR',
    assignedRound: 'Lab Terminal 1',
    pin: '1001',
    passwordPlain: 'TN2026#Coord1Pass',
    password: bcrypt.hashSync('TN2026#Coord1Pass', 10),
    accountStatus: 'ACTIVE',
    permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS']
  },
  {
    id: 'COORD-02',
    name: 'Lab Coordinator 2',
    email: 'coord2@technova.edu',
    college: 'K. Ramakrishnan College of Technology',
    department: 'CSE',
    role: 'COORDINATOR',
    assignedRound: 'Lab Terminal 2',
    pin: '1002',
    passwordPlain: 'TN2026#Coord2Pass',
    password: bcrypt.hashSync('TN2026#Coord2Pass', 10),
    accountStatus: 'ACTIVE',
    permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS']
  },
  {
    id: 'COORD-03',
    name: 'Lab Coordinator 3',
    email: 'coord3@technova.edu',
    college: 'K. Ramakrishnan College of Technology',
    department: 'CSE',
    role: 'COORDINATOR',
    assignedRound: 'Lab Terminal 3',
    pin: '1003',
    passwordPlain: 'TN2026#Coord3Pass',
    password: bcrypt.hashSync('TN2026#Coord3Pass', 10),
    accountStatus: 'ACTIVE',
    permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS']
  },
  {
    id: 'COORD-04',
    name: 'Lab Coordinator 4',
    email: 'coord4@technova.edu',
    college: 'K. Ramakrishnan College of Technology',
    department: 'CSE',
    role: 'COORDINATOR',
    assignedRound: 'Lab Terminal 4',
    pin: '1004',
    passwordPlain: 'TN2026#Coord4Pass',
    password: bcrypt.hashSync('TN2026#Coord4Pass', 10),
    accountStatus: 'ACTIVE',
    permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS']
  },
  {
    id: 'COORD-05',
    name: 'Lab Coordinator 5',
    email: 'coord5@technova.edu',
    college: 'K. Ramakrishnan College of Technology',
    department: 'CSE',
    role: 'COORDINATOR',
    assignedRound: 'Lab Terminal 5',
    pin: '1005',
    passwordPlain: 'TN2026#Coord5Pass',
    password: bcrypt.hashSync('TN2026#Coord5Pass', 10),
    accountStatus: 'ACTIVE',
    permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS']
  },
  {
    id: 'COORD-06',
    name: 'Lab Coordinator 6',
    email: 'coord6@technova.edu',
    college: 'K. Ramakrishnan College of Technology',
    department: 'CSE',
    role: 'COORDINATOR',
    assignedRound: 'Lab Terminal 6',
    pin: '1006',
    passwordPlain: 'TN2026#Coord6Pass',
    password: bcrypt.hashSync('TN2026#Coord6Pass', 10),
    accountStatus: 'ACTIVE',
    permissions: ['VERIFY_DEBUG', 'MANAGE_QUESTIONS']
  }
];

async function seedUsers() {
  console.log('--- FESTRONIX TECHNOVA SEED USERS SCRIPT ---');
  let connected = false;

  for (let i = 0; i < urisToTry.length; i++) {
    const uri = urisToTry[i];
    console.log(`[Attempt ${i + 1}/${urisToTry.length}] Connecting to MongoDB Atlas Database...`);
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
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

  if (!connected) {
    console.warn('⚠️ Could not connect to remote database. Outputting credentials for memory store mode.');
  } else {
    try {
      // Clear existing Admin & Coordinators
      await User.deleteMany({ role: { $in: ['ADMIN', 'COORDINATOR'] } });

      // Format for insertion
      const dbAdmin = { ...adminUser };
      delete dbAdmin.passwordPlain;
      await User.create(dbAdmin);

      const dbCoords = coordinatorUsers.map(c => {
        const copy = { ...c };
        delete copy.passwordPlain;
        return copy;
      });
      await User.insertMany(dbCoords);

      console.log('\n✅ SUCCESS: 1 SUPER ADMIN & 6 COORDINATORS CREATED IN DATABASE');
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error seeding users:', err.message);
    }
  }

  console.log('\n=== CREATED USER CREDENTIALS REPORT ===');
  console.log(`SUPER ADMIN (1):`);
  console.log(`  ID: ${adminUser.id} | Email: ${adminUser.email} | Password: ${adminUser.passwordPlain}`);
  console.log(`\nCOORDINATORS (6):`);
  coordinatorUsers.forEach(c => {
    console.log(`  ID: ${c.id} | Email: ${c.email} | PIN: ${c.pin} | Lab: ${c.assignedRound} | Password: ${c.passwordPlain}`);
  });
  console.log('================───────────────────────\n');

  process.exit(0);
}

seedUsers();
