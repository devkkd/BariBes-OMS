import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Production from '@/models/Production';
import Tailor from '@/models/Tailor';
import Karigar from '@/models/Karigar';
import Box from '@/models/Box';
import Store from '@/models/Store';

// GET single production record
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const production = await Production.findById(id)
      .populate('tailorId', 'name')
      .populate('karigarId', 'name')
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
    
    // Get existing production to check current state
    const existingProduction = await Production.findById(id);
    if (!existingProduction) {
      return NextResponse.json(
        { success: false, error: 'Production record not found' },
        { status: 404 }
      );
    }
    
    // VALIDATION: Check if trying to assign tailor when karigar is not completed
    if (body.tailorId && existingProduction.karigarId && existingProduction.karigarStatus !== 'Completed') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot assign to tailor. Karigar work is still in progress. Please complete karigar work first.' 
        },
        { status: 400 }
      );
    }
    
    // VALIDATION: Check if trying to change tailor status when karigar is not completed
    if (body.tailorStatus && existingProduction.karigarId && existingProduction.karigarStatus !== 'Completed') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot update tailor status. Karigar work must be completed first.' 
        },
        { status: 400 }
      );
    }
    
    // Remove empty string values for ObjectId fields
    if (body.tailorId === '') body.tailorId = null;
    if (body.karigarId === '') body.karigarId = null;
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
    } else if (body.tailorId === null) {
      body.tailorName = null;
    }
    
    // Get karigar name if karigarId changed
    if (body.karigarId) {
      const karigar = await Karigar.findById(body.karigarId);
      body.karigarName = karigar?.name;
    } else if (body.karigarId === null) {
      body.karigarName = null;
    }
    
    // Get box name if boxId changed
    if (body.boxId) {
      const box = await Box.findById(body.boxId);
      body.boxName = box?.name;
    } else if (body.boxId === null) {
      body.boxName = null;
    }
    
    // Get store name if storeId changed
    if (body.storeId) {
      const store = await Store.findById(body.storeId);
      body.storeName = store?.name;
    } else if (body.storeId === null) {
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

    // Update order status when storage is assigned or when production status changes
    if (production.orderNumber) {
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
      
      // Determine order status based on production state
      let orderStatus = 'Pending';
      
      // If storage location is assigned (tailor completed + storage assigned), mark as Ready
      if (body.location || production.location) {
        orderStatus = 'Ready';
      }
      // If tailor status is completed but no storage yet
      else if (production.tailorStatus === 'Completed' || body.tailorStatus === 'Completed') {
        orderStatus = 'Ready';
      }
      // If in production
      else if (production.karigarStatus === 'In Progress' || production.tailorStatus === 'In Progress') {
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
