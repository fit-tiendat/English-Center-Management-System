/* ========================================
   Shared JS — Dùng chung giữa các trang
   ======================================== */
/*
  API_BASE configuration:
  - Local dev (localhost):  uses '/api' (same-origin, Express serves frontend)
  - Production (Vercel):    set BACKEND_URL below to your Railway backend URL

  Cách dùng: trước khi deploy lên Vercel, đổi BACKEND_URL thành URL backend Railway.
  VD: 'https://your-app.up.railway.app'
*/
const BACKEND_URL = 'https://english-center-management-system-production.up.railway.app'; // Railway backend
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

/**
 * Fetch JSON helper — gọi API và parse response
 * @param {string} url - endpoint (VD: '/api/courses')
 * @param {object} options - fetch options (method, body...)
 * @returns {Promise<object>} parsed JSON response
 */
async function fetchJSON(url, options = {}) {
  try {
    const config = {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    const res = await fetch(url, config);
    return res.json();
  } catch (error) {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Hiển thị toast notification
 * @param {string} message - nội dung thông báo
 * @param {string} type - 'success' hoặc 'error'
 */
function showToast(message, type = 'success') {
  // Xóa toast cũ nếu có
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));

  // Tự ẩn sau 3 giây
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Render navigation bar — gọi từ mỗi trang
 * @param {string} activePage - tên trang hiện tại (VD: 'courses')
 */
function renderNav(activePage) {
  const navLinks = [
    { href: 'index.html', label: 'Trang chủ', key: 'home' },
    { href: 'courses.html', label: 'Khóa học', key: 'courses' },
    { href: 'teachers.html', label: 'Giảng viên', key: 'teachers' },
    { href: 'students.html', label: 'Học viên', key: 'students' },
    { href: 'classes.html', label: 'Lớp học', key: 'classes' },
  ];

  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let html = '<span class="nav-brand">English Center</span>';
  navLinks.forEach((link) => {
    const activeClass = link.key === activePage ? ' active' : '';
    html += `<a href="${link.href}" class="${activeClass}">${link.label}</a>`;
  });
  nav.innerHTML = html;
}

/**
 * Format số tiền VND
 * @param {number} amount
 * @returns {string} formatted string (VD: "1.500.000 ₫")
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}
