# 档案管理系统 - 后端设计规范文档

> **文档版本**: V1.0
> **创建日期**: 2025-11-18
> **用途**: 作为代码生成的设计蓝图，规范数据库表结构、接口设计、业务逻辑

---

## 一、需求分析总结

### 1.1 核心业务场景

基于 `.cursorrules` 文档分析，档案管理系统需要支持以下核心场景：

| 业务场景 | 角色 | 核心功能 |
|---------|------|---------|
| **档案采集与著录** | 档案员 | 文件上传、OCR 识别、AI 辅助著录、自动生成档号 |
| **档案检索与利用** | 所有角色 | 全文检索、高级筛选、档案详情查看、文件下载 |
| **修改与版本控制** | 档案员 | 元数据修改、上传新版本、版本历史查询 |
| **删除与数据维护** | 管理员 | 逻辑删除、回收站管理、彻底删除 |
| **可视化与统计** | 管理层 | 项目地理分布、档案完整度、数据统计 |

### 1.2 前端 UI 分析

根据现有前端页面 `ArchiveSearch.tsx`、`ArchiveEntry.tsx`、`ArchiveDetail.tsx`，前端交互特点：

- **检索页面**: 支持关键词全文检索 + 高级筛选（项目、阶段、日期范围）+ 回收站切换
- **著录页面**: 三步骤流程（项目关联 → 元数据录入 + AI 辅助 → 确认入库）
- **详情页面**: 分 Tab 展示（元数据、版本历史、操作日志）+ 文件预览 + 在线编辑

### 1.3 技术约束

- **数据库**: MySQL 8.0+（支持 JSON 字段、全文索引、ngram 分词）
- **后端框架**: Spring Boot 3.3.0 + MyBatis（若依框架标准）
- **权限模型**: RBAC（基于若依 sys_menu 和 sys_role）
- **文件存储**: 本地存储 / MinIO 对象存储（可配置）
- **OCR 服务**: 百度 OCR API / Tesseract（可配置）
- **AI 服务**: 通义千问 / 文心一言（可配置）

---

## 二、数据库设计

### 2.1 表设计总览

| 表名 | 中文名 | 说明 | 关键特性 |
|-----|-------|------|---------|
| `ams_archive` | 档案主表 | 存储档案核心元数据 | 全文索引、JSON 字段、逻辑删除 |
| `ams_archive_version` | 档案版本表 | 存储历史版本文件信息 | 外键级联、OCR 状态机 |
| `ams_archive_audit_log` | 审计日志表 | 记录所有操作日志 | 高性能写入、索引优化 |
| `ams_archive_category` | 档案分类表 | 树状分类体系 | 自关联树结构、路径冗余 |
| `ams_tag_dictionary` | 标签字典表 | 全局标签库 | 唯一约束、使用统计 |

**ER 图关系**:
```
bams_project (1) ----< (N) ams_archive
ams_archive (1) ----< (N) ams_archive_version
ams_archive (1) ----< (N) ams_archive_audit_log
ams_archive_category (树) ----< (N) ams_archive
```

---

### 2.2 核心表详细设计

#### 表 1: `ams_archive` - 档案主表

**设计要点**:
- 档号 `archive_number` 必须全局唯一（UK 约束）
- 项目信息冗余存储（`project_code`、`project_name`）以优化查询性能
- `tags` 字段使用 JSON 类型，支持动态标签数组
- `ocr_content` 字段建立全文索引（ngram 分词器）
- `del_flag` 实现逻辑删除（0=存在, 1=已删除）

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `archive_id` | BIGINT | - | PK, AI | - | 档案主键 ID |
| `archive_number` | VARCHAR | 100 | NOT NULL, UK | - | 档案编号（自动生成，如 PRJ001-设计-JS-SJ-0001） |
| `title` | VARCHAR | 500 | NOT NULL | - | 档案题名 |
| **项目关联** |
| `project_id` | BIGINT | - | NOT NULL, FK | - | 所属项目 ID（关联 bams_project.project_id） |
| `project_code` | VARCHAR | 50 | INDEX | - | 项目编号（冗余字段） |
| `project_name` | VARCHAR | 200 | - | - | 项目名称（冗余字段） |
| `stage` | VARCHAR | 50 | NOT NULL, INDEX | - | 建设阶段（枚举：立项/设计/施工/验收） |
| **分类信息** |
| `category_id` | BIGINT | - | FK | NULL | 档案分类 ID（关联 ams_archive_category） |
| `category_path` | VARCHAR | 500 | - | NULL | 分类路径（如：/技术档案/设计图纸） |
| **时间字段** |
| `file_date` | DATE | - | - | NULL | 文件形成日期 |
| `archival_date` | DATETIME | - | - | NOW() | 归档日期（系统自动记录） |
| **档案属性** |
| `retention_period` | VARCHAR | 20 | - | '30年' | 保管期限（枚举：10年/30年/永久） |
| `secret_level` | VARCHAR | 20 | - | '普通' | 密级（枚举：普通/内部/机密/绝密） |
| `file_type` | VARCHAR | 50 | - | NULL | 文件类型（PDF/Word/Excel/Image） |
| `file_size` | BIGINT | - | - | NULL | 当前版本文件大小（字节） |
| **内容描述** |
| `description` | TEXT | - | - | NULL | 档案描述（人工填写） |
| `keywords` | VARCHAR | 500 | - | NULL | 关键词（逗号分隔） |
| `tags` | JSON | - | - | NULL | 标签数组（JSON 格式：["标签1", "标签2"]） |
| `summary` | TEXT | - | - | NULL | AI 生成的摘要 |
| `ocr_content` | LONGTEXT | - | FULLTEXT | NULL | OCR 识别的全文内容（用于全文检索） |
| **版本控制** |
| `current_version` | VARCHAR | 20 | - | 'V1.0' | 当前版本号 |
| `version_count` | INT | - | - | 1 | 总版本数 |
| **状态控制** |
| `status` | CHAR | 1 | - | '0' | 状态（0=正常, 1=草稿, 2=审核中） |
| `del_flag` | CHAR | 1 | INDEX | '0' | 删除标志（0=存在, 1=逻辑删除） |
| **审计字段（继承 BaseEntity）** |
| `create_by` | VARCHAR | 64 | - | NULL | 创建人用户名 |
| `create_time` | DATETIME | - | INDEX | NOW() | 创建时间 |
| `update_by` | VARCHAR | 64 | - | NULL | 最后更新人 |
| `update_time` | DATETIME | - | - | NOW() | 最后更新时间 |
| `remark` | VARCHAR | 500 | - | NULL | 备注 |

