import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  malId: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Thread', threadSchema);
