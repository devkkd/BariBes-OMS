import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Production from '@/models/Production';

// GET single order
export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
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
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update order
export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
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
    
    const { id } = await params;
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update fields
    Object.keys(data).forEach(key => {
      order[key] = data[key];
    });
    
    // Ensure numeric fields are properly typed
    if (data.quantity !== undefined) order.quantity = Number(data.quantity) || 1;

    await order.save();

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderId: order.orderId,
        subOrderNumber: order.subOrderNumber,
        quantity: order.quantity || 1,
        orderDate: order.orderDate,
        salesmanName: order.salesmanName,
        totalAmount: order.totalAmount,
        firstAdvance: order.firstAdvance,
        secondAdvance: order.secondAdvance,
        remainingDue: order.remainingDue,
        deliveryDate: order.deliveryDate,
        status: order.status,
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(request, { params }) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only admin can delete orders.' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    await Order.findByIdAndDelete(id);

    // Delete all production records linked to this order
    const orderNumber = order.subOrderNumber
      ? `${order.orderId}-${order.subOrderNumber}`
      : order.orderId;
    await Production.deleteMany({ orderNumber });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
