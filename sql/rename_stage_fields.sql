-- 重命名项目阶段表字段，使命名更清晰
-- 作者: Claude
-- 日期: 2025-01-19

-- ========== 项目阶段实例表 (bams_project_stage) ==========

-- 1. 重命名主键字段: stage_id → id
ALTER TABLE bams_project_stage CHANGE COLUMN stage_id id BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID';

-- 2. 重命名阶段字段: stage_name → stage_id (存储字典中的阶段ID)
ALTER TABLE bams_project_stage CHANGE COLUMN stage_name stage_id VARCHAR(10) NULL COMMENT '阶段ID（字典键值：0,1,2,3）';

-- 3. stage_display_name 保持不变
-- (已存在，无需修改)

-- ========== 阶段模板详情表 (bams_stage_template_detail) ==========

-- 1. 重命名主键字段: detail_id → id
ALTER TABLE bams_stage_template_detail CHANGE COLUMN detail_id id BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID';

-- 2. 重命名阶段字段: stage_name → stage_id
ALTER TABLE bams_stage_template_detail CHANGE COLUMN stage_name stage_id VARCHAR(10) NULL COMMENT '阶段ID（字典键值：0,1,2,3）';

-- 3. stage_display_name 保持不变
-- (已存在，无需修改)

-- ========== 验证结果 ==========

SELECT 'bams_project_stage 表结构:' AS message;
SHOW COLUMNS FROM bams_project_stage;

SELECT '' AS spacer;
SELECT 'bams_stage_template_detail 表结构:' AS message;
SHOW COLUMNS FROM bams_stage_template_detail;

SELECT '' AS spacer;
SELECT 'bams_project_stage 数据示例:' AS message;
SELECT id, project_id, stage_id AS 阶段ID, stage_display_name AS 阶段名称, stage_order AS 排序
FROM bams_project_stage
LIMIT 5;

SELECT '' AS spacer;
SELECT 'bams_stage_template_detail 数据示例:' AS message;
SELECT id, template_id, stage_id AS 阶段ID, stage_display_name AS 阶段名称, stage_order AS 排序
FROM bams_stage_template_detail
LIMIT 5;

-- 完成
SELECT '字段重命名完成！' AS message;
SELECT 'id = 主键自增ID, stage_id = 阶段字典键值, stage_display_name = 阶段中文名称' AS 说明;
