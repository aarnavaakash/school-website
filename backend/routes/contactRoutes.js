const express = require('express');
const router = express.Router();
const { getMessages, createMessage, deleteMessage } = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getMessages)
  .post(createMessage);

router.route('/:id')
  .delete(protect, admin, deleteMessage);

module.exports = router;
