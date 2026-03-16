import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// POST mark order as delivered
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin and staff can mark orders as delivered
    if (!['admin', 'staff'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only admin and staff can mark orders as delivered.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, deliveryInfo } = body;

    // Validation
    const errors = {};

    if (!orderId) {
      errors.orderId = 'Order ID is required';
    }

    if (!deliveryInfo) {
      errors.deliveryInfo = 'Delivery information is required';
    } else {
      // Validate required fields
      if (!deliveryInfo.deliveredDate) {
        errors.deliveredDate = 'Delivered date is required';
      } else {
        // Check if date is not in future
        const deliveredDate = new Date(deliveryInfo.deliveredDate);
        const now = new Date();
        if (deliveredDate > now) {
          errors.deliveredDate = 'Delivered date cannot be in the future';
        }
      }

      if (!deliveryInfo.deliveredBy || deliveryInfo.deliveredBy.trim().length < 2) {
        errors.deliveredBy = 'Delivered by is required (minimum 2 characters)';
      }

      if (deliveryInfo.remainingPaymentAmount === undefined || deliveryInfo.remainingPaymentAmount === null) {
        errors.remainingPaymentAmount = 'Remaining payment amount is required';
      } else if (deliveryInfo.remainingPaymentAmount < 0) {
        errors.remainingPaymentAmount = 'Remaining payment amount cannot be negative';
      }

      // Validate optional fields
      if (deliveryInfo.videoReviewUrl && deliveryInfo.videoReviewUrl.trim()) {
        try {
          new URL(deliveryInfo.videoReviewUrl);
        } catch (e) {
          errors.videoReviewUrl = 'Invalid URL format';
        }
      }

      if (deliveryInfo.deliveryNotes && deliveryInfo.deliveryNotes.length > 500) {
        errors.deliveryNotes = 'Delivery notes cannot exceed 500 characters';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already delivered
    if (order.status === 'Delivered') {
      return NextResponse.json(
        { success: false, error: 'Order is already marked as delivered' },
        { status: 409 }
      );
    }

    // Update order
    order.status = 'Delivered';
    order.deliveryInfo = {
      deliveredDate: new Date(deliveryInfo.deliveredDate),
      deliveredBy: deliveryInfo.deliveredBy.trim(),
      remainingPaymentAmount: Number(deliveryInfo.remainingPaymentAmount),
      remainingPaymentMethod: deliveryInfo.paymentMethod || null,
      remainingPaymentSubPayments: deliveryInfo.paymentMethod === 'Other' ? (deliveryInfo.subPayments || []) : [],
      videoReviewUrl: deliveryInfo.videoReviewUrl?.trim() || null,
      deliveryNotes: deliveryInfo.deliveryNotes?.trim() || '',
      markedDeliveredBy: currentUser.id,
      markedDeliveredAt: new Date(),
    };

    await order.save();

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        status: order.status,
        deliveryInfo: order.deliveryInfo,
      },
      message: 'Order marked as delivered successfully',
    });
  } catch (error) {
    console.error('Mark delivered error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
