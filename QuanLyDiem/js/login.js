/* ========================================
   LOGIN.JS - Xu ly dang nhap (login.html)
   ========================================
   - Toggle hien/an mat khau
   - Validate form & xac thuc dang nhap (GV hardcoded, SV qua API)
   - Luu session vao localStorage
   - Dieu huong theo vai tro (teacher -> bangdiem, student -> bangdiemcanhan)
   ======================================== */

// Tai khoan giang vien mac dinh (hardcoded)
const VALID_CREDENTIALS = {
    teacherId: "12345678",
    password: "12345678",
};

// --- Toggle hien/an mat khau ---
document
    .getElementById("togglePassword")
    .addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        const icon = this;

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            icon.classList.remove("bi-eye");
            icon.classList.add("bi-eye-slash");
        } else {
            passwordInput.type = "password";
            icon.classList.remove("bi-eye-slash");
            icon.classList.add("bi-eye");
        }
    });

// --- Hien thong bao loi (tu an sau 4s) ---
function showError(message) {
    const alertDiv = document.getElementById("alertMessage");
    const alertText = document.getElementById("alertText");
    alertText.textContent = message;
    alertDiv.classList.remove("d-none");

    setTimeout(() => {
        alertDiv.classList.add("d-none");
    }, 4000);
}

// --- Xu ly submit form dang nhap ---
document
    .getElementById("loginForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        const teacherId = document.getElementById("teacherId").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validate: kiem tra rong
        if (!teacherId || !password) {
            showError("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        try {
            // Goi API lay danh sach SV de xac thuc
            const response = await fetch("http://localhost:3000/api/students/roles");
            const data = await response.json();
            const students = data.students || [];

            // Kiem tra co phai sinh vien khong
            let isStudent = false;
            let studentInfo = null;

            for (let i = 0; i < students.length; i++) {
                if (students[i].mssv === teacherId && password === "12345678") {
                    isStudent = true;
                    studentInfo = students[i];
                    break;
                }
            }

            // Xu ly ket qua dang nhap
            if (isStudent) {
                // Dang nhap thanh cong — Sinh vien
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("role", "student");
                localStorage.setItem("studentId", studentInfo.mssv);
                localStorage.setItem("studentName", studentInfo.name);
                localStorage.setItem("loginTime", new Date().toISOString());

                showSuccessAnimation();
                setTimeout(() => {
                    window.location.href = "bangdiemcanhan.html";
                }, 1000);

            } else if (
                teacherId === VALID_CREDENTIALS.teacherId &&
                password === VALID_CREDENTIALS.password
            ) {
                // Dang nhap thanh cong — Giang vien
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("role", "teacher");
                localStorage.setItem("teacherId", teacherId);
                localStorage.setItem("loginTime", new Date().toISOString());

                showSuccessAnimation();
                setTimeout(() => {
                    window.location.href = "bangdiem.html";
                }, 1000);

            } else {
                // Dang nhap that bai
                showError("Tài khoản hoặc mật khẩu không đúng!");
                showShakeAnimation();
            }
        } catch (error) {
            // Loi ket noi Backend
            console.error("Lỗi khi kết nối server:", error);
            showError("Không thể kết nối đến server. Vui lòng kiểm tra lại backend.");
            showShakeAnimation();
        }
    });

// --- Animation dang nhap thanh cong ---
function showSuccessAnimation() {
    const loginBtn = document.querySelector(".btn-login");
    loginBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i> Đăng nhập thành công!';
    loginBtn.style.background = "linear-gradient(135deg, #1B5E20 0%, #2e7d32 100%)";
}

// --- Animation rung khung khi sai mat khau ---
function showShakeAnimation() {
    const container = document.querySelector(".login-container");
    container.style.animation = "shake 0.5s";
    setTimeout(() => {
        container.style.animation = "";
    }, 500);
}

// --- Xoa session cu khi vao trang login ---
localStorage.removeItem("isLoggedIn");
localStorage.removeItem("teacherId");
localStorage.removeItem("loginTime");
