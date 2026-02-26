import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Box from '@/models/Box';

// GET single box
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const box = await Box.findById(id);
    
    if (!box) {
      return NextResponse.json(
        { success: false, error: 'Box not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: box });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update box
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const box = await Box.findByIdAndUpdate(
      id,
      body,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!box) {
      return NextResponse.json(
        { success: false, error: 'Box not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: box });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE box
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const box = await Box.findByIdAndDelete(id);
    
    if (!box) {
      return NextResponse.json(
        { success: false, error: 'Box not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
