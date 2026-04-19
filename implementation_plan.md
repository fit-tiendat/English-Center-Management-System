# Scaffold Plan — Quản lý Trung tâm Tiếng Anh

## 1. Review nhất quán `.agents/`

Sau khi đọc toàn bộ 6 file, kết quả rà soát:

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Naming conventions | ✅ Nhất quán | kebab-case files, camelCase code, plural collections — thống nhất giữa `tech-stack.md` và `behaviors.md` |
| Schema definitions | ✅ Nhất quán | 4 collections với đầy đủ fields, types — giống nhau giữa `tech-stack.md` và `new-module.md` |
| API pattern | ✅ Nhất quán | 5 CRUD endpoints, response format `{ success, data/message }` — giống nhau giữa `behaviors.md` và `deploy-prod.md` |
| Folder structure | ✅ Nhất quán | `backend/` + `frontend/` — giống nhau giữa `tech-stack.md` (line 46-63) và `behaviors.md` (line 68-96) |
| Thứ tự triển khai | ✅ Nhất quán | Courses/Teachers/Students trước → Classes sau cùng — `new-module.md` và `progress.md` đều đồng thuận |
| Package list | ✅ Nhất quán | 5 packages: express, mongoose, dotenv, cors, nodemon — chỉ nêu trong `behaviors.md`, không mâu thuẫn |
| Progress tracking | ✅ Nhất quán | Master checklist + changelog format — `session-logging.md` template khớp với format thực tế trong `progress.md` |

> **Kết luận:** `.agents/` nhất quán hoàn toàn, không có mâu thuẫn. Sẵn sàng dùng làm source of truth.

---

## 2. Cấu trúc thư mục đề xuất

```
project_co_Khoa/
├── .agents/                          # ✅ Đã có — context, rules, memory, workflows
│
├── backend/
│   ├── config/
│   │   └── db.js                     # Kết nối MongoDB (mongoose.connect)
│   ├── models/
│   │   ├── course-model.js           # Schema: courses
│   │   ├── teacher-model.js          # Schema: teachers
│   │   ├── student-model.js          # Schema: students
│   │   └── class-model.js            # Schema: classes (ref 3 collections kia)
│   ├── routes/
│   │   ├── course-routes.js          # CRUD: /api/courses
│   │   ├── teacher-routes.js         # CRUD: /api/teachers
│   │   ├── student-routes.js         # CRUD: /api/students
│   │   └── class-routes.js           # CRUD: /api/classes
│   ├── server.js                     # Entry point: Express setup, mount routes, serve static
│   └── package.json                  # Dependencies: express, mongoose, dotenv, cors, nodemon
│
├── frontend/
│   ├── css/
│   │   └── style.css                 # CSS chung cho toàn bộ frontend
│   ├── js/
│   │   ├── shared.js                 # Hàm dùng chung: API_BASE, fetchHelper, renderNav
│   │   ├── courses.js                # CRUD logic cho trang courses
│   │   ├── teachers.js               # CRUD logic cho trang teachers
│   │   ├── students.js               # CRUD logic cho trang students
│   │   └── classes.js                # CRUD logic cho trang classes
│   ├── index.html                    # Trang chính / dashboard navigation
│   ├── courses.html                  # Quản lý khóa học
│   ├── teachers.html                 # Quản lý giảng viên
│   ├── students.html                 # Quản lý học viên
│   └── classes.html                  # Quản lý lớp học
│
├── .env                              # Biến môi trường (KHÔNG commit git)
├── .env.example                      # Template biến môi trường (commit git)
├── .gitignore                        # node_modules, .env
└── README.md                         # Hướng dẫn cài đặt & chạy
```

### Tổng cộng files cần tạo: 21 files

| Nhóm | Số files | Chi tiết |
|---|---|---|
| Backend config | 1 | `db.js` |
| Backend models | 4 | `course-model.js`, `teacher-model.js`, `student-model.js`, `class-model.js` |
| Backend routes | 4 | `course-routes.js`, `teacher-routes.js`, `student-routes.js`, `class-routes.js` |
| Backend core | 2 | `server.js`, `package.json` |
| Frontend HTML | 5 | `index.html`, `courses.html`, `teachers.html`, `students.html`, `classes.html` |
| Frontend JS | 5 | `shared.js`, `courses.js`, `teachers.js`, `students.js`, `classes.js` |
| Frontend CSS | 1 | `style.css` |
| Project root | 3 | `.env`, `.env.example`, `.gitignore` |
| Docs | 1 | `README.md` *(tùy chọn, có thể làm sau)* |

---

## 3. Thay đổi so với `.agents/` gốc

> [!NOTE]
> Tôi đề xuất thêm **1 file** so với `tech-stack.md` gốc:
> - `frontend/js/shared.js` — chứa hàm dùng chung giữa 4 trang (API base URL, fetch wrapper, render navigation bar). Tránh lặp code giữa `courses.js`, `teachers.js`, `students.js`, `classes.js`.
>
> Đây không phải thêm thư viện, chỉ là tách code JS chung ra 1 file — phù hợp nguyên tắc "code rõ ràng, dễ maintain" trong `behaviors.md`.

