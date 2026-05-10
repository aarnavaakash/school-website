const express = require('express');
const router = express.Router();
const { getAdmissions, createAdmission, deleteAdmission } = require('../controllers/admissionController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, admin, getAdmissions)
  .post(upload.single('photoFile'), createAdmission);

router.route('/:id')
  .delete(protect, admin, deleteAdmission);

module.exports = router;
