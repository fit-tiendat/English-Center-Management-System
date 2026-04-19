/* ========================================
   Courses — Client-side CRUD logic
   ======================================== */

const COURSES_URL = `${API_BASE}/courses`;

// DOM elements
const form = document.getElementById('course-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('courses-tbody');

// Trạng thái: đang edit course nào (null = đang ở chế độ thêm mới)
let editingId = null;

// --- Load danh sách courses ---
async function loadCourses() {
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Đang tải...</td></tr>';

  const result = await fetchJSON(COURSES_URL);

  if (!result.success) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>';
    return;
  }

  const courses = result.data;

  if (courses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có khóa học nào</td></tr>';
    return;
  }

  tbody.innerHTML = courses
    .map(
      (c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.level}</td>
      <td>${c.duration}</td>
      <td>${formatCurrency(c.fee)}</td>
      <td>
        <span class="badge ${c.isActive ? 'badge-active' : 'badge-inactive'}">
          ${c.isActive ? 'Đang mở' : 'Đã đóng'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editCourse('${c._id}')">Sửa</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${c._id}')">Xóa</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Submit form (thêm mới hoặc cập nhật) ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const feeRaw = document.getElementById('fee').value;

  // --- Client-side validation ---
  if (!isNonNegativeNumber(feeRaw)) {
    showToast('Học phí phải là số không âm', 'error');
    return;
  }

  const data = {
    name: document.getElementById('name').value.trim(),
    description: document.getElementById('description').value.trim(),
    level: document.getElementById('level').value,
    duration: document.getElementById('duration').value.trim(),
    fee: Number(feeRaw),
  };

  let result;

  if (editingId) {
    // Cập nhật
    result = await fetchJSON(`${COURSES_URL}/${editingId}`, {
      method: 'PUT',
      body: data,
    });
  } else {
    // Tạo mới
    result = await fetchJSON(COURSES_URL, {
      method: 'POST',
      body: data,
    });
  }

  if (result.success) {
    showToast(editingId ? 'Cập nhật thành công!' : 'Thêm khóa học thành công!');
    cancelEdit();
    loadCourses();
  } else {
    showToast(result.message || 'Có lỗi xảy ra', 'error');
  }
});

// --- Edit: đổ dữ liệu lên form ---
async function editCourse(id) {
  const result = await fetchJSON(`${COURSES_URL}/${id}`);

  if (!result.success) {
    showToast('Không tìm thấy khóa học', 'error');
    return;
  }

  const c = result.data;
  editingId = c._id;

  document.getElementById('course-id').value = c._id;
  document.getElementById('name').value = c.name;
  document.getElementById('description').value = c.description || '';
  document.getElementById('level').value = c.level;
  document.getElementById('duration').value = c.duration;
  document.getElementById('fee').value = c.fee;

  formTitle.textContent = 'Sửa khóa học';
  btnSubmit.textContent = 'Cập nhật';
  btnCancel.style.display = 'inline-block';

  // Scroll lên form
  form.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete ---
async function deleteCourse(id) {
  if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;

  const result = await fetchJSON(`${COURSES_URL}/${id}`, { method: 'DELETE' });

  if (result.success) {
    showToast('Đã xóa khóa học');
    loadCourses();
  } else {
    showToast(result.message || 'Xóa thất bại', 'error');
  }
}

// --- Cancel edit: reset form về chế độ thêm mới ---
function cancelEdit() {
  editingId = null;
  form.reset();
  document.getElementById('course-id').value = '';
  formTitle.textContent = 'Thêm khóa học mới';
  btnSubmit.textContent = 'Thêm khóa học';
  btnCancel.style.display = 'none';
}

// --- Init ---
renderNav('courses');
loadCourses();
