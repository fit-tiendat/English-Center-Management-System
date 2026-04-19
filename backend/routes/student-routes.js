const express = require('express');
const router = express.Router();
const Student = require('../models/student-model');
const Class = require('../models/class-model');

// Helper: tính derived status cho students
async function addDerivedStatus(students) {
  const ongoingClasses = await Class.find({ status: 'ongoing' }).select('students');
  const activeStudentIds = new Set();
  ongoingClasses.forEach((c) => c.students.forEach((s) => activeStudentIds.add(s.toString())));

  return students.map((s) => {
    const obj = s.toObject();
    obj.derivedStatus = activeStudentIds.has(s._id.toString()) ? 'Đang học' : 'Chưa xếp lớp';
    return obj;
  });
}

// GET /api/students — Lấy tất cả students (kèm derived status)
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    const data = await addDerivedStatus(students);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:id — Lấy 1 student theo ID (kèm derived status)
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });
    }
    const [data] = await addDerivedStatus([student]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students — Tạo student mới
router.post('/', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/students/:id — Cập nhật student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/students/:id — Xóa student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học viên' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
