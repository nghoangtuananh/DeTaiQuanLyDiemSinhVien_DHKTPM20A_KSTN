/* ========================================
   TAIKHOAN.JS - Tai Khoan Giang Vien (taikhoan.html)
   ========================================
   - Xu ly dang xuat + modal xac nhan
   ======================================== */

$(document).ready(function () {

    // --- Nut dang xuat: hien modal xac nhan ---
    $('#btnLogout').on('click', function () {
        const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
        logoutModal.show();
    });

    // --- Xac nhan dang xuat: xoa session, chuyen ve login ---
    $('#confirmLogoutBtn').on('click', function () {
        const logoutModal = bootstrap.Modal.getInstance(document.getElementById('logoutModal'));
        logoutModal.hide();

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('teacherId');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('selectedClassId');

        window.showToast('Đăng xuất thành công!', 'success');

        setTimeout(function () {
            window.location.href = 'login.html';
        }, 1000);
    });
});
