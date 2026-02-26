// Migration script to add category field to existing stores
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateStores() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Store = mongoose.connection.collection('stores');
    
    // Update all stores without category field
    const result = await Store.updateMany(
      { category: { $exists: false } },
      { $set: { category: 'godown' } }
    );

    console.log(`Migration completed: ${result.modifiedCount} stores updated`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateStores();
