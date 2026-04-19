# Session Logging — Quy tắc ghi log phiên làm việc

> Tài liệu này quy định cách ghi chép tiến độ sau mỗi phiên hoặc task lớn.
> Log được lưu tại `.agents/memory/progress.md`.

---

## 1. Khi nào phải cập nhật log

- **Sau mỗi phiên làm việc** (khi kết thúc conversation hoặc chuyển sang task khác).
- **Sau mỗi task lớn** hoàn thành (VD: hoàn thành CRUD cho 1 collection, tạo xong 1 trang frontend).
- **Khi có quyết định kỹ thuật quan trọng** (VD: thay đổi schema, thêm package mới).
- **Khi phát hiện bug hoặc gotcha** đáng nhớ.

---

## 2. Format log entry

Mỗi entry trong `memory/progress.md` phải có cấu trúc sau:

```markdown
### [YYYY-MM-DD] — Tiêu đề ngắn gọn

**Đã làm:**
- Mô tả công việc đã hoàn thành
- Liệt kê file tạo mới hoặc sửa đổi

**Files tạo/sửa:**
- `path/to/file.js` — [tạo mới / sửa] — mô tả ngắn
- `path/to/another.html` — [tạo mới] — mô tả ngắn

**Đang dở:**
- Nếu có việc chưa xong, ghi rõ dở ở đâu

**Bước tiếp theo:**
- Đề xuất 1-3 việc cần làm tiếp

**Ghi chú kỹ thuật:** *(nếu có)*
- Decision hoặc assumption quan trọng
- Bug/gotcha cần lưu ý
```

---

## 3. Quy tắc viết log

### Ngắn gọn, đi thẳng vào trọng tâm
- ✅ `Tạo CRUD routes cho courses (GET, POST, PUT, DELETE)`
- ❌ `Hôm nay tôi đã bắt đầu làm việc trên phần backend và tạo ra các route cho courses collection...`

### Liệt kê file cụ thể
- ✅ `backend/routes/course-routes.js — [tạo mới] — CRUD endpoints cho courses`
- ❌ `Đã sửa một số file backend`

### Ghi decision rõ ràng
- ✅ `⚙️ DECISION: Dùng mảng ObjectId trong class schema thay vì tạo collection enrollment riêng — đơn giản hơn cho MVP`
- ❌ `Đã chọn cách làm phù hợp`

### Ghi bug/gotcha cụ thể
- ✅ `🐛 GOTCHA: Mongoose populate() không tự động exclude __v, cần .select('-__v') nếu muốn response sạch`
- ❌ `Có bug nhỏ`

---

## 4. Checklist tracking

Phần đầu file `progress.md` duy trì một **master checklist** tổng thể:

```markdown
## Master Checklist

### Backend
- [ ] Setup Express server + MongoDB connection
- [ ] Model: courses
- [ ] Model: teachers
- [ ] Model: students
- [ ] Model: classes
- [ ] Routes: courses CRUD
- [ ] Routes: teachers CRUD
- [ ] Routes: students CRUD
- [ ] Routes: classes CRUD

### Frontend
- [ ] Trang courses.html + courses.js
- [ ] Trang teachers.html + teachers.js
- [ ] Trang students.html + students.js
- [ ] Trang classes.html + classes.js
- [ ] Trang index.html (dashboard/navigation)
- [ ] CSS chung (style.css)

### Integration
- [ ] Classes: gán teacher (dropdown)
- [ ] Classes: gán students (multi-select)
- [ ] Classes: hiển thị sĩ số
- [ ] Tất cả CRUD hoạt động end-to-end
```

Cập nhật `[x]` khi hoàn thành, `[/]` khi đang làm dở.

---

## 5. Khi KHÔNG cần log

- Fix typo nhỏ, format code, sửa comment — không cần log.
- Chỉ đọc file để trả lời câu hỏi user — không cần log.
- Tạo/sửa file trong `.agents/` — không cần log (trừ khi thay đổi lớn về quy tắc).
