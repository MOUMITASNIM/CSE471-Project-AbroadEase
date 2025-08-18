import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import Post from '../models/Post.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { type, country, q } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (country) filter.country = country;
  if (q) filter.title = new RegExp(q, 'i');

  const posts = await Post.find(filter).sort({ createdAt: -1 });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const post = await Post.create({ ...req.body, author: req.user.id });
  res.json(post);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(post);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;

