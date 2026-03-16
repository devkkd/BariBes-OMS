import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Production from '@/models/Production';

// POST - Remove storage assignment, step back to tailor completed state
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const production = await Production.findById(id);
    if (!production) {
      return NextResponse.json({ success: false, error: 'Production record not found' }, { status: 404 });
    }

    // Unset storage fields, keep tailor/karigar data intact
    await Production.findByIdAndUpdate(id, {
      $unset: { location: '', boxId: '', storeId: '', boxName: '', storeName: '' },
    });

    // Update order status back to 'Ready' (tailor completed, no storage)
    if (production.orderNumber) {
      const Order = (await import('@/models/Order')).default;
      const orderParts = production.orderNumber.split('-');
      const orderId = orderParts[0];
      const subOrderNumber = orderParts.length > 1 ? parseInt(orderParts[1]) : null;
      const query = { orderId, subOrderNumber: subOrderNumber !== null ? subOrderNumber : null };
      await Order.findOneAndUpdate(query, { status: 'Ready' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove storage error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
