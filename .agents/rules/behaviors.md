# Agent Behaviors — Quy tắc hành vi

> Tài liệu này quy định cách agent phải hành xử khi làm việc trên project Quản lý Trung tâm Tiếng Anh.
> Mọi phiên làm việc đều phải tuân thủ các quy tắc dưới đây.

---

## 1. Luôn đọc context trước khi hành động

- **BẮT BUỘC** đọc `.agents/context/tech-stack.md` trước khi đề xuất hoặc viết code.
- **BẮT BUỘC** đọc `.agents/memory/progress.md` để biết trạng thái hiện tại, tránh làm lại hoặc làm sai thứ tự.
- Nếu đang tạo module mới, đọc thêm `.agents/workflows/new-module.md`.

---

## 2. Bám sát phạm vi MVP

- Chỉ làm những gì nằm trong phạm vi MVP đã định nghĩa trong `tech-stack.md`.
- **Không** tự ý thêm tính năng ngoài scope (auth, dashboard thống kê, email notification...) trừ khi user yêu cầu.
- Nếu thấy cần mở rộng, **hỏi user** trước — không tự quyết.

---

## 3. Không tự ý thay đổi stack

- Stack đã chốt: **Node.js + Express + MongoDB + HTML/CSS/JS thuần**.
- **KHÔNG** đề xuất hoặc sử dụng: React, Vue, Angular, TypeScript, TailwindCSS, hoặc bất kỳ framework frontend nào.
- **KHÔNG** thay Mongoose bằng ODM/ORM khác.
- Nếu có lý do kỹ thuật bắt buộc phải thay đổi, phải **nêu rõ lý do** và **chờ user phê duyệt**.

---

## 4. Tối giản thư viện

Chỉ dùng các package thực sự cần thiết:

| Package    | Mục đích                    |
| ---------- | --------------------------- |
| express    | Web framework               |
| mongoose   | MongoDB ODM                 |
| dotenv     | Quản lý biến môi trường     |
| cors       | Cho phép cross-origin       |
| nodemon    | Dev: auto-restart server    |

- **KHÔNG** thêm thư viện mới mà không giải thích rõ lý do.
- Ưu tiên giải pháp bằng code thuần trước khi nghĩ đến thư viện bên ngoài.

---

## 5. Code rõ ràng, dễ maintain

### Naming conventions
- **Files**: kebab-case (`course-routes.js`, `teacher-model.js`)
- **Variables / Functions**: camelCase (`getAllCourses`, `studentList`)
- **MongoDB collections**: plural lowercase (`courses`, `teachers`, `students`, `classes`)
- **API routes**: plural lowercase (`/api/courses`, `/api/teachers`)
- **CSS classes**: kebab-case (`form-group`, `btn-primary`, `table-container`)

### Code style
- Dùng `async/await` thay vì callback hell
- Mỗi route file xử lý đúng 1 collection
- Mỗi model file định nghĩa đúng 1 schema
- Mỗi frontend page quản lý đúng 1 loại đối tượng
- Comment khi logic phức tạp, không comment những thứ hiển nhiên
- Xử lý lỗi (try/catch) ở mọi route handler

### Folder structure consistency
```
backend/
├── config/db.js           # Kết nối MongoDB
├── models/
│   ├── course-model.js
│   ├── teacher-model.js
│   ├── student-model.js
│   └── class-model.js
├── routes/
│   ├── course-routes.js
│   ├── teacher-routes.js
│   ├── student-routes.js
│   └── class-routes.js
├── server.js
└── package.json

frontend/
├── css/style.css
├── js/
│   ├── courses.js
│   ├── teachers.js
│   ├── students.js
│   └── classes.js
├── index.html
├── courses.html
├── teachers.html
├── students.html
└── classes.html
```

---

## 6. Khi tạo module mới

Trước khi code, agent **PHẢI** nêu rõ:

1. **Mục tiêu** — Module này làm gì?
2. **Files sẽ tạo/sửa** — Liệt kê đầy đủ
3. **Routes/API liên quan** — Method + endpoint + mô tả
4. **Model/Schema liên quan** — Fields nào, validation gì
5. **Frontend pages liên quan** — Trang nào, component nào
6. **Acceptance criteria** — Làm xong thì kiểm tra bằng cách nào

> Tham khảo chi tiết tại `.agents/workflows/new-module.md`

---

## 7. API patterns chuẩn

Mọi collection đều follow cùng một pattern:

| Method | Endpoint              | Mô tả            |
| ------ | --------------------- | ----------------- |
| GET    | `/api/{collection}`   | Lấy tất cả       |
| GET    | `/api/{collection}/:id` | Lấy theo ID    |
| POST   | `/api/{collection}`   | Tạo mới           |
| PUT    | `/api/{collection}/:id` | Cập nhật theo ID |
| DELETE | `/api/{collection}/:id` | Xóa theo ID     |

Response format thống nhất:

```json
// Thành công
{ "success": true, "data": { ... } }

// Lỗi
{ "success": false, "message": "Mô tả lỗi" }
```

---

## 8. Xử lý khi chưa chắc chắn

- **Hỏi user** nếu yêu cầu mơ hồ hoặc có nhiều cách làm.
- Nếu phải tự quyết (user không online), chọn **phương án đơn giản nhất** và **ghi rõ assumption** vào progress log.
- Đánh dấu assumption bằng: `⚠️ ASSUMPTION: [nội dung giả định]`

---

## 9. Không over-engineering

- Không tạo abstraction layer không cần thiết.
- Không tạo middleware phức tạp khi chưa cần.
- Không setup CI/CD, Docker, testing framework ở giai đoạn MVP.
- Giữ mọi thứ **đủ dùng**, không thừa.

---

## 10. Luôn plan trước khi code lớn

- Nếu task liên quan đến **2+ files** hoặc **thay đổi logic quan trọng**: phải tạo plan trước.
- Plan tối thiểu gồm: mục tiêu, files ảnh hưởng, steps thực hiện.
- Với task nhỏ (sửa 1 file, fix bug đơn giản): có thể code trực tiếp.
