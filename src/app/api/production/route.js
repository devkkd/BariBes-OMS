import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Production from '@/models/Production';
import Tailor from '@/models/Tailor';
import Box from '@/models/Box';
import Store from '@/models/Store';

// GET all production records with filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tailorId = searchParams.get('tailorId');
    const location = searchParams.get('location');
    const boxId = searchParams.get('boxId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (tailorId && tailorId !== 'all') {
      query.tailorId = tailorId;
    }
    
    if (location && location !== 'all') {
      query.location = location;
    }
    
    if (boxId && boxId !== 'all') {
      query.boxId = boxId;
    }
    
    if (startDate && endDate) {
      query.tailoringDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }
    
    const productions = await Production.find(query)
      .populate('tailorId', 'name')
      .populate('boxId', 'name')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: productions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new production record
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Remove empty string values for ObjectId fields
    if (body.tailorId === '') delete body.tailorId;
    if (body.boxId === '') delete body.boxId;
    if (body.storeId === '') delete body.storeId;
    
    // Get tailor name if tailorId provided
    let tailorName = null;
    if (body.tailorId) {
      const tailor = await Tailor.findById(body.tailorId);
      tailorName = tailor?.name;
    }
    
    // Get box name if boxId provided
    let boxName = null;
    if (body.boxId) {
      const box = await Box.findById(body.boxId);
      boxName = box?.name;
    }
    
    // Get store name if storeId provided
    let storeName = null;
    if (body.storeId) {
      const store = await Store.findById(body.storeId);
      storeName = store?.name;
    }
    
    const productionData = {
      orderNumber: body.orderIdManual,
      customerName: body.customerName,
      tailorId: body.tailorId,
      tailorName,
      tailoringDate: body.tailoringDate,
      isReady: body.isReady,
      location: body.location,
      boxId: body.boxId,
      boxName,
      storeId: body.storeId,
      storeName,
      status: body.status,
      notes: body.notes,
    };
    
    const production = await Production.create(productionData);

    // Update order status based on production status
    if (body.orderIdManual) {
      const Order = (await import('@/models/Order')).default;
      
      // Parse order number to handle sub-orders
      const orderParts = body.orderIdManual.split('-');
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
    
    return NextResponse.json({ success: true, data: production }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