**索引设计**:
```sql
PRIMARY KEY (archive_id)
UNIQUE KEY uk_archive_number (archive_number)
INDEX idx_project_id (project_id)
INDEX idx_project_code (project_code)
INDEX idx_stage (stage)
INDEX idx_category_id (category_id)
INDEX idx_del_flag (del_flag)
INDEX idx_create_time (create_time)
FULLTEXT INDEX ft_ocr_content (ocr_content) WITH PARSER ngram
```

**档号生成规则**:
```
格式: {项目编号}-{建设阶段}-{分类编码}-{流水号}
示例: PRJ001-设计-JS-SJ-0001
说明:
  - 项目编号: 来自 project_code (如 PRJ001)
  - 建设阶段: stage 字段值 (如 设计)
  - 分类编码: category_code (如 JS-SJ 表示技术档案-设计图纸)
  - 流水号: 4 位数字，从 0001 开始自增（同项目同阶段同分类下唯一）
```

---

#### 表 2: `ams_archive_version` - 档案版本表

**设计要点**:
- 每次上传新文件，插入一条新版本记录
- 使用 `is_current` 标识当前版本（只能有一条记录为 '1'）
- `file_hash` 字段用于文件去重检测
- OCR 状态机：0=未处理 → 1=处理中 → 2=已完成 / 3=失败
- 外键级联删除：删除档案时自动删除所有版本

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `version_id` | BIGINT | - | PK, AI | - | 版本主键 ID |
| `archive_id` | BIGINT | - | NOT NULL, FK | - | 档案 ID（外键） |
| `version_number` | VARCHAR | 20 | NOT NULL | - | 版本号（V1.0, V2.0, V2.1...） |
| **文件信息** |
| `file_name` | VARCHAR | 255 | NOT NULL | - | 原始文件名（带扩展名） |
| `file_path` | VARCHAR | 500 | NOT NULL | - | 文件存储路径（相对路径或 URL） |
| `file_type` | VARCHAR | 50 | - | NULL | 文件 MIME 类型（application/pdf） |
| `file_size` | BIGINT | - | - | NULL | 文件大小（字节） |
| `file_hash` | VARCHAR | 64 | INDEX | NULL | 文件 SHA-256 哈希值（用于去重） |
| `is_current` | CHAR | 1 | INDEX | '0' | 是否当前版本（0=否, 1=是） |
| **OCR 处理** |
| `ocr_status` | CHAR | 1 | INDEX | '0' | OCR 状态（0=未处理, 1=处理中, 2=已完成, 3=失败） |
| `ocr_content` | LONGTEXT | - | - | NULL | 该版本的 OCR 识别内容 |
| `ocr_error` | VARCHAR | 500 | - | NULL | OCR 失败错误信息 |
| **版本说明** |
| `version_remark` | VARCHAR | 500 | - | NULL | 版本更新说明（由用户填写） |
| **审计字段** |
| `upload_by` | VARCHAR | 64 | - | NULL | 上传人用户名 |
| `upload_time` | DATETIME | - | INDEX | NOW() | 上传时间 |

**约束设计**:
```sql
PRIMARY KEY (version_id)
UNIQUE KEY uk_archive_version (archive_id, version_number)
FOREIGN KEY fk_version_archive (archive_id) REFERENCES ams_archive(archive_id) ON DELETE CASCADE
INDEX idx_is_current (is_current)
INDEX idx_ocr_status (ocr_status)
```

**版本号生成规则**:
```
规则: 主版本号.次版本号
- 上传新文件: 主版本号 +1，次版本号归 0 (如 V1.0 → V2.0)
- 修改元数据: 不影响版本号
- 替换文件: 次版本号 +1 (如 V2.0 → V2.1)
```

---

#### 表 3: `ams_archive_audit_log` - 审计日志表

**设计要点**:
- 记录所有敏感操作（CREATE, UPDATE, DELETE, DOWNLOAD, VIEW）
- 元数据修改时，记录字段级别的变更（old_value, new_value）
- `change_detail` 使用 JSON 格式存储复杂变更
- 高频写入场景，优化索引和分区（可选）

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `log_id` | BIGINT | - | PK, AI | - | 日志主键 ID |
| `archive_id` | BIGINT | - | INDEX | NULL | 档案 ID（可为 NULL，如查询操作） |
| `archive_number` | VARCHAR | 100 | INDEX | NULL | 档案编号（冗余，便于查询） |
| **操作信息** |
| `operation_type` | VARCHAR | 50 | NOT NULL, INDEX | - | 操作类型（枚举） |
| `operation_module` | VARCHAR | 50 | - | NULL | 操作模块（metadata/file/version） |
| **变更详情** |
| `field_name` | VARCHAR | 100 | - | NULL | 修改的字段名（如 title, retention_period） |
| `old_value` | TEXT | - | - | NULL | 修改前的值 |
| `new_value` | TEXT | - | - | NULL | 修改后的值 |
| `change_detail` | JSON | - | - | NULL | 完整变更详情（JSON 格式） |
| **操作人信息** |
| `operator` | VARCHAR | 64 | NOT NULL, INDEX | - | 操作人用户名 |
| `operation_time` | DATETIME | - | INDEX | NOW() | 操作时间 |
| `ip_address` | VARCHAR | 128 | - | NULL | 操作 IP 地址 |
| `user_agent` | VARCHAR | 500 | - | NULL | 浏览器 User-Agent |

**operation_type 枚举值**:
```
CREATE          - 创建档案
UPDATE          - 更新元数据
DELETE          - 逻辑删除
RESTORE         - 恢复档案
PERMANENT_DELETE - 彻底删除
VERSION_UPLOAD  - 上传新版本
DOWNLOAD        - 下载文件
VIEW            - 查看详情
EXPORT          - 批量导出
```

