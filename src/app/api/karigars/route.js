import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Karigar from '@/models/Karigar';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const karigars = await Karigar.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      karigars: karigars.map(karigar => ({
        id: karigar._id.toString(),
        _id: karigar._id.toString(),
        name: karigar.name,
        phone: karigar.phone,
        notes: karigar.notes,
        status: karigar.status,
        createdAt: karigar.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get karigars error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const newKarigar = await Karigar.create(data);

    return NextResponse.json({
      success: true,
      karigar: {
        id: newKarigar._id.toString(),
        _id: newKarigar._id.toString(),
        name: newKarigar.name,
        phone: newKarigar.phone,
        notes: newKarigar.notes,
        status: newKarigar.status,
      }
    });
  } catch (error) {
    console.error('Create karigar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
