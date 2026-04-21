const express = require('express');
const router = express.Router();
const Course = require('../models/course-model');
const Class = require('../models/class-model');

// Helper: tính classCount + studentCount cho courses
async function addDerivedData(courses) {
  const allClasses = await Class.find().select('course students');
  const classCountMap = {};
  const studentCountMap = {};

  allClasses.forEach((c) => {
    if (!c.course) return;
    const cid = c.course.toString();
    classCountMap[cid] = (classCountMap[cid] || 0) + 1;
    studentCountMap[cid] = (studentCountMap[cid] || 0) + (c.students ? c.students.length : 0);
  });

  return courses.map((c) => {
    const obj = c.toObject();
    const cid = c._id.toString();
    obj.classCount = classCountMap[cid] || 0;
    obj.studentCount = studentCountMap[cid] || 0;
    obj.registrationStatus = c.isActive ? 'Đang mở' : 'Đã đóng';
    return obj;
  });
}

// GET /api/courses — Lấy tất cả courses (kèm derived data)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    const data = await addDerivedData(courses);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/courses/:id — Lấy 1 course theo ID (kèm derived data)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }
    const [data] = await addDerivedData([course]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses — Tạo course mới
router.post('/', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/courses/:id — Cập nhật course
router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/:id — Xóa course (kiểm tra ràng buộc với lớp học)
router.delete('/:id', async (req, res) => {
  try {
    // Kiểm tra xem khóa học có đang được gán vào lớp nào không
    const linkedClasses = await Class.find({ course: req.params.id }).select('name');
    if (linkedClasses.length > 0) {
      const classNames = linkedClasses.map((c) => c.name).join(', ');
      return res.status(400).json({
        success: false,
        message: `Không thể xóa! Khóa học đang được sử dụng bởi ${linkedClasses.length} lớp: ${classNames}. Hãy xóa hoặc đổi khóa học cho các lớp này trước.`,
      });
    }
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
