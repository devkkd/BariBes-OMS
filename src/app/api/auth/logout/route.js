import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser, logActivity } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      await logActivity(user.id, 'logout', { email: user.email });
    }

    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