**索引设计**:
```sql
PRIMARY KEY (log_id)
INDEX idx_archive_id (archive_id)
INDEX idx_archive_number (archive_number)
INDEX idx_operation_type (operation_type)
INDEX idx_operator (operator)
INDEX idx_operation_time (operation_time)
```

**变更详情 JSON 示例**:
```json
{
  "fields": [
    {
      "field": "title",
      "old": "公交站台施工图",
      "new": "中山路公交站台施工图纸"
    },
    {
      "field": "retention_period",
      "old": "30年",
      "new": "永久"
    }
  ],
  "operator_role": "档案员",
  "reason": "补充完整题名"
}
```

---

#### 表 4: `ams_archive_category` - 档案分类表

**设计要点**:
- 树状结构（parent_id 自关联）
- `category_path` 冗余存储路径，优化查询性能
- `category_code` 用于生成档号，必须全局唯一
- 支持多级分类（建议不超过 3 级）

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `category_id` | BIGINT | - | PK, AI | - | 分类主键 ID |
| `parent_id` | BIGINT | - | INDEX | 0 | 父分类 ID（0=根节点） |
| `category_code` | VARCHAR | 50 | UK | NULL | 分类编码（如 JS-SJ，用于档号） |
| `category_name` | VARCHAR | 100 | NOT NULL | - | 分类名称（如 设计图纸） |
| `category_path` | VARCHAR | 500 | - | NULL | 完整路径（如 /技术档案/设计图纸） |
| `level` | INT | - | - | 1 | 分类层级（1/2/3...） |
| `order_num` | INT | - | - | 0 | 显示顺序 |
| `status` | CHAR | 1 | - | '0' | 状态（0=正常, 1=停用） |
| **审计字段** |
| `create_by` | VARCHAR | 64 | - | NULL | 创建人 |
| `create_time` | DATETIME | - | - | NOW() | 创建时间 |
| `update_by` | VARCHAR | 64 | - | NULL | 更新人 |
| `update_time` | DATETIME | - | - | NOW() | 更新时间 |

**初始数据示例**:
```
ID  | Parent | Code     | Name     | Path                  | Level
----|--------|----------|----------|-----------------------|------
1   | 0      | WS       | 文书档案 | /文书档案             | 1
2   | 0      | JS       | 技术档案 | /技术档案             | 1
11  | 1      | WS-LX    | 立项文件 | /文书档案/立项文件    | 2
21  | 2      | JS-SJ    | 设计图纸 | /技术档案/设计图纸    | 2
22  | 2      | JS-SG    | 施工文件 | /技术档案/施工文件    | 2
```

---

#### 表 5: `ams_tag_dictionary` - 标签字典表

**设计要点**:
- 管理员维护的全局标签库
- `tag_name` 必须唯一
- `usage_count` 记录标签使用频率（用于推荐排序）
- AI 推荐标签时，从此表匹配

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `tag_id` | BIGINT | - | PK, AI | - | 标签主键 ID |
| `tag_name` | VARCHAR | 50 | NOT NULL, UK | - | 标签名称（唯一） |
| `tag_category` | VARCHAR | 50 | INDEX | NULL | 标签分类（技术/管理/质量/安全等） |
| `usage_count` | INT | - | - | 0 | 使用次数（每次关联 +1） |
| `status` | CHAR | 1 | - | '0' | 状态（0=正常, 1=停用） |
| **审计字段** |
| `create_by` | VARCHAR | 64 | - | NULL | 创建人 |
| `create_time` | DATETIME | - | - | NOW() | 创建时间 |

**初始数据示例**:
```sql
INSERT INTO ams_tag_dictionary (tag_name, tag_category) VALUES
('施工图纸', '技术'),
('设计方案', '技术'),
('验收报告', '管理'),
('质量检测', '质量'),
('安全资料', '安全'),
('钢结构', '技术'),
('混凝土', '技术'),
('合同协议', '管理');
```

---

### 2.3 数据字典

#### 枚举值定义

**建设阶段 (stage)**:
```
立项 - 项目立项阶段
设计 - 设计阶段
施工 - 施工阶段
验收 - 验收阶段
```

**保管期限 (retention_period)**:
```
10年  - 短期保管
30年  - 中期保管
永久  - 永久保管
```

**密级 (secret_level)**:
```
普通 - 公开档案
内部 - 内部使用
机密 - 机密档案
绝密 - 绝密档案（最高级）
```

**档案状态 (status)**:
```
0 - 正常（已入库）
1 - 草稿（未提交）
2 - 审核中（待审批）
```

**OCR 状态 (ocr_status)**:
```
0 - 未处理
1 - 处理中
2 - 已完成
3 - 失败
```

---

## 三、接口设计

### 3.1 接口规范

**基本规范**:
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **认证方式**: JWT Token（Header: `Authorization: Bearer {token}`）
- **响应格式**: 统一使用若依框架的 `AjaxResult` 或 `TableDataInfo`
- **错误码**: 遵循若依框架规范（200=成功, 500=系统错误, 401=未授权）

**统一响应格式**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { /* 业务数据 */ }
}
```

**分页响应格式**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "total": 100,
  "rows": [ /* 数据列表 */ ]
}
```

---

### 3.2 核心接口清单

#### 模块 1: 档案管理（CRUD）

##### 1.1 查询档案列表

**接口路径**: `GET /archive/list`

