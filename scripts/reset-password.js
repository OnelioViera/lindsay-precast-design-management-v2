const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  const mongoUri = process.argv[4];

  if (!email || !newPassword) {
    console.error('❌ Usage: node scripts/reset-password.js <email> <newpassword> <mongoUri>');
    console.error('Example: node scripts/reset-password.js user@example.com myNewPassword "mongodb+srv://..."');
    process.exit(1);
  }

  if (!mongoUri) {
    console.error('❌ MongoDB URI not provided as third argument');
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
