# 档案管理系统 - 后端设计规范文档 V2.0

> **文档版本**: V2.0.1
> **更新日期**: 2025-11-19
> **用途**: 作为代码生成的设计蓝图，规范数据库表结构、接口设计、业务逻辑
> **变更说明**: 根据最新需求调整，简化业务逻辑，优化表结构；恢复元数据修改审计日志

---

## 一、需求分析总结

### 1.1 核心业务场景

基于最新需求分析，档案管理系统需要支持以下核心场景：

| 业务场景 | 角色 | 核心功能 |
|---------|------|---------|
| **档案采集与著录** | 档案员 | 文件上传（PDF）、基础信息录入、自动生成档号 |
| **档案检索与利用** | 所有角色 | 关键词检索、高级筛选、档案详情查看、文件下载 |
| **版本管理** | 档案员 | 上传新版本、版本历史查询 |
| **删除与数据维护** | 管理员 | 逻辑删除、回收站管理、彻底删除 |
| **可视化与统计** | 管理层 | 项目地理分布、档案统计、数据分析 |

### 1.2 简化调整说明

**相比 V1.0 版本的简化：**
1. **移除分类体系**：不再使用档案分类表，简化档号生成规则
2. **移除复杂属性**：取消密级、保管期限等档案管理字段
3. **移除全文检索**：档案表不存储 OCR 内容，OCR 功能标注为待对接
4. **固定文件格式**：仅支持 PDF 文件
5. **应用层维护关联**：不建立数据库外键，改为代码层面维护数据一致性

### 1.3 技术约束

- **数据库**: MySQL 8.0+（支持 JSON 字段）
- **后端框架**: Spring Boot 3.3.0 + MyBatis（若依框架标准）
- **权限模型**: RBAC（基于若依 sys_menu 和 sys_role）
- **文件存储**: 本地存储 / MinIO 对象存储（可配置）
- **OCR 服务**: 标注为**待对接**（预留接口）
- **AI 服务**: 标注为**待对接**（预留接口）

---

## 二、数据库设计

### 2.1 表设计总览

| 表名 | 中文名 | 说明 | 关键特性 |
|-----|-------|------|---------|
| `bams_archive` | 档案主表 | 存储档案核心元数据 | JSON 标签、逻辑删除 |
| `bams_archive_version` | 档案版本表 | 存储历史版本文件信息 | 版本管理、应用层维护关联 |
| `bams_archive_audit_log` | 审计日志表 | 记录关键操作日志 | 高性能写入、索引优化 |
| `bams_tag_dictionary` | 标签字典表 | 全局标签库 | 唯一约束、使用统计 |

**ER 图关系**（应用层维护）：
```
bams_project (1) ----< (N) bams_archive
bams_archive (1) ----< (N) bams_archive_version
bams_archive (1) ----< (N) bams_archive_audit_log
```

---

### 2.2 核心表详细设计

#### 表 1: `bams_archive` - 档案主表

**设计要点**:
- 档号 `archive_number` 必须全局唯一（UK 约束）
- 项目信息冗余存储（`project_code`、`project_name`）以优化查询性能
- `tags` 字段使用 JSON 类型，支持动态标签数组
- `del_flag` 实现逻辑删除（0=存在, 1=已删除）
- **不建立外键约束**，数据一致性由应用层代码保证
- 文件类型固定为 PDF

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `archive_id` | BIGINT | - | PK, AI | - | 档案主键 ID |
| `archive_number` | VARCHAR | 100 | NOT NULL, UK | - | 档案编号（自动生成，如 PRJ001-0001） |
| `title` | VARCHAR | 500 | NOT NULL | - | 档案题名 |
| **项目关联** |
| `project_id` | BIGINT | - | NOT NULL | - | 所属项目 ID（关联 bams_project.project_id，应用层维护） |
| `project_code` | VARCHAR | 50 | NOT NULL | - | 项目编号（冗余字段） |
| `project_name` | VARCHAR | 200 | - | - | 项目名称（冗余字段） |
| `stage` | VARCHAR | 50 | NOT NULL | - | 建设阶段（枚举：立项/设计/施工/验收） |
| **时间字段** |
| `file_date` | DATE | - | - | NULL | 文件形成日期 |
| `archival_date` | DATETIME | - | - | NOW() | 归档日期（系统自动记录） |
| **档案属性** |
| `file_type` | VARCHAR | 20 | - | 'PDF' | 文件类型（固定为 PDF） |
| `file_size` | BIGINT | - | - | NULL | 当前版本文件大小（字节） |
| **内容描述** |
| `description` | TEXT | - | - | NULL | 档案描述（人工填写） |
| `tags` | JSON | - | - | NULL | 标签数组（JSON 格式：["标签1", "标签2"]） |
| `summary` | TEXT | - | - | NULL | AI 生成的摘要（待对接 AI 服务） |
| **版本控制** |
| `current_version` | VARCHAR | 20 | - | 'V1.0' | 当前版本号 |
| `version_count` | INT | - | - | 1 | 总版本数 |
| **状态控制** |
| `status` | CHAR | 1 | - | '0' | 状态（0=正常, 1=草稿） |
| `del_flag` | CHAR | 1 | - | '0' | 删除标志（0=存在, 1=逻辑删除）**不建索引** |
| **审计字段（继承 BaseEntity）** |
| `create_by` | VARCHAR | 64 | - | NULL | 创建人用户名 |
| `create_time` | DATETIME | - | - | NOW() | 创建时间 |
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
INDEX idx_create_time (create_time)
-- 注意：del_flag 不建索引（只有两个值，区分度低）
```

**档号生成规则**:
```
格式: {项目编号}-{流水号}
示例: PRJ001-0001
说明:
  - 项目编号: 来自 project_code (如 PRJ001)
  - 流水号: 4 位数字，从 0001 开始自增（同项目下全局唯一）
