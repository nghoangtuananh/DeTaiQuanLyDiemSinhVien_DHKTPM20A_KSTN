@echo off
echo ========================================================
echo FIX LOI DUONG DAN QUA DAI CUA WINDOWS
echo ========================================================
echo Ban dang bi loi mongodb khong the install do duong dan 
echo thu muc qua dai (vuot qua 260 ky tu cua Windows).
echo.
echo Kich ban nay se tao mot o dia ao (O dia Z:) de rut ngan 
echo duong dan, sau do cai dat lai node_modules va chay server.
echo.
pause

:: Xoa o dia Z neu da ton tai (bo qua loi neu khong co)
subst Z: /D >nul 2>&1

:: Tao o dia Z tro vao thu muc backend hien tai
subst Z: "%~dp0backend"

echo Da tao o dia ao Z: tro den thu muc backend.
echo Chuyen huong sang o dia Z:...
Z:

echo.
echo Dang xoa node_modules bi loi...
rmdir /S /Q node_modules
del package-lock.json

echo.
echo Dang cai dat lai cac thu vien (Vui long doi khuat mat)...
call npm install

echo.
echo Cai dat hoan tat. Dang khoi dong server...
echo Bam Ctrl + C de thoat.
call npx nodemon server

:: Khi tat server, tro ve o dia C va xoa o dia Z
C:
subst Z: /D
