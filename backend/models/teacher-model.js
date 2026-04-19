const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên giảng viên là bắt buộc'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      unique: true,
      match: [/^\d{9,11}$/, 'Số điện thoại phải có 9-11 chữ số'],
    },
    specialties: {
      type: String,
      required: [true, 'Chuyên môn là bắt buộc'],
      enum: {
        values: ['IELTS', 'TOEIC', 'Giao tiếp', 'VSTEP'],
        message: 'Chuyên môn phải là IELTS, TOEIC, Giao tiếp, hoặc VSTEP',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Teacher', teacherSchema);
