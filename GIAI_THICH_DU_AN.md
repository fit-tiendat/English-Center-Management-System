# 📘 Tài liệu Giải thích Dự án — English Center Management System

> **Tác giả:** Sinh viên  
> **Stack:** Node.js + Express + MongoDB (Mongoose) + Vanilla HTML/CSS/JS  
> **Mục đích:** Quản lý trung tâm tiếng Anh — Khóa học, Giảng viên, Học viên, Lớp học

---

## Mục lục

1. [Cấu trúc thư mục](#1-cấu-trúc-thư-mục)
2. [Cách chạy Local](#2-cách-chạy-local)
3. [Kết nối MongoDB Atlas (Cloud)](#3-kết-nối-mongodb-atlas-cloud)
4. [Giải thích Backend](#4-giải-thích-backend)
5. [Danh sách API endpoints](#5-danh-sách-api-endpoints)
6. [Giải thích các hàm Mongoose quan trọng](#6-giải-thích-các-hàm-mongoose-quan-trọng)
7. [Giải thích Frontend](#7-giải-thích-frontend)
8. [Hệ thống Validation](#8-hệ-thống-validation)
9. [Hệ thống Filter (Lọc)](#9-hệ-thống-filter-lọc)
10. [Derived Status (Trạng thái tự suy ra)](#10-derived-status)
11. [Deploy lên Cloud](#11-deploy-lên-cloud)

---

## 1. Cấu trúc thư mục

```
project_co_Khoa/
├── .env                    ← File chứa MONGO_URI (KHÔNG push lên git)
├── .env.example            ← Mẫu file .env
├── .gitignore              ← Bỏ qua node_modules, .env
├── README.md               ← Hướng dẫn sử dụng
│
├── backend/                ← SERVER (Node.js + Express)
│   ├── package.json        ← Dependencies (express, mongoose, cors, dotenv)
│   ├── server.js           ← Entry point — khởi động server
│   ├── config/
│   │   └── db.js           ← Kết nối MongoDB
│   ├── models/             ← Mongoose schemas (cấu trúc dữ liệu)
│   │   ├── course-model.js
│   │   ├── teacher-model.js
│   │   ├── student-model.js
│   │   └── class-model.js
│   └── routes/             ← API endpoints (CRUD)
│       ├── course-routes.js
│       ├── teacher-routes.js
│       ├── student-routes.js
│       └── class-routes.js
│
└── frontend/               ← CLIENT (HTML/CSS/JS thuần)
    ├── index.html           ← Trang chủ (dashboard)
    ├── courses.html         ← Trang quản lý khóa học
    ├── teachers.html        ← Trang quản lý giảng viên
    ├── students.html        ← Trang quản lý học viên
    ├── classes.html         ← Trang quản lý lớp học
    ├── css/
    │   └── style.css        ← CSS chung (layout, buttons, filter chips...)
    └── js/
        ├── shared.js        ← Hàm dùng chung (fetchJSON, showToast, validation...)
        ├── courses.js       ← Logic CRUD + filter cho khóa học
        ├── teachers.js      ← Logic CRUD + filter cho giảng viên
        ├── students.js      ← Logic CRUD + filter cho học viên
        └── classes.js       ← Logic CRUD + filter cho lớp học
```

---

## 2. Cách chạy Local

### Bước 1: Cài MongoDB

- Tải MongoDB Community Server: https://www.mongodb.com/try/download/community
- Hoặc dùng MongoDB Atlas (xem phần 3)

### Bước 2: Tạo file `.env`

Tạo file `.env` ở **thư mục gốc** (cùng cấp với `backend/`):

```env
MONGO_URI=mongodb://localhost:27017/english-center
PORT=3000
```

### Bước 3: Cài dependencies

```bash
cd backend
npm install
```

Lệnh này sẽ đọc `package.json` và cài 4 thư viện:
- **express** — web framework, tạo API server
- **mongoose** — thư viện kết nối và thao tác MongoDB
- **cors** — cho phép frontend gọi API từ domain khác
- **dotenv** — đọc biến môi trường từ file `.env`

### Bước 4: Chạy server

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`.
Mở trình duyệt vào `http://localhost:3000` → thấy trang chủ.

### Luồng khởi động (server.js)

```
1. Load .env (nếu file tồn tại — local dev)
2. Tạo Express app
3. Bật middleware: cors(), express.json()
4. Serve static files từ frontend/ (nếu thư mục tồn tại)
5. Mount 4 bộ routes: /api/courses, /api/teachers, /api/students, /api/classes
6. Kết nối MongoDB → Start server trên PORT
```

---

## 3. Kết nối MongoDB Atlas (Cloud)

### MongoDB Atlas là gì?
- Dịch vụ **cloud database** miễn phí của MongoDB
- Dữ liệu lưu trên cloud → không cần cài MongoDB trên máy
- Truy cập từ bất kỳ đâu qua connection string

### Cách em đã làm

**Bước 1:** Tạo tài khoản tại https://cloud.mongodb.com

**Bước 2:** Tạo Cluster miễn phí (M0 Free Tier)

**Bước 3:** Tạo Database User (username + password)

**Bước 4:** Whitelist IP → "Allow Access From Anywhere" (`0.0.0.0/0`)
- ⚠️ Nếu không whitelist → Railway (cloud server) không kết nối được vì IP động

**Bước 5:** Lấy Connection String, đổi `<password>`:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/english-center?retryWrites=true&w=majority
```

**Bước 6:** Đặt vào `.env` (local) hoặc Railway env variables (production)

### Code kết nối (`backend/config/db.js`)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
```

- `mongoose.connect(process.env.MONGO_URI)` — kết nối đến MongoDB bằng URI
- URI có thể là `localhost` (local) hoặc `mongodb+srv://...` (Atlas cloud)
- Code **không cần thay đổi** — chỉ đổi giá trị trong `.env`

---

## 4. Giải thích Backend

### 4.1 Models (Mongoose Schema)

Model định nghĩa **cấu trúc dữ liệu** trong MongoDB. Mỗi model tương ứng với 1 **collection** (bảng).

#### Course Model (`course-model.js`)
```javascript
const courseSchema = new mongoose.Schema({
  name:        { type: String, required: true },     // Tên khóa học
  description: { type: String, default: '' },        // Mô tả
  level:       { type: String, required: true },     // Trình độ (A1-C1)
  duration:    { type: String, required: true },     // Thời lượng
  fee:         { type: Number, required: true, min: 0 }, // Học phí
  isActive:    { type: Boolean, default: true },     // Đang mở hay đóng
}, { timestamps: true }); // tự tạo createdAt, updatedAt
```

#### Teacher Model — có `unique` và `enum`
```javascript
email: { type: String, unique: true, ... }  // KHÔNG cho trùng email
phone: { type: String, unique: true, match: [/^\d{9,11}$/] } // chỉ số, 9-11 ký tự
specialties: {
  type: String,
  enum: ['IELTS', 'TOEIC', 'Giao tiếp', 'VSTEP'] // CHỈ chấp nhận 4 giá trị này
}
```

#### Student Model — có `validate` custom
```javascript
dateOfBirth: {
  type: Date,
  validate: {
    validator: function(v) { return v <= new Date(); }, // không cho ngày tương lai
    message: 'Ngày sinh không được ở tương lai'
  }
}
level: { type: String, enum: ['A1','A2','B1','B2','C1'] }
```

#### Class Model — có `ref` (tham chiếu)
```javascript
course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },   // tham chiếu đến Course
teacher:  { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },  // tham chiếu đến Teacher
students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] // mảng tham chiếu Student
status:   { type: String, enum: ['planned','ongoing','completed','cancelled'] }
```

- `ObjectId` = ID duy nhất trong MongoDB
- `ref: 'Course'` = trường này chứa ID của 1 document trong collection Course
- Giống **foreign key** trong SQL

### 4.2 Routes (API Endpoints)

Mỗi file route xử lý 5 thao tác CRUD:

| Method | URL | Chức năng |
|--------|-----|-----------|
| GET | `/api/courses` | Lấy tất cả |
| GET | `/api/courses/:id` | Lấy theo ID |
| POST | `/api/courses` | Tạo mới |
| PUT | `/api/courses/:id` | Cập nhật |
| DELETE | `/api/courses/:id` | Xóa |

---

## 5. Danh sách API Endpoints

### Courses (4 endpoints)
| Method | URL | Body | Response |
|--------|-----|------|----------|
| `GET` | `/api/courses` | — | `{ success: true, data: [...] }` |
| `GET` | `/api/courses/:id` | — | `{ success: true, data: {...} }` |
| `POST` | `/api/courses` | `{ name, level, duration, fee }` | `{ success: true, data: {...} }` |
| `PUT` | `/api/courses/:id` | `{ name, level, ... }` | `{ success: true, data: {...} }` |
| `DELETE` | `/api/courses/:id` | — | `{ success: true, data: {...} }` |

### Teachers (5 endpoints) — có derived status
| Method | URL | Đặc biệt |
|--------|-----|-----------|
| `GET` | `/api/teachers` | Trả thêm `derivedStatus` + `classCount` |
| `GET` | `/api/teachers/:id` | Trả thêm `derivedStatus` + `classCount` |
| `POST` | `/api/teachers` | Bắt trùng email/phone → "Email đã tồn tại" |
| `PUT` | `/api/teachers/:id` | Bắt trùng email/phone |
| `DELETE` | `/api/teachers/:id` | — |

### Students (5 endpoints) — có derived status
| Method | URL | Đặc biệt |
|--------|-----|-----------|
| `GET` | `/api/students` | Trả thêm `derivedStatus` + `classCount` |
| `POST` | `/api/students` | Bắt trùng email/phone |

### Classes (5 endpoints) — có populate
| Method | URL | Đặc biệt |
|--------|-----|-----------|
| `GET` | `/api/classes` | `.populate()` thay ID bằng data thực |
| `POST` | `/api/classes` | Check students ≤ maxStudents |

### Health Check
| Method | URL | Response |
|--------|-----|----------|
| `GET` | `/api/health` | `{ success: true, message: "Server is running" }` |

**Tổng: 21 endpoints**

---

## 6. Giải thích các hàm Mongoose quan trọng

### `.populate()` — Thay ObjectId bằng dữ liệu thật

**Vấn đề:** Class lưu `course: "507f1f77bcf86cd799439011"` (chỉ là ID)
→ Frontend cần tên khóa học, không phải ID

**Giải pháp:** `.populate('course')` — Mongoose tự query collection Course, lấy document có ID đó, gắn vào

```javascript
// KHÔNG có populate — chỉ trả ID:
{ course: "507f1f77bcf86cd799439011", teacher: "608a2b..." }

// CÓ populate — trả dữ liệu đầy đủ:
{ course: { _id: "507f...", name: "IELTS Foundation", level: "B1" },
  teacher: { _id: "608a...", fullName: "Nguyễn Văn A", email: "a@gmail.com" } }
```

**Code thực tế trong `class-routes.js`:**
```javascript
const populateOpts = [
  { path: 'course', select: 'name level' },       // lấy name + level từ Course
  { path: 'teacher', select: 'fullName email' },   // lấy fullName + email từ Teacher
  { path: 'students', select: 'fullName email level' }, // lấy info từ Student
];

const classes = await Class.find().populate(populateOpts);
```

- `path: 'course'` = tên trường cần populate
- `select: 'name level'` = chỉ lấy 2 trường (tiết kiệm bandwidth)

### `.sort()` — Sắp xếp kết quả

```javascript
const teachers = await Teacher.find().sort({ createdAt: -1 });
```

- `{ createdAt: -1 }` = sắp xếp theo `createdAt` **giảm dần** (mới nhất lên trước)
- `-1` = giảm dần (DESC), `1` = tăng dần (ASC)
- Giống `ORDER BY createdAt DESC` trong SQL

### `.find()` — Tìm tất cả documents

```javascript
const allClasses = await Class.find();                      // lấy TẤT CẢ
const ongoingClasses = await Class.find({ status: 'ongoing' }); // lấy có điều kiện
```

### `.findById()` — Tìm 1 document theo ID

```javascript
const teacher = await Teacher.findById(req.params.id);
// req.params.id = ID từ URL, VD: /api/teachers/507f1f77...
```

### `.create()` — Tạo document mới

```javascript
const teacher = await Teacher.create(req.body);
// req.body = dữ liệu JSON từ frontend gửi lên
// Mongoose tự validate trước khi lưu
```

### `.findByIdAndUpdate()` — Cập nhật

```javascript
const teacher = await Teacher.findByIdAndUpdate(id, req.body, {
  new: true,          // trả về document ĐÃ CẬP NHẬT (không phải bản cũ)
  runValidators: true // chạy validation khi update (mặc định Mongoose bỏ qua)
});
```

### `.findByIdAndDelete()` — Xóa

```javascript
const teacher = await Teacher.findByIdAndDelete(id);
```

---

## 7. Giải thích Frontend

### 7.1 Kiến trúc

Frontend là **HTML/CSS/JS thuần** — không dùng React, Vue hay framework nào.

Mỗi trang gồm:
- `xxx.html` — cấu trúc (form + bảng)
- `js/shared.js` — hàm dùng chung
- `js/xxx.js` — logic CRUD + filter riêng cho trang đó

### 7.2 shared.js — Các hàm dùng chung

| Hàm | Chức năng |
|-----|-----------|
| `fetchJSON(url, options)` | Gọi API, tự thêm header JSON, tự parse response |
| `showToast(message, type)` | Hiển thị thông báo nổi (xanh = thành công, đỏ = lỗi) |
| `renderNav(activePage)` | Render thanh navigation, highlight trang hiện tại |
| `formatCurrency(amount)` | Format số thành tiền VND: `1500000` → `1.500.000 ₫` |
| `isValidPhone(phone)` | Kiểm tra SĐT: chỉ số, 9-11 ký tự |
| `isDateNotFuture(dateStr)` | Kiểm tra ngày không ở tương lai |
| `isPositiveInteger(value)` | Kiểm tra số nguyên dương |
| `isNonNegativeNumber(value)` | Kiểm tra số ≥ 0 |

### 7.3 Luồng CRUD trên mỗi trang

```
Trang load → gọi API GET → lưu vào biến allXxx → render bảng + filter chips

User nhấn "Thêm":
  → validate form (client-side)
  → gọi API POST
  → nếu thành công: reset form + reload data
  → nếu lỗi: showToast(error message)

User nhấn "Sửa":
  → gọi API GET /:id → đổ dữ liệu lên form
  → đổi tiêu đề form + nút submit
  → khi submit → gọi API PUT

User nhấn "Xóa":
  → confirm() hỏi xác nhận
  → gọi API DELETE
  → reload data
```

---

## 8. Hệ thống Validation (2 lớp)

### Lớp 1: Frontend (trước khi gửi API)

```javascript
// Trong courses.js
if (!name) { showToast('Tên khóa học là bắt buộc', 'error'); return; }
if (!level) { showToast('Vui lòng chọn trình độ', 'error'); return; }
if (!isNonNegativeNumber(feeRaw)) { showToast('Học phí phải là số không âm', 'error'); return; }
```

→ **Chặn sớm**, user thấy lỗi ngay, không gửi request thừa.

### Lớp 2: Backend (Mongoose validators)

```javascript
// Trong teacher-model.js
phone: { match: [/^\d{9,11}$/, 'Số điện thoại phải có 9-11 chữ số'] }
specialties: { enum: ['IELTS', 'TOEIC', 'Giao tiếp', 'VSTEP'] }
```

→ **Bảo vệ cuối cùng**, ngay cả khi có người gọi API trực tiếp (bỏ qua frontend).

### Xử lý lỗi trùng (Duplicate)

```javascript
// Trong teacher-routes.js / student-routes.js
if (error.code === 11000) {
  const field = Object.keys(error.keyPattern)[0];
  const msg = field === 'email' ? 'Email đã tồn tại' : 'Số điện thoại đã tồn tại';
  return res.status(400).json({ success: false, message: msg });
}
```

- `error.code === 11000` = lỗi MongoDB khi vi phạm `unique` index
- `error.keyPattern` cho biết trường nào bị trùng

---

## 9. Hệ thống Filter (Lọc)

### Cách hoạt động

Filter **100% ở frontend** — không gọi thêm API:

```
1. Trang load → gọi API 1 lần → lưu vào allTeachers (mảng gốc)
2. User click chip "Đang dạy"
3. JS lọc: filteredData = allTeachers.filter(t => t.derivedStatus === 'Đang dạy')
4. Re-render bảng với filteredData
5. Không reload trang, không gọi API lại
```

### Code filter trong `teachers.js`

```javascript
let allTeachers = [];     // mảng gốc — giữ nguyên
let activeFilter = 'all'; // filter đang chọn

function getFilteredTeachers() {
  switch (activeFilter) {
    case 'teaching':   return allTeachers.filter(t => t.derivedStatus === 'Đang dạy');
    case 'unassigned': return allTeachers.filter(t => t.derivedStatus === 'Chưa phân công');
    case 'multi':      return allTeachers.filter(t => t.classCount >= 2);
    default:           return allTeachers;
  }
}

function setFilter(key) {
  activeFilter = key;     // đổi filter
  renderFilters();        // cập nhật chip active
  renderTable();          // render lại bảng
}
```

### Filter chips với counter

```javascript
function renderFilters() {
  const filters = [
    { key: 'all', label: 'Tất cả', count: allTeachers.length },
    { key: 'teaching', label: 'Đang dạy', count: allTeachers.filter(...).length },
    ...
  ];
  // Render ra HTML: <button class="filter-chip active">Tất cả (5)</button>
}
```

### Filter trang Classes — 2 nhóm kết hợp

Classes có **2 bộ filter riêng** có thể kết hợp:

```javascript
let activeCourseFilter = 'all'; // lọc theo khóa học
let activeStatusFilter = 'all'; // lọc theo trạng thái

function getFilteredClasses() {
  var result = allClasses;
  if (activeCourseFilter !== 'all') {
    result = result.filter(c => c.course && c.course._id === activeCourseFilter);
  }
  if (activeStatusFilter !== 'all') {
    result = result.filter(c => c.status === activeStatusFilter);
  }
  return result;
}
```

→ Có thể chọn "IELTS" + "Đang học" cùng lúc → chỉ hiện lớp IELTS đang ongoing.

---

## 10. Derived Status (Trạng thái tự suy ra)

### Vấn đề
Trước đây status teacher/student là **hard-code** (`isActive: true/false`).
→ Không phản ánh đúng: teacher có thể "active" nhưng chưa được gán class nào.

### Giải pháp: Suy ra từ dữ liệu thực

```javascript
// Trong teacher-routes.js
async function addDerivedStatus(teachers) {
  // 1. Query TẤT CẢ classes từ DB
  const allClasses = await Class.find().select('teacher status');

  // 2. Tìm teacher nào đang có class "ongoing"
  const ongoingTeacherIds = new Set();
  const classCountMap = {};

  allClasses.forEach(c => {
    const tid = c.teacher.toString();
    classCountMap[tid] = (classCountMap[tid] || 0) + 1;  // đếm số class
    if (c.status === 'ongoing') ongoingTeacherIds.add(tid); // đánh dấu ongoing
  });

  // 3. Gắn status cho từng teacher
  return teachers.map(t => {
    const obj = t.toObject();
    obj.derivedStatus = ongoingTeacherIds.has(t._id.toString())
      ? 'Đang dạy'       // có ≥1 class ongoing
      : 'Chưa phân công'; // không có class ongoing nào
    obj.classCount = classCountMap[t._id.toString()] || 0;
    return obj;
  });
}
```

| Tình huống | derivedStatus | classCount |
|---|---|---|
| Teacher chưa gán class nào | "Chưa phân công" | 0 |
| Teacher có 1 class ongoing | "Đang dạy" | 1 |
| Teacher có 3 class (2 ongoing) | "Đang dạy" | 3 |

---

## 11. Deploy lên Cloud

### Kiến trúc

```
GitHub repo
  ├── backend/  → Railway (Node.js server)
  ├── frontend/ → Vercel (static HTML/CSS/JS)
  └── DB        → MongoDB Atlas (cloud database)
```

### Vấn đề đã gặp và cách fix

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| Build failed trên Railway | Chưa set Root Directory | Set Root Directory = `backend` |
| MongoDB connection error | Atlas chặn IP Railway | Whitelist `0.0.0.0/0` |
| 502 Bad Gateway | NODE_ENV bị nối sai | Thay `NODE_ENV` check bằng `fs.existsSync()` |

### File `server.js` — xử lý local vs production

```javascript
// Load .env CHỈ KHI file tồn tại (= đang chạy local)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Serve frontend CHỈ KHI thư mục tồn tại (= đang chạy local)
const frontendPath = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}
```

→ Không cần `if (NODE_ENV === 'production')` — check file tồn tại an toàn hơn.

---

## Tóm tắt công nghệ đã sử dụng

| Công nghệ | Vai trò |
|---|---|
| **Node.js** | Runtime JavaScript phía server |
| **Express.js** | Web framework — tạo API routes |
| **MongoDB** | NoSQL database — lưu trữ dữ liệu |
| **Mongoose** | ODM — thao tác MongoDB qua JavaScript |
| **dotenv** | Đọc biến môi trường từ file `.env` |
| **cors** | Cho phép cross-origin requests |
| **HTML/CSS/JS** | Frontend thuần — không framework |
| **Fetch API** | Gọi REST API từ trình duyệt |
| **MongoDB Atlas** | Cloud database |
| **Railway** | Cloud hosting cho backend |
