# 档案管理系统 - 后端实现方案

## 一、方案概述

### 1.1 技术栈
- **后端框架**: Spring Boot 3.3.0 + JDK 17
- **ORM 框架**: MyBatis + MyBatis-Plus（可选）
- **数据库**: MySQL 8.0+
- **文件存储**: 本地存储 + MinIO（可选，用于生产环境）
- **OCR 引擎**: Tesseract OCR / 百度 OCR API / 阿里云 OCR API
- **AI 集成**: OpenAI API / 通义千问 / 文心一言
- **全文检索**: MySQL 全文索引 / Elasticsearch（可选）
- **缓存**: Redis（用于文件上传进度、OCR 队列等）

### 1.2 架构原则
- **RBAC 权限模型**: 基于若依框架的权限体系，结合档案员、查阅员角色
- **数据溯源**: 所有操作记录审计日志，版本控制不可篡改
- **逻辑删除**: 数据安全删除，支持回收站机制
- **项目兼容**: 预留项目管理接口，为未来扩展做准备

---

## 二、数据库设计

### 2.1 核心表结构

#### (1) 档案主表 - `ams_archive`
存储档案的核心元数据信息。

```sql
CREATE TABLE `ams_archive` (
  `archive_id` bigint NOT NULL AUTO_INCREMENT COMMENT '档案ID（主键）',
  `archive_number` varchar(100) NOT NULL COMMENT '档案编号（唯一，自动生成）',
  `title` varchar(500) NOT NULL COMMENT '档案题名',
  `project_id` bigint NOT NULL COMMENT '所属项目ID（外键关联 bams_project）',
  `project_code` varchar(50) DEFAULT NULL COMMENT '项目编号（冗余字段，便于查询）',
  `project_name` varchar(200) DEFAULT NULL COMMENT '项目名称（冗余字段）',
  `stage` varchar(50) NOT NULL COMMENT '建设阶段（立项/设计/施工/验收）',
  `category_id` bigint DEFAULT NULL COMMENT '档案分类ID（关联分类树）',
  `category_path` varchar(500) DEFAULT NULL COMMENT '分类路径（如：/文书/技术/施工图纸）',

  -- 时间相关
  `file_date` date DEFAULT NULL COMMENT '文件日期',
  `archival_date` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '归档日期',

  -- 档案属性
  `retention_period` varchar(20) DEFAULT '30年' COMMENT '保管期限（10年/30年/永久）',
  `secret_level` varchar(20) DEFAULT '普通' COMMENT '密级（普通/内部/机密/绝密）',
  `file_type` varchar(50) DEFAULT NULL COMMENT '文件类型（PDF/Word/Excel/Image）',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小（字节）',

  -- 内容描述
  `description` text COMMENT '档案描述',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词（逗号分隔）',
  `tags` varchar(500) DEFAULT NULL COMMENT '标签（JSON 数组）',
  `summary` text COMMENT 'AI 生成的摘要',
  `ocr_content` longtext COMMENT 'OCR 识别的全文内容（用于全文检索）',

  -- 版本控制
  `current_version` varchar(20) DEFAULT 'V1.0' COMMENT '当前版本号',
  `version_count` int DEFAULT 1 COMMENT '总版本数',

  -- 状态控制
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1草稿 2审核中）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0存在 1逻辑删除）',

  -- 审计字段
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',

  PRIMARY KEY (`archive_id`),
  UNIQUE KEY `uk_archive_number` (`archive_number`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_project_code` (`project_code`),
  KEY `idx_stage` (`stage`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_del_flag` (`del_flag`),
  KEY `idx_create_time` (`create_time`),
  FULLTEXT KEY `ft_ocr_content` (`ocr_content`) WITH PARSER ngram COMMENT '全文索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='档案主表';
```

#### (2) 档案文件版本表 - `ams_archive_version`
存储档案的历史版本文件信息。

```sql
CREATE TABLE `ams_archive_version` (
  `version_id` bigint NOT NULL AUTO_INCREMENT COMMENT '版本ID（主键）',
  `archive_id` bigint NOT NULL COMMENT '档案ID（外键）',
  `version_number` varchar(20) NOT NULL COMMENT '版本号（V1.0, V2.0...）',
  `file_name` varchar(255) NOT NULL COMMENT '原始文件名',
  `file_path` varchar(500) NOT NULL COMMENT '文件存储路径',
  `file_type` varchar(50) DEFAULT NULL COMMENT '文件类型',
  `file_size` bigint DEFAULT NULL COMMENT '文件大小（字节）',
  `file_hash` varchar(64) DEFAULT NULL COMMENT '文件哈希值（SHA-256，用于去重）',
  `is_current` char(1) DEFAULT '0' COMMENT '是否当前版本（0否 1是）',

  -- OCR 相关
  `ocr_status` char(1) DEFAULT '0' COMMENT 'OCR 状态（0未处理 1处理中 2已完成 3失败）',
  `ocr_content` longtext COMMENT '该版本的 OCR 内容',
  `ocr_error` varchar(500) DEFAULT NULL COMMENT 'OCR 错误信息',

  -- 版本说明
  `version_remark` varchar(500) DEFAULT NULL COMMENT '版本更新说明',

  -- 审计字段
  `upload_by` varchar(64) DEFAULT NULL COMMENT '上传者',
  `upload_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',

  PRIMARY KEY (`version_id`),
  UNIQUE KEY `uk_archive_version` (`archive_id`, `version_number`),
  KEY `idx_archive_id` (`archive_id`),
  KEY `idx_is_current` (`is_current`),
  CONSTRAINT `fk_version_archive` FOREIGN KEY (`archive_id`) REFERENCES `ams_archive` (`archive_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='档案文件版本表';
```

#### (3) 档案操作日志表 - `ams_archive_audit_log`
记录所有档案操作的审计日志（增删改查）。

```sql
CREATE TABLE `ams_archive_audit_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `archive_id` bigint DEFAULT NULL COMMENT '档案ID',
  `archive_number` varchar(100) DEFAULT NULL COMMENT '档案编号（冗余）',
  `operation_type` varchar(50) NOT NULL COMMENT '操作类型（CREATE/UPDATE/DELETE/VIEW/DOWNLOAD/RESTORE）',
  `operation_module` varchar(50) DEFAULT NULL COMMENT '操作模块（metadata/file/version）',

  -- 变更详情
  `field_name` varchar(100) DEFAULT NULL COMMENT '修改字段名',
  `old_value` text COMMENT '修改前的值',
  `new_value` text COMMENT '修改后的值',
  `change_detail` text COMMENT '变更详情（JSON 格式）',

  -- 操作信息
  `operator` varchar(64) NOT NULL COMMENT '操作人',
  `operation_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `ip_address` varchar(128) DEFAULT NULL COMMENT '操作IP',
  `user_agent` varchar(500) DEFAULT NULL COMMENT '用户代理',

  PRIMARY KEY (`log_id`),
  KEY `idx_archive_id` (`archive_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_operation_time` (`operation_time`),
  KEY `idx_operator` (`operator`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='档案操作审计日志表';
```

#### (4) 档案分类表 - `ams_archive_category`
树状结构的档案分类体系。

```sql
CREATE TABLE `ams_archive_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` bigint DEFAULT 0 COMMENT '父分类ID（0表示根节点）',
  `category_code` varchar(50) DEFAULT NULL COMMENT '分类编码（用于生成档号）',
  `category_name` varchar(100) NOT NULL COMMENT '分类名称',
  `category_path` varchar(500) DEFAULT NULL COMMENT '分类路径（/父/子）',
  `order_num` int DEFAULT 0 COMMENT '显示顺序',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`category_id`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='档案分类表';
```

#### (5) 系统标签字典表 - `ams_tag_dictionary`
管理员维护的全局标签字典。

```sql
CREATE TABLE `ams_tag_dictionary` (
  `tag_id` bigint NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `tag_name` varchar(50) NOT NULL COMMENT '标签名称',
  `tag_category` varchar(50) DEFAULT NULL COMMENT '标签分类（技术/管理/质量等）',
  `usage_count` int DEFAULT 0 COMMENT '使用次数',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `create_by` varchar(64) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `uk_tag_name` (`tag_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统标签字典表';
```

#### (6) 档案统计视图（可选）
用于可视化驾驶舱的快速查询。

```sql
CREATE VIEW `v_archive_statistics` AS
SELECT
    p.project_id,
    p.project_code,
    p.project_name,
    p.latitude,
    p.longitude,
    COUNT(a.archive_id) AS total_archives,
    SUM(CASE WHEN a.del_flag = '0' THEN 1 ELSE 0 END) AS active_archives,
    SUM(CASE WHEN a.del_flag = '1' THEN 1 ELSE 0 END) AS deleted_archives,
    p.total_required_files,
    p.actual_archived_files,
    p.completeness_rate
FROM bams_project p
LEFT JOIN ams_archive a ON p.project_id = a.project_id
GROUP BY p.project_id;
```

---

## 三、后端架构设计

### 3.1 模块结构

```
ruoyi-system/
└── src/main/java/com/ruoyi/system/
    ├── domain/              # 实体类
    │   ├── AmsArchive.java
    │   ├── AmsArchiveVersion.java
    │   ├── AmsArchiveAuditLog.java
    │   ├── AmsArchiveCategory.java
    │   └── AmsTagDictionary.java
    │
    ├── domain/vo/           # 视图对象（返回给前端）
    │   ├── ArchiveDetailVo.java        # 档案详情（包含版本和日志）
    │   ├── ArchiveListVo.java          # 档案列表
    │   ├── ArchiveStatisticsVo.java    # 档案统计
    │   └── VersionHistoryVo.java       # 版本历史
    │
    ├── domain/dto/          # 数据传输对象（前端提交）
    │   ├── ArchiveCreateDto.java       # 档案创建请求
    │   ├── ArchiveUpdateDto.java       # 档案更新请求
    │   ├── ArchiveSearchDto.java       # 档案检索请求
    │   └── VersionUploadDto.java       # 版本上传请求
    │
    ├── mapper/              # MyBatis Mapper
    │   ├── AmsArchiveMapper.java
    │   ├── AmsArchiveVersionMapper.java
    │   ├── AmsArchiveAuditLogMapper.java
    │   ├── AmsArchiveCategoryMapper.java
    │   └── AmsTagDictionaryMapper.java
    │
    ├── service/             # 服务接口
    │   ├── IAmsArchiveService.java
    │   ├── IAmsArchiveVersionService.java
    │   ├── IAmsArchiveAuditLogService.java
    │   ├── IAmsArchiveCategoryService.java
    │   ├── IAmsTagDictionaryService.java
    │   ├── IOcrService.java            # OCR 服务
    │   └── IAiAssistantService.java    # AI 辅助服务
    │
    ├── service/impl/        # 服务实现
    │   ├── AmsArchiveServiceImpl.java
    │   ├── AmsArchiveVersionServiceImpl.java
    │   ├── AmsArchiveAuditLogServiceImpl.java
    │   ├── AmsArchiveCategoryServiceImpl.java
    │   ├── AmsTagDictionaryServiceImpl.java
    │   ├── OcrServiceImpl.java
    │   └── AiAssistantServiceImpl.java
    │
    └── utils/               # 工具类
        ├── ArchiveNumberGenerator.java  # 档号生成器
        └── FileStorageUtil.java         # 文件存储工具

ruoyi-admin/
└── src/main/java/com/ruoyi/web/controller/
    └── archive/
        ├── AmsArchiveController.java       # 档案 CRUD
        ├── AmsArchiveSearchController.java # 档案检索
        └── AmsArchiveCategoryController.java # 分类管理
```

---

## 四、核心功能实现

### 4.1 档案采集与著录

#### 4.1.1 文件上传与 OCR

**流程**:
1. 前端上传文件 → 后端保存到临时目录
2. 异步触发 OCR 识别任务（使用消息队列或线程池）
3. OCR 完成后，将识别文本保存到 `ocr_content` 字段
4. 更新 OCR 状态，通知前端

**核心代码（伪代码）**:
```java
@Service
public class OcrServiceImpl implements IOcrService {

    @Async
    public void processOcr(Long versionId, String filePath) {
        try {
            // 更新状态为"处理中"
            updateOcrStatus(versionId, "1");

            // 调用 OCR 引擎
            String ocrText = callOcrEngine(filePath);

            // 保存 OCR 结果
            saveOcrContent(versionId, ocrText);

            // 更新状态为"已完成"
            updateOcrStatus(versionId, "2");
        } catch (Exception e) {
            // 更新状态为"失败"
            updateOcrStatus(versionId, "3", e.getMessage());
        }
    }

    private String callOcrEngine(String filePath) {
        // 支持多种 OCR 引擎
        // 1. Tesseract OCR（开源免费）
        // 2. 百度 OCR API
        // 3. 阿里云 OCR API
        // 根据配置文件选择
    }
}
```

#### 4.1.2 AI 辅助著录

**功能**:
- 根据 OCR 内容自动生成摘要
- 自动推荐标签

**实现**:
```java
@Service
public class AiAssistantServiceImpl implements IAiAssistantService {

    public AiSuggestionVo generateSuggestions(String ocrContent) {
        AiSuggestionVo vo = new AiSuggestionVo();

        // 1. 生成摘要（调用 LLM API）
        String summary = callLlmApi(
            "请为以下文档生成一段100字以内的摘要：\n" + ocrContent
        );
        vo.setSummary(summary);

        // 2. 提取关键词并匹配标签字典
        List<String> keywords = extractKeywords(ocrContent);
        List<String> suggestedTags = matchTagDictionary(keywords);
        vo.setTags(suggestedTags);

        return vo;
    }

    private String callLlmApi(String prompt) {
        // 支持多种 LLM
        // 1. OpenAI GPT
        // 2. 通义千问
        // 3. 文心一言
    }
}
```

#### 4.1.3 档号自动生成

**规则**: `项目编号-建设阶段-分类编码-流水号`
- 示例: `PRJ001-设计-TU-0001`

**实现**:
```java
@Component
public class ArchiveNumberGenerator {

    public String generate(String projectCode, String stage, String categoryCode) {
        // 查询该项目该阶段该分类下的最大流水号
        int maxSeq = archiveMapper.getMaxSequence(projectCode, stage, categoryCode);
        int nextSeq = maxSeq + 1;

        // 格式化：PRJ001-设计-TU-0001
        return String.format("%s-%s-%s-%04d",
            projectCode, stage, categoryCode, nextSeq);
    }
}
```

---

### 4.2 档案检索与利用

#### 4.2.1 全文检索

**方案 1: MySQL 全文索引**（适合中小规模）
```sql
-- 查询语句
SELECT * FROM ams_archive
WHERE MATCH(ocr_content) AGAINST('公交站台 施工图纸' IN NATURAL LANGUAGE MODE)
AND del_flag = '0';
```

**方案 2: Elasticsearch**（适合大规模）
- 将 OCR 内容同步到 ES
- 支持更复杂的分词和高亮显示

#### 4.2.2 高级组合检索

**SearchDto 示例**:
```java
public class ArchiveSearchDto {
    private String keyword;           // 关键词（全文检索）
    private Long projectId;            // 项目ID
    private String stage;              // 建设阶段
    private List<String> tags;         // 标签（多选）
    private String secretLevel;        // 密级
    private Date fileStartDate;        // 文件日期范围（开始）
    private Date fileEndDate;          // 文件日期范围（结束）
    private Boolean showDeleted;       // 是否显示已删除
}
```

**MyBatis 动态 SQL**:
```xml
<select id="searchArchives" parameterType="ArchiveSearchDto" resultType="ArchiveListVo">
    SELECT * FROM ams_archive a
    WHERE a.del_flag = #{showDeleted ? '1' : '0'}

    <if test="keyword != null and keyword != ''">
        AND (
            a.title LIKE CONCAT('%', #{keyword}, '%')
            OR a.archive_number LIKE CONCAT('%', #{keyword}, '%')
            OR MATCH(a.ocr_content) AGAINST(#{keyword})
        )
    </if>

    <if test="projectId != null">
        AND a.project_id = #{projectId}
    </if>

    <if test="stage != null and stage != ''">
        AND a.stage = #{stage}
    </if>

    <if test="tags != null and tags.size() > 0">
        AND EXISTS (
            SELECT 1 FROM JSON_TABLE(a.tags, '$[*]' COLUMNS(tag VARCHAR(50) PATH '$')) AS t
            WHERE t.tag IN
            <foreach collection="tags" item="tag" open="(" separator="," close=")">
                #{tag}
            </foreach>
        )
    </if>

    ORDER BY a.create_time DESC
</select>
```

---

### 4.3 修改与溯源

#### 4.3.1 元数据修改审计

**使用 AOP 拦截更新操作**:
```java
@Aspect
@Component
public class ArchiveAuditAspect {

    @Around("execution(* com.ruoyi.system.service.IAmsArchiveService.update*(..))")
    public Object auditUpdate(ProceedingJoinPoint joinPoint) throws Throwable {
        AmsArchive newArchive = (AmsArchive) joinPoint.getArgs()[0];

        // 查询修改前的数据
        AmsArchive oldArchive = archiveService.selectById(newArchive.getArchiveId());

        // 执行更新
        Object result = joinPoint.proceed();

        // 记录变更日志
        logChanges(oldArchive, newArchive);

        return result;
    }

    private void logChanges(AmsArchive oldData, AmsArchive newData) {
        // 对比每个字段，记录到审计日志
        if (!Objects.equals(oldData.getTitle(), newData.getTitle())) {
            auditLogService.insert(new AmsArchiveAuditLog()
                .setArchiveId(newData.getArchiveId())
                .setOperationType("UPDATE")
                .setFieldName("title")
                .setOldValue(oldData.getTitle())
                .setNewValue(newData.getTitle())
            );
        }
        // ... 其他字段同理
    }
}
```

#### 4.3.2 文件版本控制

**上传新版本流程**:
1. 将当前版本的 `is_current` 设为 `0`
2. 插入新版本记录，`is_current` 设为 `1`
3. 更新档案主表的 `current_version` 和 `version_count`
4. 异步触发新版本的 OCR 识别

```java
@Transactional
public void uploadNewVersion(VersionUploadDto dto, MultipartFile file) {
    // 1. 将旧版本标记为非当前
    archiveVersionMapper.updateCurrentFlag(dto.getArchiveId(), false);

    // 2. 生成新版本号
    String newVersion = generateNextVersion(dto.getArchiveId());

    // 3. 保存文件
    String filePath = fileStorageUtil.save(file);

    // 4. 插入新版本记录
    AmsArchiveVersion version = new AmsArchiveVersion();
    version.setArchiveId(dto.getArchiveId());
    version.setVersionNumber(newVersion);
    version.setFilePath(filePath);
    version.setIsCurrent("1");
    archiveVersionMapper.insert(version);

    // 5. 更新主表
    archiveMapper.updateVersion(dto.getArchiveId(), newVersion);

    // 6. 异步 OCR
    ocrService.processOcr(version.getVersionId(), filePath);
}
```

---

### 4.4 删除与回收站

#### 4.4.1 逻辑删除

```java
@PreAuthorize("hasRole('Admin')")
public int logicDelete(Long archiveId) {
    // 更新 del_flag = '1'
    AmsArchive archive = new AmsArchive();
    archive.setArchiveId(archiveId);
    archive.setDelFlag("1");

    int result = archiveMapper.updateById(archive);

    // 记录审计日志
    auditLogService.log(archiveId, "DELETE", "逻辑删除档案");

    return result;
}
```

#### 4.4.2 回收站管理

```java
// 查询回收站
public List<ArchiveListVo> listRecycleBin() {
    return archiveMapper.selectList(
        new LambdaQueryWrapper<AmsArchive>()
            .eq(AmsArchive::getDelFlag, "1")
            .orderByDesc(AmsArchive::getUpdateTime)
    );
}

// 恢复档案
@PreAuthorize("hasRole('Admin')")
public int restore(Long archiveId) {
    AmsArchive archive = new AmsArchive();
    archive.setArchiveId(archiveId);
    archive.setDelFlag("0");
    return archiveMapper.updateById(archive);
}

// 彻底删除
@PreAuthorize("hasRole('Admin')")
public int permanentDelete(Long archiveId) {
    // 1. 删除所有版本文件（物理文件）
    List<AmsArchiveVersion> versions = archiveVersionMapper.selectByArchiveId(archiveId);
    versions.forEach(v -> fileStorageUtil.delete(v.getFilePath()));

    // 2. 删除数据库记录（级联删除版本和日志）
    return archiveMapper.deleteById(archiveId);
}
```

---

## 五、API 接口设计

### 5.1 档案管理接口

| 接口路径 | 方法 | 功能 | 权限标识 |
|---------|------|------|---------|
| `/archive/list` | GET | 档案列表查询 | `archive:search:query` |
| `/archive/search` | POST | 高级检索（全文+筛选） | `archive:search:query` |
| `/archive/{id}` | GET | 档案详情 | `archive:search:detail` |
| `/archive` | POST | 创建档案 | `archive:entry:add` |
| `/archive/{id}` | PUT | 更新元数据 | `archive:search:edit` |
| `/archive/{id}` | DELETE | 逻辑删除 | `archive:search:remove` |
| `/archive/{id}/restore` | POST | 恢复档案 | `archive:search:restore` |
| `/archive/{id}/permanent` | DELETE | 彻底删除 | `archive:search:remove` |
| `/archive/recycle-bin` | GET | 回收站列表 | `archive:search:query` |

### 5.2 文件与版本接口

| 接口路径 | 方法 | 功能 | 权限标识 |
|---------|------|------|---------|
| `/archive/upload` | POST | 上传文件（支持分片） | `archive:entry:upload` |
| `/archive/{id}/download` | GET | 下载当前版本 | `archive:search:download` |
| `/archive/{id}/versions` | GET | 版本历史列表 | `archive:search:detail` |
| `/archive/{id}/versions/upload` | POST | 上传新版本 | `archive:search:edit` |
| `/archive/version/{versionId}/download` | GET | 下载指定版本 | `archive:search:download` |

### 5.3 辅助功能接口

| 接口路径 | 方法 | 功能 | 权限标识 |
|---------|------|------|---------|
| `/archive/ai/suggest` | POST | AI 生成摘要和标签 | `archive:entry:add` |
| `/archive/category/tree` | GET | 获取分类树 | - |
| `/archive/tags` | GET | 获取标签字典 | - |
| `/archive/statistics` | GET | 可视化统计数据 | - |
| `/archive/export` | POST | 批量导出 | `archive:search:export` |

---

## 六、权限控制方案

### 6.1 角色定义

在若依框架的角色管理中，预定义以下角色：

| 角色名称 | 角色标识 | 权限说明 |
|---------|---------|---------|
| 档案管理员 | `archive_admin` | 所有权限（含删除、回收站） |
| 档案员 | `archivist` | 增删改查（不含逻辑删除和回收站） |
| 查阅员 | `viewer` | 仅查看和下载 |

### 6.2 权限矩阵

| 功能 | 管理员 | 档案员 | 查阅员 |
|-----|-------|-------|-------|
| 档案检索 | ✅ | ✅ | ✅ |
| 查看详情 | ✅ | ✅ | ✅ |
| 下载文件 | ✅ | ✅ | ✅（仅最新版本） |
| 创建档案 | ✅ | ✅ | ❌ |
| 编辑元数据 | ✅ | ✅ | ❌ |
| 上传新版本 | ✅ | ✅ | ❌ |
| 逻辑删除 | ✅ | ❌ | ❌ |
| 查看回收站 | ✅ | ❌ | ❌ |
| 恢复档案 | ✅ | ❌ | ❌ |
| 彻底删除 | ✅ | ❌ | ❌ |

### 6.3 权限注解示例

```java
@RestController
@RequestMapping("/archive")
public class AmsArchiveController {

    // 任何角色都可以查询
    @PreAuthorize("hasAnyAuthority('archive:search:query')")
    @GetMapping("/list")
    public TableDataInfo list(ArchiveSearchDto dto) {
        // ...
    }

    // 仅档案员和管理员
    @PreAuthorize("hasAnyAuthority('archive:entry:add')")
    @PostMapping
    public AjaxResult create(@RequestBody ArchiveCreateDto dto) {
        // ...
    }

    // 仅管理员
    @PreAuthorize("hasRole('archive_admin')")
    @DeleteMapping("/{id}")
    public AjaxResult logicDelete(@PathVariable Long id) {
        // ...
    }
}
```

---

## 七、文件存储方案

### 7.1 本地存储（开发环境）

**配置**:
```yaml
archive:
  file:
    storage-type: local
    base-path: /data/archives
    max-file-size: 100MB
```

**目录结构**:
```
/data/archives/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── 1234567890.pdf
│   │   │   └── 1234567891.pdf
```

### 7.2 MinIO 对象存储（生产环境）

**优势**:
- 支持分布式存储
- 自动备份和容灾
- 支持 CDN 加速

**配置**:
```yaml
archive:
  file:
    storage-type: minio
    endpoint: http://minio.example.com:9000
    bucket: archives
    access-key: ${MINIO_ACCESS_KEY}
    secret-key: ${MINIO_SECRET_KEY}
```

---

## 八、OCR 与 AI 集成方案

### 8.1 OCR 引擎选择

| 方案 | 优势 | 劣势 | 适用场景 |
|-----|------|------|---------|
| Tesseract OCR | 免费开源，支持离线 | 识别率中等 | 预算有限，对准确率要求不高 |
| 百度 OCR API | 识别率高，价格便宜 | 需要联网 | 推荐方案 |
| 阿里云 OCR API | 识别率高，稳定性好 | 价格较高 | 高可用场景 |

### 8.2 AI 集成方案

**推荐**: 通义千问（阿里云）或文心一言（百度）
- 价格较 OpenAI 便宜
- 中文支持更好
- 国内访问稳定

**Prompt 示例**:
```java
String promptTemplate = """
    请分析以下档案内容，生成：
    1. 一段80-120字的摘要
    2. 3-5个关键标签（从以下标签库中选择）

    标签库：%s

    档案内容：
    %s

    请以 JSON 格式返回：
    {
      "summary": "摘要内容",
      "tags": ["标签1", "标签2", "标签3"]
    }
    """;
```

---

## 九、实施路线图

### 第一期（核心功能）
- [ ] 数据库表设计与创建
- [ ] 档案 CRUD 基础功能
- [ ] 文件上传与版本管理
- [ ] 基础检索（关键词+筛选）
- [ ] OCR 集成（百度 OCR）
- [ ] 权限控制

### 第二期（智能化）
- [ ] AI 辅助著录
- [ ] 全文检索优化（Elasticsearch）
- [ ] 可视化驾驶舱
- [ ] 档案统计报表

### 第三期（高级功能）
- [ ] MinIO 对象存储
- [ ] 文件预览（PDF/Word 在线预览）
- [ ] 移动端适配
- [ ] 批量导入导出

---

## 十、技术难点与解决方案

### 10.1 大文件上传

**问题**: 100MB+ 文件上传易超时、失败
**方案**: 分片上传 + 断点续传
- 前端使用 `Uppy.js` 或 `vue-simple-uploader`
- 后端接收分片，完成后合并

### 10.2 OCR 性能优化

**问题**: OCR 识别耗时（单文件可能 10s+）
**方案**:
- 异步处理（消息队列 RabbitMQ 或线程池）
- 前端轮询或 WebSocket 推送进度
- Redis 存储处理状态

### 10.3 全文检索性能

**问题**: MySQL 全文索引在百万级数据下性能下降
**方案**:
- 引入 Elasticsearch
- 使用 Logstash 或 Canal 同步数据

### 10.4 版本文件存储空间

**问题**: 历史版本占用大量存储空间
**方案**:
- 定期归档（超过 N 个版本后，压缩旧版本）
- 对象存储的生命周期管理（自动转为低成本存储类）

---

## 十一、总结

本方案提供了档案管理系统的完整后端实现设计，涵盖：
- ✅ 数据库设计（7 张核心表）
- ✅ 后端架构（分层清晰，符合若依规范）
- ✅ 核心功能实现（OCR、AI、版本控制、审计日志）
- ✅ API 接口设计（RESTful 风格）
- ✅ 权限控制（RBAC 模型）
- ✅ 文件存储方案（本地 + MinIO）
- ✅ OCR 与 AI 集成方案

**下一步**:
1. 创建数据库表（执行 SQL 脚本）
2. 实现实体类和 Mapper
3. 实现 Service 层核心业务逻辑
4. 实现 Controller 层 API 接口
5. 集成 OCR 和 AI 服务
6. 前后端联调
