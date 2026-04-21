const express = require('express');
const router = express.Router();
const Teacher = require('../models/teacher-model');
const Class = require('../models/class-model');

// Helper: tính derived status + classCount + classNames cho teachers
async function addDerivedStatus(teachers) {
  const allClasses = await Class.find().select('teacher status name');
  const ongoingTeacherIds = new Set();
  const classCountMap = {};
  const classNamesMap = {};

  allClasses.forEach((c) => {
    if (!c.teacher) return;
    const tid = c.teacher.toString();
    classCountMap[tid] = (classCountMap[tid] || 0) + 1;
    if (!classNamesMap[tid]) classNamesMap[tid] = [];
    classNamesMap[tid].push(c.name);
    if (c.status === 'Đang học') ongoingTeacherIds.add(tid);
  });

  return teachers.map((t) => {
    const obj = t.toObject();
    const tid = t._id.toString();
    obj.derivedStatus = ongoingTeacherIds.has(tid) ? 'Đang dạy' : 'Chưa phân công';
    obj.classCount = classCountMap[tid] || 0;
    obj.classNames = classNamesMap[tid] || [];
    return obj;
  });
}

// GET /api/teachers — Lấy tất cả teachers (kèm derived status)
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    const data = await addDerivedStatus(teachers);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/teachers/:id — Lấy 1 teacher theo ID (kèm derived status)
router.get('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giảng viên' });
    }
    const [data] = await addDerivedStatus([teacher]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/teachers — Tạo teacher mới
router.post('/', async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const msg = field === 'email' ? 'Email đã tồn tại' : field === 'phone' ? 'Số điện thoại đã tồn tại' : `${field} đã tồn tại`;
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/teachers/:id — Cập nhật teacher
router.put('/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giảng viên' });
    }
    res.json({ success: true, data: teacher });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const msg = field === 'email' ? 'Email đã tồn tại' : field === 'phone' ? 'Số điện thoại đã tồn tại' : `${field} đã tồn tại`;
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/teachers/:id — Xóa teacher (kiểm tra ràng buộc với lớp học)
router.delete('/:id', async (req, res) => {
  try {
    // Kiểm tra xem giảng viên có đang được gán vào lớp nào không
    const linkedClasses = await Class.find({ teacher: req.params.id }).select('name');
    if (linkedClasses.length > 0) {
      const classNames = linkedClasses.map((c) => c.name).join(', ');
      return res.status(400).json({
        success: false,
        message: `Không thể xóa! Giảng viên đang phụ trách ${linkedClasses.length} lớp: ${classNames}. Hãy đổi giảng viên cho các lớp này trước.`,
      });
    }
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giảng viên' });
    }
    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
