/* ========================================
   COMMON.JS - Utilities dung chung toan du an
   ========================================
   - Kiem tra dang nhap (auth check)
   - Cau hinh chung (API_BASE, TX_COLS, TH_COLS)
   - Sidebar toggle (mobile)
   - Toast notification
   - Ham tinh diem theo chuan IUH
   ======================================== */

$(document).ready(function () {

    // --- Auth check: Chuyen ve login neu chua dang nhap ---
    if (!window.location.href.includes('login.html')) {
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = 'login.html';
            return;
        }
    }

    // --- Cau hinh chung ---
    window.TX_COLS = 3;
    window.TH_COLS = 3;
    window.API_BASE = 'http://localhost:3000/api';

    // --- Sidebar toggle (mobile) ---
    $('#sidebarToggle').on('click', function () {
        $('#sidebar').toggleClass('active');
        if ($('.sidebar-overlay').length === 0) {
            $('body').append('<div class="sidebar-overlay"></div>');
        }
        $('.sidebar-overlay').toggleClass('active');
    });

    $(document).on('click', '.sidebar-overlay', function () {
        $('#sidebar').removeClass('active');
        $(this).removeClass('active');
    });

    // --- Toast notification ---
    /** Hien thong bao ngan o goc man hinh, tu an sau 3s */
    window.showToast = function (message, type) {
        const $toast = $('#toastNotify');
        $toast.removeClass('text-bg-success text-bg-danger text-bg-warning text-bg-info');
        $toast.addClass('text-bg-' + (type || 'success'));
        $('#toastMessage').text(message);
        const toast = new bootstrap.Toast($toast[0], { delay: 3000 });
        toast.show();
    };

    // === Ham tinh diem theo chuan IUH ===

    /** Loc bo gia tri khong hop le (null, undefined, '', NaN) tu mang diem */
    window.getValidScores = function (arr) {
        return arr.filter(function (v) {
            return v !== null && v !== undefined && v !== '' && !isNaN(v);
        });
    };

    /** Tinh trung binh cong cac gia tri hop le trong mang */
    window.average = function (arr) {
        const valid = window.getValidScores(arr);
        if (valid.length === 0) return 0;
        return valid.reduce(function (a, b) { return a + b; }, 0) / valid.length;
    };

    /** Tinh diem tong ket thang 10: TB_TX*0.2 + TB_TH*0.2 + GK*0.2 + CK*0.4 */
    window.calcFinalScore = function (student) {
        const avgTX = window.average(student.tx);
        const avgTH = window.average(student.th);
        const gk = (student.gk !== null && student.gk !== '' && !isNaN(student.gk)) ? student.gk : 0;
        const ck = (student.ck !== null && student.ck !== '' && !isNaN(student.ck)) ? student.ck : 0;
        const final10 = avgTX * 0.2 + avgTH * 0.2 + gk * 0.2 + ck * 0.4;
        return Math.round(final10 * 10) / 10;
    };

    /** Quy doi thang 10 sang thang 4 */
    window.toScale4 = function (score10) {
        if (score10 >= 9.0) return 4.0;
        if (score10 >= 8.5) return 3.5;
        if (score10 >= 7.8) return 3.0;
        if (score10 >= 7.0) return 2.5;
        if (score10 >= 6.2) return 2.0;
        if (score10 >= 5.5) return 1.5;
        if (score10 >= 4.8) return 1.0;
        if (score10 >= 4.0) return 0.5;
        return 0;
    };

    /** Quy doi thang 10 sang diem chu (A+, A, B+, ..., F) */
    window.toLetterGrade = function (score10) {
        if (score10 >= 9.0) return 'A+';
        if (score10 >= 8.5) return 'A';
        if (score10 >= 7.8) return 'B+';
        if (score10 >= 7.0) return 'B';
        if (score10 >= 6.2) return 'C+';
        if (score10 >= 5.5) return 'C';
        if (score10 >= 4.8) return 'D+';
        if (score10 >= 4.0) return 'D';
        return 'F';
    };

    /** Chuyen diem chu sang xep loai tieng Viet */
    window.toRanking = function (letter) {
        const map = {
            'A+': 'Xuất sắc',
            'A': 'Giỏi',
            'B+': 'Khá giỏi',
            'B': 'Khá',
            'C+': 'TB Khá',
            'C': 'Trung bình',
            'D+': 'Yếu',
            'D': 'Kém',
            'F': 'Không đạt'
        };
        return map[letter] || '';
    };

    /** Tra ve CSS class mau tuong ung voi diem chu */
    window.gradeColorClass = function (letter) {
        if (letter === 'A+' || letter === 'A') return 'grade-excellent';
        if (letter === 'B+' || letter === 'B') return 'grade-good';
        if (letter === 'C+') return 'grade-above-avg';
        if (letter === 'C') return 'grade-average';
        if (letter === 'D+' || letter === 'D') return 'grade-below-avg';
        return 'grade-fail';
    };

    /** Kiem tra dat/khong dat (>= 4.0 la dat) */
    window.isPassed = function (score10) {
        return score10 >= 4.0;
    };

});
