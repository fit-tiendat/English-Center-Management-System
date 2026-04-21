/* ========================================
   Teachers — Client-side CRUD + Filter
   ======================================== */

const TEACHERS_URL = `${API_BASE}/teachers`;

// DOM elements
const form = document.getElementById('teacher-form');
const formTitle = document.getElementById('form-title');
const btnSubmit = document.getElementById('btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const tbody = document.getElementById('teachers-tbody');
const filterSection = document.getElementById('filter-section');

let editingId = null;
let allTeachers = [];
let activeFilter = 'all';

// --- Filter chips ---
function renderFilters() {
  const all = allTeachers.length;
  const teaching = allTeachers.filter((t) => t.derivedStatus === 'Đang dạy').length;
  const unassigned = allTeachers.filter((t) => t.derivedStatus === 'Chưa phân công').length;
  const multi = allTeachers.filter((t) => t.classCount >= 2).length;

  const filters = [
    { key: 'all', label: 'Tất cả', count: all },
    { key: 'teaching', label: 'Đang dạy', count: teaching },
    { key: 'unassigned', label: 'Chưa phân công', count: unassigned },
    { key: 'multi', label: 'Dạy nhiều lớp', count: multi },
  ];

  filterSection.innerHTML = `<div class="filter-bar">${filters
    .map(
      (f) =>
        `<button class="filter-chip ${f.key === activeFilter ? 'active' : ''}" onclick="setFilter('${f.key}')">${f.label} <span class="chip-count">(${f.count})</span></button>`
    )
    .join('')}</div>`;
}

function setFilter(key) {
  activeFilter = key;
  renderFilters();
  renderTable();
}

function getFilteredTeachers() {
  switch (activeFilter) {
    case 'teaching':
      return allTeachers.filter((t) => t.derivedStatus === 'Đang dạy');
    case 'unassigned':
      return allTeachers.filter((t) => t.derivedStatus === 'Chưa phân công');
    case 'multi':
      return allTeachers.filter((t) => t.classCount >= 2);
    default:
      return allTeachers;
  }
}

// --- Render table ---
function renderTable() {
  const teachers = getFilteredTeachers();

  if (allTeachers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Chưa có giảng viên nào</td></tr>';
    return;
  }

  if (teachers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Không có giảng viên phù hợp với bộ lọc này.</td></tr>';
    return;
  }

  tbody.innerHTML = teachers
    .map(
      (t) => `
    <tr>
      <td>${t.fullName}</td>
      <td>${t.email}</td>
      <td>${t.phone}</td>
      <td>${t.specialties || '<span class="text-muted">—</span>'}</td>
      <td>${t.classNames && t.classNames.length > 0 ? t.classNames.join(', ') : '<span class="text-muted">Chưa có</span>'}</td>
      <td>
        <span class="badge ${t.derivedStatus === 'Đang dạy' ? 'badge-active' : 'badge-inactive'}">
          ${t.derivedStatus}
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

// --- Load danh sách teachers ---
async function loadTeachers() {
  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Đang tải...</td></tr>';

  const result = await fetchJSON(TEACHERS_URL);
  if (!result.success) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Lỗi tải dữ liệu</td></tr>';
    return;
  }

  allTeachers = result.data;
  renderFilters();
  renderTable();
}

// --- Submit form ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const specialties = document.getElementById('specialties').value;

  // --- Client-side validation ---
  if (!fullName) { showToast('Họ và tên là bắt buộc', 'error'); return; }
  if (!email) { showToast('Email là bắt buộc', 'error'); return; }
  if (!phone) { showToast('Số điện thoại là bắt buộc', 'error'); return; }
  if (!isValidPhone(phone)) { showToast('Số điện thoại phải có 9-11 chữ số, không chứa chữ cái', 'error'); return; }
  if (!specialties) { showToast('Vui lòng chọn chuyên môn', 'error'); return; }

  const data = { fullName, email, phone, specialties };

  let result;
  if (editingId) {
    result = await fetchJSON(`${TEACHERS_URL}/${editingId}`, { method: 'PUT', body: data });
  } else {
    result = await fetchJSON(TEACHERS_URL, { method: 'POST', body: data });
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
  if (!result.success) { showToast('Không tìm thấy giảng viên', 'error'); return; }

  const t = result.data;
  editingId = t._id;

  document.getElementById('teacher-id').value = t._id;
  document.getElementById('fullName').value = t.fullName;
  document.getElementById('email').value = t.email;
  document.getElementById('phone').value = t.phone;
  document.getElementById('specialties').value = t.specialties || '';

  formTitle.textContent = 'Sửa giảng viên';
  btnSubmit.textContent = 'Cập nhật';
  btnCancel.style.display = 'inline-block';
  form.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete ---
async function deleteTeacher(id) {
  if (!confirm('Bạn có chắc muốn xóa giảng viên này?')) return;
  const result = await fetchJSON(`${TEACHERS_URL}/${id}`, { method: 'DELETE' });
  if (result.success) { showToast('Đã xóa giảng viên'); loadTeachers(); }
  else { showToast(result.message || 'Xóa thất bại', 'error'); }
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
