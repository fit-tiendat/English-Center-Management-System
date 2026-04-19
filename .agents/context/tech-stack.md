# Tech Stack & System Context

## 1. Mục tiêu hệ thống

Xây dựng hệ thống **Quản lý Trung tâm Tiếng Anh** cho phép admin quản lý toàn bộ hoạt động cốt lõi: khóa học, giảng viên, học viên và lớp học. Hệ thống cung cấp đầy đủ chức năng CRUD cho từng đối tượng, giao diện web đơn giản, dễ sử dụng.

---

## 2. Stack kỹ thuật đã chốt

| Layer      | Công nghệ                        | Ghi chú                          |
| ---------- | -------------------------------- | -------------------------------- |
| Back-end   | **Node.js + Express**            | REST API, JSON response          |
| Database   | **MongoDB** (Mongoose ODM)       | Tối thiểu 4 collections          |
| Front-end  | **HTML + CSS + JavaScript thuần** | Không framework (React, Vue...)  |
| Dev tools  | npm, nodemon, dotenv             | Giữ đơn giản                     |

> **Quy tắc:** Không đổi stack trừ khi có lý do kỹ thuật bắt buộc và được user phê duyệt.

---

## 3. Kiến trúc tổng quát

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                       │
│  (HTML + CSS + JS thuần — fetch API)            │
└──────────────────┬──────────────────────────────┘
                   │  HTTP (JSON)
┌──────────────────▼──────────────────────────────┐
│              EXPRESS SERVER                      │
│  /api/courses   /api/teachers                   │
│  /api/students  /api/classes                    │
│  + static file serving (public/)                │
└──────────────────┬──────────────────────────────┘
                   │  Mongoose
┌──────────────────▼──────────────────────────────┐
│               MONGODB                            │
│  courses │ teachers │ students │ classes         │
└─────────────────────────────────────────────────┘
```

### Cấu trúc thư mục app (dự kiến)

```
project_co_Khoa/
├── .agents/                # Context, rules, memory, workflows
├── backend/
│   ├── config/             # DB connection, env config
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route handlers
│   ├── server.js           # Entry point
│   └── package.json
├── frontend/
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JS (fetch calls)
│   ├── courses.html        # Trang quản lý khóa học
│   ├── teachers.html       # Trang quản lý giảng viên
│   ├── students.html       # Trang quản lý học viên
│   ├── classes.html        # Trang quản lý lớp học
│   └── index.html          # Dashboard / trang chính
├── .env                    # Biến môi trường
└── README.md
```

---

## 4. Collections & vai trò

### 4.1. `courses` — Khóa học

Đại diện cho **loại chương trình học** mà trung tâm cung cấp.

| Field         | Type     | Mô tả                                    |
| ------------- | -------- | ----------------------------------------- |
| `_id`         | ObjectId | Auto-generated                            |
| `name`        | String   | Tên khóa học (VD: "IELTS Foundation 6.0") |
| `description` | String   | Mô tả ngắn                               |
| `level`       | String   | Trình độ (A1, A2, B1, B2, C1)            |
| `duration`    | Number   | Thời lượng (số buổi hoặc số tuần)         |
| `fee`         | Number   | Học phí (VND)                             |
| `isActive`    | Boolean  | Đang mở đăng ký hay không                 |
| `createdAt`   | Date     | Ngày tạo                                  |
| `updatedAt`   | Date     | Ngày cập nhật                             |

### 4.2. `teachers` — Giảng viên

Thông tin giảng viên của trung tâm.

| Field          | Type     | Mô tả                                       |
| -------------- | -------- | -------------------------------------------- |
| `_id`          | ObjectId | Auto-generated                               |
| `fullName`     | String   | Họ tên đầy đủ                               |
| `email`        | String   | Email (unique)                               |
| `phone`        | String   | Số điện thoại                                |
| `specialties`  | [String] | Chuyên môn (VD: ["IELTS", "TOEIC"])          |
| `isActive`     | Boolean  | Đang hoạt động                               |
| `createdAt`    | Date     | Ngày tạo                                     |
| `updatedAt`    | Date     | Ngày cập nhật                                |

### 4.3. `students` — Học viên

Thông tin học viên đăng ký tại trung tâm.

| Field         | Type     | Mô tả                                       |
| ------------- | -------- | -------------------------------------------- |
| `_id`         | ObjectId | Auto-generated                               |
| `fullName`    | String   | Họ tên đầy đủ                               |
| `email`       | String   | Email (unique)                               |
| `phone`       | String   | Số điện thoại                                |
| `dateOfBirth` | Date     | Ngày sinh                                    |
| `level`       | String   | Trình độ hiện tại (A1, A2, B1...)            |
| `isActive`    | Boolean  | Đang theo học                                |
| `createdAt`   | Date     | Ngày tạo                                     |
| `updatedAt`   | Date     | Ngày cập nhật                                |

### 4.4. `classes` — Lớp học

Lớp học là **thực thể kết nối** khóa học, giảng viên và học viên lại với nhau.

| Field        | Type         | Mô tả                                         |
| ------------ | ------------ | ---------------------------------------------- |
| `_id`        | ObjectId     | Auto-generated                                 |
| `name`       | String       | Tên lớp (VD: "IELTS-01", "TOEIC-A2-03")       |
| `course`     | ObjectId     | Ref → `courses` (thuộc khóa học nào)           |
| `teacher`    | ObjectId     | Ref → `teachers` (giảng viên phụ trách)        |
| `students`   | [ObjectId]   | Ref → `students` (danh sách học viên)          |
| `schedule`   | String       | Lịch học (VD: "T2-T4-T6, 18h-20h")            |
| `startDate`  | Date         | Ngày bắt đầu                                  |
| `endDate`    | Date         | Ngày kết thúc                                  |
| `maxStudents`| Number       | Sĩ số tối đa                                  |
| `status`     | String       | Trạng thái: "upcoming", "ongoing", "completed" |
| `createdAt`  | Date         | Ngày tạo                                       |
| `updatedAt`  | Date         | Ngày cập nhật                                  |

---

## 5. Quan hệ giữa các collections

```
courses (1) ──────< classes (N)
                      │
