/* ========================================
   TAIKHOANSINHVIEN.JS - Tai Khoan Sinh Vien (taikhoansinhvien.html)
   ========================================
   - Kiem tra quyen truy cap (chi SV)
   - Dien thong tin SV len giao dien (sidebar + profile card)
   - Xu ly dang xuat + modal xac nhan
   ======================================== */

$(document).ready(function () {

    // --- Kiem tra session ---
    const role = localStorage.getItem('role');
    const studentId = localStorage.getItem('studentId');
    const studentName = localStorage.getItem('studentName');

    if (role !== 'student' || !studentId) {
        window.location.href = 'login.html';
        return;
    }

    // --- Dien thong tin SV len giao dien ---
    $('#studentIdDisplay').text('MSSV: ' + studentId);
    $('#sidebarStudentName').text(studentName);
    $('#profileName').text(studentName);
    $('#profileMssv').text(studentId);
    $('#profileEmail').text(studentId + '@student.iuh.edu.vn');

    // --- Dang xuat ---
    $('#btnLogout').on('click', function () {
        $('#logoutModal').modal('show');
    });

    $('#confirmLogoutBtn').on('click', function () {
        localStorage.clear();
        window.location.href = 'login.html';
    });
});
