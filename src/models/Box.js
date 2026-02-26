import mongoose from 'mongoose';

const boxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Box name is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Box = mongoose.models.Box || mongoose.model('Box', boxSchema);

export default Box;
