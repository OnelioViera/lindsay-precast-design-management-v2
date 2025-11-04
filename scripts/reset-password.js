const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  let mongoUri = process.argv[4];

  if (!email || !newPassword) {
    console.error('❌ Usage: node scripts/reset-password.js <email> <newpassword> [mongoUri]');
    console.error('Example: node scripts/reset-password.js user@example.com myNewPassword');
    console.error('Note: MongoURI will be read from .env.local if not provided');
    process.exit(1);
  }

  // If no MongoDB URI provided as argument, try to read from .env.local
  if (!mongoUri) {
    const envPath = path.join(__dirname, '..', '.env.local');
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
  }

  if (!mongoUri) {
    console.error('❌ MongoDB URI not found in .env.local or provided as argument');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Password reset successfully for ${user.name} (${user.email})`);
      console.log(`📝 New password: ${newPassword}`);
      console.log(`\n🚀 You can now login with this password!`);
    } else {
      console.error('❌ Failed to update password');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

resetPassword();
