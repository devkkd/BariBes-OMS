import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tailor from '@/models/Tailor';

// GET single tailor
export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const tailor = await Tailor.findById(id);
    
    if (!tailor) {
      return NextResponse.json(
        { error: 'Tailor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tailor: {
        id: tailor._id.toString(),
        name: tailor.name,
        phone: tailor.phone,
        notes: tailor.notes,
        status: tailor.status,
      }
    });
  } catch (error) {
    console.error('Get tailor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update tailor
export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectDB();
    
    const { id } = await params;
    const tailor = await Tailor.findById(id);
    
    if (!tailor) {
      return NextResponse.json(
        { error: 'Tailor not found' },
        { status: 404 }
      );
    }

    // Check if phone is being changed and if it's already taken
    if (data.phone && data.phone !== tailor.phone) {
      const existingTailor = await Tailor.findOne({ phone: data.phone });
      if (existingTailor) {
        return NextResponse.json(
          { error: 'Phone number already in use' },
          { status: 400 }
        );
      }
    }

    // Update fields
    Object.keys(data).forEach(key => {
      tailor[key] = data[key];
    });

    await tailor.save();

    return NextResponse.json({
      success: true,
      tailor: {
        id: tailor._id.toString(),
        name: tailor.name,
        phone: tailor.phone,
        notes: tailor.notes,
        status: tailor.status,
      }
    });
  } catch (error) {
    console.error('Update tailor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE tailor
export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admin can delete tailors.' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const tailor = await Tailor.findById(id);
    
    if (!tailor) {
      return NextResponse.json(
        { error: 'Tailor not found' },
        { status: 404 }
      );
    }

    await Tailor.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Tailor deleted successfully'
    });
  } catch (error) {
    console.error('Delete tailor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