**权限标识**: `archive:search:query`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 | 示例 |
|-------|------|------|------|------|
| `pageNum` | int | 否 | 页码 | 1 |
| `pageSize` | int | 否 | 每页条数 | 10 |
| `archiveNumber` | string | 否 | 档号（模糊查询） | PRJ001 |
| `title` | string | 否 | 题名（模糊查询） | 施工图 |
| `projectId` | long | 否 | 项目 ID | 1 |
| `projectCode` | string | 否 | 项目编号 | PRJ001 |
| `stage` | string | 否 | 建设阶段 | 设计 |
| `categoryId` | long | 否 | 分类 ID | 21 |
| `delFlag` | string | 否 | 删除标志（0=正常, 1=已删除） | 0 |
| `startDate` | date | 否 | 开始日期 | 2024-01-01 |
| `endDate` | date | 否 | 结束日期 | 2024-12-31 |

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "total": 50,
  "rows": [
    {
      "archiveId": 1,
      "archiveNumber": "PRJ001-设计-JS-SJ-0001",
      "title": "中山路公交站台施工图纸",
      "projectCode": "PRJ001",
      "projectName": "中山路公交站台建设项目",
      "stage": "设计",
      "currentVersion": "V2.0",
      "retentionPeriod": "永久",
      "fileDate": "2024-01-15",
      "createTime": "2024-01-20 10:30:00",
      "createBy": "张三"
    }
  ]
}
```

---

##### 1.2 获取档案详情

**接口路径**: `GET /archive/{archiveId}`

**权限标识**: `archive:search:detail`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `archiveId` | long | 是 | 档案 ID |

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "archiveId": 1,
    "archiveNumber": "PRJ001-设计-JS-SJ-0001",
    "title": "中山路公交站台施工图纸",
    "projectId": 1,
    "projectCode": "PRJ001",
    "projectName": "中山路公交站台建设项目",
    "stage": "设计",
    "categoryId": 21,
    "categoryPath": "/技术档案/设计图纸",
    "fileDate": "2024-01-15",
    "retentionPeriod": "永久",
    "secretLevel": "普通",
    "description": "中山路公交站台的详细施工图纸...",
    "keywords": "施工图纸,钢结构,公交站台",
    "tags": ["施工图纸", "钢结构", "技术文档"],
    "summary": "本文件为公交站台建设项目的施工图纸...",
    "currentVersion": "V2.0",
    "versionCount": 2,
    "versions": [
      {
        "versionId": 2,
        "versionNumber": "V2.0",
        "fileName": "施工图纸_v2.pdf",
        "fileSize": 5242880,
        "isCurrent": "1",
        "uploadBy": "李四",
        "uploadTime": "2024-01-25 14:20:00",
        "versionRemark": "修正尺寸标注"
      },
      {
        "versionId": 1,
        "versionNumber": "V1.0",
        "fileName": "施工图纸.pdf",
        "fileSize": 4194304,
        "isCurrent": "0",
        "uploadBy": "张三",
        "uploadTime": "2024-01-20 10:30:00",
        "versionRemark": "初始版本"
      }
    ]
  }
}
```

---

##### 1.3 新增档案

**接口路径**: `POST /archive`

**权限标识**: `archive:entry:add`

**请求体** (ArchiveCreateDto):
```json
{
  "title": "中山路公交站台施工图纸",
  "projectId": 1,
  "projectCode": "PRJ001",
  "projectName": "中山路公交站台建设项目",
  "stage": "设计",
  "categoryId": 21,
  "categoryPath": "/技术档案/设计图纸",
  "fileDate": "2024-01-15",
  "retentionPeriod": "永久",
  "secretLevel": "普通",
  "description": "中山路公交站台的详细施工图纸",
  "keywords": "施工图纸,钢结构,公交站台",
  "tags": ["施工图纸", "钢结构", "技术文档"],
  "summary": "本文件为公交站台建设项目的施工图纸...",
  "versionRemark": "初始版本"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "档案创建成功",
  "data": {
    "archiveId": 1,
    "archiveNumber": "PRJ001-设计-JS-SJ-0001"
  }
}
```

**业务逻辑**:
1. 验证必填字段（title, projectId, stage, categoryId）
2. 自动生成档号（`generateArchiveNumber()`）
3. 插入 `ams_archive` 表
4. 记录审计日志（operation_type=CREATE）
5. 返回档案 ID 和档号

---

##### 1.4 更新档案元数据

**接口路径**: `PUT /archive/{archiveId}`

**权限标识**: `archive:search:edit`

**路径参数**: `archiveId` (long)

**请求体** (ArchiveUpdateDto):
```json
{
  "title": "中山路公交站台详细施工图纸",
  "retentionPeriod": "永久",
  "description": "更新后的描述...",
  "keywords": "施工图纸,钢结构,公交站台,更新",
  "tags": ["施工图纸", "钢结构", "技术文档", "已修订"]
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "更新成功"
}
```

**业务逻辑**:
1. 查询修改前的数据（用于审计）
2. 更新 `ams_archive` 表
3. 记录审计日志（记录字段级变更）
4. 返回成功信息

---

##### 1.5 逻辑删除档案

**接口路径**: `DELETE /archive/{archiveId}`

**权限标识**: `archive:search:remove`（需要管理员角色）

**路径参数**: `archiveId` (long)

**响应示例**:
```json
{
  "code": 200,
  "msg": "档案已删除"
}
```

**业务逻辑**:
1. 验证权限（仅管理员）
2. 更新 `del_flag = '1'`
3. 记录审计日志（operation_type=DELETE）
4. 返回成功信息

---

##### 1.6 恢复档案

**接口路径**: `POST /archive/{archiveId}/restore`

**权限标识**: `archive:search:restore`（需要管理员角色）

**路径参数**: `archiveId` (long)

**响应示例**:
```json
{
  "code": 200,
  "msg": "档案已恢复"
}
```

**业务逻辑**:
1. 验证权限（仅管理员）
2. 更新 `del_flag = '0'`
3. 记录审计日志（operation_type=RESTORE）

---

##### 1.7 查询回收站

**接口路径**: `GET /archive/recycle-bin`

**权限标识**: `archive:search:query`（需要管理员角色）

**请求参数**: 同 1.1（强制 `delFlag=1`）

**响应示例**: 同 1.1

---

#### 模块 2: 文件与版本管理

##### 2.1 上传文件（创建首版本）

**接口路径**: `POST /archive/upload`

**权限标识**: `archive:entry:upload`

**请求方式**: `multipart/form-data`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `file` | file | 是 | 上传的文件 |
| `archiveId` | long | 是 | 档案 ID |
| `versionRemark` | string | 否 | 版本说明 |

**响应示例**:
```json
{
  "code": 200,
  "msg": "文件上传成功",
  "data": {
    "versionId": 1,
    "versionNumber": "V1.0",
    "filePath": "/uploads/2024/01/20/abc123.pdf",
    "fileSize": 5242880,
    "fileHash": "sha256_hash_value",
    "ocrStatus": "1"
  }
}
```

