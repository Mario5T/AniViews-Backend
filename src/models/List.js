import mongoose from 'mongoose';

const listSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  description: String,
  items: [
    {
      malId: { type: Number, required: true },
      title: String,
      score: Number,
      status: { type: String, enum: ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'], default: 'plan_to_watch' }
    }
  ]
}, { timestamps: true });

export default mongoose.model('List', listSchema);
