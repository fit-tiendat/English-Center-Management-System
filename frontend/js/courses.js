/* ========================================
   Courses — Client-side CRUD + Filter
   ======================================== */

const COURSES_URL = `${API_BASE}/courses`;

const form = document.getElementById('course-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('courses-tbody');
const filterSection = document.getElementById('filter-section');

let editingId = null;
let allCourses = [];
let activeLevelFilter = 'all';
let activeRegFilter = 'all';

// --- Filter chips ---
function renderFilters() {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  // Level filters
  var levelFilters = [{ key: 'all', label: 'Tất cả', count: allCourses.length }];
  levels.forEach(function(lv) {
    levelFilters.push({ key: lv, label: lv, count: allCourses.filter(function(c) { return c.level === lv; }).length });
  });

  // Registration status filters
  var openCount = allCourses.filter(function(c) { return c.registrationStatus === 'Đang mở'; }).length;
  var closedCount = allCourses.filter(function(c) { return c.registrationStatus === 'Đã đóng'; }).length;
  var regFilters = [
    { key: 'all', label: 'Tất cả', count: allCourses.length },
    { key: 'open', label: 'Đang mở', count: openCount },
    { key: 'closed', label: 'Đã đóng', count: closedCount },
  ];

  var html = '<div class="filter-group"><span class="filter-label">Trình độ:</span><div class="filter-bar">';
  levelFilters.forEach(function(f) {
    html += '<button class="filter-chip ' + (f.key === activeLevelFilter ? 'active' : '') + '" onclick="setLevelFilter(\'' + f.key + '\')">' + f.label + ' <span class="chip-count">(' + f.count + ')</span></button>';
  });
  html += '</div></div>';

  html += '<div class="filter-group"><span class="filter-label">Đăng ký:</span><div class="filter-bar">';
  regFilters.forEach(function(f) {
    html += '<button class="filter-chip ' + (f.key === activeRegFilter ? 'active' : '') + '" onclick="setRegFilter(\'' + f.key + '\')">' + f.label + ' <span class="chip-count">(' + f.count + ')</span></button>';
  });
  html += '</div></div>';

  filterSection.innerHTML = html;
}

function setLevelFilter(key) { activeLevelFilter = key; renderFilters(); renderTable(); }
function setRegFilter(key) { activeRegFilter = key; renderFilters(); renderTable(); }

function getFilteredCourses() {
  var result = allCourses;
  if (activeLevelFilter !== 'all') {
    result = result.filter(function(c) { return c.level === activeLevelFilter; });
  }
  if (activeRegFilter === 'open') {
    result = result.filter(function(c) { return c.registrationStatus === 'Đang mở'; });
  } else if (activeRegFilter === 'closed') {
    result = result.filter(function(c) { return c.registrationStatus === 'Đã đóng'; });
  }
  return result;
}

// --- Render table ---
function renderTable() {
  var courses = getFilteredCourses();
  if (allCourses.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có khóa học nào</td></tr>'; return; }
  if (courses.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có khóa học phù hợp với bộ lọc này.</td></tr>'; return; }

  tbody.innerHTML = courses.map(function(c) {
    return '<tr>' +
      '<td>' + c.name + '</td>' +
      '<td>' + c.level + '</td>' +
      '<td>' + c.duration + '</td>' +
      '<td>' + formatCurrency(c.fee) + '</td>' +
      '<td>' + c.classCount + ' lớp / ' + c.studentCount + ' HV</td>' +
      '<td><span class="badge ' + (c.registrationStatus === 'Đang mở' ? 'badge-active' : 'badge-inactive') + '">' + c.registrationStatus + '</span></td>' +
      '<td><button class="btn btn-sm btn-primary" onclick="editCourse(\'' + c._id + '\')">Sửa</button> <button class="btn btn-sm btn-danger" onclick="deleteCourse(\'' + c._id + '\')">Xóa</button></td>' +
      '</tr>';
  }).join('');
}

// --- Load courses ---
async function loadCourses() {
  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Đang tải...</td></tr>';
  var result = await fetchJSON(COURSES_URL);
  if (!result.success) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>'; return; }
  allCourses = result.data;
  renderFilters();
  renderTable();
}

// --- Submit form ---
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  var name = document.getElementById('name').value.trim();
  var level = document.getElementById('level').value;
  var duration = document.getElementById('duration').value.trim();
  var feeRaw = document.getElementById('fee').value;
  var description = document.getElementById('description').value.trim();
  var isActive = document.getElementById('isActive').value === 'true';

  if (!name) { showToast('Tên khóa học là bắt buộc', 'error'); return; }
  if (!level) { showToast('Vui lòng chọn trình độ', 'error'); return; }
  if (!duration) { showToast('Thời lượng là bắt buộc', 'error'); return; }
  if (!feeRaw && feeRaw !== '0') { showToast('Học phí là bắt buộc', 'error'); return; }
  if (!isNonNegativeNumber(feeRaw)) { showToast('Học phí phải là số không âm', 'error'); return; }

  var data = { name: name, description: description, level: level, duration: duration, fee: Number(feeRaw), isActive: isActive };
  var result;
  if (editingId) { result = await fetchJSON(COURSES_URL + '/' + editingId, { method: 'PUT', body: data }); }
  else { result = await fetchJSON(COURSES_URL, { method: 'POST', body: data }); }
  if (result.success) { showToast(editingId ? 'Cập nhật thành công!' : 'Thêm khóa học thành công!'); cancelEdit(); loadCourses(); }
  else { showToast(result.message || 'Có lỗi xảy ra', 'error'); }
});

// --- Edit ---
async function editCourse(id) {
  var result = await fetchJSON(COURSES_URL + '/' + id);
  if (!result.success) { showToast('Không tìm thấy khóa học', 'error'); return; }
  var c = result.data; editingId = c._id;
  document.getElementById('course-id').value = c._id;
  document.getElementById('name').value = c.name;
  document.getElementById('description').value = c.description || '';
  document.getElementById('level').value = c.level;
  document.getElementById('duration').value = c.duration;
  document.getElementById('fee').value = c.fee;
  document.getElementById('isActive').value = c.isActive ? 'true' : 'false';
  formTitle.textContent = 'Sửa khóa học'; btnSubmit.textContent = 'Cập nhật'; btnCancel.style.display = 'inline-block';
  form.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete ---
async function deleteCourse(id) {
  if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
  var result = await fetchJSON(COURSES_URL + '/' + id, { method: 'DELETE' });
  if (result.success) { showToast('Đã xóa khóa học'); loadCourses(); }
  else { showToast(result.message || 'Xóa thất bại', 'error'); }
}

// --- Cancel edit ---
function cancelEdit() {
  editingId = null; form.reset();
  document.getElementById('course-id').value = '';
  document.getElementById('isActive').value = 'true';
  formTitle.textContent = 'Thêm khóa học mới'; btnSubmit.textContent = 'Thêm khóa học'; btnCancel.style.display = 'none';
}

// --- Init ---
renderNav('courses');
loadCourses();
