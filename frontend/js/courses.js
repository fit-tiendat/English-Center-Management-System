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
let activeFilter = 'all';

function renderFilters() {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const filters = [{ key: 'all', label: 'Tất cả', count: allCourses.length }];
  levels.forEach((lv) => {
    filters.push({ key: lv, label: lv, count: allCourses.filter((c) => c.level === lv).length });
  });
  filterSection.innerHTML = '<div class="filter-group"><span class="filter-label">Trình độ:</span><div class="filter-bar">' +
    filters.map((f) => '<button class="filter-chip ' + (f.key === activeFilter ? 'active' : '') + '" onclick="setFilter(\'' + f.key + '\')">' + f.label + ' <span class="chip-count">(' + f.count + ')</span></button>').join('') +
    '</div></div>';
}

function setFilter(key) { activeFilter = key; renderFilters(); renderTable(); }

function getFilteredCourses() {
  if (activeFilter === 'all') return allCourses;
  return allCourses.filter((c) => c.level === activeFilter);
}

function renderTable() {
  const courses = getFilteredCourses();
  if (allCourses.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có khóa học nào</td></tr>'; return; }
  if (courses.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có khóa học phù hợp với bộ lọc này.</td></tr>'; return; }
  tbody.innerHTML = courses.map((c) => '<tr><td>' + c.name + '</td><td>' + c.level + '</td><td>' + c.duration + '</td><td>' + formatCurrency(c.fee) + '</td><td><span class="badge ' + (c.isActive ? 'badge-active' : 'badge-inactive') + '">' + (c.isActive ? 'Đang mở' : 'Đã đóng') + '</span></td><td><button class="btn btn-sm btn-primary" onclick="editCourse(\'' + c._id + '\')">Sửa</button> <button class="btn btn-sm btn-danger" onclick="deleteCourse(\'' + c._id + '\')">Xóa</button></td></tr>').join('');
}

async function loadCourses() {
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Đang tải...</td></tr>';
  const result = await fetchJSON(COURSES_URL);
  if (!result.success) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>'; return; }
  allCourses = result.data;
  renderFilters();
  renderTable();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const level = document.getElementById('level').value;
  const duration = document.getElementById('duration').value.trim();
  const feeRaw = document.getElementById('fee').value;
  const description = document.getElementById('description').value.trim();
  if (!name) { showToast('Tên khóa học là bắt buộc', 'error'); return; }
  if (!level) { showToast('Vui lòng chọn trình độ', 'error'); return; }
  if (!duration) { showToast('Thời lượng là bắt buộc', 'error'); return; }
  if (!feeRaw && feeRaw !== '0') { showToast('Học phí là bắt buộc', 'error'); return; }
  if (!isNonNegativeNumber(feeRaw)) { showToast('Học phí phải là số không âm', 'error'); return; }
  const data = { name, description, level, duration, fee: Number(feeRaw) };
  let result;
  if (editingId) { result = await fetchJSON(COURSES_URL + '/' + editingId, { method: 'PUT', body: data }); }
  else { result = await fetchJSON(COURSES_URL, { method: 'POST', body: data }); }
  if (result.success) { showToast(editingId ? 'Cập nhật thành công!' : 'Thêm khóa học thành công!'); cancelEdit(); loadCourses(); }
  else { showToast(result.message || 'Có lỗi xảy ra', 'error'); }
});

async function editCourse(id) {
  const result = await fetchJSON(COURSES_URL + '/' + id);
  if (!result.success) { showToast('Không tìm thấy khóa học', 'error'); return; }
  const c = result.data; editingId = c._id;
  document.getElementById('course-id').value = c._id;
  document.getElementById('name').value = c.name;
  document.getElementById('description').value = c.description || '';
  document.getElementById('level').value = c.level;
  document.getElementById('duration').value = c.duration;
  document.getElementById('fee').value = c.fee;
  formTitle.textContent = 'Sửa khóa học'; btnSubmit.textContent = 'Cập nhật'; btnCancel.style.display = 'inline-block';
  form.scrollIntoView({ behavior: 'smooth' });
}

async function deleteCourse(id) {
  if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return;
  const result = await fetchJSON(COURSES_URL + '/' + id, { method: 'DELETE' });
  if (result.success) { showToast('Đã xóa khóa học'); loadCourses(); }
  else { showToast(result.message || 'Xóa thất bại', 'error'); }
}

function cancelEdit() {
  editingId = null; form.reset();
  document.getElementById('course-id').value = '';
  formTitle.textContent = 'Thêm khóa học mới'; btnSubmit.textContent = 'Thêm khóa học'; btnCancel.style.display = 'none';
}

renderNav('courses');
loadCourses();
