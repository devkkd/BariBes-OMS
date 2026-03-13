// Script to drop the unique email index from users collection
// Run this once: node scripts/fix-email-index.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixEmailIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the email_1 index if it exists
    try {
      await usersCollection.dropIndex('email_1');
      console.log('✅ Successfully dropped email_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  email_1 index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Verify indexes after drop
    const newIndexes = await usersCollection.indexes();
    console.log('Indexes after drop:', newIndexes);

    console.log('\n✅ Email index fix completed successfully!');
    console.log('You can now create users without email or with duplicate emails.');
    
  } catch (error) {
    console.error('❌ Error fixing email index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

fixEmailIndex();
