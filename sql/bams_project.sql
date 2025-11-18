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
