# 项目信息维护 - 后端设计方案

## 文档信息

- **模块名称**: 项目信息维护
- **设计日期**: 2025-11-17
- **设计人员**: Rick
- **技术栈**: Spring Boot 3.3.0 + MyBatis + MySQL
- **版本**: v1.0

---

## 一、需求概述

项目信息维护模块是建筑档案管理系统（BAMS）的基础数据模块，用于维护工程项目的基本信息。项目是档案归档的必要关联实体，所有档案必须强制关联到项目。

### 1.1 功能定位

- 🎯 **档案关联基础**: 档案采集时必须关联项目编号（Project_ID）
- 📍 **GIS地图展示**: 支持在地图上展示项目的地理位置和建设状态
- 📊 **完整度统计**: 统计各项目、各建设阶段的档案完整度

### 1.2 功能范围

- ✅ 项目基本信息的增删改查
- ✅ 项目状态管理与流转
- ✅ 项目阶段模板应用
- ✅ 项目档案完整度统计
- ✅ 项目列表分页查询与导出
- 🔄 GIS地图集成（预留字段，第一期支持坐标录入）

### 1.3 核心原则

- **项目兼容性**: 在数据底层预留独立的项目实体表，为未来项目管理流程和档管一体化做准备
- **数据溯源性**: 项目信息的修改会被操作日志完整记录
- **强制关联**: 档案必须关联到项目，确保档案的组织性

---

## 二、数据库设计

### 2.1 项目信息表 (bams_project)

**表说明**: 存储项目的核心信息，作为档案归档的关联实体。

