import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import List from '../models/List.js';
import Review from '../models/Review.js';
import Thread from '../models/Thread.js';
import Comment from '../models/Comment.js';

dotenv.config();

async function run() {
  await connectDB();
  console.log('Seeding database...');
  try {
    // wipe existing (safe for dev only)
    await Promise.all([
      User.deleteMany({}),
      List.deleteMany({}),
      Review.deleteMany({}),
      Thread.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    // users
    const pw = await bcrypt.hash('secret123', 10);
    const [alice, bob, charlie] = await User.create([
      { username: 'alice', email: 'alice@example.com', passwordHash: pw, following: [], followers: [] },
      { username: 'bob', email: 'bob@example.com', passwordHash: pw, following: [], followers: [] },
      { username: 'charlie', email: 'charlie@example.com', passwordHash: pw, following: [], followers: [] },
    ]);

    // follow graph: alice follows bob and charlie
    await User.updateOne({ _id: alice._id }, { $addToSet: { following: { $each: [bob._id, charlie._id] } } });
    await User.updateOne({ _id: bob._id }, { $addToSet: { followers: alice._id } });
    await User.updateOne({ _id: charlie._id }, { $addToSet: { followers: alice._id } });

    // lists for alice
    const watchlist = await List.create({
      user: alice._id,
      name: 'Alice Watchlist',
      description: 'Shows to watch soon',
      items: [
        { malId: 5114, title: 'Fullmetal Alchemist: Brotherhood', score: 10, status: 'completed' },
        { malId: 9253, title: 'Steins;Gate', score: 9, status: 'watching' },
        { malId: 11061, title: 'Hunter x Hunter (2011)', score: 10, status: 'completed' },
      ],
    });

    // reviews for a few titles
    await Review.create([
      { user: alice._id, malId: 5114, rating: 10, text: 'Masterpiece. A must-watch.' },
      { user: bob._id, malId: 9253, rating: 9, text: 'Mind-bending sci-fi with great characters.' },
      { user: charlie._id, malId: 11061, rating: 10, text: 'Incredible journey and fights.' },
      { user: alice._id, malId: 1735, rating: 8, text: 'Classic shounen energy.' },
    ]);

    // threads and comments
    const t1 = await Thread.create({ user: bob._id, malId: 9253, title: 'Steins;Gate rewatch club', body: 'Starting rewatch — join in! @Steins Gate', commentsCount: 0 });
    const t2 = await Thread.create({ user: charlie._id, malId: 11061, title: 'HxH favorite arcs?', body: 'Yorknew vs Chimera Ant? @Hunter x Hunter', commentsCount: 0 });

    const c1 = await Comment.create({ thread: t1._id, user: alice._id, body: 'Count me in! I love episode 12 twist.' });
    const c2 = await Comment.create({ thread: t2._id, user: alice._id, body: 'Chimera Ant arc is peak.' });

    await Thread.updateOne({ _id: t1._id }, { $inc: { commentsCount: 1 } });
    await Thread.updateOne({ _id: t2._id }, { $inc: { commentsCount: 1 } });

    console.log('Seed complete:');
    console.log('Users: alice/bob/charlie with password "secret123"');
    console.log(`Alice id: ${alice._id}`);
  } catch (e) {
    console.error('Seed failed', e);
  } finally {
    await mongoose.connection.close();
  }
}

run();
