import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Thread from '../models/Thread.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

const router = Router();

router.get('/anime/:malId', async (req, res) => {
  const threads = await Thread.find({ malId: Number(req.params.malId) })
    .sort({ updatedAt: -1 })
    .limit(100)
    .select('title user commentsCount createdAt updatedAt');
  res.json(threads);
});

// Feed: threads from people the user follows (and self)
router.get('/feed', authRequired, async (req, res) => {
  const me = await User.findById(req.user.id).select('following');
  const ids = [...new Set([req.user.id, ...((me?.following)||[])])];
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const total = await Thread.countDocuments({ user: { $in: ids } });
  const threads = await Thread.find({ user: { $in: ids } })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('title body user malId commentsCount createdAt updatedAt')
    .populate('user', 'username email')
    .lean();
  const has_next_page = (skip + threads.length) < total;
  res.json({ threads, pagination: { page, limit, total, has_next_page } });
});

// Edit a thread (owner only)
router.patch('/:id', authRequired, async (req, res) => {
  const { title, body } = req.body;
  const thread = await Thread.findById(req.params.id);
  if (!thread) return res.status(404).json({ error: 'Not found' });
  if (String(thread.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  if (title !== undefined) thread.title = title;
  if (body !== undefined) thread.body = body;
  await thread.save();
  res.json(thread);
});

// Edit a comment (owner only)
router.patch('/:threadId/comments/:commentId', authRequired, async (req, res) => {
  const { body } = req.body;
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (String(comment.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  if (body !== undefined) comment.body = body;
  await comment.save();
  res.json(comment);
});

// Like a comment
router.post('/:threadId/comments/:commentId/like', authRequired, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  comment.likes = (comment.likes || 0) + 1;
  await comment.save();
  res.json({ likes: comment.likes });
});
router.post('/', authRequired, async (req, res) => {
  const { malId, title, body } = req.body;
  if (!malId || !title) return res.status(400).json({ error: 'Missing fields' });
  const thread = await Thread.create({ malId, title, body: body || '', user: req.user.id });
  res.status(201).json(thread);
});

router.get('/:id', async (req, res) => {
  const t = await Thread.findById(req.params.id)
    .select('title body user malId commentsCount createdAt updatedAt')
    .populate('user', '_id username email')
    .lean();
  if (!t) return res.status(404).json({ error: 'Not found' });
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  const total = await Comment.countDocuments({ thread: t._id });
  const comments = await Comment.find({ thread: t._id })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate('user', '_id username email')
    .lean();
  const has_next_page = (skip + comments.length) < total;
  res.json({ thread: t, comments, pagination: { page, limit, total, has_next_page } });
});

router.post('/:id/comments', authRequired, async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: 'Empty comment' });
  const thread = await Thread.findById(req.params.id);
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  const comment = await Comment.create({ thread: thread._id, user: req.user.id, body });
  await Thread.updateOne({ _id: thread._id }, { $inc: { commentsCount: 1 } });
  res.status(201).json(comment);
});

// Delete a thread (owner only)
router.delete('/:id', authRequired, async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) return res.status(404).json({ error: 'Not found' });
  if (String(thread.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  await Comment.deleteMany({ thread: thread._id });
  await Thread.deleteOne({ _id: thread._id });
  return res.json({ ok: true });
});

// Delete a comment (owner only)
router.delete('/:threadId/comments/:commentId', authRequired, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (String(comment.user) !== String(req.user.id)) return res.status(403).json({ error: 'Forbidden' });
  await Comment.deleteOne({ _id: comment._id });
  await Thread.updateOne({ _id: req.params.threadId }, { $inc: { commentsCount: -1 } });
  return res.json({ ok: true });
});

export default router;
