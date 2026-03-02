import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    subOrderNumber: {
      type: Number,
      default: null, // null means single order, 1,2,3... means multiple orders
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    billingPhoto: {
      type: String,
      required: true,
    },
    lehengaPhotos: {
      type: [String],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    firstAdvance: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      method: {
        type: String,
        enum: ['SHUF', 'VHUF', 'KHUF', 'RD', 'Cash', 'Other'],
        required: true,
      },
      subPayments: [{
        paymentMethod: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
    },
    secondAdvance: {
      type: Number,
      default: 0,
      min: 0,
    },
    secondAdvanceDate: {
      type: Date,
      default: null,
    },
    remainingDue: {
      type: Number,
      default: 0,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Production', 'Ready', 'Delivered'],
      default: 'Pending',
    },
    customerName: {
      type: String,
      required: false,
    },
    customerPhone: {
      type: String,
      required: false,
    },
    salesmanName: {
      type: String,
      required: false,
    },
    
    // Delivery information subdocument
    deliveryInfo: {
      deliveredDate: {
        type: Date,
        default: null,
      },
      deliveredBy: {
        type: String,
        default: null,
      },
      remainingPaymentAmount: {
        type: Number,
        default: null,
      },
      deliveryPersonName: {
        type: String,
        default: null,
      },
      deliveryPersonMobile: {
        type: String,
        default: null,
      },
      videoReviewUrl: {
        type: String,
        default: null,
      },
      deliveryNotes: {
        type: String,
        default: '',
      },
      // Audit fields
      markedDeliveredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      markedDeliveredAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for orderId and subOrderNumber
OrderSchema.index({ orderId: 1, subOrderNumber: 1 }, { unique: true });

// New indexes for delivery queries
OrderSchema.index({ status: 1 }); // For filtering by status
OrderSchema.index({ 'deliveryInfo.deliveredDate': 1 }); // For date range queries

// Calculate remaining due before saving
OrderSchema.pre('save', async function () {
  // Calculate remaining due
  this.remainingDue = this.totalAmount - this.firstAdvance.amount - this.secondAdvance;
});

// Virtual field for display ID
OrderSchema.virtual('displayId').get(function() {
  if (this.subOrderNumber === null || this.subOrderNumber === undefined) {
    return this.orderId;
  }
  return `${this.orderId}-${this.subOrderNumber}`;
});

// Ensure virtuals are included in JSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
