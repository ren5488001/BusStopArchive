# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于若依(Ruoyi)框架的前后端分离项目，采用 React 18 + Ant Design Pro 6 + TypeScript 5 作为前端技术栈，Spring Boot 3 + JDK 17 作为后端技术栈。

## 开发环境要求

- **前端**: Node.js v16 或以上
- **后端**: JDK 17
- **数据库**: MySQL（数据库名称：`ry-vue`）
- **缓存**: Redis（默认端口 6379）
- **构建工具**: Maven

## 常用命令

### 前端开发 (react-ui/)

```bash
# 安装依赖
npm install

# 开发模式启动（连接后端 API）
npm run dev
# 或
npm run start:dev

# Mock 测试模式（不连接后端）
npm start

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查和格式化
npm run lint
npm run lint:fix
npm run prettier

# TypeScript 类型检查
npm run tsc

# 运行测试
npm test
npm run test:coverage
```

### 后端开发

```bash
# 编译整个项目
mvn clean install

# 运行后端服务（在 ruoyi-admin 目录）
cd ruoyi-admin
mvn spring-boot:run

# 或直接运行 JAR 包
cd ruoyi-admin/target
java -jar ruoyi-admin.jar

# 快速启动脚本
./ry.sh     # Linux/Mac
ry.bat      # Windows
```

### 数据库初始化

```bash
# 使用初始化脚本（会提示输入 MySQL 密码）
./init-database.sh

# 或手动导入 SQL 文件
mysql -u root -p ry-vue < sql/ry_react.sql
mysql -u root -p ry-vue < sql/quartz.sql
```

## 项目结构

### 前端架构 (react-ui/)

```
react-ui/
├── config/               # UMI 配置
│   ├── config.ts        # 主配置文件
│   ├── routes.ts        # 路由配置（重要：所有页面路由在此定义）
│   ├── proxy.ts         # 开发代理配置
│   └── defaultSettings.ts
├── src/
│   ├── pages/           # 页面组件
│   │   ├── Home/        # 首页
│   │   ├── System/      # 系统管理（用户、角色、菜单等）
│   │   ├── Monitor/     # 系统监控
│   │   ├── Tool/        # 系统工具（代码生成器等）
│   │   ├── Project/     # 项目管理
│   │   └── User/        # 用户相关（登录、个人中心）
│   ├── services/        # API 服务层
│   │   ├── session.ts   # 会话管理（用户信息、菜单、路由）
│   │   ├── system/      # 系统管理 API
│   │   └── monitor/     # 监控相关 API
│   ├── components/      # 公共组件
│   ├── utils/           # 工具函数
│   ├── locales/         # 国际化文件
│   ├── access.ts        # 权限控制（Token 管理）
│   ├── app.tsx          # 应用入口（初始化、布局配置）
│   └── global.tsx       # 全局初始化
```

### 后端架构

```
ruoyi-admin/       # 主应用模块（启动入口）
ruoyi-framework/   # 框架核心（Security、Redis、Token）
ruoyi-system/      # 系统模块（用户、角色、菜单等业务）
ruoyi-common/      # 公共工具类
ruoyi-quartz/      # 定时任务模块
ruoyi-generator/   # 代码生成器
```

## 核心技术特性

### 前端

- **框架**: React 18 + TypeScript 5
- **UI 库**: Ant Design 5 + Ant Design Pro Components 2
- **路由**: UMI 4（文件路由 + 配置路由混合模式）
- **状态管理**: UMI Model（基于 hooks）
- **网络请求**: UMI Request（基于 axios）
- **权限**: 基于 JWT Token + RBAC 权限模型
- **国际化**: UMI Locale（默认中文）
- **构建**: UMI Max（内置 webpack/esbuild）

### 后端

- **框架**: Spring Boot 3.3.0
- **安全**: Spring Security + JWT
- **ORM**: MyBatis + PageHelper（分页）
- **数据库连接池**: Druid
- **缓存**: Redis (lettuce)
- **定时任务**: Quartz
- **API 文档**: SpringDoc (Swagger 3.0)

## 路由系统说明

### 动态路由加载机制

前端路由采用 **静态配置 + 动态菜单** 混合模式：

1. `config/routes.ts` 定义基础路由框架和隐藏路由
2. 用户登录后，从后端 `/getRouters` 接口获取动态菜单数据
3. `src/services/session.ts` 中的 `patchRouteWithRemoteMenus()` 将动态菜单合并到路由中
4. 菜单权限由后端根据用户角色动态返回

### 新增页面流程

1. 在 `src/pages/` 创建页面组件
2. 在 `config/routes.ts` 添加路由配置（如需在配置中定义）
3. 或在后端数据库的菜单表中配置（动态菜单）
4. 添加对应的国际化文本到 `src/locales/`

## API 代理配置

开发环境下，前端通过代理访问后端 API：

- **配置文件**: `config/proxy.ts`
- **默认后端地址**: `http://localhost:8080`
- **环境变量**: 通过 `REACT_APP_ENV` 切换（dev/test/pre）

## 认证与鉴权

### Token 管理

- **存储位置**: `sessionStorage`
- **Token 类型**: Access Token + Refresh Token
- **管理文件**: `src/access.ts`
- **请求头**: `Authorization: Bearer {token}`

### 权限控制

- **按钮级权限**: 使用 `access` 对象检查权限标识
- **路由级权限**: 基于后端返回的菜单数据动态生成
- **数据权限**: 后端基于角色的数据范围控制

## 开发注意事项

### 通用规范

- **沟通语言**: 始终使用中文
- **提交信息**: 每次代码修改必须在 commit 信息中说明具体修改内容，禁止使用默认提交信息
- **实时预览**: 页面修改后会自动热更新，可在浏览器直接查看效果

### 端口配置

- **前端**: 8000（开发模式）
- **后端**: 8080（可能与 Nacos 冲突，如需修改请编辑 `ruoyi-admin/src/main/resources/application.yml`）
- **Nacos**: 8080（界面服务）, 8848（API 服务）- Nacos 版本 3.1
- **MySQL**: 3306
- **Redis**: 6379

### 配置文件位置

- **后端数据库配置**: `ruoyi-admin/src/main/resources/application-druid.yml`
- **后端主配置**: `ruoyi-admin/src/main/resources/application.yml`
- **前端代理配置**: `react-ui/config/proxy.ts`
- **路由配置**: `react-ui/config/routes.ts`

## 默认账号

- **管理员**: admin / admin123
- **测试账号**: ry / admin123

## 内置功能模块

系统包含完整的企业级管理系统功能：用户管理、部门管理、岗位管理、菜单管理、角色管理、字典管理、参数管理、通知公告、操作日志、登录日志、在线用户、定时任务、代码生成、系统接口、服务监控、在线构建器、连接池监视。

## 代码生成器

后端提供代码生成功能，可一键生成前后端 CRUD 代码：

1. 访问系统工具 -> 代码生成
2. 导入数据库表
3. 编辑生成配置
4. 生成并下载代码（包含 Java、TypeScript、SQL 等）
