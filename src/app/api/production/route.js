import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Production from '@/models/Production';
import Tailor from '@/models/Tailor';
import Karigar from '@/models/Karigar';
import Box from '@/models/Box';
import Store from '@/models/Store';

// GET all production records with filtering
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tailorId = searchParams.get('tailorId');
    const karigarId = searchParams.get('karigarId');
    const tailorStatus = searchParams.get('tailorStatus');
    const karigarStatus = searchParams.get('karigarStatus');
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
    
    if (karigarId && karigarId !== 'all') {
      query.karigarId = karigarId;
    }
    
    if (tailorStatus) {
      query.tailorStatus = tailorStatus;
    }
    
    if (karigarStatus) {
      query.karigarStatus = karigarStatus;
    }
    
    if (location && location !== 'all') {
      if (location === '') {
        // Filter for items without location
        query.$or = [
          { location: { $exists: false } },
          { location: null },
          { location: '' }
        ];
      } else {
        query.location = location;
      }
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
      .populate('karigarId', 'name')
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
    if (body.karigarId === '') delete body.karigarId;
    if (body.boxId === '') delete body.boxId;
    if (body.storeId === '') delete body.storeId;
    
    // VALIDATION: Check if trying to assign tailor when karigar is not completed
    if (body.tailorId && body.orderIdManual) {
      // Check if this order already has a karigar assignment
      const existingProduction = await Production.findOne({ 
        orderNumber: body.orderIdManual 
      });
      
      if (existingProduction && existingProduction.karigarId && existingProduction.karigarStatus !== 'Completed') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cannot assign to tailor. Karigar work is still in progress. Please complete karigar work first.' 
          },
          { status: 400 }
        );
      }
    }
    
    // Get tailor name if tailorId provided
    let tailorName = null;
    if (body.tailorId) {
      const tailor = await Tailor.findById(body.tailorId);
      tailorName = tailor?.name;
    }
    
    // Get karigar name if karigarId provided
    let karigarName = null;
    if (body.karigarId) {
      const karigar = await Karigar.findById(body.karigarId);
      karigarName = karigar?.name;
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
      
      // Karigar fields
      karigarId: body.karigarId,
      karigarName,
      karigarAssignedDate: body.karigarAssignedDate,
      karigarStatus: body.karigarStatus || 'Not Assigned',
      karigarNotes: body.karigarNotes,
      
      // Tailor fields
      tailorId: body.tailorId,
      tailorName,
      tailoringDate: body.tailoringDate,
      tailorStatus: body.tailorStatus || 'Not Assigned',
      tailorNotes: body.tailorNotes,
      
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

    // Update order status when production is created
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
      
      // Set order status to "In Production" when production is created
      await Order.findOneAndUpdate(
        query,
        { status: 'In Production' },
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
