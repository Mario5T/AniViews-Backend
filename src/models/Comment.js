import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  body: { type: String, required: true },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
