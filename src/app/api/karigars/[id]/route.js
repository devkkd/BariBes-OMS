import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Karigar from '@/models/Karigar';

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
    const karigar = await Karigar.findById(id);
    
    if (!karigar) {
      return NextResponse.json(
        { error: 'Karigar not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      karigar: {
        id: karigar._id.toString(),
        _id: karigar._id.toString(),
        name: karigar.name,
        phone: karigar.phone,
        notes: karigar.notes,
        status: karigar.status,
      }
    });
  } catch (error) {
    console.error('Get karigar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const karigar = await Karigar.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!karigar) {
      return NextResponse.json(
        { error: 'Karigar not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      karigar: {
        id: karigar._id.toString(),
        _id: karigar._id.toString(),
        name: karigar.name,
        phone: karigar.phone,
        notes: karigar.notes,
        status: karigar.status,
      }
    });
  } catch (error) {
    console.error('Update karigar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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
    const karigar = await Karigar.findByIdAndDelete(id);
    
    if (!karigar) {
      return NextResponse.json(
        { error: 'Karigar not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Karigar deleted successfully'
    });
  } catch (error) {
    console.error('Delete karigar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