teachers (1) ────────┤
                      │
students (N) >───────┘
```

- **1 course → nhiều classes**: Một khóa "IELTS Foundation" có thể mở nhiều lớp (IELTS-01, IELTS-02...).
- **1 teacher → nhiều classes**: Một giảng viên có thể dạy nhiều lớp khác nhau.
- **1 class → nhiều students**: Mỗi lớp có danh sách học viên (mảng ObjectId ref).
- **1 student có thể thuộc nhiều classes**: Học viên có thể đăng ký nhiều lớp (quan hệ N-N thông qua mảng `students` trong class).

---

## 6. Định hướng phát triển

### MVP — Ưu tiên ban đầu
- [ ] CRUD đầy đủ cho 4 collections
- [ ] REST API chuẩn cho mỗi collection
- [ ] 4 trang frontend với form + bảng dữ liệu
- [ ] Gán giảng viên và học viên vào lớp học
- [ ] Hiển thị sĩ số, lịch học
- [ ] Giao diện đơn giản, sạch, dễ dùng

### Sau MVP (nếu cần mở rộng)
- [ ] Authentication (đăng nhập admin)
- [ ] Dashboard thống kê (tổng học viên, tổng lớp...)
- [ ] Tìm kiếm, lọc, phân trang
- [ ] Export dữ liệu (CSV/Excel)
- [ ] Quản lý điểm danh
- [ ] Quản lý học phí / thanh toán

### Nguyên tắc code
- Code rõ ràng, dễ đọc, dễ maintain
- Đặt tên biến/hàm/route có nghĩa, nhất quán
- Tách file theo chức năng (model, route, page)
- Không over-engineering, giữ đơn giản
- Comment khi logic phức tạp
