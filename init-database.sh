#!/bin/bash

# 数据库初始化脚本
# 用于重新初始化整个项目数据库

echo "=========================================="
echo "若依项目数据库初始化脚本"
echo "=========================================="

# 数据库配置
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="root"
DB_NAME="ry-vue"

# 检查 MySQL 是否可用
echo "检查 MySQL 连接..."
if ! command -v mysql &> /dev/null; then
    echo "错误: 未找到 mysql 命令，请确保 MySQL 已安装并添加到 PATH"
    exit 1
fi

# 测试数据库连接
echo "测试数据库连接..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "SELECT 1" &> /dev/null
    if [ $? -ne 0 ]; then
        echo "使用空密码连接失败，尝试交互式输入密码..."
        read -sp "请输入 MySQL root 密码 (直接回车使用空密码): " DB_PASSWORD
        echo ""
    fi
fi

# 再次测试连接
if [ -z "$DB_PASSWORD" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "SELECT 1" &> /dev/null
else
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null
fi

if [ $? -ne 0 ]; then
    echo "错误: 无法连接到 MySQL 数据库"
    echo "请检查:"
    echo "  1. MySQL 服务是否已启动"
    echo "  2. 数据库配置是否正确 (host: $DB_HOST, port: $DB_PORT, user: $DB_USER)"
    echo "  3. 密码是否正确"
    exit 1
fi

echo "✓ MySQL 连接成功"

# 删除并重新创建数据库
echo ""
echo "删除旧数据库 (如果存在)..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`;"
else
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`;"
fi

echo "创建新数据库..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -e "CREATE DATABASE \`$DB_NAME\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
else
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE \`$DB_NAME\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
fi

if [ $? -ne 0 ]; then
    echo "错误: 创建数据库失败"
    exit 1
fi

echo "✓ 数据库创建成功"

# 导入主数据库脚本
echo ""
echo "导入主数据库脚本 (ry_react.sql)..."
if [ -z "$DB_PASSWORD" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" < sql/ry_react.sql
else
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < sql/ry_react.sql
fi

if [ $? -ne 0 ]; then
    echo "错误: 导入主数据库脚本失败"
    exit 1
fi

echo "✓ 主数据库脚本导入成功"

# 导入 Quartz 脚本（如果存在）
if [ -f "sql/quartz.sql" ]; then
    echo ""
    echo "导入 Quartz 脚本 (quartz.sql)..."
    if [ -z "$DB_PASSWORD" ]; then
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" < sql/quartz.sql
    else
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < sql/quartz.sql
    fi
    
    if [ $? -ne 0 ]; then
        echo "警告: 导入 Quartz 脚本失败（可能已存在相关表）"
    else
        echo "✓ Quartz 脚本导入成功"
    fi
fi

echo ""
echo "=========================================="
echo "数据库初始化完成！"
echo "=========================================="
echo "数据库名称: $DB_NAME"
echo "默认管理员账号: admin"
echo "默认管理员密码: admin123"
echo "=========================================="
