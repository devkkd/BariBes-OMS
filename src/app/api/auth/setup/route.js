import { NextResponse } from 'next/server';
import { createInitialAdmin } from '@/lib/auth';

// This endpoint creates the initial admin user
// Call this once to setup your database
export async function POST() {
  try {
    await createInitialAdmin();
    
    return NextResponse.json({
      success: true,
      message: 'Initial admin user created successfully',
      credentials: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to create initial admin user',
    endpoint: '/api/auth/setup',
    method: 'POST'
  });
}
