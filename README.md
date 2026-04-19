# Quản lý Trung tâm Tiếng Anh — English Center Management

Hệ thống CRUD quản lý trung tâm tiếng Anh với 4 modules: Khóa học, Giảng viên, Học viên, Lớp học.

**Tech stack:** Node.js + Express + MongoDB + HTML/CSS/JS thuần

---

## 🏗 Cấu trúc project

```
project_co_Khoa/
├── backend/              # Express API server
│   ├── config/db.js      # MongoDB connection
│   ├── models/           # Mongoose schemas (4 models)
│   ├── routes/           # CRUD routes (4 route files)
│   ├── server.js         # Entry point
│   └── package.json
├── frontend/             # Static HTML/CSS/JS
│   ├── css/style.css     # Design system
│   ├── js/shared.js      # API helper, nav, toast
│   ├── js/courses.js     # Courses CRUD
│   ├── js/teachers.js    # Teachers CRUD
│   ├── js/students.js    # Students CRUD
│   ├── js/classes.js     # Classes CRUD (refs 3 collections)
│   ├── index.html        # Dashboard
│   ├── courses.html
│   ├── teachers.html
│   ├── students.html
│   └── classes.html
├── .env                  # Local env (git-ignored)
├── .env.example          # Template
└── .gitignore
```

---

## 🚀 Chạy ở Local

### 1. Clone và cài đặt

```bash
git clone <repo-url>
cd project_co_Khoa

# Tạo file .env
cp .env.example .env
# Sửa MONGO_URI nếu cần (mặc định: mongodb://localhost:27017/english_center)

# Cài dependencies
cd backend
npm install
```

### 2. Chạy backend

```bash
cd backend
npm run dev     # dùng nodemon, tự reload khi sửa code
# hoặc
npm start       # chạy thẳng node
```

Server chạy tại `http://localhost:3000`

### 3. Mở frontend

Khi chạy local, Express serve frontend tự động:
- Dashboard: http://localhost:3000/
- Khóa học: http://localhost:3000/courses.html
- Giảng viên: http://localhost:3000/teachers.html
- Học viên: http://localhost:3000/students.html
- Lớp học: http://localhost:3000/classes.html

### 4. Health check

```bash
curl http://localhost:3000/api/health
```

---

## ☁️ Deploy lên Cloud

### Kiến trúc deploy

| Thành phần | Platform | URL |
|---|---|---|
| Database | MongoDB Atlas | `mongodb+srv://...` |
| Backend API | Railway | `https://xxx.up.railway.app` |
| Frontend | Vercel | `https://xxx.vercel.app` |

### Bước 1: MongoDB Atlas

1. Tạo cluster miễn phí tại [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Tạo database user + password
3. Whitelist IP: `0.0.0.0/0` (cho phép mọi IP)
4. Lấy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/english_center`

### Bước 2: Deploy Backend lên Railway

1. Push code lên GitHub
2. Vào [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. **Root directory:** chọn `backend`
4. Set **environment variables** trong Railway dashboard:
   - `MONGO_URI` = connection string từ Atlas
   - `NODE_ENV` = `production`
   - `PORT` = Railway tự set, không cần khai
5. Railway tự detect `npm start` và deploy
6. Lấy **public URL** (VD: `https://abc.up.railway.app`)
7. Test: `https://abc.up.railway.app/api/health`

### Bước 3: Deploy Frontend lên Vercel

1. **Trước khi deploy**, mở file `frontend/js/shared.js`
2. Đổi dòng:
   ```js
   const BACKEND_URL = ''; 
   ```
   thành:
   ```js
   const BACKEND_URL = 'https://abc.up.railway.app';  // ← URL Railway của bạn
   ```
3. Push lên GitHub
4. Vào [vercel.com](https://vercel.com) → New Project → Import repo
5. **Root directory:** chọn `frontend`
6. **Framework Preset:** `Other`
7. Deploy → xong!

---

## 🔑 Biến môi trường

| Biến | Local | Production (Railway) |
|---|---|---|
| `PORT` | `3000` | Railway tự set |
| `MONGO_URI` | `mongodb://localhost:27017/english_center` | `mongodb+srv://...` (Atlas) |
| `NODE_ENV` | `development` | `production` |

---

## 📡 API Endpoints

Base URL: `/api`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/courses` | Danh sách khóa học |
| GET | `/api/courses/:id` | Chi tiết khóa học |
| POST | `/api/courses` | Tạo khóa học |
| PUT | `/api/courses/:id` | Cập nhật khóa học |
| DELETE | `/api/courses/:id` | Xóa khóa học |
| GET | `/api/teachers` | Danh sách giảng viên |
| GET | `/api/teachers/:id` | Chi tiết giảng viên |
| POST | `/api/teachers` | Tạo giảng viên |
| PUT | `/api/teachers/:id` | Cập nhật giảng viên |
| DELETE | `/api/teachers/:id` | Xóa giảng viên |
| GET | `/api/students` | Danh sách học viên |
| GET | `/api/students/:id` | Chi tiết học viên |
| POST | `/api/students` | Tạo học viên |
| PUT | `/api/students/:id` | Cập nhật học viên |
| DELETE | `/api/students/:id` | Xóa học viên |
| GET | `/api/classes` | Danh sách lớp học (populated) |
| GET | `/api/classes/:id` | Chi tiết lớp học (populated) |
| POST | `/api/classes` | Tạo lớp học |
| PUT | `/api/classes/:id` | Cập nhật lớp học |
| DELETE | `/api/classes/:id` | Xóa lớp học |
