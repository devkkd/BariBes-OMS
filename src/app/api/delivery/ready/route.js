import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET all orders ready for delivery
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and staff can access delivery features
    if (!['admin', 'staff'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only admin and staff can access delivery features.' },
        { status: 403 }
      );
    }

    await connectDB();
    
    // Query orders with status "Ready"
    const readyOrders = await Order.find({ status: 'Ready' })
      .select('orderId subOrderNumber quantity deliveryDate totalAmount remainingDue salesmanName status')
      .sort({ deliveryDate: 1 })
      .lean();

    const formattedOrders = readyOrders.map(order => ({
      id: order._id.toString(),
      orderId: order.orderId,
      subOrderNumber: order.subOrderNumber,
      displayId: order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId,
      quantity: order.quantity || 1,
      salesmanName: order.salesmanName,
      deliveryDate: order.deliveryDate,
      totalAmount: order.totalAmount,
      remainingDue: order.remainingDue,
      status: order.status,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error('Get ready orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
