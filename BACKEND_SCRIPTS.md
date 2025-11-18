# 后端服务管理脚本使用说明

## 概述

`backend.sh` (Linux/Mac) 和 `backend.bat` (Windows) 是用于管理若依后端服务的便捷脚本，集成了编译、打包、启动、停止等常用功能。

## 功能特性

- ✅ 服务启动/停止/重启
- ✅ 服务状态查看
- ✅ 实时日志查看
- ✅ 编译打包（跳过测试）
- ✅ 安装到本地 Maven 仓库
- ✅ 一键重新编译并重启
- ✅ 清理编译产物
- ✅ 进程管理（PID 追踪）
- ✅ 彩色输出（Linux/Mac）
- ✅ 交互式菜单（Windows）

## 使用方法

### Linux/Mac

```bash
# 赋予执行权限（首次使用）
chmod +x backend.sh

# 使用命令
./backend.sh {command}
```

### Windows

```cmd
# 方式1: 命令行方式
backend.bat {command}

# 方式2: 交互式菜单（双击运行 backend.bat）
双击 backend.bat 文件，会显示菜单供选择
```

## 命令列表

### 服务管理

| 命令 | 说明 | 示例 |
|------|------|------|
| `start` | 启动后端服务 | `./backend.sh start` |
| `stop` | 停止后端服务 | `./backend.sh stop` |
| `restart` | 重启后端服务 | `./backend.sh restart` |
| `status` | 查看服务状态 | `./backend.sh status` |
| `logs` | 查看实时日志 | `./backend.sh logs` |

### 编译管理

| 命令 | 说明 | Maven 等效命令 |
|------|------|----------------|
| `build` | 编译打包项目 | `mvn clean package -DskipTests` |
| `install` | 编译并安装到本地仓库 | `mvn clean install -DskipTests` |
| `rebuild` | 重新编译并重启服务 | 先 `stop`，再 `build`，最后 `start` |
| `clean` | 清理编译产物 | `mvn clean` |

## 使用示例

### 首次部署

```bash
# 1. 编译打包
./backend.sh build

# 2. 启动服务
./backend.sh start

# 3. 查看状态
./backend.sh status
```

### 代码更新后重新部署

```bash
# 方式1: 分步执行
./backend.sh stop
./backend.sh build
./backend.sh start

# 方式2: 一键重启（推荐）
./backend.sh rebuild
```

### 日常运维

```bash
# 查看服务状态
./backend.sh status

# 查看实时日志
./backend.sh logs

# 重启服务
./backend.sh restart
```

### 开发调试

```bash
# 清理并重新编译
./backend.sh clean
./backend.sh build

# 安装到本地仓库（多模块项目需要）
./backend.sh install
```

## 配置说明

### 应用配置

脚本中的关键配置参数（位于脚本开头）：

```bash
# 应用名称
APP_NAME="ruoyi-admin"

# JAR 文件名
JAR_NAME="ruoyi-admin.jar"

# JAR 文件路径
JAR_PATH="ruoyi-admin/target/${JAR_NAME}"

# PID 文件
PID_FILE=".${APP_NAME}.pid"
```

### JVM 参数

默认 JVM 参数（适配 JDK 9+）：

```bash
-Dname=ruoyi-admin.jar
-Duser.timezone=Asia/Shanghai
-Xms512m                    # 初始堆内存
-Xmx1024m                   # 最大堆内存
-XX:MetaspaceSize=128m      # 元空间初始大小
-XX:MaxMetaspaceSize=512m   # 元空间最大大小
-XX:+HeapDumpOnOutOfMemoryError  # OOM 时生成堆转储
-Xlog:gc*:file=logs/gc.log:time,uptime:filecount=10,filesize=100m  # GC 日志
-XX:NewRatio=1              # 新生代与老年代比例
-XX:SurvivorRatio=30        # Eden 与 Survivor 比例
-XX:+UseParallelGC          # 并行垃圾回收器
```

如需修改，请编辑脚本中的 `JVM_OPTS` 变量。

### 日志配置

- **日志目录**: `logs/`
- **应用日志**: `logs/ruoyi-admin.log`
- **GC 日志**: `logs/gc.log`

## 常见问题

### 1. Maven 未找到

**错误提示**:
```
[ERROR] Maven 未安装或不在 PATH 中
```

