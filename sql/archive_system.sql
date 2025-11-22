-- ====================================================
-- 档案管理系统 - 数据库建表脚本
-- 版本: V2.0.1
-- 日期: 2025-11-19
-- 说明: 包含 4 张核心表及初始数据
-- 变更: 简化表结构，移除分类/密级/保管期限，恢复元数据审计
-- ====================================================

USE `ry-vue`;

-- ====================================================
-- 表 1: bams_archive - 档案主表
-- ====================================================
DROP TABLE IF EXISTS `bams_archive`;
CREATE TABLE `bams_archive` (
  `archive_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '档案主键ID',
  `archive_number` VARCHAR(100) NOT NULL COMMENT '档案编号（自动生成，如 PRJ001-0001）',
  `title` VARCHAR(500) NOT NULL COMMENT '档案题名',

  -- 项目关联
  `project_id` BIGINT NOT NULL COMMENT '所属项目ID（关联 bams_project.project_id）',
  `project_code` VARCHAR(50) NOT NULL COMMENT '项目编号（冗余字段）',
  `project_name` VARCHAR(200) DEFAULT NULL COMMENT '项目名称（冗余字段）',
  `stage` VARCHAR(50) NOT NULL COMMENT '建设阶段（枚举：立项/设计/施工/验收）',

  -- 时间字段
  `file_date` DATE DEFAULT NULL COMMENT '文件形成日期',
  `archival_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '归档日期（系统自动记录）',

  -- 档案属性
  `file_type` VARCHAR(20) DEFAULT 'PDF' COMMENT '文件类型（固定为 PDF）',
  `file_size` BIGINT DEFAULT NULL COMMENT '当前版本文件大小（字节）',

  -- 内容描述
  `description` TEXT DEFAULT NULL COMMENT '档案描述（人工填写）',
  `tags` JSON DEFAULT NULL COMMENT '标签数组（JSON 格式：["标签1", "标签2"]）',
  `summary` TEXT DEFAULT NULL COMMENT 'AI 生成的摘要（待对接 AI 服务）',

  -- 版本控制
  `current_version` VARCHAR(20) DEFAULT 'V1.0' COMMENT '当前版本号',
  `version_count` INT DEFAULT 1 COMMENT '总版本数',

  -- 状态控制
  `status` CHAR(1) DEFAULT '0' COMMENT '状态（0=正常, 1=草稿）',
  `del_flag` CHAR(1) DEFAULT '0' COMMENT '删除标志（0=存在, 1=逻辑删除）',

  -- 审计字段（继承 BaseEntity）
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人用户名',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` VARCHAR(64) DEFAULT NULL COMMENT '最后更新人',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',

  PRIMARY KEY (`archive_id`),
  UNIQUE KEY `uk_archive_number` (`archive_number`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_project_code` (`project_code`),
  KEY `idx_stage` (`stage`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='档案主表';

-- ====================================================
-- 表 2: bams_archive_version - 档案版本表
-- ====================================================
DROP TABLE IF EXISTS `bams_archive_version`;
CREATE TABLE `bams_archive_version` (
  `version_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '版本主键ID',
  `archive_id` BIGINT NOT NULL COMMENT '档案ID（应用层维护关联）',
  `version_number` VARCHAR(20) NOT NULL COMMENT '版本号（V1.0, V2.0, V3.0...）',

  -- 文件信息
  `file_name` VARCHAR(255) NOT NULL COMMENT '原始文件名（带扩展名）',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件存储路径（相对路径或 URL）',
  `file_type` VARCHAR(20) DEFAULT 'PDF' COMMENT '文件类型（固定为 PDF）',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  `file_hash` VARCHAR(64) DEFAULT NULL COMMENT '文件 SHA-256 哈希值（用于去重）',
  `is_current` CHAR(1) DEFAULT '0' COMMENT '是否当前版本（0=否, 1=是）',

  -- 版本说明
  `version_remark` VARCHAR(500) DEFAULT NULL COMMENT '版本更新说明（由用户填写）',

  -- 审计字段
  `upload_by` VARCHAR(64) DEFAULT NULL COMMENT '上传人用户名',
  `upload_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',

  PRIMARY KEY (`version_id`),
  UNIQUE KEY `uk_archive_version` (`archive_id`, `version_number`),
  KEY `idx_archive_id` (`archive_id`),
  KEY `idx_is_current` (`is_current`),
  KEY `idx_file_hash` (`file_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='档案版本表';

-- ====================================================
-- 表 3: bams_archive_audit_log - 审计日志表
-- ====================================================
DROP TABLE IF EXISTS `bams_archive_audit_log`;
CREATE TABLE `bams_archive_audit_log` (
  `log_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志主键ID',
  `archive_id` BIGINT DEFAULT NULL COMMENT '档案ID（可为 NULL，如查询操作）',
  `version_id` BIGINT DEFAULT NULL COMMENT '版本ID（可为 NULL）',
  `archive_number` VARCHAR(100) DEFAULT NULL COMMENT '档案编号（冗余，便于查询）',

  -- 操作信息
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型（CREATE/UPDATE/DELETE/RESTORE/PERMANENT_DELETE/VERSION_UPLOAD/DOWNLOAD/VIEW/EXPORT）',
  `operation_module` VARCHAR(50) DEFAULT NULL COMMENT '操作模块（metadata/file/version）',
  `operation_desc` VARCHAR(500) DEFAULT NULL COMMENT '操作描述',

  -- 变更详情
  `field_name` VARCHAR(100) DEFAULT NULL COMMENT '修改的字段名（如 title, description）',
  `old_value` TEXT DEFAULT NULL COMMENT '修改前的值',
  `new_value` TEXT DEFAULT NULL COMMENT '修改后的值',
  `change_detail` JSON DEFAULT NULL COMMENT '完整变更详情（JSON 格式）',

  -- 操作人信息
  `operator` VARCHAR(64) NOT NULL COMMENT '操作人用户名',
  `operation_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `ip_address` VARCHAR(128) DEFAULT NULL COMMENT '操作 IP 地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '浏览器 User-Agent',

  PRIMARY KEY (`log_id`),
  KEY `idx_archive_id` (`archive_id`),
  KEY `idx_operation_type` (`operation_type`),
  KEY `idx_operator` (`operator`),
  KEY `idx_operation_time` (`operation_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';

-- ====================================================
-- 表 4: bams_tag_dictionary - 标签字典表
-- ====================================================
DROP TABLE IF EXISTS `bams_tag_dictionary`;
CREATE TABLE `bams_tag_dictionary` (
  `tag_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '标签主键ID',
  `tag_name` VARCHAR(50) NOT NULL COMMENT '标签名称（唯一）',
  `usage_count` INT DEFAULT 0 COMMENT '使用次数（每次关联 +1）',
  `status` CHAR(1) DEFAULT '0' COMMENT '状态（0=正常, 1=停用）',

  -- 审计字段
  `create_by` VARCHAR(64) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `uk_tag_name` (`tag_name`),
  KEY `idx_usage_count` (`usage_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签字典表';

-- ====================================================
-- 初始数据
-- ====================================================

-- 标签字典初始数据
INSERT INTO `bams_tag_dictionary` (`tag_name`, `create_by`) VALUES
('施工图纸', 'admin'),
('设计方案', 'admin'),
('验收报告', 'admin'),
('质量检测', 'admin'),
('安全资料', 'admin'),
('钢结构', 'admin'),
('混凝土', 'admin'),
('合同协议', 'admin'),
('技术文档', 'admin'),
('竣工资料', 'admin');

-- ====================================================
-- 菜单权限数据（使用动态 menu_id）
-- ====================================================

-- 删除旧的档案管理菜单（如果存在）
DELETE FROM sys_menu WHERE menu_name = '档案管理' AND parent_id = 0;
DELETE FROM sys_menu WHERE parent_id IN (SELECT menu_id FROM (SELECT menu_id FROM sys_menu WHERE menu_name = '档案管理') AS temp);

-- 档案管理主菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES ('档案管理', 0, 5, 'archive', NULL, 1, 0, 'M', '0', '0', NULL, 'documentation', 'admin', NOW(), '档案管理目录');

SET @archive_menu_id = LAST_INSERT_ID();

-- 档案检索菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES ('档案检索', @archive_menu_id, 1, 'search', 'archive/ArchiveSearch/index', 1, 0, 'C', '0', '0', 'archive:search:query', 'search', 'admin', NOW(), '档案检索菜单');

SET @search_menu_id = LAST_INSERT_ID();

-- 档案著录菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES ('档案著录', @archive_menu_id, 2, 'entry', 'archive/ArchiveEntry/index', 1, 0, 'C', '0', '0', 'archive:entry:add', 'edit', 'admin', NOW(), '档案著录菜单');

SET @entry_menu_id = LAST_INSERT_ID();

-- 标签管理菜单
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`, `remark`)
VALUES ('标签管理', @archive_menu_id, 3, 'tags', 'archive/ArchiveTags/index', 1, 0, 'C', '0', '0', 'archive:tags:query', 'tags', 'admin', NOW(), '标签管理菜单');

SET @tags_menu_id = LAST_INSERT_ID();

-- 档案检索权限按钮
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`) VALUES
('档案查询', @search_menu_id, 1, '#', '', 1, 0, 'F', '0', '0', 'archive:search:query', '#', 'admin', NOW()),
('档案详情', @search_menu_id, 2, '#', '', 1, 0, 'F', '0', '0', 'archive:search:detail', '#', 'admin', NOW()),
('档案编辑', @search_menu_id, 3, '#', '', 1, 0, 'F', '0', '0', 'archive:search:edit', '#', 'admin', NOW()),
('档案下载', @search_menu_id, 4, '#', '', 1, 0, 'F', '0', '0', 'archive:search:download', '#', 'admin', NOW()),
('档案删除', @search_menu_id, 5, '#', '', 1, 0, 'F', '0', '0', 'archive:search:remove', '#', 'admin', NOW()),
('档案恢复', @search_menu_id, 6, '#', '', 1, 0, 'F', '0', '0', 'archive:search:restore', '#', 'admin', NOW()),
('档案导出', @search_menu_id, 7, '#', '', 1, 0, 'F', '0', '0', 'archive:search:export', '#', 'admin', NOW());

-- 档案著录权限按钮
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`) VALUES
('档案新增', @entry_menu_id, 1, '#', '', 1, 0, 'F', '0', '0', 'archive:entry:add', '#', 'admin', NOW()),
('文件上传', @entry_menu_id, 2, '#', '', 1, 0, 'F', '0', '0', 'archive:entry:upload', '#', 'admin', NOW());

-- 标签管理权限按钮
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `order_num`, `path`, `component`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_by`, `create_time`) VALUES
('标签查询', @tags_menu_id, 1, '#', '', 1, 0, 'F', '0', '0', 'archive:tags:query', '#', 'admin', NOW()),
('标签新增', @tags_menu_id, 2, '#', '', 1, 0, 'F', '0', '0', 'archive:tags:add', '#', 'admin', NOW()),
('标签修改', @tags_menu_id, 3, '#', '', 1, 0, 'F', '0', '0', 'archive:tags:edit', '#', 'admin', NOW()),
('标签删除', @tags_menu_id, 4, '#', '', 1, 0, 'F', '0', '0', 'archive:tags:remove', '#', 'admin', NOW());

-- ====================================================
-- 完成
-- ====================================================
SELECT '档案管理系统数据库初始化完成！(V2.0.1)' AS Result;
SELECT '已创建表：bams_archive, bams_archive_version, bams_archive_audit_log, bams_tag_dictionary' AS Info;
