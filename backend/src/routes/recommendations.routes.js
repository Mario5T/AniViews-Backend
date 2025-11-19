import { Router } from 'express';
import List from '../models/List.js';
import Review from '../models/Review.js';
import { authRequired } from '../middleware/auth.js';
const router = Router();
router.get('/me', authRequired, async (req, res) => {
  const myLists = await List.find({ user: req.user.id });
  const mySeen = new Set(myLists.flatMap(l => l.items.map(i => i.malId)));
  const myTop = myLists.flatMap(l => l.items).filter(i => (i.score || 0) >= 8).map(i => ({ malId: i.malId, source: 'self', score: i.score || 8 }));

  const liked = await Review.find({ rating: { $gte: 8 } }).limit(100);
  const crowdTop = liked
    .filter(r => !mySeen.has(r.malId))
    .reduce((acc, r) => { acc[r.malId] = (acc[r.malId] || 0) + r.rating; return acc; }, {});

  const crowdList = Object.entries(crowdTop).map(([malId, score]) => ({ malId: Number(malId), source: 'crowd', score }));
  const results = [...myTop, ...crowdList]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  res.json({ recommendations: results });
});

export default router;
