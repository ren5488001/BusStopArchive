-- 项目阶段模板主表
DROP TABLE IF EXISTS `bams_stage_template`;
CREATE TABLE `bams_stage_template` (
  `template_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `template_desc` varchar(500) DEFAULT NULL COMMENT '模板描述',
  `stage_count` int(11) DEFAULT 0 COMMENT '阶段总数',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='项目阶段模板表';

-- 项目阶段模板明细表
DROP TABLE IF EXISTS `bams_stage_template_detail`;
CREATE TABLE `bams_stage_template_detail` (
  `detail_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  `template_id` bigint(20) NOT NULL COMMENT '模板ID',
  `stage_name` varchar(100) NOT NULL COMMENT '阶段名称',
  `stage_order` int(11) NOT NULL COMMENT '阶段顺序',
  `required_files` varchar(1000) DEFAULT NULL COMMENT '标准文件配置（逗号分隔的dict_value）',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`detail_id`),
  KEY `idx_template_id` (`template_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='项目阶段模板明细表';

-- 添加外键约束
ALTER TABLE `bams_stage_template_detail`
  ADD CONSTRAINT `fk_template_detail`
  FOREIGN KEY (`template_id`)
  REFERENCES `bams_stage_template` (`template_id`)
  ON DELETE CASCADE;

-- 插入测试数据
INSERT INTO `bams_stage_template` VALUES
(1, '标准工程项目模板', '适用于一般工程建设项目', 4, '0', '0', 'admin', sysdate(), '', NULL, '包含立项、设计、招标、施工四个阶段');

INSERT INTO `bams_stage_template_detail` VALUES
(1, 1, '立项阶段', 1, '0,1', sysdate(), NULL),
(2, 1, '设计阶段', 2, '2', sysdate(), NULL),
(3, 1, '招标阶段', 3, '0,1,2', sysdate(), NULL),
(4, 1, '施工阶段', 4, '0,1,2', sysdate(), NULL);
