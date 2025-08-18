import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json(user);
});

router.put('/', requireAuth, async (req, res) => {
  const { name, resumeUrl, cvUrl, password } = req.body;
  const updates = { name, resumeUrl, cvUrl };

  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
  res.json(user);
});

export default router;
