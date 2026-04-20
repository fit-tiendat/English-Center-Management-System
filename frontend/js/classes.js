/* ========================================
   Classes — Client-side CRUD + Filter
   ======================================== */

const CLASSES_URL = `${API_BASE}/classes`;
const COURSES_URL = `${API_BASE}/courses`;
const TEACHERS_URL = `${API_BASE}/teachers`;
const STUDENTS_URL_REF = `${API_BASE}/students`;

const form = document.getElementById('class-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('classes-tbody');
const courseSelect = document.getElementById('course');
const teacherSelect = document.getElementById('teacher');
const studentsChecklist = document.getElementById('students-checklist');
const studentCountEl = document.getElementById('student-count');
const filterSection = document.getElementById('filter-section');

let editingId = null;
let allClasses = [];
let allCoursesData = [];
let activeCourseFilter = 'all';
let activeStatusFilter = 'all';

const STATUS_LABELS = { 'Sắp mở': 'Sắp mở', 'Đang học': 'Đang học', 'Đã kết thúc': 'Đã kết thúc', 'Đã hủy': 'Đã hủy' };
const STATUS_BADGE = { 'Sắp mở': 'badge-warning', 'Đang học': 'badge-active', 'Đã kết thúc': 'badge-inactive', 'Đã hủy': 'badge-inactive' };

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// --- Filter chips ---
function renderFilters() {
  // Course filters
  var courseFilters = [{ key: 'all', label: 'Tất cả', count: allClasses.length }];
  allCoursesData.forEach(function(c) {
    var count = allClasses.filter(function(cl) { return cl.course && cl.course._id === c._id; }).length;
    courseFilters.push({ key: c._id, label: c.name, count: count });
  });

  // Status filters
  var statuses = ['Sắp mở', 'Đang học', 'Đã kết thúc', 'Đã hủy'];
  var statusFilters = [{ key: 'all', label: 'Tất cả', count: allClasses.length }];
  statuses.forEach(function(s) {
    statusFilters.push({ key: s, label: STATUS_LABELS[s], count: allClasses.filter(function(cl) { return cl.status === s; }).length });
  });

  var html = '<div class="filter-group"><span class="filter-label">Khóa học:</span><div class="filter-bar">';
  courseFilters.forEach(function(f) {
    html += '<button class="filter-chip ' + (f.key === activeCourseFilter ? 'active' : '') + '" onclick="setCourseFilter(\'' + f.key + '\')">' + f.label + ' <span class="chip-count">(' + f.count + ')</span></button>';
  });
  html += '</div></div>';

  html += '<div class="filter-group"><span class="filter-label">Trạng thái:</span><div class="filter-bar">';
  statusFilters.forEach(function(f) {
    html += '<button class="filter-chip ' + (f.key === activeStatusFilter ? 'active' : '') + '" onclick="setStatusFilter(\'' + f.key + '\')">' + f.label + ' <span class="chip-count">(' + f.count + ')</span></button>';
  });
  html += '</div></div>';

  filterSection.innerHTML = html;
}

function setCourseFilter(key) { activeCourseFilter = key; renderFilters(); renderTable(); }
function setStatusFilter(key) { activeStatusFilter = key; renderFilters(); renderTable(); }

function getFilteredClasses() {
  var result = allClasses;
  if (activeCourseFilter !== 'all') {
    result = result.filter(function(c) { return c.course && c.course._id === activeCourseFilter; });
  }
  if (activeStatusFilter !== 'all') {
    result = result.filter(function(c) { return c.status === activeStatusFilter; });
  }
  return result;
}

// --- Render table ---
function renderTable() {
  var classes = getFilteredClasses();
  if (allClasses.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Chưa có lớp học nào</td></tr>'; return; }
  if (classes.length === 0) { tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Không có lớp học phù hợp với bộ lọc này.</td></tr>'; return; }
  tbody.innerHTML = classes.map(function(c) {
    return '<tr>' +
      '<td>' + c.name + '</td>' +
      '<td>' + (c.course ? c.course.name : '<span class="text-muted">—</span>') + '</td>' +
      '<td>' + (c.teacher ? c.teacher.fullName : '<span class="text-muted">—</span>') + '</td>' +
      '<td>' + (c.students ? c.students.length : 0) + ' / ' + c.maxStudents + '</td>' +
      '<td>' + c.schedule + '</td>' +
      '<td>' + formatDateShort(c.startDate) + ' → ' + formatDateShort(c.endDate) + '</td>' +
      '<td><span class="badge ' + (STATUS_BADGE[c.status] || 'badge-inactive') + '">' + (STATUS_LABELS[c.status] || c.status) + '</span></td>' +
      '<td><button class="btn btn-sm btn-primary" onclick="editClass(\'' + c._id + '\')">Sửa</button> <button class="btn btn-sm btn-danger" onclick="deleteClass(\'' + c._id + '\')">Xóa</button></td>' +
      '</tr>';
  }).join('');
}

// --- Load dropdowns ---
async function loadCourseOptions() {
  var result = await fetchJSON(COURSES_URL);
  if (!result.success) return;
  allCoursesData = result.data;
  if (result.data.length === 0) {
    courseSelect.innerHTML = '<option value="">Chưa có khóa học — hãy tạo khóa học trước</option>';
    btnSubmit.disabled = true; btnSubmit.title = 'Cần tạo khóa học trước';
    showToast('Bạn cần tạo khóa học trước khi tạo lớp học.', 'error'); return;
  }
  courseSelect.innerHTML = '<option value="">-- Chọn khóa học --</option>';
  result.data.forEach(function(c) { courseSelect.innerHTML += '<option value="' + c._id + '">' + c.name + ' (' + c.level + ')</option>'; });
}

async function loadTeacherOptions() {
  var result = await fetchJSON(TEACHERS_URL);
  if (!result.success) return;
  if (result.data.length === 0) {
    teacherSelect.innerHTML = '<option value="">Chưa có giảng viên — hãy tạo giảng viên trước</option>';
    btnSubmit.disabled = true; btnSubmit.title = 'Cần tạo giảng viên trước';
    showToast('Bạn cần tạo giảng viên trước khi gán lớp học.', 'error'); return;
  }
  teacherSelect.innerHTML = '<option value="">-- Chọn giảng viên --</option>';
  result.data.forEach(function(t) { teacherSelect.innerHTML += '<option value="' + t._id + '">' + t.fullName + '</option>'; });
}

async function loadStudentChecklist() {
  var result = await fetchJSON(STUDENTS_URL_REF);
  if (!result.success) return;
  if (result.data.length === 0) { studentsChecklist.innerHTML = '<span class="no-data">Chưa có học viên nào</span>'; return; }
  studentsChecklist.innerHTML = result.data.map(function(s) {
    return '<label><input type="checkbox" name="students" value="' + s._id + '"> ' + s.fullName + ' — ' + s.level + '</label>';
  }).join('');
  studentsChecklist.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.addEventListener('change', updateStudentCount); });
}

function updateStudentCount() {
  var checked = studentsChecklist.querySelectorAll('input[type="checkbox"]:checked').length;
  studentCountEl.textContent = 'Đã chọn: ' + checked;
}

function getSelectedStudentIds() {
  return Array.from(studentsChecklist.querySelectorAll('input[type="checkbox"]:checked')).map(function(cb) { return cb.value; });
}

function setSelectedStudents(studentIds) {
  studentsChecklist.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
  studentIds.forEach(function(id) { var cb = studentsChecklist.querySelector('input[value="' + id + '"]'); if (cb) cb.checked = true; });
  updateStudentCount();
}

// --- Load classes ---
async function loadClasses() {
  tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Đang tải...</td></tr>';
  var result = await fetchJSON(CLASSES_URL);
  if (!result.success) { tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>'; return; }
  allClasses = result.data;
  renderFilters();
  renderTable();
}

// --- Submit form ---
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  var name = document.getElementById('name').value.trim();
  var course = document.getElementById('course').value;
  var teacher = document.getElementById('teacher').value;
  var schedule = document.getElementById('schedule').value.trim();
  var startDate = document.getElementById('startDate').value;
  var endDate = document.getElementById('endDate').value;
  var maxStudentsRaw = document.getElementById('maxStudents').value;
  var status = document.getElementById('status').value;
  var selectedStudents = getSelectedStudentIds();
  if (!name) { showToast('Tên lớp học là bắt buộc', 'error'); return; }
  if (!course) { showToast('Vui lòng chọn khóa học', 'error'); return; }
  if (!teacher) { showToast('Vui lòng chọn giảng viên', 'error'); return; }
  if (!schedule) { showToast('Lịch học là bắt buộc', 'error'); return; }
  if (!startDate) { showToast('Ngày bắt đầu là bắt buộc', 'error'); return; }
  if (!endDate) { showToast('Ngày kết thúc là bắt buộc', 'error'); return; }
  if (endDate < startDate) { showToast('Ngày kết thúc phải sau ngày bắt đầu', 'error'); return; }
  if (!maxStudentsRaw) { showToast('Sĩ số tối đa là bắt buộc', 'error'); return; }
  if (!isPositiveInteger(maxStudentsRaw)) { showToast('Sĩ số tối đa phải là số nguyên dương', 'error'); return; }
  var maxStudents = Number(maxStudentsRaw);
  if (selectedStudents.length > maxStudents) { showToast('Số học viên (' + selectedStudents.length + ') vượt quá sĩ số tối đa (' + maxStudents + ')', 'error'); return; }
  if (!status) { showToast('Vui lòng chọn trạng thái', 'error'); return; }
  var data = { name: name, course: course, teacher: teacher, students: selectedStudents, schedule: schedule, startDate: startDate, endDate: endDate, maxStudents: maxStudents, status: status };
  var result;
  if (editingId) { result = await fetchJSON(CLASSES_URL + '/' + editingId, { method: 'PUT', body: data }); }
  else { result = await fetchJSON(CLASSES_URL, { method: 'POST', body: data }); }
  if (result.success) { showToast(editingId ? 'Cập nhật thành công!' : 'Tạo lớp học thành công!'); cancelEdit(); loadClasses(); }
  else { showToast(result.message || 'Có lỗi xảy ra', 'error'); }
});

