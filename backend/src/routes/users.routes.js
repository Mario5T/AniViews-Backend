import { Router } from 'express';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/:id/follow', authRequired, async (req, res) => {
  const targetId = req.params.id;
  const userId = req.user.id;
  if (targetId === userId) return res.status(400).json({ error: 'Cannot follow yourself' });
  await User.updateOne({ _id: userId }, { $addToSet: { following: targetId } });
  await User.updateOne({ _id: targetId }, { $addToSet: { followers: userId } });
  res.json({ ok: true });
});

router.post('/:id/unfollow', authRequired, async (req, res) => {
  const targetId = req.params.id;
  const userId = req.user.id;
  await User.updateOne({ _id: userId }, { $pull: { following: targetId } });
  await User.updateOne({ _id: targetId }, { $pull: { followers: userId } });
  res.json({ ok: true });
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// Followers list
router.get('/:id/followers', async (req, res) => {
  const user = await User.findById(req.params.id).select('followers');
  if (!user) return res.status(404).json({ error: 'Not found' });
  const docs = await User.find({ _id: { $in: user.followers || [] } }).select('_id username email');
  res.json({ followers: docs });
});

// Following list
router.get('/:id/following', async (req, res) => {
  const user = await User.findById(req.params.id).select('following');
  if (!user) return res.status(404).json({ error: 'Not found' });
  const docs = await User.find({ _id: { $in: user.following || [] } }).select('_id username email');
  res.json({ following: docs });
});

export default router;
