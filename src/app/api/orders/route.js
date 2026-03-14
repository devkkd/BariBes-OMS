import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET all orders
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Support filtering by orderId + subOrderNumber (for storage/production view modal)
    const { searchParams } = new URL(request.url);
    const filterOrderId = searchParams.get('orderId');
    const filterSubOrder = searchParams.get('subOrderNumber');

    let query = {};
    if (filterOrderId) {
      query.orderId = filterOrderId;
      if (filterSubOrder !== null) {
        query.subOrderNumber = filterSubOrder === 'null' ? null : parseInt(filterSubOrder);
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id.toString(),
        orderId: order.orderId,
        subOrderNumber: order.subOrderNumber,
        quantity: order.quantity || 1,
        orderDate: order.orderDate,
        salesmanName: order.salesmanName,
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

    // Validate split payments if method is 'Other'
    if (data.firstAdvance?.method === 'Other') {
      const subPayments = data.firstAdvance.subPayments || [];
      
      // Check if subPayments exist and are valid
      if (subPayments.length === 0) {
        return NextResponse.json(
          { error: 'Split payments are required when payment method is "Other"' },
          { status: 400 }
        );
      }

      // Validate each sub-payment
      for (const subPayment of subPayments) {
        if (!subPayment.paymentMethod || !subPayment.paymentMethod.trim()) {
          return NextResponse.json(
            { error: 'All payment methods are required' },
            { status: 400 }
          );
        }
       
        if (!subPayment.amount || subPayment.amount <= 0) {
          return NextResponse.json(
            { error: 'All payment amounts must be greater than 0' },
            { status: 400 }
          );
        }
      }

      // Validate that sub-payments sum equals firstAdvance amount
      const subPaymentsTotal = subPayments.reduce((sum, sp) => sum + Number(sp.amount), 0);
      const firstAdvanceAmount = Number(data.firstAdvance.amount);
      
      if (Math.abs(subPaymentsTotal - firstAdvanceAmount) > 0.01) { // Allow small floating point differences
        return NextResponse.json(
          { 
            error: `Split payments total (₹${subPaymentsTotal}) must equal first advance amount (₹${firstAdvanceAmount})`,
            subPaymentsTotal,
            firstAdvanceAmount
          },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const newOrder = await Order.create(data);
    
    console.log('Created order:', newOrder.toObject());

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder._id.toString(),
        orderId: newOrder.orderId,
        subOrderNumber: newOrder.subOrderNumber,
        quantity: newOrder.quantity || 1,
        orderDate: newOrder.orderDate,
        salesmanName: newOrder.salesmanName,
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
