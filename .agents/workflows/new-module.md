# Workflow: Tạo Module Mới

> Mỗi khi tạo module mới (VD: courses, teachers, students, classes), agent **PHẢI** làm theo workflow này.

---

## Các bước bắt buộc

### Bước 1 — Đọc context
- Đọc `.agents/context/tech-stack.md` để nắm schema, quan hệ, stack.
- Đọc `.agents/memory/progress.md` để biết trạng thái hiện tại.

### Bước 2 — Xác định module
- Module thuộc collection nào? (courses / teachers / students / classes)
- Có liên quan đến collection khác không? (VD: classes liên quan courses + teachers + students)

### Bước 3 — Mô tả mục tiêu
- Module này giải quyết vấn đề gì?
- User story ngắn gọn.

### Bước 4 — Liệt kê files
- Files cần **tạo mới**
- Files cần **sửa đổi**

### Bước 5 — Schema/Model
- Fields nào cần thêm hoặc sửa?
- Validation rules?
- Có ref đến collection khác không?

### Bước 6 — Routes Express
- Liệt kê: Method + Endpoint + Mô tả
- Theo pattern chuẩn: GET, GET/:id, POST, PUT/:id, DELETE/:id

### Bước 7 — Frontend
- Trang HTML nào?
- File JS nào?
- UI components: form, table, dropdown, modal...

### Bước 8 — Acceptance criteria
- Làm xong thì kiểm tra bằng cách nào?
- Những gì phải hoạt động?

### Bước 9 — Code
- Chỉ sau khi hoàn thành bước 1-8 mới bắt đầu viết code.

---

## Template cho module mới

Dùng template dưới đây khi tạo bất kỳ module nào:

```markdown
## Module: [TÊN MODULE]

**Collection:** [tên collection]
**Mục tiêu:** [mô tả ngắn]

### Files tạo/sửa
| File | Hành động | Mô tả |
|------|-----------|-------|
| `backend/models/xxx-model.js` | Tạo mới | Mongoose schema |
| `backend/routes/xxx-routes.js` | Tạo mới | CRUD endpoints |
| `frontend/xxx.html` | Tạo mới | Trang quản lý |
| `frontend/js/xxx.js` | Tạo mới | Client-side logic |
| `backend/server.js` | Sửa | Thêm route import |

### Schema
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| ... | ... | ... | ... |

### API Routes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/xxx` | Lấy tất cả |
| GET | `/api/xxx/:id` | Lấy theo ID |
| POST | `/api/xxx` | Tạo mới |
| PUT | `/api/xxx/:id` | Cập nhật |
| DELETE | `/api/xxx/:id` | Xóa |

### Frontend
- **Trang:** `xxx.html`
- **Chức năng:** Bảng danh sách + Form thêm/sửa + Nút xóa
- **Gọi API:** fetch → `/api/xxx`

### Acceptance Criteria
- [ ] GET trả về danh sách đúng
- [ ] POST tạo mới thành công, validate đúng
- [ ] PUT cập nhật đúng record
- [ ] DELETE xóa đúng record
- [ ] Frontend hiển thị dữ liệu từ API
- [ ] Form submit gọi đúng API
- [ ] Xử lý lỗi hiển thị cho user
```

---

## Ví dụ áp dụng cho 4 modules chính

### Module: Courses
- **Collection:** `courses`
- **Schema chính:** name, description, level, duration, fee, isActive
- **Đặc biệt:** Không ref collection khác → module độc lập, nên làm đầu tiên.

### Module: Teachers
- **Collection:** `teachers`
- **Schema chính:** fullName, email, phone, specialties, isActive
- **Đặc biệt:** Không ref → module độc lập, có thể làm song song với courses.

### Module: Students
- **Collection:** `students`
- **Schema chính:** fullName, email, phone, dateOfBirth, level, isActive
- **Đặc biệt:** Không ref → module độc lập.

### Module: Classes
- **Collection:** `classes`
- **Schema chính:** name, course (ref), teacher (ref), students (ref[]), schedule, startDate, endDate, maxStudents, status
- **Đặc biệt:** Ref cả 3 collection kia → **làm sau cùng**. Frontend cần dropdown chọn course/teacher và multi-select chọn students.
