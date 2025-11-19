import { Router } from 'express';
import List from '../models/List.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, async (req, res) => {
  const list = await List.create({ user: req.user.id, name: req.body.name, description: req.body.description });
  res.status(201).json(list);
});

router.get('/me', authRequired, async (req, res) => {
  const lists = await List.find({ user: req.user.id });
  res.json(lists);
});

router.patch('/:id', authRequired, async (req, res) => {
  const list = await List.findOne({ _id: req.params.id, user: req.user.id });
  if (!list) return res.status(404).json({ error: 'Not found' });
  const { name, description } = req.body;
  if (name !== undefined) list.name = name;
  if (description !== undefined) list.description = description;
  await list.save();
  res.json(list);
});

router.delete('/:id', authRequired, async (req, res) => {
  const list = await List.findOne({ _id: req.params.id, user: req.user.id });
  if (!list) return res.status(404).json({ error: 'Not found' });
  await List.deleteOne({ _id: list._id });
  res.json({ ok: true });
});

router.post('/:id/items', authRequired, async (req, res) => {
  const { malId, title, score, status } = req.body;
  const list = await List.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $addToSet: { items: { malId, title, score, status } } },
    { new: true }
  );
  if (!list) return res.status(404).json({ error: 'List not found' });
  res.json(list);
});

router.delete('/:id/items/:malId', authRequired, async (req, res) => {
  const list = await List.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $pull: { items: { malId: Number(req.params.malId) } } },
    { new: true }
  );
  if (!list) return res.status(404).json({ error: 'List not found' });
  res.json(list);
});

export default router;
