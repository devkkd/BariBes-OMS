import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Production from '@/models/Production';
import Tailor from '@/models/Tailor';
import Box from '@/models/Box';
import Store from '@/models/Store';

// GET single production record
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const production = await Production.findById(id)
      .populate('tailorId', 'name')
      .populate('boxId', 'name')
      .populate('storeId', 'name');
    
    if (!production) {
      return NextResponse.json(
        { success: false, error: 'Production record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: production });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update production record
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    // Remove empty string values for ObjectId fields
    if (body.tailorId === '') body.tailorId = null;
    if (body.boxId === '') body.boxId = null;
    if (body.storeId === '') body.storeId = null;
    
    // Handle manual order ID
    if (body.orderIdManual) {
      body.orderNumber = body.orderIdManual;
      delete body.orderIdManual;
    }
    
    // Get tailor name if tailorId changed
    if (body.tailorId) {
      const tailor = await Tailor.findById(body.tailorId);
      body.tailorName = tailor?.name;
    } else {
      body.tailorName = null;
    }
    
    // Get box name if boxId changed
    if (body.boxId) {
      const box = await Box.findById(body.boxId);
      body.boxName = box?.name;
    } else {
      body.boxName = null;
    }
    
    // Get store name if storeId changed
    if (body.storeId) {
      const store = await Store.findById(body.storeId);
      body.storeName = store?.name;
    } else {
      body.storeName = null;
    }
    
    const production = await Production.findByIdAndUpdate(
      id,
      body,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!production) {
      return NextResponse.json(
        { success: false, error: 'Production record not found' },
        { status: 404 }
      );
    }

    // Update order status based on production status
    if (body.status && production.orderNumber) {
      const Order = (await import('@/models/Order')).default;
      
      // Parse order number to handle sub-orders
      const orderParts = production.orderNumber.split('-');
      const orderId = orderParts[0];
      const subOrderNumber = orderParts.length > 1 ? parseInt(orderParts[1]) : null;
      
      const query = { orderId };
      if (subOrderNumber !== null) {
        query.subOrderNumber = subOrderNumber;
      } else {
        query.subOrderNumber = null;
      }
      
      // Set order status based on production status
      let orderStatus = 'Pending';
      if (body.status === 'Ready') {
        orderStatus = 'Ready';
      } else if (body.status === 'Not Ready') {
        orderStatus = 'In Production';
      }
      
      await Order.findOneAndUpdate(
        query,
        { status: orderStatus },
        { runValidators: true }
      );
    }
    
    return NextResponse.json({ success: true, data: production });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE production record
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const production = await Production.findByIdAndDelete(id);
    
    if (!production) {
      return NextResponse.json(
        { success: false, error: 'Production record not found' },
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
