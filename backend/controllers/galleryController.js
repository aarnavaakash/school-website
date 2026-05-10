const Gallery = require('../models/Gallery');

exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createGalleryItem = async (req, res) => {
  try {
    const itemData = { ...req.body };
    if (req.file) {
      itemData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const item = await Gallery.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const itemData = { ...req.body };
    if (req.file) {
      itemData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const item = await Gallery.findByIdAndUpdate(req.params.id, itemData, { new: true });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (item) {
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
