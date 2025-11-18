#!/bin/bash
# 后端服务管理脚本
# 用法: ./backend.sh {start|stop|restart|status}

# 应用名称
APP_NAME="ruoyi-admin"
JAR_NAME="ruoyi-admin.jar"
JAR_PATH="ruoyi-admin/target/${JAR_NAME}"
PID_FILE=".${APP_NAME}.pid"

# JVM参数 (适配 JDK 9+)
JVM_OPTS="-Dname=${JAR_NAME} \
  -Duser.timezone=Asia/Shanghai \
  -Xms512m \
  -Xmx1024m \
  -XX:MetaspaceSize=128m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+HeapDumpOnOutOfMemoryError \
  -Xlog:gc*:file=logs/gc.log:time,uptime:filecount=10,filesize=100m \
  -XX:NewRatio=1 \
  -XX:SurvivorRatio=30 \
  -XX:+UseParallelGC"

# 日志目录
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/${APP_NAME}.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查JAR文件是否存在
check_jar() {
    if [ ! -f "${JAR_PATH}" ]; then
        print_error "JAR文件不存在: ${JAR_PATH}"
        print_info "请先执行: mvn clean install"
        exit 1
    fi
}

# 获取进程PID
get_pid() {
    if [ -f "${PID_FILE}" ]; then
        PID=$(cat "${PID_FILE}")
        if ps -p ${PID} > /dev/null 2>&1; then
            echo ${PID}
        else
            rm -f "${PID_FILE}"
            echo ""
        fi
    else
        echo ""
    fi
}

# 启动服务
start() {
    print_info "正在启动 ${APP_NAME}..."

    PID=$(get_pid)
    if [ -n "${PID}" ]; then
        print_warning "${APP_NAME} 已经在运行中 (PID: ${PID})"
        return
    fi

    check_jar

    # 创建日志目录
    mkdir -p "${LOG_DIR}"

    # 启动应用
    nohup java ${JVM_OPTS} -jar "${JAR_PATH}" > "${LOG_FILE}" 2>&1 &
    PID=$!
    echo ${PID} > "${PID_FILE}"

    # 等待启动
    sleep 2
    if ps -p ${PID} > /dev/null 2>&1; then
        print_success "${APP_NAME} 启动成功 (PID: ${PID})"
        print_info "日志文件: ${LOG_FILE}"
        print_info "查看日志: tail -f ${LOG_FILE}"
    else
        print_error "${APP_NAME} 启动失败，请查看日志: ${LOG_FILE}"
        rm -f "${PID_FILE}"
        exit 1
    fi
}

# 停止服务
stop() {
    print_info "正在停止 ${APP_NAME}..."

    PID=$(get_pid)
    if [ -z "${PID}" ]; then
        print_warning "${APP_NAME} 未运行"
        return
    fi

    # 优雅停止
    kill -TERM ${PID}
    print_info "等待进程停止 (PID: ${PID})..."

    # 等待进程结束，最多30秒
    for i in {1..30}; do
        if ! ps -p ${PID} > /dev/null 2>&1; then
            rm -f "${PID_FILE}"
            print_success "${APP_NAME} 已停止"
            return
        fi
        sleep 1
    done

    # 如果30秒后还未停止，强制停止
    print_warning "进程未响应，强制停止..."
    kill -9 ${PID}
    rm -f "${PID_FILE}"
    print_success "${APP_NAME} 已强制停止"
}

# 重启服务
restart() {
    print_info "正在重启 ${APP_NAME}..."
    stop
    sleep 2
    start
}

# 查看状态
status() {
    PID=$(get_pid)
    if [ -z "${PID}" ]; then
        print_warning "${APP_NAME} 未运行"
        return 1
    else
        print_success "${APP_NAME} 正在运行 (PID: ${PID})"

        # 显示内存和CPU使用情况
        if command -v ps > /dev/null 2>&1; then
            print_info "资源使用情况:"
            ps -p ${PID} -o %cpu,%mem,vsz,rss,etime,cmd | tail -1
        fi
        return 0
    fi
}

