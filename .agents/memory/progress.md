# Progress Log — Quản lý Trung tâm Tiếng Anh

> Cập nhật sau mỗi phiên làm việc hoặc task lớn.

---

### Planning & Setup
- [x] Xác định mục tiêu project
- [x] Chốt tech stack
- [x] Thiết kế schema 4 collections
- [x] Tạo `.agents/` context, rules, memory, workflows
- [x] Xác nhận cấu trúc thư mục app

### Backend
- [x] Setup Express server + MongoDB connection
- [x] Model: courses
- [x] Model: teachers (+ unique email/phone, specialties enum)
- [x] Model: students (+ unique email/phone, level enum, dateOfBirth validator)
- [x] Model: classes
- [x] Routes: courses CRUD
- [x] Routes: teachers CRUD (+ derived status, classCount, duplicate handling)
- [x] Routes: students CRUD (+ derived status, classCount, duplicate handling)
- [x] Routes: classes CRUD

### Frontend
- [x] CSS chung (style.css + filter chips)
- [x] JS shared (shared.js + validation helpers)
- [x] index.html (dashboard navigation)
- [x] courses.html + courses.js (+ level filter chips)
- [x] teachers.html + teachers.js (+ specialties dropdown, status filter chips)
- [x] students.html + students.js (+ status filter chips)
- [x] classes.html + classes.js (+ dual filter: course + status)

### Integration
- [x] Classes: gán teacher (dropdown)
- [x] Classes: gán students (checkbox multi-select)
- [x] Classes: hiển thị sĩ số (current / max)
- [x] Tất cả CRUD hoạt động end-to-end

### Quality
- [x] MVP final review
- [x] Bug fixes từ review
- [x] Deploy preparation refactor
- [x] Business logic refactor (derived status, validation)
- [x] Data integrity (unique constraints, enum validation)
- [x] Filter chips UI (all 4 modules)

### Deploy
- [x] Backend deploy-ready (conditional dotenv, static, CORS note)
- [x] Frontend deploy-ready (configurable BACKEND_URL)
- [x] .env.example updated
- [x] README.md created
- [x] .gitignore + .vercelignore
- [x] Push GitHub
- [x] MongoDB Atlas cluster + whitelist IP
- [x] Backend deployed to Railway (ACTIVE)
- [x] BACKEND_URL set in shared.js
- [ ] Frontend deployed to Vercel

---

## 🎉 MVP Completion Review

### Đã hoàn thành
- ✅ Backend: 4 Mongoose models, 4 bộ CRUD routes (20 endpoints)
- ✅ Frontend: 5 trang HTML, CSS design system, shared utilities
- ✅ Classes module: populate refs, dropdown courses/teachers, checkbox students
- ✅ Validation: required fields, email regex, phone regex (9-11 digits), dateOfBirth (not future), level enum (A1-C1), specialties enum (IELTS/TOEIC/Giao tiếp/VSTEP), fee (non-negative), maxStudents (positive integer)
- ✅ Unique constraints: email + phone cho teachers và students
- ✅ Derived status: teacher/student status tự động suy ra từ class enrollment
- ✅ Filter chips: 4 module với counters, empty states, client-side filtering
- ✅ Response format nhất quán: `{ success, data/message }`
- ✅ Error handling: try/catch mọi route + duplicate key handling + frontend fetch
- ✅ UI: nav bar, form add/edit toggle, data table, badges, toast notifications, filter chips

### Hạn chế hiện tại
- ❌ Không có authentication
- ❌ Xóa course/teacher đang ref bởi class không có cảnh báo (cascade check)
- ❌ Không có pagination (OK cho MVP, data nhỏ)

### Nâng cấp hợp lý tiếp theo
1. Cascade check khi xóa course/teacher
2. Dashboard thống kê
3. Search text
4. Authentication (JWT)

---

## Changelog

### 2026-04-19 — Filter Chips UI (4 modules) ✅