async function editClass(id) {
  var result = await fetchJSON(CLASSES_URL + '/' + id);
  if (!result.success) { showToast('Không tìm thấy lớp học', 'error'); return; }
  var c = result.data; editingId = c._id;
  document.getElementById('class-id').value = c._id;
  document.getElementById('name').value = c.name;
  document.getElementById('course').value = c.course ? c.course._id : '';
  document.getElementById('teacher').value = c.teacher ? c.teacher._id : '';
  document.getElementById('schedule').value = c.schedule;
  document.getElementById('startDate').value = c.startDate ? c.startDate.substring(0, 10) : '';
  document.getElementById('endDate').value = c.endDate ? c.endDate.substring(0, 10) : '';
  document.getElementById('maxStudents').value = c.maxStudents;
  document.getElementById('status').value = c.status;
  var studentIds = c.students ? c.students.map(function(s) { return s._id; }) : [];
  setSelectedStudents(studentIds);
  formTitle.textContent = 'Sửa lớp học'; btnSubmit.textContent = 'Cập nhật'; btnCancel.style.display = 'inline-block';
  form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteClass(id) {
  if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;
  var result = await fetchJSON(CLASSES_URL + '/' + id, { method: 'DELETE' });
  if (result.success) { showToast('Đã xóa lớp học'); loadClasses(); }
  else { showToast(result.message || 'Xóa thất bại', 'error'); }
}

function cancelEdit() {
  editingId = null; form.reset();
  document.getElementById('class-id').value = '';
  formTitle.textContent = 'Tạo lớp học mới'; btnSubmit.textContent = 'Tạo lớp học'; btnCancel.style.display = 'none';
  setSelectedStudents([]);
}

renderNav('classes');
Promise.all([loadCourseOptions(), loadTeacherOptions(), loadStudentChecklist()]).then(function() { loadClasses(); });
