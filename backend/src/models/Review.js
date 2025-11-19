import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  malId: { type: Number, required: true, index: true },
  rating: { type: Number, min: 1, max: 10, required: true },
  text: { type: String, default: '' },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
