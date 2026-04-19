# Progress Log — Quản lý Trung tâm Tiếng Anh

> Cập nhật sau mỗi phiên làm việc hoặc task lớn.

---

## Master Checklist

### Planning & Setup
- [x] Xác định mục tiêu project
- [x] Chốt tech stack
- [x] Thiết kế schema 4 collections
- [x] Tạo `.agents/` context, rules, memory, workflows
- [x] Xác nhận cấu trúc thư mục app

### Backend
- [x] Setup Express server + MongoDB connection
- [x] Model: courses
- [x] Model: teachers
- [x] Model: students
- [x] Model: classes
- [x] Routes: courses CRUD
- [x] Routes: teachers CRUD
- [x] Routes: students CRUD
- [x] Routes: classes CRUD

### Frontend
- [x] CSS chung (style.css)
- [x] JS shared (shared.js)
- [x] index.html (dashboard navigation)
- [x] courses.html + courses.js
- [x] teachers.html + teachers.js
- [x] students.html + students.js
- [x] classes.html + classes.js

### Integration
- [x] Classes: gán teacher (dropdown)
- [x] Classes: gán students (checkbox multi-select)
- [x] Classes: hiển thị sĩ số (current / max)
- [x] Tất cả CRUD hoạt động end-to-end

### Quality
- [x] MVP final review
- [x] Bug fixes từ review
- [x] Deploy preparation refactor

### Deploy
- [x] Backend deploy-ready (conditional dotenv, static, CORS note)
- [x] Frontend deploy-ready (configurable BACKEND_URL)
- [x] .env.example updated
- [x] README.md created
- [ ] MongoDB Atlas setup
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel

---

## 🎉 MVP Completion Review

### Đã hoàn thành
- ✅ Backend: 4 Mongoose models, 4 bộ CRUD routes (20 endpoints)
- ✅ Frontend: 5 trang HTML, CSS design system, shared utilities
- ✅ Classes module: populate refs, dropdown courses/teachers, checkbox students
- ✅ Validation: required fields, email regex, endDate >= startDate, students <= maxStudents
- ✅ Response format nhất quán: `{ success, data/message }`
- ✅ Error handling: try/catch mọi route + frontend fetch
- ✅ UI: nav bar, form add/edit toggle, data table, badges, toast notifications

### Hạn chế hiện tại
- ❌ Không có authentication
- ❌ Không có tìm kiếm, lọc, phân trang
- ❌ Không validate trùng email (chưa set unique index)
- ❌ Xóa course/teacher đang ref bởi class không có cảnh báo
- ❌ Chưa có README.md

### Nâng cấp hợp lý tiếp theo
1. Unique email index cho teachers/students
2. Cascade check khi xóa course/teacher
3. Dashboard thống kê
4. Search/filter/pagination
5. Authentication (JWT)

---

## Changelog

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