```sql
-- 项目信息表
DROP TABLE IF EXISTS `bams_project`;
CREATE TABLE `bams_project` (
  -- 主键
  `project_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '项目ID',

  -- 基本信息
  `project_code` varchar(50) NOT NULL COMMENT '项目编号',
  `project_name` varchar(200) NOT NULL COMMENT '项目名称',

  -- 项目负责人
  `project_manager` varchar(100) DEFAULT NULL COMMENT '项目负责人',

  -- GIS坐标信息（第一期支持录入，后续可集成地图选点）
  `latitude` decimal(10,6) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10,6) DEFAULT NULL COMMENT '经度',

  -- 阶段模板关联
  `template_id` bigint(20) DEFAULT NULL COMMENT '关联的阶段模板ID',
  `template_name` varchar(100) DEFAULT NULL COMMENT '阶段模板名称（冗余字段，避免模板删除后显示异常）',

  -- 档案完整度统计（定期计算更新）
  `completeness_rate` int(11) DEFAULT 0 COMMENT '档案完整度（0-100）',
  `total_required_files` int(11) DEFAULT 0 COMMENT '应归档文件总数',
  `actual_archived_files` int(11) DEFAULT 0 COMMENT '已归档文件数量',

  -- 项目描述
  `project_desc` varchar(1000) DEFAULT NULL COMMENT '项目描述',

  -- 系统字段
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0存在 2删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',

  -- 索引
  PRIMARY KEY (`project_id`),
  UNIQUE KEY `uk_project_code` (`project_code`),
  KEY `idx_project_name` (`project_name`),
  KEY `idx_template_id` (`template_id`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_del_flag` (`del_flag`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='项目信息表';
```

**字段详细说明**:

| 字段组 | 字段名 | 类型 | 必填 | 说明 |
|-------|--------|------|------|------|
| 基本信息 | project_code | varchar(50) | 是 | 项目编号，系统自动生成，全局唯一 |
| 基本信息 | project_name | varchar(200) | 是 | 项目名称 |
| 负责人 | project_manager | varchar(100) | 否 | 项目负责人姓名 |
| GIS坐标 | latitude | decimal(10,6) | 否 | 纬度（保留6位小数） |
| GIS坐标 | longitude | decimal(10,6) | 否 | 经度（保留6位小数） |
| 阶段模板 | template_id | bigint | 否 | 关联的阶段模板ID |
| 阶段模板 | template_name | varchar(100) | 否 | 阶段模板名称（冗余） |
| 完整度统计 | completeness_rate | int | 否 | 档案完整度百分比（0-100） |
| 完整度统计 | total_required_files | int | 否 | 应归档文件总数 |
| 完整度统计 | actual_archived_files | int | 否 | 已归档文件数量 |
| 其他 | project_desc | varchar(1000) | 否 | 项目描述 |

### 2.2 项目阶段实例表 (bams_project_stage)

**表说明**: 存储项目应用阶段模板后生成的具体阶段实例数据，用于档案完整度统计。

```sql
-- 项目阶段实例表（根据模板生成）
DROP TABLE IF EXISTS `bams_project_stage`;
CREATE TABLE `bams_project_stage` (
  `stage_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '阶段实例ID',
  `project_id` bigint(20) NOT NULL COMMENT '项目ID',
  `stage_name` varchar(100) NOT NULL COMMENT '阶段名称',
  `stage_order` int(11) NOT NULL COMMENT '阶段顺序',
  `required_files` varchar(1000) DEFAULT NULL COMMENT '标准文件配置（逗号分隔的dict_value）',
  `required_file_count` int(11) DEFAULT 0 COMMENT '应归档文件数量',
  `archived_file_count` int(11) DEFAULT 0 COMMENT '已归档文件数量',
  `completeness_rate` int(11) DEFAULT 0 COMMENT '完整度（0-100）',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`stage_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_stage_order` (`stage_order`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='项目阶段实例表';

-- 注意：不使用外键约束，改由应用层控制数据一致性
-- 原因：
-- 1. 系统采用逻辑删除机制，外键级联删除与逻辑删除冲突
-- 2. 避免误删除导致数据无法恢复
-- 3. 提高系统灵活性和性能
-- 4. 数据完整性由应用层业务逻辑保证
```

**⚠️ 数据完整性保证机制**：

由于不使用数据库外键约束，数据完整性由应用层业务逻辑保证：

1. **逻辑删除规则**：
   - 项目逻辑删除时，阶段数据保留不删除
   - 查询时通过 `del_flag` 过滤已删除项目
   - 恢复项目时，阶段数据自动可用

2. **物理删除规则**（如需实现）：
   - 彻底删除项目前，先删除所有关联的阶段数据
   - 使用事务保证原子性

3. **模板应用规则**：
   - 应用新模板前，先删除原有阶段数据
   - 然后插入新模板的阶段数据
   - 整个过程在事务中完成

### 2.3 ER关系图

```
bams_stage_template (阶段模板表)
        |
        | 1:N (应用模板时复制)
        ↓
bams_project (项目信息表) ←---- 主表
        |
        | 1:N (project_id)
        ↓
bams_project_stage (项目阶段实例表)
        |
        | 1:N (project_id)
        ↓
bams_archive (档案表 - 后续模块实现)
```

---

## 三、后端接口设计

### 3.1 RESTful API 接口清单

| 序号 | 接口路径 | HTTP方法 | 功能说明 | 权限标识 |
|------|---------|---------|---------|----------|
| 1 | `/bams/project/list` | GET | 分页查询项目列表 | bams:project:list |
| 2 | `/bams/project/{projectId}` | GET | 查询项目详细信息 | bams:project:query |
| 3 | `/bams/project/code/{projectCode}` | GET | 根据项目编号查询 | bams:project:query |
| 4 | `/bams/project` | POST | 新增项目（自动应用模板） | bams:project:add |
| 5 | `/bams/project` | PUT | 修改项目信息（模板变化时自动应用并刷新完整度） | bams:project:edit |
| 6 | `/bams/project/{projectIds}` | DELETE | 逻辑删除项目 | bams:project:remove |
| 7 | `/bams/project/export` | POST | 导出项目数据（Excel） | bams:project:export |
| 8 | `/bams/project/stages/{projectId}` | GET | 查询项目阶段列表 | bams:project:query |

### 3.2 核心接口详细设计

#### 3.2.1 查询项目列表

**接口**: `GET /bams/project/list`

**请求参数**:
```java
{
  "projectCode": "PRJ001",          // 项目编号（模糊查询）
  "projectName": "示例项目",         // 项目名称（模糊查询）
  "projectManager": "张三",         // 项目负责人（模糊查询）
  "params": {
    "beginTime": "2025-01-01",      // 创建时间-开始
    "endTime": "2025-12-31"         // 创建时间-结束
  },
  "pageNum": 1,                     // 页码
  "pageSize": 10                    // 每页条数
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "total": 100,
  "rows": [
    {
      "projectId": 1,
      "projectCode": "PRJ-20250117-001",
      "projectName": "XX路公交站台建设项目",
      "projectManager": "张三",
      "templateId": 1,
      "templateName": "标准工程项目模板",
      "completenessRate": 85,
      "totalRequiredFiles": 20,
      "actualArchivedFiles": 17,
      "latitude": 30.274084,
      "longitude": 120.155070,
      "createTime": "2025-01-01 10:00:00"
    }
  ]
}
```

#### 3.2.2 新增项目

**接口**: `POST /bams/project`

**请求体**:
```json
{
  "projectName": "XX路公交站台建设项目",
  "projectManager": "张三",
  "templateId": 1,
  "latitude": 30.274084,
  "longitude": 120.155070,
  "projectDesc": "这是一个公交站台建设项目",
  "remark": "备注信息"
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "新增成功",
  "data": {
    "projectId": 1,
    "projectCode": "PRJ-20250117-001"
  }
}
```

**业务逻辑**:
1. 系统自动生成项目编号（格式：`PRJ-YYYYMMDD-XXX`）
2. 如果选择了阶段模板（templateId不为空），自动应用模板生成阶段实例
3. 初始化档案完整度为0

#### 3.2.3 修改项目信息

**接口**: `PUT /bams/project`

**功能说明**: 修改项目信息，支持阶段模板的自动应用和档案完整度刷新。

**请求体**:
```json
{
  "projectId": 1,
  "projectName": "XX路公交站台建设项目（修改后）",
  "projectManager": "李四",
  "templateId": 2,
  "latitude": 30.274084,
  "longitude": 120.155070,
  "projectDesc": "项目描述已更新",
  "remark": "备注信息"
}
```

**响应数据**:
```json
{
  "code": 200,
  "msg": "修改成功"
}
```

**业务逻辑**:
1. 校验项目是否存在
2. 检测 `templateId` 是否发生变化：
   - **如果模板变化**：
     - 查询新模板的详情及明细数据
     - 删除项目原有的阶段数据
     - 从新模板复制数据到 `bams_project_stage` 表
     - 更新项目表的 `template_id` 和 `template_name`
     - **自动刷新档案完整度**：
       - 统计每个阶段的应归档文件数和已归档文件数
       - 计算完整度百分比：`(已归档 / 应归档) * 100`
       - 更新 `bams_project_stage` 和 `bams_project` 表的完整度字段
   - **如果模板未变化**：仅更新项目基本信息
3. 记录操作日志

**注意事项**:
- 模板切换是高风险操作，会删除原有阶段配置
- 建议在切换模板前提示用户确认
- 模板切换后会自动重新统计档案完整度

---

## 四、代码结构设计

### 4.1 分层架构

```
ruoyi-admin/
└── com.ruoyi.web.controller.bams/
    └── BamsProjectController.java          # Controller层：接口层

ruoyi-system/
└── com.ruoyi.system/
    ├── domain/
    │   ├── BamsProject.java                # 实体类：项目信息
    │   └── BamsProjectStage.java           # 实体类：项目阶段实例
    ├── mapper/
    │   ├── BamsProjectMapper.java          # Mapper接口
    │   └── BamsProjectStageMapper.java     # Mapper接口
    ├── service/
    │   └── IBamsProjectService.java        # Service接口
    └── service.impl/
        └── BamsProjectServiceImpl.java     # Service实现

ruoyi-system/src/main/resources/mapper/system/
├── BamsProjectMapper.xml                   # MyBatis XML映射
└── BamsProjectStageMapper.xml              # MyBatis XML映射
```

### 4.2 Domain 实体类设计

```java
package com.ruoyi.system.domain;

import java.math.BigDecimal;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 项目信息对象 bams_project
 *
 * @author Rick
 */
public class BamsProject extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 项目ID */
    private Long projectId;

    /** 项目编号 */
    @Excel(name = "项目编号")
    private String projectCode;

    /** 项目名称 */
    @Excel(name = "项目名称")
    private String projectName;

    /** 项目负责人 */
    @Excel(name = "项目负责人")
    private String projectManager;

    /** 纬度 */
    private BigDecimal latitude;

    /** 经度 */
    private BigDecimal longitude;

    /** 关联的阶段模板ID */
    private Long templateId;

    /** 阶段模板名称 */
    @Excel(name = "阶段模板")
    private String templateName;

    /** 档案完整度 */
    @Excel(name = "档案完整度(%)")
    private Integer completenessRate;

    /** 应归档文件总数 */
    private Integer totalRequiredFiles;

    /** 已归档文件数量 */
    private Integer actualArchivedFiles;

    /** 项目描述 */
    private String projectDesc;

    /** 状态 */
    private String status;

    /** 删除标志 */
    private String delFlag;

    /** 项目阶段列表 */
    private List<BamsProjectStage> stages;

    // Getter and Setter methods...

    @NotBlank(message = "项目名称不能为空")
    @Size(min = 0, max = 200, message = "项目名称不能超过200个字符")
    public String getProjectName() {
        return projectName;
    }

    // ... 其他方法省略
}
```

### 4.3 Service 接口设计

```java
package com.ruoyi.system.service;

import java.util.List;
import java.util.Map;
import com.ruoyi.system.domain.BamsProject;
import com.ruoyi.system.domain.BamsProjectStage;

/**
 * 项目信息Service接口
 *
 * @author Rick
 */
public interface IBamsProjectService
{
    /**
     * 查询项目列表
     */
    public List<BamsProject> selectProjectList(BamsProject project);

    /**
     * 根据项目ID查询项目信息
     */
    public BamsProject selectProjectById(Long projectId);

    /**
     * 根据项目编号查询项目信息
     */
    public BamsProject selectProjectByCode(String projectCode);

    /**
     * 新增项目（自动生成项目编号，自动应用阶段模板）
     */
    public int insertProject(BamsProject project);

    /**
     * 修改项目（模板变化时自动应用模板并刷新完整度）
     *
     * 业务逻辑：
     * 1. 检测 templateId 是否发生变化
     * 2. 如果模板变化：应用新模板 + 刷新档案完整度
     * 3. 如果模板未变化：仅更新基本信息
     */
    public int updateProject(BamsProject project);

    /**
     * 逻辑删除项目
     */
    public int deleteProjectByIds(Long[] projectIds);

    /**
     * 校验项目编号是否唯一
     */
    public boolean checkProjectCodeUnique(BamsProject project);

    /**
     * 查询项目的阶段列表
     */
    public List<BamsProjectStage> selectProjectStages(Long projectId);
}
```

---

## 五、核心业务逻辑

### 5.1 项目编号自动生成

**生成规则**: `XMB001`、`XMB002`、`XMB003`... (全局递增)

示例：`XMB001`

**实现逻辑**:
```java
public String generateProjectCode() {
    String prefix = "XMB";

    // 查询最大编号
    String maxCode = projectMapper.selectMaxCode();
    int sequence = 1;
    if (StringUtils.isNotEmpty(maxCode)) {
        // 提取数字部分，例如从 "XMB001" 中提取 "001"
        String seqStr = maxCode.substring(prefix.length());
        sequence = Integer.parseInt(seqStr) + 1;
    }

    return prefix + String.format("%03d", sequence);
}
```

### 5.2 修改项目信息逻辑（集成模板应用和完整度刷新）

**业务流程**:
1. 更新项目基本信息
2. 检测 `templateId` 是否发生变化
3. 如果模板变化：应用新模板 + 刷新档案完整度
4. 如果模板未变化：直接返回

**代码示例**:
```java
@Transactional
public int updateProject(BamsProject project) {
    // 1. 查询原项目信息
    BamsProject oldProject = selectProjectById(project.getProjectId());
    if (oldProject == null) {
        throw new ServiceException("项目不存在");
    }

    // 2. 检测模板是否变化
    Long oldTemplateId = oldProject.getTemplateId();
    Long newTemplateId = project.getTemplateId();
    boolean templateChanged = !Objects.equals(oldTemplateId, newTemplateId);

    // 3. 如果模板发生变化，应用新模板
    if (templateChanged && newTemplateId != null) {
        // 3.1 查询新模板
        BamsStageTemplate template = stageTemplateService.selectTemplateById(newTemplateId);
        if (template == null) {
            throw new ServiceException("阶段模板不存在");
        }

        // 3.2 查询模板明细
        List<BamsStageTemplateDetail> templateDetails =
            stageTemplateService.selectTemplateDetailsByTemplateId(newTemplateId);

        // 3.3 删除项目原有阶段数据
        projectStageMapper.deleteByProjectId(project.getProjectId());

        // 3.4 根据模板生成新的阶段数据
        List<BamsProjectStage> stages = new ArrayList<>();
        int totalRequiredFiles = 0;

        for (BamsStageTemplateDetail detail : templateDetails) {
            BamsProjectStage stage = new BamsProjectStage();
            stage.setProjectId(project.getProjectId());
            stage.setStageName(detail.getStageName());
            stage.setStageOrder(detail.getStageOrder());
            stage.setRequiredFiles(detail.getRequiredFiles());

            // 计算该阶段应归档文件数量
            int fileCount = StringUtils.isNotEmpty(detail.getRequiredFiles())
                ? detail.getRequiredFiles().split(",").length : 0;
            stage.setRequiredFileCount(fileCount);

            totalRequiredFiles += fileCount;
            stages.add(stage);
        }
        projectStageMapper.batchInsert(stages);

        // 3.5 更新项目的模板关联（冗余字段）
        project.setTemplateName(template.getTemplateName());

        // 3.6 刷新档案完整度
        refreshCompletenessAfterTemplateChange(project.getProjectId(), stages);
    }

    // 4. 更新项目基本信息
    return projectMapper.updateProject(project);
}

/**
 * 模板变化后刷新档案完整度（私有方法）
 */
private void refreshCompletenessAfterTemplateChange(Long projectId, List<BamsProjectStage> stages) {
    int totalRequired = 0;
    int totalArchived = 0;

    // 统计每个阶段的档案完整度
    for (BamsProjectStage stage : stages) {
        // 从档案表统计该项目该阶段的已归档文件数
        // TODO: 关联档案表查询（档案表实现后补充）
        int archivedCount = archiveMapper.countByProjectAndStage(
            projectId, stage.getStageName());

        stage.setArchivedFileCount(archivedCount);

        // 计算阶段完整度
        int stageCompleteness = stage.getRequiredFileCount() > 0
            ? (archivedCount * 100 / stage.getRequiredFileCount()) : 0;
        stage.setCompletenessRate(stageCompleteness);

        // 累加到项目总数
        totalRequired += stage.getRequiredFileCount();
        totalArchived += archivedCount;

        // 更新阶段记录
        projectStageMapper.updateById(stage);
    }

    // 计算项目整体完整度
    int projectCompleteness = totalRequired > 0
        ? (totalArchived * 100 / totalRequired) : 0;

    // 更新项目的完整度统计字段
    BamsProject projectUpdate = new BamsProject();
    projectUpdate.setProjectId(projectId);
    projectUpdate.setTotalRequiredFiles(totalRequired);
    projectUpdate.setActualArchivedFiles(totalArchived);
    projectUpdate.setCompletenessRate(projectCompleteness);
    projectMapper.updateProject(projectUpdate);
}
```

**关键点说明**:
- ✅ **事务性**: 整个操作在一个事务中完成，保证数据一致性
- ✅ **性能优化**: 仅当模板变化时才执行应用模板和刷新完整度的逻辑
- ✅ **数据安全**: 删除旧阶段数据前会先查询新模板，避免数据丢失
- ✅ **自动化**: 前端只需调用修改接口，后端自动处理模板应用和完整度刷新

---

## 六、权限设计

### 6.1 权限标识列表

| 权限标识 | 权限名称 | 说明 |
|---------|---------|------|
| bams:project:list | 查询列表 | 可查看项目列表 |
| bams:project:query | 查询详情 | 可查看项目详细信息 |
| bams:project:add | 新增项目 | 可创建新项目 |
| bams:project:edit | 编辑项目 | 可修改项目信息 |
| bams:project:remove | 删除项目 | 可删除项目（含回收站管理） |
| bams:project:export | 导出数据 | 可导出项目数据 |

### 6.2 角色权限分配

| 角色 | 权限说明 |
|-----|---------|
| 管理员 (Admin) | 拥有所有权限，包括逻辑删除、回收站管理、彻底删除 |
| 档案员 (Archivist) | 可增、改、查项目信息，无删除权限 |
| 查阅员 (Viewer) | 仅可查询项目列表和详情，无增改删权限 |

### 6.3 菜单配置SQL

```sql
-- 项目管理菜单
INSERT INTO sys_menu VALUES
(NULL, '项目管理', 2000, 1, 'project', NULL, '', 1, 0, 'M', '0', '0', '', 'project', 'admin', sysdate(), '', NULL, '项目信息管理');

-- 项目信息子菜单
INSERT INTO sys_menu VALUES
(NULL, '项目信息', 2001, 1, 'info', 'project/info', '', 1, 0, 'C', '0', '0', 'bams:project:list', 'list', 'admin', sysdate(), '', NULL, '项目信息维护');

-- 按钮权限
INSERT INTO sys_menu VALUES
(NULL, '项目查询', 2002, 1, '', '', '', 1, 0, 'F', '0', '0', 'bams:project:query', '#', 'admin', sysdate(), '', NULL, ''),
(NULL, '项目新增', 2003, 2, '', '', '', 1, 0, 'F', '0', '0', 'bams:project:add', '#', 'admin', sysdate(), '', NULL, ''),
(NULL, '项目修改', 2004, 3, '', '', '', 1, 0, 'F', '0', '0', 'bams:project:edit', '#', 'admin', sysdate(), '', NULL, ''),
(NULL, '项目删除', 2005, 4, '', '', '', 1, 0, 'F', '0', '0', 'bams:project:remove', '#', 'admin', sysdate(), '', NULL, ''),
(NULL, '项目导出', 2006, 5, '', '', '', 1, 0, 'F', '0', '0', 'bams:project:export', '#', 'admin', sysdate(), '', NULL, '');
```

---

## 七、性能优化建议

### 7.1 数据库优化

1. **索引优化**
   - 已添加：`project_code` 唯一索引
   - 已添加：`project_name`、`project_status`、`create_time`、`del_flag` 普通索引
   - 建议：定期分析慢查询，根据实际情况添加复合索引

2. **分页优化**
   - 使用 PageHelper 插件实现物理分页
   - 避免大数据量的 `count(*)` 查询

3. **级联查询优化**
   - 项目-阶段数据按需加载
   - 使用 MyBatis 的 `resultMap` 一次性查询关联数据

### 7.2 缓存策略

```java
// 项目详情缓存（5分钟）
@Cacheable(value = "bams:project", key = "#projectId", unless = "#result == null")
public BamsProject selectProjectById(Long projectId) {
    return projectMapper.selectProjectById(projectId);
}

// 缓存失效
@CacheEvict(value = "bams:project", key = "#project.projectId")
public int updateProject(BamsProject project) {
    return projectMapper.updateProject(project);
}
```

### 7.3 完整度计算优化

- **定时任务**: 每天凌晨批量刷新所有项目的完整度
- **增量更新**: 档案新增/删除时，只更新相关项目的完整度
- **缓存结果**: 完整度计算结果缓存15分钟

---

## 八、后续扩展规划

### 8.1 第一期功能 (v1.0)

- ✅ 项目基本信息管理（增删改查）
- ✅ 项目状态管理
- ✅ 阶段模板应用
- ✅ 档案完整度统计
- ✅ GIS坐标录入（手动输入）

### 8.2 第二期功能 (v1.5)

- [ ] **GIS地图集成**:
  - 地图选点功能（高德地图/百度地图）
  - 项目地理分布可视化
  - 按建设状态展示项目（不同颜色图标）

- [ ] **项目看板**:
  - 项目完整度仪表盘
  - 按建设阶段统计档案分布
  - 档案缺失预警

### 8.3 第三期功能 (v2.0)

- [ ] **项目协同管理**:
  - 项目成员管理
  - 项目进度跟踪
  - 项目文档管理

- [ ] **数据分析报表**:
  - 项目统计报表
  - 档案趋势分析
  - 自动生成汇报材料

---

## 九、开发清单

### 9.1 数据库脚本

- [ ] `sql/bams_project.sql` - 建表脚本
- [ ] `sql/bams_project_menu.sql` - 菜单权限配置

### 9.2 后端代码

**Domain层**:
- [ ] `BamsProject.java` - 项目实体类
- [ ] `BamsProjectStage.java` - 项目阶段实体类

**Mapper层**:
- [ ] `BamsProjectMapper.java` - Mapper接口
- [ ] `BamsProjectMapper.xml` - XML映射文件
- [ ] `BamsProjectStageMapper.java` - Mapper接口
- [ ] `BamsProjectStageMapper.xml` - XML映射文件

**Service层**:
- [ ] `IBamsProjectService.java` - Service接口
- [ ] `BamsProjectServiceImpl.java` - Service实现类

**Controller层**:
- [ ] `BamsProjectController.java` - 控制器

### 9.3 前端代码（已完成）

- ✅ `src/pages/Project/ProjectInfo.tsx` - 项目列表页
- ✅ `src/pages/Project/components/ProjectList.tsx` - 项目列表组件
- ✅ `src/pages/Project/components/ProjectForm.tsx` - 项目表单组件
- [ ] `src/services/bams/project.ts` - API服务

### 9.4 测试用例

- [ ] 单元测试：Service层业务逻辑测试
- [ ] 集成测试：接口测试用例
- [ ] 功能测试：前后端联调测试

---

## 十、附录

### A. GIS坐标说明

- **坐标系**: WGS84（GPS坐标系）
- **精度**: 保留6位小数（精确到0.1米）
- **第一期**: 支持手动输入经纬度
- **第二期**: 支持地图选点功能

### B. 项目编号格式

```
XMB001, XMB002, XMB003...

XMB: 固定前缀（项目编码）
001-999: 全局递增流水号（三位数字）

示例: XMB001, XMB002, XMB003
```

---

**文档版本**: v1.0
**最后更新**: 2025-11-17
**维护人**: Rick
