/* ========================================
   Classes — Client-side CRUD logic
   ======================================== */

const CLASSES_URL = `${API_BASE}/classes`;
const COURSES_URL = `${API_BASE}/courses`;
const TEACHERS_URL = `${API_BASE}/teachers`;
const STUDENTS_URL_REF = `${API_BASE}/students`;

// DOM elements
const form = document.getElementById('class-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('classes-tbody');
const courseSelect = document.getElementById('course');
const teacherSelect = document.getElementById('teacher');
const studentsChecklist = document.getElementById('students-checklist');
const studentCountEl = document.getElementById('student-count');

let editingId = null;

// --- Status labels tiếng Việt ---
const STATUS_LABELS = {
  planned: 'Sắp mở',
  ongoing: 'Đang học',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_BADGE = {
  planned: 'badge-active',
  ongoing: 'badge-active',
  completed: 'badge-inactive',
  cancelled: 'badge-inactive',
};

// --- Format ngày ---
function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// --- Load dropdowns ---
async function loadCourseOptions() {
  const result = await fetchJSON(COURSES_URL);
  if (!result.success) return;

  courseSelect.innerHTML = '<option value="">-- Chọn khóa học --</option>';
  result.data.forEach((c) => {
    courseSelect.innerHTML += `<option value="${c._id}">${c.name} (${c.level})</option>`;
  });
}

async function loadTeacherOptions() {
  const result = await fetchJSON(TEACHERS_URL);
  if (!result.success) return;

  teacherSelect.innerHTML = '<option value="">-- Chọn giảng viên --</option>';
  result.data.forEach((t) => {
    teacherSelect.innerHTML += `<option value="${t._id}">${t.fullName}</option>`;
  });
}

async function loadStudentChecklist() {
  const result = await fetchJSON(STUDENTS_URL_REF);
  if (!result.success) return;

  if (result.data.length === 0) {
    studentsChecklist.innerHTML = '<span class="no-data">Chưa có học viên nào</span>';
    return;
  }

  studentsChecklist.innerHTML = result.data
    .map(
      (s) => `
    <label>
      <input type="checkbox" name="students" value="${s._id}">
      ${s.fullName} — ${s.level}
    </label>
  `
    )
    .join('');

  // Cập nhật counter khi check/uncheck
  studentsChecklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', updateStudentCount);
  });
}

function updateStudentCount() {
  const checked = studentsChecklist.querySelectorAll('input[type="checkbox"]:checked').length;
  studentCountEl.textContent = `Đã chọn: ${checked}`;
}

function getSelectedStudentIds() {
  const checkboxes = studentsChecklist.querySelectorAll('input[type="checkbox"]:checked');
  return Array.from(checkboxes).map((cb) => cb.value);
}

function setSelectedStudents(studentIds) {
  // Uncheck tất cả trước
  studentsChecklist.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
  // Check theo danh sách
  studentIds.forEach((id) => {
    const cb = studentsChecklist.querySelector(`input[value="${id}"]`);
    if (cb) cb.checked = true;
  });
  updateStudentCount();
}

// --- Load danh sách classes ---
async function loadClasses() {
  tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Đang tải...</td></tr>';

  const result = await fetchJSON(CLASSES_URL);

  if (!result.success) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>';
    return;
  }

  const classes = result.data;

  if (classes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Chưa có lớp học nào</td></tr>';
    return;
  }

  tbody.innerHTML = classes
    .map(
      (c) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.course ? c.course.name : '<span class="text-muted">—</span>'}</td>
      <td>${c.teacher ? c.teacher.fullName : '<span class="text-muted">—</span>'}</td>
      <td>${c.students ? c.students.length : 0} / ${c.maxStudents}</td>
      <td>${c.schedule}</td>
      <td>${formatDateShort(c.startDate)} → ${formatDateShort(c.endDate)}</td>
      <td>
        <span class="badge ${STATUS_BADGE[c.status] || 'badge-inactive'}">
          ${STATUS_LABELS[c.status] || c.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editClass('${c._id}')">Sửa</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClass('${c._id}')">Xóa</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// --- Submit form ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  // Client-side validation: endDate >= startDate
  if (endDate < startDate) {
    showToast('Ngày kết thúc phải sau ngày bắt đầu', 'error');
    return;
  }

  const selectedStudents = getSelectedStudentIds();
  const maxStudents = Number(document.getElementById('maxStudents').value);

  // Client-side validation: student count <= maxStudents
  if (selectedStudents.length > maxStudents) {
    showToast(`Số học viên (${selectedStudents.length}) vượt quá sĩ số tối đa (${maxStudents})`, 'error');
    return;
  }

  const data = {
    name: document.getElementById('name').value.trim(),
    course: document.getElementById('course').value,
    teacher: document.getElementById('teacher').value,
    students: selectedStudents,
    schedule: document.getElementById('schedule').value.trim(),
    startDate,
    endDate,
    maxStudents,
    status: document.getElementById('status').value,
  };

  let result;

  if (editingId) {
    result = await fetchJSON(`${CLASSES_URL}/${editingId}`, {
      method: 'PUT',
      body: data,
    });
  } else {
    result = await fetchJSON(CLASSES_URL, {
      method: 'POST',
      body: data,
    });
  }

  if (result.success) {
    showToast(editingId ? 'Cập nhật thành công!' : 'Tạo lớp học thành công!');
    cancelEdit();
    loadClasses();
  } else {
    showToast(result.message || 'Có lỗi xảy ra', 'error');
  }
});

// --- Edit ---
async function editClass(id) {
  const result = await fetchJSON(`${CLASSES_URL}/${id}`);

  if (!result.success) {
    showToast('Không tìm thấy lớp học', 'error');
    return;
  }

  const c = result.data;
  editingId = c._id;

  document.getElementById('class-id').value = c._id;
  document.getElementById('name').value = c.name;
  document.getElementById('course').value = c.course ? c.course._id : '';
  document.getElementById('teacher').value = c.teacher ? c.teacher._id : '';
  document.getElementById('schedule').value = c.schedule;
  document.getElementById('startDate').value = c.startDate ? c.startDate.substring(0, 10) : '';
  document.getElementById('endDate').value = c.endDate ? c.endDate.substring(0, 10) : '';
  document.getElementById('maxStudents').value = c.maxStudents;
  document.getElementById('status').value = c.status;

  // Set selected students
  const studentIds = c.students ? c.students.map((s) => s._id) : [];
  setSelectedStudents(studentIds);

  formTitle.textContent = 'Sửa lớp học';
  btnSubmit.textContent = 'Cập nhật';
  btnCancel.style.display = 'inline-block';

  form.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete ---
async function deleteClass(id) {
  if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;

  const result = await fetchJSON(`${CLASSES_URL}/${id}`, { method: 'DELETE' });

  if (result.success) {
    showToast('Đã xóa lớp học');
    loadClasses();
  } else {
    showToast(result.message || 'Xóa thất bại', 'error');
  }
}

// --- Cancel edit ---
function cancelEdit() {
  editingId = null;
  form.reset();
  document.getElementById('class-id').value = '';
  formTitle.textContent = 'Tạo lớp học mới';
  btnSubmit.textContent = 'Tạo lớp học';
  btnCancel.style.display = 'none';
  setSelectedStudents([]);
}

// --- Init ---
renderNav('classes');
Promise.all([loadCourseOptions(), loadTeacherOptions(), loadStudentChecklist()]).then(() => {
  loadClasses();
});
