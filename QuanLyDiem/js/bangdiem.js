/* ========================================
   BANGDIEM.JS - Quan ly Bang Diem Lop (bangdiem.html)
   ========================================
   - Tai danh sach lop tu Backend -> dropdown selector
   - Hien thi & chinh sua bang diem (editable inputs)
   - Luu bang diem len MongoDB (PUT)
   - Tim kiem / loc / sap xep qua API Backend
   - Xuat bang diem ra file JSON
   ======================================== */

$(document).ready(function () {

    // --- Application State ---
    let students = [];
    let currentClassId = null;
    let currentClassInfo = null;
    const TOTAL_COLS = 3 + 1 + window.TX_COLS + window.TH_COLS + 2 + 5 + 1 + 1;

    // === API: Tai danh sach lop hoc phan ===
    function loadClasses() {
        $.get(window.API_BASE + '/classes')
            .done(function (classes) {
                const $sel = $('#classSelector');
                $sel.find('option:not(:first)').remove();

                classes.forEach(function (c) {
                    $sel.append(`<option value="${c.classCode}_${c.subjectName}_${c.semester}_${c.schoolYear}">${c.classCode}_${c.subjectName}_${c.semester}_${c.schoolYear}</option>`);
                });

                // Tu dong chon lai lop da xem truoc do
                const saved = localStorage.getItem('selectedClassId');
                if (saved && $sel.find('option[value="' + saved + '"]').length) {
                    $sel.val(saved).trigger('change');
                }
            })
            .fail(function () {
                window.showToast('Không thể tải Tên Bảng (Collections)! Hãy chắc chắn Backend Node.js đang chạy.', 'danger');
            });
    }

    // === API: Tai bang diem cua 1 lop ===
    function loadGrades(classId) {
        $.get(window.API_BASE + '/grades/' + classId)
            .done(function (data) {
                currentClassId = classId;
                currentClassInfo = data.classInfo;
                students = data.students;

                $('#classCode').text(data.classInfo.classCode);
                $('#semester').text(data.classInfo.semester);
                $('#schoolYear').text(data.classInfo.schoolYear);

                localStorage.setItem('selectedClassId', classId);
                renderGradeTable(students);
            })
            .fail(function () {
                window.showToast('Lỗi khi tải bảng điểm!', 'danger');
            });
    }

    // === API: Luu bang diem len MongoDB ===
    function saveGrades() {
        if (!currentClassId) {
            window.showToast('Vui lòng chọn lớp học phần trước!', 'warning');
            return;
        }

        $.ajax({
            url: window.API_BASE + '/grades/' + currentClassId,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ students: students })
        })
            .done(function (res) {
                window.showToast('Đã lưu dữ liệu xuống MongoDB thành công!', 'success');
            })
            .fail(function () {
                window.showToast('Lỗi kết nối khi lưu!', 'danger');
            });
    }

    // --- Su kien chon lop ---
    $('#classSelector').on('change', function () {
        const classId = $(this).val();
        if (classId) {
            // Reset bo loc khi chuyen lop
            $('#searchInput').val('');
            $('#filterScoreField').val('final');
            $('#filterScoreMin').val('');
            $('#filterScoreMax').val('');
            $('#filterPassed').val('');
            $('#filterSort').val('name_asc');
            $('#filterStatus').empty();

            currentClassId = classId;
            loadGrades(classId);
        }
    });

    // --- Helper: Lay ten cuoi de sap xep ---
    function getLastName(fullName) {
        if (!fullName) return "";
        const parts = fullName.trim().split(' ');
        return parts[parts.length - 1].toLowerCase();
    }

    // === Render bang diem HTML ===
    function renderGradeTable(data) {
        const $tbody = $('#gradeTableBody');
        $tbody.empty();

        if (!currentClassId) {
            $tbody.append(`
                <tr>
                    <td colspan="${TOTAL_COLS}" class="text-center text-muted py-4">
                        <i class="bi bi-arrow-up-circle fs-1 d-block mb-2"></i>
                        Vui lòng chọn lớp học phần ở trên
                    </td>
                </tr>
            `);
            return;
        }

        if (data.length === 0) {
            $tbody.append(`
                <tr>
                    <td colspan="${TOTAL_COLS}" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        Chưa có dữ liệu sinh viên
                    </td>
                </tr>
            `);
            return;
        }

        data.forEach(function (s, displayIdx) {
            const actualIdx = displayIdx;

            // Tinh diem tu common.js
            const final10 = window.calcFinalScore(s);
            const scale4 = window.toScale4(final10);
            const letter = window.toLetterGrade(final10);
            const ranking = window.toRanking(letter);
            const passed = window.isPassed(final10);
            const colorClass = window.gradeColorClass(letter);

            // Tao o input diem TX
            let txCells = '';
            for (let i = 0; i < window.TX_COLS; i++) {
                const val = (s.tx[i] !== null && s.tx[i] !== undefined) ? s.tx[i] : '';
                const emptyClass = val === '' ? 'score-input-empty' : '';
                txCells += `<td><input type="number" class="score-input ${emptyClass}" data-field="tx${i}" min="0" max="10" step="0.5" value="${val}" placeholder="-"></td>`;
            }

            // Tao o input diem TH
            let thCells = '';
            for (let i = 0; i < window.TH_COLS; i++) {
                const val = (s.th[i] !== null && s.th[i] !== undefined) ? s.th[i] : '';
                const emptyClass = val === '' ? 'score-input-empty' : '';
                thCells += `<td><input type="number" class="score-input ${emptyClass}" data-field="th${i}" min="0" max="10" step="0.5" value="${val}" placeholder="-"></td>`;
            }

            const row = `
                <tr data-index="${actualIdx}">
                    <td>${displayIdx + 1}</td>
                    <td><strong>${s.mssv}</strong></td>
                    <td>${s.name}</td>
                    <td class="td-credits">${s.tinChi}</td>
                    ${txCells}
                    ${thCells}
                    <td><input type="number" class="score-input" data-field="gk" min="0" max="10" step="0.5" value="${s.gk}"></td>
                    <td><input type="number" class="score-input" data-field="ck" min="0" max="10" step="0.5" value="${s.ck}"></td>
                    <td class="td-total ${colorClass}">${final10.toFixed(1)}</td>
                    <td class="td-letter ${colorClass}">${scale4.toFixed(1)}</td>
                    <td class="td-letter ${colorClass}"><strong>${letter}</strong></td>
                    <td class="td-ranking ${colorClass}">${ranking}</td>
                    <td><input type="text" class="note-input" data-field="note" value="${s.note}" placeholder="..."></td>
                    <td>
                        ${passed
                    ? '<i class="bi bi-check-circle-fill pass-icon pass" title="Đạt"></i>'
                    : '<i class="bi bi-x-circle-fill pass-icon fail" title="Không đạt"></i>'}
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });

        updateInfoCards(data);
    }

    // === Cap nhat the thong ke (info cards) ===
    function updateInfoCards(data) {
        const total = data.length;
        let passCount = 0;
        let totalScore = 0;

        data.forEach(function (s) {
            const f = window.calcFinalScore(s);
            if (window.isPassed(f)) passCount++;
            totalScore += f;
        });

        const failCount = total - passCount;
        const avg = total > 0 ? (totalScore / total).toFixed(1) : '0';

        $('#totalStudents').text(total);
        $('#totalPass').text(passCount);
        $('#totalFail').text(failCount);
        $('#avgScore').text(avg);
    }

    // --- Su kien go diem (event delegation) ---
    $(document).on('change', '.score-input', function () {
        const $row = $(this).closest('tr');
        const idx = $row.data('index');
        const field = $(this).data('field');
        const rawVal = $(this).val().trim();

        // Truong hop xoa trang
        if (rawVal === '') {
            if (field.startsWith('tx')) {
                const i = parseInt(field.replace('tx', ''));
                students[idx].tx[i] = null;
            } else if (field.startsWith('th')) {
                const i = parseInt(field.replace('th', ''));
                students[idx].th[i] = null;
            } else if (field === 'gk') {
                students[idx].gk = 0;
            } else if (field === 'ck') {
                students[idx].ck = 0;
            }
            renderGradeTable(students);
            return;
        }

        // Validate va cap nhat
        let val = parseFloat(rawVal);
        if (isNaN(val) || val < 0) val = 0;
        if (val > 10) val = 10;
        $(this).val(val);

        if (field.startsWith('tx')) {
            const i = parseInt(field.replace('tx', ''));
            students[idx].tx[i] = val;
        } else if (field.startsWith('th')) {
            const i = parseInt(field.replace('th', ''));
            students[idx].th[i] = val;
        } else if (field === 'gk') {
            students[idx].gk = val;
        } else if (field === 'ck') {
            students[idx].ck = val;
        }

        renderGradeTable(students);
    });

    // --- Su kien ghi chu ---
    $(document).on('change', '.note-input', function () {
        const idx = $(this).closest('tr').data('index');
        students[idx].note = $(this).val();
    });

    // === Tim kiem & Bo loc qua API Backend ===
    let searchTimer = null;

    /** Thu thap gia tri bo loc tu giao dien */
    function getCurrentFilterParams() {
        const q = $('#searchInput').val().trim();
        const scoreField = $('#filterScoreField').val();
        const scoreMin = $('#filterScoreMin').val();
        const scoreMax = $('#filterScoreMax').val();
        const passed = $('#filterPassed').val();
        const sortVal = $('#filterSort').val().split('_');
        const sortBy = sortVal[0];
        const sortOrder = sortVal[1];

        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (scoreField) params.append('scoreField', scoreField);
        if (scoreMin) params.append('scoreMin', scoreMin);
        if (scoreMax) params.append('scoreMax', scoreMax);
        if (passed) params.append('passed', passed);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);

        return params;
    }

    /** Gui bo loc den Backend va render ket qua */
    function applyFilter() {
        if (!currentClassId) return;

        var params = getCurrentFilterParams();
        var url = window.API_BASE + '/grades/' + currentClassId + '/filter?' + params.toString();
        var sortOption = $('#filterSort').val();

        $.get(url)
            .done(function (data) {
                var filteredStudents = data.students;
                renderGradeTable(filteredStudents);

                // Hien thi trang thai loc
                var sortLabel = '';
                if (sortOption === 'name_asc') {
                    sortLabel = 'Tên (A→Z)';
                } else if (sortOption === 'name_desc') {
                    sortLabel = 'Tên (Z→A)';
                } else if (sortOption === 'final_asc') {
                    sortLabel = 'Điểm TK (Thấp→Cao)';
                } else if (sortOption === 'final_desc') {
                    sortLabel = 'Điểm TK (Cao→Thấp)';
                }

                $('#filterStatus').html(
                    '<i class="bi bi-database me-1"></i>MongoDB: Tìm thấy: <strong>' + data.totalResults + '</strong> kết quả' +
                    ' | <i class="bi bi-sort-down me-1"></i>Sort CSDL: <strong>' + sortLabel + '</strong>'
                );
            })
            .fail(function () {
                window.showToast('Lỗi khi truy vấn dữ liệu Mongoose Filter!', 'danger');
            });
    }

    // --- Debounce tim kiem (300ms) ---
    $('#searchInput').on('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            applyFilter();
        }, 300);
    });

    // --- Thay doi bo loc -> goi API ---
    $('#filterScoreField, #filterScoreMin, #filterScoreMax, #filterPassed, #filterSort').on('change', function () {
        applyFilter();
    });

    // --- Reset bo loc ---
    $('#btnResetFilter').on('click', function () {
        $('#searchInput').val('');
        $('#filterScoreField').val('final');
        $('#filterScoreMin').val('');
        $('#filterScoreMax').val('');
        $('#filterPassed').val('');
        $('#filterSort').val('name_asc');
        if (currentClassId) {
            loadGrades(currentClassId);
            $('#filterStatus').html('<i class="bi bi-database me-1"></i>Da xoa bo loc - Hien thi tat ca sinh vien');
        }
    });

    // --- Nut Luu bang diem ---
    $('#btnSave').on('click', function () {
        saveGrades();
    });

    // --- Nut Xuat file JSON ---
    $('#btnExport').on('click', async function () {
        if (!currentClassId) {
            window.showToast('Chưa có dữ liệu để xuất!', 'warning');
            return;
        }

        try {
            const params = getCurrentFilterParams();
            const url = window.API_BASE + '/grades/' + currentClassId + '/export-json?' + params.toString();
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Export thất bại');
            }

            const blob = await response.blob();
            const filename = `${currentClassId}.json`;

            // Tao link an de trigger download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);

            window.showToast('MongoDB Export JSON Thành Công!', 'success');
        } catch (err) {
            window.showToast('Lỗi khi xuất CSDL!', 'danger');
        }
    });

    // --- Khoi dong: tai danh sach lop ---
    loadClasses();
});
