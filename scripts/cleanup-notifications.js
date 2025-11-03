const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

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

async function cleanupNotifications() {
  try {
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    const client = new MongoClient(mongoUri);

    try {
      await client.connect();
      console.log('✅ Connected to MongoDB');

      const db = client.db();
      const notificationsCollection = db.collection('notifications');

      const result = await notificationsCollection.deleteMany({});

      console.log(`\n✅ Cleanup completed!`);
      console.log(`📊 Deleted ${result.deletedCount} old notifications\n`);

      process.exit(0);
    } catch (error) {
      console.error('❌ Database error:', error.message);
      process.exit(1);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
}

cleanupNotifications();