**业务逻辑**:
1. 保存文件到存储路径（本地 / MinIO）
2. 计算文件 SHA-256 哈希值（去重检测）
3. 插入 `ams_archive_version` 表（`version_number=V1.0`, `is_current=1`）
4. 更新 `ams_archive` 表（`current_version`, `version_count`, `file_size`, `file_type`）
5. 异步触发 OCR 识别任务（更新 `ocr_status=1`）
6. 记录审计日志（operation_type=VERSION_UPLOAD）

---

##### 2.2 上传新版本

**接口路径**: `POST /archive/{archiveId}/versions/upload`

**权限标识**: `archive:search:edit`

**请求方式**: `multipart/form-data`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `file` | file | 是 | 新版本文件 |
| `versionRemark` | string | 是 | 版本更新说明 |

**响应示例**: 同 2.1

**业务逻辑**:
1. 查询当前版本号（如 V2.0）
2. 生成新版本号（V3.0）
3. 将旧版本的 `is_current` 设为 '0'
4. 插入新版本记录（`is_current=1`）
5. 更新 `ams_archive` 表（`current_version`, `version_count++`）
6. 异步触发 OCR 识别
7. 记录审计日志

---

##### 2.3 下载文件

**接口路径**: `GET /archive/{archiveId}/download`

**权限标识**: `archive:search:download`

**路径参数**: `archiveId` (long)

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `versionId` | long | 否 | 指定版本 ID（不传则下载当前版本） |

**响应**: 文件流（Content-Type: application/octet-stream）

**业务逻辑**:
1. 验证权限（查阅员只能下载当前版本）
2. 查询文件路径
3. 读取文件流并返回
4. 记录审计日志（operation_type=DOWNLOAD）

---

##### 2.4 获取版本历史

**接口路径**: `GET /archive/{archiveId}/versions`

**权限标识**: `archive:search:detail`

**路径参数**: `archiveId` (long)

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "versionId": 3,
      "versionNumber": "V3.0",
      "fileName": "施工图纸_修订版.pdf",
      "fileSize": 6291456,
      "isCurrent": "1",
      "ocrStatus": "2",
      "uploadBy": "王五",
      "uploadTime": "2024-02-01 09:15:00",
      "versionRemark": "增加材料规格说明"
    },
    {
      "versionId": 2,
      "versionNumber": "V2.0",
      "fileName": "施工图纸_v2.pdf",
      "fileSize": 5242880,
      "isCurrent": "0",
      "ocrStatus": "2",
      "uploadBy": "李四",
      "uploadTime": "2024-01-25 14:20:00",
      "versionRemark": "修正尺寸标注"
    }
  ]
}
```

---

#### 模块 3: 检索功能

##### 3.1 全文检索

**接口路径**: `POST /archive/search`

**权限标识**: `archive:search:query`

**请求体** (ArchiveSearchDto):
```json
{
  "keyword": "公交站台 施工图纸",
  "projectId": null,
  "projectCode": "PRJ001",
  "stage": "设计",
  "tags": ["施工图纸", "钢结构"],
  "secretLevel": null,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "delFlag": "0",
  "pageNum": 1,
  "pageSize": 10
}
```

**响应示例**: 同 1.1（带分页）

**检索逻辑**:
```sql
WHERE
  (title LIKE '%keyword%'
   OR archive_number LIKE '%keyword%'
   OR MATCH(ocr_content) AGAINST('keyword'))
AND project_code = 'PRJ001'
AND stage = '设计'
AND JSON_CONTAINS(tags, '["施工图纸"]')
AND file_date BETWEEN '2024-01-01' AND '2024-12-31'
AND del_flag = '0'
```

---

##### 3.2 高级筛选

**接口路径**: `GET /archive/filter`

**权限标识**: `archive:search:query`

**请求参数**: 支持多条件组合（同 3.1）

**响应示例**: 同 1.1

---

#### 模块 4: 辅助功能

##### 4.1 AI 生成摘要和标签

**接口路径**: `POST /archive/ai/suggest`

**权限标识**: `archive:entry:add`

**请求体**:
```json
{
  "ocrContent": "OCR 识别的全文内容...",
  "title": "中山路公交站台施工图纸"
}
```

**响应示例**:
```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "summary": "本文件为公交站台建设项目的施工图纸，包含站台结构设计、材料规格说明和施工工艺要求。",
    "tags": ["施工图纸", "钢结构", "公交站台", "技术文档"]
  }
}
```

**业务逻辑**:
1. 调用 AI API（通义千问/文心一言）
2. 生成摘要（100-150 字）
3. 提取关键词并匹配标签字典
4. 返回建议结果

---

##### 4.2 获取分类树

**接口路径**: `GET /archive/category/tree`

**权限标识**: 无（公开接口）

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "categoryId": 1,
      "categoryCode": "WS",
      "categoryName": "文书档案",
      "children": [
        {
          "categoryId": 11,
          "categoryCode": "WS-LX",
          "categoryName": "立项文件",
          "children": []
        }
      ]
    },
    {
      "categoryId": 2,
      "categoryCode": "JS",
      "categoryName": "技术档案",
      "children": [
        {
          "categoryId": 21,
          "categoryCode": "JS-SJ",
          "categoryName": "设计图纸",
          "children": []
        }
      ]
    }
  ]
}
```

---

##### 4.3 获取标签字典

**接口路径**: `GET /archive/tags`

