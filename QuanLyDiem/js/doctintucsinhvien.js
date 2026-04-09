/* ========================================
   DOCTINTUCSINHVIEN.JS - Doc Tin Tuc danh cho SV (doctintucsinhvien.html)
   ========================================
   - Kiem tra quyen truy cap (chi SV)
   - Dien thong tin SV len sidebar
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

    // --- Dien thong tin SV len sidebar ---
    $('#studentNameDisplay').text(studentName);
    $('#studentIdDisplay').text('MSSV: ' + studentId);
    $('#sidebarStudentName').text(studentName);
    $('#profileMssv').text(studentId);
});