**Mục tiêu:** Thêm filter chips / pill buttons cho tất cả 4 trang CRUD để dễ lọc dữ liệu.

**Tính năng:**
- Filter 100% client-side (load data 1 lần → filter trên frontend → re-render)
- Counter `(n)` trên mỗi chip
- Active state nổi bật (xanh đậm), hover effect
- Empty state khi filter không có kết quả

**Filter theo trang:**

| Trang | Filter chips |
|---|---|
| Teachers | Tất cả · Đang dạy · Chưa phân công · Dạy nhiều lớp |
| Students | Tất cả · Đang học · Chưa xếp lớp · Học nhiều lớp |
| Courses | Tất cả · A1 · A2 · B1 · B2 · C1 |
| Classes | Row 1: Khóa học (dynamic từ courses) · Row 2: Trạng thái (Sắp mở · Đang học · Hoàn thành · Đã hủy) |

**Backend hỗ trợ:**
- `teacher-routes.js` + `student-routes.js`: thêm `classCount` (tổng số class) trong `addDerivedStatus()` helper
- Cho phép frontend filter "Dạy nhiều lớp" / "Học nhiều lớp" (classCount >= 2)

**Files sửa (13 files):**
- `backend/routes/teacher-routes.js` — addDerivedStatus + classCount
- `backend/routes/student-routes.js` — addDerivedStatus + classCount
- `frontend/css/style.css` — filter chip CSS (.filter-section, .filter-chip, .badge-warning)
- `frontend/teachers.html` — filter container + specialties dropdown
- `frontend/students.html` — filter container
- `frontend/courses.html` — filter container
- `frontend/classes.html` — filter container
- `frontend/js/teachers.js` — full rewrite with filter logic
- `frontend/js/students.js` — full rewrite with filter logic
- `frontend/js/courses.js` — full rewrite with filter logic
- `frontend/js/classes.js` — full rewrite with dual filter (course + status, combinable)

---

### 2026-04-19 — Unique Constraints + Specialties Enum + Duplicate Handling ✅

**Mục tiêu:** Đảm bảo data integrity — không trùng email/phone, chuyên môn chỉ chọn từ enum.

**Thay đổi:**

| Thay đổi | Chi tiết |
|---|---|
| `email: unique: true` | teacher-model.js, student-model.js |
| `phone: unique: true` | teacher-model.js, student-model.js |
| Specialties: `[String]` array → `String` enum | Chỉ chấp nhận: IELTS, TOEIC, Giao tiếp, VSTEP |
| Duplicate error handling | `error.code === 11000` → "Email đã tồn tại" / "Số điện thoại đã tồn tại" |
| HTML specialties | `<input type="text">` → `<select>` dropdown |

**Files sửa:**
- `backend/models/teacher-model.js` — unique email/phone, specialties enum
- `backend/models/student-model.js` — unique email/phone
- `backend/routes/teacher-routes.js` — error.code 11000 handling
- `backend/routes/student-routes.js` — error.code 11000 handling
- `frontend/teachers.html` — specialties select dropdown

---

### 2026-04-19 — Business Logic Refactor + Validation ✅

**Mục tiêu:** Sửa logic nghiệp vụ sai — status không hard-code, validation chặt hơn.

**Quyết định thiết kế:**

| Quy tắc | Logic |
|---|---|
| Teacher status | **Derived** — "Đang dạy" nếu gán vào ≥1 class ongoing, else "Chưa phân công" |
| Student status | **Derived** — "Đang học" nếu nằm trong ≥1 class ongoing, else "Chưa xếp lớp" |
| Phone | Regex `^\d{9,11}$` — chỉ chữ số, 9-11 ký tự |
| DateOfBirth | Custom validator — không được ở tương lai |
| Level (student) | Enum: A1, A2, B1, B2, C1 |
| Fee (course) | Non-negative number |
| maxStudents (class) | Positive integer |

