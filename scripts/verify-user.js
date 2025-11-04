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

async function verifyUser() {
  try {
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    const email = await question('Enter email to verify: ');
    const testPassword = await question('Enter password to test: ');

    const client = new MongoClient(mongoUri);

    try {
      await client.connect();
      console.log('✅ Connected to MongoDB\n');

      const db = client.db();
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });

      if (!user) {
        console.log(`❌ User not found: ${email}\n`);
      } else {
        console.log('📋 User found:');
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Has password hash: ${!!user.password}`);
        if (user.password) {
          console.log(`  Hash: ${user.password.substring(0, 20)}...`);
          console.log(`  Hash length: ${user.password.length}\n`);

          // Test password
          console.log('🔐 Testing password...');
          const isValid = await bcrypt.compare(testPassword, user.password);
          if (isValid) {
            console.log('✅ Password is CORRECT\n');
          } else {
            console.log('❌ Password is INCORRECT\n');
            console.log('💡 Suggestion: Use scripts/reset-password.js to update the password\n');
          }
        }
      }

      process.exit(0);
    } catch (error) {
      console.error('❌ Database error:', error.message);
      process.exit(1);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyUser();
