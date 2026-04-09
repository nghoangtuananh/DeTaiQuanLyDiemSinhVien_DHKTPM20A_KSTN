/* ========================================
   THONGKE.JS - Thong Ke Diem So (thongke.html)
   ========================================
   - Tai bang diem tu Backend
   - Tinh phan bo xep loai (A+ -> F)
   - Ve 3 bieu do Chart.js: Bar, Doughnut, Line
   - Hien thi bang tong hop thong ke
   ======================================== */

$(document).ready(function () {

    // --- State ---
    let students = [];
    let currentClassId = null;
    let barChart = null;
    let pieChart = null;
    let lineChart = null;

    // Du lieu mau (khong su dung khi co Backend)
    const MOCK_STUDENTS = [
        { mssv: "20123456", name: "Nguyễn Văn A", tinChi: 3, tx: [8, 9, 8], th: [8.5, 9, 8], gk: 8, ck: 8.5, note: "Giỏi" },
        { mssv: "20123457", name: "Trần Thị B", tinChi: 3, tx: [7, 8, null], th: [7, 7, 7], gk: 7.5, ck: 7.0, note: "" },
        { mssv: "20123458", name: "Lê Văn C", tinChi: 3, tx: [5, 6, 5], th: [5, 5, 5], gk: 4, ck: 3.5, note: "Cần cải thiện" },
        { mssv: "20123459", name: "Hoàng Văn D", tinChi: 3, tx: [9, 10, 10], th: [10, 10, 9.5], gk: 9.5, ck: 9.0, note: "" }
    ];

    // === API: Tai bang diem de thong ke ===
    function loadGradesForStats(classId) {
        $.get(window.API_BASE + '/grades/' + classId)
            .done(function (data) {
                currentClassId = classId;
                students = data.students;
                renderStatistics();
            })
            .fail(function () {
                window.showToast('Lỗi khi tải dữ liệu thống kê từ Server!', 'danger');
            });
    }

    // === Tinh toan va ve bieu do thong ke ===
    function renderStatistics() {
        // Dem phan bo xep loai
        const grades = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D+': 0, 'D': 0, 'F': 0 };
        const scores = [];

        students.forEach(function (s) {
            const f = window.calcFinalScore(s);
            const letter = window.toLetterGrade(f);
            grades[letter]++;
            scores.push(f);
        });

        const total = students.length;

        // Cap nhat stat cards
        $('#countAPlus').text(grades['A+']);
        $('#countA').text(grades['A']);
        $('#countBPlus').text(grades['B+']);
        $('#countB').text(grades['B']);
        $('#countCPlus').text(grades['C+']);
        $('#countC').text(grades['C']);
        $('#countDPlus').text(grades['D+']);
        $('#countD').text(grades['D']);
        $('#countF').text(grades['F']);

        // Ve bang tong hop
        const ranges = [
            { label: 'Xuất sắc', letter: 'A+', range: '9.0 - 10.0', count: grades['A+'] },
            { label: 'Giỏi', letter: 'A', range: '8.5 - 8.99', count: grades['A'] },
            { label: 'Khá giỏi', letter: 'B+', range: '7.8 - 8.49', count: grades['B+'] },
            { label: 'Khá', letter: 'B', range: '7.0 - 7.79', count: grades['B'] },
            { label: 'Trung bình khá', letter: 'C+', range: '6.2 - 6.99', count: grades['C+'] },
            { label: 'Trung bình', letter: 'C', range: '5.5 - 6.19', count: grades['C'] },
            { label: 'Yếu', letter: 'D+', range: '4.8 - 5.49', count: grades['D+'] },
            { label: 'Kém', letter: 'D', range: '4.0 - 4.79', count: grades['D'] },
            { label: 'Không đạt', letter: 'F', range: '< 4.0', count: grades['F'] },
        ];

        const $summaryBody = $('#summaryTableBody');
        $summaryBody.empty();

        ranges.forEach(function (r) {
            const pct = total > 0 ? ((r.count / total) * 100).toFixed(1) : '0';
            $summaryBody.append(`
                <tr>
                    <td><strong>${r.label}</strong></td>
                    <td><strong>${r.letter}</strong></td>
                    <td>${r.range}</td>
                    <td><strong>${r.count}</strong></td>
                    <td>${pct}%</td>
                </tr>
            `);
        });

        $summaryBody.append(`
            <tr class="table-primary">
                <td colspan="3"><strong>Tổng cộng</strong></td>
                <td><strong>${total}</strong></td>
                <td><strong>100%</strong></td>
            </tr>
        `);

        // === Bieu do 1: Bar Chart — Phan bo xep loai ===
        const barCtx = document.getElementById('barChart').getContext('2d');
        if (barChart) barChart.destroy();

        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
                datasets: [{
                    label: 'Số lượng sinh viên',
                    data: Object.values(grades),
                    backgroundColor: [
                        '#1B5E20', '#2E7D32', '#1565C0', '#0277BD',
                        '#F9A825', '#EF6C00', '#D84315', '#BF360C', '#B71C1C'
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                    barPercentage: 0.6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#263238',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 8,
                        padding: 12,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 12, weight: '500' }
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                    },
                    x: {
                        ticks: {
                            font: { size: 13, weight: '600' }
                        },
                        grid: { display: false }
                    }
                }
            }
        });

        // === Bieu do 2: Doughnut Chart — Ty le Dat/Khong dat ===
        const passCount = scores.filter(s => s >= 4.0).length;
        const failCount = total - passCount;

        const pieCtx = document.getElementById('pieChart').getContext('2d');
        if (pieChart) pieChart.destroy();

        pieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Đạt', 'Không đạt'],
                datasets: [{
                    data: [passCount, failCount],
                    backgroundColor: ['#2E7D32', '#C62828'],
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 13, weight: '500' },
                            usePointStyle: true,
                            pointStyleWidth: 12,
                        }
                    },
                    tooltip: {
                        backgroundColor: '#263238',
                        cornerRadius: 8,
                        padding: 12,
                        callbacks: {
                            label: function (ctx) {
                                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                                return ` ${ctx.label}: ${ctx.raw} SV (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // === Bieu do 3: Line Chart — Phan bo diem tong ket ===
        const bins = {};
        for (let i = 0; i <= 10; i++) bins[i] = 0;

        scores.forEach(function (sc) {
            const rounded = Math.floor(sc);
            const key = Math.min(rounded, 10);
            bins[key]++;
        });

        const lineCtx = document.getElementById('lineChart').getContext('2d');
        if (lineChart) lineChart.destroy();

        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: Object.keys(bins).map(k => k + ' điểm'),
                datasets: [{
                    label: 'Số sinh viên',
                    data: Object.values(bins),
                    borderColor: '#1565C0',
                    backgroundColor: 'rgba(21, 101, 192, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#1565C0',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#263238',
                        cornerRadius: 8,
                        padding: 12,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 12 }
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                    },
                    x: {
                        ticks: { font: { size: 12 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // --- Khoi dong: tai thong ke tu lop da chon ---
    const savedClassId = localStorage.getItem('selectedClassId');
    if (savedClassId) {
        loadGradesForStats(savedClassId);
    }
});
