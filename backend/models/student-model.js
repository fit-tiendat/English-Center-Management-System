const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Họ tên học viên là bắt buộc'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      match: [/^\d{9,11}$/, 'Số điện thoại phải có 9-11 chữ số'],
    },
    dateOfBirth: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v <= new Date();
        },
        message: 'Ngày sinh không được ở tương lai',
      },
    },
    level: {
      type: String,
      required: [true, 'Trình độ là bắt buộc'],
      trim: true,
      enum: {
        values: ['A1', 'A2', 'B1', 'B2', 'C1'],
        message: 'Trình độ phải là A1, A2, B1, B2, hoặc C1',
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

module.exports = mongoose.model('Student', studentSchema);
