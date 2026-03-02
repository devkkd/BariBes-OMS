import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['godown', 'shop', 'showroom'],
    default: 'godown',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);

export default Store;
