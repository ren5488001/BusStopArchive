@echo off
chcp 65001 > nul
rem 后端服务管理脚本
rem 用法: backend.bat {start|stop|restart|status}

setlocal enabledelayedexpansion

rem 应用名称
set APP_NAME=ruoyi-admin
set JAR_NAME=ruoyi-admin.jar
set JAR_PATH=ruoyi-admin\target\%JAR_NAME%
set PID_FILE=.%APP_NAME%.pid

rem JVM参数 (适配 JDK 9+)
set JVM_OPTS=-Dname=%JAR_NAME% -Duser.timezone=Asia/Shanghai -Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Xlog:gc*:file=logs/gc.log:time,uptime:filecount=10,filesize=100m -XX:NewRatio=1 -XX:SurvivorRatio=30 -XX:+UseParallelGC

rem 日志目录
set LOG_DIR=logs
set LOG_FILE=%LOG_DIR%\%APP_NAME%.log

rem 如果没有参数，显示菜单
if "%1"=="" goto menu

rem 如果有参数，直接执行命令
if /i "%1"=="start" goto start
if /i "%1"=="stop" goto stop
if /i "%1"=="restart" goto restart
if /i "%1"=="status" goto status
if /i "%1"=="build" goto build
if /i "%1"=="install" goto install
if /i "%1"=="rebuild" goto rebuild
if /i "%1"=="clean" goto clean
goto usage

:menu
echo.
echo ========================================
echo    后端服务管理
echo ========================================
echo  [1] 启动服务
echo  [2] 停止服务
echo  [3] 重启服务
echo  [4] 查看状态
echo  [5] 编译打包
echo  [6] 安装到本地仓库
echo  [7] 重新编译并重启
echo  [8] 清理编译产物
echo  [9] 退出
echo ========================================
echo.
set /p choice=请输入选项 (1-9):

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto build
if "%choice%"=="6" goto install
if "%choice%"=="7" goto rebuild
if "%choice%"=="8" goto clean
if "%choice%"=="9" exit /b 0
goto menu

:start
echo [INFO] 正在启动 %APP_NAME%...

rem 检查是否已经运行
for /f "usebackq tokens=1" %%a in (`jps -l ^| findstr %JAR_NAME%`) do (
    set pid=%%a
)
if defined pid (
    echo [WARNING] %APP_NAME% 已经在运行中 ^(PID: !pid!^)
    goto end
)

rem 检查JAR文件是否存在
if not exist "%JAR_PATH%" (
    echo [ERROR] JAR文件不存在: %JAR_PATH%
    echo [INFO] 请先执行: mvn clean install
    goto end
)

rem 创建日志目录
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

rem 启动应用
start "RuoYi-Admin" /B javaw %JVM_OPTS% -jar "%JAR_PATH%" > "%LOG_FILE%" 2>&1

timeout /t 2 > nul

rem 获取新进程的PID
for /f "usebackq tokens=1" %%a in (`jps -l ^| findstr %JAR_NAME%`) do (
    set pid=%%a
)

if defined pid (
    echo [SUCCESS] %APP_NAME% 启动成功 ^(PID: !pid!^)
    echo !pid! > %PID_FILE%
    echo [INFO] 日志文件: %LOG_FILE%
) else (
    echo [ERROR] %APP_NAME% 启动失败，请查看日志: %LOG_FILE%
)
goto end

:stop
echo [INFO] 正在停止 %APP_NAME%...

rem 查找进程
for /f "usebackq tokens=1" %%a in (`jps -l ^| findstr %JAR_NAME%`) do (
    set pid=%%a
)

if not defined pid (
    echo [WARNING] %APP_NAME% 未运行
    if exist %PID_FILE% del /f /q %PID_FILE%
    goto end
)

rem 停止进程
echo [INFO] 正在停止进程 ^(PID: !pid!^)...
taskkill /pid !pid! /f > nul 2>&1

if %errorlevel%==0 (
    echo [SUCCESS] %APP_NAME% 已停止
    if exist %PID_FILE% del /f /q %PID_FILE%
) else (
    echo [ERROR] 停止失败，请手动停止进程
)
goto end

:restart
echo [INFO] 正在重启 %APP_NAME%...
call :stop
timeout /t 2 > nul
call :start
goto end

:status
rem 查找进程
set pid=
for /f "usebackq tokens=1" %%a in (`jps -l ^| findstr %JAR_NAME%`) do (
    set pid=%%a
)

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
echo [INFO] 正在编译打包后端项目...

rem 检查 Maven 是否安装
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven 未安装或不在 PATH 中
    echo [INFO] 请先安装 Maven: https://maven.apache.org/download.cgi
    goto end
)

rem 显示 Maven 版本
echo [INFO] Maven 版本:
call mvn -version | findstr "Apache Maven"

rem 执行编译
echo [INFO] 执行: mvn clean package -DskipTests
call mvn clean package -DskipTests

if %errorlevel%==0 (
    echo [SUCCESS] 编译打包成功!

    rem 显示 JAR 文件信息
    if exist "%JAR_PATH%" (
        for %%F in ("%JAR_PATH%") do (
            echo [INFO] JAR 文件: %JAR_PATH% ^(%%~zF 字节^)
        )
    )
) else (
    echo [ERROR] 编译打包失败!
)
goto end

:install
echo [INFO] 正在编译并安装到本地 Maven 仓库...

rem 检查 Maven 是否安装
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven 未安装或不在 PATH 中
    echo [INFO] 请先安装 Maven: https://maven.apache.org/download.cgi
    goto end
)

rem 执行编译安装
echo [INFO] 执行: mvn clean install -DskipTests
call mvn clean install -DskipTests

if %errorlevel%==0 (
    echo [SUCCESS] 编译安装成功!

    rem 显示 JAR 文件信息
    if exist "%JAR_PATH%" (
        for %%F in ("%JAR_PATH%") do (
            echo [INFO] JAR 文件: %JAR_PATH% ^(%%~zF 字节^)
        )
    )
) else (
    echo [ERROR] 编译安装失败!
)
goto end

:rebuild
echo [INFO] 正在重新编译并重启 %APP_NAME%...

rem 先停止服务
for /f "usebackq tokens=1" %%a in (`jps -l ^| findstr %JAR_NAME%`) do (
    set pid=%%a
)
if defined pid (
    call :stop
    timeout /t 2 > nul
)

rem 编译打包
call :build

if %errorlevel%==0 (
    rem 启动服务
    timeout /t 1 > nul
    call :start
) else (
    echo [ERROR] 编译失败，服务未启动
)
goto end

:clean
echo [INFO] 正在清理编译产物...

rem 检查 Maven 是否安装
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven 未安装或不在 PATH 中
    goto end
)

rem 执行清理
echo [INFO] 执行: mvn clean
call mvn clean

if %errorlevel%==0 (
    echo [SUCCESS] 清理完成!
) else (
    echo [ERROR] 清理失败!
)
goto end

:usage
echo 用法: %~nx0 {start^|stop^|restart^|status^|build^|install^|rebuild^|clean}
echo.
echo 命令说明:
echo   start   - 启动后端服务
echo   stop    - 停止后端服务
echo   restart - 重启后端服务
echo   status  - 查看服务状态
echo   build   - 编译打包项目 ^(mvn clean package^)
echo   install - 编译并安装到本地仓库 ^(mvn clean install^)
echo   rebuild - 重新编译并重启服务
echo   clean   - 清理编译产物 ^(mvn clean^)
goto end

:end
if "%1"=="" pause
endlocal
