const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let mongoUri = process.env.MONGODB_URI;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const trimmedKey = key.trim();
      const trimmedValue = valueParts.join('=').trim();
      if (trimmedKey === 'MONGODB_URI') {
        mongoUri = trimmedValue;
      }
    }
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setupAdmin() {
  try {
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    console.log('\n🔧 Admin Account Setup\n');
    console.log('Please provide the following information:\n');

    const name = await question('Full Name: ');
    const email = await question('Email: ');
    const password = await question('Password (min 6 characters): ');
    const confirmPassword = await question('Confirm Password: ');

    // Validation
    if (!name || !email || !password) {
      console.error('❌ All fields are required');
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('❌ Passwords do not match');
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters');
      rl.close();
      process.exit(1);
    }

    const client = new MongoClient(mongoUri);

    try {
      await client.connect();
      console.log('✅ Connected to MongoDB');

      const db = client.db();
      const usersCollection = db.collection('users');

      // Check if users already exist
      const userCount = await usersCollection.countDocuments({});
      if (userCount > 0) {
        console.error('❌ Users already exist in the database');
        console.error('   Use scripts/reset-password.js to change an existing user\'s password instead');
        rl.close();
        process.exit(1);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const result = await usersCollection.insertOne({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        phone: '',
        avatar: '',
        preferences: {
          emailNotifications: true,
          productionNotifications: true,
          weeklyReports: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('\n✅ Admin account created successfully!');
      console.log(`📧 Email: ${email.toLowerCase()}`);
      console.log(`🔐 Password: ${password}`);
      console.log(`👤 Role: Administrator\n`);
      console.log('🚀 You can now log in to your application!\n');

      rl.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Database error:', error.message);
      rl.close();
      process.exit(1);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    rl.close();
    process.exit(1);
  }
}

setupAdmin();