**权限标识**: 无（公开接口）

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `category` | string | 否 | 标签分类 |
| `limit` | int | 否 | 返回数量（默认 50，按使用次数排序） |

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "tagId": 1,
      "tagName": "施工图纸",
      "tagCategory": "技术",
      "usageCount": 120
    },
    {
      "tagId": 2,
      "tagName": "设计方案",
      "tagCategory": "技术",
      "usageCount": 95
    }
  ]
}
```

---

##### 4.4 获取操作日志

**接口路径**: `GET /archive/{archiveId}/audit-logs`

**权限标识**: `archive:search:detail`

**路径参数**: `archiveId` (long)

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `operationType` | string | 否 | 操作类型过滤 |
| `pageNum` | int | 否 | 页码 |
| `pageSize` | int | 否 | 每页条数 |

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "total": 15,
  "rows": [
    {
      "logId": 123,
      "operationType": "UPDATE",
      "operationModule": "metadata",
      "fieldName": "title",
      "oldValue": "施工图纸",
      "newValue": "中山路公交站台施工图纸",
      "operator": "李四",
      "operationTime": "2024-01-25 14:30:00",
      "ipAddress": "192.168.1.100"
    },
    {
      "logId": 122,
      "operationType": "DOWNLOAD",
      "operationModule": "file",
      "operator": "张三",
      "operationTime": "2024-01-25 10:15:00"
    }
  ]
}
```

---

##### 4.5 批量导出

**接口路径**: `POST /archive/export`

**权限标识**: `archive:search:export`

**请求体**:
```json
{
  "archiveIds": [1, 2, 3, 4, 5],
  "exportFields": ["archiveNumber", "title", "projectName", "stage", "fileDate"]
}
```

**响应**: Excel 文件流

**业务逻辑**:
1. 查询指定档案数据
2. 使用 EasyExcel 生成 Excel 文件
3. 记录审计日志（operation_type=EXPORT）
4. 返回文件流

---

#### 模块 5: 可视化统计

##### 5.1 获取统计数据

**接口路径**: `GET /archive/statistics`

**权限标识**: 无（公开接口）

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `projectId` | long | 否 | 项目 ID（不传则全部项目） |
| `startDate` | date | 否 | 开始日期 |
| `endDate` | date | 否 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "overview": {
      "totalArchives": 1250,
      "activeArchives": 1200,
      "deletedArchives": 50,
      "totalStorage": 52428800000
    },
    "byStage": [
      { "stage": "立项", "count": 150 },
      { "stage": "设计", "count": 400 },
      { "stage": "施工", "count": 500 },
      { "stage": "验收", "count": 200 }
    ],
    "byFileType": [
      { "fileType": "PDF", "count": 800 },
      { "fileType": "Word", "count": 300 },
      { "fileType": "Excel", "count": 150 }
    ],
    "trend": [
      { "month": "2024-01", "count": 120 },
      { "month": "2024-02", "count": 150 }
    ],
    "projectMap": [
      {
        "projectId": 1,
        "projectCode": "PRJ001",
        "projectName": "中山路公交站台",
        "latitude": 23.1291,
        "longitude": 113.2644,
        "totalArchives": 50,
        "completenessRate": 85
      }
    ]
  }
}
```

---

### 3.3 DTO/VO 对象设计

#### DTO (Data Transfer Object) - 前端提交

**ArchiveCreateDto** (创建档案请求):
```java
{
  title: string;              // 档案题名（必填）
  projectId: long;            // 项目 ID（必填）
  projectCode: string;        // 项目编号（必填）
  projectName: string;        // 项目名称（必填）
  stage: string;              // 建设阶段（必填）
  categoryId: long;           // 分类 ID（必填）
  categoryPath: string;       // 分类路径
  fileDate: Date;             // 文件日期
  retentionPeriod: string;    // 保管期限（默认 30年）
  secretLevel: string;        // 密级（默认 普通）
  description: string;        // 档案描述
  keywords: string;           // 关键词（逗号分隔）
  tags: string[];             // 标签数组
  summary: string;            // AI 摘要
  versionRemark: string;      // 首版本说明
}
```

**ArchiveUpdateDto** (更新元数据请求):
```java
{
  archiveId: long;            // 档案 ID（必填）
  title: string;              // 档案题名
  retentionPeriod: string;    // 保管期限
  secretLevel: string;        // 密级
  description: string;        // 档案描述
  keywords: string;           // 关键词
  tags: string[];             // 标签数组
  summary: string;            // 摘要
}
```

**ArchiveSearchDto** (检索请求):
```java
{
  keyword: string;            // 全文检索关键词
  archiveNumber: string;      // 档号（模糊查询）
  title: string;              // 题名（模糊查询）
  projectId: long;            // 项目 ID
  projectCode: string;        // 项目编号
  stage: string;              // 建设阶段
  categoryId: long;           // 分类 ID
  tags: string[];             // 标签数组（多选）
  secretLevel: string;        // 密级
  startDate: Date;            // 开始日期
  endDate: Date;              // 结束日期
  delFlag: string;            // 删除标志（0=正常, 1=已删除）
  pageNum: int;               // 页码
  pageSize: int;              // 每页条数
}
```

---

#### VO (View Object) - 后端返回

**ArchiveListVo** (列表项):
```java
{
  archiveId: long;
  archiveNumber: string;
  title: string;
  projectCode: string;
  projectName: string;
  stage: string;
  currentVersion: string;
  retentionPeriod: string;
  fileDate: Date;
  fileSize: long;
  createTime: Date;
  createBy: string;
}
```

**ArchiveDetailVo** (详情):
```java
{
  // 基本信息
  archiveId: long;
  archiveNumber: string;
  title: string;
  projectId: long;
  projectCode: string;
  projectName: string;
  stage: string;
  categoryId: long;
  categoryPath: string;

  // 档案属性
  fileDate: Date;
  archivalDate: Date;
  retentionPeriod: string;
  secretLevel: string;
  fileType: string;
  fileSize: long;

  // 内容描述
  description: string;
  keywords: string;
  tags: string[];
  summary: string;

  // 版本信息
  currentVersion: string;
  versionCount: int;
  versions: VersionHistoryVo[];

  // 审计信息
  createBy: string;
  createTime: Date;
  updateBy: string;
  updateTime: Date;
}
```

**VersionHistoryVo** (版本历史项):
```java
{
  versionId: long;
  versionNumber: string;
  fileName: string;
  fileSize: long;
  fileType: string;
  isCurrent: string;
  ocrStatus: string;
  versionRemark: string;
  uploadBy: string;
  uploadTime: Date;
}
```

---

## 四、业务流程设计

### 4.1 档案采集与著录流程

```
前端 → 后端业务逻辑

