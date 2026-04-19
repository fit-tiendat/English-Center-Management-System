/* ========================================
   Teachers — Client-side CRUD logic
   ======================================== */

const TEACHERS_URL = `${API_BASE}/teachers`;

// DOM elements
const form = document.getElementById('teacher-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('teachers-tbody');

let editingId = null;

// --- Load danh sách teachers ---
async function loadTeachers() {
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Đang tải...</td></tr>';

  const result = await fetchJSON(TEACHERS_URL);

  if (!result.success) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>';
    return;
  }

  const teachers = result.data;

  if (teachers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có giảng viên nào</td></tr>';
    return;
  }

  tbody.innerHTML = teachers
    .map(
      (t) => `
    <tr>
      <td>${t.fullName}</td>
      <td>${t.email}</td>
      <td>${t.phone}</td>
      <td>${t.specialties.length > 0 ? t.specialties.join(', ') : '<span class="text-muted">—</span>'}</td>
      <td>
        <span class="badge ${t.isActive ? 'badge-active' : 'badge-inactive'}">
          ${t.isActive ? 'Đang dạy' : 'Nghỉ'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editTeacher('${t._id}')">Sửa</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTeacher('${t._id}')">Xóa</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Submit form ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Convert chuỗi specialties thành array
  const specialtiesRaw = document.getElementById('specialties').value.trim();
  const specialties = specialtiesRaw
    ? specialtiesRaw.split(',').map((s) => s.trim()).filter((s) => s)
    : [];

  const data = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    specialties,
  };

  let result;

  if (editingId) {
    result = await fetchJSON(`${TEACHERS_URL}/${editingId}`, {
      method: 'PUT',
      body: data,
    });
  } else {
    result = await fetchJSON(TEACHERS_URL, {
      method: 'POST',
      body: data,
    });
  }

  if (result.success) {
    showToast(editingId ? 'Cập nhật thành công!' : 'Thêm giảng viên thành công!');
    cancelEdit();
    loadTeachers();
  } else {
    showToast(result.message || 'Có lỗi xảy ra', 'error');
  }
});

// --- Edit ---
async function editTeacher(id) {
  const result = await fetchJSON(`${TEACHERS_URL}/${id}`);

  if (!result.success) {
    showToast('Không tìm thấy giảng viên', 'error');
    return;
  }

  const t = result.data;
  editingId = t._id;

  document.getElementById('teacher-id').value = t._id;
  document.getElementById('fullName').value = t.fullName;
  document.getElementById('email').value = t.email;
  document.getElementById('phone').value = t.phone;
  document.getElementById('specialties').value = t.specialties.join(', ');

  formTitle.textContent = 'Sửa giảng viên';
  btnSubmit.textContent = 'Cập nhật';
  btnCancel.style.display = 'inline-block';

  form.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete ---
async function deleteTeacher(id) {
  if (!confirm('Bạn có chắc muốn xóa giảng viên này?')) return;

  const result = await fetchJSON(`${TEACHERS_URL}/${id}`, { method: 'DELETE' });

  if (result.success) {
    showToast('Đã xóa giảng viên');
    loadTeachers();
  } else {
    showToast(result.message || 'Xóa thất bại', 'error');
  }
}

// --- Cancel edit ---
function cancelEdit() {
  editingId = null;
  form.reset();
  document.getElementById('teacher-id').value = '';
  formTitle.textContent = 'Thêm giảng viên mới';
  btnSubmit.textContent = 'Thêm giảng viên';
  btnCancel.style.display = 'none';
}

// --- Init ---
renderNav('teachers');
loadTeachers();
