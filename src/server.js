import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import listsRoutes from './routes/lists.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import recommendationsRoutes from './routes/recommendations.routes.js';
import threadsRoutes from './routes/threads.routes.js';

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/threads', threadsRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}).catch((err) => {
  console.error('DB connection failed', err);
  process.exit(1);
});
