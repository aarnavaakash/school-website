const express = require('express');
const router = express.Router();
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getNotices)
  .post(protect, admin, createNotice);

router.route('/:id')
  .put(protect, admin, updateNotice)
  .delete(protect, admin, deleteNotice);

module.exports = router;
