import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';

// GET single store
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const store = await Store.findById(id);
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update store
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const store = await Store.findByIdAndUpdate(
      id,
      body,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE store
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const store = await Store.findByIdAndDelete(id);
    
    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Store not found' },
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
