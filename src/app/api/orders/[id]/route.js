import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

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

    await order.save();

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderId: order.orderId,
        subOrderNumber: order.subOrderNumber,
        orderDate: order.orderDate,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
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
