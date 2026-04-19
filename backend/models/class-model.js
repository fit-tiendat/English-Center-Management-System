const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên lớp học là bắt buộc'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Khóa học là bắt buộc'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Giảng viên là bắt buộc'],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    schedule: {
      type: String,
      required: [true, 'Lịch học là bắt buộc'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Ngày bắt đầu là bắt buộc'],
    },
    endDate: {
      type: Date,
      required: [true, 'Ngày kết thúc là bắt buộc'],
    },
    maxStudents: {
      type: Number,
      required: [true, 'Sĩ số tối đa là bắt buộc'],
      min: [1, 'Sĩ số tối đa phải >= 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['planned', 'ongoing', 'completed', 'cancelled'],
        message: 'Trạng thái không hợp lệ',
      },
      default: 'planned',
    },
  },
  {
    timestamps: true,
  }
);

// Validate: endDate >= startDate
classSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'Ngày kết thúc phải sau ngày bắt đầu');
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);