```

---

#### 表 2: `bams_archive_version` - 档案版本表

**设计要点**:
- 每次上传新文件，插入一条新版本记录
- 使用 `is_current` 标识当前版本（只能有一条记录为 '1'）
- `file_hash` 字段用于文件去重检测
- **不建立数据库外键**，通过应用层代码维护与档案主表的关联
- 文件类型固定为 PDF
- **移除 OCR 相关字段**（OCR 功能待对接）

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `version_id` | BIGINT | - | PK, AI | - | 版本主键 ID |
| `archive_id` | BIGINT | - | NOT NULL | - | 档案 ID（应用层维护关联） |
| `version_number` | VARCHAR | 20 | NOT NULL | - | 版本号（V1.0, V2.0, V3.0...） |
| **文件信息** |
| `file_name` | VARCHAR | 255 | NOT NULL | - | 原始文件名（带扩展名） |
| `file_path` | VARCHAR | 500 | NOT NULL | - | 文件存储路径（相对路径或 URL） |
| `file_type` | VARCHAR | 20 | - | 'PDF' | 文件类型（固定为 PDF） |
| `file_size` | BIGINT | - | - | NULL | 文件大小（字节） |
| `file_hash` | VARCHAR | 64 | - | NULL | 文件 SHA-256 哈希值（用于去重） |
| `is_current` | CHAR | 1 | - | '0' | 是否当前版本（0=否, 1=是） |
| **版本说明** |
| `version_remark` | VARCHAR | 500 | - | NULL | 版本更新说明（由用户填写） |
| **审计字段** |
| `upload_by` | VARCHAR | 64 | - | NULL | 上传人用户名 |
| `upload_time` | DATETIME | - | - | NOW() | 上传时间 |

**约束设计**:
```sql
PRIMARY KEY (version_id)
UNIQUE KEY uk_archive_version (archive_id, version_number)
INDEX idx_archive_id (archive_id)
INDEX idx_is_current (is_current)
INDEX idx_file_hash (file_hash)
-- 注意：不建立外键约束，数据一致性由应用层保证
```

**版本号生成规则**:
```
规则: 主版本号递增
- 上传新文件: 主版本号 +1 (如 V1.0 → V2.0 → V3.0)
- 修改元数据: 不影响版本号
```

---

#### 表 3: `bams_archive_audit_log` - 审计日志表

**设计要点**:
- 记录所有关键操作（CREATE, UPDATE, DELETE, RESTORE, PERMANENT_DELETE, VERSION_UPLOAD, DOWNLOAD, VIEW, EXPORT）
- 元数据修改时，记录字段级别的变更（old_value, new_value）
- `change_detail` 使用 JSON 格式存储复杂变更
- 高频写入场景，优化索引

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `log_id` | BIGINT | - | PK, AI | - | 日志主键 ID |
| `archive_id` | BIGINT | - | - | NULL | 档案 ID（可为 NULL，如查询操作） |
| `archive_number` | VARCHAR | 100 | - | NULL | 档案编号（冗余，便于查询） |
| **操作信息** |
| `operation_type` | VARCHAR | 50 | NOT NULL | - | 操作类型（枚举） |
| `operation_module` | VARCHAR | 50 | - | NULL | 操作模块（metadata/file/version） |
| **变更详情** |
| `field_name` | VARCHAR | 100 | - | NULL | 修改的字段名（如 title, description） |
| `old_value` | TEXT | - | - | NULL | 修改前的值 |
| `new_value` | TEXT | - | - | NULL | 修改后的值 |
| `change_detail` | JSON | - | - | NULL | 完整变更详情（JSON 格式） |
| **操作人信息** |
| `operator` | VARCHAR | 64 | NOT NULL | - | 操作人用户名 |
| `operation_time` | DATETIME | - | - | NOW() | 操作时间 |
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
INDEX idx_operation_type (operation_type)
INDEX idx_operator (operator)
INDEX idx_operation_time (operation_time)
-- 注意：archive_number 不建索引（低频查询）
```

