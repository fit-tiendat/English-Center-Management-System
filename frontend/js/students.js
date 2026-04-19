/* ========================================
   Students — Client-side CRUD logic
   ======================================== */

const STUDENTS_URL = `${API_BASE}/students`;

// DOM elements
const form = document.getElementById('student-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('students-tbody');

let editingId = null;

// --- Format ngày sinh ---
function formatDate(dateStr) {
  if (!dateStr) return '<span class="text-muted">—</span>';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
}

// --- Load danh sách students ---
async function loadStudents() {
  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Đang tải...</td></tr>';

  const result = await fetchJSON(STUDENTS_URL);

  if (!result.success) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>';
    return;
  }

  const students = result.data;

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có học viên nào</td></tr>';
    return;
  }

  tbody.innerHTML = students
    .map(
      (s) => `
    <tr>
      <td>${s.fullName}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${formatDate(s.dateOfBirth)}</td>
      <td>${s.level}</td>
      <td>
        <span class="badge ${s.derivedStatus === 'Đang học' ? 'badge-active' : 'badge-inactive'}">
          ${s.derivedStatus}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editStudent('${s._id}')">Sửa</button>
        <button class="btn btn-sm btn-danger" onclick="deleteStudent('${s._id}')">Xóa</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Submit form ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const phone = document.getElementById('phone').value.trim();
  const dob = document.getElementById('dateOfBirth').value;

  // --- Client-side validation ---
  if (!isValidPhone(phone)) {
    showToast('Số điện thoại phải có 9-11 chữ số, không chứa chữ cái', 'error');
    return;
  }

  if (dob && !isDateNotFuture(dob)) {
    showToast('Ngày sinh không được ở tương lai', 'error');
    return;
  }

  const data = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone,
    level: document.getElementById('level').value,
  };

  // Chỉ gửi dateOfBirth nếu có nhập
  if (dob) data.dateOfBirth = dob;

  let result;

  if (editingId) {
    result = await fetchJSON(`${STUDENTS_URL}/${editingId}`, {
      method: 'PUT',
      body: data,
    });
  } else {
    result = await fetchJSON(STUDENTS_URL, {
      method: 'POST',
      body: data,
    });
  }

  if (result.success) {
    showToast(editingId ? 'Cập nhật thành công!' : 'Thêm học viên thành công!');
    cancelEdit();
    loadStudents();
  } else {
    showToast(result.message || 'Có lỗi xảy ra', 'error');
  }
});

// --- Edit ---
async function editStudent(id) {
  const result = await fetchJSON(`${STUDENTS_URL}/${id}`);

  if (!result.success) {
    showToast('Không tìm thấy học viên', 'error');
    return;
  }

  const s = result.data;
  editingId = s._id;

  document.getElementById('student-id').value = s._id;
  document.getElementById('fullName').value = s.fullName;
  document.getElementById('email').value = s.email;
  document.getElementById('phone').value = s.phone;
  document.getElementById('level').value = s.level;

  // Format date cho input type="date" (YYYY-MM-DD)
  if (s.dateOfBirth) {
    document.getElementById('dateOfBirth').value = s.dateOfBirth.substring(0, 10);
  } else {
    document.getElementById('dateOfBirth').value = '';
  }

  formTitle.textContent = 'Sửa học viên';
  btnSubmit.textContent = 'Cập nhật';
  btnCancel.style.display = 'inline-block';

  form.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete ---
async function deleteStudent(id) {
  if (!confirm('Bạn có chắc muốn xóa học viên này?')) return;

  const result = await fetchJSON(`${STUDENTS_URL}/${id}`, { method: 'DELETE' });

  if (result.success) {
    showToast('Đã xóa học viên');
    loadStudents();
  } else {
    showToast(result.message || 'Xóa thất bại', 'error');
  }
}

// --- Cancel edit ---
function cancelEdit() {
  editingId = null;
  form.reset();
  document.getElementById('student-id').value = '';
  formTitle.textContent = 'Thêm học viên mới';
  btnSubmit.textContent = 'Thêm học viên';
  btnCancel.style.display = 'none';
}

// --- Init ---
renderNav('students');
loadStudents();