---

## 4. Thứ tự triển khai MVP

Chia làm **5 phase**, mỗi phase là 1 đơn vị có thể test độc lập:

### Phase 1 — Project Foundation
> Mục tiêu: Server chạy được, kết nối DB thành công

| # | File | Mô tả |
|---|---|---|
| 1 | `.gitignore` | Ignore `node_modules/`, `.env` |
| 2 | `.env` | `PORT=3000`, `MONGO_URI=mongodb://localhost:27017/english_center` |
| 3 | `.env.example` | Template cho `.env` |
| 4 | `backend/package.json` | Dependencies + scripts (`dev`, `start`) |
| 5 | `backend/config/db.js` | `mongoose.connect()` với error handling |
| 6 | `backend/server.js` | Express setup, cors, json parser, DB connect, serve static `frontend/` |

**Kiểm tra:** `npm run dev` → server chạy, log "MongoDB connected" ✅

---

### Phase 2 — Courses module (model + routes + full-stack)
> Mục tiêu: CRUD đầy đủ cho courses, cả backend lẫn frontend
> Lý do làm đầu tiên: Không có ref → đơn giản nhất, dùng làm template cho 3 module sau

| # | File | Mô tả |
|---|---|---|
| 1 | `backend/models/course-model.js` | Mongoose schema cho courses |
| 2 | `backend/routes/course-routes.js` | 5 CRUD endpoints |
| 3 | `backend/server.js` | *(sửa)* Mount `/api/courses` |
| 4 | `frontend/css/style.css` | CSS chung (layout, form, table, button, nav) |
| 5 | `frontend/js/shared.js` | API base URL, fetch helper, nav render |
| 6 | `frontend/index.html` | Trang chính với nav links |
| 7 | `frontend/courses.html` | Trang quản lý khóa học |
| 8 | `frontend/js/courses.js` | Fetch API + render table + form CRUD |

**Kiểm tra:** Mở browser → tạo/sửa/xóa courses từ giao diện ✅

---

### Phase 3 — Teachers + Students modules
> Mục tiêu: CRUD cho teachers và students
> Lý do gom: Cả 2 đều independent, schema tương tự nhau, dùng lại pattern từ courses

| # | File | Mô tả |
|---|---|---|
| 1 | `backend/models/teacher-model.js` | Schema teachers |
| 2 | `backend/routes/teacher-routes.js` | 5 CRUD endpoints |
| 3 | `backend/models/student-model.js` | Schema students |
| 4 | `backend/routes/student-routes.js` | 5 CRUD endpoints |
| 5 | `backend/server.js` | *(sửa)* Mount `/api/teachers`, `/api/students` |
| 6 | `frontend/teachers.html` | Trang quản lý giảng viên |
| 7 | `frontend/js/teachers.js` | CRUD logic giảng viên |
| 8 | `frontend/students.html` | Trang quản lý học viên |
| 9 | `frontend/js/students.js` | CRUD logic học viên |

**Kiểm tra:** CRUD teachers + students hoạt động end-to-end ✅

---

### Phase 4 — Classes module (phức tạp nhất)
> Mục tiêu: CRUD classes với references đến courses, teachers, students
> Lý do làm sau cùng: Phụ thuộc cả 3 collections kia

| # | File | Mô tả |
|---|---|---|
| 1 | `backend/models/class-model.js` | Schema với ref courses, teachers, students |
| 2 | `backend/routes/class-routes.js` | 5 CRUD + populate refs |
| 3 | `backend/server.js` | *(sửa)* Mount `/api/classes` |
| 4 | `frontend/classes.html` | Trang quản lý lớp học |
| 5 | `frontend/js/classes.js` | Dropdown course/teacher, multi-select students, hiển thị sĩ số |

**Kiểm tra:** Tạo class → chọn course, teacher, students → hiển thị đúng ✅

---

### Phase 5 — Polish & Final Check
> Mục tiêu: Rà soát, sửa lỗi, hoàn thiện

| Việc cần làm |
|---|
| Kiểm tra tất cả CRUD end-to-end (4 collections) |
| Kiểm tra error handling (input sai, server lỗi) |
| Kiểm tra UI nhất quán giữa 4 trang |
| Cập nhật navigation links |
| Tạo `README.md` |
| Cập nhật `progress.md` |

---

## Open Questions

> [!IMPORTANT]
> **1. Express serve static hay tách riêng?**
> `.agents/` ghi Express serve frontend từ `frontend/` (cùng port 3000). Bạn ok với cách này chứ? Hay muốn chạy frontend riêng (VD: Live Server port 5500)?
>
> ⚠️ ASSUMPTION hiện tại: Express serve cả API + static files từ cùng 1 server.

> [!NOTE]
> **2. MongoDB local hay Atlas?**
> `.env` mặc định dùng `mongodb://localhost:27017/english_center`. Bạn đã cài MongoDB local chưa? Hay muốn dùng MongoDB Atlas (cloud free tier)?