**解决方法**:
- 确保已安装 Maven
- 将 Maven bin 目录添加到系统 PATH
- 验证: `mvn -version`

### 2. JAR 文件不存在

**错误提示**:
```
[ERROR] JAR文件不存在: ruoyi-admin/target/ruoyi-admin.jar
```

**解决方法**:
```bash
# 先执行编译
./backend.sh build

# 然后启动
./backend.sh start
```

### 3. 端口已被占用

**问题**: 启动失败，端口 8080 已被占用

**解决方法**:
```bash
# Linux/Mac: 查找占用端口的进程
lsof -i:8080

# Windows: 查找占用端口的进程
netstat -ano | findstr :8080

# 停止占用的进程或修改配置文件中的端口
```

### 4. 服务无法停止

**问题**: `./backend.sh stop` 无法停止服务

**解决方法**:
```bash
# Linux/Mac: 查找进程并强制停止
ps aux | grep ruoyi-admin
kill -9 <PID>

# Windows: 强制停止
taskkill /F /IM java.exe
```

## 进阶用法

### 自定义 JVM 参数

编辑脚本，修改 `JVM_OPTS` 变量：

```bash
# backend.sh (示例)
JVM_OPTS="-Dname=${JAR_NAME} \
  -Duser.timezone=Asia/Shanghai \
  -Xms1024m \              # 修改初始堆内存
  -Xmx2048m \              # 修改最大堆内存
  -XX:MetaspaceSize=256m \ # 修改元空间大小
  ..."
```

### 集成到 CI/CD

```bash
# Jenkins/GitLab CI 示例
script:
  - ./backend.sh clean
  - ./backend.sh build
  - ./backend.sh stop
  - ./backend.sh start
  - ./backend.sh status
```

### 开机自启动

#### Linux (systemd)

创建服务文件 `/etc/systemd/system/ruoyi-admin.service`:

```ini
[Unit]
Description=RuoYi Admin Service
After=network.target

[Service]
Type=forking
User=your-user
WorkingDirectory=/path/to/ruoyi-react
ExecStart=/path/to/ruoyi-react/backend.sh start
ExecStop=/path/to/ruoyi-react/backend.sh stop
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启用服务:
```bash
sudo systemctl enable ruoyi-admin
sudo systemctl start ruoyi-admin
```

#### Windows (任务计划程序)

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器: 计算机启动时
4. 操作: 启动程序
5. 程序: `cmd.exe`
6. 参数: `/c "cd /d C:\path\to\ruoyi-react && backend.bat start"`

## 脚本对比

### 与旧版脚本对比

| 功能 | ry.sh/ry.bat | backend.sh/backend.bat |
|------|--------------|------------------------|
| 启动服务 | ✅ | ✅ |
| 停止服务 | ❌ | ✅ |
| 重启服务 | ❌ | ✅ |
| 状态查看 | ❌ | ✅ |
| 日志查看 | ❌ | ✅ |
| 编译打包 | ❌ | ✅ |
| 一键重编译重启 | ❌ | ✅ |
| PID 管理 | ❌ | ✅ |
| 彩色输出 | ❌ | ✅ (Linux/Mac) |
| 交互式菜单 | ❌ | ✅ (Windows) |

**建议**: 使用新版 `backend.sh`/`backend.bat` 脚本，功能更完善。

## 技术实现

### Linux/Mac (backend.sh)

- **Shell**: Bash
- **进程管理**: PID 文件 + `ps` 命令
- **优雅停止**: `kill -TERM` (SIGTERM)
- **强制停止**: `kill -9` (SIGKILL) 作为后备
- **日志**: `nohup` 重定向到文件

### Windows (backend.bat)

- **Shell**: Batch
- **进程管理**: `jps` 命令（需要 JDK）
- **强制停止**: `taskkill /F`
- **日志**: 重定向到文件

## 维护和支持

### 更新记录

- **v2.0** (2024-11): 添加编译打包功能
- **v1.0** (2024-10): 初始版本，基础服务管理

### 问题反馈

如遇到问题，请提供以下信息：

1. 操作系统版本
2. JDK 版本 (`java -version`)
3. Maven 版本 (`mvn -version`)
4. 完整错误日志
5. 执行的命令

## 许可证

本脚本遵循项目主许可证。
