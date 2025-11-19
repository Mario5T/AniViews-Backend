import { Router } from 'express';
import Review from '../models/Review.js';
import { authRequired } from '../middleware/auth.js';
import { classifySentiment } from '../utils/sentiment.js';

const router = Router();

// Create or update a review
router.post('/', authRequired, async (req, res) => {
  const { malId, rating, text } = req.body;
  if (!malId || !rating) return res.status(400).json({ error: 'Missing fields' });
  const sentiment = classifySentiment(text || '');
  const review = await Review.findOneAndUpdate(
    { user: req.user.id, malId },
    { rating, text, sentiment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(review);
});

// Get reviews for an anime
router.get('/anime/:malId', async (req, res) => {
  const reviews = await Review.find({ malId: Number(req.params.malId) }).populate('user', 'username');
  res.json(reviews);
});

export default router;