【步骤 1：项目关联与文件上传】
1. 前端: 选择项目 + 建设阶段
2. 前端: 上传文件（PDF/Word）
3. 后端: POST /archive/upload
   ├─ 保存文件到存储路径
   ├─ 计算文件哈希值
   ├─ 插入 ams_archive_version (V1.0, ocr_status=1)
   ├─ 异步触发 OCR 识别任务
   └─ 返回 versionId, filePath

【步骤 2：元数据录入 + AI 辅助】
4. 后端: OCR 完成后，更新 ocr_content, ocr_status=2
5. 前端: 请求 AI 建议
6. 后端: POST /archive/ai/suggest
   ├─ 调用 AI API（基于 ocr_content）
   ├─ 生成摘要
   ├─ 匹配标签字典
   └─ 返回 summary, tags
7. 前端: 显示 AI 建议，用户可编辑

【步骤 3：确认入库】
8. 前端: 提交全部元数据
9. 后端: POST /archive
   ├─ 生成档号（generateArchiveNumber）
   ├─ 插入 ams_archive
   ├─ 关联 versionId
   ├─ 记录审计日志（CREATE）
   └─ 返回 archiveId, archiveNumber
10. 前端: 显示"入库成功！档号：XXX"
```

---

### 4.2 版本上传流程

```
【前提】档案已存在，需要上传新版本

前端 → 后端业务逻辑

1. 前端: 在详情页点击"上传新版本"
2. 前端: 选择文件 + 填写版本说明
3. 前端: POST /archive/{archiveId}/versions/upload
4. 后端:
   ├─ 查询当前版本号（如 V2.0）
   ├─ 生成新版本号（V3.0）
   ├─ 保存文件到存储路径
   ├─ 更新旧版本：SET is_current='0' WHERE archive_id=X AND is_current='1'
   ├─ 插入新版本记录（V3.0, is_current='1', ocr_status='1'）
   ├─ 更新 ams_archive：
   │   ├─ current_version = 'V3.0'
   │   ├─ version_count = version_count + 1
   │   └─ file_size = 新文件大小
   ├─ 异步触发 OCR 识别
   └─ 记录审计日志（VERSION_UPLOAD）
5. 前端: 显示"新版本上传成功！版本号：V3.0"
6. 前端: 刷新版本历史列表
```

---

### 4.3 元数据修改审计流程

```
【前提】用户修改档案元数据（如题名、保管期限）

前端 → 后端业务逻辑

1. 前端: 在详情页点击"编辑"
2. 前端: 修改字段（title, retention_period）
3. 前端: PUT /archive/{archiveId}
4. 后端:
   ├─ 查询修改前的数据（oldArchive）
   ├─ 执行更新操作
   ├─ 对比每个字段：
   │   ├─ title: "施工图纸" → "中山路公交站台施工图纸"
   │   └─ retention_period: "30年" → "永久"
   ├─ 记录审计日志（每个字段一条）：
   │   INSERT INTO ams_archive_audit_log (
   │     archive_id, operation_type='UPDATE',
   │     field_name='title',
   │     old_value='施工图纸',
   │     new_value='中山路公交站台施工图纸',
   │     operator='李四'
   │   )
   └─ 返回成功
5. 前端: 显示"更新成功"
6. 前端: 刷新详情页，切换到"操作日志" Tab 可查看变更记录
```

---

### 4.4 全文检索流程

```
【场景】用户在检索页面输入关键词"公交站台 施工图纸"

前端 → 后端业务逻辑

1. 前端: 输入关键词 + 高级筛选条件
2. 前端: POST /archive/search
   {
     "keyword": "公交站台 施工图纸",
     "stage": "设计",
     "startDate": "2024-01-01",
     "endDate": "2024-12-31"
   }
3. 后端:
   ├─ 构建动态 SQL：
   │   SELECT * FROM ams_archive
   │   WHERE (
   │     title LIKE '%公交站台%'
   │     OR title LIKE '%施工图纸%'
   │     OR MATCH(ocr_content) AGAINST('公交站台 施工图纸')
   │   )
   │   AND stage = '设计'
   │   AND file_date BETWEEN '2024-01-01' AND '2024-12-31'
   │   AND del_flag = '0'
   │   ORDER BY create_time DESC
   ├─ 执行分页查询
   └─ 返回结果（total, rows）
4. 前端: 显示搜索结果列表
   ├─ 高亮显示匹配关键词
   └─ 显示档号、题名、项目名称、建设阶段、上传日期
```

---

### 4.5 逻辑删除与恢复流程

```
【删除流程】

1. 前端: 在列表页点击"删除"按钮
2. 前端: 弹出确认对话框
3. 前端: DELETE /archive/{archiveId}
4. 后端:
   ├─ 验证权限（@PreAuthorize("hasRole('admin')")）
   ├─ 更新 del_flag='1'
   ├─ 记录审计日志（DELETE）
   └─ 返回成功
5. 前端: 列表中该档案消失（被 del_flag='0' 过滤）

【恢复流程】

1. 前端: 勾选"显示已删除档案"
2. 前端: GET /archive/recycle-bin
3. 后端: 查询 del_flag='1' 的档案
4. 前端: 显示回收站列表（红色背景）
5. 前端: 点击"恢复"按钮
6. 前端: POST /archive/{archiveId}/restore
7. 后端:
   ├─ 验证权限
   ├─ 更新 del_flag='0'
   ├─ 记录审计日志（RESTORE）
   └─ 返回成功
8. 前端: 档案回到正常列表
```

---

## 五、技术实现要点

### 5.1 档号生成算法

```java
/**
 * 档号生成规则：{项目编号}-{建设阶段}-{分类编码}-{流水号}
 * 示例：PRJ001-设计-JS-SJ-0001
 */
public String generateArchiveNumber(String projectCode, String stage, String categoryCode) {
    // 1. 查询该项目、该阶段、该分类下的最大流水号
    int maxSeq = archiveMapper.getMaxSequence(projectCode, stage, categoryCode);

    // 2. 流水号 +1
    int nextSeq = maxSeq + 1;

    // 3. 格式化为 4 位数字（不足补 0）
    String seqStr = String.format("%04d", nextSeq);

    // 4. 拼接档号
    return String.join("-", projectCode, stage, categoryCode, seqStr);
}
```

**并发安全**: 使用 Redis 分布式锁或数据库悲观锁

---

### 5.2 OCR 异步处理

```java
/**
 * OCR 异步处理流程
 */
