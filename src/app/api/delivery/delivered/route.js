import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET all delivered orders
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
    
    // Query orders with status "Delivered"
    const deliveredOrders = await Order.find({ status: 'Delivered' })
      .select('orderId subOrderNumber customerName customerPhone totalAmount status deliveryInfo')
      .sort({ 'deliveryInfo.deliveredDate': -1 }) // Sort by delivered date descending
      .lean();

    // Calculate stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const deliveredToday = deliveredOrders.filter(order => {
      if (!order.deliveryInfo || !order.deliveryInfo.deliveredDate) return false;
      const deliveredDate = new Date(order.deliveryInfo.deliveredDate);
      return deliveredDate >= startOfDay;
    }).length;

    // Format orders with displayId
    const formattedOrders = deliveredOrders.map(order => ({
      id: order._id.toString(),
      orderId: order.orderId,
      subOrderNumber: order.subOrderNumber,
      displayId: order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      status: order.status,
      deliveryInfo: order.deliveryInfo || null,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      stats: {
        deliveredToday,
        totalDelivered: formattedOrders.length,
      },
    });
  } catch (error) {
    console.error('Get delivered orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
