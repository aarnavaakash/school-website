const express = require('express');
const router = express.Router();
const { getStudents, createStudent, updateStudent, deleteStudent, getStudentDashboard } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, upload.single('photo'), createStudent);

router.route('/:id')
  .put(protect, admin, upload.single('photo'), updateStudent)
  .delete(protect, admin, deleteStudent);

router.get('/dashboard/me', protect, getStudentDashboard);

module.exports = router;