@Async
public void processOcr(Long versionId, String filePath) {
    try {
        // 1. 更新状态为"处理中"
        updateOcrStatus(versionId, "1");

        // 2. 调用 OCR 引擎（百度 OCR API）
        String ocrText = baiduOcrClient.recognize(filePath);

        // 3. 保存 OCR 结果
        versionMapper.updateOcrContent(versionId, ocrText, "2");

        // 4. 同步到档案主表
        archiveMapper.updateOcrContent(archiveId, ocrText);

    } catch (Exception e) {
        // 5. 处理失败，记录错误
        versionMapper.updateOcrStatus(versionId, "3", e.getMessage());
        log.error("OCR 识别失败: {}", e.getMessage());
    }
}
```

**前端轮询**: 每 3 秒查询一次 `ocr_status`，直到状态为 '2' 或 '3'

---

### 5.3 文件存储策略

**本地存储**:
```
/data/archives/
  ├── 2024/
  │   ├── 01/
  │   │   ├── 20/
  │   │   │   ├── abc123.pdf       (文件名使用 UUID)
  │   │   │   └── def456.docx
```

**MinIO 对象存储** (生产环境推荐):
```
Bucket: archives
Object Key: 2024/01/20/abc123.pdf
Public URL: https://minio.example.com/archives/2024/01/20/abc123.pdf
```

---

### 5.4 全文索引优化

**MySQL 全文索引**:
```sql
-- 创建全文索引（ngram 分词器，支持中文）
ALTER TABLE ams_archive
ADD FULLTEXT INDEX ft_ocr_content (ocr_content) WITH PARSER ngram;

-- 查询示例
SELECT * FROM ams_archive
WHERE MATCH(ocr_content) AGAINST('公交站台 施工图纸' IN NATURAL LANGUAGE MODE);
```

**Elasticsearch 集成** (可选，大数据量场景):
- 使用 Logstash 或 Canal 同步数据
- 支持更复杂的分词和高亮显示

---

### 5.6 权限控制实现

**基于注解的权限验证**:
```java
@PreAuthorize("@ss.hasPermi('archive:search:query')")
public List<AmsArchive> selectArchiveList(AmsArchive archive) { ... }

@PreAuthorize("hasRole('admin')")
public int deleteArchiveById(Long archiveId) { ... }
```

**权限矩阵**:
| 功能 | 权限标识 | 管理员 | 档案员 | 查阅员 |
|-----|---------|-------|-------|-------|
| 查询列表 | archive:search:query | ✅ | ✅ | ✅ |
| 查看详情 | archive:search:detail | ✅ | ✅ | ✅ |
| 下载文件 | archive:search:download | ✅ | ✅ | ✅（仅当前版本） |
| 创建档案 | archive:entry:add | ✅ | ✅ | ❌ |
| 编辑元数据 | archive:search:edit | ✅ | ✅ | ❌ |
| 逻辑删除 | archive:search:remove | ✅ | ❌ | ❌ |
| 恢复档案 | archive:search:restore | ✅ | ❌ | ❌ |

---

## 六、开发检查清单

### 6.1 数据库开发

- [ ] 创建所有表（5 张核心表）
- [ ] 建立外键约束（version → archive）
- [ ] 创建全文索引（ocr_content）
- [ ] 插入分类初始数据
- [ ] 插入标签字典初始数据
- [ ] 插入菜单权限数据
- [ ] 创建统计视图（可选）

---

### 6.2 后端开发

**实体类 (Domain)**:
- [ ] AmsArchive.java
- [ ] AmsArchiveVersion.java
- [ ] AmsArchiveAuditLog.java
- [ ] AmsArchiveCategory.java
- [ ] AmsTagDictionary.java

**Mapper 层**:
- [ ] AmsArchiveMapper.java + XML
- [ ] AmsArchiveVersionMapper.java + XML
- [ ] AmsArchiveAuditLogMapper.java + XML
- [ ] AmsArchiveCategoryMapper.java + XML
- [ ] AmsTagDictionaryMapper.java + XML

**Service 层**:
- [ ] IAmsArchiveService.java + Impl
- [ ] IAmsArchiveVersionService.java + Impl
- [ ] IAmsArchiveAuditLogService.java + Impl
- [ ] IAmsArchiveCategoryService.java + Impl
- [ ] IAmsTagDictionaryService.java + Impl
- [ ] IOcrService.java + Impl
- [ ] IAiAssistantService.java + Impl

**Controller 层**:
- [ ] AmsArchiveController.java（档案 CRUD）
- [ ] AmsArchiveSearchController.java（检索）
- [ ] AmsArchiveFileController.java（文件上传下载）
- [ ] AmsArchiveCategoryController.java（分类管理）
- [ ] AmsTagDictionaryController.java（标签管理）

**工具类**:
- [ ] ArchiveNumberGenerator.java（档号生成）
- [ ] FileStorageUtil.java（文件存储）
- [ ] OcrClient.java（OCR 客户端）
- [ ] AiClient.java（AI 客户端）

---

### 6.3 前后端联调

- [ ] 档案列表查询
- [ ] 档案详情查看
- [ ] 档案创建（含文件上传）
- [ ] 档案元数据修改
- [ ] 版本上传
- [ ] 版本历史查询
- [ ] 文件下载
- [ ] 全文检索
- [ ] 逻辑删除与恢复
- [ ] 操作日志查询
- [ ] 分类树查询
- [ ] 标签字典查询
- [ ] AI 建议生成
- [ ] 统计数据查询

---

## 七、附录

### 7.1 数据库脚本位置

```
/sql/archive_system.sql    - 完整建表脚本 + 初始数据
```

### 7.2 相关文档

- [后端实现详细方案](./archive-backend-design.md)
- [实施指南](./archive-implementation-guide.md)
- [若依框架文档](http://doc.ruoyi.vip)

---

**文档维护**: 本文档作为代码开发的蓝图，请在开发过程中及时更新。
