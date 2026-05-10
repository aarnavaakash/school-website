const express = require('express');
const router = express.Router();
const { getHomeworks, createHomework, deleteHomework } = require('../controllers/homeworkController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getHomeworks)
  .post(protect, admin, createHomework);

router.route('/:id')
  .delete(protect, admin, deleteHomework);

module.exports = router;