# 查看日志
logs() {
    if [ -f "${LOG_FILE}" ]; then
        tail -f "${LOG_FILE}"
    else
        print_error "日志文件不存在: ${LOG_FILE}"
        exit 1
    fi
}

# 编译打包
build() {
    print_info "正在编译打包后端项目..."

    # 检查 Maven 是否安装
    if ! command -v mvn > /dev/null 2>&1; then
        print_error "Maven 未安装或不在 PATH 中"
        print_info "请先安装 Maven: https://maven.apache.org/download.cgi"
        exit 1
    fi

    # 显示 Maven 版本
    print_info "Maven 版本:"
    mvn -version | head -1

    # 执行编译
    print_info "执行: mvn clean package -DskipTests"
    mvn clean package -DskipTests

    if [ $? -eq 0 ]; then
        print_success "编译打包成功!"

        # 显示 JAR 文件信息
        if [ -f "${JAR_PATH}" ]; then
            JAR_SIZE=$(ls -lh "${JAR_PATH}" | awk '{print $5}')
            print_info "JAR 文件: ${JAR_PATH} (${JAR_SIZE})"
        fi
    else
        print_error "编译打包失败!"
        exit 1
    fi
}

# 安装到本地仓库
install() {
    print_info "正在编译并安装到本地 Maven 仓库..."

    # 检查 Maven 是否安装
    if ! command -v mvn > /dev/null 2>&1; then
        print_error "Maven 未安装或不在 PATH 中"
        print_info "请先安装 Maven: https://maven.apache.org/download.cgi"
        exit 1
    fi

    # 执行编译安装
    print_info "执行: mvn clean install -DskipTests"
    mvn clean install -DskipTests

    if [ $? -eq 0 ]; then
        print_success "编译安装成功!"

        # 显示 JAR 文件信息
        if [ -f "${JAR_PATH}" ]; then
            JAR_SIZE=$(ls -lh "${JAR_PATH}" | awk '{print $5}')
            print_info "JAR 文件: ${JAR_PATH} (${JAR_SIZE})"
        fi
    else
        print_error "编译安装失败!"
        exit 1
    fi
}

# 重新编译并重启
rebuild() {
    print_info "正在重新编译并重启 ${APP_NAME}..."

    # 先停止服务
    PID=$(get_pid)
    if [ -n "${PID}" ]; then
        stop
        sleep 2
    fi

    # 编译打包
    build

    if [ $? -eq 0 ]; then
        # 启动服务
        sleep 1
        start
    else
        print_error "编译失败，服务未启动"
        exit 1
    fi
}

# 清理编译产物
clean() {
    print_info "正在清理编译产物..."

    # 检查 Maven 是否安装
    if ! command -v mvn > /dev/null 2>&1; then
        print_error "Maven 未安装或不在 PATH 中"
        exit 1
    fi

    # 执行清理
    print_info "执行: mvn clean"
    mvn clean

    if [ $? -eq 0 ]; then
        print_success "清理完成!"
    else
        print_error "清理失败!"
        exit 1
    fi
}

# 主函数
main() {
    case "$1" in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        status)
            status
            ;;
        logs)
            logs
            ;;
        build)
            build
            ;;
        install)
            install
            ;;
        rebuild)
            rebuild
            ;;
        clean)
            clean
            ;;
        *)
            echo "用法: $0 {start|stop|restart|status|logs|build|install|rebuild|clean}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动后端服务"
            echo "  stop    - 停止后端服务"
            echo "  restart - 重启后端服务"
            echo "  status  - 查看服务状态"
            echo "  logs    - 查看实时日志"
            echo "  build   - 编译打包项目 (mvn clean package)"
            echo "  install - 编译并安装到本地仓库 (mvn clean install)"
            echo "  rebuild - 重新编译并重启服务"
            echo "  clean   - 清理编译产物 (mvn clean)"
            exit 1
            ;;
    esac
}

main "$@"
