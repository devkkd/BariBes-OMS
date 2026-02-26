import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Box from '@/models/Box';

// GET all boxes with filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const boxes = await Box.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: boxes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new box
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const box = await Box.create(body);
    
    return NextResponse.json({ success: true, data: box }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
