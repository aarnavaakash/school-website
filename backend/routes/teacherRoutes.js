const express = require('express');
const router = express.Router();
const { getTeachers, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getTeachers)
  .post(protect, admin, upload.single('photo'), createTeacher);

router.route('/:id')
  .put(protect, admin, upload.single('photo'), updateTeacher)
  .delete(protect, admin, deleteTeacher);

module.exports = router;