**Validation 2 lớp:**
- Frontend: `isValidPhone()`, `isDateNotFuture()`, `isPositiveInteger()`, `isNonNegativeNumber()` trong shared.js
- Backend: Mongoose schema validators (match, enum, custom validate)

**Files sửa:**
- `backend/models/teacher-model.js` — phone regex
- `backend/models/student-model.js` — phone regex, dateOfBirth validator, level enum
- `backend/routes/teacher-routes.js` — derived status from classes
- `backend/routes/student-routes.js` — derived status from classes
- `frontend/js/shared.js` — 4 validation helpers
- `frontend/js/teachers.js` — phone validation + derivedStatus display
- `frontend/js/students.js` — phone + DOB validation + derivedStatus display
- `frontend/js/courses.js` — fee validation
- `frontend/js/classes.js` — empty state + maxStudents + all required field validation

---

### 2026-04-19 — Cloud Deployment (Atlas + Railway) ✅

**Mục tiêu:** Deploy backend lên Railway + kết nối MongoDB Atlas.

**Kiến trúc deploy:**
```
GitHub repo
  ├── backend/  → Railway (https://english-center-management-system-production.up.railway.app)
  ├── frontend/ → Vercel (chưa deploy)
  └── DB        → MongoDB Atlas (cluster0.el3y9qi.mongodb.net)
```

**Các bước đã thực hiện:**
1. Tạo MongoDB Atlas cluster miễn phí (Cluster0)
2. Tạo database user + lấy connection string
3. Test Atlas connection từ local → OK
4. Push code lên GitHub (`fit-tiendat/English-Center-Management-System`)
5. Tạo Railway project → link GitHub repo
6. Set env variables (MONGO_URI, NODE_ENV) + Root Directory = `backend`
7. Generate public domain + set target port
8. Set BACKEND_URL trong `shared.js` → push lại

**🐛 Lỗi gặp phải và cách fix:**

| # | Lỗi | Nguyên nhân | Cách fix |
|---|---|---|---|
| 1 | **Build failed** lần đầu trên Railway | Chưa set Root Directory = `backend` → Railway chạy từ root, không tìm thấy `package.json` | Set Root Directory = `backend` trong Settings |
| 2 | **MongoDB connection error** — "Could not connect to any servers in your MongoDB Atlas cluster" | Atlas mặc định chỉ cho phép IP cụ thể. Railway dùng IP động, bị chặn | Vào Atlas → Network Access → Add IP Address → "Allow Access From Anywhere" (0.0.0.0/0) |
| 3 | **NODE_ENV = "developmentproduction"** (nối sai) → 502 Bad Gateway | Railway auto-detect biến từ `.env.example` (giá trị `development`) rồi nối thêm giá trị user set (`production`) | Fix code: bỏ check `NODE_ENV !== 'production'`, thay bằng `fs.existsSync()` — check file `.env` và thư mục `frontend/` có tồn tại không. Cách này hoạt động đúng bất kể NODE_ENV bị sai |

**Fix quan trọng nhất — `server.js`:**
```diff
- // Load .env ở local dev
- if (process.env.NODE_ENV !== 'production') {
-   require('dotenv').config(...);
- }
+ // Load .env nếu file tồn tại (local dev)
+ const envPath = path.join(__dirname, '..', '.env');
+ if (fs.existsSync(envPath)) {
+   require('dotenv').config({ path: envPath });
+ }

- // Serve static files
- if (process.env.NODE_ENV !== 'production') {
-   app.use(express.static(...));
- }
+ // Serve static files — chỉ khi thư mục frontend tồn tại
+ const frontendPath = path.join(__dirname, '..', 'frontend');
+ if (fs.existsSync(frontendPath)) {
+   app.use(express.static(frontendPath));
+ }
```

