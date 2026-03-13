import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// GET endpoint to drop the email index
export async function GET() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the email_1 index if it exists
    try {
      await usersCollection.dropIndex('email_1');
      return NextResponse.json({
        success: true,
        message: 'Successfully dropped email_1 index',
        remainingIndexes: await usersCollection.indexes()
      });
    } catch (error) {
      if (error.code === 27) {
        return NextResponse.json({
          success: true,
          message: 'email_1 index does not exist (already dropped)',
          remainingIndexes: await usersCollection.indexes()
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error dropping email index:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to drop email index',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
