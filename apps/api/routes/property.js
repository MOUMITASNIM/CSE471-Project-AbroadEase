import express from 'express';
import Property from '../models/Property.js';
import requireAuth from '../middleware/requireAuth.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// Get all properties with optional filtering
router.get('/', async (req, res) => {
  const { location, type, maxPrice } = req.query;
  const filter = {};
  if (location) filter.location = new RegExp(location, 'i');
  if (type) filter.type = type;
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };

  const props = await Property.find(filter).sort({ createdAt: -1 });
  res.json(props);
});

// Get a single property by ID
router.get('/:id', async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(prop);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create a new property (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const prop = await Property.create(req.body);
    res.status(201).json(prop);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(400).json({ message: "Error creating property", error: error.message });
  }
});

// Update a property by ID (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const prop = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!prop) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(prop);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(400).json({ message: "Error updating property", error: error.message });
  } 
});

// Delete a property by ID (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);
    if (!prop) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