**Kết quả cuối:**
- ✅ Railway: `https://english-center-management-system-production.up.railway.app`
- ✅ Health check: `GET /api/health` → `{success: true, env: "production"}`
- ✅ API hoạt động: `GET /api/courses` → `{success: true, data: []}`
- ✅ `BACKEND_URL` đã set trong `shared.js`
- ⏳ Vercel frontend: chưa deploy

**Files sửa:**
- `backend/server.js` — [sửa] — `fs.existsSync` thay NODE_ENV check
- `frontend/js/shared.js` — [sửa] — Set BACKEND_URL = Railway URL

**Bài học rút ra:**
- ⚠️ Railway auto-detect biến môi trường từ code → có thể nối sai giá trị
- ⚠️ Không nên dựa vào NODE_ENV cho logic runtime quan trọng — dùng `fs.existsSync` an toàn hơn
- ⚠️ MongoDB Atlas mặc định chặn IP → phải whitelist trước khi deploy

---

### 2026-04-19 — Repository Cleanup & Deploy Ignore ✅

**Đã làm:**
- `.gitignore`: thêm `.env.local`, `.env.*.local`, `.vercel`, `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, `*.log`
- `.vercelignore`: tạo mới — ignore `backend/`, `.agents/`, root configs
- Verify: `.env` không bị git track, không có secret trong repo

---

### 2026-04-19 — Deploy Preparation Refactor ✅

**Đã làm:**
- `server.js`: conditional dotenv (chỉ load ở local), conditional static serve (chỉ local), CORS note
- `shared.js`: `BACKEND_URL` config — local = `''` (same-origin `/api`), production = Railway URL
- `.env.example`: thêm section production với Atlas connection string format
- `README.md`: tạo mới — local dev + cloud deploy guide (Atlas, Railway, Vercel)
- Scan toàn bộ code: không còn hard-coded localhost
- Test local: server + health check + courses API — tất cả PASS

**Files tạo/sửa:**
- `backend/server.js` — [sửa] — Conditional dotenv, static, CORS note, log format
- `frontend/js/shared.js` — [sửa] — Configurable BACKEND_URL
- `.env.example` — [sửa] — Local + production sections
- `README.md` — [tạo mới] — Full documentation

---

### 2026-04-19 — MVP Final Review ✅

**Đã làm:**
- Rà soát toàn bộ 17 files source code (backend + frontend)
- Fix 3 issues:
  1. `shared.js` fetchJSON: fix header merge bug + thêm try/catch network errors
  2. `class-routes.js`: fix falsy check `||` → `!= null` cho maxStudents
  3. `index.html` + `style.css`: replace inline styles → `.card-link` CSS class + hover effect

**Files sửa:**
- `frontend/js/shared.js` — [sửa] — Fix fetchJSON header merge + network error handling
- `backend/routes/class-routes.js` — [sửa] — Fix maxStudents falsy check
- `frontend/css/style.css` — [sửa] — Thêm .card-link class
- `frontend/index.html` — [sửa] — Replace inline styles → CSS class

**Issues không sửa (accepted for MVP):**
- Code lặp giữa 4 route files — accepted (mỗi file ~76 lines, tách riêng dễ maintain hơn abstract)
- Thiếu unique email index — accepted (thêm sau nếu cần)
- Không cascade check khi xóa — accepted (ngoài scope MVP)

---

### 2026-04-19 — Phase 4: Classes module ✅

**Đã làm:** Full CRUD classes (refs, populate, dropdowns, checkboxes), test pass.

---

### 2026-04-19 — Phase 3: Teachers + Students ✅

**Đã làm:** Full CRUD teachers + students, test pass.

---

### 2026-04-19 — Phase 2: Courses module ✅

**Đã làm:** Full CRUD courses (backend + frontend), test pass.

---

### 2026-04-19 — Phase 1: Project Foundation ✅

**Đã làm:** Express server + MongoDB connection + static serving.

---

### 2026-04-19 — Khởi tạo project planning

**Đã làm:** Chốt stack, schema, tạo `.agents/`.
