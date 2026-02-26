import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET all orders
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
    const orders = await Order.find().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id.toString(),
        orderId: order.orderId,
        subOrderNumber: order.subOrderNumber,
        orderDate: order.orderDate,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        billingPhoto: order.billingPhoto,
        lehengaPhotos: order.lehengaPhotos,
        totalAmount: order.totalAmount,
        firstAdvance: order.firstAdvance,
        secondAdvance: order.secondAdvance,
        remainingDue: order.remainingDue,
        deliveryDate: order.deliveryDate,
        status: order.status,
        createdAt: order.createdAt,
      })),
      stats: {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        inProduction: orders.filter(o => o.status === 'In Production').length,
        ready: orders.filter(o => o.status === 'Ready').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new order
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
    
    console.log('Received order data:', data);
    console.log('subOrderNumber:', data.subOrderNumber);

    await connectDB();

    const newOrder = await Order.create(data);
    
    console.log('Created order:', newOrder.toObject());

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder._id.toString(),
        orderId: newOrder.orderId,
        subOrderNumber: newOrder.subOrderNumber,
        orderDate: newOrder.orderDate,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        totalAmount: newOrder.totalAmount,
        firstAdvance: newOrder.firstAdvance,
        secondAdvance: newOrder.secondAdvance,
        remainingDue: newOrder.remainingDue,
        deliveryDate: newOrder.deliveryDate,
        status: newOrder.status,
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
