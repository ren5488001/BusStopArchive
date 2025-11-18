#!/bin/bash
# 前端服务管理脚本
# 用法: ./frontend.sh {start|stop|restart|status|dev|build}

# 应用名称
APP_NAME="react-ui"
APP_DIR="react-ui"
PID_FILE=".${APP_NAME}.pid"
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

# 检查Node环境
check_node() {
    if ! command -v node > /dev/null 2>&1; then
        print_error "Node.js 未安装，请先安装 Node.js v16 或以上版本"
        exit 1
    fi

    if ! command -v npm > /dev/null 2>&1; then
        print_error "npm 未安装"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ ${NODE_VERSION} -lt 16 ]; then
        print_error "Node.js 版本过低，当前版本: $(node -v)，需要 v16 或以上"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    if [ ! -d "${APP_DIR}/node_modules" ]; then
        print_warning "依赖未安装，正在安装..."
        cd "${APP_DIR}"
        npm install
        if [ $? -ne 0 ]; then
            print_error "依赖安装失败"
            exit 1
        fi
        cd ..
        print_success "依赖安装完成"
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

# 启动开发服务器
start_dev() {
    print_info "正在启动 ${APP_NAME} 开发服务器..."

    PID=$(get_pid)
    if [ -n "${PID}" ]; then
        print_warning "${APP_NAME} 已经在运行中 (PID: ${PID})"
        return
    fi

    check_node
    check_dependencies

    # 创建日志目录
    mkdir -p "${LOG_DIR}"

    # 启动开发服务器
    cd "${APP_DIR}"
    npm run dev > "../${LOG_FILE}" 2>&1 &
    PID=$!
    cd ..

    echo ${PID} > "${PID_FILE}"

    # 等待启动
    sleep 3
    if ps -p ${PID} > /dev/null 2>&1; then
        print_success "${APP_NAME} 开发服务器启动成功 (PID: ${PID})"
        print_info "访问地址: http://localhost:8000"
        print_info "日志文件: ${LOG_FILE}"
        print_info "查看日志: tail -f ${LOG_FILE}"
    else
        print_error "${APP_NAME} 启动失败，请查看日志: ${LOG_FILE}"
        rm -f "${PID_FILE}"
        exit 1
    fi
}

# 启动生产服务器
start_prod() {
    print_info "正在启动 ${APP_NAME} 生产服务器..."

    PID=$(get_pid)
    if [ -n "${PID}" ]; then
        print_warning "${APP_NAME} 已经在运行中 (PID: ${PID})"
        return
    fi

    check_node
    check_dependencies

    # 检查构建文件
    if [ ! -d "${APP_DIR}/dist" ]; then
        print_warning "构建文件不存在，正在构建..."
        build
    fi

    # 创建日志目录
    mkdir -p "${LOG_DIR}"

    # 启动预览服务器
    cd "${APP_DIR}"
    npm run preview > "../${LOG_FILE}" 2>&1 &
    PID=$!
    cd ..

    echo ${PID} > "${PID_FILE}"

    # 等待启动
    sleep 3
    if ps -p ${PID} > /dev/null 2>&1; then
        print_success "${APP_NAME} 生产服务器启动成功 (PID: ${PID})"
        print_info "访问地址: http://localhost:4173"
        print_info "日志文件: ${LOG_FILE}"
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

    # 停止进程及其子进程
    pkill -TERM -P ${PID}
    kill -TERM ${PID}

    print_info "等待进程停止 (PID: ${PID})..."

    # 等待进程结束，最多15秒
    for i in {1..15}; do
        if ! ps -p ${PID} > /dev/null 2>&1; then
            rm -f "${PID_FILE}"
            print_success "${APP_NAME} 已停止"
            return
        fi
        sleep 1
    done

    # 如果15秒后还未停止，强制停止
    print_warning "进程未响应，强制停止..."
    pkill -9 -P ${PID}
    kill -9 ${PID}
    rm -f "${PID_FILE}"
    print_success "${APP_NAME} 已强制停止"
}

# 重启服务
restart() {
    print_info "正在重启 ${APP_NAME}..."
    stop
    sleep 2
    start_dev
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

# 构建项目
build() {
    print_info "正在构建 ${APP_NAME}..."

    check_node
    check_dependencies

    cd "${APP_DIR}"
    npm run build

    if [ $? -eq 0 ]; then
        print_success "构建完成，输出目录: ${APP_DIR}/dist"
    else
        print_error "构建失败"
        exit 1
    fi
    cd ..
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

# 主函数
main() {
    case "$1" in
        start)
            start_dev
            ;;
        start:prod)
            start_prod
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
        dev)
            start_dev
            ;;
        build)
            build
            ;;
        logs)
            logs
            ;;
        *)
            echo "用法: $0 {start|stop|restart|status|dev|build|start:prod|logs}"
            echo ""
            echo "命令说明:"
            echo "  start      - 启动开发服务器 (等同于 dev)"
            echo "  start:prod - 启动生产预览服务器"
            echo "  stop       - 停止前端服务"
            echo "  restart    - 重启前端服务"
            echo "  status     - 查看服务状态"
            echo "  dev        - 启动开发服务器"
            echo "  build      - 构建生产版本"
            echo "  logs       - 查看实时日志"
            exit 1
            ;;
    esac
}

main "$@"
