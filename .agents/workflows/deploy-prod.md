# Workflow: Deploy Production

> Checklist và quy trình trước khi deploy hệ thống lên production.

---

## 1. Checklist trước khi deploy

### Code quality
- [ ] Tất cả CRUD hoạt động đúng cho 4 collections
- [ ] Không có `console.log` debug thừa trong code
- [ ] Xử lý lỗi (try/catch) đầy đủ ở mọi route
- [ ] Response format thống nhất `{ success, data/message }`
- [ ] Không có credentials hard-code trong source

### Database
- [ ] MongoDB connection string dùng biến môi trường (`MONGO_URI`)
- [ ] Tất cả Mongoose models có validation cần thiết
- [ ] Index cho các field thường query (email unique, etc.)
- [ ] Test với dữ liệu mẫu — CRUD hoạt động ổn

### API Routes
- [ ] Tất cả endpoints respond đúng status code (200, 201, 400, 404, 500)
- [ ] Validate input trước khi lưu DB
- [ ] Không trả về stack trace / error detail cho client ở production

### Frontend
- [ ] Tất cả 4 trang hiển thị dữ liệu đúng
- [ ] Form submit hoạt động (tạo, sửa)
- [ ] Nút xóa hoạt động có confirm
- [ ] Xử lý loading state và error state
- [ ] API base URL dùng biến cấu hình, không hard-code localhost

---

## 2. Biến môi trường cần có

Tạo file `.env` (KHÔNG commit lên git):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/english_center
NODE_ENV=production
```

Tạo file `.env.example` (commit lên git để người khác biết cần gì):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/english_center
NODE_ENV=development
```

---

## 3. Kiểm tra MongoDB connection

```bash
# Kiểm tra MongoDB đang chạy
mongosh --eval "db.runCommand({ ping: 1 })"

# Hoặc kiểm tra qua app log
# Server phải in ra: "MongoDB connected successfully"
```

- [ ] MongoDB service đang chạy
- [ ] Connection string đúng
- [ ] Database tên `english_center` tồn tại (hoặc tự tạo khi app kết nối)

---

## 4. Kiểm tra Express routes

Test từng endpoint bằng curl hoặc Postman:

```bash
# Courses
curl http://localhost:3000/api/courses
curl -X POST http://localhost:3000/api/courses -H "Content-Type: application/json" -d '{"name":"IELTS","level":"B1"}'

# Teachers
curl http://localhost:3000/api/teachers

# Students
curl http://localhost:3000/api/students

# Classes
curl http://localhost:3000/api/classes
```

- [ ] GET trả về mảng (có thể rỗng)
- [ ] POST tạo mới và trả về object vừa tạo
- [ ] PUT cập nhật đúng
- [ ] DELETE xóa đúng
- [ ] Sai input trả về lỗi rõ ràng

---

## 5. Kiểm tra frontend pages

- [ ] Mở `index.html` — navigation hoạt động
- [ ] Mở `courses.html` — hiển thị danh sách, form thêm/sửa/xóa
- [ ] Mở `teachers.html` — tương tự
- [ ] Mở `students.html` — tương tự
- [ ] Mở `classes.html` — dropdown course/teacher, danh sách students

---

## 6. Log lỗi cơ bản

Đảm bảo server log đủ thông tin:

```javascript
// Mọi route lỗi phải log:
console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - Error:`, error.message);
```

- [ ] Lỗi 500 được log ra console với timestamp
- [ ] Lỗi 400 (validation) trả message rõ cho client
- [ ] Không leak stack trace ra response ở production

---

## 7. Lưu ý bảo mật cơ bản

- [ ] `.env` nằm trong `.gitignore`
- [ ] Không hard-code password, connection string trong code
- [ ] Dùng `cors()` với origin cụ thể (không để `*` ở production)
- [ ] Validate & sanitize input trước khi lưu DB
- [ ] Không trả raw MongoDB error cho client

---

## 8. Agent checklist trước khi đề xuất deploy

Trước khi nói "sẵn sàng deploy", agent phải tự rà soát:

1. ✅ Đã hoàn thành toàn bộ Master Checklist trong `progress.md`?
2. ✅ Đã test CRUD cho cả 4 collections?
3. ✅ Đã kiểm tra frontend hoạt động end-to-end?
4. ✅ Biến môi trường đã cấu hình đúng?
5. ✅ Không có TODO, FIXME, hoặc code tạm trong source?
6. ✅ Error handling đầy đủ?
7. ✅ `.gitignore` có `.env` và `node_modules/`?

> Nếu bất kỳ mục nào chưa đạt → **KHÔNG** đề xuất deploy, phải fix trước.
