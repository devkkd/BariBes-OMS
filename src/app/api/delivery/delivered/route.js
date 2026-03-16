import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Production from '@/models/Production';

// GET all delivered orders
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (!['admin', 'staff'].includes(currentUser.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await connectDB();

    const deliveredOrders = await Order.find({ status: 'Delivered' })
      .select('orderId subOrderNumber quantity totalAmount firstAdvance secondAdvance remainingDue salesmanName orderDate deliveryDate status deliveryInfo')
      .sort({ 'deliveryInfo.deliveredDate': -1 })
      .lean();

    // Fetch production records for all delivered orders
    const orderNumbers = deliveredOrders.map(o =>
      o.subOrderNumber ? `${o.orderId}-${o.subOrderNumber}` : o.orderId
    );
    const productions = await Production.find({ orderNumber: { $in: orderNumbers } })
      .populate('karigarId', 'name')
      .populate('tailorId', 'name')
      .populate('boxId', 'name')
      .populate('storeId', 'name')
      .lean();

    const productionMap = {};
    productions.forEach(p => { productionMap[p.orderNumber] = p; });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const deliveredToday = deliveredOrders.filter(order => {
      if (!order.deliveryInfo?.deliveredDate) return false;
      return new Date(order.deliveryInfo.deliveredDate) >= startOfDay;
    }).length;

    const formattedOrders = deliveredOrders.map(order => {
      const displayId = order.subOrderNumber ? `${order.orderId}-${order.subOrderNumber}` : order.orderId;
      const production = productionMap[displayId] || null;
      return {
        id: order._id.toString(),
        orderId: order.orderId,
        subOrderNumber: order.subOrderNumber,
        displayId,
        quantity: order.quantity || 1,
        salesmanName: order.salesmanName,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        totalAmount: order.totalAmount,
        firstAdvance: order.firstAdvance,
        secondAdvance: order.secondAdvance || 0,
        remainingDue: order.remainingDue || 0,
        status: order.status,
        deliveryInfo: order.deliveryInfo || null,
        production: production ? {
          karigarId: production.karigarId,
          karigarStatus: production.karigarStatus,
          karigarAssignedDate: production.karigarAssignedDate,
          karigarNotes: production.karigarNotes,
          tailorId: production.tailorId,
          tailorStatus: production.tailorStatus,
          tailoringDate: production.tailoringDate,
          tailorNotes: production.tailorNotes,
          location: production.location,
          storeId: production.storeId,
          boxId: production.boxId,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      stats: { deliveredToday, totalDelivered: formattedOrders.length },
    });
  } catch (error) {
    console.error('Get delivered orders error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
