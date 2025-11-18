@echo off
chcp 65001 > nul
rem 前端服务管理脚本
rem 用法: frontend.bat {start|stop|restart|status|dev|build}

setlocal enabledelayedexpansion

rem 应用名称
set APP_NAME=react-ui
set APP_DIR=react-ui
set PID_FILE=.%APP_NAME%.pid
set LOG_DIR=logs
set LOG_FILE=%LOG_DIR%\%APP_NAME%.log

rem 如果没有参数，显示菜单
if "%1"=="" goto menu

rem 如果有参数，直接执行命令
if /i "%1"=="start" goto start_dev
if /i "%1"=="start:prod" goto start_prod
if /i "%1"=="stop" goto stop
if /i "%1"=="restart" goto restart
if /i "%1"=="status" goto status
if /i "%1"=="dev" goto start_dev
if /i "%1"=="build" goto build
goto usage

:menu
echo.
echo ========================================
echo    前端服务管理
echo ========================================
echo  [1] 启动开发服务器
echo  [2] 停止服务
echo  [3] 重启服务
echo  [4] 查看状态
echo  [5] 构建生产版本
echo  [6] 启动生产预览服务器
echo  [7] 退出
echo ========================================
echo.
set /p choice=请输入选项 (1-7):

if "%choice%"=="1" goto start_dev
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto build
if "%choice%"=="6" goto start_prod
if "%choice%"=="7" exit /b 0
goto menu

:check_node
where node > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js v16 或以上版本
    goto end
)

where npm > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm 未安装
    goto end
)
goto :eof

:check_dependencies
if not exist "%APP_DIR%\node_modules" (
    echo [WARNING] 依赖未安装，正在安装...
    cd "%APP_DIR%"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] 依赖安装失败
        cd ..
        goto end
    )
    cd ..
    echo [SUCCESS] 依赖安装完成
)
goto :eof

:start_dev
echo [INFO] 正在启动 %APP_NAME% 开发服务器...

rem 检查是否已经运行
call :get_pid
if defined pid (
    echo [WARNING] %APP_NAME% 已经在运行中 ^(PID: !pid!^)
    goto end
)

call :check_node
call :check_dependencies

rem 创建日志目录
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

rem 启动开发服务器
cd "%APP_DIR%"
start "React-UI-Dev" cmd /c "npm run dev > ..\%LOG_FILE% 2>&1"
cd ..

timeout /t 3 > nul

rem 获取进程PID (查找 node.exe 运行 vite 的进程)
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo list ^| findstr /i "PID"') do (
    set pid=%%a
)

if defined pid (
    echo [SUCCESS] %APP_NAME% 开发服务器启动成功
    echo !pid! > %PID_FILE%
    echo [INFO] 访问地址: http://localhost:8000
    echo [INFO] 日志文件: %LOG_FILE%
) else (
    echo [WARNING] 进程已启动，但无法获取PID
    echo [INFO] 访问地址: http://localhost:8000
)
goto end

:start_prod
echo [INFO] 正在启动 %APP_NAME% 生产服务器...

rem 检查是否已经运行
call :get_pid
if defined pid (
    echo [WARNING] %APP_NAME% 已经在运行中 ^(PID: !pid!^)
    goto end
)

call :check_node
call :check_dependencies

rem 检查构建文件
if not exist "%APP_DIR%\dist" (
    echo [WARNING] 构建文件不存在，正在构建...
    call :build
)

rem 创建日志目录
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

rem 启动预览服务器
cd "%APP_DIR%"
start "React-UI-Prod" cmd /c "npm run preview > ..\%LOG_FILE% 2>&1"
cd ..

timeout /t 3 > nul

echo [SUCCESS] %APP_NAME% 生产服务器启动成功
echo [INFO] 访问地址: http://localhost:4173
echo [INFO] 日志文件: %LOG_FILE%
goto end

:stop
echo [INFO] 正在停止 %APP_NAME%...

call :get_pid
if not defined pid (
    echo [WARNING] %APP_NAME% 未运行
    if exist %PID_FILE% del /f /q %PID_FILE%
    goto end
)

rem 停止进程
taskkill /pid !pid! /t /f > nul 2>&1

rem 额外确保所有相关的 node 进程都被停止
taskkill /fi "WindowTitle eq React-UI-Dev*" /f > nul 2>&1
taskkill /fi "WindowTitle eq React-UI-Prod*" /f > nul 2>&1

echo [SUCCESS] %APP_NAME% 已停止
if exist %PID_FILE% del /f /q %PID_FILE%
goto end

:restart
echo [INFO] 正在重启 %APP_NAME%...
call :stop
timeout /t 2 > nul
call :start_dev
goto end

:status
call :get_pid
if defined pid (
    echo [SUCCESS] %APP_NAME% 正在运行 ^(PID: !pid!^)

    rem 显示进程信息
    echo [INFO] 进程信息:
    tasklist /fi "PID eq !pid!" /fo table
) else (
    echo [WARNING] %APP_NAME% 未运行
)
goto end

:build
echo [INFO] 正在构建 %APP_NAME%...

call :check_node
call :check_dependencies

cd "%APP_DIR%"
call npm run build

if %errorlevel% equ 0 (
    echo [SUCCESS] 构建完成，输出目录: %APP_DIR%\dist
) else (
    echo [ERROR] 构建失败
)
cd ..
goto end

:get_pid
set pid=
if exist %PID_FILE% (
    set /p pid=<%PID_FILE%
    tasklist /fi "PID eq !pid!" 2>nul | find "!pid!" >nul
    if %errorlevel% neq 0 (
        del /f /q %PID_FILE%
        set pid=
    )
)
goto :eof

:usage
echo 用法: %~nx0 {start^|stop^|restart^|status^|dev^|build^|start:prod}
echo.
echo 命令说明:
echo   start      - 启动开发服务器 ^(等同于 dev^)
echo   start:prod - 启动生产预览服务器
echo   stop       - 停止前端服务
echo   restart    - 重启前端服务
echo   status     - 查看服务状态
echo   dev        - 启动开发服务器
echo   build      - 构建生产版本
goto end

:end
if "%1"=="" pause
endlocal
