/* ========================================
   BANGDIEMCANHAN.JS - Bang Diem Ca Nhan Sinh Vien (bangdiemcanhan.html)
   ========================================
   - Kiem tra quyen truy cap (chi SV)
   - Hien thi ten SV len sidebar
   - Goi API lay diem ca nhan tu tat ca mon hoc
   - Render bang diem tong hop
   - Xu ly dang xuat
   ======================================== */

$(document).ready(function () {

    // --- Kiem tra session: chi cho phep sinh vien ---
    const role = localStorage.getItem('role');
    const studentId = localStorage.getItem('studentId');
    const studentName = localStorage.getItem('studentName');

    if (!role || role !== 'student' || !studentId) {
        window.location.href = 'login.html';
        return;
    }

    // --- Dien thong tin SV len sidebar ---
    if (studentName) {
        $('#studentNameDisplay').text(studentName);
    }
    $('#studentIdDisplay').text(`MSSV: ${studentId}`);
    $('#sidebarStudentName').text(studentName);
    $('#profileMssv').text(studentId);

    // --- Cau hinh so cot diem ---
    const TX_COLS = window.TX_COLS || 3;
    const TH_COLS = window.TH_COLS || 3;

    // === API: Lay diem ca nhan tu tat ca mon ===
    function loadPersonalGrades() {
        const apiUrl = `http://localhost:3000/api/student-grades/${studentId}`;

        $.get(apiUrl)
            .done(function (data) {
                const subjects = data.subjects || [];
                renderGradeTable(subjects);
            })
            .fail(function (err) {
                console.error('Lỗi khi tải bảng điểm cá nhân:', err);
                window.showToast?.('Không thể tải điểm từ server', 'danger');
            });
    }

    // === Render bang diem ca nhan ===
    function renderGradeTable(subjects) {
        const tbody = document.getElementById('gradeTableBody');
        tbody.innerHTML = '';

        if (subjects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="20" class="text-center py-4">Chưa có dữ liệu điểm môn nào.</td></tr>`;
            return;
        }

        subjects.forEach((subject, index) => {
            const s = subject.grades;

            // Dam bao du so cot TX/TH
            const tx = s.tx || [];
            while (tx.length < TX_COLS) tx.push('');

            const th = s.th || [];
            while (th.length < TH_COLS) th.push('');

            const gk = (s.gk !== undefined && s.gk !== null) ? s.gk : '';
            const ck = (s.ck !== undefined && s.ck !== null) ? s.ck : '';

            // Tinh diem tu common.js
            const final10 = window.calcFinalScore(s);
            const scale4 = window.toScale4(final10);
            const letter = window.toLetterGrade(final10);
            const ranking = window.toRanking(letter);
            const passed = window.isPassed(final10);
            const colorClass = window.gradeColorClass(letter);
            const noteColor = passed ? 'text-success' : 'text-danger fw-bold';
            const passIcon = passed
                ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>'
                : '<i class="bi bi-x-circle-fill text-danger fs-5"></i>';
            let noteStr = s.note || '';

            // Xay dung hang HTML
            let tr = `<tr>`;
            tr += `<td class="text-center align-middle">${index + 1}</td>`;
            tr += `<td class="font-monospace fw-semibold align-middle">${subject.subjectName}<br><small class="text-muted">${subject.classCode}</small></td>`;

            const credits = s.credits || 3;
            tr += `<td class="text-center align-middle">${credits}</td>`;

            for (let i = 0; i < TX_COLS; i++) {
                tr += `<td class="text-center align-middle">${tx[i]}</td>`;
            }

            for (let i = 0; i < TH_COLS; i++) {
                tr += `<td class="text-center align-middle">${th[i]}</td>`;
            }

            tr += `<td class="text-center align-middle">${gk}</td>`;
            tr += `<td class="text-center align-middle fw-bold">${ck}</td>`;
            tr += `<td class="text-center align-middle fw-bold fs-6 text-primary">${final10.toFixed(1)}</td>`;
            tr += `<td class="text-center align-middle text-purple">${scale4.toFixed(1)}</td>`;
            tr += `<td class="text-center align-middle fw-bold fs-6 ${colorClass}">${letter}</td>`;
            tr += `<td class="text-center align-middle ${colorClass}">${ranking}</td>`;
            tr += `<td class="align-middle ${noteColor}">${noteStr}</td>`;
            tr += `<td class="text-center align-middle">${passIcon}</td>`;
            tr += `</tr>`;

            tbody.insertAdjacentHTML('beforeend', tr);
        });
    }

    // --- Xu ly dang xuat ---
    $('#btnLogout').on('click', function () {
        $('#logoutModal').modal('show');
    });

    $('#confirmLogoutBtn').on('click', function () {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // --- Khoi dong: tai diem ca nhan ---
    loadPersonalGrades();
});
