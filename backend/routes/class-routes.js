const express = require('express');
const router = express.Router();
const Class = require('../models/class-model');

// Populate options dùng chung
const populateOpts = [
  { path: 'course', select: 'name level' },
  { path: 'teacher', select: 'fullName email' },
  { path: 'students', select: 'fullName email level' },
];

// GET /api/classes — Lấy tất cả classes (có populate)
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find()
      .populate(populateOpts)
      .sort({ createdAt: -1 });
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/classes/:id — Lấy 1 class theo ID (có populate)
router.get('/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate(populateOpts);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }
    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/classes — Tạo class mới
router.post('/', async (req, res) => {
  try {
    // Loại bỏ duplicate student ids
    if (req.body.students && Array.isArray(req.body.students)) {
      req.body.students = [...new Set(req.body.students)];
    }

    // Kiểm tra số lượng students không vượt maxStudents
    if (req.body.students && req.body.maxStudents) {
      if (req.body.students.length > req.body.maxStudents) {
        return res.status(400).json({
          success: false,
          message: `Số học viên (${req.body.students.length}) vượt quá sĩ số tối đa (${req.body.maxStudents})`,
        });
      }
    }

    const cls = await Class.create(req.body);
    const populated = await cls.populate(populateOpts);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/classes/:id — Cập nhật class
router.put('/:id', async (req, res) => {
  try {
    // Loại bỏ duplicate student ids
    if (req.body.students && Array.isArray(req.body.students)) {
      req.body.students = [...new Set(req.body.students)];
    }

    // Lấy class hiện tại để check maxStudents
    const existing = await Class.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }

    const maxStudents = req.body.maxStudents != null ? req.body.maxStudents : existing.maxStudents;
    const studentCount = req.body.students ? req.body.students.length : existing.students.length;

    if (studentCount > maxStudents) {
      return res.status(400).json({
        success: false,
        message: `Số học viên (${studentCount}) vượt quá sĩ số tối đa (${maxStudents})`,
      });
    }

    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(populateOpts);

    res.json({ success: true, data: cls });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/classes/:id — Xóa class
router.delete('/:id', async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
    }
    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