**变更详情 JSON 示例**:
```json
// UPDATE 操作示例（元数据修改）
{
  "fields": [
    {
      "field": "title",
      "old": "公交站台施工图",
      "new": "中山路公交站台施工图纸"
    },
    {
      "field": "description",
      "old": "施工图纸",
      "new": "中山路公交站台的详细施工图纸，包含结构设计和材料规格"
    }
  ],
  "operator_role": "档案员"
}

// VERSION_UPLOAD 操作示例
{
  "operation": "VERSION_UPLOAD",
  "version_number": "V2.0",
  "file_name": "施工图纸_修订版.pdf",
  "file_size": 5242880,
  "operator_role": "档案员",
  "remark": "修正尺寸标注"
}
```

---

#### 表 4: `bams_tag_dictionary` - 标签字典表

**设计要点**:
- 管理员维护的全局标签库
- `tag_name` 必须唯一
- `usage_count` 记录标签使用频率（用于推荐排序）
- **移除标签分类字段**（tag_category）
- AI 推荐标签时，从此表匹配（待对接 AI 服务）

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|-------|------|------|------|-------|------|
| `tag_id` | BIGINT | - | PK, AI | - | 标签主键 ID |
| `tag_name` | VARCHAR | 50 | NOT NULL, UK | - | 标签名称（唯一） |
| `usage_count` | INT | - | - | 0 | 使用次数（每次关联 +1） |
| `status` | CHAR | 1 | - | '0' | 状态（0=正常, 1=停用） |
| **审计字段** |
| `create_by` | VARCHAR | 64 | - | NULL | 创建人 |
| `create_time` | DATETIME | - | - | NOW() | 创建时间 |

**索引设计**:
```sql
PRIMARY KEY (tag_id)
UNIQUE KEY uk_tag_name (tag_name)
INDEX idx_usage_count (usage_count DESC)  -- 用于热门标签排序
```

**初始数据示例**:
```sql
INSERT INTO bams_tag_dictionary (tag_name) VALUES
('施工图纸'),
('设计方案'),
('验收报告'),
('质量检测'),
('安全资料'),
('钢结构'),
('混凝土'),
('合同协议');
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

**档案状态 (status)**:
```
0 - 正常（已入库）
1 - 草稿（未提交）
```

**文件类型 (file_type)**:
```
PDF - 固定值，系统仅支持 PDF 格式
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
      "archiveNumber": "PRJ001-0001",
      "title": "中山路公交站台施工图纸",
      "projectCode": "PRJ001",
      "projectName": "中山路公交站台建设项目",
      "stage": "设计",
      "currentVersion": "V2.0",
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
    "archiveNumber": "PRJ001-0001",
    "title": "中山路公交站台施工图纸",
    "projectId": 1,
    "projectCode": "PRJ001",
    "projectName": "中山路公交站台建设项目",
    "stage": "设计",
    "fileDate": "2024-01-15",
    "fileType": "PDF",
    "fileSize": 5242880,
    "description": "中山路公交站台的详细施工图纸...",
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
  "fileDate": "2024-01-15",
  "description": "中山路公交站台的详细施工图纸",
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
    "archiveNumber": "PRJ001-0001"
  }
}
```

**业务逻辑**:
1. 验证必填字段（title, projectId, stage）
2. 自动生成档号（`generateArchiveNumber()`）
3. 插入 `bams_archive` 表
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
  "description": "更新后的描述...",
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
2. 更新 `bams_archive` 表
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
| `file` | file | 是 | 上传的文件（仅支持 PDF） |
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
    "fileHash": "sha256_hash_value"
  }
}
```

