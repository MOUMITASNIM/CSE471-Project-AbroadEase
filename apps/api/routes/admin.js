// routes/admin.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// TEMP: promote a user to admin (remove after testing)
router.post('/make-admin', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User promoted to admin', user });
});

export default router;
