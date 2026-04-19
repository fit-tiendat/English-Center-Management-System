const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load .env nếu file tồn tại (local dev) — production (Railway) inject env tự động
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // MVP: mở cho tất cả origins
app.use(express.json());

/*
  CORS NOTE cho production:
  Khi cần restrict, thay cors() bằng:
  app.use(cors({
    origin: ['https://your-frontend.vercel.app'],
  }));
*/

// Serve static files — chỉ khi thư mục frontend tồn tại (local dev)
// Production (Railway): chỉ deploy backend/, không có frontend/
const frontendPath = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
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
    console.log(`Server running on port ${PORT}`);
  });
});
