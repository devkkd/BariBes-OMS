import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tailor from '@/models/Tailor';

// GET all tailors
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
    const tailors = await Tailor.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      tailors: tailors.map(tailor => ({
        id: tailor._id.toString(),
        name: tailor.name,
        phone: tailor.phone,
        notes: tailor.notes,
        status: tailor.status,
        createdAt: tailor.createdAt,
      })),
      stats: {
        total: tailors.length,
        active: tailors.filter(t => t.status === 'active').length,
        busy: tailors.filter(t => t.status === 'busy').length,
        inactive: tailors.filter(t => t.status === 'inactive').length,
      }
    });
  } catch (error) {
    console.error('Get tailors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new tailor
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

    if (!data.name || !data.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if tailor with same phone already exists
    const existingTailor = await Tailor.findOne({ phone: data.phone });
    if (existingTailor) {
      return NextResponse.json(
        { error: 'Tailor with this phone number already exists' },
        { status: 400 }
      );
    }

    const newTailor = await Tailor.create(data);

    return NextResponse.json({
      success: true,
      tailor: {
        id: newTailor._id.toString(),
        name: newTailor.name,
        phone: newTailor.phone,
        notes: newTailor.notes,
        status: newTailor.status,
      }
    });
  } catch (error) {
    console.error('Create tailor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
