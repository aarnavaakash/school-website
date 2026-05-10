const express = require('express');
const router = express.Router();
const { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getGallery)
  .post(protect, admin, upload.single('image'), createGalleryItem);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateGalleryItem)
  .delete(protect, admin, deleteGalleryItem);

module.exports = router;
