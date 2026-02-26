import mongoose from 'mongoose';

// Delete cached model to ensure schema updates are applied
if (mongoose.models.Production) {
  delete mongoose.models.Production;
}

const productionSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  tailorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tailor',
  },
  tailorName: {
    type: String,
  },
  tailoringDate: {
    type: Date,
  },
  isReady: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    enum: ['godown', 'shop'],
    required: true,
  },
  boxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
  },
  boxName: {
    type: String,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  storeName: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Not Ready', 'Ready'],
    default: 'Not Ready',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Auto update status when production is ready
productionSchema.pre('save', function() {
  if (this.isModified('isReady') && this.isReady) {
    this.status = 'Ready';
  }
});

const Production = mongoose.model('Production', productionSchema);

export default Production;
