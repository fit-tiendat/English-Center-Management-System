const express = require('express');
const cors = require('cors');
const path = require('path');

// Load .env ở local dev — Railway inject env tự động
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // MVP: mở cho tất cả origins — xem ghi chú bên dưới
app.use(express.json());

/*
  CORS NOTE cho production:
  Khi cần restrict, thay cors() bằng:
  app.use(cors({
    origin: ['https://your-frontend.vercel.app'],
  }));
*/

// Serve static files — chỉ dùng ở local dev
// Production: frontend deploy riêng trên Vercel
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend')));
}

// Routes
app.use('/api/courses', require('./routes/course-routes'));
app.use('/api/teachers', require('./routes/teacher-routes'));
app.use('/api/students', require('./routes/student-routes'));
app.use('/api/classes', require('./routes/class-routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', env: process.env.NODE_ENV || 'development' });
});

// Kết nối MongoDB rồi start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
});