**业务逻辑**:
1. 验证文件格式（仅 PDF）
2. 保存文件到存储路径（本地 / MinIO）
3. 计算文件 SHA-256 哈希值（去重检测）
4. 插入 `bams_archive_version` 表（`version_number=V1.0`, `is_current=1`）
5. 更新 `bams_archive` 表（`current_version`, `version_count`, `file_size`, `file_type`）
6. 记录审计日志（operation_type=VERSION_UPLOAD）

---

##### 2.2 上传新版本

**接口路径**: `POST /archive/{archiveId}/versions/upload`

**权限标识**: `archive:search:edit`

**请求方式**: `multipart/form-data`

**请求参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| `file` | file | 是 | 新版本文件（仅支持 PDF） |
| `versionRemark` | string | 是 | 版本更新说明 |

**响应示例**: 同 2.1

**业务逻辑**:
1. 验证文件格式（仅 PDF）
2. 查询当前版本号（如 V2.0）
3. 生成新版本号（V3.0）
4. 将旧版本的 `is_current` 设为 '0'
5. 插入新版本记录（`is_current=1`）
6. 更新 `bams_archive` 表（`current_version`, `version_count++`）
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

**响应**: 文件流（Content-Type: application/pdf）

**业务逻辑**:
1. 验证权限
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
   OR description LIKE '%keyword%')
AND project_code = 'PRJ001'
AND stage = '设计'
AND JSON_CONTAINS(tags, '["施工图纸"]')
AND file_date BETWEEN '2024-01-01' AND '2024-12-31'
AND del_flag = '0'
```

**说明**: 移除了全文索引（`ocr_content`），使用基础模糊查询

---

#### 模块 4: 辅助功能

##### 4.1 AI 生成摘要和标签（待对接）

**接口路径**: `POST /archive/ai/suggest`

**权限标识**: `archive:entry:add`

**状态**: **待对接 AI 服务**

**请求体**:
```json
{
  "content": "文档内容（暂时由前端提取 PDF 文本）",
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

**实现说明**: 预留接口，后续对接通义千问/文心一言

---

##### 4.2 获取标签字典

**接口路径**: `GET /archive/tags`

**权限标识**: 无（公开接口）

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
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
      "usageCount": 120
    },
    {
      "tagId": 2,
      "tagName": "设计方案",
      "usageCount": 95
    }
  ]
}
```

---

##### 4.3 获取操作日志

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
      "logId": 124,
      "operationType": "UPDATE",
      "operationModule": "metadata",
      "fieldName": "title",
      "oldValue": "施工图纸",
      "newValue": "中山路公交站台施工图纸",
      "operator": "李四",
      "operationTime": "2024-01-26 09:00:00",
      "ipAddress": "192.168.1.100"
    },
    {
      "logId": 123,
      "operationType": "VERSION_UPLOAD",
      "operationModule": "file",
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

##### 4.4 批量导出

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
  fileDate: Date;             // 文件日期
  description: string;        // 档案描述
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
  description: string;        // 档案描述
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
  tags: string[];             // 标签数组（多选）
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

  // 档案属性
  fileDate: Date;
  archivalDate: Date;
  fileType: string;
  fileSize: long;

  // 内容描述
  description: string;
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
2. 前端: 上传文件（PDF）
3. 后端: POST /archive/upload
   ├─ 验证文件格式（仅 PDF）
   ├─ 保存文件到存储路径
   ├─ 计算文件哈希值
   ├─ 插入 bams_archive_version (V1.0, is_current=1)
   └─ 返回 versionId, filePath

【步骤 2：元数据录入】（可选：AI 辅助，待对接）
4. 前端: 手动填写或使用 AI 建议
5. 前端: 显示元数据表单，用户编辑

【步骤 3：确认入库】
6. 前端: 提交全部元数据
7. 后端: POST /archive
   ├─ 生成档号（generateArchiveNumber）
   ├─ 插入 bams_archive
   ├─ 关联 versionId
   ├─ 记录审计日志（CREATE）
   └─ 返回 archiveId, archiveNumber
8. 前端: 显示"入库成功！档号：XXX"
```

---

### 4.2 版本上传流程

