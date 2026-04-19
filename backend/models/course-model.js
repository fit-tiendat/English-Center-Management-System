const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên khóa học là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      required: [true, 'Trình độ là bắt buộc'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Thời lượng là bắt buộc'],
      trim: true,
    },
    fee: {
      type: Number,
      required: [true, 'Học phí là bắt buộc'],
      min: [0, 'Học phí không được âm'],
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

module.exports = mongoose.model('Course', courseSchema);