```
【前提】档案已存在，需要上传新版本

前端 → 后端业务逻辑

1. 前端: 在详情页点击"上传新版本"
2. 前端: 选择文件（PDF） + 填写版本说明
3. 前端: POST /archive/{archiveId}/versions/upload
4. 后端:
   ├─ 验证文件格式（仅 PDF）
   ├─ 查询当前版本号（如 V2.0）
   ├─ 生成新版本号（V3.0）
   ├─ 保存文件到存储路径
   ├─ 更新旧版本：SET is_current='0' WHERE archive_id=X AND is_current='1'
   ├─ 插入新版本记录（V3.0, is_current='1'）
   ├─ 更新 bams_archive：
   │   ├─ current_version = 'V3.0'
   │   ├─ version_count = version_count + 1
   │   └─ file_size = 新文件大小
   └─ 记录审计日志（VERSION_UPLOAD）
5. 前端: 显示"新版本上传成功！版本号：V3.0"
6. 前端: 刷新版本历史列表
```

---

### 4.3 全文检索流程

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
   │   SELECT * FROM bams_archive
   │   WHERE (
   │     title LIKE '%公交站台%'
   │     OR title LIKE '%施工图纸%'
   │     OR description LIKE '%公交站台%'
   │     OR description LIKE '%施工图纸%'
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

**说明**: 简化版本不使用全文索引，改用基础 LIKE 查询

---

### 4.4 元数据修改审计流程

```
【前提】用户修改档案元数据（如题名、描述）

前端 → 后端业务逻辑

1. 前端: 在详情页点击"编辑"
2. 前端: 修改字段（title, description）
3. 前端: PUT /archive/{archiveId}
4. 后端:
   ├─ 查询修改前的数据（oldArchive）
   ├─ 执行更新操作
   ├─ 对比每个字段：
   │   ├─ title: "施工图纸" → "中山路公交站台施工图纸"
   │   └─ description: "施工图纸" → "中山路公交站台的详细施工图纸，包含结构设计和材料规格"
   ├─ 记录审计日志（每个字段一条）：
   │   INSERT INTO bams_archive_audit_log (
   │     archive_id, operation_type='UPDATE',
   │     operation_module='metadata',
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
 * 档号生成规则：{项目编号}-{流水号}
 * 示例：PRJ001-0001
 */
public String generateArchiveNumber(String projectCode) {
    // 1. 查询该项目下的最大流水号
    int maxSeq = archiveMapper.getMaxSequenceByProject(projectCode);

    // 2. 流水号 +1
    int nextSeq = maxSeq + 1;

    // 3. 格式化为 4 位数字（不足补 0）
    String seqStr = String.format("%04d", nextSeq);

    // 4. 拼接档号
    return projectCode + "-" + seqStr;
}
```

**并发安全**: 使用 Redis 分布式锁或数据库悲观锁

```java
// Redis 分布式锁示例
public String generateArchiveNumberWithLock(String projectCode) {
    String lockKey = "archive:number:lock:" + projectCode;
    RLock lock = redissonClient.getLock(lockKey);

    try {
        // 尝试获取锁，最多等待 3 秒，锁定 5 秒
        if (lock.tryLock(3, 5, TimeUnit.SECONDS)) {
            return generateArchiveNumber(projectCode);
        } else {
            throw new ServiceException("系统繁忙，请稍后重试");
        }
    } catch (InterruptedException e) {
        throw new ServiceException("档号生成失败");
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

---

### 5.2 OCR 处理（待对接）

**预留设计**:
```java
/**
 * OCR 处理接口（待对接百度 OCR API）
 */
@Async
public void processOcr(Long versionId, String filePath) {
    // TODO: 待对接外部 OCR 服务
    // 1. 调用 OCR 引擎（百度 OCR API）
    // 2. 保存 OCR 结果到 version 表或独立存储
    // 3. 更新处理状态
}
```

**说明**: 当前版本移除 OCR 相关字段，后续对接时可通过独立表或缓存存储 OCR 结果

---

### 5.3 文件存储策略

**本地存储**:
```
/data/archives/
  ├── 2024/
  │   ├── 01/
  │   │   ├── 20/
  │   │   │   ├── abc123.pdf       (文件名使用 UUID)
  │   │   │   └── def456.pdf
```

**MinIO 对象存储** (生产环境推荐):
```
Bucket: archives
Object Key: 2024/01/20/abc123.pdf
Public URL: https://minio.example.com/archives/2024/01/20/abc123.pdf
```

**文件上传工具类**:
```java
/**
 * 文件存储工具类
 */
@Component
public class FileStorageUtil {

    @Value("${file.upload.path}")
    private String uploadPath;

    /**
     * 保存文件并返回存储路径
     */
    public String saveFile(MultipartFile file) throws IOException {
        // 1. 生成存储路径（按日期分层）
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String dirPath = uploadPath + "/" + datePath;

        // 2. 创建目录
        File dir = new File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 3. 生成文件名（UUID）
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;

        // 4. 保存文件
        String fullPath = dirPath + "/" + filename;
        file.transferTo(new File(fullPath));

        // 5. 返回相对路径
        return datePath + "/" + filename;
    }

    /**
     * 计算文件哈希值
     */
    public String calculateFileHash(MultipartFile file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(file.getBytes());
        return Hex.encodeHexString(hash);
    }
}
```

---

### 5.4 权限控制实现

**基于注解的权限验证**:
```java
@PreAuthorize("@ss.hasPermi('archive:search:query')")
public List<BamsArchive> selectArchiveList(BamsArchive archive) { ... }

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

### 5.5 数据一致性维护

**不使用数据库外键的原因**:
1. 提高性能（避免外键检查开销）
2. 方便分库分表
3. 灵活的删除策略

**应用层维护关联示例**:
```java
/**
 * 删除档案时，级联删除版本和日志
 */
@Transactional
public int deleteArchive(Long archiveId) {
    // 1. 逻辑删除档案
    archiveMapper.updateDelFlag(archiveId, '1');

    // 2. 记录审计日志
    auditLogService.recordLog(archiveId, "DELETE");

    return 1;
}

/**
 * 彻底删除档案时，手动删除关联数据
 */
@Transactional
public int permanentDeleteArchive(Long archiveId) {
    // 1. 删除所有版本记录
    versionMapper.deleteByArchiveId(archiveId);

    // 2. 删除审计日志
    auditLogMapper.deleteByArchiveId(archiveId);

    // 3. 删除档案主记录
    archiveMapper.deleteById(archiveId);

    return 1;
}
```

---

## 六、开发检查清单

### 6.1 数据库开发

- [ ] 创建所有表（4 张核心表）
- [ ] 创建唯一约束和索引
- [ ] 插入标签字典初始数据
- [ ] 插入菜单权限数据
- [ ] 编写档号生成 SQL 查询
- [ ] 编写统计查询 SQL

---

### 6.2 后端开发

**实体类 (Domain)**:
- [ ] BamsArchive.java
- [ ] BamsArchiveVersion.java
- [ ] BamsArchiveAuditLog.java
- [ ] BamsTagDictionary.java

**Mapper 层**:
- [ ] BamsArchiveMapper.java + XML
- [ ] BamsArchiveVersionMapper.java + XML
- [ ] BamsArchiveAuditLogMapper.java + XML
- [ ] BamsTagDictionaryMapper.java + XML

**Service 层**:
- [ ] IBamsArchiveService.java + Impl
- [ ] IBamsArchiveVersionService.java + Impl
- [ ] IBamsArchiveAuditLogService.java + Impl
- [ ] IBamsTagDictionaryService.java + Impl
- [ ] IOcrService.java + Impl（待对接）
- [ ] IAiAssistantService.java + Impl（待对接）

**Controller 层**:
- [ ] BamsArchiveController.java（档案 CRUD）
- [ ] BamsArchiveSearchController.java（检索）
- [ ] BamsArchiveFileController.java（文件上传下载）
- [ ] BamsTagDictionaryController.java（标签管理）

**工具类**:
- [ ] ArchiveNumberGenerator.java（档号生成）
- [ ] FileStorageUtil.java（文件存储）

---

### 6.3 前后端联调

- [ ] 档案列表查询
- [ ] 档案详情查看
- [ ] 档案创建（含文件上传）
- [ ] 档案元数据修改
- [ ] 版本上传
- [ ] 版本历史查询
- [ ] 文件下载
- [ ] 关键词检索
- [ ] 逻辑删除与恢复
- [ ] 操作日志查询
- [ ] 标签字典查询
- [ ] 统计数据查询

---

## 七、附录

### 7.1 数据库脚本位置

```
/sql/archive_system.sql    - 完整建表脚本 + 初始数据
```

### 7.2 相关文档

- [后端实现详细方案](./archive-backend-design.md)
- [若依框架文档](http://doc.ruoyi.vip)

### 7.3 版本变更记录

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| V2.0.1 | 2025-11-19 | 恢复元数据修改审计日志功能 |
| V2.0 | 2025-11-19 | 简化表结构，移除分类/密级/保管期限/OCR内容，调整档号规则 |
| V1.0 | 2025-11-18 | 初始版本 |

---

**文档维护**: 本文档作为代码开发的蓝图，请在开发过程中及时更新。
